---
name: csharp-patterns
description: Modern C# 12 / .NET 8+ idioms, best practices, and conventions for building robust, efficient, and maintainable C# applications.
origin: ECC
---

# C# Development Patterns

Idiomatic C# 12 / .NET 8+ patterns and best practices for building robust, efficient, and maintainable applications.

## When to Activate

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

// Good: Record struct for value-type semantics (no heap allocation)
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

// Bad: Mutable class with public setters
public class UserDto
{
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
}
```

### 2. Nullable Reference Types

Enable globally and enforce null safety throughout the codebase.

```csharp
// In .csproj (enable for entire project)
// <Nullable>enable</Nullable>

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
    // Good: Use 'is not null' pattern
    if (input is not null)
    {
        Console.WriteLine(input.Length);
    }
}

// Bad: Using != null (works, but less idiomatic in pattern-matching context)
if (input != null) { }

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

// Good: Relational and logical patterns
public string ClassifyTemperature(double tempC) => tempC switch
{
    < -10          => "Extreme cold",
    >= -10 and < 0 => "Freezing",
    >= 0 and < 15  => "Cold",
    >= 15 and < 25 => "Comfortable",
    >= 25 and < 35 => "Warm",
    _              => "Hot",
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

// Bad: Long if-else chain
public decimal CalculateDiscount(Order order)
{
    if (order.Total > 1000 && order.Customer.IsPremium) return order.Total * 0.20m;
    else if (order.Total > 500 && order.Customer.IsPremium) return order.Total * 0.15m;
    else if (order.Total > 500) return order.Total * 0.10m;
    // ...
}
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
builder.Services.AddSingleton<ICache, RedisCache>();         // One instance for app lifetime
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
public class SmtpSettings
{
    public const string SectionName = "Smtp";
    public required string Host { get; init; }
    public required int Port { get; init; }
    public required string Username { get; init; }
}

builder.Services.Configure<SmtpSettings>(builder.Configuration.GetSection(SmtpSettings.SectionName));

public class EmailSender(IOptions<SmtpSettings> options)
{
    private readonly SmtpSettings _settings = options.Value;
}

// Bad: Service locator anti-pattern
public class OrderService
{
    public void DoWork()
    {
        var repo = ServiceLocator.Get<IOrderRepository>(); // Hidden dependency
    }
}

// Bad: Injecting IServiceProvider directly
public class OrderService(IServiceProvider provider)
{
    public void DoWork()
    {
        var repo = provider.GetRequiredService<IOrderRepository>();
    }
}
```

### 5. Async/Await

Follow async best practices for scalable, responsive applications.

```csharp
// Good: Async Task with CancellationToken propagation
public async Task<IReadOnlyList<Product>> GetProductsAsync(
    string category,
    CancellationToken ct = default)
{
    var products = await _repository.GetByCategoryAsync(category, ct);
    return products.ToList().AsReadOnly();
}

// Good: ValueTask for hot paths (avoids allocation when result is cached)
public ValueTask<User> GetUserAsync(int id, CancellationToken ct = default)
{
    if (_cache.TryGetValue(id, out var user))
    {
        return ValueTask.FromResult(user);
    }
    return new ValueTask<User>(LoadUserFromDbAsync(id, ct));
}

// Good: IAsyncEnumerable for streaming results
public async IAsyncEnumerable<LogEntry> StreamLogsAsync(
    [EnumeratorCancellation] CancellationToken ct = default)
{
    await foreach (var entry in _logSource.ReadAllAsync(ct))
    {
        yield return entry;
    }
}

// Good: Channel<T> for producer/consumer
public class MessageProcessor
{
    private readonly Channel<Message> _channel = Channel.CreateBounded<Message>(
        new BoundedChannelOptions(1000) { FullMode = BoundedChannelFullMode.Wait });

    public async ValueTask EnqueueAsync(Message msg, CancellationToken ct)
    {
        await _channel.Writer.WriteAsync(msg, ct);
    }

    public async Task ProcessAsync(CancellationToken ct)
    {
        await foreach (var msg in _channel.Reader.ReadAllAsync(ct))
        {
            await HandleMessageAsync(msg, ct);
        }
    }
}

// Good: ConfigureAwait(false) in library code
public async Task<byte[]> DownloadAsync(string url, CancellationToken ct)
{
    using var client = new HttpClient();
    var response = await client.GetAsync(url, ct).ConfigureAwait(false);
    return await response.Content.ReadAsByteArrayAsync(ct).ConfigureAwait(false);
}

// Bad: async void (fire-and-forget, exceptions crash the process)
public async void SaveData() // NEVER do this (except event handlers)
{
    await _repository.SaveAsync();
}

// Bad: Blocking on async code (deadlock risk)
public void GetData()
{
    var result = GetDataAsync().Result; // Deadlock in UI/ASP.NET contexts
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

// Good: Avoid multiple enumeration
var expensiveQuery = _repository.GetAll(); // IEnumerable — deferred
var materialized = expensiveQuery.ToList(); // Materialize once
var count = materialized.Count;
var first = materialized.FirstOrDefault();

// Good: FrozenDictionary for repeated lookups
var userLookup = users
    .ToFrozenDictionary(u => u.Id, u => u);
var user = userLookup[targetId]; // O(1) lookup, optimized for reads

// Good: Chunk for batch processing
foreach (var batch in records.Chunk(100))
{
    await _repository.BulkInsertAsync(batch, ct);
}

// Bad: Multiple enumeration of IEnumerable
IEnumerable<Order> orders = _repository.GetAll();
var count = orders.Count();          // Enumerates once
var total = orders.Sum(o => o.Total); // Enumerates again — wasteful

// Bad: Deferred execution surprise
IEnumerable<Order> query = orders.Where(o => o.Total > 100);
orders.Add(new Order { Total = 200 }); // Modifying source
var result = query.ToList(); // Includes newly added order — surprising
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

public class InsufficientStockException(string productId, int requested, int available)
    : DomainException($"Insufficient stock for '{productId}': requested {requested}, available {available}.")
{
    public string ProductId { get; } = productId;
    public int Requested { get; } = requested;
    public int Available { get; } = available;
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
public Result<Order> CreateOrder(OrderRequest request)
{
    if (string.IsNullOrWhiteSpace(request.CustomerId))
        return new Result<Order>.Failure("Customer ID is required.");

    var order = Order.Create(request);
    return new Result<Order>.Success(order);
}

var message = CreateOrder(request).Match(
    onSuccess: order => $"Order {order.Id} created.",
    onFailure: error => $"Failed: {error}");

// Good: ProblemDetails for API error responses
app.UseExceptionHandler(appBuilder =>
{
    appBuilder.Run(async context =>
    {
        var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;
        var problemDetails = exception switch
        {
            OrderNotFoundException e => new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Order Not Found",
                Detail = e.Message,
            },
            InsufficientStockException e => new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "Insufficient Stock",
                Detail = e.Message,
            },
            _ => new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal Server Error",
                Detail = "An unexpected error occurred.",
            },
        };

        context.Response.StatusCode = problemDetails.Status ?? 500;
        await context.Response.WriteAsJsonAsync(problemDetails);
    });
});
```

### 8. Project Organization

Structure .NET solutions for maintainability with clear layer separation.

```text
MyApp/
├── src/
│   ├── MyApp.Api/                   # Presentation layer
│   │   ├── Controllers/             # API controllers (or Endpoints/)
│   │   ├── Filters/                 # Action/exception filters
│   │   ├── Middleware/              # Custom middleware
│   │   ├── Program.cs               # App entry point
│   │   └── MyApp.Api.csproj
│   ├── MyApp.Application/           # Use cases / orchestration
│   │   ├── Orders/
│   │   │   ├── CreateOrderCommand.cs
│   │   │   ├── CreateOrderHandler.cs
│   │   │   └── GetOrderQuery.cs
│   │   ├── Interfaces/              # Port interfaces
│   │   └── MyApp.Application.csproj
│   ├── MyApp.Domain/                # Core business logic (no dependencies)
│   │   ├── Entities/
│   │   ├── ValueObjects/
│   │   ├── Exceptions/
│   │   └── MyApp.Domain.csproj
│   └── MyApp.Infrastructure/        # External concerns (DB, APIs, etc.)
│       ├── Persistence/
│       ├── ExternalServices/
│       └── MyApp.Infrastructure.csproj
├── tests/
│   ├── MyApp.UnitTests/
│   ├── MyApp.IntegrationTests/
│   └── MyApp.ArchitectureTests/
├── Directory.Build.props             # Shared MSBuild properties
├── Directory.Packages.props          # Central package management
└── MyApp.sln
```

```xml
<!-- Directory.Build.props — shared across all projects -->
<Project>
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
  </PropertyGroup>
