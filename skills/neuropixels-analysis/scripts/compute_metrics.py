#!/usr/bin/env python
"""
Compute quality metrics and curate units.

Usage:
    python compute_metrics.py sorting/ preprocessed/ --output metrics/
"""

import argparse
from pathlib import Path
import json

import pandas as pd
import spikeinterface.full as si


# Curation criteria presets
CURATION_CRITERIA = {
    'allen': {
        'snr': 3.0,
        'isi_violations_ratio': 0.1,
        'presence_ratio': 0.9,
        'amplitude_cutoff': 0.1,
    },
    'ibl': {
        'snr': 4.0,
        'isi_violations_ratio': 0.5,
        'presence_ratio': 0.5,
        'amplitude_cutoff': None,
    },
    'strict': {
        'snr': 5.0,
        'isi_violations_ratio': 0.01,
        'presence_ratio': 0.95,
        'amplitude_cutoff': 0.05,
    },
}


def compute_metrics(
    sorting_path: str,
    recording_path: str,
    output_dir: str,
    curation_method: str = 'allen',
    n_jobs: int = -1,
):
    """Compute quality metrics and apply curation."""

    print(f"Loading sorting from: {sorting_path}")
    sorting = si.load_extractor(Path(sorting_path) / 'sorting')

    print(f"Loading recording from: {recording_path}")
    recording = si.load_extractor(Path(recording_path) / 'preprocessed')

    print(f"Units: {len(sorting.unit_ids)}")

    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    # Create analyzer
    print("Creating SortingAnalyzer...")
    analyzer = si.create_sorting_analyzer(
        sorting,
        recording,
        format='binary_folder',
        folder=output_path / 'analyzer',
        sparse=True,
    )

    # Compute extensions
    print("Computing waveforms...")
    analyzer.compute('random_spikes', max_spikes_per_unit=500)
    analyzer.compute('waveforms', ms_before=1.0, ms_after=2.0)
    analyzer.compute('templates', operators=['average', 'std'])

    print("Computing additional extensions...")
    analyzer.compute('noise_levels')
    analyzer.compute('spike_amplitudes')
    analyzer.compute('correlograms', window_ms=50.0, bin_ms=1.0)
    analyzer.compute('unit_locations', method='monopolar_triangulation')

    # Compute quality metrics
    print("Computing quality metrics...")
    metrics = si.compute_quality_metrics(
        analyzer,
        metric_names=[
            'snr',
            'isi_violations_ratio',
            'presence_ratio',
            'amplitude_cutoff',
            'firing_rate',
            'amplitude_cv',
            'sliding_rp_violation',
        ],
        n_jobs=n_jobs,
    )

    # Save metrics
    metrics.to_csv(output_path / 'quality_metrics.csv')
    print(f"Saved metrics to: {output_path / 'quality_metrics.csv'}")

    # Apply curation
    criteria = CURATION_CRITERIA.get(curation_method, CURATION_CRITERIA['allen'])
    print(f"\nApplying {curation_method} curation criteria: {criteria}")

    labels = {}
    for unit_id in metrics.index:
        row = metrics.loc[unit_id]

        # Check each criterion
        is_good = True

        if criteria.get('snr') and row.get('snr', 0) < criteria['snr']:
            is_good = False

        if criteria.get('isi_violations_ratio') and row.get('isi_violations_ratio', 1) > criteria['isi_violations_ratio']:
            is_good = False

        if criteria.get('presence_ratio') and row.get('presence_ratio', 0) < criteria['presence_ratio']:
            is_good = False

        if criteria.get('amplitude_cutoff') and row.get('amplitude_cutoff', 1) > criteria['amplitude_cutoff']:
            is_good = False

        # Classify
        if is_good:
            labels[int(unit_id)] = 'good'
        elif row.get('snr', 0) < 2:
            labels[int(unit_id)] = 'noise'
        else:
            labels[int(unit_id)] = 'mua'

    # Save labels
    with open(output_path / 'curation_labels.json', 'w') as f:
        json.dump(labels, f, indent=2)

    # Summary
    label_counts = {}
    for label in labels.values():
        label_counts[label] = label_counts.get(label, 0) + 1

    print(f"\nCuration summary:")
    print(f"  Good: {label_counts.get('good', 0)}")
    print(f"  MUA: {label_counts.get('mua', 0)}")
    print(f"  Noise: {label_counts.get('noise', 0)}")
    print(f"  Total: {len(labels)}")

    # Metrics summary
    print(f"\nMetrics summary:")
    for col in ['snr', 'isi_violations_ratio', 'presence_ratio', 'firing_rate']:
        if col in metrics.columns:
            print(f"  {col}: {metrics[col].median():.4f} (median)")

    return analyzer, metrics, labels


def main():
    parser = argparse.ArgumentParser(description='Compute quality metrics')
    parser.add_argument('sorting', help='Path to sorting directory')
    parser.add_argument('recording', help='Path to preprocessed recording')
    parser.add_argument('--output', '-o', default='metrics/', help='Output directory')
    parser.add_argument('--curation', '-c', default='allen',
                       choices=['allen', 'ibl', 'strict'])
    parser.add_argument('--n-jobs', type=int, default=-1, help='Number of parallel jobs')

    args = parser.parse_args()

    compute_metrics(
        args.sorting,
        args.recording,
        args.output,
        curation_method=args.curation,
        n_jobs=args.n_jobs,
    )


if __name__ == '__main__':
    main()
