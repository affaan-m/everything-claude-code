---
name: grpc-patterns
description: gRPC protocol specifics - proto file design, streaming RPCs, interceptors, health checks, load balancing, and testing patterns
---

# gRPC Patterns

## When to Activate

- Designing or reviewing `.proto` files and service definitions
- Implementing unary, server-streaming, client-streaming, or bidirectional RPC
- Adding authentication, logging, or metrics via interceptors
- Setting up health checks, reflection, or gRPC tooling (grpcurl, buf)
- Configuring load balancing or keepalive for gRPC connections
- Writing tests for gRPC services using bufconn or mock transports

## Core Principles

1. Proto-first design: define the contract before writing any implementation
2. Use semantic versioning via package namespaces (`order.v1`, `payment.v2`)
3. Never reuse or remove field numbers - only add new ones or `reserved` old ones
4. Prefer structured errors using `google.rpc.Status` with rich error details
5. Always implement health checks for production deployments

---

## Proto File Design

```protobuf
syntax = "proto3";
package order.v1;

option go_package = "github.com/example/api/order/v1;orderv1";

import "google/protobuf/timestamp.proto";
import "google/protobuf/field_mask.proto";

service OrderService {
  rpc CreateOrder(CreateOrderRequest) returns (CreateOrderResponse);
  rpc ListOrders(ListOrdersRequest) returns (ListOrdersResponse);
  rpc WatchOrders(WatchOrdersRequest) returns (stream OrderEvent);
  rpc BatchCreateOrders(stream CreateOrderRequest) returns (BatchCreateOrdersResponse);
  rpc SyncOrders(stream SyncOrdersRequest) returns (stream SyncOrdersResponse);
}

message CreateOrderRequest {
  string customer_id = 1;
  repeated OrderItem items = 2;
  string idempotency_key = 3;
}

message Order {
  string id = 1;
  string customer_id = 2;
  repeated OrderItem items = 3;
  OrderStatus status = 4;
  google.protobuf.Timestamp created_at = 5;
  reserved 6, 7;                           // never reuse numbers
  reserved "legacy_total", "old_currency"; // never reuse names
}

message OrderItem {
  string product_id = 1;
  int32 quantity = 2;
  int64 unit_price_cents = 3;
}

enum OrderStatus {
  ORDER_STATUS_UNSPECIFIED = 0;  // always first, value 0
  ORDER_STATUS_PENDING = 1;
  ORDER_STATUS_CONFIRMED = 2;
  ORDER_STATUS_CANCELLED = 3;
}
```

**Schema evolution:** never reuse a field number; new fields default to zero values (backward compatible); use `optional` in proto3 to distinguish unset from zero.

---

## Code Generation (buf)

```yaml
# buf.gen.yaml
version: v1
plugins:
  - plugin: buf.build/protocolbuffers/go
    out: gen/go
    opt: [paths=source_relative]
  - plugin: buf.build/grpc/go
    out: gen/go
    opt: [paths=source_relative]
  - plugin: buf.build/bufbuild/es       # TS types
    out: gen/ts
    opt: [target=ts]
  - plugin: buf.build/bufbuild/connect-es  # Connect-ES
    out: gen/ts
    opt: [target=ts]
  - plugin: buf.build/protocolbuffers/python
    out: gen/python
  - plugin: buf.build/grpc/python
    out: gen/python
```
```bash
buf lint && buf generate
```

---

## Unary RPC

### Go Server

```go
type OrderServer struct {
    orderv1.UnimplementedOrderServiceServer  // required for forward compatibility
    repo OrderRepository
}

func (s *OrderServer) CreateOrder(
    ctx context.Context, req *orderv1.CreateOrderRequest,
) (*orderv1.CreateOrderResponse, error) {
    if req.CustomerId == "" {
        return nil, status.Error(codes.InvalidArgument, "customer_id is required")
    }
    order, err := s.repo.Create(ctx, req)
    if err != nil {
        return nil, status.Errorf(codes.Internal, "create order: %v", err)
    }
    return &orderv1.CreateOrderResponse{Order: order}, nil
}
```

### TypeScript Client (Connect-ES)

```typescript
import { createClient } from "@connectrpc/connect";
import { createGrpcTransport } from "@connectrpc/connect-node";
import { OrderService } from "./gen/ts/order/v1/order_connect";

const client = createClient(OrderService,
  createGrpcTransport({ baseUrl: "https://api.example.com", httpVersion: "2" }));

const resp = await client.createOrder({
  customerId: "cust-123",
  items: [{ productId: "prod-1", quantity: 2, unitPriceCents: 1000n }],
  idempotencyKey: crypto.randomUUID(),
});
```

---

## Streaming RPCs

### Server Streaming (Go + TypeScript)

