# ENA API Reference

Comprehensive reference for the European Nucleotide Archive REST APIs.

## ENA Portal API

**Base URL:** `https://www.ebi.ac.uk/ena/portal/api`

**Official Documentation:** https://www.ebi.ac.uk/ena/portal/api/doc

### Search Endpoint

**Endpoint:** `/search`

**Method:** GET

**Description:** Perform advanced searches across ENA data types with flexible filtering and formatting options.

**Parameters:**

| Parameter | Required | Description | Example |
|-----------|----------|-------------|---------|
| `result` | Yes | Data type to search | `sample`, `study`, `read_run`, `assembly`, `sequence`, `analysis`, `taxon` |
| `query` | Yes | Search query using ENA query syntax | `tax_eq(9606)`, `study_accession="PRJNA123456"` |
| `format` | No | Output format (default: tsv) | `json`, `tsv`, `xml` |
| `fields` | No | Comma-separated list of fields to return | `accession,sample_title,scientific_name` |
| `limit` | No | Maximum number of results (default: 100000) | `10`, `1000` |
| `offset` | No | Result offset for pagination | `0`, `100` |
| `sortFields` | No | Fields to sort by (comma-separated) | `accession`, `collection_date` |
| `sortOrder` | No | Sort direction | `asc`, `desc` |
| `dataPortal` | No | Restrict to specific data portal | `ena`, `pathogen`, `metagenome` |
| `download` | No | Trigger file download | `true`, `false` |
| `includeAccessions` | No | Comma-separated accessions to include | `SAMN01,SAMN02` |
| `excludeAccessions` | No | Comma-separated accessions to exclude | `SAMN03,SAMN04` |

**Query Syntax:**

ENA uses a specialized query language with operators:

- **Equality:** `field_name="value"` or `field_name=value`
- **Wildcards:** `field_name="*partial*"` (use * for wildcard)
- **Range:** `field_name>=value AND field_name<=value`
- **Logical:** `query1 AND query2`, `query1 OR query2`, `NOT query`
- **Taxonomy:** `tax_eq(taxon_id)` - exact match, `tax_tree(taxon_id)` - includes descendants
- **Date ranges:** `collection_date>=2020-01-01 AND collection_date<=2023-12-31`
- **In operator:** `study_accession IN (PRJNA1,PRJNA2,PRJNA3)`

**Common Result Types:**

- `study` - Research projects/studies
- `sample` - Biological samples
- `read_run` - Raw sequencing runs
- `read_experiment` - Sequencing experiment metadata
- `analysis` - Analysis results
- `assembly` - Genome/transcriptome assemblies
- `sequence` - Assembled sequences
- `taxon` - Taxonomic records
- `coding` - Protein coding sequences
- `noncoding` - Non-coding sequences

**Example Requests:**

```python
import requests

# Search for human samples
url = "https://www.ebi.ac.uk/ena/portal/api/search"
params = {
    "result": "sample",
    "query": "tax_eq(9606)",
    "format": "json",
    "fields": "accession,sample_title,collection_date",
    "limit": 100
}
response = requests.get(url, params=params)

# Search for RNA-seq experiments in a study
params = {
    "result": "read_experiment",
    "query": 'study_accession="PRJNA123456" AND library_strategy="RNA-Seq"',
    "format": "tsv"
}
response = requests.get(url, params=params)

# Find assemblies for E. coli with minimum contig N50
params = {
    "result": "assembly",
    "query": "tax_tree(562) AND contig_n50>=50000",
    "format": "json"
}
response = requests.get(url, params=params)
```

### Fields Endpoint

**Endpoint:** `/returnFields`

**Method:** GET

**Description:** List available fields for a specific result type.

**Parameters:**

| Parameter | Required | Description | Example |
|-----------|----------|-------------|---------|
| `result` | Yes | Data type | `sample`, `study`, `assembly` |
| `dataPortal` | No | Filter by data portal | `ena`, `pathogen` |

**Example:**

```python
# Get all available fields for samples
url = "https://www.ebi.ac.uk/ena/portal/api/returnFields"
params = {"result": "sample"}
response = requests.get(url, params=params)
fields = response.json()
```

### Results Endpoint

**Endpoint:** `/results`

**Method:** GET

**Description:** List available result types.

**Example:**

```python
url = "https://www.ebi.ac.uk/ena/portal/api/results"
response = requests.get(url)
```

### File Report Endpoint

**Endpoint:** `/filereport`

**Method:** GET

**Description:** Get file information and download URLs for reads and analyses.

**Parameters:**

