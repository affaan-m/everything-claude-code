---
paths:
  - "**/*.rs"
  - "**/Cargo.toml"
---
# Rust Security

## Unsafe Code

Every `unsafe` block must have a `// SAFETY:` comment explaining the invariant:

```rust
// SAFETY: pointer is non-null and aligned; allocated by Vec
unsafe { std::ptr::read(ptr) }
```

Never use `std::mem::transmute`. Prefer `From`/`Into` or `bytemuck`.

## Input Validation

Validate all external input at API boundaries before processing.

## SQL Injection Prevention

Use parameterized queries with `sqlx` compile-time checked macros:

```rust
let user = sqlx::query_as!(User,
    "SELECT * FROM users WHERE id = $1", id
).fetch_one(&pool).await?;
```

## Secrets Management

Never hardcode secrets. Use `dotenvy`: `let key = dotenvy::var("API_KEY")?;`

## Dependency Auditing

Run `cargo audit` in CI to detect known vulnerabilities.