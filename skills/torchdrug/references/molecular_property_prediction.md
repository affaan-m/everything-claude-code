# Molecular Property Prediction

## Overview

Molecular property prediction involves predicting chemical, physical, or biological properties of molecules from their structure. TorchDrug provides comprehensive support for both classification and regression tasks on molecular graphs.

## Available Datasets

### Drug Discovery Datasets

**Classification Tasks:**
- **BACE** (1,513 molecules): Binary classification for β-secretase inhibition
- **BBBP** (2,039 molecules): Blood-brain barrier penetration prediction
- **HIV** (41,127 molecules): Ability to inhibit HIV replication
- **Tox21** (7,831 molecules): Toxicity prediction across 12 targets
- **ToxCast** (8,576 molecules): Toxicology screening
- **ClinTox** (1,478 molecules): Clinical trial toxicity
- **SIDER** (1,427 molecules): Drug side effects (27 system organ classes)
- **MUV** (93,087 molecules): Maximum unbiased validation for virtual screening

**Regression Tasks:**
- **ESOL** (1,128 molecules): Water solubility prediction
- **FreeSolv** (642 molecules): Hydration free energy
- **Lipophilicity** (4,200 molecules): Octanol/water distribution coefficient
- **SAMPL** (643 molecules): Solvation free energies

### Large-Scale Datasets

- **QM7** (7,165 molecules): Quantum mechanical properties
- **QM8** (21,786 molecules): Electronic spectra and excited state properties
- **QM9** (133,885 molecules): Geometric, energetic, electronic, and thermodynamic properties
- **PCQM4M** (3,803,453 molecules): Large-scale quantum chemistry dataset
- **ZINC250k/2M** (250k/2M molecules): Drug-like compounds for generative modeling

## Task Types

### PropertyPrediction

Standard task for graph-level property prediction supporting both classification and regression.

**Key Parameters:**
- `model`: Graph representation model (GNN)
- `task`: "node", "edge", or "graph" level prediction
- `criterion`: Loss function ("mse", "bce", "ce")
- `metric`: Evaluation metrics ("mae", "rmse", "auroc", "auprc")
- `num_mlp_layer`: Number of MLP layers for readout

**Example Workflow:**
```python
import torch
from torchdrug import core, models, tasks, datasets

# Load dataset
dataset = datasets.BBBP("~/molecule-datasets/")

# Define model
model = models.GIN(input_dim=dataset.node_feature_dim,
                   hidden_dims=[256, 256, 256, 256],
                   edge_input_dim=dataset.edge_feature_dim,
                   batch_norm=True, readout="mean")

# Define task
task = tasks.PropertyPrediction(model, task=dataset.tasks,
                                 criterion="bce",
                                 metric=("auprc", "auroc"))
```

### MultipleBinaryClassification

Specialized task for multi-label scenarios where each molecule can have multiple binary labels (e.g., Tox21, SIDER).

**Key Features:**
- Handles missing labels gracefully
- Computes metrics per label and averaged
- Supports weighted loss for imbalanced datasets

## Model Selection

### Recommended Models by Task

**Small Molecules (< 1000 molecules):**
- GIN (Graph Isomorphism Network)
- SchNet (for 3D structures)

**Medium Datasets (1k-100k molecules):**
- GCN, GAT, or GIN
- NFP (Neural Fingerprint)
- MPNN (Message Passing Neural Network)

**Large Datasets (> 100k molecules):**
- Pre-trained models with fine-tuning
- InfoGraph or MultiviewContrast for self-supervised pre-training
- GIN with deeper architectures

**3D Structure Available:**
- SchNet (continuous-filter convolutions)
- GearNet (geometry-aware relational graph)

## Feature Engineering

### Node Features

TorchDrug automatically extracts atom features:
- Atom type
- Formal charge
- Explicit/implicit hydrogens
- Hybridization
- Aromaticity
- Chirality

### Edge Features

Bond features include:
- Bond type (single, double, triple, aromatic)
- Stereochemistry
- Conjugation
- Ring membership

### Custom Features

Add custom node/edge features using transforms:
```python
from torchdrug import data, transforms

# Add custom features
transform = transforms.VirtualNode()  # Add virtual node
dataset = datasets.BBBP("~/molecule-datasets/",
                        transform=transform)
```

## Training Workflow

### Basic Pipeline

1. **Load Dataset**: Choose appropriate dataset
2. **Split Data**: Use scaffold split for drug discovery
3. **Define Model**: Select GNN architecture
4. **Create Task**: Configure loss and metrics
5. **Setup Optimizer**: Adam typically works well
6. **Train**: Use PyTorch Lightning or custom loop

### Data Splitting Strategies

**Random Split**: Standard train/val/test split
**Scaffold Split**: Group molecules by Bemis-Murcko scaffolds (recommended for drug discovery)
**Stratified Split**: Maintain label distribution across splits

### Best Practices

- Use scaffold splitting for realistic drug discovery evaluation
- Apply data augmentation (virtual nodes, edges) for small datasets
- Monitor multiple metrics (AUROC, AUPRC for classification; MAE, RMSE for regression)
- Use early stopping based on validation performance
- Consider ensemble methods for critical applications
- Pre-train on large datasets before fine-tuning on small datasets

## Common Issues and Solutions

**Issue: Poor performance on imbalanced datasets**
- Solution: Use weighted loss, focal loss, or over/under-sampling

**Issue: Overfitting on small datasets**
- Solution: Increase regularization, use simpler models, apply data augmentation, or pre-train on larger datasets

**Issue: Large memory consumption**
- Solution: Reduce batch size, use gradient accumulation, or implement graph sampling

**Issue: Slow training**
- Solution: Use GPU acceleration, optimize data loading with multiple workers, or use mixed precision training
