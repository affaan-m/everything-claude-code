---
name: neurokit2
description: Comprehensive biosignal processing toolkit for analyzing physiological data including ECG, EEG, EDA, RSP, PPG, EMG, and EOG signals. Use this skill when processing cardiovascular signals, brain activity, electrodermal responses, respiratory patterns, muscle activity, or eye movements. Applicable for heart rate variability analysis, event-related potentials, complexity measures, autonomic nervous system assessment, psychophysiology research, and multi-modal physiological signal integration.
license: MIT license
metadata:
    skill-author: K-Dense Inc.
---

# NeuroKit2

## Overview

NeuroKit2 is a comprehensive Python toolkit for processing and analyzing physiological signals (biosignals). Use this skill to process cardiovascular, neural, autonomic, respiratory, and muscular signals for psychophysiology research, clinical applications, and human-computer interaction studies.

## When to Use This Skill

Apply this skill when working with:
- **Cardiac signals**: ECG, PPG, heart rate variability (HRV), pulse analysis
- **Brain signals**: EEG frequency bands, microstates, complexity, source localization
- **Autonomic signals**: Electrodermal activity (EDA/GSR), skin conductance responses (SCR)
- **Respiratory signals**: Breathing rate, respiratory variability (RRV), volume per time
- **Muscular signals**: EMG amplitude, muscle activation detection
- **Eye tracking**: EOG, blink detection and analysis
- **Multi-modal integration**: Processing multiple physiological signals simultaneously
- **Complexity analysis**: Entropy measures, fractal dimensions, nonlinear dynamics

## Core Capabilities

### 1. Cardiac Signal Processing (ECG/PPG)

Process electrocardiogram and photoplethysmography signals for cardiovascular analysis. See `references/ecg_cardiac.md` for detailed workflows.

**Primary workflows:**
- ECG processing pipeline: cleaning → R-peak detection → delineation → quality assessment
- HRV analysis across time, frequency, and nonlinear domains
- PPG pulse analysis and quality assessment
- ECG-derived respiration extraction

**Key functions:**
```python
import neurokit2 as nk

# Complete ECG processing pipeline
signals, info = nk.ecg_process(ecg_signal, sampling_rate=1000)

# Analyze ECG data (event-related or interval-related)
analysis = nk.ecg_analyze(signals, sampling_rate=1000)

# Comprehensive HRV analysis
hrv = nk.hrv(peaks, sampling_rate=1000)  # Time, frequency, nonlinear domains
```

### 2. Heart Rate Variability Analysis

Compute comprehensive HRV metrics from cardiac signals. See `references/hrv.md` for all indices and domain-specific analysis.

**Supported domains:**
- **Time domain**: SDNN, RMSSD, pNN50, SDSD, and derived metrics
- **Frequency domain**: ULF, VLF, LF, HF, VHF power and ratios
- **Nonlinear domain**: Poincaré plot (SD1/SD2), entropy measures, fractal dimensions
- **Specialized**: Respiratory sinus arrhythmia (RSA), recurrence quantification analysis (RQA)

**Key functions:**
```python
# All HRV indices at once
hrv_indices = nk.hrv(peaks, sampling_rate=1000)

# Domain-specific analysis
hrv_time = nk.hrv_time(peaks)
hrv_freq = nk.hrv_frequency(peaks, sampling_rate=1000)
hrv_nonlinear = nk.hrv_nonlinear(peaks, sampling_rate=1000)
hrv_rsa = nk.hrv_rsa(peaks, rsp_signal, sampling_rate=1000)
```

### 3. Brain Signal Analysis (EEG)

Analyze electroencephalography signals for frequency power, complexity, and microstate patterns. See `references/eeg.md` for detailed workflows and MNE integration.

**Primary capabilities:**
- Frequency band power analysis (Delta, Theta, Alpha, Beta, Gamma)
- Channel quality assessment and re-referencing
- Source localization (sLORETA, MNE)
- Microstate segmentation and transition dynamics
- Global field power and dissimilarity measures

