---
name: csharp-security
description: Comprehensive C# / ASP.NET Core security covering authentication, authorization, input validation, SQL injection prevention, XSS/CSRF protection, secrets management, and security headers.
origin: ECC
---

# C# Security Patterns

Comprehensive security guidelines for C# / ASP.NET Core applications covering authentication, input validation, injection prevention, and secure coding practices.

## When to Activate

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
// Program.cs
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
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),
            ClockSkew = TimeSpan.Zero
        };
    });

// Middleware order matters
app.UseAuthentication();
app.UseAuthorization();
```

### Policy-Based Authorization

```csharp
// Program.cs — register policies
builder.Services.AddAuthorizationBuilder()
    .AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"))
    .AddPolicy("MinAge18", policy =>
        policy.RequireClaim("DateOfBirth")
              .AddRequirements(new MinimumAgeRequirement(18)))
    .AddPolicy("PremiumUser", policy =>
        policy.RequireAssertion(context =>
            context.User.HasClaim(c => c.Type == "Subscription" && c.Value == "Premium")));

// Controller usage
[Authorize(Policy = "AdminOnly")]
[HttpDelete("users/{id}")]
public IActionResult DeleteUser(int id) { /* ... */ }

[Authorize(Roles = "Editor,Admin")]
[HttpPut("articles/{id}")]
public IActionResult UpdateArticle(int id, ArticleDto dto) { /* ... */ }
```

## Input Validation

### Data Annotations

```csharp
// Good: Constrained model with annotations
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

    [RegularExpression(@"^\+?[1-9]\d{6,14}$", ErrorMessage = "Invalid phone number")]
    public string? Phone { get; init; }
}
```

### FluentValidation Integration

```csharp
// Validator class
public class CreateOrderValidator : AbstractValidator<CreateOrderRequest>
{
    public CreateOrderValidator()
    {
        RuleFor(x => x.ProductId)
            .GreaterThan(0)
            .WithMessage("Product ID must be positive");

        RuleFor(x => x.Quantity)
            .InclusiveBetween(1, 1000)
            .WithMessage("Quantity must be between 1 and 1000");

        RuleFor(x => x.ShippingAddress)
            .NotEmpty()
            .MaximumLength(500);

        RuleFor(x => x.Email)
            .EmailAddress(EmailValidationMode.AspNetCoreCompatible);
    }
}

// Program.cs registration
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<CreateOrderValidator>();
```

### ApiController Auto-Validation

```csharp
// Good: [ApiController] returns 400 automatically for invalid models
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    [HttpPost]
    public IActionResult Create([FromBody] CreateUserRequest request)
    {
        // Model is already validated — no manual check needed
        // Invalid requests never reach this code
        return Ok(userService.Create(request));
    }
}

// Bad: Manual validation without [ApiController]
[HttpPost]
public IActionResult BadCreate([FromBody] CreateUserRequest request)
{
    // Forgetting to check ModelState = processing invalid input
    return Ok(userService.Create(request));
}
```

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
```

### Raw SQL in EF Core

```csharp
// Good: FromSqlInterpolated — safely parameterized via interpolation
public async Task<List<User>> FindByEmail(string email)
{
    return await context.Users
        .FromSqlInterpolated($"SELECT * FROM Users WHERE Email = {email}")
        .ToListAsync();
}

// Good: FromSql with explicit parameters (.NET 8+)
public async Task<List<User>> FindByStatus(string status)
{
    return await context.Users
        .FromSql($"SELECT * FROM Users WHERE Status = {status}")
        .ToListAsync();
}

// Bad: FromSqlRaw with string interpolation (SQLi!)
public async Task<List<User>> BadFind(string email)
{
    return await context.Users
        .FromSqlRaw($"SELECT * FROM Users WHERE Email = '{email}'")
        .ToListAsync();
    // If email = "' OR 1=1 --", returns all users
}
```

### Dapper with Parameters

