---
name: csharp-testing
description: C# testing patterns using xUnit, FluentAssertions, NSubstitute, WebApplicationFactory, Coverlet coverage, and TDD methodology.
origin: ECC
---

# C# Testing Patterns

Comprehensive testing strategies for C# applications using xUnit, FluentAssertions, NSubstitute, and TDD methodology.

## When to Activate

- Writing new C# code (follow TDD: red, green, refactor)
- Designing test suites for .NET applications
- Reviewing C# test coverage
- Setting up .NET testing infrastructure
- Debugging failing C# tests

## TDD Workflow

Always follow the RED-GREEN-REFACTOR cycle.

```csharp
// Step 1: RED — Write a failing test
// tests/Unit/CalculatorTests.cs
using Xunit;
using FluentAssertions;

namespace MyApp.Tests.Unit;

public class CalculatorTests
{
    [Fact]
    public void Add_TwoPositiveNumbers_ReturnsSum()
    {
        // Arrange
        var calculator = new Calculator();

        // Act
        var result = calculator.Add(2, 3);

        // Assert
        result.Should().Be(5);
    }

    [Theory]
    [InlineData(-1, 1, 0)]
    [InlineData(-5, -3, -8)]
    [InlineData(0, 0, 0)]
    public void Add_VariousInputs_ReturnsExpectedSum(int a, int b, int expected)
    {
        var calculator = new Calculator();

        calculator.Add(a, b).Should().Be(expected);
    }
}

// Step 2: GREEN — Write minimal implementation
// src/Calculator.cs
namespace MyApp;

public class Calculator
{
    public int Add(int a, int b) => a + b;
}

// Step 3: REFACTOR — Improve while tests stay green
// Run: dotnet test tests/Unit/
```

```bash
# Run the TDD cycle
dotnet test                          # Run all tests
dotnet test --filter "ClassName"     # Run specific class
dotnet watch test                    # Re-run on file changes
```

## xUnit Fundamentals

xUnit is the standard .NET testing framework — convention-based, extensible, and built for modern C#.

### Facts and Theories

```csharp
using Xunit;

namespace MyApp.Tests.Unit;

public class UserServiceTests
{
    // [Fact] — single test case, no parameters
    [Fact]
    public void GetDisplayName_WithFirstAndLastName_ReturnsCombined()
    {
        var user = new User("Alice", "Smith");

        var display = user.GetDisplayName();

        Assert.Equal("Alice Smith", display);
    }

    // [Theory] with [InlineData] — parameterized tests
    [Theory]
    [InlineData("", false)]
    [InlineData("a", false)]
    [InlineData("abc", false)]
    [InlineData("abcd1!", true)]
    [InlineData("ValidPass1!", true)]
    public void IsValidPassword_VariousInputs_ReturnsExpected(string password, bool expected)
    {
        var validator = new PasswordValidator();

        var result = validator.IsValid(password);

        Assert.Equal(expected, result);
    }
}
```

### MemberData and ClassData

```csharp
using Xunit;

namespace MyApp.Tests.Unit;

public class MathServiceTests
{
    // [MemberData] — data from a static property or method
    public static IEnumerable<object[]> DivisionData =>
    [
        [10.0, 2.0, 5.0],
        [9.0, 3.0, 3.0],
        [100.0, 4.0, 25.0],
    ];

    [Theory]
    [MemberData(nameof(DivisionData))]
    public void Divide_ValidInputs_ReturnsQuotient(double a, double b, double expected)
    {
        var service = new MathService();

        service.Divide(a, b).Should().Be(expected);
    }

    // [ClassData] — data from a dedicated class
    [Theory]
    [ClassData(typeof(EdgeCaseData))]
    public void Process_EdgeCases_HandlesGracefully(string input, string expected)
    {
        var result = StringProcessor.Process(input);

        result.Should().Be(expected);
    }
}

public class EdgeCaseData : IEnumerable<object[]>
{
    public IEnumerator<object[]> GetEnumerator()
    {
        yield return ["", ""];
        yield return [" ", ""];
        yield return [null!, ""];
    }

    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
}
```

### Constructor Injection and IAsyncLifetime

