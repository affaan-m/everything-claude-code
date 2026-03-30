#!/usr/bin/env python3
"""
Matplotlib Style Configurator

Interactive utility to configure matplotlib style preferences and generate
custom style sheets. Creates a preview of the style and optionally saves
it as a .mplstyle file.

Usage:
    python style_configurator.py [--preset PRESET] [--output FILE] [--preview]

Presets:
    publication, presentation, web, dark, minimal
"""

import numpy as np
import matplotlib.pyplot as plt
from matplotlib.gridspec import GridSpec
import argparse
import os


# Predefined style presets
STYLE_PRESETS = {
    'publication': {
        'figure.figsize': (8, 6),
        'figure.dpi': 100,
        'savefig.dpi': 300,
        'savefig.bbox': 'tight',
        'font.family': 'sans-serif',
        'font.sans-serif': ['Arial', 'Helvetica'],
        'font.size': 11,
        'axes.labelsize': 12,
        'axes.titlesize': 14,
        'axes.linewidth': 1.5,
        'axes.grid': False,
        'axes.spines.top': False,
        'axes.spines.right': False,
        'lines.linewidth': 2,
        'lines.markersize': 8,
        'xtick.labelsize': 10,
        'ytick.labelsize': 10,
        'xtick.direction': 'in',
        'ytick.direction': 'in',
        'xtick.major.size': 6,
        'ytick.major.size': 6,
        'xtick.major.width': 1.5,
        'ytick.major.width': 1.5,
        'legend.fontsize': 10,
        'legend.frameon': True,
        'legend.framealpha': 1.0,
        'legend.edgecolor': 'black',
    },
    'presentation': {
        'figure.figsize': (12, 8),
        'figure.dpi': 100,
        'savefig.dpi': 150,
        'font.size': 16,
        'axes.labelsize': 20,
        'axes.titlesize': 24,
        'axes.linewidth': 2,
        'lines.linewidth': 3,
        'lines.markersize': 12,
        'xtick.labelsize': 16,
        'ytick.labelsize': 16,
        'legend.fontsize': 16,
        'axes.grid': True,
        'grid.alpha': 0.3,
    },
    'web': {
        'figure.figsize': (10, 6),
        'figure.dpi': 96,
        'savefig.dpi': 150,
        'font.size': 11,
        'axes.labelsize': 12,
        'axes.titlesize': 14,
        'lines.linewidth': 2,
        'axes.grid': True,
        'grid.alpha': 0.2,
        'grid.linestyle': '--',
    },
    'dark': {
        'figure.facecolor': '#1e1e1e',
        'figure.edgecolor': '#1e1e1e',
        'axes.facecolor': '#1e1e1e',
        'axes.edgecolor': 'white',
        'axes.labelcolor': 'white',
        'text.color': 'white',
        'xtick.color': 'white',
        'ytick.color': 'white',
        'grid.color': 'gray',
        'grid.alpha': 0.3,
        'axes.grid': True,
        'legend.facecolor': '#1e1e1e',
        'legend.edgecolor': 'white',
        'savefig.facecolor': '#1e1e1e',
    },
    'minimal': {
        'figure.figsize': (10, 6),
        'axes.spines.top': False,
        'axes.spines.right': False,
        'axes.spines.left': False,
        'axes.spines.bottom': False,
        'axes.grid': False,
        'xtick.bottom': True,
        'ytick.left': True,
        'axes.axisbelow': True,
        'lines.linewidth': 2.5,
        'font.size': 12,
    }
}


def generate_preview_data():
    """Generate sample data for style preview."""
    np.random.seed(42)
    x = np.linspace(0, 10, 100)
    y1 = np.sin(x) + 0.1 * np.random.randn(100)
    y2 = np.cos(x) + 0.1 * np.random.randn(100)
    scatter_x = np.random.randn(100)
    scatter_y = 2 * scatter_x + np.random.randn(100)
    categories = ['A', 'B', 'C', 'D', 'E']
    bar_values = [25, 40, 30, 55, 45]

    return {
        'x': x, 'y1': y1, 'y2': y2,
        'scatter_x': scatter_x, 'scatter_y': scatter_y,
        'categories': categories, 'bar_values': bar_values
    }


