# Differential Expression Analysis in scvi-tools

This document provides detailed information about differential expression (DE) analysis using scvi-tools' probabilistic framework.

## Overview

scvi-tools implements Bayesian differential expression testing that leverages the learned generative models to estimate expression differences between groups. This approach provides several advantages over traditional methods:

- **Batch correction**: DE testing on batch-corrected representations
- **Uncertainty quantification**: Probabilistic estimates of effect sizes
- **Zero-inflation handling**: Proper modeling of dropout and zeros
- **Flexible comparisons**: Between any groups or cell types
- **Multiple modalities**: Works for RNA, proteins (totalVI), and accessibility (PeakVI)

## Core Statistical Framework

### Problem Definition

The goal is to estimate the log fold-change in expression between two conditions:

```
log fold-change = log(μ_B) - log(μ_A)
```

Where μ_A and μ_B are the mean expression levels in conditions A and B.

### Three-Stage Process

**Stage 1: Estimating Expression Levels**
- Sample from posterior distribution of cellular states
- Generate expression values from the learned generative model
- Aggregate across cells to get population-level estimates

**Stage 2: Detecting Relevant Features (Hypothesis Testing)**
- Test for differential expression using Bayesian framework
- Two testing modes available:
  - **"vanilla" mode**: Point null hypothesis (β = 0)
  - **"change" mode**: Composite hypothesis (|β| ≤ δ)

**Stage 3: Controlling False Discovery**
- Posterior expected False Discovery Proportion (FDP) control
- Selects maximum number of discoveries ensuring E[FDP] ≤ α

## Basic Usage

### Simple Two-Group Comparison

```python
import scvi

# After training a model
model = scvi.model.SCVI(adata)
model.train()

# Compare two cell types
de_results = model.differential_expression(
    groupby="cell_type",
    group1="T cells",
    group2="B cells"
)

# View top DE genes
top_genes = de_results.sort_values("lfc_mean", ascending=False).head(20)
print(top_genes[["lfc_mean", "lfc_std", "bayes_factor", "is_de_fdr_0.05"]])
```

### One vs. Rest Comparison

```python
# Compare one group against all others
de_results = model.differential_expression(
    groupby="cell_type",
    group1="T cells"  # No group2 = compare to rest
)
```

### All Pairwise Comparisons

```python
# Compare all cell types pairwise
all_comparisons = {}

cell_types = adata.obs["cell_type"].unique()

for ct1 in cell_types:
    for ct2 in cell_types:
        if ct1 != ct2:
            key = f"{ct1}_vs_{ct2}"
            all_comparisons[key] = model.differential_expression(
                groupby="cell_type",
                group1=ct1,
                group2=ct2
            )
```

## Key Parameters

### `groupby` (required)
Column in `adata.obs` defining groups to compare.

```python
# Must be a categorical variable
de_results = model.differential_expression(groupby="cell_type")
```

### `group1` and `group2`
Groups to compare. If `group2` is None, compares `group1` to all others.

```python
# Specific comparison
de = model.differential_expression(groupby="condition", group1="treated", group2="control")

# One vs rest
de = model.differential_expression(groupby="cell_type", group1="T cells")
```

### `mode` (Hypothesis Testing Mode)

**"vanilla" mode** (default): Point null hypothesis
- Tests if β = 0 exactly
- More sensitive, but may find trivially small effects

**"change" mode**: Composite null hypothesis
- Tests if |β| ≤ δ
- Requires biologically meaningful change
- Reduces false discoveries of tiny effects

```python
# Change mode with minimum effect size
de = model.differential_expression(
    groupby="cell_type",
    group1="T cells",
    group2="B cells",
    mode="change",
    delta=0.25  # Minimum log fold-change
)
```

### `delta`
Minimum effect size threshold for "change" mode.
- Typical values: 0.25, 0.5, 0.7 (log scale)
- log2(1.5) ≈ 0.58 (1.5-fold change)
- log2(2) = 1.0 (2-fold change)

```python
# Require at least 1.5-fold change
de = model.differential_expression(
    groupby="condition",
    group1="disease",
    group2="healthy",
    mode="change",
    delta=0.58  # log2(1.5)
)
```

### `fdr_target`
False discovery rate threshold (default: 0.05)

```python
# More stringent FDR control
de = model.differential_expression(
    groupby="cell_type",
    group1="T cells",
    fdr_target=0.01
)
```

### `batch_correction`
Whether to perform batch correction during DE testing (default: True)

```python
# Test within a specific batch
de = model.differential_expression(
    groupby="cell_type",
    group1="T cells",
    group2="B cells",
    batch_correction=False
)
```

### `n_samples`
Number of posterior samples for estimation (default: 5000)
- More samples = more accurate but slower
- Reduce for speed, increase for precision

```python
# High precision analysis
de = model.differential_expression(
    groupby="cell_type",
    group1="T cells",
    n_samples=10000
)
```

## Interpreting Results

### Output Columns

The results DataFrame contains several important columns:

**Effect Size Estimates**:
- `lfc_mean`: Mean log fold-change
- `lfc_median`: Median log fold-change
- `lfc_std`: Standard deviation of log fold-change
- `lfc_min`: Lower bound of effect size
- `lfc_max`: Upper bound of effect size

**Statistical Significance**:
- `bayes_factor`: Bayes factor for differential expression
  - Higher values = stronger evidence
  - >3 often considered meaningful
- `is_de_fdr_0.05`: Boolean indicating if gene is DE at FDR 0.05
- `is_de_fdr_0.1`: Boolean indicating if gene is DE at FDR 0.1

**Expression Levels**:
- `mean1`: Mean expression in group 1
- `mean2`: Mean expression in group 2
- `non_zeros_proportion1`: Proportion of non-zero cells in group 1
- `non_zeros_proportion2`: Proportion of non-zero cells in group 2

### Example Interpretation

```python
de_results = model.differential_expression(
    groupby="cell_type",
    group1="T cells",
    group2="B cells"
)

# Find significantly upregulated genes in T cells
upreg_tcells = de_results[
    (de_results["is_de_fdr_0.05"]) &
    (de_results["lfc_mean"] > 0)
].sort_values("lfc_mean", ascending=False)

print(f"Upregulated genes in T cells: {len(upreg_tcells)}")
print(upreg_tcells.head(10))

# Find genes with large effect sizes
large_effect = de_results[
    (de_results["is_de_fdr_0.05"]) &
    (abs(de_results["lfc_mean"]) > 1)  # 2-fold change
]
```

## Advanced Usage

### DE Within Specific Cells

```python
# Test DE only within a subset of cells
subset_indices = adata.obs["tissue"] == "lung"

de = model.differential_expression(
    idx1=adata.obs["cell_type"] == "T cells" & subset_indices,
    idx2=adata.obs["cell_type"] == "B cells" & subset_indices
)
```

### Batch-Specific DE

```python
# Test DE within each batch separately
batches = adata.obs["batch"].unique()

batch_de_results = {}
for batch in batches:
    batch_idx = adata.obs["batch"] == batch
    batch_de_results[batch] = model.differential_expression(
        idx1=(adata.obs["condition"] == "treated") & batch_idx,
        idx2=(adata.obs["condition"] == "control") & batch_idx
    )
```

### Pseudo-bulk DE

```python
# Aggregate cells before DE testing
# Useful for low cell counts per group

de = model.differential_expression(
    groupby="cell_type",
    group1="rare_cell_type",
    group2="common_cell_type",
    n_samples=10000,  # More samples for stability
    batch_correction=True
)
```

## Visualization

### Volcano Plot

```python
import matplotlib.pyplot as plt
import numpy as np

de = model.differential_expression(
    groupby="condition",
    group1="treated",
    group2="control"
)

# Volcano plot
plt.figure(figsize=(10, 6))
plt.scatter(
    de["lfc_mean"],
    -np.log10(1 / (de["bayes_factor"] + 1)),
    c=de["is_de_fdr_0.05"],
    cmap="coolwarm",
    alpha=0.5
)
plt.xlabel("Log Fold Change")
plt.ylabel("-log10(1/Bayes Factor)")
plt.title("Volcano Plot: Treated vs Control")
plt.axvline(x=0, color='k', linestyle='--', linewidth=0.5)
plt.show()
```

### Heatmap of Top DE Genes

```python
import seaborn as sns

# Get top DE genes
top_genes = de.sort_values("lfc_mean", ascending=False).head(50).index

# Get normalized expression
norm_expr = model.get_normalized_expression(
    adata,
    indices=adata.obs["condition"].isin(["treated", "control"]),
    gene_list=top_genes
)

# Plot heatmap
plt.figure(figsize=(12, 10))
sns.heatmap(
    norm_expr.T,
    cmap="viridis",
    xticklabels=False,
    yticklabels=top_genes
)
plt.title("Top 50 DE Genes")
plt.show()
```

### Ranked Gene Plot

```python
# Plot genes ranked by effect size
de_sorted = de.sort_values("lfc_mean", ascending=False)

plt.figure(figsize=(12, 6))
plt.plot(range(len(de_sorted)), de_sorted["lfc_mean"].values)
plt.axhline(y=0, color='r', linestyle='--')
plt.xlabel("Gene Rank")
plt.ylabel("Log Fold Change")
plt.title("Genes Ranked by Effect Size")
plt.show()
```

## Comparison with Traditional Methods

### scvi-tools vs. Wilcoxon Test

```python
import scanpy as sc

# Traditional Wilcoxon test
sc.tl.rank_genes_groups(
    adata,
    groupby="cell_type",
    method="wilcoxon",
    key_added="wilcoxon"
)

# scvi-tools DE
de_scvi = model.differential_expression(
    groupby="cell_type",
    group1="T cells"
)

# Compare results
wilcox_results = sc.get.rank_genes_groups_df(adata, group="T cells", key="wilcoxon")
```

**Advantages of scvi-tools**:
- Accounts for batch effects automatically
- Handles zero-inflation properly
- Provides uncertainty quantification
- No arbitrary pseudocount needed
- Better statistical properties

