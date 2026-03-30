# Anomaly Detection

Aeon provides anomaly detection methods for identifying unusual patterns in time series at both series and collection levels.

## Collection Anomaly Detectors

Detect anomalous time series within a collection:

- `ClassificationAdapter` - Adapts classifiers for anomaly detection
  - Train on normal data, flag outliers during prediction
  - **Use when**: Have labeled normal data, want classification-based approach

- `OutlierDetectionAdapter` - Wraps sklearn outlier detectors
  - Works with IsolationForest, LOF, OneClassSVM
  - **Use when**: Want to use sklearn anomaly detectors on collections

## Series Anomaly Detectors

Detect anomalous points or subsequences within a single time series.

### Distance-Based Methods

Use similarity metrics to identify anomalies:

- `CBLOF` - Cluster-Based Local Outlier Factor
  - Clusters data, identifies outliers based on cluster properties
  - **Use when**: Anomalies form sparse clusters

- `KMeansAD` - K-means based anomaly detection
  - Distance to nearest cluster center indicates anomaly
  - **Use when**: Normal patterns cluster well

- `LeftSTAMPi` - Left STAMP incremental
  - Matrix profile for online anomaly detection
  - **Use when**: Streaming data, need online detection

- `STOMP` - Scalable Time series Ordered-search Matrix Profile
  - Computes matrix profile for subsequence anomalies
  - **Use when**: Discord discovery, motif detection

- `MERLIN` - Matrix profile-based method
  - Efficient matrix profile computation
  - **Use when**: Large time series, need scalability

- `LOF` - Local Outlier Factor adapted for time series
  - Density-based outlier detection
  - **Use when**: Anomalies in low-density regions

- `ROCKAD` - ROCKET-based semi-supervised detection
  - Uses ROCKET features for anomaly identification
  - **Use when**: Have some labeled data, want feature-based approach

### Distribution-Based Methods

Analyze statistical distributions:

- `COPOD` - Copula-Based Outlier Detection
  - Models marginal and joint distributions
  - **Use when**: Multi-dimensional time series, complex dependencies

- `DWT_MLEAD` - Discrete Wavelet Transform Multi-Level Anomaly Detection
  - Decomposes series into frequency bands
  - **Use when**: Anomalies at specific frequencies

### Isolation-Based Methods

Use isolation principles:

- `IsolationForest` - Random forest-based isolation
  - Anomalies easier to isolate than normal points
  - **Use when**: High-dimensional data, no assumptions about distribution

- `OneClassSVM` - Support vector machine for novelty detection
  - Learns boundary around normal data
  - **Use when**: Well-defined normal region, need robust boundary

- `STRAY` - Streaming Robust Anomaly Detection
  - Robust to data distribution changes
  - **Use when**: Streaming data, distribution shifts

### External Library Integration

- `PyODAdapter` - Bridges PyOD library to aeon
  - Access 40+ PyOD anomaly detectors
  - **Use when**: Need specific PyOD algorithm

## Quick Start

```python
from aeon.anomaly_detection import STOMP
import numpy as np

# Create time series with anomaly
y = np.concatenate([
    np.sin(np.linspace(0, 10, 100)),
    [5.0],  # Anomaly spike
    np.sin(np.linspace(10, 20, 100))
])

# Detect anomalies
detector = STOMP(window_size=10)
anomaly_scores = detector.fit_predict(y)

# Higher scores indicate more anomalous points
threshold = np.percentile(anomaly_scores, 95)
anomalies = anomaly_scores > threshold
```

## Point vs Subsequence Anomalies

- **Point anomalies**: Single unusual values
  - Use: COPOD, DWT_MLEAD, IsolationForest

- **Subsequence anomalies** (discords): Unusual patterns
  - Use: STOMP, LeftSTAMPi, MERLIN

- **Collective anomalies**: Groups of points forming unusual pattern
  - Use: Matrix profile methods, clustering-based

## Evaluation Metrics

Specialized metrics for anomaly detection:

```python
from aeon.benchmarking.metrics.anomaly_detection import (
    range_precision,
    range_recall,
    range_f_score,
    roc_auc_score
)

# Range-based metrics account for window detection
precision = range_precision(y_true, y_pred, alpha=0.5)
recall = range_recall(y_true, y_pred, alpha=0.5)
f1 = range_f_score(y_true, y_pred, alpha=0.5)
```

## Algorithm Selection

- **Speed priority**: KMeansAD, IsolationForest
- **Accuracy priority**: STOMP, COPOD
- **Streaming data**: LeftSTAMPi, STRAY
- **Discord discovery**: STOMP, MERLIN
- **Multi-dimensional**: COPOD, PyODAdapter
- **Semi-supervised**: ROCKAD, OneClassSVM
- **No training data**: IsolationForest, STOMP

## Best Practices

1. **Normalize data**: Many methods sensitive to scale
2. **Choose window size**: For matrix profile methods, window size critical
3. **Set threshold**: Use percentile-based or domain-specific thresholds
4. **Validate results**: Visualize detections to verify meaningfulness
5. **Handle seasonality**: Detrend/deseasonalize before detection
