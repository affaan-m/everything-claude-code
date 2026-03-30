# KEGG Database Reference

## Overview

KEGG (Kyoto Encyclopedia of Genes and Genomes) is a comprehensive bioinformatics resource that maintains manually curated pathway maps and molecular interaction networks. It provides "wiring diagrams of molecular interactions, reactions and relations" for understanding biological systems.

**Base URL**: https://rest.kegg.jp
**Official Documentation**: https://www.kegg.jp/kegg/rest/keggapi.html
**Access Restrictions**: KEGG API is made available only for academic use by academic users.

## KEGG Databases

KEGG integrates 16 primary databases organized into systems information, genomic information, chemical information, and health information categories:

### Systems Information
- **PATHWAY**: Manually drawn pathway maps for metabolism, genetic information processing, environmental information processing, cellular processes, organismal systems, human diseases, and drug development
- **MODULE**: Functional units and building blocks of pathways
- **BRITE**: Hierarchical classifications and ontologies

### Genomic Information
- **GENOME**: Complete genomes with annotations
- **GENES**: Gene catalogs for all organisms
- **ORTHOLOGY**: Ortholog groups (KO: KEGG Orthology)
- **SSDB**: Sequence similarity database

### Chemical Information
- **COMPOUND**: Metabolites and other chemical substances
- **GLYCAN**: Glycan structures
- **REACTION**: Chemical reactions
- **RCLASS**: Reaction class (chemical structure transformation patterns)
- **ENZYME**: Enzyme nomenclature
- **NETWORK**: Network variations

### Health Information
- **DISEASE**: Human diseases with genetic and environmental factors
- **DRUG**: Approved drugs with chemical structures and target information
- **DGROUP**: Drug groups

### External Database Links
KEGG cross-references to external databases including:
- **PubMed**: Literature references
- **NCBI Gene**: Gene database
- **UniProt**: Protein sequences
- **PubChem**: Chemical compounds
- **ChEBI**: Chemical entities of biological interest

## REST API Operations

### 1. INFO - Database Metadata

**Syntax**: `/info/<database>`

Retrieves release information and statistics for a database.

**Examples**:
- `/info/kegg` - KEGG system information
- `/info/pathway` - Pathway database information
- `/info/hsa` - Human organism information

### 2. LIST - Entry Listings

**Syntax**: `/list/<database>[/<organism>]`

Lists entry identifiers and associated names.

**Parameters**:
- `database` - Database name (pathway, enzyme, genes, etc.) or entry (hsa:10458)
- `organism` - Optional organism code (e.g., hsa for human, eco for E. coli)

**Examples**:
- `/list/pathway` - All reference pathways
- `/list/pathway/hsa` - Human-specific pathways
- `/list/hsa:10458+ece:Z5100` - Specific gene entries (max 10)

**Organism Codes**: Three or four letter codes
- `hsa` - Homo sapiens (human)
- `mmu` - Mus musculus (mouse)
- `dme` - Drosophila melanogaster (fruit fly)
- `sce` - Saccharomyces cerevisiae (yeast)
- `eco` - Escherichia coli K-12 MG1655

### 3. FIND - Search Entries

**Syntax**: `/find/<database>/<query>[/<option>]`

Searches for entries by keywords or molecular properties.

**Parameters**:
- `database` - Database to search
- `query` - Search term or molecular property
- `option` - Optional: `formula`, `exact_mass`, `mol_weight`

**Search Fields** (database dependent):
- ENTRY, NAME, SYMBOL, GENE_NAME, DESCRIPTION, DEFINITION
- ORGANISM, TAXONOMY, ORTHOLOGY, PATHWAY, etc.

**Examples**:
- `/find/genes/shiga toxin` - Keyword search in genes
- `/find/compound/C7H10N4O2/formula` - Exact formula match
- `/find/drug/300-310/exact_mass` - Mass range search (300-310 Da)
- `/find/compound/300-310/mol_weight` - Molecular weight range

