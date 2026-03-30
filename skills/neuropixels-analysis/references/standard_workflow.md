# Standard Neuropixels Analysis Workflow

Complete step-by-step guide for analyzing Neuropixels recordings from raw data to curated units.

## Overview

This reference documents the complete analysis pipeline:

```
Raw Recording → Preprocessing → Motion Correction → Spike Sorting →
Postprocessing → Quality Metrics → Curation → Export
```

## 1. Data Loading

### Supported Formats

```python
import spikeinterface.full as si
import neuropixels_analysis as npa

# SpikeGLX (most common)
recording = si.read_spikeglx('/path/to/run/', stream_id='imec0.ap')

# Open Ephys
recording = si.read_openephys('/path/to/experiment/')

# NWB format
recording = si.read_nwb('/path/to/file.nwb')

# Or use our convenience wrapper
recording = npa.load_recording('/path/to/data/', format='spikeglx')
```

### Verify Recording Properties

```python
# Basic properties
print(f"Channels: {recording.get_num_channels()}")
print(f"Duration: {recording.get_total_duration():.1f}s")
print(f"Sampling rate: {recording.get_sampling_frequency()}Hz")

# Probe geometry
print(f"Probe: {recording.get_probe().name}")

# Channel locations
locations = recording.get_channel_locations()
```

## 2. Preprocessing

### Standard Preprocessing Chain

```python
# Option 1: Full pipeline (recommended)
rec_preprocessed = npa.preprocess(recording)

# Option 2: Step-by-step control
rec = si.bandpass_filter(recording, freq_min=300, freq_max=6000)
rec = si.phase_shift(rec)  # Correct ADC phase
bad_channels = si.detect_bad_channels(rec)
rec = rec.remove_channels(bad_channels)
rec = si.common_reference(rec, operator='median')
rec_preprocessed = rec
```

### IBL-Style Destriping

For recordings with strong artifacts:

```python
from ibldsp.voltage import decompress_destripe_cbin

# IBL destriping (very effective)
rec = si.highpass_filter(recording, freq_min=400)
rec = si.phase_shift(rec)
rec = si.highpass_spatial_filter(rec)  # Destriping
rec = si.common_reference(rec, reference='global', operator='median')
```

### Save Preprocessed Data

```python
# Save for reuse (speeds up iteration)
rec_preprocessed.save(folder='preprocessed/', n_jobs=4)
```

## 3. Motion/Drift Correction

### Check if Correction Needed

```python
# Estimate motion
motion_info = npa.estimate_motion(rec_preprocessed, preset='kilosort_like')

# Visualize drift
npa.plot_drift(rec_preprocessed, motion_info, output='drift_map.png')

# Check magnitude
if motion_info['motion'].max() > 10:  # microns
    print("Significant drift detected - correction recommended")
```

### Apply Correction

```python
# DREDge-based correction (default)
rec_corrected = npa.correct_motion(
    rec_preprocessed,
    preset='nonrigid_accurate',  # or 'kilosort_like' for speed
)

# Or full control
from spikeinterface.preprocessing import correct_motion

rec_corrected = correct_motion(
    rec_preprocessed,
    preset='nonrigid_accurate',
    folder='motion_output/',
    output_motion=True,
)
```

## 4. Spike Sorting

### Recommended: Kilosort4

```python
# Run Kilosort4 (requires GPU)
sorting = npa.run_sorting(
    rec_corrected,
    sorter='kilosort4',
    output_folder='sorting_KS4/',
)

# With custom parameters
sorting = npa.run_sorting(
    rec_corrected,
    sorter='kilosort4',
    output_folder='sorting_KS4/',
    sorter_params={
        'batch_size': 30000,
        'nblocks': 5,  # For nonrigid drift
        'Th_learned': 8,  # Detection threshold
    },
)
```

### Alternative Sorters

```python
# SpykingCircus2 (CPU-based)
sorting = npa.run_sorting(rec_corrected, sorter='spykingcircus2')

# Mountainsort5 (fast, good for short recordings)
sorting = npa.run_sorting(rec_corrected, sorter='mountainsort5')
```

### Compare Multiple Sorters

```python
# Run multiple sorters
sortings = {}
for sorter in ['kilosort4', 'spykingcircus2']:
    sortings[sorter] = npa.run_sorting(rec_corrected, sorter=sorter)

# Compare results
comparison = npa.compare_sorters(list(sortings.values()))
agreement_matrix = comparison.get_agreement_matrix()
```

## 5. Postprocessing

### Create Analyzer

```python
# Create sorting analyzer (central object for all postprocessing)
analyzer = npa.create_analyzer(
    sorting,
    rec_corrected,
    output_folder='analyzer/',
)

# Compute all standard extensions
analyzer = npa.postprocess(
    sorting,
    rec_corrected,
    output_folder='analyzer/',
    compute_all=True,  # Waveforms, templates, metrics, etc.
)
```

