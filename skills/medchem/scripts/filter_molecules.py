#!/usr/bin/env python3
"""
Batch molecular filtering using medchem library.

This script provides a production-ready workflow for filtering compound libraries
using medchem rules, structural alerts, and custom constraints.

Usage:
    python filter_molecules.py input.csv --rules rule_of_five,rule_of_cns --alerts nibr --output filtered.csv
    python filter_molecules.py input.sdf --rules rule_of_drug --lilly --complexity 400 --output results.csv
    python filter_molecules.py smiles.txt --nibr --pains --n-jobs -1 --output clean.csv
"""

import argparse
import sys
from pathlib import Path
from typing import List, Dict, Optional, Tuple
import json

try:
    import pandas as pd
    import datamol as dm
    import medchem as mc
    from rdkit import Chem
    from tqdm import tqdm
except ImportError as e:
    print(f"Error: Missing required package: {e}")
    print("Install dependencies: pip install medchem datamol pandas tqdm")
    sys.exit(1)


def load_molecules(input_file: Path, smiles_column: str = "smiles") -> Tuple[pd.DataFrame, List[Chem.Mol]]:
    """
    Load molecules from various file formats.

    Supports:
    - CSV/TSV with SMILES column
    - SDF files
    - Plain text files with one SMILES per line

    Returns:
        Tuple of (DataFrame with metadata, list of RDKit molecules)
    """
    suffix = input_file.suffix.lower()

    if suffix == ".sdf":
        print(f"Loading SDF file: {input_file}")
        supplier = Chem.SDMolSupplier(str(input_file))
        mols = [mol for mol in supplier if mol is not None]

        # Create DataFrame from SDF properties
        data = []
        for mol in mols:
            props = mol.GetPropsAsDict()
            props["smiles"] = Chem.MolToSmiles(mol)
            data.append(props)
        df = pd.DataFrame(data)

    elif suffix in [".csv", ".tsv"]:
        print(f"Loading CSV/TSV file: {input_file}")
        sep = "\t" if suffix == ".tsv" else ","
        df = pd.read_csv(input_file, sep=sep)

        if smiles_column not in df.columns:
            print(f"Error: Column '{smiles_column}' not found in file")
            print(f"Available columns: {', '.join(df.columns)}")
            sys.exit(1)

        print(f"Converting SMILES to molecules...")
        mols = [dm.to_mol(smi) for smi in tqdm(df[smiles_column], desc="Parsing")]

    elif suffix == ".txt":
        print(f"Loading text file: {input_file}")
        with open(input_file) as f:
            smiles_list = [line.strip() for line in f if line.strip()]

        df = pd.DataFrame({"smiles": smiles_list})
        print(f"Converting SMILES to molecules...")
        mols = [dm.to_mol(smi) for smi in tqdm(smiles_list, desc="Parsing")]

    else:
        print(f"Error: Unsupported file format: {suffix}")
        print("Supported formats: .csv, .tsv, .sdf, .txt")
        sys.exit(1)

    # Filter out invalid molecules
    valid_indices = [i for i, mol in enumerate(mols) if mol is not None]
    if len(valid_indices) < len(mols):
        n_invalid = len(mols) - len(valid_indices)
        print(f"Warning: {n_invalid} invalid molecules removed")
        df = df.iloc[valid_indices].reset_index(drop=True)
        mols = [mols[i] for i in valid_indices]

    print(f"Loaded {len(mols)} valid molecules")
    return df, mols


def apply_rule_filters(mols: List[Chem.Mol], rules: List[str], n_jobs: int) -> pd.DataFrame:
    """Apply medicinal chemistry rule filters."""
    print(f"\nApplying rule filters: {', '.join(rules)}")

    rfilter = mc.rules.RuleFilters(rule_list=rules)
    results = rfilter(mols=mols, n_jobs=n_jobs, progress=True)

    # Convert to DataFrame
    df_results = pd.DataFrame(results)

    # Add summary column
    df_results["passes_all_rules"] = df_results.all(axis=1)

    return df_results


