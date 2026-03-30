#!/usr/bin/env python3
"""
Validate Treatment Plan Quality
Comprehensive validation of treatment plan content quality and compliance.
"""

import sys
import re
import argparse
from pathlib import Path
from typing import Dict, List, Tuple

# Validation criteria and patterns
VALIDATION_CHECKS = {
    'smart_goals': {
        'name': 'SMART Goals Criteria',
        'patterns': [
            (r'\bspecific\b', 'Specific criterion'),
            (r'\bmeasurable\b', 'Measurable criterion'),
            (r'\bachievable\b', 'Achievable criterion'),
            (r'\brelevant\b', 'Relevant criterion'),
            (r'\btime[- ]?bound\b', 'Time-bound criterion')
        ]
    },
    'evidence_based': {
        'name': 'Evidence-Based Practice',
        'patterns': [
            (r'guideline|evidence|study|trial|research', 'Evidence/guideline references'),
            (r'\\cite\{|\\bibitem\{|\\bibliography\{', 'Citations present')
        ]
    },
    'patient_centered': {
        'name': 'Patient-Centered Care',
        'patterns': [
            (r'patient.*preference|shared decision|patient.*value|patient.*priority', 'Patient preferences'),
            (r'quality of life|functional.*goal|patient.*goal', 'Functional/QoL goals')
        ]
    },
    'safety': {
        'name': 'Safety and Risk Mitigation',
        'patterns': [
            (r'adverse.*effect|side effect|risk|complication', 'Adverse effects mentioned'),
            (r'monitoring|warning sign|emergency|when to call', 'Safety monitoring plan')
        ]
    },
    'medication': {
        'name': 'Medication Documentation',
        'patterns': [
            (r'\\d+\s*mg|\\d+\s*mcg|dose|dosage', 'Specific doses'),
            (r'daily|BID|TID|QID|once|twice', 'Frequency specified'),
            (r'rationale|indication|because|for', 'Rationale provided')
        ]
    }
}


