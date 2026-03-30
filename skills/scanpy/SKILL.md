---
name: scanpy
description: Standard single-cell RNA-seq analysis pipeline. Use for QC, normalization, dimensionality reduction (PCA/UMAP/t-SNE), clustering, differential expression, and visualization. Best for exploratory scRNA-seq analysis with established workflows. For deep learning models use scvi-tools; for data format questions use anndata.
license: SD-3-Clause license
metadata:
    skill-author: K-Dense Inc.
---

# Scanpy: Single-Cell Analysis

## Overview

Scanpy is a scalable Python toolkit for analyzing single-cell RNA-seq data, built on AnnData. Apply this skill for complete single-cell workflows including quality control, normalization, dimensionality reduction, clustering, marker gene identification, visualization, and trajectory analysis.

## When to Use This Skill

This skill should be used when:
- Analyzing single-cell RNA-seq data (.h5ad, 10X, CSV formats)
- Performing quality control on scRNA-seq datasets
- Creating UMAP, t-SNE, or PCA visualizations
- Identifying cell clusters and finding marker genes
- Annotating cell types based on gene expression
- Conducting trajectory inference or pseudotime analysis
- Generating publication-quality single-cell plots

## Quick Start

### Basic Import and Setup

```python
import scanpy as sc
import pandas as pd
import numpy as np

# Configure settings
sc.settings.verbosity = 3
sc.settings.set_figure_params(dpi=80, facecolor='white')
sc.settings.figdir = './figures/'
```

### Loading Data

```python
# From 10X Genomics
adata = sc.read_10x_mtx('path/to/data/')
adata = sc.read_10x_h5('path/to/data.h5')

# From h5ad (AnnData format)
adata = sc.read_h5ad('path/to/data.h5ad')

# From CSV
adata = sc.read_csv('path/to/data.csv')
```

### Understanding AnnData Structure

The AnnData object is the core data structure in scanpy:

```python
adata.X          # Expression matrix (cells × genes)
adata.obs        # Cell metadata (DataFrame)
adata.var        # Gene metadata (DataFrame)
adata.uns        # Unstructured annotations (dict)
adata.obsm       # Multi-dimensional cell data (PCA, UMAP)
adata.raw        # Raw data backup

# Access cell and gene names
adata.obs_names  # Cell barcodes
adata.var_names  # Gene names
```

## Standard Analysis Workflow

### 1. Quality Control

Identify and filter low-quality cells and genes:

```python
# Identify mitochondrial genes
adata.var['mt'] = adata.var_names.str.startswith('MT-')

# Calculate QC metrics
sc.pp.calculate_qc_metrics(adata, qc_vars=['mt'], inplace=True)

# Visualize QC metrics
sc.pl.violin(adata, ['n_genes_by_counts', 'total_counts', 'pct_counts_mt'],
             jitter=0.4, multi_panel=True)

# Filter cells and genes
sc.pp.filter_cells(adata, min_genes=200)
sc.pp.filter_genes(adata, min_cells=3)
adata = adata[adata.obs.pct_counts_mt < 5, :]  # Remove high MT% cells
```

**Use the QC script for automated analysis:**
```bash
python scripts/qc_analysis.py input_file.h5ad --output filtered.h5ad
```

### 2. Normalization and Preprocessing

```python
# Normalize to 10,000 counts per cell
sc.pp.normalize_total(adata, target_sum=1e4)

# Log-transform
sc.pp.log1p(adata)

# Save raw counts for later
adata.raw = adata

# Identify highly variable genes
sc.pp.highly_variable_genes(adata, n_top_genes=2000)
sc.pl.highly_variable_genes(adata)

# Subset to highly variable genes
adata = adata[:, adata.var.highly_variable]

# Regress out unwanted variation
sc.pp.regress_out(adata, ['total_counts', 'pct_counts_mt'])

# Scale data
sc.pp.scale(adata, max_value=10)
```

### 3. Dimensionality Reduction

