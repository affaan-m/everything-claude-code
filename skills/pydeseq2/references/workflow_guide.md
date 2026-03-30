# PyDESeq2 Workflow Guide

This document provides detailed step-by-step workflows for common PyDESeq2 analysis patterns.

## Table of Contents
1. [Complete Differential Expression Analysis](#complete-differential-expression-analysis)
2. [Data Loading and Preparation](#data-loading-and-preparation)
3. [Single-Factor Analysis](#single-factor-analysis)
4. [Multi-Factor Analysis](#multi-factor-analysis)
5. [Result Export and Visualization](#result-export-and-visualization)
6. [Common Patterns and Best Practices](#common-patterns-and-best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Complete Differential Expression Analysis

### Overview
A standard PyDESeq2 analysis consists of 12 main steps across two phases:

**Phase 1: Read Counts Modeling (Steps 1-7)**
- Normalization and dispersion estimation
- Log fold-change fitting
- Outlier detection

**Phase 2: Statistical Analysis (Steps 8-12)**
- Wald testing
- Multiple testing correction
- Optional LFC shrinkage

### Full Workflow Code

```python
import pandas as pd
from pydeseq2.dds import DeseqDataSet
from pydeseq2.ds import DeseqStats

# Load data
counts_df = pd.read_csv("counts.csv", index_col=0).T  # Transpose if needed
metadata = pd.read_csv("metadata.csv", index_col=0)

# Filter low-count genes
genes_to_keep = counts_df.columns[counts_df.sum(axis=0) >= 10]
counts_df = counts_df[genes_to_keep]

# Remove samples with missing metadata
samples_to_keep = ~metadata.condition.isna()
counts_df = counts_df.loc[samples_to_keep]
metadata = metadata.loc[samples_to_keep]

# Initialize DeseqDataSet
dds = DeseqDataSet(
    counts=counts_df,
    metadata=metadata,
    design="~condition",
    refit_cooks=True
)

# Run normalization and fitting
dds.deseq2()

# Perform statistical testing
ds = DeseqStats(
    dds,
    contrast=["condition", "treated", "control"],
    alpha=0.05,
    cooks_filter=True,
    independent_filter=True
)
ds.summary()

# Optional: Apply LFC shrinkage for visualization
ds.lfc_shrink()

# Access results
results = ds.results_df
print(results.head())
```

---

## Data Loading and Preparation

### Loading CSV Files

Count data typically comes in genes × samples format but needs to be transposed:

```python
import pandas as pd

# Load count matrix (genes × samples)
counts_df = pd.read_csv("counts.csv", index_col=0)

# Transpose to samples × genes
counts_df = counts_df.T

# Load metadata (already in samples × variables format)
metadata = pd.read_csv("metadata.csv", index_col=0)
```

### Loading from Other Formats

**From TSV:**
```python
counts_df = pd.read_csv("counts.tsv", sep="\t", index_col=0).T
metadata = pd.read_csv("metadata.tsv", sep="\t", index_col=0)
```

**From saved pickle:**
```python
import pickle

with open("counts.pkl", "rb") as f:
    counts_df = pickle.load(f)

with open("metadata.pkl", "rb") as f:
    metadata = pickle.load(f)
```

**From AnnData:**
```python
import anndata as ad

adata = ad.read_h5ad("data.h5ad")
counts_df = pd.DataFrame(
    adata.X,
    index=adata.obs_names,
    columns=adata.var_names
)
metadata = adata.obs
```

### Data Filtering

**Filter genes with low counts:**
```python
# Remove genes with fewer than 10 total reads
genes_to_keep = counts_df.columns[counts_df.sum(axis=0) >= 10]
counts_df = counts_df[genes_to_keep]
```

**Filter samples with missing metadata:**
```python
# Remove samples where 'condition' column is NA
samples_to_keep = ~metadata.condition.isna()
counts_df = counts_df.loc[samples_to_keep]
metadata = metadata.loc[samples_to_keep]
```

**Filter by multiple criteria:**
```python
# Keep only samples that meet all criteria
mask = (
    ~metadata.condition.isna() &
    (metadata.batch.isin(["batch1", "batch2"])) &
    (metadata.age >= 18)
)
counts_df = counts_df.loc[mask]
metadata = metadata.loc[mask]
```

### Data Validation

**Check data structure:**
```python
print(f"Counts shape: {counts_df.shape}")  # Should be (samples, genes)
print(f"Metadata shape: {metadata.shape}")  # Should be (samples, variables)
print(f"Indices match: {all(counts_df.index == metadata.index)}")

# Check for negative values
assert (counts_df >= 0).all().all(), "Counts must be non-negative"

# Check for non-integer values
assert counts_df.applymap(lambda x: x == int(x)).all().all(), "Counts must be integers"
```

---

## Single-Factor Analysis

### Simple Two-Group Comparison

Compare treated vs control samples:

```python
from pydeseq2.dds import DeseqDataSet
from pydeseq2.ds import DeseqStats

# Design: model expression as a function of condition
dds = DeseqDataSet(
    counts=counts_df,
    metadata=metadata,
    design="~condition"
)

dds.deseq2()

# Test treated vs control
ds = DeseqStats(
    dds,
    contrast=["condition", "treated", "control"]
)
ds.summary()

# Results
results = ds.results_df
significant = results[results.padj < 0.05]
print(f"Found {len(significant)} significant genes")
```

### Multiple Pairwise Comparisons

When comparing multiple groups:

```python
# Test each treatment vs control
treatments = ["treated_A", "treated_B", "treated_C"]
all_results = {}

for treatment in treatments:
    ds = DeseqStats(
        dds,
        contrast=["condition", treatment, "control"]
    )
    ds.summary()
    all_results[treatment] = ds.results_df

# Compare results across treatments
for name, results in all_results.items():
    sig = results[results.padj < 0.05]
    print(f"{name}: {len(sig)} significant genes")
```

---

## Multi-Factor Analysis

### Two-Factor Design

Account for batch effects while testing condition:

```python
# Design includes both batch and condition
dds = DeseqDataSet(
    counts=counts_df,
    metadata=metadata,
    design="~batch + condition"
)

dds.deseq2()

# Test condition effect while controlling for batch
ds = DeseqStats(
    dds,
    contrast=["condition", "treated", "control"]
)
ds.summary()
```

### Interaction Effects

Test whether treatment effect differs between groups:

```python
# Design includes interaction term
dds = DeseqDataSet(
    counts=counts_df,
    metadata=metadata,
    design="~group + condition + group:condition"
)

dds.deseq2()

# Test the interaction term
ds = DeseqStats(dds, contrast=["group:condition", ...])
ds.summary()
```

### Continuous Covariates

Include continuous variables like age:

```python
# Ensure age is numeric in metadata
metadata["age"] = pd.to_numeric(metadata["age"])

dds = DeseqDataSet(
    counts=counts_df,
    metadata=metadata,
    design="~age + condition"
)

dds.deseq2()
```

---

## Result Export and Visualization

### Saving Results

**Export as CSV:**
```python
# Save statistical results
ds.results_df.to_csv("deseq2_results.csv")

# Save significant genes only
significant = ds.results_df[ds.results_df.padj < 0.05]
significant.to_csv("significant_genes.csv")

# Save with sorted results
sorted_results = ds.results_df.sort_values("padj")
sorted_results.to_csv("sorted_results.csv")
```

**Save DeseqDataSet:**
```python
import pickle

# Save as AnnData for later use
with open("dds_result.pkl", "wb") as f:
    pickle.dump(dds.to_picklable_anndata(), f)
```

**Load saved results:**
```python
# Load results
results = pd.read_csv("deseq2_results.csv", index_col=0)

# Load AnnData
with open("dds_result.pkl", "rb") as f:
    adata = pickle.load(f)
```

### Basic Visualization

**Volcano plot:**
```python
import matplotlib.pyplot as plt
import numpy as np

results = ds.results_df.copy()
results["-log10(padj)"] = -np.log10(results.padj)

# Plot
plt.figure(figsize=(10, 6))
plt.scatter(
    results.log2FoldChange,
    results["-log10(padj)"],
    alpha=0.5,
    s=10
)
plt.axhline(-np.log10(0.05), color='red', linestyle='--', label='padj=0.05')
plt.axvline(1, color='gray', linestyle='--')
plt.axvline(-1, color='gray', linestyle='--')
plt.xlabel("Log2 Fold Change")
plt.ylabel("-Log10(Adjusted P-value)")
plt.title("Volcano Plot")
plt.legend()
plt.savefig("volcano_plot.png", dpi=300)
```

**MA plot:**
```python
plt.figure(figsize=(10, 6))
plt.scatter(
    np.log10(results.baseMean + 1),
    results.log2FoldChange,
    alpha=0.5,
    s=10,
    c=(results.padj < 0.05),
    cmap='bwr'
)
plt.xlabel("Log10(Base Mean + 1)")
plt.ylabel("Log2 Fold Change")
plt.title("MA Plot")
plt.savefig("ma_plot.png", dpi=300)
```

---

## Common Patterns and Best Practices

### 1. Data Preprocessing Checklist

Before running PyDESeq2:
- ✓ Ensure counts are non-negative integers
- ✓ Verify samples × genes orientation
- ✓ Check that sample names match between counts and metadata
- ✓ Remove or handle missing metadata values
- ✓ Filter low-count genes (typically < 10 total reads)
- ✓ Verify experimental factors are properly encoded

### 2. Design Formula Best Practices

**Order matters:** Put adjustment variables before the variable of interest
```python
# Correct: control for batch, test condition
design = "~batch + condition"

# Less ideal: condition listed first
design = "~condition + batch"
```

**Use categorical for discrete variables:**
```python
# Ensure proper data types
metadata["condition"] = metadata["condition"].astype("category")
metadata["batch"] = metadata["batch"].astype("category")
```

### 3. Statistical Testing Guidelines

**Set appropriate alpha:**
```python
# Standard significance threshold
ds = DeseqStats(dds, alpha=0.05)

# More stringent for exploratory analysis
ds = DeseqStats(dds, alpha=0.01)
```

**Use independent filtering:**
```python
# Recommended: filter low-power tests
ds = DeseqStats(dds, independent_filter=True)

# Only disable if you have specific reasons
ds = DeseqStats(dds, independent_filter=False)
```

### 4. LFC Shrinkage

**When to use:**
- For visualization (volcano plots, heatmaps)
- For ranking genes by effect size
- When prioritizing genes for follow-up

**When NOT to use:**
- For reporting statistical significance (use unshrunken p-values)
- For gene set enrichment analysis (typically uses unshrunken values)

```python
# Save both versions
ds.results_df.to_csv("results_unshrunken.csv")
ds.lfc_shrink()
ds.results_df.to_csv("results_shrunken.csv")
```

### 5. Memory Management

For large datasets:
```python
# Use parallel processing
dds = DeseqDataSet(
    counts=counts_df,
    metadata=metadata,
    design="~condition",
    n_cpus=4  # Adjust based on available cores
)

# Process in batches if needed
# (split genes into chunks, analyze separately, combine results)
```

---

## Troubleshooting

### Error: Index mismatch between counts and metadata

**Problem:** Sample names don't match
```
KeyError: Sample names in counts and metadata don't match
```

**Solution:**
```python
# Check indices
print("Counts samples:", counts_df.index.tolist())
print("Metadata samples:", metadata.index.tolist())

# Align if needed
common_samples = counts_df.index.intersection(metadata.index)
counts_df = counts_df.loc[common_samples]
metadata = metadata.loc[common_samples]
```

### Error: All genes have zero counts

**Problem:** Data might need transposition
```
ValueError: All genes have zero total counts
```

**Solution:**
```python
# Check data orientation
print(f"Counts shape: {counts_df.shape}")

# If genes > samples, likely needs transpose
if counts_df.shape[1] < counts_df.shape[0]:
    counts_df = counts_df.T
```

### Warning: Many genes filtered out

**Problem:** Too many low-count genes removed

**Check:**
```python
# See distribution of gene counts
print(counts_df.sum(axis=0).describe())

# Visualize
import matplotlib.pyplot as plt
plt.hist(counts_df.sum(axis=0), bins=50, log=True)
plt.xlabel("Total counts per gene")
plt.ylabel("Frequency")
plt.show()
```

**Adjust filtering if needed:**
```python
# Try lower threshold
genes_to_keep = counts_df.columns[counts_df.sum(axis=0) >= 5]
```

### Error: Design matrix is not full rank

**Problem:** Confounded design (e.g., all treated samples in one batch)

**Solution:**
```python
# Check design confounding
print(pd.crosstab(metadata.condition, metadata.batch))

# Either remove confounded variable or add interaction term
design = "~condition"  # Drop batch
# OR
design = "~condition + batch + condition:batch"  # Add interaction
```

### Issue: No significant genes found

**Possible causes:**
1. Small effect sizes
2. High biological variability
3. Insufficient sample size
4. Technical issues (batch effects, outliers)

**Diagnostics:**
```python
# Check dispersion estimates
import matplotlib.pyplot as plt
dispersions = dds.varm["dispersions"]
plt.hist(dispersions, bins=50)
plt.xlabel("Dispersion")
plt.ylabel("Frequency")
plt.show()

# Check size factors (should be close to 1)
print("Size factors:", dds.obsm["size_factors"])

# Look at top genes even if not significant
top_genes = ds.results_df.nsmallest(20, "pvalue")
print(top_genes)
```

### Memory errors on large datasets

**Solutions:**
```python
# 1. Use fewer CPUs (paradoxically can help)
dds = DeseqDataSet(..., n_cpus=1)

# 2. Filter more aggressively
genes_to_keep = counts_df.columns[counts_df.sum(axis=0) >= 20]

# 3. Process in batches
# Split analysis by gene subsets and combine results
```
