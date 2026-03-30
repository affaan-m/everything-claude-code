# Respiratory Signal Processing

## Overview

Respiratory signal processing in NeuroKit2 enables analysis of breathing patterns, respiratory rate, amplitude, and variability. Respiration is closely linked to cardiac activity (respiratory sinus arrhythmia), emotional state, and cognitive processes.

## Main Processing Pipeline

### rsp_process()

Automated processing of respiratory signals with peak/trough detection and feature extraction.

```python
signals, info = nk.rsp_process(rsp_signal, sampling_rate=100, method='khodadad2018')
```

**Pipeline steps:**
1. Signal cleaning (noise removal, filtering)
2. Peak (exhalation) and trough (inhalation) detection
3. Respiratory rate calculation
4. Amplitude computation
5. Phase determination (inspiration/expiration)
6. Respiratory volume per time (RVT)

**Returns:**
- `signals`: DataFrame with:
  - `RSP_Clean`: Filtered respiratory signal
  - `RSP_Peaks`, `RSP_Troughs`: Extrema markers
  - `RSP_Rate`: Instantaneous breathing rate (breaths/min)
  - `RSP_Amplitude`: Breath-to-breath amplitude
  - `RSP_Phase`: Inspiration (0) vs. expiration (1)
  - `RSP_Phase_Completion`: Phase completion percentage (0-1)
  - `RSP_RVT`: Respiratory volume per time
- `info`: Dictionary with peak/trough indices

**Methods:**
- `'khodadad2018'`: Khodadad et al. algorithm (default, robust)
- `'biosppy'`: BioSPPy-based processing (alternative)

## Preprocessing Functions

### rsp_clean()

Remove noise and smooth respiratory signal.

```python
cleaned_rsp = nk.rsp_clean(rsp_signal, sampling_rate=100, method='khodadad2018')
```

**Methods:**

**1. Khodadad2018 (default):**
- Butterworth low-pass filter
- Removes high-frequency noise
- Preserves breathing waveform

**2. BioSPPy:**
- Alternative filtering approach
- Similar performance to Khodadad

**3. Hampel filter:**
```python
cleaned_rsp = nk.rsp_clean(rsp_signal, sampling_rate=100, method='hampel')
```
- Median-based outlier removal
- Robust to artifacts and spikes
- Preserves sharp transitions

**Typical respiratory frequency:**
- Adults at rest: 12-20 breaths/min (0.2-0.33 Hz)
- Children: faster rates
- During exercise: up to 40-60 breaths/min

### rsp_peaks()

Identify inhalation troughs and exhalation peaks in respiratory signal.

```python
peaks, info = nk.rsp_peaks(cleaned_rsp, sampling_rate=100, method='khodadad2018')
```

**Detection methods:**
- `'khodadad2018'`: Optimized for clean signals
- `'biosppy'`: Alternative approach
- `'scipy'`: Simple scipy-based detection

**Returns:**
- Dictionary with:
  - `RSP_Peaks`: Indices of exhalation peaks (maximum points)
  - `RSP_Troughs`: Indices of inhalation troughs (minimum points)

**Respiratory cycle definition:**
- **Inhalation**: Trough → Peak (air flows in, chest/abdomen expands)
- **Exhalation**: Peak → Trough (air flows out, chest/abdomen contracts)

### rsp_findpeaks()

Low-level peak detection with multiple algorithm options.

```python
peaks_dict = nk.rsp_findpeaks(cleaned_rsp, sampling_rate=100, method='scipy')
```

**Methods:**
- `'scipy'`: Scipy's find_peaks
- Custom threshold-based algorithms

**Use case:**
- Fine-tuned peak detection
- Custom parameter adjustment
- Algorithm comparison

### rsp_fixpeaks()

Correct detected peak/trough anomalies (e.g., missed or false detections).

```python
corrected_peaks = nk.rsp_fixpeaks(peaks, sampling_rate=100)
```

**Corrections:**
- Remove physiologically implausible intervals
- Interpolate missing peaks
- Remove artifact-related false peaks

