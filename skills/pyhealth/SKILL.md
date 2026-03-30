---
name: pyhealth
description: Comprehensive healthcare AI toolkit for developing, testing, and deploying machine learning models with clinical data. This skill should be used when working with electronic health records (EHR), clinical prediction tasks (mortality, readmission, drug recommendation), medical coding systems (ICD, NDC, ATC), physiological signals (EEG, ECG), healthcare datasets (MIMIC-III/IV, eICU, OMOP), or implementing deep learning models for healthcare applications (RETAIN, SafeDrug, Transformer, GNN).
license: MIT license
metadata:
    skill-author: K-Dense Inc.
---

# PyHealth: Healthcare AI Toolkit

## Overview

PyHealth is a comprehensive Python library for healthcare AI that provides specialized tools, models, and datasets for clinical machine learning. Use this skill when developing healthcare prediction models, processing clinical data, working with medical coding systems, or deploying AI solutions in healthcare settings.

## When to Use This Skill

Invoke this skill when:

- **Working with healthcare datasets**: MIMIC-III, MIMIC-IV, eICU, OMOP, sleep EEG data, medical images
- **Clinical prediction tasks**: Mortality prediction, hospital readmission, length of stay, drug recommendation
- **Medical coding**: Translating between ICD-9/10, NDC, RxNorm, ATC coding systems
- **Processing clinical data**: Sequential events, physiological signals, clinical text, medical images
- **Implementing healthcare models**: RETAIN, SafeDrug, GAMENet, StageNet, Transformer for EHR
- **Evaluating clinical models**: Fairness metrics, calibration, interpretability, uncertainty quantification

## Core Capabilities

PyHealth operates through a modular 5-stage pipeline optimized for healthcare AI:

1. **Data Loading**: Access 10+ healthcare datasets with standardized interfaces
2. **Task Definition**: Apply 20+ predefined clinical prediction tasks or create custom tasks
3. **Model Selection**: Choose from 33+ models (baselines, deep learning, healthcare-specific)
4. **Training**: Train with automatic checkpointing, monitoring, and evaluation
5. **Deployment**: Calibrate, interpret, and validate for clinical use

**Performance**: 3x faster than pandas for healthcare data processing

## Quick Start Workflow

```python
from pyhealth.datasets import MIMIC4Dataset
from pyhealth.tasks import mortality_prediction_mimic4_fn
from pyhealth.datasets import split_by_patient, get_dataloader
from pyhealth.models import Transformer
from pyhealth.trainer import Trainer

# 1. Load dataset and set task
dataset = MIMIC4Dataset(root="/path/to/data")
sample_dataset = dataset.set_task(mortality_prediction_mimic4_fn)

# 2. Split data
train, val, test = split_by_patient(sample_dataset, [0.7, 0.1, 0.2])

# 3. Create data loaders
train_loader = get_dataloader(train, batch_size=64, shuffle=True)
val_loader = get_dataloader(val, batch_size=64, shuffle=False)
test_loader = get_dataloader(test, batch_size=64, shuffle=False)

# 4. Initialize and train model
model = Transformer(
    dataset=sample_dataset,
    feature_keys=["diagnoses", "medications"],
    mode="binary",
    embedding_dim=128
)

trainer = Trainer(model=model, device="cuda")
trainer.train(
    train_dataloader=train_loader,
    val_dataloader=val_loader,
    epochs=50,
    monitor="pr_auc_score"
)

# 5. Evaluate
results = trainer.evaluate(test_loader)
```

## Detailed Documentation

This skill includes comprehensive reference documentation organized by functionality. Read specific reference files as needed:

### 1. Datasets and Data Structures

**File**: `references/datasets.md`

**Read when:**
- Loading healthcare datasets (MIMIC, eICU, OMOP, sleep EEG, etc.)
- Understanding Event, Patient, Visit data structures
- Processing different data types (EHR, signals, images, text)
- Splitting data for training/validation/testing
- Working with SampleDataset for task-specific formatting

**Key Topics:**
- Core data structures (Event, Patient, Visit)
- 10+ available datasets (EHR, physiological signals, imaging, text)
- Data loading and iteration
- Train/val/test splitting strategies
- Performance optimization for large datasets

### 2. Medical Coding Translation

**File**: `references/medical_coding.md`

**Read when:**
- Translating between medical coding systems
- Working with diagnosis codes (ICD-9-CM, ICD-10-CM, CCS)
- Processing medication codes (NDC, RxNorm, ATC)
- Standardizing procedure codes (ICD-9-PROC, ICD-10-PROC)
- Grouping codes into clinical categories
- Handling hierarchical drug classifications

