---
name: umap-learn
description: UMAP dimensionality reduction. Fast nonlinear manifold learning for 2D/3D visualization, clustering preprocessing (HDBSCAN), supervised/parametric UMAP, for high-dimensional data.
license: BSD-3-Clause license
metadata:
    skill-author: K-Dense Inc.
---

# UMAP-Learn

## Overview

UMAP (Uniform Manifold Approximation and Projection) is a dimensionality reduction technique for visualization and general non-linear dimensionality reduction. Apply this skill for fast, scalable embeddings that preserve local and global structure, supervised learning, and clustering preprocessing.

## Quick Start

### Installation

```bash
uv pip install umap-learn
```

### Basic Usage

UMAP follows scikit-learn conventions and can be used as a drop-in replacement for t-SNE or PCA.

```python
import umap
from sklearn.preprocessing import StandardScaler

# Prepare data (standardization is essential)
scaled_data = StandardScaler().fit_transform(data)

# Method 1: Single step (fit and transform)
embedding = umap.UMAP().fit_transform(scaled_data)

# Method 2: Separate steps (for reusing trained model)
reducer = umap.UMAP(random_state=42)
reducer.fit(scaled_data)
embedding = reducer.embedding_  # Access the trained embedding
```

**Critical preprocessing requirement:** Always standardize features to comparable scales before applying UMAP to ensure equal weighting across dimensions.

### Typical Workflow

```python
import umap
import matplotlib.pyplot as plt
from sklearn.preprocessing import StandardScaler

# 1. Preprocess data
scaler = StandardScaler()
scaled_data = scaler.fit_transform(raw_data)

# 2. Create and fit UMAP
reducer = umap.UMAP(
    n_neighbors=15,
    min_dist=0.1,
    n_components=2,
    metric='euclidean',
    random_state=42
)
embedding = reducer.fit_transform(scaled_data)

# 3. Visualize
plt.scatter(embedding[:, 0], embedding[:, 1], c=labels, cmap='Spectral', s=5)
plt.colorbar()
plt.title('UMAP Embedding')
plt.show()
```

## Parameter Tuning Guide

UMAP has four primary parameters that control the embedding behavior. Understanding these is crucial for effective usage.

### n_neighbors (default: 15)

**Purpose:** Balances local versus global structure in the embedding.

**How it works:** Controls the size of the local neighborhood UMAP examines when learning manifold structure.

**Effects by value:**
- **Low values (2-5):** Emphasizes fine local detail but may fragment data into disconnected components
- **Medium values (15-20):** Balanced view of both local structure and global relationships (recommended starting point)
- **High values (50-200):** Prioritizes broad topological structure at the expense of fine-grained details

**Recommendation:** Start with 15 and adjust based on results. Increase for more global structure, decrease for more local detail.

### min_dist (default: 0.1)

**Purpose:** Controls how tightly points cluster in the low-dimensional space.

**How it works:** Sets the minimum distance apart that points are allowed to be in the output representation.

**Effects by value:**
- **Low values (0.0-0.1):** Creates clumped embeddings useful for clustering; reveals fine topological details
- **High values (0.5-0.99):** Prevents tight packing; emphasizes broad topological preservation over local structure

**Recommendation:** Use 0.0 for clustering applications, 0.1-0.3 for visualization, 0.5+ for loose structure.

### n_components (default: 2)

**Purpose:** Determines the dimensionality of the embedded output space.

**Key feature:** Unlike t-SNE, UMAP scales well in the embedding dimension, enabling use beyond visualization.

**Common uses:**
- **2-3 dimensions:** Visualization
- **5-10 dimensions:** Clustering preprocessing (better preserves density than 2D)
- **10-50 dimensions:** Feature engineering for downstream ML models

**Recommendation:** Use 2 for visualization, 5-10 for clustering, higher for ML pipelines.

### metric (default: 'euclidean')

**Purpose:** Specifies how distance is calculated between input data points.

**Supported metrics:**
- **Minkowski variants:** euclidean, manhattan, chebyshev
- **Spatial metrics:** canberra, braycurtis, haversine
- **Correlation metrics:** cosine, correlation (good for text/document embeddings)
- **Binary data metrics:** hamming, jaccard, dice, russellrao, kulsinski, rogerstanimoto, sokalmichener, sokalsneath, yule
- **Custom metrics:** User-defined distance functions via Numba

**Recommendation:** Use euclidean for numeric data, cosine for text/document vectors, hamming for binary data.

### Parameter Tuning Example

```python
# For visualization with emphasis on local structure
umap.UMAP(n_neighbors=15, min_dist=0.1, n_components=2, metric='euclidean')

# For clustering preprocessing
umap.UMAP(n_neighbors=30, min_dist=0.0, n_components=10, metric='euclidean')

# For document embeddings
umap.UMAP(n_neighbors=15, min_dist=0.1, n_components=2, metric='cosine')

# For preserving global structure
umap.UMAP(n_neighbors=100, min_dist=0.5, n_components=2, metric='euclidean')
```

