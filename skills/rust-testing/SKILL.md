---
name: rust-testing
description: Comprehensive Rust testing patterns including unit tests, integration tests, property-based testing, doc tests, and benchmarking.
origin: ECC
---

# Rust Testing Patterns

Comprehensive Rust testing patterns for writing reliable, maintainable tests following TDD methodology.

## When to Use

- Writing new Rust functions or methods
- Adding test coverage to existing Rust code
- Creating benchmarks for performance-critical Rust code
- Implementing property-based tests for correctness
- Following TDD workflow in Rust projects

## How It Works

Follow the RED-GREEN-REFACTOR cycle: write a failing test, implement minimal code to pass, then refactor. Use `#[cfg(test)]` modules for unit tests, `tests/` directory for integration tests, `proptest` for property-based testing, `criterion` for benchmarks, and `cargo-tarpaulin` for coverage.

## Examples

### TDD Workflow for Rust

#### The RED-GREEN-REFACTOR Cycle

```
RED     -> Write a failing test first
GREEN   -> Write minimal code to pass the test
REFACTOR -> Improve code while keeping tests green
REPEAT  -> Continue with next requirement
```

#### Step-by-Step TDD in Rust

```rust
// Step 1: Define the function signature
// src/calculator.rs
pub fn add(a: i32, b: i32) -> i32 {
    todo!() // Placeholder -- will panic if called
}

// Step 2: Write failing test (RED)
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add_positive_numbers() {
        assert_eq!(add(2, 3), 5);
    }
}

// Step 3: Run test - verify FAIL
// $ cargo test
// thread 'tests::test_add_positive_numbers' panicked at 'not yet implemented'

// Step 4: Implement minimal code (GREEN)
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

// Step 5: Run test - verify PASS
// $ cargo test
// test tests::test_add_positive_numbers ... ok

// Step 6: Add more test cases, refactor as needed
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add_positive_numbers() {
        assert_eq!(add(2, 3), 5);
    }

    #[test]
    fn test_add_negative_numbers() {
        assert_eq!(add(-1, -2), -3);
    }

    #[test]
    fn test_add_mixed_signs() {
        assert_eq!(add(-1, 1), 0);
    }
}
```

### Unit Test Modules

Place unit tests in the same file using `#[cfg(test)]` to ensure they are excluded from production builds.

#### Basic Structure

```rust
// src/parser.rs
pub fn parse_number(input: &str) -> Result<i64, ParseError> {
    input.trim().parse::<i64>().map_err(|e| ParseError::InvalidNumber {
        input: input.to_owned(),
        source: e,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_valid_number() {
        assert_eq!(parse_number("42").unwrap(), 42);
    }

    #[test]
    fn parse_negative_number() {
        assert_eq!(parse_number("-7").unwrap(), -7);
    }

    #[test]
    fn parse_with_whitespace() {
        assert_eq!(parse_number("  123  ").unwrap(), 123);
    }

    #[test]
    fn parse_invalid_returns_error() {
        assert!(parse_number("abc").is_err());
    }

    #[test]
    fn parse_empty_returns_error() {
        assert!(parse_number("").is_err());
    }

    #[test]
    fn parse_overflow_returns_error() {
        assert!(parse_number("99999999999999999999").is_err());
    }
}
```

#### Testing Private Functions

Unit tests in the same module have access to private items:

```rust
fn internal_hash(data: &[u8]) -> u64 {
    // Private function
    let mut hash: u64 = 0;
    for &byte in data {
        hash = hash.wrapping_mul(31).wrapping_add(byte as u64);
    }
    hash
}

pub fn verify_integrity(data: &[u8], expected: u64) -> bool {
    internal_hash(data) == expected
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_internal_hash_deterministic() {
        let data = b"hello";
        assert_eq!(internal_hash(data), internal_hash(data));
    }

    #[test]
    fn test_internal_hash_different_for_different_input() {
        assert_ne!(internal_hash(b"hello"), internal_hash(b"world"));
    }

    #[test]
    fn test_verify_integrity_valid() {
        let data = b"test data";
        let hash = internal_hash(data);
        assert!(verify_integrity(data, hash));
    }
}
```

### Integration Tests

Integration tests live in the `tests/` directory and can only access the crate's public API.

#### Structure

```text
my_crate/
  src/
    lib.rs
  tests/
    common/
      mod.rs          # Shared helpers
    api_tests.rs
    storage_tests.rs
```

#### Shared Test Helpers

