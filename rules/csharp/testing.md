---
paths:
  - "**/*.cs"
  - "**/*.csproj"
  - "**/*.sln"
  - "**/*.razor"
---
# C# Testing

> This file extends [common/testing.md](../common/testing.md) with C# specific content.

## Framework

Use **xUnit** for all new projects:

```csharp
public class CalculatorTests
{
    [Fact]
    public void Add_TwoNumbers_ReturnsSum()
    {
        var calc = new Calculator();
        Assert.Equal(5, calc.Add(2, 3));
    }

    [Theory]
    [InlineData(0, 0, 0)]
    [InlineData(-1, 1, 0)]
    [InlineData(100, 200, 300)]
    public void Add_VariousInputs_ReturnsExpected(int a, int b, int expected)
    {
        var calc = new Calculator();
        Assert.Equal(expected, calc.Add(a, b));
    }
}
```

## Runner

```bash
dotnet test                           # Run all tests
dotnet test --filter "FullyQualifiedName~Calculator"  # Filter by name
dotnet test --verbosity normal        # Verbose output
```

## Coverage

Use **Coverlet** — target 80%+:

```bash
dotnet test --collect:"XPlat Code Coverage"
# Report generation
dotnet tool install -g dotnet-reportgenerator-globaltool
reportgenerator -reports:**/coverage.cobertura.xml -targetdir:coverage-report
```

## Mocking

- **NSubstitute** (preferred) — concise, readable syntax
- **Moq** — widely used alternative

```csharp
var repo = Substitute.For<IUserRepository>();
repo.GetByIdAsync(1, Arg.Any<CancellationToken>())
    .Returns(new User { Id = 1, Name = "Alice" });
```

## Assertions

Use **FluentAssertions** for readable test assertions:

```csharp
result.Should().NotBeNull();
result.Name.Should().Be("Alice");
users.Should().HaveCount(3).And.OnlyContain(u => u.IsActive);
```

## Pitfalls

- Always use `[Fact]` or `[Theory]` — bare test methods are ignored by xUnit
- Use `CancellationToken.None` in tests, not `default` — be explicit

## Reference

See skill: `csharp-testing` for detailed C# TDD patterns with xUnit, NSubstitute, and Coverlet.
