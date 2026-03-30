# BioServices: Complete Services Reference

This document provides a comprehensive reference for all major services available in BioServices, including key methods, parameters, and use cases.

## Protein & Gene Resources

### UniProt

Protein sequence and functional information database.

**Initialization:**
```python
from bioservices import UniProt
u = UniProt(verbose=False)
```

**Key Methods:**

- `search(query, frmt="tab", columns=None, limit=None, sort=None, compress=False, include=False, **kwargs)`
  - Search UniProt with flexible query syntax
  - `frmt`: "tab", "fasta", "xml", "rdf", "gff", "txt"
  - `columns`: Comma-separated list (e.g., "id,genes,organism,length")
  - Returns: String in requested format

- `retrieve(uniprot_id, frmt="txt")`
  - Retrieve specific UniProt entry
  - `frmt`: "txt", "fasta", "xml", "rdf", "gff"
  - Returns: Entry data in requested format

- `mapping(fr="UniProtKB_AC-ID", to="KEGG", query="P43403")`
  - Convert identifiers between databases
  - `fr`/`to`: Database identifiers (see identifier_mapping.md)
  - `query`: Single ID or comma-separated list
  - Returns: Dictionary mapping input to output IDs

- `searchUniProtId(pattern, columns="entry name,length,organism", limit=100)`
  - Convenience method for ID-based searches
  - Returns: Tab-separated values

**Common columns:** id, entry name, genes, organism, protein names, length, sequence, go-id, ec, pathway, interactor

**Use cases:**
- Protein sequence retrieval for BLAST
- Functional annotation lookup
- Cross-database identifier mapping
- Batch protein information retrieval

---

### KEGG (Kyoto Encyclopedia of Genes and Genomes)

Metabolic pathways, genes, and organisms database.

**Initialization:**
```python
from bioservices import KEGG
k = KEGG()
k.organism = "hsa"  # Set default organism
```

**Key Methods:**

- `list(database)`
  - List entries in KEGG database
  - `database`: "organism", "pathway", "module", "disease", "drug", "compound"
  - Returns: Multi-line string with entries

- `find(database, query)`
  - Search database by keywords
  - Returns: List of matching entries with IDs

- `get(entry_id)`
  - Retrieve entry by ID
  - Supports genes, pathways, compounds, etc.
  - Returns: Raw entry text

- `parse(data)`
  - Parse KEGG entry into dictionary
  - Returns: Dict with structured data

- `lookfor_organism(name)`
  - Search organisms by name pattern
  - Returns: List of matching organism codes

- `lookfor_pathway(name)`
  - Search pathways by name
  - Returns: List of pathway IDs

- `get_pathway_by_gene(gene_id, organism)`
  - Find pathways containing gene
  - Returns: List of pathway IDs

- `parse_kgml_pathway(pathway_id)`
  - Parse pathway KGML for interactions
  - Returns: Dict with "entries" and "relations"

- `pathway2sif(pathway_id)`
  - Extract Simple Interaction Format data
  - Filters for activation/inhibition
  - Returns: List of interaction tuples

**Organism codes:**
- hsa: Homo sapiens
- mmu: Mus musculus
- dme: Drosophila melanogaster
- sce: Saccharomyces cerevisiae
- eco: Escherichia coli

**Use cases:**
- Pathway analysis and visualization
- Gene function annotation
- Metabolic network reconstruction
- Protein-protein interaction extraction

---

### HGNC (Human Gene Nomenclature Committee)

Official human gene naming authority.

**Initialization:**
```python
from bioservices import HGNC
h = HGNC()
```

**Key Methods:**
- `search(query)`: Search gene symbols/names
- `fetch(format, query)`: Retrieve gene information

**Use cases:**
- Standardizing human gene names
- Looking up official gene symbols

---

### MyGeneInfo

Gene annotation and query service.

**Initialization:**
```python
from bioservices import MyGeneInfo
m = MyGeneInfo()
```

**Key Methods:**
- `querymany(ids, scopes, fields, species)`: Batch gene queries
- `getgene(geneid)`: Get gene annotation

**Use cases:**
- Batch gene annotation retrieval
- Gene ID conversion

---

## Chemical Compound Resources

### ChEBI (Chemical Entities of Biological Interest)

Dictionary of molecular entities.

**Initialization:**
```python
from bioservices import ChEBI
c = ChEBI()
```

