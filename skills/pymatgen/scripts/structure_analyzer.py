#!/usr/bin/env python3
"""
Structure analysis tool using pymatgen.

Analyzes crystal structures and provides comprehensive information including:
- Composition and formula
- Space group and symmetry
- Lattice parameters
- Density
- Coordination environment
- Bond lengths and angles

Usage:
    python structure_analyzer.py structure_file [options]

Examples:
    python structure_analyzer.py POSCAR
    python structure_analyzer.py structure.cif --symmetry --neighbors
    python structure_analyzer.py POSCAR --export json
"""

import argparse
import json
import sys
from pathlib import Path

try:
    from pymatgen.core import Structure
    from pymatgen.symmetry.analyzer import SpacegroupAnalyzer
    from pymatgen.analysis.local_env import CrystalNN
except ImportError:
    print("Error: pymatgen is not installed. Install with: pip install pymatgen")
    sys.exit(1)


def analyze_structure(struct: Structure, args) -> dict:
    """
    Perform comprehensive structure analysis.

    Args:
        struct: Pymatgen Structure object
        args: Command line arguments

    Returns:
        Dictionary containing analysis results
    """
    results = {}

    # Basic information
    print("\n" + "="*60)
    print("STRUCTURE ANALYSIS")
    print("="*60)

    print("\n--- COMPOSITION ---")
    print(f"Formula (reduced):    {struct.composition.reduced_formula}")
    print(f"Formula (full):       {struct.composition.formula}")
    print(f"Formula (Hill):       {struct.composition.hill_formula}")
    print(f"Chemical system:      {struct.composition.chemical_system}")
    print(f"Number of sites:      {len(struct)}")
    print(f"Number of species:    {len(struct.composition.elements)}")
    print(f"Molecular weight:     {struct.composition.weight:.2f} amu")

    results['composition'] = {
        'reduced_formula': struct.composition.reduced_formula,
        'formula': struct.composition.formula,
        'hill_formula': struct.composition.hill_formula,
        'chemical_system': struct.composition.chemical_system,
        'num_sites': len(struct),
        'molecular_weight': struct.composition.weight,
    }

    # Lattice information
    print("\n--- LATTICE ---")
    print(f"a = {struct.lattice.a:.4f} Å")
    print(f"b = {struct.lattice.b:.4f} Å")
    print(f"c = {struct.lattice.c:.4f} Å")
    print(f"α = {struct.lattice.alpha:.2f}°")
    print(f"β = {struct.lattice.beta:.2f}°")
    print(f"γ = {struct.lattice.gamma:.2f}°")
    print(f"Volume:               {struct.volume:.2f} ų")
    print(f"Density:              {struct.density:.3f} g/cm³")

    results['lattice'] = {
        'a': struct.lattice.a,
        'b': struct.lattice.b,
        'c': struct.lattice.c,
        'alpha': struct.lattice.alpha,
        'beta': struct.lattice.beta,
        'gamma': struct.lattice.gamma,
        'volume': struct.volume,
        'density': struct.density,
    }

    # Symmetry analysis
    if args.symmetry:
        print("\n--- SYMMETRY ---")
        try:
            sga = SpacegroupAnalyzer(struct)

            spacegroup_symbol = sga.get_space_group_symbol()
            spacegroup_number = sga.get_space_group_number()
            crystal_system = sga.get_crystal_system()
            point_group = sga.get_point_group_symbol()

            print(f"Space group:          {spacegroup_symbol} (#{spacegroup_number})")
            print(f"Crystal system:       {crystal_system}")
            print(f"Point group:          {point_group}")

            # Get symmetry operations
            symm_ops = sga.get_symmetry_operations()
            print(f"Symmetry operations:  {len(symm_ops)}")

            results['symmetry'] = {
                'spacegroup_symbol': spacegroup_symbol,
                'spacegroup_number': spacegroup_number,
                'crystal_system': crystal_system,
                'point_group': point_group,
                'num_symmetry_ops': len(symm_ops),
            }

            # Show equivalent sites
            sym_struct = sga.get_symmetrized_structure()
            print(f"Symmetry-equivalent site groups: {len(sym_struct.equivalent_sites)}")

        except Exception as e:
            print(f"Could not determine symmetry: {e}")

    # Site information
    print("\n--- SITES ---")
    print(f"{'Index':<6} {'Species':<10} {'Wyckoff':<10} {'Frac Coords':<30}")
    print("-" * 60)

    for i, site in enumerate(struct):
        coords_str = f"[{site.frac_coords[0]:.4f}, {site.frac_coords[1]:.4f}, {site.frac_coords[2]:.4f}]"
        wyckoff = "N/A"

        if args.symmetry:
            try:
                sga = SpacegroupAnalyzer(struct)
                sym_struct = sga.get_symmetrized_structure()
                wyckoff = sym_struct.equivalent_sites[0][0].species_string  # Simplified
            except:
                pass

        print(f"{i:<6} {site.species_string:<10} {wyckoff:<10} {coords_str:<30}")

    # Neighbor analysis
    if args.neighbors:
        print("\n--- COORDINATION ENVIRONMENT ---")
        try:
            cnn = CrystalNN()

            for i, site in enumerate(struct):
                neighbors = cnn.get_nn_info(struct, i)
                print(f"\nSite {i} ({site.species_string}):")
                print(f"  Coordination number: {len(neighbors)}")

                if len(neighbors) > 0 and len(neighbors) <= 12:
                    print(f"  Neighbors:")
                    for j, neighbor in enumerate(neighbors):
                        neighbor_site = struct[neighbor['site_index']]
                        distance = site.distance(neighbor_site)
                        print(f"    {neighbor_site.species_string} at {distance:.3f} Å")

        except Exception as e:
            print(f"Could not analyze coordination: {e}")

    # Distance matrix (for small structures)
    if args.distances and len(struct) <= 20:
        print("\n--- DISTANCE MATRIX (Å) ---")
        distance_matrix = struct.distance_matrix

        # Print header
        print(f"{'':>4}", end="")
        for i in range(len(struct)):
            print(f"{i:>8}", end="")
        print()

        # Print matrix
        for i in range(len(struct)):
            print(f"{i:>4}", end="")
            for j in range(len(struct)):
                if i == j:
                    print(f"{'---':>8}", end="")
                else:
                    print(f"{distance_matrix[i][j]:>8.3f}", end="")
            print()

    print("\n" + "="*60)

    return results


