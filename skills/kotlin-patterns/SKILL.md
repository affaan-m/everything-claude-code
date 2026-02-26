---
name: kotlin-patterns
description: Idiomatic Kotlin patterns including coroutines, sealed classes, extension functions, DSL builders, and multiplatform development.
origin: ECC
---

# Kotlin Development Patterns

Idiomatic Kotlin patterns and best practices for building robust, concise, and safe applications across JVM, Android, and multiplatform targets.

## When to Use

- Writing new Kotlin code (JVM, Android, Multiplatform)
- Reviewing Kotlin code for idiomatic usage
- Converting Java code to Kotlin
- Designing Kotlin APIs, DSLs, or libraries
- Working with coroutines and asynchronous flows
- Structuring Kotlin multiplatform projects

## How It Works

### 1. Null Safety

Kotlin's type system eliminates null pointer exceptions at compile time. Embrace it fully.

```kotlin
// GOOD: Non-nullable by default, nullable only when necessary
fun findUser(id: String): User? {
    return userRepository.findById(id)
}

// GOOD: Safe call chain with elvis operator
fun getUserDisplayName(userId: String): String {
    return findUser(userId)?.displayName ?: "Unknown User"
}

// GOOD: Smart cast after null check
fun processUser(user: User?) {
    user ?: return // early return if null
    // user is smart-cast to non-null User here
    log.info("Processing user: ${user.name}")
}

// GOOD: require/check for preconditions
fun transferFunds(from: Account, to: Account, amount: BigDecimal) {
    require(amount > BigDecimal.ZERO) { "Amount must be positive: $amount" }
    check(from.balance >= amount) { "Insufficient funds in account ${from.id}" }
    // proceed with transfer
}

// BAD: Defeating the type system
val name: String = user!!.name // avoid !! operator
val result: String = value as String // unsafe cast without check
```

### 2. Immutability by Default

Prefer `val` over `var`, immutable collections over mutable.

```kotlin
// GOOD: Immutable data class
data class User(
    val id: String,
    val name: String,
    val email: String,
    val roles: List<String> // List is read-only in Kotlin
)

// GOOD: Update via copy
fun updateUserName(user: User, newName: String): User =
    user.copy(name = newName)

// GOOD: Immutable collection operations
fun activeUsers(users: List<User>): List<User> =
    users.filter { it.isActive }

// BAD: Mutable state
var count = 0 // prefer val when possible
val mutableList = mutableListOf<User>() // prefer List unless mutation is needed internally
```

### 3. Extension Functions

Add functionality to existing types without inheritance.

```kotlin
// Domain-specific extensions on standard types
fun String.toSlug(): String =
    lowercase()
        .replace(Regex("[^a-z0-9\\s-]"), "")
        .replace(Regex("\\s+"), "-")
        .trim('-')

fun BigDecimal.formatCurrency(locale: Locale = Locale.US): String =
    NumberFormat.getCurrencyInstance(locale).format(this)

fun Instant.isOlderThan(duration: Duration): Boolean =
    this.plus(duration).isBefore(Instant.now())

// Collection extensions for domain logic
fun List<Order>.totalRevenue(): BigDecimal =
    fold(BigDecimal.ZERO) { acc, order -> acc + order.total }

fun <T> List<T>.partitionBySize(size: Int): List<List<T>> =
    chunked(size)

// Best practices for extensions:
// - Keep extensions close to where they are used
// - Do not use extensions to circumvent encapsulation
// - Prefer member functions for core behavior
// - Use extensions for convenience and interop
```

## Examples

## Coroutine Patterns

### Structured Concurrency

Every coroutine must have a clearly defined scope and lifetime.

```kotlin
// GOOD: Structured concurrency with coroutineScope
suspend fun fetchDashboardData(userId: String): DashboardData = coroutineScope {
    val userDeferred = async { userService.getUser(userId) }
    val ordersDeferred = async { orderService.getRecentOrders(userId) }
    val statsDeferred = async { analyticsService.getUserStats(userId) }

    DashboardData(
        user = userDeferred.await(),
        recentOrders = ordersDeferred.await(),
        stats = statsDeferred.await()
    )
}

// GOOD: supervisorScope when children should not cancel siblings
suspend fun processAllOrders(orderIds: List<String>): List<Result<Order>> = supervisorScope {
    orderIds.map { orderId ->
        async {
            runCatching { orderService.processOrder(orderId) }
        }
    }.awaitAll()
}

// BAD: GlobalScope launches -- no structured concurrency
GlobalScope.launch { // leaked coroutine, no cancellation control
    processOrder(orderId)
}

// BAD: Swallowing CancellationException
try {
    delay(1000)
} catch (e: Exception) { // catches CancellationException, breaking cancellation
    log.error("Error", e)
}

// GOOD: Rethrow CancellationException
try {
    externalService.call()
} catch (e: CancellationException) {
    throw e // always rethrow
} catch (e: Exception) {
    log.error("Service call failed", e)
    throw ServiceException("External service unavailable", e)
}
```

