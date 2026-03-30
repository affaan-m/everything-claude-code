# Deep Learning Networks

Aeon provides neural network architectures specifically designed for time series tasks. These networks serve as building blocks for classification, regression, clustering, and forecasting.

## Core Network Architectures

### Convolutional Networks

**FCNNetwork** - Fully Convolutional Network
- Three convolutional blocks with batch normalization
- Global average pooling for dimensionality reduction
- **Use when**: Need simple yet effective CNN baseline

**ResNetNetwork** - Residual Network
- Residual blocks with skip connections
- Prevents vanishing gradients in deep networks
- **Use when**: Deep networks needed, training stability important

**InceptionNetwork** - Inception Modules
- Multi-scale feature extraction with parallel convolutions
- Different kernel sizes capture patterns at various scales
- **Use when**: Patterns exist at multiple temporal scales

**TimeCNNNetwork** - Standard CNN
- Basic convolutional architecture
- **Use when**: Simple CNN sufficient, interpretability valued

**DisjointCNNNetwork** - Separate Pathways
- Disjoint convolutional pathways
- **Use when**: Different feature extraction strategies needed

**DCNNNetwork** - Dilated CNN
- Dilated convolutions for large receptive fields
- **Use when**: Long-range dependencies without many layers

### Recurrent Networks

**RecurrentNetwork** - RNN/LSTM/GRU
- Configurable cell type (RNN, LSTM, GRU)
- Sequential modeling of temporal dependencies
- **Use when**: Sequential dependencies critical, variable-length series

### Temporal Convolutional Network

**TCNNetwork** - Temporal Convolutional Network
- Dilated causal convolutions
- Large receptive field without recurrence
- **Use when**: Long sequences, need parallelizable architecture

### Multi-Layer Perceptron

**MLPNetwork** - Basic Feedforward
- Simple fully-connected layers
- Flattens time series before processing
- **Use when**: Baseline needed, computational limits, or simple patterns

## Encoder-Based Architectures

Networks designed for representation learning and clustering.

### Autoencoder Variants

**EncoderNetwork** - Generic Encoder
- Flexible encoder structure
- **Use when**: Custom encoding needed

**AEFCNNetwork** - FCN-based Autoencoder
- Fully convolutional encoder-decoder
- **Use when**: Need convolutional representation learning

**AEResNetNetwork** - ResNet Autoencoder
- Residual blocks in encoder-decoder
- **Use when**: Deep autoencoding with skip connections

**AEDCNNNetwork** - Dilated CNN Autoencoder
- Dilated convolutions for compression
- **Use when**: Need large receptive field in autoencoder

**AEDRNNNetwork** - Dilated RNN Autoencoder
- Dilated recurrent connections
- **Use when**: Sequential patterns with long-range dependencies

**AEBiGRUNetwork** - Bidirectional GRU
- Bidirectional recurrent encoding
- **Use when**: Context from both directions helpful

**AEAttentionBiGRUNetwork** - Attention + BiGRU
- Attention mechanism on BiGRU outputs
- **Use when**: Need to focus on important time steps

## Specialized Architectures

**LITENetwork** - Lightweight Inception Time Ensemble
- Efficient inception-based architecture
- LITEMV variant for multivariate series
- **Use when**: Need efficiency with strong performance

**DeepARNetwork** - Probabilistic Forecasting
- Autoregressive RNN for forecasting
- Produces probabilistic predictions
- **Use when**: Need forecast uncertainty quantification

## Usage with Estimators

Networks are typically used within estimators, not directly:

```python
from aeon.classification.deep_learning import FCNClassifier
from aeon.regression.deep_learning import ResNetRegressor
from aeon.clustering.deep_learning import AEFCNClusterer

# Classification with FCN
clf = FCNClassifier(n_epochs=100, batch_size=16)
clf.fit(X_train, y_train)

# Regression with ResNet
reg = ResNetRegressor(n_epochs=100)
reg.fit(X_train, y_train)

# Clustering with autoencoder
clusterer = AEFCNClusterer(n_clusters=3, n_epochs=100)
labels = clusterer.fit_predict(X_train)
```

## Custom Network Configuration

Many networks accept configuration parameters:

```python
# Configure FCN layers
clf = FCNClassifier(
    n_epochs=200,
    batch_size=32,
    kernel_size=[7, 5, 3],  # Kernel sizes for each layer
    n_filters=[128, 256, 128],  # Filters per layer
    learning_rate=0.001
)
```

## Base Classes

- `BaseDeepLearningNetwork` - Abstract base for all networks
- `BaseDeepRegressor` - Base for deep regression
- `BaseDeepClassifier` - Base for deep classification
- `BaseDeepForecaster` - Base for deep forecasting

Extend these to implement custom architectures.

## Training Considerations

### Hyperparameters

Key hyperparameters to tune:

- `n_epochs` - Training iterations (50-200 typical)
- `batch_size` - Samples per batch (16-64 typical)
- `learning_rate` - Step size (0.0001-0.01)
- Network-specific: layers, filters, kernel sizes

### Callbacks

Many networks support callbacks for training monitoring:

```python
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau

clf = FCNClassifier(
    n_epochs=200,
    callbacks=[
        EarlyStopping(patience=20, restore_best_weights=True),
        ReduceLROnPlateau(patience=10, factor=0.5)
    ]
)
```

### GPU Acceleration

Deep learning networks benefit from GPU:

```python
import os
os.environ['CUDA_VISIBLE_DEVICES'] = '0'  # Use first GPU

# Networks automatically use GPU if available
clf = InceptionTimeClassifier(n_epochs=100)
clf.fit(X_train, y_train)
```

## Architecture Selection

### By Task:

**Classification**: InceptionNetwork, ResNetNetwork, FCNNetwork
**Regression**: InceptionNetwork, ResNetNetwork, TCNNetwork
**Forecasting**: TCNNetwork, DeepARNetwork, RecurrentNetwork
**Clustering**: AEFCNNetwork, AEResNetNetwork, AEAttentionBiGRUNetwork

### By Data Characteristics:

**Long sequences**: TCNNetwork, DCNNNetwork (dilated convolutions)
**Short sequences**: MLPNetwork, FCNNetwork
**Multivariate**: InceptionNetwork, FCNNetwork, LITENetwork
**Variable length**: RecurrentNetwork with masking
**Multi-scale patterns**: InceptionNetwork

### By Computational Resources:

**Limited compute**: MLPNetwork, LITENetwork
**Moderate compute**: FCNNetwork, TimeCNNNetwork
**High compute available**: InceptionNetwork, ResNetNetwork
**GPU available**: Any deep network (major speedup)

## Best Practices

### 1. Data Preparation

Normalize input data:

```python
from aeon.transformations.collection import Normalizer

normalizer = Normalizer()
X_train_norm = normalizer.fit_transform(X_train)
X_test_norm = normalizer.transform(X_test)
```

### 2. Training/Validation Split

Use validation set for early stopping:

```python
from sklearn.model_selection import train_test_split

X_train_fit, X_val, y_train_fit, y_val = train_test_split(
    X_train, y_train, test_size=0.2, stratify=y_train
)

clf = FCNClassifier(n_epochs=200)
clf.fit(X_train_fit, y_train_fit, validation_data=(X_val, y_val))
```

### 3. Start Simple

Begin with simpler architectures before complex ones:

1. Try MLPNetwork or FCNNetwork first
2. If insufficient, try ResNetNetwork or InceptionNetwork
3. Consider ensembles if single models insufficient

### 4. Hyperparameter Tuning

Use grid search or random search:

```python
from sklearn.model_selection import GridSearchCV

param_grid = {
    'n_epochs': [100, 200],
    'batch_size': [16, 32],
    'learning_rate': [0.001, 0.0001]
}

clf = FCNClassifier()
grid = GridSearchCV(clf, param_grid, cv=3)
grid.fit(X_train, y_train)
```

### 5. Regularization

Prevent overfitting:
- Use dropout (if network supports)
- Early stopping
- Data augmentation (if available)
- Reduce model complexity

### 6. Reproducibility

Set random seeds:

```python
import numpy as np
import random
import tensorflow as tf

seed = 42
np.random.seed(seed)
random.seed(seed)
tf.random.set_seed(seed)
```
