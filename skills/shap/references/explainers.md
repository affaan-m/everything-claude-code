# SHAP Explainers Reference

This document provides comprehensive information about all SHAP explainer classes, their parameters, methods, and when to use each type.

## Overview

SHAP provides specialized explainers for different model types, each optimized for specific architectures. The general `shap.Explainer` class automatically selects the appropriate algorithm based on the model type.

## Core Explainer Classes

### shap.Explainer (Auto-selector)

**Purpose**: Automatically uses Shapley values to explain any machine learning model or Python function by selecting the most appropriate explainer algorithm.

**Constructor Parameters**:
- `model`: The model to explain (function or model object)
- `masker`: Background data or masker object for feature manipulation
- `algorithm`: Optional override to force specific explainer type
- `output_names`: Names for model outputs
- `feature_names`: Names for input features

**When to Use**: Default choice when unsure which explainer to use; automatically selects the best algorithm based on model type.

### TreeExplainer

**Purpose**: Fast and exact SHAP value computation for tree-based ensemble models using the Tree SHAP algorithm.

**Constructor Parameters**:
- `model`: Tree-based model (XGBoost, LightGBM, CatBoost, PySpark, or scikit-learn trees)
- `data`: Background dataset for feature integration (optional with tree_path_dependent)
- `feature_perturbation`: How to handle dependent features
  - `"interventional"`: Requires background data; follows causal inference rules
  - `"tree_path_dependent"`: No background data needed; uses training examples per leaf
  - `"auto"`: Defaults to interventional if data provided, otherwise tree_path_dependent
- `model_output`: What model output to explain
  - `"raw"`: Standard model output (default)
  - `"probability"`: Probability-transformed output
  - `"log_loss"`: Natural log of loss function
  - Custom method names like `"predict_proba"`
- `feature_names`: Optional feature naming

**Supported Models**:
- XGBoost (xgboost.XGBClassifier, xgboost.XGBRegressor, xgboost.Booster)
- LightGBM (lightgbm.LGBMClassifier, lightgbm.LGBMRegressor, lightgbm.Booster)
- CatBoost (catboost.CatBoostClassifier, catboost.CatBoostRegressor)
- PySpark MLlib tree models
- scikit-learn (DecisionTreeClassifier, DecisionTreeRegressor, RandomForestClassifier, RandomForestRegressor, ExtraTreesClassifier, ExtraTreesRegressor, GradientBoostingClassifier, GradientBoostingRegressor)

**Key Methods**:
- `shap_values(X)`: Computes SHAP values for samples; returns arrays where each row represents feature attribution
- `shap_interaction_values(X)`: Estimates interaction effects between feature pairs; provides matrices with main effects and pairwise interactions
- `explain_row(row)`: Explains individual rows with detailed attribution information

**When to Use**:
- Primary choice for all tree-based models
- When exact SHAP values are needed (not approximations)
- When computational speed is important for large datasets
- For models like random forests, gradient boosting, or XGBoost

**Example**:
```python
import shap
import xgboost

# Train model
model = xgboost.XGBClassifier().fit(X_train, y_train)

# Create explainer
explainer = shap.TreeExplainer(model)

# Compute SHAP values
shap_values = explainer.shap_values(X_test)

# Compute interaction values
shap_interaction = explainer.shap_interaction_values(X_test)
```

### DeepExplainer

**Purpose**: Approximates SHAP values for deep learning models using an enhanced version of the DeepLIFT algorithm.

**Constructor Parameters**:
- `model`: Framework-dependent specification
  - **TensorFlow**: Tuple of (input_tensor, output_tensor) where output is single-dimensional
  - **PyTorch**: `nn.Module` object or tuple of `(model, layer)` for layer-specific explanations
- `data`: Background dataset for feature integration
  - **TensorFlow**: numpy arrays or pandas DataFrames
  - **PyTorch**: torch tensors
  - **Recommended size**: 100-1000 samples (not full training set) to balance accuracy and computational cost
- `session` (TensorFlow only): Optional session object; auto-detected if None
- `learning_phase_flags`: Custom learning phase tensors for handling batch norm/dropout during inference

