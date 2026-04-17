---
name: gget
description: "CLI/Python toolkit for rapid bioinformatics queries. Preferred for quick BLAST searches. Access to 20+ databases: gene info (Ensembl/UniProt), AlphaFold, ARCHS4, Enrichr, OpenTargets, COSMIC, genome downloads. For advanced BLAST/batch processing, use biopython. For multi-database integration, use bioservices."
---

# gget

## Overview

gget is a command-line bioinformatics tool and Python package providing unified access to 20+ genomic databases and analysis methods. Query gene information, sequence analysis, protein structures, expression data, and disease associations through a consistent interface. All gget modules work both as command-line tools and as Python functions.

**Important**: The databases queried by gget are continuously updated, which sometimes changes their structure. gget modules are tested automatically on a biweekly basis and updated to match new database structures when necessary.

## Installation

Install gget in a clean virtual environment to avoid conflicts:

```bash
# Using uv (recommended)
uv pip install gget

# Or using pip
pip install --upgrade gget

# In Python/Jupyter
import gget
```

## Quick Start

Basic usage pattern for all modules:

```bash
# Command-line
gget <module> [arguments] [options]

# Python
gget.module(arguments, options)
```

Most modules return:
- **Command-line**: JSON (default) or CSV with `-csv` flag
- **Python**: DataFrame or dictionary

Common flags across modules:
- `-o/--out`: Save results to file
- `-q/--quiet`: Suppress progress information
- `-csv`: Return CSV format (command-line only)

## Module Categories

### 1. Reference & Gene Information

#### gget ref - Reference Genome Downloads

Retrieve download links and metadata for Ensembl reference genomes.

**Parameters**:
- `species`: Genus_species format (e.g., 'homo_sapiens', 'mus_musculus'). Shortcuts: 'human', 'mouse'
- `-w/--which`: Specify return types (gtf, cdna, dna, cds, cdrna, pep). Default: all
- `-r/--release`: Ensembl release number (default: latest)
- `-l/--list_species`: List available vertebrate species
- `-liv/--list_iv_species`: List available invertebrate species
- `-ftp`: Return only FTP links
- `-d/--download`: Download files (requires curl)

**Examples**:
```bash
# List available species
gget ref --list_species

# Get all reference files for human
gget ref homo_sapiens

# Download only GTF annotation for mouse
gget ref -w gtf -d mouse
```

```python
# Python
gget.ref("homo_sapiens")
gget.ref("mus_musculus", which="gtf", download=True)
```

#### gget search - Gene Search

Locate genes by name or description across species.

**Parameters**:
- `searchwords`: One or more search terms (case-insensitive)
- `-s/--species`: Target species (e.g., 'homo_sapiens', 'mouse')
- `-r/--release`: Ensembl release number
- `-t/--id_type`: Return 'gene' (default) or 'transcript'
- `-ao/--andor`: 'or' (default) finds ANY searchword; 'and' requires ALL
- `-l/--limit`: Maximum results to return

**Returns**: ensembl_id, gene_name, ensembl_description, ext_ref_description, biotype, URL

**Examples**:
```bash
# Search for GABA-related genes in human
gget search -s human gaba gamma-aminobutyric

# Find specific gene, require all terms
gget search -s mouse -ao and pax7 transcription
```

```python
# Python
gget.search(["gaba", "gamma-aminobutyric"], species="homo_sapiens")
```

#### gget info - Gene/Transcript Information

Retrieve comprehensive gene and transcript metadata from Ensembl, UniProt, and NCBI.

**Parameters**:
- `ens_ids`: One or more Ensembl IDs (also supports WormBase, Flybase IDs). Limit: ~1000 IDs
- `-n/--ncbi`: Disable NCBI data retrieval
- `-u/--uniprot`: Disable UniProt data retrieval
- `-pdb`: Include PDB identifiers (increases runtime)

**Returns**: UniProt ID, NCBI gene ID, primary gene name, synonyms, protein names, descriptions, biotype, canonical transcript

