---
name: csharp-patterns
description: Idiomatic C# and .NET patterns for building robust, performant, and maintainable applications with async/await, LINQ, dependency injection, EF Core, ASP.NET Core, MediatR/CQRS, middleware, background services, and channels.
origin: ECC
---

# C# Development Patterns

Idiomatic C# and .NET patterns and best practices for building robust, performant, and maintainable applications.

## When to Use

- Writing new C# code
- Reviewing C# code
- Refactoring existing .NET applications
- Designing ASP.NET Core APIs or services
- Working with EF Core and data access
- Implementing CQRS, event-driven, or background processing patterns

## How It Works

This skill covers twelve key areas: immutability via records and `init` setters, async/await with proper cancellation and error handling, dependency injection with correct lifetime management, EF Core patterns for efficient data access, LINQ best practices, the Options pattern for configuration, ASP.NET Core minimal APIs and middleware, CQRS with MediatR, background services with hosted workers, channels for producer-consumer patterns, guard clauses for defensive programming, and structured error handling.

## Examples

**Immutable models with records:**
```csharp
public sealed record CreateOrderRequest(
    Guid CustomerId,
    IReadOnlyList<OrderLineRequest> Lines);

public sealed record OrderLineRequest(
    Guid ProductId,
    int Quantity);
```

**Async service with cancellation:**
```csharp
public async Task<Order> GetOrderAsync(
    Guid orderId,
    CancellationToken cancellationToken)
{
    return await context.Orders
        .Include(o => o.Lines)
        .AsNoTracking()
        .FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken)
        ?? throw new OrderNotFoundException(orderId);
}
```

**Result pattern for domain operations:**
```csharp
public abstract record Result<T>
{
    public sealed record Success(T Value) : Result<T>;
    public sealed record Failure(string Error) : Result<T>;

    public TOut Match<TOut>(Func<T, TOut> onSuccess, Func<string, TOut> onFailure) =>
        this switch
        {
            Success s => onSuccess(s.Value),
            Failure f => onFailure(f.Error),
            _ => throw new InvalidOperationException()
        };
}
```

## Core Principles

### 1. Immutability

Prefer immutable types for data models and shared state.

```csharp
// Good: Immutable record with positional parameters
public sealed record UserProfile(string Name, string Email);

// Good: Update via with-expression (creates new instance)
var updated = profile with { Name = "New Name" };

// Good: Immutable collection
public IReadOnlyList<Order> Orders { get; init; } = Array.Empty<Order>();

// Good: Frozen collections for long-lived lookup data
var lookup = items.ToFrozenDictionary(x => x.Id);

// Bad: Mutable class with public setters
public class UserProfile
{
    public string Name { get; set; } // Avoid
}
```

### 2. Async/Await

Always use async/await for I/O-bound operations. Never block on async code.

```csharp
// Good: Proper async with cancellation
public async Task<IReadOnlyList<Product>> SearchAsync(
    string query,
    CancellationToken cancellationToken)
{
    return await context.Products
        .Where(p => p.Name.Contains(query))
        .OrderBy(p => p.Name)
        .Take(50)
        .AsNoTracking()
        .ToListAsync(cancellationToken);
}

// Bad: Blocking on async — deadlock risk
public List<Product> Search(string query)
{
    return context.Products
        .Where(p => p.Name.Contains(query))
        .ToListAsync().Result; // NEVER do this
}

// Good: Parallel async operations
public async Task<Dashboard> LoadDashboardAsync(CancellationToken cancellationToken)
{
    var ordersTask = orderService.GetRecentAsync(cancellationToken);
    var metricsTask = metricsService.GetSummaryAsync(cancellationToken);

    await Task.WhenAll(ordersTask, metricsTask);

    return new Dashboard(ordersTask.Result, metricsTask.Result);
}

// Good: Async streams for large data sets
public async IAsyncEnumerable<Order> StreamOrdersAsync(
    [EnumeratorCancellation] CancellationToken cancellationToken)
{
    await foreach (var order in context.Orders.AsAsyncEnumerable()
        .WithCancellation(cancellationToken))
    {
        yield return order;
    }
}
```

### 3. Dependency Injection

Use constructor injection and register services with correct lifetimes.

