---
name: microservices-patterns
description: Microservices architecture patterns — service decomposition, saga orchestration, CQRS, event sourcing, API gateway, service mesh, contract testing, and distributed tracing.
---

# Microservices Architecture Patterns

Production-grade microservices patterns for designing, building, and operating distributed systems.

## When to Activate

- Decomposing a monolith into microservices
- Designing inter-service communication (sync vs async)
- Implementing saga patterns for distributed transactions
- Setting up CQRS or event sourcing
- Configuring API gateways and service discovery
- Writing consumer-driven contract tests
- Adding distributed tracing and correlation IDs
- Evaluating service mesh adoption

## Core Principles

1. **Bounded context alignment** — each service owns a single business domain
2. **Smart endpoints, dumb pipes** — logic lives in services, not middleware
3. **Decentralized data** — each service owns its database; no shared DB
4. **Design for failure** — expect network partitions, timeouts, and cascading failures
5. **Evolutionary design** — start with a modular monolith; extract services when justified

## Service Decomposition

### Bounded Context Mapping

```
E-commerce System

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Order Context   │  │ Product Context  │  │ Payment Context  │
│                  │  │                  │  │                  │
│ - Order          │  │ - Product        │  │ - Payment        │
│ - OrderItem      │  │ - Category       │  │ - Refund         │
│ - OrderStatus    │  │ - Inventory      │  │ - Invoice        │
│                  │  │ - Price          │  │                  │
│ Owns: orders DB  │  │ Owns: catalog DB │  │ Owns: payments DB│
└───────┬─────────┘  └────────┬────────┘  └────────┬────────┘
        │                     │                     │
        └─────────── Events (async) ────────────────┘
```

### Strangler Fig Migration

```typescript
// Step 1: Route new requests through proxy
// gateway/src/routes.ts
import express from "express";
const app = express();

app.use("/api/v2/orders", (req, res) => {
  // New microservice handles v2
  proxy.web(req, res, { target: "http://order-service:3001" });
});

app.use("/api/v1/orders", (req, res) => {
  // Legacy monolith still handles v1
  proxy.web(req, res, { target: "http://monolith:8080" });
});

// Step 2: Migrate consumers from v1 → v2 gradually
// Step 3: Decommission monolith endpoint when traffic is zero
```

## Communication Patterns

### Sync vs Async Decision

```
Use synchronous (HTTP/gRPC) when:    Use asynchronous (events) when:
─────────────────────────────────    ──────────────────────────────
✓ Client needs immediate response    ✓ Fire-and-forget notifications
✓ Simple request/response            ✓ Long-running processes
✓ Low latency required               ✓ Multiple consumers need the data
✗ Creates temporal coupling          ✓ Loose coupling required
                                     ✓ Eventual consistency acceptable
```

### API Gateway Pattern

```typescript
// gateway/src/gateway.ts
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();

// Rate limiting per service
import rateLimit from "express-rate-limit";
const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 100 });
app.use("/api/", apiLimiter);

// Route to services
app.use("/api/orders", createProxyMiddleware({
  target: "http://order-service:3001",
  pathRewrite: { "^/api/orders": "" },
}));

app.use("/api/products", createProxyMiddleware({
  target: "http://product-service:3002",
  pathRewrite: { "^/api/products": "" },
}));

app.use("/api/payments", createProxyMiddleware({
  target: "http://payment-service:3003",
  pathRewrite: { "^/api/payments": "" },
}));

// BFF: Aggregate responses for frontend
app.get("/api/dashboard", async (req, res) => {
  const [orders, revenue, topProducts] = await Promise.all([
    fetch("http://order-service:3001/recent").then(r => r.json()),
    fetch("http://payment-service:3003/revenue").then(r => r.json()),
    fetch("http://product-service:3002/top").then(r => r.json()),
  ]);
  res.json({ orders, revenue, topProducts });
});
```

## Saga Pattern

### Orchestration (Saga Coordinator)