**Examples**:
```bash
# Get info for multiple genes
gget info ENSG00000034713 ENSG00000104853 ENSG00000170296

# Include PDB IDs
gget info ENSG00000034713 -pdb
```

```python
# Python
gget.info(["ENSG00000034713", "ENSG00000104853"], pdb=True)
```

#### gget seq - Sequence Retrieval

Fetch nucleotide or amino acid sequences for genes and transcripts.

**Parameters**:
- `ens_ids`: One or more Ensembl identifiers
- `-t/--translate`: Fetch amino acid sequences instead of nucleotide
- `-iso/--isoforms`: Return all transcript variants (gene IDs only)

**Returns**: FASTA format sequences

**Examples**:
```bash
# Get nucleotide sequences
gget seq ENSG00000034713 ENSG00000104853

# Get all protein isoforms
gget seq -t -iso ENSG00000034713
```

```python
# Python
gget.seq(["ENSG00000034713"], translate=True, isoforms=True)
```

### 2. Sequence Analysis & Alignment

#### gget blast - BLAST Searches

BLAST nucleotide or amino acid sequences against standard databases.

**Parameters**:
- `sequence`: Sequence string or path to FASTA/.txt file
- `-p/--program`: blastn, blastp, blastx, tblastn, tblastx (auto-detected)
- `-db/--database`:
  - Nucleotide: nt, refseq_rna, pdbnt
  - Protein: nr, swissprot, pdbaa, refseq_protein
- `-l/--limit`: Max hits (default: 50)
- `-e/--expect`: E-value cutoff (default: 10.0)
- `-lcf/--low_comp_filt`: Enable low complexity filtering
- `-mbo/--megablast_off`: Disable MegaBLAST (blastn only)

**Examples**:
```bash
# BLAST protein sequence
gget blast MKWMFKEDHSLEHRCVESAKIRAKYPDRVPVIVEKVSGSQIVDIDKRKYLVPSDITVAQFMWIIRKRIQLPSEKAIFLFVDKTVPQSR

# BLAST from file with specific database
gget blast sequence.fasta -db swissprot -l 10
```

```python
# Python
gget.blast("MKWMFK...", database="swissprot", limit=10)
```

#### gget blat - BLAT Searches

Locate genomic positions of sequences using UCSC BLAT.

**Parameters**:
- `sequence`: Sequence string or path to FASTA/.txt file
- `-st/--seqtype`: 'DNA', 'protein', 'translated%20RNA', 'translated%20DNA' (auto-detected)
- `-a/--assembly`: Target assembly (default: 'human'/hg38; options: 'mouse'/mm39, 'zebrafinch'/taeGut2, etc.)

**Returns**: genome, query size, alignment positions, matches, mismatches, alignment percentage

**Examples**:
```bash
# Find genomic location in human
gget blat ATCGATCGATCGATCG

# Search in different assembly
gget blat -a mm39 ATCGATCGATCGATCG
```

```python
# Python
gget.blat("ATCGATCGATCGATCG", assembly="mouse")
```

#### gget muscle - Multiple Sequence Alignment

Align multiple nucleotide or amino acid sequences using Muscle5.

**Parameters**:
- `fasta`: Sequences or path to FASTA/.txt file
- `-s5/--super5`: Use Super5 algorithm for faster processing (large datasets)

**Returns**: Aligned sequences in ClustalW format or aligned FASTA (.afa)

**Examples**:
```bash
# Align sequences from file
gget muscle sequences.fasta -o aligned.afa

# Use Super5 for large dataset
gget muscle large_dataset.fasta -s5
```

```python
# Python
gget.muscle("sequences.fasta", save=True)
```

#### gget diamond - Local Sequence Alignment

Perform fast local protein or translated DNA alignment using DIAMOND.

**Parameters**:
- Query: Sequences (string/list) or FASTA file path
- `--reference`: Reference sequences (string/list) or FASTA file path (required)
- `--sensitivity`: fast, mid-sensitive, sensitive, more-sensitive, very-sensitive (default), ultra-sensitive
- `--threads`: CPU threads (default: 1)
- `--diamond_db`: Save database for reuse
- `--translated`: Enable nucleotide-to-amino acid alignment

