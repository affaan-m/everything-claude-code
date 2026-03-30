---
name: cosmic-database
description: Access COSMIC cancer mutation database. Query somatic mutations, Cancer Gene Census, mutational signatures, gene fusions, for cancer research and precision oncology. Requires authentication.
license: Unknown
metadata:
    skill-author: K-Dense Inc.
---

# COSMIC Database

## Overview

COSMIC (Catalogue of Somatic Mutations in Cancer) is the world's largest and most comprehensive database for exploring somatic mutations in human cancer. Access COSMIC's extensive collection of cancer genomics data, including millions of mutations across thousands of cancer types, curated gene lists, mutational signatures, and clinical annotations programmatically.

## When to Use This Skill

This skill should be used when:
- Downloading cancer mutation data from COSMIC
- Accessing the Cancer Gene Census for curated cancer gene lists
- Retrieving mutational signature profiles
- Querying structural variants, copy number alterations, or gene fusions
- Analyzing drug resistance mutations
- Working with cancer cell line genomics data
- Integrating cancer mutation data into bioinformatics pipelines
- Researching specific genes or mutations in cancer contexts

## Prerequisites

### Account Registration
COSMIC requires authentication for data downloads:
- **Academic users**: Free access with registration at https://cancer.sanger.ac.uk/cosmic/register
- **Commercial users**: License required (contact QIAGEN)

### Python Requirements
```bash
uv pip install requests pandas
```

## Quick Start

### 1. Basic File Download

Use the `scripts/download_cosmic.py` script to download COSMIC data files:

```python
from scripts.download_cosmic import download_cosmic_file

# Download mutation data
download_cosmic_file(
    email="your_email@institution.edu",
    password="your_password",
    filepath="GRCh38/cosmic/latest/CosmicMutantExport.tsv.gz",
    output_filename="cosmic_mutations.tsv.gz"
)
```

### 2. Command-Line Usage

```bash
# Download using shorthand data type
python scripts/download_cosmic.py user@email.com --data-type mutations

# Download specific file
python scripts/download_cosmic.py user@email.com \
    --filepath GRCh38/cosmic/latest/cancer_gene_census.csv

# Download for specific genome assembly
python scripts/download_cosmic.py user@email.com \
    --data-type gene_census --assembly GRCh37 -o cancer_genes.csv
```

### 3. Working with Downloaded Data

```python
import pandas as pd

# Read mutation data
mutations = pd.read_csv('cosmic_mutations.tsv.gz', sep='\t', compression='gzip')

# Read Cancer Gene Census
gene_census = pd.read_csv('cancer_gene_census.csv')

# Read VCF format
import pysam
vcf = pysam.VariantFile('CosmicCodingMuts.vcf.gz')
```

## Available Data Types

### Core Mutations
Download comprehensive mutation data including point mutations, indels, and genomic annotations.

**Common data types**:
- `mutations` - Complete coding mutations (TSV format)
- `mutations_vcf` - Coding mutations in VCF format
- `sample_info` - Sample metadata and tumor information

```python
# Download all coding mutations
download_cosmic_file(
    email="user@email.com",
    password="password",
    filepath="GRCh38/cosmic/latest/CosmicMutantExport.tsv.gz"
)
```

### Cancer Gene Census
Access the expert-curated list of ~700+ cancer genes with substantial evidence of cancer involvement.

```python
# Download Cancer Gene Census
download_cosmic_file(
    email="user@email.com",
    password="password",
    filepath="GRCh38/cosmic/latest/cancer_gene_census.csv"
)
```

**Use cases**:
- Identifying known cancer genes
- Filtering variants by cancer relevance
- Understanding gene roles (oncogene vs tumor suppressor)
- Target gene selection for research

### Mutational Signatures
Download signature profiles for mutational signature analysis.

```python
# Download signature definitions
download_cosmic_file(
    email="user@email.com",
    password="password",
    filepath="signatures/signatures.tsv"
)
```

**Signature types**:
- Single Base Substitution (SBS) signatures
- Doublet Base Substitution (DBS) signatures
- Insertion/Deletion (ID) signatures

### Structural Variants and Fusions
Access gene fusion data and structural rearrangements.

**Available data types**:
- `structural_variants` - Structural breakpoints
- `fusion_genes` - Gene fusion events

```python
# Download gene fusions
download_cosmic_file(
    email="user@email.com",
    password="password",
    filepath="GRCh38/cosmic/latest/CosmicFusionExport.tsv.gz"
)
```

### Copy Number and Expression
Retrieve copy number alterations and gene expression data.

**Available data types**:
- `copy_number` - Copy number gains/losses
- `gene_expression` - Over/under-expression data

```python
# Download copy number data
download_cosmic_file(
    email="user@email.com",
    password="password",
    filepath="GRCh38/cosmic/latest/CosmicCompleteCNA.tsv.gz"
)
```

### Resistance Mutations
Access drug resistance mutation data with clinical annotations.

```python
# Download resistance mutations
download_cosmic_file(
    email="user@email.com",
    password="password",
    filepath="GRCh38/cosmic/latest/CosmicResistanceMutations.tsv.gz"
)
```

