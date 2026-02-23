---
paths:
  - "**/*.cs"
  - "**/*.csproj"
  - "**/*.sln"
---
# C# Patterns

> This file extends [common/patterns.md](../common/patterns.md) with C# specific content.

## Options Pattern

```csharp
public class SmtpOptions
{
    public const string SectionName = "Smtp";
    public required string Host { get; init; }
    public int Port { get; init; } = 587;
}
// Registration
services.Configure<SmtpOptions>(config.GetSection(SmtpOptions.SectionName));
```

## Result Pattern

Use `Result<T>` to avoid exceptions for expected failures (validation, not-found).

## DI Lifetimes

- **Singleton**: stateless services, caches
- **Scoped**: per-request (DbContext, UoW)
- **Transient**: lightweight, stateless

## Minimal APIs

```csharp
app.MapGet("/users/{id}", async (int id, IUserService svc) =>
    await svc.GetById(id) is { } user ? Results.Ok(user) : Results.NotFound());
```

## Reference

See skill: `dotnet-patterns` for comprehensive .NET patterns.
