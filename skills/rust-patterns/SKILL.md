---
name: rust-patterns
description: Idiomatic Rust patterns, best practices, and conventions for building safe, performant, and maintainable Rust applications.
origin: ECC
---

# Rust Development Patterns

Idiomatic Rust patterns for building safe, performant, and maintainable applications.

## When to Activate

- Writing new Rust code
- Reviewing Rust code
- Refactoring existing Rust code
- Designing Rust crates and modules

## Core Principles

### 1. Ownership and Borrowing

Prefer moves over clones, borrows over owned values:

```rust
// Good: Accept references
fn process(data: &[u8]) -> Result<Output> {
    // work with borrowed data
}

// Bad: Unnecessary ownership transfer
fn process(data: Vec<u8>) -> Result<Output> {
    // forces caller to give up ownership
}
```

### 2. Zero-Cost Abstractions

Use generics over trait objects when the type is known at compile time:

```rust
// Good: Monomorphized at compile time, zero overhead
fn serialize<T: Serialize>(value: &T) -> Result<String> {
    serde_json::to_string(value).map_err(Into::into)
}

// Use trait objects only when you need dynamic dispatch
fn handlers() -> Vec<Box<dyn Handler>> {
    // heterogeneous collection requires dynamic dispatch
}
```

### 3. Make Invalid States Unrepresentable

```rust
// Good: Type system enforces valid state
enum ConnectionState {
    Disconnected,
    Connecting { attempt: u32 },
    Connected { session: Session },
}

// Bad: Nullable fields with implicit invariants
struct Connection {
    session: Option<Session>,
    is_connected: bool,      // can disagree with session
    connect_attempts: u32,   // meaningless when connected
}
```

## Error Handling Patterns

### Library Errors with thiserror

```rust
use thiserror::Error;

#[derive(Debug, Error)]
pub enum StorageError {
    #[error("item {id} not found")]
    NotFound { id: String },

    #[error("permission denied for {action}")]
    PermissionDenied { action: String },

    #[error("database error")]
    Database(#[from] sqlx::Error),

    #[error("serialization error")]
    Serialization(#[from] serde_json::Error),
}
```

### Application Errors with anyhow

```rust
use anyhow::{Context, Result};

fn sync_data(config: &Config) -> Result<()> {
    let client = Client::new(&config.api_url)
        .context("failed to create API client")?;

    let data = client.fetch_all()
        .await
        .context("failed to fetch remote data")?;

    storage.save(&data)
        .context("failed to persist data")?;

    Ok(())
}
```

## Concurrency Patterns

### Channels for Message Passing

```rust
use tokio::sync::mpsc;

async fn process_events(mut rx: mpsc::Receiver<Event>) {
    while let Some(event) = rx.recv().await {
        match event {
            Event::UserCreated(user) => handle_user_created(user).await,
            Event::OrderPlaced(order) => handle_order_placed(order).await,
        }
    }
}

// Sender side
let (tx, rx) = mpsc::channel(100);
tokio::spawn(process_events(rx));
tx.send(Event::UserCreated(user)).await?;
```

### Shared State with Arc and Mutex

```rust
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Clone)]
pub struct AppState {
    db: Pool<Postgres>,
    cache: Arc<RwLock<HashMap<String, CachedItem>>>,
}

impl AppState {
    pub async fn get_cached(&self, key: &str) -> Option<CachedItem> {
        self.cache.read().await.get(key).cloned()
    }

    pub async fn set_cached(&self, key: String, item: CachedItem) {
        self.cache.write().await.insert(key, item);
    }
}
```

### Parallel Processing with Rayon

```rust
use rayon::prelude::*;

fn process_batch(items: &[Item]) -> Vec<Result<Output>> {
    items.par_iter()
        .map(|item| transform(item))
        .collect()
}
```

## Builder Pattern

