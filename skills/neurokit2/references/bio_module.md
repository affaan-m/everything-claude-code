# Multi-Signal Integration (Bio Module)

## Overview

The Bio module provides unified functions for processing and analyzing multiple physiological signals simultaneously. It acts as a wrapper that coordinates signal-specific processing functions and enables integrated multi-modal analysis.

## Multi-Signal Processing

### bio_process()

Process multiple physiological signals simultaneously with a single function call.

```python
bio_signals, bio_info = nk.bio_process(ecg=None, rsp=None, eda=None, emg=None,
                                       ppg=None, eog=None, sampling_rate=1000)
```

**Parameters:**
- `ecg`: ECG signal array (optional)
- `rsp`: Respiratory signal array (optional)
- `eda`: EDA signal array (optional)
- `emg`: EMG signal array (optional)
- `ppg`: PPG signal array (optional)
- `eog`: EOG signal array (optional)
- `sampling_rate`: Sampling rate in Hz (must be consistent across signals or specify per signal)

**Returns:**
- `bio_signals`: Unified DataFrame containing all processed signals with columns:
  - Signal-specific features (e.g., `ECG_Clean`, `ECG_Rate`, `EDA_Phasic`, `RSP_Rate`)
  - All detected events/peaks
  - Derived measures
- `bio_info`: Dictionary with signal-specific information (peak locations, parameters)

**Example:**
```python
# Process ECG, respiration, and EDA simultaneously
bio_signals, bio_info = nk.bio_process(
    ecg=ecg_signal,
    rsp=rsp_signal,
    eda=eda_signal,
    sampling_rate=1000
)

# Access processed signals
ecg_clean = bio_signals['ECG_Clean']
rsp_rate = bio_signals['RSP_Rate']
eda_phasic = bio_signals['EDA_Phasic']

# Access detected peaks
ecg_peaks = bio_info['ECG']['ECG_R_Peaks']
rsp_peaks = bio_info['RSP']['RSP_Peaks']
```

**Internal workflow:**
1. Each signal is processed by its dedicated processing function:
   - `ecg_process()` for ECG
   - `rsp_process()` for respiration
   - `eda_process()` for EDA
   - `emg_process()` for EMG
   - `ppg_process()` for PPG
   - `eog_process()` for EOG
2. Results are merged into unified DataFrame
3. Cross-signal features computed (e.g., RSA if both ECG and RSP present)

**Advantages:**
- Simplified API for multi-modal recording
- Unified time base for all signals
- Automatic cross-signal feature computation
- Consistent output format

## Multi-Signal Analysis

### bio_analyze()

Perform comprehensive analysis on processed multi-modal signals.

```python
bio_results = nk.bio_analyze(bio_signals, sampling_rate=1000)
```

**Parameters:**
- `bio_signals`: DataFrame from `bio_process()` or custom processed signals
- `sampling_rate`: Sampling rate (Hz)

**Returns:**
- DataFrame with analysis results for all detected signal types:
  - Interval-related metrics if duration ≥ 10 seconds
  - Event-related metrics if duration < 10 seconds
  - Cross-signal indices (e.g., RSA if ECG + RSP available)

**Computed metrics by signal:**
- **ECG**: Heart rate statistics, HRV indices (time, frequency, nonlinear domains)
- **RSP**: Respiratory rate statistics, RRV, amplitude measures
- **EDA**: SCR count, amplitude, tonic level, sympathetic indices
- **EMG**: Activation count, amplitude statistics
- **PPG**: Similar to ECG (heart rate, HRV)
- **EOG**: Blink count, blink rate

**Cross-signal metrics:**
- **RSA (Respiratory Sinus Arrhythmia)**: If ECG + RSP present
- **Cardiorespiratory coupling**: Phase synchronization indices
- **Multi-modal arousal**: Combined autonomic indices

**Example:**
```python
# Analyze processed signals
results = nk.bio_analyze(bio_signals, sampling_rate=1000)

# Access results
heart_rate_mean = results['ECG_Rate_Mean']
hrv_rmssd = results['HRV_RMSSD']
breathing_rate = results['RSP_Rate_Mean']
scr_count = results['SCR_Peaks_N']
rsa_value = results['RSA']  # If both ECG and RSP present
```

## Cross-Signal Features

When multiple signals are processed together, NeuroKit2 can compute integrated features:

### Respiratory Sinus Arrhythmia (RSA)

Automatically computed when both ECG and respiratory signals are present.

```python
bio_signals, bio_info = nk.bio_process(ecg=ecg, rsp=rsp, sampling_rate=1000)
results = nk.bio_analyze(bio_signals, sampling_rate=1000)

rsa = results['RSA']  # Automatically included
```

**Computation:**
- High-frequency HRV modulation by breathing
- Requires synchronized ECG R-peaks and respiratory signal
- Methods: Porges-Bohrer or peak-to-trough

