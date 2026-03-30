#!/usr/bin/env python3
"""
Batch Identifier Converter

This script converts multiple identifiers between biological databases
using UniProt's mapping service. Supports batch processing with
automatic chunking and error handling.

Usage:
    python batch_id_converter.py INPUT_FILE --from DB1 --to DB2 [options]

Examples:
    python batch_id_converter.py uniprot_ids.txt --from UniProtKB_AC-ID --to KEGG
    python batch_id_converter.py gene_ids.txt --from GeneID --to UniProtKB --output mapping.csv
    python batch_id_converter.py ids.txt --from UniProtKB_AC-ID --to Ensembl --chunk-size 50

Input file format:
    One identifier per line (plain text)

Common database codes:
    UniProtKB_AC-ID  - UniProt accession/ID
    KEGG             - KEGG gene IDs
    GeneID           - NCBI Gene (Entrez) IDs
    Ensembl          - Ensembl gene IDs
    Ensembl_Protein  - Ensembl protein IDs
    RefSeq_Protein   - RefSeq protein IDs
    PDB              - Protein Data Bank IDs
    HGNC             - Human gene symbols
    GO               - Gene Ontology IDs
"""

import sys
import argparse
import csv
import time
from bioservices import UniProt


# Common database code mappings
DATABASE_CODES = {
    'uniprot': 'UniProtKB_AC-ID',
    'uniprotkb': 'UniProtKB_AC-ID',
    'kegg': 'KEGG',
    'geneid': 'GeneID',
    'entrez': 'GeneID',
    'ensembl': 'Ensembl',
    'ensembl_protein': 'Ensembl_Protein',
    'ensembl_transcript': 'Ensembl_Transcript',
    'refseq': 'RefSeq_Protein',
    'refseq_protein': 'RefSeq_Protein',
    'pdb': 'PDB',
    'hgnc': 'HGNC',
    'mgi': 'MGI',
    'go': 'GO',
    'pfam': 'Pfam',
    'interpro': 'InterPro',
    'reactome': 'Reactome',
    'string': 'STRING',
    'biogrid': 'BioGRID'
}


def normalize_database_code(code):
    """Normalize database code to official format."""
    # Try exact match first
    if code in DATABASE_CODES.values():
        return code

    # Try lowercase lookup
    lowercase = code.lower()
    if lowercase in DATABASE_CODES:
        return DATABASE_CODES[lowercase]

    # Return as-is if not found (may still be valid)
    return code


