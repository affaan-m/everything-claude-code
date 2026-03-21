---
name: csharp-testing
description: C# testing strategies using xUnit, FluentAssertions, Moq/NSubstitute, TDD methodology, async testing, WebApplicationFactory integration tests, and coverage requirements.
origin: ECC
---

# C# Testing Patterns

Comprehensive testing strategies for C# and .NET applications using xUnit, FluentAssertions, Moq, and best practices.

## When to Use

- Writing new C# code (follow TDD: red, green, refactor)
- Designing test suites for .NET projects
- Reviewing C# test coverage

## How It Works

This skill enforces the TDD cycle (red-green-refactor) using xUnit as the test framework, FluentAssertions for readable assertions, and Moq or NSubstitute for mocking dependencies. It covers unit test organization with `[Fact]` and `[Theory]` attributes, integration testing with `WebApplicationFactory<Program>` for full HTTP pipeline coverage, async test patterns with `CancellationToken` propagation, test data builders for maintainable arrange steps, collection fixtures for shared expensive resources, property-based testing with FsCheck, and CI integration with coverage collection.

## Examples

**Simple unit test:**
```csharp
[Fact]
public void Add_TwoNumbers_ReturnsSum()
{
    var result = Calculator.Add(2, 3);
    result.Should().Be(5);
}
```

**Theory with inline data:**
```csharp
[Theory]
[InlineData("user@example.com", true)]
[InlineData("invalid", false)]
public void IsValid_ReturnsExpected(string email, bool expected) =>
    EmailValidator.IsValid(email).Should().Be(expected);
```

**Integration test:**
```csharp
public sealed class OrderApiTests(CustomWebApplicationFactory factory)
    : IClassFixture<CustomWebApplicationFactory>
{
    [Fact]
    public async Task CreateOrder_Returns201() { /* ... */ }
}
```
- Setting up testing infrastructure for ASP.NET Core APIs
- Writing integration tests with `WebApplicationFactory`

## Core Testing Philosophy

### Test-Driven Development (TDD)

Always follow the TDD cycle:

1. **RED**: Write a failing test for the desired behavior
2. **GREEN**: Write minimal code to make the test pass
3. **REFACTOR**: Improve code while keeping tests green

```csharp
// Step 1: Write failing test (RED)
[Fact]
public void Add_TwoPositiveNumbers_ReturnsSum()
{
    var result = Calculator.Add(2, 3);
    result.Should().Be(5);
}

// Step 2: Write minimal implementation (GREEN)
public static int Add(int a, int b) => a + b;

// Step 3: Refactor if needed (REFACTOR)
```

### Coverage Requirements

- **Target**: 80%+ code coverage
- **Critical paths**: 100% coverage required
- Use `dotnet test --collect:"XPlat Code Coverage"` to measure

```bash
# Run tests with coverage
dotnet test --collect:"XPlat Code Coverage"

# Generate HTML report
dotnet tool install -g dotnet-reportgenerator-globaltool
reportgenerator -reports:**/coverage.cobertura.xml -targetdir:coverage-report

# Open report
open coverage-report/index.html
```

## xUnit Fundamentals

### Basic Test Structure

```csharp
using FluentAssertions;

public sealed class CalculatorTests
{
    [Fact]
    public void Add_TwoPositiveNumbers_ReturnsSum()
    {
        // Arrange
        var a = 2;
        var b = 3;

        // Act
        var result = Calculator.Add(a, b);

        // Assert
        result.Should().Be(5);
    }

    [Fact]
    public void Divide_ByZero_ThrowsArgumentException()
    {
        // Act
        var act = () => Calculator.Divide(10, 0);

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithMessage("*cannot divide by zero*");
    }
}
```

### FluentAssertions

