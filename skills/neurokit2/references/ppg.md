# Photoplethysmography (PPG) Analysis

## Overview

Photoplethysmography (PPG) measures blood volume changes in microvascular tissue using optical sensors. PPG is widely used in wearable devices, pulse oximeters, and clinical monitors for heart rate, pulse characteristics, and cardiovascular assessment.

## Main Processing Pipeline

### ppg_process()

Automated PPG signal processing pipeline.

```python
signals, info = nk.ppg_process(ppg_signal, sampling_rate=100, method='elgendi')
```

**Pipeline steps:**
1. Signal cleaning (filtering)
2. Systolic peak detection
3. Heart rate calculation
4. Signal quality assessment

**Returns:**
- `signals`: DataFrame with:
  - `PPG_Clean`: Filtered PPG signal
  - `PPG_Peaks`: Systolic peak markers
  - `PPG_Rate`: Instantaneous heart rate (BPM)
  - `PPG_Quality`: Signal quality indicator
- `info`: Dictionary with peak indices and parameters

**Methods:**
- `'elgendi'`: Elgendi et al. (2013) algorithm (default, robust)
- `'nabian2018'`: Nabian et al. (2018) approach

## Preprocessing Functions

### ppg_clean()

Prepare raw PPG signal for peak detection.

```python
cleaned_ppg = nk.ppg_clean(ppg_signal, sampling_rate=100, method='elgendi')
```

**Methods:**

**1. Elgendi (default):**
- Butterworth bandpass filter (0.5-8 Hz)
- Removes baseline drift and high-frequency noise
- Optimized for peak detection reliability

**2. Nabian2018:**
- Alternative filtering approach
- Different frequency characteristics

**PPG signal characteristics:**
- **Systolic peak**: Rapid upstroke, sharp peak (cardiac ejection)
- **Dicrotic notch**: Secondary peak (aortic valve closure)
- **Baseline**: Slow drift due to respiration, movement, perfusion

### ppg_peaks()

Detect systolic peaks in PPG signal.

```python
peaks, info = nk.ppg_peaks(cleaned_ppg, sampling_rate=100, method='elgendi',
                           correct_artifacts=False)
```

**Methods:**
- `'elgendi'`: Two moving averages with dynamic thresholding
- `'bishop'`: Bishop's algorithm
- `'nabian2018'`: Nabian's approach
- `'scipy'`: Simple scipy peak detection

**Artifact correction:**
- Set `correct_artifacts=True` for physiological plausibility checks
- Removes spurious peaks based on inter-beat interval outliers

**Returns:**
- Dictionary with `'PPG_Peaks'` key containing peak indices

**Typical inter-beat intervals:**
- Resting adult: 600-1200 ms (50-100 BPM)
- Athlete: Can be longer (bradycardia)
- Stressed/exercising: Shorter (<600 ms, >100 BPM)

### ppg_findpeaks()

Low-level peak detection with algorithm comparison.

```python
peaks_dict = nk.ppg_findpeaks(cleaned_ppg, sampling_rate=100, method='elgendi')
```

**Use case:**
- Custom parameter tuning
- Algorithm testing
- Research method development

## Analysis Functions

### ppg_analyze()

Automatically select event-related or interval-related analysis.

```python
analysis = nk.ppg_analyze(signals, sampling_rate=100)
```

**Mode selection:**
- Duration < 10 seconds → event-related
- Duration ≥ 10 seconds → interval-related

### ppg_eventrelated()

Analyze PPG responses to discrete events/stimuli.

```python
results = nk.ppg_eventrelated(epochs)
```

**Computed metrics (per epoch):**
- `PPG_Rate_Baseline`: Heart rate before event
- `PPG_Rate_Min/Max`: Minimum/maximum heart rate during epoch
- Rate dynamics across epoch time windows

**Use cases:**
- Cardiovascular responses to emotional stimuli
- Cognitive load assessment
- Stress reactivity paradigms

### ppg_intervalrelated()

Analyze extended PPG recordings.

```python
results = nk.ppg_intervalrelated(signals, sampling_rate=100)
```

