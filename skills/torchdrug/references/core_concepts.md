# Core Concepts and Technical Details

## Overview

This reference covers TorchDrug's fundamental architecture, design principles, and technical implementation details.

## Architecture Philosophy

### Modular Design

TorchDrug separates concerns into distinct modules:

1. **Representation Models** (models.py): Encode graphs into embeddings
2. **Task Definitions** (tasks.py): Define learning objectives and evaluation
3. **Data Handling** (data.py, datasets.py): Graph structures and datasets
4. **Core Components** (core.py): Base classes and utilities

**Benefits:**
- Reuse representations across tasks
- Mix and match components
- Easy experimentation and prototyping
- Clear separation of concerns

### Configurable System

All components inherit from `core.Configurable`:
- Serialize to configuration dictionaries
- Reconstruct from configurations
- Save and load complete pipelines
- Reproducible experiments

## Core Components

### core.Configurable

Base class for all TorchDrug components.

**Key Methods:**
- `config_dict()`: Serialize to dictionary
- `load_config_dict(config)`: Load from dictionary
- `save(file)`: Save to file
- `load(file)`: Load from file

**Example:**
```python
from torchdrug import core, models

model = models.GIN(input_dim=10, hidden_dims=[256, 256])

# Save configuration
config = model.config_dict()
# {'class': 'GIN', 'input_dim': 10, 'hidden_dims': [256, 256], ...}

# Reconstruct model
model2 = core.Configurable.load_config_dict(config)
```

### core.Registry

Decorator for registering models, tasks, and datasets.

**Usage:**
```python
from torchdrug import core as core_td

@core_td.register("models.CustomModel")
class CustomModel(nn.Module, core_td.Configurable):
    def __init__(self, input_dim, hidden_dim):
        super().__init__()
        self.linear = nn.Linear(input_dim, hidden_dim)

    def forward(self, graph, input, all_loss, metric):
        # Model implementation
        pass
```

**Benefits:**
- Models automatically serializable
- String-based model specification
- Easy model lookup and instantiation

## Data Structures

### Graph

Core data structure representing molecular or protein graphs.

**Attributes:**
- `num_node`: Number of nodes
- `num_edge`: Number of edges
- `node_feature`: Node feature tensor [num_node, feature_dim]
- `edge_feature`: Edge feature tensor [num_edge, feature_dim]
- `edge_list`: Edge connectivity [num_edge, 2 or 3]
- `num_relation`: Number of edge types (for multi-relational)

**Methods:**
- `node_mask(mask)`: Select subset of nodes
- `edge_mask(mask)`: Select subset of edges
- `undirected()`: Make graph undirected
- `directed()`: Make graph directed

**Batching:**
- Graphs batched into single disconnected graph
- Automatic batching in DataLoader
- Preserves node/edge indices per graph

### Molecule (extends Graph)

Specialized graph for molecules.

**Additional Attributes:**
- `atom_type`: Atomic numbers
- `bond_type`: Bond types (single, double, triple, aromatic)
- `formal_charge`: Atomic formal charges
- `explicit_hs`: Explicit hydrogen counts

**Methods:**
- `from_smiles(smiles)`: Create from SMILES string
- `from_molecule(mol)`: Create from RDKit molecule
- `to_smiles()`: Convert to SMILES
- `to_molecule()`: Convert to RDKit molecule
- `ion_to_molecule()`: Neutralize charges

**Example:**
```python
from torchdrug import data

# From SMILES
mol = data.Molecule.from_smiles("CCO")

# Atom features
print(mol.atom_type)  # [6, 6, 8] (C, C, O)
print(mol.bond_type)  # [1, 1] (single bonds)
```

### Protein (extends Graph)

Specialized graph for proteins.

**Additional Attributes:**
- `residue_type`: Amino acid types
- `atom_name`: Atom names (CA, CB, etc.)
- `atom_type`: Atomic numbers
- `residue_number`: Residue numbering
- `chain_id`: Chain identifiers

**Methods:**
- `from_pdb(pdb_file)`: Load from PDB file
- `from_sequence(sequence)`: Create from sequence
- `to_pdb(pdb_file)`: Save to PDB file

**Graph Construction:**
- Nodes typically represent residues (not atoms)
- Edges can be sequential, spatial (KNN), or contact-based
- Configurable edge construction strategies

**Example:**
```python
from torchdrug import data

# Load protein
protein = data.Protein.from_pdb("1a3x.pdb")

# Build graph with multiple edge types
graph = protein.residue_graph(
    node_position="ca",  # Use Cα positions
    edge_types=["sequential", "radius"]  # Sequential + spatial edges
)
```

### PackedGraph

Efficient batching structure for heterogeneous graphs.

**Purpose:**
- Batch graphs of different sizes
- Single GPU memory allocation
- Efficient parallel processing

**Attributes:**
- `num_nodes`: List of node counts per graph
- `num_edges`: List of edge counts per graph
- `graph_ind`: Graph index for each node

