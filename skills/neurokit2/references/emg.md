# Electromyography (EMG) Analysis

## Overview

Electromyography (EMG) measures electrical activity produced by skeletal muscles during contraction. EMG analysis in NeuroKit2 focuses on amplitude estimation, muscle activation detection, and temporal dynamics for psychophysiology and motor control research.

## Main Processing Pipeline

### emg_process()

Automated EMG signal processing pipeline.

```python
signals, info = nk.emg_process(emg_signal, sampling_rate=1000)
```

**Pipeline steps:**
1. Signal cleaning (high-pass filtering, detrending)
2. Amplitude envelope extraction
3. Muscle activation detection
4. Onset and offset identification

**Returns:**
- `signals`: DataFrame with:
  - `EMG_Clean`: Filtered EMG signal
  - `EMG_Amplitude`: Linear envelope (smoothed rectified signal)
  - `EMG_Activity`: Binary activation indicator (0/1)
  - `EMG_Onsets`: Activation onset markers
  - `EMG_Offsets`: Activation offset markers
- `info`: Dictionary with activation parameters

**Typical workflow:**
- Process raw EMG → Extract amplitude → Detect activations → Analyze features

## Preprocessing Functions

### emg_clean()

Apply filtering to remove noise and prepare for amplitude extraction.

```python
cleaned_emg = nk.emg_clean(emg_signal, sampling_rate=1000)
```

**Filtering approach (BioSPPy method):**
- Fourth-order Butterworth high-pass filter (100 Hz)
- Removes low-frequency movement artifacts and baseline drift
- Removes DC offset
- Signal detrending

**Rationale:**
- EMG frequency content: 20-500 Hz (dominant: 50-150 Hz)
- High-pass at 100 Hz isolates muscle activity
- Removes ECG contamination (especially in trunk muscles)
- Removes motion artifacts (<20 Hz)

**EMG signal characteristics:**
- Random, zero-mean oscillations during contraction
- Higher amplitude = stronger contraction
- Raw EMG: both positive and negative deflections

## Feature Extraction

### emg_amplitude()

Compute linear envelope representing muscle contraction intensity.

```python
amplitude = nk.emg_amplitude(cleaned_emg, sampling_rate=1000)
```

**Method:**
1. Full-wave rectification (absolute value)
2. Low-pass filtering (smooth envelope)
3. Downsampling (optional)

**Linear envelope:**
- Smooth curve following EMG amplitude modulation
- Represents muscle force/activation level
- Suitable for further analysis (activation detection, integration)

**Typical smoothing:**
- Low-pass filter: 10-20 Hz cutoff
- Moving average: 50-200 ms window
- Balance: responsiveness vs. smoothness

## Activation Detection

### emg_activation()

Detect periods of muscle activation (onsets and offsets).

```python
activity, info = nk.emg_activation(emg_amplitude, sampling_rate=1000, method='threshold',
                                   threshold='auto', duration_min=0.05)
```

**Methods:**

**1. Threshold-based (default):**
```python
activity = nk.emg_activation(amplitude, method='threshold', threshold='auto')
```
- Compares amplitude to threshold
- `threshold='auto'`: Automatic based on signal statistics (e.g., mean + 1 SD)
- `threshold=0.1`: Manual absolute threshold
- Simple, fast, widely used

**2. Gaussian Mixture Model (GMM):**
```python
activity = nk.emg_activation(amplitude, method='mixture', n_clusters=2)
```
- Unsupervised clustering: active vs. rest
- Adaptive to signal characteristics
- More robust to varying baseline

**3. Changepoint detection:**
```python
activity = nk.emg_activation(amplitude, method='changepoint')
```
- Detects abrupt transitions in signal properties
- Identifies activation/deactivation points
- Useful for complex temporal patterns

**4. Bimodality (Silva et al., 2013):**
```python
activity = nk.emg_activation(amplitude, method='bimodal')
```
- Tests for bimodal distribution (active vs. rest)
- Determines optimal separation threshold
- Statistically principled

**Key parameters:**
- `duration_min`: Minimum activation duration (seconds)
  - Filters brief spurious activations
  - Typical: 50-100 ms
- `threshold`: Activation threshold (method-dependent)

**Returns:**
- `activity`: Binary array (0 = rest, 1 = active)
- `info`: Dictionary with onset/offset indices

