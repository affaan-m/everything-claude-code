#!/usr/bin/env python3
"""
Check clinical reports for regulatory compliance (HIPAA, GCP, FDA).

Usage:
    python compliance_checker.py <report_file>
"""

import argparse
import json
import re


COMPLIANCE_CHECKS = {
    "hipaa": {
        "consent_statement": r"(?i)(informed\s+consent|written\s+consent).*obtained",
        "deidentification": r"(?i)(de-identif|anonymi[sz])",
    },
    "gcp": {
        "irb_approval": r"(?i)(IRB|IEC|ethics\s+committee).*approv",
        "protocol_compliance": r"(?i)protocol",
        "informed_consent": r"(?i)informed\s+consent",
    },
    "fda": {
        "study_id": r"(?i)(IND|IDE|protocol)\s+(number|#)[:]\s*\S+",
        "safety_reporting": r"(?i)(adverse\s+event|SAE)",
    }
}


def check_compliance(filename: str) -> dict:
    """Check regulatory compliance."""
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    results = {}
    for regulation, checks in COMPLIANCE_CHECKS.items():
        reg_results = {}
        for check_name, pattern in checks.items():
            reg_results[check_name] = bool(re.search(pattern, content))
        results[regulation] = reg_results
    
    return {"filename": filename, "compliance": results}


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description="Check regulatory compliance")
    parser.add_argument("input_file", help="Path to clinical report")
    parser.add_argument("--json", action="store_true")
    
    args = parser.parse_args()
    
    try:
        report = check_compliance(args.input_file)
        
        if args.json:
            print(json.dumps(report, indent=2))
        else:
            print("\nRegulatory Compliance Check:\n")
            for reg, checks in report["compliance"].items():
                print(f"{reg.upper()}:")
                for check, passed in checks.items():
                    symbol = "✓" if passed else "✗"
                    print(f"  {symbol} {check}")
                print()
        
        return 0
        
    except Exception as e:
        print(f"Error: {e}")
        return 1


if __name__ == "__main__":
    import sys
    sys.exit(main())

