"""
Phylogenetic Analysis Pipeline
===============================
Complete workflow: MAFFT alignment → IQ-TREE tree → ETE3 visualization.

Requirements:
    conda install -c bioconda mafft iqtree
    pip install ete3

Usage:
    python phylogenetic_analysis.py sequences.fasta --type nt --threads 4
    python phylogenetic_analysis.py proteins.fasta --type aa --fasttree
"""

import argparse
import os
import subprocess
import sys
from pathlib import Path


def check_dependencies():
    """Check that required tools are installed."""
    tools = {
        "mafft": "conda install -c bioconda mafft",
        "iqtree2": "conda install -c bioconda iqtree",
    }
    missing = []
    for tool, install_cmd in tools.items():
        result = subprocess.run(["which", tool], capture_output=True)
        if result.returncode != 0:
            missing.append(f"  {tool}: {install_cmd}")

    if missing:
        print("Missing dependencies:")
        for m in missing:
            print(m)
        sys.exit(1)
    print("All dependencies found.")


def count_sequences(fasta_file: str) -> int:
    """Count sequences in a FASTA file."""
    with open(fasta_file) as f:
        return sum(1 for line in f if line.startswith('>'))


def run_mafft(input_fasta: str, output_fasta: str, n_threads: int = 4,
               method: str = "auto") -> str:
    """Run MAFFT multiple sequence alignment."""
    n_seqs = count_sequences(input_fasta)
    print(f"MAFFT: Aligning {n_seqs} sequences...")

    # Auto-select method based on dataset size
    if method == "auto":
        if n_seqs <= 200:
            cmd = ["mafft", "--localpair", "--maxiterate", "1000",
                   "--thread", str(n_threads), "--inputorder", input_fasta]
        elif n_seqs <= 1000:
            cmd = ["mafft", "--auto", "--thread", str(n_threads),
                   "--inputorder", input_fasta]
        else:
            cmd = ["mafft", "--fftns", "--thread", str(n_threads),
                   "--inputorder", input_fasta]
    else:
        cmd = ["mafft", f"--{method}", "--thread", str(n_threads),
               "--inputorder", input_fasta]

    with open(output_fasta, 'w') as out:
        result = subprocess.run(cmd, stdout=out, stderr=subprocess.PIPE, text=True)

    if result.returncode != 0:
        raise RuntimeError(f"MAFFT failed:\n{result.stderr[:500]}")

    print(f"  Alignment complete → {output_fasta}")
    return output_fasta


def run_iqtree(aligned_fasta: str, prefix: str, seq_type: str = "nt",
                bootstrap: int = 1000, n_threads: int = 4,
                outgroup: str = None) -> str:
    """Run IQ-TREE 2 phylogenetic inference."""
    print(f"IQ-TREE 2: Building maximum likelihood tree...")

    cmd = [
        "iqtree2",
        "-s", aligned_fasta,
        "--prefix", prefix,
        "-m", "TEST",           # Auto model selection
        "-B", str(bootstrap),   # Ultrafast bootstrap
        "-T", str(n_threads),
        "--redo",
        "-alrt", "1000",        # SH-aLRT test
    ]

    if outgroup:
        cmd += ["-o", outgroup]

    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        raise RuntimeError(f"IQ-TREE failed:\n{result.stderr[:500]}")

    tree_file = f"{prefix}.treefile"

    # Extract best model from log
    log_file = f"{prefix}.log"
    if os.path.exists(log_file):
        with open(log_file) as f:
            for line in f:
                if "Best-fit model" in line:
                    print(f"  {line.strip()}")

    print(f"  Tree saved → {tree_file}")
    return tree_file


def run_fasttree(aligned_fasta: str, output_tree: str, seq_type: str = "nt") -> str:
    """Run FastTree (faster alternative for large datasets)."""
    print("FastTree: Building approximate ML tree (faster)...")

    if seq_type == "nt":
        cmd = ["FastTree", "-nt", "-gtr", "-gamma", aligned_fasta]
    else:
        cmd = ["FastTree", "-lg", "-gamma", aligned_fasta]

    with open(output_tree, 'w') as out:
        result = subprocess.run(cmd, stdout=out, stderr=subprocess.PIPE, text=True)

    if result.returncode != 0:
        raise RuntimeError(f"FastTree failed:\n{result.stderr[:500]}")

    print(f"  Tree saved → {output_tree}")
    return output_tree


