---
name: anndata
description: Data structure for annotated matrices in single-cell analysis. Use when working with .h5ad files or integrating with the scverse ecosystem. This is the data format skill—for analysis workflows use scanpy; for probabilistic models use scvi-tools; for population-scale queries use cellxgene-census.
license: BSD-3-Clause license
metadata:
    skill-author: K-Dense Inc.
---

# AnnData

## Overview

AnnData is a Python package for handling annotated data matrices, storing experimental measurements (X) alongside observation metadata (obs), variable metadata (var), and multi-dimensional annotations (obsm, varm, obsp, varp, uns). Originally designed for single-cell genomics through Scanpy, it now serves as a general-purpose framework for any annotated data requiring efficient storage, manipulation, and analysis.

## When to Use This Skill

Use this skill when:
- Creating, reading, or writing AnnData objects
- Working with h5ad, zarr, or other genomics data formats
- Performing single-cell RNA-seq analysis
- Managing large datasets with sparse matrices or backed mode
- Concatenating multiple datasets or experimental batches
- Subsetting, filtering, or transforming annotated data
- Integrating with scanpy, scvi-tools, or other scverse ecosystem tools

## Installation

```bash
uv pip install anndata

# With optional dependencies
uv pip install anndata[dev,test,doc]
```

## Quick Start

### Creating an AnnData object
```python
import anndata as ad
import numpy as np
import pandas as pd

# Minimal creation
X = np.random.rand(100, 2000)  # 100 cells × 2000 genes
adata = ad.AnnData(X)

# With metadata
obs = pd.DataFrame({
    'cell_type': ['T cell', 'B cell'] * 50,
    'sample': ['A', 'B'] * 50
}, index=[f'cell_{i}' for i in range(100)])

var = pd.DataFrame({
    'gene_name': [f'Gene_{i}' for i in range(2000)]
}, index=[f'ENSG{i:05d}' for i in range(2000)])

adata = ad.AnnData(X=X, obs=obs, var=var)
```

### Reading data
```python
# Read h5ad file
adata = ad.read_h5ad('data.h5ad')

# Read with backed mode (for large files)
adata = ad.read_h5ad('large_data.h5ad', backed='r')

# Read other formats
adata = ad.read_csv('data.csv')
adata = ad.read_loom('data.loom')
adata = ad.read_10x_h5('filtered_feature_bc_matrix.h5')
```

### Writing data
```python
# Write h5ad file
adata.write_h5ad('output.h5ad')

# Write with compression
adata.write_h5ad('output.h5ad', compression='gzip')

# Write other formats
adata.write_zarr('output.zarr')
adata.write_csvs('output_dir/')
```

### Basic operations
```python
# Subset by conditions
t_cells = adata[adata.obs['cell_type'] == 'T cell']

# Subset by indices
subset = adata[0:50, 0:100]

# Add metadata
adata.obs['quality_score'] = np.random.rand(adata.n_obs)
adata.var['highly_variable'] = np.random.rand(adata.n_vars) > 0.8

# Access dimensions
print(f"{adata.n_obs} observations × {adata.n_vars} variables")
```

## Core Capabilities

### 1. Data Structure

Understand the AnnData object structure including X, obs, var, layers, obsm, varm, obsp, varp, uns, and raw components.

**See**: `references/data_structure.md` for comprehensive information on:
- Core components (X, obs, var, layers, obsm, varm, obsp, varp, uns, raw)
- Creating AnnData objects from various sources
- Accessing and manipulating data components
- Memory-efficient practices

### 2. Input/Output Operations

Read and write data in various formats with support for compression, backed mode, and cloud storage.

**See**: `references/io_operations.md` for details on:
- Native formats (h5ad, zarr)
- Alternative formats (CSV, MTX, Loom, 10X, Excel)
- Backed mode for large datasets
- Remote data access
- Format conversion
- Performance optimization

Common commands:
```python
# Read/write h5ad
adata = ad.read_h5ad('data.h5ad', backed='r')
adata.write_h5ad('output.h5ad', compression='gzip')

# Read 10X data
adata = ad.read_10x_h5('filtered_feature_bc_matrix.h5')

# Read MTX format
adata = ad.read_mtx('matrix.mtx').T
```

### 3. Concatenation

Combine multiple AnnData objects along observations or variables with flexible join strategies.

**See**: `references/concatenation.md` for comprehensive coverage of:
- Basic concatenation (axis=0 for observations, axis=1 for variables)
- Join types (inner, outer)
- Merge strategies (same, unique, first, only)
- Tracking data sources with labels
- Lazy concatenation (AnnCollection)
- On-disk concatenation for large datasets

Common commands:
```python
# Concatenate observations (combine samples)
adata = ad.concat(
    [adata1, adata2, adata3],
    axis=0,
    join='inner',
    label='batch',
    keys=['batch1', 'batch2', 'batch3']
)

# Concatenate variables (combine modalities)
adata = ad.concat([adata_rna, adata_protein], axis=1)

# Lazy concatenation
from anndata.experimental import AnnCollection
collection = AnnCollection(
    ['data1.h5ad', 'data2.h5ad'],
    join_obs='outer',
    label='dataset'
)
```

### 4. Data Manipulation

Transform, subset, filter, and reorganize data efficiently.

**See**: `references/manipulation.md` for detailed guidance on:
- Subsetting (by indices, names, boolean masks, metadata conditions)
- Transposition
- Copying (full copies vs views)
- Renaming (observations, variables, categories)
- Type conversions (strings to categoricals, sparse/dense)
- Adding/removing data components
- Reordering
- Quality control filtering

