# Heart Rate Variability (HRV) Analysis

## Overview

Heart Rate Variability (HRV) reflects the variation in time intervals between consecutive heartbeats, providing insights into autonomic nervous system regulation, cardiovascular health, and psychological state. NeuroKit2 provides comprehensive HRV analysis across time, frequency, and nonlinear domains.

## Main Function

### hrv()

Compute all available HRV indices at once across all domains.

```python
hrv_indices = nk.hrv(peaks, sampling_rate=1000, show=False)
```

**Input:**
- `peaks`: Dictionary with `'ECG_R_Peaks'` key or array of R-peak indices
- `sampling_rate`: Signal sampling rate in Hz

**Returns:**
- DataFrame with HRV indices from all domains:
  - Time domain metrics
  - Frequency domain power spectra
  - Nonlinear complexity measures

**This is a convenience wrapper** that combines:
- `hrv_time()`
- `hrv_frequency()`
- `hrv_nonlinear()`

## Time Domain Analysis

### hrv_time()

Compute time-domain HRV metrics based on inter-beat intervals (IBIs).

```python
hrv_time = nk.hrv_time(peaks, sampling_rate=1000)
```

### Key Metrics

**Basic interval statistics:**
- `HRV_MeanNN`: Mean of NN intervals (ms)
- `HRV_SDNN`: Standard deviation of NN intervals (ms)
  - Reflects total HRV, captures all cyclic components
  - Requires ≥5 min for short-term, ≥24 hr for long-term
- `HRV_RMSSD`: Root mean square of successive differences (ms)
  - High-frequency variability, reflects parasympathetic activity
  - More stable with shorter recordings

**Successive difference measures:**
- `HRV_SDSD`: Standard deviation of successive differences (ms)
  - Similar to RMSSD, correlated with parasympathetic activity
- `HRV_pNN50`: Percentage of successive NN intervals differing >50ms
  - Parasympathetic indicator, may be insensitive in some populations
- `HRV_pNN20`: Percentage of successive NN intervals differing >20ms
  - More sensitive alternative to pNN50

**Range measures:**
- `HRV_MinNN`, `HRV_MaxNN`: Minimum and maximum NN intervals (ms)
- `HRV_CVNN`: Coefficient of variation (SDNN/MeanNN)
  - Normalized measure, useful for cross-subject comparison
- `HRV_CVSD`: Coefficient of variation of successive differences (RMSSD/MeanNN)

**Median-based statistics:**
- `HRV_MedianNN`: Median NN interval (ms)
  - Robust to outliers
- `HRV_MadNN`: Median absolute deviation of NN intervals
  - Robust dispersion measure
- `HRV_MCVNN`: Median-based coefficient of variation

**Advanced time-domain:**
- `HRV_IQRNN`: Interquartile range of NN intervals
- `HRV_pNN10`, `HRV_pNN25`, `HRV_pNN40`: Additional percentile thresholds
- `HRV_TINN`: Triangular interpolation of NN interval histogram
- `HRV_HTI`: HRV triangular index (total NN intervals / histogram height)

### Recording Duration Requirements
- **Ultra-short (< 5 min)**: RMSSD, pNN50 most reliable
- **Short-term (5 min)**: Standard for clinical use, all time-domain valid
- **Long-term (24 hr)**: Required for SDNN interpretation, captures circadian rhythms

## Frequency Domain Analysis

### hrv_frequency()

Analyze HRV power across frequency bands using spectral analysis.

```python
hrv_freq = nk.hrv_frequency(peaks, sampling_rate=1000, ulf=(0, 0.0033), vlf=(0.0033, 0.04),
                            lf=(0.04, 0.15), hf=(0.15, 0.4), vhf=(0.4, 0.5),
                            psd_method='welch', normalize=True)
```

### Frequency Bands

**Ultra-Low Frequency (ULF): 0-0.0033 Hz**
- Requires ≥24 hour recording
- Circadian rhythms, thermoregulation
- Slow metabolic processes

**Very-Low Frequency (VLF): 0.0033-0.04 Hz**
- Requires ≥5 minute recording
- Thermoregulation, hormonal fluctuations
- Renin-angiotensin system, peripheral vasomotor activity

**Low Frequency (LF): 0.04-0.15 Hz**
- Mixed sympathetic and parasympathetic influences
- Baroreceptor reflex activity
- Blood pressure regulation (10-second rhythm)