</Project>

<!-- Directory.Packages.props — central package version management -->
<Project>
  <PropertyGroup>
    <ManagePackageVersionsCentrally>true</ManagePackageVersionsCentrally>
  </PropertyGroup>
  <ItemGroup>
    <PackageVersion Include="Microsoft.EntityFrameworkCore" Version="8.0.4" />
    <PackageVersion Include="Serilog" Version="3.1.1" />
    <PackageVersion Include="FluentValidation" Version="11.9.0" />
  </ItemGroup>
</Project>
```

### 9. Minimal API vs Controllers

Choose the right hosting model for your endpoints.

```csharp
// Minimal API — best for small services, microservices, simple CRUD
var app = builder.Build();

var orders = app.MapGroup("/api/orders")
    .WithTags("Orders")
    .RequireAuthorization();

orders.MapGet("/", async (IOrderRepository repo, CancellationToken ct) =>
{
    var all = await repo.GetAllAsync(ct);
    return TypedResults.Ok(all);
});

orders.MapGet("/{id:guid}", async (Guid id, IOrderRepository repo, CancellationToken ct) =>
{
    var order = await repo.FindByIdAsync(id, ct);
    return order is not null
        ? TypedResults.Ok(order)
        : TypedResults.NotFound();
});

orders.MapPost("/", async (CreateOrderRequest request, IOrderService service, CancellationToken ct) =>
{
    var order = await service.CreateAsync(request, ct);
    return TypedResults.Created($"/api/orders/{order.Id}", order);
});