```csharp
// Good: Parameterized query with Dapper
public async Task<User?> GetUser(IDbConnection db, int id)
{
    return await db.QuerySingleOrDefaultAsync<User>(
        "SELECT * FROM Users WHERE Id = @Id",
        new { Id = id });
}

// Good: Multiple parameters
public async Task<IEnumerable<User>> Search(IDbConnection db, string name, string role)
{
    return await db.QueryAsync<User>(
        "SELECT * FROM Users WHERE Name LIKE @Name AND Role = @Role",
        new { Name = $"%{name}%", Role = role });
}

// Bad: String concatenation (SQLi!)
public async Task<User?> BadGetUser(IDbConnection db, string id)
{
    return await db.QuerySingleOrDefaultAsync<User>(
        "SELECT * FROM Users WHERE Id = " + id);
}
```

## XSS Prevention

### Razor Auto-Encoding

```csharp
// Good: @ automatically HTML-encodes output
<p>Welcome, @Model.UserName</p>
<span>@Model.Comment</span>

// Bad: @Html.Raw() with user data bypasses encoding (XSS!)
<div>@Html.Raw(Model.UserBio)</div>

// Good: Only use Html.Raw for trusted, sanitized content
<div>@Html.Raw(sanitizer.Sanitize(Model.UserBio))</div>
```

### Manual Encoding

```csharp
using System.Text.Encodings.Web;

// Good: HtmlEncoder for HTML context
public string SafeHtml(string userInput)
{
    return HtmlEncoder.Default.Encode(userInput);
}

// Good: JavaScriptEncoder for JS context
public string SafeJs(string userInput)
{
    return JavaScriptEncoder.Default.Encode(userInput);
}

// Good: UrlEncoder for URL context
public string SafeUrl(string userInput)
{
    return UrlEncoder.Default.Encode(userInput);
}
```

### Content-Security-Policy

```csharp
// Program.cs
app.Use(async (context, next) =>
{
    context.Response.Headers.Append(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'");
    await next();
});
```

## CSRF Protection

### Razor Anti-Forgery Tokens

```csharp
// In Razor form
<form method="post" asp-action="Transfer">
    @Html.AntiForgeryToken()
    <input type="text" asp-for="Amount" />
    <button type="submit">Transfer</button>
</form>

// Controller action
[HttpPost]
[ValidateAntiForgeryToken]
public IActionResult Transfer(TransferRequest request)
{
    // Token is automatically validated
    return Ok(transferService.Execute(request));
}
```

### SameSite Cookies

```csharp
// Program.cs
builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.HttpOnly = true;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.Cookie.SameSite = SameSiteMode.Strict;
    options.ExpireTimeSpan = TimeSpan.FromHours(1);
    options.SlidingExpiration = true;
});
```

### API Endpoints with JWT

```csharp
// JWT-protected APIs don't need anti-forgery tokens
[ApiController]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
[IgnoreAntiforgeryToken]
[Route("api/[controller]")]
public class OrdersApiController : ControllerBase
{
    [HttpPost]
    public IActionResult Create(CreateOrderRequest request) { /* ... */ }
}
```

## Secrets Management

### Development: User Secrets

```bash
# Initialize user secrets
dotnet user-secrets init

# Set secrets (never stored in source code)
dotnet user-secrets set "Database:Password" "my-dev-password"
dotnet user-secrets set "Jwt:Key" "my-dev-signing-key-at-least-32-chars"
```

### Production: Azure Key Vault

```csharp
// Program.cs
builder.Configuration.AddAzureKeyVault(
    new Uri($"https://{builder.Configuration["KeyVault:Name"]}.vault.azure.net/"),
    new DefaultAzureCredential());

// Secrets are accessible via IConfiguration
var dbConnection = builder.Configuration["Database:ConnectionString"];
```

### IOptions Pattern

```csharp
// Configuration class
public class JwtSettings
{
    public required string Key { get; init; }
    public required string Issuer { get; init; }
    public required string Audience { get; init; }
    public int ExpiryMinutes { get; init; } = 60;
}

// Program.cs — bind and validate
builder.Services.AddOptions<JwtSettings>()
    .BindConfiguration("Jwt")
    .ValidateDataAnnotations()
    .ValidateOnStart();

// Usage via dependency injection
public class TokenService(IOptions<JwtSettings> jwtOptions)
{
    private readonly JwtSettings _settings = jwtOptions.Value;

    public string GenerateToken(User user) { /* use _settings */ }
}
```

