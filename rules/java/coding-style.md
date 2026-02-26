---
paths:
  - "**/*.java"
  - "**/*.kt"
  - "**/pom.xml"
  - "**/build.gradle*"
---
# Java/Kotlin Coding Style

> This file extends [common/coding-style.md](../common/coding-style.md) with Java/Kotlin specific content.

## Style Guides

- **Java**: Follow Google Java Style Guide
- **Kotlin**: Follow Kotlin Official Conventions

## Naming Conventions

| Item | Java | Kotlin |
|------|------|--------|
| Classes | `CamelCase` | `CamelCase` |
| Methods | `camelCase` | `camelCase` |
| Constants | `SCREAMING_SNAKE_CASE` | `SCREAMING_SNAKE_CASE` |
| Packages | `lowercase` | `lowercase` |
| Type params | Single uppercase `T`, `E` | Single uppercase `T`, `E` |

## Modern Java (17+)

Use records for data carriers:

```java
public record UserDto(String name, String email, int age) {}
```

Use sealed classes for restricted hierarchies:

```java
public sealed interface Shape permits Circle, Rectangle {
    double area();
}
```

Use pattern matching:

```java
if (obj instanceof String s && !s.isEmpty()) {
    process(s);
}
```

## Kotlin Idioms

Prefer `val` over `var`, data classes over POJOs:

```kotlin
data class User(val name: String, val email: String)

fun greet(name: String?) = name?.let { "Hello, $it" } ?: "Hello, stranger"
```

## Immutability

- Java: Use `final` fields, `List.of()`, `Map.of()`, records
- Kotlin: Use `val`, `listOf()`, `data class` with `copy()`

## Reference

See skill: `kotlin-patterns` for comprehensive Kotlin idioms.
