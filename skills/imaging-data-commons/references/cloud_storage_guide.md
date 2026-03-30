# Cloud Storage Guide for IDC

IDC maintains all DICOM files in public cloud storage buckets mirrored between Google Cloud Storage (GCS) and AWS S3. This guide covers bucket organization, file structure, access methods, and versioning.

## When to Use Direct Cloud Storage Access

Use direct bucket access when you need:
- Maximum download performance with parallel transfers
- Integration with cloud-native workflows (e.g., running analysis on cloud VMs)
- Programmatic access from tools like s5cmd or gsutil
- Access to specific file versions for reproducibility

For most use cases, `idc-index` is simpler and recommended -— it uses s5cmd internally to download from these same S3 buckets, handling the UUID lookups automatically. Use direct cloud storage when you need raw file access, custom parallelization, or are building cloud-native pipelines.

## Storage Buckets

IDC organizes data across multiple buckets based on licensing and content type. All buckets are mirrored between AWS and GCS with identical content and file paths.

### Bucket Summary

| Purpose | AWS S3 Bucket | GCS Bucket | License | Content |
|---------|---------------|------------|---------|---------|
| Primary data | `idc-open-data` | `idc-open-data` | No commercial restriction | >90% of IDC data |
| Head scans | `idc-open-data-two` | `idc-open-idc1` | No commercial restriction | Collections potentially containing head imaging |
| Commercial-restricted | `idc-open-data-cr` | `idc-open-cr` | Commercial use restricted (CC BY-NC) | ~4% of data |

**Notes:**
- All AWS buckets are in AWS region `us-east-1`
- Prior to IDC v19, GCS used `public-datasets-idc` (now superseded by `idc-open-data`)
- The head scans bucket exists for potential future policy changes regarding facial imaging data
- **Important** Use `idc-index` to get license information - do not rely on bucket name! 

### Why Multiple Buckets?

1. **Licensing separation**: Data with commercial-use restrictions (CC BY-NC) is isolated in `idc-open-data-cr` / `idc-open-cr` to prevent accidental commercial use
2. **Head scan handling**: Collections labeled by TCIA as potentially containing head scans are in separate buckets (`idc-open-data-two` / `idc-open-idc1`) for potential future policy compliance
3. **Historical reasons**: The bucket structure evolved as IDC grew and partnered with different cloud programs

## File Organization Within Buckets

Files are organized by CRDC UUIDs, not DICOM UIDs. This enables versioning while maintaining consistent paths across cloud providers.

### Directory Structure

```
<bucket>/
└── <crdc_series_uuid>/
    ├── <crdc_instance_uuid_1>.dcm
    ├── <crdc_instance_uuid_2>.dcm
    └── ...
```

**Example path:**
```
s3://idc-open-data/7a6b2389-53c6-4c5b-b07f-6d1ed4a3eed9/0d73f84e-70ae-4eeb-96a0-1c613b5d9229.dcm
```

- `7a6b2389-53c6-4c5b-b07f-6d1ed4a3eed9` = series UUID (folder)
- `0d73f84e-70ae-4eeb-96a0-1c613b5d9229.dcm` = instance UUID (file)

### CRDC UUIDs vs DICOM UIDs

| Identifier Type | Format | Changes When | Use For |
|-----------------|--------|--------------|---------|
| DICOM UID (e.g., SeriesInstanceUID) | Numeric (e.g., `1.3.6.1.4...`) | Never (included in DICOM metadata) | Clinical identification, DICOMweb queries |
| CRDC UUID (e.g., crdc_series_uuid) | UUID (e.g., `e127d258-37c2-...`) | Content changes | File paths, versioning, reproducibility |

**Key insight:** A single DICOM SeriesInstanceUID may have multiple CRDC series UUIDs across IDC versions if the series content changed (instances added/removed, metadata corrected). The CRDC UUID uniquely identifies a specific version of the data.

### Mapping DICOM UIDs to File Paths

Use `idc-index` to get file URLs from DICOM identifiers:

```python
from idc_index import IDCClient

client = IDCClient()

# Get all file URLs for a series
series_uid = "1.3.6.1.4.1.14519.5.2.1.6450.9002.217441095430480124587725641302"
urls = client.get_series_file_URLs(seriesInstanceUID=series_uid)

for url in urls[:3]:
    print(url)
# Returns S3 URLs like: s3://idc-open-data/<crdc_series_uuid>/<crdc_instance_uuid>.dcm
```

Or query the index directly for URL columns:

```python
# Get series-level URL (points to folder)
result = client.sql_query("""
    SELECT SeriesInstanceUID, series_aws_url
    FROM index
    WHERE collection_id = 'rider_pilot' AND Modality = 'CT'
    LIMIT 3
""")

print(result[['SeriesInstanceUID', 'series_aws_url']])
```

**Available URL column in index:**
- `series_aws_url`: S3 URL to series folder (e.g., `s3://idc-open-data/uuid/*`)

