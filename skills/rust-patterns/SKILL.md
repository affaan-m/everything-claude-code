---
name: rust-patterns
description: Idiomatic Rust patterns for ownership, error handling, async programming, trait design, and testing — building safe, performant, and maintainable Rust applications.
---

# Rust Development Patterns

Idiomatic Rust patterns and best practices for safe, performant, and maintainable applications.

## When to Activate

- Writing new Rust code
- Reviewing Rust code for safety and idioms
- Refactoring existing Rust code
- Designing Rust crates and modules

## Ownership and Borrowing

### Prefer Borrowing Over Cloning

```rust
// Good: Borrow when you don't need ownership
fn greet(name: &str) {
    println!("Hello, {name}!");
}

// Bad: Unnecessary clone
fn greet_bad(name: String) {
    println!("Hello, {name}!");
}
```

### Use Cow for Flexible Ownership

```rust
use std::borrow::Cow;

fn normalize(input: &str) -> Cow<'_, str> {
    if input.contains(' ') {
        Cow::Owned(input.replace(' ', "_"))
    } else {
        Cow::Borrowed(input)
    }
}
```

## Error Handling

### Use thiserror for Library Errors

```rust
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("database error: {0}")]
    Database(#[from] sqlx::Error),
    #[error("not found: {entity} with id {id}")]
    NotFound { entity: &'static str, id: String },
    #[error("validation failed: {0}")]
    Validation(String),
}
```

### Use anyhow for Application Code

```rust
use anyhow::{Context, Result};

fn load_config(path: &str) -> Result<Config> {
    let content = std::fs::read_to_string(path)
        .with_context(|| format!("failed to read config from {path}"))?;
    let config: Config = toml::from_str(&content)
        .context("failed to parse config")?;
    Ok(config)
}
```

### The ? Operator Chain

```rust
fn process_request(req: &Request) -> Result<Response, AppError> {
    let user = find_user(req.user_id())?;
    let data = fetch_data(&user)?;
    let result = transform(data)?;
    Ok(Response::new(result))
}
```

## Struct and Enum Design

### Builder Pattern

```rust
pub struct ServerConfig {
    host: String,
    port: u16,
    max_connections: usize,
}

impl ServerConfig {
    pub fn builder() -> ServerConfigBuilder {
        ServerConfigBuilder::default()
    }
}

#[derive(Default)]
pub struct ServerConfigBuilder {
    host: Option<String>,
    port: Option<u16>,
    max_connections: Option<usize>,
}

impl ServerConfigBuilder {
    pub fn host(mut self, host: impl Into<String>) -> Self {
        self.host = Some(host.into());
        self
    }

    pub fn port(mut self, port: u16) -> Self {
        self.port = Some(port);
        self
    }

    pub fn max_connections(mut self, max: usize) -> Self {
        self.max_connections = Some(max);
        self
    }

    pub fn build(self) -> ServerConfig {
        ServerConfig {
            host: self.host.unwrap_or_else(|| "127.0.0.1".to_string()),
            port: self.port.unwrap_or(8080),
            max_connections: self.max_connections.unwrap_or(100),
        }
    }
}
```

### Newtype Pattern

```rust
pub struct UserId(u64);
pub struct Email(String);

impl Email {
    pub fn new(email: &str) -> Result<Self, ValidationError> {
        if email.contains('@') {
            Ok(Self(email.to_lowercase()))
        } else {
            Err(ValidationError::InvalidEmail)
        }
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}
```

### Enum for State Machines

```rust
enum ConnectionState {
    Disconnected,
    Connecting { attempt: u32 },
    Connected { session_id: String },
    Reconnecting { previous_session: String, attempt: u32 },
}

impl ConnectionState {
    fn handle_event(self, event: Event) -> Self {
        match (self, event) {
            (Self::Disconnected, Event::Connect) => {
                Self::Connecting { attempt: 1 }
            }
            (Self::Connecting { attempt }, Event::Success(id)) => {
                Self::Connected { session_id: id }
            }
            (Self::Connecting { attempt }, Event::Failure) if attempt < 3 => {
                Self::Connecting { attempt: attempt + 1 }
            }
            (Self::Connected { session_id }, Event::Disconnect) => {
                Self::Reconnecting { previous_session: session_id, attempt: 1 }
            }
            (state, _) => state,
        }
    }
}
```

## Trait Design

### Small, Focused Traits

```rust
// Good: Small, composable traits
trait Validate {
    fn validate(&self) -> Result<(), ValidationError>;
}

trait Save {
    fn save(&self) -> Result<(), StorageError>;
}

// Bad: God trait
// trait Entity { fn validate(); fn save(); fn delete(); fn serialize(); }
```

### Extension Traits

```rust
trait StringExt {
    fn truncate_with_ellipsis(&self, max_len: usize) -> String;
}

impl StringExt for str {
    fn truncate_with_ellipsis(&self, max_len: usize) -> String {
        if self.len() <= max_len {
            self.to_string()
        } else {
            format!("{}…", &self[..max_len.saturating_sub(1)])
        }
    }
}
```

## Async Rust (Tokio)

### Structured Concurrency

