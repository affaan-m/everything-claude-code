---
name: torchdrug
description: PyTorch-native graph neural networks for molecules and proteins. Use when building custom GNN architectures for drug discovery, protein modeling, or knowledge graph reasoning. Best for custom model development, protein property prediction, retrosynthesis. For pre-trained models and diverse featurizers use deepchem; for benchmark datasets use pytdc.
license: Apache-2.0 license
metadata:
    skill-author: K-Dense Inc.
---

# TorchDrug

## Overview

TorchDrug is a comprehensive PyTorch-based machine learning toolbox for drug discovery and molecular science. Apply graph neural networks, pre-trained models, and task definitions to molecules, proteins, and biological knowledge graphs, including molecular property prediction, protein modeling, knowledge graph reasoning, molecular generation, retrosynthesis planning, with 40+ curated datasets and 20+ model architectures.

## When to Use This Skill

This skill should be used when working with:

**Data Types:**
- SMILES strings or molecular structures
- Protein sequences or 3D structures (PDB files)
- Chemical reactions and retrosynthesis
- Biomedical knowledge graphs
- Drug discovery datasets

**Tasks:**
- Predicting molecular properties (solubility, toxicity, activity)
- Protein function or structure prediction
- Drug-target binding prediction
- Generating new molecular structures
- Planning chemical synthesis routes
- Link prediction in biomedical knowledge bases
- Training graph neural networks on scientific data

**Libraries and Integration:**
- TorchDrug is the primary library
- Often used with RDKit for cheminformatics
- Compatible with PyTorch and PyTorch Lightning
- Integrates with AlphaFold and ESM for proteins

## Getting Started

### Installation

```bash
uv pip install torchdrug
# Or with optional dependencies
uv pip install torchdrug[full]
```

### Quick Example

```python
from torchdrug import datasets, models, tasks
from torch.utils.data import DataLoader

# Load molecular dataset
dataset = datasets.BBBP("~/molecule-datasets/")
train_set, valid_set, test_set = dataset.split()

# Define GNN model
model = models.GIN(
    input_dim=dataset.node_feature_dim,
    hidden_dims=[256, 256, 256],
    edge_input_dim=dataset.edge_feature_dim,
    batch_norm=True,
    readout="mean"
)

# Create property prediction task
task = tasks.PropertyPrediction(
    model,
    task=dataset.tasks,
    criterion="bce",
    metric=["auroc", "auprc"]
)

# Train with PyTorch
optimizer = torch.optim.Adam(task.parameters(), lr=1e-3)
train_loader = DataLoader(train_set, batch_size=32, shuffle=True)

for epoch in range(100):
    for batch in train_loader:
        loss = task(batch)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
```

## Core Capabilities

### 1. Molecular Property Prediction

Predict chemical, physical, and biological properties of molecules from structure.

**Use Cases:**
- Drug-likeness and ADMET properties
- Toxicity screening
- Quantum chemistry properties
- Binding affinity prediction

**Key Components:**
- 20+ molecular datasets (BBBP, HIV, Tox21, QM9, etc.)
- GNN models (GIN, GAT, SchNet)
- PropertyPrediction and MultipleBinaryClassification tasks

**Reference:** See `references/molecular_property_prediction.md` for:
- Complete dataset catalog
- Model selection guide
- Training workflows and best practices
- Feature engineering details

### 2. Protein Modeling

Work with protein sequences, structures, and properties.

**Use Cases:**
- Enzyme function prediction
- Protein stability and solubility
- Subcellular localization
- Protein-protein interactions
- Structure prediction

**Key Components:**
- 15+ protein datasets (EnzymeCommission, GeneOntology, PDBBind, etc.)
- Sequence models (ESM, ProteinBERT, ProteinLSTM)
- Structure models (GearNet, SchNet)
- Multiple task types for different prediction levels

**Reference:** See `references/protein_modeling.md` for:
- Protein-specific datasets
- Sequence vs structure models
- Pre-training strategies
- Integration with AlphaFold and ESM

### 3. Knowledge Graph Reasoning

Predict missing links and relationships in biological knowledge graphs.

**Use Cases:**
- Drug repurposing
- Disease mechanism discovery
- Gene-disease associations
- Multi-hop biomedical reasoning

**Key Components:**
- General KGs (FB15k, WN18) and biomedical (Hetionet)
- Embedding models (TransE, RotatE, ComplEx)
- KnowledgeGraphCompletion task

**Reference:** See `references/knowledge_graphs.md` for:
- Knowledge graph datasets (including Hetionet with 45k biomedical entities)
- Embedding model comparison
- Evaluation metrics and protocols
- Biomedical applications

### 4. Molecular Generation

