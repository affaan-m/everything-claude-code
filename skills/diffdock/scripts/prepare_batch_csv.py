#!/usr/bin/env python3
"""
DiffDock Batch CSV Preparation and Validation Script

This script helps prepare and validate CSV files for DiffDock batch processing.
It checks for required columns, validates file paths, and ensures SMILES strings
are properly formatted.

Usage:
    python prepare_batch_csv.py input.csv --validate
    python prepare_batch_csv.py --create --output batch_input.csv
"""

import argparse
import os
import sys
import pandas as pd
from pathlib import Path

try:
    from rdkit import Chem
    from rdkit import RDLogger
    RDLogger.DisableLog('rdApp.*')
    RDKIT_AVAILABLE = True
except ImportError:
    RDKIT_AVAILABLE = False
    print("Warning: RDKit not available. SMILES validation will be skipped.")


def validate_smiles(smiles_string):
    """Validate a SMILES string using RDKit."""
    if not RDKIT_AVAILABLE:
        return True, "RDKit not available for validation"

    try:
        mol = Chem.MolFromSmiles(smiles_string)
        if mol is None:
            return False, "Invalid SMILES structure"
        return True, "Valid SMILES"
    except Exception as e:
        return False, str(e)


def validate_file_path(file_path, base_dir=None):
    """Validate that a file path exists."""
    if pd.isna(file_path) or file_path == "":
        return True, "Empty (will use protein_sequence)"

    # Handle relative paths
    if base_dir:
        full_path = Path(base_dir) / file_path
    else:
        full_path = Path(file_path)

    if full_path.exists():
        return True, f"File exists: {full_path}"
    else:
        return False, f"File not found: {full_path}"


def validate_csv(csv_path, base_dir=None):
    """
    Validate a DiffDock batch input CSV file.

    Args:
        csv_path: Path to CSV file
        base_dir: Base directory for relative paths (default: CSV directory)

    Returns:
        bool: True if validation passes
        list: List of validation messages
    """
    messages = []
    valid = True

    # Read CSV
    try:
        df = pd.read_csv(csv_path)
        messages.append(f"✓ Successfully read CSV with {len(df)} rows")
    except Exception as e:
        messages.append(f"✗ Error reading CSV: {e}")
        return False, messages

    # Check required columns
    required_cols = ['complex_name', 'protein_path', 'ligand_description', 'protein_sequence']
    missing_cols = [col for col in required_cols if col not in df.columns]

    if missing_cols:
        messages.append(f"✗ Missing required columns: {', '.join(missing_cols)}")
        valid = False
    else:
        messages.append("✓ All required columns present")

    # Set base directory
    if base_dir is None:
        base_dir = Path(csv_path).parent

    # Validate each row
    for idx, row in df.iterrows():
        row_msgs = []

        # Check complex name
        if pd.isna(row['complex_name']) or row['complex_name'] == "":
            row_msgs.append("Missing complex_name")
            valid = False

        # Check that either protein_path or protein_sequence is provided
        has_protein_path = not pd.isna(row['protein_path']) and row['protein_path'] != ""
        has_protein_seq = not pd.isna(row['protein_sequence']) and row['protein_sequence'] != ""

        if not has_protein_path and not has_protein_seq:
            row_msgs.append("Must provide either protein_path or protein_sequence")
            valid = False
        elif has_protein_path and has_protein_seq:
            row_msgs.append("Warning: Both protein_path and protein_sequence provided, will use protein_path")

        # Validate protein path if provided
        if has_protein_path:
            file_valid, msg = validate_file_path(row['protein_path'], base_dir)
            if not file_valid:
                row_msgs.append(f"Protein file issue: {msg}")
                valid = False

        # Validate ligand description
        if pd.isna(row['ligand_description']) or row['ligand_description'] == "":
            row_msgs.append("Missing ligand_description")
            valid = False
        else:
            ligand_desc = row['ligand_description']
            # Check if it's a file path or SMILES
            if os.path.exists(ligand_desc) or "/" in ligand_desc or "\\" in ligand_desc:
                # Likely a file path
                file_valid, msg = validate_file_path(ligand_desc, base_dir)
                if not file_valid:
                    row_msgs.append(f"Ligand file issue: {msg}")
                    valid = False
            else:
                # Likely a SMILES string
                smiles_valid, msg = validate_smiles(ligand_desc)
                if not smiles_valid:
                    row_msgs.append(f"SMILES issue: {msg}")
                    valid = False

        if row_msgs:
            messages.append(f"\nRow {idx + 1} ({row.get('complex_name', 'unnamed')}):")
            for msg in row_msgs:
                messages.append(f"  - {msg}")

    # Summary
    messages.append(f"\n{'='*60}")
    if valid:
        messages.append("✓ CSV validation PASSED - ready for DiffDock")
    else:
        messages.append("✗ CSV validation FAILED - please fix issues above")

    return valid, messages


