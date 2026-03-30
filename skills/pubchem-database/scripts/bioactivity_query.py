#!/usr/bin/env python3
"""
PubChem Bioactivity Data Retrieval

This script provides functions for retrieving biological activity data
from PubChem for compounds and assays.
"""

import sys
import json
import time
from typing import Dict, List, Optional

try:
    import requests
except ImportError:
    print("Error: requests is not installed. Install it with: pip install requests")
    sys.exit(1)


BASE_URL = "https://pubchem.ncbi.nlm.nih.gov/rest/pug"
PUG_VIEW_URL = "https://pubchem.ncbi.nlm.nih.gov/rest/pug_view"

# Rate limiting: 5 requests per second maximum
REQUEST_DELAY = 0.21  # seconds between requests


def rate_limited_request(url: str, method: str = 'GET', **kwargs) -> Optional[requests.Response]:
    """
    Make a rate-limited request to PubChem API.

    Args:
        url: Request URL
        method: HTTP method ('GET' or 'POST')
        **kwargs: Additional arguments for requests

    Returns:
        Response object or None on error
    """
    time.sleep(REQUEST_DELAY)

    try:
        if method.upper() == 'GET':
            response = requests.get(url, **kwargs)
        else:
            response = requests.post(url, **kwargs)

        response.raise_for_status()
        return response
    except requests.exceptions.RequestException as e:
        print(f"Request error: {e}")
        return None


def get_bioassay_summary(cid: int) -> Optional[Dict]:
    """
    Get bioassay summary for a compound.

    Args:
        cid: PubChem Compound ID

    Returns:
        Dictionary containing bioassay summary data
    """
    url = f"{BASE_URL}/compound/cid/{cid}/assaysummary/JSON"
    response = rate_limited_request(url)

    if response and response.status_code == 200:
        return response.json()
    return None


def get_compound_bioactivities(
    cid: int,
    activity_outcome: Optional[str] = None
) -> List[Dict]:
    """
    Get bioactivity data for a compound.

    Args:
        cid: PubChem Compound ID
        activity_outcome: Filter by activity ('active', 'inactive', 'inconclusive')

    Returns:
        List of bioactivity records
    """
    data = get_bioassay_summary(cid)

    if not data:
        return []

    activities = []
    table = data.get('Table', {})

    for row in table.get('Row', []):
        activity = {}
        for i, cell in enumerate(row.get('Cell', [])):
            column_name = table['Columns']['Column'][i]
            activity[column_name] = cell

        if activity_outcome:
            if activity.get('Activity Outcome', '').lower() == activity_outcome.lower():
                activities.append(activity)
        else:
            activities.append(activity)

    return activities


def get_assay_description(aid: int) -> Optional[Dict]:
    """
    Get detailed description for a specific assay.

    Args:
        aid: PubChem Assay ID (AID)

    Returns:
        Dictionary containing assay description
    """
    url = f"{BASE_URL}/assay/aid/{aid}/description/JSON"
    response = rate_limited_request(url)

    if response and response.status_code == 200:
        return response.json()
    return None


def get_assay_targets(aid: int) -> List[str]:
    """
    Get biological targets for an assay.

    Args:
        aid: PubChem Assay ID

    Returns:
        List of target names
    """
    description = get_assay_description(aid)

    if not description:
        return []

    targets = []
    assay_data = description.get('PC_AssayContainer', [{}])[0]
    assay = assay_data.get('assay', {})

    # Extract target information
    descr = assay.get('descr', {})
    for target in descr.get('target', []):
        mol_id = target.get('mol_id', '')
        name = target.get('name', '')
        if name:
            targets.append(name)
        elif mol_id:
            targets.append(f"GI:{mol_id}")

    return targets


def search_assays_by_target(
    target_name: str,
    max_results: int = 100
) -> List[int]:
    """
    Search for assays targeting a specific protein or gene.

    Args:
        target_name: Name of the target (e.g., 'EGFR', 'p53')
        max_results: Maximum number of results

    Returns:
        List of Assay IDs (AIDs)
    """
    # Use PubChem's text search for assays
    url = f"{BASE_URL}/assay/target/{target_name}/aids/JSON"
    response = rate_limited_request(url)

    if response and response.status_code == 200:
        data = response.json()
        aids = data.get('IdentifierList', {}).get('AID', [])
        return aids[:max_results]
    return []


def get_active_compounds_in_assay(aid: int, max_results: int = 1000) -> List[int]:
    """
    Get list of active compounds in an assay.

    Args:
        aid: PubChem Assay ID
        max_results: Maximum number of results

    Returns:
        List of Compound IDs (CIDs) that showed activity
    """
    url = f"{BASE_URL}/assay/aid/{aid}/cids/JSON?cids_type=active"
    response = rate_limited_request(url)

    if response and response.status_code == 200:
        data = response.json()
        cids = data.get('IdentifierList', {}).get('CID', [])
        return cids[:max_results]
    return []


