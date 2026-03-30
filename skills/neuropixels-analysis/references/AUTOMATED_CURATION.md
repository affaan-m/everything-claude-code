# Automated Curation Reference

Guide to automated spike sorting curation using Bombcell, UnitRefine, and other tools.

## Why Automated Curation?

Manual curation is:
- **Slow**: Hours per recording session
- **Subjective**: Inter-rater variability
- **Non-reproducible**: Hard to standardize

Automated tools provide consistent, reproducible quality classification.

## Available Tools

| Tool | Classification | Language | Integration |
|------|---------------|----------|-------------|
| **Bombcell** | 4-class (single/multi/noise/non-somatic) | Python/MATLAB | SpikeInterface, Phy |
| **UnitRefine** | Machine learning-based | Python | SpikeInterface |
| **SpikeInterface QM** | Threshold-based | Python | Native |
| **UnitMatch** | Cross-session tracking | Python/MATLAB | Kilosort, Bombcell |

## Bombcell

### Overview

Bombcell classifies units into 4 categories:
1. **Single somatic units** - Well-isolated single neurons
2. **Multi-unit activity (MUA)** - Mixed neuronal signals
3. **Noise** - Non-neural artifacts
4. **Non-somatic** - Axonal or dendritic signals

### Installation

```bash
# Python
pip install bombcell

# Or development version
git clone https://github.com/Julie-Fabre/bombcell.git
cd bombcell/py_bombcell
pip install -e .
```

### Basic Usage (Python)

```python
import bombcell as bc

# Load sorted data (Kilosort output)
kilosort_folder = '/path/to/kilosort/output'
raw_data_path = '/path/to/recording.ap.bin'

# Run Bombcell
results = bc.run_bombcell(
    kilosort_folder,
    raw_data_path,
    sample_rate=30000,
    n_channels=384
)

# Get classifications
unit_labels = results['unit_labels']
# 'good' = single unit, 'mua' = multi-unit, 'noise' = noise
```

### Integration with SpikeInterface

```python
import spikeinterface.full as si

# After spike sorting
sorting = si.run_sorter('kilosort4', recording, output_folder='ks4/')

# Create analyzer and compute required extensions
analyzer = si.create_sorting_analyzer(sorting, recording, sparse=True)
analyzer.compute('waveforms')
analyzer.compute('templates')
analyzer.compute('spike_amplitudes')

# Export to Phy format (Bombcell can read this)
si.export_to_phy(analyzer, output_folder='phy_export/')

# Run Bombcell on Phy export
import bombcell as bc
results = bc.run_bombcell_phy('phy_export/')
```

### Bombcell Metrics

Bombcell computes specific metrics for classification:

| Metric | Description | Used For |
|--------|-------------|----------|
| `peak_trough_ratio` | Waveform shape | Somatic vs non-somatic |
| `spatial_decay` | Amplitude across channels | Noise detection |
| `refractory_period_violations` | ISI violations | Single vs multi |
| `presence_ratio` | Temporal stability | Unit quality |
| `waveform_duration` | Peak-to-trough time | Cell type |

### Custom Thresholds

```python
# Customize classification thresholds
custom_params = {
    'isi_threshold': 0.01,          # ISI violation threshold
    'presence_threshold': 0.9,       # Minimum presence ratio
    'amplitude_threshold': 20,       # Minimum amplitude (μV)
    'spatial_decay_threshold': 40,   # Spatial decay (μm)
}

results = bc.run_bombcell(
    kilosort_folder,
    raw_data_path,
    **custom_params
)
```

## SpikeInterface Auto-Curation

### Threshold-Based Curation

```python
# Compute quality metrics
analyzer.compute('quality_metrics')
qm = analyzer.get_extension('quality_metrics').get_data()

# Define curation function
def auto_curate(qm):
    labels = {}
    for unit_id in qm.index:
        row = qm.loc[unit_id]

        # Classification logic
        if row['snr'] < 2 or row['presence_ratio'] < 0.5:
            labels[unit_id] = 'noise'
        elif row['isi_violations_ratio'] > 0.1:
            labels[unit_id] = 'mua'
        elif (row['snr'] > 5 and
              row['isi_violations_ratio'] < 0.01 and
              row['presence_ratio'] > 0.9):
            labels[unit_id] = 'good'
        else:
            labels[unit_id] = 'unsorted'

    return labels

unit_labels = auto_curate(qm)

# Filter by label
good_unit_ids = [u for u, l in unit_labels.items() if l == 'good']
sorting_curated = sorting.select_units(good_unit_ids)
```

### Using SpikeInterface Curation Module

```python
from spikeinterface.curation import (
    CurationSorting,
    MergeUnitsSorting,
    SplitUnitSorting
)

# Wrap sorting for curation
curation = CurationSorting(sorting)

# Remove noise units
noise_units = qm[qm['snr'] < 2].index.tolist()
curation.remove_units(noise_units)

# Merge similar units (based on template similarity)
analyzer.compute('template_similarity')
similarity = analyzer.get_extension('template_similarity').get_data()

# Find highly similar pairs
import numpy as np
threshold = 0.9
similar_pairs = np.argwhere(similarity > threshold)
# Merge pairs (careful - requires manual review)

# Get curated sorting
sorting_curated = curation.to_sorting()
```

## UnitMatch: Cross-Session Tracking

Track the same neurons across recording days.

### Installation