**Activation metrics:**
- **Onset**: Transition from rest to activity
- **Offset**: Transition from activity to rest
- **Duration**: Time between onset and offset
- **Burst**: Single period of continuous activation

## Analysis Functions

### emg_analyze()

Automatically select event-related or interval-related analysis.

```python
analysis = nk.emg_analyze(signals, sampling_rate=1000)
```

**Mode selection:**
- Duration < 10 seconds → event-related
- Duration ≥ 10 seconds → interval-related

### emg_eventrelated()

Analyze EMG responses to discrete events/stimuli.

```python
results = nk.emg_eventrelated(epochs)
```

**Computed metrics (per epoch):**
- `EMG_Activation`: Presence of activation (binary)
- `EMG_Amplitude_Mean`: Average amplitude during epoch
- `EMG_Amplitude_Max`: Peak amplitude
- `EMG_Bursts`: Number of activation bursts
- `EMG_Onset_Latency`: Time from event to first activation (if applicable)

**Use cases:**
- Startle response (orbicularis oculi EMG)
- Facial EMG during emotional stimuli (corrugator, zygomaticus)
- Motor response latencies
- Muscle reactivity paradigms

### emg_intervalrelated()

Analyze extended EMG recordings.

```python
results = nk.emg_intervalrelated(signals, sampling_rate=1000)
```

**Computed metrics:**
- `EMG_Bursts_N`: Total number of activation bursts
- `EMG_Amplitude_Mean`: Mean amplitude across entire interval
- `EMG_Activation_Duration`: Total time in active state
- `EMG_Rest_Duration`: Total time in rest state

**Use cases:**
- Resting muscle tension assessment
- Chronic pain or stress-related muscle activity
- Fatigue monitoring during sustained tasks
- Postural muscle assessment

## Simulation and Visualization

### emg_simulate()

Generate synthetic EMG signals for testing.

```python
synthetic_emg = nk.emg_simulate(duration=10, sampling_rate=1000, burst_number=3,
                                noise=0.1, random_state=42)
```

**Parameters:**
- `burst_number`: Number of activation bursts to include
- `noise`: Background noise level
- `random_state`: Reproducibility seed

**Generated features:**
- Random EMG-like oscillations during bursts
- Realistic frequency content
- Variable burst timing and amplitude

**Use cases:**
- Algorithm validation
- Detection parameter tuning
- Educational demonstrations

### emg_plot()

Visualize processed EMG signal.

```python
nk.emg_plot(signals, info, static=True)
```

**Displays:**
- Raw and cleaned EMG signal
- Amplitude envelope
- Detected activation periods
- Onset/offset markers

**Interactive mode:** Set `static=False` for Plotly visualization

## Practical Considerations

### Sampling Rate Recommendations
- **Minimum**: 500 Hz (Nyquist for 250 Hz upper frequency)
- **Standard**: 1000 Hz (most research applications)
- **High-resolution**: 2000-4000 Hz (detailed motor unit studies)
- **Surface EMG**: 1000-2000 Hz typical
- **Intramuscular EMG**: 10,000+ Hz for single motor units

### Recording Duration
- **Event-related**: Depends on paradigm (e.g., 2-5 seconds per trial)
- **Sustained contraction**: Seconds to minutes
- **Fatigue studies**: Minutes to hours
- **Chronic monitoring**: Days (wearable EMG)

### Electrode Placement

**Surface EMG (most common):**
- Bipolar configuration (two electrodes over muscle belly)
- Reference/ground electrode over electrically neutral site (bone)
- Skin preparation: clean, abrade, reduce impedance
- Inter-electrode distance: 10-20 mm (SENIAM standards)

**Muscle-specific guidelines:**
- Follow SENIAM (Surface EMG for Non-Invasive Assessment of Muscles) recommendations
- Palpate muscle during contraction to locate belly
- Align electrodes with muscle fiber direction

**Common muscles in psychophysiology:**
- **Corrugator supercilii**: Frowning, negative affect (above eyebrow)
- **Zygomaticus major**: Smiling, positive affect (cheek)
- **Orbicularis oculi**: Startle response, fear (around eye)
- **Masseter**: Jaw clenching, stress (jaw muscle)
- **Trapezius**: Shoulder tension, stress (upper back)
- **Frontalis**: Forehead tension, surprise

### Signal Quality Issues

**ECG contamination:**
- Common in trunk and proximal muscles
- High-pass filtering (>100 Hz) usually sufficient
- If persistent: template subtraction, ICA

