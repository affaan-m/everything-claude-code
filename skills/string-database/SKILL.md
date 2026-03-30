---
name: string-database
description: Query STRING API for protein-protein interactions (59M proteins, 20B interactions). Network analysis, GO/KEGG enrichment, interaction discovery, 5000+ species, for systems biology.
license: Unknown
metadata:
    skill-author: K-Dense Inc.
---

# STRING Database

## Overview

STRING is a comprehensive database of known and predicted protein-protein interactions covering 59M proteins and 20B+ interactions across 5000+ organisms. Query interaction networks, perform functional enrichment, discover partners via REST API for systems biology and pathway analysis.

## When to Use This Skill

This skill should be used when:
- Retrieving protein-protein interaction networks for single or multiple proteins
- Performing functional enrichment analysis (GO, KEGG, Pfam) on protein lists
- Discovering interaction partners and expanding protein networks
- Testing if proteins form significantly enriched functional modules
- Generating network visualizations with evidence-based coloring
- Analyzing homology and protein family relationships
- Conducting cross-species protein interaction comparisons
- Identifying hub proteins and network connectivity patterns

## Quick Start

The skill provides:
1. Python helper functions (`scripts/string_api.py`) for all STRING REST API operations
2. Comprehensive reference documentation (`references/string_reference.md`) with detailed API specifications

When users request STRING data, determine which operation is needed and use the appropriate function from `scripts/string_api.py`.

## Core Operations

### 1. Identifier Mapping (`string_map_ids`)

Convert gene names, protein names, and external IDs to STRING identifiers.

**When to use**: Starting any STRING analysis, validating protein names, finding canonical identifiers.

**Usage**:
```python
from scripts.string_api import string_map_ids

# Map single protein
result = string_map_ids('TP53', species=9606)

# Map multiple proteins
result = string_map_ids(['TP53', 'BRCA1', 'EGFR', 'MDM2'], species=9606)

# Map with multiple matches per query
result = string_map_ids('p53', species=9606, limit=5)
```

**Parameters**:
- `species`: NCBI taxon ID (9606 = human, 10090 = mouse, 7227 = fly)
- `limit`: Number of matches per identifier (default: 1)
- `echo_query`: Include query term in output (default: 1)

**Best practice**: Always map identifiers first for faster subsequent queries.

### 2. Network Retrieval (`string_network`)

Get protein-protein interaction network data in tabular format.

**When to use**: Building interaction networks, analyzing connectivity, retrieving interaction evidence.

**Usage**:
```python
from scripts.string_api import string_network

# Get network for single protein
network = string_network('9606.ENSP00000269305', species=9606)

# Get network with multiple proteins
proteins = ['9606.ENSP00000269305', '9606.ENSP00000275493']
network = string_network(proteins, required_score=700)

# Expand network with additional interactors
network = string_network('TP53', species=9606, add_nodes=10, required_score=400)

# Physical interactions only
network = string_network('TP53', species=9606, network_type='physical')
```

**Parameters**:
- `required_score`: Confidence threshold (0-1000)
  - 150: low confidence (exploratory)
  - 400: medium confidence (default, standard analysis)
  - 700: high confidence (conservative)
  - 900: highest confidence (very stringent)
- `network_type`: `'functional'` (all evidence, default) or `'physical'` (direct binding only)
- `add_nodes`: Add N most connected proteins (0-10)

**Output columns**: Interaction pairs, confidence scores, and individual evidence scores (neighborhood, fusion, coexpression, experimental, database, text-mining).

### 3. Network Visualization (`string_network_image`)

Generate network visualization as PNG image.

**When to use**: Creating figures, visual exploration, presentations.

**Usage**:
```python
from scripts.string_api import string_network_image

# Get network image
proteins = ['TP53', 'MDM2', 'ATM', 'CHEK2', 'BRCA1']
img_data = string_network_image(proteins, species=9606, required_score=700)

# Save image
with open('network.png', 'wb') as f:
    f.write(img_data)

# Evidence-colored network
img = string_network_image(proteins, species=9606, network_flavor='evidence')

# Confidence-based visualization
img = string_network_image(proteins, species=9606, network_flavor='confidence')

# Actions network (activation/inhibition)
img = string_network_image(proteins, species=9606, network_flavor='actions')
```

