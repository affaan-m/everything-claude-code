---
name: pysam
description: Genomic file toolkit. Read/write SAM/BAM/CRAM alignments, VCF/BCF variants, FASTA/FASTQ sequences, extract regions, calculate coverage, for NGS data processing pipelines.
license: MIT license
metadata:
    skill-author: K-Dense Inc.
---

# Pysam

## Overview

Pysam is a Python module for reading, manipulating, and writing genomic datasets. Read/write SAM/BAM/CRAM alignment files, VCF/BCF variant files, and FASTA/FASTQ sequences with a Pythonic interface to htslib. Query tabix-indexed files, perform pileup analysis for coverage, and execute samtools/bcftools commands.

## When to Use This Skill

This skill should be used when:
- Working with sequencing alignment files (BAM/CRAM)
- Analyzing genetic variants (VCF/BCF)
- Extracting reference sequences or gene regions
- Processing raw sequencing data (FASTQ)
- Calculating coverage or read depth
- Implementing bioinformatics analysis pipelines
- Quality control of sequencing data
- Variant calling and annotation workflows

## Quick Start

### Installation
```bash
uv pip install pysam
```

### Basic Examples

**Read alignment file:**
```python
import pysam

# Open BAM file and fetch reads in region
samfile = pysam.AlignmentFile("example.bam", "rb")
for read in samfile.fetch("chr1", 1000, 2000):
    print(f"{read.query_name}: {read.reference_start}")
samfile.close()
```

**Read variant file:**
```python
# Open VCF file and iterate variants
vcf = pysam.VariantFile("variants.vcf")
for variant in vcf:
    print(f"{variant.chrom}:{variant.pos} {variant.ref}>{variant.alts}")
vcf.close()
```

**Query reference sequence:**
```python
# Open FASTA and extract sequence
fasta = pysam.FastaFile("reference.fasta")
sequence = fasta.fetch("chr1", 1000, 2000)
print(sequence)
fasta.close()
```

## Core Capabilities

### 1. Alignment File Operations (SAM/BAM/CRAM)

Use the `AlignmentFile` class to work with aligned sequencing reads. This is appropriate for analyzing mapping results, calculating coverage, extracting reads, or quality control.

**Common operations:**
- Open and read BAM/SAM/CRAM files
- Fetch reads from specific genomic regions
- Filter reads by mapping quality, flags, or other criteria
- Write filtered or modified alignments
- Calculate coverage statistics
- Perform pileup analysis (base-by-base coverage)
- Access read sequences, quality scores, and alignment information

**Reference:** See `references/alignment_files.md` for detailed documentation on:
- Opening and reading alignment files
- AlignedSegment attributes and methods
- Region-based fetching with `fetch()`
- Pileup analysis for coverage
- Writing and creating BAM files
- Coordinate systems and indexing
- Performance optimization tips

### 2. Variant File Operations (VCF/BCF)

Use the `VariantFile` class to work with genetic variants from variant calling pipelines. This is appropriate for variant analysis, filtering, annotation, or population genetics.

**Common operations:**
- Read and write VCF/BCF files
- Query variants in specific regions
- Access variant information (position, alleles, quality)
- Extract genotype data for samples
- Filter variants by quality, allele frequency, or other criteria
- Annotate variants with additional information
- Subset samples or regions

**Reference:** See `references/variant_files.md` for detailed documentation on:
- Opening and reading variant files
- VariantRecord attributes and methods
- Accessing INFO and FORMAT fields
- Working with genotypes and samples
- Creating and writing VCF files
- Filtering and subsetting variants
- Multi-sample VCF operations

### 3. Sequence File Operations (FASTA/FASTQ)

Use `FastaFile` for random access to reference sequences and `FastxFile` for reading raw sequencing data. This is appropriate for extracting gene sequences, validating variants against reference, or processing raw reads.

**Common operations:**
- Query reference sequences by genomic coordinates
- Extract sequences for genes or regions of interest
- Read FASTQ files with quality scores
- Validate variant reference alleles
- Calculate sequence statistics
- Filter reads by quality or length
- Convert between FASTA and FASTQ formats

**Reference:** See `references/sequence_files.md` for detailed documentation on:
- FASTA file access and indexing
- Extracting sequences by region
- Handling reverse complement for genes
- Reading FASTQ files sequentially
- Quality score conversion and filtering
- Working with tabix-indexed files (BED, GTF, GFF)
- Common sequence processing patterns

### 4. Integrated Bioinformatics Workflows

Pysam excels at integrating multiple file types for comprehensive genomic analyses. Common workflows combine alignment files, variant files, and reference sequences.

**Common workflows:**
- Calculate coverage statistics for specific regions
- Validate variants against aligned reads
- Annotate variants with coverage information
- Extract sequences around variant positions
- Filter alignments or variants based on multiple criteria
- Generate coverage tracks for visualization
- Quality control across multiple data types

