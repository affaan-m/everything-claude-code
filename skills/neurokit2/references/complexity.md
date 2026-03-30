# Complexity and Entropy Analysis

## Overview

Complexity measures quantify the irregularity, unpredictability, and multiscale structure of time series signals. NeuroKit2 provides comprehensive entropy, fractal dimension, and nonlinear dynamics measures for assessing physiological signal complexity.

## Main Function

### complexity()

Compute multiple complexity metrics simultaneously for exploratory analysis.

```python
complexity_indices = nk.complexity(signal, sampling_rate=1000, show=False)
```

**Returns:**
- DataFrame with numerous complexity measures across categories:
  - Entropy indices
  - Fractal dimensions
  - Nonlinear dynamics measures
  - Information-theoretic metrics

**Use case:**
- Exploratory analysis to identify relevant measures
- Comprehensive signal characterization
- Comparative studies across signals

## Parameter Optimization

Before computing complexity measures, optimal embedding parameters should be determined:

### complexity_delay()

Determine optimal time delay (τ) for phase space reconstruction.

```python
optimal_tau = nk.complexity_delay(signal, delay_max=100, method='fraser1986', show=False)
```

**Methods:**
- `'fraser1986'`: Mutual information first minimum
- `'theiler1990'`: Autocorrelation first zero crossing
- `'casdagli1991'`: Cao's method

**Use for:** Embedding delay in entropy, attractor reconstruction

### complexity_dimension()

Determine optimal embedding dimension (m).

```python
optimal_m = nk.complexity_dimension(signal, delay=None, dimension_max=20,
                                    method='afn', show=False)
```

**Methods:**
- `'afn'`: Average False Nearest Neighbors
- `'fnn'`: False Nearest Neighbors
- `'correlation'`: Correlation dimension saturation

**Use for:** Entropy calculations, phase space reconstruction

### complexity_tolerance()

Determine optimal tolerance (r) for entropy measures.

```python
optimal_r = nk.complexity_tolerance(signal, method='sd', show=False)
```

**Methods:**
- `'sd'`: Standard deviation-based (0.1-0.25 × SD typical)
- `'maxApEn'`: Maximize ApEn
- `'recurrence'`: Based on recurrence rate

**Use for:** Approximate entropy, sample entropy

### complexity_k()

Determine optimal k parameter for Higuchi fractal dimension.

```python
optimal_k = nk.complexity_k(signal, k_max=20, show=False)
```

**Use for:** Higuchi fractal dimension calculation

## Entropy Measures

Entropy quantifies randomness, unpredictability, and information content.

### entropy_shannon()

Shannon entropy - classical information-theoretic measure.

```python
shannon_entropy = nk.entropy_shannon(signal)
```

**Interpretation:**
- Higher: more random, less predictable
- Lower: more regular, predictable
- Units: bits (information)

**Use cases:**
- General randomness assessment
- Information content
- Signal irregularity

### entropy_approximate()

Approximate Entropy (ApEn) - regularity of patterns.

```python
apen = nk.entropy_approximate(signal, delay=1, dimension=2, tolerance='sd')
```

**Parameters:**
- `delay`: Time delay (τ)
- `dimension`: Embedding dimension (m)
- `tolerance`: Similarity threshold (r)

**Interpretation:**
- Lower ApEn: more regular, self-similar patterns
- Higher ApEn: more complex, irregular
- Sensitive to signal length (≥100-300 points recommended)

**Physiological applications:**
- HRV: reduced ApEn in heart disease
- EEG: altered ApEn in neurological disorders

### entropy_sample()

Sample Entropy (SampEn) - improved ApEn.

```python
sampen = nk.entropy_sample(signal, delay=1, dimension=2, tolerance='sd')
```

**Advantages over ApEn:**
- Less dependent on signal length
- More consistent across recordings
- No self-matching bias

**Interpretation:**
- Same as ApEn but more reliable
- Preferred in most applications

**Typical values:**
- HRV: 0.5-2.5 (context-dependent)
- EEG: 0.3-1.5

### entropy_multiscale()

Multiscale Entropy (MSE) - complexity across temporal scales.

```python
mse = nk.entropy_multiscale(signal, scale=20, dimension=2, tolerance='sd',
                            method='MSEn', show=False)
```

**Methods:**
- `'MSEn'`: Multiscale Sample Entropy
- `'MSApEn'`: Multiscale Approximate Entropy
- `'CMSE'`: Composite Multiscale Entropy
- `'RCMSE'`: Refined Composite Multiscale Entropy

**Interpretation:**
- Entropy at different coarse-graining scales
- Healthy/complex systems: high entropy across multiple scales
- Diseased/simpler systems: reduced entropy, especially at larger scales

