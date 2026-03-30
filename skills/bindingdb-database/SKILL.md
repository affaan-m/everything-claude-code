---
name: bindingdb-database
description: Query BindingDB for measured drug-target binding affinities (Ki, Kd, IC50, EC50). Search by target (UniProt ID), compound (SMILES/name), or pathogen. Essential for drug discovery, lead optimization, polypharmacology analysis, and structure-activity relationship (SAR) studies.
license: CC-BY-3.0
metadata:
    skill-author: Kuan-lin Huang
---

# BindingDB Database

## Overview

BindingDB (https://www.bindingdb.org/) is the primary public database of measured drug-protein binding affinities. It contains over 3 million binding data records for ~1.4 million compounds tested against ~9,200 protein targets, curated from scientific literature and patent literature. BindingDB stores quantitative binding measurements (Ki, Kd, IC50, EC50) essential for drug discovery, pharmacology, and computational chemistry research.

**Key resources:**
- BindingDB website: https://www.bindingdb.org/
- REST API: https://www.bindingdb.org/axis2/services/BDBService
- Downloads: https://www.bindingdb.org/bind/chemsearch/marvin/Download.jsp
- GitHub: https://github.com/drugilsberg/bindingdb

## When to Use This Skill

Use BindingDB when:

- **Target-based drug discovery**: What known compounds bind to a target protein? What are their affinities?
- **SAR analysis**: How do structural modifications affect binding affinity for a series of analogs?
- **Lead compound profiling**: What targets does a compound bind (selectivity/polypharmacology)?
- **Benchmark datasets**: Obtain curated protein-ligand affinity data for ML model training
- **Repurposing analysis**: Does an approved drug bind to an unintended target?
- **Competitive analysis**: What is the best reported affinity for a target class?
- **Fragment screening**: Find validated binding data for fragments against a target

## Core Capabilities

### 1. BindingDB REST API

Base URL: `https://www.bindingdb.org/axis2/services/BDBService`

```python
import requests

BASE_URL = "https://www.bindingdb.org/axis2/services/BDBService"

def bindingdb_query(method, params):
    """Query the BindingDB REST API."""
    url = f"{BASE_URL}/{method}"
    response = requests.get(url, params=params, headers={"Accept": "application/json"})
    response.raise_for_status()
    return response.json()
```

### 2. Query by Target (UniProt ID)

```python
def get_ligands_for_target(uniprot_id, affinity_type="Ki", cutoff=10000, unit="nM"):
    """
    Get all ligands with measured affinity for a UniProt target.

    Args:
        uniprot_id: UniProt accession (e.g., "P00519" for ABL1)
        affinity_type: "Ki", "Kd", "IC50", "EC50"
        cutoff: Maximum affinity value to return (in nM)
        unit: "nM" or "uM"
    """
    params = {
        "uniprot_id": uniprot_id,
        "affinity_type": affinity_type,
        "affinity_cutoff": cutoff,
        "response": "json"
    }
    return bindingdb_query("getLigandsByUniprotID", params)

# Example: Get all compounds binding ABL1 (imatinib target)
ligands = get_ligands_for_target("P00519", affinity_type="Ki", cutoff=100)
```

### 3. Query by Compound Name or SMILES

```python
def search_by_name(compound_name, limit=100):
    """Search BindingDB for compounds by name."""
    params = {
        "compound_name": compound_name,
        "response": "json",
        "max_results": limit
    }
    return bindingdb_query("getAffinitiesByCompoundName", params)

def search_by_smiles(smiles, similarity=100, limit=50):
    """
    Search BindingDB by SMILES string.

    Args:
        smiles: SMILES string of the compound
        similarity: Tanimoto similarity threshold (1-100, 100 = exact)
    """
    params = {
        "SMILES": smiles,
        "similarity": similarity,
        "response": "json",
        "max_results": limit
    }
    return bindingdb_query("getAffinitiesByBEI", params)

# Example: Search for imatinib binding data
result = search_by_name("imatinib")
```

### 4. Download-Based Analysis (Recommended for Large Queries)

For comprehensive analyses, download BindingDB data directly:

```python
import pandas as pd

def load_bindingdb(filepath="BindingDB_All.tsv"):
    """
    Load BindingDB TSV file.
    Download from: https://www.bindingdb.org/bind/chemsearch/marvin/Download.jsp
    """
    # Key columns
    usecols = [
        "BindingDB Reactant_set_id",
        "Ligand SMILES",
        "Ligand InChI",
        "Ligand InChI Key",
        "BindingDB Target Chain  Sequence",
        "PDB ID(s) for Ligand-Target Complex",
        "UniProt (SwissProt) Entry Name of Target Chain",
        "UniProt (SwissProt) Primary ID of Target Chain",
        "UniProt (TrEMBL) Primary ID of Target Chain",
        "Ki (nM)",
        "IC50 (nM)",
        "Kd (nM)",
        "EC50 (nM)",
        "kon (M-1-s-1)",
        "koff (s-1)",
        "Target Name",
        "Target Source Organism According to Curator or DataSource",
        "Number of Protein Chains in Target (>1 implies a multichain complex)",
        "PubChem CID",
        "PubChem SID",
        "ChEMBL ID of Ligand",
        "DrugBank ID of Ligand",
    ]

    df = pd.read_csv(filepath, sep="\t", usecols=[c for c in usecols if c],
                     low_memory=False, on_bad_lines='skip')

    # Convert affinity columns to numeric
    for col in ["Ki (nM)", "IC50 (nM)", "Kd (nM)", "EC50 (nM)"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')

    return df

def query_target_affinity(df, uniprot_id, affinity_types=None, max_nm=10000):
    """Query loaded BindingDB for a specific target."""
    if affinity_types is None:
        affinity_types = ["Ki (nM)", "IC50 (nM)", "Kd (nM)"]

    # Filter by UniProt ID
    mask = df["UniProt (SwissProt) Primary ID of Target Chain"] == uniprot_id
    target_df = df[mask].copy()

    # Filter by affinity cutoff
    has_affinity = pd.Series(False, index=target_df.index)
    for col in affinity_types:
        if col in target_df.columns:
            has_affinity |= target_df[col] <= max_nm

    result = target_df[has_affinity][["Ligand SMILES"] + affinity_types +
                                      ["PubChem CID", "ChEMBL ID of Ligand"]].dropna(how='all')
    return result.sort_values(affinity_types[0])
```

### 5. SAR Analysis

```python
import pandas as pd

def sar_analysis(df, target_uniprot, affinity_col="IC50 (nM)"):
    """
    Structure-activity relationship analysis for a target.
    Retrieves all compounds with affinity data and ranks by potency.
    """
    target_data = query_target_affinity(df, target_uniprot, [affinity_col])

    if target_data.empty:
        return target_data

    # Add pIC50 (negative log of IC50 in molar)
    if affinity_col in target_data.columns:
        target_data = target_data[target_data[affinity_col].notna()].copy()
        target_data["pAffinity"] = -((target_data[affinity_col] * 1e-9).apply(
            lambda x: __import__('math').log10(x)
        ))
        target_data = target_data.sort_values("pAffinity", ascending=False)

    return target_data

# Most potent compounds against EGFR (P00533)
# sar = sar_analysis(df, "P00533", "IC50 (nM)")
# print(sar.head(20))
```

### 6. Polypharmacology Profile

```python
def polypharmacology_profile(df, ligand_smiles_or_name, affinity_cutoff_nM=1000):
    """
    Find all targets a compound binds to.
    Uses PubChem CID or SMILES for matching.
    """
    # Search by ligand SMILES (exact match)
    mask = df["Ligand SMILES"] == ligand_smiles_or_name

    ligand_data = df[mask].copy()

    # Filter by affinity
    aff_cols = ["Ki (nM)", "IC50 (nM)", "Kd (nM)"]
    has_aff = pd.Series(False, index=ligand_data.index)
    for col in aff_cols:
        if col in ligand_data.columns:
            has_aff |= ligand_data[col] <= affinity_cutoff_nM

    result = ligand_data[has_aff][
        ["Target Name", "UniProt (SwissProt) Primary ID of Target Chain"] + aff_cols
    ].dropna(how='all')

    return result.sort_values("Ki (nM)")
```

## Query Workflows

### Workflow 1: Find Best Inhibitors for a Target

```python
import pandas as pd

def find_best_inhibitors(uniprot_id, affinity_type="IC50 (nM)", top_n=20):
    """Find the most potent inhibitors for a target in BindingDB."""
    df = load_bindingdb("BindingDB_All.tsv")  # Load once and reuse
    result = query_target_affinity(df, uniprot_id, [affinity_type])

    if result.empty:
        print(f"No data found for {uniprot_id}")
        return result

    result = result.sort_values(affinity_type).head(top_n)
    print(f"Top {top_n} inhibitors for {uniprot_id} by {affinity_type}:")
    for _, row in result.iterrows():
        print(f"  {row['PubChem CID']}: {row[affinity_type]:.1f} nM | SMILES: {row['Ligand SMILES'][:40]}...")
    return result
```

### Workflow 2: Selectivity Profiling

1. Get all affinity data for your compound across all targets
2. Compare affinity ratios between on-target and off-targets
3. Identify selectivity cliffs (structural changes that improve selectivity)
4. Cross-reference with ChEMBL for additional selectivity data

### Workflow 3: Machine Learning Dataset Preparation

```python
def prepare_ml_dataset(df, uniprot_ids, affinity_col="IC50 (nM)",
                        max_affinity_nM=100000, min_count=50):
    """Prepare BindingDB data for ML model training."""
    records = []
    for uid in uniprot_ids:
        target_df = query_target_affinity(df, uid, [affinity_col], max_affinity_nM)
        if len(target_df) >= min_count:
            target_df = target_df.copy()
            target_df["target"] = uid
            records.append(target_df)

    if not records:
        return pd.DataFrame()

    combined = pd.concat(records)
    # Add pAffinity (normalized)
    combined["pAffinity"] = -((combined[affinity_col] * 1e-9).apply(
        lambda x: __import__('math').log10(max(x, 1e-12))
    ))
    return combined[["Ligand SMILES", "target", "pAffinity", affinity_col]].dropna()
```

## Key Data Fields

| Field | Description |
|-------|-------------|
| `Ligand SMILES` | 2D structure of the compound |
| `Ligand InChI Key` | Unique chemical identifier |
| `Ki (nM)` | Inhibition constant (equilibrium, functional) |
| `Kd (nM)` | Dissociation constant (thermodynamic, binding) |
| `IC50 (nM)` | Half-maximal inhibitory concentration |
| `EC50 (nM)` | Half-maximal effective concentration |
| `kon (M-1-s-1)` | Association rate constant |
| `koff (s-1)` | Dissociation rate constant |
| `UniProt (SwissProt) Primary ID` | Target UniProt accession |
| `Target Name` | Protein name |
| `PDB ID(s) for Ligand-Target Complex` | Crystal structures |
| `PubChem CID` | PubChem compound ID |
| `ChEMBL ID of Ligand` | ChEMBL compound ID |

## Affinity Interpretation

| Affinity | Classification | Drug-likeness |
|----------|---------------|---------------|
| < 1 nM | Sub-nanomolar | Very potent (picomolar range) |
| 1–10 nM | Nanomolar | Potent, typical for approved drugs |
| 10–100 nM | Moderate | Common lead compounds |
| 100–1000 nM | Weak | Fragment/starting point |
| > 1000 nM | Very weak | Generally below drug-relevance threshold |

## Best Practices

- **Use Ki for direct binding**: Ki reflects true binding affinity independent of enzymatic mechanism
- **IC50 context-dependency**: IC50 values depend on substrate concentration (Cheng-Prusoff equation)
- **Normalize units**: BindingDB reports in nM; verify units when comparing across studies
- **Filter by target organism**: Use `Target Source Organism` to ensure human protein data
- **Handle missing values**: Not all compounds have all measurement types
- **Cross-reference with ChEMBL**: ChEMBL has more curated activity data for medicinal chemistry

## Additional Resources

- **BindingDB website**: https://www.bindingdb.org/
- **Data downloads**: https://www.bindingdb.org/bind/chemsearch/marvin/Download.jsp
- **API documentation**: https://www.bindingdb.org/bind/BindingDBRESTfulAPI.jsp
- **Citation**: Gilson MK et al. (2016) Nucleic Acids Research. PMID: 26481362
- **Related resources**: ChEMBL (https://www.ebi.ac.uk/chembl/), PubChem BioAssay
