---
name: csharp-security
description: Comprehensive C# / ASP.NET Core security covering authentication, authorization, input validation, SQL injection prevention, XSS/CSRF protection, secrets management, and security headers.
origin: ECC
---

# C# Security Patterns

Comprehensive security guidelines for C# / ASP.NET Core applications covering authentication, input validation, injection prevention, and secure coding practices.

## When to Use

- Handling user input in ASP.NET Core applications
- Configuring authentication and authorization
- Reviewing C# code for security vulnerabilities
- Building REST APIs with ASP.NET Core
- Managing secrets and configuration
- Setting up HTTP security headers

## Authentication & Authorization

### ASP.NET Core Identity Setup

```csharp
// Program.cs
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 12;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireLowercase = true;
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();
```

### JWT Bearer Authentication

```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]
                    ?? throw new InvalidOperationException("Jwt:Key configuration is required"))),
            ClockSkew = TimeSpan.Zero
        };
    });

app.UseAuthentication();
app.UseAuthorization();
```

### Policy-Based Authorization

```csharp
builder.Services.AddAuthorizationBuilder()
    .AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"))
    .AddPolicy("PremiumUser", policy =>
        policy.RequireAssertion(context =>
            context.User.HasClaim(c => c.Type == "Subscription" && c.Value == "Premium")));

[Authorize(Policy = "AdminOnly")]
[HttpDelete("users/{id}")]
public IActionResult DeleteUser(int id) { /* ... */ }
```

## Input Validation

### Data Annotations

```csharp
public record CreateUserRequest
{
    [Required(ErrorMessage = "Name is required")]
    [StringLength(100, MinimumLength = 2)]
    public required string Name { get; init; }

    [Required]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    [StringLength(254)]
    public required string Email { get; init; }

    [Required]
    [Range(18, 120, ErrorMessage = "Age must be between 18 and 120")]
    public required int Age { get; init; }
}
```

### FluentValidation Integration

```csharp
public class CreateOrderValidator : AbstractValidator<CreateOrderRequest>
{
    public CreateOrderValidator()
    {
        RuleFor(x => x.ProductId).GreaterThan(0);
        RuleFor(x => x.Quantity).InclusiveBetween(1, 1000);
        RuleFor(x => x.ShippingAddress).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Email).EmailAddress(EmailValidationMode.AspNetCoreCompatible);
    }
}

// Program.cs
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<CreateOrderValidator>();
```

`[ApiController]` returns 400 automatically for invalid models — no manual `ModelState` check needed.

## SQL Injection Prevention

### EF Core LINQ (Automatically Parameterized)

```csharp
// Good: LINQ queries are always parameterized
public async Task<List<User>> SearchUsers(string name, string status)
{
    return await context.Users
        .Where(u => u.Name.Contains(name) && u.Status == status)
        .OrderBy(u => u.Name)
        .Take(50)
        .ToListAsync();
}

// Good: FromSqlInterpolated — safely parameterized
public async Task<List<User>> FindByEmail(string email)
{
    return await context.Users
        .FromSqlInterpolated($"SELECT * FROM Users WHERE Email = {email}")
        .ToListAsync();
}

// Bad: FromSqlRaw with string interpolation (SQLi!)
return await context.Users
    .FromSqlRaw($"SELECT * FROM Users WHERE Email = '{email}'")
    .ToListAsync();
```

### Dapper with Parameters

```csharp
// Good: Parameterized query
return await db.QuerySingleOrDefaultAsync<User>(
    "SELECT * FROM Users WHERE Id = @Id", new { Id = id });

// Bad: String concatenation (SQLi!)
return await db.QuerySingleOrDefaultAsync<User>(
    "SELECT * FROM Users WHERE Id = " + id);
```

## XSS Prevention

```csharp
// Good: Razor @ automatically HTML-encodes output
<p>Welcome, @Model.UserName</p>

// Bad: @Html.Raw() with user data bypasses encoding (XSS!)
<div>@Html.Raw(Model.UserBio)</div>

// Good: Only use Html.Raw for trusted, sanitized content
<div>@Html.Raw(sanitizer.Sanitize(Model.UserBio))</div>

// Manual encoding for different contexts
using System.Text.Encodings.Web;
HtmlEncoder.Default.Encode(userInput);         // HTML context
JavaScriptEncoder.Default.Encode(userInput);   // JS context
UrlEncoder.Default.Encode(userInput);          // URL context
```

### Content-Security-Policy

```csharp
app.Use(async (context, next) =>
{
    context.Response.Headers.Append(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; frame-ancestors 'none'");
    await next();
});
```

## CSRF Protection

