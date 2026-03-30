#!/usr/bin/env python3
"""
Molecular Properties Calculator

Calculate comprehensive molecular properties and descriptors for molecules.
Supports single molecules or batch processing from files.

Usage:
    python molecular_properties.py "CCO"
    python molecular_properties.py --file molecules.smi --output properties.csv
"""

import argparse
import sys
from pathlib import Path

try:
    from rdkit import Chem
    from rdkit.Chem import Descriptors, Lipinski
except ImportError:
    print("Error: RDKit not installed. Install with: conda install -c conda-forge rdkit")
    sys.exit(1)


def calculate_properties(mol):
    """Calculate comprehensive molecular properties."""
    if mol is None:
        return None

    properties = {
        # Basic properties
        'SMILES': Chem.MolToSmiles(mol),
        'Molecular_Formula': Chem.rdMolDescriptors.CalcMolFormula(mol),

        # Molecular weight
        'MW': Descriptors.MolWt(mol),
        'ExactMW': Descriptors.ExactMolWt(mol),

        # Lipophilicity
        'LogP': Descriptors.MolLogP(mol),
        'MR': Descriptors.MolMR(mol),

        # Polar surface area
        'TPSA': Descriptors.TPSA(mol),
        'LabuteASA': Descriptors.LabuteASA(mol),

        # Hydrogen bonding
        'HBD': Descriptors.NumHDonors(mol),
        'HBA': Descriptors.NumHAcceptors(mol),

        # Atom counts
        'Heavy_Atoms': Descriptors.HeavyAtomCount(mol),
        'Heteroatoms': Descriptors.NumHeteroatoms(mol),
        'Valence_Electrons': Descriptors.NumValenceElectrons(mol),

        # Ring information
        'Rings': Descriptors.RingCount(mol),
        'Aromatic_Rings': Descriptors.NumAromaticRings(mol),
        'Saturated_Rings': Descriptors.NumSaturatedRings(mol),
        'Aliphatic_Rings': Descriptors.NumAliphaticRings(mol),
        'Aromatic_Heterocycles': Descriptors.NumAromaticHeterocycles(mol),

        # Flexibility
        'Rotatable_Bonds': Descriptors.NumRotatableBonds(mol),
        'Fraction_Csp3': Descriptors.FractionCsp3(mol),

        # Complexity
        'BertzCT': Descriptors.BertzCT(mol),

        # Drug-likeness
        'QED': Descriptors.qed(mol),
    }

    # Lipinski's Rule of Five
    properties['Lipinski_Pass'] = (
        properties['MW'] <= 500 and
        properties['LogP'] <= 5 and
        properties['HBD'] <= 5 and
        properties['HBA'] <= 10
    )

    # Lead-likeness
    properties['Lead-like'] = (
        250 <= properties['MW'] <= 350 and
        properties['LogP'] <= 3.5 and
        properties['Rotatable_Bonds'] <= 7
    )

    return properties


def process_single_molecule(smiles):
    """Process a single SMILES string."""
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        print(f"Error: Failed to parse SMILES: {smiles}")
        return None

    props = calculate_properties(mol)
    return props


def process_file(input_file, output_file=None):
    """Process molecules from a file."""
    input_path = Path(input_file)

    if not input_path.exists():
        print(f"Error: File not found: {input_file}")
        return

    # Determine file type
    if input_path.suffix.lower() in ['.sdf', '.mol']:
        suppl = Chem.SDMolSupplier(str(input_path))
    elif input_path.suffix.lower() in ['.smi', '.smiles', '.txt']:
        suppl = Chem.SmilesMolSupplier(str(input_path), titleLine=False)
    else:
        print(f"Error: Unsupported file format: {input_path.suffix}")
        return

    results = []
    for idx, mol in enumerate(suppl):
        if mol is None:
            print(f"Warning: Failed to parse molecule {idx+1}")
            continue

        props = calculate_properties(mol)
        if props:
            props['Index'] = idx + 1
            results.append(props)

    # Output results
    if output_file:
        write_csv(results, output_file)
        print(f"Results written to: {output_file}")
    else:
        # Print to console
        for props in results:
            print("\n" + "="*60)
            for key, value in props.items():
                print(f"{key:25s}: {value}")

    return results


def write_csv(results, output_file):
    """Write results to CSV file."""
    import csv

    if not results:
        print("No results to write")
        return

    with open(output_file, 'w', newline='') as f:
        fieldnames = results[0].keys()
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(results)


def print_properties(props):
    """Print properties in formatted output."""
    print("\nMolecular Properties:")
    print("="*60)

    # Group related properties
    print("\n[Basic Information]")
    print(f"  SMILES:              {props['SMILES']}")
    print(f"  Formula:             {props['Molecular_Formula']}")

    print("\n[Size & Weight]")
    print(f"  Molecular Weight:    {props['MW']:.2f}")
    print(f"  Exact MW:            {props['ExactMW']:.4f}")
    print(f"  Heavy Atoms:         {props['Heavy_Atoms']}")
    print(f"  Heteroatoms:         {props['Heteroatoms']}")

    print("\n[Lipophilicity]")
    print(f"  LogP:                {props['LogP']:.2f}")
    print(f"  Molar Refractivity:  {props['MR']:.2f}")

    print("\n[Polarity]")
    print(f"  TPSA:                {props['TPSA']:.2f}")
    print(f"  Labute ASA:          {props['LabuteASA']:.2f}")
    print(f"  H-bond Donors:       {props['HBD']}")
    print(f"  H-bond Acceptors:    {props['HBA']}")

    print("\n[Ring Systems]")
    print(f"  Total Rings:         {props['Rings']}")
    print(f"  Aromatic Rings:      {props['Aromatic_Rings']}")
    print(f"  Saturated Rings:     {props['Saturated_Rings']}")
    print(f"  Aliphatic Rings:     {props['Aliphatic_Rings']}")
    print(f"  Aromatic Heterocycles: {props['Aromatic_Heterocycles']}")

    print("\n[Flexibility & Complexity]")
    print(f"  Rotatable Bonds:     {props['Rotatable_Bonds']}")
    print(f"  Fraction Csp3:       {props['Fraction_Csp3']:.3f}")
    print(f"  Bertz Complexity:    {props['BertzCT']:.1f}")

    print("\n[Drug-likeness]")
    print(f"  QED Score:           {props['QED']:.3f}")
    print(f"  Lipinski Pass:       {'Yes' if props['Lipinski_Pass'] else 'No'}")
    print(f"  Lead-like:           {'Yes' if props['Lead-like'] else 'No'}")
    print("="*60)


def main():
    parser = argparse.ArgumentParser(
        description='Calculate molecular properties for molecules',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Single molecule
  python molecular_properties.py "CCO"

  # From file
  python molecular_properties.py --file molecules.smi

  # Save to CSV
  python molecular_properties.py --file molecules.sdf --output properties.csv
        """
    )

    parser.add_argument('smiles', nargs='?', help='SMILES string to analyze')
    parser.add_argument('--file', '-f', help='Input file (SDF or SMILES)')
    parser.add_argument('--output', '-o', help='Output CSV file')

    args = parser.parse_args()

    if not args.smiles and not args.file:
        parser.print_help()
        sys.exit(1)

    if args.smiles:
        # Process single molecule
        props = process_single_molecule(args.smiles)
        if props:
            print_properties(props)
    elif args.file:
        # Process file
        process_file(args.file, args.output)


if __name__ == '__main__':
    main()
