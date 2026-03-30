# BigQuery Guide for IDC

**Tested with:** IDC data version v23

For most queries and downloads, use `idc-index` (see main SKILL.md). This guide covers BigQuery for advanced use cases requiring full DICOM metadata or complex joins.

## Prerequisites

**Requirements:**
1. Google account
2. Google Cloud project with billing enabled (first 1 TB/month free)
3. `google-cloud-bigquery` Python package or BigQuery console access

**Authentication setup:**
```bash
# Install Google Cloud SDK, then:
gcloud auth application-default login
```

## When to Use BigQuery

Use BigQuery instead of `idc-index` when you need:
- Full DICOM metadata (all 4000+ tags, not just the ~50 in idc-index)
- Complex joins across clinical data tables
- DICOM sequence attributes (nested structures)
- Queries on fields not in the idc-index mini-index
- Private DICOM elements (vendor-specific tags in OtherElements column)

## Accessing IDC in BigQuery

### Dataset Structure

All IDC tables are in the `bigquery-public-data` BigQuery project.

**Current version (recommended for exploration):**
- `bigquery-public-data.idc_current.*`
- `bigquery-public-data.idc_current_clinical.*`

**Versioned datasets (recommended for reproducibility):**

- `bigquery-public-data.idc_v{IDC version}.*`
- `bigquery-public-data.idc_v{IDC version}_clinical.*`

Always use versioned datasets for reproducible research!

## Key Tables

