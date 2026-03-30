---
name: alphafold-database
description: Access AlphaFold 200M+ AI-predicted protein structures. Retrieve structures by UniProt ID, download PDB/mmCIF files, analyze confidence metrics (pLDDT, PAE), for drug discovery and structural biology.
license: Unknown
metadata:
    skill-author: K-Dense Inc.
---

# AlphaFold Database

## Overview

AlphaFold DB is a public repository of AI-predicted 3D protein structures for over 200 million proteins, maintained by DeepMind and EMBL-EBI. Access structure predictions with confidence metrics, download coordinate files, retrieve bulk datasets, and integrate predictions into computational workflows.

## When to Use This Skill

This skill should be used when working with AI-predicted protein structures in scenarios such as:

- Retrieving protein structure predictions by UniProt ID or protein name
- Downloading PDB/mmCIF coordinate files for structural analysis
- Analyzing prediction confidence metrics (pLDDT, PAE) to assess reliability
- Accessing bulk proteome datasets via Google Cloud Platform
- Comparing predicted structures with experimental data
- Performing structure-based drug discovery or protein engineering
- Building structural models for proteins lacking experimental structures
- Integrating AlphaFold predictions into computational pipelines

## Core Capabilities

### 1. Searching and Retrieving Predictions

**Using Biopython (Recommended):**

The Biopython library provides the simplest interface for retrieving AlphaFold structures:

```python
from Bio.PDB import alphafold_db

# Get all predictions for a UniProt accession
predictions = list(alphafold_db.get_predictions("P00520"))

# Download structure file (mmCIF format)
for prediction in predictions:
    cif_file = alphafold_db.download_cif_for(prediction, directory="./structures")
    print(f"Downloaded: {cif_file}")

# Get Structure objects directly
from Bio.PDB import MMCIFParser
structures = list(alphafold_db.get_structural_models_for("P00520"))
```

**Direct API Access:**

Query predictions using REST endpoints:

```python
import requests

# Get prediction metadata for a UniProt accession
uniprot_id = "P00520"
api_url = f"https://alphafold.ebi.ac.uk/api/prediction/{uniprot_id}"
response = requests.get(api_url)
prediction_data = response.json()

# Extract AlphaFold ID
alphafold_id = prediction_data[0]['entryId']
print(f"AlphaFold ID: {alphafold_id}")
```

**Using UniProt to Find Accessions:**

Search UniProt to find protein accessions first:

```python
import urllib.parse, urllib.request

def get_uniprot_ids(query, query_type='PDB_ID'):
    """Query UniProt to get accession IDs"""
    url = 'https://www.uniprot.org/uploadlists/'
    params = {
        'from': query_type,
        'to': 'ACC',
        'format': 'txt',
        'query': query
    }
    data = urllib.parse.urlencode(params).encode('ascii')
    with urllib.request.urlopen(urllib.request.Request(url, data)) as response:
        return response.read().decode('utf-8').splitlines()

# Example: Find UniProt IDs for a protein name
protein_ids = get_uniprot_ids("hemoglobin", query_type="GENE_NAME")
```

### 2. Downloading Structure Files

AlphaFold provides multiple file formats for each prediction:

**File Types Available:**

- **Model coordinates** (`model_v4.cif`): Atomic coordinates in mmCIF/PDBx format
- **Confidence scores** (`confidence_v4.json`): Per-residue pLDDT scores (0-100)
- **Predicted Aligned Error** (`predicted_aligned_error_v4.json`): PAE matrix for residue pair confidence

**Download URLs:**

```python
import requests

alphafold_id = "AF-P00520-F1"
version = "v4"

# Model coordinates (mmCIF)
model_url = f"https://alphafold.ebi.ac.uk/files/{alphafold_id}-model_{version}.cif"
response = requests.get(model_url)
with open(f"{alphafold_id}.cif", "w") as f:
    f.write(response.text)

# Confidence scores (JSON)
confidence_url = f"https://alphafold.ebi.ac.uk/files/{alphafold_id}-confidence_{version}.json"
response = requests.get(confidence_url)
confidence_data = response.json()

# Predicted Aligned Error (JSON)
pae_url = f"https://alphafold.ebi.ac.uk/files/{alphafold_id}-predicted_aligned_error_{version}.json"
response = requests.get(pae_url)
pae_data = response.json()
```

