# Single-Cell RNA-seq Models

This document covers core models for analyzing single-cell RNA sequencing data in scvi-tools.

## scVI (Single-Cell Variational Inference)

**Purpose**: Unsupervised analysis, dimensionality reduction, and batch correction for scRNA-seq data.

**Key Features**:
- Deep generative model based on variational autoencoders (VAE)
- Learns low-dimensional latent representations that capture biological variation
- Automatically corrects for batch effects and technical covariates
- Enables normalized gene expression estimation
- Supports differential expression analysis

**When to Use**:
- Initial exploration and dimensionality reduction of scRNA-seq datasets
- Integrating multiple batches or studies
- Generating batch-corrected expression matrices
- Performing probabilistic differential expression analysis

**Basic Usage**:
```python
import scvi

# Setup data
scvi.model.SCVI.setup_anndata(
    adata,
    layer="counts",
    batch_key="batch"
)

# Train model
model = scvi.model.SCVI(adata, n_latent=30)
model.train()

# Extract results
latent = model.get_latent_representation()
normalized = model.get_normalized_expression()
```

**Key Parameters**:
- `n_latent`: Dimensionality of latent space (default: 10)
- `n_layers`: Number of hidden layers (default: 1)
- `n_hidden`: Number of nodes per hidden layer (default: 128)
- `dropout_rate`: Dropout rate for neural networks (default: 0.1)
- `dispersion`: Gene-specific or cell-specific dispersion ("gene" or "gene-batch")
- `gene_likelihood`: Distribution for data ("zinb", "nb", "poisson")

**Outputs**:
- `get_latent_representation()`: Batch-corrected low-dimensional embeddings
- `get_normalized_expression()`: Denoised, normalized expression values
- `differential_expression()`: Probabilistic DE testing between groups
- `get_feature_correlation_matrix()`: Gene-gene correlation estimates

## scANVI (Single-Cell ANnotation using Variational Inference)

**Purpose**: Semi-supervised cell type annotation and integration using labeled and unlabeled cells.

**Key Features**:
- Extends scVI with cell type labels
- Leverages partially labeled datasets for annotation transfer
- Performs simultaneous batch correction and cell type prediction
- Enables query-to-reference mapping

**When to Use**:
- Annotating new datasets using reference labels
- Transfer learning from well-annotated to unlabeled datasets
- Joint analysis of labeled and unlabeled cells
- Building cell type classifiers with uncertainty quantification

**Basic Usage**:
```python
# Option 1: Train from scratch
scvi.model.SCANVI.setup_anndata(
    adata,
    layer="counts",
    batch_key="batch",
    labels_key="cell_type",
    unlabeled_category="Unknown"
)
model = scvi.model.SCANVI(adata)
model.train()

# Option 2: Initialize from pretrained scVI
scvi_model = scvi.model.SCVI(adata)
scvi_model.train()
scanvi_model = scvi.model.SCANVI.from_scvi_model(
    scvi_model,
    unlabeled_category="Unknown"
)
scanvi_model.train()

# Predict cell types
predictions = scanvi_model.predict()
```

**Key Parameters**:
- `labels_key`: Column in `adata.obs` containing cell type labels
- `unlabeled_category`: Label for cells without annotations
- All scVI parameters are also available

**Outputs**:
- `predict()`: Cell type predictions for all cells
- `predict_proba()`: Prediction probabilities
- `get_latent_representation()`: Cell type-aware latent space

## AUTOZI

**Purpose**: Automatic identification and modeling of zero-inflated genes in scRNA-seq data.

**Key Features**:
- Distinguishes biological zeros from technical dropout
- Learns which genes exhibit zero-inflation
- Provides gene-specific zero-inflation probabilities
- Improves downstream analysis by accounting for dropout

**When to Use**:
- Detecting which genes are affected by technical dropout
- Improving imputation and normalization for sparse datasets
- Understanding the extent of zero-inflation in your data

**Basic Usage**:
```python
scvi.model.AUTOZI.setup_anndata(adata, layer="counts")
model = scvi.model.AUTOZI(adata)
model.train()

# Get zero-inflation probabilities per gene
zi_probs = model.get_alphas_betas()
```

## VeloVI

**Purpose**: RNA velocity analysis using variational inference.

**Key Features**:
- Joint modeling of spliced and unspliced RNA counts
- Probabilistic estimation of RNA velocity
- Accounts for technical noise and batch effects
- Provides uncertainty quantification for velocity estimates

**When to Use**:
- Inferring cellular dynamics and differentiation trajectories
- Analyzing spliced/unspliced count data
- RNA velocity analysis with batch correction

**Basic Usage**:
```python
import scvelo as scv

# Prepare velocity data
scv.pp.filter_and_normalize(adata)
scv.pp.moments(adata)

# Train VeloVI
scvi.model.VELOVI.setup_anndata(adata, spliced_layer="Ms", unspliced_layer="Mu")
model = scvi.model.VELOVI(adata)
model.train()

# Get velocity estimates
latent_time = model.get_latent_time()
velocities = model.get_velocity()
```

