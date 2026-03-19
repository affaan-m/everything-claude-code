---
name: csharp-data-access
description: EF Core and Dapper data access patterns for .NET 8+ including DbContext lifecycle, relationships, migrations, query optimization, transactions, and repository pattern.
origin: ECC
---

# C# Data Access Patterns

EF Core and Dapper patterns for .NET 8+ applications covering DbContext lifecycle, relationships, migrations, query optimization, and the repository pattern.

## When to Use

- Designing EF Core entities and relationships
- Optimizing database queries (N+1 prevention, projections, split queries)
- Setting up DbContext registration and lifetime management
- Writing Dapper queries for performance-critical paths
- Managing database migrations
- Implementing the repository pattern with Unit of Work

## DbContext Setup

```csharp
// Program.cs — register with connection pooling
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default"),
        npgsql =>
        {
            npgsql.EnableRetryOnFailure(maxRetryCount: 3);
            npgsql.CommandTimeout(30);
            npgsql.MigrationsHistoryTable("__ef_migrations");
        }));

// AppDbContext.cs
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Customer> Customers => Set<Customer>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
```

### DbContext Lifetime

```csharp
// Scoped (default) — one per HTTP request, recommended for web apps
builder.Services.AddDbContext<AppDbContext>();

// Pooled — reuses DbContext instances, reduces allocation overhead
builder.Services.AddDbContextPool<AppDbContext>(options =>
    options.UseNpgsql(connectionString), poolSize: 128);

// Factory — for background services and multi-tenant scenarios
builder.Services.AddDbContextFactory<AppDbContext>();

public class OrderProcessor(IDbContextFactory<AppDbContext> factory)
{
    public async Task ProcessAsync(CancellationToken ct)
    {
        await using var db = await factory.CreateDbContextAsync(ct);
        // Each call gets a fresh DbContext — safe for long-running services
    }
}
```

## Entity Configuration

### Fluent API (Preferred over Data Annotations)

```csharp
// Configurations/OrderConfiguration.cs
public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("orders");
        builder.HasKey(o => o.Id);

        builder.Property(o => o.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.Property(o => o.OrderNumber)
            .HasColumnName("order_number")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(o => o.Total)
            .HasColumnName("total")
            .HasPrecision(18, 2);

        builder.Property(o => o.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(o => o.CreatedAt)
            .HasColumnName("created_at")
            .HasDefaultValueSql("now()");

        // Indexes
        builder.HasIndex(o => o.OrderNumber).IsUnique();
        builder.HasIndex(o => o.CustomerId);
        builder.HasIndex(o => new { o.Status, o.CreatedAt });
    }
}
```

### Relationships

```csharp
// One-to-Many: Customer has many Orders
builder.HasOne(o => o.Customer)
    .WithMany(c => c.Orders)
    .HasForeignKey(o => o.CustomerId)
    .OnDelete(DeleteBehavior.Restrict);

// Many-to-Many: Order has many Products via OrderItems
builder.HasMany(o => o.Items)
    .WithOne(i => i.Order)
    .HasForeignKey(i => i.OrderId)
    .OnDelete(DeleteBehavior.Cascade);

// Owned types (value objects stored in same table)
builder.OwnsOne(o => o.ShippingAddress, address =>
{
    address.Property(a => a.Street).HasColumnName("shipping_street").HasMaxLength(200);
    address.Property(a => a.City).HasColumnName("shipping_city").HasMaxLength(100);
    address.Property(a => a.PostalCode).HasColumnName("shipping_postal_code").HasMaxLength(20);
});
```

## Query Optimization

### Avoiding N+1 Queries

```csharp
// Bad: N+1 — loads orders, then 1 query per customer
var orders = await db.Orders.ToListAsync(ct);
foreach (var order in orders)
    Console.WriteLine(order.Customer.Name); // Lazy load = N extra queries

// Good: Eager loading with Include
var orders = await db.Orders
    .Include(o => o.Customer)
    .Include(o => o.Items)
        .ThenInclude(i => i.Product)
    .Where(o => o.Status == OrderStatus.Active)
    .ToListAsync(ct);

// Good: Split query for large includes (avoids cartesian explosion)
var orders = await db.Orders
    .Include(o => o.Items)
    .AsSplitQuery()
    .ToListAsync(ct);
```

