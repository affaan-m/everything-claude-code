#!/usr/bin/env python3
"""
BibTeX Formatter and Cleaner
Format, clean, sort, and deduplicate BibTeX files.
"""

import sys
import re
import argparse
from typing import List, Dict, Tuple
from collections import OrderedDict

class BibTeXFormatter:
    """Format and clean BibTeX entries."""
    
    def __init__(self):
        # Standard field order for readability
        self.field_order = [
            'author', 'editor', 'title', 'booktitle', 'journal',
            'year', 'month', 'volume', 'number', 'pages',
            'publisher', 'address', 'edition', 'series',
            'school', 'institution', 'organization',
            'howpublished', 'doi', 'url', 'isbn', 'issn',
            'note', 'abstract', 'keywords'
        ]
    
    def parse_bibtex_file(self, filepath: str) -> List[Dict]:
        """
        Parse BibTeX file and extract entries.
        
        Args:
            filepath: Path to BibTeX file
            
        Returns:
            List of entry dictionaries
        """
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f'Error reading file: {e}', file=sys.stderr)
            return []
        
        entries = []
        
        # Match BibTeX entries
        pattern = r'@(\w+)\s*\{\s*([^,\s]+)\s*,(.*?)\n\}'
        matches = re.finditer(pattern, content, re.DOTALL | re.IGNORECASE)
        
        for match in matches:
            entry_type = match.group(1).lower()
            citation_key = match.group(2).strip()
            fields_text = match.group(3)
            
            # Parse fields
            fields = OrderedDict()
            field_pattern = r'(\w+)\s*=\s*\{([^}]*)\}|(\w+)\s*=\s*"([^"]*)"'
            field_matches = re.finditer(field_pattern, fields_text)
            
            for field_match in field_matches:
                if field_match.group(1):
                    field_name = field_match.group(1).lower()
                    field_value = field_match.group(2)
                else:
                    field_name = field_match.group(3).lower()
                    field_value = field_match.group(4)
                
                fields[field_name] = field_value.strip()
            
            entries.append({
                'type': entry_type,
                'key': citation_key,
                'fields': fields
            })
        
        return entries
    
    def format_entry(self, entry: Dict) -> str:
        """
        Format a single BibTeX entry.
        
        Args:
            entry: Entry dictionary
            
        Returns:
            Formatted BibTeX string
        """
        lines = [f'@{entry["type"]}{{{entry["key"]},']
        
        # Order fields according to standard order
        ordered_fields = OrderedDict()
        
        # Add fields in standard order
        for field_name in self.field_order:
            if field_name in entry['fields']:
                ordered_fields[field_name] = entry['fields'][field_name]
        
        # Add any remaining fields
        for field_name, field_value in entry['fields'].items():
            if field_name not in ordered_fields:
                ordered_fields[field_name] = field_value
        
        # Format each field
        max_field_len = max(len(f) for f in ordered_fields.keys()) if ordered_fields else 0
        
        for field_name, field_value in ordered_fields.items():
            # Pad field name for alignment
            padded_field = field_name.ljust(max_field_len)
            lines.append(f'  {padded_field} = {{{field_value}}},')
        
        # Remove trailing comma from last field
        if lines[-1].endswith(','):
            lines[-1] = lines[-1][:-1]
        
        lines.append('}')
        
        return '\n'.join(lines)
    
    def fix_common_issues(self, entry: Dict) -> Dict:
        """
        Fix common formatting issues in entry.
        
        Args:
            entry: Entry dictionary
            
        Returns:
            Fixed entry dictionary
        """
        fixed = entry.copy()
        fields = fixed['fields'].copy()
        
        # Fix page ranges (single hyphen to double hyphen)
        if 'pages' in fields:
            pages = fields['pages']
            # Replace single hyphen with double hyphen if it's a range
            if re.search(r'\d-\d', pages) and '--' not in pages:
                pages = re.sub(r'(\d)-(\d)', r'\1--\2', pages)
                fields['pages'] = pages
        
        # Remove "pp." from pages
        if 'pages' in fields:
            pages = fields['pages']
            pages = re.sub(r'^pp\.\s*', '', pages, flags=re.IGNORECASE)
            fields['pages'] = pages
        
        # Fix DOI (remove URL prefix if present)
        if 'doi' in fields:
            doi = fields['doi']
            doi = doi.replace('https://doi.org/', '')
            doi = doi.replace('http://doi.org/', '')
            doi = doi.replace('doi:', '')
            fields['doi'] = doi
        
        # Fix author separators (semicolon or ampersand to 'and')
        if 'author' in fields:
            author = fields['author']
            author = author.replace(';', ' and')
            author = author.replace(' & ', ' and ')
            # Clean up multiple 'and's
            author = re.sub(r'\s+and\s+and\s+', ' and ', author)
            fields['author'] = author
        
        fixed['fields'] = fields
        return fixed
    
    def deduplicate_entries(self, entries: List[Dict]) -> List[Dict]:
        """
        Remove duplicate entries based on DOI or citation key.
        
        Args:
            entries: List of entry dictionaries
            
        Returns:
            List of unique entries
        """
        seen_dois = set()
        seen_keys = set()
        unique_entries = []
        
        for entry in entries:
            doi = entry['fields'].get('doi', '').strip()
            key = entry['key']
            
            # Check DOI first (more reliable)
            if doi:
                if doi in seen_dois:
                    print(f'Duplicate DOI found: {doi} (skipping {key})', file=sys.stderr)
                    continue
                seen_dois.add(doi)
            
            # Check citation key
            if key in seen_keys:
                print(f'Duplicate citation key found: {key} (skipping)', file=sys.stderr)
                continue
            seen_keys.add(key)
            
            unique_entries.append(entry)
        
        return unique_entries
    
    def sort_entries(self, entries: List[Dict], sort_by: str = 'key', descending: bool = False) -> List[Dict]:
        """
        Sort entries by specified field.
        
        Args:
            entries: List of entry dictionaries
            sort_by: Field to sort by ('key', 'year', 'author', 'title')
            descending: Sort in descending order
            
        Returns:
            Sorted list of entries
        """
        def get_sort_key(entry: Dict) -> str:
            if sort_by == 'key':
                return entry['key'].lower()
            elif sort_by == 'year':
                year = entry['fields'].get('year', '9999')
                return year
            elif sort_by == 'author':
                author = entry['fields'].get('author', 'ZZZ')
                # Get last name of first author
                if ',' in author:
                    return author.split(',')[0].lower()
                else:
                    return author.split()[0].lower() if author else 'zzz'
            elif sort_by == 'title':
                return entry['fields'].get('title', '').lower()
            else:
                return entry['key'].lower()
        
        return sorted(entries, key=get_sort_key, reverse=descending)
    
    def format_file(self, filepath: str, output: str = None,
                   deduplicate: bool = False, sort_by: str = None,
                   descending: bool = False, fix_issues: bool = True) -> None:
        """
        Format entire BibTeX file.
        
        Args:
            filepath: Input BibTeX file
            output: Output file (None for in-place)
            deduplicate: Remove duplicates
            sort_by: Field to sort by
            descending: Sort in descending order
            fix_issues: Fix common formatting issues
        """
        print(f'Parsing {filepath}...', file=sys.stderr)
        entries = self.parse_bibtex_file(filepath)
        
        if not entries:
            print('No entries found', file=sys.stderr)
            return
        
        print(f'Found {len(entries)} entries', file=sys.stderr)
        
        # Fix common issues
        if fix_issues:
            print('Fixing common issues...', file=sys.stderr)
            entries = [self.fix_common_issues(e) for e in entries]
        
        # Deduplicate
        if deduplicate:
            print('Removing duplicates...', file=sys.stderr)
            original_count = len(entries)
            entries = self.deduplicate_entries(entries)
            removed = original_count - len(entries)
            if removed > 0:
                print(f'Removed {removed} duplicate(s)', file=sys.stderr)
        
        # Sort
        if sort_by:
            print(f'Sorting by {sort_by}...', file=sys.stderr)
            entries = self.sort_entries(entries, sort_by, descending)
        
        # Format entries
        print('Formatting entries...', file=sys.stderr)
        formatted_entries = [self.format_entry(e) for e in entries]
        
        # Write output
        output_content = '\n\n'.join(formatted_entries) + '\n'
        
        output_file = output or filepath
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(output_content)
            print(f'Successfully wrote {len(entries)} entries to {output_file}', file=sys.stderr)
        except Exception as e:
            print(f'Error writing file: {e}', file=sys.stderr)
            sys.exit(1)


def main():
    """Command-line interface."""
    parser = argparse.ArgumentParser(
        description='Format, clean, sort, and deduplicate BibTeX files',
        epilog='Example: python format_bibtex.py references.bib --deduplicate --sort year'
    )
    
    parser.add_argument(
        'file',
        help='BibTeX file to format'
    )
    
    parser.add_argument(
        '-o', '--output',
        help='Output file (default: overwrite input file)'
    )
    
    parser.add_argument(
        '--deduplicate',
        action='store_true',
        help='Remove duplicate entries'
    )
    
    parser.add_argument(
        '--sort',
        choices=['key', 'year', 'author', 'title'],
        help='Sort entries by field'
    )
    
    parser.add_argument(
        '--descending',
        action='store_true',
        help='Sort in descending order'
    )
    
    parser.add_argument(
        '--no-fix',
        action='store_true',
        help='Do not fix common issues'
    )
    
    args = parser.parse_args()
    
    # Format file
    formatter = BibTeXFormatter()
    formatter.format_file(
        args.file,
        output=args.output,
        deduplicate=args.deduplicate,
        sort_by=args.sort,
        descending=args.descending,
        fix_issues=not args.no_fix
    )


if __name__ == '__main__':
    main()

