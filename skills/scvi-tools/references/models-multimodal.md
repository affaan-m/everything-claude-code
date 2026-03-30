# Multimodal and Multi-omics Integration Models

This document covers models for joint analysis of multiple data modalities in scvi-tools.

## totalVI (Total Variational Inference)

**Purpose**: Joint analysis of CITE-seq data (simultaneous RNA and protein measurements from same cells).

**Key Features**:
- Jointly models gene expression and protein abundance
- Learns shared low-dimensional representations
- Enables protein imputation from RNA data
- Performs differential expression for both modalities
- Handles batch effects in both RNA and protein layers

**When to Use**:
- Analyzing CITE-seq or REAP-seq data
- Joint RNA + surface protein measurements
- Imputing missing proteins
- Integrating protein and RNA information
- Multi-batch CITE-seq integration

**Data Requirements**:
- AnnData with gene expression in `.X` or a layer
- Protein measurements in `.obsm["protein_expression"]`
- Same cells measured for both modalities

**Basic Usage**:
```python
import scvi

# Setup data - specify both RNA and protein layers
scvi.model.TOTALVI.setup_anndata(
    adata,
    layer="counts",  # RNA counts
    protein_expression_obsm_key="protein_expression",  # Protein counts
    batch_key="batch"
)

# Train model
model = scvi.model.TOTALVI(adata)
model.train()

# Get joint latent representation
latent = model.get_latent_representation()

# Get normalized values for both modalities
rna_normalized = model.get_normalized_expression()
protein_normalized = model.get_normalized_expression(
    transform_batch="batch1",
    protein_expression=True
)

# Differential expression (works for both RNA and protein)
rna_de = model.differential_expression(groupby="cell_type")
protein_de = model.differential_expression(
    groupby="cell_type",
    protein_expression=True
)
```

**Key Parameters**:
- `n_latent`: Latent space dimensionality (default: 20)
- `n_layers_encoder`: Number of encoder layers (default: 1)
- `n_layers_decoder`: Number of decoder layers (default: 1)
- `protein_dispersion`: Protein dispersion handling ("protein" or "protein-batch")
- `empirical_protein_background_prior`: Use empirical background for proteins

**Advanced Features**:

**Protein Imputation**:
```python
# Impute missing proteins for RNA-only cells
# (useful for mapping RNA-seq to CITE-seq reference)
protein_foreground = model.get_protein_foreground_probability()
imputed_proteins = model.get_normalized_expression(
    protein_expression=True,
    n_samples=25
)
```

**Denoising**:
```python
# Get denoised counts for both modalities
denoised_rna = model.get_normalized_expression(n_samples=25)
denoised_protein = model.get_normalized_expression(
    protein_expression=True,
    n_samples=25
)
```

**Best Practices**:
1. Use empirical protein background prior for datasets with ambient protein
2. Consider protein-specific dispersion for heterogeneous protein data
3. Use joint latent space for clustering (better than RNA alone)
4. Validate protein imputation with known markers
5. Check protein QC metrics before training

## MultiVI (Multi-modal Variational Inference)

**Purpose**: Integration of paired and unpaired multi-omic data (e.g., RNA + ATAC, paired and unpaired cells).

**Key Features**:
- Handles paired data (same cells) and unpaired data (different cells)
- Integrates multiple modalities: RNA, ATAC, proteins, etc.
- Missing modality imputation
- Learns shared representations across modalities
- Flexible integration strategy

**When to Use**:
- 10x Multiome data (paired RNA + ATAC)
- Integrating separate RNA-seq and ATAC-seq experiments
- Some cells with both modalities, some with only one
- Cross-modality imputation tasks

**Data Requirements**:
- AnnData with multiple modalities
- Modality indicators (which measurements each cell has)
- Can handle:
  - All cells with both modalities (fully paired)
  - Mix of paired and unpaired cells
  - Completely unpaired datasets

**Basic Usage**:
```python
# Prepare data with modality information
# adata.X should contain all features (genes + peaks)
# adata.var["modality"] indicates "Gene" or "Peak"
# adata.obs["modality"] indicates which modality each cell has

scvi.model.MULTIVI.setup_anndata(
    adata,
    batch_key="batch",
    modality_key="modality"  # Column indicating cell modality
)

model = scvi.model.MULTIVI(adata)
model.train()

# Get joint latent representation
latent = model.get_latent_representation()

# Impute missing modalities
# E.g., predict ATAC for RNA-only cells
imputed_accessibility = model.get_accessibility_estimates(
    indices=rna_only_indices
)

# Get normalized expression/accessibility
rna_normalized = model.get_normalized_expression()
atac_normalized = model.get_accessibility_estimates()
```

**Key Parameters**:
- `n_genes`: Number of gene features
- `n_regions`: Number of accessibility regions
- `n_latent`: Latent dimensionality (default: 20)

**Integration Scenarios**:

**Scenario 1: Fully Paired (10x Multiome)**:
```python
# All cells have both RNA and ATAC
# Single modality key: "paired"
adata.obs["modality"] = "paired"
```

**Scenario 2: Partially Paired**:
```python
# Some cells have both, some RNA-only, some ATAC-only
adata.obs["modality"] = ["RNA+ATAC", "RNA", "ATAC", ...]
```

**Scenario 3: Completely Unpaired**:
```python
# Separate RNA and ATAC experiments
adata.obs["modality"] = ["RNA"] * n_rna + ["ATAC"] * n_atac
```