**Use Cases:**
- Automatic in DataLoader
- Custom batching strategies
- Multi-graph operations

## Model Interface

### Forward Function Signature

All TorchDrug models follow a standardized interface:

```python
def forward(self, graph, input, all_loss=None, metric=None):
    """
    Args:
        graph (Graph): Batch of graphs
        input (Tensor): Node input features
        all_loss (Tensor, optional): Accumulator for losses
        metric (dict, optional): Dictionary for metrics

    Returns:
        dict: Output dictionary with representation keys
    """
    # Model computation
    output = self.layers(graph, input)

    return {
        "node_feature": output,
        "graph_feature": graph_pooling(output)
    }
```

**Key Points:**
- `graph`: Batched graph structure
- `input`: Node features [num_node, input_dim]
- `all_loss`: Accumulated loss (for multi-task)
- `metric`: Shared metric dictionary
- Returns dict with representation types

### Essential Attributes

**All models must define:**
- `input_dim`: Expected input feature dimension
- `output_dim`: Output representation dimension

**Purpose:**
- Automatic dimension checking
- Compose models in pipelines
- Error checking and validation

**Example:**
```python
class CustomModel(nn.Module):
    def __init__(self, input_dim, hidden_dim):
        super().__init__()
        self.input_dim = input_dim
        self.output_dim = hidden_dim
        # ... layers ...
```

## Task Interface

### Core Task Methods

All tasks implement these methods:

```python
class CustomTask(tasks.Task):
    def preprocess(self, train_set, valid_set, test_set):
        """Dataset-specific preprocessing (optional)"""
        pass

    def predict(self, batch):
        """Generate predictions for a batch"""
        graph, label = batch
        output = self.model(graph, graph.node_feature)
        pred = self.mlp(output["graph_feature"])
        return pred

    def target(self, batch):
        """Extract ground truth labels"""
        graph, label = batch
        return label

    def forward(self, batch):
        """Compute training loss"""
        pred = self.predict(batch)
        target = self.target(batch)
        loss = self.criterion(pred, target)
        return loss

    def evaluate(self, pred, target):
        """Compute evaluation metrics"""
        metrics = {}
        metrics["auroc"] = compute_auroc(pred, target)
        metrics["auprc"] = compute_auprc(pred, target)
        return metrics
```

### Task Components

**Typical Task Structure:**
1. **Representation Model**: Encodes graph to embeddings
2. **Readout/Prediction Head**: Maps embeddings to predictions
3. **Loss Function**: Training objective
4. **Metrics**: Evaluation measures

**Example:**
```python
from torchdrug import tasks, models

# Representation model
model = models.GIN(input_dim=10, hidden_dims=[256, 256])

# Task wraps model with prediction head
task = tasks.PropertyPrediction(
    model=model,
    task=["task1", "task2"],  # Multi-task
    criterion="bce",
    metric=["auroc", "auprc"],
    num_mlp_layer=2
)
```

## Training Workflow

### Standard Training Loop

```python
import torch
from torch.utils.data import DataLoader
from torchdrug import core, models, tasks, datasets

# 1. Load dataset
dataset = datasets.BBBP("~/datasets/")
train_set, valid_set, test_set = dataset.split()

# 2. Create data loaders
train_loader = DataLoader(train_set, batch_size=32, shuffle=True)
valid_loader = DataLoader(valid_set, batch_size=32)

# 3. Define model and task
model = models.GIN(input_dim=dataset.node_feature_dim,
                   hidden_dims=[256, 256, 256])
task = tasks.PropertyPrediction(model, task=dataset.tasks,
                                 criterion="bce", metric=["auroc", "auprc"])

# 4. Setup optimizer
optimizer = torch.optim.Adam(task.parameters(), lr=1e-3)

# 5. Training loop
for epoch in range(100):
    # Train
    task.train()
    for batch in train_loader:
        loss = task(batch)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

    # Validate
    task.eval()
    preds, targets = [], []
    for batch in valid_loader:
        pred = task.predict(batch)
        target = task.target(batch)
        preds.append(pred)
        targets.append(target)

    preds = torch.cat(preds)
    targets = torch.cat(targets)
    metrics = task.evaluate(preds, targets)
    print(f"Epoch {epoch}: {metrics}")
```

### PyTorch Lightning Integration

TorchDrug tasks are compatible with PyTorch Lightning:

```python
import pytorch_lightning as pl

class LightningWrapper(pl.LightningModule):
    def __init__(self, task):
        super().__init__()
        self.task = task

    def training_step(self, batch, batch_idx):
        loss = self.task(batch)
        return loss

    def validation_step(self, batch, batch_idx):
        pred = self.task.predict(batch)
        target = self.task.target(batch)
        return {"pred": pred, "target": target}

    def validation_epoch_end(self, outputs):
        preds = torch.cat([o["pred"] for o in outputs])
        targets = torch.cat([o["target"] for o in outputs])
        metrics = self.task.evaluate(preds, targets)
        self.log_dict(metrics)

    def configure_optimizers(self):
        return torch.optim.Adam(self.parameters(), lr=1e-3)
```