Common commands:
```python
# Subset by metadata
filtered = adata[adata.obs['quality_score'] > 0.8]
hv_genes = adata[:, adata.var['highly_variable']]

# Transpose
adata_T = adata.T

# Copy vs view
view = adata[0:100, :]  # View (lightweight reference)
copy = adata[0:100, :].copy()  # Independent copy

# Convert strings to categoricals
adata.strings_to_categoricals()
```

### 5. Best Practices

Follow recommended patterns for memory efficiency, performance, and reproducibility.

**See**: `references/best_practices.md` for guidelines on:
- Memory management (sparse matrices, categoricals, backed mode)
- Views vs copies
- Data storage optimization
- Performance optimization
- Working with raw data
- Metadata management
- Reproducibility
- Error handling
- Integration with other tools
- Common pitfalls and solutions

Key recommendations:
```python
# Use sparse matrices for sparse data
from scipy.sparse import csr_matrix
adata.X = csr_matrix(adata.X)

# Convert strings to categoricals
adata.strings_to_categoricals()

# Use backed mode for large files
adata = ad.read_h5ad('large.h5ad', backed='r')

# Store raw before filtering
adata.raw = adata.copy()
adata = adata[:, adata.var['highly_variable']]
```

## Integration with Scverse Ecosystem

AnnData serves as the foundational data structure for the scverse ecosystem:

### Scanpy (Single-cell analysis)
```python
import scanpy as sc

# Preprocessing
sc.pp.filter_cells(adata, min_genes=200)
sc.pp.normalize_total(adata, target_sum=1e4)
sc.pp.log1p(adata)
sc.pp.highly_variable_genes(adata, n_top_genes=2000)

# Dimensionality reduction
sc.pp.pca(adata, n_comps=50)
sc.pp.neighbors(adata, n_neighbors=15)
sc.tl.umap(adata)
sc.tl.leiden(adata)

# Visualization
sc.pl.umap(adata, color=['cell_type', 'leiden'])
```

### Muon (Multimodal data)
```python
import muon as mu

# Combine RNA and protein data
mdata = mu.MuData({'rna': adata_rna, 'protein': adata_protein})
```

### PyTorch integration
```python
from anndata.experimental import AnnLoader

# Create DataLoader for deep learning
dataloader = AnnLoader(adata, batch_size=128, shuffle=True)

for batch in dataloader:
    X = batch.X
    # Train model
```

## Common Workflows

### Single-cell RNA-seq analysis
```python
import anndata as ad
import scanpy as sc

# 1. Load data
adata = ad.read_10x_h5('filtered_feature_bc_matrix.h5')

# 2. Quality control
adata.obs['n_genes'] = (adata.X > 0).sum(axis=1)
adata.obs['n_counts'] = adata.X.sum(axis=1)
adata = adata[adata.obs['n_genes'] > 200]
adata = adata[adata.obs['n_counts'] < 50000]

# 3. Store raw
adata.raw = adata.copy()

# 4. Normalize and filter
sc.pp.normalize_total(adata, target_sum=1e4)
sc.pp.log1p(adata)
sc.pp.highly_variable_genes(adata, n_top_genes=2000)
adata = adata[:, adata.var['highly_variable']]

# 5. Save processed data
adata.write_h5ad('processed.h5ad')
```

### Batch integration
```python
# Load multiple batches
adata1 = ad.read_h5ad('batch1.h5ad')
adata2 = ad.read_h5ad('batch2.h5ad')
adata3 = ad.read_h5ad('batch3.h5ad')

# Concatenate with batch labels
adata = ad.concat(
    [adata1, adata2, adata3],
    label='batch',
    keys=['batch1', 'batch2', 'batch3'],
    join='inner'
)

# Apply batch correction
import scanpy as sc
sc.pp.combat(adata, key='batch')

# Continue analysis
sc.pp.pca(adata)
sc.pp.neighbors(adata)
sc.tl.umap(adata)
```

### Working with large datasets
```python
# Open in backed mode
adata = ad.read_h5ad('100GB_dataset.h5ad', backed='r')

# Filter based on metadata (no data loading)
high_quality = adata[adata.obs['quality_score'] > 0.8]

# Load filtered subset
adata_subset = high_quality.to_memory()

# Process subset
process(adata_subset)

# Or process in chunks
chunk_size = 1000
for i in range(0, adata.n_obs, chunk_size):
    chunk = adata[i:i+chunk_size, :].to_memory()
    process(chunk)
```

## Troubleshooting

### Out of memory errors
Use backed mode or convert to sparse matrices:
```python
# Backed mode
adata = ad.read_h5ad('file.h5ad', backed='r')

# Sparse matrices
from scipy.sparse import csr_matrix
adata.X = csr_matrix(adata.X)
```

### Slow file reading
Use compression and appropriate formats:
```python
# Optimize for storage
adata.strings_to_categoricals()
adata.write_h5ad('file.h5ad', compression='gzip')

# Use Zarr for cloud storage
adata.write_zarr('file.zarr', chunks=(1000, 1000))
```

### Index alignment issues
Always align external data on index:
```python
# Wrong
adata.obs['new_col'] = external_data['values']

# Correct
adata.obs['new_col'] = external_data.set_index('cell_id').loc[adata.obs_names, 'values']
```

## Additional Resources

- **Official documentation**: https://anndata.readthedocs.io/
- **Scanpy tutorials**: https://scanpy.readthedocs.io/
- **Scverse ecosystem**: https://scverse.org/
- **GitHub repository**: https://github.com/scverse/anndata

