---
paths:
  - "**/*.cs"
  - "**/*.csproj"
  - "**/*.sln"
  - "**/*.razor"
---
# C# Security

> This file extends [common/security.md](../common/security.md) with C# specific content.

## Secret Management

- **Development**: Use `dotnet user-secrets` — never store secrets in `appsettings.json`
- **Production**: Use Azure Key Vault, AWS Secrets Manager, or environment variables
- Access via `IConfiguration` or `IOptions<T>`:

```csharp
builder.Configuration.AddUserSecrets<Program>();

// Bind to strongly-typed options
builder.Services.Configure<JwtSettings>(
    builder.Configuration.GetSection("Jwt"));
```

## Input Validation

Use **Data Annotations** or **FluentValidation**:

```csharp
public record CreateUserRequest
{
    [Required, StringLength(100)]
    public required string Name { get; init; }

    [Required, EmailAddress]
    public required string Email { get; init; }
}

// FluentValidation
public class CreateUserValidator : AbstractValidator<CreateUserRequest>
{
    public CreateUserValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
    }
}
```

## SQL Injection Prevention

Always use EF Core parameterized queries or Dapper parameters — never interpolate into SQL:

```csharp
// Good: EF Core LINQ (parameterized automatically)
var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email, ct);

// Good: Dapper with parameters
var user = await connection.QueryFirstOrDefaultAsync<User>(
    "SELECT * FROM Users WHERE Email = @Email", new { Email = email });

// Bad: String interpolation in raw SQL
var user = await db.Users
    .FromSqlRaw($"SELECT * FROM Users WHERE Email = '{email}'")  // SQLi!
    .FirstOrDefaultAsync(ct);
```

## XSS Prevention

- Razor auto-encodes `@` expressions — never use `@Html.Raw()` with user input
- Use `HtmlEncoder.Default.Encode()` for manual encoding
- Set Content-Security-Policy headers

## Security Scanning

Use Roslyn security analyzers:

```xml
<!-- In .csproj -->
<PackageReference Include="Microsoft.CodeAnalysis.NetAnalyzers" Version="8.0.0">
  <PrivateAssets>all</PrivateAssets>
</PackageReference>
<PackageReference Include="SecurityCodeScan.VS2019" Version="5.6.7">
  <PrivateAssets>all</PrivateAssets>
</PackageReference>
```

## Reference

See skill: `csharp-security` for comprehensive C# security patterns, OWASP coverage, and auth configuration.
