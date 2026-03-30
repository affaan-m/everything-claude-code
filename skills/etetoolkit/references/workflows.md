# ETE Toolkit Common Workflows

This document provides complete workflows for common tasks using the ETE Toolkit.

## Table of Contents
1. [Basic Tree Operations](#basic-tree-operations)
2. [Phylogenetic Analysis](#phylogenetic-analysis)
3. [Tree Comparison](#tree-comparison)
4. [Taxonomy Integration](#taxonomy-integration)
5. [Clustering Analysis](#clustering-analysis)
6. [Tree Visualization](#tree-visualization)

---

## Basic Tree Operations

### Loading and Exploring a Tree

```python
from ete3 import Tree

# Load tree from file
tree = Tree("my_tree.nw", format=1)

# Display ASCII representation
print(tree.get_ascii(show_internal=True))

# Get basic statistics
print(f"Number of leaves: {len(tree)}")
print(f"Total nodes: {len(list(tree.traverse()))}")
print(f"Tree depth: {tree.get_farthest_leaf()[1]}")

# List all leaf names
for leaf in tree:
    print(leaf.name)
```

### Extracting and Saving Subtrees

```python
from ete3 import Tree

tree = Tree("full_tree.nw")

# Get subtree rooted at specific node
node = tree.search_nodes(name="MyNode")[0]
subtree = node.copy()

# Save subtree to file
subtree.write(outfile="subtree.nw", format=1)

# Extract monophyletic clade
species_of_interest = ["species1", "species2", "species3"]
ancestor = tree.get_common_ancestor(species_of_interest)
clade = ancestor.copy()
clade.write(outfile="clade.nw")
```

### Pruning Trees to Specific Taxa

```python
from ete3 import Tree

tree = Tree("large_tree.nw")

# Keep only taxa of interest
taxa_to_keep = ["taxon1", "taxon2", "taxon3", "taxon4"]
tree.prune(taxa_to_keep, preserve_branch_length=True)

# Save pruned tree
tree.write(outfile="pruned_tree.nw")
```

### Rerooting Trees

```python
from ete3 import Tree

tree = Tree("unrooted_tree.nw")

# Method 1: Root by outgroup
outgroup = tree & "Outgroup_species"
tree.set_outgroup(outgroup)

# Method 2: Midpoint rooting
midpoint = tree.get_midpoint_outgroup()
tree.set_outgroup(midpoint)

# Save rooted tree
tree.write(outfile="rooted_tree.nw")
```

### Annotating Nodes with Custom Data

```python
from ete3 import Tree

tree = Tree("tree.nw")

# Add features to nodes based on metadata
metadata = {
    "species1": {"habitat": "marine", "temperature": 20},
    "species2": {"habitat": "freshwater", "temperature": 15},
}

for leaf in tree:
    if leaf.name in metadata:
        leaf.add_features(**metadata[leaf.name])

# Query annotated features
for leaf in tree:
    if hasattr(leaf, "habitat"):
        print(f"{leaf.name}: {leaf.habitat}, {leaf.temperature}°C")

# Save with custom features (NHX format)
tree.write(outfile="annotated_tree.nhx", features=["habitat", "temperature"])
```

### Modifying Tree Topology

```python
from ete3 import Tree

tree = Tree("tree.nw")

# Remove a clade
node_to_remove = tree & "unwanted_clade"
node_to_remove.detach()

# Collapse a node (delete but keep children)
node_to_collapse = tree & "low_support_node"
node_to_collapse.delete()

# Add a new species to existing clade
target_clade = tree & "target_node"
new_leaf = target_clade.add_child(name="new_species", dist=0.5)

# Resolve polytomies
tree.resolve_polytomy(recursive=True)

# Save modified tree
tree.write(outfile="modified_tree.nw")
```

---

## Phylogenetic Analysis

### Complete Gene Tree Analysis with Alignment

```python
from ete3 import PhyloTree

# Load gene tree and link alignment
tree = PhyloTree("gene_tree.nw", format=1)
tree.link_to_alignment("alignment.fasta", alg_format="fasta")

# Set species naming function (e.g., gene_species format)
def extract_species(node_name):
    return node_name.split("_")[0]

tree.set_species_naming_function(extract_species)

# Access sequences
for leaf in tree:
    print(f"{leaf.name} ({leaf.species})")
    print(f"Sequence: {leaf.sequence[:50]}...")
```

### Detecting Duplication and Speciation Events

```python
from ete3 import PhyloTree, Tree

# Load gene tree
gene_tree = PhyloTree("gene_tree.nw")

# Set species naming
gene_tree.set_species_naming_function(lambda x: x.split("_")[0])

# Option 1: Species Overlap algorithm (no species tree needed)
events = gene_tree.get_descendant_evol_events()

# Option 2: Tree reconciliation (requires species tree)
species_tree = Tree("species_tree.nw")
events = gene_tree.get_descendant_evol_events(species_tree=species_tree)

# Analyze events
duplications = 0
speciations = 0

for node in gene_tree.traverse():
    if hasattr(node, "evoltype"):
        if node.evoltype == "D":
            duplications += 1
            print(f"Duplication at node {node.name}")
        elif node.evoltype == "S":
            speciations += 1

print(f"\nTotal duplications: {duplications}")
print(f"Total speciations: {speciations}")
```

### Extracting Orthologs and Paralogs

```python
from ete3 import PhyloTree

gene_tree = PhyloTree("gene_tree.nw")
gene_tree.set_species_naming_function(lambda x: x.split("_")[0])

# Detect evolutionary events
events = gene_tree.get_descendant_evol_events()

# Find all orthologs to a query gene
query_gene = gene_tree & "species1_gene1"

orthologs = []
paralogs = []

for event in events:
    if query_gene in event.in_seqs:
        if event.etype == "S":  # Speciation
            orthologs.extend([s for s in event.out_seqs if s != query_gene])
        elif event.etype == "D":  # Duplication
            paralogs.extend([s for s in event.out_seqs if s != query_gene])

print(f"Orthologs of {query_gene.name}:")
for ortholog in set(orthologs):
    print(f"  {ortholog.name}")

print(f"\nParalogs of {query_gene.name}:")
for paralog in set(paralogs):
    print(f"  {paralog.name}")
```

### Splitting Gene Families by Duplication Events

```python
from ete3 import PhyloTree

gene_tree = PhyloTree("gene_family.nw")
gene_tree.set_species_naming_function(lambda x: x.split("_")[0])
gene_tree.get_descendant_evol_events()

# Split into individual gene families
subfamilies = gene_tree.split_by_dups()

print(f"Gene family split into {len(subfamilies)} subfamilies")

for i, subtree in enumerate(subfamilies):
    subtree.write(outfile=f"subfamily_{i}.nw")
    species = set([leaf.species for leaf in subtree])
    print(f"Subfamily {i}: {len(subtree)} genes from {len(species)} species")
```

### Collapsing Lineage-Specific Expansions

```python
from ete3 import PhyloTree

gene_tree = PhyloTree("expanded_tree.nw")
gene_tree.set_species_naming_function(lambda x: x.split("_")[0])

# Collapse lineage-specific duplications
gene_tree.collapse_lineage_specific_expansions()

print("After collapsing expansions:")
print(gene_tree.get_ascii())

gene_tree.write(outfile="collapsed_tree.nw")
```

### Testing Monophyly

```python
from ete3 import Tree

tree = Tree("tree.nw")

# Test if a group is monophyletic
target_species = ["species1", "species2", "species3"]
is_mono, clade_type, base_node = tree.check_monophyly(
    values=target_species,
    target_attr="name"
)

if is_mono:
    print(f"Group is monophyletic")
    print(f"MRCA: {base_node.name}")
elif clade_type == "paraphyletic":
    print(f"Group is paraphyletic")
elif clade_type == "polyphyletic":
    print(f"Group is polyphyletic")

# Get all monophyletic clades of a specific type
# Annotate leaves first
for leaf in tree:
    if leaf.name.startswith("species"):
        leaf.add_feature("type", "typeA")
    else:
        leaf.add_feature("type", "typeB")

mono_clades = tree.get_monophyletic(values=["typeA"], target_attr="type")
print(f"Found {len(mono_clades)} monophyletic clades of typeA")
```

---

## Tree Comparison

### Computing Robinson-Foulds Distance

```python
from ete3 import Tree

tree1 = Tree("tree1.nw")
tree2 = Tree("tree2.nw")

# Compute RF distance
rf, max_rf, common_leaves, parts_t1, parts_t2 = tree1.robinson_foulds(tree2)

print(f"Robinson-Foulds distance: {rf}")
print(f"Maximum RF distance: {max_rf}")
print(f"Normalized RF: {rf/max_rf:.3f}")
print(f"Common leaves: {len(common_leaves)}")

# Find unique partitions
unique_in_t1 = parts_t1 - parts_t2
unique_in_t2 = parts_t2 - parts_t1

print(f"\nPartitions unique to tree1: {len(unique_in_t1)}")
print(f"Partitions unique to tree2: {len(unique_in_t2)}")
```

### Comparing Multiple Trees

```python
from ete3 import Tree
import numpy as np

# Load multiple trees
tree_files = ["tree1.nw", "tree2.nw", "tree3.nw", "tree4.nw"]
trees = [Tree(f) for f in tree_files]

# Create distance matrix
n = len(trees)
dist_matrix = np.zeros((n, n))

for i in range(n):
    for j in range(i+1, n):
        rf, max_rf, _, _, _ = trees[i].robinson_foulds(trees[j])
        norm_rf = rf / max_rf if max_rf > 0 else 0
        dist_matrix[i, j] = norm_rf
        dist_matrix[j, i] = norm_rf

print("Normalized RF distance matrix:")
print(dist_matrix)

# Find most similar pair
min_dist = float('inf')
best_pair = None

for i in range(n):
    for j in range(i+1, n):
        if dist_matrix[i, j] < min_dist:
            min_dist = dist_matrix[i, j]
            best_pair = (i, j)

print(f"\nMost similar trees: {tree_files[best_pair[0]]} and {tree_files[best_pair[1]]}")
print(f"Distance: {min_dist:.3f}")
```

### Finding Consensus Topology

```python
from ete3 import Tree

# Load multiple bootstrap trees
bootstrap_trees = [Tree(f"bootstrap_{i}.nw") for i in range(100)]

# Get reference tree (first tree)
ref_tree = bootstrap_trees[0].copy()

# Count bipartitions
bipartition_counts = {}

for tree in bootstrap_trees:
    rf, max_rf, common, parts_ref, parts_tree = ref_tree.robinson_foulds(tree)
    for partition in parts_tree:
        bipartition_counts[partition] = bipartition_counts.get(partition, 0) + 1

# Filter by support threshold
threshold = 70  # 70% support
supported_bipartitions = {
    k: v for k, v in bipartition_counts.items()
    if (v / len(bootstrap_trees)) * 100 >= threshold
}

print(f"Bipartitions with >{threshold}% support: {len(supported_bipartitions)}")
```

---

## Taxonomy Integration

### Building Species Trees from NCBI Taxonomy

```python
from ete3 import NCBITaxa

ncbi = NCBITaxa()

# Define species of interest
species = ["Homo sapiens", "Pan troglodytes", "Gorilla gorilla",
           "Mus musculus", "Rattus norvegicus"]

# Get taxids
name2taxid = ncbi.get_name_translator(species)
taxids = [name2taxid[sp][0] for sp in species]

# Build tree
tree = ncbi.get_topology(taxids)

# Annotate with taxonomy info
for node in tree.traverse():
    if hasattr(node, "sci_name"):
        print(f"{node.sci_name} - Rank: {node.rank} - TaxID: {node.taxid}")

# Save tree
tree.write(outfile="species_tree.nw")
```

### Annotating Existing Tree with NCBI Taxonomy

```python
from ete3 import Tree, NCBITaxa

tree = Tree("species_tree.nw")
ncbi = NCBITaxa()

# Map leaf names to species names (adjust as needed)
leaf_to_species = {
    "Hsap_gene1": "Homo sapiens",
    "Ptro_gene1": "Pan troglodytes",
    "Mmur_gene1": "Microcebus murinus",
}

# Get taxids
all_species = list(set(leaf_to_species.values()))
name2taxid = ncbi.get_name_translator(all_species)

# Annotate leaves
for leaf in tree:
    if leaf.name in leaf_to_species:
        species_name = leaf_to_species[leaf.name]
        taxid = name2taxid[species_name][0]

        # Add taxonomy info
        leaf.add_feature("species", species_name)
        leaf.add_feature("taxid", taxid)

        # Get full lineage
        lineage = ncbi.get_lineage(taxid)
        names = ncbi.get_taxid_translator(lineage)
        leaf.add_feature("lineage", [names[t] for t in lineage])

        print(f"{leaf.name}: {species_name} (taxid: {taxid})")
```

### Querying NCBI Taxonomy

```python
from ete3 import NCBITaxa

ncbi = NCBITaxa()

# Get all primates
primates_taxid = ncbi.get_name_translator(["Primates"])["Primates"][0]
all_primates = ncbi.get_descendant_taxa(primates_taxid, collapse_subspecies=True)

print(f"Total primate species: {len(all_primates)}")

# Get names for subset
taxid2name = ncbi.get_taxid_translator(all_primates[:10])
for taxid, name in taxid2name.items():
    rank = ncbi.get_rank([taxid])[taxid]
    print(f"{name} ({rank})")

# Get lineage for specific species
human_taxid = 9606
lineage = ncbi.get_lineage(human_taxid)
ranks = ncbi.get_rank(lineage)
names = ncbi.get_taxid_translator(lineage)

print("\nHuman lineage:")
for taxid in lineage:
    print(f"{ranks[taxid]:15s} {names[taxid]}")
```

---

## Clustering Analysis

### Analyzing Hierarchical Clustering Results

```python
from ete3 import ClusterTree

# Load clustering tree with data matrix
matrix = """#Names\tSample1\tSample2\tSample3\tSample4
Gene1\t1.5\t2.3\t0.8\t1.2
Gene2\t0.9\t1.1\t1.8\t2.1
Gene3\t2.1\t2.5\t0.5\t0.9
Gene4\t0.7\t0.9\t2.2\t2.4"""

tree = ClusterTree("((Gene1,Gene2),(Gene3,Gene4));", text_array=matrix)

# Calculate cluster quality metrics
for node in tree.traverse():
    if not node.is_leaf():
        # Silhouette coefficient
        silhouette = node.get_silhouette()

        # Dunn index
        dunn = node.get_dunn()

        # Distances
        inter = node.intercluster_dist
        intra = node.intracluster_dist

        print(f"Node: {node.name}")
        print(f"  Silhouette: {silhouette:.3f}")
        print(f"  Dunn index: {dunn:.3f}")
        print(f"  Intercluster distance: {inter:.3f}")
        print(f"  Intracluster distance: {intra:.3f}")
```

### Validating Clusters

```python
from ete3 import ClusterTree

matrix = """#Names\tCol1\tCol2\tCol3
ItemA\t1.2\t0.5\t0.8
ItemB\t1.3\t0.6\t0.9
ItemC\t0.1\t2.5\t2.3
ItemD\t0.2\t2.6\t2.4"""

tree = ClusterTree("((ItemA,ItemB),(ItemC,ItemD));", text_array=matrix)

# Test different distance metrics
metrics = ["euclidean", "pearson", "spearman"]

for metric in metrics:
    print(f"\nUsing {metric} distance:")

    for node in tree.traverse():
        if not node.is_leaf():
            silhouette = node.get_silhouette(distance=metric)

            # Positive silhouette = good clustering
            # Negative silhouette = poor clustering
            quality = "good" if silhouette > 0 else "poor"

            print(f"  Cluster {node.name}: {silhouette:.3f} ({quality})")
```

---

## Tree Visualization

### Basic Tree Rendering

```python
from ete3 import Tree, TreeStyle

tree = Tree("tree.nw")

# Create tree style
ts = TreeStyle()
ts.show_leaf_name = True
ts.show_branch_length = True
ts.show_branch_support = True
ts.scale = 50  # pixels per branch length unit

# Render to file
tree.render("tree_output.pdf", tree_style=ts)
tree.render("tree_output.png", tree_style=ts, w=800, h=600, units="px")
tree.render("tree_output.svg", tree_style=ts)
```

### Customizing Node Appearance

```python
from ete3 import Tree, TreeStyle, NodeStyle

tree = Tree("tree.nw")

# Define node styles
for node in tree.traverse():
    nstyle = NodeStyle()

    if node.is_leaf():
        nstyle["fgcolor"] = "blue"
        nstyle["size"] = 10
    else:
        nstyle["fgcolor"] = "red"
        nstyle["size"] = 5

    if node.support > 0.9:
        nstyle["shape"] = "sphere"
    else:
        nstyle["shape"] = "circle"

    node.set_style(nstyle)

# Render
ts = TreeStyle()
tree.render("styled_tree.pdf", tree_style=ts)
```

### Adding Faces to Nodes

```python
from ete3 import Tree, TreeStyle, TextFace, CircleFace, AttrFace

tree = Tree("tree.nw")

# Add features to nodes
for leaf in tree:
    leaf.add_feature("habitat", "marine" if "fish" in leaf.name else "terrestrial")
    leaf.add_feature("temp", 20)

# Layout function to add faces
def layout(node):
    if node.is_leaf():
        # Add text face
        name_face = TextFace(node.name, fsize=10)
        node.add_face(name_face, column=0, position="branch-right")

        # Add colored circle based on habitat
        color = "blue" if node.habitat == "marine" else "green"
        circle_face = CircleFace(radius=5, color=color)
        node.add_face(circle_face, column=1, position="branch-right")

        # Add attribute face
        temp_face = AttrFace("temp", fsize=8)
        node.add_face(temp_face, column=2, position="branch-right")

ts = TreeStyle()
ts.layout_fn = layout
ts.show_leaf_name = False  # We're adding custom names

tree.render("tree_with_faces.pdf", tree_style=ts)
```

### Circular Tree Layout

```python
from ete3 import Tree, TreeStyle

tree = Tree("tree.nw")

ts = TreeStyle()
ts.mode = "c"  # Circular mode
ts.arc_start = 0  # Degrees
ts.arc_span = 360  # Full circle
ts.show_leaf_name = True

tree.render("circular_tree.pdf", tree_style=ts)
```

### Interactive Exploration

```python
from ete3 import Tree

tree = Tree("tree.nw")

# Launch GUI (allows zooming, searching, modifying)
# Changes persist after closing
tree.show()

# Can save changes made in GUI
tree.write(outfile="modified_tree.nw")
```

---

## Advanced Workflows

### Complete Phylogenomic Pipeline

```python
from ete3 import PhyloTree, NCBITaxa, TreeStyle

# 1. Load gene tree
gene_tree = PhyloTree("gene_tree.nw", alignment="alignment.fasta")

# 2. Set species naming
gene_tree.set_species_naming_function(lambda x: x.split("_")[0])

# 3. Detect evolutionary events
gene_tree.get_descendant_evol_events()

# 4. Annotate with NCBI taxonomy
ncbi = NCBITaxa()
species_set = set([leaf.species for leaf in gene_tree])
name2taxid = ncbi.get_name_translator(list(species_set))

for leaf in gene_tree:
    if leaf.species in name2taxid:
        taxid = name2taxid[leaf.species][0]
        lineage = ncbi.get_lineage(taxid)
        names = ncbi.get_taxid_translator(lineage)
        leaf.add_feature("lineage", [names[t] for t in lineage])

# 5. Identify and save ortholog groups
ortho_groups = gene_tree.get_speciation_trees()

for i, ortho_tree in enumerate(ortho_groups):
    ortho_tree.write(outfile=f"ortholog_group_{i}.nw")

# 6. Visualize with evolutionary events marked
def layout(node):
    from ete3 import TextFace
    if hasattr(node, "evoltype"):
        if node.evoltype == "D":
            dup_face = TextFace("DUPLICATION", fsize=8, fgcolor="red")
            node.add_face(dup_face, column=0, position="branch-top")

ts = TreeStyle()
ts.layout_fn = layout
ts.show_leaf_name = True
gene_tree.render("annotated_gene_tree.pdf", tree_style=ts)

print(f"Pipeline complete. Found {len(ortho_groups)} ortholog groups.")
```

### Batch Processing Multiple Trees

```python
from ete3 import Tree
import os

input_dir = "input_trees"
output_dir = "processed_trees"
os.makedirs(output_dir, exist_ok=True)

for filename in os.listdir(input_dir):
    if filename.endswith(".nw"):
        # Load tree
        tree = Tree(os.path.join(input_dir, filename))

        # Process: root, prune, annotate
        midpoint = tree.get_midpoint_outgroup()
        tree.set_outgroup(midpoint)

        # Filter by branch length
        to_remove = []
        for node in tree.traverse():
            if node.dist < 0.001 and not node.is_root():
                to_remove.append(node)

        for node in to_remove:
            node.delete()

        # Save processed tree
        output_file = os.path.join(output_dir, f"processed_{filename}")
        tree.write(outfile=output_file)

        print(f"Processed {filename}")
```
