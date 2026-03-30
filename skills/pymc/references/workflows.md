# PyMC Workflows and Common Patterns

This reference provides standard workflows and patterns for building, validating, and analyzing Bayesian models in PyMC.

## Standard Bayesian Workflow

### Complete Workflow Template

```python
import pymc as pm
import arviz as az
import numpy as np
import matplotlib.pyplot as plt

# 1. PREPARE DATA
# ===============
X = ...  # Predictor variables
y = ...  # Observed outcomes

# Standardize predictors for better sampling
X_scaled = (X - X.mean(axis=0)) / X.std(axis=0)

# 2. BUILD MODEL
# ==============
with pm.Model() as model:
    # Define coordinates for named dimensions
    coords = {
        'predictors': ['var1', 'var2', 'var3'],
        'obs_id': np.arange(len(y))
    }

    # Priors
    alpha = pm.Normal('alpha', mu=0, sigma=1)
    beta = pm.Normal('beta', mu=0, sigma=1, dims='predictors')
    sigma = pm.HalfNormal('sigma', sigma=1)

    # Linear predictor
    mu = alpha + pm.math.dot(X_scaled, beta)

    # Likelihood
    y_obs = pm.Normal('y_obs', mu=mu, sigma=sigma, observed=y, dims='obs_id')

# 3. PRIOR PREDICTIVE CHECK
# ==========================
with model:
    prior_pred = pm.sample_prior_predictive(samples=1000, random_seed=42)

# Visualize prior predictions
az.plot_ppc(prior_pred, group='prior', num_pp_samples=100)
plt.title('Prior Predictive Check')
plt.show()

# 4. FIT MODEL
# ============
with model:
    # Quick VI exploration (optional)
    approx = pm.fit(n=20000, random_seed=42)

    # Full MCMC inference
    idata = pm.sample(
        draws=2000,
        tune=1000,
        chains=4,
        target_accept=0.9,
        random_seed=42,
        idata_kwargs={'log_likelihood': True}  # For model comparison
    )

# 5. CHECK DIAGNOSTICS
# ====================
# Summary statistics
print(az.summary(idata, var_names=['alpha', 'beta', 'sigma']))

# R-hat and ESS
summary = az.summary(idata)
if (summary['r_hat'] > 1.01).any():
    print("WARNING: Some R-hat values > 1.01, chains may not have converged")

if (summary['ess_bulk'] < 400).any():
    print("WARNING: Some ESS values < 400, consider more samples")

# Check divergences
divergences = idata.sample_stats.diverging.sum().item()
print(f"Number of divergences: {divergences}")

# Trace plots
az.plot_trace(idata, var_names=['alpha', 'beta', 'sigma'])
plt.tight_layout()
plt.show()

# 6. POSTERIOR PREDICTIVE CHECK
# ==============================
with model:
    pm.sample_posterior_predictive(idata, extend_inferencedata=True, random_seed=42)

# Visualize fit
az.plot_ppc(idata, num_pp_samples=100)
plt.title('Posterior Predictive Check')
plt.show()

# 7. ANALYZE RESULTS
# ==================
# Posterior distributions
az.plot_posterior(idata, var_names=['alpha', 'beta', 'sigma'])
plt.tight_layout()
plt.show()

# Forest plot for coefficients
az.plot_forest(idata, var_names=['beta'], combined=True)
plt.title('Coefficient Estimates')
plt.show()

# 8. PREDICTIONS FOR NEW DATA
# ============================
X_new = ...  # New predictor values
X_new_scaled = (X_new - X.mean(axis=0)) / X.std(axis=0)

with model:
    # Update data
    pm.set_data({'X': X_new_scaled})

    # Sample predictions
    post_pred = pm.sample_posterior_predictive(
        idata.posterior,
        var_names=['y_obs'],
        random_seed=42
    )

# Prediction intervals
y_pred_mean = post_pred.posterior_predictive['y_obs'].mean(dim=['chain', 'draw'])
y_pred_hdi = az.hdi(post_pred.posterior_predictive, var_names=['y_obs'])

# 9. SAVE RESULTS
# ===============
idata.to_netcdf('model_results.nc')  # Save for later
```

