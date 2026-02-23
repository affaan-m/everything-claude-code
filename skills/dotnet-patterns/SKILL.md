---
name: dotnet-patterns
description: .NET 8+ patterns — Minimal APIs, controllers, dependency injection, async/await, Entity Framework Core, error handling, configuration, testing, and performance optimization with C#.
---

# .NET Development Patterns

Production-grade .NET 8+ patterns for scalable, maintainable C# applications.

## When to Activate

- Building .NET APIs (Minimal APIs or Controller-based)
- Configuring dependency injection (Singleton, Scoped, Transient)
- Writing async/await code with proper cancellation
- Working with Entity Framework Core (DbContext, migrations, LINQ)
- Implementing error handling with Result pattern or ProblemDetails
- Managing configuration and secrets
- Writing tests with xUnit and WebApplicationFactory
- Optimizing performance (Span, pooling, caching)

## Core Principles

1. **Minimal API first** — use Minimal APIs for new projects, controllers for large APIs
2. **Async all the way** — never block on async code (`.Result`, `.Wait()`)
3. **CancellationToken everywhere** — pass through to all async operations
4. **Scoped by default** — use Scoped lifetime for request-level services
5. **Options pattern** — use `IOptions<T>` for typed configuration

## Minimal APIs

### Basic Setup

```csharp
var builder = WebApplication.CreateBuilder(args);

// Services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Endpoints
app.MapGet("/api/users", async (IUserService service, CancellationToken ct) =>
{
    var users = await service.GetAllAsync(ct);
    return Results.Ok(users);
});

app.MapGet("/api/users/{id:guid}", async (Guid id, IUserService service, CancellationToken ct) =>
{
    var user = await service.GetByIdAsync(id, ct);
    return user is not null ? Results.Ok(user) : Results.NotFound();
});

app.MapPost("/api/users", async (CreateUserRequest request, IUserService service, CancellationToken ct) =>
{
    var result = await service.CreateAsync(request, ct);
    return result.Match(
        user => Results.Created($"/api/users/{user.Id}", user),
        errors => Results.ValidationProblem(errors)
    );
});

app.Run();
```

### Route Groups

```csharp
var users = app.MapGroup("/api/users")
    .RequireAuthorization()
    .WithTags("Users");

users.MapGet("/", GetUsers);
users.MapGet("/{id:guid}", GetUser);
users.MapPost("/", CreateUser);
users.MapPut("/{id:guid}", UpdateUser);
users.MapDelete("/{id:guid}", DeleteUser);
```

## Controller-Based APIs

```csharp
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _service;

    public UsersController(IUserService service) => _service = service;

    [HttpGet]
    public async Task<ActionResult<PagedResult<UserDto>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var result = await _service.GetAllAsync(page, pageSize, ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UserDto>> GetById(Guid id, CancellationToken ct)
    {
        var user = await _service.GetByIdAsync(id, ct);
        return user is not null ? Ok(user) : NotFound();
    }

    [HttpPost]
    public async Task<ActionResult<UserDto>> Create(CreateUserRequest request, CancellationToken ct)
    {
        var result = await _service.CreateAsync(request, ct);
        return result.Match<ActionResult<UserDto>>(
            user => CreatedAtAction(nameof(GetById), new { id = user.Id }, user),
            errors => ValidationProblem(new ValidationProblemDetails(errors))
        );
    }
}
```

## Dependency Injection

### Service Registration

```csharp
// Lifetimes
builder.Services.AddSingleton<ICacheService, RedisCacheService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddTransient<IEmailSender, SmtpEmailSender>();

// Keyed services (.NET 8+)
builder.Services.AddKeyedSingleton<INotifier, EmailNotifier>("email");
builder.Services.AddKeyedSingleton<INotifier, SmsNotifier>("sms");

// Usage with keyed services
public class OrderService([FromKeyedServices("email")] INotifier notifier) { }

// Options pattern
builder.Services.Configure<SmtpOptions>(builder.Configuration.GetSection("Smtp"));

public class EmailSender(IOptions<SmtpOptions> options)
{
    private readonly SmtpOptions _smtp = options.Value;
}
```

### Interface Segregation

