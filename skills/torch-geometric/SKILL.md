---
name: torch-geometric
description: Graph Neural Networks (PyG). Node/graph classification, link prediction, GCN, GAT, GraphSAGE, heterogeneous graphs, molecular property prediction, for geometric deep learning.
license: MIT license
metadata:
    skill-author: K-Dense Inc.
---

# PyTorch Geometric (PyG)

## Overview

PyTorch Geometric is a library built on PyTorch for developing and training Graph Neural Networks (GNNs). Apply this skill for deep learning on graphs and irregular structures, including mini-batch processing, multi-GPU training, and geometric deep learning applications.

## When to Use This Skill

This skill should be used when working with:
- **Graph-based machine learning**: Node classification, graph classification, link prediction
- **Molecular property prediction**: Drug discovery, chemical property prediction
- **Social network analysis**: Community detection, influence prediction
- **Citation networks**: Paper classification, recommendation systems
- **3D geometric data**: Point clouds, meshes, molecular structures
- **Heterogeneous graphs**: Multi-type nodes and edges (e.g., knowledge graphs)
- **Large-scale graph learning**: Neighbor sampling, distributed training

## Quick Start

### Installation

```bash
uv pip install torch_geometric
```

For additional dependencies (sparse operations, clustering):
```bash
uv pip install pyg_lib torch_scatter torch_sparse torch_cluster torch_spline_conv -f https://data.pyg.org/whl/torch-${TORCH}+${CUDA}.html
```

### Basic Graph Creation

```python
import torch
from torch_geometric.data import Data

# Create a simple graph with 3 nodes
edge_index = torch.tensor([[0, 1, 1, 2],  # source nodes
                           [1, 0, 2, 1]], dtype=torch.long)  # target nodes
x = torch.tensor([[-1], [0], [1]], dtype=torch.float)  # node features

data = Data(x=x, edge_index=edge_index)
print(f"Nodes: {data.num_nodes}, Edges: {data.num_edges}")
```

### Loading a Benchmark Dataset

```python
from torch_geometric.datasets import Planetoid

# Load Cora citation network
dataset = Planetoid(root='/tmp/Cora', name='Cora')
data = dataset[0]  # Get the first (and only) graph

print(f"Dataset: {dataset}")
print(f"Nodes: {data.num_nodes}, Edges: {data.num_edges}")
print(f"Features: {data.num_node_features}, Classes: {dataset.num_classes}")
```

## Core Concepts

### Data Structure

PyG represents graphs using the `torch_geometric.data.Data` class with these key attributes:

- **`data.x`**: Node feature matrix `[num_nodes, num_node_features]`
- **`data.edge_index`**: Graph connectivity in COO format `[2, num_edges]`
- **`data.edge_attr`**: Edge feature matrix `[num_edges, num_edge_features]` (optional)
- **`data.y`**: Target labels for nodes or graphs
- **`data.pos`**: Node spatial positions `[num_nodes, num_dimensions]` (optional)
- **Custom attributes**: Can add any attribute (e.g., `data.train_mask`, `data.batch`)

**Important**: These attributes are not mandatory—extend Data objects with custom attributes as needed.

### Edge Index Format

Edges are stored in COO (coordinate) format as a `[2, num_edges]` tensor:
- First row: source node indices
- Second row: target node indices

```python
# Edge list: (0→1), (1→0), (1→2), (2→1)
edge_index = torch.tensor([[0, 1, 1, 2],
                           [1, 0, 2, 1]], dtype=torch.long)
```

### Mini-Batch Processing

PyG handles batching by creating block-diagonal adjacency matrices, concatenating multiple graphs into one large disconnected graph:

- Adjacency matrices are stacked diagonally
- Node features are concatenated along the node dimension
- A `batch` vector maps each node to its source graph
- No padding needed—computationally efficient

```python
from torch_geometric.loader import DataLoader

loader = DataLoader(dataset, batch_size=32, shuffle=True)
for batch in loader:
    print(f"Batch size: {batch.num_graphs}")
    print(f"Total nodes: {batch.num_nodes}")
    # batch.batch maps nodes to graphs
```

## Building Graph Neural Networks

### Message Passing Paradigm

