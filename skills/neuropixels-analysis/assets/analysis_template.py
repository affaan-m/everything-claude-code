#!/usr/bin/env python
"""
Neuropixels Analysis Template

Complete analysis workflow from raw data to curated units.
Copy and customize this template for your analysis.

Usage:
    1. Copy this file to your analysis directory
    2. Update the PARAMETERS section
    3. Run: python analysis_template.py
"""

# =============================================================================
# PARAMETERS - Customize these for your analysis
# =============================================================================

# Input/Output paths
DATA_PATH = '/path/to/your/spikeglx/data/'
OUTPUT_DIR = 'analysis_output/'
DATA_FORMAT = 'spikeglx'  # 'spikeglx', 'openephys', or 'nwb'
STREAM_ID = 'imec0.ap'    # For multi-probe recordings

# Preprocessing parameters
FREQ_MIN = 300           # Highpass filter (Hz)
FREQ_MAX = 6000          # Lowpass filter (Hz)
APPLY_PHASE_SHIFT = True
APPLY_CMR = True
DETECT_BAD_CHANNELS = True

# Motion correction
CORRECT_MOTION = True
MOTION_PRESET = 'nonrigid_accurate'  # 'kilosort_like', 'nonrigid_fast_and_accurate'

# Spike sorting
SORTER = 'kilosort4'     # 'kilosort4', 'spykingcircus2', 'mountainsort5'
SORTER_PARAMS = {
    'batch_size': 30000,
    'nblocks': 1,        # Increase for long recordings with drift
}

# Quality metrics and curation
CURATION_METHOD = 'allen'  # 'allen', 'ibl', 'strict'

# Processing
N_JOBS = -1              # -1 = all cores

# =============================================================================
# ANALYSIS PIPELINE - Usually no need to modify below
# =============================================================================

from pathlib import Path
import json

import spikeinterface.full as si
from spikeinterface.exporters import export_to_phy


