#!/usr/bin/env python3
"""
Citation Validation Tool
Validate BibTeX files for accuracy, completeness, and format compliance.
"""

import sys
import re
import requests
import argparse
import json
from typing import Dict, List, Tuple, Optional
from collections import defaultdict

class CitationValidator:
    """Validate BibTeX entries for errors and inconsistencies."""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'CitationValidator/1.0 (Citation Management Tool)'
        })
        
        # Required fields by entry type
        self.required_fields = {
            'article': ['author', 'title', 'journal', 'year'],
            'book': ['title', 'publisher', 'year'],  # author OR editor
            'inproceedings': ['author', 'title', 'booktitle', 'year'],
            'incollection': ['author', 'title', 'booktitle', 'publisher', 'year'],
            'phdthesis': ['author', 'title', 'school', 'year'],
            'mastersthesis': ['author', 'title', 'school', 'year'],
            'techreport': ['author', 'title', 'institution', 'year'],
            'misc': ['title', 'year']
        }
        
        # Recommended fields
        self.recommended_fields = {
            'article': ['volume', 'pages', 'doi'],
            'book': ['isbn'],
            'inproceedings': ['pages'],
        }
    
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
            fields = {}
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
                'fields': fields,
                'raw': match.group(0)
            })
        
        return entries
    
    def validate_entry(self, entry: Dict) -> Tuple[List[Dict], List[Dict]]:
        """
        Validate a single BibTeX entry.
        
        Args:
            entry: Entry dictionary
            
        Returns:
            Tuple of (errors, warnings)
        """
        errors = []
        warnings = []
        
        entry_type = entry['type']
        key = entry['key']
        fields = entry['fields']
        
        # Check required fields
        if entry_type in self.required_fields:
            for req_field in self.required_fields[entry_type]:
                if req_field not in fields or not fields[req_field]:
                    # Special case: book can have author OR editor
                    if entry_type == 'book' and req_field == 'author':
                        if 'editor' not in fields or not fields['editor']:
                            errors.append({
                                'type': 'missing_required_field',
                                'field': 'author or editor',
                                'severity': 'high',
                                'message': f'Entry {key}: Missing required field "author" or "editor"'
                            })
                    else:
                        errors.append({
                            'type': 'missing_required_field',
                            'field': req_field,
                            'severity': 'high',
                            'message': f'Entry {key}: Missing required field "{req_field}"'
                        })
        
        # Check recommended fields
        if entry_type in self.recommended_fields:
            for rec_field in self.recommended_fields[entry_type]:
                if rec_field not in fields or not fields[rec_field]:
                    warnings.append({
                        'type': 'missing_recommended_field',
                        'field': rec_field,
                        'severity': 'medium',
                        'message': f'Entry {key}: Missing recommended field "{rec_field}"'
                    })
        
        # Validate year
        if 'year' in fields:
            year = fields['year']
            if not re.match(r'^\d{4}$', year):
                errors.append({
                    'type': 'invalid_year',
                    'field': 'year',
                    'value': year,
                    'severity': 'high',
                    'message': f'Entry {key}: Invalid year format "{year}" (should be 4 digits)'
                })
            elif int(year) < 1600 or int(year) > 2030:
                warnings.append({
                    'type': 'suspicious_year',
                    'field': 'year',
                    'value': year,
                    'severity': 'medium',
                    'message': f'Entry {key}: Suspicious year "{year}" (outside reasonable range)'
                })
        
        # Validate DOI format
        if 'doi' in fields:
            doi = fields['doi']
            if not re.match(r'^10\.\d{4,}/[^\s]+$', doi):
                warnings.append({
                    'type': 'invalid_doi_format',
                    'field': 'doi',
                    'value': doi,
                    'severity': 'medium',
                    'message': f'Entry {key}: Invalid DOI format "{doi}"'
                })
        
        # Check for single hyphen in pages (should be --)
        if 'pages' in fields:
            pages = fields['pages']
            if re.search(r'\d-\d', pages) and '--' not in pages:
                warnings.append({
                    'type': 'page_range_format',
                    'field': 'pages',
                    'value': pages,
                    'severity': 'low',
                    'message': f'Entry {key}: Page range uses single hyphen, should use -- (en-dash)'
                })
        
        # Check author format
        if 'author' in fields:
            author = fields['author']
            if ';' in author or '&' in author:
                errors.append({
                    'type': 'invalid_author_format',
                    'field': 'author',
                    'severity': 'high',
                    'message': f'Entry {key}: Authors should be separated by " and ", not ";" or "&"'
                })
        
        return errors, warnings
    
    def verify_doi(self, doi: str) -> Tuple[bool, Optional[Dict]]:
        """
        Verify DOI resolves correctly and get metadata.
        
        Args:
            doi: Digital Object Identifier
            
        Returns:
            Tuple of (is_valid, metadata)
        """
        try:
            url = f'https://doi.org/{doi}'
            response = self.session.head(url, timeout=10, allow_redirects=True)
            
            if response.status_code < 400:
                # DOI resolves, now get metadata from CrossRef
                crossref_url = f'https://api.crossref.org/works/{doi}'
                metadata_response = self.session.get(crossref_url, timeout=10)
                
                if metadata_response.status_code == 200:
                    data = metadata_response.json()
                    message = data.get('message', {})
                    
                    # Extract key metadata
                    metadata = {
                        'title': message.get('title', [''])[0],
                        'year': self._extract_year_crossref(message),
                        'authors': self._format_authors_crossref(message.get('author', [])),
                    }
                    return True, metadata
                else:
                    return True, None  # DOI resolves but no CrossRef metadata
            else:
                return False, None
                
        except Exception:
            return False, None
    
    def detect_duplicates(self, entries: List[Dict]) -> List[Dict]:
        """
        Detect duplicate entries.
        
        Args:
            entries: List of entry dictionaries
            
        Returns:
            List of duplicate groups
        """
        duplicates = []
        
        # Check for duplicate DOIs
        doi_map = defaultdict(list)
        for entry in entries:
            doi = entry['fields'].get('doi', '').strip()
            if doi:
                doi_map[doi].append(entry['key'])
        
        for doi, keys in doi_map.items():
            if len(keys) > 1:
                duplicates.append({
                    'type': 'duplicate_doi',
                    'doi': doi,
                    'entries': keys,
                    'severity': 'high',
                    'message': f'Duplicate DOI {doi} found in entries: {", ".join(keys)}'
                })
        
        # Check for duplicate citation keys
        key_counts = defaultdict(int)
        for entry in entries:
            key_counts[entry['key']] += 1
        
        for key, count in key_counts.items():
            if count > 1:
                duplicates.append({
                    'type': 'duplicate_key',
                    'key': key,
                    'count': count,
                    'severity': 'high',
                    'message': f'Citation key "{key}" appears {count} times'
                })
        
        # Check for similar titles (possible duplicates)
        titles = {}
        for entry in entries:
            title = entry['fields'].get('title', '').lower()
            title = re.sub(r'[^\w\s]', '', title)  # Remove punctuation
            title = ' '.join(title.split())  # Normalize whitespace
            
            if title:
                if title in titles:
                    duplicates.append({
                        'type': 'similar_title',
                        'entries': [titles[title], entry['key']],
                        'severity': 'medium',
                        'message': f'Possible duplicate: "{titles[title]}" and "{entry["key"]}" have identical titles'
                    })
                else:
                    titles[title] = entry['key']
        
        return duplicates
    
    def validate_file(self, filepath: str, check_dois: bool = False) -> Dict:
        """
        Validate entire BibTeX file.
        
        Args:
            filepath: Path to BibTeX file
            check_dois: Whether to verify DOIs (slow)
            
        Returns:
            Validation report dictionary
        """
        print(f'Parsing {filepath}...', file=sys.stderr)
        entries = self.parse_bibtex_file(filepath)
        
        if not entries:
            return {
                'total_entries': 0,
                'errors': [],
                'warnings': [],
                'duplicates': []
            }
        
        print(f'Found {len(entries)} entries', file=sys.stderr)
        
        all_errors = []
        all_warnings = []
        
        # Validate each entry
        for i, entry in enumerate(entries):
            print(f'Validating entry {i+1}/{len(entries)}: {entry["key"]}', file=sys.stderr)
            errors, warnings = self.validate_entry(entry)
            
            for error in errors:
                error['entry'] = entry['key']
                all_errors.append(error)
            
            for warning in warnings:
                warning['entry'] = entry['key']
                all_warnings.append(warning)
        
        # Check for duplicates
        print('Checking for duplicates...', file=sys.stderr)
        duplicates = self.detect_duplicates(entries)
        
        # Verify DOIs if requested
        doi_errors = []
        if check_dois:
            print('Verifying DOIs...', file=sys.stderr)
            for i, entry in enumerate(entries):
                doi = entry['fields'].get('doi', '')
                if doi:
                    print(f'Verifying DOI {i+1}: {doi}', file=sys.stderr)
                    is_valid, metadata = self.verify_doi(doi)
                    
                    if not is_valid:
                        doi_errors.append({
                            'type': 'invalid_doi',
                            'entry': entry['key'],
                            'doi': doi,
                            'severity': 'high',
                            'message': f'Entry {entry["key"]}: DOI does not resolve: {doi}'
                        })
        
        all_errors.extend(doi_errors)
        
        return {
            'filepath': filepath,
            'total_entries': len(entries),
            'valid_entries': len(entries) - len([e for e in all_errors if e['severity'] == 'high']),
            'errors': all_errors,
            'warnings': all_warnings,
            'duplicates': duplicates
        }
    
    def _extract_year_crossref(self, message: Dict) -> str:
        """Extract year from CrossRef message."""
        date_parts = message.get('published-print', {}).get('date-parts', [[]])
        if not date_parts or not date_parts[0]:
            date_parts = message.get('published-online', {}).get('date-parts', [[]])
        
        if date_parts and date_parts[0]:
            return str(date_parts[0][0])
        return ''
    
    def _format_authors_crossref(self, authors: List[Dict]) -> str:
        """Format author list from CrossRef."""
        if not authors:
            return ''
        
        formatted = []
        for author in authors[:3]:  # First 3 authors
            given = author.get('given', '')
            family = author.get('family', '')
            if family:
                formatted.append(f'{family}, {given}' if given else family)
        
        if len(authors) > 3:
            formatted.append('et al.')
        
        return ', '.join(formatted)


