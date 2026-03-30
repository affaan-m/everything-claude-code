# Discrete Choice Models Reference

This document provides comprehensive guidance on discrete choice models in statsmodels, including binary, multinomial, count, and ordinal models.

## Overview

Discrete choice models handle outcomes that are:
- **Binary**: 0/1, success/failure
- **Multinomial**: Multiple unordered categories
- **Ordinal**: Ordered categories
- **Count**: Non-negative integers

All models use maximum likelihood estimation and assume i.i.d. errors.

## Binary Models

### Logit (Logistic Regression)

Uses logistic distribution for binary outcomes.

**When to use:**
- Binary classification (yes/no, success/failure)
- Probability estimation for binary outcomes
- Interpretable odds ratios

**Model**: P(Y=1|X) = 1 / (1 + exp(-Xβ))

```python
import statsmodels.api as sm
from statsmodels.discrete.discrete_model import Logit

# Prepare data
X = sm.add_constant(X_data)

# Fit model
model = Logit(y, X)
results = model.fit()

print(results.summary())
```

**Interpretation:**
```python
import numpy as np

# Odds ratios
odds_ratios = np.exp(results.params)
print("Odds ratios:", odds_ratios)

# For 1-unit increase in X, odds multiply by exp(β)
# OR > 1: increases odds of success
# OR < 1: decreases odds of success
# OR = 1: no effect

# Confidence intervals for odds ratios
odds_ci = np.exp(results.conf_int())
print("Odds ratio 95% CI:")
print(odds_ci)
```

**Marginal effects:**
```python
# Average marginal effects (AME)
marginal_effects = results.get_margeff(at='mean')
print(marginal_effects.summary())

# Marginal effects at means (MEM)
marginal_effects_mem = results.get_margeff(at='mean', method='dydx')

# Marginal effects at representative values
marginal_effects_custom = results.get_margeff(at='mean',
                                              atexog={'x1': 1, 'x2': 5})
```

**Predictions:**
```python
# Predicted probabilities
probs = results.predict(X)

# Binary predictions (0.5 threshold)
predictions = (probs > 0.5).astype(int)

# Custom threshold
threshold = 0.3
predictions_custom = (probs > threshold).astype(int)

# For new data
X_new = sm.add_constant(X_new_data)
new_probs = results.predict(X_new)
```

**Model evaluation:**
```python
from sklearn.metrics import (classification_report, confusion_matrix,
                             roc_auc_score, roc_curve)

# Classification report
print(classification_report(y, predictions))

# Confusion matrix
print(confusion_matrix(y, predictions))

# AUC-ROC
auc = roc_auc_score(y, probs)
print(f"AUC: {auc:.4f}")

# Pseudo R-squared
print(f"McFadden's Pseudo R²: {results.prsquared:.4f}")
```

### Probit

Uses normal distribution for binary outcomes.

**When to use:**
- Binary outcomes
- Prefer normal distribution assumption
- Field convention (econometrics often uses probit)

**Model**: P(Y=1|X) = Φ(Xβ), where Φ is standard normal CDF

```python
from statsmodels.discrete.discrete_model import Probit

model = Probit(y, X)
results = model.fit()

print(results.summary())
```

**Comparison with Logit:**
- Probit and Logit usually give similar results
- Probit: symmetric, based on normal distribution
- Logit: slightly heavier tails, easier interpretation (odds ratios)
- Coefficients not directly comparable (scale difference)

```python
# Marginal effects are comparable
logit_me = logit_results.get_margeff().margeff
probit_me = probit_results.get_margeff().margeff

print("Logit marginal effects:", logit_me)
print("Probit marginal effects:", probit_me)
```

## Multinomial Models

### MNLogit (Multinomial Logit)

For unordered categorical outcomes with 3+ categories.

**When to use:**
- Multiple unordered categories (e.g., transportation mode, brand choice)
- No natural ordering among categories
- Need probabilities for each category

**Model**: P(Y=j|X) = exp(Xβⱼ) / Σₖ exp(Xβₖ)

```python
from statsmodels.discrete.discrete_model import MNLogit

# y should be integers 0, 1, 2, ... for categories
model = MNLogit(y, X)
results = model.fit()

print(results.summary())
```

**Interpretation:**
```python
# One category is reference (usually category 0)
# Coefficients represent log-odds relative to reference

# For category j vs reference:
# exp(β_j) = odds ratio of category j vs reference

# Predicted probabilities for each category
probs = results.predict(X)  # Shape: (n_samples, n_categories)

# Most likely category
predicted_categories = probs.argmax(axis=1)
```

