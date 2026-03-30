# EEG Analysis and Microstates

## Overview

Analyze electroencephalography (EEG) signals for frequency band power, channel quality assessment, source localization, and microstate identification. NeuroKit2 integrates with MNE-Python for comprehensive EEG processing workflows.

## Core EEG Functions

### eeg_power()

Compute power across standard frequency bands for specified channels.

```python
power = nk.eeg_power(eeg_data, sampling_rate=250, channels=['Fz', 'Cz', 'Pz'],
                     frequency_bands={'Delta': (0.5, 4),
                                     'Theta': (4, 8),
                                     'Alpha': (8, 13),
                                     'Beta': (13, 30),
                                     'Gamma': (30, 45)})
```

**Standard frequency bands:**
- **Delta (0.5-4 Hz)**: Deep sleep, unconscious processes
- **Theta (4-8 Hz)**: Drowsiness, meditation, memory encoding
- **Alpha (8-13 Hz)**: Relaxed wakefulness, eyes closed
- **Beta (13-30 Hz)**: Active thinking, focus, anxiety
- **Gamma (30-45 Hz)**: Cognitive processing, binding

**Returns:**
- DataFrame with power values for each channel × frequency band combination
- Columns: `Channel_Band` (e.g., 'Fz_Alpha', 'Cz_Beta')

**Use cases:**
- Resting state analysis
- Cognitive state classification
- Sleep staging
- Meditation or neurofeedback monitoring

### eeg_badchannels()

Identify problematic channels using statistical outlier detection.

```python
bad_channels = nk.eeg_badchannels(eeg_data, sampling_rate=250, bad_threshold=2)
```

**Detection methods:**
- Standard deviation outliers across channels
- Correlation with other channels
- Flat or dead channels
- Channels with excessive noise

**Parameters:**
- `bad_threshold`: Z-score threshold for outlier detection (default: 2)

**Returns:**
- List of channel names identified as problematic

**Use case:**
- Quality control before analysis
- Automatic bad channel rejection
- Interpolation or exclusion decisions

### eeg_rereference()

Re-express voltage measurements relative to different reference points.

```python
rereferenced = nk.eeg_rereference(eeg_data, reference='average', robust=False)
```

**Reference types:**
- `'average'`: Average reference (mean of all electrodes)
- `'REST'`: Reference Electrode Standardization Technique
- `'bipolar'`: Differential recording between electrode pairs
- Specific channel name: Use single electrode as reference

**Common references:**
- **Average reference**: Most common for high-density EEG
- **Linked mastoids**: Traditional clinical EEG
- **Vertex (Cz)**: Sometimes used in ERP research
- **REST**: Approximates infinity reference

**Returns:**
- Re-referenced EEG data

### eeg_gfp()

Compute Global Field Power - the standard deviation of all electrodes at each time point.

```python
gfp = nk.eeg_gfp(eeg_data)
```

**Interpretation:**
- High GFP: Strong, synchronized brain activity across regions
- Low GFP: Weak or desynchronized activity
- GFP peaks: Points of stable topography, used for microstate detection

**Use cases:**
- Identify periods of stable topographic patterns
- Select time points for microstate analysis
- Event-related potential (ERP) visualization

### eeg_diss()

Measure topographic dissimilarity between electric field configurations.

```python
dissimilarity = nk.eeg_diss(eeg_data1, eeg_data2, method='gfp')
```

**Methods:**
- GFP-based: Normalized difference
- Spatial correlation
- Cosine distance

**Use case:**
- Compare topographies between conditions
- Microstate transition analysis
- Template matching

## Source Localization

### eeg_source()

Perform source reconstruction to estimate brain-level activity from scalp recordings.

```python
sources = nk.eeg_source(eeg_data, method='sLORETA')
```

**Methods:**
- `'sLORETA'`: Standardized Low-Resolution Electromagnetic Tomography
  - Zero localization error for point sources
  - Good spatial resolution
- `'MNE'`: Minimum Norm Estimate
  - Fast, well-established
  - Bias toward superficial sources
- `'dSPM'`: Dynamic Statistical Parametric Mapping
  - Normalized MNE
- `'eLORETA'`: Exact LORETA
  - Improved localization accuracy

**Requirements:**
- Forward model (lead field matrix)
- Co-registered electrode positions
- Head model (boundary element or spherical)

**Returns:**
- Source space activity estimates

### eeg_source_extract()

Extract activity from specific anatomical brain regions.

```python
regional_activity = nk.eeg_source_extract(sources, regions=['PFC', 'MTL', 'Parietal'])
```

**Region options:**
- Standard atlases: Desikan-Killiany, Destrieux, AAL
- Custom ROIs
- Brodmann areas

**Returns:**
- Time series for each region
- Averaged or principal component across voxels

**Use cases:**
- Region-of-interest analysis
- Functional connectivity
- Source-level statistics

## Microstate Analysis

