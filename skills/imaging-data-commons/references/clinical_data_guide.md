# Clinical Data Guide for IDC

**Tested with:** idc-index 0.11.7 (IDC data version v23)

Clinical data (demographics, diagnoses, therapies, lab tests, staging) accompanies many IDC imaging collections. This guide covers how to discover, access, and integrate clinical data with imaging data using `idc-index`.

## When to Use This Guide

Use this guide when you need to:
- Find what clinical metadata is available for a collection
- Filter patients by clinical criteria (e.g., cancer stage, treatment history)
- Join clinical attributes with imaging data for cohort selection
- Understand and decode coded values in clinical tables

For basic clinical data access, see the "Clinical Data Access" section in the main SKILL.md. This guide provides detailed workflows and advanced patterns.

## Prerequisites

```bash
pip install --upgrade idc-index
```

No BigQuery credentials required - clinical data is packaged with `idc-index`.

## Understanding Clinical Data in IDC

### What is Clinical Data?

Clinical data refers to non-imaging information that accompanies medical images:
- Patient demographics (age, sex, race)
- Clinical history (diagnoses, surgeries, therapies)
- Lab tests and pathology results
- Cancer staging (clinical and pathological)
- Treatment outcomes

### Data Organization

Clinical data in IDC comes from collection-specific spreadsheets provided by data submitters. IDC parses these into queryable tables accessible via `idc-index`.

**Important characteristics:**
- Clinical data is **not harmonized** across collections (terms and formats vary)
- Not all collections have clinical data (check availability first)
- All data is **anonymized** - `dicom_patient_id` links to imaging

### The clinical_index Table

The `clinical_index` serves as a dictionary/catalog of all available clinical data:

| Column | Purpose | Use For |
|--------|---------|---------|
| `collection_id` | Collection identifier | Filtering by collection |
| `table_name` | Full BigQuery table reference | BigQuery queries (if needed) |
| `short_table_name` | Short name | `get_clinical_table()` method |
| `column` | Column name in table | Selecting data columns |
| `column_label` | Human-readable description | Searching for concepts |
| `values` | Observed attribute values for the column | Interpreting coded values |

### The `values` Column

The `values` column contains an array of observed attribute values for the column defined in the `column` field. Each entry has:
- **option_code**: The actual value observed in that column
- **option_description**: Human-readable description of that value (from data dictionary if available, otherwise `None`)

For ACRIN collections, value descriptions come from provided data dictionaries. For other collections, they are derived from inspection of the actual data values.

**Note:** For columns with >20 unique values, the `values` array is left empty (`[]`) for simplicity.

## Core Workflow

### Step 1: Fetch Clinical Index

```python
from idc_index import IDCClient

client = IDCClient()
client.fetch_index('clinical_index')

# View available columns
print(client.clinical_index.columns.tolist())
```

### Step 2: Discover Available Clinical Data

```python
# List all collections with clinical data
collections_with_clinical = client.clinical_index["collection_id"].unique().tolist()
print(f"{len(collections_with_clinical)} collections have clinical data")

# Find clinical attributes for a specific collection
nlst_columns = client.clinical_index[client.clinical_index['collection_id']=='nlst']
nlst_columns[['short_table_name', 'column', 'column_label', 'values']]
```

### Step 3: Search for Specific Attributes

```python
# Search by keyword in column_label (case-insensitive)
stage_attrs = client.clinical_index[
    client.clinical_index["column_label"].str.contains("[Ss]tage", na=False)
]
stage_attrs[["collection_id", "short_table_name", "column", "column_label"]]
```

### Step 4: Load Clinical Table

```python
# Load table using short_table_name
nlst_canc_df = client.get_clinical_table("nlst_canc")

# Examine structure
print(f"Rows: {len(nlst_canc_df)}, Columns: {len(nlst_canc_df.columns)}")
nlst_canc_df.head()
```

### Step 5: Map Coded Values to Descriptions

Many clinical attributes use coded values. The `values` column in `clinical_index` contains an array of observed values with their descriptions (when available).

```python
# Get the clinical_index rows for NLST
nlst_clinical_columns = client.clinical_index[client.clinical_index['collection_id']=='nlst']

# Get observed values for a specific column
# Filter to the row for 'clinical_stag' and extract the values array
clinical_stag_values = nlst_clinical_columns[
    nlst_clinical_columns['column']=='clinical_stag'
]['values'].values[0]

# View the observed values and their descriptions
print(clinical_stag_values)
# Output: array([{'option_code': '.M', 'option_description': 'Missing'},
#                {'option_code': '110', 'option_description': 'Stage IA'},
#                {'option_code': '120', 'option_description': 'Stage IB'}, ...])

# Create mapping dictionary from codes to descriptions
mapping_dict = {item['option_code']: item['option_description'] for item in clinical_stag_values}

# Apply to DataFrame - convert column to string first for consistent matching
nlst_canc_df['clinical_stag_meaning'] = nlst_canc_df['clinical_stag'].astype(str).map(mapping_dict)
```

### Step 6: Join with Imaging Data

The `dicom_patient_id` column links clinical data to imaging. It matches the `PatientID` column in the imaging index.

```python
# Pandas merge approach
import pandas as pd

# Get NLST CT imaging data
nlst_imaging = client.index[(client.index['collection_id']=='nlst') & (client.index['Modality']=='CT')]

# Join with clinical data
merged = pd.merge(
    nlst_imaging[['PatientID', 'StudyInstanceUID']].drop_duplicates(),
    nlst_canc_df[['dicom_patient_id', 'clinical_stag', 'clinical_stag_meaning']],
    left_on='PatientID',
    right_on='dicom_patient_id',
    how='inner'
)
```

