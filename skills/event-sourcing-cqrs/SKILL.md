---
name: event-sourcing-cqrs
description: Event Sourcing and CQRS implementation patterns — event stores, aggregate rehydration, snapshots, projections, event versioning, process managers, and eventual consistency with TypeScript and Java examples.
---

# Event Sourcing & CQRS Patterns

Build systems that store state changes as an immutable sequence of events, with separate read and write models for scalability and auditability. Focuses on event sourcing infrastructure (event stores, projections, snapshots). For domain modeling patterns (aggregates, value objects, repositories), see `ddd-patterns`.

## When to Activate

- Implementing event stores for append-only event persistence
- Rehydrating aggregates from event streams
- Building projections / read models from event data
- Handling event schema evolution and versioning
- Designing process managers (sagas) for long-running workflows
- Separating read and write models (CQRS)
- Managing eventual consistency in distributed systems

## Core Principles

1. **Events are facts** — immutable records of what happened, never deleted or modified
2. **State is derived** — current state is computed by replaying events
3. **Append-only storage** — event store only supports append and read
4. **Separate read/write** — CQRS decouples command handling from query optimization
5. **Temporal queries** — reconstruct state at any point in time
6. **Eventual consistency** — read models may lag behind write model

---

## 1. Event Store Design

### TypeScript Event Store Interface

```typescript
interface DomainEvent {
  eventId: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  version: number;
  payload: Record<string, unknown>;
  metadata: { userId?: string; correlationId?: string; timestamp: Date };
}

interface EventStore {
  append(aggregateId: string, events: DomainEvent[], expectedVersion: number): Promise<void>;
  getEvents(aggregateId: string, fromVersion?: number): Promise<DomainEvent[]>;
  getEventsByType(eventType: string, since?: Date): Promise<DomainEvent[]>;
}

class PostgresEventStore implements EventStore {
  async append(aggregateId: string, events: DomainEvent[], expectedVersion: number): Promise<void> {
    await this.db.transaction(async (tx) => {
      const current = await tx.query(
        "SELECT MAX(version) as v FROM events WHERE aggregate_id = $1", [aggregateId]
      );
      if ((current.rows[0]?.v ?? 0) !== expectedVersion) {
        throw new ConcurrencyError(`Expected version ${expectedVersion}, got ${current.rows[0]?.v}`);
      }
      for (const event of events) {
        await tx.query(
          `INSERT INTO events (event_id, aggregate_id, aggregate_type, event_type, version, payload, metadata)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [event.eventId, aggregateId, event.aggregateType, event.eventType,
           event.version, JSON.stringify(event.payload), JSON.stringify(event.metadata)]
        );
      }
    });
  }

  async getEvents(aggregateId: string, fromVersion = 0): Promise<DomainEvent[]> {
    const result = await this.db.query(
      "SELECT * FROM events WHERE aggregate_id = $1 AND version > $2 ORDER BY version",
      [aggregateId, fromVersion]
    );
    return result.rows.map(this.toDomainEvent);
  }
}
```

### Event Store Schema

```sql
CREATE TABLE events (
  event_id       UUID PRIMARY KEY,
  aggregate_id   UUID NOT NULL,
  aggregate_type VARCHAR(100) NOT NULL,
  event_type     VARCHAR(100) NOT NULL,
  version        INTEGER NOT NULL,
  payload        JSONB NOT NULL,
  metadata       JSONB NOT NULL DEFAULT '{}',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (aggregate_id, version)
);
CREATE INDEX idx_events_aggregate ON events (aggregate_id, version);
CREATE INDEX idx_events_type ON events (event_type, created_at);
```

---

## 2. Aggregate Rehydration

```typescript
abstract class EventSourcedAggregate {
  private uncommittedEvents: DomainEvent[] = [];
  protected version = 0;

  static rehydrate<T extends EventSourcedAggregate>(
    this: new () => T, events: DomainEvent[]
  ): T {
    const aggregate = new this();
    for (const event of events) {
      aggregate.apply(event, false);
    }
    return aggregate;
  }

  protected raise(event: Omit<DomainEvent, "version">): void {
    const versioned = { ...event, version: ++this.version };
    this.apply(versioned as DomainEvent, true);
  }

  private apply(event: DomainEvent, isNew: boolean): void {
    this.when(event);
    this.version = event.version;
    if (isNew) this.uncommittedEvents.push(event);
  }

  protected abstract when(event: DomainEvent): void;
  pullUncommittedEvents(): DomainEvent[] {
    const events = [...this.uncommittedEvents];
    this.uncommittedEvents = [];
    return events;
  }
}

