---
name: deeptools
description: NGS analysis toolkit. BAM to bigWig conversion, QC (correlation, PCA, fingerprints), heatmaps/profiles (TSS, peaks), for ChIP-seq, RNA-seq, ATAC-seq visualization.
license: BSD license
metadata:
    skill-author: K-Dense Inc.
---

# deepTools: NGS Data Analysis Toolkit

## Overview

deepTools is a comprehensive suite of Python command-line tools designed for processing and analyzing high-throughput sequencing data. Use deepTools to perform quality control, normalize data, compare samples, and generate publication-quality visualizations for ChIP-seq, RNA-seq, ATAC-seq, MNase-seq, and other NGS experiments.

**Core capabilities:**
- Convert BAM alignments to normalized coverage tracks (bigWig/bedGraph)
- Quality control assessment (fingerprint, correlation, coverage)
- Sample comparison and correlation analysis
- Heatmap and profile plot generation around genomic features
- Enrichment analysis and peak region visualization

## When to Use This Skill

This skill should be used when:

- **File conversion**: "Convert BAM to bigWig", "generate coverage tracks", "normalize ChIP-seq data"
- **Quality control**: "check ChIP quality", "compare replicates", "assess sequencing depth", "QC analysis"
- **Visualization**: "create heatmap around TSS", "plot ChIP signal", "visualize enrichment", "generate profile plot"
- **Sample comparison**: "compare treatment vs control", "correlate samples", "PCA analysis"
- **Analysis workflows**: "analyze ChIP-seq data", "RNA-seq coverage", "ATAC-seq analysis", "complete workflow"
- **Working with specific file types**: BAM files, bigWig files, BED region files in genomics context

## Quick Start

For users new to deepTools, start with file validation and common workflows:

### 1. Validate Input Files

Before running any analysis, validate BAM, bigWig, and BED files using the validation script:

```bash
python scripts/validate_files.py --bam sample1.bam sample2.bam --bed regions.bed
```

This checks file existence, BAM indices, and format correctness.

### 2. Generate Workflow Template

For standard analyses, use the workflow generator to create customized scripts:

```bash
# List available workflows
python scripts/workflow_generator.py --list

# Generate ChIP-seq QC workflow
python scripts/workflow_generator.py chipseq_qc -o qc_workflow.sh \
    --input-bam Input.bam --chip-bams "ChIP1.bam ChIP2.bam" \
    --genome-size 2913022398

# Make executable and run
chmod +x qc_workflow.sh
./qc_workflow.sh
```

### 3. Most Common Operations

See `assets/quick_reference.md` for frequently used commands and parameters.

## Installation

```bash
uv pip install deeptools
```

## Core Workflows

deepTools workflows typically follow this pattern: **QC → Normalization → Comparison/Visualization**

### ChIP-seq Quality Control Workflow

When users request ChIP-seq QC or quality assessment:

1. **Generate workflow script** using `scripts/workflow_generator.py chipseq_qc`
2. **Key QC steps**:
   - Sample correlation (multiBamSummary + plotCorrelation)
   - PCA analysis (plotPCA)
   - Coverage assessment (plotCoverage)
   - Fragment size validation (bamPEFragmentSize)
   - ChIP enrichment strength (plotFingerprint)

**Interpreting results:**
- **Correlation**: Replicates should cluster together with high correlation (>0.9)
- **Fingerprint**: Strong ChIP shows steep rise; flat diagonal indicates poor enrichment
- **Coverage**: Assess if sequencing depth is adequate for analysis

Full workflow details in `references/workflows.md` → "ChIP-seq Quality Control Workflow"

### ChIP-seq Complete Analysis Workflow

For full ChIP-seq analysis from BAM to visualizations:

1. **Generate coverage tracks** with normalization (bamCoverage)
2. **Create comparison tracks** (bamCompare for log2 ratio)
3. **Compute signal matrices** around features (computeMatrix)
4. **Generate visualizations** (plotHeatmap, plotProfile)
5. **Enrichment analysis** at peaks (plotEnrichment)

Use `scripts/workflow_generator.py chipseq_analysis` to generate template.

Complete command sequences in `references/workflows.md` → "ChIP-seq Analysis Workflow"

### RNA-seq Coverage Workflow

For strand-specific RNA-seq coverage tracks:

Use bamCoverage with `--filterRNAstrand` to separate forward and reverse strands.

**Important:** NEVER use `--extendReads` for RNA-seq (would extend over splice junctions).

Use normalization: CPM for fixed bins, RPKM for gene-level analysis.

