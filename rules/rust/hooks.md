---
paths:
  - "**/*.rs"
  - "**/Cargo.toml"
  - "**/Cargo.lock"
---
# Rust Hooks

> This file extends [common/hooks.md](../common/hooks.md) with Rust specific content.

## PostToolUse Hooks

Format and lint Rust files after editing:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "if echo '$TOOL_INPUT' | grep -q '\\.rs'; then cargo fmt -- --check 2>/dev/null; fi"
          },
          {
            "type": "command",
            "command": "if echo '$TOOL_INPUT' | grep -q '\\.rs'; then cargo clippy -- -D warnings 2>/dev/null; fi"
          }
        ]
      }
    ]
  }
}
```

## PreToolUse Hooks

- Use tmux reminder for `cargo build`, `cargo test`, `cargo bench` (long-running)
- Audit unsafe usage before commits

## Stop Hooks

Before session ends, verify:
- `cargo test` passes
- `cargo clippy` has no warnings
- No `.unwrap()` on user input paths
