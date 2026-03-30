# Common Workflows and Best Practices

This document covers common workflows, best practices, and advanced usage patterns for scvi-tools.

## Standard Analysis Workflow

### 1. Data Loading and Preparation

```python
import scvi
import scanpy as sc
import numpy as np

# Load data (AnnData format required)
adata = sc.read_h5ad("data.h5ad")
# Or load from other formats
# adata = sc.read_10x_mtx("filtered_feature_bc_matrix/")
# adata = sc.read_csv("counts.csv")

# Basic QC metrics
sc.pp.calculate_qc_metrics(adata, inplace=True)
adata.var['mt'] = adata.var_names.str.startswith('MT-')
sc.pp.calculate_qc_metrics(adata, qc_vars=['mt'], inplace=True)
```

### 2. Quality Control

```python
# Filter cells
sc.pp.filter_cells(adata, min_genes=200)
sc.pp.filter_cells(adata, max_genes=5000)

# Filter genes
sc.pp.filter_genes(adata, min_cells=3)

# Filter by mitochondrial content
adata = adata[adata.obs['pct_counts_mt'] < 20, :]

# Remove doublets (optional, before training)
sc.external.pp.scrublet(adata)
adata = adata[~adata.obs['predicted_doublet'], :]
```

### 3. Preprocessing for scvi-tools

```python
# IMPORTANT: scvi-tools needs RAW counts
# If you've already normalized, use the raw layer or reload data

# Save raw counts if not already available
if 'counts' not in adata.layers:
    adata.layers['counts'] = adata.X.copy()

# Feature selection (optional but recommended)
sc.pp.highly_variable_genes(
    adata,
    n_top_genes=4000,
    subset=False,  # Keep all genes, just mark HVGs
    batch_key="batch"  # If multiple batches
)

# Filter to HVGs (optional)
# adata = adata[:, adata.var['highly_variable']]
```

### 4. Register Data with scvi-tools

```python
# Setup AnnData for scvi-tools
scvi.model.SCVI.setup_anndata(
    adata,
    layer="counts",  # Use raw counts
    batch_key="batch",  # Technical batches
    categorical_covariate_keys=["donor", "condition"],
    continuous_covariate_keys=["percent_mito", "n_counts"]
)

# Check registration
adata.uns['_scvi']['summary_stats']
```

### 5. Model Training

```python
# Create model
model = scvi.model.SCVI(
    adata,
    n_latent=30,  # Latent dimensions
    n_layers=2,   # Network depth
    n_hidden=128, # Hidden layer size
    dropout_rate=0.1,
    gene_likelihood="zinb"  # zero-inflated negative binomial
)

# Train model
model.train(
    max_epochs=400,
    batch_size=128,
    train_size=0.9,
    early_stopping=True,
    check_val_every_n_epoch=10
)

# View training history
train_history = model.history["elbo_train"]
val_history = model.history["elbo_validation"]
```

### 6. Extract Results

```python
# Get latent representation
latent = model.get_latent_representation()
adata.obsm["X_scVI"] = latent

# Get normalized expression
normalized = model.get_normalized_expression(
    adata,
    library_size=1e4,
    n_samples=25  # Monte Carlo samples
)
adata.layers["scvi_normalized"] = normalized
```

### 7. Downstream Analysis

```python
# Clustering on scVI latent space
sc.pp.neighbors(adata, use_rep="X_scVI", n_neighbors=15)
sc.tl.umap(adata, min_dist=0.3)
sc.tl.leiden(adata, resolution=0.8, key_added="leiden")

# Visualization
sc.pl.umap(adata, color=["leiden", "batch", "cell_type"])

# Differential expression
de_results = model.differential_expression(
    groupby="leiden",
    group1="0",
    group2="1",
    mode="change",
    delta=0.25
)
```

### 8. Model Persistence

```python
# Save model
model_dir = "./scvi_model/"
model.save(model_dir, overwrite=True)

# Save AnnData with results
adata.write("analyzed_data.h5ad")

# Load model later
model = scvi.model.SCVI.load(model_dir, adata=adata)
```

## Hyperparameter Tuning

### Key Hyperparameters

**Architecture**:
- `n_latent`: Latent space dimensionality (10-50)
  - Larger for complex, heterogeneous datasets
  - Smaller for simple datasets or to prevent overfitting
- `n_layers`: Number of hidden layers (1-3)
  - More layers for complex data, but diminishing returns
- `n_hidden`: Nodes per hidden layer (64-256)
  - Scale with dataset size and complexity

