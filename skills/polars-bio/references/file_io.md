# Bioinformatics File I/O

## Overview

polars-bio provides `read_*`, `scan_*`, `write_*`, and `sink_*` functions for common bioinformatics formats. `read_*` loads data eagerly into a DataFrame, while `scan_*` creates a LazyFrame for streaming/out-of-core processing. `write_*` writes from DataFrame/LazyFrame and returns a row count, while `sink_*` streams from a LazyFrame.

## Supported Formats

| Format | Read | Scan | Register (SQL) | Write | Sink |
|--------|------|------|-----------------|-------|------|
| BED | `read_bed` | `scan_bed` | `register_bed` | — | — |
| VCF | `read_vcf` | `scan_vcf` | `register_vcf` | `write_vcf` | `sink_vcf` |
| BAM | `read_bam` | `scan_bam` | `register_bam` | `write_bam` | `sink_bam` |
| CRAM | `read_cram` | `scan_cram` | `register_cram` | `write_cram` | `sink_cram` |
| GFF | `read_gff` | `scan_gff` | `register_gff` | — | — |
| GTF | `read_gtf` | `scan_gtf` | `register_gtf` | — | — |
| FASTA | `read_fasta` | `scan_fasta` | — | — | — |
| FASTQ | `read_fastq` | `scan_fastq` | `register_fastq` | `write_fastq` | `sink_fastq` |
| SAM | `read_sam` | `scan_sam` | `register_sam` | `write_sam` | `sink_sam` |
| Hi-C pairs | `read_pairs` | `scan_pairs` | `register_pairs` | — | — |
| Generic table | `read_table` | `scan_table` | — | — | — |

## Common Cloud/IO Parameters

All `read_*` and `scan_*` functions share these parameters (instead of a single `storage_options` dict):

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `path` | str | required | File path (local, S3, GCS, Azure) |
| `chunk_size` | int | `8` | Number of chunks for parallel reading |
| `concurrent_fetches` | int | `1` | Number of concurrent fetches for cloud storage |
| `allow_anonymous` | bool | `True` | Allow anonymous access to cloud storage |
| `enable_request_payer` | bool | `False` | Enable requester-pays for cloud storage |
| `max_retries` | int | `5` | Maximum retries for cloud operations |
| `timeout` | int | `300` | Timeout in seconds for cloud operations |
| `compression_type` | str | `"auto"` | Compression type (auto-detected from extension) |
| `projection_pushdown` | bool | `True` | Enable projection pushdown optimization |
| `use_zero_based` | bool | `None` | Set coordinate system metadata (None = use global setting) |

Not all functions support all parameters. SAM functions lack cloud parameters. FASTA/FASTQ lack `predicate_pushdown`.

## BED Format

### read_bed / scan_bed

Read BED files. Columns are auto-detected (BED3 through BED12). BED files use 0-based half-open coordinates; polars-bio attaches coordinate metadata automatically.

```python
import polars_bio as pb

# Eager read
df = pb.read_bed("regions.bed")

# Lazy scan
lf = pb.scan_bed("regions.bed")
```

### Column Schema (BED3)

| Column | Type | Description |
|--------|------|-------------|
| `chrom` | String | Chromosome name |
| `start` | Int64 | Start position |
| `end` | Int64 | End position |

Extended BED fields (auto-detected) add: `name`, `score`, `strand`, `thickStart`, `thickEnd`, `itemRgb`, `blockCount`, `blockSizes`, `blockStarts`.

## VCF Format

### read_vcf / scan_vcf

Read VCF/BCF files. Supports `.vcf`, `.vcf.gz`, `.bcf`.

```python
import polars_bio as pb

# Read VCF
df = pb.read_vcf("variants.vcf.gz")

# Read with specific INFO and FORMAT fields extracted as columns
df = pb.read_vcf("variants.vcf.gz", info_fields=["AF", "DP"], format_fields=["GT", "GQ"])

# Read specific samples
df = pb.read_vcf("variants.vcf.gz", samples=["SAMPLE1", "SAMPLE2"])
```

### Additional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `info_fields` | list[str] | `None` | INFO fields to extract as columns |
| `format_fields` | list[str] | `None` | FORMAT fields to extract as columns |
| `samples` | list[str] | `None` | Samples to include |
| `predicate_pushdown` | bool | `True` | Enable predicate pushdown |

