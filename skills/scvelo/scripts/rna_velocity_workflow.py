"""
RNA Velocity Analysis Workflow using scVelo
===========================================
Complete pipeline from raw data to velocity visualization.

Usage:
    python rna_velocity_workflow.py

Or import and use run_velocity_analysis() with your AnnData object.
"""

import scvelo as scv
import scanpy as sc
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
import os


def run_velocity_analysis(
    adata,
    groupby="leiden",
    n_top_genes=2000,
    n_neighbors=30,
    mode="dynamical",
    n_jobs=4,
    output_dir="velocity_results",
):
    """
    Complete RNA velocity analysis workflow.

    Parameters
    ----------
    adata : AnnData
        AnnData object with 'spliced' and 'unspliced' layers.
        Should already have UMAP and cluster annotations.
    groupby : str
        Column in adata.obs for cell type labels.
    n_top_genes : int
        Number of top highly variable genes.
    n_neighbors : int
        Number of neighbors for moment computation.
    mode : str
        Velocity model: 'stochastic' (fast) or 'dynamical' (accurate).
    n_jobs : int
        Parallel jobs for dynamical model fitting.
    output_dir : str
        Directory for saving output figures.

    Returns
    -------
    AnnData with velocity annotations.
    """
    os.makedirs(output_dir, exist_ok=True)

    # ── Settings ──────────────────────────────────────────────────────────────
    scv.settings.verbosity = 2
    scv.settings.figdir = output_dir

    # ── Step 1: Check layers ───────────────────────────────────────────────────
    assert "spliced" in adata.layers, "Missing 'spliced' layer. Run velocyto first."
    assert "unspliced" in adata.layers, "Missing 'unspliced' layer. Run velocyto first."
    print(f"Input: {adata.n_obs} cells × {adata.n_vars} genes")

    # ── Step 2: Preprocessing ─────────────────────────────────────────────────
    print("Step 1/5: Preprocessing...")
    scv.pp.filter_and_normalize(adata, min_shared_counts=20, n_top_genes=n_top_genes)

    if "neighbors" not in adata.uns:
        sc.pp.neighbors(adata, n_neighbors=n_neighbors, n_pcs=30)

    scv.pp.moments(adata, n_pcs=30, n_neighbors=n_neighbors)
    print(f"  {adata.n_vars} velocity genes selected")

    # ── Step 3: Velocity estimation ────────────────────────────────────────────
    print(f"Step 2/5: Fitting velocity model ({mode})...")
    if mode == "dynamical":
        scv.tl.recover_dynamics(adata, n_jobs=n_jobs)
    scv.tl.velocity(adata, mode=mode)
    scv.tl.velocity_graph(adata)
    print("  Velocity graph computed")

    # ── Step 4: Downstream analyses ────────────────────────────────────────────
    print("Step 3/5: Computing latent time and confidence...")
    scv.tl.velocity_confidence(adata)
    scv.tl.velocity_pseudotime(adata)

    if mode == "dynamical":
        scv.tl.latent_time(adata)

    if groupby in adata.obs.columns:
        scv.tl.rank_velocity_genes(adata, groupby=groupby, min_corr=0.3)

    # ── Step 5: Visualization ─────────────────────────────────────────────────
    print("Step 4/5: Generating figures...")

    # Stream plot
    scv.pl.velocity_embedding_stream(
        adata,
        basis="umap",
        color=groupby,
        title="RNA Velocity",
        save=f"{output_dir}/velocity_stream.png",
    )

    # Arrow plot
    scv.pl.velocity_embedding(
        adata,
        arrow_length=3,
        arrow_size=2,
        color=groupby,
        basis="umap",
        save=f"{output_dir}/velocity_arrows.png",
    )

    # Pseudotime
    scv.pl.scatter(
        adata,
        color="velocity_pseudotime",
        cmap="gnuplot",
        title="Velocity Pseudotime",
        save=f"{output_dir}/pseudotime.png",
    )

    if mode == "dynamical" and "latent_time" in adata.obs:
        scv.pl.scatter(
            adata,
            color="latent_time",
            color_map="gnuplot",
            title="Latent Time",
            save=f"{output_dir}/latent_time.png",
        )

    # Speed and coherence
    scv.pl.scatter(
        adata,
        c=["velocity_length", "velocity_confidence"],
        cmap="coolwarm",
        perc=[5, 95],
        save=f"{output_dir}/velocity_quality.png",
    )

    # Top driver genes heatmap (dynamical only)
    if mode == "dynamical" and "fit_likelihood" in adata.var:
        top_genes = adata.var["fit_likelihood"].sort_values(ascending=False).index[:50]
        scv.pl.heatmap(
            adata,
            var_names=top_genes,
            sortby="latent_time",
            col_color=groupby,
            n_convolve=50,
            save=f"{output_dir}/driver_gene_heatmap.png",
        )

    # ── Step 6: Save results ───────────────────────────────────────────────────
    print("Step 5/5: Saving results...")
    output_h5ad = os.path.join(output_dir, "adata_velocity.h5ad")
    adata.write_h5ad(output_h5ad)
    print(f"  Saved to {output_h5ad}")

    # Summary statistics
    confidence = adata.obs["velocity_confidence"].dropna()
    print("\nSummary:")
    print(f"  Velocity model: {mode}")
    print(f"  Cells: {adata.n_obs}")
    print(f"  Velocity genes: {adata.n_vars}")
    print(f"  Mean velocity confidence: {confidence.mean():.3f}")
    print(f"  High-confidence cells (>0.7): {(confidence > 0.7).sum()} ({(confidence > 0.7).mean():.1%})")

    if mode == "dynamical" and "fit_likelihood" in adata.var:
        good_genes = (adata.var["fit_likelihood"] > 0.1).sum()
        print(f"  Well-fit genes (likelihood>0.1): {good_genes}")

    print(f"\nOutput files saved to: {output_dir}/")
    return adata


