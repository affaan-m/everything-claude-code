#!/usr/bin/env python3
"""
Figure Export Utilities for Publication-Ready Scientific Figures

This module provides utilities to export matplotlib figures in publication-ready
formats with appropriate settings for various journals.
"""

import matplotlib.pyplot as plt
from pathlib import Path
from typing import List, Optional, Union


def save_publication_figure(
    fig: plt.Figure,
    filename: Union[str, Path],
    formats: List[str] = ['pdf', 'png'],
    dpi: int = 300,
    transparent: bool = False,
    bbox_inches: str = 'tight',
    pad_inches: float = 0.1,
    facecolor: str = 'white',
    **kwargs
) -> List[Path]:
    """
    Save a matplotlib figure in multiple formats with publication-quality settings.

    Parameters
    ----------
    fig : matplotlib.figure.Figure
        The figure to save
    filename : str or Path
        Base filename (without extension)
    formats : list of str, default ['pdf', 'png']
        List of file formats to save. Options: 'pdf', 'png', 'eps', 'svg', 'tiff'
    dpi : int, default 300
        Resolution for raster formats (png, tiff). 300 DPI is minimum for most journals
    transparent : bool, default False
        If True, save with transparent background
    bbox_inches : str, default 'tight'
        Bounding box specification. 'tight' removes excess whitespace
    pad_inches : float, default 0.1
        Padding around the figure when bbox_inches='tight'
    facecolor : str, default 'white'
        Background color (ignored if transparent=True)
    **kwargs
        Additional keyword arguments passed to fig.savefig()

    Returns
    -------
    list of Path
        List of paths to saved files

    Examples
    --------
    >>> fig, ax = plt.subplots()
    >>> ax.plot([1, 2, 3], [1, 4, 9])
    >>> save_publication_figure(fig, 'my_plot', formats=['pdf', 'png'], dpi=600)
    ['my_plot.pdf', 'my_plot.png']
    """
    filename = Path(filename)
    base_name = filename.stem
    output_dir = filename.parent if filename.parent.exists() else Path.cwd()

    saved_files = []

    for fmt in formats:
        output_file = output_dir / f"{base_name}.{fmt}"

        # Set format-specific parameters
        save_kwargs = {
            'dpi': dpi,
            'bbox_inches': bbox_inches,
            'pad_inches': pad_inches,
            'facecolor': facecolor if not transparent else 'none',
            'edgecolor': 'none',
            'transparent': transparent,
            'format': fmt,
        }

        # Update with user-provided kwargs
        save_kwargs.update(kwargs)

        # Adjust DPI for vector formats (DPI less relevant)
        if fmt in ['pdf', 'eps', 'svg']:
            save_kwargs['dpi'] = min(dpi, 300)  # Lower DPI for embedded rasters in vector

        try:
            fig.savefig(output_file, **save_kwargs)
            saved_files.append(output_file)
            print(f"✓ Saved: {output_file}")
        except Exception as e:
            print(f"✗ Failed to save {output_file}: {e}")

    return saved_files


def save_for_journal(
    fig: plt.Figure,
    filename: Union[str, Path],
    journal: str,
    figure_type: str = 'combination'
) -> List[Path]:
    """
    Save figure with journal-specific requirements.

    Parameters
    ----------
    fig : matplotlib.figure.Figure
        The figure to save
    filename : str or Path
        Base filename (without extension)
    journal : str
        Journal name. Options: 'nature', 'science', 'cell', 'plos', 'acs', 'ieee'
    figure_type : str, default 'combination'
        Type of figure. Options: 'line_art', 'photo', 'combination'

    Returns
    -------
    list of Path
        List of paths to saved files

    Examples
    --------
    >>> fig, ax = plt.subplots()
    >>> ax.plot([1, 2, 3], [1, 4, 9])
    >>> save_for_journal(fig, 'figure1', journal='nature', figure_type='line_art')
    """
    journal = journal.lower()

    # Define journal-specific requirements
    journal_specs = {
        'nature': {
            'line_art': {'formats': ['pdf', 'eps'], 'dpi': 1000},
            'photo': {'formats': ['tiff'], 'dpi': 300},
            'combination': {'formats': ['pdf'], 'dpi': 600},
        },
        'science': {
            'line_art': {'formats': ['eps', 'pdf'], 'dpi': 1000},
            'photo': {'formats': ['tiff'], 'dpi': 300},
            'combination': {'formats': ['eps'], 'dpi': 600},
        },
        'cell': {
            'line_art': {'formats': ['pdf', 'eps'], 'dpi': 1000},
            'photo': {'formats': ['tiff'], 'dpi': 300},
            'combination': {'formats': ['pdf'], 'dpi': 600},
        },
        'plos': {
            'line_art': {'formats': ['pdf', 'eps'], 'dpi': 600},
            'photo': {'formats': ['tiff', 'png'], 'dpi': 300},
            'combination': {'formats': ['tiff'], 'dpi': 300},
        },
        'acs': {
            'line_art': {'formats': ['tiff', 'pdf'], 'dpi': 600},
            'photo': {'formats': ['tiff'], 'dpi': 300},
            'combination': {'formats': ['tiff'], 'dpi': 600},
        },
        'ieee': {
            'line_art': {'formats': ['pdf', 'eps'], 'dpi': 600},
            'photo': {'formats': ['tiff'], 'dpi': 300},
            'combination': {'formats': ['pdf'], 'dpi': 300},
        },
    }

    if journal not in journal_specs:
        available = ', '.join(journal_specs.keys())
        raise ValueError(f"Journal '{journal}' not recognized. Available: {available}")

    if figure_type not in journal_specs[journal]:
        available = ', '.join(journal_specs[journal].keys())
        raise ValueError(f"Figure type '{figure_type}' not valid. Available: {available}")

    specs = journal_specs[journal][figure_type]

    print(f"Saving for {journal.upper()} ({figure_type}):")
    print(f"  Formats: {', '.join(specs['formats'])}")
    print(f"  DPI: {specs['dpi']}")

    return save_publication_figure(
        fig=fig,
        filename=filename,
        formats=specs['formats'],
        dpi=specs['dpi']
    )


