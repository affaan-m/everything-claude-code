---
name: etetoolkit
description: Phylogenetic tree toolkit (ETE). Tree manipulation (Newick/NHX), evolutionary event detection, orthology/paralogy, NCBI taxonomy, visualization (PDF/SVG), for phylogenomics.
license: GPL-3.0 license
metadata:
    skill-author: K-Dense Inc.
---

# ETE Toolkit Skill

## Overview

ETE (Environment for Tree Exploration) is a toolkit for phylogenetic and hierarchical tree analysis. Manipulate trees, analyze evolutionary events, visualize results, and integrate with biological databases for phylogenomic research and clustering analysis.

## Core Capabilities

### 1. Tree Manipulation and Analysis

Load, manipulate, and analyze hierarchical tree structures with support for:

- **Tree I/O**: Read and write Newick, NHX, PhyloXML, and NeXML formats
- **Tree traversal**: Navigate trees using preorder, postorder, or levelorder strategies
- **Topology modification**: Prune, root, collapse nodes, resolve polytomies
- **Distance calculations**: Compute branch lengths and topological distances between nodes
- **Tree comparison**: Calculate Robinson-Foulds distances and identify topological differences

**Common patterns:**

```python
from ete3 import Tree

# Load tree from file
tree = Tree("tree.nw", format=1)

# Basic statistics
print(f"Leaves: {len(tree)}")
print(f"Total nodes: {len(list(tree.traverse()))}")

# Prune to taxa of interest
taxa_to_keep = ["species1", "species2", "species3"]
tree.prune(taxa_to_keep, preserve_branch_length=True)

# Midpoint root
midpoint = tree.get_midpoint_outgroup()
tree.set_outgroup(midpoint)

# Save modified tree
tree.write(outfile="rooted_tree.nw")
```

Use `scripts/tree_operations.py` for command-line tree manipulation:

```bash
# Display tree statistics
python scripts/tree_operations.py stats tree.nw

# Convert format
python scripts/tree_operations.py convert tree.nw output.nw --in-format 0 --out-format 1

# Reroot tree
python scripts/tree_operations.py reroot tree.nw rooted.nw --midpoint

# Prune to specific taxa
python scripts/tree_operations.py prune tree.nw pruned.nw --keep-taxa "sp1,sp2,sp3"

# Show ASCII visualization
python scripts/tree_operations.py ascii tree.nw
```

### 2. Phylogenetic Analysis

Analyze gene trees with evolutionary event detection:

- **Sequence alignment integration**: Link trees to multiple sequence alignments (FASTA, Phylip)
- **Species naming**: Automatic or custom species extraction from gene names
- **Evolutionary events**: Detect duplication and speciation events using Species Overlap or tree reconciliation
- **Orthology detection**: Identify orthologs and paralogs based on evolutionary events
- **Gene family analysis**: Split trees by duplications, collapse lineage-specific expansions

**Workflow for gene tree analysis:**

```python
from ete3 import PhyloTree

# Load gene tree with alignment
tree = PhyloTree("gene_tree.nw", alignment="alignment.fasta")

# Set species naming function
def get_species(gene_name):
    return gene_name.split("_")[0]

tree.set_species_naming_function(get_species)

# Detect evolutionary events
events = tree.get_descendant_evol_events()

# Analyze events
for node in tree.traverse():
    if hasattr(node, "evoltype"):
        if node.evoltype == "D":
            print(f"Duplication at {node.name}")
        elif node.evoltype == "S":
            print(f"Speciation at {node.name}")

# Extract ortholog groups
ortho_groups = tree.get_speciation_trees()
for i, ortho_tree in enumerate(ortho_groups):
    ortho_tree.write(outfile=f"ortholog_group_{i}.nw")
```

**Finding orthologs and paralogs:**

```python
# Find orthologs to query gene
query = tree & "species1_gene1"

orthologs = []
paralogs = []

for event in events:
    if query in event.in_seqs:
        if event.etype == "S":
            orthologs.extend([s for s in event.out_seqs if s != query])
        elif event.etype == "D":
            paralogs.extend([s for s in event.out_seqs if s != query])
```

### 3. NCBI Taxonomy Integration

Integrate taxonomic information from NCBI Taxonomy database:

- **Database access**: Automatic download and local caching of NCBI taxonomy (~300MB)
- **Taxid/name translation**: Convert between taxonomic IDs and scientific names
- **Lineage retrieval**: Get complete evolutionary lineages
- **Taxonomy trees**: Build species trees connecting specified taxa
- **Tree annotation**: Automatically annotate trees with taxonomic information

**Building taxonomy-based trees:**