Template available: `scripts/workflow_generator.py rnaseq_coverage`

Details in `references/workflows.md` → "RNA-seq Coverage Workflow"

### ATAC-seq Analysis Workflow

ATAC-seq requires Tn5 offset correction:

1. **Shift reads** using alignmentSieve with `--ATACshift`
2. **Generate coverage** with bamCoverage
3. **Analyze fragment sizes** (expect nucleosome ladder pattern)
4. **Visualize at peaks** if available

Template: `scripts/workflow_generator.py atacseq`

Full workflow in `references/workflows.md` → "ATAC-seq Workflow"

## Tool Categories and Common Tasks

### BAM/bigWig Processing

**Convert BAM to normalized coverage:**
```bash
bamCoverage --bam input.bam --outFileName output.bw \
    --normalizeUsing RPGC --effectiveGenomeSize 2913022398 \
    --binSize 10 --numberOfProcessors 8
```

**Compare two samples (log2 ratio):**
```bash
bamCompare -b1 treatment.bam -b2 control.bam -o ratio.bw \
    --operation log2 --scaleFactorsMethod readCount
```

**Key tools:** bamCoverage, bamCompare, multiBamSummary, multiBigwigSummary, correctGCBias, alignmentSieve

Complete reference: `references/tools_reference.md` → "BAM and bigWig File Processing Tools"

### Quality Control

**Check ChIP enrichment:**
```bash
plotFingerprint -b input.bam chip.bam -o fingerprint.png \
    --extendReads 200 --ignoreDuplicates
```

**Sample correlation:**
```bash
multiBamSummary bins --bamfiles *.bam -o counts.npz
plotCorrelation -in counts.npz --corMethod pearson \
    --whatToShow heatmap -o correlation.png
```

**Key tools:** plotFingerprint, plotCoverage, plotCorrelation, plotPCA, bamPEFragmentSize

Complete reference: `references/tools_reference.md` → "Quality Control Tools"

### Visualization

**Create heatmap around TSS:**
```bash
# Compute matrix
computeMatrix reference-point -S signal.bw -R genes.bed \
    -b 3000 -a 3000 --referencePoint TSS -o matrix.gz

# Generate heatmap
plotHeatmap -m matrix.gz -o heatmap.png \
    --colorMap RdBu --kmeans 3
```

**Create profile plot:**
```bash
plotProfile -m matrix.gz -o profile.png \
    --plotType lines --colors blue red
```

**Key tools:** computeMatrix, plotHeatmap, plotProfile, plotEnrichment

Complete reference: `references/tools_reference.md` → "Visualization Tools"

## Normalization Methods

Choosing the correct normalization is critical for valid comparisons. Consult `references/normalization_methods.md` for comprehensive guidance.

**Quick selection guide:**

- **ChIP-seq coverage**: Use RPGC or CPM
- **ChIP-seq comparison**: Use bamCompare with log2 and readCount
- **RNA-seq bins**: Use CPM
- **RNA-seq genes**: Use RPKM (accounts for gene length)
- **ATAC-seq**: Use RPGC or CPM

**Normalization methods:**
- **RPGC**: 1× genome coverage (requires --effectiveGenomeSize)
- **CPM**: Counts per million mapped reads
- **RPKM**: Reads per kb per million (accounts for region length)
- **BPM**: Bins per million
- **None**: Raw counts (not recommended for comparisons)

Full explanation: `references/normalization_methods.md`

## Effective Genome Sizes

RPGC normalization requires effective genome size. Common values:

| Organism | Assembly | Size | Usage |
|----------|----------|------|-------|
| Human | GRCh38/hg38 | 2,913,022,398 | `--effectiveGenomeSize 2913022398` |
| Mouse | GRCm38/mm10 | 2,652,783,500 | `--effectiveGenomeSize 2652783500` |
| Zebrafish | GRCz11 | 1,368,780,147 | `--effectiveGenomeSize 1368780147` |
| *Drosophila* | dm6 | 142,573,017 | `--effectiveGenomeSize 142573017` |
| *C. elegans* | ce10/ce11 | 100,286,401 | `--effectiveGenomeSize 100286401` |

Complete table with read-length-specific values: `references/effective_genome_sizes.md`

## Common Parameters Across Tools

Many deepTools commands share these options:

**Performance:**
- `--numberOfProcessors, -p`: Enable parallel processing (always use available cores)
- `--region`: Process specific regions for testing (e.g., `chr1:1-1000000`)

