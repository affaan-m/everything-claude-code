# UMAP API Reference

## UMAP Class

`umap.UMAP(n_neighbors=15, n_components=2, metric='euclidean', n_epochs=None, learning_rate=1.0, init='spectral', min_dist=0.1, spread=1.0, low_memory=True, set_op_mix_ratio=1.0, local_connectivity=1.0, repulsion_strength=1.0, negative_sample_rate=5, transform_queue_size=4.0, a=None, b=None, random_state=None, metric_kwds=None, angular_rp_forest=False, target_n_neighbors=-1, target_metric='categorical', target_metric_kwds=None, target_weight=0.5, transform_seed=42, transform_mode='embedding', force_approximation_algorithm=False, verbose=False, unique=False, densmap=False, dens_lambda=2.0, dens_frac=0.3, dens_var_shift=0.1, output_dens=False, disconnection_distance=None, precomputed_knn=(None, None, None))`

Find low-dimensional embedding that approximates the underlying manifold of the data.

### Core Parameters

#### n_neighbors (int, default: 15)
Size of the local neighborhood used for manifold approximation. Larger values result in more global views of the manifold, while smaller values preserve more local structure. Generally in the range 2 to 100.

**Tuning guidance:**
- Use 2-5 for very local structure
- Use 10-20 for balanced local/global structure (typical)
- Use 50-200 for emphasizing global structure

#### n_components (int, default: 2)
Dimension of the embedding space. Unlike t-SNE, UMAP scales well with increasing embedding dimensions.

**Common values:**
- 2-3: Visualization
- 5-10: Clustering preprocessing
- 10-100: Feature engineering for downstream ML

#### metric (str or callable, default: 'euclidean')
Distance metric to use. Accepts:
- Any metric from scipy.spatial.distance
- Any metric from sklearn.metrics
- Custom callable distance functions (must be compiled with Numba)

**Common metrics:**
- `'euclidean'`: Standard Euclidean distance (default)
- `'manhattan'`: L1 distance
- `'cosine'`: Cosine distance (good for text/document vectors)
- `'correlation'`: Correlation distance
- `'hamming'`: Hamming distance (for binary data)
- `'jaccard'`: Jaccard distance (for binary/set data)
- `'dice'`: Dice distance
- `'canberra'`: Canberra distance
- `'braycurtis'`: Bray-Curtis distance
- `'chebyshev'`: Chebyshev distance
- `'minkowski'`: Minkowski distance (specify p with metric_kwds)
- `'precomputed'`: Use precomputed distance matrix

#### min_dist (float, default: 0.1)
Effective minimum distance between embedded points. Controls how tightly points are packed together. Smaller values result in clumpier embeddings.

**Tuning guidance:**
- Use 0.0 for clustering applications
- Use 0.1-0.3 for visualization (balanced)
- Use 0.5-0.99 for loose structure preservation

#### spread (float, default: 1.0)
Effective scale of embedded points. Combined with `min_dist` to control clumped vs. spread-out embeddings. Determines how spread out the clusters are in the embedding space.

### Training Parameters

#### n_epochs (int, default: None)
Number of training epochs. If None, automatically determined based on dataset size (typically 200-500 epochs).

**Manual tuning:**
- Smaller datasets may need 500+ epochs
- Larger datasets may converge with 200 epochs
- More epochs = better optimization but slower training

#### learning_rate (float, default: 1.0)
Initial learning rate for the SGD optimizer. Higher values lead to faster convergence but may overshoot optimal solutions.

#### init (str or np.ndarray, default: 'spectral')
Initialization method for the embedding:
- `'spectral'`: Use spectral embedding (default, usually best)
- `'random'`: Random initialization
- `'pca'`: Initialize with PCA
- numpy array: Custom initialization (shape: (n_samples, n_components))

### Advanced Structural Parameters

#### local_connectivity (int, default: 1.0)
Number of nearest neighbors assumed to be locally connected. Higher values give more connected manifolds.

#### set_op_mix_ratio (float, default: 1.0)
Interpolation between union and intersection when constructing fuzzy set unions. Value of 1.0 uses pure union, 0.0 uses pure intersection.

#### repulsion_strength (float, default: 1.0)
Weighting applied to negative samples in low-dimensional embedding optimization. Higher values push embedded points further apart.

#### negative_sample_rate (int, default: 5)
Number of negative samples to select per positive sample. Higher values lead to greater repulsion between points and more spread-out embeddings but increase computational cost.

### Supervised Learning Parameters