class BankAccount extends EventSourcedAggregate {
  private balance = 0;
  private status: "open" | "closed" = "open";

  deposit(amount: number, userId: string): void {
    if (this.status !== "open") throw new Error("Account is closed");
    if (amount <= 0) throw new Error("Amount must be positive");
    this.raise({
      eventId: crypto.randomUUID(), aggregateId: this.id,
      aggregateType: "BankAccount", eventType: "MoneyDeposited",
      payload: { amount }, metadata: { userId, timestamp: new Date() },
    });
  }

  protected when(event: DomainEvent): void {
    switch (event.eventType) {
      case "AccountOpened": this.status = "open"; break;
      case "MoneyDeposited": this.balance += event.payload.amount as number; break;
      case "MoneyWithdrawn": this.balance -= event.payload.amount as number; break;
      case "AccountClosed": this.status = "closed"; break;
    }
  }
}
```

---

## 3. Snapshot Strategy

Snapshots avoid replaying the entire event history for aggregates with many events.

```typescript
interface Snapshot {
  aggregateId: string;
  version: number;
  state: Record<string, unknown>;
  createdAt: Date;
}

class SnapshotRepository {
  private readonly SNAPSHOT_INTERVAL = 50;

  async loadAggregate<T extends EventSourcedAggregate>(
    factory: new () => T, aggregateId: string
  ): Promise<T> {
    const snapshot = await this.getLatestSnapshot(aggregateId);
    const fromVersion = snapshot?.version ?? 0;
    const events = await this.eventStore.getEvents(aggregateId, fromVersion);
    const aggregate = snapshot
      ? this.restoreFromSnapshot<T>(factory, snapshot, events)
      : EventSourcedAggregate.rehydrate.call(factory, events);
    return aggregate;
  }

  async saveAggregate(aggregate: EventSourcedAggregate): Promise<void> {
    const events = aggregate.pullUncommittedEvents();
    await this.eventStore.append(aggregate.id, events, aggregate.version - events.length);
    if (aggregate.version % this.SNAPSHOT_INTERVAL === 0) {
      await this.saveSnapshot(aggregate);
    }
  }
}
```

---

## 4. Projections / Read Models

```typescript
class OrderSummaryProjection {
  async handle(event: DomainEvent): Promise<void> {
    switch (event.eventType) {
      case "OrderPlaced":
        await this.db.query(
          `INSERT INTO order_summaries (order_id, customer_id, status, total, item_count, placed_at)
           VALUES ($1, $2, 'placed', $3, $4, $5)`,
          [event.aggregateId, event.payload.customerId, event.payload.total,
           event.payload.itemCount, event.metadata.timestamp]
        );
        break;
      case "OrderShipped":
        await this.db.query(
          "UPDATE order_summaries SET status = 'shipped', shipped_at = $2 WHERE order_id = $1",
          [event.aggregateId, event.metadata.timestamp]
        );
        break;
    }
  }
}

// Projection rebuild — replay all events to reconstruct read model
class ProjectionRebuilder {
  async rebuild(projection: { handle(e: DomainEvent): Promise<void> }): Promise<void> {
    await this.db.query("TRUNCATE order_summaries");
    const events = await this.eventStore.getAllEvents();
    for (const event of events) {
      await projection.handle(event);
    }
  }
}
```

---

## 5. Event Versioning & Upcasting

```typescript
interface EventUpcaster {
  eventType: string;
  fromVersion: number;
  toVersion: number;
  upcast(event: DomainEvent): DomainEvent;
}

const upcasters: EventUpcaster[] = [
  {
    eventType: "OrderPlaced", fromVersion: 1, toVersion: 2,
    upcast(event) {
      return {
        ...event,
        payload: { ...event.payload, currency: event.payload.currency ?? "USD" },
      };
    },
  },
];

function applyUpcasters(event: DomainEvent): DomainEvent {
  let current = event;
  for (const upcaster of upcasters) {
    if (current.eventType === upcaster.eventType &&
        (current.payload.schemaVersion ?? 1) === upcaster.fromVersion) {
      current = upcaster.upcast(current);
      current.payload.schemaVersion = upcaster.toVersion;
    }
  }
  return current;
}
```

---

## 6. Process Managers (Sagas)

```typescript
class OrderFulfillmentSaga {
  private state: "started" | "payment_confirmed" | "shipped" | "compensating" = "started";

