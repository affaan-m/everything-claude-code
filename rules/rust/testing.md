---
paths:
  - "**/*.rs"
  - "**/Cargo.toml"
  - "**/Cargo.lock"
---
# Rust Testing

> This file extends [common/testing.md](../common/testing.md) with Rust specific content.

## Framework

Use the built-in `#[test]` attribute with `#[cfg(test)]` module.

## Unit Tests

Place tests in the same file as the code:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_valid_input() {
        let result = parse("hello");
        assert_eq!(result, Ok("hello".to_string()));
    }

    #[test]
    fn rejects_empty_input() {
        let result = parse("");
        assert!(result.is_err());
    }
}
```

## Integration Tests

Place in `tests/` directory at crate root:

```rust
// tests/api_test.rs
use my_crate::Client;

#[tokio::test]
async fn creates_user_successfully() {
    let client = Client::new("http://localhost:3000");
    let user = client.create_user("test@example.com").await.unwrap();
    assert_eq!(user.email, "test@example.com");
}
```

## Property-Based Testing

Use `proptest` for generative testing:

```rust
use proptest::prelude::*;

proptest! {
    #[test]
    fn roundtrip_serialization(value: String) {
        let encoded = encode(&value);
        let decoded = decode(&encoded).unwrap();
        assert_eq!(value, decoded);
    }
}
```

## Coverage

```bash
cargo tarpaulin --out html        # HTML coverage report
cargo tarpaulin --out lcov        # CI-friendly format
```

## Reference

See skill: `rust-testing` for detailed Rust testing patterns and helpers.
