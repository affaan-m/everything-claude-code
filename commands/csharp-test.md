---
description: Enforce TDD workflow for C#. Write xUnit tests first, then implement. Verify 80%+ coverage.
---

# C# TDD Command

This command enforces test-driven development methodology for C# code using xUnit, FluentAssertions, and Moq/NSubstitute.

## What This Command Does

1. **Define Types/Interfaces**: Scaffold types and method signatures first
2. **Write xUnit Tests**: Create comprehensive test classes (RED)
3. **Run Tests**: Verify tests fail for the right reason
4. **Implement Code**: Write minimal code to pass (GREEN)
5. **Refactor**: Improve while keeping tests green
6. **Check Coverage**: Ensure 80%+ coverage

## When to Use

Use `/csharp-test` when:
- Implementing new C# functions or classes
- Adding test coverage to existing C# code
- Fixing bugs (write failing test first)
- Building critical business logic
- Learning TDD workflow in C#

## TDD Cycle

```
RED     -> Write failing xUnit test
GREEN   -> Implement minimal code to pass
REFACTOR -> Improve code, tests stay green
REPEAT  -> Next test case
```

## Example Session

````text
User: /csharp-test I need a service to validate order requests

Agent:
# TDD Session: Order Validator

## Step 1: Define Interface

```csharp
// Domain/Validation/OrderValidator.cs
namespace MyApp.Domain.Validation;

public sealed record OrderRequest(
    Guid CustomerId,
    IReadOnlyList<OrderLineRequest> Lines);

public sealed record OrderLineRequest(
    Guid ProductId,
    int Quantity);

public abstract record ValidationResult
{
    public sealed record Valid : ValidationResult;
    public sealed record Invalid(IReadOnlyList<string> Errors) : ValidationResult;
}

public static class OrderValidator
{
    public static ValidationResult Validate(OrderRequest request) =>
        throw new NotImplementedException();
}
```

## Step 2: Write xUnit Tests (RED)

```csharp
// Tests/Domain/Validation/OrderValidatorTests.cs
namespace MyApp.Tests.Domain.Validation;

using FluentAssertions;
using MyApp.Domain.Validation;

public sealed class OrderValidatorTests
{
    [Fact]
    public void Validate_ValidRequest_ReturnsValid()
    {
        var request = new OrderRequest(
            Guid.NewGuid(),
            [new OrderLineRequest(Guid.NewGuid(), 2)]);

        var result = OrderValidator.Validate(request);

        result.Should().BeOfType<ValidationResult.Valid>();
    }

    [Fact]
    public void Validate_EmptyCustomerId_ReturnsInvalid()
    {
        var request = new OrderRequest(
            Guid.Empty,
            [new OrderLineRequest(Guid.NewGuid(), 1)]);

        var result = OrderValidator.Validate(request);

        var invalid = result.Should().BeOfType<ValidationResult.Invalid>().Subject;
        invalid.Errors.Should().Contain("Customer ID is required");
    }

    [Fact]
    public void Validate_EmptyLines_ReturnsInvalid()
    {
        var request = new OrderRequest(Guid.NewGuid(), []);

        var result = OrderValidator.Validate(request);

        var invalid = result.Should().BeOfType<ValidationResult.Invalid>().Subject;
        invalid.Errors.Should().Contain("Order must have at least one line");
    }

    [Fact]
    public void Validate_ZeroQuantity_ReturnsInvalid()
    {
        var request = new OrderRequest(
            Guid.NewGuid(),
            [new OrderLineRequest(Guid.NewGuid(), 0)]);

        var result = OrderValidator.Validate(request);

        var invalid = result.Should().BeOfType<ValidationResult.Invalid>().Subject;
        invalid.Errors.Should().Contain("Quantity must be greater than zero");
    }

    [Fact]
    public void Validate_MultipleErrors_ReturnsAllErrors()
    {
        var request = new OrderRequest(Guid.Empty, []);

        var result = OrderValidator.Validate(request);

        var invalid = result.Should().BeOfType<ValidationResult.Invalid>().Subject;
        invalid.Errors.Should().HaveCountGreaterOrEqualTo(2);
    }
}
```

## Step 3: Run Tests - Verify FAIL

```bash
$ dotnet test

OrderValidatorTests > Validate_ValidRequest_ReturnsValid FAILED
  System.NotImplementedException

FAILED (5 tests, 0 passed, 5 failed)
```

✓ Tests fail as expected (NotImplementedException).

