# PyMC Sampling and Inference Methods

This reference covers the sampling algorithms and inference methods available in PyMC for posterior inference.

## MCMC Sampling Methods

### Primary Sampling Function

**`pm.sample(draws=1000, tune=1000, chains=4, **kwargs)`**

The main interface for MCMC sampling in PyMC.

**Key Parameters:**
- `draws`: Number of samples to draw per chain (default: 1000)
- `tune`: Number of tuning/warmup samples (default: 1000, discarded)
- `chains`: Number of parallel chains (default: 4)
- `cores`: Number of CPU cores to use (default: all available)
- `target_accept`: Target acceptance rate for step size tuning (default: 0.8, increase to 0.9-0.95 for difficult posteriors)
- `random_seed`: Random seed for reproducibility
- `return_inferencedata`: Return ArviZ InferenceData object (default: True)
- `idata_kwargs`: Additional kwargs for InferenceData creation (e.g., `{"log_likelihood": True}` for model comparison)

**Returns:** InferenceData object containing posterior samples, sampling statistics, and diagnostics

**Example:**
```python
with pm.Model() as model:
    # ... define model ...
    idata = pm.sample(draws=2000, tune=1000, chains=4, target_accept=0.9)
```

### Sampling Algorithms

PyMC automatically selects appropriate samplers based on model structure, but you can specify algorithms manually.

#### NUTS (No-U-Turn Sampler)

**Default algorithm** for continuous parameters. Highly efficient Hamiltonian Monte Carlo variant.

- Automatically tunes step size and mass matrix
- Adaptive: explores posterior geometry during tuning
- Best for smooth, continuous posteriors
- Can struggle with high correlation or multimodality

**Manual specification:**
```python
with model:
    idata = pm.sample(step=pm.NUTS(target_accept=0.95))
```

**When to adjust:**
- Increase `target_accept` (0.9-0.99) if seeing divergences
- Use `init='adapt_diag'` for faster initialization (default)
- Use `init='jitter+adapt_diag'` for difficult initializations

#### Metropolis

General-purpose Metropolis-Hastings sampler.

- Works for both continuous and discrete variables
- Less efficient than NUTS for smooth continuous posteriors
- Useful for discrete parameters or non-differentiable models
- Requires manual tuning

**Example:**
```python
with model:
    idata = pm.sample(step=pm.Metropolis())
```

#### Slice Sampler

Slice sampling for univariate distributions.

- No tuning required
- Good for difficult univariate posteriors
- Can be slow for high dimensions

**Example:**
```python
with model:
    idata = pm.sample(step=pm.Slice())
```

#### CompoundStep

Combine different samplers for different parameters.

**Example:**
```python
with model:
    # Use NUTS for continuous params, Metropolis for discrete
    step1 = pm.NUTS([continuous_var1, continuous_var2])
    step2 = pm.Metropolis([discrete_var])
    idata = pm.sample(step=[step1, step2])
```

### Sampling Diagnostics

PyMC automatically computes diagnostics. Check these before trusting results:

#### Effective Sample Size (ESS)

Measures independent information in correlated samples.

- **Rule of thumb**: ESS > 400 per chain (1600 total for 4 chains)
- Low ESS indicates high autocorrelation
- Access via: `az.ess(idata)`

#### R-hat (Gelman-Rubin statistic)

Measures convergence across chains.

- **Rule of thumb**: R-hat < 1.01 for all parameters
- R-hat > 1.01 indicates non-convergence
- Access via: `az.rhat(idata)`

#### Divergences

Indicate regions where NUTS struggled.

- **Rule of thumb**: 0 divergences (or very few)
- Divergences suggest biased samples
- **Fix**: Increase `target_accept`, reparameterize, or use stronger priors
- Access via: `idata.sample_stats.diverging.sum()`

#### Energy Plot

Visualizes Hamiltonian Monte Carlo energy transitions.

```python
az.plot_energy(idata)
```

Good separation between energy distributions indicates healthy sampling.

### Handling Sampling Issues

#### Divergences

```python
# Increase target acceptance rate
idata = pm.sample(target_accept=0.95)

# Or reparameterize using non-centered parameterization
# Bad (centered):
mu = pm.Normal('mu', 0, 1)
sigma = pm.HalfNormal('sigma', 1)
x = pm.Normal('x', mu, sigma, observed=data)

# Good (non-centered):
mu = pm.Normal('mu', 0, 1)
sigma = pm.HalfNormal('sigma', 1)
x_offset = pm.Normal('x_offset', 0, 1, observed=(data - mu) / sigma)
```

#### Slow Sampling

```python
# Use fewer tuning steps if model is simple
idata = pm.sample(tune=500)

# Increase cores for parallelization
idata = pm.sample(cores=8, chains=8)

# Use variational inference for initialization
with model:
    approx = pm.fit()  # Run ADVI
    idata = pm.sample(start=approx.sample(return_inferencedata=False)[0])
```

#### High Autocorrelation

```python
# Increase draws
idata = pm.sample(draws=5000)

# Reparameterize to reduce correlation
# Consider using QR decomposition for regression models
```

## Variational Inference

Faster approximate inference for large models or quick exploration.

### ADVI (Automatic Differentiation Variational Inference)

**`pm.fit(n=10000, method='advi', **kwargs)`**

Approximates posterior with simpler distribution (typically mean-field Gaussian).

**Key Parameters:**
- `n`: Number of iterations (default: 10000)
- `method`: VI algorithm ('advi', 'fullrank_advi', 'svgd')
- `random_seed`: Random seed

