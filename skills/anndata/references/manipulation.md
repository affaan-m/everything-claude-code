# Data Manipulation

Operations for transforming, subsetting, and manipulating AnnData objects.

## Subsetting

### By indices
```python
import anndata as ad
import numpy as np

adata = ad.AnnData(X=np.random.rand(1000, 2000))

# Integer indices
subset = adata[0:100, 0:500]  # First 100 obs, first 500 vars

# List of indices
obs_indices = [0, 10, 20, 30, 40]
var_indices = [0, 1, 2, 3, 4]
subset = adata[obs_indices, var_indices]

# Single observation or variable
single_obs = adata[0, :]
single_var = adata[:, 0]
```

### By names
```python
import pandas as pd

# Create with named indices
obs_names = [f'cell_{i}' for i in range(1000)]
var_names = [f'gene_{i}' for i in range(2000)]
adata = ad.AnnData(
    X=np.random.rand(1000, 2000),
    obs=pd.DataFrame(index=obs_names),
    var=pd.DataFrame(index=var_names)
)

# Subset by observation names
subset = adata[['cell_0', 'cell_1', 'cell_2'], :]

# Subset by variable names
subset = adata[:, ['gene_0', 'gene_10', 'gene_20']]

# Both axes
subset = adata[['cell_0', 'cell_1'], ['gene_0', 'gene_1']]
```

### By boolean masks
```python
# Create boolean masks
high_count_obs = np.random.rand(1000) > 0.5
high_var_genes = np.random.rand(2000) > 0.7

# Subset using masks
subset = adata[high_count_obs, :]
subset = adata[:, high_var_genes]
subset = adata[high_count_obs, high_var_genes]
```

### By metadata conditions
```python
# Add metadata
adata.obs['cell_type'] = np.random.choice(['A', 'B', 'C'], 1000)
adata.obs['quality_score'] = np.random.rand(1000)
adata.var['highly_variable'] = np.random.rand(2000) > 0.8

# Filter by cell type
t_cells = adata[adata.obs['cell_type'] == 'A']

# Filter by multiple conditions
high_quality_a_cells = adata[
    (adata.obs['cell_type'] == 'A') &
    (adata.obs['quality_score'] > 0.7)
]

# Filter by variable metadata
hv_genes = adata[:, adata.var['highly_variable']]

# Complex conditions
filtered = adata[
    (adata.obs['quality_score'] > 0.5) &
    (adata.obs['cell_type'].isin(['A', 'B'])),
    adata.var['highly_variable']
]
```

## Transposition

```python
# Transpose AnnData object (swap observations and variables)
adata_T = adata.T

# Shape changes
print(adata.shape)    # (1000, 2000)
print(adata_T.shape)  # (2000, 1000)

# obs and var are swapped
print(adata.obs.head())   # Observation metadata
print(adata_T.var.head()) # Same data, now as variable metadata

# Useful when data is in opposite orientation
# Common with some file formats where genes are rows
```

## Copying

### Full copy
```python
# Create independent copy
adata_copy = adata.copy()

# Modifications to copy don't affect original
adata_copy.obs['new_column'] = 1
print('new_column' in adata.obs.columns)  # False
```

### Shallow copy
```python
# View (doesn't copy data, modifications affect original)
adata_view = adata[0:100, :]

# Check if object is a view
print(adata_view.is_view)  # True

# Convert view to independent copy
adata_independent = adata_view.copy()
print(adata_independent.is_view)  # False
```

## Renaming

### Rename observations and variables
```python
# Rename all observations
adata.obs_names = [f'new_cell_{i}' for i in range(adata.n_obs)]

# Rename all variables
adata.var_names = [f'new_gene_{i}' for i in range(adata.n_vars)]

# Make names unique (add suffix to duplicates)
adata.obs_names_make_unique()
adata.var_names_make_unique()
```

### Rename categories
```python
# Create categorical column
adata.obs['cell_type'] = pd.Categorical(['A', 'B', 'C'] * 333 + ['A'])

# Rename categories
adata.rename_categories('cell_type', ['Type_A', 'Type_B', 'Type_C'])

# Or using dictionary
adata.rename_categories('cell_type', {
    'Type_A': 'T_cell',
    'Type_B': 'B_cell',
    'Type_C': 'Monocyte'
})
```

## Type Conversions

