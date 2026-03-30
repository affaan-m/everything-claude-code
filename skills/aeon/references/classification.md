# Time Series Classification

Aeon provides 13 categories of time series classifiers with scikit-learn compatible APIs.

## Convolution-Based Classifiers

Apply random convolutional transformations for efficient feature extraction:

- `Arsenal` - Ensemble of ROCKET classifiers with varied kernels
- `HydraClassifier` - Multi-resolution convolution with dilation
- `RocketClassifier` - Random convolution kernels with ridge regression
- `MiniRocketClassifier` - Simplified ROCKET variant for speed
- `MultiRocketClassifier` - Combines multiple ROCKET variants

**Use when**: Need fast, scalable classification with strong performance across diverse datasets.

## Deep Learning Classifiers

Neural network architectures optimized for temporal sequences:

- `FCNClassifier` - Fully convolutional network
- `ResNetClassifier` - Residual networks with skip connections
- `InceptionTimeClassifier` - Multi-scale inception modules
- `TimeCNNClassifier` - Standard CNN for time series
- `MLPClassifier` - Multi-layer perceptron baseline
- `EncoderClassifier` - Generic encoder wrapper
- `DisjointCNNClassifier` - Shapelet-focused architecture

**Use when**: Large datasets available, need end-to-end learning, or complex temporal patterns.

## Dictionary-Based Classifiers

Transform time series into symbolic representations:

- `BOSSEnsemble` - Bag-of-SFA-Symbols with ensemble voting
- `TemporalDictionaryEnsemble` - Multiple dictionary methods combined
- `WEASEL` - Word ExtrAction for time SEries cLassification
- `MrSEQLClassifier` - Multiple symbolic sequence learning

**Use when**: Need interpretable models, sparse patterns, or symbolic reasoning.

## Distance-Based Classifiers

Leverage specialized time series distance metrics:

- `KNeighborsTimeSeriesClassifier` - k-NN with temporal distances (DTW, LCSS, ERP, etc.)
- `ElasticEnsemble` - Combines multiple elastic distance measures
- `ProximityForest` - Tree ensemble using distance-based splits

**Use when**: Small datasets, need similarity-based classification, or interpretable decisions.

## Feature-Based Classifiers

Extract statistical and signature features before classification:

- `Catch22Classifier` - 22 canonical time-series characteristics
- `TSFreshClassifier` - Automated feature extraction via tsfresh
- `SignatureClassifier` - Path signature transformations
- `SummaryClassifier` - Summary statistics extraction
- `FreshPRINCEClassifier` - Combines multiple feature extractors

**Use when**: Need interpretable features, domain expertise available, or feature engineering approach.

## Interval-Based Classifiers

Extract features from random or supervised intervals:

- `CanonicalIntervalForestClassifier` - Random interval features with decision trees
- `DrCIFClassifier` - Diverse Representation CIF with catch22 features
- `TimeSeriesForestClassifier` - Random intervals with summary statistics
- `RandomIntervalClassifier` - Simple interval-based approach
- `RandomIntervalSpectralEnsembleClassifier` - Spectral features from intervals
- `SupervisedTimeSeriesForest` - Supervised interval selection

**Use when**: Discriminative patterns occur in specific time windows.

## Shapelet-Based Classifiers

Identify discriminative subsequences (shapelets):

- `ShapeletTransformClassifier` - Discovers and uses discriminative shapelets
- `LearningShapeletClassifier` - Learns shapelets via gradient descent
- `SASTClassifier` - Scalable approximate shapelet transform
- `RDSTClassifier` - Random dilated shapelet transform

**Use when**: Need interpretable discriminative patterns or phase-invariant features.

## Hybrid Classifiers

Combine multiple classification paradigms:

- `HIVECOTEV1` - Hierarchical Vote Collective of Transformation-based Ensembles (version 1)
- `HIVECOTEV2` - Enhanced version with updated components

**Use when**: Maximum accuracy required, computational resources available.

## Early Classification

Make predictions before observing entire time series:

- `TEASER` - Two-tier Early and Accurate Series Classifier
- `ProbabilityThresholdEarlyClassifier` - Prediction when confidence exceeds threshold

**Use when**: Real-time decisions needed, or observations have cost.

## Ordinal Classification

Handle ordered class labels:

- `OrdinalTDE` - Temporal dictionary ensemble for ordinal outputs

**Use when**: Classes have natural ordering (e.g., severity levels).

## Composition Tools

Build custom pipelines and ensembles:

- `ClassifierPipeline` - Chain transformers with classifiers
- `WeightedEnsembleClassifier` - Weighted combination of classifiers
- `SklearnClassifierWrapper` - Adapt sklearn classifiers for time series

## Quick Start

```python
from aeon.classification.convolution_based import RocketClassifier
from aeon.datasets import load_classification

# Load data
X_train, y_train = load_classification("GunPoint", split="train")
X_test, y_test = load_classification("GunPoint", split="test")

# Train and predict
clf = RocketClassifier()
clf.fit(X_train, y_train)
accuracy = clf.score(X_test, y_test)
```

## Algorithm Selection

- **Speed priority**: MiniRocketClassifier, Arsenal
- **Accuracy priority**: HIVECOTEV2, InceptionTimeClassifier
- **Interpretability**: ShapeletTransformClassifier, Catch22Classifier
- **Small data**: KNeighborsTimeSeriesClassifier, Distance-based methods
- **Large data**: Deep learning classifiers, ROCKET variants
