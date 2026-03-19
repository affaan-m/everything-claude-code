---
paths:
  - "**/*.cs"
  - "**/*.csproj"
  - "**/*.sln"
  - "**/*.razor"
---
# C# Coding Style

> This file extends [common/coding-style.md](../common/coding-style.md) with C# specific content.

## Standards

- Target **.NET 8+** with `<LangVersion>latest</LangVersion>`
- Enable `<Nullable>enable</Nullable>` globally — prefer `is not null` over `!= null`
- Enable `<ImplicitUsings>enable</ImplicitUsings>` for default namespace imports

## Naming

- **PascalCase**: Types, methods, properties, events, namespaces
- **camelCase**: Parameters, local variables
- **_camelCase**: Private fields (`private readonly ILogger<MyService> _logger;`)
- **I prefix**: Interfaces (`IUserRepository`, `INotificationService`)
- **Async suffix**: Async methods (`GetUserAsync`, `SaveChangesAsync`)

## Immutability

- Use `record` types for DTOs and value objects
- Use `readonly struct` for small, stack-allocated value types
- Use `init`-only setters for immutable properties
- Use `ImmutableArray<T>`, `FrozenDictionary<K,V>` for immutable collections
- **OO override note**: Mutable `DbContext` entities are acceptable for EF Core tracked changes

## Formatting

Use `dotnet format` with an `.editorconfig`:

```bash
dotnet format --verify-no-changes   # CI check
dotnet format                       # Auto-fix
```

## Error Handling

- Use **exceptions** for exceptional/unexpected failures
- Use a **Result pattern** (e.g., `Result<T>`) for expected/domain failures
- Never catch `Exception` without re-throwing or logging — avoid silently swallowing

## Reference

See skill: `csharp-patterns` for comprehensive C# idioms and best practices.
