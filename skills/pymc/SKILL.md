---
name: pymc
description: Bayesian modeling with PyMC. Build hierarchical models, MCMC (NUTS), variational inference, LOO/WAIC comparison, posterior checks, for probabilistic programming and inference.
license: Apache License, Version 2.0
metadata:
    skill-author: K-Dense Inc.
---

# PyMC Bayesian Modeling

## Overview

PyMC is a Python library for Bayesian modeling and probabilistic programming. Build, fit, validate, and compare Bayesian models using PyMC's modern API (version 5.x+), including hierarchical models, MCMC sampling (NUTS), variational inference, and model comparison (LOO, WAIC).

## When to Use This Skill

This skill should be used when:
- Building Bayesian models (linear/logistic regression, hierarchical models, time series, etc.)
- Performing MCMC sampling or variational inference
- Conducting prior/posterior predictive checks
- Diagnosing sampling issues (divergences, convergence, ESS)
- Comparing multiple models using information criteria (LOO, WAIC)
- Implementing uncertainty quantification through Bayesian methods
- Working with hierarchical/multilevel data structures
- Handling missing data or measurement error in a principled way

## Standard Bayesian Workflow

Follow this workflow for building and validating Bayesian models:

### 1. Data Preparation

```python
import pymc as pm
import arviz as az
import numpy as np

# Load and prepare data
X = ...  # Predictors
y = ...  # Outcomes

# Standardize predictors for better sampling
X_mean = X.mean(axis=0)
X_std = X.std(axis=0)
X_scaled = (X - X_mean) / X_std
```

**Key practices:**
- Standardize continuous predictors (improves sampling efficiency)
- Center outcomes when possible
- Handle missing data explicitly (treat as parameters)
- Use named dimensions with `coords` for clarity

### 2. Model Building

```python
coords = {
    'predictors': ['var1', 'var2', 'var3'],
    'obs_id': np.arange(len(y))
}

with pm.Model(coords=coords) as model:
    # Priors
    alpha = pm.Normal('alpha', mu=0, sigma=1)
    beta = pm.Normal('beta', mu=0, sigma=1, dims='predictors')
    sigma = pm.HalfNormal('sigma', sigma=1)

    # Linear predictor
    mu = alpha + pm.math.dot(X_scaled, beta)

    # Likelihood
    y_obs = pm.Normal('y_obs', mu=mu, sigma=sigma, observed=y, dims='obs_id')
```

**Key practices:**
- Use weakly informative priors (not flat priors)
- Use `HalfNormal` or `Exponential` for scale parameters
- Use named dimensions (`dims`) instead of `shape` when possible
- Use `pm.Data()` for values that will be updated for predictions

### 3. Prior Predictive Check

**Always validate priors before fitting:**

```python
with model:
    prior_pred = pm.sample_prior_predictive(samples=1000, random_seed=42)

# Visualize
az.plot_ppc(prior_pred, group='prior')
```

**Check:**
- Do prior predictions span reasonable values?
- Are extreme values plausible given domain knowledge?
- If priors generate implausible data, adjust and re-check

### 4. Fit Model

```python
with model:
    # Optional: Quick exploration with ADVI
    # approx = pm.fit(n=20000)

    # Full MCMC inference
    idata = pm.sample(
        draws=2000,
        tune=1000,
        chains=4,
        target_accept=0.9,
        random_seed=42,
        idata_kwargs={'log_likelihood': True}  # For model comparison
    )
```

**Key parameters:**
- `draws=2000`: Number of samples per chain
- `tune=1000`: Warmup samples (discarded)
- `chains=4`: Run 4 chains for convergence checking
- `target_accept=0.9`: Higher for difficult posteriors (0.95-0.99)
- Include `log_likelihood=True` for model comparison

### 5. Check Diagnostics

**Use the diagnostic script:**

```python
from scripts.model_diagnostics import check_diagnostics

results = check_diagnostics(idata, var_names=['alpha', 'beta', 'sigma'])
```

**Check:**
- **R-hat < 1.01**: Chains have converged
- **ESS > 400**: Sufficient effective samples
- **No divergences**: NUTS sampled successfully
- **Trace plots**: Chains should mix well (fuzzy caterpillar)

