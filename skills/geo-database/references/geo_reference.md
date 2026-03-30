# GEO Database Reference Documentation

## Complete E-utilities API Specifications

### Overview

The NCBI Entrez Programming Utilities (E-utilities) provide programmatic access to GEO metadata through a set of nine server-side programs. All E-utilities return results in XML format by default.

### Base URL

```
https://eutils.ncbi.nlm.nih.gov/entrez/eutils/
```

### Core E-utility Programs

#### eSearch - Text Query to ID List

**Purpose:** Search a database and return a list of UIDs matching the query.

**URL Pattern:**
```
https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi
```

**Parameters:**
- `db` (required): Database to search (e.g., "gds", "geoprofiles")
- `term` (required): Search query string
- `retmax`: Maximum number of UIDs to return (default: 20, max: 10000)
- `retstart`: Starting position in result set (for pagination)
- `usehistory`: Set to "y" to store results on history server
- `sort`: Sort order (e.g., "relevance", "pub_date")
- `field`: Limit search to specific field
- `datetype`: Type of date to limit by
- `reldate`: Limit to items within N days of today
- `mindate`, `maxdate`: Date range limits (YYYY/MM/DD)

**Example:**
```python
from Bio import Entrez
Entrez.email = "your@email.com"

# Basic search
handle = Entrez.esearch(
    db="gds",
    term="breast cancer AND Homo sapiens",
    retmax=100,
    usehistory="y"
)
results = Entrez.read(handle)
handle.close()

# Results contain:
# - Count: Total number of matches
# - RetMax: Number of UIDs returned
# - RetStart: Starting position
# - IdList: List of UIDs
# - QueryKey: Key for history server (if usehistory="y")
# - WebEnv: Web environment string (if usehistory="y")
```

#### eSummary - Document Summaries

**Purpose:** Retrieve document summaries for a list of UIDs.

**URL Pattern:**
```
https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi
```

**Parameters:**
- `db` (required): Database
- `id` (required): Comma-separated list of UIDs or query_key+WebEnv
- `retmode`: Return format ("xml" or "json")
- `version`: Summary version ("2.0" recommended)

**Example:**
```python
from Bio import Entrez
Entrez.email = "your@email.com"

# Get summaries for multiple IDs
handle = Entrez.esummary(
    db="gds",
    id="200000001,200000002",
    retmode="xml",
    version="2.0"
)
summaries = Entrez.read(handle)
handle.close()

# Summary fields for GEO DataSets:
# - Accession: GDS accession
# - title: Dataset title
# - summary: Dataset description
# - PDAT: Publication date
# - n_samples: Number of samples
# - Organism: Source organism
# - PubMedIds: Associated PubMed IDs
```

#### eFetch - Full Records

**Purpose:** Retrieve full records for a list of UIDs.

**URL Pattern:**
```
https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi
```

**Parameters:**
- `db` (required): Database
- `id` (required): Comma-separated list of UIDs
- `retmode`: Return format ("xml", "text")
- `rettype`: Record type (database-specific)

**Example:**
```python
from Bio import Entrez
Entrez.email = "your@email.com"

# Fetch full records
handle = Entrez.efetch(
    db="gds",
    id="200000001",
    retmode="xml"
)
records = Entrez.read(handle)
handle.close()
```

#### eLink - Cross-Database Linking

**Purpose:** Find related records in same or different databases.

**URL Pattern:**
```
https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi
```

**Parameters:**
- `dbfrom` (required): Source database
- `db` (required): Target database
- `id` (required): UID from source database
- `cmd`: Link command type
  - "neighbor": Return linked UIDs (default)
  - "neighbor_score": Return scored links
  - "acheck": Check for links
  - "ncheck": Count links
  - "llinks": Return URLs to LinkOut resources

**Example:**
```python
from Bio import Entrez
Entrez.email = "your@email.com"

# Find PubMed articles linked to a GEO dataset
handle = Entrez.elink(
    dbfrom="gds",
    db="pubmed",
    id="200000001"
)
links = Entrez.read(handle)
handle.close()
```

#### ePost - Upload UID List

**Purpose:** Upload a list of UIDs to the history server for use in subsequent requests.

**URL Pattern:**
```
https://eutils.ncbi.nlm.nih.gov/entrez/eutils/epost.fcgi
```

**Parameters:**
- `db` (required): Database
- `id` (required): Comma-separated list of UIDs