## Feature Extraction Functions

### rsp_rate()

Compute instantaneous breathing rate (breaths per minute).

```python
rate = nk.rsp_rate(peaks, sampling_rate=100, desired_length=None)
```

**Method:**
- Calculate inter-breath intervals from peak/trough timing
- Convert to breaths per minute (BPM)
- Interpolate to match signal length

**Typical values:**
- Resting adult: 12-20 BPM
- Slow breathing: <10 BPM (meditation, relaxation)
- Fast breathing: >25 BPM (exercise, anxiety)

### rsp_amplitude()

Compute breath-to-breath amplitude (peak-to-trough difference).

```python
amplitude = nk.rsp_amplitude(cleaned_rsp, peaks)
```

**Interpretation:**
- Larger amplitude: deeper breaths (tidal volume increase)
- Smaller amplitude: shallow breaths
- Variable amplitude: irregular breathing pattern

**Clinical relevance:**
- Reduced amplitude: restrictive lung disease, chest wall rigidity
- Increased amplitude: compensatory hyperventilation

### rsp_phase()

Determine inspiration/expiration phases and completion percentage.

```python
phase, completion = nk.rsp_phase(cleaned_rsp, peaks, sampling_rate=100)
```

**Returns:**
- `RSP_Phase`: Binary (0 = inspiration, 1 = expiration)
- `RSP_Phase_Completion`: Continuous 0-1 indicating phase progress

**Use cases:**
- Respiratory-gated stimulus presentation
- Phase-locked averaging
- Respiratory-cardiac coupling analysis

### rsp_symmetry()

Analyze breath symmetry patterns (peak-trough balance, rise-decay timing).

```python
symmetry = nk.rsp_symmetry(cleaned_rsp, peaks)
```

**Metrics:**
- Peak-trough symmetry: Are peaks and troughs equally spaced?
- Rise-decay symmetry: Is inhalation time equal to exhalation time?

**Interpretation:**
- Symmetric: normal, relaxed breathing
- Asymmetric: effortful breathing, airway obstruction

## Advanced Analysis Functions

### rsp_rrv()

Respiratory Rate Variability - analogous to heart rate variability.

```python
rrv_indices = nk.rsp_rrv(peaks, sampling_rate=100)
```

**Time-domain metrics:**
- `RRV_SDBB`: Standard deviation of breath-to-breath intervals
- `RRV_RMSSD`: Root mean square of successive differences
- `RRV_MeanBB`: Mean breath-to-breath interval

**Frequency-domain metrics:**
- Power in frequency bands (if applicable)

**Interpretation:**
- Higher RRV: flexible, adaptive breathing control
- Lower RRV: rigid, constrained breathing
- Altered RRV: anxiety, respiratory disorders, autonomic dysfunction

**Recording duration:**
- Minimum: 2-3 minutes
- Optimal: 5-10 minutes for stable estimates

### rsp_rvt()

Respiratory Volume per Time - fMRI confound regressor.

```python
rvt = nk.rsp_rvt(cleaned_rsp, peaks, sampling_rate=100)
```

**Calculation:**
- Derivative of respiratory signal
- Captures rate of volume change
- Correlates with BOLD signal fluctuations

**Use cases:**
- fMRI artifact correction
- Neuroimaging preprocessing
- Respiratory confound regression

**Reference:**
- Birn, R. M., et al. (2008). Separating respiratory-variation-related fluctuations from neuronal-activity-related fluctuations in fMRI. NeuroImage, 31(4), 1536-1548.

### rsp_rav()

Respiratory Amplitude Variability indices.

```python
rav = nk.rsp_rav(amplitude, sampling_rate=100)
```

**Metrics:**
- Standard deviation of amplitudes
- Coefficient of variation
- Range of amplitudes

**Interpretation:**
- High RAV: irregular depth (sighing, arousal changes)
- Low RAV: stable, controlled breathing

## Analysis Functions

### rsp_analyze()

