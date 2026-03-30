#!/usr/bin/env python3
"""
Tree operations helper script for common ETE toolkit tasks.

Provides command-line interface for basic tree operations like:
- Format conversion
- Rooting (outgroup, midpoint)
- Pruning
- Basic statistics
- ASCII visualization
"""

import argparse
import sys
from pathlib import Path

try:
    from ete3 import Tree
except ImportError:
    print("Error: ete3 not installed. Install with: pip install ete3")
    sys.exit(1)


def load_tree(tree_file, format_num=0):
    """Load tree from file."""
    try:
        return Tree(str(tree_file), format=format_num)
    except Exception as e:
        print(f"Error loading tree: {e}")
        sys.exit(1)


def convert_format(tree_file, output, in_format=0, out_format=1):
    """Convert tree between Newick formats."""
    tree = load_tree(tree_file, in_format)
    tree.write(outfile=str(output), format=out_format)
    print(f"Converted {tree_file} (format {in_format}) → {output} (format {out_format})")


def reroot_tree(tree_file, output, outgroup=None, midpoint=False, format_num=0):
    """Reroot tree by outgroup or midpoint."""
    tree = load_tree(tree_file, format_num)

    if midpoint:
        midpoint_node = tree.get_midpoint_outgroup()
        tree.set_outgroup(midpoint_node)
        print(f"Rerooted tree using midpoint method")
    elif outgroup:
        try:
            outgroup_node = tree & outgroup
            tree.set_outgroup(outgroup_node)
            print(f"Rerooted tree using outgroup: {outgroup}")
        except Exception as e:
            print(f"Error: Could not find outgroup '{outgroup}': {e}")
            sys.exit(1)
    else:
        print("Error: Must specify either --outgroup or --midpoint")
        sys.exit(1)

    tree.write(outfile=str(output), format=format_num)
    print(f"Saved rerooted tree to: {output}")


def prune_tree(tree_file, output, keep_taxa, preserve_length=True, format_num=0):
    """Prune tree to keep only specified taxa."""
    tree = load_tree(tree_file, format_num)

    # Read taxa list
    taxa_file = Path(keep_taxa)
    if taxa_file.exists():
        with open(taxa_file) as f:
            taxa = [line.strip() for line in f if line.strip()]
    else:
        taxa = [t.strip() for t in keep_taxa.split(",")]

    print(f"Pruning tree to {len(taxa)} taxa")

    try:
        tree.prune(taxa, preserve_branch_length=preserve_length)
        tree.write(outfile=str(output), format=format_num)
        print(f"Pruned tree saved to: {output}")
        print(f"Retained {len(tree)} leaves")
    except Exception as e:
        print(f"Error pruning tree: {e}")
        sys.exit(1)


def tree_stats(tree_file, format_num=0):
    """Display tree statistics."""
    tree = load_tree(tree_file, format_num)

    print(f"\n=== Tree Statistics ===")
    print(f"File: {tree_file}")
    print(f"Number of leaves: {len(tree)}")
    print(f"Total nodes: {len(list(tree.traverse()))}")

    farthest_leaf, distance = tree.get_farthest_leaf()
    print(f"Tree depth: {distance:.4f}")
    print(f"Farthest leaf: {farthest_leaf.name}")

    # Branch length statistics
    branch_lengths = [node.dist for node in tree.traverse() if not node.is_root()]
    if branch_lengths:
        print(f"\nBranch length statistics:")
        print(f"  Mean: {sum(branch_lengths)/len(branch_lengths):.4f}")
        print(f"  Min: {min(branch_lengths):.4f}")
        print(f"  Max: {max(branch_lengths):.4f}")

    # Support values
    supports = [node.support for node in tree.traverse() if not node.is_leaf() and hasattr(node, 'support')]
    if supports:
        print(f"\nSupport value statistics:")
        print(f"  Mean: {sum(supports)/len(supports):.2f}")
        print(f"  Min: {min(supports):.2f}")
        print(f"  Max: {max(supports):.2f}")

    print()


