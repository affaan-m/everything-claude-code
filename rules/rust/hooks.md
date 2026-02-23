---
paths:
  - "**/*.rs"
  - "**/Cargo.toml"
---
# Rust Hooks

## Recommended PostToolUse Hooks

Run automatically after editing `.rs` files:

1. **cargo fmt** -- format on save
2. **cargo clippy** -- catch lint warnings early
3. **unwrap detection** -- warn on `unwrap()` in non-test code
4. **cargo audit** -- check dependency vulnerabilities

## Example Hook Configuration

```json
{
  "hooks": [{
    "matcher": { "tool": "edit", "filePath": "\\.rs$" },
    "hooks": [
      { "type": "command", "command": "cargo fmt -- --check" },
      { "type": "command", "command": "cargo clippy -- -D warnings" },
      { "type": "notification", "message": "Check: no unwrap() in lib code" }
    ]
  }]
}
```

See `hooks/` directory for full integration examples.
