---
paths:
  - "**/*.java"
  - "**/pom.xml"
  - "**/build.gradle"
---
# Java Coding Style

> This file extends [common/coding-style.md](../common/coding-style.md) with Java specific content.

## Modern Java

- Prefer **records** over mutable POJOs for data carriers
- Use **sealed interfaces** for closed type hierarchies
- Use **pattern matching** (instanceof, switch) where available

## Naming

- Classes/interfaces: `PascalCase`
- Methods/fields: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Packages: `lowercase.dotted`

## Error Handling

- Use **unchecked exceptions** for programming errors
- Use **checked exceptions** only for recoverable failures
- Never catch `Exception` or `Throwable` broadly
- Never call `Optional.get()` — use `orElseThrow()`, `map()`, or `ifPresent()`

```java
var user = repo.findById(id)
    .orElseThrow(() -> new UserNotFoundException(id));
```

## Reference

See skill: `java-coding-standards` for comprehensive Java conventions.
