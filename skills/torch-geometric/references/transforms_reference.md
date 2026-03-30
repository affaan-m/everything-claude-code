# PyTorch Geometric Transforms Reference

This document provides a comprehensive reference of all transforms available in `torch_geometric.transforms`.

## Overview

Transforms modify `Data` or `HeteroData` objects before or during training. Apply them via:

```python
# During dataset loading
dataset = MyDataset(root='/tmp', transform=MyTransform())

# Apply to individual data
transform = MyTransform()
data = transform(data)

# Compose multiple transforms
from torch_geometric.transforms import Compose
transform = Compose([Transform1(), Transform2(), Transform3()])
```

## General Transforms

### NormalizeFeatures
**Purpose**: Row-normalizes node features to sum to 1
**Use case**: Feature scaling, probability-like features
```python
from torch_geometric.transforms import NormalizeFeatures
transform = NormalizeFeatures()
```

### ToDevice
**Purpose**: Transfers data to specified device (CPU/GPU)
**Use case**: GPU training, device management
```python
from torch_geometric.transforms import ToDevice
transform = ToDevice('cuda')
```

### RandomNodeSplit
**Purpose**: Creates train/val/test node masks
**Use case**: Node classification splits
**Parameters**: `split='train_rest'`, `num_splits`, `num_val`, `num_test`
```python
from torch_geometric.transforms import RandomNodeSplit
transform = RandomNodeSplit(num_val=0.1, num_test=0.2)
```

### RandomLinkSplit
**Purpose**: Creates train/val/test edge splits
**Use case**: Link prediction
**Parameters**: `num_val`, `num_test`, `is_undirected`, `split_labels`
```python
from torch_geometric.transforms import RandomLinkSplit
transform = RandomLinkSplit(num_val=0.1, num_test=0.2)
```

### IndexToMask
**Purpose**: Converts indices to boolean masks
**Use case**: Data preprocessing
```python
from torch_geometric.transforms import IndexToMask
transform = IndexToMask()
```

### MaskToIndex
**Purpose**: Converts boolean masks to indices
**Use case**: Data preprocessing
```python
from torch_geometric.transforms import MaskToIndex
transform = MaskToIndex()
```

### FixedPoints
**Purpose**: Samples a fixed number of points
**Use case**: Point cloud subsampling
**Parameters**: `num`, `replace`, `allow_duplicates`
```python
from torch_geometric.transforms import FixedPoints
transform = FixedPoints(1024)
```

### ToDense
**Purpose**: Converts to dense adjacency matrices
**Use case**: Small graphs, dense operations
```python
from torch_geometric.transforms import ToDense
transform = ToDense(num_nodes=100)
```

### ToSparseTensor
**Purpose**: Converts edge_index to SparseTensor
**Use case**: Efficient sparse operations
**Parameters**: `remove_edge_index`, `fill_cache`
```python
from torch_geometric.transforms import ToSparseTensor
transform = ToSparseTensor()
```

## Graph Structure Transforms

### ToUndirected
**Purpose**: Converts directed graph to undirected
**Use case**: Undirected graph algorithms
**Parameters**: `reduce='add'` (how to handle duplicate edges)
```python
from torch_geometric.transforms import ToUndirected
transform = ToUndirected()
```

### AddSelfLoops
**Purpose**: Adds self-loops to all nodes
**Use case**: GCN-style convolutions
**Parameters**: `fill_value` (edge attribute for self-loops)
```python
from torch_geometric.transforms import AddSelfLoops
transform = AddSelfLoops()
```

### RemoveSelfLoops
**Purpose**: Removes all self-loops
**Use case**: Cleaning graph structure
```python
from torch_geometric.transforms import RemoveSelfLoops
transform = RemoveSelfLoops()
```

### RemoveIsolatedNodes
**Purpose**: Removes nodes without edges
**Use case**: Graph cleaning
```python
from torch_geometric.transforms import RemoveIsolatedNodes
transform = RemoveIsolatedNodes()
```

### RemoveDuplicatedEdges
**Purpose**: Removes duplicate edges
**Use case**: Graph cleaning
```python
from torch_geometric.transforms import RemoveDuplicatedEdges
transform = RemoveDuplicatedEdges()
```

### LargestConnectedComponents
**Purpose**: Keeps only the largest connected component
**Use case**: Focus on main graph structure
**Parameters**: `num_components` (how many components to keep)
```python
from torch_geometric.transforms import LargestConnectedComponents
transform = LargestConnectedComponents(num_components=1)
```

### KNNGraph
**Purpose**: Creates edges based on k-nearest neighbors
**Use case**: Point clouds, spatial data
**Parameters**: `k`, `loop`, `force_undirected`, `flow`
```python
from torch_geometric.transforms import KNNGraph
transform = KNNGraph(k=6)
```

