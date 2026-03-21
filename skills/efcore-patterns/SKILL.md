---
name: efcore-patterns
description: Deep Entity Framework Core patterns covering query optimization, relationship configuration, concurrency, migrations, interceptors, global filters, value converters, and bulk operations.
origin: ECC
---

# Entity Framework Core Patterns

Deep EF Core patterns for building efficient, correct, and maintainable data access layers. Complements the general patterns in `skills/csharp-patterns/` with ORM-specific depth.

## When to Use

- Designing EF Core data models and relationships
- Optimizing query performance (N+1, tracking, split queries)
- Implementing concurrency control
- Writing and managing migrations
- Adding interceptors, filters, or value converters

## Relationship Configuration

### One-to-Many

```csharp
public sealed class Customer
{
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public IReadOnlyList<Order> Orders { get; init; } = [];
}

public sealed class Order
{
    public Guid Id { get; init; }
    public Guid CustomerId { get; init; }
    public Customer Customer { get; init; } = null!;
}

// Fluent configuration
modelBuilder.Entity<Order>(entity =>
{
    entity.HasOne(o => o.Customer)
        .WithMany(c => c.Orders)
        .HasForeignKey(o => o.CustomerId)
        .OnDelete(DeleteBehavior.Cascade);
});
```

### Many-to-Many

```csharp
public sealed class Article
{
    public Guid Id { get; init; }
    public required string Title { get; init; }
    public IReadOnlyList<Tag> Tags { get; init; } = [];
}

public sealed class Tag
{
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public IReadOnlyList<Article> Articles { get; init; } = [];
}

// EF Core 7+ skip navigations (no join entity needed)
modelBuilder.Entity<Article>()
    .HasMany(a => a.Tags)
    .WithMany(t => t.Articles)
    .UsingEntity(j => j.ToTable("ArticleTags"));
```

### Owned Types (Value Objects)

```csharp
public sealed record Address(
    string Street,
    string City,
    string PostalCode,
    string Country);

public sealed class Customer
{
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public Address ShippingAddress { get; init; } = null!;
    public Address? BillingAddress { get; init; }
}

modelBuilder.Entity<Customer>(entity =>
{
    entity.OwnsOne(c => c.ShippingAddress, address =>
    {
        address.Property(a => a.Street).HasMaxLength(200);
        address.Property(a => a.PostalCode).HasMaxLength(20);
    });
    entity.OwnsOne(c => c.BillingAddress);
});
```

## Query Optimization

### Avoiding N+1

```csharp
// BAD: N+1 — loads orders, then queries lines for each order
var orders = await context.Orders.ToListAsync(ct);
foreach (var order in orders)
{
    var lines = order.Lines; // triggers lazy load per order
}

// GOOD: Eager loading with Include
var orders = await context.Orders
    .Include(o => o.Lines)
    .AsNoTracking()
    .ToListAsync(ct);

// GOOD: Projection — only loads what you need
var summaries = await context.Orders
    .Select(o => new OrderSummaryDto(
        o.Id,
        o.CreatedAt,
        o.Lines.Count,
        o.Lines.Sum(l => l.Quantity * l.UnitPrice)))
    .ToListAsync(ct);
```

### Split Queries

```csharp
// When Include causes cartesian explosion
var customers = await context.Customers
    .Include(c => c.Orders)
        .ThenInclude(o => o.Lines)
    .Include(c => c.Addresses)
    .AsSplitQuery() // separate SQL per Include
    .AsNoTracking()
    .ToListAsync(ct);

// Global default (use cautiously)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString,
        npgsql => npgsql.UseQuerySplittingBehavior(
            QuerySplittingBehavior.SplitQuery)));
```

### No-Tracking Queries

```csharp
// Read-only queries — skip change tracker for performance
var products = await context.Products
    .AsNoTracking()
    .Where(p => p.IsActive)
    .ToListAsync(ct);

// Global default for read-heavy services
builder.Services.AddDbContext<ReadOnlyDbContext>(options =>
    options.UseNpgsql(connectionString)
        .UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking));
```

### Compiled Queries

```csharp
// Pre-compile hot-path queries
private static readonly Func<AppDbContext, Guid, CancellationToken, Task<Order?>>
    FindOrderById = EF.CompileAsyncQuery(
        (AppDbContext ctx, Guid id, CancellationToken ct) =>
            ctx.Orders
                .Include(o => o.Lines)
                .FirstOrDefault(o => o.Id == id));

// Usage
var order = await FindOrderById(context, orderId, ct);
```