```python
from ete3 import NCBITaxa

ncbi = NCBITaxa()

# Build tree from species names
species = ["Homo sapiens", "Pan troglodytes", "Mus musculus"]
name2taxid = ncbi.get_name_translator(species)
taxids = [name2taxid[sp][0] for sp in species]

# Get minimal tree connecting taxa
tree = ncbi.get_topology(taxids)

# Annotate nodes with taxonomy info
for node in tree.traverse():
    if hasattr(node, "sci_name"):
        print(f"{node.sci_name} - Rank: {node.rank} - TaxID: {node.taxid}")
```

**Annotating existing trees:**

```python
# Get taxonomy info for tree leaves
for leaf in tree:
    species = extract_species_from_name(leaf.name)
    taxid = ncbi.get_name_translator([species])[species][0]

    # Get lineage
    lineage = ncbi.get_lineage(taxid)
    ranks = ncbi.get_rank(lineage)
    names = ncbi.get_taxid_translator(lineage)

    # Add to node
    leaf.add_feature("taxid", taxid)
    leaf.add_feature("lineage", [names[t] for t in lineage])
```

### 4. Tree Visualization

Create publication-quality tree visualizations:

- **Output formats**: PNG (raster), PDF, and SVG (vector) for publications
- **Layout modes**: Rectangular and circular tree layouts
- **Interactive GUI**: Explore trees interactively with zoom, pan, and search
- **Custom styling**: NodeStyle for node appearance (colors, shapes, sizes)
- **Faces**: Add graphical elements (text, images, charts, heatmaps) to nodes
- **Layout functions**: Dynamic styling based on node properties

**Basic visualization workflow:**

```python
from ete3 import Tree, TreeStyle, NodeStyle

tree = Tree("tree.nw")

# Configure tree style
ts = TreeStyle()
ts.show_leaf_name = True
ts.show_branch_support = True
ts.scale = 50  # pixels per branch length unit

# Style nodes
for node in tree.traverse():
    nstyle = NodeStyle()

    if node.is_leaf():
        nstyle["fgcolor"] = "blue"
        nstyle["size"] = 8
    else:
        # Color by support
        if node.support > 0.9:
            nstyle["fgcolor"] = "darkgreen"
        else:
            nstyle["fgcolor"] = "red"
        nstyle["size"] = 5

    node.set_style(nstyle)

# Render to file
tree.render("tree.pdf", tree_style=ts)
tree.render("tree.png", w=800, h=600, units="px", dpi=300)
```

Use `scripts/quick_visualize.py` for rapid visualization:

```bash
# Basic visualization
python scripts/quick_visualize.py tree.nw output.pdf

# Circular layout with custom styling
python scripts/quick_visualize.py tree.nw output.pdf --mode c --color-by-support

# High-resolution PNG
python scripts/quick_visualize.py tree.nw output.png --width 1200 --height 800 --units px --dpi 300

# Custom title and styling
python scripts/quick_visualize.py tree.nw output.pdf --title "Species Phylogeny" --show-support
```

**Advanced visualization with faces:**

```python
from ete3 import Tree, TreeStyle, TextFace, CircleFace

tree = Tree("tree.nw")

# Add features to nodes
for leaf in tree:
    leaf.add_feature("habitat", "marine" if "fish" in leaf.name else "land")

# Layout function
def layout(node):
    if node.is_leaf():
        # Add colored circle
        color = "blue" if node.habitat == "marine" else "green"
        circle = CircleFace(radius=5, color=color)
        node.add_face(circle, column=0, position="aligned")

        # Add label
        label = TextFace(node.name, fsize=10)
        node.add_face(label, column=1, position="aligned")

ts = TreeStyle()
ts.layout_fn = layout
ts.show_leaf_name = False

tree.render("annotated_tree.pdf", tree_style=ts)
```

### 5. Clustering Analysis

Analyze hierarchical clustering results with data integration:

- **ClusterTree**: Specialized class for clustering dendrograms
- **Data matrix linking**: Connect tree leaves to numerical profiles
- **Cluster metrics**: Silhouette coefficient, Dunn index, inter/intra-cluster distances
- **Validation**: Test cluster quality with different distance metrics
- **Heatmap visualization**: Display data matrices alongside trees

**Clustering workflow:**

```python
from ete3 import ClusterTree

# Load tree with data matrix
matrix = """#Names\tSample1\tSample2\tSample3
Gene1\t1.5\t2.3\t0.8
Gene2\t0.9\t1.1\t1.8
Gene3\t2.1\t2.5\t0.5"""

tree = ClusterTree("((Gene1,Gene2),Gene3);", text_array=matrix)

# Evaluate cluster quality
for node in tree.traverse():
    if not node.is_leaf():
        silhouette = node.get_silhouette()
        dunn = node.get_dunn()

        print(f"Cluster: {node.name}")
        print(f"  Silhouette: {silhouette:.3f}")
        print(f"  Dunn index: {dunn:.3f}")

# Visualize with heatmap
tree.show("heatmap")
```