def apply_structural_alerts(mols: List[Chem.Mol], alert_type: str, n_jobs: int) -> pd.DataFrame:
    """Apply structural alert filters."""
    print(f"\nApplying {alert_type} structural alerts...")

    if alert_type == "common":
        alert_filter = mc.structural.CommonAlertsFilters()
        results = alert_filter(mols=mols, n_jobs=n_jobs, progress=True)

        df_results = pd.DataFrame({
            "has_common_alerts": [r["has_alerts"] for r in results],
            "num_common_alerts": [r["num_alerts"] for r in results],
            "common_alert_details": [", ".join(r["alert_details"]) if r["alert_details"] else "" for r in results]
        })

    elif alert_type == "nibr":
        nibr_filter = mc.structural.NIBRFilters()
        results = nibr_filter(mols=mols, n_jobs=n_jobs, progress=True)

        df_results = pd.DataFrame({
            "passes_nibr": results
        })

    elif alert_type == "lilly":
        lilly_filter = mc.structural.LillyDemeritsFilters()
        results = lilly_filter(mols=mols, n_jobs=n_jobs, progress=True)

        df_results = pd.DataFrame({
            "lilly_demerits": [r["demerits"] for r in results],
            "passes_lilly": [r["passes"] for r in results],
            "lilly_patterns": [", ".join([p["pattern"] for p in r["matched_patterns"]]) for r in results]
        })

    elif alert_type == "pains":
        results = [mc.rules.basic_rules.pains_filter(mol) for mol in tqdm(mols, desc="PAINS")]

        df_results = pd.DataFrame({
            "passes_pains": results
        })

    else:
        raise ValueError(f"Unknown alert type: {alert_type}")

    return df_results


def apply_complexity_filter(mols: List[Chem.Mol], max_complexity: float, method: str = "bertz") -> pd.DataFrame:
    """Calculate molecular complexity."""
    print(f"\nCalculating molecular complexity (method={method}, max={max_complexity})...")

    complexity_scores = [
        mc.complexity.calculate_complexity(mol, method=method)
        for mol in tqdm(mols, desc="Complexity")
    ]

    df_results = pd.DataFrame({
        "complexity_score": complexity_scores,
        "passes_complexity": [score <= max_complexity for score in complexity_scores]
    })

    return df_results


def apply_constraints(mols: List[Chem.Mol], constraints: Dict, n_jobs: int) -> pd.DataFrame:
    """Apply custom property constraints."""
    print(f"\nApplying constraints: {constraints}")

    constraint_filter = mc.constraints.Constraints(**constraints)
    results = constraint_filter(mols=mols, n_jobs=n_jobs, progress=True)

    df_results = pd.DataFrame({
        "passes_constraints": [r["passes"] for r in results],
        "constraint_violations": [", ".join(r["violations"]) if r["violations"] else "" for r in results]
    })

    return df_results


def apply_chemical_groups(mols: List[Chem.Mol], groups: List[str]) -> pd.DataFrame:
    """Detect chemical groups."""
    print(f"\nDetecting chemical groups: {', '.join(groups)}")

    group_detector = mc.groups.ChemicalGroup(groups=groups)
    results = group_detector.get_all_matches(mols)

    df_results = pd.DataFrame()
    for group in groups:
        df_results[f"has_{group}"] = [bool(r.get(group)) for r in results]

    return df_results


