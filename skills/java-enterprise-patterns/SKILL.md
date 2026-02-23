---
name: java-enterprise-patterns
description: Modern Java enterprise patterns - virtual threads, records, sealed classes, DDD, and testing. Framework-independent (not Spring-specific).
---

# Java Enterprise Patterns

## When to Activate

- Implementing concurrency with virtual threads or CompletableFuture
- Designing domain models with records and sealed classes
- Applying DDD patterns in Java
- Building resilient API clients with java.net.http
- Writing JUnit 5 tests with modern patterns

## Core Principles

1. Prefer immutability - records, List.copyOf, Collections.unmodifiable*
2. Express domain intent through types, not primitives
3. Use virtual threads for I/O-bound concurrency (Java 21+)
4. Exhaust pattern matching with sealed types instead of instanceof chains
5. Test behavior, not implementation

---

## Virtual Threads (Java 21+)

Virtual threads are lightweight JVM-managed threads ideal for I/O-bound work.
### Virtual Thread Executor

```java
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    List<Future<String>> futures = urls.stream()
        .map(url -> executor.submit(() -> fetch(url)))
        .toList();

    List<String> results = futures.stream()
        .map(f -> {
            try {
                return f.get();
            } catch (ExecutionException e) {
                throw new RuntimeException("Fetch failed", e.getCause());
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Interrupted", e);
            }
        })
        .toList();
}
```

### StructuredTaskScope (Preview API — requires `--enable-preview`)

```java
// ShutdownOnFailure: cancel all if any task fails
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    Subtask<UserProfile> profileTask = scope.fork(() -> userService.getProfile(userId));
    Subtask<List<Order>> ordersTask  = scope.fork(() -> orderService.getOrders(userId));
    scope.join().throwIfFailed();
    return new UserDashboard(profileTask.get(), ordersTask.get());
}

// ShutdownOnSuccess: return first successful result
try (var scope = new StructuredTaskScope.ShutdownOnSuccess<String>()) {
    scope.fork(() -> primaryCache.get(key));
    scope.fork(() -> fallbackCache.get(key));
    scope.join();
    return scope.result();
}
```

### Virtual vs Platform Threads

| Scenario | Recommendation |
|---|---|
| HTTP calls, DB queries, file I/O | Virtual threads |
| CPU-intensive computation | Platform threads (ForkJoinPool) |
| Legacy blocking libraries | Virtual threads (block cheaply) |
| Pinning risk (synchronized + native) | Refactor to ReentrantLock |

```java
// Replace synchronized to avoid pinning virtual threads
private final ReentrantLock lock = new ReentrantLock();

public void safeUpdate(Data data) {
    lock.lock();
    try {
        // virtual thread can unmount here instead of pinning carrier thread
    } finally {
        lock.unlock();
    }
}
```

---

## CompletableFuture Composition

```java
CompletableFuture<OrderSummary> pipeline = CompletableFuture
    .supplyAsync(() -> orderRepository.findById(orderId))
    .thenApply(order -> enrichWithPricing(order))              // sync transform
    .thenCompose(order -> inventoryClient.checkStock(order))   // async transform
    .thenCombine(
        userService.getPreferences(userId),
        (order, prefs) -> new OrderSummary(order, prefs)       // merge two futures
    )
    .orTimeout(5, TimeUnit.SECONDS)
    .exceptionally(ex -> OrderSummary.empty());
```

### allOf / anyOf Patterns

```java
// Wait for ALL
CompletableFuture<List<NotificationResult>> allResults = CompletableFuture
    .allOf(notifications.toArray(new CompletableFuture[0]))
    .thenApply(v -> notifications.stream().map(CompletableFuture::join).toList());

// Return FIRST successful
CompletableFuture<String> fastest = CompletableFuture
    .anyOf(serviceA.query(input), serviceB.query(input))
    .thenApply(result -> (String) result);
```

### Timeout and Exception Handling

```java
priceService.getQuote(item)
    .orTimeout(3, TimeUnit.SECONDS)                         // throws TimeoutException
    .exceptionally(ex -> PriceQuote.defaultPrice(item))     // on any failure
    .handle((result, ex) -> ex != null ? PriceQuote.error() : result); // always runs
```

---

## Records and Sealed Classes

### Records as Immutable Value Objects

```java
public record OrderDto(String id, String customer, List<ItemDto> items) {
    public OrderDto {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(customer, "customer must not be null");
        Objects.requireNonNull(items, "items must not be null");
        items = List.copyOf(items);  // defensive copy in compact constructor
    }

    public Money totalAmount() {
        return items.stream()
            .map(ItemDto::subtotal)
            .reduce(Money.ZERO, Money::add);
    }
}
```

### Sealed Interfaces for Exhaustive Domain Modeling

```java
public sealed interface PaymentResult
    permits PaymentResult.Approved, PaymentResult.Declined, PaymentResult.PendingReview {

    record Approved(String transactionId, Money amount) implements PaymentResult {}
    record Declined(String reason, String errorCode)   implements PaymentResult {}
    record PendingReview(String reviewId, Duration estimatedWait) implements PaymentResult {}
}
```

