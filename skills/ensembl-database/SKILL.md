---
name: ensembl-database
description: Query Ensembl genome database REST API for 250+ species. Gene lookups, sequence retrieval, variant analysis, comparative genomics, orthologs, VEP predictions, for genomic research.
license: Unknown
metadata:
    skill-author: K-Dense Inc.
---

# Ensembl Database

## Overview

Access and query the Ensembl genome database, a comprehensive resource for vertebrate genomic data maintained by EMBL-EBI. The database provides gene annotations, sequences, variants, regulatory information, and comparative genomics data for over 250 species. Current release is 115 (September 2025).

## When to Use This Skill

This skill should be used when:

- Querying gene information by symbol or Ensembl ID
- Retrieving DNA, transcript, or protein sequences
- Analyzing genetic variants using the Variant Effect Predictor (VEP)
- Finding orthologs and paralogs across species
- Accessing regulatory features and genomic annotations
- Converting coordinates between genome assemblies (e.g., GRCh37 to GRCh38)
- Performing comparative genomics analyses
- Integrating Ensembl data into genomic research pipelines

## Core Capabilities

### 1. Gene Information Retrieval

Query gene data by symbol, Ensembl ID, or external database identifiers.

**Common operations:**
- Look up gene information by symbol (e.g., "BRCA2", "TP53")
- Retrieve transcript and protein information
- Get gene coordinates and chromosomal locations
- Access cross-references to external databases (UniProt, RefSeq, etc.)

**Using the ensembl_rest package:**
```python
from ensembl_rest import EnsemblClient

client = EnsemblClient()

# Look up gene by symbol
gene_data = client.symbol_lookup(
    species='human',
    symbol='BRCA2'
)

# Get detailed gene information
gene_info = client.lookup_id(
    id='ENSG00000139618',  # BRCA2 Ensembl ID
    expand=True
)
```

**Direct REST API (no package):**
```python
import requests

server = "https://rest.ensembl.org"

# Symbol lookup
response = requests.get(
    f"{server}/lookup/symbol/homo_sapiens/BRCA2",
    headers={"Content-Type": "application/json"}
)
gene_data = response.json()
```

### 2. Sequence Retrieval

Fetch genomic, transcript, or protein sequences in various formats (JSON, FASTA, plain text).

**Operations:**
- Get DNA sequences for genes or genomic regions
- Retrieve transcript sequences (cDNA)
- Access protein sequences
- Extract sequences with flanking regions or modifications

**Example:**
```python
# Using ensembl_rest package
sequence = client.sequence_id(
    id='ENSG00000139618',  # Gene ID
    content_type='application/json'
)

# Get sequence for a genomic region
region_seq = client.sequence_region(
    species='human',
    region='7:140424943-140624564'  # chromosome:start-end
)
```

### 3. Variant Analysis

Query genetic variation data and predict variant consequences using the Variant Effect Predictor (VEP).

**Capabilities:**
- Look up variants by rsID or genomic coordinates
- Predict functional consequences of variants
- Access population frequency data
- Retrieve phenotype associations

**VEP example:**
```python
# Predict variant consequences
vep_result = client.vep_hgvs(
    species='human',
    hgvs_notation='ENST00000380152.7:c.803C>T'
)

# Query variant by rsID
variant = client.variation_id(
    species='human',
    id='rs699'
)
```

### 4. Comparative Genomics

Perform cross-species comparisons to identify orthologs, paralogs, and evolutionary relationships.

**Operations:**
- Find orthologs (same gene in different species)
- Identify paralogs (related genes in same species)
- Access gene trees showing evolutionary relationships
- Retrieve gene family information

**Example:**
```python
# Find orthologs for a human gene
orthologs = client.homology_ensemblgene(
    id='ENSG00000139618',  # Human BRCA2
    target_species='mouse'
)

# Get gene tree
gene_tree = client.genetree_member_symbol(
    species='human',
    symbol='BRCA2'
)
```

### 5. Genomic Region Analysis

Find all genomic features (genes, transcripts, regulatory elements) in a specific region.

