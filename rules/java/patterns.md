---
paths:
  - "**/*.java"
  - "**/*.kt"
  - "**/pom.xml"
  - "**/build.gradle*"
---
# Java/Kotlin Patterns

> This file extends [common/patterns.md](../common/patterns.md) with Java/Kotlin specific content.

## Builder Pattern

```java
public class ServerConfig {
    private final int port;
    private final String host;

    private ServerConfig(Builder builder) {
        this.port = builder.port;
        this.host = builder.host;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private int port = 8080;
        private String host = "localhost";

        public Builder port(int port) { this.port = port; return this; }
        public Builder host(String host) { this.host = host; return this; }
        public ServerConfig build() { return new ServerConfig(this); }
    }
}
```

## Repository Pattern

```java
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByActiveTrue();
}
```

## Optional Usage

```java
// Good: fluent chaining
return userRepository.findByEmail(email)
    .map(User::getName)
    .orElse("Unknown");

// Bad: isPresent + get
if (optional.isPresent()) { return optional.get(); }
```

## Stream API Patterns

```java
Map<String, List<Order>> ordersByStatus = orders.stream()
    .filter(o -> o.getTotal() > 0)
    .collect(Collectors.groupingBy(Order::getStatus));
```

## Kotlin Sealed Classes

```kotlin
sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Failure(val error: Throwable) : Result<Nothing>()
}

fun <T> Result<T>.getOrNull(): T? = when (this) {
    is Result.Success -> data
    is Result.Failure -> null
}
```

## Dependency Injection

Prefer constructor injection:

```java
@Service
public class UserService {
    private final UserRepository repo;
    private final EmailService email;

    public UserService(UserRepository repo, EmailService email) {
        this.repo = repo;
        this.email = email;
    }
}
```

## Reference

See skill: `kotlin-patterns` for comprehensive Kotlin patterns including coroutines and DSL builders.
