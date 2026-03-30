# Graph Construction & Spatial Analysis

## Overview

PathML provides tools for constructing spatial graphs from tissue images to represent cellular and tissue-level relationships. Graph-based representations enable sophisticated spatial analysis, including neighborhood analysis, cell-cell interaction studies, and graph neural network applications. These graphs capture both morphological features and spatial topology for downstream computational analysis.

## Graph Types

PathML supports construction of multiple graph types:

### Cell Graphs
- Nodes represent individual cells
- Edges represent spatial proximity or biological interactions
- Node features include morphology, marker expression, cell type
- Suitable for single-cell spatial analysis

### Tissue Graphs
- Nodes represent tissue regions or superpixels
- Edges represent spatial adjacency
- Node features include tissue composition, texture features
- Suitable for tissue-level spatial patterns

### Spatial Transcriptomics Graphs
- Nodes represent spatial spots or cells
- Edges encode spatial relationships
- Node features include gene expression profiles
- Suitable for spatial omics analysis

## Graph Construction Workflow

### From Segmentation to Graphs

Convert nucleus or cell segmentation results into spatial graphs:

```python
from pathml.graph import CellGraph
from pathml.preprocessing import Pipeline, SegmentMIF
import numpy as np

# 1. Perform cell segmentation
pipeline = Pipeline([
    SegmentMIF(
        nuclear_channel='DAPI',
        cytoplasm_channel='CD45',
        model='mesmer'
    )
])
pipeline.run(slide)

# 2. Extract instance segmentation mask
inst_map = slide.masks['cell_segmentation']

# 3. Build cell graph
cell_graph = CellGraph.from_instance_map(
    inst_map,
    image=slide.image,  # Optional: for extracting visual features
    connectivity='delaunay',  # 'knn', 'radius', or 'delaunay'
    k=5,  # For knn: number of neighbors
    radius=50  # For radius: distance threshold in pixels
)

# 4. Access graph components
nodes = cell_graph.nodes  # Node features
edges = cell_graph.edges  # Edge list
adjacency = cell_graph.adjacency_matrix  # Adjacency matrix
```

### Connectivity Methods

**K-Nearest Neighbors (KNN):**
```python
# Connect each cell to its k nearest neighbors
graph = CellGraph.from_instance_map(
    inst_map,
    connectivity='knn',
    k=5  # Number of neighbors
)
```
- Fixed degree per node
- Captures local neighborhoods
- Simple and interpretable

**Radius-based:**
```python
# Connect cells within a distance threshold
graph = CellGraph.from_instance_map(
    inst_map,
    connectivity='radius',
    radius=100,  # Maximum distance in pixels
    distance_metric='euclidean'  # or 'manhattan', 'chebyshev'
)
```
- Variable degree based on density
- Biologically motivated (interaction range)
- Captures physical proximity

**Delaunay Triangulation:**
```python
# Connect cells using Delaunay triangulation
graph = CellGraph.from_instance_map(
    inst_map,
    connectivity='delaunay'
)
```
- Creates connected graph from spatial positions
- No isolated nodes (in convex hull)
- Captures spatial tessellation

**Contact-based:**
```python
# Connect cells with touching boundaries
graph = CellGraph.from_instance_map(
    inst_map,
    connectivity='contact',
    dilation=2  # Dilate boundaries to capture near-contacts
)
```
- Physical cell-cell contacts
- Most biologically direct
- Sparse edges for separated cells

## Node Features

### Morphological Features

Extract shape and size features for each cell:

```python
from pathml.graph import extract_morphology_features

# Compute morphological features
morphology_features = extract_morphology_features(
    inst_map,
    features=[
        'area',  # Cell area in pixels
        'perimeter',  # Cell perimeter
        'eccentricity',  # Shape elongation
        'solidity',  # Convexity measure
        'major_axis_length',
        'minor_axis_length',
        'orientation'  # Cell orientation angle
    ]
)

# Add to graph
cell_graph.add_node_features(morphology_features, feature_names=['area', 'perimeter', ...])
```

**Available morphological features:**
- **Area** - Number of pixels
- **Perimeter** - Boundary length
- **Eccentricity** - 0 (circle) to 1 (line)
- **Solidity** - Area / convex hull area
- **Circularity** - 4π × area / perimeter²
- **Major/Minor axis** - Lengths of fitted ellipse axes
- **Orientation** - Angle of major axis
- **Extent** - Area / bounding box area