Generate novel molecular structures with desired properties.

**Use Cases:**
- De novo drug design
- Lead optimization
- Chemical space exploration
- Property-guided generation

**Key Components:**
- Autoregressive generation
- GCPN (policy-based generation)
- GraphAutoregressiveFlow
- Property optimization workflows

**Reference:** See `references/molecular_generation.md` for:
- Generation strategies (unconditional, conditional, scaffold-based)
- Multi-objective optimization
- Validation and filtering
- Integration with property prediction

### 5. Retrosynthesis

Predict synthetic routes from target molecules to starting materials.

**Use Cases:**
- Synthesis planning
- Route optimization
- Synthetic accessibility assessment
- Multi-step planning

**Key Components:**
- USPTO-50k reaction dataset
- CenterIdentification (reaction center prediction)
- SynthonCompletion (reactant prediction)
- End-to-end Retrosynthesis pipeline

**Reference:** See `references/retrosynthesis.md` for:
- Task decomposition (center ID → synthon completion)
- Multi-step synthesis planning
- Commercial availability checking
- Integration with other retrosynthesis tools

### 6. Graph Neural Network Models

Comprehensive catalog of GNN architectures for different data types and tasks.

**Available Models:**
- General GNNs: GCN, GAT, GIN, RGCN, MPNN
- 3D-aware: SchNet, GearNet
- Protein-specific: ESM, ProteinBERT, GearNet
- Knowledge graph: TransE, RotatE, ComplEx, SimplE
- Generative: GraphAutoregressiveFlow

**Reference:** See `references/models_architectures.md` for:
- Detailed model descriptions
- Model selection guide by task and dataset
- Architecture comparisons
- Implementation tips

### 7. Datasets

40+ curated datasets spanning chemistry, biology, and knowledge graphs.

**Categories:**
- Molecular properties (drug discovery, quantum chemistry)
- Protein properties (function, structure, interactions)
- Knowledge graphs (general and biomedical)
- Retrosynthesis reactions

**Reference:** See `references/datasets.md` for:
- Complete dataset catalog with sizes and tasks
- Dataset selection guide
- Loading and preprocessing
- Splitting strategies (random, scaffold)

## Common Workflows

### Workflow 1: Molecular Property Prediction

**Scenario:** Predict blood-brain barrier penetration for drug candidates.

**Steps:**
1. Load dataset: `datasets.BBBP()`
2. Choose model: GIN for molecular graphs
3. Define task: `PropertyPrediction` with binary classification
4. Train with scaffold split for realistic evaluation
5. Evaluate using AUROC and AUPRC

**Navigation:** `references/molecular_property_prediction.md` → Dataset selection → Model selection → Training

### Workflow 2: Protein Function Prediction

**Scenario:** Predict enzyme function from sequence.

**Steps:**
1. Load dataset: `datasets.EnzymeCommission()`
2. Choose model: ESM (pre-trained) or GearNet (with structure)
3. Define task: `PropertyPrediction` with multi-class classification
4. Fine-tune pre-trained model or train from scratch
5. Evaluate using accuracy and per-class metrics

**Navigation:** `references/protein_modeling.md` → Model selection (sequence vs structure) → Pre-training strategies

### Workflow 3: Drug Repurposing via Knowledge Graphs

**Scenario:** Find new disease treatments in Hetionet.

**Steps:**
1. Load dataset: `datasets.Hetionet()`
2. Choose model: RotatE or ComplEx
3. Define task: `KnowledgeGraphCompletion`
4. Train with negative sampling
5. Query for "Compound-treats-Disease" predictions
6. Filter by plausibility and mechanism

**Navigation:** `references/knowledge_graphs.md` → Hetionet dataset → Model selection → Biomedical applications

### Workflow 4: De Novo Molecule Generation

**Scenario:** Generate drug-like molecules optimized for target binding.

**Steps:**
1. Train property predictor on activity data
2. Choose generation approach: GCPN for RL-based optimization
3. Define reward function combining affinity, drug-likeness, synthesizability
4. Generate candidates with property constraints
5. Validate chemistry and filter by drug-likeness
6. Rank by multi-objective scoring

**Navigation:** `references/molecular_generation.md` → Conditional generation → Multi-objective optimization

### Workflow 5: Retrosynthesis Planning

**Scenario:** Plan synthesis route for target molecule.

**Steps:**
1. Load dataset: `datasets.USPTO50k()`
2. Train center identification model (RGCN)
3. Train synthon completion model (GIN)
4. Combine into end-to-end retrosynthesis pipeline
5. Apply recursively for multi-step planning
6. Check commercial availability of building blocks

**Navigation:** `references/retrosynthesis.md` → Task types → Multi-step planning

## Integration Patterns