**Use cases:**
- Identify all genes in a chromosomal region
- Find regulatory features (promoters, enhancers)
- Locate variants within a region
- Retrieve structural features

**Example:**
```python
# Find all features in a region
features = client.overlap_region(
    species='human',
    region='7:140424943-140624564',
    feature='gene'
)
```

### 6. Assembly Mapping

Convert coordinates between different genome assemblies (e.g., GRCh37 to GRCh38).

**Important:** Use `https://grch37.rest.ensembl.org` for GRCh37/hg19 queries and `https://rest.ensembl.org` for current assemblies.

**Example:**
```python
from ensembl_rest import AssemblyMapper

# Map coordinates from GRCh37 to GRCh38
mapper = AssemblyMapper(
    species='human',
    asm_from='GRCh37',
    asm_to='GRCh38'
)

mapped = mapper.map(chrom='7', start=140453136, end=140453136)
```

## API Best Practices

### Rate Limiting

The Ensembl REST API has rate limits. Follow these practices:

1. **Respect rate limits:** Maximum 15 requests per second for anonymous users
2. **Handle 429 responses:** When rate-limited, check the `Retry-After` header and wait
3. **Use batch endpoints:** When querying multiple items, use batch endpoints where available
4. **Cache results:** Store frequently accessed data to reduce API calls

### Error Handling

Always implement proper error handling:

```python
import requests
import time

def query_ensembl(endpoint, params=None, max_retries=3):
    server = "https://rest.ensembl.org"
    headers = {"Content-Type": "application/json"}

    for attempt in range(max_retries):
        response = requests.get(
            f"{server}{endpoint}",
            headers=headers,
            params=params
        )

        if response.status_code == 200:
            return response.json()
        elif response.status_code == 429:
            # Rate limited - wait and retry
            retry_after = int(response.headers.get('Retry-After', 1))
            time.sleep(retry_after)
        else:
            response.raise_for_status()

    raise Exception(f"Failed after {max_retries} attempts")
```

## Installation

### Python Package (Recommended)

```bash
uv pip install ensembl_rest
```

The `ensembl_rest` package provides a Pythonic interface to all Ensembl REST API endpoints.

### Direct REST API

No installation needed - use standard HTTP libraries like `requests`:

```bash
uv pip install requests
```

## Resources

### references/

- `api_endpoints.md`: Comprehensive documentation of all 17 API endpoint categories with examples and parameters

### scripts/

- `ensembl_query.py`: Reusable Python script for common Ensembl queries with built-in rate limiting and error handling

## Common Workflows

### Workflow 1: Gene Annotation Pipeline

1. Look up gene by symbol to get Ensembl ID
2. Retrieve transcript information
3. Get protein sequences for all transcripts
4. Find orthologs in other species
5. Export results

### Workflow 2: Variant Analysis

1. Query variant by rsID or coordinates
2. Use VEP to predict functional consequences
3. Check population frequencies
4. Retrieve phenotype associations
5. Generate report

### Workflow 3: Comparative Analysis

1. Start with gene of interest in reference species
2. Find orthologs in target species
3. Retrieve sequences for all orthologs
4. Compare gene structures and features
5. Analyze evolutionary conservation

## Species and Assembly Information

To query available species and assemblies:

```python
# List all available species
species_list = client.info_species()

# Get assembly information for a species
assembly_info = client.info_assembly(species='human')
```

Common species identifiers:
- Human: `homo_sapiens` or `human`
- Mouse: `mus_musculus` or `mouse`
- Zebrafish: `danio_rerio` or `zebrafish`
- Fruit fly: `drosophila_melanogaster`

## Additional Resources

- **Official Documentation:** https://rest.ensembl.org/documentation
- **Python Package Docs:** https://ensemblrest.readthedocs.io
- **EBI Training:** https://www.ebi.ac.uk/training/online/courses/ensembl-rest-api/
- **Ensembl Browser:** https://useast.ensembl.org
- **GitHub Examples:** https://github.com/Ensembl/ensembl-rest/wiki