```csharp
// Good: Primary constructor injection (C# 12)
public sealed class OrderService(
    IOrderRepository repository,
    ILogger<OrderService> logger)
{
    public async Task<Order> CreateAsync(
        CreateOrderRequest request,
        CancellationToken cancellationToken)
    {
        logger.LogInformation("Creating order for customer {CustomerId}", request.CustomerId);
        var order = Order.Create(request);
        return await repository.AddAsync(order, cancellationToken);
    }
}

// Good: Registration with correct lifetimes
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<OrderService>();
builder.Services.AddSingleton<ICacheService, RedisCacheService>();

// Good: Keyed services (C# 12 / .NET 8)
builder.Services.AddKeyedSingleton<INotificationSender, EmailSender>("email");
builder.Services.AddKeyedSingleton<INotificationSender, SmsSender>("sms");

public sealed class NotificationService(
    [FromKeyedServices("email")] INotificationSender emailSender,
    [FromKeyedServices("sms")] INotificationSender smsSender)
{ }

// Good: Singleton safely accessing scoped services
public sealed class BackgroundOrderProcessor(IServiceScopeFactory scopeFactory)
{
    public async Task ProcessAsync(Guid orderId, CancellationToken cancellationToken)
    {
        await using var scope = scopeFactory.CreateAsyncScope();
        var repository = scope.ServiceProvider.GetRequiredService<IOrderRepository>();
        var order = await repository.FindByIdAsync(orderId, cancellationToken);
        // process...
    }
}

// Bad: Captive dependency — singleton holds scoped service
builder.Services.AddSingleton<ReportGenerator>(); // holds scoped DbContext!
```

### 4. EF Core Patterns

Use EF Core efficiently with proper query patterns.

```csharp
// Good: Projection to DTO (avoids loading entire entity)
public async Task<IReadOnlyList<OrderSummaryDto>> GetSummariesAsync(
    Guid customerId,
    CancellationToken cancellationToken)
{
    return await context.Orders
        .Where(o => o.CustomerId == customerId)
        .Select(o => new OrderSummaryDto(
            o.Id,
            o.CreatedAt,
            o.Lines.Sum(l => l.Quantity * l.UnitPrice)))
        .AsNoTracking()
        .ToListAsync(cancellationToken);
}

// Good: Paginated query
public async Task<PagedResult<OrderDto>> GetPagedAsync(
    int page, int pageSize, CancellationToken cancellationToken)
{
    var query = context.Orders.AsNoTracking();
    var totalCount = await query.CountAsync(cancellationToken);

    var items = await query
        .OrderByDescending(o => o.CreatedAt)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(o => new OrderDto(o.Id, o.Total, o.CreatedAt))
        .ToListAsync(cancellationToken);

    return new PagedResult<OrderDto>(items, totalCount, page, pageSize);
}

// Good: Explicit transaction for multi-step writes
await using var transaction = await context.Database
    .BeginTransactionAsync(cancellationToken);
try
{
    context.Orders.Add(order);
    await context.SaveChangesAsync(cancellationToken);

    await paymentService.ChargeAsync(order.Total, cancellationToken);
    await transaction.CommitAsync(cancellationToken);
}
catch
{
    await transaction.RollbackAsync(cancellationToken);
    throw;
}

// Good: Compiled queries for hot paths
private static readonly Func<AppDbContext, Guid, CancellationToken, Task<Order?>> FindOrderById =
    EF.CompileAsyncQuery((AppDbContext ctx, Guid id, CancellationToken ct) =>
        ctx.Orders
            .Include(o => o.Lines)
            .FirstOrDefault(o => o.Id == id));

// Good: Repository pattern
public interface IOrderRepository
{
    Task<Order?> FindByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<IReadOnlyList<Order>> FindByCustomerAsync(Guid customerId, CancellationToken cancellationToken);
    Task<Order> AddAsync(Order order, CancellationToken cancellationToken);
}
```

### 5. LINQ Best Practices

