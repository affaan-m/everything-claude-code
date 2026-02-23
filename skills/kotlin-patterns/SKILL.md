---
name: kotlin-patterns
description: Kotlin development patterns — coroutines, Flow, null safety, sealed classes, DSL builders, extension functions, Spring Boot integration, Android basics, and testing with MockK.
---

# Kotlin Development Patterns

Production-grade Kotlin patterns for coroutines, type safety, and modern application development.

## When to Activate

- Writing Kotlin coroutines and structured concurrency
- Using Kotlin Flow for reactive streams
- Designing with sealed classes and data classes
- Building type-safe DSLs
- Integrating Kotlin with Spring Boot
- Writing Android ViewModels and Compose basics
- Testing with MockK and Turbine

## Core Principles

1. **Null safety first** — leverage Kotlin's type system, avoid `!!`
2. **Structured concurrency** — always use CoroutineScope, never GlobalScope
3. **Immutability by default** — prefer `val`, data classes, sealed hierarchies
4. **Extension over inheritance** — extend behavior without subclassing
5. **Coroutines over threads** — suspend functions for async work

## Coroutines

### Structured Concurrency

```kotlin
class OrderService(private val scope: CoroutineScope) {
    suspend fun processOrder(orderId: String): OrderResult {
        return coroutineScope {
            val inventory = async { checkInventory(orderId) }
            val payment = async { validatePayment(orderId) }

            OrderResult(
                inventoryOk = inventory.await(),
                paymentOk = payment.await()
            )
        }
    }
}
```

### Suspend Functions and Context Switching

```kotlin
suspend fun fetchUserData(userId: String): User {
    return withContext(Dispatchers.IO) {
        val response = httpClient.get("/users/$userId")
        response.body<User>()
    }
}

suspend fun updateUI(user: User) {
    withContext(Dispatchers.Main) {
        binding.userName.text = user.name
    }
}
```

### Exception Handling

```kotlin
val handler = CoroutineExceptionHandler { _, exception ->
    logger.error("Coroutine failed: ${exception.message}", exception)
}

val job = scope.launch(handler + SupervisorJob()) {
    val results = listOf("a", "b", "c").map { id ->
        async {
            runCatching { fetchItem(id) }
        }
    }.awaitAll()

    val successes = results.mapNotNull { it.getOrNull() }
    val failures = results.mapNotNull { it.exceptionOrNull() }
}
```

## Kotlin Flow

### Cold Flow

```kotlin
fun observeOrders(): Flow<Order> = flow {
    while (true) {
        val orders = orderRepository.fetchPending()
        orders.forEach { emit(it) }
        delay(5_000)
    }
}.flowOn(Dispatchers.IO)
  .catch { e -> logger.error("Flow error", e) }

// Collecting
lifecycleScope.launch {
    observeOrders()
        .filter { it.status == Status.PENDING }
        .map { it.toUiModel() }
        .collect { model -> updateList(model) }
}
```

### StateFlow and SharedFlow

```kotlin
class UserViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(UiState.Loading)
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    private val _events = MutableSharedFlow<Event>(extraBufferCapacity = 1)
    val events: SharedFlow<Event> = _events.asSharedFlow()

    fun loadUser(id: String) {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            runCatching { userRepository.getUser(id) }
                .onSuccess { _uiState.value = UiState.Success(it) }
                .onFailure { _uiState.value = UiState.Error(it.message) }
        }
    }

    fun onAction(action: Action) {
        _events.tryEmit(Event.Navigate(action.route))
    }
}
```

## Null Safety

### Safe Calls and Elvis

```kotlin
// Chained safe calls
val cityName = user?.address?.city?.name ?: "Unknown"

// let for non-null operations
user?.email?.let { email ->
    sendNotification(email)
}

// require/check for preconditions
fun processOrder(order: Order?) {
    requireNotNull(order) { "Order must not be null" }
    check(order.items.isNotEmpty()) { "Order must have items" }
    // order is smart-cast to non-null
}
```

### Platform Types

```kotlin
// Java interop — annotate boundaries
fun processJavaResult(result: JavaService.Result) {
    // Explicitly handle potential null from Java
    val value: String = result.getValue() ?: throw IllegalStateException(
        "Expected non-null value from JavaService"
    )
}
```

## Data Classes and Sealed Classes

### Data Classes

```kotlin
data class User(
    val id: UserId,
    val name: String,
    val email: Email,
    val role: Role = Role.USER,
    val createdAt: Instant = Instant.now()
) {
    init {
        require(name.isNotBlank()) { "Name must not be blank" }
    }

    fun promote() = copy(role = Role.ADMIN)
}

// Destructuring
val (id, name, email) = user
```

### Sealed Classes for State

```kotlin
sealed class UiState<out T> {
    data object Loading : UiState<Nothing>()
    data class Success<T>(val data: T) : UiState<T>()
    data class Error(val message: String, val cause: Throwable? = null) : UiState<Nothing>()
}

// Exhaustive when
fun <T> render(state: UiState<T>) = when (state) {
    is UiState.Loading -> showSpinner()
    is UiState.Success -> showData(state.data)
    is UiState.Error -> showError(state.message)
}
```

### Sealed Interface for Domain Events

```kotlin
sealed interface DomainEvent {
    val occurredAt: Instant

    data class OrderPlaced(
        val orderId: String,
        override val occurredAt: Instant = Instant.now()
    ) : DomainEvent

    data class OrderShipped(
        val orderId: String,
        val trackingNumber: String,
        override val occurredAt: Instant = Instant.now()
    ) : DomainEvent

    data class OrderCancelled(
        val orderId: String,
        val reason: String,
        override val occurredAt: Instant = Instant.now()
    ) : DomainEvent
}
```

