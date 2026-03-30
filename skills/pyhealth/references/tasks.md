# PyHealth Clinical Prediction Tasks

## Overview

PyHealth provides 20+ predefined clinical prediction tasks for common healthcare AI applications. Each task function transforms raw patient data into structured input-output pairs for model training.

## Task Function Structure

All task functions inherit from `BaseTask` and provide:

- **input_schema**: Defines input features (diagnoses, medications, labs, etc.)
- **output_schema**: Defines prediction targets (labels, values)
- **pre_filter()**: Optional patient/visit filtering logic

**Usage Pattern:**
```python
from pyhealth.datasets import MIMIC4Dataset
from pyhealth.tasks import mortality_prediction_mimic4_fn

dataset = MIMIC4Dataset(root="/path/to/data")
sample_dataset = dataset.set_task(mortality_prediction_mimic4_fn)
```

## Electronic Health Record (EHR) Tasks

### Mortality Prediction

**Purpose:** Predict patient death risk at next visit or within specified timeframe

**MIMIC-III Mortality** (`mortality_prediction_mimic3_fn`)
- Predicts death at next hospital visit
- Binary classification task
- Input: Historical diagnoses, procedures, medications
- Output: Binary label (deceased/alive)

**MIMIC-IV Mortality** (`mortality_prediction_mimic4_fn`)
- Updated version for MIMIC-IV dataset
- Enhanced feature set
- Improved label quality

**eICU Mortality** (`mortality_prediction_eicu_fn`)
- Multi-center ICU mortality prediction
- Accounts for hospital-level variation

**OMOP Mortality** (`mortality_prediction_omop_fn`)
- Standardized mortality prediction
- Works with OMOP common data model

**In-Hospital Mortality** (`inhospital_mortality_prediction_mimic4_fn`)
- Predicts death during current hospitalization
- Real-time risk assessment
- Earlier prediction window than next-visit mortality

**StageNet Mortality** (`mortality_prediction_mimic4_fn_stagenet`)
- Specialized for StageNet model architecture
- Temporal stage-aware prediction

### Hospital Readmission Prediction

**Purpose:** Identify patients at risk of hospital readmission within specified timeframe (typically 30 days)

**MIMIC-III Readmission** (`readmission_prediction_mimic3_fn`)
- 30-day readmission prediction
- Binary classification
- Input: Diagnosis history, medications, demographics
- Output: Binary label (readmitted/not readmitted)

**MIMIC-IV Readmission** (`readmission_prediction_mimic4_fn`)
- Enhanced readmission features
- Improved temporal modeling

**eICU Readmission** (`readmission_prediction_eicu_fn`)
- ICU-specific readmission risk
- Multi-site data

**OMOP Readmission** (`readmission_prediction_omop_fn`)
- Standardized readmission prediction

### Length of Stay Prediction

**Purpose:** Estimate hospital stay duration for resource planning and patient management

**MIMIC-III Length of Stay** (`length_of_stay_prediction_mimic3_fn`)
- Regression task
- Input: Admission diagnoses, vitals, demographics
- Output: Continuous value (days)

**MIMIC-IV Length of Stay** (`length_of_stay_prediction_mimic4_fn`)
- Enhanced features for LOS prediction
- Better temporal granularity

**eICU Length of Stay** (`length_of_stay_prediction_eicu_fn`)
- ICU stay duration prediction
- Multi-hospital data

**OMOP Length of Stay** (`length_of_stay_prediction_omop_fn`)
- Standardized LOS prediction

### Drug Recommendation

**Purpose:** Suggest appropriate medications based on patient history and current conditions

**MIMIC-III Drug Recommendation** (`drug_recommendation_mimic3_fn`)
- Multi-label classification
- Input: Diagnoses, previous medications, demographics
- Output: Set of recommended drug codes
- Considers drug-drug interactions

