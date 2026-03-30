# AnnData Object Structure

The AnnData object stores a data matrix with associated annotations, providing a flexible framework for managing experimental data and metadata.

## Core Components

### X (Data Matrix)
The primary data matrix with shape (n_obs, n_vars) storing experimental measurements.

```python
import anndata as ad
import numpy as np

# Create with dense array
adata = ad.AnnData(X=np.random.rand(100, 2000))

# Create with sparse matrix (recommended for large, sparse data)
from scipy.sparse import csr_matrix
sparse_data = csr_matrix(np.random.rand(100, 2000))
adata = ad.AnnData(X=sparse_data)
```

Access data:
```python
# Full matrix (caution with large datasets)
full_data = adata.X

# Single observation
obs_data = adata.X[0, :]

# Single variable across all observations
var_data = adata.X[:, 0]
```

### obs (Observation Annotations)
DataFrame storing metadata about observations (rows). Each row corresponds to one observation in X.

```python
import pandas as pd

# Create AnnData with observation metadata
obs_df = pd.DataFrame({
    'cell_type': ['T cell', 'B cell', 'Monocyte'],
    'treatment': ['control', 'treated', 'control'],
    'timepoint': [0, 24, 24]
}, index=['cell_1', 'cell_2', 'cell_3'])

adata = ad.AnnData(X=np.random.rand(3, 100), obs=obs_df)

# Access observation metadata
print(adata.obs['cell_type'])
print(adata.obs.loc['cell_1'])
```

### var (Variable Annotations)
DataFrame storing metadata about variables (columns). Each row corresponds to one variable in X.

```python
# Create AnnData with variable metadata
var_df = pd.DataFrame({
    'gene_name': ['ACTB', 'GAPDH', 'TP53'],
    'chromosome': ['7', '12', '17'],
    'highly_variable': [True, False, True]
}, index=['ENSG00001', 'ENSG00002', 'ENSG00003'])

adata = ad.AnnData(X=np.random.rand(100, 3), var=var_df)

# Access variable metadata
print(adata.var['gene_name'])
print(adata.var.loc['ENSG00001'])
```

### layers (Alternative Data Representations)
Dictionary storing alternative matrices with the same dimensions as X.

```python
# Store raw counts, normalized data, and scaled data
adata = ad.AnnData(X=np.random.rand(100, 2000))
adata.layers['raw_counts'] = np.random.randint(0, 100, (100, 2000))
adata.layers['normalized'] = adata.X / np.sum(adata.X, axis=1, keepdims=True)
adata.layers['scaled'] = (adata.X - adata.X.mean()) / adata.X.std()

# Access layers
raw_data = adata.layers['raw_counts']
normalized_data = adata.layers['normalized']
```

Common layer uses:
- `raw_counts`: Original count data before normalization
- `normalized`: Log-normalized or TPM values
- `scaled`: Z-scored values for analysis
- `imputed`: Data after imputation

### obsm (Multi-dimensional Observation Annotations)
Dictionary storing multi-dimensional arrays aligned to observations.

```python
# Store PCA coordinates and UMAP embeddings
adata.obsm['X_pca'] = np.random.rand(100, 50)  # 50 principal components
adata.obsm['X_umap'] = np.random.rand(100, 2)  # 2D UMAP coordinates
adata.obsm['X_tsne'] = np.random.rand(100, 2)  # 2D t-SNE coordinates

# Access embeddings
pca_coords = adata.obsm['X_pca']
umap_coords = adata.obsm['X_umap']
```

Common obsm uses:
- `X_pca`: Principal component coordinates
- `X_umap`: UMAP embedding coordinates
- `X_tsne`: t-SNE embedding coordinates
- `X_diffmap`: Diffusion map coordinates
- `protein_expression`: Protein abundance measurements (CITE-seq)

### varm (Multi-dimensional Variable Annotations)
Dictionary storing multi-dimensional arrays aligned to variables.

```python
# Store PCA loadings
adata.varm['PCs'] = np.random.rand(2000, 50)  # Loadings for 50 components
adata.varm['gene_modules'] = np.random.rand(2000, 10)  # Gene module scores

# Access loadings
pc_loadings = adata.varm['PCs']
```

Common varm uses:
- `PCs`: Principal component loadings
- `gene_modules`: Gene co-expression module assignments

### obsp (Pairwise Observation Relationships)
Dictionary storing sparse matrices representing relationships between observations.

```python
from scipy.sparse import csr_matrix

# Store k-nearest neighbor graph
n_obs = 100
knn_graph = csr_matrix(np.random.rand(n_obs, n_obs) > 0.95)
adata.obsp['connectivities'] = knn_graph
adata.obsp['distances'] = csr_matrix(np.random.rand(n_obs, n_obs))

# Access graphs
knn_connections = adata.obsp['connectivities']
distances = adata.obsp['distances']
```

