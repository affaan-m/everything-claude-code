# PyHealth Data Preprocessing and Processors

## Overview

PyHealth provides comprehensive data processing utilities to transform raw healthcare data into model-ready formats. Processors handle feature extraction, sequence processing, signal transformation, and label preparation.

## Processor Base Class

All processors inherit from `Processor` with standard interface:

**Key Methods:**
- `__call__()`: Transform input data
- `get_input_info()`: Return processed input schema
- `get_output_info()`: Return processed output schema

## Core Processor Types

### Feature Processors

**FeatureProcessor** (`FeatureProcessor`)
- Base class for feature extraction
- Handles vocabulary building
- Embedding preparation
- Feature encoding

**Common Operations:**
- Medical code tokenization
- Categorical encoding
- Feature normalization
- Missing value handling

**Usage:**
```python
from pyhealth.data import FeatureProcessor

processor = FeatureProcessor(
    vocabulary="diagnoses",
    min_freq=5,  # Minimum code frequency
    max_vocab_size=10000
)

processed_features = processor(raw_features)
```

### Sequence Processors

**SequenceProcessor** (`SequenceProcessor`)
- Processes sequential clinical events
- Temporal ordering preservation
- Sequence padding/truncation
- Time gap encoding

**Key Features:**
- Variable-length sequence handling
- Temporal feature extraction
- Sequence statistics computation

**Parameters:**
- `max_seq_length`: Maximum sequence length (truncate if longer)
- `padding`: Padding strategy ("pre" or "post")
- `truncating`: Truncation strategy ("pre" or "post")

**Usage:**
```python
from pyhealth.data import SequenceProcessor

processor = SequenceProcessor(
    max_seq_length=100,
    padding="post",
    truncating="post"
)

# Process diagnosis sequences
processed_seq = processor(diagnosis_sequences)
```

**NestedSequenceProcessor** (`NestedSequenceProcessor`)
- Handles hierarchical sequences (e.g., visits containing events)
- Two-level processing (visit-level and event-level)
- Preserves nested structure

**Use Cases:**
- EHR with visits containing multiple events
- Multi-level temporal modeling
- Hierarchical attention models

**Structure:**
```python
# Input: [[visit1_events], [visit2_events], ...]
# Output: Processed nested sequences with proper padding
```

### Numeric Data Processors

**NestedFloatsProcessor** (`NestedFloatsProcessor`)
- Processes nested numeric arrays
- Lab values, vital signs, measurements
- Multi-level numeric features

**Operations:**
- Normalization
- Standardization
- Missing value imputation
- Outlier handling

**Usage:**
```python
from pyhealth.data import NestedFloatsProcessor

processor = NestedFloatsProcessor(
    normalization="z-score",  # or "min-max"
    fill_missing="mean"  # imputation strategy
)

processed_labs = processor(lab_values)
```

**TensorProcessor** (`TensorProcessor`)
- Converts data to PyTorch tensors
- Type handling (long, float, etc.)
- Device placement (CPU/GPU)

**Parameters:**
- `dtype`: Tensor data type
- `device`: Computation device

### Time-Series Processors

**TimeseriesProcessor** (`TimeseriesProcessor`)
- Handles temporal data with timestamps
- Time gap computation
- Temporal feature engineering
- Irregular sampling handling

**Extracted Features:**
- Time since previous event
- Time to next event
- Event frequency
- Temporal patterns

**Usage:**
```python
from pyhealth.data import TimeseriesProcessor

processor = TimeseriesProcessor(
    time_unit="hour",  # "day", "hour", "minute"
    compute_gaps=True,
    compute_frequency=True
)

processed_ts = processor(timestamps, events)
```

**SignalProcessor** (`SignalProcessor`)
- Physiological signal processing
- EEG, ECG, PPG signals
- Filtering and preprocessing

**Operations:**
- Bandpass filtering
- Artifact removal
- Segmentation
- Feature extraction (frequency, amplitude)

**Usage:**
```python
from pyhealth.data import SignalProcessor

processor = SignalProcessor(
    sampling_rate=256,  # Hz
    bandpass_filter=(0.5, 50),  # Hz range
    segment_length=30  # seconds
)

processed_signal = processor(raw_eeg_signal)
```

### Image Processors

**ImageProcessor** (`ImageProcessor`)
- Medical image preprocessing
- Normalization and resizing
- Augmentation support
- Format standardization

**Operations:**
- Resize to standard dimensions
- Normalization (mean/std)
- Windowing (for CT/MRI)
- Data augmentation

**Usage:**
```python
from pyhealth.data import ImageProcessor

processor = ImageProcessor(
    image_size=(224, 224),
    normalization="imagenet",  # or custom mean/std
    augmentation=True
)

processed_image = processor(raw_image)
```

## Label Processors

### Binary Classification

**BinaryLabelProcessor** (`BinaryLabelProcessor`)
- Binary classification labels (0/1)
- Handles positive/negative classes
- Class weighting for imbalance