### Projections (Select Only What You Need)

```csharp
// Good: Project to DTO — only selects needed columns
var orderSummaries = await db.Orders
    .Where(o => o.CreatedAt >= cutoff)
    .Select(o => new OrderSummaryDto
    {
        Id = o.Id,
        OrderNumber = o.OrderNumber,
        CustomerName = o.Customer.Name,
        Total = o.Total,
        ItemCount = o.Items.Count,
    })
    .OrderByDescending(o => o.Total)
    .Take(50)
    .ToListAsync(ct);

// Good: AsNoTracking for read-only queries (reduces memory overhead)
var products = await db.Products
    .AsNoTracking()
    .Where(p => p.Category == category)
    .ToListAsync(ct);
```

### Pagination

```csharp
public async Task<PagedResult<OrderDto>> GetOrdersAsync(int page, int size, CancellationToken ct)
{
    var query = db.Orders.AsNoTracking().Where(o => o.Status == OrderStatus.Active);

    var total = await query.CountAsync(ct);
    var items = await query
        .OrderByDescending(o => o.CreatedAt)
        .Skip((page - 1) * size)
        .Take(size)
        .Select(o => new OrderDto(o.Id, o.OrderNumber, o.Total))
        .ToListAsync(ct);

    return new PagedResult<OrderDto>(items, total, page, size);
}

public record PagedResult<T>(IReadOnlyList<T> Items, int Total, int Page, int Size);
```

## Migrations

```bash
# Create a migration
dotnet ef migrations add AddOrdersTable

# Apply migrations
dotnet ef database update

# Generate SQL script (for production deployments)
dotnet ef migrations script --idempotent -o migrate.sql

# Remove last migration (if not applied)
dotnet ef migrations remove
```

```csharp
// Good: Apply migrations at startup (development only)
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
}

// Production: Use generated SQL scripts or a migration tool
```

## Transactions

```csharp
// EF Core: SaveChanges is already transactional
public async Task PlaceOrderAsync(Order order, CancellationToken ct)
{
    db.Orders.Add(order);
    foreach (var item in order.Items)
        db.OrderItems.Add(item);

    await db.SaveChangesAsync(ct); // All-or-nothing
}

// Explicit transaction for multi-step operations
public async Task TransferAsync(int fromId, int toId, decimal amount, CancellationToken ct)
{
    await using var transaction = await db.Database.BeginTransactionAsync(ct);
    try
    {
        var from = await db.Accounts.FindAsync([fromId], ct)
            ?? throw new AccountNotFoundException(fromId);
        var to = await db.Accounts.FindAsync([toId], ct)
            ?? throw new AccountNotFoundException(toId);

        from.Balance -= amount;
        to.Balance += amount;

        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
    }
    catch
    {
        await transaction.RollbackAsync(ct);
        throw;
    }
}
```

## Dapper (Micro-ORM)

Use Dapper for performance-critical, read-heavy queries where EF Core overhead matters.

```csharp
// Basic query
public async Task<Order?> GetOrderAsync(IDbConnection db, int id)
{
    return await db.QuerySingleOrDefaultAsync<Order>(
        "SELECT id, order_number, total, status FROM orders WHERE id = @Id",
        new { Id = id });
}

// Multi-mapping (join result to multiple objects)
public async Task<IReadOnlyList<OrderWithCustomer>> GetOrdersWithCustomersAsync(IDbConnection db)
{
    const string sql = """
        SELECT o.id, o.order_number, o.total, c.id, c.name, c.email
        FROM orders o
        INNER JOIN customers c ON o.customer_id = c.id
        ORDER BY o.created_at DESC
        LIMIT 100
        """;

    var result = await db.QueryAsync<OrderWithCustomer, CustomerDto, OrderWithCustomer>(
        sql,
        (order, customer) => order with { Customer = customer },
        splitOn: "id");

    return result.ToList().AsReadOnly();
}

// Bulk insert with Dapper
public async Task BulkInsertAsync(IDbConnection db, IEnumerable<Product> products)
{
    const string sql = """
        INSERT INTO products (name, price, category)
        VALUES (@Name, @Price, @Category)
        """;
    await db.ExecuteAsync(sql, products);
}
```

