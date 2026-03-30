---
name: geo-database
description: Access NCBI GEO for gene expression/genomics data. Search/download microarray and RNA-seq datasets (GSE, GSM, GPL), retrieve SOFT/Matrix files, for transcriptomics and expression analysis.
license: Unknown
metadata:
    skill-author: K-Dense Inc.
---

# GEO Database

## Overview

The Gene Expression Omnibus (GEO) is NCBI's public repository for high-throughput gene expression and functional genomics data. GEO contains over 264,000 studies with more than 8 million samples from both array-based and sequence-based experiments.

## When to Use This Skill

This skill should be used when searching for gene expression datasets, retrieving experimental data, downloading raw and processed files, querying expression profiles, or integrating GEO data into computational analysis workflows.

## Core Capabilities

### 1. Understanding GEO Data Organization

GEO organizes data hierarchically using different accession types:

**Series (GSE):** A complete experiment with a set of related samples
- Example: GSE123456
- Contains experimental design, samples, and overall study information
- Largest organizational unit in GEO
- Current count: 264,928+ series

**Sample (GSM):** A single experimental sample or biological replicate
- Example: GSM987654
- Contains individual sample data, protocols, and metadata
- Linked to platforms and series
- Current count: 8,068,632+ samples

**Platform (GPL):** The microarray or sequencing platform used
- Example: GPL570 (Affymetrix Human Genome U133 Plus 2.0 Array)
- Describes the technology and probe/feature annotations
- Shared across multiple experiments
- Current count: 27,739+ platforms

**DataSet (GDS):** Curated collections with consistent formatting
- Example: GDS5678
- Experimentally-comparable samples organized by study design
- Processed for differential analysis
- Subset of GEO data (4,348 curated datasets)
- Ideal for quick comparative analyses

**Profiles:** Gene-specific expression data linked to sequence features
- Queryable by gene name or annotation
- Cross-references to Entrez Gene
- Enables gene-centric searches across all studies

### 2. Searching GEO Data

**GEO DataSets Search:**

Search for studies by keywords, organism, or experimental conditions:

```python
from Bio import Entrez

# Configure Entrez (required)
Entrez.email = "your.email@example.com"

# Search for datasets
def search_geo_datasets(query, retmax=20):
    """Search GEO DataSets database"""
    handle = Entrez.esearch(
        db="gds",
        term=query,
        retmax=retmax,
        usehistory="y"
    )
    results = Entrez.read(handle)
    handle.close()
    return results

# Example searches
results = search_geo_datasets("breast cancer[MeSH] AND Homo sapiens[Organism]")
print(f"Found {results['Count']} datasets")

# Search by specific platform
results = search_geo_datasets("GPL570[Accession]")

# Search by study type
results = search_geo_datasets("expression profiling by array[DataSet Type]")
```

**GEO Profiles Search:**

Find gene-specific expression patterns:

```python
# Search for gene expression profiles
def search_geo_profiles(gene_name, organism="Homo sapiens", retmax=100):
    """Search GEO Profiles for a specific gene"""
    query = f"{gene_name}[Gene Name] AND {organism}[Organism]"
    handle = Entrez.esearch(
        db="geoprofiles",
        term=query,
        retmax=retmax
    )
    results = Entrez.read(handle)
    handle.close()
    return results

# Find TP53 expression across studies
tp53_results = search_geo_profiles("TP53", organism="Homo sapiens")
print(f"Found {tp53_results['Count']} expression profiles for TP53")
```

**Advanced Search Patterns:**

```python
# Combine multiple search terms
def advanced_geo_search(terms, operator="AND"):
    """Build complex search queries"""
    query = f" {operator} ".join(terms)
    return search_geo_datasets(query)

# Find recent high-throughput studies
search_terms = [
    "RNA-seq[DataSet Type]",
    "Homo sapiens[Organism]",
    "2024[Publication Date]"
]
results = advanced_geo_search(search_terms)

# Search by author and condition
search_terms = [
    "Smith[Author]",
    "diabetes[Disease]"
]
results = advanced_geo_search(search_terms)
```

### 3. Retrieving GEO Data with GEOparse (Recommended)

