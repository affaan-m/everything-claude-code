---
name: drugbank-database
description: Access and analyze comprehensive drug information from the DrugBank database including drug properties, interactions, targets, pathways, chemical structures, and pharmacology data. This skill should be used when working with pharmaceutical data, drug discovery research, pharmacology studies, drug-drug interaction analysis, target identification, chemical similarity searches, ADMET predictions, or any task requiring detailed drug and drug target information from DrugBank.
license: Unknown
metadata:
    skill-author: K-Dense Inc.
---

# DrugBank Database

## Overview

DrugBank is a comprehensive bioinformatics and cheminformatics database containing detailed information on drugs and drug targets. This skill enables programmatic access to DrugBank data including ~9,591 drug entries (2,037 FDA-approved small molecules, 241 biotech drugs, 96 nutraceuticals, and 6,000+ experimental compounds) with 200+ data fields per entry.

## Core Capabilities

### 1. Data Access and Authentication

Download and access DrugBank data using Python with proper authentication. The skill provides guidance on:

- Installing and configuring the `drugbank-downloader` package
- Managing credentials securely via environment variables or config files
- Downloading specific or latest database versions
- Opening and parsing XML data efficiently
- Working with cached data to optimize performance

**When to use**: Setting up DrugBank access, downloading database updates, initial project configuration.

**Reference**: See `references/data-access.md` for detailed authentication, download procedures, API access, caching strategies, and troubleshooting.

### 2. Drug Information Queries

Extract comprehensive drug information from the database including identifiers, chemical properties, pharmacology, clinical data, and cross-references to external databases.

**Query capabilities**:
- Search by DrugBank ID, name, CAS number, or keywords
- Extract basic drug information (name, type, description, indication)
- Retrieve chemical properties (SMILES, InChI, molecular formula)
- Get pharmacology data (mechanism of action, pharmacodynamics, ADME)
- Access external identifiers (PubChem, ChEMBL, UniProt, KEGG)
- Build searchable drug datasets and export to DataFrames
- Filter drugs by type (small molecule, biotech, nutraceutical)

**When to use**: Retrieving specific drug information, building drug databases, pharmacology research, literature review, drug profiling.

**Reference**: See `references/drug-queries.md` for XML navigation, query functions, data extraction methods, and performance optimization.

### 3. Drug-Drug Interactions Analysis

Analyze drug-drug interactions (DDIs) including mechanism, clinical significance, and interaction networks for pharmacovigilance and clinical decision support.

**Analysis capabilities**:
- Extract all interactions for specific drugs
- Build bidirectional interaction networks
- Classify interactions by severity and mechanism
- Check interactions between drug pairs
- Identify drugs with most interactions
- Analyze polypharmacy regimens for safety
- Create interaction matrices and network graphs
- Perform community detection in interaction networks
- Calculate interaction risk scores

**When to use**: Polypharmacy safety analysis, clinical decision support, drug interaction prediction, pharmacovigilance research, identifying contraindications.

**Reference**: See `references/interactions.md` for interaction extraction, classification methods, network analysis, and clinical applications.

### 4. Drug Targets and Pathways

Access detailed information about drug-protein interactions including targets, enzymes, transporters, carriers, and biological pathways.

**Target analysis capabilities**:
- Extract drug targets with actions (inhibitor, agonist, antagonist)
- Identify metabolic enzymes (CYP450, Phase II enzymes)
- Analyze transporters (uptake, efflux) for ADME studies
- Map drugs to biological pathways (SMPDB)
- Find drugs targeting specific proteins
- Identify drugs with shared targets for repurposing
- Analyze polypharmacology and off-target effects
- Extract Gene Ontology (GO) terms for targets
- Cross-reference with UniProt for protein data

**When to use**: Mechanism of action studies, drug repurposing research, target identification, pathway analysis, predicting off-target effects, understanding drug metabolism.

**Reference**: See `references/targets-pathways.md` for target extraction, pathway analysis, repurposing strategies, CYP450 profiling, and transporter analysis.

### 5. Chemical Properties and Similarity

Perform structure-based analysis including molecular similarity searches, property calculations, substructure searches, and ADMET predictions.