```rust
// tests/common/mod.rs
use my_crate::Config;

pub fn test_config() -> Config {
    Config {
        database_url: "sqlite::memory:".to_owned(),
        port: 0, // Random available port
        log_level: "debug".to_owned(),
    }
}

pub struct TestServer {
    pub addr: String,
    pub client: reqwest::Client,
}

impl TestServer {
    pub async fn new() -> Self {
        let config = test_config();
        let app = my_crate::build_app(config).await;
        let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
        let addr = format!("http://{}", listener.local_addr().unwrap());

        tokio::spawn(async move {
            axum::serve(listener, app).await.unwrap();
        });

        Self {
            addr,
            client: reqwest::Client::new(),
        }
    }

    pub fn url(&self, path: &str) -> String {
        format!("{}{}", self.addr, path)
    }
}
```

#### Integration Test File

```rust
// tests/api_tests.rs
mod common;

use common::TestServer;

#[tokio::test]
async fn test_health_endpoint() {
    let server = TestServer::new().await;
    let resp = server.client.get(server.url("/health")).send().await.unwrap();
    assert_eq!(resp.status(), 200);
}

#[tokio::test]
async fn test_create_and_get_user() {
    let server = TestServer::new().await;

    // Create user
    let create_resp = server
        .client
        .post(server.url("/users"))
        .json(&serde_json::json!({"name": "Alice", "email": "alice@example.com"}))
        .send()
        .await
        .unwrap();
    assert_eq!(create_resp.status(), 201);

    let user: serde_json::Value = create_resp.json().await.unwrap();
    let user_id = user["id"].as_str().unwrap();

    // Get user
    let get_resp = server
        .client
        .get(server.url(&format!("/users/{user_id}")))
        .send()
        .await
        .unwrap();
    assert_eq!(get_resp.status(), 200);

    let fetched: serde_json::Value = get_resp.json().await.unwrap();
    assert_eq!(fetched["name"], "Alice");
}
```

### Mock Traits

#### Manual Mocking with Trait Implementations

```rust
// Define the trait
pub trait UserRepository: Send + Sync {
    fn find_by_id(&self, id: &str) -> Result<Option<User>, StorageError>;
    fn save(&self, user: &User) -> Result<(), StorageError>;
    fn delete(&self, id: &str) -> Result<(), StorageError>;
}

// Production implementation
pub struct PostgresUserRepository {
    pool: PgPool,
}

impl UserRepository for PostgresUserRepository {
    fn find_by_id(&self, id: &str) -> Result<Option<User>, StorageError> {
        // Real database query
        todo!()
    }

    fn save(&self, user: &User) -> Result<(), StorageError> {
        todo!()
    }

    fn delete(&self, id: &str) -> Result<(), StorageError> {
        todo!()
    }
}

// Test mock
#[cfg(test)]
pub struct MockUserRepository {
    pub users: std::sync::Mutex<HashMap<String, User>>,
}

#[cfg(test)]
impl MockUserRepository {
    pub fn new() -> Self {
        Self {
            users: std::sync::Mutex::new(HashMap::new()),
        }
    }

    pub fn with_users(users: Vec<User>) -> Self {
        let map: HashMap<String, User> = users
            .into_iter()
            .map(|u| (u.id.clone(), u))
            .collect();
        Self {
            users: std::sync::Mutex::new(map),
        }
    }
}

#[cfg(test)]
impl UserRepository for MockUserRepository {
    fn find_by_id(&self, id: &str) -> Result<Option<User>, StorageError> {
        let users = self.users.lock().unwrap();
        Ok(users.get(id).cloned())
    }

    fn save(&self, user: &User) -> Result<(), StorageError> {
        let mut users = self.users.lock().unwrap();
        users.insert(user.id.clone(), user.clone());
        Ok(())
    }

    fn delete(&self, id: &str) -> Result<(), StorageError> {
        let mut users = self.users.lock().unwrap();
        users.remove(id);
        Ok(())
    }
}

// Test using mock
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_user_service_find_existing() {
        let repo = MockUserRepository::with_users(vec![User {
            id: "1".into(),
            name: "Alice".into(),
            email: "alice@example.com".into(),
        }]);

        let service = UserService::new(repo);
        let user = service.get_user("1").unwrap();
        assert_eq!(user.unwrap().name, "Alice");
    }

    #[test]
    fn test_user_service_find_missing() {
        let repo = MockUserRepository::new();
        let service = UserService::new(repo);
        let user = service.get_user("nonexistent").unwrap();
        assert!(user.is_none());
    }
}
```

