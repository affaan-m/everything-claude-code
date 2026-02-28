---
paths:
  - "**/*.rs"
  - "**/Cargo.toml"
  - "**/Cargo.lock"
---
# Rust Security

> This file extends [common/security.md](../common/security.md) with Rust-specific content.

## Unsafe Usage Policy

Every `unsafe` block MUST have a `// SAFETY:` comment explaining why it is sound:

```rust
// SAFETY: We have verified that `ptr` is non-null and properly aligned,
// and the data it points to is initialized and valid for the lifetime 'a.
unsafe {
    &*ptr
}
```

Minimize `unsafe` surface area:
- Wrap unsafe code in safe abstractions
- Prefer safe alternatives from the standard library
- Never use `unsafe` to bypass the borrow checker -- fix the design instead
- Use `#[deny(unsafe_code)]` at the crate level for pure-safe crates

```rust
// At crate root for libraries that should never use unsafe
#![deny(unsafe_code)]
```

## Dependency Security

### cargo audit

Run `cargo audit` regularly to check for known vulnerabilities:

```bash
# Install
cargo install cargo-audit

# Run audit
cargo audit

# Run in CI (fails on any advisory)
cargo audit --deny warnings
```

### cargo deny

Use `cargo deny` for comprehensive dependency policy:

```bash
# Install
cargo install cargo-deny

# Check advisories, licenses, bans, and sources
cargo deny check
```

```toml
# deny.toml
[advisories]
vulnerability = "deny"
unmaintained = "warn"

[licenses]
allow = ["MIT", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause"]
```

## No `unwrap` on User Input

Never use `.unwrap()` or `.expect()` on data originating from user input, network, or file I/O:

```rust
// Bad: Panics on invalid user input
let age: u32 = user_input.parse().unwrap();

// Good: Returns error to caller
let age: u32 = user_input
    .parse()
    .map_err(|_| AppError::InvalidInput("age must be a number".into()))?;
```

## Secret Management

Load secrets exclusively from environment variables or a secrets manager:

```rust
use std::env;

fn load_api_key() -> Result<String, AppError> {
    env::var("API_KEY")
        .map_err(|_| AppError::Config("API_KEY environment variable not set".into()))
}
```

Never commit secrets to source control. Use `.env` files only for local development and add `.env` to `.gitignore`.

## Input Validation

Validate and sanitize all external input before processing:

```rust
fn validate_username(input: &str) -> Result<&str, AppError> {
    if input.len() < 3 || input.len() > 32 {
        return Err(AppError::Validation("username must be 3-32 characters".into()));
    }
    if !input.chars().all(|c| c.is_alphanumeric() || c == '_') {
        return Err(AppError::Validation("username must be alphanumeric".into()));
    }
    Ok(input)
}
```

## Path Traversal Prevention

```rust
use std::path::Path;

fn safe_read_file(base_dir: &Path, user_path: &str) -> Result<Vec<u8>, AppError> {
    let requested = base_dir.join(user_path);
    let canonical = requested.canonicalize()
        .map_err(|_| AppError::NotFound)?;

    if !canonical.starts_with(base_dir.canonicalize()?) {
        return Err(AppError::Forbidden("path traversal detected".into()));
    }

    std::fs::read(&canonical).map_err(AppError::from)
}
```

## Security Scanning

```bash
# Audit dependencies for known vulnerabilities
cargo audit

# Check dependency policies (licenses, bans, advisories)
cargo deny check

# Run clippy with security-relevant lints
cargo clippy -- -W clippy::all

# Detect undefined behavior with miri (nightly)
cargo +nightly miri test
```
