#!/usr/bin/env python3
"""
Ensembl REST API Query Script
Reusable functions for common Ensembl database queries with built-in rate limiting and error handling.

Usage:
    python ensembl_query.py --gene BRCA2 --species human
    python ensembl_query.py --variant rs699 --species human
    python ensembl_query.py --region "7:140424943-140624564" --species human
"""

import requests
import time
import json
import argparse
from typing import Dict, List, Optional, Any


class EnsemblAPIClient:
    """Client for querying the Ensembl REST API with rate limiting and error handling."""

    def __init__(self, server: str = "https://rest.ensembl.org", rate_limit: int = 15):
        """
        Initialize the Ensembl API client.

        Args:
            server: Base URL for the Ensembl REST API
            rate_limit: Maximum requests per second (default 15 for anonymous users)
        """
        self.server = server
        self.rate_limit = rate_limit
        self.request_count = 0
        self.last_request_time = 0

    def _rate_limit_check(self):
        """Enforce rate limiting before making requests."""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time

        if time_since_last < 1.0:
            if self.request_count >= self.rate_limit:
                sleep_time = 1.0 - time_since_last
                time.sleep(sleep_time)
                self.request_count = 0
                self.last_request_time = time.time()
        else:
            self.request_count = 0
            self.last_request_time = current_time

    def _make_request(
        self,
        endpoint: str,
        params: Optional[Dict] = None,
        max_retries: int = 3,
        method: str = "GET",
        data: Optional[Dict] = None
    ) -> Any:
        """
        Make an API request with error handling and retries.

        Args:
            endpoint: API endpoint path
            params: Query parameters
            max_retries: Maximum number of retry attempts
            method: HTTP method (GET or POST)
            data: JSON data for POST requests

        Returns:
            JSON response data

        Raises:
            Exception: If request fails after max retries
        """
        headers = {"Content-Type": "application/json"}
        url = f"{self.server}{endpoint}"

        for attempt in range(max_retries):
            self._rate_limit_check()
            self.request_count += 1

            try:
                if method == "POST":
                    response = requests.post(url, headers=headers, json=data)
                else:
                    response = requests.get(url, headers=headers, params=params)

                if response.status_code == 200:
                    return response.json()
                elif response.status_code == 429:
                    # Rate limited - wait and retry
                    retry_after = int(response.headers.get('Retry-After', 1))
                    print(f"Rate limited. Waiting {retry_after} seconds...")
                    time.sleep(retry_after)
                elif response.status_code == 404:
                    raise Exception(f"Resource not found: {endpoint}")
                else:
                    response.raise_for_status()
            except requests.exceptions.RequestException as e:
                if attempt == max_retries - 1:
                    raise Exception(f"Request failed after {max_retries} attempts: {e}")
                time.sleep(2 ** attempt)  # Exponential backoff

        raise Exception(f"Failed after {max_retries} attempts")

    def lookup_gene_by_symbol(self, species: str, symbol: str, expand: bool = True) -> Dict:
        """
        Look up gene information by symbol.

        Args:
            species: Species name (e.g., 'human', 'mouse')
            symbol: Gene symbol (e.g., 'BRCA2', 'TP53')
            expand: Include transcript information

        Returns:
            Gene information dictionary
        """
        endpoint = f"/lookup/symbol/{species}/{symbol}"
        params = {"expand": 1} if expand else {}
        return self._make_request(endpoint, params=params)

    def lookup_by_id(self, ensembl_id: str, expand: bool = False) -> Dict:
        """
        Look up object by Ensembl ID.

        Args:
            ensembl_id: Ensembl identifier (e.g., 'ENSG00000139618')
            expand: Include child objects

        Returns:
            Object information dictionary
        """
        endpoint = f"/lookup/id/{ensembl_id}"
        params = {"expand": 1} if expand else {}
        return self._make_request(endpoint, params=params)

    def get_sequence(
        self,
        ensembl_id: str,
        seq_type: str = "genomic",
        format: str = "json"
    ) -> Any:
        """
        Retrieve sequence by Ensembl ID.

        Args:
            ensembl_id: Ensembl identifier
            seq_type: Sequence type ('genomic', 'cds', 'cdna', 'protein')
            format: Output format ('json', 'fasta', 'text')

        Returns:
            Sequence data
        """
        endpoint = f"/sequence/id/{ensembl_id}"
        params = {"type": seq_type}

        if format == "fasta":
            headers = {"Content-Type": "text/x-fasta"}
            url = f"{self.server}{endpoint}"
            response = requests.get(url, headers=headers, params=params)
            return response.text

        return self._make_request(endpoint, params=params)

    def get_region_sequence(
        self,
        species: str,
        region: str,
        format: str = "json"
    ) -> Any:
        """
        Get genomic sequence for a region.

        Args:
            species: Species name
            region: Region string (e.g., '7:140424943-140624564')
            format: Output format ('json', 'fasta', 'text')

        Returns:
            Sequence data
        """
        endpoint = f"/sequence/region/{species}/{region}"

        if format == "fasta":
            headers = {"Content-Type": "text/x-fasta"}
            url = f"{self.server}{endpoint}"
            response = requests.get(url, headers=headers)
            return response.text

        return self._make_request(endpoint)

    def get_variant(self, species: str, variant_id: str, include_pops: bool = True) -> Dict:
        """
        Get variant information by ID.

        Args:
            species: Species name
            variant_id: Variant identifier (e.g., 'rs699')
            include_pops: Include population frequencies

        Returns:
            Variant information dictionary
        """
        endpoint = f"/variation/{species}/{variant_id}"
        params = {"pops": 1} if include_pops else {}
        return self._make_request(endpoint, params=params)

    def predict_variant_effect(
        self,
        species: str,
        hgvs_notation: str
    ) -> List[Dict]:
        """
        Predict variant consequences using VEP.

        Args:
            species: Species name
            hgvs_notation: HGVS notation (e.g., 'ENST00000288602:c.803C>T')

        Returns:
            List of predicted consequences
        """
        endpoint = f"/vep/{species}/hgvs/{hgvs_notation}"
        return self._make_request(endpoint)

    def find_orthologs(
        self,
        ensembl_id: str,
        target_species: Optional[str] = None
    ) -> Dict:
        """
        Find orthologs for a gene.

        Args:
            ensembl_id: Source gene Ensembl ID
            target_species: Target species (optional, returns all if not specified)

        Returns:
            Homology information dictionary
        """
        endpoint = f"/homology/id/{ensembl_id}"
        params = {}
        if target_species:
            params["target_species"] = target_species
        return self._make_request(endpoint, params=params)

    def get_region_features(
        self,
        species: str,
        region: str,
        feature_type: str = "gene"
    ) -> List[Dict]:
        """
        Get genomic features in a region.

        Args:
            species: Species name
            region: Region string (e.g., '7:140424943-140624564')
            feature_type: Feature type ('gene', 'transcript', 'variation', etc.)

        Returns:
            List of features
        """
        endpoint = f"/overlap/region/{species}/{region}"
        params = {"feature": feature_type}
        return self._make_request(endpoint, params=params)

    def get_species_info(self) -> List[Dict]:
        """
        Get information about all available species.

        Returns:
            List of species information dictionaries
        """
        endpoint = "/info/species"
        result = self._make_request(endpoint)
        return result.get("species", [])

    def get_assembly_info(self, species: str) -> Dict:
        """
        Get assembly information for a species.

        Args:
            species: Species name

        Returns:
            Assembly information dictionary
        """
        endpoint = f"/info/assembly/{species}"
        return self._make_request(endpoint)

    def map_coordinates(
        self,
        species: str,
        asm_from: str,
        region: str,
        asm_to: str
    ) -> Dict:
        """
        Map coordinates between genome assemblies.

        Args:
            species: Species name
            asm_from: Source assembly (e.g., 'GRCh37')
            region: Region string (e.g., '7:140453136-140453136')
            asm_to: Target assembly (e.g., 'GRCh38')

        Returns:
            Mapped coordinates
        """
        endpoint = f"/map/{species}/{asm_from}/{region}/{asm_to}"
        return self._make_request(endpoint)