### Column Schema

| Column | Type | Description |
|--------|------|-------------|
| `chrom` | String | Chromosome |
| `start` | UInt32 | Start position |
| `end` | UInt32 | End position |
| `id` | String | Variant ID |
| `ref` | String | Reference allele |
| `alt` | String | Alternate allele(s) |
| `qual` | Float32 | Quality score |
| `filter` | String | Filter status |
| `info` | String | INFO field (raw, unless `info_fields` specified) |

### write_vcf / sink_vcf

```python
import polars_bio as pb

# Write DataFrame to VCF
rows_written = pb.write_vcf(df, "output.vcf")

# Stream LazyFrame to VCF
pb.sink_vcf(lf, "output.vcf")
```

## BAM Format

### read_bam / scan_bam

Read aligned sequencing reads from BAM files. Requires a `.bai` index file.

```python
import polars_bio as pb

# Read BAM
df = pb.read_bam("aligned.bam")

# Scan BAM (streaming)
lf = pb.scan_bam("aligned.bam")

# Read with specific tags
df = pb.read_bam("aligned.bam", tag_fields=["NM", "MD"])
```

### Additional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `tag_fields` | list[str] | `None` | SAM tags to extract as columns |
| `predicate_pushdown` | bool | `True` | Enable predicate pushdown |
| `infer_tag_types` | bool | `True` | Infer tag column types from data |
| `infer_tag_sample_size` | int | `100` | Number of records to sample for type inference |
| `tag_type_hints` | list[str] | `None` | Explicit type hints for tags |

### Column Schema

| Column | Type | Description |
|--------|------|-------------|
| `chrom` | String | Reference sequence name |
| `start` | Int64 | Alignment start position |
| `end` | Int64 | Alignment end position |
| `name` | String | Read name |
| `flags` | UInt32 | SAM flags |
| `mapping_quality` | UInt32 | Mapping quality |
| `cigar` | String | CIGAR string |
| `sequence` | String | Read sequence |
| `quality_scores` | String | Base quality string |
| `mate_chrom` | String | Mate reference name |
| `mate_start` | Int64 | Mate start position |
| `template_length` | Int64 | Template length |

### write_bam / sink_bam

```python
rows_written = pb.write_bam(df, "output.bam")
rows_written = pb.write_bam(df, "output.bam", sort_on_write=True)

pb.sink_bam(lf, "output.bam")
pb.sink_bam(lf, "output.bam", sort_on_write=True)
```

## CRAM Format

### read_cram / scan_cram

CRAM files have **separate functions** from BAM. Require a reference FASTA and `.crai` index.

```python
import polars_bio as pb

# Read CRAM (reference required)
df = pb.read_cram("aligned.cram", reference_path="reference.fasta")

# Scan CRAM (streaming)
lf = pb.scan_cram("aligned.cram", reference_path="reference.fasta")
```

Same additional parameters and column schema as BAM, plus:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `reference_path` | str | `None` | Path to reference FASTA |

### write_cram / sink_cram

```python
rows_written = pb.write_cram(df, "output.cram", reference_path="reference.fasta")
pb.sink_cram(lf, "output.cram", reference_path="reference.fasta")
```

## GFF/GTF Format

### read_gff / scan_gff / read_gtf / scan_gtf

GFF3 and GTF have separate functions.

```python
import polars_bio as pb

# Read GFF3
df = pb.read_gff("annotations.gff3")

# Read GTF
df = pb.read_gtf("genes.gtf")

# Extract specific attributes as columns
df = pb.read_gff("annotations.gff3", attr_fields=["gene_id", "gene_name"])
```

### Additional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `attr_fields` | list[str] | `None` | Attribute fields to extract as columns |
| `predicate_pushdown` | bool | `True` | Enable predicate pushdown |

### Column Schema

| Column | Type | Description |
|--------|------|-------------|
| `chrom` | String | Sequence name |
| `source` | String | Feature source |
| `type` | String | Feature type (gene, exon, etc.) |
| `start` | Int64 | Start position |
| `end` | Int64 | End position |
| `score` | Float32 | Score |
| `strand` | String | Strand (+/-/.) |
| `phase` | UInt32 | Phase (0/1/2) |
| `attributes` | String | Attributes string |

