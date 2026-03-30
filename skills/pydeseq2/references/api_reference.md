# PyDESeq2 API Reference

This document provides comprehensive API reference for PyDESeq2 classes, methods, and utilities.

## Core Classes

### DeseqDataSet

The main class for differential expression analysis that handles data processing from normalization through log-fold change fitting.

**Purpose:** Implements dispersion and log fold-change (LFC) estimation for RNA-seq count data.

**Initialization Parameters:**
- `counts`: pandas DataFrame of shape (samples × genes) containing non-negative integer read counts
- `metadata`: pandas DataFrame of shape (samples × variables) with sample annotations
- `design`: str, Wilkinson formula specifying the statistical model (e.g., "~condition", "~group + condition")
- `refit_cooks`: bool, whether to refit parameters after removing Cook's distance outliers (default: True)
- `n_cpus`: int, number of CPUs to use for parallel processing (optional)
- `quiet`: bool, suppress progress messages (default: False)

**Key Methods:**

#### `deseq2()`
Run the complete DESeq2 pipeline for normalization and dispersion/LFC fitting.

**Steps performed:**
1. Compute normalization factors (size factors)
2. Fit genewise dispersions
3. Fit dispersion trend curve
4. Calculate dispersion priors
5. Fit MAP (maximum a posteriori) dispersions
6. Fit log fold changes
7. Calculate Cook's distances for outlier detection
8. Optionally refit if `refit_cooks=True`

**Returns:** None (modifies object in-place)

#### `to_picklable_anndata()`
Convert the DeseqDataSet to an AnnData object that can be saved with pickle.

**Returns:** AnnData object with:
- `X`: count data matrix
- `obs`: sample-level metadata (1D)
- `var`: gene-level metadata (1D)
- `varm`: gene-level multi-dimensional data (e.g., LFC estimates)

**Usage:**
```python
import pickle
with open("result_adata.pkl", "wb") as f:
    pickle.dump(dds.to_picklable_anndata(), f)
```

**Attributes (after running deseq2()):**
- `layers`: dict containing various matrices (normalized counts, etc.)
- `varm`: dict containing gene-level results (log fold changes, dispersions, etc.)
- `obsm`: dict containing sample-level information
- `uns`: dict containing global parameters

---

### DeseqStats

Class for performing statistical tests and computing p-values for differential expression.

**Purpose:** Facilitates PyDESeq2 statistical tests using Wald tests and optional LFC shrinkage.

**Initialization Parameters:**
- `dds`: DeseqDataSet object that has been processed with `deseq2()`
- `contrast`: list or None, specifies the contrast for testing
  - Format: `[variable, test_level, reference_level]`
  - Example: `["condition", "treated", "control"]` tests treated vs control
  - If None, uses the last coefficient in the design formula
- `alpha`: float, significance threshold for independent filtering (default: 0.05)
- `cooks_filter`: bool, whether to filter outliers based on Cook's distance (default: True)
- `independent_filter`: bool, whether to perform independent filtering (default: True)
- `n_cpus`: int, number of CPUs for parallel processing (optional)
- `quiet`: bool, suppress progress messages (default: False)

**Key Methods:**

#### `summary()`
Run Wald tests and compute p-values and adjusted p-values.

**Steps performed:**
1. Run Wald statistical tests for specified contrast
2. Optional Cook's distance filtering
3. Optional independent filtering to remove low-power tests
4. Multiple testing correction (Benjamini-Hochberg procedure)

**Returns:** None (results stored in `results_df` attribute)

**Result DataFrame columns:**
- `baseMean`: mean normalized count across all samples
- `log2FoldChange`: log2 fold change between conditions
- `lfcSE`: standard error of the log2 fold change
- `stat`: Wald test statistic
- `pvalue`: raw p-value
- `padj`: adjusted p-value (FDR-corrected)

#### `lfc_shrink(coeff=None)`
Apply shrinkage to log fold changes using the apeGLM method.

**Purpose:** Reduces noise in LFC estimates for better visualization and ranking, especially for genes with low counts or high variability.

**Parameters:**
- `coeff`: str or None, coefficient name to shrink (if None, uses the coefficient from the contrast)

**Important:** Shrinkage is applied only for visualization/ranking purposes. The statistical test results (p-values, adjusted p-values) remain unchanged.

**Returns:** None (updates `results_df` with shrunk LFCs)

**Attributes:**
- `results_df`: pandas DataFrame containing test results (available after `summary()`)

---

## Utility Functions

### `pydeseq2.utils.load_example_data(modality="single-factor")`

Load synthetic example datasets for testing and tutorials.

**Parameters:**
- `modality`: str, either "single-factor" or "multi-factor"

**Returns:** tuple of (counts_df, metadata_df)
- `counts_df`: pandas DataFrame with synthetic count data
- `metadata_df`: pandas DataFrame with sample annotations

---

## Preprocessing Module

The `pydeseq2.preprocessing` module provides utilities for data preparation.

**Common operations:**
- Gene filtering based on minimum read counts
- Sample filtering based on metadata criteria
- Data transformation and normalization

---

## Inference Classes

### Inference
Abstract base class defining the interface for DESeq2-related inference methods.

### DefaultInference
Default implementation of inference methods using scipy, sklearn, and numpy.

**Purpose:** Provides the mathematical implementations for:
- GLM (Generalized Linear Model) fitting
- Dispersion estimation
- Trend curve fitting
- Statistical testing

---

## Data Structure Requirements

### Count Matrix
- **Shape:** (samples × genes)
- **Type:** pandas DataFrame
- **Values:** Non-negative integers (raw read counts)
- **Index:** Sample identifiers (must match metadata index)
- **Columns:** Gene identifiers

### Metadata
- **Shape:** (samples × variables)
- **Type:** pandas DataFrame
- **Index:** Sample identifiers (must match count matrix index)
- **Columns:** Experimental factors (e.g., "condition", "batch", "group")
- **Values:** Categorical or continuous variables used in the design formula

### Important Notes
- Sample order must match between counts and metadata
- Missing values in metadata should be handled before analysis
- Gene names should be unique
- Count files often need transposition: `counts_df = counts_df.T`

---

## Common Workflow Pattern

```python
from pydeseq2.dds import DeseqDataSet
from pydeseq2.ds import DeseqStats

# 1. Initialize dataset
dds = DeseqDataSet(
    counts=counts_df,
    metadata=metadata,
    design="~condition",
    refit_cooks=True
)

# 2. Fit dispersions and LFCs
dds.deseq2()

# 3. Perform statistical testing
ds = DeseqStats(
    dds,
    contrast=["condition", "treated", "control"],
    alpha=0.05
)
ds.summary()

# 4. Optional: Shrink LFCs for visualization
ds.lfc_shrink()

# 5. Access results
results = ds.results_df
```

---

## Version Compatibility

PyDESeq2 aims to match the default settings of DESeq2 v1.34.0. Some differences may exist as it is a from-scratch reimplementation in Python.

**Tested with:**
- Python 3.10-3.11
- anndata 0.8.0+
- numpy 1.23.0+
- pandas 1.4.3+
- scikit-learn 1.1.1+
- scipy 1.11.0+