```python
# PCA
sc.tl.pca(adata, svd_solver='arpack')
sc.pl.pca_variance_ratio(adata, log=True)  # Check elbow plot

# Compute neighborhood graph
sc.pp.neighbors(adata, n_neighbors=10, n_pcs=40)

# UMAP for visualization
sc.tl.umap(adata)
sc.pl.umap(adata, color='leiden')

# Alternative: t-SNE
sc.tl.tsne(adata)
```

### 4. Clustering

```python
# Leiden clustering (recommended)
sc.tl.leiden(adata, resolution=0.5)
sc.pl.umap(adata, color='leiden', legend_loc='on data')

# Try multiple resolutions to find optimal granularity
for res in [0.3, 0.5, 0.8, 1.0]:
    sc.tl.leiden(adata, resolution=res, key_added=f'leiden_{res}')
```

### 5. Marker Gene Identification

```python
# Find marker genes for each cluster
sc.tl.rank_genes_groups(adata, 'leiden', method='wilcoxon')

# Visualize results
sc.pl.rank_genes_groups(adata, n_genes=25, sharey=False)
sc.pl.rank_genes_groups_heatmap(adata, n_genes=10)
sc.pl.rank_genes_groups_dotplot(adata, n_genes=5)

# Get results as DataFrame
markers = sc.get.rank_genes_groups_df(adata, group='0')
```

### 6. Cell Type Annotation

```python
# Define marker genes for known cell types
marker_genes = ['CD3D', 'CD14', 'MS4A1', 'NKG7', 'FCGR3A']

# Visualize markers
sc.pl.umap(adata, color=marker_genes, use_raw=True)
sc.pl.dotplot(adata, var_names=marker_genes, groupby='leiden')

# Manual annotation
cluster_to_celltype = {
    '0': 'CD4 T cells',
    '1': 'CD14+ Monocytes',
    '2': 'B cells',
    '3': 'CD8 T cells',
}
adata.obs['cell_type'] = adata.obs['leiden'].map(cluster_to_celltype)

# Visualize annotated types
sc.pl.umap(adata, color='cell_type', legend_loc='on data')
```

### 7. Save Results

```python
# Save processed data
adata.write('results/processed_data.h5ad')

# Export metadata
adata.obs.to_csv('results/cell_metadata.csv')
adata.var.to_csv('results/gene_metadata.csv')
```

## Common Tasks

### Creating Publication-Quality Plots

```python
# Set high-quality defaults
sc.settings.set_figure_params(dpi=300, frameon=False, figsize=(5, 5))
sc.settings.file_format_figs = 'pdf'

# UMAP with custom styling
sc.pl.umap(adata, color='cell_type',
           palette='Set2',
           legend_loc='on data',
           legend_fontsize=12,
           legend_fontoutline=2,
           frameon=False,
           save='_publication.pdf')

# Heatmap of marker genes
sc.pl.heatmap(adata, var_names=genes, groupby='cell_type',
              swap_axes=True, show_gene_labels=True,
              save='_markers.pdf')

# Dot plot
sc.pl.dotplot(adata, var_names=genes, groupby='cell_type',
              save='_dotplot.pdf')
```

Refer to `references/plotting_guide.md` for comprehensive visualization examples.

### Trajectory Inference

```python
# PAGA (Partition-based graph abstraction)
sc.tl.paga(adata, groups='leiden')
sc.pl.paga(adata, color='leiden')

# Diffusion pseudotime
adata.uns['iroot'] = np.flatnonzero(adata.obs['leiden'] == '0')[0]
sc.tl.dpt(adata)
sc.pl.umap(adata, color='dpt_pseudotime')
```

### Differential Expression Between Conditions

```python
# Compare treated vs control within cell types
adata_subset = adata[adata.obs['cell_type'] == 'T cells']
sc.tl.rank_genes_groups(adata_subset, groupby='condition',
                         groups=['treated'], reference='control')
sc.pl.rank_genes_groups(adata_subset, groups=['treated'])
```

### Gene Set Scoring

```python
# Score cells for gene set expression
gene_set = ['CD3D', 'CD3E', 'CD3G']
sc.tl.score_genes(adata, gene_set, score_name='T_cell_score')
sc.pl.umap(adata, color='T_cell_score')
```

### Batch Correction