**Returns**: Identity percentage, sequence lengths, match positions, gap openings, E-values, bit scores

**Examples**:
```bash
# Align against reference
gget diamond GGETISAWESQME -ref reference.fasta --threads 4

# Save database for reuse
gget diamond query.fasta -ref ref.fasta --diamond_db my_db.dmnd
```

```python
# Python
gget.diamond("GGETISAWESQME", reference="reference.fasta", threads=4)
```

### 3. Structural & Protein Analysis

#### gget pdb - Protein Structures

Query RCSB Protein Data Bank for structure and metadata.

**Parameters**:
- `pdb_id`: PDB identifier (e.g., '7S7U')
- `-r/--resource`: Data type (pdb, entry, pubmed, assembly, entity types)
- `-i/--identifier`: Assembly, entity, or chain ID

**Returns**: PDB format (structures) or JSON (metadata)

**Examples**:
```bash
# Download PDB structure
gget pdb 7S7U -o 7S7U.pdb

# Get metadata
gget pdb 7S7U -r entry
```

```python
# Python
gget.pdb("7S7U", save=True)
```

#### gget alphafold - Protein Structure Prediction

Predict 3D protein structures using simplified AlphaFold2.

**Setup Required**:
```bash
# Install OpenMM first (version depends on Python version)
# Python < 3.10:
conda install -qy conda==4.13.0 && conda install -qy -c conda-forge openmm=7.5.1
# Python 3.10:
conda install -qy conda==24.1.2 && conda install -qy -c conda-forge openmm=7.7.0
# Python 3.11:
conda install -qy conda==24.11.1 && conda install -qy -c conda-forge openmm=8.0.0

# Then setup AlphaFold
gget setup alphafold
```

**Parameters**:
- `sequence`: Amino acid sequence (string), multiple sequences (list), or FASTA file. Multiple sequences trigger multimer modeling
- `-mr/--multimer_recycles`: Recycling iterations (default: 3; recommend 20 for accuracy)
- `-mfm/--multimer_for_monomer`: Apply multimer model to single proteins
- `-r/--relax`: AMBER relaxation for top-ranked model
- `plot`: Python-only; generate interactive 3D visualization (default: True)
- `show_sidechains`: Python-only; include side chains (default: True)

**Returns**: PDB structure file, JSON alignment error data, optional 3D visualization

**Examples**:
```bash
# Predict single protein structure
gget alphafold MKWMFKEDHSLEHRCVESAKIRAKYPDRVPVIVEKVSGSQIVDIDKRKYLVPSDITVAQFMWIIRKRIQLPSEKAIFLFVDKTVPQSR

# Predict multimer with higher accuracy
gget alphafold sequence1.fasta -mr 20 -r
```

```python
# Python with visualization
gget.alphafold("MKWMFK...", plot=True, show_sidechains=True)

# Multimer prediction
gget.alphafold(["sequence1", "sequence2"], multimer_recycles=20)
```

#### gget elm - Eukaryotic Linear Motifs

Predict Eukaryotic Linear Motifs in protein sequences.

**Setup Required**:
```bash
gget setup elm
```

**Parameters**:
- `sequence`: Amino acid sequence or UniProt Acc
- `-u/--uniprot`: Indicates sequence is UniProt Acc
- `-e/--expand`: Include protein names, organisms, references
- `-s/--sensitivity`: DIAMOND alignment sensitivity (default: "very-sensitive")
- `-t/--threads`: Number of threads (default: 1)

**Returns**: Two outputs:
1. **ortholog_df**: Linear motifs from orthologous proteins
2. **regex_df**: Motifs directly matched in input sequence

**Examples**:
```bash
# Predict motifs from sequence
gget elm LIAQSIGQASFV -o results

# Use UniProt accession with expanded info
gget elm --uniprot Q02410 -e
```

```python
# Python
ortholog_df, regex_df = gget.elm("LIAQSIGQASFV")
```

### 4. Expression & Disease Data