Common obsp uses:
- `connectivities`: Cell-cell neighborhood graph
- `distances`: Pairwise distances between cells

### varp (Pairwise Variable Relationships)
Dictionary storing sparse matrices representing relationships between variables.

```python
# Store gene-gene correlation matrix
n_vars = 2000
gene_corr = csr_matrix(np.random.rand(n_vars, n_vars) > 0.99)
adata.varp['correlations'] = gene_corr

# Access correlations
gene_correlations = adata.varp['correlations']
```

### uns (Unstructured Annotations)
Dictionary storing arbitrary unstructured metadata.

```python
# Store analysis parameters and results
adata.uns['experiment_date'] = '2025-11-03'
adata.uns['pca'] = {
    'variance_ratio': [0.15, 0.10, 0.08],
    'params': {'n_comps': 50}
}
adata.uns['neighbors'] = {
    'params': {'n_neighbors': 15, 'method': 'umap'},
    'connectivities_key': 'connectivities'
}

# Access unstructured data
exp_date = adata.uns['experiment_date']
pca_params = adata.uns['pca']['params']
```

Common uns uses:
- Analysis parameters and settings
- Color palettes for plotting
- Cluster information
- Tool-specific metadata

### raw (Original Data Snapshot)
Optional attribute preserving the original data matrix and variable annotations before filtering.

```python
# Create AnnData and store raw state
adata = ad.AnnData(X=np.random.rand(100, 5000))
adata.var['gene_name'] = [f'Gene_{i}' for i in range(5000)]

# Store raw state before filtering
adata.raw = adata.copy()

# Filter to highly variable genes
highly_variable_mask = np.random.rand(5000) > 0.5
adata = adata[:, highly_variable_mask]

# Access original data
original_matrix = adata.raw.X
original_var = adata.raw.var
```

## Object Properties

```python
# Dimensions
n_observations = adata.n_obs
n_variables = adata.n_vars
shape = adata.shape  # (n_obs, n_vars)

# Index information
obs_names = adata.obs_names  # Observation identifiers
var_names = adata.var_names  # Variable identifiers

# Storage mode
is_view = adata.is_view  # True if this is a view of another object
is_backed = adata.isbacked  # True if backed by on-disk storage
filename = adata.filename  # Path to backing file (if backed)
```

## Creating AnnData Objects

### From arrays and DataFrames
```python
import anndata as ad
import numpy as np
import pandas as pd

# Minimal creation
X = np.random.rand(100, 2000)
adata = ad.AnnData(X)

# With metadata
obs = pd.DataFrame({'cell_type': ['A', 'B'] * 50}, index=[f'cell_{i}' for i in range(100)])
var = pd.DataFrame({'gene_name': [f'Gene_{i}' for i in range(2000)]}, index=[f'ENSG{i:05d}' for i in range(2000)])
adata = ad.AnnData(X=X, obs=obs, var=var)

# With all components
adata = ad.AnnData(
    X=X,
    obs=obs,
    var=var,
    layers={'raw': np.random.randint(0, 100, (100, 2000))},
    obsm={'X_pca': np.random.rand(100, 50)},
    uns={'experiment': 'test'}
)
```

### From DataFrame
```python
# Create from pandas DataFrame (genes as columns, cells as rows)
df = pd.DataFrame(
    np.random.rand(100, 50),
    columns=[f'Gene_{i}' for i in range(50)],
    index=[f'Cell_{i}' for i in range(100)]
)
adata = ad.AnnData(df)
```

## Data Access Patterns

### Vector extraction
```python
# Get observation annotation as array
cell_types = adata.obs_vector('cell_type')

# Get variable values across observations
gene_expression = adata.obs_vector('ACTB')  # If ACTB is in var_names

# Get variable annotation as array
gene_names = adata.var_vector('gene_name')
```

### Subsetting
```python
# By index
subset = adata[0:10, 0:100]  # First 10 obs, first 100 vars

# By name
subset = adata[['cell_1', 'cell_2'], ['ACTB', 'GAPDH']]

# By boolean mask
high_count_cells = adata.obs['total_counts'] > 1000
subset = adata[high_count_cells, :]

# By observation metadata
t_cells = adata[adata.obs['cell_type'] == 'T cell']
```

## Memory Considerations

The AnnData structure is designed for memory efficiency:
- Sparse matrices reduce memory for sparse data
- Views avoid copying data when possible
- Backed mode enables working with data larger than RAM
- Categorical annotations reduce memory for discrete values

```python
# Convert strings to categoricals (more memory efficient)
adata.obs['cell_type'] = adata.obs['cell_type'].astype('category')
adata.strings_to_categoricals()

# Check if object is a view (doesn't own data)
if adata.is_view:
    adata = adata.copy()  # Create independent copy
```
