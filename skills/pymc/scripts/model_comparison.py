"""
PyMC Model Comparison Script

Utilities for comparing multiple Bayesian models using information criteria
and cross-validation metrics.

Usage:
    from scripts.model_comparison import compare_models, plot_model_comparison

    # Compare multiple models
    comparison = compare_models(
        {'model1': idata1, 'model2': idata2, 'model3': idata3},
        ic='loo'
    )

    # Visualize comparison
    plot_model_comparison(comparison, output_path='model_comparison.png')
"""

import arviz as az
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from typing import Dict


def compare_models(models_dict: Dict[str, az.InferenceData],
                   ic='loo',
                   scale='deviance',
                   verbose=True):
    """
    Compare multiple models using information criteria.

    Parameters
    ----------
    models_dict : dict
        Dictionary mapping model names to InferenceData objects.
        All models must have log_likelihood computed.
    ic : str
        Information criterion to use: 'loo' (default) or 'waic'
    scale : str
        Scale for IC: 'deviance' (default), 'log', or 'negative_log'
    verbose : bool
        Print detailed comparison results (default: True)

    Returns
    -------
    pd.DataFrame
        Comparison DataFrame with model rankings and statistics

    Notes
    -----
    Models must be fit with idata_kwargs={'log_likelihood': True} or
    log-likelihood computed afterwards with pm.compute_log_likelihood().
    """
    if verbose:
        print("="*70)
        print(f" " * 25 + f"MODEL COMPARISON ({ic.upper()})")
        print("="*70)

    # Perform comparison
    comparison = az.compare(models_dict, ic=ic, scale=scale)

    if verbose:
        print("\nModel Rankings:")
        print("-"*70)
        print(comparison.to_string())

        print("\n" + "="*70)
        print("INTERPRETATION GUIDE")
        print("="*70)
        print(f"• rank:     Model ranking (0 = best)")
        print(f"• {ic}:       {ic.upper()} estimate (lower is better)")
        print(f"• p_{ic}:     Effective number of parameters")
        print(f"• d{ic}:      Difference from best model")
        print(f"• weight:   Model probability (pseudo-BMA)")
        print(f"• se:       Standard error of {ic.upper()}")
        print(f"• dse:      Standard error of the difference")
        print(f"• warning:  True if model has reliability issues")
        print(f"• scale:    {scale}")

        print("\n" + "="*70)
        print("MODEL SELECTION GUIDELINES")
        print("="*70)

        best_model = comparison.index[0]
        print(f"\n✓ Best model: {best_model}")

        # Check for clear winner
        if len(comparison) > 1:
            delta = comparison.iloc[1][f'd{ic}']
            delta_se = comparison.iloc[1]['dse']

            if delta > 10:
                print(f"  → STRONG evidence for {best_model} (Δ{ic} > 10)")
            elif delta > 4:
                print(f"  → MODERATE evidence for {best_model} (4 < Δ{ic} < 10)")
            elif delta > 2:
                print(f"  → WEAK evidence for {best_model} (2 < Δ{ic} < 4)")
            else:
                print(f"  → Models are SIMILAR (Δ{ic} < 2)")
                print(f"    Consider model averaging or choose based on simplicity")

            # Check if difference is significant relative to SE
            if delta > 2 * delta_se:
                print(f"  → Difference is > 2 SE, likely reliable")
            else:
                print(f"  → Difference is < 2 SE, uncertain distinction")

        # Check for warnings
        if comparison['warning'].any():
            print("\n⚠️  WARNING: Some models have reliability issues")
            warned_models = comparison[comparison['warning']].index.tolist()
            print(f"   Models with warnings: {', '.join(warned_models)}")
            print(f"   → Check Pareto-k diagnostics with check_loo_reliability()")

    return comparison