### 6. Tree Comparison

Quantify topological differences between trees:

- **Robinson-Foulds distance**: Standard metric for tree comparison
- **Normalized RF**: Scale-invariant distance (0.0 to 1.0)
- **Partition analysis**: Identify unique and shared bipartitions
- **Consensus trees**: Analyze support across multiple trees
- **Batch comparison**: Compare multiple trees pairwise

**Compare two trees:**

```python
from ete3 import Tree

tree1 = Tree("tree1.nw")
tree2 = Tree("tree2.nw")

# Calculate RF distance
rf, max_rf, common_leaves, parts_t1, parts_t2 = tree1.robinson_foulds(tree2)

print(f"RF distance: {rf}/{max_rf}")
print(f"Normalized RF: {rf/max_rf:.3f}")
print(f"Common leaves: {len(common_leaves)}")

# Find unique partitions
unique_t1 = parts_t1 - parts_t2
unique_t2 = parts_t2 - parts_t1

print(f"Unique to tree1: {len(unique_t1)}")
print(f"Unique to tree2: {len(unique_t2)}")
```

**Compare multiple trees:**

```python
import numpy as np

trees = [Tree(f"tree{i}.nw") for i in range(4)]

# Create distance matrix
n = len(trees)
dist_matrix = np.zeros((n, n))

for i in range(n):
    for j in range(i+1, n):
        rf, max_rf, _, _, _ = trees[i].robinson_foulds(trees[j])
        norm_rf = rf / max_rf if max_rf > 0 else 0
        dist_matrix[i, j] = norm_rf
        dist_matrix[j, i] = norm_rf
```

## Installation and Setup

Install ETE toolkit:

```bash
# Basic installation
uv pip install ete3

# With external dependencies for rendering (optional but recommended)
# On macOS:
brew install qt@5

# On Ubuntu/Debian:
sudo apt-get install python3-pyqt5 python3-pyqt5.qtsvg

# For full features including GUI
uv pip install ete3[gui]
```

**First-time NCBI Taxonomy setup:**

The first time NCBITaxa is instantiated, it automatically downloads the NCBI taxonomy database (~300MB) to `~/.etetoolkit/taxa.sqlite`. This happens only once:

```python
from ete3 import NCBITaxa
ncbi = NCBITaxa()  # Downloads database on first run
```

Update taxonomy database:

```python
ncbi.update_taxonomy_database()  # Download latest NCBI data
```

## Common Use Cases

### Use Case 1: Phylogenomic Pipeline

Complete workflow from gene tree to ortholog identification:

```python
from ete3 import PhyloTree, NCBITaxa

# 1. Load gene tree with alignment
tree = PhyloTree("gene_tree.nw", alignment="alignment.fasta")

# 2. Configure species naming
tree.set_species_naming_function(lambda x: x.split("_")[0])

# 3. Detect evolutionary events
tree.get_descendant_evol_events()

# 4. Annotate with taxonomy
ncbi = NCBITaxa()
for leaf in tree:
    if leaf.species in species_to_taxid:
        taxid = species_to_taxid[leaf.species]
        lineage = ncbi.get_lineage(taxid)
        leaf.add_feature("lineage", lineage)

# 5. Extract ortholog groups
ortho_groups = tree.get_speciation_trees()

# 6. Save and visualize
for i, ortho in enumerate(ortho_groups):
    ortho.write(outfile=f"ortho_{i}.nw")
```

### Use Case 2: Tree Preprocessing and Formatting

Batch process trees for analysis:

```bash
# Convert format
python scripts/tree_operations.py convert input.nw output.nw --in-format 0 --out-format 1

# Root at midpoint
python scripts/tree_operations.py reroot input.nw rooted.nw --midpoint

# Prune to focal taxa
python scripts/tree_operations.py prune rooted.nw pruned.nw --keep-taxa taxa_list.txt

# Get statistics
python scripts/tree_operations.py stats pruned.nw
```

### Use Case 3: Publication-Quality Figures

Create styled visualizations:

```python
from ete3 import Tree, TreeStyle, NodeStyle, TextFace

tree = Tree("tree.nw")

# Define clade colors
clade_colors = {
    "Mammals": "red",
    "Birds": "blue",
    "Fish": "green"
}

def layout(node):
    # Highlight clades
    if node.is_leaf():
        for clade, color in clade_colors.items():
            if clade in node.name:
                nstyle = NodeStyle()
                nstyle["fgcolor"] = color
                nstyle["size"] = 8
                node.set_style(nstyle)
    else:
        # Add support values
        if node.support > 0.95:
            support = TextFace(f"{node.support:.2f}", fsize=8)
            node.add_face(support, column=0, position="branch-top")

ts = TreeStyle()
ts.layout_fn = layout
ts.show_scale = True

# Render for publication
tree.render("figure.pdf", w=200, units="mm", tree_style=ts)
tree.render("figure.svg", tree_style=ts)  # Editable vector
```

