# Coverage Analysis with Uniwig

The uniwig module generates coverage tracks from sequencing data, providing efficient conversion of genomic intervals to coverage profiles.

## Coverage Track Generation

Create coverage tracks from BED files:

```python
import gtars

# Generate coverage from BED file
coverage = gtars.uniwig.coverage_from_bed("fragments.bed")

# Generate coverage with specific resolution
coverage = gtars.uniwig.coverage_from_bed("fragments.bed", resolution=10)

# Generate strand-specific coverage
fwd_coverage = gtars.uniwig.coverage_from_bed("fragments.bed", strand="+")
rev_coverage = gtars.uniwig.coverage_from_bed("fragments.bed", strand="-")
```

## CLI Usage

Generate coverage tracks from command line:

```bash
# Generate coverage track
gtars uniwig generate --input fragments.bed --output coverage.wig

# Specify resolution
gtars uniwig generate --input fragments.bed --output coverage.wig --resolution 10

# Generate BigWig format
gtars uniwig generate --input fragments.bed --output coverage.bw --format bigwig

# Strand-specific coverage
gtars uniwig generate --input fragments.bed --output forward.wig --strand +
gtars uniwig generate --input fragments.bed --output reverse.wig --strand -
```

## Working with Coverage Data

### Accessing Coverage Values

Query coverage at specific positions:

```python
# Get coverage at position
cov = coverage.get_coverage("chr1", 1000)

# Get coverage over range
cov_array = coverage.get_coverage_range("chr1", 1000, 2000)

# Get coverage statistics
mean_cov = coverage.mean_coverage("chr1", 1000, 2000)
max_cov = coverage.max_coverage("chr1", 1000, 2000)
```

### Coverage Operations

Perform operations on coverage tracks:

```python
# Normalize coverage
normalized = coverage.normalize()

# Smooth coverage
smoothed = coverage.smooth(window_size=10)

# Combine coverage tracks
combined = coverage1.add(coverage2)

# Compute coverage difference
diff = coverage1.subtract(coverage2)
```

## Output Formats

Uniwig supports multiple output formats:

### WIG Format

Standard wiggle format:
```
fixedStep chrom=chr1 start=1000 step=1
12
15
18
22
...
```

### BigWig Format

Binary format for efficient storage and access:
```bash
# Generate BigWig
gtars uniwig generate --input fragments.bed --output coverage.bw --format bigwig
```

### BedGraph Format

Flexible format for variable coverage:
```
chr1    1000    1001    12
chr1    1001    1002    15
chr1    1002    1003    18
```

## Use Cases

### ATAC-seq Analysis

Generate chromatin accessibility profiles:

```python
# Generate ATAC-seq coverage
atac_fragments = gtars.RegionSet.from_bed("atac_fragments.bed")
coverage = gtars.uniwig.coverage_from_bed("atac_fragments.bed", resolution=1)

# Identify accessible regions
peaks = coverage.call_peaks(threshold=10)
```

### ChIP-seq Peak Visualization

Create coverage tracks for ChIP-seq data:

```bash
# Generate coverage for visualization
gtars uniwig generate --input chip_seq_fragments.bed \
                      --output chip_coverage.bw \
                      --format bigwig
```

### RNA-seq Coverage

Compute read coverage for RNA-seq:

```python
# Generate strand-specific RNA-seq coverage
fwd = gtars.uniwig.coverage_from_bed("rnaseq.bed", strand="+")
rev = gtars.uniwig.coverage_from_bed("rnaseq.bed", strand="-")

# Export for IGV
fwd.to_bigwig("rnaseq_fwd.bw")
rev.to_bigwig("rnaseq_rev.bw")
```

### Differential Coverage Analysis

Compare coverage between samples:

```python
# Generate coverage for two samples
control = gtars.uniwig.coverage_from_bed("control.bed")
treatment = gtars.uniwig.coverage_from_bed("treatment.bed")

# Compute fold change
fold_change = treatment.divide(control)

# Find differential regions
diff_regions = fold_change.find_regions(threshold=2.0)
```

## Performance Optimization

- Use appropriate resolution for data scale
- BigWig format recommended for large datasets
- Parallel processing available for multiple chromosomes
- Memory-efficient streaming for large files
