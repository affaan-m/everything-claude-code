---
name: clinvar-database
description: Query NCBI ClinVar for variant clinical significance. Search by gene/position, interpret pathogenicity classifications, access via E-utilities API or FTP, annotate VCFs, for genomic medicine.
license: Unknown
metadata:
    skill-author: K-Dense Inc.
---

# ClinVar Database

## Overview

ClinVar is NCBI's freely accessible archive of reports on relationships between human genetic variants and phenotypes, with supporting evidence. The database aggregates information about genomic variation and its relationship to human health, providing standardized variant classifications used in clinical genetics and research.

## When to Use This Skill

This skill should be used when:

- Searching for variants by gene, condition, or clinical significance
- Interpreting clinical significance classifications (pathogenic, benign, VUS)
- Accessing ClinVar data programmatically via E-utilities API
- Downloading and processing bulk data from FTP
- Understanding review status and star ratings
- Resolving conflicting variant interpretations
- Annotating variant call sets with clinical significance

## Core Capabilities

### 1. Search and Query ClinVar

#### Web Interface Queries

Search ClinVar using the web interface at https://www.ncbi.nlm.nih.gov/clinvar/

**Common search patterns:**
- By gene: `BRCA1[gene]`
- By clinical significance: `pathogenic[CLNSIG]`
- By condition: `breast cancer[disorder]`
- By variant: `NM_000059.3:c.1310_1313del[variant name]`
- By chromosome: `13[chr]`
- Combined: `BRCA1[gene] AND pathogenic[CLNSIG]`

#### Programmatic Access via E-utilities

Access ClinVar programmatically using NCBI's E-utilities API. Refer to `references/api_reference.md` for comprehensive API documentation including:
- **esearch** - Search for variants matching criteria
- **esummary** - Retrieve variant summaries
- **efetch** - Download full XML records
- **elink** - Find related records in other NCBI databases

**Quick example using curl:**
```bash
# Search for pathogenic BRCA1 variants
curl "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=clinvar&term=BRCA1[gene]+AND+pathogenic[CLNSIG]&retmode=json"
```

**Best practices:**
- Test queries on the web interface before automating
- Use API keys to increase rate limits from 3 to 10 requests/second
- Implement exponential backoff for rate limit errors
- Set `Entrez.email` when using Biopython

### 2. Interpret Clinical Significance

#### Understanding Classifications

ClinVar uses standardized terminology for variant classifications. Refer to `references/clinical_significance.md` for detailed interpretation guidelines.

**Key germline classification terms (ACMG/AMP):**
- **Pathogenic (P)** - Variant causes disease (~99% probability)
- **Likely Pathogenic (LP)** - Variant likely causes disease (~90% probability)
- **Uncertain Significance (VUS)** - Insufficient evidence to classify
- **Likely Benign (LB)** - Variant likely does not cause disease
- **Benign (B)** - Variant does not cause disease

**Review status (star ratings):**
- ★★★★ Practice guideline - Highest confidence
- ★★★ Expert panel review (e.g., ClinGen) - High confidence
- ★★ Multiple submitters, no conflicts - Moderate confidence
- ★ Single submitter with criteria - Standard weight
- ☆ No assertion criteria - Low confidence

**Critical considerations:**
- Always check review status - prefer ★★★ or ★★★★ ratings
- Conflicting interpretations require manual evaluation
- Classifications may change as new evidence emerges
- VUS (uncertain significance) variants lack sufficient evidence for clinical use

### 3. Download Bulk Data from FTP

#### Access ClinVar FTP Site

Download complete datasets from `ftp://ftp.ncbi.nlm.nih.gov/pub/clinvar/`

Refer to `references/data_formats.md` for comprehensive documentation on file formats and processing.

**Update schedule:**
- Monthly releases: First Thursday of each month (complete dataset, archived)
- Weekly updates: Every Monday (incremental updates)

#### Available Formats

**XML files** (most comprehensive):
- VCV (Variation) files: `xml/clinvar_variation/` - Variant-centric aggregation
- RCV (Record) files: `xml/RCV/` - Variant-condition pairs
- Include full submission details, evidence, and metadata

**VCF files** (for genomic pipelines):
- GRCh37: `vcf_GRCh37/clinvar.vcf.gz`
- GRCh38: `vcf_GRCh38/clinvar.vcf.gz`
- Limitations: Excludes variants >10kb and complex structural variants

**Tab-delimited files** (for quick analysis):
- `tab_delimited/variant_summary.txt.gz` - Summary of all variants
- `tab_delimited/var_citations.txt.gz` - PubMed citations
- `tab_delimited/cross_references.txt.gz` - Database cross-references

