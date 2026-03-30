#!/usr/bin/env python3
"""
Convert DICOM files to common image formats (PNG, JPEG, TIFF).

Usage:
    python dicom_to_image.py input.dcm output.png
    python dicom_to_image.py input.dcm output.jpg --format JPEG
    python dicom_to_image.py input.dcm output.tiff --apply-windowing
"""

import argparse
import sys
from pathlib import Path

try:
    import pydicom
    import numpy as np
    from PIL import Image
except ImportError as e:
    print(f"Error: Required package not installed: {e}")
    print("Install with: pip install pydicom pillow numpy")
    sys.exit(1)


def apply_windowing(pixel_array, ds):
    """Apply VOI LUT windowing if available."""
    try:
        from pydicom.pixel_data_handlers.util import apply_voi_lut
        return apply_voi_lut(pixel_array, ds)
    except (ImportError, AttributeError):
        return pixel_array


def normalize_to_uint8(pixel_array):
    """Normalize pixel array to uint8 (0-255) range."""
    if pixel_array.dtype == np.uint8:
        return pixel_array

    # Normalize to 0-1 range
    pix_min = pixel_array.min()
    pix_max = pixel_array.max()

    if pix_max > pix_min:
        normalized = (pixel_array - pix_min) / (pix_max - pix_min)
    else:
        normalized = np.zeros_like(pixel_array, dtype=float)

    # Scale to 0-255
    return (normalized * 255).astype(np.uint8)


def convert_dicom_to_image(input_path, output_path, image_format='PNG',
                          apply_window=False, frame=0):
    """
    Convert DICOM file to standard image format.

    Args:
        input_path: Path to input DICOM file
        output_path: Path to output image file
        image_format: Output format (PNG, JPEG, TIFF, etc.)
        apply_window: Whether to apply VOI LUT windowing
        frame: Frame number for multi-frame DICOM files
    """
    try:
        # Read DICOM file
        ds = pydicom.dcmread(input_path)

        # Get pixel array
        pixel_array = ds.pixel_array

        # Handle multi-frame DICOM
        if len(pixel_array.shape) == 3 and pixel_array.shape[0] > 1:
            if frame >= pixel_array.shape[0]:
                return False, f"Frame {frame} out of range (0-{pixel_array.shape[0]-1})"
            pixel_array = pixel_array[frame]
            print(f"Extracting frame {frame} of {ds.NumberOfFrames}")

        # Apply windowing if requested
        if apply_window and hasattr(ds, 'WindowCenter'):
            pixel_array = apply_windowing(pixel_array, ds)

        # Handle color images
        if len(pixel_array.shape) == 3 and pixel_array.shape[2] in [3, 4]:
            # RGB or RGBA image
            if ds.PhotometricInterpretation in ['YBR_FULL', 'YBR_FULL_422']:
                # Convert from YBR to RGB
                try:
                    from pydicom.pixel_data_handlers.util import convert_color_space
                    pixel_array = convert_color_space(pixel_array,
                                                     ds.PhotometricInterpretation, 'RGB')
                except ImportError:
                    print("Warning: Could not convert color space, using as-is")

            image = Image.fromarray(pixel_array)
        else:
            # Grayscale image - normalize to uint8
            pixel_array = normalize_to_uint8(pixel_array)
            image = Image.fromarray(pixel_array, mode='L')

        # Save image
        image.save(output_path, format=image_format)

        return True, {
            'shape': ds.pixel_array.shape,
            'modality': ds.Modality if hasattr(ds, 'Modality') else 'Unknown',
            'bits_allocated': ds.BitsAllocated if hasattr(ds, 'BitsAllocated') else 'Unknown',
        }

    except Exception as e:
        return False, str(e)


def main():
    parser = argparse.ArgumentParser(
        description='Convert DICOM files to common image formats',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python dicom_to_image.py input.dcm output.png
  python dicom_to_image.py input.dcm output.jpg --format JPEG
  python dicom_to_image.py input.dcm output.tiff --apply-windowing
  python dicom_to_image.py multiframe.dcm frame5.png --frame 5
        """
    )

    parser.add_argument('input', type=str, help='Input DICOM file')
    parser.add_argument('output', type=str, help='Output image file')
    parser.add_argument('--format', type=str, choices=['PNG', 'JPEG', 'TIFF', 'BMP'],
                       help='Output image format (default: inferred from extension)')
    parser.add_argument('--apply-windowing', action='store_true',
                       help='Apply VOI LUT windowing if available')
    parser.add_argument('--frame', type=int, default=0,
                       help='Frame number for multi-frame DICOM files (default: 0)')
    parser.add_argument('-v', '--verbose', action='store_true',
                       help='Show detailed conversion information')

    args = parser.parse_args()

    # Validate input file exists
    input_path = Path(args.input)
    if not input_path.exists():
        print(f"Error: Input file '{args.input}' not found")
        sys.exit(1)

    # Determine output format
    if args.format:
        image_format = args.format
    else:
        # Infer from extension
        ext = Path(args.output).suffix.upper().lstrip('.')
        image_format = ext if ext in ['PNG', 'JPEG', 'JPG', 'TIFF', 'BMP'] else 'PNG'

    # Convert the file
    print(f"Converting: {args.input} -> {args.output}")
    success, result = convert_dicom_to_image(args.input, args.output,
                                            image_format, args.apply_windowing,
                                            args.frame)

    if success:
        print(f"✓ Successfully converted to {image_format}")
        if args.verbose:
            print(f"\nImage information:")
            print(f"  - Shape: {result['shape']}")
            print(f"  - Modality: {result['modality']}")
            print(f"  - Bits Allocated: {result['bits_allocated']}")
    else:
        print(f"✗ Error: {result}")
        sys.exit(1)


if __name__ == '__main__':
    main()
