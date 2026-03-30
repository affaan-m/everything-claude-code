# ATAC-seq and Chromatin Accessibility Models

This document covers models for analyzing single-cell ATAC-seq and chromatin accessibility data in scvi-tools.

## PeakVI

**Purpose**: Analysis and integration of single-cell ATAC-seq data using peak counts.

**Key Features**:
- Variational autoencoder specifically designed for scATAC-seq peak data
- Learns low-dimensional representations of chromatin accessibility
- Performs batch correction across samples
- Enables differential accessibility testing
- Integrates multiple ATAC-seq datasets

**When to Use**:
- Analyzing scATAC-seq peak count matrices
- Integrating multiple ATAC-seq experiments
- Batch correction of chromatin accessibility data
- Dimensionality reduction for ATAC-seq
- Differential accessibility analysis between cell types or conditions

**Data Requirements**:
- Peak count matrix (cells × peaks)
- Binary or count data for peak accessibility
- Batch/sample annotations (optional, for batch correction)

**Basic Usage**:
```python
import scvi

# Prepare data (peaks should be in adata.X)
# Optional: filter peaks
sc.pp.filter_genes(adata, min_cells=3)

# Setup data
scvi.model.PEAKVI.setup_anndata(
    adata,
    batch_key="batch"
)

# Train model
model = scvi.model.PEAKVI(adata)
model.train()

# Get latent representation (batch-corrected)
latent = model.get_latent_representation()
adata.obsm["X_PeakVI"] = latent

# Differential accessibility
da_results = model.differential_accessibility(
    groupby="cell_type",
    group1="TypeA",
    group2="TypeB"
)
```

**Key Parameters**:
- `n_latent`: Dimensionality of latent space (default: 10)
- `n_hidden`: Number of nodes per hidden layer (default: 128)
- `n_layers`: Number of hidden layers (default: 1)
- `region_factors`: Whether to learn region-specific factors (default: True)
- `latent_distribution`: Distribution for latent space ("normal" or "ln")

**Outputs**:
- `get_latent_representation()`: Low-dimensional embeddings for cells
- `get_accessibility_estimates()`: Normalized accessibility values
- `differential_accessibility()`: Statistical testing for differential peaks
- `get_region_factors()`: Peak-specific scaling factors

**Best Practices**:
1. Filter out low-quality peaks (present in very few cells)
2. Include batch information if integrating multiple samples
3. Use latent representations for clustering and UMAP visualization
4. Consider using `region_factors=True` for datasets with high technical variation
5. Store latent embeddings in `adata.obsm` for downstream analysis with scanpy

## PoissonVI

**Purpose**: Quantitative analysis of scATAC-seq fragment counts (more detailed than peak counts).

**Key Features**:
- Models fragment counts directly (not just peak presence/absence)
- Poisson distribution for count data
- Captures quantitative differences in accessibility
- Enables fine-grained analysis of chromatin state

**When to Use**:
- Analyzing fragment-level ATAC-seq data
- Need quantitative accessibility measurements
- Higher resolution analysis than binary peak calls
- Investigating gradual changes in chromatin accessibility

**Data Requirements**:
- Fragment count matrix (cells × genomic regions)
- Count data (not binary)

**Basic Usage**:
```python
scvi.model.POISSONVI.setup_anndata(
    adata,
    batch_key="batch"
)

model = scvi.model.POISSONVI(adata)
model.train()

# Get results
latent = model.get_latent_representation()
accessibility = model.get_accessibility_estimates()
```

**Key Differences from PeakVI**:
- **PeakVI**: Best for standard peak count matrices, faster
- **PoissonVI**: Best for quantitative fragment counts, more detailed

**When to Choose PoissonVI over PeakVI**:
- Working with fragment counts rather than called peaks
- Need to capture quantitative differences
- Have high-quality, high-coverage data
- Interested in subtle accessibility changes

## scBasset

**Purpose**: Deep learning approach to scATAC-seq analysis with interpretability and motif analysis.

**Key Features**:
- Convolutional neural network (CNN) architecture for sequence-based analysis
- Models raw DNA sequences, not just peak counts
- Enables motif discovery and transcription factor (TF) binding prediction
- Provides interpretable feature importance
- Performs batch correction

**When to Use**:
- Want to incorporate DNA sequence information
- Interested in TF motif analysis
- Need interpretable models (which sequences drive accessibility)
- Analyzing regulatory elements and TF binding sites
- Predicting accessibility from sequence alone

**Data Requirements**:
- Peak sequences (extracted from genome)
- Peak accessibility matrix
- Genome reference (for sequence extraction)

