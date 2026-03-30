---
name: hmdb-database
description: Access Human Metabolome Database (220K+ metabolites). Search by name/ID/structure, retrieve chemical properties, biomarker data, NMR/MS spectra, pathways, for metabolomics and identification.
license: HMDB is offered to the public as a freely available resource. Use and re-distribution of the data, in whole or in part, for commercial purposes requires explicit permission of the authors and explicit acknowledgment of the source material (HMDB) and the original publication (see the HMDB citing page). We ask that users who download significant portions of the database cite the HMDB paper in any resulting publications.
metadata:
    skill-author: K-Dense Inc.
---

# HMDB Database

## Overview

The Human Metabolome Database (HMDB) is a comprehensive, freely available resource containing detailed information about small molecule metabolites found in the human body.

## When to Use This Skill

This skill should be used when performing metabolomics research, clinical chemistry, biomarker discovery, or metabolite identification tasks.

## Database Contents

HMDB version 5.0 (current as of 2025) contains:

- **220,945 metabolite entries** covering both water-soluble and lipid-soluble compounds
- **8,610 protein sequences** for enzymes and transporters involved in metabolism
- **130+ data fields per metabolite** including:
  - Chemical properties (structure, formula, molecular weight, InChI, SMILES)
  - Clinical data (biomarker associations, diseases, normal/abnormal concentrations)
  - Biological information (pathways, reactions, locations)
  - Spectroscopic data (NMR, MS, MS-MS spectra)
  - External database links (KEGG, PubChem, MetaCyc, ChEBI, PDB, UniProt, GenBank)

## Core Capabilities

### 1. Web-Based Metabolite Searches

Access HMDB through the web interface at https://www.hmdb.ca/ for:

**Text Searches:**
- Search by metabolite name, synonym, or identifier (HMDB ID)
- Example HMDB IDs: HMDB0000001, HMDB0001234
- Search by disease associations or pathway involvement
- Query by biological specimen type (urine, serum, CSF, saliva, feces, sweat)

**Structure-Based Searches:**
- Use ChemQuery for structure and substructure searches
- Search by molecular weight or molecular weight range
- Use SMILES or InChI strings to find compounds

**Spectral Searches:**
- LC-MS spectral matching
- GC-MS spectral matching
- NMR spectral searches for metabolite identification

**Advanced Searches:**
- Combine multiple criteria (name, properties, concentration ranges)
- Filter by biological locations or specimen types
- Search by protein/enzyme associations

### 2. Accessing Metabolite Information

When retrieving metabolite data, HMDB provides:

**Chemical Information:**
- Systematic name, traditional names, and synonyms
- Chemical formula and molecular weight
- Structure representations (2D/3D, SMILES, InChI, MOL file)
- Chemical taxonomy and classification

**Biological Context:**
- Metabolic pathways and reactions
- Associated enzymes and transporters
- Subcellular locations
- Biological roles and functions

**Clinical Relevance:**
- Normal concentration ranges in biological fluids
- Biomarker associations with diseases
- Clinical significance
- Toxicity information when applicable

**Analytical Data:**
- Experimental and predicted NMR spectra
- MS and MS-MS spectra
- Retention times and chromatographic data
- Reference peaks for identification

### 3. Downloadable Datasets

HMDB offers bulk data downloads at https://www.hmdb.ca/downloads in multiple formats:

**Available Formats:**
- **XML**: Complete metabolite, protein, and spectra data
- **SDF**: Metabolite structure files for cheminformatics
- **FASTA**: Protein and gene sequences
- **TXT**: Raw spectra peak lists
- **CSV/TSV**: Tabular data exports

**Dataset Categories:**
- All metabolites or filtered by specimen type
- Protein/enzyme sequences
- Experimental and predicted spectra (NMR, GC-MS, MS-MS)
- Pathway information

**Best Practices:**
- Download XML format for comprehensive data including all fields
- Use SDF format for structure-based analysis and cheminformatics workflows
- Parse CSV/TSV formats for integration with data analysis pipelines
- Check version dates to ensure up-to-date data (current: v5.0, 2023-07-01)

**Usage Requirements:**
- Free for academic and non-commercial research
- Commercial use requires explicit permission (contact samackay@ualberta.ca)
- Cite HMDB publication when using data

### 4. Programmatic API Access

**API Availability:**
HMDB does not provide a public REST API. Programmatic access requires contacting the development team:

- **Academic/Research groups:** Contact eponine@ualberta.ca (Eponine) or samackay@ualberta.ca (Scott)
- **Commercial organizations:** Contact samackay@ualberta.ca (Scott) for customized API access

**Alternative Programmatic Access:**
- **R/Bioconductor**: Use the `hmdbQuery` package for R-based queries
  - Install: `BiocManager::install("hmdbQuery")`
  - Provides HTTP-based querying functions
- **Downloaded datasets**: Parse XML or CSV files locally for programmatic analysis
- **Web scraping**: Not recommended; contact team for proper API access instead

### 5. Common Research Workflows

**Metabolite Identification in Untargeted Metabolomics:**
1. Obtain experimental MS or NMR spectra from samples
2. Use HMDB spectral search tools to match against reference spectra
3. Verify candidates by checking molecular weight, retention time, and MS-MS fragmentation
4. Review biological plausibility (expected in specimen type, known pathways)

**Biomarker Discovery:**
1. Search HMDB for metabolites associated with disease of interest
2. Review concentration ranges in normal vs. disease states
3. Identify metabolites with strong differential abundance
4. Examine pathway context and biological mechanisms
5. Cross-reference with literature via PubMed links

**Pathway Analysis:**
1. Identify metabolites of interest from experimental data
2. Look up HMDB entries for each metabolite
3. Extract pathway associations and enzymatic reactions
4. Use linked SMPDB (Small Molecule Pathway Database) for pathway diagrams
5. Identify pathway enrichment for biological interpretation

**Database Integration:**
1. Download HMDB data in XML or CSV format
2. Parse and extract relevant fields for local database
3. Link with external IDs (KEGG, PubChem, ChEBI) for cross-database queries
4. Build local tools or pipelines incorporating HMDB reference data

## Related HMDB Resources

The HMDB ecosystem includes related databases:

- **DrugBank**: ~2,832 drug compounds with pharmaceutical information
- **T3DB (Toxin and Toxin Target Database)**: ~3,670 toxic compounds
- **SMPDB (Small Molecule Pathway Database)**: Pathway diagrams and maps
- **FooDB**: ~70,000 food component compounds

These databases share similar structure and identifiers, enabling integrated queries across human metabolome, drug, toxin, and food databases.

## Best Practices

**Data Quality:**
- Verify metabolite identifications with multiple evidence types (spectra, structure, properties)
- Check experimental vs. predicted data quality indicators
- Review citations and evidence for biomarker associations

**Version Tracking:**
- Note HMDB version used in research (current: v5.0)
- Databases are updated periodically with new entries and corrections
- Re-query for updates when publishing to ensure current information

**Citation:**
- Always cite HMDB in publications using the database
- Reference specific HMDB IDs when discussing metabolites
- Acknowledge data sources for downloaded datasets

**Performance:**
- For large-scale analysis, download complete datasets rather than repeated web queries
- Use appropriate file formats (XML for comprehensive data, CSV for tabular analysis)
- Consider local caching of frequently accessed metabolite information

## Reference Documentation

See `references/hmdb_data_fields.md` for detailed information about available data fields and their meanings.

