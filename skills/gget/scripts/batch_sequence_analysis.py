#!/usr/bin/env python3
"""
Batch Sequence Analysis Script
Analyze multiple sequences: BLAST, alignment, and structure prediction
"""

import argparse
import sys
from pathlib import Path
import gget


def read_fasta(fasta_file):
    """Read sequences from FASTA file."""
    sequences = []
    current_id = None
    current_seq = []

    with open(fasta_file, "r") as f:
        for line in f:
            line = line.strip()
            if line.startswith(">"):
                if current_id:
                    sequences.append({"id": current_id, "seq": "".join(current_seq)})
                current_id = line[1:]
                current_seq = []
            else:
                current_seq.append(line)

        if current_id:
            sequences.append({"id": current_id, "seq": "".join(current_seq)})

    return sequences


def analyze_sequences(
    fasta_file,
    blast_db="nr",
    align=True,
    predict_structure=False,
    output_dir="output",
):
    """
    Perform batch sequence analysis.

    Args:
        fasta_file: Path to FASTA file with sequences
        blast_db: BLAST database to search (default: nr)
        align: Whether to perform multiple sequence alignment
        predict_structure: Whether to predict structures with AlphaFold
        output_dir: Output directory for results
    """
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)

    print(f"Batch Sequence Analysis")
    print("=" * 60)
    print(f"Input file: {fasta_file}")
    print(f"Output directory: {output_dir}")
    print("")

    # Read sequences
    print("Reading sequences...")
    sequences = read_fasta(fasta_file)
    print(f"Found {len(sequences)} sequences\n")

    # Step 1: BLAST each sequence
    print("Step 1: Running BLAST searches...")
    print("-" * 60)
    for i, seq_data in enumerate(sequences):
        print(f"\n{i+1}. BLASTing {seq_data['id']}...")
        try:
            blast_results = gget.blast(
                seq_data["seq"], database=blast_db, limit=10, save=False
            )

            output_file = output_path / f"{seq_data['id']}_blast.csv"
            blast_results.to_csv(output_file, index=False)
            print(f"   Results saved to: {output_file}")

            if len(blast_results) > 0:
                print(f"   Top hit: {blast_results.iloc[0]['Description']}")
                print(
                    f"   Max Score: {blast_results.iloc[0]['Max Score']}, "
                    f"Query Coverage: {blast_results.iloc[0]['Query Coverage']}"
                )
        except Exception as e:
            print(f"   Error: {e}")

    # Step 2: Multiple sequence alignment
    if align and len(sequences) > 1:
        print("\n\nStep 2: Multiple sequence alignment...")
        print("-" * 60)
        try:
            alignment = gget.muscle(fasta_file)
            alignment_file = output_path / "alignment.afa"
            with open(alignment_file, "w") as f:
                f.write(alignment)
            print(f"Alignment saved to: {alignment_file}")
        except Exception as e:
            print(f"Error in alignment: {e}")
    else:
        print("\n\nStep 2: Skipping alignment (only 1 sequence or disabled)")

    # Step 3: Structure prediction (optional)
    if predict_structure:
        print("\n\nStep 3: Predicting structures with AlphaFold...")
        print("-" * 60)
        print(
            "Note: This requires 'gget setup alphafold' and is computationally intensive"
        )

        for i, seq_data in enumerate(sequences):
            print(f"\n{i+1}. Predicting structure for {seq_data['id']}...")
            try:
                structure_dir = output_path / f"structure_{seq_data['id']}"
                # Uncomment to run AlphaFold prediction:
                # gget.alphafold(seq_data['seq'], out=str(structure_dir))
                # print(f"   Structure saved to: {structure_dir}")
                print(
                    "   (Prediction skipped - uncomment code to run AlphaFold prediction)"
                )
            except Exception as e:
                print(f"   Error: {e}")
    else:
        print("\n\nStep 3: Structure prediction disabled")

    # Summary
    print("\n" + "=" * 60)
    print("Batch analysis complete!")
    print(f"\nResults saved to: {output_dir}/")
    print(f"  - BLAST results: *_blast.csv")
    if align and len(sequences) > 1:
        print(f"  - Alignment: alignment.afa")
    if predict_structure:
        print(f"  - Structures: structure_*/")

    return True


def main():
    parser = argparse.ArgumentParser(
        description="Perform batch sequence analysis using gget"
    )
    parser.add_argument("fasta", help="Input FASTA file with sequences")
    parser.add_argument(
        "-db",
        "--database",
        default="nr",
        help="BLAST database (default: nr for proteins, nt for nucleotides)",
    )
    parser.add_argument(
        "--no-align", action="store_true", help="Skip multiple sequence alignment"
    )
    parser.add_argument(
        "--predict-structure",
        action="store_true",
        help="Predict structures with AlphaFold (requires setup)",
    )
    parser.add_argument(
        "-o", "--output", default="output", help="Output directory (default: output)"
    )

    args = parser.parse_args()

    if not Path(args.fasta).exists():
        print(f"Error: File not found: {args.fasta}")
        sys.exit(1)

    try:
        success = analyze_sequences(
            args.fasta,
            blast_db=args.database,
            align=not args.no_align,
            predict_structure=args.predict_structure,
            output_dir=args.output,
        )
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\nAnalysis interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nError: {e}")
        import traceback

        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
