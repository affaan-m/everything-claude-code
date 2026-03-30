#!/usr/bin/env python3
"""
Validate Format Script
Check if document meets venue-specific formatting requirements.

Usage:
    python validate_format.py --file my_paper.pdf --venue "Nature" --check-all
    python validate_format.py --file my_paper.pdf --venue "NeurIPS" --check page-count,margins
    python validate_format.py --file my_paper.pdf --venue "PLOS ONE" --report validation_report.txt
"""

import argparse
import subprocess
from pathlib import Path
import re

# Venue requirements database
VENUE_REQUIREMENTS = {
    "nature": {
        "page_limit": 5,  # Approximate for ~3000 words
        "margins": {"top": 2.5, "bottom": 2.5, "left": 2.5, "right": 2.5},  # cm
        "font_size": 12,  # pt
        "font_family": "Times",
        "line_spacing": "double"
    },
    "neurips": {
        "page_limit": 8,  # Excluding refs
        "margins": {"top": 2.54, "bottom": 2.54, "left": 2.54, "right": 2.54},  # cm (1 inch)
        "font_size": 10,
        "font_family": "Times",
        "format": "two-column"
    },
    "plos_one": {
        "page_limit": None,  # No limit
        "margins": {"top": 2.54, "bottom": 2.54, "left": 2.54, "right": 2.54},
        "font_size": 10,
        "font_family": "Arial",
        "line_spacing": "double"
    },
    "nsf": {
        "page_limit": 15,  # Project description
        "margins": {"top": 2.54, "bottom": 2.54, "left": 2.54, "right": 2.54},  # 1 inch required
        "font_size": 11,  # Minimum
        "font_family": "Times Roman",
        "line_spacing": "single or double"
    },
    "nih": {
        "page_limit": 12,  # Research strategy
        "margins": {"top": 1.27, "bottom": 1.27, "left": 1.27, "right": 1.27},  # 0.5 inch minimum
        "font_size": 11,  # Arial 11pt minimum
        "font_family": "Arial",
        "line_spacing": "any"
    }
}

def get_pdf_info(pdf_path):
    """Extract information from PDF using pdfinfo."""
    try:
        result = subprocess.run(
            ['pdfinfo', str(pdf_path)],
            capture_output=True,
            text=True,
            check=True
        )
        
        info = {}
        for line in result.stdout.split('\n'):
            if ':' in line:
                key, value = line.split(':', 1)
                info[key.strip()] = value.strip()
        
        return info
    except FileNotFoundError:
        print("⚠️  pdfinfo not found. Install poppler-utils for full PDF analysis.")
        print("   macOS: brew install poppler")
        print("   Linux: sudo apt-get install poppler-utils")
        return None
    except subprocess.CalledProcessError as e:
        print(f"Error running pdfinfo: {e}")
        return None

def check_page_count(pdf_path, venue_reqs):
    """Check if page count is within limit."""
    pdf_info = get_pdf_info(pdf_path)
    
    if not pdf_info:
        return {"status": "skip", "message": "Could not determine page count"}
    
    pages = int(pdf_info.get('Pages', 0))
    limit = venue_reqs.get('page_limit')
    
    if limit is None:
        return {"status": "pass", "message": f"No page limit. Document has {pages} pages."}
    
    if pages <= limit:
        return {"status": "pass", "message": f"✓ Page count OK: {pages}/{limit} pages"}
    else:
        return {"status": "fail", "message": f"✗ Page count exceeded: {pages}/{limit} pages"}

def check_margins(pdf_path, venue_reqs):
    """Check if margins meet requirements."""
    # Note: This is a simplified check. Full margin analysis requires more sophisticated tools.
    req_margins = venue_reqs.get('margins', {})
    
    if not req_margins:
        return {"status": "skip", "message": "No margin requirements specified"}
    
    # This is a placeholder - accurate margin checking requires parsing PDF content
    return {
        "status": "info",
        "message": f"ℹ️  Required margins: {req_margins} cm (manual verification recommended)"
    }

