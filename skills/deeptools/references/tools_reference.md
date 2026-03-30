# deepTools Complete Tool Reference

This document provides a comprehensive reference for all deepTools command-line utilities organized by category.

## BAM and bigWig File Processing Tools

### multiBamSummary

Computes read coverages for genomic regions across multiple BAM files, outputting compressed numpy arrays for downstream correlation and PCA analysis.

**Modes:**
- **bins**: Genome-wide analysis using consecutive equal-sized windows (default 10kb)
- **BED-file**: Restricts analysis to user-specified genomic regions

**Key Parameters:**
- `--bamfiles, -b`: Indexed BAM files (space-separated, required)
- `--outFileName, -o`: Output coverage matrix file (required)
- `--BED`: Region specification file (BED-file mode only)
- `--binSize`: Window size in bases (default: 10,000)
- `--labels`: Custom sample identifiers
- `--minMappingQuality`: Quality threshold for read inclusion
- `--numberOfProcessors, -p`: Parallel processing cores
- `--extendReads`: Fragment size extension
- `--ignoreDuplicates`: Remove PCR duplicates
- `--outRawCounts`: Export tab-delimited file with coordinate columns and per-sample counts

**Output:** Compressed numpy array (.npz) for plotCorrelation and plotPCA

**Common Usage:**
```bash
# Genome-wide comparison
multiBamSummary bins --bamfiles sample1.bam sample2.bam -o results.npz

# Peak region comparison
multiBamSummary BED-file --BED peaks.bed --bamfiles sample1.bam sample2.bam -o results.npz
```

---

### multiBigwigSummary

Similar to multiBamSummary but operates on bigWig files instead of BAM files. Used for comparing coverage tracks across samples.

**Modes:**
- **bins**: Genome-wide analysis
- **BED-file**: Region-specific analysis

**Key Parameters:** Similar to multiBamSummary but accepts bigWig files

---

### bamCoverage

Converts BAM alignment files into normalized coverage tracks in bigWig or bedGraph formats. Calculates coverage as number of reads per bin.

**Key Parameters:**
- `--bam, -b`: Input BAM file (required)
- `--outFileName, -o`: Output filename (required)
- `--outFileFormat, -of`: Output type (bigwig or bedgraph)
- `--normalizeUsing`: Normalization method
  - **RPKM**: Reads Per Kilobase per Million mapped reads
  - **CPM**: Counts Per Million mapped reads
  - **BPM**: Bins Per Million mapped reads
  - **RPGC**: Reads per genomic content (requires --effectiveGenomeSize)
  - **None**: No normalization (default)
- `--effectiveGenomeSize`: Mappable genome size (required for RPGC)
- `--binSize`: Resolution in base pairs (default: 50)
- `--extendReads, -e`: Extend reads to fragment length (recommended for ChIP-seq, NOT for RNA-seq)
- `--centerReads`: Center reads at fragment length for sharper signals
- `--ignoreDuplicates`: Count identical reads only once
- `--minMappingQuality`: Filter reads below quality threshold
- `--minFragmentLength / --maxFragmentLength`: Fragment length filtering
- `--smoothLength`: Window averaging for noise reduction
- `--MNase`: Analyze MNase-seq data for nucleosome positioning
- `--Offset`: Position-specific offsets (useful for RiboSeq, GROseq)
- `--filterRNAstrand`: Separate forward/reverse strand reads
- `--ignoreForNormalization`: Exclude chromosomes from normalization (e.g., sex chromosomes)
- `--numberOfProcessors, -p`: Parallel processing

**Important Notes:**
- For RNA-seq: Do NOT use --extendReads (would extend over splice junctions)
- For ChIP-seq: Use --extendReads with smaller bin sizes
- Never apply --ignoreDuplicates after GC bias correction

**Common Usage:**
```bash
# Basic coverage with RPKM normalization
bamCoverage --bam input.bam --outFileName coverage.bw --normalizeUsing RPKM

# ChIP-seq with extension
bamCoverage --bam chip.bam --outFileName chip_coverage.bw \
    --binSize 10 --extendReads 200 --ignoreDuplicates

# Strand-specific RNA-seq
bamCoverage --bam rnaseq.bam --outFileName forward.bw \
    --filterRNAstrand forward
```