### Strings to categoricals
```python
# Convert string columns to categorical (more memory efficient)
adata.obs['cell_type'] = ['TypeA', 'TypeB'] * 500
adata.obs['tissue'] = ['brain', 'liver'] * 500

# Convert all string columns to categorical
adata.strings_to_categoricals()

print(adata.obs['cell_type'].dtype)  # category
print(adata.obs['tissue'].dtype)     # category
```

### Sparse to dense and vice versa
```python
from scipy.sparse import csr_matrix

# Dense to sparse
if not isinstance(adata.X, csr_matrix):
    adata.X = csr_matrix(adata.X)

# Sparse to dense
if isinstance(adata.X, csr_matrix):
    adata.X = adata.X.toarray()

# Convert layer
adata.layers['normalized'] = csr_matrix(adata.layers['normalized'])
```

## Chunked Operations

Process large datasets in chunks:

```python
# Iterate through data in chunks
chunk_size = 100
for chunk in adata.chunked_X(chunk_size):
    # Process chunk
    result = process_chunk(chunk)
```

## Extracting Vectors

### Get observation vectors
```python
# Get observation metadata as array
cell_types = adata.obs_vector('cell_type')

# Get gene expression across observations
actb_expression = adata.obs_vector('ACTB')  # If ACTB in var_names
```

### Get variable vectors
```python
# Get variable metadata as array
gene_names = adata.var_vector('gene_name')
```

## Adding/Modifying Data

### Add observations
```python
# Create new observations
new_obs = ad.AnnData(X=np.random.rand(100, adata.n_vars))
new_obs.var_names = adata.var_names

# Concatenate with existing
adata_extended = ad.concat([adata, new_obs], axis=0)
```

### Add variables
```python
# Create new variables
new_vars = ad.AnnData(X=np.random.rand(adata.n_obs, 100))
new_vars.obs_names = adata.obs_names

# Concatenate with existing
adata_extended = ad.concat([adata, new_vars], axis=1)
```

### Add metadata columns
```python
# Add observation annotation
adata.obs['new_score'] = np.random.rand(adata.n_obs)

# Add variable annotation
adata.var['new_label'] = ['label'] * adata.n_vars

# Add from external data
external_data = pd.read_csv('metadata.csv', index_col=0)
adata.obs['external_info'] = external_data.loc[adata.obs_names, 'column']
```

### Add layers
```python
# Add new layer
adata.layers['raw_counts'] = np.random.randint(0, 100, adata.shape)
adata.layers['log_transformed'] = np.log1p(adata.X)

# Replace layer
adata.layers['normalized'] = new_normalized_data
```

### Add embeddings
```python
# Add PCA
adata.obsm['X_pca'] = np.random.rand(adata.n_obs, 50)

# Add UMAP
adata.obsm['X_umap'] = np.random.rand(adata.n_obs, 2)

# Add multiple embeddings
adata.obsm['X_tsne'] = np.random.rand(adata.n_obs, 2)
adata.obsm['X_diffmap'] = np.random.rand(adata.n_obs, 10)
```

### Add pairwise relationships
```python
from scipy.sparse import csr_matrix

# Add nearest neighbor graph
n_obs = adata.n_obs
knn_graph = csr_matrix(np.random.rand(n_obs, n_obs) > 0.95)
adata.obsp['connectivities'] = knn_graph

# Add distance matrix
adata.obsp['distances'] = csr_matrix(np.random.rand(n_obs, n_obs))
```

### Add unstructured data
```python
# Add analysis parameters
adata.uns['pca'] = {
    'variance': [0.2, 0.15, 0.1],
    'variance_ratio': [0.4, 0.3, 0.2],
    'params': {'n_comps': 50}
}

# Add color schemes
adata.uns['cell_type_colors'] = ['#FF0000', '#00FF00', '#0000FF']
```

## Removing Data

### Remove observations or variables
```python
# Keep only specific observations
keep_obs = adata.obs['quality_score'] > 0.5
adata = adata[keep_obs, :]

# Remove specific variables
remove_vars = adata.var['low_count']
adata = adata[:, ~remove_vars]
```

### Remove metadata columns
```python
# Remove observation column
adata.obs.drop('unwanted_column', axis=1, inplace=True)

# Remove variable column
adata.var.drop('unwanted_column', axis=1, inplace=True)
```

### Remove layers
```python
# Remove specific layer
del adata.layers['unwanted_layer']

# Remove all layers
adata.layers = {}
```

### Remove embeddings
```python
# Remove specific embedding
del adata.obsm['X_tsne']

# Remove all embeddings
adata.obsm = {}
```

