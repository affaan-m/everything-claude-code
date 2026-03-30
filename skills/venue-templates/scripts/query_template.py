#!/usr/bin/env python3
"""
Query Template Script
Search and retrieve venue-specific templates by name, type, or keywords.

Usage:
    python query_template.py --venue "Nature" --type "article"
    python query_template.py --keyword "machine learning"
    python query_template.py --list-all
    python query_template.py --venue "NeurIPS" --requirements
"""

import argparse
import os
import json
from pathlib import Path

# Template database
TEMPLATES = {
    "journals": {
        "nature": {
            "file": "nature_article.tex",
            "full_name": "Nature",
            "description": "Top-tier multidisciplinary science journal",
            "page_limit": "~3000 words",
            "citation_style": "Superscript numbered",
            "format": "Single column"
        },
        "neurips": {
            "file": "neurips_article.tex",
            "full_name": "NeurIPS (Neural Information Processing Systems)",
            "description": "Top-tier machine learning conference",
            "page_limit": "8 pages + unlimited refs",
            "citation_style": "Numbered [1]",
            "format": "Two column",
            "anonymization": "Required (double-blind)"
        },
        "plos_one": {
            "file": "plos_one.tex",
            "full_name": "PLOS ONE",
            "description": "Open-access multidisciplinary journal",
            "page_limit": "No limit",
            "citation_style": "Vancouver [1]",
            "format": "Single column"
        }
    },
    "posters": {
        "beamerposter": {
            "file": "beamerposter_academic.tex",
            "full_name": "Beamerposter Academic",
            "description": "Classic academic conference poster using beamerposter",
            "size": "A0, customizable",
            "package": "beamerposter"
        }
    },
    "grants": {
        "nsf": {
            "file": "nsf_proposal_template.tex",
            "full_name": "NSF Standard Grant",
            "description": "National Science Foundation research proposal",
            "page_limit": "15 pages (project description)",
            "key_sections": "Project Summary, Project Description, Broader Impacts"
        },
        "nih_specific_aims": {
            "file": "nih_specific_aims.tex",
            "full_name": "NIH Specific Aims Page",
            "description": "Most critical page of NIH proposals",
            "page_limit": "1 page (strictly enforced)",
            "key_sections": "Hook, Hypothesis, 3 Aims, Payoff"
        }
    }
}

def get_skill_path():
    """Get the path to the venue-templates skill directory."""
    # Assume script is in .claude/skills/venue-templates/scripts/
    script_dir = Path(__file__).parent
    skill_dir = script_dir.parent
    return skill_dir

def search_templates(venue=None, template_type=None, keyword=None):
    """Search for templates matching criteria."""
    results = []
    
    for cat_name, category in TEMPLATES.items():
        # Filter by type if specified
        if template_type and cat_name != template_type and template_type != "all":
            continue
            
        for temp_id, template in category.items():
            # Filter by venue name
            if venue:
                venue_lower = venue.lower()
                if venue_lower not in temp_id and venue_lower not in template.get("full_name", "").lower():
                    continue
            
            # Filter by keyword
            if keyword:
                keyword_lower = keyword.lower()
                search_text = json.dumps(template).lower()
                if keyword_lower not in search_text:
                    continue
            
            results.append({
                "id": temp_id,
                "category": cat_name,
                "file": template["file"],
                "full_name": template.get("full_name", temp_id),
                "description": template.get("description", ""),
                "details": template
            })
    
    return results

def list_all_templates():
    """List all available templates."""
    print("\n=== AVAILABLE TEMPLATES ===\n")
    
    for cat_name, category in TEMPLATES.items():
        print(f"\n{cat_name.upper()}:")
        for temp_id, template in category.items():
            print(f"  • {template.get('full_name', temp_id)}")
            print(f"    File: {template['file']}")
            if "description" in template:
                print(f"    Description: {template['description']}")
        print()

