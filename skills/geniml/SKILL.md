---
name: geniml
description: This skill should be used when working with genomic interval data (BED files) for machine learning tasks. Use for training region embeddings (Region2Vec, BEDspace), single-cell ATAC-seq analysis (scEmbed), building consensus peaks (universes), or any ML-based analysis of genomic regions. Applies to BED file collections, scATAC-seq data, chromatin accessibility datasets, and region-based genomic feature learning.
license: BSD-2-Clause license
metadata:
    skill-author: K-Dense Inc.
---

# Geniml: Genomic Interval Machine Learning

## Overview

Geniml is a Python package for building machine learning models on genomic interval data from BED files. It provides unsupervised methods for learning embeddings of genomic regions, single cells, and metadata labels, enabling similarity searches, clustering, and downstream ML tasks.

## Installation

Install geniml using uv:

```bash
uv uv pip install geniml
```

For ML dependencies (PyTorch, etc.):

```bash
uv uv pip install 'geniml[ml]'
```

Development version from GitHub:

```bash
uv uv pip install git+https://github.com/databio/geniml.git
```

## Core Capabilities

Geniml provides five primary capabilities, each detailed in dedicated reference files:

### 1. Region2Vec: Genomic Region Embeddings

Train unsupervised embeddings of genomic regions using word2vec-style learning.

**Use for:** Dimensionality reduction of BED files, region similarity analysis, feature vectors for downstream ML.

**Workflow:**
1. Tokenize BED files using a universe reference
2. Train Region2Vec model on tokens
3. Generate embeddings for regions

**Reference:** See `references/region2vec.md` for detailed workflow, parameters, and examples.

### 2. BEDspace: Joint Region and Metadata Embeddings

Train shared embeddings for region sets and metadata labels using StarSpace.

**Use for:** Metadata-aware searches, cross-modal queries (region→label or label→region), joint analysis of genomic content and experimental conditions.

**Workflow:**
1. Preprocess regions and metadata
2. Train BEDspace model
3. Compute distances
4. Query across regions and labels

**Reference:** See `references/bedspace.md` for detailed workflow, search types, and examples.

### 3. scEmbed: Single-Cell Chromatin Accessibility Embeddings

Train Region2Vec models on single-cell ATAC-seq data for cell-level embeddings.

**Use for:** scATAC-seq clustering, cell-type annotation, dimensionality reduction of single cells, integration with scanpy workflows.

**Workflow:**
1. Prepare AnnData with peak coordinates
2. Pre-tokenize cells
3. Train scEmbed model
4. Generate cell embeddings
5. Cluster and visualize with scanpy

**Reference:** See `references/scembed.md` for detailed workflow, parameters, and examples.

### 4. Consensus Peaks: Universe Building

Build reference peak sets (universes) from BED file collections using multiple statistical methods.

**Use for:** Creating tokenization references, standardizing regions across datasets, defining consensus features with statistical rigor.

**Workflow:**
1. Combine BED files
2. Generate coverage tracks
3. Build universe using CC, CCF, ML, or HMM method

**Methods:**
- **CC (Coverage Cutoff)**: Simple threshold-based
- **CCF (Coverage Cutoff Flexible)**: Confidence intervals for boundaries
- **ML (Maximum Likelihood)**: Probabilistic modeling of positions
- **HMM (Hidden Markov Model)**: Complex state modeling

**Reference:** See `references/consensus_peaks.md` for method comparison, parameters, and examples.

### 5. Utilities: Supporting Tools

Additional tools for caching, randomization, evaluation, and search.

**Available utilities:**
- **BBClient**: BED file caching for repeated access
- **BEDshift**: Randomization preserving genomic context
- **Evaluation**: Metrics for embedding quality (silhouette, Davies-Bouldin, etc.)
- **Tokenization**: Region tokenization utilities (hard, soft, universe-based)
- **Text2BedNN**: Neural search backends for genomic queries

**Reference:** See `references/utilities.md` for detailed usage of each utility.

## Common Workflows

### Basic Region Embedding Pipeline

```python
from geniml.tokenization import hard_tokenization
from geniml.region2vec import region2vec
from geniml.evaluation import evaluate_embeddings

# Step 1: Tokenize BED files
hard_tokenization(
    src_folder='bed_files/',
    dst_folder='tokens/',
    universe_file='universe.bed',
    p_value_threshold=1e-9
)

# Step 2: Train Region2Vec
region2vec(
    token_folder='tokens/',
    save_dir='model/',
    num_shufflings=1000,
    embedding_dim=100
)

# Step 3: Evaluate
metrics = evaluate_embeddings(
    embeddings_file='model/embeddings.npy',
    labels_file='metadata.csv'
)
```

### scATAC-seq Analysis Pipeline