## FASTA Format

### read_fasta / scan_fasta

Read reference sequences from FASTA files.

```python
import polars_bio as pb

df = pb.read_fasta("reference.fasta")
```

### Column Schema

| Column | Type | Description |
|--------|------|-------------|
| `name` | String | Sequence name |
| `description` | String | Description line |
| `sequence` | String | Nucleotide sequence |

## FASTQ Format

### read_fastq / scan_fastq

Read raw sequencing reads with quality scores.

```python
import polars_bio as pb

df = pb.read_fastq("reads.fastq.gz")
```

### Column Schema

| Column | Type | Description |
|--------|------|-------------|
| `name` | String | Read name |
| `description` | String | Description line |
| `sequence` | String | Nucleotide sequence |
| `quality` | String | Quality string (Phred+33 encoded) |

### write_fastq / sink_fastq

```python
rows_written = pb.write_fastq(df, "output.fastq")
pb.sink_fastq(lf, "output.fastq")
```

## SAM Format

### read_sam / scan_sam

Read text-format alignment files. Same column schema as BAM. No cloud parameters.

```python
import polars_bio as pb

df = pb.read_sam("alignments.sam")
```

### Additional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `tag_fields` | list[str] | `None` | SAM tags to extract |
| `infer_tag_types` | bool | `True` | Infer tag types |
| `infer_tag_sample_size` | int | `100` | Sample size for inference |
| `tag_type_hints` | list[str] | `None` | Explicit type hints |

### write_sam / sink_sam

```python
rows_written = pb.write_sam(df, "output.sam")
pb.sink_sam(lf, "output.sam", sort_on_write=True)
```

## Hi-C Pairs

### read_pairs / scan_pairs

Read Hi-C pairs format files for chromatin contact data.

```python
import polars_bio as pb

df = pb.read_pairs("contacts.pairs")
lf = pb.scan_pairs("contacts.pairs")
```

### Column Schema

| Column | Type | Description |
|--------|------|-------------|
| `readID` | String | Read identifier |
| `chrom1` | String | Chromosome of first contact |
| `pos1` | Int32 | Position of first contact |
| `chrom2` | String | Chromosome of second contact |
| `pos2` | Int32 | Position of second contact |
| `strand1` | String | Strand of first contact |
| `strand2` | String | Strand of second contact |

## Generic Table Reader

### read_table / scan_table

Read tab-delimited files with custom schema. Useful for non-standard formats or bioframe-compatible tables.

```python
import polars_bio as pb

df = pb.read_table("custom.tsv", schema={"chrom": str, "start": int, "end": int, "name": str})
lf = pb.scan_table("custom.tsv", schema={"chrom": str, "start": int, "end": int})
```

## Cloud Storage

All `read_*` and `scan_*` functions support cloud storage via individual parameters:

### Amazon S3

```python
df = pb.read_bed(
    "s3://bucket/regions.bed",
    allow_anonymous=False,
    max_retries=10,
    timeout=600,
)
```

### Google Cloud Storage

```python
df = pb.read_vcf("gs://bucket/variants.vcf.gz", allow_anonymous=True)
```

### Azure Blob Storage

```python
df = pb.read_bam("az://container/aligned.bam", allow_anonymous=False)
```

**Note:** For authenticated access, configure credentials via environment variables or cloud SDK configuration (e.g., `AWS_ACCESS_KEY_ID`, `GOOGLE_APPLICATION_CREDENTIALS`).

## Compression Support

polars-bio transparently handles compressed files:

| Compression | Extension | Parallel Decompression |
|-------------|-----------|----------------------|
| GZIP | `.gz` | No |
| BGZF | `.gz` (with BGZF blocks) | Yes |
| Uncompressed | (none) | N/A |

**Recommendation:** Use BGZF compression (e.g., created with `bgzip`) for large files. BGZF supports parallel block decompression, significantly improving read performance compared to plain GZIP.

## Describe Functions

Inspect file structure without fully reading:

```python
import polars_bio as pb

# Describe file schemas and metadata
schema_df = pb.describe_vcf("samples.vcf.gz")
schema_df = pb.describe_bam("aligned.bam")
schema_df = pb.describe_sam("alignments.sam")
schema_df = pb.describe_cram("aligned.cram", reference_path="ref.fasta")
```
