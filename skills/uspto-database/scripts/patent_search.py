#!/usr/bin/env python3
"""
USPTO PatentSearch API Helper

Provides functions for searching and retrieving patent data using the USPTO
PatentSearch API (ElasticSearch-based system, replaced legacy PatentsView in May 2025).

Requires:
    - requests library: pip install requests
    - USPTO API key from https://account.uspto.gov/api-manager/

Environment variables:
    USPTO_API_KEY - Your USPTO API key
"""

import os
import sys
import json
import requests
from typing import Dict, List, Optional, Any
from datetime import datetime


class PatentSearchClient:
    """Client for USPTO PatentSearch API."""

    BASE_URL = "https://search.patentsview.org/api/v1"

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize client with API key.

        Args:
            api_key: PatentsView API key (if not provided, uses PATENTSVIEW_API_KEY env var)
        """
        self.api_key = api_key or os.getenv("PATENTSVIEW_API_KEY")
        if not self.api_key:
            raise ValueError("API key required. Set PATENTSVIEW_API_KEY environment variable or pass to constructor.")

        self.headers = {
            "X-Api-Key": self.api_key,
            "Content-Type": "application/json"
        }

    def _request(self, endpoint: str, query: Dict, fields: Optional[List[str]] = None,
                 sort: Optional[List[Dict]] = None, options: Optional[Dict] = None) -> Dict:
        """
        Make a request to the PatentSearch API.

        Args:
            endpoint: API endpoint (e.g., "patent", "inventor")
            query: Query dictionary
            fields: List of fields to return
            sort: Sort specification
            options: Pagination and other options

        Returns:
            API response as dictionary
        """
        url = f"{self.BASE_URL}/{endpoint}"

        data = {"q": query}
        if fields:
            data["f"] = fields
        if sort:
            data["s"] = sort
        if options:
            data["o"] = options

        response = requests.post(url, headers=self.headers, json=data)
        response.raise_for_status()

        return response.json()

    def search_patents(self, query: Dict, fields: Optional[List[str]] = None,
                       sort: Optional[List[Dict]] = None, page: int = 1,
                       per_page: int = 100) -> Dict:
        """
        Search for patents.

        Args:
            query: Query dictionary (see PatentSearch API docs for syntax)
            fields: Fields to return (defaults to essential fields)
            sort: Sort specification
            page: Page number
            per_page: Results per page (max 1000)

        Returns:
            Search results with patents array

        Example:
            # Search by keyword
            results = client.search_patents({
                "patent_abstract": {"_text_all": ["machine", "learning"]}
            })

            # Search by date range
            results = client.search_patents({
                "patent_date": {"_gte": "2024-01-01", "_lte": "2024-12-31"}
            })
        """
        if fields is None:
            fields = [
                "patent_id", "patent_title", "patent_date",
                "patent_abstract", "assignees",
                "inventors"
            ]

        if sort is None:
            sort = [{"patent_date": "desc"}]

        options = {"size": 100}

        return self._request("patent", query, fields, sort, options)

    def get_patent(self, patent_number: str) -> Optional[Dict]:
        """
        Get details for a specific patent by number.

        Args:
            patent_number: Patent number (with or without commas)

        Returns:
            Patent data dictionary or None if not found
        """
        # Remove commas from patent number
        patent_number = patent_number.replace(",", "")

        query = {"patent_number": patent_number}
        fields = [
            "patent_number", "patent_title", "patent_date", "patent_abstract",
            "patent_type", "inventor_name", "assignee_organization",
            "cpc_subclass_id", "cited_patent_number", "citedby_patent_number"
        ]

        result = self._request("patent", query, fields)

        if result.get("patents"):
            return result["patents"][0]
        return None

    def search_by_inventor(self, inventor_name: str, **kwargs) -> Dict:
        """
        Search patents by inventor name.

        Args:
            inventor_name: Inventor name (use _text_phrase for exact match)
            **kwargs: Additional search parameters

        Returns:
            Search results
        """
        query = {"inventor_name": {"_text_phrase": inventor_name}}
        return self.search_patents(query, **kwargs)

    def search_by_assignee(self, assignee_name: str, **kwargs) -> Dict:
        """
        Search patents by assignee/company name.

        Args:
            assignee_name: Assignee/company name
            **kwargs: Additional search parameters

        Returns:
            Search results
        """
        query = {"assignee_organization": {"_text_any": assignee_name.split()}}
        return self.search_patents(query, **kwargs)

    def search_by_classification(self, cpc_code: str, **kwargs) -> Dict:
        """
        Search patents by CPC classification code.

        Args:
            cpc_code: CPC subclass code (e.g., "H04N", "G06F")
            **kwargs: Additional search parameters

        Returns:
            Search results
        """
        query = {"cpc_subclass_id": cpc_code}
        return self.search_patents(query, **kwargs)

    def search_by_date_range(self, start_date: str, end_date: str, **kwargs) -> Dict:
        """
        Search patents by date range.

        Args:
            start_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD)
            **kwargs: Additional search parameters

        Returns:
            Search results
        """
        query = {
            "patent_date": {
                "_gte": start_date,
                "_lte": end_date
            }
        }
        return self.search_patents(query, **kwargs)

    def advanced_search(self, keywords: List[str], assignee: Optional[str] = None,
                        start_date: Optional[str] = None, end_date: Optional[str] = None,
                        cpc_codes: Optional[List[str]] = None, **kwargs) -> Dict:
        """
        Perform advanced search with multiple criteria.

        Args:
            keywords: List of keywords to search in abstract/title
            assignee: Assignee/company name
            start_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD)
            cpc_codes: List of CPC classification codes
            **kwargs: Additional search parameters

        Returns:
            Search results
        """
        conditions = []

        # Keyword search in abstract
        if keywords:
            conditions.append({
                "patent_abstract": {"_text_all": keywords}
            })

        # Assignee filter
        if assignee:
            conditions.append({
                "assignee_organization": {"_text_any": assignee.split()}
            })

        # Date range
        if start_date and end_date:
            conditions.append({
                "patent_date": {"_gte": start_date, "_lte": end_date}
            })

        # CPC classification
        if cpc_codes:
            conditions.append({
                "cpc_subclass_id": cpc_codes
            })

        query = {"_and": conditions} if len(conditions) > 1 else conditions[0]

        return self.search_patents(query, **kwargs)


def main():
    """Command-line interface for patent search."""
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python patent_search.py <patent_number>")
        print("  python patent_search.py --inventor <name>")
        print("  python patent_search.py --assignee <company>")
        print("  python patent_search.py --keywords <word1> <word2> ...")
        sys.exit(1)

    client = PatentSearchClient()

    try:
        if sys.argv[1] == "--inventor":
            results = client.search_by_inventor(" ".join(sys.argv[2:]))
        elif sys.argv[1] == "--assignee":
            results = client.search_by_assignee(" ".join(sys.argv[2:]))
        elif sys.argv[1] == "--keywords":
            query = {"patent_abstract": {"_text_all": sys.argv[2:]}}
            results = client.search_patents(query)
        else:
            # Assume patent number
            patent = client.get_patent(sys.argv[1])
            if patent:
                results = {"patents": [patent], "count": 1, "total_hits": 1}
            else:
                print(f"Patent {sys.argv[1]} not found")
                sys.exit(1)

        # Print results
        print(json.dumps(results, indent=2))

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