## Model Building Patterns

### Linear Regression

```python
with pm.Model() as linear_model:
    # Priors
    alpha = pm.Normal('alpha', mu=0, sigma=10)
    beta = pm.Normal('beta', mu=0, sigma=10, shape=n_predictors)
    sigma = pm.HalfNormal('sigma', sigma=1)

    # Linear predictor
    mu = alpha + pm.math.dot(X, beta)

    # Likelihood
    y = pm.Normal('y', mu=mu, sigma=sigma, observed=y_obs)
```

### Logistic Regression

```python
with pm.Model() as logistic_model:
    # Priors
    alpha = pm.Normal('alpha', mu=0, sigma=10)
    beta = pm.Normal('beta', mu=0, sigma=10, shape=n_predictors)

    # Linear predictor
    logit_p = alpha + pm.math.dot(X, beta)

    # Likelihood
    y = pm.Bernoulli('y', logit_p=logit_p, observed=y_obs)
```

### Hierarchical/Multilevel Model

```python
with pm.Model(coords={'group': group_names, 'obs': np.arange(n_obs)}) as hierarchical_model:
    # Hyperpriors
    mu_alpha = pm.Normal('mu_alpha', mu=0, sigma=10)
    sigma_alpha = pm.HalfNormal('sigma_alpha', sigma=1)

    mu_beta = pm.Normal('mu_beta', mu=0, sigma=10)
    sigma_beta = pm.HalfNormal('sigma_beta', sigma=1)

    # Group-level parameters (non-centered)
    alpha_offset = pm.Normal('alpha_offset', mu=0, sigma=1, dims='group')
    alpha = pm.Deterministic('alpha', mu_alpha + sigma_alpha * alpha_offset, dims='group')

    beta_offset = pm.Normal('beta_offset', mu=0, sigma=1, dims='group')
    beta = pm.Deterministic('beta', mu_beta + sigma_beta * beta_offset, dims='group')

    # Observation-level model
    mu = alpha[group_idx] + beta[group_idx] * X

    sigma = pm.HalfNormal('sigma', sigma=1)
    y = pm.Normal('y', mu=mu, sigma=sigma, observed=y_obs, dims='obs')
```

### Poisson Regression (Count Data)

```python
with pm.Model() as poisson_model:
    # Priors
    alpha = pm.Normal('alpha', mu=0, sigma=10)
    beta = pm.Normal('beta', mu=0, sigma=10, shape=n_predictors)

    # Linear predictor on log scale
    log_lambda = alpha + pm.math.dot(X, beta)

    # Likelihood
    y = pm.Poisson('y', mu=pm.math.exp(log_lambda), observed=y_obs)
```

### Time Series (Autoregressive)

```python
with pm.Model() as ar_model:
    # Innovation standard deviation
    sigma = pm.HalfNormal('sigma', sigma=1)

    # AR coefficients
    rho = pm.Normal('rho', mu=0, sigma=0.5, shape=ar_order)

    # Initial distribution
    init_dist = pm.Normal.dist(mu=0, sigma=sigma)

    # AR process
    y = pm.AR('y', rho=rho, sigma=sigma, init_dist=init_dist, observed=y_obs)
```

### Mixture Model

```python
with pm.Model() as mixture_model:
    # Component weights
    w = pm.Dirichlet('w', a=np.ones(n_components))

    # Component parameters
    mu = pm.Normal('mu', mu=0, sigma=10, shape=n_components)
    sigma = pm.HalfNormal('sigma', sigma=1, shape=n_components)

    # Mixture
    components = [pm.Normal.dist(mu=mu[i], sigma=sigma[i]) for i in range(n_components)]
    y = pm.Mixture('y', w=w, comp_dists=components, observed=y_obs)
```

## Data Preparation Best Practices

### Standardization

Standardize continuous predictors for better sampling:

```python
# Standardize
X_mean = X.mean(axis=0)
X_std = X.std(axis=0)
X_scaled = (X - X_mean) / X_std

# Model with scaled data
with pm.Model() as model:
    beta_scaled = pm.Normal('beta_scaled', 0, 1)
    # ... rest of model ...

# Transform back to original scale
beta_original = beta_scaled / X_std
alpha_original = alpha - (beta_scaled * X_mean / X_std).sum()
```

### Handling Missing Data

Treat missing values as parameters:

```python
# Identify missing values
missing_idx = np.isnan(X)
X_observed = np.where(missing_idx, 0, X)  # Placeholder

with pm.Model() as model:
    # Prior for missing values
    X_missing = pm.Normal('X_missing', mu=0, sigma=1, shape=missing_idx.sum())

    # Combine observed and imputed
    X_complete = pm.math.switch(missing_idx.flatten(), X_missing, X_observed.flatten())

    # ... rest of model using X_complete ...
```

### Centering and Scaling

For regression models, center predictors and outcome:

```python
# Center
X_centered = X - X.mean(axis=0)
y_centered = y - y.mean()

with pm.Model() as model:
    # Simpler prior on intercept
    alpha = pm.Normal('alpha', mu=0, sigma=1)  # Intercept near 0 when centered
    beta = pm.Normal('beta', mu=0, sigma=1, shape=n_predictors)

    mu = alpha + pm.math.dot(X_centered, beta)
    sigma = pm.HalfNormal('sigma', sigma=1)

    y_obs = pm.Normal('y_obs', mu=mu, sigma=sigma, observed=y_centered)
```

## Prior Selection Guidelines

### Weakly Informative Priors

Use when you have limited prior knowledge:

```python
# For standardized predictors
beta = pm.Normal('beta', mu=0, sigma=1)

# For scale parameters
sigma = pm.HalfNormal('sigma', sigma=1)

# For probabilities
p = pm.Beta('p', alpha=2, beta=2)  # Slight preference for middle values
```

### Informative Priors

Use domain knowledge:

```python
# Effect size from literature: Cohen's d ≈ 0.3
beta = pm.Normal('beta', mu=0.3, sigma=0.1)

# Physical constraint: probability between 0.7-0.9
p = pm.Beta('p', alpha=8, beta=2)  # Check with prior predictive!
```

### Prior Predictive Checks

Always validate priors:

```python
with model:
    prior_pred = pm.sample_prior_predictive(samples=1000)

# Check if predictions are reasonable
print(f"Prior predictive range: {prior_pred.prior_predictive['y'].min():.2f} to {prior_pred.prior_predictive['y'].max():.2f}")
print(f"Observed range: {y_obs.min():.2f} to {y_obs.max():.2f}")

# Visualize
az.plot_ppc(prior_pred, group='prior')
```

## Model Comparison Workflow

### Comparing Multiple Models

```python
import arviz as az

# Fit multiple models
models = {}
idatas = {}

# Model 1: Simple linear
with pm.Model() as models['linear']:
    # ... define model ...
    idatas['linear'] = pm.sample(idata_kwargs={'log_likelihood': True})

# Model 2: With interaction
with pm.Model() as models['interaction']:
    # ... define model ...
    idatas['interaction'] = pm.sample(idata_kwargs={'log_likelihood': True})

# Model 3: Hierarchical
with pm.Model() as models['hierarchical']:
    # ... define model ...
    idatas['hierarchical'] = pm.sample(idata_kwargs={'log_likelihood': True})

# Compare using LOO
comparison = az.compare(idatas, ic='loo')
print(comparison)

# Visualize comparison
az.plot_compare(comparison)
plt.show()

# Check LOO reliability
for name, idata in idatas.items():
    loo = az.loo(idata, pointwise=True)
    high_pareto_k = (loo.pareto_k > 0.7).sum().item()
    if high_pareto_k > 0:
        print(f"Warning: {name} has {high_pareto_k} observations with high Pareto-k")
```

### Model Weights

