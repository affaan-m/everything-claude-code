# ECG and Cardiac Signal Processing

## Overview

Process electrocardiogram (ECG) and photoplethysmography (PPG) signals for cardiovascular analysis. This module provides comprehensive tools for R-peak detection, waveform delineation, quality assessment, and heart rate analysis.

## Main Processing Pipeline

### ecg_process()

Complete automated ECG processing pipeline that orchestrates multiple steps.

```python
signals, info = nk.ecg_process(ecg_signal, sampling_rate=1000, method='neurokit')
```

**Pipeline steps:**
1. Signal cleaning (noise removal)
2. R-peak detection
3. Heart rate calculation
4. Quality assessment
5. QRS delineation (P, Q, S, T waves)
6. Cardiac phase determination

**Returns:**
- `signals`: DataFrame with cleaned ECG, peaks, rate, quality, cardiac phases
- `info`: Dictionary with R-peak locations and processing parameters

**Common methods:**
- `'neurokit'` (default): Comprehensive NeuroKit2 pipeline
- `'biosppy'`: BioSPPy-based processing
- `'pantompkins1985'`: Pan-Tompkins algorithm
- `'hamilton2002'`, `'elgendi2010'`, `'engzeemod2012'`: Alternative methods

## Preprocessing Functions

### ecg_clean()

Remove noise from raw ECG signals using method-specific filtering.

```python
cleaned_ecg = nk.ecg_clean(ecg_signal, sampling_rate=1000, method='neurokit')
```

**Methods:**
- `'neurokit'`: High-pass Butterworth filter (0.5 Hz) + powerline filtering
- `'biosppy'`: FIR filtering between 0.67-45 Hz
- `'pantompkins1985'`: Band-pass 5-15 Hz + derivative-based
- `'hamilton2002'`: Band-pass 8-16 Hz
- `'elgendi2010'`: Band-pass 8-20 Hz
- `'engzeemod2012'`: FIR band-pass 0.5-40 Hz

**Key parameters:**
- `powerline`: Remove 50 or 60 Hz powerline noise (default: 50)

### ecg_peaks()

Detect R-peaks in ECG signals with optional artifact correction.

```python
peaks_dict, info = nk.ecg_peaks(cleaned_ecg, sampling_rate=1000, method='neurokit', correct_artifacts=False)
```

**Available methods (13+ algorithms):**
- `'neurokit'`: Hybrid approach optimized for reliability
- `'pantompkins1985'`: Classic Pan-Tompkins algorithm
- `'hamilton2002'`: Hamilton's adaptive threshold
- `'christov2004'`: Christov's adaptive method
- `'gamboa2008'`: Gamboa's approach
- `'elgendi2010'`: Elgendi's two moving averages
- `'engzeemod2012'`: Modified Engelse-Zeelenberg
- `'kalidas2017'`: XQRS-based
- `'martinez2004'`, `'rodrigues2021'`, `'koka2022'`, `'promac'`: Advanced methods

**Artifact correction:**
Set `correct_artifacts=True` to apply Lipponen & Tarvainen (2019) correction:
- Detects ectopic beats, long/short intervals, missed beats
- Uses threshold-based detection with configurable parameters

**Returns:**
- Dictionary with `'ECG_R_Peaks'` key containing peak indices

### ecg_delineate()

Identify P, Q, S, T waves and their onsets/offsets.

```python
waves, waves_peak = nk.ecg_delineate(cleaned_ecg, rpeaks, sampling_rate=1000, method='dwt')
```

**Methods:**
- `'dwt'` (default): Discrete wavelet transform-based detection
- `'peak'`: Simple peak detection around R-peaks
- `'cwt'`: Continuous wavelet transform (Martinez et al., 2004)

**Detected components:**
- P waves: `ECG_P_Peaks`, `ECG_P_Onsets`, `ECG_P_Offsets`
- Q waves: `ECG_Q_Peaks`
- S waves: `ECG_S_Peaks`
- T waves: `ECG_T_Peaks`, `ECG_T_Onsets`, `ECG_T_Offsets`
- QRS complex: onsets and offsets

**Returns:**
- `waves`: Dictionary with all wave indices
- `waves_peak`: Dictionary with peak amplitudes

