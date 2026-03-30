---
name: pubchem-database
description: Query PubChem via PUG-REST API/PubChemPy (110M+ compounds). Search by name/CID/SMILES, retrieve properties, similarity/substructure searches, bioactivity, for cheminformatics.
license: Unknown
metadata:
    skill-author: K-Dense Inc.
---

# PubChem Database

## Overview

PubChem is the world's largest freely available chemical database with 110M+ compounds and 270M+ bioactivities. Query chemical structures by name, CID, or SMILES, retrieve molecular properties, perform similarity and substructure searches, access bioactivity data using PUG-REST API and PubChemPy.

## When to Use This Skill

This skill should be used when:
- Searching for chemical compounds by name, structure (SMILES/InChI), or molecular formula
- Retrieving molecular properties (MW, LogP, TPSA, hydrogen bonding descriptors)
- Performing similarity searches to find structurally related compounds
- Conducting substructure searches for specific chemical motifs
- Accessing bioactivity data from screening assays
- Converting between chemical identifier formats (CID, SMILES, InChI)
- Batch processing multiple compounds for drug-likeness screening or property analysis

## Core Capabilities

### 1. Chemical Structure Search

Search for compounds using multiple identifier types:

**By Chemical Name**:
```python
import pubchempy as pcp
compounds = pcp.get_compounds('aspirin', 'name')
compound = compounds[0]
```

**By CID (Compound ID)**:
```python
compound = pcp.Compound.from_cid(2244)  # Aspirin
```

**By SMILES**:
```python
compound = pcp.get_compounds('CC(=O)OC1=CC=CC=C1C(=O)O', 'smiles')[0]
```

**By InChI**:
```python
compound = pcp.get_compounds('InChI=1S/C9H8O4/...', 'inchi')[0]
```

**By Molecular Formula**:
```python
compounds = pcp.get_compounds('C9H8O4', 'formula')
# Returns all compounds matching this formula
```

### 2. Property Retrieval

Retrieve molecular properties for compounds using either high-level or low-level approaches:

**Using PubChemPy (Recommended)**:
```python
import pubchempy as pcp

# Get compound object with all properties
compound = pcp.get_compounds('caffeine', 'name')[0]

# Access individual properties
molecular_formula = compound.molecular_formula
molecular_weight = compound.molecular_weight
iupac_name = compound.iupac_name
smiles = compound.canonical_smiles
inchi = compound.inchi
xlogp = compound.xlogp  # Partition coefficient
tpsa = compound.tpsa    # Topological polar surface area
```

**Get Specific Properties**:
```python
# Request only specific properties
properties = pcp.get_properties(
    ['MolecularFormula', 'MolecularWeight', 'CanonicalSMILES', 'XLogP'],
    'aspirin',
    'name'
)
# Returns list of dictionaries
```

**Batch Property Retrieval**:
```python
import pandas as pd

compound_names = ['aspirin', 'ibuprofen', 'paracetamol']
all_properties = []

for name in compound_names:
    props = pcp.get_properties(
        ['MolecularFormula', 'MolecularWeight', 'XLogP'],
        name,
        'name'
    )
    all_properties.extend(props)

df = pd.DataFrame(all_properties)
```

**Available Properties**: MolecularFormula, MolecularWeight, CanonicalSMILES, IsomericSMILES, InChI, InChIKey, IUPACName, XLogP, TPSA, HBondDonorCount, HBondAcceptorCount, RotatableBondCount, Complexity, Charge, and many more (see `references/api_reference.md` for complete list).

### 3. Similarity Search

Find structurally similar compounds using Tanimoto similarity:

```python
import pubchempy as pcp

# Start with a query compound
query_compound = pcp.get_compounds('gefitinib', 'name')[0]
query_smiles = query_compound.canonical_smiles

# Perform similarity search
similar_compounds = pcp.get_compounds(
    query_smiles,
    'smiles',
    searchtype='similarity',
    Threshold=85,  # Similarity threshold (0-100)
    MaxRecords=50
)

# Process results
for compound in similar_compounds[:10]:
    print(f"CID {compound.cid}: {compound.iupac_name}")
    print(f"  MW: {compound.molecular_weight}")
```

