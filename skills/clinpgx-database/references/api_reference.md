# ClinPGx API Reference

Complete reference documentation for the ClinPGx REST API.

## Base URL

```
https://api.clinpgx.org/v1/
```

## Rate Limiting

- **Maximum rate**: 2 requests per second
- **Enforcement**: Requests exceeding the limit will receive HTTP 429 (Too Many Requests)
- **Best practice**: Implement 500ms delay between requests (0.5 seconds)
- **Recommendation**: For substantial API use, contact api@clinpgx.org

## Authentication

No authentication is required for basic API access. All endpoints are publicly accessible.

## Data License

All data accessed through the API is subject to:
- Creative Commons Attribution-ShareAlike 4.0 International License
- ClinPGx Data Usage Policy

## Response Format

All successful responses return JSON with appropriate HTTP status codes:
- `200 OK`: Successful request
- `404 Not Found`: Resource does not exist
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## Core Endpoints

### 1. Gene Endpoint

Retrieve pharmacogene information including function, variants, and clinical significance.

#### Get Gene by Symbol

```http
GET /v1/gene/{gene_symbol}
```

**Parameters:**
- `gene_symbol` (path, required): Gene symbol (e.g., CYP2D6, TPMT, DPYD)

**Example Request:**
```bash
curl "https://api.clinpgx.org/v1/gene/CYP2D6"
```

**Example Response:**
```json
{
  "id": "PA126",
  "symbol": "CYP2D6",
  "name": "cytochrome P450 family 2 subfamily D member 6",
  "chromosome": "22",
  "chromosomeLocation": "22q13.2",
  "function": "Drug metabolism",
  "description": "Highly polymorphic gene encoding enzyme...",
  "clinicalAnnotations": [...],
  "relatedDrugs": [...]
}
```

#### Search Genes

```http
GET /v1/gene?q={search_term}
```

**Parameters:**
- `q` (query, optional): Search term for gene name or symbol

**Example:**
```bash
curl "https://api.clinpgx.org/v1/gene?q=CYP"
```

### 2. Chemical/Drug Endpoint

Access drug and chemical compound information including pharmacogenomic annotations.

#### Get Drug by ID

```http
GET /v1/chemical/{drug_id}
```

**Parameters:**
- `drug_id` (path, required): ClinPGx drug identifier (e.g., PA448515)

**Example Request:**
```bash
curl "https://api.clinpgx.org/v1/chemical/PA448515"
```

#### Search Drugs by Name

```http
GET /v1/chemical?name={drug_name}
```

**Parameters:**
- `name` (query, optional): Drug name or synonym

**Example:**
```bash
curl "https://api.clinpgx.org/v1/chemical?name=warfarin"
```

**Example Response:**
```json
[
  {
    "id": "PA448515",
    "name": "warfarin",
    "genericNames": ["warfarin sodium"],
    "tradeNames": ["Coumadin", "Jantoven"],
    "drugClasses": ["Anticoagulants"],
    "indication": "Prevention of thrombosis",
    "relatedGenes": ["CYP2C9", "VKORC1", "CYP4F2"]
  }
]
```

### 3. Gene-Drug Pair Endpoint

Query curated gene-drug interaction relationships with clinical annotations.

#### Get Gene-Drug Pairs

```http
GET /v1/geneDrugPair?gene={gene}&drug={drug}
```

**Parameters:**
- `gene` (query, optional): Gene symbol
- `drug` (query, optional): Drug name
- `cpicLevel` (query, optional): Filter by CPIC recommendation level (A, B, C, D)

**Example Requests:**
```bash
# Get all pairs for a gene
curl "https://api.clinpgx.org/v1/geneDrugPair?gene=CYP2D6"

# Get specific gene-drug pair
curl "https://api.clinpgx.org/v1/geneDrugPair?gene=CYP2D6&drug=codeine"

# Get all CPIC Level A pairs
curl "https://api.clinpgx.org/v1/geneDrugPair?cpicLevel=A"
```

