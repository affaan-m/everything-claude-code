---
name: csharp-async-patterns
description: Deep C# async/await patterns covering ValueTask, ConfigureAwait, IAsyncEnumerable, channels, SemaphoreSlim, CancellationToken, PeriodicTimer, Parallel.ForEachAsync, and async disposal.
origin: ECC
---

# C# Async Patterns

Deep async/await and concurrency patterns for C# and .NET. Complements the general patterns in `skills/csharp-patterns/` with async-specific depth.

## When to Use

- Designing async APIs with proper cancellation
- Implementing producer-consumer pipelines with channels
- Throttling concurrent operations
- Streaming data with IAsyncEnumerable
- Choosing between Task and ValueTask

## How It Works

This skill covers async/await primitives and concurrency patterns across six areas: `Task` vs `ValueTask` selection based on allocation characteristics, `CancellationToken` propagation and cooperative cancellation, `IAsyncEnumerable<T>` for streaming producers and consumers, `Channel<T>` for bounded producer-consumer pipelines with backpressure, `SemaphoreSlim` and `Parallel.ForEachAsync` for throttling concurrent I/O, and `PeriodicTimer` with `TaskCompletionSource` for background scheduling and callback bridging.

## Examples

**Cancellation propagation:**
```csharp
await httpClient.GetAsync(url, cancellationToken);
```

**Bounded channel producer-consumer:**
```csharp
var channel = Channel.CreateBounded<WorkItem>(100);
await channel.Writer.WriteAsync(item, ct);
await foreach (var work in channel.Reader.ReadAllAsync(ct)) { /* process */ }
```

**Throttled concurrency:**
```csharp
await Parallel.ForEachAsync(urls, new ParallelOptions { MaxDegreeOfParallelism = 4 }, async (url, ct) =>
    await DownloadAsync(url, ct));
```

## Task vs ValueTask

```csharp
// Use Task<T> — default choice, safe to await multiple times
public async Task<Order> GetOrderAsync(Guid id, CancellationToken ct)
{
    return await repository.FindByIdAsync(id, ct)
        ?? throw new OrderNotFoundException(id);
}

// Use ValueTask<T> — when the result is often synchronous (cache hit, pooled)
public ValueTask<Product?> GetProductAsync(Guid id, CancellationToken ct)
{
    if (_cache.TryGetValue(id, out var cached))
        return ValueTask.FromResult<Product?>(cached);

    return LoadFromDatabaseAsync(id, ct);
}

private async ValueTask<Product?> LoadFromDatabaseAsync(Guid id, CancellationToken ct)
{
    var product = await context.Products.FindAsync([id], ct);
    if (product is not null)
        _cache.Set(id, product, TimeSpan.FromMinutes(5));
    return product;
}

// NEVER do this with ValueTask — undefined behavior
var task = GetProductAsync(id, ct);
var a = await task;
var b = await task; // BUG: cannot await ValueTask twice
```

## ConfigureAwait

```csharp
// Library code — always use ConfigureAwait(false)
// Avoids capturing SynchronizationContext, prevents deadlocks
public async Task<byte[]> DownloadAsync(string url, CancellationToken ct)
{
    using var response = await httpClient.GetAsync(url, ct)
        .ConfigureAwait(false);
    return await response.Content.ReadAsByteArrayAsync(ct)
        .ConfigureAwait(false);
}

// Application code (ASP.NET Core) — no SynchronizationContext, so not needed
// But harmless to include for consistency in shared code
public async Task<Order> CreateOrderAsync(CreateOrderRequest req, CancellationToken ct)
{
    var order = Order.Create(req);
    await repository.AddAsync(order, ct);
    return order;
}
```

## CancellationToken Patterns

### Propagation

```csharp
// Always accept and forward CancellationToken
public async Task<IReadOnlyList<Order>> GetOrdersAsync(
    Guid customerId,
    CancellationToken cancellationToken)
{
    return await context.Orders
        .Where(o => o.CustomerId == customerId)
        .AsNoTracking()
        .ToListAsync(cancellationToken); // forward the token
}
```

### Linked Tokens

```csharp
// Combine external cancellation with a timeout
public async Task<ExternalApiResponse> CallExternalApiAsync(
    string endpoint,
    CancellationToken cancellationToken)
{
    using var timeoutCts = new CancellationTokenSource(TimeSpan.FromSeconds(10));
    using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(
        cancellationToken, timeoutCts.Token);

    return await httpClient.GetFromJsonAsync<ExternalApiResponse>(
        endpoint, linkedCts.Token)
        ?? throw new InvalidOperationException("Null response");
}
```

### Cooperative Cancellation in Loops

```csharp
public async Task ProcessBatchAsync(
    IReadOnlyList<Order> orders,
    CancellationToken cancellationToken)
{
    foreach (var order in orders)
    {
        cancellationToken.ThrowIfCancellationRequested();
        await ProcessSingleOrderAsync(order, cancellationToken);
    }
}
```

