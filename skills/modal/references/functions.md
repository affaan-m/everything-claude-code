# Modal Functions and Classes

## Table of Contents

- [Functions](#functions)
- [Remote Execution](#remote-execution)
- [Classes with Lifecycle Hooks](#classes-with-lifecycle-hooks)
- [Parallel Execution](#parallel-execution)
- [Async Functions](#async-functions)
- [Local Entrypoints](#local-entrypoints)
- [Generators](#generators)

## Functions

### Basic Function

```python
import modal

app = modal.App("my-app")

@app.function()
def compute(x: int, y: int) -> int:
    return x + y
```

### Function Parameters

The `@app.function()` decorator accepts:

| Parameter | Type | Description |
|-----------|------|-------------|
| `image` | `Image` | Container image |
| `gpu` | `str` | GPU type (e.g., `"H100"`, `"A100:2"`) |
| `cpu` | `float` | CPU cores |
| `memory` | `int` | Memory in MiB |
| `timeout` | `int` | Max execution time in seconds |
| `secrets` | `list[Secret]` | Secrets to inject |
| `volumes` | `dict[str, Volume]` | Volumes to mount |
| `schedule` | `Schedule` | Cron or periodic schedule |
| `max_containers` | `int` | Max container count |
| `min_containers` | `int` | Minimum warm containers |
| `retries` | `int` | Retry count on failure |
| `concurrency_limit` | `int` | Max concurrent inputs |
| `ephemeral_disk` | `int` | Disk in MiB |

## Remote Execution

### `.remote()` — Synchronous Call

```python
result = compute.remote(3, 4)  # Runs in the cloud, blocks until done
```

### `.local()` — Local Execution

```python
result = compute.local(3, 4)  # Runs locally (for testing)
```

### `.spawn()` — Async Fire-and-Forget

```python
call = compute.spawn(3, 4)  # Returns immediately
# ... do other work ...
result = call.get()  # Retrieve result later
```

`.spawn()` supports up to 1 million pending inputs.

## Classes with Lifecycle Hooks

Use `@app.cls()` for stateful workloads where you want to load resources once:

```python
@app.cls(gpu="L40S", image=image)
class Model:
    @modal.enter()
    def setup(self):
        """Runs once when the container starts."""
        import torch
        self.model = torch.load("/weights/model.pt")
        self.model.eval()

    @modal.method()
    def predict(self, text: str) -> dict:
        """Callable remotely."""
        return self.model(text)

    @modal.exit()
    def teardown(self):
        """Runs when the container shuts down."""
        cleanup_resources()
```

### Lifecycle Decorators

| Decorator | When It Runs |
|-----------|-------------|
| `@modal.enter()` | Once on container startup, before any inputs |
| `@modal.method()` | For each remote call |
| `@modal.exit()` | On container shutdown |

### Calling Class Methods

```python
# Create instance and call method
model = Model()
result = model.predict.remote("Hello world")

# Parallel calls
results = list(model.predict.map(["text1", "text2", "text3"]))
```

### Parameterized Classes

```python
@app.cls()
class Worker:
    model_name: str = modal.parameter()

    @modal.enter()
    def load(self):
        self.model = load_model(self.model_name)

    @modal.method()
    def run(self, data):
        return self.model(data)

# Different model instances autoscale independently
gpt = Worker(model_name="gpt-4")
llama = Worker(model_name="llama-3")
```

## Parallel Execution

### `.map()` — Parallel Processing

Process multiple inputs across containers:

```python
@app.function()
def process(item):
    return heavy_computation(item)

@app.local_entrypoint()
def main():
    items = list(range(1000))
    results = list(process.map(items))
    print(f"Processed {len(results)} items")
```

- Results are returned in the same order as inputs
- Modal autoscales containers to handle the workload
- Use `return_exceptions=True` to collect errors instead of raising

### `.starmap()` — Multi-Argument Parallel

```python
@app.function()
def add(x, y):
    return x + y

results = list(add.starmap([(1, 2), (3, 4), (5, 6)]))
# [3, 7, 11]
```

### `.map()` with `order_outputs=False`

For faster throughput when order doesn't matter:

```python
for result in process.map(items, order_outputs=False):
    handle(result)  # Results arrive as they complete
```

## Async Functions

Modal supports async/await natively:

```python
@app.function()
async def fetch_data(url: str) -> str:
    import httpx
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        return response.text
```

Async functions are especially useful with `@modal.concurrent()` for handling multiple requests per container.

## Local Entrypoints

The `@app.local_entrypoint()` runs on your machine and orchestrates remote calls:

```python
@app.local_entrypoint()
def main():
    # This code runs locally
    data = load_local_data()

    # These calls run in the cloud
    results = list(process.map(data))

    # Back to local
    save_results(results)
```

You can also define multiple entrypoints and select by function name:

```bash
modal run script.py::train
modal run script.py::evaluate
```

## Generators

Functions can yield results as they're produced:

```python
@app.function()
def generate_data():
    for i in range(100):
        yield process(i)

@app.local_entrypoint()
def main():
    for result in generate_data.remote_gen():
        print(result)
```

## Retries

Configure automatic retries on failure:

```python
@app.function(retries=3)
def flaky_operation():
    ...
```

For more control, use `modal.Retries`:

```python
@app.function(retries=modal.Retries(max_retries=3, backoff_coefficient=2.0))
def api_call():
    ...
```

## Timeouts

Set maximum execution time:

```python
@app.function(timeout=3600)  # 1 hour
def long_training():
    ...
```

Default timeout is 300 seconds (5 minutes). Maximum is 86400 seconds (24 hours).