```csharp
public interface IUserReader
{
    Task<User?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<PagedResult<User>> GetAllAsync(int page, int pageSize, CancellationToken ct);
}

public interface IUserWriter
{
    Task<Result<User>> CreateAsync(CreateUserRequest request, CancellationToken ct);
    Task<Result<User>> UpdateAsync(Guid id, UpdateUserRequest request, CancellationToken ct);
}

public interface IUserService : IUserReader, IUserWriter { }

// Register once, resolve by any interface
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<IUserService>(sp => sp.GetRequiredService<UserService>());
builder.Services.AddScoped<IUserReader>(sp => sp.GetRequiredService<UserService>());
```

## Async/Await Patterns

### Proper Cancellation

```csharp
public class OrderService(AppDbContext db, IPaymentClient payments)
{
    public async Task<Order> ProcessAsync(Guid orderId, CancellationToken ct)
    {
        var order = await db.Orders.FindAsync([orderId], ct)
            ?? throw new NotFoundException($"Order {orderId} not found");

        var payment = await payments.ChargeAsync(order.Total, ct);

        order.Status = OrderStatus.Paid;
        order.PaymentId = payment.Id;
        await db.SaveChangesAsync(ct);

        return order;
    }
}

// ValueTask for hot paths
public ValueTask<User?> GetCachedUserAsync(Guid id, CancellationToken ct)
{
    if (_cache.TryGetValue(id, out var user))
        return ValueTask.FromResult<User?>(user);

    return new ValueTask<User?>(LoadUserAsync(id, ct));
}

// IAsyncEnumerable for streaming
public async IAsyncEnumerable<LogEntry> StreamLogsAsync(
    [EnumeratorCancellation] CancellationToken ct)
{
    await foreach (var entry in db.Logs.AsAsyncEnumerable().WithCancellation(ct))
    {
        yield return entry;
    }
}
```

## Entity Framework Core

### DbContext and Entities

```csharp
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Order> Orders => Set<Order>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.Email).HasMaxLength(255);
            entity.Property(u => u.Name).HasMaxLength(100);
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasOne(o => o.User)
                .WithMany(u => u.Orders)
                .HasForeignKey(o => o.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(o => new { o.UserId, o.CreatedAt });
        });
    }
}
```

### Repository Pattern

```csharp
public class UserRepository(AppDbContext db) : IUserReader, IUserWriter
{
    public async Task<User?> GetByIdAsync(Guid id, CancellationToken ct)
        => await db.Users.FindAsync([id], ct);

    public async Task<PagedResult<User>> GetAllAsync(int page, int pageSize, CancellationToken ct)
    {
        var query = db.Users.OrderByDescending(u => u.CreatedAt);
        var total = await query.CountAsync(ct);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        return new PagedResult<User>(items, total, page, pageSize);
    }

    public async Task<Result<User>> CreateAsync(CreateUserRequest request, CancellationToken ct)
    {
        if (await db.Users.AnyAsync(u => u.Email == request.Email, ct))
            return Result<User>.Fail("Email already registered");

        var user = new User { Email = request.Email, Name = request.Name };
        db.Users.Add(user);
        await db.SaveChangesAsync(ct);
        return Result<User>.Ok(user);
    }
}
```

## Error Handling

### Result Pattern

```csharp
public readonly record struct Result<T>
{
    public T? Value { get; }
    public string? Error { get; }
    public bool IsSuccess { get; }

    private Result(T value) { Value = value; IsSuccess = true; }
    private Result(string error) { Error = error; IsSuccess = false; }

    public static Result<T> Ok(T value) => new(value);
    public static Result<T> Fail(string error) => new(error);

    public TResult Match<TResult>(Func<T, TResult> onSuccess, Func<string, TResult> onError)
        => IsSuccess ? onSuccess(Value!) : onError(Error!);
}
```

### ProblemDetails Middleware

```csharp
builder.Services.AddProblemDetails(options =>
{
    options.CustomizeProblemDetails = ctx =>
    {
        ctx.ProblemDetails.Extensions["traceId"] = ctx.HttpContext.TraceIdentifier;
    };
});

app.UseExceptionHandler();
app.UseStatusCodePages();
```

## Configuration

### Layered Configuration

```csharp
builder.Configuration
    .AddJsonFile("appsettings.json")
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true)
    .AddEnvironmentVariables()
    .AddUserSecrets<Program>(optional: true);

// Strongly typed options with validation
public record SmtpOptions
{
    public required string Host { get; init; }
    public int Port { get; init; } = 587;
    public required string Username { get; init; }
    public required string Password { get; init; }
}

builder.Services.AddOptions<SmtpOptions>()
    .BindConfiguration("Smtp")
    .ValidateDataAnnotations()
    .ValidateOnStart();
```

