#!/usr/bin/env python3
"""
Validate medical terminology and coding in clinical reports.

Usage:
    python terminology_validator.py <report_file>
"""

import argparse
import json
import re


# Common medical abbreviations that should be avoided (JCAHO "Do Not Use" list)
DO_NOT_USE = {
    "U": "Unit",
    "IU": "International Unit",
    "QD": "daily",
    "QOD": "every other day",
    "MS": "morphine sulfate or magnesium sulfate",
    "MSO4": "morphine sulfate",
    "MgSO4": "magnesium sulfate",
}

# Common abbreviations with potential ambiguity
AMBIGUOUS = ["cc", "hs", "TIW", "SC", "SQ", "D/C", "AS", "AD", "AU", "OS", "OD", "OU"]


def check_do_not_use_abbreviations(content: str) -> dict:
    """Check for prohibited abbreviations."""
    violations = {}
    
    for abbrev, meaning in DO_NOT_USE.items():
        # Word boundary pattern to avoid false positives
        pattern = rf"\b{re.escape(abbrev)}\b"
        matches = re.findall(pattern, content)
        if matches:
            violations[abbrev] = {
                "count": len(matches),
                "should_use": meaning,
                "severity": "HIGH"
            }
    
    return violations


def check_ambiguous_abbreviations(content: str) -> dict:
    """Check for ambiguous abbreviations."""
    found = {}
    
    for abbrev in AMBIGUOUS:
        pattern = rf"\b{re.escape(abbrev)}\b"
        matches = re.findall(pattern, content, re.IGNORECASE)
        if matches:
            found[abbrev] = {
                "count": len(matches),
                "severity": "MEDIUM"
            }
    
    return found


def validate_icd10_format(content: str) -> list:
    """Check ICD-10 code format."""
    # ICD-10 format: Letter + 2 digits + optional decimal + 0-4 more digits
    pattern = r"\b[A-Z]\d{2}\.?\d{0,4}\b"
    codes = re.findall(pattern, content)
    return list(set(codes))  # Unique codes


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description="Validate medical terminology")
    parser.add_argument("input_file", help="Path to clinical report")
    parser.add_argument("--json", action="store_true")
    
    args = parser.parse_args()
    
    try:
        with open(args.input_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        do_not_use = check_do_not_use_abbreviations(content)
        ambiguous = check_ambiguous_abbreviations(content)
        icd10_codes = validate_icd10_format(content)
        
        report = {
            "filename": args.input_file,
            "do_not_use_violations": do_not_use,
            "ambiguous_abbreviations": ambiguous,
            "icd10_codes_found": icd10_codes,
            "total_issues": len(do_not_use) + len(ambiguous)
        }
        
        if args.json:
            print(json.dumps(report, indent=2))
        else:
            print("\nTerminology Validation Report:\n")
            
            if do_not_use:
                print("❌ DO NOT USE Abbreviations Found:")
                for abbrev, details in do_not_use.items():
                    print(f"  {abbrev}: {details['count']} occurrence(s)")
                    print(f"    → Use '{details['should_use']}' instead")
                print()
            else:
                print("✓ No prohibited abbreviations found\n")
            
            if ambiguous:
                print("⚠  Ambiguous Abbreviations Found:")
                for abbrev, details in ambiguous.items():
                    print(f"  {abbrev}: {details['count']} occurrence(s)")
                print("  Consider spelling out for clarity\n")
            
            if icd10_codes:
                print(f"ℹ  ICD-10 codes detected: {len(icd10_codes)}")
                for code in icd10_codes[:5]:
                    print(f"  - {code}")
                if len(icd10_codes) > 5:
                    print(f"  ... and {len(icd10_codes) - 5} more")
            print()
        
        return 0 if not do_not_use else 1
        
    except Exception as e:
        print(f"Error: {e}")
        return 1


if __name__ == "__main__":
    import sys
    sys.exit(main())

