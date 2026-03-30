# Python API Reference

Comprehensive reference for gtars Python bindings.

## Installation

```bash
# Install gtars Python package
uv pip install gtars

# Or with pip
pip install gtars
```

## Core Classes

### RegionSet

Manage collections of genomic intervals:

```python
import gtars

# Create from BED file
regions = gtars.RegionSet.from_bed("regions.bed")

# Create from coordinates
regions = gtars.RegionSet([
    ("chr1", 1000, 2000),
    ("chr1", 3000, 4000),
    ("chr2", 5000, 6000)
])

# Access regions
for region in regions:
    print(f"{region.chromosome}:{region.start}-{region.end}")

# Get region count
num_regions = len(regions)

# Get total coverage
total_coverage = regions.total_coverage()
```

### Region Operations

Perform operations on region sets:

```python
# Sort regions
sorted_regions = regions.sort()

# Merge overlapping regions
merged = regions.merge()

# Filter by size
large_regions = regions.filter_by_size(min_size=1000)

# Filter by chromosome
chr1_regions = regions.filter_by_chromosome("chr1")
```

### Set Operations

Perform set operations on genomic regions:

```python
# Load two region sets
set_a = gtars.RegionSet.from_bed("set_a.bed")
set_b = gtars.RegionSet.from_bed("set_b.bed")

# Union
union = set_a.union(set_b)

# Intersection
intersection = set_a.intersect(set_b)

# Difference
difference = set_a.subtract(set_b)

# Symmetric difference
sym_diff = set_a.symmetric_difference(set_b)
```

## Data Export

### Writing BED Files

Export regions to BED format:

```python
# Write to BED file
regions.to_bed("output.bed")

# Write with scores
regions.to_bed("output.bed", scores=score_array)

# Write with names
regions.to_bed("output.bed", names=name_list)
```

### Format Conversion

Convert between formats:

```python
# BED to JSON
regions = gtars.RegionSet.from_bed("input.bed")
regions.to_json("output.json")

# JSON to BED
regions = gtars.RegionSet.from_json("input.json")
regions.to_bed("output.bed")
```

## NumPy Integration

Seamless integration with NumPy arrays:

```python
import numpy as np

# Export to NumPy arrays
starts = regions.starts_array()  # NumPy array of start positions
ends = regions.ends_array()      # NumPy array of end positions
sizes = regions.sizes_array()    # NumPy array of region sizes

# Create from NumPy arrays
chromosomes = ["chr1"] * len(starts)
regions = gtars.RegionSet.from_arrays(chromosomes, starts, ends)
```

## Parallel Processing

Leverage parallel processing for large datasets:

```python
# Enable parallel processing
regions = gtars.RegionSet.from_bed("large_file.bed", parallel=True)

# Parallel operations
result = regions.parallel_apply(custom_function)
```

## Memory Management

Efficient memory usage for large datasets:

```python
# Stream large BED files
for chunk in gtars.RegionSet.stream_bed("large_file.bed", chunk_size=10000):
    process_chunk(chunk)

# Memory-mapped mode
regions = gtars.RegionSet.from_bed("large_file.bed", mmap=True)
```

## Error Handling

Handle common errors:

```python
try:
    regions = gtars.RegionSet.from_bed("file.bed")
except gtars.FileNotFoundError:
    print("File not found")
except gtars.InvalidFormatError as e:
    print(f"Invalid BED format: {e}")
except gtars.ParseError as e:
    print(f"Parse error at line {e.line}: {e.message}")
```

## Configuration

Configure gtars behavior:

```python
# Set global options
gtars.set_option("parallel.threads", 4)
gtars.set_option("memory.limit", "4GB")
gtars.set_option("warnings.strict", True)

# Context manager for temporary options
with gtars.option_context("parallel.threads", 8):
    # Use 8 threads for this block
    regions = gtars.RegionSet.from_bed("large_file.bed", parallel=True)
```

## Logging

Enable logging for debugging:

```python
import logging

# Enable gtars logging
gtars.set_log_level("DEBUG")

# Or use Python logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger("gtars")
```

## Performance Tips

- Use parallel processing for large datasets
- Enable memory-mapped mode for very large files
- Stream data when possible to reduce memory usage
- Pre-sort regions before operations when applicable
- Use NumPy arrays for numerical computations
- Cache frequently accessed data