### Flow Patterns

```kotlin
// GOOD: Cold stream with Flow
fun observePriceUpdates(symbol: String): Flow<Price> = flow {
    while (currentCoroutineContext().isActive) {
        val price = priceService.getLatestPrice(symbol)
        emit(price)
        delay(1.seconds)
    }
}.distinctUntilChanged()
 .catch { e -> log.error("Price update failed for $symbol", e) }

// GOOD: Flow operators for transformation
fun observePortfolioValue(userId: String): Flow<BigDecimal> =
    holdingsRepository.observeHoldings(userId)
        .flatMapLatest { holdings ->
            combine(
                holdings.map { holding ->
                    observePriceUpdates(holding.symbol)
                        .map { price -> holding.quantity * price.value }
                }
            ) { values -> values.fold(BigDecimal.ZERO, BigDecimal::add) }
        }
        .debounce(500.milliseconds)
        .flowOn(Dispatchers.Default)

// GOOD: StateFlow for observable state
class UserViewModel(private val userRepository: UserRepository) : ViewModel() {
    private val _uiState = MutableStateFlow<UiState>(UiState.Loading)
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    fun loadUser(userId: String) {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            try {
                val user = userRepository.getUser(userId)
                _uiState.value = UiState.Success(user)
            } catch (e: Exception) {
                _uiState.value = UiState.Error(e.message ?: "Unknown error")
            }
        }
    }
}

sealed class UiState {
    data object Loading : UiState()
    data class Success(val user: User) : UiState()
    data class Error(val message: String) : UiState()
}
```

### Channels

```kotlin
// GOOD: Channel for fan-out pattern
suspend fun processWorkItems(items: List<WorkItem>, workerCount: Int) = coroutineScope {
    val channel = Channel<WorkItem>(capacity = Channel.BUFFERED)

    // Producer
    launch {
        items.forEach { channel.send(it) }
        channel.close()
    }

    // Workers (fan-out)
    repeat(workerCount) { workerId ->
        launch {
            for (item in channel) {
                log.info("Worker $workerId processing ${item.id}")
                processItem(item)
            }
        }
    }
}

// GOOD: Channel for back-pressure
fun <T> Flow<T>.throttleFirst(windowDuration: Duration): Flow<T> = channelFlow {
    var lastEmitTime = 0L
    collect { value ->
        val currentTime = System.currentTimeMillis()
        if (currentTime - lastEmitTime >= windowDuration.inWholeMilliseconds) {
            lastEmitTime = currentTime
            send(value)
        }
    }
}
```

## Sealed Classes and When Expressions

```kotlin
// Exhaustive type hierarchies
sealed interface ApiError {
    val message: String

    data class NotFound(override val message: String, val resourceId: String) : ApiError
    data class Unauthorized(override val message: String) : ApiError
    data class ValidationFailed(
        override val message: String,
        val fieldErrors: Map<String, String>
    ) : ApiError
    data class ServerError(override val message: String, val cause: Throwable?) : ApiError
}

// Exhaustive when -- compiler enforces all cases
fun ApiError.toHttpResponse(): ResponseEntity<ErrorResponse> = when (this) {
    is ApiError.NotFound -> ResponseEntity.status(404)
        .body(ErrorResponse(message, mapOf("resourceId" to resourceId)))
    is ApiError.Unauthorized -> ResponseEntity.status(401)
        .body(ErrorResponse(message))
    is ApiError.ValidationFailed -> ResponseEntity.status(422)
        .body(ErrorResponse(message, fieldErrors))
    is ApiError.ServerError -> ResponseEntity.status(500)
        .body(ErrorResponse("Internal server error"))
}

// Sealed class for state machines
sealed class OrderState {
    data object Created : OrderState()
    data class PaymentPending(val paymentId: String) : OrderState()
    data class Paid(val transactionId: String) : OrderState()
    data class Shipped(val trackingNumber: String) : OrderState()
    data class Delivered(val deliveredAt: Instant) : OrderState()
    data class Cancelled(val reason: String) : OrderState()
}

fun OrderState.canCancel(): Boolean = when (this) {
    is OrderState.Created, is OrderState.PaymentPending -> true
    is OrderState.Paid, is OrderState.Shipped,
    is OrderState.Delivered, is OrderState.Cancelled -> false
}
```