```csharp
// Razor form with anti-forgery token
<form method="post" asp-action="Transfer">
    @Html.AntiForgeryToken()
    <input type="text" asp-for="Amount" />
    <button type="submit">Transfer</button>
</form>

[HttpPost]
[ValidateAntiForgeryToken]
public IActionResult Transfer(TransferRequest request) { /* ... */ }

// SameSite cookies
builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.HttpOnly = true;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.Cookie.SameSite = SameSiteMode.Strict;
    options.ExpireTimeSpan = TimeSpan.FromHours(1);
});

// JWT-protected APIs don't need anti-forgery tokens when JWT is sent via Authorization header (not cookies)
[ApiController]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
[IgnoreAntiforgeryToken]
public class OrdersApiController : ControllerBase { /* ... */ }
```

## Secrets Management

```bash
# Development: User Secrets (never stored in source code)
dotnet user-secrets init
dotnet user-secrets set "Database:Password" "my-dev-password"
dotnet user-secrets set "Jwt:Key" "my-dev-signing-key-at-least-32-chars"
```

```csharp
// Production: Azure Key Vault
builder.Configuration.AddAzureKeyVault(
    new Uri($"https://{builder.Configuration["KeyVault:Name"]}.vault.azure.net/"),
    new DefaultAzureCredential());

// IOptions pattern — bind and validate at startup
builder.Services.AddOptions<JwtSettings>()
    .BindConfiguration("Jwt")
    .ValidateDataAnnotations()
    .ValidateOnStart();
```

Never store secrets in `appsettings.json` — it's committed to source control.

## HTTP Security Headers

```csharp
// SecurityHeadersMiddleware.cs
public class SecurityHeadersMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var headers = context.Response.Headers;
        headers.Append("X-Content-Type-Options", "nosniff");
        headers.Append("X-Frame-Options", "DENY");
        headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
        headers.Append("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
        headers.Append("Content-Security-Policy",
            "default-src 'self'; script-src 'self'; style-src 'self'; frame-ancestors 'none'");
        await next(context);
    }
}

// HSTS (production only)
builder.Services.AddHsts(options =>
{
    options.MaxAge = TimeSpan.FromDays(365);
    options.IncludeSubDomains = true;
    options.Preload = true;
});
app.UseHsts();
app.UseHttpsRedirection();
```

## Rate Limiting

```csharp
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("fixed", o =>
    {
        o.PermitLimit = 100;
        o.Window = TimeSpan.FromMinutes(1);
    });
    options.AddTokenBucketLimiter("token", o =>
    {
        o.TokenLimit = 50;
        o.ReplenishmentPeriod = TimeSpan.FromSeconds(10);
        o.TokensPerPeriod = 10;
    });
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

app.UseRateLimiter();

[EnableRateLimiting("fixed")]
[HttpPost("login")]
public IActionResult Login(LoginRequest request) { /* ... */ }
```

## Security Tooling

```xml
<!-- .csproj — enable security analyzers -->
<PropertyGroup>
    <EnableNETAnalyzers>true</EnableNETAnalyzers>
    <AnalysisLevel>latest-all</AnalysisLevel>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
</PropertyGroup>
```

```bash
# Check for known vulnerable packages
dotnet list package --vulnerable --include-transitive
```

## OWASP Top 10 Mapping

| OWASP Category | C# / .NET Mitigation |
|---|---|
| A01: Broken Access Control | `[Authorize]` policies, resource-based authorization |
| A02: Cryptographic Failures | Data Protection API, Azure Key Vault |
| A03: Injection | EF Core LINQ, `FromSqlInterpolated`, Dapper parameters |
| A04: Insecure Design | Input validation with FluentValidation, secure defaults |
| A05: Security Misconfiguration | `UseHsts()`, security headers middleware |
| A06: Vulnerable Components | `dotnet list package --vulnerable`, NuGet audit |
| A07: Auth Failures | Identity with lockout, JWT with short expiry, MFA |
| A08: Software Integrity | NuGet package signing, CI artifact verification |
| A09: Logging Failures | Structured logging, audit trails, never log secrets |
| A10: SSRF | `HttpClient` with allowed-host validation |

## Quick Security Checklist

| Check | What to Verify |
|---|---|
| Authentication | Identity or JWT with strong settings |
| Authorization | `[Authorize]` with policies on all protected endpoints |
| Input validation | Data Annotations or FluentValidation on all models |
| SQL queries | EF Core LINQ or parameterized queries only |
| HTML output | Razor auto-encoding, no `@Html.Raw()` with user data |
| CSRF | Anti-forgery tokens on forms, SameSite cookies |
| Secrets | User-secrets in dev, Key Vault in prod |
| HTTPS | `UseHttpsRedirection()` and `UseHsts()` |
| Headers | X-Content-Type-Options, X-Frame-Options, CSP |
| Rate limiting | `AddRateLimiter` on auth and sensitive endpoints |
| Dependencies | `dotnet list package --vulnerable` |

**Remember**: ASP.NET Core provides strong security defaults, but they must be configured correctly. Defense in depth — never rely on a single layer.
