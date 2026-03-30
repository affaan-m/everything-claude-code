# deepTools Common Workflows

This document provides complete workflow examples for common deepTools analyses.

## ChIP-seq Quality Control Workflow

Complete quality control assessment for ChIP-seq experiments.

### Step 1: Initial Correlation Assessment

Compare replicates and samples to verify experimental quality:

```bash
# Generate coverage matrix across genome
multiBamSummary bins \
    --bamfiles Input1.bam Input2.bam ChIP1.bam ChIP2.bam \
    --labels Input_rep1 Input_rep2 ChIP_rep1 ChIP_rep2 \
    -o readCounts.npz \
    --numberOfProcessors 8

# Create correlation heatmap
plotCorrelation \
    -in readCounts.npz \
    --corMethod pearson \
    --whatToShow heatmap \
    --plotFile correlation_heatmap.png \
    --plotNumbers

# Generate PCA plot
plotPCA \
    -in readCounts.npz \
    -o PCA_plot.png \
    -T "PCA of ChIP-seq samples"
```

**Expected Results:**
- Replicates should cluster together
- Input samples should be distinct from ChIP samples

---

### Step 2: Coverage and Depth Assessment

```bash
# Check sequencing depth and coverage
plotCoverage \
    --bamfiles Input1.bam ChIP1.bam ChIP2.bam \
    --labels Input ChIP_rep1 ChIP_rep2 \
    --plotFile coverage.png \
    --ignoreDuplicates \
    --numberOfProcessors 8
```

**Interpretation:** Assess whether sequencing depth is adequate for downstream analysis.

---

### Step 3: Fragment Size Validation (Paired-end)

```bash
# Verify expected fragment sizes
bamPEFragmentSize \
    --bamfiles Input1.bam ChIP1.bam ChIP2.bam \
    --histogram fragmentSizes.png \
    --plotTitle "Fragment Size Distribution"
```

**Expected Results:** Fragment sizes should match library preparation protocols (typically 200-600bp for ChIP-seq).

---

### Step 4: GC Bias Detection and Correction

```bash
# Compute GC bias
computeGCBias \
    --bamfile ChIP1.bam \
    --effectiveGenomeSize 2913022398 \
    --genome genome.2bit \
    --fragmentLength 200 \
    --biasPlot GCbias.png \
    --frequenciesFile freq.txt

# If bias detected, correct it
correctGCBias \
    --bamfile ChIP1.bam \
    --effectiveGenomeSize 2913022398 \
    --genome genome.2bit \
    --GCbiasFrequenciesFile freq.txt \
    --correctedFile ChIP1_GCcorrected.bam
```

**Note:** Only correct if significant bias is observed. Do NOT use `--ignoreDuplicates` with GC-corrected files.

---

### Step 5: ChIP Signal Strength Assessment

```bash
# Evaluate ChIP enrichment quality
plotFingerprint \
    --bamfiles Input1.bam ChIP1.bam ChIP2.bam \
    --labels Input ChIP_rep1 ChIP_rep2 \
    --plotFile fingerprint.png \
    --extendReads 200 \
    --ignoreDuplicates \
    --numberOfProcessors 8 \
    --outQualityMetrics fingerprint_metrics.txt
```

**Interpretation:**
- Strong ChIP: Steep rise in cumulative curve
- Weak enrichment: Curve close to diagonal (input-like)

---

## ChIP-seq Analysis Workflow

Complete workflow from BAM files to publication-quality visualizations.

### Step 1: Generate Normalized Coverage Tracks

```bash
# Input control
bamCoverage \
    --bam Input.bam \
    --outFileName Input_coverage.bw \
    --normalizeUsing RPGC \
    --effectiveGenomeSize 2913022398 \
    --binSize 10 \
    --extendReads 200 \
    --ignoreDuplicates \
    --numberOfProcessors 8

# ChIP sample
bamCoverage \
    --bam ChIP.bam \
    --outFileName ChIP_coverage.bw \
    --normalizeUsing RPGC \
    --effectiveGenomeSize 2913022398 \
    --binSize 10 \
    --extendReads 200 \
    --ignoreDuplicates \
    --numberOfProcessors 8
```

---

### Step 2: Create Log2 Ratio Track