**GEOparse** is the primary Python library for accessing GEO data:

**Installation:**
```bash
uv pip install GEOparse
```

**Basic Usage:**

```python
import GEOparse

# Download and parse a GEO Series
gse = GEOparse.get_GEO(geo="GSE123456", destdir="./data")

# Access series metadata
print(gse.metadata['title'])
print(gse.metadata['summary'])
print(gse.metadata['overall_design'])

# Access sample information
for gsm_name, gsm in gse.gsms.items():
    print(f"Sample: {gsm_name}")
    print(f"  Title: {gsm.metadata['title'][0]}")
    print(f"  Source: {gsm.metadata['source_name_ch1'][0]}")
    print(f"  Characteristics: {gsm.metadata.get('characteristics_ch1', [])}")

# Access platform information
for gpl_name, gpl in gse.gpls.items():
    print(f"Platform: {gpl_name}")
    print(f"  Title: {gpl.metadata['title'][0]}")
    print(f"  Organism: {gpl.metadata['organism'][0]}")
```

**Working with Expression Data:**

```python
import GEOparse
import pandas as pd

# Get expression data from series
gse = GEOparse.get_GEO(geo="GSE123456", destdir="./data")

# Extract expression matrix
# Method 1: From series matrix file (fastest)
if hasattr(gse, 'pivot_samples'):
    expression_df = gse.pivot_samples('VALUE')
    print(expression_df.shape)  # genes x samples

# Method 2: From individual samples
expression_data = {}
for gsm_name, gsm in gse.gsms.items():
    if hasattr(gsm, 'table'):
        expression_data[gsm_name] = gsm.table['VALUE']

expression_df = pd.DataFrame(expression_data)
print(f"Expression matrix: {expression_df.shape}")
```

**Accessing Supplementary Files:**

```python
import GEOparse

gse = GEOparse.get_GEO(geo="GSE123456", destdir="./data")

# Download supplementary files
gse.download_supplementary_files(
    directory="./data/GSE123456_suppl",
    download_sra=False  # Set to True to download SRA files
)

# List available supplementary files
for gsm_name, gsm in gse.gsms.items():
    if hasattr(gsm, 'supplementary_files'):
        print(f"Sample {gsm_name}:")
        for file_url in gsm.metadata.get('supplementary_file', []):
            print(f"  {file_url}")
```

**Filtering and Subsetting Data:**

```python
import GEOparse

gse = GEOparse.get_GEO(geo="GSE123456", destdir="./data")

# Filter samples by metadata
control_samples = [
    gsm_name for gsm_name, gsm in gse.gsms.items()
    if 'control' in gsm.metadata.get('title', [''])[0].lower()
]

treatment_samples = [
    gsm_name for gsm_name, gsm in gse.gsms.items()
    if 'treatment' in gsm.metadata.get('title', [''])[0].lower()
]

print(f"Control samples: {len(control_samples)}")
print(f"Treatment samples: {len(treatment_samples)}")

# Extract subset expression matrix
expression_df = gse.pivot_samples('VALUE')
control_expr = expression_df[control_samples]
treatment_expr = expression_df[treatment_samples]
```

### 4. Using NCBI E-utilities for GEO Access

**E-utilities** provide lower-level programmatic access to GEO metadata:

**Basic E-utilities Workflow:**

```python
from Bio import Entrez
import time

Entrez.email = "your.email@example.com"

# Step 1: Search for GEO entries
def search_geo(query, db="gds", retmax=100):
    """Search GEO using E-utilities"""
    handle = Entrez.esearch(
        db=db,
        term=query,
        retmax=retmax,
        usehistory="y"
    )
    results = Entrez.read(handle)
    handle.close()
    return results

# Step 2: Fetch summaries
def fetch_geo_summaries(id_list, db="gds"):
    """Fetch document summaries for GEO entries"""
    ids = ",".join(id_list)
    handle = Entrez.esummary(db=db, id=ids)
    summaries = Entrez.read(handle)
    handle.close()
    return summaries

# Step 3: Fetch full records
def fetch_geo_records(id_list, db="gds"):
    """Fetch full GEO records"""
    ids = ",".join(id_list)
    handle = Entrez.efetch(db=db, id=ids, retmode="xml")
    records = Entrez.read(handle)
    handle.close()
    return records

# Example workflow
search_results = search_geo("breast cancer AND Homo sapiens")
id_list = search_results['IdList'][:5]

summaries = fetch_geo_summaries(id_list)
for summary in summaries:
    print(f"GDS: {summary.get('Accession', 'N/A')}")
    print(f"Title: {summary.get('title', 'N/A')}")
    print(f"Samples: {summary.get('n_samples', 'N/A')}")
    print()
```