### Query Tags

```csharp
// Tag queries for identification in logs and query plans
var orders = await context.Orders
    .TagWith("GetRecentOrders — OrderService.GetRecentAsync")
    .Where(o => o.CreatedAt > cutoff)
    .ToListAsync(ct);
```

## Value Converters

```csharp
// Store enum as string
modelBuilder.Entity<Order>()
    .Property(o => o.Status)
    .HasConversion<string>()
    .HasMaxLength(50);

// Custom converter for strongly-typed IDs
public readonly record struct OrderId(Guid Value);

modelBuilder.Entity<Order>()
    .Property(o => o.Id)
    .HasConversion(
        id => id.Value,
        value => new OrderId(value));

// JSON column (EF Core 7+)
modelBuilder.Entity<Order>()
    .OwnsOne(o => o.Metadata, metadata =>
    {
        metadata.ToJson();
    });

// Encrypted value converter
public sealed class EncryptedStringConverter(IDataProtector protector)
    : ValueConverter<string, string>(
        v => protector.Protect(v),
        v => protector.Unprotect(v));
```

## Concurrency Control

### Optimistic Concurrency with RowVersion

```csharp
public sealed class Order
{
    public Guid Id { get; init; }
    public required string Status { get; set; }

    [Timestamp]
    public byte[] RowVersion { get; set; } = null!;
}

// Handling concurrency conflicts
public async Task UpdateOrderStatusAsync(
    Guid orderId, string newStatus, CancellationToken ct)
{
    var order = await context.Orders.FindAsync([orderId], ct)
        ?? throw new OrderNotFoundException(orderId);

    order.Status = newStatus;

    try
    {
        await context.SaveChangesAsync(ct);
    }
    catch (DbUpdateConcurrencyException ex)
    {
        var entry = ex.Entries.Single();
        var databaseValues = await entry.GetDatabaseValuesAsync(ct);

        if (databaseValues is null)
            throw new OrderNotFoundException(orderId);

        // Option 1: Client wins — overwrite
        entry.OriginalValues.SetValues(databaseValues);
        await context.SaveChangesAsync(ct);

        // Option 2: Database wins — reload
        // await entry.ReloadAsync(ct);

        // Option 3: Merge — application-specific logic
    }
}
```

## Global Query Filters

### Soft Delete

```csharp
public interface ISoftDeletable
{
    bool IsDeleted { get; }
    DateTimeOffset? DeletedAt { get; }
}

public sealed class Order : ISoftDeletable
{
    public Guid Id { get; init; }
    public bool IsDeleted { get; private set; }
    public DateTimeOffset? DeletedAt { get; private set; }

    public void SoftDelete()
    {
        IsDeleted = true;
        DeletedAt = DateTimeOffset.UtcNow;
    }
}

// Apply filter globally
modelBuilder.Entity<Order>().HasQueryFilter(o => !o.IsDeleted);

// Bypass filter when needed
var allOrders = await context.Orders
    .IgnoreQueryFilters()
    .ToListAsync(ct);
```

### Multi-Tenancy

```csharp
public interface ITenantEntity
{
    Guid TenantId { get; }
}

public sealed class TenantDbContext(
    DbContextOptions<TenantDbContext> options,
    ITenantProvider tenantProvider) : DbContext(options)
{
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Order>()
            .HasQueryFilter(o => o.TenantId == tenantProvider.TenantId);

        modelBuilder.Entity<Product>()
            .HasQueryFilter(p => p.TenantId == tenantProvider.TenantId);
    }
}
```

## Interceptors

### Audit Interceptor

```csharp
public interface IAuditable
{
    DateTimeOffset CreatedAt { get; set; }
    DateTimeOffset UpdatedAt { get; set; }
    string? CreatedBy { get; set; }
    string? UpdatedBy { get; set; }
}

public sealed class AuditInterceptor(IHttpContextAccessor httpContextAccessor)
    : SaveChangesInterceptor
{
    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken)
    {
        var context = eventData.Context;
        if (context is null) return ValueTask.FromResult(result);

        var userId = httpContextAccessor.HttpContext?.User
            .FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var now = DateTimeOffset.UtcNow;

        foreach (var entry in context.ChangeTracker.Entries<IAuditable>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = now;
                    entry.Entity.UpdatedAt = now;
                    entry.Entity.CreatedBy = userId;
                    entry.Entity.UpdatedBy = userId;
                    break;

                case EntityState.Modified:
                    entry.Entity.UpdatedAt = now;
                    entry.Entity.UpdatedBy = userId;
                    break;
            }
        }

        return ValueTask.FromResult(result);
    }
}

// Registration
builder.Services.AddDbContext<AppDbContext>((sp, options) =>
    options.UseNpgsql(connectionString)
        .AddInterceptors(sp.GetRequiredService<AuditInterceptor>()));
```

