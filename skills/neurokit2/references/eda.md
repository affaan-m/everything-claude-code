# Electrodermal Activity (EDA) Analysis

## Overview

Electrodermal Activity (EDA), also known as Galvanic Skin Response (GSR) or Skin Conductance (SC), measures the electrical conductance of the skin, reflecting sympathetic nervous system arousal and sweat gland activity. EDA is widely used in psychophysiology, affective computing, and lie detection.

## Main Processing Pipeline

### eda_process()

Automated processing of raw EDA signals returning tonic/phasic decomposition and SCR features.

```python
signals, info = nk.eda_process(eda_signal, sampling_rate=100, method='neurokit')
```

**Pipeline steps:**
1. Signal cleaning (low-pass filtering)
2. Tonic-phasic decomposition
3. Skin conductance response (SCR) detection
4. SCR feature extraction (onset, peak, amplitude, rise/recovery times)

**Returns:**
- `signals`: DataFrame with:
  - `EDA_Clean`: Filtered signal
  - `EDA_Tonic`: Slow-varying baseline
  - `EDA_Phasic`: Fast-varying responses
  - `SCR_Onsets`, `SCR_Peaks`, `SCR_Height`: Response markers
  - `SCR_Amplitude`, `SCR_RiseTime`, `SCR_RecoveryTime`: Response features
- `info`: Dictionary with processing parameters

**Methods:**
- `'neurokit'`: cvxEDA decomposition + neurokit peak detection
- `'biosppy'`: Median smoothing + biosppy approach

## Preprocessing Functions

### eda_clean()

Remove noise through low-pass filtering.

```python
cleaned_eda = nk.eda_clean(eda_signal, sampling_rate=100, method='neurokit')
```

**Methods:**
- `'neurokit'`: Low-pass Butterworth filter (3 Hz cutoff)
- `'biosppy'`: Low-pass Butterworth filter (5 Hz cutoff)

**Automatic skipping:**
- If sampling rate < 7 Hz, cleaning is skipped (already low-pass)

**Rationale:**
- EDA frequency content typically 0-3 Hz
- Remove high-frequency noise and motion artifacts
- Preserve slow SCRs (typical rise time 1-3 seconds)

### eda_phasic()

Decompose EDA into tonic (slow baseline) and phasic (rapid responses) components.

```python
tonic, phasic = nk.eda_phasic(eda_cleaned, sampling_rate=100, method='cvxeda')
```

**Methods:**

**1. cvxEDA (default, recommended):**
```python
tonic, phasic = nk.eda_phasic(eda_cleaned, sampling_rate=100, method='cvxeda')
```
- Convex optimization approach (Greco et al., 2016)
- Sparse phasic driver model
- Most physiologically accurate
- Computationally intensive but superior decomposition

**2. Median smoothing:**
```python
tonic, phasic = nk.eda_phasic(eda_cleaned, sampling_rate=100, method='smoothmedian')
```
- Median filter with configurable window
- Fast, simple
- Less accurate than cvxEDA