### RadiusGraph
**Purpose**: Creates edges within a radius
**Use case**: Point clouds, spatial data
**Parameters**: `r`, `loop`, `max_num_neighbors`, `flow`
```python
from torch_geometric.transforms import RadiusGraph
transform = RadiusGraph(r=0.1)
```

### Delaunay
**Purpose**: Computes Delaunay triangulation
**Use case**: 2D/3D spatial graphs
```python
from torch_geometric.transforms import Delaunay
transform = Delaunay()
```

### FaceToEdge
**Purpose**: Converts mesh faces to edges
**Use case**: Mesh processing
```python
from torch_geometric.transforms import FaceToEdge
transform = FaceToEdge()
```

### LineGraph
**Purpose**: Converts graph to its line graph
**Use case**: Edge-centric analysis
**Parameters**: `force_directed`
```python
from torch_geometric.transforms import LineGraph
transform = LineGraph()
```

### GDC
**Purpose**: Graph Diffusion Convolution preprocessing
**Use case**: Improved message passing
**Parameters**: `self_loop_weight`, `normalization_in`, `normalization_out`, `diffusion_kwargs`
```python
from torch_geometric.transforms import GDC
transform = GDC(self_loop_weight=1, normalization_in='sym',
                diffusion_kwargs=dict(method='ppr', alpha=0.15))
```

### SIGN
**Purpose**: Scalable Inception Graph Neural Networks preprocessing
**Use case**: Efficient multi-scale features
**Parameters**: `K` (number of hops)
```python
from torch_geometric.transforms import SIGN
transform = SIGN(K=3)
```

## Feature Transforms

### OneHotDegree
**Purpose**: One-hot encodes node degree
**Use case**: Degree as feature
**Parameters**: `max_degree`, `cat` (concatenate with existing features)
```python
from torch_geometric.transforms import OneHotDegree
transform = OneHotDegree(max_degree=100)
```

### LocalDegreeProfile
**Purpose**: Appends local degree profile
**Use case**: Structural node features
```python
from torch_geometric.transforms import LocalDegreeProfile
transform = LocalDegreeProfile()
```

### Constant
**Purpose**: Adds constant features to nodes
**Use case**: Featureless graphs
**Parameters**: `value`, `cat`
```python
from torch_geometric.transforms import Constant
transform = Constant(value=1.0)
```

### TargetIndegree
**Purpose**: Saves in-degree as target
**Use case**: Degree prediction
**Parameters**: `norm`, `max_value`
```python
from torch_geometric.transforms import TargetIndegree
transform = TargetIndegree(norm=False)
```

### AddRandomWalkPE
**Purpose**: Adds random walk positional encoding
**Use case**: Positional information
**Parameters**: `walk_length`, `attr_name`
```python
from torch_geometric.transforms import AddRandomWalkPE
transform = AddRandomWalkPE(walk_length=20)
```

### AddLaplacianEigenvectorPE
**Purpose**: Adds Laplacian eigenvector positional encoding
**Use case**: Spectral positional information
**Parameters**: `k` (number of eigenvectors), `attr_name`
```python
from torch_geometric.transforms import AddLaplacianEigenvectorPE
transform = AddLaplacianEigenvectorPE(k=10)
```

### AddMetaPaths
**Purpose**: Adds meta-path induced edges
**Use case**: Heterogeneous graphs
**Parameters**: `metapaths`, `drop_orig_edges`, `drop_unconnected_nodes`
```python
from torch_geometric.transforms import AddMetaPaths
metapaths = [[('author', 'paper'), ('paper', 'author')]]  # Co-authorship
transform = AddMetaPaths(metapaths)
```

### SVDFeatureReduction
**Purpose**: Reduces feature dimensionality via SVD
**Use case**: Dimensionality reduction
**Parameters**: `out_channels`
```python
from torch_geometric.transforms import SVDFeatureReduction
transform = SVDFeatureReduction(out_channels=64)
```

## Vision/Spatial Transforms

### Center
**Purpose**: Centers node positions
**Use case**: Point cloud preprocessing
```python
from torch_geometric.transforms import Center
transform = Center()
```

### NormalizeScale
**Purpose**: Normalizes positions to unit sphere
**Use case**: Point cloud normalization
```python
from torch_geometric.transforms import NormalizeScale
transform = NormalizeScale()
```

### NormalizeRotation
**Purpose**: Rotates to principal components
**Use case**: Rotation-invariant learning
**Parameters**: `max_points`
```python
from torch_geometric.transforms import NormalizeRotation
transform = NormalizeRotation()
```

### Distance
**Purpose**: Saves Euclidean distance as edge attribute
**Use case**: Spatial graphs
**Parameters**: `norm`, `max_value`, `cat`
```python
from torch_geometric.transforms import Distance
transform = Distance(norm=False, cat=False)
```