def main():
    """Run the full analysis pipeline."""

    output_path = Path(OUTPUT_DIR)
    output_path.mkdir(parents=True, exist_ok=True)

    # =========================================================================
    # 1. LOAD DATA
    # =========================================================================
    print("=" * 60)
    print("1. LOADING DATA")
    print("=" * 60)

    if DATA_FORMAT == 'spikeglx':
        recording = si.read_spikeglx(DATA_PATH, stream_id=STREAM_ID)
    elif DATA_FORMAT == 'openephys':
        recording = si.read_openephys(DATA_PATH)
    elif DATA_FORMAT == 'nwb':
        recording = si.read_nwb(DATA_PATH)
    else:
        raise ValueError(f"Unknown format: {DATA_FORMAT}")

    print(f"Recording: {recording.get_num_channels()} channels")
    print(f"Duration: {recording.get_total_duration():.1f} seconds")
    print(f"Sampling rate: {recording.get_sampling_frequency()} Hz")

    # =========================================================================
    # 2. PREPROCESSING
    # =========================================================================
    print("\n" + "=" * 60)
    print("2. PREPROCESSING")
    print("=" * 60)

    rec = recording

    # Bandpass filter
    print(f"Applying bandpass filter ({FREQ_MIN}-{FREQ_MAX} Hz)...")
    rec = si.bandpass_filter(rec, freq_min=FREQ_MIN, freq_max=FREQ_MAX)

    # Phase shift correction
    if APPLY_PHASE_SHIFT:
        print("Applying phase shift correction...")
        rec = si.phase_shift(rec)

    # Bad channel detection
    if DETECT_BAD_CHANNELS:
        print("Detecting bad channels...")
        bad_ids, _ = si.detect_bad_channels(rec)
        if len(bad_ids) > 0:
            print(f"  Removing {len(bad_ids)} bad channels")
            rec = rec.remove_channels(bad_ids)

    # Common median reference
    if APPLY_CMR:
        print("Applying common median reference...")
        rec = si.common_reference(rec, operator='median', reference='global')

    # Save preprocessed
    print("Saving preprocessed recording...")
    rec.save(folder=output_path / 'preprocessed', n_jobs=N_JOBS)

    # =========================================================================
    # 3. MOTION CORRECTION
    # =========================================================================
    if CORRECT_MOTION:
        print("\n" + "=" * 60)
        print("3. MOTION CORRECTION")
        print("=" * 60)

        print(f"Estimating and correcting motion (preset: {MOTION_PRESET})...")
        rec = si.correct_motion(
            rec,
            preset=MOTION_PRESET,
            folder=output_path / 'motion',
        )

    # =========================================================================
    # 4. SPIKE SORTING
    # =========================================================================
    print("\n" + "=" * 60)
    print("4. SPIKE SORTING")
    print("=" * 60)

    print(f"Running {SORTER}...")
    sorting = si.run_sorter(
        SORTER,
        rec,
        output_folder=output_path / f'{SORTER}_output',
        verbose=True,
        **SORTER_PARAMS,
    )

    print(f"Found {len(sorting.unit_ids)} units")

    # =========================================================================
    # 5. POSTPROCESSING
    # =========================================================================
    print("\n" + "=" * 60)
    print("5. POSTPROCESSING")
    print("=" * 60)

    print("Creating SortingAnalyzer...")
    analyzer = si.create_sorting_analyzer(
        sorting,
        rec,
        format='binary_folder',
        folder=output_path / 'analyzer',
        sparse=True,
    )

    print("Computing extensions...")
    analyzer.compute('random_spikes', max_spikes_per_unit=500)
    analyzer.compute('waveforms', ms_before=1.0, ms_after=2.0)
    analyzer.compute('templates', operators=['average', 'std'])
    analyzer.compute('noise_levels')
    analyzer.compute('spike_amplitudes')
    analyzer.compute('correlograms', window_ms=50.0, bin_ms=1.0)
    analyzer.compute('unit_locations', method='monopolar_triangulation')

    # =========================================================================
    # 6. QUALITY METRICS
    # =========================================================================
    print("\n" + "=" * 60)
    print("6. QUALITY METRICS")
    print("=" * 60)

    print("Computing quality metrics...")
    metrics = si.compute_quality_metrics(
        analyzer,
        metric_names=[
            'snr', 'isi_violations_ratio', 'presence_ratio',
            'amplitude_cutoff', 'firing_rate', 'amplitude_cv',
        ],
        n_jobs=N_JOBS,
    )

    metrics.to_csv(output_path / 'quality_metrics.csv')
    print(f"Saved metrics to: {output_path / 'quality_metrics.csv'}")

    # Print summary
    print("\nMetrics summary:")
    for col in ['snr', 'isi_violations_ratio', 'presence_ratio', 'firing_rate']:
        if col in metrics.columns:
            print(f"  {col}: {metrics[col].median():.4f} (median)")

    # =========================================================================
    # 7. CURATION
    # =========================================================================
    print("\n" + "=" * 60)
    print("7. CURATION")
    print("=" * 60)

    # Curation criteria
    criteria = {
        'allen': {'snr': 3.0, 'isi_violations_ratio': 0.1, 'presence_ratio': 0.9},
        'ibl': {'snr': 4.0, 'isi_violations_ratio': 0.5, 'presence_ratio': 0.5},
        'strict': {'snr': 5.0, 'isi_violations_ratio': 0.01, 'presence_ratio': 0.95},
    }[CURATION_METHOD]

    print(f"Applying {CURATION_METHOD} criteria: {criteria}")

    labels = {}
    for unit_id in metrics.index:
        row = metrics.loc[unit_id]
        is_good = (
            row.get('snr', 0) >= criteria['snr'] and
            row.get('isi_violations_ratio', 1) <= criteria['isi_violations_ratio'] and
            row.get('presence_ratio', 0) >= criteria['presence_ratio']
        )
        if is_good:
            labels[int(unit_id)] = 'good'
        elif row.get('snr', 0) < 2:
            labels[int(unit_id)] = 'noise'
        else:
            labels[int(unit_id)] = 'mua'

    # Save labels
    with open(output_path / 'curation_labels.json', 'w') as f:
        json.dump(labels, f, indent=2)

    # Count
    good_count = sum(1 for v in labels.values() if v == 'good')
    mua_count = sum(1 for v in labels.values() if v == 'mua')
    noise_count = sum(1 for v in labels.values() if v == 'noise')

    print(f"\nCuration results:")
    print(f"  Good: {good_count}")
    print(f"  MUA: {mua_count}")
    print(f"  Noise: {noise_count}")
    print(f"  Total: {len(labels)}")

    # =========================================================================
    # 8. EXPORT
    # =========================================================================
    print("\n" + "=" * 60)
    print("8. EXPORT")
    print("=" * 60)

    print("Exporting to Phy...")
    export_to_phy(
        analyzer,
        output_folder=output_path / 'phy_export',
        copy_binary=True,
    )

    print(f"\nAnalysis complete!")
    print(f"Results saved to: {output_path}")
    print(f"\nTo open in Phy:")
    print(f"  phy template-gui {output_path / 'phy_export' / 'params.py'}")


if __name__ == '__main__':
    main()
