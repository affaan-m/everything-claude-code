---
name: ddd-patterns
description: Domain-Driven Design implementation patterns — strategic design, value objects, aggregates, domain events, repositories, application services, and anti-corruption layers with TypeScript and Java examples.
---

# Domain-Driven Design Patterns

Tactical and strategic DDD patterns for modeling complex business domains. Focuses on domain modeling implementation (not deployment topology like `microservices-patterns`, not Java language features like `java-enterprise-patterns`).

## When to Activate

- Mapping bounded contexts and their relationships
- Implementing value objects with self-validating constructors
- Designing aggregates with invariant enforcement
- Publishing domain events reliably (outbox pattern)
- Separating domain interfaces from infrastructure (repository pattern)
- Structuring application services with command/query separation
- Wrapping third-party APIs behind anti-corruption layers
- Writing unit tests for aggregate behavior

## Core Principles

1. **Ubiquitous language** — code mirrors the language domain experts use
2. **Model-driven design** — the domain model is the code, not a diagram
3. **Aggregates enforce invariants** — all state changes go through aggregate roots
4. **Value objects over primitives** — Money, Email, CustomerId instead of number, string
5. **Side-effect-free domain** — aggregates collect events, services dispatch them
6. **Persistence ignorance** — domain layer has zero framework dependencies

---

## 1. Strategic Design
### Bounded Context Map

```
 ┌──────────────────┐  Partnership   ┌──────────────────┐
 │ Ordering (Core)   │◄────────────►│ Inventory (Core)   │
 │ Order, LineItem   │  ── events ►  │ Stock, Warehouse   │
 └───────┬──────────┘               └──────────────────┘
         │ ACL
 ┌───────▼──────────┐  Conformist   ┌──────────────────┐
 │ Billing (Support) │◄────────────│ Shipping (Generic)  │
 └──────────────────┘               └──────────────────┘
```

### Context Relationships

| Relationship | When to Use |
|---|---|
| **Partnership** | Two teams co-evolve; bidirectional, shared success |
| **Customer-Supplier** | Upstream prioritizes downstream needs |
| **Conformist** | Downstream accepts upstream model as-is |
| **ACL** | Downstream shields itself from foreign/unstable upstream |
| **Shared Kernel** | Small, stable subset both contexts need |
| **Open Host Service** | Upstream provides a well-defined published API |

### Subdomain Types

| Type | Characteristic | Example |
|---|---|---|
| Core | Competitive advantage, build in-house | Pricing engine |
| Supporting | Necessary, not differentiating | Billing |
| Generic | Solved problem, buy off-the-shelf | Email delivery |

---

## 2. Value Objects
### TypeScript Branded Types

```typescript
type Brand<T, B extends string> = T & { readonly __brand: B };
type Money = Brand<number, "Money">;
type Email = Brand<string, "Email">;
type CustomerId = Brand<string, "CustomerId">;

function Money(amount: number): Money {
  if (!Number.isFinite(amount)) throw new Error("Money must be finite");
  if (amount < 0) throw new Error("Money cannot be negative");
  return Math.round(amount * 100) / 100 as Money;
}
function Email(value: string): Email {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw new Error(`Invalid email: ${value}`);
  return value.toLowerCase() as Email;
}
function CustomerId(value: string): CustomerId {
  if (!value?.trim()) throw new Error("CustomerId cannot be empty");
  return value as CustomerId;
}
// Compiler prevents mixing: chargeCustomer("cust-42", 99.99) is a compile error
```

### Java Records

```java
public record Money(BigDecimal amount, Currency currency) {
    public static final Money ZERO = new Money(BigDecimal.ZERO, Currency.USD);
    public Money { // compact constructor — self-validating
        Objects.requireNonNull(amount); Objects.requireNonNull(currency);
        if (amount.scale() > 2) amount = amount.setScale(2, RoundingMode.HALF_UP);
    }
    public Money add(Money other) {
        if (!currency.equals(other.currency)) throw new CurrencyMismatchException(currency, other.currency);
        return new Money(amount.add(other.amount), currency);
    }
}
public record EmailAddress(String value) {
    private static final Pattern P = Pattern.compile("^[\\w.+-]+@[\\w-]+\\.[\\w.]+$");
    public EmailAddress {
        Objects.requireNonNull(value);
        if (!P.matcher(value).matches()) throw new IllegalArgumentException("Invalid email: " + value);
        value = value.toLowerCase();
    }
}
```