def show_ascii(tree_file, format_num=0, show_internal=True):
    """Display tree as ASCII art."""
    tree = load_tree(tree_file, format_num)
    print(tree.get_ascii(show_internal=show_internal))


def list_leaves(tree_file, format_num=0):
    """List all leaf names."""
    tree = load_tree(tree_file, format_num)
    for leaf in tree:
        print(leaf.name)


def main():
    parser = argparse.ArgumentParser(
        description="ETE toolkit tree operations helper",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Convert format
  %(prog)s convert input.nw output.nw --in-format 0 --out-format 1

  # Midpoint root
  %(prog)s reroot input.nw output.nw --midpoint

  # Reroot with outgroup
  %(prog)s reroot input.nw output.nw --outgroup "Outgroup_species"

  # Prune tree
  %(prog)s prune input.nw output.nw --keep-taxa "speciesA,speciesB,speciesC"

  # Show statistics
  %(prog)s stats input.nw

  # Display as ASCII
  %(prog)s ascii input.nw

  # List all leaves
  %(prog)s leaves input.nw
        """
    )

    subparsers = parser.add_subparsers(dest="command", help="Command to execute")

    # Convert command
    convert_parser = subparsers.add_parser("convert", help="Convert tree format")
    convert_parser.add_argument("input", help="Input tree file")
    convert_parser.add_argument("output", help="Output tree file")
    convert_parser.add_argument("--in-format", type=int, default=0, help="Input format (default: 0)")
    convert_parser.add_argument("--out-format", type=int, default=1, help="Output format (default: 1)")

    # Reroot command
    reroot_parser = subparsers.add_parser("reroot", help="Reroot tree")
    reroot_parser.add_argument("input", help="Input tree file")
    reroot_parser.add_argument("output", help="Output tree file")
    reroot_parser.add_argument("--outgroup", help="Outgroup taxon name")
    reroot_parser.add_argument("--midpoint", action="store_true", help="Use midpoint rooting")
    reroot_parser.add_argument("--format", type=int, default=0, help="Newick format (default: 0)")

    # Prune command
    prune_parser = subparsers.add_parser("prune", help="Prune tree to specified taxa")
    prune_parser.add_argument("input", help="Input tree file")
    prune_parser.add_argument("output", help="Output tree file")
    prune_parser.add_argument("--keep-taxa", required=True,
                              help="Taxa to keep (comma-separated or file path)")
    prune_parser.add_argument("--no-preserve-length", action="store_true",
                              help="Don't preserve branch lengths")
    prune_parser.add_argument("--format", type=int, default=0, help="Newick format (default: 0)")

    # Stats command
    stats_parser = subparsers.add_parser("stats", help="Display tree statistics")
    stats_parser.add_argument("input", help="Input tree file")
    stats_parser.add_argument("--format", type=int, default=0, help="Newick format (default: 0)")

    # ASCII command
    ascii_parser = subparsers.add_parser("ascii", help="Display tree as ASCII art")
    ascii_parser.add_argument("input", help="Input tree file")
    ascii_parser.add_argument("--format", type=int, default=0, help="Newick format (default: 0)")
    ascii_parser.add_argument("--no-internal", action="store_true",
                              help="Don't show internal node names")

    # Leaves command
    leaves_parser = subparsers.add_parser("leaves", help="List all leaf names")
    leaves_parser.add_argument("input", help="Input tree file")
    leaves_parser.add_argument("--format", type=int, default=0, help="Newick format (default: 0)")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    # Execute command
    if args.command == "convert":
        convert_format(args.input, args.output, args.in_format, args.out_format)
    elif args.command == "reroot":
        reroot_tree(args.input, args.output, args.outgroup, args.midpoint, args.format)
    elif args.command == "prune":
        prune_tree(args.input, args.output, args.keep_taxa,
                   not args.no_preserve_length, args.format)
    elif args.command == "stats":
        tree_stats(args.input, args.format)
    elif args.command == "ascii":
        show_ascii(args.input, args.format, not args.no_internal)
    elif args.command == "leaves":
        list_leaves(args.input, args.format)


if __name__ == "__main__":
    main()