**Batch Processing with E-utilities:**

```python
from Bio import Entrez
import time

Entrez.email = "your.email@example.com"

def batch_fetch_geo_metadata(accessions, batch_size=100):
    """Fetch metadata for multiple GEO accessions"""
    results = {}

    for i in range(0, len(accessions), batch_size):
        batch = accessions[i:i + batch_size]

        # Search for each accession
        for accession in batch:
            try:
                query = f"{accession}[Accession]"
                search_handle = Entrez.esearch(db="gds", term=query)
                search_results = Entrez.read(search_handle)
                search_handle.close()

                if search_results['IdList']:
                    # Fetch summary
                    summary_handle = Entrez.esummary(
                        db="gds",
                        id=search_results['IdList'][0]
                    )
                    summary = Entrez.read(summary_handle)
                    summary_handle.close()
                    results[accession] = summary[0]

                # Be polite to NCBI servers
                time.sleep(0.34)  # Max 3 requests per second

            except Exception as e:
                print(f"Error fetching {accession}: {e}")

    return results

# Fetch metadata for multiple datasets
gse_list = ["GSE100001", "GSE100002", "GSE100003"]
metadata = batch_fetch_geo_metadata(gse_list)
```

### 5. Direct FTP Access for Data Files

**FTP URLs for GEO Data:**

GEO data can be downloaded directly via FTP:

```python
import ftplib
import os

def download_geo_ftp(accession, file_type="matrix", dest_dir="./data"):
    """Download GEO files via FTP"""
    # Construct FTP path based on accession type
    if accession.startswith("GSE"):
        # Series files
        gse_num = accession[3:]
        base_num = gse_num[:-3] + "nnn"
        ftp_path = f"/geo/series/GSE{base_num}/{accession}/"

        if file_type == "matrix":
            filename = f"{accession}_series_matrix.txt.gz"
        elif file_type == "soft":
            filename = f"{accession}_family.soft.gz"
        elif file_type == "miniml":
            filename = f"{accession}_family.xml.tgz"

    # Connect to FTP server
    ftp = ftplib.FTP("ftp.ncbi.nlm.nih.gov")
    ftp.login()
    ftp.cwd(ftp_path)

    # Download file
    os.makedirs(dest_dir, exist_ok=True)
    local_file = os.path.join(dest_dir, filename)

    with open(local_file, 'wb') as f:
        ftp.retrbinary(f'RETR {filename}', f.write)

    ftp.quit()
    print(f"Downloaded: {local_file}")
    return local_file

# Download series matrix file
download_geo_ftp("GSE123456", file_type="matrix")

# Download SOFT format file
download_geo_ftp("GSE123456", file_type="soft")
```

**Using wget or curl for Downloads:**

```bash
# Download series matrix file
wget ftp://ftp.ncbi.nlm.nih.gov/geo/series/GSE123nnn/GSE123456/matrix/GSE123456_series_matrix.txt.gz

# Download all supplementary files for a series
wget -r -np -nd ftp://ftp.ncbi.nlm.nih.gov/geo/series/GSE123nnn/GSE123456/suppl/

# Download SOFT format family file
wget ftp://ftp.ncbi.nlm.nih.gov/geo/series/GSE123nnn/GSE123456/soft/GSE123456_family.soft.gz
```

### 6. Analyzing GEO Data

**Quality Control and Preprocessing:**

