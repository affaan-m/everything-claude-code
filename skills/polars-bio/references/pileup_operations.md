# Pileup Operations

## Overview

polars-bio provides the `pb.depth()` function for computing per-base or per-block read depth from BAM/CRAM files. It uses CIGAR-aware depth calculation to accurately account for insertions, deletions, and clipping. Returns a **LazyFrame** by default.

## pb.depth()

Compute read depth from alignment files.

### Basic Usage

```python
import polars_bio as pb

# Compute depth across entire BAM file (returns LazyFrame)
depth_lf = pb.depth("aligned.bam")
depth_df = depth_lf.collect()

# Get DataFrame directly
depth_df = pb.depth("aligned.bam", output_type="polars.DataFrame")
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `path` | str | required | Path to BAM or CRAM file |
| `filter_flag` | int | `1796` | SAM flag filter (default excludes unmapped, secondary, duplicate, QC-fail) |
| `min_mapping_quality` | int | `0` | Minimum mapping quality to include reads |
| `binary_cigar` | bool | `True` | Use binary CIGAR for faster processing |
| `dense_mode` | str | `"auto"` | Dense output mode |
| `use_zero_based` | bool | `None` | Coordinate system (None = use global setting) |
| `per_base` | bool | `False` | Per-base depth (True) vs block depth (False) |
| `output_type` | str | `"polars.LazyFrame"` | Output format: `"polars.LazyFrame"`, `"polars.DataFrame"`, `"pandas.DataFrame"` |

### Output Schema (Block Mode, default)

When `per_base=False` (default), adjacent positions with the same depth are grouped into blocks:

| Column | Type | Description |
|--------|------|-------------|
| `contig` | String | Chromosome/contig name |
| `pos_start` | Int64 | Block start position |
| `pos_end` | Int64 | Block end position |
| `coverage` | Int16 | Read depth |

### Output Schema (Per-Base Mode)

When `per_base=True`, each position is reported individually:

| Column | Type | Description |
|--------|------|-------------|
| `contig` | String | Chromosome/contig name |
| `pos` | Int64 | Position |
| `coverage` | Int16 | Read depth at position |

### filter_flag

The default `filter_flag=1796` excludes reads with these SAM flags:
- 4: unmapped
- 256: secondary alignment
- 512: failed QC
- 1024: PCR/optical duplicate

### CIGAR-Aware Computation

`pb.depth()` correctly handles CIGAR operations:
- **M/X/=** (match/mismatch): Counted as coverage
- **D** (deletion): Counted as coverage (reads span the deletion)
- **N** (skipped region): Not counted (e.g., spliced alignments)
- **I** (insertion): Not counted at reference positions
- **S/H** (soft/hard clipping): Not counted

## Examples

### Whole-Genome Depth

```python
import polars_bio as pb
import polars as pl

# Compute depth genome-wide (block mode)
depth = pb.depth("sample.bam", output_type="polars.DataFrame")

# Summary statistics
depth.select(
    pl.col("coverage").cast(pl.Int64).mean().alias("mean_depth"),
    pl.col("coverage").cast(pl.Int64).median().alias("median_depth"),
    pl.col("coverage").cast(pl.Int64).max().alias("max_depth"),
)
```

### Per-Base Depth

```python
import polars_bio as pb

# Per-base depth (one row per position)
depth = pb.depth("sample.bam", per_base=True, output_type="polars.DataFrame")
```

### Depth with Quality Filters

```python
import polars_bio as pb

# Only count well-mapped reads
depth = pb.depth(
    "sample.bam",
    min_mapping_quality=20,
    output_type="polars.DataFrame",
)
```

### Custom Flag Filter

```python
import polars_bio as pb

# Only exclude unmapped (4) and duplicate (1024) reads
depth = pb.depth(
    "sample.bam",
    filter_flag=4 + 1024,
    output_type="polars.DataFrame",
)
```

## Integration with Interval Operations

Depth results can be used with polars-bio interval operations. Note that depth output uses `contig`/`pos_start`/`pos_end` column names, so use `cols` parameters to map them:

```python
import polars_bio as pb
import polars as pl

# Compute depth
depth = pb.depth("sample.bam", output_type="polars.DataFrame")

# Rename columns to match interval operation conventions
depth_intervals = depth.rename({
    "contig": "chrom",
    "pos_start": "start",
    "pos_end": "end",
})

# Find regions with adequate coverage
adequate = depth_intervals.filter(pl.col("coverage") >= 30)

# Merge adjacent adequate-coverage blocks
merged = pb.merge(adequate, output_type="polars.DataFrame")

# Find gaps in coverage (complement)
genome = pl.DataFrame({
    "chrom": ["chr1"],
    "start": [0],
    "end": [248956422],
})
gaps = pb.complement(adequate, view_df=genome, output_type="polars.DataFrame")
```

### Using cols Parameters Instead of Renaming

```python
import polars_bio as pb

depth = pb.depth("sample.bam", output_type="polars.DataFrame")
targets = pb.read_bed("targets.bed")

# Use cols1 to specify depth column names
overlapping = pb.overlap(
    depth, targets,
    cols1=["contig", "pos_start", "pos_end"],
    output_type="polars.DataFrame",
)
```