### Intensity Features

Extract marker expression or intensity statistics:

```python
from pathml.graph import extract_intensity_features

# Extract mean marker intensities per cell
intensity_features = extract_intensity_features(
    inst_map,
    image=multichannel_image,  # Shape: (H, W, C)
    channel_names=['DAPI', 'CD3', 'CD4', 'CD8', 'CD20'],
    statistics=['mean', 'std', 'median', 'max']
)

# Add to graph
cell_graph.add_node_features(
    intensity_features,
    feature_names=['DAPI_mean', 'CD3_mean', ...]
)
```

**Available statistics:**
- **mean** - Average intensity
- **median** - Median intensity
- **std** - Standard deviation
- **max** - Maximum intensity
- **min** - Minimum intensity
- **quantile_25/75** - Quartiles

### Texture Features

Compute texture descriptors for each cell region:

```python
from pathml.graph import extract_texture_features

# Haralick texture features
texture_features = extract_texture_features(
    inst_map,
    image=grayscale_image,
    features='haralick',  # or 'lbp', 'gabor'
    distance=1,
    angles=[0, np.pi/4, np.pi/2, 3*np.pi/4]
)

cell_graph.add_node_features(texture_features)
```

### Cell Type Annotations

Add cell type labels from classification:

```python
# From ML model predictions
cell_types = hovernet_type_predictions  # Array of cell type IDs

cell_graph.add_node_features(
    cell_types,
    feature_names=['cell_type']
)

# One-hot encode cell types
cell_type_onehot = one_hot_encode(cell_types, num_classes=5)
cell_graph.add_node_features(
    cell_type_onehot,
    feature_names=['type_epithelial', 'type_inflammatory', ...]
)
```

## Edge Features

### Spatial Distance

Compute edge features based on spatial relationships:

```python
from pathml.graph import compute_edge_distances

# Add pairwise distances as edge features
distances = compute_edge_distances(
    cell_graph,
    metric='euclidean'  # or 'manhattan', 'chebyshev'
)

cell_graph.add_edge_features(distances, feature_names=['distance'])
```

### Interaction Features

Model biological interactions between cell types:

```python
from pathml.graph import compute_interaction_features

# Cell type co-occurrence along edges
interaction_features = compute_interaction_features(
    cell_graph,
    cell_types=cell_type_labels,
    interaction_type='categorical'  # or 'numerical'
)

cell_graph.add_edge_features(interaction_features)
```

## Graph-Level Features

Aggregate features for entire graph:

```python
from pathml.graph import compute_graph_features

# Topological features
graph_features = compute_graph_features(
    cell_graph,
    features=[
        'num_nodes',
        'num_edges',
        'average_degree',
        'clustering_coefficient',
        'average_path_length',
        'diameter'
    ]
)

# Cell composition features
composition = cell_graph.compute_cell_type_composition(
    cell_type_labels,
    normalize=True  # Proportions
)
```

## Spatial Analysis

### Neighborhood Analysis

Analyze cell neighborhoods and microenvironments:

```python
from pathml.graph import analyze_neighborhoods

# Characterize neighborhoods around each cell
neighborhoods = analyze_neighborhoods(
    cell_graph,
    cell_types=cell_type_labels,
    radius=100,  # Neighborhood radius
    metrics=['diversity', 'density', 'composition']
)

# Neighborhood diversity (Shannon entropy)
diversity = neighborhoods['diversity']

# Cell type composition in each neighborhood
composition = neighborhoods['composition']  # (n_cells, n_cell_types)
```

### Spatial Clustering

Identify spatial clusters of cell types:

```python
from pathml.graph import spatial_clustering
import matplotlib.pyplot as plt

# Detect spatial clusters
clusters = spatial_clustering(
    cell_graph,
    cell_positions,
    method='dbscan',  # or 'kmeans', 'hierarchical'
    eps=50,  # DBSCAN: neighborhood radius
    min_samples=10  # DBSCAN: minimum cluster size
)

# Visualize clusters
plt.scatter(
    cell_positions[:, 0],
    cell_positions[:, 1],
    c=clusters,
    cmap='tab20'
)
plt.title('Spatial Clusters')
plt.show()
```

### Cell-Cell Interaction Analysis

Test for enrichment or depletion of cell type interactions:

