---
paths:
  - "**/*.rs"
  - "**/Cargo.toml"
---
# Rust Testing

## Unit Tests

Place unit tests in a `#[cfg(test)]` module at the bottom of each file:

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use rstest::rstest;

    #[rstest]
    #[case(2, 3, 5)]
    #[case(0, 0, 0)]
    fn test_add(#[case] a: i32, #[case] b: i32, #[case] expected: i32) {
        assert_eq!(add(a, b), expected);
    }
}
```

## Integration Tests

Place integration tests in the `tests/` directory at the crate root.

## Recommended Tools

- **rstest**: Parameterized and fixture-based tests
- **cargo-nextest**: Parallel execution (`cargo nextest run`)
- **mockall**: Auto-generate mocks from trait definitions
- **assert_matches**: Pattern matching assertions

## Coverage

Run `cargo llvm-cov` for coverage. Target 80% minimum.