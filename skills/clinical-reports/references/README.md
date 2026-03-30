# Clinical Reports Skill

## Overview

Comprehensive skill for writing clinical reports including case reports, diagnostic reports, clinical trial reports, and patient documentation. Provides full support with templates, regulatory compliance, and validation tools.

## What's Included

### 📋 Four Major Report Types

1. **Clinical Case Reports** - CARE-compliant case reports for medical journal publication
2. **Diagnostic Reports** - Radiology (ACR), pathology (CAP), and laboratory reports
3. **Clinical Trial Reports** - SAE reports, Clinical Study Reports (ICH-E3), DSMB reports
4. **Patient Documentation** - SOAP notes, H&P, discharge summaries, consultation notes

### 📚 Reference Files (8 comprehensive guides)

- `case_report_guidelines.md` - CARE guidelines, de-identification, journal requirements
- `diagnostic_reports_standards.md` - ACR, CAP, CLSI standards, structured reporting systems
- `clinical_trial_reporting.md` - ICH-E3, CONSORT, SAE reporting, MedDRA coding
- `patient_documentation.md` - SOAP notes, H&P, discharge summary standards
- `regulatory_compliance.md` - HIPAA, 21 CFR Part 11, ICH-GCP, FDA regulations
- `medical_terminology.md` - SNOMED-CT, LOINC, ICD-10, CPT codes
- `data_presentation.md` - Clinical tables, figures, Kaplan-Meier curves
- `peer_review_standards.md` - Review criteria for clinical manuscripts

### 📄 Templates (12 professional templates)

- `case_report_template.md` - Structured case report following CARE guidelines
- `soap_note_template.md` - SOAP progress note format
- `history_physical_template.md` - Complete H&P examination template
- `discharge_summary_template.md` - Hospital discharge documentation
- `consult_note_template.md` - Specialist consultation format
- `radiology_report_template.md` - Imaging report with structured reporting
- `pathology_report_template.md` - Surgical pathology with CAP synoptic elements
- `lab_report_template.md` - Clinical laboratory test results
- `clinical_trial_sae_template.md` - Serious adverse event report form
- `clinical_trial_csr_template.md` - Clinical study report outline (ICH-E3)
- `quality_checklist.md` - Quality assurance for all report types
- `hipaa_compliance_checklist.md` - Privacy and de-identification verification

### 🔧 Validation Scripts (8 automation tools)

- `validate_case_report.py` - Check CARE guideline compliance and completeness
- `check_deidentification.py` - Scan for 18 HIPAA identifiers in reports
- `validate_trial_report.py` - Verify ICH-E3 structure and required elements
- `format_adverse_events.py` - Generate AE summary tables from CSV data
- `generate_report_template.py` - Interactive template selection and generation
- `extract_clinical_data.py` - Parse and extract structured clinical data
- `compliance_checker.py` - Verify regulatory compliance requirements
- `terminology_validator.py` - Validate medical terminology and prohibited abbreviations

## Quick Start

### Generate a Template

```bash
cd .claude/skills/clinical-reports/scripts
python generate_report_template.py

# Or specify type directly
python generate_report_template.py --type case_report --output my_case_report.md
```

### Validate a Case Report

```bash
python validate_case_report.py my_case_report.md
```

### Check De-identification

```bash
python check_deidentification.py my_case_report.md
```

### Validate Clinical Trial Report

```bash
python validate_trial_report.py my_csr.md
```

## Key Features

### CARE Guidelines Compliance
- Complete CARE checklist coverage
- De-identification verification
- Informed consent documentation
- Timeline creation assistance
- Literature review integration

### Regulatory Compliance
- **HIPAA** - Privacy protection, 18 identifier removal, Safe Harbor method
- **FDA** - 21 CFR Parts 11, 50, 56, 312 compliance
- **ICH-GCP** - Good Clinical Practice standards
- **ALCOA-CCEA** - Data integrity principles

### Professional Standards
- **ACR** - American College of Radiology reporting standards
- **CAP** - College of American Pathologists synoptic reporting
- **CLSI** - Clinical Laboratory Standards Institute
- **CONSORT** - Clinical trial reporting
- **ICH-E3** - Clinical study report structure

