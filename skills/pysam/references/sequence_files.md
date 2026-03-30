# Working with Sequence Files (FASTA/FASTQ)

## FASTA Files

### Overview

Pysam provides the `FastaFile` class for indexed, random access to FASTA reference sequences. FASTA files must be indexed with `samtools faidx` before use.

### Opening FASTA Files

```python
import pysam

# Open indexed FASTA file
fasta = pysam.FastaFile("reference.fasta")

# Automatically looks for reference.fasta.fai index
```

### Creating FASTA Index

```python
# Create index using pysam
pysam.faidx("reference.fasta")

# Or using samtools command
pysam.samtools.faidx("reference.fasta")
```

This creates a `.fai` index file required for random access.

### FastaFile Properties

```python
fasta = pysam.FastaFile("reference.fasta")

# List of reference sequences
references = fasta.references
print(f"References: {references}")

# Get lengths
lengths = fasta.lengths
print(f"Lengths: {lengths}")

# Get specific sequence length
chr1_length = fasta.get_reference_length("chr1")
```

### Fetching Sequences

#### Fetch by Region

Uses **0-based, half-open** coordinates:

```python
# Fetch specific region
sequence = fasta.fetch("chr1", 1000, 2000)
print(f"Sequence: {sequence}")  # Returns 1000 bases

# Fetch entire chromosome
chr1_seq = fasta.fetch("chr1")

# Fetch using region string (1-based)
sequence = fasta.fetch(region="chr1:1001-2000")
```

**Important:** Numeric arguments use 0-based coordinates, region strings use 1-based coordinates (samtools convention).

#### Common Use Cases

```python
# Get sequence at variant position
def get_variant_context(fasta, chrom, pos, window=10):
    """Get sequence context around a variant position (1-based)."""
    start = max(0, pos - window - 1)  # Convert to 0-based
    end = pos + window
    return fasta.fetch(chrom, start, end)

# Get sequence for gene coordinates
def get_gene_sequence(fasta, chrom, start, end, strand):
    """Get gene sequence with strand awareness."""
    seq = fasta.fetch(chrom, start, end)

    if strand == "-":
        # Reverse complement
        complement = str.maketrans("ATGCatgc", "TACGtacg")
        seq = seq.translate(complement)[::-1]

    return seq

# Check reference allele
def check_ref_allele(fasta, chrom, pos, expected_ref):
    """Verify reference allele at position (1-based pos)."""
    actual = fasta.fetch(chrom, pos-1, pos)  # Convert to 0-based
    return actual.upper() == expected_ref.upper()
```

### Extracting Multiple Regions

```python
# Extract multiple regions efficiently
regions = [
    ("chr1", 1000, 2000),
    ("chr1", 5000, 6000),
    ("chr2", 10000, 11000)
]

sequences = {}
for chrom, start, end in regions:
    seq_id = f"{chrom}:{start}-{end}"
    sequences[seq_id] = fasta.fetch(chrom, start, end)
```

### Working with Ambiguous Bases

FASTA files may contain IUPAC ambiguity codes:

- N = any base
- R = A or G (purine)
- Y = C or T (pyrimidine)
- S = G or C (strong)
- W = A or T (weak)
- K = G or T (keto)
- M = A or C (amino)
- B = C, G, or T (not A)
- D = A, G, or T (not C)
- H = A, C, or T (not G)
- V = A, C, or G (not T)

```python
# Handle ambiguous bases
def count_ambiguous(sequence):
    """Count non-ATGC bases."""
    return sum(1 for base in sequence.upper() if base not in "ATGC")

# Remove regions with too many Ns
def has_quality_sequence(fasta, chrom, start, end, max_n_frac=0.1):
    """Check if region has acceptable N content."""
    seq = fasta.fetch(chrom, start, end)
    n_count = seq.upper().count('N')
    return (n_count / len(seq)) <= max_n_frac
```

## FASTQ Files

### Overview

Pysam provides `FastxFile` (or `FastqFile`) for reading FASTQ files containing raw sequencing reads with quality scores. FASTQ files do not support random access—only sequential reading.