### dicom_all
Primary table joining complete DICOM metadata with IDC-specific columns (collection_id, gcs_url, license). Contains all DICOM tags from `dicom_metadata` plus collection and administrative metadata. See [dicom_all.sql](https://github.com/ImagingDataCommons/etl_flow/blob/master/bq/generate_tables_and_views/derived_tables/BQ_Table_Building/derived_data_views/sql/dicom_all.sql) for the exact derivation.

```sql
SELECT 
  collection_id,
  PatientID,
  StudyInstanceUID, 
  SeriesInstanceUID,
  Modality,
  BodyPartExamined,
  SeriesDescription,
  gcs_url,
  license_short_name
FROM `bigquery-public-data.idc_current.dicom_all`
WHERE Modality = 'CT'
  AND BodyPartExamined = 'CHEST'
LIMIT 10
```

### Derived Tables

**segmentations** - DICOM Segmentation objects
```sql
SELECT *
FROM `bigquery-public-data.idc_current.segmentations`
LIMIT 10
```

**measurement_groups** - SR TID1500 measurement groups
**qualitative_measurements** - Coded evaluations
**quantitative_measurements** - Numeric measurements

### Collection Metadata

**original_collections_metadata** - Collection-level descriptions

```sql
SELECT
  collection_id,
  CancerTypes,
  TumorLocations,
  Subjects,
  src.source_doi,
  src.ImageTypes,
  src.license.license_short_name
FROM `bigquery-public-data.idc_current.original_collections_metadata`,
UNNEST(Sources) AS src
WHERE CancerTypes LIKE '%Lung%'
```

## Common Query Patterns

### Find Collections by Criteria

```sql
SELECT 
  collection_id,
  COUNT(DISTINCT PatientID) as patient_count,
  COUNT(DISTINCT SeriesInstanceUID) as series_count,
  ARRAY_AGG(DISTINCT Modality) as modalities
FROM `bigquery-public-data.idc_current.dicom_all`
WHERE BodyPartExamined LIKE '%BRAIN%'
GROUP BY collection_id
HAVING patient_count > 50
ORDER BY patient_count DESC
```

### Get Download URLs

```sql
SELECT
  SeriesInstanceUID,
  gcs_url
FROM `bigquery-public-data.idc_current.dicom_all`
WHERE collection_id = 'rider_pilot'
  AND Modality = 'CT'
```

### Find Studies with Multiple Modalities

```sql
SELECT
  StudyInstanceUID,
  ARRAY_AGG(DISTINCT Modality) as modalities,
  COUNT(DISTINCT SeriesInstanceUID) as series_count
FROM `bigquery-public-data.idc_current.dicom_all`
GROUP BY StudyInstanceUID
HAVING ARRAY_LENGTH(ARRAY_AGG(DISTINCT Modality)) > 1
LIMIT 100
```

### License Filtering

```sql
SELECT
  collection_id,
  license_short_name,
  COUNT(*) as instance_count
FROM `bigquery-public-data.idc_current.dicom_all`
WHERE license_short_name = 'CC BY 4.0'
GROUP BY collection_id, license_short_name
```

### Find Segmentations with Source Images

```sql
SELECT
  src.collection_id,
  seg.SeriesInstanceUID as seg_series,
  seg.SegmentedPropertyType,
  src.SeriesInstanceUID as source_series,
  src.Modality as source_modality
FROM `bigquery-public-data.idc_current.segmentations` seg
JOIN `bigquery-public-data.idc_current.dicom_all` src
  ON seg.segmented_SeriesInstanceUID = src.SeriesInstanceUID
WHERE src.collection_id = 'qin_prostate_repeatability'
LIMIT 10
```

## Private DICOM Elements

Private DICOM elements are vendor-specific attributes not defined in the DICOM standard. They often contain essential acquisition parameters (like diffusion b-values, gradient directions, or scanner-specific settings) that are critical for image interpretation and analysis.

### Understanding Private Elements

**How private elements work:**
- Private elements use odd-numbered group numbers (e.g., 0019, 0043, 2001)
- Each vendor reserves blocks of 256 elements using Private Creator identifiers at positions (gggg,0010-00FF)
- For example, GE uses Private Creator "GEMS_PARM_01" at (0043,0010) to reserve elements (0043,1000-10FF)

**Standard vs. private tags:** Some parameters exist in both forms:
| Parameter | Standard Tag | GE | Siemens | Philips |
|-----------|--------------|-----|---------|---------|
| Diffusion b-value | (0018,9087) | (0043,1039) | (0019,100C) | (2001,1003) |
| Private Creator | - | GEMS_PARM_01 | SIEMENS CSA HEADER | Philips Imaging |

Older scanners typically populate only private tags; newer scanners may use standard tags. Always check both.

**Challenges with private elements:**
- Require manufacturer DICOM Conformance Statements to interpret
- Tag meanings can change between software versions
- May be removed during de-identification for HIPAA compliance
- Value encoding varies (string vs. numeric, different units)

### Accessing Private Elements in BigQuery

Private elements are stored in the `OtherElements` column of `dicom_all` as an array of structs with `Tag` and `Data` fields.

**Tag notation:** DICOM notation (0043,1039) becomes BigQuery format `Tag_00431039`.

### Private Element Query Patterns

#### Discover Available Private Tags

List all non-empty private tags for a collection:

```sql
SELECT
  other_elements.Tag,
  COUNT(*) AS instance_count,
  ARRAY_AGG(DISTINCT other_elements.Data[SAFE_OFFSET(0)] IGNORE NULLS LIMIT 5) AS sample_values
FROM `bigquery-public-data.idc_current.dicom_all`,
  UNNEST(OtherElements) AS other_elements
WHERE collection_id = 'qin_prostate_repeatability'
  AND Modality = 'MR'
  AND ARRAY_LENGTH(other_elements.Data) > 0
  AND other_elements.Data[SAFE_OFFSET(0)] IS NOT NULL
  AND other_elements.Data[SAFE_OFFSET(0)] != ''
GROUP BY other_elements.Tag
ORDER BY instance_count DESC
```

For a specific series:

```sql
SELECT
  other_elements.Tag,
  ARRAY_AGG(DISTINCT other_elements.Data[SAFE_OFFSET(0)] IGNORE NULLS) AS values
FROM `bigquery-public-data.idc_current.dicom_all`,
  UNNEST(OtherElements) AS other_elements
WHERE SeriesInstanceUID = '1.3.6.1.4.1.14519.5.2.1.7311.5101.206828891270520544417996275680'
  AND ARRAY_LENGTH(other_elements.Data) > 0
  AND other_elements.Data[SAFE_OFFSET(0)] IS NOT NULL
  AND other_elements.Data[SAFE_OFFSET(0)] != ''
GROUP BY other_elements.Tag
```

To identify the Private Creator for a tag, look for the reservation element in the same group. For example, if you find `Tag_00431039`, the Private Creator is at `Tag_00430010` (the tag that reserves block 10xx in group 0043).

#### Identify Equipment Manufacturer

Determine what equipment produced the data to find the correct DICOM Conformance Statement:

```sql
SELECT DISTINCT Manufacturer, ManufacturerModelName
FROM `bigquery-public-data.idc_current.dicom_all`
WHERE collection_id = 'qin_prostate_repeatability'
  AND Modality = 'MR'
```

#### Access Private Element Values

Use `UNNEST` to access individual private elements:

```sql
SELECT
  SeriesInstanceUID,
  SeriesDescription,
  other_elements.Data[SAFE_OFFSET(0)] AS b_value
FROM `bigquery-public-data.idc_current.dicom_all`,
  UNNEST(OtherElements) AS other_elements
WHERE collection_id = 'qin_prostate_repeatability'
  AND other_elements.Tag = 'Tag_00431039'
LIMIT 10
```

#### Aggregate Values by Series

Collect all unique values across slices in a series:

```sql
SELECT
  SeriesInstanceUID,
  ANY_VALUE(SeriesDescription) AS SeriesDescription,
  ARRAY_AGG(DISTINCT other_elements.Data[SAFE_OFFSET(0)]) AS b_values
FROM `bigquery-public-data.idc_current.dicom_all`,
  UNNEST(OtherElements) AS other_elements
WHERE collection_id = 'qin_prostate_repeatability'
  AND other_elements.Tag = 'Tag_00431039'
GROUP BY SeriesInstanceUID
```

#### Combine Standard and Private Filters

Filter using both standard DICOM attributes and private element values:

```sql
SELECT
  PatientID,
  SeriesInstanceUID,
  ANY_VALUE(SeriesDescription) AS SeriesDescription,
  ARRAY_AGG(DISTINCT other_elements.Data[SAFE_OFFSET(0)]) AS b_values,
  COUNT(DISTINCT SOPInstanceUID) AS n_slices
FROM `bigquery-public-data.idc_current.dicom_all`,
  UNNEST(OtherElements) AS other_elements
WHERE collection_id = 'qin_prostate_repeatability'
  AND Modality = 'MR'
  AND other_elements.Tag = 'Tag_00431039'
  AND ImageType[SAFE_OFFSET(0)] = 'ORIGINAL'
  AND other_elements.Data[SAFE_OFFSET(0)] = '1400'
GROUP BY PatientID, SeriesInstanceUID
ORDER BY PatientID
```

#### Cross-Collection Analysis

Survey usage of a private tag across all IDC collections:

```sql
SELECT
  collection_id,
  ARRAY_TO_STRING(ARRAY_AGG(DISTINCT other_elements.Data[SAFE_OFFSET(0)] IGNORE NULLS), ', ') AS values_found,
  ARRAY_AGG(DISTINCT Manufacturer IGNORE NULLS) AS manufacturers
FROM `bigquery-public-data.idc_current.dicom_all`,
  UNNEST(OtherElements) AS other_elements
WHERE other_elements.Tag = 'Tag_00431039'
  AND other_elements.Data[SAFE_OFFSET(0)] IS NOT NULL
  AND other_elements.Data[SAFE_OFFSET(0)] != ''
GROUP BY collection_id
ORDER BY collection_id
```

### Workflow: Finding and Using Private Tags

1. **Discover available private tags** in your collection using the discovery query above
2. **Identify the manufacturer** to know which conformance statement to consult
3. **Find the DICOM Conformance Statement** from the manufacturer's website (see Resources below)
4. **Search the conformance statement** for the parameter you need (e.g., "b_value", "gradient") to understand what each tag contains
5. **Convert tag to BigQuery format:** (gggg,eeee) → `Tag_ggggeeee`
6. **Query and verify** results visually in the IDC Viewer

### Data Quality Notes

- Some collections show unrealistic values (e.g., b-value "1000000600") indicating encoding issues or different conventions
- IDC data is de-identified; private tags containing PHI may have been removed or modified
- The same tag may have different meanings across software versions
- Always verify query results visually using the [IDC Viewer](https://viewer.imaging.datacommons.cancer.gov/) before large-scale analysis

### Private Element Resources

**Manufacturer DICOM Conformance Statements:**
- [GE Healthcare MR](https://www.gehealthcare.com/products/interoperability/dicom/magnetic-resonance-imaging-dicom-conformance-statements)
- [Siemens MR](https://www.siemens-healthineers.com/services/it-standards/dicom-conformance-statements-magnetic-resonance)
- [Siemens CT](https://www.siemens-healthineers.com/services/it-standards/dicom-conformance-statements-computed-tomography)

**DICOM Standard:**
- [Part 5 Section 7.8 - Private Data Elements](https://dicom.nema.org/medical/dicom/current/output/chtml/part05/sect_7.8.html)
- [Part 15 Appendix E - De-identification Profiles](https://dicom.nema.org/medical/dicom/current/output/chtml/part15/chapter_e.html)

**Community Resources:**
- [NAMIC Wiki: DWI/DTI DICOM](https://www.na-mic.org/wiki/NAMIC_Wiki:DTI:DICOM_for_DWI_and_DTI) - comprehensive vendor comparison for diffusion imaging
- [StandardizeBValue](https://github.com/nslay/StandardizeBValue) - tool to extract vendor b-values to standard tags

## Using Query Results with idc-index

Combine BigQuery for complex queries with idc-index for downloads (no GCP auth needed for downloads):

```python
from google.cloud import bigquery
from idc_index import IDCClient

# Initialize BigQuery client
# Requires: pip install google-cloud-bigquery
# Auth: gcloud auth application-default login
# Project: needed for billing even on public datasets (free tier applies)
bq_client = bigquery.Client(project="your-gcp-project-id")

# Query for series with specific criteria
query = """
SELECT DISTINCT SeriesInstanceUID
FROM `bigquery-public-data.idc_current.dicom_all`
WHERE collection_id = 'tcga_luad'
  AND Modality = 'CT'
  AND Manufacturer = 'GE MEDICAL SYSTEMS'
LIMIT 100
"""

df = bq_client.query(query).to_dataframe()
print(f"Found {len(df)} GE CT series")

# Download with idc-index (no GCP auth required)
idc_client = IDCClient()
idc_client.download_from_selection(
    seriesInstanceUID=list(df['SeriesInstanceUID'].values),
    downloadDir="./tcga_luad_thin_ct"
)
```

## Cost and Optimization

**Pricing:** $5 per TB scanned (first 1 TB/month free). Most users stay within free tier.

**Minimize data scanned:**
- Select only needed columns (not `SELECT *`)
- Filter early with `WHERE` clauses
- Use `LIMIT` when testing
- Use `dicom_all` instead of `dicom_metadata` when possible (smaller)
- Preview queries in BQ console (free, shows bytes to scan)

**Check cost before running:**
```python
query_job = client.query(query, job_config=bigquery.QueryJobConfig(dry_run=True))
print(f"Query will scan {query_job.total_bytes_processed / 1e9:.2f} GB")
```

**Use materialized tables:** IDC provides both views (`table_name_view`) and materialized tables (`table_name`). Always use the materialized tables (faster, lower cost).

## Clinical Data

Clinical data is in separate datasets with collection-specific tables. All clinical data available via `idc-index` is also available in BigQuery, with the same content and structure. Use BigQuery when you need complex cross-collection queries or joins that aren't possible with the local `idc-index` tables.

**Datasets:**
- `bigquery-public-data.idc_current_clinical` - current release (for exploration)
- `bigquery-public-data.idc_v{version}_clinical` - versioned datasets (for reproducibility)

Currently there are ~130 clinical tables representing ~70 collections. Not all collections have clinical data (started in IDC v11).

### Clinical Table Naming

Most collections use a single table: `<collection_id>_clinical`

**Exception:** ACRIN collections use multiple tables for different data types (e.g., `acrin_6698_A0`, `acrin_6698_A1`, etc.).

### Metadata Tables

Two metadata tables help navigate clinical data:

**table_metadata** - Collection-level information:
```sql
SELECT
  collection_id,
  table_name,
  table_description
FROM `bigquery-public-data.idc_current_clinical.table_metadata`
WHERE collection_id = 'nlst'
```

**column_metadata** - Attribute-level details with value mappings:
```sql
SELECT
  collection_id,
  table_name,
  column,
  column_label,
  data_type,
  values
FROM `bigquery-public-data.idc_current_clinical.column_metadata`
WHERE collection_id = 'nlst'
  AND column_label LIKE '%stage%'
```

The `values` field contains observed attribute values with their descriptions (same as in `idc-index` clinical_index).

### Common Clinical Queries

**List available clinical tables:**
```sql
SELECT table_name
FROM `bigquery-public-data.idc_current_clinical.INFORMATION_SCHEMA.TABLES`
WHERE table_name NOT IN ('table_metadata', 'column_metadata')
```

**Find collections with specific clinical attributes:**
```sql
SELECT DISTINCT collection_id, table_name, column, column_label
FROM `bigquery-public-data.idc_current_clinical.column_metadata`
WHERE LOWER(column_label) LIKE '%chemotherapy%'
```

**Query clinical data for a collection:**
```sql
-- Example: NLST cancer staging data
SELECT
  dicom_patient_id,
  clinical_stag,
  path_stag,
  de_stag
FROM `bigquery-public-data.idc_current_clinical.nlst_canc`
WHERE clinical_stag IS NOT NULL
LIMIT 10
```

**Join clinical with imaging data:**
```sql
SELECT
  d.PatientID,
  d.StudyInstanceUID,
  d.Modality,
  c.clinical_stag,
  c.path_stag
FROM `bigquery-public-data.idc_current.dicom_all` d
JOIN `bigquery-public-data.idc_current_clinical.nlst_canc` c
  ON d.PatientID = c.dicom_patient_id
WHERE d.collection_id = 'nlst'
  AND d.Modality = 'CT'
  AND c.clinical_stag = '400'  -- Stage IV
LIMIT 20
```

**Cross-collection clinical search:**
```sql
-- Find all collections with staging information
SELECT
  cm.collection_id,
  cm.table_name,
  cm.column,
  cm.column_label
FROM `bigquery-public-data.idc_current_clinical.column_metadata` cm
WHERE LOWER(cm.column_label) LIKE '%stage%'
ORDER BY cm.collection_id
```

### Key Column: dicom_patient_id

Every clinical table includes `dicom_patient_id`, which matches the DICOM `PatientID` attribute in imaging tables. This is the join key between clinical and imaging data.

**Note:** Clinical table schemas vary significantly by collection. Always check available columns first:
```sql
SELECT column_name, data_type
FROM `bigquery-public-data.idc_current_clinical.INFORMATION_SCHEMA.COLUMNS`
WHERE table_name = 'nlst_canc'
```

See `references/clinical_data_guide.md` for detailed workflows using `idc-index`, which provides the same clinical data without requiring BigQuery authentication.

## Important Notes

- Tables are read-only (public dataset)
- Schema changes between IDC versions
- Use versioned datasets for reproducibility
- Some DICOM sequences >15 levels deep are not extracted
- Very large sequences (>1MB) may be truncated
- Always check data license before use

## Common Errors

**Issue: Billing must be enabled**
- Cause: BigQuery requires a billing-enabled GCP project
- Solution: Enable billing in Google Cloud Console or use idc-index mini-index instead

**Issue: Query exceeds resource limits**
- Cause: Query scans too much data or is too complex
- Solution: Add more specific WHERE filters, use LIMIT, break into smaller queries

**Issue: Column not found**
- Cause: Field name typo or not in selected table
- Solution: Check table schema first with `INFORMATION_SCHEMA.COLUMNS`

**Issue: Permission denied**
- Cause: Not authenticated to Google Cloud
- Solution: Run `gcloud auth application-default login` or set GOOGLE_APPLICATION_CREDENTIALS

## Resources

- [Understanding the BigQuery DICOM schema](https://docs.cloud.google.com/healthcare-api/docs/how-tos/dicom-bigquery-schema)
- [BigQuery Query Syntax](https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax)
- [Kaggle Intro to SQL](https://www.kaggle.com/learn/intro-to-sql)
- [Sample BigQuery queries of IDC data](https://github.com/ImagingDataCommons/idc-bigquery-cookbook)
