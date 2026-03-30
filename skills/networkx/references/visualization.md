# NetworkX Graph Visualization

## Basic Drawing with Matplotlib

### Simple Visualization
```python
import networkx as nx
import matplotlib.pyplot as plt

# Create and draw graph
G = nx.karate_club_graph()
nx.draw(G)
plt.show()

# Save to file
nx.draw(G)
plt.savefig('graph.png', dpi=300, bbox_inches='tight')
plt.close()
```

### Drawing with Labels
```python
# Draw with node labels
nx.draw(G, with_labels=True)
plt.show()

# Custom labels
labels = {i: f"Node {i}" for i in G.nodes()}
nx.draw(G, labels=labels, with_labels=True)
plt.show()
```

## Layout Algorithms

### Spring Layout (Force-Directed)
```python
# Fruchterman-Reingold force-directed algorithm
pos = nx.spring_layout(G, seed=42)
nx.draw(G, pos=pos, with_labels=True)
plt.show()

# With parameters
pos = nx.spring_layout(G, k=0.5, iterations=50, seed=42)
```

### Circular Layout
```python
# Arrange nodes in circle
pos = nx.circular_layout(G)
nx.draw(G, pos=pos, with_labels=True)
plt.show()
```

### Random Layout
```python
# Random positioning
pos = nx.random_layout(G, seed=42)
nx.draw(G, pos=pos, with_labels=True)
plt.show()
```

### Shell Layout
```python
# Concentric circles
pos = nx.shell_layout(G)
nx.draw(G, pos=pos, with_labels=True)
plt.show()

# With custom shells
shells = [[0, 1, 2], [3, 4, 5, 6], [7, 8, 9]]
pos = nx.shell_layout(G, nlist=shells)
```

### Spectral Layout
```python
# Use eigenvectors of graph Laplacian
pos = nx.spectral_layout(G)
nx.draw(G, pos=pos, with_labels=True)
plt.show()
```

### Kamada-Kawai Layout
```python
# Energy-based layout
pos = nx.kamada_kawai_layout(G)
nx.draw(G, pos=pos, with_labels=True)
plt.show()
```

### Planar Layout
```python
# For planar graphs only
if nx.is_planar(G):
    pos = nx.planar_layout(G)
    nx.draw(G, pos=pos, with_labels=True)
    plt.show()
```

### Tree Layouts
```python
# For tree graphs
if nx.is_tree(G):
    pos = nx.nx_agraph.graphviz_layout(G, prog='dot')
    nx.draw(G, pos=pos, with_labels=True)
    plt.show()
```

## Customizing Node Appearance

### Node Colors
```python
# Single color
nx.draw(G, node_color='red')

# Different colors per node
node_colors = ['red' if G.degree(n) > 5 else 'blue' for n in G.nodes()]
nx.draw(G, node_color=node_colors)

# Color by attribute
colors = [G.nodes[n].get('value', 0) for n in G.nodes()]
nx.draw(G, node_color=colors, cmap=plt.cm.viridis)
plt.colorbar()
plt.show()
```

### Node Sizes
```python
# Size by degree
node_sizes = [100 * G.degree(n) for n in G.nodes()]
nx.draw(G, node_size=node_sizes)

# Size by centrality
centrality = nx.degree_centrality(G)
node_sizes = [3000 * centrality[n] for n in G.nodes()]
nx.draw(G, node_size=node_sizes)
```

### Node Shapes
```python
# Draw nodes separately with different shapes
pos = nx.spring_layout(G)

# Circle nodes
nx.draw_networkx_nodes(G, pos, nodelist=[0, 1, 2],
                       node_shape='o', node_color='red')

# Square nodes
nx.draw_networkx_nodes(G, pos, nodelist=[3, 4, 5],
                       node_shape='s', node_color='blue')

nx.draw_networkx_edges(G, pos)
nx.draw_networkx_labels(G, pos)
plt.show()
```

### Node Borders
```python
nx.draw(G, pos=pos,
        node_color='lightblue',
        edgecolors='black',  # Node border color
        linewidths=2)        # Node border width
plt.show()
```

## Customizing Edge Appearance

### Edge Colors
```python
# Single color
nx.draw(G, edge_color='gray')

# Different colors per edge
edge_colors = ['red' if G[u][v].get('weight', 1) > 0.5 else 'blue'
               for u, v in G.edges()]
nx.draw(G, edge_color=edge_colors)

# Color by weight
edges = G.edges()
weights = [G[u][v].get('weight', 1) for u, v in edges]
nx.draw(G, edge_color=weights, edge_cmap=plt.cm.Reds)
```

### Edge Widths
```python
# Width by weight
edge_widths = [3 * G[u][v].get('weight', 1) for u, v in G.edges()]
nx.draw(G, width=edge_widths)

# Width by betweenness
edge_betweenness = nx.edge_betweenness_centrality(G)
edge_widths = [5 * edge_betweenness[(u, v)] for u, v in G.edges()]
nx.draw(G, width=edge_widths)
```

