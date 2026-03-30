# API Reference

Quick reference for neuropixels_analysis functions organized by module.

## Core Module

### load_recording

```python
npa.load_recording(
    path: str,
    format: str = 'auto',  # 'spikeglx', 'openephys', 'nwb'
    stream_id: str = None,  # e.g., 'imec0.ap'
) -> Recording
```

Load Neuropixels recording from various formats.

### run_pipeline

```python
npa.run_pipeline(
    recording: Recording,
    output_dir: str,
    sorter: str = 'kilosort4',
    preprocess: bool = True,
    correct_motion: bool = True,
    postprocess: bool = True,
    curate: bool = True,
    curation_method: str = 'allen',
) -> dict
```

Run complete analysis pipeline. Returns dictionary with all results.

## Preprocessing Module

### preprocess

```python
npa.preprocess(
    recording: Recording,
    freq_min: float = 300,
    freq_max: float = 6000,
    phase_shift: bool = True,
    common_ref: bool = True,
    bad_channel_detection: bool = True,
) -> Recording
```

Apply standard preprocessing chain.

### detect_bad_channels

```python
npa.detect_bad_channels(
    recording: Recording,
    method: str = 'coherence+psd',
    **kwargs,
) -> list
```

Detect and return list of bad channel IDs.

### apply_filters

```python
npa.apply_filters(
    recording: Recording,
    freq_min: float = 300,
    freq_max: float = 6000,
    filter_type: str = 'bandpass',
) -> Recording
```

Apply frequency filters.

### common_reference

```python
npa.common_reference(
    recording: Recording,
    operator: str = 'median',
    reference: str = 'global',
) -> Recording
```

Apply common reference (CMR/CAR).

## Motion Module

### check_drift

```python
npa.check_drift(
    recording: Recording,
    plot: bool = True,
    output: str = None,
) -> dict
```

Check recording for drift. Returns drift statistics.

### estimate_motion

```python
npa.estimate_motion(
    recording: Recording,
    preset: str = 'kilosort_like',
    **kwargs,
) -> dict
```

Estimate motion without applying correction.

### correct_motion

```python
npa.correct_motion(
    recording: Recording,
    preset: str = 'nonrigid_accurate',
    folder: str = None,
    **kwargs,
) -> Recording
```

Apply motion correction.

**Presets:**
- `'kilosort_like'`: Fast, rigid correction
- `'nonrigid_accurate'`: Slower, better for severe drift
- `'nonrigid_fast_and_accurate'`: Balanced option

## Sorting Module

### run_sorting

```python
npa.run_sorting(
    recording: Recording,
    sorter: str = 'kilosort4',
    output_folder: str = None,
    sorter_params: dict = None,
    **kwargs,
) -> Sorting
```

Run spike sorter.

**Supported sorters:**
- `'kilosort4'`: GPU-based, recommended
- `'kilosort3'`: Legacy, requires MATLAB
- `'spykingcircus2'`: CPU-based alternative
- `'mountainsort5'`: Fast, good for short recordings

### compare_sorters

```python
npa.compare_sorters(
    sortings: list,
    delta_time: float = 0.4,  # ms
    match_score: float = 0.5,
) -> Comparison
```

Compare results from multiple sorters.

## Postprocessing Module

### create_analyzer

```python
npa.create_analyzer(
    sorting: Sorting,
    recording: Recording,
    output_folder: str = None,
    sparse: bool = True,
) -> SortingAnalyzer
```

Create SortingAnalyzer for postprocessing.

### postprocess

```python
npa.postprocess(
    sorting: Sorting,
    recording: Recording,
    output_folder: str = None,
    compute_all: bool = True,
    n_jobs: int = -1,
) -> tuple[SortingAnalyzer, DataFrame]
```

Full postprocessing. Returns (analyzer, metrics).

### compute_quality_metrics

```python
npa.compute_quality_metrics(
    analyzer: SortingAnalyzer,
    metric_names: list = None,  # None = all
    **kwargs,
) -> DataFrame
```

Compute quality metrics for all units.

**Available metrics:**
- `snr`: Signal-to-noise ratio
- `isi_violations_ratio`: ISI violations
- `presence_ratio`: Recording presence
- `amplitude_cutoff`: Amplitude distribution cutoff
- `firing_rate`: Average firing rate
- `amplitude_cv`: Amplitude coefficient of variation
- `sliding_rp_violation`: Sliding window refractory violations
- `d_prime`: Isolation quality
- `nearest_neighbor`: Nearest-neighbor overlap

