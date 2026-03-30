# Ensemble Models for Survival Analysis

## Random Survival Forests

### Overview

Random Survival Forests extend the random forest algorithm to survival analysis with censored data. They build multiple decision trees on bootstrap samples and aggregate predictions.

### How They Work

1. **Bootstrap Sampling**: Each tree is built on a different bootstrap sample of the training data
2. **Feature Randomness**: At each node, only a random subset of features is considered for splitting
3. **Survival Function Estimation**: At terminal nodes, Kaplan-Meier and Nelson-Aalen estimators compute survival functions
4. **Ensemble Aggregation**: Final predictions average survival functions across all trees

### When to Use

- Complex non-linear relationships between features and survival
- No assumptions about functional form needed
- Want robust predictions with minimal tuning
- Need feature importance estimates
- Have sufficient sample size (typically n > 100)

### Key Parameters

- `n_estimators`: Number of trees (default: 100)
  - More trees = more stable predictions but slower
  - Typical range: 100-1000

- `max_depth`: Maximum depth of trees
  - Controls tree complexity
  - None = nodes expanded until pure or min_samples_split

- `min_samples_split`: Minimum samples to split a node (default: 6)
  - Larger values = more regularization

- `min_samples_leaf`: Minimum samples at leaf nodes (default: 3)
  - Prevents overfitting to small groups

- `max_features`: Number of features to consider at each split
  - 'sqrt': sqrt(n_features) - good default
  - 'log2': log2(n_features)
  - None: all features

- `n_jobs`: Number of parallel jobs (-1 uses all processors)

### Example Usage

```python
from sksurv.ensemble import RandomSurvivalForest
from sksurv.datasets import load_breast_cancer

# Load data
X, y = load_breast_cancer()

# Fit Random Survival Forest
rsf = RandomSurvivalForest(n_estimators=1000,
                           min_samples_split=10,
                           min_samples_leaf=15,
                           max_features="sqrt",
                           n_jobs=-1,
                           random_state=42)
rsf.fit(X, y)

# Predict risk scores
risk_scores = rsf.predict(X)

# Predict survival functions
surv_funcs = rsf.predict_survival_function(X)

# Predict cumulative hazard functions
chf_funcs = rsf.predict_cumulative_hazard_function(X)
```

### Feature Importance

**Important**: Built-in feature importance based on split impurity is not reliable for survival data. Use permutation-based feature importance instead.

```python
from sklearn.inspection import permutation_importance
from sksurv.metrics import concordance_index_censored

# Define scoring function
def score_survival_model(model, X, y):
    prediction = model.predict(X)
    result = concordance_index_censored(y['event'], y['time'], prediction)
    return result[0]

# Compute permutation importance
perm_importance = permutation_importance(
    rsf, X, y,
    n_repeats=10,
    random_state=42,
    scoring=score_survival_model
)

# Get feature importance
feature_importance = perm_importance.importances_mean
```

## Gradient Boosting Survival Analysis

### Overview

Gradient boosting builds an ensemble by sequentially adding weak learners that correct errors of previous learners. The model is: **f(x) = Σ β_m g(x; θ_m)**

### Model Types

#### GradientBoostingSurvivalAnalysis

Uses regression trees as base learners. Can capture complex non-linear relationships.

**When to Use:**
- Need to model complex non-linear relationships
- Want high predictive performance
- Have sufficient data to avoid overfitting
- Can tune hyperparameters carefully

#### ComponentwiseGradientBoostingSurvivalAnalysis

Uses component-wise least squares as base learners. Produces linear models with automatic feature selection.

**When to Use:**
- Want interpretable linear model
- Need automatic feature selection (like Lasso)
- Have high-dimensional data
- Prefer sparse models

### Loss Functions

#### Cox's Partial Likelihood (default)

Maintains proportional hazards framework but replaces linear model with additive ensemble model.

**Appropriate for:**
- Standard survival analysis settings
- When proportional hazards is reasonable
- Most use cases

#### Accelerated Failure Time (AFT)

Assumes features accelerate or decelerate survival time by a constant factor. Loss function: **(1/n) Σ ω_i (log y_i - f(x_i))²**

**Appropriate for:**
- AFT framework preferred over proportional hazards
- Want to model time directly
- Need to interpret effects on survival time

### Regularization Strategies

Three main techniques prevent overfitting:

1. **Learning Rate** (`learning_rate < 1`)
   - Shrinks contribution of each base learner
   - Smaller values need more iterations but better generalization
   - Typical range: 0.01 - 0.1

2. **Dropout** (`dropout_rate > 0`)
   - Randomly drops previous learners during training
   - Forces learners to be more robust
   - Typical range: 0.01 - 0.2

