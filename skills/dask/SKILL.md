---
name: dask
description: Distributed computing for larger-than-RAM pandas/NumPy workflows. Use when you need to scale existing pandas/NumPy code beyond memory or across clusters. Best for parallel file processing, distributed ML, integration with existing pandas code. For out-of-core analytics on single machine use vaex; for in-memory speed use polars.
license: BSD-3-Clause license
metadata:
    skill-author: K-Dense Inc.
---

# Dask

## Overview

Dask is a Python library for parallel and distributed computing that enables three critical capabilities:
- **Larger-than-memory execution** on single machines for data exceeding available RAM
- **Parallel processing** for improved computational speed across multiple cores
- **Distributed computation** supporting terabyte-scale datasets across multiple machines

Dask scales from laptops (processing ~100 GiB) to clusters (processing ~100 TiB) while maintaining familiar Python APIs.

## When to Use This Skill

This skill should be used when:
- Process datasets that exceed available RAM
- Scale pandas or NumPy operations to larger datasets
- Parallelize computations for performance improvements
- Process multiple files efficiently (CSVs, Parquet, JSON, text logs)
- Build custom parallel workflows with task dependencies
- Distribute workloads across multiple cores or machines

## Core Capabilities

Dask provides five main components, each suited to different use cases:

### 1. DataFrames - Parallel Pandas Operations

**Purpose**: Scale pandas operations to larger datasets through parallel processing.

**When to Use**:
- Tabular data exceeds available RAM
- Need to process multiple CSV/Parquet files together
- Pandas operations are slow and need parallelization
- Scaling from pandas prototype to production

**Reference Documentation**: For comprehensive guidance on Dask DataFrames, refer to `references/dataframes.md` which includes:
- Reading data (single files, multiple files, glob patterns)
- Common operations (filtering, groupby, joins, aggregations)
- Custom operations with `map_partitions`
- Performance optimization tips
- Common patterns (ETL, time series, multi-file processing)

**Quick Example**:
```python
import dask.dataframe as dd

# Read multiple files as single DataFrame
ddf = dd.read_csv('data/2024-*.csv')

# Operations are lazy until compute()
filtered = ddf[ddf['value'] > 100]
result = filtered.groupby('category').mean().compute()
```

**Key Points**:
- Operations are lazy (build task graph) until `.compute()` called
- Use `map_partitions` for efficient custom operations
- Convert to DataFrame early when working with structured data from other sources

### 2. Arrays - Parallel NumPy Operations

**Purpose**: Extend NumPy capabilities to datasets larger than memory using blocked algorithms.

**When to Use**:
- Arrays exceed available RAM
- NumPy operations need parallelization
- Working with scientific datasets (HDF5, Zarr, NetCDF)
- Need parallel linear algebra or array operations

**Reference Documentation**: For comprehensive guidance on Dask Arrays, refer to `references/arrays.md` which includes:
- Creating arrays (from NumPy, random, from disk)
- Chunking strategies and optimization
- Common operations (arithmetic, reductions, linear algebra)
- Custom operations with `map_blocks`
- Integration with HDF5, Zarr, and XArray

**Quick Example**:
```python
import dask.array as da

# Create large array with chunks
x = da.random.random((100000, 100000), chunks=(10000, 10000))

# Operations are lazy
y = x + 100
z = y.mean(axis=0)

# Compute result
result = z.compute()
```

**Key Points**:
- Chunk size is critical (aim for ~100 MB per chunk)
- Operations work on chunks in parallel
- Rechunk data when needed for efficient operations
- Use `map_blocks` for operations not available in Dask

### 3. Bags - Parallel Processing of Unstructured Data

**Purpose**: Process unstructured or semi-structured data (text, JSON, logs) with functional operations.

**When to Use**:
- Processing text files, logs, or JSON records
- Data cleaning and ETL before structured analysis
- Working with Python objects that don't fit array/dataframe formats
- Need memory-efficient streaming processing

**Reference Documentation**: For comprehensive guidance on Dask Bags, refer to `references/bags.md` which includes:
- Reading text and JSON files
- Functional operations (map, filter, fold, groupby)
- Converting to DataFrames
- Common patterns (log analysis, JSON processing, text processing)
- Performance considerations

**Quick Example**:
```python
import dask.bag as db
import json

# Read and parse JSON files
bag = db.read_text('logs/*.json').map(json.loads)

# Filter and transform
valid = bag.filter(lambda x: x['status'] == 'valid')
processed = valid.map(lambda x: {'id': x['id'], 'value': x['value']})

# Convert to DataFrame for analysis
ddf = processed.to_dataframe()
```

