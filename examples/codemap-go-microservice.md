# Codemap: Go Microservice

> Stack: Go 1.22, gRPC + REST, PostgreSQL, NATS, OpenTelemetry

## Package Structure

```
cmd/
  server/
    main.go              # Entry point, dependency wiring
internal/
  handler/
    grpc/
      order_handler.go   # gRPC service implementation
      interceptors.go    # Auth, logging interceptors
    http/
      order_handler.go   # REST endpoints
      middleware.go       # HTTP middleware chain
  service/
    order_service.go     # Business logic
    order_service_test.go
  repository/
    order_repo.go        # Database queries
    order_repo_test.go
  domain/
    order.go             # Domain types and interfaces
    events.go            # Domain events
  config/
    config.go            # Configuration loading
  messaging/
    publisher.go         # NATS event publisher
    subscriber.go        # NATS event consumer
pkg/
  middleware/
    auth.go              # JWT verification
    logging.go           # Request logging
    recovery.go          # Panic recovery
  telemetry/
    tracing.go           # OpenTelemetry setup
    metrics.go           # Prometheus metrics
proto/
  order/
    order.proto          # gRPC service definition
    order.pb.go          # Generated code
    order_grpc.pb.go     # Generated gRPC code
migrations/
  001_create_orders.up.sql
  001_create_orders.down.sql
```

## Layer Architecture

```
┌─────────────────────────────────────────┐
│ Transport (gRPC handlers, HTTP handlers)│  ← Request parsing, response formatting
├─────────────────────────────────────────┤
│ Service (business logic)                │  ← Domain rules, orchestration
├─────────────────────────────────────────┤
│ Repository (data access)                │  ← SQL queries, caching
├─────────────────────────────────────────┤
│ Database (PostgreSQL)                   │  ← Persistence
└─────────────────────────────────────────┘

Rules:
- Handlers depend on Services (never on Repositories)
- Services depend on Repository interfaces (defined in domain/)
- Repositories implement domain interfaces
- Domain has zero external dependencies
```

## gRPC Endpoints

| Service | Method | Purpose |
|---------|--------|---------|
| OrderService | CreateOrder | Place a new order |
| OrderService | GetOrder | Get order by ID |
| OrderService | ListOrders | List orders with filters |
| OrderService | CancelOrder | Cancel a pending order |

## REST Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/v1/orders` | Create order |
| GET | `/api/v1/orders/:id` | Get order |
| GET | `/api/v1/orders` | List orders |
| DELETE | `/api/v1/orders/:id` | Cancel order |
| GET | `/healthz` | Health check |
| GET | `/readyz` | Readiness check |
| GET | `/metrics` | Prometheus metrics |

## Middleware Chain

### gRPC Interceptors
```
Request → Recovery → Logging → Auth → Tracing → Handler
```

### HTTP Middleware
```
Request → Recovery → RequestID → CORS → Logging → Auth → Tracing → Handler
```

## Configuration

```go
type Config struct {
    Server   ServerConfig   `yaml:"server"`
    Database DatabaseConfig `yaml:"database"`
    NATS     NATSConfig     `yaml:"nats"`
    Auth     AuthConfig     `yaml:"auth"`
}

// Loading order: defaults → config.yaml → env vars → flags
```

## Domain Events

| Event | Published When | Consumers |
|-------|---------------|-----------|
| `OrderCreated` | New order placed | Notification, Analytics |
| `OrderCancelled` | Order cancelled | Notification, Inventory |
| `OrderShipped` | Order shipped | Notification |

## Order State Machine

```
[Created] → [Confirmed] → [Shipped] → [Delivered]
    │            │
    └→ [Cancelled] ←┘
```

| From | To | Trigger |
|------|----|---------|
| Created | Confirmed | Payment received |
| Created | Cancelled | User request / timeout |
| Confirmed | Shipped | Fulfillment complete |
| Confirmed | Cancelled | Admin action |
| Shipped | Delivered | Delivery confirmation |

## Testing Strategy

```
internal/service/*_test.go      → Unit tests with mocked repos
internal/repository/*_test.go   → Integration tests with test DB
internal/handler/http/*_test.go → HTTP handler tests with httptest
internal/handler/grpc/*_test.go → gRPC tests with bufconn
```

## Makefile Targets

```
make build        # Build binary
make test         # Run all tests
make test-race    # Run with race detector
make lint         # Run golangci-lint
make proto        # Generate protobuf code
make migrate-up   # Apply migrations
make migrate-down # Rollback migrations
make docker       # Build Docker image
```