```python
import GEOparse
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Load dataset
gse = GEOparse.get_GEO(geo="GSE123456", destdir="./data")
expression_df = gse.pivot_samples('VALUE')

# Check for missing values
print(f"Missing values: {expression_df.isnull().sum().sum()}")

# Log transformation (if needed)
if expression_df.min().min() > 0:  # Check if already log-transformed
    if expression_df.max().max() > 100:
        expression_df = np.log2(expression_df + 1)
        print("Applied log2 transformation")

# Distribution plots
plt.figure(figsize=(12, 5))

plt.subplot(1, 2, 1)
expression_df.plot.box(ax=plt.gca())
plt.title("Expression Distribution per Sample")
plt.xticks(rotation=90)

plt.subplot(1, 2, 2)
expression_df.mean(axis=1).hist(bins=50)
plt.title("Gene Expression Distribution")
plt.xlabel("Average Expression")

plt.tight_layout()
plt.savefig("geo_qc.png", dpi=300, bbox_inches='tight')
```

**Differential Expression Analysis:**

```python
import GEOparse
import pandas as pd
import numpy as np
from scipy import stats

gse = GEOparse.get_GEO(geo="GSE123456", destdir="./data")
expression_df = gse.pivot_samples('VALUE')

# Define sample groups
control_samples = ["GSM1", "GSM2", "GSM3"]
treatment_samples = ["GSM4", "GSM5", "GSM6"]

# Calculate fold changes and p-values
results = []
for gene in expression_df.index:
    control_expr = expression_df.loc[gene, control_samples]
    treatment_expr = expression_df.loc[gene, treatment_samples]

    # Calculate statistics
    fold_change = treatment_expr.mean() - control_expr.mean()
    t_stat, p_value = stats.ttest_ind(treatment_expr, control_expr)

    results.append({
        'gene': gene,
        'log2_fold_change': fold_change,
        'p_value': p_value,
        'control_mean': control_expr.mean(),
        'treatment_mean': treatment_expr.mean()
    })

# Create results DataFrame
de_results = pd.DataFrame(results)

# Multiple testing correction (Benjamini-Hochberg)
from statsmodels.stats.multitest import multipletests
_, de_results['q_value'], _, _ = multipletests(
    de_results['p_value'],
    method='fdr_bh'
)

# Filter significant genes
significant_genes = de_results[
    (de_results['q_value'] < 0.05) &
    (abs(de_results['log2_fold_change']) > 1)
]

print(f"Significant genes: {len(significant_genes)}")
significant_genes.to_csv("de_results.csv", index=False)
```

**Correlation and Clustering Analysis:**

```python
import GEOparse
import seaborn as sns
import matplotlib.pyplot as plt
from scipy.cluster import hierarchy
from scipy.spatial.distance import pdist

gse = GEOparse.get_GEO(geo="GSE123456", destdir="./data")
expression_df = gse.pivot_samples('VALUE')

# Sample correlation heatmap
sample_corr = expression_df.corr()

plt.figure(figsize=(10, 8))
sns.heatmap(sample_corr, cmap='coolwarm', center=0,
            square=True, linewidths=0.5)
plt.title("Sample Correlation Matrix")
plt.tight_layout()
plt.savefig("sample_correlation.png", dpi=300, bbox_inches='tight')

# Hierarchical clustering
distances = pdist(expression_df.T, metric='correlation')
linkage = hierarchy.linkage(distances, method='average')

plt.figure(figsize=(12, 6))
hierarchy.dendrogram(linkage, labels=expression_df.columns)
plt.title("Hierarchical Clustering of Samples")
plt.xlabel("Samples")
plt.ylabel("Distance")
plt.xticks(rotation=90)
plt.tight_layout()
plt.savefig("sample_clustering.png", dpi=300, bbox_inches='tight')
```

### 7. Batch Processing Multiple Datasets

**Download and Process Multiple Series:**