---

### bamCompare

Compares two BAM files by generating bigWig or bedGraph files, normalizing for sequencing depth differences. Processes genome in equal-sized bins and performs per-bin calculations.

**Comparison Methods:**
- **log2** (default): Log2 ratio of samples
- **ratio**: Direct ratio calculation
- **subtract**: Difference between files
- **add**: Sum of samples
- **mean**: Average across samples
- **reciprocal_ratio**: Negative inverse for ratios < 0
- **first/second**: Output scaled signal from single file

**Normalization Methods:**
- **readCount** (default): Compensates for sequencing depth
- **SES**: Selective enrichment statistics
- **RPKM**: Reads per kilobase per million
- **CPM**: Counts per million
- **BPM**: Bins per million
- **RPGC**: Reads per genomic content (requires --effectiveGenomeSize)

**Key Parameters:**
- `--bamfile1, -b1`: First BAM file (required)
- `--bamfile2, -b2`: Second BAM file (required)
- `--outFileName, -o`: Output filename (required)
- `--outFileFormat`: bigwig or bedgraph
- `--operation`: Comparison method (see above)
- `--scaleFactorsMethod`: Normalization method (see above)
- `--binSize`: Bin width for output (default: 50bp)
- `--pseudocount`: Avoid division by zero (default: 1)
- `--extendReads`: Extend reads to fragment length
- `--ignoreDuplicates`: Count identical reads once
- `--minMappingQuality`: Quality threshold
- `--numberOfProcessors, -p`: Parallelization

**Common Usage:**
```bash
# Log2 ratio of treatment vs control
bamCompare -b1 treatment.bam -b2 control.bam -o log2ratio.bw

# Subtract control from treatment
bamCompare -b1 treatment.bam -b2 control.bam -o difference.bw \
    --operation subtract --scaleFactorsMethod readCount
```

---

### correctGCBias / computeGCBias

**computeGCBias:** Identifies GC-content bias from sequencing and PCR amplification.

**correctGCBias:** Corrects BAM files for GC bias detected by computeGCBias.

**Key Parameters (computeGCBias):**
- `--bamfile, -b`: Input BAM file
- `--effectiveGenomeSize`: Mappable genome size
- `--genome, -g`: Reference genome in 2bit format
- `--fragmentLength, -l`: Fragment length (for single-end)
- `--biasPlot`: Output diagnostic plot

**Key Parameters (correctGCBias):**
- `--bamfile, -b`: Input BAM file
- `--effectiveGenomeSize`: Mappable genome size
- `--genome, -g`: Reference genome in 2bit format
- `--GCbiasFrequenciesFile`: Frequencies from computeGCBias
- `--correctedFile, -o`: Output corrected BAM

**Important:** Never use --ignoreDuplicates after GC bias correction

---

### alignmentSieve

Filters BAM files by various quality metrics on-the-fly. Useful for creating filtered BAM files for specific analyses.

**Key Parameters:**
- `--bam, -b`: Input BAM file
- `--outFile, -o`: Output BAM file
- `--minMappingQuality`: Minimum mapping quality
- `--ignoreDuplicates`: Remove duplicates
- `--minFragmentLength / --maxFragmentLength`: Fragment length filters
- `--samFlagInclude / --samFlagExclude`: SAM flag filtering
- `--shift`: Shift reads (e.g., for ATACseq Tn5 correction)
- `--ATACshift`: Automatically shift for ATAC-seq data

---

### computeMatrix

Calculates scores per genomic region and prepares matrices for plotHeatmap and plotProfile. Processes bigWig score files and BED/GTF region files.

**Modes:**
- **reference-point**: Signal distribution relative to specific position (TSS, TES, or center)
- **scale-regions**: Signal across regions standardized to uniform lengths

