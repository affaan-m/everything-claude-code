---
paths:
  - "**/*.rs"
  - "**/Cargo.toml"
  - "**/Cargo.lock"
---
# Rust Patterns

> This file extends [common/patterns.md](../common/patterns.md) with Rust-specific content.

## Builder Pattern

Use the builder pattern for types with many optional fields:

```rust
pub struct ServerConfig {
    host: String,
    port: u16,
    max_connections: usize,
    timeout: Duration,
}

pub struct ServerConfigBuilder {
    host: String,
    port: u16,
    max_connections: usize,
    timeout: Duration,
}

impl ServerConfigBuilder {
    pub fn new(host: impl Into<String>, port: u16) -> Self {
        Self {
            host: host.into(),
            port,
            max_connections: 100,
            timeout: Duration::from_secs(30),
        }
    }

    pub fn max_connections(self, n: usize) -> Self {
        Self { max_connections: n, ..self }
    }

    pub fn timeout(self, d: Duration) -> Self {
        Self { timeout: d, ..self }
    }

    pub fn build(self) -> ServerConfig {
        ServerConfig {
            host: self.host,
            port: self.port,
            max_connections: self.max_connections,
            timeout: self.timeout,
        }
    }
}
```

## Newtype Pattern

Wrap primitive types for type safety and domain clarity:

```rust
pub struct UserId(pub u64);
pub struct Email(String);

impl Email {
    pub fn new(raw: &str) -> Result<Self, ValidationError> {
        if raw.contains('@') && raw.len() > 3 {
            Ok(Email(raw.to_owned()))
        } else {
            Err(ValidationError::InvalidEmail)
        }
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}
```

## Typestate Pattern

Encode state transitions in the type system so invalid states are unrepresentable:

```rust
pub struct Unlocked;
pub struct Locked;

pub struct Door<State> {
    _state: std::marker::PhantomData<State>,
}

impl Door<Locked> {
    pub fn unlock(self) -> Door<Unlocked> {
        Door { _state: std::marker::PhantomData }
    }
}

impl Door<Unlocked> {
    pub fn lock(self) -> Door<Locked> {
        Door { _state: std::marker::PhantomData }
    }

    pub fn open(&self) {
        // Only unlocked doors can be opened
    }
}
```

## From/Into Conversions

Implement `From` for ergonomic type conversions:

```rust
impl From<DatabaseRow> for User {
    fn from(row: DatabaseRow) -> Self {
        User {
            id: UserId(row.id),
            name: row.name,
            email: row.email,
        }
    }
}

// Usage: automatic Into conversion
let user: User = db_row.into();
```

## Trait Objects vs Generics

Use generics for compile-time dispatch, trait objects for runtime dispatch:

```rust
// Generics: zero-cost, monomorphized, larger binary
fn process<H: Handler>(handler: &H, request: &Request) -> Response {
    handler.handle(request)
}

// Trait objects: dynamic dispatch, smaller binary, slight runtime cost
fn process(handler: &dyn Handler, request: &Request) -> Response {
    handler.handle(request)
}
```

Prefer generics unless you need heterogeneous collections or plugin-style architectures.

## Dependency Injection

Use constructor injection with trait bounds:

```rust
pub struct UserService<R: UserRepository> {
    repo: R,
}

impl<R: UserRepository> UserService<R> {
    pub fn new(repo: R) -> Self {
        Self { repo }
    }

    pub fn find_user(&self, id: UserId) -> Result<User, AppError> {
        self.repo.find_by_id(id)
    }
}
```

## Reference

See skill: `rust-patterns` for comprehensive Rust patterns including concurrency, error handling, and crate organization.