```csharp
using Xunit;

namespace MyApp.Tests.Unit;

// Constructor = setup, IDisposable = teardown
public class FileServiceTests : IDisposable
{
    private readonly string _tempDir;
    private readonly FileService _service;

    public FileServiceTests()
    {
        _tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
        Directory.CreateDirectory(_tempDir);
        _service = new FileService(_tempDir);
    }

    [Fact]
    public void WriteFile_ValidContent_CreatesFile()
    {
        _service.Write("test.txt", "hello");

        File.Exists(Path.Combine(_tempDir, "test.txt")).Should().BeTrue();
    }

    public void Dispose()
    {
        if (Directory.Exists(_tempDir))
            Directory.Delete(_tempDir, recursive: true);
    }
}

// IAsyncLifetime for async setup/teardown
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

    public async Task DisposeAsync()
    {
        await _connection.DisposeAsync();
    }

    private static Task SeedTestData(DbConnection conn) => Task.CompletedTask;
    private static Task<List<string>> QueryUsers(DbConnection conn) => Task.FromResult(new List<string>());
}
```

### Test Naming Convention

```
{MethodUnderTest}_{Scenario}_{ExpectedBehavior}
```

- Class: `{ClassUnderTest}Tests` (e.g., `OrderServiceTests`)
- Method: `PlaceOrder_EmptyCart_ThrowsInvalidOperationException`

## FluentAssertions

Readable, expressive assertions with clear failure messages.

```csharp
using FluentAssertions;
using Xunit;

namespace MyApp.Tests.Unit;

public class FluentAssertionExamples
{
    [Fact]
    public void BasicAssertions()
    {
        // Value assertions
        var result = 42;
        result.Should().Be(42);
        result.Should().BePositive();
        result.Should().BeInRange(1, 100);

        // String assertions
        var name = "Alice Smith";
        name.Should().StartWith("Alice");
        name.Should().Contain("Smith");
        name.Should().NotBeNullOrWhiteSpace();
        name.Should().HaveLength(11);

        // Nullable assertions
        string? email = null;
        email.Should().BeNull();

        string? confirmed = "yes";
        confirmed.Should().NotBeNull();
    }

    [Fact]
    public void CollectionAssertions()
    {
        var items = new List<string> { "apple", "banana", "cherry" };

        items.Should().HaveCount(3);
        items.Should().Contain("banana");
        items.Should().NotContain("grape");
        items.Should().BeInAscendingOrder();
        items.Should().OnlyContain(s => s.Length > 3);
        items.Should().ContainMatch("*rry");
    }

    [Fact]
    public void ObjectGraphComparison()
    {
        var expected = new User("Alice", "alice@test.com", Role.Admin);
        var actual = new User("Alice", "alice@test.com", Role.Admin);

        // Deep equality comparison
        actual.Should().BeEquivalentTo(expected);

        // Exclude specific members
        actual.Should().BeEquivalentTo(expected, options => options
            .Excluding(u => u.CreatedAt)
            .Using<DateTime>(ctx => ctx.Subject.Should()
                .BeCloseTo(ctx.Expectation, TimeSpan.FromSeconds(1)))
            .WhenTypeIs<DateTime>()
        );
    }

    [Fact]
    public async Task ExceptionAssertions()
    {
        var service = new OrderService();

        // Assert exception type and message
        var act = () => service.PlaceOrder(null!);

        act.Should().Throw<ArgumentNullException>()
            .WithMessage("*order*")
            .WithParameterName("order");

        // Assert async exception
        Func<Task> asyncAct = () => service.ProcessAsync(null!);

        await asyncAct.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*cannot process*");
    }

    [Fact]
    public void ExecutionTimeAssertions()
    {
        var service = new DataService();

        var act = () => service.QuickLookup("key");

        act.ExecutionTime().Should().BeLessThan(TimeSpan.FromMilliseconds(500));
    }
}
```

## NSubstitute

Creating substitutes, configuring returns, and verifying calls.

### Basic Substitution

```csharp
using NSubstitute;
using Xunit;
using FluentAssertions;

namespace MyApp.Tests.Unit;

public class OrderServiceTests
{
    private readonly IOrderRepository _repository;
    private readonly INotificationService _notifications;
    private readonly OrderService _sut;

    public OrderServiceTests()
    {
        _repository = Substitute.For<IOrderRepository>();
        _notifications = Substitute.For<INotificationService>();
        _sut = new OrderService(_repository, _notifications);
    }

    [Fact]
    public async Task PlaceOrder_ValidOrder_SavesAndNotifies()
    {
        // Arrange — configure returns
        var order = new Order("ORD-001", "Widget", 3);
        _repository.SaveAsync(Arg.Any<Order>())
            .Returns(Task.FromResult(true));

        // Act
        await _sut.PlaceOrderAsync(order);

        // Assert — verify interactions
        await _repository.Received(1).SaveAsync(Arg.Is<Order>(o => o.Id == "ORD-001"));
        await _notifications.Received(1)
            .SendAsync(Arg.Is<string>(msg => msg.Contains("ORD-001")));
    }

    [Fact]
    public async Task PlaceOrder_SaveFails_DoesNotNotify()
    {
        var order = new Order("ORD-002", "Gadget", 1);
        _repository.SaveAsync(Arg.Any<Order>())
            .Returns(Task.FromResult(false));

        await _sut.PlaceOrderAsync(order);

        await _notifications.DidNotReceive().SendAsync(Arg.Any<string>());
    }
}
```

