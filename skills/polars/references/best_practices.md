# Polars Best Practices and Performance Guide

Comprehensive guide to writing efficient Polars code and avoiding common pitfalls.

## Performance Optimization

### 1. Use Lazy Evaluation

**Always prefer lazy mode for large datasets:**

```python
# Bad: Eager mode loads everything immediately
df = pl.read_csv("large_file.csv")
result = df.filter(pl.col("age") > 25).select("name", "age")

# Good: Lazy mode optimizes before execution
lf = pl.scan_csv("large_file.csv")
result = lf.filter(pl.col("age") > 25).select("name", "age").collect()
```

**Benefits of lazy evaluation:**
- Predicate pushdown (filter at source)
- Projection pushdown (read only needed columns)
- Query optimization
- Parallel execution planning

### 2. Filter and Select Early

Push filters and column selection as early as possible in the pipeline:

```python
# Bad: Process all data, then filter and select
result = (
    lf.group_by("category")
    .agg(pl.col("value").mean())
    .join(other, on="category")
    .filter(pl.col("value") > 100)
    .select("category", "value")
)

# Good: Filter and select early
result = (
    lf.select("category", "value")  # Only needed columns
    .filter(pl.col("value") > 100)  # Filter early
    .group_by("category")
    .agg(pl.col("value").mean())
    .join(other.select("category", "other_col"), on="category")
)
```

### 3. Avoid Python Functions

Stay within the expression API to maintain parallelization:

```python
# Bad: Python function disables parallelization
df = df.with_columns(
    result=pl.col("value").map_elements(lambda x: x * 2, return_dtype=pl.Float64)
)

# Good: Use native expressions (parallelized)
df = df.with_columns(result=pl.col("value") * 2)
```

**When you must use custom functions:**
```python
# If truly needed, be explicit
df = df.with_columns(
    result=pl.col("value").map_elements(
        custom_function,
        return_dtype=pl.Float64,
        skip_nulls=True  # Optimize null handling
    )
)
```

### 4. Use Streaming for Very Large Data

Enable streaming for datasets larger than RAM:

```python
# Streaming mode processes data in chunks
lf = pl.scan_parquet("very_large.parquet")
result = lf.filter(pl.col("value") > 100).collect(streaming=True)

# Or use sink for direct streaming writes
lf.filter(pl.col("value") > 100).sink_parquet("output.parquet")
```

### 5. Optimize Data Types

Choose appropriate data types to reduce memory and improve performance:

```python
# Bad: Default types may be wasteful
df = pl.read_csv("data.csv")

# Good: Specify optimal types
df = pl.read_csv(
    "data.csv",
    dtypes={
        "id": pl.UInt32,  # Instead of Int64 if values fit
        "category": pl.Categorical,  # For low-cardinality strings
        "date": pl.Date,  # Instead of String
        "small_int": pl.Int16,  # Instead of Int64
    }
)
```

**Type optimization guidelines:**
- Use smallest integer type that fits your data
- Use `Categorical` for strings with low cardinality (<50% unique)
- Use `Date` instead of `Datetime` when time isn't needed
- Use `Boolean` instead of integers for binary flags

### 6. Parallel Operations

Structure code to maximize parallelization:

```python
# Bad: Sequential pipe operations disable parallelization
df = (
    df.pipe(operation1)
    .pipe(operation2)
    .pipe(operation3)
)

# Good: Combined operations enable parallelization
df = df.with_columns(
    result1=operation1_expr(),
    result2=operation2_expr(),
    result3=operation3_expr()
)
```

### 7. Rechunk After Concatenation

```python
# Concatenation can fragment data
combined = pl.concat([df1, df2, df3])

# Rechunk for better performance in subsequent operations
combined = pl.concat([df1, df2, df3], rechunk=True)
```

## Expression Patterns

### Conditional Logic

**Simple conditions:**
```python
df.with_columns(
    status=pl.when(pl.col("age") >= 18)
        .then("adult")
        .otherwise("minor")
)
```

**Multiple conditions:**
```python
df.with_columns(
    grade=pl.when(pl.col("score") >= 90)
        .then("A")
        .when(pl.col("score") >= 80)
        .then("B")
        .when(pl.col("score") >= 70)
        .then("C")
        .when(pl.col("score") >= 60)
        .then("D")
        .otherwise("F")
)
```

**Complex conditions:**
```python
df.with_columns(
    category=pl.when(
        (pl.col("revenue") > 1000000) & (pl.col("customers") > 100)
    )
    .then("enterprise")
    .when(
        (pl.col("revenue") > 100000) | (pl.col("customers") > 50)
    )
    .then("business")
    .otherwise("starter")
)
```

### Null Handling

**Check for nulls:**
```python
df.filter(pl.col("value").is_null())
df.filter(pl.col("value").is_not_null())
```

**Fill nulls:**
```python
# Constant value
df.with_columns(pl.col("value").fill_null(0))

# Forward fill
df.with_columns(pl.col("value").fill_null(strategy="forward"))

# Backward fill
df.with_columns(pl.col("value").fill_null(strategy="backward"))

# Mean
df.with_columns(pl.col("value").fill_null(strategy="mean"))

# Per-group fill
df.with_columns(
    pl.col("value").fill_null(pl.col("value").mean()).over("group")
)
```

