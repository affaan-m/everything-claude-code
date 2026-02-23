---
paths:
  - "**/*.cs"
  - "**/*.csproj"
  - "**/*.sln"
---
# C# Coding Style

> This file extends [common/coding-style.md](../common/coding-style.md) with C# specific content.

## Modern C#

- Prefer **records** over classes for immutable data
- Use **async/await all the way** — never `.Result` or `.Wait()` (deadlock risk)
- Use **file-scoped namespaces** to reduce nesting
- Use **global usings** for common namespaces

## Naming

- Classes/methods/properties: `PascalCase`
- Parameters/locals: `camelCase`
- Interfaces: `IPascalCase` (I prefix)
- Private fields: `_camelCase`

## Anti-Patterns

- Never use `DateTime.Now` — inject `TimeProvider` or `IClock` for testability
- Avoid `async void` except in event handlers

```csharp
// GOOD — record with positional syntax
public record UserDto(string Name, string Email, DateTime CreatedAt);
```

## Reference

See skill: `dotnet-patterns` for comprehensive C# patterns.
