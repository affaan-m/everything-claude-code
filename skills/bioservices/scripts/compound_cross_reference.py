#!/usr/bin/env python3
"""
Compound Cross-Database Search

This script searches for a compound by name and retrieves identifiers
from multiple databases:
- KEGG Compound
- ChEBI
- ChEMBL (via UniChem)
- Basic compound properties

Usage:
    python compound_cross_reference.py COMPOUND_NAME [--output FILE]

Examples:
    python compound_cross_reference.py Geldanamycin
    python compound_cross_reference.py "Adenosine triphosphate"
    python compound_cross_reference.py Aspirin --output aspirin_info.txt
"""

import sys
import argparse
from bioservices import KEGG, UniChem, ChEBI, ChEMBL


def search_kegg_compound(compound_name):
    """Search KEGG for compound by name."""
    print(f"\n{'='*70}")
    print("STEP 1: KEGG Compound Search")
    print(f"{'='*70}")

    k = KEGG()

    print(f"Searching KEGG for: {compound_name}")

    try:
        results = k.find("compound", compound_name)

        if not results or not results.strip():
            print(f"✗ No results found in KEGG")
            return k, None

        # Parse results
        lines = results.strip().split("\n")
        print(f"✓ Found {len(lines)} result(s):\n")

        for i, line in enumerate(lines[:5], 1):
            parts = line.split("\t")
            kegg_id = parts[0]
            description = parts[1] if len(parts) > 1 else "No description"
            print(f"  {i}. {kegg_id}: {description}")

        # Use first result
        first_result = lines[0].split("\t")
        kegg_id = first_result[0].replace("cpd:", "")

        print(f"\nUsing: {kegg_id}")

        return k, kegg_id

    except Exception as e:
        print(f"✗ Error: {e}")
        return k, None


def get_kegg_info(kegg, kegg_id):
    """Retrieve detailed KEGG compound information."""
    print(f"\n{'='*70}")
    print("STEP 2: KEGG Compound Details")
    print(f"{'='*70}")

    try:
        print(f"Retrieving KEGG entry for {kegg_id}...")

        entry = kegg.get(f"cpd:{kegg_id}")

        if not entry:
            print("✗ Failed to retrieve entry")
            return None

        # Parse entry
        compound_info = {
            'kegg_id': kegg_id,
            'name': None,
            'formula': None,
            'exact_mass': None,
            'mol_weight': None,
            'chebi_id': None,
            'pathways': []
        }

        current_section = None

        for line in entry.split("\n"):
            if line.startswith("NAME"):
                compound_info['name'] = line.replace("NAME", "").strip().rstrip(";")

            elif line.startswith("FORMULA"):
                compound_info['formula'] = line.replace("FORMULA", "").strip()

            elif line.startswith("EXACT_MASS"):
                compound_info['exact_mass'] = line.replace("EXACT_MASS", "").strip()

            elif line.startswith("MOL_WEIGHT"):
                compound_info['mol_weight'] = line.replace("MOL_WEIGHT", "").strip()

            elif "ChEBI:" in line:
                parts = line.split("ChEBI:")
                if len(parts) > 1:
                    compound_info['chebi_id'] = parts[1].strip().split()[0]

            elif line.startswith("PATHWAY"):
                current_section = "pathway"
                pathway = line.replace("PATHWAY", "").strip()
                if pathway:
                    compound_info['pathways'].append(pathway)

            elif current_section == "pathway" and line.startswith("            "):
                pathway = line.strip()
                if pathway:
                    compound_info['pathways'].append(pathway)

            elif line.startswith(" ") and not line.startswith("            "):
                current_section = None

        # Display information
        print(f"\n✓ KEGG Compound Information:")
        print(f"  ID: {compound_info['kegg_id']}")
        print(f"  Name: {compound_info['name']}")
        print(f"  Formula: {compound_info['formula']}")
        print(f"  Exact Mass: {compound_info['exact_mass']}")
        print(f"  Molecular Weight: {compound_info['mol_weight']}")

        if compound_info['chebi_id']:
            print(f"  ChEBI ID: {compound_info['chebi_id']}")

        if compound_info['pathways']:
            print(f"  Pathways: {len(compound_info['pathways'])} found")

        return compound_info

    except Exception as e:
        print(f"✗ Error: {e}")
        return None


def get_chembl_id(kegg_id):
    """Map KEGG ID to ChEMBL via UniChem."""
    print(f"\n{'='*70}")
    print("STEP 3: ChEMBL Mapping (via UniChem)")
    print(f"{'='*70}")

    try:
        u = UniChem()

        print(f"Mapping KEGG:{kegg_id} to ChEMBL...")

        chembl_id = u.get_compound_id_from_kegg(kegg_id)

        if chembl_id:
            print(f"✓ ChEMBL ID: {chembl_id}")
            return chembl_id
        else:
            print("✗ No ChEMBL mapping found")
            return None

    except Exception as e:
        print(f"✗ Error: {e}")
        return None


def get_chebi_info(chebi_id):
    """Retrieve ChEBI compound information."""
    print(f"\n{'='*70}")
    print("STEP 4: ChEBI Details")
    print(f"{'='*70}")

    if not chebi_id:
        print("⊘ No ChEBI ID available")
        return None

    try:
        c = ChEBI()

        print(f"Retrieving ChEBI entry for {chebi_id}...")

        # Ensure proper format
        if not chebi_id.startswith("CHEBI:"):
            chebi_id = f"CHEBI:{chebi_id}"

        entity = c.getCompleteEntity(chebi_id)

        if entity:
            print(f"\n✓ ChEBI Information:")
            print(f"  ID: {entity.chebiId}")
            print(f"  Name: {entity.chebiAsciiName}")

            if hasattr(entity, 'Formulae') and entity.Formulae:
                print(f"  Formula: {entity.Formulae}")

            if hasattr(entity, 'mass') and entity.mass:
                print(f"  Mass: {entity.mass}")

            if hasattr(entity, 'charge') and entity.charge:
                print(f"  Charge: {entity.charge}")

            return {
                'chebi_id': entity.chebiId,
                'name': entity.chebiAsciiName,
                'formula': entity.Formulae if hasattr(entity, 'Formulae') else None,
                'mass': entity.mass if hasattr(entity, 'mass') else None
            }
        else:
            print("✗ Failed to retrieve ChEBI entry")
            return None

    except Exception as e:
        print(f"✗ Error: {e}")
        return None