```rust
#[derive(Debug)]
pub struct HttpClient {
    base_url: String,
    timeout: Duration,
    retries: u32,
    headers: HeaderMap,
}

impl HttpClient {
    pub fn builder(base_url: impl Into<String>) -> HttpClientBuilder {
        HttpClientBuilder {
            base_url: base_url.into(),
            timeout: Duration::from_secs(30),
            retries: 3,
            headers: HeaderMap::new(),
        }
    }
}

pub struct HttpClientBuilder {
    base_url: String,
    timeout: Duration,
    retries: u32,
    headers: HeaderMap,
}

impl HttpClientBuilder {
    pub fn timeout(mut self, timeout: Duration) -> Self {
        self.timeout = timeout;
        self
    }

    pub fn retries(mut self, retries: u32) -> Self {
        self.retries = retries;
        self
    }

    pub fn header(mut self, key: &str, value: &str) -> Self {
        self.headers.insert(
            HeaderName::from_str(key).unwrap(),
            HeaderValue::from_str(value).unwrap(),
        );
        self
    }

    pub fn build(self) -> HttpClient {
        HttpClient {
            base_url: self.base_url,
            timeout: self.timeout,
            retries: self.retries,
            headers: self.headers,
        }
    }
}
```

## Newtype Pattern

Prevent mixing up values with newtypes:

```rust
pub struct UserId(i64);
pub struct OrderId(i64);
pub struct Email(String);

impl Email {
    pub fn new(value: impl Into<String>) -> Result<Self, ValidationError> {
        let value = value.into();
        if !value.contains('@') {
            return Err(ValidationError::InvalidEmail);
        }
        Ok(Self(value))
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}
```

## Trait Design

### Extension Traits

```rust
pub trait StringExt {
    fn truncate_with_ellipsis(&self, max_len: usize) -> String;
}

impl StringExt for str {
    fn truncate_with_ellipsis(&self, max_len: usize) -> String {
        if self.len() <= max_len {
            self.to_string()
        } else {
            format!("{}...", &self[..max_len.saturating_sub(3)])
        }
    }
}
```

### Trait Objects vs Generics

| Use Case | Approach |
|----------|----------|
| Known types at compile time | Generics (`impl Trait`) |
| Heterogeneous collections | Trait objects (`dyn Trait`) |
| Plugin systems | Trait objects |
| Performance-critical paths | Generics |

## Performance Patterns

### Zero-Copy with Cow

```rust
use std::borrow::Cow;

fn normalize_name(name: &str) -> Cow<'_, str> {
    if name.contains(' ') {
        Cow::Owned(name.trim().to_lowercase())
    } else {
        Cow::Borrowed(name)
    }
}
```

### Pre-allocate Collections

```rust
// Good: Pre-allocated
let mut results = Vec::with_capacity(items.len());
for item in items {
    results.push(transform(item)?);
}

// Better: Use iterators
let results: Vec<_> = items.iter()
    .map(transform)
    .collect::<Result<Vec<_>>>()?;
```

## Typestate Pattern

Encode state transitions in the type system:

```rust
pub struct Order<S: OrderState> {
    id: OrderId,
    items: Vec<Item>,
    _state: PhantomData<S>,
}

pub struct Draft;
pub struct Confirmed;
pub struct Shipped;

pub trait OrderState {}
impl OrderState for Draft {}
impl OrderState for Confirmed {}
impl OrderState for Shipped {}

impl Order<Draft> {
    pub fn confirm(self) -> Order<Confirmed> {
        Order {
            id: self.id,
            items: self.items,
            _state: PhantomData,
        }
    }
}

impl Order<Confirmed> {
    pub fn ship(self) -> Order<Shipped> {
        Order {
            id: self.id,
            items: self.items,
            _state: PhantomData,
        }
    }
}
// Cannot call ship() on Draft — compile error
```

## Anti-Patterns to Avoid

| Anti-Pattern | Fix |
|-------------|-----|
| `.clone()` everywhere | Use references or `Cow` |
| `.unwrap()` in library code | Return `Result` with context |
| `Arc<Mutex<Vec<T>>>` | Consider channels or `DashMap` |
| Stringly-typed APIs | Use enums and newtypes |
| Giant `match` blocks | Extract into methods or use trait dispatch |

**Remember**: Let the compiler help you. If it compiles, it's likely correct. Lean into the type system to prevent bugs at compile time rather than runtime.
