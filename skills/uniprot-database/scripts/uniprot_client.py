#!/usr/bin/env python3
"""
UniProt REST API Client

A Python client for interacting with the UniProt REST API.
Provides helper functions for common operations including search,
retrieval, ID mapping, and streaming.

Usage examples:
    # Search for proteins
    results = search_proteins("insulin AND organism_name:human", format="json")

    # Get a single protein
    protein = get_protein("P12345", format="fasta")

    # Map IDs
    mapped = map_ids(["P12345", "P04637"], from_db="UniProtKB_AC-ID", to_db="PDB")

    # Stream large results
    for batch in stream_results("taxonomy_id:9606 AND reviewed:true", format="fasta"):
        process(batch)
"""

import requests
import sys
import time
import json
from typing import List, Dict, Optional, Generator
from urllib.parse import urlencode

BASE_URL = "https://rest.uniprot.org"
POLLING_INTERVAL = 3  # seconds


def search_proteins(query: str, format: str = "json",
                   fields: Optional[List[str]] = None,
                   size: int = 25) -> Dict:
    """
    Search UniProt database with a query.

    Args:
        query: Search query (e.g., "insulin AND organism_name:human")
        format: Response format (json, tsv, xlsx, xml, fasta, txt, rdf)
        fields: List of fields to return (e.g., ["accession", "gene_names", "organism_name"])
        size: Number of results per page (default 25, max 500)

    Returns:
        Response data in requested format
    """
    endpoint = f"{BASE_URL}/uniprotkb/search"

    params = {
        "query": query,
        "format": format,
        "size": size
    }

    if fields:
        params["fields"] = ",".join(fields)

    response = requests.get(endpoint, params=params)
    response.raise_for_status()

    if format == "json":
        return response.json()
    else:
        return response.text


def get_protein(accession: str, format: str = "json") -> str:
    """
    Retrieve a single protein entry by accession number.

    Args:
        accession: UniProt accession number (e.g., "P12345")
        format: Response format (json, txt, xml, fasta, gff, rdf)

    Returns:
        Protein data in requested format
    """
    endpoint = f"{BASE_URL}/uniprotkb/{accession}.{format}"

    response = requests.get(endpoint)
    response.raise_for_status()

    if format == "json":
        return response.json()
    else:
        return response.text


def batch_retrieve(accessions: List[str], format: str = "json",
                  fields: Optional[List[str]] = None) -> str:
    """
    Retrieve multiple protein entries efficiently.

    Args:
        accessions: List of UniProt accession numbers
        format: Response format
        fields: List of fields to return

    Returns:
        Combined results in requested format
    """
    query = " OR ".join([f"accession:{acc}" for acc in accessions])
    return search_proteins(query, format=format, fields=fields, size=len(accessions))


def stream_results(query: str, format: str = "fasta",
                  fields: Optional[List[str]] = None,
                  chunk_size: int = 8192) -> Generator[str, None, None]:
    """
    Stream large result sets without pagination.

    Args:
        query: Search query
        format: Response format
        fields: List of fields to return
        chunk_size: Size of chunks to yield

    Yields:
        Chunks of response data
    """
    endpoint = f"{BASE_URL}/uniprotkb/stream"

    params = {
        "query": query,
        "format": format
    }

    if fields:
        params["fields"] = ",".join(fields)

    response = requests.get(endpoint, params=params, stream=True)
    response.raise_for_status()

    for chunk in response.iter_content(chunk_size=chunk_size, decode_unicode=True):
        if chunk:
            yield chunk


def map_ids(ids: List[str], from_db: str, to_db: str,
           format: str = "json") -> Dict:
    """
    Map protein identifiers between different database systems.

    Args:
        ids: List of identifiers to map (max 100,000)
        from_db: Source database (e.g., "UniProtKB_AC-ID", "Gene_Name")
        to_db: Target database (e.g., "PDB", "Ensembl", "RefSeq_Protein")
        format: Response format

    Returns:
        Mapping results

    Note:
        - Maximum 100,000 IDs per job
        - Results stored for 7 days
        - See id_mapping_databases.md for all supported databases
    """
    if len(ids) > 100000:
        raise ValueError("Maximum 100,000 IDs allowed per mapping job")

    # Step 1: Submit job
    submit_endpoint = f"{BASE_URL}/idmapping/run"

    data = {
        "from": from_db,
        "to": to_db,
        "ids": ",".join(ids)
    }

    response = requests.post(submit_endpoint, data=data)
    response.raise_for_status()
    job_id = response.json()["jobId"]

    # Step 2: Poll for completion
    status_endpoint = f"{BASE_URL}/idmapping/status/{job_id}"

    while True:
        response = requests.get(status_endpoint)
        response.raise_for_status()
        status = response.json()

        if "results" in status or "failedIds" in status:
            break

        time.sleep(POLLING_INTERVAL)

    # Step 3: Retrieve results
    results_endpoint = f"{BASE_URL}/idmapping/results/{job_id}"

    params = {"format": format}
    response = requests.get(results_endpoint, params=params)
    response.raise_for_status()

    if format == "json":
        return response.json()
    else:
        return response.text


