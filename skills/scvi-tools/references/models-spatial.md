# Spatial Transcriptomics Models

This document covers models for analyzing spatially-resolved transcriptomics data in scvi-tools.

## DestVI (Deconvolution of Spatial Transcriptomics using Variational Inference)

**Purpose**: Multi-resolution deconvolution of spatial transcriptomics using single-cell reference data.

**Key Features**:
- Estimates cell type proportions at each spatial location
- Uses single-cell RNA-seq reference for deconvolution
- Multi-resolution approach (global and local patterns)
- Accounts for spatial correlation
- Provides uncertainty quantification

**When to Use**:
- Deconvolving Visium or similar spatial transcriptomics
- Have scRNA-seq reference data with cell type labels
- Want to map cell types to spatial locations
- Interested in spatial organization of cell types
- Need probabilistic estimates of cell type abundance

**Data Requirements**:
- **Spatial data**: Visium or similar spot-based measurements (target data)
- **Single-cell reference**: scRNA-seq with cell type annotations
- Both datasets should share genes

**Basic Usage**:
```python
import scvi

# Step 1: Train scVI on single-cell reference
scvi.model.SCVI.setup_anndata(sc_adata, layer="counts")
sc_model = scvi.model.SCVI(sc_adata)
sc_model.train()

# Step 2: Setup spatial data
scvi.model.DESTVI.setup_anndata(
    spatial_adata,
    layer="counts"
)

# Step 3: Train DestVI using reference
model = scvi.model.DESTVI.from_rna_model(
    spatial_adata,
    sc_model,
    cell_type_key="cell_type"  # Cell type labels in reference
)
model.train(max_epochs=2500)

# Step 4: Get cell type proportions
proportions = model.get_proportions()
spatial_adata.obsm["proportions"] = proportions

# Step 5: Get cell type-specific expression
# Expression of genes specific to each cell type at each spot
ct_expression = model.get_scale_for_ct("T cells")
```

**Key Parameters**:
- `amortization`: Amortization strategy ("both", "latent", "proportion")
- `n_latent`: Latent dimensionality (inherited from scVI model)

**Outputs**:
- `get_proportions()`: Cell type proportions at each spot
- `get_scale_for_ct(cell_type)`: Cell type-specific expression patterns
- `get_gamma()`: Proportion-specific gene expression scaling

**Visualization**:
```python
import scanpy as sc
import matplotlib.pyplot as plt

# Visualize specific cell type proportions spatially
sc.pl.spatial(
    spatial_adata,
    color="T cells",  # If proportions added to .obs
    spot_size=150
)

# Or use obsm directly
for ct in cell_types:
    plt.figure()
    sc.pl.spatial(
        spatial_adata,
        color=spatial_adata.obsm["proportions"][ct],
        title=f"{ct} proportions"
    )
```

## Stereoscope

**Purpose**: Cell type deconvolution for spatial transcriptomics using probabilistic modeling.

**Key Features**:
- Reference-based deconvolution
- Probabilistic framework for cell type proportions
- Works with various spatial technologies
- Handles gene selection and normalization

**When to Use**:
- Similar to DestVI but simpler approach
- Deconvolving spatial data with reference
- Faster alternative for basic deconvolution

**Basic Usage**:
```python
scvi.model.STEREOSCOPE.setup_anndata(
    sc_adata,
    labels_key="cell_type",
    layer="counts"
)

# Train on reference
ref_model = scvi.model.STEREOSCOPE(sc_adata)
ref_model.train()

# Setup spatial data
scvi.model.STEREOSCOPE.setup_anndata(spatial_adata, layer="counts")

# Transfer to spatial
spatial_model = scvi.model.STEREOSCOPE.from_reference_model(
    spatial_adata,
    ref_model
)
spatial_model.train()

# Get proportions
proportions = spatial_model.get_proportions()
```

## Tangram

**Purpose**: Spatial mapping and integration of single-cell data to spatial locations.

