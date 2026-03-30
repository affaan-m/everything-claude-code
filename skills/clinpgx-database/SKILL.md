---
name: clinpgx-database
description: Access ClinPGx pharmacogenomics data (successor to PharmGKB). Query gene-drug interactions, CPIC guidelines, allele functions, for precision medicine and genotype-guided dosing decisions.
license: Unknown
metadata:
    skill-author: K-Dense Inc.
---

# ClinPGx Database

## Overview

ClinPGx (Clinical Pharmacogenomics Database) is a comprehensive resource for clinical pharmacogenomics information, successor to PharmGKB. It consolidates data from PharmGKB, CPIC, and PharmCAT, providing curated information on how genetic variation affects medication response. Access gene-drug pairs, clinical guidelines, allele functions, and drug labels for precision medicine applications.

## When to Use This Skill

This skill should be used when:

- **Gene-drug interactions**: Querying how genetic variants affect drug metabolism, efficacy, or toxicity
- **CPIC guidelines**: Accessing evidence-based clinical practice guidelines for pharmacogenetics
- **Allele information**: Retrieving allele function, frequency, and phenotype data
- **Drug labels**: Exploring FDA and other regulatory pharmacogenomic drug labeling
- **Pharmacogenomic annotations**: Accessing curated literature on gene-drug-disease relationships
- **Clinical decision support**: Using PharmDOG tool for phenoconversion and custom genotype interpretation
- **Precision medicine**: Implementing pharmacogenomic testing in clinical practice
- **Drug metabolism**: Understanding CYP450 and other pharmacogene functions
- **Personalized dosing**: Finding genotype-guided dosing recommendations
- **Adverse drug reactions**: Identifying genetic risk factors for drug toxicity

## Installation and Setup

### Python API Access

The ClinPGx REST API provides programmatic access to all database resources. Basic setup:

```bash
uv pip install requests
```

### API Endpoint

```python
BASE_URL = "https://api.clinpgx.org/v1/"
```

**Rate Limits**:
- 2 requests per second maximum
- Excessive requests will result in HTTP 429 (Too Many Requests) response

**Authentication**: Not required for basic access

**Data License**: Creative Commons Attribution-ShareAlike 4.0 International License

For substantial API use, notify the ClinPGx team at api@clinpgx.org

## Core Capabilities

### 1. Gene Queries

**Retrieve gene information** including function, clinical annotations, and pharmacogenomic significance:

```python
import requests

# Get gene details
response = requests.get("https://api.clinpgx.org/v1/gene/CYP2D6")
gene_data = response.json()

# Search for genes by name
response = requests.get("https://api.clinpgx.org/v1/gene",
                       params={"q": "CYP"})
genes = response.json()
```

**Key pharmacogenes**:
- **CYP450 enzymes**: CYP2D6, CYP2C19, CYP2C9, CYP3A4, CYP3A5
- **Transporters**: SLCO1B1, ABCB1, ABCG2
- **Other metabolizers**: TPMT, DPYD, NUDT15, UGT1A1
- **Receptors**: OPRM1, HTR2A, ADRB1
- **HLA genes**: HLA-B, HLA-A

### 2. Drug and Chemical Queries

**Retrieve drug information** including pharmacogenomic annotations and mechanisms:

```python
# Get drug details
response = requests.get("https://api.clinpgx.org/v1/chemical/PA448515")  # Warfarin
drug_data = response.json()

# Search drugs by name
response = requests.get("https://api.clinpgx.org/v1/chemical",
                       params={"name": "warfarin"})
drugs = response.json()
```

**Drug categories with pharmacogenomic significance**:
- Anticoagulants (warfarin, clopidogrel)
- Antidepressants (SSRIs, TCAs)
- Immunosuppressants (tacrolimus, azathioprine)
- Oncology drugs (5-fluorouracil, irinotecan, tamoxifen)
- Cardiovascular drugs (statins, beta-blockers)
- Pain medications (codeine, tramadol)
- Antivirals (abacavir)

### 3. Gene-Drug Pair Queries

**Access curated gene-drug relationships** with clinical annotations:

```python
# Get gene-drug pair information
response = requests.get("https://api.clinpgx.org/v1/geneDrugPair",
                       params={"gene": "CYP2D6", "drug": "codeine"})
pair_data = response.json()

# Get all pairs for a gene
response = requests.get("https://api.clinpgx.org/v1/geneDrugPair",
                       params={"gene": "CYP2C19"})
all_pairs = response.json()
```

**Clinical annotation sources**:
- CPIC (Clinical Pharmacogenetics Implementation Consortium)
- DPWG (Dutch Pharmacogenetics Working Group)
- FDA (Food and Drug Administration) labels
- Peer-reviewed literature summary annotations

### 4. CPIC Guidelines

**Access evidence-based clinical practice guidelines**:

```python
# Get CPIC guideline
response = requests.get("https://api.clinpgx.org/v1/guideline/PA166104939")
guideline = response.json()

# List all CPIC guidelines
response = requests.get("https://api.clinpgx.org/v1/guideline",
                       params={"source": "CPIC"})
guidelines = response.json()
```

**CPIC guideline components**:
- Gene-drug pairs covered
- Clinical recommendations by phenotype
- Evidence levels and strength ratings
- Supporting literature
- Downloadable PDFs and supplementary materials
- Implementation considerations

**Example guidelines**:
- CYP2D6-codeine (avoid in ultra-rapid metabolizers)
- CYP2C19-clopidogrel (alternative therapy for poor metabolizers)
- TPMT-azathioprine (dose reduction for intermediate/poor metabolizers)
- DPYD-fluoropyrimidines (dose adjustment based on activity)
- HLA-B*57:01-abacavir (avoid if positive)

### 5. Allele and Variant Information

**Query allele function and frequency data**:

```python
# Get allele information
response = requests.get("https://api.clinpgx.org/v1/allele/CYP2D6*4")
allele_data = response.json()

# Get all alleles for a gene
response = requests.get("https://api.clinpgx.org/v1/allele",
                       params={"gene": "CYP2D6"})
alleles = response.json()
```

**Allele information includes**:
- Functional status (normal, decreased, no function, increased, uncertain)
- Population frequencies across ethnic groups
- Defining variants (SNPs, indels, CNVs)
- Phenotype assignment
- References to PharmVar and other nomenclature systems

**Phenotype categories**:
- **Ultra-rapid metabolizer** (UM): Increased enzyme activity
- **Normal metabolizer** (NM): Normal enzyme activity
- **Intermediate metabolizer** (IM): Reduced enzyme activity
- **Poor metabolizer** (PM): Little to no enzyme activity

### 6. Variant Annotations

**Access clinical annotations for specific genetic variants**:

```python
# Get variant information
response = requests.get("https://api.clinpgx.org/v1/variant/rs4244285")
variant_data = response.json()

# Search variants by position (if supported)
response = requests.get("https://api.clinpgx.org/v1/variant",
                       params={"chromosome": "10", "position": "94781859"})
variants = response.json()
```

**Variant data includes**:
- rsID and genomic coordinates
- Gene and functional consequence
- Allele associations
- Clinical significance
- Population frequencies
- Literature references

### 7. Clinical Annotations

**Retrieve curated literature annotations** (formerly PharmGKB clinical annotations):

```python
# Get clinical annotations
response = requests.get("https://api.clinpgx.org/v1/clinicalAnnotation",
                       params={"gene": "CYP2D6"})
annotations = response.json()

# Filter by evidence level
response = requests.get("https://api.clinpgx.org/v1/clinicalAnnotation",
                       params={"evidenceLevel": "1A"})
high_evidence = response.json()
```

**Evidence levels** (from highest to lowest):
- **Level 1A**: High-quality evidence, CPIC/FDA/DPWG guidelines
- **Level 1B**: High-quality evidence, not yet guideline
- **Level 2A**: Moderate evidence from well-designed studies
- **Level 2B**: Moderate evidence with some limitations
- **Level 3**: Limited or conflicting evidence
- **Level 4**: Case reports or weak evidence

### 8. Drug Labels

**Access pharmacogenomic information from drug labels**:

```python
# Get drug labels with PGx information
response = requests.get("https://api.clinpgx.org/v1/drugLabel",
                       params={"drug": "warfarin"})
labels = response.json()

# Filter by regulatory source
response = requests.get("https://api.clinpgx.org/v1/drugLabel",
                       params={"source": "FDA"})
fda_labels = response.json()
```