#### target_n_neighbors (int, default: -1)
Number of nearest neighbors to use when constructing target simplicial set. If -1, uses n_neighbors value.

#### target_metric (str, default: 'categorical')
Distance metric for target values (labels):
- `'categorical'`: For classification tasks
- Any other metric for regression tasks

#### target_weight (float, default: 0.5)
Weight applied to target information vs. data structure. Range 0.0 to 1.0:
- 0.0: Pure unsupervised embedding (ignores labels)
- 0.5: Balanced (default)
- 1.0: Pure supervised embedding (only considers labels)

### Transform Parameters

#### transform_queue_size (float, default: 4.0)
Size of the nearest neighbor search queue for transform operations. Larger values improve transform accuracy but increase memory usage and computation time.

#### transform_seed (int, default: 42)
Random seed for transform operations. Ensures reproducibility of transform results.

#### transform_mode (str, default: 'embedding')
Method for transforming new data:
- `'embedding'`: Standard approach (default)
- `'graph'`: Use nearest neighbor graph

### Performance Parameters

#### low_memory (bool, default: True)
Whether to use a memory-efficient implementation. Set to False only if memory is not a constraint and you want faster performance.

#### verbose (bool, default: False)
Whether to print progress messages during fitting.

#### unique (bool, default: False)
Whether to consider only unique data points. Set to True if you know your data contains many duplicates to improve performance.

#### force_approximation_algorithm (bool, default: False)
Force use of approximate nearest neighbor search even for small datasets. Can improve performance on large datasets.

#### angular_rp_forest (bool, default: False)
Whether to use angular random projection forest for nearest neighbor search. Can improve performance for normalized data in high dimensions.

### DensMAP Parameters

DensMAP is a variant that preserves local density information.

#### densmap (bool, default: False)
Whether to use the DensMAP algorithm instead of standard UMAP. Preserves local density in addition to topological structure.

#### dens_lambda (float, default: 2.0)
Weight of density preservation term in DensMAP optimization. Higher values emphasize density preservation.

#### dens_frac (float, default: 0.3)
Fraction of dataset used for density estimation in DensMAP.

#### dens_var_shift (float, default: 0.1)
Regularization parameter for density estimation in DensMAP.

#### output_dens (bool, default: False)
Whether to output local density estimates in addition to the embedding. Results stored in `rad_orig_` and `rad_emb_` attributes.

### Other Parameters

#### a (float, default: None)
Parameter controlling embedding. If None, determined automatically from min_dist and spread.

#### b (float, default: None)
Parameter controlling embedding. If None, determined automatically from min_dist and spread.

#### random_state (int, RandomState instance, or None, default: None)
Random state for reproducibility. Set to an integer for reproducible results.

#### metric_kwds (dict, default: None)
Additional keyword arguments for the distance metric.

#### disconnection_distance (float, default: None)
Distance threshold for considering points disconnected. If None, uses max distance in the graph.

#### precomputed_knn (tuple, default: (None, None, None))
Precomputed k-nearest neighbors as (knn_indices, knn_dists, knn_search_index). Useful for reusing expensive computations.

## Methods

### fit(X, y=None)
Fit the UMAP model to the data.

**Parameters:**
- `X`: array-like, shape (n_samples, n_features) - Training data
- `y`: array-like, shape (n_samples,), optional - Target values for supervised dimension reduction

**Returns:**
- `self`: Fitted UMAP object

**Attributes set:**
- `embedding_`: The embedded representation of training data
- `graph_`: Fuzzy simplicial set approximation to the manifold
- `_raw_data`: Copy of the training data
- `_small_data`: Whether the dataset is considered small
- `_metric_kwds`: Processed metric keyword arguments
- `_n_neighbors`: Actual n_neighbors used
- `_initial_alpha`: Initial learning rate
- `_a`, `_b`: Curve parameters

### fit_transform(X, y=None)
Fit the model and return the embedded representation.

**Parameters:**
- `X`: array-like, shape (n_samples, n_features) - Training data
- `y`: array-like, shape (n_samples,), optional - Target values for supervised dimension reduction

**Returns:**
- `X_new`: array, shape (n_samples, n_components) - Embedded data

### transform(X)
Transform new data into the existing embedded space.

**Parameters:**
- `X`: array-like, shape (n_samples, n_features) - New data to transform

**Returns:**
- `X_new`: array, shape (n_samples, n_components) - Embedded representation of new data

**Important notes:**
- The model must be fitted before calling transform
- Transform quality depends on similarity between training and test distributions
- For significantly different data distributions, consider Parametric UMAP

### inverse_transform(X)
Transform data from the embedded space back to the original data space.

