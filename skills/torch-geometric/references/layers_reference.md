# PyTorch Geometric Neural Network Layers Reference

This document provides a comprehensive reference of all neural network layers available in `torch_geometric.nn`.

## Layer Capability Flags

When selecting layers, consider these capability flags:

- **SparseTensor**: Supports `torch_sparse.SparseTensor` format for efficient sparse operations
- **edge_weight**: Handles one-dimensional edge weight data
- **edge_attr**: Processes multi-dimensional edge feature information
- **Bipartite**: Works with bipartite graphs (different source/target node dimensions)
- **Static**: Operates on static graphs with batched node features
- **Lazy**: Enables initialization without specifying input channel dimensions

## Convolutional Layers

### Standard Graph Convolutions

**GCNConv** - Graph Convolutional Network layer
- Implements spectral graph convolution with symmetric normalization
- Supports: SparseTensor, edge_weight, Bipartite, Lazy
- Use for: Citation networks, social networks, general graph learning
- Example: `GCNConv(in_channels, out_channels, improved=False, cached=True)`

**SAGEConv** - GraphSAGE layer
- Inductive learning via neighborhood sampling and aggregation
- Supports: SparseTensor, Bipartite, Lazy
- Use for: Large graphs, inductive learning, heterogeneous features
- Example: `SAGEConv(in_channels, out_channels, aggr='mean')`

**GATConv** - Graph Attention Network layer
- Multi-head attention mechanism for adaptive neighbor weighting
- Supports: SparseTensor, edge_attr, Bipartite, Static, Lazy
- Use for: Tasks requiring variable neighbor importance
- Example: `GATConv(in_channels, out_channels, heads=8, dropout=0.6)`

**GraphConv** - Simple graph convolution (Morris et al.)
- Basic message passing with optional edge weights
- Supports: SparseTensor, edge_weight, Bipartite, Lazy
- Use for: Baseline models, simple graph structures
- Example: `GraphConv(in_channels, out_channels, aggr='add')`

**GINConv** - Graph Isomorphism Network layer
- Maximally powerful GNN for graph isomorphism testing
- Supports: Bipartite
- Use for: Graph classification, molecular property prediction
- Example: `GINConv(nn.Sequential(nn.Linear(in_channels, out_channels), nn.ReLU()))`

**TransformerConv** - Graph Transformer layer
- Combines graph structure with transformer attention
- Supports: SparseTensor, Bipartite, Lazy
- Use for: Long-range dependencies, complex graphs
- Example: `TransformerConv(in_channels, out_channels, heads=8, beta=True)`

**ChebConv** - Chebyshev spectral graph convolution
- Uses Chebyshev polynomials for efficient spectral filtering
- Supports: SparseTensor, edge_weight, Bipartite, Lazy
- Use for: Spectral graph learning, efficient convolutions
- Example: `ChebConv(in_channels, out_channels, K=3)`

**SGConv** - Simplified Graph Convolution
- Pre-computes fixed number of propagation steps
- Supports: SparseTensor, edge_weight, Bipartite, Lazy
- Use for: Fast training, shallow models
- Example: `SGConv(in_channels, out_channels, K=2)`

**APPNP** - Approximate Personalized Propagation of Neural Predictions
- Separates feature transformation from propagation
- Supports: SparseTensor, edge_weight, Lazy
- Use for: Deep propagation without oversmoothing
- Example: `APPNP(K=10, alpha=0.1)`

**ARMAConv** - ARMA graph convolution
- Uses ARMA filters for graph filtering
- Supports: SparseTensor, edge_weight, Bipartite, Lazy
- Use for: Advanced spectral methods
- Example: `ARMAConv(in_channels, out_channels, num_stacks=3, num_layers=2)`

**GATv2Conv** - Improved Graph Attention Network
- Fixes static attention computation issue in GAT
- Supports: SparseTensor, edge_attr, Bipartite, Static, Lazy
- Use for: Better attention learning than original GAT
- Example: `GATv2Conv(in_channels, out_channels, heads=8)`

**SuperGATConv** - Self-supervised Graph Attention
- Adds self-supervised attention mechanism
- Supports: SparseTensor, edge_attr, Bipartite, Static, Lazy
- Use for: Self-supervised learning, limited labels
- Example: `SuperGATConv(in_channels, out_channels, heads=8)`

**GMMConv** - Gaussian Mixture Model Convolution
- Uses Gaussian kernels in pseudo-coordinate space
- Supports: Bipartite
- Use for: Point clouds, spatial data
- Example: `GMMConv(in_channels, out_channels, dim=3, kernel_size=5)`

