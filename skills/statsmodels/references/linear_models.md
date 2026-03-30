# Linear Regression Models Reference

This document provides detailed guidance on linear regression models in statsmodels, including OLS, GLS, WLS, quantile regression, and specialized variants.

## Core Model Classes

### OLS (Ordinary Least Squares)

Assumes independent, identically distributed errors (Σ=I). Best for standard regression with homoscedastic errors.

**When to use:**
- Standard regression analysis
- Errors are independent and have constant variance
- No autocorrelation or heteroscedasticity
- Most common starting point

**Basic usage:**
```python
import statsmodels.api as sm
import numpy as np

# Prepare data - ALWAYS add constant for intercept
X = sm.add_constant(X_data)  # Adds column of 1s for intercept

# Fit model
model = sm.OLS(y, X)
results = model.fit()

# View results
print(results.summary())
```

**Key results attributes:**
```python
results.params           # Coefficients
results.bse              # Standard errors
results.tvalues          # T-statistics
results.pvalues          # P-values
results.rsquared         # R-squared
results.rsquared_adj     # Adjusted R-squared
results.fittedvalues     # Fitted values (predictions on training data)
results.resid            # Residuals
results.conf_int()       # Confidence intervals for parameters
```

**Prediction with confidence/prediction intervals:**
```python
# For in-sample predictions
pred = results.get_prediction(X)
pred_summary = pred.summary_frame()
print(pred_summary)  # Contains mean, std, confidence intervals

# For out-of-sample predictions
X_new = sm.add_constant(X_new_data)
pred_new = results.get_prediction(X_new)
pred_summary = pred_new.summary_frame()

# Access intervals
mean_ci_lower = pred_summary["mean_ci_lower"]
mean_ci_upper = pred_summary["mean_ci_upper"]
obs_ci_lower = pred_summary["obs_ci_lower"]  # Prediction intervals
obs_ci_upper = pred_summary["obs_ci_upper"]
```

**Formula API (R-style):**
```python
import statsmodels.formula.api as smf

# Automatic handling of categorical variables and interactions
formula = 'y ~ x1 + x2 + C(category) + x1:x2'
results = smf.ols(formula, data=df).fit()
```

### WLS (Weighted Least Squares)

Handles heteroscedastic errors (diagonal Σ) where variance differs across observations.

**When to use:**
- Known heteroscedasticity (non-constant error variance)
- Different observations have different reliability
- Weights are known or can be estimated

**Usage:**
```python
# If you know the weights (inverse variance)
weights = 1 / error_variance
model = sm.WLS(y, X, weights=weights)
results = model.fit()

# Common weight patterns:
# - 1/variance: when variance is known
# - n_i: sample size for grouped data
# - 1/x: when variance proportional to x
```

**Feasible WLS (estimating weights):**
```python
# Step 1: Fit OLS
ols_results = sm.OLS(y, X).fit()

# Step 2: Model squared residuals to estimate variance
abs_resid = np.abs(ols_results.resid)
variance_model = sm.OLS(np.log(abs_resid**2), X).fit()

# Step 3: Use estimated variance as weights
weights = 1 / np.exp(variance_model.fittedvalues)
wls_results = sm.WLS(y, X, weights=weights).fit()
```

### GLS (Generalized Least Squares)

Handles arbitrary covariance structure (Σ). Superclass for other regression methods.

**When to use:**
- Known covariance structure
- Correlated errors
- More general than WLS

**Usage:**
```python
# Specify covariance structure
# Sigma should be (n x n) covariance matrix
model = sm.GLS(y, X, sigma=Sigma)
results = model.fit()
```

### GLSAR (GLS with Autoregressive Errors)

Feasible generalized least squares with AR(p) errors for time series data.

**When to use:**
- Time series regression with autocorrelated errors
- Need to account for serial correlation
- Violations of error independence

**Usage:**
```python
# AR(1) errors
model = sm.GLSAR(y, X, rho=1)  # rho=1 for AR(1), rho=2 for AR(2), etc.
results = model.iterative_fit()  # Iteratively estimates AR parameters

print(results.summary())
print(f"Estimated rho: {results.model.rho}")
```

### RLS (Recursive Least Squares)

Sequential parameter estimation, useful for adaptive or online learning.

**When to use:**
- Parameters change over time
- Online/streaming data
- Want to see parameter evolution

**Usage:**
```python
from statsmodels.regression.recursive_ls import RecursiveLS

model = RecursiveLS(y, X)
results = model.fit()

# Access time-varying parameters
params_over_time = results.recursive_coefficients
cusum = results.cusum  # CUSUM statistic for structural breaks
```