**Label information includes**:
- Testing recommendations
- Dosing guidance by genotype
- Warnings and precautions
- Biomarker information
- Regulatory source (FDA, EMA, PMDA, etc.)

### 9. Pathways

**Explore pharmacokinetic and pharmacodynamic pathways**:

```python
# Get pathway information
response = requests.get("https://api.clinpgx.org/v1/pathway/PA146123006")  # Warfarin pathway
pathway_data = response.json()

# Search pathways by drug
response = requests.get("https://api.clinpgx.org/v1/pathway",
                       params={"drug": "warfarin"})
pathways = response.json()
```

**Pathway diagrams** show:
- Drug metabolism steps
- Enzymes and transporters involved
- Gene variants affecting each step
- Downstream effects on efficacy/toxicity
- Interactions with other pathways

## Query Workflow

### Workflow 1: Clinical Decision Support for Drug Prescription

1. **Identify patient genotype** for relevant pharmacogenes:
   ```python
   # Example: Patient is CYP2C19 *1/*2 (intermediate metabolizer)
   response = requests.get("https://api.clinpgx.org/v1/allele/CYP2C19*2")
   allele_function = response.json()
   ```

2. **Query gene-drug pairs** for medication of interest:
   ```python
   response = requests.get("https://api.clinpgx.org/v1/geneDrugPair",
                          params={"gene": "CYP2C19", "drug": "clopidogrel"})
   pair_info = response.json()
   ```

3. **Retrieve CPIC guideline** for dosing recommendations:
   ```python
   response = requests.get("https://api.clinpgx.org/v1/guideline",
                          params={"gene": "CYP2C19", "drug": "clopidogrel"})
   guideline = response.json()
   # Recommendation: Alternative antiplatelet therapy for IM/PM
   ```

4. **Check drug label** for regulatory guidance:
   ```python
   response = requests.get("https://api.clinpgx.org/v1/drugLabel",
                          params={"drug": "clopidogrel"})
   label = response.json()
   ```

### Workflow 2: Gene Panel Analysis

1. **Get list of pharmacogenes** in clinical panel:
   ```python
   pgx_panel = ["CYP2C19", "CYP2D6", "CYP2C9", "TPMT", "DPYD", "SLCO1B1"]
   ```

2. **For each gene, retrieve all drug interactions**:
   ```python
   all_interactions = {}
   for gene in pgx_panel:
       response = requests.get("https://api.clinpgx.org/v1/geneDrugPair",
                              params={"gene": gene})
       all_interactions[gene] = response.json()
   ```

3. **Filter for CPIC guideline-level evidence**:
   ```python
   for gene, pairs in all_interactions.items():
       for pair in pairs:
           if pair.get('cpicLevel'):  # Has CPIC guideline
               print(f"{gene} - {pair['drug']}: {pair['cpicLevel']}")
   ```

4. **Generate patient report** with actionable pharmacogenomic findings.

### Workflow 3: Drug Safety Assessment

1. **Query drug for PGx associations**:
   ```python
   response = requests.get("https://api.clinpgx.org/v1/chemical",
                          params={"name": "abacavir"})
   drug_id = response.json()[0]['id']
   ```

2. **Get clinical annotations**:
   ```python
   response = requests.get("https://api.clinpgx.org/v1/clinicalAnnotation",
                          params={"drug": drug_id})
   annotations = response.json()
   ```

3. **Check for HLA associations** and toxicity risk:
   ```python
   for annotation in annotations:
       if 'HLA' in annotation.get('genes', []):
           print(f"Toxicity risk: {annotation['phenotype']}")
           print(f"Evidence level: {annotation['evidenceLevel']}")
   ```

4. **Retrieve screening recommendations** from guidelines and labels.

### Workflow 4: Research Analysis - Population Pharmacogenomics

1. **Get allele frequencies** for population comparison:
   ```python
   response = requests.get("https://api.clinpgx.org/v1/allele",
                          params={"gene": "CYP2D6"})
   alleles = response.json()
   ```

