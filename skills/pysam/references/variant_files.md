# Working with Variant Files (VCF/BCF)

## Overview

Pysam provides the `VariantFile` class for reading and writing VCF (Variant Call Format) and BCF (binary VCF) files. These files contain information about genetic variants, including SNPs, indels, and structural variants.

## Opening Variant Files

```python
import pysam

# Reading VCF
vcf = pysam.VariantFile("example.vcf")

# Reading BCF (binary, compressed)
bcf = pysam.VariantFile("example.bcf")

# Reading compressed VCF
vcf_gz = pysam.VariantFile("example.vcf.gz")

# Writing
outvcf = pysam.VariantFile("output.vcf", "w", header=vcf.header)
```

## VariantFile Properties

**Header Information:**
- `header` - Complete VCF header with metadata
- `header.contigs` - Dictionary of contigs/chromosomes
- `header.samples` - List of sample names
- `header.filters` - Dictionary of FILTER definitions
- `header.info` - Dictionary of INFO field definitions
- `header.formats` - Dictionary of FORMAT field definitions

```python
vcf = pysam.VariantFile("example.vcf")

# List samples
print(f"Samples: {list(vcf.header.samples)}")

# List contigs
for contig in vcf.header.contigs:
    print(f"{contig}: length={vcf.header.contigs[contig].length}")

# List INFO fields
for info in vcf.header.info:
    print(f"{info}: {vcf.header.info[info].description}")
```

## Reading Variant Records

### Iterate All Variants

```python
for variant in vcf:
    print(f"{variant.chrom}:{variant.pos} {variant.ref}>{variant.alts}")
```

### Fetch Specific Region

Requires tabix index (.tbi) for VCF.gz or index for BCF:

```python
# Fetch variants in region (1-based coordinates for region string)
for variant in vcf.fetch("chr1", 1000000, 2000000):
    print(f"{variant.chrom}:{variant.pos} {variant.id}")

# Using region string (1-based)
for variant in vcf.fetch("chr1:1000000-2000000"):
    print(variant.pos)
```

**Note:** Uses **1-based coordinates** in `fetch()` calls to match VCF specification.

## VariantRecord Objects

Each variant is represented as a `VariantRecord` object:

### Position Information
- `chrom` - Chromosome/contig name
- `pos` - Position (1-based)
- `start` - Start position (0-based)
- `stop` - Stop position (0-based, exclusive)
- `id` - Variant ID (e.g., rsID)

### Allele Information
- `ref` - Reference allele
- `alts` - Tuple of alternate alleles
- `alleles` - Tuple of all alleles (ref + alts)

### Quality and Filtering
- `qual` - Quality score (QUAL field)
- `filter` - Filter status

### INFO Fields

Access INFO fields as dictionary:

```python
for variant in vcf:
    # Check if field exists
    if "DP" in variant.info:
        depth = variant.info["DP"]
        print(f"Depth: {depth}")

    # Get all INFO keys
    print(f"INFO fields: {variant.info.keys()}")

    # Access specific fields
    if "AF" in variant.info:
        allele_freq = variant.info["AF"]
        print(f"Allele frequency: {allele_freq}")
```

### Sample Genotype Data

Access sample data through `samples` dictionary:

```python
for variant in vcf:
    for sample_name in variant.samples:
        sample = variant.samples[sample_name]

        # Genotype (GT field)
        gt = sample["GT"]
        print(f"{sample_name} genotype: {gt}")

        # Other FORMAT fields
        if "DP" in sample:
            print(f"{sample_name} depth: {sample['DP']}")
        if "GQ" in sample:
            print(f"{sample_name} quality: {sample['GQ']}")

        # Alleles for this genotype
        alleles = sample.alleles
        print(f"{sample_name} alleles: {alleles}")

        # Phasing
        if sample.phased:
            print(f"{sample_name} is phased")
```

**Genotype representation:**
- `(0, 0)` - Homozygous reference
- `(0, 1)` - Heterozygous
- `(1, 1)` - Homozygous alternate
- `(None, None)` - Missing genotype
- Phased: `(0|1)` vs unphased: `(0/1)`

## Writing Variant Files

### Creating Header

```python
header = pysam.VariantHeader()

# Add contigs
header.contigs.add("chr1", length=248956422)
header.contigs.add("chr2", length=242193529)

# Add INFO fields
header.add_line('##INFO=<ID=DP,Number=1,Type=Integer,Description="Total Depth">')
header.add_line('##INFO=<ID=AF,Number=A,Type=Float,Description="Allele Frequency">')

# Add FORMAT fields
header.add_line('##FORMAT=<ID=GT,Number=1,Type=String,Description="Genotype">')
header.add_line('##FORMAT=<ID=DP,Number=1,Type=Integer,Description="Read Depth">')

# Add samples
header.add_sample("sample1")
header.add_sample("sample2")

# Create output file
outvcf = pysam.VariantFile("output.vcf", "w", header=header)
```

### Creating Variant Records

