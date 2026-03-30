#!/usr/bin/env python3
"""
Convert scientific literature PDFs to Markdown for analysis and review.

This script is specifically designed for converting academic papers,
organizing them, and preparing them for literature review workflows.
"""

import argparse
import json
import re
import sys
from pathlib import Path
from typing import List, Dict, Optional
from markitdown import MarkItDown
from datetime import datetime


def extract_metadata_from_filename(filename: str) -> Dict[str, str]:
    """
    Try to extract metadata from filename.
    Supports patterns like: Author_Year_Title.pdf
    """
    metadata = {}
    
    # Remove extension
    name = Path(filename).stem
    
    # Try to extract year
    year_match = re.search(r'\b(19|20)\d{2}\b', name)
    if year_match:
        metadata['year'] = year_match.group()
    
    # Split by underscores or dashes
    parts = re.split(r'[_\-]', name)
    if len(parts) >= 2:
        metadata['author'] = parts[0].replace('_', ' ')
        metadata['title'] = ' '.join(parts[1:]).replace('_', ' ')
    else:
        metadata['title'] = name.replace('_', ' ')
    
    return metadata


def convert_paper(
    md: MarkItDown,
    input_file: Path,
    output_dir: Path,
    organize_by_year: bool = False
) -> tuple[bool, Dict]:
    """
    Convert a single paper to Markdown with metadata extraction.
    
    Args:
        md: MarkItDown instance
        input_file: Path to PDF file
        output_dir: Output directory
        organize_by_year: Organize into year subdirectories
        
    Returns:
        Tuple of (success, metadata_dict)
    """
    try:
        print(f"Converting: {input_file.name}")
        
        # Convert to Markdown
        result = md.convert(str(input_file))
        
        # Extract metadata from filename
        metadata = extract_metadata_from_filename(input_file.name)
        metadata['source_file'] = input_file.name
        metadata['converted_date'] = datetime.now().isoformat()
        
        # Try to extract title from content if not in filename
        if 'title' not in metadata and result.title:
            metadata['title'] = result.title
        
        # Create output path
        if organize_by_year and 'year' in metadata:
            output_subdir = output_dir / metadata['year']
            output_subdir.mkdir(parents=True, exist_ok=True)
        else:
            output_subdir = output_dir
            output_subdir.mkdir(parents=True, exist_ok=True)
        
        output_file = output_subdir / f"{input_file.stem}.md"
        
        # Create formatted Markdown with front matter
        content = "---\n"
        content += f"title: \"{metadata.get('title', input_file.stem)}\"\n"
        if 'author' in metadata:
            content += f"author: \"{metadata['author']}\"\n"
        if 'year' in metadata:
            content += f"year: {metadata['year']}\n"
        content += f"source: \"{metadata['source_file']}\"\n"
        content += f"converted: \"{metadata['converted_date']}\"\n"
        content += "---\n\n"
        
        # Add title
        content += f"# {metadata.get('title', input_file.stem)}\n\n"
        
        # Add metadata section
        content += "## Document Information\n\n"
        if 'author' in metadata:
            content += f"**Author**: {metadata['author']}\n"
        if 'year' in metadata:
            content += f"**Year**: {metadata['year']}\n"
        content += f"**Source File**: {metadata['source_file']}\n"
        content += f"**Converted**: {metadata['converted_date']}\n\n"
        content += "---\n\n"
        
        # Add content
        content += result.text_content
        
        # Write to file
        output_file.write_text(content, encoding='utf-8')
        
        print(f"✓ Saved to: {output_file}")
        
        return True, metadata
        
    except Exception as e:
        print(f"✗ Error converting {input_file.name}: {str(e)}")
        return False, {'source_file': input_file.name, 'error': str(e)}