### 4. GET - Retrieve Entries

**Syntax**: `/get/<entry>[+<entry>...][/<option>]`

Retrieves full database entries or specific data formats.

**Parameters**:
- `entry` - Entry ID(s) (max 10, joined with +)
- `option` - Output format (optional)

**Output Options**:
- `aaseq` - Amino acid sequences (FASTA)
- `ntseq` - Nucleotide sequences (FASTA)
- `mol` - MOL format (compounds/drugs)
- `kcf` - KCF format (KEGG Chemical Function, compounds/drugs)
- `image` - PNG image (pathway maps, single entry only)
- `kgml` - KGML XML (pathway structure, single entry only)
- `json` - JSON format (pathway only, single entry only)

**Examples**:
- `/get/hsa00010` - Glycolysis pathway (human)
- `/get/hsa:10458+ece:Z5100` - Multiple genes (max 10)
- `/get/hsa:10458/aaseq` - Protein sequence
- `/get/cpd:C00002` - ATP compound entry
- `/get/hsa05130/json` - Pathways in cancer as JSON
- `/get/hsa05130/image` - Pathway map as PNG

**Image Restrictions**: Only one entry allowed with image option

### 5. CONV - ID Conversion

**Syntax**: `/conv/<target_db>/<source_db>`

Converts identifiers between KEGG and external databases.

**Supported Conversions**:
- `ncbi-geneid` ↔ KEGG genes
- `ncbi-proteinid` ↔ KEGG genes
- `uniprot` ↔ KEGG genes
- `pubchem` ↔ KEGG compounds/drugs
- `chebi` ↔ KEGG compounds/drugs

**Examples**:
- `/conv/ncbi-geneid/hsa` - All human genes to NCBI Gene IDs
- `/conv/hsa/ncbi-geneid` - NCBI Gene IDs to human genes (reverse)
- `/conv/uniprot/hsa:10458` - Specific gene to UniProt
- `/conv/pubchem/compound` - All compounds to PubChem IDs

### 6. LINK - Cross-References

**Syntax**: `/link/<target_db>/<source_db>`

Finds related entries within and between KEGG databases.

**Common Links**:
- genes ↔ pathway
- pathway ↔ compound
- pathway ↔ enzyme
- genes ↔ orthology (KO)
- compound ↔ reaction

**Examples**:
- `/link/pathway/hsa` - All pathways linked to human genes
- `/link/genes/hsa00010` - Genes in glycolysis pathway
- `/link/pathway/hsa:10458` - Pathways containing specific gene
- `/link/compound/hsa00010` - Compounds in pathway

### 7. DDI - Drug-Drug Interactions

**Syntax**: `/ddi/<drug>[+<drug>...]`

Retrieves drug-drug interaction information extracted from Japanese drug labels.

**Parameters**:
- `drug` - Drug entry ID(s) (max 10, joined with +)

**Examples**:
- `/ddi/D00001` - Interactions for single drug
- `/ddi/D00001+D00002` - Interactions between multiple drugs

## Pathway Classification

KEGG organizes pathways into seven major categories:

### 1. Metabolism
Carbohydrate, energy, lipid, nucleotide, amino acid, glycan biosynthesis and metabolism, cofactor and vitamin metabolism, terpenoid and polyketide metabolism, secondary metabolite biosynthesis, xenobiotics biodegradation

**Example pathways**:
- `map00010` - Glycolysis / Gluconeogenesis
- `map00020` - Citrate cycle (TCA cycle)
- `map00190` - Oxidative phosphorylation

### 2. Genetic Information Processing
Transcription, translation, folding/sorting/degradation, replication and repair

**Example pathways**:
- `map03010` - Ribosome
- `map03020` - RNA polymerase
- `map03040` - Spliceosome

### 3. Environmental Information Processing
Membrane transport, signal transduction

**Example pathways**:
- `map02010` - ABC transporters
- `map04010` - MAPK signaling pathway

### 4. Cellular Processes
Transport and catabolism, cell growth and death, cellular community, cell motility