**Key Topics:**
- InnerMap for within-system lookups
- CrossMap for cross-system translation
- Supported coding systems (ICD, NDC, ATC, CCS, RxNorm)
- Code standardization and hierarchy traversal
- Medication classification by therapeutic class
- Integration with datasets

### 3. Clinical Prediction Tasks

**File**: `references/tasks.md`

**Read when:**
- Defining clinical prediction objectives
- Using predefined tasks (mortality, readmission, drug recommendation)
- Working with EHR, signal, imaging, or text-based tasks
- Creating custom prediction tasks
- Setting up input/output schemas for models
- Applying task-specific filtering logic

**Key Topics:**
- 20+ predefined clinical tasks
- EHR tasks (mortality, readmission, length of stay, drug recommendation)
- Signal tasks (sleep staging, EEG analysis, seizure detection)
- Imaging tasks (COVID-19 chest X-ray classification)
- Text tasks (medical coding, specialty classification)
- Custom task creation patterns

### 4. Models and Architectures

**File**: `references/models.md`

**Read when:**
- Selecting models for clinical prediction
- Understanding model architectures and capabilities
- Choosing between general-purpose and healthcare-specific models
- Implementing interpretable models (RETAIN, AdaCare)
- Working with medication recommendation (SafeDrug, GAMENet)
- Using graph neural networks for healthcare
- Configuring model hyperparameters

**Key Topics:**
- 33+ available models
- General-purpose: Logistic Regression, MLP, CNN, RNN, Transformer, GNN
- Healthcare-specific: RETAIN, SafeDrug, GAMENet, StageNet, AdaCare
- Model selection by task type and data type
- Interpretability considerations
- Computational requirements
- Hyperparameter tuning guidelines

### 5. Data Preprocessing

**File**: `references/preprocessing.md`

**Read when:**
- Preprocessing clinical data for models
- Handling sequential events and time-series data
- Processing physiological signals (EEG, ECG)
- Normalizing lab values and vital signs
- Preparing labels for different task types
- Building feature vocabularies
- Managing missing data and outliers

**Key Topics:**
- 15+ processor types
- Sequence processing (padding, truncation)
- Signal processing (filtering, segmentation)
- Feature extraction and encoding
- Label processors (binary, multi-class, multi-label, regression)
- Text and image preprocessing
- Common preprocessing workflows

### 6. Training and Evaluation

**File**: `references/training_evaluation.md`

**Read when:**
- Training models with the Trainer class
- Evaluating model performance
- Computing clinical metrics
- Assessing model fairness across demographics
- Calibrating predictions for reliability
- Quantifying prediction uncertainty
- Interpreting model predictions
- Preparing models for clinical deployment

**Key Topics:**
- Trainer class (train, evaluate, inference)
- Metrics for binary, multi-class, multi-label, regression tasks
- Fairness metrics for bias assessment
- Calibration methods (Platt scaling, temperature scaling)
- Uncertainty quantification (conformal prediction, MC dropout)
- Interpretability tools (attention visualization, SHAP, ChEFER)
- Complete training pipeline example

## Installation

```bash
uv pip install pyhealth
```

**Requirements:**
- Python ≥ 3.7
- PyTorch ≥ 1.8
- NumPy, pandas, scikit-learn

## Common Use Cases

### Use Case 1: ICU Mortality Prediction

**Objective**: Predict patient mortality in intensive care unit

**Approach:**
1. Load MIMIC-IV dataset → Read `references/datasets.md`
2. Apply mortality prediction task → Read `references/tasks.md`
3. Select interpretable model (RETAIN) → Read `references/models.md`
4. Train and evaluate → Read `references/training_evaluation.md`
5. Interpret predictions for clinical use → Read `references/training_evaluation.md`

### Use Case 2: Safe Medication Recommendation

**Objective**: Recommend medications while avoiding drug-drug interactions

**Approach:**
1. Load EHR dataset (MIMIC-IV or OMOP) → Read `references/datasets.md`
2. Apply drug recommendation task → Read `references/tasks.md`
3. Use SafeDrug model with DDI constraints → Read `references/models.md`
4. Preprocess medication codes → Read `references/medical_coding.md`
5. Evaluate with multi-label metrics → Read `references/training_evaluation.md`

### Use Case 3: Hospital Readmission Prediction

