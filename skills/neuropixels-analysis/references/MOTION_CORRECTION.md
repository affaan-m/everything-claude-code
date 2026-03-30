# Motion/Drift Correction Reference

Mechanical drift during acute probe insertion is a major challenge for Neuropixels recordings. This guide covers detection, estimation, and correction of motion artifacts.

## Why Motion Correction Matters

- Neuropixels probes can drift 10-100+ μm during recording
- Uncorrected drift leads to:
  - Units appearing/disappearing mid-recording
  - Waveform amplitude changes
  - Incorrect spike-unit assignments
  - Reduced unit yield

## Detection: Check Before Sorting

**Always visualize drift before running spike sorting!**

```python
import spikeinterface.full as si
from spikeinterface.sortingcomponents.peak_detection import detect_peaks
from spikeinterface.sortingcomponents.peak_localization import localize_peaks

# Preprocess first (don't whiten - affects peak localization)
rec = si.highpass_filter(recording, freq_min=400.)
rec = si.common_reference(rec, operator='median', reference='global')

# Detect peaks
noise_levels = si.get_noise_levels(rec, return_in_uV=False)
peaks = detect_peaks(
    rec,
    method='locally_exclusive',
    noise_levels=noise_levels,
    detect_threshold=5,
    radius_um=50.,
    n_jobs=8,
    chunk_duration='1s',
    progress_bar=True
)

# Localize peaks
peak_locations = localize_peaks(
    rec, peaks,
    method='center_of_mass',
    n_jobs=8,
    chunk_duration='1s'
)

# Visualize drift
si.plot_drift_raster_map(
    peaks=peaks,
    peak_locations=peak_locations,
    recording=rec,
    clim=(-200, 0)  # Adjust color limits
)
```

### Interpreting Drift Plots

| Pattern | Interpretation | Action |
|---------|---------------|--------|
| Horizontal bands, stable | No significant drift | Skip correction |
| Diagonal bands (slow) | Gradual settling drift | Use motion correction |
| Rapid jumps | Brain pulsation or movement | Use non-rigid correction |
| Chaotic patterns | Severe instability | Consider discarding segment |

## Motion Correction Methods

### Quick Correction (Recommended Start)

```python
# Simple one-liner with preset
rec_corrected = si.correct_motion(
    recording=rec,
    preset='nonrigid_fast_and_accurate'
)
```

### Available Presets

| Preset | Speed | Accuracy | Best For |
|--------|-------|----------|----------|
| `rigid_fast` | Fast | Low | Quick check, small drift |
| `kilosort_like` | Medium | Good | Kilosort-compatible results |
| `nonrigid_accurate` | Slow | High | Publication-quality |
| `nonrigid_fast_and_accurate` | Medium | High | **Recommended default** |
| `dredge` | Slow | Highest | Best results, complex drift |
| `dredge_fast` | Medium | High | DREDge with less compute |

### Full Control Pipeline

```python
from spikeinterface.sortingcomponents.motion import (
    estimate_motion,
    interpolate_motion
)

# Step 1: Estimate motion
motion, temporal_bins, spatial_bins = estimate_motion(
    rec,
    peaks,
    peak_locations,
    method='decentralized',
    direction='y',
    rigid=False,          # Non-rigid for Neuropixels
    win_step_um=50,       # Spatial window step
    win_sigma_um=150,     # Spatial smoothing
    bin_s=2.0,            # Temporal bin size
    progress_bar=True
)

# Step 2: Visualize motion estimate
si.plot_motion(
    motion,
    temporal_bins,
    spatial_bins,
    recording=rec
)

# Step 3: Apply correction via interpolation
rec_corrected = interpolate_motion(
    recording=rec,
    motion=motion,
    temporal_bins=temporal_bins,
    spatial_bins=spatial_bins,
    border_mode='force_extrapolate'
)
```

### Save Motion Estimate

```python
# Save for later use
import numpy as np
np.savez('motion_estimate.npz',
         motion=motion,
         temporal_bins=temporal_bins,
         spatial_bins=spatial_bins)

# Load later
data = np.load('motion_estimate.npz')
motion = data['motion']
temporal_bins = data['temporal_bins']
spatial_bins = data['spatial_bins']
```

## DREDge: State-of-the-Art Method

DREDge (Decentralized Registration of Electrophysiology Data) is currently the best-performing motion correction method.

### Using DREDge Preset

```python
# AP-band motion estimation
rec_corrected = si.correct_motion(rec, preset='dredge')

# Or compute explicitly
motion, motion_info = si.compute_motion(
    rec,
    preset='dredge',
    output_motion_info=True,
    folder='motion_output/',
    **job_kwargs
)
```