## IAsyncEnumerable

### Producing Async Streams

```csharp
public async IAsyncEnumerable<OrderDto> StreamOrdersAsync(
    Guid customerId,
    [EnumeratorCancellation] CancellationToken cancellationToken)
{
    var page = 0;
    const int pageSize = 100;
    bool hasMore;

    do
    {
        var orders = await context.Orders
            .Where(o => o.CustomerId == customerId)
            .OrderBy(o => o.CreatedAt)
            .Skip(page * pageSize)
            .Take(pageSize)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        foreach (var order in orders)
        {
            yield return OrderDto.From(order);
        }

        hasMore = orders.Count == pageSize;
        page++;
    } while (hasMore);
}
```

### Consuming Async Streams

```csharp
// Simple consumption
await foreach (var order in StreamOrdersAsync(customerId, ct))
{
    await ProcessOrderAsync(order, ct);
}

// With LINQ-style operators (System.Linq.Async)
var recentOrders = await StreamOrdersAsync(customerId, ct)
    .Where(o => o.CreatedAt > cutoff)
    .Take(10)
    .ToListAsync(ct);
```

### Returning Async Streams from APIs

```csharp
app.MapGet("/api/orders/{customerId:guid}/stream", (
    Guid customerId,
    IOrderService service,
    CancellationToken ct) =>
{
    return service.StreamOrdersAsync(customerId, ct);
});
```

## Channels (Producer-Consumer)

### Bounded Channel with Backpressure

```csharp
public sealed class WorkQueue<T>
{
    private readonly Channel<T> _channel;

    public WorkQueue(int capacity = 1000)
    {
        _channel = Channel.CreateBounded<T>(new BoundedChannelOptions(capacity)
        {
            FullMode = BoundedChannelFullMode.Wait,
            SingleReader = false,
            SingleWriter = false
        });
    }

    public ChannelWriter<T> Writer => _channel.Writer;
    public ChannelReader<T> Reader => _channel.Reader;
}
```

### Multi-Consumer Pattern

```csharp
public sealed class EventProcessingWorker(
    WorkQueue<IDomainEvent> queue,
    IServiceScopeFactory scopeFactory,
    ILogger<EventProcessingWorker> logger) : BackgroundService
{
    private const int ConsumerCount = 4;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var consumers = Enumerable.Range(0, ConsumerCount)
            .Select(i => ConsumeAsync(i, stoppingToken));

        await Task.WhenAll(consumers);
    }

    private async Task ConsumeAsync(int consumerId, CancellationToken ct)
    {
        logger.LogInformation("Consumer {Id} started", consumerId);

        await foreach (var domainEvent in queue.Reader.ReadAllAsync(ct))
        {
            try
            {
                await using var scope = scopeFactory.CreateAsyncScope();
                var handler = scope.ServiceProvider
                    .GetRequiredService<IDomainEventHandler>();
                await handler.HandleAsync(domainEvent, ct);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Consumer {Id} failed on {EventType}",
                    consumerId, domainEvent.GetType().Name);
            }
        }
    }
}
```

### Pipeline Pattern (Channel Chaining)

```csharp
public static class Pipeline
{
    public static ChannelReader<TOut> Transform<TIn, TOut>(
        this ChannelReader<TIn> source,
        Func<TIn, CancellationToken, Task<TOut>> transform,
        int concurrency,
        CancellationToken ct)
    {
        ArgumentOutOfRangeException.ThrowIfLessThan(concurrency, 1);

        var output = Channel.CreateBounded<TOut>(new BoundedChannelOptions(concurrency * 2)
        {
            FullMode = BoundedChannelFullMode.Wait
        });

        Task.Run(async () =>
        {
            var semaphore = new SemaphoreSlim(concurrency);

            try
            {
                var tasks = new List<Task>();

                await foreach (var item in source.ReadAllAsync(ct))
                {
                    await semaphore.WaitAsync(ct);
                    tasks.Add(Task.Run(async () =>
                    {
                        try
                        {
                            var result = await transform(item, ct);
                            await output.Writer.WriteAsync(result, ct);
                        }
                        finally
                        {
                            semaphore.Release();
                        }
                    }, ct));
                }

                await Task.WhenAll(tasks);
            }
            catch (Exception ex)
            {
                // Await running tasks before completing the channel to avoid
                // orphaned writes to an already-completed channel.
                try { await Task.WhenAll(tasks); } catch { /* already faulting */ }
                output.Writer.Complete(ex);
                return;
            }

            output.Writer.Complete();
        }, ct);

        return output.Reader;
    }
}

// Usage: ingest -> validate -> enrich -> persist
var validated = ingestChannel.Reader
    .Transform(ValidateAsync, concurrency: 4, ct);
var enriched = validated
    .Transform(EnrichAsync, concurrency: 2, ct);
```