def main():
    """Command-line interface for common Ensembl queries."""
    parser = argparse.ArgumentParser(
        description="Query the Ensembl database via REST API"
    )
    parser.add_argument("--gene", help="Gene symbol to look up")
    parser.add_argument("--ensembl-id", help="Ensembl ID to look up")
    parser.add_argument("--variant", help="Variant ID (e.g., rs699)")
    parser.add_argument("--region", help="Genomic region (chr:start-end)")
    parser.add_argument(
        "--species",
        default="human",
        help="Species name (default: human)"
    )
    parser.add_argument(
        "--orthologs",
        help="Find orthologs for gene (provide Ensembl ID)"
    )
    parser.add_argument(
        "--target-species",
        help="Target species for ortholog search"
    )
    parser.add_argument(
        "--sequence",
        action="store_true",
        help="Retrieve sequence (requires --gene or --ensembl-id or --region)"
    )
    parser.add_argument(
        "--format",
        choices=["json", "fasta"],
        default="json",
        help="Output format (default: json)"
    )
    parser.add_argument(
        "--assembly",
        default="GRCh37",
        help="For GRCh37, use grch37.rest.ensembl.org server"
    )

    args = parser.parse_args()

    # Select appropriate server
    server = "https://rest.ensembl.org"
    if args.assembly.lower() == "grch37":
        server = "https://grch37.rest.ensembl.org"

    client = EnsemblAPIClient(server=server)

    try:
        if args.gene:
            print(f"Looking up gene: {args.gene}")
            result = client.lookup_gene_by_symbol(args.species, args.gene)
            if args.sequence:
                print(f"\nRetrieving sequence for {result['id']}...")
                seq_result = client.get_sequence(
                    result['id'],
                    format=args.format
                )
                print(json.dumps(seq_result, indent=2) if args.format == "json" else seq_result)
            else:
                print(json.dumps(result, indent=2))

        elif args.ensembl_id:
            print(f"Looking up ID: {args.ensembl_id}")
            result = client.lookup_by_id(args.ensembl_id, expand=True)
            if args.sequence:
                print(f"\nRetrieving sequence...")
                seq_result = client.get_sequence(
                    args.ensembl_id,
                    format=args.format
                )
                print(json.dumps(seq_result, indent=2) if args.format == "json" else seq_result)
            else:
                print(json.dumps(result, indent=2))

        elif args.variant:
            print(f"Looking up variant: {args.variant}")
            result = client.get_variant(args.species, args.variant)
            print(json.dumps(result, indent=2))

        elif args.region:
            if args.sequence:
                print(f"Retrieving sequence for region: {args.region}")
                result = client.get_region_sequence(
                    args.species,
                    args.region,
                    format=args.format
                )
                print(json.dumps(result, indent=2) if args.format == "json" else result)
            else:
                print(f"Finding features in region: {args.region}")
                result = client.get_region_features(args.species, args.region)
                print(json.dumps(result, indent=2))

        elif args.orthologs:
            print(f"Finding orthologs for: {args.orthologs}")
            result = client.find_orthologs(
                args.orthologs,
                target_species=args.target_species
            )
            print(json.dumps(result, indent=2))

        else:
            parser.print_help()

    except Exception as e:
        print(f"Error: {e}")
        return 1

    return 0


if __name__ == "__main__":
    exit(main())
