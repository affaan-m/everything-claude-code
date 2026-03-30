# Dask Best Practices

## Performance Optimization Principles

### Start with Simpler Solutions First

Before implementing parallel computing with Dask, explore these alternatives:
- Better algorithms for the specific problem
- Efficient file formats (Parquet, HDF5, Zarr instead of CSV)
- Compiled code via Numba or Cython
- Data sampling for development and testing

These alternatives often provide better returns than distributed systems and should be exhausted before scaling to parallel computing.

### Chunk Size Strategy

**Critical Rule**: Chunks should be small enough that many fit in a worker's available memory at once.

**Recommended Target**: Size chunks so workers can hold 10 chunks per core without exceeding available memory.

**Why It Matters**:
- Too large chunks: Memory overflow and inefficient parallelization
- Too small chunks: Excessive scheduling overhead

**Example Calculation**:
- 8 cores with 32 GB RAM
- Target: ~400 MB per chunk (32 GB / 8 cores / 10 chunks)

### Monitor with the Dashboard

The Dask dashboard provides essential visibility into:
- Worker states and resource utilization
- Task progress and bottlenecks
- Memory usage patterns
- Performance characteristics

Access the dashboard to understand what's actually slow in parallel workloads rather than guessing at optimizations.

## Critical Pitfalls to Avoid

### 1. Don't Create Large Objects Locally Before Dask

**Wrong Approach**:
```python
import pandas as pd
import dask.dataframe as dd

# Loads entire dataset into memory first
df = pd.read_csv('large_file.csv')
ddf = dd.from_pandas(df, npartitions=10)
```

**Correct Approach**:
```python
import dask.dataframe as dd

# Let Dask handle the loading
ddf = dd.read_csv('large_file.csv')
```

**Why**: Loading data with pandas or NumPy first forces the scheduler to serialize and embed those objects in task graphs, defeating the purpose of parallel computing.

**Key Principle**: Use Dask methods to load data and use Dask to control the results.

### 2. Avoid Repeated compute() Calls

**Wrong Approach**:
```python
results = []
for item in items:
    result = dask_computation(item).compute()  # Each compute is separate
    results.append(result)
```

**Correct Approach**:
```python
computations = [dask_computation(item) for item in items]
results = dask.compute(*computations)  # Single compute for all
```

**Why**: Calling compute in loops prevents Dask from:
- Parallelizing different computations
- Sharing intermediate results
- Optimizing the overall task graph

### 3. Don't Build Excessively Large Task Graphs

**Symptoms**:
- Millions of tasks in a single computation
- Severe scheduling overhead
- Long delays before computation starts

**Solutions**:
- Increase chunk sizes to reduce number of tasks
- Use `map_partitions` or `map_blocks` to fuse operations
- Break computations into smaller pieces with intermediate persists
- Consider whether the problem truly requires distributed computing

**Example Using map_partitions**:
```python
# Instead of applying function to each row
ddf['result'] = ddf.apply(complex_function, axis=1)  # Many tasks

# Apply to entire partitions at once
ddf = ddf.map_partitions(lambda df: df.assign(result=complex_function(df)))
```

## Infrastructure Considerations

### Scheduler Selection

**Use Threads For**:
- Numeric work with GIL-releasing libraries (NumPy, Pandas, scikit-learn)
- Operations that benefit from shared memory
- Single-machine workloads with array/dataframe operations

**Use Processes For**:
- Text processing and Python collection operations
- Pure Python code that's GIL-bound
- Operations that need process isolation

**Use Distributed Scheduler For**:
- Multi-machine clusters
- Need for diagnostic dashboard
- Asynchronous APIs
- Better data locality handling

### Thread Configuration

**Recommendation**: Aim for roughly 4 threads per process on numeric workloads.

**Rationale**:
- Balance between parallelism and overhead
- Allows efficient use of CPU cores
- Reduces context switching costs

### Memory Management

**Persist Strategically**:
```python
# Persist intermediate results that are reused
intermediate = expensive_computation(data).persist()
result1 = intermediate.operation1().compute()
result2 = intermediate.operation2().compute()
```

**Clear Memory When Done**:
```python
# Explicitly delete large objects
del intermediate
```

## Data Loading Best Practices

### Use Appropriate File Formats

**For Tabular Data**:
- Parquet: Columnar, compressed, fast filtering
- CSV: Only for small data or initial ingestion

**For Array Data**:
- HDF5: Good for numeric arrays
- Zarr: Cloud-native, parallel-friendly
- NetCDF: Scientific data with metadata

### Optimize Data Ingestion

**Read Multiple Files Efficiently**:
```python
# Use glob patterns to read multiple files in parallel
ddf = dd.read_parquet('data/year=2024/month=*/day=*.parquet')
```

**Specify Useful Columns Early**:
```python
# Only read needed columns
ddf = dd.read_parquet('data.parquet', columns=['col1', 'col2', 'col3'])
```

## Common Patterns and Solutions

### Pattern: Embarrassingly Parallel Problems

For independent computations, use Futures:
```python
from dask.distributed import Client

client = Client()
futures = [client.submit(func, arg) for arg in args]
results = client.gather(futures)
```

### Pattern: Data Preprocessing Pipeline

Use Bags for initial ETL, then convert to structured formats:
```python
import dask.bag as db

# Process raw JSON
bag = db.read_text('logs/*.json').map(json.loads)
bag = bag.filter(lambda x: x['status'] == 'success')

# Convert to DataFrame for analysis
ddf = bag.to_dataframe()
```

### Pattern: Iterative Algorithms

Persist data between iterations:
```python
data = dd.read_parquet('data.parquet')
data = data.persist()  # Keep in memory across iterations

for iteration in range(num_iterations):
    data = update_function(data)
    data = data.persist()  # Persist updated version
```

## Debugging Tips

### Use Single-Threaded Scheduler

For debugging with pdb or detailed error inspection:
```python
import dask

dask.config.set(scheduler='synchronous')
result = computation.compute()  # Runs in single thread for debugging
```

### Check Task Graph Size

Before computing, check the number of tasks:
```python
print(len(ddf.__dask_graph__()))  # Should be reasonable, not millions
```

### Validate on Small Data First

Test logic on small subset before scaling:
```python
# Test on first partition
sample = ddf.head(1000)
# Validate results
# Then scale to full dataset
```

## Performance Troubleshooting

### Symptom: Slow Computation Start

**Likely Cause**: Task graph is too large
**Solution**: Increase chunk sizes or use map_partitions

### Symptom: Memory Errors

**Likely Causes**:
- Chunks too large
- Too many intermediate results
- Memory leaks in user functions

**Solutions**:
- Decrease chunk sizes
- Use persist() strategically and delete when done
- Profile user functions for memory issues

### Symptom: Poor Parallelization

**Likely Causes**:
- Data dependencies preventing parallelism
- Chunks too large (not enough tasks)
- GIL contention with threads on Python code

**Solutions**:
- Restructure computation to reduce dependencies
- Increase number of partitions
- Switch to multiprocessing scheduler for Python code
