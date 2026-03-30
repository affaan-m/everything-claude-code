#!/usr/bin/env python3
"""
Complete Single-Cell Analysis Template

This template provides a complete workflow for single-cell RNA-seq analysis
using scanpy, from data loading through clustering and cell type annotation.

Customize the parameters and sections as needed for your specific dataset.
"""

import scanpy as sc
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# ============================================================================
# CONFIGURATION
# ============================================================================

# File paths
INPUT_FILE = 'data/raw_counts.h5ad'  # Change to your input file
OUTPUT_DIR = 'results/'
FIGURES_DIR = 'figures/'

# QC parameters
MIN_GENES = 200          # Minimum genes per cell
MIN_CELLS = 3            # Minimum cells per gene
MT_THRESHOLD = 5         # Maximum mitochondrial percentage

# Analysis parameters
N_TOP_GENES = 2000       # Number of highly variable genes
N_PCS = 40               # Number of principal components
N_NEIGHBORS = 10         # Number of neighbors for graph
LEIDEN_RESOLUTION = 0.5  # Clustering resolution

# Scanpy settings
sc.settings.verbosity = 3
sc.settings.set_figure_params(dpi=80, facecolor='white')
sc.settings.figdir = FIGURES_DIR

# ============================================================================
# 1. LOAD DATA
# ============================================================================

print("=" * 80)
print("LOADING DATA")
print("=" * 80)

# Load data (adjust based on your file format)
adata = sc.read_h5ad(INPUT_FILE)
# adata = sc.read_10x_mtx('data/filtered_gene_bc_matrices/')  # For 10X data
# adata = sc.read_csv('data/counts.csv')  # For CSV data

print(f"Loaded: {adata.n_obs} cells x {adata.n_vars} genes")

# ============================================================================
# 2. QUALITY CONTROL
# ============================================================================

print("\n" + "=" * 80)
print("QUALITY CONTROL")
print("=" * 80)

# Identify mitochondrial genes
adata.var['mt'] = adata.var_names.str.startswith('MT-')

# Calculate QC metrics
sc.pp.calculate_qc_metrics(adata, qc_vars=['mt'], percent_top=None,
                            log1p=False, inplace=True)

# Visualize QC metrics before filtering
sc.pl.violin(adata, ['n_genes_by_counts', 'total_counts', 'pct_counts_mt'],
             jitter=0.4, multi_panel=True, save='_qc_before_filtering')

sc.pl.scatter(adata, x='total_counts', y='pct_counts_mt', save='_qc_mt')
sc.pl.scatter(adata, x='total_counts', y='n_genes_by_counts', save='_qc_genes')

# Filter cells and genes
print(f"\nBefore filtering: {adata.n_obs} cells, {adata.n_vars} genes")

sc.pp.filter_cells(adata, min_genes=MIN_GENES)
sc.pp.filter_genes(adata, min_cells=MIN_CELLS)
adata = adata[adata.obs.pct_counts_mt < MT_THRESHOLD, :]

print(f"After filtering: {adata.n_obs} cells, {adata.n_vars} genes")

# ============================================================================
# 3. NORMALIZATION
# ============================================================================

print("\n" + "=" * 80)
print("NORMALIZATION")
print("=" * 80)

# Normalize to 10,000 counts per cell
sc.pp.normalize_total(adata, target_sum=1e4)

# Log-transform
sc.pp.log1p(adata)

# Store normalized data
adata.raw = adata

# ============================================================================
# 4. FEATURE SELECTION
# ============================================================================

print("\n" + "=" * 80)
print("FEATURE SELECTION")
print("=" * 80)

# Identify highly variable genes
sc.pp.highly_variable_genes(adata, n_top_genes=N_TOP_GENES)

# Visualize
sc.pl.highly_variable_genes(adata, save='_hvg')

print(f"Selected {sum(adata.var.highly_variable)} highly variable genes")

# Subset to highly variable genes
adata = adata[:, adata.var.highly_variable]

# ============================================================================
# 5. SCALING AND REGRESSION
# ============================================================================

print("\n" + "=" * 80)
print("SCALING AND REGRESSION")
print("=" * 80)

# Regress out unwanted sources of variation
sc.pp.regress_out(adata, ['total_counts', 'pct_counts_mt'])

# Scale data
sc.pp.scale(adata, max_value=10)

# ============================================================================
# 6. DIMENSIONALITY REDUCTION
# ============================================================================

print("\n" + "=" * 80)
print("DIMENSIONALITY REDUCTION")
print("=" * 80)

# PCA
sc.tl.pca(adata, svd_solver='arpack')
sc.pl.pca_variance_ratio(adata, log=True, save='_pca_variance')

# Compute neighborhood graph
sc.pp.neighbors(adata, n_neighbors=N_NEIGHBORS, n_pcs=N_PCS)

# UMAP
sc.tl.umap(adata)

# ============================================================================
# 7. CLUSTERING
# ============================================================================

print("\n" + "=" * 80)
print("CLUSTERING")
print("=" * 80)

