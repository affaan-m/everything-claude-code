#!/usr/bin/env python3
"""
PyDESeq2 Analysis Script

This script performs a complete differential expression analysis using PyDESeq2.
It can be used as a template for standard RNA-seq DEA workflows.

Usage:
    python run_deseq2_analysis.py --counts counts.csv --metadata metadata.csv \
           --design "~condition" --contrast condition treated control \
           --output results/

Requirements:
    - pydeseq2
    - pandas
    - matplotlib (optional, for plots)
"""

import argparse
import os
import pickle
import sys
from pathlib import Path

import pandas as pd

try:
    from pydeseq2.dds import DeseqDataSet
    from pydeseq2.ds import DeseqStats
except ImportError:
    print("Error: pydeseq2 not installed. Install with: pip install pydeseq2")
    sys.exit(1)


def load_and_validate_data(counts_path, metadata_path, transpose_counts=True):
    """Load count matrix and metadata, perform basic validation."""
    print(f"Loading count data from {counts_path}...")
    counts_df = pd.read_csv(counts_path, index_col=0)

    if transpose_counts:
        print("Transposing count matrix to samples × genes format...")
        counts_df = counts_df.T

    print(f"Loading metadata from {metadata_path}...")
    metadata = pd.read_csv(metadata_path, index_col=0)

    print(f"\nData loaded:")
    print(f"  Counts shape: {counts_df.shape} (samples × genes)")
    print(f"  Metadata shape: {metadata.shape} (samples × variables)")

    # Validate
    if not all(counts_df.index == metadata.index):
        print("\nWarning: Sample indices don't match perfectly. Taking intersection...")
        common_samples = counts_df.index.intersection(metadata.index)
        counts_df = counts_df.loc[common_samples]
        metadata = metadata.loc[common_samples]
        print(f"  Using {len(common_samples)} common samples")

    # Check for negative or non-integer values
    if (counts_df < 0).any().any():
        raise ValueError("Count matrix contains negative values")

    return counts_df, metadata


def filter_data(counts_df, metadata, min_counts=10, condition_col=None):
    """Filter low-count genes and samples with missing data."""
    print(f"\nFiltering data...")

    initial_genes = counts_df.shape[1]
    initial_samples = counts_df.shape[0]

    # Filter genes
    genes_to_keep = counts_df.columns[counts_df.sum(axis=0) >= min_counts]
    counts_df = counts_df[genes_to_keep]
    genes_removed = initial_genes - counts_df.shape[1]
    print(f"  Removed {genes_removed} genes with < {min_counts} total counts")

    # Filter samples with missing condition data
    if condition_col and condition_col in metadata.columns:
        samples_to_keep = ~metadata[condition_col].isna()
        counts_df = counts_df.loc[samples_to_keep]
        metadata = metadata.loc[samples_to_keep]
        samples_removed = initial_samples - counts_df.shape[0]
        if samples_removed > 0:
            print(f"  Removed {samples_removed} samples with missing '{condition_col}' data")

    print(f"  Final data shape: {counts_df.shape[0]} samples × {counts_df.shape[1]} genes")

    return counts_df, metadata


def run_deseq2(counts_df, metadata, design, n_cpus=1):
    """Run DESeq2 normalization and fitting."""
    print(f"\nInitializing DeseqDataSet with design: {design}")

    dds = DeseqDataSet(
        counts=counts_df,
        metadata=metadata,
        design=design,
        refit_cooks=True,
        n_cpus=n_cpus,
        quiet=False
    )

    print("\nRunning DESeq2 pipeline...")
    print("  Step 1/7: Computing size factors...")
    print("  Step 2/7: Fitting genewise dispersions...")
    print("  Step 3/7: Fitting dispersion trend curve...")
    print("  Step 4/7: Computing dispersion priors...")
    print("  Step 5/7: Fitting MAP dispersions...")
    print("  Step 6/7: Fitting log fold changes...")
    print("  Step 7/7: Calculating Cook's distances...")

    dds.deseq2()

    print("\n✓ DESeq2 fitting complete")

    return dds