def create_template_csv(output_path, num_examples=3):
    """Create a template CSV file with example entries."""

    examples = {
        'complex_name': ['example1', 'example2', 'example3'][:num_examples],
        'protein_path': ['protein1.pdb', '', 'protein3.pdb'][:num_examples],
        'ligand_description': [
            'CC(=O)Oc1ccccc1C(=O)O',  # Aspirin SMILES
            'COc1ccc(C#N)cc1',  # Example SMILES
            'ligand.sdf'  # Example file path
        ][:num_examples],
        'protein_sequence': [
            '',  # Empty - using PDB file
            'MSKGEELFTGVVPILVELDGDVNGHKFSVSGEGEGDATYGKLTLKFICTTGKLPVPWPTLVTTFSYGVQCFSRYPDHMKQHDFFKSAMPEGYVQERTIFFKDDGNYKTRAEVKFEGDTLVNRIELKGIDFKEDGNILGHKLEYNYNSHNVYIMADKQKNGIKVNFKIRHNIEDGSVQLADHYQQNTPIGDGPVLLPDNHYLSTQSALSKDPNEKRDHMVLLEFVTAAGITHGMDELYK',  # GFP sequence
            ''  # Empty - using PDB file
        ][:num_examples]
    }

    df = pd.DataFrame(examples)
    df.to_csv(output_path, index=False)

    return df


def main():
    parser = argparse.ArgumentParser(
        description='Prepare and validate DiffDock batch CSV files',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Validate existing CSV
  python prepare_batch_csv.py input.csv --validate

  # Create template CSV
  python prepare_batch_csv.py --create --output batch_template.csv

  # Create template with 5 example rows
  python prepare_batch_csv.py --create --output template.csv --num-examples 5

  # Validate with custom base directory for relative paths
  python prepare_batch_csv.py input.csv --validate --base-dir /path/to/data/
        """
    )

    parser.add_argument('csv_file', nargs='?', help='CSV file to validate')
    parser.add_argument('--validate', action='store_true',
                        help='Validate the CSV file')
    parser.add_argument('--create', action='store_true',
                        help='Create a template CSV file')
    parser.add_argument('--output', '-o', help='Output path for template CSV')
    parser.add_argument('--num-examples', type=int, default=3,
                        help='Number of example rows in template (default: 3)')
    parser.add_argument('--base-dir', help='Base directory for relative file paths')

    args = parser.parse_args()

    # Create template
    if args.create:
        output_path = args.output or 'diffdock_batch_template.csv'
        df = create_template_csv(output_path, args.num_examples)
        print(f"✓ Created template CSV: {output_path}")
        print(f"\nTemplate contents:")
        print(df.to_string(index=False))
        print(f"\nEdit this file with your protein-ligand pairs and run with:")
        print(f"  python -m inference --config default_inference_args.yaml \\")
        print(f"    --protein_ligand_csv {output_path} --out_dir results/")
        return 0

    # Validate CSV
    if args.validate or args.csv_file:
        if not args.csv_file:
            print("Error: CSV file required for validation")
            parser.print_help()
            return 1

        if not os.path.exists(args.csv_file):
            print(f"Error: CSV file not found: {args.csv_file}")
            return 1

        print(f"Validating: {args.csv_file}")
        print("="*60)

        valid, messages = validate_csv(args.csv_file, args.base_dir)

        for msg in messages:
            print(msg)

        return 0 if valid else 1

    # No action specified
    parser.print_help()
    return 1


if __name__ == '__main__':
    sys.exit(main())
