---
paths:
  - "**/*.cs"
  - "**/*.csx"
---
# C# Patterns

> This file extends [common/patterns.md](../common/patterns.md) with C#-specific content.

## API Response Pattern

```csharp
public sealed record ApiResponse<T>(
    bool Success,
    T? Data = default,
    string? Error = null,
    PaginationMeta? Meta = null);

public sealed record PaginationMeta(int Total, int Page, int PageSize);
```

## Repository Pattern

```csharp
public interface IRepository<T> where T : class
{
    Task<IReadOnlyList<T>> FindAllAsync(CancellationToken cancellationToken);
    Task<T?> FindByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<T> AddAsync(T entity, CancellationToken cancellationToken);
    Task<T> UpdateAsync(T entity, CancellationToken cancellationToken);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
}
```

## Options Pattern

Use strongly typed options for config instead of reading raw strings throughout the codebase.

```csharp
public sealed class PaymentsOptions
{
    public const string SectionName = "Payments";

    [Required]
    public required string BaseUrl { get; init; }

    [Required]
    public required string ApiKeySecretName { get; init; }
    public int TimeoutSeconds { get; init; } = 30;
}

// Registration with validation
builder.Services
    .AddOptions<PaymentsOptions>()
    .BindConfiguration(PaymentsOptions.SectionName)
    .ValidateDataAnnotations()
    .ValidateOnStart();
```

## Result Pattern

Use discriminated results instead of exceptions for expected domain failures.

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

## CQRS Pattern

Separate reads (queries) from writes (commands) for complex domains.

```csharp
// Command — changes state
public sealed record CreateOrderCommand(
    Guid CustomerId,
    IReadOnlyList<OrderLineRequest> Lines) : IRequest<Result<OrderDto>>;

// Query — reads state
public sealed record GetOrderByIdQuery(Guid OrderId) : IRequest<OrderDto?>;
```

## Dependency Injection

- Depend on interfaces at service boundaries
- Keep constructors focused; more than 5 dependencies suggests split responsibilities
- Register lifetimes intentionally:
  - **Singleton**: Stateless/shared services, caches, channels
  - **Scoped**: Per-request services, DbContext, unit of work
  - **Transient**: Lightweight, stateless helpers

## Guard Clauses

```csharp
public static class Guard
{
    public static T NotNull<T>(T? value, [CallerArgumentExpression(nameof(value))] string? name = null)
        where T : class
        => value ?? throw new ArgumentNullException(name);

    public static string NotEmpty(string? value, [CallerArgumentExpression(nameof(value))] string? name = null)
        => string.IsNullOrWhiteSpace(value) ? throw new ArgumentException("Cannot be empty", name) : value;
}
```

## Background Processing

Use `BackgroundService` for long-running tasks and `System.Threading.Channels` for producer-consumer patterns.

```csharp
public sealed class EventProcessingWorker(
    Channel<IDomainEvent> channel,
    IServiceScopeFactory scopeFactory,
    ILogger<EventProcessingWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await foreach (var evt in channel.Reader.ReadAllAsync(stoppingToken))
        {
            try
            {
                await using var scope = scopeFactory.CreateAsyncScope();
                var handler = scope.ServiceProvider.GetRequiredService<IEventHandler>();
                await handler.HandleAsync(evt, stoppingToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                logger.LogError(ex, "Failed to handle event {EventType}", evt.GetType().Name);
            }
        }
    }
}
```

## References

See skill: `csharp-patterns` for comprehensive patterns with detailed code examples.
