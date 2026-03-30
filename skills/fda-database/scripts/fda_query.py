#!/usr/bin/env python3
"""
FDA API Query Helper

Comprehensive utility for querying FDA databases through openFDA API.
Includes error handling, rate limiting, caching, and common query patterns.

Usage:
    from fda_query import FDAQuery

    fda = FDAQuery(api_key="YOUR_API_KEY")
    results = fda.query_drug_events(drug_name="aspirin", limit=100)
"""

import requests
import time
import json
import hashlib
from pathlib import Path
from datetime import datetime, timedelta
from collections import deque, Counter
from typing import Dict, List, Optional, Any


class RateLimiter:
    """Manage API rate limits."""

    def __init__(self, max_per_minute: int = 240):
        self.max_per_minute = max_per_minute
        self.requests = deque()

    def wait_if_needed(self):
        """Wait if necessary to stay under rate limit."""
        now = time.time()

        # Remove requests older than 1 minute
        while self.requests and now - self.requests[0] > 60:
            self.requests.popleft()

        # Check if at limit
        if len(self.requests) >= self.max_per_minute:
            sleep_time = 60 - (now - self.requests[0]) + 0.1
            if sleep_time > 0:
                print(f"Rate limit approaching. Waiting {sleep_time:.1f} seconds...")
                time.sleep(sleep_time)
            self.requests.popleft()

        self.requests.append(time.time())


class FDACache:
    """Simple file-based cache for FDA API responses."""

    def __init__(self, cache_dir: str = "fda_cache", ttl: int = 3600):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(exist_ok=True)
        self.ttl = ttl

    def _get_cache_key(self, url: str, params: Dict) -> str:
        """Generate cache key from URL and params."""
        cache_string = f"{url}_{json.dumps(params, sort_keys=True)}"
        return hashlib.md5(cache_string.encode()).hexdigest()

    def get(self, url: str, params: Dict) -> Optional[Dict]:
        """Get cached response if available and not expired."""
        key = self._get_cache_key(url, params)
        cache_file = self.cache_dir / f"{key}.json"

        if cache_file.exists():
            age = time.time() - cache_file.stat().st_mtime
            if age < self.ttl:
                with open(cache_file, 'r') as f:
                    return json.load(f)
        return None

    def set(self, url: str, params: Dict, data: Dict):
        """Cache response data."""
        key = self._get_cache_key(url, params)
        cache_file = self.cache_dir / f"{key}.json"
        with open(cache_file, 'w') as f:
            json.dump(data, f)


