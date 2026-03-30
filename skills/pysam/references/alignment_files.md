# Working with Alignment Files (SAM/BAM/CRAM)

## Overview

Pysam provides the `AlignmentFile` class for reading and writing SAM/BAM/CRAM formatted files containing aligned sequence data. BAM/CRAM files support compression and random access through indexing.

## Opening Alignment Files

Specify format via mode qualifier:
- `"rb"` - Read BAM (binary)
- `"r"` - Read SAM (text)
- `"rc"` - Read CRAM (compressed)
- `"wb"` - Write BAM
- `"w"` - Write SAM
- `"wc"` - Write CRAM

```python
import pysam

# Reading
samfile = pysam.AlignmentFile("example.bam", "rb")

# Writing (requires template or header)
outfile = pysam.AlignmentFile("output.bam", "wb", template=samfile)
```

### Stream Processing

Use `"-"` as filename for stdin/stdout operations:

```python
# Read from stdin
infile = pysam.AlignmentFile('-', 'rb')

# Write to stdout
outfile = pysam.AlignmentFile('-', 'w', template=infile)
```

**Important:** Pysam does not support reading/writing from true Python file objects—only stdin/stdout streams are supported.

## AlignmentFile Properties

**Header Information:**
- `references` - List of chromosome/contig names
- `lengths` - Corresponding lengths for each reference
- `header` - Complete header as dictionary

```python
samfile = pysam.AlignmentFile("example.bam", "rb")
print(f"References: {samfile.references}")
print(f"Lengths: {samfile.lengths}")
```

## Reading Reads

### fetch() - Region-Based Retrieval

Retrieves reads overlapping specified genomic regions using **0-based coordinates**.

```python
# Fetch specific region
for read in samfile.fetch("chr1", 1000, 2000):
    print(read.query_name, read.reference_start)

# Fetch entire contig
for read in samfile.fetch("chr1"):
    print(read.query_name)

# Fetch without index (sequential read)
for read in samfile.fetch(until_eof=True):
    print(read.query_name)
```

**Important Notes:**
- Requires index (.bai/.crai) for random access
- Returns reads that **overlap** the region (may extend beyond boundaries)
- Use `until_eof=True` for non-indexed files or sequential reading
- By default, only returns mapped reads
- For unmapped reads, use `fetch("*")` or `until_eof=True`

### Multiple Iterators

When using multiple iterators on the same file:

```python
samfile = pysam.AlignmentFile("example.bam", "rb", multiple_iterators=True)
iter1 = samfile.fetch("chr1", 1000, 2000)
iter2 = samfile.fetch("chr2", 5000, 6000)
```

Without `multiple_iterators=True`, a new fetch() call repositions the file pointer and breaks existing iterators.

### count() - Count Reads in Region

```python
# Count all reads
num_reads = samfile.count("chr1", 1000, 2000)

# Count with quality filter
num_quality_reads = samfile.count("chr1", 1000, 2000, quality=20)
```

### count_coverage() - Per-Base Coverage

Returns four arrays (A, C, G, T) with per-base coverage:

```python
coverage = samfile.count_coverage("chr1", 1000, 2000)
a_counts, c_counts, g_counts, t_counts = coverage
```

## AlignedSegment Objects

Each read is represented as an `AlignedSegment` object with these key attributes:

### Read Information
- `query_name` - Read name/ID
- `query_sequence` - Read sequence (bases)
- `query_qualities` - Base quality scores (ASCII-encoded)
- `query_length` - Length of the read

### Mapping Information
- `reference_name` - Chromosome/contig name
- `reference_start` - Start position (0-based, inclusive)
- `reference_end` - End position (0-based, exclusive)
- `mapping_quality` - MAPQ score
- `cigarstring` - CIGAR string (e.g., "100M")
- `cigartuples` - CIGAR as list of (operation, length) tuples

**Important:** `cigartuples` format differs from SAM specification. Operations are integers:
- 0 = M (match/mismatch)
- 1 = I (insertion)
- 2 = D (deletion)
- 3 = N (skipped reference)
- 4 = S (soft clipping)
- 5 = H (hard clipping)
- 6 = P (padding)
- 7 = = (sequence match)
- 8 = X (sequence mismatch)

### Flags and Status
- `flag` - SAM flag as integer
- `is_paired` - Is read paired?
- `is_proper_pair` - Is read in a proper pair?
- `is_unmapped` - Is read unmapped?
- `mate_is_unmapped` - Is mate unmapped?
- `is_reverse` - Is read on reverse strand?
- `mate_is_reverse` - Is mate on reverse strand?
- `is_read1` - Is this read1?
- `is_read2` - Is this read2?
- `is_secondary` - Is secondary alignment?
- `is_qcfail` - Did read fail QC?
- `is_duplicate` - Is read a duplicate?
- `is_supplementary` - Is supplementary alignment?