#### gget archs4 - Gene Correlation & Tissue Expression

Query ARCHS4 database for correlated genes or tissue expression data.

**Parameters**:
- `gene`: Gene symbol or Ensembl ID (with `--ensembl` flag)
- `-w/--which`: 'correlation' (default, returns 100 most correlated genes) or 'tissue' (expression atlas)
- `-s/--species`: 'human' (default) or 'mouse' (tissue data only)
- `-e/--ensembl`: Input is Ensembl ID

**Returns**:
- **Correlation mode**: Gene symbols, Pearson correlation coefficients
- **Tissue mode**: Tissue identifiers, min/Q1/median/Q3/max expression values

**Examples**:
```bash
# Get correlated genes
gget archs4 ACE2

# Get tissue expression
gget archs4 -w tissue ACE2
```

```python
# Python
gget.archs4("ACE2", which="tissue")
```

#### gget cellxgene - Single-Cell RNA-seq Data

Query CZ CELLxGENE Discover Census for single-cell data.

**Setup Required**:
```bash
gget setup cellxgene
```

**Parameters**:
- `--gene` (-g): Gene names or Ensembl IDs (case-sensitive! 'PAX7' for human, 'Pax7' for mouse)
- `--tissue`: Tissue type(s)
- `--cell_type`: Specific cell type(s)
- `--species` (-s): 'homo_sapiens' (default) or 'mus_musculus'
- `--census_version` (-cv): Version ("stable", "latest", or dated)
- `--ensembl` (-e): Use Ensembl IDs
- `--meta_only` (-mo): Return metadata only
- Additional filters: disease, development_stage, sex, assay, dataset_id, donor_id, ethnicity, suspension_type

**Returns**: AnnData object with count matrices and metadata (or metadata-only dataframes)

**Examples**:
```bash
# Get single-cell data for specific genes and cell types
gget cellxgene --gene ACE2 ABCA1 --tissue lung --cell_type "mucus secreting cell" -o lung_data.h5ad

# Metadata only
gget cellxgene --gene PAX7 --tissue muscle --meta_only -o metadata.csv
```

```python
# Python
adata = gget.cellxgene(gene=["ACE2", "ABCA1"], tissue="lung", cell_type="mucus secreting cell")
```

#### gget enrichr - Enrichment Analysis

Perform ontology enrichment analysis on gene lists using Enrichr.

**Parameters**:
- `genes`: Gene symbols or Ensembl IDs
- `-db/--database`: Reference database (supports shortcuts: 'pathway', 'transcription', 'ontology', 'diseases_drugs', 'celltypes')
- `-s/--species`: human (default), mouse, fly, yeast, worm, fish
- `-bkg_l/--background_list`: Background genes for comparison
- `-ko/--kegg_out`: Save KEGG pathway images with highlighted genes
- `plot`: Python-only; generate graphical results

**Database Shortcuts**:
- 'pathway' → KEGG_2021_Human
- 'transcription' → ChEA_2016
- 'ontology' → GO_Biological_Process_2021
- 'diseases_drugs' → GWAS_Catalog_2019
- 'celltypes' → PanglaoDB_Augmented_2021

**Examples**:
```bash
# Enrichment analysis for ontology
gget enrichr -db ontology ACE2 AGT AGTR1

# Save KEGG pathways
gget enrichr -db pathway ACE2 AGT AGTR1 -ko ./kegg_images/
```

```python
# Python with plot
gget.enrichr(["ACE2", "AGT", "AGTR1"], database="ontology", plot=True)
```

#### gget bgee - Orthology & Expression

Retrieve orthology and gene expression data from Bgee database.

**Parameters**:
- `ens_id`: Ensembl gene ID or NCBI gene ID (for non-Ensembl species). Multiple IDs supported when `type=expression`
- `-t/--type`: 'orthologs' (default) or 'expression'

**Returns**:
- **Orthologs mode**: Matching genes across species with IDs, names, taxonomic info
- **Expression mode**: Anatomical entities, confidence scores, expression status