**Computed metrics:**
- `PPG_Rate_Mean`: Average heart rate
- Heart rate variability (HRV) metrics
  - Delegates to `hrv()` function
  - Time, frequency, and nonlinear domains

**Recording duration:**
- Minimum: 60 seconds for basic rate
- HRV analysis: 2-5 minutes recommended

**Use cases:**
- Resting state cardiovascular assessment
- Wearable device data analysis
- Long-term heart rate monitoring

## Quality Assessment

### ppg_quality()

Assess signal quality and reliability.

```python
quality = nk.ppg_quality(ppg_signal, sampling_rate=100, method='averageQRS')
```

**Methods:**

**1. averageQRS (default):**
- Template matching approach
- Correlates each pulse with average template
- Returns quality scores 0-1 per beat
- Threshold: >0.6 = acceptable quality

**2. dissimilarity:**
- Topographic dissimilarity measures
- Detects morphological changes

**Use cases:**
- Identify corrupted segments
- Filter low-quality data before analysis
- Validate peak detection accuracy

**Common quality issues:**
- Motion artifacts: abrupt signal changes
- Poor sensor contact: low amplitude, noise
- Vasoconstriction: reduced signal amplitude (cold, stress)

## Utility Functions

### ppg_segment()

Extract individual pulses for morphological analysis.

```python
pulses = nk.ppg_segment(cleaned_ppg, peaks, sampling_rate=100)
```

**Returns:**
- Dictionary of pulse epochs, each centered on systolic peak
- Enables pulse-to-pulse comparison
- Morphology analysis across conditions

**Use cases:**
- Pulse wave analysis
- Arterial stiffness proxies
- Vascular aging assessment

### ppg_methods()

Document preprocessing methods used in analysis.

```python
methods_info = nk.ppg_methods(method='elgendi')
```

**Returns:**
- String documenting the processing pipeline
- Useful for methods sections in publications

## Simulation and Visualization

### ppg_simulate()

Generate synthetic PPG signals for testing.

```python
synthetic_ppg = nk.ppg_simulate(duration=60, sampling_rate=100, heart_rate=70,
                                noise=0.1, random_state=42)
```

**Parameters:**
- `heart_rate`: Mean BPM (default: 70)
- `heart_rate_std`: HRV magnitude
- `noise`: Gaussian noise level
- `random_state`: Reproducibility seed

**Use cases:**
- Algorithm validation
- Parameter optimization
- Educational demonstrations

### ppg_plot()

Visualize processed PPG signal.

```python
nk.ppg_plot(signals, info, static=True)
```

**Displays:**
- Raw and cleaned PPG signal
- Detected systolic peaks
- Instantaneous heart rate trace
- Signal quality indicators

## Practical Considerations

### Sampling Rate Recommendations
- **Minimum**: 20 Hz (basic heart rate)
- **Standard**: 50-100 Hz (most wearables)
- **High-resolution**: 200-500 Hz (research, pulse wave analysis)
- **Excessive**: >1000 Hz (unnecessary for PPG)

### Recording Duration
- **Heart rate**: ≥10 seconds (few beats)
- **HRV analysis**: 2-5 minutes minimum
- **Long-term monitoring**: Hours to days (wearables)

### Sensor Placement

**Common sites:**
- **Fingertip**: Highest signal quality, most common
- **Earlobe**: Less motion artifact, clinical use
- **Wrist**: Wearable devices (smartwatches)
- **Forehead**: Reflectance mode, medical monitoring

**Transmittance vs. Reflectance:**
- **Transmittance**: Light passes through tissue (fingertip, earlobe)
  - Higher signal quality
  - Less motion artifact
- **Reflectance**: Light reflected from tissue (wrist, forehead)
  - More susceptible to noise
  - Convenient for wearables

### Common Issues and Solutions

**Low signal amplitude:**
- Poor perfusion: warm hands, increase blood flow
- Sensor contact: adjust placement, clean skin
- Vasoconstriction: environmental temperature, stress

