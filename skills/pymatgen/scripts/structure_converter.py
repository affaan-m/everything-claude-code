#!/usr/bin/env python3
"""
Structure file format converter using pymatgen.

This script converts between different structure file formats supported by pymatgen.
Supports automatic format detection and batch conversion.

Usage:
    python structure_converter.py input_file output_file
    python structure_converter.py input_file --format cif
    python structure_converter.py *.cif --output-dir ./converted --format poscar

Examples:
    python structure_converter.py POSCAR structure.cif
    python structure_converter.py structure.cif --format json
    python structure_converter.py *.vasp --output-dir ./cif_files --format cif
"""

import argparse
import sys
from pathlib import Path
from typing import List

try:
    from pymatgen.core import Structure
except ImportError:
    print("Error: pymatgen is not installed. Install with: pip install pymatgen")
    sys.exit(1)


def convert_structure(input_path: Path, output_path: Path = None, output_format: str = None) -> bool:
    """
    Convert a structure file to a different format.

    Args:
        input_path: Path to input structure file
        output_path: Path to output file (optional if output_format is specified)
        output_format: Target format (e.g., 'cif', 'poscar', 'json', 'yaml')

    Returns:
        True if conversion succeeded, False otherwise
    """
    try:
        # Read structure with automatic format detection
        struct = Structure.from_file(str(input_path))
        print(f"✓ Read structure: {struct.composition.reduced_formula} from {input_path}")

        # Determine output path
        if output_path is None and output_format:
            output_path = input_path.with_suffix(f".{output_format}")
        elif output_path is None:
            print("Error: Must specify either output_path or output_format")
            return False

        # Write structure
        struct.to(filename=str(output_path))
        print(f"✓ Wrote structure to {output_path}")

        return True

    except Exception as e:
        print(f"✗ Error converting {input_path}: {e}")
        return False


def batch_convert(input_files: List[Path], output_dir: Path, output_format: str) -> None:
    """
    Convert multiple structure files to a common format.

    Args:
        input_files: List of input structure files
        output_dir: Directory for output files
        output_format: Target format for all files
    """
    output_dir.mkdir(parents=True, exist_ok=True)

    success_count = 0
    for input_file in input_files:
        output_file = output_dir / f"{input_file.stem}.{output_format}"
        if convert_structure(input_file, output_file):
            success_count += 1

    print(f"\n{'='*60}")
    print(f"Conversion complete: {success_count}/{len(input_files)} files converted successfully")


def main():
    parser = argparse.ArgumentParser(
        description="Convert structure files between different formats using pymatgen",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Supported formats:
  Input:  CIF, POSCAR, CONTCAR, XYZ, PDB, JSON, YAML, and many more
  Output: CIF, POSCAR, XYZ, PDB, JSON, YAML, XSF, and many more

Examples:
  %(prog)s POSCAR structure.cif
  %(prog)s structure.cif --format json
  %(prog)s *.cif --output-dir ./poscar_files --format poscar
        """
    )

    parser.add_argument(
        "input",
        nargs="+",
        help="Input structure file(s). Supports wildcards for batch conversion."
    )

    parser.add_argument(
        "output",
        nargs="?",
        help="Output structure file (ignored if --output-dir is used)"
    )

    parser.add_argument(
        "--format", "-f",
        help="Output format (e.g., cif, poscar, json, yaml, xyz)"
    )

    parser.add_argument(
        "--output-dir", "-o",
        type=Path,
        help="Output directory for batch conversion"
    )

    args = parser.parse_args()

    # Expand wildcards and convert to Path objects
    input_files = []
    for pattern in args.input:
        matches = list(Path.cwd().glob(pattern))
        if matches:
            input_files.extend(matches)
        else:
            input_files.append(Path(pattern))

    # Filter to files only
    input_files = [f for f in input_files if f.is_file()]

    if not input_files:
        print("Error: No input files found")
        sys.exit(1)

    # Batch conversion mode
    if args.output_dir or len(input_files) > 1:
        if not args.format:
            print("Error: --format is required for batch conversion")
            sys.exit(1)

        output_dir = args.output_dir or Path("./converted")
        batch_convert(input_files, output_dir, args.format)

    # Single file conversion
    elif len(input_files) == 1:
        input_file = input_files[0]

        if args.output:
            output_file = Path(args.output)
            convert_structure(input_file, output_file)
        elif args.format:
            convert_structure(input_file, output_format=args.format)
        else:
            print("Error: Must specify output file or --format")
            parser.print_help()
            sys.exit(1)


if __name__ == "__main__":
    main()