```bash
# Compare ChIP to Input
bamCompare \
    --bamfile1 ChIP.bam \
    --bamfile2 Input.bam \
    --outFileName ChIP_vs_Input_log2ratio.bw \
    --operation log2 \
    --scaleFactorsMethod readCount \
    --binSize 10 \
    --extendReads 200 \
    --ignoreDuplicates \
    --numberOfProcessors 8
```

**Result:** Log2 ratio track showing enrichment (positive values) and depletion (negative values).

---

### Step 3: Compute Matrix Around TSS

```bash
# Prepare data for heatmap/profile around transcription start sites
computeMatrix reference-point \
    --referencePoint TSS \
    --scoreFileName ChIP_coverage.bw \
    --regionsFileName genes.bed \
    --beforeRegionStartLength 3000 \
    --afterRegionStartLength 3000 \
    --binSize 10 \
    --sortRegions descend \
    --sortUsing mean \
    --outFileName matrix_TSS.gz \
    --outFileNameMatrix matrix_TSS.tab \
    --numberOfProcessors 8
```

---

### Step 4: Generate Heatmap

```bash
# Create heatmap around TSS
plotHeatmap \
    --matrixFile matrix_TSS.gz \
    --outFileName heatmap_TSS.png \
    --colorMap RdBu \
    --whatToShow 'plot, heatmap and colorbar' \
    --zMin -3 --zMax 3 \
    --yAxisLabel "Genes" \
    --xAxisLabel "Distance from TSS (bp)" \
    --refPointLabel "TSS" \
    --heatmapHeight 15 \
    --kmeans 3
```

---

### Step 5: Generate Profile Plot

```bash
# Create meta-profile around TSS
plotProfile \
    --matrixFile matrix_TSS.gz \
    --outFileName profile_TSS.png \
    --plotType lines \
    --perGroup \
    --colors blue \
    --plotTitle "ChIP-seq signal around TSS" \
    --yAxisLabel "Average signal" \
    --xAxisLabel "Distance from TSS (bp)" \
    --refPointLabel "TSS"
```

---

### Step 6: Enrichment at Peaks

```bash
# Calculate enrichment in peak regions
plotEnrichment \
    --bamfiles Input.bam ChIP.bam \
    --BED peaks.bed \
    --labels Input ChIP \
    --plotFile enrichment.png \
    --outRawCounts enrichment_counts.tab \
    --extendReads 200 \
    --ignoreDuplicates
```

---

## RNA-seq Coverage Workflow

Generate strand-specific coverage tracks for RNA-seq data.

### Forward Strand

```bash
bamCoverage \
    --bam rnaseq.bam \
    --outFileName forward_coverage.bw \
    --filterRNAstrand forward \
    --normalizeUsing CPM \
    --binSize 1 \
    --numberOfProcessors 8
```

### Reverse Strand

```bash
bamCoverage \
    --bam rnaseq.bam \
    --outFileName reverse_coverage.bw \
    --filterRNAstrand reverse \
    --normalizeUsing CPM \
    --binSize 1 \
    --numberOfProcessors 8
```

**Important:** Do NOT use `--extendReads` for RNA-seq (would extend over splice junctions).

---

## Multi-Sample Comparison Workflow

Compare multiple ChIP-seq samples (e.g., different conditions or time points).

### Step 1: Generate Coverage Files

```bash
# For each sample
for sample in Control_ChIP Treated_ChIP; do
    bamCoverage \
        --bam ${sample}.bam \
        --outFileName ${sample}.bw \
        --normalizeUsing RPGC \
        --effectiveGenomeSize 2913022398 \
        --binSize 10 \
        --extendReads 200 \
        --ignoreDuplicates \
        --numberOfProcessors 8
done
```

---

### Step 2: Compute Multi-Sample Matrix

```bash
computeMatrix scale-regions \
    --scoreFileName Control_ChIP.bw Treated_ChIP.bw \
    --regionsFileName genes.bed \
    --beforeRegionStartLength 1000 \
    --afterRegionStartLength 1000 \
    --regionBodyLength 3000 \
    --binSize 10 \
    --sortRegions descend \
    --sortUsing mean \
    --outFileName matrix_multi.gz \
    --numberOfProcessors 8
```

---

### Step 3: Multi-Sample Heatmap

