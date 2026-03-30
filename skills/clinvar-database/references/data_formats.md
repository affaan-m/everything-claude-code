# ClinVar Data Formats and FTP Access

## Overview

ClinVar provides bulk data downloads in multiple formats to support different research workflows. Data is distributed via FTP and updated on regular schedules.

## FTP Access

### Base URL
```
ftp://ftp.ncbi.nlm.nih.gov/pub/clinvar/
```

### Update Schedule

- **Monthly Releases**: First Thursday of each month
  - Complete dataset with comprehensive documentation
  - Archived indefinitely for reproducibility
  - Includes release notes

- **Weekly Updates**: Every Monday
  - Incremental updates to monthly release
  - Retained until next monthly release
  - Allows synchronization with ClinVar website

### Directory Structure

```
pub/clinvar/
├── xml/                          # XML data files
│   ├── clinvar_variation/       # VCV files (variant-centric)
│   │   ├── weekly_release/      # Weekly updates
│   │   └── archive/             # Monthly archives
│   └── RCV/                     # RCV files (variant-condition pairs)
│       ├── weekly_release/
│       └── archive/
├── vcf_GRCh37/                  # VCF files (GRCh37/hg19)
├── vcf_GRCh38/                  # VCF files (GRCh38/hg38)
├── tab_delimited/               # Tab-delimited summary files
│   ├── variant_summary.txt.gz
│   ├── var_citations.txt.gz
│   └── cross_references.txt.gz
└── README.txt                   # Format documentation
```

## Data Formats

### 1. XML Format (Primary Distribution)

XML provides the most comprehensive data with full submission details, evidence, and metadata.

#### VCV (Variation) Files
- **Purpose**: Variant-centric aggregation
- **Location**: `xml/clinvar_variation/`
- **Accession format**: VCV000000001.1
- **Best for**: Queries focused on specific variants regardless of condition
- **File naming**: `ClinVarVariationRelease_YYYY-MM-DD.xml.gz`

**VCV Record Structure:**
```xml
<VariationArchive VariationID="12345" VariationType="single nucleotide variant">
  <VariationName>NM_000059.3(BRCA2):c.1310_1313del (p.Lys437fs)</VariationName>
  <InterpretedRecord>
    <Interpretations>
      <InterpretedConditionList>
        <InterpretedCondition>Breast-ovarian cancer, familial 2</InterpretedCondition>
      </InterpretedConditionList>
      <ClinicalSignificance>Pathogenic</ClinicalSignificance>
      <ReviewStatus>reviewed by expert panel</ReviewStatus>
    </Interpretations>
  </InterpretedRecord>
  <ClinicalAssertionList>
    <!-- Individual submissions -->
  </ClinicalAssertionList>
</VariationArchive>
```

#### RCV (Record) Files
- **Purpose**: Variant-condition pair aggregation
- **Location**: `xml/RCV/`
- **Accession format**: RCV000000001.1
- **Best for**: Queries focused on variant-disease relationships
- **File naming**: `ClinVarRCVRelease_YYYY-MM-DD.xml.gz`

**Key differences from VCV:**
- One RCV per variant-condition combination
- A single variant may have multiple RCV records (different conditions)
- More focused on clinical interpretation per disease

#### SCV (Submission) Records
- **Format**: Individual submissions within VCV/RCV records
- **Accession format**: SCV000000001.1
- **Content**: Submitter-specific interpretations and evidence

### 2. VCF Format

Variant Call Format files for genomic analysis pipelines.

#### Locations
- **GRCh37/hg19**: `vcf_GRCh37/clinvar.vcf.gz`
- **GRCh38/hg38**: `vcf_GRCh38/clinvar.vcf.gz`

#### Content Limitations
- **Included**: Simple alleles with precise genomic coordinates
- **Excluded**:
  - Variants >10 kb
  - Cytogenetic variants
  - Complex structural variants
  - Variants without precise breakpoints

#### VCF INFO Fields

Key INFO fields in ClinVar VCF:

| Field | Description |
|-------|-------------|
| **ALLELEID** | ClinVar allele identifier |
| **CLNSIG** | Clinical significance |
| **CLNREVSTAT** | Review status |
| **CLNDN** | Condition name(s) |
| **CLNVC** | Variant type (SNV, deletion, etc.) |
| **CLNVCSO** | Sequence ontology term |
| **GENEINFO** | Gene symbol:gene ID |
| **MC** | Molecular consequence |
| **RS** | dbSNP rsID |
| **AF_ESP** | Allele frequency (ESP) |
| **AF_EXAC** | Allele frequency (ExAC) |
| **AF_TGP** | Allele frequency (1000 Genomes) |

#### Example VCF Line
```
#CHROM  POS     ID      REF  ALT  QUAL  FILTER  INFO
13      32339912  rs80357382  A    G    .     .     ALLELEID=38447;CLNDN=Breast-ovarian_cancer,_familial_2;CLNSIG=Pathogenic;CLNREVSTAT=reviewed_by_expert_panel;GENEINFO=BRCA2:675
```

### 3. Tab-Delimited Format

Summary files for quick analysis and database loading.

#### variant_summary.txt
Primary summary file with selected metadata for all genome-mapped variants.

**Key Columns:**
- `VariationID` - ClinVar variation identifier
- `Type` - Variant type (SNV, indel, CNV, etc.)
- `Name` - Variant name (typically HGVS)
- `GeneID` - NCBI Gene ID
- `GeneSymbol` - Gene symbol
- `ClinicalSignificance` - Classification
- `ReviewStatus` - Star rating level
- `LastEvaluated` - Date of last review
- `RS# (dbSNP)` - dbSNP rsID if available
- `Chromosome` - Chromosome
- `PositionVCF` - Position (GRCh38)
- `ReferenceAlleleVCF` - Reference allele
- `AlternateAlleleVCF` - Alternate allele
- `Assembly` - Reference assembly (GRCh37/GRCh38)
- `PhenotypeIDS` - MedGen/OMIM/Orphanet IDs
- `Origin` - Germline, somatic, de novo, etc.
- `SubmitterCategories` - Submitter types (clinical, research, etc.)

**Example Usage:**
```bash
# Extract all pathogenic BRCA1 variants
zcat variant_summary.txt.gz | \
  awk -F'\t' '$7=="BRCA1" && $13~"Pathogenic"' | \
  cut -f1,7,13,14
```

#### var_citations.txt
Cross-references to PubMed articles, dbSNP, and dbVar.

**Columns:**
- `AlleleID` - ClinVar allele ID
- `VariationID` - ClinVar variation ID
- `rs` - dbSNP rsID
- `nsv/esv` - dbVar IDs
- `PubMedID` - PubMed citation

#### cross_references.txt
Database cross-references with modification dates.

**Columns:**
- `VariationID`
- `Database` (OMIM, UniProtKB, GTR, etc.)
- `Identifier`
- `DateLastModified`

## Choosing the Right Format

### Use XML when:
- Need complete submission details
- Want to track evidence and criteria
- Building comprehensive variant databases
- Require full metadata and relationships

### Use VCF when:
- Integrating with genomic analysis pipelines
- Annotating variant calls from sequencing
- Need genomic coordinates for overlap analysis
- Working with standard bioinformatics tools

### Use Tab-Delimited when:
- Quick database queries and filters
- Loading into spreadsheets or databases
- Simple data extraction and statistics
- Don't need full evidence details

## Accession Types and Identifiers

### VCV (Variation Archive)
- **Format**: VCV000012345.6 (ID.version)
- **Scope**: Aggregates all data for a single variant
- **Versioning**: Increments when variant data changes

### RCV (Record)
- **Format**: RCV000056789.4
- **Scope**: One variant-condition interpretation
- **Versioning**: Increments when interpretation changes

### SCV (Submission)
- **Format**: SCV000098765.2
- **Scope**: Individual submitter's interpretation
- **Versioning**: Increments when submission updates

### Other Identifiers
- **VariationID**: Stable numeric identifier for variants
- **AlleleID**: Stable numeric identifier for alleles
- **dbSNP rsID**: Cross-reference to dbSNP (when available)

## File Processing Tips

### XML Processing

