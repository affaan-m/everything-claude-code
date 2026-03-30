#!/usr/bin/env python3
"""
ISO 13485 Gap Analysis Tool

This script analyzes documentation provided by the user and identifies gaps
against ISO 13485:2016 requirements.

Usage:
    python gap_analyzer.py --docs-dir <path> [--output <path>]
"""

import os
import sys
import argparse
import json
from pathlib import Path
from typing import Dict, List, Set, Tuple
from datetime import datetime


# ISO 13485:2016 Required Documented Procedures
REQUIRED_PROCEDURES = {
    "4.1.5": {
        "title": "Risk Management",
        "keywords": ["risk", "risk management", "iso 14971", "risk analysis", "risk control"],
        "clause": "4.1.5"
    },
    "4.1.6": {
        "title": "Software Validation",
        "keywords": ["software validation", "computer software", "software application", "validation"],
        "clause": "4.1.6"
    },
    "4.2.4": {
        "title": "Control of Documents",
        "keywords": ["document control", "document approval", "document revision", "obsolete document"],
        "clause": "4.2.4"
    },
    "4.2.5": {
        "title": "Control of Records",
        "keywords": ["record control", "retention", "record storage", "record retrieval"],
        "clause": "4.2.5"
    },
    "5.5.3": {
        "title": "Internal Communication",
        "keywords": ["internal communication", "communication process", "qms communication"],
        "clause": "5.5.3"
    },
    "5.6.1": {
        "title": "Management Review",
        "keywords": ["management review", "review meeting", "management meeting"],
        "clause": "5.6.1"
    },
    "6.2": {
        "title": "Human Resources / Competence",
        "keywords": ["competence", "training", "human resources", "personnel qualification"],
        "clause": "6.2"
    },
    "7.2.3": {
        "title": "Customer Communication",
        "keywords": ["customer communication", "customer feedback", "advisory notice"],
        "clause": "7.2.3"
    },
    "7.3": {
        "title": "Design and Development",
        "keywords": ["design", "development", "design input", "design output", "design verification", "design validation"],
        "clause": "7.3"
    },
    "7.4.1": {
        "title": "Purchasing",
        "keywords": ["purchasing", "supplier", "procurement", "vendor"],
        "clause": "7.4.1"
    },
    "7.4.3": {
        "title": "Verification of Purchased Product",
        "keywords": ["purchased product", "incoming inspection", "verification of purchased"],
        "clause": "7.4.3"
    },
    "7.5.1": {
        "title": "Production and Service Provision",
        "keywords": ["production", "manufacturing", "work instruction", "process control"],
        "clause": "7.5.1"
    },
    "7.5.6": {
        "title": "Process Validation",
        "keywords": ["process validation", "validation protocol", "validation report"],
        "clause": "7.5.6"
    },
    "7.5.8": {
        "title": "Product Identification",
        "keywords": ["product identification", "identification", "labeling", "marking"],
        "clause": "7.5.8"
    },
    "7.5.9": {
        "title": "Traceability",
        "keywords": ["traceability", "lot", "serial number", "batch"],
        "clause": "7.5.9"
    },
    "7.5.11": {
        "title": "Preservation of Product",
        "keywords": ["preservation", "storage", "packaging", "handling"],
        "clause": "7.5.11"
    },
    "7.6": {
        "title": "Control of Monitoring and Measuring Equipment",
        "keywords": ["calibration", "monitoring equipment", "measuring equipment", "measurement"],
        "clause": "7.6"
    },
    "8.2.1": {
        "title": "Feedback",
        "keywords": ["feedback", "post-production", "post-market", "early warning"],
        "clause": "8.2.1"
    },
    "8.2.2": {
        "title": "Complaint Handling",
        "keywords": ["complaint", "customer complaint", "complaint handling", "complaint investigation"],
        "clause": "8.2.2"
    },
    "8.2.3": {
        "title": "Reporting to Regulatory Authorities",
        "keywords": ["regulatory reporting", "adverse event", "mdr report", "reportable event"],
        "clause": "8.2.3"
    },
    "8.2.4": {
        "title": "Internal Audit",
        "keywords": ["internal audit", "audit program", "audit plan", "audit checklist"],
        "clause": "8.2.4"
    },
    "8.2.5": {
        "title": "Monitoring and Measurement of Processes",
        "keywords": ["process monitoring", "process measurement", "process metrics"],
        "clause": "8.2.5"
    },
    "8.2.6": {
        "title": "Monitoring and Measurement of Product",
        "keywords": ["product inspection", "product testing", "acceptance criteria", "release"],
        "clause": "8.2.6"
    },
    "8.3": {
        "title": "Control of Nonconforming Product",
        "keywords": ["nonconforming", "ncr", "nonconformance", "reject"],
        "clause": "8.3"
    },
    "8.5.2": {
        "title": "Corrective Action",
        "keywords": ["corrective action", "capa", "root cause"],
        "clause": "8.5.2"
    },
    "8.5.3": {
        "title": "Preventive Action",
        "keywords": ["preventive action", "capa", "prevention"],
        "clause": "8.5.3"
    }
}