### Opening FASTQ Files

```python
import pysam

# Open FASTQ file
fastq = pysam.FastxFile("reads.fastq")

# Works with compressed files
fastq_gz = pysam.FastxFile("reads.fastq.gz")
```

### Reading FASTQ Records

```python
fastq = pysam.FastxFile("reads.fastq")

for read in fastq:
    print(f"Name: {read.name}")
    print(f"Sequence: {read.sequence}")
    print(f"Quality: {read.quality}")
    print(f"Comment: {read.comment}")  # Optional header comment
```

**FastqProxy attributes:**
- `name` - Read identifier (without @ prefix)
- `sequence` - DNA/RNA sequence
- `quality` - ASCII-encoded quality string
- `comment` - Optional comment from header line
- `get_quality_array()` - Convert quality string to numeric array

### Quality Score Conversion

```python
# Convert quality string to numeric values
for read in fastq:
    qual_array = read.get_quality_array()
    mean_quality = sum(qual_array) / len(qual_array)
    print(f"{read.name}: mean Q = {mean_quality:.1f}")
```

Quality scores are Phred-scaled (typically Phred+33 encoding):
- Q = -10 * log10(P_error)
- ASCII 33 ('!') = Q0
- ASCII 43 ('+') = Q10
- ASCII 63 ('?') = Q30

### Common FASTQ Processing Workflows

#### Quality Filtering

```python
def filter_by_quality(input_fastq, output_fastq, min_mean_quality=20):
    """Filter reads by mean quality score."""
    with pysam.FastxFile(input_fastq) as infile:
        with open(output_fastq, 'w') as outfile:
            for read in infile:
                qual_array = read.get_quality_array()
                mean_q = sum(qual_array) / len(qual_array)

                if mean_q >= min_mean_quality:
                    # Write in FASTQ format
                    outfile.write(f"@{read.name}\n")
                    outfile.write(f"{read.sequence}\n")
                    outfile.write("+\n")
                    outfile.write(f"{read.quality}\n")
```

#### Length Filtering

```python
def filter_by_length(input_fastq, output_fastq, min_length=50):
    """Filter reads by minimum length."""
    with pysam.FastxFile(input_fastq) as infile:
        with open(output_fastq, 'w') as outfile:
            kept = 0
            for read in infile:
                if len(read.sequence) >= min_length:
                    outfile.write(f"@{read.name}\n")
                    outfile.write(f"{read.sequence}\n")
                    outfile.write("+\n")
                    outfile.write(f"{read.quality}\n")
                    kept += 1
    print(f"Kept {kept} reads")
```

#### Calculate Quality Statistics

```python
def calculate_fastq_stats(fastq_file):
    """Calculate basic statistics for FASTQ file."""
    total_reads = 0
    total_bases = 0
    quality_sum = 0

    with pysam.FastxFile(fastq_file) as fastq:
        for read in fastq:
            total_reads += 1
            read_length = len(read.sequence)
            total_bases += read_length

            qual_array = read.get_quality_array()
            quality_sum += sum(qual_array)

    return {
        "total_reads": total_reads,
        "total_bases": total_bases,
        "mean_read_length": total_bases / total_reads if total_reads > 0 else 0,
        "mean_quality": quality_sum / total_bases if total_bases > 0 else 0
    }
```

#### Extract Reads by Name

```python
def extract_reads_by_name(fastq_file, read_names, output_file):
    """Extract specific reads by name."""
    read_set = set(read_names)

    with pysam.FastxFile(fastq_file) as infile:
        with open(output_file, 'w') as outfile:
            for read in infile:
                if read.name in read_set:
                    outfile.write(f"@{read.name}\n")
                    outfile.write(f"{read.sequence}\n")
                    outfile.write("+\n")
                    outfile.write(f"{read.quality}\n")
```

#### Convert FASTQ to FASTA

```python
def fastq_to_fasta(fastq_file, fasta_file):
    """Convert FASTQ to FASTA (discards quality scores)."""
    with pysam.FastxFile(fastq_file) as infile:
        with open(fasta_file, 'w') as outfile:
            for read in infile:
                outfile.write(f">{read.name}\n")
                outfile.write(f"{read.sequence}\n")
```

