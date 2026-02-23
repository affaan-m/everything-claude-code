---
paths:
  - "**/*.cs"
  - "**/*.csproj"
  - "**/*.sln"
---
# C# Hooks

> This file extends [common/hooks.md](../common/hooks.md) with C# specific content.

## PostToolUse Hooks

Configure in `~/.claude/settings.json`:

- **dotnet format**: Auto-format `.cs` files after edit
- **dotnet build --no-restore -q**: Quick compilation check after editing C# files
