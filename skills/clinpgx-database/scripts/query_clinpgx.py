#!/usr/bin/env python3
"""
ClinPGx API Query Helper Script

Provides ready-to-use functions for querying the ClinPGx database API.
Includes rate limiting, error handling, and caching functionality.

ClinPGx API: https://api.clinpgx.org/
Rate limit: 2 requests per second
License: Creative Commons Attribution-ShareAlike 4.0 International
"""

import requests
import time
import json
from pathlib import Path
from typing import Dict, List, Optional, Any

# API Configuration
BASE_URL = "https://api.clinpgx.org/v1/"
RATE_LIMIT_DELAY = 0.5  # 500ms delay = 2 requests/second


def rate_limited_request(url: str, params: Optional[Dict] = None, delay: float = RATE_LIMIT_DELAY) -> requests.Response:
    """
    Make API request with rate limiting compliance.

    Args:
        url: API endpoint URL
        params: Query parameters
        delay: Delay in seconds between requests (default 0.5s for 2 req/sec)

    Returns:
        Response object
    """
    response = requests.get(url, params=params)
    time.sleep(delay)
    return response


def safe_api_call(url: str, params: Optional[Dict] = None, max_retries: int = 3) -> Optional[Dict]:
    """
    Make API call with error handling and exponential backoff retry.

    Args:
        url: API endpoint URL
        params: Query parameters
        max_retries: Maximum number of retry attempts

    Returns:
        JSON response data or None on failure
    """
    for attempt in range(max_retries):
        try:
            response = requests.get(url, params=params, timeout=10)

            if response.status_code == 200:
                time.sleep(RATE_LIMIT_DELAY)
                return response.json()
            elif response.status_code == 429:
                # Rate limit exceeded
                wait_time = 2 ** attempt  # Exponential backoff: 1s, 2s, 4s
                print(f"Rate limit exceeded. Waiting {wait_time}s before retry...")
                time.sleep(wait_time)
            elif response.status_code == 404:
                print(f"Resource not found: {url}")
                return None
            else:
                response.raise_for_status()

        except requests.exceptions.RequestException as e:
            print(f"Attempt {attempt + 1}/{max_retries} failed: {e}")
            if attempt == max_retries - 1:
                print(f"Failed after {max_retries} attempts")
                return None
            time.sleep(1)

    return None


def cached_query(cache_file: str, query_func, *args, **kwargs) -> Any:
    """
    Cache API results to avoid repeated queries.

    Args:
        cache_file: Path to cache file
        query_func: Function to call if cache miss
        *args, **kwargs: Arguments to pass to query_func

    Returns:
        Cached or freshly queried data
    """
    cache_path = Path(cache_file)

    if cache_path.exists():
        print(f"Loading from cache: {cache_file}")
        with open(cache_path) as f:
            return json.load(f)

    print(f"Cache miss. Querying API...")
    result = query_func(*args, **kwargs)

    if result is not None:
        cache_path.parent.mkdir(parents=True, exist_ok=True)
        with open(cache_path, 'w') as f:
            json.dump(result, f, indent=2)
        print(f"Cached to: {cache_file}")

    return result


# Core Query Functions

def get_gene_info(gene_symbol: str) -> Optional[Dict]:
    """
    Retrieve detailed information about a pharmacogene.

    Args:
        gene_symbol: Gene symbol (e.g., "CYP2D6", "TPMT")

    Returns:
        Gene information dictionary

    Example:
        >>> gene_data = get_gene_info("CYP2D6")
        >>> print(gene_data['symbol'], gene_data['name'])
    """
    url = f"{BASE_URL}gene/{gene_symbol}"
    return safe_api_call(url)


def get_drug_info(drug_name: str) -> Optional[List[Dict]]:
    """
    Search for drug/chemical information by name.

    Args:
        drug_name: Drug name (e.g., "warfarin", "codeine")

    Returns:
        List of matching drugs

    Example:
        >>> drugs = get_drug_info("warfarin")
        >>> for drug in drugs:
        >>>     print(drug['name'], drug['id'])
    """
    url = f"{BASE_URL}chemical"
    params = {"name": drug_name}
    return safe_api_call(url, params)


def get_gene_drug_pairs(gene: Optional[str] = None, drug: Optional[str] = None) -> Optional[List[Dict]]:
    """
    Query gene-drug interaction pairs.

    Args:
        gene: Gene symbol (optional)
        drug: Drug name (optional)

    Returns:
        List of gene-drug pairs with clinical annotations

    Example:
        >>> # Get all pairs for CYP2D6
        >>> pairs = get_gene_drug_pairs(gene="CYP2D6")
        >>>
        >>> # Get specific gene-drug pair
        >>> pair = get_gene_drug_pairs(gene="CYP2D6", drug="codeine")
    """
    url = f"{BASE_URL}geneDrugPair"
    params = {}
    if gene:
        params["gene"] = gene
    if drug:
        params["drug"] = drug

    return safe_api_call(url, params)