**Advanced Use Cases**:

**Cross-Modality Prediction**:
```python
# Predict peaks from gene expression
accessibility_from_rna = model.get_accessibility_estimates(
    indices=rna_only_cells
)

# Predict genes from accessibility
expression_from_atac = model.get_normalized_expression(
    indices=atac_only_cells
)
```

**Modality-Specific Analysis**:
```python
# Separate analysis per modality
rna_subset = adata[adata.obs["modality"].str.contains("RNA")]
atac_subset = adata[adata.obs["modality"].str.contains("ATAC")]
```

## MrVI (Multi-resolution Variational Inference)

**Purpose**: Multi-sample analysis accounting for sample-specific and shared variation.

**Key Features**:
- Simultaneously analyzes multiple samples/conditions
- Decomposes variation into:
  - Shared variation (common across samples)
  - Sample-specific variation
- Enables sample-level comparisons
- Identifies sample-specific cell states

**When to Use**:
- Comparing multiple biological samples or conditions
- Identifying sample-specific vs. shared cell states
- Disease vs. healthy sample comparisons
- Understanding inter-sample heterogeneity
- Multi-donor studies

**Basic Usage**:
```python
scvi.model.MRVI.setup_anndata(
    adata,
    layer="counts",
    batch_key="batch",
    sample_key="sample"  # Critical: defines biological samples
)

model = scvi.model.MRVI(adata, n_latent=10, n_latent_sample=5)
model.train()

# Get representations
shared_latent = model.get_latent_representation()  # Shared across samples
sample_specific = model.get_sample_specific_representation()

# Sample distance matrix
sample_distances = model.get_sample_distances()
```

**Key Parameters**:
- `n_latent`: Dimensionality of shared latent space
- `n_latent_sample`: Dimensionality of sample-specific space
- `sample_key`: Column defining biological samples

**Analysis Workflow**:
```python
# 1. Identify shared cell types across samples
sc.pp.neighbors(adata, use_rep="X_MrVI_shared")
sc.tl.umap(adata)
sc.tl.leiden(adata, key_added="shared_clusters")

# 2. Analyze sample-specific variation
sample_repr = model.get_sample_specific_representation()

# 3. Compare samples
distances = model.get_sample_distances()

# 4. Find sample-enriched genes
de_results = model.differential_expression(
    groupby="sample",
    group1="Disease",
    group2="Healthy"
)
```

**Use Cases**:
- **Multi-donor studies**: Separate donor effects from cell type variation
- **Disease studies**: Identify disease-specific vs. shared biology
- **Time series**: Separate temporal from stable variation
- **Batch + biology**: Disentangle technical and biological variation

## totalVI vs. MultiVI vs. MrVI: When to Use Which?

### totalVI
**Use for**: CITE-seq (RNA + protein, same cells)
- Paired measurements
- Single modality type per feature
- Focus: protein imputation, joint analysis

### MultiVI
**Use for**: Multiple modalities (RNA + ATAC, etc.)
- Paired, unpaired, or mixed
- Different feature types
- Focus: cross-modality integration and imputation

### MrVI
**Use for**: Multi-sample RNA-seq
- Single modality (RNA)
- Multiple biological samples
- Focus: sample-level variation decomposition

## Integration Best Practices

### For CITE-seq (totalVI)
1. **Quality control proteins**: Remove low-quality antibodies
2. **Background subtraction**: Use empirical background prior
3. **Joint clustering**: Use joint latent space, not RNA alone
4. **Validation**: Check known markers in both modalities

### For Multiome/Multi-modal (MultiVI)
1. **Feature filtering**: Filter genes and peaks independently
2. **Balance modalities**: Ensure reasonable representation of each
3. **Modality weights**: Consider if one modality dominates
4. **Imputation validation**: Validate imputed values carefully

### For Multi-sample (MrVI)
1. **Sample definition**: Carefully define biological samples
2. **Sample size**: Need sufficient cells per sample
3. **Covariate handling**: Properly account for batch vs. sample
4. **Interpretation**: Distinguish technical from biological variation

## Complete Example: CITE-seq Analysis with totalVI

```python
import scvi
import scanpy as sc

# 1. Load CITE-seq data
adata = sc.read_h5ad("cite_seq.h5ad")

# 2. QC and filtering
sc.pp.filter_genes(adata, min_cells=3)
sc.pp.highly_variable_genes(adata, n_top_genes=4000)

# Protein QC
protein_counts = adata.obsm["protein_expression"]
# Remove low-quality proteins

# 3. Setup totalVI
scvi.model.TOTALVI.setup_anndata(
    adata,
    layer="counts",
    protein_expression_obsm_key="protein_expression",
    batch_key="batch"
)

# 4. Train
model = scvi.model.TOTALVI(adata, n_latent=20)
model.train(max_epochs=400)

# 5. Extract joint representation
latent = model.get_latent_representation()
adata.obsm["X_totalVI"] = latent

# 6. Clustering on joint space
sc.pp.neighbors(adata, use_rep="X_totalVI")
sc.tl.umap(adata)
sc.tl.leiden(adata, resolution=0.5)

# 7. Differential expression for both modalities
rna_de = model.differential_expression(
    groupby="leiden",
    group1="0",
    group2="1"
)

protein_de = model.differential_expression(
    groupby="leiden",
    group1="0",
    group2="1",
    protein_expression=True
)

# 8. Save model
model.save("totalvi_model")
```
