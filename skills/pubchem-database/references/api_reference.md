# PubChem API Reference

## Overview

PubChem is the world's largest freely available chemical database maintained by the National Center for Biotechnology Information (NCBI). It contains over 110 million unique chemical structures and over 270 million bioactivities from more than 770 data sources.

## Database Structure

PubChem consists of three primary subdatabases:

1. **Compound Database**: Unique validated chemical structures with computed properties
2. **Substance Database**: Deposited chemical substance records from data sources
3. **BioAssay Database**: Biological activity test results for chemical compounds

## PubChem PUG-REST API

### Base URL Structure

```
https://pubchem.ncbi.nlm.nih.gov/rest/pug/<input>/<operation>/<output>
```

Components:
- `<input>`: compound/cid, substance/sid, assay/aid, or search specifications
- `<operation>`: Optional operations like property, synonyms, classification, etc.
- `<output>`: Format such as JSON, XML, CSV, PNG, SDF, etc.

### Common Request Patterns

#### 1. Retrieve by Identifier

Get compound by CID (Compound ID):
```
GET /rest/pug/compound/cid/{cid}/property/{properties}/JSON
```

Get compound by name:
```
GET /rest/pug/compound/name/{name}/property/{properties}/JSON
```

Get compound by SMILES:
```
GET /rest/pug/compound/smiles/{smiles}/property/{properties}/JSON
```

Get compound by InChI:
```
GET /rest/pug/compound/inchi/{inchi}/property/{properties}/JSON
```

#### 2. Available Properties

Common molecular properties that can be retrieved:
- `MolecularFormula`
- `MolecularWeight`
- `CanonicalSMILES`
- `IsomericSMILES`
- `InChI`
- `InChIKey`
- `IUPACName`
- `XLogP`
- `ExactMass`
- `MonoisotopicMass`
- `TPSA` (Topological Polar Surface Area)
- `Complexity`
- `Charge`
- `HBondDonorCount`
- `HBondAcceptorCount`
- `RotatableBondCount`
- `HeavyAtomCount`
- `IsotopeAtomCount`
- `AtomStereoCount`
- `BondStereoCount`
- `CovalentUnitCount`
- `Volume3D`
- `XStericQuadrupole3D`
- `YStericQuadrupole3D`
- `ZStericQuadrupole3D`
- `FeatureCount3D`

To retrieve multiple properties, separate them with commas:
```
/property/MolecularFormula,MolecularWeight,CanonicalSMILES/JSON
```

#### 3. Structure Search Operations

**Similarity Search**:
```
POST /rest/pug/compound/similarity/smiles/{smiles}/JSON
Parameters: Threshold (default 90%)
```

**Substructure Search**:
```
POST /rest/pug/compound/substructure/smiles/{smiles}/cids/JSON
```

**Superstructure Search**:
```
POST /rest/pug/compound/superstructure/smiles/{smiles}/cids/JSON
```

#### 4. Image Generation

Get 2D structure image:
```
GET /rest/pug/compound/cid/{cid}/PNG
Optional parameters: image_size=small|large
```

#### 5. Format Conversion

Get compound as SDF (Structure-Data File):
```
GET /rest/pug/compound/cid/{cid}/SDF
```

Get compound as MOL:
```
GET /rest/pug/compound/cid/{cid}/record/SDF
```

#### 6. Synonym Retrieval

Get all synonyms for a compound:
```
GET /rest/pug/compound/cid/{cid}/synonyms/JSON
```

#### 7. Bioassay Data

Get bioassay data for a compound:
```
GET /rest/pug/compound/cid/{cid}/assaysummary/JSON
```

Get specific assay information:
```
GET /rest/pug/assay/aid/{aid}/description/JSON
```

### Asynchronous Requests

For large queries (similarity/substructure searches), PUG-REST uses an asynchronous pattern:

1. Submit the query (returns ListKey)
2. Check status using the ListKey
3. Retrieve results when ready

Example workflow:
```python
# Step 1: Submit similarity search
response = requests.post(
    "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/similarity/smiles/{smiles}/cids/JSON",
    data={"Threshold": 90}
)
listkey = response.json()["Waiting"]["ListKey"]

# Step 2: Check status
status_url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/listkey/{listkey}/cids/JSON"

# Step 3: Poll until ready (with timeout)
# Step 4: Retrieve results from the same URL
```

### Usage Limits

**Rate Limits**:
- Maximum 5 requests per second
- Maximum 400 requests per minute
- Maximum 300 seconds running time per minute

**Best Practices**:
- Use batch requests when possible
- Implement exponential backoff for retries
- Cache results when appropriate
- Use asynchronous pattern for large queries

## PubChemPy Python Library

PubChemPy is a Python wrapper that simplifies PUG-REST API access.

### Installation

```bash
pip install pubchempy
```

### Key Classes

#### Compound Class

Main class for representing chemical compounds:

```python
import pubchempy as pcp

# Get by CID
compound = pcp.Compound.from_cid(2244)

# Access properties
compound.molecular_formula  # 'C9H8O4'
compound.molecular_weight   # 180.16
compound.iupac_name        # '2-acetyloxybenzoic acid'
compound.canonical_smiles   # 'CC(=O)OC1=CC=CC=C1C(=O)O'
compound.isomeric_smiles    # Same as canonical for non-stereoisomers
compound.inchi             # InChI string
compound.inchikey          # InChI Key
compound.xlogp             # Partition coefficient
compound.tpsa              # Topological polar surface area
```

#### Search Methods

