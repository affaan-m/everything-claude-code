#!/usr/bin/env python3
"""
Helper functions for common OpenAlex query patterns.

Provides high-level functions for typical research queries.
"""

from typing import List, Dict, Optional, Any
from openalex_client import OpenAlexClient


def find_author_works(
    author_name: str,
    client: OpenAlexClient,
    limit: Optional[int] = None
) -> List[Dict[str, Any]]:
    """
    Find all works by an author (two-step pattern).

    Args:
        author_name: Author name to search for
        client: OpenAlexClient instance
        limit: Maximum number of works to return

    Returns:
        List of works by the author
    """
    # Step 1: Find author ID
    author_response = client._make_request(
        '/authors',
        params={'search': author_name, 'per-page': 1}
    )

    if not author_response.get('results'):
        print(f"No author found for: {author_name}")
        return []

    author = author_response['results'][0]
    author_id = author['id'].split('/')[-1]  # Extract ID from URL

    print(f"Found author: {author['display_name']} (ID: {author_id})")

    # Step 2: Get works by author
    works_params = {
        'filter': f'authorships.author.id:{author_id}',
        'per-page': 200
    }

    if limit and limit <= 200:
        works_params['per-page'] = limit
        response = client._make_request('/works', works_params)
        return response.get('results', [])
    else:
        # Need pagination
        return client.paginate_all('/works', works_params, max_results=limit)


def find_institution_works(
    institution_name: str,
    client: OpenAlexClient,
    limit: Optional[int] = None
) -> List[Dict[str, Any]]:
    """
    Find all works from an institution (two-step pattern).

    Args:
        institution_name: Institution name to search for
        client: OpenAlexClient instance
        limit: Maximum number of works to return

    Returns:
        List of works from the institution
    """
    # Step 1: Find institution ID
    inst_response = client._make_request(
        '/institutions',
        params={'search': institution_name, 'per-page': 1}
    )

    if not inst_response.get('results'):
        print(f"No institution found for: {institution_name}")
        return []

    institution = inst_response['results'][0]
    inst_id = institution['id'].split('/')[-1]  # Extract ID from URL

    print(f"Found institution: {institution['display_name']} (ID: {inst_id})")

    # Step 2: Get works from institution
    works_params = {
        'filter': f'authorships.institutions.id:{inst_id}',
        'per-page': 200
    }

    if limit and limit <= 200:
        works_params['per-page'] = limit
        response = client._make_request('/works', works_params)
        return response.get('results', [])
    else:
        return client.paginate_all('/works', works_params, max_results=limit)


def find_highly_cited_recent_papers(
    topic: Optional[str] = None,
    years: str = ">2020",
    client: Optional[OpenAlexClient] = None,
    limit: int = 100
) -> List[Dict[str, Any]]:
    """
    Find highly cited recent papers, optionally filtered by topic.

    Args:
        topic: Optional search term for topic filtering
        years: Year filter (e.g., ">2020", "2020-2023")
        client: OpenAlexClient instance
        limit: Maximum number of papers to return

    Returns:
        List of highly cited papers sorted by citation count
    """
    if client is None:
        client = OpenAlexClient()

    params = {
        'filter': f'publication_year:{years}',
        'sort': 'cited_by_count:desc',
        'per-page': min(limit, 200)
    }

    if topic:
        params['search'] = topic

    if limit <= 200:
        response = client._make_request('/works', params)
        return response.get('results', [])
    else:
        return client.paginate_all('/works', params, max_results=limit)


def get_open_access_papers(
    search_term: str,
    client: OpenAlexClient,
    oa_status: str = "any",  # "any", "gold", "green", "hybrid", "bronze"
    limit: int = 100
) -> List[Dict[str, Any]]:
    """
    Find open access papers on a topic.

    Args:
        search_term: Search query
        client: OpenAlexClient instance
        oa_status: Type of OA ("any" for is_oa:true, or specific status)
        limit: Maximum number of papers to return

    Returns:
        List of open access papers
    """
    if oa_status == "any":
        filter_str = "is_oa:true"
    else:
        filter_str = f"open_access.oa_status:{oa_status}"

    params = {
        'search': search_term,
        'filter': filter_str,
        'per-page': min(limit, 200)
    }

    if limit <= 200:
        response = client._make_request('/works', params)
        return response.get('results', [])
    else:
        return client.paginate_all('/works', params, max_results=limit)


def get_publication_trends(
    search_term: Optional[str] = None,
    filter_params: Optional[Dict] = None,
    client: Optional[OpenAlexClient] = None
) -> List[Dict[str, Any]]:
    """
    Get publication counts by year.

    Args:
        search_term: Optional search query
        filter_params: Optional additional filters
        client: OpenAlexClient instance

    Returns:
        List of {year, count} dictionaries
    """
    if client is None:
        client = OpenAlexClient()

    params = {'group_by': 'publication_year'}

    if search_term:
        params['search'] = search_term

    if filter_params:
        filter_str = ','.join([f"{k}:{v}" for k, v in filter_params.items()])
        params['filter'] = filter_str

    response = client._make_request('/works', params)
    return response.get('group_by', [])


def analyze_research_output(
    entity_type: str,  # 'author' or 'institution'
    entity_name: str,
    client: OpenAlexClient,
    years: str = ">2020"
) -> Dict[str, Any]:
    """
    Analyze research output for an author or institution.

    Args:
        entity_type: 'author' or 'institution'
        entity_name: Name to search for
        client: OpenAlexClient instance
        years: Year filter

    Returns:
        Dictionary with analysis results
    """
    # Find entity ID
    if entity_type == 'author':
        endpoint = '/authors'
        filter_prefix = 'authorships.author.id'
    else:
        endpoint = '/institutions'
        filter_prefix = 'authorships.institutions.id'

    # Step 1: Find entity
    entity_response = client._make_request(
        endpoint,
        params={'search': entity_name, 'per-page': 1}
    )

    if not entity_response.get('results'):
        return {'error': f'No {entity_type} found for: {entity_name}'}

    entity = entity_response['results'][0]
    entity_id = entity['id'].split('/')[-1]

    # Step 2: Get statistics
    filter_params = {
        filter_prefix: entity_id,
        'publication_year': years
    }

    # Total works
    works_response = client.search_works(
        filter_params=filter_params,
        per_page=1
    )
    total_works = works_response['meta']['count']

    # Works by year
    trends = client.group_by(
        'works',
        'publication_year',
        filter_params={filter_prefix: entity_id, 'publication_year': years}
    )

    # Top topics
    topics = client.group_by(
        'works',
        'topics.id',
        filter_params=filter_params
    )

    # OA percentage
    oa_works = client.search_works(
        filter_params={**filter_params, 'is_oa': 'true'},
        per_page=1
    )
    oa_count = oa_works['meta']['count']
    oa_percentage = (oa_count / total_works * 100) if total_works > 0 else 0

    return {
        'entity_name': entity['display_name'],
        'entity_id': entity_id,
        'total_works': total_works,
        'open_access_works': oa_count,
        'open_access_percentage': round(oa_percentage, 1),
        'publications_by_year': trends[:10],  # Last 10 years
        'top_topics': topics[:10]  # Top 10 topics
    }


if __name__ == "__main__":
    # Example usage
    import json

    client = OpenAlexClient(email="your-email@example.com")

    # Find works by author
    print("\n=== Finding works by author ===")
    works = find_author_works("Einstein", client, limit=5)
    print(f"Found {len(works)} works")

    # Analyze research output
    print("\n=== Analyzing institution research output ===")
    analysis = analyze_research_output('institution', 'MIT', client)
    print(json.dumps(analysis, indent=2))