GCS URLs follow the same path structure—replace `s3://` with `gs://` (e.g., `gs://idc-open-data/uuid/*`). When using `idc-index` download methods, GCS access is handled internally.

## Accessing Cloud Storage

All IDC buckets support free egress (no download fees) through partnerships with AWS Open Data and Google Public Data programs. No authentication required.

### AWS S3 Access

**Using AWS CLI (no account required):**
```bash
# List bucket contents
aws s3 ls --no-sign-request s3://idc-open-data/

# List files in a series folder
aws s3 ls --no-sign-request s3://idc-open-data/7a6b2389-53c6-4c5b-b07f-6d1ed4a3eed9/

# Download a single file
aws s3 cp --no-sign-request \
    s3://idc-open-data/7a6b2389-53c6-4c5b-b07f-6d1ed4a3eed9/0d73f84e-70ae-4eeb-96a0-1c613b5d9229.dcm \
    ./local_file.dcm

# Download entire series folder
aws s3 cp --no-sign-request --recursive \
    s3://idc-open-data/7a6b2389-53c6-4c5b-b07f-6d1ed4a3eed9/ \
    ./series_folder/
```

**Using s5cmd (faster for bulk downloads):**
```bash
# Install s5cmd
# macOS: brew install s5cmd
# Linux: download from https://github.com/peak/s5cmd/releases

# Download specific series
s5cmd --no-sign-request cp 's3://idc-open-data/7a6b2389-53c6-4c5b-b07f-6d1ed4a3eed9/*' ./local_folder/

# Download from manifest file
s5cmd --no-sign-request run manifest.txt
```

**s5cmd manifest format:** The `s5cmd run` command expects one s5cmd command per line, not just URLs:
```
cp s3://idc-open-data/uuid1/instance1.dcm ./local_folder/
cp s3://idc-open-data/uuid1/instance2.dcm ./local_folder/
cp s3://idc-open-data/uuid2/instance3.dcm ./local_folder/
```

IDC Portal exports manifests in this format. When creating manifests programmatically, use `idc-index` download methods (which handle this internally) rather than constructing manifests manually.

### GCS Access

**Using gsutil:**
```bash
# List bucket contents
gsutil ls gs://idc-open-data/

# Download a series folder
gsutil -m cp -r gs://idc-open-data/7a6b2389-53c6-4c5b-b07f-6d1ed4a3eed9/ ./local_folder/
```

**Using gcloud storage (newer CLI):**
```bash
gcloud storage cp -r gs://idc-open-data/7a6b2389-53c6-4c5b-b07f-6d1ed4a3eed9/ ./local_folder/
```

### Python Direct Access

```python
import s3fs
import gcsfs
from idc_index import IDCClient

# First, get a file URL from idc-index
client = IDCClient()
result = client.sql_query("""
    SELECT series_aws_url
    FROM index
    WHERE collection_id = 'rider_pilot' AND Modality = 'CT'
    LIMIT 1
""")
# series_aws_url is like: s3://idc-open-data/<uuid>/*
series_url = result['series_aws_url'].iloc[0]
series_path = series_url.replace('s3://', '').rstrip('/*')  # e.g., "idc-open-data/<uuid>"

# AWS S3 access
s3 = s3fs.S3FileSystem(anon=True)
files = s3.ls(series_path)
with s3.open(files[0], 'rb') as f:
    data = f.read()

# GCS access (same path structure as AWS)
gcs = gcsfs.GCSFileSystem(token='anon')
files = gcs.ls(series_path)
with gcs.open(files[0], 'rb') as f:
    data = f.read()
```

## Versioning and Reproducibility

IDC releases new data versions every 2-4 months. The versioning system ensures reproducibility by preserving all historical data.

### How Versioning Works

1. **Snapshots**: Each IDC version (v1, v2, ..., v23, etc.) represents a complete snapshot of all data at release time
2. **UUID-based**: When data changes, new CRDC UUIDs are assigned; old UUIDs remain accessible
3. **Cumulative buckets**: All versions coexist in the same buckets—old series folders

**Version change scenarios:**
| Change Type | DICOM UID | CRDC UUID | Effect |
|-------------|-----------|-----------|--------|
| New series added | New | New | New folder in bucket |
| Instance added to series | Same | New series UUID | New folder, instances may be duplicated |
| Metadata corrected | Same or new | New | New folder with updated files |
| Series removed | N/A | N/A | Old folder remains, not in current index |

**Data removal caveat:** In rare circumstances (e.g., data owner request, PHI incident), data may be removed from IDC entirely, including from all historical versions.

**BigQuery versioned datasets (metadata only, not file storage):**

For querying version-specific metadata, BigQuery provides versioned tables. See `bigquery_guide.md` for details.
- `bigquery-public-data.idc_current` — alias to latest version
- `bigquery-public-data.idc_v23` — specific version (replace 23 with desired version)

### Reproducing a Previous Analysis

The simplest way to ensure reproducibility is to save the `crdc_series_uuid` values of the data you use at analysis time:

```python
from idc_index import IDCClient
import json

client = IDCClient()

# Select data for your analysis
selection = client.sql_query("""
    SELECT crdc_series_uuid
    FROM index
    WHERE collection_id = 'tcga_luad'
      AND Modality = 'CT'
    LIMIT 10
""")
series_uuids = list(selection['crdc_series_uuid'])

# Download the data
client.download_from_selection(seriesInstanceUID=series_uuids, downloadDir="./data")

# Save a manifest for reproducibility
manifest = {
    "crdc_series_uuids": series_uuids,
    "download_date": "2024-01-15",
    "idc_version": client.get_idc_version(),
    "description": "CT scans for lung cancer analysis"
}
with open("analysis_manifest.json", "w") as f:
    json.dump(manifest, f, indent=2)

# Later, reproduce the exact dataset:
with open("analysis_manifest.json") as f:
    manifest = json.load(f)
client.download_from_selection(
    seriesInstanceUID=manifest["crdc_series_uuids"],
    downloadDir="./reproduced_data"
)
```

Since `crdc_series_uuid` identifies an immutable version of each series, saving these UUIDs guarantees you can retrieve the exact same files later.

## Relationship Between Buckets, Versions, and Other Access Methods

### Data Coverage Comparison

| Access Method | Buckets Included | Coverage | Versions |
|---------------|------------------|----------|----------|
| Direct bucket access | All 3 buckets | 100% | All historical |
| `idc-index` download | All 3 buckets | 100% | Current + prior_versions_index |
| IDC Portal | All 3 buckets | 100% | Current only |
| DICOMweb public proxy | All 3 buckets | 100% | Current only |
| Google Healthcare DICOM | `idc-open-data` only | ~96% | Current only |

**Important:** The Google Healthcare API DICOM store only replicates data from `idc-open-data`. Data in `idc-open-data-two` and `idc-open-data-cr` (approximately 4% of total) is not available via Google Healthcare DICOMweb endpoint.

## Best Practices

- **Use `idc-index` for discovery**: Query metadata first, then access buckets with known UUIDs
- **Download defaults to AWS buckets**: request GCS if needed
- **Save manifests**: Store the `series_aws_url` or `crdc_series_uuid` values for reproducibility
- **Check licenses**: Query `license_short_name` before commercial use; CC-NC data requires non-commercial use
- **Use current version unless reproducing**: The `index` table has current data; use `prior_versions_index` only for exact reproducibility

## Troubleshooting

### Issue: "Access Denied" when accessing buckets
- **Cause:** Using signed requests or wrong bucket name
- **Solution:** Use `--no-sign-request` flag with AWS CLI, or `anon=True` with Python libraries

### Issue: File not found at expected path
- **Cause:** Using DICOM UID instead of CRDC UUID, or data changed in newer version
- **Solution:** Query `idc-index` for current `series_aws_url`, or check `prior_versions_index` for historical paths

### Issue: Downloaded files don't match expected series
- **Cause:** Series was revised in a newer IDC version
- **Solution:** Use `prior_versions_index` to find the exact version you need; compare `crdc_series_uuid` values

### Issue: Some data missing from Google Healthcare DICOMweb
- **Cause:** Google Healthcare only mirrors `idc-open-data` bucket (~96% of data)
- **Solution:** Use IDC public proxy for 100% coverage, or access buckets directly

## Resources

**IDC Documentation:**
- [Files and metadata](https://learn.canceridc.dev/data/organization-of-data/files-and-metadata) - Bucket organization details
- [Data versioning](https://learn.canceridc.dev/data/data-versioning) - Versioning scheme explanation
- [Resolving GUIDs and UUIDs](https://learn.canceridc.dev/data/organization-of-data/guids-and-uuids) - CRDC UUID documentation
- [Direct loading from cloud](https://learn.canceridc.dev/data/downloading-data/direct-loading) - Python examples for cloud access

**AWS Resources:**
- [NCI IDC on AWS Open Data Registry](https://registry.opendata.aws/nci-imaging-data-commons/) - Bucket ARNs and access info
- [s5cmd](https://github.com/peak/s5cmd) - High-performance S3 client (used internally by idc-index)
- [AWS CLI S3 commands](https://docs.aws.amazon.com/cli/latest/reference/s3/) - Standard AWS command-line interface
- [Boto3 S3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3.html) - AWS SDK for Python

**Google Cloud Resources:**
- [gsutil tool](https://cloud.google.com/storage/docs/gsutil) - Google Cloud Storage command-line tool
- [gcloud storage commands](https://cloud.google.com/sdk/gcloud/reference/storage) - Modern GCS CLI (recommended over gsutil)
- [Google Cloud Storage Python client](https://cloud.google.com/python/docs/reference/storage/latest) - GCS SDK for Python

**Related Guides:**
- `dicomweb_guide.md` - DICOMweb API access (alternative to direct bucket access)
- `bigquery_guide.md` - Advanced metadata queries including versioned datasets
