# Time Series Segmentation

Aeon provides algorithms to partition time series into regions with distinct characteristics, identifying change points and boundaries.

## Segmentation Algorithms

### Binary Segmentation
- `BinSegmenter` - Recursive binary segmentation
  - Iteratively splits series at most significant change points
  - Parameters: `n_segments`, `cost_function`
  - **Use when**: Known number of segments, hierarchical structure

### Classification-Based
- `ClaSPSegmenter` - Classification Score Profile
  - Uses classification performance to identify boundaries
  - Discovers segments where classification distinguishes neighbors
  - **Use when**: Segments have different temporal patterns

### Fast Pattern-Based
- `FLUSSSegmenter` - Fast Low-cost Unipotent Semantic Segmentation
  - Efficient semantic segmentation using arc crossings
  - Based on matrix profile
  - **Use when**: Large time series, need speed and pattern discovery

### Information Theory
- `InformationGainSegmenter` - Information gain maximization
  - Finds boundaries maximizing information gain
  - **Use when**: Statistical differences between segments

### Gaussian Modeling
- `GreedyGaussianSegmenter` - Greedy Gaussian approximation
  - Models segments as Gaussian distributions
  - Incrementally adds change points
  - **Use when**: Segments follow Gaussian distributions

### Hierarchical Agglomerative
- `EAggloSegmenter` - Bottom-up merging approach
  - Estimates change points via agglomeration
  - **Use when**: Want hierarchical segmentation structure

### Hidden Markov Models
- `HMMSegmenter` - HMM with Viterbi decoding
  - Probabilistic state-based segmentation
  - **Use when**: Segments represent hidden states

### Dimensionality-Based
- `HidalgoSegmenter` - Heterogeneous Intrinsic Dimensionality Algorithm
  - Detects changes in local dimensionality
  - **Use when**: Dimensionality shifts between segments

### Baseline
- `RandomSegmenter` - Random change point generation
  - **Use when**: Need null hypothesis baseline

## Quick Start

```python
from aeon.segmentation import ClaSPSegmenter
import numpy as np

# Create time series with regime changes
y = np.concatenate([
    np.sin(np.linspace(0, 10, 100)),      # Segment 1
    np.cos(np.linspace(0, 10, 100)),      # Segment 2
    np.sin(2 * np.linspace(0, 10, 100))   # Segment 3
])

# Segment the series
segmenter = ClaSPSegmenter()
change_points = segmenter.fit_predict(y)

print(f"Detected change points: {change_points}")
```

## Output Format

Segmenters return change point indices:

```python
# change_points = [100, 200]  # Boundaries between segments
# This divides series into: [0:100], [100:200], [200:end]
```

## Algorithm Selection

- **Speed priority**: FLUSSSegmenter, BinSegmenter
- **Accuracy priority**: ClaSPSegmenter, HMMSegmenter
- **Known segment count**: BinSegmenter with n_segments parameter
- **Unknown segment count**: ClaSPSegmenter, InformationGainSegmenter
- **Pattern changes**: FLUSSSegmenter, ClaSPSegmenter
- **Statistical changes**: InformationGainSegmenter, GreedyGaussianSegmenter
- **State transitions**: HMMSegmenter

## Common Use Cases

### Regime Change Detection
Identify when time series behavior fundamentally changes:

```python
from aeon.segmentation import InformationGainSegmenter

segmenter = InformationGainSegmenter(k=3)  # Up to 3 change points
change_points = segmenter.fit_predict(stock_prices)
```

### Activity Segmentation
Segment sensor data into activities:

```python
from aeon.segmentation import ClaSPSegmenter

segmenter = ClaSPSegmenter()
boundaries = segmenter.fit_predict(accelerometer_data)
```

### Seasonal Boundary Detection
Find season transitions in time series:

```python
from aeon.segmentation import HMMSegmenter

segmenter = HMMSegmenter(n_states=4)  # 4 seasons
segments = segmenter.fit_predict(temperature_data)
```

## Evaluation Metrics

Use segmentation quality metrics:

```python
from aeon.benchmarking.metrics.segmentation import (
    count_error,
    hausdorff_error
)

# Count error: difference in number of change points
count_err = count_error(y_true, y_pred)

# Hausdorff: maximum distance between predicted and true points
hausdorff_err = hausdorff_error(y_true, y_pred)
```

## Best Practices

1. **Normalize data**: Ensures change detection not dominated by scale
2. **Choose appropriate metric**: Different algorithms optimize different criteria
3. **Validate segments**: Visualize to verify meaningful boundaries
4. **Handle noise**: Consider smoothing before segmentation
5. **Domain knowledge**: Use expected segment count if known
6. **Parameter tuning**: Adjust sensitivity parameters (thresholds, penalties)

## Visualization

```python
import matplotlib.pyplot as plt

plt.figure(figsize=(12, 4))
plt.plot(y, label='Time Series')
for cp in change_points:
    plt.axvline(cp, color='r', linestyle='--', label='Change Point')
plt.legend()
plt.show()
```
