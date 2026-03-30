# Epochs and Event-Related Analysis

## Overview

Event-related analysis examines physiological responses time-locked to specific stimuli or events. NeuroKit2 provides tools for event detection, epoch creation, averaging, and event-related feature extraction across all signal types.

## Event Detection

### events_find()

Automatically detect events/triggers in a signal based on threshold crossings or changes.

```python
events = nk.events_find(event_channel, threshold=0.5, threshold_keep='above',
                        duration_min=1, inter_min=0)
```

**Parameters:**
- `threshold`: Detection threshold value
- `threshold_keep`: `'above'` or `'below'` threshold
- `duration_min`: Minimum event duration (samples) to keep
- `inter_min`: Minimum interval between events (samples)

**Returns:**
- Dictionary with:
  - `'onset'`: Event onset indices
  - `'offset'`: Event offset indices (if applicable)
  - `'duration'`: Event durations
  - `'label'`: Event labels (if multiple event types)

**Common use cases:**

**TTL triggers from experiments:**
```python
# Trigger channel: 0V baseline, 5V pulses during events
events = nk.events_find(trigger_channel, threshold=2.5, threshold_keep='above')
```

**Button presses:**
```python
# Detect when button signal goes high
button_events = nk.events_find(button_signal, threshold=0.5, threshold_keep='above',
                               duration_min=10)  # Debounce
```

**State changes:**
```python
# Detect periods above/below threshold
high_arousal = nk.events_find(eda_signal, threshold='auto', duration_min=100)
```

### events_plot()

Visualize event timing relative to signals.

```python
nk.events_plot(events, signal)
```

**Displays:**
- Signal trace
- Event markers (vertical lines or shaded regions)
- Event labels

**Use case:**
- Verify event detection accuracy
- Inspect temporal distribution of events
- Quality control before epoching

## Epoch Creation

### epochs_create()

Create epochs (segments) of data around events for event-related analysis.

```python
epochs = nk.epochs_create(data, events, sampling_rate=1000,
                          epochs_start=-0.5, epochs_end=2.0,
                          event_labels=None, event_conditions=None,
                          baseline_correction=False)
```

**Parameters:**
- `data`: DataFrame with signals or single signal
- `events`: Event indices or dictionary from `events_find()`
- `sampling_rate`: Signal sampling rate (Hz)
- `epochs_start`: Start time relative to event (seconds, negative = before)
- `epochs_end`: End time relative to event (seconds, positive = after)
- `event_labels`: List of labels for each event (optional)
- `event_conditions`: List of condition names for each event (optional)
- `baseline_correction`: If True, subtract baseline mean from each epoch

**Returns:**
- Dictionary of DataFrames, one per epoch
- Each DataFrame contains signal data with time relative to event (Index=0 at event onset)
- Includes `'Label'` and `'Condition'` columns if provided

**Typical epoch windows:**
- **Visual ERP**: -0.2 to 1.0 seconds (200 ms baseline, 1 s post-stimulus)
- **Cardiac orienting**: -1.0 to 10 seconds (capture anticipation and response)
- **EMG startle**: -0.1 to 0.5 seconds (brief response)
- **EDA SCR**: -1.0 to 10 seconds (1-3 s latency, slow recovery)

### Event Labels and Conditions

Organize events by type and experimental conditions:

```python
# Example: Emotional picture experiment
event_times = [1000, 2500, 4200, 5800]  # Event onsets in samples
event_labels = ['trial1', 'trial2', 'trial3', 'trial4']
event_conditions = ['positive', 'negative', 'positive', 'neutral']

epochs = nk.epochs_create(signals, events=event_times, sampling_rate=1000,
                          epochs_start=-1, epochs_end=5,
                          event_labels=event_labels,
                          event_conditions=event_conditions)
```

**Access epochs:**
```python
# Epoch by number
epoch_1 = epochs['1']

# Filter by condition
positive_epochs = {k: v for k, v in epochs.items() if v['Condition'][0] == 'positive'}
```