**Use cases:**
- Distinguish true complexity from randomness
- White noise: constant across scales
- Pink noise/complexity: structured variation across scales

### entropy_fuzzy()

Fuzzy Entropy - uses fuzzy membership functions.

```python
fuzzen = nk.entropy_fuzzy(signal, delay=1, dimension=2, tolerance='sd', r=0.2)
```

**Advantages:**
- More stable with noisy signals
- Fuzzy boundaries for pattern matching
- Better performance with short signals

### entropy_permutation()

Permutation Entropy - based on ordinal patterns.

```python
perment = nk.entropy_permutation(signal, delay=1, dimension=3)
```

**Method:**
- Encodes signal into ordinal patterns (permutations)
- Counts pattern frequencies
- Robust to noise and non-stationarity

**Interpretation:**
- Lower: more regular ordinal structure
- Higher: more random ordering

**Use cases:**
- EEG analysis
- Anesthesia depth monitoring
- Fast computation

### entropy_spectral()

Spectral Entropy - based on power spectrum.

```python
spec_ent = nk.entropy_spectral(signal, sampling_rate=1000, bands=None)
```

**Method:**
- Normalized Shannon entropy of power spectrum
- Quantifies frequency distribution regularity

**Interpretation:**
- 0: Single frequency (pure tone)
- 1: White noise (flat spectrum)

**Use cases:**
- EEG: spectral distribution changes with states
- Anesthesia monitoring

### entropy_svd()

Singular Value Decomposition Entropy.

```python
svd_ent = nk.entropy_svd(signal, delay=1, dimension=2)
```

**Method:**
- SVD on trajectory matrix
- Entropy of singular value distribution

**Use cases:**
- Attractor complexity
- Deterministic vs. stochastic dynamics

### entropy_differential()

Differential Entropy - continuous analog of Shannon entropy.

```python
diff_ent = nk.entropy_differential(signal)
```

**Use for:** Continuous probability distributions

### Other Entropy Measures

**Tsallis Entropy:**
```python
tsallis = nk.entropy_tsallis(signal, q=2)
```
- Generalized entropy with parameter q
- q=1 reduces to Shannon entropy

**Rényi Entropy:**
```python
renyi = nk.entropy_renyi(signal, alpha=2)
```
- Generalized entropy with parameter α

**Additional specialized entropies:**
- `entropy_attention()`: Attention entropy
- `entropy_grid()`: Grid-based entropy
- `entropy_increment()`: Increment entropy
- `entropy_slope()`: Slope entropy
- `entropy_dispersion()`: Dispersion entropy
- `entropy_symbolicdynamic()`: Symbolic dynamics entropy
- `entropy_range()`: Range entropy
- `entropy_phase()`: Phase entropy
- `entropy_quadratic()`, `entropy_cumulative_residual()`, `entropy_rate()`: Specialized variants

## Fractal Dimension Measures

Fractal dimensions characterize self-similarity and roughness.

### fractal_katz()

Katz Fractal Dimension - waveform complexity.

```python
kfd = nk.fractal_katz(signal)
```

**Interpretation:**
- 1: straight line
- >1: increasing roughness and complexity
- Typical range: 1.0-2.0

**Advantages:**
- Simple, fast computation
- No parameter tuning

### fractal_higuchi()

Higuchi Fractal Dimension - self-similarity.

```python
hfd = nk.fractal_higuchi(signal, k_max=10)
```

**Method:**
- Constructs k new time series from original
- Estimates dimension from length-scale relationship

**Interpretation:**
- Higher HFD: more complex, irregular
- Lower HFD: smoother, more regular

**Use cases:**
- EEG complexity
- HRV analysis
- Epilepsy detection

### fractal_petrosian()

Petrosian Fractal Dimension - rapid estimation.

```python
pfd = nk.fractal_petrosian(signal)
```

**Advantages:**
- Fast computation
- Direct calculation (no curve fitting)

### fractal_sevcik()

Sevcik Fractal Dimension - normalized waveform complexity.

```python
sfd = nk.fractal_sevcik(signal)
```

### fractal_nld()

Normalized Length Density - curve length-based measure.

```python
nld = nk.fractal_nld(signal)
```

### fractal_psdslope()

Power Spectral Density Slope - frequency-domain fractal measure.

```python
slope = nk.fractal_psdslope(signal, sampling_rate=1000)
```

**Method:**
- Linear fit to log-log power spectrum
- Slope β relates to fractal dimension

**Interpretation:**
- β ≈ 0: White noise (random)
- β ≈ -1: Pink noise (1/f, complex)
- β ≈ -2: Brown noise (Brownian motion)