```python
# ComBat batch correction
sc.pp.combat(adata, key='batch')

# Alternative: use Harmony or scVI (separate packages)
```

## Key Parameters to Adjust

### Quality Control
- `min_genes`: Minimum genes per cell (typically 200-500)
- `min_cells`: Minimum cells per gene (typically 3-10)
- `pct_counts_mt`: Mitochondrial threshold (typically 5-20%)

### Normalization
- `target_sum`: Target counts per cell (default 1e4)

### Feature Selection
- `n_top_genes`: Number of HVGs (typically 2000-3000)
- `min_mean`, `max_mean`, `min_disp`: HVG selection parameters

### Dimensionality Reduction
- `n_pcs`: Number of principal components (check variance ratio plot)
- `n_neighbors`: Number of neighbors (typically 10-30)

### Clustering
- `resolution`: Clustering granularity (0.4-1.2, higher = more clusters)

## Common Pitfalls and Best Practices

1. **Always save raw counts**: `adata.raw = adata` before filtering genes
2. **Check QC plots carefully**: Adjust thresholds based on dataset quality
3. **Use Leiden over Louvain**: More efficient and better results
4. **Try multiple clustering resolutions**: Find optimal granularity
5. **Validate cell type annotations**: Use multiple marker genes
6. **Use `use_raw=True` for gene expression plots**: Shows original counts
7. **Check PCA variance ratio**: Determine optimal number of PCs
8. **Save intermediate results**: Long workflows can fail partway through

## Bundled Resources

### scripts/qc_analysis.py
Automated quality control script that calculates metrics, generates plots, and filters data:

```bash
python scripts/qc_analysis.py input.h5ad --output filtered.h5ad \
    --mt-threshold 5 --min-genes 200 --min-cells 3
```

### references/standard_workflow.md
Complete step-by-step workflow with detailed explanations and code examples for:
- Data loading and setup
- Quality control with visualization
- Normalization and scaling
- Feature selection
- Dimensionality reduction (PCA, UMAP, t-SNE)
- Clustering (Leiden, Louvain)
- Marker gene identification
- Cell type annotation
- Trajectory inference
- Differential expression

Read this reference when performing a complete analysis from scratch.

### references/api_reference.md
Quick reference guide for scanpy functions organized by module:
- Reading/writing data (`sc.read_*`, `adata.write_*`)
- Preprocessing (`sc.pp.*`)
- Tools (`sc.tl.*`)
- Plotting (`sc.pl.*`)
- AnnData structure and manipulation
- Settings and utilities

Use this for quick lookup of function signatures and common parameters.

### references/plotting_guide.md
Comprehensive visualization guide including:
- Quality control plots
- Dimensionality reduction visualizations
- Clustering visualizations
- Marker gene plots (heatmaps, dot plots, violin plots)
- Trajectory and pseudotime plots
- Publication-quality customization
- Multi-panel figures
- Color palettes and styling

Consult this when creating publication-ready figures.

### assets/analysis_template.py
Complete analysis template providing a full workflow from data loading through cell type annotation. Copy and customize this template for new analyses:

```bash
cp assets/analysis_template.py my_analysis.py
# Edit parameters and run
python my_analysis.py
```

The template includes all standard steps with configurable parameters and helpful comments.

## Additional Resources

- **Official scanpy documentation**: https://scanpy.readthedocs.io/
- **Scanpy tutorials**: https://scanpy-tutorials.readthedocs.io/
- **scverse ecosystem**: https://scverse.org/ (related tools: squidpy, scvi-tools, cellrank)
- **Best practices**: Luecken & Theis (2019) "Current best practices in single-cell RNA-seq"

## Tips for Effective Analysis

1. **Start with the template**: Use `assets/analysis_template.py` as a starting point
2. **Run QC script first**: Use `scripts/qc_analysis.py` for initial filtering
3. **Consult references as needed**: Load workflow and API references into context
4. **Iterate on clustering**: Try multiple resolutions and visualization methods
5. **Validate biologically**: Check marker genes match expected cell types
6. **Document parameters**: Record QC thresholds and analysis settings
7. **Save checkpoints**: Write intermediate results at key steps

