#!/usr/bin/env python3
"""
Visualize PyTorch Geometric graph structures using networkx and matplotlib.

This script provides utilities to visualize Data objects, including:
- Graph structure (nodes and edges)
- Node features (as colors)
- Edge attributes (as edge colors/widths)
- Community/cluster assignments

Usage:
    python visualize_graph.py --dataset Cora --output graph.png

Or import and use:
    from scripts.visualize_graph import visualize_data
    visualize_data(data, title="My Graph", show_labels=True)
"""

import argparse
import matplotlib.pyplot as plt
import networkx as nx
import torch
from typing import Optional, Union
import numpy as np


def visualize_data(
    data,
    title: str = "Graph Visualization",
    node_color_attr: Optional[str] = None,
    edge_color_attr: Optional[str] = None,
    show_labels: bool = False,
    node_size: int = 300,
    figsize: tuple = (12, 10),
    layout: str = "spring",
    output_path: Optional[str] = None,
    max_nodes: Optional[int] = None,
):
    """
    Visualize a PyTorch Geometric Data object.

    Args:
        data: PyTorch Geometric Data object
        title: Plot title
        node_color_attr: Data attribute to use for node colors (e.g., 'y', 'train_mask')
        edge_color_attr: Data attribute to use for edge colors
        show_labels: Whether to show node labels
        node_size: Size of nodes in visualization
        figsize: Figure size (width, height)
        layout: Graph layout algorithm ('spring', 'circular', 'kamada_kawai', 'spectral')
        output_path: Path to save figure (if None, displays interactively)
        max_nodes: Maximum number of nodes to visualize (samples if exceeded)
    """
    # Sample nodes if graph is too large
    if max_nodes and data.num_nodes > max_nodes:
        print(f"Graph has {data.num_nodes} nodes. Sampling {max_nodes} nodes for visualization.")
        node_indices = torch.randperm(data.num_nodes)[:max_nodes]
        data = data.subgraph(node_indices)

    # Convert to networkx graph
    G = nx.Graph() if is_undirected(data.edge_index) else nx.DiGraph()

    # Add nodes
    G.add_nodes_from(range(data.num_nodes))

    # Add edges
    edge_index = data.edge_index.cpu().numpy()
    edges = list(zip(edge_index[0], edge_index[1]))
    G.add_edges_from(edges)

    # Setup figure
    fig, ax = plt.subplots(figsize=figsize)

    # Choose layout
    if layout == "spring":
        pos = nx.spring_layout(G, k=0.5, iterations=50)
    elif layout == "circular":
        pos = nx.circular_layout(G)
    elif layout == "kamada_kawai":
        pos = nx.kamada_kawai_layout(G)
    elif layout == "spectral":
        pos = nx.spectral_layout(G)
    else:
        raise ValueError(f"Unknown layout: {layout}")

    # Determine node colors
    if node_color_attr and hasattr(data, node_color_attr):
        node_colors = getattr(data, node_color_attr).cpu().numpy()
        if node_colors.dtype == bool:
            node_colors = node_colors.astype(int)
        if len(node_colors.shape) > 1:
            # Multi-dimensional features - use first dimension
            node_colors = node_colors[:, 0]
    else:
        node_colors = 'skyblue'

    # Determine edge colors
    if edge_color_attr and hasattr(data, edge_color_attr):
        edge_colors = getattr(data, edge_color_attr).cpu().numpy()
        if len(edge_colors.shape) > 1:
            edge_colors = edge_colors[:, 0]
    else:
        edge_colors = 'gray'

    # Draw graph
    nx.draw_networkx_nodes(
        G, pos,
        node_color=node_colors,
        node_size=node_size,
        cmap=plt.cm.viridis,
        ax=ax
    )

    nx.draw_networkx_edges(
        G, pos,
        edge_color=edge_colors,
        alpha=0.3,
        arrows=isinstance(G, nx.DiGraph),
        arrowsize=10,
        ax=ax
    )

    if show_labels:
        nx.draw_networkx_labels(G, pos, font_size=8, ax=ax)

    ax.set_title(title, fontsize=16, fontweight='bold')
    ax.axis('off')

    # Add colorbar if using numeric node colors
    if node_color_attr and isinstance(node_colors, np.ndarray):
        sm = plt.cm.ScalarMappable(
            cmap=plt.cm.viridis,
            norm=plt.Normalize(vmin=node_colors.min(), vmax=node_colors.max())
        )
        sm.set_array([])
        cbar = plt.colorbar(sm, ax=ax, fraction=0.046, pad=0.04)
        cbar.set_label(node_color_attr, rotation=270, labelpad=20)

    plt.tight_layout()

    if output_path:
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        print(f"Figure saved to {output_path}")
    else:
        plt.show()

    plt.close()


def is_undirected(edge_index):
    """Check if graph is undirected."""
    row, col = edge_index
    num_edges = edge_index.size(1)

    # Create a set of edges and reverse edges
    edges = set(zip(row.tolist(), col.tolist()))
    reverse_edges = set(zip(col.tolist(), row.tolist()))

    # Check if all edges have their reverse
    return edges == reverse_edges


