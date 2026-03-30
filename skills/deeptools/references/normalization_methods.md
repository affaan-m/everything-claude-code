# deepTools Normalization Methods

This document explains the various normalization methods available in deepTools and when to use each one.

## Why Normalize?

Normalization is essential for:
1. **Comparing samples with different sequencing depths**
2. **Accounting for library size differences**
3. **Making coverage values interpretable across experiments**
4. **Enabling fair comparisons between conditions**

Without normalization, a sample with 100 million reads will appear to have higher coverage than a sample with 50 million reads, even if the true biological signal is identical.

---

## Available Normalization Methods

### 1. RPKM (Reads Per Kilobase per Million mapped reads)

**Formula:** `(Number of reads) / (Length of region in kb × Total mapped reads in millions)`

**When to use:**
- Comparing different genomic regions within the same sample
- Adjusting for both sequencing depth AND region length
- RNA-seq gene expression analysis

**Available in:** `bamCoverage`

**Example:**
```bash
bamCoverage --bam input.bam --outFileName output.bw \
    --normalizeUsing RPKM
```

**Interpretation:** RPKM of 10 means 10 reads per kilobase of feature per million mapped reads.

**Pros:**
- Accounts for both region length and library size
- Widely used and understood in genomics

**Cons:**
- Not ideal for comparing between samples if total RNA content differs
- Can be misleading when comparing samples with very different compositions

---

### 2. CPM (Counts Per Million mapped reads)

**Formula:** `(Number of reads) / (Total mapped reads in millions)`

**Also known as:** RPM (Reads Per Million)

**When to use:**
- Comparing the same genomic regions across different samples
- When region length is constant or not relevant
- ChIP-seq, ATAC-seq, DNase-seq analyses

**Available in:** `bamCoverage`, `bamCompare`

**Example:**
```bash
bamCoverage --bam input.bam --outFileName output.bw \
    --normalizeUsing CPM
```

**Interpretation:** CPM of 5 means 5 reads per million mapped reads in that bin.

**Pros:**
- Simple and intuitive
- Good for comparing samples with different sequencing depths
- Appropriate when comparing fixed-size bins

**Cons:**
- Does not account for region length
- Affected by highly abundant regions (e.g., rRNA in RNA-seq)

---

### 3. BPM (Bins Per Million mapped reads)

**Formula:** `(Number of reads in bin) / (Sum of all reads in bins in millions)`

**Key difference from CPM:** Only considers reads that fall within the analyzed bins, not all mapped reads.

**When to use:**
- Similar to CPM, but when you want to exclude reads outside analyzed regions
- Comparing specific genomic regions while ignoring background

**Available in:** `bamCoverage`, `bamCompare`

**Example:**
```bash
bamCoverage --bam input.bam --outFileName output.bw \
    --normalizeUsing BPM
```

**Interpretation:** BPM accounts only for reads in the binned regions.

**Pros:**
- Focuses normalization on analyzed regions
- Less affected by reads in unanalyzed areas

**Cons:**
- Less commonly used, may be harder to compare with published data

---

### 4. RPGC (Reads Per Genomic Content)

**Formula:** `(Number of reads × Scaling factor) / Effective genome size`

**Scaling factor:** Calculated to achieve 1× genomic coverage (1 read per base)

**When to use:**
- Want comparable coverage values across samples
- Need interpretable absolute coverage values
- Comparing samples with very different total read counts
- ChIP-seq with spike-in normalization context

**Available in:** `bamCoverage`, `bamCompare`

**Requires:** `--effectiveGenomeSize` parameter

**Example:**
```bash
bamCoverage --bam input.bam --outFileName output.bw \
    --normalizeUsing RPGC \
    --effectiveGenomeSize 2913022398
```

**Interpretation:** Signal value approximates the coverage depth (e.g., value of 2 ≈ 2× coverage).