```typescript
// order-service/src/sagas/create-order.saga.ts

interface SagaStep<T> {
  name: string;
  execute: (ctx: T) => Promise<void>;
  compensate: (ctx: T) => Promise<void>;
}

class SagaOrchestrator<T> {
  private steps: SagaStep<T>[] = [];
  private completedSteps: SagaStep<T>[] = [];

  addStep(step: SagaStep<T>): this {
    this.steps.push(step);
    return this;
  }

  async execute(context: T): Promise<void> {
    for (const step of this.steps) {
      try {
        await step.execute(context);
        this.completedSteps.push(step);
      } catch (error) {
        console.error(`Saga step "${step.name}" failed:`, error);
        await this.compensate(context);
        throw error;
      }
    }
  }

  private async compensate(context: T): Promise<void> {
    for (const step of [...this.completedSteps].reverse()) {
      try {
        await step.compensate(context);
      } catch (err) {
        console.error(`Compensation "${step.name}" failed:`, err);
        // Log for manual intervention
      }
    }
  }
}

// Usage
interface OrderContext {
  orderId: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  paymentId?: string;
  inventoryReservationId?: string;
}

const createOrderSaga = new SagaOrchestrator<OrderContext>()
  .addStep({
    name: "reserve-inventory",
    execute: async (ctx) => {
      const res = await inventoryClient.reserve(ctx.items);
      ctx.inventoryReservationId = res.reservationId;
    },
    compensate: async (ctx) => {
      if (ctx.inventoryReservationId) {
        await inventoryClient.cancelReservation(ctx.inventoryReservationId);
      }
    },
  })
  .addStep({
    name: "process-payment",
    execute: async (ctx) => {
      const res = await paymentClient.charge(ctx.userId, ctx.totalAmount);
      ctx.paymentId = res.paymentId;
    },
    compensate: async (ctx) => {
      if (ctx.paymentId) {
        await paymentClient.refund(ctx.paymentId);
      }
    },
  })
  .addStep({
    name: "confirm-order",
    execute: async (ctx) => {
      await orderRepo.updateStatus(ctx.orderId, "confirmed");
      await eventBus.publish("order.confirmed", { orderId: ctx.orderId });
    },
    compensate: async (ctx) => {
      await orderRepo.updateStatus(ctx.orderId, "cancelled");
    },
  });
```

### Choreography (Event-Driven)

```typescript
// Each service reacts to events independently

// order-service: publishes OrderCreated
await eventBus.publish("order.created", { orderId, userId, items, totalAmount });

// inventory-service: listens for OrderCreated, publishes InventoryReserved or InventoryFailed
eventBus.subscribe("order.created", async (event) => {
  try {
    await reserveInventory(event.items);
    await eventBus.publish("inventory.reserved", { orderId: event.orderId });
  } catch {
    await eventBus.publish("inventory.failed", { orderId: event.orderId });
  }
});

// payment-service: listens for InventoryReserved
eventBus.subscribe("inventory.reserved", async (event) => {
  try {
    await chargePayment(event.orderId);
    await eventBus.publish("payment.completed", { orderId: event.orderId });
  } catch {
    await eventBus.publish("payment.failed", { orderId: event.orderId });
  }
});

// order-service: listens for final events to update status
eventBus.subscribe("payment.completed", async (event) => {
  await orderRepo.updateStatus(event.orderId, "confirmed");
});
eventBus.subscribe("payment.failed", async (event) => {
  await orderRepo.updateStatus(event.orderId, "cancelled");
});
```

## Data Management

### Database per Service

```
┌───────────────────────────────────────────────────────┐
│ ANTI-PATTERN: Shared Database                          │
│ Service A ──┐                                          │
│             ├──→ [Shared DB] ← coupling, no autonomy   │
│ Service B ──┘                                          │
└───────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│ CORRECT: Database per Service                          │
│ Service A ──→ [DB A]                                   │
│ Service B ──→ [DB B]    ← each owns its data           │
│ Sync via events or API calls                           │
└───────────────────────────────────────────────────────┘
```

### CQRS (Command Query Responsibility Segregation)

```typescript
// Write side: commands go to normalized write model
class OrderCommandHandler {
  async createOrder(cmd: CreateOrderCommand): Promise<string> {
    const order = Order.create(cmd);
    await this.writeRepo.save(order);

    // Publish event for read side projection
    await this.eventBus.publish("order.created", order.toEvent());
    return order.id;
  }
}

// Read side: optimized denormalized projections
class OrderProjection {
  constructor(private readDb: ReadDatabase) {}

  async onOrderCreated(event: OrderCreatedEvent): Promise<void> {
    await this.readDb.upsert("order_summaries", {
      orderId: event.orderId,
      customerName: event.customerName,
      totalAmount: event.totalAmount,
      itemCount: event.items.length,
      status: "created",
      createdAt: event.timestamp,
    });
  }

  async onOrderStatusChanged(event: OrderStatusChangedEvent): Promise<void> {
    await this.readDb.update("order_summaries", event.orderId, { status: event.newStatus });
  }
}

// Query handler reads from optimized read model
class OrderQueryHandler {
  async getDashboard(userId: string): Promise<DashboardView> {
    return this.readDb.query("order_summaries", { userId, limit: 50 });
  }
}
```

