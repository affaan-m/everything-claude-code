#!/usr/bin/env python3
"""
arXiv Search Tool
Search and retrieve preprints from arXiv via the Atom API.
Supports keyword search, author search, category filtering, ID lookup, and PDF download.
"""

import requests
import json
import argparse
import xml.etree.ElementTree as ET
import time
import sys
import os
import re
from typing import List, Dict, Optional
from urllib.parse import quote


class ArxivSearcher:
    """Search interface for arXiv preprints via the Atom API."""

    BASE_URL = "http://export.arxiv.org/api/query"
    ATOM_NS = "{http://www.w3.org/2005/Atom}"
    ARXIV_NS = "{http://arxiv.org/schemas/atom}"

    VALID_SORT_BY = ["relevance", "lastUpdatedDate", "submittedDate"]
    VALID_SORT_ORDER = ["ascending", "descending"]
    VALID_SEARCH_FIELDS = ["ti", "au", "abs", "co", "jr", "cat", "all", "id"]

    def __init__(self, verbose: bool = False, delay: float = 3.0):
        self.verbose = verbose
        self.delay = delay
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "ArxivSearchTool/1.0 (scientific-skills)"
        })
        self._last_request_time = 0.0

    def _log(self, message: str):
        if self.verbose:
            print(f"[INFO] {message}", file=sys.stderr)

    def _rate_limit(self):
        """Enforce minimum delay between requests."""
        elapsed = time.time() - self._last_request_time
        if elapsed < self.delay:
            wait = self.delay - elapsed
            self._log(f"Rate limiting: waiting {wait:.1f}s")
            time.sleep(wait)
        self._last_request_time = time.time()

    def _parse_entry(self, entry: ET.Element) -> Dict:
        """Parse a single Atom entry into a dict."""
        def text(tag, ns=None):
            ns = ns or self.ATOM_NS
            el = entry.find(f"{ns}{tag}")
            return el.text.strip() if el is not None and el.text else ""

        # Authors
        authors = []
        for author_el in entry.findall(f"{self.ATOM_NS}author"):
            name_el = author_el.find(f"{self.ATOM_NS}name")
            if name_el is not None and name_el.text:
                authors.append(name_el.text.strip())

        # Categories
        categories = []
        primary_category = ""
        for cat_el in entry.findall(f"{self.ATOM_NS}category"):
            term = cat_el.get("term", "")
            if term:
                categories.append(term)
        prim_el = entry.find(f"{self.ARXIV_NS}primary_category")
        if prim_el is not None:
            primary_category = prim_el.get("term", "")

        # Links
        pdf_url = ""
        abs_url = ""
        for link_el in entry.findall(f"{self.ATOM_NS}link"):
            href = link_el.get("href", "")
            link_type = link_el.get("type", "")
            link_title = link_el.get("title", "")
            if link_title == "pdf" or link_type == "application/pdf":
                pdf_url = href
            elif link_type == "text/html" or (not link_type and "/abs/" in href):
                abs_url = href

        # Extract arXiv ID from the Atom id field
        raw_id = text("id")
        arxiv_id = re.sub(r"^https?://arxiv\.org/abs/", "", raw_id)
        # Strip version suffix for the canonical ID
        arxiv_id_bare = re.sub(r"v\d+$", "", arxiv_id)

        return {
            "arxiv_id": arxiv_id_bare,
            "title": " ".join(text("title").split()),  # collapse whitespace
            "authors": authors,
            "abstract": " ".join(text("summary").split()),
            "categories": categories,
            "primary_category": primary_category,
            "published": text("published"),
            "updated": text("updated"),
            "doi": text("doi", self.ARXIV_NS),
            "comment": text("comment", self.ARXIV_NS),
            "journal_ref": text("journal_ref", self.ARXIV_NS),
            "pdf_url": pdf_url,
            "abs_url": abs_url or f"http://arxiv.org/abs/{arxiv_id}",
        }

    def _fetch(self, params: Dict) -> List[Dict]:
        """Execute API request and parse results."""
        self._rate_limit()
        self._log(f"Query params: {params}")

        try:
            response = self.session.get(self.BASE_URL, params=params, timeout=30)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            self._log(f"Request error: {e}")
            return []

        root = ET.fromstring(response.text)
        entries = root.findall(f"{self.ATOM_NS}entry")
        self._log(f"Parsed {len(entries)} entries")

        results = []
        for entry in entries:
            parsed = self._parse_entry(entry)
            # Skip the "no results" placeholder entry arXiv returns
            if not parsed["title"] or parsed["arxiv_id"] == "":
                continue
            results.append(parsed)

        return results

    def search(
        self,
        query: str,
        max_results: int = 50,
        start: int = 0,
        sort_by: str = "relevance",
        sort_order: str = "descending",
    ) -> List[Dict]:
        """
        Search arXiv with a query string.

        Args:
            query: arXiv query string (e.g., "ti:transformer AND cat:cs.LG")
            max_results: Maximum number of results (max 300 per request)
            start: Starting index for pagination
            sort_by: One of "relevance", "lastUpdatedDate", "submittedDate"
            sort_order: "ascending" or "descending"

        Returns:
            List of paper dicts
        """
        if sort_by not in self.VALID_SORT_BY:
            raise ValueError(f"sort_by must be one of {self.VALID_SORT_BY}")
        if sort_order not in self.VALID_SORT_ORDER:
            raise ValueError(f"sort_order must be one of {self.VALID_SORT_ORDER}")

        max_results = min(max_results, 300)

        params = {
            "search_query": query,
            "start": start,
            "max_results": max_results,
            "sortBy": sort_by,
            "sortOrder": sort_order,
        }

        return self._fetch(params)

    def get_by_ids(self, arxiv_ids: List[str]) -> List[Dict]:
        """
        Retrieve papers by their arXiv IDs.

        Args:
            arxiv_ids: List of arXiv IDs (e.g., ["2309.10668", "2406.04093"])

        Returns:
            List of paper dicts
        """
        # Clean IDs: strip URLs, versions
        clean_ids = []
        for aid in arxiv_ids:
            aid = re.sub(r"^https?://arxiv\.org/abs/", "", aid.strip())
            aid = re.sub(r"v\d+$", "", aid)
            clean_ids.append(aid)

        params = {
            "id_list": ",".join(clean_ids),
            "max_results": len(clean_ids),
        }

        return self._fetch(params)

    def download_pdf(self, arxiv_id: str, output_path: str) -> bool:
        """
        Download a paper's PDF.

        Args:
            arxiv_id: arXiv ID (e.g., "2309.10668")
            output_path: File path or directory to save to

        Returns:
            True if successful
        """
        arxiv_id = re.sub(r"^https?://arxiv\.org/abs/", "", arxiv_id.strip())
        arxiv_id = re.sub(r"v\d+$", "", arxiv_id)

        pdf_url = f"http://arxiv.org/pdf/{arxiv_id}"
        self._log(f"Downloading: {pdf_url}")

        # If output_path is a directory, generate filename
        if os.path.isdir(output_path):
            filename = arxiv_id.replace("/", "_") + ".pdf"
            output_path = os.path.join(output_path, filename)

        self._rate_limit()

        try:
            response = self.session.get(pdf_url, timeout=60)
            response.raise_for_status()

            os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
            with open(output_path, "wb") as f:
                f.write(response.content)

            self._log(f"Saved to: {output_path}")
            return True
        except Exception as e:
            self._log(f"Download error: {e}")
            return False

    @staticmethod
    def build_query(
        title: Optional[str] = None,
        author: Optional[str] = None,
        abstract: Optional[str] = None,
        category: Optional[str] = None,
        all_fields: Optional[str] = None,
    ) -> str:
        """
        Build an arXiv query string from components.

        Args:
            title: Search in title
            author: Search by author name
            abstract: Search in abstract
            category: Filter by category (e.g., "cs.LG")
            all_fields: Search all fields

        Returns:
            arXiv query string
        """
        parts = []
        if all_fields:
            parts.append(f"all:{all_fields}")
        if title:
            parts.append(f"ti:{title}")
        if author:
            parts.append(f"au:{author}")
        if abstract:
            parts.append(f"abs:{abstract}")
        if category:
            parts.append(f"cat:{category}")

        return " AND ".join(parts)


