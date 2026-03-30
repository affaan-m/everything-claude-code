# DICOMweb Guide for IDC

IDC provides DICOMweb access through Google Cloud Healthcare API DICOM stores. This guide covers the implementation specifics and usage patterns.

## When to Use DICOMweb

Use DICOMweb when you need:
- Integration with PACS systems or DICOMweb-compatible tools
- Streaming metadata without downloading full files
- Building custom viewers or web applications
- Using existing DICOMweb client libraries (OHIF, dicomweb-client, etc.)

For most use cases, `idc-index` is simpler and recommended. Use DICOMweb when you specifically need the DICOMweb protocol.

## Endpoints

### Public Proxy (No Authentication)

```
https://proxy.imaging.datacommons.cancer.gov/current/viewer-only-no-downloads-see-tinyurl-dot-com-slash-3j3d9jyp/dicomWeb
```

- **100% data coverage** - Contains all IDC data from all storage buckets
- Points to the latest IDC version automatically
- **Updates immediately** on new IDC releases
- Per-IP daily quota (suitable for testing and moderate use)
- No authentication required
- Read-only access
- Note: "viewer-only-no-downloads" in URL is legacy naming with no functional meaning

### Google Healthcare API (Requires Authentication)

```
https://healthcare.googleapis.com/v1/projects/nci-idc-data/locations/us-central1/datasets/idc/dicomStores/idc-store-v{VERSION}/dicomWeb
```

Replace `{VERSION}` with the IDC release number. To find the current version:

```python
from idc_index import IDCClient
client = IDCClient()
print(client.get_idc_version())  # e.g., "23" for v23
```

- **~96% data coverage** - Only replicates data from `idc-open-data` bucket (missing ~4% from other buckets)
- **Updates 1-2 weeks after** IDC releases
- Requires authentication and provides higher quotas
- Better performance (no proxy routing)
- Each release gets a new versioned store

