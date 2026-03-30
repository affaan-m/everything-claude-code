---
name: depmap
description: Query the Cancer Dependency Map (DepMap) for cancer cell line gene dependency scores (CRISPR Chronos), drug sensitivity data, and gene effect profiles. Use for identifying cancer-specific vulnerabilities, synthetic lethal interactions, and validating oncology drug targets.
license: CC-BY-4.0
metadata:
    skill-author: Kuan-lin Huang
---

# DepMap — Cancer Dependency Map

## Overview

The Cancer Dependency Map (DepMap) project, run by the Broad Institute, systematically characterizes genetic dependencies across hundreds of cancer cell lines using genome-wide CRISPR knockout screens (DepMap CRISPR), RNA interference (RNAi), and compound sensitivity assays (PRISM). DepMap data is essential for:
- Identifying which genes are essential for specific cancer types
- Finding cancer-selective dependencies (therapeutic targets)
- Validating oncology drug targets
- Discovering synthetic lethal interactions

**Key resources:**
- DepMap Portal: https://depmap.org/portal/
- DepMap data downloads: https://depmap.org/portal/download/all/
- Python package: `depmap` (or access via API/downloads)
- API: https://depmap.org/portal/api/

## When to Use This Skill

Use DepMap when:

- **Target validation**: Is a gene essential for survival in cancer cell lines with a specific mutation (e.g., KRAS-mutant)?
- **Biomarker discovery**: What genomic features predict sensitivity to knockout of a gene?
- **Synthetic lethality**: Find genes that are selectively essential when another gene is mutated/deleted
- **Drug sensitivity**: What cell line features predict response to a compound?
- **Pan-cancer essentiality**: Is a gene broadly essential across all cancer types (bad target) or selectively essential?
- **Correlation analysis**: Which pairs of genes have correlated dependency profiles (co-essentiality)?

## Core Concepts

### Dependency Scores

| Score | Range | Meaning |
|-------|-------|---------|
| **Chronos** (CRISPR) | ~ -3 to 0+ | More negative = more essential. Common essential threshold: −1. Pan-essential genes ~−1 to −2 |
| **RNAi DEMETER2** | ~ -3 to 0+ | Similar scale to Chronos |
| **Gene Effect** | normalized | Normalized Chronos; −1 = median effect of common essential genes |

**Key thresholds:**
- Chronos ≤ −0.5: likely dependent
- Chronos ≤ −1: strongly dependent (common essential range)

### Cell Line Annotations

Each cell line has:
- `DepMap_ID`: unique identifier (e.g., `ACH-000001`)
- `cell_line_name`: human-readable name
- `primary_disease`: cancer type
- `lineage`: broad tissue lineage
- `lineage_subtype`: specific subtype

## Core Capabilities

### 1. DepMap API

```python
import requests
import pandas as pd

BASE_URL = "https://depmap.org/portal/api"

def depmap_get(endpoint, params=None):
    url = f"{BASE_URL}/{endpoint}"
    response = requests.get(url, params=params)
    response.raise_for_status()
    return response.json()
```

### 2. Gene Dependency Scores

```python
def get_gene_dependency(gene_symbol, dataset="Chronos_Combined"):
    """Get CRISPR dependency scores for a gene across all cell lines."""
    url = f"{BASE_URL}/gene"
    params = {
        "gene_id": gene_symbol,
        "dataset": dataset
    }
    response = requests.get(url, params=params)
    return response.json()

# Alternatively, use the /data endpoint:
def get_dependencies_slice(gene_symbol, dataset_name="CRISPRGeneEffect"):
    """Get a gene's dependency slice from a dataset."""
    url = f"{BASE_URL}/data/gene_dependency"
    params = {"gene_name": gene_symbol, "dataset_name": dataset_name}
    response = requests.get(url, params=params)
    data = response.json()
    return data
```

### 3. Download-Based Analysis (Recommended for Large Queries)