**SplineConv** - Spline-based convolution
- B-spline basis functions for spatial filtering
- Supports: Bipartite
- Use for: Irregular grids, continuous spaces
- Example: `SplineConv(in_channels, out_channels, dim=2, kernel_size=5)`

**NNConv** - Neural Network Convolution
- Edge features processed by neural networks
- Supports: edge_attr, Bipartite
- Use for: Rich edge features, molecular graphs
- Example: `NNConv(in_channels, out_channels, nn=edge_nn, aggr='mean')`

**CGConv** - Crystal Graph Convolution
- Designed for crystalline materials
- Supports: Bipartite
- Use for: Materials science, crystal structures
- Example: `CGConv(in_channels, dim=3, batch_norm=True)`

**EdgeConv** - Edge Convolution (Dynamic Graph CNN)
- Dynamically computes edges based on feature space
- Supports: Static
- Use for: Point clouds, dynamic graphs
- Example: `EdgeConv(nn=edge_nn, aggr='max')`

**PointNetConv** - PointNet++ convolution
- Local and global feature learning for point clouds
- Use for: 3D point cloud processing
- Example: `PointNetConv(local_nn, global_nn)`

**ResGatedGraphConv** - Residual Gated Graph Convolution
- Gating mechanism with residual connections
- Supports: edge_attr, Bipartite, Lazy
- Use for: Deep GNNs, complex features
- Example: `ResGatedGraphConv(in_channels, out_channels)`

**GENConv** - Generalized Graph Convolution
- Generalizes multiple GNN variants
- Supports: SparseTensor, edge_weight, edge_attr, Bipartite, Lazy
- Use for: Flexible architecture exploration
- Example: `GENConv(in_channels, out_channels, aggr='softmax', num_layers=2)`

**FiLMConv** - Feature-wise Linear Modulation
- Conditions on global features
- Supports: Bipartite, Lazy
- Use for: Conditional generation, multi-task learning
- Example: `FiLMConv(in_channels, out_channels, num_relations=5)`

**PANConv** - Path Attention Network
- Attention over multi-hop paths
- Supports: SparseTensor, Lazy
- Use for: Complex connectivity patterns
- Example: `PANConv(in_channels, out_channels, filter_size=3)`

**ClusterGCNConv** - Cluster-GCN convolution
- Efficient training via graph clustering
- Supports: edge_attr, Lazy
- Use for: Very large graphs
- Example: `ClusterGCNConv(in_channels, out_channels)`

**MFConv** - Multi-scale Feature Convolution
- Aggregates features at multiple scales
- Supports: SparseTensor, Lazy
- Use for: Multi-scale patterns
- Example: `MFConv(in_channels, out_channels)`

**RGCNConv** - Relational Graph Convolution
- Handles multiple edge types
- Supports: SparseTensor, edge_weight, Lazy
- Use for: Knowledge graphs, heterogeneous graphs
- Example: `RGCNConv(in_channels, out_channels, num_relations=10)`

**FAConv** - Frequency Adaptive Convolution
- Adaptive filtering in spectral domain
- Supports: SparseTensor, Lazy
- Use for: Spectral graph learning
- Example: `FAConv(in_channels, eps=0.1, dropout=0.5)`

### Molecular and 3D Convolutions

**SchNet** - Continuous-filter convolutional layer
- Designed for molecular dynamics
- Use for: Molecular property prediction, 3D molecules
- Example: `SchNet(hidden_channels=128, num_filters=64, num_interactions=6)`

**DimeNet** - Directional Message Passing
- Uses directional information and angles
- Use for: 3D molecular structures, chemical properties
- Example: `DimeNet(hidden_channels=128, out_channels=1, num_blocks=6)`

**PointTransformerConv** - Point cloud transformer
- Transformer for 3D point clouds
- Use for: 3D vision, point cloud segmentation
- Example: `PointTransformerConv(in_channels, out_channels)`

### Hypergraph Convolutions

**HypergraphConv** - Hypergraph convolution
- Operates on hyperedges (edges connecting multiple nodes)
- Supports: Lazy
- Use for: Multi-way relationships, chemical reactions
- Example: `HypergraphConv(in_channels, out_channels)`

**HGTConv** - Heterogeneous Graph Transformer
- Transformer for heterogeneous graphs with multiple types
- Supports: Lazy
- Use for: Heterogeneous networks, knowledge graphs
- Example: `HGTConv(in_channels, out_channels, metadata, heads=8)`

## Aggregation Operators

**Aggr** - Base aggregation class
- Flexible aggregation across nodes

**SumAggregation** - Sum aggregation
- Example: `SumAggregation()`

**MeanAggregation** - Mean aggregation
- Example: `MeanAggregation()`

**MaxAggregation** - Max aggregation
- Example: `MaxAggregation()`

