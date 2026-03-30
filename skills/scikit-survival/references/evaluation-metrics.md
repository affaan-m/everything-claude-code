# Evaluation Metrics for Survival Models

## Overview

Evaluating survival models requires specialized metrics that account for censored data. scikit-survival provides three main categories of metrics:
1. Concordance Index (C-index)
2. Time-dependent ROC and AUC
3. Brier Score

## Concordance Index (C-index)

### What It Measures

The concordance index measures the rank correlation between predicted risk scores and observed event times. It represents the probability that, for a random pair of subjects, the model correctly orders their survival times.

**Range**: 0 to 1
- 0.5 = random predictions
- 1.0 = perfect concordance
- Typical good performance: 0.7-0.8

### Two Implementations

#### Harrell's C-index (concordance_index_censored)

The traditional estimator, simpler but has limitations.

**When to Use:**
- Low censoring rates (< 40%)
- Quick evaluation during development
- Comparing models on same dataset

**Limitations:**
- Becomes increasingly biased with high censoring rates
- Overestimates performance starting at approximately 49% censoring

```python
from sksurv.metrics import concordance_index_censored

# Compute Harrell's C-index
result = concordance_index_censored(y_test['event'], y_test['time'], risk_scores)
c_index = result[0]
print(f"Harrell's C-index: {c_index:.3f}")
```

#### Uno's C-index (concordance_index_ipcw)

Inverse probability of censoring weighted (IPCW) estimator that corrects for censoring bias.

**When to Use:**
- Moderate to high censoring rates (> 40%)
- Need unbiased estimates
- Comparing models across different datasets
- Publishing results (more robust)

**Advantages:**
- Remains stable even with high censoring
- More reliable estimates
- Less biased

```python
from sksurv.metrics import concordance_index_ipcw

# Compute Uno's C-index
# Requires training data for IPCW calculation
c_index, concordant, discordant, tied_risk = concordance_index_ipcw(
    y_train, y_test, risk_scores
)
print(f"Uno's C-index: {c_index:.3f}")
```

### Choosing Between Harrell's and Uno's

**Use Uno's C-index when:**
- Censoring rate > 40%
- Need most accurate estimates
- Comparing models from different studies
- Publishing research

**Use Harrell's C-index when:**
- Low censoring rates
- Quick model comparisons during development
- Computational efficiency is critical

### Example Comparison

```python
from sksurv.metrics import concordance_index_censored, concordance_index_ipcw

# Harrell's C-index
harrell = concordance_index_censored(y_test['event'], y_test['time'], risk_scores)[0]

# Uno's C-index
uno = concordance_index_ipcw(y_train, y_test, risk_scores)[0]

print(f"Harrell's C-index: {harrell:.3f}")
print(f"Uno's C-index: {uno:.3f}")
```

## Time-Dependent ROC and AUC

### What It Measures

Time-dependent AUC evaluates model discrimination at specific time points. It distinguishes subjects who experience events by time *t* from those who don't.

**Question answered**: "How well does the model predict who will have an event by time t?"

### When to Use

- Predicting event occurrence within specific time windows
- Clinical decision-making at specific timepoints (e.g., 5-year survival)
- Want to evaluate performance across different time horizons
- Need both discrimination and timing information

### Key Function: cumulative_dynamic_auc

```python
from sksurv.metrics import cumulative_dynamic_auc

# Define evaluation times
times = [365, 730, 1095, 1460, 1825]  # 1, 2, 3, 4, 5 years

# Compute time-dependent AUC
auc, mean_auc = cumulative_dynamic_auc(
    y_train, y_test, risk_scores, times
)

# Plot AUC over time
import matplotlib.pyplot as plt
plt.plot(times, auc, marker='o')
plt.xlabel('Time (days)')
plt.ylabel('Time-dependent AUC')
plt.title('Model Discrimination Over Time')
plt.show()

print(f"Mean AUC: {mean_auc:.3f}")
```

### Interpretation

- **AUC at time t**: Probability model correctly ranks a subject who had event by time t above one who didn't
- **Varying AUC over time**: Indicates model performance changes with time horizon
- **Mean AUC**: Overall summary of discrimination across all time points

### Example: Comparing Models

```python
# Compare two models
auc1, mean_auc1 = cumulative_dynamic_auc(y_train, y_test, risk_scores1, times)
auc2, mean_auc2 = cumulative_dynamic_auc(y_train, y_test, risk_scores2, times)

plt.plot(times, auc1, marker='o', label='Model 1')
plt.plot(times, auc2, marker='s', label='Model 2')
plt.xlabel('Time (days)')
plt.ylabel('Time-dependent AUC')
plt.legend()
plt.show()
```

## Brier Score

### What It Measures

Brier score extends mean squared error to survival data with censoring. It measures both discrimination (ranking) and calibration (accuracy of predicted probabilities).

**Formula**: **(1/n) Σ (S(t|x_i) - I(T_i > t))²**

where S(t|x_i) is predicted survival probability at time t for subject i.

**Range**: 0 to 1
- 0 = perfect predictions
- Lower is better
- Typical good performance: < 0.2

### When to Use

- Need calibration assessment (not just ranking)
- Want to evaluate predicted probabilities, not just risk scores
- Comparing models that output survival functions
- Clinical applications requiring probability estimates

### Key Functions

#### brier_score: Single Time Point

```python
from sksurv.metrics import brier_score

# Compute Brier score at specific time
time_point = 1825  # 5 years
surv_probs = model.predict_survival_function(X_test)
# Extract survival probability at time_point for each subject
surv_at_t = [fn(time_point) for fn in surv_probs]

bs = brier_score(y_train, y_test, surv_at_t, time_point)[1]
print(f"Brier score at {time_point} days: {bs:.3f}")
```

