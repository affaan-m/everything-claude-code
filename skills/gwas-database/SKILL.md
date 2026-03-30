---
name: gwas-database
description: Query NHGRI-EBI GWAS Catalog for SNP-trait associations. Search variants by rs ID, disease/trait, gene, retrieve p-values and summary statistics, for genetic epidemiology and polygenic risk scores.
license: Unknown
metadata:
    skill-author: K-Dense Inc.
---

# GWAS Catalog Database

## Overview

The GWAS Catalog is a comprehensive repository of published genome-wide association studies maintained by the National Human Genome Research Institute (NHGRI) and the European Bioinformatics Institute (EBI). The catalog contains curated SNP-trait associations from thousands of GWAS publications, including genetic variants, associated traits and diseases, p-values, effect sizes, and full summary statistics for many studies.

## When to Use This Skill

This skill should be used when queries involve:

- **Genetic variant associations**: Finding SNPs associated with diseases or traits
- **SNP lookups**: Retrieving information about specific genetic variants (rs IDs)
- **Trait/disease searches**: Discovering genetic associations for phenotypes
- **Gene associations**: Finding variants in or near specific genes
- **GWAS summary statistics**: Accessing complete genome-wide association data
- **Study metadata**: Retrieving publication and cohort information
- **Population genetics**: Exploring ancestry-specific associations
- **Polygenic risk scores**: Identifying variants for risk prediction models
- **Functional genomics**: Understanding variant effects and genomic context
- **Systematic reviews**: Comprehensive literature synthesis of genetic associations

## Core Capabilities

### 1. Understanding GWAS Catalog Data Structure

The GWAS Catalog is organized around four core entities:

- **Studies**: GWAS publications with metadata (PMID, author, cohort details)
- **Associations**: SNP-trait associations with statistical evidence (p ≤ 5×10⁻⁸)
- **Variants**: Genetic markers (SNPs) with genomic coordinates and alleles
- **Traits**: Phenotypes and diseases (mapped to EFO ontology terms)

**Key Identifiers:**
- Study accessions: `GCST` IDs (e.g., GCST001234)
- Variant IDs: `rs` numbers (e.g., rs7903146) or `variant_id` format
- Trait IDs: EFO terms (e.g., EFO_0001360 for type 2 diabetes)
- Gene symbols: HGNC approved names (e.g., TCF7L2)

### 2. Web Interface Searches

The web interface at https://www.ebi.ac.uk/gwas/ supports multiple search modes:

**By Variant (rs ID):**
```
rs7903146
```
Returns all trait associations for this SNP.

**By Disease/Trait:**
```
type 2 diabetes
Parkinson disease
body mass index
```
Returns all associated genetic variants.

**By Gene:**
```
APOE
TCF7L2
```
Returns variants in or near the gene region.

**By Chromosomal Region:**
```
10:114000000-115000000
```
Returns variants in the specified genomic interval.

**By Publication:**
```
PMID:20581827
Author: McCarthy MI
GCST001234
```
Returns study details and all reported associations.

### 3. REST API Access

The GWAS Catalog provides two REST APIs for programmatic access:

**Base URLs:**
- GWAS Catalog API: `https://www.ebi.ac.uk/gwas/rest/api`
- Summary Statistics API: `https://www.ebi.ac.uk/gwas/summary-statistics/api`

**API Documentation:**
- Main API docs: https://www.ebi.ac.uk/gwas/rest/docs/api
- Summary stats docs: https://www.ebi.ac.uk/gwas/summary-statistics/docs/

**Core Endpoints:**

1. **Studies endpoint** - `/studies/{accessionID}`
   ```python
   import requests

   # Get a specific study
   url = "https://www.ebi.ac.uk/gwas/rest/api/studies/GCST001795"
   response = requests.get(url, headers={"Content-Type": "application/json"})
   study = response.json()
   ```

