---
name: csharp-testing
description: C# testing patterns using xUnit, FluentAssertions, NSubstitute, WebApplicationFactory, Coverlet coverage, and TDD methodology.
origin: ECC
---

# C# Testing Patterns

Testing strategies for C# applications using xUnit, FluentAssertions, NSubstitute, and TDD methodology.

## When to Use

- Writing new C# code (follow TDD: red, green, refactor)
- Designing test suites for .NET applications
- Reviewing C# test coverage
- Setting up .NET testing infrastructure
- Debugging failing C# tests

## TDD Workflow

Always follow the RED-GREEN-REFACTOR cycle.

```csharp
// Step 1: RED — Write a failing test
using Xunit;
using FluentAssertions;

namespace MyApp.Tests.Unit;

public class CalculatorTests
{
    [Fact]
    public void Add_TwoPositiveNumbers_ReturnsSum()
    {
        var calculator = new Calculator();
        calculator.Add(2, 3).Should().Be(5);
    }

    [Theory]
    [InlineData(-1, 1, 0)]
    [InlineData(-5, -3, -8)]
    [InlineData(0, 0, 0)]
    public void Add_VariousInputs_ReturnsExpectedSum(int a, int b, int expected)
    {
        new Calculator().Add(a, b).Should().Be(expected);
    }
}

// Step 2: GREEN — Write minimal implementation
public class Calculator
{
    public int Add(int a, int b) => a + b;
}

// Step 3: REFACTOR — Improve while tests stay green
```

```bash
dotnet test                          # Run all tests
dotnet test --filter "ClassName"     # Run specific class
dotnet watch test                    # Re-run on file changes
```

## xUnit Fundamentals

### Facts, Theories, and MemberData

```csharp
public class UserServiceTests
{
    // [Fact] — single test case
    [Fact]
    public void GetDisplayName_WithFirstAndLastName_ReturnsCombined()
    {
        var user = new User("Alice", "Smith");
        user.GetDisplayName().Should().Be("Alice Smith");
    }

    // [Theory] with [InlineData] — parameterized tests
    [Theory]
    [InlineData("", false)]
    [InlineData("abcd1!", true)]
    public void IsValidPassword_VariousInputs_ReturnsExpected(string password, bool expected)
    {
        new PasswordValidator().IsValid(password).Should().Be(expected);
    }

    // [MemberData] — data from a static property
    public static IEnumerable<object[]> DivisionData =>
    [
        [10.0, 2.0, 5.0],
        [9.0, 3.0, 3.0],
    ];

    [Theory]
    [MemberData(nameof(DivisionData))]
    public void Divide_ValidInputs_ReturnsQuotient(double a, double b, double expected)
    {
        new MathService().Divide(a, b).Should().Be(expected);
    }
}
```

### Test Naming Convention

```
{MethodUnderTest}_{Scenario}_{ExpectedBehavior}
```

- Class: `{ClassUnderTest}Tests` (e.g., `OrderServiceTests`)
- Method: `PlaceOrder_EmptyCart_ThrowsInvalidOperationException`

### IAsyncLifetime for Async Setup/Teardown

```csharp
public class DatabaseTests : IAsyncLifetime
{
    private DbConnection _connection = null!;

    public async Task InitializeAsync()
    {
        _connection = new SqliteConnection("Data Source=:memory:");
        await _connection.OpenAsync();
        await SeedTestData(_connection);
    }

    [Fact]
    public async Task QueryUsers_ReturnsSeededData()
    {
        var users = await QueryUsers(_connection);
        users.Should().NotBeEmpty();
    }

    public async Task DisposeAsync() => await _connection.DisposeAsync();

    private static Task SeedTestData(DbConnection conn) => Task.CompletedTask; // Insert test data here
    private static Task<List<string>> QueryUsers(DbConnection conn) => Task.FromResult(new List<string> { "Alice" });
}
```

## FluentAssertions

