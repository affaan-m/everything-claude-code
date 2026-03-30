# Genomic Interval Operations

## Overview

polars-bio provides 8 core operations for genomic interval arithmetic. All operations work on Polars DataFrames or LazyFrames containing genomic intervals (columns: `chrom`, `start`, `end` by default) and return a **LazyFrame** by default. Pass `output_type="polars.DataFrame"` for eager results.

## Operations Summary

| Operation | Inputs | Description |
|-----------|--------|-------------|
| `overlap` | two DataFrames | Find pairs of overlapping intervals |
| `count_overlaps` | two DataFrames | Count overlaps per interval in the first set |
| `nearest` | two DataFrames | Find nearest intervals between two sets |
| `merge` | one DataFrame | Merge overlapping/bookended intervals |
| `cluster` | one DataFrame | Assign cluster IDs to overlapping intervals |
| `coverage` | two DataFrames | Compute per-interval coverage counts |
| `complement` | one DataFrame + genome | Find gaps between intervals |
| `subtract` | two DataFrames | Remove overlapping portions |

## overlap

Find pairs of overlapping intervals between two DataFrames.

### Functional API

```python
import polars as pl
import polars_bio as pb

df1 = pl.DataFrame({
    "chrom": ["chr1", "chr1", "chr1"],
    "start": [1, 5, 22],
    "end":   [6, 9, 30],
})

df2 = pl.DataFrame({
    "chrom": ["chr1", "chr1"],
    "start": [3, 25],
    "end":   [8, 28],
})

# Returns LazyFrame by default
result_lf = pb.overlap(df1, df2, suffixes=("_1", "_2"))
result_df = result_lf.collect()

# Or get DataFrame directly
result_df = pb.overlap(df1, df2, suffixes=("_1", "_2"), output_type="polars.DataFrame")
```

### Method-Chaining API (LazyFrame only)

```python
result = df1.lazy().pb.overlap(df2, suffixes=("_1", "_2")).collect()
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `df1` | DataFrame/LazyFrame/str | required | First (probe) interval set |
| `df2` | DataFrame/LazyFrame/str | required | Second (build) interval set |
| `suffixes` | tuple[str, str] | `("_1", "_2")` | Suffixes for overlapping column names |
| `on_cols` | list[str] | `None` | Additional columns to join on (beyond genomic coords) |
| `cols1` | list[str] | `["chrom", "start", "end"]` | Column names in df1 |
| `cols2` | list[str] | `["chrom", "start", "end"]` | Column names in df2 |
| `algorithm` | str | `"Coitrees"` | Interval algorithm |
| `low_memory` | bool | `False` | Low memory mode |
| `output_type` | str | `"polars.LazyFrame"` | Output format: `"polars.LazyFrame"`, `"polars.DataFrame"`, `"pandas.DataFrame"` |
| `projection_pushdown` | bool | `True` | Enable projection pushdown optimization |

### Output Schema

Returns columns from both inputs with suffixes applied:
- `chrom_1`, `start_1`, `end_1` (from df1)
- `chrom_2`, `start_2`, `end_2` (from df2)
- Any additional columns from df1 and df2

Column dtypes are `String` for chrom and `Int64` for start/end.

## count_overlaps

Count the number of overlapping intervals from df2 for each interval in df1.

```python
# Functional
counts = pb.count_overlaps(df1, df2)

# Method-chaining (LazyFrame)
counts = df1.lazy().pb.count_overlaps(df2)
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `df1` | DataFrame/LazyFrame/str | required | Query interval set |
| `df2` | DataFrame/LazyFrame/str | required | Target interval set |
| `suffixes` | tuple[str, str] | `("", "_")` | Suffixes for column names |
| `cols1` | list[str] | `["chrom", "start", "end"]` | Column names in df1 |
| `cols2` | list[str] | `["chrom", "start", "end"]` | Column names in df2 |
| `on_cols` | list[str] | `None` | Additional join columns |
| `output_type` | str | `"polars.LazyFrame"` | Output format |
| `naive_query` | bool | `True` | Use naive query strategy |
| `projection_pushdown` | bool | `True` | Enable projection pushdown |

