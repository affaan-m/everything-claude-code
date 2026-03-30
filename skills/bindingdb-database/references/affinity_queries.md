# BindingDB Affinity Query Reference

## Affinity Measurement Types

### Ki (Inhibition Constant)
- **Definition**: Equilibrium constant for inhibitor-enzyme complex dissociation
- **Equation**: Ki = [E][I]/[EI]
- **Usage**: Enzyme inhibition; preferred for mechanistic studies
- **Note**: Independent of substrate concentration (unlike IC50)

### Kd (Dissociation Constant)
- **Definition**: Thermodynamic binding equilibrium constant
- **Equation**: Kd = [A][B]/[AB]
- **Usage**: Direct binding assays (SPR, ITC, fluorescence anisotropy)
- **Note**: True measure of binding strength; lower = tighter binding

### IC50 (Half-Maximal Inhibitory Concentration)
- **Definition**: Concentration of inhibitor that reduces target activity by 50%
- **Usage**: Most common in drug discovery; assay-dependent
- **Conversion to Ki**: Cheng-Prusoff equation: Ki = IC50 / (1 + [S]/Km)
- **Note**: Depends on substrate concentration and assay conditions

### EC50 (Half-Maximal Effective Concentration)
- **Definition**: Concentration that produces 50% of maximal effect
- **Usage**: Cell-based assays, agonist studies

### Kinetics Parameters
- **kon**: Association rate constant (M⁻¹s⁻¹); describes how fast complex forms
- **koff**: Dissociation rate constant (s⁻¹); describes how fast complex dissociates
- **Residence time**: τ = 1/koff; longer residence = more sustained effect
- **Kd from kinetics**: Kd = koff/kon

## Common API Query Patterns

### By UniProt ID (REST API)

```python
import requests

def query_by_uniprot(uniprot_id, affinity_type="Ki"):
    """
    REST API query for BindingDB affinities by UniProt target ID.
    """
    url = "https://www.bindingdb.org/axis2/services/BDBService/getLigandsByUniprotID"
    params = {
        "uniprot_id": uniprot_id,
        "cutoff": "10000",  # nM threshold
        "affinity_type": affinity_type,
        "response": "json"
    }
    response = requests.get(url, params=params)
    return response.json()

# Important targets
COMMON_TARGETS = {
    "ABL1": "P00519",    # Imatinib, dasatinib target
    "EGFR": "P00533",    # Erlotinib, gefitinib target
    "BRAF": "P15056",    # Vemurafenib, dabrafenib target
    "CDK2": "P24941",    # Cell cycle kinase
    "HDAC1": "Q13547",   # Histone deacetylase
    "BRD4": "O60885",    # BET bromodomain reader
    "MDM2": "Q00987",    # p53 negative regulator
    "BCL2": "P10415",    # Antiapoptotic protein
    "PCSK9": "Q8NBP7",   # Cholesterol regulator
    "JAK2": "O60674",    # Cytokine signaling kinase
}
```

### By PubChem CID (REST API)

```python
def query_by_pubchem_cid(pubchem_cid):
    """Get all binding data for a specific compound by PubChem CID."""
    url = "https://www.bindingdb.org/axis2/services/BDBService/getAffinitiesByCID"
    params = {"cid": pubchem_cid, "response": "json"}
    response = requests.get(url, params=params)
    return response.json()

# Example: Imatinib PubChem CID = 5291
imatinib_data = query_by_pubchem_cid(5291)
```

### By Target Name

```python
def query_by_target_name(target_name, affinity_cutoff=100):
    """Query BindingDB by target name."""
    url = "https://www.bindingdb.org/axis2/services/BDBService/getAffinitiesByTarget"
    params = {
        "target_name": target_name,
        "cutoff": affinity_cutoff,
        "response": "json"
    }
    response = requests.get(url, params=params)
    return response.json()
```

## Dataset Download Guide

### Available Files

| File | Size | Contents |
|------|------|---------|
| `BindingDB_All.tsv.zip` | ~3.5 GB | All data: ~2.9M records |
| `BindingDB_All.sdf.zip` | ~7 GB | All data with 3D structures |
| `BindingDB_IC50.tsv` | ~1.5 GB | IC50 data only |
| `BindingDB_Ki.tsv` | ~0.8 GB | Ki data only |
| `BindingDB_Kd.tsv` | ~0.2 GB | Kd data only |
| `BindingDB_EC50.tsv` | ~0.5 GB | EC50 data only |
| `tdc_bindingdb_*` | Various | TDC-formatted subsets |

### Efficient Loading

```python
import pandas as pd

# For large files, use chunking
def load_bindingdb_chunked(filepath, uniprot_ids, affinity_col="Ki (nM)", chunk_size=100000):
    """Load BindingDB in chunks to filter for specific targets."""
    results = []
    for chunk in pd.read_csv(filepath, sep="\t", chunksize=chunk_size,
                              low_memory=False, on_bad_lines='skip'):
        # Filter for target
        mask = chunk["UniProt (SwissProt) Primary ID of Target Chain"].isin(uniprot_ids)
        if mask.any():
            results.append(chunk[mask])

    if results:
        return pd.concat(results)
    return pd.DataFrame()
```

## pKi / pIC50 Conversion

Converting raw affinity to logarithmic scale (common in ML):

```python
import numpy as np

def to_log_affinity(affinity_nM):
    """Convert nM affinity to pAffinity (negative log molar)."""
    affinity_M = affinity_nM * 1e-9  # Convert nM to M
    return -np.log10(affinity_M)

# Examples:
# 1 nM   → pAffinity = 9.0
# 10 nM  → pAffinity = 8.0
# 100 nM → pAffinity = 7.0
# 1 μM   → pAffinity = 6.0
# 10 μM  → pAffinity = 5.0
```

## Quality Filters

When using BindingDB data for ML or SAR:

```python
def filter_quality(df):
    """Apply quality filters to BindingDB data."""
    # 1. Require valid SMILES
    df = df[df["Ligand SMILES"].notna() & (df["Ligand SMILES"] != "")]

    # 2. Require valid affinity
    df = df[df["Ki (nM)"].notna() | df["IC50 (nM)"].notna()]

    # 3. Filter extreme values (artifacts)
    for col in ["Ki (nM)", "IC50 (nM)", "Kd (nM)"]:
        if col in df.columns:
            df = df[~(df[col] > 1e6)]  # Remove > 1 mM (non-specific)

    # 4. Use only human targets
    if "Target Source Organism According to Curator or DataSource" in df.columns:
        df = df[df["Target Source Organism According to Curator or DataSource"].str.contains(
            "Homo sapiens", na=False
        )]

    return df
```
