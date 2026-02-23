---
paths:
  - "**/*.rs"
  - "**/Cargo.toml"
---
# Rust Coding Style

## Formatting

All code must pass `cargo fmt`. Run it before every commit.

## Naming Conventions

- Functions and variables: `snake_case`
- Types and traits: `PascalCase`
- Constants and statics: `SCREAMING_SNAKE_CASE`

## Error Handling

No `unwrap()` in library code. Use `?` or `expect()` with context:

```rust
// BAD
let file = File::open(path).unwrap();

// GOOD: propagate with ?
let file = File::open(path)?;

// OK at startup: expect() with reason
let file = File::open(path).expect("config must exist");
```

## Documentation

Use `///` doc comments on all public items.

## Trait Objects vs Generics

Prefer `impl Trait` (static dispatch) over `dyn Trait` when the concrete type is known at compile time. Use `dyn Trait` only for type erasure.
