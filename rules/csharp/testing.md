---
paths:
  - "**/*.cs"
  - "**/*.csx"
  - "**/*.csproj"
---
# C# Testing

> This file extends [common/testing.md](../common/testing.md) with C#-specific content.

## Test Framework

- Prefer **xUnit** for unit and integration tests
- Use **FluentAssertions** for readable, expressive assertions
- Use **Moq** or **NSubstitute** for mocking dependencies
- Use **Testcontainers** when integration tests need real infrastructure
- Use **WebApplicationFactory** for ASP.NET Core API integration tests

## Test Organization

- Mirror `src/` structure under `tests/`
- Separate unit, integration, and end-to-end test projects
- Name tests by behavior: `MethodName_Scenario_ExpectedResult`

```csharp
public sealed class OrderServiceTests
{
    [Fact]
    public async Task CreateAsync_ValidRequest_ReturnsCreatedOrder()
    {
        // Arrange
        var repository = new Mock<IOrderRepository>();
        repository
            .Setup(r => r.AddAsync(It.IsAny<Order>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Order o, CancellationToken _) => o);
        var service = new OrderService(repository.Object, Mock.Of<ILogger<OrderService>>());

        // Act
        var result = await service.CreateAsync(
            new CreateOrderRequest(Guid.NewGuid(), [new(Guid.NewGuid(), 1)]),
            CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        repository.Verify(r => r.AddAsync(It.IsAny<Order>(), It.IsAny<CancellationToken>()), Times.Once);
    }
}
```

## Data-Driven Tests

```csharp
[Theory]
[InlineData("alice@example.com", true)]
[InlineData("invalid", false)]
[InlineData("", false)]
public void IsValidEmail_VariousInputs_ReturnsExpected(string input, bool expected)
{
    EmailValidator.IsValid(input).Should().Be(expected);
}
```

## ASP.NET Core Integration Tests

- Use `WebApplicationFactory<TEntryPoint>` for API integration coverage
- Test auth, validation, and serialization through HTTP, not by bypassing middleware
- Prefer SQLite in-memory or Testcontainers for EF Core-backed integration tests
- Override external services with fakes in `ConfigureWebHost`

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

## Coverage

- Target 80%+ line coverage
- Focus coverage on domain logic, validation, auth, and failure paths
- Run `dotnet test --collect:"XPlat Code Coverage"` in CI
- Use `reportgenerator` for HTML reports

```bash
dotnet test --collect:"XPlat Code Coverage"
dotnet tool install -g dotnet-reportgenerator-globaltool
reportgenerator -reports:**/coverage.cobertura.xml -targetdir:coverage-report
```

## References

See skill: `csharp-testing` for comprehensive testing patterns and TDD walkthrough.
