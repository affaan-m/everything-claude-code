# BioServices: Identifier Mapping Guide

This document provides comprehensive information about converting identifiers between different biological databases using BioServices.

## Table of Contents

1. [Overview](#overview)
2. [UniProt Mapping Service](#uniprot-mapping-service)
3. [UniChem Compound Mapping](#unichem-compound-mapping)
4. [KEGG Identifier Conversions](#kegg-identifier-conversions)
5. [Common Mapping Patterns](#common-mapping-patterns)
6. [Troubleshooting](#troubleshooting)

---

## Overview

Biological databases use different identifier systems. Cross-referencing requires mapping between these systems. BioServices provides multiple approaches:

1. **UniProt Mapping**: Comprehensive protein/gene ID conversion
2. **UniChem**: Chemical compound ID mapping
3. **KEGG**: Built-in cross-references in entries
4. **PICR**: Protein identifier cross-reference service

---

## UniProt Mapping Service

The UniProt mapping service is the most comprehensive tool for protein and gene identifier conversion.

### Basic Usage

```python
from bioservices import UniProt

u = UniProt()

# Map single ID
result = u.mapping(
    fr="UniProtKB_AC-ID",    # Source database
    to="KEGG",                # Target database
    query="P43403"            # Identifier to convert
)

print(result)
# Output: {'P43403': ['hsa:7535']}
```

### Batch Mapping

```python
# Map multiple IDs (comma-separated)
ids = ["P43403", "P04637", "P53779"]
result = u.mapping(
    fr="UniProtKB_AC-ID",
    to="KEGG",
    query=",".join(ids)
)

for uniprot_id, kegg_ids in result.items():
    print(f"{uniprot_id} → {kegg_ids}")
```

### Supported Database Pairs

UniProt supports mapping between 100+ database pairs. Key ones include:

#### Protein/Gene Databases

| Source Format | Code | Target Format | Code |
|---------------|------|---------------|------|
| UniProtKB AC/ID | `UniProtKB_AC-ID` | KEGG | `KEGG` |
| UniProtKB AC/ID | `UniProtKB_AC-ID` | Ensembl | `Ensembl` |
| UniProtKB AC/ID | `UniProtKB_AC-ID` | Ensembl Protein | `Ensembl_Protein` |
| UniProtKB AC/ID | `UniProtKB_AC-ID` | Ensembl Transcript | `Ensembl_Transcript` |
| UniProtKB AC/ID | `UniProtKB_AC-ID` | RefSeq Protein | `RefSeq_Protein` |
| UniProtKB AC/ID | `UniProtKB_AC-ID` | RefSeq Nucleotide | `RefSeq_Nucleotide` |
| UniProtKB AC/ID | `UniProtKB_AC-ID` | GeneID (Entrez) | `GeneID` |
| UniProtKB AC/ID | `UniProtKB_AC-ID` | HGNC | `HGNC` |
| UniProtKB AC/ID | `UniProtKB_AC-ID` | MGI | `MGI` |
| KEGG | `KEGG` | UniProtKB | `UniProtKB` |
| Ensembl | `Ensembl` | UniProtKB | `UniProtKB` |
| GeneID | `GeneID` | UniProtKB | `UniProtKB` |

#### Structural Databases

| Source | Code | Target | Code |
|--------|------|--------|------|
| UniProtKB AC/ID | `UniProtKB_AC-ID` | PDB | `PDB` |
| UniProtKB AC/ID | `UniProtKB_AC-ID` | Pfam | `Pfam` |
| UniProtKB AC/ID | `UniProtKB_AC-ID` | InterPro | `InterPro` |
| PDB | `PDB` | UniProtKB | `UniProtKB` |

#### Expression & Proteomics

| Source | Code | Target | Code |
|--------|------|--------|------|
| UniProtKB AC/ID | `UniProtKB_AC-ID` | PRIDE | `PRIDE` |
| UniProtKB AC/ID | `UniProtKB_AC-ID` | ProteomicsDB | `ProteomicsDB` |
| UniProtKB AC/ID | `UniProtKB_AC-ID` | PaxDb | `PaxDb` |

#### Organism-Specific

| Source | Code | Target | Code |
|--------|------|--------|------|
| UniProtKB AC/ID | `UniProtKB_AC-ID` | FlyBase | `FlyBase` |
| UniProtKB AC/ID | `UniProtKB_AC-ID` | WormBase | `WormBase` |
| UniProtKB AC/ID | `UniProtKB_AC-ID` | SGD | `SGD` |
| UniProtKB AC/ID | `UniProtKB_AC-ID` | ZFIN | `ZFIN` |

#### Other Useful Mappings

| Source | Code | Target | Code |
|--------|------|--------|------|
| UniProtKB AC/ID | `UniProtKB_AC-ID` | GO | `GO` |
| UniProtKB AC/ID | `UniProtKB_AC-ID` | Reactome | `Reactome` |
| UniProtKB AC/ID | `UniProtKB_AC-ID` | STRING | `STRING` |
| UniProtKB AC/ID | `UniProtKB_AC-ID` | BioGRID | `BioGRID` |
| UniProtKB AC/ID | `UniProtKB_AC-ID` | OMA | `OMA` |

### Complete List of Database Codes

To get the complete, up-to-date list:

```python
from bioservices import UniProt

u = UniProt()

# This information is in the UniProt REST API documentation
# Common patterns:
# - Source databases typically end in source database name
# - UniProtKB uses "UniProtKB_AC-ID" or "UniProtKB"
# - Most other databases use their standard abbreviation
```

### Common Database Codes Reference

**Gene/Protein Identifiers:**
- `UniProtKB_AC-ID`: UniProt accession/ID
- `UniProtKB`: UniProt accession
- `KEGG`: KEGG gene IDs (e.g., hsa:7535)
- `GeneID`: NCBI Gene (Entrez) IDs
- `Ensembl`: Ensembl gene IDs
- `Ensembl_Protein`: Ensembl protein IDs
- `Ensembl_Transcript`: Ensembl transcript IDs
- `RefSeq_Protein`: RefSeq protein IDs (NP_)
- `RefSeq_Nucleotide`: RefSeq nucleotide IDs (NM_)

**Gene Nomenclature:**
- `HGNC`: Human Gene Nomenclature Committee
- `MGI`: Mouse Genome Informatics
- `RGD`: Rat Genome Database
- `SGD`: Saccharomyces Genome Database
- `FlyBase`: Drosophila database
- `WormBase`: C. elegans database
- `ZFIN`: Zebrafish database

**Structure:**
- `PDB`: Protein Data Bank
- `Pfam`: Protein families
- `InterPro`: Protein domains
- `SUPFAM`: Superfamily
- `PROSITE`: Protein motifs

**Pathways & Networks:**
- `Reactome`: Reactome pathways
- `BioCyc`: BioCyc pathways
- `PathwayCommons`: Pathway Commons
- `STRING`: Protein-protein networks
- `BioGRID`: Interaction database

### Mapping Examples

#### UniProt → KEGG

```python
from bioservices import UniProt

u = UniProt()

# Single mapping
result = u.mapping(fr="UniProtKB_AC-ID", to="KEGG", query="P43403")
print(result)  # {'P43403': ['hsa:7535']}
```

#### KEGG → UniProt

```python
# Reverse mapping
result = u.mapping(fr="KEGG", to="UniProtKB", query="hsa:7535")
print(result)  # {'hsa:7535': ['P43403']}
```

#### UniProt → Ensembl

```python
# To Ensembl gene IDs
result = u.mapping(fr="UniProtKB_AC-ID", to="Ensembl", query="P43403")
print(result)  # {'P43403': ['ENSG00000115085']}

# To Ensembl protein IDs
result = u.mapping(fr="UniProtKB_AC-ID", to="Ensembl_Protein", query="P43403")
print(result)  # {'P43403': ['ENSP00000381359']}
```

#### UniProt → PDB

```python
# Find 3D structures
result = u.mapping(fr="UniProtKB_AC-ID", to="PDB", query="P04637")
print(result)  # {'P04637': ['1A1U', '1AIE', '1C26', ...]}
```

#### UniProt → RefSeq

```python
# Get RefSeq protein IDs
result = u.mapping(fr="UniProtKB_AC-ID", to="RefSeq_Protein", query="P43403")
print(result)  # {'P43403': ['NP_001070.2']}
```

#### Gene Name → UniProt (via search, then mapping)

```python
# First search for gene
search_result = u.search("gene:ZAP70 AND organism:9606", frmt="tab", columns="id")
lines = search_result.strip().split("\n")
if len(lines) > 1:
    uniprot_id = lines[1].split("\t")[0]

    # Then map to other databases
    kegg_id = u.mapping(fr="UniProtKB_AC-ID", to="KEGG", query=uniprot_id)
    print(kegg_id)
```

---

## UniChem Compound Mapping

UniChem specializes in mapping chemical compound identifiers across databases.

### Source Database IDs

| Source ID | Database |
|-----------|----------|
| 1 | ChEMBL |
| 2 | DrugBank |
| 3 | PDB |
| 4 | IUPHAR/BPS Guide to Pharmacology |
| 5 | PubChem |
| 6 | KEGG |
| 7 | ChEBI |
| 8 | NIH Clinical Collection |
| 14 | FDA/SRS |
| 22 | PubChem |

### Basic Usage

```python
from bioservices import UniChem

u = UniChem()

# Get ChEMBL ID from KEGG compound ID
chembl_id = u.get_compound_id_from_kegg("C11222")
print(chembl_id)  # CHEMBL278315
```

### All Compound IDs

```python
# Get all identifiers for a compound
# src_compound_id: compound ID, src_id: source database ID
all_ids = u.get_all_compound_ids("CHEMBL278315", src_id=1)  # 1 = ChEMBL

for mapping in all_ids:
    src_name = mapping['src_name']
    src_compound_id = mapping['src_compound_id']
    print(f"{src_name}: {src_compound_id}")
```

### Specific Database Conversion

```python
# Convert between specific databases
# from_src_id=6 (KEGG), to_src_id=1 (ChEMBL)
result = u.get_src_compound_ids("C11222", from_src_id=6, to_src_id=1)
print(result)
```

### Common Compound Mappings

#### KEGG → ChEMBL

```python
u = UniChem()
chembl_id = u.get_compound_id_from_kegg("C00031")  # D-Glucose
print(f"ChEMBL: {chembl_id}")
```

#### ChEMBL → PubChem

```python
result = u.get_src_compound_ids("CHEMBL278315", from_src_id=1, to_src_id=22)
if result:
    pubchem_id = result[0]['src_compound_id']
    print(f"PubChem: {pubchem_id}")
```

#### ChEBI → DrugBank

```python
result = u.get_src_compound_ids("5292", from_src_id=7, to_src_id=2)
if result:
    drugbank_id = result[0]['src_compound_id']
    print(f"DrugBank: {drugbank_id}")
```

---

## KEGG Identifier Conversions

KEGG entries contain cross-references that can be extracted by parsing.

### Extract Database Links from KEGG Entry

```python
from bioservices import KEGG

k = KEGG()

# Get compound entry
entry = k.get("cpd:C11222")

# Parse for specific database
chebi_id = None
uniprot_ids = []

for line in entry.split("\n"):
    if "ChEBI:" in line:
        # Extract ChEBI ID
        parts = line.split("ChEBI:")
        if len(parts) > 1:
            chebi_id = parts[1].strip().split()[0]

# For genes/proteins
gene_entry = k.get("hsa:7535")
for line in gene_entry.split("\n"):
    if line.startswith("            "):  # Database links section
        if "UniProt:" in line:
            parts = line.split("UniProt:")
            if len(parts) > 1:
                uniprot_id = parts[1].strip()
                uniprot_ids.append(uniprot_id)
```

### KEGG Gene ID Components

KEGG gene IDs have format `organism:gene_id`:

```python
kegg_id = "hsa:7535"
organism, gene_id = kegg_id.split(":")

print(f"Organism: {organism}")  # hsa (human)
print(f"Gene ID: {gene_id}")    # 7535
```

### KEGG Pathway to Genes

```python
k = KEGG()

# Get pathway entry
pathway = k.get("path:hsa04660")

# Parse for gene list
genes = []
in_gene_section = False

for line in pathway.split("\n"):
    if line.startswith("GENE"):
        in_gene_section = True

    if in_gene_section:
        if line.startswith(" " * 12):  # Gene line
            parts = line.strip().split()
            if parts:
                gene_id = parts[0]
                genes.append(f"hsa:{gene_id}")
        elif not line.startswith(" "):
            break

print(f"Found {len(genes)} genes")
```

---

## Common Mapping Patterns

### Pattern 1: Gene Symbol → Multiple Database IDs

```python
from bioservices import UniProt

def gene_symbol_to_ids(gene_symbol, organism="9606"):
    """Convert gene symbol to multiple database IDs."""
    u = UniProt()

    # Search for gene
    query = f"gene:{gene_symbol} AND organism:{organism}"
    result = u.search(query, frmt="tab", columns="id")

    lines = result.strip().split("\n")
    if len(lines) < 2:
        return None

    uniprot_id = lines[1].split("\t")[0]

    # Map to multiple databases
    ids = {
        'uniprot': uniprot_id,
        'kegg': u.mapping(fr="UniProtKB_AC-ID", to="KEGG", query=uniprot_id),
        'ensembl': u.mapping(fr="UniProtKB_AC-ID", to="Ensembl", query=uniprot_id),
        'refseq': u.mapping(fr="UniProtKB_AC-ID", to="RefSeq_Protein", query=uniprot_id),
        'pdb': u.mapping(fr="UniProtKB_AC-ID", to="PDB", query=uniprot_id)
    }

    return ids

# Usage
ids = gene_symbol_to_ids("ZAP70")
print(ids)
```

### Pattern 2: Compound Name → All Database IDs

```python
from bioservices import KEGG, UniChem, ChEBI

def compound_name_to_ids(compound_name):
    """Search compound and get all database IDs."""
    k = KEGG()

    # Search KEGG
    results = k.find("compound", compound_name)
    if not results:
        return None

    # Extract KEGG ID
    kegg_id = results.strip().split("\n")[0].split("\t")[0].replace("cpd:", "")

    # Get KEGG entry for ChEBI
    entry = k.get(f"cpd:{kegg_id}")
    chebi_id = None
    for line in entry.split("\n"):
        if "ChEBI:" in line:
            parts = line.split("ChEBI:")
            if len(parts) > 1:
                chebi_id = parts[1].strip().split()[0]
                break

    # Get ChEMBL from UniChem
    u = UniChem()
    try:
        chembl_id = u.get_compound_id_from_kegg(kegg_id)
    except:
        chembl_id = None

    return {
        'kegg': kegg_id,
        'chebi': chebi_id,
        'chembl': chembl_id
    }

# Usage
ids = compound_name_to_ids("Geldanamycin")
print(ids)
```

### Pattern 3: Batch ID Conversion with Error Handling

```python
from bioservices import UniProt

def safe_batch_mapping(ids, from_db, to_db, chunk_size=100):
    """Safely map IDs with error handling and chunking."""
    u = UniProt()
    all_results = {}

    for i in range(0, len(ids), chunk_size):
        chunk = ids[i:i+chunk_size]
        query = ",".join(chunk)

        try:
            results = u.mapping(fr=from_db, to=to_db, query=query)
            all_results.update(results)
            print(f"✓ Processed {min(i+chunk_size, len(ids))}/{len(ids)}")

        except Exception as e:
            print(f"✗ Error at chunk {i}: {e}")

            # Try individual IDs in failed chunk
            for single_id in chunk:
                try:
                    result = u.mapping(fr=from_db, to=to_db, query=single_id)
                    all_results.update(result)
                except:
                    all_results[single_id] = None

    return all_results

# Usage
uniprot_ids = ["P43403", "P04637", "P53779", "INVALID123"]
mapping = safe_batch_mapping(uniprot_ids, "UniProtKB_AC-ID", "KEGG")
```

### Pattern 4: Multi-Hop Mapping

Sometimes you need to map through intermediate databases:

```python
from bioservices import UniProt

def multi_hop_mapping(gene_symbol, organism="9606"):
    """Gene symbol → UniProt → KEGG → Pathways."""
    u = UniProt()
    k = KEGG()

    # Step 1: Gene symbol → UniProt
    query = f"gene:{gene_symbol} AND organism:{organism}"
    result = u.search(query, frmt="tab", columns="id")

    lines = result.strip().split("\n")
    if len(lines) < 2:
        return None

    uniprot_id = lines[1].split("\t")[0]

    # Step 2: UniProt → KEGG
    kegg_mapping = u.mapping(fr="UniProtKB_AC-ID", to="KEGG", query=uniprot_id)
    if not kegg_mapping or uniprot_id not in kegg_mapping:
        return None

    kegg_id = kegg_mapping[uniprot_id][0]

    # Step 3: KEGG → Pathways
    organism_code, gene_id = kegg_id.split(":")
    pathways = k.get_pathway_by_gene(gene_id, organism_code)

    return {
        'gene': gene_symbol,
        'uniprot': uniprot_id,
        'kegg': kegg_id,
        'pathways': pathways
    }

# Usage
result = multi_hop_mapping("TP53")
print(result)
```

---

## Troubleshooting

### Issue 1: No Mapping Found

**Symptom:** Mapping returns empty or None

**Solutions:**
1. Verify source ID exists in source database
2. Check database code spelling
3. Try reverse mapping
4. Some IDs may not have mappings in all databases

```python
result = u.mapping(fr="UniProtKB_AC-ID", to="KEGG", query="P43403")

if not result or 'P43403' not in result:
    print("No mapping found. Try:")
    print("1. Verify ID exists: u.search('P43403')")
    print("2. Check if protein has KEGG annotation")
```

### Issue 2: Too Many IDs in Batch

**Symptom:** Batch mapping fails or times out

**Solution:** Split into smaller chunks

```python
def chunked_mapping(ids, from_db, to_db, chunk_size=50):
    all_results = {}

    for i in range(0, len(ids), chunk_size):
        chunk = ids[i:i+chunk_size]
        result = u.mapping(fr=from_db, to=to_db, query=",".join(chunk))
        all_results.update(result)

    return all_results
```

### Issue 3: Multiple Target IDs

**Symptom:** One source ID maps to multiple target IDs

**Solution:** Handle as list

```python
result = u.mapping(fr="UniProtKB_AC-ID", to="PDB", query="P04637")
# Result: {'P04637': ['1A1U', '1AIE', '1C26', ...]}

pdb_ids = result['P04637']
print(f"Found {len(pdb_ids)} PDB structures")

for pdb_id in pdb_ids:
    print(f"  {pdb_id}")
```

### Issue 4: Organism Ambiguity

**Symptom:** Gene symbol maps to multiple organisms

**Solution:** Always specify organism in searches

```python
# Bad: Ambiguous
result = u.search("gene:TP53")  # Many organisms have TP53

# Good: Specific
result = u.search("gene:TP53 AND organism:9606")  # Human only
```

### Issue 5: Deprecated IDs

**Symptom:** Old database IDs don't map

**Solution:** Update to current IDs first

```python
# Check if ID is current
entry = u.retrieve("P43403", frmt="txt")

# Look for secondary accessions
for line in entry.split("\n"):
    if line.startswith("AC"):
        print(line)  # Shows primary and secondary accessions
```

---

## Best Practices

1. **Always validate inputs** before batch processing
2. **Handle None/empty results** gracefully
3. **Use chunking** for large ID lists (50-100 per chunk)
4. **Cache results** for repeated queries
5. **Specify organism** when possible to avoid ambiguity
6. **Log failures** in batch processing for later retry
7. **Add delays** between large batches to respect API limits

```python
import time

def polite_batch_mapping(ids, from_db, to_db):
    """Batch mapping with rate limiting."""
    results = {}

    for i in range(0, len(ids), 50):
        chunk = ids[i:i+50]
        result = u.mapping(fr=from_db, to=to_db, query=",".join(chunk))
        results.update(result)

        time.sleep(0.5)  # Be nice to the API

    return results
```

---

For complete working examples, see:
- `scripts/batch_id_converter.py`: Command-line batch conversion tool
- `workflow_patterns.md`: Integration into larger workflows