**MIMIC-IV Drug Recommendation** (`drug_recommendation_mimic4_fn`)
- Updated medication data
- Enhanced interaction modeling

**eICU Drug Recommendation** (`drug_recommendation_eicu_fn`)
- Critical care medication recommendations

**OMOP Drug Recommendation** (`drug_recommendation_omop_fn`)
- Standardized drug recommendation

**Key Considerations:**
- Handles polypharmacy scenarios
- Multi-label prediction (multiple drugs per patient)
- Can integrate with SafeDrug/GAMENet models for safety-aware recommendations

## Specialized Clinical Tasks

### Medical Coding

**MIMIC-III ICD-9 Coding** (`icd9_coding_mimic3_fn`)
- Assigns ICD-9 diagnosis/procedure codes to clinical notes
- Multi-label text classification
- Input: Clinical text/documentation
- Output: Set of ICD-9 codes
- Supports both diagnosis and procedure coding

### Patient Linkage

**MIMIC-III Patient Linking** (`patient_linkage_mimic3_fn`)
- Record matching and deduplication
- Binary classification (same patient or not)
- Input: Demographic and clinical features from two records
- Output: Match probability

## Physiological Signal Tasks

### Sleep Staging

**Purpose:** Classify sleep stages from EEG/physiological signals for sleep disorder diagnosis

**ISRUC Sleep Staging** (`sleep_staging_isruc_fn`)
- Multi-class classification (Wake, N1, N2, N3, REM)
- Input: Multi-channel EEG signals
- Output: Sleep stage per epoch (typically 30 seconds)

**SleepEDF Sleep Staging** (`sleep_staging_sleepedf_fn`)
- Standard sleep staging task
- PSG signal processing

**SHHS Sleep Staging** (`sleep_staging_shhs_fn`)
- Large-scale sleep study data
- Population-level sleep analysis

**Standardized Labels:**
- Wake (W)
- Non-REM Stage 1 (N1)
- Non-REM Stage 2 (N2)
- Non-REM Stage 3 (N3/Deep Sleep)
- REM (Rapid Eye Movement)

### EEG Analysis

**Abnormality Detection** (`abnormality_detection_tuab_fn`)
- Binary classification (normal/abnormal EEG)
- Clinical screening application
- Input: Multi-channel EEG recordings
- Output: Binary label

**Event Detection** (`event_detection_tuev_fn`)
- Identify specific EEG events (spikes, seizures)
- Multi-class classification
- Input: EEG time series
- Output: Event type and timing

**Seizure Detection** (`seizure_detection_tusz_fn`)
- Specialized epileptic seizure detection
- Critical for epilepsy monitoring
- Input: Continuous EEG
- Output: Seizure/non-seizure classification

## Medical Imaging Tasks

### COVID-19 Chest X-ray Classification

**COVID-19 CXR** (`covid_classification_cxr_fn`)
- Multi-class image classification
- Classes: COVID-19, bacterial pneumonia, viral pneumonia, normal
- Input: Chest X-ray images
- Output: Disease classification

## Text-Based Tasks

### Medical Transcription Classification

**Medical Specialty Classification** (`medical_transcription_classification_fn`)
- Classify clinical notes by medical specialty
- Multi-class text classification
- Input: Clinical transcription text
- Output: Medical specialty (Cardiology, Neurology, etc.)

## Custom Task Creation

### Creating Custom Tasks

Define custom prediction tasks by specifying input/output schemas:

