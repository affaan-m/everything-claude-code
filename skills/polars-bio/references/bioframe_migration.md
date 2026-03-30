# Migrating from bioframe to polars-bio

## Overview

polars-bio is a drop-in replacement for bioframe's core interval operations, offering 6.5-38x speedups on real-world genomic benchmarks. The main differences are: Polars DataFrames instead of pandas, a Rust/DataFusion backend instead of pure Python, streaming support for large genomes, and LazyFrame returns by default.

## Operation Mapping

| bioframe | polars-bio | Notes |
|----------|------------|-------|
| `bioframe.overlap(df1, df2)` | `pb.overlap(df1, df2)` | Returns LazyFrame; `.collect()` for DataFrame |
| `bioframe.closest(df1, df2)` | `pb.nearest(df1, df2)` | Renamed; uses `k`, `overlap`, `distance` params |
| `bioframe.count_overlaps(df1, df2)` | `pb.count_overlaps(df1, df2)` | Default suffixes differ: `("", "_")` vs bioframe's |
| `bioframe.merge(df)` | `pb.merge(df)` | Output includes `n_intervals` column |
| `bioframe.cluster(df)` | `pb.cluster(df)` | Output cols: `cluster`, `cluster_start`, `cluster_end` |
| `bioframe.coverage(df1, df2)` | `pb.coverage(df1, df2)` | Two-input in both libraries |
| `bioframe.complement(df, chromsizes)` | `pb.complement(df, view_df=genome)` | Genome as DataFrame, not Series |
| `bioframe.subtract(df1, df2)` | `pb.subtract(df1, df2)` | Same semantics |

## Key API Differences

### DataFrames: pandas vs Polars

**bioframe (pandas):**
```python
import bioframe
import pandas as pd

df1 = pd.DataFrame({
    "chrom": ["chr1", "chr1"],
    "start": [1, 10],
    "end":   [5, 20],
})

result = bioframe.overlap(df1, df2)
# result is a pandas DataFrame
result["start_1"]  # pandas column access
```

**polars-bio (Polars):**
```python
import polars_bio as pb
import polars as pl

df1 = pl.DataFrame({
    "chrom": ["chr1", "chr1"],
    "start": [1, 10],
    "end":   [5, 20],
})

result = pb.overlap(df1, df2)  # Returns LazyFrame
result_df = result.collect()   # Materialize to DataFrame
result_df.select("start_1")   # Polars column access
```

### Return Types: LazyFrame by Default

All polars-bio operations return a **LazyFrame** by default. Use `.collect()` or `output_type="polars.DataFrame"`:

```python
# bioframe: always returns DataFrame
result = bioframe.overlap(df1, df2)

# polars-bio: returns LazyFrame, collect for DataFrame
result_lf = pb.overlap(df1, df2)
result_df = result_lf.collect()

# Or get DataFrame directly
result_df = pb.overlap(df1, df2, output_type="polars.DataFrame")
```

### Genome/Chromsizes

**bioframe:**
```python
chromsizes = bioframe.fetch_chromsizes("hg38")  # Returns pandas Series
complement = bioframe.complement(df, chromsizes)
```

**polars-bio:**
```python
genome = pl.DataFrame({
    "chrom": ["chr1", "chr2"],
    "start": [0, 0],
    "end":   [248956422, 242193529],
})
complement = pb.complement(df, view_df=genome)
```

### closest vs nearest

**bioframe:**
```python
result = bioframe.closest(df1, df2)
```

**polars-bio:**
```python
# Basic nearest
result = pb.nearest(df1, df2)

# Find k nearest neighbors
result = pb.nearest(df1, df2, k=3)

# Exclude overlapping intervals
result = pb.nearest(df1, df2, overlap=False)

# Without distance column
result = pb.nearest(df1, df2, distance=False)
```

### Method-Chaining (polars-bio only)

polars-bio adds a `.pb` accessor on **LazyFrame** for method chaining:

```python
# bioframe: sequential function calls
merged = bioframe.merge(bioframe.overlap(df1, df2))

# polars-bio: fluent pipeline (must use LazyFrame)
# Note: overlap adds suffixes, so rename before merge
merged = (
    df1.lazy()
    .pb.overlap(df2)
    .select(
        pl.col("chrom_1").alias("chrom"),
        pl.col("start_1").alias("start"),
        pl.col("end_1").alias("end"),
    )
    .pb.merge()
    .collect()
)
```