**If issues arise:**
- Divergences → Increase `target_accept=0.95`, use non-centered parameterization
- Low ESS → Sample more draws, reparameterize to reduce correlation
- High R-hat → Run longer, check for multimodality

### 6. Posterior Predictive Check

**Validate model fit:**

```python
with model:
    pm.sample_posterior_predictive(idata, extend_inferencedata=True, random_seed=42)

# Visualize
az.plot_ppc(idata)
```

**Check:**
- Do posterior predictions capture observed data patterns?
- Are systematic deviations evident (model misspecification)?
- Consider alternative models if fit is poor

### 7. Analyze Results

```python
# Summary statistics
print(az.summary(idata, var_names=['alpha', 'beta', 'sigma']))

# Posterior distributions
az.plot_posterior(idata, var_names=['alpha', 'beta', 'sigma'])

# Coefficient estimates
az.plot_forest(idata, var_names=['beta'], combined=True)
```

### 8. Make Predictions

```python
X_new = ...  # New predictor values
X_new_scaled = (X_new - X_mean) / X_std

with model:
    pm.set_data({'X_scaled': X_new_scaled})
    post_pred = pm.sample_posterior_predictive(
        idata.posterior,
        var_names=['y_obs'],
        random_seed=42
    )

# Extract prediction intervals
y_pred_mean = post_pred.posterior_predictive['y_obs'].mean(dim=['chain', 'draw'])
y_pred_hdi = az.hdi(post_pred.posterior_predictive, var_names=['y_obs'])
```

## Common Model Patterns

### Linear Regression

For continuous outcomes with linear relationships:

```python
with pm.Model() as linear_model:
    alpha = pm.Normal('alpha', mu=0, sigma=10)
    beta = pm.Normal('beta', mu=0, sigma=10, shape=n_predictors)
    sigma = pm.HalfNormal('sigma', sigma=1)

    mu = alpha + pm.math.dot(X, beta)
    y = pm.Normal('y', mu=mu, sigma=sigma, observed=y_obs)
```

**Use template:** `assets/linear_regression_template.py`

### Logistic Regression

For binary outcomes:

```python
with pm.Model() as logistic_model:
    alpha = pm.Normal('alpha', mu=0, sigma=10)
    beta = pm.Normal('beta', mu=0, sigma=10, shape=n_predictors)

    logit_p = alpha + pm.math.dot(X, beta)
    y = pm.Bernoulli('y', logit_p=logit_p, observed=y_obs)
```

### Hierarchical Models

For grouped data (use non-centered parameterization):

```python
with pm.Model(coords={'groups': group_names}) as hierarchical_model:
    # Hyperpriors
    mu_alpha = pm.Normal('mu_alpha', mu=0, sigma=10)
    sigma_alpha = pm.HalfNormal('sigma_alpha', sigma=1)

    # Group-level (non-centered)
    alpha_offset = pm.Normal('alpha_offset', mu=0, sigma=1, dims='groups')
    alpha = pm.Deterministic('alpha', mu_alpha + sigma_alpha * alpha_offset, dims='groups')

    # Observation-level
    mu = alpha[group_idx]
    sigma = pm.HalfNormal('sigma', sigma=1)
    y = pm.Normal('y', mu=mu, sigma=sigma, observed=y_obs)
```

**Use template:** `assets/hierarchical_model_template.py`

**Critical:** Always use non-centered parameterization for hierarchical models to avoid divergences.

### Poisson Regression

For count data:

```python
with pm.Model() as poisson_model:
    alpha = pm.Normal('alpha', mu=0, sigma=10)
    beta = pm.Normal('beta', mu=0, sigma=10, shape=n_predictors)

    log_lambda = alpha + pm.math.dot(X, beta)
    y = pm.Poisson('y', mu=pm.math.exp(log_lambda), observed=y_obs)
```

For overdispersed counts, use `NegativeBinomial` instead.

### Time Series

For autoregressive processes:

```python
with pm.Model() as ar_model:
    sigma = pm.HalfNormal('sigma', sigma=1)
    rho = pm.Normal('rho', mu=0, sigma=0.5, shape=ar_order)
    init_dist = pm.Normal.dist(mu=0, sigma=sigma)

    y = pm.AR('y', rho=rho, sigma=sigma, init_dist=init_dist, observed=y_obs)
```

## Model Comparison

### Comparing Models

Use LOO or WAIC for model comparison:

```python
from scripts.model_comparison import compare_models, check_loo_reliability

# Fit models with log_likelihood
models = {
    'Model1': idata1,
    'Model2': idata2,
    'Model3': idata3
}

# Compare using LOO
comparison = compare_models(models, ic='loo')

# Check reliability
check_loo_reliability(models)
```

**Interpretation:**
- **Δloo < 2**: Models are similar, choose simpler model
- **2 < Δloo < 4**: Weak evidence for better model
- **4 < Δloo < 10**: Moderate evidence
- **Δloo > 10**: Strong evidence for better model

**Check Pareto-k values:**
- k < 0.7: LOO reliable
- k > 0.7: Consider WAIC or k-fold CV

### Model Averaging

When models are similar, average predictions:

```python
from scripts.model_comparison import model_averaging

averaged_pred, weights = model_averaging(models, var_name='y_obs')
```

## Distribution Selection Guide

### For Priors

**Scale parameters** (σ, τ):
- `pm.HalfNormal('sigma', sigma=1)` - Default choice
- `pm.Exponential('sigma', lam=1)` - Alternative
- `pm.Gamma('sigma', alpha=2, beta=1)` - More informative

**Unbounded parameters**:
- `pm.Normal('theta', mu=0, sigma=1)` - For standardized data
- `pm.StudentT('theta', nu=3, mu=0, sigma=1)` - Robust to outliers

**Positive parameters**:
- `pm.LogNormal('theta', mu=0, sigma=1)`
- `pm.Gamma('theta', alpha=2, beta=1)`

**Probabilities**:
- `pm.Beta('p', alpha=2, beta=2)` - Weakly informative
- `pm.Uniform('p', lower=0, upper=1)` - Non-informative (use sparingly)

**Correlation matrices**:
- `pm.LKJCorr('corr', n=n_vars, eta=2)` - eta=1 uniform, eta>1 prefers identity

### For Likelihoods

**Continuous outcomes**:
- `pm.Normal('y', mu=mu, sigma=sigma)` - Default for continuous data
- `pm.StudentT('y', nu=nu, mu=mu, sigma=sigma)` - Robust to outliers

**Count data**:
- `pm.Poisson('y', mu=lambda)` - Equidispersed counts
- `pm.NegativeBinomial('y', mu=mu, alpha=alpha)` - Overdispersed counts
- `pm.ZeroInflatedPoisson('y', psi=psi, mu=mu)` - Excess zeros

**Binary outcomes**:
- `pm.Bernoulli('y', p=p)` or `pm.Bernoulli('y', logit_p=logit_p)`

**Categorical outcomes**:
- `pm.Categorical('y', p=probs)`

**See:** `references/distributions.md` for comprehensive distribution reference

## Sampling and Inference

### MCMC with NUTS

Default and recommended for most models:

```python
idata = pm.sample(
    draws=2000,
    tune=1000,
    chains=4,
    target_accept=0.9,
    random_seed=42
)
```

**Adjust when needed:**
- Divergences → `target_accept=0.95` or higher
- Slow sampling → Use ADVI for initialization
- Discrete parameters → Use `pm.Metropolis()` for discrete vars

### Variational Inference

Fast approximation for exploration or initialization:

```python
with model:
    approx = pm.fit(n=20000, method='advi')

    # Use for initialization
    start = approx.sample(return_inferencedata=False)[0]
    idata = pm.sample(start=start)
```

**Trade-offs:**
- Much faster than MCMC
- Approximate (may underestimate uncertainty)
- Good for large models or quick exploration

**See:** `references/sampling_inference.md` for detailed sampling guide

## Diagnostic Scripts

### Comprehensive Diagnostics

```python
from scripts.model_diagnostics import create_diagnostic_report

create_diagnostic_report(
    idata,
    var_names=['alpha', 'beta', 'sigma'],
    output_dir='diagnostics/'
)
```

Creates:
- Trace plots
- Rank plots (mixing check)
- Autocorrelation plots
- Energy plots
- ESS evolution
- Summary statistics CSV

### Quick Diagnostic Check

```python
from scripts.model_diagnostics import check_diagnostics

results = check_diagnostics(idata)
```

Checks R-hat, ESS, divergences, and tree depth.

## Common Issues and Solutions

### Divergences