2. **Extract population-specific frequencies**:
   ```python
   populations = ['European', 'African', 'East Asian', 'Latino']
   frequency_data = {}
   for allele in alleles:
       allele_name = allele['name']
       frequency_data[allele_name] = {
           pop: allele.get(f'{pop}_frequency', 'N/A')
           for pop in populations
       }
   ```

3. **Calculate phenotype distributions** by population:
   ```python
   # Combine allele frequencies with function to predict phenotypes
   phenotype_dist = calculate_phenotype_frequencies(frequency_data)
   ```

4. **Analyze implications** for drug dosing in diverse populations.

### Workflow 5: Literature Evidence Review

1. **Search for gene-drug pair**:
   ```python
   response = requests.get("https://api.clinpgx.org/v1/geneDrugPair",
                          params={"gene": "TPMT", "drug": "azathioprine"})
   pair = response.json()
   ```

2. **Retrieve all clinical annotations**:
   ```python
   response = requests.get("https://api.clinpgx.org/v1/clinicalAnnotation",
                          params={"gene": "TPMT", "drug": "azathioprine"})
   annotations = response.json()
   ```

3. **Filter by evidence level and publication date**:
   ```python
   high_quality = [a for a in annotations
                   if a['evidenceLevel'] in ['1A', '1B', '2A']]
   ```

4. **Extract PMIDs** and retrieve full references:
   ```python
   pmids = [a['pmid'] for a in high_quality if 'pmid' in a]
   # Use PubMed skill to retrieve full citations
   ```

## Rate Limiting and Best Practices

### Rate Limit Compliance

```python
import time

def rate_limited_request(url, params=None, delay=0.5):
    """Make API request with rate limiting (2 req/sec max)"""
    response = requests.get(url, params=params)
    time.sleep(delay)  # Wait 0.5 seconds between requests
    return response

# Use in loops
genes = ["CYP2D6", "CYP2C19", "CYP2C9"]
for gene in genes:
    response = rate_limited_request(
        "https://api.clinpgx.org/v1/gene/" + gene
    )
    data = response.json()
```

### Error Handling

```python
def safe_api_call(url, params=None, max_retries=3):
    """API call with error handling and retries"""
    for attempt in range(max_retries):
        try:
            response = requests.get(url, params=params, timeout=10)

            if response.status_code == 200:
                return response.json()
            elif response.status_code == 429:
                # Rate limit exceeded
                wait_time = 2 ** attempt  # Exponential backoff
                print(f"Rate limit hit. Waiting {wait_time}s...")
                time.sleep(wait_time)
            else:
                response.raise_for_status()

        except requests.exceptions.RequestException as e:
            print(f"Attempt {attempt + 1} failed: {e}")
            if attempt == max_retries - 1:
                raise
            time.sleep(1)
```

### Caching Results

```python
import json
from pathlib import Path

def cached_query(cache_file, api_func, *args, **kwargs):
    """Cache API results to avoid repeated queries"""
    cache_path = Path(cache_file)

    if cache_path.exists():
        with open(cache_path) as f:
            return json.load(f)

    result = api_func(*args, **kwargs)

    with open(cache_path, 'w') as f:
        json.dump(result, f, indent=2)

    return result

# Usage
gene_data = cached_query(
    'cyp2d6_cache.json',
    rate_limited_request,
    "https://api.clinpgx.org/v1/gene/CYP2D6"
)
```

## PharmDOG Tool

PharmDOG (formerly DDRx) is ClinPGx's clinical decision support tool for interpreting pharmacogenomic test results:

**Key features**:
- **Phenoconversion calculator**: Adjusts phenotype predictions for drug-drug interactions affecting CYP2D6
- **Custom genotypes**: Input patient genotypes to get phenotype predictions
- **QR code sharing**: Generate shareable patient reports
- **Flexible guidance sources**: Select which guidelines to apply (CPIC, DPWG, FDA)
- **Multi-drug analysis**: Assess multiple medications simultaneously

**Access**: Available at https://www.clinpgx.org/pharmacogenomic-decision-support

**Use cases**:
- Clinical interpretation of PGx panel results
- Medication review for patients with known genotypes
- Patient education materials
- Point-of-care decision support

## Resources

### scripts/query_clinpgx.py

Python script with ready-to-use functions for common ClinPGx queries:

- `get_gene_info(gene_symbol)` - Retrieve gene details
- `get_drug_info(drug_name)` - Get drug information
- `get_gene_drug_pairs(gene, drug)` - Query gene-drug interactions
- `get_cpic_guidelines(gene, drug)` - Retrieve CPIC guidelines
- `get_alleles(gene)` - Get all alleles for a gene
- `get_clinical_annotations(gene, drug, evidence_level)` - Query literature annotations
- `get_drug_labels(drug)` - Retrieve pharmacogenomic drug labels
- `search_variants(rsid)` - Search by variant rsID
- `export_to_dataframe(data)` - Convert results to pandas DataFrame

Consult this script for implementation examples with proper rate limiting and error handling.

### references/api_reference.md

Comprehensive API documentation including:

- Complete endpoint listing with parameters
- Request/response format specifications
- Example queries for each endpoint
- Filter operators and search patterns
- Data schema definitions
- Rate limiting details
- Authentication requirements (if any)
- Troubleshooting common errors

Refer to this document when detailed API information is needed or when constructing complex queries.

## Important Notes

### Data Sources and Integration

ClinPGx consolidates multiple authoritative sources:
- **PharmGKB**: Curated pharmacogenomics knowledge base (now part of ClinPGx)
- **CPIC**: Evidence-based clinical implementation guidelines
- **PharmCAT**: Allele calling and phenotype interpretation tool
- **DPWG**: Dutch pharmacogenetics guidelines
- **FDA/EMA labels**: Regulatory pharmacogenomic information

As of July 2025, all PharmGKB URLs redirect to corresponding ClinPGx pages.

### Clinical Implementation Considerations

- **Evidence levels**: Always check evidence strength before clinical application
- **Population differences**: Allele frequencies vary significantly across populations
- **Phenoconversion**: Consider drug-drug interactions that affect enzyme activity
- **Multi-gene effects**: Some drugs affected by multiple pharmacogenes
- **Non-genetic factors**: Age, organ function, drug interactions also affect response
- **Testing limitations**: Not all clinically relevant alleles detected by all assays

### Data Updates

- ClinPGx continuously updates with new evidence and guidelines
- Check publication dates for clinical annotations
- Monitor ClinPGx Blog (https://blog.clinpgx.org/) for announcements
- CPIC guidelines updated as new evidence emerges
- PharmVar provides nomenclature updates for allele definitions

### API Stability

- API endpoints are relatively stable but may change during development
- Parameters and response formats subject to modification
- Monitor API changelog and ClinPGx blog for updates
- Consider version pinning for production applications
- Test API changes in development before production deployment

## Common Use Cases

### Pre-emptive Pharmacogenomic Testing

Query all clinically actionable gene-drug pairs to guide panel selection:

```python
# Get all CPIC guideline pairs
response = requests.get("https://api.clinpgx.org/v1/geneDrugPair",
                       params={"cpicLevel": "A"})  # Level A recommendations
actionable_pairs = response.json()
```

### Medication Therapy Management

Review patient medications against known genotypes:

```python
patient_genes = {"CYP2C19": "*1/*2", "CYP2D6": "*1/*1", "SLCO1B1": "*1/*5"}
medications = ["clopidogrel", "simvastatin", "escitalopram"]

for med in medications:
    for gene in patient_genes:
        response = requests.get("https://api.clinpgx.org/v1/geneDrugPair",
                               params={"gene": gene, "drug": med})
        # Check for interactions and dosing guidance
```

### Clinical Trial Eligibility

Screen for pharmacogenomic contraindications:

```python
# Check for HLA-B*57:01 before abacavir trial
response = requests.get("https://api.clinpgx.org/v1/geneDrugPair",
                       params={"gene": "HLA-B", "drug": "abacavir"})
pair_info = response.json()
# CPIC: Do not use if HLA-B*57:01 positive
```

## Additional Resources

- **ClinPGx website**: https://www.clinpgx.org/
- **ClinPGx Blog**: https://blog.clinpgx.org/
- **API documentation**: https://api.clinpgx.org/
- **CPIC website**: https://cpicpgx.org/
- **PharmCAT**: https://pharmcat.clinpgx.org/
- **ClinGen**: https://clinicalgenome.org/
- **Contact**: api@clinpgx.org (for substantial API use)