**Examples**:
```bash
# Get orthologs
gget bgee ENSG00000169194

# Get expression data
gget bgee ENSG00000169194 -t expression

# Multiple genes
gget bgee ENSBTAG00000047356 ENSBTAG00000018317 -t expression
```

```python
# Python
gget.bgee("ENSG00000169194", type="orthologs")
```

#### gget opentargets - Disease & Drug Associations

Retrieve disease and drug associations from OpenTargets.

**Parameters**:
- Ensembl gene ID (required)
- `-r/--resource`: diseases (default), drugs, tractability, pharmacogenetics, expression, depmap, interactions
- `-l/--limit`: Cap results count
- Filter arguments (vary by resource):
  - drugs: `--filter_disease`
  - pharmacogenetics: `--filter_drug`
  - expression/depmap: `--filter_tissue`, `--filter_anat_sys`, `--filter_organ`
  - interactions: `--filter_protein_a`, `--filter_protein_b`, `--filter_gene_b`

**Examples**:
```bash
# Get associated diseases
gget opentargets ENSG00000169194 -r diseases -l 5

# Get associated drugs
gget opentargets ENSG00000169194 -r drugs -l 10

# Get tissue expression
gget opentargets ENSG00000169194 -r expression --filter_tissue brain
```

```python
# Python
gget.opentargets("ENSG00000169194", resource="diseases", limit=5)
```

#### gget cbio - cBioPortal Cancer Genomics

Plot cancer genomics heatmaps using cBioPortal data.

**Two subcommands**:

**search** - Find study IDs:
```bash
gget cbio search breast lung
```

**plot** - Generate heatmaps:

**Parameters**:
- `-s/--study_ids`: Space-separated cBioPortal study IDs (required)
- `-g/--genes`: Space-separated gene names or Ensembl IDs (required)
- `-st/--stratification`: Column to organize data (tissue, cancer_type, cancer_type_detailed, study_id, sample)
- `-vt/--variation_type`: Data type (mutation_occurrences, cna_nonbinary, sv_occurrences, cna_occurrences, Consequence)
- `-f/--filter`: Filter by column value (e.g., 'study_id:msk_impact_2017')
- `-dd/--data_dir`: Cache directory (default: ./gget_cbio_cache)
- `-fd/--figure_dir`: Output directory (default: ./gget_cbio_figures)
- `-dpi`: Resolution (default: 100)
- `-sh/--show`: Display plot in window
- `-nc/--no_confirm`: Skip download confirmations

**Examples**:
```bash
# Search for studies
gget cbio search esophag ovary

# Create heatmap
gget cbio plot -s msk_impact_2017 -g AKT1 ALK BRAF -st tissue -vt mutation_occurrences
```

```python
# Python
gget.cbio_search(["esophag", "ovary"])
gget.cbio_plot(["msk_impact_2017"], ["AKT1", "ALK"], stratification="tissue")
```

#### gget cosmic - COSMIC Database

Search COSMIC (Catalogue Of Somatic Mutations In Cancer) database.

**Important**: License fees apply for commercial use. Requires COSMIC account credentials.

**Parameters**:
- `searchterm`: Gene name, Ensembl ID, mutation notation, or sample ID
- `-ctp/--cosmic_tsv_path`: Path to downloaded COSMIC TSV file (required for querying)
- `-l/--limit`: Maximum results (default: 100)

**Database download flags**:
- `-d/--download_cosmic`: Activate download mode
- `-gm/--gget_mutate`: Create version for gget mutate
- `-cp/--cosmic_project`: Database type (cancer, census, cell_line, resistance, genome_screen, targeted_screen)
- `-cv/--cosmic_version`: COSMIC version
- `-gv/--grch_version`: Human reference genome (37 or 38)
- `--email`, `--password`: COSMIC credentials

**Examples**:
```bash
# First download database
gget cosmic -d --email user@example.com --password xxx -cp cancer

# Then query
gget cosmic EGFR -ctp cosmic_data.tsv -l 10
```

```python
# Python
gget.cosmic("EGFR", cosmic_tsv_path="cosmic_data.tsv", limit=10)
```