### Output Schema

Returns df1 columns with an additional `count` column (Int64).

## nearest

Find the nearest interval in df2 for each interval in df1.

```python
# Find nearest (default: k=1, any direction)
nearest = pb.nearest(df1, df2, output_type="polars.DataFrame")

# Find k nearest
nearest = pb.nearest(df1, df2, k=3)

# Exclude overlapping intervals from results
nearest = pb.nearest(df1, df2, overlap=False)

# Without distance column
nearest = pb.nearest(df1, df2, distance=False)
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `df1` | DataFrame/LazyFrame/str | required | Query interval set |
| `df2` | DataFrame/LazyFrame/str | required | Target interval set |
| `suffixes` | tuple[str, str] | `("_1", "_2")` | Suffixes for column names |
| `on_cols` | list[str] | `None` | Additional join columns |
| `cols1` | list[str] | `["chrom", "start", "end"]` | Column names in df1 |
| `cols2` | list[str] | `["chrom", "start", "end"]` | Column names in df2 |
| `k` | int | `1` | Number of nearest neighbors to find |
| `overlap` | bool | `True` | Include overlapping intervals in results |
| `distance` | bool | `True` | Include distance column in output |
| `output_type` | str | `"polars.LazyFrame"` | Output format |
| `projection_pushdown` | bool | `True` | Enable projection pushdown |

### Output Schema

Returns columns from both DataFrames (with suffixes) plus a `distance` column (Int64) with the distance to the nearest interval (0 if overlapping). Distance column is omitted if `distance=False`.

## merge

Merge overlapping and bookended intervals within a single DataFrame.

```python
import polars as pl
import polars_bio as pb

df = pl.DataFrame({
    "chrom": ["chr1", "chr1", "chr1", "chr2"],
    "start": [1, 4, 20, 1],
    "end":   [6, 9, 30, 10],
})

# Functional
merged = pb.merge(df, output_type="polars.DataFrame")

# Method-chaining (LazyFrame)
merged = df.lazy().pb.merge().collect()

# Merge intervals within a minimum distance
merged = pb.merge(df, min_dist=10)
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `df` | DataFrame/LazyFrame/str | required | Interval set to merge |
| `min_dist` | int | `0` | Minimum distance between intervals to merge (0 = must overlap or be bookended) |
| `cols` | list[str] | `["chrom", "start", "end"]` | Column names |
| `on_cols` | list[str] | `None` | Additional grouping columns |
| `output_type` | str | `"polars.LazyFrame"` | Output format |
| `projection_pushdown` | bool | `True` | Enable projection pushdown |

### Output Schema

| Column | Type | Description |
|--------|------|-------------|
| `chrom` | String | Chromosome |
| `start` | Int64 | Merged interval start |
| `end` | Int64 | Merged interval end |
| `n_intervals` | Int64 | Number of intervals merged |

## cluster

Assign cluster IDs to overlapping intervals. Intervals that overlap are assigned the same cluster ID.

```python
# Functional
clustered = pb.cluster(df, output_type="polars.DataFrame")

# Method-chaining (LazyFrame)
clustered = df.lazy().pb.cluster().collect()

# With minimum distance
clustered = pb.cluster(df, min_dist=5)
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `df` | DataFrame/LazyFrame/str | required | Interval set |
| `min_dist` | int | `0` | Minimum distance for clustering |
| `cols` | list[str] | `["chrom", "start", "end"]` | Column names |
| `output_type` | str | `"polars.LazyFrame"` | Output format |
| `projection_pushdown` | bool | `True` | Enable projection pushdown |

### Output Schema

Returns the original columns plus:

| Column | Type | Description |
|--------|------|-------------|
| `cluster` | Int64 | Cluster ID (intervals in the same cluster overlap) |
| `cluster_start` | Int64 | Start of the cluster extent |
| `cluster_end` | Int64 | End of the cluster extent |

## coverage

Compute per-interval coverage counts. This is a **two-input** operation: for each interval in df1, count the coverage from df2.

```python
# Functional
cov = pb.coverage(df1, df2, output_type="polars.DataFrame")