```python
from pathml.graph import cell_interaction_analysis

# Test for significant interactions
interaction_results = cell_interaction_analysis(
    cell_graph,
    cell_types=cell_type_labels,
    method='permutation',  # or 'expected'
    n_permutations=1000,
    significance_level=0.05
)

# Interaction scores (positive = attraction, negative = avoidance)
interaction_matrix = interaction_results['scores']

# Visualize with heatmap
import seaborn as sns
sns.heatmap(
    interaction_matrix,
    cmap='RdBu_r',
    center=0,
    xticklabels=cell_type_names,
    yticklabels=cell_type_names
)
plt.title('Cell-Cell Interaction Scores')
plt.show()
```

### Spatial Statistics

Compute spatial statistics and patterns:

```python
from pathml.graph import spatial_statistics

# Ripley's K function for spatial point patterns
ripleys_k = spatial_statistics(
    cell_positions,
    cell_types=cell_type_labels,
    statistic='ripleys_k',
    radii=np.linspace(0, 200, 50)
)

# Nearest neighbor distances
nn_distances = spatial_statistics(
    cell_positions,
    statistic='nearest_neighbor',
    by_cell_type=True
)
```

## Integration with Graph Neural Networks

### Convert to PyTorch Geometric Format

```python
from pathml.graph import to_pyg
import torch
from torch_geometric.data import Data

# Convert to PyTorch Geometric Data object
pyg_data = cell_graph.to_pyg()

# Access components
x = pyg_data.x  # Node features (n_nodes, n_features)
edge_index = pyg_data.edge_index  # Edge connectivity (2, n_edges)
edge_attr = pyg_data.edge_attr  # Edge features (n_edges, n_edge_features)
y = pyg_data.y  # Graph-level label
pos = pyg_data.pos  # Node positions (n_nodes, 2)

# Use with PyTorch Geometric
from torch_geometric.nn import GCNConv

class GNN(torch.nn.Module):
    def __init__(self, in_channels, hidden_channels, out_channels):
        super().__init__()
        self.conv1 = GCNConv(in_channels, hidden_channels)
        self.conv2 = GCNConv(hidden_channels, out_channels)

    def forward(self, data):
        x, edge_index = data.x, data.edge_index
        x = self.conv1(x, edge_index).relu()
        x = self.conv2(x, edge_index)
        return x

model = GNN(in_channels=pyg_data.num_features, hidden_channels=64, out_channels=5)
output = model(pyg_data)
```

### Graph Dataset for Multiple Slides

```python
from pathml.graph import GraphDataset
from torch_geometric.loader import DataLoader

# Create dataset of graphs from multiple slides
graphs = []
for slide in slides:
    # Build graph for each slide
    cell_graph = CellGraph.from_instance_map(slide.inst_map, ...)
    pyg_graph = cell_graph.to_pyg()
    graphs.append(pyg_graph)

# Create DataLoader
loader = DataLoader(graphs, batch_size=32, shuffle=True)

# Train GNN
for batch in loader:
    output = model(batch)
    loss = criterion(output, batch.y)
    loss.backward()
    optimizer.step()
```

## Visualization

### Graph Visualization

```python
import matplotlib.pyplot as plt
import networkx as nx

# Convert to NetworkX
nx_graph = cell_graph.to_networkx()

# Draw graph with cell positions as layout
pos = {i: cell_graph.positions[i] for i in range(len(cell_graph.nodes))}

plt.figure(figsize=(12, 12))
nx.draw_networkx(
    nx_graph,
    pos=pos,
    node_color=cell_type_labels,
    node_size=50,
    cmap='tab10',
    with_labels=False,
    alpha=0.8
)
plt.axis('equal')
plt.title('Cell Graph')
plt.show()
```

### Overlay on Tissue Image

```python
from pathml.graph import visualize_graph_on_image

# Visualize graph overlaid on tissue
fig, ax = plt.subplots(figsize=(15, 15))
ax.imshow(tissue_image)

# Draw edges
for edge in cell_graph.edges:
    node1, node2 = edge
    pos1 = cell_graph.positions[node1]
    pos2 = cell_graph.positions[node2]
    ax.plot([pos1[0], pos2[0]], [pos1[1], pos2[1]], 'b-', alpha=0.3, linewidth=0.5)

# Draw nodes colored by type
for cell_type in np.unique(cell_type_labels):
    mask = cell_type_labels == cell_type
    positions = cell_graph.positions[mask]
    ax.scatter(positions[:, 0], positions[:, 1], label=f'Type {cell_type}', s=20)

ax.legend()
ax.axis('off')
plt.title('Cell Graph on Tissue')
plt.show()
```

