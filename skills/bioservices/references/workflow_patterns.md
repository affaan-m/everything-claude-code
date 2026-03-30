# BioServices: Common Workflow Patterns

This document describes detailed multi-step workflows for common bioinformatics tasks using BioServices.

## Table of Contents

1. [Complete Protein Analysis Pipeline](#complete-protein-analysis-pipeline)
2. [Pathway Discovery and Network Analysis](#pathway-discovery-and-network-analysis)
3. [Compound Multi-Database Search](#compound-multi-database-search)
4. [Batch Identifier Conversion](#batch-identifier-conversion)
5. [Gene Functional Annotation](#gene-functional-annotation)
6. [Protein Interaction Network Construction](#protein-interaction-network-construction)
7. [Multi-Organism Comparative Analysis](#multi-organism-comparative-analysis)

---

## Complete Protein Analysis Pipeline

**Goal:** Given a protein name, retrieve sequence, find homologs, identify pathways, and discover interactions.

**Example:** Analyzing human ZAP70 protein

### Step 1: UniProt Search and Identifier Retrieval

```python
from bioservices import UniProt

u = UniProt(verbose=False)

# Search for protein by name
query = "ZAP70_HUMAN"
results = u.search(query, frmt="tab", columns="id,genes,organism,length")

# Parse results
lines = results.strip().split("\n")
if len(lines) > 1:
    header = lines[0]
    data = lines[1].split("\t")
    uniprot_id = data[0]  # e.g., P43403
    gene_names = data[1]   # e.g., ZAP70

print(f"UniProt ID: {uniprot_id}")
print(f"Gene names: {gene_names}")
```

**Output:**
- UniProt accession: P43403
- Gene name: ZAP70

### Step 2: Sequence Retrieval

```python
# Retrieve FASTA sequence
sequence = u.retrieve(uniprot_id, frmt="fasta")
print(sequence)

# Extract just the sequence string (remove header)
seq_lines = sequence.split("\n")
sequence_only = "".join(seq_lines[1:])  # Skip FASTA header
```

**Output:** Complete protein sequence in FASTA format

### Step 3: BLAST Similarity Search

```python
from bioservices import NCBIblast
import time

s = NCBIblast(verbose=False)

# Submit BLAST job
jobid = s.run(
    program="blastp",
    sequence=sequence_only,
    stype="protein",
    database="uniprotkb",
    email="your.email@example.com"
)

print(f"BLAST Job ID: {jobid}")

# Wait for completion
while True:
    status = s.getStatus(jobid)
    print(f"Status: {status}")
    if status == "FINISHED":
        break
    elif status == "ERROR":
        print("BLAST job failed")
        break
    time.sleep(5)

# Retrieve results
if status == "FINISHED":
    blast_results = s.getResult(jobid, "out")
    print(blast_results[:500])  # Print first 500 characters
```

**Output:** BLAST alignment results showing similar proteins

### Step 4: KEGG Pathway Discovery

```python
from bioservices import KEGG

k = KEGG()

# Get KEGG gene ID from UniProt mapping
kegg_mapping = u.mapping(fr="UniProtKB_AC-ID", to="KEGG", query=uniprot_id)
print(f"KEGG mapping: {kegg_mapping}")

# Extract KEGG gene ID (e.g., hsa:7535)
if kegg_mapping:
    kegg_gene_id = kegg_mapping[uniprot_id][0] if uniprot_id in kegg_mapping else None

    if kegg_gene_id:
        # Find pathways containing this gene
        organism = kegg_gene_id.split(":")[0]  # e.g., "hsa"
        gene_id = kegg_gene_id.split(":")[1]   # e.g., "7535"

        pathways = k.get_pathway_by_gene(gene_id, organism)
        print(f"Found {len(pathways)} pathways:")

        # Get pathway names
        for pathway_id in pathways:
            pathway_info = k.get(pathway_id)
            # Parse NAME line
            for line in pathway_info.split("\n"):
                if line.startswith("NAME"):
                    pathway_name = line.replace("NAME", "").strip()
                    print(f"  {pathway_id}: {pathway_name}")
                    break
```

**Output:**
- path:hsa04064 - NF-kappa B signaling pathway
- path:hsa04650 - Natural killer cell mediated cytotoxicity
- path:hsa04660 - T cell receptor signaling pathway
- path:hsa04662 - B cell receptor signaling pathway

### Step 5: Protein-Protein Interactions

```python
from bioservices import PSICQUIC

p = PSICQUIC()

# Query MINT database for human (taxid:9606) interactions
query = f"ZAP70 AND species:9606"
interactions = p.query("mint", query)

# Parse PSI-MI TAB format results
if interactions:
    interaction_lines = interactions.strip().split("\n")
    print(f"Found {len(interaction_lines)} interactions")

    # Print first few interactions
    for line in interaction_lines[:5]:
        fields = line.split("\t")
        protein_a = fields[0]
        protein_b = fields[1]
        interaction_type = fields[11]
        print(f"  {protein_a} - {protein_b}: {interaction_type}")
```

**Output:** List of proteins that interact with ZAP70

### Step 6: Gene Ontology Annotation

```python
from bioservices import QuickGO

g = QuickGO()

# Get GO annotations for protein
annotations = g.Annotation(protein=uniprot_id, format="tsv")

if annotations:
    # Parse TSV results
    lines = annotations.strip().split("\n")
    print(f"Found {len(lines)-1} GO annotations")

    # Display first few annotations
    for line in lines[1:6]:  # Skip header
        fields = line.split("\t")
        go_id = fields[6]
        go_term = fields[7]
        go_aspect = fields[8]
        print(f"  {go_id}: {go_term} [{go_aspect}]")
```

**Output:** GO terms annotating ZAP70 function, process, and location

### Complete Pipeline Summary

**Inputs:** Protein name (e.g., "ZAP70_HUMAN")

**Outputs:**
1. UniProt accession and gene name
2. Protein sequence (FASTA)
3. Similar proteins (BLAST results)
4. Biological pathways (KEGG)
5. Interaction partners (PSICQUIC)
6. Functional annotations (GO terms)

**Script:** `scripts/protein_analysis_workflow.py` automates this entire pipeline.

---

## Pathway Discovery and Network Analysis

**Goal:** Analyze all pathways for an organism and extract protein interaction networks.

**Example:** Human (hsa) pathway analysis

### Step 1: Get All Pathways for Organism

```python
from bioservices import KEGG

k = KEGG()
k.organism = "hsa"

# Get all pathway IDs
pathway_ids = k.pathwayIds
print(f"Found {len(pathway_ids)} pathways for {k.organism}")

# Display first few
for pid in pathway_ids[:10]:
    print(f"  {pid}")
```

**Output:** List of ~300 human pathways

### Step 2: Parse Pathway for Interactions

```python
# Analyze specific pathway
pathway_id = "hsa04660"  # T cell receptor signaling

# Get KGML data
kgml_data = k.parse_kgml_pathway(pathway_id)

# Extract entries (genes/proteins)
entries = kgml_data['entries']
print(f"Pathway contains {len(entries)} entries")

# Extract relations (interactions)
relations = kgml_data['relations']
print(f"Found {len(relations)} relations")

# Analyze relation types
relation_types = {}
for rel in relations:
    rel_type = rel.get('name', 'unknown')
    relation_types[rel_type] = relation_types.get(rel_type, 0) + 1

print("\nRelation type distribution:")
for rel_type, count in sorted(relation_types.items()):
    print(f"  {rel_type}: {count}")
```

**Output:**
- Entry count (genes/proteins in pathway)
- Relation count (interactions)
- Distribution of interaction types (activation, inhibition, binding, etc.)

### Step 3: Extract Protein-Protein Interactions

```python
# Filter for specific interaction types
pprel_interactions = [
    rel for rel in relations
    if rel.get('link') == 'PPrel'  # Protein-protein relation
]

print(f"Found {len(pprel_interactions)} protein-protein interactions")

# Extract interaction details
for rel in pprel_interactions[:10]:
    entry1 = rel['entry1']
    entry2 = rel['entry2']
    interaction_type = rel.get('name', 'unknown')

    print(f"  {entry1} -> {entry2}: {interaction_type}")
```

**Output:** Directed protein-protein interactions with types

### Step 4: Convert to Network Format (SIF)

```python
# Get Simple Interaction Format (filters for key interactions)
sif_data = k.pathway2sif(pathway_id)

# SIF format: source, interaction_type, target
print("\nSimple Interaction Format:")
for interaction in sif_data[:10]:
    print(f"  {interaction}")
```

**Output:** Network edges suitable for Cytoscape or NetworkX

### Step 5: Batch Analysis of All Pathways

```python
import pandas as pd

# Analyze all pathways (this takes time!)
all_results = []

for pathway_id in pathway_ids[:50]:  # Limit for example
    try:
        kgml = k.parse_kgml_pathway(pathway_id)

        result = {
            'pathway_id': pathway_id,
            'num_entries': len(kgml.get('entries', [])),
            'num_relations': len(kgml.get('relations', []))
        }

        all_results.append(result)

    except Exception as e:
        print(f"Error parsing {pathway_id}: {e}")

# Create DataFrame
df = pd.DataFrame(all_results)
print(df.describe())

# Find largest pathways
print("\nLargest pathways:")
print(df.nlargest(10, 'num_entries')[['pathway_id', 'num_entries', 'num_relations']])
```

**Output:** Statistical summary of pathway sizes and interaction densities

**Script:** `scripts/pathway_analysis.py` implements this workflow with export options.

---

## Compound Multi-Database Search

**Goal:** Search for compound by name and retrieve identifiers across KEGG, ChEBI, and ChEMBL.

**Example:** Geldanamycin (antibiotic)

### Step 1: Search KEGG Compound Database

```python
from bioservices import KEGG

k = KEGG()

# Search by compound name
compound_name = "Geldanamycin"
results = k.find("compound", compound_name)

print(f"KEGG search results for '{compound_name}':")
print(results)

# Extract compound ID
if results:
    lines = results.strip().split("\n")
    if lines:
        kegg_id = lines[0].split("\t")[0]  # e.g., cpd:C11222
        kegg_id_clean = kegg_id.replace("cpd:", "")  # C11222
        print(f"\nKEGG Compound ID: {kegg_id_clean}")
```

**Output:** KEGG ID (e.g., C11222)

### Step 2: Get KEGG Entry with Database Links

```python
# Retrieve compound entry
compound_entry = k.get(kegg_id)

# Parse entry for database links
chebi_id = None
for line in compound_entry.split("\n"):
    if "ChEBI:" in line:
        # Extract ChEBI ID
        parts = line.split("ChEBI:")
        if len(parts) > 1:
            chebi_id = parts[1].strip().split()[0]
            print(f"ChEBI ID: {chebi_id}")
            break

# Display entry snippet
print("\nKEGG Entry (first 500 chars):")
print(compound_entry[:500])
```

**Output:** ChEBI ID (e.g., 5292) and compound information

### Step 3: Cross-Reference to ChEMBL via UniChem

```python
from bioservices import UniChem

u = UniChem()

# Convert KEGG → ChEMBL
try:
    chembl_id = u.get_compound_id_from_kegg(kegg_id_clean)
    print(f"ChEMBL ID: {chembl_id}")
except Exception as e:
    print(f"UniChem lookup failed: {e}")
    chembl_id = None
```

**Output:** ChEMBL ID (e.g., CHEMBL278315)

### Step 4: Retrieve Detailed Information

```python
# Get ChEBI information
if chebi_id:
    from bioservices import ChEBI
    c = ChEBI()

    try:
        chebi_entity = c.getCompleteEntity(f"CHEBI:{chebi_id}")
        print(f"\nChEBI Formula: {chebi_entity.Formulae}")
        print(f"ChEBI Name: {chebi_entity.chebiAsciiName}")
    except Exception as e:
        print(f"ChEBI lookup failed: {e}")

# Get ChEMBL information
if chembl_id:
    from bioservices import ChEMBL
    chembl = ChEMBL()

    try:
        chembl_compound = chembl.get_compound_by_chemblId(chembl_id)
        print(f"\nChEMBL Molecular Weight: {chembl_compound['molecule_properties']['full_mwt']}")
        print(f"ChEMBL SMILES: {chembl_compound['molecule_structures']['canonical_smiles']}")
    except Exception as e:
        print(f"ChEMBL lookup failed: {e}")
```

**Output:** Chemical properties from multiple databases

### Complete Compound Workflow Summary

**Input:** Compound name (e.g., "Geldanamycin")

**Output:**
- KEGG ID: C11222
- ChEBI ID: 5292
- ChEMBL ID: CHEMBL278315
- Chemical formula
- Molecular weight
- SMILES structure

**Script:** `scripts/compound_cross_reference.py` automates this workflow.

---

## Batch Identifier Conversion

**Goal:** Convert multiple identifiers between databases efficiently.

### Batch UniProt → KEGG Mapping

```python
from bioservices import UniProt

u = UniProt()

# List of UniProt IDs
uniprot_ids = ["P43403", "P04637", "P53779", "Q9Y6K9"]

# Batch mapping (comma-separated)
query_string = ",".join(uniprot_ids)
results = u.mapping(fr="UniProtKB_AC-ID", to="KEGG", query=query_string)

print("UniProt → KEGG mapping:")
for uniprot_id, kegg_ids in results.items():
    print(f"  {uniprot_id} → {kegg_ids}")
```

**Output:** Dictionary mapping each UniProt ID to KEGG gene IDs

### Batch File Processing

```python
import csv

# Read identifiers from file
def read_ids_from_file(filename):
    with open(filename, 'r') as f:
        ids = [line.strip() for line in f if line.strip()]
    return ids

# Process in chunks (API limits)
def batch_convert(ids, from_db, to_db, chunk_size=100):
    u = UniProt()
    all_results = {}

    for i in range(0, len(ids), chunk_size):
        chunk = ids[i:i+chunk_size]
        query = ",".join(chunk)

        try:
            results = u.mapping(fr=from_db, to=to_db, query=query)
            all_results.update(results)
            print(f"Processed {min(i+chunk_size, len(ids))}/{len(ids)}")
        except Exception as e:
            print(f"Error processing chunk {i}: {e}")

    return all_results

# Write results to CSV
def write_mapping_to_csv(mapping, output_file):
    with open(output_file, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['Source_ID', 'Target_IDs'])

        for source_id, target_ids in mapping.items():
            target_str = ";".join(target_ids) if target_ids else "No mapping"
            writer.writerow([source_id, target_str])

# Example usage
input_ids = read_ids_from_file("uniprot_ids.txt")
mapping = batch_convert(input_ids, "UniProtKB_AC-ID", "KEGG", chunk_size=50)
write_mapping_to_csv(mapping, "uniprot_to_kegg_mapping.csv")
```

**Script:** `scripts/batch_id_converter.py` provides command-line batch conversion.

---

## Gene Functional Annotation

**Goal:** Retrieve comprehensive functional information for a gene.

### Workflow

```python
from bioservices import UniProt, KEGG, QuickGO

# Gene of interest
gene_symbol = "TP53"

# 1. Find UniProt entry
u = UniProt()
search_results = u.search(f"gene:{gene_symbol} AND organism:9606",
                          frmt="tab",
                          columns="id,genes,protein names")

# Extract UniProt ID
lines = search_results.strip().split("\n")
if len(lines) > 1:
    uniprot_id = lines[1].split("\t")[0]
    protein_name = lines[1].split("\t")[2]
    print(f"Protein: {protein_name}")
    print(f"UniProt ID: {uniprot_id}")

# 2. Get KEGG pathways
kegg_mapping = u.mapping(fr="UniProtKB_AC-ID", to="KEGG", query=uniprot_id)
if uniprot_id in kegg_mapping:
    kegg_id = kegg_mapping[uniprot_id][0]

    k = KEGG()
    organism, gene_id = kegg_id.split(":")
    pathways = k.get_pathway_by_gene(gene_id, organism)

    print(f"\nPathways ({len(pathways)}):")
    for pathway_id in pathways[:5]:
        print(f"  {pathway_id}")

# 3. Get GO annotations
g = QuickGO()
go_annotations = g.Annotation(protein=uniprot_id, format="tsv")

if go_annotations:
    lines = go_annotations.strip().split("\n")
    print(f"\nGO Annotations ({len(lines)-1} total):")

    # Group by aspect
    aspects = {"P": [], "F": [], "C": []}
    for line in lines[1:]:
        fields = line.split("\t")
        go_aspect = fields[8]  # P, F, or C
        go_term = fields[7]
        aspects[go_aspect].append(go_term)

    print(f"  Biological Process: {len(aspects['P'])} terms")
    print(f"  Molecular Function: {len(aspects['F'])} terms")
    print(f"  Cellular Component: {len(aspects['C'])} terms")

# 4. Get protein sequence features
full_entry = u.retrieve(uniprot_id, frmt="txt")
print("\nProtein Features:")
for line in full_entry.split("\n"):
    if line.startswith("FT   DOMAIN"):
        print(f"  {line}")
```

**Output:** Comprehensive annotation including name, pathways, GO terms, and features.

---

## Protein Interaction Network Construction

**Goal:** Build a protein-protein interaction network for a set of proteins.

### Workflow

```python
from bioservices import PSICQUIC
import networkx as nx

# Proteins of interest
proteins = ["ZAP70", "LCK", "LAT", "SLP76", "PLCg1"]

# Initialize PSICQUIC
p = PSICQUIC()

# Build network
G = nx.Graph()

for protein in proteins:
    # Query for human interactions
    query = f"{protein} AND species:9606"

    try:
        results = p.query("intact", query)

        if results:
            lines = results.strip().split("\n")

            for line in lines:
                fields = line.split("\t")
                # Extract protein names (simplified)
                protein_a = fields[4].split(":")[1] if ":" in fields[4] else fields[4]
                protein_b = fields[5].split(":")[1] if ":" in fields[5] else fields[5]

                # Add edge
                G.add_edge(protein_a, protein_b)

    except Exception as e:
        print(f"Error querying {protein}: {e}")

print(f"Network: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges")

# Analyze network
print("\nNode degrees:")
for node in proteins:
    if node in G:
        print(f"  {node}: {G.degree(node)} interactions")

# Export for visualization
nx.write_gml(G, "protein_network.gml")
print("\nNetwork exported to protein_network.gml")
```

**Output:** NetworkX graph exported in GML format for Cytoscape visualization.

---

## Multi-Organism Comparative Analysis

**Goal:** Compare pathway or gene presence across multiple organisms.

### Workflow

```python
from bioservices import KEGG

k = KEGG()

# Organisms to compare
organisms = ["hsa", "mmu", "dme", "sce"]  # Human, mouse, fly, yeast
organism_names = {
    "hsa": "Human",
    "mmu": "Mouse",
    "dme": "Fly",
    "sce": "Yeast"
}

# Pathway of interest
pathway_name = "cell cycle"

print(f"Searching for '{pathway_name}' pathway across organisms:\n")

for org in organisms:
    k.organism = org

    # Search pathways
    results = k.lookfor_pathway(pathway_name)

    print(f"{organism_names[org]} ({org}):")
    if results:
        for pathway in results[:3]:  # Show first 3
            print(f"  {pathway}")
    else:
        print("  No matches found")
    print()
```

**Output:** Pathway presence/absence across organisms.

---

## Best Practices for Workflows

### 1. Error Handling

Always wrap service calls:
```python
try:
    result = service.method(params)
    if result:
        # Process
        pass
except Exception as e:
    print(f"Error: {e}")
```

### 2. Rate Limiting

Add delays for batch processing:
```python
import time

for item in items:
    result = service.query(item)
    time.sleep(0.5)  # 500ms delay
```

### 3. Result Validation

Check for empty or unexpected results:
```python
if result and len(result) > 0:
    # Process
    pass
else:
    print("No results returned")
```

### 4. Progress Reporting

For long workflows:
```python
total = len(items)
for i, item in enumerate(items):
    # Process item
    if (i + 1) % 10 == 0:
        print(f"Processed {i+1}/{total}")
```

### 5. Data Export

Save intermediate results:
```python
import json

with open("results.json", "w") as f:
    json.dump(results, f, indent=2)
```

---

## Integration with Other Tools

### BioPython Integration

```python
from bioservices import UniProt
from Bio import SeqIO
from io import StringIO

u = UniProt()
fasta_data = u.retrieve("P43403", "fasta")

# Parse with BioPython
fasta_io = StringIO(fasta_data)
record = SeqIO.read(fasta_io, "fasta")

print(f"Sequence length: {len(record.seq)}")
print(f"Description: {record.description}")
```

### Pandas Integration

```python
from bioservices import UniProt
import pandas as pd
from io import StringIO

u = UniProt()
results = u.search("zap70", frmt="tab", columns="id,genes,length,organism")

# Load into DataFrame
df = pd.read_csv(StringIO(results), sep="\t")
print(df.head())
print(df.describe())
```

### NetworkX Integration

See Protein Interaction Network Construction above.

---

For complete working examples, see the scripts in `scripts/` directory.