def load_from_loom(loom_path, processed_h5ad=None):
    """
    Load velocity data from velocyto loom file.

    Args:
        loom_path: Path to velocyto output loom file
        processed_h5ad: Optional path to pre-processed Scanpy h5ad file
    """
    adata_loom = scv.read(loom_path, cache=True)

    if processed_h5ad:
        adata_processed = sc.read_h5ad(processed_h5ad)
        # Merge: keep processed metadata and add velocity layers
        adata = scv.utils.merge(adata_processed, adata_loom)
    else:
        adata = adata_loom
        # Run basic Scanpy pipeline
        sc.pp.normalize_total(adata, target_sum=1e4)
        sc.pp.log1p(adata)
        sc.pp.highly_variable_genes(adata, n_top_genes=3000)
        sc.pp.pca(adata)
        sc.pp.neighbors(adata)
        sc.tl.umap(adata)
        sc.tl.leiden(adata, resolution=0.5)

    return adata


if __name__ == "__main__":
    # Example usage with simulated data (for testing)
    print("scVelo RNA Velocity Workflow - Demo Mode")
    print("=" * 50)

    # Load example dataset
    adata = scv.datasets.pancreas()
    print(f"Loaded pancreas dataset: {adata}")

    # Run analysis
    adata = run_velocity_analysis(
        adata,
        groupby="clusters",
        n_top_genes=2000,
        mode="dynamical",
        n_jobs=2,
        output_dir="pancreas_velocity",
    )

    print("\nAnalysis complete!")
    print(f"Key results:")
    print(f"  adata.layers['velocity']: velocity per gene per cell")
    print(f"  adata.obs['latent_time']: pseudotime from dynamics")
    print(f"  adata.obs['velocity_confidence']: per-cell confidence")
    if "rank_velocity_genes" in adata.uns:
        print(f"  adata.uns['rank_velocity_genes']: driver genes per cluster")