## Loss Functions

### Built-in Criteria

**Classification:**
- `"bce"`: Binary cross-entropy
- `"ce"`: Cross-entropy (multi-class)

**Regression:**
- `"mse"`: Mean squared error
- `"mae"`: Mean absolute error

**Knowledge Graph:**
- `"bce"`: Binary classification of triples
- `"ce"`: Cross-entropy ranking loss
- `"margin"`: Margin-based ranking

### Custom Loss

```python
class CustomTask(tasks.Task):
    def forward(self, batch):
        pred = self.predict(batch)
        target = self.target(batch)

        # Custom loss computation
        loss = custom_loss_function(pred, target)

        return loss
```

## Metrics

### Common Metrics

**Classification:**
- **AUROC**: Area under ROC curve
- **AUPRC**: Area under precision-recall curve
- **Accuracy**: Overall accuracy
- **F1**: Harmonic mean of precision and recall

**Regression:**
- **MAE**: Mean absolute error
- **RMSE**: Root mean squared error
- **R²**: Coefficient of determination
- **Pearson**: Pearson correlation

**Ranking (Knowledge Graph):**
- **MR**: Mean rank
- **MRR**: Mean reciprocal rank
- **Hits@K**: Percentage in top K

### Multi-Task Metrics

For multi-label or multi-task:
- Metrics computed per task
- Macro-average across tasks
- Can weight by task importance

## Data Transforms

### Molecule Transforms

```python
from torchdrug import transforms

# Add virtual node connected to all atoms
transform1 = transforms.VirtualNode()

# Add virtual edges
transform2 = transforms.VirtualEdge()

# Compose transforms
transform = transforms.Compose([transform1, transform2])

dataset = datasets.BBBP("~/datasets/", transform=transform)
```

### Protein Transforms

```python
# Add edges based on spatial proximity
transform = transforms.TruncateProtein(max_length=500)

dataset = datasets.Fold("~/datasets/", transform=transform)
```

## Best Practices

### Memory Efficiency

1. **Gradient Accumulation**: For large models
2. **Mixed Precision**: FP16 training
3. **Batch Size Tuning**: Balance speed and memory
4. **Data Loading**: Multiple workers for I/O

### Reproducibility

1. **Set Seeds**: PyTorch, NumPy, Python random
2. **Deterministic Operations**: `torch.use_deterministic_algorithms(True)`
3. **Save Configurations**: Use `core.Configurable`
4. **Version Control**: Track TorchDrug version

### Debugging

1. **Check Dimensions**: Verify `input_dim` and `output_dim`
2. **Validate Batching**: Print batch statistics
3. **Monitor Gradients**: Watch for vanishing/exploding
4. **Overfit Small Batch**: Ensure model capacity

### Performance Optimization

1. **GPU Utilization**: Monitor with `nvidia-smi`
2. **Profile Code**: Use PyTorch profiler
3. **Optimize Data Loading**: Prefetch, pin memory
4. **Compile Models**: Use TorchScript if possible

## Advanced Topics

### Multi-Task Learning

Train single model on multiple related tasks:
```python
task = tasks.PropertyPrediction(
    model,
    task=["task1", "task2", "task3"],
    criterion="bce",
    metric=["auroc"],
    task_weight=[1.0, 1.0, 2.0]  # Weight task 3 more
)
```

### Transfer Learning

1. Pre-train on large dataset
2. Fine-tune on target dataset
3. Optionally freeze early layers

### Self-Supervised Pre-training

Use pre-training tasks:
- `AttributeMasking`: Mask node features
- `EdgePrediction`: Predict edge existence
- `ContextPrediction`: Contrastive learning

### Custom Layers

Extend TorchDrug with custom GNN layers:
```python
from torchdrug import layers

class CustomConv(layers.MessagePassingBase):
    def message(self, graph, input):
        # Custom message function
        pass

    def aggregate(self, graph, message):
        # Custom aggregation
        pass

    def combine(self, input, update):
        # Custom combination
        pass
```

## Common Pitfalls

1. **Forgetting `input_dim` and `output_dim`**: Models won't compose
2. **Not Batching Properly**: Use PackedGraph for variable-sized graphs
3. **Data Leakage**: Be careful with scaffold splits and pre-training
4. **Ignoring Edge Features**: Bonds/spatial info can be critical
5. **Wrong Evaluation Metrics**: Match metrics to task (AUROC for imbalanced)
6. **Insufficient Regularization**: Use dropout, weight decay, early stopping
7. **Not Validating Chemistry**: Generated molecules must be valid
8. **Overfitting Small Datasets**: Use pre-training or simpler models