class FDAQuery:
    """Main class for querying FDA databases."""

    BASE_URL = "https://api.fda.gov"

    def __init__(self, api_key: Optional[str] = None, use_cache: bool = True,
                 cache_ttl: int = 3600, rate_limit: int = 240):
        """
        Initialize FDA query client.

        Args:
            api_key: FDA API key (optional but recommended)
            use_cache: Whether to use response caching
            cache_ttl: Cache time-to-live in seconds
            rate_limit: Requests per minute limit
        """
        self.api_key = api_key
        self.rate_limiter = RateLimiter(max_per_minute=rate_limit)
        self.cache = FDACache(ttl=cache_ttl) if use_cache else None

    def _build_url(self, category: str, endpoint: str) -> str:
        """Build full API endpoint URL."""
        return f"{self.BASE_URL}/{category}/{endpoint}.json"

    def _make_request(self, url: str, params: Dict, use_cache: bool = True) -> Dict:
        """
        Make API request with error handling, rate limiting, and caching.

        Args:
            url: Full API endpoint URL
            params: Query parameters
            use_cache: Whether to use cache for this request

        Returns:
            API response as dictionary
        """
        # Add API key if available
        if self.api_key:
            params["api_key"] = self.api_key

        # Check cache
        if use_cache and self.cache:
            cached = self.cache.get(url, params)
            if cached:
                return cached

        # Rate limiting
        self.rate_limiter.wait_if_needed()

        # Make request
        try:
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()

            # Cache successful response
            if use_cache and self.cache:
                self.cache.set(url, params, data)

            return data

        except requests.exceptions.HTTPError as e:
            if response.status_code == 404:
                return {"error": "No results found", "results": []}
            elif response.status_code == 429:
                # Rate limit exceeded, wait and retry once
                print("Rate limit exceeded. Waiting 60 seconds...")
                time.sleep(60)
                return self._make_request(url, params, use_cache=False)
            elif response.status_code == 400:
                return {"error": f"Invalid query: {response.text}"}
            else:
                return {"error": f"HTTP error {response.status_code}: {e}"}
        except requests.exceptions.RequestException as e:
            return {"error": f"Request error: {e}"}

    def query(self, category: str, endpoint: str, search: Optional[str] = None,
              limit: int = 100, skip: int = 0, count: Optional[str] = None,
              sort: Optional[str] = None) -> Dict:
        """
        Generic query method for any FDA endpoint.

        Args:
            category: API category (drug, device, food, animalandveterinary, other)
            endpoint: Specific endpoint (event, label, enforcement, etc.)
            search: Search query string
            limit: Maximum results to return (1-1000)
            skip: Number of results to skip (for pagination)
            count: Field to count/aggregate by
            sort: Field to sort by (e.g., "receivedate:desc")

        Returns:
            API response dictionary
        """
        url = self._build_url(category, endpoint)
        params = {}

        if search:
            params["search"] = search
        if limit:
            params["limit"] = min(limit, 1000)
        if skip:
            params["skip"] = skip
        if count:
            params["count"] = count
        if sort:
            params["sort"] = sort

        return self._make_request(url, params)

    def query_all(self, category: str, endpoint: str, search: str,
                  max_results: int = 5000, batch_size: int = 100) -> List[Dict]:
        """
        Query and retrieve all results with automatic pagination.

        Args:
            category: API category
            endpoint: Specific endpoint
            search: Search query string
            max_results: Maximum total results to retrieve
            batch_size: Results per request

        Returns:
            List of all result records
        """
        all_results = []
        skip = 0

        while len(all_results) < max_results:
            data = self.query(
                category=category,
                endpoint=endpoint,
                search=search,
                limit=batch_size,
                skip=skip
            )

            if "error" in data or "results" not in data:
                break

            results = data["results"]
            if not results:
                break

            all_results.extend(results)

            if len(results) < batch_size:
                break

            skip += batch_size

        return all_results[:max_results]

    # Drug-specific methods

    def query_drug_events(self, drug_name: str, limit: int = 100) -> Dict:
        """Query drug adverse events."""
        search = f"patient.drug.medicinalproduct:*{drug_name}*"
        return self.query("drug", "event", search=search, limit=limit)

    def query_drug_label(self, drug_name: str, brand: bool = True) -> Dict:
        """Query drug labeling information."""
        field = "openfda.brand_name" if brand else "openfda.generic_name"
        search = f"{field}:{drug_name}"
        return self.query("drug", "label", search=search, limit=1)

    def query_drug_ndc(self, ndc: Optional[str] = None,
                       manufacturer: Optional[str] = None) -> Dict:
        """Query National Drug Code directory."""
        if ndc:
            search = f"product_ndc:{ndc}"
        elif manufacturer:
            search = f"labeler_name:*{manufacturer}*"
        else:
            raise ValueError("Must provide either ndc or manufacturer")

        return self.query("drug", "ndc", search=search, limit=100)

    def query_drug_recalls(self, drug_name: Optional[str] = None,
                          classification: Optional[str] = None) -> Dict:
        """Query drug recalls."""
        search_parts = []
        if drug_name:
            search_parts.append(f"product_description:*{drug_name}*")
        if classification:
            search_parts.append(f"classification:Class+{classification}")

        search = "+AND+".join(search_parts) if search_parts else None
        return self.query("drug", "enforcement", search=search, limit=100,
                         sort="report_date:desc")

    # Device-specific methods

    def query_device_events(self, device_name: str, limit: int = 100) -> Dict:
        """Query device adverse events."""
        search = f"device.brand_name:*{device_name}*"
        return self.query("device", "event", search=search, limit=limit)

    def query_device_510k(self, applicant: Optional[str] = None,
                          device_name: Optional[str] = None) -> Dict:
        """Query 510(k) clearances."""
        if applicant:
            search = f"applicant:*{applicant}*"
        elif device_name:
            search = f"device_name:*{device_name}*"
        else:
            raise ValueError("Must provide either applicant or device_name")

        return self.query("device", "510k", search=search, limit=100)

    def query_device_classification(self, product_code: str) -> Dict:
        """Query device classification by product code."""
        search = f"product_code:{product_code}"
        return self.query("device", "classification", search=search, limit=1)

    # Food-specific methods

    def query_food_events(self, product_name: Optional[str] = None,
                         industry: Optional[str] = None) -> Dict:
        """Query food adverse events."""
        if product_name:
            search = f"products.name_brand:*{product_name}*"
        elif industry:
            search = f"products.industry_name:*{industry}*"
        else:
            search = "_exists_:report_number"

        return self.query("food", "event", search=search, limit=100)

    def query_food_recalls(self, product: Optional[str] = None,
                          reason: Optional[str] = None,
                          classification: Optional[str] = None) -> Dict:
        """Query food recalls."""
        search_parts = []
        if product:
            search_parts.append(f"product_description:*{product}*")
        if reason:
            search_parts.append(f"reason_for_recall:*{reason}*")
        if classification:
            search_parts.append(f"classification:Class+{classification}")

        search = "+AND+".join(search_parts) if search_parts else "_exists_:recall_number"
        return self.query("food", "enforcement", search=search, limit=100,
                         sort="report_date:desc")

    # Animal & Veterinary methods

    def query_animal_events(self, species: Optional[str] = None,
                           drug_name: Optional[str] = None) -> Dict:
        """Query animal drug adverse events."""
        search_parts = []
        if species:
            search_parts.append(f"animal.species:*{species}*")
        if drug_name:
            search_parts.append(f"drug.brand_name:*{drug_name}*")

        search = "+AND+".join(search_parts) if search_parts else "_exists_:unique_aer_id_number"
        return self.query("animalandveterinary", "event", search=search, limit=100)

    # Substance methods

    def query_substance_by_unii(self, unii: str) -> Dict:
        """Query substance by UNII code."""
        search = f"approvalID:{unii}"
        return self.query("other", "substance", search=search, limit=1)

    def query_substance_by_name(self, name: str) -> Dict:
        """Query substance by name."""
        search = f"names.name:*{name}*"
        return self.query("other", "substance", search=search, limit=10)

    # Analysis methods

    def count_by_field(self, category: str, endpoint: str,
                      search: str, field: str, exact: bool = True) -> Dict:
        """
        Count and aggregate results by a specific field.

        Args:
            category: API category
            endpoint: Specific endpoint
            search: Search query
            field: Field to count by
            exact: Use exact phrase matching

        Returns:
            Count results
        """
        count_field = f"{field}.exact" if exact and not field.endswith(".exact") else field
        return self.query(category, endpoint, search=search, count=count_field)

    def get_date_range_data(self, category: str, endpoint: str,
                           date_field: str, days_back: int = 30,
                           additional_search: Optional[str] = None) -> List[Dict]:
        """
        Get data for a specific date range.

        Args:
            category: API category
            endpoint: Specific endpoint
            date_field: Date field name
            days_back: Number of days to look back
            additional_search: Additional search criteria

        Returns:
            List of results
        """
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days_back)

        date_range = f"[{start_date.strftime('%Y%m%d')}+TO+{end_date.strftime('%Y%m%d')}]"
        search = f"{date_field}:{date_range}"

        if additional_search:
            search = f"{search}+AND+{additional_search}"

        return self.query_all(category, endpoint, search=search)


def main():
    """Example usage."""
    import os

    # Get API key from environment or use None
    api_key = os.environ.get("FDA_API_KEY")

    # Initialize client
    fda = FDAQuery(api_key=api_key)

    # Example 1: Query drug adverse events
    print("Querying aspirin adverse events...")
    events = fda.query_drug_events("aspirin", limit=10)
    if "results" in events:
        print(f"Found {len(events['results'])} events")

    # Example 2: Count reactions
    print("\nCounting reactions...")
    counts = fda.count_by_field(
        "drug", "event",
        search="patient.drug.medicinalproduct:aspirin",
        field="patient.reaction.reactionmeddrapt"
    )
    if "results" in counts:
        for item in counts["results"][:5]:
            print(f"  {item['term']}: {item['count']}")

    # Example 3: Get drug label
    print("\nGetting drug label...")
    label = fda.query_drug_label("Lipitor", brand=True)
    if "results" in label and len(label["results"]) > 0:
        result = label["results"][0]
        if "indications_and_usage" in result:
            print(f"  Indications: {result['indications_and_usage'][0][:200]}...")


if __name__ == "__main__":
    main()