```go
// Go server
func (s *OrderServer) WatchOrders(
    req *orderv1.WatchOrdersRequest,
    stream orderv1.OrderService_WatchOrdersServer,
) error {
    ctx := stream.Context()
    events := s.bus.Subscribe(req.CustomerId)
    defer s.bus.Unsubscribe(events)
    for {
        select {
        case <-ctx.Done():
            return ctx.Err()
        case evt, ok := <-events:
            if !ok {
                return nil
            }
            if err := stream.Send(evt); err != nil {
                return err
            }
        }
    }
}
```

```typescript
// TypeScript client
for await (const event of client.watchOrders({ customerId: "cust-123" })) {
  console.log("event:", event.type, event.order?.id);
}
```

### Client Streaming (Go)

```go
func (s *OrderServer) BatchCreateOrders(
    stream orderv1.OrderService_BatchCreateOrdersServer,
) error {
    var count int32
    for {
        req, err := stream.Recv()
        if err == io.EOF {
            return stream.SendAndClose(&orderv1.BatchCreateOrdersResponse{CreatedCount: count})
        }
        if err != nil {
            return status.Errorf(codes.Internal, "recv: %v", err)
        }
        if _, err := s.repo.Create(stream.Context(), req); err != nil {
            return status.Errorf(codes.Internal, "create: %v", err)
        }
        count++
    }
}
```

### Bidirectional Streaming (Go)

```go
func (s *OrderServer) SyncOrders(
    stream orderv1.OrderService_SyncOrdersServer,
) error {
    for {
        req, err := stream.Recv()
        if err == io.EOF {
            return nil
        }
        if err != nil {
            return err
        }
        resp, err := s.handleSync(stream.Context(), req)
        if err != nil {
            return err
        }
        if err := stream.Send(resp); err != nil {
            return err
        }
    }
}
```

---

## Interceptors

### Go Interceptor Chain

```go
func authInterceptor(ctx context.Context, req interface{},
    _ *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
    md, _ := metadata.FromIncomingContext(ctx)
    if len(md.Get("authorization")) == 0 {
        return nil, status.Error(codes.Unauthenticated, "missing token")
    }
    userID, err := validateToken(md.Get("authorization")[0])
    if err != nil {
        return nil, status.Error(codes.Unauthenticated, "invalid token")
    }
    return handler(context.WithValue(ctx, ctxKeyUser, userID), req)
}

func loggingInterceptor(ctx context.Context, req interface{},
    info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
    start := time.Now()
    resp, err := handler(ctx, req)
    log.Printf("method=%s latency=%s err=%v", info.FullMethod, time.Since(start), err)
    return resp, err
}

grpc.NewServer(
    grpc.ChainUnaryInterceptor(authInterceptor, loggingInterceptor, otelgrpc.UnaryServerInterceptor()),
    grpc.ChainStreamInterceptor(otelgrpc.StreamServerInterceptor()),
)
```

### TypeScript Interceptor (Connect-ES)

```typescript
const authInterceptor: Interceptor = (next) => async (req) => {
  req.header.set("authorization", `Bearer ${getToken()}`);
  return next(req);
};

createGrpcTransport({
  baseUrl: "https://api.example.com",
  httpVersion: "2",
  interceptors: [authInterceptor],
});
```

---

## Error Handling

### Status Code Reference

| gRPC Code | HTTP | Use Case |
|---|---|---|
| `OK` | 200 | Success |
| `INVALID_ARGUMENT` | 400 | Bad client input |
| `NOT_FOUND` | 404 | Resource missing |
| `ALREADY_EXISTS` | 409 | Duplicate |
| `PERMISSION_DENIED` | 403 | Authorized but forbidden |
| `UNAUTHENTICATED` | 401 | Missing/invalid credentials |
| `RESOURCE_EXHAUSTED` | 429 | Rate limited |
| `INTERNAL` | 500 | Server bug |
| `UNAVAILABLE` | 503 | Overloaded/down |
| `DEADLINE_EXCEEDED` | 504 | Timeout |

### Rich Error Details (Go)

```go
import errdetailspb "google.golang.org/genproto/googleapis/rpc/errdetails"

func validationError(field, msg string) error {
    st := status.New(codes.InvalidArgument, "validation failed")
    st, _ = st.WithDetails(&errdetailspb.BadRequest{
        FieldViolations: []*errdetailspb.BadRequest_FieldViolation{
            {Field: field, Description: msg},
        },
    })
    return st.Err()
}
```

---

## Health Checking and Reflection

### Health Check Server (Go)

```go
import healthpb "google.golang.org/grpc/health/grpc_health_v1"

hs := health.NewServer()
healthpb.RegisterHealthServer(grpcServer, hs)
hs.SetServingStatus("order.v1.OrderService", healthpb.HealthCheckResponse_SERVING)
defer hs.SetServingStatus("order.v1.OrderService", healthpb.HealthCheckResponse_NOT_SERVING) // graceful shutdown
```

