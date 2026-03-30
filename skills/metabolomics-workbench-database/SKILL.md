---
name: metabolomics-workbench-database
description: Access NIH Metabolomics Workbench via REST API (4,200+ studies). Query metabolites, RefMet nomenclature, MS/NMR data, m/z searches, study metadata, for metabolomics and biomarker discovery.
license: Unknown
metadata:
    skill-author: K-Dense Inc.
---

# Metabolomics Workbench Database

## Overview

The Metabolomics Workbench is a comprehensive NIH Common Fund-sponsored platform hosted at UCSD that serves as the primary repository for metabolomics research data. It provides programmatic access to over 4,200 processed studies (3,790+ publicly available), standardized metabolite nomenclature through RefMet, and powerful search capabilities across multiple analytical platforms (GC-MS, LC-MS, NMR).

## When to Use This Skill

This skill should be used when querying metabolite structures, accessing study data, standardizing nomenclature, performing mass spectrometry searches, or retrieving gene/protein-metabolite associations through the Metabolomics Workbench REST API.

## Core Capabilities

### 1. Querying Metabolite Structures and Data

Access comprehensive metabolite information including structures, identifiers, and cross-references to external databases.

**Key operations:**
- Retrieve compound data by various identifiers (PubChem CID, InChI Key, KEGG ID, HMDB ID, etc.)
- Download molecular structures as MOL files or PNG images
- Access standardized compound classifications
- Cross-reference between different metabolite databases

**Example queries:**
```python
import requests

# Get compound information by PubChem CID
response = requests.get('https://www.metabolomicsworkbench.org/rest/compound/pubchem_cid/5281365/all/json')

# Download molecular structure as PNG
response = requests.get('https://www.metabolomicsworkbench.org/rest/compound/regno/11/png')

# Get compound name by registry number
response = requests.get('https://www.metabolomicsworkbench.org/rest/compound/regno/11/name/json')
```

### 2. Accessing Study Metadata and Experimental Results

Query metabolomics studies by various criteria and retrieve complete experimental datasets.

**Key operations:**
- Search studies by metabolite, institute, investigator, or title
- Access study summaries, experimental factors, and analysis details
- Retrieve complete experimental data in various formats
- Download mwTab format files for complete study information
- Query untargeted metabolomics data

**Example queries:**
```python
# List all available public studies
response = requests.get('https://www.metabolomicsworkbench.org/rest/study/study_id/ST/available/json')

# Get study summary
response = requests.get('https://www.metabolomicsworkbench.org/rest/study/study_id/ST000001/summary/json')

# Retrieve experimental data
response = requests.get('https://www.metabolomicsworkbench.org/rest/study/study_id/ST000001/data/json')

# Find studies containing a specific metabolite
response = requests.get('https://www.metabolomicsworkbench.org/rest/study/refmet_name/Tyrosine/summary/json')
```

### 3. Standardizing Metabolite Nomenclature with RefMet

Use the RefMet database to standardize metabolite names and access systematic classification across four structural resolution levels.

**Key operations:**
- Match common metabolite names to standardized RefMet names
- Query by chemical formula, exact mass, or InChI Key
- Access hierarchical classification (super class, main class, sub class)
- Retrieve all RefMet entries or filter by classification

**Example queries:**
```python
# Standardize a metabolite name
response = requests.get('https://www.metabolomicsworkbench.org/rest/refmet/match/citrate/name/json')

# Query by molecular formula
response = requests.get('https://www.metabolomicsworkbench.org/rest/refmet/formula/C12H24O2/all/json')

# Get all metabolites in a specific class
response = requests.get('https://www.metabolomicsworkbench.org/rest/refmet/main_class/Fatty%20Acids/all/json')

# Retrieve complete RefMet database
response = requests.get('https://www.metabolomicsworkbench.org/rest/refmet/all/json')
```

### 4. Performing Mass Spectrometry Searches

Search for compounds by mass-to-charge ratio (m/z) with specified ion adducts and tolerance levels.

**Key operations:**
- Search precursor ion masses across multiple databases (Metabolomics Workbench, LIPIDS, RefMet)
- Specify ion adduct types (M+H, M-H, M+Na, M+NH4, M+2H, etc.)
- Calculate exact masses for known metabolites with specific adducts
- Set mass tolerance for flexible matching

**Example queries:**
```python
# Search by m/z value with M+H adduct
response = requests.get('https://www.metabolomicsworkbench.org/rest/moverz/MB/635.52/M+H/0.5/json')

# Calculate exact mass for a metabolite with specific adduct
response = requests.get('https://www.metabolomicsworkbench.org/rest/moverz/exactmass/PC(34:1)/M+H/json')

# Search across RefMet database
response = requests.get('https://www.metabolomicsworkbench.org/rest/moverz/REFMET/200.15/M-H/0.3/json')
```

### 5. Filtering Studies by Analytical and Biological Parameters

Use the MetStat context to find studies matching specific experimental conditions.