## Service Discovery & Mesh

### Service Mesh (Sidecar Pattern)

```yaml
# Kubernetes deployment with Istio sidecar (auto-injected)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
  labels:
    app: order-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: order-service
  template:
    metadata:
      labels:
        app: order-service
    spec:
      containers:
        - name: order-service
          image: myapp/order-service:v1.2.0
          ports:
            - containerPort: 3000
          resources:
            requests: { cpu: "100m", memory: "128Mi" }
            limits: { cpu: "500m", memory: "512Mi" }
---
# Istio VirtualService for traffic management
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: order-service
spec:
  hosts: [order-service]
  http:
    - route:
        - destination: { host: order-service, subset: v1 }
          weight: 90
        - destination: { host: order-service, subset: v2 }
          weight: 10
      retries:
        attempts: 3
        perTryTimeout: 2s
```

## Contract Testing (Pact)

### Consumer Test

```typescript
// order-service/tests/contracts/product-consumer.pact.ts
import { PactV4 } from "@pact-foundation/pact";

const provider = new PactV4({
  consumer: "order-service",
  provider: "product-service",
});

describe("Product API Contract", () => {
  it("returns product by ID", async () => {
    await provider
      .addInteraction()
      .given("product 42 exists")
      .uponReceiving("a request for product 42")
      .withRequest("GET", "/products/42")
      .willRespondWith(200, (builder) => {
        builder.jsonBody({
          id: "42",
          name: "Wireless Headphones",
          price: 79.99,
          inStock: true,
        });
      })
      .executeTest(async (mockserver) => {
        const client = new ProductClient(mockserver.url);
        const product = await client.getProduct("42");
        expect(product.name).toBe("Wireless Headphones");
        expect(product.price).toBe(79.99);
      });
  });
});
```

### Provider Verification

```typescript
// product-service/tests/contracts/product-provider.pact.ts
import { Verifier } from "@pact-foundation/pact";

describe("Product Provider Contract", () => {
  it("fulfills order-service consumer contract", async () => {
    await new Verifier({
      providerBaseUrl: "http://localhost:3002",
      pactUrls: ["./pacts/order-service-product-service.json"],
      stateHandlers: {
        "product 42 exists": async () => {
          await testDb.insert("products", { id: "42", name: "Wireless Headphones", price: 79.99, inStock: true });
        },
      },
    }).verifyProvider();
  });
});
```

## Observability

### Distributed Tracing (OpenTelemetry)

```typescript
import { trace, context, SpanStatusCode } from "@opentelemetry/api";

const tracer = trace.getTracer("order-service");

// Propagate trace context across services
async function createOrder(req: Request) {
  return tracer.startActiveSpan("createOrder", async (span) => {
    try {
      span.setAttribute("order.userId", req.body.userId);

      // Child spans for downstream calls
      const inventory = await tracer.startActiveSpan("reserveInventory", async (childSpan) => {
        const result = await inventoryClient.reserve(req.body.items);
        childSpan.setAttribute("inventory.reservationId", result.id);
        childSpan.end();
        return result;
      });

      const payment = await tracer.startActiveSpan("processPayment", async (childSpan) => {
        const result = await paymentClient.charge(req.body.userId, req.body.total);
        childSpan.end();
        return result;
      });

      span.setStatus({ code: SpanStatusCode.OK });
      return { orderId: "...", inventoryId: inventory.id, paymentId: payment.id };
    } catch (err) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: String(err) });
      throw err;
    } finally {
      span.end();
    }
  });
}
```

## Checklist

```
Before deploying a microservices architecture:
- [ ] Services aligned to bounded contexts (not technical layers)
- [ ] Each service owns its database (no shared DB)
- [ ] Sync communication only when immediate response needed
- [ ] Saga pattern implemented for distributed transactions
- [ ] Compensating transactions defined for each saga step
- [ ] API gateway handles routing, rate limiting, and aggregation
- [ ] Consumer-driven contract tests between services (Pact)
- [ ] Distributed tracing configured (OpenTelemetry)
- [ ] Correlation IDs propagated across all service calls
- [ ] Health checks and readiness probes on every service
- [ ] Circuit breakers on all inter-service calls
- [ ] Event schema versioning strategy defined
```