Automatically select event-related or interval-related analysis.

```python
analysis = nk.rsp_analyze(signals, sampling_rate=100)
```

**Mode selection:**
- Duration < 10 seconds → event-related
- Duration ≥ 10 seconds → interval-related

### rsp_eventrelated()

Analyze respiratory responses to specific events/stimuli.

```python
results = nk.rsp_eventrelated(epochs)
```

**Computed metrics (per epoch):**
- `RSP_Rate_Mean`: Average breathing rate during epoch
- `RSP_Rate_Min/Max`: Minimum/maximum rate
- `RSP_Amplitude_Mean`: Average breath depth
- `RSP_Phase`: Respiratory phase at event onset
- Dynamics of rate and amplitude across epoch

**Use cases:**
- Respiratory changes during emotional stimuli
- Anticipatory breathing before task events
- Breath-holding or hyperventilation paradigms

### rsp_intervalrelated()

Analyze extended respiratory recordings.

```python
results = nk.rsp_intervalrelated(signals, sampling_rate=100)
```

**Computed metrics:**
- `RSP_Rate_Mean`: Average breathing rate
- `RSP_Rate_SD`: Variability in rate
- `RSP_Amplitude_Mean`: Average breath depth
- RRV indices (if sufficient data)
- RAV indices

**Recording duration:**
- Minimum: 60 seconds
- Optimal: 5-10 minutes

**Use cases:**
- Resting state breathing patterns
- Baseline respiratory assessment
- Stress or relaxation monitoring

## Simulation and Visualization

### rsp_simulate()

Generate synthetic respiratory signals for testing.

```python
synthetic_rsp = nk.rsp_simulate(duration=60, sampling_rate=100, respiratory_rate=15,
                                method='sinusoidal', noise=0.1, random_state=42)
```

**Methods:**
- `'sinusoidal'`: Simple sinusoidal oscillation (fast)
- `'breathmetrics'`: Advanced realistic breathing model (slower, more accurate)

**Parameters:**
- `respiratory_rate`: Breaths per minute (default: 15)
- `noise`: Gaussian noise level
- `random_state`: Seed for reproducibility

**Use cases:**
- Algorithm validation
- Parameter tuning
- Educational demonstrations

### rsp_plot()

Visualize processed respiratory signal.

```python
nk.rsp_plot(signals, info, static=True)
```

**Displays:**
- Raw and cleaned respiratory signal
- Detected peaks and troughs
- Instantaneous breathing rate
- Phase markers

**Interactive mode:** Set `static=False` for Plotly visualization

## Practical Considerations

### Sampling Rate Recommendations
- **Minimum**: 10 Hz (adequate for rate estimation)
- **Standard**: 50-100 Hz (research-grade)
- **High-resolution**: 1000 Hz (typically unnecessary, oversampled)

### Recording Duration
- **Rate estimation**: ≥10 seconds (few breaths)
- **RRV analysis**: ≥2-3 minutes
- **Resting state**: 5-10 minutes
- **Circadian patterns**: Hours to days

### Signal Acquisition Methods

**Strain gauge/piezoelectric belt:**
- Chest or abdominal expansion
- Most common
- Comfortable, non-invasive

**Thermistor/thermocouple:**
- Nasal/oral airflow temperature
- Direct airflow measurement
- Can be intrusive

**Capnography:**
- End-tidal CO₂ measurement
- Gold standard for physiology
- Expensive, clinical settings

**Impedance pneumography:**
- Derived from ECG electrodes
- Convenient for multi-modal recording
- Less accurate than dedicated sensors

### Common Issues and Solutions

**Irregular breathing:**
- Normal in awake, resting humans
- Sighs, yawns, speech, swallowing cause variability
- Exclude artifacts or model as events

**Shallow breathing:**
- Low signal amplitude
- Check sensor placement and tightness
- Increase gain if available

**Movement artifacts:**
- Spikes or discontinuities
- Minimize participant movement
- Use robust peak detection (Hampel filter)