Microstates are brief (80-120 ms) periods of stable brain topography, representing coordinated neural networks. Typically 4-7 microstate classes (often labeled A, B, C, D) with distinct functions.

### microstates_segment()

Identify and extract microstates using clustering algorithms.

```python
microstates = nk.microstates_segment(eeg_data, n_microstates=4, sampling_rate=250,
                                      method='kmod', normalize=True)
```

**Methods:**
- `'kmod'` (default): Modified k-means optimized for EEG topographies
  - Polarity-invariant clustering
  - Most common in microstate literature
- `'kmeans'`: Standard k-means clustering
- `'kmedoids'`: K-medoids (more robust to outliers)
- `'pca'`: Principal component analysis
- `'ica'`: Independent component analysis
- `'aahc'`: Atomize and agglomerate hierarchical clustering

**Parameters:**
- `n_microstates`: Number of microstate classes (typically 4-7)
- `normalize`: Normalize topographies (recommended: True)
- `n_inits`: Number of random initializations (increase for stability)

**Returns:**
- Dictionary with:
  - `'maps'`: Microstate template topographies
  - `'labels'`: Microstate label at each time point
  - `'gfp'`: Global field power
  - `'gev'`: Global explained variance

### microstates_findnumber()

Estimate the optimal number of microstates.

```python
optimal_k = nk.microstates_findnumber(eeg_data, show=True)
```

**Criteria:**
- **Global Explained Variance (GEV)**: Percentage of variance explained
  - Elbow method: find "knee" in GEV curve
  - Typically 70-80% GEV achieved
- **Krzanowski-Lai (KL) Criterion**: Statistical measure balancing fit and parsimony
  - Maximum KL indicates optimal k

**Typical range:** 4-7 microstates
- 4 microstates: Classic A, B, C, D states
- 5-7 microstates: Finer-grained decomposition

### microstates_classify()

Reorder microstates based on anterior-posterior and left-right channel values.

```python
classified = nk.microstates_classify(microstates)
```

**Purpose:**
- Standardize microstate labels across subjects
- Match conventional A, B, C, D topographies:
  - **A**: Left-right orientation, parieto-occipital
  - **B**: Right-left orientation, fronto-temporal
  - **C**: Anterior-posterior orientation, frontal-central
  - **D**: Fronto-central, anterior-posterior (inverse of C)

**Returns:**
- Reordered microstate maps and labels

### microstates_clean()

Preprocess EEG data for microstate extraction.

```python
cleaned_eeg = nk.microstates_clean(eeg_data, sampling_rate=250)
```

**Preprocessing steps:**
- Bandpass filtering (typically 2-20 Hz)
- Artifact rejection
- Bad channel interpolation
- Re-referencing to average

**Rationale:**
- Microstates reflect large-scale network activity
- High-frequency and low-frequency artifacts can distort topographies

### microstates_peaks()

Identify GFP peaks for microstate analysis.

```python
peak_indices = nk.microstates_peaks(eeg_data, sampling_rate=250)
```

**Purpose:**
- Microstates typically analyzed at GFP peaks
- Peaks represent moments of maximal, stable topographic activity
- Reduces computational load and noise sensitivity

**Returns:**
- Indices of GFP local maxima

### microstates_static()

Compute temporal properties of individual microstates.

```python
static_metrics = nk.microstates_static(microstates)
```

**Metrics:**
- **Duration (ms)**: Mean time spent in each microstate
  - Typical: 80-120 ms
  - Reflects stability and persistence
- **Occurrence (per second)**: Frequency of microstate appearances
  - How often each state is entered
- **Coverage (%)**: Percentage of total time in each microstate
  - Relative dominance
- **Global Explained Variance (GEV)**: Variance explained by each class
  - Quality of template fit

**Returns:**
- DataFrame with metrics for each microstate class

**Interpretation:**
- Changes in duration: altered network stability
- Changes in occurrence: shifting state dynamics
- Changes in coverage: dominance of specific networks

### microstates_dynamic()

Analyze transition patterns between microstates.

```python
dynamic_metrics = nk.microstates_dynamic(microstates)
```

**Metrics:**
- **Transition matrix**: Probability of transitioning from state i to state j
  - Reveals preferential sequences
- **Transition rate**: Overall transition frequency
  - Higher rate: more rapid switching
- **Entropy**: Randomness of transitions
  - High entropy: unpredictable switching
  - Low entropy: stereotyped sequences
- **Markov test**: Are transitions history-dependent?

**Returns:**
- Dictionary with transition statistics

**Use cases:**
- Identify abnormal microstate sequences in clinical populations
- Network dynamics and flexibility
- State-dependent information processing

### microstates_plot()

Visualize microstate topographies and time course.

```python
nk.microstates_plot(microstates, eeg_data)
```

**Displays:**
- Topographic maps for each microstate class
- GFP trace with microstate labels
- Transition plot showing state sequences
- Statistical summary