def generate_summary(df: pd.DataFrame, output_file: Path):
    """Generate filtering summary report."""
    summary_file = output_file.parent / f"{output_file.stem}_summary.txt"

    with open(summary_file, "w") as f:
        f.write("=" * 80 + "\n")
        f.write("MEDCHEM FILTERING SUMMARY\n")
        f.write("=" * 80 + "\n\n")

        f.write(f"Total molecules processed: {len(df)}\n\n")

        # Rule results
        rule_cols = [col for col in df.columns if col.startswith("rule_") or col == "passes_all_rules"]
        if rule_cols:
            f.write("RULE FILTERS:\n")
            f.write("-" * 40 + "\n")
            for col in rule_cols:
                if col in df.columns and df[col].dtype == bool:
                    n_pass = df[col].sum()
                    pct = 100 * n_pass / len(df)
                    f.write(f"  {col}: {n_pass} passed ({pct:.1f}%)\n")
            f.write("\n")

        # Structural alerts
        alert_cols = [col for col in df.columns if "alert" in col.lower() or "nibr" in col.lower() or "lilly" in col.lower() or "pains" in col.lower()]
        if alert_cols:
            f.write("STRUCTURAL ALERTS:\n")
            f.write("-" * 40 + "\n")
            if "has_common_alerts" in df.columns:
                n_clean = (~df["has_common_alerts"]).sum()
                pct = 100 * n_clean / len(df)
                f.write(f"  No common alerts: {n_clean} ({pct:.1f}%)\n")
            if "passes_nibr" in df.columns:
                n_pass = df["passes_nibr"].sum()
                pct = 100 * n_pass / len(df)
                f.write(f"  Passes NIBR: {n_pass} ({pct:.1f}%)\n")
            if "passes_lilly" in df.columns:
                n_pass = df["passes_lilly"].sum()
                pct = 100 * n_pass / len(df)
                f.write(f"  Passes Lilly: {n_pass} ({pct:.1f}%)\n")
                avg_demerits = df["lilly_demerits"].mean()
                f.write(f"  Average Lilly demerits: {avg_demerits:.1f}\n")
            if "passes_pains" in df.columns:
                n_pass = df["passes_pains"].sum()
                pct = 100 * n_pass / len(df)
                f.write(f"  Passes PAINS: {n_pass} ({pct:.1f}%)\n")
            f.write("\n")

        # Complexity
        if "complexity_score" in df.columns:
            f.write("COMPLEXITY:\n")
            f.write("-" * 40 + "\n")
            avg_complexity = df["complexity_score"].mean()
            f.write(f"  Average complexity: {avg_complexity:.1f}\n")
            if "passes_complexity" in df.columns:
                n_pass = df["passes_complexity"].sum()
                pct = 100 * n_pass / len(df)
                f.write(f"  Within threshold: {n_pass} ({pct:.1f}%)\n")
            f.write("\n")

        # Constraints
        if "passes_constraints" in df.columns:
            f.write("CONSTRAINTS:\n")
            f.write("-" * 40 + "\n")
            n_pass = df["passes_constraints"].sum()
            pct = 100 * n_pass / len(df)
            f.write(f"  Passes all constraints: {n_pass} ({pct:.1f}%)\n")
            f.write("\n")

        # Overall pass rate
        pass_cols = [col for col in df.columns if col.startswith("passes_")]
        if pass_cols:
            df["passes_all_filters"] = df[pass_cols].all(axis=1)
            n_pass = df["passes_all_filters"].sum()
            pct = 100 * n_pass / len(df)
            f.write("OVERALL:\n")
            f.write("-" * 40 + "\n")
            f.write(f"  Molecules passing all filters: {n_pass} ({pct:.1f}%)\n")

        f.write("\n" + "=" * 80 + "\n")

    print(f"\nSummary report saved to: {summary_file}")