def visualize_tree(tree_file: str, output_png: str, outgroup: str = None) -> None:
    """Visualize the phylogenetic tree with ETE3."""
    try:
        from ete3 import Tree, TreeStyle, NodeStyle
    except ImportError:
        print("ETE3 not installed. Skipping visualization.")
        print("  Install: pip install ete3")
        return

    t = Tree(tree_file)

    # Root the tree
    if outgroup and outgroup in [leaf.name for leaf in t.get_leaves()]:
        t.set_outgroup(outgroup)
        print(f"  Rooted at outgroup: {outgroup}")
    else:
        # Midpoint rooting
        t.set_outgroup(t.get_midpoint_outgroup())
        print("  Applied midpoint rooting")

    # Style
    ts = TreeStyle()
    ts.show_leaf_name = True
    ts.show_branch_support = True
    ts.mode = "r"  # rectangular

    try:
        t.render(output_png, tree_style=ts, w=800, units="px")
        print(f"  Visualization saved → {output_png}")
    except Exception as e:
        print(f"  Visualization failed (display issue?): {e}")
        # Save tree in Newick format as fallback
        rooted_nwk = output_png.replace(".png", "_rooted.nwk")
        t.write(format=1, outfile=rooted_nwk)
        print(f"  Rooted tree saved → {rooted_nwk}")


def tree_summary(tree_file: str) -> dict:
    """Print summary statistics for the tree."""
    try:
        from ete3 import Tree
        t = Tree(tree_file)
        t.set_outgroup(t.get_midpoint_outgroup())

        leaves = t.get_leaves()
        branch_lengths = [n.dist for n in t.traverse() if n.dist > 0]

        stats = {
            "n_taxa": len(leaves),
            "total_branch_length": sum(branch_lengths),
            "mean_branch_length": sum(branch_lengths) / len(branch_lengths) if branch_lengths else 0,
            "max_branch_length": max(branch_lengths) if branch_lengths else 0,
        }

        print("\nTree Summary:")
        for k, v in stats.items():
            if isinstance(v, float):
                print(f"  {k}: {v:.6f}")
            else:
                print(f"  {k}: {v}")

        return stats
    except Exception as e:
        print(f"Could not compute tree stats: {e}")
        return {}


def main():
    parser = argparse.ArgumentParser(description="Phylogenetic analysis pipeline")
    parser.add_argument("input", help="Input FASTA file (unaligned)")
    parser.add_argument("--type", choices=["nt", "aa"], default="nt",
                        help="Sequence type: nt (nucleotide) or aa (amino acid)")
    parser.add_argument("--threads", type=int, default=4, help="Number of threads")
    parser.add_argument("--bootstrap", type=int, default=1000,
                        help="Bootstrap replicates for IQ-TREE")
    parser.add_argument("--fasttree", action="store_true",
                        help="Use FastTree instead of IQ-TREE (faster, less accurate)")
    parser.add_argument("--outgroup", help="Outgroup taxon name for rooting")
    parser.add_argument("--mafft-method", default="auto",
                        choices=["auto", "linsi", "einsi", "fftnsi", "fftns"],
                        help="MAFFT alignment method")
    parser.add_argument("--output-dir", default="phylo_results",
                        help="Output directory")

    args = parser.parse_args()

    # Setup
    os.makedirs(args.output_dir, exist_ok=True)
    prefix = os.path.join(args.output_dir, Path(args.input).stem)

    print("=" * 60)
    print("Phylogenetic Analysis Pipeline")
    print("=" * 60)
    print(f"Input: {args.input}")
    print(f"Sequence type: {args.type}")
    print(f"Output dir: {args.output_dir}")

    # Step 1: Multiple Sequence Alignment
    print("\n[Step 1/3] Multiple Sequence Alignment (MAFFT)")
    aligned = run_mafft(
        args.input,
        f"{prefix}_aligned.fasta",
        n_threads=args.threads,
        method=args.mafft_method
    )

    # Step 2: Tree Inference
    print("\n[Step 2/3] Tree Inference")
    if args.fasttree:
        tree_file = run_fasttree(aligned, f"{prefix}.tree", seq_type=args.type)
    else:
        tree_file = run_iqtree(
            aligned, prefix,
            seq_type=args.type,
            bootstrap=args.bootstrap,
            n_threads=args.threads,
            outgroup=args.outgroup
        )

    # Step 3: Visualization
    print("\n[Step 3/3] Visualization (ETE3)")
    visualize_tree(tree_file, f"{prefix}_tree.png", outgroup=args.outgroup)
    tree_summary(tree_file)

    print("\n" + "=" * 60)
    print("Analysis complete!")
    print(f"Key outputs:")
    print(f"  Aligned sequences: {aligned}")
    print(f"  Tree file: {tree_file}")
    print(f"  Visualization: {prefix}_tree.png")


if __name__ == "__main__":
    main()
