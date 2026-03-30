#!/usr/bin/env python3
"""
Quick tree visualization script with common customization options.

Provides command-line interface for rapid tree visualization with
customizable styles, layouts, and output formats.
"""

import argparse
import sys
from pathlib import Path

try:
    from ete3 import Tree, TreeStyle, NodeStyle
except ImportError:
    print("Error: ete3 not installed. Install with: pip install ete3")
    sys.exit(1)


def create_tree_style(args):
    """Create TreeStyle based on arguments."""
    ts = TreeStyle()

    # Basic display options
    ts.show_leaf_name = args.show_names
    ts.show_branch_length = args.show_lengths
    ts.show_branch_support = args.show_support
    ts.show_scale = args.show_scale

    # Layout
    ts.mode = args.mode
    ts.rotation = args.rotation

    # Circular tree options
    if args.mode == "c":
        ts.arc_start = args.arc_start
        ts.arc_span = args.arc_span

    # Spacing
    ts.branch_vertical_margin = args.vertical_margin
    if args.scale_factor:
        ts.scale = args.scale_factor

    # Title
    if args.title:
        from ete3 import TextFace
        title_face = TextFace(args.title, fsize=16, bold=True)
        ts.title.add_face(title_face, column=0)

    return ts


def apply_node_styling(tree, args):
    """Apply styling to tree nodes."""
    for node in tree.traverse():
        nstyle = NodeStyle()

        if node.is_leaf():
            # Leaf style
            nstyle["fgcolor"] = args.leaf_color
            nstyle["size"] = args.leaf_size
        else:
            # Internal node style
            nstyle["fgcolor"] = args.internal_color
            nstyle["size"] = args.internal_size

            # Color by support if enabled
            if args.color_by_support and hasattr(node, 'support') and node.support:
                if node.support >= 0.9:
                    nstyle["fgcolor"] = "darkgreen"
                elif node.support >= 0.7:
                    nstyle["fgcolor"] = "orange"
                else:
                    nstyle["fgcolor"] = "red"

        node.set_style(nstyle)


def visualize_tree(tree_file, output, args):
    """Load tree, apply styles, and render."""
    try:
        tree = Tree(str(tree_file), format=args.format)
    except Exception as e:
        print(f"Error loading tree: {e}")
        sys.exit(1)

    # Apply styling
    apply_node_styling(tree, args)

    # Create tree style
    ts = create_tree_style(args)

    # Render
    try:
        # Determine output parameters based on format
        output_path = str(output)

        render_args = {"tree_style": ts}

        if args.width:
            render_args["w"] = args.width
        if args.height:
            render_args["h"] = args.height
        if args.units:
            render_args["units"] = args.units
        if args.dpi:
            render_args["dpi"] = args.dpi

        tree.render(output_path, **render_args)
        print(f"Tree rendered successfully to: {output}")

    except Exception as e:
        print(f"Error rendering tree: {e}")
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description="Quick tree visualization with ETE toolkit",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Basic visualization
  %(prog)s tree.nw output.pdf

  # Circular tree
  %(prog)s tree.nw output.pdf --mode c

  # Large tree with custom sizing
  %(prog)s tree.nw output.png --width 1200 --height 800 --units px --dpi 300

  # Hide names, show support, color by support
  %(prog)s tree.nw output.pdf --no-names --show-support --color-by-support

  # Custom title
  %(prog)s tree.nw output.pdf --title "Phylogenetic Tree of Species"

  # Semicircular layout
  %(prog)s tree.nw output.pdf --mode c --arc-start -90 --arc-span 180
        """
    )

    parser.add_argument("input", help="Input tree file (Newick format)")
    parser.add_argument("output", help="Output image file (png, pdf, or svg)")

    # Tree format
    parser.add_argument("--format", type=int, default=0,
                        help="Newick format number (default: 0)")

    # Display options
    display = parser.add_argument_group("Display options")
    display.add_argument("--no-names", dest="show_names", action="store_false",
                         help="Don't show leaf names")
    display.add_argument("--show-lengths", action="store_true",
                         help="Show branch lengths")
    display.add_argument("--show-support", action="store_true",
                         help="Show support values")
    display.add_argument("--show-scale", action="store_true",
                         help="Show scale bar")

    # Layout options
    layout = parser.add_argument_group("Layout options")
    layout.add_argument("--mode", choices=["r", "c"], default="r",
                        help="Tree mode: r=rectangular, c=circular (default: r)")
    layout.add_argument("--rotation", type=int, default=0,
                        help="Tree rotation in degrees (default: 0)")
    layout.add_argument("--arc-start", type=int, default=0,
                        help="Circular tree start angle (default: 0)")
    layout.add_argument("--arc-span", type=int, default=360,
                        help="Circular tree arc span (default: 360)")

    # Styling options
    styling = parser.add_argument_group("Styling options")
    styling.add_argument("--leaf-color", default="blue",
                         help="Leaf node color (default: blue)")
    styling.add_argument("--leaf-size", type=int, default=6,
                         help="Leaf node size (default: 6)")
    styling.add_argument("--internal-color", default="gray",
                         help="Internal node color (default: gray)")
    styling.add_argument("--internal-size", type=int, default=4,
                         help="Internal node size (default: 4)")
    styling.add_argument("--color-by-support", action="store_true",
                         help="Color internal nodes by support value")

    # Size and spacing
    size = parser.add_argument_group("Size and spacing")
    size.add_argument("--width", type=int, help="Output width")
    size.add_argument("--height", type=int, help="Output height")
    size.add_argument("--units", choices=["px", "mm", "in"],
                      help="Size units (px, mm, in)")
    size.add_argument("--dpi", type=int, help="DPI for raster output")
    size.add_argument("--scale-factor", type=int,
                      help="Branch length scale factor (pixels per unit)")
    size.add_argument("--vertical-margin", type=int, default=10,
                      help="Vertical margin between branches (default: 10)")

    # Other options
    parser.add_argument("--title", help="Tree title")

    args = parser.parse_args()

    # Validate output format
    output_path = Path(args.output)
    valid_extensions = {".png", ".pdf", ".svg"}
    if output_path.suffix.lower() not in valid_extensions:
        print(f"Error: Output must be PNG, PDF, or SVG file")
        sys.exit(1)

    # Visualize
    visualize_tree(args.input, args.output, args)


if __name__ == "__main__":
    main()
