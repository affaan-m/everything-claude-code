---
name: scvi-tools
description: Deep generative models for single-cell omics. Use when you need probabilistic batch correction (scVI), transfer learning, differential expression with uncertainty, or multi-modal integration (TOTALVI, MultiVI). Best for advanced modeling, batch effects, multimodal data. For standard analysis pipelines use scanpy.
license: BSD-3-Clause license
metadata:
    skill-author: K-Dense Inc.
---

# scvi-tools

## Overview

scvi-tools is a comprehensive Python framework for probabilistic models in single-cell genomics. Built on PyTorch and PyTorch Lightning, it provides deep generative models using variational inference for analyzing diverse single-cell data modalities.

## When to Use This Skill

Use this skill when:
- Analyzing single-cell RNA-seq data (dimensionality reduction, batch correction, integration)
- Working with single-cell ATAC-seq or chromatin accessibility data
- Integrating multimodal data (CITE-seq, multiome, paired/unpaired datasets)
- Analyzing spatial transcriptomics data (deconvolution, spatial mapping)
- Performing differential expression analysis on single-cell data
- Conducting cell type annotation or transfer learning tasks
- Working with specialized single-cell modalities (methylation, cytometry, RNA velocity)
- Building custom probabilistic models for single-cell analysis

## Core Capabilities

scvi-tools provides models organized by data modality:

### 1. Single-Cell RNA-seq Analysis
Core models for expression analysis, batch correction, and integration. See `references/models-scrna-seq.md` for:
- **scVI**: Unsupervised dimensionality reduction and batch correction
- **scANVI**: Semi-supervised cell type annotation and integration
- **AUTOZI**: Zero-inflation detection and modeling
- **VeloVI**: RNA velocity analysis
- **contrastiveVI**: Perturbation effect isolation

### 2. Chromatin Accessibility (ATAC-seq)
Models for analyzing single-cell chromatin data. See `references/models-atac-seq.md` for:
- **PeakVI**: Peak-based ATAC-seq analysis and integration
- **PoissonVI**: Quantitative fragment count modeling
- **scBasset**: Deep learning approach with motif analysis

### 3. Multimodal & Multi-omics Integration
Joint analysis of multiple data types. See `references/models-multimodal.md` for:
- **totalVI**: CITE-seq protein and RNA joint modeling
- **MultiVI**: Paired and unpaired multi-omic integration
- **MrVI**: Multi-resolution cross-sample analysis

### 4. Spatial Transcriptomics
Spatially-resolved transcriptomics analysis. See `references/models-spatial.md` for:
- **DestVI**: Multi-resolution spatial deconvolution
- **Stereoscope**: Cell type deconvolution
- **Tangram**: Spatial mapping and integration
- **scVIVA**: Cell-environment relationship analysis

### 5. Specialized Modalities
Additional specialized analysis tools. See `references/models-specialized.md` for:
- **MethylVI/MethylANVI**: Single-cell methylation analysis
- **CytoVI**: Flow/mass cytometry batch correction
- **Solo**: Doublet detection
- **CellAssign**: Marker-based cell type annotation

## Typical Workflow

All scvi-tools models follow a consistent API pattern:

```python
# 1. Load and preprocess data (AnnData format)
import scvi
import scanpy as sc

adata = scvi.data.heart_cell_atlas_subsampled()
sc.pp.filter_genes(adata, min_counts=3)
sc.pp.highly_variable_genes(adata, n_top_genes=1200)

# 2. Register data with model (specify layers, covariates)
scvi.model.SCVI.setup_anndata(
    adata,
    layer="counts",  # Use raw counts, not log-normalized
    batch_key="batch",
    categorical_covariate_keys=["donor"],
    continuous_covariate_keys=["percent_mito"]
)

# 3. Create and train model
model = scvi.model.SCVI(adata)
model.train()

# 4. Extract latent representations and normalized values
latent = model.get_latent_representation()
normalized = model.get_normalized_expression(library_size=1e4)

# 5. Store in AnnData for downstream analysis
adata.obsm["X_scVI"] = latent
adata.layers["scvi_normalized"] = normalized

# 6. Downstream analysis with scanpy
sc.pp.neighbors(adata, use_rep="X_scVI")
sc.tl.umap(adata)
sc.tl.leiden(adata)
```

**Key Design Principles:**
- **Raw counts required**: Models expect unnormalized count data for optimal performance
- **Unified API**: Consistent interface across all models (setup → train → extract)
- **AnnData-centric**: Seamless integration with the scanpy ecosystem
- **GPU acceleration**: Automatic utilization of available GPUs
- **Batch correction**: Handle technical variation through covariate registration

## Common Analysis Tasks

### Differential Expression
Probabilistic DE analysis using the learned generative models:

```python
de_results = model.differential_expression(
    groupby="cell_type",
    group1="TypeA",
    group2="TypeB",
    mode="change",  # Use composite hypothesis testing
    delta=0.25      # Minimum effect size threshold
)
```

See `references/differential-expression.md` for detailed methodology and interpretation.

### Model Persistence
Save and load trained models:

```python
# Save model
model.save("./model_directory", overwrite=True)

# Load model
model = scvi.model.SCVI.load("./model_directory", adata=adata)
```

### Batch Correction and Integration
Integrate datasets across batches or studies:

```python
# Register batch information
scvi.model.SCVI.setup_anndata(adata, batch_key="study")

# Model automatically learns batch-corrected representations
model = scvi.model.SCVI(adata)
model.train()
latent = model.get_latent_representation()  # Batch-corrected
```

## Theoretical Foundations

scvi-tools is built on:
- **Variational inference**: Approximate posterior distributions for scalable Bayesian inference
- **Deep generative models**: VAE architectures that learn complex data distributions
- **Amortized inference**: Shared neural networks for efficient learning across cells
- **Probabilistic modeling**: Principled uncertainty quantification and statistical testing

See `references/theoretical-foundations.md` for detailed background on the mathematical framework.

## Additional Resources

- **Workflows**: `references/workflows.md` contains common workflows, best practices, hyperparameter tuning, and GPU optimization
- **Model References**: Detailed documentation for each model category in the `references/` directory
- **Official Documentation**: https://docs.scvi-tools.org/en/stable/
- **Tutorials**: https://docs.scvi-tools.org/en/stable/tutorials/index.html
- **API Reference**: https://docs.scvi-tools.org/en/stable/api/index.html

## Installation

```bash
uv pip install scvi-tools
# For GPU support
uv pip install scvi-tools[cuda]
```

## Best Practices

1. **Use raw counts**: Always provide unnormalized count data to models
2. **Filter genes**: Remove low-count genes before analysis (e.g., `min_counts=3`)
3. **Register covariates**: Include known technical factors (batch, donor, etc.) in `setup_anndata`
4. **Feature selection**: Use highly variable genes for improved performance
5. **Model saving**: Always save trained models to avoid retraining
6. **GPU usage**: Enable GPU acceleration for large datasets (`accelerator="gpu"`)
7. **Scanpy integration**: Store outputs in AnnData objects for downstream analysis