**Objective**: Identify patients at risk of 30-day readmission

**Approach:**
1. Load multi-site EHR data (eICU or OMOP) → Read `references/datasets.md`
2. Apply readmission prediction task → Read `references/tasks.md`
3. Handle class imbalance in preprocessing → Read `references/preprocessing.md`
4. Train Transformer model → Read `references/models.md`
5. Calibrate predictions and assess fairness → Read `references/training_evaluation.md`

### Use Case 4: Sleep Disorder Diagnosis

**Objective**: Classify sleep stages from EEG signals

**Approach:**
1. Load sleep EEG dataset (SleepEDF, SHHS) → Read `references/datasets.md`
2. Apply sleep staging task → Read `references/tasks.md`
3. Preprocess EEG signals (filtering, segmentation) → Read `references/preprocessing.md`
4. Train CNN or RNN model → Read `references/models.md`
5. Evaluate per-stage performance → Read `references/training_evaluation.md`

### Use Case 5: Medical Code Translation

**Objective**: Standardize diagnoses across different coding systems

**Approach:**
1. Read `references/medical_coding.md` for comprehensive guidance
2. Use CrossMap to translate between ICD-9, ICD-10, CCS
3. Group codes into clinically meaningful categories
4. Integrate with dataset processing

### Use Case 6: Clinical Text to ICD Coding

**Objective**: Automatically assign ICD codes from clinical notes

**Approach:**
1. Load MIMIC-III with clinical text → Read `references/datasets.md`
2. Apply ICD coding task → Read `references/tasks.md`
3. Preprocess clinical text → Read `references/preprocessing.md`
4. Use TransformersModel (ClinicalBERT) → Read `references/models.md`
5. Evaluate with multi-label metrics → Read `references/training_evaluation.md`

## Best Practices

### Data Handling

1. **Always split by patient**: Prevent data leakage by ensuring no patient appears in multiple splits
   ```python
   from pyhealth.datasets import split_by_patient
   train, val, test = split_by_patient(dataset, [0.7, 0.1, 0.2])
   ```

2. **Check dataset statistics**: Understand your data before modeling
   ```python
   print(dataset.stats())  # Patients, visits, events, code distributions
   ```

3. **Use appropriate preprocessing**: Match processors to data types (see `references/preprocessing.md`)

### Model Development

1. **Start with baselines**: Establish baseline performance with simple models
   - Logistic Regression for binary/multi-class tasks
   - MLP for initial deep learning baseline

2. **Choose task-appropriate models**:
   - Interpretability needed → RETAIN, AdaCare
   - Drug recommendation → SafeDrug, GAMENet
   - Long sequences → Transformer
   - Graph relationships → GNN

3. **Monitor validation metrics**: Use appropriate metrics for task and handle class imbalance
   - Binary classification: AUROC, AUPRC (especially for rare events)
   - Multi-class: macro-F1 (for imbalanced), weighted-F1
   - Multi-label: Jaccard, example-F1
   - Regression: MAE, RMSE

### Clinical Deployment

1. **Calibrate predictions**: Ensure probabilities are reliable (see `references/training_evaluation.md`)

2. **Assess fairness**: Evaluate across demographic groups to detect bias

3. **Quantify uncertainty**: Provide confidence estimates for predictions

4. **Interpret predictions**: Use attention weights, SHAP, or ChEFER for clinical trust

5. **Validate thoroughly**: Use held-out test sets from different time periods or sites

## Limitations and Considerations

### Data Requirements

- **Large datasets**: Deep learning models require sufficient data (thousands of patients)
- **Data quality**: Missing data and coding errors impact performance
- **Temporal consistency**: Ensure train/test split respects temporal ordering when needed

### Clinical Validation

- **External validation**: Test on data from different hospitals/systems
- **Prospective evaluation**: Validate in real clinical settings before deployment
- **Clinical review**: Have clinicians review predictions and interpretations
- **Ethical considerations**: Address privacy (HIPAA/GDPR), fairness, and safety

### Computational Resources

- **GPU recommended**: For training deep learning models efficiently
- **Memory requirements**: Large datasets may require 16GB+ RAM
- **Storage**: Healthcare datasets can be 10s-100s of GB

## Troubleshooting

### Common Issues

**ImportError for dataset**:
- Ensure dataset files are downloaded and path is correct
- Check PyHealth version compatibility

**Out of memory**:
- Reduce batch size
- Reduce sequence length (`max_seq_length`)
- Use gradient accumulation
- Process data in chunks