```csharp
// Equality
result.Should().Be(42);
result.Should().NotBe(0);

// Nullability
result.Should().NotBeNull();
result.Should().BeNull();

// Strings
name.Should().StartWith("Hello");
name.Should().Contain("world");
name.Should().BeEquivalentTo("HELLO WORLD"); // case-insensitive
name.Should().MatchRegex(@"^\d{3}-\d{4}$");

// Collections
items.Should().HaveCount(3);
items.Should().Contain(x => x.Name == "Alice");
items.Should().BeInAscendingOrder(x => x.CreatedAt);
items.Should().OnlyContain(x => x.IsActive);
items.Should().NotBeEmpty();
items.Should().ContainSingle(x => x.IsDefault);
items.Should().BeEquivalentTo(expected, options =>
    options.WithStrictOrdering());

// Types
result.Should().BeOfType<OrderConfirmed>();
result.Should().BeAssignableTo<IDomainEvent>();

// Ranges
value.Should().BeInRange(1, 100);
value.Should().BeGreaterThan(0);
value.Should().BeCloseTo(3.14, precision: 0.01);

// Dates
timestamp.Should().BeCloseTo(DateTimeOffset.UtcNow, precision: TimeSpan.FromSeconds(5));
timestamp.Should().BeAfter(startTime);

// Booleans
condition.Should().BeTrue();
condition.Should().BeFalse();

// Exceptions
var act = () => service.Process(null!);
act.Should().Throw<ArgumentNullException>()
    .WithParameterName("request");
```

## Theory Tests (Data-Driven)

### InlineData

```csharp
[Theory]
[InlineData("alice@example.com", true)]
[InlineData("invalid", false)]
[InlineData("", false)]
[InlineData("@no-user.com", false)]
[InlineData("user@", false)]
public void IsValidEmail_VariousInputs_ReturnsExpected(string input, bool expected)
{
    EmailValidator.IsValid(input).Should().Be(expected);
}
```

### MemberData

```csharp
public static TheoryData<OrderRequest, bool> OrderValidationData => new()
{
    { new OrderRequest(Guid.NewGuid(), [new(Guid.NewGuid(), 1)]), true },
    { new OrderRequest(Guid.Empty, [new(Guid.NewGuid(), 1)]), false },
    { new OrderRequest(Guid.NewGuid(), []), false },
};

[Theory]
[MemberData(nameof(OrderValidationData))]
public void Validate_VariousOrders_ReturnsExpected(OrderRequest request, bool expected)
{
    var result = OrderValidator.Validate(request);
    (result is ValidationResult.Valid).Should().Be(expected);
}
```

### ClassData

```csharp
public sealed class CurrencyConversionTestData : TheoryData<string, string, decimal, decimal>
{
    public CurrencyConversionTestData()
    {
        Add("USD", "EUR", 100m, 92.50m);
        Add("EUR", "USD", 100m, 108.11m);
        Add("GBP", "USD", 100m, 126.50m);
    }
}

[Theory]
[ClassData(typeof(CurrencyConversionTestData))]
public void Convert_VariousCurrencies_ReturnsExpectedAmount(
    string from, string to, decimal amount, decimal expected)
{
    var result = converter.Convert(from, to, amount);
    result.Should().BeApproximately(expected, precision: 0.01m);
}
```

## Mocking with Moq

### Basic Mocking

```csharp
[Fact]
public async Task GetOrderAsync_ExistingId_ReturnsOrder()
{
    // Arrange
    var orderId = Guid.NewGuid();
    var expectedOrder = new Order { Id = orderId, Total = 99.99m };

    var repository = new Mock<IOrderRepository>();
    repository
        .Setup(r => r.FindByIdAsync(orderId, It.IsAny<CancellationToken>()))
        .ReturnsAsync(expectedOrder);

    var service = new OrderService(repository.Object, Mock.Of<ILogger<OrderService>>());

    // Act
    var result = await service.GetOrderAsync(orderId, CancellationToken.None);

    // Assert
    result.Should().NotBeNull();
    result.Id.Should().Be(orderId);
    result.Total.Should().Be(99.99m);
}
```

### Verifying Calls