**Key functions:**
```python
# Power analysis across frequency bands
power = nk.eeg_power(eeg_data, sampling_rate=250, channels=['Fz', 'Cz', 'Pz'])

# Microstate analysis
microstates = nk.microstates_segment(eeg_data, n_microstates=4, method='kmod')
static = nk.microstates_static(microstates)
dynamic = nk.microstates_dynamic(microstates)
```

### 4. Electrodermal Activity (EDA)

Process skin conductance signals for autonomic nervous system assessment. See `references/eda.md` for detailed workflows.

**Primary workflows:**
- Signal decomposition into tonic and phasic components
- Skin conductance response (SCR) detection and analysis
- Sympathetic nervous system index calculation
- Autocorrelation and changepoint detection

**Key functions:**
```python
# Complete EDA processing
signals, info = nk.eda_process(eda_signal, sampling_rate=100)

# Analyze EDA data
analysis = nk.eda_analyze(signals, sampling_rate=100)

# Sympathetic nervous system activity
sympathetic = nk.eda_sympathetic(signals, sampling_rate=100)
```

### 5. Respiratory Signal Processing (RSP)

Analyze breathing patterns and respiratory variability. See `references/rsp.md` for detailed workflows.

**Primary capabilities:**
- Respiratory rate calculation and variability analysis
- Breathing amplitude and symmetry assessment
- Respiratory volume per time (fMRI applications)
- Respiratory amplitude variability (RAV)

**Key functions:**
```python
# Complete RSP processing
signals, info = nk.rsp_process(rsp_signal, sampling_rate=100)

# Respiratory rate variability
rrv = nk.rsp_rrv(signals, sampling_rate=100)

# Respiratory volume per time
rvt = nk.rsp_rvt(signals, sampling_rate=100)
```

### 6. Electromyography (EMG)

Process muscle activity signals for activation detection and amplitude analysis. See `references/emg.md` for workflows.

**Key functions:**
```python
# Complete EMG processing
signals, info = nk.emg_process(emg_signal, sampling_rate=1000)

# Muscle activation detection
activation = nk.emg_activation(signals, sampling_rate=1000, method='threshold')
```

### 7. Electrooculography (EOG)

Analyze eye movement and blink patterns. See `references/eog.md` for workflows.

**Key functions:**
```python
# Complete EOG processing
signals, info = nk.eog_process(eog_signal, sampling_rate=500)

# Extract blink features
features = nk.eog_features(signals, sampling_rate=500)
```

### 8. General Signal Processing

Apply filtering, decomposition, and transformation operations to any signal. See `references/signal_processing.md` for comprehensive utilities.

**Key operations:**
- Filtering (lowpass, highpass, bandpass, bandstop)
- Decomposition (EMD, SSA, wavelet)
- Peak detection and correction
- Power spectral density estimation
- Signal interpolation and resampling
- Autocorrelation and synchrony analysis

**Key functions:**
```python
# Filtering
filtered = nk.signal_filter(signal, sampling_rate=1000, lowcut=0.5, highcut=40)

# Peak detection
peaks = nk.signal_findpeaks(signal)

# Power spectral density
psd = nk.signal_psd(signal, sampling_rate=1000)
```

### 9. Complexity and Entropy Analysis

Compute nonlinear dynamics, fractal dimensions, and information-theoretic measures. See `references/complexity.md` for all available metrics.

**Available measures:**
- **Entropy**: Shannon, approximate, sample, permutation, spectral, fuzzy, multiscale
- **Fractal dimensions**: Katz, Higuchi, Petrosian, Sevcik, correlation dimension
- **Nonlinear dynamics**: Lyapunov exponents, Lempel-Ziv complexity, recurrence quantification
- **DFA**: Detrended fluctuation analysis, multifractal DFA
- **Information theory**: Fisher information, mutual information

**Key functions:**
```python
# Multiple complexity metrics at once
complexity_indices = nk.complexity(signal, sampling_rate=1000)

# Specific measures
apen = nk.entropy_approximate(signal)
dfa = nk.fractal_dfa(signal)
lyap = nk.complexity_lyapunov(signal, sampling_rate=1000)
```

### 10. Event-Related Analysis

Create epochs around stimulus events and analyze physiological responses. See `references/epochs_events.md` for workflows.