# Method-chaining (LazyFrame)
cov = df1.lazy().pb.coverage(df2).collect()
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `df1` | DataFrame/LazyFrame/str | required | Query intervals |
| `df2` | DataFrame/LazyFrame/str | required | Coverage source intervals |
| `suffixes` | tuple[str, str] | `("_1", "_2")` | Suffixes for column names |
| `on_cols` | list[str] | `None` | Additional join columns |
| `cols1` | list[str] | `["chrom", "start", "end"]` | Column names in df1 |
| `cols2` | list[str] | `["chrom", "start", "end"]` | Column names in df2 |
| `output_type` | str | `"polars.LazyFrame"` | Output format |
| `projection_pushdown` | bool | `True` | Enable projection pushdown |

### Output Schema

Returns columns from df1 plus a `coverage` column (Int64).

## complement

Find gaps between intervals within a genome. Requires a genome definition specifying chromosome sizes.

```python
import polars as pl
import polars_bio as pb

df = pl.DataFrame({
    "chrom": ["chr1", "chr1"],
    "start": [100, 500],
    "end":   [200, 600],
})

genome = pl.DataFrame({
    "chrom": ["chr1"],
    "start": [0],
    "end":   [1000],
})

# Functional
gaps = pb.complement(df, view_df=genome, output_type="polars.DataFrame")

# Method-chaining (LazyFrame)
gaps = df.lazy().pb.complement(genome).collect()
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `df` | DataFrame/LazyFrame/str | required | Interval set |
| `view_df` | DataFrame/LazyFrame | `None` | Genome with chrom, start, end defining chromosome extents |
| `cols` | list[str] | `["chrom", "start", "end"]` | Column names in df |
| `view_cols` | list[str] | `None` | Column names in view_df |
| `output_type` | str | `"polars.LazyFrame"` | Output format |
| `projection_pushdown` | bool | `True` | Enable projection pushdown |

### Output Schema

Returns a DataFrame with `chrom` (String), `start` (Int64), `end` (Int64) columns representing gaps between intervals.

## subtract

Remove portions of intervals in df1 that overlap with intervals in df2.

```python
# Functional
result = pb.subtract(df1, df2, output_type="polars.DataFrame")

# Method-chaining (LazyFrame)
result = df1.lazy().pb.subtract(df2).collect()
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `df1` | DataFrame/LazyFrame/str | required | Intervals to subtract from |
| `df2` | DataFrame/LazyFrame/str | required | Intervals to subtract |
| `cols1` | list[str] | `["chrom", "start", "end"]` | Column names in df1 |
| `cols2` | list[str] | `["chrom", "start", "end"]` | Column names in df2 |
| `output_type` | str | `"polars.LazyFrame"` | Output format |
| `projection_pushdown` | bool | `True` | Enable projection pushdown |

### Output Schema

Returns `chrom` (String), `start` (Int64), `end` (Int64) representing the remaining portions of df1 intervals after subtraction.

## Performance Considerations

### Probe-Build Architecture

Two-input operations (`overlap`, `nearest`, `count_overlaps`, `coverage`, `subtract`) use a probe-build join:
- **Probe** (first DataFrame): Iterated over, row by row
- **Build** (second DataFrame): Indexed into an interval tree for fast lookup

For best performance, pass the **larger** DataFrame as the probe (first argument) and the **smaller** one as the build (second argument).

### Parallelism

By default, polars-bio uses a single execution partition. For large datasets, enable parallel execution:

```python
import os
import polars_bio as pb

pb.set_option("datafusion.execution.target_partitions", os.cpu_count())
```

### Streaming Execution

DataFusion streaming is enabled by default for interval operations. Data is processed in batches, enabling out-of-core computation for datasets larger than available RAM.

### When to Use Lazy Evaluation

Use `scan_*` functions and lazy DataFrames for:
- Files larger than available RAM
- When only a subset of results is needed
- Pipeline operations where intermediate results can be optimized away

```python
# Lazy pipeline
lf1 = pb.scan_bed("large1.bed")
lf2 = pb.scan_bed("large2.bed")
result = pb.overlap(lf1, lf2).collect()
```
