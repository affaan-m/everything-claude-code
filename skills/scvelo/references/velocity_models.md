# scVelo Velocity Models Reference

## Mathematical Framework

RNA velocity is based on the kinetic model of transcription:

```
dx_s/dt = β·x_u - γ·x_s   (spliced dynamics)
dx_u/dt = α(t) - β·x_u    (unspliced dynamics)
```

Where:
- `x_s`: spliced mRNA abundance
- `x_u`: unspliced (pre-mRNA) abundance
- `α(t)`: transcription rate (varies over time)
- `β`: splicing rate
- `γ`: degradation rate

**Velocity** is defined as: `v = dx_s/dt = β·x_u - γ·x_s`

- **v > 0**: Gene is being upregulated (more unspliced than expected at steady state)
- **v < 0**: Gene is being downregulated (less unspliced than expected)

## Model Comparison

### Steady-State (Velocyto, original)

- Assumes constant α (transcription rate)
- Fits γ using linear regression on steady-state cells
- **Limitation**: Requires identifiable steady states; assumes constant transcription

```python
# Use with scVelo for backward compatibility
scv.tl.velocity(adata, mode='steady_state')
```

### Stochastic Model (scVelo v1)

- Extends steady-state with variance/covariance terms
- Models cell-to-cell variability in mRNA counts
- More robust to noise than steady-state

```python
scv.tl.velocity(adata, mode='stochastic')
```

### Dynamical Model (scVelo v2, recommended)

- Jointly estimates all kinetic rates (α, β, γ) and cell-specific latent time
- Does not assume steady state
- Identifies induction vs. repression phases
- Computes fit_likelihood per gene (quality measure)

```python
scv.tl.recover_dynamics(adata, n_jobs=4)
scv.tl.velocity(adata, mode='dynamical')
```

**Kinetic states identified by dynamical model:**

| State | Description |
|-------|-------------|
| Induction | α > 0, x_u increasing |
| Steady-state on | α > 0, constant high expression |
| Repression | α = 0, x_u decreasing |
| Steady-state off | α = 0, constant low expression |

## Velocity Graph

The velocity graph connects cells based on their velocity similarity to neighboring cells' states:

```python
scv.tl.velocity_graph(adata)
# Stored in adata.uns['velocity_graph']
# Entry [i,j] = probability that cell i transitions to cell j
```

**Parameters:**
- `n_neighbors`: Number of neighbors considered
- `sqrt_transform`: Apply sqrt transform to data (default: False for spliced)
- `approx`: Use approximate nearest neighbor search (faster for large datasets)

## Latent Time Interpretation

Latent time τ ∈ [0, 1] for each gene represents:
- τ = 0: Gene is at onset of induction
- τ = 0.5: Gene is at peak of induction (for a complete cycle)
- τ = 1: Gene has returned to steady-state off

**Shared latent time** is computed by taking the average over all velocity genes, weighted by fit_likelihood.

## Quality Metrics

### Gene-level
- `fit_likelihood`: Goodness-of-fit of dynamical model (0-1; higher = better)
  - Use for filtering driver genes: `adata.var[adata.var['fit_likelihood'] > 0.1]`
- `fit_alpha`: Transcription rate during induction
- `fit_gamma`: mRNA degradation rate
- `fit_r2`: R² of kinetic fit

### Cell-level
- `velocity_length`: Magnitude of velocity vector (cell speed)
- `velocity_confidence`: Coherence of velocity with neighboring cells (0-1)

### Dataset-level
```python
# Check overall velocity quality
scv.pl.proportions(adata)  # Ratio of spliced/unspliced per cell
scv.pl.velocity_confidence(adata, groupby='leiden')
```

## Parameter Tuning Guide

| Parameter | Function | Default | When to Change |
|-----------|----------|---------|----------------|
| `min_shared_counts` | Filter genes | 20 | Increase for deep sequencing; decrease for shallow |
| `n_top_genes` | HVG selection | 2000 | Increase for complex datasets |
| `n_neighbors` | kNN graph | 30 | Decrease for small datasets; increase for noisy |
| `n_pcs` | PCA dimensions | 30 | Match to elbow in scree plot |
| `t_max_rank` | Latent time constraint | None | Set if known developmental direction |

## Integration with Other Tools

### CellRank (Fate Prediction)

```python
import cellrank as cr
from cellrank.kernels import VelocityKernel, ConnectivityKernel

# Combine velocity and connectivity kernels
vk = VelocityKernel(adata).compute_transition_matrix()
ck = ConnectivityKernel(adata).compute_transition_matrix()
combined = 0.8 * vk + 0.2 * ck

# Compute macrostates (terminal and initial states)
g = cr.estimators.GPCCA(combined)
g.compute_macrostates(n_states=4, cluster_key='leiden')
g.plot_macrostates(which="all")

# Compute fate probabilities
g.compute_fate_probabilities()
g.plot_fate_probabilities()
```

### Scanpy Integration

scVelo works natively with Scanpy's AnnData:

```python
import scanpy as sc
import scvelo as scv

# Run standard Scanpy pipeline first
sc.pp.normalize_total(adata)
sc.pp.log1p(adata)
sc.pp.highly_variable_genes(adata)
sc.pp.pca(adata)
sc.pp.neighbors(adata)
sc.tl.umap(adata)
sc.tl.leiden(adata)

# Then add velocity on top
scv.pp.moments(adata)
scv.tl.recover_dynamics(adata)
scv.tl.velocity(adata, mode='dynamical')
scv.tl.velocity_graph(adata)
scv.tl.latent_time(adata)
```