### Cartesian
**Purpose**: Saves relative Cartesian coordinates as edge attributes
**Use case**: Spatial relationships
**Parameters**: `norm`, `max_value`, `cat`
```python
from torch_geometric.transforms import Cartesian
transform = Cartesian(norm=False)
```

### Polar
**Purpose**: Saves polar coordinates as edge attributes
**Use case**: 2D spatial graphs
**Parameters**: `norm`, `max_value`, `cat`
```python
from torch_geometric.transforms import Polar
transform = Polar(norm=False)
```

### Spherical
**Purpose**: Saves spherical coordinates as edge attributes
**Use case**: 3D spatial graphs
**Parameters**: `norm`, `max_value`, `cat`
```python
from torch_geometric.transforms import Spherical
transform = Spherical(norm=False)
```

### LocalCartesian
**Purpose**: Saves coordinates in local coordinate system
**Use case**: Local spatial features
**Parameters**: `norm`, `cat`
```python
from torch_geometric.transforms import LocalCartesian
transform = LocalCartesian()
```

### PointPairFeatures
**Purpose**: Computes point pair features
**Use case**: 3D registration, correspondence
**Parameters**: `cat`
```python
from torch_geometric.transforms import PointPairFeatures
transform = PointPairFeatures()
```

## Data Augmentation

### RandomJitter
**Purpose**: Randomly jitters node positions
**Use case**: Point cloud augmentation
**Parameters**: `translate`, `scale`
```python
from torch_geometric.transforms import RandomJitter
transform = RandomJitter(0.01)
```

### RandomFlip
**Purpose**: Randomly flips positions along axis
**Use case**: Geometric augmentation
**Parameters**: `axis`, `p` (probability)
```python
from torch_geometric.transforms import RandomFlip
transform = RandomFlip(axis=0, p=0.5)
```

### RandomScale
**Purpose**: Randomly scales positions
**Use case**: Scale augmentation
**Parameters**: `scales` (min, max)
```python
from torch_geometric.transforms import RandomScale
transform = RandomScale((0.9, 1.1))
```

### RandomRotate
**Purpose**: Randomly rotates positions
**Use case**: Rotation augmentation
**Parameters**: `degrees` (range), `axis` (rotation axis)
```python
from torch_geometric.transforms import RandomRotate
transform = RandomRotate(degrees=15, axis=2)
```

### RandomShear
**Purpose**: Randomly shears positions
**Use case**: Geometric augmentation
**Parameters**: `shear` (range)
```python
from torch_geometric.transforms import RandomShear
transform = RandomShear(0.1)
```

### RandomTranslate
**Purpose**: Randomly translates positions
**Use case**: Translation augmentation
**Parameters**: `translate` (range)
```python
from torch_geometric.transforms import RandomTranslate
transform = RandomTranslate(0.1)
```

### LinearTransformation
**Purpose**: Applies linear transformation matrix
**Use case**: Custom geometric transforms
**Parameters**: `matrix`
```python
from torch_geometric.transforms import LinearTransformation
import torch
matrix = torch.eye(3)
transform = LinearTransformation(matrix)
```

## Mesh Processing

### SamplePoints
**Purpose**: Samples points uniformly from mesh
**Use case**: Mesh to point cloud conversion
**Parameters**: `num`, `remove_faces`, `include_normals`
```python
from torch_geometric.transforms import SamplePoints
transform = SamplePoints(num=1024)
```

### GenerateMeshNormals
**Purpose**: Generates face/vertex normals
**Use case**: Mesh processing
```python
from torch_geometric.transforms import GenerateMeshNormals
transform = GenerateMeshNormals()
```

### FaceToEdge
**Purpose**: Converts mesh faces to edges
**Use case**: Mesh to graph conversion
**Parameters**: `remove_faces`
```python
from torch_geometric.transforms import FaceToEdge
transform = FaceToEdge()
```

## Sampling and Splitting

### GridSampling
**Purpose**: Clusters points in voxel grid
**Use case**: Point cloud downsampling
**Parameters**: `size` (voxel size), `start`, `end`
```python
from torch_geometric.transforms import GridSampling
transform = GridSampling(size=0.1)
```

### FixedPoints
**Purpose**: Samples fixed number of points
**Use case**: Uniform point cloud size
**Parameters**: `num`, `replace`, `allow_duplicates`
```python
from torch_geometric.transforms import FixedPoints
transform = FixedPoints(num=2048, replace=False)
```

### RandomScale
**Purpose**: Randomly scales by sampling from range
**Use case**: Scale augmentation (already listed above)

### VirtualNode
**Purpose**: Adds a virtual node connected to all nodes
**Use case**: Global information propagation
```python
from torch_geometric.transforms import VirtualNode
transform = VirtualNode()
```

## Specialized Transforms