**Example:**
```python
from Bio import Entrez
Entrez.email = "your@email.com"

# Post large list of IDs
large_id_list = [str(i) for i in range(200000001, 200000101)]
handle = Entrez.epost(db="gds", id=",".join(large_id_list))
result = Entrez.read(handle)
handle.close()

# Use returned QueryKey and WebEnv in subsequent calls
query_key = result["QueryKey"]
webenv = result["WebEnv"]
```

#### eInfo - Database Information

**Purpose:** Get information about available databases and their fields.

**URL Pattern:**
```
https://eutils.ncbi.nlm.nih.gov/entrez/eutils/einfo.fcgi
```

**Parameters:**
- `db`: Database name (omit to get list of all databases)
- `version`: Set to "2.0" for detailed field information

**Example:**
```python
from Bio import Entrez
Entrez.email = "your@email.com"

# Get information about gds database
handle = Entrez.einfo(db="gds", version="2.0")
info = Entrez.read(handle)
handle.close()

# Returns:
# - Database description
# - Last update date
# - Record count
# - Available search fields
# - Link information
```

### Search Field Qualifiers for GEO

Common search fields for building targeted queries:

**General Fields:**
- `[Accession]`: GEO accession number
- `[Title]`: Dataset title
- `[Author]`: Author name
- `[Organism]`: Source organism
- `[Entry Type]`: Type of entry (e.g., "Expression profiling by array")
- `[Platform]`: Platform accession or name
- `[PubMed ID]`: Associated PubMed ID

**Date Fields:**
- `[Publication Date]`: Publication date (YYYY or YYYY/MM/DD)
- `[Submission Date]`: Submission date
- `[Modification Date]`: Last modification date

**MeSH Terms:**
- `[MeSH Terms]`: Medical Subject Headings
- `[MeSH Major Topic]`: Major MeSH topics

**Study Type Fields:**
- `[DataSet Type]`: Type of study (e.g., "RNA-seq", "ChIP-seq")
- `[Sample Type]`: Sample type

**Example Complex Query:**
```python
query = """
    (breast cancer[MeSH] OR breast neoplasms[Title]) AND
    Homo sapiens[Organism] AND
    expression profiling by array[Entry Type] AND
    2020:2024[Publication Date] AND
    GPL570[Platform]
"""
```

## SOFT File Format Specification

### Overview

SOFT (Simple Omnibus Format in Text) is GEO's primary data exchange format. Files are structured as key-value pairs with data tables.

### File Types

**Family SOFT Files:**
- Filename: `GSExxxxx_family.soft.gz`
- Contains: Complete series with all samples and platforms
- Size: Can be very large (100s of MB compressed)
- Use: Complete data extraction

**Series Matrix Files:**
- Filename: `GSExxxxx_series_matrix.txt.gz`
- Contains: Expression matrix with minimal metadata
- Size: Smaller than family files
- Use: Quick access to expression data

**Platform SOFT Files:**
- Filename: `GPLxxxxx.soft`
- Contains: Platform annotation and probe information
- Use: Mapping probes to genes

### SOFT File Structure

```
^DATABASE = GeoMiame
!Database_name = Gene Expression Omnibus (GEO)
!Database_institute = NCBI NLM NIH
!Database_web_link = http://www.ncbi.nlm.nih.gov/geo
!Database_email = geo@ncbi.nlm.nih.gov

^SERIES = GSExxxxx
!Series_title = Study Title Here
!Series_summary = Study description and background...
!Series_overall_design = Experimental design...
!Series_type = Expression profiling by array
!Series_pubmed_id = 12345678
!Series_submission_date = Jan 01 2024
!Series_last_update_date = Jan 15 2024
!Series_contributor = John,Doe
!Series_contributor = Jane,Smith
!Series_sample_id = GSMxxxxxx
!Series_sample_id = GSMxxxxxx

^PLATFORM = GPLxxxxx
!Platform_title = Platform Name
!Platform_distribution = commercial or custom
!Platform_organism = Homo sapiens
!Platform_manufacturer = Affymetrix
!Platform_technology = in situ oligonucleotide
!Platform_data_row_count = 54675
#ID = Probe ID
#GB_ACC = GenBank accession
#SPOT_ID = Spot identifier
#Gene Symbol = Gene symbol
#Gene Title = Gene title
!platform_table_begin
ID    GB_ACC    SPOT_ID    Gene Symbol    Gene Title
1007_s_at    U48705    -    DDR1    discoidin domain receptor...
1053_at    M87338    -    RFC2    replication factor C...
!platform_table_end

^SAMPLE = GSMxxxxxx
!Sample_title = Sample name
!Sample_source_name_ch1 = cell line XYZ
!Sample_organism_ch1 = Homo sapiens
!Sample_characteristics_ch1 = cell type: epithelial
!Sample_characteristics_ch1 = treatment: control
!Sample_molecule_ch1 = total RNA
!Sample_label_ch1 = biotin
!Sample_platform_id = GPLxxxxx
!Sample_data_processing = normalization method
#ID_REF = Probe identifier
#VALUE = Expression value
!sample_table_begin
ID_REF    VALUE
1007_s_at    8.456
1053_at    7.234
!sample_table_end
```