  async handle(event: DomainEvent): Promise<Command[]> {
    switch (event.eventType) {
      case "OrderPlaced":
        return [{ type: "RequestPayment", orderId: event.aggregateId, amount: event.payload.total }];
      case "PaymentConfirmed":
        this.state = "payment_confirmed";
        return [{ type: "ShipOrder", orderId: event.aggregateId }];
      case "PaymentFailed":
        this.state = "compensating";
        return [{ type: "CancelOrder", orderId: event.aggregateId, reason: "Payment failed" }];
      case "OrderShipped":
        this.state = "shipped";
        return [{ type: "SendConfirmationEmail", orderId: event.aggregateId }];
      case "ShipmentFailed":
        this.state = "compensating";
        return [
          { type: "RefundPayment", orderId: event.aggregateId },
          { type: "CancelOrder", orderId: event.aggregateId, reason: "Shipment failed" },
        ];
      default: return [];
    }
  }
}
```

---

## 7. Eventual Consistency Patterns

### Read-Your-Own-Writes

```typescript
class OrderQueryService {
  async getOrder(orderId: string, opts?: { minVersion?: number }): Promise<OrderSummary> {
    if (opts?.minVersion) {
      await this.waitForProjection(orderId, opts.minVersion, 5000);
    }
    return this.db.query("SELECT * FROM order_summaries WHERE order_id = $1", [orderId]);
  }

  private async waitForProjection(id: string, version: number, timeoutMs: number): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const row = await this.db.query(
        "SELECT projected_version FROM order_summaries WHERE order_id = $1", [id]
      );
      if (row?.projected_version >= version) return;
      await new Promise(r => setTimeout(r, 100));
    }
    throw new ProjectionLagError(`Projection for ${id} has not reached version ${version}`);
  }
}
```

### Version Header in API Responses

```typescript
app.post("/orders", async (req, res) => {
  const orderId = await commandBus.dispatch(new PlaceOrderCommand(req.body));
  const version = await eventStore.getLatestVersion(orderId);
  res.setHeader("X-Event-Version", version);
  res.status(201).json({ orderId });
});

app.get("/orders/:id", async (req, res) => {
  const minVersion = req.headers["x-min-version"] ? Number(req.headers["x-min-version"]) : undefined;
  const order = await queryService.getOrder(req.params.id, { minVersion });
  res.json(order);
});
```

---

## 8. When NOT to Use Event Sourcing

| Scenario | Better Alternative |
|----------|-------------------|
| Simple CRUD with no audit needs | Standard ORM with soft deletes |
| Small team / prototype | State-based with event log table |
| Rarely queried history | Audit log table alongside state |
| Strong consistency required everywhere | Traditional ACID transactions |

---

## 9. Testing Event-Sourced Systems

### Given-When-Then

```typescript
describe("BankAccount", () => {
  it("should deposit money", () => {
    const account = BankAccount.rehydrate([
      { eventType: "AccountOpened", payload: { owner: "Alice" }, version: 1 },
    ]);
    account.deposit(100, "user-1");
    const events = account.pullUncommittedEvents();
    expect(events).toHaveLength(1);
    expect(events[0].eventType).toBe("MoneyDeposited");
    expect(events[0].payload.amount).toBe(100);
  });
});
```

### Projection Tests

```typescript
describe("OrderSummaryProjection", () => {
  it("should create summary on OrderPlaced", async () => {
    const projection = new OrderSummaryProjection(testDb);
    await projection.handle({
      eventType: "OrderPlaced", aggregateId: "order-1",
      payload: { customerId: "cust-1", total: 99.99, itemCount: 3 },
    });
    const summary = await testDb.query("SELECT * FROM order_summaries WHERE order_id = 'order-1'");
    expect(summary.status).toBe("placed");
    expect(summary.total).toBe(99.99);
  });
});
```

---

## 10. Checklist

- [ ] Events are immutable and append-only (no UPDATE/DELETE on event store)
- [ ] Event store enforces optimistic concurrency (aggregate_id + version unique)
- [ ] Aggregates rehydrated from events, not from mutable state
- [ ] Snapshot strategy defined for aggregates with high event counts
- [ ] Projections are rebuildable from scratch by replaying events
- [ ] Event schema versioning with upcasters for backward compatibility
- [ ] Process managers handle compensation for failed multi-step workflows
- [ ] Read-your-own-writes pattern for post-command queries
- [ ] Dead letter handling for failed projection updates
- [ ] Events carry correlation IDs for distributed tracing
- [ ] Idempotent event handlers (safe to replay)
- [ ] Monitoring: projection lag, event store growth, snapshot freshness
