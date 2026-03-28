---
paths:
  - "**/*.cs"
  - "**/*.csx"
---
# C# Coding Style

> This file extends [common/coding-style.md](../common/coding-style.md) with C#-specific content.

## Standards

- Follow current .NET conventions and enable nullable reference types (`<Nullable>enable</Nullable>`)
- Prefer explicit access modifiers on public and internal APIs
- Keep files aligned with the primary type they define
- Use `sealed` on classes not designed for inheritance
- Prefer primary constructors (C# 12) for DI and simple types

## Types and Models

- Prefer `record` or `record struct` for immutable value-like models
- Use `class` for entities or types with identity and lifecycle
- Use `interface` for service boundaries and abstractions
- Avoid `dynamic` in application code; prefer generics or explicit models
- Prefer `sealed record` for DTOs and command/query objects

```csharp
public sealed record UserDto(Guid Id, string Email);

public interface IUserRepository
{
    Task<UserDto?> FindByIdAsync(Guid id, CancellationToken cancellationToken);
}
```

## Immutability

- Prefer `init` setters, constructor parameters, and immutable collections for shared state
- Do not mutate input models in-place when producing updated state
- Use `IReadOnlyList<T>`, `IReadOnlyDictionary<TK,TV>`, `FrozenDictionary` for public APIs
- Use `with` expressions on records to create modified copies

```csharp
public sealed record UserProfile(string Name, string Email);

public static UserProfile Rename(UserProfile profile, string name) =>
    profile with { Name = name };
```

## Async and Error Handling

- Prefer `async`/`await` over blocking calls like `.Result` or `.Wait()`
- Pass `CancellationToken` through all public async APIs
- Never use `async void` except for event handlers
- Throw specific exceptions and log with structured properties
- Use `ConfigureAwait(false)` in library code

```csharp
public async Task<Order> LoadOrderAsync(
    Guid orderId,
    CancellationToken cancellationToken)
{
    try
    {
        return await repository.FindAsync(orderId, cancellationToken)
            ?? throw new InvalidOperationException($"Order {orderId} was not found.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Failed to load order {OrderId}", orderId);
        throw;
    }
}
```

## Naming Conventions

- `PascalCase` for types, methods, properties, events, and constants
- `camelCase` for local variables and parameters
- `_camelCase` for private fields (with underscore prefix)
- `I` prefix for interfaces (`IUserRepository`)
- `Async` suffix for async methods (`GetOrderAsync`)
- `T` prefix for generic type parameters (`TResult`, `TEntity`)

## Formatting

- Use `dotnet format` for formatting and analyzer fixes
- Keep `using` directives organized and remove unused imports
- Prefer file-scoped namespaces (`namespace MyApp.Services;`)
- Prefer expression-bodied members only when they stay readable
- Use pattern matching (`is`, `switch` expressions) over type casting

## Modern C# Features

- **Primary constructors** (C# 12) for DI in services
- **Collection expressions** (`[1, 2, 3]`) for array/list initialization
- **Raw string literals** (`"""..."""`) for multiline strings and JSON
- **`required` modifier** for mandatory init properties
- **Pattern matching** with `is`, `and`, `or`, `not` for complex conditions
- **Source generators** (`[GeneratedRegex]`, `[LoggerMessage]`) over reflection

```csharp
// Good: Modern C# patterns
public sealed partial class OrderService(IOrderRepository repository, ILogger<OrderService> logger)
{
    [LoggerMessage(Level = LogLevel.Information, Message = "Order {OrderId} created")]
    private static partial void LogOrderCreated(ILogger logger, Guid orderId);

    public async Task<Order> CreateAsync(CreateOrderRequest request, CancellationToken ct)
    {
        var order = Order.Create(request);
        await repository.AddAsync(order, ct);
        LogOrderCreated(logger, order.Id);
        return order;
    }
}
```