---

## 3. Aggregates

### Order Aggregate (TypeScript)

```typescript
class Order {
  private static readonly MAX_ITEMS = 20;
  private items: OrderItem[] = [];
  private status: "draft" | "placed" | "cancelled" = "draft";
  private version = 0; // optimistic locking
  private domainEvents: DomainEvent[] = [];
  constructor(readonly orderId: string, readonly customerId: CustomerId) {}

  addItem(item: OrderItem): void {
    if (this.status !== "draft") throw new Error("Cannot add items to a non-draft order");
    if (this.items.length >= Order.MAX_ITEMS) throw new Error(`Order cannot exceed ${Order.MAX_ITEMS} items`);
    if (item.quantity <= 0) throw new Error("Quantity must be positive");
    const existing = this.items.find(i => i.productId === item.productId);
    existing ? (existing.quantity += item.quantity) : this.items.push({ ...item });
  }

  place(): void {
    if (this.status !== "draft") throw new Error("Only draft orders can be placed");
    if (this.items.length === 0) throw new Error("Cannot place an empty order");
    this.status = "placed";
    this.domainEvents.push({
      type: "OrderPlaced", orderId: this.orderId, customerId: this.customerId,
      totalAmount: this.totalAmount(), itemCount: this.items.length, occurredAt: new Date(),
    });
  }

  cancel(reason: string): void {
    if (this.status !== "placed") throw new Error("Only placed orders can be cancelled");
    this.status = "cancelled";
    this.domainEvents.push({ type: "OrderCancelled", orderId: this.orderId, reason, occurredAt: new Date() });
  }

  totalAmount(): Money { return this.items.reduce((s, i) => Money(s + i.unitPrice * i.quantity), Money(0)); }
  getItems(): readonly OrderItem[] { return [...this.items]; }
  getVersion(): number { return this.version; }
  pullDomainEvents(): DomainEvent[] { const e = [...this.domainEvents]; this.domainEvents = []; return e; }
}
```

### Java Aggregate Root

```java
public class Order {
    private static final int MAX_ITEMS = 20;
    private final String orderId, customerId;
    private final List<OrderItem> items = new ArrayList<>();
    private OrderStatus status = OrderStatus.DRAFT;
    private int version; // @Version for JPA optimistic locking
    private final transient List<DomainEvent> domainEvents = new ArrayList<>();

    public void addItem(String productId, String name, Money price, int qty) {
        if (status != OrderStatus.DRAFT) throw new IllegalStateException("Cannot modify non-draft order");
        if (items.size() >= MAX_ITEMS) throw new BusinessRuleException("Max %d items".formatted(MAX_ITEMS));
        if (qty <= 0) throw new IllegalArgumentException("Quantity must be positive");
        items.stream().filter(i -> i.productId().equals(productId)).findFirst()
            .ifPresentOrElse(e -> e.increaseQuantity(qty), () -> items.add(new OrderItem(productId, name, price, qty)));
    }
    public void place() {
        if (status != OrderStatus.DRAFT) throw new IllegalStateException("Only draft orders can be placed");
        if (items.isEmpty()) throw new BusinessRuleException("Cannot place empty order");
        this.status = OrderStatus.PLACED;
        domainEvents.add(new OrderPlaced(orderId, customerId, totalAmount()));
    }
    public Money totalAmount() { return items.stream().map(OrderItem::subtotal).reduce(Money.ZERO, Money::add); }
    public List<DomainEvent> pullDomainEvents() { var e = List.copyOf(domainEvents); domainEvents.clear(); return e; }
}
```

---

## 4. Domain Events

### Collect-Then-Dispatch Pattern