**Coalesce (first non-null):**
```python
df.with_columns(
    combined=pl.coalesce(["col1", "col2", "col3"])
)
```

### Column Selection Patterns

**By name:**
```python
df.select("col1", "col2", "col3")
```

**By pattern:**
```python
# Regex
df.select(pl.col("^sales_.*$"))

# Starts with
df.select(pl.col("^sales"))

# Ends with
df.select(pl.col("_total$"))

# Contains
df.select(pl.col(".*revenue.*"))
```

**By type:**
```python
# All numeric columns
df.select(pl.col(pl.NUMERIC_DTYPES))

# All string columns
df.select(pl.col(pl.Utf8))

# Multiple types
df.select(pl.col(pl.NUMERIC_DTYPES, pl.Boolean))
```

**Exclude columns:**
```python
df.select(pl.all().exclude("id", "timestamp"))
```

**Transform multiple columns:**
```python
# Apply same operation to multiple columns
df.select(
    pl.col("^sales_.*$") * 1.1  # 10% increase to all sales columns
)
```

### Aggregation Patterns

**Multiple aggregations:**
```python
df.group_by("category").agg(
    pl.col("value").sum().alias("total"),
    pl.col("value").mean().alias("average"),
    pl.col("value").std().alias("std_dev"),
    pl.col("id").count().alias("count"),
    pl.col("id").n_unique().alias("unique_count"),
    pl.col("value").min().alias("minimum"),
    pl.col("value").max().alias("maximum"),
    pl.col("value").quantile(0.5).alias("median"),
    pl.col("value").quantile(0.95).alias("p95")
)
```

**Conditional aggregations:**
```python
df.group_by("category").agg(
    # Count high values
    (pl.col("value") > 100).sum().alias("high_count"),

    # Average of filtered values
    pl.col("value").filter(pl.col("active")).mean().alias("active_avg"),

    # Conditional sum
    pl.when(pl.col("status") == "completed")
        .then(pl.col("amount"))
        .otherwise(0)
        .sum()
        .alias("completed_total")
)
```

**Grouped transformations:**
```python
df.with_columns(
    # Group statistics
    group_mean=pl.col("value").mean().over("category"),
    group_std=pl.col("value").std().over("category"),

    # Rank within groups
    rank=pl.col("value").rank().over("category"),

    # Percentage of group total
    pct_of_group=(pl.col("value") / pl.col("value").sum().over("category")) * 100
)
```

## Common Pitfalls and Anti-Patterns

### Pitfall 1: Row Iteration

```python
# Bad: Never iterate rows
for row in df.iter_rows():
    # Process row
    result = row[0] * 2

# Good: Use vectorized operations
df = df.with_columns(result=pl.col("value") * 2)
```

### Pitfall 2: Modifying in Place

```python
# Bad: Polars is immutable, this doesn't work as expected
df["new_col"] = df["old_col"] * 2  # May work but not recommended

# Good: Functional style
df = df.with_columns(new_col=pl.col("old_col") * 2)
```

### Pitfall 3: Not Using Expressions

```python
# Bad: String-based operations
df.select("value * 2")  # Won't work

# Good: Expression-based
df.select(pl.col("value") * 2)
```

### Pitfall 4: Inefficient Joins

```python
# Bad: Join large tables without filtering
result = large_df1.join(large_df2, on="id")

# Good: Filter before joining
result = (
    large_df1.filter(pl.col("active"))
    .join(
        large_df2.filter(pl.col("status") == "valid"),
        on="id"
    )
)
```

### Pitfall 5: Not Specifying Types

```python
# Bad: Let Polars infer everything
df = pl.read_csv("data.csv")

# Good: Specify types for correctness and performance
df = pl.read_csv(
    "data.csv",
    dtypes={"id": pl.Int64, "date": pl.Date, "category": pl.Categorical}
)
```

### Pitfall 6: Creating Many Small DataFrames

```python
# Bad: Many operations creating intermediate DataFrames
df1 = df.filter(pl.col("age") > 25)
df2 = df1.select("name", "age")
df3 = df2.sort("age")
result = df3.head(10)

# Good: Chain operations
result = (
    df.filter(pl.col("age") > 25)
    .select("name", "age")
    .sort("age")
    .head(10)
)

# Better: Use lazy mode
result = (
    df.lazy()
    .filter(pl.col("age") > 25)
    .select("name", "age")
    .sort("age")
    .head(10)
    .collect()
)
```

## Memory Management

### Monitor Memory Usage

```python
# Check DataFrame size
print(f"Estimated size: {df.estimated_size('mb'):.2f} MB")

# Profile memory during operations
lf = pl.scan_csv("large.csv")
print(lf.explain())  # See query plan
```

### Reduce Memory Footprint