```python
# Create new variant
record = outvcf.new_record()
record.chrom = "chr1"
record.pos = 100000
record.id = "rs123456"
record.ref = "A"
record.alts = ("G",)
record.qual = 30
record.filter.add("PASS")

# Set INFO fields
record.info["DP"] = 100
record.info["AF"] = (0.25,)

# Set genotype data
record.samples["sample1"]["GT"] = (0, 1)
record.samples["sample1"]["DP"] = 50
record.samples["sample2"]["GT"] = (0, 0)
record.samples["sample2"]["DP"] = 50

# Write to file
outvcf.write(record)
```

## Filtering Variants

### Basic Filtering

```python
# Filter by quality
for variant in vcf:
    if variant.qual >= 30:
        print(f"High quality variant: {variant.chrom}:{variant.pos}")

# Filter by depth
for variant in vcf:
    if "DP" in variant.info and variant.info["DP"] >= 20:
        print(f"High depth variant: {variant.chrom}:{variant.pos}")

# Filter by allele frequency
for variant in vcf:
    if "AF" in variant.info:
        for af in variant.info["AF"]:
            if af >= 0.01:
                print(f"Common variant: {variant.chrom}:{variant.pos}")
```

### Filtering by Genotype

```python
# Find variants where sample has alternate allele
for variant in vcf:
    sample = variant.samples["sample1"]
    gt = sample["GT"]

    # Check if has alternate allele
    if gt and any(allele and allele > 0 for allele in gt):
        print(f"Sample has alt allele: {variant.chrom}:{variant.pos}")

    # Check if homozygous alternate
    if gt == (1, 1):
        print(f"Homozygous alt: {variant.chrom}:{variant.pos}")
```

### Filter Field

```python
# Check FILTER status
for variant in vcf:
    if "PASS" in variant.filter or len(variant.filter) == 0:
        print(f"Passed filters: {variant.chrom}:{variant.pos}")
    else:
        print(f"Failed: {variant.filter.keys()}")
```

## Indexing VCF Files

Create tabix index for compressed VCF:

```python
# Compress and index
pysam.tabix_index("example.vcf", preset="vcf", force=True)
# Creates example.vcf.gz and example.vcf.gz.tbi
```

Or use bcftools for BCF:

```python
pysam.bcftools.index("example.bcf")
```

## Common Workflows

### Extract Variants for Specific Samples

```python
invcf = pysam.VariantFile("input.vcf")
samples_to_keep = ["sample1", "sample3"]

# Create new header with subset of samples
new_header = invcf.header.copy()
new_header.samples.clear()
for sample in samples_to_keep:
    new_header.samples.add(sample)

outvcf = pysam.VariantFile("output.vcf", "w", header=new_header)

for variant in invcf:
    # Create new record
    new_record = outvcf.new_record(
        contig=variant.chrom,
        start=variant.start,
        stop=variant.stop,
        alleles=variant.alleles,
        id=variant.id,
        qual=variant.qual,
        filter=variant.filter,
        info=variant.info
    )

    # Copy genotype data for selected samples
    for sample in samples_to_keep:
        new_record.samples[sample].update(variant.samples[sample])

    outvcf.write(new_record)
```

### Calculate Allele Frequencies

```python
vcf = pysam.VariantFile("example.vcf")

for variant in vcf:
    total_alleles = 0
    alt_alleles = 0

    for sample_name in variant.samples:
        gt = variant.samples[sample_name]["GT"]
        if gt and None not in gt:
            total_alleles += 2
            alt_alleles += sum(1 for allele in gt if allele > 0)

    if total_alleles > 0:
        af = alt_alleles / total_alleles
        print(f"{variant.chrom}:{variant.pos} AF={af:.4f}")
```

### Convert VCF to Summary Table

```python
import csv

vcf = pysam.VariantFile("example.vcf")

with open("variants.csv", "w", newline="") as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(["CHROM", "POS", "ID", "REF", "ALT", "QUAL", "DP"])

    for variant in vcf:
        writer.writerow([
            variant.chrom,
            variant.pos,
            variant.id or ".",
            variant.ref,
            ",".join(variant.alts) if variant.alts else ".",
            variant.qual or ".",
            variant.info.get("DP", ".")
        ])
```

## Performance Tips

1. **Use BCF format** for better compression and faster access than VCF
2. **Index files** with tabix for efficient region queries
3. **Filter early** to reduce processing of irrelevant variants
4. **Use INFO fields efficiently** - check existence before accessing
5. **Batch write operations** when creating VCF files

## Common Pitfalls

1. **Coordinate systems:** VCF uses 1-based coordinates, but VariantRecord.start is 0-based
2. **Missing data:** Always check if INFO/FORMAT fields exist before accessing
3. **Genotype tuples:** Genotypes are tuples, not lists—handle None values for missing data
4. **Allele indexing:** In genotype (0, 1), 0=REF, 1=first ALT, 2=second ALT, etc.
5. **Index requirement:** Region-based `fetch()` requires tabix index for VCF.gz
6. **Header modification:** When subsetting samples, properly update header and copy FORMAT fields