# Leiden clustering
sc.tl.leiden(adata, resolution=LEIDEN_RESOLUTION)

# Visualize
sc.pl.umap(adata, color='leiden', legend_loc='on data', save='_leiden')

print(f"Identified {len(adata.obs['leiden'].unique())} clusters")

# ============================================================================
# 8. MARKER GENE IDENTIFICATION
# ============================================================================

print("\n" + "=" * 80)
print("MARKER GENE IDENTIFICATION")
print("=" * 80)

# Find marker genes
sc.tl.rank_genes_groups(adata, 'leiden', method='wilcoxon')

# Visualize top markers
sc.pl.rank_genes_groups(adata, n_genes=25, sharey=False, save='_markers')
sc.pl.rank_genes_groups_heatmap(adata, n_genes=10, save='_markers_heatmap')
sc.pl.rank_genes_groups_dotplot(adata, n_genes=5, save='_markers_dotplot')

# Get top markers for each cluster
for cluster in adata.obs['leiden'].unique():
    print(f"\nCluster {cluster} top markers:")
    markers = sc.get.rank_genes_groups_df(adata, group=cluster).head(10)
    print(markers[['names', 'scores', 'pvals_adj']].to_string(index=False))

# ============================================================================
# 9. CELL TYPE ANNOTATION (CUSTOMIZE THIS SECTION)
# ============================================================================

print("\n" + "=" * 80)
print("CELL TYPE ANNOTATION")
print("=" * 80)

# Example marker genes for common cell types (customize for your data)
marker_genes = {
    'T cells': ['CD3D', 'CD3E', 'CD3G'],
    'B cells': ['MS4A1', 'CD79A', 'CD79B'],
    'Monocytes': ['CD14', 'LYZ', 'S100A8'],
    'NK cells': ['NKG7', 'GNLY', 'KLRD1'],
    'Dendritic cells': ['FCER1A', 'CST3'],
}

# Visualize marker genes
for cell_type, genes in marker_genes.items():
    available_genes = [g for g in genes if g in adata.raw.var_names]
    if available_genes:
        sc.pl.umap(adata, color=available_genes, use_raw=True,
                   save=f'_{cell_type.replace(" ", "_")}')

# Manual annotation based on marker expression (customize this mapping)
cluster_to_celltype = {
    '0': 'CD4 T cells',
    '1': 'CD14+ Monocytes',
    '2': 'B cells',
    '3': 'CD8 T cells',
    '4': 'NK cells',
    # Add more mappings based on your marker analysis
}

# Apply annotations
adata.obs['cell_type'] = adata.obs['leiden'].map(cluster_to_celltype)
adata.obs['cell_type'] = adata.obs['cell_type'].fillna('Unknown')

# Visualize annotated cell types
sc.pl.umap(adata, color='cell_type', legend_loc='on data', save='_celltypes')

# ============================================================================
# 10. ADDITIONAL ANALYSES (OPTIONAL)
# ============================================================================

print("\n" + "=" * 80)
print("ADDITIONAL ANALYSES")
print("=" * 80)

# PAGA trajectory analysis (optional)
sc.tl.paga(adata, groups='leiden')
sc.pl.paga(adata, color='leiden', save='_paga')

# Gene set scoring (optional)
# example_gene_set = ['CD3D', 'CD3E', 'CD3G']
# sc.tl.score_genes(adata, example_gene_set, score_name='T_cell_score')
# sc.pl.umap(adata, color='T_cell_score', save='_gene_set_score')

# ============================================================================
# 11. SAVE RESULTS
# ============================================================================

print("\n" + "=" * 80)
print("SAVING RESULTS")
print("=" * 80)

import os
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Save processed AnnData object
adata.write(f'{OUTPUT_DIR}/processed_data.h5ad')
print(f"Saved processed data to {OUTPUT_DIR}/processed_data.h5ad")

# Export metadata
adata.obs.to_csv(f'{OUTPUT_DIR}/cell_metadata.csv')
adata.var.to_csv(f'{OUTPUT_DIR}/gene_metadata.csv')
print(f"Saved metadata to {OUTPUT_DIR}/")

# Export marker genes
for cluster in adata.obs['leiden'].unique():
    markers = sc.get.rank_genes_groups_df(adata, group=cluster)
    markers.to_csv(f'{OUTPUT_DIR}/markers_cluster_{cluster}.csv', index=False)
print(f"Saved marker genes to {OUTPUT_DIR}/")

# ============================================================================
# 12. SUMMARY
# ============================================================================

print("\n" + "=" * 80)
print("ANALYSIS SUMMARY")
print("=" * 80)

print(f"\nFinal dataset:")
print(f"  Cells: {adata.n_obs}")
print(f"  Genes: {adata.n_vars}")
print(f"  Clusters: {len(adata.obs['leiden'].unique())}")

print(f"\nCell type distribution:")
print(adata.obs['cell_type'].value_counts())

print("\n" + "=" * 80)
print("ANALYSIS COMPLETE")
print("=" * 80)
