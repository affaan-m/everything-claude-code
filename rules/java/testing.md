---
paths:
  - "**/*.java"
  - "**/pom.xml"
  - "**/build.gradle"
---
# Java Testing

> This file extends [common/testing.md](../common/testing.md) with Java specific content.

## Framework

Use **JUnit 5** with `@Nested` for organized test groups:

```java
@Nested
class WhenOrderIsPlaced {
    @Test void shouldCalculateTotal() { /* ... */ }
    @Test void shouldEmitEvent() { /* ... */ }
}
```

## Assertions & Mocking

- **AssertJ** for fluent assertions: `assertThat(result).isEqualTo(expected)`
- **Mockito** for mocking: `when(repo.findById(id)).thenReturn(Optional.of(user))`

## Integration Tests

Use `@SpringBootTest` only when testing Spring wiring. Prefer unit tests with manual DI.

## Coverage

```bash
mvn test jacoco:report
```

## Reference

See skill: `java-testing` for detailed Java testing patterns.
