---
paths:
  - "**/*.rs"
  - "**/Cargo.toml"
  - "**/Cargo.lock"
---
# Rust Coding Style

> This file extends [common/coding-style.md](../common/coding-style.md) with Rust specific content.

## Formatting

- **rustfmt** is mandatory — no style debates
- Configure via `rustfmt.toml` or `.rustfmt.toml` at project root

## Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Crates | snake_case | `my_crate` |
| Modules | snake_case | `auth_handler` |
| Types | CamelCase | `UserService` |
| Traits | CamelCase | `Serializable` |
| Functions | snake_case | `parse_config` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRIES` |
| Type parameters | Single uppercase | `T`, `E`, `K`, `V` |

## Design Principles

- Ownership-first: prefer moves over clones
- Zero-cost abstractions: use generics over trait objects when possible
- Composition over inheritance (Rust has no inheritance)
- Make invalid states unrepresentable with the type system

## Error Handling

Use `thiserror` for libraries, `anyhow` for applications:

```rust
// Library: structured errors
#[derive(Debug, thiserror::Error)]
pub enum ServiceError {
    #[error("user {id} not found")]
    NotFound { id: String },
    #[error("database error: {0}")]
    Database(#[from] sqlx::Error),
}

// Application: context-rich errors
use anyhow::{Context, Result};

fn load_config(path: &str) -> Result<Config> {
    let data = std::fs::read_to_string(path)
        .context("failed to read config file")?;
    toml::from_str(&data)
        .context("failed to parse config")
}
```

## Module Organization

- Prefer named modules (`user.rs`) over `mod.rs` files
- Re-export public API from `lib.rs`
- Keep modules focused and small

## Reference

See skill: `rust-patterns` for comprehensive Rust idioms and patterns.