**Usage:**
```python
from pyhealth.data import BinaryLabelProcessor

processor = BinaryLabelProcessor(
    positive_class=1,
    class_weight="balanced"
)

processed_labels = processor(raw_labels)
```

### Multi-Class Classification

**MultiClassLabelProcessor** (`MultiClassLabelProcessor`)
- Multi-class classification (mutually exclusive classes)
- Label encoding
- Class balancing

**Parameters:**
- `num_classes`: Number of classes
- `class_weight`: Weighting strategy

**Usage:**
```python
from pyhealth.data import MultiClassLabelProcessor

processor = MultiClassLabelProcessor(
    num_classes=5,  # e.g., sleep stages: W, N1, N2, N3, REM
    class_weight="balanced"
)

processed_labels = processor(raw_labels)
```

### Multi-Label Classification

**MultiLabelProcessor** (`MultiLabelProcessor`)
- Multi-label classification (multiple labels per sample)
- Binary encoding for each label
- Label co-occurrence handling

**Use Cases:**
- Drug recommendation (multiple drugs)
- ICD coding (multiple diagnoses)
- Comorbidity prediction

**Usage:**
```python
from pyhealth.data import MultiLabelProcessor

processor = MultiLabelProcessor(
    num_labels=100,  # total possible labels
    threshold=0.5  # prediction threshold
)

processed_labels = processor(raw_label_sets)
```

### Regression

**RegressionLabelProcessor** (`RegressionLabelProcessor`)
- Continuous value prediction
- Target scaling and normalization
- Outlier handling

**Use Cases:**
- Length of stay prediction
- Lab value prediction
- Risk score estimation

**Usage:**
```python
from pyhealth.data import RegressionLabelProcessor

processor = RegressionLabelProcessor(
    normalization="z-score",  # or "min-max"
    clip_outliers=True,
    outlier_std=3  # clip at 3 standard deviations
)

processed_targets = processor(raw_values)
```

## Specialized Processors

### Text Processing

**TextProcessor** (`TextProcessor`)
- Clinical text preprocessing
- Tokenization
- Vocabulary building
- Sequence encoding

**Operations:**
- Lowercasing
- Punctuation removal
- Medical abbreviation handling
- Token frequency filtering

**Usage:**
```python
from pyhealth.data import TextProcessor

processor = TextProcessor(
    tokenizer="word",  # or "sentencepiece", "bpe"
    lowercase=True,
    max_vocab_size=50000,
    min_freq=5
)

processed_text = processor(clinical_notes)
```

### Model-Specific Processors

**StageNetProcessor** (`StageNetProcessor`)
- Specialized preprocessing for StageNet model
- Chunk-based sequence processing
- Stage-aware feature extraction

**Usage:**
```python
from pyhealth.data import StageNetProcessor

processor = StageNetProcessor(
    chunk_size=128,
    num_stages=3
)

processed_data = processor(sequential_data)
```

**StageNetTensorProcessor** (`StageNetTensorProcessor`)
- Tensor conversion for StageNet
- Proper batching and padding
- Stage mask generation

### Raw Data Processing

**RawProcessor** (`RawProcessor`)
- Minimal preprocessing
- Pass-through for pre-processed data
- Custom preprocessing scenarios

**Usage:**
```python
from pyhealth.data import RawProcessor

processor = RawProcessor()
processed_data = processor(data)  # Minimal transformation
```

## Sample-Level Processing

**SampleProcessor** (`SampleProcessor`)
- Processes complete samples (input + output)
- Coordinates multiple processors
- End-to-end preprocessing pipeline

**Workflow:**
1. Apply input processors to features
2. Apply output processors to labels
3. Combine into model-ready samples

**Usage:**
```python
from pyhealth.data import SampleProcessor

processor = SampleProcessor(
    input_processors={
        "diagnoses": SequenceProcessor(max_seq_length=50),
        "medications": SequenceProcessor(max_seq_length=30),
        "labs": NestedFloatsProcessor(normalization="z-score")
    },
    output_processor=BinaryLabelProcessor()
)

processed_sample = processor(raw_sample)
```

## Dataset-Level Processing

**DatasetProcessor** (`DatasetProcessor`)
- Processes entire datasets
- Batch processing
- Parallel processing support
- Caching for efficiency

**Operations:**
- Apply processors to all samples
- Generate vocabulary from dataset
- Compute dataset statistics
- Save processed data

**Usage:**
```python
from pyhealth.data import DatasetProcessor

processor = DatasetProcessor(
    sample_processor=sample_processor,
    num_workers=4,  # parallel processing
    cache_dir="/path/to/cache"
)

processed_dataset = processor(raw_dataset)
```

## Common Preprocessing Workflows

### Workflow 1: EHR Mortality Prediction