**Python with xml.etree:**
```python
import gzip
import xml.etree.ElementTree as ET

with gzip.open('ClinVarVariationRelease.xml.gz', 'rt') as f:
    for event, elem in ET.iterparse(f, events=('end',)):
        if elem.tag == 'VariationArchive':
            # Process variant
            variation_id = elem.attrib.get('VariationID')
            # Extract data
            elem.clear()  # Free memory
```

**Command-line with xmllint:**
```bash
# Extract pathogenic variants
zcat ClinVarVariationRelease.xml.gz | \
  xmllint --xpath "//VariationArchive[.//ClinicalSignificance[text()='Pathogenic']]" -
```

### VCF Processing

**Using bcftools:**
```bash
# Filter by clinical significance
bcftools view -i 'INFO/CLNSIG~"Pathogenic"' clinvar.vcf.gz

# Extract specific genes
bcftools view -i 'INFO/GENEINFO~"BRCA"' clinvar.vcf.gz

# Annotate your VCF
bcftools annotate -a clinvar.vcf.gz -c INFO your_variants.vcf
```

**Using PyVCF:**
```python
import vcf

vcf_reader = vcf.Reader(filename='clinvar.vcf.gz')
for record in vcf_reader:
    clnsig = record.INFO.get('CLNSIG', [])
    if 'Pathogenic' in clnsig:
        print(f"{record.CHROM}:{record.POS} - {clnsig}")
```

### Tab-Delimited Processing

**Using pandas:**
```python
import pandas as pd

# Read variant summary
df = pd.read_csv('variant_summary.txt.gz', sep='\t', compression='gzip')

# Filter pathogenic variants
pathogenic = df[df['ClinicalSignificance'].str.contains('Pathogenic', na=False)]

# Group by gene
gene_counts = pathogenic.groupby('GeneSymbol').size().sort_values(ascending=False)
```

## Data Quality Considerations

### Known Limitations

1. **VCF files exclude large variants** - Variants >10 kb not included
2. **Historical data may be less accurate** - Older submissions had fewer standardization requirements
3. **Conflicting interpretations exist** - Multiple submitters may disagree
4. **Not all variants have genomic coordinates** - Some HGVS expressions can't be mapped

### Validation Recommendations

- Cross-reference multiple data formats when possible
- Check review status (prefer ★★★ or ★★★★ ratings)
- Verify genomic coordinates against current genome builds
- Consider population frequency data (gnomAD) for context
- Review submission dates - newer data may be more accurate

## Bulk Download Scripts

### Download Latest Monthly Release

```bash
#!/bin/bash
# Download latest ClinVar monthly XML release

BASE_URL="ftp://ftp.ncbi.nlm.nih.gov/pub/clinvar/xml/clinvar_variation"

# Get latest file
LATEST=$(curl -s ${BASE_URL}/ | \
         grep -oP 'ClinVarVariationRelease_\d{4}-\d{2}\.xml\.gz' | \
         tail -1)

# Download
wget ${BASE_URL}/${LATEST}
```

### Download All Formats

```bash
#!/bin/bash
# Download ClinVar in all formats

FTP_BASE="ftp://ftp.ncbi.nlm.nih.gov/pub/clinvar"

# XML
wget ${FTP_BASE}/xml/clinvar_variation/ClinVarVariationRelease_00-latest.xml.gz

# VCF (both assemblies)
wget ${FTP_BASE}/vcf_GRCh37/clinvar.vcf.gz
wget ${FTP_BASE}/vcf_GRCh38/clinvar.vcf.gz

# Tab-delimited
wget ${FTP_BASE}/tab_delimited/variant_summary.txt.gz
wget ${FTP_BASE}/tab_delimited/var_citations.txt.gz
```

## Additional Resources

- ClinVar FTP Primer: https://www.ncbi.nlm.nih.gov/clinvar/docs/ftp_primer/
- XML Schema Documentation: https://www.ncbi.nlm.nih.gov/clinvar/docs/xml_schemas/
- VCF Specification: https://samtools.github.io/hts-specs/VCFv4.3.pdf
- Release Notes: https://ftp.ncbi.nlm.nih.gov/pub/clinvar/xml/README.txt