```csharp
// Good: Chain operations efficiently
var activeUserEmails = users
    .Where(u => u.IsActive && u.EmailVerified)
    .OrderBy(u => u.LastName)
    .Select(u => u.Email)
    .ToList();

// Good: Use Any() instead of Count() > 0
if (orders.Any(o => o.Status == OrderStatus.Pending))
{
    // process...
}

// Good: First/Single with predicate
var admin = users.FirstOrDefault(u => u.Role == Role.Admin);
var defaultUser = users.SingleOrDefault(u => u.IsDefault)
    ?? throw new InvalidOperationException("No default user configured");

// Good: GroupBy with projection
var ordersByCustomer = orders
    .GroupBy(o => o.CustomerId)
    .Select(g => new CustomerOrderSummary(
        g.Key,
        g.Count(),
        g.Sum(o => o.Total)))
    .ToList();

// Good: SelectMany for flattening
var allTags = articles
    .SelectMany(a => a.Tags)
    .Distinct()
    .OrderBy(t => t)
    .ToList();

// Good: Chunk for batch processing
foreach (var batch in items.Chunk(100))
{
    await ProcessBatchAsync(batch, cancellationToken);
}

// Bad: Multiple enumeration
var filtered = items.Where(x => x.IsActive); // deferred
var count = filtered.Count(); // enumerates
var list = filtered.ToList(); // enumerates AGAIN

// Good: Materialize once
var filtered = items.Where(x => x.IsActive).ToList();
var count = filtered.Count; // property, no re-enumeration
```

### 6. Options Pattern

Use strongly typed configuration with validation.

```csharp
// Good: Strongly typed options with validation
public sealed class SmtpOptions
{
    public const string SectionName = "Smtp";

    [Required]
    public required string Host { get; init; }

    [Range(1, 65535)]
    public required int Port { get; init; }

    [Required]
    public required string FromAddress { get; init; }

    public bool UseSsl { get; init; } = true;
}

// Registration with validation
builder.Services
    .AddOptions<SmtpOptions>()
    .BindConfiguration(SmtpOptions.SectionName)
    .ValidateDataAnnotations()
    .ValidateOnStart();

// Injection — use IOptions<T> for singleton, IOptionsSnapshot<T> for scoped
public sealed class EmailService(IOptions<SmtpOptions> options)
{
    private readonly SmtpOptions _smtp = options.Value;
}

// Good: IOptionsMonitor<T> for runtime config changes
public sealed class FeatureFlagService(IOptionsMonitor<FeatureFlags> monitor)
{
    public bool IsEnabled(string flag) => monitor.CurrentValue.EnabledFlags.Contains(flag);
}
```

### 7. Minimal APIs

Use ASP.NET Core minimal APIs for lightweight endpoints.

```csharp
// Good: Structured minimal API with typed results
var orders = app.MapGroup("/api/orders")
    .RequireAuthorization()
    .WithTags("Orders");

orders.MapGet("/", async (
    [AsParameters] PaginationQuery query,
    IOrderRepository repository,
    CancellationToken cancellationToken) =>
{
    var result = await repository.GetPagedAsync(query.Page, query.PageSize, cancellationToken);
    return TypedResults.Ok(result);
});

orders.MapGet("/{id:guid}", async (
    Guid id,
    IOrderRepository repository,
    CancellationToken cancellationToken) =>
{
    var order = await repository.FindByIdAsync(id, cancellationToken);
    return order is not null
        ? TypedResults.Ok(order)
        : TypedResults.NotFound();
})
.WithName("GetOrderById");

orders.MapPost("/", async (
    CreateOrderRequest request,
    OrderService service,
    CancellationToken cancellationToken) =>
{
    var order = await service.CreateAsync(request, cancellationToken);
    return TypedResults.Created($"/api/orders/{order.Id}", order);
})
.AddEndpointFilter<ValidationFilter<CreateOrderRequest>>();

// Good: Parameter binding record
public sealed record PaginationQuery(int Page = 1, int PageSize = 20);
```

### 8. Middleware

Build custom middleware for cross-cutting concerns.

```csharp
// Good: Convention-based middleware
public sealed class RequestTimingMiddleware(
    RequestDelegate next,
    ILogger<RequestTimingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();

        try
        {
            await next(context);
        }
        finally
        {
            stopwatch.Stop();
            logger.LogInformation(
                "Request {Method} {Path} completed in {ElapsedMs}ms with status {StatusCode}",
                context.Request.Method,
                context.Request.Path,
                stopwatch.ElapsedMilliseconds,
                context.Response.StatusCode);
        }
    }
}

// Registration
app.UseMiddleware<RequestTimingMiddleware>();

// Good: Endpoint filter (minimal API middleware equivalent)
public sealed class ValidationFilter<T> : IEndpointFilter where T : class
{
    public async ValueTask<object?> InvokeAsync(
        EndpointFilterInvocationContext context,
        EndpointFilterDelegate next)
    {
        var argument = context.Arguments.OfType<T>().FirstOrDefault();
        if (argument is null)
            return TypedResults.BadRequest("Request body is required");

        var validationContext = new ValidationContext(argument);
        var results = new List<ValidationResult>();

        if (!Validator.TryValidateObject(argument, validationContext, results, validateAllProperties: true))
            return TypedResults.BadRequest(results.Select(r => r.ErrorMessage));

        return await next(context);
    }
}
```

