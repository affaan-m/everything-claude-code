#!/usr/bin/env python3
"""
Matplotlib Style Presets for Publication-Ready Scientific Figures

This module provides pre-configured matplotlib styles optimized for
different journals and use cases.
"""

import matplotlib.pyplot as plt
import matplotlib as mpl
from typing import Optional, Dict, Any


# Okabe-Ito colorblind-friendly palette
OKABE_ITO_COLORS = [
    '#E69F00',  # Orange
    '#56B4E9',  # Sky Blue
    '#009E73',  # Bluish Green
    '#F0E442',  # Yellow
    '#0072B2',  # Blue
    '#D55E00',  # Vermillion
    '#CC79A7',  # Reddish Purple
    '#000000'   # Black
]

# Paul Tol palettes
TOL_BRIGHT = ['#4477AA', '#EE6677', '#228833', '#CCBB44', '#66CCEE', '#AA3377', '#BBBBBB']
TOL_MUTED = ['#332288', '#88CCEE', '#44AA99', '#117733', '#999933', '#DDCC77', '#CC6677', '#882255', '#AA4499']
TOL_HIGH_CONTRAST = ['#004488', '#DDAA33', '#BB5566']

# Wong palette
WONG_COLORS = ['#000000', '#E69F00', '#56B4E9', '#009E73', '#F0E442', '#0072B2', '#D55E00', '#CC79A7']


def get_base_style() -> Dict[str, Any]:
    """
    Get base publication-quality style settings.

    Returns
    -------
    dict
        Dictionary of matplotlib rcParams
    """
    return {
        # Figure
        'figure.dpi': 100,  # Display DPI (changed on save)
        'figure.facecolor': 'white',
        'figure.autolayout': False,
        'figure.constrained_layout.use': True,

        # Font
        'font.size': 8,
        'font.family': 'sans-serif',
        'font.sans-serif': ['Arial', 'Helvetica', 'DejaVu Sans'],

        # Axes
        'axes.linewidth': 0.5,
        'axes.labelsize': 9,
        'axes.titlesize': 9,
        'axes.labelweight': 'normal',
        'axes.spines.top': False,
        'axes.spines.right': False,
        'axes.spines.left': True,
        'axes.spines.bottom': True,
        'axes.edgecolor': 'black',
        'axes.labelcolor': 'black',
        'axes.axisbelow': True,
        'axes.prop_cycle': mpl.cycler(color=OKABE_ITO_COLORS),

        # Grid
        'axes.grid': False,

        # Ticks
        'xtick.major.size': 3,
        'xtick.minor.size': 2,
        'xtick.major.width': 0.5,
        'xtick.minor.width': 0.5,
        'xtick.labelsize': 7,
        'xtick.direction': 'out',
        'ytick.major.size': 3,
        'ytick.minor.size': 2,
        'ytick.major.width': 0.5,
        'ytick.minor.width': 0.5,
        'ytick.labelsize': 7,
        'ytick.direction': 'out',

        # Lines
        'lines.linewidth': 1.5,
        'lines.markersize': 4,
        'lines.markeredgewidth': 0.5,

        # Legend
        'legend.fontsize': 7,
        'legend.frameon': False,
        'legend.loc': 'best',

        # Savefig
        'savefig.dpi': 300,
        'savefig.format': 'pdf',
        'savefig.bbox': 'tight',
        'savefig.pad_inches': 0.05,
        'savefig.transparent': False,
        'savefig.facecolor': 'white',

        # Image
        'image.cmap': 'viridis',
        'image.aspect': 'auto',
    }


