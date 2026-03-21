---
name: aspnet-core-patterns
description: Deep ASP.NET Core patterns covering authentication, authorization, rate limiting, health checks, OpenAPI, SignalR, API versioning, output caching, and advanced middleware.
origin: ECC
---

# ASP.NET Core Patterns

Deep patterns for building production-grade ASP.NET Core APIs and services. Complements the general patterns in `skills/csharp-patterns/` with framework-specific depth.

## When to Use

- Designing ASP.NET Core APIs (minimal or controller-based)
- Implementing authentication and authorization
- Adding cross-cutting concerns (rate limiting, caching, health checks)
- Configuring middleware pipelines
- Building real-time features with SignalR

## Authentication and Authorization

### JWT Bearer Authentication

```csharp
// Program.cs — JWT setup
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
```

### Policy-Based Authorization

```csharp
builder.Services.AddAuthorizationBuilder()
    .AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"))
    .AddPolicy("PremiumUser", policy =>
        policy.RequireAssertion(ctx =>
            ctx.User.HasClaim("subscription", "premium") ||
            ctx.User.IsInRole("Admin")))
    .AddPolicy("MinAge18", policy =>
        policy.Requirements.Add(new MinimumAgeRequirement(18)));

// Custom requirement + handler
public sealed class MinimumAgeRequirement(int age) : IAuthorizationRequirement
{
    public int MinimumAge { get; } = age;
}

public sealed class MinimumAgeHandler : AuthorizationHandler<MinimumAgeRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        MinimumAgeRequirement requirement)
    {
        var birthDateClaim = context.User.FindFirst("birth_date");
        if (birthDateClaim is null) return Task.CompletedTask;

        var birthDate = DateOnly.Parse(birthDateClaim.Value);
        var age = DateOnly.FromDateTime(DateTime.UtcNow).Year - birthDate.Year;

        if (age >= requirement.MinimumAge)
            context.Succeed(requirement);

        return Task.CompletedTask;
    }
}

builder.Services.AddSingleton<IAuthorizationHandler, MinimumAgeHandler>();
```

### Resource-Based Authorization

```csharp
public sealed class OrderOwnerHandler
    : AuthorizationHandler<OrderOwnerRequirement, Order>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        OrderOwnerRequirement requirement,
        Order order)
    {
        var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId is not null && order.CustomerId.ToString() == userId)
            context.Succeed(requirement);

        return Task.CompletedTask;
    }
}

// Usage in endpoint
app.MapPut("/api/orders/{id:guid}", async (
    Guid id,
    UpdateOrderRequest request,
    IOrderRepository repository,
    IAuthorizationService authService,
    ClaimsPrincipal user,
    CancellationToken cancellationToken) =>
{
    var order = await repository.FindByIdAsync(id, cancellationToken);
    if (order is null) return TypedResults.NotFound();

    var authResult = await authService.AuthorizeAsync(user, order, new OrderOwnerRequirement());
    if (!authResult.Succeeded) return TypedResults.Forbid();

    var updated = await repository.UpdateAsync(order.Apply(request), cancellationToken);
    return TypedResults.Ok(updated);
});
```

## Rate Limiting

```csharp
// Fixed window rate limiter
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("api", limiter =>
    {
        limiter.PermitLimit = 100;
        limiter.Window = TimeSpan.FromMinutes(1);
        limiter.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        limiter.QueueLimit = 10;
    });

    // Per-user sliding window
    options.AddSlidingWindowLimiter("per-user", limiter =>
    {
        limiter.PermitLimit = 50;
        limiter.Window = TimeSpan.FromMinutes(1);
        limiter.SegmentsPerWindow = 6;
    });

    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.OnRejected = async (context, cancellationToken) =>
    {
        context.HttpContext.Response.Headers.RetryAfter = "60";
        await context.HttpContext.Response.WriteAsJsonAsync(
            new { error = "Rate limit exceeded. Try again later." },
            cancellationToken);
    };
});

app.UseRateLimiter();

// Apply to endpoints
app.MapGet("/api/data", Handler).RequireRateLimiting("api");
app.MapGroup("/api/user").RequireRateLimiting("per-user");
```

## Health Checks

```csharp
builder.Services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>("database")
    .AddRedis(builder.Configuration.GetConnectionString("Redis")!, "redis")
    .AddUrlGroup(new Uri("https://external-api.example.com/health"), "external-api",
        timeout: TimeSpan.FromSeconds(5))
    .AddCheck<DiskSpaceHealthCheck>("disk-space");

// Custom health check
public sealed class DiskSpaceHealthCheck : IHealthCheck
{
    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken)
    {
        var drive = new DriveInfo(Path.GetPathRoot(Environment.CurrentDirectory)!);
        var freeSpacePercent = (double)drive.AvailableFreeSpace / drive.TotalSize * 100;

        return Task.FromResult(freeSpacePercent switch
        {
            < 5 => HealthCheckResult.Unhealthy($"Disk space critically low: {freeSpacePercent:F1}%"),
            < 15 => HealthCheckResult.Degraded($"Disk space low: {freeSpacePercent:F1}%"),
            _ => HealthCheckResult.Healthy($"Disk space: {freeSpacePercent:F1}% free")
        });
    }
}

// Map health check endpoints
app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});
app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")
});
app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = _ => false // always returns healthy if app is running
});
```

