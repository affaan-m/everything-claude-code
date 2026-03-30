#!/usr/bin/env python
"""
Run spike sorting on preprocessed recording.

Usage:
    python run_sorting.py preprocessed/ --sorter kilosort4 --output sorting/
"""

import argparse
from pathlib import Path

import spikeinterface.full as si


# Default parameters for each sorter
SORTER_DEFAULTS = {
    'kilosort4': {
        'batch_size': 30000,
        'nblocks': 1,
        'Th_learned': 8,
        'Th_universal': 9,
    },
    'kilosort3': {
        'do_CAR': False,  # Already done in preprocessing
    },
    'spykingcircus2': {
        'apply_preprocessing': False,
    },
    'mountainsort5': {
        'filter': False,
        'whiten': False,
    },
}


def run_sorting(
    input_path: str,
    output_dir: str,
    sorter: str = 'kilosort4',
    sorter_params: dict = None,
    n_jobs: int = -1,
):
    """Run spike sorting."""

    print(f"Loading preprocessed recording from: {input_path}")
    recording = si.load_extractor(Path(input_path) / 'preprocessed')

    print(f"Recording: {recording.get_num_channels()} channels, {recording.get_total_duration():.1f}s")

    # Get sorter parameters
    params = SORTER_DEFAULTS.get(sorter, {}).copy()
    if sorter_params:
        params.update(sorter_params)

    print(f"Running {sorter} with params: {params}")

    output_path = Path(output_dir)

    # Run sorter (note: parameter is 'folder' not 'output_folder' in newer SpikeInterface)
    sorting = si.run_sorter(
        sorter,
        recording,
        folder=output_path / f'{sorter}_output',
        verbose=True,
        **params,
    )

    print(f"\nSorting complete!")
    print(f"  Units found: {len(sorting.unit_ids)}")
    print(f"  Total spikes: {sum(len(sorting.get_unit_spike_train(uid)) for uid in sorting.unit_ids)}")

    # Save sorting
    sorting.save(folder=output_path / 'sorting')
    print(f"  Saved to: {output_path / 'sorting'}")

    return sorting


def main():
    parser = argparse.ArgumentParser(description='Run spike sorting')
    parser.add_argument('input', help='Path to preprocessed recording')
    parser.add_argument('--output', '-o', default='sorting/', help='Output directory')
    parser.add_argument('--sorter', '-s', default='kilosort4',
                       choices=['kilosort4', 'kilosort3', 'spykingcircus2', 'mountainsort5'])
    parser.add_argument('--n-jobs', type=int, default=-1, help='Number of parallel jobs')

    args = parser.parse_args()

    run_sorting(
        args.input,
        args.output,
        sorter=args.sorter,
        n_jobs=args.n_jobs,
    )


if __name__ == '__main__':
    main()