```rust
use tokio::task::JoinSet;

async fn fetch_all(urls: Vec<String>) -> Vec<Result<String, reqwest::Error>> {
    let mut set = JoinSet::new();
    for url in urls {
        set.spawn(async move {
            reqwest::get(&url).await?.text().await
        });
    }

    let mut results = Vec::new();
    while let Some(res) = set.join_next().await {
        results.push(res.unwrap());
    }
    results
}
```

### Graceful Shutdown

```rust
use tokio::signal;
use tokio_util::sync::CancellationToken;

async fn run_server(cancel: CancellationToken) {
    loop {
        tokio::select! {
            _ = cancel.cancelled() => {
                println!("Shutting down gracefully...");
                break;
            }
            conn = accept_connection() => {
                let token = cancel.child_token();
                tokio::spawn(handle_connection(conn, token));
            }
        }
    }
}

async fn main_with_shutdown() {
    let cancel = CancellationToken::new();
    let cancel_clone = cancel.clone();

    tokio::spawn(async move {
        signal::ctrl_c().await.unwrap();
        cancel_clone.cancel();
    });

    run_server(cancel).await;
}
```

### Async Streams

```rust
use tokio_stream::{Stream, StreamExt};

fn event_stream() -> impl Stream<Item = Event> {
    async_stream::stream! {
        let mut interval = tokio::time::interval(Duration::from_secs(1));
        loop {
            interval.tick().await;
            yield Event::Tick;
        }
    }
}
```

## Testing

### Unit Tests with Fixtures

```rust
#[cfg(test)]
mod tests {
    use super::*;

    fn sample_user() -> User {
        User {
            id: UserId(1),
            name: "Alice".to_string(),
            email: Email::new("alice@example.com").unwrap(),
        }
    }

    #[test]
    fn test_user_display_name() {
        let user = sample_user();
        assert_eq!(user.display_name(), "Alice");
    }

    #[test]
    fn test_email_validation() {
        assert!(Email::new("valid@email.com").is_ok());
        assert!(Email::new("invalid").is_err());
    }
}
```

### Async Tests

```rust
#[tokio::test]
async fn test_fetch_user() {
    let pool = setup_test_db().await;
    let user = create_test_user(&pool).await;

    let result = fetch_user(&pool, user.id).await.unwrap();
    assert_eq!(result.name, "Alice");
}
```

### Property-Based Testing

```rust
use proptest::prelude::*;

proptest! {
    #[test]
    fn test_roundtrip_serialization(value: i64) {
        let serialized = serde_json::to_string(&value).unwrap();
        let deserialized: i64 = serde_json::from_str(&serialized).unwrap();
        assert_eq!(value, deserialized);
    }

    #[test]
    fn test_normalize_idempotent(s in "[a-zA-Z0-9 _]{1,100}") {
        let once = normalize(&s);
        let twice = normalize(&once);
        assert_eq!(once, twice);
    }
}
```

## Cargo Workspace

### Multi-Crate Project

```toml
# Cargo.toml (workspace root)
[workspace]
members = ["crates/*"]
resolver = "2"

[workspace.package]
version = "0.1.0"
edition = "2021"
license = "MIT"

[workspace.dependencies]
tokio = { version = "1", features = ["full"] }
serde = { version = "1", features = ["derive"] }
anyhow = "1"
thiserror = "2"
```

```
project/
├── Cargo.toml          # Workspace root
├── crates/
│   ├── core/           # Domain logic
│   ├── api/            # HTTP layer
│   ├── db/             # Database layer
│   └── cli/            # CLI entry point
```

## Unsafe Code Guidelines

### Minimize and Isolate

```rust
// Good: Wrap unsafe in a safe API with documented invariants
/// # Safety
/// The caller must ensure `ptr` is valid and properly aligned.
pub unsafe fn deref_raw<T>(ptr: *const T) -> &T {
    &*ptr
}

// Better: Provide a safe wrapper
pub fn get_value(slice: &[u8], index: usize) -> Option<u8> {
    if index < slice.len() {
        // SAFETY: We just checked that index is in bounds
        Some(unsafe { *slice.get_unchecked(index) })
    } else {
        None
    }
}
```

## Performance Patterns

### Avoid Unnecessary Allocations

```rust
// Good: Reuse buffer
let mut buf = String::new();
for item in items {
    buf.clear();
    write!(buf, "{}: {}", item.key, item.value).unwrap();
    process(&buf);
}

// Bad: Allocate each iteration
for item in items {
    let s = format!("{}: {}", item.key, item.value);
    process(&s);
}
```

### Iterator Chains Over Loops

```rust
// Good: Functional, lazy, composable
let active_emails: Vec<&str> = users.iter()
    .filter(|u| u.is_active)
    .map(|u| u.email.as_str())
    .collect();

// Acceptable but less idiomatic
let mut active_emails = Vec::new();
for user in &users {
    if user.is_active {
        active_emails.push(user.email.as_str());
    }
}
```

## Checklist

- [ ] No unnecessary `.clone()` — borrow or use references instead
- [ ] Error types use `thiserror` (library) or `anyhow` (application)
- [ ] All `unsafe` blocks have `// SAFETY:` comments
- [ ] Async code uses `CancellationToken` or `select!` for shutdown
- [ ] Tests cover error paths, not just happy paths
- [ ] Public API has `#[must_use]` on types/functions where ignoring return is a bug
- [ ] `clippy::pedantic` warnings are addressed
- [ ] Workspace dependencies are shared via `[workspace.dependencies]`
