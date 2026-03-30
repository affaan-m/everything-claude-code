# ETE Toolkit Visualization Guide

Complete guide to tree visualization with ETE Toolkit.

## Table of Contents
1. [Rendering Basics](#rendering-basics)
2. [TreeStyle Configuration](#treestyle-configuration)
3. [Node Styling](#node-styling)
4. [Faces](#faces)
5. [Layout Functions](#layout-functions)
6. [Advanced Visualization](#advanced-visualization)

---

## Rendering Basics

### Output Formats

ETE supports three main output formats:

```python
from ete3 import Tree

tree = Tree("tree.nw")

# PNG (raster, good for presentations)
tree.render("output.png", w=800, h=600, units="px", dpi=300)

# PDF (vector, good for publications)
tree.render("output.pdf", w=200, units="mm")

# SVG (vector, editable)
tree.render("output.svg")
```

### Units and Dimensions

```python
# Pixels
tree.render("tree.png", w=1200, h=800, units="px")

# Millimeters
tree.render("tree.pdf", w=210, h=297, units="mm")  # A4 size

# Inches
tree.render("tree.pdf", w=8.5, h=11, units="in")  # US Letter

# Auto-size (aspect ratio preserved)
tree.render("tree.pdf", w=200, units="mm")  # Height auto-calculated
```

### Interactive Visualization

```python
from ete3 import Tree

tree = Tree("tree.nw")

# Launch GUI
# - Zoom with mouse wheel
# - Pan by dragging
# - Search with Ctrl+F
# - Export from menu
# - Edit node properties
tree.show()
```

---

## TreeStyle Configuration

### Basic TreeStyle Options

```python
from ete3 import Tree, TreeStyle

tree = Tree("tree.nw")
ts = TreeStyle()

# Display options
ts.show_leaf_name = True          # Show leaf names
ts.show_branch_length = True      # Show branch lengths
ts.show_branch_support = True     # Show support values
ts.show_scale = True              # Show scale bar

# Branch length scaling
ts.scale = 50                     # Pixels per branch length unit
ts.min_leaf_separation = 10       # Minimum space between leaves (pixels)

# Layout orientation
ts.rotation = 0                   # 0=left-to-right, 90=top-to-bottom
ts.branch_vertical_margin = 10    # Vertical spacing between branches

# Tree shape
ts.mode = "r"                     # "r"=rectangular (default), "c"=circular

tree.render("tree.pdf", tree_style=ts)
```

### Circular Trees

```python
from ete3 import Tree, TreeStyle

tree = Tree("tree.nw")
ts = TreeStyle()

# Circular mode
ts.mode = "c"
ts.arc_start = 0      # Starting angle (degrees)
ts.arc_span = 360     # Angular span (degrees, 360=full circle)

# For semicircle
ts.arc_start = -180
ts.arc_span = 180

tree.render("circular_tree.pdf", tree_style=ts)
```

### Title and Legend

```python
from ete3 import Tree, TreeStyle, TextFace

tree = Tree("tree.nw")
ts = TreeStyle()

# Add title
title = TextFace("Phylogenetic Tree of Species", fsize=20, bold=True)
ts.title.add_face(title, column=0)

# Add legend
ts.legend.add_face(TextFace("Red nodes: High support", fsize=10), column=0)
ts.legend.add_face(TextFace("Blue nodes: Low support", fsize=10), column=0)

# Legend position
ts.legend_position = 1  # 1=top-right, 2=top-left, 3=bottom-left, 4=bottom-right

tree.render("tree_with_legend.pdf", tree_style=ts)
```

### Custom Background

```python
from ete3 import Tree, TreeStyle

tree = Tree("tree.nw")
ts = TreeStyle()

# Background color
ts.bgcolor = "#f0f0f0"  # Light gray background

# Tree border
ts.show_border = True

tree.render("tree_background.pdf", tree_style=ts)
```

---

## Node Styling

### NodeStyle Properties

```python
from ete3 import Tree, NodeStyle

tree = Tree("tree.nw")

for node in tree.traverse():
    nstyle = NodeStyle()

    # Node size and shape
    nstyle["size"] = 10                # Node size in pixels
    nstyle["shape"] = "circle"         # "circle", "square", "sphere"

    # Colors
    nstyle["fgcolor"] = "blue"         # Foreground color (node itself)
    nstyle["bgcolor"] = "lightblue"    # Background color (only for sphere)

    # Line style for branches
    nstyle["hz_line_type"] = 0         # 0=solid, 1=dashed, 2=dotted
    nstyle["vt_line_type"] = 0         # Vertical line type
    nstyle["hz_line_color"] = "black"  # Horizontal line color
    nstyle["vt_line_color"] = "black"  # Vertical line color
    nstyle["hz_line_width"] = 2        # Line width in pixels
    nstyle["vt_line_width"] = 2

    node.set_style(nstyle)

tree.render("styled_tree.pdf")
```

### Conditional Styling

```python
from ete3 import Tree, NodeStyle

tree = Tree("tree.nw")

# Style based on node properties
for node in tree.traverse():
    nstyle = NodeStyle()

    if node.is_leaf():
        # Leaf node style
        nstyle["size"] = 8
        nstyle["fgcolor"] = "darkgreen"
        nstyle["shape"] = "circle"
    else:
        # Internal node style based on support
        if node.support > 0.9:
            nstyle["size"] = 6
            nstyle["fgcolor"] = "red"
            nstyle["shape"] = "sphere"
        else:
            nstyle["size"] = 4
            nstyle["fgcolor"] = "gray"
            nstyle["shape"] = "circle"

    # Style branches by length
    if node.dist > 1.0:
        nstyle["hz_line_width"] = 3
        nstyle["hz_line_color"] = "blue"
    else:
        nstyle["hz_line_width"] = 1
        nstyle["hz_line_color"] = "black"

    node.set_style(nstyle)

tree.render("conditional_styled_tree.pdf")
```

### Hiding Nodes

```python
from ete3 import Tree, NodeStyle

tree = Tree("tree.nw")

# Hide specific nodes
for node in tree.traverse():
    if node.support < 0.5:  # Hide low support nodes
        nstyle = NodeStyle()
        nstyle["draw_descendants"] = False  # Don't draw this node's subtree
        nstyle["size"] = 0                   # Make node invisible
        node.set_style(nstyle)

tree.render("filtered_tree.pdf")
```

---

## Faces

Faces are graphical elements attached to nodes. They appear at specific positions around nodes.

### Face Positions

- `"branch-right"`: Right side of branch (after node)
- `"branch-top"`: Above branch
- `"branch-bottom"`: Below branch
- `"aligned"`: Aligned column at tree edge (for leaves)

### TextFace

```python
from ete3 import Tree, TreeStyle, TextFace

tree = Tree("tree.nw")

def layout(node):
    if node.is_leaf():
        # Add species name
        name_face = TextFace(node.name, fsize=12, fgcolor="black")
        node.add_face(name_face, column=0, position="branch-right")

        # Add additional text
        info_face = TextFace(f"Length: {node.dist:.3f}", fsize=8, fgcolor="gray")
        node.add_face(info_face, column=1, position="branch-right")
    else:
        # Add support value
        if node.support:
            support_face = TextFace(f"{node.support:.2f}", fsize=8, fgcolor="red")
            node.add_face(support_face, column=0, position="branch-top")

ts = TreeStyle()
ts.layout_fn = layout
ts.show_leaf_name = False  # We're adding custom names

tree.render("tree_textfaces.pdf", tree_style=ts)
```

### AttrFace

Display node attributes directly:

```python
from ete3 import Tree, TreeStyle, AttrFace

tree = Tree("tree.nw")

# Add custom attributes
for leaf in tree:
    leaf.add_feature("habitat", "aquatic" if "fish" in leaf.name else "terrestrial")
    leaf.add_feature("temperature", 20)

def layout(node):
    if node.is_leaf():
        # Display attribute directly
        habitat_face = AttrFace("habitat", fsize=10)
        node.add_face(habitat_face, column=0, position="aligned")

        temp_face = AttrFace("temperature", fsize=10)
        node.add_face(temp_face, column=1, position="aligned")

ts = TreeStyle()
ts.layout_fn = layout

tree.render("tree_attrfaces.pdf", tree_style=ts)
```

### CircleFace

```python
from ete3 import Tree, TreeStyle, CircleFace, TextFace

tree = Tree("tree.nw")

# Annotate with habitat
for leaf in tree:
    leaf.add_feature("habitat", "marine" if "fish" in leaf.name else "land")

def layout(node):
    if node.is_leaf():
        # Colored circle based on habitat
        color = "blue" if node.habitat == "marine" else "green"
        circle = CircleFace(radius=5, color=color, style="circle")
        node.add_face(circle, column=0, position="aligned")

        # Label
        name = TextFace(node.name, fsize=10)
        node.add_face(name, column=1, position="aligned")

ts = TreeStyle()
ts.layout_fn = layout
ts.show_leaf_name = False

tree.render("tree_circles.pdf", tree_style=ts)
```

### ImgFace

Add images to nodes:

```python
from ete3 import Tree, TreeStyle, ImgFace, TextFace

tree = Tree("tree.nw")

def layout(node):
    if node.is_leaf():
        # Add species image
        img_path = f"images/{node.name}.png"  # Path to image
        try:
            img_face = ImgFace(img_path, width=50, height=50)
            node.add_face(img_face, column=0, position="aligned")
        except:
            pass  # Skip if image doesn't exist

        # Add name
        name_face = TextFace(node.name, fsize=10)
        node.add_face(name_face, column=1, position="aligned")

ts = TreeStyle()
ts.layout_fn = layout
ts.show_leaf_name = False

tree.render("tree_images.pdf", tree_style=ts)
```

### BarChartFace

```python
from ete3 import Tree, TreeStyle, BarChartFace, TextFace

tree = Tree("tree.nw")

# Add data for bar charts
for leaf in tree:
    leaf.add_feature("values", [1.2, 2.3, 0.5, 1.8])  # Multiple values

def layout(node):
    if node.is_leaf():
        # Add bar chart
        chart = BarChartFace(
            node.values,
            width=100,
            height=40,
            colors=["red", "blue", "green", "orange"],
            labels=["A", "B", "C", "D"]
        )
        node.add_face(chart, column=0, position="aligned")

        # Add name
        name = TextFace(node.name, fsize=10)
        node.add_face(name, column=1, position="aligned")

ts = TreeStyle()
ts.layout_fn = layout
ts.show_leaf_name = False

tree.render("tree_barcharts.pdf", tree_style=ts)
```

### PieChartFace

```python
from ete3 import Tree, TreeStyle, PieChartFace, TextFace

tree = Tree("tree.nw")

# Add data
for leaf in tree:
    leaf.add_feature("proportions", [25, 35, 40])  # Percentages

def layout(node):
    if node.is_leaf():
        # Add pie chart
        pie = PieChartFace(
            node.proportions,
            width=30,
            height=30,
            colors=["red", "blue", "green"]
        )
        node.add_face(pie, column=0, position="aligned")

        name = TextFace(node.name, fsize=10)
        node.add_face(name, column=1, position="aligned")

ts = TreeStyle()
ts.layout_fn = layout
ts.show_leaf_name = False

tree.render("tree_piecharts.pdf", tree_style=ts)
```

### SequenceFace (for alignments)

```python
from ete3 import PhyloTree, TreeStyle, SeqMotifFace

tree = PhyloTree("tree.nw")
tree.link_to_alignment("alignment.fasta")

def layout(node):
    if node.is_leaf():
        # Display sequence
        seq_face = SeqMotifFace(node.sequence, seq_format="seq")
        node.add_face(seq_face, column=0, position="aligned")

ts = TreeStyle()
ts.layout_fn = layout
ts.show_leaf_name = True

tree.render("tree_alignment.pdf", tree_style=ts)
```

---

## Layout Functions

Layout functions are Python functions that modify node appearance during rendering.

### Basic Layout Function

```python
from ete3 import Tree, TreeStyle, TextFace

tree = Tree("tree.nw")

def my_layout(node):
    """Called for every node before rendering"""

    if node.is_leaf():
        # Add text to leaves
        name_face = TextFace(node.name.upper(), fsize=12, fgcolor="blue")
        node.add_face(name_face, column=0, position="branch-right")
    else:
        # Add support to internal nodes
        if node.support:
            support_face = TextFace(f"BS: {node.support:.0f}", fsize=8)
            node.add_face(support_face, column=0, position="branch-top")

# Apply layout function
ts = TreeStyle()
ts.layout_fn = my_layout
ts.show_leaf_name = False

tree.render("tree_custom_layout.pdf", tree_style=ts)
```

### Dynamic Styling in Layout

```python
from ete3 import Tree, TreeStyle, NodeStyle, TextFace

tree = Tree("tree.nw")

def layout(node):
    # Modify node style dynamically
    nstyle = NodeStyle()

    # Color by clade
    if "clade_A" in [l.name for l in node.get_leaves()]:
        nstyle["bgcolor"] = "lightblue"
    elif "clade_B" in [l.name for l in node.get_leaves()]:
        nstyle["bgcolor"] = "lightgreen"

    node.set_style(nstyle)

    # Add faces based on features
    if hasattr(node, "annotation"):
        text = TextFace(node.annotation, fsize=8)
        node.add_face(text, column=0, position="branch-top")

ts = TreeStyle()
ts.layout_fn = layout

tree.render("tree_dynamic.pdf", tree_style=ts)
```

### Multiple Column Layout

```python
from ete3 import Tree, TreeStyle, TextFace, CircleFace

tree = Tree("tree.nw")

# Add features
for leaf in tree:
    leaf.add_feature("habitat", "aquatic")
    leaf.add_feature("temp", 20)
    leaf.add_feature("depth", 100)

def layout(node):
    if node.is_leaf():
        # Column 0: Name
        name = TextFace(node.name, fsize=10)
        node.add_face(name, column=0, position="aligned")

        # Column 1: Habitat indicator
        color = "blue" if node.habitat == "aquatic" else "brown"
        circle = CircleFace(radius=5, color=color)
        node.add_face(circle, column=1, position="aligned")

        # Column 2: Temperature
        temp = TextFace(f"{node.temp}°C", fsize=8)
        node.add_face(temp, column=2, position="aligned")

        # Column 3: Depth
        depth = TextFace(f"{node.depth}m", fsize=8)
        node.add_face(depth, column=3, position="aligned")

ts = TreeStyle()
ts.layout_fn = layout
ts.show_leaf_name = False

tree.render("tree_columns.pdf", tree_style=ts)
```

---

## Advanced Visualization

### Highlighting Clades

```python
from ete3 import Tree, TreeStyle, NodeStyle, TextFace

tree = Tree("tree.nw")

# Define clades to highlight
clade_members = {
    "Clade_A": ["species1", "species2", "species3"],
    "Clade_B": ["species4", "species5"]
}

def layout(node):
    # Check if node is ancestor of specific clade
    node_leaves = set([l.name for l in node.get_leaves()])

    for clade_name, members in clade_members.items():
        if set(members).issubset(node_leaves):
            # This node is ancestor of the clade
            nstyle = NodeStyle()
            nstyle["bgcolor"] = "yellow"
            nstyle["size"] = 0

            # Add label
            if set(members) == node_leaves:  # Exact match
                label = TextFace(clade_name, fsize=14, bold=True, fgcolor="red")
                node.add_face(label, column=0, position="branch-top")

            node.set_style(nstyle)
            break

ts = TreeStyle()
ts.layout_fn = layout

tree.render("tree_highlighted_clades.pdf", tree_style=ts)
```

### Collapsing Clades

```python
from ete3 import Tree, TreeStyle, TextFace, NodeStyle

tree = Tree("tree.nw")

# Define which clades to collapse
clades_to_collapse = ["clade1_species1", "clade1_species2"]

def layout(node):
    if not node.is_leaf():
        node_leaves = [l.name for l in node.get_leaves()]

        # Check if this is a clade we want to collapse
        if all(l in clades_to_collapse for l in node_leaves):
            # Collapse by hiding descendants
            nstyle = NodeStyle()
            nstyle["draw_descendants"] = False
            nstyle["size"] = 20
            nstyle["fgcolor"] = "steelblue"
            nstyle["shape"] = "sphere"
            node.set_style(nstyle)

            # Add label showing what's collapsed
            label = TextFace(f"[{len(node_leaves)} species]", fsize=10)
            node.add_face(label, column=0, position="branch-right")

ts = TreeStyle()
ts.layout_fn = layout

tree.render("tree_collapsed.pdf", tree_style=ts)
```

### Heat Map Visualization

```python
from ete3 import Tree, TreeStyle, RectFace, TextFace
import numpy as np

tree = Tree("tree.nw")

# Generate random data for heatmap
for leaf in tree:
    leaf.add_feature("data", np.random.rand(10))  # 10 data points

def layout(node):
    if node.is_leaf():
        # Add name
        name = TextFace(node.name, fsize=8)
        node.add_face(name, column=0, position="aligned")

        # Add heatmap cells
        for i, value in enumerate(node.data):
            # Color based on value
            intensity = int(255 * value)
            color = f"#{255-intensity:02x}{intensity:02x}00"  # Green-red gradient

            rect = RectFace(width=20, height=15, fgcolor=color, bgcolor=color)
            node.add_face(rect, column=i+1, position="aligned")

# Add column headers
ts = TreeStyle()
ts.layout_fn = layout
ts.show_leaf_name = False

# Add header
for i in range(10):
    header = TextFace(f"C{i+1}", fsize=8, fgcolor="gray")
    ts.aligned_header.add_face(header, column=i+1)

tree.render("tree_heatmap.pdf", tree_style=ts)
```

### Phylogenetic Events Visualization

```python
from ete3 import PhyloTree, TreeStyle, TextFace, NodeStyle

tree = PhyloTree("gene_tree.nw")
tree.set_species_naming_function(lambda x: x.split("_")[0])
tree.get_descendant_evol_events()

def layout(node):
    # Style based on evolutionary event
    if hasattr(node, "evoltype"):
        nstyle = NodeStyle()

        if node.evoltype == "D":  # Duplication
            nstyle["fgcolor"] = "red"
            nstyle["size"] = 10
            nstyle["shape"] = "square"

            label = TextFace("DUP", fsize=8, fgcolor="red", bold=True)
            node.add_face(label, column=0, position="branch-top")

        elif node.evoltype == "S":  # Speciation
            nstyle["fgcolor"] = "blue"
            nstyle["size"] = 6
            nstyle["shape"] = "circle"

        node.set_style(nstyle)

ts = TreeStyle()
ts.layout_fn = layout
ts.show_leaf_name = True

tree.render("gene_tree_events.pdf", tree_style=ts)
```

### Custom Tree with Legend

```python
from ete3 import Tree, TreeStyle, TextFace, CircleFace, NodeStyle

tree = Tree("tree.nw")

# Categorize species
for leaf in tree:
    if "fish" in leaf.name.lower():
        leaf.add_feature("category", "fish")
    elif "bird" in leaf.name.lower():
        leaf.add_feature("category", "bird")
    else:
        leaf.add_feature("category", "mammal")

category_colors = {
    "fish": "blue",
    "bird": "green",
    "mammal": "red"
}

def layout(node):
    if node.is_leaf():
        # Color by category
        nstyle = NodeStyle()
        nstyle["fgcolor"] = category_colors[node.category]
        nstyle["size"] = 10
        node.set_style(nstyle)

ts = TreeStyle()
ts.layout_fn = layout

# Add legend
ts.legend.add_face(TextFace("Legend:", fsize=12, bold=True), column=0)
for category, color in category_colors.items():
    circle = CircleFace(radius=5, color=color)
    ts.legend.add_face(circle, column=0)
    label = TextFace(f" {category.capitalize()}", fsize=10)
    ts.legend.add_face(label, column=1)

ts.legend_position = 1

tree.render("tree_with_legend.pdf", tree_style=ts)
```

---

## Best Practices

1. **Use layout functions** for complex visualizations - they're called during rendering
2. **Set `show_leaf_name = False`** when using custom name faces
3. **Use aligned position** for columnar data at leaf level
4. **Choose appropriate units**: pixels for screen, mm/inches for print
5. **Use vector formats (PDF/SVG)** for publications
6. **Precompute styling** when possible - layout functions should be fast
7. **Test interactively** with `show()` before rendering to file
8. **Use NodeStyle for permanent** changes, layout functions for rendering-time changes
9. **Align faces in columns** for clean, organized appearance
10. **Add legends** to explain colors and symbols used