**3. High-pass filtering (Biopac's Acqknowledge):**
```python
tonic, phasic = nk.eda_phasic(eda_cleaned, sampling_rate=100, method='highpass')
```
- High-pass filter (0.05 Hz) extracts phasic
- Fast computation
- Tonic derived by subtraction

**4. SparsEDA:**
```python
tonic, phasic = nk.eda_phasic(eda_cleaned, sampling_rate=100, method='sparseda')
```
- Sparse deconvolution approach
- Alternative optimization method

**Returns:**
- `tonic`: Slow-varying skin conductance level (SCL)
- `phasic`: Fast skin conductance responses (SCRs)

**Physiological interpretation:**
- **Tonic (SCL)**: Baseline arousal, general activation, hydration
- **Phasic (SCR)**: Event-related responses, orienting, emotional reactions

### eda_peaks()

Detect Skin Conductance Responses (SCRs) in phasic component.

```python
peaks, info = nk.eda_peaks(eda_phasic, sampling_rate=100, method='neurokit',
                           amplitude_min=0.1)
```

**Methods:**
- `'neurokit'`: Optimized for reliability, configurable thresholds
- `'gamboa2008'`: Gamboa's algorithm
- `'kim2004'`: Kim's approach
- `'vanhalem2020'`: Van Halem's method
- `'nabian2018'`: Nabian's algorithm

**Key parameters:**
- `amplitude_min`: Minimum SCR amplitude (default: 0.1 µS)
  - Too low: false positives from noise
  - Too high: miss small but valid responses
- `rise_time_max`: Maximum rise time (default: 2 seconds)
- `rise_time_min`: Minimum rise time (default: 0.01 seconds)

**Returns:**
- Dictionary with:
  - `SCR_Onsets`: Indices where SCR begins
  - `SCR_Peaks`: Indices of peak amplitude
  - `SCR_Height`: Peak height above baseline
  - `SCR_Amplitude`: Onset-to-peak amplitude
  - `SCR_RiseTime`: Onset-to-peak duration
  - `SCR_RecoveryTime`: Peak-to-recovery duration (50% decay)

**SCR timing conventions:**
- **Latency**: 1-3 seconds after stimulus (typical)
- **Rise time**: 0.5-3 seconds
- **Recovery time**: 2-10 seconds (to 50% recovery)
- **Minimum amplitude**: 0.01-0.05 µS (detection threshold)

### eda_fixpeaks()

Correct detected SCR peaks (currently placeholder for EDA).

```python
corrected_peaks = nk.eda_fixpeaks(peaks)
```

**Note:** Less critical for EDA than cardiac signals due to slower dynamics.

## Analysis Functions

### eda_analyze()

Automatically select appropriate analysis type based on data duration.

```python
analysis = nk.eda_analyze(signals, sampling_rate=100)
```

**Mode selection:**
- Duration < 10 seconds → `eda_eventrelated()`
- Duration ≥ 10 seconds → `eda_intervalrelated()`

**Returns:**
- DataFrame with EDA metrics appropriate for analysis mode

### eda_eventrelated()

Analyze stimulus-locked EDA epochs for event-related responses.

```python
results = nk.eda_eventrelated(epochs)
```

**Computed metrics (per epoch):**
- `EDA_SCR`: Presence of SCR (binary: 0 or 1)
- `SCR_Amplitude`: Maximum SCR amplitude during epoch
- `SCR_Magnitude`: Mean phasic activity
- `SCR_Peak_Amplitude`: Onset-to-peak amplitude
- `SCR_RiseTime`: Time to peak from onset
- `SCR_RecoveryTime`: Time to 50% recovery
- `SCR_Latency`: Delay from stimulus to SCR onset
- `EDA_Tonic`: Mean tonic level during epoch

**Typical parameters:**
- Epoch duration: 0-10 seconds post-stimulus
- Baseline: -1 to 0 seconds pre-stimulus
- Expected SCR latency: 1-3 seconds

**Use cases:**
- Emotional stimulus processing (images, sounds)
- Cognitive load assessment (mental arithmetic)
- Anticipation and prediction error
- Orienting responses

### eda_intervalrelated()

Analyze extended EDA recordings for overall arousal and activation patterns.

```python
results = nk.eda_intervalrelated(signals, sampling_rate=100)
```

**Computed metrics:**
- `SCR_Peaks_N`: Number of SCRs detected
- `SCR_Peaks_Amplitude_Mean`: Average SCR amplitude
- `EDA_Tonic_Mean`, `EDA_Tonic_SD`: Tonic level statistics
- `EDA_Sympathetic`: Sympathetic nervous system index
- `EDA_SympatheticN`: Normalized sympathetic index
- `EDA_Autocorrelation`: Temporal structure (lag 4 seconds)
- `EDA_Phasic_*`: Mean, SD, min, max of phasic component

**Recording duration:**
- **Minimum**: 10 seconds
- **Recommended**: 60+ seconds for stable SCR rate
- **Sympathetic index**: ≥64 seconds required

**Use cases:**
- Resting state arousal assessment
- Stress level monitoring
- Baseline sympathetic activity
- Long-term affective state

## Specialized Analysis Functions

### eda_sympathetic()

Derive sympathetic nervous system activity from frequency band (0.045-0.25 Hz).

```python
sympathetic = nk.eda_sympathetic(signals, sampling_rate=100, method='posada',
                                  show=False)
```

**Methods:**
- `'posada'`: Posada-Quintero method (2016)
  - Spectral power in 0.045-0.25 Hz band
  - Validated against other autonomic measures
- `'ghiasi'`: Ghiasi method (2018)
  - Alternative frequency-based approach

**Requirements:**
- **Minimum duration**: 64 seconds
- Sufficient for frequency resolution in target band

**Returns:**
- `EDA_Sympathetic`: Sympathetic index (absolute)
- `EDA_SympatheticN`: Normalized sympathetic index (0-1)

**Interpretation:**
- Higher values: increased sympathetic arousal
- Reflects tonic sympathetic activity, not phasic responses
- Complements SCR analysis

**Use cases:**
- Stress assessment
- Arousal monitoring over time
- Cognitive load measurement
- Complementary to HRV for autonomic balance

### eda_autocor()

Compute autocorrelation to assess temporal structure of EDA signal.

```python
autocorr = nk.eda_autocor(eda_phasic, sampling_rate=100, lag=4)
```

**Parameters:**
- `lag`: Time lag in seconds (default: 4 seconds)

**Interpretation:**
- High autocorrelation: persistent, slowly-varying signal
- Low autocorrelation: rapid, uncorrelated fluctuations
- Reflects temporal regularity of SCRs

**Use case:**
- Assess signal quality
- Characterize response patterns
- Distinguish sustained vs. transient arousal

### eda_changepoints()

Detect abrupt shifts in mean and variance of EDA signal.

```python
changepoints = nk.eda_changepoints(eda_phasic, penalty=10000, show=False)
```

**Method:**
- Penalty-based segmentation
- Identifies transitions between states

**Parameters:**
- `penalty`: Controls sensitivity (default: 10,000)
  - Higher penalty: fewer, more robust changepoints
  - Lower penalty: more sensitive to small changes

**Returns:**
- Indices of detected changepoints
- Optional visualization of segments

**Use cases:**
- Identify state transitions in continuous monitoring
- Segment data by arousal level
- Detect phase changes in experiments
- Automated epoch definition

## Visualization

### eda_plot()

Create static or interactive visualizations of processed EDA.

```python
nk.eda_plot(signals, info, static=True)
```

**Displays:**
- Raw and cleaned EDA signal
- Tonic and phasic components
- Detected SCR onsets, peaks, and recovery
- Sympathetic index time course (if computed)

**Interactive mode (`static=False`):**
- Plotly-based interactive exploration
- Zoom, pan, hover for details
- Export to image formats

## Simulation and Testing

### eda_simulate()

Generate synthetic EDA signals with configurable parameters.

```python
synthetic_eda = nk.eda_simulate(duration=10, sampling_rate=100, scr_number=3,
                                noise=0.01, drift=0.01)
```

**Parameters:**
- `duration`: Signal length in seconds
- `sampling_rate`: Sampling frequency (Hz)
- `scr_number`: Number of SCRs to include
- `noise`: Gaussian noise level
- `drift`: Slow baseline drift magnitude
- `random_state`: Seed for reproducibility

**Returns:**
- Synthetic EDA signal with realistic SCR morphology

**Use cases:**
- Algorithm testing and validation
- Educational demonstrations
- Method comparison

## Practical Considerations

### Sampling Rate Recommendations
- **Minimum**: 10 Hz (adequate for slow SCRs)
- **Standard**: 20-100 Hz (most commercial systems)
- **High-resolution**: 1000 Hz (research-grade, oversampled)

### Recording Duration
- **SCR detection**: ≥10 seconds (depends on stimulus)
- **Event-related**: Typically 10-20 seconds per trial
- **Interval-related**: ≥60 seconds for stable estimates
- **Sympathetic index**: ≥64 seconds (frequency resolution)

### Electrode Placement
- **Standard sites**:
  - Palmar: distal/middle phalanges (fingers)
  - Plantar: sole of foot
- **High density**: Thenar/hypothenar eminence
- **Avoid**: Hairy skin, low sweat gland density areas
- **Bilateral**: Left vs. right hand (typically similar)

### Signal Quality Issues

**Flat signal (no variation):**
- Check electrode contact and gel
- Verify proper placement on sweat gland-rich areas
- Allow 5-10 minute adaptation period

**Excessive noise:**
- Movement artifacts: minimize participant motion
- Electrical interference: check grounding, shielding
- Thermal effects: control room temperature

**Baseline drift:**
- Normal: slow changes over minutes
- Excessive: electrode polarization, poor contact
- Solution: use `eda_phasic()` to separate tonic drift

**Non-responders:**
- ~5-10% of population have minimal EDA
- Genetic/physiological variation
- Not indicative of equipment failure

### Best Practices

**Preprocessing workflow:**
```python
# 1. Clean signal
cleaned = nk.eda_clean(eda_raw, sampling_rate=100, method='neurokit')

# 2. Decompose tonic/phasic
tonic, phasic = nk.eda_phasic(cleaned, sampling_rate=100, method='cvxeda')

# 3. Detect SCRs
signals, info = nk.eda_peaks(phasic, sampling_rate=100, amplitude_min=0.05)

# 4. Analyze
analysis = nk.eda_analyze(signals, sampling_rate=100)
```

**Event-related workflow:**
```python
# 1. Process signal
signals, info = nk.eda_process(eda_raw, sampling_rate=100)

# 2. Find events
events = nk.events_find(trigger_channel, threshold=0.5)

# 3. Create epochs (-1 to 10 seconds around stimulus)
epochs = nk.epochs_create(signals, events, sampling_rate=100,
                          epochs_start=-1, epochs_end=10)

# 4. Event-related analysis
results = nk.eda_eventrelated(epochs)

# 5. Statistical analysis
# Compare SCR amplitude across conditions
```

## Clinical and Research Applications

**Emotion and affective science:**
- Arousal dimension of emotion (not valence)
- Emotional picture viewing
- Music-induced emotion
- Fear conditioning

**Cognitive processes:**
- Mental workload and effort
- Attention and vigilance
- Decision-making and uncertainty
- Error processing

**Clinical populations:**
- Anxiety disorders: heightened baseline, exaggerated responses
- PTSD: fear conditioning, extinction deficits
- Autism: atypical arousal patterns
- Psychopathy: reduced fear responses

**Applied settings:**
- Lie detection (polygraph)
- User experience research
- Driver monitoring
- Stress assessment in real-world settings

**Neuroimaging integration:**
- fMRI: EDA correlates with amygdala, insula activity
- Concurrent recording during brain imaging
- Autonomic-brain coupling

## Interpretation Guidelines

**SCR amplitude:**
- **0.01-0.05 µS**: Small but detectable
- **0.05-0.2 µS**: Moderate response
- **>0.2 µS**: Large response
- **Context-dependent**: Normalize within-subject

**SCR frequency:**
- **Resting**: 1-3 SCRs per minute (typical)
- **Stressed**: >5 SCRs per minute
- **Non-specific SCRs**: Spontaneous (no identifiable stimulus)

**Tonic SCL:**
- **Range**: 2-20 µS (highly variable across individuals)
- **Within-subject changes** more interpretable than absolute levels
- **Increases**: arousal, stress, cognitive load
- **Decreases**: relaxation, habituation

## References

- Boucsein, W. (2012). Electrodermal activity (2nd ed.). Springer Science & Business Media.
- Greco, A., Valenza, G., & Scilingo, E. P. (2016). cvxEDA: A convex optimization approach to electrodermal activity processing. IEEE Transactions on Biomedical Engineering, 63(4), 797-804.
- Posada-Quintero, H. F., Florian, J. P., Orjuela-Cañón, A. D., Aljama-Corrales, T., Charleston-Villalobos, S., & Chon, K. H. (2016). Power spectral density analysis of electrodermal activity for sympathetic function assessment. Annals of biomedical engineering, 44(10), 3124-3135.
- Dawson, M. E., Schell, A. M., & Filion, D. L. (2017). The electrodermal system. In Handbook of psychophysiology (pp. 217-243). Cambridge University Press.
