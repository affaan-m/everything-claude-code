# Theoretical Foundations of scvi-tools

This document explains the mathematical and statistical principles underlying scvi-tools.

## Core Concepts

### Variational Inference

**What is it?**
Variational inference is a technique for approximating complex probability distributions. In single-cell analysis, we want to understand the posterior distribution p(z|x) - the probability of latent variables z given observed data x.

**Why use it?**
- Exact inference is computationally intractable for complex models
- Scales to large datasets (millions of cells)
- Provides uncertainty quantification
- Enables Bayesian reasoning about cell states

**How does it work?**
1. Define a simpler approximate distribution q(z|x) with learnable parameters
2. Minimize the KL divergence between q(z|x) and true posterior p(z|x)
3. Equivalent to maximizing the Evidence Lower Bound (ELBO)

**ELBO Objective**:
```
ELBO = E_q[log p(x|z)] - KL(q(z|x) || p(z))
       ↑                    ↑
  Reconstruction          Regularization
```

- **Reconstruction term**: Model should generate data similar to observed
- **Regularization term**: Latent representation should match prior

### Variational Autoencoders (VAEs)

**Architecture**:
```
x (observed data)
    ↓
[Encoder Neural Network]
    ↓
z (latent representation)
    ↓
[Decoder Neural Network]
    ↓
x̂ (reconstructed data)
```

**Encoder**: Maps cells (x) to latent space (z)
- Learns q(z|x), the approximate posterior
- Parameterized by neural network with learnable weights
- Outputs mean and variance of latent distribution

**Decoder**: Maps latent space (z) back to gene space
- Learns p(x|z), the likelihood
- Generates gene expression from latent representation
- Models count distributions (Negative Binomial, Zero-Inflated NB)

**Reparameterization Trick**:
- Allows backpropagation through stochastic sampling
- Sample z = μ + σ ⊙ ε, where ε ~ N(0,1)
- Enables end-to-end training with gradient descent

### Amortized Inference

**Concept**: Share encoder parameters across all cells.

**Traditional inference**: Learn separate latent variables for each cell
- n_cells × n_latent parameters
- Doesn't scale to large datasets

**Amortized inference**: Learn single encoder for all cells
- Fixed number of parameters regardless of cell count
- Enables fast inference on new cells
- Transfers learned patterns across dataset

**Benefits**:
- Scalable to millions of cells
- Fast inference on query data
- Leverages shared structure across cells
- Enables few-shot learning

## Statistical Modeling

### Count Data Distributions

Single-cell data are counts (integer-valued), requiring appropriate distributions.

#### Negative Binomial (NB)
```
x ~ NB(μ, θ)
```
- **μ (mean)**: Expected expression level
- **θ (dispersion)**: Controls variance
- **Variance**: Var(x) = μ + μ²/θ

**When to use**: Gene expression without zero-inflation
- More flexible than Poisson (allows overdispersion)
- Models technical and biological variation

#### Zero-Inflated Negative Binomial (ZINB)
```
x ~ π·δ₀ + (1-π)·NB(μ, θ)
```
- **π (dropout rate)**: Probability of technical zero
- **δ₀**: Point mass at zero
- **NB(μ, θ)**: Expression when not dropped out

**When to use**: Sparse scRNA-seq data
- Models technical dropout separately from biological zeros
- Better fit for highly sparse data (e.g., 10x data)

#### Poisson
```
x ~ Poisson(μ)
```
- Simplest count distribution
- Mean equals variance: Var(x) = μ

**When to use**: Less common; ATAC-seq fragment counts
- More restrictive than NB
- Faster computation

### Batch Correction Framework

**Problem**: Technical variation confounds biological signal
- Different sequencing runs, protocols, labs
- Must remove technical effects while preserving biology

**scvi-tools approach**:
1. Encode batch as categorical variable s
2. Include s in generative model
3. Latent space z is batch-invariant
4. Decoder conditions on s for batch-specific effects

**Mathematical formulation**:
```
Encoder: q(z|x, s)  - batch-aware encoding
Latent: z           - batch-corrected representation
Decoder: p(x|z, s)  - batch-specific decoding
```

