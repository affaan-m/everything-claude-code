# COSMIC Database Reference

## Overview

COSMIC (Catalogue of Somatic Mutations in Cancer) is the world's largest and most comprehensive resource for exploring the impact of somatic mutations in human cancer. Maintained by the Wellcome Sanger Institute, it catalogs millions of mutations across thousands of cancer types.

**Website**: https://cancer.sanger.ac.uk/cosmic
**Release Schedule**: Quarterly updates
**Current Version**: v102 (May 2025), use "latest" in API calls for most recent

## Data Access

### Authentication
- **Academic users**: Free access (registration required)
- **Commercial users**: License required (contact QIAGEN)
- **Registration**: https://cancer.sanger.ac.uk/cosmic/register

### Download Methods
1. **Web Browser**: Interactive search at https://cancer.sanger.ac.uk/cosmic
2. **File Downloads**: Programmatic access via download API
3. **Data Files**: TSV, CSV, and VCF formats

## Available Data Types

### 1. Core Mutation Data
**Main Files**:
- `CosmicMutantExport.tsv.gz` - Complete coding mutations
- `CosmicCodingMuts.vcf.gz` - Mutations in VCF format
- `CosmicNonCodingVariants.vcf.gz` - Non-coding variants
- `CosmicMutantExportCensus.tsv.gz` - Mutations in Cancer Gene Census genes only

**Content**:
- Point mutations (SNVs)
- Small insertions and deletions (indels)
- Genomic coordinates
- Variant annotations
- Sample information
- Tumor type associations

### 2. Cancer Gene Census
**File**: `cancer_gene_census.csv`

**Content**:
- Expert-curated list of cancer genes
- ~700+ genes with substantial evidence of involvement in cancer
- Gene roles (oncogene, tumor suppressor, fusion)
- Mutation types
- Tissue associations
- Molecular genetics information

### 3. Mutational Signatures
**Files**: Available in `signatures/` directory
- `signatures.tsv` - Signature definitions
- Single Base Substitution (SBS) signatures
- Doublet Base Substitution (DBS) signatures
- Insertion/Deletion (ID) signatures

**Current Version**: v3.4 (released in COSMIC v98)

**Content**:
- Signature profiles (96-channel, 78-channel, 83-channel)
- Etiology annotations
- Reference signatures for signature analysis

### 4. Structural Variants
**File**: `CosmicStructExport.tsv.gz`

**Content**:
- Gene fusions
- Structural breakpoints
- Translocation events
- Large deletions/insertions
- Complex rearrangements

### 5. Copy Number Variations
**File**: `CosmicCompleteCNA.tsv.gz`

**Content**:
- Copy number gains and losses
- Amplifications and deletions
- Segment-level data
- Gene-level annotations

### 6. Gene Expression
**File**: `CosmicCompleteGeneExpression.tsv.gz`

**Content**:
- Over/under-expression data
- Gene expression Z-scores
- Tissue-specific expression patterns

### 7. Resistance Mutations
**File**: `CosmicResistanceMutations.tsv.gz`

**Content**:
- Drug resistance mutations
- Treatment associations
- Clinical relevance

### 8. Cell Lines Project
**Files**: Various cell line-specific files

**Content**:
- Mutations in cancer cell lines
- Copy number data for cell lines
- Fusion genes in cell lines
- Microsatellite instability status

### 9. Sample Information
**File**: `CosmicSample.tsv.gz`

**Content**:
- Sample metadata
- Tumor site/histology
- Sample sources
- Study references

## Genome Assemblies

All genomic data is available for two reference genomes:
- **GRCh37** (hg19) - Legacy assembly
- **GRCh38** (hg38) - Current assembly (recommended)

File paths use the pattern: `{assembly}/cosmic/{version}/{filename}`

## File Formats

### TSV/CSV Format
- Tab or comma-separated values
- Column headers included
- Gzip compressed (.gz)
- Can be read with pandas, awk, or standard tools

### VCF Format
- Standard Variant Call Format
- Version 4.x specification
- Includes INFO fields with COSMIC annotations
- Gzip compressed and indexed (.vcf.gz, .vcf.gz.tbi)

## Common File Paths

Using `latest` for the most recent version:

```
# Coding mutations (TSV)
GRCh38/cosmic/latest/CosmicMutantExport.tsv.gz

# Coding mutations (VCF)
GRCh38/cosmic/latest/VCF/CosmicCodingMuts.vcf.gz

# Cancer Gene Census
GRCh38/cosmic/latest/cancer_gene_census.csv

# Structural variants
GRCh38/cosmic/latest/CosmicStructExport.tsv.gz

# Copy number alterations
GRCh38/cosmic/latest/CosmicCompleteCNA.tsv.gz

# Gene fusions
GRCh38/cosmic/latest/CosmicFusionExport.tsv.gz

# Gene expression
GRCh38/cosmic/latest/CosmicCompleteGeneExpression.tsv.gz

# Resistance mutations
GRCh38/cosmic/latest/CosmicResistanceMutations.tsv.gz

# Mutational signatures
signatures/signatures.tsv

# Sample information
GRCh38/cosmic/latest/CosmicSample.tsv.gz
```

## Key Data Fields

### Mutation Data Fields
- **Gene name** - HGNC gene symbol
- **Accession Number** - Transcript identifier
- **COSMIC ID** - Unique mutation identifier
- **CDS mutation** - Coding sequence change
- **AA mutation** - Amino acid change
- **Primary site** - Anatomical tumor location
- **Primary histology** - Tumor type classification
- **Genomic coordinates** - Chromosome, position, strand
- **Mutation type** - Substitution, insertion, deletion, etc.
- **Zygosity** - Heterozygous/homozygous status
- **Pubmed ID** - Literature references

### Cancer Gene Census Fields
- **Gene Symbol** - Official gene name
- **Entrez GeneId** - NCBI gene identifier
- **Role in Cancer** - Oncogene, TSG, fusion
- **Mutation Types** - Types of alterations observed
- **Translocation Partner** - For fusion genes
- **Tier** - Evidence classification (1 or 2)
- **Hallmark** - Cancer hallmark associations
- **Somatic** - Whether somatic mutations are documented
- **Germline** - Whether germline mutations are documented

## Data Updates

COSMIC is updated quarterly with new releases. Each release includes:
- New mutation data from literature and databases
- Updated Cancer Gene Census annotations
- Revised mutational signatures if applicable
- Enhanced sample annotations

## Citation

When using COSMIC data, cite:
Tate JG, Bamford S, Jubb HC, et al. COSMIC: the Catalogue Of Somatic Mutations In Cancer. Nucleic Acids Research. 2019;47(D1):D941-D947.

## Additional Resources

- **Documentation**: https://cancer.sanger.ac.uk/cosmic/help
- **Release Notes**: https://cancer.sanger.ac.uk/cosmic/release_notes
- **Contact**: cosmic@sanger.ac.uk
- **Licensing**: cosmic-translation@sanger.ac.uk
