#!/usr/bin/env python3
"""
Validate clinical trial reports against ICH-E3 structure.

Checks Clinical Study Reports (CSR) for ICH-E3 compliance.

Usage:
    python validate_trial_report.py <csr_file.md>
"""

import argparse
import json
import re
from pathlib import Path


ICH_E3_SECTIONS = {
    "title_page": "Title Page",
    "synopsis": "Synopsis (2)",
    "toc": "Table of Contents (3)",
    "abbreviations": "List of Abbreviations (4)",
    "ethics": "Ethics (Section 2)",
    "investigators": "Investigators and Study Administrative Structure (Section 3)",
    "introduction": "Introduction (Section 4)",
    "objectives": "Study Objectives and Plan (Section 5)",
    "study_patients": "Study Patients (Section 6)",
    "efficacy": "Efficacy Evaluation (Section 7)",
    "safety": "Safety Evaluation (Section 8)",
    "discussion": "Discussion and Overall Conclusions (Section 9)",
    "tables_figures": "Tables, Figures, and Graphs (Section 10)",
    "references": "References (Section 11)",
    "appendices": "Appendices (Section 12-14)",
}


def validate_ich_e3(filename: str) -> dict:
    """Validate CSR structure against ICH-E3."""
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    results = {}
    for section_id, section_name in ICH_E3_SECTIONS.items():
        # Simple pattern matching for section headers
        pattern = rf"(?i)##?\s*{re.escape(section_name.split('(')[0].strip())}"
        found = bool(re.search(pattern, content))
        results[section_id] = {"name": section_name, "found": found}
    
    compliance_rate = sum(1 for r in results.values() if r["found"]) / len(results) * 100
    
    return {
        "filename": filename,
        "compliance_rate": round(compliance_rate, 1),
        "sections": results,
        "status": "PASS" if compliance_rate >= 90 else "NEEDS_REVISION"
    }


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description="Validate CSR against ICH-E3")
    parser.add_argument("input_file", help="Path to CSR file")
    parser.add_argument("--json", action="store_true", help="Output JSON")
    
    args = parser.parse_args()
    
    try:
        report = validate_ich_e3(args.input_file)
        
        if args.json:
            print(json.dumps(report, indent=2))
        else:
            print(f"\nICH-E3 Compliance: {report['compliance_rate']}%")
            print(f"Status: {report['status']}\n")
            print("Section Checklist:")
            for section, details in report["sections"].items():
                symbol = "✓" if details["found"] else "✗"
                print(f"{symbol} {details['name']}")
        
        return 0 if report["status"] == "PASS" else 1
        
    except Exception as e:
        print(f"Error: {e}")
        return 1


if __name__ == "__main__":
    import sys
    sys.exit(main())