```python
import GEOparse
import pandas as pd
import os

def batch_download_geo(gse_list, destdir="./geo_data"):
    """Download multiple GEO series"""
    results = {}

    for gse_id in gse_list:
        try:
            print(f"Processing {gse_id}...")
            gse = GEOparse.get_GEO(geo=gse_id, destdir=destdir)

            # Extract key information
            results[gse_id] = {
                'title': gse.metadata.get('title', ['N/A'])[0],
                'organism': gse.metadata.get('organism', ['N/A'])[0],
                'platform': list(gse.gpls.keys())[0] if gse.gpls else 'N/A',
                'num_samples': len(gse.gsms),
                'submission_date': gse.metadata.get('submission_date', ['N/A'])[0]
            }

            # Save expression data
            if hasattr(gse, 'pivot_samples'):
                expr_df = gse.pivot_samples('VALUE')
                expr_df.to_csv(f"{destdir}/{gse_id}_expression.csv")
                results[gse_id]['num_genes'] = len(expr_df)

        except Exception as e:
            print(f"Error processing {gse_id}: {e}")
            results[gse_id] = {'error': str(e)}

    # Save summary
    summary_df = pd.DataFrame(results).T
    summary_df.to_csv(f"{destdir}/batch_summary.csv")

    return results

# Process multiple datasets
gse_list = ["GSE100001", "GSE100002", "GSE100003"]
results = batch_download_geo(gse_list)
```

**Meta-Analysis Across Studies:**

```python
import GEOparse
import pandas as pd
import numpy as np

def meta_analysis_geo(gse_list, gene_of_interest):
    """Perform meta-analysis of gene expression across studies"""
    results = []

    for gse_id in gse_list:
        try:
            gse = GEOparse.get_GEO(geo=gse_id, destdir="./data")

            # Get platform annotation
            gpl = list(gse.gpls.values())[0]

            # Find gene in platform
            if hasattr(gpl, 'table'):
                gene_probes = gpl.table[
                    gpl.table['Gene Symbol'].str.contains(
                        gene_of_interest,
                        case=False,
                        na=False
                    )
                ]

                if not gene_probes.empty:
                    expr_df = gse.pivot_samples('VALUE')

                    for probe_id in gene_probes['ID']:
                        if probe_id in expr_df.index:
                            expr_values = expr_df.loc[probe_id]

                            results.append({
                                'study': gse_id,
                                'probe': probe_id,
                                'mean_expression': expr_values.mean(),
                                'std_expression': expr_values.std(),
                                'num_samples': len(expr_values)
                            })

        except Exception as e:
            print(f"Error in {gse_id}: {e}")

    return pd.DataFrame(results)

# Meta-analysis for TP53
gse_studies = ["GSE100001", "GSE100002", "GSE100003"]
meta_results = meta_analysis_geo(gse_studies, "TP53")
print(meta_results)
```

## Installation and Setup

### Python Libraries

```bash
# Primary GEO access library (recommended)
uv pip install GEOparse

# For E-utilities and programmatic NCBI access
uv pip install biopython

# For data analysis
uv pip install pandas numpy scipy

# For visualization
uv pip install matplotlib seaborn

# For statistical analysis
uv pip install statsmodels scikit-learn
```

### Configuration

Set up NCBI E-utilities access:

```python
from Bio import Entrez

# Always set your email (required by NCBI)
Entrez.email = "your.email@example.com"

# Optional: Set API key for increased rate limits
# Get your API key from: https://www.ncbi.nlm.nih.gov/account/
Entrez.api_key = "your_api_key_here"

# With API key: 10 requests/second
# Without API key: 3 requests/second
```

## Common Use Cases

### Transcriptomics Research
- Download gene expression data for specific conditions
- Compare expression profiles across studies
- Identify differentially expressed genes
- Perform meta-analyses across multiple datasets

### Drug Response Studies
- Analyze gene expression changes after drug treatment
- Identify biomarkers for drug response
- Compare drug effects across cell lines or patients
- Build predictive models for drug sensitivity

### Disease Biology
- Study gene expression in disease vs. normal tissues
- Identify disease-associated expression signatures
- Compare patient subgroups and disease stages
- Correlate expression with clinical outcomes

### Biomarker Discovery
- Screen for diagnostic or prognostic markers
- Validate biomarkers across independent cohorts
- Compare marker performance across platforms
- Integrate expression with clinical data

## Key Concepts

**SOFT (Simple Omnibus Format in Text):** GEO's primary text-based format containing metadata and data tables. Easily parsed by GEOparse.