## Performance Comparison

Benchmarks on real-world genomic datasets (from the polars-bio paper, Bioinformatics 2025):

| Operation | bioframe | polars-bio | Speedup |
|-----------|----------|------------|---------|
| overlap | 1.0x | 6.5x | 6.5x |
| nearest | 1.0x | 38x | 38x |
| merge | 1.0x | 8.2x | 8.2x |
| coverage | 1.0x | 12x | 12x |

Speedups come from:
- Rust-based interval tree implementation
- Apache DataFusion query engine
- Apache Arrow columnar memory format
- Parallel execution (when configured)
- Streaming/out-of-core support

## Migration Code Examples

### Example 1: Basic Overlap Pipeline

**Before (bioframe):**
```python
import bioframe
import pandas as pd

df1 = pd.read_csv("peaks.bed", sep="\t", names=["chrom", "start", "end"])
df2 = pd.read_csv("genes.bed", sep="\t", names=["chrom", "start", "end", "name"])

overlaps = bioframe.overlap(df1, df2, suffixes=("_peak", "_gene"))
filtered = overlaps[overlaps["start_gene"] > 10000]
merged = bioframe.merge(filtered[["chrom_peak", "start_peak", "end_peak"]]
    .rename(columns={"chrom_peak": "chrom", "start_peak": "start", "end_peak": "end"}))
```

**After (polars-bio):**
```python
import polars_bio as pb
import polars as pl

df1 = pb.read_bed("peaks.bed")
df2 = pb.read_bed("genes.bed")

overlaps = pb.overlap(df1, df2, suffixes=("_peak", "_gene"), output_type="polars.DataFrame")
filtered = overlaps.filter(pl.col("start_gene") > 10000)
merged = pb.merge(
    filtered.select(
        pl.col("chrom_peak").alias("chrom"),
        pl.col("start_peak").alias("start"),
        pl.col("end_peak").alias("end"),
    ),
    output_type="polars.DataFrame",
)
```

### Example 2: Large-Scale Streaming

**Before (bioframe) — limited to in-memory:**
```python
import bioframe
import pandas as pd

# Must load entire file into memory
df1 = pd.read_csv("huge_intervals.bed", sep="\t", names=["chrom", "start", "end"])
result = bioframe.merge(df1)  # Memory-bound
```

**After (polars-bio) — streaming:**
```python
import polars_bio as pb

# Lazy scan, streaming execution
lf = pb.scan_bed("huge_intervals.bed")
result = pb.merge(lf).collect(streaming=True)
```

## pandas Compatibility Mode

For gradual migration, install with pandas support:

```bash
pip install polars-bio[pandas]
```

This enables conversion between pandas and Polars DataFrames:

```python
import polars_bio as pb
import polars as pl

# Convert pandas DataFrame to Polars for polars-bio
polars_df = pl.from_pandas(pandas_df)
result = pb.overlap(polars_df, other_df).collect()

# Convert back to pandas if needed
pandas_result = result.to_pandas()

# Or request pandas output directly
pandas_result = pb.overlap(polars_df, other_df, output_type="pandas.DataFrame")
```

## Migration Checklist

1. Replace `import bioframe` with `import polars_bio as pb`
2. Replace `import pandas as pd` with `import polars as pl`
3. Convert DataFrame creation from `pd.DataFrame` to `pl.DataFrame`
4. Replace `bioframe.closest` with `pb.nearest`
5. Add `.collect()` after operations (they return LazyFrame by default)
6. Update column access from `df["col"]` to `df.select("col")` or `pl.col("col")`
7. Replace pandas filtering `df[df["col"] > x]` with `df.filter(pl.col("col") > x)`
8. Update chromsizes from Series to DataFrame with `chrom`, `start`, `end`; pass as `view_df=`
9. Add `pb.set_option("datafusion.execution.target_partitions", N)` for parallelism
10. Replace `pd.read_csv` for BED files with `pb.read_bed` or `pb.scan_bed`
11. Note `cluster` output column is `cluster` (not `cluster_id`), plus `cluster_start`, `cluster_end`
12. Note `merge` output includes `n_intervals` column
