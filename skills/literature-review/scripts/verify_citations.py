#!/usr/bin/env python3
"""
Citation Verification Script
Verifies DOIs, URLs, and citation metadata for accuracy.
"""

import re
import requests
import json
from typing import Dict, List, Tuple
from urllib.parse import urlparse
import time

class CitationVerifier:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'CitationVerifier/1.0 (Literature Review Tool)'
        })

    def extract_dois(self, text: str) -> List[str]:
        """Extract all DOIs from text."""
        doi_pattern = r'10\.\d{4,}/[^\s\]\)"]+'
        return re.findall(doi_pattern, text)

    def verify_doi(self, doi: str) -> Tuple[bool, Dict]:
        """
        Verify a DOI and retrieve metadata.
        Returns (is_valid, metadata)
        """
        try:
            url = f"https://doi.org/api/handles/{doi}"
            response = self.session.get(url, timeout=10)

            if response.status_code == 200:
                # DOI exists, now get metadata from CrossRef
                metadata = self._get_crossref_metadata(doi)
                return True, metadata
            else:
                return False, {}
        except Exception as e:
            return False, {"error": str(e)}

    def _get_crossref_metadata(self, doi: str) -> Dict:
        """Get metadata from CrossRef API."""
        try:
            url = f"https://api.crossref.org/works/{doi}"
            response = self.session.get(url, timeout=10)

            if response.status_code == 200:
                data = response.json()
                message = data.get('message', {})

                # Extract key metadata
                metadata = {
                    'title': message.get('title', [''])[0],
                    'authors': self._format_authors(message.get('author', [])),
                    'year': self._extract_year(message),
                    'journal': message.get('container-title', [''])[0],
                    'volume': message.get('volume', ''),
                    'pages': message.get('page', ''),
                    'doi': doi
                }
                return metadata
            return {}
        except Exception as e:
            return {"error": str(e)}

    def _format_authors(self, authors: List[Dict]) -> str:
        """Format author list."""
        if not authors:
            return ""

        formatted = []
        for author in authors[:3]:  # First 3 authors
            given = author.get('given', '')
            family = author.get('family', '')
            if family:
                formatted.append(f"{family}, {given[0]}." if given else family)

        if len(authors) > 3:
            formatted.append("et al.")

        return ", ".join(formatted)

    def _extract_year(self, message: Dict) -> str:
        """Extract publication year."""
        date_parts = message.get('published-print', {}).get('date-parts', [[]])
        if not date_parts or not date_parts[0]:
            date_parts = message.get('published-online', {}).get('date-parts', [[]])

        if date_parts and date_parts[0]:
            return str(date_parts[0][0])
        return ""

    def verify_url(self, url: str) -> Tuple[bool, int]:
        """
        Verify a URL is accessible.
        Returns (is_accessible, status_code)
        """
        try:
            response = self.session.head(url, timeout=10, allow_redirects=True)
            is_accessible = response.status_code < 400
            return is_accessible, response.status_code
        except Exception as e:
            return False, 0

    def verify_citations_in_file(self, filepath: str) -> Dict:
        """
        Verify all citations in a markdown file.
        Returns a report of verification results.
        """
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        dois = self.extract_dois(content)

        report = {
            'total_dois': len(dois),
            'verified': [],
            'failed': [],
            'metadata': {}
        }

        for doi in dois:
            print(f"Verifying DOI: {doi}")
            is_valid, metadata = self.verify_doi(doi)

            if is_valid:
                report['verified'].append(doi)
                report['metadata'][doi] = metadata
            else:
                report['failed'].append(doi)

            time.sleep(0.5)  # Rate limiting

        return report

    def format_citation_apa(self, metadata: Dict) -> str:
        """Format citation in APA style."""
        authors = metadata.get('authors', '')
        year = metadata.get('year', 'n.d.')
        title = metadata.get('title', '')
        journal = metadata.get('journal', '')
        volume = metadata.get('volume', '')
        pages = metadata.get('pages', '')
        doi = metadata.get('doi', '')

        citation = f"{authors} ({year}). {title}. "
        if journal:
            citation += f"*{journal}*"
        if volume:
            citation += f", *{volume}*"
        if pages:
            citation += f", {pages}"
        if doi:
            citation += f". https://doi.org/{doi}"

        return citation

    def format_citation_nature(self, metadata: Dict) -> str:
        """Format citation in Nature style."""
        authors = metadata.get('authors', '')
        title = metadata.get('title', '')
        journal = metadata.get('journal', '')
        volume = metadata.get('volume', '')
        pages = metadata.get('pages', '')
        year = metadata.get('year', '')

        citation = f"{authors} {title}. "
        if journal:
            citation += f"*{journal}* "
        if volume:
            citation += f"**{volume}**, "
        if pages:
            citation += f"{pages} "
        if year:
            citation += f"({year})"

        return citation

def main():
    """Example usage."""
    import sys

    if len(sys.argv) < 2:
        print("Usage: python verify_citations.py <markdown_file>")
        sys.exit(1)

    filepath = sys.argv[1]
    verifier = CitationVerifier()

    print(f"Verifying citations in: {filepath}")
    report = verifier.verify_citations_in_file(filepath)

    print("\n" + "="*60)
    print("CITATION VERIFICATION REPORT")
    print("="*60)
    print(f"\nTotal DOIs found: {report['total_dois']}")
    print(f"Verified: {len(report['verified'])}")
    print(f"Failed: {len(report['failed'])}")

    if report['failed']:
        print("\nFailed DOIs:")
        for doi in report['failed']:
            print(f"  - {doi}")

    if report['metadata']:
        print("\n\nVerified Citations (APA format):")
        for doi, metadata in report['metadata'].items():
            citation = verifier.format_citation_apa(metadata)
            print(f"\n{citation}")

    # Save detailed report
    output_file = filepath.replace('.md', '_citation_report.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2)

    print(f"\n\nDetailed report saved to: {output_file}")

if __name__ == "__main__":
    main()