**PDB Format (Alternative):**

```python
# Download as PDB format instead of mmCIF
pdb_url = f"https://alphafold.ebi.ac.uk/files/{alphafold_id}-model_{version}.pdb"
response = requests.get(pdb_url)
with open(f"{alphafold_id}.pdb", "wb") as f:
    f.write(response.content)
```

### 3. Working with Confidence Metrics

AlphaFold predictions include confidence estimates critical for interpretation:

**pLDDT (per-residue confidence):**

```python
import json
import requests

# Load confidence scores
alphafold_id = "AF-P00520-F1"
confidence_url = f"https://alphafold.ebi.ac.uk/files/{alphafold_id}-confidence_v4.json"
confidence = requests.get(confidence_url).json()

# Extract pLDDT scores
plddt_scores = confidence['confidenceScore']

# Interpret confidence levels
# pLDDT > 90: Very high confidence
# pLDDT 70-90: High confidence
# pLDDT 50-70: Low confidence
# pLDDT < 50: Very low confidence

high_confidence_residues = [i for i, score in enumerate(plddt_scores) if score > 90]
print(f"High confidence residues: {len(high_confidence_residues)}/{len(plddt_scores)}")
```

**PAE (Predicted Aligned Error):**

PAE indicates confidence in relative domain positions:

```python
import numpy as np
import matplotlib.pyplot as plt

# Load PAE matrix
pae_url = f"https://alphafold.ebi.ac.uk/files/{alphafold_id}-predicted_aligned_error_v4.json"
pae = requests.get(pae_url).json()

# Visualize PAE matrix
pae_matrix = np.array(pae['distance'])
plt.figure(figsize=(10, 8))
plt.imshow(pae_matrix, cmap='viridis_r', vmin=0, vmax=30)
plt.colorbar(label='PAE (Å)')
plt.title(f'Predicted Aligned Error: {alphafold_id}')
plt.xlabel('Residue')
plt.ylabel('Residue')
plt.savefig(f'{alphafold_id}_pae.png', dpi=300, bbox_inches='tight')

# Low PAE values (<5 Å) indicate confident relative positioning
# High PAE values (>15 Å) suggest uncertain domain arrangements
```

### 4. Bulk Data Access via Google Cloud

For large-scale analyses, use Google Cloud datasets:

**Google Cloud Storage:**

```bash
# Install gsutil
uv pip install gsutil

# List available data
gsutil ls gs://public-datasets-deepmind-alphafold-v4/

# Download entire proteomes (by taxonomy ID)
gsutil -m cp gs://public-datasets-deepmind-alphafold-v4/proteomes/proteome-tax_id-9606-*.tar .

# Download specific files
gsutil cp gs://public-datasets-deepmind-alphafold-v4/accession_ids.csv .
```

**BigQuery Metadata Access:**

```python
from google.cloud import bigquery

# Initialize client
client = bigquery.Client()

# Query metadata
query = """
SELECT
  entryId,
  uniprotAccession,
  organismScientificName,
  globalMetricValue,
  fractionPlddtVeryHigh
FROM `bigquery-public-data.deepmind_alphafold.metadata`
WHERE organismScientificName = 'Homo sapiens'
  AND fractionPlddtVeryHigh > 0.8
LIMIT 100
"""

results = client.query(query).to_dataframe()
print(f"Found {len(results)} high-confidence human proteins")
```

**Download by Species:**

