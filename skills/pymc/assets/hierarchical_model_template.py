"""
PyMC Hierarchical/Multilevel Model Template

This template provides a complete workflow for Bayesian hierarchical models,
useful for grouped/nested data (e.g., students within schools, patients within hospitals).

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

# TODO: Load your data with group structure
# Example:
# df = pd.read_csv('data.csv')
# groups = df['group_id'].values
# X = df['predictor'].values
# y = df['outcome'].values

# For demonstration: Generate hierarchical data
np.random.seed(42)
n_groups = 10
n_per_group = 20
n_obs = n_groups * n_per_group

# True hierarchical structure
true_mu_alpha = 5.0
true_sigma_alpha = 2.0
true_mu_beta = 1.5
true_sigma_beta = 0.5
true_sigma = 1.0

group_alphas = np.random.normal(true_mu_alpha, true_sigma_alpha, n_groups)
group_betas = np.random.normal(true_mu_beta, true_sigma_beta, n_groups)

# Generate data
groups = np.repeat(np.arange(n_groups), n_per_group)
X = np.random.randn(n_obs)
y = group_alphas[groups] + group_betas[groups] * X + np.random.randn(n_obs) * true_sigma

# TODO: Customize group names
group_names = [f'Group_{i}' for i in range(n_groups)]

# =============================================================================
# 2. BUILD HIERARCHICAL MODEL
# =============================================================================

print("Building hierarchical model...")

coords = {
    'groups': group_names,
    'obs': np.arange(n_obs)
}

with pm.Model(coords=coords) as hierarchical_model:
    # Data containers (for later predictions)
    X_data = pm.Data('X_data', X)
    groups_data = pm.Data('groups_data', groups)

    # Hyperpriors (population-level parameters)
    # TODO: Adjust hyperpriors based on your domain knowledge
    mu_alpha = pm.Normal('mu_alpha', mu=0, sigma=10)
    sigma_alpha = pm.HalfNormal('sigma_alpha', sigma=5)

    mu_beta = pm.Normal('mu_beta', mu=0, sigma=10)
    sigma_beta = pm.HalfNormal('sigma_beta', sigma=5)

    # Group-level parameters (non-centered parameterization)
    # Non-centered parameterization improves sampling efficiency
    alpha_offset = pm.Normal('alpha_offset', mu=0, sigma=1, dims='groups')
    alpha = pm.Deterministic('alpha', mu_alpha + sigma_alpha * alpha_offset, dims='groups')

    beta_offset = pm.Normal('beta_offset', mu=0, sigma=1, dims='groups')
    beta = pm.Deterministic('beta', mu_beta + sigma_beta * beta_offset, dims='groups')

    # Observation-level model
    mu = alpha[groups_data] + beta[groups_data] * X_data

    # Observation noise
    sigma = pm.HalfNormal('sigma', sigma=5)

    # Likelihood
    y_obs = pm.Normal('y_obs', mu=mu, sigma=sigma, observed=y, dims='obs')

print("Model built successfully!")
print(f"Groups: {n_groups}")
print(f"Observations: {n_obs}")

# =============================================================================
# 3. PRIOR PREDICTIVE CHECK
# =============================================================================

print("\nRunning prior predictive check...")
with hierarchical_model:
    prior_pred = pm.sample_prior_predictive(samples=500, random_seed=42)

# Visualize prior predictions
fig, ax = plt.subplots(figsize=(10, 6))
az.plot_ppc(prior_pred, group='prior', num_pp_samples=100, ax=ax)
ax.set_title('Prior Predictive Check')
plt.tight_layout()
plt.savefig('hierarchical_prior_check.png', dpi=300, bbox_inches='tight')
print("Prior predictive check saved to 'hierarchical_prior_check.png'")

# =============================================================================
# 4. FIT MODEL
# =============================================================================

print("\nFitting hierarchical model...")
print("(This may take a few minutes due to model complexity)")

with hierarchical_model:
    # MCMC sampling with higher target_accept for hierarchical models
    idata = pm.sample(
        draws=2000,
        tune=2000,  # More tuning for hierarchical models
        chains=4,
        target_accept=0.95,  # Higher for better convergence
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

# Summary for key parameters
summary = az.summary(
    idata,
    var_names=['mu_alpha', 'sigma_alpha', 'mu_beta', 'sigma_beta', 'sigma', 'alpha', 'beta']
)
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
    print(low_ess[['ess_bulk']].head(10))
else:
    print("\n✓ All ESS values > 400 (sufficient samples)")

# Check divergences
divergences = idata.sample_stats.diverging.sum().item()
if divergences > 0:
    print(f"\n⚠️  WARNING: {divergences} divergent transitions")
    print("   This is common in hierarchical models - non-centered parameterization already applied")
    print("   Consider even higher target_accept or stronger hyperpriors")
else:
    print("\n✓ No divergences")

# Trace plots for hyperparameters
fig, axes = plt.subplots(5, 2, figsize=(12, 12))
az.plot_trace(
    idata,
    var_names=['mu_alpha', 'sigma_alpha', 'mu_beta', 'sigma_beta', 'sigma'],
    axes=axes
)
plt.tight_layout()
plt.savefig('hierarchical_trace_plots.png', dpi=300, bbox_inches='tight')
print("\nTrace plots saved to 'hierarchical_trace_plots.png'")

# =============================================================================
# 6. POSTERIOR PREDICTIVE CHECK
# =============================================================================

print("\nRunning posterior predictive check...")
with hierarchical_model:
    pm.sample_posterior_predictive(idata, extend_inferencedata=True, random_seed=42)

# Visualize fit
fig, ax = plt.subplots(figsize=(10, 6))
az.plot_ppc(idata, num_pp_samples=100, ax=ax)
ax.set_title('Posterior Predictive Check')
plt.tight_layout()
plt.savefig('hierarchical_posterior_check.png', dpi=300, bbox_inches='tight')
print("Posterior predictive check saved to 'hierarchical_posterior_check.png'")

# =============================================================================
# 7. ANALYZE HIERARCHICAL STRUCTURE
# =============================================================================

print("\n" + "="*60)
print("POPULATION-LEVEL (HYPERPARAMETER) ESTIMATES")
print("="*60)

# Population-level estimates
hyper_summary = summary.loc[['mu_alpha', 'sigma_alpha', 'mu_beta', 'sigma_beta', 'sigma']]
print(hyper_summary[['mean', 'sd', 'hdi_3%', 'hdi_97%']])

# Forest plot for group-level parameters
fig, axes = plt.subplots(1, 2, figsize=(14, 8))

# Group intercepts
az.plot_forest(idata, var_names=['alpha'], combined=True, ax=axes[0])
axes[0].set_title('Group-Level Intercepts (α)')
axes[0].set_yticklabels(group_names)
axes[0].axvline(idata.posterior['mu_alpha'].mean().item(), color='red', linestyle='--', label='Population mean')
axes[0].legend()

# Group slopes
az.plot_forest(idata, var_names=['beta'], combined=True, ax=axes[1])
axes[1].set_title('Group-Level Slopes (β)')
axes[1].set_yticklabels(group_names)
axes[1].axvline(idata.posterior['mu_beta'].mean().item(), color='red', linestyle='--', label='Population mean')
axes[1].legend()

plt.tight_layout()
plt.savefig('group_level_estimates.png', dpi=300, bbox_inches='tight')
print("\nGroup-level estimates saved to 'group_level_estimates.png'")

# Shrinkage visualization
fig, axes = plt.subplots(1, 2, figsize=(12, 5))

# Intercepts
alpha_samples = idata.posterior['alpha'].values.reshape(-1, n_groups)
alpha_means = alpha_samples.mean(axis=0)
mu_alpha_mean = idata.posterior['mu_alpha'].mean().item()

axes[0].scatter(range(n_groups), alpha_means, alpha=0.6)
axes[0].axhline(mu_alpha_mean, color='red', linestyle='--', label='Population mean')
axes[0].set_xlabel('Group')
axes[0].set_ylabel('Intercept')
axes[0].set_title('Group Intercepts (showing shrinkage to population mean)')
axes[0].legend()

# Slopes
beta_samples = idata.posterior['beta'].values.reshape(-1, n_groups)
beta_means = beta_samples.mean(axis=0)
mu_beta_mean = idata.posterior['mu_beta'].mean().item()

axes[1].scatter(range(n_groups), beta_means, alpha=0.6)
axes[1].axhline(mu_beta_mean, color='red', linestyle='--', label='Population mean')
axes[1].set_xlabel('Group')
axes[1].set_ylabel('Slope')
axes[1].set_title('Group Slopes (showing shrinkage to population mean)')
axes[1].legend()

plt.tight_layout()
plt.savefig('shrinkage_plot.png', dpi=300, bbox_inches='tight')
print("Shrinkage plot saved to 'shrinkage_plot.png'")

# =============================================================================
# 8. PREDICTIONS FOR NEW DATA
# =============================================================================

# TODO: Specify new data
# For existing groups:
# new_X = np.array([...])
# new_groups = np.array([0, 1, 2, ...])  # Existing group indices

# For a new group (predict using population-level parameters):
# Just use mu_alpha and mu_beta

print("\n" + "="*60)
print("PREDICTIONS FOR NEW DATA")
print("="*60)

# Example: Predict for existing groups
new_X = np.array([-2, -1, 0, 1, 2])
new_groups = np.array([0, 2, 4, 6, 8])  # Select some groups

with hierarchical_model:
    pm.set_data({'X_data': new_X, 'groups_data': new_groups, 'obs': np.arange(len(new_X))})

    post_pred = pm.sample_posterior_predictive(
        idata.posterior,
        var_names=['y_obs'],
        random_seed=42
    )

y_pred_samples = post_pred.posterior_predictive['y_obs']
y_pred_mean = y_pred_samples.mean(dim=['chain', 'draw']).values
y_pred_hdi = az.hdi(y_pred_samples, hdi_prob=0.95).values

print(f"Predictions for existing groups:")
print(f"{'Group':<10} {'X':<10} {'Mean':<15} {'95% HDI Lower':<15} {'95% HDI Upper':<15}")
print("-"*65)
for i, g in enumerate(new_groups):
    print(f"{group_names[g]:<10} {new_X[i]:<10.2f} {y_pred_mean[i]:<15.3f} {y_pred_hdi[i, 0]:<15.3f} {y_pred_hdi[i, 1]:<15.3f}")

# Predict for a new group (using population parameters)
print(f"\nPrediction for a NEW group (using population-level parameters):")
new_X_newgroup = np.array([0.0])

# Manually compute using population parameters
mu_alpha_samples = idata.posterior['mu_alpha'].values.flatten()
mu_beta_samples = idata.posterior['mu_beta'].values.flatten()
sigma_samples = idata.posterior['sigma'].values.flatten()

# Predicted mean for new group
y_pred_newgroup = mu_alpha_samples + mu_beta_samples * new_X_newgroup[0]
y_pred_mean_newgroup = y_pred_newgroup.mean()
y_pred_hdi_newgroup = az.hdi(y_pred_newgroup, hdi_prob=0.95)

print(f"X = {new_X_newgroup[0]:.2f}")
print(f"Predicted mean: {y_pred_mean_newgroup:.3f}")
print(f"95% HDI: [{y_pred_hdi_newgroup[0]:.3f}, {y_pred_hdi_newgroup[1]:.3f}]")

# =============================================================================
# 9. SAVE RESULTS
# =============================================================================

idata.to_netcdf('hierarchical_model_results.nc')
print("\nResults saved to 'hierarchical_model_results.nc'")

summary.to_csv('hierarchical_model_summary.csv')
print("Summary saved to 'hierarchical_model_summary.csv'")

print("\n" + "="*60)
print("ANALYSIS COMPLETE")
print("="*60)