**Training**:
- `max_epochs`: Training iterations (200-500)
  - Use early stopping to prevent overfitting
- `batch_size`: Samples per batch (64-256)
  - Larger for big datasets, smaller for limited memory
- `lr`: Learning rate (0.001 default, usually good)

**Model-specific**:
- `gene_likelihood`: Distribution ("zinb", "nb", "poisson")
  - "zinb" for sparse data with zero-inflation
  - "nb" for less sparse data
- `dispersion`: Gene or gene-batch specific
  - "gene" for simple, "gene-batch" for complex batch effects

### Hyperparameter Search Example

```python
from scvi.model import SCVI

# Define search space
latent_dims = [10, 20, 30]
n_layers_options = [1, 2]

best_score = float('-inf')
best_params = None

for n_latent in latent_dims:
    for n_layers in n_layers_options:
        model = SCVI(
            adata,
            n_latent=n_latent,
            n_layers=n_layers
        )
        model.train(max_epochs=200)

        # Evaluate on validation set
        val_elbo = model.history["elbo_validation"][-1]

        if val_elbo > best_score:
            best_score = val_elbo
            best_params = {"n_latent": n_latent, "n_layers": n_layers}

print(f"Best params: {best_params}")
```

### Using Optuna for Hyperparameter Optimization

```python
import optuna

def objective(trial):
    n_latent = trial.suggest_int("n_latent", 10, 50)
    n_layers = trial.suggest_int("n_layers", 1, 3)
    n_hidden = trial.suggest_categorical("n_hidden", [64, 128, 256])

    model = scvi.model.SCVI(
        adata,
        n_latent=n_latent,
        n_layers=n_layers,
        n_hidden=n_hidden
    )

    model.train(max_epochs=200, early_stopping=True)
    return model.history["elbo_validation"][-1]

study = optuna.create_study(direction="maximize")
study.optimize(objective, n_trials=20)

print(f"Best parameters: {study.best_params}")
```

## GPU Acceleration

### Enable GPU Training

```python
# Automatic GPU detection
model = scvi.model.SCVI(adata)
model.train(accelerator="auto")  # Uses GPU if available

# Force GPU
model.train(accelerator="gpu")

# Multi-GPU
model.train(accelerator="gpu", devices=2)

# Check if GPU is being used
import torch
print(f"CUDA available: {torch.cuda.is_available()}")
print(f"GPU count: {torch.cuda.device_count()}")
```

### GPU Memory Management

```python
# Reduce batch size if OOM
model.train(batch_size=64)  # Instead of default 128

# Mixed precision training (saves memory)
model.train(precision=16)

# Clear cache between runs
import torch
torch.cuda.empty_cache()
```

## Batch Integration Strategies

### Strategy 1: Simple Batch Key

```python
# For standard batch correction
scvi.model.SCVI.setup_anndata(adata, batch_key="batch")
model = scvi.model.SCVI(adata)
```

### Strategy 2: Multiple Covariates

```python
# Correct for multiple technical factors
scvi.model.SCVI.setup_anndata(
    adata,
    batch_key="sequencing_batch",
    categorical_covariate_keys=["donor", "tissue"],
    continuous_covariate_keys=["percent_mito"]
)
```

### Strategy 3: Hierarchical Batches

```python
# When batches have hierarchical structure
# E.g., samples within studies
adata.obs["batch_hierarchy"] = (
    adata.obs["study"].astype(str) + "_" +
    adata.obs["sample"].astype(str)
)

scvi.model.SCVI.setup_anndata(adata, batch_key="batch_hierarchy")
```

## Reference Mapping (scArches)

### Training Reference Model

```python
# Train on reference dataset
scvi.model.SCVI.setup_anndata(ref_adata, batch_key="batch")
ref_model = scvi.model.SCVI(ref_adata)
ref_model.train()

# Save reference
ref_model.save("reference_model")
```

### Mapping Query to Reference

```python
# Load reference
ref_model = scvi.model.SCVI.load("reference_model", adata=ref_adata)

# Setup query with same parameters
scvi.model.SCVI.setup_anndata(query_adata, batch_key="batch")

# Transfer learning
query_model = scvi.model.SCVI.load_query_data(
    query_adata,
    "reference_model"
)

# Fine-tune on query (optional)
query_model.train(max_epochs=200)

# Get query embeddings
query_latent = query_model.get_latent_representation()

# Transfer labels using KNN
from sklearn.neighbors import KNeighborsClassifier

knn = KNeighborsClassifier(n_neighbors=15)
knn.fit(ref_model.get_latent_representation(), ref_adata.obs["cell_type"])
query_adata.obs["predicted_cell_type"] = knn.predict(query_latent)
```

