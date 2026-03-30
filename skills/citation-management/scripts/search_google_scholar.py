#!/usr/bin/env python3
"""
Google Scholar Search Tool
Search Google Scholar and export results.

Note: This script requires the 'scholarly' library.
Install with: pip install scholarly
"""

import sys
import argparse
import json
import time
import random
from typing import List, Dict, Optional

try:
    from scholarly import scholarly, ProxyGenerator
    SCHOLARLY_AVAILABLE = True
except ImportError:
    SCHOLARLY_AVAILABLE = False
    print('Warning: scholarly library not installed. Install with: pip install scholarly', file=sys.stderr)

class GoogleScholarSearcher:
    """Search Google Scholar using scholarly library."""
    
    def __init__(self, use_proxy: bool = False):
        """
        Initialize searcher.
        
        Args:
            use_proxy: Use free proxy (helps avoid rate limiting)
        """
        if not SCHOLARLY_AVAILABLE:
            raise ImportError('scholarly library required. Install with: pip install scholarly')
        
        # Setup proxy if requested
        if use_proxy:
            try:
                pg = ProxyGenerator()
                pg.FreeProxies()
                scholarly.use_proxy(pg)
                print('Using free proxy', file=sys.stderr)
            except Exception as e:
                print(f'Warning: Could not setup proxy: {e}', file=sys.stderr)
    
    def search(self, query: str, max_results: int = 50,
               year_start: Optional[int] = None, year_end: Optional[int] = None,
               sort_by: str = 'relevance') -> List[Dict]:
        """
        Search Google Scholar.
        
        Args:
            query: Search query
            max_results: Maximum number of results
            year_start: Start year filter
            year_end: End year filter
            sort_by: Sort order ('relevance' or 'citations')
            
        Returns:
            List of result dictionaries
        """
        if not SCHOLARLY_AVAILABLE:
            print('Error: scholarly library not installed', file=sys.stderr)
            return []
        
        print(f'Searching Google Scholar: {query}', file=sys.stderr)
        print(f'Max results: {max_results}', file=sys.stderr)
        
        results = []
        
        try:
            # Perform search
            search_query = scholarly.search_pubs(query)
            
            for i, result in enumerate(search_query):
                if i >= max_results:
                    break
                
                print(f'Retrieved {i+1}/{max_results}', file=sys.stderr)
                
                # Extract metadata
                metadata = {
                    'title': result.get('bib', {}).get('title', ''),
                    'authors': ', '.join(result.get('bib', {}).get('author', [])),
                    'year': result.get('bib', {}).get('pub_year', ''),
                    'venue': result.get('bib', {}).get('venue', ''),
                    'abstract': result.get('bib', {}).get('abstract', ''),
                    'citations': result.get('num_citations', 0),
                    'url': result.get('pub_url', ''),
                    'eprint_url': result.get('eprint_url', ''),
                }
                
                # Filter by year
                if year_start or year_end:
                    try:
                        pub_year = int(metadata['year']) if metadata['year'] else 0
                        if year_start and pub_year < year_start:
                            continue
                        if year_end and pub_year > year_end:
                            continue
                    except ValueError:
                        pass
                
                results.append(metadata)
                
                # Rate limiting to avoid blocking
                time.sleep(random.uniform(2, 5))
            
        except Exception as e:
            print(f'Error during search: {e}', file=sys.stderr)
        
        # Sort if requested
        if sort_by == 'citations' and results:
            results.sort(key=lambda x: x.get('citations', 0), reverse=True)
        
        return results
    
    def metadata_to_bibtex(self, metadata: Dict) -> str:
        """Convert metadata to BibTeX format."""
        # Generate citation key
        if metadata.get('authors'):
            first_author = metadata['authors'].split(',')[0].strip()
            last_name = first_author.split()[-1] if first_author else 'Unknown'
        else:
            last_name = 'Unknown'
        
        year = metadata.get('year', 'XXXX')
        
        # Get keyword from title
        import re
        title = metadata.get('title', '')
        words = re.findall(r'\b[a-zA-Z]{4,}\b', title)
        keyword = words[0].lower() if words else 'paper'
        
        citation_key = f'{last_name}{year}{keyword}'
        
        # Determine entry type (guess based on venue)
        venue = metadata.get('venue', '').lower()
        if 'proceedings' in venue or 'conference' in venue:
            entry_type = 'inproceedings'
            venue_field = 'booktitle'
        else:
            entry_type = 'article'
            venue_field = 'journal'
        
        # Build BibTeX
        lines = [f'@{entry_type}{{{citation_key},']
        
        # Convert authors format
        if metadata.get('authors'):
            authors = metadata['authors'].replace(',', ' and')
            lines.append(f'  author  = {{{authors}}},')
        
        if metadata.get('title'):
            lines.append(f'  title   = {{{metadata["title"]}}},')
        
        if metadata.get('venue'):
            lines.append(f'  {venue_field} = {{{metadata["venue"]}}},')
        
        if metadata.get('year'):
            lines.append(f'  year    = {{{metadata["year"]}}},')
        
        if metadata.get('url'):
            lines.append(f'  url     = {{{metadata["url"]}}},')
        
        if metadata.get('citations'):
            lines.append(f'  note    = {{Cited by: {metadata["citations"]}}},')
        
        # Remove trailing comma
        if lines[-1].endswith(','):
            lines[-1] = lines[-1][:-1]
        
        lines.append('}')
        
        return '\n'.join(lines)


