# Glycan Databases and Resources Reference

## Primary Databases

### GlyTouCan
- **URL**: https://glytoucan.org/
- **Content**: Unique accession numbers (GTC IDs) for glycan structures
- **Use**: Standardized glycan identification across databases
- **Format**: GlycoCT, WURCS, IUPAC

```python
import requests

def lookup_glytoucan(glytoucan_id: str) -> dict:
    """Fetch glycan details from GlyTouCan."""
    url = f"https://api.glytoucan.org/glycan/{glytoucan_id}"
    response = requests.get(url, headers={"Accept": "application/json"})
    return response.json() if response.ok else {}
```

### GlyConnect
- **URL**: https://glyconnect.expasy.org/
- **Content**: Protein glycosylation database with site-specific glycan profiles
- **Integration**: Links UniProt proteins to experimentally verified glycosylation
- **Use**: Look up known glycosylation for your target protein

```python
import requests

def get_glycoprotein_info(uniprot_id: str) -> dict:
    """Get glycosylation data for a protein from GlyConnect."""
    base_url = "https://glyconnect.expasy.org/api"
    response = requests.get(f"{base_url}/proteins/uniprot/{uniprot_id}")
    return response.json() if response.ok else {}

def get_glycan_compositions(glyconnect_protein_id: int) -> list:
    """Get all glycan compositions for a GlyConnect protein entry."""
    base_url = "https://glyconnect.expasy.org/api"
    response = requests.get(f"{base_url}/compositions/protein/{glyconnect_protein_id}")
    return response.json().get("data", []) if response.ok else []
```

### UniCarbKB
- **URL**: https://unicarbkb.org/
- **Content**: Curated glycan structures with biological context
- **Features**: Tissue/cell-type specific glycan data, mass spectrometry data

### KEGG Glycan
- **URL**: https://www.genome.jp/kegg/glycan/
- **Content**: Glycan structures in KEGG format, biosynthesis pathways
- **Integration**: Links to KEGG PATHWAY maps for glycan biosynthesis

### CAZy (Carbohydrate-Active Enzymes)
- **URL**: http://www.cazy.org/
- **Content**: Enzymes that build, break, and modify glycans
- **Use**: Identify enzymes for glycoengineering applications

## Prediction Servers

### NetNGlyc 1.0
- **URL**: https://services.healthtech.dtu.dk/services/NetNGlyc-1.0/
- **Method**: Neural network for N-glycosylation site prediction
- **Input**: Protein FASTA sequence
- **Output**: Per-asparagine probability score; threshold ~0.5

### NetOGlyc 4.0
- **URL**: https://services.healthtech.dtu.dk/services/NetOGlyc-4.0/
- **Method**: Neural network for O-GalNAc glycosylation prediction
- **Input**: Protein FASTA sequence
- **Output**: Per-serine/threonine probability; threshold ~0.5

### GlycoMine (Machine Learning)
- Machine learning predictor for N-, O- and C-glycosylation
- Multiple glycan types: N-GlcNAc, O-GalNAc, O-GlcNAc, O-Man, O-Fuc, O-Glc, C-Man

### SymLink (Glycosylation site & sequon predictor)
- Species-specific N-glycosylation prediction
- More specific than simple sequon scanning

## Mass Spectrometry Glycoproteomics Tools

### Byonic (Protein Metrics)
- De novo glycopeptide identification from MS2 spectra
- Comprehensive glycan database
- Site-specific glycoform assignment

### Mascot Glycan Analysis
- Glycan-specific search parameters
- Common for bottom-up glycoproteomics

### GlycoWorkbench
- **URL**: https://www.eurocarbdb.org/project/glycoworkbench
- Glycan structure drawing and mass calculation
- Annotation of MS/MS spectra with glycan fragment ions

### Skyline
- Targeted quantification of glycopeptides
- Integrates with glycan database

## Glycan Nomenclature Systems

### Oxford Notation (For N-glycans)
Codes complex N-glycans as text strings:
```
G0F   = Core-fucosylated, biantennary, no galactose
G1F   = Core-fucosylated, one galactose
G2F   = Core-fucosylated, two galactoses
G2FS1 = Core-fucosylated, two galactoses, one sialic acid
G2FS2 = Core-fucosylated, two galactoses, two sialic acids
M5    = High mannose 5 (Man5GlcNAc2)
M9    = High mannose 9 (Man9GlcNAc2)
```

### Symbol Nomenclature for Glycans (SNFG)
Standard colored symbols for publications:
- Blue circle = Glucose
- Green circle = Mannose
- Yellow circle = Galactose
- Blue square = N-Acetylglucosamine
- Yellow square = N-Acetylgalactosamine
- Purple diamond = N-Acetylneuraminic acid (sialic acid)
- Red triangle = Fucose

## Therapeutic Glycoproteins and Key Glycosylation Sites

| Therapeutic | Target | Key Glycosylation | Function |
|-------------|--------|------------------|---------|
| IgG1 antibody | Various | N297 (Fc) | ADCC/CDC effector function |
| Erythropoietin | EPOR | N24, N38, N83, O-glycans | Pharmacokinetics |
| Etanercept | TNF | N420 (IgG1 Fc) | Half-life |
| tPA (alteplase) | Fibrin | N117, N184, N448 | Fibrin binding |
| Factor VIII | VWF | 25 N-glycosites | Clearance |

## Batch Analysis Example

```python
from glycoengineering_tools import find_n_glycosylation_sequons, predict_o_glycosylation_hotspots
import pandas as pd

def analyze_glycosylation_landscape(sequences_dict: dict) -> pd.DataFrame:
    """
    Batch analysis of glycosylation for multiple proteins.

    Args:
        sequences_dict: {protein_name: sequence}

    Returns:
        DataFrame with glycosylation summary per protein
    """
    results = []
    for name, seq in sequences_dict.items():
        n_sites = find_n_glycosylation_sequons(seq)
        o_sites = predict_o_glycosylation_hotspots(seq)

        results.append({
            'protein': name,
            'length': len(seq),
            'n_glycosites': len(n_sites),
            'o_glyco_hotspots': len(o_sites),
            'n_glyco_density': len(n_sites) / len(seq) * 100,
            'n_glyco_positions': [s['position'] for s in n_sites]
        })

    return pd.DataFrame(results)
```
