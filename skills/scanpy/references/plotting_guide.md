# Scanpy Plotting Guide

Comprehensive guide for creating publication-quality visualizations with scanpy.

## General Plotting Principles

All scanpy plotting functions follow consistent patterns:
- Functions in `sc.pl.*` mirror analysis functions in `sc.tl.*`
- Most accept `color` parameter for gene names or metadata columns
- Results are saved via `save` parameter
- Multiple plots can be generated in a single call

## Essential Quality Control Plots

### Visualize QC Metrics

```python
# Violin plots for QC metrics
sc.pl.violin(adata, ['n_genes_by_counts', 'total_counts', 'pct_counts_mt'],
             jitter=0.4, multi_panel=True, save='_qc_violin.pdf')

# Scatter plots to identify outliers
sc.pl.scatter(adata, x='total_counts', y='pct_counts_mt', save='_qc_mt.pdf')
sc.pl.scatter(adata, x='total_counts', y='n_genes_by_counts', save='_qc_genes.pdf')

# Highest expressing genes
sc.pl.highest_expr_genes(adata, n_top=20, save='_highest_expr.pdf')
```

### Post-filtering QC

```python
# Compare before and after filtering
sc.pl.violin(adata, ['n_genes_by_counts', 'total_counts'],
             groupby='sample', save='_post_filter.pdf')
```

## Dimensionality Reduction Visualizations

### PCA Plots

```python
# Basic PCA
sc.pl.pca(adata, color='leiden', save='_pca.pdf')

# PCA colored by gene expression
sc.pl.pca(adata, color=['gene1', 'gene2', 'gene3'], save='_pca_genes.pdf')

# Variance ratio plot (elbow plot)
sc.pl.pca_variance_ratio(adata, log=True, n_pcs=50, save='_variance.pdf')

# PCA loadings
sc.pl.pca_loadings(adata, components=[1, 2, 3], save='_loadings.pdf')
```

### UMAP Plots

```python
# Basic UMAP with clusters
sc.pl.umap(adata, color='leiden', legend_loc='on data', save='_umap_leiden.pdf')

# UMAP colored by multiple variables
sc.pl.umap(adata, color=['leiden', 'cell_type', 'batch'],
           save='_umap_multi.pdf')

# UMAP with gene expression
sc.pl.umap(adata, color=['CD3D', 'CD14', 'MS4A1'],
           use_raw=False, save='_umap_genes.pdf')

# Customize appearance
sc.pl.umap(adata, color='leiden',
           palette='Set2',
           size=50,
           alpha=0.8,
           frameon=False,
           title='Cell Types',
           save='_umap_custom.pdf')
```

### t-SNE Plots

```python
# t-SNE with clusters
sc.pl.tsne(adata, color='leiden', legend_loc='right margin', save='_tsne.pdf')

# Multiple t-SNE perplexities (if computed)
sc.pl.tsne(adata, color='leiden', save='_tsne_default.pdf')
```

## Clustering Visualizations

### Basic Cluster Plots

```python
# UMAP with cluster annotations
sc.pl.umap(adata, color='leiden', add_outline=True,
           legend_loc='on data', legend_fontsize=12,
           legend_fontoutline=2, frameon=False,
           save='_clusters.pdf')

# Show cluster proportions
sc.pl.umap(adata, color='leiden', size=50, edges=True,
           edges_width=0.1, save='_clusters_edges.pdf')
```

### Cluster Comparison

```python
# Compare clustering results
sc.pl.umap(adata, color=['leiden', 'louvain'],
           save='_cluster_comparison.pdf')

# Cluster dendrogram
sc.tl.dendrogram(adata, groupby='leiden')
sc.pl.dendrogram(adata, groupby='leiden', save='_dendrogram.pdf')
```

## Marker Gene Visualizations

### Ranked Marker Genes

```python
# Overview of top markers per cluster
sc.pl.rank_genes_groups(adata, n_genes=25, sharey=False,
                        save='_marker_overview.pdf')

# Heatmap of top markers
sc.pl.rank_genes_groups_heatmap(adata, n_genes=10, groupby='leiden',
                                 show_gene_labels=True,
                                 save='_marker_heatmap.pdf')

# Dot plot of markers
sc.pl.rank_genes_groups_dotplot(adata, n_genes=5,
                                 save='_marker_dotplot.pdf')

# Stacked violin plots
sc.pl.rank_genes_groups_stacked_violin(adata, n_genes=5,
                                        save='_marker_violin.pdf')

# Matrix plot
sc.pl.rank_genes_groups_matrixplot(adata, n_genes=5,
                                    save='_marker_matrix.pdf')
```

### Specific Gene Expression

```python
# Violin plots for specific genes
marker_genes = ['CD3D', 'CD14', 'MS4A1', 'NKG7', 'FCGR3A']
sc.pl.violin(adata, keys=marker_genes, groupby='leiden',
             save='_markers_violin.pdf')

# Dot plot for curated markers
sc.pl.dotplot(adata, var_names=marker_genes, groupby='leiden',
              save='_markers_dotplot.pdf')

# Heatmap for specific genes
sc.pl.heatmap(adata, var_names=marker_genes, groupby='leiden',
              swap_axes=True, save='_markers_heatmap.pdf')

# Stacked violin for gene sets
sc.pl.stacked_violin(adata, var_names=marker_genes, groupby='leiden',
                     save='_markers_stacked.pdf')
```

### Gene Expression on Embeddings

