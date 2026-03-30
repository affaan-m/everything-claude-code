# Spike Sorting Reference

Comprehensive guide to spike sorting Neuropixels data.

## Available Sorters

| Sorter | GPU Required | Speed | Quality | Best For |
|--------|--------------|-------|---------|----------|
| **Kilosort4** | Yes (CUDA) | Fast | Excellent | Production use |
| **Kilosort3** | Yes (CUDA) | Fast | Very Good | Legacy compatibility |
| **Kilosort2.5** | Yes (CUDA) | Fast | Good | Older pipelines |
| **SpykingCircus2** | No | Medium | Good | CPU-only systems |
| **Mountainsort5** | No | Medium | Good | Small recordings |
| **Tridesclous2** | No | Medium | Good | Interactive sorting |

## Kilosort4 (Recommended)

### Installation
```bash
pip install kilosort
```

### Basic Usage
```python
import spikeinterface.full as si

# Run Kilosort4
sorting = si.run_sorter(
    'kilosort4',
    recording,
    output_folder='ks4_output',
    verbose=True
)

print(f"Found {len(sorting.unit_ids)} units")
```

### Custom Parameters
```python
sorting = si.run_sorter(
    'kilosort4',
    recording,
    output_folder='ks4_output',
    # Detection
    Th_universal=9,        # Spike detection threshold
    Th_learned=8,          # Learned threshold
    # Templates
    dmin=15,               # Min vertical distance between templates (um)
    dminx=12,              # Min horizontal distance (um)
    nblocks=5,             # Number of non-rigid blocks
    # Clustering
    max_channel_distance=None,  # Max distance for template channel
    # Output
    do_CAR=False,          # Skip CAR (done in preprocessing)
    skip_kilosort_preprocessing=True,
    save_extra_kwargs=True
)
```

### Kilosort4 Full Parameters
```python
# Get all available parameters
params = si.get_default_sorter_params('kilosort4')
print(params)

# Key parameters:
ks4_params = {
    # Detection
    'Th_universal': 9,      # Universal threshold for spike detection
    'Th_learned': 8,        # Threshold for learned templates
    'spkTh': -6,            # Spike threshold during extraction

    # Clustering
    'dmin': 15,             # Min distance between clusters (um)
    'dminx': 12,            # Min horizontal distance (um)
    'nblocks': 5,           # Blocks for non-rigid drift correction

    # Templates
    'n_templates': 6,       # Number of universal templates per group
    'nt': 61,               # Number of time samples in template

    # Performance
    'batch_size': 60000,    # Batch size in samples
    'nfilt_factor': 8,      # Factor for number of filters
}
```

## Kilosort3

### Usage
```python
sorting = si.run_sorter(
    'kilosort3',
    recording,
    output_folder='ks3_output',
    # Key parameters
    detect_threshold=6,
    projection_threshold=[9, 9],
    preclust_threshold=8,
    car=False,  # CAR done in preprocessing
    freq_min=300,
)
```

## SpykingCircus2 (CPU-Only)

### Installation
```bash
pip install spykingcircus
```

### Usage
```python
sorting = si.run_sorter(
    'spykingcircus2',
    recording,
    output_folder='sc2_output',
    # Parameters
    detect_threshold=5,
    selection_method='all',
)
```

## Mountainsort5 (CPU-Only)

### Installation
```bash
pip install mountainsort5
```

### Usage
```python
sorting = si.run_sorter(
    'mountainsort5',
    recording,
    output_folder='ms5_output',
    # Parameters
    detect_threshold=5.0,
    scheme='2',  # '1', '2', or '3'
)
```

## Running Multiple Sorters

### Compare Sorters
```python
# Run multiple sorters
sorting_ks4 = si.run_sorter('kilosort4', recording, output_folder='ks4/')
sorting_sc2 = si.run_sorter('spykingcircus2', recording, output_folder='sc2/')
sorting_ms5 = si.run_sorter('mountainsort5', recording, output_folder='ms5/')

# Compare results
comparison = si.compare_multiple_sorters(
    [sorting_ks4, sorting_sc2, sorting_ms5],
    name_list=['KS4', 'SC2', 'MS5']
)

# Get agreement scores
agreement = comparison.get_agreement_sorting()
```

### Ensemble Sorting
```python
# Create consensus sorting
sorting_ensemble = si.create_ensemble_sorting(
    [sorting_ks4, sorting_sc2, sorting_ms5],
    voting_method='agreement',
    min_agreement=2  # Unit must be found by at least 2 sorters
)
```