## Working with COSMIC Data

### Genome Assemblies
COSMIC provides data for two reference genomes:
- **GRCh38** (recommended, current standard)
- **GRCh37** (legacy, for older pipelines)

Specify the assembly in file paths:
```python
# GRCh38 (recommended)
filepath="GRCh38/cosmic/latest/CosmicMutantExport.tsv.gz"

# GRCh37 (legacy)
filepath="GRCh37/cosmic/latest/CosmicMutantExport.tsv.gz"
```

### Versioning
- Use `latest` in file paths to always get the most recent release
- COSMIC is updated quarterly (current version: v102, May 2025)
- Specific versions can be used for reproducibility: `v102`, `v101`, etc.

### File Formats
- **TSV/CSV**: Tab/comma-separated, gzip compressed, read with pandas
- **VCF**: Standard variant format, use with pysam, bcftools, or GATK
- All files include headers describing column contents

### Common Analysis Patterns

**Filter mutations by gene**:
```python
import pandas as pd

mutations = pd.read_csv('cosmic_mutations.tsv.gz', sep='\t', compression='gzip')
tp53_mutations = mutations[mutations['Gene name'] == 'TP53']
```

**Identify cancer genes by role**:
```python
gene_census = pd.read_csv('cancer_gene_census.csv')
oncogenes = gene_census[gene_census['Role in Cancer'].str.contains('oncogene', na=False)]
tumor_suppressors = gene_census[gene_census['Role in Cancer'].str.contains('TSG', na=False)]
```

**Extract mutations by cancer type**:
```python
mutations = pd.read_csv('cosmic_mutations.tsv.gz', sep='\t', compression='gzip')
lung_mutations = mutations[mutations['Primary site'] == 'lung']
```

**Work with VCF files**:
```python
import pysam

vcf = pysam.VariantFile('CosmicCodingMuts.vcf.gz')
for record in vcf.fetch('17', 7577000, 7579000):  # TP53 region
    print(record.id, record.ref, record.alts, record.info)
```

## Data Reference

For comprehensive information about COSMIC data structure, available files, and field descriptions, see `references/cosmic_data_reference.md`. This reference includes:

- Complete list of available data types and files
- Detailed field descriptions for each file type
- File format specifications
- Common file paths and naming conventions
- Data update schedule and versioning
- Citation information

Use this reference when:
- Exploring what data is available in COSMIC
- Understanding specific field meanings
- Determining the correct file path for a data type
- Planning analysis workflows with COSMIC data

## Helper Functions

The download script includes helper functions for common operations:

### Get Common File Paths
```python
from scripts.download_cosmic import get_common_file_path

# Get path for mutations file
path = get_common_file_path('mutations', genome_assembly='GRCh38')
# Returns: 'GRCh38/cosmic/latest/CosmicMutantExport.tsv.gz'

# Get path for gene census
path = get_common_file_path('gene_census')
# Returns: 'GRCh38/cosmic/latest/cancer_gene_census.csv'
```

**Available shortcuts**:
- `mutations` - Core coding mutations
- `mutations_vcf` - VCF format mutations
- `gene_census` - Cancer Gene Census
- `resistance_mutations` - Drug resistance data
- `structural_variants` - Structural variants
- `gene_expression` - Expression data
- `copy_number` - Copy number alterations
- `fusion_genes` - Gene fusions
- `signatures` - Mutational signatures
- `sample_info` - Sample metadata

## Troubleshooting

### Authentication Errors
- Verify email and password are correct
- Ensure account is registered at cancer.sanger.ac.uk/cosmic
- Check if commercial license is required for your use case

### File Not Found
- Verify the filepath is correct
- Check that the requested version exists
- Use `latest` for the most recent version
- Confirm genome assembly (GRCh37 vs GRCh38) is correct

### Large File Downloads
- COSMIC files can be several GB in size
- Ensure sufficient disk space
- Download may take several minutes depending on connection
- The script shows download progress for large files

### Commercial Use
- Commercial users must license COSMIC through QIAGEN
- Contact: cosmic-translation@sanger.ac.uk
- Academic access is free but requires registration

## Integration with Other Tools

COSMIC data integrates well with:
- **Variant annotation**: VEP, ANNOVAR, SnpEff
- **Signature analysis**: SigProfiler, deconstructSigs, MuSiCa
- **Cancer genomics**: cBioPortal, OncoKB, CIViC
- **Bioinformatics**: Bioconductor, TCGA analysis tools
- **Data science**: pandas, scikit-learn, PyTorch

## Additional Resources

- **COSMIC Website**: https://cancer.sanger.ac.uk/cosmic
- **Documentation**: https://cancer.sanger.ac.uk/cosmic/help
- **Release Notes**: https://cancer.sanger.ac.uk/cosmic/release_notes
- **Contact**: cosmic@sanger.ac.uk

## Citation

When using COSMIC data, cite:
Tate JG, Bamford S, Jubb HC, et al. COSMIC: the Catalogue Of Somatic Mutations In Cancer. Nucleic Acids Research. 2019;47(D1):D941-D947.