## MNE Integration Utilities

### mne_data()

Access sample datasets from MNE-Python.

```python
raw = nk.mne_data(dataset='sample', directory=None)
```

**Available datasets:**
- `'sample'`: Multi-modal (MEG/EEG) example
- `'ssvep'`: Steady-state visual evoked potentials
- `'eegbci'`: Motor imagery BCI dataset

### mne_to_df() / mne_to_dict()

Convert MNE objects to NeuroKit-compatible formats.

```python
df = nk.mne_to_df(raw)
data_dict = nk.mne_to_dict(epochs)
```

**Use case:**
- Work with MNE-processed data in NeuroKit2
- Convert between formats for analysis

### mne_channel_add() / mne_channel_extract()

Manage individual channels in MNE objects.

```python
# Extract specific channels
subset = nk.mne_channel_extract(raw, ['Fz', 'Cz', 'Pz'])

# Add derived channels
raw_with_eog = nk.mne_channel_add(raw, new_channel_data, ch_name='EOG')
```

### mne_crop()

Trim recordings by time or samples.

```python
cropped = nk.mne_crop(raw, tmin=10, tmax=100)
```

### mne_templateMRI()

Provide template anatomy for source localization.

```python
subjects_dir = nk.mne_templateMRI()
```

**Use case:**
- Source analysis without individual MRI
- Group-level source localization
- fsaverage template brain

### eeg_simulate()

Generate synthetic EEG signals for testing.

```python
synthetic_eeg = nk.eeg_simulate(duration=60, sampling_rate=250, n_channels=32)
```

## Practical Considerations

### Sampling Rate Recommendations
- **Minimum**: 100 Hz for basic power analysis
- **Standard**: 250-500 Hz for most applications
- **High-resolution**: 1000+ Hz for detailed temporal dynamics

### Recording Duration
- **Power analysis**: ≥2 minutes for stable estimates
- **Microstates**: ≥2-5 minutes, longer preferred
- **Resting state**: 3-10 minutes typical
- **Event-related**: Depends on trial count (≥30 trials per condition)

### Artifact Management
- **Eye blinks**: Remove with ICA or regression
- **Muscle artifacts**: High-pass filter (≥1 Hz) or manual rejection
- **Bad channels**: Detect and interpolate before analysis
- **Line noise**: Notch filter at 50/60 Hz

### Best Practices

**Power analysis:**
```python
# 1. Clean data
cleaned = nk.signal_filter(eeg_data, sampling_rate=250, lowcut=0.5, highcut=45)

# 2. Identify and interpolate bad channels
bad = nk.eeg_badchannels(cleaned, sampling_rate=250)
# Interpolate bad channels using MNE

# 3. Re-reference
rereferenced = nk.eeg_rereference(cleaned, reference='average')

# 4. Compute power
power = nk.eeg_power(rereferenced, sampling_rate=250, channels=channel_list)
```

**Microstate workflow:**
```python
# 1. Preprocess
cleaned = nk.microstates_clean(eeg_data, sampling_rate=250)

# 2. Determine optimal number of states
optimal_k = nk.microstates_findnumber(cleaned, show=True)

# 3. Segment microstates
microstates = nk.microstates_segment(cleaned, n_microstates=optimal_k,
                                     sampling_rate=250, method='kmod')

# 4. Classify to standard labels
microstates = nk.microstates_classify(microstates)

# 5. Compute temporal metrics
static = nk.microstates_static(microstates)
dynamic = nk.microstates_dynamic(microstates)

# 6. Visualize
nk.microstates_plot(microstates, cleaned)
```

## Clinical and Research Applications

**Cognitive neuroscience:**
- Attention, working memory, executive function
- Language processing
- Sensory perception

**Clinical populations:**
- Epilepsy: seizure detection, localization
- Alzheimer's disease: slowing of EEG, microstate alterations
- Schizophrenia: altered microstates, especially state C
- ADHD: increased theta/beta ratio
- Depression: frontal alpha asymmetry

**Consciousness research:**
- Anesthesia monitoring
- Disorders of consciousness
- Sleep staging

**Neurofeedback:**
- Real-time frequency band training
- Alpha enhancement for relaxation
- Beta enhancement for focus

## References

- Michel, C. M., & Koenig, T. (2018). EEG microstates as a tool for studying the temporal dynamics of whole-brain neuronal networks: A review. Neuroimage, 180, 577-593.
- Pascual-Marqui, R. D., Michel, C. M., & Lehmann, D. (1995). Segmentation of brain electrical activity into microstates: model estimation and validation. IEEE Transactions on Biomedical Engineering, 42(7), 658-665.
- Gramfort, A., Luessi, M., Larson, E., Engemann, D. A., Strohmeier, D., Brodbeck, C., ... & Hämäläinen, M. (2013). MEG and EEG data analysis with MNE-Python. Frontiers in neuroscience, 7, 267.
