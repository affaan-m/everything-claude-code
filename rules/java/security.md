---
paths:
  - "**/*.java"
---
# Java Security

> This file extends [common/security.md](../common/security.md) with Java-specific content.

## Secrets Management

- Never hardcode API keys, tokens, or credentials in source code
- Use environment variables or external config (`application.yml` with `${ENV_VAR}`)
- Use a secret manager (Vault, AWS Secrets Manager) for production secrets
- Keep `application-local.yml` in `.gitignore` for local development

```java
// BAD
private static final String API_KEY = "sk-abc123...";

// GOOD — externalized config
@Value("${payment.api-key}")
private String apiKey;
```

## SQL Injection Prevention

- Always use parameterized queries — never concatenate user input into SQL
- Use JPA named parameters or Spring JDBC `NamedParameterJdbcTemplate`
- Validate and sanitize any input used in native queries

```java
// BAD — SQL injection
@Query(value = "SELECT * FROM orders WHERE name = '" + name + "'", nativeQuery = true)

// GOOD — parameterized
@Query("SELECT o FROM Order o WHERE o.name = :name")
List<Order> findByName(@Param("name") String name);

// GOOD — JDBC template
jdbcTemplate.query("SELECT * FROM orders WHERE name = ?", mapper, name);
```

## Input Validation

- Use Bean Validation (`@NotNull`, `@NotBlank`, `@Size`, `@Email`, `@Pattern`) on DTOs
- Validate at controller boundaries with `@Valid`
- Sanitize file paths and user-provided strings before use

```java
public record CreateOrderRequest(
    @NotBlank String customerName,
    @NotNull @Positive BigDecimal amount,
    @Size(max = 500) String notes
) {}

@PostMapping("/orders")
public ResponseEntity<?> create(@Valid @RequestBody CreateOrderRequest request) {
    // request is already validated
}
```

## Authentication and Authorization

- Never implement custom auth crypto — use established libraries
- Store passwords with bcrypt or Argon2, never MD5/SHA1
- Use method-level security (`@PreAuthorize`) for authorization checks
- Clear sensitive data from logs — never log passwords, tokens, or PII

## Dependency Security

- Run `mvn dependency:tree` or `./gradlew dependencies` to audit transitive dependencies
- Use OWASP Dependency-Check or Snyk to scan for known CVEs
- Keep dependencies updated — set up Dependabot or Renovate

## Error Messages

- Never expose stack traces, internal paths, or SQL errors in API responses
- Use a global exception handler (`@ControllerAdvice`) to standardize error output
- Log detailed errors server-side; return generic messages to clients

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(404).body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleUnexpected(Exception ex) {
        log.error("Unexpected error", ex);
        return ResponseEntity.status(500).body(ApiResponse.error("Internal server error"));
    }
}
```

## References

See skill: `springboot-security` for Spring Security authentication and authorization patterns.
See skill: `security-review` for general security checklists.
