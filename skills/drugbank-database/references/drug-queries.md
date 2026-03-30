# Drug Information Queries

## Overview
DrugBank provides comprehensive drug information with 200+ data fields per entry including chemical properties, pharmacology, mechanisms of action, and clinical data.

## Database Contents

### Drug Categories
- **FDA-Approved Small Molecules**: ~2,037 drugs
- **Biotech/Biologic Drugs**: ~241 entries
- **Nutraceuticals**: ~96 compounds
- **Experimental Drugs**: ~6,000+ compounds
- **Withdrawn/Discontinued**: Historical drugs with safety data

### Data Fields (200+ per entry)
- **Identifiers**: DrugBank ID, CAS number, UNII, PubChem CID
- **Names**: Generic, brand, synonyms, IUPAC
- **Chemical**: Structure (SMILES, InChI), formula, molecular weight
- **Pharmacology**: Indication, mechanism of action, pharmacodynamics
- **Pharmacokinetics**: Absorption, distribution, metabolism, excretion (ADME)
- **Toxicity**: LD50, adverse effects, contraindications
- **Clinical**: Dosage forms, routes of administration, half-life
- **Targets**: Proteins, enzymes, transporters, carriers
- **Interactions**: Drug-drug, drug-food interactions
- **References**: Citations to literature and clinical studies

## XML Structure Navigation

### Basic XML Structure
```xml
<drugbank>
  <drug type="small molecule" created="..." updated="...">
    <drugbank-id primary="true">DB00001</drugbank-id>
    <name>Lepirudin</name>
    <description>...</description>
    <cas-number>...</cas-number>
    <synthesis-reference>...</synthesis-reference>
    <indication>...</indication>
    <pharmacodynamics>...</pharmacodynamics>
    <mechanism-of-action>...</mechanism-of-action>
    <toxicity>...</toxicity>
    <metabolism>...</metabolism>
    <absorption>...</absorption>
    <half-life>...</half-life>
    <protein-binding>...</protein-binding>
    <route-of-elimination>...</route-of-elimination>
    <calculated-properties>...</calculated-properties>
    <experimental-properties>...</experimental-properties>
    <targets>...</targets>
    <enzymes>...</enzymes>
    <transporters>...</transporters>
    <drug-interactions>...</drug-interactions>
  </drug>
</drugbank>
```

### Namespaces
DrugBank XML uses namespaces. Handle them properly:
```python
import xml.etree.ElementTree as ET

# Define namespace
ns = {'db': 'http://www.drugbank.ca'}

# Query with namespace
root = get_drugbank_root()
drugs = root.findall('db:drug', ns)
```

## Query by Drug Identifier

### Query by DrugBank ID
```python
from drugbank_downloader import get_drugbank_root

def get_drug_by_id(drugbank_id):
    """Retrieve drug entry by DrugBank ID (e.g., 'DB00001')"""
    root = get_drugbank_root()
    ns = {'db': 'http://www.drugbank.ca'}

    for drug in root.findall('db:drug', ns):
        primary_id = drug.find('db:drugbank-id[@primary="true"]', ns)
        if primary_id is not None and primary_id.text == drugbank_id:
            return drug
    return None

# Example usage
drug = get_drug_by_id('DB00001')
if drug:
    name = drug.find('db:name', ns).text
    print(f"Drug: {name}")
```

### Query by Name
```python
def get_drug_by_name(drug_name):
    """Find drug by name (case-insensitive)"""
    root = get_drugbank_root()
    ns = {'db': 'http://www.drugbank.ca'}

    drug_name_lower = drug_name.lower()

    for drug in root.findall('db:drug', ns):
        name_elem = drug.find('db:name', ns)
        if name_elem is not None and name_elem.text.lower() == drug_name_lower:
            return drug

        # Also check synonyms
        for synonym in drug.findall('.//db:synonym', ns):
            if synonym.text and synonym.text.lower() == drug_name_lower:
                return drug
    return None

# Example
drug = get_drug_by_name('Aspirin')
```