### fractal_hurst()

Hurst Exponent - long-range dependence.

```python
hurst = nk.fractal_hurst(signal, show=False)
```

**Interpretation:**
- H < 0.5: Anti-persistent (mean-reverting)
- H = 0.5: Random walk (white noise)
- H > 0.5: Persistent (trending, long-memory)

**Use cases:**
- Assess long-term correlations
- Financial time series
- HRV analysis

### fractal_correlation()

Correlation Dimension - attractor dimensionality.

```python
corr_dim = nk.fractal_correlation(signal, delay=1, dimension=10, radius=64)
```

**Method:**
- Grassberger-Procaccia algorithm
- Estimates dimension of attractor in phase space

**Interpretation:**
- Low dimension: deterministic, low-dimensional chaos
- High dimension: high-dimensional chaos or noise

### fractal_dfa()

Detrended Fluctuation Analysis - scaling exponent.

```python
dfa_alpha = nk.fractal_dfa(signal, multifractal=False, q=2, show=False)
```

**Interpretation:**
- α < 0.5: Anti-correlated
- α = 0.5: Uncorrelated (white noise)
- α = 1.0: 1/f noise (pink noise, healthy complexity)
- α = 1.5: Brownian noise
- α > 1.0: Persistent long-range correlations

**HRV applications:**
- α1 (short-term, 4-11 beats): Reflects autonomic regulation
- α2 (long-term, >11 beats): Long-range correlations
- Reduced α1: Cardiac pathology

### fractal_mfdfa()

Multifractal DFA - multiscale fractal properties.

```python
mfdfa_results = nk.fractal_mfdfa(signal, q=None, show=False)
```

**Method:**
- Extends DFA to multiple q-orders
- Characterizes multifractal spectrum

**Returns:**
- Generalized Hurst exponents h(q)
- Multifractal spectrum f(α)
- Width indicates multifractality strength

**Use cases:**
- Detect multifractal structure
- HRV multifractality in health vs. disease
- EEG multiscale dynamics

### fractal_tmf()

Multifractal Nonlinearity - deviation from monofractal.

```python
tmf = nk.fractal_tmf(signal)
```

**Interpretation:**
- Quantifies departure from simple scaling
- Higher: more multifractal structure

### fractal_density()

Density Fractal Dimension.

```python
density_fd = nk.fractal_density(signal)
```

### fractal_linelength()

Line Length - total variation measure.

```python
linelength = nk.fractal_linelength(signal)
```

**Use case:**
- Simple complexity proxy
- EEG seizure detection

## Nonlinear Dynamics

### complexity_lyapunov()

Largest Lyapunov Exponent - chaos and divergence.

```python
lyap = nk.complexity_lyapunov(signal, delay=None, dimension=None,
                              sampling_rate=1000, show=False)
```

**Interpretation:**
- λ < 0: Stable fixed point
- λ = 0: Periodic orbit
- λ > 0: Chaotic (nearby trajectories diverge exponentially)

**Use cases:**
- Detect chaos in physiological signals
- HRV: positive Lyapunov suggests nonlinear dynamics
- EEG: epilepsy detection (decreased λ before seizure)

### complexity_lempelziv()

Lempel-Ziv Complexity - algorithmic complexity.

```python
lz = nk.complexity_lempelziv(signal, symbolize='median')
```

**Method:**
- Counts number of distinct patterns
- Coarse-grained measure of randomness

**Interpretation:**
- Lower: repetitive, predictable patterns
- Higher: diverse, unpredictable patterns

**Use cases:**
- EEG: consciousness levels, anesthesia
- HRV: autonomic complexity

### complexity_rqa()

Recurrence Quantification Analysis - phase space recurrences.

```python
rqa_indices = nk.complexity_rqa(signal, delay=1, dimension=3, tolerance='sd')
```

**Metrics:**
- **Recurrence Rate (RR)**: Percentage of recurrent states
- **Determinism (DET)**: Percentage of recurrent points in lines
- **Laminarity (LAM)**: Percentage in vertical structures (laminar states)
- **Trapping Time (TT)**: Average vertical line length
- **Longest diagonal/vertical**: System predictability
- **Entropy (ENTR)**: Shannon entropy of line length distribution

**Interpretation:**
- High DET: deterministic dynamics
- High LAM: system trapped in specific states
- Low RR: random, non-recurrent dynamics

**Use cases:**
- Detect transitions in system dynamics
- Physiological state changes
- Nonlinear time series analysis

### complexity_hjorth()

Hjorth Parameters - time-domain complexity.

