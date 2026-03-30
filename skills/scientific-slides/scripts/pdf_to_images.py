#!/usr/bin/env python3
"""
PDF to Images Converter for Presentations

Converts presentation PDFs to images for visual inspection and review.
Supports multiple output formats and resolutions.

Uses PyMuPDF (fitz) as the primary conversion method - no external
dependencies required (no poppler, ghostscript, or ImageMagick needed).
"""

import sys
import argparse
from pathlib import Path
from typing import Optional, List

# Try to import pymupdf (preferred - no external dependencies)
try:
    import fitz  # PyMuPDF
    HAS_PYMUPDF = True
except ImportError:
    HAS_PYMUPDF = False


class PDFToImagesConverter:
    """Converts PDF presentations to images."""
    
    def __init__(
        self,
        pdf_path: str,
        output_prefix: str,
        dpi: int = 150,
        format: str = 'jpg',
        first_page: Optional[int] = None,
        last_page: Optional[int] = None
    ):
        self.pdf_path = Path(pdf_path)
        self.output_prefix = output_prefix
        self.dpi = dpi
        self.format = format.lower()
        self.first_page = first_page
        self.last_page = last_page
        
        # Validate format
        if self.format not in ['jpg', 'jpeg', 'png']:
            raise ValueError(f"Unsupported format: {format}. Use jpg or png.")
    
    def convert(self) -> List[Path]:
        """Convert PDF to images using PyMuPDF."""
        if not self.pdf_path.exists():
            raise FileNotFoundError(f"PDF not found: {self.pdf_path}")
        
        print(f"Converting: {self.pdf_path.name}")
        print(f"Output prefix: {self.output_prefix}")
        print(f"DPI: {self.dpi}")
        print(f"Format: {self.format}")
        
        if HAS_PYMUPDF:
            return self._convert_with_pymupdf()
        else:
            raise RuntimeError(
                "PyMuPDF not installed. Install it with:\n"
                "  pip install pymupdf\n\n"
                "PyMuPDF is a self-contained library - no external dependencies needed."
            )
    
    def _convert_with_pymupdf(self) -> List[Path]:
        """Convert using PyMuPDF library (no external dependencies)."""
        print("Using PyMuPDF (no external dependencies required)...")
        
        # Open the PDF
        doc = fitz.open(self.pdf_path)
        
        # Determine page range
        start_page = (self.first_page - 1) if self.first_page else 0
        end_page = self.last_page if self.last_page else doc.page_count
        
        # Calculate zoom factor from DPI (72 DPI is the base)
        zoom = self.dpi / 72
        matrix = fitz.Matrix(zoom, zoom)
        
        output_files = []
        output_dir = Path(self.output_prefix).parent
        output_dir.mkdir(parents=True, exist_ok=True)
        
        for page_num in range(start_page, end_page):
            page = doc[page_num]
            
            # Render page to pixmap
            pixmap = page.get_pixmap(matrix=matrix)
            
            # Determine output path
            output_path = Path(f"{self.output_prefix}-{page_num + 1:03d}.{self.format}")
            
            # Save the image
            if self.format in ['jpg', 'jpeg']:
                pixmap.save(str(output_path), output="jpeg")
            else:
                pixmap.save(str(output_path), output="png")
            
            output_files.append(output_path)
            print(f"  Created: {output_path.name}")
        
        doc.close()
        return output_files


def main():
    parser = argparse.ArgumentParser(
        description='Convert presentation PDFs to images',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s presentation.pdf slides
    → Creates slides-001.jpg, slides-002.jpg, ...
  
  %(prog)s presentation.pdf output/slide --dpi 300 --format png
    → Creates output/slide-001.png, slide-002.png, ... at high resolution
  
  %(prog)s presentation.pdf review/s --first 5 --last 10
    → Converts only slides 5-10

Output:
  Images are named: PREFIX-001.FORMAT, PREFIX-002.FORMAT, etc.
  
Resolution:
  - 150 DPI: Good for screen review (default)
  - 200 DPI: Higher quality for detailed inspection
  - 300 DPI: Print quality (larger files)

Requirements:
  Install PyMuPDF (no external dependencies needed):
    pip install pymupdf
        """
    )
    
    parser.add_argument(
        'pdf_path',
        help='Path to PDF presentation'
    )
    
    parser.add_argument(
        'output_prefix',
        help='Output filename prefix (e.g., "slides" or "output/slide")'
    )
    
    parser.add_argument(
        '--dpi', '-r',
        type=int,
        default=150,
        help='Resolution in DPI (default: 150)'
    )
    
    parser.add_argument(
        '--format', '-f',
        choices=['jpg', 'jpeg', 'png'],
        default='jpg',
        help='Output format (default: jpg)'
    )
    
    parser.add_argument(
        '--first',
        type=int,
        help='First page to convert (1-indexed)'
    )
    
    parser.add_argument(
        '--last',
        type=int,
        help='Last page to convert (1-indexed)'
    )
    
    args = parser.parse_args()
    
    # Create output directory if needed
    output_dir = Path(args.output_prefix).parent
    if output_dir != Path('.'):
        output_dir.mkdir(parents=True, exist_ok=True)
    
    # Convert
    try:
        converter = PDFToImagesConverter(
            pdf_path=args.pdf_path,
            output_prefix=args.output_prefix,
            dpi=args.dpi,
            format=args.format,
            first_page=args.first,
            last_page=args.last
        )
        
        output_files = converter.convert()
        
        print()
        print("=" * 60)
        print(f"✅ Success! Created {len(output_files)} image(s)")
        print("=" * 60)
        
        if output_files:
            print(f"\nFirst image: {output_files[0]}")
            print(f"Last image: {output_files[-1]}")
            
            # Calculate total size
            total_size = sum(f.stat().st_size for f in output_files)
            size_mb = total_size / (1024 * 1024)
            print(f"Total size: {size_mb:.2f} MB")
            
            print("\nNext steps:")
            print("  1. Review images for layout issues")
            print("  2. Check for text overflow or element overlap")
            print("  3. Verify readability from distance")
            print("  4. Document issues with slide numbers")
        
        sys.exit(0)
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