**Primary capabilities:**
- Epoch creation from event markers
- Event-related averaging and visualization
- Baseline correction options
- Grand average computation with confidence intervals

**Key functions:**
```python
# Find events in signal
events = nk.events_find(trigger_signal, threshold=0.5)

# Create epochs around events
epochs = nk.epochs_create(signals, events, sampling_rate=1000,
                          epochs_start=-0.5, epochs_end=2.0)

# Average across epochs
grand_average = nk.epochs_average(epochs)
```

### 11. Multi-Signal Integration

Process multiple physiological signals simultaneously with unified output. See `references/bio_module.md` for integration workflows.

**Key functions:**
```python
# Process multiple signals at once
bio_signals, bio_info = nk.bio_process(
    ecg=ecg_signal,
    rsp=rsp_signal,
    eda=eda_signal,
    emg=emg_signal,
    sampling_rate=1000
)

# Analyze all processed signals
bio_analysis = nk.bio_analyze(bio_signals, sampling_rate=1000)
```

## Analysis Modes

NeuroKit2 automatically selects between two analysis modes based on data duration:

**Event-related analysis** (< 10 seconds):
- Analyzes stimulus-locked responses
- Epoch-based segmentation
- Suitable for experimental paradigms with discrete trials

**Interval-related analysis** (≥ 10 seconds):
- Characterizes physiological patterns over extended periods
- Resting state or continuous activities
- Suitable for baseline measurements and long-term monitoring

Most `*_analyze()` functions automatically choose the appropriate mode.

## Installation

```bash
uv pip install neurokit2
```

For development version:
```bash
uv pip install https://github.com/neuropsychology/NeuroKit/zipball/dev
```

## Common Workflows

### Quick Start: ECG Analysis
```python
import neurokit2 as nk

# Load example data
ecg = nk.ecg_simulate(duration=60, sampling_rate=1000)

# Process ECG
signals, info = nk.ecg_process(ecg, sampling_rate=1000)

# Analyze HRV
hrv = nk.hrv(info['ECG_R_Peaks'], sampling_rate=1000)

# Visualize
nk.ecg_plot(signals, info)
```

### Multi-Modal Analysis
```python
# Process multiple signals
bio_signals, bio_info = nk.bio_process(
    ecg=ecg_signal,
    rsp=rsp_signal,
    eda=eda_signal,
    sampling_rate=1000
)

# Analyze all signals
results = nk.bio_analyze(bio_signals, sampling_rate=1000)
```

### Event-Related Potential
```python
# Find events
events = nk.events_find(trigger_channel, threshold=0.5)

# Create epochs
epochs = nk.epochs_create(processed_signals, events,
                          sampling_rate=1000,
                          epochs_start=-0.5, epochs_end=2.0)

# Event-related analysis for each signal type
ecg_epochs = nk.ecg_eventrelated(epochs)
eda_epochs = nk.eda_eventrelated(epochs)
```

## References

This skill includes comprehensive reference documentation organized by signal type and analysis method:

- **ecg_cardiac.md**: ECG/PPG processing, R-peak detection, delineation, quality assessment
- **hrv.md**: Heart rate variability indices across all domains
- **eeg.md**: EEG analysis, frequency bands, microstates, source localization
- **eda.md**: Electrodermal activity processing and SCR analysis
- **rsp.md**: Respiratory signal processing and variability
- **ppg.md**: Photoplethysmography signal analysis
- **emg.md**: Electromyography processing and activation detection
- **eog.md**: Electrooculography and blink analysis
- **signal_processing.md**: General signal utilities and transformations
- **complexity.md**: Entropy, fractal, and nonlinear measures
- **epochs_events.md**: Event-related analysis and epoch creation
- **bio_module.md**: Multi-signal integration workflows

Load specific reference files as needed using the Read tool to access detailed function documentation and parameters.

## Additional Resources

- Official Documentation: https://neuropsychology.github.io/NeuroKit/
- GitHub Repository: https://github.com/neuropsychology/NeuroKit
- Publication: Makowski et al. (2021). NeuroKit2: A Python toolbox for neurophysiological signal processing. Behavior Research Methods. https://doi.org/10.3758/s13428-020-01516-y

