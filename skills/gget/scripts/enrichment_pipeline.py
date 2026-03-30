#!/usr/bin/env python3
"""
Enrichment Analysis Pipeline
Perform comprehensive enrichment analysis on a gene list
"""

import argparse
import sys
from pathlib import Path
import gget
import pandas as pd


def read_gene_list(file_path):
    """Read gene list from file (one gene per line or CSV)."""
    file_path = Path(file_path)

    if file_path.suffix == ".csv":
        df = pd.read_csv(file_path)
        # Assume first column contains gene names
        genes = df.iloc[:, 0].tolist()
    else:
        # Plain text file
        with open(file_path, "r") as f:
            genes = [line.strip() for line in f if line.strip()]

    return genes


def enrichment_pipeline(
    gene_list,
    species="human",
    background=None,
    output_prefix="enrichment",
    plot=True,
):
    """
    Perform comprehensive enrichment analysis.

    Args:
        gene_list: List of gene symbols
        species: Species for analysis
        background: Background gene list (optional)
        output_prefix: Prefix for output files
        plot: Whether to generate plots
    """
    print("Enrichment Analysis Pipeline")
    print("=" * 60)
    print(f"Analyzing {len(gene_list)} genes")
    print(f"Species: {species}\n")

    # Database categories to analyze
    databases = {
        "pathway": "KEGG Pathways",
        "ontology": "Gene Ontology (Biological Process)",
        "transcription": "Transcription Factors (ChEA)",
        "diseases_drugs": "Disease Associations (GWAS)",
        "celltypes": "Cell Type Markers (PanglaoDB)",
    }

    results = {}

    for db_key, db_name in databases.items():
        print(f"\nAnalyzing: {db_name}")
        print("-" * 60)

        try:
            enrichment = gget.enrichr(
                gene_list,
                database=db_key,
                species=species,
                background_list=background,
                plot=plot,
            )

            if enrichment is not None and len(enrichment) > 0:
                # Save results
                output_file = f"{output_prefix}_{db_key}.csv"
                enrichment.to_csv(output_file, index=False)
                print(f"Results saved to: {output_file}")

                # Show top 5 results
                print(f"\nTop 5 enriched terms:")
                for i, row in enrichment.head(5).iterrows():
                    term = row.get("name", row.get("term", "Unknown"))
                    p_val = row.get(
                        "adjusted_p_value",
                        row.get("p_value", row.get("Adjusted P-value", 1)),
                    )
                    print(f"  {i+1}. {term}")
                    print(f"     P-value: {p_val:.2e}")

                results[db_key] = enrichment
            else:
                print("No significant results found")

        except Exception as e:
            print(f"Error: {e}")

    # Generate summary report
    print("\n" + "=" * 60)
    print("Generating summary report...")

    summary = []
    for db_key, db_name in databases.items():
        if db_key in results and len(results[db_key]) > 0:
            summary.append(
                {
                    "Database": db_name,
                    "Total Terms": len(results[db_key]),
                    "Top Term": results[db_key].iloc[0].get(
                        "name", results[db_key].iloc[0].get("term", "N/A")
                    ),
                }
            )

    if summary:
        summary_df = pd.DataFrame(summary)
        summary_file = f"{output_prefix}_summary.csv"
        summary_df.to_csv(summary_file, index=False)
        print(f"\nSummary saved to: {summary_file}")
        print("\n" + summary_df.to_string(index=False))
    else:
        print("\nNo enrichment results to summarize")

    # Get expression data for genes
    print("\n" + "=" * 60)
    print("Getting expression data for input genes...")

    try:
        # Get tissue expression for first few genes
        expr_data = []
        for gene in gene_list[:5]:  # Limit to first 5
            print(f"  Getting expression for {gene}...")
            try:
                tissue_expr = gget.archs4(gene, which="tissue")
                top_tissue = tissue_expr.nlargest(1, "median").iloc[0]
                expr_data.append(
                    {
                        "Gene": gene,
                        "Top Tissue": top_tissue["tissue"],
                        "Median Expression": top_tissue["median"],
                    }
                )
            except Exception as e:
                print(f"    Warning: {e}")

        if expr_data:
            expr_df = pd.DataFrame(expr_data)
            expr_file = f"{output_prefix}_expression.csv"
            expr_df.to_csv(expr_file, index=False)
            print(f"\nExpression data saved to: {expr_file}")

    except Exception as e:
        print(f"Error getting expression data: {e}")

    print("\n" + "=" * 60)
    print("Enrichment analysis complete!")
    print(f"\nOutput files (prefix: {output_prefix}):")
    for db_key in databases.keys():
        if db_key in results:
            print(f"  - {output_prefix}_{db_key}.csv")
    print(f"  - {output_prefix}_summary.csv")
    print(f"  - {output_prefix}_expression.csv")

    return True


def main():
    parser = argparse.ArgumentParser(
        description="Perform comprehensive enrichment analysis using gget"
    )
    parser.add_argument(
        "genes",
        help="Gene list file (one gene per line or CSV with genes in first column)",
    )
    parser.add_argument(
        "-s",
        "--species",
        default="human",
        help="Species (human, mouse, fly, yeast, worm, fish)",
    )
    parser.add_argument(
        "-b", "--background", help="Background gene list file (optional)"
    )
    parser.add_argument(
        "-o", "--output", default="enrichment", help="Output prefix (default: enrichment)"
    )
    parser.add_argument(
        "--no-plot", action="store_true", help="Disable plotting"
    )

    args = parser.parse_args()

    # Read gene list
    if not Path(args.genes).exists():
        print(f"Error: File not found: {args.genes}")
        sys.exit(1)

    try:
        gene_list = read_gene_list(args.genes)
        print(f"Read {len(gene_list)} genes from {args.genes}")

        # Read background if provided
        background = None
        if args.background:
            if Path(args.background).exists():
                background = read_gene_list(args.background)
                print(f"Read {len(background)} background genes from {args.background}")
            else:
                print(f"Warning: Background file not found: {args.background}")

        success = enrichment_pipeline(
            gene_list,
            species=args.species,
            background=background,
            output_prefix=args.output,
            plot=not args.no_plot,
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