## contrastiveVI

**Purpose**: Isolating perturbation-specific variations from background biological variation.

**Key Features**:
- Separates shared variation (common across conditions) from target-specific variation
- Useful for perturbation studies (drug treatments, genetic perturbations)
- Identifies condition-specific gene programs
- Enables discovery of treatment-specific effects

**When to Use**:
- Analyzing perturbation experiments (drug screens, CRISPR, etc.)
- Identifying genes responding specifically to treatments
- Separating treatment effects from background variation
- Comparing control vs. perturbed conditions

**Basic Usage**:
```python
scvi.model.CONTRASTIVEVI.setup_anndata(
    adata,
    layer="counts",
    batch_key="batch",
    categorical_covariate_keys=["condition"]  # control vs treated
)

model = scvi.model.CONTRASTIVEVI(
    adata,
    n_latent=10,        # Shared variation
    n_latent_target=5   # Target-specific variation
)
model.train()

# Extract representations
shared = model.get_latent_representation(representation="shared")
target_specific = model.get_latent_representation(representation="target")
```

## CellAssign

**Purpose**: Marker-based cell type annotation using known marker genes.

**Key Features**:
- Uses prior knowledge of marker genes for cell types
- Probabilistic assignment of cells to types
- Handles marker gene overlap and ambiguity
- Provides soft assignments with uncertainty

**When to Use**:
- Annotating cells using known marker genes
- Leveraging existing biological knowledge for classification
- Cases where marker gene lists are available but reference datasets are not

**Basic Usage**:
```python
# Create marker gene matrix (cell types x genes)
marker_gene_mat = pd.DataFrame({
    "CD4 T cells": [1, 1, 0, 0],  # CD3D, CD4, CD8A, CD19
    "CD8 T cells": [1, 0, 1, 0],
    "B cells": [0, 0, 0, 1]
}, index=["CD3D", "CD4", "CD8A", "CD19"])

scvi.model.CELLASSIGN.setup_anndata(adata, layer="counts")
model = scvi.model.CELLASSIGN(adata, marker_gene_mat)
model.train()

predictions = model.predict()
```

## Solo (Doublet Detection)

**Purpose**: Identifying doublets (cells containing two or more cells) in scRNA-seq data.

**Key Features**:
- Semi-supervised doublet detection using scVI embeddings
- Simulates artificial doublets for training
- Provides doublet probability scores
- Can be applied to any scVI model

**When to Use**:
- Quality control of scRNA-seq datasets
- Removing doublets before downstream analysis
- Assessing doublet rates in your data

**Basic Usage**:
```python
# Train scVI model first
scvi.model.SCVI.setup_anndata(adata, layer="counts")
scvi_model = scvi.model.SCVI(adata)
scvi_model.train()

# Train Solo for doublet detection
solo_model = scvi.external.SOLO.from_scvi_model(scvi_model)
solo_model.train()

# Predict doublets
predictions = solo_model.predict()
doublet_scores = predictions["doublet"]
adata.obs["doublet_score"] = doublet_scores
```

## Amortized LDA (Topic Modeling)

**Purpose**: Topic modeling for gene expression using Latent Dirichlet Allocation.

**Key Features**:
- Discovers gene expression programs (topics)
- Amortized variational inference for scalability
- Each cell is a mixture of topics
- Each topic is a distribution over genes

**When to Use**:
- Discovering gene programs or expression modules
- Understanding compositional structure of expression
- Alternative dimensionality reduction approach
- Interpretable decomposition of expression patterns

**Basic Usage**:
```python
scvi.model.AMORTIZEDLDA.setup_anndata(adata, layer="counts")
model = scvi.model.AMORTIZEDLDA(adata, n_topics=10)
model.train()

# Get topic compositions per cell
topic_proportions = model.get_latent_representation()

# Get gene loadings per topic
topic_gene_loadings = model.get_topic_distribution()
```

## Model Selection Guidelines

**Choose scVI when**:
- Starting with unsupervised analysis
- Need batch correction and integration
- Want normalized expression and DE analysis

**Choose scANVI when**:
- Have some labeled cells for training
- Need cell type annotation
- Want to transfer labels from reference to query

**Choose AUTOZI when**:
- Concerned about technical dropout
- Need to identify zero-inflated genes
- Working with very sparse datasets

**Choose VeloVI when**:
- Have spliced/unspliced count data
- Interested in cellular dynamics
- Need RNA velocity with batch correction

**Choose contrastiveVI when**:
- Analyzing perturbation experiments
- Need to separate treatment effects
- Want to identify condition-specific programs

**Choose CellAssign when**:
- Have marker gene lists available
- Want probabilistic marker-based annotation
- No reference dataset available

**Choose Solo when**:
- Need doublet detection
- Already using scVI for analysis
- Want probabilistic doublet scores