**When to use Wilcoxon**:
- Very quick exploratory analysis
- Comparison with published results using Wilcoxon

## Multi-Modal DE

### Protein DE (totalVI)

```python
# Train totalVI on CITE-seq data
totalvi_model = scvi.model.TOTALVI(adata)
totalvi_model.train()

# RNA differential expression
rna_de = totalvi_model.differential_expression(
    groupby="cell_type",
    group1="T cells",
    group2="B cells",
    protein_expression=False  # Default
)

# Protein differential expression
protein_de = totalvi_model.differential_expression(
    groupby="cell_type",
    group1="T cells",
    group2="B cells",
    protein_expression=True
)

print(f"DE genes: {rna_de['is_de_fdr_0.05'].sum()}")
print(f"DE proteins: {protein_de['is_de_fdr_0.05'].sum()}")
```

### Differential Accessibility (PeakVI)

```python
# Train PeakVI on ATAC-seq data
peakvi_model = scvi.model.PEAKVI(atac_adata)
peakvi_model.train()

# Differential accessibility
da = peakvi_model.differential_accessibility(
    groupby="cell_type",
    group1="T cells",
    group2="B cells"
)

# Same interpretation as DE
```

## Handling Special Cases

### Low Cell Count Groups

```python
# Increase posterior samples for stability
de = model.differential_expression(
    groupby="cell_type",
    group1="rare_type",  # e.g., 50 cells
    group2="common_type",  # e.g., 5000 cells
    n_samples=10000
)
```

### Imbalanced Comparisons

```python
# When groups have very different sizes
# Use change mode to avoid tiny effects

de = model.differential_expression(
    groupby="condition",
    group1="rare_condition",
    group2="common_condition",
    mode="change",
    delta=0.5
)
```

### Multiple Testing Correction

```python
# Already included via FDP control
# But can apply additional corrections

from statsmodels.stats.multitest import multipletests

# Bonferroni correction (very conservative)
_, pvals_corrected, _, _ = multipletests(
    1 / (de["bayes_factor"] + 1),
    method="bonferroni"
)
```

## Performance Considerations

### Speed Optimization

```python
# Faster DE testing for large datasets
de = model.differential_expression(
    groupby="cell_type",
    group1="T cells",
    n_samples=1000,  # Reduce samples
    batch_size=512    # Increase batch size
)
```

### Memory Management

```python
# For very large datasets
# Test one comparison at a time rather than all pairwise

cell_types = adata.obs["cell_type"].unique()
for ct in cell_types:
    de = model.differential_expression(
        groupby="cell_type",
        group1=ct
    )
    # Save results
    de.to_csv(f"de_results_{ct}.csv")
```

## Best Practices

1. **Use "change" mode**: For biologically interpretable results
2. **Set appropriate delta**: Based on biological significance
3. **Check expression levels**: Filter lowly expressed genes
4. **Validate findings**: Check marker genes for sanity
5. **Visualize results**: Always plot top DE genes
6. **Report parameters**: Document mode, delta, FDR used
7. **Consider batch effects**: Use batch_correction=True
8. **Multiple comparisons**: Be aware of testing many groups
9. **Sample size**: Ensure sufficient cells per group (>50 recommended)
10. **Biological validation**: Follow up with functional experiments

## Example: Complete DE Analysis Workflow

```python
import scvi
import scanpy as sc
import matplotlib.pyplot as plt

# 1. Train model
scvi.model.SCVI.setup_anndata(adata, layer="counts", batch_key="batch")
model = scvi.model.SCVI(adata)
model.train()

# 2. Perform DE analysis
de_results = model.differential_expression(
    groupby="cell_type",
    group1="Disease_T_cells",
    group2="Healthy_T_cells",
    mode="change",
    delta=0.5,
    fdr_target=0.05
)

# 3. Filter and analyze
sig_genes = de_results[de_results["is_de_fdr_0.05"]]
upreg = sig_genes[sig_genes["lfc_mean"] > 0].sort_values("lfc_mean", ascending=False)
downreg = sig_genes[sig_genes["lfc_mean"] < 0].sort_values("lfc_mean")

print(f"Significant genes: {len(sig_genes)}")
print(f"Upregulated: {len(upreg)}")
print(f"Downregulated: {len(downreg)}")

# 4. Visualize top genes
top_genes = upreg.head(10).index.tolist() + downreg.head(10).index.tolist()

sc.pl.violin(
    adata[adata.obs["cell_type"].isin(["Disease_T_cells", "Healthy_T_cells"])],
    keys=top_genes,
    groupby="cell_type",
    rotation=90
)

# 5. Functional enrichment (using external tools)
# E.g., g:Profiler, DAVID, or gprofiler-official Python package
upreg_genes = upreg.head(100).index.tolist()
# Perform pathway analysis...

# 6. Save results
de_results.to_csv("de_results_disease_vs_healthy.csv")
upreg.to_csv("upregulated_genes.csv")
downreg.to_csv("downregulated_genes.csv")
```
