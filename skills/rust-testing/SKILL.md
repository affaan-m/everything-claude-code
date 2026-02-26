---
name: rust-testing
description: Comprehensive Rust testing patterns including unit tests, integration tests, property-based testing, doc tests, and benchmarking.
origin: ECC
---

# Rust Testing Patterns

Comprehensive testing strategies for Rust applications.

## When to Activate

- Writing tests for Rust code
- Setting up test infrastructure
- Adding property-based or fuzz tests
- Configuring CI test pipelines for Rust

## TDD Workflow

### RED: Write the failing test

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn validates_email_format() {
        assert!(Email::parse("user@example.com").is_ok());
        assert!(Email::parse("invalid").is_err());
        assert!(Email::parse("").is_err());
    }
}
```

### GREEN: Minimal implementation

```rust
pub struct Email(String);

impl Email {
    pub fn parse(value: &str) -> Result<Self, ValidationError> {
        if value.contains('@') && !value.is_empty() {
            Ok(Self(value.to_string()))
        } else {
            Err(ValidationError::InvalidEmail)
        }
    }
}
```

### REFACTOR: Improve without changing behavior

## Unit Test Module

```rust
// src/service.rs
pub fn calculate_discount(price: f64, tier: &CustomerTier) -> f64 {
    match tier {
        CustomerTier::Bronze => price * 0.05,
        CustomerTier::Silver => price * 0.10,
        CustomerTier::Gold => price * 0.20,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use approx::assert_relative_eq;

    #[test]
    fn bronze_gets_5_percent() {
        assert_relative_eq!(calculate_discount(100.0, &CustomerTier::Bronze), 5.0);
    }

    #[test]
    fn gold_gets_20_percent() {
        assert_relative_eq!(calculate_discount(100.0, &CustomerTier::Gold), 20.0);
    }

    #[test]
    fn zero_price_returns_zero() {
        assert_relative_eq!(calculate_discount(0.0, &CustomerTier::Gold), 0.0);
    }
}
```

## Integration Tests

Place in `tests/` directory:

```rust
// tests/api_integration.rs
use my_app::{create_app, TestDb};

#[tokio::test]
async fn create_and_retrieve_user() {
    let db = TestDb::new().await;
    let app = create_app(db.pool()).await;

    let response = app
        .post("/api/users")
        .json(&json!({"name": "Alice", "email": "alice@example.com"}))
        .await;

    assert_eq!(response.status(), StatusCode::CREATED);

    let user: User = response.json().await;
    assert_eq!(user.name, "Alice");

    // Verify persistence
    let fetched = app
        .get(&format!("/api/users/{}", user.id))
        .await;

    assert_eq!(fetched.status(), StatusCode::OK);
}
```

### Shared Test Helpers

```rust
// tests/common/mod.rs
pub struct TestDb {
    pool: PgPool,
    db_name: String,
}

impl TestDb {
    pub async fn new() -> Self {
        let db_name = format!("test_{}", Uuid::new_v4().to_string().replace('-', ""));
        // Create isolated test database
        let admin_pool = PgPool::connect(&admin_url()).await.unwrap();
        sqlx::query(&format!("CREATE DATABASE {db_name}"))
            .execute(&admin_pool)
            .await
            .unwrap();

        let pool = PgPool::connect(&format!("{}/{db_name}", base_url()))
            .await
            .unwrap();

        sqlx::migrate!().run(&pool).await.unwrap();

        Self { pool, db_name }
    }

    pub fn pool(&self) -> &PgPool { &self.pool }
}

impl Drop for TestDb {
    fn drop(&mut self) {
        // Cleanup handled by Drop
    }
}
```

## Mock Traits

```rust
// Define trait for dependency
pub trait UserRepository: Send + Sync {
    async fn find_by_id(&self, id: &str) -> Result<Option<User>>;
    async fn save(&self, user: &User) -> Result<()>;
}

// Mock implementation for testing
#[cfg(test)]
pub struct MockUserRepo {
    users: std::sync::Mutex<Vec<User>>,
}

#[cfg(test)]
impl MockUserRepo {
    pub fn new() -> Self {
        Self { users: std::sync::Mutex::new(vec![]) }
    }

    pub fn with_users(users: Vec<User>) -> Self {
        Self { users: std::sync::Mutex::new(users) }
    }
}

#[cfg(test)]
impl UserRepository for MockUserRepo {
    async fn find_by_id(&self, id: &str) -> Result<Option<User>> {
        Ok(self.users.lock().unwrap().iter().find(|u| u.id == id).cloned())
    }

    async fn save(&self, user: &User) -> Result<()> {
        self.users.lock().unwrap().push(user.clone());
        Ok(())
    }
}
```

## Property-Based Testing with proptest

```rust
use proptest::prelude::*;

proptest! {
    #[test]
    fn roundtrip_serialization(value in "[a-zA-Z0-9 ]{1,100}") {
        let encoded = encode(&value);
        let decoded = decode(&encoded).unwrap();
        prop_assert_eq!(value, decoded);
    }

    #[test]
    fn sort_preserves_length(mut vec in prop::collection::vec(any::<i32>(), 0..100)) {
        let original_len = vec.len();
        vec.sort();
        prop_assert_eq!(vec.len(), original_len);
    }

    #[test]
    fn price_is_never_negative(
        base in 0.0f64..10000.0,
        discount in 0.0f64..1.0
    ) {
        let final_price = apply_discount(base, discount);
        prop_assert!(final_price >= 0.0);
    }
}
```

## Doc Tests

```rust
/// Parses a duration string like "5s", "10m", "2h".
///
/// # Examples
///
/// ```
/// use my_crate::parse_duration;
///
/// let duration = parse_duration("5s").unwrap();
/// assert_eq!(duration, std::time::Duration::from_secs(5));
///
/// let duration = parse_duration("10m").unwrap();
/// assert_eq!(duration, std::time::Duration::from_secs(600));
/// ```
///
/// # Errors
///
/// Returns `ParseError` for invalid formats:
///
/// ```
/// use my_crate::parse_duration;
///
/// assert!(parse_duration("invalid").is_err());
/// assert!(parse_duration("").is_err());
/// ```
pub fn parse_duration(input: &str) -> Result<Duration, ParseError> {
    // implementation
}
```

## Benchmarking with Criterion

```rust
// benches/my_benchmark.rs
use criterion::{black_box, criterion_group, criterion_main, Criterion, BenchmarkId};

fn bench_sorting(c: &mut Criterion) {
    let mut group = c.benchmark_group("sorting");

    for size in [100, 1000, 10000] {
        group.bench_with_input(BenchmarkId::new("quicksort", size), &size, |b, &size| {
            let data: Vec<i32> = (0..size).rev().collect();
            b.iter(|| {
                let mut d = data.clone();
                quicksort(black_box(&mut d));
            });
        });
    }

    group.finish();
}

criterion_group!(benches, bench_sorting);
criterion_main!(benches);
```

## Async Testing

```rust
#[tokio::test]
async fn fetches_data_with_timeout() {
    let result = tokio::time::timeout(
        Duration::from_secs(5),
        fetch_data("https://api.example.com/data"),
    )
    .await;

    assert!(result.is_ok(), "request timed out");
    assert!(result.unwrap().is_ok());
}
```

## Coverage with cargo-tarpaulin

```bash
# Generate HTML report
cargo tarpaulin --out html --output-dir coverage/

# Generate lcov for CI
cargo tarpaulin --out lcov --output-dir coverage/

# With threshold
cargo tarpaulin --fail-under 80
```

## Test Commands Reference

```bash
cargo test                          # Run all tests
cargo test -- --nocapture           # Show println output
cargo test test_name                # Run specific test
cargo test --test integration       # Run integration tests only
cargo test --doc                    # Run doc tests only
cargo test -- --ignored             # Run ignored tests
cargo bench                         # Run benchmarks
cargo tarpaulin                     # Coverage report
```

## Best Practices

**DO:**
- Test public API, not implementation details
- Use descriptive test names: `rejects_expired_token`
- One assertion per test when possible
- Use `#[should_panic(expected = "message")]` for panic tests
- Clean up test resources with `Drop`

**DON'T:**
- Test private functions directly (test through public API)
- Use `#[ignore]` without a reason comment
- Depend on test execution order
- Share mutable state between tests
- Use `sleep` in tests (use `tokio::time::pause`)

**Remember**: Rust's type system catches many bugs at compile time. Focus tests on runtime behavior, business logic, and edge cases that types cannot express.