### 5. Additional Tools

#### gget mutate - Generate Mutated Sequences

Generate mutated nucleotide sequences from mutation annotations.

**Parameters**:
- `sequences`: FASTA file path or direct sequence input (string/list)
- `-m/--mutations`: CSV/TSV file or DataFrame with mutation data (required)
- `-mc/--mut_column`: Mutation column name (default: 'mutation')
- `-sic/--seq_id_column`: Sequence ID column (default: 'seq_ID')
- `-mic/--mut_id_column`: Mutation ID column
- `-k/--k`: Length of flanking sequences (default: 30 nucleotides)

**Returns**: Mutated sequences in FASTA format

**Examples**:
```bash
# Single mutation
gget mutate ATCGCTAAGCT -m "c.4G>T"

# Multiple sequences with mutations from file
gget mutate sequences.fasta -m mutations.csv -o mutated.fasta
```

```python
# Python
import pandas as pd
mutations_df = pd.DataFrame({"seq_ID": ["seq1"], "mutation": ["c.4G>T"]})
gget.mutate(["ATCGCTAAGCT"], mutations=mutations_df)
```

#### gget gpt - OpenAI Text Generation

Generate natural language text using OpenAI's API.

**Setup Required**:
```bash
gget setup gpt
```

**Important**: Free tier limited to 3 months after account creation. Set monthly billing limits.

**Parameters**:
- `prompt`: Text input for generation (required)
- `api_key`: OpenAI authentication (required)
- Model configuration: temperature, top_p, max_tokens, frequency_penalty, presence_penalty
- Default model: gpt-3.5-turbo (configurable)

**Examples**:
```bash
gget gpt "Explain CRISPR" --api_key your_key_here
```

```python
# Python
gget.gpt("Explain CRISPR", api_key="your_key_here")
```

#### gget setup - Install Dependencies

Install/download third-party dependencies for specific modules.

**Parameters**:
- `module`: Module name requiring dependency installation
- `-o/--out`: Output folder path (elm module only)

**Modules requiring setup**:
- `alphafold` - Downloads ~4GB of model parameters
- `cellxgene` - Installs cellxgene-census (may not support latest Python)
- `elm` - Downloads local ELM database
- `gpt` - Configures OpenAI integration

**Examples**:
```bash
# Setup AlphaFold
gget setup alphafold

# Setup ELM with custom directory
gget setup elm -o /path/to/elm_data
```

```python
# Python
gget.setup("alphafold")
```

## Common Workflows

### Workflow 1: Gene Discovery to Sequence Analysis

Find and analyze genes of interest:

```python
# 1. Search for genes
results = gget.search(["GABA", "receptor"], species="homo_sapiens")

# 2. Get detailed information
gene_ids = results["ensembl_id"].tolist()
info = gget.info(gene_ids[:5])

# 3. Retrieve sequences
sequences = gget.seq(gene_ids[:5], translate=True)
```

### Workflow 2: Sequence Alignment and Structure

Align sequences and predict structures:

```python
# 1. Align multiple sequences
alignment = gget.muscle("sequences.fasta")

# 2. Find similar sequences
blast_results = gget.blast(my_sequence, database="swissprot", limit=10)

# 3. Predict structure
structure = gget.alphafold(my_sequence, plot=True)

# 4. Find linear motifs
ortholog_df, regex_df = gget.elm(my_sequence)
```

### Workflow 3: Gene Expression and Enrichment

Analyze expression patterns and functional enrichment:

```python
# 1. Get tissue expression
tissue_expr = gget.archs4("ACE2", which="tissue")

# 2. Find correlated genes
correlated = gget.archs4("ACE2", which="correlation")

# 3. Get single-cell data
adata = gget.cellxgene(gene=["ACE2"], tissue="lung", cell_type="epithelial cell")

# 4. Perform enrichment analysis
gene_list = correlated["gene_symbol"].tolist()[:50]
enrichment = gget.enrichr(gene_list, database="ontology", plot=True)
```

### Workflow 4: Disease and Drug Analysis