```python
# SQL join approach
query = """
SELECT
  index.PatientID,
  index.StudyInstanceUID,
  index.Modality,
  nlst_canc.clinical_stag
FROM index
JOIN nlst_canc ON index.PatientID = nlst_canc.dicom_patient_id
WHERE index.collection_id = 'nlst' AND index.Modality = 'CT'
"""
results = client.sql_query(query)
```

## Common Use Cases

### Use Case 1: Select Patients by Cancer Stage

```python
from idc_index import IDCClient
import pandas as pd

client = IDCClient()
client.fetch_index('clinical_index')

# Load clinical table
nlst_canc = client.get_clinical_table("nlst_canc")

# Select Stage IV patients (code '400')
stage_iv_patients = nlst_canc[nlst_canc['clinical_stag'] == '400']['dicom_patient_id']

# Get CT imaging studies for these patients
stage_iv_studies = pd.merge(
    client.index[(client.index['collection_id']=='nlst') & (client.index['Modality']=='CT')],
    stage_iv_patients,
    left_on='PatientID',
    right_on='dicom_patient_id',
    how='inner'
)['StudyInstanceUID'].drop_duplicates()

print(f"Found {len(stage_iv_studies)} CT studies for Stage IV patients")
```

### Use Case 2: Find Collections with Specific Clinical Attributes

```python
# Find collections with chemotherapy information
chemo_collections = client.clinical_index[
    client.clinical_index["column_label"].str.contains("[Cc]hemotherapy", na=False)
]["collection_id"].unique()

print(f"Collections with chemotherapy data: {list(chemo_collections)}")
```

### Use Case 3: Examine Observed Values for a Clinical Attribute

```python
# Find what values have been observed for a specific attribute
chemotherapy_rows = client.clinical_index[
    (client.clinical_index["collection_id"] == "hcc_tace_seg") &
    (client.clinical_index["column"] == "chemotherapy")
]

# Get the observed values array
values_list = chemotherapy_rows["values"].tolist()
print(values_list)
# Output: [[{'option_code': 'Cisplastin', 'option_description': None},
#           {'option_code': 'Cisplatin, Mitomycin-C', 'option_description': None}, ...]]
```

### Use Case 4: Generate Viewer URLs for Selected Patients

```python
import random

# Get studies for a sample Stage IV patient
sample_patient = stage_iv_patients.iloc[0]
studies = client.index[client.index['PatientID'] == sample_patient]['StudyInstanceUID'].unique()

# Generate viewer URL
if len(studies) > 0:
    viewer_url = client.get_viewer_URL(studyInstanceUID=studies[0])
    print(viewer_url)
```

## Key Concepts

### column vs column_label

- **column**: Use for selecting data from tables (programmatic access)
- **column_label**: Use for searching/understanding what data means (human-readable)

Some collections (like `c4kc_kits`) have identical column and column_label. Others (like ACRIN collections) have cryptic column names but descriptive labels.

### option_code vs option_description

The `values` array contains observed attribute values:
- **option_code**: The actual value observed in the column (what you filter on)
- **option_description**: Human-readable description (from data dictionary if available, otherwise `None`)

### dicom_patient_id

Every clinical table includes `dicom_patient_id`, which matches the `PatientID` column in the imaging index. This is the key for joining clinical and imaging data.

## Troubleshooting

### Issue: Clinical table not found

**Cause:** Using wrong table name or table doesn't exist for collection

**Solution:** Query clinical_index first to find available tables:
```python
client.clinical_index[client.clinical_index['collection_id']=='your_collection']['short_table_name'].unique()
```

### Issue: Empty values array

**Cause:** The `values` array is left empty when a column has >20 unique values

**Solution:** Load the clinical table and examine unique values directly:
```python
clinical_df = client.get_clinical_table("table_name")
clinical_df['column_name'].unique()
```

### Issue: Coded values not in mapping

**Cause:** Some values may be missing from the dictionary (e.g., empty strings, special codes like `.M` for missing)

**Solution:** Handle unmapped values gracefully:
```python
df['meaning'] = df['code'].astype(str).map(mapping_dict).fillna('Unknown/Missing')
```

### Issue: No matching patients when joining

**Cause:** Clinical data may include patients without images, or vice versa

**Solution:** Verify patient overlap before joining:
```python
imaging_patients = set(client.index[client.index['collection_id']=='nlst']['PatientID'].unique())
clinical_patients = set(clinical_df['dicom_patient_id'].unique())
overlap = imaging_patients & clinical_patients
print(f"Patients with both imaging and clinical data: {len(overlap)}")
```

## Resources

**IDC Documentation:**
- [Clinical data organization](https://learn.canceridc.dev/data/organization-of-data/clinical) - How clinical data is organized in IDC
- [Clinical data dashboard](https://datastudio.google.com/u/0/reporting/04cf5976-4ea0-4fee-a749-8bfd162f2e87/page/p_s7mk6eybqc) - Visual summary of available clinical data
- [idc-index clinical_index documentation](https://idc-index.readthedocs.io/en/latest/column_descriptions.html#clinical-index)

**Related Guides:**
- `bigquery_guide.md` - Advanced clinical queries via BigQuery
- Main SKILL.md - Core IDC workflows

**IDC Tutorials:**
- [clinical_data_intro.ipynb](https://github.com/ImagingDataCommons/IDC-Tutorials/blob/master/notebooks/advanced_topics/clinical_data_intro.ipynb)
- [exploring_clinical_data.ipynb](https://github.com/ImagingDataCommons/IDC-Tutorials/blob/master/notebooks/getting_started/exploring_clinical_data.ipynb)
- [nlst_clinical_data.ipynb](https://github.com/ImagingDataCommons/IDC-Tutorials/blob/master/notebooks/collections_demos/nlst_clinical_data.ipynb)