**Key Parameters:**
- `-R`: Region file(s) in BED/GTF format (required)
- `-S`: BigWig score file(s) (required)
- `-o`: Output matrix file (required)
- `-b`: Upstream distance from reference point
- `-a`: Downstream distance from reference point
- `-m`: Region body length (scale-regions only)
- `-bs, --binSize`: Bin size for averaging scores
- `--skipZeros`: Skip regions with all zeros
- `--minThreshold / --maxThreshold`: Filter by signal intensity
- `--sortRegions`: ascending, descending, keep, no
- `--sortUsing`: mean, median, max, min, sum, region_length
- `-p, --numberOfProcessors`: Parallel processing
- `--averageTypeBins`: Statistical method (mean, median, min, max, sum, std)

**Output Options:**
- `--outFileNameMatrix`: Export tab-delimited data
- `--outFileSortedRegions`: Save filtered/sorted BED file

**Common Usage:**
```bash
# TSS analysis
computeMatrix reference-point -S signal.bw -R genes.bed \
    -o matrix.gz -b 2000 -a 2000 --referencePoint TSS

# Scaled gene body
computeMatrix scale-regions -S signal.bw -R genes.bed \
    -o matrix.gz -b 1000 -a 1000 -m 3000
```

---

## Quality Control Tools

### plotFingerprint

Quality control tool primarily for ChIP-seq experiments. Assesses whether antibody enrichment was successful. Generates cumulative read coverage profiles to distinguish signal from noise.

**Key Parameters:**
- `--bamfiles, -b`: Indexed BAM files (required)
- `--plotFile, -plot, -o`: Output image filename (required)
- `--extendReads, -e`: Extend reads to fragment length
- `--ignoreDuplicates`: Count identical reads once
- `--minMappingQuality`: Mapping quality filter
- `--centerReads`: Center reads at fragment length
- `--minFragmentLength / --maxFragmentLength`: Fragment filters
- `--outRawCounts`: Save per-bin read counts
- `--outQualityMetrics`: Output QC metrics (Jensen-Shannon distance)
- `--labels`: Custom sample names
- `--numberOfProcessors, -p`: Parallel processing

**Interpretation:**
- Ideal control: Straight diagonal line
- Strong ChIP: Steep rise towards highest rank (concentrated reads in few bins)
- Weak enrichment: Flatter curve approaching diagonal

**Common Usage:**
```bash
plotFingerprint -b input.bam chip1.bam chip2.bam \
    --labels Input ChIP1 ChIP2 -o fingerprint.png \
    --extendReads 200 --ignoreDuplicates
```

---

### plotCoverage

Visualizes average read distribution across the genome. Shows genome coverage and helps determine if sequencing depth is adequate.

**Key Parameters:**
- `--bamfiles, -b`: BAM files to analyze (required)
- `--plotFile, -o`: Output plot filename (required)
- `--ignoreDuplicates`: Remove PCR duplicates
- `--minMappingQuality`: Quality threshold
- `--outRawCounts`: Save underlying data
- `--labels`: Sample names
- `--numberOfSamples`: Number of positions to sample (default: 1,000,000)

---

### bamPEFragmentSize

Determines fragment length distribution for paired-end sequencing data. Essential QC to verify expected fragment sizes from library preparation.

**Key Parameters:**
- `--bamfiles, -b`: BAM files (required)
- `--histogram, -hist`: Output histogram filename (required)
- `--plotTitle, -T`: Plot title
- `--maxFragmentLength`: Maximum length to consider (default: 1000)
- `--logScale`: Use logarithmic Y-axis
- `--outRawFragmentLengths`: Save raw fragment lengths

---

### plotCorrelation

Analyzes sample correlations from multiBamSummary or multiBigwigSummary outputs. Shows how similar different samples are.

**Correlation Methods:**
- **Pearson**: Measures metric differences; sensitive to outliers; appropriate for normally distributed data
- **Spearman**: Rank-based; less influenced by outliers; better for non-normal distributions

**Visualization Options:**
- **heatmap**: Color intensity with hierarchical clustering (complete linkage)
- **scatterplot**: Pairwise scatter plots with correlation coefficients