```csharp
[Fact]
public async Task CreateAsync_ValidRequest_SavesAndPublishesEvent()
{
    // Arrange
    var repository = new Mock<IOrderRepository>();
    var eventBus = new Mock<IEventBus>();

    repository
        .Setup(r => r.AddAsync(It.IsAny<Order>(), It.IsAny<CancellationToken>()))
        .ReturnsAsync((Order o, CancellationToken _) => o);

    var service = new OrderService(repository.Object, eventBus.Object);

    // Act
    var request = new CreateOrderRequest(Guid.NewGuid(), [new(Guid.NewGuid(), 2)]);
    await service.CreateAsync(request, CancellationToken.None);

    // Assert
    repository.Verify(
        r => r.AddAsync(It.Is<Order>(o => o.CustomerId == request.CustomerId),
            It.IsAny<CancellationToken>()),
        Times.Once);

    eventBus.Verify(
        e => e.PublishAsync(It.IsAny<OrderCreatedEvent>(), It.IsAny<CancellationToken>()),
        Times.Once);
}
```

### Mocking Exceptions

```csharp
[Fact]
public async Task GetOrderAsync_RepositoryThrows_PropagatesException()
{
    // Arrange
    var repository = new Mock<IOrderRepository>();
    repository
        .Setup(r => r.FindByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
        .ThrowsAsync(new InvalidOperationException("Database unavailable"));

    var service = new OrderService(repository.Object, Mock.Of<ILogger<OrderService>>());

    // Act
    var act = () => service.GetOrderAsync(Guid.NewGuid(), CancellationToken.None);

    // Assert
    await act.Should().ThrowAsync<InvalidOperationException>()
        .WithMessage("*Database unavailable*");
}
```

### Sequential Returns

```csharp
[Fact]
public async Task RetryPolicy_RetriesOnFailure_ThenSucceeds()
{
    var httpClient = new Mock<IHttpClient>();

    httpClient
        .SetupSequence(c => c.GetAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
        .ThrowsAsync(new HttpRequestException("Connection refused"))
        .ThrowsAsync(new HttpRequestException("Timeout"))
        .ReturnsAsync(new HttpResponseMessage(HttpStatusCode.OK));

    var service = new ResilientService(httpClient.Object);
    var result = await service.FetchWithRetryAsync("/api/data", CancellationToken.None);

    result.StatusCode.Should().Be(HttpStatusCode.OK);
    httpClient.Verify(c => c.GetAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Exactly(3));
}
```

## Mocking with NSubstitute (Alternative)

```csharp
[Fact]
public async Task GetOrderAsync_WithNSubstitute()
{
    // Arrange
    var repository = Substitute.For<IOrderRepository>();
    var orderId = Guid.NewGuid();

    repository
        .FindByIdAsync(orderId, Arg.Any<CancellationToken>())
        .Returns(new Order { Id = orderId });

    var service = new OrderService(repository, Substitute.For<ILogger<OrderService>>());

    // Act
    var result = await service.GetOrderAsync(orderId, CancellationToken.None);

    // Assert
    result.Should().NotBeNull();
    await repository.Received(1).FindByIdAsync(orderId, Arg.Any<CancellationToken>());
}
```

## Testing Async Code

### Async Fact Tests

```csharp
[Fact]
public async Task ProcessOrderAsync_CompletesSuccessfully()
{
    // Arrange
    var orderId = Guid.NewGuid();
    var service = CreateService();

    // Act
    var result = await service.ProcessOrderAsync(orderId, CancellationToken.None);

    // Assert
    result.Status.Should().Be(OrderStatus.Confirmed);
}
```

### Testing Cancellation

```csharp
[Fact]
public async Task LongRunningOperation_WhenCancelled_ThrowsOperationCanceled()
{
    // Arrange
    var cts = new CancellationTokenSource();
    var service = CreateService();

    // Act
    cts.Cancel();
    var act = () => service.ProcessBatchAsync(cts.Token);

    // Assert
    await act.Should().ThrowAsync<OperationCanceledException>();
}
```

### Testing Task.WhenAll