For large-scale analysis, download DepMap data files and analyze locally:

```python
import pandas as pd
import requests, os

def download_depmap_data(url, output_path):
    """Download a DepMap data file."""
    response = requests.get(url, stream=True)
    with open(output_path, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)

# DepMap 24Q4 data files (update version as needed)
FILES = {
    "crispr_gene_effect": "https://figshare.com/ndownloader/files/...",
    # OR download from: https://depmap.org/portal/download/all/
    # Files available:
    # CRISPRGeneEffect.csv - Chronos gene effect scores
    # OmicsExpressionProteinCodingGenesTPMLogp1.csv - mRNA expression
    # OmicsSomaticMutationsMatrixDamaging.csv - mutation binary matrix
    # OmicsCNGene.csv - copy number
    # sample_info.csv - cell line metadata
}

def load_depmap_gene_effect(filepath="CRISPRGeneEffect.csv"):
    """
    Load DepMap CRISPR gene effect matrix.
    Rows = cell lines (DepMap_ID), Columns = genes (Symbol (EntrezID))
    """
    df = pd.read_csv(filepath, index_col=0)
    # Rename columns to gene symbols only
    df.columns = [col.split(" ")[0] for col in df.columns]
    return df

def load_cell_line_info(filepath="sample_info.csv"):
    """Load cell line metadata."""
    return pd.read_csv(filepath)
```

### 4. Identifying Selective Dependencies

```python
import numpy as np
import pandas as pd

def find_selective_dependencies(gene_effect_df, cell_line_info, target_gene,
                                 cancer_type=None, threshold=-0.5):
    """Find cell lines selectively dependent on a gene."""

    # Get scores for target gene
    if target_gene not in gene_effect_df.columns:
        return None

    scores = gene_effect_df[target_gene].dropna()
    dependent = scores[scores <= threshold]

    # Add cell line info
    result = pd.DataFrame({
        "DepMap_ID": dependent.index,
        "gene_effect": dependent.values
    }).merge(cell_line_info[["DepMap_ID", "cell_line_name", "primary_disease", "lineage"]])

    if cancer_type:
        result = result[result["primary_disease"].str.contains(cancer_type, case=False, na=False)]

    return result.sort_values("gene_effect")

# Example usage (after loading data)
# df_effect = load_depmap_gene_effect("CRISPRGeneEffect.csv")
# cell_info = load_cell_line_info("sample_info.csv")
# deps = find_selective_dependencies(df_effect, cell_info, "KRAS", cancer_type="Lung")
```

### 5. Biomarker Analysis (Gene Effect vs. Mutation)

```python
import pandas as pd
from scipy import stats

def biomarker_analysis(gene_effect_df, mutation_df, target_gene, biomarker_gene):
    """
    Test if mutation in biomarker_gene predicts dependency on target_gene.

    Args:
        gene_effect_df: CRISPR gene effect DataFrame
        mutation_df: Binary mutation DataFrame (1 = mutated)
        target_gene: Gene to assess dependency of
        biomarker_gene: Gene whose mutation may predict dependency
    """
    if target_gene not in gene_effect_df.columns or biomarker_gene not in mutation_df.columns:
        return None

    # Align cell lines
    common_lines = gene_effect_df.index.intersection(mutation_df.index)
    scores = gene_effect_df.loc[common_lines, target_gene].dropna()
    mutations = mutation_df.loc[scores.index, biomarker_gene]

    mutated = scores[mutations == 1]
    wt = scores[mutations == 0]

    stat, pval = stats.mannwhitneyu(mutated, wt, alternative='less')

    return {
        "target_gene": target_gene,
        "biomarker_gene": biomarker_gene,
        "n_mutated": len(mutated),
        "n_wt": len(wt),
        "mean_effect_mutated": mutated.mean(),
        "mean_effect_wt": wt.mean(),
        "pval": pval,
        "significant": pval < 0.05
    }
```

