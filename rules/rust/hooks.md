---
paths:
  - "**/*.rs"
  - "**/Cargo.toml"
  - "**/Cargo.lock"
---
# Rust Hooks

> This file extends [common/hooks.md](../common/hooks.md) with Rust-specific content.

## PostToolUse Hooks

Configure in `~/.claude/settings.json`:

- **cargo fmt**: Auto-format `.rs` files after edit
- **cargo clippy**: Run lint checks after editing `.rs` files
- **cargo check**: Run type checking after editing `.rs` or `Cargo.toml` files

### Example Hook Configuration

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "if echo \"$CC_TOOL_FILE_PATH\" | grep -q '\\.rs$'; then cargo fmt -- \"$CC_TOOL_FILE_PATH\" 2>/dev/null; fi",
            "description": "Auto-format Rust files with cargo fmt"
          },
          {
            "type": "command",
            "command": "if echo \"$CC_TOOL_FILE_PATH\" | grep -q '\\.rs$'; then cargo clippy --quiet -- -D warnings 2>&1 | head -20; fi",
            "description": "Run clippy on edited Rust files"
          }
        ]
      }
    ]
  }
}
```

## PreToolUse Hooks

- **tmux reminder**: Suggest tmux for long-running Rust commands (`cargo build`, `cargo test`, `cargo bench`)
- **unsafe audit**: Warn when editing files that contain `unsafe` blocks

## Stop Hooks

- **cargo test**: Run full test suite before ending a session involving Rust changes
- **cargo clippy**: Verify no new lint warnings were introduced
- **unwrap audit**: Check all modified `.rs` files for `.unwrap()` on fallible operations

## CI Integration

These hooks complement CI checks. Ensure your CI pipeline also runs:

```bash
cargo fmt -- --check
cargo clippy -- -D warnings
cargo test
cargo audit
```