**Relative risk ratios:**
```python
# Exponentiate coefficients for relative risk ratios
import numpy as np
import pandas as pd

# Get parameter names and values
params_df = pd.DataFrame({
    'coef': results.params,
    'RRR': np.exp(results.params)
})
print(params_df)
```

### Conditional Logit

For choice models where alternatives have characteristics.

**When to use:**
- Alternative-specific regressors (vary across choices)
- Panel data with choices
- Discrete choice experiments

```python
from statsmodels.discrete.conditional_models import ConditionalLogit

# Data structure: long format with choice indicator
model = ConditionalLogit(y_choice, X_alternatives, groups=individual_id)
results = model.fit()
```

## Count Models

### Poisson

Standard model for count data.

**When to use:**
- Count outcomes (events, occurrences)
- Rare events
- Mean ≈ variance

**Model**: P(Y=k|X) = exp(-λ) λᵏ / k!, where log(λ) = Xβ

```python
from statsmodels.discrete.count_model import Poisson

model = Poisson(y_counts, X)
results = model.fit()

print(results.summary())
```

**Interpretation:**
```python
# Rate ratios (incident rate ratios)
rate_ratios = np.exp(results.params)
print("Rate ratios:", rate_ratios)

# For 1-unit increase in X, expected count multiplies by exp(β)
```

**Check overdispersion:**
```python
# Mean and variance should be similar for Poisson
print(f"Mean: {y_counts.mean():.2f}")
print(f"Variance: {y_counts.var():.2f}")

# Formal test
from statsmodels.stats.stattools import durbin_watson

# Overdispersion if variance >> mean
# Rule of thumb: variance/mean > 1.5 suggests overdispersion
overdispersion_ratio = y_counts.var() / y_counts.mean()
print(f"Variance/Mean: {overdispersion_ratio:.2f}")

if overdispersion_ratio > 1.5:
    print("Consider Negative Binomial model")
```

**With offset (for rates):**
```python
# When modeling rates with varying exposure
# log(λ) = log(exposure) + Xβ

model = Poisson(y_counts, X, offset=np.log(exposure))
results = model.fit()
```

### Negative Binomial

For overdispersed count data (variance > mean).

**When to use:**
- Count data with overdispersion
- Excess variance not explained by Poisson
- Heterogeneity in counts

**Model**: Adds dispersion parameter α to account for overdispersion

```python
from statsmodels.discrete.count_model import NegativeBinomial

model = NegativeBinomial(y_counts, X)
results = model.fit()

print(results.summary())
print(f"Dispersion parameter alpha: {results.params['alpha']:.4f}")
```

**Compare with Poisson:**
```python
# Fit both models
poisson_results = Poisson(y_counts, X).fit()
nb_results = NegativeBinomial(y_counts, X).fit()

# AIC comparison (lower is better)
print(f"Poisson AIC: {poisson_results.aic:.2f}")
print(f"Negative Binomial AIC: {nb_results.aic:.2f}")

# Likelihood ratio test (if NB is better)
from scipy import stats
lr_stat = 2 * (nb_results.llf - poisson_results.llf)
lr_pval = 1 - stats.chi2.cdf(lr_stat, df=1)  # 1 extra parameter (alpha)
print(f"LR test p-value: {lr_pval:.4f}")

if lr_pval < 0.05:
    print("Negative Binomial significantly better")
```

### Zero-Inflated Models

For count data with excess zeros.

**When to use:**
- More zeros than expected from Poisson/NB
- Two processes: one for zeros, one for counts
- Examples: number of doctor visits, insurance claims

**Models:**
- ZeroInflatedPoisson (ZIP)
- ZeroInflatedNegativeBinomialP (ZINB)

```python
from statsmodels.discrete.count_model import (ZeroInflatedPoisson,
                                               ZeroInflatedNegativeBinomialP)

# ZIP model
zip_model = ZeroInflatedPoisson(y_counts, X, exog_infl=X_inflation)
zip_results = zip_model.fit()

# ZINB model (for overdispersion + excess zeros)
zinb_model = ZeroInflatedNegativeBinomialP(y_counts, X, exog_infl=X_inflation)
zinb_results = zinb_model.fit()

print(zip_results.summary())
```

**Two parts of the model:**
```python
# 1. Inflation model: P(Y=0 due to inflation)
# 2. Count model: distribution of counts

# Predicted probabilities of inflation
inflation_probs = zip_results.predict(X, which='prob')

# Predicted counts
predicted_counts = zip_results.predict(X, which='mean')
```

### Hurdle Models

