#!/usr/bin/env python3
"""
KEGG Pathway Network Analysis

This script analyzes all pathways for an organism and extracts:
- Pathway sizes (number of genes)
- Protein-protein interactions
- Interaction type distributions
- Network data in various formats (CSV, SIF)

Usage:
    python pathway_analysis.py ORGANISM OUTPUT_DIR [--limit N]

Examples:
    python pathway_analysis.py hsa ./human_pathways
    python pathway_analysis.py mmu ./mouse_pathways --limit 50

Organism codes:
    hsa = Homo sapiens (human)
    mmu = Mus musculus (mouse)
    dme = Drosophila melanogaster
    sce = Saccharomyces cerevisiae (yeast)
    eco = Escherichia coli
"""

import sys
import os
import argparse
import csv
from collections import Counter
from bioservices import KEGG


def get_all_pathways(kegg, organism):
    """Get all pathway IDs for organism."""
    print(f"\nRetrieving pathways for {organism}...")

    kegg.organism = organism
    pathway_ids = kegg.pathwayIds

    print(f"✓ Found {len(pathway_ids)} pathways")

    return pathway_ids


def analyze_pathway(kegg, pathway_id):
    """Analyze single pathway for size and interactions."""
    try:
        # Parse KGML pathway
        kgml = kegg.parse_kgml_pathway(pathway_id)

        entries = kgml.get('entries', [])
        relations = kgml.get('relations', [])

        # Count relation types
        relation_types = Counter()
        for rel in relations:
            rel_type = rel.get('name', 'unknown')
            relation_types[rel_type] += 1

        # Get pathway name
        try:
            entry = kegg.get(pathway_id)
            pathway_name = "Unknown"
            for line in entry.split("\n"):
                if line.startswith("NAME"):
                    pathway_name = line.replace("NAME", "").strip()
                    break
        except:
            pathway_name = "Unknown"

        result = {
            'pathway_id': pathway_id,
            'pathway_name': pathway_name,
            'num_entries': len(entries),
            'num_relations': len(relations),
            'relation_types': dict(relation_types),
            'entries': entries,
            'relations': relations
        }

        return result

    except Exception as e:
        print(f"  ✗ Error analyzing {pathway_id}: {e}")
        return None


def analyze_all_pathways(kegg, pathway_ids, limit=None):
    """Analyze all pathways."""
    if limit:
        pathway_ids = pathway_ids[:limit]
        print(f"\n⚠ Limiting analysis to first {limit} pathways")

    print(f"\nAnalyzing {len(pathway_ids)} pathways...")

    results = []
    for i, pathway_id in enumerate(pathway_ids, 1):
        print(f"  [{i}/{len(pathway_ids)}] {pathway_id}", end="\r")

        result = analyze_pathway(kegg, pathway_id)
        if result:
            results.append(result)

    print(f"\n✓ Successfully analyzed {len(results)}/{len(pathway_ids)} pathways")

    return results


def save_pathway_summary(results, output_file):
    """Save pathway summary to CSV."""
    print(f"\nSaving pathway summary to {output_file}...")

    with open(output_file, 'w', newline='') as f:
        writer = csv.writer(f)

        # Header
        writer.writerow([
            'Pathway_ID',
            'Pathway_Name',
            'Num_Genes',
            'Num_Interactions',
            'Activation',
            'Inhibition',
            'Phosphorylation',
            'Binding',
            'Other'
        ])

        # Data
        for result in results:
            rel_types = result['relation_types']

            writer.writerow([
                result['pathway_id'],
                result['pathway_name'],
                result['num_entries'],
                result['num_relations'],
                rel_types.get('activation', 0),
                rel_types.get('inhibition', 0),
                rel_types.get('phosphorylation', 0),
                rel_types.get('binding/association', 0),
                sum(v for k, v in rel_types.items()
                    if k not in ['activation', 'inhibition', 'phosphorylation', 'binding/association'])
            ])

    print(f"✓ Summary saved")


def save_interactions_sif(results, output_file):
    """Save all interactions in SIF format."""
    print(f"\nSaving interactions to {output_file}...")

    with open(output_file, 'w') as f:
        for result in results:
            pathway_id = result['pathway_id']

            for rel in result['relations']:
                entry1 = rel.get('entry1', '')
                entry2 = rel.get('entry2', '')
                interaction_type = rel.get('name', 'interaction')

                # Write SIF format: source\tinteraction\ttarget
                f.write(f"{entry1}\t{interaction_type}\t{entry2}\n")

    print(f"✓ Interactions saved")