### Rolling Regressions

Compute estimates across moving windows for time-varying parameter detection.

**When to use:**
- Parameters vary over time
- Want to detect structural changes
- Time series with evolving relationships

**Usage:**
```python
from statsmodels.regression.rolling import RollingOLS, RollingWLS

# Rolling OLS with 60-period window
rolling_model = RollingOLS(y, X, window=60)
rolling_results = rolling_model.fit()

# Extract time-varying parameters
rolling_params = rolling_results.params  # DataFrame with parameters over time
rolling_rsquared = rolling_results.rsquared

# Plot parameter evolution
import matplotlib.pyplot as plt
rolling_params.plot()
plt.title('Time-Varying Coefficients')
plt.show()
```

### Quantile Regression

Analyzes conditional quantiles rather than conditional mean.

**When to use:**
- Interest in quantiles (median, 90th percentile, etc.)
- Robust to outliers (median regression)
- Distributional effects across quantiles
- Heterogeneous effects

**Usage:**
```python
from statsmodels.regression.quantile_regression import QuantReg

# Median regression (50th percentile)
model = QuantReg(y, X)
results_median = model.fit(q=0.5)

# Multiple quantiles
quantiles = [0.1, 0.25, 0.5, 0.75, 0.9]
results_dict = {}
for q in quantiles:
    results_dict[q] = model.fit(q=q)

# Plot quantile-varying effects
import matplotlib.pyplot as plt
coef_dict = {q: res.params for q, res in results_dict.items()}
coef_df = pd.DataFrame(coef_dict).T
coef_df.plot()
plt.xlabel('Quantile')
plt.ylabel('Coefficient')
plt.show()
```

## Mixed Effects Models

For hierarchical/nested data with random effects.

**When to use:**
- Clustered/grouped data (students in schools, patients in hospitals)
- Repeated measures
- Need random effects to account for grouping

**Usage:**
```python
from statsmodels.regression.mixed_linear_model import MixedLM

# Random intercept model
model = MixedLM(y, X, groups=group_ids)
results = model.fit()

# Random intercept and slope
model = MixedLM(y, X, groups=group_ids, exog_re=X_random)
results = model.fit()

print(results.summary())
```

## Diagnostics and Model Assessment

### Residual Analysis

```python
# Basic residual plots
import matplotlib.pyplot as plt

# Residuals vs fitted
plt.scatter(results.fittedvalues, results.resid)
plt.xlabel('Fitted values')
plt.ylabel('Residuals')
plt.axhline(y=0, color='r', linestyle='--')
plt.title('Residuals vs Fitted')
plt.show()

# Q-Q plot for normality
from statsmodels.graphics.gofplots import qqplot
qqplot(results.resid, line='s')
plt.show()

# Histogram of residuals
plt.hist(results.resid, bins=30, edgecolor='black')
plt.xlabel('Residuals')
plt.ylabel('Frequency')
plt.title('Distribution of Residuals')
plt.show()
```

### Specification Tests

```python
from statsmodels.stats.diagnostic import het_breuschpagan, het_white
from statsmodels.stats.stattools import durbin_watson, jarque_bera

# Heteroscedasticity tests
lm_stat, lm_pval, f_stat, f_pval = het_breuschpagan(results.resid, X)
print(f"Breusch-Pagan test p-value: {lm_pval}")

# White test
white_test = het_white(results.resid, X)
print(f"White test p-value: {white_test[1]}")

# Autocorrelation
dw_stat = durbin_watson(results.resid)
print(f"Durbin-Watson statistic: {dw_stat}")
# DW ~ 2 indicates no autocorrelation
# DW < 2 suggests positive autocorrelation
# DW > 2 suggests negative autocorrelation

# Normality test
jb_stat, jb_pval, skew, kurtosis = jarque_bera(results.resid)
print(f"Jarque-Bera test p-value: {jb_pval}")
```

### Multicollinearity

```python
from statsmodels.stats.outliers_influence import variance_inflation_factor

# Calculate VIF for each variable
vif_data = pd.DataFrame()
vif_data["Variable"] = X.columns
vif_data["VIF"] = [variance_inflation_factor(X.values, i) for i in range(X.shape[1])]

print(vif_data)
# VIF > 10 indicates problematic multicollinearity
# VIF > 5 suggests moderate multicollinearity

# Condition number (from summary)
print(f"Condition number: {results.condition_number}")
# Condition number > 20 suggests multicollinearity
# Condition number > 30 indicates serious problems
```

### Influence Statistics

