---
name: reactome-database
description: Query Reactome REST API for pathway analysis, enrichment, gene-pathway mapping, disease pathways, molecular interactions, expression analysis, for systems biology studies.
license: Unknown
metadata:
    skill-author: K-Dense Inc.
---

# Reactome Database

## Overview

Reactome is a free, open-source, curated pathway database with 2,825+ human pathways. Query biological pathways, perform overrepresentation and expression analysis, map genes to pathways, explore molecular interactions via REST API and Python client for systems biology research.

## When to Use This Skill

This skill should be used when:
- Performing pathway enrichment analysis on gene or protein lists
- Analyzing gene expression data to identify relevant biological pathways
- Querying specific pathway information, reactions, or molecular interactions
- Mapping genes or proteins to biological pathways and processes
- Exploring disease-related pathways and mechanisms
- Visualizing analysis results in the Reactome Pathway Browser
- Conducting comparative pathway analysis across species

## Core Capabilities

Reactome provides two main API services and a Python client library:

### 1. Content Service - Data Retrieval

Query and retrieve biological pathway data, molecular interactions, and entity information.

**Common operations:**
- Retrieve pathway information and hierarchies
- Query specific entities (proteins, reactions, complexes)
- Get participating molecules in pathways
- Access database version and metadata
- Explore pathway compartments and locations

**API Base URL:** `https://reactome.org/ContentService`

### 2. Analysis Service - Pathway Analysis

Perform computational analysis on gene lists and expression data.

**Analysis types:**
- **Overrepresentation Analysis**: Identify statistically significant pathways from gene/protein lists
- **Expression Data Analysis**: Analyze gene expression datasets to find relevant pathways
- **Species Comparison**: Compare pathway data across different organisms

**API Base URL:** `https://reactome.org/AnalysisService`

### 3. reactome2py Python Package

Python client library that wraps Reactome API calls for easier programmatic access.

**Installation:**
```bash
uv pip install reactome2py
```

**Note:** The reactome2py package (version 3.0.0, released January 2021) is functional but not actively maintained. For the most up-to-date functionality, consider using direct REST API calls.

## Querying Pathway Data

### Using Content Service REST API

The Content Service uses REST protocol and returns data in JSON or plain text formats.

**Get database version:**
```python
import requests

response = requests.get("https://reactome.org/ContentService/data/database/version")
version = response.text
print(f"Reactome version: {version}")
```

**Query a specific entity:**
```python
import requests

entity_id = "R-HSA-69278"  # Example pathway ID
response = requests.get(f"https://reactome.org/ContentService/data/query/{entity_id}")
data = response.json()
```

**Get participating molecules in a pathway:**
```python
import requests

event_id = "R-HSA-69278"
response = requests.get(
    f"https://reactome.org/ContentService/data/event/{event_id}/participatingPhysicalEntities"
)
molecules = response.json()
```

### Using reactome2py Package

```python
import reactome2py
from reactome2py import content

# Query pathway information
pathway_info = content.query_by_id("R-HSA-69278")

# Get database version
version = content.get_database_version()
```

**For detailed API endpoints and parameters**, refer to `references/api_reference.md` in this skill.

## Performing Pathway Analysis

### Overrepresentation Analysis

Submit a list of gene/protein identifiers to find enriched pathways.

**Using REST API:**
```python
import requests

# Prepare identifier list
identifiers = ["TP53", "BRCA1", "EGFR", "MYC"]
data = "\n".join(identifiers)

# Submit analysis
response = requests.post(
    "https://reactome.org/AnalysisService/identifiers/",
    headers={"Content-Type": "text/plain"},
    data=data
)

result = response.json()
token = result["summary"]["token"]  # Save token to retrieve results later

# Access pathways
for pathway in result["pathways"]:
    print(f"{pathway['stId']}: {pathway['name']} (p-value: {pathway['entities']['pValue']})")
```

**Retrieve analysis by token:**
```python
# Token is valid for 7 days
response = requests.get(f"https://reactome.org/AnalysisService/token/{token}")
results = response.json()
```

### Expression Data Analysis

Analyze gene expression datasets with quantitative values.

**Input format (TSV with header starting with #):**
```
#Gene	Sample1	Sample2	Sample3
TP53	2.5	3.1	2.8
BRCA1	1.2	1.5	1.3
EGFR	4.5	4.2	4.8
```

**Submit expression data:**
```python
import requests

# Read TSV file
with open("expression_data.tsv", "r") as f:
    data = f.read()

response = requests.post(
    "https://reactome.org/AnalysisService/identifiers/",
    headers={"Content-Type": "text/plain"},
    data=data
)

result = response.json()
```

### Species Projection

Map identifiers to human pathways exclusively using the `/projection/` endpoint:

```python
response = requests.post(
    "https://reactome.org/AnalysisService/identifiers/projection/",
    headers={"Content-Type": "text/plain"},
    data=data
)
```

## Visualizing Results

Analysis results can be visualized in the Reactome Pathway Browser by constructing URLs with the analysis token:

```python
token = result["summary"]["token"]
pathway_id = "R-HSA-69278"
url = f"https://reactome.org/PathwayBrowser/#{pathway_id}&DTAB=AN&ANALYSIS={token}"
print(f"View results: {url}")
```

## Working with Analysis Tokens

- Analysis tokens are valid for **7 days**
- Tokens allow retrieval of previously computed results without re-submission
- Store tokens to access results across sessions
- Use `GET /token/{TOKEN}` endpoint to retrieve results

## Data Formats and Identifiers

### Supported Identifier Types

Reactome accepts various identifier formats:
- UniProt accessions (e.g., P04637)
- Gene symbols (e.g., TP53)
- Ensembl IDs (e.g., ENSG00000141510)
- EntrezGene IDs (e.g., 7157)
- ChEBI IDs for small molecules

The system automatically detects identifier types.

### Input Format Requirements

**For overrepresentation analysis:**
- Plain text list of identifiers (one per line)
- OR single column in TSV format

**For expression analysis:**
- TSV format with mandatory header row starting with "#"
- Column 1: identifiers
- Columns 2+: numeric expression values
- Use period (.) as decimal separator

### Output Format

All API responses return JSON containing:
- `pathways`: Array of enriched pathways with statistical metrics
- `summary`: Analysis metadata and token
- `entities`: Matched and unmapped identifiers
- Statistical values: pValue, FDR (false discovery rate)

## Helper Scripts

This skill includes `scripts/reactome_query.py`, a helper script for common Reactome operations:

```bash
# Query pathway information
python scripts/reactome_query.py query R-HSA-69278

# Perform overrepresentation analysis
python scripts/reactome_query.py analyze gene_list.txt

# Get database version
python scripts/reactome_query.py version
```

## Additional Resources

- **API Documentation**: https://reactome.org/dev
- **User Guide**: https://reactome.org/userguide
- **Documentation Portal**: https://reactome.org/documentation
- **Data Downloads**: https://reactome.org/download-data
- **reactome2py Docs**: https://reactome.github.io/reactome2py/

For comprehensive API endpoint documentation, see `references/api_reference.md` in this skill.

## Current Database Statistics (Version 94, September 2025)

- 2,825 human pathways
- 16,002 reactions
- 11,630 proteins
- 2,176 small molecules
- 1,070 drugs
- 41,373 literature references

