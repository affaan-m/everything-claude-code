# Cox Proportional Hazards Models

## Overview

Cox proportional hazards models are semi-parametric models that relate covariates to the time of an event. The hazard function for individual *i* is expressed as:

**h_i(t) = h_0(t) × exp(β^T x_i)**

where:
- h_0(t) is the baseline hazard function (unspecified)
- β is the vector of coefficients
- x_i is the covariate vector for individual *i*

The key assumption is that the hazard ratio between two individuals is constant over time (proportional hazards).

## CoxPHSurvivalAnalysis

Basic Cox proportional hazards model for survival analysis.

### When to Use
- Standard survival analysis with censored data
- Need interpretable coefficients (log hazard ratios)
- Proportional hazards assumption holds
- Dataset has relatively few features

### Key Parameters
- `alpha`: Regularization parameter (default: 0, no regularization)
- `ties`: Method for handling tied event times ('breslow' or 'efron')
- `n_iter`: Maximum number of iterations for optimization

### Example Usage
```python
from sksurv.linear_model import CoxPHSurvivalAnalysis
from sksurv.datasets import load_gbsg2

# Load data
X, y = load_gbsg2()

# Fit Cox model
estimator = CoxPHSurvivalAnalysis()
estimator.fit(X, y)

# Get coefficients (log hazard ratios)
coefficients = estimator.coef_

# Predict risk scores
risk_scores = estimator.predict(X)
```

## CoxnetSurvivalAnalysis

Cox model with elastic net penalty for feature selection and regularization.

### When to Use
- High-dimensional data (many features)
- Need automatic feature selection
- Want to handle multicollinearity
- Require sparse models

### Penalty Types
- **Ridge (L2)**: alpha_min_ratio=1.0, l1_ratio=0
  - Shrinks all coefficients
  - Good when all features are relevant

- **Lasso (L1)**: l1_ratio=1.0
  - Performs feature selection (sets coefficients to zero)
  - Good for sparse models

- **Elastic Net**: 0 < l1_ratio < 1
  - Combination of L1 and L2
  - Balances feature selection and grouping

### Key Parameters
- `l1_ratio`: Balance between L1 and L2 penalty (0=Ridge, 1=Lasso)
- `alpha_min_ratio`: Ratio of smallest to largest penalty in regularization path
- `n_alphas`: Number of alphas along regularization path
- `fit_baseline_model`: Whether to fit unpenalized baseline model

### Example Usage
```python
from sksurv.linear_model import CoxnetSurvivalAnalysis

# Fit with elastic net penalty
estimator = CoxnetSurvivalAnalysis(l1_ratio=0.5, alpha_min_ratio=0.01)
estimator.fit(X, y)

# Access regularization path
alphas = estimator.alphas_
coefficients_path = estimator.coef_path_

# Predict with specific alpha
risk_scores = estimator.predict(X, alpha=0.1)
```

### Cross-Validation for Alpha Selection
```python
from sklearn.model_selection import GridSearchCV
from sksurv.metrics import concordance_index_censored

# Define parameter grid
param_grid = {'l1_ratio': [0.1, 0.5, 0.9],
              'alpha_min_ratio': [0.01, 0.001]}

# Grid search with C-index
cv = GridSearchCV(CoxnetSurvivalAnalysis(),
                  param_grid,
                  scoring='concordance_index_ipcw',
                  cv=5)
cv.fit(X, y)

# Best parameters
best_params = cv.best_params_
```

## IPCRidge

Inverse probability of censoring weighted Ridge regression for accelerated failure time models.

### When to Use
- Prefer accelerated failure time (AFT) framework over proportional hazards
- Need to model how features accelerate/decelerate survival time
- High censoring rates
- Want regularization with Ridge penalty

### Key Difference from Cox Models
AFT models assume features multiply survival time by a constant factor, rather than multiplying the hazard rate. The model predicts log survival time directly.

### Example Usage
```python
from sksurv.linear_model import IPCRidge

# Fit IPCRidge model
estimator = IPCRidge(alpha=1.0)
estimator.fit(X, y)

# Predict log survival time
log_time = estimator.predict(X)
```

## Model Comparison and Selection

### Choosing Between Models

**Use CoxPHSurvivalAnalysis when:**
- Small to moderate number of features
- Want interpretable hazard ratios
- Standard survival analysis setting

**Use CoxnetSurvivalAnalysis when:**
- High-dimensional data (p >> n)
- Need feature selection
- Want to identify important predictors
- Presence of multicollinearity

**Use IPCRidge when:**
- AFT framework is more appropriate
- High censoring rates
- Want to model time directly rather than hazard

### Checking Proportional Hazards Assumption

The proportional hazards assumption should be verified using:
- Schoenfeld residuals
- Log-log survival plots
- Statistical tests (available in other packages like lifelines)

If violated, consider:
- Stratification by violating covariates
- Time-varying coefficients
- Alternative models (AFT, parametric models)

## Interpretation

### Cox Model Coefficients
- Positive coefficient: increased hazard (shorter survival)
- Negative coefficient: decreased hazard (longer survival)
- Hazard ratio = exp(β) for one-unit increase in covariate
- Example: β=0.693 → HR=2.0 (doubles the hazard)

### Risk Scores
- Higher risk score = higher risk of event = shorter expected survival
- Risk scores are relative; use survival functions for absolute predictions