**By Name**:
```python
compounds = pcp.get_compounds('aspirin', 'name')
# Returns list of Compound objects
```

**By SMILES**:
```python
compound = pcp.get_compounds('CC(=O)OC1=CC=CC=C1C(=O)O', 'smiles')[0]
```

**By InChI**:
```python
compound = pcp.get_compounds('InChI=1S/C9H8O4/c1-6(10)13-8-5-3-2-4-7(8)9(11)12/h2-5H,1H3,(H,11,12)', 'inchi')[0]
```

**By Formula**:
```python
compounds = pcp.get_compounds('C9H8O4', 'formula')
# Returns all compounds with this formula
```

**Similarity Search**:
```python
results = pcp.get_compounds('CC(=O)OC1=CC=CC=C1C(=O)O', 'smiles',
                           searchtype='similarity',
                           Threshold=90)
```

**Substructure Search**:
```python
results = pcp.get_compounds('c1ccccc1', 'smiles',
                           searchtype='substructure')
# Returns all compounds containing benzene ring
```

#### Property Retrieval

Get specific properties for multiple compounds:
```python
properties = pcp.get_properties(
    ['MolecularFormula', 'MolecularWeight', 'CanonicalSMILES'],
    'aspirin',
    'name'
)
# Returns list of dictionaries
```

Get properties as pandas DataFrame:
```python
import pandas as pd
df = pd.DataFrame(properties)
```

#### Synonyms

Get all synonyms for a compound:
```python
synonyms = pcp.get_synonyms('aspirin', 'name')
# Returns list of dictionaries with CID and synonym lists
```

#### Download Formats

Download compound in various formats:
```python
# Get as SDF
sdf_data = pcp.download('SDF', 'aspirin', 'name', overwrite=True)

# Get as JSON
json_data = pcp.download('JSON', '2244', 'cid')

# Get as PNG image
pcp.download('PNG', '2244', 'cid', 'aspirin.png', overwrite=True)
```

### Error Handling

```python
from pubchempy import BadRequestError, NotFoundError, TimeoutError

try:
    compound = pcp.get_compounds('nonexistent', 'name')
except NotFoundError:
    print("Compound not found")
except BadRequestError:
    print("Invalid request")
except TimeoutError:
    print("Request timed out")
```

## PUG-View API

PUG-View provides access to full textual annotations and specialized reports.

### Key Endpoints

Get compound annotations:
```
GET /rest/pug_view/data/compound/{cid}/JSON
```

Get specific annotation sections:
```
GET /rest/pug_view/data/compound/{cid}/JSON?heading={section_name}
```

Available sections include:
- Chemical and Physical Properties
- Drug and Medication Information
- Pharmacology and Biochemistry
- Safety and Hazards
- Toxicity
- Literature
- Patents
- Biomolecular Interactions and Pathways

## Common Workflows

### 1. Chemical Identifier Conversion

Convert from name to SMILES to InChI:
```python
import pubchempy as pcp

compound = pcp.get_compounds('caffeine', 'name')[0]
smiles = compound.canonical_smiles
inchi = compound.inchi
inchikey = compound.inchikey
cid = compound.cid
```

### 2. Batch Property Retrieval

Get properties for multiple compounds:
```python
compound_names = ['aspirin', 'ibuprofen', 'paracetamol']
properties = []

for name in compound_names:
    props = pcp.get_properties(
        ['MolecularFormula', 'MolecularWeight', 'XLogP'],
        name,
        'name'
    )
    properties.extend(props)

import pandas as pd
df = pd.DataFrame(properties)
```

### 3. Finding Similar Compounds

Find structurally similar compounds to a query:
```python
# Start with a known compound
query_compound = pcp.get_compounds('gefitinib', 'name')[0]
query_smiles = query_compound.canonical_smiles

# Perform similarity search
similar = pcp.get_compounds(
    query_smiles,
    'smiles',
    searchtype='similarity',
    Threshold=85
)

# Get properties for similar compounds
for compound in similar[:10]:  # First 10 results
    print(f"{compound.cid}: {compound.iupac_name}, MW: {compound.molecular_weight}")
```

### 4. Substructure Screening

Find all compounds containing a specific substructure:
```python
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

### 5. Bioactivity Data Retrieval

```python
import requests

cid = 2244  # Aspirin
url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/{cid}/assaysummary/JSON"

response = requests.get(url)
if response.status_code == 200:
    bioassay_data = response.json()
    # Process bioassay information
```

## Tips and Best Practices

1. **Use CIDs for repeated queries**: CIDs are more efficient than names or structures
2. **Cache results**: Store frequently accessed data locally
3. **Batch requests**: Combine multiple queries when possible
4. **Handle rate limits**: Implement delays between requests
5. **Use appropriate search types**: Similarity for related compounds, substructure for motif finding
6. **Leverage PubChemPy**: Higher-level abstraction simplifies common tasks
7. **Handle missing data**: Not all properties are available for all compounds
8. **Use asynchronous pattern**: For large similarity/substructure searches
9. **Specify output format**: Choose JSON for programmatic access, SDF for cheminformatics tools
10. **Read documentation**: Full PUG-REST documentation available at https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest

## Additional Resources

- PubChem Home: https://pubchem.ncbi.nlm.nih.gov/
- PUG-REST Documentation: https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest
- PUG-REST Tutorial: https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest-tutorial
- PubChemPy Documentation: https://pubchempy.readthedocs.io/
- PubChemPy GitHub: https://github.com/mcs07/PubChemPy
- IUPAC Tutorial: https://iupac.github.io/WFChemCookbook/datasources/pubchem_pugrest.html
