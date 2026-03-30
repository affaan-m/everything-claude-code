"""
STRING Database REST API Helper Functions

This module provides Python functions for interacting with the STRING database API.
All functions return raw response text or JSON which can be parsed as needed.

API Base URL: https://string-db.org/api
Documentation: https://string-db.org/help/api/

STRING provides protein-protein interaction data from over 40 sources covering
5000+ genomes with ~59.3 million proteins and 20+ billion interactions.
"""

import urllib.request
import urllib.parse
import urllib.error
import json
from typing import Optional, List, Union, Dict


STRING_BASE_URL = "https://string-db.org/api"


def string_map_ids(identifiers: Union[str, List[str]],
                   species: int = 9606,
                   limit: int = 1,
                   echo_query: int = 1,
                   caller_identity: str = "claude_scientific_skills") -> str:
    """
    Map protein names, synonyms, and identifiers to STRING IDs.

    Args:
        identifiers: Single protein identifier or list of identifiers
        species: NCBI taxon ID (default: 9606 for human)
        limit: Number of matches to return per identifier (default: 1)
        echo_query: Include query term in output (1) or not (0)
        caller_identity: Application identifier for tracking

    Returns:
        str: TSV format with mapping results

    Examples:
        # Map single protein
        result = string_map_ids('TP53', species=9606)

        # Map multiple proteins
        result = string_map_ids(['TP53', 'BRCA1', 'EGFR'], species=9606)
    """
    if isinstance(identifiers, list):
        identifiers_str = '\n'.join(identifiers)
    else:
        identifiers_str = identifiers

    params = {
        'identifiers': identifiers_str,
        'species': species,
        'limit': limit,
        'echo_query': echo_query,
        'caller_identity': caller_identity
    }

    url = f"{STRING_BASE_URL}/tsv/get_string_ids"
    data = urllib.parse.urlencode(params).encode('utf-8')

    try:
        with urllib.request.urlopen(url, data=data) as response:
            return response.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        return f"Error: {e.code} - {e.reason}"


def string_network(identifiers: Union[str, List[str]],
                   species: int = 9606,
                   required_score: int = 400,
                   network_type: str = "functional",
                   add_nodes: int = 0,
                   caller_identity: str = "claude_scientific_skills") -> str:
    """
    Get protein-protein interaction network data.

    Args:
        identifiers: Protein identifier(s) - use STRING IDs for best results
        species: NCBI taxon ID (default: 9606 for human)
        required_score: Confidence threshold 0-1000 (default: 400 = medium confidence)
        network_type: 'functional' or 'physical' (default: functional)
        add_nodes: Number of additional nodes to add to network (0-10)
        caller_identity: Application identifier for tracking

    Returns:
        str: TSV format with interaction data

    Examples:
        # Get network for single protein
        network = string_network('9606.ENSP00000269305')

        # Get network with multiple proteins
        network = string_network(['9606.ENSP00000269305', '9606.ENSP00000275493'])

        # Get network with additional interacting proteins
        network = string_network('TP53', add_nodes=5, required_score=700)
    """
    if isinstance(identifiers, list):
        identifiers_str = '%0d'.join(identifiers)
    else:
        identifiers_str = identifiers

    params = {
        'identifiers': identifiers_str,
        'species': species,
        'required_score': required_score,
        'network_type': network_type,
        'add_nodes': add_nodes,
        'caller_identity': caller_identity
    }

    url = f"{STRING_BASE_URL}/tsv/network?" + urllib.parse.urlencode(params)

    try:
        with urllib.request.urlopen(url) as response:
            return response.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        return f"Error: {e.code} - {e.reason}"


def string_network_image(identifiers: Union[str, List[str]],
                        species: int = 9606,
                        required_score: int = 400,
                        network_flavor: str = "evidence",
                        add_nodes: int = 0,
                        caller_identity: str = "claude_scientific_skills") -> bytes:
    """
    Get network visualization as PNG image.

    Args:
        identifiers: Protein identifier(s)
        species: NCBI taxon ID (default: 9606 for human)
        required_score: Confidence threshold 0-1000 (default: 400)
        network_flavor: 'evidence', 'confidence', or 'actions' (default: evidence)
        add_nodes: Number of additional nodes to add (0-10)
        caller_identity: Application identifier for tracking

    Returns:
        bytes: PNG image data

    Example:
        # Get network image
        img_data = string_network_image(['TP53', 'MDM2', 'ATM'])
        with open('network.png', 'wb') as f:
            f.write(img_data)
    """
    if isinstance(identifiers, list):
        identifiers_str = '%0d'.join(identifiers)
    else:
        identifiers_str = identifiers

    params = {
        'identifiers': identifiers_str,
        'species': species,
        'required_score': required_score,
        'network_flavor': network_flavor,
        'add_nodes': add_nodes,
        'caller_identity': caller_identity
    }

    url = f"{STRING_BASE_URL}/image/network?" + urllib.parse.urlencode(params)

    try:
        with urllib.request.urlopen(url) as response:
            return response.read()
    except urllib.error.HTTPError as e:
        return f"Error: {e.code} - {e.reason}".encode()