### 6. Co-Essentiality Analysis

```python
import pandas as pd

def co_essentiality(gene_effect_df, target_gene, top_n=20):
    """Find genes with most correlated dependency profiles (co-essential partners)."""
    if target_gene not in gene_effect_df.columns:
        return None

    target_scores = gene_effect_df[target_gene].dropna()

    correlations = {}
    for gene in gene_effect_df.columns:
        if gene == target_gene:
            continue
        other_scores = gene_effect_df[gene].dropna()
        common = target_scores.index.intersection(other_scores.index)
        if len(common) < 50:
            continue
        r = target_scores[common].corr(other_scores[common])
        if not pd.isna(r):
            correlations[gene] = r

    corr_series = pd.Series(correlations).sort_values(ascending=False)
    return corr_series.head(top_n)

# Co-essential genes often share biological complexes or pathways
```

## Query Workflows

### Workflow 1: Target Validation for a Cancer Type

1. Download `CRISPRGeneEffect.csv` and `sample_info.csv`
2. Filter cell lines by cancer type
3. Compute mean gene effect for target gene in cancer vs. all others
4. Calculate selectivity: how specific is the dependency to your cancer type?
5. Cross-reference with mutation, expression, or CNA data as biomarkers

### Workflow 2: Synthetic Lethality Screen

1. Identify cell lines with mutation/deletion in gene of interest (e.g., BRCA1-mutant)
2. Compute gene effect scores for all genes in mutant vs. WT lines
3. Identify genes significantly more essential in mutant lines (synthetic lethal partners)
4. Filter by selectivity and effect size

### Workflow 3: Compound Sensitivity Analysis

1. Download PRISM compound sensitivity data (`primary-screen-replicate-treatment-info.csv`)
2. Correlate compound AUC/log2(fold-change) with genomic features
3. Identify predictive biomarkers for compound sensitivity

## DepMap Data Files Reference

| File | Description |
|------|-------------|
| `CRISPRGeneEffect.csv` | CRISPR Chronos gene effect (primary dependency data) |
| `CRISPRGeneEffectUnscaled.csv` | Unscaled CRISPR scores |
| `RNAi_merged.csv` | DEMETER2 RNAi dependency |
| `sample_info.csv` | Cell line metadata (lineage, disease, etc.) |
| `OmicsExpressionProteinCodingGenesTPMLogp1.csv` | mRNA expression |
| `OmicsSomaticMutationsMatrixDamaging.csv` | Damaging somatic mutations (binary) |
| `OmicsCNGene.csv` | Copy number per gene |
| `PRISM_Repurposing_Primary_Screens_Data.csv` | Drug sensitivity (repurposing library) |

Download all files from: https://depmap.org/portal/download/all/

## Best Practices

- **Use Chronos scores** (not DEMETER2) for current CRISPR analyses — better controlled for cutting efficiency
- **Distinguish pan-essential from cancer-selective**: Target genes with low variance (essential in all lines) are poor drug targets
- **Validate with expression data**: A gene not expressed in a cell line will score as non-essential regardless of actual function
- **Use DepMap ID** for cell line identification — cell_line_name can be ambiguous
- **Account for copy number**: Amplified genes may appear essential due to copy number effect (junk DNA hypothesis)
- **Multiple testing correction**: When computing biomarker associations genome-wide, apply FDR correction

## Additional Resources

- **DepMap Portal**: https://depmap.org/portal/
- **Data downloads**: https://depmap.org/portal/download/all/
- **DepMap paper**: Behan FM et al. (2019) Nature. PMID: 30971826
- **Chronos paper**: Dempster JM et al. (2021) Nature Methods. PMID: 34349281
- **GitHub**: https://github.com/broadinstitute/depmap-portal
- **Figshare**: https://figshare.com/articles/dataset/DepMap_24Q4_Public/27993966