```python
from pyhealth.tasks import BaseTask

def custom_task_fn(patient):
    """Custom prediction task"""

    # Define input features
    samples = []

    for i, visit in enumerate(patient.visits):
        # Skip if not enough history
        if i < 2:
            continue

        # Create input from historical visits
        input_info = {
            "diagnoses": [],
            "medications": [],
            "procedures": []
        }

        # Collect features from previous visits
        for past_visit in patient.visits[:i]:
            for event in past_visit.events:
                if event.vocabulary == "ICD10CM":
                    input_info["diagnoses"].append(event.code)
                elif event.vocabulary == "NDC":
                    input_info["medications"].append(event.code)

        # Define prediction target
        # Example: predict specific outcome at current visit
        output_info = {
            "label": 1 if some_condition else 0
        }

        samples.append({
            "patient_id": patient.patient_id,
            "visit_id": visit.visit_id,
            "input_info": input_info,
            "output_info": output_info
        })

    return samples

# Apply custom task
sample_dataset = dataset.set_task(custom_task_fn)
```

### Task Function Components

1. **Input Schema Definition**
   - Specify which features to extract
   - Define feature types (codes, sequences, values)
   - Set temporal windows

2. **Output Schema Definition**
   - Define prediction targets
   - Set label types (binary, multi-class, multi-label, regression)
   - Specify evaluation metrics

3. **Filtering Logic**
   - Exclude patients/visits with insufficient data
   - Apply inclusion/exclusion criteria
   - Handle missing data

4. **Sample Generation**
   - Create input-output pairs
   - Maintain patient/visit identifiers
   - Preserve temporal ordering

## Task Selection Guidelines

### Clinical Prediction Tasks
**Use when:** Working with structured EHR data (diagnoses, medications, procedures)

**Datasets:** MIMIC-III, MIMIC-IV, eICU, OMOP

**Common tasks:**
- Mortality prediction for risk stratification
- Readmission prediction for care transition planning
- Length of stay for resource allocation
- Drug recommendation for clinical decision support

### Signal Processing Tasks
**Use when:** Working with physiological time-series data

**Datasets:** SleepEDF, SHHS, ISRUC, TUEV, TUAB, TUSZ

**Common tasks:**
- Sleep staging for sleep disorder diagnosis
- EEG abnormality detection for screening
- Seizure detection for epilepsy monitoring

### Imaging Tasks
**Use when:** Working with medical images

**Datasets:** COVID-19 CXR

**Common tasks:**
- Disease classification from radiographs
- Abnormality detection

### Text Tasks
**Use when:** Working with clinical notes and documentation

**Datasets:** Medical Transcriptions, MIMIC-III (with notes)

**Common tasks:**
- Medical coding from clinical text
- Specialty classification
- Clinical information extraction

## Task Output Structure

All task functions return `SampleDataset` with:

```python
sample = {
    "patient_id": "unique_patient_id",
    "visit_id": "unique_visit_id",  # if applicable
    "input_info": {
        # Input features (diagnoses, medications, etc.)
    },
    "output_info": {
        # Prediction targets (labels, values)
    }
}
```

## Integration with Models

Tasks define the input/output contract for models:

```python
from pyhealth.datasets import MIMIC4Dataset
from pyhealth.tasks import mortality_prediction_mimic4_fn
from pyhealth.models import Transformer

# 1. Create task-specific dataset
dataset = MIMIC4Dataset(root="/path/to/data")
sample_dataset = dataset.set_task(mortality_prediction_mimic4_fn)

# 2. Model automatically adapts to task schema
model = Transformer(
    dataset=sample_dataset,
    feature_keys=["diagnoses", "medications"],
    mode="binary",  # matches task output
)
```

## Best Practices

1. **Match task to clinical question**: Choose predefined tasks when available for standardized benchmarking

2. **Consider temporal windows**: Ensure sufficient history for meaningful predictions

3. **Handle class imbalance**: Many clinical outcomes are rare (mortality, readmission)

4. **Validate clinical relevance**: Ensure prediction windows align with clinical decision-making timelines

5. **Use appropriate metrics**: Different tasks require different evaluation metrics (AUROC for binary, macro-F1 for multi-class)

6. **Document exclusion criteria**: Track which patients/visits are filtered and why

7. **Preserve patient privacy**: Always use de-identified data and follow HIPAA/GDPR guidelines
