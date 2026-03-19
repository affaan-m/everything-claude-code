---
paths:
  - "**/*.cs"
  - "**/*.csproj"
  - "**/*.sln"
  - "**/*.razor"
---
# C# Hooks

> This file extends [common/hooks.md](../common/hooks.md) with C# specific content.

## PostToolUse Hooks

Configure in `~/.claude/settings.json`:

- **dotnet format**: Auto-format `.cs` files after edit
- **dotnet build**: Run build check after editing `.cs` or `.csproj` files

## Warnings

- Warn about `Console.WriteLine` in non-`Program.cs` files — use `ILogger<T>` instead
