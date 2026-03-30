# Verified Workflows

## Overview
Latch Verified Workflows are production-ready, pre-built bioinformatics pipelines developed and maintained by Latch engineers. These workflows are used by top pharmaceutical companies and biotech firms for research and discovery.

## Available in Python SDK

The `latch.verified` module provides programmatic access to verified workflows from Python code.

### Importing Verified Workflows

```python
from latch.verified import (
    bulk_rnaseq,
    deseq2,
    mafft,
    trim_galore,
    alphafold,
    colabfold
)
```

## Core Verified Workflows

### Bulk RNA-seq Analysis

**Alignment and Quantification:**
```python
from latch.verified import bulk_rnaseq
from latch.types import LatchFile

# Run bulk RNA-seq pipeline
results = bulk_rnaseq(
    fastq_r1=LatchFile("latch:///data/sample_R1.fastq.gz"),
    fastq_r2=LatchFile("latch:///data/sample_R2.fastq.gz"),
    reference_genome="hg38",
    output_dir="latch:///results/rnaseq"
)
```

**Features:**
- Read quality control with FastQC
- Adapter trimming
- Alignment with STAR or HISAT2
- Gene-level quantification with featureCounts
- MultiQC report generation

### Differential Expression Analysis

**DESeq2:**
```python
from latch.verified import deseq2
from latch.types import LatchFile

# Run differential expression analysis
results = deseq2(
    count_matrix=LatchFile("latch:///data/counts.csv"),
    sample_metadata=LatchFile("latch:///data/metadata.csv"),
    design_formula="~ condition",
    output_dir="latch:///results/deseq2"
)
```

**Features:**
- Normalization and variance stabilization
- Differential expression testing
- MA plots and volcano plots
- PCA visualization
- Annotated results tables

### Pathway Analysis

**Enrichment Analysis:**
```python
from latch.verified import pathway_enrichment

results = pathway_enrichment(
    gene_list=LatchFile("latch:///data/deg_list.txt"),
    organism="human",
    databases=["GO_Biological_Process", "KEGG", "Reactome"],
    output_dir="latch:///results/pathways"
)
```

**Supported Databases:**
- Gene Ontology (GO)
- KEGG pathways
- Reactome
- WikiPathways
- MSigDB collections

### Sequence Alignment

**MAFFT Multiple Sequence Alignment:**
```python
from latch.verified import mafft
from latch.types import LatchFile

aligned = mafft(
    input_fasta=LatchFile("latch:///data/sequences.fasta"),
    algorithm="auto",
    output_format="fasta"
)
```

**Features:**
- Multiple alignment algorithms (FFT-NS-1, FFT-NS-2, G-INS-i, L-INS-i)
- Automatic algorithm selection
- Support for large alignments
- Various output formats

### Adapter and Quality Trimming

**Trim Galore:**
```python
from latch.verified import trim_galore

trimmed = trim_galore(
    fastq_r1=LatchFile("latch:///data/sample_R1.fastq.gz"),
    fastq_r2=LatchFile("latch:///data/sample_R2.fastq.gz"),
    quality_threshold=20,
    adapter_auto_detect=True
)
```

**Features:**
- Automatic adapter detection
- Quality trimming
- FastQC integration
- Support for single-end and paired-end

## Protein Structure Prediction

### AlphaFold

**Standard AlphaFold:**
```python
from latch.verified import alphafold
from latch.types import LatchFile

structure = alphafold(
    sequence_fasta=LatchFile("latch:///data/protein.fasta"),
    model_preset="monomer",
    use_templates=True,
    output_dir="latch:///results/alphafold"
)
```

**Features:**
- Monomer and multimer prediction
- Template-based modeling option
- MSA generation
- Confidence metrics (pLDDT, PAE)
- PDB structure output

**Model Presets:**
- `monomer`: Single protein chain
- `monomer_casp14`: CASP14 competition version
- `monomer_ptm`: With pTM confidence
- `multimer`: Protein complexes

### ColabFold

**Optimized AlphaFold Alternative:**
```python
from latch.verified import colabfold

structure = colabfold(
    sequence_fasta=LatchFile("latch:///data/protein.fasta"),
    num_models=5,
    use_amber_relax=True,
    output_dir="latch:///results/colabfold"
)
```

**Features:**
- Faster than standard AlphaFold
- MMseqs2-based MSA generation
- Multiple model predictions
- Amber relaxation
- Ranking by confidence

**Advantages:**
- 3-5x faster MSA generation
- Lower compute cost
- Similar accuracy to AlphaFold

## Single-Cell Analysis

### ArchR (scATAC-seq)

**Chromatin Accessibility Analysis:**
```python
from latch.verified import archr

results = archr(
    fragments_file=LatchFile("latch:///data/fragments.tsv.gz"),
    genome="hg38",
    output_dir="latch:///results/archr"
)
```

**Features:**
- Arrow file generation
- Quality control metrics
- Dimensionality reduction
- Clustering
- Peak calling
- Motif enrichment

### scVelo (RNA Velocity)

**RNA Velocity Analysis:**
```python
from latch.verified import scvelo

results = scvelo(
    adata_file=LatchFile("latch:///data/adata.h5ad"),
    mode="dynamical",
    output_dir="latch:///results/scvelo"
)
```

**Features:**
- Spliced/unspliced quantification
- Velocity estimation
- Dynamical modeling
- Trajectory inference
- Visualization

### emptyDropsR (Cell Calling)

