---
name: rust-patterns
description: Idiomatic Rust patterns, best practices, and conventions for building safe, performant, and maintainable Rust applications.
origin: ECC
---

# Rust Development Patterns

Idiomatic Rust patterns and best practices for building safe, performant, and maintainable applications.

## When to Use

- Writing new Rust code
- Reviewing Rust code
- Refactoring existing Rust code
- Designing Rust crates and modules
- Making architectural decisions in Rust projects

## How It Works

### 1. Ownership and Borrowing

Rust's ownership system is the foundation of memory safety. Design APIs around clear ownership semantics.

```rust
// Good: Function borrows data it only reads
fn summarize(items: &[Item]) -> Summary {
    Summary {
        count: items.len(),
        total: items.iter().map(|i| i.value).sum(),
    }
}

// Good: Function takes ownership when it needs to store the data
fn register(mut registry: Registry, item: Item) -> Registry {
    registry.items.push(item);
    registry
}

// Bad: Takes ownership unnecessarily -- forces caller to clone
fn summarize(items: Vec<Item>) -> Summary {
    Summary {
        count: items.len(),
        total: items.iter().map(|i| i.value).sum(),
    }
}
```

### 2. Zero-Cost Abstractions

Rust lets you write high-level code that compiles to the same assembly as hand-written low-level code.

```rust
// Iterator chains compile to the same code as manual loops
let total: u64 = transactions
    .iter()
    .filter(|t| t.is_valid())
    .map(|t| t.amount)
    .sum();

// Generics are monomorphized -- no runtime overhead
fn max<T: Ord>(a: T, b: T) -> T {
    if a >= b { a } else { b }
}
```

### 3. Fearless Concurrency

The type system prevents data races at compile time.

```rust
use std::sync::{Arc, Mutex};
use std::thread;

// The compiler ensures shared state is properly synchronized
fn parallel_sum(data: &[i32]) -> i32 {
    let chunk_size = data.len() / 4;
    let data = Arc::new(data.to_vec());
    let mut handles = vec![];

    for i in 0..4 {
        let data = Arc::clone(&data);
        handles.push(thread::spawn(move || {
            let start = i * chunk_size;
            let end = if i == 3 { data.len() } else { start + chunk_size };
            data[start..end].iter().sum::<i32>()
        }));
    }

    handles.into_iter().map(|h| h.join().unwrap()).sum()
}
```

### 4. Make Invalid States Unrepresentable

Use the type system to prevent bugs at compile time.

```rust
// Bad: Runtime checks for state validity
struct Connection {
    state: String, // "connected", "disconnected", "error"
    socket: Option<TcpStream>,
}

// Good: Invalid states are impossible to construct
enum Connection {
    Disconnected,
    Connected { socket: TcpStream },
    Error { reason: String },
}

impl Connection {
    fn send(&self, data: &[u8]) -> Result<(), ConnectionError> {
        match self {
            Connection::Connected { socket } => {
                // Only reachable when we have a valid socket
                Ok(())
            }
            _ => Err(ConnectionError::NotConnected),
        }
    }
}
```

## Examples

## Error Handling Patterns

### Library Errors with `thiserror`

```rust
use thiserror::Error;

#[derive(Debug, Error)]
pub enum StorageError {
    #[error("item not found: {id}")]
    NotFound { id: String },

    #[error("duplicate key: {key}")]
    DuplicateKey { key: String },

    #[error("connection failed: {0}")]
    Connection(#[from] std::io::Error),

    #[error("serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("capacity exceeded: {current}/{max}")]
    CapacityExceeded { current: usize, max: usize },
}
```

### Application Errors with `anyhow`

```rust
use anyhow::{bail, ensure, Context, Result};

fn process_order(order_id: &str) -> Result<Receipt> {
    let order = db::find_order(order_id)
        .context("failed to fetch order from database")?;

    ensure!(!order.items.is_empty(), "order {} has no items", order_id);

    let total = calculate_total(&order.items)
        .context("failed to calculate order total")?;

    if total > MAX_ORDER_AMOUNT {
        bail!("order total ${total} exceeds maximum ${MAX_ORDER_AMOUNT}");
    }

    charge_payment(&order, total)
        .with_context(|| format!("failed to charge payment for order {order_id}"))?;

    Ok(Receipt { order_id: order_id.to_owned(), total })
}
```

### Custom Error Type Without Dependencies

```rust
use std::fmt;

#[derive(Debug)]
pub enum AppError {
    NotFound(String),
    Unauthorized,
    Internal(String),
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::NotFound(resource) => write!(f, "{resource} not found"),
            Self::Unauthorized => write!(f, "unauthorized"),
            Self::Internal(msg) => write!(f, "internal error: {msg}"),
        }
    }
}

impl std::error::Error for AppError {}

impl From<std::io::Error> for AppError {
    fn from(err: std::io::Error) -> Self {
        Self::Internal(err.to_string())
    }
}
```