**Key Methods:**
- `getCompleteEntity(chebi_id)`: Full compound information
- `getLiteEntity(chebi_id)`: Basic information
- `getCompleteEntityByList(chebi_ids)`: Batch retrieval

**Use cases:**
- Small molecule information
- Chemical structure data
- Compound property lookup

---

### ChEMBL

Bioactive drug-like compound database.

**Initialization:**
```python
from bioservices import ChEMBL
c = ChEMBL()
```

**Key Methods:**
- `get_molecule_form(chembl_id)`: Compound details
- `get_target(chembl_id)`: Target information
- `get_similarity(chembl_id)`: Get similar compounds for given 
- `get_assays()`: Bioassay data

**Use cases:**
- Drug discovery data
- Find similar compounds  
- Bioactivity information
- Target-compound relationships

---

### UniChem

Chemical identifier mapping service.

**Initialization:**
```python
from bioservices import UniChem
u = UniChem()
```

**Key Methods:**
- `get_compound_id_from_kegg(kegg_id)`: KEGG → ChEMBL
- `get_all_compound_ids(src_compound_id, src_id)`: Get all IDs
- `get_src_compound_ids(src_compound_id, from_src_id, to_src_id)`: Convert IDs

**Source IDs:**
- 1: ChEMBL
- 2: DrugBank
- 3: PDB
- 6: KEGG
- 7: ChEBI
- 22: PubChem

**Use cases:**
- Cross-database compound ID mapping
- Linking chemical databases

---

### PubChem

Chemical compound database from NIH.

**Initialization:**
```python
from bioservices import PubChem
p = PubChem()
```

**Key Methods:**
- `get_compounds(identifier, namespace)`: Retrieve compounds
- `get_properties(properties, identifier, namespace)`: Get properties

**Use cases:**
- Chemical structure retrieval
- Compound property information

---

## Sequence Analysis Tools

### NCBIblast

Sequence similarity searching.

**Initialization:**
```python
from bioservices import NCBIblast
s = NCBIblast(verbose=False)
```

**Key Methods:**
- `run(program, sequence, stype, database, email, **params)`
  - Submit BLAST job
  - `program`: "blastp", "blastn", "blastx", "tblastn", "tblastx"
  - `stype`: "protein" or "dna"
  - `database`: "uniprotkb", "pdb", "refseq_protein", etc.
  - `email`: Required by NCBI
  - Returns: Job ID

- `getStatus(jobid)`
  - Check job status
  - Returns: "RUNNING", "FINISHED", "ERROR"

- `getResult(jobid, result_type)`
  - Retrieve results
  - `result_type`: "out" (default), "ids", "xml"

**Important:** BLAST jobs are asynchronous. Always check status before retrieving results.

**Use cases:**
- Protein homology searches
- Sequence similarity analysis
- Functional annotation by homology

---

## Pathway & Interaction Resources

### Reactome

Pathway database.

**Initialization:**
```python
from bioservices import Reactome
r = Reactome()
```

**Key Methods:**
- `get_pathway_by_id(pathway_id)`: Pathway details
- `search_pathway(query)`: Search pathways

**Use cases:**
- Human pathway analysis
- Biological process annotation

---

### PSICQUIC

Protein interaction query service (federates 30+ databases).

**Initialization:**
```python
from bioservices import PSICQUIC
s = PSICQUIC()
```

**Key Methods:**
- `query(database, query_string)`
  - Query specific interaction database
  - Returns: PSI-MI TAB format

- `activeDBs`
  - Property listing available databases
  - Returns: List of database names

**Available databases:** MINT, IntAct, BioGRID, DIP, InnateDB, MatrixDB, MPIDB, UniProt, and 30+ more

**Query syntax:** Supports AND, OR, species filters
- Example: "ZAP70 AND species:9606"

**Use cases:**
- Protein-protein interaction discovery
- Network analysis
- Interactome mapping

---

### IntactComplex

Protein complex database.

**Initialization:**
```python
from bioservices import IntactComplex
i = IntactComplex()
```

**Key Methods:**
- `search(query)`: Search complexes
- `details(complex_ac)`: Complex details

**Use cases:**
- Protein complex composition
- Multi-protein assembly analysis

---

### OmniPath

Integrated signaling pathway database.

**Initialization:**
```python
from bioservices import OmniPath
o = OmniPath()
```

**Key Methods:**
- `interactions(datasets, organisms)`: Get interactions
- `ptms(datasets, organisms)`: Post-translational modifications

