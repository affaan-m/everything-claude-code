#!/usr/bin/env python3
"""
ClinicalTrials.gov API Query Helper

A comprehensive Python script for querying the ClinicalTrials.gov API v2.
Provides convenient functions for common query patterns including searching
by condition, intervention, location, sponsor, and retrieving specific trials.

API Documentation: https://clinicaltrials.gov/data-api/api
Rate Limit: ~50 requests per minute per IP address
"""

import requests
import json
from typing import Dict, List, Optional, Union
from urllib.parse import urlencode


BASE_URL = "https://clinicaltrials.gov/api/v2"


def search_studies(
    condition: Optional[str] = None,
    intervention: Optional[str] = None,
    location: Optional[str] = None,
    sponsor: Optional[str] = None,
    status: Optional[Union[str, List[str]]] = None,
    nct_ids: Optional[List[str]] = None,
    sort: str = "LastUpdatePostDate:desc",
    page_size: int = 10,
    page_token: Optional[str] = None,
    format: str = "json"
) -> Dict:
    """
    Search for clinical trials using various filters.

    Args:
        condition: Disease or condition (e.g., "lung cancer", "diabetes")
        intervention: Treatment or intervention (e.g., "Pembrolizumab", "exercise")
        location: Geographic location (e.g., "New York", "California")
        sponsor: Sponsor or collaborator name (e.g., "National Cancer Institute")
        status: Study status(es). Can be string or list. Valid values:
                RECRUITING, NOT_YET_RECRUITING, ENROLLING_BY_INVITATION,
                ACTIVE_NOT_RECRUITING, SUSPENDED, TERMINATED, COMPLETED, WITHDRAWN
        nct_ids: List of NCT IDs to filter by
        sort: Sort order (e.g., "LastUpdatePostDate:desc", "EnrollmentCount:desc")
        page_size: Number of results per page (default: 10, max: 1000)
        page_token: Token for pagination (returned from previous query)
        format: Response format ("json" or "csv")

    Returns:
        Dictionary containing search results with studies and metadata
    """
    params = {}

    # Build query parameters
    if condition:
        params['query.cond'] = condition
    if intervention:
        params['query.intr'] = intervention
    if location:
        params['query.locn'] = location
    if sponsor:
        params['query.spons'] = sponsor

    # Handle status filter (can be list or string)
    if status:
        if isinstance(status, list):
            params['filter.overallStatus'] = ','.join(status)
        else:
            params['filter.overallStatus'] = status

    # Handle NCT IDs filter
    if nct_ids:
        params['filter.ids'] = ','.join(nct_ids)

    # Add pagination and sorting
    params['sort'] = sort
    params['pageSize'] = page_size
    if page_token:
        params['pageToken'] = page_token

    # Set format
    params['format'] = format

    url = f"{BASE_URL}/studies"
    response = requests.get(url, params=params)
    response.raise_for_status()

    if format == "json":
        return response.json()
    else:
        return response.text


def get_study_details(nct_id: str, format: str = "json") -> Dict:
    """
    Retrieve detailed information about a specific clinical trial.

    Args:
        nct_id: The NCT ID of the trial (e.g., "NCT04852770")
        format: Response format ("json" or "csv")

    Returns:
        Dictionary containing comprehensive study information
    """
    params = {'format': format}
    url = f"{BASE_URL}/studies/{nct_id}"

    response = requests.get(url, params=params)
    response.raise_for_status()

    if format == "json":
        return response.json()
    else:
        return response.text


def search_with_all_results(
    condition: Optional[str] = None,
    intervention: Optional[str] = None,
    location: Optional[str] = None,
    sponsor: Optional[str] = None,
    status: Optional[Union[str, List[str]]] = None,
    max_results: Optional[int] = None
) -> List[Dict]:
    """
    Search for clinical trials and automatically paginate through all results.

    Args:
        condition: Disease or condition to search for
        intervention: Treatment or intervention to search for
        location: Geographic location to search in
        sponsor: Sponsor or collaborator name
        status: Study status(es) to filter by
        max_results: Maximum number of results to retrieve (None for all)

    Returns:
        List of all matching studies
    """
    all_studies = []
    page_token = None

    while True:
        result = search_studies(
            condition=condition,
            intervention=intervention,
            location=location,
            sponsor=sponsor,
            status=status,
            page_size=1000,  # Use max page size for efficiency
            page_token=page_token
        )

        studies = result.get('studies', [])
        all_studies.extend(studies)

        # Check if we've reached the max or there are no more results
        if max_results and len(all_studies) >= max_results:
            return all_studies[:max_results]

        # Check for next page
        page_token = result.get('nextPageToken')
        if not page_token:
            break

    return all_studies


def extract_study_summary(study: Dict) -> Dict:
    """
    Extract key information from a study for quick overview.

    Args:
        study: A study dictionary from the API response

    Returns:
        Dictionary with essential study information
    """
    protocol = study.get('protocolSection', {})
    identification = protocol.get('identificationModule', {})
    status_module = protocol.get('statusModule', {})
    description = protocol.get('descriptionModule', {})

    return {
        'nct_id': identification.get('nctId'),
        'title': identification.get('officialTitle') or identification.get('briefTitle'),
        'status': status_module.get('overallStatus'),
        'phase': protocol.get('designModule', {}).get('phases', []),
        'enrollment': protocol.get('designModule', {}).get('enrollmentInfo', {}).get('count'),
        'brief_summary': description.get('briefSummary'),
        'last_update': status_module.get('lastUpdatePostDateStruct', {}).get('date')
    }


# Example usage
if __name__ == "__main__":
    # Example 1: Search for recruiting lung cancer trials
    print("Example 1: Searching for recruiting lung cancer trials...")
    results = search_studies(
        condition="lung cancer",
        status="RECRUITING",
        page_size=5
    )
    print(f"Found {results.get('totalCount', 0)} total trials")
    print(f"Showing first {len(results.get('studies', []))} trials\n")

    # Example 2: Get details for a specific trial
    if results.get('studies'):
        first_study = results['studies'][0]
        nct_id = first_study['protocolSection']['identificationModule']['nctId']
        print(f"Example 2: Getting details for {nct_id}...")
        details = get_study_details(nct_id)
        summary = extract_study_summary(details)
        print(json.dumps(summary, indent=2))
