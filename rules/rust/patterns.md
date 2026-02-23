---
paths:
  - "**/*.rs"
  - "**/Cargo.toml"
---
# Rust Patterns

## Error Handling Strategy

- **Libraries**: `thiserror` for typed, structured errors.
- **Applications**: `anyhow` for ergonomic, context-rich errors.

```rust
// Library error (thiserror)
#[derive(Debug, thiserror::Error)]
pub enum DbError {
    #[error("connection failed: {0}")]
    Connection(#[from] std::io::Error),
    #[error("not found: {id}")]
    NotFound { id: i64 },
}

// Application error (anyhow)
let user = db.find(id).context("failed to load user")?;
```

## Newtype Pattern

Wrap primitives for type safety: `pub struct UserId(pub Uuid);`

## Builder Pattern

Use `bon` or `typed-builder` for structs with many optional fields.

## Function Parameters

Prefer borrowed types: `&str` over `&String`, `&[T]` over `&Vec<T>`, `&Path` over `&PathBuf`.