def create_style_preview(style_dict=None):
    """Create a preview figure demonstrating the style."""
    if style_dict:
        plt.rcParams.update(style_dict)

    data = generate_preview_data()

    fig = plt.figure(figsize=(14, 10))
    gs = GridSpec(2, 2, figure=fig, hspace=0.3, wspace=0.3)

    # Line plot
    ax1 = fig.add_subplot(gs[0, 0])
    ax1.plot(data['x'], data['y1'], label='sin(x)', marker='o', markevery=10)
    ax1.plot(data['x'], data['y2'], label='cos(x)', linestyle='--')
    ax1.set_xlabel('X axis')
    ax1.set_ylabel('Y axis')
    ax1.set_title('Line Plot')
    ax1.legend()
    ax1.grid(True, alpha=0.3)

    # Scatter plot
    ax2 = fig.add_subplot(gs[0, 1])
    colors = np.sqrt(data['scatter_x']**2 + data['scatter_y']**2)
    scatter = ax2.scatter(data['scatter_x'], data['scatter_y'],
                         c=colors, cmap='viridis', alpha=0.6, s=50)
    ax2.set_xlabel('X axis')
    ax2.set_ylabel('Y axis')
    ax2.set_title('Scatter Plot')
    cbar = plt.colorbar(scatter, ax=ax2)
    cbar.set_label('Distance')
    ax2.grid(True, alpha=0.3)

    # Bar chart
    ax3 = fig.add_subplot(gs[1, 0])
    bars = ax3.bar(data['categories'], data['bar_values'],
                   edgecolor='black', linewidth=1)
    # Color bars with gradient
    colors = plt.cm.viridis(np.linspace(0.2, 0.8, len(bars)))
    for bar, color in zip(bars, colors):
        bar.set_facecolor(color)
    ax3.set_xlabel('Categories')
    ax3.set_ylabel('Values')
    ax3.set_title('Bar Chart')
    ax3.grid(True, axis='y', alpha=0.3)

    # Multiple line plot with fills
    ax4 = fig.add_subplot(gs[1, 1])
    ax4.plot(data['x'], data['y1'], label='Signal 1', linewidth=2)
    ax4.fill_between(data['x'], data['y1'] - 0.2, data['y1'] + 0.2,
                     alpha=0.3, label='±1 std')
    ax4.plot(data['x'], data['y2'], label='Signal 2', linewidth=2)
    ax4.fill_between(data['x'], data['y2'] - 0.2, data['y2'] + 0.2,
                     alpha=0.3)
    ax4.set_xlabel('X axis')
    ax4.set_ylabel('Y axis')
    ax4.set_title('Time Series with Uncertainty')
    ax4.legend()
    ax4.grid(True, alpha=0.3)

    fig.suptitle('Style Preview', fontsize=16, fontweight='bold')

    return fig


def save_style_file(style_dict, filename):
    """Save style dictionary as .mplstyle file."""
    with open(filename, 'w') as f:
        f.write("# Custom matplotlib style\n")
        f.write("# Generated by style_configurator.py\n\n")

        # Group settings by category
        categories = {
            'Figure': ['figure.'],
            'Font': ['font.'],
            'Axes': ['axes.'],
            'Lines': ['lines.'],
            'Markers': ['markers.'],
            'Ticks': ['tick.', 'xtick.', 'ytick.'],
            'Grid': ['grid.'],
            'Legend': ['legend.'],
            'Savefig': ['savefig.'],
            'Text': ['text.'],
        }

        for category, prefixes in categories.items():
            category_items = {k: v for k, v in style_dict.items()
                            if any(k.startswith(p) for p in prefixes)}
            if category_items:
                f.write(f"# {category}\n")
                for key, value in sorted(category_items.items()):
                    # Format value appropriately
                    if isinstance(value, (list, tuple)):
                        value_str = ', '.join(str(v) for v in value)
                    elif isinstance(value, bool):
                        value_str = str(value)
                    else:
                        value_str = str(value)
                    f.write(f"{key}: {value_str}\n")
                f.write("\n")

    print(f"Style saved to {filename}")


def print_style_info(style_dict):
    """Print information about the style."""
    print("\n" + "="*60)
    print("STYLE CONFIGURATION")
    print("="*60)

    categories = {
        'Figure Settings': ['figure.'],
        'Font Settings': ['font.'],
        'Axes Settings': ['axes.'],
        'Line Settings': ['lines.'],
        'Grid Settings': ['grid.'],
        'Legend Settings': ['legend.'],
    }

    for category, prefixes in categories.items():
        category_items = {k: v for k, v in style_dict.items()
                        if any(k.startswith(p) for p in prefixes)}
        if category_items:
            print(f"\n{category}:")
            for key, value in sorted(category_items.items()):
                print(f"  {key}: {value}")

    print("\n" + "="*60 + "\n")