### ecg_quality()

Assess ECG signal integrity and quality.

```python
quality = nk.ecg_quality(ecg_signal, rpeaks=None, sampling_rate=1000, method='averageQRS')
```

**Methods:**
- `'averageQRS'` (default): Template matching correlation (Zhao & Zhang, 2018)
  - Returns quality scores 0-1 for each heartbeat
  - Threshold: >0.6 = good quality
- `'zhao2018'`: Multi-index approach using kurtosis, power spectrum distribution

**Use cases:**
- Identify low-quality signal segments
- Filter out noisy heartbeats before analysis
- Validate R-peak detection accuracy

## Analysis Functions

### ecg_analyze()

High-level analysis that automatically selects event-related or interval-related mode.

```python
analysis = nk.ecg_analyze(signals, sampling_rate=1000, method='auto')
```

**Mode selection:**
- Duration < 10 seconds → event-related analysis
- Duration ≥ 10 seconds → interval-related analysis

**Returns:**
DataFrame with cardiac metrics appropriate for the analysis mode.

### ecg_eventrelated()

Analyze stimulus-locked ECG epochs for event-related responses.

```python
results = nk.ecg_eventrelated(epochs)
```

**Computed metrics:**
- `ECG_Rate_Baseline`: Mean heart rate before stimulus
- `ECG_Rate_Min/Max`: Minimum/maximum heart rate during epoch
- `ECG_Phase_Atrial/Ventricular`: Cardiac phase at stimulus onset
- Rate dynamics across epoch time windows

**Use case:**
Experimental paradigms with discrete trials (e.g., stimulus presentations, task events).

### ecg_intervalrelated()

Analyze continuous ECG recordings for resting state or extended periods.

```python
results = nk.ecg_intervalrelated(signals, sampling_rate=1000)
```

**Computed metrics:**
- `ECG_Rate_Mean`: Average heart rate over interval
- Comprehensive HRV metrics (delegates to `hrv()` function)
  - Time domain: SDNN, RMSSD, pNN50, etc.
  - Frequency domain: LF, HF, LF/HF ratio
  - Nonlinear: Poincaré, entropy, fractal measures

**Minimum duration:**
- Basic rate: Any duration
- HRV frequency metrics: ≥60 seconds recommended, 1-5 minutes optimal

## Utility Functions

### ecg_rate()

Compute instantaneous heart rate from R-peak intervals.

```python
heart_rate = nk.ecg_rate(peaks, sampling_rate=1000, desired_length=None)
```

**Method:**
- Calculates inter-beat intervals (IBIs) between consecutive R-peaks
- Converts to beats per minute (BPM): 60 / IBI
- Interpolates to match signal length if `desired_length` specified

**Returns:**
- Array of instantaneous heart rate values

### ecg_phase()

Determine atrial and ventricular systole/diastole phases.

```python
cardiac_phase = nk.ecg_phase(ecg_cleaned, rpeaks, delineate_info)
```

**Phases computed:**
- `ECG_Phase_Atrial`: Atrial systole (1) vs. diastole (0)
- `ECG_Phase_Ventricular`: Ventricular systole (1) vs. diastole (0)
- `ECG_Phase_Completion_Atrial/Ventricular`: Percentage of phase completion (0-1)

**Use case:**
- Cardiac-locked stimulus presentation
- Psychophysiology experiments timing events to cardiac cycle

### ecg_segment()

Extract individual heartbeats for morphological analysis.

```python
heartbeats = nk.ecg_segment(ecg_cleaned, rpeaks, sampling_rate=1000)
```

**Returns:**
- Dictionary of epochs, each containing one heartbeat
- Centered on R-peak with configurable pre/post windows
- Useful for beat-to-beat morphology comparison

### ecg_invert()

Detect and correct inverted ECG signals automatically.

```python
corrected_ecg, is_inverted = nk.ecg_invert(ecg_signal, sampling_rate=1000)
```

**Method:**
- Analyzes QRS complex polarity
- Flips signal if predominantly negative
- Returns corrected signal and inversion status

### ecg_rsp()

Extract ECG-derived respiration (EDR) as respiratory proxy signal.

```python
edr_signal = nk.ecg_rsp(ecg_cleaned, sampling_rate=1000, method='vangent2019')
```