## Testing

### Unit Tests (xUnit)

```csharp
public class UserServiceTests
{
    private readonly Mock<IUserRepository> _repo = new();
    private readonly UserService _sut;

    public UserServiceTests() => _sut = new UserService(_repo.Object);

    [Fact]
    public async Task CreateAsync_WithValidInput_ReturnsUser()
    {
        var request = new CreateUserRequest("test@test.com", "Test");
        _repo.Setup(r => r.CreateAsync(request, default))
            .ReturnsAsync(Result<User>.Ok(new User { Email = request.Email }));

        var result = await _sut.CreateAsync(request, CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal("test@test.com", result.Value!.Email);
    }

    [Fact]
    public async Task CreateAsync_WithDuplicateEmail_ReturnsFail()
    {
        _repo.Setup(r => r.CreateAsync(It.IsAny<CreateUserRequest>(), default))
            .ReturnsAsync(Result<User>.Fail("Email already registered"));

        var result = await _sut.CreateAsync(new("dup@test.com", "Dup"), CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Contains("Email already registered", result.Error);
    }
}
```

### Integration Tests (WebApplicationFactory)

```csharp
public class UsersApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public UsersApiTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                services.RemoveAll<DbContextOptions<AppDbContext>>();
                services.AddDbContext<AppDbContext>(o => o.UseInMemoryDatabase("TestDb"));
            });
        }).CreateClient();
    }

    [Fact]
    public async Task GetUsers_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/users");
        response.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task CreateUser_WithInvalidEmail_ReturnsBadRequest()
    {
        var response = await _client.PostAsJsonAsync("/api/users", new { Email = "invalid", Name = "Test" });
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
```

## Performance

### Span and Object Pooling

```csharp
// Zero-allocation parsing with Span<T>
public static bool TryParseId(ReadOnlySpan<char> input, out Guid id)
{
    return Guid.TryParse(input.Trim(), out id);
}

// Object pooling for expensive objects
builder.Services.AddSingleton(ObjectPool.Create<StringBuilder>());

public class ReportService(ObjectPool<StringBuilder> pool)
{
    public string GenerateReport(IEnumerable<ReportLine> lines)
    {
        var sb = pool.Get();
        try
        {
            foreach (var line in lines)
                sb.AppendLine($"{line.Label}: {line.Value}");
            return sb.ToString();
        }
        finally
        {
            pool.Return(sb);
        }
    }
}
```

### Output Caching (.NET 8+)

```csharp
builder.Services.AddOutputCache(options =>
{
    options.AddBasePolicy(b => b.Expire(TimeSpan.FromMinutes(5)));
    options.AddPolicy("Users", b => b.Expire(TimeSpan.FromMinutes(1)).Tag("users"));
});

app.UseOutputCache();

app.MapGet("/api/users", async (IUserService service, CancellationToken ct) =>
{
    return await service.GetAllAsync(ct);
}).CacheOutput("Users");

// Invalidate
app.MapPost("/api/users", async (IOutputCacheStore cache, IUserService service, CreateUserRequest req, CancellationToken ct) =>
{
    var result = await service.CreateAsync(req, ct);
    await cache.EvictByTagAsync("users", default);
    return Results.Created($"/api/users/{result.Value!.Id}", result.Value);
});
```

## .NET Checklist

Before deploying to production:

- [ ] All async methods accept and pass `CancellationToken`
- [ ] `ValueTask` used for hot paths that often complete synchronously
- [ ] DI lifetimes correct (Scoped for request-level, Singleton for shared)
- [ ] `IOptions<T>` with validation for all configuration sections
- [ ] EF Core queries use `AsNoTracking()` for read-only operations
- [ ] Database indexes on frequently queried columns and foreign keys
- [ ] Global exception handler returns `ProblemDetails` format
- [ ] Result pattern used instead of throwing for expected failures
- [ ] Integration tests use `WebApplicationFactory` with test database
- [ ] Migrations generated as idempotent SQL scripts for production
- [ ] Output caching configured with proper invalidation
- [ ] Health checks registered for database and external dependencies
- [ ] Secrets in User Secrets (dev) or Key Vault (prod), never in appsettings