### Pattern Matching Switch (Java 21)

```java
// Exhaustive - compiler enforces all permits are handled
String message = switch (result) {
    case PaymentResult.Approved(var txId, var amount) ->
        "Payment of %s approved. Tx: %s".formatted(amount, txId);
    case PaymentResult.Declined(var reason, var code) ->
        "Declined (%s): %s".formatted(code, reason);
    case PaymentResult.PendingReview(var reviewId, var wait) ->
        "Under review (ID: %s), estimated %s".formatted(reviewId, wait);
};

// Guard patterns
String priority = switch (order) {
    case Order o when o.amount().isGreaterThan(Money.of(10_000)) -> "VIP";
    case Order o when o.isExpedited()                            -> "Express";
    case Order o                                                 -> "Standard";
};
```

---

## Domain-Driven Design in Java

### Value Objects with Validation

```java
public record EmailAddress(String value) {
    private static final Pattern PATTERN =
        Pattern.compile("^[\\w.+-]+@[\\w-]+\\.[\\w.]+$");

    public EmailAddress {
        Objects.requireNonNull(value);
        if (!PATTERN.matcher(value).matches())
            throw new IllegalArgumentException("Invalid email: " + value);
        value = value.toLowerCase();
    }
}

public record Money(BigDecimal amount, Currency currency) {
    public Money add(Money other) {
        if (!this.currency.equals(other.currency))
            throw new IllegalArgumentException("Currency mismatch");
        return new Money(this.amount.add(other.amount), this.currency);
    }

    public boolean isGreaterThan(Money other) {
        return this.amount.compareTo(other.amount) > 0;
    }
}
```

### Domain Events

```java
public record OrderPlaced(UUID eventId, Instant occurredAt, String orderId, String customerId) {
    public OrderPlaced(String orderId, String customerId) {
        this(UUID.randomUUID(), Instant.now(), orderId, customerId);
    }
}

// Aggregate root collects events
public class Order {
    private final List<Object> domainEvents = new ArrayList<>();

    public void place() {
        // business logic...
        domainEvents.add(new OrderPlaced(this.id, this.customerId));
    }

    public List<Object> pullDomainEvents() {
        var events = List.copyOf(domainEvents);
        domainEvents.clear();
        return events;
    }
}
```

### Repository Pattern

```java
// Domain interface - no framework dependencies
public interface OrderRepository {
    Optional<Order> findById(String orderId);
    List<Order> findByCustomerId(String customerId);
    void save(Order order);
}

// Infrastructure implementation
public class JdbcOrderRepository implements OrderRepository {
    private final DataSource dataSource;

    @Override
    public Optional<Order> findById(String orderId) {
        try (var conn = dataSource.getConnection();
             var stmt = conn.prepareStatement("SELECT * FROM orders WHERE id = ?")) {
            stmt.setString(1, orderId);
            var rs = stmt.executeQuery();
            return rs.next() ? Optional.of(mapper.fromResultSet(rs)) : Optional.empty();
        } catch (SQLException e) {
            throw new RepositoryException("Failed to find order: " + orderId, e);
        }
    }
}
```

---

## Design Patterns in Modern Java

### Strategy with Functional Interfaces

```java
@FunctionalInterface
public interface DiscountStrategy {
    Money apply(Money price, Order order);

    static DiscountStrategy percentage(double pct) {
        return (price, order) -> price.multiply(1 - pct / 100);
    }

    static DiscountStrategy loyaltyBonus(int minOrders) {
        return (price, order) ->
            order.customerOrderCount() >= minOrders ? price.multiply(0.9) : price;
    }
}

// Compose multiple strategies
DiscountStrategy combined = strategies.stream()
    .reduce((price, order) -> price,
            (a, b) -> (price, order) -> b.apply(a.apply(price, order), order));
```

### Factory with Sealed Types

```java
public sealed interface NotificationChannel
    permits NotificationChannel.Email, NotificationChannel.Sms, NotificationChannel.Push {

    record Email(String address)     implements NotificationChannel {}
    record Sms(String phoneNumber)   implements NotificationChannel {}
    record Push(String deviceToken)  implements NotificationChannel {}

    static NotificationSender senderFor(NotificationChannel channel) {
        return switch (channel) {
            case Email(var addr)  -> new EmailSender(addr);
            case Sms(var phone)   -> new SmsSender(phone);
            case Push(var token)  -> new PushSender(token);
        };
    }
}
```

---

## API Client Design

### java.net.http.HttpClient with Virtual Threads

```java
public class ProductApiClient {
    private final HttpClient client = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(5))
        .executor(Executors.newVirtualThreadPerTaskExecutor())
        .build();

    public Optional<Product> findById(String productId) {
        var request = HttpRequest.newBuilder()
            .uri(URI.create(baseUrl + "/products/" + productId))
            .header("Accept", "application/json")
            .timeout(Duration.ofSeconds(10))
            .GET().build();

        try {
            var response = client.send(request, HttpResponse.BodyHandlers.ofString());
            return switch (response.statusCode()) {
                case 200 -> Optional.of(mapper.readValue(response.body(), Product.class));
                case 404 -> Optional.empty();
                default  -> throw new ApiException("Unexpected status: " + response.statusCode());
            };
        } catch (IOException | InterruptedException e) {
            throw new ApiException("Request failed for product: " + productId, e);
        }
    }
}
```

