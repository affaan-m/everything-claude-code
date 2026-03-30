---
name: zinc-database
description: Access ZINC (230M+ purchasable compounds). Search by ZINC ID/SMILES, similarity searches, 3D-ready structures for docking, analog discovery, for virtual screening and drug discovery.
license: Unknown
metadata:
    skill-author: K-Dense Inc.
---

# ZINC Database

## Overview

ZINC is a freely accessible repository of 230M+ purchasable compounds maintained by UCSF. Search by ZINC ID or SMILES, perform similarity searches, download 3D-ready structures for docking, discover analogs for virtual screening and drug discovery.

## When to Use This Skill

This skill should be used when:

- **Virtual screening**: Finding compounds for molecular docking studies
- **Lead discovery**: Identifying commercially-available compounds for drug development
- **Structure searches**: Performing similarity or analog searches by SMILES
- **Compound retrieval**: Looking up molecules by ZINC IDs or supplier codes
- **Chemical space exploration**: Exploring purchasable chemical diversity
- **Docking studies**: Accessing 3D-ready molecular structures
- **Analog searches**: Finding similar compounds based on structural similarity
- **Supplier queries**: Identifying compounds from specific chemical vendors
- **Random sampling**: Obtaining random compound sets for screening

## Database Versions

ZINC has evolved through multiple versions:

- **ZINC22** (Current): Largest version with 230+ million purchasable compounds and multi-billion scale make-on-demand compounds
- **ZINC20**: Still maintained, focused on lead-like and drug-like compounds
- **ZINC15**: Predecessor version, legacy but still documented

This skill primarily focuses on ZINC22, the most current and comprehensive version.

## Access Methods

### Web Interface

Primary access point: https://zinc.docking.org/
Interactive searching: https://cartblanche22.docking.org/

### API Access

All ZINC22 searches can be performed programmatically via the CartBlanche22 API:

**Base URL**: `https://cartblanche22.docking.org/`

All API endpoints return data in text or JSON format with customizable fields.

## Core Capabilities

### 1. Search by ZINC ID

Retrieve specific compounds using their ZINC identifiers.

**Web interface**: https://cartblanche22.docking.org/search/zincid

**API endpoint**:
```bash
curl "https://cartblanche22.docking.org/[email protected]_fields=smiles,zinc_id"
```

**Multiple IDs**:
```bash
curl "https://cartblanche22.docking.org/substances.txt:zinc_id=ZINC000000000001,ZINC000000000002&output_fields=smiles,zinc_id,tranche"
```

**Response fields**: `zinc_id`, `smiles`, `sub_id`, `supplier_code`, `catalogs`, `tranche` (includes H-count, LogP, MW, phase)

### 2. Search by SMILES

Find compounds by chemical structure using SMILES notation, with optional distance parameters for analog searching.

**Web interface**: https://cartblanche22.docking.org/search/smiles

**API endpoint**:
```bash
curl "https://cartblanche22.docking.org/[email protected]=4-Fadist=4"
```

**Parameters**:
- `smiles`: Query SMILES string (URL-encoded if necessary)
- `dist`: Tanimoto distance threshold (default: 0 for exact match)
- `adist`: Alternative distance parameter for broader searches (default: 0)
- `output_fields`: Comma-separated list of desired output fields

**Example - Exact match**:
```bash
curl "https://cartblanche22.docking.org/smiles.txt:smiles=c1ccccc1"
```

**Example - Similarity search**:
```bash
curl "https://cartblanche22.docking.org/smiles.txt:smiles=c1ccccc1&dist=3&output_fields=zinc_id,smiles,tranche"
```

### 3. Search by Supplier Codes

Query compounds from specific chemical suppliers or retrieve all molecules from particular catalogs.

**Web interface**: https://cartblanche22.docking.org/search/catitems

**API endpoint**:
```bash
curl "https://cartblanche22.docking.org/catitems.txt:catitem_id=SUPPLIER-CODE-123"
```

**Use cases**:
- Verify compound availability from specific vendors
- Retrieve all compounds from a catalog
- Cross-reference supplier codes with ZINC IDs

### 4. Random Compound Sampling

Generate random compound sets for screening or benchmarking purposes.

**Web interface**: https://cartblanche22.docking.org/search/random

**API endpoint**:
```bash
curl "https://cartblanche22.docking.org/substance/random.txt:count=100"
```

**Parameters**:
- `count`: Number of random compounds to retrieve (default: 100)
- `subset`: Filter by subset (e.g., 'lead-like', 'drug-like', 'fragment')
- `output_fields`: Customize returned data fields

**Example - Random lead-like molecules**:
```bash
curl "https://cartblanche22.docking.org/substance/random.txt:count=1000&subset=lead-like&output_fields=zinc_id,smiles,tranche"
```

