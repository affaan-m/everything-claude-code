#!/usr/bin/env python3
"""
PDF Generation Script for Literature Reviews
Converts markdown files to professionally formatted PDFs with proper styling.
"""

import subprocess
import sys
import os
from pathlib import Path

def generate_pdf(
    markdown_file: str,
    output_pdf: str = None,
    citation_style: str = "apa",
    template: str = None,
    toc: bool = True,
    number_sections: bool = True
) -> bool:
    """
    Generate a PDF from a markdown file using pandoc.

    Args:
        markdown_file: Path to the markdown file
        output_pdf: Path for output PDF (defaults to same name as markdown)
        citation_style: Citation style (apa, nature, chicago, etc.)
        template: Path to custom LaTeX template
        toc: Include table of contents
        number_sections: Number the sections

    Returns:
        True if successful, False otherwise
    """

    # Verify markdown file exists
    if not os.path.exists(markdown_file):
        print(f"Error: Markdown file not found: {markdown_file}")
        return False

    # Set default output path
    if output_pdf is None:
        output_pdf = Path(markdown_file).with_suffix('.pdf')

    # Check if pandoc is installed
    try:
        subprocess.run(['pandoc', '--version'], capture_output=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("Error: pandoc is not installed.")
        print("Install with: brew install pandoc (macOS) or apt-get install pandoc (Linux)")
        return False

    # Build pandoc command
    cmd = [
        'pandoc',
        markdown_file,
        '-o', str(output_pdf),
        '--pdf-engine=xelatex',  # Better Unicode support
        '-V', 'geometry:margin=1in',
        '-V', 'fontsize=11pt',
        '-V', 'colorlinks=true',
        '-V', 'linkcolor=blue',
        '-V', 'urlcolor=blue',
        '-V', 'citecolor=blue',
    ]

    # Add table of contents
    if toc:
        cmd.extend(['--toc', '--toc-depth=3'])

    # Add section numbering
    if number_sections:
        cmd.append('--number-sections')

    # Add citation processing if bibliography exists
    bib_file = Path(markdown_file).with_suffix('.bib')
    if bib_file.exists():
        cmd.extend([
            '--citeproc',
            '--bibliography', str(bib_file),
            '--csl', f'{citation_style}.csl' if not citation_style.endswith('.csl') else citation_style
        ])

    # Add custom template if provided
    if template and os.path.exists(template):
        cmd.extend(['--template', template])

    # Execute pandoc
    try:
        print(f"Generating PDF: {output_pdf}")
        print(f"Command: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print(f"✓ PDF generated successfully: {output_pdf}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error generating PDF:")
        print(f"STDOUT: {e.stdout}")
        print(f"STDERR: {e.stderr}")
        return False

def check_dependencies():
    """Check if required dependencies are installed."""
    dependencies = {
        'pandoc': 'pandoc --version',
        'xelatex': 'xelatex --version'
    }

    missing = []
    for name, cmd in dependencies.items():
        try:
            subprocess.run(cmd.split(), capture_output=True, check=True)
            print(f"✓ {name} is installed")
        except (subprocess.CalledProcessError, FileNotFoundError):
            print(f"✗ {name} is NOT installed")
            missing.append(name)

    if missing:
        print("\n" + "="*60)
        print("Missing dependencies:")
        for dep in missing:
            if dep == 'pandoc':
                print("  - pandoc: brew install pandoc (macOS) or apt-get install pandoc (Linux)")
            elif dep == 'xelatex':
                print("  - xelatex: brew install --cask mactex (macOS) or apt-get install texlive-xetex (Linux)")
        return False

    return True

def main():
    """Command-line interface."""
    if len(sys.argv) < 2:
        print("Usage: python generate_pdf.py <markdown_file> [output_pdf] [--citation-style STYLE]")
        print("\nOptions:")
        print("  --citation-style STYLE    Citation style (default: apa)")
        print("  --no-toc                  Disable table of contents")
        print("  --no-numbers              Disable section numbering")
        print("  --check-deps              Check if dependencies are installed")
        sys.exit(1)

    # Check dependencies mode
    if '--check-deps' in sys.argv:
        check_dependencies()
        sys.exit(0)

    # Parse arguments
    markdown_file = sys.argv[1]
    output_pdf = sys.argv[2] if len(sys.argv) > 2 and not sys.argv[2].startswith('--') else None

    citation_style = 'apa'
    toc = True
    number_sections = True

    # Parse optional flags
    if '--citation-style' in sys.argv:
        idx = sys.argv.index('--citation-style')
        if idx + 1 < len(sys.argv):
            citation_style = sys.argv[idx + 1]

    if '--no-toc' in sys.argv:
        toc = False

    if '--no-numbers' in sys.argv:
        number_sections = False

    # Generate PDF
    success = generate_pdf(
        markdown_file,
        output_pdf,
        citation_style=citation_style,
        toc=toc,
        number_sections=number_sections
    )

    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