def main():
    """Command-line interface."""
    parser = argparse.ArgumentParser(
        description='Validate BibTeX files for errors and inconsistencies',
        epilog='Example: python validate_citations.py references.bib'
    )
    
    parser.add_argument(
        'file',
        help='BibTeX file to validate'
    )
    
    parser.add_argument(
        '--check-dois',
        action='store_true',
        help='Verify DOIs resolve correctly (slow)'
    )
    
    parser.add_argument(
        '--auto-fix',
        action='store_true',
        help='Attempt to auto-fix common issues (not implemented yet)'
    )
    
    parser.add_argument(
        '--report',
        help='Output file for JSON validation report'
    )
    
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Show detailed output'
    )
    
    args = parser.parse_args()
    
    # Validate file
    validator = CitationValidator()
    report = validator.validate_file(args.file, check_dois=args.check_dois)
    
    # Print summary
    print('\n' + '='*60)
    print('CITATION VALIDATION REPORT')
    print('='*60)
    print(f'\nFile: {args.file}')
    print(f'Total entries: {report["total_entries"]}')
    print(f'Valid entries: {report["valid_entries"]}')
    print(f'Errors: {len(report["errors"])}')
    print(f'Warnings: {len(report["warnings"])}')
    print(f'Duplicates: {len(report["duplicates"])}')
    
    # Print errors
    if report['errors']:
        print('\n' + '-'*60)
        print('ERRORS (must fix):')
        print('-'*60)
        for error in report['errors']:
            print(f'\n{error["message"]}')
            if args.verbose:
                print(f'  Type: {error["type"]}')
                print(f'  Severity: {error["severity"]}')
    
    # Print warnings
    if report['warnings'] and args.verbose:
        print('\n' + '-'*60)
        print('WARNINGS (should fix):')
        print('-'*60)
        for warning in report['warnings']:
            print(f'\n{warning["message"]}')
    
    # Print duplicates
    if report['duplicates']:
        print('\n' + '-'*60)
        print('DUPLICATES:')
        print('-'*60)
        for dup in report['duplicates']:
            print(f'\n{dup["message"]}')
    
    # Save report
    if args.report:
        with open(args.report, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2)
        print(f'\nDetailed report saved to: {args.report}')
    
    # Exit with error code if there are errors
    if report['errors']:
        sys.exit(1)


if __name__ == '__main__':
    main()

