---
paths:
  - "**/*.cs"
  - "**/*.csx"
  - "**/*.csproj"
  - "**/*.sln"
  - "**/Directory.Build.props"
  - "**/Directory.Build.targets"
---
# C# Hooks

> This file extends [common/hooks.md](../common/hooks.md) with C#-specific content.

## PostToolUse Hooks

Configure in `~/.claude/settings.json`:

### Auto-Format

Run `dotnet format` after editing C# files to apply formatting and analyzer fixes:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": { "toolName": "Edit", "filePath": "\\.cs$" },
        "hooks": [{ "type": "command", "command": "dotnet format --include $(dirname \"$CLAUDE_FILE_PATH\")" }]
      }
    ]
  }
}
```

### Build Check

Verify the solution still compiles after edits:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": { "toolName": "Edit", "filePath": "\\.(cs|csproj)$" },
        "hooks": [{ "type": "command", "command": "dotnet build --no-restore -warnaserror" }]
      }
    ]
  }
}
```

### Test Runner

Re-run the nearest relevant test project after behavior changes:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": { "toolName": "Edit", "filePath": "\\.cs$" },
        "hooks": [{ "type": "command", "command": "dotnet test --no-build --verbosity quiet" }]
      }
    ]
  }
}
```

## Stop Hooks

- Run a final `dotnet build` before ending a session with broad C# changes
- Warn on modified `appsettings*.json` files so secrets do not get committed
- Run `dotnet format --verify-no-changes` to ensure formatting consistency

## Recommended Workflow

1. **Edit** → `dotnet format` auto-runs (formatting)
2. **Edit .csproj** → `dotnet restore` auto-runs (packages)
3. **Before commit** → `dotnet build -warnaserror && dotnet test` (verification)
