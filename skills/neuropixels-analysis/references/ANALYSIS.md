# Post-Processing & Analysis Reference

Comprehensive guide to quality metrics, visualization, and analysis of sorted Neuropixels data.

## Sorting Analyzer

The `SortingAnalyzer` is the central object for post-processing.

### Create Analyzer
```python
import spikeinterface.full as si

# Create analyzer
analyzer = si.create_sorting_analyzer(
    sorting,
    recording,
    sparse=True,                    # Use sparse representation
    format='binary_folder',         # Storage format
    folder='analyzer_output'        # Save location
)
```

### Compute Extensions
```python
# Compute all standard extensions
analyzer.compute('random_spikes')       # Random spike selection
analyzer.compute('waveforms')           # Extract waveforms
analyzer.compute('templates')           # Compute templates
analyzer.compute('noise_levels')        # Noise estimation
analyzer.compute('principal_components')  # PCA
analyzer.compute('spike_amplitudes')    # Amplitude per spike
analyzer.compute('correlograms')        # Auto/cross correlograms
analyzer.compute('unit_locations')      # Unit locations
analyzer.compute('spike_locations')     # Per-spike locations
analyzer.compute('template_similarity') # Template similarity matrix
analyzer.compute('quality_metrics')     # Quality metrics

# Or compute multiple at once
analyzer.compute([
    'random_spikes', 'waveforms', 'templates', 'noise_levels',
    'principal_components', 'spike_amplitudes', 'correlograms',
    'unit_locations', 'quality_metrics'
])
```

### Save and Load
```python
# Save
analyzer.save_as(folder='analyzer_saved', format='binary_folder')

# Load
analyzer = si.load_sorting_analyzer('analyzer_saved')
```

## Quality Metrics

### Compute Metrics
```python
analyzer.compute('quality_metrics')
qm = analyzer.get_extension('quality_metrics').get_data()
print(qm)
```

### Available Metrics

| Metric | Description | Good Values |
|--------|-------------|-------------|
| `snr` | Signal-to-noise ratio | > 5 |
| `isi_violations_ratio` | ISI violation ratio | < 0.01 (1%) |
| `isi_violations_count` | ISI violation count | Low |
| `presence_ratio` | Fraction of recording with spikes | > 0.9 |
| `firing_rate` | Spikes per second | 0.1-50 Hz |
| `amplitude_cutoff` | Estimated missed spikes | < 0.1 |
| `amplitude_median` | Median spike amplitude | - |
| `amplitude_cv` | Coefficient of variation | < 0.5 |
| `drift_ptp` | Peak-to-peak drift (um) | < 40 |
| `drift_std` | Standard deviation of drift | < 10 |
| `drift_mad` | Median absolute deviation | < 10 |
| `sliding_rp_violation` | Sliding refractory period | < 0.05 |
| `sync_spike_2` | Synchrony with other units | < 0.5 |
| `isolation_distance` | Mahalanobis distance | > 20 |
| `l_ratio` | L-ratio (isolation) | < 0.1 |
| `d_prime` | Discriminability | > 5 |
| `nn_hit_rate` | Nearest neighbor hit rate | > 0.9 |
| `nn_miss_rate` | Nearest neighbor miss rate | < 0.1 |
| `silhouette_score` | Cluster silhouette | > 0.5 |

### Compute Specific Metrics
```python
analyzer.compute(
    'quality_metrics',
    metric_names=['snr', 'isi_violations_ratio', 'presence_ratio', 'firing_rate']
)
```

### Custom Quality Thresholds
```python
qm = analyzer.get_extension('quality_metrics').get_data()

# Define quality criteria
quality_criteria = {
    'snr': ('>', 5),
    'isi_violations_ratio': ('<', 0.01),
    'presence_ratio': ('>', 0.9),
    'firing_rate': ('>', 0.1),
    'amplitude_cutoff': ('<', 0.1),
}

# Filter good units
good_units = qm.query(
    "(snr > 5) & (isi_violations_ratio < 0.01) & (presence_ratio > 0.9)"
).index.tolist()

print(f"Good units: {len(good_units)}/{len(qm)}")
```

## Waveforms & Templates

### Extract Waveforms
```python
analyzer.compute('waveforms', ms_before=1.5, ms_after=2.5, max_spikes_per_unit=500)

# Get waveforms for a unit
waveforms = analyzer.get_extension('waveforms').get_waveforms(unit_id=0)
print(f"Shape: {waveforms.shape}")  # (n_spikes, n_samples, n_channels)
```

### Compute Templates
```python
analyzer.compute('templates', operators=['average', 'std', 'median'])

# Get template
templates_ext = analyzer.get_extension('templates')
template = templates_ext.get_unit_template(unit_id=0, operator='average')
```

### Template Similarity
```python
analyzer.compute('template_similarity')
sim = analyzer.get_extension('template_similarity').get_data()
# Matrix of cosine similarities between templates
```

## Unit Locations

### Compute Locations
```python
analyzer.compute('unit_locations', method='monopolar_triangulation')
locations = analyzer.get_extension('unit_locations').get_data()
print(locations)  # x, y coordinates per unit
```

### Spike Locations
```python
analyzer.compute('spike_locations', method='center_of_mass')
spike_locs = analyzer.get_extension('spike_locations').get_data()
```

### Location Methods
- `'center_of_mass'` - Fast, less accurate
- `'monopolar_triangulation'` - More accurate, slower
- `'grid_convolution'` - Good balance

## Correlograms