**Motion artifacts:**
- Dominant issue in wearables
- Adaptive filtering, accelerometer-based correction
- Template matching, outlier rejection

**Baseline drift:**
- Respiratory modulation (normal)
- Movement or pressure changes
- High-pass filtering or detrending

**Missing peaks:**
- Low-quality signal: check sensor contact
- Algorithm parameters: adjust threshold
- Try alternative detection methods

### Best Practices

**Standard workflow:**
```python
# 1. Clean signal
cleaned = nk.ppg_clean(ppg_raw, sampling_rate=100, method='elgendi')

# 2. Detect peaks with artifact correction
peaks, info = nk.ppg_peaks(cleaned, sampling_rate=100, correct_artifacts=True)

# 3. Assess quality
quality = nk.ppg_quality(cleaned, sampling_rate=100)

# 4. Comprehensive processing (alternative)
signals, info = nk.ppg_process(ppg_raw, sampling_rate=100)

# 5. Analyze
analysis = nk.ppg_analyze(signals, sampling_rate=100)
```

**HRV from PPG:**
```python
# Process PPG signal
signals, info = nk.ppg_process(ppg_raw, sampling_rate=100)

# Extract peaks and compute HRV
hrv_indices = nk.hrv(info['PPG_Peaks'], sampling_rate=100)

# PPG-derived HRV is valid but may differ slightly from ECG-derived HRV
# Differences due to pulse arrival time, vascular properties
```

## Clinical and Research Applications

**Wearable health monitoring:**
- Consumer smartwatches and fitness trackers
- Continuous heart rate monitoring
- Sleep tracking and activity assessment

**Clinical monitoring:**
- Pulse oximetry (SpO₂ + heart rate)
- Perioperative monitoring
- Critical care heart rate assessment

**Cardiovascular assessment:**
- Pulse wave analysis
- Arterial stiffness proxies (pulse arrival time)
- Vascular aging indices

**Autonomic function:**
- HRV from PPG (PPG-HRV)
- Stress and recovery monitoring
- Mental workload assessment

**Remote patient monitoring:**
- Telemedicine applications
- Home-based health tracking
- Chronic disease management

**Affective computing:**
- Emotion recognition from physiological signals
- User experience research
- Human-computer interaction

## PPG vs. ECG

**Advantages of PPG:**
- Non-invasive, no electrodes
- Convenient for long-term monitoring
- Low cost, miniaturizable
- Suitable for wearables

**Disadvantages of PPG:**
- More susceptible to motion artifacts
- Lower signal quality in poor perfusion
- Pulse arrival time delay from heart
- Cannot assess cardiac electrical activity

**HRV comparison:**
- PPG-HRV generally valid for time/frequency domains
- May differ slightly due to pulse transit time variability
- ECG preferred for clinical HRV when available
- PPG acceptable for research and consumer applications

## Interpretation Guidelines

**Heart rate from PPG:**
- Same interpretation as ECG-derived heart rate
- Slight delay (pulse arrival time) is negligible for rate calculation
- Motion artifacts more common: validate with signal quality

**Pulse amplitude:**
- Reflects peripheral perfusion
- Increases: vasodilation, warmth
- Decreases: vasoconstriction, cold, stress, poor contact

**Pulse morphology:**
- Systolic peak: Cardiac ejection
- Dicrotic notch: Aortic valve closure, arterial compliance
- Aging/stiffness: Earlier, more prominent dicrotic notch

## References

- Elgendi, M. (2012). On the analysis of fingertip photoplethysmogram signals. Current cardiology reviews, 8(1), 14-25.
- Elgendi, M., Norton, I., Brearley, M., Abbott, D., & Schuurmans, D. (2013). Systolic peak detection in acceleration photoplethysmograms measured from emergency responders in tropical conditions. PloS one, 8(10), e76585.
- Allen, J. (2007). Photoplethysmography and its application in clinical physiological measurement. Physiological measurement, 28(3), R1.
- Tamura, T., Maeda, Y., Sekine, M., & Yoshida, M. (2014). Wearable photoplethysmographic sensors—past and present. Electronics, 3(2), 282-302.
