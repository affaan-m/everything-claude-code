#!/usr/bin/env python3
"""
Check clinical reports for HIPAA identifiers that need removal.

Scans text for 18 HIPAA identifiers and flags potential privacy violations.

Usage:
    python check_deidentification.py <input_file>
    python check_deidentification.py <input_file> --output violations.json
"""

import argparse
import json
import re
from pathlib import Path
from typing import Dict, List


# 18 HIPAA Identifiers patterns
HIPAA_IDENTIFIERS = {
    "1_names": {
        "description": "Names (patient, family, providers)",
        "patterns": [
            r"\b(Dr\.|Mr\.|Mrs\.|Ms\.)\s+[A-Z][a-z]+",
            r"\b[A-Z][a-z]+,\s+[A-Z][a-z]+\b",  # Last, First
        ],
        "severity": "HIGH"
    },
    "2_geographic": {
        "description": "Geographic subdivisions smaller than state",
        "patterns": [
            r"\b\d+\s+[A-Z][a-z]+\s+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr)\b",
            r"\b[A-Z][a-z]+,\s+[A-Z]{2}\s+\d{5}\b",  # City, ST ZIP
        ],
        "severity": "HIGH"
    },
    "3_dates": {
        "description": "Dates (except year)",
        "patterns": [
            r"\b(0?[1-9]|1[0-2])/(0?[1-9]|[12][0-9]|3[01])/\d{4}\b",
            r"\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},\s+\d{4}\b",
            r"\b\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b",
        ],
        "severity": "HIGH"
    },
    "4_telephone": {
        "description": "Telephone numbers",
        "patterns": [
            r"\b\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b",
            r"\b1-\d{3}-\d{3}-\d{4}\b",
        ],
        "severity": "HIGH"
    },
    "5_fax": {
        "description": "Fax numbers",
        "patterns": [
            r"(?i)fax[:]\s*\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}",
        ],
        "severity": "HIGH"
    },
    "6_email": {
        "description": "Email addresses",
        "patterns": [
            r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b",
        ],
        "severity": "HIGH"
    },
    "7_ssn": {
        "description": "Social Security numbers",
        "patterns": [
            r"\b\d{3}-\d{2}-\d{4}\b",
            r"\b\d{9}\b",
        ],
        "severity": "CRITICAL"
    },
    "8_mrn": {
        "description": "Medical record numbers",
        "patterns": [
            r"(?i)(mrn|medical\s+record\s+(number|#))[:]\s*\d+",
            r"(?i)patient\s+id[:]\s*\d+",
        ],
        "severity": "HIGH"
    },
    "9_health_plan": {
        "description": "Health plan beneficiary numbers",
        "patterns": [
            r"(?i)(insurance|policy)\s+(number|#|id)[:]\s*[A-Z0-9]+",
        ],
        "severity": "HIGH"
    },
    "10_account": {
        "description": "Account numbers",
        "patterns": [
            r"(?i)account\s+(number|#)[:]\s*\d+",
        ],
        "severity": "MEDIUM"
    },
    "11_license": {
        "description": "Certificate/license numbers",
        "patterns": [
            r"(?i)(driver[']?s\s+license|DL)[:]\s*[A-Z0-9]+",
        ],
        "severity": "MEDIUM"
    },
    "12_vehicle": {
        "description": "Vehicle identifiers",
        "patterns": [
            r"(?i)(license\s+plate|VIN)[:]\s*[A-Z0-9]+",
        ],
        "severity": "MEDIUM"
    },
    "13_device": {
        "description": "Device identifiers and serial numbers",
        "patterns": [
            r"(?i)(serial|device)\s+(number|#)[:]\s*[A-Z0-9-]+",
        ],
        "severity": "MEDIUM"
    },
    "14_url": {
        "description": "Web URLs",
        "patterns": [
            r"https?://[^\s]+",
            r"www\.[^\s]+",
        ],
        "severity": "MEDIUM"
    },
    "15_ip": {
        "description": "IP addresses",
        "patterns": [
            r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b",
        ],
        "severity": "HIGH"
    },
    "16_biometric": {
        "description": "Biometric identifiers",
        "patterns": [
            r"(?i)(fingerprint|voiceprint|retinal\s+scan)",
        ],
        "severity": "CRITICAL"
    },
    "17_photos": {
        "description": "Full-face photographs",
        "patterns": [
            r"(?i)(photograph|photo|image).*face",
            r"\.(jpg|jpeg|png|gif)\b",
        ],
        "severity": "HIGH"
    },
    "18_unique": {
        "description": "Any other unique identifying characteristic",
        "patterns": [
            r"(?i)(tattoo|birthmark|scar).*unique",
        ],
        "severity": "MEDIUM"
    },
}


def check_identifiers(text: str) -> Dict:
    """Check text for HIPAA identifiers."""
    violations = {}
    total_issues = 0
    
    for identifier_id, config in HIPAA_IDENTIFIERS.items():
        matches = []
        for pattern in config["patterns"]:
            found = re.findall(pattern, text, re.IGNORECASE)
            matches.extend(found)
        
        if matches:
            # Remove duplicates, limit to first 5 examples
            unique_matches = list(set(matches))[:5]
            violations[identifier_id] = {
                "description": config["description"],
                "severity": config["severity"],
                "count": len(matches),
                "examples": unique_matches
            }
            total_issues += len(matches)
    
    return {
        "total_violations": len(violations),
        "total_instances": total_issues,
        "violations": violations
    }