Two-stage model: whether any counts, then how many.

**When to use:**
- Excess zeros
- Different processes for zero vs positive counts
- Zeros structurally different from positive values

```python
from statsmodels.discrete.count_model import HurdleCountModel

# Specify count distribution and zero inflation
model = HurdleCountModel(y_counts, X,
                         exog_infl=X_hurdle,
                         dist='poisson')  # or 'negbin'
results = model.fit()

print(results.summary())
```

## Ordinal Models

### Ordered Logit/Probit

For ordered categorical outcomes.

**When to use:**
- Ordered categories (e.g., low/medium/high, ratings 1-5)
- Natural ordering matters
- Want to respect ordinal structure

**Model**: Cumulative probability model with cutpoints

```python
from statsmodels.miscmodels.ordinal_model import OrderedModel

# y should be ordered integers: 0, 1, 2, ...
model = OrderedModel(y_ordered, X, distr='logit')  # or 'probit'
results = model.fit(method='bfgs')

print(results.summary())
```

**Interpretation:**
```python
# Cutpoints (thresholds between categories)
cutpoints = results.params[-n_categories+1:]
print("Cutpoints:", cutpoints)

# Coefficients
coefficients = results.params[:-n_categories+1]
print("Coefficients:", coefficients)

# Predicted probabilities for each category
probs = results.predict(X)  # Shape: (n_samples, n_categories)

# Most likely category
predicted_categories = probs.argmax(axis=1)
```

**Proportional odds assumption:**
```python
# Test if coefficients are same across cutpoints
# (Brant test - implement manually or check residuals)

# Check: model each cutpoint separately and compare coefficients
```

## Model Diagnostics

### Goodness of Fit

```python
# Pseudo R-squared (McFadden)
print(f"Pseudo R²: {results.prsquared:.4f}")

# AIC/BIC for model comparison
print(f"AIC: {results.aic:.2f}")
print(f"BIC: {results.bic:.2f}")

# Log-likelihood
print(f"Log-likelihood: {results.llf:.2f}")

# Likelihood ratio test vs null model
lr_stat = 2 * (results.llf - results.llnull)
from scipy import stats
lr_pval = 1 - stats.chi2.cdf(lr_stat, results.df_model)
print(f"LR test p-value: {lr_pval}")
```

### Classification Metrics (Binary)

```python
from sklearn.metrics import (accuracy_score, precision_score, recall_score,
                             f1_score, roc_auc_score)

# Predictions
probs = results.predict(X)
predictions = (probs > 0.5).astype(int)

# Metrics
print(f"Accuracy: {accuracy_score(y, predictions):.4f}")
print(f"Precision: {precision_score(y, predictions):.4f}")
print(f"Recall: {recall_score(y, predictions):.4f}")
print(f"F1: {f1_score(y, predictions):.4f}")
print(f"AUC: {roc_auc_score(y, probs):.4f}")
```

### Classification Metrics (Multinomial)

```python
from sklearn.metrics import accuracy_score, classification_report, log_loss

# Predicted categories
probs = results.predict(X)
predictions = probs.argmax(axis=1)

# Accuracy
accuracy = accuracy_score(y, predictions)
print(f"Accuracy: {accuracy:.4f}")

# Classification report
print(classification_report(y, predictions))

# Log loss
logloss = log_loss(y, probs)
print(f"Log Loss: {logloss:.4f}")
```

### Count Model Diagnostics

```python
# Observed vs predicted frequencies
observed = pd.Series(y_counts).value_counts().sort_index()
predicted = results.predict(X)
predicted_counts = pd.Series(np.round(predicted)).value_counts().sort_index()

# Compare distributions
import matplotlib.pyplot as plt
fig, ax = plt.subplots()
observed.plot(kind='bar', alpha=0.5, label='Observed', ax=ax)
predicted_counts.plot(kind='bar', alpha=0.5, label='Predicted', ax=ax)
ax.legend()
ax.set_xlabel('Count')
ax.set_ylabel('Frequency')
plt.show()

# Rootogram (better visualization)
from statsmodels.graphics.agreement import mean_diff_plot
# Custom rootogram implementation needed
```

### Influence and Outliers

```python
# Standardized residuals
std_resid = (y - results.predict(X)) / np.sqrt(results.predict(X))

# Check for outliers (|std_resid| > 2)
outliers = np.where(np.abs(std_resid) > 2)[0]
print(f"Number of outliers: {len(outliers)}")

# Leverage (hat values) - for logit/probit
# from statsmodels.stats.outliers_influence
```

## Hypothesis Testing

