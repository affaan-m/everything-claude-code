---
name: kotlin-patterns
description: Idiomatic Kotlin patterns including coroutines, sealed classes, extension functions, DSL builders, and multiplatform development.
origin: ECC
---

# Kotlin Development Patterns

Idiomatic Kotlin patterns for building expressive, safe, and concurrent applications.

## When to Activate

- Writing new Kotlin code
- Converting Java to Kotlin
- Designing coroutine-based systems
- Building DSLs or multiplatform projects

## Core Principles

### 1. Null Safety

```kotlin
// Safe call chain
fun getUserCity(user: User?): String =
    user?.address?.city ?: "Unknown"

// Smart cast after null check
fun process(input: Any?) {
    if (input is String && input.isNotEmpty()) {
        println(input.uppercase())
    }
}

// Require/check for preconditions
fun withdraw(amount: Double) {
    require(amount > 0) { "Amount must be positive: $amount" }
    check(balance >= amount) { "Insufficient balance" }
}
```

### 2. Immutability

```kotlin
// Prefer val over var
val users = listOf("Alice", "Bob")

// Immutable data classes with copy
data class Config(
    val host: String,
    val port: Int = 8080,
    val debug: Boolean = false,
)

val prod = Config(host = "api.example.com")
val dev = prod.copy(port = 3000, debug = true)
```

### 3. Extension Functions

```kotlin
// Domain-specific extensions
fun String.toSlug(): String =
    lowercase()
        .replace(Regex("[^a-z0-9\\s-]"), "")
        .replace(Regex("\\s+"), "-")
        .trim('-')

fun <T> List<T>.secondOrNull(): T? = getOrNull(1)

// Scoped extensions (visible only in context)
class OrderService {
    private fun Order.isExpired(): Boolean =
        createdAt.plusDays(30).isBefore(Instant.now())
}
```

## Coroutine Patterns

### Structured Concurrency

```kotlin
suspend fun fetchDashboard(userId: String): Dashboard = coroutineScope {
    val profile = async { userService.getProfile(userId) }
    val orders = async { orderService.getRecent(userId) }
    val notifications = async { notificationService.getUnread(userId) }

    Dashboard(
        profile = profile.await(),
        orders = orders.await(),
        notifications = notifications.await(),
    )
}
```

### SupervisorScope for Independent Tasks

```kotlin
suspend fun syncAll(): SyncResult = supervisorScope {
    val results = listOf(
        async { syncUsers() },
        async { syncOrders() },
        async { syncInventory() },
    ).map { deferred ->
        runCatching { deferred.await() }
    }

    SyncResult(
        succeeded = results.count { it.isSuccess },
        failed = results.count { it.isFailure },
    )
}
```

### Flow for Reactive Streams

```kotlin
fun observePrices(symbol: String): Flow<Price> = flow {
    while (currentCoroutineContext().isActive) {
        val price = api.getPrice(symbol)
        emit(price)
        delay(1_000)
    }
}

// Collect with operators
observePrices("AAPL")
    .distinctUntilChanged()
    .debounce(500)
    .catch { e -> logger.error("Price stream failed", e) }
    .collect { price -> updateUI(price) }
```

### StateFlow for Observable State

```kotlin
class CartViewModel : ViewModel() {
    private val _state = MutableStateFlow(CartState())
    val state: StateFlow<CartState> = _state.asStateFlow()

    fun addItem(item: Item) {
        _state.update { current ->
            current.copy(items = current.items + item)
        }
    }

    fun removeItem(itemId: String) {
        _state.update { current ->
            current.copy(items = current.items.filter { it.id != itemId })
        }
    }
}
```

## Sealed Classes and When

```kotlin
sealed class ApiResult<out T> {
    data class Success<T>(val data: T) : ApiResult<T>()
    data class Error(val code: Int, val message: String) : ApiResult<Nothing>()
    data object Loading : ApiResult<Nothing>()
}

fun <T> ApiResult<T>.fold(
    onSuccess: (T) -> Unit,
    onError: (Int, String) -> Unit,
    onLoading: () -> Unit = {},
) = when (this) {
    is ApiResult.Success -> onSuccess(data)
    is ApiResult.Error -> onError(code, message)
    is ApiResult.Loading -> onLoading()
}
```