**Methods:**
- `'vangent2019'`: Bandpass filtering 0.1-0.4 Hz
- `'charlton2016'`: Bandpass 0.15-0.4 Hz
- `'soni2019'`: Bandpass 0.08-0.5 Hz

**Use case:**
- Estimate respiration when direct respiratory signal unavailable
- Multi-modal physiological analysis

## Simulation and Visualization

### ecg_simulate()

Generate synthetic ECG signals for testing and validation.

```python
synthetic_ecg = nk.ecg_simulate(duration=10, sampling_rate=1000, heart_rate=70, method='ecgsyn', noise=0.01)
```

**Methods:**
- `'ecgsyn'`: Realistic dynamical model (McSharry et al., 2003)
  - Simulates P-QRS-T complex morphology
  - Physiologically plausible waveforms
- `'simple'`: Faster wavelet-based approximation
  - Gaussian-like QRS complexes
  - Less realistic but computationally efficient

**Key parameters:**
- `heart_rate`: Average BPM (default: 70)
- `heart_rate_std`: Heart rate variability magnitude (default: 1)
- `noise`: Gaussian noise level (default: 0.01)
- `random_state`: Seed for reproducibility

### ecg_plot()

Visualize processed ECG with detected R-peaks and signal quality.

```python
nk.ecg_plot(signals, info)
```

**Displays:**
- Raw and cleaned ECG signals
- Detected R-peaks overlaid
- Heart rate trace
- Signal quality indicators

## ECG-Specific Considerations

### Sampling Rate Recommendations
- **Minimum**: 250 Hz for basic R-peak detection
- **Recommended**: 500-1000 Hz for waveform delineation
- **High-resolution**: 2000+ Hz for detailed morphology analysis

### Signal Duration Requirements
- **R-peak detection**: Any duration (≥2 beats minimum)
- **Basic heart rate**: ≥10 seconds
- **HRV time domain**: ≥60 seconds
- **HRV frequency domain**: 1-5 minutes (optimal)
- **Ultra-low frequency HRV**: ≥24 hours

### Common Issues and Solutions

**Poor R-peak detection:**
- Try different methods: `method='pantompkins1985'` often robust
- Ensure adequate sampling rate (≥250 Hz)
- Check for inverted ECG: use `ecg_invert()`
- Apply artifact correction: `correct_artifacts=True`

**Noisy signal:**
- Use appropriate cleaning method for noise type
- Adjust powerline frequency if outside US/Europe
- Consider signal quality assessment before analysis

**Missing waveform components:**
- Increase sampling rate (≥500 Hz for delineation)
- Try different delineation methods (`'dwt'`, `'peak'`, `'cwt'`)
- Verify signal quality with `ecg_quality()`

## Integration with Other Signals

### ECG + RSP: Respiratory Sinus Arrhythmia
```python
# Process both signals
ecg_signals, ecg_info = nk.ecg_process(ecg, sampling_rate=1000)
rsp_signals, rsp_info = nk.rsp_process(rsp, sampling_rate=1000)

# Compute RSA
rsa = nk.hrv_rsa(ecg_info['ECG_R_Peaks'], rsp_signals['RSP_Clean'], sampling_rate=1000)
```

### Multi-modal Integration
```python
# Process multiple signals at once
bio_signals, bio_info = nk.bio_process(
    ecg=ecg_signal,
    rsp=rsp_signal,
    eda=eda_signal,
    sampling_rate=1000
)
```

## References

- Pan, J., & Tompkins, W. J. (1985). A real-time QRS detection algorithm. IEEE transactions on biomedical engineering, 32(3), 230-236.
- Hamilton, P. (2002). Open source ECG analysis. Computers in cardiology, 101-104.
- Martinez, J. P., Almeida, R., Olmos, S., Rocha, A. P., & Laguna, P. (2004). A wavelet-based ECG delineator: evaluation on standard databases. IEEE Transactions on biomedical engineering, 51(4), 570-581.
- Lipponen, J. A., & Tarvainen, M. P. (2019). A robust algorithm for heart rate variability time series artefact correction using novel beat classification. Journal of medical engineering & technology, 43(3), 173-181.