**Read Filtering:**
- `--ignoreDuplicates`: Remove PCR duplicates (recommended for most analyses)
- `--minMappingQuality`: Filter by alignment quality (e.g., `--minMappingQuality 10`)
- `--minFragmentLength` / `--maxFragmentLength`: Fragment length bounds
- `--samFlagInclude` / `--samFlagExclude`: SAM flag filtering

**Read Processing:**
- `--extendReads`: Extend to fragment length (ChIP-seq: YES, RNA-seq: NO)
- `--centerReads`: Center at fragment midpoint for sharper signals

## Best Practices

### File Validation
**Always validate files first** using `scripts/validate_files.py` to check:
- File existence and readability
- BAM indices present (.bai files)
- BED format correctness
- File sizes reasonable

### Analysis Strategy

1. **Start with QC**: Run correlation, coverage, and fingerprint analysis before proceeding
2. **Test on small regions**: Use `--region chr1:1-10000000` for parameter testing
3. **Document commands**: Save full command lines for reproducibility
4. **Use consistent normalization**: Apply same method across samples in comparisons
5. **Verify genome assembly**: Ensure BAM and BED files use matching genome builds

### ChIP-seq Specific

- **Always extend reads** for ChIP-seq: `--extendReads 200`
- **Remove duplicates**: Use `--ignoreDuplicates` in most cases
- **Check enrichment first**: Run plotFingerprint before detailed analysis
- **GC correction**: Only apply if significant bias detected; never use `--ignoreDuplicates` after GC correction

### RNA-seq Specific

- **Never extend reads** for RNA-seq (would span splice junctions)
- **Strand-specific**: Use `--filterRNAstrand forward/reverse` for stranded libraries
- **Normalization**: CPM for bins, RPKM for genes

### ATAC-seq Specific

- **Apply Tn5 correction**: Use alignmentSieve with `--ATACshift`
- **Fragment filtering**: Set appropriate min/max fragment lengths
- **Check nucleosome pattern**: Fragment size plot should show ladder pattern

### Performance Optimization

1. **Use multiple processors**: `--numberOfProcessors 8` (or available cores)
2. **Increase bin size** for faster processing and smaller files
3. **Process chromosomes separately** for memory-limited systems
4. **Pre-filter BAM files** using alignmentSieve to create reusable filtered files
5. **Use bigWig over bedGraph**: Compressed and faster to process

## Troubleshooting

### Common Issues

**BAM index missing:**
```bash
samtools index input.bam
```

**Out of memory:**
Process chromosomes individually using `--region`:
```bash
bamCoverage --bam input.bam -o chr1.bw --region chr1
```

**Slow processing:**
Increase `--numberOfProcessors` and/or increase `--binSize`

**bigWig files too large:**
Increase bin size: `--binSize 50` or larger

### Validation Errors

Run validation script to identify issues:
```bash
python scripts/validate_files.py --bam *.bam --bed regions.bed
```

Common errors and solutions explained in script output.

## Reference Documentation

This skill includes comprehensive reference documentation:

### references/tools_reference.md
Complete documentation of all deepTools commands organized by category:
- BAM and bigWig processing tools (9 tools)
- Quality control tools (6 tools)
- Visualization tools (3 tools)
- Miscellaneous tools (2 tools)

Each tool includes:
- Purpose and overview
- Key parameters with explanations
- Usage examples
- Important notes and best practices

**Use this reference when:** Users ask about specific tools, parameters, or detailed usage.

### references/workflows.md
Complete workflow examples for common analyses:
- ChIP-seq quality control workflow
- ChIP-seq complete analysis workflow
- RNA-seq coverage workflow
- ATAC-seq analysis workflow
- Multi-sample comparison workflow
- Peak region analysis workflow
- Troubleshooting and performance tips

**Use this reference when:** Users need complete analysis pipelines or workflow examples.

### references/normalization_methods.md
Comprehensive guide to normalization methods:
- Detailed explanation of each method (RPGC, CPM, RPKM, BPM, etc.)
- When to use each method
- Formulas and interpretation
- Selection guide by experiment type
- Common pitfalls and solutions
- Quick reference table

**Use this reference when:** Users ask about normalization, comparing samples, or which method to use.

### references/effective_genome_sizes.md
Effective genome size values and usage:
- Common organism values (human, mouse, fly, worm, zebrafish)
- Read-length-specific values
- Calculation methods
- When and how to use in commands
- Custom genome calculation instructions

**Use this reference when:** Users need genome size for RPGC normalization or GC bias correction.

## Helper Scripts

### scripts/validate_files.py

Validates BAM, bigWig, and BED files for deepTools analysis. Checks file existence, indices, and format.

