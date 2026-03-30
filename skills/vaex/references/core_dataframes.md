# Core DataFrames and Data Loading

This reference covers Vaex DataFrame basics, loading data from various sources, and understanding the DataFrame structure.

## DataFrame Fundamentals

A Vaex DataFrame is the central data structure for working with large tabular datasets. Unlike pandas, Vaex DataFrames:
- Use **lazy evaluation** - operations are not executed until needed
- Work **out-of-core** - data doesn't need to fit in RAM
- Support **virtual columns** - computed columns with no memory overhead
- Enable **billion-row-per-second** processing through optimized C++ backend

## Opening Existing Files

### Primary Method: `vaex.open()`

The most common way to load data:

```python
import vaex

# Works with multiple formats
df = vaex.open('data.hdf5')     # HDF5 (recommended)
df = vaex.open('data.arrow')    # Apache Arrow (recommended)
df = vaex.open('data.parquet')  # Parquet
df = vaex.open('data.csv')      # CSV (slower for large files)
df = vaex.open('data.fits')     # FITS (astronomy)

# Can open multiple files as one DataFrame
df = vaex.open('data_*.hdf5')   # Wildcards supported
```

**Key characteristics:**
- **Instant for HDF5/Arrow** - Memory-maps files, no loading time
- **Handles large CSVs** - Automatically chunks large CSV files
- **Returns immediately** - Lazy evaluation means no computation until needed

### Format-Specific Loaders

```python
# CSV with options
df = vaex.from_csv(
    'large_file.csv',
    chunk_size=5_000_000,      # Process in chunks
    convert=True,               # Convert to HDF5 automatically
    copy_index=False            # Don't copy pandas index if present
)

# Apache Arrow
df = vaex.open('data.arrow')    # Native support, very fast

# HDF5 (optimal format)
df = vaex.open('data.hdf5')     # Instant loading via memory mapping
```

## Creating DataFrames from Other Sources

### From Pandas

```python
import pandas as pd
import vaex

# Convert pandas DataFrame
pdf = pd.read_csv('data.csv')
df = vaex.from_pandas(pdf, copy_index=False)

# Warning: This loads entire pandas DataFrame into memory
# For large data, prefer vaex.from_csv() directly
```

### From NumPy Arrays

```python
import numpy as np
import vaex

# Single array
x = np.random.rand(1_000_000)
df = vaex.from_arrays(x=x)

# Multiple arrays
x = np.random.rand(1_000_000)
y = np.random.rand(1_000_000)
df = vaex.from_arrays(x=x, y=y)
```

### From Dictionaries

```python
import vaex

# Dictionary of lists/arrays
data = {
    'name': ['Alice', 'Bob', 'Charlie'],
    'age': [25, 30, 35],
    'salary': [50000, 60000, 70000]
}
df = vaex.from_dict(data)
```

### From Arrow Tables

```python
import pyarrow as pa
import vaex

# From Arrow Table
arrow_table = pa.table({
    'x': [1, 2, 3],
    'y': [4, 5, 6]
})
df = vaex.from_arrow_table(arrow_table)
```

## Example Datasets

Vaex provides built-in example datasets for testing:

```python
import vaex

# NYC taxi dataset (~1GB, 11 million rows)
df = vaex.example()

# Smaller datasets
df = vaex.datasets.titanic()
df = vaex.datasets.iris()
```

## Inspecting DataFrames

### Basic Information

```python
# Display first and last rows
print(df)

# Shape (rows, columns)
print(df.shape)  # Returns (row_count, column_count)
print(len(df))   # Row count

# Column names
print(df.columns)
print(df.column_names)

# Data types
print(df.dtypes)

# Memory usage (for materialized columns)
df.byte_size()
```

### Statistical Summary

```python
# Quick statistics for all numeric columns
df.describe()

# Single column statistics
df.x.mean()
df.x.std()
df.x.min()
df.x.max()
df.x.sum()
df.x.count()

# Quantiles
df.x.quantile(0.5)   # Median
df.x.quantile([0.25, 0.5, 0.75])  # Multiple quantiles
```

### Viewing Data