### Resilience4j Composition

```java
// Order matters: rate limiter -> circuit breaker -> retry -> fallback
Supplier<Optional<Product>> resilientCall = Decorators
    .ofSupplier(() -> apiClient.findById(productId))
    .withRateLimiter(RateLimiter.of("productApi", RateLimiterConfig.custom()
        .limitForPeriod(100)
        .limitRefreshPeriod(Duration.ofSeconds(1))
        .build()))
    .withCircuitBreaker(CircuitBreaker.ofDefaults("productApi"))
    .withRetry(Retry.of("productApi", RetryConfig.custom()
        .maxAttempts(3)
        .waitDuration(Duration.ofMillis(500))
        .retryOnException(ex -> ex instanceof IOException)
        .build()))
    .withFallback(List.of(CallNotPermittedException.class, RequestNotPermitted.class),
        ex -> Optional.of(Product.placeholder(productId)))
    .decorate();
```

---

## Testing

### JUnit 5 @Nested BDD-Style Structure

```java
class OrderServiceTest {

    @Nested
    class WhenPlacingOrder {

        @Test
        void shouldCreateOrderWithCorrectTotal() {
            var items = List.of(new OrderItem("SKU-1", 2, Money.of(10)));
            assertThat(service.place("cust-1", items).totalAmount()).isEqualTo(Money.of(20));
        }

        @Nested
        class AndItemsAreEmpty {
            @Test
            void shouldThrowIllegalArgumentException() {
                assertThatThrownBy(() -> service.place("cust-1", List.of()))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Order must have at least one item");
            }
        }
    }
}
```

### @ParameterizedTest Patterns

```java
@ParameterizedTest(name = "{0} -> tier {1}")
@CsvSource({"100.00,STANDARD", "1000.00,PREMIUM", "10000.00,VIP"})
void shouldClassifyOrderByAmount(BigDecimal amount, String expectedTier) {
    assertThat(new Order(Money.of(amount)).tier()).isEqualTo(OrderTier.valueOf(expectedTier));
}

@ParameterizedTest
@MethodSource("invalidEmailProvider")
void shouldRejectInvalidEmails(String email) {
    assertThatThrownBy(() -> new EmailAddress(email)).isInstanceOf(IllegalArgumentException.class);
}

static Stream<String> invalidEmailProvider() {
    return Stream.of("", "notanemail", "missing@", "@nodomain", "double@@at.com");
}
```

### AssertJ Fluent Assertions

```java
// Collections
assertThat(orders)
    .hasSize(3)
    .extracting(Order::customerId)
    .containsExactlyInAnyOrder("cust-1", "cust-2", "cust-3");

// Soft assertions - collect all failures before reporting
SoftAssertions.assertSoftly(softly -> {
    softly.assertThat(result.id()).isNotNull();
    softly.assertThat(result.customer()).isEqualTo("expected-customer");
    softly.assertThat(result.items()).hasSize(2);
});
```

### Testcontainers for Integration Tests

```java
@Testcontainers
class OrderRepositoryIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
        .withDatabaseName("orders_test")
        .withUsername("test")
        .withPassword("test");

    @Test
    void shouldPersistAndRetrieveOrder() {
        var order = Order.create("cust-1", List.of(new OrderItem("SKU-1", 1, Money.of(50))));
        repository.save(order);

        var found = repository.findById(order.id());
        assertThat(found).isPresent();
        assertThat(found.get().customerId()).isEqualTo("cust-1");
    }
}
```

---

## Verification Checklist

### Concurrency
- [ ] Virtual threads used for I/O-bound operations
- [ ] `synchronized` replaced with `ReentrantLock` where pinning is a concern
- [ ] `StructuredTaskScope` used for fan-out patterns
- [ ] CompletableFuture chains have timeout and fallback

### Domain Model
- [ ] Records used for value objects and DTOs
- [ ] Compact constructors validate and normalize inputs
- [ ] Defensive copies applied (List.copyOf, Collections.unmodifiableMap)
- [ ] Sealed interfaces used for finite variant types
- [ ] Pattern matching switch is exhaustive (no default needed)
- [ ] Domain exceptions are specific (not generic RuntimeException)

### API Client
- [ ] HttpClient configured with connect and request timeouts
- [ ] HTTP status codes handled exhaustively
- [ ] Resilience4j circuit breaker wraps external calls
- [ ] Retry configured with exponential backoff and exception filters

### Testing
- [ ] @Nested classes group related scenarios (feature or Given/When/Then)
- [ ] @ParameterizedTest used for boundary values and equivalence classes
- [ ] AssertJ used over JUnit assertions for richer failure messages
- [ ] Integration tests use Testcontainers (not H2 in-memory for production DBs)
- [ ] Mocks verify behavior, not internal implementation details