**Example Response:**
```json
[
  {
    "gene": "CYP2D6",
    "drug": "codeine",
    "sources": ["CPIC", "FDA", "DPWG"],
    "cpicLevel": "A",
    "evidenceLevel": "1A",
    "clinicalAnnotationCount": 45,
    "hasGuideline": true,
    "guidelineUrl": "https://www.clinpgx.org/guideline/..."
  }
]
```

### 4. Guideline Endpoint

Access clinical practice guidelines from CPIC, DPWG, and other sources.

#### Get Guidelines

```http
GET /v1/guideline?source={source}&gene={gene}&drug={drug}
```

**Parameters:**
- `source` (query, optional): Guideline source (CPIC, DPWG, FDA)
- `gene` (query, optional): Gene symbol
- `drug` (query, optional): Drug name

**Example Requests:**
```bash
# Get all CPIC guidelines
curl "https://api.clinpgx.org/v1/guideline?source=CPIC"

# Get guideline for specific gene-drug
curl "https://api.clinpgx.org/v1/guideline?gene=CYP2C19&drug=clopidogrel"
```

#### Get Guideline by ID

```http
GET /v1/guideline/{guideline_id}
```

**Example:**
```bash
curl "https://api.clinpgx.org/v1/guideline/PA166104939"
```

**Example Response:**
```json
{
  "id": "PA166104939",
  "name": "CPIC Guideline for CYP2C19 and Clopidogrel",
  "source": "CPIC",
  "genes": ["CYP2C19"],
  "drugs": ["clopidogrel"],
  "recommendationLevel": "A",
  "lastUpdated": "2023-08-01",
  "summary": "Alternative antiplatelet therapy recommended for...",
  "recommendations": [...],
  "pdfUrl": "https://www.clinpgx.org/...",
  "pmid": "23400754"
}
```

### 5. Allele Endpoint

Query allele definitions, functions, and population frequencies.

#### Get All Alleles for a Gene

```http
GET /v1/allele?gene={gene_symbol}
```

**Parameters:**
- `gene` (query, required): Gene symbol

**Example Request:**
```bash
curl "https://api.clinpgx.org/v1/allele?gene=CYP2D6"
```

**Example Response:**
```json
[
  {
    "name": "CYP2D6*1",
    "gene": "CYP2D6",
    "function": "Normal function",
    "activityScore": 1.0,
    "frequencies": {
      "European": 0.42,
      "African": 0.37,
      "East Asian": 0.50,
      "Latino": 0.44
    },
    "definingVariants": ["Reference allele"],
    "pharmVarId": "PV00001"
  },
  {
    "name": "CYP2D6*4",
    "gene": "CYP2D6",
    "function": "No function",
    "activityScore": 0.0,
    "frequencies": {
      "European": 0.20,
      "African": 0.05,
      "East Asian": 0.01,
      "Latino": 0.10
    },
    "definingVariants": ["rs3892097"],
    "pharmVarId": "PV00004"
  }
]
```

#### Get Specific Allele

```http
GET /v1/allele/{allele_name}
```

**Parameters:**
- `allele_name` (path, required): Allele name with star nomenclature (e.g., CYP2D6*4)

**Example:**
```bash
curl "https://api.clinpgx.org/v1/allele/CYP2D6*4"
```

### 6. Variant Endpoint

Search for genetic variants and their pharmacogenomic annotations.

#### Get Variant by rsID

```http
GET /v1/variant/{rsid}
```

**Parameters:**
- `rsid` (path, required): dbSNP reference SNP ID

**Example Request:**
```bash
curl "https://api.clinpgx.org/v1/variant/rs4244285"
```

