#!/usr/bin/env python3
"""
Reactome Database Query Helper Script

This script provides convenient command-line access to common Reactome operations.

Usage:
    python reactome_query.py version
    python reactome_query.py query <pathway_id>
    python reactome_query.py analyze <gene_list_file>
    python reactome_query.py search <term>
    python reactome_query.py entities <pathway_id>

Examples:
    python reactome_query.py version
    python reactome_query.py query R-HSA-69278
    python reactome_query.py analyze genes.txt
    python reactome_query.py search "cell cycle"
    python reactome_query.py entities R-HSA-69278
"""

import sys
import json
import requests
from typing import List, Dict, Optional


class ReactomeClient:
    """Client for interacting with Reactome REST APIs"""

    CONTENT_BASE = "https://reactome.org/ContentService"
    ANALYSIS_BASE = "https://reactome.org/AnalysisService"

    def get_version(self) -> str:
        """Get Reactome database version"""
        response = requests.get(f"{self.CONTENT_BASE}/data/database/version")
        response.raise_for_status()
        return response.text.strip()

    def query_pathway(self, pathway_id: str) -> Dict:
        """Query pathway information by ID"""
        response = requests.get(f"{self.CONTENT_BASE}/data/query/{pathway_id}")
        response.raise_for_status()
        return response.json()

    def get_pathway_entities(self, pathway_id: str) -> List[Dict]:
        """Get participating entities in a pathway"""
        response = requests.get(
            f"{self.CONTENT_BASE}/data/event/{pathway_id}/participatingPhysicalEntities"
        )
        response.raise_for_status()
        return response.json()

    def search_pathways(self, term: str) -> List[Dict]:
        """Search for pathways by name"""
        response = requests.get(
            f"{self.CONTENT_BASE}/data/query",
            params={"name": term}
        )
        response.raise_for_status()
        return response.json()

    def analyze_genes(self, gene_list: List[str]) -> Dict:
        """Perform pathway enrichment analysis on gene list"""
        data = "\n".join(gene_list)
        response = requests.post(
            f"{self.ANALYSIS_BASE}/identifiers/",
            headers={"Content-Type": "text/plain"},
            data=data
        )
        response.raise_for_status()
        return response.json()

    def get_analysis_by_token(self, token: str) -> Dict:
        """Retrieve analysis results by token"""
        response = requests.get(f"{self.ANALYSIS_BASE}/token/{token}")
        response.raise_for_status()
        return response.json()


def print_json(data):
    """Pretty print JSON data"""
    print(json.dumps(data, indent=2))


def command_version():
    """Get and display Reactome version"""
    client = ReactomeClient()
    version = client.get_version()
    print(f"Reactome Database Version: {version}")


def command_query(pathway_id: str):
    """Query and display pathway information"""
    client = ReactomeClient()
    try:
        pathway = client.query_pathway(pathway_id)
        print(f"Pathway: {pathway['displayName']}")
        print(f"ID: {pathway['stId']}")
        print(f"Type: {pathway['schemaClass']}")

        if 'species' in pathway and pathway['species']:
            species = pathway['species'][0]['displayName']
            print(f"Species: {species}")

        if 'summation' in pathway and pathway['summation']:
            summation = pathway['summation'][0]['text']
            print(f"\nDescription: {summation}")

        print("\nFull JSON response:")
        print_json(pathway)

    except requests.HTTPError as e:
        if e.response.status_code == 404:
            print(f"Error: Pathway '{pathway_id}' not found")
        else:
            print(f"Error: {e}")
        sys.exit(1)


def command_entities(pathway_id: str):
    """Display entities participating in a pathway"""
    client = ReactomeClient()
    try:
        entities = client.get_pathway_entities(pathway_id)
        print(f"Entities in pathway {pathway_id}: {len(entities)} total\n")

        # Group by type
        by_type = {}
        for entity in entities:
            entity_type = entity['schemaClass']
            if entity_type not in by_type:
                by_type[entity_type] = []
            by_type[entity_type].append(entity)

        # Display by type
        for entity_type, entities_list in sorted(by_type.items()):
            print(f"{entity_type} ({len(entities_list)}):")
            for entity in entities_list[:10]:  # Show first 10
                print(f"  - {entity['stId']}: {entity['displayName']}")
            if len(entities_list) > 10:
                print(f"  ... and {len(entities_list) - 10} more")
            print()

    except requests.HTTPError as e:
        if e.response.status_code == 404:
            print(f"Error: Pathway '{pathway_id}' not found")
        else:
            print(f"Error: {e}")
        sys.exit(1)