### Argument Matchers and Callbacks

```csharp
using NSubstitute;
using Xunit;
using FluentAssertions;

namespace MyApp.Tests.Unit;

public class NSubstitutePatterns
{
    [Fact]
    public void ArgumentMatchers()
    {
        var cache = Substitute.For<ICacheService>();

        // Match any argument
        cache.Get<string>(Arg.Any<string>()).Returns("cached");

        // Match specific predicate
        cache.Get<string>(Arg.Is<string>(k => k.StartsWith("user:")))
            .Returns("user-data");

        cache.Get<string>("user:42").Should().Be("user-data");
        cache.Get<string>("other").Should().Be("cached");
    }

    [Fact]
    public void CallbacksWithWhenDo()
    {
        var logger = Substitute.For<ILogger>();
        var messages = new List<string>();

        // Capture arguments via callback
        logger.When(l => l.Log(Arg.Any<string>()))
            .Do(call => messages.Add(call.Arg<string>()));

        logger.Log("first");
        logger.Log("second");

        messages.Should().BeEquivalentTo(["first", "second"]);
    }

    [Fact]
    public void SequentialReturns()
    {
        var service = Substitute.For<ITokenService>();

        // Return different values on successive calls
        service.GenerateToken()
            .Returns("token-1", "token-2", "token-3");

        service.GenerateToken().Should().Be("token-1");
        service.GenerateToken().Should().Be("token-2");
        service.GenerateToken().Should().Be("token-3");
    }
}

// Good: Substitute interfaces, not concrete classes
// var repo = Substitute.For<IOrderRepository>();

// Bad: Substituting concrete classes with non-virtual methods
// var repo = Substitute.For<OrderRepository>(); // Methods must be virtual
```

## Integration Testing

### WebApplicationFactory

```csharp
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using System.Net;
using System.Net.Http.Json;
using Xunit;
using FluentAssertions;

namespace MyApp.Tests.Integration;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Remove the real database context
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
            if (descriptor is not null)
                services.Remove(descriptor);

            // Add in-memory database
            services.AddDbContext<AppDbContext>(options =>
                options.UseInMemoryDatabase("TestDb"));

            // Replace external services with fakes
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
        // Arrange
        var payload = new { ProductName = "Widget", Quantity = 3 };

        // Act
        var response = await _client.PostAsJsonAsync("/api/orders", payload);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var order = await response.Content.ReadFromJsonAsync<OrderResponse>();
        order.Should().NotBeNull();
        order!.ProductName.Should().Be("Widget");
        order.Quantity.Should().Be(3);
    }

    [Fact]
    public async Task GetOrder_NonExistent_Returns404()
    {
        var response = await _client.GetAsync("/api/orders/99999");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task ListOrders_ReturnsPagedResults()
    {
        var response = await _client.GetAsync("/api/orders?page=1&size=10");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<PagedResult<OrderResponse>>();
        result!.Items.Should().NotBeNull();
        result.Page.Should().Be(1);
    }
}
```

### TestContainers for Database Testing

```csharp
using Testcontainers.PostgreSql;
using Xunit;
using FluentAssertions;

namespace MyApp.Tests.Integration;

public class PostgresTests : IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder()
        .WithImage("postgres:16-alpine")
        .WithDatabase("testdb")
        .WithUsername("test")
        .WithPassword("test")
        .Build();

    public async Task InitializeAsync()
    {
        await _postgres.StartAsync();
        var connectionString = _postgres.GetConnectionString();
        // Run migrations against connectionString
    }

    [Fact]
    public async Task UserRepository_Save_PersistsToDatabase()
    {
        var connectionString = _postgres.GetConnectionString();
        var repo = new UserRepository(connectionString);

        await repo.SaveAsync(new User("Alice", "alice@test.com"));

        var user = await repo.FindByEmailAsync("alice@test.com");
        user.Should().NotBeNull();
        user!.Name.Should().Be("Alice");
    }

    public async Task DisposeAsync()
    {
        await _postgres.DisposeAsync();
    }
}
```

## Test Organization

### Arrange-Act-Assert Pattern

