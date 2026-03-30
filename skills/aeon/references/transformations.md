# Transformations

Aeon provides extensive transformation capabilities for preprocessing, feature extraction, and representation learning from time series data.

## Transformation Types

Aeon distinguishes between:
- **CollectionTransformers**: Transform multiple time series (collections)
- **SeriesTransformers**: Transform individual time series

## Collection Transformers

### Convolution-Based Feature Extraction

Fast, scalable feature generation using random kernels:

- `RocketTransformer` - Random convolutional kernels
- `MiniRocketTransformer` - Simplified ROCKET for speed
- `MultiRocketTransformer` - Enhanced ROCKET variant
- `HydraTransformer` - Multi-resolution dilated convolutions
- `MultiRocketHydraTransformer` - Combines ROCKET and Hydra
- `ROCKETGPU` - GPU-accelerated variant

**Use when**: Need fast, scalable features for any ML algorithm, strong baseline performance.

### Statistical Feature Extraction

Domain-agnostic features based on time series characteristics:

- `Catch22` - 22 canonical time-series characteristics
- `TSFresh` - Comprehensive automated feature extraction (100+ features)
- `TSFreshRelevant` - Feature extraction with relevance filtering
- `SevenNumberSummary` - Descriptive statistics (mean, std, quantiles)

**Use when**: Need interpretable features, domain-agnostic approach, or feeding traditional ML.

### Dictionary-Based Representations

Symbolic approximations for discrete representations:

- `SAX` - Symbolic Aggregate approXimation
- `PAA` - Piecewise Aggregate Approximation
- `SFA` - Symbolic Fourier Approximation
- `SFAFast` - Optimized SFA
- `SFAWhole` - SFA on entire series (no windowing)
- `BORF` - Bag-of-Receptive-Fields

**Use when**: Need discrete/symbolic representation, dimensionality reduction, interpretability.

### Shapelet-Based Features

Discriminative subsequence extraction:

- `RandomShapeletTransform` - Random discriminative shapelets
- `RandomDilatedShapeletTransform` - Dilated shapelets for multi-scale
- `SAST` - Scalable And Accurate Subsequence Transform
- `RSAST` - Randomized SAST

**Use when**: Need interpretable discriminative patterns, phase-invariant features.

### Interval-Based Features

Statistical summaries from time intervals:

- `RandomIntervals` - Features from random intervals
- `SupervisedIntervals` - Supervised interval selection
- `QUANTTransformer` - Quantile-based interval features

**Use when**: Predictive patterns localized to specific windows.

### Preprocessing Transformations

Data preparation and normalization:

- `MinMaxScaler` - Scale to [0, 1] range
- `Normalizer` - Z-normalization (zero mean, unit variance)
- `Centerer` - Center to zero mean
- `SimpleImputer` - Fill missing values
- `DownsampleTransformer` - Reduce temporal resolution
- `Tabularizer` - Convert time series to tabular format

**Use when**: Need standardization, missing value handling, format conversion.

### Specialized Transformations

Advanced analysis methods:

- `MatrixProfile` - Computes distance profiles for pattern discovery
- `DWTTransformer` - Discrete Wavelet Transform
- `AutocorrelationFunctionTransformer` - ACF computation
- `Dobin` - Distance-based Outlier BasIs using Neighbors
- `SignatureTransformer` - Path signature methods
- `PLATransformer` - Piecewise Linear Approximation

### Class Imbalance Handling

- `ADASYN` - Adaptive Synthetic Sampling
- `SMOTE` - Synthetic Minority Over-sampling
- `OHIT` - Over-sampling with Highly Imbalanced Time series

**Use when**: Classification with imbalanced classes.

### Pipeline Composition

- `CollectionTransformerPipeline` - Chain multiple transformers

## Series Transformers

Transform individual time series (e.g., for preprocessing in forecasting).

### Statistical Analysis

- `AutoCorrelationSeriesTransformer` - Autocorrelation
- `StatsModelsACF` - ACF using statsmodels
- `StatsModelsPACF` - Partial autocorrelation