**Supported Frameworks**:
- **TensorFlow**: Full support including Keras models
- **PyTorch**: Complete integration with nn.Module architecture

**Key Methods**:
- `shap_values(X)`: Returns approximate SHAP values for the model applied to data X
- `explain_row(row)`: Explains single rows with attribution values and expected outputs
- `save(file)` / `load(file)`: Serialization support for explainer objects
- `supports_model_with_masker(model, masker)`: Compatibility checker for model types

**When to Use**:
- For deep neural networks in TensorFlow or PyTorch
- When working with convolutional neural networks (CNNs)
- For recurrent neural networks (RNNs) and transformers
- When model-specific explanation is needed for deep learning architectures

**Key Design Feature**:
Variance of expectation estimates scales approximately as 1/√N, where N is the number of background samples, enabling accuracy-efficiency trade-offs.

**Example**:
```python
import shap
import tensorflow as tf

# Assume model is a Keras model
model = tf.keras.models.load_model('my_model.h5')

# Select background samples (subset of training data)
background = X_train[:100]

# Create explainer
explainer = shap.DeepExplainer(model, background)

# Compute SHAP values
shap_values = explainer.shap_values(X_test[:10])
```

### KernelExplainer

**Purpose**: Model-agnostic SHAP value computation using the Kernel SHAP method with weighted linear regression.

**Constructor Parameters**:
- `model`: Function or model object that takes a matrix of samples and returns model outputs
- `data`: Background dataset (numpy array, pandas DataFrame, or sparse matrix) used to simulate missing features
- `feature_names`: Optional list of feature names; automatically derived from DataFrame column names if available
- `link`: Connection function between feature importance and model output
  - `"identity"`: Direct relationship (default)
  - `"logit"`: For probability outputs

**Key Methods**:
- `shap_values(X, **kwargs)`: Calculates SHAP values for sample predictions
  - `nsamples`: Evaluation count per prediction ("auto" or integer); higher values reduce variance
  - `l1_reg`: Feature selection regularization ("num_features(int)", "aic", "bic", or float)
  - Returns arrays where each row sums to the difference between model output and expected value
- `explain_row(row)`: Explains individual predictions with attribution values and expected values
- `save(file)` / `load(file)`: Persist and restore explainer objects

**When to Use**:
- For black-box models where specialized explainers aren't available
- When working with custom prediction functions
- For any model type (neural networks, SVMs, ensemble methods, etc.)
- When model-agnostic explanations are needed
- **Note**: Slower than specialized explainers; use only when no specialized option exists

**Example**:
```python
import shap
from sklearn.svm import SVC

# Train model
model = SVC(probability=True).fit(X_train, y_train)

# Create prediction function
predict_fn = lambda x: model.predict_proba(x)[:, 1]

# Select background samples
background = shap.sample(X_train, 100)

# Create explainer
explainer = shap.KernelExplainer(predict_fn, background)

# Compute SHAP values (may be slow)
shap_values = explainer.shap_values(X_test[:10])
```

### LinearExplainer

**Purpose**: Specialized explainer for linear models that accounts for feature correlations.

**Constructor Parameters**:
- `model`: Linear model or tuple of (coefficients, intercept)
- `masker`: Background data for feature correlation
- `feature_perturbation`: How to handle feature correlations
  - `"interventional"`: Assumes feature independence
  - `"correlation_dependent"`: Accounts for feature correlations

**Supported Models**:
- scikit-learn linear models (LinearRegression, LogisticRegression, Ridge, Lasso, ElasticNet)
- Custom linear models with coefficients and intercept

**When to Use**:
- For linear regression and logistic regression models
- When feature correlations are important to explanation accuracy
- When extremely fast explanations are needed
- For GLMs and other linear model types

**Example**:
```python
import shap
from sklearn.linear_model import LogisticRegression

# Train model
model = LogisticRegression().fit(X_train, y_train)

# Create explainer
explainer = shap.LinearExplainer(model, X_train)

# Compute SHAP values
shap_values = explainer.shap_values(X_test)
```

