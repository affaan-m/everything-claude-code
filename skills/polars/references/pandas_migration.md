# Pandas to Polars Migration Guide

This guide helps you migrate from pandas to Polars with comprehensive operation mappings and key differences.

## Core Conceptual Differences

### 1. No Index System

**Pandas:** Uses row-based indexing system
```python
df.loc[0, "column"]
df.iloc[0:5]
df.set_index("id")
```

**Polars:** Uses integer positions only
```python
df[0, "column"]  # Row position, column name
df[0:5]  # Row slice
# No set_index equivalent - use group_by instead
```

### 2. Memory Format

**Pandas:** Row-oriented NumPy arrays
**Polars:** Columnar Apache Arrow format

**Implications:**
- Polars is faster for column operations
- Polars uses less memory
- Polars has better data sharing capabilities

### 3. Parallelization

**Pandas:** Primarily single-threaded (requires Dask for parallelism)
**Polars:** Parallel by default using Rust's concurrency

### 4. Lazy Evaluation

**Pandas:** Only eager evaluation
**Polars:** Both eager (DataFrame) and lazy (LazyFrame) with query optimization

### 5. Type Strictness

**Pandas:** Allows silent type conversions
**Polars:** Strict typing, explicit casts required

**Example:**
```python
# Pandas: Silently converts to float
pd_df["int_col"] = [1, 2, None, 4]  # dtype: float64

# Polars: Keeps as integer with null
pl_df = pl.DataFrame({"int_col": [1, 2, None, 4]})  # dtype: Int64
```

## Operation Mappings

### Data Selection

| Operation | Pandas | Polars |
|-----------|--------|--------|
| Select column | `df["col"]` or `df.col` | `df.select("col")` or `df["col"]` |
| Select multiple | `df[["a", "b"]]` | `df.select("a", "b")` |
| Select by position | `df.iloc[:, 0:3]` | `df.select(pl.col(df.columns[0:3]))` |
| Select by condition | `df[df["age"] > 25]` | `df.filter(pl.col("age") > 25)` |

### Data Filtering

| Operation | Pandas | Polars |
|-----------|--------|--------|
| Single condition | `df[df["age"] > 25]` | `df.filter(pl.col("age") > 25)` |
| Multiple conditions | `df[(df["age"] > 25) & (df["city"] == "NY")]` | `df.filter(pl.col("age") > 25, pl.col("city") == "NY")` |
| Query method | `df.query("age > 25")` | `df.filter(pl.col("age") > 25)` |
| isin | `df[df["city"].isin(["NY", "LA"])]` | `df.filter(pl.col("city").is_in(["NY", "LA"]))` |
| isna | `df[df["value"].isna()]` | `df.filter(pl.col("value").is_null())` |
| notna | `df[df["value"].notna()]` | `df.filter(pl.col("value").is_not_null())` |

### Adding/Modifying Columns

| Operation | Pandas | Polars |
|-----------|--------|--------|
| Add column | `df["new"] = df["old"] * 2` | `df.with_columns(new=pl.col("old") * 2)` |
| Multiple columns | `df.assign(a=..., b=...)` | `df.with_columns(a=..., b=...)` |
| Conditional column | `np.where(condition, a, b)` | `pl.when(condition).then(a).otherwise(b)` |

**Important difference - Parallel execution:**

```python
# Pandas: Sequential (lambda sees previous results)
df.assign(
    a=lambda df_: df_.value * 10,
    b=lambda df_: df_.value * 100
)

# Polars: Parallel (all computed together)
df.with_columns(
    a=pl.col("value") * 10,
    b=pl.col("value") * 100
)
```

### Grouping and Aggregation

| Operation | Pandas | Polars |
|-----------|--------|--------|
| Group by | `df.groupby("col")` | `df.group_by("col")` |
| Agg single | `df.groupby("col")["val"].mean()` | `df.group_by("col").agg(pl.col("val").mean())` |
| Agg multiple | `df.groupby("col").agg({"val": ["mean", "sum"]})` | `df.group_by("col").agg(pl.col("val").mean(), pl.col("val").sum())` |
| Size | `df.groupby("col").size()` | `df.group_by("col").agg(pl.len())` |
| Count | `df.groupby("col").count()` | `df.group_by("col").agg(pl.col("*").count())` |

### Window Functions

| Operation | Pandas | Polars |
|-----------|--------|--------|
| Transform | `df.groupby("col").transform("mean")` | `df.with_columns(pl.col("val").mean().over("col"))` |
| Rank | `df.groupby("col")["val"].rank()` | `df.with_columns(pl.col("val").rank().over("col"))` |
| Shift | `df.groupby("col")["val"].shift(1)` | `df.with_columns(pl.col("val").shift(1).over("col"))` |
| Cumsum | `df.groupby("col")["val"].cumsum()` | `df.with_columns(pl.col("val").cum_sum().over("col"))` |