## Output Caching

```csharp
builder.Services.AddOutputCache(options =>
{
    options.AddBasePolicy(builder => builder.Expire(TimeSpan.FromMinutes(5)));

    options.AddPolicy("products", builder =>
        builder.Expire(TimeSpan.FromMinutes(30))
            .Tag("products")
            .SetVaryByQuery("category", "page"));

    options.AddPolicy("user-specific", builder =>
        builder.Expire(TimeSpan.FromMinutes(10))
            .SetVaryByHeader("Authorization"));
});

app.UseOutputCache();

// Apply to endpoints
app.MapGet("/api/products", GetProducts).CacheOutput("products");

// Invalidate cache by tag
app.MapPost("/api/products", async (
    CreateProductRequest request,
    IOutputCacheStore cache,
    CancellationToken cancellationToken) =>
{
    // save product...
    await cache.EvictByTagAsync("products", cancellationToken);
    return TypedResults.Created($"/api/products/{product.Id}", product);
});
```

## OpenAPI / Swagger

```csharp
builder.Services.AddOpenApi();

// Endpoint metadata
app.MapGet("/api/orders/{id:guid}", async (Guid id, IOrderRepository repo, CancellationToken ct) =>
{
    var order = await repo.FindByIdAsync(id, ct);
    return order is not null ? TypedResults.Ok(order) : TypedResults.NotFound();
})
.WithName("GetOrderById")
.WithDescription("Retrieves an order by its unique identifier")
.WithTags("Orders")
.Produces<OrderDto>(StatusCodes.Status200OK)
.Produces(StatusCodes.Status404NotFound)
.RequireAuthorization();

app.MapOpenApi();
```

## CORS Configuration

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "https://app.example.com",
                "https://staging.example.com")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
            .SetPreflightMaxAge(TimeSpan.FromMinutes(10));
    });
});

app.UseCors("AllowFrontend");
```

## Advanced Middleware

### Correlation ID Middleware

```csharp
public sealed class CorrelationIdMiddleware(RequestDelegate next)
{
    private const string HeaderName = "X-Correlation-Id";

    public async Task InvokeAsync(HttpContext context)
    {
        var correlationId = context.Request.Headers[HeaderName].FirstOrDefault()
            ?? Guid.NewGuid().ToString("N");

        context.Items["CorrelationId"] = correlationId;
        context.Response.Headers[HeaderName] = correlationId;

        using (LogContext.PushProperty("CorrelationId", correlationId))
        {
            await next(context);
        }
    }
}
```

### Request/Response Logging Middleware

```csharp
public sealed class RequestLoggingMiddleware(
    RequestDelegate next,
    ILogger<RequestLoggingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        var requestPath = context.Request.Path;
        var method = context.Request.Method;

        try
        {
            await next(context);
            stopwatch.Stop();

            logger.LogInformation(
                "{Method} {Path} responded {StatusCode} in {ElapsedMs}ms",
                method, requestPath, context.Response.StatusCode,
                stopwatch.ElapsedMilliseconds);
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            logger.LogError(ex,
                "{Method} {Path} failed after {ElapsedMs}ms",
                method, requestPath, stopwatch.ElapsedMilliseconds);
            throw;
        }
    }
}
```

### Idempotency Middleware

```csharp
public sealed class IdempotencyMiddleware(
    RequestDelegate next,
    IDistributedCache cache)
{
    private const string HeaderName = "Idempotency-Key";

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Method is not ("POST" or "PUT" or "PATCH"))
        {
            await next(context);
            return;
        }

        var idempotencyKey = context.Request.Headers[HeaderName].FirstOrDefault();
        if (string.IsNullOrWhiteSpace(idempotencyKey))
        {
            await next(context);
            return;
        }

        var cacheKey = $"idempotency:{idempotencyKey}";
        var cachedResponse = await cache.GetStringAsync(cacheKey);

        if (cachedResponse is not null)
        {
            context.Response.StatusCode = StatusCodes.Status200OK;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(cachedResponse);
            return;
        }

        var originalBody = context.Response.Body;
        using var memoryStream = new MemoryStream();
        context.Response.Body = memoryStream;

        await next(context);

        memoryStream.Seek(0, SeekOrigin.Begin);
        var responseBody = await new StreamReader(memoryStream).ReadToEndAsync();

        if (context.Response.StatusCode is >= 200 and < 300)
        {
            await cache.SetStringAsync(cacheKey, responseBody,
                new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(24)
                });
        }

        memoryStream.Seek(0, SeekOrigin.Begin);
        await memoryStream.CopyToAsync(originalBody);
    }
}
```

## SignalR (Real-Time)

```csharp
// Hub definition
public sealed class NotificationHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId is not null)
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user:{userId}");
        await base.OnConnectedAsync();
    }

    public async Task SendToGroup(string group, string message)
    {
        await Clients.Group(group).SendAsync("ReceiveMessage", message);
    }
}