**Pros:**
- Produces 1× normalized coverage
- Interpretable in terms of genomic coverage
- Good for comparing samples with different sequencing depths

**Cons:**
- Requires knowing effective genome size
- Assumes uniform coverage (not true for ChIP-seq with peaks)

---

### 5. None (No Normalization)

**Formula:** Raw read counts

**When to use:**
- Preliminary analysis
- When samples have identical library sizes (rare)
- When downstream tool will perform normalization
- Debugging or quality control

**Available in:** All tools (usually default)

**Example:**
```bash
bamCoverage --bam input.bam --outFileName output.bw \
    --normalizeUsing None
```

**Interpretation:** Raw read counts per bin.

**Pros:**
- No assumptions made
- Useful for seeing raw data
- Fastest computation

**Cons:**
- Cannot fairly compare samples with different sequencing depths
- Not suitable for publication figures

---

### 6. SES (Selective Enrichment Statistics)

**Method:** Signal Extraction Scaling - more sophisticated method for comparing ChIP to control

**When to use:**
- ChIP-seq analysis with bamCompare
- Want sophisticated background correction
- Alternative to simple readCount scaling

**Available in:** `bamCompare` only

**Example:**
```bash
bamCompare -b1 chip.bam -b2 input.bam -o output.bw \
    --scaleFactorsMethod SES
```

**Note:** SES is specifically designed for ChIP-seq data and may work better than simple read count scaling for noisy data.

---

### 7. readCount (Read Count Scaling)

**Method:** Scale by ratio of total read counts between samples

**When to use:**
- Default for `bamCompare`
- Compensating for sequencing depth differences in comparisons
- When you trust that total read counts reflect library size

**Available in:** `bamCompare`

**Example:**
```bash
bamCompare -b1 treatment.bam -b2 control.bam -o output.bw \
    --scaleFactorsMethod readCount
```

**How it works:** If sample1 has 100M reads and sample2 has 50M reads, sample2 is scaled by 2× before comparison.

---

## Normalization Method Selection Guide

### For ChIP-seq Coverage Tracks

**Recommended:** RPGC or CPM

```bash
bamCoverage --bam chip.bam --outFileName chip.bw \
    --normalizeUsing RPGC \
    --effectiveGenomeSize 2913022398 \
    --extendReads 200 \
    --ignoreDuplicates
```

**Reasoning:** Accounts for sequencing depth differences; RPGC provides interpretable coverage values.

---

### For ChIP-seq Comparisons (Treatment vs Control)

**Recommended:** log2 ratio with readCount or SES scaling

```bash
bamCompare -b1 chip.bam -b2 input.bam -o ratio.bw \
    --operation log2 \
    --scaleFactorsMethod readCount \
    --extendReads 200 \
    --ignoreDuplicates
```

**Reasoning:** Log2 ratio shows enrichment (positive) and depletion (negative); readCount adjusts for depth.

---

### For RNA-seq Coverage Tracks

**Recommended:** CPM or RPKM

```bash
# Strand-specific forward
bamCoverage --bam rnaseq.bam --outFileName forward.bw \
    --normalizeUsing CPM \
    --filterRNAstrand forward

# For gene-level: RPKM accounts for gene length
bamCoverage --bam rnaseq.bam --outFileName output.bw \
    --normalizeUsing RPKM
```

**Reasoning:** CPM for comparing fixed-width bins; RPKM for genes (accounts for length).

---

### For ATAC-seq

**Recommended:** RPGC or CPM

```bash
bamCoverage --bam atac_shifted.bam --outFileName atac.bw \
    --normalizeUsing RPGC \
    --effectiveGenomeSize 2913022398
```

**Reasoning:** Similar to ChIP-seq; want comparable coverage across samples.

---

### For Sample Correlation Analysis

**Recommended:** CPM or RPGC

```bash
multiBamSummary bins \
    --bamfiles sample1.bam sample2.bam sample3.bam \
    -o readCounts.npz

plotCorrelation -in readCounts.npz \
    --corMethod pearson \
    --whatToShow heatmap \
    -o correlation.png
```