def get_available_fields() -> List[Dict]:
    """
    Get list of all available fields for queries.

    Returns:
        List of field definitions with names and descriptions
    """
    endpoint = f"{BASE_URL}/configure/uniprotkb/result-fields"

    response = requests.get(endpoint)
    response.raise_for_status()

    return response.json()


def get_id_mapping_databases() -> Dict:
    """
    Get list of all supported databases for ID mapping.

    Returns:
        Dictionary of database groups and their supported databases
    """
    endpoint = f"{BASE_URL}/configure/idmapping/fields"

    response = requests.get(endpoint)
    response.raise_for_status()

    return response.json()


def main():
    """Command-line interface for UniProt database queries."""
    import argparse

    parser = argparse.ArgumentParser(
        description='Query UniProt database using REST API',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Search for proteins
  %(prog)s --search "insulin AND organism_name:human" --format json

  # Get a specific protein
  %(prog)s --get P01308 --format fasta

  # Map IDs from UniProt to PDB
  %(prog)s --map P01308,P04637 --from UniProtKB_AC-ID --to PDB

  # Stream large results
  %(prog)s --stream "taxonomy_id:9606 AND reviewed:true" --format fasta

  # List available fields
  %(prog)s --list-fields

  # List mapping databases
  %(prog)s --list-databases
        """
    )

    # Main operation arguments (mutually exclusive)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--search', '-s', help='Search query string')
    group.add_argument('--get', '-g', help='Get protein by accession number')
    group.add_argument('--map', '-m', help='Map IDs (comma-separated)')
    group.add_argument('--stream', help='Stream large result sets')
    group.add_argument('--list-fields', action='store_true',
                      help='List all available query fields')
    group.add_argument('--list-databases', action='store_true',
                      help='List all ID mapping databases')

    # Format options
    parser.add_argument('--format', '-f', default='json',
                       help='Output format (json, tsv, xlsx, xml, fasta, txt, rdf)')

    # Search-specific options
    parser.add_argument('--fields', help='Comma-separated list of fields to return')
    parser.add_argument('--size', type=int, default=25,
                       help='Number of results (default: 25, max: 500)')

    # Mapping-specific options
    parser.add_argument('--from', dest='from_db',
                       help='Source database for ID mapping')
    parser.add_argument('--to', dest='to_db',
                       help='Target database for ID mapping')

    args = parser.parse_args()

    try:
        if args.list_fields:
            fields = get_available_fields()
            print(json.dumps(fields, indent=2))

        elif args.list_databases:
            databases = get_id_mapping_databases()
            print(json.dumps(databases, indent=2))

        elif args.search:
            fields_list = args.fields.split(',') if args.fields else None
            results = search_proteins(
                args.search,
                format=args.format,
                fields=fields_list,
                size=args.size
            )
            if args.format == 'json':
                print(json.dumps(results, indent=2))
            else:
                print(results)

        elif args.get:
            protein = get_protein(args.get, format=args.format)
            if args.format == 'json':
                print(json.dumps(protein, indent=2))
            else:
                print(protein)

        elif args.map:
            if not args.from_db or not args.to_db:
                parser.error("--map requires --from and --to arguments")

            ids = [id.strip() for id in args.map.split(',')]
            mapping = map_ids(ids, args.from_db, args.to_db, format=args.format)
            if args.format == 'json':
                print(json.dumps(mapping, indent=2))
            else:
                print(mapping)

        elif args.stream:
            fields_list = args.fields.split(',') if args.fields else None
            for chunk in stream_results(args.stream, format=args.format, fields=fields_list):
                print(chunk, end='')

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
