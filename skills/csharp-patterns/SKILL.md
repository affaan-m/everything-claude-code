---
name: csharp-patterns
description: Modern C# 12 / .NET 8+ idioms, best practices, and conventions for building robust, efficient, and maintainable C# applications.
origin: ECC
---

# C# Development Patterns

Idiomatic C# 12 / .NET 8+ patterns and best practices for building robust, efficient, and maintainable applications.

## When to Use

- Writing new C# code or .NET projects
- Reviewing C# code for idiom compliance
- Refactoring legacy C# to modern standards
- Designing .NET solution architecture
- Migrating from older .NET Framework to .NET 8+

## Core Principles

### 1. Records & Immutability

Prefer immutable data structures. Use records, `init`-only setters, and immutable collections.

```csharp
// Good: Record type for immutable data
public record UserDto(string Name, string Email, DateOnly JoinDate);

// Good: Record struct for value-type semantics (typically avoids heap allocation unless boxed)
public readonly record struct Coordinate(double Latitude, double Longitude);

// Good: Init-only and required properties
public class AppSettings
{
    public required string ConnectionString { get; init; }
    public required int MaxRetries { get; init; }
    public TimeSpan Timeout { get; init; } = TimeSpan.FromSeconds(30);
}

// Good: Immutable collections
using System.Collections.Frozen;
using System.Collections.Immutable;

var lookup = new Dictionary<string, int> { ["a"] = 1, ["b"] = 2 }
    .ToFrozenDictionary();                          // Optimized for reads
var items = ImmutableArray.Create(1, 2, 3);         // Thread-safe, no mutation

// Good: Non-destructive mutation with `with`
var original = new UserDto("Alice", "alice@example.com", DateOnly.FromDateTime(DateTime.Now));
var updated = original with { Email = "newalice@example.com" };
```

### 2. Nullable Reference Types

Enable globally and enforce null safety throughout the codebase.

```csharp
// In .csproj: <Nullable>enable</Nullable>

// Good: Guard clauses with ThrowIfNull
public class OrderService(IOrderRepository repository, ILogger<OrderService> logger)
{
    public Order GetOrder(string orderId)
    {
        ArgumentNullException.ThrowIfNull(orderId);
        ArgumentException.ThrowIfNullOrWhiteSpace(orderId);

        return repository.FindById(orderId)
            ?? throw new OrderNotFoundException(orderId);
    }
}

// Good: Nullable annotations on signatures
public string? FindDisplayName(int userId) { /* may return null */ }

public void Process(string? input)
{
    if (input is not null) { Console.WriteLine(input.Length); }
}

// Bad: Suppressing nullability without reason
string name = GetName()!; // Avoid the null-forgiving operator unless truly justified
```

### 3. Pattern Matching

Use switch expressions and patterns to replace complex conditional logic.

```csharp
// Good: Switch expression with property patterns
public decimal CalculateDiscount(Order order) => order switch
{
    { Total: > 1000, Customer.IsPremium: true } => order.Total * 0.20m,
    { Total: > 500, Customer.IsPremium: true }  => order.Total * 0.15m,
    { Total: > 500 }                            => order.Total * 0.10m,
    { Total: > 100 }                            => order.Total * 0.05m,
    _                                           => 0m,
};

// Good: List patterns (C# 11+)
public string DescribeSequence(int[] values) => values switch
{
    []              => "Empty",
    [var single]    => $"Single: {single}",
    [var a, var b]  => $"Pair: {a}, {b}",
    [1, .., var last] => $"Starts with 1, ends with {last}",
    _               => $"Sequence of {values.Length}",
};

// Good: Type pattern replacing is + cast
public double CalculateArea(Shape shape) => shape switch
{
    Circle c    => Math.PI * c.Radius * c.Radius,
    Rectangle r => r.Width * r.Height,
    Triangle t  => 0.5 * t.Base * t.Height,
    _           => throw new ArgumentException($"Unknown shape: {shape.GetType().Name}"),
};
```