**High Frequency (HF): 0.15-0.4 Hz**
- Parasympathetic (vagal) activity
- Respiratory sinus arrhythmia
- Synchronized with breathing (respiratory rate range)

**Very-High Frequency (VHF): 0.4-0.5 Hz**
- Rarely used, may reflect measurement noise
- Requires careful interpretation

### Key Metrics

**Absolute power (ms²):**
- `HRV_ULF`, `HRV_VLF`, `HRV_LF`, `HRV_HF`, `HRV_VHF`: Power in each band
- `HRV_TP`: Total power (variance of NN intervals)
- `HRV_LFHF`: LF/HF ratio (sympathovagal balance)

**Normalized power:**
- `HRV_LFn`: LF power / (LF + HF) - normalized LF
- `HRV_HFn`: HF power / (LF + HF) - normalized HF
- `HRV_LnHF`: Natural logarithm of HF (log-normal distribution)

**Peak frequencies:**
- `HRV_LFpeak`, `HRV_HFpeak`: Frequency of maximum power in each band
- Useful for identifying dominant oscillations

### Power Spectral Density Methods

**Welch's method (default):**
```python
hrv_freq = nk.hrv_frequency(peaks, sampling_rate=1000, psd_method='welch')
```
- Windowed FFT with overlap
- Smoother spectra, reduced variance
- Good for standard HRV analysis

**Lomb-Scargle periodogram:**
```python
hrv_freq = nk.hrv_frequency(peaks, sampling_rate=1000, psd_method='lomb')
```
- Handles unevenly sampled data
- No interpolation required
- Better for noisy or artifact-containing data

**Multitaper method:**
```python
hrv_freq = nk.hrv_frequency(peaks, sampling_rate=1000, psd_method='multitapers')
```
- Superior spectral estimation
- Reduced variance with minimal bias
- Computationally intensive

**Burg autoregressive:**
```python
hrv_freq = nk.hrv_frequency(peaks, sampling_rate=1000, psd_method='burg', order=16)
```
- Parametric method
- Smooth spectra with well-defined peaks
- Requires order selection

### Interpretation Guidelines

**LF/HF Ratio:**
- Traditionally interpreted as sympathovagal balance
- **Caution**: Recent evidence questions this interpretation
- LF reflects both sympathetic and parasympathetic influences
- Context-dependent: controlled respiration affects HF

**HF Power:**
- Reliable parasympathetic indicator
- Increases with: rest, relaxation, deep breathing
- Decreases with: stress, anxiety, sympathetic activation

**Recording Requirements:**
- **Minimum**: 60 seconds for LF/HF estimation
- **Recommended**: 2-5 minutes for short-term HRV
- **Optimal**: 5 minutes per Task Force standards
- **Long-term**: 24 hours for ULF analysis

## Nonlinear Domain Analysis

### hrv_nonlinear()

Compute complexity, entropy, and fractal measures reflecting autonomic dynamics.

```python
hrv_nonlinear = nk.hrv_nonlinear(peaks, sampling_rate=1000)
```

### Poincaré Plot Indices

**Poincaré plot**: NN(i+1) vs NN(i) scatter plot geometry

- `HRV_SD1`: Standard deviation perpendicular to line of identity (ms)
  - Short-term HRV, fast beat-to-beat variability
  - Reflects parasympathetic activity
  - Mathematically related to RMSSD: SD1 ≈ RMSSD/√2

- `HRV_SD2`: Standard deviation along line of identity (ms)
  - Long-term HRV, slow variability
  - Reflects sympathetic and parasympathetic activity
  - Related to SDNN

- `HRV_SD1SD2`: Ratio SD1/SD2
  - Balance between short and long-term variability
  - <1: predominantly long-term variability

- `HRV_SD2SD1`: Ratio SD2/SD1
  - Inverse of SD1SD2

- `HRV_S`: Area of ellipse (π × SD1 × SD2)
  - Total HRV magnitude

- `HRV_CSI`: Cardiac Sympathetic Index (SD2/SD1)
  - Proposed sympathetic indicator

- `HRV_CVI`: Cardiac Vagal Index (log10(SD1 × SD2))
  - Proposed parasympathetic indicator

- `HRV_CSI_Modified`: Modified CSI (SD2²/(SD1 × SD2))

### Heart Rate Asymmetry

Analyzes whether heart rate accelerations and decelerations contribute differently to HRV.