def check_loo_reliability(models_dict: Dict[str, az.InferenceData],
                          threshold=0.7,
                          verbose=True):
    """
    Check LOO-CV reliability using Pareto-k diagnostics.

    Parameters
    ----------
    models_dict : dict
        Dictionary mapping model names to InferenceData objects
    threshold : float
        Pareto-k threshold for flagging observations (default: 0.7)
    verbose : bool
        Print detailed diagnostics (default: True)

    Returns
    -------
    dict
        Dictionary with Pareto-k diagnostics for each model
    """
    if verbose:
        print("="*70)
        print(" " * 20 + "LOO RELIABILITY CHECK")
        print("="*70)

    results = {}

    for name, idata in models_dict.items():
        if verbose:
            print(f"\n{name}:")
            print("-"*70)

        # Compute LOO with pointwise results
        loo_result = az.loo(idata, pointwise=True)
        pareto_k = loo_result.pareto_k.values

        # Count problematic observations
        n_high = (pareto_k > threshold).sum()
        n_very_high = (pareto_k > 1.0).sum()

        results[name] = {
            'pareto_k': pareto_k,
            'n_high': n_high,
            'n_very_high': n_very_high,
            'max_k': pareto_k.max(),
            'loo': loo_result
        }

        if verbose:
            print(f"Pareto-k diagnostics:")
            print(f"  • Good (k < 0.5):       {(pareto_k < 0.5).sum()} observations")
            print(f"  • OK (0.5 ≤ k < 0.7):    {((pareto_k >= 0.5) & (pareto_k < 0.7)).sum()} observations")
            print(f"  • Bad (0.7 ≤ k < 1.0):   {((pareto_k >= 0.7) & (pareto_k < 1.0)).sum()} observations")
            print(f"  • Very bad (k ≥ 1.0):    {(pareto_k >= 1.0).sum()} observations")
            print(f"  • Maximum k: {pareto_k.max():.3f}")

            if n_high > 0:
                print(f"\n⚠️  {n_high} observations with k > {threshold}")
                print("  LOO approximation may be unreliable for these points")
                print("  Solutions:")
                print("  → Use WAIC instead (less sensitive to outliers)")
                print("  → Investigate influential observations")
                print("  → Consider more flexible model")

                if n_very_high > 0:
                    print(f"\n⚠️  {n_very_high} observations with k > 1.0")
                    print("  These points have very high influence")
                    print("  → Strongly consider K-fold CV or other validation")
            else:
                print(f"✓ All Pareto-k values < {threshold}")
                print("  LOO estimates are reliable")

    return results


def plot_model_comparison(comparison, output_path=None, show=True):
    """
    Visualize model comparison results.

    Parameters
    ----------
    comparison : pd.DataFrame
        Comparison DataFrame from az.compare()
    output_path : str, optional
        If provided, save plot to this path
    show : bool
        Whether to display plot (default: True)

    Returns
    -------
    matplotlib.figure.Figure
        The comparison figure
    """
    fig = plt.figure(figsize=(10, 6))
    az.plot_compare(comparison)
    plt.title('Model Comparison', fontsize=14, fontweight='bold')
    plt.tight_layout()

    if output_path:
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        print(f"Comparison plot saved to {output_path}")

    if show:
        plt.show()
    else:
        plt.close()

    return fig