## Step 4: Implement Minimal Code (GREEN)

```csharp
// Domain/Validation/OrderValidator.cs
public static class OrderValidator
{
    public static ValidationResult Validate(OrderRequest request)
    {
        var errors = new List<string>();

        if (request.CustomerId == Guid.Empty)
            errors.Add("Customer ID is required");

        if (request.Lines.Count == 0)
            errors.Add("Order must have at least one line");

        foreach (var line in request.Lines)
        {
            if (line.Quantity <= 0)
                errors.Add("Quantity must be greater than zero");
        }

        return errors.Count == 0
            ? new ValidationResult.Valid()
            : new ValidationResult.Invalid(errors);
    }
}
```

## Step 5: Run Tests - Verify PASS

```bash
$ dotnet test

OrderValidatorTests > Validate_ValidRequest_ReturnsValid PASSED
OrderValidatorTests > Validate_EmptyCustomerId_ReturnsInvalid PASSED
OrderValidatorTests > Validate_EmptyLines_ReturnsInvalid PASSED
OrderValidatorTests > Validate_ZeroQuantity_ReturnsInvalid PASSED
OrderValidatorTests > Validate_MultipleErrors_ReturnsAllErrors PASSED

PASSED (5 tests, 5 passed, 0 failed)
```

✓ All tests passing!

## Step 6: Check Coverage

```bash
$ dotnet test --collect:"XPlat Code Coverage"

Coverage: 100.0%
```

✓ Coverage: 100%

## TDD Complete!
````

## Test Patterns

### Fact (Simple Test)

```csharp
[Fact]
public void Add_TwoPositiveNumbers_ReturnsSum()
{
    Calculator.Add(2, 3).Should().Be(5);
}
```

### Theory (Data-Driven)

```csharp
[Theory]
[InlineData("2026-01-15", true)]
[InlineData("invalid", false)]
[InlineData("", false)]
public void IsValidDate_VariousInputs_ReturnsExpected(string input, bool expected)
{
    DateParser.IsValid(input).Should().Be(expected);
}
```

### Async Tests

```csharp
[Fact]
public async Task GetOrderAsync_ExistingId_ReturnsOrder()
{
    // Arrange
    var repository = new Mock<IOrderRepository>();
    repository
        .Setup(r => r.FindByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
        .ReturnsAsync(new Order { Id = orderId });
    var service = new OrderService(repository.Object);

    // Act
    var result = await service.GetOrderAsync(orderId, CancellationToken.None);

    // Assert
    result.Should().NotBeNull();
    result.Id.Should().Be(orderId);
}
```

### WebApplicationFactory Integration Tests

```csharp
public sealed class OrderApiTests(WebApplicationFactory<Program> factory)
    : IClassFixture<WebApplicationFactory<Program>>
{
    [Fact]
    public async Task GetOrders_ReturnsOk()
    {
        var client = factory.CreateClient();
        var response = await client.GetAsync("/api/orders");
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
```

## Coverage Commands

```bash
# Run tests with coverage
dotnet test --collect:"XPlat Code Coverage"

# Generate HTML report (requires reportgenerator tool)
dotnet tool install -g dotnet-reportgenerator-globaltool
reportgenerator -reports:**/coverage.cobertura.xml -targetdir:coverage-report

# Run specific test class
dotnet test --filter "FullyQualifiedName~OrderValidatorTests"

# Run with verbose output
dotnet test --verbosity detailed
```

## Coverage Targets

| Code Type | Target |
|-----------|--------|
| Critical business logic | 100% |
| Public APIs | 90%+ |
| General code | 80%+ |
| Generated code | Exclude |

## TDD Best Practices

**DO:**
- Write test FIRST, before any implementation
- Run tests after each change
- Use FluentAssertions for expressive assertions
- Use Moq/NSubstitute for dependency mocking
- Test behavior, not implementation details
- Include edge cases (empty, null, boundary values)
- Use `CancellationToken.None` in tests explicitly

**DON'T:**
- Write implementation before tests
- Skip the RED phase
- Test private methods directly
- Use `Thread.Sleep` in async tests
- Ignore flaky tests
- Mock what you don't own (wrap external libraries instead)

## Related Commands

- `/csharp-build` — Fix build errors
- `/csharp-review` — Review code after implementation
- `/verify` — Run full verification loop

## Related

- Skill: `skills/csharp-testing/`
- Skill: `skills/csharp-patterns/`
- Skill: `skills/tdd-workflow/`