- `HRV_GI`: Guzik's Index - asymmetry of short-term variability
- `HRV_SI`: Slope Index - asymmetry of long-term variability
- `HRV_AI`: Area Index - overall asymmetry
- `HRV_PI`: Porta's Index - percentage of decelerations
- `HRV_C1d`, `HRV_C2d`: Deceleration contributions
- `HRV_C1a`, `HRV_C2a`: Acceleration contributions
- `HRV_SD1d`, `HRV_SD1a`: Poincaré SD1 for decelerations/accelerations
- `HRV_SD2d`, `HRV_SD2a`: Poincaré SD2 for decelerations/accelerations

**Interpretation:**
- Healthy individuals: asymmetry present (more/larger decelerations)
- Clinical populations: reduced asymmetry
- Reflects differential autonomic control of acceleration vs. deceleration

### Entropy Measures

**Approximate Entropy (ApEn):**
- `HRV_ApEn`: Regularity measure, lower = more regular/predictable
- Sensitive to data length, order m, tolerance r

**Sample Entropy (SampEn):**
- `HRV_SampEn`: Improved ApEn, less dependent on data length
- More consistent with short recordings
- Lower values = more regular patterns

**Multiscale Entropy (MSE):**
- `HRV_MSE`: Complexity across multiple time scales
- Distinguishes true complexity from randomness

**Fuzzy Entropy:**
- `HRV_FuzzyEn`: Fuzzy membership functions for pattern matching
- More stable with short data

**Shannon Entropy:**
- `HRV_ShanEn`: Information-theoretic randomness measure

### Fractal Measures

**Detrended Fluctuation Analysis (DFA):**
- `HRV_DFA_alpha1`: Short-term fractal scaling exponent (4-11 beats)
  - α1 > 1: correlations, reduced in heart disease
  - α1 ≈ 1: pink noise, healthy
  - α1 < 0.5: anti-correlations

- `HRV_DFA_alpha2`: Long-term fractal scaling exponent (>11 beats)
  - Reflects long-range correlations

- `HRV_DFA_alpha1alpha2`: Ratio α1/α2

**Correlation Dimension:**
- `HRV_CorDim`: Dimensionality of attractor in phase space
- Indicates system complexity

**Higuchi Fractal Dimension:**
- `HRV_HFD`: Complexity and self-similarity
- Higher values = more complex, irregular

**Petrosian Fractal Dimension:**
- `HRV_PFD`: Alternative complexity measure
- Computationally efficient

**Katz Fractal Dimension:**
- `HRV_KFD`: Waveform complexity

### Heart Rate Fragmentation

Quantifies abnormal short-term fluctuations reflecting autonomic dysregulation.

- `HRV_PIP`: Percentage of inflection points
  - Normal: ~50%, Fragmented: >70%
- `HRV_IALS`: Inverse average length of acceleration/deceleration segments
- `HRV_PSS`: Percentage of short segments (<3 beats)
- `HRV_PAS`: Percentage of NN intervals in alternation segments

**Clinical relevance:**
- Increased fragmentation associated with cardiovascular risk
- Independent predictor beyond traditional HRV metrics

### Other Nonlinear Metrics

- `HRV_Hurst`: Hurst exponent (long-range dependence)
- `HRV_LZC`: Lempel-Ziv complexity (algorithmic complexity)
- `HRV_MFDFA`: Multifractal DFA indices

## Specialized HRV Functions

### hrv_rsa()

Respiratory Sinus Arrhythmia - heart rate modulation by breathing.

```python
rsa = nk.hrv_rsa(peaks, rsp_signal, sampling_rate=1000, method='porges1980')
```

**Methods:**
- `'porges1980'`: Porges-Bohrer method (band-pass filtered HR around breathing frequency)
- `'harrison2021'`: Peak-to-trough RSA (max-min HR per breath cycle)

**Requirements:**
- Both ECG and respiratory signals
- Synchronized timing
- At least several breath cycles

**Returns:**
- `RSA`: RSA magnitude (beats/min or similar units depending on method)

### hrv_rqa()

Recurrence Quantification Analysis - nonlinear dynamics from phase space reconstruction.

```python
rqa = nk.hrv_rqa(peaks, sampling_rate=1000)
```