**SoftmaxAggregation** - Softmax-weighted aggregation
- Learnable attention weights
- Example: `SoftmaxAggregation(learn=True)`

**PowerMeanAggregation** - Power mean aggregation
- Learnable power parameter
- Example: `PowerMeanAggregation(learn=True)`

**LSTMAggregation** - LSTM-based aggregation
- Sequential processing of neighbors
- Example: `LSTMAggregation(in_channels, out_channels)`

**SetTransformerAggregation** - Set Transformer aggregation
- Transformer for permutation-invariant aggregation
- Example: `SetTransformerAggregation(in_channels, out_channels)`

**MultiAggregation** - Multiple aggregations
- Combines multiple aggregation methods
- Example: `MultiAggregation(['mean', 'max', 'std'])`

## Pooling Layers

### Global Pooling

**global_mean_pool** - Global mean pooling
- Averages node features per graph
- Example: `global_mean_pool(x, batch)`

**global_max_pool** - Global max pooling
- Max over node features per graph
- Example: `global_max_pool(x, batch)`

**global_add_pool** - Global sum pooling
- Sums node features per graph
- Example: `global_add_pool(x, batch)`

**global_sort_pool** - Global sort pooling
- Sorts and concatenates top-k nodes
- Example: `global_sort_pool(x, batch, k=30)`

**GlobalAttention** - Global attention pooling
- Learnable attention weights for aggregation
- Example: `GlobalAttention(gate_nn)`

**Set2Set** - Set2Set pooling
- LSTM-based attention mechanism
- Example: `Set2Set(in_channels, processing_steps=3)`

### Hierarchical Pooling

**TopKPooling** - Top-k pooling
- Keeps top-k nodes based on projection scores
- Example: `TopKPooling(in_channels, ratio=0.5)`

**SAGPooling** - Self-Attention Graph Pooling
- Uses self-attention for node selection
- Example: `SAGPooling(in_channels, ratio=0.5)`

**ASAPooling** - Adaptive Structure Aware Pooling
- Structure-aware node selection
- Example: `ASAPooling(in_channels, ratio=0.5)`

**PANPooling** - Path Attention Pooling
- Attention over paths for pooling
- Example: `PANPooling(in_channels, ratio=0.5)`

**EdgePooling** - Edge contraction pooling
- Pools by contracting edges
- Example: `EdgePooling(in_channels)`

**MemPooling** - Memory-based pooling
- Learnable cluster assignments
- Example: `MemPooling(in_channels, out_channels, heads=4, num_clusters=10)`

**avg_pool** / **max_pool** - Average/Max pool with clustering
- Pools nodes within clusters
- Example: `avg_pool(cluster, data)`

## Normalization Layers

**BatchNorm** - Batch normalization
- Normalizes features across batch
- Example: `BatchNorm(in_channels)`

**LayerNorm** - Layer normalization
- Normalizes features per sample
- Example: `LayerNorm(in_channels)`

**InstanceNorm** - Instance normalization
- Normalizes per sample and graph
- Example: `InstanceNorm(in_channels)`

**GraphNorm** - Graph normalization
- Graph-specific normalization
- Example: `GraphNorm(in_channels)`

**PairNorm** - Pair normalization
- Prevents oversmoothing in deep GNNs
- Example: `PairNorm(scale_individually=False)`

**MessageNorm** - Message normalization
- Normalizes messages during passing
- Example: `MessageNorm(learn_scale=True)`

**DiffGroupNorm** - Differentiable Group Normalization
- Learnable grouping for normalization
- Example: `DiffGroupNorm(in_channels, groups=10)`

## Model Architectures

### Pre-Built Models

**GCN** - Complete Graph Convolutional Network
- Multi-layer GCN with dropout
- Example: `GCN(in_channels, hidden_channels, num_layers, out_channels)`

**GraphSAGE** - Complete GraphSAGE model
- Multi-layer SAGE with dropout
- Example: `GraphSAGE(in_channels, hidden_channels, num_layers, out_channels)`

**GIN** - Complete Graph Isomorphism Network
- Multi-layer GIN for graph classification
- Example: `GIN(in_channels, hidden_channels, num_layers, out_channels)`

**GAT** - Complete Graph Attention Network
- Multi-layer GAT with attention
- Example: `GAT(in_channels, hidden_channels, num_layers, out_channels, heads=8)`

**PNA** - Principal Neighbourhood Aggregation
- Combines multiple aggregators and scalers
- Example: `PNA(in_channels, hidden_channels, num_layers, out_channels)`

**EdgeCNN** - Edge Convolution CNN
- Dynamic graph CNN for point clouds
- Example: `EdgeCNN(out_channels, num_layers=3, k=20)`

### Auto-Encoders

