# NetworkX Input/Output

## Reading Graphs from Files

### Adjacency List Format
```python
# Read adjacency list (simple text format)
G = nx.read_adjlist('graph.adjlist')

# With node type conversion
G = nx.read_adjlist('graph.adjlist', nodetype=int)

# For directed graphs
G = nx.read_adjlist('graph.adjlist', create_using=nx.DiGraph())

# Write adjacency list
nx.write_adjlist(G, 'graph.adjlist')
```

Example adjacency list format:
```
# node neighbors
0 1 2
1 0 3 4
2 0 3
3 1 2 4
4 1 3
```

### Edge List Format
```python
# Read edge list
G = nx.read_edgelist('graph.edgelist')

# With node types and edge data
G = nx.read_edgelist('graph.edgelist',
                     nodetype=int,
                     data=(('weight', float),))

# Read weighted edge list
G = nx.read_weighted_edgelist('weighted.edgelist')

# Write edge list
nx.write_edgelist(G, 'graph.edgelist')

# Write weighted edge list
nx.write_weighted_edgelist(G, 'weighted.edgelist')
```

Example edge list format:
```
# source target
0 1
1 2
2 3
3 0
```

Example weighted edge list:
```
# source target weight
0 1 0.5
1 2 1.0
2 3 0.75
```

### GML (Graph Modelling Language)
```python
# Read GML (preserves all attributes)
G = nx.read_gml('graph.gml')

# Write GML
nx.write_gml(G, 'graph.gml')
```

### GraphML Format
```python
# Read GraphML (XML-based format)
G = nx.read_graphml('graph.graphml')

# Write GraphML
nx.write_graphml(G, 'graph.graphml')

# With specific encoding
nx.write_graphml(G, 'graph.graphml', encoding='utf-8')
```

### GEXF (Graph Exchange XML Format)
```python
# Read GEXF
G = nx.read_gexf('graph.gexf')

# Write GEXF
nx.write_gexf(G, 'graph.gexf')
```

### Pajek Format
```python
# Read Pajek .net files
G = nx.read_pajek('graph.net')

# Write Pajek format
nx.write_pajek(G, 'graph.net')
```

### LEDA Format
```python
# Read LEDA format
G = nx.read_leda('graph.leda')

# Write LEDA format
nx.write_leda(G, 'graph.leda')
```

## Working with Pandas

### From Pandas DataFrame
```python
import pandas as pd

# Create graph from edge list DataFrame
df = pd.DataFrame({
    'source': [1, 2, 3, 4],
    'target': [2, 3, 4, 1],
    'weight': [0.5, 1.0, 0.75, 0.25]
})

# Create graph
G = nx.from_pandas_edgelist(df,
                            source='source',
                            target='target',
                            edge_attr='weight')

# With multiple edge attributes
G = nx.from_pandas_edgelist(df,
                            source='source',
                            target='target',
                            edge_attr=['weight', 'color', 'type'])

# Create directed graph
G = nx.from_pandas_edgelist(df,
                            source='source',
                            target='target',
                            create_using=nx.DiGraph())
```

### To Pandas DataFrame
```python
# Convert graph to edge list DataFrame
df = nx.to_pandas_edgelist(G)

# With specific edge attributes
df = nx.to_pandas_edgelist(G, source='node1', target='node2')
```

### Adjacency Matrix with Pandas
```python
# Create DataFrame from adjacency matrix
df = nx.to_pandas_adjacency(G, dtype=int)

# Create graph from adjacency DataFrame
G = nx.from_pandas_adjacency(df)

# For directed graphs
G = nx.from_pandas_adjacency(df, create_using=nx.DiGraph())
```

## NumPy and SciPy Integration

### Adjacency Matrix
```python
import numpy as np

# To NumPy adjacency matrix
A = nx.to_numpy_array(G, dtype=int)

# With specific node order
nodelist = [1, 2, 3, 4, 5]
A = nx.to_numpy_array(G, nodelist=nodelist)

# From NumPy array
G = nx.from_numpy_array(A)

# For directed graphs
G = nx.from_numpy_array(A, create_using=nx.DiGraph())
```

### Sparse Matrix (SciPy)
```python
from scipy import sparse

# To sparse matrix
A = nx.to_scipy_sparse_array(G)

# With specific format (csr, csc, coo, etc.)
A_csr = nx.to_scipy_sparse_array(G, format='csr')

# From sparse matrix
G = nx.from_scipy_sparse_array(A)
```

## JSON Format

### Node-Link Format
```python
import json

# To node-link format (good for d3.js)
data = nx.node_link_data(G)
with open('graph.json', 'w') as f:
    json.dump(data, f)

# From node-link format
with open('graph.json', 'r') as f:
    data = json.load(f)
G = nx.node_link_graph(data)
```

### Adjacency Data Format
```python
# To adjacency format
data = nx.adjacency_data(G)
with open('graph.json', 'w') as f:
    json.dump(data, f)

# From adjacency format
with open('graph.json', 'r') as f:
    data = json.load(f)
G = nx.adjacency_graph(data)
```