### Auto-correlograms
```python
analyzer.compute('correlograms', window_ms=50, bin_ms=1)
correlograms, bins = analyzer.get_extension('correlograms').get_data()

# correlograms shape: (n_units, n_units, n_bins)
# Auto-correlogram for unit i: correlograms[i, i, :]
# Cross-correlogram units i,j: correlograms[i, j, :]
```

## Visualization

### Probe Map
```python
si.plot_probe_map(recording, with_channel_ids=True)
```

### Unit Templates
```python
# All units
si.plot_unit_templates(analyzer)

# Specific units
si.plot_unit_templates(analyzer, unit_ids=[0, 1, 2])
```

### Waveforms
```python
# Plot waveforms with template
si.plot_unit_waveforms(analyzer, unit_ids=[0])

# Waveform density
si.plot_unit_waveforms_density_map(analyzer, unit_id=0)
```

### Raster Plot
```python
si.plot_rasters(sorting, time_range=(0, 10))  # First 10 seconds
```

### Amplitudes
```python
analyzer.compute('spike_amplitudes')
si.plot_amplitudes(analyzer)

# Distribution
si.plot_all_amplitudes_distributions(analyzer)
```

### Correlograms
```python
# Auto-correlograms
si.plot_autocorrelograms(analyzer, unit_ids=[0, 1, 2])

# Cross-correlograms
si.plot_crosscorrelograms(analyzer, unit_ids=[0, 1])
```

### Quality Metrics
```python
# Summary plot
si.plot_quality_metrics(analyzer)

# Specific metric distribution
import matplotlib.pyplot as plt
qm = analyzer.get_extension('quality_metrics').get_data()
plt.hist(qm['snr'], bins=50)
plt.xlabel('SNR')
plt.ylabel('Count')
```

### Unit Locations on Probe
```python
si.plot_unit_locations(analyzer)
```

### Drift Map
```python
si.plot_drift_raster(sorting, recording)
```

### Summary Plot
```python
# Comprehensive unit summary
si.plot_unit_summary(analyzer, unit_id=0)
```

## LFP Analysis

### Load LFP Data
```python
lfp = si.read_spikeglx('/path/to/data', stream_id='imec0.lf')
print(f"LFP: {lfp.get_sampling_frequency()} Hz")
```

### Basic LFP Processing
```python
# Downsample if needed
lfp_ds = si.resample(lfp, resample_rate=1000)

# Common average reference
lfp_car = si.common_reference(lfp_ds, reference='global', operator='median')
```

### Extract LFP Traces
```python
import numpy as np

# Get traces (channels x samples)
traces = lfp.get_traces(start_frame=0, end_frame=30000)

# Specific channels
traces = lfp.get_traces(channel_ids=[0, 1, 2])
```

### Spectral Analysis
```python
from scipy import signal
import matplotlib.pyplot as plt

# Get single channel
trace = lfp.get_traces(channel_ids=[0]).flatten()
fs = lfp.get_sampling_frequency()

# Power spectrum
freqs, psd = signal.welch(trace, fs, nperseg=4096)
plt.semilogy(freqs, psd)
plt.xlabel('Frequency (Hz)')
plt.ylabel('Power')
plt.xlim(0, 100)
```

### Spectrogram
```python
f, t, Sxx = signal.spectrogram(trace, fs, nperseg=2048, noverlap=1024)
plt.pcolormesh(t, f, 10*np.log10(Sxx), shading='gouraud')
plt.ylabel('Frequency (Hz)')
plt.xlabel('Time (s)')
plt.ylim(0, 100)
plt.colorbar(label='Power (dB)')
```

## Export Formats

### Export to Phy
```python
si.export_to_phy(
    analyzer,
    output_folder='phy_export',
    compute_pc_features=True,
    compute_amplitudes=True,
    copy_binary=True
)
# Then: phy template-gui phy_export/params.py
```

### Export to NWB
```python
from spikeinterface.exporters import export_to_nwb

export_to_nwb(
    recording,
    sorting,
    'output.nwb',
    metadata=dict(
        session_description='Neuropixels recording',
        experimenter='Name',
        lab='Lab name',
        institution='Institution'
    )
)
```

### Export Report
```python
si.export_report(
    analyzer,
    output_folder='report',
    remove_if_exists=True,
    format='html'
)
```

## Complete Analysis Pipeline

```python
import spikeinterface.full as si

def analyze_sorting(recording, sorting, output_dir):
    """Complete post-processing pipeline."""

    # Create analyzer
    analyzer = si.create_sorting_analyzer(
        sorting, recording,
        sparse=True,
        folder=f'{output_dir}/analyzer'
    )

    # Compute all extensions
    print("Computing extensions...")
    analyzer.compute(['random_spikes', 'waveforms', 'templates', 'noise_levels'])
    analyzer.compute(['principal_components', 'spike_amplitudes'])
    analyzer.compute(['correlograms', 'unit_locations', 'template_similarity'])
    analyzer.compute('quality_metrics')

    # Get quality metrics
    qm = analyzer.get_extension('quality_metrics').get_data()

    # Filter good units
    good_units = qm.query(
        "(snr > 5) & (isi_violations_ratio < 0.01) & (presence_ratio > 0.9)"
    ).index.tolist()

    print(f"Quality filtering: {len(good_units)}/{len(qm)} units passed")

    # Export
    si.export_to_phy(analyzer, f'{output_dir}/phy')
    si.export_report(analyzer, f'{output_dir}/report')

    # Save metrics
    qm.to_csv(f'{output_dir}/quality_metrics.csv')

    return analyzer, qm, good_units

# Usage
analyzer, qm, good_units = analyze_sorting(recording, sorting, 'output/')
```
