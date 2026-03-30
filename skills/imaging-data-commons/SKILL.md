---
name: imaging-data-commons
description: Query and download public cancer imaging data from NCI Imaging Data Commons using idc-index. Use for accessing large-scale radiology (CT, MR, PET) and pathology datasets for AI training or research. No authentication required. Query by metadata, visualize in browser, check licenses.
license: This skill is provided under the MIT License. IDC data itself has individual licensing (mostly CC-BY, some CC-NC) that must be respected when using the data.
metadata:
    version: 1.4.0
    skill-author: Andrey Fedorov, @fedorov
    idc-index: "0.11.10"
    idc-data-version: "v23"
    repository: https://github.com/ImagingDataCommons/idc-claude-skill
---

# Imaging Data Commons

## Overview

Use the `idc-index` Python package to query and download public cancer imaging data from the National Cancer Institute Imaging Data Commons (IDC). No authentication required for data access.

**Current IDC Data Version: v23** (always verify with `IDCClient().get_idc_version()`)

**Primary tool:** `idc-index` ([GitHub](https://github.com/imagingdatacommons/idc-index))

**CRITICAL - Check package version and upgrade if needed (run this FIRST):**

```python
import idc_index

REQUIRED_VERSION = "0.11.10"  # Must match metadata.idc-index in this file
installed = idc_index.__version__

if installed < REQUIRED_VERSION:
    print(f"Upgrading idc-index from {installed} to {REQUIRED_VERSION}...")
    import subprocess
    subprocess.run(["pip3", "install", "--upgrade", "--break-system-packages", "idc-index"], check=True)
    print("Upgrade complete. Restart Python to use new version.")
else:
    print(f"idc-index {installed} meets requirement ({REQUIRED_VERSION})")
```

**Verify IDC data version and check current data scale:**

```python
from idc_index import IDCClient
client = IDCClient()

# Verify IDC data version (should be "v23")
print(f"IDC data version: {client.get_idc_version()}")

# Get collection count and total series
stats = client.sql_query("""
    SELECT
        COUNT(DISTINCT collection_id) as collections,
        COUNT(DISTINCT analysis_result_id) as analysis_results,
        COUNT(DISTINCT PatientID) as patients,
        COUNT(DISTINCT StudyInstanceUID) as studies,
        COUNT(DISTINCT SeriesInstanceUID) as series,
        SUM(instanceCount) as instances,
        SUM(series_size_MB)/1000000 as size_TB
    FROM index
""")
print(stats)
```

**Core workflow:**
1. Query metadata → `client.sql_query()`
2. Download DICOM files → `client.download_from_selection()`
3. Visualize in browser → `client.get_viewer_URL(seriesInstanceUID=...)`

## When to Use This Skill

- Finding publicly available radiology (CT, MR, PET) or pathology (slide microscopy) images
- Selecting image subsets by cancer type, modality, anatomical site, or other metadata
- Downloading DICOM data from IDC
- Checking data licenses before use in research or commercial applications
- Visualizing medical images in a browser without local DICOM viewer software

## Quick Navigation

**Core Sections (inline):**
- IDC Data Model - Collection and analysis result hierarchy
- Index Tables - Available tables and joining patterns
- Installation - Package setup and version verification
- Core Capabilities - Essential API patterns (query, download, visualize, license, citations, batch)
- Best Practices - Usage guidelines
- Troubleshooting - Common issues and solutions

**Reference Guides (load on demand):**

| Guide | When to Load |
|-------|--------------|
| `index_tables_guide.md` | Complex JOINs, schema discovery, DataFrame access |
| `use_cases.md` | End-to-end workflow examples (training datasets, batch downloads) |
| `sql_patterns.md` | Quick SQL patterns for filter discovery, annotations, size estimation |
| `clinical_data_guide.md` | Clinical/tabular data, imaging+clinical joins, value mapping |
| `cloud_storage_guide.md` | Direct S3/GCS access, versioning, UUID mapping |
| `dicomweb_guide.md` | DICOMweb endpoints, PACS integration |
| `digital_pathology_guide.md` | Slide microscopy (SM), annotations (ANN), pathology workflows |
| `bigquery_guide.md` | Full DICOM metadata, private elements (requires GCP) |
| `cli_guide.md` | Command-line tools (`idc download`, manifest files) |

## IDC Data Model

IDC adds two grouping levels above the standard DICOM hierarchy (Patient → Study → Series → Instance):

- **collection_id**: Groups patients by disease, modality, or research focus (e.g., `tcga_luad`, `nlst`). A patient belongs to exactly one collection.
- **analysis_result_id**: Identifies derived objects (segmentations, annotations, radiomics features) across one or more original collections.

Use `collection_id` to find original imaging data, may include annotations deposited along with the images; use `analysis_result_id` to find AI-generated or expert annotations.

**Key identifiers for queries:**
| Identifier | Scope | Use for |
|------------|-------|---------|
| `collection_id` | Dataset grouping | Filtering by project/study |
| `PatientID` | Patient | Grouping images by patient |
| `StudyInstanceUID` | DICOM study | Grouping of related series, visualization |
| `SeriesInstanceUID` | DICOM series | Grouping of related series, visualization |

## Index Tables

The `idc-index` package provides multiple metadata index tables, accessible via SQL or as pandas DataFrames.

**Complete index table documentation:** Use https://idc-index.readthedocs.io/en/latest/indices_reference.html for quick check of available tables and columns without executing any code.

**Important:** Use `client.indices_overview` to get current table descriptions and column schemas. This is the authoritative source for available columns and their types — always query it when writing SQL or exploring data structure.

### Available Tables

| Table | Row Granularity | Loaded | Description |
|-------|-----------------|--------|-------------|
| `index` | 1 row = 1 DICOM series | Auto | Primary metadata for all current IDC data |
| `prior_versions_index` | 1 row = 1 DICOM series | Auto | Series from previous IDC releases; for downloading deprecated data |
| `collections_index` | 1 row = 1 collection | fetch_index() | Collection-level metadata and descriptions |
| `analysis_results_index` | 1 row = 1 analysis result collection | fetch_index() | Metadata about derived datasets (annotations, segmentations) |
| `clinical_index` | 1 row = 1 clinical data column | fetch_index() | Dictionary mapping clinical table columns to collections |
| `sm_index` | 1 row = 1 slide microscopy series | fetch_index() | Slide Microscopy (pathology) series metadata |
| `sm_instance_index` | 1 row = 1 slide microscopy instance | fetch_index() | Instance-level (SOPInstanceUID) metadata for slide microscopy |
| `seg_index` | 1 row = 1 DICOM Segmentation series | fetch_index() | Segmentation metadata: algorithm, segment count, reference to source image series |
| `ann_index` | 1 row = 1 DICOM ANN series | fetch_index() | Microscopy Bulk Simple Annotations series metadata; references annotated image series |
| `ann_group_index` | 1 row = 1 annotation group | fetch_index() | Detailed annotation group metadata: graphic type, annotation count, property codes, algorithm |
| `contrast_index` | 1 row = 1 series with contrast info | fetch_index() | Contrast agent metadata: agent name, ingredient, administration route (CT, MR, PT, XA, RF) |

**Auto** = loaded automatically when `IDCClient()` is instantiated
**fetch_index()** = requires `client.fetch_index("table_name")` to load

### Joining Tables

**Key columns are not explicitly labeled, the following is a subset that can be used in joins.**

| Join Column | Tables | Use Case |
|-------------|--------|----------|
| `collection_id` | index, prior_versions_index, collections_index, clinical_index | Link series to collection metadata or clinical data |
| `SeriesInstanceUID` | index, prior_versions_index, sm_index, sm_instance_index | Link series across tables; connect to slide microscopy details |
| `StudyInstanceUID` | index, prior_versions_index | Link studies across current and historical data |
| `PatientID` | index, prior_versions_index | Link patients across current and historical data |
| `analysis_result_id` | index, analysis_results_index | Link series to analysis result metadata (annotations, segmentations) |
| `source_DOI` | index, analysis_results_index | Link by publication DOI |
| `crdc_series_uuid` | index, prior_versions_index | Link by CRDC unique identifier |
| `Modality` | index, prior_versions_index | Filter by imaging modality |
| `SeriesInstanceUID` | index, seg_index, ann_index, ann_group_index, contrast_index | Link segmentation/annotation/contrast series to its index metadata |
| `segmented_SeriesInstanceUID` | seg_index → index | Link segmentation to its source image series (join seg_index.segmented_SeriesInstanceUID = index.SeriesInstanceUID) |
| `referenced_SeriesInstanceUID` | ann_index → index | Link annotation to its source image series (join ann_index.referenced_SeriesInstanceUID = index.SeriesInstanceUID) |

**Note:** `Subjects`, `Updated`, and `Description` appear in multiple tables but have different meanings (counts vs identifiers, different update contexts).

For detailed join examples, schema discovery patterns, key columns reference, and DataFrame access, see `references/index_tables_guide.md`.

### Clinical Data Access

```python
# Fetch clinical index (also downloads clinical data tables)
client.fetch_index("clinical_index")

# Query clinical index to find available tables and their columns
tables = client.sql_query("SELECT DISTINCT table_name, column_label FROM clinical_index")

# Load a specific clinical table as DataFrame
clinical_df = client.get_clinical_table("table_name")
```

See `references/clinical_data_guide.md` for detailed workflows including value mapping patterns and joining clinical data with imaging.

## Data Access Options

| Method | Auth Required | Best For |
|--------|---------------|----------|
| `idc-index` | No | Key queries and downloads (recommended) |
| IDC Portal | No | Interactive exploration, manual selection, browser-based download |
| BigQuery | Yes (GCP account) | Complex queries, full DICOM metadata |
| DICOMweb proxy | No | Tool integration via DICOMweb API |
| Cloud storage (S3/GCS) | No | Direct file access, bulk downloads, custom pipelines |

**Cloud storage organization**

IDC maintains all DICOM files in public cloud storage buckets mirrored between AWS S3 and Google Cloud Storage. Files are organized by CRDC UUIDs (not DICOM UIDs) to support versioning.

| Bucket (AWS / GCS) | License | Content |
|--------------------|---------|---------|
| `idc-open-data` / `idc-open-data` | No commercial restriction | >90% of IDC data |
| `idc-open-data-two` / `idc-open-idc1` | No commercial restriction | Collections with potential head scans |
| `idc-open-data-cr` / `idc-open-cr` | Commercial use restricted (CC BY-NC) | ~4% of data |

Files are stored as `<crdc_series_uuid>/<crdc_instance_uuid>.dcm`. Access is free (no egress fees) via AWS CLI, gsutil, or s5cmd with anonymous access. Use `series_aws_url` column from the index for S3 URLs; GCS uses the same path structure.

See `references/cloud_storage_guide.md` for bucket details, access commands, UUID mapping, and versioning.

**DICOMweb access**

IDC data is available via DICOMweb interface (Google Cloud Healthcare API implementation) for integration with PACS systems and DICOMweb-compatible tools.

| Endpoint | Auth | Use Case |
|----------|------|----------|
| Public proxy | No | Testing, moderate queries, daily quota |
| Google Healthcare | Yes (GCP) | Production use, higher quotas |

See `references/dicomweb_guide.md` for endpoint URLs, code examples, supported operations, and implementation details.

## Installation and Setup

**Required (for basic access):**
```bash
pip install --upgrade idc-index
```

**Important:** New IDC data release will always trigger a new version of `idc-index`. Always use `--upgrade` flag while installing, unless an older version is needed for reproducibility.

**IMPORTANT:** IDC data version v23 is current. Always verify your version:
```python
print(client.get_idc_version())  # Should return "v23"
```
If you see an older version, upgrade with: `pip install --upgrade idc-index`

**Tested with:** idc-index 0.11.10 (IDC data version v23)

**Optional (for data analysis):**
```bash
pip install pandas numpy pydicom
```

## Core Capabilities

### 1. Data Discovery and Exploration

Discover what imaging collections and data are available in IDC:

```python
from idc_index import IDCClient

client = IDCClient()

# Get summary statistics from primary index
query = """
SELECT
  collection_id,
  COUNT(DISTINCT PatientID) as patients,
  COUNT(DISTINCT SeriesInstanceUID) as series,
  SUM(series_size_MB) as size_mb
FROM index
GROUP BY collection_id
ORDER BY patients DESC
"""
collections_summary = client.sql_query(query)

# For richer collection metadata, use collections_index
client.fetch_index("collections_index")
collections_info = client.sql_query("""
    SELECT collection_id, CancerTypes, TumorLocations, Species, Subjects, SupportingData
    FROM collections_index
""")

# For analysis results (annotations, segmentations), use analysis_results_index
client.fetch_index("analysis_results_index")
analysis_info = client.sql_query("""
    SELECT analysis_result_id, analysis_result_title, Subjects, Collections, Modalities
    FROM analysis_results_index
""")
```

**`collections_index`** provides curated metadata per collection: cancer types, tumor locations, species, subject counts, and supporting data types — without needing to aggregate from the primary index.

**`analysis_results_index`** lists derived datasets (AI segmentations, expert annotations, radiomics features) with their source collections and modalities.

### 2. Querying Metadata with SQL

Query the IDC mini-index using SQL to find specific datasets.

**First, explore available values for filter columns:**
```python
from idc_index import IDCClient

client = IDCClient()

# Check what Modality values exist
modalities = client.sql_query("""
    SELECT DISTINCT Modality, COUNT(*) as series_count
    FROM index
    GROUP BY Modality
    ORDER BY series_count DESC
""")
print(modalities)

# Check what BodyPartExamined values exist for MR modality
body_parts = client.sql_query("""
    SELECT DISTINCT BodyPartExamined, COUNT(*) as series_count
    FROM index
    WHERE Modality = 'MR' AND BodyPartExamined IS NOT NULL
    GROUP BY BodyPartExamined
    ORDER BY series_count DESC
    LIMIT 20
""")
print(body_parts)
```

**Then query with validated filter values:**
```python
# Find breast MRI scans (use actual values from exploration above)
results = client.sql_query("""
    SELECT
      collection_id,
      PatientID,
      SeriesInstanceUID,
      Modality,
      SeriesDescription,
      license_short_name
    FROM index
    WHERE Modality = 'MR'
      AND BodyPartExamined = 'BREAST'
    LIMIT 20
""")

# Access results as pandas DataFrame
for idx, row in results.iterrows():
    print(f"Patient: {row['PatientID']}, Series: {row['SeriesInstanceUID']}")
```

**To filter by cancer type, join with `collections_index`:**
```python
client.fetch_index("collections_index")
results = client.sql_query("""
    SELECT i.collection_id, i.PatientID, i.SeriesInstanceUID, i.Modality
    FROM index i
    JOIN collections_index c ON i.collection_id = c.collection_id
    WHERE c.CancerTypes LIKE '%Breast%'
      AND i.Modality = 'MR'
    LIMIT 20
""")
```

**Available metadata fields** (use `client.indices_overview` for complete list):
- Identifiers: collection_id, PatientID, StudyInstanceUID, SeriesInstanceUID
- Imaging: Modality, BodyPartExamined, Manufacturer, ManufacturerModelName
- Clinical: PatientAge, PatientSex, StudyDate
- Descriptions: StudyDescription, SeriesDescription
- Licensing: license_short_name

**Note:** Cancer type is in `collections_index.CancerTypes`, not in the primary `index` table.

### 3. Downloading DICOM Files

Download imaging data efficiently from IDC's cloud storage:

**Download entire collection:**
```python
from idc_index import IDCClient

client = IDCClient()

# Download small collection (RIDER Pilot ~1GB)
client.download_from_selection(
    collection_id="rider_pilot",
    downloadDir="./data/rider"
)
```

**Download specific series:**
```python
# First, query for series UIDs
series_df = client.sql_query("""
    SELECT SeriesInstanceUID
    FROM index
    WHERE Modality = 'CT'
      AND BodyPartExamined = 'CHEST'
      AND collection_id = 'nlst'
    LIMIT 5
""")

# Download only those series
client.download_from_selection(
    seriesInstanceUID=list(series_df['SeriesInstanceUID'].values),
    downloadDir="./data/lung_ct"
)
```

**Custom directory structure:**

Default `dirTemplate`: `%collection_id/%PatientID/%StudyInstanceUID/%Modality_%SeriesInstanceUID`

```python
# Simplified hierarchy (omit StudyInstanceUID level)
client.download_from_selection(
    collection_id="tcga_luad",
    downloadDir="./data",
    dirTemplate="%collection_id/%PatientID/%Modality"
)
# Results in: ./data/tcga_luad/TCGA-05-4244/CT/

# Flat structure (all files in one directory)
client.download_from_selection(
    seriesInstanceUID=list(series_df['SeriesInstanceUID'].values),
    downloadDir="./data/flat",
    dirTemplate=""
)
# Results in: ./data/flat/*.dcm
```

**Downloaded file names:**

Individual DICOM files are named using their CRDC instance UUID: `<crdc_instance_uuid>.dcm` (e.g., `0d73f84e-70ae-4eeb-96a0-1c613b5d9229.dcm`). This UUID-based naming:
- Enables version tracking (UUIDs change when file content changes)
- Matches cloud storage organization (`s3://idc-open-data/<crdc_series_uuid>/<crdc_instance_uuid>.dcm`)
- Differs from DICOM UIDs (SOPInstanceUID) which are preserved inside the file metadata

To identify files, use the `crdc_instance_uuid` column in queries or read DICOM metadata (SOPInstanceUID) from the files.

### Command-Line Download

The `idc download` command provides command-line access to download functionality without writing Python code. Available after installing `idc-index`.

**Auto-detects input type:** manifest file path, or identifiers (collection_id, PatientID, StudyInstanceUID, SeriesInstanceUID, crdc_series_uuid).

```bash
# Download entire collection
idc download rider_pilot --download-dir ./data

# Download specific series by UID
idc download "1.3.6.1.4.1.9328.50.1.69736" --download-dir ./data

# Download multiple items (comma-separated)
idc download "tcga_luad,tcga_lusc" --download-dir ./data

# Download from manifest file (auto-detected)
idc download manifest.txt --download-dir ./data
```

**Options:**

| Option | Description |
|--------|-------------|
| `--download-dir` | Output directory (default: current directory) |
| `--dir-template` | Directory hierarchy template (default: `%collection_id/%PatientID/%StudyInstanceUID/%Modality_%SeriesInstanceUID`) |
| `--log-level` | Verbosity: debug, info, warning, error, critical |

**Manifest files:**

Manifest files contain S3 URLs (one per line) and can be:
- Exported from the IDC Portal after cohort selection
- Shared by collaborators for reproducible data access
- Generated programmatically from query results

Format (one S3 URL per line):
```
s3://idc-open-data/cb09464a-c5cc-4428-9339-d7fa87cfe837/*
s3://idc-open-data/88f3990d-bdef-49cd-9b2b-4787767240f2/*
```

**Example: Generate manifest from Python query:**

```python
from idc_index import IDCClient

client = IDCClient()

# Query for series URLs
results = client.sql_query("""
    SELECT series_aws_url
    FROM index
    WHERE collection_id = 'rider_pilot' AND Modality = 'CT'
""")

# Save as manifest file
with open('ct_manifest.txt', 'w') as f:
    for url in results['series_aws_url']:
        f.write(url + '\n')
```

Then download:
```bash
idc download ct_manifest.txt --download-dir ./ct_data
```

### 4. Visualizing IDC Images

View DICOM data in browser without downloading:

```python
from idc_index import IDCClient
import webbrowser

client = IDCClient()

# First query to get valid UIDs
results = client.sql_query("""
    SELECT SeriesInstanceUID, StudyInstanceUID
    FROM index
    WHERE collection_id = 'rider_pilot' AND Modality = 'CT'
    LIMIT 1
""")

# View single series
viewer_url = client.get_viewer_URL(seriesInstanceUID=results.iloc[0]['SeriesInstanceUID'])
webbrowser.open(viewer_url)

# View all series in a study (useful for multi-series exams like MRI protocols)
viewer_url = client.get_viewer_URL(studyInstanceUID=results.iloc[0]['StudyInstanceUID'])
webbrowser.open(viewer_url)
```

The method automatically selects OHIF v3 for radiology or SLIM for slide microscopy. Viewing by study is useful when a DICOM Study contains multiple Series (e.g., T1, T2, DWI sequences from a single MRI session).

### 5. Understanding and Checking Licenses

Check data licensing before use (critical for commercial applications):

```python
from idc_index import IDCClient

client = IDCClient()

# Check licenses for all collections
query = """
SELECT DISTINCT
  collection_id,
  license_short_name,
  COUNT(DISTINCT SeriesInstanceUID) as series_count
FROM index
GROUP BY collection_id, license_short_name
ORDER BY collection_id
"""

licenses = client.sql_query(query)
print(licenses)
```

**License types in IDC:**
- **CC BY 4.0** / **CC BY 3.0** (~97% of data) - Allows commercial use with attribution
- **CC BY-NC 4.0** / **CC BY-NC 3.0** (~3% of data) - Non-commercial use only
- **Custom licenses** (rare) - Some collections have specific terms (e.g., NLM Terms and Conditions)

**Important:** Always check the license before using IDC data in publications or commercial applications. Each DICOM file is tagged with its specific license in metadata.

### Generating Citations for Attribution

The `source_DOI` column contains DOIs linking to publications describing how the data was generated. To satisfy attribution requirements, use `citations_from_selection()` to generate properly formatted citations:

```python
from idc_index import IDCClient

client = IDCClient()

# Get citations for a collection (APA format by default)
citations = client.citations_from_selection(collection_id="rider_pilot")
for citation in citations:
    print(citation)

# Get citations for specific series
results = client.sql_query("""
    SELECT SeriesInstanceUID FROM index
    WHERE collection_id = 'tcga_luad' LIMIT 5
""")
citations = client.citations_from_selection(
    seriesInstanceUID=list(results['SeriesInstanceUID'].values)
)

# Alternative format: BibTeX (for LaTeX documents)
bibtex_citations = client.citations_from_selection(
    collection_id="tcga_luad",
    citation_format=IDCClient.CITATION_FORMAT_BIBTEX
)
```

**Parameters:**
- `collection_id`: Filter by collection(s)
- `patientId`: Filter by patient ID(s)
- `studyInstanceUID`: Filter by study UID(s)
- `seriesInstanceUID`: Filter by series UID(s)
- `citation_format`: Use `IDCClient.CITATION_FORMAT_*` constants:
  - `CITATION_FORMAT_APA` (default) - APA style
  - `CITATION_FORMAT_BIBTEX` - BibTeX for LaTeX
  - `CITATION_FORMAT_JSON` - CSL JSON
  - `CITATION_FORMAT_TURTLE` - RDF Turtle

**Best practice:** When publishing results using IDC data, include the generated citations to properly attribute the data sources and satisfy license requirements.

### 6. Batch Processing and Filtering

Process large datasets efficiently with filtering:

```python
from idc_index import IDCClient
import pandas as pd

client = IDCClient()

# Find chest CT scans from GE scanners
query = """
SELECT
  SeriesInstanceUID,
  PatientID,
  collection_id,
  ManufacturerModelName
FROM index
WHERE Modality = 'CT'
  AND BodyPartExamined = 'CHEST'
  AND Manufacturer = 'GE MEDICAL SYSTEMS'
  AND license_short_name = 'CC BY 4.0'
LIMIT 100
"""

results = client.sql_query(query)

# Save manifest for later
results.to_csv('lung_ct_manifest.csv', index=False)

# Download in batches to avoid timeout
batch_size = 10
for i in range(0, len(results), batch_size):
    batch = results.iloc[i:i+batch_size]
    client.download_from_selection(
        seriesInstanceUID=list(batch['SeriesInstanceUID'].values),
        downloadDir=f"./data/batch_{i//batch_size}"
    )
```

### 7. Advanced Queries with BigQuery

For queries requiring full DICOM metadata, complex JOINs, clinical data tables, or private DICOM elements, use Google BigQuery. Requires GCP account with billing enabled.

**Quick reference:**
- Dataset: `bigquery-public-data.idc_current.*`
- Main table: `dicom_all` (combined metadata)
- Full metadata: `dicom_metadata` (all DICOM tags)
- Private elements: `OtherElements` column (vendor-specific tags like diffusion b-values)

See `references/bigquery_guide.md` for setup, table schemas, query patterns, private element access, and cost optimization.

**Before using BigQuery**, always check if a specialized index table already has the metadata you need:
1. Use `client.indices_overview` or the [idc-index indices reference](https://idc-index.readthedocs.io/en/latest/indices_reference.html) to discover all available tables and their columns
2. Fetch the relevant index: `client.fetch_index("table_name")`
3. Query locally with `client.sql_query()` (free, no GCP account needed)

Common specialized indices: `seg_index` (segmentations), `ann_index` / `ann_group_index` (microscopy annotations), `sm_index` (slide microscopy), `collections_index` (collection metadata). Only use BigQuery if you need private DICOM elements or attributes not in any index.

### 8. Tool Selection Guide

| Task | Tool | Reference |
|------|------|-----------|
| Programmatic queries & downloads | `idc-index` | This document |
| Interactive exploration | IDC Portal | https://portal.imaging.datacommons.cancer.gov/ |
| Complex metadata queries | BigQuery | `references/bigquery_guide.md` |
| 3D visualization & analysis | SlicerIDCBrowser | https://github.com/ImagingDataCommons/SlicerIDCBrowser |

**Default choice:** Use `idc-index` for most tasks (no auth, easy API, batch downloads).

### 9. Integration with Analysis Pipelines

Integrate IDC data into imaging analysis workflows:

**Read downloaded DICOM files:**
```python
import pydicom
import os

# Read DICOM files from downloaded series
series_dir = "./data/rider/rider_pilot/RIDER-1007893286/CT_1.3.6.1..."

dicom_files = [os.path.join(series_dir, f) for f in os.listdir(series_dir)
               if f.endswith('.dcm')]

# Load first image
ds = pydicom.dcmread(dicom_files[0])
print(f"Patient ID: {ds.PatientID}")
print(f"Modality: {ds.Modality}")
print(f"Image shape: {ds.pixel_array.shape}")
```

**Build 3D volume from CT series:**
```python
import pydicom
import numpy as np
from pathlib import Path

def load_ct_series(series_path):
    """Load CT series as 3D numpy array"""
    files = sorted(Path(series_path).glob('*.dcm'))
    slices = [pydicom.dcmread(str(f)) for f in files]

    # Sort by slice location
    slices.sort(key=lambda x: float(x.ImagePositionPatient[2]))

    # Stack into 3D array
    volume = np.stack([s.pixel_array for s in slices])

    return volume, slices[0]  # Return volume and first slice for metadata

volume, metadata = load_ct_series("./data/lung_ct/series_dir")
print(f"Volume shape: {volume.shape}")  # (z, y, x)
```

**Integrate with SimpleITK:**
```python
import SimpleITK as sitk
from pathlib import Path

# Read DICOM series
series_path = "./data/ct_series"
reader = sitk.ImageSeriesReader()
dicom_names = reader.GetGDCMSeriesFileNames(series_path)
reader.SetFileNames(dicom_names)
image = reader.Execute()

# Apply processing
smoothed = sitk.CurvatureFlow(image1=image, timeStep=0.125, numberOfIterations=5)

# Save as NIfTI
sitk.WriteImage(smoothed, "processed_volume.nii.gz")
```

## Common Use Cases

See `references/use_cases.md` for complete end-to-end workflow examples including:
- Building deep learning training datasets from lung CT scans
- Comparing image quality across scanner manufacturers
- Previewing data in browser before downloading
- License-aware batch downloads for commercial use

## Best Practices

- **Verify IDC version before generating responses** - Always call `client.get_idc_version()` at the start of a session to confirm you're using the expected data version (currently v23). If using an older version, recommend `pip install --upgrade idc-index`
- **Check licenses before use** - Always query the `license_short_name` field and respect licensing terms (CC BY vs CC BY-NC)
- **Generate citations for attribution** - Use `citations_from_selection()` to get properly formatted citations from `source_DOI` values; include these in publications
- **Start with small queries** - Use `LIMIT` clause when exploring to avoid long downloads and understand data structure
- **Use mini-index for simple queries** - Only use BigQuery when you need comprehensive metadata or complex JOINs
- **Organize downloads with dirTemplate** - Use meaningful directory structures like `%collection_id/%PatientID/%Modality`
- **Cache query results** - Save DataFrames to CSV files to avoid re-querying and ensure reproducibility
- **Estimate size first** - Check collection size before downloading - some collection sizes are in terabytes!
- **Save manifests** - Always save query results with Series UIDs for reproducibility and data provenance
- **Read documentation** - IDC data structure and metadata fields are documented at https://learn.canceridc.dev/
- **Use IDC forum** - Search for questons/answers and ask your questions to the IDC maintainers and users at https://discourse.canceridc.dev/

## Troubleshooting

**Issue: `ModuleNotFoundError: No module named 'idc_index'`**
- **Cause:** idc-index package not installed
- **Solution:** Install with `pip install --upgrade idc-index`

**Issue: Download fails with connection timeout**
- **Cause:** Network instability or large download size
- **Solution:**
  - Download smaller batches (e.g., 10-20 series at a time)
  - Check network connection
  - Use `dirTemplate` to organize downloads by batch
  - Implement retry logic with delays

**Issue: `BigQuery quota exceeded` or billing errors**
- **Cause:** BigQuery requires billing-enabled GCP project
- **Solution:** Use idc-index mini-index for simple queries (no billing required), or see `references/bigquery_guide.md` for cost optimization tips

**Issue: Series UID not found or no data returned**
- **Cause:** Typo in UID, data not in current IDC version, or wrong field name
- **Solution:**
  - Check if data is in current IDC version (some old data may be deprecated)
  - Use `LIMIT 5` to test query first
  - Check field names against metadata schema documentation

**Issue: Downloaded DICOM files won't open**
- **Cause:** Corrupted download or incompatible viewer
- **Solution:**
  - Check DICOM object type (Modality and SOPClassUID attributes) - some object types require specialized tools
  - Verify file integrity (check file sizes)
  - Use pydicom to validate: `pydicom.dcmread(file, force=True)`
  - Try different DICOM viewer (3D Slicer, Horos, RadiAnt, QuPath)
  - Re-download the series

## Common SQL Query Patterns

See `references/sql_patterns.md` for quick-reference SQL patterns including:
- Filter value discovery (modalities, body parts, manufacturers)
- Annotation and segmentation queries (including seg_index, ann_index joins)
- Slide microscopy queries (sm_index patterns)
- Download size estimation
- Clinical data linking

For segmentation and annotation details, also see `references/digital_pathology_guide.md`.

## Related Skills

The following skills complement IDC workflows for downstream analysis and visualization:

### DICOM Processing
- **pydicom** - Read, write, and manipulate downloaded DICOM files. Use for extracting pixel data, reading metadata, anonymization, and format conversion. Essential for working with IDC radiology data (CT, MR, PET).

### Pathology and Slide Microscopy
See `references/digital_pathology_guide.md` for DICOM-compatible tools (highdicom, wsidicom, TIA-Toolbox, Slim viewer).

### Metadata Visualization
- **matplotlib** - Low-level plotting for full customization. Use for creating static figures summarizing IDC query results (bar charts of modalities, histograms of series counts, etc.).
- **seaborn** - Statistical visualization with pandas integration. Use for quick exploration of IDC metadata distributions, relationships between variables, and categorical comparisons with attractive defaults.
- **plotly** - Interactive visualization. Use when you need hover info, zoom, and pan for exploring IDC metadata, or for creating web-embeddable dashboards of collection statistics.

### Data Exploration
- **exploratory-data-analysis** - Comprehensive EDA on scientific data files. Use after downloading IDC data to understand file structure, quality, and characteristics before analysis.

## Resources

### Schema Reference (Primary Source)

**Always use `client.indices_overview` for current column schemas.** This ensures accuracy with the installed idc-index version:

```python
# Get all column names and types for any table
schema = client.indices_overview["index"]["schema"]
columns = [(c['name'], c['type'], c.get('description', '')) for c in schema['columns']]
```

### Reference Documentation

See the Quick Navigation section at the top for the full list of reference guides with decision triggers.

- **[indices_reference](https://idc-index.readthedocs.io/en/latest/indices_reference.html)** - External documentation for index tables (may be ahead of the installed version)

### External Links

- **IDC Portal**: https://portal.imaging.datacommons.cancer.gov/explore/
- **Documentation**: https://learn.canceridc.dev/
- **Tutorials**: https://github.com/ImagingDataCommons/IDC-Tutorials
- **User Forum**: https://discourse.canceridc.dev/
- **idc-index GitHub**: https://github.com/ImagingDataCommons/idc-index
- **Citation**: Fedorov, A., et al. "National Cancer Institute Imaging Data Commons: Toward Transparency, Reproducibility, and Scalability in Imaging Artificial Intelligence." RadioGraphics 43.12 (2023). https://doi.org/10.1148/rg.230180

### Skill Updates

This skill version is available in skill metadata. To check for updates:
- Visit the [releases page](https://github.com/ImagingDataCommons/idc-claude-skill/releases)
- Watch the repository on GitHub (Watch → Custom → Releases)
