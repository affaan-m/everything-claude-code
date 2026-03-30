# Common Gene Database Workflows

This document provides examples of common workflows and use cases for working with NCBI Gene database.

## Table of Contents

1. [Disease Gene Discovery](#disease-gene-discovery)
2. [Gene Annotation Pipeline](#gene-annotation-pipeline)
3. [Cross-Species Gene Comparison](#cross-species-gene-comparison)
4. [Pathway Analysis](#pathway-analysis)
5. [Variant Analysis](#variant-analysis)
6. [Publication Mining](#publication-mining)

---

## Disease Gene Discovery

### Use Case

Identify genes associated with a specific disease or phenotype.

### Workflow

1. **Search by disease name**

```bash
# Find genes associated with Alzheimer's disease
python scripts/query_gene.py --search "Alzheimer disease[disease]" --organism human --max-results 50
```

2. **Filter by chromosome location**

```bash
# Find genes on chromosome 17 associated with breast cancer
python scripts/query_gene.py --search "breast cancer[disease] AND 17[chromosome]" --organism human
```

3. **Retrieve detailed information**

```python
# Python example: Get gene details for disease-associated genes
import json
from scripts.query_gene import esearch, esummary

# Search for genes
query = "diabetes[disease] AND human[organism]"
gene_ids = esearch(query, retmax=100, api_key="YOUR_KEY")

# Get summaries
summaries = esummary(gene_ids, api_key="YOUR_KEY")

# Extract relevant information
for gene_id in gene_ids:
    if gene_id in summaries['result']:
        gene = summaries['result'][gene_id]
        print(f"{gene['name']}: {gene['description']}")
```

### Expected Output

- List of genes with disease associations
- Gene symbols, descriptions, and chromosomal locations
- Related publications and clinical annotations

---

## Gene Annotation Pipeline

### Use Case

Annotate a list of gene identifiers with comprehensive metadata.

### Workflow

1. **Prepare gene list**

Create a file `genes.txt` with gene symbols (one per line):
```
BRCA1
TP53
EGFR
KRAS
```

2. **Batch lookup**

```bash
python scripts/batch_gene_lookup.py --file genes.txt --organism human --output annotations.json --api-key YOUR_KEY
```

3. **Parse results**

```python
import json

with open('annotations.json', 'r') as f:
    genes = json.load(f)

for gene in genes:
    if 'gene_id' in gene:
        print(f"Symbol: {gene['symbol']}")
        print(f"ID: {gene['gene_id']}")
        print(f"Description: {gene['description']}")
        print(f"Location: chr{gene['chromosome']}:{gene['map_location']}")
        print()
```

4. **Enrich with sequence data**

```bash
# Get detailed data including sequences for specific genes
python scripts/fetch_gene_data.py --gene-id 672 --verbose > BRCA1_detailed.json
```

### Use Cases

- Creating gene annotation tables for publications
- Validating gene lists before analysis
- Building gene reference databases
- Quality control for genomic pipelines

---

## Cross-Species Gene Comparison

### Use Case

Find orthologs or compare the same gene across different species.

### Workflow

1. **Search for gene in multiple organisms**

```bash
# Find TP53 in human
python scripts/fetch_gene_data.py --symbol TP53 --taxon human

# Find TP53 in mouse
python scripts/fetch_gene_data.py --symbol TP53 --taxon mouse

# Find TP53 in zebrafish
python scripts/fetch_gene_data.py --symbol TP53 --taxon zebrafish
```

2. **Compare gene IDs across species**

```python
# Compare gene information across species
species = {
    'human': '9606',
    'mouse': '10090',
    'rat': '10116'
}

gene_symbol = 'TP53'

for organism, taxon_id in species.items():
    # Fetch gene data
    # ... (use fetch_gene_by_symbol)
    print(f"{organism}: {gene_data}")
```

3. **Find orthologs using ELink**

```bash
# Get HomoloGene links for a gene
curl "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?dbfrom=gene&db=homologene&id=7157&retmode=json"
```

### Applications

- Evolutionary studies
- Model organism research
- Comparative genomics
- Cross-species experimental design

---

## Pathway Analysis

### Use Case

Identify genes involved in specific biological pathways or processes.

### Workflow

1. **Search by Gene Ontology (GO) term**

```bash
# Find genes involved in apoptosis
python scripts/query_gene.py --search "GO:0006915[biological process]" --organism human --max-results 100
```

2. **Search by pathway name**

```bash
# Find genes in insulin signaling pathway
python scripts/query_gene.py --search "insulin signaling pathway[pathway]" --organism human
```

3. **Get pathway-related genes**

```python
# Example: Get all genes in a specific pathway
import urllib.request
import json

# Search for pathway genes
query = "MAPK signaling pathway[pathway] AND human[organism]"
url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=gene&term={query}&retmode=json&retmax=200"

with urllib.request.urlopen(url) as response:
    data = json.loads(response.read().decode())
    gene_ids = data['esearchresult']['idlist']

print(f"Found {len(gene_ids)} genes in MAPK signaling pathway")
```

4. **Batch retrieve gene details**

```bash
# Get details for all pathway genes
python scripts/batch_gene_lookup.py --ids 5594,5595,5603,5604 --output mapk_genes.json
```

### Applications

- Pathway enrichment analysis
- Gene set analysis
- Systems biology studies
- Drug target identification

---

## Variant Analysis

### Use Case

Find genes with clinically relevant variants or disease-associated mutations.

### Workflow

1. **Search for genes with clinical variants**

```bash
# Find genes with pathogenic variants
python scripts/query_gene.py --search "pathogenic[clinical significance]" --organism human --max-results 50
```

2. **Link to ClinVar database**

```bash
# Get ClinVar records for a gene
curl "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?dbfrom=gene&db=clinvar&id=672&retmode=json"
```

3. **Search for pharmacogenomic genes**

```bash
# Find genes associated with drug response
python scripts/query_gene.py --search "pharmacogenomic[property]" --organism human
```

4. **Get variant summary data**

```python
# Example: Get genes with known variants
from scripts.query_gene import esearch, efetch

# Search for genes with variants
gene_ids = esearch("has variants[filter] AND human[organism]", retmax=100)

# Fetch detailed records
for gene_id in gene_ids[:10]:  # First 10
    data = efetch([gene_id], retmode='xml')
    # Parse XML for variant information
    print(f"Gene {gene_id} variant data...")
```

### Applications

- Clinical genetics
- Precision medicine
- Pharmacogenomics
- Genetic counseling

---

## Publication Mining

### Use Case

Find genes mentioned in recent publications or link genes to literature.

### Workflow

1. **Search genes mentioned in specific publications**

```bash
# Find genes mentioned in papers about CRISPR
python scripts/query_gene.py --search "CRISPR[text word]" --organism human --max-results 100
```

2. **Get PubMed articles for a gene**

```bash
# Get all publications for BRCA1
curl "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?dbfrom=gene&db=pubmed&id=672&retmode=json"
```

3. **Search by author or journal**

```bash
# Find genes studied by specific research group
python scripts/query_gene.py --search "Smith J[author] AND 2024[pdat]" --organism human
```

4. **Extract gene-publication relationships**

```python
# Example: Build gene-publication network
from scripts.query_gene import esearch, esummary
import urllib.request
import json

# Get gene
gene_id = '672'

# Get publications for gene
url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?dbfrom=gene&db=pubmed&id={gene_id}&retmode=json"

with urllib.request.urlopen(url) as response:
    data = json.loads(response.read().decode())

# Extract PMIDs
pmids = []
for linkset in data.get('linksets', []):
    for linksetdb in linkset.get('linksetdbs', []):
        pmids.extend(linksetdb.get('links', []))

print(f"Gene {gene_id} has {len(pmids)} publications")
```

### Applications

- Literature reviews
- Grant writing
- Knowledge base construction
- Trend analysis in genomics research

---

## Advanced Patterns

### Combining Multiple Searches

```python
# Example: Find genes at intersection of multiple criteria
def find_genes_multi_criteria(organism='human'):
    # Criteria 1: Disease association
    disease_genes = set(esearch("diabetes[disease] AND human[organism]"))

    # Criteria 2: Chromosome location
    chr_genes = set(esearch("11[chromosome] AND human[organism]"))

    # Criteria 3: Gene type
    coding_genes = set(esearch("protein coding[gene type] AND human[organism]"))

    # Intersection
    candidates = disease_genes & chr_genes & coding_genes

    return list(candidates)
```

### Rate-Limited Batch Processing

```python
import time

def process_genes_with_rate_limit(gene_ids, batch_size=200, delay=0.1):
    results = []

    for i in range(0, len(gene_ids), batch_size):
        batch = gene_ids[i:i + batch_size]

        # Process batch
        batch_results = esummary(batch)
        results.append(batch_results)

        # Rate limit
        time.sleep(delay)

    return results
```

### Error Handling and Retry

```python
import time

def robust_gene_fetch(gene_id, max_retries=3):
    for attempt in range(max_retries):
        try:
            data = fetch_gene_by_id(gene_id)
            return data
        except Exception as e:
            if attempt < max_retries - 1:
                wait = 2 ** attempt  # Exponential backoff
                time.sleep(wait)
            else:
                print(f"Failed to fetch gene {gene_id}: {e}")
                return None
```

---

## Tips and Best Practices

1. **Start Specific, Then Broaden**: Begin with precise queries and expand if needed
2. **Use Organism Filters**: Always specify organism for gene symbol searches
3. **Validate Results**: Check gene IDs and symbols for accuracy
4. **Cache Frequently Used Data**: Store common queries locally
5. **Monitor Rate Limits**: Use API keys and implement delays
6. **Combine APIs**: Use E-utilities for search, Datasets API for detailed data
7. **Handle Ambiguity**: Gene symbols may refer to different genes in different species
8. **Check Data Currency**: Gene annotations are updated regularly
9. **Use Batch Operations**: Process multiple genes together when possible
10. **Document Your Queries**: Keep records of search terms and parameters