def apply_publication_style(style_name: str = 'default') -> None:
    """
    Apply a pre-configured publication style.

    Parameters
    ----------
    style_name : str, default 'default'
        Name of the style to apply. Options:
        - 'default': General publication style
        - 'nature': Nature journal style
        - 'science': Science journal style
        - 'cell': Cell Press style
        - 'minimal': Minimal clean style
        - 'presentation': Larger fonts for presentations

    Examples
    --------
    >>> apply_publication_style('nature')
    >>> fig, ax = plt.subplots()
    >>> ax.plot([1, 2, 3], [1, 4, 9])
    """
    base_style = get_base_style()

    # Style-specific modifications
    if style_name == 'nature':
        base_style.update({
            'font.size': 7,
            'axes.labelsize': 8,
            'axes.titlesize': 8,
            'xtick.labelsize': 6,
            'ytick.labelsize': 6,
            'legend.fontsize': 6,
            'savefig.dpi': 600,
        })

    elif style_name == 'science':
        base_style.update({
            'font.size': 7,
            'axes.labelsize': 8,
            'xtick.labelsize': 6,
            'ytick.labelsize': 6,
            'legend.fontsize': 6,
            'savefig.dpi': 600,
        })

    elif style_name == 'cell':
        base_style.update({
            'font.size': 8,
            'axes.labelsize': 9,
            'xtick.labelsize': 7,
            'ytick.labelsize': 7,
            'legend.fontsize': 7,
            'savefig.dpi': 600,
        })

    elif style_name == 'minimal':
        base_style.update({
            'axes.linewidth': 0.8,
            'xtick.major.width': 0.8,
            'ytick.major.width': 0.8,
            'lines.linewidth': 2,
        })

    elif style_name == 'presentation':
        base_style.update({
            'font.size': 14,
            'axes.labelsize': 16,
            'axes.titlesize': 18,
            'xtick.labelsize': 12,
            'ytick.labelsize': 12,
            'legend.fontsize': 12,
            'axes.linewidth': 1.5,
            'lines.linewidth': 2.5,
            'lines.markersize': 8,
        })

    elif style_name != 'default':
        print(f"Warning: Style '{style_name}' not recognized. Using 'default'.")

    # Apply the style
    plt.rcParams.update(base_style)
    print(f"✓ Applied '{style_name}' publication style")


def set_color_palette(palette_name: str = 'okabe_ito') -> None:
    """
    Set a colorblind-friendly color palette.

    Parameters
    ----------
    palette_name : str, default 'okabe_ito'
        Name of the palette. Options:
        - 'okabe_ito': Okabe-Ito palette (8 colors)
        - 'wong': Wong palette (8 colors)
        - 'tol_bright': Paul Tol bright palette (7 colors)
        - 'tol_muted': Paul Tol muted palette (9 colors)
        - 'tol_high_contrast': Paul Tol high contrast (3 colors)

    Examples
    --------
    >>> set_color_palette('tol_muted')
    >>> fig, ax = plt.subplots()
    >>> for i in range(5):
    ...     ax.plot([1, 2, 3], [i, i+1, i+2])
    """
    palettes = {
        'okabe_ito': OKABE_ITO_COLORS,
        'wong': WONG_COLORS,
        'tol_bright': TOL_BRIGHT,
        'tol_muted': TOL_MUTED,
        'tol_high_contrast': TOL_HIGH_CONTRAST,
    }

    if palette_name not in palettes:
        available = ', '.join(palettes.keys())
        print(f"Warning: Palette '{palette_name}' not found. Available: {available}")
        palette_name = 'okabe_ito'

    colors = palettes[palette_name]
    plt.rcParams['axes.prop_cycle'] = plt.cycler(color=colors)
    print(f"✓ Applied '{palette_name}' color palette ({len(colors)} colors)")


def configure_for_journal(journal: str, figure_width: str = 'single') -> None:
    """
    Configure matplotlib for a specific journal.

    Parameters
    ----------
    journal : str
        Journal name: 'nature', 'science', 'cell', 'plos', 'acs', 'ieee'
    figure_width : str, default 'single'
        Figure width: 'single' or 'double' column

    Examples
    --------
    >>> configure_for_journal('nature', figure_width='single')
    >>> fig, ax = plt.subplots()  # Will have correct size for Nature
    """
    journal = journal.lower()

    # Journal specifications
    journal_configs = {
        'nature': {
            'single_width': 89,  # mm
            'double_width': 183,
            'style': 'nature',
        },
        'science': {
            'single_width': 55,
            'double_width': 175,
            'style': 'science',
        },
        'cell': {
            'single_width': 85,
            'double_width': 178,
            'style': 'cell',
        },
        'plos': {
            'single_width': 83,
            'double_width': 173,
            'style': 'default',
        },
        'acs': {
            'single_width': 82.5,
            'double_width': 178,
            'style': 'default',
        },
        'ieee': {
            'single_width': 89,
            'double_width': 182,
            'style': 'default',
        },
    }

    if journal not in journal_configs:
        available = ', '.join(journal_configs.keys())
        raise ValueError(f"Journal '{journal}' not recognized. Available: {available}")

    config = journal_configs[journal]

    # Apply style
    apply_publication_style(config['style'])

    # Set default figure size
    width_mm = config['single_width'] if figure_width == 'single' else config['double_width']
    width_inches = width_mm / 25.4
    plt.rcParams['figure.figsize'] = (width_inches, width_inches * 0.75)  # 4:3 aspect ratio

    print(f"✓ Configured for {journal.upper()} ({figure_width} column: {width_mm} mm)")