def check_age_compliance(text: str) -> Dict:
    """Check if ages >89 are properly aggregated."""
    age_pattern = r"\b(\d{2,3})\s*(?:year|yr)s?[\s-]?old\b"
    ages = [int(age) for age in re.findall(age_pattern, text, re.IGNORECASE)]
    
    violations = [age for age in ages if age > 89]
    
    return {
        "ages_over_89": len(violations),
        "examples": violations[:5] if violations else [],
        "compliant": len(violations) == 0
    }


def generate_report(filename: str) -> Dict:
    """Generate de-identification compliance report."""
    filepath = Path(filename)
    
    if not filepath.exists():
        raise FileNotFoundError(f"File not found: {filename}")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()
    
    identifier_check = check_identifiers(text)
    age_check = check_age_compliance(text)
    
    # Determine overall compliance
    critical_violations = sum(
        1 for v in identifier_check["violations"].values()
        if v["severity"] == "CRITICAL"
    )
    high_violations = sum(
        1 for v in identifier_check["violations"].values()
        if v["severity"] == "HIGH"
    )
    
    if critical_violations > 0 or high_violations >= 3:
        status = "NON_COMPLIANT"
    elif high_violations > 0 or not age_check["compliant"]:
        status = "NEEDS_REVIEW"
    else:
        status = "COMPLIANT"
    
    report = {
        "filename": str(filename),
        "status": status,
        "identifier_violations": identifier_check,
        "age_compliance": age_check,
        "recommendation": get_recommendation(status, identifier_check, age_check)
    }
    
    return report


def get_recommendation(status: str, identifiers: Dict, ages: Dict) -> str:
    """Generate recommendation based on findings."""
    if status == "COMPLIANT":
        return "Document appears compliant. Perform final manual review before publication."
    
    recommendations = []
    
    if identifiers["total_violations"] > 0:
        recommendations.append(
            f"Remove or redact {identifiers['total_instances']} identified HIPAA identifiers."
        )
    
    if not ages["compliant"]:
        recommendations.append(
            f"Aggregate {ages['ages_over_89']} age(s) >89 years to '90 or older' or '>89 years'."
        )
    
    return " ".join(recommendations)


def print_report(report: Dict):
    """Print human-readable report."""
    print("=" * 70)
    print("HIPAA DE-IDENTIFICATION CHECK")
    print(f"File: {report['filename']}")
    print("=" * 70)
    print()
    
    print(f"Overall Status: {report['status']}")
    print()
    
    if report["identifier_violations"]["total_violations"] == 0:
        print("✓ No HIPAA identifiers detected")
    else:
        print(f"⚠  Found {report['identifier_violations']['total_violations']} types of violations")
        print(f"   Total instances: {report['identifier_violations']['total_instances']}")
        print()
        
        print("Violations by type:")
        print("-" * 70)
        
        for id_type, details in sorted(
            report["identifier_violations"]["violations"].items(),
            key=lambda x: {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2}[x[1]["severity"]]
        ):
            severity_symbol = "⚠⚠⚠" if details["severity"] == "CRITICAL" else "⚠⚠" if details["severity"] == "HIGH" else "⚠"
            print(f"{severity_symbol} [{details['severity']:8}] {details['description']}")
            print(f"   Count: {details['count']}")
            print(f"   Examples:")
            for example in details["examples"]:
                print(f"     - {example}")
            print()
    
    age_check = report["age_compliance"]
    if age_check["compliant"]:
        print("✓ Age reporting compliant (no ages >89 or properly aggregated)")
    else:
        print(f"⚠  Age compliance issue: {age_check['ages_over_89']} age(s) >89 detected")
        print(f"   Ages must be aggregated to '90 or older' or '>89 years'")
        print(f"   Ages found: {age_check['examples']}")
    
    print()
    print("Recommendation:")
    print(report["recommendation"])
    print("=" * 70)


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Check clinical reports for HIPAA identifiers"
    )
    parser.add_argument("input_file", help="Path to clinical report file")
    parser.add_argument("--output", "-o", help="Output JSON report to file")
    parser.add_argument("--json", action="store_true", help="Output JSON to stdout")
    
    args = parser.parse_args()
    
    try:
        report = generate_report(args.input_file)
        
        if args.json:
            print(json.dumps(report, indent=2))
        else:
            print_report(report)
        
        if args.output:
            with open(args.output, 'w') as f:
                json.dump(report, f, indent=2)
            print(f"\nJSON report saved to: {args.output}")
        
        # Exit with non-zero if violations found
        exit_code = 0 if report["status"] == "COMPLIANT" else 1
        return exit_code
        
    except Exception as e:
        print(f"Error: {e}")
        return 1


if __name__ == "__main__":
    import sys
    sys.exit(main())