```python
# Multiple genes on UMAP
genes = ['CD3D', 'CD14', 'MS4A1', 'NKG7']
sc.pl.umap(adata, color=genes, cmap='viridis',
           save='_umap_markers.pdf')

# Gene expression with custom colormap
sc.pl.umap(adata, color='CD3D', cmap='Reds',
           vmin=0, vmax=3, save='_umap_cd3d.pdf')
```

## Trajectory and Pseudotime Visualizations

### PAGA Plots

```python
# PAGA graph
sc.pl.paga(adata, color='leiden', save='_paga.pdf')

# PAGA with gene expression
sc.pl.paga(adata, color=['leiden', 'dpt_pseudotime'],
           save='_paga_pseudotime.pdf')

# PAGA overlaid on UMAP
sc.pl.umap(adata, color='leiden', save='_umap_with_paga.pdf',
           edges=True, edges_color='gray')
```

### Pseudotime Plots

```python
# DPT pseudotime on UMAP
sc.pl.umap(adata, color='dpt_pseudotime', save='_umap_dpt.pdf')

# Gene expression along pseudotime
sc.pl.dpt_timeseries(adata, save='_dpt_timeseries.pdf')

# Heatmap ordered by pseudotime
sc.pl.heatmap(adata, var_names=genes, groupby='leiden',
              use_raw=False, show_gene_labels=True,
              save='_pseudotime_heatmap.pdf')
```

## Advanced Visualizations

### Tracks Plot (Gene Expression Trends)

```python
# Show gene expression across cell types
sc.pl.tracksplot(adata, var_names=marker_genes, groupby='leiden',
                 save='_tracks.pdf')
```

### Correlation Matrix

```python
# Correlation between clusters
sc.pl.correlation_matrix(adata, groupby='leiden',
                         save='_correlation.pdf')
```

### Embedding Density

```python
# Cell density on UMAP
sc.tl.embedding_density(adata, basis='umap', groupby='cell_type')
sc.pl.embedding_density(adata, basis='umap', key='umap_density_cell_type',
                        save='_density.pdf')
```

## Multi-Panel Figures

### Creating Panel Figures

```python
import matplotlib.pyplot as plt

# Create multi-panel figure
fig, axes = plt.subplots(2, 2, figsize=(12, 12))

# Plot on specific axes
sc.pl.umap(adata, color='leiden', ax=axes[0, 0], show=False)
sc.pl.umap(adata, color='CD3D', ax=axes[0, 1], show=False)
sc.pl.umap(adata, color='CD14', ax=axes[1, 0], show=False)
sc.pl.umap(adata, color='MS4A1', ax=axes[1, 1], show=False)

plt.tight_layout()
plt.savefig('figures/multi_panel.pdf')
plt.show()
```

## Publication-Quality Customization

### High-Quality Settings

```python
# Set publication-quality defaults
sc.settings.set_figure_params(dpi=300, frameon=False, figsize=(5, 5),
                               facecolor='white')

# Vector graphics output
sc.settings.figdir = './figures/'
sc.settings.file_format_figs = 'pdf'  # or 'svg'
```

### Custom Color Palettes

```python
# Use custom colors
custom_colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728']
sc.pl.umap(adata, color='leiden', palette=custom_colors,
           save='_custom_colors.pdf')

# Continuous color maps
sc.pl.umap(adata, color='CD3D', cmap='viridis', save='_viridis.pdf')
sc.pl.umap(adata, color='CD3D', cmap='RdBu_r', save='_rdbu.pdf')
```

### Remove Axes and Frames

```python
# Clean plot without axes
sc.pl.umap(adata, color='leiden', frameon=False,
           save='_clean.pdf')

# No legend
sc.pl.umap(adata, color='leiden', legend_loc=None,
           save='_no_legend.pdf')
```

## Exporting Plots

### Save Individual Plots

```python
# Automatic saving with save parameter
sc.pl.umap(adata, color='leiden', save='_leiden.pdf')
# Saves to: sc.settings.figdir + 'umap_leiden.pdf'

# Manual saving
import matplotlib.pyplot as plt
fig = sc.pl.umap(adata, color='leiden', show=False, return_fig=True)
fig.savefig('figures/my_umap.pdf', dpi=300, bbox_inches='tight')
```

### Batch Export

```python
# Save multiple versions
for gene in ['CD3D', 'CD14', 'MS4A1']:
    sc.pl.umap(adata, color=gene, save=f'_{gene}.pdf')
```

## Common Customization Parameters

### Layout Parameters
- `figsize`: Figure size (width, height)
- `frameon`: Show frame around plot
- `title`: Plot title
- `legend_loc`: 'right margin', 'on data', 'best', or None
- `legend_fontsize`: Font size for legend
- `size`: Point size

### Color Parameters
- `color`: Variable(s) to color by
- `palette`: Color palette (e.g., 'Set1', 'viridis')
- `cmap`: Colormap for continuous variables
- `vmin`, `vmax`: Color scale limits
- `use_raw`: Use raw counts for gene expression

### Saving Parameters
- `save`: Filename suffix for saving
- `show`: Whether to display plot
- `dpi`: Resolution for raster formats

## Tips for Publication Figures

1. **Use vector formats**: PDF or SVG for scalable graphics
2. **High DPI**: Set dpi=300 or higher for raster images
3. **Consistent styling**: Use the same color palette across figures
4. **Clear labels**: Ensure gene names and cell types are readable
5. **White background**: Use `facecolor='white'` for publications
6. **Remove clutter**: Set `frameon=False` for cleaner appearance
7. **Legend placement**: Use 'on data' for compact figures
8. **Color blind friendly**: Consider palettes like 'colorblind' or 'Set2'