```csharp
[Fact]
public void CalculateDiscount_GoldMember_Returns20Percent()
{
    // Arrange — set up preconditions
    var pricing = new PricingService();
    var customer = new Customer("Alice", MembershipTier.Gold);
    var order = new Order(totalAmount: 100.00m);

    // Act — execute the behavior under test
    var discount = pricing.CalculateDiscount(customer, order);

    // Assert — verify the outcome
    discount.Should().Be(20.00m);
}
```

### Test Project Structure

```text
tests/
├── Unit/
│   ├── Services/
│   │   ├── OrderServiceTests.cs
│   │   └── PricingServiceTests.cs
│   ├── Models/
│   │   └── UserTests.cs
│   └── Validators/
│       └── PasswordValidatorTests.cs
├── Integration/
│   ├── Api/
│   │   └── OrdersApiTests.cs
│   ├── Repositories/
│   │   └── UserRepositoryTests.cs
│   └── CustomWebApplicationFactory.cs
├── E2E/
│   └── CheckoutFlowTests.cs
├── Fixtures/
│   ├── TestDataBuilder.cs
│   └── sample-config.json
└── MyApp.Tests.csproj
```

### Shared Fixtures with IClassFixture and ICollectionFixture

```csharp
using Xunit;

namespace MyApp.Tests.Integration;

// Shared across all tests in the class
public class DatabaseFixture : IAsyncLifetime
{
    public string ConnectionString { get; private set; } = "";

    public async Task InitializeAsync()
    {
        ConnectionString = "Data Source=:memory:";
        await MigrateDatabase(ConnectionString);
    }

    public Task DisposeAsync() => Task.CompletedTask;
    private static Task MigrateDatabase(string cs) => Task.CompletedTask;
}

public class UserRepositoryTests : IClassFixture<DatabaseFixture>
{
    private readonly DatabaseFixture _db;

    public UserRepositoryTests(DatabaseFixture db)
    {
        _db = db;
    }

    [Fact]
    public void FindById_ExistingUser_ReturnsUser()
    {
        // Use _db.ConnectionString
    }
}

// Shared across multiple test classes via collection
[CollectionDefinition("Database")]
public class DatabaseCollection : ICollectionFixture<DatabaseFixture> { }

[Collection("Database")]
public class OrderRepositoryTests
{
    private readonly DatabaseFixture _db;

    public OrderRepositoryTests(DatabaseFixture db)
    {
        _db = db;
    }

    [Fact]
    public void Save_ValidOrder_Persists()
    {
        // Use _db.ConnectionString
    }
}
```

### Test Categories with Trait

```csharp
[Fact]
[Trait("Category", "Integration")]
[Trait("Feature", "Authentication")]
public async Task Login_ValidCredentials_ReturnsToken()
{
    // ...
}
```

```bash
# Run only unit tests
dotnet test --filter "Category=Unit"

# Exclude integration tests
dotnet test --filter "Category!=Integration"
```

## Coverage with Coverlet

### Running Coverage

```bash
# Collect coverage during test run
dotnet test --collect:"XPlat Code Coverage"

# With specific output format
dotnet test --collect:"XPlat Code Coverage" \
  -- DataCollectionRunSettings.DataCollectors.DataCollector.Configuration.Format=cobertura

# Generate HTML report with ReportGenerator
dotnet tool install -g dotnet-reportgenerator-globaltool
reportgenerator \
  -reports:"**/coverage.cobertura.xml" \
  -targetdir:"coveragereport" \
  -reporttypes:Html
open coveragereport/index.html

# CI threshold enforcement
dotnet test --collect:"XPlat Code Coverage" \
  -- DataCollectionRunSettings.DataCollectors.DataCollector.Configuration.Format=cobertura
reportgenerator \
  -reports:"**/coverage.cobertura.xml" \
  -targetdir:"coveragereport" \
  -reporttypes:TextSummary
# Fail pipeline if below threshold
```

### .runsettings Configuration

```xml
<?xml version="1.0" encoding="utf-8" ?>
<RunSettings>
  <DataCollectionRunSettings>
    <DataCollectors>
      <DataCollector friendlyName="XPlat Code Coverage">
        <Configuration>
          <Format>cobertura</Format>
          <Exclude>[*]MyApp.Migrations.*,[*]*.Program</Exclude>
          <ExcludeByAttribute>GeneratedCodeAttribute,ObsoleteAttribute</ExcludeByAttribute>
          <SingleHit>false</SingleHit>
          <UseSourceLink>true</UseSourceLink>
          <IncludeTestAssembly>false</IncludeTestAssembly>
          <SkipAutoProps>true</SkipAutoProps>
          <DeterministicReport>true</DeterministicReport>
        </Configuration>
      </DataCollector>
    </DataCollectors>
  </DataCollectionRunSettings>
</RunSettings>
```