## Complete Workflow Example

```python
from pathml.core import SlideData, CODEXSlide
from pathml.preprocessing import Pipeline, CollapseRunsCODEX, SegmentMIF
from pathml.graph import CellGraph, extract_morphology_features, extract_intensity_features
import matplotlib.pyplot as plt

# 1. Load and preprocess slide
slide = CODEXSlide('path/to/codex', stain='IF')

pipeline = Pipeline([
    CollapseRunsCODEX(z_slice=2),
    SegmentMIF(
        nuclear_channel='DAPI',
        cytoplasm_channel='CD45',
        model='mesmer'
    )
])
pipeline.run(slide)

# 2. Build cell graph
inst_map = slide.masks['cell_segmentation']
cell_graph = CellGraph.from_instance_map(
    inst_map,
    image=slide.image,
    connectivity='knn',
    k=6
)

# 3. Extract features
# Morphological features
morph_features = extract_morphology_features(
    inst_map,
    features=['area', 'perimeter', 'eccentricity', 'solidity']
)
cell_graph.add_node_features(morph_features)

# Intensity features (marker expression)
intensity_features = extract_intensity_features(
    inst_map,
    image=slide.image,
    channel_names=['DAPI', 'CD3', 'CD4', 'CD8', 'CD20'],
    statistics=['mean', 'std']
)
cell_graph.add_node_features(intensity_features)

# 4. Spatial analysis
from pathml.graph import analyze_neighborhoods

neighborhoods = analyze_neighborhoods(
    cell_graph,
    cell_types=cell_type_predictions,
    radius=100,
    metrics=['diversity', 'composition']
)

# 5. Export for GNN
pyg_data = cell_graph.to_pyg()

# 6. Visualize
plt.figure(figsize=(15, 15))
plt.imshow(slide.image)

# Overlay graph
nx_graph = cell_graph.to_networkx()
pos = {i: cell_graph.positions[i] for i in range(cell_graph.num_nodes)}
nx.draw_networkx(
    nx_graph,
    pos=pos,
    node_color=cell_type_predictions,
    cmap='tab10',
    node_size=30,
    with_labels=False
)
plt.axis('off')
plt.title('Cell Graph with Spatial Neighborhood')
plt.show()
```

## Performance Considerations

**Large tissue sections:**
- Build graphs tile-by-tile, then merge
- Use sparse adjacency matrices
- Leverage GPU for feature extraction

**Memory efficiency:**
- Store only necessary edge features
- Use int32/float32 instead of int64/float64
- Batch process multiple slides

**Computational efficiency:**
- Parallelize feature extraction across cells
- Use KNN for faster neighbor queries
- Cache computed features

## Best Practices

1. **Choose appropriate connectivity:** KNN for uniform analysis, radius for physical interactions, contact for direct cell-cell communication

2. **Normalize features:** Scale morphological and intensity features for GNN compatibility

3. **Handle edge effects:** Exclude boundary cells or use tissue masks to define valid regions

4. **Validate graph construction:** Visualize graphs on small regions before large-scale processing

5. **Combine multiple feature types:** Morphology + intensity + texture provides rich representations

6. **Consider tissue context:** Tissue type affects appropriate graph parameters (connectivity, radius)

## Common Issues and Solutions

**Issue: Too many/few edges**
- Adjust k (KNN) or radius (radius-based) parameters
- Verify pixel-to-micron conversion for biological relevance

**Issue: Memory errors with large graphs**
- Process tiles separately and merge graphs
- Use sparse matrix representations
- Reduce edge features to essential ones

**Issue: Missing cells at tissue boundaries**
- Apply edge_correction parameter
- Use tissue masks to exclude invalid regions

**Issue: Inconsistent feature scales**
- Normalize features: `(x - mean) / std`
- Use robust scaling for outliers

## Additional Resources

- **PathML Graph API:** https://pathml.readthedocs.io/en/latest/api_graph_reference.html
- **PyTorch Geometric:** https://pytorch-geometric.readthedocs.io/
- **NetworkX:** https://networkx.org/
- **Spatial Statistics:** Baddeley et al., "Spatial Point Patterns: Methodology and Applications with R"