**Basic Usage**:
```python
# scBasset requires sequence information
# First, extract sequences for peaks
from scbasset import utils
sequences = utils.fetch_sequences(adata, genome="hg38")

# Setup and train
scvi.model.SCBASSET.setup_anndata(
    adata,
    batch_key="batch"
)

model = scvi.model.SCBASSET(adata, sequences=sequences)
model.train()

# Get latent representation
latent = model.get_latent_representation()

# Interpret model: which sequences/motifs are important
importance_scores = model.get_feature_importance()
```

**Key Parameters**:
- `n_latent`: Latent space dimensionality
- `conv_layers`: Number of convolutional layers
- `n_filters`: Number of filters per conv layer
- `filter_size`: Size of convolutional filters

**Advanced Features**:
- **In silico mutagenesis**: Predict how sequence changes affect accessibility
- **Motif enrichment**: Identify enriched TF motifs in accessible regions
- **Batch correction**: Similar to other scvi-tools models
- **Transfer learning**: Fine-tune on new datasets

**Interpretability Tools**:
```python
# Get importance scores for sequences
importance = model.get_sequence_importance(region_indices=[0, 1, 2])

# Predict accessibility for new sequences
predictions = model.predict_accessibility(new_sequences)
```

## Model Selection for ATAC-seq

### PeakVI
**Choose when**:
- Standard scATAC-seq analysis workflow
- Have peak count matrices (most common format)
- Need fast, efficient batch correction
- Want straightforward differential accessibility
- Prioritize computational efficiency

**Advantages**:
- Fast training and inference
- Proven track record for scATAC-seq
- Easy integration with scanpy workflow
- Robust batch correction

### PoissonVI
**Choose when**:
- Have fragment-level count data
- Need quantitative accessibility measures
- Interested in subtle differences
- Have high-coverage, high-quality data

**Advantages**:
- More detailed quantitative information
- Better for gradient changes
- Appropriate statistical model for counts

### scBasset
**Choose when**:
- Want to incorporate DNA sequence
- Need biological interpretation (motifs, TFs)
- Interested in regulatory mechanisms
- Have computational resources for CNN training
- Want predictive power for new sequences

**Advantages**:
- Sequence-based, biologically interpretable
- Motif and TF analysis built-in
- Predictive modeling capabilities
- In silico perturbation experiments

## Workflow Example: Complete ATAC-seq Analysis

```python
import scvi
import scanpy as sc

# 1. Load and preprocess ATAC-seq data
adata = sc.read_h5ad("atac_data.h5ad")

# 2. Filter low-quality peaks
sc.pp.filter_genes(adata, min_cells=10)

# 3. Setup and train PeakVI
scvi.model.PEAKVI.setup_anndata(
    adata,
    batch_key="sample"
)

model = scvi.model.PEAKVI(adata, n_latent=20)
model.train(max_epochs=400)

# 4. Extract latent representation
latent = model.get_latent_representation()
adata.obsm["X_PeakVI"] = latent

# 5. Downstream analysis
sc.pp.neighbors(adata, use_rep="X_PeakVI")
sc.tl.umap(adata)
sc.tl.leiden(adata, key_added="clusters")

# 6. Differential accessibility
da_results = model.differential_accessibility(
    groupby="clusters",
    group1="0",
    group2="1"
)

# 7. Save model
model.save("peakvi_model")
```

## Integration with Gene Expression (RNA+ATAC)

For paired multimodal data (RNA+ATAC from same cells), use **MultiVI** instead:

```python
# For 10x Multiome or similar paired data
scvi.model.MULTIVI.setup_anndata(
    adata,
    batch_key="sample",
    modality_key="modality"  # "RNA" or "ATAC"
)

model = scvi.model.MULTIVI(adata)
model.train()

# Get joint latent space
latent = model.get_latent_representation()
```

See `models-multimodal.md` for more details on multimodal integration.

## Best Practices for ATAC-seq Analysis

1. **Quality Control**:
   - Filter cells with very low or very high peak counts
   - Remove peaks present in very few cells
   - Filter mitochondrial and sex chromosome peaks if needed

2. **Batch Correction**:
   - Always include `batch_key` if integrating multiple samples
   - Consider technical covariates (sequencing depth, TSS enrichment)

3. **Feature Selection**:
   - Unlike RNA-seq, all peaks are often used
   - Consider filtering very rare peaks for efficiency

4. **Latent Dimensions**:
   - Start with `n_latent=10-30` depending on dataset complexity
   - Larger values for more heterogeneous datasets

5. **Downstream Analysis**:
   - Use latent representations for clustering and visualization
   - Link peaks to genes for regulatory analysis
   - Perform motif enrichment on cluster-specific peaks

6. **Computational Considerations**:
   - ATAC-seq matrices are often very large (many peaks)
   - Consider downsampling peaks for initial exploration
   - Use GPU acceleration for large datasets