## Curation Module

### curate

```python
npa.curate(
    metrics: DataFrame,
    method: str = 'allen',  # 'allen', 'ibl', 'strict', 'custom'
    **thresholds,
) -> dict
```

Apply automated curation. Returns {unit_id: label}.

### auto_classify

```python
npa.auto_classify(
    metrics: DataFrame,
    snr_threshold: float = 5.0,
    isi_threshold: float = 0.01,
    presence_threshold: float = 0.9,
) -> dict
```

Classify units based on custom thresholds.

### filter_units

```python
npa.filter_units(
    sorting: Sorting,
    labels: dict,
    keep: list = ['good'],
) -> Sorting
```

Filter sorting to keep only specified labels.

## AI Curation Module

### generate_unit_report

```python
npa.generate_unit_report(
    analyzer: SortingAnalyzer,
    unit_id: int,
    output_dir: str = None,
    figsize: tuple = (16, 12),
) -> dict
```

Generate visual report for AI analysis.

Returns:
- `'image_path'`: Path to saved figure
- `'image_base64'`: Base64 encoded image
- `'metrics'`: Quality metrics dict
- `'unit_id'`: Unit ID

### analyze_unit_visually

```python
npa.analyze_unit_visually(
    analyzer: SortingAnalyzer,
    unit_id: int,
    api_client: Any = None,
    model: str = 'claude-opus-4.5',
    task: str = 'quality_assessment',
    custom_prompt: str = None,
) -> dict
```

Analyze unit using vision-language model.

**Tasks:**
- `'quality_assessment'`: Classify as good/mua/noise
- `'merge_candidate'`: Check if units should merge
- `'drift_assessment'`: Assess motion/drift

### batch_visual_curation

```python
npa.batch_visual_curation(
    analyzer: SortingAnalyzer,
    unit_ids: list = None,
    api_client: Any = None,
    model: str = 'claude-opus-4.5',
    output_dir: str = None,
    progress_callback: callable = None,
) -> dict
```

Run visual curation on multiple units.

### CurationSession

```python
session = npa.CurationSession.create(
    analyzer: SortingAnalyzer,
    output_dir: str,
    session_id: str = None,
    unit_ids: list = None,
    sort_by_confidence: bool = True,
)

# Navigation
session.current_unit() -> UnitCuration
session.next_unit() -> UnitCuration
session.prev_unit() -> UnitCuration
session.go_to_unit(unit_id: int) -> UnitCuration

# Decisions
session.set_decision(unit_id, decision, notes='')
session.set_ai_classification(unit_id, classification)

# Export
session.get_final_labels() -> dict
session.export_decisions(output_path) -> DataFrame
session.get_summary() -> dict

# Persistence
session.save()
session = npa.CurationSession.load(session_dir)
```

## Visualization Module

### plot_drift

```python
npa.plot_drift(
    recording: Recording,
    motion: dict = None,
    output: str = None,
    figsize: tuple = (12, 8),
)
```

Plot drift/motion map.

### plot_quality_metrics

```python
npa.plot_quality_metrics(
    analyzer: SortingAnalyzer,
    metrics: DataFrame = None,
    output: str = None,
)
```

Plot quality metrics overview.

### plot_unit_summary

```python
npa.plot_unit_summary(
    analyzer: SortingAnalyzer,
    unit_id: int,
    output: str = None,
)
```

Plot comprehensive unit summary.

## SpikeInterface Integration

All neuropixels_analysis functions work with SpikeInterface objects:

```python
import spikeinterface.full as si
import neuropixels_analysis as npa

# SpikeInterface recording works with npa functions
recording = si.read_spikeglx('/path/')
rec = npa.preprocess(recording)

# Access SpikeInterface directly for advanced usage
rec_filtered = si.bandpass_filter(recording, freq_min=300, freq_max=6000)
```

## Common Parameters

### Recording parameters
- `freq_min`: Highpass cutoff (Hz)
- `freq_max`: Lowpass cutoff (Hz)
- `n_jobs`: Parallel jobs (-1 = all cores)

### Sorting parameters
- `output_folder`: Where to save results
- `sorter_params`: Dict of sorter-specific params

### Quality metric thresholds
- `snr_threshold`: SNR cutoff (typically 5)
- `isi_threshold`: ISI violations cutoff (typically 0.01)
- `presence_threshold`: Presence ratio cutoff (typically 0.9)
