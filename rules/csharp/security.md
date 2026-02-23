---
paths:
  - "**/*.cs"
  - "**/*.csproj"
  - "**/*.sln"
---
# C# Security

> This file extends [common/security.md](../common/security.md) with C# specific content.

## SQL Injection Prevention

Always use **EF Core LINQ** or parameterized queries:

```csharp
// GOOD — EF Core LINQ
var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);

// BAD — raw SQL string concatenation
db.Database.ExecuteSqlRaw("SELECT * FROM Users WHERE Email = '" + email + "'");
```

## Input Validation

Use **FluentValidation** for complex rules:

```csharp
public class CreateUserValidator : AbstractValidator<CreateUserRequest>
{
    public CreateUserValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).MinimumLength(8);
    }
}
```

## Secret Management

```bash
dotnet user-secrets set "Jwt:Secret" "your-secret-here"
```

## Anti-Forgery — always use `[ValidateAntiForgeryToken]` on form endpoints.