**Metrics:**
- `RQA_RR`: Recurrence rate - system predictability
- `RQA_DET`: Determinism - percentage of recurrent points forming lines
- `RQA_LMean`, `RQA_LMax`: Average and maximum diagonal line length
- `RQA_ENTR`: Shannon entropy of line lengths - complexity
- `RQA_LAM`: Laminarity - system trapped in specific states
- `RQA_TT`: Trapping time - duration in laminar states

**Use case:**
- Detect transitions in physiological states
- Assess system determinism vs. stochasticity

## Interval Processing

### intervals_process()

Preprocess RR-intervals before HRV analysis.

```python
processed_intervals = nk.intervals_process(rr_intervals, interpolate=False,
                                           interpolate_sampling_rate=1000)
```

**Operations:**
- Removes physiologically implausible intervals
- Optional: interpolates to regular sampling
- Optional: detrending to remove slow trends

**Use case:**
- When working with pre-extracted RR intervals
- Cleaning intervals from external devices
- Preparing data for frequency-domain analysis

### intervals_to_peaks()

Convert interval data (RR, NN) to peak indices for HRV analysis.

```python
peaks_dict = nk.intervals_to_peaks(rr_intervals, sampling_rate=1000)
```

**Use case:**
- Import data from external HRV devices
- Work with interval data from commercial systems
- Convert between interval and peak representations

## Practical Considerations

### Minimum Recording Duration

| Analysis | Minimum Duration | Optimal Duration |
|----------|-----------------|------------------|
| RMSSD, pNN50 | 30 sec | 5 min |
| SDNN | 5 min | 5 min (short), 24 hr (long) |
| LF, HF power | 2 min | 5 min |
| VLF power | 5 min | 10+ min |
| ULF power | 24 hr | 24 hr |
| Nonlinear (ApEn, SampEn) | 100-300 beats | 500+ beats |
| DFA | 300 beats | 1000+ beats |

### Artifact Management

**Preprocessing:**
```python
# Detect R-peaks with artifact correction
peaks, info = nk.ecg_peaks(cleaned_ecg, sampling_rate=1000, correct_artifacts=True)

# Or manually process intervals
processed = nk.intervals_process(rr_intervals, interpolate=False)
```

**Quality checks:**
- Visual inspection of tachogram (NN intervals over time)
- Identify physiologically implausible intervals (<300 ms or >2000 ms)
- Check for sudden jumps or missing beats
- Assess signal quality before analysis

### Standardization and Comparison

**Task Force Standards (1996):**
- 5-minute recordings for short-term
- Supine, controlled breathing recommended
- 24-hour for long-term assessment

**Normalization:**
- Consider age, sex, fitness level effects
- Time of day and circadian effects
- Body position (supine vs. standing)
- Breathing rate and depth

**Inter-individual variability:**
- HRV has large between-subject variation
- Within-subject changes more interpretable
- Baseline comparisons preferred

## Clinical and Research Applications

**Cardiovascular health:**
- Reduced HRV: risk factor for cardiac events
- SDNN, DFA alpha1: prognostic indicators
- Post-MI monitoring

**Psychological state:**
- Anxiety/stress: reduced HRV (especially RMSSD, HF)
- Depression: altered autonomic balance
- PTSD: fragmentation indices

**Athletic performance:**
- Training load monitoring via daily RMSSD
- Overtraining: reduced HRV
- Recovery assessment

**Neuroscience:**
- Emotion regulation studies
- Cognitive load assessment
- Brain-heart axis research

**Aging:**
- HRV decreases with age
- Complexity measures decline
- Baseline reference needed

## References

- Task Force of the European Society of Cardiology. (1996). Heart rate variability: standards of measurement, physiological interpretation and clinical use. Circulation, 93(5), 1043-1065.
- Shaffer, F., & Ginsberg, J. P. (2017). An overview of heart rate variability metrics and norms. Frontiers in public health, 5, 258.
- Peng, C. K., Havlin, S., Stanley, H. E., & Goldberger, A. L. (1995). Quantification of scaling exponents and crossover phenomena in nonstationary heartbeat time series. Chaos, 5(1), 82-87.
- Guzik, P., Piskorski, J., Krauze, T., Wykretowicz, A., & Wysocki, H. (2006). Heart rate asymmetry by Poincaré plots of RR intervals. Biomedizinische Technik/Biomedical Engineering, 51(4), 272-275.
- Costa, M., Goldberger, A. L., & Peng, C. K. (2005). Multiscale entropy analysis of biological signals. Physical review E, 71(2), 021906.