// Registration
builder.Services.AddSignalR();
app.MapHub<NotificationHub>("/hubs/notifications").RequireAuthorization();

// Server-side push from a service
public sealed class OrderNotificationService(IHubContext<NotificationHub> hubContext)
{
    public async Task NotifyOrderStatusAsync(
        Guid customerId, Guid orderId, string status, CancellationToken cancellationToken)
    {
        await hubContext.Clients.Group($"user:{customerId}").SendAsync(
            "OrderStatusChanged",
            new { orderId, status },
            cancellationToken);
    }
}
```

## API Versioning

```csharp
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
    options.ApiVersionReader = ApiVersionReader.Combine(
        new UrlSegmentApiVersionReader(),
        new HeaderApiVersionReader("X-Api-Version"));
});

var v1 = app.NewApiVersionSet().HasApiVersion(new ApiVersion(1, 0)).Build();
var v2 = app.NewApiVersionSet().HasApiVersion(new ApiVersion(2, 0)).Build();

app.MapGet("/api/v{version:apiVersion}/orders", GetOrdersV1)
    .WithApiVersionSet(v1);

app.MapGet("/api/v{version:apiVersion}/orders", GetOrdersV2)
    .WithApiVersionSet(v2);
```

## Problem Details (RFC 9457)

```csharp
builder.Services.AddProblemDetails(options =>
{
    options.CustomizeProblemDetails = context =>
    {
        context.ProblemDetails.Instance = context.HttpContext.Request.Path;
        context.ProblemDetails.Extensions["traceId"] =
            Activity.Current?.Id ?? context.HttpContext.TraceIdentifier;
    };
});

// Usage in exception handler
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

public sealed class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        logger.LogError(exception, "Unhandled exception");

        var problemDetails = exception switch
        {
            DomainException de => new ProblemDetails
            {
                Status = de.StatusCode,
                Title = de.GetType().Name,
                Detail = de.Message,
                Type = $"https://docs.example.com/errors/{de.GetType().Name}"
            },
            _ => new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal Server Error",
                Detail = "An unexpected error occurred"
            }
        };

        httpContext.Response.StatusCode = problemDetails.Status!.Value;
        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);
        return true;
    }
}
```

## Middleware Pipeline Order

The correct ordering of middleware in `Program.cs`:

```csharp
var app = builder.Build();

// 1. Exception handling (outermost — catches everything)
app.UseExceptionHandler();

// 2. HSTS (HTTPS Strict Transport Security)
if (!app.Environment.IsDevelopment())
    app.UseHsts();

// 3. HTTPS redirection
app.UseHttpsRedirection();

// 4. Static files (short-circuits for static assets)
app.UseStaticFiles();

// 5. Routing (determines which endpoint matches)
app.UseRouting();

// 6. CORS (must be between routing and auth)
app.UseCors();

// 7. Rate limiting
app.UseRateLimiter();

// 8. Authentication (who are you?)
app.UseAuthentication();

// 9. Authorization (what can you do?)
app.UseAuthorization();

// 10. Output caching
app.UseOutputCache();

// 11. Custom middleware
app.UseMiddleware<CorrelationIdMiddleware>();
app.UseMiddleware<RequestLoggingMiddleware>();

// 12. Endpoints
app.MapControllers();
app.MapHealthChecks("/health");
```

## Anti-Patterns

| Anti-Pattern | Why | Better Approach |
|--------------|-----|-----------------|
| Auth logic in endpoints | Scattered, easy to miss | Policies + `[Authorize]` |
| Hardcoded CORS origins | Breaks across environments | Configuration-driven |
| No rate limiting | DoS vulnerability | `AddRateLimiter` |
| `app.UseDeveloperExceptionPage()` in prod | Leaks stack traces | `UseExceptionHandler` |
| Missing health checks | Silent failures | `AddHealthChecks` |
| Synchronous middleware I/O | Blocks thread pool | Always `async Task InvokeAsync` |
| Global `[AllowAnonymous]` | Security bypass | Explicit per-endpoint |

## References

- Skill: `skills/csharp-patterns/`
- Skill: `skills/csharp-testing/`
- Agent: `agents/csharp-reviewer.md`
- Rules: `rules/csharp/security.md`
