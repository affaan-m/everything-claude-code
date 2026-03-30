# ChEMBL Web Services API Reference

## Overview

ChEMBL is a manually curated database of bioactive molecules with drug-like properties maintained by the European Bioinformatics Institute (EBI). It contains information about compounds, targets, assays, bioactivity data, and approved drugs.

The ChEMBL database contains:
- Over 2 million compound records
- Over 1.4 million assay records
- Over 19 million activity values
- Information on 13,000+ drug targets
- Data on 16,000+ approved drugs and clinical candidates

## Python Client Installation

```bash
pip install chembl_webresource_client
```

## Key Resources and Endpoints

ChEMBL provides access to 30+ specialized endpoints:

### Core Data Types

- **molecule** - Compound structures, properties, and synonyms
- **target** - Protein and non-protein biological targets
- **activity** - Bioassay measurement results
- **assay** - Experimental assay details
- **drug** - Approved pharmaceutical information
- **mechanism** - Drug mechanism of action data
- **document** - Literature sources and references
- **cell_line** - Cell line information
- **tissue** - Tissue types
- **protein_class** - Protein classification
- **target_component** - Target component details
- **compound_structural_alert** - Structural alerts for toxicity

## Query Patterns and Filters

### Filter Operators

The API supports Django-style filter operators:

- `__exact` - Exact match
- `__iexact` - Case-insensitive exact match
- `__contains` - Contains substring
- `__icontains` - Case-insensitive contains
- `__startswith` - Starts with prefix
- `__endswith` - Ends with suffix
- `__gt` - Greater than
- `__gte` - Greater than or equal
- `__lt` - Less than
- `__lte` - Less than or equal
- `__range` - Value in range
- `__in` - Value in list
- `__isnull` - Is null/not null
- `__regex` - Regular expression match
- `__search` - Full text search

### Example Filter Queries

**Molecular weight filtering:**
```python
molecules.filter(molecule_properties__mw_freebase__lte=300)
```

**Name pattern matching:**
```python
molecules.filter(pref_name__endswith='nib')
```

**Multiple conditions:**
```python
molecules.filter(
    molecule_properties__mw_freebase__lte=300,
    pref_name__endswith='nib'
)
```

## Chemical Structure Searches

### Substructure Search
Search for compounds containing a specific substructure using SMILES:

```python
from chembl_webresource_client.new_client import new_client
similarity = new_client.similarity
results = similarity.filter(smiles='CC(=O)Oc1ccccc1C(=O)O', similarity=70)
```

### Similarity Search
Find compounds similar to a query structure:

```python
similarity = new_client.similarity
results = similarity.filter(smiles='CC(=O)Oc1ccccc1C(=O)O', similarity=85)
```

## Common Data Retrieval Patterns

### Get Molecule by ChEMBL ID
```python
molecule = new_client.molecule.get('CHEMBL25')
```

### Get Target Information
```python
target = new_client.target.get('CHEMBL240')
```

### Get Activity Data
```python
activities = new_client.activity.filter(
    target_chembl_id='CHEMBL240',
    standard_type='IC50',
    standard_value__lte=100
)
```

### Get Drug Information
```python
drug = new_client.drug.get('CHEMBL1234')
```

## Response Formats

The API supports multiple response formats:
- JSON (default)
- XML
- YAML

## Caching and Performance

The Python client automatically caches results locally:
- **Default cache duration**: 24 hours
- **Cache location**: Local file system
- **Lazy evaluation**: Queries execute only when data is accessed

### Configuration Settings

```python
from chembl_webresource_client.settings import Settings

# Disable caching
Settings.Instance().CACHING = False

# Adjust cache expiration (in seconds)
Settings.Instance().CACHE_EXPIRE = 86400  # 24 hours

# Set timeout
Settings.Instance().TIMEOUT = 30

# Set retries
Settings.Instance().TOTAL_RETRIES = 3
```

## Molecular Properties

Common molecular properties available:

- `mw_freebase` - Molecular weight
- `alogp` - Calculated LogP
- `hba` - Hydrogen bond acceptors
- `hbd` - Hydrogen bond donors
- `psa` - Polar surface area
- `rtb` - Rotatable bonds
- `ro3_pass` - Rule of 3 compliance
- `num_ro5_violations` - Lipinski rule of 5 violations
- `cx_most_apka` - Most acidic pKa
- `cx_most_bpka` - Most basic pKa
- `molecular_species` - Molecular species
- `full_mwt` - Full molecular weight

## Bioactivity Data Fields

Key bioactivity fields:

- `standard_type` - Activity type (IC50, Ki, Kd, EC50, etc.)
- `standard_value` - Numerical activity value
- `standard_units` - Units (nM, uM, etc.)
- `pchembl_value` - Normalized activity value (-log scale)
- `activity_comment` - Activity annotations
- `data_validity_comment` - Data validity flags
- `potential_duplicate` - Duplicate flag

## Target Information Fields

Target data includes:

- `target_chembl_id` - ChEMBL target identifier
- `pref_name` - Preferred target name
- `target_type` - Type (PROTEIN, ORGANISM, etc.)
- `organism` - Target organism
- `tax_id` - NCBI taxonomy ID
- `target_components` - Component details

## Advanced Query Examples

### Find Kinase Inhibitors
```python
# Get kinase targets
targets = new_client.target.filter(
    target_type='SINGLE PROTEIN',
    pref_name__icontains='kinase'
)

# Get activities for these targets
activities = new_client.activity.filter(
    target_chembl_id__in=[t['target_chembl_id'] for t in targets],
    standard_type='IC50',
    standard_value__lte=100
)
```

### Retrieve Drug Mechanisms
```python
mechanisms = new_client.mechanism.filter(
    molecule_chembl_id='CHEMBL25'
)
```

### Get Compound Bioactivities
```python
activities = new_client.activity.filter(
    molecule_chembl_id='CHEMBL25',
    pchembl_value__isnull=False
)
```

## Image Generation

ChEMBL can generate SVG images of molecular structures:

```python
from chembl_webresource_client.new_client import new_client
image = new_client.image
svg = image.get('CHEMBL25')
```

## Pagination

Results are paginated automatically. To iterate through all results:

```python
activities = new_client.activity.filter(target_chembl_id='CHEMBL240')
for activity in activities:
    print(activity)
```

## Error Handling

Common errors:
- **404**: Resource not found
- **503**: Service temporarily unavailable
- **Timeout**: Request took too long

The client automatically retries failed requests based on `TOTAL_RETRIES` setting.

## Rate Limiting

ChEMBL has fair usage policies:
- Be respectful with query frequency
- Use caching to minimize repeated requests
- Consider bulk downloads for large datasets

## Additional Resources

- Official API documentation: https://www.ebi.ac.uk/chembl/api/data/docs
- Python client GitHub: https://github.com/chembl/chembl_webresource_client
- ChEMBL interface docs: https://chembl.gitbook.io/chembl-interface-documentation/
- Example notebooks: https://github.com/chembl/notebooks