def print_template_info(template):
    """Print detailed information about a template."""
    print(f"\n{'='*60}")
    print(f"Template: {template['full_name']}")
    print(f"{'='*60}")
    print(f"Category: {template['category']}")
    print(f"File: {template['file']}")
    
    details = template['details']
    
    print(f"\nDescription: {details.get('description', 'N/A')}")
    
    if 'page_limit' in details:
        print(f"Page Limit: {details['page_limit']}")
    if 'citation_style' in details:
        print(f"Citation Style: {details['citation_style']}")
    if 'format' in details:
        print(f"Format: {details['format']}")
    if 'anonymization' in details:
        print(f"⚠️  Anonymization: {details['anonymization']}")
    if 'size' in details:
        print(f"Poster Size: {details['size']}")
    if 'package' in details:
        print(f"LaTeX Package: {details['package']}")
    if 'key_sections' in details:
        print(f"Key Sections: {details['key_sections']}")
    
    # Print full path to template
    skill_path = get_skill_path()
    template_path = skill_path / "assets" / template['category'] / template['file']
    print(f"\nFull Path: {template_path}")
    
    if template_path.exists():
        print("✓ Template file exists")
    else:
        print("✗ Template file not found")
    
    print()

def print_requirements(venue):
    """Print formatting requirements for a venue."""
    results = search_templates(venue=venue)
    
    if not results:
        print(f"No templates found for venue: {venue}")
        return
    
    template = results[0]  # Take first match
    details = template['details']
    
    print(f"\n{'='*60}")
    print(f"FORMATTING REQUIREMENTS: {template['full_name']}")
    print(f"{'='*60}\n")
    
    if 'page_limit' in details:
        print(f"📄 Page Limit: {details['page_limit']}")
    if 'format' in details:
        print(f"📐 Format: {details['format']}")
    if 'citation_style' in details:
        print(f"📚 Citation Style: {details['citation_style']}")
    if 'anonymization' in details:
        print(f"🔒 Anonymization: {details['anonymization']}")
    if 'size' in details:
        print(f"📏 Size: {details['size']}")
    
    print(f"\n💡 For detailed requirements, see:")
    skill_path = get_skill_path()
    
    if template['category'] == "journals":
        print(f"   {skill_path}/references/journals_formatting.md")
    elif template['category'] == "posters":
        print(f"   {skill_path}/references/posters_guidelines.md")
    elif template['category'] == "grants":
        print(f"   {skill_path}/references/grants_requirements.md")
    
    print()

def main():
    parser = argparse.ArgumentParser(
        description="Query venue-specific LaTeX templates",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s --list-all
  %(prog)s --venue "Nature" --type journals
  %(prog)s --keyword "machine learning"
  %(prog)s --venue "NeurIPS" --requirements
        """
    )
    
    parser.add_argument('--venue', type=str, help='Venue name (e.g., "Nature", "NeurIPS")')
    parser.add_argument('--type', type=str, choices=['journals', 'posters', 'grants', 'all'],
                      help='Template type')
    parser.add_argument('--keyword', type=str, help='Search keyword')
    parser.add_argument('--list-all', action='store_true', help='List all available templates')
    parser.add_argument('--requirements', action='store_true', 
                      help='Show formatting requirements for venue')
    
    args = parser.parse_args()
    
    # List all templates
    if args.list_all:
        list_all_templates()
        return
    
    # Show requirements
    if args.requirements:
        if not args.venue:
            print("Error: --requirements requires --venue")
            parser.print_help()
            return
        print_requirements(args.venue)
        return
    
    # Search for templates
    if not any([args.venue, args.type, args.keyword]):
        parser.print_help()
        return
    
    results = search_templates(venue=args.venue, template_type=args.type, keyword=args.keyword)
    
    if not results:
        print("No templates found matching your criteria.")
        return
    
    print(f"\nFound {len(results)} template(s):\n")
    
    for result in results:
        print_template_info(result)

if __name__ == "__main__":
    main()

