---
name: polars-bio
description: High-performance genomic interval operations and bioinformatics file I/O on Polars DataFrames. Overlap, nearest, merge, coverage, complement, subtract for BED/VCF/BAM/GFF intervals. Streaming, cloud-native, faster bioframe alternative.
license: https://github.com/biodatageeks/polars-bio/blob/main/LICENSE
metadata:
    skill-author: K-Dense Inc.
---

# polars-bio

## Overview

polars-bio is a high-performance Python library for genomic interval operations and bioinformatics file I/O, built on Polars, Apache Arrow, and Apache DataFusion. It provides a familiar DataFrame-centric API for interval arithmetic (overlap, nearest, merge, coverage, complement, subtract) and reading/writing common bioinformatics formats (BED, VCF, BAM, CRAM, GFF/GTF, FASTA, FASTQ).

Key value propositions:
- **6-38x faster** than bioframe on real-world genomic benchmarks
- **Streaming/out-of-core** support for large genomes via DataFusion
- **Cloud-native** file I/O (S3, GCS, Azure) with predicate pushdown
- **Two API styles**: functional (`pb.overlap(df1, df2)`) and method-chaining (`df1.lazy().pb.overlap(df2)`)
- **SQL interface** for genomic data via DataFusion SQL engine

## When to Use This Skill

Use this skill when:
- Performing genomic interval operations (overlap, nearest, merge, coverage, complement, subtract)
- Reading/writing bioinformatics file formats (BED, VCF, BAM, CRAM, GFF/GTF, FASTA, FASTQ)
- Processing large genomic datasets that don't fit in memory (streaming mode)
- Running SQL queries on genomic data files
- Migrating from bioframe to a faster alternative
- Computing read depth/pileup from BAM/CRAM files
- Working with Polars DataFrames containing genomic intervals

## Quick Start

### Installation

```bash
pip install polars-bio
# or
uv pip install polars-bio
```

For pandas compatibility:
```bash
pip install polars-bio[pandas]
```

### Basic Overlap Example

```python
import polars as pl
import polars_bio as pb

# Create two interval DataFrames
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

# Functional API (returns LazyFrame by default)
result = pb.overlap(df1, df2)
result_df = result.collect()

# Get a DataFrame directly
result_df = pb.overlap(df1, df2, output_type="polars.DataFrame")

# Method-chaining API (via .pb accessor on LazyFrame)
result = df1.lazy().pb.overlap(df2)
result_df = result.collect()
```

### Reading a BED File

```python
import polars_bio as pb

# Eager read (loads entire file)
df = pb.read_bed("regions.bed")

# Lazy scan (streaming, for large files)
lf = pb.scan_bed("regions.bed")
result = lf.collect()
```

## Core Capabilities

### 1. Genomic Interval Operations

polars-bio provides 8 core interval operations for genomic range arithmetic. All operations accept Polars DataFrames with `chrom`, `start`, `end` columns (configurable). All operations return a `LazyFrame` by default (use `output_type="polars.DataFrame"` for eager results).

**Operations:**
- `overlap` / `count_overlaps` - Find or count overlapping intervals between two sets
- `nearest` - Find nearest intervals (with configurable `k`, `overlap`, `distance` params)
- `merge` - Merge overlapping/bookended intervals within a set
- `cluster` - Assign cluster IDs to overlapping intervals
- `coverage` - Compute per-interval coverage counts (two-input operation)
- `complement` - Find gaps between intervals within a genome
- `subtract` - Remove portions of intervals that overlap another set

**Example:**
```python
import polars_bio as pb

# Find overlapping intervals (returns LazyFrame)
result = pb.overlap(df1, df2, suffixes=("_1", "_2"))

# Count overlaps per interval
counts = pb.count_overlaps(df1, df2)

# Merge overlapping intervals
merged = pb.merge(df1)

# Find nearest intervals
nearest = pb.nearest(df1, df2)

# Collect any LazyFrame result to DataFrame
result_df = result.collect()
```

**Reference:** See `references/interval_operations.md` for detailed documentation on all operations, parameters, output schemas, and performance considerations.

### 2. Bioinformatics File I/O

Read and write common bioinformatics formats with `read_*`, `scan_*`, `write_*`, and `sink_*` functions. Supports cloud storage (S3, GCS, Azure) and compression (GZIP, BGZF).