def main():
    parser = argparse.ArgumentParser(
        description="Search arXiv preprints",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s --keywords "sparse autoencoder" --category cs.LG --max-results 20
  %(prog)s --author "Anthropic" --max-results 50
  %(prog)s --ids 2309.10668 2406.04093
  %(prog)s --query "ti:GRPO AND cat:cs.LG" --sort-by submittedDate
  %(prog)s --ids 2309.10668 --download-pdf papers/
        """,
    )

    parser.add_argument("--verbose", "-v", action="store_true")

    search_group = parser.add_argument_group("Search options")
    search_group.add_argument("--keywords", "-k", nargs="+", help="Keywords to search")
    search_group.add_argument("--author", "-a", help="Author name")
    search_group.add_argument("--ids", nargs="+", help="arXiv IDs to look up")
    search_group.add_argument("--query", "-q", help="Raw arXiv query string")
    search_group.add_argument(
        "--search-field",
        choices=ArxivSearcher.VALID_SEARCH_FIELDS,
        default="all",
        help="Field to search keywords in (default: all)",
    )

    filter_group = parser.add_argument_group("Filter options")
    filter_group.add_argument("--category", "-c", help="arXiv category (e.g., cs.LG)")
    filter_group.add_argument("--max-results", type=int, default=50, help="Max results (default: 50, max: 300)")
    filter_group.add_argument(
        "--sort-by",
        choices=ArxivSearcher.VALID_SORT_BY,
        default="relevance",
        help="Sort order (default: relevance)",
    )
    filter_group.add_argument(
        "--sort-order",
        choices=ArxivSearcher.VALID_SORT_ORDER,
        default="descending",
    )

    output_group = parser.add_argument_group("Output options")
    output_group.add_argument("--output", "-o", help="Output JSON file (default: stdout)")
    output_group.add_argument("--download-pdf", help="Download PDFs to this directory")

    args = parser.parse_args()
    searcher = ArxivSearcher(verbose=args.verbose)

    # --- ID lookup ---
    if args.ids:
        if args.download_pdf:
            for aid in args.ids:
                searcher.download_pdf(aid, args.download_pdf)
            return 0

        results = searcher.get_by_ids(args.ids)
        query_desc = f"id_list:{','.join(args.ids)}"

    # --- Raw query ---
    elif args.query:
        query = args.query
        if args.category and f"cat:{args.category}" not in query:
            query = f"({query}) AND cat:{args.category}"

        results = searcher.search(
            query=query,
            max_results=args.max_results,
            sort_by=args.sort_by,
            sort_order=args.sort_order,
        )
        query_desc = query

    # --- Keyword search ---
    elif args.keywords:
        field = args.search_field
        keyword_parts = [f'{field}:"{kw}"' if " " in kw else f"{field}:{kw}" for kw in args.keywords]
        query = " AND ".join(keyword_parts)
        if args.category:
            query = f"({query}) AND cat:{args.category}"

        results = searcher.search(
            query=query,
            max_results=args.max_results,
            sort_by=args.sort_by,
            sort_order=args.sort_order,
        )
        query_desc = query

    # --- Author search ---
    elif args.author:
        query = f'au:"{args.author}"'
        if args.category:
            query = f"{query} AND cat:{args.category}"

        results = searcher.search(
            query=query,
            max_results=args.max_results,
            sort_by=args.sort_by,
            sort_order=args.sort_order,
        )
        query_desc = query

    # --- Category browse ---
    elif args.category:
        query = f"cat:{args.category}"
        results = searcher.search(
            query=query,
            max_results=args.max_results,
            sort_by=args.sort_by or "submittedDate",
            sort_order=args.sort_order,
        )
        query_desc = query

    else:
        parser.error("Provide --keywords, --author, --ids, --query, or --category")
        return 1

    # Output
    output_data = {
        "query": query_desc,
        "result_count": len(results),
        "results": results,
    }

    output_json = json.dumps(output_data, indent=2, ensure_ascii=False)

    if args.output:
        os.makedirs(os.path.dirname(args.output) or ".", exist_ok=True)
        with open(args.output, "w") as f:
            f.write(output_json)
        print(f"Results written to {args.output}", file=sys.stderr)
    else:
        print(output_json)

    return 0


if __name__ == "__main__":
    sys.exit(main())
