# scEmbed: Single-Cell Embedding Generation

## Overview

scEmbed trains Region2Vec models on single-cell ATAC-seq datasets to generate cell embeddings for clustering and analysis. It provides an unsupervised machine learning framework for representing and analyzing scATAC-seq data in low-dimensional space.

## When to Use

Use scEmbed when working with:
- Single-cell ATAC-seq (scATAC-seq) data requiring clustering
- Cell-type annotation tasks
- Dimensionality reduction for single-cell chromatin accessibility
- Integration with scanpy workflows for downstream analysis

## Workflow

### Step 1: Data Preparation

Input data must be in AnnData format with `.var` attributes containing `chr`, `start`, and `end` values for peaks.

**Starting from raw data** (barcodes.txt, peaks.bed, matrix.mtx):

```python
import scanpy as sc
import pandas as pd
import scipy.io
import anndata

# Load data
barcodes = pd.read_csv('barcodes.txt', header=None, names=['barcode'])
peaks = pd.read_csv('peaks.bed', sep='\t', header=None,
                    names=['chr', 'start', 'end'])
matrix = scipy.io.mmread('matrix.mtx').tocsr()

# Create AnnData
adata = anndata.AnnData(X=matrix.T, obs=barcodes, var=peaks)
adata.write('scatac_data.h5ad')
```

### Step 2: Pre-tokenization

Convert genomic regions into tokens using gtars utilities. This creates a parquet file with tokenized cells for faster training:

```python
from geniml.io import tokenize_cells

tokenize_cells(
    adata='scatac_data.h5ad',
    universe_file='universe.bed',
    output='tokenized_cells.parquet'
)
```

**Benefits of pre-tokenization:**
- Faster training iterations
- Reduced memory requirements
- Reusable tokenized data for multiple training runs

### Step 3: Model Training

Train the scEmbed model using tokenized data:

```python
from geniml.scembed import ScEmbed
from geniml.region2vec import Region2VecDataset

# Load tokenized dataset
dataset = Region2VecDataset('tokenized_cells.parquet')

# Initialize and train model
model = ScEmbed(
    embedding_dim=100,
    window_size=5,
    negative_samples=5
)

model.train(
    dataset=dataset,
    epochs=100,
    batch_size=256,
    learning_rate=0.025
)

# Save model
model.save('scembed_model/')
```

### Step 4: Generate Cell Embeddings

Use the trained model to generate embeddings for cells:

```python
from geniml.scembed import ScEmbed

# Load trained model
model = ScEmbed.from_pretrained('scembed_model/')

# Generate embeddings for AnnData object
embeddings = model.encode(adata)

# Add to AnnData for downstream analysis
adata.obsm['scembed_X'] = embeddings
```

### Step 5: Downstream Analysis

Integrate with scanpy for clustering and visualization:

```python
import scanpy as sc

# Use scEmbed embeddings for neighborhood graph
sc.pp.neighbors(adata, use_rep='scembed_X')

# Cluster cells
sc.tl.leiden(adata, resolution=0.5)

# Compute UMAP for visualization
sc.tl.umap(adata)

# Plot results
sc.pl.umap(adata, color='leiden')
```

## Key Parameters

### Training Parameters

| Parameter | Description | Typical Range |
|-----------|-------------|---------------|
| `embedding_dim` | Dimension of cell embeddings | 50 - 200 |
| `window_size` | Context window for training | 3 - 10 |
| `negative_samples` | Number of negative samples | 5 - 20 |
| `epochs` | Training epochs | 50 - 200 |
| `batch_size` | Training batch size | 128 - 512 |
| `learning_rate` | Initial learning rate | 0.01 - 0.05 |

### Tokenization Parameters

- **Universe file**: Reference BED file defining the genomic vocabulary
- **Overlap threshold**: Minimum overlap for peak-universe matching (typically 1e-9)

## Pre-trained Models

Pre-trained scEmbed models are available on Hugging Face for common reference datasets. Load them using:

```python
from geniml.scembed import ScEmbed

# Load pre-trained model
model = ScEmbed.from_pretrained('databio/scembed-pbmc-10k')

# Generate embeddings
embeddings = model.encode(adata)
```

## Best Practices

- **Data quality**: Use filtered peak-barcode matrices, not raw counts
- **Pre-tokenization**: Always pre-tokenize to improve training efficiency
- **Parameter tuning**: Adjust `embedding_dim` and training epochs based on dataset size
- **Validation**: Use known cell-type markers to validate clustering quality
- **Integration**: Combine with scanpy for comprehensive single-cell analysis
- **Model sharing**: Export trained models to Hugging Face for reproducibility

## Example Dataset

The 10x Genomics PBMC 10k dataset (10,000 peripheral blood mononuclear cells) serves as a standard benchmark:
- Contains diverse immune cell types
- Well-characterized cell populations
- Available from 10x Genomics website

## Cell-Type Annotation

After clustering, annotate cell types using k-nearest neighbors (KNN) with reference datasets:

```python
from geniml.scembed import annotate_celltypes

# Annotate using reference
annotations = annotate_celltypes(
    query_adata=adata,
    reference_adata=reference,
    embedding_key='scembed_X',
    k=10
)

adata.obs['cell_type'] = annotations
```

## Output

scEmbed produces:
- Low-dimensional cell embeddings (stored in `adata.obsm`)
- Trained model files for reuse
- Compatible format for scanpy downstream analysis
- Optional export to Hugging Face for sharing