```csharp
[Fact]
public async Task LoadDashboardAsync_FetchesConcurrently()
{
    // Arrange
    var orderService = new Mock<IOrderService>();
    var metricsService = new Mock<IMetricsService>();

    orderService
        .Setup(s => s.GetRecentAsync(It.IsAny<CancellationToken>()))
        .ReturnsAsync(new List<Order> { new() });

    metricsService
        .Setup(s => s.GetSummaryAsync(It.IsAny<CancellationToken>()))
        .ReturnsAsync(new MetricsSummary());

    var dashboard = new DashboardService(orderService.Object, metricsService.Object);

    // Act
    var result = await dashboard.LoadAsync(CancellationToken.None);

    // Assert
    result.Orders.Should().HaveCount(1);
    result.Metrics.Should().NotBeNull();
}
```

## ASP.NET Core Integration Tests

### WebApplicationFactory Setup

```csharp
public sealed class OrderApiTests(WebApplicationFactory<Program> factory)
    : IClassFixture<WebApplicationFactory<Program>>
{
    [Fact]
    public async Task GetOrders_ReturnsOkWithList()
    {
        // Arrange
        var client = factory.CreateClient();

        // Act
        var response = await client.GetAsync("/api/orders");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var orders = await response.Content.ReadFromJsonAsync<List<OrderDto>>();
        orders.Should().NotBeNull();
    }

    [Fact]
    public async Task CreateOrder_ValidRequest_ReturnsCreated()
    {
        var client = factory.CreateClient();

        var request = new CreateOrderRequest(
            Guid.NewGuid(),
            [new(Guid.NewGuid(), 2)]);

        var response = await client.PostAsJsonAsync("/api/orders", request);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        response.Headers.Location.Should().NotBeNull();
    }

    [Fact]
    public async Task GetOrder_NonExistentId_ReturnsNotFound()
    {
        var client = factory.CreateClient();

        var response = await client.GetAsync($"/api/orders/{Guid.NewGuid()}");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
```

### Custom WebApplicationFactory

```csharp
public sealed class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _dbName = $"TestDb-{Guid.NewGuid()}";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Replace real database with in-memory (unique per factory instance)
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
            if (descriptor is not null) services.Remove(descriptor);

            services.AddDbContext<AppDbContext>(options =>
                options.UseInMemoryDatabase(_dbName));

            // Replace external services with fakes
            services.AddSingleton<IEmailService, FakeEmailService>();
        });

        builder.UseEnvironment("Testing");
    }

    /// <summary>
    /// Reset the in-memory database and fake services between tests.
    /// Call via IAsyncLifetime.InitializeAsync — not from a constructor (async).
    /// </summary>
    public async Task ResetDatabaseAsync()
    {
        await using var scope = Services.CreateAsyncScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await context.Database.EnsureDeletedAsync();
        await context.Database.EnsureCreatedAsync();

        // Clear fake service state to prevent cross-test leakage
        if (Services.GetRequiredService<IEmailService>() is FakeEmailService fakeEmail)
        {
            fakeEmail.SentEmails.Clear();
        }
    }
}

public sealed class OrderApiTests : IClassFixture<CustomWebApplicationFactory>, IAsyncLifetime
{
    private readonly CustomWebApplicationFactory _factory;

    public OrderApiTests(CustomWebApplicationFactory factory) => _factory = factory;

    public async Task InitializeAsync() => await _factory.ResetDatabaseAsync();
    public Task DisposeAsync() => Task.CompletedTask;

    [Fact]
    public async Task CreateOrder_SendsConfirmationEmail()
    {
        var client = _factory.CreateClient();
        var emailService = _factory.Services.GetRequiredService<IEmailService>() as FakeEmailService;

        await client.PostAsJsonAsync("/api/orders", new CreateOrderRequest(
            Guid.NewGuid(), [new(Guid.NewGuid(), 1)]));

        emailService!.SentEmails.Should().ContainSingle()
            .Which.Subject.Should().Contain("Order Confirmation");
    }
}
```