**Note**: Similarity searches are asynchronous for large queries and may take 15-30 seconds to complete. PubChemPy handles the asynchronous pattern automatically.

### 4. Substructure Search

Find compounds containing a specific structural motif:

```python
import pubchempy as pcp

# Search for compounds containing pyridine ring
pyridine_smiles = 'c1ccncc1'

matches = pcp.get_compounds(
    pyridine_smiles,
    'smiles',
    searchtype='substructure',
    MaxRecords=100
)

print(f"Found {len(matches)} compounds containing pyridine")
```

**Common Substructures**:
- Benzene ring: `c1ccccc1`
- Pyridine: `c1ccncc1`
- Phenol: `c1ccc(O)cc1`
- Carboxylic acid: `C(=O)O`

### 5. Format Conversion

Convert between different chemical structure formats:

```python
import pubchempy as pcp

compound = pcp.get_compounds('aspirin', 'name')[0]

# Convert to different formats
smiles = compound.canonical_smiles
inchi = compound.inchi
inchikey = compound.inchikey
cid = compound.cid

# Download structure files
pcp.download('SDF', 'aspirin', 'name', 'aspirin.sdf', overwrite=True)
pcp.download('JSON', '2244', 'cid', 'aspirin.json', overwrite=True)
```

### 6. Structure Visualization

Generate 2D structure images:

```python
import pubchempy as pcp

# Download compound structure as PNG
pcp.download('PNG', 'caffeine', 'name', 'caffeine.png', overwrite=True)

# Using direct URL (via requests)
import requests

cid = 2244  # Aspirin
url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/{cid}/PNG?image_size=large"
response = requests.get(url)

with open('structure.png', 'wb') as f:
    f.write(response.content)
```

### 7. Synonym Retrieval

Get all known names and synonyms for a compound:

```python
import pubchempy as pcp

synonyms_data = pcp.get_synonyms('aspirin', 'name')

if synonyms_data:
    cid = synonyms_data[0]['CID']
    synonyms = synonyms_data[0]['Synonym']

    print(f"CID {cid} has {len(synonyms)} synonyms:")
    for syn in synonyms[:10]:  # First 10
        print(f"  - {syn}")
```

### 8. Bioactivity Data Access

Retrieve biological activity data from assays:

```python
import requests
import json

# Get bioassay summary for a compound
cid = 2244  # Aspirin
url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/{cid}/assaysummary/JSON"

response = requests.get(url)
if response.status_code == 200:
    data = response.json()
    # Process bioassay information
    table = data.get('Table', {})
    rows = table.get('Row', [])
    print(f"Found {len(rows)} bioassay records")
```

**For more complex bioactivity queries**, use the `scripts/bioactivity_query.py` helper script which provides:
- Bioassay summaries with activity outcome filtering
- Assay target identification
- Search for compounds by biological target
- Active compound lists for specific assays

### 9. Comprehensive Compound Annotations

Access detailed compound information through PUG-View:

```python
import requests

cid = 2244
url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/{cid}/JSON"

response = requests.get(url)
if response.status_code == 200:
    annotations = response.json()
    # Contains extensive data including:
    # - Chemical and Physical Properties
    # - Drug and Medication Information
    # - Pharmacology and Biochemistry
    # - Safety and Hazards
    # - Toxicity
    # - Literature references
    # - Patents
```

**Get Specific Section**:
```python
# Get only drug information
url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/{cid}/JSON?heading=Drug and Medication Information"
```

## Installation Requirements

Install PubChemPy for Python-based access:

```bash
uv pip install pubchempy
```

For direct API access and bioactivity queries:

```bash
uv pip install requests
```

Optional for data analysis:

```bash
uv pip install pandas
```

## Helper Scripts

This skill includes Python scripts for common PubChem tasks:

### scripts/compound_search.py

Provides utility functions for searching and retrieving compound information:

**Key Functions**:
- `search_by_name(name, max_results=10)`: Search compounds by name
- `search_by_smiles(smiles)`: Search by SMILES string
- `get_compound_by_cid(cid)`: Retrieve compound by CID
- `get_compound_properties(identifier, namespace, properties)`: Get specific properties
- `similarity_search(smiles, threshold, max_records)`: Perform similarity search
- `substructure_search(smiles, max_records)`: Perform substructure search
- `get_synonyms(identifier, namespace)`: Get all synonyms
- `batch_search(identifiers, namespace, properties)`: Batch search multiple compounds
- `download_structure(identifier, namespace, format, filename)`: Download structures
- `print_compound_info(compound)`: Print formatted compound information

**Usage**:
```python
from scripts.compound_search import search_by_name, get_compound_properties

# Search for a compound
compounds = search_by_name('ibuprofen')

# Get specific properties
props = get_compound_properties('aspirin', 'name', ['MolecularWeight', 'XLogP'])
```

### scripts/bioactivity_query.py

Provides functions for retrieving biological activity data:

**Key Functions**:
- `get_bioassay_summary(cid)`: Get bioassay summary for compound
- `get_compound_bioactivities(cid, activity_outcome)`: Get filtered bioactivities
- `get_assay_description(aid)`: Get detailed assay information
- `get_assay_targets(aid)`: Get biological targets for assay
- `search_assays_by_target(target_name, max_results)`: Find assays by target
- `get_active_compounds_in_assay(aid, max_results)`: Get active compounds
- `get_compound_annotations(cid, section)`: Get PUG-View annotations
- `summarize_bioactivities(cid)`: Generate bioactivity summary statistics
- `find_compounds_by_bioactivity(target, threshold, max_compounds)`: Find compounds by target

**Usage**:
```python
from scripts.bioactivity_query import get_bioassay_summary, summarize_bioactivities

# Get bioactivity summary
summary = summarize_bioactivities(2244)  # Aspirin
print(f"Total assays: {summary['total_assays']}")
print(f"Active: {summary['active']}, Inactive: {summary['inactive']}")
```

## API Rate Limits and Best Practices

**Rate Limits**:
- Maximum 5 requests per second
- Maximum 400 requests per minute
- Maximum 300 seconds running time per minute

**Best Practices**:
1. **Use CIDs for repeated queries**: CIDs are more efficient than names or structures
2. **Cache results locally**: Store frequently accessed data
3. **Batch requests**: Combine multiple queries when possible
4. **Implement delays**: Add 0.2-0.3 second delays between requests
5. **Handle errors gracefully**: Check for HTTP errors and missing data
6. **Use PubChemPy**: Higher-level abstraction handles many edge cases
7. **Leverage asynchronous pattern**: For large similarity/substructure searches
8. **Specify MaxRecords**: Limit results to avoid timeouts

**Error Handling**:
```python
from pubchempy import BadRequestError, NotFoundError, TimeoutError

try:
    compound = pcp.get_compounds('query', 'name')[0]
except NotFoundError:
    print("Compound not found")
except BadRequestError:
    print("Invalid request format")
except TimeoutError:
    print("Request timed out - try reducing scope")
except IndexError:
    print("No results returned")
```

## Common Workflows

### Workflow 1: Chemical Identifier Conversion Pipeline

Convert between different chemical identifiers:

```python
import pubchempy as pcp

# Start with any identifier type
compound = pcp.get_compounds('caffeine', 'name')[0]

# Extract all identifier formats
identifiers = {
    'CID': compound.cid,
    'Name': compound.iupac_name,
    'SMILES': compound.canonical_smiles,
    'InChI': compound.inchi,
    'InChIKey': compound.inchikey,
    'Formula': compound.molecular_formula
}
```

### Workflow 2: Drug-Like Property Screening

Screen compounds using Lipinski's Rule of Five:

```python
import pubchempy as pcp

def check_drug_likeness(compound_name):
    compound = pcp.get_compounds(compound_name, 'name')[0]

    # Lipinski's Rule of Five
    rules = {
        'MW <= 500': compound.molecular_weight <= 500,
        'LogP <= 5': compound.xlogp <= 5 if compound.xlogp else None,
        'HBD <= 5': compound.h_bond_donor_count <= 5,
        'HBA <= 10': compound.h_bond_acceptor_count <= 10
    }

    violations = sum(1 for v in rules.values() if v is False)
    return rules, violations

rules, violations = check_drug_likeness('aspirin')
print(f"Lipinski violations: {violations}")
```