### LFP-Based Motion Estimation

For very fast drift or when AP-band estimation fails:

```python
# Load LFP stream
lfp = si.read_spikeglx('/path/to/data', stream_name='imec0.lf')

# Estimate motion from LFP (faster, handles rapid drift)
motion_lfp, motion_info = si.compute_motion(
    lfp,
    preset='dredge_lfp',
    output_motion_info=True
)

# Apply to AP recording
rec_corrected = interpolate_motion(
    recording=rec,  # AP recording
    motion=motion_lfp,
    temporal_bins=motion_info['temporal_bins'],
    spatial_bins=motion_info['spatial_bins']
)
```

## Integration with Spike Sorting

### Option 1: Pre-correction (Recommended)

```python
# Correct before sorting
rec_corrected = si.correct_motion(rec, preset='nonrigid_fast_and_accurate')

# Save corrected recording
rec_corrected = rec_corrected.save(folder='preprocessed_motion_corrected/',
                                    format='binary', n_jobs=8)

# Run spike sorting on corrected data
sorting = si.run_sorter('kilosort4', rec_corrected, output_folder='ks4/')
```

### Option 2: Let Kilosort Handle It

Kilosort 2.5+ has built-in drift correction:

```python
sorting = si.run_sorter(
    'kilosort4',
    rec,  # Not motion corrected
    output_folder='ks4/',
    nblocks=5,  # Non-rigid blocks for drift correction
    do_correction=True  # Enable Kilosort's drift correction
)
```

### Option 3: Post-hoc Correction

```python
# Sort first
sorting = si.run_sorter('kilosort4', rec, output_folder='ks4/')

# Then estimate motion from sorted spikes
# (More accurate as it uses actual spike times)
from spikeinterface.sortingcomponents.motion import estimate_motion_from_sorting

motion = estimate_motion_from_sorting(sorting, rec)
```

## Parameters Deep Dive

### Peak Detection

```python
peaks = detect_peaks(
    rec,
    method='locally_exclusive',  # Best for dense probes
    noise_levels=noise_levels,
    detect_threshold=5,          # Lower = more peaks (noisier estimate)
    radius_um=50.,               # Exclusion radius
    exclude_sweep_ms=0.1,        # Temporal exclusion
)
```

### Motion Estimation

```python
motion = estimate_motion(
    rec, peaks, peak_locations,
    method='decentralized',      # 'decentralized' or 'iterative_template'
    direction='y',               # Along probe axis
    rigid=False,                 # False for non-rigid
    bin_s=2.0,                   # Temporal resolution (seconds)
    win_step_um=50,              # Spatial window step
    win_sigma_um=150,            # Spatial smoothing sigma
    margin_um=0,                 # Margin at probe edges
    win_scale_um=150,            # Window scale for weights
)
```

## Troubleshooting

### Over-correction (Wavy Patterns)

```python
# Increase temporal smoothing
motion = estimate_motion(..., bin_s=5.0)  # Larger bins

# Or use rigid correction for small drift
motion = estimate_motion(..., rigid=True)
```

### Under-correction (Drift Remains)

```python
# Decrease spatial window for finer non-rigid estimate
motion = estimate_motion(..., win_step_um=25, win_sigma_um=75)

# Use more peaks
peaks = detect_peaks(..., detect_threshold=4)  # Lower threshold
```

### Edge Artifacts

```python
rec_corrected = interpolate_motion(
    rec, motion, temporal_bins, spatial_bins,
    border_mode='force_extrapolate',  # or 'remove_channels'
    spatial_interpolation_method='kriging'
)
```

## Validation

After correction, re-visualize to confirm:

```python
# Re-detect peaks on corrected recording
peaks_corrected = detect_peaks(rec_corrected, ...)
peak_locations_corrected = localize_peaks(rec_corrected, peaks_corrected, ...)

# Plot before/after comparison
fig, axes = plt.subplots(1, 2, figsize=(14, 6))

# Before
si.plot_drift_raster_map(peaks, peak_locations, rec, ax=axes[0])
axes[0].set_title('Before Correction')

# After
si.plot_drift_raster_map(peaks_corrected, peak_locations_corrected,
                         rec_corrected, ax=axes[1])
axes[1].set_title('After Correction')
```

## References

- [SpikeInterface Motion Correction Docs](https://spikeinterface.readthedocs.io/en/stable/modules/motion_correction.html)
- [Handle Drift Tutorial](https://spikeinterface.readthedocs.io/en/stable/how_to/handle_drift.html)
- [DREDge GitHub](https://github.com/evarol/DREDge)
- Windolf et al. (2023) "DREDge: robust motion correction for high-density extracellular recordings"