### Joins

| Operation | Pandas | Polars |
|-----------|--------|--------|
| Inner join | `df1.merge(df2, on="id")` | `df1.join(df2, on="id", how="inner")` |
| Left join | `df1.merge(df2, on="id", how="left")` | `df1.join(df2, on="id", how="left")` |
| Different keys | `df1.merge(df2, left_on="a", right_on="b")` | `df1.join(df2, left_on="a", right_on="b")` |

### Concatenation

| Operation | Pandas | Polars |
|-----------|--------|--------|
| Vertical | `pd.concat([df1, df2], axis=0)` | `pl.concat([df1, df2], how="vertical")` |
| Horizontal | `pd.concat([df1, df2], axis=1)` | `pl.concat([df1, df2], how="horizontal")` |

### Sorting

| Operation | Pandas | Polars |
|-----------|--------|--------|
| Sort by column | `df.sort_values("col")` | `df.sort("col")` |
| Descending | `df.sort_values("col", ascending=False)` | `df.sort("col", descending=True)` |
| Multiple columns | `df.sort_values(["a", "b"])` | `df.sort("a", "b")` |

### Reshaping

| Operation | Pandas | Polars |
|-----------|--------|--------|
| Pivot | `df.pivot(index="a", columns="b", values="c")` | `df.pivot(values="c", index="a", columns="b")` |
| Melt | `df.melt(id_vars="id")` | `df.unpivot(index="id")` |

### I/O Operations

| Operation | Pandas | Polars |
|-----------|--------|--------|
| Read CSV | `pd.read_csv("file.csv")` | `pl.read_csv("file.csv")` or `pl.scan_csv()` |
| Write CSV | `df.to_csv("file.csv")` | `df.write_csv("file.csv")` |
| Read Parquet | `pd.read_parquet("file.parquet")` | `pl.read_parquet("file.parquet")` |
| Write Parquet | `df.to_parquet("file.parquet")` | `df.write_parquet("file.parquet")` |
| Read Excel | `pd.read_excel("file.xlsx")` | `pl.read_excel("file.xlsx")` |

### String Operations

| Operation | Pandas | Polars |
|-----------|--------|--------|
| Upper | `df["col"].str.upper()` | `df.select(pl.col("col").str.to_uppercase())` |
| Lower | `df["col"].str.lower()` | `df.select(pl.col("col").str.to_lowercase())` |
| Contains | `df["col"].str.contains("pattern")` | `df.filter(pl.col("col").str.contains("pattern"))` |
| Replace | `df["col"].str.replace("old", "new")` | `df.select(pl.col("col").str.replace("old", "new"))` |
| Split | `df["col"].str.split(" ")` | `df.select(pl.col("col").str.split(" "))` |

### Datetime Operations

| Operation | Pandas | Polars |
|-----------|--------|--------|
| Parse dates | `pd.to_datetime(df["col"])` | `df.select(pl.col("col").str.strptime(pl.Date, "%Y-%m-%d"))` |
| Year | `df["date"].dt.year` | `df.select(pl.col("date").dt.year())` |
| Month | `df["date"].dt.month` | `df.select(pl.col("date").dt.month())` |
| Day | `df["date"].dt.day` | `df.select(pl.col("date").dt.day())` |

### Missing Data

| Operation | Pandas | Polars |
|-----------|--------|--------|
| Drop nulls | `df.dropna()` | `df.drop_nulls()` |
| Fill nulls | `df.fillna(0)` | `df.fill_null(0)` |
| Check null | `df["col"].isna()` | `df.select(pl.col("col").is_null())` |
| Forward fill | `df.fillna(method="ffill")` | `df.select(pl.col("col").fill_null(strategy="forward"))` |

### Other Operations

| Operation | Pandas | Polars |
|-----------|--------|--------|
| Unique values | `df["col"].unique()` | `df["col"].unique()` |
| Value counts | `df["col"].value_counts()` | `df["col"].value_counts()` |
| Describe | `df.describe()` | `df.describe()` |
| Sample | `df.sample(n=100)` | `df.sample(n=100)` |
| Head | `df.head()` | `df.head()` |
| Tail | `df.tail()` | `df.tail()` |

## Common Migration Patterns

### Pattern 1: Chained Operations

**Pandas:**
```python
result = (df
    .assign(new_col=lambda x: x["old_col"] * 2)
    .query("new_col > 10")
    .groupby("category")
    .agg({"value": "sum"})
    .reset_index()
)
```

