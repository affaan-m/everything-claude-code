# ClinVar API and Data Access Reference

## Overview

ClinVar provides multiple methods for programmatic data access:
- **E-utilities** - NCBI's REST API for searching and retrieving data
- **Entrez Direct** - Command-line tools for UNIX environments
- **FTP Downloads** - Bulk data files in XML, VCF, and tab-delimited formats
- **Submission API** - REST API for submitting variant interpretations

## E-utilities API

### Base URL
```
https://eutils.ncbi.nlm.nih.gov/entrez/eutils/
```

### Supported Operations

#### 1. esearch - Search for Records
Search ClinVar using the same query syntax as the web interface.

**Endpoint:**
```
https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi
```

**Parameters:**
- `db=clinvar` - Database name (required)
- `term=<query>` - Search query (required)
- `retmax=<N>` - Maximum records to return (default: 20)
- `retmode=json` - Return format (json or xml)
- `usehistory=y` - Store results on server for large datasets

**Example Query:**
```bash
# Search for BRCA1 pathogenic variants
curl "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=clinvar&term=BRCA1[gene]+AND+pathogenic[CLNSIG]&retmode=json&retmax=100"
```

**Common Search Fields:**
- `[gene]` - Gene symbol
- `[CLNSIG]` - Clinical significance (pathogenic, benign, etc.)
- `[disorder]` - Disease/condition name
- `[variant name]` - HGVS expression or variant identifier
- `[chr]` - Chromosome number
- `[Assembly]` - GRCh37 or GRCh38

#### 2. esummary - Retrieve Record Summaries
Get summary information for specific ClinVar records.

**Endpoint:**
```
https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi
```

**Parameters:**
- `db=clinvar` - Database name (required)
- `id=<UIDs>` - Comma-separated list of ClinVar UIDs
- `retmode=json` - Return format (json or xml)
- `version=2.0` - API version (recommended for JSON)

**Example:**
```bash
# Get summary for specific variant
curl "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=clinvar&id=12345&retmode=json&version=2.0"
```

**esummary Output Includes:**
- Accession (RCV/VCV)
- Clinical significance
- Review status
- Gene symbols
- Variant type
- Genomic locations (GRCh37 and GRCh38)
- Associated conditions
- Allele origin (germline/somatic)

#### 3. efetch - Retrieve Full Records
Download complete XML records for detailed analysis.

**Endpoint:**
```
https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi
```

**Parameters:**
- `db=clinvar` - Database name (required)
- `id=<UIDs>` - Comma-separated ClinVar UIDs
- `rettype=vcv` or `rettype=rcv` - Record type

**Example:**
```bash
# Fetch full VCV record
curl "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=clinvar&id=12345&rettype=vcv"
```

#### 4. elink - Find Related Records
Link ClinVar records to other NCBI databases.

**Endpoint:**
```
https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi
```

**Available Links:**
- clinvar_pubmed - Link to PubMed citations
- clinvar_gene - Link to Gene database
- clinvar_medgen - Link to MedGen (conditions)
- clinvar_snp - Link to dbSNP

**Example:**
```bash
# Find PubMed articles for a variant
curl "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?dbfrom=clinvar&db=pubmed&id=12345"
```

### Workflow Example: Complete Search and Retrieval

```bash
# Step 1: Search for variants
SEARCH_URL="https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=clinvar&term=CFTR[gene]+AND+pathogenic[CLNSIG]&retmode=json&retmax=10"

# Step 2: Parse IDs from search results
# (Extract id list from JSON response)

# Step 3: Retrieve summaries
SUMMARY_URL="https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=clinvar&id=<ids>&retmode=json&version=2.0"

# Step 4: Fetch full records if needed
FETCH_URL="https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=clinvar&id=<ids>&rettype=vcv"
```

## Entrez Direct (Command-Line)

Install Entrez Direct for command-line access:
```bash
sh -c "$(curl -fsSL ftp://ftp.ncbi.nlm.nih.gov/entrez/entrezdirect/install-edirect.sh)"
```

### Common Commands

**Search:**
```bash
esearch -db clinvar -query "BRCA1[gene] AND pathogenic[CLNSIG]"
```

**Pipeline Search to Summary:**
```bash
esearch -db clinvar -query "TP53[gene]" | \
  efetch -format docsum | \
  xtract -pattern DocumentSummary -element AccessionVersion Title
```

**Count Results:**
```bash
esearch -db clinvar -query "breast cancer[disorder]" | \
  efilter -status reviewed | \
  efetch -format docsum
```

## Rate Limits and Best Practices

### Rate Limits
- **Without API Key:** 3 requests/second
- **With API Key:** 10 requests/second
- Large datasets: Use `usehistory=y` to avoid repeated queries

### API Key Setup
1. Register for NCBI account at https://www.ncbi.nlm.nih.gov/account/
2. Generate API key in account settings
3. Add `&api_key=<YOUR_KEY>` to all requests

### Best Practices
- Test queries on web interface before automation
- Use `usehistory` for large result sets (>500 records)
- Implement exponential backoff for rate limit errors
- Cache results when appropriate
- Use batch requests instead of individual queries
- Respect NCBI servers - don't submit large jobs during peak US hours

## Python Example with Biopython

```python
from Bio import Entrez

# Set email (required by NCBI)
Entrez.email = "your.email@example.com"

# Search ClinVar
def search_clinvar(query, retmax=100):
    handle = Entrez.esearch(db="clinvar", term=query, retmax=retmax)
    record = Entrez.read(handle)
    handle.close()
    return record["IdList"]

# Get summaries
def get_summaries(id_list):
    ids = ",".join(id_list)
    handle = Entrez.esummary(db="clinvar", id=ids, retmode="json")
    record = Entrez.read(handle)
    handle.close()
    return record

# Example usage
variant_ids = search_clinvar("BRCA2[gene] AND pathogenic[CLNSIG]")
summaries = get_summaries(variant_ids)
```

## Error Handling

### Common HTTP Status Codes
- `200` - Success
- `400` - Bad request (check query syntax)
- `429` - Too many requests (rate limited)
- `500` - Server error (retry with exponential backoff)

### Error Response Example
```xml
<ERROR>Empty id list - nothing to do</ERROR>
```

## Additional Resources

- NCBI E-utilities documentation: https://www.ncbi.nlm.nih.gov/books/NBK25501/
- ClinVar web services: https://www.ncbi.nlm.nih.gov/clinvar/docs/maintenance_use/
- Entrez Direct cookbook: https://www.ncbi.nlm.nih.gov/books/NBK179288/