def plot_degree_distribution(data, output_path: Optional[str] = None):
    """Plot the degree distribution of the graph."""
    from torch_geometric.utils import degree

    row, col = data.edge_index
    deg = degree(col, data.num_nodes).cpu().numpy()

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

    # Histogram
    ax1.hist(deg, bins=50, edgecolor='black', alpha=0.7)
    ax1.set_xlabel('Degree', fontsize=12)
    ax1.set_ylabel('Frequency', fontsize=12)
    ax1.set_title('Degree Distribution', fontsize=14, fontweight='bold')
    ax1.grid(alpha=0.3)

    # Log-log plot
    unique_degrees, counts = np.unique(deg, return_counts=True)
    ax2.loglog(unique_degrees, counts, 'o-', alpha=0.7)
    ax2.set_xlabel('Degree (log scale)', fontsize=12)
    ax2.set_ylabel('Frequency (log scale)', fontsize=12)
    ax2.set_title('Degree Distribution (Log-Log)', fontsize=14, fontweight='bold')
    ax2.grid(alpha=0.3)

    plt.tight_layout()

    if output_path:
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        print(f"Degree distribution saved to {output_path}")
    else:
        plt.show()

    plt.close()


def plot_graph_statistics(data, output_path: Optional[str] = None):
    """Plot various graph statistics."""
    from torch_geometric.utils import degree, contains_self_loops, is_undirected as check_undirected

    # Compute statistics
    row, col = data.edge_index
    deg = degree(col, data.num_nodes).cpu().numpy()

    stats = {
        'Nodes': data.num_nodes,
        'Edges': data.num_edges,
        'Avg Degree': deg.mean(),
        'Max Degree': deg.max(),
        'Self-loops': contains_self_loops(data.edge_index),
        'Undirected': check_undirected(data.edge_index),
    }

    if hasattr(data, 'num_node_features'):
        stats['Node Features'] = data.num_node_features
    if hasattr(data, 'num_edge_features') and data.edge_attr is not None:
        stats['Edge Features'] = data.num_edge_features
    if hasattr(data, 'y'):
        if data.y.dim() == 1:
            stats['Classes'] = int(data.y.max().item()) + 1

    # Create text plot
    fig, ax = plt.subplots(figsize=(8, 6))
    ax.axis('off')

    text = "Graph Statistics\n" + "=" * 40 + "\n\n"
    for key, value in stats.items():
        text += f"{key:20s}: {value}\n"

    ax.text(0.1, 0.5, text, fontsize=14, family='monospace',
            verticalalignment='center', transform=ax.transAxes)

    plt.tight_layout()

    if output_path:
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        print(f"Statistics saved to {output_path}")
    else:
        plt.show()

    plt.close()

    # Print to console as well
    print("\n" + text)


def main():
    parser = argparse.ArgumentParser(description="Visualize PyTorch Geometric graphs")
    parser.add_argument('--dataset', type=str, default='Cora',
                        help='Dataset name (e.g., Cora, CiteSeer, ENZYMES)')
    parser.add_argument('--output', type=str, default=None,
                        help='Output file path for visualization')
    parser.add_argument('--node-color', type=str, default='y',
                        help='Attribute to use for node colors')
    parser.add_argument('--layout', type=str, default='spring',
                        choices=['spring', 'circular', 'kamada_kawai', 'spectral'],
                        help='Graph layout algorithm')
    parser.add_argument('--show-labels', action='store_true',
                        help='Show node labels')
    parser.add_argument('--max-nodes', type=int, default=500,
                        help='Maximum nodes to visualize')
    parser.add_argument('--stats', action='store_true',
                        help='Show graph statistics')
    parser.add_argument('--degree', action='store_true',
                        help='Show degree distribution')

    args = parser.parse_args()

    # Load dataset
    print(f"Loading dataset: {args.dataset}")

    try:
        # Try Planetoid datasets
        from torch_geometric.datasets import Planetoid
        dataset = Planetoid(root=f'/tmp/{args.dataset}', name=args.dataset)
        data = dataset[0]
    except:
        try:
            # Try TUDataset
            from torch_geometric.datasets import TUDataset
            dataset = TUDataset(root=f'/tmp/{args.dataset}', name=args.dataset)
            data = dataset[0]
        except Exception as e:
            print(f"Error loading dataset: {e}")
            print("Supported datasets: Cora, CiteSeer, PubMed, ENZYMES, PROTEINS, etc.")
            return

    print(f"Loaded {args.dataset}: {data.num_nodes} nodes, {data.num_edges} edges")

    # Generate visualizations
    if args.stats:
        stats_output = args.output.replace('.png', '_stats.png') if args.output else None
        plot_graph_statistics(data, stats_output)

    if args.degree:
        degree_output = args.output.replace('.png', '_degree.png') if args.output else None
        plot_degree_distribution(data, degree_output)

    # Main visualization
    visualize_data(
        data,
        title=f"{args.dataset} Graph",
        node_color_attr=args.node_color,
        show_labels=args.show_labels,
        layout=args.layout,
        output_path=args.output,
        max_nodes=args.max_nodes
    )


if __name__ == '__main__':
    main()