### Baseline Correction

Remove pre-stimulus baseline from epochs to isolate event-related changes:

**Automatic (during epoch creation):**
```python
epochs = nk.epochs_create(data, events, sampling_rate=1000,
                          epochs_start=-0.5, epochs_end=2.0,
                          baseline_correction=True)  # Subtracts mean of entire baseline
```

**Manual (after epoch creation):**
```python
# Subtract baseline period mean
baseline_start = -0.5  # seconds
baseline_end = 0.0     # seconds

for key, epoch in epochs.items():
    baseline_mask = (epoch.index >= baseline_start) & (epoch.index < baseline_end)
    baseline_mean = epoch[baseline_mask].mean()
    epochs[key] = epoch - baseline_mean
```

**When to baseline correct:**
- **ERPs**: Always (isolates event-related change)
- **Cardiac/EDA**: Usually (removes inter-individual baseline differences)
- **Absolute measures**: Sometimes not desired (e.g., analyzing absolute amplitude)

## Epoch Analysis and Visualization

### epochs_plot()

Visualize individual or averaged epochs.

```python
nk.epochs_plot(epochs, column='ECG_Rate', condition=None, show=True)
```

**Parameters:**
- `column`: Which signal column to plot
- `condition`: Plot only specific condition (optional)

**Displays:**
- Individual epoch traces (semi-transparent)
- Average across epochs (bold line)
- Optional: Shaded error (SEM or SD)

**Use cases:**
- Visualize event-related responses
- Compare conditions
- Identify outlier epochs

### epochs_average()

Compute grand average across epochs with statistics.

```python
average_epochs = nk.epochs_average(epochs, output='dict')
```

**Parameters:**
- `output`: `'dict'` (default) or `'df'` (DataFrame)

**Returns:**
- Dictionary or DataFrame with:
  - `'Mean'`: Average across epochs at each time point
  - `'SD'`: Standard deviation
  - `'SE'`: Standard error of mean
  - `'CI_lower'`, `'CI_upper'`: 95% confidence intervals

**Use case:**
- Compute event-related potentials (ERPs)
- Grand average cardiac/EDA/EMG responses
- Group-level analysis

**Condition-specific averaging:**
```python
# Separate averages by condition
positive_epochs = {k: v for k, v in epochs.items() if v['Condition'][0] == 'positive'}
negative_epochs = {k: v for k, v in epochs.items() if v['Condition'][0] == 'negative'}

avg_positive = nk.epochs_average(positive_epochs)
avg_negative = nk.epochs_average(negative_epochs)
```

### epochs_to_df()

Convert epochs dictionary to unified DataFrame.

```python
epochs_df = nk.epochs_to_df(epochs)
```

**Returns:**
- Single DataFrame with all epochs stacked
- Includes `'Epoch'`, `'Time'`, `'Label'`, `'Condition'` columns
- Facilitates statistical analysis and plotting with pandas/seaborn

**Use case:**
- Prepare data for mixed-effects models
- Plotting with seaborn/plotly
- Export to R or statistical software

### epochs_to_array()

Convert epochs to 3D NumPy array.

```python
epochs_array = nk.epochs_to_array(epochs, column='ECG_Rate')
```

**Returns:**
- 3D array: (n_epochs, n_timepoints, n_columns)

**Use case:**
- Machine learning input (epoched features)
- Custom array-based analysis
- Statistical tests on array data

## Signal-Specific Event-Related Analysis

NeuroKit2 provides specialized event-related analysis for each signal type:

### ECG Event-Related
```python
ecg_epochs = nk.epochs_create(ecg_signals, events, sampling_rate=1000,
                              epochs_start=-1, epochs_end=10)
ecg_results = nk.ecg_eventrelated(ecg_epochs)
```

