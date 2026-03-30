#!/usr/bin/env python3
"""
Molecular Similarity Search

Perform fingerprint-based similarity screening against a database of molecules.
Supports multiple fingerprint types and similarity metrics.

Usage:
    python similarity_search.py "CCO" database.smi --threshold 0.7
    python similarity_search.py query.smi database.sdf --method morgan --output hits.csv
"""

import argparse
import sys
from pathlib import Path

try:
    from rdkit import Chem
    from rdkit.Chem import AllChem, MACCSkeys, rdFingerprintGenerator
    from rdkit import DataStructs
except ImportError:
    print("Error: RDKit not installed. Install with: conda install -c conda-forge rdkit")
    sys.exit(1)


FINGERPRINT_METHODS = {
    'morgan': 'Morgan fingerprint (ECFP-like)',
    'rdkit': 'RDKit topological fingerprint',
    'maccs': 'MACCS structural keys',
    'atompair': 'Atom pair fingerprint',
    'torsion': 'Topological torsion fingerprint'
}


def generate_fingerprint(mol, method='morgan', radius=2, n_bits=2048):
    """Generate molecular fingerprint based on specified method."""
    if mol is None:
        return None

    method = method.lower()

    if method == 'morgan':
        gen = rdFingerprintGenerator.GetMorganGenerator(radius=radius, fpSize=n_bits)
        return gen.GetFingerprint(mol)
    elif method == 'rdkit':
        gen = rdFingerprintGenerator.GetRDKitFPGenerator(maxPath=7, fpSize=n_bits)
        return gen.GetFingerprint(mol)
    elif method == 'maccs':
        return MACCSkeys.GenMACCSKeys(mol)
    elif method == 'atompair':
        gen = rdFingerprintGenerator.GetAtomPairGenerator(fpSize=n_bits)
        return gen.GetFingerprint(mol)
    elif method == 'torsion':
        gen = rdFingerprintGenerator.GetTopologicalTorsionGenerator(fpSize=n_bits)
        return gen.GetFingerprint(mol)
    else:
        raise ValueError(f"Unknown fingerprint method: {method}")


def load_molecules(file_path):
    """Load molecules from file."""
    path = Path(file_path)

    if not path.exists():
        print(f"Error: File not found: {file_path}")
        return []

    molecules = []

    if path.suffix.lower() in ['.sdf', '.mol']:
        suppl = Chem.SDMolSupplier(str(path))
    elif path.suffix.lower() in ['.smi', '.smiles', '.txt']:
        suppl = Chem.SmilesMolSupplier(str(path), titleLine=False)
    else:
        print(f"Error: Unsupported file format: {path.suffix}")
        return []

    for idx, mol in enumerate(suppl):
        if mol is None:
            print(f"Warning: Failed to parse molecule {idx+1}")
            continue

        # Try to get molecule name
        name = mol.GetProp('_Name') if mol.HasProp('_Name') else f"Mol_{idx+1}"
        smiles = Chem.MolToSmiles(mol)

        molecules.append({
            'index': idx + 1,
            'name': name,
            'smiles': smiles,
            'mol': mol
        })

    return molecules


def similarity_search(query_mol, database, method='morgan', threshold=0.7,
                     radius=2, n_bits=2048, metric='tanimoto'):
    """
    Perform similarity search.

    Args:
        query_mol: Query molecule (RDKit Mol object)
        database: List of database molecules
        method: Fingerprint method
        threshold: Similarity threshold (0-1)
        radius: Morgan fingerprint radius
        n_bits: Fingerprint size
        metric: Similarity metric (tanimoto, dice, cosine)

    Returns:
        List of hits with similarity scores
    """
    if query_mol is None:
        print("Error: Invalid query molecule")
        return []

    # Generate query fingerprint
    query_fp = generate_fingerprint(query_mol, method, radius, n_bits)
    if query_fp is None:
        print("Error: Failed to generate query fingerprint")
        return []

    # Choose similarity function
    if metric.lower() == 'tanimoto':
        sim_func = DataStructs.TanimotoSimilarity
    elif metric.lower() == 'dice':
        sim_func = DataStructs.DiceSimilarity
    elif metric.lower() == 'cosine':
        sim_func = DataStructs.CosineSimilarity
    else:
        raise ValueError(f"Unknown similarity metric: {metric}")

    # Search database
    hits = []
    for db_entry in database:
        db_fp = generate_fingerprint(db_entry['mol'], method, radius, n_bits)
        if db_fp is None:
            continue

        similarity = sim_func(query_fp, db_fp)

        if similarity >= threshold:
            hits.append({
                'index': db_entry['index'],
                'name': db_entry['name'],
                'smiles': db_entry['smiles'],
                'similarity': similarity
            })

    # Sort by similarity (descending)
    hits.sort(key=lambda x: x['similarity'], reverse=True)

    return hits


