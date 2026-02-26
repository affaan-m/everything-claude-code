---
paths:
  - "**/*.java"
  - "**/*.kt"
  - "**/pom.xml"
  - "**/build.gradle*"
---
# Java/Kotlin Testing

> This file extends [common/testing.md](../common/testing.md) with Java/Kotlin-specific content.

## Framework Stack

- **JUnit 5** (Jupiter): Primary test framework
- **Mockito**: Mocking for Java
- **MockK**: Mocking for Kotlin (preferred over Mockito in Kotlin projects)
- **AssertJ**: Fluent assertions (preferred over Hamcrest)
- **Testcontainers**: Integration testing with real databases, message brokers, etc.
- **WireMock**: HTTP service mocking
- **ArchUnit**: Architecture rule enforcement

## JUnit 5 Basics

```java
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class OrderServiceTest {

    @Nested
    @DisplayName("createOrder")
    class CreateOrder {

        @Test
        @DisplayName("should create order with valid items")
        void shouldCreateOrderWithValidItems() {
            var service = new OrderService(new FakeOrderRepository());
            var request = new CreateOrderRequest(List.of(
                new OrderItem("SKU-001", 2)
            ));

            var order = service.createOrder(request);

            assertThat(order.items()).hasSize(1);
            assertThat(order.status()).isEqualTo(OrderStatus.CREATED);
        }

        @Test
        @DisplayName("should reject empty order")
        void shouldRejectEmptyOrder() {
            var service = new OrderService(new FakeOrderRepository());
            var request = new CreateOrderRequest(List.of());

            assertThatThrownBy(() -> service.createOrder(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("at least one item");
        }
    }
}
```

## Parameterized Tests

```java
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.EnumSource;

class EmailValidatorTest {

    @ParameterizedTest
    @CsvSource({
        "user@example.com, true",
        "invalid-email, false",
        "'', false",
        "user@.com, false"
    })
    @DisplayName("should validate email format")
    void shouldValidateEmail(String email, boolean expected) {
        assertThat(EmailValidator.isValid(email)).isEqualTo(expected);
    }

    @ParameterizedTest
    @MethodSource("provideOrderStatuses")
    @DisplayName("should handle all order status transitions")
    void shouldHandleStatusTransitions(OrderStatus from, OrderStatus to, boolean allowed) {
        assertThat(OrderStateMachine.canTransition(from, to)).isEqualTo(allowed);
    }

    static Stream<Arguments> provideOrderStatuses() {
        return Stream.of(
            Arguments.of(OrderStatus.CREATED, OrderStatus.PAID, true),
            Arguments.of(OrderStatus.PAID, OrderStatus.CREATED, false),
            Arguments.of(OrderStatus.SHIPPED, OrderStatus.DELIVERED, true)
        );
    }
}
```

## Mockito Patterns

```java
import static org.mockito.Mockito.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentGateway gateway;

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private PaymentService paymentService;

    @Test
    void shouldProcessPaymentSuccessfully() {
        var order = new Order("order-1", BigDecimal.valueOf(100));
        when(orderRepository.findById("order-1")).thenReturn(Optional.of(order));
        when(gateway.charge(any())).thenReturn(new PaymentResult(true, "txn-123"));

        var result = paymentService.processPayment("order-1");

        assertThat(result.isSuccessful()).isTrue();
        verify(gateway).charge(argThat(req ->
            req.amount().equals(BigDecimal.valueOf(100))
        ));
    }
}
```

## Kotlin with MockK

```kotlin
import io.mockk.*
import org.junit.jupiter.api.Test
import org.assertj.core.api.Assertions.assertThat

class UserServiceTest {

    private val userRepository = mockk<UserRepository>()
    private val eventPublisher = mockk<EventPublisher>(relaxed = true)
    private val service = UserService(userRepository, eventPublisher)

    @Test
    fun `should create user and publish event`() {
        val request = CreateUserRequest("Alice", "alice@example.com")
        every { userRepository.save(any()) } answers { firstArg() }

        val user = service.createUser(request)

        assertThat(user.name).isEqualTo("Alice")
        verify { eventPublisher.publish(match<UserCreatedEvent> { it.userId == user.id }) }
    }

    @Test
    fun `should throw when email already exists`() {
        every { userRepository.existsByEmail("taken@example.com") } returns true

        assertThatThrownBy {
            service.createUser(CreateUserRequest("Bob", "taken@example.com"))
        }.isInstanceOf(DuplicateEmailException::class.java)
    }
}
```

## Testcontainers for Integration Tests

```java
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers
@SpringBootTest
class OrderRepositoryIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
        .withDatabaseName("testdb")
        .withUsername("test")
        .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private OrderRepository orderRepository;

    @Test
    void shouldPersistAndRetrieveOrder() {
        var order = new OrderEntity("customer-1", List.of(
            new OrderItemEntity("SKU-001", 2, BigDecimal.valueOf(29.99))
        ));

        var saved = orderRepository.save(order);
        var found = orderRepository.findById(saved.getId());

        assertThat(found).isPresent();
        assertThat(found.get().getItems()).hasSize(1);
    }
}
```

## Coverage

Run with JaCoCo:

```bash
# Maven
mvn test jacoco:report
# Report at target/site/jacoco/index.html

# Gradle
gradle test jacocoTestReport
# Report at build/reports/jacoco/test/html/index.html
```

Target: 80%+ line coverage on business logic. Exclude generated code, DTOs, and configuration.

## Reference

See skill: `springboot-tdd` for Spring Boot test-driven development workflow.
See skill: `tdd-workflow` for general TDD methodology.