### Testing Authentication

```csharp
public sealed class AuthenticatedApiTests(CustomWebApplicationFactory factory)
    : IClassFixture<CustomWebApplicationFactory>
{
    [Fact]
    public async Task ProtectedEndpoint_WithoutToken_Returns401()
    {
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/admin/users");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task ProtectedEndpoint_WithValidToken_Returns200()
    {
        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", GenerateTestJwt("admin"));

        var response = await client.GetAsync("/api/admin/users");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    private static string GenerateTestJwt(string role)
    {
        var key = new SymmetricSecurityKey("test-signing-key-at-least-32-chars!"u8.ToArray());
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            claims: [new Claim(ClaimTypes.Role, role)],
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
```

## Testing EF Core

### In-Memory Database Tests

```csharp
public sealed class OrderRepositoryTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly OrderRepository _repository;

    public OrderRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        _context = new AppDbContext(options);
        _repository = new OrderRepository(_context);
    }

    [Fact]
    public async Task AddAsync_ValidOrder_PersistsToDatabase()
    {
        var order = new Order
        {
            Id = Guid.NewGuid(),
            CustomerId = Guid.NewGuid(),
            Lines = [new OrderLine { ProductId = Guid.NewGuid(), Quantity = 2 }]
        };

        var result = await _repository.AddAsync(order, CancellationToken.None);

        result.Id.Should().Be(order.Id);
        _context.Orders.Should().ContainSingle();
    }

    [Fact]
    public async Task FindByCustomerAsync_ReturnsMatchingOrders()
    {
        var customerId = Guid.NewGuid();
        _context.Orders.AddRange(
            new Order { Id = Guid.NewGuid(), CustomerId = customerId },
            new Order { Id = Guid.NewGuid(), CustomerId = customerId },
            new Order { Id = Guid.NewGuid(), CustomerId = Guid.NewGuid() });
        await _context.SaveChangesAsync();

        var results = await _repository.FindByCustomerAsync(customerId, CancellationToken.None);

        results.Should().HaveCount(2);
        results.Should().OnlyContain(o => o.CustomerId == customerId);
    }

    public void Dispose() => _context.Dispose();
}
```

### Testcontainers for Real Database Tests

```csharp
public sealed class PostgresOrderRepositoryTests : IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder()
        .WithImage("postgres:16-alpine")
        .Build();

    private AppDbContext _context = null!;
    private OrderRepository _repository = null!;

    public async Task InitializeAsync()
    {
        await _postgres.StartAsync();

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(_postgres.GetConnectionString())
            .Options;

        _context = new AppDbContext(options);
        await _context.Database.MigrateAsync();
        _repository = new OrderRepository(_context);
    }

    [Fact]
    public async Task FindByIdAsync_WithRealPostgres_ReturnsOrder()
    {
        var order = new Order { Id = Guid.NewGuid(), CustomerId = Guid.NewGuid() };
        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        var result = await _repository.FindByIdAsync(order.Id, CancellationToken.None);

        result.Should().NotBeNull();
        result!.Id.Should().Be(order.Id);
    }

    public async Task DisposeAsync() => await _postgres.DisposeAsync();
}
```

## Testing Patterns

### Arrange-Act-Assert (AAA)

```csharp
[Fact]
public void CalculateDiscount_GoldMember_Returns20Percent()
{
    // Arrange
    var customer = new Customer { Tier = MembershipTier.Gold };
    var order = new Order { Total = 100m };

    // Act
    var discount = PricingEngine.CalculateDiscount(customer, order);

    // Assert
    discount.Should().Be(20m);
}
```

### Builder Pattern for Test Data

