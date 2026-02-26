---
paths:
  - "**/*.rs"
  - "**/Cargo.toml"
  - "**/Cargo.lock"
---
# Rust Coding Style

> This file extends [common/coding-style.md](../common/coding-style.md) with Rust-specific content.

## Formatting

- **rustfmt** is mandatory -- no style debates
- Run `cargo fmt` before every commit
- Configure via `rustfmt.toml` at the project root for team-wide consistency
- Use `cargo fmt -- --check` in CI to enforce formatting

```toml
# rustfmt.toml -- recommended settings
edition = "2021"
max_width = 100
use_field_init_shorthand = true
use_try_shorthand = true
```

## Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Crates | `snake_case` | `my_crate` |
| Modules | `snake_case` | `network_handler` |
| Types (structs, enums, traits) | `CamelCase` | `HttpClient`, `ParseError` |
| Functions, methods | `snake_case` | `parse_config`, `to_string` |
| Local variables | `snake_case` | `user_count`, `buf` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_RETRIES`, `DEFAULT_PORT` |
| Statics | `SCREAMING_SNAKE_CASE` | `GLOBAL_ALLOCATOR` |
| Type parameters | Single uppercase or `CamelCase` | `T`, `Item`, `Key` |
| Lifetimes | Short lowercase | `'a`, `'ctx`, `'de` |

## Design Principles

### Ownership-First Thinking

Design APIs around ownership semantics. Prefer borrowing for read access, owned types for storage.

```rust
// Good: Borrows for read access, takes ownership only when needed
fn process(data: &[u8]) -> Result<Report, Error> { /* ... */ }
fn store(data: Vec<u8>) -> Result<(), Error> { /* ... */ }

// Bad: Takes ownership when only reading
fn process(data: Vec<u8>) -> Result<Report, Error> { /* ... */ }
```

### Zero-Cost Abstractions

Prefer generics over trait objects for performance-critical paths. Use trait objects (`dyn Trait`) only when runtime polymorphism is genuinely needed.

```rust
// Good: Monomorphized at compile time -- zero overhead
fn serialize<W: Write>(writer: &mut W, data: &Data) -> io::Result<()> { /* ... */ }

// Acceptable: Runtime dispatch when the set of types is unknown at compile time
fn serialize(writer: &mut dyn Write, data: &Data) -> io::Result<()> { /* ... */ }
```

### Prefer Composition Over Inheritance

Rust has no inheritance. Use composition, traits, and generics.

```rust
// Good: Composition
struct Server {
    config: Config,
    logger: Logger,
    router: Router,
}

// Good: Trait-based polymorphism
trait Handler {
    fn handle(&self, request: &Request) -> Response;
}
```

## Error Handling

### Libraries: Use `thiserror`

```rust
use thiserror::Error;

#[derive(Debug, Error)]
pub enum ConfigError {
    #[error("failed to read config file: {0}")]
    Io(#[from] std::io::Error),

    #[error("failed to parse config: {0}")]
    Parse(#[from] toml::de::Error),

    #[error("missing required field: {field}")]
    MissingField { field: String },
}
```

### Applications: Use `anyhow`

```rust
use anyhow::{Context, Result};

fn main() -> Result<()> {
    let config = load_config("config.toml")
        .context("failed to initialize application")?;
    run_server(config)?;
    Ok(())
}
```

### Never `unwrap` on Fallible Operations from External Input

```rust
// Bad: Panics on invalid input
let port: u16 = env::var("PORT").unwrap().parse().unwrap();

// Good: Proper error handling
let port: u16 = env::var("PORT")
    .context("PORT environment variable not set")?
    .parse()
    .context("PORT must be a valid u16")?;
```

## Module Organization

```text
src/
  lib.rs           # Public API, re-exports
  main.rs          # Binary entry point (if applicable)
  config.rs        # Configuration types and loading
  error.rs         # Error types
  handlers/
    mod.rs         # Handler module exports
    auth.rs        # Authentication handlers
    users.rs       # User handlers
  models/
    mod.rs         # Model module exports
    user.rs        # User model
  services/
    mod.rs         # Service module exports
    user.rs        # User service logic
```

## Visibility Rules

- Default to **private** -- only expose what is necessary
- Use `pub(crate)` for internal-but-shared items
- Use `pub` only for the public API surface
- Document all `pub` items with `///` doc comments

```rust
// Good: Minimal visibility
pub struct Client {
    config: Config,            // private
    pub(crate) pool: Pool,     // crate-visible
}

pub fn new(config: Config) -> Client { /* ... */ }  // public API
fn validate(config: &Config) -> Result<()> { /* ... */ }  // private helper
```

## Reference

See skill: `rust-patterns` for comprehensive Rust idioms and patterns.