### ToSLIC
**Purpose**: Converts images to superpixel graphs (SLIC algorithm)
**Use case**: Image as graph
**Parameters**: `num_segments`, `compactness`, `add_seg`, `add_img`
```python
from torch_geometric.transforms import ToSLIC
transform = ToSLIC(num_segments=75)
```

### GCNNorm
**Purpose**: Applies GCN-style normalization to edges
**Use case**: Preprocessing for GCN
**Parameters**: `add_self_loops`
```python
from torch_geometric.transforms import GCNNorm
transform = GCNNorm(add_self_loops=True)
```

### LaplacianLambdaMax
**Purpose**: Computes largest Laplacian eigenvalue
**Use case**: ChebConv preprocessing
**Parameters**: `normalization`, `is_undirected`
```python
from torch_geometric.transforms import LaplacianLambdaMax
transform = LaplacianLambdaMax(normalization='sym')
```

### NormalizeRotation
**Purpose**: Rotates mesh/point cloud to align with principal axes
**Use case**: Canonical orientation
**Parameters**: `max_points`
```python
from torch_geometric.transforms import NormalizeRotation
transform = NormalizeRotation()
```

## Compose and Apply

### Compose
**Purpose**: Chains multiple transforms
**Use case**: Complex preprocessing pipelines
```python
from torch_geometric.transforms import Compose
transform = Compose([
    Center(),
    NormalizeScale(),
    KNNGraph(k=6),
    Distance(norm=False),
])
```

### BaseTransform
**Purpose**: Base class for custom transforms
**Use case**: Implementing custom transforms
```python
from torch_geometric.transforms import BaseTransform

class MyTransform(BaseTransform):
    def __init__(self, param):
        self.param = param

    def __call__(self, data):
        # Modify data
        data.x = data.x * self.param
        return data
```

## Common Transform Combinations

### Node Classification Preprocessing
```python
transform = Compose([
    NormalizeFeatures(),
    RandomNodeSplit(num_val=0.1, num_test=0.2),
])
```

### Point Cloud Processing
```python
transform = Compose([
    Center(),
    NormalizeScale(),
    RandomRotate(degrees=15, axis=2),
    RandomJitter(0.01),
    KNNGraph(k=6),
    Distance(norm=False),
])
```

### Mesh to Graph
```python
transform = Compose([
    FaceToEdge(remove_faces=True),
    GenerateMeshNormals(),
    Distance(norm=True),
])
```

### Graph Structure Enhancement
```python
transform = Compose([
    ToUndirected(),
    AddSelfLoops(),
    RemoveIsolatedNodes(),
    GCNNorm(),
])
```

### Heterogeneous Graph Preprocessing
```python
transform = Compose([
    AddMetaPaths(metapaths=[
        [('author', 'paper'), ('paper', 'author')],
        [('author', 'paper'), ('paper', 'conference'), ('conference', 'paper'), ('paper', 'author')]
    ]),
    RandomNodeSplit(split='train_rest', num_val=0.1, num_test=0.2),
])
```

### Link Prediction
```python
transform = Compose([
    NormalizeFeatures(),
    RandomLinkSplit(num_val=0.1, num_test=0.2, is_undirected=True),
])
```

## Usage Tips

1. **Order matters**: Apply structural transforms before feature transforms
2. **Caching**: Some transforms (like GDC) are expensive—apply once
3. **Augmentation**: Use Random* transforms during training only
4. **Compose sparingly**: Too many transforms slow down data loading
5. **Custom transforms**: Inherit from `BaseTransform` for custom logic
6. **Pre-transforms**: Apply expensive transforms once during dataset processing:
   ```python
   dataset = MyDataset(root='/tmp', pre_transform=ExpensiveTransform())
   ```
7. **Dynamic transforms**: Apply cheap transforms during training:
   ```python
   dataset = MyDataset(root='/tmp', transform=CheapTransform())
   ```

## Performance Considerations

**Expensive transforms** (apply as pre_transform):
- GDC
- SIGN
- KNNGraph (for large point clouds)
- AddLaplacianEigenvectorPE
- SVDFeatureReduction

**Cheap transforms** (apply as transform):
- NormalizeFeatures
- ToUndirected
- AddSelfLoops
- Random* augmentations
- ToDevice

**Example**:
```python
from torch_geometric.datasets import Planetoid
from torch_geometric.transforms import Compose, GDC, NormalizeFeatures

# Expensive preprocessing done once
pre_transform = GDC(
    self_loop_weight=1,
    normalization_in='sym',
    diffusion_kwargs=dict(method='ppr', alpha=0.15)
)

# Cheap transform applied each time
transform = NormalizeFeatures()

dataset = Planetoid(
    root='/tmp/Cora',
    name='Cora',
    pre_transform=pre_transform,
    transform=transform
)
```