**Empty Droplet Detection:**
```python
from latch.verified import emptydrops

filtered_matrix = emptydrops(
    raw_matrix_dir=LatchDir("latch:///data/raw_feature_bc_matrix"),
    fdr_threshold=0.01
)
```

**Features:**
- Distinguish cells from empty droplets
- FDR-based thresholding
- Ambient RNA removal
- Compatible with 10X data

## Gene Editing Analysis

### CRISPResso2

**CRISPR Editing Assessment:**
```python
from latch.verified import crispresso2

results = crispresso2(
    fastq_r1=LatchFile("latch:///data/sample_R1.fastq.gz"),
    amplicon_sequence="AGCTAGCTAG...",
    guide_rna="GCTAGCTAGC",
    output_dir="latch:///results/crispresso"
)
```

**Features:**
- Indel quantification
- Base editing analysis
- Prime editing analysis
- HDR quantification
- Allele frequency plots

## Phylogenetics

### Phylogenetic Tree Construction

```python
from latch.verified import phylogenetics

tree = phylogenetics(
    alignment_file=LatchFile("latch:///data/aligned.fasta"),
    method="maximum_likelihood",
    bootstrap_replicates=1000,
    output_dir="latch:///results/phylo"
)
```

**Features:**
- Multiple tree-building methods
- Bootstrap support
- Tree visualization
- Model selection

## Workflow Integration

### Using Verified Workflows in Custom Pipelines

```python
from latch import workflow, small_task
from latch.verified import bulk_rnaseq, deseq2
from latch.types import LatchFile, LatchDir

@workflow
def complete_rnaseq_analysis(
    fastq_files: List[LatchFile],
    metadata: LatchFile,
    output_dir: LatchDir
) -> LatchFile:
    """
    Complete RNA-seq analysis pipeline using verified workflows
    """
    # Run alignment for each sample
    aligned_samples = []
    for fastq in fastq_files:
        result = bulk_rnaseq(
            fastq_r1=fastq,
            reference_genome="hg38",
            output_dir=output_dir
        )
        aligned_samples.append(result)

    # Aggregate counts and run differential expression
    count_matrix = aggregate_counts(aligned_samples)
    deseq_results = deseq2(
        count_matrix=count_matrix,
        sample_metadata=metadata,
        design_formula="~ condition"
    )

    return deseq_results
```

## Best Practices

### When to Use Verified Workflows

**Use Verified Workflows for:**
1. Standard analysis pipelines
2. Well-established methods
3. Production-ready analyses
4. Reproducible research
5. Validated bioinformatics tools

**Build Custom Workflows for:**
1. Novel analysis methods
2. Custom preprocessing steps
3. Integration with proprietary tools
4. Experimental pipelines
5. Highly specialized workflows

### Combining Verified and Custom

```python
from latch import workflow, small_task
from latch.verified import alphafold
from latch.types import LatchFile

@small_task
def preprocess_sequence(raw_fasta: LatchFile) -> LatchFile:
    """Custom preprocessing"""
    # Custom logic here
    return processed_fasta

@small_task
def postprocess_structure(pdb_file: LatchFile) -> LatchFile:
    """Custom post-analysis"""
    # Custom analysis here
    return analysis_results

@workflow
def custom_structure_pipeline(input_fasta: LatchFile) -> LatchFile:
    """
    Combine custom steps with verified AlphaFold
    """
    # Custom preprocessing
    processed = preprocess_sequence(raw_fasta=input_fasta)

    # Use verified AlphaFold
    structure = alphafold(
        sequence_fasta=processed,
        model_preset="monomer_ptm"
    )

    # Custom post-processing
    results = postprocess_structure(pdb_file=structure)

    return results
```

## Accessing Workflow Documentation

### In-Platform Documentation

Each verified workflow includes:
- Parameter descriptions
- Input/output specifications
- Method details
- Citation information
- Example usage

### Viewing Available Workflows

```python
from latch.verified import list_workflows

# List all available verified workflows
workflows = list_workflows()

for workflow in workflows:
    print(f"{workflow.name}: {workflow.description}")
```

## Version Management

### Workflow Versions

Verified workflows are versioned and maintained:
- Bug fixes and improvements
- New features added
- Backward compatibility maintained
- Version pinning available

### Using Specific Versions

```python
from latch.verified import bulk_rnaseq

# Use specific version
results = bulk_rnaseq(
    fastq_r1=input_file,
    reference_genome="hg38",
    workflow_version="2.1.0"
)
```

## Support and Updates

### Getting Help

- **Documentation**: https://docs.latch.bio
- **Slack Community**: Latch SDK workspace
- **Support**: support@latch.bio
- **GitHub Issues**: Report bugs and request features

### Workflow Updates

Verified workflows receive regular updates:
- Tool version upgrades
- Performance improvements
- Bug fixes
- New features

Subscribe to release notes for update notifications.

## Common Use Cases

### Complete RNA-seq Study

```python
# 1. Quality control and alignment
aligned = bulk_rnaseq(fastq=samples)

# 2. Differential expression
deg = deseq2(counts=aligned)

# 3. Pathway enrichment
pathways = pathway_enrichment(genes=deg)
```

### Protein Structure Analysis

```python
# 1. Predict structure
structure = alphafold(sequence=protein_seq)

# 2. Custom analysis
results = analyze_structure(pdb=structure)
```

### Single-Cell Workflow

```python
# 1. Filter cells
filtered = emptydrops(matrix=raw_counts)

# 2. RNA velocity
velocity = scvelo(adata=filtered)
```