```csharp
public sealed class OrderBuilder
{
    private Guid _id = Guid.NewGuid();
    private Guid _customerId = Guid.NewGuid();
    private readonly List<OrderLine> _lines = [];
    private OrderStatus _status = OrderStatus.Pending;

    public OrderBuilder WithCustomer(Guid customerId) { _customerId = customerId; return this; }
    public OrderBuilder WithStatus(OrderStatus status) { _status = status; return this; }

    public OrderBuilder WithLine(Guid productId, int quantity, decimal unitPrice)
    {
        _lines.Add(new OrderLine { ProductId = productId, Quantity = quantity, UnitPrice = unitPrice });
        return this;
    }

    public Order Build() => new()
    {
        Id = _id,
        CustomerId = _customerId,
        Status = _status,
        Lines = _lines
    };
}

// Usage in tests
[Fact]
public void Order_WithMultipleLines_CalculatesTotalCorrectly()
{
    var order = new OrderBuilder()
        .WithLine(Guid.NewGuid(), 2, 10.00m)
        .WithLine(Guid.NewGuid(), 1, 25.00m)
        .Build();

    order.Total.Should().Be(45.00m);
}
```

### Shared Test Fixtures (Collection Fixtures)

```csharp
// Shared expensive resource across test classes
[CollectionDefinition("Database")]
public sealed class DatabaseCollection : ICollectionFixture<DatabaseFixture>;

public sealed class DatabaseFixture : IAsyncLifetime
{
    public AppDbContext Context { get; private set; } = null!;

    public async Task InitializeAsync()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase("SharedTestDb")
            .Options;
        Context = new AppDbContext(options);
        await Context.Database.EnsureCreatedAsync();
    }

    public async Task DisposeAsync() => await Context.DisposeAsync();
}

[Collection("Database")]
public sealed class UserServiceTests(DatabaseFixture db)
{
    [Fact]
    public async Task CreateUser_PersistsToSharedDatabase()
    {
        var service = new UserService(db.Context);
        var user = await service.CreateAsync("Alice", CancellationToken.None);
        user.Name.Should().Be("Alice");
    }
}
```

## Property-Based Testing with FsCheck

### Setup

```xml
<PackageReference Include="FsCheck.Xunit" Version="3.*" />
```

### Basic Property Tests

```csharp
using FsCheck;
using FsCheck.Xunit;

public sealed class SortPropertyTests
{
    [Property]
    public Property Sort_PreservesLength(int[] input)
    {
        var sorted = input.OrderBy(x => x).ToArray();
        return (sorted.Length == input.Length).ToProperty();
    }

    [Property]
    public Property Sort_ProducesOrderedOutput(int[] input)
    {
        var sorted = input.OrderBy(x => x).ToArray();
        return sorted.Zip(sorted.Skip(1), (a, b) => a <= b)
            .All(x => x)
            .ToProperty();
    }

    [Property]
    public Property Sort_ContainsSameElements(int[] input)
    {
        var sorted = input.OrderBy(x => x).ToArray();
        return input.All(x => sorted.Contains(x)).ToProperty();
    }
}
```

### Encode/Decode Roundtrip

```csharp
[Property]
public Property Base64_RoundTrip(NonEmptyString input)
{
    var encoded = Convert.ToBase64String(Encoding.UTF8.GetBytes(input.Get));
    var decoded = Encoding.UTF8.GetString(Convert.FromBase64String(encoded));
    return (decoded == input.Get).ToProperty();
}
```

### Custom Generators

```csharp
public static class Generators
{
    public static Arbitrary<EmailAddress> ValidEmail() =>
        Arb.From(
            from user in Arb.Generate<NonEmptyString>()
            from domain in Arb.Generate<NonEmptyString>()
            select new EmailAddress($"{Sanitize(user.Get)}@{Sanitize(domain.Get)}.com"));

    private static string Sanitize(string s) =>
        new(s.Where(char.IsLetterOrDigit).Take(10).DefaultIfEmpty('a').ToArray());
}

[Property(Arbitrary = new[] { typeof(Generators) })]
public Property Validator_AcceptsValidEmails(EmailAddress email)
{
    return EmailValidator.IsValid(email.Value).ToProperty();
}
```

### Domain Invariant Testing