**GAE** - Graph Auto-Encoder
- Encodes graphs into latent space
- Example: `GAE(encoder)`

**VGAE** - Variational Graph Auto-Encoder
- Probabilistic graph encoding
- Example: `VGAE(encoder)`

**ARGA** - Adversarially Regularized Graph Auto-Encoder
- GAE with adversarial regularization
- Example: `ARGA(encoder, discriminator)`

**ARGVA** - Adversarially Regularized Variational Graph Auto-Encoder
- VGAE with adversarial regularization
- Example: `ARGVA(encoder, discriminator)`

### Knowledge Graph Embeddings

**TransE** - Translating embeddings
- Learns entity and relation embeddings
- Example: `TransE(num_nodes, num_relations, hidden_channels)`

**RotatE** - Rotational embeddings
- Embeddings in complex space
- Example: `RotatE(num_nodes, num_relations, hidden_channels)`

**ComplEx** - Complex embeddings
- Complex-valued embeddings
- Example: `ComplEx(num_nodes, num_relations, hidden_channels)`

**DistMult** - Bilinear diagonal model
- Simplified bilinear model
- Example: `DistMult(num_nodes, num_relations, hidden_channels)`

## Utility Layers

**Sequential** - Sequential container
- Chains multiple layers
- Example: `Sequential('x, edge_index', [(GCNConv(16, 64), 'x, edge_index -> x'), nn.ReLU()])`

**JumpingKnowledge** - Jumping knowledge connections
- Combines representations from all layers
- Modes: 'cat', 'max', 'lstm'
- Example: `JumpingKnowledge(mode='cat')`

**DeepGCNLayer** - Deep GCN layer wrapper
- Enables very deep GNNs with skip connections
- Example: `DeepGCNLayer(conv, norm, act, block='res+', dropout=0.1)`

**MLP** - Multi-layer perceptron
- Standard feedforward network
- Example: `MLP([in_channels, 64, 64, out_channels], dropout=0.5)`

**Linear** - Lazy linear layer
- Linear transformation with lazy initialization
- Example: `Linear(in_channels, out_channels, bias=True)`

## Dense Layers

For dense (non-sparse) graph representations:

**DenseGCNConv** - Dense GCN layer
**DenseSAGEConv** - Dense SAGE layer
**DenseGINConv** - Dense GIN layer
**DenseGraphConv** - Dense graph convolution

These are useful when working with small, fully-connected, or densely represented graphs.

## Usage Tips

1. **Start simple**: Begin with GCNConv or GATConv for most tasks
2. **Consider data type**: Use molecular layers (SchNet, DimeNet) for 3D structures
3. **Check capabilities**: Match layer capabilities to your data (edge features, bipartite, etc.)
4. **Deep networks**: Use normalization (PairNorm, LayerNorm) and JumpingKnowledge for deep GNNs
5. **Large graphs**: Use scalable layers (SAGE, Cluster-GCN) with neighbor sampling
6. **Heterogeneous**: Use RGCNConv, HGTConv, or to_hetero() conversion
7. **Lazy initialization**: Use lazy layers when input dimensions vary or are unknown

## Common Patterns

### Basic GNN
```python
from torch_geometric.nn import GCNConv, global_mean_pool

class GNN(torch.nn.Module):
    def __init__(self, in_channels, hidden_channels, out_channels):
        super().__init__()
        self.conv1 = GCNConv(in_channels, hidden_channels)
        self.conv2 = GCNConv(hidden_channels, out_channels)

    def forward(self, x, edge_index, batch):
        x = self.conv1(x, edge_index).relu()
        x = self.conv2(x, edge_index)
        return global_mean_pool(x, batch)
```

### Deep GNN with Normalization
```python
class DeepGNN(torch.nn.Module):
    def __init__(self, in_channels, hidden_channels, num_layers, out_channels):
        super().__init__()
        self.convs = torch.nn.ModuleList()
        self.norms = torch.nn.ModuleList()

        self.convs.append(GCNConv(in_channels, hidden_channels))
        self.norms.append(LayerNorm(hidden_channels))

        for _ in range(num_layers - 2):
            self.convs.append(GCNConv(hidden_channels, hidden_channels))
            self.norms.append(LayerNorm(hidden_channels))

        self.convs.append(GCNConv(hidden_channels, out_channels))
        self.jk = JumpingKnowledge(mode='cat')

    def forward(self, x, edge_index, batch):
        xs = []
        for conv, norm in zip(self.convs[:-1], self.norms):
            x = conv(x, edge_index)
            x = norm(x)
            x = F.relu(x)
            xs.append(x)

        x = self.convs[-1](x, edge_index)
        xs.append(x)

        x = self.jk(xs)
        return global_mean_pool(x, batch)
```
