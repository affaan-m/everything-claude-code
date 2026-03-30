# Configuration

## Overview

polars-bio uses a global configuration system based on `set_option` and `get_option` to control execution behavior, coordinate systems, parallelism, and streaming modes.

## set_option / get_option

```python
import polars_bio as pb

# Set a configuration option
pb.set_option("datafusion.execution.target_partitions", 8)

# Get current value
value = pb.get_option("datafusion.execution.target_partitions")
```

## Parallelism

### DataFusion Target Partitions

Controls the number of parallel execution partitions. Defaults to 1 (single-threaded).

```python
import os
import polars_bio as pb

# Use all available CPU cores
pb.set_option("datafusion.execution.target_partitions", os.cpu_count())

# Set specific number of partitions
pb.set_option("datafusion.execution.target_partitions", 8)
```

**When to increase parallelism:**
- Processing large files (>1GB)
- Running interval operations on millions of intervals
- Batch processing multiple chromosomes

**When to keep default (1):**
- Small datasets
- Memory-constrained environments
- Debugging (deterministic execution)

## Coordinate Systems

polars-bio defaults to 1-based coordinates (standard genomic convention).

### Global Coordinate System

```python
import polars_bio as pb

# Switch to 0-based half-open coordinates
pb.set_option("coordinate_system", "0-based")

# Switch back to 1-based (default)
pb.set_option("coordinate_system", "1-based")

# Check current setting
print(pb.get_option("coordinate_system"))
```

### Per-File Override via I/O Functions

I/O functions accept `use_zero_based` to set coordinate metadata on the resulting DataFrame:

```python
# Read with explicit 0-based metadata
df = pb.read_bed("regions.bed", use_zero_based=True)
```

**Note:** Interval operations (overlap, nearest, etc.) do **not** accept `use_zero_based`. They read coordinate metadata from the DataFrames, which is set by I/O functions or the global option. When using manually constructed DataFrames, polars-bio warns about missing metadata and falls back to the global setting.

### Setting Metadata on Manual DataFrames

```python
import polars_bio as pb

# Set coordinate metadata on a manually created DataFrame
pb.set_source_metadata(df, format="bed", path="")
```

### File Format Conventions

| Format | Native Coordinate System | polars-bio Conversion |
|--------|-------------------------|----------------------|
| BED | 0-based half-open | Converted to configured system on read |
| VCF | 1-based | Converted to configured system on read |
| GFF/GTF | 1-based | Converted to configured system on read |
| BAM/SAM | 0-based | Converted to configured system on read |

## Streaming Execution Modes

polars-bio supports two streaming modes for out-of-core processing:

### DataFusion Streaming

Enabled by default for interval operations. Processes data in batches through the DataFusion execution engine.

```python
# DataFusion streaming is automatic for interval operations
result = pb.overlap(lf1, lf2)  # Streams if inputs are LazyFrames
```

### Polars Streaming

Use Polars' native streaming for post-processing operations:

```python
# Collect with Polars streaming
result = lf.collect(streaming=True)
```

### Combining Both

```python
import polars_bio as pb

# Scan files lazily (DataFusion streaming for I/O)
lf1 = pb.scan_bed("large1.bed")
lf2 = pb.scan_bed("large2.bed")

# Interval operation (DataFusion streaming)
result_lf = pb.overlap(lf1, lf2)

# Collect with Polars streaming for final materialization
result = result_lf.collect(streaming=True)
```

## Logging

Control log verbosity for debugging:

```python
import polars_bio as pb

# Set log level
pb.set_loglevel("debug")   # Detailed execution info
pb.set_loglevel("info")    # Standard messages
pb.set_loglevel("warn")    # Warnings only (default)
```

**Note:** Only `"debug"`, `"info"`, and `"warn"` are valid log levels.

## Metadata Management

polars-bio attaches coordinate system and source metadata to DataFrames produced by I/O functions. This metadata is used by interval operations to determine the coordinate system.

```python
import polars_bio as pb

# Inspect metadata on a DataFrame
metadata = pb.get_metadata(df)

# Print metadata summary
pb.print_metadata_summary(df)

# Print metadata as JSON
pb.print_metadata_json(df)

# Set metadata on a manually created DataFrame
pb.set_source_metadata(df, format="bed", path="regions.bed")

# Register a DataFrame as a SQL table
pb.from_polars("my_table", df)
```

## Complete Configuration Reference

| Option | Default | Description |
|--------|---------|-------------|
| `datafusion.execution.target_partitions` | `1` | Number of parallel execution partitions |
| `coordinate_system` | `"1-based"` | Default coordinate system (`"0-based"` or `"1-based"`) |
