---
paths:
  - "**/*.java"
  - "**/*.kt"
  - "**/pom.xml"
  - "**/build.gradle*"
---
# Java/Kotlin Security

> This file extends [common/security.md](../common/security.md) with Java/Kotlin specific content.

## Secret Management

```java
@ConfigurationProperties(prefix = "app")
public record AppConfig(String apiKey, String dbPassword) {}
```

Never hardcode secrets. Use environment variables or Vault.

## SQL Injection Prevention

```java
// WRONG: String concatenation
String query = "SELECT * FROM users WHERE id = " + userId;

// CORRECT: PreparedStatement
PreparedStatement ps = conn.prepareStatement("SELECT * FROM users WHERE id = ?");
ps.setString(1, userId);

// CORRECT: JPA named parameters
@Query("SELECT u FROM User u WHERE u.email = :email")
User findByEmail(@Param("email") String email);
```

## Input Validation

Use Jakarta Bean Validation:

```java
public record CreateUserRequest(
    @NotBlank @Email String email,
    @Size(min = 2, max = 100) String name,
    @Min(0) @Max(150) int age
) {}
```

## XXE Prevention

```java
DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
factory.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
```

## Security Scanning

```bash
# OWASP Dependency-Check
mvn org.owasp:dependency-check-maven:check
./gradlew dependencyCheckAnalyze
```