### Edge Styles
```python
# Dashed edges
nx.draw(G, style='dashed')

# Different styles per edge
pos = nx.spring_layout(G)
strong_edges = [(u, v) for u, v in G.edges() if G[u][v].get('weight', 0) > 0.5]
weak_edges = [(u, v) for u, v in G.edges() if G[u][v].get('weight', 0) <= 0.5]

nx.draw_networkx_nodes(G, pos)
nx.draw_networkx_edges(G, pos, edgelist=strong_edges, style='solid', width=2)
nx.draw_networkx_edges(G, pos, edgelist=weak_edges, style='dashed', width=1)
plt.show()
```

### Directed Graphs (Arrows)
```python
# Draw directed graph with arrows
G_directed = nx.DiGraph([(1, 2), (2, 3), (3, 1)])
pos = nx.spring_layout(G_directed)

nx.draw(G_directed, pos=pos, with_labels=True,
        arrows=True,
        arrowsize=20,
        arrowstyle='->',
        connectionstyle='arc3,rad=0.1')
plt.show()
```

## Labels and Annotations

### Node Labels
```python
pos = nx.spring_layout(G)

# Custom labels
labels = {n: f"N{n}" for n in G.nodes()}
nx.draw_networkx_labels(G, pos, labels=labels, font_size=12, font_color='white')

# Font customization
nx.draw_networkx_labels(G, pos,
                       font_size=10,
                       font_family='serif',
                       font_weight='bold')
```

### Edge Labels
```python
pos = nx.spring_layout(G)
nx.draw_networkx_nodes(G, pos)
nx.draw_networkx_edges(G, pos)

# Edge labels from attributes
edge_labels = nx.get_edge_attributes(G, 'weight')
nx.draw_networkx_edge_labels(G, pos, edge_labels=edge_labels)
plt.show()

# Custom edge labels
edge_labels = {(u, v): f"{u}-{v}" for u, v in G.edges()}
nx.draw_networkx_edge_labels(G, pos, edge_labels=edge_labels)
```

## Advanced Drawing Techniques

### Combining Draw Functions
```python
# Full control by separating components
pos = nx.spring_layout(G, seed=42)

# Draw edges
nx.draw_networkx_edges(G, pos, alpha=0.3, width=1)

# Draw nodes
nx.draw_networkx_nodes(G, pos,
                       node_color='lightblue',
                       node_size=500,
                       edgecolors='black')

# Draw labels
nx.draw_networkx_labels(G, pos, font_size=10)

# Remove axis
plt.axis('off')
plt.tight_layout()
plt.show()
```

### Subgraph Highlighting
```python
pos = nx.spring_layout(G)

# Identify subgraph to highlight
subgraph_nodes = [1, 2, 3, 4]
subgraph = G.subgraph(subgraph_nodes)

# Draw main graph
nx.draw_networkx_nodes(G, pos, node_color='lightgray', node_size=300)
nx.draw_networkx_edges(G, pos, alpha=0.2)

# Highlight subgraph
nx.draw_networkx_nodes(subgraph, pos, node_color='red', node_size=500)
nx.draw_networkx_edges(subgraph, pos, edge_color='red', width=2)

nx.draw_networkx_labels(G, pos)
plt.axis('off')
plt.show()
```

### Community Coloring
```python
from networkx.algorithms import community

# Detect communities
communities = community.greedy_modularity_communities(G)

# Assign colors
color_map = {}
colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange']
for i, comm in enumerate(communities):
    for node in comm:
        color_map[node] = colors[i % len(colors)]

node_colors = [color_map[n] for n in G.nodes()]

pos = nx.spring_layout(G)
nx.draw(G, pos=pos, node_color=node_colors, with_labels=True)
plt.show()
```

## Creating Publication-Quality Figures

### High Resolution Export
```python
plt.figure(figsize=(12, 8))
pos = nx.spring_layout(G, seed=42)

nx.draw(G, pos=pos,
        node_color='lightblue',
        node_size=500,
        edge_color='gray',
        width=1,
        with_labels=True,
        font_size=10)

plt.title('Graph Visualization', fontsize=16)
plt.axis('off')
plt.tight_layout()
plt.savefig('publication_graph.png', dpi=300, bbox_inches='tight')
plt.savefig('publication_graph.pdf', bbox_inches='tight')  # Vector format
plt.close()
```

### Multi-Panel Figures
```python
fig, axes = plt.subplots(1, 3, figsize=(18, 6))

# Different layouts
layouts = [nx.circular_layout(G), nx.spring_layout(G), nx.spectral_layout(G)]
titles = ['Circular', 'Spring', 'Spectral']

for ax, pos, title in zip(axes, layouts, titles):
    nx.draw(G, pos=pos, ax=ax, with_labels=True, node_color='lightblue')
    ax.set_title(title)
    ax.axis('off')

plt.tight_layout()
plt.savefig('layouts_comparison.png', dpi=300)
plt.close()
```

