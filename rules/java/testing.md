---
paths:
  - "**/*.java"
  - "**/*.kt"
  - "**/pom.xml"
  - "**/build.gradle*"
---
# Java/Kotlin Testing

> This file extends [common/testing.md](../common/testing.md) with Java/Kotlin specific content.

## Framework

Use **JUnit 5** with **Mockito** (Java) or **MockK** (Kotlin).

## JUnit 5

```java
@Nested
@DisplayName("UserService")
class UserServiceTest {

    @ParameterizedTest
    @CsvSource({"admin,true", "user,false"})
    void checksAdminRole(String role, boolean expected) {
        assertEquals(expected, UserService.isAdmin(role));
    }
}
```

## Kotlin Testing with MockK

```kotlin
@Test
fun `creates user successfully`() {
    val repo = mockk<UserRepository>()
    every { repo.save(any()) } returns User("1", "test@example.com")

    val service = UserService(repo)
    val user = service.create("test@example.com")

    assertEquals("test@example.com", user.email)
    verify(exactly = 1) { repo.save(any()) }
}
```

## Integration Tests

Use **Testcontainers** for database tests:

```java
@Testcontainers
class DatabaseTest {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16");

    @Test
    void queriesDatabase() {
        // test with real database
    }
}
```

## Coverage

```bash
# Maven
mvn jacoco:report

# Gradle
./gradlew jacocoTestReport
```

## Reference

See skill: `kotlin-patterns` for Kotlin-specific testing patterns.