## Model Minification

Reduce model size for faster inference:

```python
# Train full model
model = scvi.model.SCVI(adata)
model.train()

# Minify for deployment
minified = model.minify_adata(adata)

# Save minified version
minified.write("minified_data.h5ad")
model.save("minified_model")

# Load and use (much faster)
mini_model = scvi.model.SCVI.load("minified_model", adata=minified)
```

## Memory-Efficient Data Loading

### Using AnnDataLoader

```python
from scvi.data import AnnDataLoader

# For very large datasets
dataloader = AnnDataLoader(
    adata,
    batch_size=128,
    shuffle=True,
    drop_last=False
)

# Custom training loop (advanced)
for batch in dataloader:
    # Process batch
    pass
```

### Using Backed AnnData

```python
# For data too large for memory
adata = sc.read_h5ad("huge_dataset.h5ad", backed='r')

# scvi-tools works with backed mode
scvi.model.SCVI.setup_anndata(adata)
model = scvi.model.SCVI(adata)
model.train()
```

## Model Interpretation

### Feature Importance with SHAP

```python
import shap

# Get SHAP values for interpretability
explainer = shap.DeepExplainer(model.module, background_data)
shap_values = explainer.shap_values(test_data)

# Visualize
shap.summary_plot(shap_values, feature_names=adata.var_names)
```

### Gene Correlation Analysis

```python
# Get gene-gene correlation matrix
correlation = model.get_feature_correlation_matrix(
    adata,
    transform_batch="batch1"
)

# Visualize top correlated genes
import seaborn as sns
sns.heatmap(correlation[:50, :50], cmap="coolwarm")
```

## Troubleshooting Common Issues

### Issue: NaN Loss During Training

**Causes**:
- Learning rate too high
- Unnormalized input (must use raw counts)
- Data quality issues

**Solutions**:
```python
# Reduce learning rate
model.train(lr=0.0001)

# Check data
assert adata.X.min() >= 0  # No negative values
assert np.isnan(adata.X).sum() == 0  # No NaNs

# Use more stable likelihood
model = scvi.model.SCVI(adata, gene_likelihood="nb")
```

### Issue: Poor Batch Correction

**Solutions**:
```python
# Increase batch effect modeling
model = scvi.model.SCVI(
    adata,
    encode_covariates=True,  # Encode batch in encoder
    deeply_inject_covariates=False
)

# Or try opposite
model = scvi.model.SCVI(adata, deeply_inject_covariates=True)

# Use more latent dimensions
model = scvi.model.SCVI(adata, n_latent=50)
```

### Issue: Model Not Training (ELBO Not Decreasing)

**Solutions**:
```python
# Increase learning rate
model.train(lr=0.005)

# Increase network capacity
model = scvi.model.SCVI(adata, n_hidden=256, n_layers=2)

# Train longer
model.train(max_epochs=500)
```

### Issue: Out of Memory (OOM)

**Solutions**:
```python
# Reduce batch size
model.train(batch_size=64)

# Use mixed precision
model.train(precision=16)

# Reduce model size
model = scvi.model.SCVI(adata, n_latent=10, n_hidden=64)

# Use backed AnnData
adata = sc.read_h5ad("data.h5ad", backed='r')
```

## Performance Benchmarking

```python
import time

# Time training
start = time.time()
model.train(max_epochs=400)
training_time = time.time() - start
print(f"Training time: {training_time:.2f}s")

# Time inference
start = time.time()
latent = model.get_latent_representation()
inference_time = time.time() - start
print(f"Inference time: {inference_time:.2f}s")

# Memory usage
import psutil
import os
process = psutil.Process(os.getpid())
memory_gb = process.memory_info().rss / 1024**3
print(f"Memory usage: {memory_gb:.2f} GB")
```

## Best Practices Summary

1. **Always use raw counts**: Never log-normalize before scvi-tools
2. **Feature selection**: Use highly variable genes for efficiency
3. **Batch correction**: Register all known technical covariates
4. **Early stopping**: Use validation set to prevent overfitting
5. **Model saving**: Always save trained models
6. **GPU usage**: Use GPU for large datasets (>10k cells)
7. **Hyperparameter tuning**: Start with defaults, tune if needed
8. **Validation**: Check batch correction visually (UMAP colored by batch)
9. **Documentation**: Keep track of preprocessing steps
10. **Reproducibility**: Set random seeds (`scvi.settings.seed = 0`)