def get_cpic_guidelines(gene: Optional[str] = None, drug: Optional[str] = None) -> Optional[List[Dict]]:
    """
    Retrieve CPIC clinical practice guidelines.

    Args:
        gene: Gene symbol (optional)
        drug: Drug name (optional)

    Returns:
        List of CPIC guidelines

    Example:
        >>> # Get all CPIC guidelines
        >>> guidelines = get_cpic_guidelines()
        >>>
        >>> # Get guideline for specific gene-drug
        >>> guideline = get_cpic_guidelines(gene="CYP2C19", drug="clopidogrel")
    """
    url = f"{BASE_URL}guideline"
    params = {"source": "CPIC"}
    if gene:
        params["gene"] = gene
    if drug:
        params["drug"] = drug

    return safe_api_call(url, params)


def get_alleles(gene: str) -> Optional[List[Dict]]:
    """
    Get all alleles for a pharmacogene including function and frequency.

    Args:
        gene: Gene symbol (e.g., "CYP2D6")

    Returns:
        List of alleles with functional annotations and population frequencies

    Example:
        >>> alleles = get_alleles("CYP2D6")
        >>> for allele in alleles:
        >>>     print(f"{allele['name']}: {allele['function']}")
    """
    url = f"{BASE_URL}allele"
    params = {"gene": gene}
    return safe_api_call(url, params)


def get_allele_info(allele_name: str) -> Optional[Dict]:
    """
    Get detailed information about a specific allele.

    Args:
        allele_name: Allele name (e.g., "CYP2D6*4")

    Returns:
        Allele information dictionary

    Example:
        >>> allele = get_allele_info("CYP2D6*4")
        >>> print(allele['function'], allele['frequencies'])
    """
    url = f"{BASE_URL}allele/{allele_name}"
    return safe_api_call(url)


def get_clinical_annotations(
    gene: Optional[str] = None,
    drug: Optional[str] = None,
    evidence_level: Optional[str] = None
) -> Optional[List[Dict]]:
    """
    Retrieve curated literature annotations for gene-drug interactions.

    Args:
        gene: Gene symbol (optional)
        drug: Drug name (optional)
        evidence_level: Filter by evidence level (1A, 1B, 2A, 2B, 3, 4)

    Returns:
        List of clinical annotations

    Example:
        >>> # Get all annotations for CYP2D6
        >>> annotations = get_clinical_annotations(gene="CYP2D6")
        >>>
        >>> # Get high-quality evidence only
        >>> high_quality = get_clinical_annotations(evidence_level="1A")
    """
    url = f"{BASE_URL}clinicalAnnotation"
    params = {}
    if gene:
        params["gene"] = gene
    if drug:
        params["drug"] = drug
    if evidence_level:
        params["evidenceLevel"] = evidence_level

    return safe_api_call(url, params)


def get_drug_labels(drug: str, source: Optional[str] = None) -> Optional[List[Dict]]:
    """
    Retrieve pharmacogenomic drug label information.

    Args:
        drug: Drug name
        source: Regulatory source (e.g., "FDA", "EMA")

    Returns:
        List of drug labels with PGx information

    Example:
        >>> # Get all labels for warfarin
        >>> labels = get_drug_labels("warfarin")
        >>>
        >>> # Get only FDA labels
        >>> fda_labels = get_drug_labels("warfarin", source="FDA")
    """
    url = f"{BASE_URL}drugLabel"
    params = {"drug": drug}
    if source:
        params["source"] = source

    return safe_api_call(url, params)


def search_variants(rsid: Optional[str] = None, chromosome: Optional[str] = None,
                   position: Optional[str] = None) -> Optional[List[Dict]]:
    """
    Search for genetic variants by rsID or genomic position.

    Args:
        rsid: dbSNP rsID (e.g., "rs4244285")
        chromosome: Chromosome number
        position: Genomic position

    Returns:
        List of matching variants

    Example:
        >>> # Search by rsID
        >>> variant = search_variants(rsid="rs4244285")
        >>>
        >>> # Search by position
        >>> variants = search_variants(chromosome="10", position="94781859")
    """
    url = f"{BASE_URL}variant"

    if rsid:
        url = f"{BASE_URL}variant/{rsid}"
        return safe_api_call(url)

    params = {}
    if chromosome:
        params["chromosome"] = chromosome
    if position:
        params["position"] = position

    return safe_api_call(url, params)


def get_pathway_info(pathway_id: Optional[str] = None, drug: Optional[str] = None) -> Optional[Any]:
    """
    Retrieve pharmacokinetic/pharmacodynamic pathway information.

    Args:
        pathway_id: ClinPGx pathway ID (optional)
        drug: Drug name (optional)

    Returns:
        Pathway information or list of pathways

    Example:
        >>> # Get specific pathway
        >>> pathway = get_pathway_info(pathway_id="PA146123006")
        >>>
        >>> # Get all pathways for a drug
        >>> pathways = get_pathway_info(drug="warfarin")
    """
    if pathway_id:
        url = f"{BASE_URL}pathway/{pathway_id}"
        return safe_api_call(url)

    url = f"{BASE_URL}pathway"
    params = {}
    if drug:
        params["drug"] = drug

    return safe_api_call(url, params)