def run_statistical_tests(dds, contrast, alpha=0.05, shrink_lfc=True):
    """Perform Wald tests and compute p-values."""
    print(f"\nPerforming statistical tests...")
    print(f"  Contrast: {contrast}")
    print(f"  Significance threshold: {alpha}")

    ds = DeseqStats(
        dds,
        contrast=contrast,
        alpha=alpha,
        cooks_filter=True,
        independent_filter=True,
        quiet=False
    )

    print("\n  Running Wald tests...")
    print("  Filtering outliers based on Cook's distance...")
    print("  Applying independent filtering...")
    print("  Adjusting p-values (Benjamini-Hochberg)...")

    ds.summary()

    print("\n✓ Statistical testing complete")

    # Optional LFC shrinkage
    if shrink_lfc:
        print("\nApplying LFC shrinkage for visualization...")
        ds.lfc_shrink()
        print("✓ LFC shrinkage complete")

    return ds


def save_results(ds, dds, output_dir, shrink_lfc=True):
    """Save results and intermediate objects."""
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"\nSaving results to {output_dir}/")

    # Save statistical results
    results_path = output_dir / "deseq2_results.csv"
    ds.results_df.to_csv(results_path)
    print(f"  Saved: {results_path}")

    # Save significant genes
    significant = ds.results_df[ds.results_df.padj < 0.05]
    sig_path = output_dir / "significant_genes.csv"
    significant.to_csv(sig_path)
    print(f"  Saved: {sig_path} ({len(significant)} significant genes)")

    # Save sorted results
    sorted_results = ds.results_df.sort_values("padj")
    sorted_path = output_dir / "results_sorted_by_padj.csv"
    sorted_results.to_csv(sorted_path)
    print(f"  Saved: {sorted_path}")

    # Save DeseqDataSet as pickle
    dds_path = output_dir / "deseq_dataset.pkl"
    with open(dds_path, "wb") as f:
        pickle.dump(dds.to_picklable_anndata(), f)
    print(f"  Saved: {dds_path}")

    # Print summary
    print(f"\n{'='*60}")
    print("ANALYSIS SUMMARY")
    print(f"{'='*60}")
    print(f"Total genes tested: {len(ds.results_df)}")
    print(f"Significant genes (padj < 0.05): {len(significant)}")
    print(f"Upregulated: {len(significant[significant.log2FoldChange > 0])}")
    print(f"Downregulated: {len(significant[significant.log2FoldChange < 0])}")
    print(f"{'='*60}")

    # Show top genes
    print("\nTop 10 most significant genes:")
    print(sorted_results.head(10)[["baseMean", "log2FoldChange", "pvalue", "padj"]])

    return results_path


def create_plots(ds, output_dir):
    """Create basic visualization plots."""
    try:
        import matplotlib.pyplot as plt
        import numpy as np
    except ImportError:
        print("\nNote: matplotlib not installed. Skipping plot generation.")
        return

    output_dir = Path(output_dir)
    results = ds.results_df.copy()

    print("\nGenerating plots...")

    # Volcano plot
    results["-log10(padj)"] = -np.log10(results.padj.fillna(1))

    plt.figure(figsize=(10, 6))
    significant = results.padj < 0.05
    plt.scatter(
        results.loc[~significant, "log2FoldChange"],
        results.loc[~significant, "-log10(padj)"],
        alpha=0.3, s=10, c='gray', label='Not significant'
    )
    plt.scatter(
        results.loc[significant, "log2FoldChange"],
        results.loc[significant, "-log10(padj)"],
        alpha=0.6, s=10, c='red', label='Significant (padj < 0.05)'
    )
    plt.axhline(-np.log10(0.05), color='blue', linestyle='--', linewidth=1, alpha=0.5)
    plt.axvline(1, color='gray', linestyle='--', linewidth=1, alpha=0.5)
    plt.axvline(-1, color='gray', linestyle='--', linewidth=1, alpha=0.5)
    plt.xlabel("Log2 Fold Change", fontsize=12)
    plt.ylabel("-Log10(Adjusted P-value)", fontsize=12)
    plt.title("Volcano Plot", fontsize=14, fontweight='bold')
    plt.legend()
    plt.tight_layout()
    volcano_path = output_dir / "volcano_plot.png"
    plt.savefig(volcano_path, dpi=300)
    plt.close()
    print(f"  Saved: {volcano_path}")

    # MA plot
    plt.figure(figsize=(10, 6))
    plt.scatter(
        np.log10(results.loc[~significant, "baseMean"] + 1),
        results.loc[~significant, "log2FoldChange"],
        alpha=0.3, s=10, c='gray', label='Not significant'
    )
    plt.scatter(
        np.log10(results.loc[significant, "baseMean"] + 1),
        results.loc[significant, "log2FoldChange"],
        alpha=0.6, s=10, c='red', label='Significant (padj < 0.05)'
    )
    plt.axhline(0, color='blue', linestyle='--', linewidth=1, alpha=0.5)
    plt.xlabel("Log10(Base Mean + 1)", fontsize=12)
    plt.ylabel("Log2 Fold Change", fontsize=12)
    plt.title("MA Plot", fontsize=14, fontweight='bold')
    plt.legend()
    plt.tight_layout()
    ma_path = output_dir / "ma_plot.png"
    plt.savefig(ma_path, dpi=300)
    plt.close()
    print(f"  Saved: {ma_path}")


