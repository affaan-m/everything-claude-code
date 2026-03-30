# GWAS Catalog API Reference

Comprehensive reference for the GWAS Catalog REST APIs, including endpoint specifications, query parameters, response formats, and advanced usage patterns.

## Table of Contents

- [API Overview](#api-overview)
- [Authentication and Rate Limiting](#authentication-and-rate-limiting)
- [GWAS Catalog REST API](#gwas-catalog-rest-api)
- [Summary Statistics API](#summary-statistics-api)
- [Response Formats](#response-formats)
- [Error Handling](#error-handling)
- [Advanced Query Patterns](#advanced-query-patterns)
- [Integration Examples](#integration-examples)

## API Overview

The GWAS Catalog provides two complementary REST APIs:

1. **GWAS Catalog REST API**: Access to curated SNP-trait associations, studies, and metadata
2. **Summary Statistics API**: Access to full GWAS summary statistics (all tested variants)

Both APIs use RESTful design principles with JSON responses in HAL (Hypertext Application Language) format, which includes `_links` for resource navigation.

### Base URLs

```
GWAS Catalog API:         https://www.ebi.ac.uk/gwas/rest/api
Summary Statistics API:   https://www.ebi.ac.uk/gwas/summary-statistics/api
```

### Version Information

The GWAS Catalog REST API v2.0 was released in 2024, with significant improvements:
- New endpoints (publications, genes, genomic context, ancestries)
- Enhanced data exposure (cohorts, background traits, licenses)
- Improved query capabilities
- Better performance and documentation

The previous API version remains available until May 2026 for backward compatibility.

## Authentication and Rate Limiting

### Authentication

**No authentication required** - Both APIs are open access and do not require API keys or registration.

### Rate Limiting

While no explicit rate limits are documented, follow best practices:
- Implement delays between consecutive requests (e.g., 0.1-0.5 seconds)
- Use pagination for large result sets
- Cache responses locally
- Use bulk downloads (FTP) for genome-wide data
- Avoid hammering the API with rapid consecutive requests

**Example with rate limiting:**
```python
import requests
from time import sleep

def query_with_rate_limit(url, delay=0.1):
    response = requests.get(url)
    sleep(delay)
    return response.json()
```

## GWAS Catalog REST API

The main API provides access to curated GWAS associations, studies, variants, and traits.

### Core Endpoints

#### 1. Studies

**Get all studies:**
```
GET /studies
```

**Get specific study:**
```
GET /studies/{accessionId}
```

**Search studies:**
```
GET /studies/search/findByPublicationIdPubmedId?pubmedId={pmid}
GET /studies/search/findByDiseaseTrait?diseaseTrait={trait}
```

**Query Parameters:**
- `page`: Page number (0-indexed)
- `size`: Results per page (default: 20)
- `sort`: Sort field (e.g., `publicationDate,desc`)

**Example:**
```python
import requests

# Get a specific study
url = "https://www.ebi.ac.uk/gwas/rest/api/studies/GCST001795"
response = requests.get(url, headers={"Content-Type": "application/json"})
study = response.json()

print(f"Title: {study.get('title')}")
print(f"PMID: {study.get('publicationInfo', {}).get('pubmedId')}")
print(f"Sample size: {study.get('initialSampleSize')}")
```

**Response Fields:**
- `accessionId`: Study identifier (GCST ID)
- `title`: Study title
- `publicationInfo`: Publication details including PMID
- `initialSampleSize`: Discovery cohort description
- `replicationSampleSize`: Replication cohort description
- `ancestries`: Population ancestry information
- `genotypingTechnologies`: Array or sequencing platforms
- `_links`: Links to related resources

#### 2. Associations

**Get all associations:**
```
GET /associations
```

**Get specific association:**
```
GET /associations/{associationId}
```

**Get associations for a trait:**
```
GET /efoTraits/{efoId}/associations
```

**Get associations for a variant:**
```
GET /singleNucleotidePolymorphisms/{rsId}/associations
```

**Query Parameters:**
- `projection`: Response projection (e.g., `associationBySnp`)
- `page`, `size`, `sort`: Pagination controls

**Example:**
```python
import requests

# Find all associations for type 2 diabetes
trait_id = "EFO_0001360"
url = f"https://www.ebi.ac.uk/gwas/rest/api/efoTraits/{trait_id}/associations"
params = {"size": 100, "page": 0}
response = requests.get(url, params=params, headers={"Content-Type": "application/json"})
data = response.json()

associations = data.get('_embedded', {}).get('associations', [])
print(f"Found {len(associations)} associations")
```

**Response Fields:**
- `rsId`: Variant identifier
- `strongestAllele`: Risk or effect allele
- `pvalue`: Association p-value
- `pvalueText`: P-value as reported (may include inequality)
- `pvalueMantissa`: Mantissa of p-value
- `pvalueExponent`: Exponent of p-value
- `orPerCopyNum`: Odds ratio per allele copy
- `betaNum`: Effect size (quantitative traits)
- `betaUnit`: Unit of measurement
- `range`: Confidence interval
- `standardError`: Standard error
- `efoTrait`: Trait name
- `mappedLabel`: EFO standardized term
- `studyId`: Associated study accession

#### 3. Variants (Single Nucleotide Polymorphisms)

**Get variant details:**
```
GET /singleNucleotidePolymorphisms/{rsId}
```

**Search variants:**
```
GET /singleNucleotidePolymorphisms/search/findByRsId?rsId={rsId}
GET /singleNucleotidePolymorphisms/search/findByChromBpLocationRange?chrom={chr}&bpStart={start}&bpEnd={end}
GET /singleNucleotidePolymorphisms/search/findByGene?geneName={gene}
```

**Example:**
```python
import requests

# Get variant information
rs_id = "rs7903146"
url = f"https://www.ebi.ac.uk/gwas/rest/api/singleNucleotidePolymorphisms/{rs_id}"
response = requests.get(url, headers={"Content-Type": "application/json"})
variant = response.json()

print(f"rsID: {variant.get('rsId')}")
print(f"Location: chr{variant.get('locations', [{}])[0].get('chromosomeName')}:{variant.get('locations', [{}])[0].get('chromosomePosition')}")
```

**Response Fields:**
- `rsId`: rs number
- `merged`: Indicates if variant merged with another
- `functionalClass`: Variant consequence
- `locations`: Array of genomic locations
  - `chromosomeName`: Chromosome number
  - `chromosomePosition`: Base pair position
  - `region`: Genomic region information
- `genomicContexts`: Nearby genes
- `lastUpdateDate`: Last modification date

#### 4. Traits (EFO Terms)

**Get trait information:**
```
GET /efoTraits/{efoId}
```

**Search traits:**
```
GET /efoTraits/search/findByEfoUri?uri={efoUri}
GET /efoTraits/search/findByTraitIgnoreCase?trait={traitName}
```

**Example:**
```python
import requests

# Get trait details
trait_id = "EFO_0001360"
url = f"https://www.ebi.ac.uk/gwas/rest/api/efoTraits/{trait_id}"
response = requests.get(url, headers={"Content-Type": "application/json"})
trait = response.json()

print(f"Trait: {trait.get('trait')}")
print(f"EFO URI: {trait.get('uri')}")
```

#### 5. Publications

**Get publication information:**
```
GET /publications
GET /publications/{publicationId}
GET /publications/search/findByPubmedId?pubmedId={pmid}
```

#### 6. Genes

**Get gene information:**
```
GET /genes
GET /genes/{geneId}
GET /genes/search/findByGeneName?geneName={symbol}
```

### Pagination and Navigation

All list endpoints support pagination:

```python
import requests

def get_all_associations(trait_id):
    """Retrieve all associations for a trait with pagination"""
    base_url = "https://www.ebi.ac.uk/gwas/rest/api"
    url = f"{base_url}/efoTraits/{trait_id}/associations"
    all_associations = []
    page = 0

    while True:
        params = {"page": page, "size": 100}
        response = requests.get(url, params=params, headers={"Content-Type": "application/json"})

        if response.status_code != 200:
            break

        data = response.json()
        associations = data.get('_embedded', {}).get('associations', [])

        if not associations:
            break

        all_associations.extend(associations)
        page += 1

    return all_associations
```

### HAL Links

Responses include `_links` for resource navigation:

```python
import requests

# Get study and follow links to associations
response = requests.get("https://www.ebi.ac.uk/gwas/rest/api/studies/GCST001795")
study = response.json()

# Follow link to associations
associations_url = study['_links']['associations']['href']
associations_response = requests.get(associations_url)
associations = associations_response.json()
```

## Summary Statistics API

Access full GWAS summary statistics for studies that have deposited complete data.

### Base URL
```
https://www.ebi.ac.uk/gwas/summary-statistics/api
```

### Core Endpoints

#### 1. Studies

**Get all studies with summary statistics:**
```
GET /studies
```

**Get specific study:**
```
GET /studies/{gcstId}
```

#### 2. Traits

**Get trait information:**
```
GET /traits/{efoId}
```

**Get associations for a trait:**
```
GET /traits/{efoId}/associations
```

**Query Parameters:**
- `p_lower`: Lower p-value threshold
- `p_upper`: Upper p-value threshold
- `size`: Number of results
- `page`: Page number

**Example:**
```python
import requests

# Find highly significant associations for a trait
trait_id = "EFO_0001360"
base_url = "https://www.ebi.ac.uk/gwas/summary-statistics/api"
url = f"{base_url}/traits/{trait_id}/associations"
params = {
    "p_upper": "0.000000001",  # p < 1e-9
    "size": 100
}
response = requests.get(url, params=params)
results = response.json()
```

#### 3. Chromosomes

**Get associations by chromosome:**
```
GET /chromosomes/{chromosome}/associations
```

**Query by genomic region:**
```
GET /chromosomes/{chromosome}/associations?start={start}&end={end}
```

**Example:**
```python
import requests

# Query variants in a specific region
chromosome = "10"
start_pos = 114000000
end_pos = 115000000

base_url = "https://www.ebi.ac.uk/gwas/summary-statistics/api"
url = f"{base_url}/chromosomes/{chromosome}/associations"
params = {
    "start": start_pos,
    "end": end_pos,
    "size": 1000
}
response = requests.get(url, params=params)
variants = response.json()
```

#### 4. Variants

**Get specific variant across studies:**
```
GET /variants/{variantId}
```

**Search by variant ID:**
```
GET /variants/{variantId}/associations
```

### Response Fields

**Association Fields:**
- `variant_id`: Variant identifier
- `chromosome`: Chromosome number
- `base_pair_location`: Position (bp)
- `effect_allele`: Effect allele
- `other_allele`: Reference allele
- `effect_allele_frequency`: Allele frequency
- `beta`: Effect size
- `standard_error`: Standard error
- `p_value`: P-value
- `ci_lower`: Lower confidence interval
- `ci_upper`: Upper confidence interval
- `odds_ratio`: Odds ratio (case-control studies)
- `study_accession`: GCST ID

## Response Formats

### Content Type

All API requests should include the header:
```
Content-Type: application/json
```

### HAL Format

Responses follow the HAL (Hypertext Application Language) specification:

```json
{
  "_embedded": {
    "associations": [
      {
        "rsId": "rs7903146",
        "pvalue": 1.2e-30,
        "efoTrait": "type 2 diabetes",
        "_links": {
          "self": {
            "href": "https://www.ebi.ac.uk/gwas/rest/api/associations/12345"
          }
        }
      }
    ]
  },
  "_links": {
    "self": {
      "href": "https://www.ebi.ac.uk/gwas/rest/api/efoTraits/EFO_0001360/associations?page=0"
    },
    "next": {
      "href": "https://www.ebi.ac.uk/gwas/rest/api/efoTraits/EFO_0001360/associations?page=1"
    }
  },
  "page": {
    "size": 20,
    "totalElements": 1523,
    "totalPages": 77,
    "number": 0
  }
}
```

### Page Metadata

Paginated responses include page information:
- `size`: Items per page
- `totalElements`: Total number of results
- `totalPages`: Total number of pages
- `number`: Current page number (0-indexed)

## Error Handling

### HTTP Status Codes

- `200 OK`: Successful request
- `400 Bad Request`: Invalid parameters
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

### Error Response Format

```json
{
  "timestamp": "2025-10-19T12:00:00.000+00:00",
  "status": 404,
  "error": "Not Found",
  "message": "No association found with id: 12345",
  "path": "/gwas/rest/api/associations/12345"
}
```

### Error Handling Example

```python
import requests

def safe_api_request(url, params=None):
    """Make API request with error handling"""
    try:
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as e:
        print(f"HTTP Error: {e}")
        print(f"Response: {response.text}")
        return None
    except requests.exceptions.ConnectionError:
        print("Connection error - check network")
        return None
    except requests.exceptions.Timeout:
        print("Request timed out")
        return None
    except requests.exceptions.RequestException as e:
        print(f"Request error: {e}")
        return None
```

## Advanced Query Patterns

### 1. Cross-referencing Variants and Traits

```python
import requests

def get_variant_pleiotropy(rs_id):
    """Get all traits associated with a variant"""
    base_url = "https://www.ebi.ac.uk/gwas/rest/api"
    url = f"{base_url}/singleNucleotidePolymorphisms/{rs_id}/associations"
    params = {"projection": "associationBySnp"}

    response = requests.get(url, params=params, headers={"Content-Type": "application/json"})
    data = response.json()

    traits = {}
    for assoc in data.get('_embedded', {}).get('associations', []):
        trait = assoc.get('efoTrait')
        pvalue = assoc.get('pvalue')
        if trait:
            if trait not in traits or float(pvalue) < float(traits[trait]):
                traits[trait] = pvalue

    return traits

# Example usage
pleiotropy = get_variant_pleiotropy('rs7903146')
for trait, pval in sorted(pleiotropy.items(), key=lambda x: float(x[1])):
    print(f"{trait}: p={pval}")
```

### 2. Filtering by P-value Threshold

```python
import requests

def get_significant_associations(trait_id, p_threshold=5e-8):
    """Get genome-wide significant associations"""
    base_url = "https://www.ebi.ac.uk/gwas/rest/api"
    url = f"{base_url}/efoTraits/{trait_id}/associations"

    results = []
    page = 0

    while True:
        params = {"page": page, "size": 100}
        response = requests.get(url, params=params, headers={"Content-Type": "application/json"})

        if response.status_code != 200:
            break

        data = response.json()
        associations = data.get('_embedded', {}).get('associations', [])

        if not associations:
            break

        for assoc in associations:
            pvalue = assoc.get('pvalue')
            if pvalue and float(pvalue) <= p_threshold:
                results.append(assoc)

        page += 1

    return results
```

### 3. Combining Main and Summary Statistics APIs

```python
import requests

def get_complete_variant_data(rs_id):
    """Get variant data from both APIs"""
    main_url = f"https://www.ebi.ac.uk/gwas/rest/api/singleNucleotidePolymorphisms/{rs_id}"

    # Get basic variant info
    response = requests.get(main_url, headers={"Content-Type": "application/json"})
    variant_info = response.json()

    # Get associations
    assoc_url = f"{main_url}/associations"
    response = requests.get(assoc_url, headers={"Content-Type": "application/json"})
    associations = response.json()

    # Could also query summary statistics API for this variant
    # across all studies with summary data

    return {
        "variant": variant_info,
        "associations": associations
    }
```

### 4. Genomic Region Queries

```python
import requests

def query_region(chromosome, start, end, p_threshold=None):
    """Query variants in genomic region"""
    # From main API
    base_url = "https://www.ebi.ac.uk/gwas/rest/api"
    url = f"{base_url}/singleNucleotidePolymorphisms/search/findByChromBpLocationRange"
    params = {
        "chrom": chromosome,
        "bpStart": start,
        "bpEnd": end,
        "size": 1000
    }

    response = requests.get(url, params=params, headers={"Content-Type": "application/json"})
    variants = response.json()

    # Can also query summary statistics API
    sumstats_url = f"https://www.ebi.ac.uk/gwas/summary-statistics/api/chromosomes/{chromosome}/associations"
    sumstats_params = {"start": start, "end": end, "size": 1000}
    if p_threshold:
        sumstats_params["p_upper"] = str(p_threshold)

    sumstats_response = requests.get(sumstats_url, params=sumstats_params)
    sumstats = sumstats_response.json()

    return {
        "catalog_variants": variants,
        "summary_stats": sumstats
    }
```

## Integration Examples

### Complete Workflow: Disease Genetic Architecture

```python
import requests
import pandas as pd
from time import sleep

class GWASCatalogQuery:
    def __init__(self):
        self.base_url = "https://www.ebi.ac.uk/gwas/rest/api"
        self.headers = {"Content-Type": "application/json"}

    def get_trait_associations(self, trait_id, p_threshold=5e-8):
        """Get all associations for a trait"""
        url = f"{self.base_url}/efoTraits/{trait_id}/associations"
        results = []
        page = 0

        while True:
            params = {"page": page, "size": 100}
            response = requests.get(url, params=params, headers=self.headers)

            if response.status_code != 200:
                break

            data = response.json()
            associations = data.get('_embedded', {}).get('associations', [])

            if not associations:
                break

            for assoc in associations:
                pvalue = assoc.get('pvalue')
                if pvalue and float(pvalue) <= p_threshold:
                    results.append({
                        'rs_id': assoc.get('rsId'),
                        'pvalue': float(pvalue),
                        'risk_allele': assoc.get('strongestAllele'),
                        'or_beta': assoc.get('orPerCopyNum') or assoc.get('betaNum'),
                        'study': assoc.get('studyId'),
                        'pubmed_id': assoc.get('pubmedId')
                    })

            page += 1
            sleep(0.1)

        return pd.DataFrame(results)

    def get_variant_details(self, rs_id):
        """Get detailed variant information"""
        url = f"{self.base_url}/singleNucleotidePolymorphisms/{rs_id}"
        response = requests.get(url, headers=self.headers)

        if response.status_code == 200:
            return response.json()
        return None

    def get_gene_associations(self, gene_name):
        """Get variants associated with a gene"""
        url = f"{self.base_url}/singleNucleotidePolymorphisms/search/findByGene"
        params = {"geneName": gene_name}
        response = requests.get(url, params=params, headers=self.headers)

        if response.status_code == 200:
            return response.json()
        return None

# Example usage
gwas = GWASCatalogQuery()

# Query type 2 diabetes associations
df = gwas.get_trait_associations('EFO_0001360')
print(f"Found {len(df)} genome-wide significant associations")
print(f"Unique variants: {df['rs_id'].nunique()}")

# Get top variants
top_variants = df.nsmallest(10, 'pvalue')
print("\nTop 10 variants:")
print(top_variants[['rs_id', 'pvalue', 'risk_allele']])

# Get details for top variant
if len(top_variants) > 0:
    top_rs = top_variants.iloc[0]['rs_id']
    variant_info = gwas.get_variant_details(top_rs)
    if variant_info:
        loc = variant_info.get('locations', [{}])[0]
        print(f"\n{top_rs} location: chr{loc.get('chromosomeName')}:{loc.get('chromosomePosition')}")
```

### FTP Download Integration

```python
import requests
from pathlib import Path

def download_summary_statistics(gcst_id, output_dir="."):
    """Download summary statistics from FTP"""
    # FTP URL pattern
    ftp_base = "http://ftp.ebi.ac.uk/pub/databases/gwas/summary_statistics"

    # Try harmonised file first
    harmonised_url = f"{ftp_base}/{gcst_id}/harmonised/{gcst_id}-harmonised.tsv.gz"

    output_path = Path(output_dir) / f"{gcst_id}.tsv.gz"

    try:
        response = requests.get(harmonised_url, stream=True)
        response.raise_for_status()

        with open(output_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        print(f"Downloaded {gcst_id} to {output_path}")
        return output_path

    except requests.exceptions.HTTPError:
        print(f"Harmonised file not found for {gcst_id}")
        return None

# Example usage
download_summary_statistics("GCST001234", output_dir="./sumstats")
```

## Additional Resources

- **Interactive API Documentation**: https://www.ebi.ac.uk/gwas/rest/docs/api
- **Summary Statistics API Docs**: https://www.ebi.ac.uk/gwas/summary-statistics/docs/
- **Workshop Materials**: https://github.com/EBISPOT/GWAS_Catalog-workshop
- **Blog Post on API v2**: https://ebispot.github.io/gwas-blog/rest-api-v2-release/
- **R Package (gwasrapidd)**: https://cran.r-project.org/package=gwasrapidd