```typescript
// Aggregate collects events (Order.place()), service dispatches AFTER persistence
class OrderAppService {
  constructor(private orderRepo: OrderRepository, private events: EventDispatcher) {}
  async placeOrder(orderId: string): Promise<void> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) throw new NotFoundError(`Order ${orderId}`);
    order.place();                             // validates + collects events
    await this.orderRepo.save(order);          // persist state
    for (const e of order.pullDomainEvents())  // dispatch only if save succeeded
      await this.events.dispatch(e);
  }
}
```

### Outbox Pattern for Reliable Publishing

```typescript
// Events stored in same DB transaction — background poller publishes to broker
class OutboxOrderRepository implements OrderRepository {
  constructor(private prisma: PrismaClient) {}
  async save(order: Order): Promise<void> {
    const events = order.pullDomainEvents();
    await this.prisma.$transaction([
      this.prisma.order.upsert({ where: { id: order.orderId }, update: this.toRecord(order), create: this.toRecord(order) }),
      ...events.map(ev => this.prisma.outboxEvent.create({ data: {
        id: crypto.randomUUID(), aggregateType: "Order", aggregateId: order.orderId,
        eventType: ev.type, payload: JSON.stringify(ev), publishedAt: null,
      }})),
    ]);
  }
}
// Poller (cron / background worker)
class OutboxPublisher {
  async pollAndPublish(): Promise<void> {
    const pending = await this.prisma.outboxEvent.findMany({ where: { publishedAt: null }, orderBy: { createdAt: "asc" }, take: 50 });
    for (const entry of pending) {
      await this.broker.publish(entry.eventType, entry.payload);
      await this.prisma.outboxEvent.update({ where: { id: entry.id }, data: { publishedAt: new Date() } });
    }
  }
}
```

---

## 5. Repositories

### Domain Interface + Prisma Implementation

```typescript
// Domain layer — pure interface, zero framework imports
interface OrderRepository {
  findById(orderId: string): Promise<Order | null>;
  findByCustomer(customerId: CustomerId): Promise<Order[]>;
  save(order: Order): Promise<void>;
  nextId(): string;
}
// Infrastructure — Prisma adapter
class PrismaOrderRepository implements OrderRepository {
  constructor(private prisma: PrismaClient) {}
  async findById(id: string): Promise<Order | null> {
    const r = await this.prisma.order.findUnique({ where: { id }, include: { items: true } });
    return r ? OrderMapper.toDomain(r) : null;
  }
  async save(order: Order): Promise<void> {
    const items = order.getItems().map(i => ({
      productId: i.productId, productName: i.productName, unitPrice: i.unitPrice, quantity: i.quantity,
    }));
    await this.prisma.order.upsert({
      where: { id: order.orderId },
      update: { status: order.getStatus(), version: { increment: 1 }, items: { deleteMany: {}, create: items } },
      create: { id: order.orderId, customerId: order.customerId, status: order.getStatus(), version: 1, items: { create: items } },
    });
  }
  nextId() { return crypto.randomUUID(); }
}
```

### Spring Data Implementation (Java)

```java
public interface OrderRepository { // domain — no Spring dependency
    Optional<Order> findById(String orderId);
    void save(Order order);
}
@Repository
class JpaOrderRepository implements OrderRepository {
    private final SpringDataOrderRepo repo;
    private final OrderEntityMapper mapper;
    @Override public Optional<Order> findById(String id) { return repo.findById(id).map(mapper::toDomain); }
    @Override public void save(Order order) { repo.save(mapper.toEntity(order)); }
}
interface SpringDataOrderRepo extends JpaRepository<OrderEntity, String> {}
```

### Specification Pattern

```typescript
interface Specification<T> { toPrismaWhere(): Record<string, unknown>; }
class OrdersByStatus implements Specification<Order> {
  constructor(private status: string) {}
  toPrismaWhere() { return { status: this.status }; }
}
class OrdersAfter implements Specification<Order> {
  constructor(private date: Date) {}
  toPrismaWhere() { return { createdAt: { gte: this.date } }; }
}
class AndSpec<T> implements Specification<T> {
  constructor(private specs: Specification<T>[]) {}
  toPrismaWhere() { return { AND: this.specs.map(s => s.toPrismaWhere()) }; }
}
// Composable: new AndSpec([new OrdersByStatus("placed"), new OrdersAfter(cutoff)])
```