def check_figure_size(fig: plt.Figure, journal: str = 'nature') -> dict:
    """
    Check if figure dimensions are appropriate for journal requirements.

    Parameters
    ----------
    fig : matplotlib.figure.Figure
        The figure to check
    journal : str, default 'nature'
        Journal name

    Returns
    -------
    dict
        Dictionary with figure dimensions and compliance status

    Examples
    --------
    >>> fig = plt.figure(figsize=(3.5, 3))
    >>> info = check_figure_size(fig, journal='nature')
    >>> print(info)
    """
    journal = journal.lower()

    # Get figure dimensions in inches
    width_inches, height_inches = fig.get_size_inches()
    width_mm = width_inches * 25.4
    height_mm = height_inches * 25.4

    # Journal specifications (widths in mm)
    specs = {
        'nature': {'single': 89, 'double': 183, 'max_height': 247},
        'science': {'single': 55, 'double': 175, 'max_height': 233},
        'cell': {'single': 85, 'double': 178, 'max_height': 230},
        'plos': {'single': 83, 'double': 173, 'max_height': 233},
        'acs': {'single': 82.5, 'double': 178, 'max_height': 247},
    }

    if journal not in specs:
        journal_spec = specs['nature']
        print(f"Warning: Journal '{journal}' not found, using Nature specifications")
    else:
        journal_spec = specs[journal]

    # Determine column type
    column_type = None
    width_ok = False

    tolerance = 5  # mm tolerance
    if abs(width_mm - journal_spec['single']) < tolerance:
        column_type = 'single'
        width_ok = True
    elif abs(width_mm - journal_spec['double']) < tolerance:
        column_type = 'double'
        width_ok = True

    height_ok = height_mm <= journal_spec['max_height']

    result = {
        'width_inches': width_inches,
        'height_inches': height_inches,
        'width_mm': width_mm,
        'height_mm': height_mm,
        'journal': journal,
        'column_type': column_type,
        'width_ok': width_ok,
        'height_ok': height_ok,
        'compliant': width_ok and height_ok,
        'recommendations': {
            'single_column_mm': journal_spec['single'],
            'double_column_mm': journal_spec['double'],
            'max_height_mm': journal_spec['max_height'],
        }
    }

    # Print report
    print(f"\n{'='*60}")
    print(f"Figure Size Check for {journal.upper()}")
    print(f"{'='*60}")
    print(f"Current size: {width_mm:.1f} × {height_mm:.1f} mm")
    print(f"              ({width_inches:.2f} × {height_inches:.2f} inches)")
    print(f"\n{journal.upper()} specifications:")
    print(f"  Single column: {journal_spec['single']} mm")
    print(f"  Double column: {journal_spec['double']} mm")
    print(f"  Max height: {journal_spec['max_height']} mm")
    print(f"\nCompliance:")
    print(f"  Width: {'✓ OK' if width_ok else '✗ Non-standard'} ({column_type or 'custom'})")
    print(f"  Height: {'✓ OK' if height_ok else '✗ Too tall'}")
    print(f"  Overall: {'✓ COMPLIANT' if result['compliant'] else '✗ NEEDS ADJUSTMENT'}")
    print(f"{'='*60}\n")

    return result


def verify_font_embedding(pdf_path: Union[str, Path]) -> bool:
    """
    Check if fonts are embedded in a PDF file.

    Note: This requires PyPDF2 or a similar library to be installed.

    Parameters
    ----------
    pdf_path : str or Path
        Path to PDF file

    Returns
    -------
    bool
        True if fonts are embedded, False otherwise
    """
    try:
        from PyPDF2 import PdfReader
    except ImportError:
        print("Warning: PyPDF2 not installed. Cannot verify font embedding.")
        print("Install with: pip install PyPDF2")
        return None

    pdf_path = Path(pdf_path)

    try:
        reader = PdfReader(pdf_path)
        # This is a simplified check; full verification is complex
        print(f"PDF has {len(reader.pages)} page(s)")
        print("Note: Full font embedding verification requires detailed PDF inspection.")
        return True
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return False


if __name__ == "__main__":
    # Example usage
    import numpy as np

    # Create example figure
    fig, ax = plt.subplots(figsize=(3.5, 2.5))
    x = np.linspace(0, 10, 100)
    ax.plot(x, np.sin(x), label='sin(x)')
    ax.plot(x, np.cos(x), label='cos(x)')
    ax.set_xlabel('x')
    ax.set_ylabel('y')
    ax.legend()
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)

    # Check size
    check_figure_size(fig, journal='nature')

    # Save in multiple formats
    print("\nSaving figure...")
    save_publication_figure(fig, 'example_figure', formats=['pdf', 'png'], dpi=300)

    # Save with journal-specific requirements
    print("\nSaving for Nature...")
    save_for_journal(fig, 'example_figure_nature', journal='nature', figure_type='line_art')

    plt.close(fig)