## Common Workflows

### Workflow 1: Preparing a Docking Library

1. **Define search criteria** based on target properties or desired chemical space

2. **Query ZINC22** using appropriate search method:
   ```bash
   # Example: Get drug-like compounds with specific LogP and MW
   curl "https://cartblanche22.docking.org/substance/random.txt:count=10000&subset=drug-like&output_fields=zinc_id,smiles,tranche" > docking_library.txt
   ```

3. **Parse results** to extract ZINC IDs and SMILES:
   ```python
   import pandas as pd

   # Load results
   df = pd.read_csv('docking_library.txt', sep='\t')

   # Filter by properties in tranche data
   # Tranche format: H##P###M###-phase
   # H = H-bond donors, P = LogP*10, M = MW
   ```

4. **Download 3D structures** for docking using ZINC ID or download from file repositories

### Workflow 2: Finding Analogs of a Hit Compound

1. **Obtain SMILES** of the hit compound:
   ```python
   hit_smiles = "CC(C)Cc1ccc(cc1)C(C)C(=O)O"  # Example: Ibuprofen
   ```

2. **Perform similarity search** with distance threshold:
   ```bash
   curl "https://cartblanche22.docking.org/smiles.txt:smiles=CC(C)Cc1ccc(cc1)C(C)C(=O)O&dist=5&output_fields=zinc_id,smiles,catalogs" > analogs.txt
   ```

3. **Analyze results** to identify purchasable analogs:
   ```python
   import pandas as pd

   analogs = pd.read_csv('analogs.txt', sep='\t')
   print(f"Found {len(analogs)} analogs")
   print(analogs[['zinc_id', 'smiles', 'catalogs']].head(10))
   ```

4. **Retrieve 3D structures** for the most promising analogs

### Workflow 3: Batch Compound Retrieval

1. **Compile list of ZINC IDs** from literature, databases, or previous screens:
   ```python
   zinc_ids = [
       "ZINC000000000001",
       "ZINC000000000002",
       "ZINC000000000003"
   ]
   zinc_ids_str = ",".join(zinc_ids)
   ```

2. **Query ZINC22 API**:
   ```bash
   curl "https://cartblanche22.docking.org/substances.txt:zinc_id=ZINC000000000001,ZINC000000000002&output_fields=zinc_id,smiles,supplier_code,catalogs"
   ```

3. **Process results** for downstream analysis or purchasing

### Workflow 4: Chemical Space Sampling

1. **Select subset parameters** based on screening goals:
   - Fragment: MW < 250, good for fragment-based drug discovery
   - Lead-like: MW 250-350, LogP ≤ 3.5
   - Drug-like: MW 350-500, follows Lipinski's Rule of Five

2. **Generate random sample**:
   ```bash
   curl "https://cartblanche22.docking.org/substance/random.txt:count=5000&subset=lead-like&output_fields=zinc_id,smiles,tranche" > chemical_space_sample.txt
   ```

3. **Analyze chemical diversity** and prepare for virtual screening

## Output Fields

Customize API responses with the `output_fields` parameter:

**Available fields**:
- `zinc_id`: ZINC identifier
- `smiles`: SMILES string representation
- `sub_id`: Internal substance ID
- `supplier_code`: Vendor catalog number
- `catalogs`: List of suppliers offering the compound
- `tranche`: Encoded molecular properties (H-count, LogP, MW, reactivity phase)

**Example**:
```bash
curl "https://cartblanche22.docking.org/substances.txt:zinc_id=ZINC000000000001&output_fields=zinc_id,smiles,catalogs,tranche"
```

## Tranche System

ZINC organizes compounds into "tranches" based on molecular properties:

**Format**: `H##P###M###-phase`

- **H##**: Number of hydrogen bond donors (00-99)
- **P###**: LogP × 10 (e.g., P035 = LogP 3.5)
- **M###**: Molecular weight in Daltons (e.g., M400 = 400 Da)
- **phase**: Reactivity classification

**Example tranche**: `H05P035M400-0`
- 5 H-bond donors
- LogP = 3.5
- MW = 400 Da
- Reactivity phase 0

Use tranche data to filter compounds by drug-likeness criteria.

## Downloading 3D Structures

For molecular docking, 3D structures are available via file repositories:

**File repository**: https://files.docking.org/zinc22/

Structures are organized by tranches and available in multiple formats:
- MOL2: Multi-molecule format with 3D coordinates
- SDF: Structure-data file format
- DB2.GZ: Compressed database format for DOCK

Refer to ZINC documentation at https://wiki.docking.org for downloading protocols and batch access methods.

## Python Integration

### Using curl with Python