// Endpoint filter (middleware for a route group)
orders.AddEndpointFilter(async (context, next) =>
{
    var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
    logger.LogInformation("Processing order request");
    return await next(context);
});

// Controller — best for complex APIs with many actions, versioning, OData
[ApiController]
[Route("api/[controller]")]
public class ProductsController(IProductService productService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<IReadOnlyList<ProductDto>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var products = await productService.GetAllAsync(ct);
        return Ok(products);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType<ProductDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var product = await productService.FindByIdAsync(id, ct);
        return product is not null ? Ok(product) : NotFound();
    }
}
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

    [Range(1, 300)]
    public int CommandTimeoutSeconds { get; init; } = 30;
}

// Registration with validation
builder.Services
    .AddOptionsWithValidateOnStart<DatabaseSettings>()
    .BindConfiguration(DatabaseSettings.SectionName)
    .ValidateDataAnnotations();

// Good: IOptionsSnapshot for scoped (reloadable) config
public class ReportService(IOptionsSnapshot<ReportSettings> options)
{
    public void Generate()
    {
        var settings = options.Value; // Re-reads on each scope (request)
    }
}

// Good: IOptionsMonitor for singleton services that need live reload
public class BackgroundWorker(IOptionsMonitor<WorkerSettings> monitor) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        while (!ct.IsCancellationRequested)
        {
            var settings = monitor.CurrentValue; // Always up-to-date
            await Task.Delay(TimeSpan.FromSeconds(settings.IntervalSeconds), ct);
        }
    }
}