def get_compound_annotations(cid: int, section: Optional[str] = None) -> Optional[Dict]:
    """
    Get comprehensive compound annotations from PUG-View.

    Args:
        cid: PubChem Compound ID
        section: Specific section to retrieve (e.g., 'Pharmacology and Biochemistry')

    Returns:
        Dictionary containing annotation data
    """
    url = f"{PUG_VIEW_URL}/data/compound/{cid}/JSON"

    if section:
        url += f"?heading={section}"

    response = rate_limited_request(url)

    if response and response.status_code == 200:
        return response.json()
    return None


def get_drug_information(cid: int) -> Optional[Dict]:
    """
    Get drug and medication information for a compound.

    Args:
        cid: PubChem Compound ID

    Returns:
        Dictionary containing drug information
    """
    return get_compound_annotations(cid, section="Drug and Medication Information")


def get_safety_hazards(cid: int) -> Optional[Dict]:
    """
    Get safety and hazard information for a compound.

    Args:
        cid: PubChem Compound ID

    Returns:
        Dictionary containing safety information
    """
    return get_compound_annotations(cid, section="Safety and Hazards")


def summarize_bioactivities(cid: int) -> Dict:
    """
    Generate a summary of bioactivity data for a compound.

    Args:
        cid: PubChem Compound ID

    Returns:
        Dictionary with bioactivity summary statistics
    """
    activities = get_compound_bioactivities(cid)

    summary = {
        'total_assays': len(activities),
        'active': 0,
        'inactive': 0,
        'inconclusive': 0,
        'unspecified': 0,
        'assay_types': {}
    }

    for activity in activities:
        outcome = activity.get('Activity Outcome', '').lower()

        if 'active' in outcome:
            summary['active'] += 1
        elif 'inactive' in outcome:
            summary['inactive'] += 1
        elif 'inconclusive' in outcome:
            summary['inconclusive'] += 1
        else:
            summary['unspecified'] += 1

    return summary


def find_compounds_by_bioactivity(
    target: str,
    threshold: Optional[float] = None,
    max_compounds: int = 100
) -> List[Dict]:
    """
    Find compounds with bioactivity against a specific target.

    Args:
        target: Target name (e.g., 'EGFR')
        threshold: Activity threshold (if applicable)
        max_compounds: Maximum number of compounds to return

    Returns:
        List of dictionaries with compound information and activity data
    """
    # Step 1: Find assays for the target
    assay_ids = search_assays_by_target(target, max_results=10)

    if not assay_ids:
        print(f"No assays found for target: {target}")
        return []

    # Step 2: Get active compounds from these assays
    compound_set = set()
    compound_data = []

    for aid in assay_ids[:5]:  # Limit to first 5 assays
        active_cids = get_active_compounds_in_assay(aid, max_results=max_compounds)

        for cid in active_cids:
            if cid not in compound_set and len(compound_data) < max_compounds:
                compound_set.add(cid)
                compound_data.append({
                    'cid': cid,
                    'aid': aid,
                    'target': target
                })

        if len(compound_data) >= max_compounds:
            break

    return compound_data


def main():
    """Example usage of bioactivity query functions."""

    # Example 1: Get bioassay summary for aspirin (CID 2244)
    print("Example 1: Getting bioassay summary for aspirin (CID 2244)...")
    summary = summarize_bioactivities(2244)
    print(json.dumps(summary, indent=2))

    # Example 2: Get active bioactivities for a compound
    print("\nExample 2: Getting active bioactivities for aspirin...")
    activities = get_compound_bioactivities(2244, activity_outcome='active')
    print(f"Found {len(activities)} active bioactivities")
    if activities:
        print(f"First activity: {activities[0].get('Assay Name', 'N/A')}")

    # Example 3: Get assay information
    print("\nExample 3: Getting assay description...")
    if activities:
        aid = activities[0].get('AID', 0)
        targets = get_assay_targets(aid)
        print(f"Assay {aid} targets: {', '.join(targets) if targets else 'N/A'}")

    # Example 4: Search for compounds targeting EGFR
    print("\nExample 4: Searching for EGFR inhibitors...")
    egfr_compounds = find_compounds_by_bioactivity('EGFR', max_compounds=5)
    print(f"Found {len(egfr_compounds)} compounds with EGFR activity")
    for comp in egfr_compounds[:5]:
        print(f"  CID {comp['cid']} (from AID {comp['aid']})")


if __name__ == '__main__':
    main()