**Key Points**:
- Use for initial data cleaning, then convert to DataFrame/Array
- Use `foldby` instead of `groupby` for better performance
- Operations are streaming and memory-efficient
- Convert to structured formats (DataFrame) for complex operations

### 4. Futures - Task-Based Parallelization

**Purpose**: Build custom parallel workflows with fine-grained control over task execution and dependencies.

**When to Use**:
- Building dynamic, evolving workflows
- Need immediate task execution (not lazy)
- Computations depend on runtime conditions
- Implementing custom parallel algorithms
- Need stateful computations

**Reference Documentation**: For comprehensive guidance on Dask Futures, refer to `references/futures.md` which includes:
- Setting up distributed client
- Submitting tasks and working with futures
- Task dependencies and data movement
- Advanced coordination (queues, locks, events, actors)
- Common patterns (parameter sweeps, dynamic tasks, iterative algorithms)

**Quick Example**:
```python
from dask.distributed import Client

client = Client()  # Create local cluster

# Submit tasks (executes immediately)
def process(x):
    return x ** 2

futures = client.map(process, range(100))

# Gather results
results = client.gather(futures)

client.close()
```

**Key Points**:
- Requires distributed client (even for single machine)
- Tasks execute immediately when submitted
- Pre-scatter large data to avoid repeated transfers
- ~1ms overhead per task (not suitable for millions of tiny tasks)
- Use actors for stateful workflows

### 5. Schedulers - Execution Backends

**Purpose**: Control how and where Dask tasks execute (threads, processes, distributed).

**When to Choose Scheduler**:
- **Threads** (default): NumPy/Pandas operations, GIL-releasing libraries, shared memory benefit
- **Processes**: Pure Python code, text processing, GIL-bound operations
- **Synchronous**: Debugging with pdb, profiling, understanding errors
- **Distributed**: Need dashboard, multi-machine clusters, advanced features

**Reference Documentation**: For comprehensive guidance on Dask Schedulers, refer to `references/schedulers.md` which includes:
- Detailed scheduler descriptions and characteristics
- Configuration methods (global, context manager, per-compute)
- Performance considerations and overhead
- Common patterns and troubleshooting
- Thread configuration for optimal performance

**Quick Example**:
```python
import dask
import dask.dataframe as dd

# Use threads for DataFrame (default, good for numeric)
ddf = dd.read_csv('data.csv')
result1 = ddf.mean().compute()  # Uses threads

# Use processes for Python-heavy work
import dask.bag as db
bag = db.read_text('logs/*.txt')
result2 = bag.map(python_function).compute(scheduler='processes')

# Use synchronous for debugging
dask.config.set(scheduler='synchronous')
result3 = problematic_computation.compute()  # Can use pdb

# Use distributed for monitoring and scaling
from dask.distributed import Client
client = Client()
result4 = computation.compute()  # Uses distributed with dashboard
```

**Key Points**:
- Threads: Lowest overhead (~10 µs/task), best for numeric work
- Processes: Avoids GIL (~10 ms/task), best for Python work
- Distributed: Monitoring dashboard (~1 ms/task), scales to clusters
- Can switch schedulers per computation or globally

## Best Practices

For comprehensive performance optimization guidance, memory management strategies, and common pitfalls to avoid, refer to `references/best-practices.md`. Key principles include:

### Start with Simpler Solutions
Before using Dask, explore:
- Better algorithms
- Efficient file formats (Parquet instead of CSV)
- Compiled code (Numba, Cython)
- Data sampling

### Critical Performance Rules

**1. Don't Load Data Locally Then Hand to Dask**
```python
# Wrong: Loads all data in memory first
import pandas as pd
df = pd.read_csv('large.csv')
ddf = dd.from_pandas(df, npartitions=10)

# Correct: Let Dask handle loading
import dask.dataframe as dd
ddf = dd.read_csv('large.csv')
```

**2. Avoid Repeated compute() Calls**
```python
# Wrong: Each compute is separate
for item in items:
    result = dask_computation(item).compute()

# Correct: Single compute for all
computations = [dask_computation(item) for item in items]
results = dask.compute(*computations)
```

**3. Don't Build Excessively Large Task Graphs**
- Increase chunk sizes if millions of tasks
- Use `map_partitions`/`map_blocks` to fuse operations
- Check task graph size: `len(ddf.__dask_graph__())`

**4. Choose Appropriate Chunk Sizes**
- Target: ~100 MB per chunk (or 10 chunks per core in worker memory)
- Too large: Memory overflow
- Too small: Scheduling overhead

**5. Use the Dashboard**
```python
from dask.distributed import Client
client = Client()
print(client.dashboard_link)  # Monitor performance, identify bottlenecks
```