| Parameter | Required | Description | Example |
|-----------|----------|-------------|---------|
| `accession` | Yes | Run or analysis accession | `ERR123456` |
| `result` | Yes | Must be `read_run` or `analysis` | `read_run` |
| `format` | No | Output format | `json`, `tsv` |
| `fields` | No | Fields to include | `run_accession,fastq_ftp,fastq_md5` |

**Common File Report Fields:**

- `run_accession` - Run accession number
- `fastq_ftp` - FTP URLs for FASTQ files (semicolon-separated)
- `fastq_aspera` - Aspera URLs for FASTQ files
- `fastq_md5` - MD5 checksums (semicolon-separated)
- `fastq_bytes` - File sizes in bytes (semicolon-separated)
- `submitted_ftp` - FTP URLs for originally submitted files
- `sra_ftp` - FTP URL for SRA format file

**Example:**

```python
# Get FASTQ download URLs for a run
url = "https://www.ebi.ac.uk/ena/portal/api/filereport"
params = {
    "accession": "ERR123456",
    "result": "read_run",
    "format": "json",
    "fields": "run_accession,fastq_ftp,fastq_md5,fastq_bytes"
}
response = requests.get(url, params=params)
file_info = response.json()

# Download FASTQ files
for ftp_url in file_info[0]['fastq_ftp'].split(';'):
    # Download from ftp://ftp.sra.ebi.ac.uk/...
    pass
```

## ENA Browser API

**Base URL:** `https://www.ebi.ac.uk/ena/browser/api`

**Official Documentation:** https://www.ebi.ac.uk/ena/browser/api/doc

### XML Retrieval

**Endpoint:** `/xml/{accession}`

**Method:** GET

**Description:** Retrieve record metadata in XML format.

**Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `accession` | Path | Record accession number | `PRJNA123456`, `SAMEA123456`, `ERR123456` |
| `download` | Query | Set to `true` to trigger download | `true` |
| `includeLinks` | Query | Include cross-reference links | `true`, `false` |

**Example:**

```python
# Get sample metadata in XML
accession = "SAMEA123456"
url = f"https://www.ebi.ac.uk/ena/browser/api/xml/{accession}"
response = requests.get(url)
xml_data = response.text

# Get study with cross-references
url = f"https://www.ebi.ac.uk/ena/browser/api/xml/PRJNA123456"
params = {"includeLinks": "true"}
response = requests.get(url, params=params)
```

### Text Retrieval

**Endpoint:** `/text/{accession}`

**Method:** GET

**Description:** Retrieve sequences in EMBL flat file format.

**Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `accession` | Path | Sequence accession | `LN847353` |
| `download` | Query | Trigger download | `true` |
| `expandDataclasses` | Query | Include related data classes | `true` |
| `lineLimit` | Query | Limit output lines | `1000` |

**Example:**

```python
# Get sequence in EMBL format
url = "https://www.ebi.ac.uk/ena/browser/api/text/LN847353"
response = requests.get(url)
embl_format = response.text
```

### FASTA Retrieval

**Endpoint:** `/fasta/{accession}`

**Method:** GET

**Description:** Retrieve sequences in FASTA format.

**Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `accession` | Path | Sequence accession | `LN847353` |
| `download` | Query | Trigger download | `true` |
| `range` | Query | Subsequence range | `100-500` |
| `lineLimit` | Query | Limit output lines | `1000` |

**Example:**

```python
# Get full sequence
url = "https://www.ebi.ac.uk/ena/browser/api/fasta/LN847353"
response = requests.get(url)
fasta_data = response.text

# Get subsequence
url = "https://www.ebi.ac.uk/ena/browser/api/fasta/LN847353"
params = {"range": "1000-2000"}
response = requests.get(url, params=params)
```

### Links Retrieval

**Endpoint:** `/links/{source}/{accession}`

**Method:** GET

**Description:** Get cross-references to external databases.

**Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `source` | Path | Source database type | `sample`, `study`, `sequence` |
| `accession` | Path | Accession number | `SAMEA123456` |
| `target` | Query | Target database filter | `sra`, `biosample` |

**Example:**

```python
# Get all links for a sample
url = "https://www.ebi.ac.uk/ena/browser/api/links/sample/SAMEA123456"
response = requests.get(url)
```

## ENA Taxonomy REST API

**Base URL:** `https://www.ebi.ac.uk/ena/taxonomy/rest`

**Description:** Query taxonomic information including lineage and rank.

### Tax ID Lookup

**Endpoint:** `/tax-id/{taxon_id}`

**Method:** GET

