#!/usr/bin/env python3
"""
Interactive template generator for clinical reports.

Helps users select and generate appropriate clinical report templates.

Usage:
    python generate_report_template.py
    python generate_report_template.py --type case_report --output my_case_report.md
"""

import argparse
import shutil
from pathlib import Path


TEMPLATES = {
    "case_report": "case_report_template.md",
    "soap_note": "soap_note_template.md",
    "h_and_p": "history_physical_template.md",
    "discharge_summary": "discharge_summary_template.md",
    "consult_note": "consult_note_template.md",
    "radiology": "radiology_report_template.md",
    "pathology": "pathology_report_template.md",
    "lab": "lab_report_template.md",
    "sae": "clinical_trial_sae_template.md",
    "csr": "clinical_trial_csr_template.md",
}

DESCRIPTIONS = {
    "case_report": "Clinical Case Report (CARE guidelines)",
    "soap_note": "SOAP Progress Note",
    "h_and_p": "History and Physical Examination",
    "discharge_summary": "Hospital Discharge Summary",
    "consult_note": "Consultation Note",
    "radiology": "Radiology/Imaging Report",
    "pathology": "Surgical Pathology Report",
    "lab": "Laboratory Report",
    "sae": "Serious Adverse Event Report",
    "csr": "Clinical Study Report (ICH-E3)",
}


def get_template_dir() -> Path:
    """Get the templates directory path."""
    script_dir = Path(__file__).parent
    template_dir = script_dir.parent / "assets"
    return template_dir


def list_templates():
    """List available templates."""
    print("\nAvailable Clinical Report Templates:")
    print("=" * 60)
    for i, (key, desc) in enumerate(DESCRIPTIONS.items(), 1):
        print(f"{i:2}. {key:20} - {desc}")
    print("=" * 60)


def generate_template(template_type: str, output_file: str = None):
    """Generate template file."""
    if template_type not in TEMPLATES:
        raise ValueError(f"Invalid template type: {template_type}")
    
    template_filename = TEMPLATES[template_type]
    template_path = get_template_dir() / template_filename
    
    if not template_path.exists():
        raise FileNotFoundError(f"Template not found: {template_path}")
    
    if output_file is None:
        output_file = f"new_{template_filename}"
    
    shutil.copy(template_path, output_file)
    print(f"✓ Template created: {output_file}")
    print(f"  Type: {DESCRIPTIONS[template_type]}")
    print(f"  Source: {template_filename}")
    
    return output_file


def interactive_mode():
    """Interactive template selection."""
    list_templates()
    print()
    
    while True:
        choice = input("Select template number (or 'q' to quit): ").strip()
        
        if choice.lower() == 'q':
            print("Goodbye!")
            return
        
        try:
            idx = int(choice) - 1
            template_types = list(TEMPLATES.keys())
            
            if 0 <= idx < len(template_types):
                template_type = template_types[idx]
                output_file = input(f"Output filename (default: new_{TEMPLATES[template_type]}): ").strip()
                
                if not output_file:
                    output_file = None
                
                generate_template(template_type, output_file)
                
                another = input("\nGenerate another template? (y/n): ").strip().lower()
                if another != 'y':
                    print("Goodbye!")
                    return
                else:
                    print()
                    list_templates()
                    print()
            else:
                print("Invalid selection. Please try again.")
        except (ValueError, IndexError):
            print("Invalid input. Please enter a number or 'q' to quit.")


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Generate clinical report templates"
    )
    parser.add_argument(
        "--type",
        choices=list(TEMPLATES.keys()),
        help="Template type to generate"
    )
    parser.add_argument(
        "--output",
        "-o",
        help="Output filename"
    )
    parser.add_argument(
        "--list",
        action="store_true",
        help="List available templates"
    )
    
    args = parser.parse_args()
    
    try:
        if args.list:
            list_templates()
        elif args.type:
            generate_template(args.type, args.output)
        else:
            # Interactive mode
            interactive_mode()
        
        return 0
        
    except Exception as e:
        print(f"Error: {e}")
        return 1


if __name__ == "__main__":
    import sys
    sys.exit(main())