def write_results(hits, output_file):
    """Write results to CSV file."""
    import csv

    with open(output_file, 'w', newline='') as f:
        fieldnames = ['Rank', 'Index', 'Name', 'SMILES', 'Similarity']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()

        for rank, hit in enumerate(hits, 1):
            writer.writerow({
                'Rank': rank,
                'Index': hit['index'],
                'Name': hit['name'],
                'SMILES': hit['smiles'],
                'Similarity': f"{hit['similarity']:.4f}"
            })


def print_results(hits, max_display=20):
    """Print results to console."""
    if not hits:
        print("\nNo hits found above threshold")
        return

    print(f"\nFound {len(hits)} similar molecules:")
    print("="*80)
    print(f"{'Rank':<6} {'Index':<8} {'Similarity':<12} {'Name':<20} {'SMILES'}")
    print("-"*80)

    for rank, hit in enumerate(hits[:max_display], 1):
        name = hit['name'][:18] + '..' if len(hit['name']) > 20 else hit['name']
        smiles = hit['smiles'][:40] + '...' if len(hit['smiles']) > 43 else hit['smiles']
        print(f"{rank:<6} {hit['index']:<8} {hit['similarity']:<12.4f} {name:<20} {smiles}")

    if len(hits) > max_display:
        print(f"\n... and {len(hits) - max_display} more")

    print("="*80)


def main():
    parser = argparse.ArgumentParser(
        description='Molecular similarity search using fingerprints',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=f"""
Available fingerprint methods:
{chr(10).join(f'  {k:12s} - {v}' for k, v in FINGERPRINT_METHODS.items())}

Similarity metrics:
  tanimoto    - Tanimoto coefficient (default)
  dice        - Dice coefficient
  cosine      - Cosine similarity

Examples:
  # Search with SMILES query
  python similarity_search.py "CCO" database.smi --threshold 0.7

  # Use different fingerprint
  python similarity_search.py query.smi database.sdf --method maccs

  # Save results
  python similarity_search.py "c1ccccc1" database.smi --output hits.csv

  # Adjust Morgan radius
  python similarity_search.py "CCO" database.smi --method morgan --radius 3
        """
    )

    parser.add_argument('query', help='Query SMILES or file')
    parser.add_argument('database', help='Database file (SDF or SMILES)')
    parser.add_argument('--method', '-m', default='morgan',
                       choices=FINGERPRINT_METHODS.keys(),
                       help='Fingerprint method (default: morgan)')
    parser.add_argument('--threshold', '-t', type=float, default=0.7,
                       help='Similarity threshold (default: 0.7)')
    parser.add_argument('--radius', '-r', type=int, default=2,
                       help='Morgan fingerprint radius (default: 2)')
    parser.add_argument('--bits', '-b', type=int, default=2048,
                       help='Fingerprint size (default: 2048)')
    parser.add_argument('--metric', default='tanimoto',
                       choices=['tanimoto', 'dice', 'cosine'],
                       help='Similarity metric (default: tanimoto)')
    parser.add_argument('--output', '-o', help='Output CSV file')
    parser.add_argument('--max-display', type=int, default=20,
                       help='Maximum hits to display (default: 20)')

    args = parser.parse_args()

    # Load query
    query_path = Path(args.query)
    if query_path.exists():
        # Query is a file
        query_mols = load_molecules(args.query)
        if not query_mols:
            print("Error: No valid molecules in query file")
            sys.exit(1)
        query_mol = query_mols[0]['mol']
        query_smiles = query_mols[0]['smiles']
    else:
        # Query is SMILES string
        query_mol = Chem.MolFromSmiles(args.query)
        query_smiles = args.query
        if query_mol is None:
            print(f"Error: Failed to parse query SMILES: {args.query}")
            sys.exit(1)

    print(f"Query: {query_smiles}")
    print(f"Method: {args.method}")
    print(f"Threshold: {args.threshold}")
    print(f"Loading database: {args.database}...")

    # Load database
    database = load_molecules(args.database)
    if not database:
        print("Error: No valid molecules in database")
        sys.exit(1)

    print(f"Loaded {len(database)} molecules")
    print("Searching...")

    # Perform search
    hits = similarity_search(
        query_mol, database,
        method=args.method,
        threshold=args.threshold,
        radius=args.radius,
        n_bits=args.bits,
        metric=args.metric
    )

    # Output results
    if args.output:
        write_results(hits, args.output)
        print(f"\nResults written to: {args.output}")

    print_results(hits, args.max_display)


if __name__ == '__main__':
    main()
