#!/usr/bin/env python3
"""
Basic GRN inference example using Arboreto.

This script demonstrates the standard workflow for inferring gene regulatory
networks from expression data using GRNBoost2.

Usage:
    python basic_grn_inference.py <expression_file> <output_file> [--tf-file TF_FILE] [--seed SEED]

Arguments:
    expression_file: Path to expression matrix (TSV format, genes as columns)
    output_file: Path for output network (TSV format)
    --tf-file: Optional path to transcription factors file (one per line)
    --seed: Random seed for reproducibility (default: 777)
"""

import argparse
import pandas as pd
from arboreto.algo import grnboost2
from arboreto.utils import load_tf_names


def run_grn_inference(expression_file, output_file, tf_file=None, seed=777):
    """
    Run GRN inference using GRNBoost2.

    Args:
        expression_file: Path to expression matrix TSV file
        output_file: Path for output network file
        tf_file: Optional path to TF names file
        seed: Random seed for reproducibility
    """
    print(f"Loading expression data from {expression_file}...")
    expression_data = pd.read_csv(expression_file, sep='\t')

    print(f"Expression matrix shape: {expression_data.shape}")
    print(f"Number of genes: {expression_data.shape[1]}")
    print(f"Number of observations: {expression_data.shape[0]}")

    # Load TF names if provided
    tf_names = 'all'
    if tf_file:
        print(f"Loading transcription factors from {tf_file}...")
        tf_names = load_tf_names(tf_file)
        print(f"Number of TFs: {len(tf_names)}")

    # Run GRN inference
    print(f"Running GRNBoost2 with seed={seed}...")
    network = grnboost2(
        expression_data=expression_data,
        tf_names=tf_names,
        seed=seed,
        verbose=True
    )

    # Save results
    print(f"Saving network to {output_file}...")
    network.to_csv(output_file, sep='\t', index=False, header=False)

    print(f"Done! Network contains {len(network)} regulatory links.")
    print(f"\nTop 10 regulatory links:")
    print(network.head(10).to_string(index=False))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description='Infer gene regulatory network using GRNBoost2'
    )
    parser.add_argument(
        'expression_file',
        help='Path to expression matrix (TSV format, genes as columns)'
    )
    parser.add_argument(
        'output_file',
        help='Path for output network (TSV format)'
    )
    parser.add_argument(
        '--tf-file',
        help='Path to transcription factors file (one per line)',
        default=None
    )
    parser.add_argument(
        '--seed',
        help='Random seed for reproducibility (default: 777)',
        type=int,
        default=777
    )

    args = parser.parse_args()

    run_grn_inference(
        expression_file=args.expression_file,
        output_file=args.output_file,
        tf_file=args.tf_file,
        seed=args.seed
    )