### Use Case 4: Automated Tree Analysis

Process multiple trees systematically:

```python
from ete3 import Tree
import os

input_dir = "trees"
output_dir = "processed"

for filename in os.listdir(input_dir):
    if filename.endswith(".nw"):
        tree = Tree(os.path.join(input_dir, filename))

        # Standardize: midpoint root, resolve polytomies
        midpoint = tree.get_midpoint_outgroup()
        tree.set_outgroup(midpoint)
        tree.resolve_polytomy(recursive=True)

        # Filter low support branches
        for node in tree.traverse():
            if hasattr(node, 'support') and node.support < 0.5:
                if not node.is_leaf() and not node.is_root():
                    node.delete()

        # Save processed tree
        output_file = os.path.join(output_dir, f"processed_{filename}")
        tree.write(outfile=output_file)
```

## Reference Documentation

For comprehensive API documentation, code examples, and detailed guides, refer to the following resources in the `references/` directory:

- **`api_reference.md`**: Complete API documentation for all ETE classes and methods (Tree, PhyloTree, ClusterTree, NCBITaxa), including parameters, return types, and code examples
- **`workflows.md`**: Common workflow patterns organized by task (tree operations, phylogenetic analysis, tree comparison, taxonomy integration, clustering analysis)
- **`visualization.md`**: Comprehensive visualization guide covering TreeStyle, NodeStyle, Faces, layout functions, and advanced visualization techniques

Load these references when detailed information is needed:

```python
# To use API reference
# Read references/api_reference.md for complete method signatures and parameters

# To implement workflows
# Read references/workflows.md for step-by-step workflow examples

# To create visualizations
# Read references/visualization.md for styling and rendering options
```

## Troubleshooting

**Import errors:**

```bash
# If "ModuleNotFoundError: No module named 'ete3'"
uv pip install ete3

# For GUI and rendering issues
uv pip install ete3[gui]
```

**Rendering issues:**

If `tree.render()` or `tree.show()` fails with Qt-related errors, install system dependencies:

```bash
# macOS
brew install qt@5

# Ubuntu/Debian
sudo apt-get install python3-pyqt5 python3-pyqt5.qtsvg
```

**NCBI Taxonomy database:**

If database download fails or becomes corrupted:

```python
from ete3 import NCBITaxa
ncbi = NCBITaxa()
ncbi.update_taxonomy_database()  # Redownload database
```

**Memory issues with large trees:**

For very large trees (>10,000 leaves), use iterators instead of list comprehensions:

```python
# Memory-efficient iteration
for leaf in tree.iter_leaves():
    process(leaf)

# Instead of
for leaf in tree.get_leaves():  # Loads all into memory
    process(leaf)
```

## Newick Format Reference

ETE supports multiple Newick format specifications (0-100):

- **Format 0**: Flexible with branch lengths (default)
- **Format 1**: With internal node names
- **Format 2**: With bootstrap/support values
- **Format 5**: Internal node names + branch lengths
- **Format 8**: All features (names, distances, support)
- **Format 9**: Leaf names only
- **Format 100**: Topology only

Specify format when reading/writing:

```python
tree = Tree("tree.nw", format=1)
tree.write(outfile="output.nw", format=5)
```

NHX (New Hampshire eXtended) format preserves custom features:

```python
tree.write(outfile="tree.nhx", features=["habitat", "temperature", "depth"])
```

## Best Practices

1. **Preserve branch lengths**: Use `preserve_branch_length=True` when pruning for phylogenetic analysis
2. **Cache content**: Use `get_cached_content()` for repeated access to node contents on large trees
3. **Use iterators**: Employ `iter_*` methods for memory-efficient processing of large trees
4. **Choose appropriate traversal**: Postorder for bottom-up analysis, preorder for top-down
5. **Validate monophyly**: Always check returned clade type (monophyletic/paraphyletic/polyphyletic)
6. **Vector formats for publication**: Use PDF or SVG for publication figures (scalable, editable)
7. **Interactive testing**: Use `tree.show()` to test visualizations before rendering to file
8. **PhyloTree for phylogenetics**: Use PhyloTree class for gene trees and evolutionary analysis
9. **Copy method selection**: "newick" for speed, "cpickle" for full fidelity, "deepcopy" for complex objects
10. **NCBI query caching**: Store NCBI taxonomy query results to avoid repeated database access