```python
import scanpy as sc
from geniml.scembed import ScEmbed
from geniml.io import tokenize_cells

# Step 1: Load data
adata = sc.read_h5ad('scatac_data.h5ad')

# Step 2: Tokenize cells
tokenize_cells(
    adata='scatac_data.h5ad',
    universe_file='universe.bed',
    output='tokens.parquet'
)

# Step 3: Train scEmbed
model = ScEmbed(embedding_dim=100)
model.train(dataset='tokens.parquet', epochs=100)

# Step 4: Generate embeddings
embeddings = model.encode(adata)
adata.obsm['scembed_X'] = embeddings

# Step 5: Cluster with scanpy
sc.pp.neighbors(adata, use_rep='scembed_X')
sc.tl.leiden(adata)
sc.tl.umap(adata)
```

### Universe Building and Evaluation

```bash
# Generate coverage
cat bed_files/*.bed > combined.bed
uniwig -m 25 combined.bed chrom.sizes coverage/

# Build universe with coverage cutoff
geniml universe build cc \
  --coverage-folder coverage/ \
  --output-file universe.bed \
  --cutoff 5 \
  --merge 100 \
  --filter-size 50

# Evaluate universe quality
geniml universe evaluate \
  --universe universe.bed \
  --coverage-folder coverage/ \
  --bed-folder bed_files/
```

## CLI Reference

Geniml provides command-line interfaces for major operations:

```bash
# Region2Vec training
geniml region2vec --token-folder tokens/ --save-dir model/ --num-shuffle 1000

# BEDspace preprocessing
geniml bedspace preprocess --input regions/ --metadata labels.csv --universe universe.bed

# BEDspace training
geniml bedspace train --input preprocessed.txt --output model/ --dim 100

# BEDspace search
geniml bedspace search -t r2l -d distances.pkl -q query.bed -n 10

# Universe building
geniml universe build cc --coverage-folder coverage/ --output universe.bed --cutoff 5

# BEDshift randomization
geniml bedshift --input peaks.bed --genome hg38 --preserve-chrom --iterations 100
```

## When to Use Which Tool

**Use Region2Vec when:**
- Working with bulk genomic data (ChIP-seq, ATAC-seq, etc.)
- Need unsupervised embeddings without metadata
- Comparing region sets across experiments
- Building features for downstream supervised learning

**Use BEDspace when:**
- Metadata labels available (cell types, tissues, conditions)
- Need to query regions by metadata or vice versa
- Want joint embedding space for regions and labels
- Building searchable genomic databases

**Use scEmbed when:**
- Analyzing single-cell ATAC-seq data
- Clustering cells by chromatin accessibility
- Annotating cell types from scATAC-seq
- Integration with scanpy is desired

**Use Universe Building when:**
- Need reference peak sets for tokenization
- Combining multiple experiments into consensus
- Want statistically rigorous region definitions
- Building standard references for a project

**Use Utilities when:**
- Need to cache remote BED files (BBClient)
- Generating null models for statistics (BEDshift)
- Evaluating embedding quality (Evaluation)
- Building search interfaces (Text2BedNN)

## Best Practices

### General Guidelines

- **Universe quality is critical**: Invest time in building comprehensive, well-constructed universes
- **Tokenization validation**: Check coverage (>80% ideal) before training
- **Parameter tuning**: Experiment with embedding dimensions, learning rates, and training epochs
- **Evaluation**: Always validate embeddings with multiple metrics and visualizations
- **Documentation**: Record parameters and random seeds for reproducibility

### Performance Considerations

- **Pre-tokenization**: For scEmbed, always pre-tokenize cells for faster training
- **Memory management**: Large datasets may require batch processing or downsampling
- **Computational resources**: ML/HMM universe methods are computationally intensive
- **Model caching**: Use BBClient to avoid repeated downloads

### Integration Patterns

- **With scanpy**: scEmbed embeddings integrate seamlessly as `adata.obsm` entries
- **With BEDbase**: Use BBClient for accessing remote BED repositories
- **With Hugging Face**: Export trained models for sharing and reproducibility
- **With R**: Use reticulate for R integration (see utilities reference)

## Related Projects

Geniml is part of the BEDbase ecosystem:

- **BEDbase**: Unified platform for genomic regions
- **BEDboss**: Processing pipeline for BED files
- **Gtars**: Genomic tools and utilities
- **BBClient**: Client for BEDbase repositories

## Additional Resources

- **Documentation**: https://docs.bedbase.org/geniml/
- **GitHub**: https://github.com/databio/geniml
- **Pre-trained models**: Available on Hugging Face (databio organization)
- **Publications**: Cited in documentation for methodological details

## Troubleshooting

**"Tokenization coverage too low":**
- Check universe quality and completeness
- Adjust p-value threshold (try 1e-6 instead of 1e-9)
- Ensure universe matches genome assembly

**"Training not converging":**
- Adjust learning rate (try 0.01-0.05 range)
- Increase training epochs
- Check data quality and preprocessing

**"Out of memory errors":**
- Reduce batch size for scEmbed
- Process data in chunks
- Use pre-tokenization for single-cell data

**"StarSpace not found" (BEDspace):**
- Install StarSpace separately: https://github.com/facebookresearch/StarSpace
- Set `--path-to-starspace` parameter correctly

For detailed troubleshooting and method-specific issues, consult the appropriate reference file.