2. **Associations endpoint** - `/associations`
   ```python
   # Find associations for a variant
   variant = "rs7903146"
   url = f"https://www.ebi.ac.uk/gwas/rest/api/singleNucleotidePolymorphisms/{variant}/associations"
   params = {"projection": "associationBySnp"}
   response = requests.get(url, params=params, headers={"Content-Type": "application/json"})
   associations = response.json()
   ```

3. **Variants endpoint** - `/singleNucleotidePolymorphisms/{rsID}`
   ```python
   # Get variant details
   url = "https://www.ebi.ac.uk/gwas/rest/api/singleNucleotidePolymorphisms/rs7903146"
   response = requests.get(url, headers={"Content-Type": "application/json"})
   variant_info = response.json()
   ```

4. **Traits endpoint** - `/efoTraits/{efoID}`
   ```python
   # Get trait information
   url = "https://www.ebi.ac.uk/gwas/rest/api/efoTraits/EFO_0001360"
   response = requests.get(url, headers={"Content-Type": "application/json"})
   trait_info = response.json()
   ```

### 4. Query Examples and Patterns

**Example 1: Find all associations for a disease**
```python
import requests

trait = "EFO_0001360"  # Type 2 diabetes
base_url = "https://www.ebi.ac.uk/gwas/rest/api"

# Query associations for this trait
url = f"{base_url}/efoTraits/{trait}/associations"
response = requests.get(url, headers={"Content-Type": "application/json"})
associations = response.json()

# Process results
for assoc in associations.get('_embedded', {}).get('associations', []):
    variant = assoc.get('rsId')
    pvalue = assoc.get('pvalue')
    risk_allele = assoc.get('strongestAllele')
    print(f"{variant}: p={pvalue}, risk allele={risk_allele}")
```

**Example 2: Get variant information and all trait associations**
```python
import requests

variant = "rs7903146"
base_url = "https://www.ebi.ac.uk/gwas/rest/api"

# Get variant details
url = f"{base_url}/singleNucleotidePolymorphisms/{variant}"
response = requests.get(url, headers={"Content-Type": "application/json"})
variant_data = response.json()

# Get all associations for this variant
url = f"{base_url}/singleNucleotidePolymorphisms/{variant}/associations"
params = {"projection": "associationBySnp"}
response = requests.get(url, params=params, headers={"Content-Type": "application/json"})
associations = response.json()

# Extract trait names and p-values
for assoc in associations.get('_embedded', {}).get('associations', []):
    trait = assoc.get('efoTrait')
    pvalue = assoc.get('pvalue')
    print(f"Trait: {trait}, p-value: {pvalue}")
```

**Example 3: Access summary statistics**
```python
import requests

# Query summary statistics API
base_url = "https://www.ebi.ac.uk/gwas/summary-statistics/api"

# Find associations by trait with p-value threshold
trait = "EFO_0001360"  # Type 2 diabetes
p_upper = "0.000000001"  # p < 1e-9
url = f"{base_url}/traits/{trait}/associations"
params = {
    "p_upper": p_upper,
    "size": 100  # Number of results
}
response = requests.get(url, params=params)
results = response.json()

# Process genome-wide significant hits
for hit in results.get('_embedded', {}).get('associations', []):
    variant_id = hit.get('variant_id')
    chromosome = hit.get('chromosome')
    position = hit.get('base_pair_location')
    pvalue = hit.get('p_value')
    print(f"{chromosome}:{position} ({variant_id}): p={pvalue}")
```

**Example 4: Query by chromosomal region**
```python
import requests

# Find variants in a specific genomic region
chromosome = "10"
start_pos = 114000000
end_pos = 115000000

base_url = "https://www.ebi.ac.uk/gwas/rest/api"
url = f"{base_url}/singleNucleotidePolymorphisms/search/findByChromBpLocationRange"
params = {
    "chrom": chromosome,
    "bpStart": start_pos,
    "bpEnd": end_pos
}
response = requests.get(url, params=params, headers={"Content-Type": "application/json"})
variants_in_region = response.json()
```