### State Machine

```kotlin
sealed class OrderStatus {
    data object Pending : OrderStatus()
    data class Confirmed(val confirmedAt: Instant) : OrderStatus()
    data class Shipped(val trackingNumber: String) : OrderStatus()
    data class Delivered(val deliveredAt: Instant) : OrderStatus()
    data class Cancelled(val reason: String) : OrderStatus()
}

fun OrderStatus.canCancel(): Boolean = when (this) {
    is OrderStatus.Pending, is OrderStatus.Confirmed -> true
    else -> false
}
```

## DSL Builders

```kotlin
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

fun html(block: HtmlBuilder.() -> Unit): String =
    HtmlBuilder().apply(block).build()

// Usage
val page = html {
    head { title("My Page") }
    body {
        h1("Welcome")
        p("Hello, World!")
    }
}
```

### Configuration DSL

```kotlin
class ServerConfig private constructor(
    val host: String,
    val port: Int,
    val ssl: SslConfig?,
) {
    class Builder {
        var host: String = "0.0.0.0"
        var port: Int = 8080
        private var ssl: SslConfig? = null

        fun ssl(block: SslConfig.Builder.() -> Unit) {
            ssl = SslConfig.Builder().apply(block).build()
        }

        fun build() = ServerConfig(host, port, ssl)
    }
}

fun server(block: ServerConfig.Builder.() -> Unit): ServerConfig =
    ServerConfig.Builder().apply(block).build()

val config = server {
    host = "api.example.com"
    port = 443
    ssl {
        certPath = "/etc/ssl/cert.pem"
        keyPath = "/etc/ssl/key.pem"
    }
}
```

## Value Classes

Zero-overhead type safety:

```kotlin
@JvmInline
value class UserId(val value: Long)

@JvmInline
value class OrderId(val value: Long)

@JvmInline
value class Money(val cents: Long) {
    operator fun plus(other: Money) = Money(cents + other.cents)
    operator fun times(factor: Int) = Money(cents * factor)
}

// Cannot accidentally pass OrderId where UserId is expected
fun getUser(id: UserId): User = userRepo.findById(id.value)
```

## Scope Functions

| Function | Object ref | Return | Use case |
|----------|-----------|--------|----------|
| `let` | `it` | Lambda result | Null check + transform |
| `run` | `this` | Lambda result | Object config + compute |
| `apply` | `this` | Object | Object initialization |
| `also` | `it` | Object | Side effects |
| `with` | `this` | Lambda result | Grouping calls |

```kotlin
// let: null-safe transformation
val length = name?.let { it.trim().length }

// apply: object initialization
val client = HttpClient().apply {
    timeout = 30_000
    retries = 3
    baseUrl = "https://api.example.com"
}

// also: side effects
val user = userRepo.save(newUser).also {
    logger.info("Created user: ${it.id}")
    metrics.increment("users.created")
}
```

## Error Handling

```kotlin
// runCatching with Result
fun fetchUser(id: String): Result<User> = runCatching {
    api.getUser(id)
}

fetchUser("123")
    .map { it.name }
    .onSuccess { println("Found: $it") }
    .onFailure { logger.error("Failed to fetch user", it) }
    .getOrDefault("Unknown")
```

## Testing with MockK

```kotlin
@Test
fun `sends welcome email on registration`() = runTest {
    val emailService = mockk<EmailService>()
    val userRepo = mockk<UserRepository>()

    coEvery { userRepo.save(any()) } returns User("1", "test@example.com")
    coEvery { emailService.send(any()) } just Runs

    val service = RegistrationService(userRepo, emailService)
    service.register("test@example.com", "password")

    coVerify(exactly = 1) {
        emailService.send(match { it.to == "test@example.com" })
    }
}
```

**Remember**: Kotlin's strength is expressiveness without sacrificing safety. Use null safety, sealed classes, and coroutines to write code that is both concise and correct.
