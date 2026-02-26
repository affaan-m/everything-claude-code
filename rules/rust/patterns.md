---
paths:
  - "**/*.rs"
  - "**/Cargo.toml"
  - "**/Cargo.lock"
---
# Rust Patterns

> This file extends [common/patterns.md](../common/patterns.md) with Rust specific content.

## Builder Pattern

```rust
#[derive(Debug)]
pub struct ServerConfig {
    port: u16,
    host: String,
    max_connections: usize,
}

impl ServerConfig {
    pub fn builder() -> ServerConfigBuilder {
        ServerConfigBuilder::default()
    }
}

#[derive(Default)]
pub struct ServerConfigBuilder {
    port: Option<u16>,
    host: Option<String>,
    max_connections: Option<usize>,
}

impl ServerConfigBuilder {
    pub fn port(mut self, port: u16) -> Self {
        self.port = Some(port);
        self
    }

    pub fn host(mut self, host: impl Into<String>) -> Self {
        self.host = Some(host.into());
        self
    }

    pub fn build(self) -> Result<ServerConfig, &'static str> {
        Ok(ServerConfig {
            port: self.port.unwrap_or(8080),
            host: self.host.unwrap_or_else(|| "0.0.0.0".into()),
            max_connections: self.max_connections.unwrap_or(100),
        })
    }
}
```

## Newtype Pattern

Prevent mixing up types with newtypes:

```rust
pub struct UserId(pub i64);
pub struct OrderId(pub i64);

fn get_order(user: UserId, order: OrderId) -> Result<Order> {
    // Cannot accidentally swap user_id and order_id
}
```

## From/Into Conversions

```rust
impl From<CreateUserRequest> for User {
    fn from(req: CreateUserRequest) -> Self {
        Self {
            id: Uuid::new_v4(),
            name: req.name,
            email: req.email,
        }
    }
}
```

## Dependency Injection

Use constructor functions with trait bounds:

```rust
pub struct UserService<R: UserRepository> {
    repo: R,
}

impl<R: UserRepository> UserService<R> {
    pub fn new(repo: R) -> Self {
        Self { repo }
    }
}
```

## Reference

See skill: `rust-patterns` for comprehensive Rust patterns including concurrency, error handling, and trait design.