```bash
# Use .runsettings
dotnet test --settings coverlet.runsettings
```

## Best Practices

### DO

- **Follow TDD**: Write tests before implementation (red-green-refactor)
- **Use FluentAssertions**: Readable assertions, clear failure messages
- **Use Arrange-Act-Assert**: One logical assert per test
- **Mock interfaces, not classes**: Depend on abstractions
- **Use `IAsyncLifetime`**: For async setup and teardown
- **Name tests clearly**: `Method_Scenario_Expected` convention
- **Test edge cases**: Nulls, empty collections, boundary values, concurrency
- **Aim for 80%+ coverage**: Focus on business logic, not generated code
- **Keep tests fast**: Use in-memory databases, avoid real I/O in unit tests
- **Use test fixtures**: Share expensive setup across tests with `IClassFixture<T>`

### DON'T

- **Don't test implementation**: Test behavior and output, not internal state
- **Don't share mutable state**: Each test must be independent
- **Don't use static mutable state**: Causes flaky parallel tests
- **Don't over-mock**: Mock boundaries only, not the code under test
- **Don't ignore `async`/`await`**: Missing `await` causes tests to pass without running
- **Don't test framework code**: Trust xUnit, EF Core, ASP.NET to work correctly
- **Don't write brittle tests**: Avoid relying on exact error message strings
- **Don't skip `Dispose`**: Leaked resources cause flaky test suites

## Quick Reference

| Task | Command / Pattern |
|---|---|
| Run all tests | `dotnet test` |
| Run one project | `dotnet test tests/Unit/` |
| Filter by class | `dotnet test --filter "FullyQualifiedName~OrderServiceTests"` |
| Filter by trait | `dotnet test --filter "Category=Unit"` |
| Watch mode | `dotnet watch test` |
| Verbose output | `dotnet test --verbosity detailed` |
| Coverage report | `dotnet test --collect:"XPlat Code Coverage"` |
| HTML coverage | `reportgenerator -reports:**/coverage.cobertura.xml -targetdir:coveragereport -reporttypes:Html` |
| Assert equality | `result.Should().Be(expected)` |
| Assert collection | `items.Should().HaveCount(3).And.Contain("x")` |
| Assert exception | `act.Should().Throw<ArgumentException>()` |
| Create substitute | `Substitute.For<IService>()` |
| Verify call | `service.Received(1).Method(Arg.Any<string>())` |
| Verify no call | `service.DidNotReceive().Method(Arg.Any<string>())` |

## Common Pitfalls

### Forgetting async in Test Methods

```csharp
// Bad: Test passes without actually running the async code
[Fact]
public void GetUser_Returns_User()
{
    var result = _service.GetUserAsync(1);  // Missing await — returns Task, not User
    // No assertion failure because result is a non-null Task
}

// Good: Properly await async operations
[Fact]
public async Task GetUser_ExistingId_ReturnsUser()
{
    var result = await _service.GetUserAsync(1);

    result.Should().NotBeNull();
    result!.Id.Should().Be(1);
}
```

### Not Disposing HttpClient from Factory

```csharp
// Bad: Creating HttpClient without factory management
[Fact]
public async Task Test()
{
    using var client = new HttpClient();  // Bypasses WebApplicationFactory
    var response = await client.GetAsync("http://localhost:5000/api/orders");
}

// Good: Use factory.CreateClient()
[Fact]
public async Task Test()
{
    var client = _factory.CreateClient();  // Factory manages lifecycle
    var response = await client.GetAsync("/api/orders");
}
```

### Test Pollution from Shared State

```csharp
// Bad: Static field mutated across tests — order-dependent failures
public class BadTests
{
    private static List<string> _items = [];

    [Fact]
    public void Test1() { _items.Add("a"); _items.Should().HaveCount(1); }

    [Fact]
    public void Test2() { _items.Add("b"); _items.Should().HaveCount(1); } // Fails!
}

// Good: Fresh state per test via constructor
public class GoodTests
{
    private readonly List<string> _items = [];

    [Fact]
    public void Test1() { _items.Add("a"); _items.Should().HaveCount(1); }

    [Fact]
    public void Test2() { _items.Add("b"); _items.Should().HaveCount(1); } // Passes
}
```

### Over-Mocking

Mock the *dependency*, not the code under test. If your test only verifies that a substitute returns what you configured it to return, it tests nothing.

**Remember**: Tests are your safety net. Keep them fast, focused, and independent. Use xUnit for structure, FluentAssertions for readability, NSubstitute for isolation, and Coverlet for accountability.