**Key Parameters:**
- `--corData, -in`: Input matrix from multiBamSummary/multiBigwigSummary (required)
- `--corMethod`: pearson or spearman (required)
- `--whatToShow`: heatmap or scatterplot (required)
- `--plotFile, -o`: Output filename (required)
- `--skipZeros`: Exclude zero-value regions
- `--removeOutliers`: Use median absolute deviation (MAD) filtering
- `--outFileCorMatrix`: Export correlation matrix
- `--labels`: Custom sample names
- `--plotTitle`: Plot title
- `--colorMap`: Color scheme (50+ options)
- `--plotNumbers`: Display correlation values on heatmap

**Common Usage:**
```bash
# Heatmap with Pearson correlation
plotCorrelation -in readCounts.npz --corMethod pearson \
    --whatToShow heatmap -o correlation_heatmap.png --plotNumbers

# Scatterplot with Spearman correlation
plotCorrelation -in readCounts.npz --corMethod spearman \
    --whatToShow scatterplot -o correlation_scatter.png
```

---

### plotPCA

Generates principal component analysis plots from multiBamSummary or multiBigwigSummary output. Displays sample relationships in reduced dimensionality.

**Key Parameters:**
- `--corData, -in`: Coverage file from multiBamSummary/multiBigwigSummary (required)
- `--plotFile, -o`: Output image (png, eps, pdf, svg) (required)
- `--outFileNameData`: Export PCA data (loadings/rotation and eigenvalues)
- `--labels, -l`: Custom sample labels
- `--plotTitle, -T`: Plot title
- `--plotHeight / --plotWidth`: Dimensions in centimeters
- `--colors`: Custom symbol colors
- `--markers`: Symbol shapes
- `--transpose`: Perform PCA on transposed matrix (rows=samples)
- `--ntop`: Use top N variable rows (default: 1000)
- `--PCs`: Components to plot (default: 1 2)
- `--log2`: Log2-transform data before analysis
- `--rowCenter`: Center each row at 0

**Common Usage:**
```bash
plotPCA -in readCounts.npz -o PCA_plot.png \
    -T "PCA of read counts" --transpose
```

---

## Visualization Tools

### plotHeatmap

Creates genomic region heatmaps from computeMatrix output. Generates publication-quality visualizations.

**Key Parameters:**
- `--matrixFile, -m`: Matrix from computeMatrix (required)
- `--outFileName, -o`: Output image (png, eps, pdf, svg) (required)
- `--outFileSortedRegions`: Save regions after filtering
- `--outFileNameMatrix`: Export matrix values
- `--interpolationMethod`: auto, nearest, bilinear, bicubic, gaussian
  - Default: nearest (≤1000 columns), bilinear (>1000 columns)
- `--dpi`: Figure resolution

**Clustering:**
- `--kmeans`: k-means clustering
- `--hclust`: Hierarchical clustering (slower for >1000 regions)
- `--silhouette`: Calculate cluster quality metrics

**Visual Customization:**
- `--heatmapHeight / --heatmapWidth`: Dimensions (3-100 cm)
- `--whatToShow`: plot, heatmap, colorbar (combinations)
- `--alpha`: Transparency (0-1)
- `--colorMap`: 50+ color schemes
- `--colorList`: Custom gradient colors
- `--zMin / --zMax`: Intensity scale limits
- `--boxAroundHeatmaps`: yes/no (default: yes)

**Labels:**
- `--xAxisLabel / --yAxisLabel`: Axis labels
- `--regionsLabel`: Region set identifiers
- `--samplesLabel`: Sample names
- `--refPointLabel`: Reference point label
- `--startLabel / --endLabel`: Region boundary labels

**Common Usage:**
```bash
# Basic heatmap
plotHeatmap -m matrix.gz -o heatmap.png

# With clustering and custom colors
plotHeatmap -m matrix.gz -o heatmap.png \
    --kmeans 3 --colorMap RdBu --zMin -3 --zMax 3
```

---

### plotProfile

Generates profile plots showing scores across genomic regions using computeMatrix output.

**Key Parameters:**
- `--matrixFile, -m`: Matrix from computeMatrix (required)
- `--outFileName, -o`: Output image (png, eps, pdf, svg) (required)
- `--plotType`: lines, fill, se, std, overlapped_lines, heatmap
- `--colors`: Color palette (names or hex codes)
- `--plotHeight / --plotWidth`: Dimensions in centimeters
- `--yMin / --yMax`: Y-axis range
- `--averageType`: mean, median, min, max, std, sum