## Common Workflow Patterns

### ETL Pipeline
```python
import dask.dataframe as dd

# Extract: Read data
ddf = dd.read_csv('raw_data/*.csv')

# Transform: Clean and process
ddf = ddf[ddf['status'] == 'valid']
ddf['amount'] = ddf['amount'].astype('float64')
ddf = ddf.dropna(subset=['important_col'])

# Load: Aggregate and save
summary = ddf.groupby('category').agg({'amount': ['sum', 'mean']})
summary.to_parquet('output/summary.parquet')
```

### Unstructured to Structured Pipeline
```python
import dask.bag as db
import json

# Start with Bag for unstructured data
bag = db.read_text('logs/*.json').map(json.loads)
bag = bag.filter(lambda x: x['status'] == 'valid')

# Convert to DataFrame for structured analysis
ddf = bag.to_dataframe()
result = ddf.groupby('category').mean().compute()
```

### Large-Scale Array Computation
```python
import dask.array as da

# Load or create large array
x = da.from_zarr('large_dataset.zarr')

# Process in chunks
normalized = (x - x.mean()) / x.std()

# Save result
da.to_zarr(normalized, 'normalized.zarr')
```

### Custom Parallel Workflow
```python
from dask.distributed import Client

client = Client()

# Scatter large dataset once
data = client.scatter(large_dataset)

# Process in parallel with dependencies
futures = []
for param in parameters:
    future = client.submit(process, data, param)
    futures.append(future)

# Gather results
results = client.gather(futures)
```

## Selecting the Right Component

Use this decision guide to choose the appropriate Dask component:

**Data Type**:
- Tabular data → **DataFrames**
- Numeric arrays → **Arrays**
- Text/JSON/logs → **Bags** (then convert to DataFrame)
- Custom Python objects → **Bags** or **Futures**

**Operation Type**:
- Standard pandas operations → **DataFrames**
- Standard NumPy operations → **Arrays**
- Custom parallel tasks → **Futures**
- Text processing/ETL → **Bags**

**Control Level**:
- High-level, automatic → **DataFrames/Arrays**
- Low-level, manual → **Futures**

**Workflow Type**:
- Static computation graph → **DataFrames/Arrays/Bags**
- Dynamic, evolving → **Futures**

## Integration Considerations

### File Formats
- **Efficient**: Parquet, HDF5, Zarr (columnar, compressed, parallel-friendly)
- **Compatible but slower**: CSV (use for initial ingestion only)
- **For Arrays**: HDF5, Zarr, NetCDF

### Conversion Between Collections
```python
# Bag → DataFrame
ddf = bag.to_dataframe()

# DataFrame → Array (for numeric data)
arr = ddf.to_dask_array(lengths=True)

# Array → DataFrame
ddf = dd.from_dask_array(arr, columns=['col1', 'col2'])
```

### With Other Libraries
- **XArray**: Wraps Dask arrays with labeled dimensions (geospatial, imaging)
- **Dask-ML**: Machine learning with scikit-learn compatible APIs
- **Distributed**: Advanced cluster management and monitoring

## Debugging and Development

### Iterative Development Workflow

1. **Test on small data with synchronous scheduler**:
```python
dask.config.set(scheduler='synchronous')
result = computation.compute()  # Can use pdb, easy debugging
```

2. **Validate with threads on sample**:
```python
sample = ddf.head(1000)  # Small sample
# Test logic, then scale to full dataset
```

3. **Scale with distributed for monitoring**:
```python
from dask.distributed import Client
client = Client()
print(client.dashboard_link)  # Monitor performance
result = computation.compute()
```

### Common Issues

**Memory Errors**:
- Decrease chunk sizes
- Use `persist()` strategically and delete when done
- Check for memory leaks in custom functions

**Slow Start**:
- Task graph too large (increase chunk sizes)
- Use `map_partitions` or `map_blocks` to reduce tasks

**Poor Parallelization**:
- Chunks too large (increase number of partitions)
- Using threads with Python code (switch to processes)
- Data dependencies preventing parallelism

## Reference Files

All reference documentation files can be read as needed for detailed information:

- `references/dataframes.md` - Complete Dask DataFrame guide
- `references/arrays.md` - Complete Dask Array guide
- `references/bags.md` - Complete Dask Bag guide
- `references/futures.md` - Complete Dask Futures and distributed computing guide
- `references/schedulers.md` - Complete scheduler selection and configuration guide
- `references/best-practices.md` - Comprehensive performance optimization and troubleshooting

Load these files when users need detailed information about specific Dask components, operations, or patterns beyond the quick guidance provided here.