```csharp
// Value assertions
result.Should().Be(42);
result.Should().BeInRange(1, 100);

// String assertions
name.Should().StartWith("Alice").And.Contain("Smith");

// Collection assertions
items.Should().HaveCount(3).And.Contain("banana").And.BeInAscendingOrder();

// Object graph comparison
actual.Should().BeEquivalentTo(expected, o => o.Excluding(u => u.CreatedAt));

// Exception assertions
var act = () => service.PlaceOrder(null!);
act.Should().Throw<ArgumentNullException>().WithMessage("*order*");

// Async exception
Func<Task> asyncAct = () => service.ProcessAsync(null!);
await asyncAct.Should().ThrowAsync<InvalidOperationException>();
```

## NSubstitute

```csharp
public class OrderServiceTests
{
    private readonly IOrderRepository _repository = Substitute.For<IOrderRepository>();
    private readonly INotificationService _notifications = Substitute.For<INotificationService>();
    private readonly OrderService _sut;

    public OrderServiceTests()
    {
        _sut = new OrderService(_repository, _notifications);
    }

    [Fact]
    public async Task PlaceOrder_ValidOrder_SavesAndNotifies()
    {
        var order = new Order("ORD-001", "Widget", 3);
        _repository.SaveAsync(Arg.Any<Order>()).Returns(Task.FromResult(true));

        await _sut.PlaceOrderAsync(order);

        await _repository.Received(1).SaveAsync(Arg.Is<Order>(o => o.Id == "ORD-001"));
        await _notifications.Received(1).SendAsync(Arg.Is<string>(msg => msg.Contains("ORD-001")));
    }

    [Fact]
    public async Task PlaceOrder_SaveFails_DoesNotNotify()
    {
        _repository.SaveAsync(Arg.Any<Order>()).Returns(Task.FromResult(false));

        await _sut.PlaceOrderAsync(new Order("ORD-002", "Gadget", 1));

        await _notifications.DidNotReceive().SendAsync(Arg.Any<string>());
    }
}

// Good: Substitute interfaces, not concrete classes
// var repo = Substitute.For<IOrderRepository>();
```

## Integration Testing

### WebApplicationFactory

```csharp
public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
            if (descriptor is not null) services.Remove(descriptor);

            services.AddDbContext<AppDbContext>(options =>
                options.UseInMemoryDatabase($"TestDb_{Guid.NewGuid()}"));
            services.AddSingleton<IEmailService, FakeEmailService>();
        });
        builder.UseEnvironment("Testing");
    }
}

public class OrdersApiTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public OrdersApiTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CreateOrder_ValidPayload_Returns201()
    {
        var response = await _client.PostAsJsonAsync("/api/orders",
            new { ProductName = "Widget", Quantity = 3 });

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var order = await response.Content.ReadFromJsonAsync<OrderResponse>();
        order!.ProductName.Should().Be("Widget");
    }

    [Fact]
    public async Task GetOrder_NonExistent_Returns404()
    {
        var response = await _client.GetAsync("/api/orders/99999");
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
```

### TestContainers for Database Testing

```csharp
public class PostgresTests : IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder()
        .WithImage("postgres:16-alpine")
        .WithDatabase("testdb")
        .WithUsername("test")
        .WithPassword("test")
        .Build();

    public async Task InitializeAsync() => await _postgres.StartAsync();

    [Fact]
    public async Task UserRepository_Save_PersistsToDatabase()
    {
        var repo = new UserRepository(_postgres.GetConnectionString());
        await repo.SaveAsync(new User("Alice", "alice@test.com"));

        var user = await repo.FindByEmailAsync("alice@test.com");
        user.Should().NotBeNull();
        user!.Name.Should().Be("Alice");
    }

    public async Task DisposeAsync() => await _postgres.DisposeAsync();
}
```

## Test Organization

### Arrange-Act-Assert Pattern