// appsettings.json
// {
//   "Database": {
//     "ConnectionString": "Host=localhost;Database=myapp",
//     "MaxPoolSize": 20,
//     "CommandTimeoutSeconds": 30
//   }
// }

// Environment-specific: appsettings.Development.json overrides
builder.Configuration
    .AddJsonFile("appsettings.json", optional: false)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true)
    .AddEnvironmentVariables();
```

## Quick Reference: C# 12 / .NET 8 Idioms

| Pattern | When to Use | Example |
|---|---|---|
| `record` / `record struct` | Immutable data transfer objects | `record UserDto(string Name, string Email);` |
| Primary constructors | DI in classes and structs | `class Svc(IRepo repo) : ISvc { }` |
| `required` properties | Enforce initialization at compile time | `public required string Name { get; init; }` |
| Switch expressions | Multi-branch value mapping | `shape switch { Circle c => ..., _ => ... }` |
| List patterns | Matching on collection shape | `[1, .., var last] => ...` |
| `FrozenDictionary` | Read-heavy lookup tables | `dict.ToFrozenDictionary()` |
| `IAsyncEnumerable<T>` | Streaming async data | `await foreach (var x in stream)` |
| `Channel<T>` | Producer/consumer pipelines | `Channel.CreateBounded<T>(100)` |
| `Result<T>` | Error handling without exceptions | `new Result<T>.Success(value)` |
| `TypedResults` | Strongly-typed Minimal API responses | `TypedResults.Ok(data)` |
| `IOptions<T>` | Strongly-typed configuration | `IOptions<SmtpSettings> options` |
| Keyed services | Multiple registrations of same interface | `[FromKeyedServices("key")]` |

## Anti-Patterns

```csharp
// 1. async void — unobserved exceptions crash the process
async void OnButtonClick() { await SaveAsync(); }
// Fix: Use async Task. Only use async void for UI event handlers.

// 2. Blocking on async code — causes deadlocks
var result = GetDataAsync().Result;
var result2 = GetDataAsync().GetAwaiter().GetResult();
// Fix: Use await all the way up the call stack.

// 3. Capturing loop variables in closures (pre-C# 5 habit, but still a gotcha with Parallel)
for (int i = 0; i < 10; i++)
{
    Task.Run(() => Console.WriteLine(i)); // May print unexpected values
}
// Fix: Use Parallel.For or capture explicitly: var local = i;

// 4. Service Locator pattern — hides dependencies, untestable
var service = ServiceLocator.Get<IOrderService>();
// Fix: Use constructor injection with DI container.

// 5. Throwing Exception base type — loses specificity
throw new Exception("Something went wrong");
// Fix: Throw specific exception types (InvalidOperationException, ArgumentException, custom).

// 6. Swallowing exceptions silently
try { DoWork(); } catch { }
// Fix: At minimum, log the exception. Prefer specific catch clauses.

// 7. Mutable DTOs with public setters
public class OrderDto { public string Id { get; set; } = ""; }
// Fix: Use records or init-only setters for immutability.

// 8. String concatenation in hot paths
var result = "";
foreach (var item in items) { result += item.ToString(); }
// Fix: Use StringBuilder or string.Join.

// 9. Not propagating CancellationToken
public async Task<Data> GetDataAsync() { await _repo.LoadAsync(); }
// Fix: Accept and pass CancellationToken through the entire call chain.

// 10. Using IServiceProvider directly in application code
public class MyService(IServiceProvider sp) { }
// Fix: Inject the specific dependency, not the container.
```

**Remember**: Modern C# is expressive, type-safe, and immutable by default. Use records for data, primary constructors for DI, pattern matching for branching, and async/await for all I/O. Let the compiler and runtime work for you.
