"""
PyMC Model Diagnostics Script

Comprehensive diagnostic checks for PyMC models.
Run this after sampling to validate results before interpretation.

Usage:
    from scripts.model_diagnostics import check_diagnostics, create_diagnostic_report

    # Quick check
    check_diagnostics(idata)

    # Full report with plots
    create_diagnostic_report(idata, var_names=['alpha', 'beta', 'sigma'], output_dir='diagnostics/')
"""

import arviz as az
import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path


def check_diagnostics(idata, var_names=None, ess_threshold=400, rhat_threshold=1.01):
    """
    Perform comprehensive diagnostic checks on MCMC samples.

    Parameters
    ----------
    idata : arviz.InferenceData
        InferenceData object from pm.sample()
    var_names : list, optional
        Variables to check. If None, checks all model parameters
    ess_threshold : int
        Minimum acceptable effective sample size (default: 400)
    rhat_threshold : float
        Maximum acceptable R-hat value (default: 1.01)

    Returns
    -------
    dict
        Dictionary with diagnostic results and flags
    """
    print("="*70)
    print(" " * 20 + "MCMC DIAGNOSTICS REPORT")
    print("="*70)

    # Get summary statistics
    summary = az.summary(idata, var_names=var_names)

    results = {
        'summary': summary,
        'has_issues': False,
        'issues': []
    }

    # 1. Check R-hat (convergence)
    print("\n1. CONVERGENCE CHECK (R-hat)")
    print("-" * 70)
    bad_rhat = summary[summary['r_hat'] > rhat_threshold]

    if len(bad_rhat) > 0:
        print(f"⚠️  WARNING: {len(bad_rhat)} parameters have R-hat > {rhat_threshold}")
        print("\nTop 10 worst R-hat values:")
        print(bad_rhat[['r_hat']].sort_values('r_hat', ascending=False).head(10))
        print("\n⚠️  Chains may not have converged!")
        print("   → Run longer chains or check for multimodality")
        results['has_issues'] = True
        results['issues'].append('convergence')
    else:
        print(f"✓ All R-hat values ≤ {rhat_threshold}")
        print("  Chains have converged successfully")

    # 2. Check Effective Sample Size
    print("\n2. EFFECTIVE SAMPLE SIZE (ESS)")
    print("-" * 70)
    low_ess_bulk = summary[summary['ess_bulk'] < ess_threshold]
    low_ess_tail = summary[summary['ess_tail'] < ess_threshold]

    if len(low_ess_bulk) > 0 or len(low_ess_tail) > 0:
        print(f"⚠️  WARNING: Some parameters have ESS < {ess_threshold}")

        if len(low_ess_bulk) > 0:
            print(f"\n   Bulk ESS issues ({len(low_ess_bulk)} parameters):")
            print(low_ess_bulk[['ess_bulk']].sort_values('ess_bulk').head(10))

        if len(low_ess_tail) > 0:
            print(f"\n   Tail ESS issues ({len(low_ess_tail)} parameters):")
            print(low_ess_tail[['ess_tail']].sort_values('ess_tail').head(10))

        print("\n⚠️  High autocorrelation detected!")
        print("   → Sample more draws or reparameterize to reduce correlation")
        results['has_issues'] = True
        results['issues'].append('low_ess')
    else:
        print(f"✓ All ESS values ≥ {ess_threshold}")
        print("  Sufficient effective samples")

    # 3. Check Divergences
    print("\n3. DIVERGENT TRANSITIONS")
    print("-" * 70)
    divergences = idata.sample_stats.diverging.sum().item()

    if divergences > 0:
        total_samples = len(idata.posterior.draw) * len(idata.posterior.chain)
        divergence_rate = divergences / total_samples * 100

        print(f"⚠️  WARNING: {divergences} divergent transitions ({divergence_rate:.2f}% of samples)")
        print("\n   Divergences indicate biased sampling in difficult posterior regions")
        print("   Solutions:")
        print("   → Increase target_accept (e.g., target_accept=0.95 or 0.99)")
        print("   → Use non-centered parameterization for hierarchical models")
        print("   → Add stronger/more informative priors")
        print("   → Check for model misspecification")
        results['has_issues'] = True
        results['issues'].append('divergences')
        results['n_divergences'] = divergences
    else:
        print("✓ No divergences detected")
        print("  NUTS explored the posterior successfully")

    # 4. Check Tree Depth
    print("\n4. TREE DEPTH")
    print("-" * 70)
    tree_depth = idata.sample_stats.tree_depth
    max_tree_depth = tree_depth.max().item()

    # Typical max_treedepth is 10 (default in PyMC)
    hits_max = (tree_depth >= 10).sum().item()

    if hits_max > 0:
        total_samples = len(idata.posterior.draw) * len(idata.posterior.chain)
        hit_rate = hits_max / total_samples * 100

        print(f"⚠️  WARNING: Hit maximum tree depth {hits_max} times ({hit_rate:.2f}% of samples)")
        print("\n   Model may be difficult to explore efficiently")
        print("   Solutions:")
        print("   → Reparameterize model to improve geometry")
        print("   → Increase max_treedepth (if necessary)")
        results['issues'].append('max_treedepth')
    else:
        print(f"✓ No maximum tree depth issues")
        print(f"  Maximum tree depth reached: {max_tree_depth}")

    # 5. Check Energy (if available)
    if hasattr(idata.sample_stats, 'energy'):
        print("\n5. ENERGY DIAGNOSTICS")
        print("-" * 70)
        print("✓ Energy statistics available")
        print("  Use az.plot_energy(idata) to visualize energy transitions")
        print("  Good separation indicates healthy HMC sampling")

    # Summary
    print("\n" + "="*70)
    print("SUMMARY")
    print("="*70)

    if not results['has_issues']:
        print("✓ All diagnostics passed!")
        print("  Your model has sampled successfully.")
        print("  Proceed with inference and interpretation.")
    else:
        print("⚠️  Some diagnostics failed!")
        print(f"  Issues found: {', '.join(results['issues'])}")
        print("  Review warnings above and consider re-running with adjustments.")

    print("="*70)

    return results