---

## 6. Application Services

### Command/Query Separation (CQRS-Lite)

```typescript
// Commands — write side, returns void or ID
class OrderCommandService {
  constructor(private repo: OrderRepository, private catalog: ProductCatalog, private events: EventDispatcher) {}
  async placeOrder(cmd: { customerId: string; items: { productId: string; quantity: number }[] }): Promise<string> {
    const order = new Order(this.repo.nextId(), CustomerId(cmd.customerId));
    for (const item of cmd.items) {
      const p = await this.catalog.findById(item.productId);
      if (!p) throw new NotFoundError(`Product ${item.productId}`);
      order.addItem({ productId: p.id, productName: p.name, unitPrice: Money(p.price), quantity: item.quantity });
    }
    order.place();
    await this.repo.save(order);
    for (const e of order.pullDomainEvents()) await this.events.dispatch(e);
    return order.orderId;
  }
}

// Queries — read side, returns DTOs (never domain objects)
class OrderQueryService {
  constructor(private db: PrismaClient) {}
  async getOrderSummary(id: string): Promise<OrderSummaryDto | null> {
    const r = await this.db.order.findUnique({ where: { id }, include: { customer: true, items: true } });
    if (!r) return null;
    return { orderId: r.id, customerName: r.customer.name, status: r.status,
      totalAmount: r.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0), itemCount: r.items.length };
  }
}
```

### Transaction Boundary (Java)

```java
@Service
public class OrderCommandService {
    private final OrderRepository orderRepo;
    private final EventDispatcher events;
    @Transactional
    public String placeOrder(PlaceOrderCommand cmd) {
        var order = new Order(UUID.randomUUID().toString(), cmd.customerId());
        cmd.items().forEach(i -> order.addItem(i.productId(), i.name(), i.price(), i.qty()));
        order.place();
        orderRepo.save(order);
        order.pullDomainEvents().forEach(events::dispatch); // @TransactionalEventListener
        return order.getOrderId();
    }
}
```

---

## 7. Anti-Corruption Layer

### Third-Party API Adapter

```typescript
// Domain interface — no Stripe dependency
interface PaymentGateway {
  charge(customerId: CustomerId, amount: Money): Promise<PaymentResult>;
}
type PaymentResult =
  | { status: "approved"; transactionId: string; amount: Money }
  | { status: "declined"; reason: string }
  | { status: "pending"; retryAfter: Date };

// ACL adapter: translates Stripe's model into our domain language
class StripePaymentAdapter implements PaymentGateway {
  constructor(private stripe: StripeClient) {}
  async charge(customerId: CustomerId, amount: Money): Promise<PaymentResult> {
    try {
      const res = await this.stripe.charges.create({
        amount: Math.round(amount * 100), currency: "usd", customer: customerId, // Money -> cents
      });
      switch (res.status) {
        case "succeeded": return { status: "approved", transactionId: res.id, amount };
        case "failed":    return { status: "declined", reason: res.failure_message ?? "Unknown" };
        case "pending":   return { status: "pending", retryAfter: new Date(Date.now() + 30_000) };
      }
    } catch (error) {
      if (error instanceof StripeCardError) return { status: "declined", reason: error.message };
      throw new PaymentGatewayUnavailableError("Stripe charge failed", error);
    }
  }
}
```

---

## 8. Testing DDD

### Aggregate Unit Tests

