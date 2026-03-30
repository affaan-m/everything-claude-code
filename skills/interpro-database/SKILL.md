---
name: interpro-database
description: Query InterPro for protein family, domain, and functional site annotations. Integrates Pfam, PANTHER, PRINTS, SMART, SUPERFAMILY, and 11 other member databases. Use for protein function prediction, domain architecture analysis, evolutionary classification, and GO term mapping.
license: CC0-1.0
metadata:
    skill-author: Kuan-lin Huang
---

# InterPro Database

## Overview

InterPro (https://www.ebi.ac.uk/interpro/) is a comprehensive resource for protein family and domain classification maintained by EMBL-EBI. It integrates signatures from 13 member databases including Pfam, PANTHER, PRINTS, ProSite, SMART, TIGRFAM, SUPERFAMILY, CDD, and others, providing a unified view of protein functional annotations for over 100 million protein sequences.

InterPro classifies proteins into:
- **Families**: Groups of proteins sharing common ancestry and function
- **Domains**: Independently folding structural/functional units
- **Homologous superfamilies**: Structurally similar protein regions
- **Repeats**: Short tandem sequences
- **Sites**: Functional sites (active, binding, PTM)

**Key resources:**
- InterPro website: https://www.ebi.ac.uk/interpro/
- REST API: https://www.ebi.ac.uk/interpro/api/
- API documentation: https://github.com/ProteinsWebTeam/interpro7-api/blob/master/docs/
- Python client: via `requests`

## When to Use This Skill

Use InterPro when:

- **Protein function prediction**: What function(s) does an uncharacterized protein likely have?
- **Domain architecture**: What domains make up a protein, and in what order?
- **Protein family classification**: Which family/superfamily does a protein belong to?
- **GO term annotation**: Map protein sequences to Gene Ontology terms via InterPro
- **Evolutionary analysis**: Are two proteins in the same homologous superfamily?
- **Structure prediction context**: What domains should a new protein structure be compared against?
- **Pipeline annotation**: Batch-annotate proteomes or novel sequences

## Core Capabilities

### 1. InterPro REST API

Base URL: `https://www.ebi.ac.uk/interpro/api/`

```python
import requests

BASE_URL = "https://www.ebi.ac.uk/interpro/api"

def interpro_get(endpoint, params=None):
    url = f"{BASE_URL}/{endpoint}"
    headers = {"Accept": "application/json"}
    response = requests.get(url, params=params, headers=headers)
    response.raise_for_status()
    return response.json()
```

### 2. Look Up a Protein

```python
def get_protein_entries(uniprot_id):
    """Get all InterPro entries that match a UniProt protein."""
    data = interpro_get(f"protein/UniProt/{uniprot_id}/entry/InterPro/")
    return data

# Example: Human p53 (TP53)
result = get_protein_entries("P04637")
entries = result.get("results", [])

for entry in entries:
    meta = entry["metadata"]
    print(f"  {meta['accession']} ({meta['type']}): {meta['name']}")
    # e.g., IPR011615 (domain): p53, tetramerisation domain
    #       IPR010991 (domain): p53, DNA-binding domain
    #       IPR013872 (family): p53 family
```

### 3. Get Specific InterPro Entry

```python
def get_entry(interpro_id):
    """Fetch details for an InterPro entry."""
    return interpro_get(f"entry/InterPro/{interpro_id}/")

# Example: Get Pfam domain PF00397 (WW domain)
ww_entry = get_entry("IPR001202")
print(f"Name: {ww_entry['metadata']['name']}")
print(f"Type: {ww_entry['metadata']['type']}")

# Also supports member database IDs:
def get_pfam_entry(pfam_id):
    return interpro_get(f"entry/Pfam/{pfam_id}/")

pfam = get_pfam_entry("PF00397")
```

### 4. Search Proteins by InterPro Entry

```python
def get_proteins_for_entry(interpro_id, database="UniProt", page_size=25):
    """Get all proteins annotated with an InterPro entry."""
    params = {"page_size": page_size}
    data = interpro_get(f"entry/InterPro/{interpro_id}/protein/{database}/", params)
    return data

# Example: Find all human kinase-domain proteins
kinase_proteins = get_proteins_for_entry("IPR000719")  # Protein kinase domain
print(f"Total proteins: {kinase_proteins['count']}")
```

### 5. Domain Architecture

```python
def get_domain_architecture(uniprot_id):
    """Get the complete domain architecture of a protein."""
    data = interpro_get(f"protein/UniProt/{uniprot_id}/")
    return data

# Example: Get full domain architecture for EGFR
egfr = get_domain_architecture("P00533")

# The response includes locations of all matching entries on the sequence
for entry in egfr.get("entries", []):
    for fragment in entry.get("entry_protein_locations", []):
        for loc in fragment.get("fragments", []):
            print(f"  {entry['accession']}: {loc['start']}-{loc['end']}")
```

### 6. GO Term Mapping

```python
def get_go_terms_for_protein(uniprot_id):
    """Get GO terms associated with a protein via InterPro."""
    data = interpro_get(f"protein/UniProt/{uniprot_id}/")

    # GO terms are embedded in the entry metadata
    go_terms = []
    for entry in data.get("entries", []):
        go = entry.get("metadata", {}).get("go_terms", [])
        go_terms.extend(go)

    # Deduplicate
    seen = set()
    unique_go = []
    for term in go_terms:
        if term["identifier"] not in seen:
            seen.add(term["identifier"])
            unique_go.append(term)

    return unique_go

# GO terms include:
# {"identifier": "GO:0004672", "name": "protein kinase activity", "category": {"code": "F", "name": "Molecular Function"}}
```

### 7. Batch Protein Lookup

```python
def batch_lookup_proteins(uniprot_ids, database="UniProt"):
    """Look up multiple proteins and collect their InterPro entries."""
    import time
    results = {}
    for uid in uniprot_ids:
        try:
            data = interpro_get(f"protein/{database}/{uid}/entry/InterPro/")
            entries = data.get("results", [])
            results[uid] = [
                {
                    "accession": e["metadata"]["accession"],
                    "name": e["metadata"]["name"],
                    "type": e["metadata"]["type"]
                }
                for e in entries
            ]
        except Exception as e:
            results[uid] = {"error": str(e)}
        time.sleep(0.3)  # Rate limiting
    return results

# Example
proteins = ["P04637", "P00533", "P38398", "Q9Y6I9"]
domain_info = batch_lookup_proteins(proteins)
for uid, entries in domain_info.items():
    print(f"\n{uid}:")
    for e in entries[:3]:
        print(f"  - {e['accession']} ({e['type']}): {e['name']}")
```

### 8. Search by Text or Taxonomy

```python
def search_entries(query, entry_type=None, taxonomy_id=None):
    """Search InterPro entries by text."""
    params = {"search": query, "page_size": 20}
    if entry_type:
        params["type"] = entry_type  # family, domain, homologous_superfamily, etc.

    endpoint = "entry/InterPro/"
    if taxonomy_id:
        endpoint = f"entry/InterPro/taxonomy/UniProt/{taxonomy_id}/"

    return interpro_get(endpoint, params)

# Search for kinase-related entries
kinase_entries = search_entries("kinase", entry_type="domain")
```

## Query Workflows

### Workflow 1: Characterize an Unknown Protein

1. **Run InterProScan** locally or via the web (https://www.ebi.ac.uk/interpro/search/sequence/) to scan a protein sequence
2. **Parse results** to identify domain architecture
3. **Look up each InterPro entry** for biological context
4. **Get GO terms** from associated InterPro entries for functional inference

```python
# After running InterProScan and getting a UniProt ID:
def characterize_protein(uniprot_id):
    """Complete characterization workflow."""

    # 1. Get all annotations
    entries = get_protein_entries(uniprot_id)

    # 2. Group by type
    by_type = {}
    for e in entries.get("results", []):
        t = e["metadata"]["type"]
        by_type.setdefault(t, []).append({
            "accession": e["metadata"]["accession"],
            "name": e["metadata"]["name"]
        })

    # 3. Get GO terms
    go_terms = get_go_terms_for_protein(uniprot_id)

    return {
        "families": by_type.get("family", []),
        "domains": by_type.get("domain", []),
        "superfamilies": by_type.get("homologous_superfamily", []),
        "go_terms": go_terms
    }
```

### Workflow 2: Find All Members of a Protein Family

1. Identify the InterPro family entry ID (e.g., IPR000719 for protein kinases)
2. Query all UniProt proteins annotated with that entry
3. Filter by organism/taxonomy if needed
4. Download FASTA sequences for phylogenetic analysis

### Workflow 3: Comparative Domain Analysis

1. Collect proteins of interest (e.g., all paralogs)
2. Get domain architecture for each protein
3. Compare domain compositions and orders
4. Identify domain gain/loss events

## API Endpoint Summary

| Endpoint | Description |
|----------|-------------|
| `/protein/UniProt/{id}/` | Full annotation for a protein |
| `/protein/UniProt/{id}/entry/InterPro/` | InterPro entries for a protein |
| `/entry/InterPro/{id}/` | Details of an InterPro entry |
| `/entry/Pfam/{id}/` | Pfam entry details |
| `/entry/InterPro/{id}/protein/UniProt/` | Proteins with an entry |
| `/entry/InterPro/` | Search/list InterPro entries |
| `/taxonomy/UniProt/{tax_id}/` | Proteins from a taxon |
| `/structure/PDB/{pdb_id}/` | Structures mapped to InterPro |

## Member Databases

| Database | Focus |
|----------|-------|
| Pfam | Protein domains (HMM profiles) |
| PANTHER | Protein families and subfamilies |
| PRINTS | Protein fingerprints |
| ProSitePatterns | Amino acid patterns |
| ProSiteProfiles | Protein profile patterns |
| SMART | Protein domain analysis |
| TIGRFAM | JCVI curated protein families |
| SUPERFAMILY | Structural classification |
| CDD | Conserved Domain Database (NCBI) |
| HAMAP | Microbial protein families |
| NCBIfam | NCBI curated TIGRFAMs |
| Gene3D | CATH structural classification |
| PIRSR | PIR site rules |

## Best Practices

- **Use UniProt accession numbers** (not gene names) for the most reliable lookups
- **Distinguish types**: `family` gives broad classification; `domain` gives specific structural/functional units
- **InterProScan is faster for novel sequences**: For sequences not in UniProt, submit to the web service
- **Handle pagination**: Large result sets require iterating through pages
- **Combine with UniProt data**: InterPro entries often include links to UniProt, PDB, and GO

## Additional Resources

- **InterPro website**: https://www.ebi.ac.uk/interpro/
- **InterProScan** (run locally): https://github.com/ebi-pf-team/interproscan
- **API documentation**: https://github.com/ProteinsWebTeam/interpro7-api/blob/master/docs/
- **Pfam**: https://www.ebi.ac.uk/interpro/entry/pfam/
- **Citation**: Paysan-Lafosse T et al. (2023) Nucleic Acids Research. PMID: 36350672