GNNs in PyG follow a neighborhood aggregation scheme:
1. Transform node features
2. Propagate messages along edges
3. Aggregate messages from neighbors
4. Update node representations

### Using Pre-Built Layers

PyG provides 40+ convolutional layers. Common ones include:

**GCNConv** (Graph Convolutional Network):
```python
from torch_geometric.nn import GCNConv
import torch.nn.functional as F

class GCN(torch.nn.Module):
    def __init__(self, num_features, num_classes):
        super().__init__()
        self.conv1 = GCNConv(num_features, 16)
        self.conv2 = GCNConv(16, num_classes)

    def forward(self, data):
        x, edge_index = data.x, data.edge_index
        x = self.conv1(x, edge_index)
        x = F.relu(x)
        x = F.dropout(x, training=self.training)
        x = self.conv2(x, edge_index)
        return F.log_softmax(x, dim=1)
```

**GATConv** (Graph Attention Network):
```python
from torch_geometric.nn import GATConv

class GAT(torch.nn.Module):
    def __init__(self, num_features, num_classes):
        super().__init__()
        self.conv1 = GATConv(num_features, 8, heads=8, dropout=0.6)
        self.conv2 = GATConv(8 * 8, num_classes, heads=1, concat=False, dropout=0.6)

    def forward(self, data):
        x, edge_index = data.x, data.edge_index
        x = F.dropout(x, p=0.6, training=self.training)
        x = F.elu(self.conv1(x, edge_index))
        x = F.dropout(x, p=0.6, training=self.training)
        x = self.conv2(x, edge_index)
        return F.log_softmax(x, dim=1)
```

**GraphSAGE**:
```python
from torch_geometric.nn import SAGEConv

class GraphSAGE(torch.nn.Module):
    def __init__(self, num_features, num_classes):
        super().__init__()
        self.conv1 = SAGEConv(num_features, 64)
        self.conv2 = SAGEConv(64, num_classes)

    def forward(self, data):
        x, edge_index = data.x, data.edge_index
        x = self.conv1(x, edge_index)
        x = F.relu(x)
        x = F.dropout(x, training=self.training)
        x = self.conv2(x, edge_index)
        return F.log_softmax(x, dim=1)
```

### Custom Message Passing Layers

For custom layers, inherit from `MessagePassing`:

```python
from torch_geometric.nn import MessagePassing
from torch_geometric.utils import add_self_loops, degree

class CustomConv(MessagePassing):
    def __init__(self, in_channels, out_channels):
        super().__init__(aggr='add')  # "add", "mean", or "max"
        self.lin = torch.nn.Linear(in_channels, out_channels)

    def forward(self, x, edge_index):
        # Add self-loops to adjacency matrix
        edge_index, _ = add_self_loops(edge_index, num_nodes=x.size(0))

        # Transform node features
        x = self.lin(x)

        # Compute normalization
        row, col = edge_index
        deg = degree(col, x.size(0), dtype=x.dtype)
        deg_inv_sqrt = deg.pow(-0.5)
        norm = deg_inv_sqrt[row] * deg_inv_sqrt[col]

        # Propagate messages
        return self.propagate(edge_index, x=x, norm=norm)

    def message(self, x_j, norm):
        # x_j: features of source nodes
        return norm.view(-1, 1) * x_j
```