```python
hjorth = nk.complexity_hjorth(signal)
```

**Metrics:**
- **Activity**: Variance of signal
- **Mobility**: Proportion of standard deviation of derivative to signal
- **Complexity**: Change in mobility with derivative

**Use cases:**
- EEG feature extraction
- Seizure detection
- Signal characterization

### complexity_decorrelation()

Decorrelation Time - memory duration.

```python
decorr_time = nk.complexity_decorrelation(signal, show=False)
```

**Interpretation:**
- Time lag where autocorrelation drops below threshold
- Shorter: rapid fluctuations, short memory
- Longer: slow fluctuations, long memory

### complexity_relativeroughness()

Relative Roughness - smoothness measure.

```python
roughness = nk.complexity_relativeroughness(signal)
```

## Information Theory

### fisher_information()

Fisher Information - measure of order.

```python
fisher = nk.fisher_information(signal, delay=1, dimension=2)
```

**Interpretation:**
- High: ordered, structured
- Low: disordered, random

**Use cases:**
- Combine with Shannon entropy (Fisher-Shannon plane)
- Characterize system complexity

### fishershannon_information()

Fisher-Shannon Information Product.

```python
fs = nk.fishershannon_information(signal)
```

**Method:**
- Product of Fisher information and Shannon entropy
- Characterizes order-disorder balance

### mutual_information()

Mutual Information - shared information between variables.

```python
mi = nk.mutual_information(signal1, signal2, method='knn')
```

**Methods:**
- `'knn'`: k-nearest neighbors (nonparametric)
- `'kernel'`: Kernel density estimation
- `'binning'`: Histogram-based

**Use cases:**
- Coupling between signals
- Feature selection
- Nonlinear dependence

## Practical Considerations

### Signal Length Requirements

| Measure | Minimum Length | Optimal Length |
|---------|---------------|----------------|
| Shannon entropy | 50 | 200+ |
| ApEn, SampEn | 100-300 | 500-1000 |
| Multiscale entropy | 500 | 1000+ per scale |
| DFA | 500 | 1000+ |
| Lyapunov | 1000 | 5000+ |
| Correlation dimension | 1000 | 5000+ |

### Parameter Selection

**General guidelines:**
- Use parameter optimization functions first
- Or use conventional defaults:
  - Delay (τ): 1 for HRV, autocorrelation first minimum for EEG
  - Dimension (m): 2-3 typical
  - Tolerance (r): 0.2 × SD common

**Sensitivity:**
- Results can be parameter-sensitive
- Report parameters used
- Consider sensitivity analysis

### Normalization and Preprocessing

**Standardization:**
- Many measures sensitive to signal amplitude
- Z-score normalization often recommended
- Detrending may be necessary

**Stationarity:**
- Some measures assume stationarity
- Check with statistical tests (e.g., ADF test)
- Segment non-stationary signals

### Interpretation

**Context-dependent:**
- No universal "good" or "bad" complexity
- Compare within-subject or between groups
- Consider physiological context

**Complexity vs. randomness:**
- Maximum entropy ≠ maximum complexity
- True complexity: structured variability
- White noise: high entropy but low complexity (MSE distinguishes)

## Applications

**Cardiovascular:**
- HRV complexity: reduced in heart disease, aging
- DFA α1: prognostic marker post-MI

**Neuroscience:**
- EEG complexity: consciousness, anesthesia depth
- Entropy: Alzheimer's, epilepsy, sleep stages
- Permutation entropy: anesthesia monitoring

**Psychology:**
- Complexity loss in depression, anxiety
- Increased regularity under stress

**Aging:**
- "Complexity loss" with aging across systems
- Reduced multiscale complexity

**Critical transitions:**
- Complexity changes before state transitions
- Early warning signals (critical slowing down)

## References

- Pincus, S. M. (1991). Approximate entropy as a measure of system complexity. Proceedings of the National Academy of Sciences, 88(6), 2297-2301.
- Richman, J. S., & Moorman, J. R. (2000). Physiological time-series analysis using approximate entropy and sample entropy. American Journal of Physiology-Heart and Circulatory Physiology, 278(6), H2039-H2049.
- Peng, C. K., et al. (1995). Quantification of scaling exponents and crossover phenomena in nonstationary heartbeat time series. Chaos, 5(1), 82-87.
- Costa, M., Goldberger, A. L., & Peng, C. K. (2005). Multiscale entropy analysis of biological signals. Physical review E, 71(2), 021906.
- Grassberger, P., & Procaccia, I. (1983). Measuring the strangeness of strange attractors. Physica D: Nonlinear Phenomena, 9(1-2), 189-208.