**Key insight**: Batch info flows through decoder, not latent space
- z captures biological variation
- s explains technical variation
- Separable biology and batch effects

### Deep Generative Modeling

**Generative model**: Learns p(x), the data distribution

**Process**:
1. Sample latent variable: z ~ p(z) = N(0, I)
2. Generate expression: x ~ p(x|z)
3. Joint distribution: p(x, z) = p(x|z)p(z)

**Benefits**:
- Generate synthetic cells
- Impute missing values
- Quantify uncertainty
- Perform counterfactual predictions

**Inference network**: Inverts generative process
- Given x, infer z
- q(z|x) approximates true posterior p(z|x)

## Model Architecture Details

### scVI Architecture

**Input**: Gene expression counts x ∈ ℕ^G (G genes)

**Encoder**:
```
h = ReLU(W₁·x + b₁)
μ_z = W₂·h + b₂
log σ²_z = W₃·h + b₃
z ~ N(μ_z, σ²_z)
```

**Latent space**: z ∈ ℝ^d (typically d=10-30)

**Decoder**:
```
h = ReLU(W₄·z + b₄)
μ = softmax(W₅·h + b₅) · library_size
θ = exp(W₆·h + b₆)
π = sigmoid(W₇·h + b₇)  # for ZINB
x ~ ZINB(μ, θ, π)
```

**Loss function (ELBO)**:
```
L = E_q[log p(x|z)] - KL(q(z|x) || N(0,I))
```

### Handling Covariates

**Categorical covariates** (batch, donor, etc.):
- One-hot encoded: s ∈ {0,1}^K
- Concatenate with latent: [z, s]
- Or use conditional layers

**Continuous covariates** (library size, percent_mito):
- Standardize to zero mean, unit variance
- Include in encoder and/or decoder

**Covariate injection strategies**:
- **Concatenation**: [z, s] fed to decoder
- **Deep injection**: s added at multiple layers
- **Conditional batch norm**: Batch-specific normalization

## Advanced Theoretical Concepts

### Transfer Learning (scArches)

**Concept**: Use pretrained model as initialization for new data

**Process**:
1. Train reference model on large dataset
2. Freeze encoder parameters
3. Fine-tune decoder on query data
4. Or fine-tune all with lower learning rate

**Why it works**:
- Encoder learns general cellular representations
- Decoder adapts to query-specific characteristics
- Prevents catastrophic forgetting

**Applications**:
- Query-to-reference mapping
- Few-shot learning for rare cell types
- Rapid analysis of new datasets

### Multi-Resolution Modeling (MrVI)

**Idea**: Separate shared and sample-specific variation

**Latent space decomposition**:
```
z = z_shared + z_sample
```
- **z_shared**: Common across samples
- **z_sample**: Sample-specific effects

**Hierarchical structure**:
```
Sample level: ρ_s ~ N(0, I)
Cell level: z_i ~ N(ρ_{s(i)}, σ²)
```

**Benefits**:
- Disentangle biological sources of variation
- Compare samples at different resolutions
- Identify sample-specific cell states

### Counterfactual Prediction

**Goal**: Predict outcome under different conditions

**Example**: "What would this cell look like if from different batch?"

**Method**:
1. Encode cell to latent: z = Encoder(x, s_original)
2. Decode with new condition: x_new = Decoder(z, s_new)
3. x_new is counterfactual prediction

**Applications**:
- Batch effect assessment
- Predicting treatment response
- In silico perturbation studies

### Posterior Predictive Distribution

**Definition**: Distribution of new data given observed data

```
p(x_new | x_observed) = ∫ p(x_new|z) q(z|x_observed) dz
```

**Estimation**: Sample z from q(z|x), generate x_new from p(x_new|z)

**Uses**:
- Uncertainty quantification
- Robust predictions
- Outlier detection

## Differential Expression Framework

### Bayesian Approach

**Traditional methods**: Compare point estimates
- Wilcoxon, t-test, etc.
- Ignore uncertainty
- Require pseudocounts

