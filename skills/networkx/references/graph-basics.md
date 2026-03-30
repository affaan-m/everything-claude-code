# NetworkX Graph Basics

## Graph Types

NetworkX supports four main graph classes:

### Graph (Undirected)
```python
import networkx as nx
G = nx.Graph()
```
- Undirected graphs with single edges between nodes
- No parallel edges allowed
- Edges are bidirectional

### DiGraph (Directed)
```python
G = nx.DiGraph()
```
- Directed graphs with one-way connections
- Edge direction matters: (u, v) ≠ (v, u)
- Used for modeling directed relationships

### MultiGraph (Undirected Multi-edge)
```python
G = nx.MultiGraph()
```
- Allows multiple edges between same node pairs
- Useful for modeling multiple relationships

### MultiDiGraph (Directed Multi-edge)
```python
G = nx.MultiDiGraph()
```
- Directed graph with multiple edges between nodes
- Combines features of DiGraph and MultiGraph

## Creating and Adding Nodes

### Single Node Addition
```python
G.add_node(1)
G.add_node("protein_A")
G.add_node((x, y))  # Nodes can be any hashable type
```

### Bulk Node Addition
```python
G.add_nodes_from([2, 3, 4])
G.add_nodes_from(range(100, 110))
```

### Nodes with Attributes
```python
G.add_node(1, time='5pm', color='red')
G.add_nodes_from([
    (4, {"color": "red"}),
    (5, {"color": "blue", "weight": 1.5})
])
```

### Important Node Properties
- Nodes can be any hashable Python object: strings, tuples, numbers, custom objects
- Node attributes stored as key-value pairs
- Use meaningful node identifiers for clarity

## Creating and Adding Edges

### Single Edge Addition
```python
G.add_edge(1, 2)
G.add_edge('gene_A', 'gene_B')
```

### Bulk Edge Addition
```python
G.add_edges_from([(1, 2), (1, 3), (2, 4)])
G.add_edges_from(edge_list)
```

### Edges with Attributes
```python
G.add_edge(1, 2, weight=4.7, relation='interacts')
G.add_edges_from([
    (1, 2, {'weight': 4.7}),
    (2, 3, {'weight': 8.2, 'color': 'blue'})
])
```

### Adding from Edge List with Attributes
```python
# From pandas DataFrame
import pandas as pd
df = pd.DataFrame({'source': [1, 2], 'target': [2, 3], 'weight': [4.7, 8.2]})
G = nx.from_pandas_edgelist(df, 'source', 'target', edge_attr='weight')
```

## Examining Graph Structure

### Basic Properties
```python
# Get collections
G.nodes              # NodeView of all nodes
G.edges              # EdgeView of all edges
G.adj                # AdjacencyView for neighbor relationships

# Count elements
G.number_of_nodes()  # Total node count
G.number_of_edges()  # Total edge count
len(G)              # Number of nodes (shorthand)

# Degree information
G.degree()          # DegreeView of all node degrees
G.degree(1)         # Degree of specific node
list(G.degree())    # List of (node, degree) pairs
```

### Checking Existence
```python
# Check if node exists
1 in G              # Returns True/False
G.has_node(1)

# Check if edge exists
G.has_edge(1, 2)
```

### Accessing Neighbors
```python
# Get neighbors of node 1
list(G.neighbors(1))
list(G[1])          # Dictionary-like access

# For directed graphs
list(G.predecessors(1))  # Incoming edges
list(G.successors(1))    # Outgoing edges
```

### Iterating Over Elements
```python
# Iterate over nodes
for node in G.nodes:
    print(node, G.nodes[node])  # Access node attributes

# Iterate over edges
for u, v in G.edges:
    print(u, v, G[u][v])  # Access edge attributes

# Iterate with attributes
for node, attrs in G.nodes(data=True):
    print(node, attrs)

for u, v, attrs in G.edges(data=True):
    print(u, v, attrs)
```

## Modifying Graphs

### Removing Elements
```python
# Remove single node (also removes incident edges)
G.remove_node(1)

# Remove multiple nodes
G.remove_nodes_from([1, 2, 3])

# Remove edges
G.remove_edge(1, 2)
G.remove_edges_from([(1, 2), (2, 3)])
```

### Clearing Graph
```python
G.clear()           # Remove all nodes and edges
G.clear_edges()     # Remove only edges, keep nodes
```

## Attributes and Metadata

### Graph-Level Attributes
```python
G.graph['name'] = 'Social Network'
G.graph['date'] = '2025-01-15'
print(G.graph)
```

### Node Attributes
```python
# Set at creation
G.add_node(1, time='5pm', weight=0.5)

# Set after creation
G.nodes[1]['time'] = '6pm'
nx.set_node_attributes(G, {1: 'red', 2: 'blue'}, 'color')

# Get attributes
G.nodes[1]
G.nodes[1]['time']
nx.get_node_attributes(G, 'color')
```

### Edge Attributes
```python
# Set at creation
G.add_edge(1, 2, weight=4.7, color='red')

# Set after creation
G[1][2]['weight'] = 5.0
nx.set_edge_attributes(G, {(1, 2): 10.5}, 'weight')

# Get attributes
G[1][2]
G[1][2]['weight']
G.edges[1, 2]
nx.get_edge_attributes(G, 'weight')
```

## Subgraphs and Views

### Subgraph Creation
```python
# Create subgraph from node list
nodes_subset = [1, 2, 3, 4]
H = G.subgraph(nodes_subset)  # Returns view (references original)

# Create independent copy
H = G.subgraph(nodes_subset).copy()

# Edge-induced subgraph
edge_subset = [(1, 2), (2, 3)]
H = G.edge_subgraph(edge_subset)
```

### Graph Views
```python
# Reverse view (for directed graphs)
G_reversed = G.reverse()

# Convert between directed/undirected
G_undirected = G.to_undirected()
G_directed = G.to_directed()
```

## Graph Information and Diagnostics

### Basic Information
```python
print(nx.info(G))   # Summary of graph structure

# Density (ratio of actual edges to possible edges)
nx.density(G)

# Check if graph is directed
G.is_directed()

# Check if graph is multigraph
G.is_multigraph()
```

### Connectivity Checks
```python
# For undirected graphs
nx.is_connected(G)
nx.number_connected_components(G)

# For directed graphs
nx.is_strongly_connected(G)
nx.is_weakly_connected(G)
```

## Important Considerations

### Floating Point Precision
Once graphs contain floating point numbers, all results are inherently approximate due to precision limitations. Small arithmetic errors can affect algorithm outcomes, particularly in minimum/maximum computations.

### Memory Considerations
Each time a script starts, graph data must be loaded into memory. For large datasets, this can cause performance issues. Consider:
- Using efficient data formats (pickle for Python objects)
- Loading only necessary subgraphs
- Using graph databases for very large networks

### Node and Edge Removal Behavior
When a node is removed, all edges incident with that node are automatically removed as well.
