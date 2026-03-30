# Phylogenetics with Bio.Phylo

## Overview

Bio.Phylo provides a unified toolkit for reading, writing, analyzing, and visualizing phylogenetic trees. It supports multiple file formats including Newick, NEXUS, phyloXML, NeXML, and CDAO.

## Supported File Formats

- **Newick** - Simple tree representation (most common)
- **NEXUS** - Extended format with additional data
- **phyloXML** - XML-based format with rich annotations
- **NeXML** - Modern XML format
- **CDAO** - Comparative Data Analysis Ontology

## Reading and Writing Trees

### Reading Trees

```python
from Bio import Phylo

# Read a tree from file
tree = Phylo.read("tree.nwk", "newick")

# Parse multiple trees from a file
trees = list(Phylo.parse("trees.nwk", "newick"))
print(f"Found {len(trees)} trees")
```

### Writing Trees

```python
# Write tree to file
Phylo.write(tree, "output.nwk", "newick")

# Write multiple trees
Phylo.write(trees, "output.nex", "nexus")
```

### Format Conversion

```python
# Convert between formats
count = Phylo.convert("input.nwk", "newick", "output.xml", "phyloxml")
print(f"Converted {count} trees")
```

## Tree Structure and Navigation

### Basic Tree Components

Trees consist of:
- **Clade** - A node (internal or terminal) in the tree
- **Terminal clades** - Leaves/tips (taxa)
- **Internal clades** - Internal nodes
- **Branch length** - Evolutionary distance

### Accessing Tree Properties

```python
# Tree root
root = tree.root

# Terminal nodes (leaves)
terminals = tree.get_terminals()
print(f"Number of taxa: {len(terminals)}")

# Non-terminal nodes
nonterminals = tree.get_nonterminals()
print(f"Number of internal nodes: {len(nonterminals)}")

# All clades
all_clades = list(tree.find_clades())
print(f"Total clades: {len(all_clades)}")
```

### Traversing Trees

```python
# Iterate through all clades
for clade in tree.find_clades():
    if clade.name:
        print(f"Clade: {clade.name}, Branch length: {clade.branch_length}")

# Iterate through terminals only
for terminal in tree.get_terminals():
    print(f"Taxon: {terminal.name}")

# Depth-first traversal
for clade in tree.find_clades(order="preorder"):
    print(clade.name)

# Level-order (breadth-first) traversal
for clade in tree.find_clades(order="level"):
    print(clade.name)
```

### Finding Specific Clades

```python
# Find clade by name
clade = tree.find_any(name="Species_A")

# Find all clades matching criteria
def is_long_branch(clade):
    return clade.branch_length and clade.branch_length > 0.5

long_branches = tree.find_clades(is_long_branch)
```

## Tree Analysis

### Tree Statistics

```python
# Total branch length
total_length = tree.total_branch_length()
print(f"Total tree length: {total_length:.3f}")

# Tree depth (root to furthest leaf)
depths = tree.depths()
max_depth = max(depths.values())
print(f"Maximum depth: {max_depth:.3f}")

# Terminal count
terminal_count = tree.count_terminals()
print(f"Number of taxa: {terminal_count}")
```

### Distance Calculations

```python
# Distance between two taxa
distance = tree.distance("Species_A", "Species_B")
print(f"Distance: {distance:.3f}")

# Create distance matrix
from Bio import Phylo

terminals = tree.get_terminals()
taxa_names = [t.name for t in terminals]

print("Distance Matrix:")
for taxon1 in taxa_names:
    row = []
    for taxon2 in taxa_names:
        if taxon1 == taxon2:
            row.append(0)
        else:
            dist = tree.distance(taxon1, taxon2)
            row.append(dist)
    print(f"{taxon1}: {row}")
```

### Common Ancestors

```python
# Find common ancestor of two clades
clade1 = tree.find_any(name="Species_A")
clade2 = tree.find_any(name="Species_B")
ancestor = tree.common_ancestor(clade1, clade2)
print(f"Common ancestor: {ancestor.name}")

# Find common ancestor of multiple clades
clades = [tree.find_any(name=n) for n in ["Species_A", "Species_B", "Species_C"]]
ancestor = tree.common_ancestor(*clades)
```

### Tree Comparison

```python
# Compare tree topologies
def compare_trees(tree1, tree2):
    """Compare two trees."""
    # Get terminal names
    taxa1 = set(t.name for t in tree1.get_terminals())
    taxa2 = set(t.name for t in tree2.get_terminals())

    # Check if they have same taxa
    if taxa1 != taxa2:
        return False, "Different taxa"

    # Compare distances
    differences = []
    for taxon1 in taxa1:
        for taxon2 in taxa1:
            if taxon1 < taxon2:
                dist1 = tree1.distance(taxon1, taxon2)
                dist2 = tree2.distance(taxon1, taxon2)
                if abs(dist1 - dist2) > 0.01:
                    differences.append((taxon1, taxon2, dist1, dist2))

    return len(differences) == 0, differences
```