### Tags and Optional Fields
- `get_tag(tag)` - Get value of optional field
- `set_tag(tag, value)` - Set optional field
- `has_tag(tag)` - Check if tag exists
- `get_tags()` - Get all tags as list of tuples

```python
for read in samfile.fetch("chr1", 1000, 2000):
    if read.has_tag("NM"):
        edit_distance = read.get_tag("NM")
        print(f"{read.query_name}: NM={edit_distance}")
```

## Writing Alignment Files

### Creating Header

```python
header = {
    'HD': {'VN': '1.0'},
    'SQ': [
        {'LN': 1575, 'SN': 'chr1'},
        {'LN': 1584, 'SN': 'chr2'}
    ]
}

outfile = pysam.AlignmentFile("output.bam", "wb", header=header)
```

### Creating AlignedSegment Objects

```python
# Create new read
a = pysam.AlignedSegment()
a.query_name = "read001"
a.query_sequence = "AGCTTAGCTAGCTACCTATATCTTGGTCTTGGCCG"
a.flag = 0
a.reference_id = 0  # Index into header['SQ']
a.reference_start = 100
a.mapping_quality = 20
a.cigar = [(0, 35)]  # 35M
a.query_qualities = pysam.qualitystring_to_array("IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII")

# Write to file
outfile.write(a)
```

### Converting Between Formats

```python
# BAM to SAM
infile = pysam.AlignmentFile("input.bam", "rb")
outfile = pysam.AlignmentFile("output.sam", "w", template=infile)
for read in infile:
    outfile.write(read)
infile.close()
outfile.close()
```

## Pileup Analysis

The `pileup()` method provides **column-wise** (position-by-position) analysis across a region:

```python
for pileupcolumn in samfile.pileup("chr1", 1000, 2000):
    print(f"Position {pileupcolumn.pos}: coverage = {pileupcolumn.nsegments}")

    for pileupread in pileupcolumn.pileups:
        if not pileupread.is_del and not pileupread.is_refskip:
            # Query position is the position in the read
            base = pileupread.alignment.query_sequence[pileupread.query_position]
            print(f"  {pileupread.alignment.query_name}: {base}")
```

**Key attributes:**
- `pileupcolumn.pos` - 0-based reference position
- `pileupcolumn.nsegments` - Number of reads covering position
- `pileupread.alignment` - The AlignedSegment object
- `pileupread.query_position` - Position in the read (None for deletions)
- `pileupread.is_del` - Is this a deletion?
- `pileupread.is_refskip` - Is this a reference skip (N in CIGAR)?

**Important:** Keep iterator references alive. The error "PileupProxy accessed after iterator finished" occurs when iterators go out of scope prematurely.

## Coordinate System

**Critical:** Pysam uses **0-based, half-open** coordinates (Python convention):
- `reference_start` is 0-based (first base is 0)
- `reference_end` is exclusive (not included in range)
- Region from 1000-2000 includes bases 1000-1999

**Exception:** Region strings in `fetch()` and `pileup()` follow samtools conventions (1-based):
```python
# These are equivalent:
samfile.fetch("chr1", 999, 2000)  # Python style: 0-based
samfile.fetch("chr1:1000-2000")   # samtools style: 1-based
```

## Indexing

Create BAM index:
```python
pysam.index("example.bam")
```

Or use command-line interface:
```python
pysam.samtools.index("example.bam")
```

## Performance Tips

1. **Use indexed access** when querying specific regions repeatedly
2. **Use `pileup()` for column-wise analysis** instead of repeated fetch operations
3. **Use `fetch(until_eof=True)` for sequential reading** of non-indexed files
4. **Avoid multiple iterators** unless necessary (performance cost)
5. **Use `count()` for simple counting** instead of iterating and counting manually

## Common Pitfalls

1. **Partial overlaps:** `fetch()` returns reads that overlap region boundaries—implement explicit filtering if exact boundaries are needed
2. **Quality score editing:** Cannot edit `query_qualities` in place after modifying `query_sequence`. Create a copy first: `quals = read.query_qualities`
3. **Missing index:** `fetch()` without `until_eof=True` requires an index file
4. **Thread safety:** While pysam releases GIL during I/O, comprehensive thread-safety hasn't been fully validated
5. **Iterator scope:** Keep pileup iterator references alive to avoid "PileupProxy accessed after iterator finished" errors
