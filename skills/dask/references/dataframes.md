# Dask DataFrames

## Overview

Dask DataFrames enable parallel processing of large tabular data by distributing work across multiple pandas DataFrames. As described in the documentation, "Dask DataFrames are a collection of many pandas DataFrames" with identical APIs, making the transition from pandas straightforward.

## Core Concept

A Dask DataFrame is divided into multiple pandas DataFrames (partitions) along the index:
- Each partition is a regular pandas DataFrame
- Operations are applied to each partition in parallel
- Results are combined automatically

## Key Capabilities

### Scale
- Process 100 GiB on a laptop
- Process 100 TiB on a cluster
- Handle datasets exceeding available RAM

### Compatibility
- Implements most of the pandas API
- Easy transition from pandas code
- Works with familiar operations

## When to Use Dask DataFrames

**Use Dask When**:
- Dataset exceeds available RAM
- Computations require significant time and pandas optimization hasn't helped
- Need to scale from prototype (pandas) to production (larger data)
- Working with multiple files that should be processed together

**Stick with Pandas When**:
- Data fits comfortably in memory
- Computations complete in subseconds
- Simple operations without custom `.apply()` functions
- Iterative development and exploration

## Reading Data

Dask mirrors pandas reading syntax with added support for multiple files:

### Single File
```python
import dask.dataframe as dd

# Read single file
ddf = dd.read_csv('data.csv')
ddf = dd.read_parquet('data.parquet')
```

### Multiple Files
```python
# Read multiple files using glob patterns
ddf = dd.read_csv('data/*.csv')
ddf = dd.read_parquet('s3://mybucket/data/*.parquet')

# Read with path structure
ddf = dd.read_parquet('data/year=*/month=*/day=*.parquet')
```

### Optimizations
```python
# Specify columns to read (reduces memory)
ddf = dd.read_parquet('data.parquet', columns=['col1', 'col2'])

# Control partitioning
ddf = dd.read_csv('data.csv', blocksize='64MB')  # Creates 64MB partitions
```

## Common Operations

All operations are lazy until `.compute()` is called.

### Filtering
```python
# Same as pandas
filtered = ddf[ddf['column'] > 100]
filtered = ddf.query('column > 100')
```

### Column Operations
```python
# Add columns
ddf['new_column'] = ddf['col1'] + ddf['col2']

# Select columns
subset = ddf[['col1', 'col2', 'col3']]

# Drop columns
ddf = ddf.drop(columns=['unnecessary_col'])
```

### Aggregations
```python
# Standard aggregations work as expected
mean = ddf['column'].mean().compute()
sum_total = ddf['column'].sum().compute()
counts = ddf['category'].value_counts().compute()
```

### GroupBy
```python
# GroupBy operations (may require shuffle)
grouped = ddf.groupby('category')['value'].mean().compute()

# Multiple aggregations
agg_result = ddf.groupby('category').agg({
    'value': ['mean', 'sum', 'count'],
    'amount': 'sum'
}).compute()
```

### Joins and Merges
```python
# Merge DataFrames
merged = dd.merge(ddf1, ddf2, on='key', how='left')

# Join on index
joined = ddf1.join(ddf2, on='key')
```

### Sorting
```python
# Sorting (expensive operation, requires data movement)
sorted_ddf = ddf.sort_values('column')
result = sorted_ddf.compute()
```

## Custom Operations

### Apply Functions

**To Partitions (Efficient)**:
```python
# Apply function to entire partitions
def custom_partition_function(partition_df):
    # partition_df is a pandas DataFrame
    return partition_df.assign(new_col=partition_df['col1'] * 2)

ddf = ddf.map_partitions(custom_partition_function)
```

**To Rows (Less Efficient)**:
```python
# Apply to each row (creates many tasks)
ddf['result'] = ddf.apply(lambda row: custom_function(row), axis=1, meta=('result', 'float'))
```

**Note**: Always prefer `map_partitions` over row-wise `apply` for better performance.

### Meta Parameter

When Dask can't infer output structure, specify the `meta` parameter:
```python
# For apply operations
ddf['new'] = ddf.apply(func, axis=1, meta=('new', 'float64'))

# For map_partitions
ddf = ddf.map_partitions(func, meta=pd.DataFrame({
    'col1': pd.Series(dtype='float64'),
    'col2': pd.Series(dtype='int64')
}))
```

## Lazy Evaluation and Computation