**Network flavors**:
- `'evidence'`: Colored lines show evidence types (default)
- `'confidence'`: Line thickness represents confidence
- `'actions'`: Shows activating/inhibiting relationships

### 4. Interaction Partners (`string_interaction_partners`)

Find all proteins that interact with given protein(s).

**When to use**: Discovering novel interactions, finding hub proteins, expanding networks.

**Usage**:
```python
from scripts.string_api import string_interaction_partners

# Get top 10 interactors of TP53
partners = string_interaction_partners('TP53', species=9606, limit=10)

# Get high-confidence interactors
partners = string_interaction_partners('TP53', species=9606,
                                      limit=20, required_score=700)

# Find interactors for multiple proteins
partners = string_interaction_partners(['TP53', 'MDM2'],
                                      species=9606, limit=15)
```

**Parameters**:
- `limit`: Maximum number of partners to return (default: 10)
- `required_score`: Confidence threshold (0-1000)

**Use cases**:
- Hub protein identification
- Network expansion from seed proteins
- Discovering indirect connections

### 5. Functional Enrichment (`string_enrichment`)

Perform enrichment analysis across Gene Ontology, KEGG pathways, Pfam domains, and more.

**When to use**: Interpreting protein lists, pathway analysis, functional characterization, understanding biological processes.

**Usage**:
```python
from scripts.string_enrichment import string_enrichment

# Enrichment for a protein list
proteins = ['TP53', 'MDM2', 'ATM', 'CHEK2', 'BRCA1', 'ATR', 'TP73']
enrichment = string_enrichment(proteins, species=9606)

# Parse results to find significant terms
import pandas as pd
df = pd.read_csv(io.StringIO(enrichment), sep='\t')
significant = df[df['fdr'] < 0.05]
```

**Enrichment categories**:
- **Gene Ontology**: Biological Process, Molecular Function, Cellular Component
- **KEGG Pathways**: Metabolic and signaling pathways
- **Pfam**: Protein domains
- **InterPro**: Protein families and domains
- **SMART**: Domain architecture
- **UniProt Keywords**: Curated functional keywords

**Output columns**:
- `category`: Annotation database (e.g., "KEGG Pathways", "GO Biological Process")
- `term`: Term identifier
- `description`: Human-readable term description
- `number_of_genes`: Input proteins with this annotation
- `p_value`: Uncorrected enrichment p-value
- `fdr`: False discovery rate (corrected p-value)

**Statistical method**: Fisher's exact test with Benjamini-Hochberg FDR correction.

**Interpretation**: FDR < 0.05 indicates statistically significant enrichment.

### 6. PPI Enrichment (`string_ppi_enrichment`)

Test if a protein network has significantly more interactions than expected by chance.

**When to use**: Validating if proteins form functional module, testing network connectivity.

**Usage**:
```python
from scripts.string_api import string_ppi_enrichment
import json

# Test network connectivity
proteins = ['TP53', 'MDM2', 'ATM', 'CHEK2', 'BRCA1']
result = string_ppi_enrichment(proteins, species=9606, required_score=400)

# Parse JSON result
data = json.loads(result)
print(f"Observed edges: {data['number_of_edges']}")
print(f"Expected edges: {data['expected_number_of_edges']}")
print(f"P-value: {data['p_value']}")
```

**Output fields**:
- `number_of_nodes`: Proteins in network
- `number_of_edges`: Observed interactions
- `expected_number_of_edges`: Expected in random network
- `p_value`: Statistical significance

**Interpretation**:
- p-value < 0.05: Network is significantly enriched (proteins likely form functional module)
- p-value ≥ 0.05: No significant enrichment (proteins may be unrelated)

### 7. Homology Scores (`string_homology`)

Retrieve protein similarity and homology information.

**When to use**: Identifying protein families, paralog analysis, cross-species comparisons.

**Usage**:
```python
from scripts.string_api import string_homology

# Get homology between proteins
proteins = ['TP53', 'TP63', 'TP73']  # p53 family
homology = string_homology(proteins, species=9606)
```

**Use cases**:
- Protein family identification
- Paralog discovery
- Evolutionary analysis

### 8. Version Information (`string_version`)

Get current STRING database version.

**When to use**: Ensuring reproducibility, documenting methods.

**Usage**:
```python
from scripts.string_api import string_version

version = string_version()
print(f"STRING version: {version}")
```

## Common Analysis Workflows

