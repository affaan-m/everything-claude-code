# SQL Data Processing

## Overview

polars-bio integrates Apache DataFusion's SQL engine, enabling SQL queries on bioinformatics files and Polars DataFrames. Register files as tables and query them using standard SQL syntax. All queries return a **LazyFrame** — call `.collect()` to materialize results.

## Register Functions

Register bioinformatics files as SQL tables. **Path is the first argument**, name is an optional keyword:

```python
import polars_bio as pb

# Register various file formats (path first, name= keyword)
pb.register_vcf("samples.vcf.gz", name="variants")
pb.register_bed("target_regions.bed", name="regions")
pb.register_bam("aligned.bam", name="alignments")
pb.register_cram("aligned.cram", name="cram_alignments")
pb.register_gff("genes.gff3", name="annotations")
pb.register_gtf("genes.gtf", name="gtf_annotations")
pb.register_fastq("sample.fastq.gz", name="reads")
pb.register_sam("alignments.sam", name="sam_alignments")
pb.register_pairs("contacts.pairs", name="hic_contacts")
```

### Parameters

All `register_*` functions share these parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `path` | str | required (first positional) | Path to file (local or cloud) |
| `name` | str | `None` | Table name for SQL queries (auto-generated if omitted) |
| `chunk_size` | int | `64` | Chunk size for reading |
| `concurrent_fetches` | int | `8` | Concurrent cloud fetches |
| `allow_anonymous` | bool | `True` | Allow anonymous cloud access |
| `max_retries` | int | `5` | Cloud retry count |
| `timeout` | int | `300` | Cloud timeout in seconds |
| `enable_request_payer` | bool | `False` | Requester-pays cloud |
| `compression_type` | str | `"auto"` | Compression type |

Some register functions have additional format-specific parameters (e.g., `info_fields` on `register_vcf`).

**Note:** `register_fasta` does not exist. Use `scan_fasta` + `from_polars` as a workaround.

## from_polars

Register an existing Polars DataFrame as a SQL-queryable table:

```python
import polars as pl
import polars_bio as pb

df = pl.DataFrame({
    "chrom": ["chr1", "chr1", "chr2"],
    "start": [100, 500, 200],
    "end":   [200, 600, 400],
    "name":  ["peak1", "peak2", "peak3"],
})

pb.from_polars("my_peaks", df)

# Now query with SQL
result = pb.sql("SELECT * FROM my_peaks WHERE chrom = 'chr1'").collect()
```

**Important:** `register_view` takes a SQL query string, not a DataFrame. Use `from_polars` to register DataFrames.

## register_view

Create a SQL view from a query string:

```python
import polars_bio as pb

# Create a view from a SQL query
pb.register_view("chr1_variants", "SELECT * FROM variants WHERE chrom = 'chr1'")

# Query the view
result = pb.sql("SELECT * FROM chr1_variants WHERE qual > 30").collect()
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | str | View name |
| `query` | str | SQL query string defining the view |

## pb.sql()

Execute SQL queries using DataFusion SQL syntax. **Returns a LazyFrame** — call `.collect()` to get a DataFrame.

```python
import polars_bio as pb

# Simple query
result = pb.sql("SELECT chrom, start, end FROM regions WHERE chrom = 'chr1'").collect()

# Aggregation
result = pb.sql("""
    SELECT chrom, COUNT(*) as variant_count, AVG(qual) as avg_qual
    FROM variants
    GROUP BY chrom
    ORDER BY variant_count DESC
""").collect()

# Join tables
result = pb.sql("""
    SELECT v.chrom, v.start, v.end, v.ref, v.alt, r.name
    FROM variants v
    JOIN regions r ON v.chrom = r.chrom
        AND v.start >= r.start
        AND v.end <= r.end
""").collect()
```

## DataFusion SQL Syntax

polars-bio uses Apache DataFusion's SQL dialect. Key features:

### Filtering

```sql
SELECT * FROM variants WHERE qual > 30 AND filter = 'PASS'
```

### Aggregations

```sql
SELECT chrom, COUNT(*) as n, MIN(start) as min_pos, MAX(end) as max_pos
FROM regions
GROUP BY chrom
HAVING COUNT(*) > 100
```

### Window Functions

```sql
SELECT chrom, start, end,
    ROW_NUMBER() OVER (PARTITION BY chrom ORDER BY start) as row_num,
    LAG(end) OVER (PARTITION BY chrom ORDER BY start) as prev_end
FROM regions
```

### Subqueries

```sql
SELECT * FROM variants
WHERE chrom IN (SELECT DISTINCT chrom FROM regions)
```

### Common Table Expressions (CTEs)

```sql
WITH filtered_variants AS (
    SELECT * FROM variants WHERE qual > 30
),
chr1_regions AS (
    SELECT * FROM regions WHERE chrom = 'chr1'
)
SELECT f.chrom, f.start, f.ref, f.alt
FROM filtered_variants f
JOIN chr1_regions r ON f.start BETWEEN r.start AND r.end
```

## Combining SQL with Interval Operations

SQL queries return LazyFrames that can be used directly with polars-bio interval operations:

```python
import polars_bio as pb

# Register files
pb.register_vcf("samples.vcf.gz", name="variants")
pb.register_bed("target_regions.bed", name="targets")

# SQL to filter (returns LazyFrame)
high_qual = pb.sql("SELECT chrom, start, end FROM variants WHERE qual > 30").collect()
targets = pb.sql("SELECT chrom, start, end FROM targets WHERE chrom = 'chr1'").collect()

# Interval operation on SQL results
overlapping = pb.overlap(high_qual, targets).collect()
```

## Example Workflows

### Variant Density Analysis

```python
import polars_bio as pb

pb.register_vcf("cohort.vcf.gz", name="variants")
pb.register_bed("genome_windows_1mb.bed", name="windows")

# Count variants per window using SQL
result = pb.sql("""
    SELECT w.chrom, w.start, w.end, COUNT(v.start) as variant_count
    FROM windows w
    LEFT JOIN variants v ON w.chrom = v.chrom
        AND v.start >= w.start
        AND v.start < w.end
    GROUP BY w.chrom, w.start, w.end
    ORDER BY variant_count DESC
""").collect()
```

### Gene Annotation Lookup

```python
import polars_bio as pb

pb.register_gff("gencode.gff3", name="genes")

# Find all protein-coding genes on chromosome 1
coding_genes = pb.sql("""
    SELECT chrom, start, end, attributes
    FROM genes
    WHERE type = 'gene'
        AND chrom = 'chr1'
        AND attributes LIKE '%protein_coding%'
    ORDER BY start
""").collect()
```
