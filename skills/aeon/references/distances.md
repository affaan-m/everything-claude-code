# Distance Metrics

Aeon provides specialized distance functions for measuring similarity between time series, compatible with both aeon and scikit-learn estimators.

## Distance Categories

### Elastic Distances

Allow flexible temporal alignment between series:

**Dynamic Time Warping Family:**
- `dtw` - Classic Dynamic Time Warping
- `ddtw` - Derivative DTW (compares derivatives)
- `wdtw` - Weighted DTW (penalizes warping by location)
- `wddtw` - Weighted Derivative DTW
- `shape_dtw` - Shape-based DTW

**Edit-Based:**
- `erp` - Edit distance with Real Penalty
- `edr` - Edit Distance on Real sequences
- `lcss` - Longest Common SubSequence
- `twe` - Time Warp Edit distance

**Specialized:**
- `msm` - Move-Split-Merge distance
- `adtw` - Amerced DTW
- `sbd` - Shape-Based Distance

**Use when**: Time series may have temporal shifts, speed variations, or phase differences.

### Lock-Step Distances

Compare time series point-by-point without alignment:

- `euclidean` - Euclidean distance (L2 norm)
- `manhattan` - Manhattan distance (L1 norm)
- `minkowski` - Generalized Minkowski distance (Lp norm)
- `squared` - Squared Euclidean distance

**Use when**: Series already aligned, need computational speed, or no temporal warping expected.

## Usage Patterns

### Computing Single Distance

```python
from aeon.distances import dtw_distance

# Distance between two time series
distance = dtw_distance(x, y)

# With window constraint (Sakoe-Chiba band)
distance = dtw_distance(x, y, window=0.1)
```

### Pairwise Distance Matrix

```python
from aeon.distances import dtw_pairwise_distance

# All pairwise distances in collection
X = [series1, series2, series3, series4]
distance_matrix = dtw_pairwise_distance(X)

# Cross-collection distances
distance_matrix = dtw_pairwise_distance(X_train, X_test)
```

### Cost Matrix and Alignment Path

```python
from aeon.distances import dtw_cost_matrix, dtw_alignment_path

# Get full cost matrix
cost_matrix = dtw_cost_matrix(x, y)

# Get optimal alignment path
path = dtw_alignment_path(x, y)
# Returns indices: [(0,0), (1,1), (2,1), (2,2), ...]
```

### Using with Estimators

```python
from aeon.classification.distance_based import KNeighborsTimeSeriesClassifier

# Use DTW distance in classifier
clf = KNeighborsTimeSeriesClassifier(
    n_neighbors=5,
    distance="dtw",
    distance_params={"window": 0.2}
)
clf.fit(X_train, y_train)
```

## Distance Parameters

### Window Constraints

Limit warping path deviation (improves speed and prevents pathological warping):

```python
# Sakoe-Chiba band: window as fraction of series length
dtw_distance(x, y, window=0.1)  # Allow 10% deviation

# Itakura parallelogram: slopes constrain path
dtw_distance(x, y, itakura_max_slope=2.0)
```

### Normalization

Control whether to z-normalize series before distance computation:

```python
# Most elastic distances support normalization
distance = dtw_distance(x, y, normalize=True)
```

### Distance-Specific Parameters

```python
# ERP: penalty for gaps
distance = erp_distance(x, y, g=0.5)

# TWE: stiffness and penalty parameters
distance = twe_distance(x, y, nu=0.001, lmbda=1.0)

# LCSS: epsilon threshold for matching
distance = lcss_distance(x, y, epsilon=0.5)
```

## Algorithm Selection

### By Use Case:

**Temporal misalignment**: DTW, DDTW, WDTW
**Speed variations**: DTW with window constraint
**Shape similarity**: Shape DTW, SBD
**Edit operations**: ERP, EDR, LCSS
**Derivative matching**: DDTW
**Computational speed**: Euclidean, Manhattan
**Outlier robustness**: Manhattan, LCSS

### By Computational Cost:

**Fastest**: Euclidean (O(n))
**Fast**: Constrained DTW (O(nw) where w is window)
**Medium**: Full DTW (O(n²))
**Slower**: Complex elastic distances (ERP, TWE, MSM)

## Quick Reference Table

| Distance | Alignment | Speed | Robustness | Interpretability |
|----------|-----------|-------|------------|------------------|
| Euclidean | Lock-step | Very Fast | Low | High |
| DTW | Elastic | Medium | Medium | Medium |
| DDTW | Elastic | Medium | High | Medium |
| WDTW | Elastic | Medium | Medium | Medium |
| ERP | Edit-based | Slow | High | Low |
| LCSS | Edit-based | Slow | Very High | Low |
| Shape DTW | Elastic | Medium | Medium | High |

## Best Practices

### 1. Normalization

Most distances sensitive to scale; normalize when appropriate:

```python
from aeon.transformations.collection import Normalizer

normalizer = Normalizer()
X_normalized = normalizer.fit_transform(X)
```

### 2. Window Constraints

For DTW variants, use window constraints for speed and better generalization:

```python
# Start with 10-20% window
distance = dtw_distance(x, y, window=0.1)
```

### 3. Series Length

- Equal-length required: Most lock-step distances
- Unequal-length supported: Elastic distances (DTW, ERP, etc.)

### 4. Multivariate Series

Most distances support multivariate time series:

```python
# x.shape = (n_channels, n_timepoints)
distance = dtw_distance(x_multivariate, y_multivariate)
```

### 5. Performance Optimization

- Use numba-compiled implementations (default in aeon)
- Consider lock-step distances if alignment not needed
- Use windowed DTW instead of full DTW
- Precompute distance matrices for repeated use

### 6. Choosing the Right Distance

```python
# Quick decision tree:
if series_aligned:
    use_distance = "euclidean"
elif need_speed:
    use_distance = "dtw"  # with window constraint
elif temporal_shifts_expected:
    use_distance = "dtw" or "shape_dtw"
elif outliers_present:
    use_distance = "lcss" or "manhattan"
elif derivatives_matter:
    use_distance = "ddtw" or "wddtw"
```

## Integration with scikit-learn

Aeon distances work with sklearn estimators:

```python
from sklearn.neighbors import KNeighborsClassifier
from aeon.distances import dtw_pairwise_distance

# Precompute distance matrix
X_train_distances = dtw_pairwise_distance(X_train)

# Use with sklearn
clf = KNeighborsClassifier(metric='precomputed')
clf.fit(X_train_distances, y_train)
```

## Available Distance Functions

Get list of all available distances:

```python
from aeon.distances import get_distance_function_names

print(get_distance_function_names())
# ['dtw', 'ddtw', 'wdtw', 'euclidean', 'erp', 'edr', ...]
```

Retrieve specific distance function:

```python
from aeon.distances import get_distance_function

distance_func = get_distance_function("dtw")
result = distance_func(x, y, window=0.1)
```