Investigate disease associations and therapeutic targets:

```python
# 1. Search for genes
genes = gget.search(["breast cancer"], species="homo_sapiens")

# 2. Get disease associations
diseases = gget.opentargets("ENSG00000169194", resource="diseases")

# 3. Get drug associations
drugs = gget.opentargets("ENSG00000169194", resource="drugs")

# 4. Query cancer genomics data
study_ids = gget.cbio_search(["breast"])
gget.cbio_plot(study_ids[:2], ["BRCA1", "BRCA2"], stratification="cancer_type")

# 5. Search COSMIC for mutations
cosmic_results = gget.cosmic("BRCA1", cosmic_tsv_path="cosmic.tsv")
```

### Workflow 5: Comparative Genomics

Compare proteins across species:

```python
# 1. Get orthologs
orthologs = gget.bgee("ENSG00000169194", type="orthologs")

# 2. Get sequences for comparison
human_seq = gget.seq("ENSG00000169194", translate=True)
mouse_seq = gget.seq("ENSMUSG00000026091", translate=True)

# 3. Align sequences
alignment = gget.muscle([human_seq, mouse_seq])

# 4. Compare structures
human_structure = gget.pdb("7S7U")
mouse_structure = gget.alphafold(mouse_seq)
```

### Workflow 6: Building Reference Indices

Prepare reference data for downstream analysis (e.g., kallisto|bustools):

```bash
# 1. List available species
gget ref --list_species

# 2. Download reference files
gget ref -w gtf -w cdna -d homo_sapiens

# 3. Build kallisto index
kallisto index -i transcriptome.idx transcriptome.fasta

# 4. Download genome for alignment
gget ref -w dna -d homo_sapiens
```

## Best Practices

### Data Retrieval
- Use `--limit` to control result sizes for large queries
- Save results with `-o/--out` for reproducibility
- Check database versions/releases for consistency across analyses
- Use `--quiet` in production scripts to reduce output

### Sequence Analysis
- For BLAST/BLAT, start with default parameters, then adjust sensitivity
- Use `gget diamond` with `--threads` for faster local alignment
- Save DIAMOND databases with `--diamond_db` for repeated queries
- For multiple sequence alignment, use `-s5/--super5` for large datasets

### Expression and Disease Data
- Gene symbols are case-sensitive in cellxgene (e.g., 'PAX7' vs 'Pax7')
- Run `gget setup` before first use of alphafold, cellxgene, elm, gpt
- For enrichment analysis, use database shortcuts for convenience
- Cache cBioPortal data with `-dd` to avoid repeated downloads

### Structure Prediction
- AlphaFold multimer predictions: use `-mr 20` for higher accuracy
- Use `-r` flag for AMBER relaxation of final structures
- Visualize results in Python with `plot=True`
- Check PDB database first before running AlphaFold predictions

### Error Handling
- Database structures change; update gget regularly: `pip install --upgrade gget`
- Process max ~1000 Ensembl IDs at once with gget info
- For large-scale analyses, implement rate limiting for API queries
- Use virtual environments to avoid dependency conflicts

## Output Formats

### Command-line
- Default: JSON
- CSV: Add `-csv` flag
- FASTA: gget seq, gget mutate
- PDB: gget pdb, gget alphafold
- PNG: gget cbio plot

### Python
- Default: DataFrame or dictionary
- JSON: Add `json=True` parameter
- Save to file: Add `save=True` or specify `out="filename"`
- AnnData: gget cellxgene

## Resources

This skill includes reference documentation for detailed module information:

### references/
- `module_reference.md` - Comprehensive parameter reference for all modules
- `database_info.md` - Information about queried databases and their update frequencies
- `workflows.md` - Extended workflow examples and use cases

For additional help:
- Official documentation: https://pachterlab.github.io/gget/
- GitHub issues: https://github.com/pachterlab/gget/issues
- Citation: Luebbert, L. & Pachter, L. (2023). Efficient querying of genomic reference databases with gget. Bioinformatics. https://doi.org/10.1093/bioinformatics/btac836