### Medical Coding Systems
- **ICD-10-CM** - Diagnosis coding
- **CPT** - Procedure coding
- **SNOMED-CT** - Clinical terminology
- **LOINC** - Laboratory observation codes
- **MedDRA** - Medical dictionary for regulatory activities

## Common Use Cases

### 1. Publishing a Clinical Case Report

```
> Create a clinical case report for a 65-year-old patient with atypical 
  presentation of acute appendicitis

> Check this case report for HIPAA compliance
> Validate against CARE guidelines
```

### 2. Writing Diagnostic Reports

```
> Generate a radiology report template for chest CT
> Create a pathology report for colon resection specimen with adenocarcinoma
> Write a laboratory report for complete blood count
```

### 3. Clinical Trial Documentation

```
> Write a serious adverse event report for hospitalization due to pneumonia
> Create a clinical study report outline for phase 3 diabetes trial
> Generate adverse events summary table from trial data
```

### 4. Patient Clinical Notes

```
> Create a SOAP note for follow-up visit
> Generate an H&P for patient admitted with chest pain
> Write a discharge summary for heart failure hospitalization
> Create a cardiology consultation note
```

## Workflow Examples

### Case Report Workflow

1. **Obtain informed consent** from patient
2. **Generate template**: `python generate_report_template.py --type case_report`
3. **Write case report** following CARE structure
4. **Validate compliance**: `python validate_case_report.py case_report.md`
5. **Check de-identification**: `python check_deidentification.py case_report.md`
6. **Submit to journal** with CARE checklist

### Clinical Trial SAE Workflow

1. **Generate SAE template**: `python generate_report_template.py --type sae`
2. **Complete SAE form** within 24 hours of event
3. **Assess causality** using WHO-UMC or Naranjo criteria
4. **Validate completeness**: `python validate_trial_report.py sae_report.md`
5. **Submit to sponsor** within regulatory timelines (7 or 15 days)
6. **Notify IRB** per institutional policy

## Best Practices

### Privacy and Ethics
✓ Always obtain informed consent for case reports  
✓ Remove all 18 HIPAA identifiers before publication  
✓ Use de-identification validation scripts  
✓ Document consent in manuscript  
✓ Consider re-identification risk for rare conditions  

### Clinical Quality
✓ Use professional medical terminology  
✓ Follow structured reporting templates  
✓ Include all required elements  
✓ Document chronology clearly  
✓ Support diagnoses with evidence  

### Regulatory Compliance
✓ Meet SAE reporting timelines (7-day, 15-day)  
✓ Follow ICH-E3 structure for CSRs  
✓ Maintain ALCOA-CCEA data integrity  
✓ Document protocol adherence  
✓ Use MedDRA coding for adverse events  

### Documentation Standards
✓ Sign and date all clinical notes  
✓ Document medical necessity  
✓ Use standard abbreviations only  
✓ Avoid prohibited abbreviations (JCAHO "Do Not Use" list)  
✓ Maintain legibility and completeness  

## Integration

The clinical-reports skill integrates seamlessly with:

- **scientific-writing** - For clear, professional medical writing
- **peer-review** - For quality assessment of case reports
- **citation-management** - For literature references in case reports
- **research-grants** - For clinical trial protocol development

## Resources

### External Standards
- CARE Guidelines: https://www.care-statement.org/
- ICH-E3 Guideline: https://database.ich.org/sites/default/files/E3_Guideline.pdf
- CONSORT Statement: http://www.consort-statement.org/
- HIPAA: https://www.hhs.gov/hipaa/
- ACR Practice Parameters: https://www.acr.org/Clinical-Resources/Practice-Parameters-and-Technical-Standards
- CAP Cancer Protocols: https://www.cap.org/protocols-and-guidelines

### Professional Organizations
- American Medical Association (AMA)
- American College of Radiology (ACR)
- College of American Pathologists (CAP)
- Clinical Laboratory Standards Institute (CLSI)
- International Council for Harmonisation (ICH)

## Support

For issues or questions about the clinical-reports skill:
1. Check the comprehensive reference files
2. Review templates for examples
3. Run validation scripts to identify issues
4. Consult the SKILL.md for detailed guidance

## License

Part of the Claude Scientific Writer project. See main LICENSE file.