### 5. Working with Summary Statistics

The GWAS Catalog hosts full summary statistics for many studies, providing access to all tested variants (not just genome-wide significant hits).

**Access Methods:**
1. **FTP download**: http://ftp.ebi.ac.uk/pub/databases/gwas/summary_statistics/
2. **REST API**: Query-based access to summary statistics
3. **Web interface**: Browse and download via the website

**Summary Statistics API Features:**
- Filter by chromosome, position, p-value
- Query specific variants across studies
- Retrieve effect sizes and allele frequencies
- Access harmonized and standardized data

**Example: Download summary statistics for a study**
```python
import requests
import gzip

# Get available summary statistics
base_url = "https://www.ebi.ac.uk/gwas/summary-statistics/api"
url = f"{base_url}/studies/GCST001234"
response = requests.get(url)
study_info = response.json()

# Download link is provided in the response
# Alternatively, use FTP:
# ftp://ftp.ebi.ac.uk/pub/databases/gwas/summary_statistics/GCSTXXXXXX/
```

### 6. Data Integration and Cross-referencing

The GWAS Catalog provides links to external resources:

**Genomic Databases:**
- Ensembl: Gene annotations and variant consequences
- dbSNP: Variant identifiers and population frequencies
- gnomAD: Population allele frequencies

**Functional Resources:**
- Open Targets: Target-disease associations
- PGS Catalog: Polygenic risk scores
- UCSC Genome Browser: Genomic context

**Phenotype Resources:**
- EFO (Experimental Factor Ontology): Standardized trait terms
- OMIM: Disease gene relationships
- Disease Ontology: Disease hierarchies

**Following Links in API Responses:**
```python
import requests

# API responses include _links for related resources
response = requests.get("https://www.ebi.ac.uk/gwas/rest/api/studies/GCST001234")
study = response.json()

# Follow link to associations
associations_url = study['_links']['associations']['href']
associations_response = requests.get(associations_url)
```

## Query Workflows

### Workflow 1: Exploring Genetic Associations for a Disease

1. **Identify the trait** using EFO terms or free text:
   - Search web interface for disease name
   - Note the EFO ID (e.g., EFO_0001360 for type 2 diabetes)

2. **Query associations via API:**
   ```python
   url = f"https://www.ebi.ac.uk/gwas/rest/api/efoTraits/{efo_id}/associations"
   ```

3. **Filter by significance and population:**
   - Check p-values (genome-wide significant: p ≤ 5×10⁻⁸)
   - Review ancestry information in study metadata
   - Filter by sample size or discovery/replication status

4. **Extract variant details:**
   - rs IDs for each association
   - Effect alleles and directions
   - Effect sizes (odds ratios, beta coefficients)
   - Population allele frequencies

5. **Cross-reference with other databases:**
   - Look up variant consequences in Ensembl
   - Check population frequencies in gnomAD
   - Explore gene function and pathways

### Workflow 2: Investigating a Specific Genetic Variant

1. **Query the variant:**
   ```python
   url = f"https://www.ebi.ac.uk/gwas/rest/api/singleNucleotidePolymorphisms/{rs_id}"
   ```

2. **Retrieve all trait associations:**
   ```python
   url = f"https://www.ebi.ac.uk/gwas/rest/api/singleNucleotidePolymorphisms/{rs_id}/associations"
   ```

3. **Analyze pleiotropy:**
   - Identify all traits associated with this variant
   - Review effect directions across traits
   - Look for shared biological pathways

4. **Check genomic context:**
   - Determine nearby genes
   - Identify if variant is in coding/regulatory regions
   - Review linkage disequilibrium with other variants

### Workflow 3: Gene-Centric Association Analysis

1. **Search by gene symbol** in web interface or:
   ```python
   url = f"https://www.ebi.ac.uk/gwas/rest/api/singleNucleotidePolymorphisms/search/findByGene"
   params = {"geneName": gene_symbol}
   ```