**Interpretation:**
- Higher RSA: greater parasympathetic (vagal) influence
- Marker of cardiac-respiratory coupling
- Health indicator and emotion regulation capacity

### ECG-Derived Respiration (EDR)

If respiratory signal unavailable, NeuroKit2 can estimate from ECG:

```python
ecg_signals, ecg_info = nk.ecg_process(ecg, sampling_rate=1000)

# Extract EDR
edr = nk.ecg_rsp(ecg_signals['ECG_Clean'], sampling_rate=1000)
```

**Use case:**
- Estimate respiration when direct measurement unavailable
- Cross-validate respiratory measurements

### Cardio-EDA Integration

Synchronized cardiac and electrodermal activity:

```python
bio_signals, bio_info = nk.bio_process(ecg=ecg, eda=eda, sampling_rate=1000)

# Both signals available for integrated analysis
ecg_rate = bio_signals['ECG_Rate']
eda_phasic = bio_signals['EDA_Phasic']

# Compute correlations or coupling metrics
correlation = ecg_rate.corr(eda_phasic)
```

## Practical Workflows

### Complete Multi-Modal Recording Analysis

```python
import neurokit2 as nk
import pandas as pd

# 1. Load multi-modal physiological data
ecg = load_ecg()        # Your data loading function
rsp = load_rsp()
eda = load_eda()
emg = load_emg()

# 2. Process all signals simultaneously
bio_signals, bio_info = nk.bio_process(
    ecg=ecg,
    rsp=rsp,
    eda=eda,
    emg=emg,
    sampling_rate=1000
)

# 3. Visualize processed signals
import matplotlib.pyplot as plt

fig, axes = plt.subplots(4, 1, figsize=(15, 12), sharex=True)

# ECG
axes[0].plot(bio_signals.index / 1000, bio_signals['ECG_Clean'])
axes[0].set_ylabel('ECG')
axes[0].set_title('Multi-Modal Physiological Recording')

# Respiration
axes[1].plot(bio_signals.index / 1000, bio_signals['RSP_Clean'])
axes[1].set_ylabel('Respiration')

# EDA
axes[2].plot(bio_signals.index / 1000, bio_signals['EDA_Phasic'])
axes[2].set_ylabel('EDA (Phasic)')

# EMG
axes[3].plot(bio_signals.index / 1000, bio_signals['EMG_Amplitude'])
axes[3].set_ylabel('EMG Amplitude')
axes[3].set_xlabel('Time (s)')

plt.tight_layout()
plt.show()

# 4. Analyze all signals
results = nk.bio_analyze(bio_signals, sampling_rate=1000)

# 5. Extract key metrics
print("Heart Rate (mean):", results['ECG_Rate_Mean'])
print("HRV (RMSSD):", results['HRV_RMSSD'])
print("Breathing Rate:", results['RSP_Rate_Mean'])
print("SCRs (count):", results['SCR_Peaks_N'])
print("RSA:", results['RSA'])
```

### Event-Related Multi-Modal Analysis

```python
# 1. Process signals
bio_signals, bio_info = nk.bio_process(ecg=ecg, rsp=rsp, eda=eda, sampling_rate=1000)

# 2. Detect events
events = nk.events_find(trigger_channel, threshold=0.5)

# 3. Create epochs for all signals
epochs = nk.epochs_create(bio_signals, events, sampling_rate=1000,
                          epochs_start=-1.0, epochs_end=10.0,
                          event_labels=event_labels,
                          event_conditions=event_conditions)

# 4. Signal-specific event-related analysis
ecg_eventrelated = nk.ecg_eventrelated(epochs)
rsp_eventrelated = nk.rsp_eventrelated(epochs)
eda_eventrelated = nk.eda_eventrelated(epochs)

# 5. Merge results
all_results = pd.merge(ecg_eventrelated, rsp_eventrelated,
                       left_index=True, right_index=True)
all_results = pd.merge(all_results, eda_eventrelated,
                       left_index=True, right_index=True)

# 6. Statistical comparison by condition
all_results['Condition'] = event_conditions
condition_means = all_results.groupby('Condition').mean()
```

### Different Sampling Rates

Handle signals with different native sampling rates:

```python
# ECG at 1000 Hz, EDA at 100 Hz
bio_signals, bio_info = nk.bio_process(
    ecg=ecg_1000hz,
    eda=eda_100hz,
    sampling_rate=1000  # Target sampling rate
)
# EDA will be automatically resampled to 1000 Hz internally
```

Or process separately and merge:

```python
# Process at native sampling rates
ecg_signals, ecg_info = nk.ecg_process(ecg, sampling_rate=1000)
eda_signals, eda_info = nk.eda_process(eda, sampling_rate=100)

# Resample to common rate
eda_resampled = nk.signal_resample(eda_signals, sampling_rate=100,
                                   desired_sampling_rate=1000)

# Merge manually
bio_signals = pd.concat([ecg_signals, eda_resampled], axis=1)
```

## Use Cases and Applications

### Comprehensive Psychophysiology Research

Capture multiple dimensions of physiological arousal:

- **Cardiac**: Orienting, attention, emotional valence
- **Respiratory**: Arousal, stress, emotion regulation
- **EDA**: Sympathetic arousal, emotional intensity
- **EMG**: Muscle tension, facial expression, startle

**Example: Emotional picture viewing**
- ECG: Heart rate deceleration during picture viewing (attention)
- EDA: SCRs reflect emotional arousal intensity
- RSP: Breath-holding or changes reflect emotional engagement
- Facial EMG: Corrugator (frown), zygomaticus (smile) for valence

### Stress and Relaxation Assessment

Multi-modal markers provide convergent evidence:

- **Increased stress**: ↑ HR, ↓ HRV, ↑ EDA, ↑ respiration rate, ↑ muscle tension
- **Relaxation**: ↓ HR, ↑ HRV, ↓ EDA, ↓ respiration rate, slow breathing, ↓ muscle tension

**Intervention effectiveness:**
- Compare multi-modal indices before vs. after intervention
- Identify which modalities respond to specific techniques

### Clinical Assessment

**Anxiety disorders:**
- Heightened baseline EDA, HR
- Exaggerated responses to stressors
- Reduced HRV, respiratory variability

**Depression:**
- Altered autonomic balance (↓ HRV)
- Blunted EDA responses
- Irregular respiratory patterns

**PTSD:**
- Hyperarousal (↑ HR, ↑ EDA baseline)
- Exaggerated startle (EMG)
- Altered RSA

### Human-Computer Interaction

Unobtrusive user state assessment:

- **Cognitive load**: ↓ HRV, ↑ EDA, suppressed blinks
- **Frustration**: ↑ HR, ↑ EDA, ↑ muscle tension
- **Engagement**: Moderate arousal, synchronized responses
- **Boredom**: Low arousal, irregular patterns

### Athletic Performance and Recovery

Monitor training load and recovery:

- **Resting HRV**: Daily monitoring for overtraining
- **EDA**: Sympathetic activation and stress
- **Respiration**: Breathing patterns during exercise/recovery
- **Multi-modal integration**: Comprehensive recovery assessment

## Advantages of Multi-Modal Recording

**Convergent validity:**
- Multiple indices converge on same construct (e.g., arousal)
- More robust than single measure

**Discriminant validity:**
- Different signals dissociate under certain conditions
- ECG reflects both sympathetic and parasympathetic
- EDA reflects primarily sympathetic

**System integration:**
- Understand whole-body physiological coordination
- Cross-signal coupling metrics (RSA, coherence)

**Redundancy and robustness:**
- If one signal quality poor, others available
- Cross-validate findings across modalities

**Richer interpretation:**
- HR deceleration + SCR increase = orienting with arousal
- HR acceleration + no SCR = cardiac response without sympathetic arousal

## Considerations

### Hardware and Synchronization

- **Same device**: Signals inherently synchronized
- **Different devices**: Requires common trigger/timestamp
  - Use hardware trigger to mark simultaneous events
  - Software alignment based on event markers
  - Verify synchronization quality (cross-correlate redundant signals)

### Signal Quality Across Modalities

- Not all signals may have equal quality
- Prioritize based on research question
- Document quality issues per signal

### Computational Cost

- Processing multiple signals increases computation time
- Consider processing in batches for large datasets
- Downsample appropriately to reduce load

### Analysis Complexity

- More signals = more variables = more statistical comparisons
- Risk of Type I error (false positives) without correction
- Use multivariate approaches or pre-registered analyses

### Interpretation

- Avoid over-interpretation of complex multi-modal patterns
- Ground in physiological theory
- Replicate findings before strong claims

## References

- Berntson, G. G., Cacioppo, J. T., & Quigley, K. S. (1993). Respiratory sinus arrhythmia: autonomic origins, physiological mechanisms, and psychophysiological implications. Psychophysiology, 30(2), 183-196.
- Cacioppo, J. T., Tassinary, L. G., & Berntson, G. (Eds.). (2017). Handbook of psychophysiology (4th ed.). Cambridge University Press.
- Kreibig, S. D. (2010). Autonomic nervous system activity in emotion: A review. Biological psychology, 84(3), 394-421.
- Laborde, S., Mosley, E., & Thayer, J. F. (2017). Heart rate variability and cardiac vagal tone in psychophysiological research–recommendations for experiment planning, data analysis, and data reporting. Frontiers in psychology, 8, 213.
