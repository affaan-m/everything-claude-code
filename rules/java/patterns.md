---
paths:
  - "**/*.java"
  - "**/pom.xml"
  - "**/build.gradle"
---
# Java Patterns

> This file extends [common/patterns.md](../common/patterns.md) with Java specific content.

## Sealed Interfaces

```java
public sealed interface Shape
    permits Circle, Rectangle, Triangle {
    double area();
}
public record Circle(double radius) implements Shape {
    public double area() { return Math.PI * radius * radius; }
}
```

## Builder Pattern

Use for objects with many optional parameters:

```java
var config = ServerConfig.builder()
    .port(8080)
    .maxConnections(100)
    .timeout(Duration.ofSeconds(30))
    .build();
```

## Dependency Injection

Prefer **constructor injection** over field injection. Use `final` fields for all dependencies.

## Reference

See skill: `java-enterprise-patterns` for comprehensive Java patterns.