**Note:** `multiBamSummary` doesn't explicitly normalize, but correlation analysis is robust to scaling. For very different library sizes, consider normalizing BAM files first or using CPM-normalized bigWig files with `multiBigwigSummary`.

---

## Advanced Normalization Considerations

### Spike-in Normalization

For experiments with spike-in controls (e.g., *Drosophila* chromatin spike-in for ChIP-seq):

1. Calculate scaling factors from spike-in reads
2. Apply custom scaling factors using `--scaleFactor` parameter

```bash
# Calculate spike-in factor (example: 0.8)
SCALE_FACTOR=0.8

bamCoverage --bam chip.bam --outFileName chip_spikenorm.bw \
    --scaleFactor ${SCALE_FACTOR} \
    --extendReads 200
```

---

### Manual Scaling Factors

You can apply custom scaling factors:

```bash
# Apply 2× scaling
bamCoverage --bam input.bam --outFileName output.bw \
    --scaleFactor 2.0
```

---

### Chromosome Exclusion

Exclude specific chromosomes from normalization calculations:

```bash
bamCoverage --bam input.bam --outFileName output.bw \
    --normalizeUsing RPGC \
    --effectiveGenomeSize 2913022398 \
    --ignoreForNormalization chrX chrY chrM
```

**When to use:** Sex chromosomes in mixed-sex samples, mitochondrial DNA, or chromosomes with unusual coverage.

---

## Common Pitfalls

### 1. Using RPKM for bin-based data
**Problem:** RPKM accounts for region length, but all bins are the same size
**Solution:** Use CPM or RPGC instead

### 2. Comparing unnormalized samples
**Problem:** Sample with 2× sequencing depth appears to have 2× signal
**Solution:** Always normalize when comparing samples

### 3. Wrong effective genome size
**Problem:** Using hg19 genome size for hg38 data
**Solution:** Double-check genome assembly and use correct size

### 4. Ignoring duplicates after GC correction
**Problem:** Can introduce bias
**Solution:** Never use `--ignoreDuplicates` after `correctGCBias`

### 5. Using RPGC without effective genome size
**Problem:** Command fails
**Solution:** Always specify `--effectiveGenomeSize` with RPGC

---

## Normalization for Different Comparisons

### Within-sample comparisons (different regions)
**Use:** RPKM (accounts for region length)

### Between-sample comparisons (same regions)
**Use:** CPM, RPGC, or BPM (accounts for library size)

### Treatment vs Control
**Use:** bamCompare with log2 ratio and readCount/SES scaling

### Multiple samples correlation
**Use:** CPM or RPGC normalized bigWig files, then multiBigwigSummary

---

## Quick Reference Table

| Method | Accounts for Depth | Accounts for Length | Best For | Command |
|--------|-------------------|---------------------|----------|---------|
| RPKM | ✓ | ✓ | RNA-seq genes | `--normalizeUsing RPKM` |
| CPM | ✓ | ✗ | Fixed-size bins | `--normalizeUsing CPM` |
| BPM | ✓ | ✗ | Specific regions | `--normalizeUsing BPM` |
| RPGC | ✓ | ✗ | Interpretable coverage | `--normalizeUsing RPGC --effectiveGenomeSize X` |
| None | ✗ | ✗ | Raw data | `--normalizeUsing None` |
| SES | ✓ | ✗ | ChIP comparisons | `bamCompare --scaleFactorsMethod SES` |
| readCount | ✓ | ✗ | ChIP comparisons | `bamCompare --scaleFactorsMethod readCount` |

---

## Further Reading

For more details on normalization theory and best practices:
- deepTools documentation: https://deeptools.readthedocs.io/
- ENCODE guidelines for ChIP-seq analysis
- RNA-seq normalization papers (DESeq2, TMM methods)