**Symptom:** `idata.sample_stats.diverging.sum() > 0`

**Solutions:**
1. Increase `target_accept=0.95` or `0.99`
2. Use non-centered parameterization (hierarchical models)
3. Add stronger priors to constrain parameters
4. Check for model misspecification

### Low Effective Sample Size

**Symptom:** `ESS < 400`

**Solutions:**
1. Sample more draws: `draws=5000`
2. Reparameterize to reduce posterior correlation
3. Use QR decomposition for regression with correlated predictors

### High R-hat

**Symptom:** `R-hat > 1.01`

**Solutions:**
1. Run longer chains: `tune=2000, draws=5000`
2. Check for multimodality
3. Improve initialization with ADVI

### Slow Sampling

**Solutions:**
1. Use ADVI initialization
2. Reduce model complexity
3. Increase parallelization: `cores=8, chains=8`
4. Use variational inference if appropriate

## Best Practices

### Model Building

1. **Always standardize predictors** for better sampling
2. **Use weakly informative priors** (not flat)
3. **Use named dimensions** (`dims`) for clarity
4. **Non-centered parameterization** for hierarchical models
5. **Check prior predictive** before fitting

### Sampling

1. **Run multiple chains** (at least 4) for convergence
2. **Use `target_accept=0.9`** as baseline (higher if needed)
3. **Include `log_likelihood=True`** for model comparison
4. **Set random seed** for reproducibility

### Validation

1. **Check diagnostics** before interpretation (R-hat, ESS, divergences)
2. **Posterior predictive check** for model validation
3. **Compare multiple models** when appropriate
4. **Report uncertainty** (HDI intervals, not just point estimates)

### Workflow

1. Start simple, add complexity gradually
2. Prior predictive check → Fit → Diagnostics → Posterior predictive check
3. Iterate on model specification based on checks
4. Document assumptions and prior choices

## Resources

This skill includes:

### References (`references/`)

- **`distributions.md`**: Comprehensive catalog of PyMC distributions organized by category (continuous, discrete, multivariate, mixture, time series). Use when selecting priors or likelihoods.

- **`sampling_inference.md`**: Detailed guide to sampling algorithms (NUTS, Metropolis, SMC), variational inference (ADVI, SVGD), and handling sampling issues. Use when encountering convergence problems or choosing inference methods.

- **`workflows.md`**: Complete workflow examples and code patterns for common model types, data preparation, prior selection, and model validation. Use as a cookbook for standard Bayesian analyses.

### Scripts (`scripts/`)

- **`model_diagnostics.py`**: Automated diagnostic checking and report generation. Functions: `check_diagnostics()` for quick checks, `create_diagnostic_report()` for comprehensive analysis with plots.

- **`model_comparison.py`**: Model comparison utilities using LOO/WAIC. Functions: `compare_models()`, `check_loo_reliability()`, `model_averaging()`.

### Templates (`assets/`)

- **`linear_regression_template.py`**: Complete template for Bayesian linear regression with full workflow (data prep, prior checks, fitting, diagnostics, predictions).

- **`hierarchical_model_template.py`**: Complete template for hierarchical/multilevel models with non-centered parameterization and group-level analysis.

## Quick Reference

### Model Building
```python
with pm.Model(coords={'var': names}) as model:
    # Priors
    param = pm.Normal('param', mu=0, sigma=1, dims='var')
    # Likelihood
    y = pm.Normal('y', mu=..., sigma=..., observed=data)
```

### Sampling
```python
idata = pm.sample(draws=2000, tune=1000, chains=4, target_accept=0.9)
```

### Diagnostics
```python
from scripts.model_diagnostics import check_diagnostics
check_diagnostics(idata)
```

### Model Comparison
```python
from scripts.model_comparison import compare_models
compare_models({'m1': idata1, 'm2': idata2}, ic='loo')
```

### Predictions
```python
with model:
    pm.set_data({'X': X_new})
    pred = pm.sample_posterior_predictive(idata.posterior)
```

## Additional Notes

- PyMC integrates with ArviZ for visualization and diagnostics
- Use `pm.model_to_graphviz(model)` to visualize model structure
- Save results with `idata.to_netcdf('results.nc')`
- Load with `az.from_netcdf('results.nc')`
- For very large models, consider minibatch ADVI or data subsampling