### Smoothing and Filtering

- `ExponentialSmoothing` - Exponentially weighted moving average
- `MovingAverage` - Simple or weighted moving average
- `SavitzkyGolayFilter` - Polynomial smoothing
- `GaussianFilter` - Gaussian kernel smoothing
- `BKFilter` - Baxter-King bandpass filter
- `DiscreteFourierApproximation` - Fourier-based filtering

**Use when**: Need noise reduction, trend extraction, or frequency filtering.

### Dimensionality Reduction

- `PCASeriesTransformer` - Principal component analysis
- `PlASeriesTransformer` - Piecewise Linear Approximation

### Transformations

- `BoxCoxTransformer` - Variance stabilization
- `LogTransformer` - Logarithmic scaling
- `ClaSPTransformer` - Classification Score Profile

### Pipeline Composition

- `SeriesTransformerPipeline` - Chain series transformers

## Quick Start: Feature Extraction

```python
from aeon.transformations.collection.convolution_based import RocketTransformer
from aeon.classification.sklearn import RotationForest
from aeon.datasets import load_classification

# Load data
X_train, y_train = load_classification("GunPoint", split="train")
X_test, y_test = load_classification("GunPoint", split="test")

# Extract ROCKET features
rocket = RocketTransformer()
X_train_features = rocket.fit_transform(X_train)
X_test_features = rocket.transform(X_test)

# Use with any sklearn classifier
clf = RotationForest()
clf.fit(X_train_features, y_train)
accuracy = clf.score(X_test_features, y_test)
```

## Quick Start: Preprocessing Pipeline

```python
from aeon.transformations.collection import (
    MinMaxScaler,
    SimpleImputer,
    CollectionTransformerPipeline
)

# Build preprocessing pipeline
pipeline = CollectionTransformerPipeline([
    ('imputer', SimpleImputer(strategy='mean')),
    ('scaler', MinMaxScaler())
])

X_transformed = pipeline.fit_transform(X_train)
```

## Quick Start: Series Smoothing

```python
from aeon.transformations.series import MovingAverage

# Smooth individual time series
smoother = MovingAverage(window_size=5)
y_smoothed = smoother.fit_transform(y)
```

## Algorithm Selection

### For Feature Extraction:
- **Speed + Performance**: MiniRocketTransformer
- **Interpretability**: Catch22, TSFresh
- **Dimensionality reduction**: PAA, SAX, PCA
- **Discriminative patterns**: Shapelet transforms
- **Comprehensive features**: TSFresh (with longer runtime)

### For Preprocessing:
- **Normalization**: Normalizer, MinMaxScaler
- **Smoothing**: MovingAverage, SavitzkyGolayFilter
- **Missing values**: SimpleImputer
- **Frequency analysis**: DWTTransformer, Fourier methods

### For Symbolic Representation:
- **Fast approximation**: PAA
- **Alphabet-based**: SAX
- **Frequency-based**: SFA, SFAFast

## Best Practices

1. **Fit on training data only**: Avoid data leakage
   ```python
   transformer.fit(X_train)
   X_train_tf = transformer.transform(X_train)
   X_test_tf = transformer.transform(X_test)
   ```

2. **Pipeline composition**: Chain transformers for complex workflows
   ```python
   pipeline = CollectionTransformerPipeline([
       ('imputer', SimpleImputer()),
       ('scaler', Normalizer()),
       ('features', RocketTransformer())
   ])
   ```

3. **Feature selection**: TSFresh can generate many features; consider selection
   ```python
   from sklearn.feature_selection import SelectKBest
   selector = SelectKBest(k=100)
   X_selected = selector.fit_transform(X_features, y)
   ```

4. **Memory considerations**: Some transformers memory-intensive on large datasets
   - Use MiniRocket instead of ROCKET for speed
   - Consider downsampling for very long series
   - Use ROCKETGPU for GPU acceleration

5. **Domain knowledge**: Choose transformations matching domain:
   - Periodic data: Fourier-based methods
   - Noisy data: Smoothing filters
   - Spike detection: Wavelet transforms