## Sorting in Docker/Singularity

### Using Docker
```python
sorting = si.run_sorter(
    'kilosort3',
    recording,
    output_folder='ks3_docker/',
    docker_image='spikeinterface/kilosort3-compiled-base:latest',
    verbose=True
)
```

### Using Singularity
```python
sorting = si.run_sorter(
    'kilosort3',
    recording,
    output_folder='ks3_singularity/',
    singularity_image='/path/to/kilosort3.sif',
    verbose=True
)
```

## Long Recording Strategy

### Concatenate Recordings
```python
# Multiple recording files
recordings = [
    si.read_spikeglx(f'/path/to/recording_{i}', stream_id='imec0.ap')
    for i in range(3)
]

# Concatenate
recording_concat = si.concatenate_recordings(recordings)

# Sort
sorting = si.run_sorter('kilosort4', recording_concat, output_folder='ks4/')

# Split back by original recording
sortings_split = si.split_sorting(sorting, recording_concat)
```

### Sort by Segment
```python
# For very long recordings, sort segments separately
from pathlib import Path

segments_output = Path('sorting_segments')
sortings = []

for i, segment in enumerate(recording.split_by_times([0, 3600, 7200, 10800])):
    sorting_seg = si.run_sorter(
        'kilosort4',
        segment,
        output_folder=segments_output / f'segment_{i}'
    )
    sortings.append(sorting_seg)
```

## Post-Sorting Curation

### Manual Curation with Phy
```python
# Export to Phy format
analyzer = si.create_sorting_analyzer(sorting, recording)
analyzer.compute(['random_spikes', 'waveforms', 'templates'])
si.export_to_phy(analyzer, output_folder='phy_export/')

# Open Phy
# Run in terminal: phy template-gui phy_export/params.py
```

### Load Phy Curation
```python
# After manual curation in Phy
sorting_curated = si.read_phy('phy_export/')

# Or apply Phy labels
sorting_curated = si.apply_phy_curation(sorting, 'phy_export/')
```

### Automatic Curation
```python
# Remove units below quality threshold
analyzer = si.create_sorting_analyzer(sorting, recording)
analyzer.compute('quality_metrics')

qm = analyzer.get_extension('quality_metrics').get_data()

# Define quality criteria
query = "(snr > 5) & (isi_violations_ratio < 0.01) & (presence_ratio > 0.9)"
good_unit_ids = qm.query(query).index.tolist()

sorting_clean = sorting.select_units(good_unit_ids)
print(f"Kept {len(good_unit_ids)}/{len(sorting.unit_ids)} units")
```

## Sorting Metrics

### Check Sorter Output
```python
# Basic stats
print(f"Units found: {len(sorting.unit_ids)}")
print(f"Total spikes: {sorting.get_total_num_spikes()}")

# Per-unit spike counts
for unit_id in sorting.unit_ids[:10]:
    n_spikes = len(sorting.get_unit_spike_train(unit_id))
    print(f"Unit {unit_id}: {n_spikes} spikes")
```

### Firing Rates
```python
# Compute firing rates
duration = recording.get_total_duration()
for unit_id in sorting.unit_ids:
    n_spikes = len(sorting.get_unit_spike_train(unit_id))
    fr = n_spikes / duration
    print(f"Unit {unit_id}: {fr:.2f} Hz")
```

## Troubleshooting

### Common Issues

**Out of GPU Memory**
```python
# Reduce batch size
sorting = si.run_sorter(
    'kilosort4',
    recording,
    output_folder='ks4/',
    batch_size=30000  # Smaller batch
)
```

**Too Few Units Found**
```python
# Lower detection threshold
sorting = si.run_sorter(
    'kilosort4',
    recording,
    output_folder='ks4/',
    Th_universal=7,  # Lower from default 9
    Th_learned=6
)
```

**Too Many Units (Over-splitting)**
```python
# Increase minimum distance between templates
sorting = si.run_sorter(
    'kilosort4',
    recording,
    output_folder='ks4/',
    dmin=20,   # Increase from 15
    dminx=16   # Increase from 12
)
```

**Check GPU Availability**
```python
import torch
print(f"CUDA available: {torch.cuda.is_available()}")
print(f"GPU: {torch.cuda.get_device_name(0)}")
```