```python
# Get model weights (pseudo-BMA)
weights = comparison['weight'].values

print("Model probabilities:")
for name, weight in zip(comparison.index, weights):
    print(f"  {name}: {weight:.2%}")

# Model averaging (weighted predictions)
def weighted_predictions(idatas, weights):
    preds = []
    for (name, idata), weight in zip(idatas.items(), weights):
        pred = idata.posterior_predictive['y_obs'].mean(dim=['chain', 'draw'])
        preds.append(weight * pred)
    return sum(preds)

averaged_pred = weighted_predictions(idatas, weights)
```

## Diagnostics and Troubleshooting

### Diagnosing Sampling Problems

```python
def diagnose_sampling(idata, var_names=None):
    """Comprehensive sampling diagnostics"""

    # Check convergence
    summary = az.summary(idata, var_names=var_names)

    print("=== Convergence Diagnostics ===")
    bad_rhat = summary[summary['r_hat'] > 1.01]
    if len(bad_rhat) > 0:
        print(f"⚠️  {len(bad_rhat)} variables with R-hat > 1.01")
        print(bad_rhat[['r_hat']])
    else:
        print("✓ All R-hat values < 1.01")

    # Check effective sample size
    print("\n=== Effective Sample Size ===")
    low_ess = summary[summary['ess_bulk'] < 400]
    if len(low_ess) > 0:
        print(f"⚠️  {len(low_ess)} variables with ESS < 400")
        print(low_ess[['ess_bulk', 'ess_tail']])
    else:
        print("✓ All ESS values > 400")

    # Check divergences
    print("\n=== Divergences ===")
    divergences = idata.sample_stats.diverging.sum().item()
    if divergences > 0:
        print(f"⚠️  {divergences} divergent transitions")
        print("   Consider: increase target_accept, reparameterize, or stronger priors")
    else:
        print("✓ No divergences")

    # Check tree depth
    print("\n=== NUTS Statistics ===")
    max_treedepth = idata.sample_stats.tree_depth.max().item()
    hits_max = (idata.sample_stats.tree_depth == max_treedepth).sum().item()
    if hits_max > 0:
        print(f"⚠️  Hit max treedepth {hits_max} times")
        print("   Consider: reparameterize or increase max_treedepth")
    else:
        print(f"✓ No max treedepth issues (max: {max_treedepth})")

    return summary

# Usage
diagnose_sampling(idata, var_names=['alpha', 'beta', 'sigma'])
```

### Common Fixes

| Problem | Solution |
|---------|----------|
| Divergences | Increase `target_accept=0.95`, use non-centered parameterization |
| Low ESS | Sample more draws, reparameterize to reduce correlation |
| High R-hat | Run longer chains, check for multimodality, improve initialization |
| Slow sampling | Use ADVI initialization, reparameterize, reduce model complexity |
| Biased posterior | Check prior predictive, ensure likelihood is correct |

## Using Named Dimensions (dims)

### Benefits of dims

- More readable code
- Easier subsetting and analysis
- Better xarray integration

```python
# Define coordinates
coords = {
    'predictors': ['age', 'income', 'education'],
    'groups': ['A', 'B', 'C'],
    'time': pd.date_range('2020-01-01', periods=100, freq='D')
}

with pm.Model(coords=coords) as model:
    # Use dims instead of shape
    beta = pm.Normal('beta', mu=0, sigma=1, dims='predictors')
    alpha = pm.Normal('alpha', mu=0, sigma=1, dims='groups')
    y = pm.Normal('y', mu=0, sigma=1, dims=['groups', 'time'], observed=data)

# After sampling, dimensions are preserved
idata = pm.sample()

# Easy subsetting
beta_age = idata.posterior['beta'].sel(predictors='age')
group_A = idata.posterior['alpha'].sel(groups='A')
```

## Saving and Loading Results

```python
# Save InferenceData
idata.to_netcdf('results.nc')

# Load InferenceData
loaded_idata = az.from_netcdf('results.nc')

# Save model for later predictions
import pickle

with open('model.pkl', 'wb') as f:
    pickle.dump({'model': model, 'idata': idata}, f)

# Load model
with open('model.pkl', 'rb') as f:
    saved = pickle.load(f)
    model = saved['model']
    idata = saved['idata']
```
