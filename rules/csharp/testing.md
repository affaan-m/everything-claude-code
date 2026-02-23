---
paths:
  - "**/*.cs"
  - "**/*.csproj"
  - "**/*.sln"
---
# C# Testing

> This file extends [common/testing.md](../common/testing.md) with C# specific content.

## Framework — xUnit with `[Theory]`

```csharp
[Theory]
[InlineData("test@example.com", true)]
[InlineData("invalid", false)]
public void ValidateEmail_ShouldReturnExpected(string email, bool expected)
    => Assert.Equal(expected, EmailValidator.IsValid(email));
```

## Integration Tests

Use `WebApplicationFactory<Program>` for API testing:

```csharp
public class UsersApiTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
{
    [Fact]
    public async Task GetUser_ReturnsOk()
    {
        var client = factory.CreateClient();
        var response = await client.GetAsync("/api/users/1");
        response.EnsureSuccessStatusCode();
    }
}
```

## Mocking & Assertions
- **NSubstitute** for mocking: `var repo = Substitute.For<IUserRepo>();`
- **FluentAssertions**: `result.Should().BeEquivalentTo(expected);`

## Coverage
```bash
dotnet test --collect:"XPlat Code Coverage"
```