**Example Response:**
```json
{
  "rsid": "rs4244285",
  "chromosome": "10",
  "position": 94781859,
  "gene": "CYP2C19",
  "alleles": ["CYP2C19*2"],
  "consequence": "Splice site variant",
  "clinicalSignificance": "Pathogenic - reduced enzyme activity",
  "frequencies": {
    "European": 0.15,
    "African": 0.18,
    "East Asian": 0.29,
    "Latino": 0.12
  },
  "references": [...]
}
```

#### Search Variants by Position

```http
GET /v1/variant?chromosome={chr}&position={pos}
```

**Parameters:**
- `chromosome` (query, optional): Chromosome number (1-22, X, Y)
- `position` (query, optional): Genomic position (GRCh38)

**Example:**
```bash
curl "https://api.clinpgx.org/v1/variant?chromosome=10&position=94781859"
```

### 7. Clinical Annotation Endpoint

Access curated literature annotations for gene-drug-phenotype relationships.

#### Get Clinical Annotations

```http
GET /v1/clinicalAnnotation?gene={gene}&drug={drug}&evidenceLevel={level}
```

**Parameters:**
- `gene` (query, optional): Gene symbol
- `drug` (query, optional): Drug name
- `evidenceLevel` (query, optional): Evidence level (1A, 1B, 2A, 2B, 3, 4)
- `phenotype` (query, optional): Phenotype or outcome

**Example Requests:**
```bash
# Get all annotations for a gene
curl "https://api.clinpgx.org/v1/clinicalAnnotation?gene=CYP2D6"

# Get high-quality evidence only
curl "https://api.clinpgx.org/v1/clinicalAnnotation?evidenceLevel=1A"

# Get annotations for specific gene-drug pair
curl "https://api.clinpgx.org/v1/clinicalAnnotation?gene=TPMT&drug=azathioprine"
```

**Example Response:**
```json
[
  {
    "id": "PA166153683",
    "gene": "CYP2D6",
    "drug": "codeine",
    "phenotype": "Reduced analgesic effect",
    "evidenceLevel": "1A",
    "annotation": "Poor metabolizers have reduced conversion...",
    "pmid": "24618998",
    "studyType": "Clinical trial",
    "population": "European",
    "sources": ["CPIC"]
  }
]
```

**Evidence Levels:**
- **1A**: High-quality evidence from guidelines (CPIC, FDA, DPWG)
- **1B**: High-quality evidence not yet guideline
- **2A**: Moderate evidence from well-designed studies
- **2B**: Moderate evidence with some limitations
- **3**: Limited or conflicting evidence
- **4**: Case reports or weak evidence

### 8. Drug Label Endpoint

Retrieve regulatory drug label information with pharmacogenomic content.

#### Get Drug Labels

```http
GET /v1/drugLabel?drug={drug_name}&source={source}
```

**Parameters:**
- `drug` (query, required): Drug name
- `source` (query, optional): Regulatory source (FDA, EMA, PMDA, Health Canada)

**Example Requests:**
```bash
# Get all labels for warfarin
curl "https://api.clinpgx.org/v1/drugLabel?drug=warfarin"

# Get only FDA labels
curl "https://api.clinpgx.org/v1/drugLabel?drug=warfarin&source=FDA"
```

**Example Response:**
```json
[
  {
    "id": "DL001234",
    "drug": "warfarin",
    "source": "FDA",
    "sections": {
      "testing": "Consider CYP2C9 and VKORC1 genotyping...",
      "dosing": "Dose adjustment based on genotype...",
      "warnings": "Risk of bleeding in certain genotypes"
    },
    "biomarkers": ["CYP2C9", "VKORC1"],
    "testingRecommended": true,
    "labelUrl": "https://dailymed.nlm.nih.gov/...",
    "lastUpdated": "2024-01-15"
  }
]
```

### 9. Pathway Endpoint

Access pharmacokinetic and pharmacodynamic pathway diagrams and information.

#### Get Pathway by ID

```http
GET /v1/pathway/{pathway_id}
```

**Parameters:**
- `pathway_id` (path, required): ClinPGx pathway identifier