### The `?` Operator Chain

```rust
fn load_user_config(user_id: &str) -> Result<UserConfig, AppError> {
    let path = config_path(user_id)?;
    let contents = std::fs::read_to_string(&path)?;
    let config: UserConfig = toml::from_str(&contents)?;
    validate_config(&config)?;
    Ok(config)
}
```

## Concurrency Patterns

### Channels for Message Passing

```rust
use std::sync::mpsc;
use std::thread;

enum Command {
    Process(String),
    Shutdown,
}

fn spawn_worker() -> mpsc::Sender<Command> {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        for cmd in rx {
            match cmd {
                Command::Process(data) => {
                    // Handle work
                    let _ = process(&data);
                }
                Command::Shutdown => break,
            }
        }
    });

    tx
}
```

### Arc/Mutex for Shared State

```rust
use std::sync::{Arc, Mutex};

#[derive(Clone)]
pub struct SharedCache {
    inner: Arc<Mutex<HashMap<String, CacheEntry>>>,
}

impl SharedCache {
    pub fn new() -> Self {
        Self {
            inner: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub fn get(&self, key: &str) -> Option<CacheEntry> {
        let guard = self.inner.lock().expect("cache lock poisoned");
        guard.get(key).cloned()
    }

    pub fn insert(&self, key: String, value: CacheEntry) {
        let mut guard = self.inner.lock().expect("cache lock poisoned");
        guard.insert(key, value);
    }
}
```

### RwLock for Read-Heavy Workloads

```rust
use std::sync::{Arc, RwLock};

pub struct ConfigStore {
    config: Arc<RwLock<Config>>,
}

impl ConfigStore {
    pub fn read(&self) -> Config {
        self.config.read().expect("config lock poisoned").clone()
    }

    pub fn update(&self, new_config: Config) {
        let mut guard = self.config.write().expect("config lock poisoned");
        *guard = new_config;
    }
}
```

### Rayon for Data Parallelism

```rust
use rayon::prelude::*;

fn process_images(paths: &[PathBuf]) -> Vec<Result<Image, ProcessError>> {
    paths
        .par_iter()
        .map(|path| load_and_process(path))
        .collect()
}

fn parallel_sort(data: &mut [i32]) {
    data.par_sort();
}
```

### Async/Await with Tokio

```rust
use tokio::sync::Semaphore;
use std::sync::Arc;

async fn fetch_all(urls: Vec<String>, max_concurrent: usize) -> Vec<Result<Response, Error>> {
    let semaphore = Arc::new(Semaphore::new(max_concurrent));
    let mut handles = vec![];

    for url in urls {
        let permit = semaphore.clone().acquire_owned().await.unwrap();
        handles.push(tokio::spawn(async move {
            let result = reqwest::get(&url).await;
            drop(permit);
            result.map_err(Error::from)
        }));
    }

    let mut results = vec![];
    for handle in handles {
        results.push(handle.await.unwrap());
    }
    results
}
```

## Builder Pattern

### Standard Builder

```rust
#[derive(Debug)]
pub struct HttpRequest {
    url: String,
    method: Method,
    headers: HashMap<String, String>,
    body: Option<Vec<u8>>,
    timeout: Duration,
}

pub struct HttpRequestBuilder {
    url: String,
    method: Method,
    headers: HashMap<String, String>,
    body: Option<Vec<u8>>,
    timeout: Duration,
}

impl HttpRequestBuilder {
    pub fn new(url: impl Into<String>) -> Self {
        Self {
            url: url.into(),
            method: Method::Get,
            headers: HashMap::new(),
            body: None,
            timeout: Duration::from_secs(30),
        }
    }

    pub fn method(self, method: Method) -> Self {
        Self { method, ..self }
    }

    pub fn header(mut self, key: impl Into<String>, value: impl Into<String>) -> Result<Self, AppError> {
        let key = key.into();
        if key.is_empty() {
            return Err(AppError::Internal("header name must not be empty".to_owned()));
        }
        self.headers.insert(key, value.into());
        Ok(self)
    }

    pub fn body(self, body: Vec<u8>) -> Self {
        Self { body: Some(body), ..self }
    }

    pub fn timeout(self, timeout: Duration) -> Self {
        Self { timeout, ..self }
    }

    pub fn build(self) -> HttpRequest {
        HttpRequest {
            url: self.url,
            method: self.method,
            headers: self.headers,
            body: self.body,
            timeout: self.timeout,
        }
    }
}

// Usage
let request = HttpRequestBuilder::new("https://api.example.com/data")
    .method(Method::Post)
    .header("Content-Type", "application/json")?
    .body(b"{}".to_vec())
    .timeout(Duration::from_secs(10))
    .build();
```