**Parameters:**
- `X`: array-like, shape (n_samples, n_components) - Embedded data points

**Returns:**
- `X_new`: array, shape (n_samples, n_features) - Reconstructed data in original space

**Important notes:**
- Computationally expensive operation
- Works poorly outside the convex hull of the training embedding
- Reconstruction quality varies by region

### update(X)
Update the model with new data. Allows incremental fitting.

**Parameters:**
- `X`: array-like, shape (n_samples, n_features) - New data to incorporate

**Returns:**
- `self`: Updated UMAP object

**Note:** Experimental feature, may not preserve all properties of batch training.

## Attributes

### embedding_
array, shape (n_samples, n_components) - The embedded representation of the training data.

### graph_
scipy.sparse.csr_matrix - The weighted adjacency matrix of the fuzzy simplicial set approximation to the manifold.

### _raw_data
array - Copy of the raw training data.

### _sparse_data
bool - Whether the training data was sparse.

### _small_data
bool - Whether the dataset was considered small (uses different algorithm for small datasets).

### _input_hash
str - Hash of the input data for caching purposes.

### _knn_indices
array - Indices of k-nearest neighbors for each training point.

### _knn_dists
array - Distances to k-nearest neighbors for each training point.

### _rp_forest
list - Random projection forest used for approximate nearest neighbor search.

## ParametricUMAP Class

`umap.ParametricUMAP(encoder=None, decoder=None, parametric_reconstruction=False, autoencoder_loss=False, reconstruction_validation=None, dims=None, batch_size=None, n_training_epochs=1, loss_report_frequency=10, optimizer=None, keras_fit_kwargs={}, **kwargs)`

Parametric UMAP using neural networks to learn the embedding function.

### Additional Parameters (beyond UMAP)

#### encoder (tensorflow.keras.Model, default: None)
Keras model for encoding data to embeddings. If None, uses default 3-layer architecture with 100 neurons per layer.

#### decoder (tensorflow.keras.Model, default: None)
Keras model for decoding embeddings back to data space. Only used if parametric_reconstruction=True.

#### parametric_reconstruction (bool, default: False)
Whether to use parametric reconstruction. Requires decoder model.

#### autoencoder_loss (bool, default: False)
Whether to include reconstruction loss in the optimization. Requires decoder model.

#### reconstruction_validation (tuple, default: None)
Validation data (X_val, y_val) for monitoring reconstruction loss during training.

#### dims (tuple, default: None)
Input dimensions for the encoder network. Required if providing custom encoder.

#### batch_size (int, default: None)
Batch size for neural network training. If None, determined automatically.

#### n_training_epochs (int, default: 1)
Number of training epochs for the neural networks. More epochs improve quality but increase training time.

#### loss_report_frequency (int, default: 10)
How often to report loss during training.

#### optimizer (tensorflow.keras.optimizers.Optimizer, default: None)
Keras optimizer for training. If None, uses Adam with learning_rate parameter.

#### keras_fit_kwargs (dict, default: {})
Additional keyword arguments passed to the Keras fit() method.

### Methods

Same as UMAP class, but transform() and inverse_transform() use learned neural networks for faster inference.

## Utility Functions

### umap.nearest_neighbors(X, n_neighbors, metric, metric_kwds={}, angular=False, random_state=None)
Compute k-nearest neighbors for the data.

**Returns:** (knn_indices, knn_dists, rp_forest)

### umap.fuzzy_simplicial_set(X, n_neighbors, random_state, metric, metric_kwds={}, knn_indices=None, knn_dists=None, angular=False, set_op_mix_ratio=1.0, local_connectivity=1.0, apply_set_operations=True, verbose=False, return_dists=None)
Construct fuzzy simplicial set representation of the data.

**Returns:** Fuzzy simplicial set as sparse matrix

### umap.simplicial_set_embedding(data, graph, n_components, initial_alpha, a, b, gamma, negative_sample_rate, n_epochs, init, random_state, metric, metric_kwds, densmap, densmap_kwds, output_dens, output_metric, output_metric_kwds, euclidean_output, parallel=False, verbose=False)
Perform the optimization to find a low-dimensional embedding.

**Returns:** Embedding array

### umap.find_ab_params(spread, min_dist)
Fit a, b params for the UMAP curve from spread and min_dist.

**Returns:** (a, b) tuple

## AlignedUMAP Class

`umap.AlignedUMAP(n_neighbors=15, n_components=2, metric='euclidean', alignment_regularisation=1e-2, alignment_window_size=3, **kwargs)`