### Workflow 1: Protein List Analysis (Standard Workflow)

**Use case**: Analyze a list of proteins from experiment (e.g., differential expression, proteomics).

```python
from scripts.string_api import (string_map_ids, string_network,
                                string_enrichment, string_ppi_enrichment,
                                string_network_image)

# Step 1: Map gene names to STRING IDs
gene_list = ['TP53', 'BRCA1', 'ATM', 'CHEK2', 'MDM2', 'ATR', 'BRCA2']
mapping = string_map_ids(gene_list, species=9606)

# Step 2: Get interaction network
network = string_network(gene_list, species=9606, required_score=400)

# Step 3: Test if network is enriched
ppi_result = string_ppi_enrichment(gene_list, species=9606)

# Step 4: Perform functional enrichment
enrichment = string_enrichment(gene_list, species=9606)

# Step 5: Generate network visualization
img = string_network_image(gene_list, species=9606,
                          network_flavor='evidence', required_score=400)
with open('protein_network.png', 'wb') as f:
    f.write(img)

# Step 6: Parse and interpret results
```

### Workflow 2: Single Protein Investigation

**Use case**: Deep dive into one protein's interactions and partners.

```python
from scripts.string_api import (string_map_ids, string_interaction_partners,
                                string_network_image)

# Step 1: Map protein name
protein = 'TP53'
mapping = string_map_ids(protein, species=9606)

# Step 2: Get all interaction partners
partners = string_interaction_partners(protein, species=9606,
                                      limit=20, required_score=700)

# Step 3: Visualize expanded network
img = string_network_image(protein, species=9606, add_nodes=15,
                          network_flavor='confidence', required_score=700)
with open('tp53_network.png', 'wb') as f:
    f.write(img)
```

### Workflow 3: Pathway-Centric Analysis

**Use case**: Identify and visualize proteins in a specific biological pathway.

```python
from scripts.string_api import string_enrichment, string_network

# Step 1: Start with known pathway proteins
dna_repair_proteins = ['TP53', 'ATM', 'ATR', 'CHEK1', 'CHEK2',
                       'BRCA1', 'BRCA2', 'RAD51', 'XRCC1']

# Step 2: Get network
network = string_network(dna_repair_proteins, species=9606,
                        required_score=700, add_nodes=5)

# Step 3: Enrichment to confirm pathway annotation
enrichment = string_enrichment(dna_repair_proteins, species=9606)

# Step 4: Parse enrichment for DNA repair pathways
import pandas as pd
import io
df = pd.read_csv(io.StringIO(enrichment), sep='\t')
dna_repair = df[df['description'].str.contains('DNA repair', case=False)]
```

### Workflow 4: Cross-Species Analysis

**Use case**: Compare protein interactions across different organisms.

```python
from scripts.string_api import string_network

# Human network
human_network = string_network('TP53', species=9606, required_score=700)

# Mouse network
mouse_network = string_network('Trp53', species=10090, required_score=700)

# Yeast network (if ortholog exists)
yeast_network = string_network('gene_name', species=4932, required_score=700)
```

### Workflow 5: Network Expansion and Discovery

**Use case**: Start with seed proteins and discover connected functional modules.

```python
from scripts.string_api import (string_interaction_partners, string_network,
                                string_enrichment)

# Step 1: Start with seed protein(s)
seed_proteins = ['TP53']

# Step 2: Get first-degree interactors
partners = string_interaction_partners(seed_proteins, species=9606,
                                      limit=30, required_score=700)

# Step 3: Parse partners to get protein list
import pandas as pd
import io
df = pd.read_csv(io.StringIO(partners), sep='\t')
all_proteins = list(set(df['preferredName_A'].tolist() +
                       df['preferredName_B'].tolist()))

# Step 4: Perform enrichment on expanded network
enrichment = string_enrichment(all_proteins[:50], species=9606)

# Step 5: Filter for interesting functional modules
enrichment_df = pd.read_csv(io.StringIO(enrichment), sep='\t')
modules = enrichment_df[enrichment_df['fdr'] < 0.001]
```

## Common Species

When specifying species, use NCBI taxon IDs:

| Organism | Common Name | Taxon ID |
|----------|-------------|----------|
| Homo sapiens | Human | 9606 |
| Mus musculus | Mouse | 10090 |
| Rattus norvegicus | Rat | 10116 |
| Drosophila melanogaster | Fruit fly | 7227 |
| Caenorhabditis elegans | C. elegans | 6239 |
| Saccharomyces cerevisiae | Yeast | 4932 |
| Arabidopsis thaliana | Thale cress | 3702 |
| Escherichia coli | E. coli | 511145 |
| Danio rerio | Zebrafish | 7955 |

Full list available at: https://string-db.org/cgi/input?input_page_active_form=organisms

## Understanding Confidence Scores

STRING provides combined confidence scores (0-1000) integrating multiple evidence types:

### Evidence Channels

1. **Neighborhood (nscore)**: Conserved genomic neighborhood across species
2. **Fusion (fscore)**: Gene fusion events
3. **Phylogenetic Profile (pscore)**: Co-occurrence patterns across species
4. **Coexpression (ascore)**: Correlated RNA expression
5. **Experimental (escore)**: Biochemical and genetic experiments
6. **Database (dscore)**: Curated pathway and complex databases
7. **Text-mining (tscore)**: Literature co-occurrence and NLP extraction

### Recommended Thresholds

Choose threshold based on analysis goals:

- **150 (low confidence)**: Exploratory analysis, hypothesis generation
- **400 (medium confidence)**: Standard analysis, balanced sensitivity/specificity
- **700 (high confidence)**: Conservative analysis, high-confidence interactions
- **900 (highest confidence)**: Very stringent, experimental evidence preferred

**Trade-offs**:
- Lower thresholds: More interactions (higher recall, more false positives)
- Higher thresholds: Fewer interactions (higher precision, more false negatives)

## Network Types

### Functional Networks (Default)

Includes all evidence types (experimental, computational, text-mining). Represents proteins that are functionally associated, even without direct physical binding.

**When to use**:
- Pathway analysis
- Functional enrichment studies
- Systems biology
- Most general analyses

### Physical Networks

Only includes evidence for direct physical binding (experimental data and database annotations for physical interactions).

**When to use**:
- Structural biology studies
- Protein complex analysis
- Direct binding validation
- When physical contact is required

## API Best Practices

1. **Always map identifiers first**: Use `string_map_ids()` before other operations for faster queries
2. **Use STRING IDs when possible**: Use format `9606.ENSP00000269305` instead of gene names
3. **Specify species for networks >10 proteins**: Required for accurate results
4. **Respect rate limits**: Wait 1 second between API calls
5. **Use versioned URLs for reproducibility**: Available in reference documentation
6. **Handle errors gracefully**: Check for "Error:" prefix in returned strings
7. **Choose appropriate confidence thresholds**: Match threshold to analysis goals

## Detailed Reference

For comprehensive API documentation, complete parameter lists, output formats, and advanced usage, refer to `references/string_reference.md`. This includes:

- Complete API endpoint specifications
- All supported output formats (TSV, JSON, XML, PSI-MI)
- Advanced features (bulk upload, values/ranks enrichment)
- Error handling and troubleshooting
- Integration with other tools (Cytoscape, R, Python libraries)
- Data license and citation information

## Troubleshooting

**No proteins found**:
- Verify species parameter matches identifiers
- Try mapping identifiers first with `string_map_ids()`
- Check for typos in protein names

**Empty network results**:
- Lower confidence threshold (`required_score`)
- Check if proteins actually interact
- Verify species is correct

**Timeout or slow queries**:
- Reduce number of input proteins
- Use STRING IDs instead of gene names
- Split large queries into batches

**"Species required" error**:
- Add `species` parameter for networks with >10 proteins
- Always include species for consistency

**Results look unexpected**:
- Check STRING version with `string_version()`
- Verify network_type is appropriate (functional vs physical)
- Review confidence threshold selection

## Additional Resources

For proteome-scale analysis or complete species network upload:
- Visit https://string-db.org
- Use "Upload proteome" feature
- STRING will generate complete interaction network and predict functions

For bulk downloads of complete datasets:
- Download page: https://string-db.org/cgi/download
- Includes complete interaction files, protein annotations, and pathway mappings

## Data License

STRING data is freely available under **Creative Commons BY 4.0** license:
- Free for academic and commercial use
- Attribution required when publishing
- Cite latest STRING publication

## Citation

When using STRING in publications, cite the most recent publication from: https://string-db.org/cgi/about