**Talking/coughing:**
- Disrupts natural breathing pattern
- Annotate and exclude from analysis
- Or model as separate event types

### Best Practices

**Standard workflow:**
```python
# 1. Clean signal
cleaned = nk.rsp_clean(rsp_raw, sampling_rate=100, method='khodadad2018')

# 2. Detect peaks/troughs
peaks, info = nk.rsp_peaks(cleaned, sampling_rate=100)

# 3. Extract features
rate = nk.rsp_rate(peaks, sampling_rate=100, desired_length=len(cleaned))
amplitude = nk.rsp_amplitude(cleaned, peaks)
phase = nk.rsp_phase(cleaned, peaks, sampling_rate=100)

# 4. Comprehensive processing (alternative)
signals, info = nk.rsp_process(rsp_raw, sampling_rate=100)

# 5. Analyze
analysis = nk.rsp_analyze(signals, sampling_rate=100)
```

**Respiratory-cardiac integration:**
```python
# Process both signals
ecg_signals, ecg_info = nk.ecg_process(ecg, sampling_rate=1000)
rsp_signals, rsp_info = nk.rsp_process(rsp, sampling_rate=100)

# Respiratory sinus arrhythmia (RSA)
rsa = nk.hrv_rsa(ecg_info['ECG_R_Peaks'], rsp_signals['RSP_Clean'], sampling_rate=1000)

# Or use bio_process for multi-signal integration
bio_signals, bio_info = nk.bio_process(ecg=ecg, rsp=rsp, sampling_rate=1000)
```

## Clinical and Research Applications

**Psychophysiology:**
- Emotion and arousal (rapid, shallow breathing during stress)
- Relaxation interventions (slow, deep breathing)
- Respiratory biofeedback

**Anxiety and panic disorders:**
- Hyperventilation during panic attacks
- Altered breathing patterns
- Breathing retraining therapy effectiveness

**Sleep medicine:**
- Sleep apnea detection
- Breathing pattern abnormalities
- Sleep stage correlates

**Cardiorespiratory coupling:**
- Respiratory sinus arrhythmia (HRV modulation by breathing)
- Heart-lung interaction
- Autonomic nervous system assessment

**Neuroimaging:**
- fMRI artifact correction (RVT regressor)
- BOLD signal confound removal
- Respiratory-related brain activity

**Meditation and mindfulness:**
- Breath awareness training
- Slow breathing practices (resonance frequency ~6 breaths/min)
- Physiological markers of relaxation

**Athletic performance:**
- Breathing efficiency
- Training adaptations
- Recovery monitoring

## Interpretation Guidelines

**Breathing rate:**
- **Normal**: 12-20 BPM (adults at rest)
- **Slow**: <10 BPM (relaxation, meditation, sleep)
- **Fast**: >25 BPM (exercise, anxiety, pain, fever)

**Breathing amplitude:**
- Tidal volume typically 400-600 mL at rest
- Deep breathing: 2-3 L
- Shallow breathing: <300 mL

**Respiratory patterns:**
- **Normal**: Smooth, regular sinusoidal
- **Cheyne-Stokes**: Crescendo-decrescendo with apneas (clinical pathology)
- **Ataxic**: Completely irregular (brainstem lesion)

## References

- Khodadad, D., Nordebo, S., Müller, B., Waldmann, A., Yerworth, R., Becher, T., ... & Bayford, R. (2018). A review of tissue substitutes for ultrasound imaging. Ultrasound in medicine & biology, 44(9), 1807-1823.
- Grossman, P., & Taylor, E. W. (2007). Toward understanding respiratory sinus arrhythmia: Relations to cardiac vagal tone, evolution and biobehavioral functions. Biological psychology, 74(2), 263-285.
- Birn, R. M., Diamond, J. B., Smith, M. A., & Bandettini, P. A. (2006). Separating respiratory-variation-related fluctuations from neuronal-activity-related fluctuations in fMRI. NeuroImage, 31(4), 1536-1548.