### Parsing SOFT Files

**With GEOparse:**
```python
import GEOparse

# Parse series
gse = GEOparse.get_GEO(filepath="GSE123456_family.soft.gz")

# Access metadata
metadata = gse.metadata
phenotype_data = gse.phenotype_data

# Access samples
for gsm_name, gsm in gse.gsms.items():
    sample_data = gsm.table
    sample_metadata = gsm.metadata

# Access platforms
for gpl_name, gpl in gse.gpls.items():
    platform_table = gpl.table
    platform_metadata = gpl.metadata
```

**Manual Parsing:**
```python
import gzip

def parse_soft_file(filename):
    """Basic SOFT file parser"""
    sections = {}
    current_section = None
    current_metadata = {}
    current_table = []
    in_table = False

    with gzip.open(filename, 'rt') as f:
        for line in f:
            line = line.strip()

            # New section
            if line.startswith('^'):
                if current_section:
                    sections[current_section] = {
                        'metadata': current_metadata,
                        'table': current_table
                    }
                parts = line[1:].split(' = ')
                current_section = parts[1] if len(parts) > 1 else parts[0]
                current_metadata = {}
                current_table = []
                in_table = False

            # Metadata
            elif line.startswith('!'):
                if in_table:
                    in_table = False
                key_value = line[1:].split(' = ', 1)
                if len(key_value) == 2:
                    key, value = key_value
                    if key in current_metadata:
                        if isinstance(current_metadata[key], list):
                            current_metadata[key].append(value)
                        else:
                            current_metadata[key] = [current_metadata[key], value]
                    else:
                        current_metadata[key] = value

            # Table data
            elif line.startswith('#') or in_table:
                in_table = True
                current_table.append(line)

    return sections
```

## MINiML File Format

### Overview

MINiML (MIAME Notation in Markup Language) is GEO's XML-based format for data exchange.

### File Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<MINiML xmlns="http://www.ncbi.nlm.nih.gov/geo/info/MINiML"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <Series iid="GDS123">
    <Status>
      <Submission-Date>2024-01-01</Submission-Date>
      <Release-Date>2024-01-15</Release-Date>
      <Last-Update-Date>2024-01-15</Last-Update-Date>
    </Status>
    <Title>Study Title</Title>
    <Summary>Study description...</Summary>
    <Overall-Design>Experimental design...</Overall-Design>
    <Type>Expression profiling by array</Type>
    <Contributor>
      <Person>
        <First>John</First>
        <Last>Doe</Last>
      </Person>
    </Contributor>
  </Series>

  <Platform iid="GPL123">
    <Title>Platform Name</Title>
    <Distribution>commercial</Distribution>
    <Technology>in situ oligonucleotide</Technology>
    <Organism taxid="9606">Homo sapiens</Organism>
    <Data-Table>
      <Column position="1">
        <Name>ID</Name>
        <Description>Probe identifier</Description>
      </Column>
      <Data>
        <Row>
          <Cell column="1">1007_s_at</Cell>
          <Cell column="2">U48705</Cell>
        </Row>
      </Data>
    </Data-Table>
  </Platform>

  <Sample iid="GSM123">
    <Title>Sample name</Title>
    <Source>cell line XYZ</Source>
    <Organism taxid="9606">Homo sapiens</Organism>
    <Characteristics tag="cell type">epithelial</Characteristics>
    <Characteristics tag="treatment">control</Characteristics>
    <Platform-Ref ref="GPL123"/>
    <Data-Table>
      <Column position="1">
        <Name>ID_REF</Name>
      </Column>
      <Column position="2">
        <Name>VALUE</Name>
      </Column>
      <Data>
        <Row>
          <Cell column="1">1007_s_at</Cell>
          <Cell column="2">8.456</Cell>
        </Row>
      </Data>
    </Data-Table>
  </Sample>