Key methods:
- **`forward()`**: Main entry point
- **`message()`**: Constructs messages from source to target nodes
- **`aggregate()`**: Aggregates messages (usually don't override—set `aggr` parameter)
- **`update()`**: Updates node embeddings after aggregation

**Variable naming convention**: Appending `_i` or `_j` to tensor names automatically maps them to target or source nodes.

## Working with Datasets

### Loading Built-in Datasets

PyG provides extensive benchmark datasets:

```python
# Citation networks (node classification)
from torch_geometric.datasets import Planetoid
dataset = Planetoid(root='/tmp/Cora', name='Cora')  # or 'CiteSeer', 'PubMed'

# Graph classification
from torch_geometric.datasets import TUDataset
dataset = TUDataset(root='/tmp/ENZYMES', name='ENZYMES')

# Molecular datasets
from torch_geometric.datasets import QM9
dataset = QM9(root='/tmp/QM9')

# Large-scale datasets
from torch_geometric.datasets import Reddit
dataset = Reddit(root='/tmp/Reddit')
```

Check `references/datasets_reference.md` for a comprehensive list.

### Creating Custom Datasets

For datasets that fit in memory, inherit from `InMemoryDataset`:

```python
from torch_geometric.data import InMemoryDataset, Data
import torch

class MyOwnDataset(InMemoryDataset):
    def __init__(self, root, transform=None, pre_transform=None):
        super().__init__(root, transform, pre_transform)
        self.load(self.processed_paths[0])

    @property
    def raw_file_names(self):
        return ['my_data.csv']  # Files needed in raw_dir

    @property
    def processed_file_names(self):
        return ['data.pt']  # Files in processed_dir

    def download(self):
        # Download raw data to self.raw_dir
        pass

    def process(self):
        # Read data, create Data objects
        data_list = []

        # Example: Create a simple graph
        edge_index = torch.tensor([[0, 1], [1, 0]], dtype=torch.long)
        x = torch.randn(2, 16)
        y = torch.tensor([0], dtype=torch.long)

        data = Data(x=x, edge_index=edge_index, y=y)
        data_list.append(data)

        # Apply pre_filter and pre_transform
        if self.pre_filter is not None:
            data_list = [d for d in data_list if self.pre_filter(d)]

        if self.pre_transform is not None:
            data_list = [self.pre_transform(d) for d in data_list]

        # Save processed data
        self.save(data_list, self.processed_paths[0])
```

For large datasets that don't fit in memory, inherit from `Dataset` and implement `len()` and `get(idx)`.

### Loading Graphs from CSV

```python
import pandas as pd
import torch
from torch_geometric.data import HeteroData

# Load nodes
nodes_df = pd.read_csv('nodes.csv')
x = torch.tensor(nodes_df[['feat1', 'feat2']].values, dtype=torch.float)

# Load edges
edges_df = pd.read_csv('edges.csv')
edge_index = torch.tensor([edges_df['source'].values,
                           edges_df['target'].values], dtype=torch.long)

data = Data(x=x, edge_index=edge_index)
```

## Training Workflows

### Node Classification (Single Graph)

```python
import torch
import torch.nn.functional as F
from torch_geometric.datasets import Planetoid

# Load dataset
dataset = Planetoid(root='/tmp/Cora', name='Cora')
data = dataset[0]

# Create model
model = GCN(dataset.num_features, dataset.num_classes)
optimizer = torch.optim.Adam(model.parameters(), lr=0.01, weight_decay=5e-4)

# Training
model.train()
for epoch in range(200):
    optimizer.zero_grad()
    out = model(data)
    loss = F.nll_loss(out[data.train_mask], data.y[data.train_mask])
    loss.backward()
    optimizer.step()

    if epoch % 10 == 0:
        print(f'Epoch {epoch}, Loss: {loss.item():.4f}')

# Evaluation
model.eval()
pred = model(data).argmax(dim=1)
correct = (pred[data.test_mask] == data.y[data.test_mask]).sum()
acc = int(correct) / int(data.test_mask.sum())
print(f'Test Accuracy: {acc:.4f}')
```

### Graph Classification (Multiple Graphs)

```python
from torch_geometric.datasets import TUDataset
from torch_geometric.loader import DataLoader
from torch_geometric.nn import global_mean_pool

class GraphClassifier(torch.nn.Module):
    def __init__(self, num_features, num_classes):
        super().__init__()
        self.conv1 = GCNConv(num_features, 64)
        self.conv2 = GCNConv(64, 64)
        self.lin = torch.nn.Linear(64, num_classes)

    def forward(self, data):
        x, edge_index, batch = data.x, data.edge_index, data.batch

        x = self.conv1(x, edge_index)
        x = F.relu(x)
        x = self.conv2(x, edge_index)
        x = F.relu(x)

        # Global pooling (aggregate node features to graph-level)
        x = global_mean_pool(x, batch)

        x = self.lin(x)
        return F.log_softmax(x, dim=1)

# Load dataset
dataset = TUDataset(root='/tmp/ENZYMES', name='ENZYMES')
loader = DataLoader(dataset, batch_size=32, shuffle=True)

model = GraphClassifier(dataset.num_features, dataset.num_classes)
optimizer = torch.optim.Adam(model.parameters(), lr=0.01)

# Training
model.train()
for epoch in range(100):
    total_loss = 0
    for batch in loader:
        optimizer.zero_grad()
        out = model(batch)
        loss = F.nll_loss(out, batch.y)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()

    if epoch % 10 == 0:
        print(f'Epoch {epoch}, Loss: {total_loss / len(loader):.4f}')
```

### Large-Scale Graphs with Neighbor Sampling

For large graphs, use `NeighborLoader` to sample subgraphs:

```python
from torch_geometric.loader import NeighborLoader

# Create a neighbor sampler
train_loader = NeighborLoader(
    data,
    num_neighbors=[25, 10],  # Sample 25 neighbors for 1st hop, 10 for 2nd hop
    batch_size=128,
    input_nodes=data.train_mask,
)

# Training
model.train()
for batch in train_loader:
    optimizer.zero_grad()
    out = model(batch)
    # Only compute loss on seed nodes (first batch_size nodes)
    loss = F.nll_loss(out[:batch.batch_size], batch.y[:batch.batch_size])
    loss.backward()
    optimizer.step()
```

**Important**:
- Output subgraphs are directed
- Node indices are relabeled (0 to batch.num_nodes - 1)
- Only use seed node predictions for loss computation
- Sampling beyond 2-3 hops is generally not feasible

## Advanced Features

### Heterogeneous Graphs

For graphs with multiple node and edge types, use `HeteroData`:

```python
from torch_geometric.data import HeteroData

data = HeteroData()

# Add node features for different types
data['paper'].x = torch.randn(100, 128)  # 100 papers with 128 features
data['author'].x = torch.randn(200, 64)  # 200 authors with 64 features

# Add edges for different types (source_type, edge_type, target_type)
data['author', 'writes', 'paper'].edge_index = torch.randint(0, 200, (2, 500))
data['paper', 'cites', 'paper'].edge_index = torch.randint(0, 100, (2, 300))

print(data)
```

Convert homogeneous models to heterogeneous:

```python
from torch_geometric.nn import to_hetero

# Define homogeneous model
model = GNN(...)

# Convert to heterogeneous
model = to_hetero(model, data.metadata(), aggr='sum')

# Use as normal
out = model(data.x_dict, data.edge_index_dict)
```

Or use `HeteroConv` for custom edge-type-specific operations:

```python
from torch_geometric.nn import HeteroConv, GCNConv, SAGEConv

class HeteroGNN(torch.nn.Module):
    def __init__(self, metadata):
        super().__init__()
        self.conv1 = HeteroConv({
            ('paper', 'cites', 'paper'): GCNConv(-1, 64),
            ('author', 'writes', 'paper'): SAGEConv((-1, -1), 64),
        }, aggr='sum')

        self.conv2 = HeteroConv({
            ('paper', 'cites', 'paper'): GCNConv(64, 32),
            ('author', 'writes', 'paper'): SAGEConv((64, 64), 32),
        }, aggr='sum')

    def forward(self, x_dict, edge_index_dict):
        x_dict = self.conv1(x_dict, edge_index_dict)
        x_dict = {key: F.relu(x) for key, x in x_dict.items()}
        x_dict = self.conv2(x_dict, edge_index_dict)
        return x_dict
```

### Transforms

Apply transforms to modify graph structure or features:

```python
from torch_geometric.transforms import NormalizeFeatures, AddSelfLoops, Compose

# Single transform
transform = NormalizeFeatures()
dataset = Planetoid(root='/tmp/Cora', name='Cora', transform=transform)

# Compose multiple transforms
transform = Compose([
    AddSelfLoops(),
    NormalizeFeatures(),
])
dataset = Planetoid(root='/tmp/Cora', name='Cora', transform=transform)
```

Common transforms:
- **Structure**: `ToUndirected`, `AddSelfLoops`, `RemoveSelfLoops`, `KNNGraph`, `RadiusGraph`
- **Features**: `NormalizeFeatures`, `NormalizeScale`, `Center`
- **Sampling**: `RandomNodeSplit`, `RandomLinkSplit`
- **Positional Encoding**: `AddLaplacianEigenvectorPE`, `AddRandomWalkPE`

See `references/transforms_reference.md` for the full list.

### Model Explainability

PyG provides explainability tools to understand model predictions:

```python
from torch_geometric.explain import Explainer, GNNExplainer

# Create explainer
explainer = Explainer(
    model=model,
    algorithm=GNNExplainer(epochs=200),
    explanation_type='model',  # or 'phenomenon'
    node_mask_type='attributes',
    edge_mask_type='object',
    model_config=dict(
        mode='multiclass_classification',
        task_level='node',
        return_type='log_probs',
    ),
)

# Generate explanation for a specific node
node_idx = 10
explanation = explainer(data.x, data.edge_index, index=node_idx)

# Visualize
print(f'Node {node_idx} explanation:')
print(f'Important edges: {explanation.edge_mask.topk(5).indices}')
print(f'Important features: {explanation.node_mask[node_idx].topk(5).indices}')
```

### Pooling Operations

For hierarchical graph representations:

```python
from torch_geometric.nn import TopKPooling, global_mean_pool

class HierarchicalGNN(torch.nn.Module):
    def __init__(self, num_features, num_classes):
        super().__init__()
        self.conv1 = GCNConv(num_features, 64)
        self.pool1 = TopKPooling(64, ratio=0.8)
        self.conv2 = GCNConv(64, 64)
        self.pool2 = TopKPooling(64, ratio=0.8)
        self.lin = torch.nn.Linear(64, num_classes)

    def forward(self, data):
        x, edge_index, batch = data.x, data.edge_index, data.batch

        x = F.relu(self.conv1(x, edge_index))
        x, edge_index, _, batch, _, _ = self.pool1(x, edge_index, None, batch)

        x = F.relu(self.conv2(x, edge_index))
        x, edge_index, _, batch, _, _ = self.pool2(x, edge_index, None, batch)

        x = global_mean_pool(x, batch)
        x = self.lin(x)
        return F.log_softmax(x, dim=1)
```

## Common Patterns and Best Practices

### Check Graph Properties

```python
# Undirected check
from torch_geometric.utils import is_undirected
print(f"Is undirected: {is_undirected(data.edge_index)}")

# Connected components
from torch_geometric.utils import connected_components
print(f"Connected components: {connected_components(data.edge_index)}")

# Contains self-loops
from torch_geometric.utils import contains_self_loops
print(f"Has self-loops: {contains_self_loops(data.edge_index)}")
```

### GPU Training

```python
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = model.to(device)
data = data.to(device)

# For DataLoader
for batch in loader:
    batch = batch.to(device)
    # Train...
```

### Save and Load Models

```python
# Save
torch.save(model.state_dict(), 'model.pth')

# Load
model = GCN(num_features, num_classes)
model.load_state_dict(torch.load('model.pth'))
model.eval()
```

### Layer Capabilities

When choosing layers, consider these capabilities:
- **SparseTensor**: Supports efficient sparse matrix operations
- **edge_weight**: Handles one-dimensional edge weights
- **edge_attr**: Processes multi-dimensional edge features
- **Bipartite**: Works with bipartite graphs (different source/target dimensions)
- **Lazy**: Enables initialization without specifying input dimensions

See the GNN cheatsheet at `references/layer_capabilities.md`.

## Resources

### Bundled References

This skill includes detailed reference documentation:

- **`references/layers_reference.md`**: Complete listing of all 40+ GNN layers with descriptions and capabilities
- **`references/datasets_reference.md`**: Comprehensive dataset catalog organized by category
- **`references/transforms_reference.md`**: All available transforms and their use cases
- **`references/api_patterns.md`**: Common API patterns and coding examples

### Scripts

Utility scripts are provided in `scripts/`:

- **`scripts/visualize_graph.py`**: Visualize graph structure using networkx and matplotlib
- **`scripts/create_gnn_template.py`**: Generate boilerplate code for common GNN architectures
- **`scripts/benchmark_model.py`**: Benchmark model performance on standard datasets

Execute scripts directly or read them for implementation patterns.

### Official Resources

- **Documentation**: https://pytorch-geometric.readthedocs.io/
- **GitHub**: https://github.com/pyg-team/pytorch_geometric
- **Tutorials**: https://pytorch-geometric.readthedocs.io/en/latest/get_started/introduction.html
- **Examples**: https://github.com/pyg-team/pytorch_geometric/tree/master/examples

