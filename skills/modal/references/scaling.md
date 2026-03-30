# Modal Scaling and Concurrency

## Table of Contents

- [Autoscaling](#autoscaling)
- [Configuration](#configuration)
- [Parallel Execution](#parallel-execution)
- [Concurrent Inputs](#concurrent-inputs)
- [Dynamic Batching](#dynamic-batching)
- [Dynamic Autoscaler Updates](#dynamic-autoscaler-updates)
- [Limits](#limits)

## Autoscaling

Modal automatically manages a pool of containers for each function:
- Spins up containers when there's no capacity for new inputs
- Spins down idle containers to save costs
- Scales from zero (no cost when idle) to thousands of containers

No configuration needed for basic autoscaling — it works out of the box.

## Configuration

Fine-tune autoscaling behavior:

```python
@app.function(
    max_containers=100,     # Upper limit on container count
    min_containers=2,       # Keep 2 warm (reduces cold starts)
    buffer_containers=5,    # Reserve 5 extra for burst traffic
    scaledown_window=300,   # Wait 5 min idle before shutting down
)
def handle_request(data):
    ...
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `max_containers` | Unlimited | Hard cap on total containers |
| `min_containers` | 0 | Minimum warm containers (costs money even when idle) |
| `buffer_containers` | 0 | Extra containers to prevent queuing |
| `scaledown_window` | 60 | Seconds of idle time before shutdown |

### Trade-offs

- Higher `min_containers` = lower latency, higher cost
- Higher `buffer_containers` = less queuing, higher cost
- Lower `scaledown_window` = faster cost savings, more cold starts

## Parallel Execution

### `.map()` — Process Many Inputs

```python
@app.function()
def process(item):
    return heavy_computation(item)

@app.local_entrypoint()
def main():
    items = list(range(10_000))
    results = list(process.map(items))
```

Modal automatically scales containers to handle the workload. Results maintain input order.

### `.map()` Options

```python
# Unordered results (faster)
for result in process.map(items, order_outputs=False):
    handle(result)

# Collect errors instead of raising
results = list(process.map(items, return_exceptions=True))
for r in results:
    if isinstance(r, Exception):
        print(f"Error: {r}")
```

### `.starmap()` — Multi-Argument

```python
@app.function()
def add(x, y):
    return x + y

results = list(add.starmap([(1, 2), (3, 4), (5, 6)]))
# [3, 7, 11]
```

### `.spawn()` — Fire-and-Forget

```python
# Returns immediately
call = process.spawn(large_data)

# Check status or get result later
result = call.get()
```

Up to 1 million pending `.spawn()` calls.

## Concurrent Inputs

By default, each container handles one input at a time. Use `@modal.concurrent` to handle multiple:

```python
@app.function(gpu="L40S")
@modal.concurrent(max_inputs=10)
async def predict(text: str):
    result = await model.predict_async(text)
    return result
```

This is ideal for I/O-bound workloads or async inference where a single GPU can handle multiple requests.

### With Web Endpoints

```python
@app.function(gpu="L40S")
@modal.concurrent(max_inputs=20)
@modal.asgi_app()
def web_service():
    return fastapi_app
```

## Dynamic Batching

Collect inputs into batches for efficient GPU utilization:

```python
@app.function(gpu="L40S")
@modal.batched(max_batch_size=32, wait_ms=100)
async def batch_predict(texts: list[str]):
    # Called with up to 32 texts at once
    embeddings = model.encode(texts)
    return list(embeddings)
```

- `max_batch_size` — Maximum inputs per batch
- `wait_ms` — How long to wait for more inputs before processing
- The function receives a list and must return a list of the same length

## Dynamic Autoscaler Updates

Adjust autoscaling at runtime without redeploying:

```python
@app.function()
def scale_up_for_peak():
    process = modal.Function.from_name("my-app", "process")
    process.update_autoscaler(min_containers=10, buffer_containers=20)

@app.function()
def scale_down_after_peak():
    process = modal.Function.from_name("my-app", "process")
    process.update_autoscaler(min_containers=1, buffer_containers=2)
```

Settings revert to the decorator values on the next deployment.

## Limits

| Resource | Limit |
|----------|-------|
| Pending inputs (unassigned) | 2,000 |
| Total inputs (running + pending) | 25,000 |
| Pending `.spawn()` inputs | 1,000,000 |
| Concurrent inputs per `.map()` | 1,000 |
| Rate limit (web endpoints) | 200 req/s |

Exceeding these limits triggers `Resource Exhausted` errors. Implement retry logic for resilience.