def create_diagnostic_report(idata, var_names=None, output_dir='diagnostics/', show=False):
    """
    Create comprehensive diagnostic report with plots.

    Parameters
    ----------
    idata : arviz.InferenceData
        InferenceData object from pm.sample()
    var_names : list, optional
        Variables to plot. If None, uses all model parameters
    output_dir : str
        Directory to save diagnostic plots
    show : bool
        Whether to display plots (default: False, just save)

    Returns
    -------
    dict
        Diagnostic results from check_diagnostics
    """
    # Create output directory
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    # Run diagnostic checks
    results = check_diagnostics(idata, var_names=var_names)

    print(f"\nGenerating diagnostic plots in '{output_dir}'...")

    # 1. Trace plots
    fig, axes = plt.subplots(
        len(var_names) if var_names else 5,
        2,
        figsize=(12, 10)
    )
    az.plot_trace(idata, var_names=var_names, axes=axes)
    plt.tight_layout()
    plt.savefig(output_path / 'trace_plots.png', dpi=300, bbox_inches='tight')
    print(f"  ✓ Saved trace plots")
    if show:
        plt.show()
    else:
        plt.close()

    # 2. Rank plots (check mixing)
    fig = plt.figure(figsize=(12, 8))
    az.plot_rank(idata, var_names=var_names)
    plt.tight_layout()
    plt.savefig(output_path / 'rank_plots.png', dpi=300, bbox_inches='tight')
    print(f"  ✓ Saved rank plots")
    if show:
        plt.show()
    else:
        plt.close()

    # 3. Autocorrelation plots
    fig = plt.figure(figsize=(12, 8))
    az.plot_autocorr(idata, var_names=var_names, combined=True)
    plt.tight_layout()
    plt.savefig(output_path / 'autocorr_plots.png', dpi=300, bbox_inches='tight')
    print(f"  ✓ Saved autocorrelation plots")
    if show:
        plt.show()
    else:
        plt.close()

    # 4. Energy plot (if available)
    if hasattr(idata.sample_stats, 'energy'):
        fig = plt.figure(figsize=(10, 6))
        az.plot_energy(idata)
        plt.tight_layout()
        plt.savefig(output_path / 'energy_plot.png', dpi=300, bbox_inches='tight')
        print(f"  ✓ Saved energy plot")
        if show:
            plt.show()
        else:
            plt.close()

    # 5. ESS plot
    fig = plt.figure(figsize=(10, 6))
    az.plot_ess(idata, var_names=var_names, kind='evolution')
    plt.tight_layout()
    plt.savefig(output_path / 'ess_evolution.png', dpi=300, bbox_inches='tight')
    print(f"  ✓ Saved ESS evolution plot")
    if show:
        plt.show()
    else:
        plt.close()

    # Save summary to CSV
    results['summary'].to_csv(output_path / 'summary_statistics.csv')
    print(f"  ✓ Saved summary statistics")

    print(f"\nDiagnostic report complete! Files saved in '{output_dir}'")

    return results


def compare_prior_posterior(idata, prior_idata, var_names=None, output_path=None):
    """
    Compare prior and posterior distributions.

    Parameters
    ----------
    idata : arviz.InferenceData
        InferenceData with posterior samples
    prior_idata : arviz.InferenceData
        InferenceData with prior samples
    var_names : list, optional
        Variables to compare
    output_path : str, optional
        If provided, save plot to this path

    Returns
    -------
    None
    """
    fig, axes = plt.subplots(
        len(var_names) if var_names else 3,
        1,
        figsize=(10, 8)
    )

    if not isinstance(axes, np.ndarray):
        axes = [axes]

    for idx, var in enumerate(var_names if var_names else list(idata.posterior.data_vars)[:3]):
        # Plot prior
        az.plot_dist(
            prior_idata.prior[var].values.flatten(),
            label='Prior',
            ax=axes[idx],
            color='blue',
            alpha=0.3
        )

        # Plot posterior
        az.plot_dist(
            idata.posterior[var].values.flatten(),
            label='Posterior',
            ax=axes[idx],
            color='green',
            alpha=0.3
        )

        axes[idx].set_title(f'{var}: Prior vs Posterior')
        axes[idx].legend()

    plt.tight_layout()

    if output_path:
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        print(f"Prior-posterior comparison saved to {output_path}")
    else:
        plt.show()


# Example usage
if __name__ == '__main__':
    print("This script provides diagnostic functions for PyMC models.")
    print("\nExample usage:")
    print("""
    import pymc as pm
    from scripts.model_diagnostics import check_diagnostics, create_diagnostic_report

    # After sampling
    with pm.Model() as model:
        # ... define model ...
        idata = pm.sample()

    # Quick diagnostic check
    results = check_diagnostics(idata)

    # Full diagnostic report with plots
    create_diagnostic_report(
        idata,
        var_names=['alpha', 'beta', 'sigma'],
        output_dir='my_diagnostics/'
    )
    """)