### 9. CQRS with MediatR

Separate reads from writes for complex domains.

```csharp
// Command
public sealed record CreateOrderCommand(
    Guid CustomerId,
    IReadOnlyList<OrderLineRequest> Lines) : IRequest<Result<OrderDto>>;

// Command handler
public sealed class CreateOrderHandler(
    IOrderRepository repository,
    IEventBus eventBus,
    ILogger<CreateOrderHandler> logger)
    : IRequestHandler<CreateOrderCommand, Result<OrderDto>>
{
    public async Task<Result<OrderDto>> Handle(
        CreateOrderCommand command,
        CancellationToken cancellationToken)
    {
        var order = Order.Create(command.CustomerId, command.Lines);

        await repository.AddAsync(order, cancellationToken);
        await eventBus.PublishAsync(new OrderCreatedEvent(order.Id), cancellationToken);

        logger.LogInformation("Order {OrderId} created", order.Id);
        return new Result<OrderDto>.Success(OrderDto.From(order));
    }
}

// Query
public sealed record GetOrderByIdQuery(Guid OrderId) : IRequest<OrderDto?>;

// Query handler
public sealed class GetOrderByIdHandler(IOrderRepository repository)
    : IRequestHandler<GetOrderByIdQuery, OrderDto?>
{
    public async Task<OrderDto?> Handle(
        GetOrderByIdQuery query,
        CancellationToken cancellationToken)
    {
        var order = await repository.FindByIdAsync(query.OrderId, cancellationToken);
        return order is not null ? OrderDto.From(order) : null;
    }
}

// Pipeline behavior (cross-cutting concern)
public sealed class LoggingBehavior<TRequest, TResponse>(
    ILogger<LoggingBehavior<TRequest, TResponse>> logger)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;
        logger.LogInformation("Handling {Request}", requestName);

        var response = await next();

        logger.LogInformation("Handled {Request}", requestName);
        return response;
    }
}

// Usage in endpoint
app.MapPost("/api/orders", async (
    CreateOrderCommand command,
    ISender sender,
    CancellationToken cancellationToken) =>
{
    var result = await sender.Send(command, cancellationToken);
    return result.Match(
        order => TypedResults.Created($"/api/orders/{order.Id}", order),
        error => TypedResults.BadRequest(new { error }));
});
```

### 10. Background Services

Use hosted services for background processing.

```csharp
// Good: Background worker with graceful shutdown
public sealed class OrderProcessingWorker(
    IServiceScopeFactory scopeFactory,
    ILogger<OrderProcessingWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("Order processing worker started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await using var scope = scopeFactory.CreateAsyncScope();
                var processor = scope.ServiceProvider.GetRequiredService<IOrderProcessor>();

                var processed = await processor.ProcessPendingAsync(stoppingToken);
                logger.LogInformation("Processed {Count} orders", processed);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break; // graceful shutdown
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error processing orders");
            }

            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
        }

        logger.LogInformation("Order processing worker stopped");
    }
}

// Registration
builder.Services.AddHostedService<OrderProcessingWorker>();
```

### 11. Channels (Producer-Consumer)

Use `System.Threading.Channels` for in-process message passing.

```csharp
// Good: Channel-based event processing
public sealed class EventChannel
{
    private readonly Channel<IDomainEvent> _channel =
        Channel.CreateBounded<IDomainEvent>(new BoundedChannelOptions(1000)
        {
            FullMode = BoundedChannelFullMode.Wait
        });

    public ChannelWriter<IDomainEvent> Writer => _channel.Writer;
    public ChannelReader<IDomainEvent> Reader => _channel.Reader;
}

// Producer
public sealed class OrderService(EventChannel events)
{
    public async Task CreateAsync(Order order, CancellationToken cancellationToken)
    {
        // save order...
        await events.Writer.WriteAsync(new OrderCreatedEvent(order.Id), cancellationToken);
    }
}

// Consumer (background service)
public sealed class EventProcessingWorker(
    EventChannel events,
    IServiceScopeFactory scopeFactory,
    ILogger<EventProcessingWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await foreach (var domainEvent in events.Reader.ReadAllAsync(stoppingToken))
        {
            try
            {
                await using var scope = scopeFactory.CreateAsyncScope();
                var handlers = scope.ServiceProvider
                    .GetServices<IDomainEventHandler>();

                foreach (var handler in handlers)
                {
                    await handler.HandleAsync(domainEvent, stoppingToken);
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to process event {EventType}", domainEvent.GetType().Name);
            }
        }
    }
}
```