> ⚠️ **Security Note**: The example below uses `shell=True` for simplicity. In production environments, prefer using `subprocess.run()` with a list of arguments to prevent command injection vulnerabilities. See [Python subprocess security](https://docs.python.org/3/library/subprocess.html#security-considerations).

```python
import subprocess
import shlex

def download_proteome(taxonomy_id, output_dir="./proteomes"):
    """Download all AlphaFold predictions for a species"""
    # Validate taxonomy_id is an integer to prevent injection
    if not isinstance(taxonomy_id, int):
        raise ValueError("taxonomy_id must be an integer")
    
    pattern = f"gs://public-datasets-deepmind-alphafold-v4/proteomes/proteome-tax_id-{taxonomy_id}-*_v4.tar"
    # Use list form instead of shell=True for security
    subprocess.run(["gsutil", "-m", "cp", pattern, f"{output_dir}/"], check=True)

# Download E. coli proteome (tax ID: 83333)
download_proteome(83333)

# Download human proteome (tax ID: 9606)
download_proteome(9606)
```

### 5. Parsing and Analyzing Structures

Work with downloaded AlphaFold structures using BioPython:

```python
from Bio.PDB import MMCIFParser, PDBIO
import numpy as np

# Parse mmCIF file
parser = MMCIFParser(QUIET=True)
structure = parser.get_structure("protein", "AF-P00520-F1-model_v4.cif")

# Extract coordinates
coords = []
for model in structure:
    for chain in model:
        for residue in chain:
            if 'CA' in residue:  # Alpha carbons only
                coords.append(residue['CA'].get_coord())

coords = np.array(coords)
print(f"Structure has {len(coords)} residues")

# Calculate distances
from scipy.spatial.distance import pdist, squareform
distance_matrix = squareform(pdist(coords))

# Identify contacts (< 8 Å)
contacts = np.where((distance_matrix > 0) & (distance_matrix < 8))
print(f"Number of contacts: {len(contacts[0]) // 2}")
```

**Extract B-factors (pLDDT values):**

AlphaFold stores pLDDT scores in the B-factor column:

```python
from Bio.PDB import MMCIFParser

parser = MMCIFParser(QUIET=True)
structure = parser.get_structure("protein", "AF-P00520-F1-model_v4.cif")

# Extract pLDDT from B-factors
plddt_scores = []
for model in structure:
    for chain in model:
        for residue in chain:
            if 'CA' in residue:
                plddt_scores.append(residue['CA'].get_bfactor())

# Identify high-confidence regions
high_conf_regions = [(i, score) for i, score in enumerate(plddt_scores, 1) if score > 90]
print(f"High confidence residues: {len(high_conf_regions)}")
```

### 6. Batch Processing Multiple Proteins

Process multiple predictions efficiently:

```python
from Bio.PDB import alphafold_db
import pandas as pd

uniprot_ids = ["P00520", "P12931", "P04637"]  # Multiple proteins
results = []

for uniprot_id in uniprot_ids:
    try:
        # Get prediction
        predictions = list(alphafold_db.get_predictions(uniprot_id))

        if predictions:
            pred = predictions[0]

            # Download structure
            cif_file = alphafold_db.download_cif_for(pred, directory="./batch_structures")

            # Get confidence data
            alphafold_id = pred['entryId']
            conf_url = f"https://alphafold.ebi.ac.uk/files/{alphafold_id}-confidence_v4.json"
            conf_data = requests.get(conf_url).json()

            # Calculate statistics
            plddt_scores = conf_data['confidenceScore']
            avg_plddt = np.mean(plddt_scores)
            high_conf_fraction = sum(1 for s in plddt_scores if s > 90) / len(plddt_scores)

            results.append({
                'uniprot_id': uniprot_id,
                'alphafold_id': alphafold_id,
                'avg_plddt': avg_plddt,
                'high_conf_fraction': high_conf_fraction,
                'length': len(plddt_scores)
            })
    except Exception as e:
        print(f"Error processing {uniprot_id}: {e}")

# Create summary DataFrame
df = pd.DataFrame(results)
print(df)
```

## Installation and Setup

### Python Libraries

```bash
# Install Biopython for structure access
uv pip install biopython

# Install requests for API access
uv pip install requests

# For visualization and analysis
uv pip install numpy matplotlib pandas scipy

# For Google Cloud access (optional)
uv pip install google-cloud-bigquery gsutil
```

### 3D-Beacons API Alternative

AlphaFold can also be accessed via the 3D-Beacons federated API:

```python
import requests

# Query via 3D-Beacons
uniprot_id = "P00520"
url = f"https://www.ebi.ac.uk/pdbe/pdbe-kb/3dbeacons/api/uniprot/summary/{uniprot_id}.json"
response = requests.get(url)
data = response.json()

# Filter for AlphaFold structures
af_structures = [s for s in data['structures'] if s['provider'] == 'AlphaFold DB']
```

## Common Use Cases

### Structural Proteomics
- Download complete proteome predictions for analysis
- Identify high-confidence structural regions across proteins
- Compare predicted structures with experimental data
- Build structural models for protein families

### Drug Discovery
- Retrieve target protein structures for docking studies
- Analyze binding site conformations
- Identify druggable pockets in predicted structures
- Compare structures across homologs

### Protein Engineering
- Identify stable/unstable regions using pLDDT
- Design mutations in high-confidence regions
- Analyze domain architectures using PAE
- Model protein variants and mutations

### Evolutionary Studies
- Compare ortholog structures across species
- Analyze conservation of structural features
- Study domain evolution patterns
- Identify functionally important regions

## Key Concepts

**UniProt Accession:** Primary identifier for proteins (e.g., "P00520"). Required for querying AlphaFold DB.

**AlphaFold ID:** Internal identifier format: `AF-[UniProt accession]-F[fragment number]` (e.g., "AF-P00520-F1").

**pLDDT (predicted Local Distance Difference Test):** Per-residue confidence metric (0-100). Higher values indicate more confident predictions.

**PAE (Predicted Aligned Error):** Matrix indicating confidence in relative positions between residue pairs. Low values (<5 Å) suggest confident relative positioning.

**Database Version:** Current version is v4. File URLs include version suffix (e.g., `model_v4.cif`).

**Fragment Number:** Large proteins may be split into fragments. Fragment number appears in AlphaFold ID (e.g., F1, F2).

## Confidence Interpretation Guidelines

**pLDDT Thresholds:**
- **>90**: Very high confidence - suitable for detailed analysis
- **70-90**: High confidence - generally reliable backbone structure
- **50-70**: Low confidence - use with caution, flexible regions
- **<50**: Very low confidence - likely disordered or unreliable

**PAE Guidelines:**
- **<5 Å**: Confident relative positioning of domains
- **5-10 Å**: Moderate confidence in arrangement
- **>15 Å**: Uncertain relative positions, domains may be mobile

## Resources

### references/api_reference.md

Comprehensive API documentation covering:
- Complete REST API endpoint specifications
- File format details and data schemas
- Google Cloud dataset structure and access patterns
- Advanced query examples and batch processing strategies
- Rate limiting, caching, and best practices
- Troubleshooting common issues

Consult this reference for detailed API information, bulk download strategies, or when working with large-scale datasets.

## Important Notes

### Data Usage and Attribution

- AlphaFold DB is freely available under CC-BY-4.0 license
- Cite: Jumper et al. (2021) Nature and Varadi et al. (2022) Nucleic Acids Research
- Predictions are computational models, not experimental structures
- Always assess confidence metrics before downstream analysis

### Version Management

- Current database version: v4 (as of 2024-2025)
- File URLs include version suffix (e.g., `_v4.cif`)
- Check for database updates regularly
- Older versions may be deprecated over time

### Data Quality Considerations

- High pLDDT doesn't guarantee functional accuracy
- Low confidence regions may be disordered in vivo
- PAE indicates relative domain confidence, not absolute positioning
- Predictions lack ligands, post-translational modifications, and cofactors
- Multi-chain complexes are not predicted (single chains only)

### Performance Tips

- Use Biopython for simple single-protein access
- Use Google Cloud for bulk downloads (much faster than individual files)
- Cache downloaded files locally to avoid repeated downloads
- BigQuery free tier: 1 TB processed data per month
- Consider network bandwidth for large-scale downloads

## Additional Resources

- **AlphaFold DB Website:** https://alphafold.ebi.ac.uk/
- **API Documentation:** https://alphafold.ebi.ac.uk/api-docs
- **Google Cloud Dataset:** https://cloud.google.com/blog/products/ai-machine-learning/alphafold-protein-structure-database
- **3D-Beacons API:** https://www.ebi.ac.uk/pdbe/pdbe-kb/3dbeacons/
- **AlphaFold Papers:**
  - Nature (2021): https://doi.org/10.1038/s41586-021-03819-2
  - Nucleic Acids Research (2024): https://doi.org/10.1093/nar/gkad1011
- **Biopython Documentation:** https://biopython.org/docs/dev/api/Bio.PDB.alphafold_db.html
- **GitHub Repository:** https://github.com/google-deepmind/alphafold