**Chemical analysis capabilities**:
- Extract chemical structures (SMILES, InChI, molecular formula)
- Calculate physicochemical properties (MW, logP, PSA, H-bonds)
- Apply Lipinski's Rule of Five and Veber's rules
- Calculate Tanimoto similarity between molecules
- Generate molecular fingerprints (Morgan, MACCS, topological)
- Perform substructure searches with SMARTS patterns
- Find structurally similar drugs for repurposing
- Create similarity matrices for drug clustering
- Predict oral absorption and BBB permeability
- Analyze chemical space with PCA and clustering
- Export chemical property databases

**When to use**: Structure-activity relationship (SAR) studies, drug similarity searches, QSAR modeling, drug-likeness assessment, ADMET prediction, chemical space exploration.

**Reference**: See `references/chemical-analysis.md` for structure extraction, similarity calculations, fingerprint generation, ADMET predictions, and chemical space analysis.

## Typical Workflows

### Drug Discovery Workflow
1. Use `data-access.md` to download and access latest DrugBank data
2. Use `drug-queries.md` to build searchable drug database
3. Use `chemical-analysis.md` to find similar compounds
4. Use `targets-pathways.md` to identify shared targets
5. Use `interactions.md` to check safety of candidate combinations

### Polypharmacy Safety Analysis
1. Use `drug-queries.md` to look up patient medications
2. Use `interactions.md` to check all pairwise interactions
3. Use `interactions.md` to classify interaction severity
4. Use `interactions.md` to calculate overall risk score
5. Use `targets-pathways.md` to understand interaction mechanisms

### Drug Repurposing Research
1. Use `targets-pathways.md` to find drugs with shared targets
2. Use `chemical-analysis.md` to find structurally similar drugs
3. Use `drug-queries.md` to extract indication and pharmacology data
4. Use `interactions.md` to assess potential combination therapies

### Pharmacology Study
1. Use `drug-queries.md` to extract drug of interest
2. Use `targets-pathways.md` to identify all protein interactions
3. Use `targets-pathways.md` to map to biological pathways
4. Use `chemical-analysis.md` to predict ADMET properties
5. Use `interactions.md` to identify potential contraindications

## Installation Requirements

### Python Packages
```bash
uv pip install drugbank-downloader  # Core access
uv pip install bioversions          # Latest version detection
uv pip install lxml                 # XML parsing optimization
uv pip install pandas               # Data manipulation
uv pip install rdkit                # Chemical informatics (for similarity)
uv pip install networkx             # Network analysis (for interactions)
uv pip install scikit-learn         # ML/clustering (for chemical space)
```

### Account Setup
1. Create free account at go.drugbank.com
2. Accept license agreement (free for academic use)
3. Obtain username and password credentials
4. Configure credentials as documented in `references/data-access.md`

## Data Version and Reproducibility

Always specify the DrugBank version for reproducible research:

```python
from drugbank_downloader import download_drugbank
path = download_drugbank(version='5.1.10')  # Specify exact version
```

Document the version used in publications and analysis scripts.

## Best Practices

1. **Credentials**: Use environment variables or config files, never hardcode
2. **Versioning**: Specify exact database version for reproducibility
3. **Caching**: Cache parsed data to avoid re-downloading and re-parsing
4. **Namespaces**: Handle XML namespaces properly when parsing
5. **Validation**: Validate chemical structures with RDKit before use
6. **Cross-referencing**: Use external identifiers (UniProt, PubChem) for integration
7. **Clinical Context**: Always consider clinical context when interpreting interaction data
8. **License Compliance**: Ensure proper licensing for your use case

## Reference Documentation

All detailed implementation guidance is organized in modular reference files:

- **references/data-access.md**: Authentication, download, parsing, API access, caching
- **references/drug-queries.md**: XML navigation, query methods, data extraction, indexing
- **references/interactions.md**: DDI extraction, classification, network analysis, safety scoring
- **references/targets-pathways.md**: Target/enzyme/transporter extraction, pathway mapping, repurposing
- **references/chemical-analysis.md**: Structure extraction, similarity, fingerprints, ADMET prediction

Load these references as needed based on your specific analysis requirements.