### Query by CAS Number
```python
def get_drug_by_cas(cas_number):
    """Find drug by CAS registry number"""
    root = get_drugbank_root()
    ns = {'db': 'http://www.drugbank.ca'}

    for drug in root.findall('db:drug', ns):
        cas_elem = drug.find('db:cas-number', ns)
        if cas_elem is not None and cas_elem.text == cas_number:
            return drug
    return None
```

## Extract Specific Information

### Basic Drug Information
```python
def extract_basic_info(drug):
    """Extract essential drug information"""
    ns = {'db': 'http://www.drugbank.ca'}

    info = {
        'drugbank_id': drug.find('db:drugbank-id[@primary="true"]', ns).text,
        'name': drug.find('db:name', ns).text,
        'type': drug.get('type'),
        'cas_number': get_text_safe(drug.find('db:cas-number', ns)),
        'description': get_text_safe(drug.find('db:description', ns)),
        'indication': get_text_safe(drug.find('db:indication', ns)),
    }
    return info

def get_text_safe(element):
    """Safely get text from element, return None if not found"""
    return element.text if element is not None else None
```

### Chemical Properties
```python
def extract_chemical_properties(drug):
    """Extract chemical structure and properties"""
    ns = {'db': 'http://www.drugbank.ca'}

    properties = {}

    # Calculated properties
    calc_props = drug.find('db:calculated-properties', ns)
    if calc_props is not None:
        for prop in calc_props.findall('db:property', ns):
            kind = prop.find('db:kind', ns).text
            value = prop.find('db:value', ns).text
            properties[kind] = value

    # Experimental properties
    exp_props = drug.find('db:experimental-properties', ns)
    if exp_props is not None:
        for prop in exp_props.findall('db:property', ns):
            kind = prop.find('db:kind', ns).text
            value = prop.find('db:value', ns).text
            properties[f"{kind}_experimental"] = value

    return properties

# Common properties to extract:
# - SMILES
# - InChI
# - InChIKey
# - Molecular Formula
# - Molecular Weight
# - logP (partition coefficient)
# - Water Solubility
# - Melting Point
# - pKa
```

### Pharmacology Information
```python
def extract_pharmacology(drug):
    """Extract pharmacological information"""
    ns = {'db': 'http://www.drugbank.ca'}

    pharm = {
        'indication': get_text_safe(drug.find('db:indication', ns)),
        'pharmacodynamics': get_text_safe(drug.find('db:pharmacodynamics', ns)),
        'mechanism_of_action': get_text_safe(drug.find('db:mechanism-of-action', ns)),
        'toxicity': get_text_safe(drug.find('db:toxicity', ns)),
        'metabolism': get_text_safe(drug.find('db:metabolism', ns)),
        'absorption': get_text_safe(drug.find('db:absorption', ns)),
        'half_life': get_text_safe(drug.find('db:half-life', ns)),
        'protein_binding': get_text_safe(drug.find('db:protein-binding', ns)),
        'route_of_elimination': get_text_safe(drug.find('db:route-of-elimination', ns)),
        'volume_of_distribution': get_text_safe(drug.find('db:volume-of-distribution', ns)),
        'clearance': get_text_safe(drug.find('db:clearance', ns)),
    }
    return pharm
```

### External Identifiers
```python
def extract_external_identifiers(drug):
    """Extract cross-references to other databases"""
    ns = {'db': 'http://www.drugbank.ca'}

    identifiers = {}

    external_ids = drug.find('db:external-identifiers', ns)
    if external_ids is not None:
        for ext_id in external_ids.findall('db:external-identifier', ns):
            resource = ext_id.find('db:resource', ns).text
            identifier = ext_id.find('db:identifier', ns).text
            identifiers[resource] = identifier

    return identifiers

# Common external databases:
# - PubChem Compound
# - PubChem Substance
# - ChEMBL
# - ChEBI
# - UniProtKB
# - KEGG Drug
# - PharmGKB
# - RxCUI (RxNorm)
# - ZINC
```

## Building Drug Datasets

