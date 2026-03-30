#!/usr/bin/env python3
"""
Combine slide images into a single PDF presentation.

This script takes multiple slide images (PNG, JPG) and combines them
into a single PDF file, maintaining aspect ratio and quality.

Usage:
    # Combine all PNG files in a directory
    python slides_to_pdf.py slides/*.png -o presentation.pdf
    
    # Combine specific files in order
    python slides_to_pdf.py slide_01.png slide_02.png slide_03.png -o presentation.pdf
    
    # From a directory (sorted by filename)
    python slides_to_pdf.py slides/ -o presentation.pdf
"""

import argparse
import sys
from pathlib import Path
from typing import List

try:
    from PIL import Image
except ImportError:
    print("Error: Pillow library not found. Install with: pip install Pillow")
    sys.exit(1)


def get_image_files(paths: List[str]) -> List[Path]:
    """
    Get list of image files from paths (files or directories).
    
    Args:
        paths: List of file paths or directory paths
        
    Returns:
        Sorted list of image file paths
    """
    image_extensions = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'}
    image_files = []
    
    for path_str in paths:
        path = Path(path_str)
        
        if path.is_file():
            if path.suffix.lower() in image_extensions:
                image_files.append(path)
            else:
                print(f"Warning: Skipping non-image file: {path}")
        elif path.is_dir():
            # Get all images in directory
            for ext in image_extensions:
                image_files.extend(path.glob(f"*{ext}"))
                image_files.extend(path.glob(f"*{ext.upper()}"))
        else:
            # Try glob pattern
            parent = path.parent
            pattern = path.name
            if parent.exists():
                matches = list(parent.glob(pattern))
                for match in matches:
                    if match.suffix.lower() in image_extensions:
                        image_files.append(match)
    
    # Remove duplicates and sort
    image_files = list(set(image_files))
    image_files.sort(key=lambda x: x.name)
    
    return image_files


def combine_images_to_pdf(image_paths: List[Path], output_path: Path, 
                         dpi: int = 150, verbose: bool = False) -> bool:
    """
    Combine multiple images into a single PDF.
    
    Args:
        image_paths: List of image file paths
        output_path: Output PDF path
        dpi: Resolution for the PDF (default: 150)
        verbose: Print progress information
        
    Returns:
        True if successful, False otherwise
    """
    if not image_paths:
        print("Error: No image files found")
        return False
    
    if verbose:
        print(f"Combining {len(image_paths)} images into PDF...")
    
    # Load all images
    images = []
    for i, img_path in enumerate(image_paths):
        try:
            img = Image.open(img_path)
            # Convert to RGB if necessary (PDF doesn't support RGBA)
            if img.mode in ('RGBA', 'P'):
                # Create white background
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            images.append(img)
            
            if verbose:
                print(f"  [{i+1}/{len(image_paths)}] Loaded: {img_path.name} ({img.size[0]}x{img.size[1]})")
        except Exception as e:
            print(f"Error loading {img_path}: {e}")
            return False
    
    if not images:
        print("Error: No images could be loaded")
        return False
    
    # Create output directory if needed
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Save as PDF
    try:
        # First image
        first_image = images[0]
        
        # Remaining images (if any)
        remaining_images = images[1:] if len(images) > 1 else []
        
        # Save to PDF
        first_image.save(
            output_path,
            "PDF",
            resolution=dpi,
            save_all=True,
            append_images=remaining_images
        )
        
        if verbose:
            print(f"\n✓ PDF created: {output_path}")
            print(f"  Total slides: {len(images)}")
            file_size = output_path.stat().st_size
            if file_size > 1024 * 1024:
                print(f"  File size: {file_size / (1024 * 1024):.1f} MB")
            else:
                print(f"  File size: {file_size / 1024:.1f} KB")
        
        return True
    except Exception as e:
        print(f"Error creating PDF: {e}")
        return False
    finally:
        # Close all images
        for img in images:
            img.close()


def main():
    """Command-line interface."""
    parser = argparse.ArgumentParser(
        description="Combine slide images into a single PDF presentation",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Combine PNG files using glob pattern
  python slides_to_pdf.py slides/*.png -o presentation.pdf
  
  # Combine specific files in order
  python slides_to_pdf.py title.png intro.png methods.png results.png -o talk.pdf
  
  # Combine all images from a directory (sorted by filename)
  python slides_to_pdf.py slides/ -o presentation.pdf
  
  # With custom DPI and verbose output
  python slides_to_pdf.py slides/*.png -o presentation.pdf --dpi 200 -v

Supported formats: PNG, JPG, JPEG, GIF, WEBP, BMP

Tips:
  - Name your slide images with numbers for correct ordering:
    01_title.png, 02_intro.png, 03_methods.png, etc.
  - Use the generate_slide_image.py script to create slides first
  - Standard presentation aspect ratio is 16:9 (1920x1080 or 1280x720)
        """
    )
    
    parser.add_argument("images", nargs="+", 
                       help="Image files, directories, or glob patterns")
    parser.add_argument("-o", "--output", required=True,
                       help="Output PDF file path")
    parser.add_argument("--dpi", type=int, default=150,
                       help="PDF resolution in DPI (default: 150)")
    parser.add_argument("-v", "--verbose", action="store_true",
                       help="Verbose output")
    
    args = parser.parse_args()
    
    # Get image files
    image_files = get_image_files(args.images)
    
    if not image_files:
        print("Error: No image files found matching the specified paths")
        print("\nUsage examples:")
        print("  python slides_to_pdf.py slides/*.png -o presentation.pdf")
        print("  python slides_to_pdf.py slide1.png slide2.png -o presentation.pdf")
        sys.exit(1)
    
    print(f"Found {len(image_files)} image(s)")
    if args.verbose:
        for f in image_files:
            print(f"  - {f}")
    
    # Combine into PDF
    output_path = Path(args.output)
    success = combine_images_to_pdf(
        image_files, 
        output_path, 
        dpi=args.dpi, 
        verbose=args.verbose
    )
    
    if success:
        print(f"\n✓ PDF created: {output_path}")
        sys.exit(0)
    else:
        print(f"\n✗ Failed to create PDF")
        sys.exit(1)


if __name__ == "__main__":
    main()