**Usage:**
```bash
python scripts/validate_files.py --bam sample1.bam sample2.bam \
    --bed peaks.bed --bigwig signal.bw
```

**When to use:** Before starting any analysis, or when troubleshooting errors.

### scripts/workflow_generator.py

Generates customizable bash script templates for common deepTools workflows.

**Available workflows:**
- `chipseq_qc`: ChIP-seq quality control
- `chipseq_analysis`: Complete ChIP-seq analysis
- `rnaseq_coverage`: Strand-specific RNA-seq coverage
- `atacseq`: ATAC-seq with Tn5 correction

**Usage:**
```bash
# List workflows
python scripts/workflow_generator.py --list

# Generate workflow
python scripts/workflow_generator.py chipseq_qc -o qc.sh \
    --input-bam Input.bam --chip-bams "ChIP1.bam ChIP2.bam" \
    --genome-size 2913022398 --threads 8

# Run generated workflow
chmod +x qc.sh
./qc.sh
```

**When to use:** Users request standard workflows or need template scripts to customize.

## Assets

### assets/quick_reference.md

Quick reference card with most common commands, effective genome sizes, and typical workflow pattern.

**When to use:** Users need quick command examples without detailed documentation.

## Handling User Requests

### For New Users

1. Start with installation verification
2. Validate input files using `scripts/validate_files.py`
3. Recommend appropriate workflow based on experiment type
4. Generate workflow template using `scripts/workflow_generator.py`
5. Guide through customization and execution

### For Experienced Users

1. Provide specific tool commands for requested operations
2. Reference appropriate sections in `references/tools_reference.md`
3. Suggest optimizations and best practices
4. Offer troubleshooting for issues

### For Specific Tasks

**"Convert BAM to bigWig":**
- Use bamCoverage with appropriate normalization
- Recommend RPGC or CPM based on use case
- Provide effective genome size for organism
- Suggest relevant parameters (extendReads, ignoreDuplicates, binSize)

**"Check ChIP quality":**
- Run full QC workflow or use plotFingerprint specifically
- Explain interpretation of results
- Suggest follow-up actions based on results

**"Create heatmap":**
- Guide through two-step process: computeMatrix → plotHeatmap
- Help choose appropriate matrix mode (reference-point vs scale-regions)
- Suggest visualization parameters and clustering options

**"Compare samples":**
- Recommend bamCompare for two-sample comparison
- Suggest multiBamSummary + plotCorrelation for multiple samples
- Guide normalization method selection

### Referencing Documentation

When users need detailed information:
- **Tool details**: Direct to specific sections in `references/tools_reference.md`
- **Workflows**: Use `references/workflows.md` for complete analysis pipelines
- **Normalization**: Consult `references/normalization_methods.md` for method selection
- **Genome sizes**: Reference `references/effective_genome_sizes.md`

Search references using grep patterns:
```bash
# Find tool documentation
grep -A 20 "^### toolname" references/tools_reference.md

# Find workflow
grep -A 50 "^## Workflow Name" references/workflows.md

# Find normalization method
grep -A 15 "^### Method Name" references/normalization_methods.md
```

## Example Interactions

**User: "I need to analyze my ChIP-seq data"**

Response approach:
1. Ask about files available (BAM files, peaks, genes)
2. Validate files using validation script
3. Generate chipseq_analysis workflow template
4. Customize for their specific files and organism
5. Explain each step as script runs

**User: "Which normalization should I use?"**

Response approach:
1. Ask about experiment type (ChIP-seq, RNA-seq, etc.)
2. Ask about comparison goal (within-sample or between-sample)
3. Consult `references/normalization_methods.md` selection guide
4. Recommend appropriate method with justification
5. Provide command example with parameters

**User: "Create a heatmap around TSS"**

Response approach:
1. Verify bigWig and gene BED files available
2. Use computeMatrix with reference-point mode at TSS
3. Generate plotHeatmap with appropriate visualization parameters
4. Suggest clustering if dataset is large
5. Offer profile plot as complement

## Key Reminders

- **File validation first**: Always validate input files before analysis
- **Normalization matters**: Choose appropriate method for comparison type
- **Extend reads carefully**: YES for ChIP-seq, NO for RNA-seq
- **Use all cores**: Set `--numberOfProcessors` to available cores
- **Test on regions**: Use `--region` for parameter testing
- **Check QC first**: Run quality control before detailed analysis
- **Document everything**: Save commands for reproducibility
- **Reference documentation**: Use comprehensive references for detailed guidance