def read_ids_from_file(filename):
    """Read identifiers from file (one per line)."""
    print(f"Reading identifiers from {filename}...")

    ids = []
    with open(filename, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#'):
                ids.append(line)

    print(f"✓ Read {len(ids)} identifier(s)")

    return ids


def batch_convert(ids, from_db, to_db, chunk_size=100, delay=0.5):
    """Convert IDs with automatic chunking and error handling."""
    print(f"\nConverting {len(ids)} IDs:")
    print(f"  From: {from_db}")
    print(f"  To: {to_db}")
    print(f"  Chunk size: {chunk_size}")
    print()

    u = UniProt(verbose=False)
    all_results = {}
    failed_ids = []

    total_chunks = (len(ids) + chunk_size - 1) // chunk_size

    for i in range(0, len(ids), chunk_size):
        chunk = ids[i:i+chunk_size]
        chunk_num = (i // chunk_size) + 1

        query = ",".join(chunk)

        try:
            print(f"  [{chunk_num}/{total_chunks}] Processing {len(chunk)} IDs...", end=" ")

            results = u.mapping(fr=from_db, to=to_db, query=query)

            if results:
                all_results.update(results)
                mapped_count = len([v for v in results.values() if v])
                print(f"✓ Mapped: {mapped_count}/{len(chunk)}")
            else:
                print(f"✗ No mappings returned")
                failed_ids.extend(chunk)

            # Rate limiting
            if delay > 0 and i + chunk_size < len(ids):
                time.sleep(delay)

        except Exception as e:
            print(f"✗ Error: {e}")

            # Try individual IDs in failed chunk
            print(f"    Retrying individual IDs...")
            for single_id in chunk:
                try:
                    result = u.mapping(fr=from_db, to=to_db, query=single_id)
                    if result:
                        all_results.update(result)
                        print(f"      ✓ {single_id}")
                    else:
                        failed_ids.append(single_id)
                        print(f"      ✗ {single_id} - no mapping")
                except Exception as e2:
                    failed_ids.append(single_id)
                    print(f"      ✗ {single_id} - {e2}")

                time.sleep(0.2)

    # Add missing IDs to results (mark as failed)
    for id_ in ids:
        if id_ not in all_results:
            all_results[id_] = None

    print(f"\n✓ Conversion complete:")
    print(f"  Total: {len(ids)}")
    print(f"  Mapped: {len([v for v in all_results.values() if v])}")
    print(f"  Failed: {len(failed_ids)}")

    return all_results, failed_ids


def save_mapping_csv(mapping, output_file, from_db, to_db):
    """Save mapping results to CSV."""
    print(f"\nSaving results to {output_file}...")

    with open(output_file, 'w', newline='') as f:
        writer = csv.writer(f)

        # Header
        writer.writerow(['Source_ID', 'Source_DB', 'Target_IDs', 'Target_DB', 'Mapping_Status'])

        # Data
        for source_id, target_ids in sorted(mapping.items()):
            if target_ids:
                target_str = ";".join(target_ids)
                status = "Success"
            else:
                target_str = ""
                status = "Failed"

            writer.writerow([source_id, from_db, target_str, to_db, status])

    print(f"✓ Results saved")


def save_failed_ids(failed_ids, output_file):
    """Save failed IDs to file."""
    if not failed_ids:
        return

    print(f"\nSaving failed IDs to {output_file}...")

    with open(output_file, 'w') as f:
        for id_ in failed_ids:
            f.write(f"{id_}\n")

    print(f"✓ Saved {len(failed_ids)} failed ID(s)")


def print_mapping_summary(mapping, from_db, to_db):
    """Print summary of mapping results."""
    print(f"\n{'='*70}")
    print("MAPPING SUMMARY")
    print(f"{'='*70}")

    total = len(mapping)
    mapped = len([v for v in mapping.values() if v])
    failed = total - mapped

    print(f"\nSource database: {from_db}")
    print(f"Target database: {to_db}")
    print(f"\nTotal identifiers: {total}")
    print(f"Successfully mapped: {mapped} ({mapped/total*100:.1f}%)")
    print(f"Failed to map: {failed} ({failed/total*100:.1f}%)")

    # Show some examples
    if mapped > 0:
        print(f"\nExample mappings (first 5):")
        count = 0
        for source_id, target_ids in mapping.items():
            if target_ids:
                target_str = ", ".join(target_ids[:3])
                if len(target_ids) > 3:
                    target_str += f" ... +{len(target_ids)-3} more"
                print(f"  {source_id} → {target_str}")
                count += 1
                if count >= 5:
                    break

    # Show multiple mapping statistics
    multiple_mappings = [v for v in mapping.values() if v and len(v) > 1]
    if multiple_mappings:
        print(f"\nMultiple target mappings: {len(multiple_mappings)} ID(s)")
        print(f"  (These source IDs map to multiple target IDs)")

    print(f"{'='*70}")


def list_common_databases():
    """Print list of common database codes."""
    print("\nCommon Database Codes:")
    print("-" * 70)
    print(f"{'Alias':<20} {'Official Code':<30}")
    print("-" * 70)

    for alias, code in sorted(DATABASE_CODES.items()):
        if alias != code.lower():
            print(f"{alias:<20} {code:<30}")

    print("-" * 70)
    print("\nNote: Many other database codes are supported.")
    print("See UniProt documentation for complete list.")


def main():
    """Main conversion workflow."""
    parser = argparse.ArgumentParser(
        description="Batch convert biological identifiers between databases",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python batch_id_converter.py uniprot_ids.txt --from UniProtKB_AC-ID --to KEGG
  python batch_id_converter.py ids.txt --from GeneID --to UniProtKB -o mapping.csv
  python batch_id_converter.py ids.txt --from uniprot --to ensembl --chunk-size 50

Common database codes:
  UniProtKB_AC-ID, KEGG, GeneID, Ensembl, Ensembl_Protein,
  RefSeq_Protein, PDB, HGNC, GO, Pfam, InterPro, Reactome

Use --list-databases to see all supported aliases.
        """
    )
    parser.add_argument("input_file", help="Input file with IDs (one per line)")
    parser.add_argument("--from", dest="from_db", required=True,
                       help="Source database code")
    parser.add_argument("--to", dest="to_db", required=True,
                       help="Target database code")
    parser.add_argument("-o", "--output", default=None,
                       help="Output CSV file (default: mapping_results.csv)")
    parser.add_argument("--chunk-size", type=int, default=100,
                       help="Number of IDs per batch (default: 100)")
    parser.add_argument("--delay", type=float, default=0.5,
                       help="Delay between batches in seconds (default: 0.5)")
    parser.add_argument("--save-failed", action="store_true",
                       help="Save failed IDs to separate file")
    parser.add_argument("--list-databases", action="store_true",
                       help="List common database codes and exit")

    args = parser.parse_args()

    # List databases and exit
    if args.list_databases:
        list_common_databases()
        sys.exit(0)

    print("=" * 70)
    print("BIOSERVICES: Batch Identifier Converter")
    print("=" * 70)

    # Normalize database codes
    from_db = normalize_database_code(args.from_db)
    to_db = normalize_database_code(args.to_db)

    if from_db != args.from_db:
        print(f"\nNote: Normalized '{args.from_db}' → '{from_db}'")
    if to_db != args.to_db:
        print(f"Note: Normalized '{args.to_db}' → '{to_db}'")

    # Read input IDs
    try:
        ids = read_ids_from_file(args.input_file)
    except Exception as e:
        print(f"\n✗ Error reading input file: {e}")
        sys.exit(1)

    if not ids:
        print("\n✗ No IDs found in input file")
        sys.exit(1)

    # Perform conversion
    mapping, failed_ids = batch_convert(
        ids,
        from_db,
        to_db,
        chunk_size=args.chunk_size,
        delay=args.delay
    )

    # Print summary
    print_mapping_summary(mapping, from_db, to_db)

    # Save results
    output_file = args.output or "mapping_results.csv"
    save_mapping_csv(mapping, output_file, from_db, to_db)

    # Save failed IDs if requested
    if args.save_failed and failed_ids:
        failed_file = output_file.replace(".csv", "_failed.txt")
        save_failed_ids(failed_ids, failed_file)

    print(f"\n✓ Done!")


if __name__ == "__main__":
    main()