def model_averaging(models_dict: Dict[str, az.InferenceData],
                    weights=None,
                    var_name='y_obs',
                    ic='loo'):
    """
    Perform Bayesian model averaging using model weights.

    Parameters
    ----------
    models_dict : dict
        Dictionary mapping model names to InferenceData objects
    weights : array-like, optional
        Model weights. If None, computed from IC (pseudo-BMA weights)
    var_name : str
        Name of the predicted variable (default: 'y_obs')
    ic : str
        Information criterion for computing weights if not provided

    Returns
    -------
    np.ndarray
        Averaged predictions across models
    np.ndarray
        Model weights used
    """
    if weights is None:
        comparison = az.compare(models_dict, ic=ic)
        weights = comparison['weight'].values
        model_names = comparison.index.tolist()
    else:
        model_names = list(models_dict.keys())
        weights = np.array(weights)
        weights = weights / weights.sum()  # Normalize

    print("="*70)
    print(" " * 22 + "BAYESIAN MODEL AVERAGING")
    print("="*70)
    print("\nModel weights:")
    for name, weight in zip(model_names, weights):
        print(f"  {name}: {weight:.4f} ({weight*100:.2f}%)")

    # Extract predictions and average
    predictions = []
    for name in model_names:
        idata = models_dict[name]
        if 'posterior_predictive' in idata:
            pred = idata.posterior_predictive[var_name].values
        else:
            print(f"Warning: {name} missing posterior_predictive, skipping")
            continue
        predictions.append(pred)

    # Weighted average
    averaged = sum(w * p for w, p in zip(weights, predictions))

    print(f"\n✓ Model averaging complete")
    print(f"  Combined predictions using {len(predictions)} models")

    return averaged, weights


def cross_validation_comparison(models_dict: Dict[str, az.InferenceData],
                                k=10,
                                verbose=True):
    """
    Perform k-fold cross-validation comparison (conceptual guide).

    Note: This function provides guidance. Full k-fold CV requires
    re-fitting models k times, which should be done in the main script.

    Parameters
    ----------
    models_dict : dict
        Dictionary of model names to InferenceData
    k : int
        Number of folds (default: 10)
    verbose : bool
        Print guidance

    Returns
    -------
    None
    """
    if verbose:
        print("="*70)
        print(" " * 20 + "K-FOLD CROSS-VALIDATION GUIDE")
        print("="*70)
        print(f"\nTo perform {k}-fold CV:")
        print("""
1. Split data into k folds
2. For each fold:
   - Train all models on k-1 folds
   - Compute log-likelihood on held-out fold
3. Sum log-likelihoods across folds for each model
4. Compare models using total CV score

Example code:
-------------
from sklearn.model_selection import KFold

kf = KFold(n_splits=k, shuffle=True, random_seed=42)
cv_scores = {name: [] for name in models_dict.keys()}

for train_idx, test_idx in kf.split(X):
    X_train, X_test = X[train_idx], X[test_idx]
    y_train, y_test = y[train_idx], y[test_idx]

    for name in models_dict.keys():
        # Fit model on train set
        with create_model(name, X_train, y_train) as model:
            idata = pm.sample()

        # Compute log-likelihood on test set
        with model:
            pm.set_data({'X': X_test, 'y': y_test})
            log_lik = pm.compute_log_likelihood(idata).sum()

        cv_scores[name].append(log_lik)

# Compare total CV scores
for name, scores in cv_scores.items():
    print(f"{name}: {np.sum(scores):.2f}")
        """)

    print("\nNote: K-fold CV is expensive but most reliable for model comparison")
    print("      Use when LOO has reliability issues (high Pareto-k values)")


# Example usage
if __name__ == '__main__':
    print("This script provides model comparison utilities for PyMC.")
    print("\nExample usage:")
    print("""
    import pymc as pm
    from scripts.model_comparison import compare_models, check_loo_reliability

    # Fit multiple models (must include log_likelihood)
    with pm.Model() as model1:
        # ... define model 1 ...
        idata1 = pm.sample(idata_kwargs={'log_likelihood': True})

    with pm.Model() as model2:
        # ... define model 2 ...
        idata2 = pm.sample(idata_kwargs={'log_likelihood': True})

    # Compare models
    models = {'Simple': idata1, 'Complex': idata2}
    comparison = compare_models(models, ic='loo')

    # Check reliability
    reliability = check_loo_reliability(models)

    # Visualize
    plot_model_comparison(comparison, output_path='comparison.png')

    # Model averaging
    averaged_pred, weights = model_averaging(models, var_name='y_obs')
    """)
