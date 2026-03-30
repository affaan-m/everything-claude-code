# Standard Scanpy Workflow for Single-Cell Analysis

This document outlines the standard workflow for analyzing single-cell RNA-seq data using scanpy.

## Complete Analysis Pipeline

### 1. Data Loading and Initial Setup

```python
import scanpy as sc
import pandas as pd
import numpy as np

# Configure scanpy settings
sc.settings.verbosity = 3  # verbosity: errors (0), warnings (1), info (2), hints (3)
sc.settings.set_figure_params(dpi=80, facecolor='white')

# Load data (various formats)
adata = sc.read_10x_mtx('path/to/data/')  # For 10X data
# adata = sc.read_h5ad('path/to/data.h5ad')  # For h5ad format
# adata = sc.read_csv('path/to/data.csv')  # For CSV format
```

### 2. Quality Control (QC)

```python
# Calculate QC metrics
sc.pp.calculate_qc_metrics(adata, qc_vars=['mt'], percent_top=None, log1p=False, inplace=True)

# Common filtering thresholds (adjust based on dataset)
sc.pp.filter_cells(adata, min_genes=200)
sc.pp.filter_genes(adata, min_cells=3)

# Remove cells with high mitochondrial content
adata = adata[adata.obs.pct_counts_mt < 5, :]

# Visualize QC metrics
sc.pl.violin(adata, ['n_genes_by_counts', 'total_counts', 'pct_counts_mt'],
             jitter=0.4, multi_panel=True)
sc.pl.scatter(adata, x='total_counts', y='pct_counts_mt')
sc.pl.scatter(adata, x='total_counts', y='n_genes_by_counts')
```

### 3. Normalization

```python
# Normalize to 10,000 counts per cell
sc.pp.normalize_total(adata, target_sum=1e4)

# Log-transform the data
sc.pp.log1p(adata)

# Store normalized data in raw for later use
adata.raw = adata
```

### 4. Feature Selection

```python
# Identify highly variable genes
sc.pp.highly_variable_genes(adata, min_mean=0.0125, max_mean=3, min_disp=0.5)

# Visualize highly variable genes
sc.pl.highly_variable_genes(adata)

# Subset to highly variable genes
adata = adata[:, adata.var.highly_variable]
```

### 5. Scaling and Regression

```python
# Regress out effects of total counts per cell and percent mitochondrial genes
sc.pp.regress_out(adata, ['total_counts', 'pct_counts_mt'])

# Scale data to unit variance and zero mean
sc.pp.scale(adata, max_value=10)
```

### 6. Dimensionality Reduction

```python
# Principal Component Analysis (PCA)
sc.tl.pca(adata, svd_solver='arpack')

# Visualize PCA results
sc.pl.pca(adata, color='CST3')
sc.pl.pca_variance_ratio(adata, log=True)

# Computing neighborhood graph
sc.pp.neighbors(adata, n_neighbors=10, n_pcs=40)

# UMAP for visualization
sc.tl.umap(adata)

# t-SNE (alternative to UMAP)
# sc.tl.tsne(adata)
```

### 7. Clustering

```python
# Leiden clustering (recommended)
sc.tl.leiden(adata, resolution=0.5)

# Alternative: Louvain clustering
# sc.tl.louvain(adata, resolution=0.5)

# Visualize clustering results
sc.pl.umap(adata, color=['leiden'], legend_loc='on data')
```

### 8. Marker Gene Identification

```python
# Find marker genes for each cluster
sc.tl.rank_genes_groups(adata, 'leiden', method='wilcoxon')

# Visualize top marker genes
sc.pl.rank_genes_groups(adata, n_genes=25, sharey=False)

# Get marker gene dataframe
marker_genes = sc.get.rank_genes_groups_df(adata, group='0')

# Visualize specific markers
sc.pl.umap(adata, color=['leiden', 'CST3', 'NKG7'])
```

### 9. Cell Type Annotation

```python
# Manual annotation based on marker genes
cluster_annotations = {
    '0': 'CD4 T cells',
    '1': 'CD14+ Monocytes',
    '2': 'B cells',
    '3': 'CD8 T cells',
    # ... add more annotations
}
adata.obs['cell_type'] = adata.obs['leiden'].map(cluster_annotations)

# Visualize annotated cell types
sc.pl.umap(adata, color='cell_type', legend_loc='on data')
```

### 10. Saving Results

```python
# Save the processed AnnData object
adata.write('results/processed_data.h5ad')

# Export results to CSV
adata.obs.to_csv('results/cell_metadata.csv')
adata.var.to_csv('results/gene_metadata.csv')
```

## Additional Analysis Options

### Trajectory Inference

```python
# PAGA (Partition-based graph abstraction)
sc.tl.paga(adata, groups='leiden')
sc.pl.paga(adata, color=['leiden'])

# Diffusion pseudotime (DPT)
adata.uns['iroot'] = np.flatnonzero(adata.obs['leiden'] == '0')[0]
sc.tl.dpt(adata)
sc.pl.umap(adata, color=['dpt_pseudotime'])
```

### Differential Expression Between Conditions

```python
# Compare conditions within a cell type
sc.tl.rank_genes_groups(adata, groupby='condition', groups=['treated'],
                         reference='control', method='wilcoxon')
sc.pl.rank_genes_groups(adata, groups=['treated'])
```

### Gene Set Scoring

```python
# Score cells for gene set expression
gene_set = ['CD3D', 'CD3E', 'CD3G']
sc.tl.score_genes(adata, gene_set, score_name='T_cell_score')
sc.pl.umap(adata, color='T_cell_score')
```

## Common Parameters to Adjust

- **QC thresholds**: `min_genes`, `min_cells`, `pct_counts_mt` - depends on dataset quality
- **Normalization target**: Usually 1e4, but can be adjusted
- **HVG parameters**: Affects feature selection stringency
- **PCA components**: Check variance ratio plot to determine optimal number
- **Clustering resolution**: Higher values give more clusters (typically 0.4-1.2)
- **n_neighbors**: Affects granularity of UMAP and clustering (typically 10-30)

## Best Practices

1. Always visualize QC metrics before filtering
2. Save raw counts before normalization (`adata.raw = adata`)
3. Use Leiden instead of Louvain for clustering (more efficient)
4. Try multiple clustering resolutions to find optimal granularity
5. Validate cell type annotations with known marker genes
6. Save intermediate results at key steps