**Polars:**
```python
result = (df
    .with_columns(new_col=pl.col("old_col") * 2)
    .filter(pl.col("new_col") > 10)
    .group_by("category")
    .agg(pl.col("value").sum())
)
# No reset_index needed - Polars doesn't have index
```

### Pattern 2: Apply Functions

**Pandas:**
```python
# Avoid in Polars - breaks parallelization
df["result"] = df["value"].apply(lambda x: x * 2)
```

**Polars:**
```python
# Use expressions instead
df = df.with_columns(result=pl.col("value") * 2)

# If custom function needed
df = df.with_columns(
    result=pl.col("value").map_elements(lambda x: x * 2, return_dtype=pl.Float64)
)
```

### Pattern 3: Conditional Column Creation

**Pandas:**
```python
df["category"] = np.where(
    df["value"] > 100,
    "high",
    np.where(df["value"] > 50, "medium", "low")
)
```

**Polars:**
```python
df = df.with_columns(
    category=pl.when(pl.col("value") > 100)
        .then("high")
        .when(pl.col("value") > 50)
        .then("medium")
        .otherwise("low")
)
```

### Pattern 4: Group Transform

**Pandas:**
```python
df["group_mean"] = df.groupby("category")["value"].transform("mean")
```

**Polars:**
```python
df = df.with_columns(
    group_mean=pl.col("value").mean().over("category")
)
```

### Pattern 5: Multiple Aggregations

**Pandas:**
```python
result = df.groupby("category").agg({
    "value": ["mean", "sum", "count"],
    "price": ["min", "max"]
})
```

**Polars:**
```python
result = df.group_by("category").agg(
    pl.col("value").mean().alias("value_mean"),
    pl.col("value").sum().alias("value_sum"),
    pl.col("value").count().alias("value_count"),
    pl.col("price").min().alias("price_min"),
    pl.col("price").max().alias("price_max")
)
```

## Performance Anti-Patterns to Avoid

### Anti-Pattern 1: Sequential Pipe Operations

**Bad (disables parallelization):**
```python
df = df.pipe(function1).pipe(function2).pipe(function3)
```

**Good (enables parallelization):**
```python
df = df.with_columns(
    function1_result(),
    function2_result(),
    function3_result()
)
```

### Anti-Pattern 2: Python Functions in Hot Paths

**Bad:**
```python
df = df.with_columns(
    result=pl.col("value").map_elements(lambda x: x * 2)
)
```

**Good:**
```python
df = df.with_columns(result=pl.col("value") * 2)
```

### Anti-Pattern 3: Using Eager Reading for Large Files

**Bad:**
```python
df = pl.read_csv("large_file.csv")
result = df.filter(pl.col("age") > 25).select("name", "age")
```

**Good:**
```python
lf = pl.scan_csv("large_file.csv")
result = lf.filter(pl.col("age") > 25).select("name", "age").collect()
```

### Anti-Pattern 4: Row Iteration

**Bad:**
```python
for row in df.iter_rows():
    # Process row
    pass
```

**Good:**
```python
# Use vectorized operations
df = df.with_columns(
    # Vectorized computation
)
```

## Migration Checklist

When migrating from pandas to Polars:

1. **Remove index operations** - Use integer positions or group_by
2. **Replace apply/map with expressions** - Use Polars native operations
3. **Update column assignment** - Use `with_columns()` instead of direct assignment
4. **Change groupby.transform to .over()** - Window functions work differently
5. **Update string operations** - Use `.str.to_uppercase()` instead of `.str.upper()`
6. **Add explicit type casts** - Polars won't silently convert types
7. **Consider lazy evaluation** - Use `scan_*` instead of `read_*` for large data
8. **Update aggregation syntax** - More explicit in Polars
9. **Remove reset_index calls** - Not needed in Polars
10. **Update conditional logic** - Use `when().then().otherwise()` pattern

## Compatibility Layer

For gradual migration, you can use both libraries:

```python
import pandas as pd
import polars as pl

# Convert pandas to Polars
pl_df = pl.from_pandas(pd_df)

# Convert Polars to pandas
pd_df = pl_df.to_pandas()

# Use Arrow for zero-copy (when possible)
pl_df = pl.from_arrow(pd_df)
pd_df = pl_df.to_arrow().to_pandas()
```

## When to Stick with Pandas

Consider staying with pandas when:
- Working with time series requiring complex index operations
- Need extensive ecosystem support (some libraries only support pandas)
- Team lacks Rust/Polars expertise
- Data is small and performance isn't critical
- Using advanced pandas features without Polars equivalents

## When to Switch to Polars

Switch to Polars when:
- Performance is critical
- Working with large datasets (>1GB)
- Need lazy evaluation and query optimization
- Want better type safety
- Need parallel execution by default
- Starting a new project
