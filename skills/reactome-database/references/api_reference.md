# Reactome API Reference

This document provides comprehensive reference information for Reactome's REST APIs.

## Base URLs

- **Content Service**: `https://reactome.org/ContentService`
- **Analysis Service**: `https://reactome.org/AnalysisService`

## Content Service API

The Content Service provides access to Reactome's curated pathway data through REST endpoints.

### Database Information

#### Get Database Version
```
GET /data/database/version
```

**Response:** Plain text containing the database version number

**Example:**
```python
import requests
response = requests.get("https://reactome.org/ContentService/data/database/version")
print(response.text)  # e.g., "94"
```

#### Get Database Name
```
GET /data/database/name
```

**Response:** Plain text containing the database name

### Entity Queries

#### Query Entity by ID
```
GET /data/query/{id}
```

**Parameters:**
- `id` (path): Stable identifier or database ID (e.g., "R-HSA-69278")

**Response:** JSON object containing full entity information including:
- `stId`: Stable identifier
- `displayName`: Human-readable name
- `schemaClass`: Entity type (Pathway, Reaction, Complex, etc.)
- `species`: Array of species information
- Additional type-specific fields

**Example:**
```python
import requests
response = requests.get("https://reactome.org/ContentService/data/query/R-HSA-69278")
pathway = response.json()
print(f"Pathway: {pathway['displayName']}")
print(f"Species: {pathway['species'][0]['displayName']}")
```

#### Query Entity Attribute
```
GET /data/query/{id}/{attribute}
```

**Parameters:**
- `id` (path): Entity identifier
- `attribute` (path): Specific attribute name (e.g., "displayName", "compartment")

**Response:** JSON or plain text depending on attribute type

**Example:**
```python
response = requests.get("https://reactome.org/ContentService/data/query/R-HSA-69278/displayName")
name = response.text
```

### Pathway Queries

#### Get Pathway Entities
```
GET /data/event/{id}/participatingPhysicalEntities
```

**Parameters:**
- `id` (path): Pathway or reaction stable identifier

**Response:** JSON array of physical entities (proteins, complexes, small molecules) participating in the pathway

**Example:**
```python
response = requests.get(
    "https://reactome.org/ContentService/data/event/R-HSA-69278/participatingPhysicalEntities"
)
entities = response.json()
for entity in entities:
    print(f"{entity['stId']}: {entity['displayName']} ({entity['schemaClass']})")
```

#### Get Contained Events
```
GET /data/pathway/{id}/containedEvents
```

**Parameters:**
- `id` (path): Pathway stable identifier

**Response:** JSON array of events (reactions, subpathways) contained within the pathway

### Search Queries

#### Search by Name
```
GET /data/query?name={query}
```

**Parameters:**
- `name` (query): Search term

**Response:** JSON array of matching entities

**Example:**
```python
response = requests.get(
    "https://reactome.org/ContentService/data/query",
    params={"name": "glycolysis"}
)
results = response.json()
```

## Analysis Service API

The Analysis Service performs pathway enrichment and expression analysis.

### Submit Analysis

#### Submit Identifiers (POST)
```
POST /identifiers/
POST /identifiers/projection/  # Map to human pathways only
```

**Headers:**
- `Content-Type: text/plain`

**Body:**
- For overrepresentation: Plain text list of identifiers (one per line)
- For expression analysis: TSV format with header starting with "#"

**Expression data format:**
```
#Gene	Sample1	Sample2	Sample3
TP53	2.5	3.1	2.8
BRCA1	1.2	1.5	1.3
```

**Response:** JSON object containing:
```json
{
  "summary": {
    "token": "MzUxODM3NTQzMDAwMDA1ODI4MA==",
    "type": "OVERREPRESENTATION",
    "species": "9606",
    "sampleName": null,
    "fileName": null,
    "text": true
  },
  "pathways": [
    {
      "stId": "R-HSA-69278",
      "name": "Cell Cycle, Mitotic",
      "species": {
        "name": "Homo sapiens",
        "taxId": "9606"
      },
      "entities": {
        "found": 15,
        "total": 450,
        "pValue": 0.0000234,
        "fdr": 0.00156
      },
      "reactions": {
        "found": 12,
        "total": 342
      }
    }
  ],
  "resourceSummary": [
    {
      "resource": "TOTAL",
      "pathways": 25
    }
  ]
}
```

**Example:**
```python
import requests

# Overrepresentation analysis
identifiers = ["TP53", "BRCA1", "EGFR", "MYC", "CDK1"]
data = "\n".join(identifiers)

response = requests.post(
    "https://reactome.org/AnalysisService/identifiers/",
    headers={"Content-Type": "text/plain"},
    data=data
)

result = response.json()
token = result["summary"]["token"]

# Process pathways
for pathway in result["pathways"]:
    print(f"Pathway: {pathway['name']}")
    print(f"  Found: {pathway['entities']['found']}/{pathway['entities']['total']}")
    print(f"  p-value: {pathway['entities']['pValue']:.6f}")
    print(f"  FDR: {pathway['entities']['fdr']:.6f}")
```

#### Submit File (Form Upload)
```
POST /identifiers/form/
```

**Content-Type:** `multipart/form-data`

**Parameters:**
- `file`: File containing identifiers or expression data

#### Submit URL
```
POST /identifiers/url/
```

**Parameters:**
- `url`: URL pointing to data file

### Retrieve Analysis Results