### Compute Individual Extensions

```python
# Waveforms
analyzer.compute('waveforms', ms_before=1.0, ms_after=2.0, max_spikes_per_unit=500)

# Templates
analyzer.compute('templates', operators=['average', 'std'])

# Spike amplitudes
analyzer.compute('spike_amplitudes')

# Correlograms
analyzer.compute('correlograms', window_ms=50.0, bin_ms=1.0)

# Unit locations
analyzer.compute('unit_locations', method='monopolar_triangulation')

# Spike locations
analyzer.compute('spike_locations', method='center_of_mass')
```

## 6. Quality Metrics

### Compute All Metrics

```python
# Compute comprehensive metrics
metrics = npa.compute_quality_metrics(
    analyzer,
    metric_names=[
        'snr',
        'isi_violations_ratio',
        'presence_ratio',
        'amplitude_cutoff',
        'firing_rate',
        'amplitude_cv',
        'sliding_rp_violation',
        'd_prime',
        'nearest_neighbor',
    ],
)

# View metrics
print(metrics.head())
```

### Key Metrics Explained

| Metric | Good Value | Description |
|--------|------------|-------------|
| `snr` | > 5 | Signal-to-noise ratio |
| `isi_violations_ratio` | < 0.01 | Refractory period violations |
| `presence_ratio` | > 0.9 | Fraction of recording with spikes |
| `amplitude_cutoff` | < 0.1 | Estimated missed spikes |
| `firing_rate` | > 0.1 Hz | Average firing rate |

## 7. Curation

### Automated Curation

```python
# Allen Institute criteria
labels = npa.curate(metrics, method='allen')

# IBL criteria
labels = npa.curate(metrics, method='ibl')

# Custom thresholds
labels = npa.curate(
    metrics,
    snr_threshold=5,
    isi_violations_threshold=0.01,
    presence_threshold=0.9,
)
```

### AI-Assisted Curation

```python
from anthropic import Anthropic

# Setup API
client = Anthropic()

# Visual analysis for uncertain units
uncertain = metrics.query('snr > 3 and snr < 8').index.tolist()

for unit_id in uncertain:
    result = npa.analyze_unit_visually(analyzer, unit_id, api_client=client)
    labels[unit_id] = result['classification']
```

### Interactive Curation Session

```python
# Create session
session = npa.CurationSession.create(analyzer, output_dir='curation/')

# Review units
while session.current_unit():
    unit = session.current_unit()
    report = npa.generate_unit_report(analyzer, unit.unit_id)

    # Your decision
    decision = input(f"Unit {unit.unit_id}: ")
    session.set_decision(unit.unit_id, decision)
    session.next_unit()

# Export
labels = session.get_final_labels()
```

## 8. Export Results

### Export to Phy

```python
from spikeinterface.exporters import export_to_phy

export_to_phy(
    analyzer,
    output_folder='phy_export/',
    copy_binary=True,
)
```

### Export to NWB

```python
from spikeinterface.exporters import export_to_nwb

export_to_nwb(
    analyzer,
    nwbfile_path='results.nwb',
    metadata={
        'session_description': 'Neuropixels recording',
        'experimenter': 'Lab Name',
    },
)
```

### Save Quality Summary

```python
# Save metrics CSV
metrics.to_csv('quality_metrics.csv')

# Save labels
import json
with open('curation_labels.json', 'w') as f:
    json.dump(labels, f, indent=2)

# Generate summary report
npa.plot_quality_metrics(analyzer, metrics, output='quality_summary.png')
```

## Full Pipeline Example

```python
import neuropixels_analysis as npa

# Load
recording = npa.load_recording('/data/experiment/', format='spikeglx')

# Preprocess
rec = npa.preprocess(recording)

# Motion correction
rec = npa.correct_motion(rec)

# Sort
sorting = npa.run_sorting(rec, sorter='kilosort4')

# Postprocess
analyzer, metrics = npa.postprocess(sorting, rec)

# Curate
labels = npa.curate(metrics, method='allen')

# Export good units
good_units = [uid for uid, label in labels.items() if label == 'good']
print(f"Good units: {len(good_units)}/{len(labels)}")
```

## Tips for Success

1. **Always visualize drift** before deciding on motion correction
2. **Save preprocessed data** to avoid recomputing
3. **Compare multiple sorters** for critical experiments
4. **Review uncertain units manually** - don't trust automated curation blindly
5. **Document your parameters** for reproducibility
6. **Use GPU** for Kilosort4 (10-50x faster than CPU alternatives)