#### Using `mockall` Crate

```rust
use mockall::automock;

#[automock]
pub trait Cache {
    fn get(&self, key: &str) -> Option<String>;
    fn set(&mut self, key: &str, value: &str) -> Result<(), CacheError>;
    fn delete(&mut self, key: &str) -> Result<(), CacheError>;
}

#[cfg(test)]
mod tests {
    use super::*;
    use mockall::predicate::*;

    #[test]
    fn test_cache_hit() {
        let mut mock = MockCache::new();
        mock.expect_get()
            .with(eq("user:1"))
            .times(1)
            .returning(|_| Some("Alice".to_owned()));

        let result = mock.get("user:1");
        assert_eq!(result, Some("Alice".to_owned()));
    }

    #[test]
    fn test_cache_miss_then_set() {
        let mut mock = MockCache::new();
        mock.expect_get()
            .with(eq("user:1"))
            .times(1)
            .returning(|_| None);
        mock.expect_set()
            .with(eq("user:1"), eq("Alice"))
            .times(1)
            .returning(|_, _| Ok(()));

        assert!(mock.get("user:1").is_none());
        assert!(mock.set("user:1", "Alice").is_ok());
    }
}
```

### Property-Based Testing with `proptest`

#### Basic Property Tests

```rust
use proptest::prelude::*;

proptest! {
    #[test]
    fn test_reverse_reverse_is_identity(s in "\\PC*") {
        let reversed: String = s.chars().rev().collect();
        let double_reversed: String = reversed.chars().rev().collect();
        prop_assert_eq!(&s, &double_reversed);
    }

    #[test]
    fn test_sort_preserves_length(mut vec in prop::collection::vec(any::<i32>(), 0..100)) {
        let original_len = vec.len();
        vec.sort();
        prop_assert_eq!(vec.len(), original_len);
    }

    #[test]
    fn test_sort_is_ordered(mut vec in prop::collection::vec(any::<i32>(), 0..100)) {
        vec.sort();
        for window in vec.windows(2) {
            prop_assert!(window[0] <= window[1]);
        }
    }
}
```

#### Custom Strategies

```rust
use proptest::prelude::*;

#[derive(Debug, Clone)]
struct Email {
    local: String,
    domain: String,
}

impl Email {
    fn as_string(&self) -> String {
        format!("{}@{}", self.local, self.domain)
    }
}

fn email_strategy() -> impl Strategy<Value = Email> {
    (
        "[a-zA-Z][a-zA-Z0-9.]{0,20}",      // local part
        "[a-zA-Z]{2,10}\\.[a-zA-Z]{2,4}",   // domain
    )
        .prop_map(|(local, domain)| Email { local, domain })
}

proptest! {
    #[test]
    fn test_email_parsing(email in email_strategy()) {
        let raw = email.as_string();
        let parsed = parse_email(&raw);
        prop_assert!(parsed.is_ok(), "Failed to parse: {}", raw);
        let parsed = parsed.unwrap();
        prop_assert_eq!(&parsed.local, &email.local);
        prop_assert_eq!(&parsed.domain, &email.domain);
    }
}
```

#### Shrinking and Debugging

```rust
proptest! {
    // proptest automatically shrinks failing inputs to minimal reproductions
    #[test]
    fn test_serialization_roundtrip(
        name in "[a-zA-Z ]{1,50}",
        age in 0u32..150,
        score in -100.0f64..100.0,
    ) {
        let user = User { name: name.clone(), age, score };
        let json = serde_json::to_string(&user).unwrap();
        let parsed: User = serde_json::from_str(&json).unwrap();
        prop_assert_eq!(&parsed.name, &name);
        prop_assert_eq!(parsed.age, age);
        // Float comparison with tolerance
        prop_assert!((parsed.score - score).abs() < f64::EPSILON);
    }
}
```

### Doc Tests

Documentation examples that are automatically compiled and tested.

#### Basic Doc Tests