**Example:**
```bash
curl "https://api.clinpgx.org/v1/pathway/PA146123006"
```

#### Search Pathways

```http
GET /v1/pathway?drug={drug_name}&gene={gene}
```

**Parameters:**
- `drug` (query, optional): Drug name
- `gene` (query, optional): Gene symbol

**Example:**
```bash
curl "https://api.clinpgx.org/v1/pathway?drug=warfarin"
```

**Example Response:**
```json
{
  "id": "PA146123006",
  "name": "Warfarin Pharmacokinetics and Pharmacodynamics",
  "drugs": ["warfarin"],
  "genes": ["CYP2C9", "VKORC1", "CYP4F2", "GGCX"],
  "description": "Warfarin is metabolized primarily by CYP2C9...",
  "diagramUrl": "https://www.clinpgx.org/pathway/...",
  "steps": [
    {
      "step": 1,
      "process": "Absorption",
      "genes": []
    },
    {
      "step": 2,
      "process": "Metabolism",
      "genes": ["CYP2C9", "CYP2C19"]
    },
    {
      "step": 3,
      "process": "Target interaction",
      "genes": ["VKORC1"]
    }
  ]
}
```

## Query Patterns and Examples

### Common Query Patterns

#### 1. Patient Medication Review

Query all gene-drug pairs for a patient's medications:

```python
import requests

patient_meds = ["clopidogrel", "simvastatin", "codeine"]
patient_genes = {"CYP2C19": "*1/*2", "CYP2D6": "*1/*1", "SLCO1B1": "*1/*5"}

for med in patient_meds:
    for gene in patient_genes:
        response = requests.get(
            "https://api.clinpgx.org/v1/geneDrugPair",
            params={"gene": gene, "drug": med}
        )
        pairs = response.json()
        # Check for interactions
```

#### 2. Actionable Gene Panel

Find all genes with CPIC Level A recommendations:

```python
response = requests.get(
    "https://api.clinpgx.org/v1/geneDrugPair",
    params={"cpicLevel": "A"}
)
actionable_pairs = response.json()

genes = set(pair['gene'] for pair in actionable_pairs)
print(f"Panel should include: {sorted(genes)}")
```

#### 3. Population Frequency Analysis

Compare allele frequencies across populations:

```python
alleles = requests.get(
    "https://api.clinpgx.org/v1/allele",
    params={"gene": "CYP2D6"}
).json()

# Calculate phenotype frequencies
pm_freq = {}  # Poor metabolizer frequencies
for allele in alleles:
    if allele['function'] == 'No function':
        for pop, freq in allele['frequencies'].items():
            pm_freq[pop] = pm_freq.get(pop, 0) + freq
```

#### 4. Drug Safety Screen

Check for high-risk gene-drug associations:

```python
# Screen for HLA-B*57:01 before abacavir
response = requests.get(
    "https://api.clinpgx.org/v1/geneDrugPair",
    params={"gene": "HLA-B", "drug": "abacavir"}
)
pair = response.json()[0]

if pair['cpicLevel'] == 'A':
    print("CRITICAL: Do not use if HLA-B*57:01 positive")
```

## Error Handling

### Common Error Responses

#### 404 Not Found
```json
{
  "error": "Resource not found",
  "message": "Gene 'INVALID' does not exist"
}
```

#### 429 Too Many Requests
```json
{
  "error": "Rate limit exceeded",
  "message": "Maximum 2 requests per second allowed"
}
```

### Recommended Error Handling Pattern

```python
import requests
import time

def safe_query(url, params=None, max_retries=3):
    for attempt in range(max_retries):
        try:
            response = requests.get(url, params=params, timeout=10)

            if response.status_code == 200:
                time.sleep(0.5)  # Rate limiting
                return response.json()
            elif response.status_code == 429:
                wait = 2 ** attempt
                print(f"Rate limited. Waiting {wait}s...")
                time.sleep(wait)
            elif response.status_code == 404:
                print("Resource not found")
                return None
            else:
                response.raise_for_status()

        except requests.RequestException as e:
            print(f"Attempt {attempt + 1} failed: {e}")
            if attempt == max_retries - 1:
                raise

    return None
```

