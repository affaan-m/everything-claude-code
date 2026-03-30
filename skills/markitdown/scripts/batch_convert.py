#!/usr/bin/env python3
"""
Batch convert multiple files to Markdown using MarkItDown.

This script demonstrates how to efficiently convert multiple files
in a directory to Markdown format.
"""

import argparse
from pathlib import Path
from typing import List, Optional
from markitdown import MarkItDown
from concurrent.futures import ThreadPoolExecutor, as_completed
import sys


def convert_file(md: MarkItDown, file_path: Path, output_dir: Path, verbose: bool = False) -> tuple[bool, str, str]:
    """
    Convert a single file to Markdown.
    
    Args:
        md: MarkItDown instance
        file_path: Path to input file
        output_dir: Directory for output files
        verbose: Print detailed messages
        
    Returns:
        Tuple of (success, input_path, message)
    """
    try:
        if verbose:
            print(f"Converting: {file_path}")
        
        result = md.convert(str(file_path))
        
        # Create output path
        output_file = output_dir / f"{file_path.stem}.md"
        
        # Write content with metadata header
        content = f"# {result.title or file_path.stem}\n\n"
        content += f"**Source**: {file_path.name}\n"
        content += f"**Format**: {file_path.suffix}\n\n"
        content += "---\n\n"
        content += result.text_content
        
        output_file.write_text(content, encoding='utf-8')
        
        return True, str(file_path), f"✓ Converted to {output_file.name}"
        
    except Exception as e:
        return False, str(file_path), f"✗ Error: {str(e)}"


def batch_convert(
    input_dir: Path,
    output_dir: Path,
    extensions: Optional[List[str]] = None,
    recursive: bool = False,
    workers: int = 4,
    verbose: bool = False,
    enable_plugins: bool = False
) -> dict:
    """
    Batch convert files in a directory.
    
    Args:
        input_dir: Input directory
        output_dir: Output directory
        extensions: List of file extensions to convert (e.g., ['.pdf', '.docx'])
        recursive: Search subdirectories
        workers: Number of parallel workers
        verbose: Print detailed messages
        enable_plugins: Enable MarkItDown plugins
        
    Returns:
        Dictionary with conversion statistics
    """
    # Create output directory
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Default extensions if not specified
    if extensions is None:
        extensions = ['.pdf', '.docx', '.pptx', '.xlsx', '.html', '.jpg', '.png']
    
    # Find files
    files = []
    if recursive:
        for ext in extensions:
            files.extend(input_dir.rglob(f"*{ext}"))
    else:
        for ext in extensions:
            files.extend(input_dir.glob(f"*{ext}"))
    
    if not files:
        print(f"No files found with extensions: {', '.join(extensions)}")
        return {'total': 0, 'success': 0, 'failed': 0}
    
    print(f"Found {len(files)} file(s) to convert")
    
    # Create MarkItDown instance
    md = MarkItDown(enable_plugins=enable_plugins)
    
    # Convert files in parallel
    results = {
        'total': len(files),
        'success': 0,
        'failed': 0,
        'details': []
    }
    
    with ThreadPoolExecutor(max_workers=workers) as executor:
        futures = {
            executor.submit(convert_file, md, file_path, output_dir, verbose): file_path
            for file_path in files
        }
        
        for future in as_completed(futures):
            success, path, message = future.result()
            
            if success:
                results['success'] += 1
            else:
                results['failed'] += 1
            
            results['details'].append({
                'file': path,
                'success': success,
                'message': message
            })
            
            print(message)
    
    return results


def main():
    parser = argparse.ArgumentParser(
        description="Batch convert files to Markdown using MarkItDown",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Convert all PDFs in a directory
  python batch_convert.py papers/ output/ --extensions .pdf
  
  # Convert multiple formats recursively
  python batch_convert.py documents/ markdown/ --extensions .pdf .docx .pptx -r
  
  # Use 8 parallel workers
  python batch_convert.py input/ output/ --workers 8
  
  # Enable plugins
  python batch_convert.py input/ output/ --plugins
        """
    )
    
    parser.add_argument('input_dir', type=Path, help='Input directory')
    parser.add_argument('output_dir', type=Path, help='Output directory')
    parser.add_argument(
        '--extensions', '-e',
        nargs='+',
        help='File extensions to convert (e.g., .pdf .docx)'
    )
    parser.add_argument(
        '--recursive', '-r',
        action='store_true',
        help='Search subdirectories recursively'
    )
    parser.add_argument(
        '--workers', '-w',
        type=int,
        default=4,
        help='Number of parallel workers (default: 4)'
    )
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Verbose output'
    )
    parser.add_argument(
        '--plugins', '-p',
        action='store_true',
        help='Enable MarkItDown plugins'
    )
    
    args = parser.parse_args()
    
    # Validate input directory
    if not args.input_dir.exists():
        print(f"Error: Input directory '{args.input_dir}' does not exist")
        sys.exit(1)
    
    if not args.input_dir.is_dir():
        print(f"Error: '{args.input_dir}' is not a directory")
        sys.exit(1)
    
    # Run batch conversion
    results = batch_convert(
        input_dir=args.input_dir,
        output_dir=args.output_dir,
        extensions=args.extensions,
        recursive=args.recursive,
        workers=args.workers,
        verbose=args.verbose,
        enable_plugins=args.plugins
    )
    
    # Print summary
    print("\n" + "="*50)
    print("CONVERSION SUMMARY")
    print("="*50)
    print(f"Total files:     {results['total']}")
    print(f"Successful:      {results['success']}")
    print(f"Failed:          {results['failed']}")
    print(f"Success rate:    {results['success']/results['total']*100:.1f}%" if results['total'] > 0 else "N/A")
    
    # Show failed files if any
    if results['failed'] > 0:
        print("\nFailed conversions:")
        for detail in results['details']:
            if not detail['success']:
                print(f"  - {detail['file']}: {detail['message']}")
    
    sys.exit(0 if results['failed'] == 0 else 1)


if __name__ == '__main__':
    main()