**Example download:**
```bash
# Download latest monthly XML release
wget ftp://ftp.ncbi.nlm.nih.gov/pub/clinvar/xml/clinvar_variation/ClinVarVariationRelease_00-latest.xml.gz

# Download VCF for GRCh38
wget ftp://ftp.ncbi.nlm.nih.gov/pub/clinvar/vcf_GRCh38/clinvar.vcf.gz
```

### 4. Process and Analyze ClinVar Data

#### Working with XML Files

Process XML files to extract variant details, classifications, and evidence.

**Python example with xml.etree:**
```python
import gzip
import xml.etree.ElementTree as ET

with gzip.open('ClinVarVariationRelease.xml.gz', 'rt') as f:
    for event, elem in ET.iterparse(f, events=('end',)):
        if elem.tag == 'VariationArchive':
            variation_id = elem.attrib.get('VariationID')
            # Extract clinical significance, review status, etc.
            elem.clear()  # Free memory
```

#### Working with VCF Files

Annotate variant calls or filter by clinical significance using bcftools or Python.

**Using bcftools:**
```bash
# Filter pathogenic variants
bcftools view -i 'INFO/CLNSIG~"Pathogenic"' clinvar.vcf.gz

# Extract specific genes
bcftools view -i 'INFO/GENEINFO~"BRCA"' clinvar.vcf.gz

# Annotate your VCF with ClinVar
bcftools annotate -a clinvar.vcf.gz -c INFO your_variants.vcf
```

**Using PyVCF in Python:**
```python
import vcf

vcf_reader = vcf.Reader(filename='clinvar.vcf.gz')
for record in vcf_reader:
    clnsig = record.INFO.get('CLNSIG', [])
    if 'Pathogenic' in clnsig:
        gene = record.INFO.get('GENEINFO', [''])[0]
        print(f"{record.CHROM}:{record.POS} {gene} - {clnsig}")
```

#### Working with Tab-Delimited Files

Use pandas or command-line tools for rapid filtering and analysis.

**Using pandas:**
```python
import pandas as pd

# Load variant summary
df = pd.read_csv('variant_summary.txt.gz', sep='\t', compression='gzip')

# Filter pathogenic variants in specific gene
pathogenic_brca = df[
    (df['GeneSymbol'] == 'BRCA1') &
    (df['ClinicalSignificance'].str.contains('Pathogenic', na=False))
]

# Count variants by clinical significance
sig_counts = df['ClinicalSignificance'].value_counts()
```

**Using command-line tools:**
```bash
# Extract pathogenic variants for specific gene
zcat variant_summary.txt.gz | \
  awk -F'\t' '$7=="TP53" && $13~"Pathogenic"' | \
  cut -f1,5,7,13,14
```

### 5. Handle Conflicting Interpretations

When multiple submitters provide different classifications for the same variant, ClinVar reports "Conflicting interpretations of pathogenicity."

**Resolution strategy:**
1. Check review status (star rating) - higher ratings carry more weight
2. Examine evidence and assertion criteria from each submitter
3. Consider submission dates - newer submissions may reflect updated evidence
4. Review population frequency data (e.g., gnomAD) for context
5. Consult expert panel classifications (★★★) when available
6. For clinical use, always defer to a genetics professional

**Search query to exclude conflicts:**
```
TP53[gene] AND pathogenic[CLNSIG] NOT conflicting[RVSTAT]
```

### 6. Track Classification Updates

Variant classifications may change over time as new evidence emerges.

**Why classifications change:**
- New functional studies or clinical data
- Updated population frequency information
- Revised ACMG/AMP guidelines
- Segregation data from additional families

**Best practices:**
- Document ClinVar version and access date for reproducibility
- Re-check classifications periodically for critical variants
- Subscribe to ClinVar mailing list for major updates
- Use monthly archived releases for stable datasets

### 7. Submit Data to ClinVar

Organizations can submit variant interpretations to ClinVar.

**Submission methods:**
- Web submission portal: https://submit.ncbi.nlm.nih.gov/subs/clinvar/
- API submission (requires service account): See `references/api_reference.md`
- Batch submission via Excel templates

**Requirements:**
- Organizational account with NCBI
- Assertion criteria (preferably ACMG/AMP guidelines)
- Supporting evidence for classification

Contact: clinvar@ncbi.nlm.nih.gov for submission account setup.

## Workflow Examples

### Example 1: Identify High-Confidence Pathogenic Variants in a Gene