```python
from pyhealth.data import (
    SequenceProcessor,
    BinaryLabelProcessor,
    SampleProcessor
)

# Define processors
input_processors = {
    "diagnoses": SequenceProcessor(max_seq_length=50),
    "medications": SequenceProcessor(max_seq_length=30),
    "procedures": SequenceProcessor(max_seq_length=20)
}

output_processor = BinaryLabelProcessor(class_weight="balanced")

# Combine into sample processor
sample_processor = SampleProcessor(
    input_processors=input_processors,
    output_processor=output_processor
)

# Process dataset
processed_samples = [sample_processor(s) for s in raw_samples]
```

### Workflow 2: Sleep Staging from EEG

```python
from pyhealth.data import (
    SignalProcessor,
    MultiClassLabelProcessor,
    SampleProcessor
)

# Signal preprocessing
signal_processor = SignalProcessor(
    sampling_rate=100,
    bandpass_filter=(0.3, 35),  # EEG frequency range
    segment_length=30  # 30-second epochs
)

# Label processing
label_processor = MultiClassLabelProcessor(
    num_classes=5,  # W, N1, N2, N3, REM
    class_weight="balanced"
)

# Combine
sample_processor = SampleProcessor(
    input_processors={"signal": signal_processor},
    output_processor=label_processor
)
```

### Workflow 3: Drug Recommendation

```python
from pyhealth.data import (
    SequenceProcessor,
    MultiLabelProcessor,
    SampleProcessor
)

# Input processing
input_processors = {
    "diagnoses": SequenceProcessor(max_seq_length=50),
    "previous_medications": SequenceProcessor(max_seq_length=40)
}

# Multi-label output (multiple drugs)
output_processor = MultiLabelProcessor(
    num_labels=150,  # number of possible drugs
    threshold=0.5
)

sample_processor = SampleProcessor(
    input_processors=input_processors,
    output_processor=output_processor
)
```

### Workflow 4: Length of Stay Prediction

```python
from pyhealth.data import (
    SequenceProcessor,
    NestedFloatsProcessor,
    RegressionLabelProcessor,
    SampleProcessor
)

# Process different feature types
input_processors = {
    "diagnoses": SequenceProcessor(max_seq_length=30),
    "procedures": SequenceProcessor(max_seq_length=20),
    "labs": NestedFloatsProcessor(
        normalization="z-score",
        fill_missing="mean"
    )
}

# Regression target
output_processor = RegressionLabelProcessor(
    normalization="log",  # log-transform LOS
    clip_outliers=True
)

sample_processor = SampleProcessor(
    input_processors=input_processors,
    output_processor=output_processor
)
```

## Best Practices

### Sequence Processing

1. **Choose appropriate max_seq_length**: Balance between context and computation
   - Short sequences (20-50): Fast, less context
   - Medium sequences (50-100): Good balance
   - Long sequences (100+): More context, slower

2. **Truncation strategy**:
   - "post": Keep most recent events (recommended for clinical prediction)
   - "pre": Keep earliest events

3. **Padding strategy**:
   - "post": Pad at end (standard)
   - "pre": Pad at beginning

### Feature Encoding

1. **Vocabulary size**: Limit to frequent codes
   - `min_freq=5`: Include codes appearing ≥5 times
   - `max_vocab_size=10000`: Cap total vocabulary size

2. **Handle rare codes**: Group into "unknown" category

3. **Missing values**:
   - Imputation (mean, median, forward-fill)
   - Indicator variables
   - Special tokens

### Normalization

1. **Numeric features**: Always normalize
   - Z-score: Standard scaling (mean=0, std=1)
   - Min-max: Range scaling [0, 1]

2. **Compute statistics on training set only**: Prevent data leakage

3. **Apply same normalization to val/test sets**

### Class Imbalance

1. **Use class weighting**: `class_weight="balanced"`

2. **Consider oversampling**: For very rare positive cases

3. **Evaluate with appropriate metrics**: AUROC, AUPRC, F1

### Performance Optimization

1. **Cache processed data**: Save preprocessing results

2. **Parallel processing**: Use `num_workers` for DataLoader

3. **Batch processing**: Process multiple samples at once

4. **Feature selection**: Remove low-information features

### Validation

1. **Check processed shapes**: Ensure correct dimensions

2. **Verify value ranges**: After normalization

3. **Inspect samples**: Manually review processed data

4. **Monitor memory usage**: Especially for large datasets

## Troubleshooting

### Common Issues

**Memory Error:**
- Reduce `max_seq_length`
- Use smaller batches
- Process data in chunks
- Enable caching to disk

**Slow Processing:**
- Enable parallel processing (`num_workers`)
- Cache preprocessed data
- Reduce feature dimensionality
- Use more efficient data types

**Shape Mismatch:**
- Check sequence lengths
- Verify padding configuration
- Ensure consistent processor settings

**NaN Values:**
- Handle missing data explicitly
- Check normalization parameters
- Verify imputation strategy

**Class Imbalance:**
- Use class weighting
- Consider oversampling
- Adjust decision threshold
- Use appropriate evaluation metrics