**Computed metrics:**
- `ECG_Rate_Baseline`: Heart rate before event
- `ECG_Rate_Min/Max`: Minimum/maximum rate during epoch
- `ECG_Phase_*`: Cardiac phase at event onset
- Rate dynamics across time windows

### EDA Event-Related
```python
eda_epochs = nk.epochs_create(eda_signals, events, sampling_rate=100,
                              epochs_start=-1, epochs_end=10)
eda_results = nk.eda_eventrelated(eda_epochs)
```

**Computed metrics:**
- `EDA_SCR`: Presence of SCR (binary)
- `SCR_Amplitude`: Maximum SCR amplitude
- `SCR_Latency`: Time to SCR onset
- `SCR_RiseTime`, `SCR_RecoveryTime`
- `EDA_Tonic`: Mean tonic level

### RSP Event-Related
```python
rsp_epochs = nk.epochs_create(rsp_signals, events, sampling_rate=100,
                              epochs_start=-0.5, epochs_end=5)
rsp_results = nk.rsp_eventrelated(rsp_epochs)
```

**Computed metrics:**
- `RSP_Rate_Mean`: Average breathing rate
- `RSP_Amplitude_Mean`: Average breath depth
- `RSP_Phase`: Respiratory phase at event
- Rate/amplitude dynamics

### EMG Event-Related
```python
emg_epochs = nk.epochs_create(emg_signals, events, sampling_rate=1000,
                              epochs_start=-0.1, epochs_end=1.0)
emg_results = nk.emg_eventrelated(emg_epochs)
```

**Computed metrics:**
- `EMG_Activation`: Presence of activation
- `EMG_Amplitude_Mean/Max`: Amplitude statistics
- `EMG_Onset_Latency`: Time to activation onset
- `EMG_Bursts`: Number of activation bursts

### EOG Event-Related
```python
eog_epochs = nk.epochs_create(eog_signals, events, sampling_rate=500,
                              epochs_start=-0.5, epochs_end=2.0)
eog_results = nk.eog_eventrelated(eog_epochs)
```

**Computed metrics:**
- `EOG_Blinks_N`: Number of blinks during epoch
- `EOG_Rate_Mean`: Blink rate
- Temporal blink distribution

### PPG Event-Related
```python
ppg_epochs = nk.epochs_create(ppg_signals, events, sampling_rate=100,
                              epochs_start=-1, epochs_end=10)
ppg_results = nk.ppg_eventrelated(ppg_epochs)
```

**Computed metrics:**
- Similar to ECG: rate dynamics, phase information

## Practical Workflows

### Complete Event-Related Analysis Pipeline

```python
import neurokit2 as nk

# 1. Process physiological signals
ecg_signals, ecg_info = nk.ecg_process(ecg, sampling_rate=1000)
eda_signals, eda_info = nk.eda_process(eda, sampling_rate=100)

# 2. Align sampling rates if needed
eda_signals_resampled = nk.signal_resample(eda_signals, sampling_rate=100,
                                           desired_sampling_rate=1000)

# 3. Merge signals into single DataFrame
signals = pd.concat([ecg_signals, eda_signals_resampled], axis=1)

# 4. Detect events
events = nk.events_find(trigger_channel, threshold=0.5)

# 5. Add event labels and conditions
event_labels = ['trial1', 'trial2', 'trial3', ...]
event_conditions = ['condition_A', 'condition_B', 'condition_A', ...]

# 6. Create epochs
epochs = nk.epochs_create(signals, events, sampling_rate=1000,
                          epochs_start=-1.0, epochs_end=5.0,
                          event_labels=event_labels,
                          event_conditions=event_conditions,
                          baseline_correction=True)

# 7. Signal-specific event-related analysis
ecg_results = nk.ecg_eventrelated(epochs)
eda_results = nk.eda_eventrelated(epochs)

# 8. Merge results
results = pd.merge(ecg_results, eda_results, left_index=True, right_index=True)

# 9. Statistical analysis by condition
results['Condition'] = event_conditions
condition_comparison = results.groupby('Condition').mean()
```