def main():
    parser = argparse.ArgumentParser(
        description="Batch molecular filtering using medchem",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )

    # Input/Output
    parser.add_argument("input", type=Path, help="Input file (CSV, TSV, SDF, or TXT)")
    parser.add_argument("--output", "-o", type=Path, required=True, help="Output CSV file")
    parser.add_argument("--smiles-column", default="smiles", help="Name of SMILES column (default: smiles)")

    # Rule filters
    parser.add_argument("--rules", help="Comma-separated list of rules (e.g., rule_of_five,rule_of_cns)")

    # Structural alerts
    parser.add_argument("--common-alerts", action="store_true", help="Apply common structural alerts")
    parser.add_argument("--nibr", action="store_true", help="Apply NIBR filters")
    parser.add_argument("--lilly", action="store_true", help="Apply Lilly demerits filter")
    parser.add_argument("--pains", action="store_true", help="Apply PAINS filter")

    # Complexity
    parser.add_argument("--complexity", type=float, help="Maximum complexity threshold")
    parser.add_argument("--complexity-method", default="bertz", choices=["bertz", "whitlock", "barone"],
                       help="Complexity calculation method")

    # Constraints
    parser.add_argument("--mw-range", help="Molecular weight range (e.g., 200,500)")
    parser.add_argument("--logp-range", help="LogP range (e.g., -2,5)")
    parser.add_argument("--tpsa-max", type=float, help="Maximum TPSA")
    parser.add_argument("--hbd-max", type=int, help="Maximum H-bond donors")
    parser.add_argument("--hba-max", type=int, help="Maximum H-bond acceptors")
    parser.add_argument("--rotatable-bonds-max", type=int, help="Maximum rotatable bonds")

    # Chemical groups
    parser.add_argument("--groups", help="Comma-separated chemical groups to detect")

    # Processing options
    parser.add_argument("--n-jobs", type=int, default=-1, help="Number of parallel jobs (-1 = all cores)")
    parser.add_argument("--no-summary", action="store_true", help="Don't generate summary report")
    parser.add_argument("--filter-output", action="store_true", help="Only output molecules passing all filters")

    args = parser.parse_args()

    # Load molecules
    df, mols = load_molecules(args.input, args.smiles_column)

    # Apply filters
    result_dfs = [df]

    # Rules
    if args.rules:
        rule_list = [r.strip() for r in args.rules.split(",")]
        df_rules = apply_rule_filters(mols, rule_list, args.n_jobs)
        result_dfs.append(df_rules)

    # Structural alerts
    if args.common_alerts:
        df_alerts = apply_structural_alerts(mols, "common", args.n_jobs)
        result_dfs.append(df_alerts)

    if args.nibr:
        df_nibr = apply_structural_alerts(mols, "nibr", args.n_jobs)
        result_dfs.append(df_nibr)

    if args.lilly:
        df_lilly = apply_structural_alerts(mols, "lilly", args.n_jobs)
        result_dfs.append(df_lilly)

    if args.pains:
        df_pains = apply_structural_alerts(mols, "pains", args.n_jobs)
        result_dfs.append(df_pains)

    # Complexity
    if args.complexity:
        df_complexity = apply_complexity_filter(mols, args.complexity, args.complexity_method)
        result_dfs.append(df_complexity)

    # Constraints
    constraints = {}
    if args.mw_range:
        mw_min, mw_max = map(float, args.mw_range.split(","))
        constraints["mw_range"] = (mw_min, mw_max)
    if args.logp_range:
        logp_min, logp_max = map(float, args.logp_range.split(","))
        constraints["logp_range"] = (logp_min, logp_max)
    if args.tpsa_max:
        constraints["tpsa_max"] = args.tpsa_max
    if args.hbd_max:
        constraints["hbd_max"] = args.hbd_max
    if args.hba_max:
        constraints["hba_max"] = args.hba_max
    if args.rotatable_bonds_max:
        constraints["rotatable_bonds_max"] = args.rotatable_bonds_max

    if constraints:
        df_constraints = apply_constraints(mols, constraints, args.n_jobs)
        result_dfs.append(df_constraints)

    # Chemical groups
    if args.groups:
        group_list = [g.strip() for g in args.groups.split(",")]
        df_groups = apply_chemical_groups(mols, group_list)
        result_dfs.append(df_groups)

    # Combine results
    df_final = pd.concat(result_dfs, axis=1)

    # Filter output if requested
    if args.filter_output:
        pass_cols = [col for col in df_final.columns if col.startswith("passes_")]
        if pass_cols:
            df_final["passes_all"] = df_final[pass_cols].all(axis=1)
            df_final = df_final[df_final["passes_all"]]
            print(f"\nFiltered to {len(df_final)} molecules passing all filters")

    # Save results
    args.output.parent.mkdir(parents=True, exist_ok=True)
    df_final.to_csv(args.output, index=False)
    print(f"\nResults saved to: {args.output}")

    # Generate summary
    if not args.no_summary:
        generate_summary(df_final, args.output)

    print("\nDone!")


if __name__ == "__main__":
    main()