### 4. Dependency Injection

Use constructor injection with primary constructors (C# 12) and proper service lifetimes.

```csharp
// Good: Primary constructor injection (C# 12)
public class OrderService(
    IOrderRepository repository,
    IPaymentGateway paymentGateway,
    ILogger<OrderService> logger) : IOrderService
{
    public async Task<OrderResult> PlaceOrderAsync(OrderRequest request, CancellationToken ct)
    {
        logger.LogInformation("Placing order for {CustomerId}", request.CustomerId);
        var order = Order.Create(request);
        await repository.SaveAsync(order, ct);
        var payment = await paymentGateway.ChargeAsync(order.Total, ct);
        return new OrderResult(order.Id, payment.TransactionId);
    }
}

// Good: Service registration with proper lifetimes
builder.Services.AddSingleton<ICache, RedisCache>();             // One instance for app lifetime
builder.Services.AddScoped<IOrderRepository, OrderRepository>(); // One per HTTP request
builder.Services.AddTransient<IEmailSender, SmtpEmailSender>();  // New instance every time

// Good: Keyed services (.NET 8)
builder.Services.AddKeyedSingleton<INotifier, EmailNotifier>("email");
builder.Services.AddKeyedSingleton<INotifier, SmsNotifier>("sms");

public class AlertService([FromKeyedServices("sms")] INotifier notifier)
{
    public Task SendAlert(string message) => notifier.NotifyAsync(message);
}

// Good: IOptions<T> for configuration binding
builder.Services.Configure<SmtpSettings>(builder.Configuration.GetSection(SmtpSettings.SectionName));

public class EmailSender(IOptions<SmtpSettings> options)
{
    private readonly SmtpSettings _settings = options.Value;
}
```

### 5. Async/Await

Follow async best practices for scalable, responsive applications.

```csharp
// Good: Async Task with CancellationToken propagation
public async Task<IReadOnlyList<Product>> GetProductsAsync(
    string category, CancellationToken ct = default)
{
    var products = await _repository.GetByCategoryAsync(category, ct);
    return products.ToList().AsReadOnly();
}

// Good: ValueTask for hot paths (avoids allocation when result is cached)
public ValueTask<User> GetUserAsync(int id, CancellationToken ct = default)
{
    if (_cache.TryGetValue(id, out var user))
        return ValueTask.FromResult(user);
    return new ValueTask<User>(LoadUserFromDbAsync(id, ct));
}

// Good: IAsyncEnumerable for streaming results
public async IAsyncEnumerable<LogEntry> StreamLogsAsync(
    [EnumeratorCancellation] CancellationToken ct = default)
{
    await foreach (var entry in _logSource.ReadAllAsync(ct))
        yield return entry;
}

// Good: ConfigureAwait(false) in library code (inject HttpClient via IHttpClientFactory)
public class DownloadService(IHttpClientFactory httpClientFactory)
{
    public async Task<byte[]> DownloadAsync(string url, CancellationToken ct)
    {
        using var client = httpClientFactory.CreateClient();
        var response = await client.GetAsync(url, ct).ConfigureAwait(false);
        return await response.Content.ReadAsByteArrayAsync(ct).ConfigureAwait(false);
    }
}
```

### 6. LINQ Best Practices

Write expressive queries while avoiding common performance pitfalls.

```csharp
// Good: Method syntax for complex queries
var topCustomers = orders
    .Where(o => o.Status == OrderStatus.Completed)
    .GroupBy(o => o.CustomerId)
    .Select(g => new
    {
        CustomerId = g.Key,
        TotalSpent = g.Sum(o => o.Total),
        OrderCount = g.Count(),
    })
    .OrderByDescending(c => c.TotalSpent)
    .Take(10)
    .ToList(); // Materialize once

// Good: Avoid multiple enumeration — materialize first
var materialized = expensiveQuery.ToList();
var count = materialized.Count;
var first = materialized.FirstOrDefault();

// Good: FrozenDictionary for repeated lookups
var userLookup = users.ToFrozenDictionary(u => u.Id, u => u);

// Good: Chunk for batch processing
foreach (var batch in records.Chunk(100))
    await _repository.BulkInsertAsync(batch, ct);
```

### 7. Error Handling

Use structured error handling with clear exception hierarchies and result types.

```csharp
// Good: Custom exception hierarchy
public abstract class DomainException(string message, Exception? inner = null)
    : Exception(message, inner);

public class OrderNotFoundException(string orderId)
    : DomainException($"Order '{orderId}' was not found.")
{
    public string OrderId { get; } = orderId;
}

// Good: Result<T> pattern (discriminated-union style)
public abstract record Result<T>
{
    public record Success(T Value) : Result<T>;
    public record Failure(string Error) : Result<T>;

    public TOut Match<TOut>(Func<T, TOut> onSuccess, Func<string, TOut> onFailure) =>
        this switch
        {
            Success s => onSuccess(s.Value),
            Failure f => onFailure(f.Error),
            _ => throw new InvalidOperationException(),
        };
}

// Usage
var message = CreateOrder(request).Match(
    onSuccess: order => $"Order {order.Id} created.",
    onFailure: error => $"Failed: {error}");
```

### 8. Project Organization

Structure .NET solutions for maintainability with clear layer separation.

```text
MyApp/
├── src/
│   ├── MyApp.Api/                   # Presentation layer (Controllers or Endpoints)
│   ├── MyApp.Application/           # Use cases / orchestration (Commands, Queries, Handlers)
│   ├── MyApp.Domain/                # Core business logic (no dependencies)
│   └── MyApp.Infrastructure/        # External concerns (DB, APIs, etc.)
├── tests/
│   ├── MyApp.UnitTests/
│   ├── MyApp.IntegrationTests/
│   └── MyApp.ArchitectureTests/
├── Directory.Build.props             # Shared MSBuild properties
├── Directory.Packages.props          # Central package management
└── MyApp.sln
```

### 9. Minimal API

Choose the right hosting model for your endpoints.

```csharp
// Minimal API — best for small services, microservices, simple CRUD
var orders = app.MapGroup("/api/orders")
    .WithTags("Orders")
    .RequireAuthorization();

orders.MapGet("/", async (IOrderRepository repo, CancellationToken ct) =>
    TypedResults.Ok(await repo.GetAllAsync(ct)));

orders.MapGet("/{id:guid}", async (Guid id, IOrderRepository repo, CancellationToken ct) =>
{
    var order = await repo.FindByIdAsync(id, ct);
    return order is not null ? TypedResults.Ok(order) : TypedResults.NotFound();
});

orders.MapPost("/", async (CreateOrderRequest request, IOrderService service, CancellationToken ct) =>
{
    var order = await service.CreateAsync(request, ct);
    return TypedResults.Created($"/api/orders/{order.Id}", order);
});
```

### 10. Configuration

Use strongly-typed, validated configuration with the Options pattern.

```csharp
// Good: Strongly-typed settings with validation
public class DatabaseSettings
{
    public const string SectionName = "Database";

    [Required]
    public required string ConnectionString { get; init; }

    [Range(1, 100)]
    public int MaxPoolSize { get; init; } = 20;
}

// Registration with validation — fails fast at startup if misconfigured
builder.Services
    .AddOptionsWithValidateOnStart<DatabaseSettings>()
    .BindConfiguration(DatabaseSettings.SectionName)
    .ValidateDataAnnotations();

// Use IOptions<T> in singletons, IOptionsSnapshot<T> for scoped (reloadable),
// IOptionsMonitor<T> for singletons needing live reload
public class ReportService(IOptionsSnapshot<ReportSettings> options)
{
    public void Generate() { var settings = options.Value; }
}
```

**Remember**: Modern C# is expressive, type-safe, and immutable by default. Use records for data, primary constructors for DI, pattern matching for branching, and async/await for all I/O. Let the compiler and runtime work for you.