## Tree Manipulation

### Pruning Trees

```python
# Prune (remove) specific taxa
tree_copy = tree.copy()
tree_copy.prune("Species_A")

# Keep only specific taxa
taxa_to_keep = ["Species_B", "Species_C", "Species_D"]
terminals = tree_copy.get_terminals()
for terminal in terminals:
    if terminal.name not in taxa_to_keep:
        tree_copy.prune(terminal)
```

### Collapsing Short Branches

```python
# Collapse branches shorter than threshold
def collapse_short_branches(tree, threshold=0.01):
    """Collapse branches shorter than threshold."""
    for clade in tree.find_clades():
        if clade.branch_length and clade.branch_length < threshold:
            clade.branch_length = 0
    return tree
```

### Ladderizing Trees

```python
# Ladderize tree (sort branches by size)
tree.ladderize()  # ascending order
tree.ladderize(reverse=True)  # descending order
```

### Rerooting Trees

```python
# Reroot at midpoint
tree.root_at_midpoint()

# Reroot with outgroup
outgroup = tree.find_any(name="Outgroup_Species")
tree.root_with_outgroup(outgroup)

# Reroot at internal node
internal = tree.get_nonterminals()[0]
tree.root_with_outgroup(internal)
```

## Tree Visualization

### Basic ASCII Drawing

```python
# Draw tree to console
Phylo.draw_ascii(tree)

# Draw with custom format
Phylo.draw_ascii(tree, column_width=80)
```

### Matplotlib Visualization

```python
import matplotlib.pyplot as plt
from Bio import Phylo

# Simple plot
fig = plt.figure(figsize=(10, 8))
axes = fig.add_subplot(1, 1, 1)
Phylo.draw(tree, axes=axes)
plt.show()

# Customize plot
fig = plt.figure(figsize=(10, 8))
axes = fig.add_subplot(1, 1, 1)
Phylo.draw(tree, axes=axes, do_show=False)
axes.set_title("Phylogenetic Tree")
plt.tight_layout()
plt.savefig("tree.png", dpi=300)
```

### Advanced Visualization Options

```python
# Radial (circular) tree
Phylo.draw(tree, branch_labels=lambda c: c.branch_length)

# Show branch support values
Phylo.draw(tree, label_func=lambda n: str(n.confidence) if n.confidence else "")

# Color branches
def color_by_length(clade):
    if clade.branch_length:
        if clade.branch_length > 0.5:
            return "red"
        elif clade.branch_length > 0.2:
            return "orange"
    return "black"

# Note: Direct branch coloring requires custom matplotlib code
```

## Building Trees

### From Distance Matrix

```python
from Bio.Phylo.TreeConstruction import DistanceTreeConstructor, DistanceMatrix

# Create distance matrix
dm = DistanceMatrix(
    names=["Alpha", "Beta", "Gamma", "Delta"],
    matrix=[
        [],
        [0.23],
        [0.45, 0.34],
        [0.67, 0.58, 0.29]
    ]
)

# Build tree using UPGMA
constructor = DistanceTreeConstructor()
tree = constructor.upgma(dm)
Phylo.draw_ascii(tree)

# Build tree using Neighbor-Joining
tree = constructor.nj(dm)
```

### From Multiple Sequence Alignment

```python
from Bio import AlignIO, Phylo
from Bio.Phylo.TreeConstruction import DistanceCalculator, DistanceTreeConstructor

# Read alignment
alignment = AlignIO.read("alignment.fasta", "fasta")

# Calculate distance matrix
calculator = DistanceCalculator("identity")
distance_matrix = calculator.get_distance(alignment)

# Build tree
constructor = DistanceTreeConstructor()
tree = constructor.upgma(distance_matrix)

# Write tree
Phylo.write(tree, "output_tree.nwk", "newick")
```

### Distance Models

Available distance calculation models:
- **identity** - Simple identity
- **blastn** - BLASTN identity
- **trans** - Transition/transversion ratio
- **blosum62** - BLOSUM62 matrix
- **pam250** - PAM250 matrix

```python
# Use different model
calculator = DistanceCalculator("blosum62")
dm = calculator.get_distance(alignment)
```

## Consensus Trees

```python
from Bio.Phylo.Consensus import majority_consensus, strict_consensus

# Read multiple trees
trees = list(Phylo.parse("bootstrap_trees.nwk", "newick"))

# Majority-rule consensus
consensus = majority_consensus(trees, cutoff=0.5)

# Strict consensus
strict_cons = strict_consensus(trees)

# Write consensus tree
Phylo.write(consensus, "consensus.nwk", "newick")
```

## PhyloXML Features

PhyloXML format supports rich annotations:

```python
from Bio.Phylo.PhyloXML import Phylogeny, Clade

# Create PhyloXML tree
tree = Phylogeny(rooted=True)
tree.name = "Example Tree"
tree.description = "A sample phylogenetic tree"

# Add clades with rich annotations
clade = Clade(branch_length=0.5)
clade.name = "Species_A"
clade.color = "red"
clade.width = 2.0

# Add taxonomy information
from Bio.Phylo.PhyloXML import Taxonomy
taxonomy = Taxonomy(scientific_name="Homo sapiens", common_name="Human")
clade.taxonomies.append(taxonomy)
```

## Bootstrap Support

```python
# Add bootstrap support values to tree
def add_bootstrap_support(tree, support_values):
    """Add bootstrap support to internal nodes."""
    internal_nodes = tree.get_nonterminals()
    for node, support in zip(internal_nodes, support_values):
        node.confidence = support
    return tree

# Example
support_values = [95, 87, 76, 92]
tree_with_support = add_bootstrap_support(tree, support_values)
```

## Best Practices

1. **Choose appropriate file format** - Newick for simple trees, phyloXML for annotations
2. **Validate tree topology** - Check for polytomies and negative branch lengths
3. **Root trees appropriately** - Use midpoint or outgroup rooting
4. **Handle bootstrap values** - Store as clade confidence
5. **Consider tree size** - Large trees may need special handling
6. **Use tree copies** - Call `.copy()` before modifications
7. **Export publication-ready figures** - Use matplotlib for high-quality output
8. **Document tree construction** - Record alignment and parameters used
9. **Compare multiple trees** - Use consensus methods for bootstrap trees
10. **Validate taxon names** - Ensure consistent naming across files

## Common Use Cases

### Build Tree from Sequences

```python
from Bio import AlignIO, Phylo
from Bio.Phylo.TreeConstruction import DistanceCalculator, DistanceTreeConstructor

# Read aligned sequences
alignment = AlignIO.read("sequences.aln", "clustal")

# Calculate distances
calculator = DistanceCalculator("identity")
dm = calculator.get_distance(alignment)

# Build neighbor-joining tree
constructor = DistanceTreeConstructor()
tree = constructor.nj(dm)

# Root at midpoint
tree.root_at_midpoint()

# Save tree
Phylo.write(tree, "tree.nwk", "newick")

# Visualize
import matplotlib.pyplot as plt
fig = plt.figure(figsize=(10, 8))
Phylo.draw(tree)
plt.show()
```

### Extract Subtree

```python
def extract_subtree(tree, taxa_list):
    """Extract subtree containing specific taxa."""
    # Create a copy
    subtree = tree.copy()

    # Get all terminals
    all_terminals = subtree.get_terminals()

    # Prune taxa not in list
    for terminal in all_terminals:
        if terminal.name not in taxa_list:
            subtree.prune(terminal)

    return subtree

# Use it
subtree = extract_subtree(tree, ["Species_A", "Species_B", "Species_C"])
Phylo.write(subtree, "subtree.nwk", "newick")
```

### Calculate Phylogenetic Diversity

```python
def phylogenetic_diversity(tree, taxa_subset=None):
    """Calculate phylogenetic diversity (sum of branch lengths)."""
    if taxa_subset:
        # Prune to subset
        tree = extract_subtree(tree, taxa_subset)

    # Sum all branch lengths
    total = 0
    for clade in tree.find_clades():
        if clade.branch_length:
            total += clade.branch_length

    return total

# Calculate PD for all taxa
pd_all = phylogenetic_diversity(tree)
print(f"Total phylogenetic diversity: {pd_all:.3f}")

# Calculate PD for subset
pd_subset = phylogenetic_diversity(tree, ["Species_A", "Species_B"])
print(f"Subset phylogenetic diversity: {pd_subset:.3f}")
```

### Annotate Tree with External Data

```python
def annotate_tree_from_csv(tree, csv_file):
    """Annotate tree leaves with data from CSV."""
    import csv

    # Read annotation data
    annotations = {}
    with open(csv_file) as f:
        reader = csv.DictReader(f)
        for row in reader:
            annotations[row["species"]] = row

    # Annotate tree
    for terminal in tree.get_terminals():
        if terminal.name in annotations:
            # Add custom attributes
            for key, value in annotations[terminal.name].items():
                setattr(terminal, key, value)

    return tree
```

### Compare Tree Topologies

```python
def robinson_foulds_distance(tree1, tree2):
    """Calculate Robinson-Foulds distance between two trees."""
    # Get bipartitions for each tree
    def get_bipartitions(tree):
        bipartitions = set()
        for clade in tree.get_nonterminals():
            terminals = frozenset(t.name for t in clade.get_terminals())
            bipartitions.add(terminals)
        return bipartitions

    bp1 = get_bipartitions(tree1)
    bp2 = get_bipartitions(tree2)

    # Symmetric difference
    diff = len(bp1.symmetric_difference(bp2))
    return diff

# Use it
tree1 = Phylo.read("tree1.nwk", "newick")
tree2 = Phylo.read("tree2.nwk", "newick")
rf_dist = robinson_foulds_distance(tree1, tree2)
print(f"Robinson-Foulds distance: {rf_dist}")
```