```python
# 1. Use lazy mode
lf = pl.scan_parquet("data.parquet")

# 2. Stream results
result = lf.collect(streaming=True)

# 3. Select only needed columns
lf = lf.select("col1", "col2")

# 4. Optimize data types
df = df.with_columns(
    pl.col("int_col").cast(pl.Int32),  # Downcast if possible
    pl.col("category").cast(pl.Categorical)  # For low cardinality
)

# 5. Drop columns not needed
df = df.drop("large_text_col", "unused_col")
```

## Testing and Debugging

### Inspect Query Plans

```python
lf = pl.scan_csv("data.csv")
query = lf.filter(pl.col("age") > 25).select("name", "age")

# View the optimized query plan
print(query.explain())

# View detailed query plan
print(query.explain(optimized=True))
```

### Sample Data for Development

```python
# Use n_rows for testing
df = pl.read_csv("large.csv", n_rows=1000)

# Or sample after reading
df_sample = df.sample(n=1000, seed=42)
```

### Validate Schemas

```python
# Check schema
print(df.schema)

# Ensure schema matches expectation
expected_schema = {
    "id": pl.Int64,
    "name": pl.Utf8,
    "date": pl.Date
}

assert df.schema == expected_schema
```

### Profile Performance

```python
import time

# Time operations
start = time.time()
result = lf.collect()
print(f"Execution time: {time.time() - start:.2f}s")

# Compare eager vs lazy
start = time.time()
df_eager = pl.read_csv("data.csv").filter(pl.col("age") > 25)
eager_time = time.time() - start

start = time.time()
df_lazy = pl.scan_csv("data.csv").filter(pl.col("age") > 25).collect()
lazy_time = time.time() - start

print(f"Eager: {eager_time:.2f}s, Lazy: {lazy_time:.2f}s")
```

## File Format Best Practices

### Choose the Right Format

**Parquet:**
- Best for: Large datasets, archival, data lakes
- Pros: Excellent compression, columnar, fast reads
- Cons: Not human-readable

**CSV:**
- Best for: Small datasets, human inspection, legacy systems
- Pros: Universal, human-readable
- Cons: Slow, large file size, no type preservation

**Arrow IPC:**
- Best for: Inter-process communication, temporary storage
- Pros: Fastest, zero-copy, preserves all types
- Cons: Less compression than Parquet

### File Reading Best Practices

```python
# 1. Use lazy reading
lf = pl.scan_parquet("data.parquet")  # Not read_parquet

# 2. Read multiple files efficiently
lf = pl.scan_parquet("data/*.parquet")  # Parallel reading

# 3. Specify schema when known
lf = pl.scan_csv(
    "data.csv",
    dtypes={"id": pl.Int64, "date": pl.Date}
)

# 4. Use predicate pushdown
result = lf.filter(pl.col("date") >= "2023-01-01").collect()
```

### File Writing Best Practices

```python
# 1. Use Parquet for large data
df.write_parquet("output.parquet", compression="zstd")

# 2. Partition large datasets
df.write_parquet("output", partition_by=["year", "month"])

# 3. Use streaming for very large writes
lf.sink_parquet("output.parquet")  # Streaming write

# 4. Optimize compression
df.write_parquet(
    "output.parquet",
    compression="snappy",  # Fast compression
    statistics=True  # Enable predicate pushdown on read
)
```

## Code Organization

### Reusable Expressions

```python
# Define reusable expressions
age_group = (
    pl.when(pl.col("age") < 18)
    .then("minor")
    .when(pl.col("age") < 65)
    .then("adult")
    .otherwise("senior")
)

revenue_per_customer = pl.col("revenue") / pl.col("customer_count")

# Use in multiple contexts
df = df.with_columns(
    age_group=age_group,
    rpc=revenue_per_customer
)

# Reuse in filtering
df = df.filter(revenue_per_customer > 100)
```

### Pipeline Functions

```python
def clean_data(lf: pl.LazyFrame) -> pl.LazyFrame:
    """Clean and standardize data."""
    return lf.with_columns(
        pl.col("name").str.to_uppercase(),
        pl.col("date").str.strptime(pl.Date, "%Y-%m-%d"),
        pl.col("amount").fill_null(0)
    )

def add_features(lf: pl.LazyFrame) -> pl.LazyFrame:
    """Add computed features."""
    return lf.with_columns(
        month=pl.col("date").dt.month(),
        year=pl.col("date").dt.year(),
        amount_log=pl.col("amount").log()
    )

# Compose pipeline
result = (
    pl.scan_csv("data.csv")
    .pipe(clean_data)
    .pipe(add_features)
    .filter(pl.col("year") == 2023)
    .collect()
)
```

## Documentation

Always document complex expressions and transformations:

```python
# Good: Document intent
df = df.with_columns(
    # Calculate customer lifetime value as sum of purchases
    # divided by months since first purchase
    clv=(
        pl.col("total_purchases") /
        ((pl.col("last_purchase_date") - pl.col("first_purchase_date"))
         .dt.total_days() / 30)
    )
)
```

## Version Compatibility

```python
# Check Polars version
import polars as pl
print(pl.__version__)

# Feature availability varies by version
# Document version requirements for production code
```