</MINiML>
```

## FTP Directory Structure

### Series Files

**Pattern:**
```
ftp://ftp.ncbi.nlm.nih.gov/geo/series/GSE{nnn}nnn/GSE{xxxxx}/
```

Where `{nnn}` represents replacing last 3 digits with "nnn" and `{xxxxx}` is the full accession.

**Example:**
- GSE123456 → `/geo/series/GSE123nnn/GSE123456/`
- GSE1234 → `/geo/series/GSE1nnn/GSE1234/`
- GSE100001 → `/geo/series/GSE100nnn/GSE100001/`

**Subdirectories:**
- `/matrix/` - Series matrix files
- `/soft/` - Family SOFT files
- `/miniml/` - MINiML XML files
- `/suppl/` - Supplementary files

**File Types:**
```
matrix/
  └── GSE123456_series_matrix.txt.gz

soft/
  └── GSE123456_family.soft.gz

miniml/
  └── GSE123456_family.xml.tgz

suppl/
  ├── GSE123456_RAW.tar
  ├── filelist.txt
  └── [various supplementary files]
```

### Sample Files

**Pattern:**
```
ftp://ftp.ncbi.nlm.nih.gov/geo/samples/GSM{nnn}nnn/GSM{xxxxx}/
```

**Subdirectories:**
- `/suppl/` - Sample-specific supplementary files

### Platform Files

**Pattern:**
```
ftp://ftp.ncbi.nlm.nih.gov/geo/platforms/GPL{nnn}nnn/GPL{xxxxx}/
```

**File Types:**
```
soft/
  └── GPL570.soft.gz

miniml/
  └── GPL570.xml

annot/
  └── GPL570.annot.gz  # Enhanced annotation (if available)
```

## Advanced GEOparse Usage

### Custom Parsing Options

```python
import GEOparse

# Parse with custom options
gse = GEOparse.get_GEO(
    geo="GSE123456",
    destdir="./data",
    silent=False,  # Show progress
    how="full",  # Parse mode: "full", "quick", "brief"
    annotate_gpl=True,  # Include platform annotation
    geotype="GSE"  # Explicit type
)

# Access specific sample
gsm = gse.gsms['GSM1234567']

# Get expression values for specific probe
probe_id = "1007_s_at"
if hasattr(gsm, 'table'):
    probe_data = gsm.table[gsm.table['ID_REF'] == probe_id]

# Get all characteristics
characteristics = {}
for key, values in gsm.metadata.items():
    if key.startswith('characteristics'):
        for value in (values if isinstance(values, list) else [values]):
            if ':' in value:
                char_key, char_value = value.split(':', 1)
                characteristics[char_key.strip()] = char_value.strip()
```

### Working with Platform Annotations

```python
import GEOparse
import pandas as pd

gse = GEOparse.get_GEO(geo="GSE123456", destdir="./data")

# Get platform
gpl = list(gse.gpls.values())[0]

# Extract annotation table
if hasattr(gpl, 'table'):
    annotation = gpl.table

    # Common annotation columns:
    # - ID: Probe identifier
    # - Gene Symbol: Gene symbol
    # - Gene Title: Gene description
    # - GB_ACC: GenBank accession
    # - Gene ID: Entrez Gene ID
    # - RefSeq: RefSeq accession
    # - UniGene: UniGene cluster

    # Map probes to genes
    probe_to_gene = dict(zip(
        annotation['ID'],
        annotation['Gene Symbol']
    ))

    # Handle multiple probes per gene
    gene_to_probes = {}
    for probe, gene in probe_to_gene.items():
        if gene and gene != '---':
            if gene not in gene_to_probes:
                gene_to_probes[gene] = []
            gene_to_probes[gene].append(probe)
```

### Handling Large Datasets

```python
import GEOparse
import pandas as pd
import numpy as np

def process_large_gse(gse_id, chunk_size=1000):
    """Process large GEO series in chunks"""
    gse = GEOparse.get_GEO(geo=gse_id, destdir="./data")

    # Get sample list
    sample_list = list(gse.gsms.keys())

    # Process in chunks
    for i in range(0, len(sample_list), chunk_size):
        chunk_samples = sample_list[i:i+chunk_size]

        # Extract data for chunk
        chunk_data = {}
        for gsm_id in chunk_samples:
            gsm = gse.gsms[gsm_id]
            if hasattr(gsm, 'table'):
                chunk_data[gsm_id] = gsm.table['VALUE']

        # Process chunk
        chunk_df = pd.DataFrame(chunk_data)

        # Save chunk results
        chunk_df.to_csv(f"chunk_{i//chunk_size}.csv")

        print(f"Processed {i+len(chunk_samples)}/{len(sample_list)} samples")