**Clustering:**
- `--kmeans`: k-means clustering
- `--hclust`: Hierarchical clustering
- `--silhouette`: Cluster quality metrics

**Labels:**
- `--plotTitle`: Main heading
- `--regionsLabel`: Region set identifiers
- `--samplesLabel`: Sample names
- `--startLabel / --endLabel`: Region boundary labels (scale-regions mode)

**Output Options:**
- `--outFileNameData`: Export data as tab-separated values
- `--outFileSortedRegions`: Save filtered/sorted regions as BED

**Common Usage:**
```bash
# Line plot
plotProfile -m matrix.gz -o profile.png --plotType lines

# With standard error shading
plotProfile -m matrix.gz -o profile.png --plotType se \
    --colors blue red green
```

---

### plotEnrichment

Calculates and visualizes signal enrichment across genomic regions. Measures percentage of alignments overlapping region groups. Useful for FRiP (Fragment in Peaks) scores.

**Key Parameters:**
- `--bamfiles, -b`: Indexed BAM files (required)
- `--BED`: Region files in BED/GTF format (required)
- `--plotFile, -o`: Output visualization (png, pdf, eps, svg)
- `--labels, -l`: Custom sample identifiers
- `--outRawCounts`: Export numerical data
- `--perSample`: Group by sample instead of feature (default)
- `--regionLabels`: Custom region names

**Read Processing:**
- `--minFragmentLength / --maxFragmentLength`: Fragment filters
- `--minMappingQuality`: Quality threshold
- `--samFlagInclude / --samFlagExclude`: SAM flag filters
- `--ignoreDuplicates`: Remove duplicates
- `--centerReads`: Center reads for sharper signal

**Common Usage:**
```bash
plotEnrichment -b Input.bam H3K4me3.bam \
    --BED peaks_up.bed peaks_down.bed \
    --regionLabels "Up regulated" "Down regulated" \
    -o enrichment.png
```

---

## Miscellaneous Tools

### computeMatrixOperations

Advanced matrix manipulation tool for combining or subsetting matrices from computeMatrix. Enables complex multi-sample, multi-region analyses.

**Operations:**
- `cbind`: Combine matrices column-wise
- `rbind`: Combine matrices row-wise
- `subset`: Extract specific samples or regions
- `filterStrand`: Keep only regions on specific strand
- `filterValues`: Apply signal intensity filters
- `sort`: Order regions by various criteria
- `dataRange`: Report min/max values

**Common Usage:**
```bash
# Combine matrices
computeMatrixOperations cbind -m matrix1.gz matrix2.gz -o combined.gz

# Extract specific samples
computeMatrixOperations subset -m matrix.gz --samples 0 2 -o subset.gz
```

---

### estimateReadFiltering

Predicts the impact of various filtering parameters without actually filtering. Helps optimize filtering strategies before running full analyses.

**Key Parameters:**
- `--bamfiles, -b`: BAM files to analyze
- `--sampleSize`: Number of reads to sample (default: 100,000)
- `--binSize`: Bin size for analysis
- `--distanceBetweenBins`: Spacing between sampled bins

**Filtration Options to Test:**
- `--minMappingQuality`: Test quality thresholds
- `--ignoreDuplicates`: Assess duplicate impact
- `--minFragmentLength / --maxFragmentLength`: Test fragment filters

---

## Common Parameters Across Tools

Many deepTools commands share these filtering and performance options:

**Read Filtering:**
- `--ignoreDuplicates`: Remove PCR duplicates
- `--minMappingQuality`: Filter by alignment confidence
- `--samFlagInclude / --samFlagExclude`: SAM format filtering
- `--minFragmentLength / --maxFragmentLength`: Fragment length bounds

**Performance:**
- `--numberOfProcessors, -p`: Enable parallel processing
- `--region`: Process specific genomic regions (chr:start-end)

**Read Processing:**
- `--extendReads`: Extend to fragment length
- `--centerReads`: Center at fragment midpoint
- `--ignoreDuplicates`: Count unique reads only