```typescript
describe("Order Aggregate", () => {
  let order: Order;
  beforeEach(() => { order = new Order("order-1", CustomerId("cust-1")); });

  it("adds item and calculates total", () => {
    order.addItem({ productId: "p1", productName: "Widget", unitPrice: Money(10), quantity: 2 });
    expect(order.getItems()).toHaveLength(1);
    expect(order.totalAmount()).toBe(Money(20));
  });
  it("rejects adding items to placed order", () => {
    order.addItem({ productId: "p1", productName: "Widget", unitPrice: Money(10), quantity: 1 });
    order.place();
    expect(() => order.addItem({ productId: "p2", productName: "G", unitPrice: Money(5), quantity: 1 }))
      .toThrow("Cannot add items to a non-draft order");
  });
  it("rejects exceeding max 20 items", () => {
    for (let i = 0; i < 20; i++)
      order.addItem({ productId: `p${i}`, productName: "X", unitPrice: Money(1), quantity: 1 });
    expect(() => order.addItem({ productId: "p20", productName: "X", unitPrice: Money(1), quantity: 1 }))
      .toThrow("cannot exceed 20 items");
  });
  it("merges quantity for duplicate products", () => {
    order.addItem({ productId: "p1", productName: "Widget", unitPrice: Money(10), quantity: 2 });
    order.addItem({ productId: "p1", productName: "Widget", unitPrice: Money(10), quantity: 3 });
    expect(order.getItems()[0].quantity).toBe(5);
  });
  it("emits OrderPlaced with correct total", () => {
    order.addItem({ productId: "p1", productName: "Widget", unitPrice: Money(25), quantity: 4 });
    order.place();
    expect(order.pullDomainEvents()).toEqual([expect.objectContaining({ type: "OrderPlaced", totalAmount: Money(100) })]);
  });
  it("rejects placing empty order", () => {
    expect(() => order.place()).toThrow("Cannot place an empty order");
  });
});
```

### Repository Integration Test (Java)

```java
@Testcontainers
class OrderRepositoryIntegrationTest {
    @Container static PostgreSQLContainer<?> pg = new PostgreSQLContainer<>("postgres:16-alpine");
    private OrderRepository repo;
    @BeforeEach void setUp() { repo = new JpaOrderRepository(createEntityManager(pg)); }

    @Test void shouldPersistAndReconstructAggregate() {
        var order = new Order("ord-1", "cust-1");
        order.addItem("p1", "Widget", Money.of(10), 2);
        order.place(); repo.save(order);
        var found = repo.findById("ord-1");
        assertThat(found).isPresent();
        assertThat(found.get().totalAmount()).isEqualTo(Money.of(20));
    }
    @Test void shouldEnforceOptimisticLocking() {
        var order = new Order("ord-2", "cust-1");
        order.addItem("p1", "Widget", Money.of(5), 1); repo.save(order);
        var i1 = repo.findById("ord-2").orElseThrow();
        var i2 = repo.findById("ord-2").orElseThrow();
        i1.addItem("p2", "Gadget", Money.of(15), 1); repo.save(i1);
        i2.addItem("p3", "Gizmo", Money.of(20), 1);
        assertThatThrownBy(() -> repo.save(i2)).isInstanceOf(OptimisticLockingException.class);
    }
}
```

---

## 9. Checklist

- [ ] Ubiquitous language documented and used in code (class/method names)
- [ ] Bounded contexts identified with explicit relationships (ACL, partnership, etc.)
- [ ] Subdomains classified (core, supporting, generic)
- [ ] Value objects used instead of primitives for domain concepts
- [ ] Value objects are immutable with self-validating constructors
- [ ] Aggregates enforce all business invariants via guard clauses
- [ ] Aggregate boundaries minimize cross-aggregate references (use IDs)
- [ ] Optimistic locking version field on all aggregate roots
- [ ] Domain events collected by aggregates, dispatched by application services
- [ ] Outbox pattern used for reliable event publishing across transactions
- [ ] Repository interfaces in domain layer (no framework imports)
- [ ] Infrastructure implementations swappable (Prisma, JPA, in-memory)
- [ ] Application services separate commands from queries
- [ ] DTOs at service boundaries (never expose domain objects)
- [ ] Anti-corruption layers wrap all third-party integrations
- [ ] Aggregate behavior tested with unit tests (no DB)
- [ ] Repository reconstitution tested with integration tests
```