**Motion artifacts:**
- Low-frequency disturbances
- Electrode cable movement
- Secure electrodes, minimize cable motion

**Electrode issues:**
- Poor contact: high impedance, low amplitude
- Sweat: gradual amplitude increase, instability
- Hair: clean or shave area

**Cross-talk:**
- Adjacent muscle activity bleeding into recording
- Careful electrode placement
- Small inter-electrode distance

### Best Practices

**Standard workflow:**
```python
# 1. Clean signal (high-pass filter, detrend)
cleaned = nk.emg_clean(emg_raw, sampling_rate=1000)

# 2. Extract amplitude envelope
amplitude = nk.emg_amplitude(cleaned, sampling_rate=1000)

# 3. Detect activation periods
activity, info = nk.emg_activation(amplitude, sampling_rate=1000,
                                   method='threshold', threshold='auto')

# 4. Comprehensive processing (alternative)
signals, info = nk.emg_process(emg_raw, sampling_rate=1000)

# 5. Analyze
analysis = nk.emg_analyze(signals, sampling_rate=1000)
```

**Normalization:**
```python
# Maximum voluntary contraction (MVC) normalization
mvc_amplitude = np.max(mvc_emg_amplitude)  # From separate MVC trial
normalized_emg = (amplitude / mvc_amplitude) * 100  # Express as % MVC

# Common in ergonomics, exercise physiology
# Allows comparison across individuals and sessions
```

## Clinical and Research Applications

**Psychophysiology:**
- **Facial EMG**: Emotional valence (smile vs. frown)
- **Startle response**: Fear, surprise, defensive reactivity
- **Stress**: Chronic muscle tension (trapezius, masseter)

**Motor control and rehabilitation:**
- Gait analysis
- Movement disorders (tremor, dystonia)
- Stroke rehabilitation (muscle re-activation)
- Prosthetic control (myoelectric)

**Ergonomics and occupational health:**
- Work-related musculoskeletal disorders
- Postural assessment
- Repetitive strain injury risk

**Sports science:**
- Muscle activation patterns during exercise
- Fatigue assessment (median frequency shift)
- Training optimization

**Biofeedback:**
- Relaxation training (reduce muscle tension)
- Neuromuscular re-education
- Chronic pain management

**Sleep medicine:**
- Chin EMG for REM sleep atonia
- Periodic limb movements
- Bruxism (teeth grinding)

## Advanced EMG Analysis (Beyond NeuroKit2 Basic Functions)

**Frequency domain:**
- Median frequency shift during fatigue
- Power spectrum analysis
- Requires longer segments (≥1 second per analysis window)

**Motor unit identification:**
- Intramuscular EMG
- Spike detection and sorting
- Firing rate analysis
- Requires high sampling rates (10+ kHz)

**Muscle coordination:**
- Co-contraction indices
- Synergy analysis
- Multi-muscle integration

## Interpretation Guidelines

**Amplitude (linear envelope):**
- Higher amplitude ≈ stronger contraction (not perfectly linear)
- Relationship to force: sigmoid, influenced by many factors
- Within-subject comparisons most reliable

**Activation threshold:**
- Automatic thresholds: convenient but verify visually
- Manual thresholds: may be needed for non-standard muscles
- Resting baseline: should be near zero (if not, check electrodes)

**Burst characteristics:**
- **Phasic**: Brief bursts (startle, rapid movements)
- **Tonic**: Sustained activation (postural, sustained grip)
- **Rhythmic**: Repeated bursts (tremor, walking)

## References

- Fridlund, A. J., & Cacioppo, J. T. (1986). Guidelines for human electromyographic research. Psychophysiology, 23(5), 567-589.
- Hermens, H. J., Freriks, B., Disselhorst-Klug, C., & Rau, G. (2000). Development of recommendations for SEMG sensors and sensor placement procedures. Journal of electromyography and Kinesiology, 10(5), 361-374.
- Silva, H., Scherer, R., Sousa, J., & Londral, A. (2013). Towards improving the ssability of electromyographic interfaces. Journal of Oral Rehabilitation, 40(6), 456-465.
- Tassinary, L. G., Cacioppo, J. T., & Vanman, E. J. (2017). The skeletomotor system: Surface electromyography. In Handbook of psychophysiology (pp. 267-299). Cambridge University Press.