**Key operations:**
- Filter by analytical method (LCMS, GCMS, NMR)
- Specify ionization polarity (POSITIVE, NEGATIVE)
- Filter by chromatography type (HILIC, RP, GC)
- Target specific species, sample sources, or diseases
- Combine multiple filters using semicolon-delimited format

**Example queries:**
```python
# Find human blood studies on diabetes using LC-MS
response = requests.get('https://www.metabolomicsworkbench.org/rest/metstat/LCMS;POSITIVE;HILIC;Human;Blood;Diabetes/json')

# Find all human blood studies containing tyrosine
response = requests.get('https://www.metabolomicsworkbench.org/rest/metstat/;;;Human;Blood;;;Tyrosine/json')

# Filter by analytical method only
response = requests.get('https://www.metabolomicsworkbench.org/rest/metstat/GCMS;;;;;;/json')
```

### 6. Accessing Gene and Protein Information

Retrieve gene and protein data associated with metabolic pathways and metabolite metabolism.

**Key operations:**
- Query genes by symbol, name, or ID
- Access protein sequences and annotations
- Cross-reference between gene IDs, RefSeq IDs, and UniProt IDs
- Retrieve gene-metabolite associations

**Example queries:**
```python
# Get gene information by symbol
response = requests.get('https://www.metabolomicsworkbench.org/rest/gene/gene_symbol/ACACA/all/json')

# Retrieve protein data by UniProt ID
response = requests.get('https://www.metabolomicsworkbench.org/rest/protein/uniprot_id/Q13085/all/json')
```

## Common Workflows

### Workflow 1: Finding Studies for a Specific Metabolite

To find all studies containing measurements of a specific metabolite:

1. First standardize the metabolite name using RefMet:
   ```python
   response = requests.get('https://www.metabolomicsworkbench.org/rest/refmet/match/glucose/name/json')
   ```

2. Use the standardized name to search for studies:
   ```python
   response = requests.get('https://www.metabolomicsworkbench.org/rest/study/refmet_name/Glucose/summary/json')
   ```

3. Retrieve experimental data from specific studies:
   ```python
   response = requests.get('https://www.metabolomicsworkbench.org/rest/study/study_id/ST000001/data/json')
   ```

### Workflow 2: Identifying Compounds from MS Data

To identify potential compounds from mass spectrometry m/z values:

1. Perform m/z search with appropriate adduct and tolerance:
   ```python
   response = requests.get('https://www.metabolomicsworkbench.org/rest/moverz/MB/180.06/M+H/0.5/json')
   ```

2. Review candidate compounds from results

3. Retrieve detailed information for candidate compounds:
   ```python
   response = requests.get('https://www.metabolomicsworkbench.org/rest/compound/regno/{regno}/all/json')
   ```

4. Download structures for confirmation:
   ```python
   response = requests.get('https://www.metabolomicsworkbench.org/rest/compound/regno/{regno}/png')
   ```

### Workflow 3: Exploring Disease-Specific Metabolomics

To find metabolomics studies for a specific disease and analytical platform:

1. Use MetStat to filter studies:
   ```python
   response = requests.get('https://www.metabolomicsworkbench.org/rest/metstat/LCMS;POSITIVE;;Human;;Cancer/json')
   ```

2. Review study IDs from results

3. Access detailed study information:
   ```python
   response = requests.get('https://www.metabolomicsworkbench.org/rest/study/study_id/ST{ID}/summary/json')
   ```

4. Retrieve complete experimental data:
   ```python
   response = requests.get('https://www.metabolomicsworkbench.org/rest/study/study_id/ST{ID}/data/json')
   ```

## Output Formats

The API supports two primary output formats:
- **JSON** (default): Machine-readable format, ideal for programmatic access
- **TXT**: Human-readable tab-delimited text format

Specify format by appending `/json` or `/txt` to API URLs. When format is omitted, JSON is returned by default.

## Best Practices

1. **Use RefMet for standardization**: Always standardize metabolite names through RefMet before searching studies to ensure consistent nomenclature

2. **Specify appropriate adducts**: When performing m/z searches, use the correct ion adduct type for your analytical method (e.g., M+H for positive mode ESI)

3. **Set reasonable tolerances**: Use appropriate mass tolerance values (typically 0.5 Da for low-resolution, 0.01 Da for high-resolution MS)

4. **Cache reference data**: Consider caching frequently used reference data (RefMet database, compound information) to minimize API calls

5. **Handle pagination**: For large result sets, be prepared to handle multiple data structures in responses

6. **Validate identifiers**: Cross-reference metabolite identifiers across multiple databases when possible to ensure correct compound identification

## Resources

### references/

Detailed API reference documentation is available in `references/api_reference.md`, including:
- Complete REST API endpoint specifications
- All available contexts (compound, study, refmet, metstat, gene, protein, moverz)
- Input/output parameter details
- Ion adduct types for mass spectrometry
- Additional query examples

Load this reference file when detailed API specifications are needed or when working with less common endpoints.