UMAP variant for aligning multiple related datasets.

### Additional Parameters

#### alignment_regularisation (float, default: 1e-2)
Strength of alignment regularization between datasets.

#### alignment_window_size (int, default: 3)
Number of adjacent datasets to align.

### Methods

#### fit(X)
Fit model to multiple datasets.

**Parameters:**
- `X`: list of arrays - List of datasets to align

**Returns:**
- `self`: Fitted model

### Attributes

#### embeddings_
list of arrays - List of aligned embeddings, one per input dataset.

## Usage Examples

### Basic Usage with All Common Parameters

```python
import umap

# Standard 2D visualization embedding
reducer = umap.UMAP(
    n_neighbors=15,          # Balance local/global structure
    n_components=2,          # Output dimensions
    metric='euclidean',      # Distance metric
    min_dist=0.1,           # Minimum distance between points
    spread=1.0,             # Scale of embedded points
    random_state=42,        # Reproducibility
    n_epochs=200,           # Training iterations (None = auto)
    learning_rate=1.0,      # SGD learning rate
    init='spectral',        # Initialization method
    low_memory=True,        # Memory-efficient mode
    verbose=True            # Print progress
)

embedding = reducer.fit_transform(data)
```

### Supervised Learning

```python
# Train with labels for class separation
reducer = umap.UMAP(
    n_neighbors=15,
    target_weight=0.5,           # Balance data structure vs labels
    target_metric='categorical',  # Metric for labels
    random_state=42
)

embedding = reducer.fit_transform(data, y=labels)
```

### Clustering Preprocessing

```python
# Optimized for clustering
reducer = umap.UMAP(
    n_neighbors=30,      # More global structure
    min_dist=0.0,        # Allow tight packing
    n_components=10,     # Higher dimensions for density
    metric='euclidean',
    random_state=42
)

embedding = reducer.fit_transform(data)
```

### Custom Distance Metric

```python
from numba import njit

@njit()
def custom_distance(x, y):
    """Custom distance function (must be Numba-compatible)"""
    result = 0.0
    for i in range(x.shape[0]):
        result += abs(x[i] - y[i])
    return result

reducer = umap.UMAP(metric=custom_distance)
embedding = reducer.fit_transform(data)
```

### Parametric UMAP with Custom Architecture

```python
import tensorflow as tf
from umap.parametric_umap import ParametricUMAP

# Define custom encoder
encoder = tf.keras.Sequential([
    tf.keras.layers.InputLayer(input_shape=(input_dim,)),
    tf.keras.layers.Dense(256, activation='relu'),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(2)  # Output dimension
])

# Define decoder for reconstruction
decoder = tf.keras.Sequential([
    tf.keras.layers.InputLayer(input_shape=(2,)),
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dense(256, activation='relu'),
    tf.keras.layers.Dense(input_dim)
])

# Train parametric UMAP with autoencoder
embedder = ParametricUMAP(
    encoder=encoder,
    decoder=decoder,
    dims=(input_dim,),
    parametric_reconstruction=True,
    autoencoder_loss=True,
    n_training_epochs=10,
    batch_size=128,
    n_neighbors=15,
    min_dist=0.1,
    random_state=42
)

embedding = embedder.fit_transform(data)
new_embedding = embedder.transform(new_data)
reconstructed = embedder.inverse_transform(embedding)
```

### DensMAP for Density Preservation

```python
# Preserve local density information
reducer = umap.UMAP(
    densmap=True,           # Enable DensMAP
    dens_lambda=2.0,       # Weight of density preservation
    dens_frac=0.3,         # Fraction for density estimation
    output_dens=True,      # Output density estimates
    n_neighbors=15,
    min_dist=0.1,
    random_state=42
)

embedding = reducer.fit_transform(data)

# Access density estimates
original_density = reducer.rad_orig_  # Density in original space
embedded_density = reducer.rad_emb_   # Density in embedded space
```

### Aligned UMAP for Time Series

```python
from umap import AlignedUMAP

# Multiple related datasets (e.g., different time points)
datasets = [day1_data, day2_data, day3_data, day4_data]

# Align embeddings
mapper = AlignedUMAP(
    n_neighbors=15,
    alignment_regularisation=1e-2,  # Alignment strength
    alignment_window_size=2,        # Align with adjacent datasets
    n_components=2,
    random_state=42
)

mapper.fit(datasets)

# Access aligned embeddings
aligned_embeddings = mapper.embeddings_
# aligned_embeddings[0] is day1 embedding
# aligned_embeddings[1] is day2 embedding, etc.
```
