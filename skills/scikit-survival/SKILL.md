---
name: scikit-survival
description: Comprehensive toolkit for survival analysis and time-to-event modeling in Python using scikit-survival. Use this skill when working with censored survival data, performing time-to-event analysis, fitting Cox models, Random Survival Forests, Gradient Boosting models, or Survival SVMs, evaluating survival predictions with concordance index or Brier score, handling competing risks, or implementing any survival analysis workflow with the scikit-survival library.
license: GPL-3.0 license
metadata:
    skill-author: K-Dense Inc.
---

# scikit-survival: Survival Analysis in Python

## Overview

scikit-survival is a Python library for survival analysis built on top of scikit-learn. It provides specialized tools for time-to-event analysis, handling the unique challenge of censored data where some observations are only partially known.

Survival analysis aims to establish connections between covariates and the time of an event, accounting for censored records (particularly right-censored data from studies where participants don't experience events during observation periods).

## When to Use This Skill

Use this skill when:
- Performing survival analysis or time-to-event modeling
- Working with censored data (right-censored, left-censored, or interval-censored)
- Fitting Cox proportional hazards models (standard or penalized)
- Building ensemble survival models (Random Survival Forests, Gradient Boosting)
- Training Survival Support Vector Machines
- Evaluating survival model performance (concordance index, Brier score, time-dependent AUC)
- Estimating Kaplan-Meier or Nelson-Aalen curves
- Analyzing competing risks
- Preprocessing survival data or handling missing values in survival datasets
- Conducting any analysis using the scikit-survival library

## Core Capabilities

### 1. Model Types and Selection

scikit-survival provides multiple model families, each suited for different scenarios:

#### Cox Proportional Hazards Models
**Use for**: Standard survival analysis with interpretable coefficients
- `CoxPHSurvivalAnalysis`: Basic Cox model
- `CoxnetSurvivalAnalysis`: Penalized Cox with elastic net for high-dimensional data
- `IPCRidge`: Ridge regression for accelerated failure time models

**See**: `references/cox-models.md` for detailed guidance on Cox models, regularization, and interpretation

#### Ensemble Methods
**Use for**: High predictive performance with complex non-linear relationships
- `RandomSurvivalForest`: Robust, non-parametric ensemble method
- `GradientBoostingSurvivalAnalysis`: Tree-based boosting for maximum performance
- `ComponentwiseGradientBoostingSurvivalAnalysis`: Linear boosting with feature selection
- `ExtraSurvivalTrees`: Extremely randomized trees for additional regularization

**See**: `references/ensemble-models.md` for comprehensive guidance on ensemble methods, hyperparameter tuning, and when to use each model

#### Survival Support Vector Machines
**Use for**: Medium-sized datasets with margin-based learning
- `FastSurvivalSVM`: Linear SVM optimized for speed
- `FastKernelSurvivalSVM`: Kernel SVM for non-linear relationships
- `HingeLossSurvivalSVM`: SVM with hinge loss
- `ClinicalKernelTransform`: Specialized kernel for clinical + molecular data

**See**: `references/svm-models.md` for detailed SVM guidance, kernel selection, and hyperparameter tuning

#### Model Selection Decision Tree

```
Start
├─ High-dimensional data (p > n)?
│  ├─ Yes → CoxnetSurvivalAnalysis (elastic net)
│  └─ No → Continue
│
├─ Need interpretable coefficients?
│  ├─ Yes → CoxPHSurvivalAnalysis or ComponentwiseGradientBoostingSurvivalAnalysis
│  └─ No → Continue
│
├─ Complex non-linear relationships expected?
│  ├─ Yes
│  │  ├─ Large dataset (n > 1000) → GradientBoostingSurvivalAnalysis
│  │  ├─ Medium dataset → RandomSurvivalForest or FastKernelSurvivalSVM
│  │  └─ Small dataset → RandomSurvivalForest
│  └─ No → CoxPHSurvivalAnalysis or FastSurvivalSVM
│
└─ For maximum performance → Try multiple models and compare
```

### 2. Data Preparation and Preprocessing

Before modeling, properly prepare survival data:

#### Creating Survival Outcomes
```python
from sksurv.util import Surv

# From separate arrays
y = Surv.from_arrays(event=event_array, time=time_array)

# From DataFrame
y = Surv.from_dataframe('event', 'time', df)
```

#### Essential Preprocessing Steps
1. **Handle missing values**: Imputation strategies for features
2. **Encode categorical variables**: One-hot encoding or label encoding
3. **Standardize features**: Critical for SVMs and regularized Cox models
4. **Validate data quality**: Check for negative times, sufficient events per feature
5. **Train-test split**: Maintain similar censoring rates across splits

**See**: `references/data-handling.md` for complete preprocessing workflows, data validation, and best practices

### 3. Model Evaluation

Proper evaluation is critical for survival models. Use appropriate metrics that account for censoring:

#### Concordance Index (C-index)
Primary metric for ranking/discrimination:
- **Harrell's C-index**: Use for low censoring (<40%)
- **Uno's C-index**: Use for moderate to high censoring (>40%) - more robust

```python
from sksurv.metrics import concordance_index_censored, concordance_index_ipcw

# Harrell's C-index
c_harrell = concordance_index_censored(y_test['event'], y_test['time'], risk_scores)[0]

# Uno's C-index (recommended)
c_uno = concordance_index_ipcw(y_train, y_test, risk_scores)[0]
```

#### Time-Dependent AUC
Evaluate discrimination at specific time points:

```python
from sksurv.metrics import cumulative_dynamic_auc

times = [365, 730, 1095]  # 1, 2, 3 years
auc, mean_auc = cumulative_dynamic_auc(y_train, y_test, risk_scores, times)
```

#### Brier Score
Assess both discrimination and calibration:

```python
from sksurv.metrics import integrated_brier_score

ibs = integrated_brier_score(y_train, y_test, survival_functions, times)
```

**See**: `references/evaluation-metrics.md` for comprehensive evaluation guidance, metric selection, and using scorers with cross-validation

### 4. Competing Risks Analysis

Handle situations with multiple mutually exclusive event types:

```python
from sksurv.nonparametric import cumulative_incidence_competing_risks

# Estimate cumulative incidence for each event type
time_points, cif_event1, cif_event2 = cumulative_incidence_competing_risks(y)
```

**Use competing risks when**:
- Multiple mutually exclusive event types exist (e.g., death from different causes)
- Occurrence of one event prevents others
- Need probability estimates for specific event types

**See**: `references/competing-risks.md` for detailed competing risks methods, cause-specific hazard models, and interpretation

### 5. Non-parametric Estimation

Estimate survival functions without parametric assumptions:

#### Kaplan-Meier Estimator
```python
from sksurv.nonparametric import kaplan_meier_estimator

time, survival_prob = kaplan_meier_estimator(y['event'], y['time'])
```

#### Nelson-Aalen Estimator
```python
from sksurv.nonparametric import nelson_aalen_estimator

time, cumulative_hazard = nelson_aalen_estimator(y['event'], y['time'])
```

## Typical Workflows

### Workflow 1: Standard Survival Analysis

```python
from sksurv.datasets import load_breast_cancer
from sksurv.linear_model import CoxPHSurvivalAnalysis
from sksurv.metrics import concordance_index_ipcw
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# 1. Load and prepare data
X, y = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 2. Preprocess
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# 3. Fit model
estimator = CoxPHSurvivalAnalysis()
estimator.fit(X_train_scaled, y_train)

# 4. Predict
risk_scores = estimator.predict(X_test_scaled)

# 5. Evaluate
c_index = concordance_index_ipcw(y_train, y_test, risk_scores)[0]
print(f"C-index: {c_index:.3f}")
```

### Workflow 2: High-Dimensional Data with Feature Selection

```python
from sksurv.linear_model import CoxnetSurvivalAnalysis
from sklearn.model_selection import GridSearchCV
from sksurv.metrics import as_concordance_index_ipcw_scorer

# 1. Use penalized Cox for feature selection
estimator = CoxnetSurvivalAnalysis(l1_ratio=0.9)  # Lasso-like

# 2. Tune regularization with cross-validation
param_grid = {'alpha_min_ratio': [0.01, 0.001]}
cv = GridSearchCV(estimator, param_grid,
                  scoring=as_concordance_index_ipcw_scorer(), cv=5)
cv.fit(X, y)

# 3. Identify selected features
best_model = cv.best_estimator_
selected_features = np.where(best_model.coef_ != 0)[0]
```

### Workflow 3: Ensemble Method for Maximum Performance

```python
from sksurv.ensemble import GradientBoostingSurvivalAnalysis
from sklearn.model_selection import GridSearchCV

# 1. Define parameter grid
param_grid = {
    'learning_rate': [0.01, 0.05, 0.1],
    'n_estimators': [100, 200, 300],
    'max_depth': [3, 5, 7]
}

# 2. Grid search
gbs = GradientBoostingSurvivalAnalysis()
cv = GridSearchCV(gbs, param_grid, cv=5,
                  scoring=as_concordance_index_ipcw_scorer(), n_jobs=-1)
cv.fit(X_train, y_train)

# 3. Evaluate best model
best_model = cv.best_estimator_
risk_scores = best_model.predict(X_test)
c_index = concordance_index_ipcw(y_train, y_test, risk_scores)[0]
```

### Workflow 4: Comprehensive Model Comparison

```python
from sksurv.linear_model import CoxPHSurvivalAnalysis
from sksurv.ensemble import RandomSurvivalForest, GradientBoostingSurvivalAnalysis
from sksurv.svm import FastSurvivalSVM
from sksurv.metrics import concordance_index_ipcw, integrated_brier_score

# Define models
models = {
    'Cox': CoxPHSurvivalAnalysis(),
    'RSF': RandomSurvivalForest(n_estimators=100, random_state=42),
    'GBS': GradientBoostingSurvivalAnalysis(random_state=42),
    'SVM': FastSurvivalSVM(random_state=42)
}

# Evaluate each model
results = {}
for name, model in models.items():
    model.fit(X_train_scaled, y_train)
    risk_scores = model.predict(X_test_scaled)
    c_index = concordance_index_ipcw(y_train, y_test, risk_scores)[0]
    results[name] = c_index
    print(f"{name}: C-index = {c_index:.3f}")

# Select best model
best_model_name = max(results, key=results.get)
print(f"\nBest model: {best_model_name}")
```

## Integration with scikit-learn

scikit-survival fully integrates with scikit-learn's ecosystem:

```python
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import cross_val_score, GridSearchCV

# Use pipelines
pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('model', CoxPHSurvivalAnalysis())
])

# Use cross-validation
scores = cross_val_score(pipeline, X, y, cv=5,
                         scoring=as_concordance_index_ipcw_scorer())

# Use grid search
param_grid = {'model__alpha': [0.1, 1.0, 10.0]}
cv = GridSearchCV(pipeline, param_grid, cv=5)
cv.fit(X, y)
```

## Best Practices

1. **Always standardize features** for SVMs and regularized Cox models
2. **Use Uno's C-index** instead of Harrell's when censoring > 40%
3. **Report multiple evaluation metrics** (C-index, integrated Brier score, time-dependent AUC)
4. **Check proportional hazards assumption** for Cox models
5. **Use cross-validation** for hyperparameter tuning with appropriate scorers
6. **Validate data quality** before modeling (check for negative times, sufficient events per feature)
7. **Compare multiple model types** to find best performance
8. **Use permutation importance** for Random Survival Forests (not built-in importance)
9. **Consider competing risks** when multiple event types exist
10. **Document censoring mechanism** and rates in analysis

## Common Pitfalls to Avoid

1. **Using Harrell's C-index with high censoring** → Use Uno's C-index
2. **Not standardizing features for SVMs** → Always standardize
3. **Forgetting to pass y_train to concordance_index_ipcw** → Required for IPCW calculation
4. **Treating competing events as censored** → Use competing risks methods
5. **Not checking for sufficient events per feature** → Rule of thumb: 10+ events per feature
6. **Using built-in feature importance for RSF** → Use permutation importance
7. **Ignoring proportional hazards assumption** → Validate or use alternative models
8. **Not using appropriate scorers in cross-validation** → Use as_concordance_index_ipcw_scorer()

## Reference Files

This skill includes detailed reference files for specific topics:

- **`references/cox-models.md`**: Complete guide to Cox proportional hazards models, penalized Cox (CoxNet), IPCRidge, regularization strategies, and interpretation
- **`references/ensemble-models.md`**: Random Survival Forests, Gradient Boosting, hyperparameter tuning, feature importance, and model selection
- **`references/evaluation-metrics.md`**: Concordance index (Harrell's vs Uno's), time-dependent AUC, Brier score, comprehensive evaluation pipelines
- **`references/data-handling.md`**: Data loading, preprocessing workflows, handling missing data, feature encoding, validation checks
- **`references/svm-models.md`**: Survival Support Vector Machines, kernel selection, clinical kernel transform, hyperparameter tuning
- **`references/competing-risks.md`**: Competing risks analysis, cumulative incidence functions, cause-specific hazard models

Load these reference files when detailed information is needed for specific tasks.

## Additional Resources

- **Official Documentation**: https://scikit-survival.readthedocs.io/
- **GitHub Repository**: https://github.com/sebp/scikit-survival
- **Built-in Datasets**: Use `sksurv.datasets` for practice datasets (GBSG2, WHAS500, veterans lung cancer, etc.)
- **API Reference**: Complete list of classes and functions at https://scikit-survival.readthedocs.io/en/stable/api/index.html

## Quick Reference: Key Imports

```python
# Models
from sksurv.linear_model import CoxPHSurvivalAnalysis, CoxnetSurvivalAnalysis, IPCRidge
from sksurv.ensemble import RandomSurvivalForest, GradientBoostingSurvivalAnalysis
from sksurv.svm import FastSurvivalSVM, FastKernelSurvivalSVM
from sksurv.tree import SurvivalTree

# Evaluation metrics
from sksurv.metrics import (
    concordance_index_censored,
    concordance_index_ipcw,
    cumulative_dynamic_auc,
    brier_score,
    integrated_brier_score,
    as_concordance_index_ipcw_scorer,
    as_integrated_brier_score_scorer
)

# Non-parametric estimation
from sksurv.nonparametric import (
    kaplan_meier_estimator,
    nelson_aalen_estimator,
    cumulative_incidence_competing_risks
)

# Data handling
from sksurv.util import Surv
from sksurv.preprocessing import OneHotEncoder, encode_categorical
from sksurv.datasets import load_gbsg2, load_breast_cancer, load_veterans_lung_cancer

# Kernels
from sksurv.kernels import ClinicalKernelTransform
```