def main():
    parser = argparse.ArgumentParser(
        description="Run PyDESeq2 differential expression analysis",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Basic analysis
  python run_deseq2_analysis.py \\
    --counts counts.csv \\
    --metadata metadata.csv \\
    --design "~condition" \\
    --contrast condition treated control \\
    --output results/

  # Multi-factor analysis
  python run_deseq2_analysis.py \\
    --counts counts.csv \\
    --metadata metadata.csv \\
    --design "~batch + condition" \\
    --contrast condition treated control \\
    --output results/ \\
    --n-cpus 4
        """
    )

    parser.add_argument("--counts", required=True, help="Path to count matrix CSV file")
    parser.add_argument("--metadata", required=True, help="Path to metadata CSV file")
    parser.add_argument("--design", required=True, help="Design formula (e.g., '~condition')")
    parser.add_argument("--contrast", nargs=3, required=True,
                       metavar=("VARIABLE", "TEST", "REFERENCE"),
                       help="Contrast specification: variable test_level reference_level")
    parser.add_argument("--output", default="results", help="Output directory (default: results)")
    parser.add_argument("--min-counts", type=int, default=10,
                       help="Minimum total counts for gene filtering (default: 10)")
    parser.add_argument("--alpha", type=float, default=0.05,
                       help="Significance threshold (default: 0.05)")
    parser.add_argument("--no-transpose", action="store_true",
                       help="Don't transpose count matrix (use if already samples × genes)")
    parser.add_argument("--no-shrink", action="store_true",
                       help="Skip LFC shrinkage")
    parser.add_argument("--n-cpus", type=int, default=1,
                       help="Number of CPUs for parallel processing (default: 1)")
    parser.add_argument("--plots", action="store_true",
                       help="Generate volcano and MA plots")

    args = parser.parse_args()

    # Load data
    counts_df, metadata = load_and_validate_data(
        args.counts,
        args.metadata,
        transpose_counts=not args.no_transpose
    )

    # Filter data
    condition_col = args.contrast[0]
    counts_df, metadata = filter_data(
        counts_df,
        metadata,
        min_counts=args.min_counts,
        condition_col=condition_col
    )

    # Run DESeq2
    dds = run_deseq2(counts_df, metadata, args.design, n_cpus=args.n_cpus)

    # Statistical testing
    ds = run_statistical_tests(
        dds,
        contrast=args.contrast,
        alpha=args.alpha,
        shrink_lfc=not args.no_shrink
    )

    # Save results
    save_results(ds, dds, args.output, shrink_lfc=not args.no_shrink)

    # Create plots if requested
    if args.plots:
        create_plots(ds, args.output)

    print(f"\n✓ Analysis complete! Results saved to {args.output}/")


if __name__ == "__main__":
    main()