**Example pathways**:
- `map04140` - Autophagy
- `map04210` - Apoptosis

### 5. Organismal Systems
Immune, endocrine, circulatory, digestive, nervous, sensory, development, environmental adaptation

**Example pathways**:
- `map04610` - Complement and coagulation cascades
- `map04910` - Insulin signaling pathway

### 6. Human Diseases
Cancer, immune diseases, neurodegenerative diseases, cardiovascular diseases, metabolic diseases, infectious diseases

**Example pathways**:
- `map05200` - Pathways in cancer
- `map05010` - Alzheimer disease

### 7. Drug Development
Chronological classification and target-based classification

## Common Identifiers and Naming

### Pathway IDs
- `map#####` - Reference pathway (generic)
- `hsa#####` - Human-specific pathway
- `mmu#####` - Mouse-specific pathway
- Format: organism code + 5-digit number

### Gene IDs
- `hsa:10458` - Human gene (organism:gene_id)
- Format: organism code + colon + gene number

### Compound IDs
- `cpd:C00002` - ATP
- Format: cpd:C#####

### Drug IDs
- `dr:D00001` - Drug entry
- Format: dr:D#####

### Enzyme IDs
- `ec:1.1.1.1` - Alcohol dehydrogenase
- Format: ec:EC_number

### KO (KEGG Orthology) IDs
- `ko:K00001` - Ortholog group
- Format: ko:K#####

## API Limitations and Best Practices

### Rate Limits and Restrictions
- Maximum 10 entries per single operation (except image/kgml: 1 entry)
- Academic use only - commercial use requires separate licensing
- No explicit rate limit documented, but avoid rapid-fire requests

### HTTP Status Codes
- `200` - Success
- `400` - Bad request (syntax error in query)
- `404` - Not found (entry or database doesn't exist)

### Best Practices
1. Always check HTTP status codes in responses
2. For bulk operations, batch entries using + (up to 10)
3. Cache results locally to reduce API calls
4. Use specific organism codes when possible for faster results
5. For pathway visualization, use the web interface or KGML/JSON formats
6. Parse tab-delimited output carefully (consistent format across operations)

## Integration with Other Tools

### Biopython Integration
Biopython provides `Bio.KEGG.REST` module for easier Python integration:
```python
from Bio.KEGG import REST
result = REST.kegg_list("pathway").read()
```

### KEGGREST (R/Bioconductor)
R users can use the KEGGREST package:
```r
library(KEGGREST)
pathways <- keggList("pathway")
```

## Common Analysis Workflows

### Workflow 1: Gene to Pathway Mapping
1. Get gene ID(s) from your organism
2. Use `/link/pathway/<gene_id>` to find associated pathways
3. Use `/get/<pathway_id>` to retrieve detailed pathway information

### Workflow 2: Pathway Enrichment Context
1. Use `/list/pathway/<org>` to get all organism pathways
2. Use `/link/genes/<pathway_id>` to get genes in each pathway
3. Perform statistical enrichment analysis

### Workflow 3: Compound to Reaction Mapping
1. Use `/find/compound/<name>` to find compound ID
2. Use `/link/reaction/<compound_id>` to find reactions
3. Use `/link/pathway/<reaction_id>` to find pathways containing reactions

### Workflow 4: ID Conversion for Integration
1. Use `/conv/uniprot/<org>` to map KEGG genes to UniProt
2. Use `/conv/ncbi-geneid/<org>` to map to NCBI Gene IDs
3. Integrate with other databases using converted IDs

## Additional Resources

- **KEGG Mapper**: https://www.kegg.jp/kegg/mapper/ - Interactive pathway mapping
- **BlastKOALA**: Automated annotation for sequenced genomes
- **GhostKOALA**: Annotation for metagenomes and metatranscriptomes
- **KEGG Modules**: https://www.kegg.jp/kegg/module.html
- **KEGG Brite**: https://www.kegg.jp/kegg/brite.html
