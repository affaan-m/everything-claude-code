#!/usr/bin/env python3
"""
Gene Analysis Script
Quick analysis of a gene: search, info, sequences, expression, and enrichment
"""

import argparse
import sys
import gget


def analyze_gene(gene_name, species="homo_sapiens", output_prefix=None):
    """
    Perform comprehensive analysis of a gene.

    Args:
        gene_name: Gene symbol to analyze
        species: Species name (default: homo_sapiens)
        output_prefix: Prefix for output files (default: gene_name)
    """
    if output_prefix is None:
        output_prefix = gene_name.lower()

    print(f"Analyzing gene: {gene_name}")
    print("=" * 60)

    # Step 1: Search for the gene
    print("\n1. Searching for gene...")
    search_results = gget.search([gene_name], species=species, limit=1)

    if len(search_results) == 0:
        print(f"Error: Gene '{gene_name}' not found in {species}")
        return False

    gene_id = search_results["ensembl_id"].iloc[0]
    print(f"   Found: {gene_id}")
    print(f"   Description: {search_results['ensembl_description'].iloc[0]}")

    # Step 2: Get detailed information
    print("\n2. Getting detailed information...")
    gene_info = gget.info([gene_id], pdb=True)
    gene_info.to_csv(f"{output_prefix}_info.csv", index=False)
    print(f"   Saved to: {output_prefix}_info.csv")

    if "uniprot_id" in gene_info.columns and gene_info["uniprot_id"].iloc[0]:
        print(f"   UniProt ID: {gene_info['uniprot_id'].iloc[0]}")
    if "pdb_id" in gene_info.columns and gene_info["pdb_id"].iloc[0]:
        print(f"   PDB IDs: {gene_info['pdb_id'].iloc[0]}")

    # Step 3: Get sequences
    print("\n3. Retrieving sequences...")
    nucleotide_seq = gget.seq([gene_id])
    protein_seq = gget.seq([gene_id], translate=True)

    with open(f"{output_prefix}_nucleotide.fasta", "w") as f:
        f.write(nucleotide_seq)
    print(f"   Nucleotide sequence saved to: {output_prefix}_nucleotide.fasta")

    with open(f"{output_prefix}_protein.fasta", "w") as f:
        f.write(protein_seq)
    print(f"   Protein sequence saved to: {output_prefix}_protein.fasta")

    # Step 4: Get tissue expression
    print("\n4. Getting tissue expression...")
    try:
        tissue_expr = gget.archs4(gene_name, which="tissue")
        tissue_expr.to_csv(f"{output_prefix}_tissue_expression.csv", index=False)
        print(f"   Saved to: {output_prefix}_tissue_expression.csv")

        # Show top tissues
        top_tissues = tissue_expr.nlargest(5, "median")
        print("\n   Top expressing tissues:")
        for _, row in top_tissues.iterrows():
            print(f"     {row['tissue']}: median = {row['median']:.2f}")
    except Exception as e:
        print(f"   Warning: Could not retrieve ARCHS4 data: {e}")

    # Step 5: Find correlated genes
    print("\n5. Finding correlated genes...")
    try:
        correlated = gget.archs4(gene_name, which="correlation")
        correlated.to_csv(f"{output_prefix}_correlated_genes.csv", index=False)
        print(f"   Saved to: {output_prefix}_correlated_genes.csv")

        # Show top correlated
        print("\n   Top 10 correlated genes:")
        for _, row in correlated.head(10).iterrows():
            print(f"     {row['gene_symbol']}: r = {row['correlation']:.3f}")
    except Exception as e:
        print(f"   Warning: Could not retrieve correlation data: {e}")

    # Step 6: Get disease associations
    print("\n6. Getting disease associations...")
    try:
        diseases = gget.opentargets(gene_id, resource="diseases", limit=10)
        diseases.to_csv(f"{output_prefix}_diseases.csv", index=False)
        print(f"   Saved to: {output_prefix}_diseases.csv")

        print("\n   Top 5 disease associations:")
        for _, row in diseases.head(5).iterrows():
            print(f"     {row['disease_name']}: score = {row['overall_score']:.3f}")
    except Exception as e:
        print(f"   Warning: Could not retrieve disease data: {e}")

    # Step 7: Get drug associations
    print("\n7. Getting drug associations...")
    try:
        drugs = gget.opentargets(gene_id, resource="drugs", limit=10)
        if len(drugs) > 0:
            drugs.to_csv(f"{output_prefix}_drugs.csv", index=False)
            print(f"   Saved to: {output_prefix}_drugs.csv")
            print(f"\n   Found {len(drugs)} drug associations")
        else:
            print("   No drug associations found")
    except Exception as e:
        print(f"   Warning: Could not retrieve drug data: {e}")

    print("\n" + "=" * 60)
    print("Analysis complete!")
    print(f"\nOutput files (prefix: {output_prefix}):")
    print(f"  - {output_prefix}_info.csv")
    print(f"  - {output_prefix}_nucleotide.fasta")
    print(f"  - {output_prefix}_protein.fasta")
    print(f"  - {output_prefix}_tissue_expression.csv")
    print(f"  - {output_prefix}_correlated_genes.csv")
    print(f"  - {output_prefix}_diseases.csv")
    print(f"  - {output_prefix}_drugs.csv (if available)")

    return True


def main():
    parser = argparse.ArgumentParser(
        description="Perform comprehensive analysis of a gene using gget"
    )
    parser.add_argument("gene", help="Gene symbol to analyze")
    parser.add_argument(
        "-s",
        "--species",
        default="homo_sapiens",
        help="Species (default: homo_sapiens)",
    )
    parser.add_argument(
        "-o", "--output", help="Output prefix for files (default: gene name)"
    )

    args = parser.parse_args()

    try:
        success = analyze_gene(args.gene, args.species, args.output)
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\nAnalysis interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nError: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