**Objective:** Find pathogenic variants in CFTR gene with expert panel review.

**Steps:**
1. Search using web interface or E-utilities:
   ```
   CFTR[gene] AND pathogenic[CLNSIG] AND (reviewed by expert panel[RVSTAT] OR practice guideline[RVSTAT])
   ```
2. Review results, noting review status (should be ★★★ or ★★★★)
3. Export variant list or retrieve full records via efetch
4. Cross-reference with clinical presentation if applicable

### Example 2: Annotate VCF with ClinVar Classifications

**Objective:** Add clinical significance annotations to variant calls.

**Steps:**
1. Download appropriate ClinVar VCF (match genome build: GRCh37 or GRCh38):
   ```bash
   wget ftp://ftp.ncbi.nlm.nih.gov/pub/clinvar/vcf_GRCh38/clinvar.vcf.gz
   wget ftp://ftp.ncbi.nlm.nih.gov/pub/clinvar/vcf_GRCh38/clinvar.vcf.gz.tbi
   ```
2. Annotate using bcftools:
   ```bash
   bcftools annotate -a clinvar.vcf.gz \
     -c INFO/CLNSIG,INFO/CLNDN,INFO/CLNREVSTAT \
     -o annotated_variants.vcf \
     your_variants.vcf
   ```
3. Filter annotated VCF for pathogenic variants:
   ```bash
   bcftools view -i 'INFO/CLNSIG~"Pathogenic"' annotated_variants.vcf
   ```

### Example 3: Analyze Variants for a Specific Disease

**Objective:** Study all variants associated with hereditary breast cancer.

**Steps:**
1. Search by condition:
   ```
   hereditary breast cancer[disorder] OR "Breast-ovarian cancer, familial"[disorder]
   ```
2. Download results as CSV or retrieve via E-utilities
3. Filter by review status to prioritize high-confidence variants
4. Analyze distribution across genes (BRCA1, BRCA2, PALB2, etc.)
5. Examine variants with conflicting interpretations separately

### Example 4: Bulk Download and Database Construction

**Objective:** Build a local ClinVar database for analysis pipeline.

**Steps:**
1. Download monthly release for reproducibility:
   ```bash
   wget ftp://ftp.ncbi.nlm.nih.gov/pub/clinvar/xml/clinvar_variation/ClinVarVariationRelease_YYYY-MM.xml.gz
   ```
2. Parse XML and load into database (PostgreSQL, MySQL, MongoDB)
3. Index by gene, position, clinical significance, review status
4. Implement version tracking for updates
5. Schedule monthly updates from FTP site

## Important Limitations and Considerations

### Data Quality
- **Not all submissions have equal weight** - Check review status (star ratings)
- **Conflicting interpretations exist** - Require manual evaluation
- **Historical submissions may be outdated** - Newer data may be more accurate
- **VUS classification is not a clinical diagnosis** - Means insufficient evidence

### Scope Limitations
- **Not for direct clinical diagnosis** - Always involve genetics professional
- **Population-specific** - Variant frequencies vary by ancestry
- **Incomplete coverage** - Not all genes or variants are well-studied
- **Version dependencies** - Coordinate genome build (GRCh37/GRCh38) across analyses

### Technical Limitations
- **VCF files exclude large variants** - Variants >10kb not in VCF format
- **Rate limits on API** - 3 req/sec without key, 10 req/sec with API key
- **File sizes** - Full XML releases are multi-GB compressed files
- **No real-time updates** - Website updated weekly, FTP monthly/weekly

## Resources

### Reference Documentation

This skill includes comprehensive reference documentation:

- **`references/api_reference.md`** - Complete E-utilities API documentation with examples for esearch, esummary, efetch, and elink; includes rate limits, authentication, and Python/Biopython code samples

- **`references/clinical_significance.md`** - Detailed guide to interpreting clinical significance classifications, review status star ratings, conflict resolution, and best practices for variant interpretation

- **`references/data_formats.md`** - Documentation for XML, VCF, and tab-delimited file formats; FTP directory structure, processing examples, and format selection guidance

### External Resources

- ClinVar home: https://www.ncbi.nlm.nih.gov/clinvar/
- ClinVar documentation: https://www.ncbi.nlm.nih.gov/clinvar/docs/
- E-utilities documentation: https://www.ncbi.nlm.nih.gov/books/NBK25501/
- ACMG variant interpretation guidelines: Richards et al., 2015 (PMID: 25741868)
- ClinGen expert panels: https://clinicalgenome.org/

### Contact

For questions about ClinVar or data submission: clinvar@ncbi.nlm.nih.gov