def create_style_template(output_file: str = 'publication.mplstyle') -> None:
    """
    Create a matplotlib style file that can be used with plt.style.use().

    Parameters
    ----------
    output_file : str, default 'publication.mplstyle'
        Output filename for the style file

    Examples
    --------
    >>> create_style_template('my_style.mplstyle')
    >>> plt.style.use('my_style.mplstyle')
    """
    style = get_base_style()

    with open(output_file, 'w') as f:
        f.write("# Publication-quality matplotlib style\n")
        f.write("# Usage: plt.style.use('publication.mplstyle')\n\n")

        for key, value in style.items():
            if isinstance(value, mpl.cycler):
                # Handle cycler specially
                colors = [c['color'] for c in value]
                f.write(f"axes.prop_cycle : cycler('color', {colors})\n")
            else:
                f.write(f"{key} : {value}\n")

    print(f"✓ Created style template: {output_file}")
    print(f"  Use with: plt.style.use('{output_file}')")


def show_color_palettes() -> None:
    """
    Display available color palettes for visual inspection.
    """
    palettes = {
        'Okabe-Ito': OKABE_ITO_COLORS,
        'Wong': WONG_COLORS,
        'Tol Bright': TOL_BRIGHT,
        'Tol Muted': TOL_MUTED,
        'Tol High Contrast': TOL_HIGH_CONTRAST,
    }

    fig, axes = plt.subplots(len(palettes), 1, figsize=(8, len(palettes) * 0.5))

    for ax, (name, colors) in zip(axes, palettes.items()):
        ax.set_xlim(0, len(colors))
        ax.set_ylim(0, 1)
        ax.set_yticks([])
        ax.set_xticks([])
        ax.set_ylabel(name, fontsize=10)

        for i, color in enumerate(colors):
            ax.add_patch(plt.Rectangle((i, 0), 1, 1, facecolor=color, edgecolor='black', linewidth=0.5))
            # Add hex code
            ax.text(i + 0.5, 0.5, color, ha='center', va='center',
                   fontsize=7, color='white' if i >= len(colors) - 1 else 'black')

    fig.suptitle('Colorblind-Friendly Palettes', fontsize=12, fontweight='bold')
    plt.tight_layout()
    plt.show()


def reset_to_default() -> None:
    """
    Reset matplotlib to default settings.
    """
    mpl.rcdefaults()
    print("✓ Reset to matplotlib defaults")


if __name__ == "__main__":
    print("Matplotlib Style Presets for Scientific Figures")
    print("=" * 50)

    # Show available styles
    print("\nAvailable publication styles:")
    print("  - default")
    print("  - nature")
    print("  - science")
    print("  - cell")
    print("  - minimal")
    print("  - presentation")

    print("\nAvailable color palettes:")
    print("  - okabe_ito (recommended)")
    print("  - wong")
    print("  - tol_bright")
    print("  - tol_muted")
    print("  - tol_high_contrast")

    print("\nExample usage:")
    print("  from style_presets import apply_publication_style, set_color_palette")
    print("  apply_publication_style('nature')")
    print("  set_color_palette('okabe_ito')")

    # Create example figure
    print("\nGenerating example figure with 'default' style...")
    apply_publication_style('default')

    fig, ax = plt.subplots(figsize=(3.5, 2.5))
    for i in range(5):
        ax.plot([1, 2, 3, 4], [i, i+1, i+0.5, i+2], marker='o', label=f'Series {i+1}')
    ax.set_xlabel('Time (hours)')
    ax.set_ylabel('Response (AU)')
    ax.legend()
    fig.suptitle('Example with Publication Style')
    plt.tight_layout()
    plt.show()

    # Show color palettes
    print("\nDisplaying color palettes...")
    show_color_palettes()