#### Subsample FASTQ

```python
import random

def subsample_fastq(input_fastq, output_fastq, fraction=0.1, seed=42):
    """Randomly subsample reads from FASTQ file."""
    random.seed(seed)

    with pysam.FastxFile(input_fastq) as infile:
        with open(output_fastq, 'w') as outfile:
            for read in infile:
                if random.random() < fraction:
                    outfile.write(f"@{read.name}\n")
                    outfile.write(f"{read.sequence}\n")
                    outfile.write("+\n")
                    outfile.write(f"{read.quality}\n")
```

## Tabix-Indexed Files

### Overview

Pysam provides `TabixFile` for accessing tabix-indexed genomic data files (BED, GFF, GTF, generic tab-delimited).

### Opening Tabix Files

```python
import pysam

# Open tabix-indexed file
tabix = pysam.TabixFile("annotations.bed.gz")

# File must be bgzip-compressed and tabix-indexed
```

### Creating Tabix Index

```python
# Index a file
pysam.tabix_index("annotations.bed", preset="bed", force=True)
# Creates annotations.bed.gz and annotations.bed.gz.tbi

# Presets available: bed, gff, vcf
```

### Fetching Records

```python
tabix = pysam.TabixFile("annotations.bed.gz")

# Fetch region
for row in tabix.fetch("chr1", 1000000, 2000000):
    print(row)  # Returns tab-delimited string

# Parse with specific parser
for row in tabix.fetch("chr1", 1000000, 2000000, parser=pysam.asBed()):
    print(f"Interval: {row.contig}:{row.start}-{row.end}")

# Available parsers: asBed(), asGTF(), asVCF(), asTuple()
```

### Working with BED Files

```python
bed = pysam.TabixFile("regions.bed.gz")

# Access BED fields by name
for interval in bed.fetch("chr1", 1000000, 2000000, parser=pysam.asBed()):
    print(f"Region: {interval.contig}:{interval.start}-{interval.end}")
    print(f"Name: {interval.name}")
    print(f"Score: {interval.score}")
    print(f"Strand: {interval.strand}")
```

### Working with GTF/GFF Files

```python
gtf = pysam.TabixFile("annotations.gtf.gz")

# Access GTF fields
for feature in gtf.fetch("chr1", 1000000, 2000000, parser=pysam.asGTF()):
    print(f"Feature: {feature.feature}")
    print(f"Gene: {feature.gene_id}")
    print(f"Transcript: {feature.transcript_id}")
    print(f"Coordinates: {feature.start}-{feature.end}")
```

## Performance Tips

### FASTA
1. **Always use indexed FASTA** files (create .fai with samtools faidx)
2. **Batch fetch operations** when extracting multiple regions
3. **Cache frequently accessed sequences** in memory
4. **Use appropriate window sizes** to avoid loading excessive sequence data

### FASTQ
1. **Stream processing** - FASTQ files are read sequentially, process on-the-fly
2. **Use compressed FASTQ.gz** to save disk space (pysam handles transparently)
3. **Avoid loading entire file** into memory—process read-by-read
4. **For large files**, consider parallel processing with file splitting

### Tabix
1. **Always bgzip and tabix-index** files before region queries
2. **Use appropriate presets** when creating indices
3. **Specify parser** for named field access
4. **Batch queries** to same file to avoid re-opening

## Common Pitfalls

1. **FASTA coordinate system:** fetch() uses 0-based coordinates, region strings use 1-based
2. **Missing index:** FASTA random access requires .fai index file
3. **FASTQ sequential only:** Cannot do random access or region-based queries on FASTQ
4. **Quality encoding:** Assume Phred+33 unless specified otherwise
5. **Tabix compression:** Must use bgzip, not regular gzip, for tabix indexing
6. **Parser requirement:** TabixFile needs explicit parser for named field access
7. **Case sensitivity:** FASTA sequences preserve case—use .upper() or .lower() for consistent comparisons