```rust
/// Splits a string by a delimiter and returns the parts.
///
/// # Examples
///
/// ```
/// use my_crate::split;
///
/// let parts = split("a,b,c", ',');
/// assert_eq!(parts, vec!["a", "b", "c"]);
/// ```
///
/// Empty strings produce a single empty element:
///
/// ```
/// use my_crate::split;
///
/// let parts = split("", ',');
/// assert_eq!(parts, vec![""]);
/// ```
pub fn split(input: &str, delimiter: char) -> Vec<&str> {
    input.split(delimiter).collect()
}
```

#### Doc Tests Showing Error Handling

```rust
/// Parses a configuration string in `KEY=VALUE` format.
///
/// # Examples
///
/// ```
/// use my_crate::parse_kv;
///
/// let (key, value) = parse_kv("HOST=localhost").unwrap();
/// assert_eq!(key, "HOST");
/// assert_eq!(value, "localhost");
/// ```
///
/// # Errors
///
/// Returns an error if the input does not contain `=`:
///
/// ```
/// use my_crate::parse_kv;
///
/// assert!(parse_kv("invalid").is_err());
/// ```
pub fn parse_kv(input: &str) -> Result<(&str, &str), ParseError> {
    input
        .split_once('=')
        .ok_or(ParseError::MissingDelimiter)
}
```

#### Hiding Setup Code in Doc Tests

```rust
/// Processes a batch of records.
///
/// # Examples
///
/// ```
/// # use my_crate::{Record, process_batch};
/// # fn main() -> Result<(), Box<dyn std::error::Error>> {
/// let records = vec![
///     Record::new("a", 1),
///     Record::new("b", 2),
/// ];
/// let result = process_batch(&records)?;
/// assert_eq!(result.total, 3);
/// # Ok(())
/// # }
/// ```
pub fn process_batch(records: &[Record]) -> Result<BatchResult, ProcessError> {
    // ...
    todo!()
}
```

### Criterion Benchmarks

#### Setup

```toml
# Cargo.toml
[dev-dependencies]
criterion = { version = "0.5", features = ["html_reports"] }

[[bench]]
name = "my_benchmark"
harness = false
```

#### Basic Benchmark

```rust
// benches/my_benchmark.rs
use criterion::{black_box, criterion_group, criterion_main, Criterion};
use my_crate::process;

fn bench_process(c: &mut Criterion) {
    let data = generate_test_data(1000);

    c.bench_function("process 1000 items", |b| {
        b.iter(|| process(black_box(&data)))
    });
}

criterion_group!(benches, bench_process);
criterion_main!(benches);
```

#### Benchmark Groups with Different Sizes

```rust
use criterion::{criterion_group, criterion_main, BenchmarkId, Criterion};

fn bench_sort(c: &mut Criterion) {
    let mut group = c.benchmark_group("sort");

    for size in [100, 1_000, 10_000, 100_000] {
        group.bench_with_input(
            BenchmarkId::from_parameter(size),
            &size,
            |b, &size| {
                let data: Vec<i32> = (0..size).rev().collect();
                b.iter(|| {
                    let mut copy = data.clone();
                    copy.sort();
                    copy
                });
            },
        );
    }
    group.finish();
}

criterion_group!(benches, bench_sort);
criterion_main!(benches);
```

#### Comparing Implementations

```rust
fn bench_string_building(c: &mut Criterion) {
    let parts: Vec<String> = (0..100).map(|i| format!("item_{i}")).collect();
    let mut group = c.benchmark_group("string_building");

    group.bench_function("push_str", |b| {
        b.iter(|| {
            let mut result = String::new();
            for part in &parts {
                result.push_str(part);
                result.push(',');
            }
            result
        });
    });

    group.bench_function("join", |b| {
        b.iter(|| parts.join(","));
    });

    group.bench_function("format", |b| {
        b.iter(|| {
            let mut result = String::new();
            for part in &parts {
                result = format!("{result}{part},");
            }
            result
        });
    });

    group.finish();
}
```

### Coverage with `cargo-tarpaulin`

#### Running Coverage

```bash
# Install
cargo install cargo-tarpaulin

# Basic coverage report
cargo tarpaulin

# HTML report
cargo tarpaulin --out Html --output-dir target/coverage

# XML report for CI
cargo tarpaulin --out Xml

# With branch coverage
cargo tarpaulin --branch

# Exclude test code from coverage metrics
cargo tarpaulin --ignore-tests

# Exclude specific files
cargo tarpaulin --exclude-files "src/generated/*"

# Only measure specific packages in a workspace
cargo tarpaulin -p my_core_crate
```

#### Coverage Targets

| Code Type | Target |
|-----------|--------|
| Critical business logic | 100% |
| Public API surface | 90%+ |
| General application code | 80%+ |
| Generated code | Exclude |
| Test helpers | Exclude |

### Async Testing

#### With Tokio

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_async_fetch() {
        let client = HttpClient::new();
        let result = client.get("https://httpbin.org/get").await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_concurrent_operations() {
        let (tx, mut rx) = tokio::sync::mpsc::channel(10);

        tokio::spawn(async move {
            for i in 0..5 {
                tx.send(i).await.unwrap();
            }
        });

        let mut received = vec![];
        while let Some(val) = rx.recv().await {
            received.push(val);
        }

        assert_eq!(received, vec![0, 1, 2, 3, 4]);
    }

    #[tokio::test(flavor = "multi_thread", worker_threads = 2)]
    async fn test_multi_threaded() {
        // Test that requires actual multi-threaded runtime
        let result = spawn_parallel_work().await;
        assert!(result.is_ok());
    }
}
```