### Lazy Operations
```python
# These operations are lazy (instant, no computation)
filtered = ddf[ddf['value'] > 100]
aggregated = filtered.groupby('category').mean()
final = aggregated[aggregated['value'] < 500]

# Nothing has computed yet
```

### Triggering Computation
```python
# Compute single result
result = final.compute()

# Compute multiple results efficiently
result1, result2, result3 = dask.compute(
    operation1,
    operation2,
    operation3
)
```

### Persist in Memory
```python
# Keep results in distributed memory for reuse
ddf_cached = ddf.persist()

# Now multiple operations on ddf_cached won't recompute
result1 = ddf_cached.mean().compute()
result2 = ddf_cached.sum().compute()
```

## Index Management

### Setting Index
```python
# Set index (required for efficient joins and certain operations)
ddf = ddf.set_index('timestamp', sorted=True)
```

### Index Properties
- Sorted index enables efficient filtering and joins
- Index determines partitioning
- Some operations perform better with appropriate index

## Writing Results

### To Files
```python
# Write to multiple files (one per partition)
ddf.to_parquet('output/data.parquet')
ddf.to_csv('output/data-*.csv')

# Write to single file (forces computation and concatenation)
ddf.compute().to_csv('output/single_file.csv')
```

### To Memory (Pandas)
```python
# Convert to pandas (loads all data in memory)
pdf = ddf.compute()
```

## Performance Considerations

### Efficient Operations
- Column selection and filtering: Very efficient
- Simple aggregations (sum, mean, count): Efficient
- Row-wise operations on partitions: Efficient with `map_partitions`

### Expensive Operations
- Sorting: Requires data shuffle across workers
- GroupBy with many groups: May require shuffle
- Complex joins: Depends on data distribution
- Row-wise apply: Creates many tasks

### Optimization Tips

**1. Select Columns Early**
```python
# Better: Read only needed columns
ddf = dd.read_parquet('data.parquet', columns=['col1', 'col2'])
```

**2. Filter Before GroupBy**
```python
# Better: Reduce data before expensive operations
result = ddf[ddf['year'] == 2024].groupby('category').sum().compute()
```

**3. Use Efficient File Formats**
```python
# Use Parquet instead of CSV for better performance
ddf.to_parquet('data.parquet')  # Faster, smaller, columnar
```

**4. Repartition Appropriately**
```python
# If partitions are too small
ddf = ddf.repartition(npartitions=10)

# If partitions are too large
ddf = ddf.repartition(partition_size='100MB')
```

## Common Patterns

### ETL Pipeline
```python
import dask.dataframe as dd

# Read data
ddf = dd.read_csv('raw_data/*.csv')

# Transform
ddf = ddf[ddf['status'] == 'valid']
ddf['amount'] = ddf['amount'].astype('float64')
ddf = ddf.dropna(subset=['important_col'])

# Aggregate
summary = ddf.groupby('category').agg({
    'amount': ['sum', 'mean'],
    'quantity': 'count'
})

# Write results
summary.to_parquet('output/summary.parquet')
```

### Time Series Analysis
```python
# Read time series data
ddf = dd.read_parquet('timeseries/*.parquet')

# Set timestamp index
ddf = ddf.set_index('timestamp', sorted=True)

# Resample (if available in Dask version)
hourly = ddf.resample('1H').mean()

# Compute statistics
result = hourly.compute()
```

### Combining Multiple Files
```python
# Read multiple files as single DataFrame
ddf = dd.read_csv('data/2024-*.csv')

# Process combined data
result = ddf.groupby('category')['value'].sum().compute()
```

## Limitations and Differences from Pandas

### Not All Pandas Features Available
Some pandas operations are not implemented in Dask:
- Some string methods
- Certain window functions
- Some specialized statistical functions

### Partitioning Matters
- Operations within partitions are efficient
- Cross-partition operations may be expensive
- Index-based operations benefit from sorted index

### Lazy Evaluation
- Operations don't execute until `.compute()`
- Need to be aware of computation triggers
- Can't inspect intermediate results without computing

## Debugging Tips

### Inspect Partitions
```python
# Get number of partitions
print(ddf.npartitions)

# Compute single partition
first_partition = ddf.get_partition(0).compute()

# View first few rows (computes first partition)
print(ddf.head())
```

### Validate Operations on Small Data
```python
# Test on small sample first
sample = ddf.head(1000)
# Validate logic works
# Then scale to full dataset
result = ddf.compute()
```

### Check Dtypes
```python
# Verify data types are correct
print(ddf.dtypes)
```