```python
import subprocess
import json

def query_zinc_by_id(zinc_id, output_fields="zinc_id,smiles,catalogs"):
    """Query ZINC22 by ZINC ID."""
    url = f"https://cartblanche22.docking.org/[email protected]_id={zinc_id}&output_fields={output_fields}"
    result = subprocess.run(['curl', url], capture_output=True, text=True)
    return result.stdout

def search_by_smiles(smiles, dist=0, adist=0, output_fields="zinc_id,smiles"):
    """Search ZINC22 by SMILES with optional distance parameters."""
    url = f"https://cartblanche22.docking.org/smiles.txt:smiles={smiles}&dist={dist}&adist={adist}&output_fields={output_fields}"
    result = subprocess.run(['curl', url], capture_output=True, text=True)
    return result.stdout

def get_random_compounds(count=100, subset=None, output_fields="zinc_id,smiles,tranche"):
    """Get random compounds from ZINC22."""
    url = f"https://cartblanche22.docking.org/substance/random.txt:count={count}&output_fields={output_fields}"
    if subset:
        url += f"&subset={subset}"
    result = subprocess.run(['curl', url], capture_output=True, text=True)
    return result.stdout
```

### Parsing Results

```python
import pandas as pd
from io import StringIO

# Query ZINC and parse as DataFrame
result = query_zinc_by_id("ZINC000000000001")
df = pd.read_csv(StringIO(result), sep='\t')

# Extract tranche properties
def parse_tranche(tranche_str):
    """Parse ZINC tranche code to extract properties."""
    # Format: H##P###M###-phase
    import re
    match = re.match(r'H(\d+)P(\d+)M(\d+)-(\d+)', tranche_str)
    if match:
        return {
            'h_donors': int(match.group(1)),
            'logP': int(match.group(2)) / 10.0,
            'mw': int(match.group(3)),
            'phase': int(match.group(4))
        }
    return None

df['tranche_props'] = df['tranche'].apply(parse_tranche)
```

## Best Practices

### Query Optimization

- **Start specific**: Begin with exact searches before expanding to similarity searches
- **Use appropriate distance parameters**: Small dist values (1-3) for close analogs, larger (5-10) for diverse analogs
- **Limit output fields**: Request only necessary fields to reduce data transfer
- **Batch queries**: Combine multiple ZINC IDs in a single API call when possible

### Performance Considerations

- **Rate limiting**: Respect server resources; avoid rapid consecutive requests
- **Caching**: Store frequently accessed compounds locally
- **Parallel downloads**: When downloading 3D structures, use parallel wget or aria2c for file repositories
- **Subset filtering**: Use lead-like, drug-like, or fragment subsets to reduce search space

### Data Quality

- **Verify availability**: Supplier catalogs change; confirm compound availability before large orders
- **Check stereochemistry**: SMILES may not fully specify stereochemistry; verify 3D structures
- **Validate structures**: Use cheminformatics tools (RDKit, OpenBabel) to verify structure validity
- **Cross-reference**: When possible, cross-check with other databases (PubChem, ChEMBL)

## Resources

### references/api_reference.md

Comprehensive documentation including:

- Complete API endpoint reference
- URL syntax and parameter specifications
- Advanced query patterns and examples
- File repository organization and access
- Bulk download methods
- Error handling and troubleshooting
- Integration with molecular docking software

Consult this document for detailed technical information and advanced usage patterns.

## Important Disclaimers

### Data Reliability

ZINC explicitly states: **"We do not guarantee the quality of any molecule for any purpose and take no responsibility for errors arising from the use of this database."**

- Compound availability may change without notice
- Structure representations may contain errors
- Supplier information should be verified independently
- Use appropriate validation before experimental work

### Appropriate Use

- ZINC is intended for academic and research purposes in drug discovery
- Verify licensing terms for commercial use
- Respect intellectual property when working with patented compounds
- Follow your institution's guidelines for compound procurement

## Additional Resources

- **ZINC Website**: https://zinc.docking.org/
- **CartBlanche22 Interface**: https://cartblanche22.docking.org/
- **ZINC Wiki**: https://wiki.docking.org/
- **File Repository**: https://files.docking.org/zinc22/
- **GitHub**: https://github.com/docking-org/
- **Primary Publication**: Irwin et al., J. Chem. Inf. Model 2020 (ZINC15)
- **ZINC22 Publication**: Irwin et al., J. Chem. Inf. Model 2023

## Citations

When using ZINC in publications, cite the appropriate version:

**ZINC22**:
Irwin, J. J., et al. "ZINC22—A Free Multi-Billion-Scale Database of Tangible Compounds for Ligand Discovery." *Journal of Chemical Information and Modeling* 2023.

**ZINC15**:
Irwin, J. J., et al. "ZINC15 – Ligand Discovery for Everyone." *Journal of Chemical Information and Modeling* 2020, 60, 6065–6073.

