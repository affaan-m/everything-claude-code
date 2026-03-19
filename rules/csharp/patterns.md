---
paths:
  - "**/*.cs"
  - "**/*.csproj"
  - "**/*.sln"
  - "**/*.razor"
---
# C# Patterns

> This file extends [common/patterns.md](../common/patterns.md) with C# specific content.

## Repository Pattern

Use EF Core `DbContext` behind an interface:

```csharp
public interface IUserRepository
{
    Task<User?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<IReadOnlyList<User>> GetAllAsync(CancellationToken ct = default);
    Task AddAsync(User user, CancellationToken ct = default);
}

public sealed class UserRepository(AppDbContext db) : IUserRepository
{
    public async Task<User?> GetByIdAsync(int id, CancellationToken ct = default)
        => await db.Users.FindAsync([id], ct);

    public async Task<IReadOnlyList<User>> GetAllAsync(CancellationToken ct = default)
        => await db.Users.AsNoTracking().ToListAsync(ct);

    public async Task AddAsync(User user, CancellationToken ct = default)
    {
        await db.Users.AddAsync(user, ct);
        await db.SaveChangesAsync(ct);
    }
}
```

## DTOs with Records

Use `record` types for data transfer (equivalent to Python dataclasses):

```csharp
public record UserDto(string Name, string Email, int Age);
public record CreateUserRequest(string Name, string Email);
public record ApiResponse<T>(bool Success, T? Data, string? Error);
```

## Dependency Injection

Use `Microsoft.Extensions.DependencyInjection` with constructor injection:

```csharp
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddSingleton<ICacheService, RedisCacheService>();
builder.Services.AddTransient<IEmailSender, SmtpEmailSender>();

// Keyed services (.NET 8+)
builder.Services.AddKeyedSingleton<IStorage>("local", new LocalStorage());
builder.Services.AddKeyedSingleton<IStorage>("cloud", new CloudStorage());
```

## Async/Await

- Always use `async Task` — never `async void` (except event handlers)
- Always accept and forward `CancellationToken`
- Prefer `ValueTask` for hot paths that often complete synchronously
- Use `IAsyncEnumerable<T>` for streaming results

```csharp
public async Task<User> GetUserAsync(int id, CancellationToken ct = default)
{
    ct.ThrowIfCancellationRequested();
    return await _repository.GetByIdAsync(id, ct)
        ?? throw new NotFoundException($"User {id} not found");
}
```

## LINQ

- Prefer **method syntax** over query syntax
- Avoid **multiple enumeration** — materialize with `ToList()` or `ToArray()` when needed
- Use `FrozenDictionary<K,V>` (.NET 8+) for read-heavy lookup tables

```csharp
var activeUsers = users
    .Where(u => u.IsActive)
    .OrderBy(u => u.Name)
    .Select(u => new UserDto(u.Name, u.Email, u.Age))
    .ToList();
```

## Reference

See skill: `csharp-patterns` for comprehensive C# patterns and idioms.