### Derive-Based Builder with `derive_builder`

```rust
use derive_builder::Builder;

#[derive(Builder, Debug)]
#[builder(setter(into))]
pub struct Config {
    host: String,
    port: u16,
    #[builder(default = "100")]
    max_connections: usize,
    #[builder(default)]
    tls_enabled: bool,
}

// Usage
let config = ConfigBuilder::default()
    .host("localhost")
    .port(8080u16)
    .tls_enabled(true)
    .build()?;
```

## Newtype Pattern

### For Type Safety

```rust
pub struct Meters(f64);
pub struct Seconds(f64);
pub struct MetersPerSecond(f64);

impl Meters {
    pub fn per(self, time: Seconds) -> MetersPerSecond {
        MetersPerSecond(self.0 / time.0)
    }
}

// Compile error: cannot mix up meters and seconds
// let speed = Seconds(10.0).per(Meters(100.0));  // Won't compile
let speed = Meters(100.0).per(Seconds(10.0));     // Correct
```

### For Validation

```rust
pub struct NonEmptyString(String);

impl NonEmptyString {
    pub fn new(s: impl Into<String>) -> Result<Self, ValidationError> {
        let s = s.into();
        if s.is_empty() {
            return Err(ValidationError::Empty);
        }
        Ok(Self(s))
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl std::fmt::Display for NonEmptyString {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        self.0.fmt(f)
    }
}
```

## Trait Design

### Sealed Traits

Prevent external implementations of a trait:

```rust
mod private {
    pub trait Sealed {}
}

pub trait MyExtension: private::Sealed {
    fn extension_method(&self);
}

// Only types in this crate can implement Sealed, so only they can implement MyExtension
impl private::Sealed for MyType {}
impl MyExtension for MyType {
    fn extension_method(&self) { /* ... */ }
}
```

### Extension Traits

Add methods to foreign types:

```rust
pub trait StringExt {
    fn truncate_to(&self, max_len: usize) -> &str;
}

impl StringExt for str {
    fn truncate_to(&self, max_len: usize) -> &str {
        if self.len() <= max_len {
            self
        } else {
            &self[..self.floor_char_boundary(max_len)]
        }
    }
}

// Usage
let short = "Hello, world!".truncate_to(5); // "Hello"
```

### Marker Traits

Convey properties without methods:

```rust
/// Types that are safe to send across network boundaries.
pub trait NetworkSafe: Send + Sync + serde::Serialize + serde::de::DeserializeOwned {}

// Blanket implementation
impl<T> NetworkSafe for T
where
    T: Send + Sync + serde::Serialize + serde::de::DeserializeOwned,
{}
```

### Trait Objects vs Generics Decision Guide

| Use Case | Prefer |
|----------|--------|
| Performance-critical code | Generics (monomorphization) |
| Heterogeneous collections | Trait objects (`dyn Trait`) |
| Plugin/extension systems | Trait objects |
| Library public API with flexibility | Generics with trait bounds |
| Reduce binary size | Trait objects |
| Compile-time guarantees | Generics |

## Performance Patterns

### Zero-Copy with Borrowing

```rust
// Good: Returns a slice of the original data
fn first_line(text: &str) -> &str {
    text.lines().next().unwrap_or("")
}

// Good: Use Cow for conditional ownership
use std::borrow::Cow;

fn normalize(input: &str) -> Cow<'_, str> {
    if input.contains('\t') {
        Cow::Owned(input.replace('\t', "    "))
    } else {
        Cow::Borrowed(input) // No allocation when no tabs
    }
}
```

### String vs &str

```rust
// Good: Accept &str or anything that can be referenced as a string
fn greet(name: &str) -> String {
    format!("Hello, {name}!")
}

// Good: Accept anything string-like with Into
fn set_name(&mut self, name: impl Into<String>) {
    self.name = name.into();
}

// Bad: Requires caller to allocate a String
fn greet(name: String) -> String {
    format!("Hello, {name}!")
}
```

### Stack vs Heap Allocation

```rust
// Good: Stack-allocated array for small, fixed-size data
fn compute_hash(data: &[u8]) -> [u8; 32] {
    let mut hash = [0u8; 32];
    // ... compute hash ...
    hash
}

// Good: Use SmallVec for usually-small collections
use smallvec::SmallVec;
type Tags = SmallVec<[String; 4]>; // Stack-allocated for <= 4 tags

// Avoid: Unnecessary heap allocation for small data
fn compute_hash(data: &[u8]) -> Vec<u8> {
    let mut hash = vec![0u8; 32]; // Unnecessary heap allocation
    // ... compute hash ...
    hash
}
```