**Supported formats:**
- **BED** - Genomic intervals (`read_bed`, `scan_bed`, `write_*` via generic)
- **VCF** - Genetic variants (`read_vcf`, `scan_vcf`, `write_vcf`, `sink_vcf`)
- **BAM** - Aligned reads (`read_bam`, `scan_bam`, `write_bam`, `sink_bam`)
- **CRAM** - Compressed alignments (`read_cram`, `scan_cram`, `write_cram`, `sink_cram`)
- **GFF** - Gene annotations (`read_gff`, `scan_gff`)
- **GTF** - Gene annotations (`read_gtf`, `scan_gtf`)
- **FASTA** - Reference sequences (`read_fasta`, `scan_fasta`)
- **FASTQ** - Sequencing reads (`read_fastq`, `scan_fastq`, `write_fastq`, `sink_fastq`)
- **SAM** - Text alignments (`read_sam`, `scan_sam`, `write_sam`, `sink_sam`)
- **Hi-C pairs** - Chromatin contacts (`read_pairs`, `scan_pairs`)

**Example:**
```python
import polars_bio as pb

# Read VCF file
variants = pb.read_vcf("samples.vcf.gz")

# Lazy scan BAM file (streaming)
alignments = pb.scan_bam("aligned.bam")

# Read GFF annotations
genes = pb.read_gff("annotations.gff3")

# Cloud storage (individual params, not a dict)
df = pb.read_bed("s3://bucket/regions.bed",
                 allow_anonymous=True)
```

**Reference:** See `references/file_io.md` for per-format column schemas, parameters, cloud storage options, and compression support.

### 3. SQL Data Processing

Register bioinformatics files as tables and query them using DataFusion SQL. Combines the power of SQL with polars-bio's genomic-aware readers.

```python
import polars as pl
import polars_bio as pb

# Register files as SQL tables (path first, name= keyword)
pb.register_vcf("samples.vcf.gz", name="variants")
pb.register_bed("target_regions.bed", name="regions")

# Query with SQL (returns LazyFrame)
result = pb.sql("SELECT chrom, start, end, ref, alt FROM variants WHERE qual > 30")
result_df = result.collect()

# Register a Polars DataFrame as a SQL table
pb.from_polars("my_intervals", df)
result = pb.sql("SELECT * FROM my_intervals WHERE chrom = 'chr1'").collect()
```

**Reference:** See `references/sql_processing.md` for register functions, SQL syntax, and examples.

### 4. Pileup Operations

Compute per-base read depth from BAM/CRAM files with CIGAR-aware depth calculation.

```python
import polars_bio as pb

# Compute depth across a BAM file
depth_lf = pb.depth("aligned.bam")
depth_df = depth_lf.collect()

# With quality filter
depth_lf = pb.depth("aligned.bam", min_mapping_quality=20)
```

**Reference:** See `references/pileup_operations.md` for parameters and integration patterns.

## Key Concepts

### Coordinate Systems

polars-bio defaults to **1-based** coordinates (genomic convention). This can be changed globally:

```python
import polars_bio as pb

# Switch to 0-based coordinates
pb.set_option("coordinate_system", "0-based")

# Switch back to 1-based (default)
pb.set_option("coordinate_system", "1-based")
```

I/O functions also accept `use_zero_based` to set coordinate metadata on the resulting DataFrame:

```python
# Read BED with explicit 0-based metadata
df = pb.read_bed("regions.bed", use_zero_based=True)
```

**Important:** BED files are always 0-based half-open in the file format. polars-bio handles the conversion automatically when reading BED files. Coordinate metadata is attached to DataFrames by I/O functions and propagated through operations.

### Two API Styles

**Functional API** - standalone functions, explicit inputs:
```python
result = pb.overlap(df1, df2, suffixes=("_1", "_2"))
merged = pb.merge(df)
```

**Method-chaining API** - via `.pb` accessor on **LazyFrames** (not DataFrames):
```python
result = df1.lazy().pb.overlap(df2)
merged = df.lazy().pb.merge()
```

**Important:** The `.pb` accessor for interval operations is only available on `LazyFrame`. On `DataFrame`, `.pb` provides write operations only (`write_bam`, `write_vcf`, etc.).

Method-chaining enables fluent pipelines:
```python
# Chain interval operations (note: overlap outputs suffixed columns,
# so rename before merge which expects chrom/start/end)
result = (
    df1.lazy()
    .pb.overlap(df2)
    .filter(pl.col("start_2") > 1000)
    .select(
        pl.col("chrom_1").alias("chrom"),
        pl.col("start_1").alias("start"),
        pl.col("end_1").alias("end"),
    )
    .pb.merge()
    .collect()
)
```

### Probe-Build Architecture

For two-input operations (overlap, nearest, count_overlaps, coverage), polars-bio uses a probe-build join strategy:
- The **first** DataFrame is the **probe** (iterated over)
- The **second** DataFrame is the **build** (indexed for lookup)

For best performance, pass the larger DataFrame as the first argument (probe) and the smaller one as the second (build).

### Column Conventions

By default, polars-bio expects columns named `chrom`, `start`, `end`. Custom column names can be specified via lists:

