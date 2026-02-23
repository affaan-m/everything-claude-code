---
paths:
  - "**/*.java"
  - "**/pom.xml"
  - "**/build.gradle"
---
# Java Security

> This file extends [common/security.md](../common/security.md) with Java specific content.

## SQL Injection Prevention

Always use **PreparedStatement** or JPA parameterized queries:

```java
// GOOD
entityManager.createQuery("SELECT u FROM User u WHERE u.email = :email")
    .setParameter("email", email);

// BAD — SQL injection risk
entityManager.createNativeQuery("SELECT * FROM users WHERE email = '" + email + "'");
```

## Input Validation

Use **Bean Validation** (jakarta.validation):

```java
public record CreateUserRequest(
    @NotBlank @Email String email,
    @Size(min = 8, max = 100) String password,
    @NotNull @Past LocalDate birthDate
) {}
```

## Dependency Auditing

```bash
mvn org.owasp:dependency-check-maven:check
```

## Deserialization

Never deserialize untrusted data with `ObjectInputStream`. Use JSON (Jackson) with explicit type mappings.
