#!/usr/bin/env python
"""
Preprocess Neuropixels recording.

Usage:
    python preprocess_recording.py /path/to/data --output preprocessed/ --format spikeglx
"""

import argparse
from pathlib import Path

import spikeinterface.full as si


def preprocess_recording(
    input_path: str,
    output_dir: str,
    format: str = 'auto',
    stream_id: str = None,
    freq_min: float = 300,
    freq_max: float = 6000,
    phase_shift: bool = True,
    common_ref: bool = True,
    detect_bad: bool = True,
    n_jobs: int = -1,
):
    """Preprocess a Neuropixels recording."""

    print(f"Loading recording from: {input_path}")

    # Load recording
    if format == 'spikeglx' or (format == 'auto' and 'imec' in str(input_path).lower()):
        recording = si.read_spikeglx(input_path, stream_id=stream_id or 'imec0.ap')
    elif format == 'openephys':
        recording = si.read_openephys(input_path)
    elif format == 'nwb':
        recording = si.read_nwb(input_path)
    else:
        # Try auto-detection
        try:
            recording = si.read_spikeglx(input_path, stream_id=stream_id or 'imec0.ap')
        except:
            recording = si.load_extractor(input_path)

    print(f"Recording: {recording.get_num_channels()} channels, {recording.get_total_duration():.1f}s")

    # Preprocessing chain
    rec = recording

    # Bandpass filter
    print(f"Applying bandpass filter ({freq_min}-{freq_max} Hz)...")
    rec = si.bandpass_filter(rec, freq_min=freq_min, freq_max=freq_max)

    # Phase shift correction (for Neuropixels ADC)
    if phase_shift:
        print("Applying phase shift correction...")
        rec = si.phase_shift(rec)

    # Bad channel detection
    if detect_bad:
        print("Detecting bad channels...")
        bad_channel_ids, bad_labels = si.detect_bad_channels(rec)
        if len(bad_channel_ids) > 0:
            print(f"  Removing {len(bad_channel_ids)} bad channels: {bad_channel_ids[:10]}...")
            rec = rec.remove_channels(bad_channel_ids)

    # Common median reference
    if common_ref:
        print("Applying common median reference...")
        rec = si.common_reference(rec, operator='median', reference='global')

    # Save preprocessed
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    print(f"Saving preprocessed recording to: {output_path}")
    rec.save(folder=output_path / 'preprocessed', n_jobs=n_jobs)

    # Save probe info
    probe = rec.get_probe()
    if probe is not None:
        from probeinterface import write_probeinterface
        write_probeinterface(output_path / 'probe.json', probe)

    print("Done!")
    print(f"  Output channels: {rec.get_num_channels()}")
    print(f"  Output duration: {rec.get_total_duration():.1f}s")

    return rec


def main():
    parser = argparse.ArgumentParser(description='Preprocess Neuropixels recording')
    parser.add_argument('input', help='Path to input recording')
    parser.add_argument('--output', '-o', default='preprocessed/', help='Output directory')
    parser.add_argument('--format', '-f', default='auto', choices=['auto', 'spikeglx', 'openephys', 'nwb'])
    parser.add_argument('--stream-id', default=None, help='Stream ID for multi-probe recordings')
    parser.add_argument('--freq-min', type=float, default=300, help='Highpass cutoff (Hz)')
    parser.add_argument('--freq-max', type=float, default=6000, help='Lowpass cutoff (Hz)')
    parser.add_argument('--no-phase-shift', action='store_true', help='Skip phase shift correction')
    parser.add_argument('--no-cmr', action='store_true', help='Skip common median reference')
    parser.add_argument('--no-bad-channel', action='store_true', help='Skip bad channel detection')
    parser.add_argument('--n-jobs', type=int, default=-1, help='Number of parallel jobs')

    args = parser.parse_args()

    preprocess_recording(
        args.input,
        args.output,
        format=args.format,
        stream_id=args.stream_id,
        freq_min=args.freq_min,
        freq_max=args.freq_max,
        phase_shift=not args.no_phase_shift,
        common_ref=not args.no_cmr,
        detect_bad=not args.no_bad_channel,
        n_jobs=args.n_jobs,
    )


if __name__ == '__main__':
    main()