#### Timeout Tests

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use tokio::time::{timeout, Duration};

    #[tokio::test]
    async fn test_operation_completes_within_timeout() {
        let result = timeout(Duration::from_secs(5), slow_operation()).await;
        assert!(result.is_ok(), "operation timed out");
    }
}
```

### Test Utilities

#### Custom Assertion Macros

```rust
#[cfg(test)]
macro_rules! assert_err {
    ($result:expr, $expected:pat) => {
        match $result {
            Err($expected) => {}
            Err(other) => panic!("expected {}, got {:?}", stringify!($expected), other),
            Ok(val) => panic!("expected error {}, got Ok({:?})", stringify!($expected), val),
        }
    };
}

#[cfg(test)]
macro_rules! assert_approx_eq {
    ($a:expr, $b:expr, $tolerance:expr) => {
        let diff = ($a - $b).abs();
        assert!(
            diff < $tolerance,
            "assertion failed: |{} - {}| = {} >= {}",
            $a, $b, diff, $tolerance
        );
    };
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_division_by_zero() {
        assert_err!(safe_divide(1.0, 0.0), MathError::DivisionByZero);
    }

    #[test]
    fn test_float_calculation() {
        assert_approx_eq!(compute_pi(), std::f64::consts::PI, 1e-10);
    }
}
```

#### Test Fixtures with `rstest`

```rust
use rstest::rstest;

#[rstest]
#[case("hello", 5)]
#[case("", 0)]
#[case("rust", 4)]
fn test_string_length(#[case] input: &str, #[case] expected: usize) {
    assert_eq!(input.len(), expected);
}

#[rstest]
fn test_with_fixture(#[values(1, 2, 3, 4, 5)] n: i32) {
    assert!(n > 0);
    assert!(n <= 5);
}
```

### Testing Commands

```bash
# Run all tests
cargo test

# Run with output visible
cargo test -- --nocapture

# Run specific test
cargo test test_add_positive

# Run tests matching pattern
cargo test parse

# Run only doc tests
cargo test --doc

# Run only integration tests
cargo test --test integration_test

# Run tests in release mode (optimized)
cargo test --release

# Run ignored (slow) tests
cargo test -- --ignored

# Run all tests including ignored
cargo test -- --include-ignored

# List all tests without running
cargo test -- --list

# Run with specific number of threads
cargo test -- --test-threads=1

# Run benchmarks
cargo bench

# Run with coverage
cargo tarpaulin --out Html

# Run property tests with more cases
PROPTEST_CASES=10000 cargo test
```

### Best Practices

**DO:**
- Write tests FIRST (TDD)
- Use `#[cfg(test)]` modules for unit tests
- Place integration tests in `tests/` directory
- Test error paths as thoroughly as happy paths
- Use property-based testing for algorithmic code
- Write doc tests for public API examples
- Use `assert_eq!` over `assert!` for better error messages
- Keep tests focused on one behavior each
- Name tests descriptively: `test_parse_returns_error_for_empty_input`

**DO NOT:**
- Use `unwrap()` in production code to make tests pass
- Skip testing error conditions
- Write tests that depend on execution order
- Use `thread::sleep` for synchronization (use channels or barriers)
- Ignore flaky tests (fix the root cause)
- Test private implementation details through public API when possible
- Commit with failing tests

### CI Integration

```yaml
# GitHub Actions example
name: Rust CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable

      - name: Check formatting
        run: cargo fmt -- --check

      - name: Clippy lints
        run: cargo clippy -- -D warnings

      - name: Run tests
        run: cargo test

      - name: Run doc tests
        run: cargo test --doc

      - name: Security audit
        run: cargo audit

      - name: Coverage
        run: |
          cargo install cargo-tarpaulin
          cargo tarpaulin --out Xml
          # Upload to coverage service
```

**Remember**: Tests are documentation that never goes stale. They show exactly how your code is meant to be used and what behaviors are guaranteed. Write them clearly, keep them fast, and treat them as first-class code.