```python
from statsmodels.stats.outliers_influence import OLSInfluence

influence = results.get_influence()

# Leverage (hat values)
leverage = influence.hat_matrix_diag
# High leverage: > 2*p/n (p=predictors, n=observations)

# Cook's distance
cooks_d = influence.cooks_distance[0]
# Influential if Cook's D > 4/n

# DFFITS
dffits = influence.dffits[0]
# Influential if |DFFITS| > 2*sqrt(p/n)

# Create influence plot
from statsmodels.graphics.regressionplots import influence_plot
fig, ax = plt.subplots(figsize=(12, 8))
influence_plot(results, ax=ax)
plt.show()
```

### Hypothesis Testing

```python
# Test single coefficient
# H0: beta_i = 0 (automatically in summary)

# Test multiple restrictions using F-test
# Example: Test beta_1 = beta_2 = 0
R = [[0, 1, 0, 0], [0, 0, 1, 0]]  # Restriction matrix
f_test = results.f_test(R)
print(f_test)

# Formula-based hypothesis testing
f_test = results.f_test("x1 = x2 = 0")
print(f_test)

# Test linear combination: beta_1 + beta_2 = 1
r_matrix = [[0, 1, 1, 0]]
q_matrix = [1]  # RHS value
f_test = results.f_test((r_matrix, q_matrix))
print(f_test)

# Wald test (equivalent to F-test for linear restrictions)
wald_test = results.wald_test(R)
print(wald_test)
```

## Model Comparison

```python
# Compare nested models using likelihood ratio test (if using MLE)
from statsmodels.stats.anova import anova_lm

# Fit restricted and unrestricted models
model_restricted = sm.OLS(y, X_restricted).fit()
model_full = sm.OLS(y, X_full).fit()

# ANOVA table for model comparison
anova_results = anova_lm(model_restricted, model_full)
print(anova_results)

# AIC/BIC for non-nested model comparison
print(f"Model 1 AIC: {model1.aic}, BIC: {model1.bic}")
print(f"Model 2 AIC: {model2.aic}, BIC: {model2.bic}")
# Lower AIC/BIC indicates better model
```

## Robust Standard Errors

Handle heteroscedasticity or clustering without reweighting.

```python
# Heteroscedasticity-robust (HC) standard errors
results_hc = results.get_robustcov_results(cov_type='HC0')  # White's
results_hc1 = results.get_robustcov_results(cov_type='HC1')
results_hc2 = results.get_robustcov_results(cov_type='HC2')
results_hc3 = results.get_robustcov_results(cov_type='HC3')  # Most conservative

# Newey-West HAC (Heteroscedasticity and Autocorrelation Consistent)
results_hac = results.get_robustcov_results(cov_type='HAC', maxlags=4)

# Cluster-robust standard errors
results_cluster = results.get_robustcov_results(cov_type='cluster',
                                                groups=cluster_ids)

# View robust results
print(results_hc3.summary())
```

## Best Practices

1. **Always add constant**: Use `sm.add_constant()` unless you specifically want to exclude the intercept
2. **Check assumptions**: Run diagnostic tests (heteroscedasticity, autocorrelation, normality)
3. **Use formula API for categorical variables**: `smf.ols()` handles categorical variables automatically
4. **Robust standard errors**: Use when heteroscedasticity detected but model specification is correct
5. **Model selection**: Use AIC/BIC for non-nested models, F-test/likelihood ratio for nested models
6. **Outliers and influence**: Always check Cook's distance and leverage
7. **Multicollinearity**: Check VIF and condition number before interpretation
8. **Time series**: Use `GLSAR` or robust HAC standard errors for autocorrelated errors
9. **Grouped data**: Consider mixed effects models or cluster-robust standard errors
10. **Quantile regression**: Use for robust estimation or when interested in distributional effects

## Common Pitfalls

1. **Forgetting to add constant**: Results in no-intercept model
2. **Ignoring heteroscedasticity**: Use WLS or robust standard errors
3. **Using OLS with autocorrelated errors**: Use GLSAR or HAC standard errors
4. **Over-interpreting with multicollinearity**: Check VIF first
5. **Not checking residuals**: Always plot residuals vs fitted values
6. **Using t-SNE/PCA residuals**: Residuals should be from original space
7. **Confusing prediction vs confidence intervals**: Prediction intervals are wider
8. **Not handling categorical variables properly**: Use formula API or manual dummy coding
9. **Comparing models with different sample sizes**: Ensure same observations used
10. **Ignoring influential observations**: Check Cook's distance and DFFITS