### 12. Error Handling

Handle errors with specific exceptions and structured logging.

```csharp
// Good: Domain exception hierarchy
public abstract class DomainException(string message) : Exception(message)
{
    public abstract int StatusCode { get; }
}

public sealed class OrderNotFoundException(Guid orderId)
    : DomainException($"Order {orderId} was not found.")
{
    public override int StatusCode => 404;
}

public sealed class InsufficientStockException(Guid productId, int requested, int available)
    : DomainException($"Product {productId}: requested {requested}, available {available}.")
{
    public override int StatusCode => 422;
}

// Good: Global exception handler (ASP.NET Core 8+)
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

public sealed class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        logger.LogError(exception, "Unhandled exception for {Path}", httpContext.Request.Path);

        var (statusCode, title) = exception switch
        {
            DomainException de => (de.StatusCode, de.Message),
            UnauthorizedAccessException => (401, "Unauthorized"),
            _ => (500, "An unexpected error occurred")
        };

        httpContext.Response.StatusCode = statusCode;
        await httpContext.Response.WriteAsJsonAsync(
            new ProblemDetails { Status = statusCode, Title = title },
            cancellationToken);

        return true;
    }
}

// Good: Guard clauses
public static class Guard
{
    public static T NotNull<T>(T? value, [CallerArgumentExpression(nameof(value))] string? name = null)
        where T : class
        => value ?? throw new ArgumentNullException(name);

    public static string NotEmpty(string? value, [CallerArgumentExpression(nameof(value))] string? name = null)
        => string.IsNullOrWhiteSpace(value) ? throw new ArgumentException("Cannot be empty", name) : value;

    public static Guid NotEmpty(Guid value, [CallerArgumentExpression(nameof(value))] string? name = null)
        => value == Guid.Empty ? throw new ArgumentException("Cannot be empty", name) : value;
}

// Usage
public Order Create(CreateOrderRequest request)
{
    Guard.NotNull(request);
    Guard.NotEmpty(request.CustomerId);
    // ...
}

// Good: Structured logging with semantic properties
logger.LogInformation(
    "Order {OrderId} created for customer {CustomerId} with {LineCount} lines totaling {Total:C}",
    order.Id, order.CustomerId, order.Lines.Count, order.Total);
```

## Anti-Patterns to Avoid

| Anti-Pattern | Why | Better Approach |
|--------------|-----|-----------------|
| `.Result` / `.Wait()` | Deadlock risk | `await` |
| `async void` | Unobservable exceptions | `async Task` |
| `DateTime.Now` | Timezone issues | `DateTime.UtcNow` or `DateTimeOffset` |
| `BinaryFormatter` | Remote code execution | `System.Text.Json` |
| `TypeNameHandling.All` | Deserialization attacks | `TypeNameHandling.None` |
| String concatenation in SQL | SQL injection | Parameterized queries |
| Singleton holding Scoped | Captive dependency | `IServiceScopeFactory` |
| `catch (Exception) { }` | Swallowed errors | Handle or rethrow |
| `Thread.Sleep` in async | Blocks thread pool | `await Task.Delay` |
| Public mutable collections | Unexpected mutation | `IReadOnlyList<T>` |
| Service Locator pattern | Hidden dependencies | Constructor injection |
| God class / God service | Untestable, rigid | Single responsibility |
| Magic strings in config | Typos, no validation | Options pattern |
| `new()` in business logic | Tight coupling | Inject interfaces |

## References

- Agent: `agents/csharp-reviewer.md`
- Agent: `agents/csharp-build-resolver.md`
- Skill: `skills/csharp-testing/`
- Skill: `skills/aspnet-core-patterns/`
- Skill: `skills/efcore-patterns/`
- Skill: `skills/csharp-async-patterns/`
- Rules: `rules/csharp/`
