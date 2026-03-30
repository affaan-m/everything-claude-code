# Specialized Modality Models

This document covers models for specialized single-cell data modalities in scvi-tools.

## MethylVI / MethylANVI (Methylation Analysis)

**Purpose**: Analysis of single-cell bisulfite sequencing (scBS-seq) data for DNA methylation.

**Key Features**:
- Models methylation patterns at single-cell resolution
- Handles sparsity in methylation data
- Batch correction for methylation experiments
- Label transfer (MethylANVI) for cell type annotation

**When to Use**:
- Analyzing scBS-seq or similar methylation data
- Studying DNA methylation patterns across cell types
- Integrating methylation data across batches
- Cell type annotation based on methylation profiles

**Data Requirements**:
- Methylation count matrices (methylated vs. total reads per CpG site)
- Format: Cells × CpG sites with methylation ratios or counts

### MethylVI (Unsupervised)

**Basic Usage**:
```python
import scvi

# Setup methylation data
scvi.model.METHYLVI.setup_anndata(
    adata,
    layer="methylation_counts",  # Methylation data
    batch_key="batch"
)

model = scvi.model.METHYLVI(adata)
model.train()

# Get latent representation
latent = model.get_latent_representation()

# Get normalized methylation values
normalized_meth = model.get_normalized_methylation()
```

### MethylANVI (Semi-supervised with cell types)

**Basic Usage**:
```python
# Setup with cell type labels
scvi.model.METHYLANVI.setup_anndata(
    adata,
    layer="methylation_counts",
    batch_key="batch",
    labels_key="cell_type",
    unlabeled_category="Unknown"
)

model = scvi.model.METHYLANVI(adata)
model.train()

# Predict cell types
predictions = model.predict()
```

**Key Parameters**:
- `n_latent`: Latent dimensionality
- `region_factors`: Model region-specific effects

**Use Cases**:
- Epigenetic heterogeneity analysis
- Cell type identification via methylation
- Integration with gene expression data (separate analysis)
- Differential methylation analysis

## CytoVI (Flow and Mass Cytometry)

**Purpose**: Batch correction and integration of flow cytometry and mass cytometry (CyTOF) data.

**Key Features**:
- Handles antibody-based protein measurements
- Corrects batch effects in cytometry data
- Enables integration across experiments
- Designed for high-dimensional protein panels

**When to Use**:
- Analyzing flow cytometry or CyTOF data
- Integrating cytometry experiments across batches
- Batch correction for protein panels
- Cross-study cytometry integration

**Data Requirements**:
- Protein expression matrix (cells × proteins)
- Flow cytometry or CyTOF measurements
- Batch/experiment annotations

**Basic Usage**:
```python
scvi.model.CYTOVI.setup_anndata(
    adata,
    protein_expression_obsm_key="protein_expression",
    batch_key="batch"
)

model = scvi.model.CYTOVI(adata)
model.train()

# Get batch-corrected representation
latent = model.get_latent_representation()

# Get normalized protein values
normalized = model.get_normalized_expression()
```

**Key Parameters**:
- `n_latent`: Latent space dimensionality
- `n_layers`: Network depth

**Typical Workflow**:
```python
import scanpy as sc

# 1. Load cytometry data
adata = sc.read_h5ad("cytof_data.h5ad")

# 2. Train CytoVI
scvi.model.CYTOVI.setup_anndata(
    adata,
    protein_expression_obsm_key="protein",
    batch_key="experiment"
)
model = scvi.model.CYTOVI(adata)
model.train()

# 3. Get batch-corrected values
latent = model.get_latent_representation()
adata.obsm["X_CytoVI"] = latent

# 4. Downstream analysis
sc.pp.neighbors(adata, use_rep="X_CytoVI")
sc.tl.umap(adata)
sc.tl.leiden(adata)

# 5. Visualize batch correction
sc.pl.umap(adata, color=["batch", "leiden"])
```

## SysVI (Systems-level Integration)

**Purpose**: Batch effect correction with emphasis on preserving biological variation.

**Key Features**:
- Specialized batch integration approach
- Preserves biological signals while removing technical effects
- Designed for large-scale integration studies

**When to Use**:
- Large-scale multi-batch integration
- Need to preserve subtle biological variation
- Systems-level analysis across many studies

**Basic Usage**:
```python
scvi.model.SYSVI.setup_anndata(
    adata,
    layer="counts",
    batch_key="batch"
)

model = scvi.model.SYSVI(adata)
model.train()

latent = model.get_latent_representation()
```

## Decipher (Trajectory Inference)

**Purpose**: Trajectory inference and pseudotime analysis for single-cell data.

**Key Features**:
- Learns cellular trajectories and differentiation paths
- Pseudotime estimation
- Accounts for uncertainty in trajectory structure
- Compatible with scVI embeddings

**When to Use**:
- Studying cellular differentiation
- Time-course or developmental datasets
- Understanding cell state transitions
- Identifying branching points in development

**Basic Usage**:
```python
# Typically used after scVI for embeddings
scvi_model = scvi.model.SCVI(adata)
scvi_model.train()

# Decipher for trajectory
scvi.model.DECIPHER.setup_anndata(adata)
decipher_model = scvi.model.DECIPHER(adata, scvi_model)
decipher_model.train()

# Get pseudotime
pseudotime = decipher_model.get_pseudotime()
adata.obs["pseudotime"] = pseudotime
```