## Interactive Visualization Libraries

### Plotly (Interactive)
```python
import plotly.graph_objects as go

# Create positions
pos = nx.spring_layout(G)

# Edge trace
edge_x = []
edge_y = []
for edge in G.edges():
    x0, y0 = pos[edge[0]]
    x1, y1 = pos[edge[1]]
    edge_x.extend([x0, x1, None])
    edge_y.extend([y0, y1, None])

edge_trace = go.Scatter(
    x=edge_x, y=edge_y,
    line=dict(width=0.5, color='#888'),
    hoverinfo='none',
    mode='lines')

# Node trace
node_x = [pos[node][0] for node in G.nodes()]
node_y = [pos[node][1] for node in G.nodes()]

node_trace = go.Scatter(
    x=node_x, y=node_y,
    mode='markers',
    hoverinfo='text',
    marker=dict(
        showscale=True,
        colorscale='YlGnBu',
        size=10,
        colorbar=dict(thickness=15, title='Node Connections'),
        line_width=2))

# Color by degree
node_adjacencies = [len(list(G.neighbors(node))) for node in G.nodes()]
node_trace.marker.color = node_adjacencies

fig = go.Figure(data=[edge_trace, node_trace],
                layout=go.Layout(
                    showlegend=False,
                    hovermode='closest',
                    margin=dict(b=0, l=0, r=0, t=0)))

fig.show()
```

### PyVis (Interactive HTML)
```python
from pyvis.network import Network

# Create network
net = Network(notebook=True, height='750px', width='100%')

# Add nodes and edges from NetworkX
net.from_nx(G)

# Customize
net.show_buttons(filter_=['physics'])

# Save
net.show('graph.html')
```

### Graphviz (via pydot)
```python
# Requires graphviz and pydot
from networkx.drawing.nx_pydot import graphviz_layout

pos = graphviz_layout(G, prog='neato')  # neato, dot, fdp, sfdp, circo, twopi
nx.draw(G, pos=pos, with_labels=True)
plt.show()

# Export to graphviz
nx.drawing.nx_pydot.write_dot(G, 'graph.dot')
```

## Bipartite Graph Visualization

### Two-Set Layout
```python
from networkx.algorithms import bipartite

# Create bipartite graph
B = nx.Graph()
B.add_nodes_from([1, 2, 3, 4], bipartite=0)
B.add_nodes_from(['a', 'b', 'c', 'd', 'e'], bipartite=1)
B.add_edges_from([(1, 'a'), (1, 'b'), (2, 'b'), (2, 'c'), (3, 'd'), (4, 'e')])

# Layout with two columns
pos = {}
top_nodes = [n for n, d in B.nodes(data=True) if d['bipartite'] == 0]
bottom_nodes = [n for n, d in B.nodes(data=True) if d['bipartite'] == 1]

pos.update({node: (0, i) for i, node in enumerate(top_nodes)})
pos.update({node: (1, i) for i, node in enumerate(bottom_nodes)})

nx.draw(B, pos=pos, with_labels=True,
        node_color=['lightblue' if B.nodes[n]['bipartite'] == 0 else 'lightgreen'
                   for n in B.nodes()])
plt.show()
```

## 3D Visualization

### 3D Network Plot
```python
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

# 3D spring layout
pos = nx.spring_layout(G, dim=3, seed=42)

# Extract coordinates
node_xyz = np.array([pos[v] for v in G.nodes()])
edge_xyz = np.array([(pos[u], pos[v]) for u, v in G.edges()])

# Create figure
fig = plt.figure(figsize=(10, 8))
ax = fig.add_subplot(111, projection='3d')

# Plot edges
for vizedge in edge_xyz:
    ax.plot(*vizedge.T, color='gray', alpha=0.5)

# Plot nodes
ax.scatter(*node_xyz.T, s=100, c='lightblue', edgecolors='black')

# Labels
for i, (x, y, z) in enumerate(node_xyz):
    ax.text(x, y, z, str(i))

ax.set_axis_off()
plt.show()
```

## Best Practices

### Performance
- For large graphs (>1000 nodes), use simpler layouts (circular, random)
- Use `alpha` parameter to make dense edges more visible
- Consider downsampling or showing subgraphs for very large networks

### Aesthetics
- Use consistent color schemes
- Scale node sizes meaningfully (e.g., by degree or importance)
- Keep labels readable (adjust font size and position)
- Use white space effectively (adjust figure size)

### Reproducibility
- Always set random seeds for layouts: `nx.spring_layout(G, seed=42)`
- Save layout positions for consistency across multiple plots
- Document color/size mappings in legends or captions

### File Formats
- PNG for raster images (web, presentations)
- PDF for vector graphics (publications, scalable)
- SVG for web and interactive applications
- HTML for interactive visualizations