See [Content Coverage Differences](#content-coverage-differences) and [Authentication](#authentication-for-google-healthcare-api) sections below.

## Content Coverage Differences

**Important:** The two DICOMweb endpoints have different data coverage. The IDC public proxy contains MORE data than the authenticated Google Healthcare endpoint.

### Coverage Summary

| Endpoint | Coverage | Missing Data |
|----------|----------|--------------|
| **IDC Public Proxy** | 100% | None |
| **Google Healthcare API** | ~96% | ~4% (two buckets not replicated) |

### What's Missing from Google Healthcare?

The Google Healthcare DICOM store **only replicates data from the `idc-open-data` S3 bucket**. It does not include data from two additional buckets:

- `idc-open-data-cr`
- `idc-open-data-two`

These missing buckets typically contain several thousand series each, representing approximately 4% of total IDC data. The exact counts vary by IDC version.

See `cloud_storage_guide.md` for details on bucket organization, file structure, and direct access methods.

### Update Timing

- **IDC Public Proxy**: Updates immediately when new IDC versions are released
- **Google Healthcare**: Updates 1-2 weeks after each new IDC version release

Between releases, both endpoints remain current. The 1-2 week delay only occurs during the transition period after a new IDC version is published.

**Warning from IDC documentation:** *"Google-hosted DICOM store may not contain the latest version of IDC data!"* - Check during the weeks following a new release.

### Choosing the Right Endpoint

**Use IDC Public Proxy when:**
- You need complete data coverage (100%)
- You need the absolute latest data immediately after a new version release
- You don't want to set up GCP authentication
- Your usage fits within per-IP quotas (can request increases via support@canceridc.dev)
- You're accessing slide microscopy images frame-by-frame

**Use Google Healthcare API when:**
- The ~4% missing data doesn't affect your use case
- You need higher quotas for heavy usage
- You want better performance (direct access, no proxy routing)

### Checking Your Data Availability

Before choosing an endpoint, verify whether your data might be in the missing buckets:

```python
from idc_index import IDCClient

client = IDCClient()

# Check which buckets contain your collection's data
results = client.sql_query("""
    SELECT series_aws_url, COUNT(*) as series_count
    FROM index
    WHERE collection_id = 'your_collection_id'
    GROUP BY series_aws_url
""")

print(results)

# Look for URLs containing 'idc-open-data-cr' or 'idc-open-data-two'
# If present, that data won't be available in Google Healthcare endpoint
```

## Implementation Details

IDC DICOMweb is provided through Google Cloud Healthcare API DICOM stores. The implementation follows DICOM PS3.18 Web Services with specific characteristics documented in the [Google Healthcare DICOM conformance statement](https://docs.cloud.google.com/healthcare-api/docs/dicom).

### Supported Operations

| Service | Description | Supported |
|---------|-------------|-----------|
| QIDO-RS | Search for DICOM objects | Yes |
| WADO-RS | Retrieve DICOM objects and metadata | Yes |
| STOW-RS | Store DICOM objects | No (IDC is read-only) |

**Not supported:** URI Service, Worklist Service, Non-Patient Instance Service, Capabilities Transactions

### Searchable DICOM Tags (QIDO-RS)

The implementation supports a limited set of searchable tags:

| Level | Searchable Tags |
|-------|-----------------|
| Study | StudyInstanceUID, PatientName, PatientID, AccessionNumber, ReferringPhysicianName, StudyDate |
| Series | All study tags + SeriesInstanceUID, Modality |
| Instance | All series tags + SOPInstanceUID |

**Important:** Only exact matching is supported, except for:
- StudyDate: supports range queries
- PatientName: supports fuzzy matching

### Query Limitations

- Maximum results: 5,000 for studies/series searches; 50,000 for instances
- Maximum offset: 1,000,000
- DICOM sequence tags larger than ~1 MB are not returned in metadata (BulkDataURI provided instead)

## Code Examples

All examples use the public proxy endpoint. For authenticated access to Google Healthcare, see the [authentication section](#authentication-for-google-healthcare-api).

### Finding UIDs with idc-index

Use `idc-index` to discover data, then use DICOMweb for metadata access:

```python
from idc_index import IDCClient

client = IDCClient()

# Find studies of interest
results = client.sql_query("""
    SELECT StudyInstanceUID, SeriesInstanceUID, PatientID, Modality
    FROM index
    WHERE collection_id = 'tcga_luad' AND Modality = 'CT'
    LIMIT 5
""")

# Use these UIDs with DICOMweb
study_uid = results.iloc[0]['StudyInstanceUID']
series_uid = results.iloc[0]['SeriesInstanceUID']
print(f"Study: {study_uid}")
print(f"Series: {series_uid}")
```

### QIDO-RS: Search by UID

```python
import requests

base_url = "https://proxy.imaging.datacommons.cancer.gov/current/viewer-only-no-downloads-see-tinyurl-dot-com-slash-3j3d9jyp/dicomWeb"

# Search for a specific study
study_uid = "1.3.6.1.4.1.14519.5.2.1.6450.9002.307623500513044641407722230440"
response = requests.get(
    f"{base_url}/studies",
    params={"StudyInstanceUID": study_uid},
    headers={"Accept": "application/dicom+json"}
)

if response.status_code == 200:
    studies = response.json()
    print(f"Found {len(studies)} study")
```

### QIDO-RS: List Series in a Study

```python
import requests

base_url = "https://proxy.imaging.datacommons.cancer.gov/current/viewer-only-no-downloads-see-tinyurl-dot-com-slash-3j3d9jyp/dicomWeb"
study_uid = "1.3.6.1.4.1.14519.5.2.1.6450.9002.307623500513044641407722230440"

response = requests.get(
    f"{base_url}/studies/{study_uid}/series",
    headers={"Accept": "application/dicom+json"}
)

if response.status_code == 200:
    series_list = response.json()
    for series in series_list:
        # DICOM tags are returned as hex codes
        series_uid = series.get("0020000E", {}).get("Value", [None])[0]
        modality = series.get("00080060", {}).get("Value", [None])[0]
        description = series.get("0008103E", {}).get("Value", [""])[0]
        print(f"{modality}: {description}")
```

### QIDO-RS: List Instances in a Series

```python
import requests

base_url = "https://proxy.imaging.datacommons.cancer.gov/current/viewer-only-no-downloads-see-tinyurl-dot-com-slash-3j3d9jyp/dicomWeb"
study_uid = "1.3.6.1.4.1.14519.5.2.1.6450.9002.307623500513044641407722230440"
series_uid = "1.3.6.1.4.1.14519.5.2.1.6450.9002.217441095430480124587725641302"

response = requests.get(
    f"{base_url}/studies/{study_uid}/series/{series_uid}/instances",
    params={"limit": 10},
    headers={"Accept": "application/dicom+json"}
)

if response.status_code == 200:
    instances = response.json()
    print(f"Found {len(instances)} instances")
    for inst in instances[:3]:
        sop_uid = inst.get("00080018", {}).get("Value", [None])[0]
        print(f"  SOPInstanceUID: {sop_uid}")
```

### WADO-RS: Retrieve Series Metadata

```python
import requests

base_url = "https://proxy.imaging.datacommons.cancer.gov/current/viewer-only-no-downloads-see-tinyurl-dot-com-slash-3j3d9jyp/dicomWeb"
study_uid = "1.3.6.1.4.1.14519.5.2.1.6450.9002.307623500513044641407722230440"
series_uid = "1.3.6.1.4.1.14519.5.2.1.6450.9002.217441095430480124587725641302"

response = requests.get(
    f"{base_url}/studies/{study_uid}/series/{series_uid}/metadata",
    headers={"Accept": "application/dicom+json"}
)

if response.status_code == 200:
    instances = response.json()
    print(f"Retrieved metadata for {len(instances)} instances")

    # Extract image dimensions from first instance
    if instances:
        inst = instances[0]
        rows = inst.get("00280010", {}).get("Value", [None])[0]
        cols = inst.get("00280011", {}).get("Value", [None])[0]
        print(f"Image dimensions: {rows} x {cols}")
```

### Combined Workflow: idc-index Discovery + DICOMweb Metadata

```python
from idc_index import IDCClient
import requests

# Use idc-index for efficient discovery
idc = IDCClient()
results = idc.sql_query("""
    SELECT StudyInstanceUID, SeriesInstanceUID, Modality, SeriesDescription
    FROM index
    WHERE collection_id = 'nlst' AND Modality = 'CT'
    LIMIT 1
""")

study_uid = results.iloc[0]['StudyInstanceUID']
series_uid = results.iloc[0]['SeriesInstanceUID']
print(f"Found: {results.iloc[0]['SeriesDescription']}")

# Use DICOMweb to stream metadata without downloading files
base_url = "https://proxy.imaging.datacommons.cancer.gov/current/viewer-only-no-downloads-see-tinyurl-dot-com-slash-3j3d9jyp/dicomWeb"

response = requests.get(
    f"{base_url}/studies/{study_uid}/series/{series_uid}/metadata",
    headers={"Accept": "application/dicom+json"}
)

if response.status_code == 200:
    metadata = response.json()
    print(f"Retrieved metadata for {len(metadata)} instances without downloading files")
```

## Common DICOM Tags Reference

DICOMweb returns tags as hexadecimal codes. Common tags:

| Tag | Name | Description |
|-----|------|-------------|
| 00080018 | SOPInstanceUID | Unique instance identifier |
| 00080020 | StudyDate | Date study was performed |
| 00080060 | Modality | Imaging modality (CT, MR, PT, etc.) |
| 0008103E | SeriesDescription | Description of series |
| 00100020 | PatientID | Patient identifier |
| 0020000D | StudyInstanceUID | Unique study identifier |
| 0020000E | SeriesInstanceUID | Unique series identifier |
| 00280010 | Rows | Image height in pixels |
| 00280011 | Columns | Image width in pixels |

## Authentication for Google Healthcare API

To use the Google Healthcare endpoint with higher quotas:

```python
from google.auth import default
from google.auth.transport.requests import Request
import requests

# Get credentials (requires gcloud auth)
credentials, project = default()
credentials.refresh(Request())

# Build authenticated request
base_url = "https://healthcare.googleapis.com/v1/projects/nci-idc-data/locations/us-central1/datasets/idc/dicomStores/idc-store-v23/dicomWeb"

response = requests.get(
    f"{base_url}/studies",
    params={"limit": 5},
    headers={
        "Authorization": f"Bearer {credentials.token}",
        "Accept": "application/dicom+json"
    }
)
```

**Prerequisites:**
1. Google Cloud SDK installed (`gcloud`)
2. Authenticated: `gcloud auth application-default login`
3. Account has access to public Google Cloud datasets

## Troubleshooting

### Issue: 400 Bad Request on search queries
- **Cause:** Using unsupported search parameters. The implementation only supports specific DICOM tags for filtering.
- **Solution:** Use UID-based queries (StudyInstanceUID, SeriesInstanceUID). For filtering by Modality or other attributes, use `idc-index` to discover UIDs first, then query DICOMweb with specific UIDs.

### Issue: 403 Forbidden on Google Healthcare endpoint
- **Cause:** Missing authentication or insufficient permissions
- **Solution:** Run `gcloud auth application-default login` and ensure your account has access

### Issue: 429 Too Many Requests
- **Cause:** Rate limit exceeded
- **Solution:** Add delays between requests, reduce `limit` values, or use authenticated endpoint for higher quotas

### Issue: 204 No Content for valid UIDs
- **Cause:** UID may be from an older IDC version not in current data, or data is in buckets not replicated by Google Healthcare
- **Solution:**
  - Verify UID exists using `idc-index` query first
  - Check if data is in `idc-open-data-cr` or `idc-open-data-two` buckets (not available in Google Healthcare endpoint)
  - Switch to IDC public proxy for 100% coverage
  - During new version releases, Google Healthcare may lag 1-2 weeks behind

### Issue: Large metadata responses slow to parse
- **Cause:** Series with many instances returns large JSON
- **Solution:** Use `limit` parameter on instance queries, or query specific instances by SOPInstanceUID

### Issue: Response missing expected attributes
- **Cause:** DICOM sequences larger than ~1 MB are excluded from metadata responses
- **Solution:** Retrieve the full DICOM instance using WADO-RS instance retrieval if you need all attributes

## Resources

**IDC Documentation:**
- [IDC DICOM Stores](https://learn.canceridc.dev/data/organization-of-data/dicom-stores) - Data coverage and bucket details
- [IDC DICOMweb Access](https://learn.canceridc.dev/data/downloading-data/dicomweb-access) - Endpoint usage and differences
- [IDC Proxy Policy](https://learn.canceridc.dev/portal/proxy-policy) - Quota policies and usage restrictions
- [IDC User Guide](https://learn.canceridc.dev/) - Complete documentation

**DICOMweb Standards and Tools:**
- [Google Healthcare DICOM Conformance Statement](https://docs.cloud.google.com/healthcare-api/docs/dicom)
- [DICOMweb Standard](https://www.dicomstandard.org/using/dicomweb)
- [dicomweb-client Python library](https://dicomweb-client.readthedocs.io/)

**Related Guides:**
- `cloud_storage_guide.md` - Direct bucket access, file organization, CRDC UUIDs, and versioning
- `bigquery_guide.md` - Advanced metadata queries with full DICOM attributes