### Kubernetes Probes (grpc-health-probe)

```yaml
livenessProbe:
  exec: { command: ["/bin/grpc_health_probe", "-addr=:50051"] }
  initialDelaySeconds: 5
readinessProbe:
  exec: { command: ["/bin/grpc_health_probe", "-addr=:50051", "-service=order.v1.OrderService"] }
  initialDelaySeconds: 5
```

### gRPC Reflection (dev/staging only)

```go
if cfg.EnableReflection { reflection.Register(grpcServer) }
```

```bash
grpcurl -plaintext localhost:50051 list
grpcurl -plaintext -d '{"customer_id":"cust-1"}' localhost:50051 order.v1.OrderService/ListOrders
```

---

## Load Balancing and Keepalive

### Client-Side Round Robin + Keepalive (Go)

```go
conn, _ := grpc.NewClient(
    "dns:///orders.internal:50051",
    grpc.WithDefaultServiceConfig(`{"loadBalancingPolicy":"round_robin"}`),
    grpc.WithKeepaliveParams(keepalive.ClientParameters{
        Time: 10 * time.Second, Timeout: 3 * time.Second, PermitWithoutStream: true,
    }),
    grpc.WithTransportCredentials(creds),
)
```

### Server Keepalive

```go
grpc.NewServer(
    grpc.KeepaliveParams(keepalive.ServerParameters{
        MaxConnectionIdle: 15 * time.Minute, Time: 5 * time.Second, Timeout: 1 * time.Second,
    }),
    grpc.KeepaliveEnforcementPolicy(keepalive.EnforcementPolicy{
        MinTime: 5 * time.Second, PermitWithoutStream: true,
    }),
)
```

### Envoy Proxy (proxy-based LB)

```yaml
clusters:
  - name: order_service
    type: STRICT_DNS
    lb_policy: ROUND_ROBIN
    http2_protocol_options: {}
    load_assignment:
      cluster_name: order_service
      endpoints:
        - lb_endpoints:
            - endpoint:
                address: { socket_address: { address: order-service, port_value: 50051 } }
```

---

## Testing

### Go: bufconn In-Process Testing

```go
func startTestServer(t *testing.T) orderv1.OrderServiceClient {
    t.Helper()
    lis := bufconn.Listen(1024 * 1024)
    srv := grpc.NewServer()
    orderv1.RegisterOrderServiceServer(srv, &OrderServer{repo: NewInMemoryRepo()})
    go srv.Serve(lis)
    t.Cleanup(srv.GracefulStop)

    conn, err := grpc.NewClient("passthrough:///bufnet",
        grpc.WithContextDialer(func(ctx context.Context, _ string) (net.Conn, error) {
            return lis.DialContext(ctx)
        }),
        grpc.WithTransportCredentials(insecure.NewCredentials()),
    )
    if err != nil { t.Fatal(err) }
    t.Cleanup(func() { conn.Close() })
    return orderv1.NewOrderServiceClient(conn)
}

func TestCreateOrder(t *testing.T) {
    client := startTestServer(t)
    resp, err := client.CreateOrder(context.Background(), &orderv1.CreateOrderRequest{
        CustomerId: "cust-1",
        Items: []*orderv1.OrderItem{{ProductId: "prod-1", Quantity: 1, UnitPriceCents: 500}},
    })
    if err != nil { t.Fatalf("unexpected error: %v", err) }
    if resp.Order == nil { t.Fatal("expected order in response") }
}
```

### TypeScript: Mock Transport

```typescript
import { createRouterTransport } from "@connectrpc/connect";

const mockTransport = createRouterTransport(({ service }) => {
  service(OrderService, {
    createOrder: (req) => ({
      order: { id: "order-1", customerId: req.customerId },
    }),
  });
});

it("creates an order", async () => {
  const client = createClient(OrderService, mockTransport);
  const resp = await client.createOrder({ customerId: "cust-1", items: [] });
  expect(resp.order?.id).toBe("order-1");
});
```

---

## Checklist

### Proto Design
- [ ] Versioned package namespace (`order.v1`), `go_package` set
- [ ] Enums have `_UNSPECIFIED = 0`; removed fields use `reserved`
- [ ] `google.protobuf.Timestamp` for times; pagination uses `page_token`

### Implementation and Observability
- [ ] Server embeds `Unimplemented*Server` for forward compatibility
- [ ] Stream handlers check `ctx.Done()` and handle `io.EOF`
- [ ] All errors return gRPC status codes; interceptors handle auth/logging/metrics
- [ ] Health check registered; reflection disabled in production

### Operations and Testing
- [ ] Keepalive and load balancing policy configured
- [ ] Go tests use `bufconn`; TS tests use mock transport
- [ ] Error and streaming cancellation paths tested