## Best Practices

### Rate Limiting
- Implement 500ms delay between requests (2 requests/second maximum)
- Use exponential backoff for rate limit errors
- Consider caching results for frequently accessed data
- For bulk operations, contact api@clinpgx.org

### Caching Strategy
```python
import json
from pathlib import Path

def cached_query(cache_file, query_func, *args, **kwargs):
    cache_path = Path(cache_file)

    if cache_path.exists():
        with open(cache_path) as f:
            return json.load(f)

    result = query_func(*args, **kwargs)

    if result:
        with open(cache_path, 'w') as f:
            json.dump(result, f)

    return result
```

### Batch Processing
```python
import time

def batch_gene_query(genes, delay=0.5):
    results = {}
    for gene in genes:
        response = requests.get(f"https://api.clinpgx.org/v1/gene/{gene}")
        if response.status_code == 200:
            results[gene] = response.json()
        time.sleep(delay)
    return results
```

## Data Schema Definitions

### Gene Object
```typescript
{
  id: string;              // ClinPGx gene ID
  symbol: string;          // HGNC gene symbol
  name: string;            // Full gene name
  chromosome: string;      // Chromosome location
  function: string;        // Pharmacogenomic function
  clinicalAnnotations: number;  // Count of annotations
  relatedDrugs: string[];  // Associated drugs
}
```

### Drug Object
```typescript
{
  id: string;              // ClinPGx drug ID
  name: string;            // Generic name
  tradeNames: string[];    // Brand names
  drugClasses: string[];   // Therapeutic classes
  indication: string;      // Primary indication
  relatedGenes: string[];  // Pharmacogenes
}
```

### Gene-Drug Pair Object
```typescript
{
  gene: string;            // Gene symbol
  drug: string;            // Drug name
  sources: string[];       // CPIC, FDA, DPWG, etc.
  cpicLevel: string;       // A, B, C, D
  evidenceLevel: string;   // 1A, 1B, 2A, 2B, 3, 4
  hasGuideline: boolean;   // Has clinical guideline
}
```

### Allele Object
```typescript
{
  name: string;            // Allele name (e.g., CYP2D6*4)
  gene: string;            // Gene symbol
  function: string;        // Normal/decreased/no/increased/uncertain
  activityScore: number;   // 0.0 to 2.0+
  frequencies: {           // Population frequencies
    [population: string]: number;
  };
  definingVariants: string[];  // rsIDs or descriptions
}
```

## API Stability and Versioning

### Current Status
- API version: v1
- Stability: Beta - endpoints stable, parameters may change
- Monitor: https://blog.clinpgx.org/ for updates

### Migration from PharmGKB
As of July 2025, PharmGKB URLs redirect to ClinPGx. Update references:
- Old: `https://api.pharmgkb.org/`
- New: `https://api.clinpgx.org/`

### Future Changes
- Watch for API v2 announcements
- Breaking changes will be announced on ClinPGx Blog
- Consider version pinning for production applications

## Support and Contact

- **API Issues**: api@clinpgx.org
- **Documentation**: https://api.clinpgx.org/
- **General Questions**: https://www.clinpgx.org/page/faqs
- **Blog**: https://blog.clinpgx.org/
- **CPIC Guidelines**: https://cpicpgx.org/

## Related Resources

- **PharmCAT**: Pharmacogenomic variant calling and annotation tool
- **PharmVar**: Pharmacogene allele nomenclature database
- **CPIC**: Clinical Pharmacogenetics Implementation Consortium
- **DPWG**: Dutch Pharmacogenetics Working Group
- **ClinGen**: Clinical Genome Resource