**Key Features**:
- Maps single cells to spatial coordinates
- Learns optimal transport between single-cell and spatial data
- Gene imputation at spatial locations
- Cell type mapping

**When to Use**:
- Mapping cells from scRNA-seq to spatial locations
- Imputing unmeasured genes in spatial data
- Understanding spatial organization at single-cell resolution
- Integrating scRNA-seq and spatial transcriptomics

**Data Requirements**:
- Single-cell RNA-seq data with annotations
- Spatial transcriptomics data
- Shared genes between modalities

**Basic Usage**:
```python
import tangram as tg

# Map cells to spatial locations
ad_map = tg.map_cells_to_space(
    adata_sc=sc_adata,
    adata_sp=spatial_adata,
    mode="cells",  # or "clusters" for cell type mapping
    density_prior="rna_count_based"
)

# Get mapping matrix (cells × spots)
mapping = ad_map.X

# Project cell annotations to space
tg.project_cell_annotations(
    ad_map,
    spatial_adata,
    annotation="cell_type"
)

# Impute genes in spatial data
genes_to_impute = ["CD3D", "CD8A", "CD4"]
tg.project_genes(ad_map, spatial_adata, genes=genes_to_impute)
```

**Visualization**:
```python
# Visualize cell type mapping
sc.pl.spatial(
    spatial_adata,
    color="cell_type_projected",
    spot_size=100
)
```

## gimVI (Gaussian Identity Multivi for Imputation)

**Purpose**: Cross-modality imputation between spatial and single-cell data.

**Key Features**:
- Joint model of spatial and single-cell data
- Imputes missing genes in spatial data
- Enables cross-dataset queries
- Learns shared representations

**When to Use**:
- Imputing genes not measured in spatial data
- Joint analysis of spatial and single-cell datasets
- Mapping between modalities

**Basic Usage**:
```python
# Combine datasets
combined_adata = sc.concat([sc_adata, spatial_adata])

scvi.model.GIMVI.setup_anndata(
    combined_adata,
    layer="counts"
)

model = scvi.model.GIMVI(combined_adata)
model.train()

# Impute genes in spatial data
imputed = model.get_imputed_values(spatial_indices)
```

## scVIVA (Variation in Variational Autoencoders for Spatial)

**Purpose**: Analyzing cell-environment relationships in spatial data.

**Key Features**:
- Models cellular neighborhoods and environments
- Identifies environment-associated gene expression
- Accounts for spatial correlation structure
- Cell-cell interaction analysis

**When to Use**:
- Understanding how spatial context affects cells
- Identifying niche-specific gene programs
- Cell-cell interaction studies
- Microenvironment analysis

**Data Requirements**:
- Spatial transcriptomics with coordinates
- Cell type annotations (optional)

**Basic Usage**:
```python
scvi.model.SCVIVA.setup_anndata(
    spatial_adata,
    layer="counts",
    spatial_key="spatial"  # Coordinates in .obsm
)

model = scvi.model.SCVIVA(spatial_adata)
model.train()

# Get environment representations
env_latent = model.get_environment_representation()

# Identify environment-associated genes
env_genes = model.get_environment_specific_genes()
```

## ResolVI

**Purpose**: Addressing spatial transcriptomics noise through resolution-aware modeling.

**Key Features**:
- Accounts for spatial resolution effects
- Denoises spatial data
- Multi-scale analysis
- Improves downstream analysis quality

**When to Use**:
- Noisy spatial data
- Multiple spatial resolutions
- Need denoising before analysis
- Improving data quality

**Basic Usage**:
```python
scvi.model.RESOLVI.setup_anndata(
    spatial_adata,
    layer="counts",
    spatial_key="spatial"
)

model = scvi.model.RESOLVI(spatial_adata)
model.train()

# Get denoised expression
denoised = model.get_denoised_expression()
```

## Model Selection for Spatial Transcriptomics

### DestVI
**Choose when**:
- Need detailed deconvolution with reference
- Have high-quality scRNA-seq reference
- Want multi-resolution analysis
- Need uncertainty quantification