def main():
    """Command-line interface."""
    parser = argparse.ArgumentParser(
        description='Search Google Scholar (requires scholarly library)',
        epilog='Example: python search_google_scholar.py "machine learning" --limit 50'
    )
    
    parser.add_argument(
        'query',
        help='Search query'
    )
    
    parser.add_argument(
        '--limit',
        type=int,
        default=50,
        help='Maximum number of results (default: 50)'
    )
    
    parser.add_argument(
        '--year-start',
        type=int,
        help='Start year for filtering'
    )
    
    parser.add_argument(
        '--year-end',
        type=int,
        help='End year for filtering'
    )
    
    parser.add_argument(
        '--sort-by',
        choices=['relevance', 'citations'],
        default='relevance',
        help='Sort order (default: relevance)'
    )
    
    parser.add_argument(
        '--use-proxy',
        action='store_true',
        help='Use free proxy to avoid rate limiting'
    )
    
    parser.add_argument(
        '-o', '--output',
        help='Output file (default: stdout)'
    )
    
    parser.add_argument(
        '--format',
        choices=['json', 'bibtex'],
        default='json',
        help='Output format (default: json)'
    )
    
    args = parser.parse_args()
    
    if not SCHOLARLY_AVAILABLE:
        print('\nError: scholarly library not installed', file=sys.stderr)
        print('Install with: pip install scholarly', file=sys.stderr)
        print('\nAlternatively, use PubMed search for biomedical literature:', file=sys.stderr)
        print('  python search_pubmed.py "your query"', file=sys.stderr)
        sys.exit(1)
    
    # Search
    searcher = GoogleScholarSearcher(use_proxy=args.use_proxy)
    results = searcher.search(
        args.query,
        max_results=args.limit,
        year_start=args.year_start,
        year_end=args.year_end,
        sort_by=args.sort_by
    )
    
    if not results:
        print('No results found', file=sys.stderr)
        sys.exit(1)
    
    # Format output
    if args.format == 'json':
        output = json.dumps({
            'query': args.query,
            'count': len(results),
            'results': results
        }, indent=2)
    else:  # bibtex
        bibtex_entries = [searcher.metadata_to_bibtex(r) for r in results]
        output = '\n\n'.join(bibtex_entries) + '\n'
    
    # Write output
    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(output)
        print(f'Wrote {len(results)} results to {args.output}', file=sys.stderr)
    else:
        print(output)
    
    print(f'\nRetrieved {len(results)} results', file=sys.stderr)


if __name__ == '__main__':
    main()