### What NOT to Do

```jsonc
// Bad: Secrets in appsettings.json (committed to source control!)
{
  "ConnectionStrings": {
    "Default": "Server=prod-db;Password=hunter2;..."  // NEVER
  },
  "Jwt": {
    "Key": "my-super-secret-signing-key"              // NEVER
  }
}
```

## HTTP Security Headers

### Built-in HSTS

```csharp
// Program.cs
builder.Services.AddHsts(options =>
{
    options.MaxAge = TimeSpan.FromDays(365);
    options.IncludeSubDomains = true;
    options.Preload = true;
});

// Middleware (only in production — not during development)
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

app.UseHttpsRedirection();
```

### Custom Security Headers Middleware

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

// Program.cs
app.UseMiddleware<SecurityHeadersMiddleware>();
```

## Rate Limiting

### .NET 8 Built-in Rate Limiting

```csharp
// Program.cs
builder.Services.AddRateLimiter(options =>
{
    // Fixed window: 100 requests per 1 minute
    options.AddFixedWindowLimiter("fixed", limiterOptions =>
    {
        limiterOptions.PermitLimit = 100;
        limiterOptions.Window = TimeSpan.FromMinutes(1);
        limiterOptions.QueueLimit = 0;
    });

    // Sliding window: smoother distribution
    options.AddSlidingWindowLimiter("sliding", limiterOptions =>
    {
        limiterOptions.PermitLimit = 100;
        limiterOptions.Window = TimeSpan.FromMinutes(1);
        limiterOptions.SegmentsPerWindow = 4;
    });

    // Token bucket: burst-friendly
    options.AddTokenBucketLimiter("token", limiterOptions =>
    {
        limiterOptions.TokenLimit = 50;
        limiterOptions.ReplenishmentPeriod = TimeSpan.FromSeconds(10);
        limiterOptions.TokensPerPeriod = 10;
    });

    // Concurrency limiter: max simultaneous requests
    options.AddConcurrencyLimiter("concurrency", limiterOptions =>
    {
        limiterOptions.PermitLimit = 20;
        limiterOptions.QueueLimit = 5;
        limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
    });

    // Global rejection response
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

// Middleware
app.UseRateLimiter();

// Controller usage
[EnableRateLimiting("fixed")]
[HttpPost("login")]
public IActionResult Login(LoginRequest request) { /* ... */ }

[EnableRateLimiting("token")]
[HttpGet("search")]
public IActionResult Search(string query) { /* ... */ }
```

## OWASP Top 10 Mapping

| OWASP Category | C# / .NET Mitigation |
|---|---|
| A01: Broken Access Control | `[Authorize]` policies, resource-based authorization, CORS configuration |
| A02: Cryptographic Failures | Data Protection API, Azure Key Vault, `IDataProtector` for encryption |
| A03: Injection | EF Core LINQ, `FromSqlInterpolated`, Dapper parameterized queries |
| A04: Insecure Design | Threat modeling, input validation with FluentValidation, secure defaults |
| A05: Security Misconfiguration | `UseHsts()`, security headers middleware, disable detailed errors in production |
| A06: Vulnerable Components | `dotnet list package --vulnerable`, Dependabot, NuGet audit |
| A07: Auth Failures | ASP.NET Core Identity with lockout, JWT with short expiry, MFA |
| A08: Software Integrity | NuGet package signing, assembly signing, CI artifact verification |
| A09: Logging Failures | Serilog/Seq structured logging, audit trails, never log secrets |
| A10: SSRF | `HttpClient` with allowed-host validation, `IHttpClientFactory` policies |

## Security Tooling

### Roslyn Analyzers

```xml
<!-- .csproj — enable all built-in security analyzers -->
<PropertyGroup>
    <EnableNETAnalyzers>true</EnableNETAnalyzers>
    <AnalysisLevel>latest-all</AnalysisLevel>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
</PropertyGroup>

<ItemGroup>
    <PackageReference Include="Microsoft.CodeAnalysis.NetAnalyzers" Version="8.*" />
    <PackageReference Include="SecurityCodeScan.VS2019" Version="5.*" />
</ItemGroup>
```

### Vulnerable Dependency Detection

```bash
# Check for known vulnerable packages
dotnet list package --vulnerable --include-transitive

# Retire.NET for deeper analysis
dotnet tool install -g dotnet-retire
dotnet retire

# NuGet audit in CI
dotnet restore --force-evaluate
# NuGet audit is enabled by default in .NET 8+
```

### SAST in CI (GitHub Actions)

```yaml
# .github/workflows/security.yml
- name: Run SecurityCodeScan
  run: dotnet build /p:TreatWarningsAsErrors=true

- name: Check vulnerable packages
  run: dotnet list package --vulnerable --include-transitive | grep -q "has the following vulnerable packages" && exit 1 || exit 0

- name: Run dotnet-retire
  run: |
    dotnet tool install -g dotnet-retire
    dotnet retire
```

## Anti-Patterns

```csharp
// 1. Hardcoded secrets in source code
var key = "sk-prod-abc123def456";                  // CRITICAL: use Key Vault or user-secrets

// 2. Raw SQL string interpolation (SQLi)
var sql = $"SELECT * FROM Users WHERE Name = '{name}'";  // CRITICAL: use parameterized queries
context.Users.FromSqlRaw(sql).ToList();

// 3. Disabled HTTPS in production
app.UseHttpsRedirection();  // Removing this line = CRITICAL vulnerability

// 4. Catch-all exception hiding
try { /* ... */ }
catch (Exception) { }                              // Silently swallows all errors — masks attacks

// 5. @Html.Raw() with user input (XSS)
@Html.Raw(Model.UserComment)                       // CRITICAL: renders unescaped HTML

// 6. Disabled model validation
[ApiController]  // Removing this = no automatic 400 for invalid models
public class UsersController : ControllerBase { }

// 7. Overly permissive CORS
builder.Services.AddCors(o => o.AddDefaultPolicy(b =>
    b.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));  // Allows any origin

// 8. Logging sensitive data
logger.LogInformation("Login: user={User} password={Password}", user, password);  // NEVER log credentials

// 9. Weak password policy
options.Password.RequiredLength = 4;               // Too short — use 12+ characters
options.Password.RequireNonAlphanumeric = false;   // Weakens password strength

// 10. Missing rate limiting on authentication endpoints
[HttpPost("login")]
public IActionResult Login(LoginRequest req) { }   // No [EnableRateLimiting] = brute-force target
```

## Quick Security Checklist

| Check | What to Verify |
|---|---|
| Authentication | ASP.NET Core Identity or JWT configured with strong settings |
| Authorization | `[Authorize]` with policies on all protected endpoints |
| Input validation | Data Annotations or FluentValidation on all request models |
| SQL queries | EF Core LINQ or parameterized queries, never string interpolation |
| HTML output | Razor auto-encoding, no `@Html.Raw()` with user data |
| CSRF tokens | Anti-forgery tokens on form posts, SameSite cookies |
| Secrets | User-secrets in dev, Key Vault in prod, never in appsettings.json |
| HTTPS | `UseHttpsRedirection()` and `UseHsts()` in production |
| Security headers | X-Content-Type-Options, X-Frame-Options, CSP, Referrer-Policy |
| Rate limiting | `AddRateLimiter` on auth and sensitive endpoints |
| Dependencies | `dotnet list package --vulnerable`, NuGet audit enabled |
| Logging | Structured logging, no secrets or PII in log output |
| Error handling | Generic error messages to users, detailed logs server-side |
| CORS | Restrictive origins, no `AllowAnyOrigin()` in production |

**Remember**: ASP.NET Core provides strong security defaults, but they must be configured correctly. Use `[ApiController]` for automatic model validation, EF Core LINQ for safe queries, Razor auto-encoding for XSS protection, and the built-in rate limiter for abuse prevention. Defense in depth — never rely on a single layer.
