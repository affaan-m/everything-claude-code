---
name: exploratory-data-analysis
description: Perform comprehensive exploratory data analysis on scientific data files across 200+ file formats. This skill should be used when analyzing any scientific data file to understand its structure, content, quality, and characteristics. Automatically detects file type and generates detailed markdown reports with format-specific analysis, quality metrics, and downstream analysis recommendations. Covers chemistry, bioinformatics, microscopy, spectroscopy, proteomics, metabolomics, and general scientific data formats.
license: MIT license
metadata:
    skill-author: K-Dense Inc.
---

# Exploratory Data Analysis

## Overview

Perform comprehensive exploratory data analysis (EDA) on scientific data files across multiple domains. This skill provides automated file type detection, format-specific analysis, data quality assessment, and generates detailed markdown reports suitable for documentation and downstream analysis planning.

**Key Capabilities:**
- Automatic detection and analysis of 200+ scientific file formats
- Comprehensive format-specific metadata extraction
- Data quality and integrity assessment
- Statistical summaries and distributions
- Visualization recommendations
- Downstream analysis suggestions
- Markdown report generation

## When to Use This Skill

Use this skill when:
- User provides a path to a scientific data file for analysis
- User asks to "explore", "analyze", or "summarize" a data file
- User wants to understand the structure and content of scientific data
- User needs a comprehensive report of a dataset before analysis
- User wants to assess data quality or completeness
- User asks what type of analysis is appropriate for a file

## Supported File Categories

The skill has comprehensive coverage of scientific file formats organized into six major categories:

### 1. Chemistry and Molecular Formats (60+ extensions)
Structure files, computational chemistry outputs, molecular dynamics trajectories, and chemical databases.

**File types include:** `.pdb`, `.cif`, `.mol`, `.mol2`, `.sdf`, `.xyz`, `.smi`, `.gro`, `.log`, `.fchk`, `.cube`, `.dcd`, `.xtc`, `.trr`, `.prmtop`, `.psf`, and more.

**Reference file:** `references/chemistry_molecular_formats.md`

### 2. Bioinformatics and Genomics Formats (50+ extensions)
Sequence data, alignments, annotations, variants, and expression data.

**File types include:** `.fasta`, `.fastq`, `.sam`, `.bam`, `.vcf`, `.bed`, `.gff`, `.gtf`, `.bigwig`, `.h5ad`, `.loom`, `.counts`, `.mtx`, and more.

**Reference file:** `references/bioinformatics_genomics_formats.md`

### 3. Microscopy and Imaging Formats (45+ extensions)
Microscopy images, medical imaging, whole slide imaging, and electron microscopy.

**File types include:** `.tif`, `.nd2`, `.lif`, `.czi`, `.ims`, `.dcm`, `.nii`, `.mrc`, `.dm3`, `.vsi`, `.svs`, `.ome.tiff`, and more.

**Reference file:** `references/microscopy_imaging_formats.md`

### 4. Spectroscopy and Analytical Chemistry Formats (35+ extensions)
NMR, mass spectrometry, IR/Raman, UV-Vis, X-ray, chromatography, and other analytical techniques.

**File types include:** `.fid`, `.mzML`, `.mzXML`, `.raw`, `.mgf`, `.spc`, `.jdx`, `.xy`, `.cif` (crystallography), `.wdf`, and more.

**Reference file:** `references/spectroscopy_analytical_formats.md`

### 5. Proteomics and Metabolomics Formats (30+ extensions)
Mass spec proteomics, metabolomics, lipidomics, and multi-omics data.

**File types include:** `.mzML`, `.pepXML`, `.protXML`, `.mzid`, `.mzTab`, `.sky`, `.mgf`, `.msp`, `.h5ad`, and more.

**Reference file:** `references/proteomics_metabolomics_formats.md`

### 6. General Scientific Data Formats (30+ extensions)
Arrays, tables, hierarchical data, compressed archives, and common scientific formats.

**File types include:** `.npy`, `.npz`, `.csv`, `.xlsx`, `.json`, `.hdf5`, `.zarr`, `.parquet`, `.mat`, `.fits`, `.nc`, `.xml`, and more.

**Reference file:** `references/general_scientific_formats.md`

## Workflow

### Step 1: File Type Detection

When a user provides a file path, first identify the file type:

1. Extract the file extension
2. Look up the extension in the appropriate reference file
3. Identify the file category and format description
4. Load format-specific information

**Example:**
```
User: "Analyze data.fastq"
→ Extension: .fastq
→ Category: bioinformatics_genomics
→ Format: FASTQ Format (sequence data with quality scores)
→ Reference: references/bioinformatics_genomics_formats.md
```

### Step 2: Load Format-Specific Information

