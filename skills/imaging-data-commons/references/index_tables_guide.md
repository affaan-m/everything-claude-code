# Index Tables Guide for IDC

**Tested with:** idc-index 0.11.9 (IDC data version v23)

This guide covers the structure and access patterns for IDC index tables: programmatic schema discovery, DataFrame access, and join column references. For the overview of available tables and their purposes, see the "Index Tables" section in the main SKILL.md.

**Complete index table documentation:** https://idc-index.readthedocs.io/en/latest/indices_reference.html

## When to Use This Guide

Load this guide when you need to:
- Discover table schemas and column types programmatically
- Access index tables as pandas DataFrames (not via SQL)
- Understand key columns and join relationships between tables

For SQL query examples (filter discovery, finding annotations, size estimation), see `references/sql_patterns.md`.

## Prerequisites

```bash
pip install --upgrade idc-index
```

## Accessing Index Tables

### Via SQL (recommended for filtering/aggregation)

```python
from idc_index import IDCClient
client = IDCClient()

# Query the primary index (always available)
results = client.sql_query("SELECT * FROM index WHERE Modality = 'CT' LIMIT 10")

# Fetch and query additional indices
client.fetch_index("collections_index")
collections = client.sql_query("SELECT collection_id, CancerTypes, TumorLocations FROM collections_index")

client.fetch_index("analysis_results_index")
analysis = client.sql_query("SELECT * FROM analysis_results_index LIMIT 5")
```

### As pandas DataFrames (direct access)

```python
# Primary index (always available after client initialization)
df = client.index

# Fetch and access on-demand indices
client.fetch_index("sm_index")
sm_df = client.sm_index
```

## Discovering Table Schemas

The `indices_overview` dictionary contains complete schema information for all tables. **Always consult this when writing queries or exploring data structure.**

**DICOM attribute mapping:** Many columns are populated directly from DICOM attributes in the source files. The column description in the schema indicates when a column corresponds to a DICOM attribute (e.g., "DICOM Modality attribute" or references a DICOM tag). This allows leveraging DICOM knowledge when querying — standard DICOM attribute names like `PatientID`, `StudyInstanceUID`, `Modality`, `BodyPartExamined` work as expected.

```python
from idc_index import IDCClient
client = IDCClient()

# List all available indices with descriptions
for name, info in client.indices_overview.items():
    print(f"\n{name}:")
    print(f"  Installed: {info['installed']}")
    print(f"  Description: {info['description']}")

# Get complete schema for a specific index (columns, types, descriptions)
schema = client.indices_overview["index"]["schema"]
print(f"\nTable: {schema['table_description']}")
print("\nColumns:")
for col in schema['columns']:
    desc = col.get('description', 'No description')
    # Description indicates if column is from DICOM attribute
    print(f"  {col['name']} ({col['type']}): {desc}")

# Find columns that are DICOM attributes (check description for "DICOM" reference)
dicom_cols = [c['name'] for c in schema['columns'] if 'DICOM' in c.get('description', '').upper()]
print(f"\nDICOM-sourced columns: {dicom_cols}")
```

**Alternative: use `get_index_schema()` method:**
```python
schema = client.get_index_schema("index")
# Returns same schema dict: {'table_description': ..., 'columns': [...]}
```

## Key Columns Reference

Most common columns in the primary `index` table (use `indices_overview` for complete list and descriptions):

| Column | Type | DICOM | Description |
|--------|------|-------|-------------|
| `collection_id` | STRING | No | IDC collection identifier |
| `analysis_result_id` | STRING | No | If applicable, indicates what analysis results collection given series is part of |
| `source_DOI` | STRING | No | DOI linking to dataset details; use for learning more about the content and for attribution (see citations below) |
| `PatientID` | STRING | Yes | Patient identifier |
| `StudyInstanceUID` | STRING | Yes | DICOM Study UID |
| `SeriesInstanceUID` | STRING | Yes | DICOM Series UID — use for downloads/viewing |
| `Modality` | STRING | Yes | Imaging modality (CT, MR, PT, SM, SEG, ANN, RTSTRUCT, etc.) |
| `BodyPartExamined` | STRING | Yes | Anatomical region |
| `SeriesDescription` | STRING | Yes | Description of the series |
| `Manufacturer` | STRING | Yes | Equipment manufacturer |
| `StudyDate` | STRING | Yes | Date study was performed |
| `PatientSex` | STRING | Yes | Patient sex |
| `PatientAge` | STRING | Yes | Patient age at time of study |
| `license_short_name` | STRING | No | License type (CC BY 4.0, CC BY-NC 4.0, etc.) |
| `series_size_MB` | FLOAT | No | Size of series in megabytes |
| `instanceCount` | INTEGER | No | Number of DICOM instances in series |

**DICOM = Yes**: Column value extracted from the DICOM attribute with the same name. Refer to the [DICOM standard](https://dicom.nema.org/medical/dicom/current/output/chtml/part06/chapter_6.html) for numeric tag mappings. Use standard DICOM knowledge for expected values and formats.

## Join Column Reference

Use this table to identify join columns between index tables. Always call `client.fetch_index("table_name")` before using a table in SQL.

| Table A | Table B | Join Condition |
|---------|---------|----------------|
| `index` | `collections_index` | `index.collection_id = collections_index.collection_id` |
| `index` | `sm_index` | `index.SeriesInstanceUID = sm_index.SeriesInstanceUID` |
| `index` | `seg_index` | `index.SeriesInstanceUID = seg_index.segmented_SeriesInstanceUID` |
| `index` | `ann_index` | `index.SeriesInstanceUID = ann_index.SeriesInstanceUID` |
| `ann_index` | `ann_group_index` | `ann_index.SeriesInstanceUID = ann_group_index.SeriesInstanceUID` |
| `index` | `clinical_index` | `index.collection_id = clinical_index.collection_id` (then filter by patient) |
| `index` | `contrast_index` | `index.SeriesInstanceUID = contrast_index.SeriesInstanceUID` |

For complete query examples using these joins, see `references/sql_patterns.md`.

## Troubleshooting

**Issue:** Column not found in table
- **Cause:** Column name misspelled or doesn't exist in that table
- **Solution:** Use `client.indices_overview["table_name"]["schema"]["columns"]` to list available columns

**Issue:** DataFrame access returns None
- **Cause:** Index not fetched or property name incorrect
- **Solution:** Fetch first with `client.fetch_index()`, then access via property matching the index name

## Resources

- Complete index table documentation: https://idc-index.readthedocs.io/en/latest/indices_reference.html
- `references/sql_patterns.md` for query examples using these tables
- `references/clinical_data_guide.md` for clinical data workflows
- `references/digital_pathology_guide.md` for pathology-specific indices