## DSL Builders

```kotlin
// Type-safe builder using @DslMarker
@DslMarker
annotation class HtmlDsl

@HtmlDsl
class HtmlBuilder {
    private val elements = mutableListOf<String>()

    fun head(block: HeadBuilder.() -> Unit) {
        elements += HeadBuilder().apply(block).build()
    }

    fun body(block: BodyBuilder.() -> Unit) {
        elements += BodyBuilder().apply(block).build()
    }

    fun build(): String = "<html>${elements.joinToString("")}</html>"
}

fun html(block: HtmlBuilder.() -> Unit): String = HtmlBuilder().apply(block).build()

// Usage
val page = html {
    head {
        title("My Page")
    }
    body {
        h1("Hello, World!")
        p("This is a DSL-built page.")
    }
}

// Configuration DSL
class ServerConfig private constructor(
    val host: String,
    val port: Int,
    val ssl: SslConfig?,
    val routes: List<Route>
) {
    class Builder {
        var host: String = "0.0.0.0"
        var port: Int = 8080
        private var ssl: SslConfig? = null
        private val routes = mutableListOf<Route>()

        fun ssl(block: SslConfig.Builder.() -> Unit) {
            ssl = SslConfig.Builder().apply(block).build()
        }

        fun route(path: String, block: RouteBuilder.() -> Unit) {
            routes += RouteBuilder(path).apply(block).build()
        }

        fun build() = ServerConfig(host, port, ssl, routes.toList())
    }
}

fun server(block: ServerConfig.Builder.() -> Unit): ServerConfig =
    ServerConfig.Builder().apply(block).build()

// Usage
val config = server {
    host = "localhost"
    port = 9090
    ssl {
        certificate = "/path/to/cert.pem"
        privateKey = "/path/to/key.pem"
    }
    route("/api/users") {
        get { /* handler */ }
        post { /* handler */ }
    }
}
```

## Kotlin Multiplatform Patterns

```kotlin
// Common module: shared business logic
// commonMain/kotlin/com/example/shared/
expect class PlatformContext

expect fun createHttpClient(): HttpClient

class UserRepository(private val client: HttpClient) {
    suspend fun getUser(id: String): User {
        val response = client.get("https://api.example.com/users/$id")
        return response.body()
    }
}

// JVM implementation
// jvmMain/kotlin/com/example/shared/
actual class PlatformContext

actual fun createHttpClient(): HttpClient = HttpClient(CIO) {
    install(ContentNegotiation) { json() }
}

// iOS implementation
// iosMain/kotlin/com/example/shared/
actual class PlatformContext

actual fun createHttpClient(): HttpClient = HttpClient(Darwin) {
    install(ContentNegotiation) { json() }
}

// Architecture: shared vs platform-specific
// commonMain/ -- Business logic, data models, repository interfaces
// jvmMain/    -- JVM-specific implementations (JDBC, file I/O)
// iosMain/    -- iOS-specific implementations (CoreData, NSFileManager)
// jsMain/     -- JS-specific implementations (fetch, localStorage)
```

## Data Classes and Value Classes

```kotlin
// Data class for domain entities
data class Order(
    val id: OrderId,
    val customerId: CustomerId,
    val items: List<OrderItem>,
    val status: OrderStatus,
    val createdAt: Instant
) {
    val total: BigDecimal get() = items.sumOf { it.lineTotal }
}

// Value classes for type-safe identifiers (zero runtime overhead)
@JvmInline
value class OrderId(val value: String) {
    init {
        require(value.isNotBlank()) { "OrderId must not be blank" }
    }
}

@JvmInline
value class CustomerId(val value: String)

@JvmInline
value class Money(val cents: Long) {
    operator fun plus(other: Money) = Money(cents + other.cents)
    operator fun minus(other: Money) = Money(cents - other.cents)
    operator fun times(factor: Int) = Money(cents * factor)

    fun toDollars(): BigDecimal = BigDecimal(cents).divide(BigDecimal(100), 2, RoundingMode.HALF_UP)

    companion object {
        fun fromDollars(dollars: BigDecimal): Money =
            Money(dollars.multiply(BigDecimal(100)).toLong())
        val ZERO = Money(0)
    }
}

// Using value classes prevents mixing up IDs
fun getOrder(orderId: OrderId): Order // cannot accidentally pass CustomerId
```

