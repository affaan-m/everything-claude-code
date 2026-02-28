---
paths:
  - "**/*.rs"
  - "**/Cargo.toml"
  - "**/Cargo.lock"
---
# Rust Testing

> This file extends [common/testing.md](../common/testing.md) with Rust-specific content.

## Framework

Use the standard `cargo test` with inline test modules and the `tests/` directory for integration tests.

## Unit Tests

Place unit tests in the same file as the code under test using `#[cfg(test)]`:

```rust
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add_positive() {
        assert_eq!(add(2, 3), 5);
    }

    #[test]
    fn test_add_negative() {
        assert_eq!(add(-1, -2), -3);
    }

    #[test]
    fn test_add_zero() {
        assert_eq!(add(0, 0), 0);
    }
}
```

## Integration Tests

Place integration tests in the `tests/` directory at the crate root:

```text
my_crate/
  src/
    lib.rs
  tests/
    integration_test.rs
    common/
      mod.rs          # Shared test helpers
```

```rust
// tests/integration_test.rs
use my_crate::Client;

#[test]
fn test_full_workflow() {
    let client = Client::new(test_config());
    let result = client.process("input");
    assert!(result.is_ok());
}
```

## Property-Based Testing with `proptest`

```rust
// Cargo.toml
// [dev-dependencies]
// proptest = "1"

use proptest::prelude::*;

proptest! {
    #[test]
    fn test_sort_is_idempotent(mut vec in prop::collection::vec(any::<i32>(), 0..100)) {
        vec.sort();
        let sorted = vec.clone();
        vec.sort();
        prop_assert_eq!(vec, sorted);
    }

    #[test]
    fn test_parse_roundtrip(s in "[a-zA-Z0-9]{1,50}") {
        let parsed = parse(&s);
        let rendered = render(&parsed);
        prop_assert_eq!(s, rendered);
    }
}
```

## Doc Tests

Write documentation examples that are automatically tested:

```rust
/// Adds two numbers together.
///
/// # Examples
///
/// ```
/// use my_crate::add;
///
/// assert_eq!(add(2, 3), 5);
/// assert_eq!(add(-1, 1), 0);
/// ```
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}
```

## Coverage

Use `cargo-tarpaulin` for code coverage:

```bash
# Install
cargo install cargo-tarpaulin

# Run with default settings
cargo tarpaulin

# Generate HTML report
cargo tarpaulin --out Html

# With branch coverage
cargo tarpaulin --branch

# Exclude test code from coverage
cargo tarpaulin --ignore-tests
```

## Running Tests

```bash
# Run all tests
cargo test

# Run with output capture disabled (see println)
cargo test -- --nocapture

# Run specific test
cargo test test_add_positive

# Run tests matching a pattern
cargo test parse

# Run only doc tests
cargo test --doc

# Run only integration tests
cargo test --test integration_test

# Run tests in release mode
cargo test --release

# Run ignored tests
cargo test -- --ignored
```

## Reference

See skill: `rust-testing` for detailed Rust testing patterns and helpers.
