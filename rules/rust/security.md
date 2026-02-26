---
paths:
  - "**/*.rs"
  - "**/Cargo.toml"
  - "**/Cargo.lock"
---
# Rust Security

> This file extends [common/security.md](../common/security.md) with Rust specific content.

## Unsafe Policy

Minimize `unsafe` usage. When required, always document:

```rust
// SAFETY: pointer is non-null and aligned, validated by caller
unsafe { ptr.read() }
```

Deny unsafe in library crates by default:

```rust
#![deny(unsafe_code)]
```

## Secret Management

```rust
let api_key = std::env::var("API_KEY")
    .expect("API_KEY must be set");
```

## Security Scanning

```bash
cargo audit                       # Known vulnerability scan
cargo deny check advisories       # Advisory database check
cargo deny check licenses         # License compliance
```

## Input Validation

Never `.unwrap()` on user-provided data:

```rust
let port: u16 = input.parse()
    .map_err(|_| ApiError::InvalidInput("port must be a number"))?;
```

## Path Traversal Prevention

```rust
use std::path::Path;

fn safe_path(base: &Path, user_input: &str) -> Result<PathBuf> {
    let requested = base.join(user_input).canonicalize()?;
    if !requested.starts_with(base.canonicalize()?) {
        return Err(anyhow!("path traversal attempt"));
    }
    Ok(requested)
}
```