```bash
pip install unitmatch
# Or from source
git clone https://github.com/EnnyvanBeest/UnitMatch.git
```

### Usage

```python
# After running Bombcell on multiple sessions
session_folders = [
    '/path/to/session1/kilosort/',
    '/path/to/session2/kilosort/',
    '/path/to/session3/kilosort/',
]

from unitmatch import UnitMatch

# Run UnitMatch
um = UnitMatch(session_folders)
um.run()

# Get matching results
matches = um.get_matches()
# Returns DataFrame with unit IDs matched across sessions

# Assign unique IDs
unique_ids = um.get_unique_ids()
```

### Integration with Workflow

```python
# Typical workflow:
# 1. Spike sort each session
# 2. Run Bombcell for quality control
# 3. Run UnitMatch for cross-session tracking

# Session 1
sorting1 = si.run_sorter('kilosort4', rec1, output_folder='session1/ks4/')
# Run Bombcell
labels1 = bc.run_bombcell('session1/ks4/', raw1_path)

# Session 2
sorting2 = si.run_sorter('kilosort4', rec2, output_folder='session2/ks4/')
labels2 = bc.run_bombcell('session2/ks4/', raw2_path)

# Track units across sessions
um = UnitMatch(['session1/ks4/', 'session2/ks4/'])
matches = um.get_matches()
```

## Semi-Automated Workflow

Combine automated and manual curation:

```python
# Step 1: Automated classification
analyzer.compute('quality_metrics')
qm = analyzer.get_extension('quality_metrics').get_data()

# Auto-label obvious cases
auto_labels = {}
for unit_id in qm.index:
    row = qm.loc[unit_id]
    if row['snr'] < 1.5:
        auto_labels[unit_id] = 'noise'
    elif row['snr'] > 8 and row['isi_violations_ratio'] < 0.005:
        auto_labels[unit_id] = 'good'
    else:
        auto_labels[unit_id] = 'needs_review'

# Step 2: Export uncertain units for manual review
needs_review = [u for u, l in auto_labels.items() if l == 'needs_review']

# Export only uncertain units to Phy
sorting_review = sorting.select_units(needs_review)
analyzer_review = si.create_sorting_analyzer(sorting_review, recording)
analyzer_review.compute('waveforms')
analyzer_review.compute('templates')
si.export_to_phy(analyzer_review, output_folder='phy_review/')

# Manual review in Phy: phy template-gui phy_review/params.py

# Step 3: Load manual labels and merge
manual_labels = si.read_phy('phy_review/').get_property('quality')
# Combine auto + manual labels for final result
```

## Comparison of Methods

| Method | Pros | Cons |
|--------|------|------|
| **Manual (Phy)** | Gold standard, flexible | Slow, subjective |
| **SpikeInterface QM** | Fast, reproducible | Simple thresholds only |
| **Bombcell** | Multi-class, validated | Requires waveform extraction |
| **UnitRefine** | ML-based, learns from data | Needs training data |

## Best Practices

1. **Always visualize** - Don't blindly trust automated results
2. **Document thresholds** - Record exact parameters used
3. **Validate** - Compare automated vs manual on subset
4. **Be conservative** - When in doubt, exclude the unit
5. **Report methods** - Include curation criteria in publications

## Pipeline Example

```python
def curate_sorting(sorting, recording, output_dir):
    """Complete curation pipeline."""

    # Create analyzer
    analyzer = si.create_sorting_analyzer(sorting, recording, sparse=True,
                                          folder=f'{output_dir}/analyzer')

    # Compute required extensions
    analyzer.compute('random_spikes', max_spikes_per_unit=500)
    analyzer.compute('waveforms')
    analyzer.compute('templates')
    analyzer.compute('noise_levels')
    analyzer.compute('spike_amplitudes')
    analyzer.compute('quality_metrics')

    qm = analyzer.get_extension('quality_metrics').get_data()

    # Auto-classify
    labels = {}
    for unit_id in qm.index:
        row = qm.loc[unit_id]

        if row['snr'] < 2:
            labels[unit_id] = 'noise'
        elif row['isi_violations_ratio'] > 0.1 or row['presence_ratio'] < 0.8:
            labels[unit_id] = 'mua'
        elif (row['snr'] > 5 and
              row['isi_violations_ratio'] < 0.01 and
              row['presence_ratio'] > 0.9 and
              row['amplitude_cutoff'] < 0.1):
            labels[unit_id] = 'good'
        else:
            labels[unit_id] = 'unsorted'

    # Summary
    from collections import Counter
    print("Classification summary:")
    print(Counter(labels.values()))

    # Save labels
    import json
    with open(f'{output_dir}/unit_labels.json', 'w') as f:
        json.dump(labels, f)

    # Return good units
    good_ids = [u for u, l in labels.items() if l == 'good']
    return sorting.select_units(good_ids), labels

# Usage
sorting_curated, labels = curate_sorting(sorting, recording, 'output/')
```

## References

- [Bombcell GitHub](https://github.com/Julie-Fabre/bombcell)
- [UnitMatch GitHub](https://github.com/EnnyvanBeest/UnitMatch)
- [SpikeInterface Curation](https://spikeinterface.readthedocs.io/en/stable/modules/curation.html)
- Fabre et al. (2023) "Bombcell: automated curation and cell classification"
- van Beest et al. (2024) "UnitMatch: tracking neurons across days with high-density probes"
