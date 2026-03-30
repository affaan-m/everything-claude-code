#!/usr/bin/env python3
"""
OpenAlex API Client with rate limiting and error handling.

Provides a robust client for interacting with the OpenAlex API with:
- Automatic rate limiting (polite pool: 10 req/sec)
- Exponential backoff retry logic
- Pagination support
- Batch operations support
"""

import time
import requests
from typing import Dict, List, Optional, Any
from urllib.parse import urljoin


class OpenAlexClient:
    """Client for OpenAlex API with rate limiting and error handling."""

    BASE_URL = "https://api.openalex.org"

    def __init__(self, email: Optional[str] = None, requests_per_second: int = 10):
        """
        Initialize OpenAlex client.

        Args:
            email: Email for polite pool (10x rate limit boost)
            requests_per_second: Max requests per second (default: 10 for polite pool)
        """
        self.email = email
        self.requests_per_second = requests_per_second
        self.min_delay = 1.0 / requests_per_second
        self.last_request_time = 0

    def _rate_limit(self):
        """Ensure requests don't exceed rate limit."""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        if time_since_last < self.min_delay:
            time.sleep(self.min_delay - time_since_last)
        self.last_request_time = time.time()

    def _make_request(
        self,
        endpoint: str,
        params: Optional[Dict] = None,
        max_retries: int = 5
    ) -> Dict[str, Any]:
        """
        Make API request with retry logic.

        Args:
            endpoint: API endpoint (e.g., '/works', '/authors')
            params: Query parameters
            max_retries: Maximum number of retry attempts

        Returns:
            JSON response as dictionary
        """
        if params is None:
            params = {}

        # Add email to params for polite pool
        if self.email:
            params['mailto'] = self.email

        url = urljoin(self.BASE_URL, endpoint)

        for attempt in range(max_retries):
            try:
                self._rate_limit()
                response = requests.get(url, params=params, timeout=30)

                if response.status_code == 200:
                    return response.json()
                elif response.status_code == 403:
                    # Rate limited
                    wait_time = 2 ** attempt
                    print(f"Rate limited. Waiting {wait_time}s before retry...")
                    time.sleep(wait_time)
                elif response.status_code >= 500:
                    # Server error
                    wait_time = 2 ** attempt
                    print(f"Server error. Waiting {wait_time}s before retry...")
                    time.sleep(wait_time)
                else:
                    # Other error - don't retry
                    response.raise_for_status()

            except requests.exceptions.Timeout:
                if attempt < max_retries - 1:
                    wait_time = 2 ** attempt
                    print(f"Request timeout. Waiting {wait_time}s before retry...")
                    time.sleep(wait_time)
                else:
                    raise

        raise Exception(f"Failed after {max_retries} retries")

    def search_works(
        self,
        search: Optional[str] = None,
        filter_params: Optional[Dict] = None,
        per_page: int = 200,
        page: int = 1,
        sort: Optional[str] = None,
        select: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Search works with filters.

        Args:
            search: Full-text search query
            filter_params: Dictionary of filter parameters
            per_page: Results per page (max: 200)
            page: Page number
            sort: Sort parameter (e.g., 'cited_by_count:desc')
            select: List of fields to return

        Returns:
            API response with meta and results
        """
        params = {
            'per-page': min(per_page, 200),
            'page': page
        }

        if search:
            params['search'] = search

        if filter_params:
            filter_str = ','.join([f"{k}:{v}" for k, v in filter_params.items()])
            params['filter'] = filter_str

        if sort:
            params['sort'] = sort

        if select:
            params['select'] = ','.join(select)

        return self._make_request('/works', params)

    def get_entity(self, entity_type: str, entity_id: str) -> Dict[str, Any]:
        """
        Get single entity by ID.

        Args:
            entity_type: Type of entity ('works', 'authors', 'institutions', etc.)
            entity_id: OpenAlex ID or external ID (DOI, ORCID, etc.)

        Returns:
            Entity object
        """
        endpoint = f"/{entity_type}/{entity_id}"
        return self._make_request(endpoint)

    def batch_lookup(
        self,
        entity_type: str,
        ids: List[str],
        id_field: str = 'openalex_id'
    ) -> List[Dict[str, Any]]:
        """
        Look up multiple entities by ID efficiently.

        Args:
            entity_type: Type of entity ('works', 'authors', etc.)
            ids: List of IDs (up to 50 per batch)
            id_field: ID field name ('openalex_id', 'doi', 'orcid', etc.)

        Returns:
            List of entity objects
        """
        all_results = []

        # Process in batches of 50
        for i in range(0, len(ids), 50):
            batch = ids[i:i+50]
            filter_value = '|'.join(batch)

            params = {
                'filter': f"{id_field}:{filter_value}",
                'per-page': 50
            }

            response = self._make_request(f"/{entity_type}", params)
            all_results.extend(response.get('results', []))

        return all_results

    def paginate_all(
        self,
        endpoint: str,
        params: Optional[Dict] = None,
        max_results: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Paginate through all results.

        Args:
            endpoint: API endpoint
            params: Query parameters
            max_results: Maximum number of results to retrieve (None for all)

        Returns:
            List of all results
        """
        if params is None:
            params = {}

        params['per-page'] = 200  # Use maximum page size
        params['page'] = 1

        all_results = []

        while True:
            response = self._make_request(endpoint, params)
            results = response.get('results', [])
            all_results.extend(results)

            # Check if we've hit max_results
            if max_results and len(all_results) >= max_results:
                return all_results[:max_results]

            # Check if there are more pages
            meta = response.get('meta', {})
            total_count = meta.get('count', 0)
            current_count = len(all_results)

            if current_count >= total_count:
                break

            params['page'] += 1

        return all_results

    def sample_works(
        self,
        sample_size: int,
        seed: Optional[int] = None,
        filter_params: Optional[Dict] = None
    ) -> List[Dict[str, Any]]:
        """
        Get random sample of works.

        Args:
            sample_size: Number of samples to retrieve
            seed: Random seed for reproducibility
            filter_params: Optional filters to apply

        Returns:
            List of sampled works
        """
        params = {
            'sample': min(sample_size, 10000),  # API limit per request
            'per-page': 200
        }

        if seed is not None:
            params['seed'] = seed

        if filter_params:
            filter_str = ','.join([f"{k}:{v}" for k, v in filter_params.items()])
            params['filter'] = filter_str

        # For large samples, need multiple requests with different seeds
        if sample_size > 10000:
            all_samples = []
            seen_ids = set()

            for i in range((sample_size // 10000) + 1):
                current_seed = seed + i if seed else i
                params['seed'] = current_seed
                params['sample'] = min(10000, sample_size - len(all_samples))

                response = self._make_request('/works', params)
                results = response.get('results', [])

                # Deduplicate
                for result in results:
                    work_id = result.get('id')
                    if work_id not in seen_ids:
                        seen_ids.add(work_id)
                        all_samples.append(result)

                if len(all_samples) >= sample_size:
                    break

            return all_samples[:sample_size]
        else:
            response = self._make_request('/works', params)
            return response.get('results', [])

    def group_by(
        self,
        entity_type: str,
        group_field: str,
        filter_params: Optional[Dict] = None
    ) -> List[Dict[str, Any]]:
        """
        Aggregate results by field.

        Args:
            entity_type: Type of entity ('works', 'authors', etc.)
            group_field: Field to group by
            filter_params: Optional filters

        Returns:
            List of grouped results with counts
        """
        params = {
            'group_by': group_field
        }

        if filter_params:
            filter_str = ','.join([f"{k}:{v}" for k, v in filter_params.items()])
            params['filter'] = filter_str

        response = self._make_request(f"/{entity_type}", params)
        return response.get('group_by', [])


if __name__ == "__main__":
    # Example usage
    client = OpenAlexClient(email="your-email@example.com")

    # Search for works about machine learning
    results = client.search_works(
        search="machine learning",
        filter_params={"publication_year": "2023"},
        per_page=10
    )

    print(f"Found {results['meta']['count']} works")
    for work in results['results']:
        print(f"- {work['title']}")
