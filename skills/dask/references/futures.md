# Dask Futures

## Overview

Dask futures extend Python's `concurrent.futures` interface, enabling immediate (non-lazy) task execution. Unlike delayed computations (used in DataFrames, Arrays, and Bags), futures provide more flexibility in situations where computations may evolve over time or require dynamic workflow construction.

## Core Concept

Futures represent real-time task execution:
- Tasks execute immediately when submitted (not lazy)
- Each future represents a remote computation result
- Automatic dependency tracking between futures
- Enables dynamic, evolving workflows
- Direct control over task scheduling and data placement

## Key Capabilities

### Real-Time Execution
- Tasks run immediately when submitted
- No need for explicit `.compute()` call
- Get results with `.result()` method

### Automatic Dependency Management
When you submit tasks with future inputs, Dask automatically handles dependency tracking. Once all input futures have completed, they will be moved onto a single worker for efficient computation.

### Dynamic Workflows
Build computations that evolve based on intermediate results:
- Submit new tasks based on previous results
- Conditional execution paths
- Iterative algorithms with varying structure

## When to Use Futures

**Use Futures When**:
- Building dynamic, evolving workflows
- Need immediate task execution (not lazy)
- Computations depend on runtime conditions
- Require fine control over task placement
- Implementing custom parallel algorithms
- Need stateful computations (with actors)

**Use Other Collections When**:
- Static, predefined computation graphs (use delayed, DataFrames, Arrays)
- Simple data parallelism on large collections (use Bags, DataFrames)
- Standard array/dataframe operations suffice

## Setting Up Client

Futures require a distributed client:

```python
from dask.distributed import Client

# Local cluster (on single machine)
client = Client()

# Or specify resources
client = Client(n_workers=4, threads_per_worker=2)

# Or connect to existing cluster
client = Client('scheduler-address:8786')
```

## Submitting Tasks

### Basic Submit
```python
from dask.distributed import Client

client = Client()

# Submit single task
def add(x, y):
    return x + y

future = client.submit(add, 1, 2)

# Get result
result = future.result()  # Blocks until complete
print(result)  # 3
```

### Multiple Tasks
```python
# Submit multiple independent tasks
futures = []
for i in range(10):
    future = client.submit(add, i, i)
    futures.append(future)

# Gather results
results = client.gather(futures)  # Efficient parallel gathering
```

### Map Over Inputs
```python
# Apply function to multiple inputs
def square(x):
    return x ** 2

# Submit batch of tasks
futures = client.map(square, range(100))

# Gather results
results = client.gather(futures)
```

**Note**: Each task carries ~1ms overhead, making `map` less suitable for millions of tiny tasks. For massive datasets, use Bags or DataFrames instead.

## Working with Futures

### Check Status
```python
future = client.submit(expensive_function, arg)

# Check if complete
print(future.done())  # False or True

# Check status
print(future.status)  # 'pending', 'running', 'finished', or 'error'
```

### Non-Blocking Result Retrieval
```python
# Non-blocking check
if future.done():
    result = future.result()
else:
    print("Still computing...")

# Or use callbacks
def handle_result(future):
    print(f"Result: {future.result()}")

future.add_done_callback(handle_result)
```

### Error Handling
```python
def might_fail(x):
    if x < 0:
        raise ValueError("Negative value")
    return x ** 2

future = client.submit(might_fail, -5)

try:
    result = future.result()
except ValueError as e:
    print(f"Task failed: {e}")
```

## Task Dependencies

### Automatic Dependency Tracking
```python
# Submit task
future1 = client.submit(add, 1, 2)

# Use future as input (creates dependency)
future2 = client.submit(add, future1, 10)  # Depends on future1

# Chain dependencies
future3 = client.submit(add, future2, 100)  # Depends on future2

# Get final result
result = future3.result()  # 113
```

### Complex Dependencies
```python
# Multiple dependencies
a = client.submit(func1, x)
b = client.submit(func2, y)
c = client.submit(func3, a, b)  # Depends on both a and b

result = c.result()
```

## Data Movement Optimization

### Scatter Data
Pre-scatter important data to avoid repeated transfers:

```python
# Upload data to cluster once
large_dataset = client.scatter(big_data)  # Returns future

# Use scattered data in multiple tasks
futures = [client.submit(process, large_dataset, i) for i in range(100)]

# Each task uses the same scattered data without re-transfer
results = client.gather(futures)
```

### Efficient Gathering
Use `client.gather()` for concurrent result collection:

```python
# Better: Gather all at once (parallel)
results = client.gather(futures)

# Worse: Sequential result retrieval
results = [f.result() for f in futures]
```

## Fire-and-Forget

For side-effect tasks without needing the result:

```python
from dask.distributed import fire_and_forget

def log_to_database(data):
    # Write to database, no return value needed
    database.write(data)

# Submit without keeping reference
future = client.submit(log_to_database, data)
fire_and_forget(future)

# Dask won't abandon this computation even without active future reference
```

## Performance Characteristics

### Task Overhead
- ~1ms overhead per task
- Good for: Thousands of tasks
- Not suitable for: Millions of tiny tasks

### Worker-to-Worker Communication
- Direct worker-to-worker data transfer
- Roundtrip latency: ~1ms
- Efficient for task dependencies

### Memory Management
Dask tracks active futures locally. When a future is garbage collected by your local Python session, Dask will feel free to delete that data.