```python
# Single parameter test (automatic in summary)

# Multiple parameters: Wald test
# Test H0: β₁ = β₂ = 0
R = [[0, 1, 0, 0], [0, 0, 1, 0]]
wald_test = results.wald_test(R)
print(wald_test)

# Likelihood ratio test for nested models
model_reduced = Logit(y, X_reduced).fit()
model_full = Logit(y, X_full).fit()

lr_stat = 2 * (model_full.llf - model_reduced.llf)
df = model_full.df_model - model_reduced.df_model
from scipy import stats
lr_pval = 1 - stats.chi2.cdf(lr_stat, df)
print(f"LR test p-value: {lr_pval:.4f}")
```

## Model Selection and Comparison

```python
# Fit multiple models
models = {
    'Logit': Logit(y, X).fit(),
    'Probit': Probit(y, X).fit(),
    # Add more models
}

# Compare AIC/BIC
comparison = pd.DataFrame({
    'AIC': {name: model.aic for name, model in models.items()},
    'BIC': {name: model.bic for name, model in models.items()},
    'Pseudo R²': {name: model.prsquared for name, model in models.items()}
})
print(comparison.sort_values('AIC'))

# Cross-validation for predictive performance
from sklearn.model_selection import cross_val_score
from sklearn.linear_model import LogisticRegression

# Use sklearn wrapper or manual CV
```

## Formula API

Use R-style formulas for easier specification.

```python
import statsmodels.formula.api as smf

# Logit with formula
formula = 'y ~ x1 + x2 + C(category) + x1:x2'
results = smf.logit(formula, data=df).fit()

# MNLogit with formula
results = smf.mnlogit(formula, data=df).fit()

# Poisson with formula
results = smf.poisson(formula, data=df).fit()

# Negative Binomial with formula
results = smf.negativebinomial(formula, data=df).fit()
```

## Common Applications

### Binary Classification (Marketing Response)

```python
# Predict customer purchase probability
X = sm.add_constant(customer_features)
model = Logit(purchased, X)
results = model.fit()

# Targeting: select top 20% likely to purchase
probs = results.predict(X)
top_20_pct_idx = np.argsort(probs)[-int(0.2*len(probs)):]
```

### Multinomial Choice (Transportation Mode)

```python
# Predict transportation mode choice
model = MNLogit(mode_choice, X)
results = model.fit()

# Predicted mode for new commuter
new_commuter = sm.add_constant(new_features)
mode_probs = results.predict(new_commuter)
predicted_mode = mode_probs.argmax(axis=1)
```

### Count Data (Number of Doctor Visits)

```python
# Model healthcare utilization
model = NegativeBinomial(num_visits, X)
results = model.fit()

# Expected visits for new patient
expected_visits = results.predict(new_patient_X)
```

### Zero-Inflated (Insurance Claims)

```python
# Many people have zero claims
# Zero-inflation: some never claim
# Count process: those who might claim

zip_model = ZeroInflatedPoisson(claims, X_count, exog_infl=X_inflation)
results = zip_model.fit()

# P(never file claim)
never_claim_prob = results.predict(X, which='prob-zero')

# Expected claims
expected_claims = results.predict(X, which='mean')
```

## Best Practices

1. **Check data type**: Ensure response matches model (binary, counts, categories)
2. **Add constant**: Always use `sm.add_constant()` unless no intercept desired
3. **Scale continuous predictors**: For better convergence and interpretation
4. **Check convergence**: Look for convergence warnings
5. **Use formula API**: For categorical variables and interactions
6. **Marginal effects**: Report marginal effects, not just coefficients
7. **Model comparison**: Use AIC/BIC and cross-validation
8. **Validate**: Holdout set or cross-validation for predictive models
9. **Check overdispersion**: For count models, test Poisson assumption
10. **Consider alternatives**: Zero-inflation, hurdle models for excess zeros

## Common Pitfalls

1. **Forgetting constant**: No intercept term
2. **Perfect separation**: Logit/probit may not converge
3. **Using Poisson with overdispersion**: Check and use Negative Binomial
4. **Misinterpreting coefficients**: Remember they're on log-odds/log scale
5. **Not checking convergence**: Optimization may fail silently
6. **Wrong distribution**: Match model to data type (binary/count/categorical)
7. **Ignoring excess zeros**: Use ZIP/ZINB when appropriate
8. **Not validating predictions**: Always check out-of-sample performance
9. **Comparing non-nested models**: Use AIC/BIC, not likelihood ratio test
10. **Ordinal as nominal**: Use OrderedModel for ordered categories