**scvi-tools approach**: Compare distributions
- Sample from posterior: μ_A ~ p(μ|x_A), μ_B ~ p(μ|x_B)
- Compute log fold-change: LFC = log(μ_B) - log(μ_A)
- Posterior distribution of LFC quantifies uncertainty

### Bayes Factor

**Definition**: Ratio of posterior odds to prior odds

```
BF = P(H₁|data) / P(H₀|data)
     ─────────────────────────
     P(H₁) / P(H₀)
```

**Interpretation**:
- BF > 3: Moderate evidence for H₁
- BF > 10: Strong evidence
- BF > 100: Decisive evidence

**In scvi-tools**: Used to rank genes by evidence for DE

### False Discovery Proportion (FDP)

**Goal**: Control expected false discovery rate

**Procedure**:
1. For each gene, compute posterior probability of DE
2. Rank genes by evidence (Bayes factor)
3. Select top k genes such that E[FDP] ≤ α

**Advantage over p-values**:
- Fully Bayesian
- Natural for posterior inference
- No arbitrary thresholds

## Implementation Details

### Optimization

**Optimizer**: Adam (adaptive learning rates)
- Default lr = 0.001
- Momentum parameters: β₁=0.9, β₂=0.999

**Training loop**:
1. Sample mini-batch of cells
2. Compute ELBO loss
3. Backpropagate gradients
4. Update parameters with Adam
5. Repeat until convergence

**Convergence criteria**:
- ELBO plateaus on validation set
- Early stopping prevents overfitting
- Typically 200-500 epochs

### Regularization

**KL annealing**: Gradually increase KL weight
- Prevents posterior collapse
- Starts at 0, increases to 1 over epochs

**Dropout**: Random neuron dropping during training
- Default: 0.1 dropout rate
- Prevents overfitting
- Improves generalization

**Weight decay**: L2 regularization on weights
- Prevents large weights
- Improves stability

### Scalability

**Mini-batch training**:
- Process subset of cells per iteration
- Batch size: 64-256 cells
- Enables scaling to millions of cells

**Stochastic optimization**:
- Estimates ELBO on mini-batches
- Unbiased gradient estimates
- Converges to optimal solution

**GPU acceleration**:
- Neural networks naturally parallelize
- Order of magnitude speedup
- Essential for large datasets

## Connections to Other Methods

### vs. PCA
- **PCA**: Linear, deterministic
- **scVI**: Nonlinear, probabilistic
- **Advantage**: scVI captures complex structure, handles counts

### vs. t-SNE/UMAP
- **t-SNE/UMAP**: Visualization-focused
- **scVI**: Full generative model
- **Advantage**: scVI enables downstream tasks (DE, imputation)

### vs. Seurat Integration
- **Seurat**: Anchor-based alignment
- **scVI**: Probabilistic modeling
- **Advantage**: scVI provides uncertainty, works for multiple batches

### vs. Harmony
- **Harmony**: PCA + batch correction
- **scVI**: VAE-based
- **Advantage**: scVI handles counts natively, more flexible

## Mathematical Notation

**Common symbols**:
- x: Observed gene expression (counts)
- z: Latent representation
- θ: Model parameters
- q(z|x): Approximate posterior (encoder)
- p(x|z): Likelihood (decoder)
- p(z): Prior on latent variables
- μ, σ²: Mean and variance
- π: Dropout probability (ZINB)
- θ (in NB): Dispersion parameter
- s: Batch/covariate indicator

## Further Reading

**Key Papers**:
1. Lopez et al. (2018): "Deep generative modeling for single-cell transcriptomics"
2. Xu et al. (2021): "Probabilistic harmonization and annotation of single-cell transcriptomics"
3. Boyeau et al. (2019): "Deep generative models for detecting differential expression in single cells"

**Concepts to explore**:
- Variational inference in machine learning
- Bayesian deep learning
- Information theory (KL divergence, mutual information)
- Generative models (GANs, normalizing flows, diffusion models)
- Probabilistic programming (Pyro, PyTorch)

**Mathematical background**:
- Probability theory and statistics
- Linear algebra and calculus
- Optimization theory
- Information theory
