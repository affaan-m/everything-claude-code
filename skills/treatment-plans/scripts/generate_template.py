#!/usr/bin/env python3
"""
Generate Treatment Plan Template
Interactive script to select and generate treatment plan templates.
"""

import os
import sys
import shutil
import argparse
from pathlib import Path
from datetime import datetime

# Template types and descriptions
TEMPLATES = {
    'general_medical': {
        'name': 'General Medical Treatment Plan',
        'file': 'general_medical_treatment_plan.tex',
        'description': 'For primary care and chronic disease management (diabetes, hypertension, etc.)'
    },
    'rehabilitation': {
        'name': 'Rehabilitation Treatment Plan',
        'file': 'rehabilitation_treatment_plan.tex',
        'description': 'For physical therapy, occupational therapy, and rehabilitation services'
    },
    'mental_health': {
        'name': 'Mental Health Treatment Plan',
        'file': 'mental_health_treatment_plan.tex',
        'description': 'For psychiatric and behavioral health treatment'
    },
    'chronic_disease': {
        'name': 'Chronic Disease Management Plan',
        'file': 'chronic_disease_management_plan.tex',
        'description': 'For complex multimorbidity and long-term care coordination'
    },
    'perioperative': {
        'name': 'Perioperative Care Plan',
        'file': 'perioperative_care_plan.tex',
        'description': 'For surgical and procedural patient management'
    },
    'pain_management': {
        'name': 'Pain Management Plan',
        'file': 'pain_management_plan.tex',
        'description': 'For acute and chronic pain treatment (multimodal approach)'
    }
}


def get_templates_dir():
    """Get the path to the templates directory."""
    # Assume script is in .claude/skills/treatment-plans/scripts/
    script_dir = Path(__file__).parent
    templates_dir = script_dir.parent / 'assets'
    return templates_dir


def list_templates():
    """Display available templates."""
    print("\n" + "="*70)
    print("AVAILABLE TREATMENT PLAN TEMPLATES")
    print("="*70)
    
    for i, (key, info) in enumerate(TEMPLATES.items(), 1):
        print(f"\n{i}. {info['name']}")
        print(f"   Type: {key}")
        print(f"   File: {info['file']}")
        print(f"   Description: {info['description']}")
    
    print("\n" + "="*70)


def interactive_selection():
    """Interactive template selection."""
    list_templates()
    
    while True:
        try:
            choice = input("\nSelect template number (1-6) or 'q' to quit: ").strip().lower()
            
            if choice == 'q':
                print("Exiting...")
                sys.exit(0)
            
            choice_num = int(choice)
            
            if 1 <= choice_num <= len(TEMPLATES):
                template_key = list(TEMPLATES.keys())[choice_num - 1]
                return template_key
            else:
                print(f"Please enter a number between 1 and {len(TEMPLATES)}.")
        except ValueError:
            print("Invalid input. Please enter a number or 'q' to quit.")


def get_output_filename(template_key, custom_name=None):
    """Generate output filename."""
    if custom_name:
        # Ensure .tex extension
        if not custom_name.endswith('.tex'):
            custom_name += '.tex'
        return custom_name
    
    # Default: template_key_YYYYMMDD.tex
    timestamp = datetime.now().strftime('%Y%m%d')
    return f"{template_key}_plan_{timestamp}.tex"


def copy_template(template_key, output_path):
    """Copy template to output location."""
    templates_dir = get_templates_dir()
    template_file = TEMPLATES[template_key]['file']
    source_path = templates_dir / template_file
    
    if not source_path.exists():
        raise FileNotFoundError(f"Template not found: {source_path}")
    
    # Create output directory if it doesn't exist
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Copy template
    shutil.copy2(source_path, output_path)
    
    return output_path


def display_success(output_path, template_key):
    """Display success message with next steps."""
    template_info = TEMPLATES[template_key]
    
    print("\n" + "="*70)
    print("✓ TEMPLATE GENERATED SUCCESSFULLY")
    print("="*70)
    print(f"\nTemplate: {template_info['name']}")
    print(f"Output file: {output_path}")
    print(f"File size: {os.path.getsize(output_path):,} bytes")
    
    print("\n" + "-"*70)
    print("NEXT STEPS:")
    print("-"*70)
    
    print("\n1. CUSTOMIZE THE TEMPLATE:")
    print("   - Open the .tex file in your LaTeX editor")
    print("   - Replace all [bracketed placeholders] with patient-specific information")
    print("   - Remove or modify sections as appropriate for your patient")
    
    print("\n2. COMPILE TO PDF:")
    print(f"   $ pdflatex {output_path.name}")
    
    print("\n3. VALIDATE (optional):")
    print(f"   $ python check_completeness.py {output_path.name}")
    print(f"   $ python validate_treatment_plan.py {output_path.name}")
    
    print("\n4. DE-IDENTIFY BEFORE SHARING:")
    print("   - Remove all HIPAA identifiers (18 identifiers)")
    print("   - See regulatory_compliance.md reference for details")
    
    print("\n" + "="*70)


def main():
    parser = argparse.ArgumentParser(
        description='Generate treatment plan template',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Interactive mode (recommended for first-time users)
  python generate_template.py

  # Direct generation with type specification
  python generate_template.py --type general_medical --output diabetes_plan.tex

  # Generate with default filename
  python generate_template.py --type mental_health

  # List available templates
  python generate_template.py --list

Available template types:
  general_medical, rehabilitation, mental_health, chronic_disease,
  perioperative, pain_management
        """
    )
    
    parser.add_argument(
        '--type',
        choices=list(TEMPLATES.keys()),
        help='Template type to generate'
    )
    
    parser.add_argument(
        '--output',
        help='Output filename (default: auto-generated with timestamp)'
    )
    
    parser.add_argument(
        '--list',
        action='store_true',
        help='List available templates and exit'
    )
    
    args = parser.parse_args()
    
    # List templates and exit
    if args.list:
        list_templates()
        return
    
    # Determine template type
    if args.type:
        template_key = args.type
        print(f"\nGenerating template: {TEMPLATES[template_key]['name']}")
    else:
        # Interactive mode
        template_key = interactive_selection()
    
    # Determine output filename
    if args.output:
        output_filename = args.output
    else:
        output_filename = get_output_filename(template_key)
    
    # Default output to current directory
    output_path = Path.cwd() / output_filename
    
    # Confirm overwrite if file exists
    if output_path.exists():
        response = input(f"\nFile {output_filename} already exists. Overwrite? (y/n): ").strip().lower()
        if response != 'y':
            print("Cancelled.")
            return
    
    # Copy template
    try:
        output_path = copy_template(template_key, output_path)
        display_success(output_path, template_key)
    except Exception as e:
        print(f"\n✗ ERROR: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()

