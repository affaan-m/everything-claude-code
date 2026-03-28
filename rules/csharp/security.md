---
paths:
  - "**/*.cs"
  - "**/*.csx"
  - "**/*.csproj"
  - "**/appsettings*.json"
---
# C# Security

> This file extends [common/security.md](../common/security.md) with C#-specific content.

## Secret Management

- Never hardcode API keys, tokens, or connection strings in source code
- Use environment variables, user secrets for local development, and a secret manager in production
- Keep `appsettings.*.json` free of real credentials
- Use `dotnet user-secrets` for local development secrets

```csharp
// BAD
const string ApiKey = "sk-live-123";

// GOOD
var apiKey = builder.Configuration["OpenAI:ApiKey"]
    ?? throw new InvalidOperationException("OpenAI:ApiKey is not configured.");
```

```bash
# Local development secrets
dotnet user-secrets init
dotnet user-secrets set "OpenAI:ApiKey" "sk-dev-..."
```

## SQL Injection Prevention

- Always use parameterized queries with ADO.NET, Dapper, or EF Core
- Never concatenate user input into SQL strings
- Validate sort fields and filter operators before using dynamic query composition
- Use `FromSqlInterpolated` not `FromSqlRaw` with string concatenation

```csharp
// BAD — SQL injection
var sql = $"SELECT * FROM Orders WHERE CustomerId = '{customerId}'";

// GOOD — parameterized (Dapper)
const string sql = "SELECT * FROM Orders WHERE CustomerId = @customerId";
await connection.QueryAsync<Order>(sql, new { customerId });

// GOOD — parameterized (EF Core)
await context.Orders
    .FromSqlInterpolated($"SELECT * FROM Orders WHERE CustomerId = {customerId}")
    .ToListAsync(cancellationToken);
```

## Input Validation

- Validate DTOs at the application boundary
- Use data annotations, FluentValidation, or explicit guard clauses
- Reject invalid model state before running business logic
- Never trust client-supplied IDs for authorization decisions

```csharp
public sealed record CreateUserRequest
{
    [Required, StringLength(100)]
    public required string Name { get; init; }

    [Required, EmailAddress]
    public required string Email { get; init; }

    [Required, MinLength(8)]
    public required string Password { get; init; }
}
```

## Authentication and Authorization

- Prefer framework auth handlers instead of custom token parsing
- Enforce authorization policies at endpoint or handler boundaries
- Never log raw tokens, passwords, or PII
- Use `[Authorize(Policy = "...")]` for policy-based access control

```csharp
// Good: Policy-based authorization
builder.Services.AddAuthorizationBuilder()
    .AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"))
    .AddPolicy("OrderOwner", policy =>
        policy.Requirements.Add(new OrderOwnerRequirement()));
```

## Unsafe Deserialization

- Never use `BinaryFormatter` — remote code execution risk
- Never use `TypeNameHandling.All` in JSON — deserialization attacks
- Prefer `System.Text.Json` with default settings

```csharp
// BAD — unsafe deserialization
var obj = JsonConvert.DeserializeObject<object>(json,
    new JsonSerializerSettings { TypeNameHandling = TypeNameHandling.All });

// GOOD — safe defaults
var obj = JsonSerializer.Deserialize<OrderDto>(json);
```

## Command Injection

- Never pass unsanitized user input to `Process.Start`
- Validate and allowlist command arguments
- Prefer library APIs over shelling out

```csharp
// BAD — command injection
Process.Start("cmd.exe", $"/c dir {userInput}");

// GOOD — validated, constrained
if (!AllowedDirectories.Contains(userInput))
    throw new UnauthorizedAccessException();
```

## Error Handling

- Return safe client-facing messages
- Log detailed exceptions with structured context server-side
- Do not expose stack traces, SQL text, or filesystem paths in API responses
- Use `IExceptionHandler` (ASP.NET Core 8+) for centralized error handling

## HTTPS and Transport Security

- Enable `UseHttpsRedirection` in production
- Configure HSTS headers
- Validate TLS certificates for outgoing HTTP calls

## References

See skill: `security-review` for broader application security review checklists.
