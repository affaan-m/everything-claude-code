"""
PyMC Linear Regression Template

This template provides a complete workflow for Bayesian linear regression,
including data preparation, model building, diagnostics, and predictions.

Customize the sections marked with # TODO
"""

import pymc as pm
import arviz as az
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# =============================================================================
# 1. DATA PREPARATION
# =============================================================================

# TODO: Load your data
# Example:
# df = pd.read_csv('data.csv')
# X = df[['predictor1', 'predictor2', 'predictor3']].values
# y = df['outcome'].values

# For demonstration:
np.random.seed(42)
n_samples = 100
n_predictors = 3

X = np.random.randn(n_samples, n_predictors)
true_beta = np.array([1.5, -0.8, 2.1])
true_alpha = 0.5
y = true_alpha + X @ true_beta + np.random.randn(n_samples) * 0.5

# Standardize predictors for better sampling
X_mean = X.mean(axis=0)
X_std = X.std(axis=0)
X_scaled = (X - X_mean) / X_std

# =============================================================================
# 2. BUILD MODEL
# =============================================================================

# TODO: Customize predictor names
predictor_names = ['predictor1', 'predictor2', 'predictor3']

coords = {
    'predictors': predictor_names,
    'obs_id': np.arange(len(y))
}

with pm.Model(coords=coords) as linear_model:
    # Priors
    # TODO: Adjust prior parameters based on your domain knowledge
    alpha = pm.Normal('alpha', mu=0, sigma=1)
    beta = pm.Normal('beta', mu=0, sigma=1, dims='predictors')
    sigma = pm.HalfNormal('sigma', sigma=1)

    # Linear predictor
    mu = alpha + pm.math.dot(X_scaled, beta)

    # Likelihood
    y_obs = pm.Normal('y_obs', mu=mu, sigma=sigma, observed=y, dims='obs_id')

# =============================================================================
# 3. PRIOR PREDICTIVE CHECK
# =============================================================================

print("Running prior predictive check...")
with linear_model:
    prior_pred = pm.sample_prior_predictive(samples=1000, random_seed=42)

# Visualize prior predictions
fig, ax = plt.subplots(figsize=(10, 6))
az.plot_ppc(prior_pred, group='prior', num_pp_samples=100, ax=ax)
ax.set_title('Prior Predictive Check')
plt.tight_layout()
plt.savefig('prior_predictive_check.png', dpi=300, bbox_inches='tight')
print("Prior predictive check saved to 'prior_predictive_check.png'")

# =============================================================================
# 4. FIT MODEL
# =============================================================================

print("\nFitting model...")
with linear_model:
    # Optional: Quick ADVI exploration
    # approx = pm.fit(n=20000, random_seed=42)

    # MCMC sampling
    idata = pm.sample(
        draws=2000,
        tune=1000,
        chains=4,
        target_accept=0.9,
        random_seed=42,
        idata_kwargs={'log_likelihood': True}
    )

print("Sampling complete!")

# =============================================================================
# 5. CHECK DIAGNOSTICS
# =============================================================================

print("\n" + "="*60)
print("DIAGNOSTICS")
print("="*60)

# Summary statistics
summary = az.summary(idata, var_names=['alpha', 'beta', 'sigma'])
print("\nParameter Summary:")
print(summary)

# Check convergence
bad_rhat = summary[summary['r_hat'] > 1.01]
if len(bad_rhat) > 0:
    print(f"\n⚠️  WARNING: {len(bad_rhat)} parameters with R-hat > 1.01")
    print(bad_rhat[['r_hat']])
else:
    print("\n✓ All R-hat values < 1.01 (good convergence)")

# Check effective sample size
low_ess = summary[summary['ess_bulk'] < 400]
if len(low_ess) > 0:
    print(f"\n⚠️  WARNING: {len(low_ess)} parameters with ESS < 400")
    print(low_ess[['ess_bulk', 'ess_tail']])
else:
    print("\n✓ All ESS values > 400 (sufficient samples)")

# Check divergences
divergences = idata.sample_stats.diverging.sum().item()
if divergences > 0:
    print(f"\n⚠️  WARNING: {divergences} divergent transitions")
    print("   Consider increasing target_accept or reparameterizing")
else:
    print("\n✓ No divergences")

