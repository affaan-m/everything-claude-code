#!/usr/bin/env python3
"""
Validate Clinical Decision Support Documents for Quality and Completeness

Checks for:
- Evidence citations for all recommendations
- Statistical reporting completeness
- Biomarker nomenclature consistency
- Required sections present
- HIPAA de-identification
- GRADE recommendation format

Dependencies: None (pure Python)
"""

import re
import argparse
from pathlib import Path
from collections import defaultdict


class CDSValidator:
    """Validator for clinical decision support documents."""
    
    def __init__(self, filepath):
        self.filepath = filepath
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            self.content = f.read()
        
        self.errors = []
        self.warnings = []
        self.info = []
    
    def validate_all(self):
        """Run all validation checks."""
        
        print(f"Validating: {self.filepath}")
        print("="*70)
        
        self.check_required_sections()
        self.check_evidence_citations()
        self.check_recommendation_grading()
        self.check_statistical_reporting()
        self.check_hipaa_identifiers()
        self.check_biomarker_nomenclature()
        
        return self.generate_report()
    
    def check_required_sections(self):
        """Check if required sections are present."""
        
        # Cohort analysis required sections
        cohort_sections = [
            'cohort characteristics',
            'biomarker',
            'outcomes',
            'statistical analysis',
            'clinical implications',
            'references'
        ]
        
        # Treatment recommendation required sections
        rec_sections = [
            'evidence',
            'recommendation',
            'monitoring',
            'references'
        ]
        
        content_lower = self.content.lower()
        
        # Check which document type
        is_cohort = 'cohort' in content_lower
        is_recommendation = 'recommendation' in content_lower
        
        if is_cohort:
            missing = [sec for sec in cohort_sections if sec not in content_lower]
            if missing:
                self.warnings.append(f"Cohort analysis may be missing sections: {', '.join(missing)}")
            else:
                self.info.append("All cohort analysis sections present")
        
        if is_recommendation:
            missing = [sec for sec in rec_sections if sec not in content_lower]
            if missing:
                self.errors.append(f"Recommendation document missing required sections: {', '.join(missing)}")
            else:
                self.info.append("All recommendation sections present")
    
    def check_evidence_citations(self):
        """Check that recommendations have citations."""
        
        # Find recommendation statements
        rec_pattern = r'(recommend|should|prefer|suggest|consider)(.*?)(?:\n\n|\Z)'
        recommendations = re.findall(rec_pattern, self.content, re.IGNORECASE | re.DOTALL)
        
        # Find citations  
        citation_patterns = [
            r'\[\d+\]',  # Numbered citations [1]
            r'\(.*?\d{4}\)',  # Author year (Smith 2020)
            r'et al\.',  # Et al citations
            r'NCCN|ASCO|ESMO',  # Guideline references
        ]
        
        uncited_recommendations = []
        
        for i, (_, rec_text) in enumerate(recommendations):
            has_citation = any(re.search(pattern, rec_text) for pattern in citation_patterns)
            
            if not has_citation:
                snippet = rec_text[:60].strip() + '...'
                uncited_recommendations.append(snippet)
        
        if uncited_recommendations:
            self.warnings.append(f"Found {len(uncited_recommendations)} recommendations without citations")
            for rec in uncited_recommendations[:3]:  # Show first 3
                self.warnings.append(f"  - {rec}")
        else:
            self.info.append(f"All {len(recommendations)} recommendations have citations")
    
    def check_recommendation_grading(self):
        """Check for GRADE-style recommendation strength."""
        
        # Look for GRADE notation (1A, 1B, 2A, 2B, 2C)
        grade_pattern = r'GRADE\s*[12][A-C]|Grade\s*[12][A-C]|\(?\s*[12][A-C]\s*\)?'
        grades = re.findall(grade_pattern, self.content, re.IGNORECASE)
        
        # Look for strong/conditional language
        strong_pattern = r'(strong|we recommend|should)'
        conditional_pattern = r'(conditional|weak|we suggest|may consider|could consider)'
        
        strong_count = len(re.findall(strong_pattern, self.content, re.IGNORECASE))
        conditional_count = len(re.findall(conditional_pattern, self.content, re.IGNORECASE))
        
        if grades:
            self.info.append(f"Found {len(grades)} GRADE-style recommendations")
        else:
            self.warnings.append("No GRADE-style recommendation grading found (1A, 1B, 2A, etc.)")
        
        if strong_count > 0 or conditional_count > 0:
            self.info.append(f"Recommendation language: {strong_count} strong, {conditional_count} conditional")
        else:
            self.warnings.append("No clear recommendation strength language (strong/conditional) found")
    
    def check_statistical_reporting(self):
        """Check for proper statistical reporting."""
        
        # Check for p-values
        p_values = re.findall(r'p\s*[=<>]\s*[\d.]+', self.content, re.IGNORECASE)
        
        # Check for confidence intervals
        ci_pattern = r'95%\s*CI|confidence interval'
        cis = re.findall(ci_pattern, self.content, re.IGNORECASE)
        
        # Check for hazard ratios
        hr_pattern = r'HR\s*[=:]\s*[\d.]+'
        hrs = re.findall(hr_pattern, self.content)
        
        # Check for sample sizes
        n_pattern = r'n\s*=\s*\d+'
        sample_sizes = re.findall(n_pattern, self.content, re.IGNORECASE)
        
        if not p_values:
            self.warnings.append("No p-values found - statistical significance not reported")
        else:
            self.info.append(f"Found {len(p_values)} p-values")
        
        if hrs and not cis:
            self.warnings.append("Hazard ratios reported without confidence intervals")
        
        if not sample_sizes:
            self.warnings.append("Sample sizes (n=X) not clearly reported")
        
        # Check for common statistical errors
        if 'p=0.00' in self.content or 'p = 0.00' in self.content:
            self.warnings.append("Found p=0.00 (should report as p<0.001 instead)")
    
    def check_hipaa_identifiers(self):
        """Check for potential HIPAA identifiers."""
        
        # 18 HIPAA identifiers (simplified check for common ones)
        identifiers = {
            'Names': r'Dr\.\s+[A-Z][a-z]+|Patient:\s*[A-Z][a-z]+',
            'Specific dates': r'\d{1,2}/\d{1,2}/\d{4}',  # MM/DD/YYYY
            'Phone numbers': r'\d{3}[-.]?\d{3}[-.]?\d{4}',
            'Email addresses': r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}',
            'SSN': r'\d{3}-\d{2}-\d{4}',
            'MRN': r'MRN\s*:?\s*\d+',
        }
        
        found_identifiers = []
        
        for identifier_type, pattern in identifiers.items():
            matches = re.findall(pattern, self.content)
            if matches:
                found_identifiers.append(f"{identifier_type}: {len(matches)} instance(s)")
        
        if found_identifiers:
            self.errors.append("Potential HIPAA identifiers detected:")
            for identifier in found_identifiers:
                self.errors.append(f"  - {identifier}")
            self.errors.append("  ** Ensure proper de-identification before distribution **")
        else:
            self.info.append("No obvious HIPAA identifiers detected (basic check only)")
    
    def check_biomarker_nomenclature(self):
        """Check for consistent biomarker nomenclature."""
        
        # Common biomarker naming issues
        issues = []
        
        # Check for gene names (should be italicized in LaTeX)
        gene_names = ['EGFR', 'ALK', 'ROS1', 'BRAF', 'KRAS', 'HER2', 'TP53', 'BRCA1', 'BRCA2']
        for gene in gene_names:
            # Check if gene appears but not in italics (\textit{} or \emph{})
            if gene in self.content:
                if f'\\textit{{{gene}}}' not in self.content and f'\\emph{{{gene}}}' not in self.content:
                    if '.tex' in self.filepath.suffix:
                        issues.append(f"{gene} should be italicized in LaTeX (\\textit{{{gene}}})")
        
        # Check for protein vs gene naming
        # HER2 (protein) vs ERBB2 (gene) - both valid
        # Check for mutation nomenclature (HGVS format)
        hgvs_pattern = r'p\.[A-Z]\d+[A-Z]'  # e.g., p.L858R
        hgvs_mutations = re.findall(hgvs_pattern, self.content)
        
        if hgvs_mutations:
            self.info.append(f"Found {len(hgvs_mutations)} HGVS protein nomenclature (e.g., p.L858R)")
        
        # Warn about non-standard mutation format
        if 'EGFR mutation' in self.content and 'exon' not in self.content.lower():
            self.warnings.append("EGFR mutation mentioned - specify exon/variant (e.g., exon 19 deletion)")
        
        if issues:
            self.warnings.extend(issues)
    
    def generate_report(self):
        """Generate validation report."""
        
        print("\n" + "="*70)
        print("VALIDATION REPORT")
        print("="*70)
        
        if self.errors:
            print(f"\n❌ ERRORS ({len(self.errors)}):")
            for error in self.errors:
                print(f"  {error}")
        
        if self.warnings:
            print(f"\n⚠️  WARNINGS ({len(self.warnings)}):")
            for warning in self.warnings:
                print(f"  {warning}")
        
        if self.info:
            print(f"\n✓ PASSED CHECKS ({len(self.info)}):")
            for info in self.info:
                print(f"  {info}")
        
        # Overall status
        print("\n" + "="*70)
        if self.errors:
            print("STATUS: ❌ VALIDATION FAILED - Address errors before distribution")
            return False
        elif self.warnings:
            print("STATUS: ⚠️  VALIDATION PASSED WITH WARNINGS - Review recommended")
            return True
        else:
            print("STATUS: ✓ VALIDATION PASSED - Document meets quality standards")
            return True
    
    def save_report(self, output_file):
        """Save validation report to file."""
        
        with open(output_file, 'w') as f:
            f.write("CLINICAL DECISION SUPPORT DOCUMENT VALIDATION REPORT\n")
            f.write("="*70 + "\n")
            f.write(f"Document: {self.filepath}\n")
            f.write(f"Validated: {Path.cwd()}\n\n")
            
            if self.errors:
                f.write(f"ERRORS ({len(self.errors)}):\n")
                for error in self.errors:
                    f.write(f"  - {error}\n")
                f.write("\n")
            
            if self.warnings:
                f.write(f"WARNINGS ({len(self.warnings)}):\n")
                for warning in self.warnings:
                    f.write(f"  - {warning}\n")
                f.write("\n")
            
            if self.info:
                f.write(f"PASSED CHECKS ({len(self.info)}):\n")
                for info in self.info:
                    f.write(f"  - {info}\n")
        
        print(f"\nValidation report saved to: {output_file}")


def main():
    parser = argparse.ArgumentParser(description='Validate clinical decision support documents')
    parser.add_argument('input_file', type=str, help='Document to validate (.tex, .md, .txt)')
    parser.add_argument('-o', '--output', type=str, default=None,
                       help='Save validation report to file')
    parser.add_argument('--strict', action='store_true',
                       help='Treat warnings as errors')
    
    args = parser.parse_args()
    
    # Validate
    validator = CDSValidator(args.input_file)
    passed = validator.validate_all()
    
    # Save report if requested
    if args.output:
        validator.save_report(args.output)
    
    # Exit code
    if args.strict and (validator.errors or validator.warnings):
        exit(1)
    elif validator.errors:
        exit(1)
    else:
        exit(0)


if __name__ == '__main__':
    main()


# Example usage:
# python validate_cds_document.py cohort_analysis.tex
# python validate_cds_document.py treatment_recommendations.tex -o validation_report.txt
# python validate_cds_document.py document.tex --strict  # Warnings cause failure