### GradientExplainer

**Purpose**: Uses expected gradients to approximate SHAP values for neural networks.

**Constructor Parameters**:
- `model`: Deep learning model (TensorFlow or PyTorch)
- `data`: Background samples for integration
- `batch_size`: Batch size for gradient computation
- `local_smoothing`: Amount of noise to add for smoothing (default 0)

**When to Use**:
- As an alternative to DeepExplainer for neural networks
- When gradient-based explanations are preferred
- For differentiable models where gradient information is available

**Example**:
```python
import shap
import torch

# Assume model is a PyTorch model
model = torch.load('model.pt')

# Select background samples
background = X_train[:100]

# Create explainer
explainer = shap.GradientExplainer(model, background)

# Compute SHAP values
shap_values = explainer.shap_values(X_test[:10])
```

### PermutationExplainer

**Purpose**: Approximates Shapley values by iterating through permutations of inputs.

**Constructor Parameters**:
- `model`: Prediction function
- `masker`: Background data or masker object
- `max_evals`: Maximum number of model evaluations per sample

**When to Use**:
- When exact Shapley values are needed but specialized explainers aren't available
- For small feature sets where permutation is tractable
- As a more accurate alternative to KernelExplainer (but slower)

**Example**:
```python
import shap

# Create explainer
explainer = shap.PermutationExplainer(model.predict, X_train)

# Compute SHAP values
shap_values = explainer.shap_values(X_test[:10])
```

## Explainer Selection Guide

**Decision Tree for Choosing an Explainer**:

1. **Is your model tree-based?** (XGBoost, LightGBM, CatBoost, Random Forest, etc.)
   - Yes → Use `TreeExplainer` (fast and exact)
   - No → Continue to step 2

2. **Is your model a deep neural network?** (TensorFlow, PyTorch, Keras)
   - Yes → Use `DeepExplainer` or `GradientExplainer`
   - No → Continue to step 3

3. **Is your model linear?** (Linear/Logistic Regression, GLMs)
   - Yes → Use `LinearExplainer` (extremely fast)
   - No → Continue to step 4

4. **Do you need model-agnostic explanations?**
   - Yes → Use `KernelExplainer` (slower but works with any model)
   - If computational budget allows and high accuracy is needed → Use `PermutationExplainer`

5. **Unsure or want automatic selection?**
   - Use `shap.Explainer` (auto-selects best algorithm)

## Common Parameters Across Explainers

**Background Data / Masker**:
- Purpose: Represents the "typical" input to establish baseline expectations
- Size recommendations: 50-1000 samples (more for complex models)
- Selection: Random sample from training data or kmeans-selected representatives

**Feature Names**:
- Automatically extracted from pandas DataFrames
- Can be manually specified for numpy arrays
- Important for plot interpretability

**Model Output Specification**:
- Raw model output vs. transformed output (probabilities, log-odds)
- Critical for correct interpretation of SHAP values
- Example: For XGBoost classifiers, SHAP explains margin output (log-odds) before logistic transformation

## Performance Considerations

**Speed Ranking** (fastest to slowest):
1. `LinearExplainer` - Nearly instantaneous
2. `TreeExplainer` - Very fast, scales well
3. `DeepExplainer` - Fast for neural networks
4. `GradientExplainer` - Fast for neural networks
5. `KernelExplainer` - Slow, use only when necessary
6. `PermutationExplainer` - Very slow but most accurate for small feature sets

**Memory Considerations**:
- `TreeExplainer`: Low memory overhead
- `DeepExplainer`: Memory proportional to background sample size
- `KernelExplainer`: Can be memory-intensive for large background datasets
- For large datasets: Use batching or sample subsets

## Explainer Output: The Explanation Object

All explainers return `shap.Explanation` objects containing:
- `values`: SHAP values (numpy array)
- `base_values`: Expected model output (baseline)
- `data`: Original feature values
- `feature_names`: Names of features

The Explanation object supports:
- Slicing: `explanation[0]` for first sample
- Array operations: Compatible with numpy operations
- Direct plotting: Can be passed to plot functions
