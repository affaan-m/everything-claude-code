#!/usr/bin/env python
"""
Export sorting results to Phy for manual curation.

Usage:
    python export_to_phy.py metrics/analyzer --output phy_export/
"""

import argparse
from pathlib import Path

import spikeinterface.full as si
from spikeinterface.exporters import export_to_phy


def export_phy(
    analyzer_path: str,
    output_dir: str,
    copy_binary: bool = True,
    compute_amplitudes: bool = True,
    compute_pc_features: bool = True,
    n_jobs: int = -1,
):
    """Export to Phy format."""

    print(f"Loading analyzer from: {analyzer_path}")
    analyzer = si.load_sorting_analyzer(analyzer_path)

    print(f"Units: {len(analyzer.sorting.unit_ids)}")

    output_path = Path(output_dir)

    # Compute required extensions if missing
    if compute_amplitudes and analyzer.get_extension('spike_amplitudes') is None:
        print("Computing spike amplitudes...")
        analyzer.compute('spike_amplitudes')

    if compute_pc_features and analyzer.get_extension('principal_components') is None:
        print("Computing principal components...")
        analyzer.compute('principal_components', n_components=5, mode='by_channel_local')

    print(f"Exporting to Phy: {output_path}")
    export_to_phy(
        analyzer,
        output_folder=output_path,
        copy_binary=copy_binary,
        compute_amplitudes=compute_amplitudes,
        compute_pc_features=compute_pc_features,
        n_jobs=n_jobs,
    )

    print("\nExport complete!")
    print(f"To open in Phy, run:")
    print(f"  phy template-gui {output_path / 'params.py'}")


def main():
    parser = argparse.ArgumentParser(description='Export to Phy')
    parser.add_argument('analyzer', help='Path to sorting analyzer')
    parser.add_argument('--output', '-o', default='phy_export/', help='Output directory')
    parser.add_argument('--no-binary', action='store_true', help='Skip copying binary file')
    parser.add_argument('--no-amplitudes', action='store_true', help='Skip amplitude computation')
    parser.add_argument('--no-pc', action='store_true', help='Skip PC feature computation')
    parser.add_argument('--n-jobs', type=int, default=-1, help='Number of parallel jobs')

    args = parser.parse_args()

    export_phy(
        args.analyzer,
        args.output,
        copy_binary=not args.no_binary,
        compute_amplitudes=not args.no_amplitudes,
        compute_pc_features=not args.no_pc,
        n_jobs=args.n_jobs,
    )


if __name__ == '__main__':
    main()