**Best for**: Visium, spot-based technologies

### Stereoscope
**Choose when**:
- Need simpler, faster deconvolution
- Basic cell type proportion estimates
- Limited computational resources

**Best for**: Quick deconvolution tasks

### Tangram
**Choose when**:
- Want single-cell resolution mapping
- Need to impute many genes
- Interested in cell positioning
- Optimal transport approach preferred

**Best for**: Detailed spatial mapping

### gimVI
**Choose when**:
- Need bidirectional imputation
- Joint modeling of spatial and single-cell
- Cross-dataset queries

**Best for**: Integration and imputation

### scVIVA
**Choose when**:
- Interested in cellular environments
- Cell-cell interaction analysis
- Neighborhood effects

**Best for**: Microenvironment studies

### ResolVI
**Choose when**:
- Data quality is a concern
- Need denoising
- Multi-scale analysis

**Best for**: Noisy data preprocessing

## Complete Workflow: Spatial Deconvolution with DestVI

```python
import scvi
import scanpy as sc
import squidpy as sq

# ===== Part 1: Prepare single-cell reference =====
# Load and process scRNA-seq reference
sc_adata = sc.read_h5ad("reference_scrna.h5ad")

# QC and filtering
sc.pp.filter_genes(sc_adata, min_cells=10)
sc.pp.highly_variable_genes(sc_adata, n_top_genes=4000)

# Train scVI on reference
scvi.model.SCVI.setup_anndata(
    sc_adata,
    layer="counts",
    batch_key="batch"
)

sc_model = scvi.model.SCVI(sc_adata)
sc_model.train(max_epochs=400)

# ===== Part 2: Load spatial data =====
spatial_adata = sc.read_visium("path/to/visium")
spatial_adata.var_names_make_unique()

# QC spatial data
sc.pp.filter_genes(spatial_adata, min_cells=10)

# ===== Part 3: Run DestVI =====
scvi.model.DESTVI.setup_anndata(
    spatial_adata,
    layer="counts"
)

destvi_model = scvi.model.DESTVI.from_rna_model(
    spatial_adata,
    sc_model,
    cell_type_key="cell_type"
)

destvi_model.train(max_epochs=2500)

# ===== Part 4: Extract results =====
# Get proportions
proportions = destvi_model.get_proportions()
spatial_adata.obsm["proportions"] = proportions

# Add proportions to .obs for easy plotting
for i, ct in enumerate(sc_model.adata.obs["cell_type"].cat.categories):
    spatial_adata.obs[f"prop_{ct}"] = proportions[:, i]

# ===== Part 5: Visualization =====
# Plot specific cell types
cell_types = ["T cells", "B cells", "Macrophages"]

for ct in cell_types:
    sc.pl.spatial(
        spatial_adata,
        color=f"prop_{ct}",
        title=f"{ct} proportions",
        spot_size=150,
        cmap="viridis"
    )

# ===== Part 6: Spatial analysis =====
# Compute spatial neighbors
sq.gr.spatial_neighbors(spatial_adata)

# Spatial autocorrelation of cell types
for ct in cell_types:
    sq.gr.spatial_autocorr(
        spatial_adata,
        attr="obs",
        mode="moran",
        genes=[f"prop_{ct}"]
    )

# ===== Part 7: Save results =====
destvi_model.save("destvi_model")
spatial_adata.write("spatial_deconvolved.h5ad")
```

## Best Practices for Spatial Analysis

1. **Reference quality**: Use high-quality, well-annotated scRNA-seq reference
2. **Gene overlap**: Ensure sufficient shared genes between reference and spatial
3. **Spatial coordinates**: Properly register spatial coordinates in `.obsm["spatial"]`
4. **Validation**: Use known marker genes to validate deconvolution
5. **Visualization**: Always visualize results spatially to check biological plausibility
6. **Cell type granularity**: Consider appropriate cell type resolution
7. **Computational resources**: Spatial models can be memory-intensive
8. **Quality control**: Filter low-quality spots before analysis
