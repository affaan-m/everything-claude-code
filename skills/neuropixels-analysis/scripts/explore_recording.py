#!/usr/bin/env python3
"""
Quick exploration of Neuropixels recording.

Usage:
    python explore_recording.py /path/to/spikeglx/data
"""

import argparse
import spikeinterface.full as si
import matplotlib.pyplot as plt
import numpy as np


def explore_recording(data_path: str, stream_id: str = 'imec0.ap'):
    """Explore a Neuropixels recording."""

    print(f"Loading: {data_path}")
    recording = si.read_spikeglx(data_path, stream_id=stream_id)

    # Basic info
    print("\n" + "="*50)
    print("RECORDING INFO")
    print("="*50)
    print(f"Channels: {recording.get_num_channels()}")
    print(f"Duration: {recording.get_total_duration():.2f} s ({recording.get_total_duration()/60:.2f} min)")
    print(f"Sampling rate: {recording.get_sampling_frequency()} Hz")
    print(f"Total samples: {recording.get_num_samples()}")

    # Probe info
    probe = recording.get_probe()
    print(f"\nProbe: {probe.manufacturer} {probe.model_name if hasattr(probe, 'model_name') else ''}")
    print(f"Probe shape: {probe.ndim}D")

    # Channel groups
    if recording.get_channel_groups() is not None:
        groups = np.unique(recording.get_channel_groups())
        print(f"Channel groups (shanks): {len(groups)}")

    # Check for bad channels
    print("\n" + "="*50)
    print("BAD CHANNEL DETECTION")
    print("="*50)
    bad_ids, labels = si.detect_bad_channels(recording)
    if len(bad_ids) > 0:
        print(f"Bad channels found: {len(bad_ids)}")
        for ch, label in zip(bad_ids, labels):
            print(f"  Channel {ch}: {label}")
    else:
        print("No bad channels detected")

    # Sample traces
    print("\n" + "="*50)
    print("SIGNAL STATISTICS")
    print("="*50)

    # Get 1 second of data
    n_samples = int(recording.get_sampling_frequency())
    traces = recording.get_traces(start_frame=0, end_frame=n_samples)

    print(f"Sample mean: {np.mean(traces):.2f}")
    print(f"Sample std: {np.std(traces):.2f}")
    print(f"Sample min: {np.min(traces):.2f}")
    print(f"Sample max: {np.max(traces):.2f}")

    return recording


def plot_probe(recording, output_path=None):
    """Plot probe layout."""
    fig, ax = plt.subplots(figsize=(4, 12))
    si.plot_probe_map(recording, ax=ax, with_channel_ids=False)
    ax.set_title('Probe Layout')

    if output_path:
        plt.savefig(output_path, dpi=150, bbox_inches='tight')
        print(f"Saved: {output_path}")
    else:
        plt.show()


def plot_traces(recording, duration=1.0, output_path=None):
    """Plot raw traces."""
    n_samples = int(duration * recording.get_sampling_frequency())
    traces = recording.get_traces(start_frame=0, end_frame=n_samples)

    fig, ax = plt.subplots(figsize=(12, 8))

    # Plot subset of channels
    n_channels = min(20, recording.get_num_channels())
    channel_idx = np.linspace(0, recording.get_num_channels()-1, n_channels, dtype=int)

    time = np.arange(n_samples) / recording.get_sampling_frequency()

    for i, ch in enumerate(channel_idx):
        offset = i * 200  # Offset for visibility
        ax.plot(time, traces[:, ch] + offset, 'k', linewidth=0.5)

    ax.set_xlabel('Time (s)')
    ax.set_ylabel('Channel (offset)')
    ax.set_title(f'Raw Traces ({n_channels} channels)')

    if output_path:
        plt.savefig(output_path, dpi=150, bbox_inches='tight')
        print(f"Saved: {output_path}")
    else:
        plt.show()


def plot_power_spectrum(recording, output_path=None):
    """Plot power spectrum."""
    from scipy import signal

    # Get data from middle channel
    mid_ch = recording.get_num_channels() // 2
    n_samples = min(int(10 * recording.get_sampling_frequency()), recording.get_num_samples())

    traces = recording.get_traces(
        start_frame=0,
        end_frame=n_samples,
        channel_ids=[recording.channel_ids[mid_ch]]
    ).flatten()

    fs = recording.get_sampling_frequency()

    # Compute power spectrum
    freqs, psd = signal.welch(traces, fs, nperseg=4096)

    fig, ax = plt.subplots(figsize=(10, 5))
    ax.semilogy(freqs, psd)
    ax.set_xlabel('Frequency (Hz)')
    ax.set_ylabel('Power Spectral Density')
    ax.set_title(f'Power Spectrum (Channel {mid_ch})')
    ax.set_xlim(0, 5000)
    ax.axvline(300, color='r', linestyle='--', alpha=0.5, label='300 Hz')
    ax.axvline(6000, color='r', linestyle='--', alpha=0.5, label='6000 Hz')
    ax.legend()
    ax.grid(True, alpha=0.3)

    if output_path:
        plt.savefig(output_path, dpi=150, bbox_inches='tight')
        print(f"Saved: {output_path}")
    else:
        plt.show()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Explore Neuropixels recording')
    parser.add_argument('data_path', help='Path to SpikeGLX recording')
    parser.add_argument('--stream', default='imec0.ap', help='Stream ID')
    parser.add_argument('--plot', action='store_true', help='Generate plots')
    parser.add_argument('--output', default=None, help='Output directory for plots')

    args = parser.parse_args()

    recording = explore_recording(args.data_path, args.stream)

    if args.plot:
        import os
        if args.output:
            os.makedirs(args.output, exist_ok=True)
            plot_probe(recording, f"{args.output}/probe_map.png")
            plot_traces(recording, output_path=f"{args.output}/raw_traces.png")
            plot_power_spectrum(recording, f"{args.output}/power_spectrum.png")
        else:
            plot_probe(recording)
            plot_traces(recording)
            plot_power_spectrum(recording)