### With RDKit

Convert between TorchDrug molecules and RDKit:
```python
from torchdrug import data
from rdkit import Chem

# SMILES → TorchDrug molecule
smiles = "CCO"
mol = data.Molecule.from_smiles(smiles)

# TorchDrug → RDKit
rdkit_mol = mol.to_molecule()

# RDKit → TorchDrug
rdkit_mol = Chem.MolFromSmiles(smiles)
mol = data.Molecule.from_molecule(rdkit_mol)
```

### With AlphaFold/ESM

Use predicted structures:
```python
from torchdrug import data

# Load AlphaFold predicted structure
protein = data.Protein.from_pdb("AF-P12345-F1-model_v4.pdb")

# Build graph with spatial edges
graph = protein.residue_graph(
    node_position="ca",
    edge_types=["sequential", "radius"],
    radius_cutoff=10.0
)
```

### With PyTorch Lightning

Wrap tasks for Lightning training:
```python
import pytorch_lightning as pl

class LightningTask(pl.LightningModule):
    def __init__(self, torchdrug_task):
        super().__init__()
        self.task = torchdrug_task

    def training_step(self, batch, batch_idx):
        return self.task(batch)

    def validation_step(self, batch, batch_idx):
        pred = self.task.predict(batch)
        target = self.task.target(batch)
        return {"pred": pred, "target": target}

    def configure_optimizers(self):
        return torch.optim.Adam(self.parameters(), lr=1e-3)
```

## Technical Details

For deep dives into TorchDrug's architecture:

**Core Concepts:** See `references/core_concepts.md` for:
- Architecture philosophy (modular, configurable)
- Data structures (Graph, Molecule, Protein, PackedGraph)
- Model interface and forward function signature
- Task interface (predict, target, forward, evaluate)
- Training workflows and best practices
- Loss functions and metrics
- Common pitfalls and debugging

## Quick Reference Cheat Sheet

**Choose Dataset:**
- Molecular property → `references/datasets.md` → Molecular section
- Protein task → `references/datasets.md` → Protein section
- Knowledge graph → `references/datasets.md` → Knowledge graph section

**Choose Model:**
- Molecules → `references/models_architectures.md` → GNN section → GIN/GAT/SchNet
- Proteins (sequence) → `references/models_architectures.md` → Protein section → ESM
- Proteins (structure) → `references/models_architectures.md` → Protein section → GearNet
- Knowledge graph → `references/models_architectures.md` → KG section → RotatE/ComplEx

**Common Tasks:**
- Property prediction → `references/molecular_property_prediction.md` or `references/protein_modeling.md`
- Generation → `references/molecular_generation.md`
- Retrosynthesis → `references/retrosynthesis.md`
- KG reasoning → `references/knowledge_graphs.md`

**Understand Architecture:**
- Data structures → `references/core_concepts.md` → Data Structures
- Model design → `references/core_concepts.md` → Model Interface
- Task design → `references/core_concepts.md` → Task Interface

## Troubleshooting Common Issues

**Issue: Dimension mismatch errors**
→ Check `model.input_dim` matches `dataset.node_feature_dim`
→ See `references/core_concepts.md` → Essential Attributes

**Issue: Poor performance on molecular tasks**
→ Use scaffold splitting, not random
→ Try GIN instead of GCN
→ See `references/molecular_property_prediction.md` → Best Practices

**Issue: Protein model not learning**
→ Use pre-trained ESM for sequence tasks
→ Check edge construction for structure models
→ See `references/protein_modeling.md` → Training Workflows

**Issue: Memory errors with large graphs**
→ Reduce batch size
→ Use gradient accumulation
→ See `references/core_concepts.md` → Memory Efficiency

**Issue: Generated molecules are invalid**
→ Add validity constraints
→ Post-process with RDKit validation
→ See `references/molecular_generation.md` → Validation and Filtering

## Resources

**Official Documentation:** https://torchdrug.ai/docs/
**GitHub:** https://github.com/DeepGraphLearning/torchdrug
**Paper:** TorchDrug: A Powerful and Flexible Machine Learning Platform for Drug Discovery

## Summary

Navigate to the appropriate reference file based on your task:

1. **Molecular property prediction** → `molecular_property_prediction.md`
2. **Protein modeling** → `protein_modeling.md`
3. **Knowledge graphs** → `knowledge_graphs.md`
4. **Molecular generation** → `molecular_generation.md`
5. **Retrosynthesis** → `retrosynthesis.md`
6. **Model selection** → `models_architectures.md`
7. **Dataset selection** → `datasets.md`
8. **Technical details** → `core_concepts.md`

Each reference provides comprehensive coverage of its domain with examples, best practices, and common use cases.