**Returns:** Approximation object for sampling and analysis

**Example:**
```python
with model:
    approx = pm.fit(n=50000)
    # Draw samples from approximation
    idata = approx.sample(1000)
    # Or sample for MCMC initialization
    start = approx.sample(return_inferencedata=False)[0]
```

**Trade-offs:**
- **Pros**: Much faster than MCMC, scales to large data
- **Cons**: Approximate, may miss posterior structure, underestimates uncertainty

### Full-Rank ADVI

Captures correlations between parameters.

```python
with model:
    approx = pm.fit(method='fullrank_advi')
```

More accurate than mean-field but slower.

### SVGD (Stein Variational Gradient Descent)

Non-parametric variational inference.

```python
with model:
    approx = pm.fit(method='svgd', n=20000)
```

Better captures multimodality but more computationally expensive.

## Prior and Posterior Predictive Sampling

### Prior Predictive Sampling

Sample from the prior distribution (before seeing data).

**`pm.sample_prior_predictive(samples=500, **kwargs)`**

**Purpose:**
- Validate priors are reasonable
- Check implied predictions before fitting
- Ensure model generates plausible data

**Example:**
```python
with model:
    prior_pred = pm.sample_prior_predictive(samples=1000)

# Visualize prior predictions
az.plot_ppc(prior_pred, group='prior')
```

### Posterior Predictive Sampling

Sample from posterior predictive distribution (after fitting).

**`pm.sample_posterior_predictive(trace, **kwargs)`**

**Purpose:**
- Model validation via posterior predictive checks
- Generate predictions for new data
- Assess goodness-of-fit

**Example:**
```python
with model:
    # After sampling
    idata = pm.sample()

    # Add posterior predictive samples
    pm.sample_posterior_predictive(idata, extend_inferencedata=True)

# Posterior predictive check
az.plot_ppc(idata)
```

### Predictions for New Data

Update data and sample predictive distribution:

```python
with model:
    # Original model fit
    idata = pm.sample()

    # Update with new predictor values
    pm.set_data({'X': X_new})

    # Sample predictions
    post_pred_new = pm.sample_posterior_predictive(
        idata.posterior,
        var_names=['y_pred']
    )
```

## Maximum A Posteriori (MAP) Estimation

Find posterior mode (point estimate).

**`pm.find_MAP(start=None, method='L-BFGS-B', **kwargs)`**

**When to use:**
- Quick point estimates
- Initialization for MCMC
- When full posterior not needed

**Example:**
```python
with model:
    map_estimate = pm.find_MAP()
    print(map_estimate)
```

**Limitations:**
- Doesn't quantify uncertainty
- Can find local optima in multimodal posteriors
- Sensitive to prior specification

## Inference Recommendations

### Standard Workflow

1. **Start with ADVI** for quick exploration:
   ```python
   approx = pm.fit(n=20000)
   ```

2. **Run MCMC** for full inference:
   ```python
   idata = pm.sample(draws=2000, tune=1000)
   ```

3. **Check diagnostics**:
   ```python
   az.summary(idata, var_names=['~mu_log__'])  # Exclude transformed vars
   ```

4. **Sample posterior predictive**:
   ```python
   pm.sample_posterior_predictive(idata, extend_inferencedata=True)
   ```

### Choosing Inference Method

| Scenario | Recommended Method |
|----------|-------------------|
| Small-medium models, need full uncertainty | MCMC with NUTS |
| Large models, initial exploration | ADVI |
| Discrete parameters | Metropolis or marginalize |
| Hierarchical models with divergences | Non-centered parameterization + NUTS |
| Very large data | Minibatch ADVI |
| Quick point estimates | MAP or ADVI |

### Reparameterization Tricks

**Non-centered parameterization** for hierarchical models:

```python
# Centered (can cause divergences):
mu = pm.Normal('mu', 0, 10)
sigma = pm.HalfNormal('sigma', 1)
theta = pm.Normal('theta', mu, sigma, shape=n_groups)

# Non-centered (better sampling):
mu = pm.Normal('mu', 0, 10)
sigma = pm.HalfNormal('sigma', 1)
theta_offset = pm.Normal('theta_offset', 0, 1, shape=n_groups)
theta = pm.Deterministic('theta', mu + sigma * theta_offset)
```

**QR decomposition** for correlated predictors:

```python
import numpy as np

# QR decomposition
Q, R = np.linalg.qr(X)

with pm.Model():
    # Uncorrelated coefficients
    beta_tilde = pm.Normal('beta_tilde', 0, 1, shape=p)

    # Transform back to original scale
    beta = pm.Deterministic('beta', pm.math.solve(R, beta_tilde))

    mu = pm.math.dot(Q, beta_tilde)
    sigma = pm.HalfNormal('sigma', 1)
    y = pm.Normal('y', mu, sigma, observed=y_obs)
```

## Advanced Sampling

### Sequential Monte Carlo (SMC)

For complex posteriors or model evidence estimation:

```python
with model:
    idata = pm.sample_smc(draws=2000, chains=4)
```

Good for multimodal posteriors or when NUTS struggles.

### Custom Initialization

Provide starting values:

```python
start = {'mu': 0, 'sigma': 1}
with model:
    idata = pm.sample(start=start)
```

Or use MAP estimate:

```python
with model:
    start = pm.find_MAP()
    idata = pm.sample(start=start)
```