# Additional key documents (not procedures but required)
KEY_DOCUMENTS = {
    "Quality Manual": ["quality manual", "qm-", "quality management system"],
    "Medical Device File": ["medical device file", "mdf", "device master record", "dmr"],
    "Quality Policy": ["quality policy"],
    "Quality Objectives": ["quality objective"],
}


class GapAnalyzer:
    """Analyzes documentation against ISO 13485 requirements."""

    def __init__(self, docs_dir: str):
        """Initialize analyzer with document directory."""
        self.docs_dir = Path(docs_dir)
        self.found_procedures: Dict[str, List[str]] = {}
        self.found_documents: Dict[str, List[str]] = {}

    def analyze(self) -> Dict:
        """Run gap analysis on provided documentation."""
        print(f"Analyzing documents in: {self.docs_dir}")

        if not self.docs_dir.exists():
            print(f"ERROR: Directory not found: {self.docs_dir}")
            return {}

        # Scan all documents
        documents = self._scan_documents()
        print(f"Found {len(documents)} documents to analyze")

        # Search for each required procedure
        for clause_id, proc_info in REQUIRED_PROCEDURES.items():
            self._search_for_procedure(documents, clause_id, proc_info)

        # Search for key documents
        for doc_name, keywords in KEY_DOCUMENTS.items():
            self._search_for_document(documents, doc_name, keywords)

        # Generate gap analysis report
        report = self._generate_report()

        return report

    def _scan_documents(self) -> List[Tuple[Path, str]]:
        """Scan directory for documents and read content."""
        documents = []

        # Supported file extensions
        extensions = ['.txt', '.md', '.doc', '.docx', '.pdf', '.odt']

        for ext in extensions:
            for file_path in self.docs_dir.rglob(f'*{ext}'):
                try:
                    # Read file content (simple text reading)
                    if ext in ['.txt', '.md']:
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read().lower()
                            documents.append((file_path, content))
                    else:
                        # For other formats, just note the filename
                        # (Full text extraction would require additional libraries)
                        filename = file_path.name.lower()
                        documents.append((file_path, filename))
                except Exception as e:
                    print(f"Warning: Could not read {file_path}: {e}")

        return documents

    def _search_for_procedure(self, documents: List[Tuple[Path, str]],
                             clause_id: str, proc_info: Dict):
        """Search documents for a specific procedure."""
        title = proc_info['title']
        keywords = proc_info['keywords']

        matches = []
        for file_path, content in documents:
            # Check if any keyword appears in the document
            if any(keyword in content for keyword in keywords):
                matches.append(str(file_path.relative_to(self.docs_dir)))

        if matches:
            self.found_procedures[clause_id] = matches

    def _search_for_document(self, documents: List[Tuple[Path, str]],
                            doc_name: str, keywords: List[str]):
        """Search for key documents."""
        matches = []
        for file_path, content in documents:
            if any(keyword in content for keyword in keywords):
                matches.append(str(file_path.relative_to(self.docs_dir)))

        if matches:
            self.found_documents[doc_name] = matches

    def _generate_report(self) -> Dict:
        """Generate comprehensive gap analysis report."""
        total_procedures = len(REQUIRED_PROCEDURES)
        found_count = len(self.found_procedures)
        missing_count = total_procedures - found_count

        missing_procedures = []
        for clause_id, proc_info in REQUIRED_PROCEDURES.items():
            if clause_id not in self.found_procedures:
                missing_procedures.append({
                    "clause": clause_id,
                    "title": proc_info['title'],
                    "keywords": proc_info['keywords']
                })

        missing_documents = []
        for doc_name, keywords in KEY_DOCUMENTS.items():
            if doc_name not in self.found_documents:
                missing_documents.append({
                    "document": doc_name,
                    "keywords": keywords
                })

        compliance_percentage = (found_count / total_procedures) * 100

        report = {
            "analysis_date": datetime.now().isoformat(),
            "documents_analyzed": str(self.docs_dir),
            "summary": {
                "total_required_procedures": total_procedures,
                "procedures_found": found_count,
                "procedures_missing": missing_count,
                "compliance_percentage": round(compliance_percentage, 1)
            },
            "found_procedures": self.found_procedures,
            "missing_procedures": missing_procedures,
            "found_documents": self.found_documents,
            "missing_documents": missing_documents,
            "recommendations": self._generate_recommendations(missing_procedures, missing_documents)
        }

        return report

    def _generate_recommendations(self, missing_procedures: List[Dict],
                                  missing_documents: List[Dict]) -> List[str]:
        """Generate recommendations based on gaps."""
        recommendations = []

        if not self.found_documents.get("Quality Manual"):
            recommendations.append(
                "CRITICAL: Create a Quality Manual - this is the foundational document of your QMS"
            )

        if not self.found_documents.get("Quality Policy"):
            recommendations.append(
                "HIGH PRIORITY: Develop and document your Quality Policy statement"
            )

        if missing_procedures:
            high_priority_clauses = ["8.2.2", "8.5.2", "8.5.3", "7.4.1", "8.2.4"]
            high_priority_missing = [p for p in missing_procedures
                                    if p['clause'] in high_priority_clauses]

            if high_priority_missing:
                titles = [p['title'] for p in high_priority_missing]
                recommendations.append(
                    f"HIGH PRIORITY: Develop the following critical procedures: {', '.join(titles)}"
                )

        if len(missing_procedures) > 20:
            recommendations.append(
                "Consider engaging a consultant or using templates to accelerate QMS development"
            )

        if len(missing_procedures) < 5:
            recommendations.append(
                "You're close to completion! Focus on finalizing remaining procedures and conducting internal audit"
            )

        return recommendations