def list_available_presets():
    """Print available style presets."""
    print("\nAvailable style presets:")
    print("-" * 40)
    descriptions = {
        'publication': 'Optimized for academic publications',
        'presentation': 'Large fonts for presentations',
        'web': 'Optimized for web display',
        'dark': 'Dark background theme',
        'minimal': 'Minimal, clean style',
    }
    for preset, desc in descriptions.items():
        print(f"  {preset:15s} - {desc}")
    print("-" * 40 + "\n")


def interactive_mode():
    """Run interactive mode to customize style settings."""
    print("\n" + "="*60)
    print("MATPLOTLIB STYLE CONFIGURATOR - Interactive Mode")
    print("="*60)

    list_available_presets()

    preset = input("Choose a preset to start from (or 'custom' for default): ").strip().lower()

    if preset in STYLE_PRESETS:
        style_dict = STYLE_PRESETS[preset].copy()
        print(f"\nStarting from '{preset}' preset")
    else:
        style_dict = {}
        print("\nStarting from default matplotlib style")

    print("\nCommon settings you might want to customize:")
    print("  1. Figure size")
    print("  2. Font sizes")
    print("  3. Line widths")
    print("  4. Grid settings")
    print("  5. Color scheme")
    print("  6. Done, show preview")

    while True:
        choice = input("\nSelect option (1-6): ").strip()

        if choice == '1':
            width = input("  Figure width (inches, default 10): ").strip() or '10'
            height = input("  Figure height (inches, default 6): ").strip() or '6'
            style_dict['figure.figsize'] = (float(width), float(height))

        elif choice == '2':
            base = input("  Base font size (default 12): ").strip() or '12'
            style_dict['font.size'] = float(base)
            style_dict['axes.labelsize'] = float(base) + 2
            style_dict['axes.titlesize'] = float(base) + 4

        elif choice == '3':
            lw = input("  Line width (default 2): ").strip() or '2'
            style_dict['lines.linewidth'] = float(lw)

        elif choice == '4':
            grid = input("  Enable grid? (y/n): ").strip().lower()
            style_dict['axes.grid'] = grid == 'y'
            if style_dict['axes.grid']:
                alpha = input("  Grid transparency (0-1, default 0.3): ").strip() or '0.3'
                style_dict['grid.alpha'] = float(alpha)

        elif choice == '5':
            print("  Theme options: 1=Light, 2=Dark")
            theme = input("  Select theme (1-2): ").strip()
            if theme == '2':
                style_dict.update(STYLE_PRESETS['dark'])

        elif choice == '6':
            break

    return style_dict


def main():
    """Main function."""
    parser = argparse.ArgumentParser(
        description='Matplotlib style configurator',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Show available presets
  python style_configurator.py --list

  # Preview a preset
  python style_configurator.py --preset publication --preview

  # Save a preset as .mplstyle file
  python style_configurator.py --preset publication --output my_style.mplstyle

  # Interactive mode
  python style_configurator.py --interactive
        """
    )
    parser.add_argument('--preset', type=str, choices=list(STYLE_PRESETS.keys()),
                       help='Use a predefined style preset')
    parser.add_argument('--output', type=str,
                       help='Save style to .mplstyle file')
    parser.add_argument('--preview', action='store_true',
                       help='Show style preview')
    parser.add_argument('--list', action='store_true',
                       help='List available presets')
    parser.add_argument('--interactive', action='store_true',
                       help='Run in interactive mode')

    args = parser.parse_args()

    if args.list:
        list_available_presets()
        # Also show currently available matplotlib styles
        print("\nBuilt-in matplotlib styles:")
        print("-" * 40)
        for style in sorted(plt.style.available):
            print(f"  {style}")
        return

    if args.interactive:
        style_dict = interactive_mode()
    elif args.preset:
        style_dict = STYLE_PRESETS[args.preset].copy()
        print(f"Using '{args.preset}' preset")
    else:
        print("No preset or interactive mode specified. Showing default preview.")
        style_dict = {}

    if style_dict:
        print_style_info(style_dict)

    if args.output:
        save_style_file(style_dict, args.output)

    if args.preview or args.interactive:
        print("Creating style preview...")
        fig = create_style_preview(style_dict if style_dict else None)

        if args.output:
            preview_filename = args.output.replace('.mplstyle', '_preview.png')
            plt.savefig(preview_filename, dpi=150, bbox_inches='tight')
            print(f"Preview saved to {preview_filename}")

        plt.show()


if __name__ == "__main__":
    main()
