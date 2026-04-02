> This file extends [common/hooks.md](../common/hooks.md) with web-specific hook recommendations.

# Web Hooks

## Recommended PostToolUse Hooks

Configure these in `.claude/settings.json` to maintain code quality automatically after every file edit.

### Format on Save

Run Prettier (or Biome) after every file write to keep formatting consistent:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "npx prettier --write \"$FILE_PATH\"",
        "description": "Auto-format written files with Prettier"
      }
    ]
  }
}
```

### Lint Check

Run ESLint after edits to catch issues before they accumulate:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "npx eslint --fix \"$FILE_PATH\"",
        "description": "Auto-fix lint issues on edited files"
      }
    ]
  }
}
```

### Type Check (TypeScript Projects)

Run `tsc --noEmit` after edits to surface type errors early:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "npx tsc --noEmit --pretty",
        "description": "Type-check after edits"
      }
    ]
  }
}
```

### Stylelint (CSS / SCSS)

Lint stylesheets on save to enforce CSS conventions and catch errors:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "npx stylelint --fix \"$FILE_PATH\"",
        "description": "Auto-fix CSS lint issues"
      }
    ]
  }
}
```

## PreToolUse Hooks

### Validate File Size

Prevent writing files that exceed the recommended 800-line limit:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write",
        "command": "wc -l < \"$FILE_PATH\" | awk '{if ($1 > 800) exit 1}'",
        "description": "Warn if file exceeds 800 lines"
      }
    ]
  }
}
```

## Stop Hooks

### Final Build Verification

Run a production build when the session ends to ensure nothing is broken:

```json
{
  "hooks": {
    "Stop": [
      {
        "command": "npm run build",
        "description": "Verify production build before session ends"
      }
    ]
  }
}
```

## Hook Ordering

When multiple hooks apply, they run in array order. Recommended sequence:

1. **Format** (Prettier/Biome) — normalize style first
2. **Lint** (ESLint) — catch logic and convention issues
3. **Type check** (tsc) — verify type safety last

This ensures the linter and type checker operate on already-formatted code.