### Tree Data Format
```python
# For tree graphs
data = nx.tree_data(G, root=0)
with open('tree.json', 'w') as f:
    json.dump(data, f)

# From tree format
with open('tree.json', 'r') as f:
    data = json.load(f)
G = nx.tree_graph(data)
```

## Pickle Format

### Binary Pickle
```python
import pickle

# Write pickle (preserves all Python objects)
with open('graph.pkl', 'wb') as f:
    pickle.dump(G, f)

# Read pickle
with open('graph.pkl', 'rb') as f:
    G = pickle.load(f)

# NetworkX convenience functions
nx.write_gpickle(G, 'graph.gpickle')
G = nx.read_gpickle('graph.gpickle')
```

## CSV Files

### Custom CSV Reading
```python
import csv

# Read edges from CSV
G = nx.Graph()
with open('edges.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        G.add_edge(row['source'], row['target'], weight=float(row['weight']))

# Write edges to CSV
with open('edges.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['source', 'target', 'weight'])
    for u, v, data in G.edges(data=True):
        writer.writerow([u, v, data.get('weight', 1.0)])
```

## Database Integration

### SQL Databases
```python
import sqlite3
import pandas as pd

# Read from SQL database via pandas
conn = sqlite3.connect('network.db')
df = pd.read_sql_query("SELECT source, target, weight FROM edges", conn)
G = nx.from_pandas_edgelist(df, 'source', 'target', edge_attr='weight')
conn.close()

# Write to SQL database
df = nx.to_pandas_edgelist(G)
conn = sqlite3.connect('network.db')
df.to_sql('edges', conn, if_exists='replace', index=False)
conn.close()
```

## Graph Formats for Visualization

### DOT Format (Graphviz)
```python
# Write DOT file for Graphviz
nx.drawing.nx_pydot.write_dot(G, 'graph.dot')

# Read DOT file
G = nx.drawing.nx_pydot.read_dot('graph.dot')

# Generate directly to image (requires Graphviz)
from networkx.drawing.nx_pydot import to_pydot
pydot_graph = to_pydot(G)
pydot_graph.write_png('graph.png')
```

## Cytoscape Integration

### Cytoscape JSON
```python
# Export for Cytoscape
data = nx.cytoscape_data(G)
with open('cytoscape.json', 'w') as f:
    json.dump(data, f)

# Import from Cytoscape
with open('cytoscape.json', 'r') as f:
    data = json.load(f)
G = nx.cytoscape_graph(data)
```

## Specialized Formats

### Matrix Market Format
```python
from scipy.io import mmread, mmwrite

# Read Matrix Market
A = mmread('graph.mtx')
G = nx.from_scipy_sparse_array(A)

# Write Matrix Market
A = nx.to_scipy_sparse_array(G)
mmwrite('graph.mtx', A)
```

### Shapefile (for Geographic Networks)
```python
# Requires pyshp library
# Read geographic network from shapefile
G = nx.read_shp('roads.shp')

# Write to shapefile
nx.write_shp(G, 'network')
```

## Format Selection Guidelines

### Choose Based on Requirements

**Adjacency List** - Simple, human-readable, no attributes
- Best for: Simple unweighted graphs, quick viewing

**Edge List** - Simple, supports weights, human-readable
- Best for: Weighted graphs, importing/exporting data

**GML/GraphML** - Full attribute preservation, XML-based
- Best for: Complete graph serialization with all metadata

**JSON** - Web-friendly, JavaScript integration
- Best for: Web applications, d3.js visualizations

**Pickle** - Fast, preserves Python objects, binary
- Best for: Python-only storage, complex attributes

**Pandas** - Data analysis integration, DataFrame operations
- Best for: Data processing pipelines, statistical analysis

**NumPy/SciPy** - Numerical computation, sparse matrices
- Best for: Matrix operations, scientific computing

**DOT** - Visualization, Graphviz integration
- Best for: Creating visual diagrams

## Performance Considerations

### Large Graphs
For large graphs, consider:
```python
# Use compressed formats
import gzip
with gzip.open('graph.adjlist.gz', 'wt') as f:
    nx.write_adjlist(G, f)

with gzip.open('graph.adjlist.gz', 'rt') as f:
    G = nx.read_adjlist(f)

# Use binary formats (faster)
nx.write_gpickle(G, 'graph.gpickle')  # Faster than text formats

# Use sparse matrices for adjacency
A = nx.to_scipy_sparse_array(G, format='csr')  # Memory efficient
```

### Incremental Loading
For very large graphs:
```python
# Load graph incrementally from edge list
G = nx.Graph()
with open('huge_graph.edgelist') as f:
    for line in f:
        u, v = line.strip().split()
        G.add_edge(u, v)

        # Process in chunks
        if G.number_of_edges() % 100000 == 0:
            print(f"Loaded {G.number_of_edges()} edges")
```

## Error Handling

### Robust File Reading
```python
try:
    G = nx.read_graphml('graph.graphml')
except nx.NetworkXError as e:
    print(f"Error reading GraphML: {e}")
except FileNotFoundError:
    print("File not found")
    G = nx.Graph()

# Check if file format is supported
if os.path.exists('graph.txt'):
    with open('graph.txt') as f:
        first_line = f.readline()
        # Detect format and read accordingly
```