def check_fonts(pdf_path, venue_reqs):
    """Check fonts in PDF."""
    try:
        result = subprocess.run(
            ['pdffonts', str(pdf_path)],
            capture_output=True,
            text=True,
            check=True
        )
        
        fonts_found = []
        for line in result.stdout.split('\n')[2:]:  # Skip header
            if line.strip():
                parts = line.split()
                if parts:
                    fonts_found.append(parts[0])
        
        req_font = venue_reqs.get('font_family', '')
        req_size = venue_reqs.get('font_size')
        
        message = f"ℹ️  Fonts found: {', '.join(set(fonts_found))}\n"
        message += f"   Required: {req_font}"
        if req_size:
            message += f" {req_size}pt minimum"
        
        return {"status": "info", "message": message}
        
    except FileNotFoundError:
        return {"status": "skip", "message": "pdffonts not available"}
    except subprocess.CalledProcessError:
        return {"status": "skip", "message": "Could not extract font information"}

def validate_document(pdf_path, venue, checks):
    """Validate document against venue requirements."""
    
    venue_key = venue.lower().replace(" ", "_")
    
    if venue_key not in VENUE_REQUIREMENTS:
        print(f"❌ Unknown venue: {venue}")
        print(f"Available venues: {', '.join(VENUE_REQUIREMENTS.keys())}")
        return
    
    venue_reqs = VENUE_REQUIREMENTS[venue_key]
    
    print(f"\n{'='*60}")
    print(f"VALIDATING: {pdf_path.name}")
    print(f"VENUE: {venue}")
    print(f"{'='*60}\n")
    
    results = {}
    
    # Run requested checks
    if 'page-count' in checks or 'all' in checks:
        results['page-count'] = check_page_count(pdf_path, venue_reqs)
    
    if 'margins' in checks or 'all' in checks:
        results['margins'] = check_margins(pdf_path, venue_reqs)
    
    if 'fonts' in checks or 'all' in checks:
        results['fonts'] = check_fonts(pdf_path, venue_reqs)
    
    # Print results
    for check_name, result in results.items():
        print(f"{check_name.upper()}:")
        print(f"  {result['message']}\n")
    
    # Summary
    failures = sum(1 for r in results.values() if r['status'] == 'fail')
    passes = sum(1 for r in results.values() if r['status'] == 'pass')
    
    print(f"{'='*60}")
    if failures == 0:
        print(f"✓ VALIDATION PASSED ({passes} checks)")
    else:
        print(f"✗ VALIDATION FAILED ({failures} issues)")
    print(f"{'='*60}\n")
    
    return results

def generate_report(pdf_path, venue, results, report_path):
    """Generate validation report."""
    
    with open(report_path, 'w') as f:
        f.write(f"Validation Report\n")
        f.write(f"{'='*60}\n\n")
        f.write(f"File: {pdf_path}\n")
        f.write(f"Venue: {venue}\n")
        f.write(f"Date: {Path.ctime(pdf_path)}\n\n")
        
        for check_name, result in results.items():
            f.write(f"{check_name.upper()}:\n")
            f.write(f"  Status: {result['status']}\n")
            f.write(f"  {result['message']}\n\n")
        
        failures = sum(1 for r in results.values() if r['status'] == 'fail')
        f.write(f"\nSummary: {'PASSED' if failures == 0 else 'FAILED'}\n")
    
    print(f"Report saved to: {report_path}")

def main():
    parser = argparse.ArgumentParser(
        description="Validate document formatting for venue requirements",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s --file my_paper.pdf --venue "Nature" --check-all
  %(prog)s --file my_paper.pdf --venue "NeurIPS" --check page-count,fonts
  %(prog)s --file proposal.pdf --venue "NSF" --report validation.txt
        """
    )
    
    parser.add_argument('--file', type=str, required=True, help='PDF file to validate')
    parser.add_argument('--venue', type=str, required=True, help='Target venue')
    parser.add_argument('--check', type=str, default='all',
                      help='Checks to perform: page-count, margins, fonts, all (comma-separated)')
    parser.add_argument('--check-all', action='store_true', help='Perform all checks')
    parser.add_argument('--report', type=str, help='Save report to file')
    
    args = parser.parse_args()
    
    # Check file exists
    pdf_path = Path(args.file)
    if not pdf_path.exists():
        print(f"Error: File not found: {pdf_path}")
        return
    
    # Parse checks
    if args.check_all:
        checks = ['all']
    else:
        checks = [c.strip() for c in args.check.split(',')]
    
    # Validate
    results = validate_document(pdf_path, args.venue, checks)
    
    # Generate report if requested
    if args.report and results:
        generate_report(pdf_path, args.venue, results, Path(args.report))

if __name__ == "__main__":
    main()