```

## Troubleshooting Common Issues

### Issue: GEOparse Fails to Download

**Symptoms:** Timeout errors, connection failures

**Solutions:**
1. Check internet connection
2. Try downloading directly via FTP first
3. Parse local files:
```python
gse = GEOparse.get_GEO(filepath="./local/GSE123456_family.soft.gz")
```
4. Increase timeout (modify GEOparse source if needed)

### Issue: Missing Expression Data

**Symptoms:** `pivot_samples()` fails or returns empty

**Cause:** Not all series have series matrix files (older submissions)

**Solution:** Parse individual sample tables:
```python
expression_data = {}
for gsm_name, gsm in gse.gsms.items():
    if hasattr(gsm, 'table') and 'VALUE' in gsm.table.columns:
        expression_data[gsm_name] = gsm.table.set_index('ID_REF')['VALUE']

expression_df = pd.DataFrame(expression_data)
```

### Issue: Inconsistent Probe IDs

**Symptoms:** Probe IDs don't match between samples

**Cause:** Different platform versions or sample processing

**Solution:** Standardize using platform annotation:
```python
# Get common probe set
all_probes = set()
for gsm in gse.gsms.values():
    if hasattr(gsm, 'table'):
        all_probes.update(gsm.table['ID_REF'].values)

# Create standardized matrix
standardized_data = {}
for gsm_name, gsm in gse.gsms.items():
    if hasattr(gsm, 'table'):
        sample_data = gsm.table.set_index('ID_REF')['VALUE']
        standardized_data[gsm_name] = sample_data.reindex(all_probes)

expression_df = pd.DataFrame(standardized_data)
```

### Issue: E-utilities Rate Limiting

**Symptoms:** HTTP 429 errors, slow responses

**Solution:**
1. Get an API key from NCBI
2. Implement rate limiting:
```python
import time
from functools import wraps

def rate_limit(calls_per_second=3):
    min_interval = 1.0 / calls_per_second

    def decorator(func):
        last_called = [0.0]

        @wraps(func)
        def wrapper(*args, **kwargs):
            elapsed = time.time() - last_called[0]
            wait_time = min_interval - elapsed
            if wait_time > 0:
                time.sleep(wait_time)
            result = func(*args, **kwargs)
            last_called[0] = time.time()
            return result
        return wrapper
    return decorator

@rate_limit(calls_per_second=3)
def safe_esearch(query):
    handle = Entrez.esearch(db="gds", term=query)
    results = Entrez.read(handle)
    handle.close()
    return results
```

### Issue: Memory Errors with Large Datasets

**Symptoms:** MemoryError, system slowdown

**Solution:**
1. Process data in chunks
2. Use sparse matrices for expression data
3. Load only necessary columns
4. Use memory-efficient data types:
```python
import pandas as pd

# Read with specific dtypes
expression_df = pd.read_csv(
    "expression_matrix.csv",
    dtype={'ID': str, 'GSM1': np.float32}  # Use float32 instead of float64
)

# Or use sparse format for mostly-zero data
import scipy.sparse as sp
sparse_matrix = sp.csr_matrix(expression_df.values)
```

## Platform-Specific Considerations

### Affymetrix Arrays

- Probe IDs format: `1007_s_at`, `1053_at`
- Multiple probe sets per gene common
- Check for `_at`, `_s_at`, `_x_at` suffixes
- May need RMA or MAS5 normalization

### Illumina Arrays

- Probe IDs format: `ILMN_1234567`
- Watch for duplicate probes
- BeadChip-specific processing may be needed

### RNA-seq

- May not have traditional "probes"
- Check for gene IDs (Ensembl, Entrez)
- Counts vs. FPKM/TPM values
- May need separate count files

### Two-Channel Arrays

- Look for `_ch1` and `_ch2` suffixes in metadata
- VALUE_ch1, VALUE_ch2 columns
- May need ratio or intensity values
- Check dye-swap experiments

## Best Practices Summary

1. **Always set Entrez.email** before using E-utilities
2. **Use API key** for better rate limits
3. **Cache downloaded files** locally
4. **Check data quality** before analysis
5. **Verify platform annotations** are current
6. **Document data processing** steps
7. **Cite original studies** when using data
8. **Check for batch effects** in meta-analyses
9. **Validate results** with independent datasets
10. **Follow NCBI usage guidelines**