# Trace plots
fig, axes = plt.subplots(len(['alpha', 'beta', 'sigma']), 2, figsize=(12, 8))
az.plot_trace(idata, var_names=['alpha', 'beta', 'sigma'], axes=axes)
plt.tight_layout()
plt.savefig('trace_plots.png', dpi=300, bbox_inches='tight')
print("\nTrace plots saved to 'trace_plots.png'")

# =============================================================================
# 6. POSTERIOR PREDICTIVE CHECK
# =============================================================================

print("\nRunning posterior predictive check...")
with linear_model:
    pm.sample_posterior_predictive(idata, extend_inferencedata=True, random_seed=42)

# Visualize fit
fig, ax = plt.subplots(figsize=(10, 6))
az.plot_ppc(idata, num_pp_samples=100, ax=ax)
ax.set_title('Posterior Predictive Check')
plt.tight_layout()
plt.savefig('posterior_predictive_check.png', dpi=300, bbox_inches='tight')
print("Posterior predictive check saved to 'posterior_predictive_check.png'")

# =============================================================================
# 7. ANALYZE RESULTS
# =============================================================================

# Posterior distributions
fig, axes = plt.subplots(1, 3, figsize=(15, 4))
az.plot_posterior(idata, var_names=['alpha', 'beta', 'sigma'], ax=axes)
plt.tight_layout()
plt.savefig('posterior_distributions.png', dpi=300, bbox_inches='tight')
print("Posterior distributions saved to 'posterior_distributions.png'")

# Forest plot for coefficients
fig, ax = plt.subplots(figsize=(8, 6))
az.plot_forest(idata, var_names=['beta'], combined=True, ax=ax)
ax.set_title('Coefficient Estimates (95% HDI)')
ax.set_yticklabels(predictor_names)
plt.tight_layout()
plt.savefig('coefficient_forest_plot.png', dpi=300, bbox_inches='tight')
print("Forest plot saved to 'coefficient_forest_plot.png'")

# Print coefficient estimates
print("\n" + "="*60)
print("COEFFICIENT ESTIMATES")
print("="*60)
beta_samples = idata.posterior['beta']
for i, name in enumerate(predictor_names):
    mean = beta_samples.sel(predictors=name).mean().item()
    hdi = az.hdi(beta_samples.sel(predictors=name), hdi_prob=0.95)
    print(f"{name:20s}: {mean:7.3f}  [95% HDI: {hdi.values[0]:7.3f}, {hdi.values[1]:7.3f}]")

# =============================================================================
# 8. PREDICTIONS FOR NEW DATA
# =============================================================================

# TODO: Provide new data for predictions
# X_new = np.array([[...], [...], ...])  # New predictor values

# For demonstration, use some test data
X_new = np.random.randn(10, n_predictors)
X_new_scaled = (X_new - X_mean) / X_std

# Update model data and predict
with linear_model:
    pm.set_data({'X_scaled': X_new_scaled, 'obs_id': np.arange(len(X_new))})

    post_pred = pm.sample_posterior_predictive(
        idata.posterior,
        var_names=['y_obs'],
        random_seed=42
    )

# Extract predictions
y_pred_samples = post_pred.posterior_predictive['y_obs']
y_pred_mean = y_pred_samples.mean(dim=['chain', 'draw']).values
y_pred_hdi = az.hdi(y_pred_samples, hdi_prob=0.95).values

print("\n" + "="*60)
print("PREDICTIONS FOR NEW DATA")
print("="*60)
print(f"{'Index':<10} {'Mean':<15} {'95% HDI Lower':<15} {'95% HDI Upper':<15}")
print("-"*60)
for i in range(len(X_new)):
    print(f"{i:<10} {y_pred_mean[i]:<15.3f} {y_pred_hdi[i, 0]:<15.3f} {y_pred_hdi[i, 1]:<15.3f}")

# =============================================================================
# 9. SAVE RESULTS
# =============================================================================

# Save InferenceData
idata.to_netcdf('linear_regression_results.nc')
print("\nResults saved to 'linear_regression_results.nc'")

# Save summary to CSV
summary.to_csv('model_summary.csv')
print("Summary saved to 'model_summary.csv'")

print("\n" + "="*60)
print("ANALYSIS COMPLETE")
print("="*60)