**Use cases:**
- Cell signaling analysis
- Regulatory network mapping

---

## Gene Ontology

### QuickGO

Gene Ontology annotation service.

**Initialization:**
```python
from bioservices import QuickGO
g = QuickGO()
```

**Key Methods:**
- `Term(go_id, frmt="obo")`
  - Retrieve GO term information
  - Returns: Term definition and metadata

- `Annotation(protein=None, goid=None, format="tsv")`
  - Get GO annotations
  - Returns: Annotations in requested format

**GO categories:**
- Biological Process (BP)
- Molecular Function (MF)
- Cellular Component (CC)

**Use cases:**
- Functional annotation
- Enrichment analysis
- GO term lookup

---

## Genomic Resources

### BioMart

Data mining tool for genomic data.

**Initialization:**
```python
from bioservices import BioMart
b = BioMart()
```

**Key Methods:**
- `datasets(dataset)`: List available datasets
- `attributes(dataset)`: List attributes
- `query(query_xml)`: Execute BioMart query

**Use cases:**
- Bulk genomic data retrieval
- Custom genome annotations
- SNP information

---

### ArrayExpress

Gene expression database.

**Initialization:**
```python
from bioservices import ArrayExpress
a = ArrayExpress()
```

**Key Methods:**
- `queryExperiments(keywords)`: Search experiments
- `retrieveExperiment(accession)`: Get experiment data

**Use cases:**
- Gene expression data
- Microarray analysis
- RNA-seq data retrieval

---

### ENA (European Nucleotide Archive)

Nucleotide sequence database.

**Initialization:**
```python
from bioservices import ENA
e = ENA()
```

**Key Methods:**
- `search_data(query)`: Search sequences
- `retrieve_data(accession)`: Retrieve sequences

**Use cases:**
- Nucleotide sequence retrieval
- Genome assembly access

---

## Structural Biology

### PDB (Protein Data Bank)

3D protein structure database.

**Initialization:**
```python
from bioservices import PDB
p = PDB()
```

**Key Methods:**
- `get_file(pdb_id, file_format)`: Download structure files
- `search(query)`: Search structures

**File formats:** pdb, cif, xml

**Use cases:**
- 3D structure retrieval
- Structure-based analysis
- PyMOL visualization

---

### Pfam

Protein family database.

**Initialization:**
```python
from bioservices import Pfam
p = Pfam()
```

**Key Methods:**
- `searchSequence(sequence)`: Find domains in sequence
- `getPfamEntry(pfam_id)`: Domain information

**Use cases:**
- Protein domain identification
- Family classification
- Functional motif discovery

---

## Specialized Resources

### BioModels

Systems biology model repository.

**Initialization:**
```python
from bioservices import BioModels
b = BioModels()
```

**Key Methods:**
- `get_model_by_id(model_id)`: Retrieve SBML model

**Use cases:**
- Systems biology modeling
- SBML model retrieval

---

### COG (Clusters of Orthologous Genes)

Orthologous gene classification.

**Initialization:**
```python
from bioservices import COG
c = COG()
```

**Use cases:**
- Orthology analysis
- Functional classification

---

### BiGG Models

Metabolic network models.

**Initialization:**
```python
from bioservices import BiGG
b = BiGG()
```

**Key Methods:**
- `list_models()`: Available models
- `get_model(model_id)`: Model details

**Use cases:**
- Metabolic network analysis
- Flux balance analysis

---

## General Patterns

### Error Handling

All services may throw exceptions. Wrap calls in try-except:

```python
try:
    result = service.method(params)
    if result:
        # Process result
        pass
except Exception as e:
    print(f"Error: {e}")
```

### Verbosity Control

Most services support `verbose` parameter:
```python
service = Service(verbose=False)  # Suppress HTTP logs
```

### Rate Limiting

Services have timeouts and rate limits:
```python
service.TIMEOUT = 30  # Adjust timeout
service.DELAY = 1     # Delay between requests (if supported)
```

### Output Formats

Common format parameters:
- `frmt`: "xml", "json", "tab", "txt", "fasta"
- `format`: Service-specific variants

### Caching

Some services cache results:
```python
service.CACHE = True  # Enable caching
service.clear_cache()  # Clear cache
```

## Additional Resources

For detailed API documentation:
- Official docs: https://bioservices.readthedocs.io/
- Individual service docs linked from main page
- Source code: https://github.com/cokelaer/bioservices