### Workflow 3: Finding Similar Drug Candidates

Identify structurally similar compounds to a known drug:

```python
import pubchempy as pcp

# Start with known drug
reference_drug = pcp.get_compounds('imatinib', 'name')[0]
reference_smiles = reference_drug.canonical_smiles

# Find similar compounds
similar = pcp.get_compounds(
    reference_smiles,
    'smiles',
    searchtype='similarity',
    Threshold=85,
    MaxRecords=20
)

# Filter by drug-like properties
candidates = []
for comp in similar:
    if comp.molecular_weight and 200 <= comp.molecular_weight <= 600:
        if comp.xlogp and -1 <= comp.xlogp <= 5:
            candidates.append(comp)

print(f"Found {len(candidates)} drug-like candidates")
```

### Workflow 4: Batch Compound Property Comparison

Compare properties across multiple compounds:

```python
import pubchempy as pcp
import pandas as pd

compound_list = ['aspirin', 'ibuprofen', 'naproxen', 'celecoxib']

properties_list = []
for name in compound_list:
    try:
        compound = pcp.get_compounds(name, 'name')[0]
        properties_list.append({
            'Name': name,
            'CID': compound.cid,
            'Formula': compound.molecular_formula,
            'MW': compound.molecular_weight,
            'LogP': compound.xlogp,
            'TPSA': compound.tpsa,
            'HBD': compound.h_bond_donor_count,
            'HBA': compound.h_bond_acceptor_count
        })
    except Exception as e:
        print(f"Error processing {name}: {e}")

df = pd.DataFrame(properties_list)
print(df.to_string(index=False))
```

### Workflow 5: Substructure-Based Virtual Screening

Screen for compounds containing specific pharmacophores:

```python
import pubchempy as pcp

# Define pharmacophore (e.g., sulfonamide group)
pharmacophore_smiles = 'S(=O)(=O)N'

# Search for compounds containing this substructure
hits = pcp.get_compounds(
    pharmacophore_smiles,
    'smiles',
    searchtype='substructure',
    MaxRecords=100
)

# Further filter by properties
filtered_hits = [
    comp for comp in hits
    if comp.molecular_weight and comp.molecular_weight < 500
]

print(f"Found {len(filtered_hits)} compounds with desired substructure")
```

## Reference Documentation

For detailed API documentation, including complete property lists, URL patterns, advanced query options, and more examples, consult `references/api_reference.md`. This comprehensive reference includes:

- Complete PUG-REST API endpoint documentation
- Full list of available molecular properties
- Asynchronous request handling patterns
- PubChemPy API reference
- PUG-View API for annotations
- Common workflows and use cases
- Links to official PubChem documentation

## Troubleshooting

**Compound Not Found**:
- Try alternative names or synonyms
- Use CID if known
- Check spelling and chemical name format

**Timeout Errors**:
- Reduce MaxRecords parameter
- Add delays between requests
- Use CIDs instead of names for faster queries

**Empty Property Values**:
- Not all properties are available for all compounds
- Check if property exists before accessing: `if compound.xlogp:`
- Some properties only available for certain compound types

**Rate Limit Exceeded**:
- Implement delays (0.2-0.3 seconds) between requests
- Use batch operations where possible
- Consider caching results locally

**Similarity/Substructure Search Hangs**:
- These are asynchronous operations that may take 15-30 seconds
- PubChemPy handles polling automatically
- Reduce MaxRecords if timing out

## Additional Resources

- PubChem Home: https://pubchem.ncbi.nlm.nih.gov/
- PUG-REST Documentation: https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest
- PUG-REST Tutorial: https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest-tutorial
- PubChemPy Documentation: https://pubchempy.readthedocs.io/
- PubChemPy GitHub: https://github.com/mcs07/PubChemPy