```python
# First/last rows (returns pandas DataFrame)
df.head(10)
df.tail(10)

# Random sample
df.sample(n=100)

# Convert to pandas (careful with large data!)
pdf = df.to_pandas_df()

# Convert specific columns only
pdf = df[['x', 'y']].to_pandas_df()
```

## DataFrame Structure

### Columns

```python
# Access columns as expressions
x_column = df.x
y_column = df['y']

# Column operations return expressions (lazy)
sum_column = df.x + df.y    # Not computed yet

# List all columns
print(df.get_column_names())

# Check column types
print(df.dtypes)

# Virtual vs materialized columns
print(df.get_column_names(virtual=False))  # Materialized only
print(df.get_column_names(virtual=True))   # All columns
```

### Rows

```python
# Row count
row_count = len(df)
row_count = df.count()

# Single row (returns dict)
row = df.row(0)
print(row['column_name'])

# Note: Iterating over rows is NOT recommended in Vaex
# Use vectorized operations instead
```

## Working with Expressions

Expressions are Vaex's way of representing computations that haven't been executed yet:

```python
# Create expressions (no computation)
expr = df.x ** 2 + df.y

# Expressions can be used in many contexts
mean_of_expr = expr.mean()          # Still lazy
df['new_col'] = expr                # Virtual column
filtered = df[expr > 10]            # Selection

# Force evaluation
result = expr.values  # Returns NumPy array (use carefully!)
```

## DataFrame Operations

### Copying

```python
# Shallow copy (shares data)
df_copy = df.copy()

# Deep copy (independent data)
df_deep = df.copy(deep=True)
```

### Trimming/Slicing

```python
# Select row range
df_subset = df[1000:2000]      # Rows 1000-2000
df_subset = df[:1000]          # First 1000 rows
df_subset = df[-1000:]         # Last 1000 rows

# Note: This creates a view, not a copy (efficient)
```

### Concatenating

```python
# Vertical concatenation (combine rows)
df_combined = vaex.concat([df1, df2, df3])

# Horizontal concatenation (combine columns)
# Use join or simply assign columns
df['new_col'] = other_df.some_column
```

## Best Practices

1. **Prefer HDF5 or Arrow formats** - Instant loading, optimal performance
2. **Convert large CSVs to HDF5** - One-time conversion for repeated use
3. **Avoid `.to_pandas_df()` on large data** - Defeats Vaex's purpose
4. **Use expressions instead of `.values`** - Keep operations lazy
5. **Check data types** - Ensure numeric columns aren't string type
6. **Use virtual columns** - Zero memory overhead for derived data

## Common Patterns

### Pattern: One-time CSV to HDF5 Conversion

```python
# Initial conversion (do once)
df = vaex.from_csv('large_data.csv', convert='large_data.hdf5')

# Future loads (instant)
df = vaex.open('large_data.hdf5')
```

### Pattern: Inspecting Large Datasets

```python
import vaex

df = vaex.open('large_file.hdf5')

# Quick overview
print(df)                    # First/last rows
print(df.shape)             # Dimensions
print(df.describe())        # Statistics

# Sample for detailed inspection
sample = df.sample(1000).to_pandas_df()
print(sample.head())
```

### Pattern: Loading Multiple Files

```python
# Load multiple files as one DataFrame
df = vaex.open('data_part*.hdf5')

# Or explicitly concatenate
df1 = vaex.open('data_2020.hdf5')
df2 = vaex.open('data_2021.hdf5')
df_all = vaex.concat([df1, df2])
```

## Common Issues and Solutions

### Issue: CSV Loading is Slow

```python
# Solution: Convert to HDF5 first
df = vaex.from_csv('large.csv', convert='large.hdf5')
# Future loads: df = vaex.open('large.hdf5')
```

### Issue: Column Shows as String Type

```python
# Check type
print(df.dtypes)

# Convert to numeric (creates virtual column)
df['age_numeric'] = df.age.astype('int64')
```

### Issue: Out of Memory on Small Operations

```python
# Likely using .values or .to_pandas_df()
# Solution: Use lazy operations

# Bad (loads into memory)
array = df.x.values

# Good (stays lazy)
mean = df.x.mean()
filtered = df[df.x > 10]
```

## Related Resources

- For data manipulation and filtering: See `data_processing.md`
- For performance optimization: See `performance.md`
- For file format details: See `io_operations.md`
