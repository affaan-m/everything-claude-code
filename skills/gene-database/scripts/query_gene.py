#!/usr/bin/env python3
"""
Query NCBI Gene database using E-utilities.

This script provides access to ESearch, ESummary, and EFetch functions
for searching and retrieving gene information.
"""

import argparse
import json
import sys
import time
import urllib.parse
import urllib.request
from typing import Optional, Dict, List, Any
from xml.etree import ElementTree as ET


BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"
DB = "gene"


def esearch(query: str, retmax: int = 20, api_key: Optional[str] = None) -> List[str]:
    """
    Search NCBI Gene database and return list of Gene IDs.

    Args:
        query: Search query (e.g., "BRCA1[gene] AND human[organism]")
        retmax: Maximum number of results to return
        api_key: Optional NCBI API key for higher rate limits

    Returns:
        List of Gene IDs as strings
    """
    params = {
        'db': DB,
        'term': query,
        'retmax': retmax,
        'retmode': 'json'
    }

    if api_key:
        params['api_key'] = api_key

    url = f"{BASE_URL}esearch.fcgi?{urllib.parse.urlencode(params)}"

    try:
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())

        if 'esearchresult' in data and 'idlist' in data['esearchresult']:
            return data['esearchresult']['idlist']
        else:
            print(f"Error: Unexpected response format", file=sys.stderr)
            return []

    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.reason}", file=sys.stderr)
        return []
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return []


def esummary(gene_ids: List[str], api_key: Optional[str] = None) -> Dict[str, Any]:
    """
    Get document summaries for Gene IDs.

    Args:
        gene_ids: List of Gene IDs
        api_key: Optional NCBI API key

    Returns:
        Dictionary of gene summaries
    """
    params = {
        'db': DB,
        'id': ','.join(gene_ids),
        'retmode': 'json'
    }

    if api_key:
        params['api_key'] = api_key

    url = f"{BASE_URL}esummary.fcgi?{urllib.parse.urlencode(params)}"

    try:
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())
        return data
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.reason}", file=sys.stderr)
        return {}
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return {}


def efetch(gene_ids: List[str], retmode: str = 'xml', api_key: Optional[str] = None) -> str:
    """
    Fetch full gene records.

    Args:
        gene_ids: List of Gene IDs
        retmode: Return format ('xml', 'text', 'asn.1')
        api_key: Optional NCBI API key

    Returns:
        Gene records as string in requested format
    """
    params = {
        'db': DB,
        'id': ','.join(gene_ids),
        'retmode': retmode
    }

    if api_key:
        params['api_key'] = api_key

    url = f"{BASE_URL}efetch.fcgi?{urllib.parse.urlencode(params)}"

    try:
        with urllib.request.urlopen(url) as response:
            return response.read().decode()
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.reason}", file=sys.stderr)
        return ""
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return ""


def search_and_summarize(query: str, organism: Optional[str] = None,
                        max_results: int = 20, api_key: Optional[str] = None) -> None:
    """
    Search for genes and display summaries.

    Args:
        query: Gene search query
        organism: Optional organism filter
        max_results: Maximum number of results
        api_key: Optional NCBI API key
    """
    # Add organism filter if provided
    if organism:
        if '[organism]' not in query.lower():
            query = f"{query} AND {organism}[organism]"

    print(f"Searching for: {query}")
    print("-" * 80)

    # Search for gene IDs
    gene_ids = esearch(query, retmax=max_results, api_key=api_key)

    if not gene_ids:
        print("No results found.")
        return

    print(f"Found {len(gene_ids)} gene(s)")
    print()

    # Get summaries
    summaries = esummary(gene_ids, api_key=api_key)

    if 'result' in summaries:
        for gene_id in gene_ids:
            if gene_id in summaries['result']:
                gene = summaries['result'][gene_id]
                print(f"Gene ID: {gene_id}")
                print(f"  Symbol: {gene.get('name', 'N/A')}")
                print(f"  Description: {gene.get('description', 'N/A')}")
                print(f"  Organism: {gene.get('organism', {}).get('scientificname', 'N/A')}")
                print(f"  Chromosome: {gene.get('chromosome', 'N/A')}")
                print(f"  Map Location: {gene.get('maplocation', 'N/A')}")
                print(f"  Type: {gene.get('geneticsource', 'N/A')}")
                print()

    # Respect rate limits
    time.sleep(0.34)  # ~3 requests per second


def fetch_by_id(gene_ids: List[str], output_format: str = 'json',
                api_key: Optional[str] = None) -> None:
    """
    Fetch and display gene information by ID.

    Args:
        gene_ids: List of Gene IDs
        output_format: Output format ('json', 'xml', 'text')
        api_key: Optional NCBI API key
    """
    if output_format == 'json':
        # Get summaries in JSON format
        summaries = esummary(gene_ids, api_key=api_key)
        print(json.dumps(summaries, indent=2))
    else:
        # Fetch full records
        data = efetch(gene_ids, retmode=output_format, api_key=api_key)
        print(data)

    # Respect rate limits
    time.sleep(0.34)


def main():
    parser = argparse.ArgumentParser(
        description='Query NCBI Gene database using E-utilities',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Search for gene by symbol
  %(prog)s --search "BRCA1" --organism "human"

  # Fetch gene by ID
  %(prog)s --id 672 --format json

  # Complex search query
  %(prog)s --search "insulin[gene] AND diabetes[disease]"

  # Multiple gene IDs
  %(prog)s --id 672,7157,5594
        """
    )

    parser.add_argument('--search', '-s', help='Search query')
    parser.add_argument('--organism', '-o', help='Organism filter')
    parser.add_argument('--id', '-i', help='Gene ID(s), comma-separated')
    parser.add_argument('--format', '-f', default='json',
                       choices=['json', 'xml', 'text'],
                       help='Output format (default: json)')
    parser.add_argument('--max-results', '-m', type=int, default=20,
                       help='Maximum number of search results (default: 20)')
    parser.add_argument('--api-key', '-k', help='NCBI API key for higher rate limits')

    args = parser.parse_args()

    if not args.search and not args.id:
        parser.error("Either --search or --id must be provided")

    if args.id:
        # Fetch by ID
        gene_ids = [id.strip() for id in args.id.split(',')]
        fetch_by_id(gene_ids, output_format=args.format, api_key=args.api_key)
    else:
        # Search and summarize
        search_and_summarize(args.search, organism=args.organism,
                           max_results=args.max_results, api_key=args.api_key)


if __name__ == '__main__':
    main()
