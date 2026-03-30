#!/usr/bin/env python3
"""
Batch gene lookup using NCBI APIs.

This script efficiently processes multiple gene queries with proper
rate limiting and error handling.
"""

import argparse
import json
import sys
import time
import urllib.parse
import urllib.request
from typing import Optional, List, Dict, Any


def read_gene_list(filepath: str) -> List[str]:
    """
    Read gene identifiers from a file (one per line).

    Args:
        filepath: Path to file containing gene symbols or IDs

    Returns:
        List of gene identifiers
    """
    try:
        with open(filepath, 'r') as f:
            genes = [line.strip() for line in f if line.strip()]
        return genes
    except FileNotFoundError:
        print(f"Error: File '{filepath}' not found", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error reading file: {e}", file=sys.stderr)
        sys.exit(1)


def batch_esearch(queries: List[str], organism: Optional[str] = None,
                  api_key: Optional[str] = None) -> Dict[str, str]:
    """
    Search for multiple gene symbols and return their IDs.

    Args:
        queries: List of gene symbols
        organism: Optional organism filter
        api_key: Optional NCBI API key

    Returns:
        Dictionary mapping gene symbol to Gene ID (or 'NOT_FOUND')
    """
    base_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"
    results = {}

    # Rate limiting
    delay = 0.1 if api_key else 0.34  # 10 req/sec with key, 3 req/sec without

    for query in queries:
        # Build search term
        search_term = f"{query}[gene]"
        if organism:
            search_term += f" AND {organism}[organism]"

        params = {
            'db': 'gene',
            'term': search_term,
            'retmax': 1,
            'retmode': 'json'
        }

        if api_key:
            params['api_key'] = api_key

        url = f"{base_url}esearch.fcgi?{urllib.parse.urlencode(params)}"

        try:
            with urllib.request.urlopen(url) as response:
                data = json.loads(response.read().decode())

            if 'esearchresult' in data and 'idlist' in data['esearchresult']:
                id_list = data['esearchresult']['idlist']
                results[query] = id_list[0] if id_list else 'NOT_FOUND'
            else:
                results[query] = 'ERROR'

        except Exception as e:
            print(f"Error searching for {query}: {e}", file=sys.stderr)
            results[query] = 'ERROR'

        time.sleep(delay)

    return results


def batch_esummary(gene_ids: List[str], api_key: Optional[str] = None,
                   chunk_size: int = 200) -> Dict[str, Dict[str, Any]]:
    """
    Get summaries for multiple genes in batches.

    Args:
        gene_ids: List of Gene IDs
        api_key: Optional NCBI API key
        chunk_size: Number of IDs per request (max 500)

    Returns:
        Dictionary mapping Gene ID to summary data
    """
    base_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"
    all_results = {}

    # Rate limiting
    delay = 0.1 if api_key else 0.34

    # Process in chunks
    for i in range(0, len(gene_ids), chunk_size):
        chunk = gene_ids[i:i + chunk_size]

        params = {
            'db': 'gene',
            'id': ','.join(chunk),
            'retmode': 'json'
        }

        if api_key:
            params['api_key'] = api_key

        url = f"{base_url}esummary.fcgi?{urllib.parse.urlencode(params)}"

        try:
            with urllib.request.urlopen(url) as response:
                data = json.loads(response.read().decode())

            if 'result' in data:
                for gene_id in chunk:
                    if gene_id in data['result']:
                        all_results[gene_id] = data['result'][gene_id]

        except Exception as e:
            print(f"Error fetching summaries for chunk: {e}", file=sys.stderr)

        time.sleep(delay)

    return all_results


def batch_lookup_by_ids(gene_ids: List[str], api_key: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Lookup genes by IDs and return structured data.

    Args:
        gene_ids: List of Gene IDs
        api_key: Optional NCBI API key

    Returns:
        List of gene information dictionaries
    """
    summaries = batch_esummary(gene_ids, api_key=api_key)

    results = []
    for gene_id in gene_ids:
        if gene_id in summaries:
            gene = summaries[gene_id]
            results.append({
                'gene_id': gene_id,
                'symbol': gene.get('name', 'N/A'),
                'description': gene.get('description', 'N/A'),
                'organism': gene.get('organism', {}).get('scientificname', 'N/A'),
                'chromosome': gene.get('chromosome', 'N/A'),
                'map_location': gene.get('maplocation', 'N/A'),
                'type': gene.get('geneticsource', 'N/A')
            })
        else:
            results.append({
                'gene_id': gene_id,
                'error': 'Not found or error fetching'
            })

    return results


def batch_lookup_by_symbols(gene_symbols: List[str], organism: str,
                            api_key: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Lookup genes by symbols and return structured data.

    Args:
        gene_symbols: List of gene symbols
        organism: Organism name
        api_key: Optional NCBI API key

    Returns:
        List of gene information dictionaries
    """
    # First, search for IDs
    print(f"Searching for {len(gene_symbols)} gene symbols...", file=sys.stderr)
    symbol_to_id = batch_esearch(gene_symbols, organism=organism, api_key=api_key)

    # Filter to valid IDs
    valid_ids = [id for id in symbol_to_id.values() if id not in ['NOT_FOUND', 'ERROR']]

    if not valid_ids:
        print("No genes found", file=sys.stderr)
        return []

    print(f"Found {len(valid_ids)} genes, fetching details...", file=sys.stderr)

    # Fetch summaries
    summaries = batch_esummary(valid_ids, api_key=api_key)

    # Build results
    results = []
    for symbol, gene_id in symbol_to_id.items():
        if gene_id == 'NOT_FOUND':
            results.append({
                'query_symbol': symbol,
                'status': 'not_found'
            })
        elif gene_id == 'ERROR':
            results.append({
                'query_symbol': symbol,
                'status': 'error'
            })
        elif gene_id in summaries:
            gene = summaries[gene_id]
            results.append({
                'query_symbol': symbol,
                'gene_id': gene_id,
                'symbol': gene.get('name', 'N/A'),
                'description': gene.get('description', 'N/A'),
                'organism': gene.get('organism', {}).get('scientificname', 'N/A'),
                'chromosome': gene.get('chromosome', 'N/A'),
                'map_location': gene.get('maplocation', 'N/A'),
                'type': gene.get('geneticsource', 'N/A')
            })

    return results


def main():
    parser = argparse.ArgumentParser(
        description='Batch gene lookup using NCBI APIs',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Lookup by gene IDs
  %(prog)s --ids 672,7157,5594

  # Lookup by symbols from a file
  %(prog)s --file genes.txt --organism human

  # Lookup with API key and save to file
  %(prog)s --ids 672,7157,5594 --api-key YOUR_KEY --output results.json
        """
    )

    parser.add_argument('--ids', '-i', help='Comma-separated Gene IDs')
    parser.add_argument('--file', '-f', help='File containing gene symbols (one per line)')
    parser.add_argument('--organism', '-o', help='Organism name (required with --file)')
    parser.add_argument('--output', '-O', help='Output file path (JSON format)')
    parser.add_argument('--api-key', '-k', help='NCBI API key')
    parser.add_argument('--pretty', '-p', action='store_true',
                       help='Pretty-print JSON output')

    args = parser.parse_args()

    if not args.ids and not args.file:
        parser.error("Either --ids or --file must be provided")

    if args.file and not args.organism:
        parser.error("--organism is required when using --file")

    # Process genes
    if args.ids:
        gene_ids = [id.strip() for id in args.ids.split(',')]
        results = batch_lookup_by_ids(gene_ids, api_key=args.api_key)
    else:
        gene_symbols = read_gene_list(args.file)
        results = batch_lookup_by_symbols(gene_symbols, args.organism, api_key=args.api_key)

    # Output results
    indent = 2 if args.pretty else None
    json_output = json.dumps(results, indent=indent)

    if args.output:
        try:
            with open(args.output, 'w') as f:
                f.write(json_output)
            print(f"Results written to {args.output}", file=sys.stderr)
        except Exception as e:
            print(f"Error writing output file: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        print(json_output)


if __name__ == '__main__':
    main()