Based on the file type, read the corresponding reference file to understand:
- **Typical Data:** What kind of data this format contains
- **Use Cases:** Common applications for this format
- **Python Libraries:** How to read the file in Python
- **EDA Approach:** What analyses are appropriate for this data type

Search the reference file for the specific extension (e.g., search for "### .fastq" in `bioinformatics_genomics_formats.md`).

### Step 3: Perform Data Analysis

Use the `scripts/eda_analyzer.py` script OR implement custom analysis:

**Option A: Use the analyzer script**
```python
# The script automatically:
# 1. Detects file type
# 2. Loads reference information
# 3. Performs format-specific analysis
# 4. Generates markdown report

python scripts/eda_analyzer.py <filepath> [output.md]
```

**Option B: Custom analysis in the conversation**
Based on the format information from the reference file, perform appropriate analysis:

For tabular data (CSV, TSV, Excel):
- Load with pandas
- Check dimensions, data types
- Analyze missing values
- Calculate summary statistics
- Identify outliers
- Check for duplicates

For sequence data (FASTA, FASTQ):
- Count sequences
- Analyze length distributions
- Calculate GC content
- Assess quality scores (FASTQ)

For images (TIFF, ND2, CZI):
- Check dimensions (X, Y, Z, C, T)
- Analyze bit depth and value range
- Extract metadata (channels, timestamps, spatial calibration)
- Calculate intensity statistics

For arrays (NPY, HDF5):
- Check shape and dimensions
- Analyze data type
- Calculate statistical summaries
- Check for missing/invalid values

### Step 4: Generate Comprehensive Report

Create a markdown report with the following sections:

#### Required Sections:
1. **Title and Metadata**
   - Filename and timestamp
   - File size and location

2. **Basic Information**
   - File properties
   - Format identification

3. **File Type Details**
   - Format description from reference
   - Typical data content
   - Common use cases
   - Python libraries for reading

4. **Data Analysis**
   - Structure and dimensions
   - Statistical summaries
   - Quality assessment
   - Data characteristics

5. **Key Findings**
   - Notable patterns
   - Potential issues
   - Quality metrics

6. **Recommendations**
   - Preprocessing steps
   - Appropriate analyses
   - Tools and methods
   - Visualization approaches

#### Template Location
Use `assets/report_template.md` as a guide for report structure.

### Step 5: Save Report

Save the markdown report with a descriptive filename:
- Pattern: `{original_filename}_eda_report.md`
- Example: `experiment_data.fastq` → `experiment_data_eda_report.md`

## Detailed Format References

Each reference file contains comprehensive information for dozens of file types. To find information about a specific format:

1. Identify the category from the extension
2. Read the appropriate reference file
3. Search for the section heading matching the extension (e.g., "### .pdb")
4. Extract the format information

### Reference File Structure

Each format entry includes:
- **Description:** What the format is
- **Typical Data:** What it contains
- **Use Cases:** Common applications
- **Python Libraries:** How to read it (with code examples)
- **EDA Approach:** Specific analyses to perform

**Example lookup:**
```markdown
### .pdb - Protein Data Bank
**Description:** Standard format for 3D structures of biological macromolecules
**Typical Data:** Atomic coordinates, residue information, secondary structure
**Use Cases:** Protein structure analysis, molecular visualization, docking
**Python Libraries:**
- `Biopython`: `Bio.PDB`
- `MDAnalysis`: `MDAnalysis.Universe('file.pdb')`
**EDA Approach:**
- Structure validation (bond lengths, angles)
- B-factor distribution
- Missing residues detection
- Ramachandran plots
```

## Best Practices

### Reading Reference Files

Reference files are large (10,000+ words each). To efficiently use them:

1. **Search by extension:** Use grep to find the specific format
   ```python
   import re
   with open('references/chemistry_molecular_formats.md', 'r') as f:
       content = f.read()
       pattern = r'### \.pdb[^#]*?(?=###|\Z)'
       match = re.search(pattern, content, re.IGNORECASE | re.DOTALL)
   ```

2. **Extract relevant sections:** Don't load entire reference files into context unnecessarily

3. **Cache format info:** If analyzing multiple files of the same type, reuse the format information

### Data Analysis

1. **Sample large files:** For files with millions of records, analyze a representative sample
2. **Handle errors gracefully:** Many scientific formats require specific libraries; provide clear installation instructions
3. **Validate metadata:** Cross-check metadata consistency (e.g., stated dimensions vs actual data)
4. **Consider data provenance:** Note instrument, software versions, processing steps

### Report Generation

1. **Be comprehensive:** Include all relevant information for downstream analysis
2. **Be specific:** Provide concrete recommendations based on the file type
3. **Be actionable:** Suggest specific next steps and tools
4. **Include code examples:** Show how to load and work with the data