```python
result = pb.overlap(
    df1, df2,
    cols1=["chromosome", "begin", "finish"],
    cols2=["chr", "pos_start", "pos_end"],
)
```

### Return Types and Collecting Results

All interval operations and `pb.sql()` return a **LazyFrame** by default. Use `.collect()` to materialize results, or pass `output_type="polars.DataFrame"` for eager evaluation:

```python
# Lazy (default) - collect when needed
result_lf = pb.overlap(df1, df2)
result_df = result_lf.collect()

# Eager - get DataFrame directly
result_df = pb.overlap(df1, df2, output_type="polars.DataFrame")
```

### Streaming and Out-of-Core Processing

For datasets larger than available RAM, use `scan_*` functions and streaming execution:

```python
# Scan files lazily
lf = pb.scan_bed("large_intervals.bed")

# Process with streaming
result = lf.collect(streaming=True)
```

DataFusion streaming is enabled by default for interval operations, processing data in batches without loading the full dataset into memory.

## Common Pitfalls

1. **`.pb` accessor on DataFrame vs LazyFrame:** Interval operations (overlap, merge, etc.) are only on `LazyFrame.pb`. `DataFrame.pb` only has write methods. Use `.lazy()` to convert before chaining interval ops.

2. **LazyFrame returns:** All interval operations and `pb.sql()` return `LazyFrame` by default. Don't forget `.collect()` or use `output_type="polars.DataFrame"`.

3. **Column name mismatches:** polars-bio expects `chrom`, `start`, `end` by default. Use `cols1`/`cols2` parameters (as lists) if your columns have different names.

4. **Coordinate system metadata:** When constructing DataFrames manually (not via `read_*`/`scan_*`), polars-bio warns about missing coordinate metadata. Use `pb.set_option("coordinate_system", "0-based")` globally, or use I/O functions that set metadata automatically.

5. **Probe-build order matters:** For overlap, nearest, and coverage, the first DataFrame is probed against the second. Swapping arguments changes which intervals appear in the left vs right output columns, and can affect performance.

6. **INT32 position limit:** Genomic positions are stored as 32-bit integers, limiting coordinates to ~2.1 billion. This is sufficient for all known genomes but may be an issue with custom coordinate spaces.

7. **BAM index requirements:** `read_bam` and `scan_bam` require a `.bai` index file alongside the BAM. Create one with `samtools index` if missing.

8. **Parallel execution disabled by default:** DataFusion parallelism defaults to 1 partition. Enable for large datasets:
   ```python
   pb.set_option("datafusion.execution.target_partitions", 8)
   ```

9. **CRAM has separate functions:** Use `read_cram`/`scan_cram`/`register_cram` for CRAM files (not `read_bam`). CRAM functions require a `reference_path` parameter.

## Best Practices

1. **Use `scan_*` for large files:** Prefer `scan_bed`, `scan_vcf`, etc. over `read_*` for files larger than available RAM. Scan functions enable streaming and predicate pushdown.

2. **Configure parallelism for large datasets:**
   ```python
   import os
   pb.set_option("datafusion.execution.target_partitions", os.cpu_count())
   ```

3. **Use BGZF compression:** BGZF-compressed files (`.bed.gz`, `.vcf.gz`) support parallel block decompression, significantly faster than plain GZIP.

4. **Select columns early:** When only specific columns are needed, select them early to reduce memory usage:
   ```python
   df = pb.read_vcf("large.vcf.gz").select("chrom", "start", "end", "ref", "alt")
   ```

5. **Use cloud paths directly:** Pass S3/GCS/Azure URIs directly to read/scan functions instead of downloading files first:
   ```python
   df = pb.read_bed("s3://my-bucket/regions.bed", allow_anonymous=True)
   ```

6. **Prefer functional API for single operations, method-chaining for pipelines:** Use `pb.overlap()` for one-off operations and `.lazy().pb.overlap()` when building multi-step pipelines.

## Resources

### references/

Detailed documentation for each major capability:

- **interval_operations.md** - All 8 interval operations with parameters, examples, output schemas, and performance tips. Core reference for genomic range arithmetic.

- **file_io.md** - Supported formats table, per-format column schemas, cloud storage configuration, compression support, and common parameters.

- **sql_processing.md** - Register functions, DataFusion SQL syntax, combining SQL with interval operations, and example queries.

- **pileup_operations.md** - Per-base read depth computation from BAM/CRAM files, parameters, and integration with interval operations.

- **configuration.md** - Global settings (parallelism, coordinate systems, streaming modes), logging, and metadata management.

- **bioframe_migration.md** - Operation mapping table, API differences, performance comparison, migration code examples, and pandas compatibility mode.