## Throttling and Concurrency Control

### SemaphoreSlim

```csharp
public sealed class ThrottledApiClient(HttpClient httpClient)
{
    private readonly SemaphoreSlim _semaphore = new(initialCount: 10, maxCount: 10);

    public async Task<T> GetAsync<T>(string url, CancellationToken ct)
    {
        await _semaphore.WaitAsync(ct);
        try
        {
            return await httpClient.GetFromJsonAsync<T>(url, ct)
                ?? throw new InvalidOperationException("Null response");
        }
        finally
        {
            _semaphore.Release();
        }
    }
}
```

### Parallel.ForEachAsync

```csharp
// Process items with controlled parallelism
await Parallel.ForEachAsync(
    orderIds,
    new ParallelOptions
    {
        MaxDegreeOfParallelism = 8,
        CancellationToken = cancellationToken
    },
    async (orderId, ct) =>
    {
        await using var scope = scopeFactory.CreateAsyncScope();
        var processor = scope.ServiceProvider.GetRequiredService<IOrderProcessor>();
        await processor.ProcessAsync(orderId, ct);
    });
```

## Timers and Periodic Work

### PeriodicTimer

```csharp
public sealed class MetricsCollectorWorker(
    IMetricsService metrics,
    ILogger<MetricsCollectorWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromSeconds(30));

        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                await metrics.CollectAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Metrics collection failed");
            }
        }
    }
}
```

## TaskCompletionSource

```csharp
// Bridge callback-based APIs to async/await
public sealed class CallbackToAsyncBridge
{
    private readonly ConcurrentDictionary<Guid, TaskCompletionSource<Response>>
        _pending = new();

    public Task<Response> SendAndWaitAsync(
        Request request,
        CancellationToken cancellationToken)
    {
        var tcs = new TaskCompletionSource<Response>(
            TaskCreationOptions.RunContinuationsAsynchronously);

        _pending[request.Id] = tcs;

        var registration = cancellationToken.Register(() =>
        {
            if (_pending.TryRemove(request.Id, out var removed))
                removed.TrySetCanceled(cancellationToken);
        });

        try
        {
            Send(request); // fire-and-forget the actual send
        }
        catch
        {
            _pending.TryRemove(request.Id, out _);
            registration.Dispose();
            throw;
        }

        // Dispose registration when task completes to avoid leaks
        tcs.Task.ContinueWith(_ => registration.Dispose(), TaskScheduler.Default);
        return tcs.Task;
    }

    public void OnResponseReceived(Response response)
    {
        if (_pending.TryRemove(response.RequestId, out var tcs))
            tcs.TrySetResult(response);
    }
}
```

## Async Disposal

```csharp
public sealed class DatabaseSession : IAsyncDisposable
{
    private readonly NpgsqlConnection _connection;
    private NpgsqlTransaction? _transaction;

    public async Task BeginTransactionAsync(CancellationToken ct)
    {
        _transaction = await _connection.BeginTransactionAsync(ct);
    }

    public async Task CommitAsync(CancellationToken ct)
    {
        if (_transaction is not null)
            await _transaction.CommitAsync(ct);
    }

    public async ValueTask DisposeAsync()
    {
        if (_transaction is not null)
            await _transaction.DisposeAsync();
        await _connection.DisposeAsync();
    }
}

// Usage
await using var session = new DatabaseSession();
await session.BeginTransactionAsync(ct);
// work...
await session.CommitAsync(ct);
// DisposeAsync called automatically
```

## Anti-Patterns

| Anti-Pattern | Why | Better Approach |
|--------------|-----|-----------------|
| `.Result` / `.Wait()` | Deadlock risk | `await` |
| `async void` | Unobservable exceptions | `async Task` |
| `Thread.Sleep` in async | Blocks thread pool | `await Task.Delay` |
| Awaiting ValueTask twice | Undefined behavior | Await once or convert to Task |
| Fire-and-forget without logging | Silent failures | `_ = Task.Run(...)` with try/catch |
| `lock` in async code | Can deadlock | `SemaphoreSlim` |
| Unbounded `Channel.CreateUnbounded` | Memory exhaustion | `CreateBounded` with backpressure |
| Missing `ConfigureAwait(false)` in libs | Deadlocks in UI/legacy | Always use in library code |
| `new Timer(...)` in BackgroundService | GC can collect | `PeriodicTimer` |
| Swallowing `OperationCanceledException` | Hides cancellation | Let it propagate or check token |

## References

- Skill: `skills/csharp-patterns/`
- Skill: `skills/csharp-testing/`
- Agent: `agents/csharp-reviewer.md`
- Rules: `rules/csharp/coding-style.md`