def string_interaction_partners(identifiers: Union[str, List[str]],
                                species: int = 9606,
                                required_score: int = 400,
                                limit: int = 10,
                                caller_identity: str = "claude_scientific_skills") -> str:
    """
    Get all interaction partners for protein(s).

    Args:
        identifiers: Protein identifier(s)
        species: NCBI taxon ID (default: 9606 for human)
        required_score: Confidence threshold 0-1000 (default: 400)
        limit: Maximum number of partners to return (default: 10)
        caller_identity: Application identifier for tracking

    Returns:
        str: TSV format with interaction partners

    Example:
        # Get top 20 interactors of TP53
        partners = string_interaction_partners('TP53', limit=20, required_score=700)
    """
    if isinstance(identifiers, list):
        identifiers_str = '%0d'.join(identifiers)
    else:
        identifiers_str = identifiers

    params = {
        'identifiers': identifiers_str,
        'species': species,
        'required_score': required_score,
        'limit': limit,
        'caller_identity': caller_identity
    }

    url = f"{STRING_BASE_URL}/tsv/interaction_partners?" + urllib.parse.urlencode(params)

    try:
        with urllib.request.urlopen(url) as response:
            return response.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        return f"Error: {e.code} - {e.reason}"


def string_enrichment(identifiers: Union[str, List[str]],
                     species: int = 9606,
                     caller_identity: str = "claude_scientific_skills") -> str:
    """
    Perform functional enrichment analysis (Gene Ontology, KEGG, Pfam, etc.).

    Args:
        identifiers: List of protein identifiers
        species: NCBI taxon ID (default: 9606 for human)
        caller_identity: Application identifier for tracking

    Returns:
        str: TSV format with enrichment results

    Example:
        # Enrichment for a list of proteins
        proteins = ['TP53', 'MDM2', 'ATM', 'CHEK2', 'BRCA1']
        enrichment = string_enrichment(proteins, species=9606)
    """
    if isinstance(identifiers, list):
        identifiers_str = '%0d'.join(identifiers)
    else:
        identifiers_str = identifiers

    params = {
        'identifiers': identifiers_str,
        'species': species,
        'caller_identity': caller_identity
    }

    url = f"{STRING_BASE_URL}/tsv/enrichment?" + urllib.parse.urlencode(params)

    try:
        with urllib.request.urlopen(url) as response:
            return response.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        return f"Error: {e.code} - {e.reason}"


def string_ppi_enrichment(identifiers: Union[str, List[str]],
                         species: int = 9606,
                         required_score: int = 400,
                         caller_identity: str = "claude_scientific_skills") -> str:
    """
    Test if network has more interactions than expected by chance.

    Args:
        identifiers: List of protein identifiers
        species: NCBI taxon ID (default: 9606 for human)
        required_score: Confidence threshold 0-1000 (default: 400)
        caller_identity: Application identifier for tracking

    Returns:
        str: JSON with PPI enrichment p-value

    Example:
        # Test if proteins are more connected than random
        proteins = ['TP53', 'MDM2', 'ATM', 'CHEK2']
        ppi_result = string_ppi_enrichment(proteins)
    """
    if isinstance(identifiers, list):
        identifiers_str = '%0d'.join(identifiers)
    else:
        identifiers_str = identifiers

    params = {
        'identifiers': identifiers_str,
        'species': species,
        'required_score': required_score,
        'caller_identity': caller_identity
    }

    url = f"{STRING_BASE_URL}/json/ppi_enrichment?" + urllib.parse.urlencode(params)

    try:
        with urllib.request.urlopen(url) as response:
            return response.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        return f"Error: {e.code} - {e.reason}"


def string_homology(identifiers: Union[str, List[str]],
                   species: int = 9606,
                   caller_identity: str = "claude_scientific_skills") -> str:
    """
    Get homology/similarity scores between proteins.

    Args:
        identifiers: Protein identifier(s)
        species: NCBI taxon ID (default: 9606 for human)
        caller_identity: Application identifier for tracking

    Returns:
        str: TSV format with homology scores

    Example:
        # Get homology data
        homology = string_homology(['TP53', 'TP63', 'TP73'])
    """
    if isinstance(identifiers, list):
        identifiers_str = '%0d'.join(identifiers)
    else:
        identifiers_str = identifiers

    params = {
        'identifiers': identifiers_str,
        'species': species,
        'caller_identity': caller_identity
    }

    url = f"{STRING_BASE_URL}/tsv/homology?" + urllib.parse.urlencode(params)

    try:
        with urllib.request.urlopen(url) as response:
            return response.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        return f"Error: {e.code} - {e.reason}"


def string_version() -> str:
    """
    Get current STRING database version.

    Returns:
        str: Version information

    Example:
        version = string_version()
    """
    url = f"{STRING_BASE_URL}/tsv/version"

    try:
        with urllib.request.urlopen(url) as response:
            return response.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        return f"Error: {e.code} - {e.reason}"


if __name__ == "__main__":
    # Example usage
    print("STRING Version:")
    print(string_version())
    print()

    print("Mapping protein names to STRING IDs:")
    mapping = string_map_ids(['TP53', 'BRCA1'], species=9606)
    print(mapping)
    print()

    print("Getting interaction network:")
    network = string_network('TP53', species=9606, add_nodes=3)
    print(network[:500] + "...")