## Scope Functions

```kotlin
// let: Transform nullable values or introduce scoped variables
val length: Int? = name?.let { it.trim().length }

val user: User = userRepository.findById(id)?.let { entity ->
    User(entity.id, entity.name, entity.email)
} ?: throw UserNotFoundException(id)

// run: Execute a block and return the result (object context)
val result = service.run {
    configure(options)
    execute(input)
}

// apply: Configure an object and return the object itself
val connection = DatabaseConnection().apply {
    url = "jdbc:postgresql://localhost/mydb"
    username = "app"
    maxPoolSize = 10
}

// also: Side effects that do not change the object
fun createUser(request: CreateUserRequest): User =
    userRepository.save(request.toEntity())
        .also { log.info("Created user: ${it.id}") }
        .also { metrics.incrementCounter("users.created") }

// with: Call multiple methods on an object without repeating the receiver
fun renderUser(user: User): String = with(user) {
    """
    Name: $name
    Email: $email
    Roles: ${roles.joinToString(", ")}
    """.trimIndent()
}

// Decision guide:
// +-----------+----------+------------------+----------------------------+
// | Function  | Receiver | Return value     | Use case                   |
// +-----------+----------+------------------+----------------------------+
// | let       | it       | Lambda result    | Null check, transform      |
// | run       | this     | Lambda result    | Object config + compute    |
// | apply     | this     | Object itself    | Object initialization      |
// | also      | it       | Object itself    | Side effects               |
// | with      | this     | Lambda result    | Multiple calls on object   |
// +-----------+----------+------------------+----------------------------+
```

## Error Handling Patterns

```kotlin
// Result type for recoverable operations
suspend fun fetchUser(id: String): Result<User> = runCatching {
    val response = httpClient.get("/users/$id")
    if (response.status != HttpStatusCode.OK) {
        throw ApiException("Failed to fetch user: ${response.status}")
    }
    response.body<User>()
}

// Chaining Result operations
suspend fun getUserOrders(userId: String): Result<List<Order>> =
    fetchUser(userId)
        .mapCatching { user -> orderService.getOrdersForUser(user.id) }
        .onFailure { e -> log.error("Failed to get orders for user $userId", e) }

// Custom result type with sealed classes (when Result is insufficient)
sealed class Outcome<out T> {
    data class Success<T>(val value: T) : Outcome<T>()
    data class Failure(val error: DomainError) : Outcome<Nothing>()

    fun <R> map(transform: (T) -> R): Outcome<R> = when (this) {
        is Success -> Success(transform(value))
        is Failure -> this
    }

    fun <R> flatMap(transform: (T) -> Outcome<R>): Outcome<R> = when (this) {
        is Success -> transform(value)
        is Failure -> this
    }
}
```

## Testing Patterns

```kotlin
// Kotlin-specific testing with MockK and kotest assertions
class OrderServiceTest {
    private val orderRepository = mockk<OrderRepository>()
    private val eventPublisher = mockk<EventPublisher>(relaxed = true)
    private val service = OrderService(orderRepository, eventPublisher)

    @Test
    fun `should create order with valid items`() {
        val items = listOf(OrderItem("SKU-001", 2, Money.fromDollars(BigDecimal("29.99"))))
        every { orderRepository.save(any()) } answers { firstArg() }

        val order = service.createOrder(CreateOrderRequest(items))

        assertThat(order.items).hasSize(1)
        assertThat(order.total.toDollars()).isEqualByComparingTo(BigDecimal("59.98"))
        verify(exactly = 1) { eventPublisher.publish(any<OrderCreatedEvent>()) }
    }
}

// Coroutine testing with kotlinx-coroutines-test
class UserViewModelTest {
    @Test
    fun `should load user successfully`() = runTest {
        val fakeRepository = FakeUserRepository(
            users = mapOf("user-1" to User("user-1", "Alice"))
        )
        val viewModel = UserViewModel(fakeRepository)

        viewModel.loadUser("user-1")

        val state = viewModel.uiState.value
        assertThat(state).isInstanceOf(UiState.Success::class.java)
        assertThat((state as UiState.Success).user.name).isEqualTo("Alice")
    }
}
```

## Reference

For Java interop patterns, see skill: `java-coding-standards`.
For Spring Boot integration, see skills: `springboot-patterns`, `springboot-tdd`.
For Android-specific Kotlin patterns, consult Android developer documentation.