**Description:** Get taxonomic information by NCBI taxonomy ID.

**Example:**

```python
# Get E. coli taxonomy
taxon_id = "562"
url = f"https://www.ebi.ac.uk/ena/taxonomy/rest/tax-id/{taxon_id}"
response = requests.get(url)
taxonomy = response.json()
# Returns: taxId, scientificName, commonName, rank, lineage, etc.
```

### Scientific Name Lookup

**Endpoint:** `/scientific-name/{name}`

**Method:** GET

**Description:** Search by scientific name (may return multiple matches).

**Example:**

```python
# Search by scientific name
name = "Escherichia coli"
url = f"https://www.ebi.ac.uk/ena/taxonomy/rest/scientific-name/{name}"
response = requests.get(url)
```

### Suggest Names

**Endpoint:** `/suggest-for-submission/{partial_name}`

**Method:** GET

**Description:** Get taxonomy suggestions for submission (autocomplete).

**Example:**

```python
# Get suggestions
partial = "Escheri"
url = f"https://www.ebi.ac.uk/ena/taxonomy/rest/suggest-for-submission/{partial}"
response = requests.get(url)
```

## Cross-Reference Service

**Base URL:** `https://www.ebi.ac.uk/ena/xref/rest`

**Description:** Access records related to ENA entries in external databases.

### Get Cross-References

**Endpoint:** `/json/{source}/{accession}`

**Method:** GET

**Description:** Retrieve cross-references in JSON format.

**Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `source` | Path | Source database | `ena`, `sra` |
| `accession` | Path | Accession number | `SRR000001` |

**Example:**

```python
# Get cross-references for an SRA accession
url = "https://www.ebi.ac.uk/ena/xref/rest/json/sra/SRR000001"
response = requests.get(url)
xrefs = response.json()
```

## CRAM Reference Registry

**Base URL:** `https://www.ebi.ac.uk/ena/cram`

**Description:** Retrieve reference sequences used in CRAM files.

### MD5 Lookup

**Endpoint:** `/md5/{md5_checksum}`

**Method:** GET

**Description:** Retrieve reference sequence by MD5 checksum.

**Example:**

```python
# Get reference by MD5
md5 = "7c3f69f0c5f0f0de6d7c34e7c2e25f5c"
url = f"https://www.ebi.ac.uk/ena/cram/md5/{md5}"
response = requests.get(url)
reference_fasta = response.text
```

## Rate Limiting and Error Handling

**Rate Limits:**
- Maximum: 50 requests per second
- Exceeding limit returns HTTP 429 (Too Many Requests)
- Implement exponential backoff when receiving 429 responses

**Common HTTP Status Codes:**

- `200 OK` - Success
- `204 No Content` - Success but no data returned
- `400 Bad Request` - Invalid parameters
- `404 Not Found` - Accession not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error (retry with backoff)

**Error Handling Pattern:**

```python
import time
import requests
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

def create_session_with_retries():
    """Create requests session with retry logic"""
    session = requests.Session()
    retries = Retry(
        total=5,
        backoff_factor=1,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["GET", "POST"]
    )
    adapter = HTTPAdapter(max_retries=retries)
    session.mount("https://", adapter)
    return session

# Usage
session = create_session_with_retries()
response = session.get(url, params=params)
```

## Bulk Download Recommendations

For downloading large numbers of files or large datasets:

1. **Use FTP directly** instead of API for file downloads
   - Base FTP: `ftp://ftp.sra.ebi.ac.uk/vol1/fastq/`
   - Aspera for high-speed: `era-fasp@fasp.sra.ebi.ac.uk:`

2. **Use enaBrowserTools** command-line utility
   ```bash
   # Download by accession
   enaDataGet ERR123456

   # Download all runs from a study
   enaGroupGet PRJEB1234
   ```

3. **Batch API requests** with proper delays
   ```python
   import time

   accessions = ["ERR001", "ERR002", "ERR003"]
   for acc in accessions:
       response = requests.get(f"{base_url}/xml/{acc}")
       # Process response
       time.sleep(0.02)  # 50 req/sec = 0.02s between requests
   ```

## Query Optimization Tips

1. **Use specific result types** instead of broad searches
2. **Limit fields** to only what you need using `fields` parameter
3. **Use pagination** for large result sets (limit + offset)
4. **Cache taxonomy lookups** locally
5. **Prefer JSON/TSV** over XML when possible (smaller, faster)
6. **Use includeAccessions/excludeAccessions** to filter large result sets efficiently
7. **Batch similar queries** together when possible
