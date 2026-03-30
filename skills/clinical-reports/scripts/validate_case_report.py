#!/usr/bin/env python3
"""
Validate case reports against CARE (CAse REport) guidelines.

This script checks a clinical case report for compliance with CARE guidelines
and provides a checklist of required elements.

Usage:
    python validate_case_report.py <input_file.md|.txt>
    python validate_case_report.py <input_file> --output report.json
"""

import argparse
import json
import re
from pathlib import Path
from typing import Dict, List, Tuple


class CareValidator:
    """Validator for CARE guideline compliance."""
    
    # CARE checklist items with regex patterns
    CARE_REQUIREMENTS = {
        "title": {
            "name": "Title contains 'case report'",
            "pattern": r"(?i)(case\s+report|case\s+study)",
            "section": "Title",
            "required": True
        },
        "keywords": {
            "name": "Keywords provided (2-5)",
            "pattern": r"(?i)keywords?[:]\s*(.+)",
            "section": "Keywords",
            "required": True
        },
        "abstract": {
            "name": "Abstract present",
            "pattern": r"(?i)##?\s*abstract",
            "section": "Abstract",
            "required": True
        },
        "introduction": {
            "name": "Introduction explaining novelty",
            "pattern": r"(?i)##?\s*introduction",
            "section": "Introduction",
            "required": True
        },
        "patient_info": {
            "name": "Patient demographics present",
            "pattern": r"(?i)(patient\s+information|demographics?)",
            "section": "Patient Information",
            "required": True
        },
        "clinical_findings": {
            "name": "Clinical findings documented",
            "pattern": r"(?i)(clinical\s+findings?|physical\s+exam)",
            "section": "Clinical Findings",
            "required": True
        },
        "timeline": {
            "name": "Timeline of events",
            "pattern": r"(?i)(timeline|chronology)",
            "section": "Timeline",
            "required": True
        },
        "diagnostic": {
            "name": "Diagnostic assessment",
            "pattern": r"(?i)diagnostic\s+(assessment|evaluation|workup)",
            "section": "Diagnostic Assessment",
            "required": True
        },
        "therapeutic": {
            "name": "Therapeutic interventions",
            "pattern": r"(?i)(therapeutic\s+intervention|treatment)",
            "section": "Therapeutic Interventions",
            "required": True
        },
        "followup": {
            "name": "Follow-up and outcomes",
            "pattern": r"(?i)(follow[\-\s]?up|outcomes?)",
            "section": "Follow-up and Outcomes",
            "required": True
        },
        "discussion": {
            "name": "Discussion with literature review",
            "pattern": r"(?i)##?\s*discussion",
            "section": "Discussion",
            "required": True
        },
        "consent": {
            "name": "Informed consent statement",
            "pattern": r"(?i)(informed\s+consent|written\s+consent|consent.*obtained)",
            "section": "Informed Consent",
            "required": True
        },
    }
    
    # HIPAA identifiers to check for
    HIPAA_PATTERNS = {
        "dates": r"\b(0?[1-9]|1[0-2])/(0?[1-9]|[12][0-9]|3[01])/\d{4}\b",
        "phone": r"\b\d{3}[-.]?\d{3}[-.]?\d{4}\b",
        "email": r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b",
        "ssn": r"\b\d{3}-\d{2}-\d{4}\b",
        "mrn": r"(?i)(mrn|medical\s+record)[:]\s*\d+",
        "zip_full": r"\b\d{5}-\d{4}\b",
    }
    
    def __init__(self, filename: str):
        """Initialize validator with input file."""
        self.filename = Path(filename)
        self.content = self._read_file()
        self.results = {}
        
    def _read_file(self) -> str:
        """Read input file content."""
        try:
            with open(self.filename, 'r', encoding='utf-8') as f:
                return f.read()
        except FileNotFoundError:
            raise FileNotFoundError(f"File not found: {self.filename}")
        except Exception as e:
            raise Exception(f"Error reading file: {e}")
    
    def validate_care_compliance(self) -> Dict[str, Dict]:
        """Validate compliance with CARE guidelines."""
        results = {}
        
        for key, item in self.CARE_REQUIREMENTS.items():
            pattern = item["pattern"]
            found = bool(re.search(pattern, self.content))
            
            results[key] = {
                "name": item["name"],
                "section": item["section"],
                "required": item["required"],
                "found": found,
                "status": "PASS" if found else "FAIL" if item["required"] else "WARNING"
            }
        
        self.results["care_compliance"] = results
        return results
    
    def check_deidentification(self) -> Dict[str, List[str]]:
        """Check for potential HIPAA identifier violations."""
        violations = {}
        
        for identifier, pattern in self.HIPAA_PATTERNS.items():
            matches = re.findall(pattern, self.content)
            if matches:
                violations[identifier] = matches[:5]  # Limit to first 5 examples
        
        self.results["hipaa_violations"] = violations
        return violations
    
    def check_word_count(self) -> Dict[str, int]:
        """Check word count and provide limits guidance."""
        words = len(re.findall(r'\b\w+\b', self.content))
        
        word_count = {
            "total_words": words,
            "typical_min": 1500,
            "typical_max": 3000,
            "status": "ACCEPTABLE" if 1500 <= words <= 3500 else "CHECK"
        }
        
        self.results["word_count"] = word_count
        return word_count
    
    def check_references(self) -> Dict[str, any]:
        """Check for presence of references."""
        ref_patterns = [
            r"##?\s*references",
            r"\[\d+\]",
            r"\d+\.\s+[A-Z][a-z]+.*\d{4}",  # Numbered references
        ]
        
        has_refs = any(re.search(p, self.content, re.IGNORECASE) for p in ref_patterns)
        ref_count = len(re.findall(r"\[\d+\]", self.content))
        
        references = {
            "has_references": has_refs,
            "estimated_count": ref_count,
            "recommended_min": 10,
            "status": "ACCEPTABLE" if ref_count >= 10 else "LOW"
        }
        
        self.results["references"] = references
        return references
    
    def generate_report(self) -> Dict:
        """Generate comprehensive validation report."""
        if not self.results:
            self.validate_care_compliance()
            self.check_deidentification()
            self.check_word_count()
            self.check_references()
        
        # Calculate overall compliance
        care = self.results["care_compliance"]
        total_required = sum(1 for v in care.values() if v["required"])
        passed = sum(1 for v in care.values() if v["required"] and v["found"])
        compliance_rate = (passed / total_required * 100) if total_required > 0 else 0
        
        report = {
            "filename": str(self.filename),
            "compliance_rate": round(compliance_rate, 1),
            "care_compliance": care,
            "hipaa_violations": self.results["hipaa_violations"],
            "word_count": self.results["word_count"],
            "references": self.results["references"],
            "overall_status": "PASS" if compliance_rate >= 90 and not self.results["hipaa_violations"] else "NEEDS_REVISION"
        }
        
        return report
    
    def print_report(self):
        """Print human-readable validation report."""
        report = self.generate_report()
        
        print("=" * 70)
        print(f"CARE Guideline Validation Report")
        print(f"File: {report['filename']}")
        print("=" * 70)
        print()
        
        print(f"Overall Compliance: {report['compliance_rate']}%")
        print(f"Status: {report['overall_status']}")
        print()
        
        print("CARE Checklist:")
        print("-" * 70)
        for key, item in report["care_compliance"].items():
            status_symbol = "✓" if item["found"] else "✗"
            print(f"{status_symbol} [{item['status']:8}] {item['name']}")
        print()
        
        if report["hipaa_violations"]:
            print("HIPAA DE-IDENTIFICATION WARNINGS:")
            print("-" * 70)
            for identifier, examples in report["hipaa_violations"].items():
                print(f"⚠  {identifier.upper()}: {len(examples)} instance(s) found")
                for ex in examples[:3]:
                    print(f"   Example: {ex}")
            print()
        else:
            print("✓ No obvious HIPAA identifiers detected")
            print()
        
        wc = report["word_count"]
        print(f"Word Count: {wc['total_words']} words")
        print(f"  Typical range: {wc['typical_min']}-{wc['typical_max']} words")
        print(f"  Status: {wc['status']}")
        print()
        
        refs = report["references"]
        print(f"References: {refs['estimated_count']} citation(s) detected")
        print(f"  Recommended minimum: {refs['recommended_min']}")
        print(f"  Status: {refs['status']}")
        print()
        
        print("=" * 70)
        
        # Recommendations
        issues = []
        if report['compliance_rate'] < 100:
            missing = [v["name"] for v in report["care_compliance"].values() if v["required"] and not v["found"]]
            issues.append(f"Missing required sections: {', '.join(missing)}")
        
        if report["hipaa_violations"]:
            issues.append("HIPAA identifiers detected - review de-identification")
        
        if refs["status"] == "LOW":
            issues.append("Low reference count - consider adding more citations")
        
        if issues:
            print("RECOMMENDATIONS:")
            for i, issue in enumerate(issues, 1):
                print(f"{i}. {issue}")
        else:
            print("✓ Case report meets CARE guidelines!")
        
        print("=" * 70)


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Validate clinical case reports against CARE guidelines"
    )
    parser.add_argument(
        "input_file",
        help="Path to case report file (Markdown or text)"
    )
    parser.add_argument(
        "--output",
        "-o",
        help="Output JSON report to file"
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output JSON to stdout instead of human-readable report"
    )
    
    args = parser.parse_args()
    
    try:
        validator = CareValidator(args.input_file)
        report = validator.generate_report()
        
        if args.json:
            print(json.dumps(report, indent=2))
        else:
            validator.print_report()
        
        if args.output:
            with open(args.output, 'w') as f:
                json.dumps(report, f, indent=2)
            print(f"\nJSON report saved to: {args.output}")
        
        # Exit with non-zero if validation failed
        exit_code = 0 if report["overall_status"] == "PASS" else 1
        return exit_code
        
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    import sys
    sys.exit(main())