def save_detailed_pathway_info(results, output_dir):
    """Save detailed information for each pathway."""
    print(f"\nSaving detailed pathway files to {output_dir}/pathways/...")

    pathway_dir = os.path.join(output_dir, "pathways")
    os.makedirs(pathway_dir, exist_ok=True)

    for result in results:
        pathway_id = result['pathway_id'].replace(":", "_")
        filename = os.path.join(pathway_dir, f"{pathway_id}_interactions.csv")

        with open(filename, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['Source', 'Target', 'Interaction_Type', 'Link_Type'])

            for rel in result['relations']:
                writer.writerow([
                    rel.get('entry1', ''),
                    rel.get('entry2', ''),
                    rel.get('name', 'unknown'),
                    rel.get('link', 'unknown')
                ])

    print(f"✓ Detailed files saved for {len(results)} pathways")


def print_statistics(results):
    """Print analysis statistics."""
    print(f"\n{'='*70}")
    print("PATHWAY ANALYSIS STATISTICS")
    print(f"{'='*70}")

    # Total stats
    total_pathways = len(results)
    total_interactions = sum(r['num_relations'] for r in results)
    total_genes = sum(r['num_entries'] for r in results)

    print(f"\nOverall:")
    print(f"  Total pathways: {total_pathways}")
    print(f"  Total genes/proteins: {total_genes}")
    print(f"  Total interactions: {total_interactions}")

    # Largest pathways
    print(f"\nLargest pathways (by gene count):")
    sorted_by_size = sorted(results, key=lambda x: x['num_entries'], reverse=True)
    for i, result in enumerate(sorted_by_size[:10], 1):
        print(f"  {i}. {result['pathway_id']}: {result['num_entries']} genes")
        print(f"     {result['pathway_name']}")

    # Most connected pathways
    print(f"\nMost connected pathways (by interactions):")
    sorted_by_connections = sorted(results, key=lambda x: x['num_relations'], reverse=True)
    for i, result in enumerate(sorted_by_connections[:10], 1):
        print(f"  {i}. {result['pathway_id']}: {result['num_relations']} interactions")
        print(f"     {result['pathway_name']}")

    # Interaction type distribution
    print(f"\nInteraction type distribution:")
    all_types = Counter()
    for result in results:
        for rel_type, count in result['relation_types'].items():
            all_types[rel_type] += count

    for rel_type, count in all_types.most_common():
        percentage = (count / total_interactions) * 100 if total_interactions > 0 else 0
        print(f"  {rel_type}: {count} ({percentage:.1f}%)")


def main():
    """Main analysis workflow."""
    parser = argparse.ArgumentParser(
        description="Analyze KEGG pathways for an organism",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python pathway_analysis.py hsa ./human_pathways
  python pathway_analysis.py mmu ./mouse_pathways --limit 50

Organism codes:
  hsa = Homo sapiens (human)
  mmu = Mus musculus (mouse)
  dme = Drosophila melanogaster
  sce = Saccharomyces cerevisiae (yeast)
  eco = Escherichia coli
        """
    )
    parser.add_argument("organism", help="KEGG organism code (e.g., hsa, mmu)")
    parser.add_argument("output_dir", help="Output directory for results")
    parser.add_argument("--limit", type=int, default=None,
                       help="Limit analysis to first N pathways")

    args = parser.parse_args()

    print("=" * 70)
    print("BIOSERVICES: KEGG Pathway Network Analysis")
    print("=" * 70)

    # Create output directory
    os.makedirs(args.output_dir, exist_ok=True)

    # Initialize KEGG
    kegg = KEGG()

    # Get all pathways
    pathway_ids = get_all_pathways(kegg, args.organism)

    if not pathway_ids:
        print(f"\n✗ No pathways found for {args.organism}")
        sys.exit(1)

    # Analyze pathways
    results = analyze_all_pathways(kegg, pathway_ids, args.limit)

    if not results:
        print("\n✗ No pathways successfully analyzed")
        sys.exit(1)

    # Print statistics
    print_statistics(results)

    # Save results
    summary_file = os.path.join(args.output_dir, "pathway_summary.csv")
    save_pathway_summary(results, summary_file)

    sif_file = os.path.join(args.output_dir, "all_interactions.sif")
    save_interactions_sif(results, sif_file)

    save_detailed_pathway_info(results, args.output_dir)

    # Final summary
    print(f"\n{'='*70}")
    print("OUTPUT FILES")
    print(f"{'='*70}")
    print(f"  Summary: {summary_file}")
    print(f"  Interactions: {sif_file}")
    print(f"  Detailed: {args.output_dir}/pathways/")
    print(f"{'='*70}")


if __name__ == "__main__":
    main()
