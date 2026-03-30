#!/usr/bin/env python3
"""
Check Treatment Plan Completeness
Validates that all required sections are present in a treatment plan.
"""

import sys
import re
import argparse
from pathlib import Path
from typing import List, Tuple

# Required sections for all treatment plans
REQUIRED_SECTIONS = [
    r'\\section\*\{.*Patient Information',
    r'\\section\*\{.*Diagnosis.*Assessment',
    r'\\section\*\{.*Goals',
    r'\\section\*\{.*Interventions',
    r'\\section\*\{.*Timeline.*Schedule',
    r'\\section\*\{.*Monitoring',
    r'\\section\*\{.*Outcomes',
    r'\\section\*\{.*Follow[- ]?up',
    r'\\section\*\{.*Education',
    r'\\section\*\{.*Risk.*Safety',
]

# Section descriptions for user-friendly output
SECTION_DESCRIPTIONS = {
    0: 'Patient Information (de-identified)',
    1: 'Diagnosis and Assessment',
    2: 'Treatment Goals (SMART format)',
    3: 'Interventions (pharmacological, non-pharmacological, procedural)',
    4: 'Timeline and Schedule',
    5: 'Monitoring Parameters',
    6: 'Expected Outcomes',
    7: 'Follow-up Plan',
    8: 'Patient Education',
    9: 'Risk Mitigation and Safety'
}