```csharp
[Property]
public Property Order_TotalNeverNegative(PositiveInt quantity, PositiveInt unitPrice)
{
    var order = new Order();
    order.AddLine(Guid.NewGuid(), quantity.Get, unitPrice.Get);
    return (order.Total >= 0).ToProperty();
}

[Property]
public Property Discount_NeverExceedsTotal(PositiveInt total, byte discountPercent)
{
    var percent = discountPercent % 101; // 0-100
    var discount = PricingEngine.CalculateDiscount(total.Get, percent);
    return (discount <= total.Get && discount >= 0).ToProperty();
}
```

## Full TDD Walkthrough: Email Validator

### Step 1: Define Interface

```csharp
namespace MyApp.Domain.Validation;

public static class EmailValidator
{
    public static bool IsValid(string email) =>
        throw new NotImplementedException();
}
```

### Step 2: Write Tests (RED)

```csharp
namespace MyApp.Tests.Domain.Validation;

public sealed class EmailValidatorTests
{
    [Theory]
    [InlineData("alice@example.com", true)]
    [InlineData("bob.smith@company.co.uk", true)]
    [InlineData("user+tag@domain.org", true)]
    [InlineData("", false)]
    [InlineData("invalid", false)]
    [InlineData("@no-user.com", false)]
    [InlineData("user@", false)]
    [InlineData("user@.com", false)]
    public void IsValid_VariousInputs_ReturnsExpected(string email, bool expected)
    {
        EmailValidator.IsValid(email).Should().Be(expected);
    }

    [Fact]
    public void IsValid_NullInput_ReturnsFalse()
    {
        EmailValidator.IsValid(null!).Should().BeFalse();
    }
}
```

### Step 3: Run Tests — Verify FAIL

```bash
$ dotnet test --filter "EmailValidatorTests"

EmailValidatorTests > IsValid_VariousInputs_ReturnsExpected FAILED
  System.NotImplementedException

FAILED (9 tests, 0 passed, 9 failed)
```

### Step 4: Implement (GREEN)

```csharp
using System.Text.RegularExpressions;

namespace MyApp.Domain.Validation;

public static partial class EmailValidator
{
    [GeneratedRegex(@"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$")]
    private static partial Regex EmailRegex();

    public static bool IsValid(string? email) =>
        !string.IsNullOrWhiteSpace(email) && EmailRegex().IsMatch(email);
}
```

### Step 5: Run Tests — Verify PASS

```bash
$ dotnet test --filter "EmailValidatorTests"

PASSED (9 tests, 9 passed, 0 failed)
```

### Step 6: Check Coverage

```bash
$ dotnet test --collect:"XPlat Code Coverage"

Coverage: 100.0%
```

## Test Organization

### Directory Structure

```
tests/
├── MyApp.Tests.Unit/              # Unit tests
│   ├── Domain/
│   │   ├── Models/
│   │   │   └── OrderTests.cs
│   │   └── Validation/
│   │       └── EmailValidatorTests.cs
│   ├── Services/
│   │   └── OrderServiceTests.cs
│   └── MyApp.Tests.Unit.csproj
├── MyApp.Tests.Integration/       # Integration tests
│   ├── Api/
│   │   └── OrderApiTests.cs
│   ├── Repositories/
│   │   └── OrderRepositoryTests.cs
│   ├── CustomWebApplicationFactory.cs
│   └── MyApp.Tests.Integration.csproj
└── MyApp.Tests.E2E/               # End-to-end tests
    ├── Flows/
    │   └── CheckoutFlowTests.cs
    └── MyApp.Tests.E2E.csproj
```

### Test Project Configuration

```xml
<!-- MyApp.Tests.Unit.csproj -->
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net9.0</TargetFramework>
    <Nullable>enable</Nullable>
    <IsPackable>false</IsPackable>
    <IsTestProject>true</IsTestProject>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.*" />
    <PackageReference Include="xunit" Version="2.*" />
    <PackageReference Include="xunit.runner.visualstudio" Version="2.*" />
    <PackageReference Include="FluentAssertions" Version="7.*" />
    <PackageReference Include="Moq" Version="4.*" />
    <PackageReference Include="coverlet.collector" Version="6.*" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\..\src\MyApp\MyApp.csproj" />
  </ItemGroup>
</Project>
```