## Supervised and Semi-Supervised Dimension Reduction

UMAP supports incorporating label information to guide the embedding process, enabling class separation while preserving internal structure.

### Supervised UMAP

Pass target labels via the `y` parameter when fitting:

```python
# Supervised dimension reduction
embedding = umap.UMAP().fit_transform(data, y=labels)
```

**Key benefits:**
- Achieves cleanly separated classes
- Preserves internal structure within each class
- Maintains global relationships between classes

**When to use:** When you have labeled data and want to separate known classes while keeping meaningful point embeddings.

### Semi-Supervised UMAP

For partial labels, mark unlabeled points with `-1` following scikit-learn convention:

```python
# Create semi-supervised labels
semi_labels = labels.copy()
semi_labels[unlabeled_indices] = -1

# Fit with partial labels
embedding = umap.UMAP().fit_transform(data, y=semi_labels)
```

**When to use:** When labeling is expensive or you have more data than labels available.

### Metric Learning with UMAP

Train a supervised embedding on labeled data, then apply to new unlabeled data:

```python
# Train on labeled data
mapper = umap.UMAP().fit(train_data, train_labels)

# Transform unlabeled test data
test_embedding = mapper.transform(test_data)

# Use as feature engineering for downstream classifier
from sklearn.svm import SVC
clf = SVC().fit(mapper.embedding_, train_labels)
predictions = clf.predict(test_embedding)
```

**When to use:** For supervised feature engineering in machine learning pipelines.

## UMAP for Clustering

UMAP serves as effective preprocessing for density-based clustering algorithms like HDBSCAN, overcoming the curse of dimensionality.

### Best Practices for Clustering

**Key principle:** Configure UMAP differently for clustering than for visualization.

**Recommended parameters:**
- **n_neighbors:** Increase to ~30 (default 15 is too local and can create artificial fine-grained clusters)
- **min_dist:** Set to 0.0 (pack points densely within clusters for clearer boundaries)
- **n_components:** Use 5-10 dimensions (maintains performance while improving density preservation vs. 2D)

### Clustering Workflow

```python
import umap
import hdbscan
from sklearn.preprocessing import StandardScaler

# 1. Preprocess data
scaled_data = StandardScaler().fit_transform(data)

# 2. UMAP with clustering-optimized parameters
reducer = umap.UMAP(
    n_neighbors=30,
    min_dist=0.0,
    n_components=10,  # Higher than 2 for better density preservation
    metric='euclidean',
    random_state=42
)
embedding = reducer.fit_transform(scaled_data)

# 3. Apply HDBSCAN clustering
clusterer = hdbscan.HDBSCAN(
    min_cluster_size=15,
    min_samples=5,
    metric='euclidean'
)
labels = clusterer.fit_predict(embedding)

# 4. Evaluate
from sklearn.metrics import adjusted_rand_score
score = adjusted_rand_score(true_labels, labels)
print(f"Adjusted Rand Score: {score:.3f}")
print(f"Number of clusters: {len(set(labels)) - (1 if -1 in labels else 0)}")
print(f"Noise points: {sum(labels == -1)}")
```

### Visualization After Clustering

```python
# Create 2D embedding for visualization (separate from clustering)
vis_reducer = umap.UMAP(n_neighbors=15, min_dist=0.1, n_components=2, random_state=42)
vis_embedding = vis_reducer.fit_transform(scaled_data)

# Plot with cluster labels
import matplotlib.pyplot as plt
plt.scatter(vis_embedding[:, 0], vis_embedding[:, 1], c=labels, cmap='Spectral', s=5)
plt.colorbar()
plt.title('UMAP Visualization with HDBSCAN Clusters')
plt.show()
```

**Important caveat:** UMAP does not completely preserve density and can create artificial cluster divisions. Always validate and explore resulting clusters.

## Transforming New Data

UMAP enables preprocessing of new data through its `transform()` method, allowing trained models to project unseen data into the learned embedding space.

### Basic Transform Usage

```python
# Train on training data
trans = umap.UMAP(n_neighbors=15, random_state=42).fit(X_train)

# Transform test data
test_embedding = trans.transform(X_test)
```

### Integration with Machine Learning Pipelines

```python
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import umap

# Split data
X_train, X_test, y_train, y_test = train_test_split(data, labels, test_size=0.2)

# Preprocess
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train UMAP
reducer = umap.UMAP(n_components=10, random_state=42)
X_train_embedded = reducer.fit_transform(X_train_scaled)
X_test_embedded = reducer.transform(X_test_scaled)

# Train classifier on embeddings
clf = SVC()
clf.fit(X_train_embedded, y_train)
accuracy = clf.score(X_test_embedded, y_test)
print(f"Test accuracy: {accuracy:.3f}")
```

### Important Considerations

**Data consistency:** The transform method assumes the overall distribution in the higher-dimensional space is consistent between training and test data. When this assumption fails, consider using Parametric UMAP instead.