def read_file(filepath: Path) -> str:
    """Read and return file contents."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"Error reading file: {e}", file=sys.stderr)
        sys.exit(2)


def validate_content(content: str) -> Dict[str, Tuple[int, int, List[str]]]:
    """
    Validate content against criteria.
    Returns dict with results: {category: (passed, total, missing_items)}
    """
    results = {}
    
    for category, checks in VALIDATION_CHECKS.items():
        patterns = checks['patterns']
        passed = 0
        missing = []
        
        for pattern, description in patterns:
            if re.search(pattern, content, re.IGNORECASE):
                passed += 1
            else:
                missing.append(description)
        
        total = len(patterns)
        results[category] = (passed, total, missing)
    
    return results


def check_icd10_codes(content: str) -> Tuple[bool, int]:
    """Check for ICD-10 code presence."""
    # ICD-10 format: Letter followed by 2 digits, optionally more digits/letters
    pattern = r'\b[A-TV-Z]\d{2}\.?[\dA-TV-Z]*\b'
    matches = re.findall(pattern, content)
    
    has_codes = len(matches) > 0
    count = len(matches)
    
    return has_codes, count


def check_timeframes(content: str) -> Tuple[bool, List[str]]:
    """Check for specific timeframes in goals."""
    timeframe_patterns = [
        r'\d+\s*week',
        r'\d+\s*month',
        r'\d+\s*day',
        r'within\s+\d+',
        r'by\s+\w+\s+\d+'
    ]
    
    found_timeframes = []
    for pattern in timeframe_patterns:
        matches = re.findall(pattern, content, re.IGNORECASE)
        found_timeframes.extend(matches[:3])  # Limit to avoid too many
    
    has_timeframes = len(found_timeframes) > 0
    
    return has_timeframes, found_timeframes[:5]


def check_quantitative_goals(content: str) -> Tuple[bool, List[str]]:
    """Check for quantitative/measurable goals."""
    # Look for numbers with units in goal context
    patterns = [
        r'\d+\s*%',  # Percentages (HbA1c 7%)
        r'\d+/\d+',  # Ratios (BP 130/80)
        r'\d+\s*mg/dL',  # Lab values
        r'\d+\s*mmHg',  # Blood pressure
        r'\d+\s*feet|meters',  # Distance
        r'\d+\s*pounds|lbs|kg',  # Weight
        r'\d+/10',  # Pain scales
        r'\d+\s*minutes|hours'  # Time
    ]
    
    found_metrics = []
    for pattern in patterns:
        matches = re.findall(pattern, content, re.IGNORECASE)
        found_metrics.extend(matches[:2])
    
    has_metrics = len(found_metrics) > 0
    
    return has_metrics, found_metrics[:5]


def assess_readability(content: str) -> str:
    """Basic readability assessment (very simplified)."""
    # Remove LaTeX commands for word count
    text_content = re.sub(r'\\[a-zA-Z]+(\{[^}]*\})?', '', content)
    text_content = re.sub(r'[{}%\\]', '', text_content)
    
    words = text_content.split()
    word_count = len(words)
    
    # Very rough sentences (periods followed by space/newline)
    sentences = re.split(r'[.!?]+\s+', text_content)
    sentence_count = len([s for s in sentences if s.strip()])
    
    if sentence_count > 0:
        avg_words_per_sentence = word_count / sentence_count
        
        if avg_words_per_sentence < 15:
            return "Simple (good for patient materials)"
        elif avg_words_per_sentence < 25:
            return "Moderate (appropriate for professional documentation)"
        else:
            return "Complex (may be difficult for some readers)"
    
    return "Unable to assess"


def display_validation_results(filepath: Path, results: Dict, 
                               has_icd10: bool, icd10_count: int,
                               has_timeframes: bool, timeframe_examples: List[str],
                               has_metrics: bool, metric_examples: List[str],
                               readability: str):
    """Display comprehensive validation results."""
    
    print("\n" + "="*70)
    print("TREATMENT PLAN QUALITY VALIDATION")
    print("="*70)
    print(f"\nFile: {filepath}")
    print(f"File size: {filepath.stat().st_size:,} bytes")
    
    # Overall quality score
    total_passed = sum(r[0] for r in results.values())
    total_checks = sum(r[1] for r in results.values())
    quality_pct = (total_passed / total_checks) * 100 if total_checks > 0 else 0
    
    print("\n" + "-"*70)
    print("OVERALL QUALITY SCORE")
    print("-"*70)
    print(f"Validation checks passed: {total_passed}/{total_checks} ({quality_pct:.0f}%)")
    
    # Detailed category results
    print("\n" + "-"*70)
    print("QUALITY CRITERIA ASSESSMENT")
    print("-"*70)
    
    for category, (passed, total, missing) in results.items():
        category_name = VALIDATION_CHECKS[category]['name']
        pct = (passed / total) * 100 if total > 0 else 0
        status = "✓" if passed == total else "⚠" if passed > 0 else "✗"
        
        print(f"\n{status} {category_name}: {passed}/{total} ({pct:.0f}%)")
        
        if missing:
            print("   Missing:")
            for item in missing:
                print(f"     • {item}")
    
    # Specific checks
    print("\n" + "-"*70)
    print("SPECIFIC VALIDATION CHECKS")
    print("-"*70)
    
    # ICD-10 codes
    if has_icd10:
        print(f"✓ ICD-10 diagnosis codes present ({icd10_count} found)")
    else:
        print("✗ No ICD-10 diagnosis codes detected")
        print("   Recommendation: Include ICD-10 codes for all diagnoses")
    
    # Timeframes
    if has_timeframes:
        print(f"✓ Time-bound goals present")
        if timeframe_examples:
            print("   Examples:", ", ".join(timeframe_examples[:3]))
    else:
        print("✗ No specific timeframes found in goals")
        print("   Recommendation: Add specific timeframes (e.g., 'within 3 months', '8 weeks')")
    
    # Measurable metrics
    if has_metrics:
        print(f"✓ Quantitative/measurable goals present")
        if metric_examples:
            print("   Examples:", ", ".join(metric_examples[:3]))
    else:
        print("⚠ Limited quantitative metrics found")
        print("   Recommendation: Include specific measurable targets (HbA1c <7%, BP <130/80)")
    
    # Readability
    print(f"\nReadability assessment: {readability}")
    
    # Summary and recommendations
    print("\n" + "="*70)
    print("SUMMARY AND RECOMMENDATIONS")
    print("="*70)
    
    if quality_pct >= 90:
        print("\n✓ EXCELLENT quality - Treatment plan meets high standards")
    elif quality_pct >= 75:
        print("\n✓ GOOD quality - Treatment plan is well-developed with minor areas for improvement")
    elif quality_pct >= 60:
        print("\n⚠ FAIR quality - Several important elements need strengthening")
    else:
        print("\n✗ NEEDS IMPROVEMENT - Significant quality issues to address")
    
    # Specific recommendations
    print("\nKey Recommendations:")
    
    recommendations = []
    
    # SMART goals
    if results['smart_goals'][0] < results['smart_goals'][1]:
        recommendations.append("Ensure all goals meet SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound)")
    
    # Evidence-based
    if results['evidence_based'][0] == 0:
        recommendations.append("Add evidence-based rationale and cite clinical practice guidelines")
    
    # Patient-centered
    if results['patient_centered'][0] < results['patient_centered'][1]:
        recommendations.append("Incorporate patient preferences and functional quality-of-life goals")
    
    # Safety
    if results['safety'][0] < results['safety'][1]:
        recommendations.append("Include comprehensive safety monitoring and risk mitigation strategies")
    
    # Medication documentation
    if results['medication'][0] < results['medication'][1]:
        recommendations.append("Document medications with specific doses, frequencies, and rationales")
    
    if not has_icd10:
        recommendations.append("Add ICD-10 diagnosis codes for billing and documentation support")
    
    if not has_timeframes:
        recommendations.append("Add specific timeframes to all treatment goals")
    
    if recommendations:
        for i, rec in enumerate(recommendations, 1):
            print(f"{i}. {rec}")
    else:
        print("None - Treatment plan demonstrates excellent quality across all criteria!")
    
    print("\n" + "="*70)
    
    # Return exit code
    return 0 if quality_pct >= 70 else 1


def main():
    parser = argparse.ArgumentParser(
        description='Validate treatment plan quality and compliance',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Validate a treatment plan
  python validate_treatment_plan.py my_plan.tex

  # Use in automated workflows (exits with error if quality <70%)
  python validate_treatment_plan.py plan.tex && echo "Quality check passed"

Validation Categories:
  - SMART goals criteria (Specific, Measurable, Achievable, Relevant, Time-bound)
  - Evidence-based practice (guidelines, citations)
  - Patient-centered care (preferences, functional goals)
  - Safety and risk mitigation (adverse effects, monitoring)
  - Medication documentation (doses, frequencies, rationales)
  - ICD-10 coding, timeframes, measurable metrics

Exit Codes:
  0 - Quality ≥70% (acceptable)
  1 - Quality <70% (needs improvement)
  2 - File error or invalid arguments
        """
    )
    
    parser.add_argument(
        'file',
        type=Path,
        help='Treatment plan file to validate (.tex format)'
    )
    
    args = parser.parse_args()
    
    # Check file exists
    if not args.file.exists():
        print(f"Error: File not found: {args.file}", file=sys.stderr)
        sys.exit(2)
    
    # Read and validate
    content = read_file(args.file)
    
    # Run validation checks
    results = validate_content(content)
    has_icd10, icd10_count = check_icd10_codes(content)
    has_timeframes, timeframe_examples = check_timeframes(content)
    has_metrics, metric_examples = check_quantitative_goals(content)
    readability = assess_readability(content)
    
    # Display results
    exit_code = display_validation_results(
        args.file, results,
        has_icd10, icd10_count,
        has_timeframes, timeframe_examples,
        has_metrics, metric_examples,
        readability
    )
    
    sys.exit(exit_code)


if __name__ == '__main__':
    main()

