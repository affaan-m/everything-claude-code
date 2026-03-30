#!/usr/bin/env python3
"""
Customize Template Script
Customize LaTeX templates with author information and project details.

Usage:
    python customize_template.py --template nature_article.tex --output my_paper.tex
    python customize_template.py --template nature_article.tex --title "My Research" --output my_paper.tex
    python customize_template.py --interactive
"""

import argparse
import re
from pathlib import Path

def get_skill_path():
    """Get the path to the venue-templates skill directory."""
    script_dir = Path(__file__).parent
    skill_dir = script_dir.parent
    return skill_dir

def find_template(template_name):
    """Find template file in assets directory."""
    skill_path = get_skill_path()
    assets_path = skill_path / "assets"
    
    # Search in all subdirectories
    for subdir in ["journals", "posters", "grants"]:
        template_path = assets_path / subdir / template_name
        if template_path.exists():
            return template_path
    
    return None

def customize_template(template_path, output_path, **kwargs):
    """Customize a template with provided information."""
    
    # Read template
    with open(template_path, 'r') as f:
        content = f.read()
    
    # Replace placeholders
    replacements = {
        'title': (
            [r'Insert Your Title Here[^}]*', r'Your [^}]*Title[^}]*Here[^}]*'],
            kwargs.get('title', '')
        ),
        'authors': (
            [r'First Author\\textsuperscript\{1\}, Second Author[^}]*',
             r'First Author.*Second Author.*Third Author'],
            kwargs.get('authors', '')
        ),
        'affiliations': (
            [r'Department Name, Institution Name, City, State[^\\]*',
             r'Department of [^,]*, University Name[^\\]*'],
            kwargs.get('affiliations', '')
        ),
        'email': (
            [r'first\.author@university\.edu',
             r'\[email protected\]'],
            kwargs.get('email', '')
        )
    }
    
    # Apply replacements
    modified = False
    for key, (patterns, replacement) in replacements.items():
        if replacement:
            for pattern in patterns:
                if re.search(pattern, content):
                    content = re.sub(pattern, replacement, content, count=1)
                    modified = True
                    print(f"✓ Replaced {key}")
    
    # Write output
    with open(output_path, 'w') as f:
        f.write(content)
    
    if modified:
        print(f"\n✓ Customized template saved to: {output_path}")
    else:
        print(f"\n⚠️  Template copied to: {output_path}")
        print("   No customizations applied (no matching placeholders found or no values provided)")
    
    print(f"\nNext steps:")
    print(f"1. Open {output_path} in your LaTeX editor")
    print(f"2. Replace remaining placeholders")
    print(f"3. Add your content")
    print(f"4. Compile with pdflatex or your preferred LaTeX compiler")

def interactive_mode():
    """Run in interactive mode."""
    print("\n=== Template Customization (Interactive Mode) ===\n")
    
    # List available templates
    skill_path = get_skill_path()
    assets_path = skill_path / "assets"
    
    print("Available templates:\n")
    templates = []
    for i, subdir in enumerate(["journals", "posters", "grants"], 1):
        subdir_path = assets_path / subdir
        if subdir_path.exists():
            print(f"{subdir.upper()}:")
            for j, template_file in enumerate(sorted(subdir_path.glob("*.tex")), 1):
                templates.append(template_file)
                print(f"  {len(templates)}. {template_file.name}")
    
    print()
    
    # Select template
    while True:
        try:
            choice = int(input(f"Select template (1-{len(templates)}): "))
            if 1 <= choice <= len(templates):
                template_path = templates[choice - 1]
                break
            else:
                print(f"Please enter a number between 1 and {len(templates)}")
        except ValueError:
            print("Please enter a valid number")
    
    print(f"\nSelected: {template_path.name}\n")
    
    # Get customization info
    title = input("Paper title (press Enter to skip): ").strip()
    authors = input("Authors (e.g., 'John Doe, Jane Smith') (press Enter to skip): ").strip()
    affiliations = input("Affiliations (press Enter to skip): ").strip()
    email = input("Corresponding email (press Enter to skip): ").strip()
    
    # Output file
    default_output = f"my_{template_path.stem}.tex"
    output = input(f"Output filename [{default_output}]: ").strip()
    if not output:
        output = default_output
    
    output_path = Path(output)
    
    # Customize
    print()
    customize_template(
        template_path,
        output_path,
        title=title,
        authors=authors,
        affiliations=affiliations,
        email=email
    )

def main():
    parser = argparse.ArgumentParser(
        description="Customize LaTeX templates with author and project information",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s --interactive
  %(prog)s --template nature_article.tex --output my_paper.tex
  %(prog)s --template neurips_article.tex --title "My ML Research" --output my_neurips.tex
        """
    )
    
    parser.add_argument('--template', type=str, help='Template filename')
    parser.add_argument('--output', type=str, help='Output filename')
    parser.add_argument('--title', type=str, help='Paper title')
    parser.add_argument('--authors', type=str, help='Author names')
    parser.add_argument('--affiliations', type=str, help='Institutions/affiliations')
    parser.add_argument('--email', type=str, help='Corresponding author email')
    parser.add_argument('--interactive', action='store_true', help='Run in interactive mode')
    
    args = parser.parse_args()
    
    # Interactive mode
    if args.interactive:
        interactive_mode()
        return
    
    # Command-line mode
    if not args.template or not args.output:
        print("Error: --template and --output are required (or use --interactive)")
        parser.print_help()
        return
    
    # Find template
    template_path = find_template(args.template)
    if not template_path:
        print(f"Error: Template '{args.template}' not found")
        print("\nSearched in:")
        skill_path = get_skill_path()
        for subdir in ["journals", "posters", "grants"]:
            print(f"  - {skill_path}/assets/{subdir}/")
        return
    
    # Customize
    output_path = Path(args.output)
    customize_template(
        template_path,
        output_path,
        title=args.title,
        authors=args.authors,
        affiliations=args.affiliations,
        email=args.email
    )

if __name__ == "__main__":
    main()