# Utility Functions

def export_to_dataframe(data: List[Dict], output_file: Optional[str] = None):
    """
    Convert API results to pandas DataFrame for analysis.

    Args:
        data: List of dictionaries from API
        output_file: Optional CSV output file path

    Returns:
        pandas DataFrame

    Example:
        >>> pairs = get_gene_drug_pairs(gene="CYP2D6")
        >>> df = export_to_dataframe(pairs, "cyp2d6_pairs.csv")
        >>> print(df.head())
    """
    try:
        import pandas as pd
    except ImportError:
        print("pandas not installed. Install with: pip install pandas")
        return None

    df = pd.DataFrame(data)

    if output_file:
        df.to_csv(output_file, index=False)
        print(f"Data exported to: {output_file}")

    return df


def batch_gene_query(gene_list: List[str], delay: float = 0.5) -> Dict[str, Dict]:
    """
    Query multiple genes in batch with rate limiting.

    Args:
        gene_list: List of gene symbols
        delay: Delay between requests (default 0.5s)

    Returns:
        Dictionary mapping gene symbols to gene data

    Example:
        >>> genes = ["CYP2D6", "CYP2C19", "CYP2C9", "TPMT"]
        >>> results = batch_gene_query(genes)
        >>> for gene, data in results.items():
        >>>     print(f"{gene}: {data['name']}")
    """
    results = {}

    print(f"Querying {len(gene_list)} genes with {delay}s delay between requests...")

    for gene in gene_list:
        print(f"Fetching: {gene}")
        data = get_gene_info(gene)
        if data:
            results[gene] = data
        time.sleep(delay)

    print(f"Completed: {len(results)}/{len(gene_list)} successful")
    return results


def find_actionable_gene_drug_pairs(cpic_level: str = "A") -> Optional[List[Dict]]:
    """
    Find all clinically actionable gene-drug pairs with CPIC guidelines.

    Args:
        cpic_level: CPIC recommendation level (A, B, C, D)

    Returns:
        List of actionable gene-drug pairs

    Example:
        >>> # Get all Level A recommendations
        >>> actionable = find_actionable_gene_drug_pairs(cpic_level="A")
        >>> for pair in actionable:
        >>>     print(f"{pair['gene']} - {pair['drug']}")
    """
    url = f"{BASE_URL}geneDrugPair"
    params = {"cpicLevel": cpic_level}
    return safe_api_call(url, params)


# Example Usage
if __name__ == "__main__":
    print("ClinPGx API Query Examples\n")

    # Example 1: Get gene information
    print("=" * 60)
    print("Example 1: Get CYP2D6 gene information")
    print("=" * 60)
    cyp2d6 = get_gene_info("CYP2D6")
    if cyp2d6:
        print(f"Gene: {cyp2d6.get('symbol')}")
        print(f"Name: {cyp2d6.get('name')}")
        print()

    # Example 2: Search for a drug
    print("=" * 60)
    print("Example 2: Search for warfarin")
    print("=" * 60)
    warfarin = get_drug_info("warfarin")
    if warfarin:
        for drug in warfarin[:1]:  # Show first result
            print(f"Drug: {drug.get('name')}")
            print(f"ID: {drug.get('id')}")
        print()

    # Example 3: Get gene-drug pairs
    print("=" * 60)
    print("Example 3: Get CYP2C19-clopidogrel pair")
    print("=" * 60)
    pair = get_gene_drug_pairs(gene="CYP2C19", drug="clopidogrel")
    if pair:
        print(f"Found {len(pair)} gene-drug pair(s)")
        if len(pair) > 0:
            print(f"Annotations: {pair[0].get('sources', [])}")
        print()

    # Example 4: Get CPIC guidelines
    print("=" * 60)
    print("Example 4: Get CPIC guidelines for CYP2C19")
    print("=" * 60)
    guidelines = get_cpic_guidelines(gene="CYP2C19")
    if guidelines:
        print(f"Found {len(guidelines)} guideline(s)")
        for g in guidelines[:2]:  # Show first 2
            print(f"  - {g.get('name')}")
        print()

    # Example 5: Get alleles for a gene
    print("=" * 60)
    print("Example 5: Get CYP2D6 alleles")
    print("=" * 60)
    alleles = get_alleles("CYP2D6")
    if alleles:
        print(f"Found {len(alleles)} allele(s)")
        for allele in alleles[:3]:  # Show first 3
            print(f"  - {allele.get('name')}: {allele.get('function')}")
        print()

    print("=" * 60)
    print("Examples completed!")
    print("=" * 60)