**Reference:** See `references/common_workflows.md` for detailed examples of:
- Quality control workflows (BAM statistics, reference consistency)
- Coverage analysis (per-base coverage, low coverage detection)
- Variant analysis (annotation, filtering by read support)
- Sequence extraction (variant contexts, gene sequences)
- Read filtering and subsetting
- Integration patterns (BAM+VCF, VCF+BED, etc.)
- Performance optimization for complex workflows

## Key Concepts

### Coordinate Systems

**Critical:** Pysam uses **0-based, half-open** coordinates (Python convention):
- Start positions are 0-based (first base is position 0)
- End positions are exclusive (not included in the range)
- Region 1000-2000 includes bases 1000-1999 (1000 bases total)

**Exception:** Region strings in `fetch()` follow samtools convention (1-based):
```python
samfile.fetch("chr1", 999, 2000)      # 0-based: positions 999-1999
samfile.fetch("chr1:1000-2000")       # 1-based string: positions 1000-2000
```

**VCF files:** Use 1-based coordinates in the file format, but `VariantRecord.start` is 0-based.

### Indexing Requirements

Random access to specific genomic regions requires index files:
- **BAM files**: Require `.bai` index (create with `pysam.index()`)
- **CRAM files**: Require `.crai` index
- **FASTA files**: Require `.fai` index (create with `pysam.faidx()`)
- **VCF.gz files**: Require `.tbi` tabix index (create with `pysam.tabix_index()`)
- **BCF files**: Require `.csi` index

Without an index, use `fetch(until_eof=True)` for sequential reading.

### File Modes

Specify format when opening files:
- `"rb"` - Read BAM (binary)
- `"r"` - Read SAM (text)
- `"rc"` - Read CRAM
- `"wb"` - Write BAM
- `"w"` - Write SAM
- `"wc"` - Write CRAM

### Performance Considerations

1. **Always use indexed files** for random access operations
2. **Use `pileup()` for column-wise analysis** instead of repeated fetch operations
3. **Use `count()` for counting** instead of iterating and counting manually
4. **Process regions in parallel** when analyzing independent genomic regions
5. **Close files explicitly** to free resources
6. **Use `until_eof=True`** for sequential processing without index
7. **Avoid multiple iterators** unless necessary (use `multiple_iterators=True` if needed)

## Common Pitfalls

1. **Coordinate confusion:** Remember 0-based vs 1-based systems in different contexts
2. **Missing indices:** Many operations require index files—create them first
3. **Partial overlaps:** `fetch()` returns reads overlapping region boundaries, not just those fully contained
4. **Iterator scope:** Keep pileup iterator references alive to avoid "PileupProxy accessed after iterator finished" errors
5. **Quality score editing:** Cannot modify `query_qualities` in place after changing `query_sequence`—create a copy first
6. **Stream limitations:** Only stdin/stdout are supported for streaming, not arbitrary Python file objects
7. **Thread safety:** While GIL is released during I/O, comprehensive thread-safety hasn't been fully validated

## Command-Line Tools

Pysam provides access to samtools and bcftools commands:

```python
# Sort BAM file
pysam.samtools.sort("-o", "sorted.bam", "input.bam")

# Index BAM
pysam.samtools.index("sorted.bam")

# View specific region
pysam.samtools.view("-b", "-o", "region.bam", "input.bam", "chr1:1000-2000")

# BCF tools
pysam.bcftools.view("-O", "z", "-o", "output.vcf.gz", "input.vcf")
```

**Error handling:**
```python
try:
    pysam.samtools.sort("-o", "output.bam", "input.bam")
except pysam.SamtoolsError as e:
    print(f"Error: {e}")
```

## Resources

### references/

Detailed documentation for each major capability:

- **alignment_files.md** - Complete guide to SAM/BAM/CRAM operations, including AlignmentFile class, AlignedSegment attributes, fetch operations, pileup analysis, and writing alignments

- **variant_files.md** - Complete guide to VCF/BCF operations, including VariantFile class, VariantRecord attributes, genotype handling, INFO/FORMAT fields, and multi-sample operations

- **sequence_files.md** - Complete guide to FASTA/FASTQ operations, including FastaFile and FastxFile classes, sequence extraction, quality score handling, and tabix-indexed file access

- **common_workflows.md** - Practical examples of integrated bioinformatics workflows combining multiple file types, including quality control, coverage analysis, variant validation, and sequence extraction

## Getting Help

For detailed information on specific operations, refer to the appropriate reference document:

- Working with BAM files or calculating coverage → `alignment_files.md`
- Analyzing variants or genotypes → `variant_files.md`
- Extracting sequences or processing FASTQ → `sequence_files.md`
- Complex workflows integrating multiple file types → `common_workflows.md`

Official documentation: https://pysam.readthedocs.io/