def get_chembl_info(chembl_id):
    """Retrieve ChEMBL compound information."""
    print(f"\n{'='*70}")
    print("STEP 5: ChEMBL Details")
    print(f"{'='*70}")

    if not chembl_id:
        print("⊘ No ChEMBL ID available")
        return None

    try:
        c = ChEMBL()

        print(f"Retrieving ChEMBL entry for {chembl_id}...")

        compound = c.get_compound_by_chemblId(chembl_id)

        if compound:
            print(f"\n✓ ChEMBL Information:")
            print(f"  ID: {chembl_id}")

            if 'pref_name' in compound and compound['pref_name']:
                print(f"  Preferred Name: {compound['pref_name']}")

            if 'molecule_properties' in compound:
                props = compound['molecule_properties']

                if 'full_mwt' in props:
                    print(f"  Molecular Weight: {props['full_mwt']}")

                if 'alogp' in props:
                    print(f"  LogP: {props['alogp']}")

                if 'hba' in props:
                    print(f"  H-Bond Acceptors: {props['hba']}")

                if 'hbd' in props:
                    print(f"  H-Bond Donors: {props['hbd']}")

            if 'molecule_structures' in compound:
                structs = compound['molecule_structures']

                if 'canonical_smiles' in structs:
                    smiles = structs['canonical_smiles']
                    print(f"  SMILES: {smiles[:60]}{'...' if len(smiles) > 60 else ''}")

            return compound
        else:
            print("✗ Failed to retrieve ChEMBL entry")
            return None

    except Exception as e:
        print(f"✗ Error: {e}")
        return None


def save_results(compound_name, kegg_info, chembl_id, output_file):
    """Save results to file."""
    print(f"\n{'='*70}")
    print(f"Saving results to {output_file}")
    print(f"{'='*70}")

    with open(output_file, 'w') as f:
        f.write("=" * 70 + "\n")
        f.write(f"Compound Cross-Reference Report: {compound_name}\n")
        f.write("=" * 70 + "\n\n")

        # KEGG information
        if kegg_info:
            f.write("KEGG Compound\n")
            f.write("-" * 70 + "\n")
            f.write(f"ID: {kegg_info['kegg_id']}\n")
            f.write(f"Name: {kegg_info['name']}\n")
            f.write(f"Formula: {kegg_info['formula']}\n")
            f.write(f"Exact Mass: {kegg_info['exact_mass']}\n")
            f.write(f"Molecular Weight: {kegg_info['mol_weight']}\n")
            f.write(f"Pathways: {len(kegg_info['pathways'])} found\n")
            f.write("\n")

        # Database IDs
        f.write("Cross-Database Identifiers\n")
        f.write("-" * 70 + "\n")
        if kegg_info:
            f.write(f"KEGG: {kegg_info['kegg_id']}\n")
            if kegg_info['chebi_id']:
                f.write(f"ChEBI: {kegg_info['chebi_id']}\n")
        if chembl_id:
            f.write(f"ChEMBL: {chembl_id}\n")
        f.write("\n")

    print(f"✓ Results saved")


def main():
    """Main workflow."""
    parser = argparse.ArgumentParser(
        description="Search compound across multiple databases",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python compound_cross_reference.py Geldanamycin
  python compound_cross_reference.py "Adenosine triphosphate"
  python compound_cross_reference.py Aspirin --output aspirin_info.txt
        """
    )
    parser.add_argument("compound", help="Compound name to search")
    parser.add_argument("--output", default=None,
                       help="Output file for results (optional)")

    args = parser.parse_args()

    print("=" * 70)
    print("BIOSERVICES: Compound Cross-Database Search")
    print("=" * 70)

    # Step 1: Search KEGG
    kegg, kegg_id = search_kegg_compound(args.compound)
    if not kegg_id:
        print("\n✗ Failed to find compound. Exiting.")
        sys.exit(1)

    # Step 2: Get KEGG details
    kegg_info = get_kegg_info(kegg, kegg_id)

    # Step 3: Map to ChEMBL
    chembl_id = get_chembl_id(kegg_id)

    # Step 4: Get ChEBI details
    chebi_info = None
    if kegg_info and kegg_info['chebi_id']:
        chebi_info = get_chebi_info(kegg_info['chebi_id'])

    # Step 5: Get ChEMBL details
    chembl_info = None
    if chembl_id:
        chembl_info = get_chembl_info(chembl_id)

    # Summary
    print(f"\n{'='*70}")
    print("SUMMARY")
    print(f"{'='*70}")
    print(f"  Compound: {args.compound}")
    if kegg_info:
        print(f"  KEGG ID: {kegg_info['kegg_id']}")
        if kegg_info['chebi_id']:
            print(f"  ChEBI ID: {kegg_info['chebi_id']}")
    if chembl_id:
        print(f"  ChEMBL ID: {chembl_id}")
    print(f"{'='*70}")

    # Save to file if requested
    if args.output:
        save_results(args.compound, kegg_info, chembl_id, args.output)


if __name__ == "__main__":
    main()