def create_index(papers: List[Dict], output_dir: Path):
    """Create an index/catalog of all converted papers."""
    
    # Sort by year (if available) and title
    papers_sorted = sorted(
        papers,
        key=lambda x: (x.get('year', '9999'), x.get('title', ''))
    )
    
    # Create Markdown index
    index_content = "# Literature Review Index\n\n"
    index_content += f"**Generated**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
    index_content += f"**Total Papers**: {len(papers)}\n\n"
    index_content += "---\n\n"
    
    # Group by year
    by_year = {}
    for paper in papers_sorted:
        year = paper.get('year', 'Unknown')
        if year not in by_year:
            by_year[year] = []
        by_year[year].append(paper)
    
    # Write by year
    for year in sorted(by_year.keys()):
        index_content += f"## {year}\n\n"
        for paper in by_year[year]:
            title = paper.get('title', paper.get('source_file', 'Unknown'))
            author = paper.get('author', 'Unknown Author')
            source = paper.get('source_file', '')
            
            # Create link to markdown file
            md_file = Path(source).stem + ".md"
            if 'year' in paper and paper['year'] != 'Unknown':
                md_file = f"{paper['year']}/{md_file}"
            
            index_content += f"- **{title}**\n"
            index_content += f"  - Author: {author}\n"
            index_content += f"  - Source: {source}\n"
            index_content += f"  - [Read Markdown]({md_file})\n\n"
    
    # Write index
    index_file = output_dir / "INDEX.md"
    index_file.write_text(index_content, encoding='utf-8')
    print(f"\n✓ Created index: {index_file}")
    
    # Also create JSON catalog
    catalog_file = output_dir / "catalog.json"
    with open(catalog_file, 'w', encoding='utf-8') as f:
        json.dump(papers_sorted, f, indent=2, ensure_ascii=False)
    print(f"✓ Created catalog: {catalog_file}")


def main():
    parser = argparse.ArgumentParser(
        description="Convert scientific literature PDFs to Markdown",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Convert all PDFs in a directory
  python convert_literature.py papers/ output/
  
  # Organize by year
  python convert_literature.py papers/ output/ --organize-by-year
  
  # Create index of all papers
  python convert_literature.py papers/ output/ --create-index
  
Filename Conventions:
  For best results, name your PDFs using this pattern:
    Author_Year_Title.pdf
    
  Examples:
    Smith_2023_Machine_Learning_Applications.pdf
    Jones_2022_Climate_Change_Analysis.pdf
        """
    )
    
    parser.add_argument('input_dir', type=Path, help='Directory with PDF files')
    parser.add_argument('output_dir', type=Path, help='Output directory for Markdown files')
    parser.add_argument(
        '--organize-by-year', '-y',
        action='store_true',
        help='Organize output into year subdirectories'
    )
    parser.add_argument(
        '--create-index', '-i',
        action='store_true',
        help='Create an index/catalog of all papers'
    )
    parser.add_argument(
        '--recursive', '-r',
        action='store_true',
        help='Search subdirectories recursively'
    )
    
    args = parser.parse_args()
    
    # Validate input
    if not args.input_dir.exists():
        print(f"Error: Input directory '{args.input_dir}' does not exist")
        sys.exit(1)
    
    if not args.input_dir.is_dir():
        print(f"Error: '{args.input_dir}' is not a directory")
        sys.exit(1)
    
    # Find PDF files
    if args.recursive:
        pdf_files = list(args.input_dir.rglob("*.pdf"))
    else:
        pdf_files = list(args.input_dir.glob("*.pdf"))
    
    if not pdf_files:
        print("No PDF files found")
        sys.exit(1)
    
    print(f"Found {len(pdf_files)} PDF file(s)")
    
    # Create MarkItDown instance
    md = MarkItDown()
    
    # Convert all papers
    results = []
    success_count = 0
    
    for pdf_file in pdf_files:
        success, metadata = convert_paper(
            md,
            pdf_file,
            args.output_dir,
            args.organize_by_year
        )
        
        if success:
            success_count += 1
            results.append(metadata)
    
    # Create index if requested
    if args.create_index and results:
        create_index(results, args.output_dir)
    
    # Print summary
    print("\n" + "="*50)
    print("CONVERSION SUMMARY")
    print("="*50)
    print(f"Total papers:    {len(pdf_files)}")
    print(f"Successful:      {success_count}")
    print(f"Failed:          {len(pdf_files) - success_count}")
    print(f"Success rate:    {success_count/len(pdf_files)*100:.1f}%")
    
    sys.exit(0 if success_count == len(pdf_files) else 1)


if __name__ == '__main__':
    main()