#### integrated_brier_score: Summary Across Time

```python
from sksurv.metrics import integrated_brier_score

# Compute integrated Brier score
times = [365, 730, 1095, 1460, 1825]
surv_probs = model.predict_survival_function(X_test)

ibs = integrated_brier_score(y_train, y_test, surv_probs, times)
print(f"Integrated Brier Score: {ibs:.3f}")
```

### Interpretation

- **Brier score at time t**: Expected squared difference between predicted and actual survival at time t
- **Integrated Brier Score**: Weighted average of Brier scores across time
- **Lower values = better predictions**

### Comparison with Null Model

Always compare against a baseline (e.g., Kaplan-Meier):

```python
from sksurv.nonparametric import kaplan_meier_estimator

# Compute Kaplan-Meier baseline
time_km, surv_km = kaplan_meier_estimator(y_train['event'], y_train['time'])

# Predict with KM for each test subject
surv_km_test = [surv_km[time_km <= time_point][-1] if any(time_km <= time_point) else 1.0
                for _ in range(len(X_test))]

bs_km = brier_score(y_train, y_test, surv_km_test, time_point)[1]
bs_model = brier_score(y_train, y_test, surv_at_t, time_point)[1]

print(f"Kaplan-Meier Brier Score: {bs_km:.3f}")
print(f"Model Brier Score: {bs_model:.3f}")
print(f"Improvement: {(bs_km - bs_model) / bs_km * 100:.1f}%")
```

## Using Metrics with Cross-Validation

### Concordance Index Scorer

```python
from sklearn.model_selection import cross_val_score
from sksurv.metrics import as_concordance_index_ipcw_scorer

# Create scorer
scorer = as_concordance_index_ipcw_scorer()

# Perform cross-validation
scores = cross_val_score(model, X, y, cv=5, scoring=scorer)
print(f"Mean C-index: {scores.mean():.3f} (±{scores.std():.3f})")
```

### Integrated Brier Score Scorer

```python
from sksurv.metrics import as_integrated_brier_score_scorer

# Define time points for evaluation
times = np.percentile(y['time'][y['event']], [25, 50, 75])

# Create scorer
scorer = as_integrated_brier_score_scorer(times)

# Perform cross-validation
scores = cross_val_score(model, X, y, cv=5, scoring=scorer)
print(f"Mean IBS: {scores.mean():.3f} (±{scores.std():.3f})")
```

## Model Selection with GridSearchCV

```python
from sklearn.model_selection import GridSearchCV
from sksurv.ensemble import RandomSurvivalForest
from sksurv.metrics import as_concordance_index_ipcw_scorer

# Define parameter grid
param_grid = {
    'n_estimators': [100, 200, 300],
    'min_samples_split': [10, 20, 30],
    'max_depth': [None, 10, 20]
}

# Create scorer
scorer = as_concordance_index_ipcw_scorer()

# Perform grid search
cv = GridSearchCV(
    RandomSurvivalForest(random_state=42),
    param_grid,
    scoring=scorer,
    cv=5,
    n_jobs=-1
)
cv.fit(X, y)

print(f"Best parameters: {cv.best_params_}")
print(f"Best C-index: {cv.best_score_:.3f}")
```

## Comprehensive Model Evaluation

### Recommended Evaluation Pipeline

```python
from sksurv.metrics import (
    concordance_index_censored,
    concordance_index_ipcw,
    cumulative_dynamic_auc,
    integrated_brier_score
)

def evaluate_survival_model(model, X_train, X_test, y_train, y_test):
    """Comprehensive evaluation of survival model"""

    # Get predictions
    risk_scores = model.predict(X_test)
    surv_funcs = model.predict_survival_function(X_test)

    # 1. Concordance Index (both versions)
    c_harrell = concordance_index_censored(y_test['event'], y_test['time'], risk_scores)[0]
    c_uno = concordance_index_ipcw(y_train, y_test, risk_scores)[0]

    # 2. Time-dependent AUC
    times = np.percentile(y_test['time'][y_test['event']], [25, 50, 75])
    auc, mean_auc = cumulative_dynamic_auc(y_train, y_test, risk_scores, times)

    # 3. Integrated Brier Score
    ibs = integrated_brier_score(y_train, y_test, surv_funcs, times)

    # Print results
    print("=" * 50)
    print("Model Evaluation Results")
    print("=" * 50)
    print(f"Harrell's C-index:  {c_harrell:.3f}")
    print(f"Uno's C-index:      {c_uno:.3f}")
    print(f"Mean AUC:           {mean_auc:.3f}")
    print(f"Integrated Brier:   {ibs:.3f}")
    print("=" * 50)

    return {
        'c_harrell': c_harrell,
        'c_uno': c_uno,
        'mean_auc': mean_auc,
        'ibs': ibs,
        'time_auc': dict(zip(times, auc))
    }

# Use the evaluation function
results = evaluate_survival_model(model, X_train, X_test, y_train, y_test)
```

## Choosing the Right Metric

### Decision Guide

**Use C-index (Uno's) when:**
- Primary goal is ranking/discrimination
- Don't need calibrated probabilities
- Standard survival analysis setting
- Most common choice

**Use Time-dependent AUC when:**
- Need discrimination at specific time points
- Clinical decisions at specific horizons
- Want to understand how performance varies over time

**Use Brier Score when:**
- Need calibrated probability estimates
- Both discrimination AND calibration important
- Clinical decision-making requiring probabilities
- Want comprehensive assessment

**Best Practice**: Report multiple metrics for comprehensive evaluation. At minimum, report:
- Uno's C-index (discrimination)
- Integrated Brier Score (discrimination + calibration)
- Time-dependent AUC at clinically relevant time points