def command_search(term: str):
    """Search for pathways by term"""
    client = ReactomeClient()
    try:
        results = client.search_pathways(term)
        print(f"Search results for '{term}': {len(results)} found\n")

        for result in results[:20]:  # Show first 20
            print(f"{result['stId']}: {result['displayName']}")
            if 'species' in result and result['species']:
                species = result['species'][0]['displayName']
                print(f"  Species: {species}")
            print(f"  Type: {result['schemaClass']}")
            print()

        if len(results) > 20:
            print(f"... and {len(results) - 20} more results")

    except requests.HTTPError as e:
        print(f"Error: {e}")
        sys.exit(1)


def command_analyze(gene_file: str):
    """Perform pathway enrichment analysis"""
    client = ReactomeClient()

    # Read gene list
    try:
        with open(gene_file, 'r') as f:
            genes = [line.strip() for line in f if line.strip()]
    except FileNotFoundError:
        print(f"Error: File '{gene_file}' not found")
        sys.exit(1)

    print(f"Analyzing {len(genes)} genes...")

    try:
        result = client.analyze_genes(genes)

        # Display summary
        summary = result['summary']
        print(f"\nAnalysis Type: {summary['type']}")
        print(f"Token: {summary['token']} (valid for 7 days)")
        print(f"Species: {summary.get('species', 'N/A')}")

        # Display pathways
        pathways = result.get('pathways', [])
        print(f"\nEnriched Pathways: {len(pathways)} found")

        # Show significant pathways (FDR < 0.05)
        significant = [p for p in pathways if p['entities']['fdr'] < 0.05]
        print(f"Significant (FDR < 0.05): {len(significant)}\n")

        # Display top 10 pathways
        print("Top 10 Pathways:")
        for i, pathway in enumerate(pathways[:10], 1):
            print(f"\n{i}. {pathway['name']}")
            print(f"   ID: {pathway['stId']}")
            entities = pathway['entities']
            print(f"   Found: {entities['found']}/{entities['total']} entities")
            print(f"   p-value: {entities['pValue']:.6e}")
            print(f"   FDR: {entities['fdr']:.6e}")

        # Generate browser URL for top pathway
        if pathways:
            token = summary['token']
            top_pathway = pathways[0]['stId']
            url = f"https://reactome.org/PathwayBrowser/#{top_pathway}&DTAB=AN&ANALYSIS={token}"
            print(f"\nView top result in browser:")
            print(url)

        # Save full results
        output_file = gene_file.replace('.txt', '_results.json')
        with open(output_file, 'w') as f:
            json.dump(result, f, indent=2)
        print(f"\nFull results saved to: {output_file}")

    except requests.HTTPError as e:
        print(f"Error: {e}")
        sys.exit(1)


def print_usage():
    """Print usage information"""
    print(__doc__)


def main():
    if len(sys.argv) < 2:
        print_usage()
        sys.exit(1)

    command = sys.argv[1].lower()

    if command == "version":
        command_version()

    elif command == "query":
        if len(sys.argv) < 3:
            print("Error: pathway_id required")
            print("Usage: python reactome_query.py query <pathway_id>")
            sys.exit(1)
        command_query(sys.argv[2])

    elif command == "entities":
        if len(sys.argv) < 3:
            print("Error: pathway_id required")
            print("Usage: python reactome_query.py entities <pathway_id>")
            sys.exit(1)
        command_entities(sys.argv[2])

    elif command == "search":
        if len(sys.argv) < 3:
            print("Error: search term required")
            print("Usage: python reactome_query.py search <term>")
            sys.exit(1)
        command_search(" ".join(sys.argv[2:]))

    elif command == "analyze":
        if len(sys.argv) < 3:
            print("Error: gene list file required")
            print("Usage: python reactome_query.py analyze <gene_list_file>")
            sys.exit(1)
        command_analyze(sys.argv[2])

    else:
        print(f"Error: Unknown command '{command}'")
        print_usage()
        sys.exit(1)


if __name__ == "__main__":
    main()
