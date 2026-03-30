# idc-index Command Line Interface Guide

The `idc-index` package provides command-line tools for downloading DICOM data from the NCI Imaging Data Commons without writing Python code.

## Installation

```bash
pip install --upgrade idc-index
```

After installation, the `idc` command is available in your terminal.

## Available Commands

| Command | Purpose |
|---------|---------|
| `idc download` | General-purpose download with auto-detection of input type |
| `idc download-from-manifest` | Download from manifest file with validation and progress tracking |
| `idc download-from-selection` | Filter-based download with multiple criteria |

---

## idc download

General-purpose download command that intelligently interprets input. It determines whether the input corresponds to a manifest file path or a list of identifiers (collection_id, PatientID, StudyInstanceUID, SeriesInstanceUID, crdc_series_uuid).

### Usage

```bash
# Download entire collection
idc download rider_pilot --download-dir ./data

# Download specific series by UID
idc download "1.3.6.1.4.1.9328.50.1.69736" --download-dir ./data

# Download multiple items (comma-separated)
idc download "tcga_luad,tcga_lusc" --download-dir ./data

# Download from manifest file (auto-detected by file extension)
idc download manifest.txt --download-dir ./data
```

### Options

| Option | Description |
|--------|-------------|
| `--download-dir` | Destination directory (default: current directory) |
| `--dir-template` | Directory hierarchy template (default: `%collection_id/%PatientID/%StudyInstanceUID/%Modality_%SeriesInstanceUID`) |
| `--log-level` | Verbosity: debug, info, warning, error, critical |

### Directory Template Variables

Use these variables in `--dir-template` to organize downloads:

- `%collection_id` - Collection identifier
- `%PatientID` - Patient identifier
- `%StudyInstanceUID` - Study UID
- `%SeriesInstanceUID` - Series UID
- `%Modality` - Imaging modality (CT, MR, PT, etc.)

**Examples:**

```bash
# Flat structure (all files in one directory)
idc download rider_pilot --download-dir ./data --dir-template ""

# Simplified hierarchy
idc download rider_pilot --download-dir ./data --dir-template "%collection_id/%PatientID/%Modality"
```

---

## idc download-from-manifest

Specialized for downloading from manifest files with built-in validation, progress tracking, and resume capability.

### Usage

```bash
# Basic download from manifest
idc download-from-manifest --manifest-file cohort.txt --download-dir ./data

# With progress bar and validation
idc download-from-manifest --manifest-file cohort.txt --download-dir ./data --show-progress-bar

# Resume interrupted download with s5cmd sync
idc download-from-manifest --manifest-file cohort.txt --download-dir ./data --use-s5cmd-sync
```

### Options

| Option | Description |
|--------|-------------|
| `--manifest-file` | **Required.** Path to manifest file containing S3 URLs |
| `--download-dir` | **Required.** Destination directory |
| `--validate-manifest` | Validate manifest before download (enabled by default) |
| `--show-progress-bar` | Display download progress |
| `--use-s5cmd-sync` | Enable resumable downloads - skips already-downloaded files |
| `--quiet` | Suppress subprocess output |
| `--dir-template` | Directory hierarchy template |
| `--log-level` | Logging verbosity |

### Manifest File Format

Manifest files contain S3 URLs, one per line:

```
s3://idc-open-data/cb09464a-c5cc-4428-9339-d7fa87cfe837/*
s3://idc-open-data/88f3990d-bdef-49cd-9b2b-4787767240f2/*
```

**How to get a manifest file:**

1. **IDC Portal**: Export cohort selection as manifest
2. **Python query**: Generate from SQL results

```python
from idc_index import IDCClient

client = IDCClient()
results = client.sql_query("""
    SELECT series_aws_url
    FROM index
    WHERE collection_id = 'rider_pilot' AND Modality = 'CT'
""")

with open('ct_manifest.txt', 'w') as f:
    for url in results['series_aws_url']:
        f.write(url + '\n')
```

---

## idc download-from-selection

Download data using filter criteria. Filters are applied sequentially.

### Usage

```bash
# Download by collection
idc download-from-selection --collection-id rider_pilot --download-dir ./data

# Download specific series
idc download-from-selection --series-instance-uid "1.3.6.1.4.1.9328.50.1.69736" --download-dir ./data

# Multiple filters
idc download-from-selection --collection-id nlst --patient-id "100004" --download-dir ./data

# Dry run - see what would be downloaded without actually downloading
idc download-from-selection --collection-id tcga_luad --dry-run --download-dir ./data
```

### Options

| Option | Description |
|--------|-------------|
| `--download-dir` | **Required.** Destination directory |
| `--collection-id` | Filter by collection identifier |
| `--patient-id` | Filter by patient identifier |
| `--study-instance-uid` | Filter by study UID |
| `--series-instance-uid` | Filter by series UID |
| `--crdc-series-uuid` | Filter by CRDC UUID |
| `--dry-run` | Calculate cohort size without downloading |
| `--show-progress-bar` | Display download progress |
| `--use-s5cmd-sync` | Enable resumable downloads |
| `--dir-template` | Directory hierarchy template |

### Dry Run for Size Estimation

Use `--dry-run` to estimate download size before committing:

```bash
idc download-from-selection --collection-id nlst --dry-run --download-dir ./data
```

This shows:
- Number of series matching filters
- Total download size
- No files are downloaded

---

## Common Workflows

### 1. Download Small Collection for Testing

```bash
# rider_pilot is ~1GB - good for testing
idc download rider_pilot --download-dir ./test_data
```

### 2. Large Dataset with Progress and Resume

```bash
# Use s5cmd sync for large downloads - can resume if interrupted
idc download-from-selection \
    --collection-id nlst \
    --download-dir ./nlst_data \
    --show-progress-bar \
    --use-s5cmd-sync
```

### 3. Estimate Size Before Download

```bash
# Check size first
idc download-from-selection --collection-id tcga_luad --dry-run --download-dir ./data

# Then download if size is acceptable
idc download-from-selection --collection-id tcga_luad --download-dir ./data
```

### 4. Download Specific Modality via Python + CLI

```python
# First, query for series UIDs in Python
from idc_index import IDCClient

client = IDCClient()
results = client.sql_query("""
    SELECT SeriesInstanceUID
    FROM index
    WHERE collection_id = 'nlst'
      AND Modality = 'CT'
      AND BodyPartExamined = 'CHEST'
    LIMIT 50
""")

# Save to manifest
results['SeriesInstanceUID'].to_csv('my_series.csv', index=False, header=False)
```

```bash
# Then download via CLI
idc download my_series.csv --download-dir ./lung_ct
```

---

## Built-in Safety Features

The CLI includes several safety features:

- **Disk space checking**: Verifies sufficient space before starting downloads
- **Manifest validation**: Validates manifest file format by default
- **Progress tracking**: Optional progress bar for monitoring large downloads
- **Resume capability**: Use `--use-s5cmd-sync` to continue interrupted downloads

---

## Troubleshooting

### Download Interrupted

Use `--use-s5cmd-sync` to resume:

```bash
idc download-from-manifest --manifest-file cohort.txt --download-dir ./data --use-s5cmd-sync
```

### Connection Timeout

For unstable networks, download in smaller batches using Python to generate multiple manifests, then download sequentially.

---

## See Also

- [idc-index Documentation](https://idc-index.readthedocs.io/)
- [IDC Portal](https://portal.imaging.datacommons.cancer.gov/) - Interactive cohort building
- [IDC Tutorials](https://github.com/ImagingDataCommons/IDC-Tutorials)
