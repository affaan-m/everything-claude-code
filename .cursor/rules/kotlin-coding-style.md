---
description: "Kotlin coding style extending common rules"
globs: ["**/*.kt", "**/*.kts", "**/build.gradle.kts"]
alwaysApply: false
---
# Kotlin Coding Style

> This file extends the common coding style rule with Kotlin specific content.

## Formatting

- **ktfmt** or **ktlint** are mandatory for consistent formatting
- Use trailing commas in multiline declarations

## Immutability

- `val` over `var` always
- Immutable collections by default (`List`, `Map`, `Set`)
- Use `data class` with `copy()` for immutable updates

## Null Safety

- Avoid `!!` -- use `?.`, `?:`, `require`, or `checkNotNull`
- Handle platform types explicitly at Java interop boundaries

## Expression Bodies

Prefer expression bodies for single-expression functions:

```kotlin
fun isAdult(age: Int): Boolean = age >= 18
```

## Reference

See skill: `kotlin-patterns` for comprehensive Kotlin idioms and patterns.