**Poor performance**:
- Check class imbalance and use appropriate metrics (AUPRC vs AUROC)
- Verify preprocessing (normalization, missing data handling)
- Increase model capacity or training epochs
- Check for data leakage in train/test split

**Slow training**:
- Use GPU (`device="cuda"`)
- Increase batch size (if memory allows)
- Reduce sequence length
- Use more efficient model (CNN vs Transformer)

### Getting Help

- **Documentation**: https://pyhealth.readthedocs.io/
- **GitHub Issues**: https://github.com/sunlabuiuc/PyHealth/issues
- **Tutorials**: 7 core tutorials + 5 practical pipelines available online

## Example: Complete Workflow

```python
# Complete mortality prediction pipeline
from pyhealth.datasets import MIMIC4Dataset
from pyhealth.tasks import mortality_prediction_mimic4_fn
from pyhealth.datasets import split_by_patient, get_dataloader
from pyhealth.models import RETAIN
from pyhealth.trainer import Trainer

# 1. Load dataset
print("Loading MIMIC-IV dataset...")
dataset = MIMIC4Dataset(root="/data/mimic4")
print(dataset.stats())

# 2. Define task
print("Setting mortality prediction task...")
sample_dataset = dataset.set_task(mortality_prediction_mimic4_fn)
print(f"Generated {len(sample_dataset)} samples")

# 3. Split data (by patient to prevent leakage)
print("Splitting data...")
train_ds, val_ds, test_ds = split_by_patient(
    sample_dataset, ratios=[0.7, 0.1, 0.2], seed=42
)

# 4. Create data loaders
train_loader = get_dataloader(train_ds, batch_size=64, shuffle=True)
val_loader = get_dataloader(val_ds, batch_size=64)
test_loader = get_dataloader(test_ds, batch_size=64)

# 5. Initialize interpretable model
print("Initializing RETAIN model...")
model = RETAIN(
    dataset=sample_dataset,
    feature_keys=["diagnoses", "procedures", "medications"],
    mode="binary",
    embedding_dim=128,
    hidden_dim=128
)

# 6. Train model
print("Training model...")
trainer = Trainer(model=model, device="cuda")
trainer.train(
    train_dataloader=train_loader,
    val_dataloader=val_loader,
    epochs=50,
    optimizer="Adam",
    learning_rate=1e-3,
    weight_decay=1e-5,
    monitor="pr_auc_score",  # Use AUPRC for imbalanced data
    monitor_criterion="max",
    save_path="./checkpoints/mortality_retain"
)

# 7. Evaluate on test set
print("Evaluating on test set...")
test_results = trainer.evaluate(
    test_loader,
    metrics=["accuracy", "precision", "recall", "f1_score",
             "roc_auc_score", "pr_auc_score"]
)

print("\nTest Results:")
for metric, value in test_results.items():
    print(f"  {metric}: {value:.4f}")

# 8. Get predictions with attention for interpretation
predictions = trainer.inference(
    test_loader,
    additional_outputs=["visit_attention", "feature_attention"],
    return_patient_ids=True
)

# 9. Analyze a high-risk patient
high_risk_idx = predictions["y_pred"].argmax()
patient_id = predictions["patient_ids"][high_risk_idx]
visit_attn = predictions["visit_attention"][high_risk_idx]
feature_attn = predictions["feature_attention"][high_risk_idx]

print(f"\nHigh-risk patient: {patient_id}")
print(f"Risk score: {predictions['y_pred'][high_risk_idx]:.3f}")
print(f"Most influential visit: {visit_attn.argmax()}")
print(f"Most important features: {feature_attn[visit_attn.argmax()].argsort()[-5:]}")

# 10. Save model for deployment
trainer.save("./models/mortality_retain_final.pt")
print("\nModel saved successfully!")
```

## Resources

For detailed information on each component, refer to the comprehensive reference files in the `references/` directory:

- **datasets.md**: Data structures, loading, and splitting (4,500 words)
- **medical_coding.md**: Code translation and standardization (3,800 words)
- **tasks.md**: Clinical prediction tasks and custom task creation (4,200 words)
- **models.md**: Model architectures and selection guidelines (5,100 words)
- **preprocessing.md**: Data processors and preprocessing workflows (4,600 words)
- **training_evaluation.md**: Training, metrics, calibration, interpretability (5,900 words)

**Total comprehensive documentation**: ~28,000 words across modular reference files.