```bash
plotHeatmap \
    --matrixFile matrix_multi.gz \
    --outFileName heatmap_comparison.png \
    --colorMap Blues \
    --whatToShow 'plot, heatmap and colorbar' \
    --samplesLabel Control Treated \
    --yAxisLabel "Genes" \
    --heatmapHeight 15 \
    --kmeans 4
```

---

### Step 4: Multi-Sample Profile

```bash
plotProfile \
    --matrixFile matrix_multi.gz \
    --outFileName profile_comparison.png \
    --plotType lines \
    --perGroup \
    --colors blue red \
    --samplesLabel Control Treated \
    --plotTitle "ChIP-seq signal comparison" \
    --startLabel "TSS" \
    --endLabel "TES"
```

---

## ATAC-seq Workflow

Specialized workflow for ATAC-seq data with Tn5 offset correction.

### Step 1: Shift Reads for Tn5 Correction

```bash
alignmentSieve \
    --bam atacseq.bam \
    --outFile atacseq_shifted.bam \
    --ATACshift \
    --minFragmentLength 38 \
    --maxFragmentLength 2000 \
    --ignoreDuplicates
```

---

### Step 2: Generate Coverage Track

```bash
bamCoverage \
    --bam atacseq_shifted.bam \
    --outFileName atacseq_coverage.bw \
    --normalizeUsing RPGC \
    --effectiveGenomeSize 2913022398 \
    --binSize 1 \
    --numberOfProcessors 8
```

---

### Step 3: Fragment Size Analysis

```bash
bamPEFragmentSize \
    --bamfiles atacseq.bam \
    --histogram fragmentSizes_atac.png \
    --maxFragmentLength 1000
```

**Expected Pattern:** Nucleosome ladder with peaks at ~50bp (nucleosome-free), ~200bp (mono-nucleosome), ~400bp (di-nucleosome).

---

## Peak Region Analysis Workflow

Analyze ChIP-seq signal specifically at peak regions.

### Step 1: Matrix at Peaks

```bash
computeMatrix reference-point \
    --referencePoint center \
    --scoreFileName ChIP_coverage.bw \
    --regionsFileName peaks.bed \
    --beforeRegionStartLength 2000 \
    --afterRegionStartLength 2000 \
    --binSize 10 \
    --outFileName matrix_peaks.gz \
    --numberOfProcessors 8
```

---

### Step 2: Heatmap at Peaks

```bash
plotHeatmap \
    --matrixFile matrix_peaks.gz \
    --outFileName heatmap_peaks.png \
    --colorMap YlOrRd \
    --refPointLabel "Peak Center" \
    --heatmapHeight 15 \
    --sortUsing max
```

---

## Troubleshooting Common Issues

### Issue: Out of Memory
**Solution:** Use `--region` parameter to process chromosomes individually:
```bash
bamCoverage --bam input.bam -o chr1.bw --region chr1
```

### Issue: BAM Index Missing
**Solution:** Index BAM files before running deepTools:
```bash
samtools index input.bam
```

### Issue: Slow Processing
**Solution:** Increase `--numberOfProcessors`:
```bash
# Use 8 cores instead of default
--numberOfProcessors 8
```

### Issue: bigWig Files Too Large
**Solution:** Increase bin size:
```bash
--binSize 50  # or larger (default is 10-50)
```

---

## Performance Tips

1. **Use multiple processors:** Always set `--numberOfProcessors` to available cores
2. **Process regions:** Use `--region` for testing or memory-limited environments
3. **Adjust bin size:** Larger bins = faster processing and smaller files
4. **Pre-filter BAM files:** Use `alignmentSieve` to create filtered BAM files once, then reuse
5. **Use bigWig over bedGraph:** bigWig format is compressed and faster to process

---

## Best Practices

1. **Always check QC first:** Run correlation, coverage, and fingerprint analysis before proceeding
2. **Document parameters:** Save command lines for reproducibility
3. **Use consistent normalization:** Apply same normalization method across samples in a comparison
4. **Verify reference genome match:** Ensure BAM files and region files use same genome build
5. **Check strand orientation:** For RNA-seq, verify correct strand orientation
6. **Test on small regions first:** Use `--region chr1:1-1000000` for testing parameters
7. **Keep intermediate files:** Save matrices for regenerating plots with different settings