## Best Practices

### DO

- **Write test FIRST** before any implementation (TDD)
- **Run tests after each change** to catch regressions
- **Use FluentAssertions** for expressive, readable assertions
- **Use Moq/NSubstitute** for dependency isolation
- **Test behavior, not implementation** — verify outputs, not internal calls
- **Include edge cases** — empty, null, boundary values, concurrent access
- **Use `CancellationToken.None`** explicitly in tests for clarity
- **Name tests descriptively** — `MethodName_Scenario_ExpectedResult`
- **Keep tests independent** — no shared mutable state between tests
- **Use builders** for complex test data to keep tests readable

### DON'T

- **Write implementation before tests** — defeats TDD purpose
- **Skip the RED phase** — always verify the test fails first
- **Test private methods directly** — test through public API
- **Use `Thread.Sleep`** in tests — use async patterns or `TaskCompletionSource`
- **Ignore flaky tests** — fix or quarantine immediately
- **Mock what you don't own** — wrap external libraries behind interfaces
- **Share state between tests** — each test should set up its own data
- **Assert on too many things** — one logical assertion per test
- **Use magic strings/numbers** — extract to well-named constants

## Running Tests

```bash
# Run all tests
dotnet test

# Run specific project
dotnet test tests/MyApp.Tests.Unit

# Run specific test class
dotnet test --filter "FullyQualifiedName~OrderServiceTests"

# Run specific test method
dotnet test --filter "FullyQualifiedName~OrderServiceTests.CreateAsync_ValidRequest"

# Run with verbose output
dotnet test --verbosity detailed

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"

# Stop on first failure
dotnet test -p:VSTestStopOnError=true

# Run with specific category
dotnet test --filter "Category=Unit"
```

## Coverage Targets

| Code Type | Target |
|-----------|--------|
| Critical business logic | 100% |
| Public APIs and services | 90%+ |
| General application code | 80%+ |
| Generated/scaffolded code | Exclude |
| Startup/configuration | Exclude |

## CI Integration

```yaml
# GitHub Actions
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-dotnet@v4
      with:
        dotnet-version: '9.0.x'

    - name: Restore
      run: dotnet restore

    - name: Build
      run: dotnet build --no-restore

    - name: Format check
      run: dotnet format --verify-no-changes

    - name: Test with coverage
      run: dotnet test --no-build --collect:"XPlat Code Coverage"

    - name: Generate coverage report
      run: |
        dotnet tool install -g dotnet-reportgenerator-globaltool
        reportgenerator -reports:**/coverage.cobertura.xml -targetdir:coverage-report

    - name: Upload coverage
      uses: actions/upload-artifact@v4
      with:
        name: coverage-report
        path: coverage-report/
```

## Quick Reference

| Pattern | Usage |
|---------|-------|
| `[Fact]` | Single test case |
| `[Theory] + [InlineData]` | Data-driven test |
| `[Theory] + [MemberData]` | Complex data-driven test |
| `Should().Be()` | FluentAssertions equality |
| `Should().Throw<T>()` | Exception testing |
| `Mock<T>()` / `Setup()` | Moq mocking |
| `Verify()` | Moq call verification |
| `WebApplicationFactory<T>` | ASP.NET Core integration test |
| `IAsyncLifetime` | Async setup/teardown |
| `IClassFixture<T>` | Shared per-class fixture |
| `[Collection]` | Shared across-class fixture |

## References

- Agent: `agents/csharp-reviewer.md`
- Skill: `skills/csharp-patterns/`
- Skill: `skills/aspnet-core-patterns/`
- Skill: `skills/efcore-patterns/`
- Skill: `skills/tdd-workflow/`
- Rules: `rules/csharp/testing.md`

**Remember**: Tests are documentation. They show how your code is meant to be used. Write them clearly and keep them up to date.