### Slow Query Interceptor

```csharp
public sealed class SlowQueryInterceptor(ILogger<SlowQueryInterceptor> logger)
    : DbCommandInterceptor
{
    private const int SlowQueryThresholdMs = 500;

    public override ValueTask<DbDataReader> ReaderExecutedAsync(
        DbCommand command,
        CommandExecutedEventData eventData,
        DbDataReader result,
        CancellationToken cancellationToken)
    {
        if (eventData.Duration.TotalMilliseconds > SlowQueryThresholdMs)
        {
            logger.LogWarning(
                "Slow query detected ({ElapsedMs}ms): {CommandText}",
                eventData.Duration.TotalMilliseconds,
                command.CommandText);
        }

        return ValueTask.FromResult(result);
    }
}
```

## Migrations

### Best Practices

```bash
# Create migration
dotnet ef migrations add AddOrderStatus --project src/MyApp.Data

# Apply migrations
dotnet ef database update

# Generate SQL script (for review before production)
dotnet ef migrations script --idempotent -o migrations.sql

# Remove last migration (if not applied)
dotnet ef migrations remove
```

### Safe Migration Patterns

```csharp
// Good: Add nullable column first, backfill, then make required
// Migration 1: Add column as nullable
migrationBuilder.AddColumn<string>(
    name: "Status",
    table: "Orders",
    nullable: true);

// Migration 2: Backfill data
migrationBuilder.Sql("UPDATE \"Orders\" SET \"Status\" = 'Active' WHERE \"Status\" IS NULL");

// Migration 3: Make column required
migrationBuilder.AlterColumn<string>(
    name: "Status",
    table: "Orders",
    nullable: false,
    defaultValue: "Active");

// Good: Create index concurrently (PostgreSQL)
migrationBuilder.Sql(
    "CREATE INDEX CONCURRENTLY \"IX_Orders_CustomerId\" ON \"Orders\" (\"CustomerId\")",
    suppressTransaction: true);
```

### Automatic Migration at Startup (Development Only)

```csharp
if (app.Environment.IsDevelopment())
{
    await using var scope = app.Services.CreateAsyncScope();
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await context.Database.MigrateAsync();
}
```

## Bulk Operations

```csharp
// EF Core 7+ ExecuteUpdate (no loading into memory)
await context.Products
    .Where(p => p.Category == "Electronics" && !p.IsActive)
    .ExecuteUpdateAsync(setters => setters
        .SetProperty(p => p.IsActive, true)
        .SetProperty(p => p.UpdatedAt, DateTimeOffset.UtcNow),
    ct);

// EF Core 7+ ExecuteDelete
await context.AuditLogs
    .Where(l => l.CreatedAt < cutoffDate)
    .ExecuteDeleteAsync(ct);
```

## Anti-Patterns

| Anti-Pattern | Why | Better Approach |
|--------------|-----|-----------------|
| Lazy loading without awareness | N+1 queries | Eager load or project |
| `ToList()` before `Where()` | Loads entire table | Filter in SQL first |
| Tracking in read-only scenarios | Memory and CPU waste | `AsNoTracking()` |
| Calling `SaveChanges` in a loop | N round-trips | Batch then save once |
| `Find()` in a loop | N+1 | `Where(x => ids.Contains(x.Id))` |
| Missing index on FK columns | Slow joins | Add migration with index |
| `DbContext` as singleton | Thread-safety violation | Scoped lifetime |
| Raw SQL with string concat | SQL injection | `FromSqlInterpolated` |
| Migrating in production startup | Deployment risk | Apply via CI/CD script |

## References

- Skill: `skills/csharp-patterns/`
- Skill: `skills/csharp-testing/`
- Agent: `agents/csharp-reviewer.md`
- Rules: `rules/csharp/patterns.md`