### When to Use EF Core vs Dapper

| Scenario | Recommendation |
|---|---|
| CRUD operations with relationships | EF Core |
| Complex reporting queries | Dapper |
| Migrations and schema management | EF Core |
| Bulk inserts/updates | Dapper |
| Rapid prototyping | EF Core |
| Performance-critical read paths | Dapper |
| Change tracking needed | EF Core |
| Stored procedure calls | Dapper |

## Repository Pattern

```csharp
// Generic repository interface
public interface IRepository<T> where T : class
{
    Task<T?> FindByIdAsync(int id, CancellationToken ct = default);
    Task<IReadOnlyList<T>> GetAllAsync(CancellationToken ct = default);
    Task AddAsync(T entity, CancellationToken ct = default);
    void Update(T entity);
    void Remove(T entity);
}

// EF Core implementation
public class EfRepository<T>(AppDbContext db) : IRepository<T> where T : class
{
    public async Task<T?> FindByIdAsync(int id, CancellationToken ct)
        => await db.Set<T>().FindAsync([id], ct);

    public async Task<IReadOnlyList<T>> GetAllAsync(CancellationToken ct)
        => await db.Set<T>().AsNoTracking().ToListAsync(ct);

    public async Task AddAsync(T entity, CancellationToken ct)
        => await db.Set<T>().AddAsync(entity, ct);

    public void Update(T entity) => db.Set<T>().Update(entity);
    public void Remove(T entity) => db.Set<T>().Remove(entity);
}

// Unit of Work
public interface IUnitOfWork
{
    IRepository<Order> Orders { get; }
    IRepository<Product> Products { get; }
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}

public class UnitOfWork(AppDbContext db) : IUnitOfWork
{
    public IRepository<Order> Orders { get; } = new EfRepository<Order>(db);
    public IRepository<Product> Products { get; } = new EfRepository<Product>(db);

    public Task<int> SaveChangesAsync(CancellationToken ct) => db.SaveChangesAsync(ct);
}
```

## Auditing

```csharp
// Base entity with audit fields
public abstract class AuditableEntity
{
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; private set; }

    public void MarkUpdated() => UpdatedAt = DateTime.UtcNow;
}

// Override SaveChanges to set audit fields automatically
public override async Task<int> SaveChangesAsync(CancellationToken ct = default)
{
    foreach (var entry in ChangeTracker.Entries<AuditableEntity>())
    {
        if (entry.State == EntityState.Added)
            entry.Property(nameof(AuditableEntity.CreatedAt)).CurrentValue = DateTime.UtcNow;

        if (entry.State == EntityState.Modified)
            entry.Entity.MarkUpdated();
    }

    return await base.SaveChangesAsync(ct);
}
```

## Best Practices

**DO:** Use `AsNoTracking()` for read-only queries | Use projections (`Select`) over full entity loads | Use `IDbContextFactory` in background services | Apply configurations via `IEntityTypeConfiguration<T>` | Use migrations for schema changes | Index frequently queried columns

**DON'T:** Use lazy loading in web apps (N+1 risk) | Call `SaveChanges` in a loop | Mix EF Core and raw SQL without reason | Use `Find()` for queries needing includes | Expose `DbContext` to controllers directly | Forget `CancellationToken` propagation

**Remember**: EF Core for most CRUD and schema management, Dapper for performance-critical reads. Always use parameterized queries, `AsNoTracking()` for reads, and projections to minimize data transfer.