def main():
    parser = argparse.ArgumentParser(
        description="Analyze crystal structures using pymatgen",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )

    parser.add_argument(
        "structure_file",
        help="Structure file to analyze (CIF, POSCAR, etc.)"
    )

    parser.add_argument(
        "--symmetry", "-s",
        action="store_true",
        help="Perform symmetry analysis"
    )

    parser.add_argument(
        "--neighbors", "-n",
        action="store_true",
        help="Analyze coordination environment"
    )

    parser.add_argument(
        "--distances", "-d",
        action="store_true",
        help="Show distance matrix (for structures with ≤20 atoms)"
    )

    parser.add_argument(
        "--export", "-e",
        choices=["json", "yaml"],
        help="Export analysis results to file"
    )

    parser.add_argument(
        "--output", "-o",
        help="Output file for exported results"
    )

    args = parser.parse_args()

    # Read structure
    try:
        struct = Structure.from_file(args.structure_file)
    except Exception as e:
        print(f"Error reading structure file: {e}")
        sys.exit(1)

    # Analyze structure
    results = analyze_structure(struct, args)

    # Export results
    if args.export:
        output_file = args.output or f"analysis.{args.export}"

        if args.export == "json":
            with open(output_file, "w") as f:
                json.dump(results, f, indent=2)
            print(f"\n✓ Analysis exported to {output_file}")

        elif args.export == "yaml":
            try:
                import yaml
                with open(output_file, "w") as f:
                    yaml.dump(results, f, default_flow_style=False)
                print(f"\n✓ Analysis exported to {output_file}")
            except ImportError:
                print("Error: PyYAML is not installed. Install with: pip install pyyaml")


if __name__ == "__main__":
    main()