### Avoiding Unnecessary Collect

```rust
// Bad: Collects into Vec just to iterate again
let names: Vec<String> = users
    .iter()
    .map(|u| u.name.clone())
    .collect();
let upper: Vec<String> = names
    .iter()
    .map(|n| n.to_uppercase())
    .collect();

// Good: Chain iterators without intermediate collection
let upper: Vec<String> = users
    .iter()
    .map(|u| u.name.to_uppercase())
    .collect();
```

## Crate Organization

### Standard Layout

```text
my_crate/
  src/
    lib.rs             # Public API, re-exports
    main.rs            # Binary entry point (optional)
    error.rs           # Error types
    config.rs          # Configuration
    models/
      mod.rs
      user.rs
      order.rs
    services/
      mod.rs
      auth.rs
      payment.rs
    handlers/
      mod.rs
      api.rs
      health.rs
  tests/
    integration_test.rs
    common/
      mod.rs           # Shared test utilities
  benches/
    benchmarks.rs
  examples/
    basic_usage.rs
  Cargo.toml
  Cargo.lock
  rustfmt.toml
  clippy.toml
```

### Re-exports for Clean Public API

```rust
// src/lib.rs
pub mod config;
pub mod error;
mod handlers;
mod services;

// Re-export key types at crate root
pub use config::Config;
pub use error::AppError;

// Public API
pub fn run(config: Config) -> Result<(), AppError> {
    // ...
    Ok(())
}
```

## Tooling Integration

### Essential Commands

```bash
# Build
cargo build
cargo build --release

# Test
cargo test
cargo test --release

# Lint
cargo clippy -- -D warnings

# Format
cargo fmt
cargo fmt -- --check

# Documentation
cargo doc --open
cargo doc --no-deps

# Security
cargo audit
cargo deny check

# Benchmarks
cargo bench

# Unused dependencies
cargo machete
```

### Recommended Clippy Configuration (clippy.toml)

```toml
cognitive-complexity-threshold = 25
too-many-arguments-threshold = 7
type-complexity-threshold = 250
```

## Quick Reference: Rust Idioms

| Idiom | Description |
|-------|-------------|
| Borrow, don't own | Accept `&T` or `&str` when you only need to read |
| Make invalid states unrepresentable | Use enums and newtypes to encode invariants |
| Parse, don't validate | Convert unstructured data to structured types at boundaries |
| Prefer iterators over indexing | Use `.iter()`, `.map()`, `.filter()` over manual loops |
| Error context, not error strings | Wrap errors with `context()` or `with_context()` |
| Derive everything useful | `#[derive(Debug, Clone, PartialEq)]` on most types |
| Use `impl Trait` in argument position | For simple, single-use trait bounds |
| Avoid `unwrap` in production code | Use `?`, `unwrap_or`, `unwrap_or_else`, or `expect` with a message |

## Anti-Patterns to Avoid

```rust
// Bad: Clone to satisfy the borrow checker
fn process(data: &Data) {
    let cloned = data.clone(); // Unnecessary -- fix the borrowing instead
    // ...
}

// Bad: String as error type
fn parse(input: &str) -> Result<Config, String> {
    // Use a proper error type
}

// Bad: Panic for recoverable errors in libraries
pub fn connect(addr: &str) -> Connection {
    TcpStream::connect(addr).unwrap() // Will panic on failure
}

// Bad: Using index access without bounds check
fn get_item(items: &[Item], idx: usize) -> &Item {
    &items[idx] // Panics on out of bounds
}

// Good: Return Option
fn get_item(items: &[Item], idx: usize) -> Option<&Item> {
    items.get(idx)
}

// Bad: Mutex for single-threaded code
let data = Mutex::new(vec![1, 2, 3]); // Use RefCell in single-threaded context

// Bad: Box<dyn Error> everywhere
fn do_thing() -> Result<(), Box<dyn std::error::Error>> {
    // Define proper error types with thiserror
}

// Bad: Stringly-typed state
struct Order {
    status: String, // "pending", "shipped", "delivered"
}

// Good: Enum state
enum OrderStatus {
    Pending,
    Shipped { tracking: String },
    Delivered { timestamp: DateTime<Utc> },
}
```

**Remember**: Rust's compiler is your best reviewer. If it compiles, many classes of bugs are already eliminated. Lean into the type system, use ownership idiomatically, and let the compiler guide you toward safe, performant code.
