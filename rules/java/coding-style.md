---
paths:
  - "**/*.java"
  - "**/*.kt"
  - "**/pom.xml"
  - "**/build.gradle*"
---
# Java/Kotlin Coding Style

> This file extends [common/coding-style.md](../common/coding-style.md) with Java/Kotlin-specific content.

## Formatting

- **Google Java Style Guide** is the baseline for Java formatting
- **Kotlin Official Conventions** (kotlinlang.org) for Kotlin formatting
- Use automated formatters: `google-java-format`, `spotless`, or `ktlint`
- Indentation: 2 spaces (Google style) or 4 spaces (project convention) -- be consistent
- Line length: 100-120 characters max

## Naming Conventions

```java
// Classes and interfaces: PascalCase
public class OrderService {}
public interface PaymentGateway {}
public sealed interface Shape permits Circle, Rectangle {}

// Methods and variables: camelCase
public Order findOrderById(String orderId) {}
private final String customerName;

// Constants: UPPER_SNAKE_CASE
public static final int MAX_RETRY_COUNT = 3;
private static final Duration DEFAULT_TIMEOUT = Duration.ofSeconds(30);

// Packages: lowercase, no underscores
package com.example.orderservice.domain;

// Type parameters: single uppercase letter or descriptive with T suffix
public interface Repository<T, ID> {}
public class ResponseWrapper<ResultT> {}
```

```kotlin
// Kotlin follows the same conventions with these additions:
// Properties: camelCase (no get/set prefix)
val isActive: Boolean = true

// Backing properties: underscore prefix
private val _items = MutableStateFlow<List<Item>>(emptyList())
val items: StateFlow<List<Item>> = _items.asStateFlow()

// Extension functions: named like regular methods
fun String.toSlug(): String = lowercase().replace(" ", "-")
```

## Records for Data Classes (Java 16+)

Prefer records for immutable data carriers:

```java
// GOOD: Record for immutable data
public record UserDto(String name, String email, Instant createdAt) {}

// GOOD: Record with compact constructor for validation
public record Email(String value) {
    public Email {
        Objects.requireNonNull(value, "Email value must not be null");
        if (!value.contains("@")) {
            throw new IllegalArgumentException("Invalid email: " + value);
        }
    }
}

// BAD: Class used as a data carrier without behavior
public class UserDto {
    private final String name;
    private final String email;
    // ... getters, equals, hashCode, toString boilerplate
}
```

## Kotlin Data Classes

```kotlin
// GOOD: data class for value objects
data class UserDto(val name: String, val email: String, val createdAt: Instant)

// GOOD: value class for type-safe wrappers (zero overhead)
@JvmInline
value class UserId(val value: String)

@JvmInline
value class Email(val value: String) {
    init {
        require(value.contains("@")) { "Invalid email: $value" }
    }
}
```

## Sealed Classes and Pattern Matching

```java
// Java 17+: sealed interfaces for restricted type hierarchies
public sealed interface Shape permits Circle, Rectangle, Triangle {
    double area();
}

public record Circle(double radius) implements Shape {
    public double area() { return Math.PI * radius * radius; }
}

// Java 21+: pattern matching with switch
String describe(Shape shape) {
    return switch (shape) {
        case Circle c -> "Circle with radius " + c.radius();
        case Rectangle r -> "Rectangle " + r.width() + "x" + r.height();
        case Triangle t -> "Triangle with base " + t.base();
    };
}
```

```kotlin
// Kotlin sealed classes with exhaustive when
sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Failure(val error: Throwable) : Result<Nothing>()
    data object Loading : Result<Nothing>()
}

fun <T> handleResult(result: Result<T>): String = when (result) {
    is Result.Success -> "Data: ${result.data}"
    is Result.Failure -> "Error: ${result.error.message}"
    is Result.Loading -> "Loading..."
}
```

## Immutability

```java
// GOOD: Immutable class with final fields
public final class User {
    private final String id;
    private final String name;
    private final List<String> roles;

    public User(String id, String name, List<String> roles) {
        this.id = id;
        this.name = name;
        this.roles = List.copyOf(roles); // defensive copy
    }

    public List<String> roles() {
        return roles; // already unmodifiable
    }
}

// GOOD: Return new object instead of mutating
public User withName(String newName) {
    return new User(this.id, newName, this.roles);
}
```

```kotlin
// GOOD: Kotlin immutable by default
data class User(val id: String, val name: String, val roles: List<String>)

// Update via copy
val updated = user.copy(name = "New Name")
```

## var Usage (Java 10+)

```java
// GOOD: Type is obvious from the right-hand side
var users = new ArrayList<User>();
var response = client.send(request, HttpResponse.BodyHandlers.ofString());
var mapper = new ObjectMapper();

// BAD: Type is not obvious -- use explicit type
var result = processData(input);  // What type is result?
var x = getConfig();              // Unclear return type
```

## Import Organization

```java
// Standard order (enforced by google-java-format):
// 1. Static imports
// 2. java.*
// 3. javax.*
// 4. Third-party libraries
// 5. Project packages

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.util.List;

import jakarta.validation.Valid;

import org.springframework.stereotype.Service;

import com.example.domain.User;
```

## Reference

See skill: `java-coding-standards` for comprehensive Java coding standards.
See skill: `kotlin-patterns` for idiomatic Kotlin patterns.