**Keep References**:
```python
# Keep reference to prevent deletion
important_result = client.submit(expensive_calc, data)

# Use result multiple times
future1 = client.submit(process1, important_result)
future2 = client.submit(process2, important_result)
```

## Advanced Coordination

### Distributed Primitives

**Queues**:
```python
from dask.distributed import Queue

queue = Queue()

def producer():
    for i in range(10):
        queue.put(i)

def consumer():
    results = []
    for _ in range(10):
        results.append(queue.get())
    return results

# Submit tasks
client.submit(producer)
result_future = client.submit(consumer)
results = result_future.result()
```

**Locks**:
```python
from dask.distributed import Lock

lock = Lock()

def critical_section():
    with lock:
        # Only one task executes this at a time
        shared_resource.update()
```

**Events**:
```python
from dask.distributed import Event

event = Event()

def waiter():
    event.wait()  # Blocks until event is set
    return "Event occurred"

def setter():
    time.sleep(5)
    event.set()

# Start both tasks
wait_future = client.submit(waiter)
set_future = client.submit(setter)

result = wait_future.result()  # Waits for setter to complete
```

**Variables**:
```python
from dask.distributed import Variable

var = Variable('my-var')

# Set value
var.set(42)

# Get value from tasks
def reader():
    return var.get()

future = client.submit(reader)
print(future.result())  # 42
```

## Actors

For stateful, rapidly-changing workflows, actors enable worker-to-worker roundtrip latency around 1ms while bypassing scheduler coordination.

### Creating Actors
```python
from dask.distributed import Client

client = Client()

class Counter:
    def __init__(self):
        self.count = 0

    def increment(self):
        self.count += 1
        return self.count

    def get_count(self):
        return self.count

# Create actor on worker
counter = client.submit(Counter, actor=True).result()

# Call methods
future1 = counter.increment()
future2 = counter.increment()
result = counter.get_count().result()
print(result)  # 2
```

### Actor Use Cases
- Stateful services (databases, caches)
- Rapidly changing state
- Complex coordination patterns
- Real-time streaming applications

## Common Patterns

### Embarrassingly Parallel Tasks
```python
from dask.distributed import Client

client = Client()

def process_item(item):
    # Independent computation
    return expensive_computation(item)

# Process many items in parallel
items = range(1000)
futures = client.map(process_item, items)

# Gather all results
results = client.gather(futures)
```

### Dynamic Task Submission
```python
def recursive_compute(data, depth):
    if depth == 0:
        return process(data)

    # Split and recurse
    left, right = split(data)
    left_future = client.submit(recursive_compute, left, depth - 1)
    right_future = client.submit(recursive_compute, right, depth - 1)

    # Combine results
    return combine(left_future.result(), right_future.result())

# Start computation
result_future = client.submit(recursive_compute, initial_data, 5)
result = result_future.result()
```

### Parameter Sweep
```python
from itertools import product

def run_simulation(param1, param2, param3):
    # Run simulation with parameters
    return simulate(param1, param2, param3)

# Generate parameter combinations
params = product(range(10), range(10), range(10))

# Submit all combinations
futures = [client.submit(run_simulation, p1, p2, p3) for p1, p2, p3 in params]

# Gather results as they complete
from dask.distributed import as_completed

for future in as_completed(futures):
    result = future.result()
    process_result(result)
```

### Pipeline with Dependencies
```python
# Stage 1: Load data
load_futures = [client.submit(load_data, file) for file in files]

# Stage 2: Process (depends on stage 1)
process_futures = [client.submit(process, f) for f in load_futures]

# Stage 3: Aggregate (depends on stage 2)
agg_future = client.submit(aggregate, process_futures)

# Get final result
result = agg_future.result()
```

### Iterative Algorithm
```python
# Initialize
state = client.scatter(initial_state)

# Iterate
for iteration in range(num_iterations):
    # Compute update based on current state
    state = client.submit(update_function, state)

    # Check convergence
    converged = client.submit(check_convergence, state)
    if converged.result():
        break

# Get final state
final_state = state.result()
```

## Best Practices

### 1. Pre-scatter Large Data
```python
# Upload once, use many times
large_data = client.scatter(big_dataset)
futures = [client.submit(process, large_data, i) for i in range(100)]
```

### 2. Use Gather for Bulk Retrieval
```python
# Efficient: Parallel gathering
results = client.gather(futures)

# Inefficient: Sequential
results = [f.result() for f in futures]
```

### 3. Manage Memory with References
```python
# Keep important futures
important = client.submit(expensive_calc, data)

# Use multiple times
f1 = client.submit(use_result, important)
f2 = client.submit(use_result, important)

# Clean up when done
del important
```

### 4. Handle Errors Appropriately
```python
futures = client.map(might_fail, inputs)

# Check for errors
results = []
errors = []
for future in as_completed(futures):
    try:
        results.append(future.result())
    except Exception as e:
        errors.append(e)
```

### 5. Use as_completed for Progressive Processing
```python
from dask.distributed import as_completed

futures = client.map(process, items)

# Process results as they arrive
for future in as_completed(futures):
    result = future.result()
    handle_result(result)
```

## Debugging Tips

### Monitor Dashboard
View the Dask dashboard to see:
- Task progress
- Worker utilization
- Memory usage
- Task dependencies

### Check Task Status
```python
# Inspect future
print(future.status)
print(future.done())

# Get traceback on error
try:
    future.result()
except Exception:
    print(future.traceback())
```

### Profile Tasks
```python
# Get performance data
client.profile(filename='profile.html')
```