**Visualization**:
```python
import scanpy as sc

# Plot pseudotime on UMAP
sc.pl.umap(adata, color="pseudotime", cmap="viridis")

# Gene expression along pseudotime
sc.pl.scatter(adata, x="pseudotime", y="gene_of_interest")
```

## peRegLM (Peak Regulatory Linear Model)

**Purpose**: Linking chromatin accessibility to gene expression for regulatory analysis.

**Key Features**:
- Links ATAC-seq peaks to gene expression
- Identifies regulatory relationships
- Works with paired multiome data

**When to Use**:
- Multiome data (RNA + ATAC from same cells)
- Understanding gene regulation
- Linking peaks to target genes
- Regulatory network construction

**Basic Usage**:
```python
# Requires paired RNA + ATAC data
scvi.model.PEREGLM.setup_anndata(
    multiome_adata,
    rna_layer="counts",
    atac_layer="atac_counts"
)

model = scvi.model.PEREGLM(multiome_adata)
model.train()

# Get peak-gene links
peak_gene_links = model.get_regulatory_links()
```

## Model-Specific Best Practices

### MethylVI/MethylANVI
1. **Sparsity**: Methylation data is inherently sparse; model accounts for this
2. **CpG selection**: Filter CpGs with very low coverage
3. **Biological interpretation**: Consider genomic context (promoters, enhancers)
4. **Integration**: For multi-omics, analyze separately then integrate results

### CytoVI
1. **Protein QC**: Remove low-quality or uninformative proteins
2. **Compensation**: Ensure proper spectral compensation before analysis
3. **Batch design**: Include biological and technical replicates
4. **Controls**: Use control samples to validate batch correction

### SysVI
1. **Sample size**: Designed for large-scale integration
2. **Batch definition**: Carefully define batch structure
3. **Biological validation**: Verify biological signals preserved

### Decipher
1. **Start point**: Define trajectory start cells if known
2. **Branching**: Specify expected number of branches
3. **Validation**: Use known markers to validate pseudotime
4. **Integration**: Works well with scVI embeddings

## Integration with Other Models

Many specialized models work well in combination:

**Methylation + Expression**:
```python
# Analyze separately, then integrate
methylvi_model = scvi.model.METHYLVI(meth_adata)
scvi_model = scvi.model.SCVI(rna_adata)

# Integrate results at analysis level
# E.g., correlate methylation and expression patterns
```

**Cytometry + CITE-seq**:
```python
# CytoVI for flow/CyTOF
cyto_model = scvi.model.CYTOVI(cyto_adata)

# totalVI for CITE-seq
cite_model = scvi.model.TOTALVI(cite_adata)

# Compare protein measurements across platforms
```

**ATAC + RNA (Multiome)**:
```python
# MultiVI for joint analysis
multivi_model = scvi.model.MULTIVI(multiome_adata)

# peRegLM for regulatory links
pereglm_model = scvi.model.PEREGLM(multiome_adata)
```

## Choosing Specialized Models

### Decision Tree

1. **What data modality?**
   - Methylation → MethylVI/MethylANVI
   - Flow/CyTOF → CytoVI
   - Trajectory → Decipher
   - Multi-batch integration → SysVI
   - Regulatory links → peRegLM

2. **Do you have labels?**
   - Yes → MethylANVI (methylation)
   - No → MethylVI (methylation)

3. **What's your main goal?**
   - Batch correction → CytoVI, SysVI
   - Trajectory/pseudotime → Decipher
   - Peak-gene links → peRegLM
   - Methylation patterns → MethylVI/ANVI

## Example: Complete Methylation Analysis

```python
import scvi
import scanpy as sc

# 1. Load methylation data
meth_adata = sc.read_h5ad("methylation_data.h5ad")

# 2. QC: filter low-coverage CpG sites
sc.pp.filter_genes(meth_adata, min_cells=10)

# 3. Setup MethylVI
scvi.model.METHYLVI.setup_anndata(
    meth_adata,
    layer="methylation",
    batch_key="batch"
)

# 4. Train model
model = scvi.model.METHYLVI(meth_adata, n_latent=15)
model.train(max_epochs=400)

# 5. Get latent representation
latent = model.get_latent_representation()
meth_adata.obsm["X_MethylVI"] = latent

# 6. Clustering
sc.pp.neighbors(meth_adata, use_rep="X_MethylVI")
sc.tl.umap(meth_adata)
sc.tl.leiden(meth_adata)

# 7. Differential methylation
dm_results = model.differential_methylation(
    groupby="leiden",
    group1="0",
    group2="1"
)

# 8. Save
model.save("methylvi_model")
meth_adata.write("methylation_analyzed.h5ad")
```

## External Tools Integration

Some specialized models are available as external packages:

**SOLO** (doublet detection):
```python
from scvi.external import SOLO

solo = SOLO.from_scvi_model(scvi_model)
solo.train()
doublets = solo.predict()
```

**scArches** (reference mapping):
```python
from scvi.external import SCARCHES

# For transfer learning and query-to-reference mapping
```

These external tools extend scvi-tools functionality for specific use cases.

## Summary Table

| Model | Data Type | Primary Use | Supervised? |
|-------|-----------|-------------|-------------|
| MethylVI | Methylation | Unsupervised analysis | No |
| MethylANVI | Methylation | Cell type annotation | Semi |
| CytoVI | Cytometry | Batch correction | No |
| SysVI | scRNA-seq | Large-scale integration | No |
| Decipher | scRNA-seq | Trajectory inference | No |
| peRegLM | Multiome | Peak-gene links | No |
| SOLO | scRNA-seq | Doublet detection | Semi |