### Remove unstructured data
```python
# Remove specific key
del adata.uns['unwanted_key']

# Remove all unstructured data
adata.uns = {}
```

## Reordering

### Sort observations
```python
# Sort by observation metadata
adata = adata[adata.obs.sort_values('quality_score').index, :]

# Sort by observation names
adata = adata[sorted(adata.obs_names), :]
```

### Sort variables
```python
# Sort by variable metadata
adata = adata[:, adata.var.sort_values('gene_name').index]

# Sort by variable names
adata = adata[:, sorted(adata.var_names)]
```

### Reorder to match external list
```python
# Reorder observations to match external list
desired_order = ['cell_10', 'cell_5', 'cell_20', ...]
adata = adata[desired_order, :]

# Reorder variables
desired_genes = ['TP53', 'ACTB', 'GAPDH', ...]
adata = adata[:, desired_genes]
```

## Data Transformations

### Normalize
```python
# Total count normalization (CPM/TPM-like)
total_counts = adata.X.sum(axis=1)
adata.layers['normalized'] = adata.X / total_counts[:, np.newaxis] * 1e6

# Log transformation
adata.layers['log1p'] = np.log1p(adata.X)

# Z-score normalization
mean = adata.X.mean(axis=0)
std = adata.X.std(axis=0)
adata.layers['scaled'] = (adata.X - mean) / std
```

### Filter
```python
# Filter cells by total counts
total_counts = np.array(adata.X.sum(axis=1)).flatten()
adata.obs['total_counts'] = total_counts
adata = adata[adata.obs['total_counts'] > 1000, :]

# Filter genes by detection rate
detection_rate = (adata.X > 0).sum(axis=0) / adata.n_obs
adata.var['detection_rate'] = np.array(detection_rate).flatten()
adata = adata[:, adata.var['detection_rate'] > 0.01]
```

## Working with Views

Views are lightweight references to subsets of data that don't copy the underlying matrix:

```python
# Create view
view = adata[0:100, 0:500]
print(view.is_view)  # True

# Views allow read access
data = view.X

# Modifying view data affects original
# (Be careful!)

# Convert view to independent copy
independent = view.copy()

# Force AnnData to be a copy, not a view
adata = adata.copy()
```

## Merging Metadata

```python
# Merge external metadata
external_metadata = pd.read_csv('additional_metadata.csv', index_col=0)

# Join metadata (inner join on index)
adata.obs = adata.obs.join(external_metadata)

# Left join (keep all adata observations)
adata.obs = adata.obs.merge(
    external_metadata,
    left_index=True,
    right_index=True,
    how='left'
)
```

## Common Manipulation Patterns

### Quality control filtering
```python
# Calculate QC metrics
adata.obs['n_genes'] = (adata.X > 0).sum(axis=1)
adata.obs['total_counts'] = adata.X.sum(axis=1)
adata.var['n_cells'] = (adata.X > 0).sum(axis=0)

# Filter low-quality cells
adata = adata[adata.obs['n_genes'] > 200, :]
adata = adata[adata.obs['total_counts'] < 50000, :]

# Filter rarely detected genes
adata = adata[:, adata.var['n_cells'] >= 3]
```

### Select highly variable genes
```python
# Mark highly variable genes
gene_variance = np.var(adata.X, axis=0)
adata.var['variance'] = np.array(gene_variance).flatten()
adata.var['highly_variable'] = adata.var['variance'] > np.percentile(gene_variance, 90)

# Subset to highly variable genes
adata_hvg = adata[:, adata.var['highly_variable']].copy()
```

### Downsample
```python
# Random sampling of observations
np.random.seed(42)
n_sample = 500
sample_indices = np.random.choice(adata.n_obs, n_sample, replace=False)
adata_downsampled = adata[sample_indices, :].copy()

# Stratified sampling by cell type
from sklearn.model_selection import train_test_split
train_idx, test_idx = train_test_split(
    range(adata.n_obs),
    test_size=0.2,
    stratify=adata.obs['cell_type']
)
adata_train = adata[train_idx, :].copy()
adata_test = adata[test_idx, :].copy()
```

### Split train/test
```python
# Random train/test split
np.random.seed(42)
n_obs = adata.n_obs
train_size = int(0.8 * n_obs)
indices = np.random.permutation(n_obs)
train_indices = indices[:train_size]
test_indices = indices[train_size:]

adata_train = adata[train_indices, :].copy()
adata_test = adata[test_indices, :].copy()
```