**MINiML (MIAME Notation in Markup Language):** XML format for GEO data, used for programmatic access and data exchange.

**Series Matrix:** Tab-delimited expression matrix with samples as columns and genes/probes as rows. Fastest format for getting expression data.

**MIAME Compliance:** Minimum Information About a Microarray Experiment - standardized annotation that GEO enforces for all submissions.

**Expression Value Types:** Different types of expression measurements (raw signal, normalized, log-transformed). Always check platform and processing methods.

**Platform Annotation:** Maps probe/feature IDs to genes. Essential for biological interpretation of expression data.

## GEO2R Web Tool

For quick analysis without coding, use GEO2R:

- Web-based statistical analysis tool integrated into GEO
- Accessible at: https://www.ncbi.nlm.nih.gov/geo/geo2r/?acc=GSExxxxx
- Performs differential expression analysis
- Generates R scripts for reproducibility
- Useful for exploratory analysis before downloading data

## Rate Limiting and Best Practices

**NCBI E-utilities Rate Limits:**
- Without API key: 3 requests per second
- With API key: 10 requests per second
- Implement delays between requests: `time.sleep(0.34)` (no API key) or `time.sleep(0.1)` (with API key)

**FTP Access:**
- No rate limits for FTP downloads
- Preferred method for bulk downloads
- Can download entire directories with wget -r

**GEOparse Caching:**
- GEOparse automatically caches downloaded files in destdir
- Subsequent calls use cached data
- Clean cache periodically to save disk space

**Optimal Practices:**
- Use GEOparse for series-level access (easiest)
- Use E-utilities for metadata searching and batch queries
- Use FTP for direct file downloads and bulk operations
- Cache data locally to avoid repeated downloads
- Always set Entrez.email when using Biopython

## Resources

### references/geo_reference.md

Comprehensive reference documentation covering:
- Detailed E-utilities API specifications and endpoints
- Complete SOFT and MINiML file format documentation
- Advanced GEOparse usage patterns and examples
- FTP directory structure and file naming conventions
- Data processing pipelines and normalization methods
- Troubleshooting common issues and error handling
- Platform-specific considerations and quirks

Consult this reference for in-depth technical details, complex query patterns, or when working with uncommon data formats.

## Important Notes

### Data Quality Considerations

- GEO accepts user-submitted data with varying quality standards
- Always check platform annotation and processing methods
- Verify sample metadata and experimental design
- Be cautious with batch effects across studies
- Consider reprocessing raw data for consistency

### File Size Warnings

- Series matrix files can be large (>1 GB for large studies)
- Supplementary files (e.g., CEL files) can be very large
- Plan for adequate disk space before downloading
- Consider downloading samples incrementally

### Data Usage and Citation

- GEO data is freely available for research use
- Always cite original studies when using GEO data
- Cite GEO database: Barrett et al. (2013) Nucleic Acids Research
- Check individual dataset usage restrictions (if any)
- Follow NCBI guidelines for programmatic access

### Common Pitfalls

- Different platforms use different probe IDs (requires annotation mapping)
- Expression values may be raw, normalized, or log-transformed (check metadata)
- Sample metadata can be inconsistently formatted across studies
- Not all series have series matrix files (older submissions)
- Platform annotations may be outdated (genes renamed, IDs deprecated)

## Additional Resources

- **GEO Website:** https://www.ncbi.nlm.nih.gov/geo/
- **GEO Submission Guidelines:** https://www.ncbi.nlm.nih.gov/geo/info/submission.html
- **GEOparse Documentation:** https://geoparse.readthedocs.io/
- **E-utilities Documentation:** https://www.ncbi.nlm.nih.gov/books/NBK25501/
- **GEO FTP Site:** ftp://ftp.ncbi.nlm.nih.gov/geo/
- **GEO2R Tool:** https://www.ncbi.nlm.nih.gov/geo/geo2r/
- **NCBI API Keys:** https://ncbiinsights.ncbi.nlm.nih.gov/2017/11/02/new-api-keys-for-the-e-utilities/
- **Biopython Tutorial:** https://biopython.org/DIST/docs/tutorial/Tutorial.html

