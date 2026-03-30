#!/usr/bin/env python3
"""
Phase diagram generator using Materials Project data.

This script generates phase diagrams for chemical systems using data from the
Materials Project database via pymatgen's MPRester.

Usage:
    python phase_diagram_generator.py chemical_system [options]

Examples:
    python phase_diagram_generator.py Li-Fe-O
    python phase_diagram_generator.py Li-Fe-O --output li_fe_o_pd.png
    python phase_diagram_generator.py Fe-O --show
    python phase_diagram_generator.py Li-Fe-O --analyze "LiFeO2"
"""

import argparse
import os
import sys
from pathlib import Path

try:
    from pymatgen.core import Composition
    from pymatgen.analysis.phase_diagram import PhaseDiagram, PDPlotter
except ImportError:
    print("Error: pymatgen is not installed. Install with: pip install pymatgen")
    sys.exit(1)

try:
    from mp_api.client import MPRester
except ImportError:
    print("Error: mp-api is not installed. Install with: pip install mp-api")
    sys.exit(1)


def get_api_key() -> str:
    """Get Materials Project API key from environment."""
    api_key = os.environ.get("MP_API_KEY")
    if not api_key:
        print("Error: MP_API_KEY environment variable not set.")
        print("Get your API key from https://next-gen.materialsproject.org/")
        print("Then set it with: export MP_API_KEY='your_key_here'")
        sys.exit(1)
    return api_key


def generate_phase_diagram(chemsys: str, args):
    """
    Generate and analyze phase diagram for a chemical system.

    Args:
        chemsys: Chemical system (e.g., "Li-Fe-O")
        args: Command line arguments
    """
    api_key = get_api_key()

    print(f"\n{'='*60}")
    print(f"PHASE DIAGRAM: {chemsys}")
    print(f"{'='*60}\n")

    # Get entries from Materials Project
    print("Fetching data from Materials Project...")
    with MPRester(api_key) as mpr:
        entries = mpr.get_entries_in_chemsys(chemsys)

    print(f"✓ Retrieved {len(entries)} entries")

    if len(entries) == 0:
        print(f"Error: No entries found for chemical system {chemsys}")
        sys.exit(1)

    # Build phase diagram
    print("Building phase diagram...")
    pd = PhaseDiagram(entries)

    # Get stable entries
    stable_entries = pd.stable_entries
    print(f"✓ Phase diagram constructed with {len(stable_entries)} stable phases")

    # Print stable phases
    print("\n--- STABLE PHASES ---")
    for entry in stable_entries:
        formula = entry.composition.reduced_formula
        energy = entry.energy_per_atom
        print(f"  {formula:<20} E = {energy:.4f} eV/atom")

    # Analyze specific composition if requested
    if args.analyze:
        print(f"\n--- STABILITY ANALYSIS: {args.analyze} ---")
        try:
            comp = Composition(args.analyze)

            # Find closest entry
            closest_entry = None
            min_distance = float('inf')

            for entry in entries:
                if entry.composition.reduced_formula == comp.reduced_formula:
                    closest_entry = entry
                    break

            if closest_entry:
                # Calculate energy above hull
                e_above_hull = pd.get_e_above_hull(closest_entry)
                print(f"Energy above hull:    {e_above_hull:.4f} eV/atom")

                if e_above_hull < 0.001:
                    print(f"Status:               STABLE (on convex hull)")
                elif e_above_hull < 0.05:
                    print(f"Status:               METASTABLE (nearly stable)")
                else:
                    print(f"Status:               UNSTABLE")

                    # Get decomposition
                    decomp = pd.get_decomposition(comp)
                    print(f"\nDecomposes to:")
                    for entry, fraction in decomp.items():
                        formula = entry.composition.reduced_formula
                        print(f"  {fraction:.3f} × {formula}")

                    # Get reaction energy
                    rxn_energy = pd.get_equilibrium_reaction_energy(closest_entry)
                    print(f"\nDecomposition energy: {rxn_energy:.4f} eV/atom")

            else:
                print(f"No entry found for composition {args.analyze}")
                print("Checking stability of hypothetical composition...")

                # Analyze hypothetical composition
                decomp = pd.get_decomposition(comp)
                print(f"\nWould decompose to:")
                for entry, fraction in decomp.items():
                    formula = entry.composition.reduced_formula
                    print(f"  {fraction:.3f} × {formula}")

        except Exception as e:
            print(f"Error analyzing composition: {e}")

    # Get chemical potentials
    if args.chemical_potentials:
        print("\n--- CHEMICAL POTENTIALS ---")
        print("(at stability regions)")
        try:
            chempots = pd.get_all_chempots()
            for element, potentials in chempots.items():
                print(f"\n{element}:")
                for potential in potentials[:5]:  # Show first 5
                    print(f"  {potential:.4f} eV")
        except Exception as e:
            print(f"Could not calculate chemical potentials: {e}")

    # Plot phase diagram
    print("\n--- GENERATING PLOT ---")
    plotter = PDPlotter(pd, show_unstable=args.show_unstable)

    if args.output:
        output_path = Path(args.output)
        plotter.write_image(str(output_path), image_format=output_path.suffix[1:])
        print(f"✓ Phase diagram saved to {output_path}")

    if args.show:
        print("Opening interactive plot...")
        plotter.show()

    print(f"\n{'='*60}\n")


def main():
    parser = argparse.ArgumentParser(
        description="Generate phase diagrams using Materials Project data",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Requirements:
  - Materials Project API key (set MP_API_KEY environment variable)
  - mp-api package: pip install mp-api

Examples:
  %(prog)s Li-Fe-O
  %(prog)s Li-Fe-O --output li_fe_o_phase_diagram.png
  %(prog)s Fe-O --show --analyze "Fe2O3"
  %(prog)s Li-Fe-O --analyze "LiFeO2" --show-unstable
        """
    )

    parser.add_argument(
        "chemsys",
        help="Chemical system (e.g., Li-Fe-O, Fe-O)"
    )

    parser.add_argument(
        "--output", "-o",
        help="Output file for phase diagram plot (PNG, PDF, SVG)"
    )

    parser.add_argument(
        "--show", "-s",
        action="store_true",
        help="Show interactive plot"
    )

    parser.add_argument(
        "--analyze", "-a",
        help="Analyze stability of specific composition (e.g., LiFeO2)"
    )

    parser.add_argument(
        "--show-unstable",
        action="store_true",
        help="Include unstable phases in plot"
    )

    parser.add_argument(
        "--chemical-potentials",
        action="store_true",
        help="Calculate chemical potentials"
    )

    args = parser.parse_args()

    # Validate chemical system format
    elements = args.chemsys.split("-")
    if len(elements) < 2:
        print("Error: Chemical system must contain at least 2 elements")
        print("Example: Li-Fe-O")
        sys.exit(1)

    # Generate phase diagram
    generate_phase_diagram(args.chemsys, args)


if __name__ == "__main__":
    main()
