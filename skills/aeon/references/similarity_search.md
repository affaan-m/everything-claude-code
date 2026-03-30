# Similarity Search

Aeon provides tools for finding similar patterns within and across time series, including subsequence search, motif discovery, and approximate nearest neighbors.

## Subsequence Nearest Neighbors (SNN)

Find most similar subsequences within a time series.

### MASS Algorithm
- `MassSNN` - Mueen's Algorithm for Similarity Search
  - Fast normalized cross-correlation for similarity
  - Computes distance profile efficiently
  - **Use when**: Need exact nearest neighbor distances, large series

### STOMP-Based Motif Discovery
- `StompMotif` - Discovers recurring patterns (motifs)
  - Finds top-k most similar subsequence pairs
  - Based on matrix profile computation
  - **Use when**: Want to discover repeated patterns

### Brute Force Baseline
- `DummySNN` - Exhaustive distance computation
  - Computes all pairwise distances
  - **Use when**: Small series, need exact baseline

## Collection-Level Search

Find similar time series across collections.

### Approximate Nearest Neighbors (ANN)
- `RandomProjectionIndexANN` - Locality-sensitive hashing
  - Uses random projections with cosine similarity
  - Builds index for fast approximate search
  - **Use when**: Large collection, speed more important than exactness

## Quick Start: Motif Discovery

```python
from aeon.similarity_search import StompMotif
import numpy as np

# Create time series with repeated patterns
pattern = np.sin(np.linspace(0, 2*np.pi, 50))
y = np.concatenate([
    pattern + np.random.normal(0, 0.1, 50),
    np.random.normal(0, 1, 100),
    pattern + np.random.normal(0, 0.1, 50),
    np.random.normal(0, 1, 100)
])

# Find top-3 motifs
motif_finder = StompMotif(window_size=50, k=3)
motifs = motif_finder.fit_predict(y)

# motifs contains indices of motif occurrences
for i, (idx1, idx2) in enumerate(motifs):
    print(f"Motif {i+1} at positions {idx1} and {idx2}")
```

## Quick Start: Subsequence Search

```python
from aeon.similarity_search import MassSNN
import numpy as np

# Time series to search within
y = np.sin(np.linspace(0, 20, 500))

# Query subsequence
query = np.sin(np.linspace(0, 2, 50))

# Find nearest subsequences
searcher = MassSNN()
distances = searcher.fit_transform(y, query)

# Find best match
best_match_idx = np.argmin(distances)
print(f"Best match at index {best_match_idx}")
```

## Quick Start: Approximate NN on Collections

```python
from aeon.similarity_search import RandomProjectionIndexANN
from aeon.datasets import load_classification

# Load time series collection
X_train, _ = load_classification("GunPoint", split="train")

# Build index
ann = RandomProjectionIndexANN(n_projections=8, n_bits=4)
ann.fit(X_train)

# Find approximate nearest neighbors
query = X_train[0]
neighbors, distances = ann.kneighbors(query, k=5)
```

## Matrix Profile

The matrix profile is a fundamental data structure for many similarity search tasks:

- **Distance Profile**: Distances from a query to all subsequences
- **Matrix Profile**: Minimum distance for each subsequence to any other
- **Motif**: Pair of subsequences with minimum distance
- **Discord**: Subsequence with maximum minimum distance (anomaly)

```python
from aeon.similarity_search import StompMotif

# Compute matrix profile and find motifs/discords
mp = StompMotif(window_size=50)
mp.fit(y)

# Access matrix profile
profile = mp.matrix_profile_
profile_indices = mp.matrix_profile_index_

# Find discords (anomalies)
discord_idx = np.argmax(profile)
```

## Algorithm Selection

- **Exact subsequence search**: MassSNN
- **Motif discovery**: StompMotif
- **Anomaly detection**: Matrix profile (see anomaly_detection.md)
- **Fast approximate search**: RandomProjectionIndexANN
- **Small data**: DummySNN for exact results

## Use Cases

### Pattern Matching
Find where a pattern occurs in a long series:

```python
# Find heartbeat pattern in ECG data
searcher = MassSNN()
distances = searcher.fit_transform(ecg_data, heartbeat_pattern)
occurrences = np.where(distances < threshold)[0]
```

### Motif Discovery
Identify recurring patterns:

```python
# Find repeated behavioral patterns
motif_finder = StompMotif(window_size=100, k=5)
motifs = motif_finder.fit_predict(activity_data)
```

### Time Series Retrieval
Find similar time series in database:

```python
# Build searchable index
ann = RandomProjectionIndexANN()
ann.fit(time_series_database)

# Query for similar series
neighbors = ann.kneighbors(query_series, k=10)
```

## Best Practices

1. **Window size**: Critical parameter for subsequence methods
   - Too small: Captures noise
   - Too large: Misses fine-grained patterns
   - Rule of thumb: 10-20% of series length

2. **Normalization**: Most methods assume z-normalized subsequences
   - Handles amplitude variations
   - Focus on shape similarity

3. **Distance metrics**: Different metrics for different needs
   - Euclidean: Fast, shape-based
   - DTW: Handles temporal warping
   - Cosine: Scale-invariant

4. **Exclusion zone**: For motif discovery, exclude trivial matches
   - Typically set to 0.5-1.0 × window_size
   - Prevents finding overlapping occurrences

5. **Performance**:
   - MASS is O(n log n) vs O(n²) brute force
   - ANN trades accuracy for speed
   - GPU acceleration available for some methods
