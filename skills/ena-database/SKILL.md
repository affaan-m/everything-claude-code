---
name: ena-database
description: Access European Nucleotide Archive via API/FTP. Retrieve DNA/RNA sequences, raw reads (FASTQ), genome assemblies by accession, for genomics and bioinformatics pipelines. Supports multiple formats.
license: Unknown
metadata:
    skill-author: K-Dense Inc.
---

# ENA Database

## Overview

The European Nucleotide Archive (ENA) is a comprehensive public repository for nucleotide sequence data and associated metadata. Access and query DNA/RNA sequences, raw reads, genome assemblies, and functional annotations through REST APIs and FTP for genomics and bioinformatics pipelines.

## When to Use This Skill

This skill should be used when:

- Retrieving nucleotide sequences or raw sequencing reads by accession
- Searching for samples, studies, or assemblies by metadata criteria
- Downloading FASTQ files or genome assemblies for analysis
- Querying taxonomic information for organisms
- Accessing sequence annotations and functional data
- Integrating ENA data into bioinformatics pipelines
- Performing cross-reference searches to related databases
- Bulk downloading datasets via FTP or Aspera

## Core Capabilities

### 1. Data Types and Structure

ENA organizes data into hierarchical object types:

**Studies/Projects** - Group related data and control release dates. Studies are the primary unit for citing archived data.

**Samples** - Represent units of biomaterial from which sequencing libraries were produced. Samples must be registered before submitting most data types.

**Raw Reads** - Consist of:
- **Experiments**: Metadata about sequencing methods, library preparation, and instrument details
- **Runs**: References to data files containing raw sequencing reads from a single sequencing run

**Assemblies** - Genome, transcriptome, metagenome, or metatranscriptome assemblies at various completion levels.

**Sequences** - Assembled and annotated sequences stored in the EMBL Nucleotide Sequence Database, including coding/non-coding regions and functional annotations.

**Analyses** - Results from computational analyses of sequence data.

**Taxonomy Records** - Taxonomic information including lineage and rank.

### 2. Programmatic Access

ENA provides multiple REST APIs for data access. Consult `references/api_reference.md` for detailed endpoint documentation.

**Key APIs:**

**ENA Portal API** - Advanced search functionality across all ENA data types
- Documentation: https://www.ebi.ac.uk/ena/portal/api/doc
- Use for complex queries and metadata searches

**ENA Browser API** - Direct retrieval of records and metadata
- Documentation: https://www.ebi.ac.uk/ena/browser/api/doc
- Use for downloading specific records by accession
- Returns data in XML format

**ENA Taxonomy REST API** - Query taxonomic information
- Access lineage, rank, and related taxonomic data

**ENA Cross Reference Service** - Access related records from external databases
- Endpoint: https://www.ebi.ac.uk/ena/xref/rest/

**CRAM Reference Registry** - Retrieve reference sequences
- Endpoint: https://www.ebi.ac.uk/ena/cram/
- Query by MD5 or SHA1 checksums

**Rate Limiting**: All APIs have a rate limit of 50 requests per second. Exceeding this returns HTTP 429 (Too Many Requests).

### 3. Searching and Retrieving Data

**Browser-Based Search:**
- Free text search across all fields
- Sequence similarity search (BLAST integration)
- Cross-reference search to find related records
- Advanced search with Rulespace query builder

**Programmatic Queries:**
- Use Portal API for advanced searches at scale
- Filter by data type, date range, taxonomy, or metadata fields
- Download results as tabulated metadata summaries or XML records

**Example API Query Pattern:**
```python
import requests

# Search for samples from a specific study
base_url = "https://www.ebi.ac.uk/ena/portal/api/search"
params = {
    "result": "sample",
    "query": "study_accession=PRJEB1234",
    "format": "json",
    "limit": 100
}

response = requests.get(base_url, params=params)
samples = response.json()
```

### 4. Data Retrieval Formats

**Metadata Formats:**
- XML (native ENA format)
- JSON (via Portal API)
- TSV/CSV (tabulated summaries)

**Sequence Data:**
- FASTQ (raw reads)
- BAM/CRAM (aligned reads)
- FASTA (assembled sequences)
- EMBL flat file format (annotated sequences)

**Download Methods:**
- Direct API download (small files)
- FTP for bulk data transfer
- Aspera for high-speed transfer of large datasets
- enaBrowserTools command-line utility for bulk downloads

### 5. Common Use Cases

**Retrieve raw sequencing reads by accession:**
```python
# Download run files using Browser API
accession = "ERR123456"
url = f"https://www.ebi.ac.uk/ena/browser/api/xml/{accession}"
```

**Search for all samples in a study:**
```python
# Use Portal API to list samples
study_id = "PRJNA123456"
url = f"https://www.ebi.ac.uk/ena/portal/api/search?result=sample&query=study_accession={study_id}&format=tsv"
```

**Find assemblies for a specific organism:**
```python
# Search assemblies by taxonomy
organism = "Escherichia coli"
url = f"https://www.ebi.ac.uk/ena/portal/api/search?result=assembly&query=tax_tree({organism})&format=json"
```

**Get taxonomic lineage:**
```python
# Query taxonomy API
taxon_id = "562"  # E. coli
url = f"https://www.ebi.ac.uk/ena/taxonomy/rest/tax-id/{taxon_id}"
```

### 6. Integration with Analysis Pipelines

**Bulk Download Pattern:**
1. Search for accessions matching criteria using Portal API
2. Extract file URLs from search results
3. Download files via FTP or using enaBrowserTools
4. Process downloaded data in pipeline

**BLAST Integration:**
Integrate with EBI's NCBI BLAST service (REST/SOAP API) for sequence similarity searches against ENA sequences.

### 7. Best Practices

**Rate Limiting:**
- Implement exponential backoff when receiving HTTP 429 responses
- Batch requests when possible to stay within 50 req/sec limit
- Use bulk download tools for large datasets instead of iterating API calls

**Data Citation:**
- Always cite using Study/Project accessions when publishing
- Include accession numbers for specific samples, runs, or assemblies used

**API Response Handling:**
- Check HTTP status codes before processing responses
- Parse XML responses using proper XML libraries (not regex)
- Handle pagination for large result sets

**Performance:**
- Use FTP/Aspera for downloading large files (>100MB)
- Prefer TSV/JSON formats over XML when only metadata is needed
- Cache taxonomy lookups locally when processing many records

## Resources

This skill includes detailed reference documentation for working with ENA:

### references/

**api_reference.md** - Comprehensive API endpoint documentation including:
- Detailed parameters for Portal API and Browser API
- Response format specifications
- Advanced query syntax and operators
- Field names for filtering and searching
- Common API patterns and examples

Load this reference when constructing complex API queries, debugging API responses, or needing specific parameter details.