3. **Subsampling** (`subsample < 1`)
   - Uses random subset of data for each iteration
   - Adds randomness and reduces overfitting
   - Typical range: 0.5 - 0.9

**Recommendation**: Combine small learning rate with early stopping for best performance.

### Key Parameters

- `loss`: Loss function ('coxph' or 'ipcwls')
- `learning_rate`: Shrinks contribution of each tree (default: 0.1)
- `n_estimators`: Number of boosting iterations (default: 100)
- `subsample`: Fraction of samples for each iteration (default: 1.0)
- `dropout_rate`: Dropout rate for learners (default: 0.0)
- `max_depth`: Maximum depth of trees (default: 3)
- `min_samples_split`: Minimum samples to split node (default: 2)
- `min_samples_leaf`: Minimum samples at leaf (default: 1)
- `max_features`: Features to consider at each split

### Example Usage

```python
from sksurv.ensemble import GradientBoostingSurvivalAnalysis
from sklearn.model_selection import train_test_split

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Fit gradient boosting model
gbs = GradientBoostingSurvivalAnalysis(
    loss='coxph',
    learning_rate=0.05,
    n_estimators=200,
    subsample=0.8,
    dropout_rate=0.1,
    max_depth=3,
    random_state=42
)
gbs.fit(X_train, y_train)

# Predict risk scores
risk_scores = gbs.predict(X_test)

# Predict survival functions
surv_funcs = gbs.predict_survival_function(X_test)

# Predict cumulative hazard functions
chf_funcs = gbs.predict_cumulative_hazard_function(X_test)
```

### Early Stopping

Use validation set to prevent overfitting:

```python
from sklearn.model_selection import train_test_split

# Create train/validation split
X_tr, X_val, y_tr, y_val = train_test_split(X_train, y_train, test_size=0.2, random_state=42)

# Fit with early stopping
gbs = GradientBoostingSurvivalAnalysis(
    n_estimators=1000,
    learning_rate=0.01,
    max_depth=3,
    validation_fraction=0.2,
    n_iter_no_change=10,
    random_state=42
)
gbs.fit(X_tr, y_tr)

# Number of iterations used
print(f"Used {gbs.n_estimators_} iterations")
```

### Hyperparameter Tuning

```python
from sklearn.model_selection import GridSearchCV

param_grid = {
    'learning_rate': [0.01, 0.05, 0.1],
    'n_estimators': [100, 200, 300],
    'max_depth': [3, 5, 7],
    'subsample': [0.8, 1.0]
}

cv = GridSearchCV(
    GradientBoostingSurvivalAnalysis(),
    param_grid,
    scoring='concordance_index_ipcw',
    cv=5,
    n_jobs=-1
)
cv.fit(X, y)

best_model = cv.best_estimator_
```

## ComponentwiseGradientBoostingSurvivalAnalysis

### Overview

Uses component-wise least squares, producing sparse linear models with automatic feature selection similar to Lasso.

### When to Use

- Want interpretable linear model
- Need automatic feature selection
- Have high-dimensional data with many irrelevant features
- Prefer coefficient-based interpretation

### Example Usage

```python
from sksurv.ensemble import ComponentwiseGradientBoostingSurvivalAnalysis

# Fit componentwise boosting
cgbs = ComponentwiseGradientBoostingSurvivalAnalysis(
    loss='coxph',
    learning_rate=0.1,
    n_estimators=100
)
cgbs.fit(X, y)

# Get selected features and coefficients
coef = cgbs.coef_
selected_features = [i for i, c in enumerate(coef) if c != 0]
```

## ExtraSurvivalTrees

Extremely randomized survival trees - similar to Random Survival Forest but with additional randomness in split selection.

### When to Use

- Want even more regularization than Random Survival Forest
- Have limited data
- Need faster training

### Key Difference

Instead of finding the best split for selected features, it randomly selects split points, adding more diversity to the ensemble.

```python
from sksurv.ensemble import ExtraSurvivalTrees

est = ExtraSurvivalTrees(n_estimators=100, random_state=42)
est.fit(X, y)
```

## Model Comparison

| Model | Complexity | Interpretability | Performance | Speed |
|-------|-----------|------------------|-------------|-------|
| Random Survival Forest | Medium | Low | High | Medium |
| GradientBoostingSurvivalAnalysis | High | Low | Highest | Slow |
| ComponentwiseGradientBoostingSurvivalAnalysis | Low | High | Medium | Fast |
| ExtraSurvivalTrees | Medium | Low | Medium-High | Fast |

**General Recommendations:**
- **Best overall performance**: GradientBoostingSurvivalAnalysis with tuning
- **Best balance**: RandomSurvivalForest
- **Best interpretability**: ComponentwiseGradientBoostingSurvivalAnalysis
- **Fastest training**: ExtraSurvivalTrees