### Create Drug Dictionary
```python
def build_drug_database():
    """Build searchable dictionary of all drugs"""
    root = get_drugbank_root()
    ns = {'db': 'http://www.drugbank.ca'}

    drug_db = {}

    for drug in root.findall('db:drug', ns):
        db_id = drug.find('db:drugbank-id[@primary="true"]', ns).text

        drug_info = {
            'id': db_id,
            'name': get_text_safe(drug.find('db:name', ns)),
            'type': drug.get('type'),
            'description': get_text_safe(drug.find('db:description', ns)),
            'cas': get_text_safe(drug.find('db:cas-number', ns)),
            'indication': get_text_safe(drug.find('db:indication', ns)),
        }

        drug_db[db_id] = drug_info

    return drug_db

# Create searchable database
drugs = build_drug_database()
print(f"Total drugs: {len(drugs)}")
```

### Export to DataFrame
```python
import pandas as pd

def create_drug_dataframe():
    """Create pandas DataFrame of drug information"""
    root = get_drugbank_root()
    ns = {'db': 'http://www.drugbank.ca'}

    drugs_data = []

    for drug in root.findall('db:drug', ns):
        drug_dict = {
            'drugbank_id': drug.find('db:drugbank-id[@primary="true"]', ns).text,
            'name': get_text_safe(drug.find('db:name', ns)),
            'type': drug.get('type'),
            'cas_number': get_text_safe(drug.find('db:cas-number', ns)),
            'description': get_text_safe(drug.find('db:description', ns)),
            'indication': get_text_safe(drug.find('db:indication', ns)),
        }
        drugs_data.append(drug_dict)

    df = pd.DataFrame(drugs_data)
    return df

# Usage
df = create_drug_dataframe()
df.to_csv('drugbank_drugs.csv', index=False)
```

### Filter by Drug Type
```python
def filter_by_type(drug_type='small molecule'):
    """Get drugs of specific type"""
    root = get_drugbank_root()
    ns = {'db': 'http://www.drugbank.ca'}

    filtered_drugs = []

    for drug in root.findall('db:drug', ns):
        if drug.get('type') == drug_type:
            db_id = drug.find('db:drugbank-id[@primary="true"]', ns).text
            name = get_text_safe(drug.find('db:name', ns))
            filtered_drugs.append({'id': db_id, 'name': name})

    return filtered_drugs

# Get all biotech drugs
biotech_drugs = filter_by_type('biotech')
```

### Search by Keyword
```python
def search_drugs_by_keyword(keyword, field='indication'):
    """Search drugs by keyword in specific field"""
    root = get_drugbank_root()
    ns = {'db': 'http://www.drugbank.ca'}

    results = []
    keyword_lower = keyword.lower()

    for drug in root.findall('db:drug', ns):
        field_elem = drug.find(f'db:{field}', ns)
        if field_elem is not None and field_elem.text:
            if keyword_lower in field_elem.text.lower():
                db_id = drug.find('db:drugbank-id[@primary="true"]', ns).text
                name = get_text_safe(drug.find('db:name', ns))
                results.append({
                    'id': db_id,
                    'name': name,
                    field: field_elem.text[:200]  # First 200 chars
                })

    return results

# Example: Find drugs for cancer treatment
cancer_drugs = search_drugs_by_keyword('cancer', 'indication')
```

## Performance Optimization

### Indexing for Faster Queries
```python
def build_indexes():
    """Build indexes for faster lookups"""
    root = get_drugbank_root()
    ns = {'db': 'http://www.drugbank.ca'}

    # Index by ID, name, and CAS
    id_index = {}
    name_index = {}
    cas_index = {}

    for drug in root.findall('db:drug', ns):
        db_id = drug.find('db:drugbank-id[@primary="true"]', ns).text
        id_index[db_id] = drug

        name = get_text_safe(drug.find('db:name', ns))
        if name:
            name_index[name.lower()] = drug

        cas = get_text_safe(drug.find('db:cas-number', ns))
        if cas:
            cas_index[cas] = drug

    return {'id': id_index, 'name': name_index, 'cas': cas_index}

# Build once, query many times
indexes = build_indexes()
drug = indexes['name'].get('aspirin')
```