def read_file(filepath: Path) -> str:
    """Read and return file contents."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        print(f"Error: File not found: {filepath}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error reading file: {e}", file=sys.stderr)
        sys.exit(1)


def check_sections(content: str) -> Tuple[List[bool], List[str]]:
    """
    Check which required sections are present.
    Returns tuple of (checklist, missing_sections).
    """
    checklist = []
    missing = []
    
    for i, pattern in enumerate(REQUIRED_SECTIONS):
        if re.search(pattern, content, re.IGNORECASE):
            checklist.append(True)
        else:
            checklist.append(False)
            missing.append(SECTION_DESCRIPTIONS[i])
    
    return checklist, missing


def check_smart_goals(content: str) -> Tuple[bool, List[str]]:
    """
    Check if SMART goal criteria are mentioned.
    Returns (has_smart, missing_criteria).
    """
    smart_criteria = {
        'Specific': r'\bspecific\b',
        'Measurable': r'\bmeasurable\b',
        'Achievable': r'\bachievable\b',
        'Relevant': r'\brelevant\b',
        'Time-bound': r'\btime[- ]?bound\b'
    }
    
    missing = []
    for criterion, pattern in smart_criteria.items():
        if not re.search(pattern, content, re.IGNORECASE):
            missing.append(criterion)
    
    has_smart = len(missing) == 0
    return has_smart, missing


def check_hipaa_notice(content: str) -> bool:
    """Check if HIPAA de-identification notice is present."""
    pattern = r'HIPAA|de-identif|protected health information|PHI'
    return bool(re.search(pattern, content, re.IGNORECASE))


def check_provider_signature(content: str) -> bool:
    """Check if provider signature section is present."""
    pattern = r'\\section\*\{.*Signature|Provider Signature|Signature'
    return bool(re.search(pattern, content, re.IGNORECASE))


def check_placeholders_remaining(content: str) -> Tuple[int, List[str]]:
    """
    Check for uncustomized placeholders [like this].
    Returns (count, sample_placeholders).
    """
    placeholders = re.findall(r'\[([^\]]+)\]', content)
    
    # Filter out LaTeX commands and references
    filtered = []
    for p in placeholders:
        # Skip if it's a LaTeX command, number, or citation
        if not (p.startswith('\\') or p.isdigit() or 'cite' in p.lower() or 'ref' in p.lower()):
            filtered.append(p)
    
    count = len(filtered)
    samples = filtered[:5]  # Return up to 5 examples
    
    return count, samples


def display_results(filepath: Path, checklist: List[bool], missing: List[str], 
                   smart_complete: bool, smart_missing: List[str],
                   has_hipaa: bool, has_signature: bool,
                   placeholder_count: int, placeholder_samples: List[str]):
    """Display completeness check results."""
    
    total_sections = len(REQUIRED_SECTIONS)
    present_count = sum(checklist)
    completeness_pct = (present_count / total_sections) * 100
    
    print("\n" + "="*70)
    print("TREATMENT PLAN COMPLETENESS CHECK")
    print("="*70)
    print(f"\nFile: {filepath}")
    print(f"File size: {filepath.stat().st_size:,} bytes")
    
    # Overall completeness
    print("\n" + "-"*70)
    print("OVERALL COMPLETENESS")
    print("-"*70)
    print(f"Required sections present: {present_count}/{total_sections} ({completeness_pct:.0f}%)")
    
    if completeness_pct == 100:
        print("✓ All required sections present")
    else:
        print(f"✗ {len(missing)} section(s) missing")
    
    # Section details
    print("\n" + "-"*70)
    print("SECTION CHECKLIST")
    print("-"*70)
    
    for i, (present, desc) in enumerate(zip(checklist, SECTION_DESCRIPTIONS.values())):
        status = "✓" if present else "✗"
        print(f"{status} {desc}")
    
    # Missing sections
    if missing:
        print("\n" + "-"*70)
        print("MISSING SECTIONS")
        print("-"*70)
        for section in missing:
            print(f"  • {section}")
    
    # SMART goals
    print("\n" + "-"*70)
    print("SMART GOALS CHECK")
    print("-"*70)
    
    if smart_complete:
        print("✓ All SMART criteria mentioned in document")
    else:
        print(f"✗ {len(smart_missing)} SMART criterion/criteria not found:")
        for criterion in smart_missing:
            print(f"  • {criterion}")
        print("\nNote: Goals should be Specific, Measurable, Achievable, Relevant, Time-bound")
    
    # HIPAA notice
    print("\n" + "-"*70)
    print("PRIVACY AND COMPLIANCE")
    print("-"*70)
    
    if has_hipaa:
        print("✓ HIPAA/de-identification notice present")
    else:
        print("✗ HIPAA de-identification notice not found")
        print("  Recommendation: Include HIPAA Safe Harbor de-identification guidance")
    
    if has_signature:
        print("✓ Provider signature section present")
    else:
        print("✗ Provider signature section not found")
    
    # Placeholders
    print("\n" + "-"*70)
    print("CUSTOMIZATION STATUS")
    print("-"*70)
    
    if placeholder_count == 0:
        print("✓ No uncustomized placeholders detected")
    else:
        print(f"⚠ {placeholder_count} placeholder(s) may need customization")
        print("\nExamples:")
        for sample in placeholder_samples:
            print(f"  • [{sample}]")
        print("\nRecommendation: Replace all [bracketed placeholders] with patient-specific information")
    
    # Summary
    print("\n" + "="*70)
    print("SUMMARY")
    print("="*70)
    
    # Calculate overall score
    score_components = [
        completeness_pct / 100,  # Section completeness (0-1)
        1.0 if smart_complete else 0.6,  # SMART goals (full or partial credit)
        1.0 if has_hipaa else 0.0,  # HIPAA notice (binary)
        1.0 if has_signature else 0.0,  # Signature (binary)
        1.0 if placeholder_count == 0 else 0.5  # Customization (full or partial)
    ]
    
    overall_score = (sum(score_components) / len(score_components)) * 100
    
    print(f"\nOverall completeness score: {overall_score:.0f}%")
    
    if overall_score >= 90:
        print("Status: ✓ EXCELLENT - Treatment plan is comprehensive")
    elif overall_score >= 75:
        print("Status: ✓ GOOD - Minor improvements needed")
    elif overall_score >= 60:
        print("Status: ⚠ FAIR - Several sections need attention")
    else:
        print("Status: ✗ INCOMPLETE - Significant work needed")
    
    print("\n" + "="*70)
    
    # Return exit code based on completeness
    return 0 if completeness_pct >= 80 else 1


def main():
    parser = argparse.ArgumentParser(
        description='Check treatment plan completeness',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Check a treatment plan file
  python check_completeness.py my_treatment_plan.tex

  # Check and exit with error code if incomplete (for CI/CD)
  python check_completeness.py plan.tex && echo "Complete"

This script checks for:
  - All required sections (10 core sections)
  - SMART goal criteria
  - HIPAA de-identification notice
  - Provider signature section
  - Uncustomized placeholders

Exit codes:
  0 - All required sections present (≥80% complete)
  1 - Missing required sections (<80% complete)
  2 - File error or invalid arguments
        """
    )
    
    parser.add_argument(
        'file',
        type=Path,
        help='Treatment plan file to check (.tex format)'
    )
    
    parser.add_argument(
        '-v', '--verbose',
        action='store_true',
        help='Show detailed output'
    )
    
    args = parser.parse_args()
    
    # Check file exists and is .tex
    if not args.file.exists():
        print(f"Error: File not found: {args.file}", file=sys.stderr)
        sys.exit(2)
    
    if args.file.suffix.lower() not in ['.tex', '.txt']:
        print(f"Warning: Expected .tex file, got {args.file.suffix}", file=sys.stderr)
    
    # Read file
    content = read_file(args.file)
    
    # Perform checks
    checklist, missing = check_sections(content)
    smart_complete, smart_missing = check_smart_goals(content)
    has_hipaa = check_hipaa_notice(content)
    has_signature = check_provider_signature(content)
    placeholder_count, placeholder_samples = check_placeholders_remaining(content)
    
    # Display results
    exit_code = display_results(
        args.file, checklist, missing,
        smart_complete, smart_missing,
        has_hipaa, has_signature,
        placeholder_count, placeholder_samples
    )
    
    sys.exit(exit_code)


if __name__ == '__main__':
    main()