### Handling Multiple Event Types

```python
# Different event types with different markers
event_type1 = nk.events_find(trigger_ch1, threshold=0.5)
event_type2 = nk.events_find(trigger_ch2, threshold=0.5)

# Combine events with labels
all_events = np.concatenate([event_type1['onset'], event_type2['onset']])
event_labels = ['type1'] * len(event_type1['onset']) + ['type2'] * len(event_type2['onset'])

# Sort by time
sort_idx = np.argsort(all_events)
all_events = all_events[sort_idx]
event_labels = [event_labels[i] for i in sort_idx]

# Create epochs
epochs = nk.epochs_create(signals, all_events, sampling_rate=1000,
                          epochs_start=-0.5, epochs_end=3.0,
                          event_labels=event_labels)

# Separate by type
type1_epochs = {k: v for k, v in epochs.items() if v['Label'][0] == 'type1'}
type2_epochs = {k: v for k, v in epochs.items() if v['Label'][0] == 'type2'}
```

### Quality Control and Artifact Rejection

```python
# Remove epochs with excessive noise or artifacts
clean_epochs = {}
for key, epoch in epochs.items():
    # Example: reject if EDA amplitude too high (movement artifact)
    if epoch['EDA_Phasic'].abs().max() < 5.0:  # Threshold
        # Example: reject if heart rate change too large (invalid)
        if epoch['ECG_Rate'].max() - epoch['ECG_Rate'].min() < 50:
            clean_epochs[key] = epoch

print(f"Kept {len(clean_epochs)}/{len(epochs)} epochs")

# Analyze clean epochs
results = nk.ecg_eventrelated(clean_epochs)
```

## Statistical Considerations

### Sample Size
- **ERP/averaging**: 20-30+ trials per condition minimum
- **Individual trial analysis**: Mixed-effects models handle variable trial counts
- **Group comparisons**: Pilot data for power analysis

### Time Window Selection
- **A priori hypotheses**: Pre-register time windows based on literature
- **Exploratory**: Use full epoch, correct for multiple comparisons
- **Avoid**: Selecting windows based on observed data (circular)

### Baseline Period
- Should be free of anticipatory effects
- Sufficient duration for stable estimate (500-1000 ms typical)
- Shorter for fast dynamics (e.g., startle: 100 ms sufficient)

### Condition Comparison
- Repeated measures ANOVA for within-subject designs
- Mixed-effects models for unbalanced data
- Permutation tests for non-parametric comparisons
- Correct for multiple comparisons (time points/signals)

## Common Applications

**Cognitive psychology:**
- P300 ERP analysis
- Error-related negativity (ERN)
- Attentional blink
- Working memory load effects

**Affective neuroscience:**
- Emotional picture viewing (EDA, HR, facial EMG)
- Fear conditioning (HR deceleration, SCR)
- Valence/arousal dimensions

**Clinical research:**
- Startle response (orbicularis oculi EMG)
- Orienting response (HR deceleration)
- Anticipation and prediction error

**Psychophysiology:**
- Cardiac defense response
- Orienting vs. defensive reflexes
- Respiratory changes during emotion

**Human-computer interaction:**
- User engagement during events
- Surprise/violation of expectation
- Cognitive load during task events

## References

- Luck, S. J. (2014). An introduction to the event-related potential technique (2nd ed.). MIT press.
- Bradley, M. M., & Lang, P. J. (2000). Measuring emotion: Behavior, feeling, and physiology. In R. D. Lane & L. Nadel (Eds.), Cognitive neuroscience of emotion (pp. 242-276). Oxford University Press.
- Boucsein, W. (2012). Electrodermal activity (2nd ed.). Springer.
- Gratton, G., Coles, M. G., & Donchin, E. (1983). A new method for off-line removal of ocular artifact. Electroencephalography and clinical neurophysiology, 55(4), 468-484.