## Examples

### Example 1: Analyzing a FASTQ file

```python
# User provides: "Analyze reads.fastq"

# 1. Detect file type
extension = '.fastq'
category = 'bioinformatics_genomics'

# 2. Read reference info
# Search references/bioinformatics_genomics_formats.md for "### .fastq"

# 3. Perform analysis
from Bio import SeqIO
sequences = list(SeqIO.parse('reads.fastq', 'fastq'))
# Calculate: read count, length distribution, quality scores, GC content

# 4. Generate report
# Include: format description, analysis results, QC recommendations

# 5. Save as: reads_eda_report.md
```

### Example 2: Analyzing a CSV dataset

```python
# User provides: "Explore experiment_results.csv"

# 1. Detect: .csv → general_scientific

# 2. Load reference for CSV format

# 3. Analyze
import pandas as pd
df = pd.read_csv('experiment_results.csv')
# Dimensions, dtypes, missing values, statistics, correlations

# 4. Generate report with:
# - Data structure
# - Missing value patterns
# - Statistical summaries
# - Correlation matrix
# - Outlier detection results

# 5. Save report
```

### Example 3: Analyzing microscopy data

```python
# User provides: "Analyze cells.nd2"

# 1. Detect: .nd2 → microscopy_imaging (Nikon format)

# 2. Read reference for ND2 format
# Learn: multi-dimensional (XYZCT), requires nd2reader

# 3. Analyze
from nd2reader import ND2Reader
with ND2Reader('cells.nd2') as images:
    # Extract: dimensions, channels, timepoints, metadata
    # Calculate: intensity statistics, frame info

# 4. Generate report with:
# - Image dimensions (XY, Z-stacks, time, channels)
# - Channel wavelengths
# - Pixel size and calibration
# - Recommendations for image analysis

# 5. Save report
```

## Troubleshooting

### Missing Libraries

Many scientific formats require specialized libraries:

**Problem:** Import error when trying to read a file

**Solution:** Provide clear installation instructions
```python
try:
    from Bio import SeqIO
except ImportError:
    print("Install Biopython: uv pip install biopython")
```

Common requirements by category:
- **Bioinformatics:** `biopython`, `pysam`, `pyBigWig`
- **Chemistry:** `rdkit`, `mdanalysis`, `cclib`
- **Microscopy:** `tifffile`, `nd2reader`, `aicsimageio`, `pydicom`
- **Spectroscopy:** `nmrglue`, `pymzml`, `pyteomics`
- **General:** `pandas`, `numpy`, `h5py`, `scipy`

### Unknown File Types

If a file extension is not in the references:

1. Ask the user about the file format
2. Check if it's a vendor-specific variant
3. Attempt generic analysis based on file structure (text vs binary)
4. Provide general recommendations

### Large Files

For very large files:

1. Use sampling strategies (first N records)
2. Use memory-mapped access (for HDF5, NPY)
3. Process in chunks (for CSV, FASTQ)
4. Provide estimates based on samples

## Script Usage

The `scripts/eda_analyzer.py` can be used directly:

```bash
# Basic usage
python scripts/eda_analyzer.py data.csv

# Specify output file
python scripts/eda_analyzer.py data.csv output_report.md

# The script will:
# 1. Auto-detect file type
# 2. Load format references
# 3. Perform appropriate analysis
# 4. Generate markdown report
```

The script supports automatic analysis for many common formats, but custom analysis in the conversation provides more flexibility and domain-specific insights.

## Advanced Usage

### Multi-File Analysis

When analyzing multiple related files:
1. Perform individual EDA on each file
2. Create a summary comparison report
3. Identify relationships and dependencies
4. Suggest integration strategies

### Quality Control

For data quality assessment:
1. Check format compliance
2. Validate metadata consistency
3. Assess completeness
4. Identify outliers and anomalies
5. Compare to expected ranges/distributions

### Preprocessing Recommendations

Based on data characteristics, recommend:
1. Normalization strategies
2. Missing value imputation
3. Outlier handling
4. Batch correction
5. Format conversions

## Resources

### scripts/
- `eda_analyzer.py`: Comprehensive analysis script that can be run directly or imported

### references/
- `chemistry_molecular_formats.md`: 60+ chemistry/molecular file formats
- `bioinformatics_genomics_formats.md`: 50+ bioinformatics formats
- `microscopy_imaging_formats.md`: 45+ imaging formats
- `spectroscopy_analytical_formats.md`: 35+ spectroscopy formats
- `proteomics_metabolomics_formats.md`: 30+ omics formats
- `general_scientific_formats.md`: 30+ general formats

### assets/
- `report_template.md`: Comprehensive markdown template for EDA reports