#### Get Results by Token
```
GET /token/{token}
GET /token/{token}/projection/  # With species projection
```

**Parameters:**
- `token` (path): Analysis token returned from submission

**Response:** Same structure as initial analysis response

**Example:**
```python
token = "MzUxODM3NTQzMDAwMDA1ODI4MA=="
response = requests.get(f"https://reactome.org/AnalysisService/token/{token}")
results = response.json()
```

**Note:** Tokens are valid for 7 days

#### Filter Results
```
GET /token/{token}/filter/pathways?resource={resource}
```

**Parameters:**
- `token` (path): Analysis token
- `resource` (query): Resource filter (e.g., "TOTAL", "UNIPROT", "ENSEMBL")

### Download Results

#### Download as CSV
```
GET /download/{token}/pathways/{resource}/result.csv
```

#### Download Mapping
```
GET /download/{token}/entities/found/{resource}/mapping.tsv
```

## Supported Identifiers

Reactome automatically detects and processes various identifier types:

### Proteins and Genes
- **UniProt**: P04637
- **Gene Symbol**: TP53
- **Ensembl**: ENSG00000141510
- **EntrezGene**: 7157
- **RefSeq**: NM_000546
- **OMIM**: 191170

### Small Molecules
- **ChEBI**: CHEBI:15377
- **KEGG Compound**: C00031
- **PubChem**: 702

### Other
- **miRBase**: hsa-miR-21
- **InterPro**: IPR011616

## Response Formats

### JSON Objects

Entity objects contain standardized fields:
```json
{
  "stId": "R-HSA-69278",
  "displayName": "Cell Cycle, Mitotic",
  "schemaClass": "Pathway",
  "species": [
    {
      "dbId": 48887,
      "displayName": "Homo sapiens",
      "taxId": "9606"
    }
  ],
  "isInDisease": false
}
```

### TSV Format

For bulk queries, TSV returns:
```
stId	displayName	schemaClass
R-HSA-69278	Cell Cycle, Mitotic	Pathway
R-HSA-69306	DNA Replication	Pathway
```

## Error Responses

### HTTP Status Codes
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `404`: Not Found (invalid ID)
- `415`: Unsupported Media Type
- `500`: Internal Server Error

### Error JSON Structure
```json
{
  "code": 404,
  "reason": "NOT_FOUND",
  "messages": ["Pathway R-HSA-INVALID not found"]
}
```

## Rate Limiting

Reactome does not currently enforce strict rate limits, but consider:
- Implementing reasonable delays between requests
- Using batch operations when available
- Caching results when appropriate
- Respecting the 7-day token validity period

## Best Practices

### 1. Use Analysis Tokens
Store and reuse analysis tokens to avoid redundant computation:
```python
# Store token after analysis
token = result["summary"]["token"]
save_token(token)  # Save to file or database

# Retrieve results later
result = requests.get(f"https://reactome.org/AnalysisService/token/{token}")
```

### 2. Batch Queries
Submit multiple identifiers in a single request rather than individual queries:
```python
# Good: Single batch request
identifiers = ["TP53", "BRCA1", "EGFR"]
result = analyze_batch(identifiers)

# Avoid: Multiple individual requests
# for gene in genes:
#     result = analyze_single(gene)  # Don't do this
```

### 3. Handle Species Appropriately
Use `/projection/` endpoints to map non-human identifiers to human pathways:
```python
# For mouse genes, project to human pathways
response = requests.post(
    "https://reactome.org/AnalysisService/identifiers/projection/",
    headers={"Content-Type": "text/plain"},
    data=mouse_genes
)
```

### 4. Process Large Result Sets
For analyses returning many pathways, filter by significance:
```python
significant_pathways = [
    p for p in result["pathways"]
    if p["entities"]["fdr"] < 0.05
]
```

## Integration Examples

### Complete Analysis Workflow
```python
import requests
import json

def analyze_gene_list(genes, output_file="analysis_results.json"):
    """
    Perform pathway enrichment analysis on a list of genes
    """
    # Submit analysis
    data = "\n".join(genes)
    response = requests.post(
        "https://reactome.org/AnalysisService/identifiers/",
        headers={"Content-Type": "text/plain"},
        data=data
    )

    if response.status_code != 200:
        raise Exception(f"Analysis failed: {response.text}")

    result = response.json()
    token = result["summary"]["token"]

    # Filter significant pathways (FDR < 0.05)
    significant = [
        p for p in result["pathways"]
        if p["entities"]["fdr"] < 0.05
    ]

    # Save results
    with open(output_file, "w") as f:
        json.dump({
            "token": token,
            "total_pathways": len(result["pathways"]),
            "significant_pathways": len(significant),
            "pathways": significant
        }, f, indent=2)

    # Generate browser URL for top pathway
    if significant:
        top_pathway = significant[0]
        url = f"https://reactome.org/PathwayBrowser/#{top_pathway['stId']}&DTAB=AN&ANALYSIS={token}"
        print(f"View top result: {url}")

    return result

# Usage
genes = ["TP53", "BRCA1", "BRCA2", "CDK1", "CDK2"]
result = analyze_gene_list(genes)
```

## Additional Resources

- **Interactive API Documentation**: https://reactome.org/dev/content-service
- **Analysis Service Docs**: https://reactome.org/dev/analysis
- **User Guide**: https://reactome.org/userguide
- **Data Downloads**: https://reactome.org/download-data