2. **Retrieve variants in gene region:**
   - Get chromosomal coordinates for gene
   - Query variants in region
   - Include promoter and regulatory regions (extend boundaries)

3. **Analyze association patterns:**
   - Identify traits associated with variants in this gene
   - Look for consistent associations across studies
   - Review effect sizes and directions

4. **Functional interpretation:**
   - Determine variant consequences (missense, regulatory, etc.)
   - Check expression QTL (eQTL) data
   - Review pathway and network context

### Workflow 4: Systematic Review of Genetic Evidence

1. **Define research question:**
   - Specific trait or disease of interest
   - Population considerations
   - Study design requirements

2. **Comprehensive variant extraction:**
   - Query all associations for trait
   - Set significance threshold
   - Note discovery and replication studies

3. **Quality assessment:**
   - Review study sample sizes
   - Check for population diversity
   - Assess heterogeneity across studies
   - Identify potential biases

4. **Data synthesis:**
   - Aggregate associations across studies
   - Perform meta-analysis if applicable
   - Create summary tables
   - Generate Manhattan or forest plots

5. **Export and documentation:**
   - Download full association data
   - Export summary statistics if needed
   - Document search strategy and date
   - Create reproducible analysis scripts

### Workflow 5: Accessing and Analyzing Summary Statistics

1. **Identify studies with summary statistics:**
   - Browse summary statistics portal
   - Check FTP directory listings
   - Query API for available studies

2. **Download summary statistics:**
   ```bash
   # Via FTP
   wget ftp://ftp.ebi.ac.uk/pub/databases/gwas/summary_statistics/GCSTXXXXXX/harmonised/GCSTXXXXXX-harmonised.tsv.gz
   ```

3. **Query via API for specific variants:**
   ```python
   url = f"https://www.ebi.ac.uk/gwas/summary-statistics/api/chromosomes/{chrom}/associations"
   params = {"start": start_pos, "end": end_pos}
   ```

4. **Process and analyze:**
   - Filter by p-value thresholds
   - Extract effect sizes and confidence intervals
   - Perform downstream analyses (fine-mapping, colocalization, etc.)

## Response Formats and Data Fields

**Key Fields in Association Records:**
- `rsId`: Variant identifier (rs number)
- `strongestAllele`: Risk allele for the association
- `pvalue`: Association p-value
- `pvalueText`: P-value as text (may include inequality)
- `orPerCopyNum`: Odds ratio or beta coefficient
- `betaNum`: Effect size (for quantitative traits)
- `betaUnit`: Unit of measurement for beta
- `range`: Confidence interval
- `efoTrait`: Associated trait name
- `mappedLabel`: EFO-mapped trait term

**Study Metadata Fields:**
- `accessionId`: GCST study identifier
- `pubmedId`: PubMed ID
- `author`: First author
- `publicationDate`: Publication date
- `ancestryInitial`: Discovery population ancestry
- `ancestryReplication`: Replication population ancestry
- `sampleSize`: Total sample size

**Pagination:**
Results are paginated (default 20 items per page). Navigate using:
- `size` parameter: Number of results per page
- `page` parameter: Page number (0-indexed)
- `_links` in response: URLs for next/previous pages

## Best Practices

### Query Strategy
- Start with web interface to identify relevant EFO terms and study accessions
- Use API for bulk data extraction and automated analyses
- Implement pagination handling for large result sets
- Cache API responses to minimize redundant requests

### Data Interpretation
- Always check p-value thresholds (genome-wide: 5×10⁻⁸)
- Review ancestry information for population applicability
- Consider sample size when assessing evidence strength
- Check for replication across independent studies
- Be aware of winner's curse in effect size estimates

### Rate Limiting and Ethics
- Respect API usage guidelines (no excessive requests)
- Use summary statistics downloads for genome-wide analyses
- Implement appropriate delays between API calls
- Cache results locally when performing iterative analyses
- Cite the GWAS Catalog in publications