def print_report(report: Dict):
    """Print formatted gap analysis report."""
    print("\n" + "="*80)
    print(" ISO 13485:2016 GAP ANALYSIS REPORT")
    print("="*80)
    print(f"\nAnalysis Date: {report['analysis_date']}")
    print(f"Documents Location: {report['documents_analyzed']}\n")

    # Summary
    summary = report['summary']
    print("-" * 80)
    print(" SUMMARY")
    print("-" * 80)
    print(f"Total Required Procedures: {summary['total_required_procedures']}")
    print(f"Procedures Found: {summary['procedures_found']}")
    print(f"Procedures Missing: {summary['procedures_missing']}")
    print(f"Compliance: {summary['compliance_percentage']}%\n")

    # Found Procedures
    if report['found_procedures']:
        print("-" * 80)
        print(" FOUND PROCEDURES")
        print("-" * 80)
        for clause_id, files in sorted(report['found_procedures'].items()):
            proc_info = REQUIRED_PROCEDURES[clause_id]
            print(f"\n[{clause_id}] {proc_info['title']}")
            for file in files:
                print(f"  - {file}")

    # Missing Procedures
    if report['missing_procedures']:
        print("\n" + "-" * 80)
        print(" MISSING PROCEDURES")
        print("-" * 80)
        for proc in report['missing_procedures']:
            print(f"\n[{proc['clause']}] {proc['title']}")
            print(f"  Keywords to include: {', '.join(proc['keywords'][:3])}")

    # Found Documents
    if report['found_documents']:
        print("\n" + "-" * 80)
        print(" FOUND KEY DOCUMENTS")
        print("-" * 80)
        for doc_name, files in report['found_documents'].items():
            print(f"\n{doc_name}:")
            for file in files:
                print(f"  - {file}")

    # Missing Documents
    if report['missing_documents']:
        print("\n" + "-" * 80)
        print(" MISSING KEY DOCUMENTS")
        print("-" * 80)
        for doc in report['missing_documents']:
            print(f"  - {doc['document']}")

    # Recommendations
    if report['recommendations']:
        print("\n" + "-" * 80)
        print(" RECOMMENDATIONS")
        print("-" * 80)
        for i, rec in enumerate(report['recommendations'], 1):
            print(f"{i}. {rec}")

    print("\n" + "="*80)
    print(" END OF REPORT")
    print("="*80 + "\n")


def save_report(report: Dict, output_path: str):
    """Save report to JSON file."""
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2)
    print(f"Report saved to: {output_path}")


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description='ISO 13485 Gap Analysis Tool',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument(
        '--docs-dir',
        required=True,
        help='Directory containing documentation to analyze'
    )
    parser.add_argument(
        '--output',
        help='Output file path for JSON report (optional)'
    )

    args = parser.parse_args()

    # Run analysis
    analyzer = GapAnalyzer(args.docs_dir)
    report = analyzer.analyze()

    # Print report
    print_report(report)

    # Save report if output path specified
    if args.output:
        save_report(report, args.output)

    return 0


if __name__ == '__main__':
    sys.exit(main())