```csharp
[Fact]
public void CalculateDiscount_GoldMember_Returns20Percent()
{
    // Arrange
    var pricing = new PricingService();
    var customer = new Customer("Alice", MembershipTier.Gold);
    var order = new Order(totalAmount: 100.00m);

    // Act
    var discount = pricing.CalculateDiscount(customer, order);

    // Assert
    discount.Should().Be(20.00m);
}
```

### Test Project Structure

```text
tests/
├── Unit/
│   ├── Services/
│   └── Validators/
├── Integration/
│   ├── Api/
│   └── CustomWebApplicationFactory.cs
├── E2E/
└── MyApp.Tests.csproj
```

### Shared Fixtures

```csharp
// IClassFixture — shared across tests in one class
public class UserRepoTests : IClassFixture<DatabaseFixture>
{
    public UserRepoTests(DatabaseFixture db) { /* use db.ConnectionString */ }
}

// ICollectionFixture — shared across multiple test classes
[CollectionDefinition("Database")]
public class DatabaseCollection : ICollectionFixture<DatabaseFixture> { }

[Collection("Database")]
public class OrderRepoTests { /* ... */ }
```

## Coverage with Coverlet

```bash
# Collect coverage
dotnet test --collect:"XPlat Code Coverage"

# Generate HTML report
dotnet tool install -g dotnet-reportgenerator-globaltool
reportgenerator -reports:"**/coverage.cobertura.xml" -targetdir:coveragereport -reporttypes:Html

# Filter by trait
dotnet test --filter "Category=Unit"
dotnet test --filter "Category!=Integration"
```

## Best Practices

**DO:** Follow TDD (red-green-refactor) | Use FluentAssertions for readability | Use Arrange-Act-Assert | Mock interfaces, not classes | Use `IAsyncLifetime` for async setup | Name tests `Method_Scenario_Expected` | Aim for 80%+ coverage | Keep tests fast

**DON'T:** Test implementation details | Share mutable state between tests | Use static mutable state | Over-mock (mock boundaries only) | Skip `await` in async tests | Test framework code | Write brittle tests relying on exact strings | Skip `Dispose`

## Quick Reference

| Task | Command / Pattern |
|---|---|
| Run all tests | `dotnet test` |
| Filter by class | `dotnet test --filter "FullyQualifiedName~OrderServiceTests"` |
| Watch mode | `dotnet watch test` |
| Coverage | `dotnet test --collect:"XPlat Code Coverage"` |
| Assert equality | `result.Should().Be(expected)` |
| Assert collection | `items.Should().HaveCount(3).And.Contain("x")` |
| Assert exception | `act.Should().Throw<ArgumentException>()` |
| Create substitute | `Substitute.For<IService>()` |
| Verify call | `service.Received(1).Method(Arg.Any<string>())` |
| Verify no call | `service.DidNotReceive().Method(Arg.Any<string>())` |

## Common Pitfalls

```csharp
// Bad: Missing await — test passes without running async code
[Fact]
public void GetUser_Returns_User()
{
    var result = _service.GetUserAsync(1);  // Returns Task, not User
}

// Good: Properly await
[Fact]
public async Task GetUser_ExistingId_ReturnsUser()
{
    var result = await _service.GetUserAsync(1);
    result.Should().NotBeNull();
}

// Bad: Static shared state — order-dependent failures
public class BadTests
{
    private static List<string> _items = [];
    [Fact] public void Test1() { _items.Add("a"); _items.Should().HaveCount(1); }
    [Fact] public void Test2() { _items.Add("b"); _items.Should().HaveCount(1); } // Fails!
}

// Good: Fresh state per test via constructor
public class GoodTests
{
    private readonly List<string> _items = [];
    [Fact] public void Test1() { _items.Add("a"); _items.Should().HaveCount(1); }
    [Fact] public void Test2() { _items.Add("b"); _items.Should().HaveCount(1); } // Passes
}
```

**Remember**: Tests are your safety net. Keep them fast, focused, and independent.