### Data Quality Considerations
- GWAS Catalog curates published associations (may contain inconsistencies)
- Effect sizes reported as published (may need harmonization)
- Some studies report conditional or joint associations
- Check for study overlap when combining results
- Be aware of ascertainment and selection biases

## Python Integration Example

Complete workflow for querying and analyzing GWAS data:

```python
import requests
import pandas as pd
from time import sleep

def query_gwas_catalog(trait_id, p_threshold=5e-8):
    """
    Query GWAS Catalog for trait associations

    Args:
        trait_id: EFO trait identifier (e.g., 'EFO_0001360')
        p_threshold: P-value threshold for filtering

    Returns:
        pandas DataFrame with association results
    """
    base_url = "https://www.ebi.ac.uk/gwas/rest/api"
    url = f"{base_url}/efoTraits/{trait_id}/associations"

    headers = {"Content-Type": "application/json"}
    results = []
    page = 0

    while True:
        params = {"page": page, "size": 100}
        response = requests.get(url, params=params, headers=headers)

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
                    'variant': assoc.get('rsId'),
                    'pvalue': pvalue,
                    'risk_allele': assoc.get('strongestAllele'),
                    'or_beta': assoc.get('orPerCopyNum') or assoc.get('betaNum'),
                    'trait': assoc.get('efoTrait'),
                    'pubmed_id': assoc.get('pubmedId')
                })

        page += 1
        sleep(0.1)  # Rate limiting

    return pd.DataFrame(results)

# Example usage
df = query_gwas_catalog('EFO_0001360')  # Type 2 diabetes
print(df.head())
print(f"\nTotal associations: {len(df)}")
print(f"Unique variants: {df['variant'].nunique()}")
```

## Resources

### references/api_reference.md

Comprehensive API documentation including:
- Detailed endpoint specifications for both APIs
- Complete list of query parameters and filters
- Response format specifications and field descriptions
- Advanced query examples and patterns
- Error handling and troubleshooting
- Integration with external databases

Consult this reference when:
- Constructing complex API queries
- Understanding response structures
- Implementing pagination or batch operations
- Troubleshooting API errors
- Exploring advanced filtering options

### Training Materials

The GWAS Catalog team provides workshop materials:
- GitHub repository: https://github.com/EBISPOT/GWAS_Catalog-workshop
- Jupyter notebooks with example queries
- Google Colab integration for cloud execution

## Important Notes

### Data Updates
- The GWAS Catalog is updated regularly with new publications
- Re-run queries periodically for comprehensive coverage
- Summary statistics are added as studies release data
- EFO mappings may be updated over time

### Citation Requirements
When using GWAS Catalog data, cite:
- Sollis E, et al. (2023) The NHGRI-EBI GWAS Catalog: knowledgebase and deposition resource. Nucleic Acids Research. PMID: 37953337
- Include access date and version when available
- Cite original studies when discussing specific findings

### Limitations
- Not all GWAS publications are included (curation criteria apply)
- Full summary statistics available for subset of studies
- Effect sizes may require harmonization across studies
- Population diversity is growing but historically limited
- Some associations represent conditional or joint effects

### Data Access
- Web interface: Free, no registration required
- REST APIs: Free, no API key needed
- FTP downloads: Open access
- Rate limiting applies to API (be respectful)

## Additional Resources

- **GWAS Catalog website**: https://www.ebi.ac.uk/gwas/
- **Documentation**: https://www.ebi.ac.uk/gwas/docs
- **API documentation**: https://www.ebi.ac.uk/gwas/rest/docs/api
- **Summary Statistics API**: https://www.ebi.ac.uk/gwas/summary-statistics/docs/
- **FTP site**: http://ftp.ebi.ac.uk/pub/databases/gwas/
- **Training materials**: https://github.com/EBISPOT/GWAS_Catalog-workshop
- **PGS Catalog** (polygenic scores): https://www.pgscatalog.org/
- **Help and support**: gwas-info@ebi.ac.uk