**Performance:** Transform operations are efficient (typically <1 second), though initial calls may be slower due to Numba JIT compilation.

**Scikit-learn compatibility:** UMAP follows standard sklearn conventions and works seamlessly in pipelines:

```python
from sklearn.pipeline import Pipeline

pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('umap', umap.UMAP(n_components=10)),
    ('classifier', SVC())
])

pipeline.fit(X_train, y_train)
predictions = pipeline.predict(X_test)
```

## Advanced Features

### Parametric UMAP

Parametric UMAP replaces direct embedding optimization with a learned neural network mapping function.

**Key differences from standard UMAP:**
- Uses TensorFlow/Keras to train encoder networks
- Enables efficient transformation of new data
- Supports reconstruction via decoder networks (inverse transform)
- Allows custom architectures (CNNs for images, RNNs for sequences)

**Installation:**
```bash
uv pip install umap-learn[parametric_umap]
# Requires TensorFlow 2.x
```

**Basic usage:**
```python
from umap.parametric_umap import ParametricUMAP

# Default architecture (3-layer 100-neuron fully-connected network)
embedder = ParametricUMAP()
embedding = embedder.fit_transform(data)

# Transform new data efficiently
new_embedding = embedder.transform(new_data)
```

**Custom architecture:**
```python
import tensorflow as tf

# Define custom encoder
encoder = tf.keras.Sequential([
    tf.keras.layers.InputLayer(input_shape=(input_dim,)),
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dense(64, activation='relu'),
    tf.keras.layers.Dense(2)  # Output dimension
])

embedder = ParametricUMAP(encoder=encoder, dims=(input_dim,))
embedding = embedder.fit_transform(data)
```

**When to use Parametric UMAP:**
- Need efficient transformation of new data after training
- Require reconstruction capabilities (inverse transforms)
- Want to combine UMAP with autoencoders
- Working with complex data types (images, sequences) benefiting from specialized architectures

**When to use standard UMAP:**
- Need simplicity and quick prototyping
- Dataset is small and computational efficiency isn't critical
- Don't require learned transformations for future data

### Inverse Transforms

Inverse transforms enable reconstruction of high-dimensional data from low-dimensional embeddings.

**Basic usage:**
```python
reducer = umap.UMAP()
embedding = reducer.fit_transform(data)

# Reconstruct high-dimensional data from embedding coordinates
reconstructed = reducer.inverse_transform(embedding)
```

**Important limitations:**
- Computationally expensive operation
- Works poorly outside the convex hull of the embedding
- Accuracy decreases in regions with gaps between clusters

**Use cases:**
- Understanding structure of embedded data
- Visualizing smooth transitions between clusters
- Exploring interpolations between data points
- Generating synthetic samples in embedding space

**Example: Exploring embedding space:**
```python
import numpy as np

# Create grid of points in embedding space
x = np.linspace(embedding[:, 0].min(), embedding[:, 0].max(), 10)
y = np.linspace(embedding[:, 1].min(), embedding[:, 1].max(), 10)
xx, yy = np.meshgrid(x, y)
grid_points = np.c_[xx.ravel(), yy.ravel()]

# Reconstruct samples from grid
reconstructed_samples = reducer.inverse_transform(grid_points)
```

### AlignedUMAP

For analyzing temporal or related datasets (e.g., time-series experiments, batch data):

```python
from umap import AlignedUMAP

# List of related datasets
datasets = [day1_data, day2_data, day3_data]

# Create aligned embeddings
mapper = AlignedUMAP().fit(datasets)
aligned_embeddings = mapper.embeddings_  # List of embeddings
```

**When to use:** Comparing embeddings across related datasets while maintaining consistent coordinate systems.

## Reproducibility

To ensure reproducible results, always set the `random_state` parameter:

```python
reducer = umap.UMAP(random_state=42)
```

UMAP uses stochastic optimization, so results will vary slightly between runs without a fixed random state.

## Common Issues and Solutions

**Issue:** Disconnected components or fragmented clusters
- **Solution:** Increase `n_neighbors` to emphasize more global structure

**Issue:** Clusters too spread out or not well separated
- **Solution:** Decrease `min_dist` to allow tighter packing

**Issue:** Poor clustering results
- **Solution:** Use clustering-specific parameters (n_neighbors=30, min_dist=0.0, n_components=5-10)

**Issue:** Transform results differ significantly from training
- **Solution:** Ensure test data distribution matches training, or use Parametric UMAP

**Issue:** Slow performance on large datasets
- **Solution:** Set `low_memory=True` (default), or consider dimensionality reduction with PCA first

**Issue:** All points collapsed to single cluster
- **Solution:** Check data preprocessing (ensure proper scaling), increase `min_dist`

## Resources

### references/

Contains detailed API documentation:
- `api_reference.md`: Complete UMAP class parameters and methods

Load these references when detailed parameter information or advanced method usage is needed.