## DSL Builders

### Type-Safe Builder

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

    fun build() = "<html>${elements.joinToString("")}</html>"
}

fun html(block: HtmlBuilder.() -> Unit): String =
    HtmlBuilder().apply(block).build()

// Usage
val page = html {
    head { title("My Page") }
    body {
        h1("Welcome")
        p("Content here")
    }
}
```

### Configuration DSL

```kotlin
class ServerConfig {
    var host: String = "localhost"
    var port: Int = 8080
    private var _routes = mutableListOf<Route>()

    fun routing(block: RoutingBuilder.() -> Unit) {
        _routes += RoutingBuilder().apply(block).routes
    }

    val routes: List<Route> get() = _routes.toList()
}

fun server(block: ServerConfig.() -> Unit): Server {
    val config = ServerConfig().apply(block)
    return Server(config)
}

val app = server {
    host = "0.0.0.0"
    port = 9090
    routing {
        get("/health") { call -> call.respondText("OK") }
        get("/users") { call -> call.respond(userService.findAll()) }
    }
}
```

## Extension Functions

### Scope Functions Guide

```kotlin
// let — transform nullable or scoped result
val length = name?.let { it.trim().length }

// run — execute block on object, return result
val result = connection.run {
    prepareStatement(sql)
    executeQuery()
    fetchResults()
}

// apply — configure object, return self
val request = HttpRequest().apply {
    url = "https://api.example.com"
    method = "POST"
    headers["Authorization"] = "Bearer $token"
}

// also — side effects, return self
val user = createUser(dto).also {
    logger.info("Created user: ${it.id}")
    metrics.increment("users.created")
}
```

### Domain Extensions

```kotlin
fun String.toSlug(): String =
    lowercase()
        .replace(Regex("[^a-z0-9\\s-]"), "")
        .replace(Regex("\\s+"), "-")
        .trim('-')

suspend fun <T> List<T>.chunkedParallel(
    size: Int,
    dispatcher: CoroutineDispatcher = Dispatchers.Default,
    transform: suspend (T) -> Unit
) = withContext(dispatcher) {
    chunked(size).forEach { chunk ->
        chunk.map { async { transform(it) } }.awaitAll()
    }
}
```

## Spring Boot Integration

### Coroutine Controllers

```kotlin
@RestController
@RequestMapping("/api/users")
class UserController(private val userService: UserService) {

    @GetMapping("/{id}")
    suspend fun getUser(@PathVariable id: String): ResponseEntity<User> {
        val user = userService.findById(id) ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(user)
    }

    @PostMapping
    suspend fun createUser(@Valid @RequestBody dto: CreateUserDto): ResponseEntity<User> {
        val user = userService.create(dto)
        return ResponseEntity.status(HttpStatus.CREATED).body(user)
    }

    @GetMapping
    fun streamUsers(): Flow<User> = userService.findAllAsFlow()
}
```

### Constructor Injection

```kotlin
@Service
class OrderService(
    private val orderRepository: OrderRepository,
    private val paymentGateway: PaymentGateway,
    private val eventPublisher: ApplicationEventPublisher
) {
    @Transactional
    suspend fun placeOrder(dto: CreateOrderDto): Order {
        val order = orderRepository.save(dto.toEntity())
        paymentGateway.charge(order.total)
        eventPublisher.publishEvent(OrderPlacedEvent(order.id))
        return order
    }
}
```

## Testing

### MockK

```kotlin
class UserServiceTest {
    private val repository = mockk<UserRepository>()
    private val service = UserService(repository)

    @Test
    fun `should find user by id`() = runTest {
        val expected = User(id = "1", name = "Alice")
        coEvery { repository.findById("1") } returns expected

        val result = service.findById("1")

        assertEquals(expected, result)
        coVerify(exactly = 1) { repository.findById("1") }
    }

    @Test
    fun `should return null for missing user`() = runTest {
        coEvery { repository.findById(any()) } returns null

        val result = service.findById("unknown")

        assertNull(result)
    }
}
```

### Flow Testing with Turbine

```kotlin
@Test
fun `should emit loading then success`() = runTest {
    val viewModel = UserViewModel(FakeUserRepository())

    viewModel.uiState.test {
        assertEquals(UiState.Loading, awaitItem())

        viewModel.loadUser("1")
        assertEquals(UiState.Success(testUser), awaitItem())

        cancelAndConsumeRemainingEvents()
    }
}
```

### Coroutine Test Dispatchers

```kotlin
class OrderProcessorTest {
    @Test
    fun `should process orders concurrently`() = runTest {
        val processor = OrderProcessor(
            dispatcher = StandardTestDispatcher(testScheduler)
        )

        val result = processor.processAll(listOf("order-1", "order-2"))

        advanceUntilIdle()
        assertEquals(2, result.size)
        assertTrue(result.all { it.isSuccess })
    }
}
```

## Checklist

- [ ] No `!!` operator — use safe calls, elvis, or require/check
- [ ] All coroutines use structured concurrency (no GlobalScope)
- [ ] Flows collected in lifecycle-aware scope
- [ ] Data classes used for value objects
- [ ] Sealed classes for closed type hierarchies
- [ ] Extension functions used sparingly with clear naming
- [ ] Suspend functions use appropriate Dispatcher
- [ ] Tests use runTest and Turbine for Flow
