---
name: clinical-reports
description: Write comprehensive clinical reports including case reports (CARE guidelines), diagnostic reports (radiology/pathology/lab), clinical trial reports (ICH-E3, SAE, CSR), and patient documentation (SOAP, H&P, discharge summaries). Full support with templates, regulatory compliance (HIPAA, FDA, ICH-GCP), and validation tools.
allowed-tools: Read Write Edit Bash
license: MIT License
metadata:
    skill-author: K-Dense Inc.
---

# Clinical Report Writing

## Overview

Clinical report writing is the process of documenting medical information with precision, accuracy, and compliance with regulatory standards. This skill covers four major categories of clinical reports: case reports for journal publication, diagnostic reports for clinical practice, clinical trial reports for regulatory submission, and patient documentation for medical records. Apply this skill for healthcare documentation, research dissemination, and regulatory compliance.

**Critical Principle: Clinical reports must be accurate, complete, objective, and compliant with applicable regulations (HIPAA, FDA, ICH-GCP).** Patient privacy and data integrity are paramount. All clinical documentation must support evidence-based decision-making and meet professional standards.

## When to Use This Skill

This skill should be used when:
- Writing clinical case reports for journal submission (CARE guidelines)
- Creating diagnostic reports (radiology, pathology, laboratory)
- Documenting clinical trial data and adverse events
- Preparing clinical study reports (CSR) for regulatory submission
- Writing patient progress notes, SOAP notes, and clinical summaries
- Drafting discharge summaries, H&P documents, or consultation notes
- Ensuring HIPAA compliance and proper de-identification
- Validating clinical documentation for completeness and accuracy
- Preparing serious adverse event (SAE) reports
- Creating data safety monitoring board (DSMB) reports

## Visual Enhancement with Scientific Schematics

**⚠️ MANDATORY: Every clinical report MUST include at least 1 AI-generated figure using the scientific-schematics skill.**

This is not optional. Clinical reports benefit greatly from visual elements. Before finalizing any document:
1. Generate at minimum ONE schematic or diagram (e.g., patient timeline, diagnostic algorithm, or treatment workflow)
2. For case reports: include clinical progression timeline
3. For trial reports: include CONSORT flow diagram

**How to generate figures:**
- Use the **scientific-schematics** skill to generate AI-powered publication-quality diagrams
- Simply describe your desired diagram in natural language
- Nano Banana Pro will automatically generate, review, and refine the schematic

**How to generate schematics:**
```bash
python scripts/generate_schematic.py "your diagram description" -o figures/output.png
```

The AI will automatically:
- Create publication-quality images with proper formatting
- Review and refine through multiple iterations
- Ensure accessibility (colorblind-friendly, high contrast)
- Save outputs in the figures/ directory

**When to add schematics:**
- Patient case timelines and clinical progression diagrams
- Diagnostic algorithm flowcharts
- Treatment protocol workflows
- Anatomical diagrams for case reports
- Clinical trial participant flow diagrams (CONSORT)
- Adverse event classification trees
- Any complex concept that benefits from visualization

For detailed guidance on creating schematics, refer to the scientific-schematics skill documentation.

---

## Core Capabilities

### 1. Clinical Case Reports for Journal Publication

Clinical case reports describe unusual clinical presentations, novel diagnoses, or rare complications. They contribute to medical knowledge and are published in peer-reviewed journals.

#### CARE Guidelines Compliance

The CARE (CAse REport) guidelines provide a standardized framework for case report writing. All case reports should follow this checklist:

**Title**
- Include the words "case report" or "case study"
- Indicate the area of focus
- Example: "Unusual Presentation of Acute Myocardial Infarction in a Young Patient: A Case Report"

**Keywords**
- 2-5 keywords for indexing and searchability
- Use MeSH (Medical Subject Headings) terms when possible

**Abstract** (structured or unstructured, 150-250 words)
- Introduction: What is unique or novel about the case?
- Patient concerns: Primary symptoms and key medical history
- Diagnoses: Primary and secondary diagnoses
- Interventions: Key treatments and procedures
- Outcomes: Clinical outcome and follow-up
- Conclusions: Main takeaway or clinical lesson

**Introduction**
- Brief background on the medical condition
- Why this case is novel or important
- Literature review of similar cases (brief)
- What makes this case worth reporting

**Patient Information**
- Demographics (age, sex, race/ethnicity if relevant)
- Medical history, family history, social history
- Relevant comorbidities
- **De-identification**: Remove or alter 18 HIPAA identifiers
- **Patient consent**: Document informed consent for publication

**Clinical Findings**
- Chief complaint and presenting symptoms
- Physical examination findings
- Timeline of symptoms (consider timeline figure or table)
- Relevant clinical observations

**Timeline**
- Chronological summary of key events
- Dates of symptoms, diagnosis, interventions, outcomes
- Can be presented as a table or figure
- Example format:
  - Day 0: Initial presentation with symptoms X, Y, Z
  - Day 2: Diagnostic test A performed, revealed finding B
  - Day 5: Treatment initiated with drug C
  - Day 14: Clinical improvement noted
  - Month 3: Follow-up examination shows complete resolution

**Diagnostic Assessment**
- Diagnostic tests performed (labs, imaging, procedures)
- Results and interpretation
- Differential diagnosis considered
- Rationale for final diagnosis
- Challenges in diagnosis

**Therapeutic Interventions**
- Medications (names, dosages, routes, duration)
- Procedures or surgeries performed
- Non-pharmacological interventions
- Reasoning for treatment choices
- Alternative treatments considered

**Follow-up and Outcomes**
- Clinical outcome (resolution, improvement, unchanged, worsened)
- Follow-up duration and frequency
- Long-term outcomes if available
- Patient-reported outcomes
- Adherence to treatment

**Discussion**
- Strengths and novelty of the case
- How this case compares to existing literature
- Limitations of the case report
- Potential mechanisms or explanations
- Clinical implications and lessons learned
- Unanswered questions or areas for future research

**Patient Perspective** (optional but encouraged)
- Patient's experience and viewpoint
- Impact on quality of life
- Patient-reported outcomes
- Quote from patient if appropriate

**Informed Consent**
- Statement documenting patient consent for publication
- If patient deceased or unable to consent, describe proxy consent
- For pediatric cases, parental/guardian consent
- Example: "Written informed consent was obtained from the patient for publication of this case report and accompanying images. A copy of the written consent is available for review by the Editor-in-Chief of this journal."

For detailed CARE guidelines, refer to `references/case_report_guidelines.md`.

#### Journal-Specific Requirements

Different journals have specific formatting requirements:
- Word count limits (typically 1500-3000 words)
- Number of figures/tables allowed
- Reference style (AMA, Vancouver, APA)
- Structured vs. unstructured abstract
- Supplementary materials policies

Check journal instructions for authors before submission.

#### De-identification and Privacy

**18 HIPAA Identifiers to Remove or Alter:**
1. Names
2. Geographic subdivisions smaller than state
3. Dates (except year)
4. Telephone numbers
5. Fax numbers
6. Email addresses
7. Social Security numbers
8. Medical record numbers
9. Health plan beneficiary numbers
10. Account numbers
11. Certificate/license numbers
12. Vehicle identifiers and serial numbers
13. Device identifiers and serial numbers
14. Web URLs
15. IP addresses
16. Biometric identifiers
17. Full-face photographs
18. Any other unique identifying characteristic

**Best Practices:**
- Use "the patient" instead of names
- Report age ranges (e.g., "a woman in her 60s") or exact age if relevant
- Use approximate dates or time intervals (e.g., "3 months prior")
- Remove institution names unless necessary
- Blur or crop identifying features in images
- Obtain explicit consent for any potentially identifying information

### 2. Clinical Diagnostic Reports

Diagnostic reports communicate findings from imaging studies, pathological examinations, and laboratory tests. They must be clear, accurate, and actionable.

#### Radiology Reports

Radiology reports follow a standardized structure to ensure clarity and completeness.

**Standard Structure:**

**1. Patient Demographics**
- Patient name (or ID in research contexts)
- Date of birth or age
- Medical record number
- Examination date and time

**2. Clinical Indication**
- Reason for examination
- Relevant clinical history
- Specific clinical question to be answered
- Example: "Rule out pulmonary embolism in patient with acute dyspnea"

**3. Technique**
- Imaging modality (X-ray, CT, MRI, ultrasound, PET, etc.)
- Anatomical region examined
- Contrast administration (type, route, volume)
- Protocol or sequence used
- Technical quality and limitations
- Example: "Contrast-enhanced CT of the chest, abdomen, and pelvis was performed using 100 mL of intravenous iodinated contrast. Oral contrast was not administered."

**4. Comparison**
- Prior imaging studies available for comparison
- Dates of prior studies
- Stability or change from prior imaging
- Example: "Comparison: CT chest from [date]"

**5. Findings**
- Systematic description of imaging findings
- Organ-by-organ or region-by-region approach
- Positive findings first, then pertinent negatives
- Measurements of lesions or abnormalities
- Use of standardized terminology (ACR lexicon, RadLex)
- Example:
  - Lungs: Bilateral ground-glass opacities, predominant in the lower lobes. No consolidation or pleural effusion.
  - Mediastinum: No lymphadenopathy. Heart size normal.
  - Abdomen: Liver, spleen, pancreas unremarkable. No free fluid.

**6. Impression/Conclusion**
- Concise summary of key findings
- Answers to the clinical question
- Differential diagnosis if applicable
- Recommendations for follow-up or additional studies
- Level of suspicion or diagnostic certainty
- Example:
  - "1. Bilateral ground-glass opacities consistent with viral pneumonia or atypical infection. COVID-19 cannot be excluded. Clinical correlation recommended.
  - 2. No evidence of pulmonary embolism.
  - 3. Recommend follow-up imaging in 4-6 weeks to assess resolution."

**Structured Reporting:**

Many radiology departments use structured reporting templates for common examinations:
- Lung nodule reporting (Lung-RADS)
- Breast imaging (BI-RADS)
- Liver imaging (LI-RADS)
- Prostate imaging (PI-RADS)
- CT colonography (C-RADS)

Structured reports improve consistency, reduce ambiguity, and facilitate data extraction.

For radiology reporting standards, see `references/diagnostic_reports_standards.md`.

#### Pathology Reports

Pathology reports document microscopic findings from tissue specimens and provide diagnostic conclusions.

**Surgical Pathology Report Structure:**

**1. Patient Information**
- Patient name and identifiers
- Date of birth, age, sex
- Ordering physician
- Medical record number
- Specimen received date

**2. Specimen Information**
- Specimen type (biopsy, excision, resection)
- Anatomical site
- Laterality if applicable
- Number of specimens/blocks/slides
- Example: "Skin, left forearm, excisional biopsy"

**3. Clinical History**
- Relevant clinical information
- Indication for biopsy
- Prior diagnoses
- Example: "History of melanoma. New pigmented lesion, rule out recurrence."

**4. Gross Description**
- Macroscopic appearance of specimen
- Size, weight, color, consistency
- Orientation markers if present
- Sectioning and sampling approach
- Example: "The specimen consists of an ellipse of skin measuring 2.5 x 1.0 x 0.5 cm. A pigmented lesion measuring 0.6 cm in diameter is present on the surface. The specimen is serially sectioned and entirely submitted in cassettes A1-A3."

**5. Microscopic Description**
- Histological findings
- Cellular characteristics
- Architectural patterns
- Presence of malignancy
- Margins if applicable
- Special stains or immunohistochemistry results

**6. Diagnosis**
- Primary diagnosis
- Grade and stage if applicable (cancer)
- Margin status
- Lymph node status if applicable
- Synoptic reporting for cancers (CAP protocols)
- Example:
  - "MALIGNANT MELANOMA, SUPERFICIAL SPREADING TYPE
  - Breslow thickness: 1.2 mm
  - Clark level: IV
  - Mitotic rate: 3/mm²
  - Ulceration: Absent
  - Margins: Negative (closest margin 0.4 cm)
  - Lymphovascular invasion: Not identified"

**7. Comment** (if needed)
- Additional context or interpretation
- Differential diagnosis
- Recommendations for additional studies
- Clinical correlation suggestions

**Synoptic Reporting:**

The College of American Pathologists (CAP) provides synoptic reporting templates for cancer specimens. These checklists ensure all relevant diagnostic elements are documented.

Key elements for cancer reporting:
- Tumor site
- Tumor size
- Histologic type
- Histologic grade
- Extent of invasion
- Lymph-vascular invasion
- Perineural invasion
- Margins
- Lymph nodes (number examined, number positive)
- Pathologic stage (TNM classification)
- Ancillary studies (molecular markers, biomarkers)

#### Laboratory Reports

Laboratory reports communicate test results for clinical specimens (blood, urine, tissue, etc.).

**Standard Components:**

**1. Patient and Specimen Information**
- Patient identifiers
- Specimen type (blood, serum, urine, CSF, etc.)
- Collection date and time
- Received date and time
- Ordering provider

**2. Test Name and Method**
- Full test name
- Methodology (immunoassay, spectrophotometry, PCR, etc.)
- Laboratory accession number

**3. Results**
- Quantitative or qualitative result
- Units of measurement
- Reference range (normal values)
- Flags for abnormal values (H = high, L = low)
- Critical values highlighted
- Example:
  - Hemoglobin: 8.5 g/dL (L) [Reference: 12.0-16.0 g/dL]
  - White Blood Cell Count: 15.2 x10³/μL (H) [Reference: 4.5-11.0 x10³/μL]

**4. Interpretation** (when applicable)
- Clinical significance of results
- Suggested follow-up or additional testing
- Correlation with diagnosis
- Drug levels and therapeutic ranges

**5. Quality Control Information**
- Specimen adequacy
- Specimen quality issues (hemolyzed, lipemic, clotted)
- Delays in processing
- Technical limitations

**Critical Value Reporting:**
- Life-threatening results require immediate notification
- Examples: glucose <40 or >500 mg/dL, potassium <2.5 or >6.5 mEq/L
- Document notification time and recipient

For laboratory standards and terminology, see `references/diagnostic_reports_standards.md`.

### 3. Clinical Trial Reports

Clinical trial reports document the conduct, results, and safety of clinical research studies. These reports are essential for regulatory submissions and scientific publication.

#### Serious Adverse Event (SAE) Reports

SAE reports document unexpected serious adverse reactions during clinical trials. Regulatory requirements mandate timely reporting to IRBs, sponsors, and regulatory agencies.

**Definition of Serious Adverse Event:**
An adverse event is serious if it:
- Results in death
- Is life-threatening
- Requires inpatient hospitalization or prolongation of existing hospitalization
- Results in persistent or significant disability/incapacity
- Is a congenital anomaly/birth defect
- Requires intervention to prevent permanent impairment or damage

**SAE Report Components:**

**1. Study Information**
- Protocol number and title
- Study phase
- Sponsor name
- Principal investigator
- IND/IDE number (if applicable)
- Clinical trial registry number (NCT number)

**2. Patient Information (De-identified)**
- Subject ID or randomization number
- Age, sex, race/ethnicity
- Study arm or treatment group
- Date of informed consent
- Date of first study intervention

**3. Event Information**
- Event description (narrative)
- Date of onset
- Date of resolution (or ongoing)
- Severity (mild, moderate, severe)
- Seriousness criteria met
- Outcome (recovered, recovering, not recovered, fatal, unknown)

**4. Causality Assessment**
- Relationship to study intervention (unrelated, unlikely, possible, probable, definite)
- Relationship to study procedures
- Relationship to underlying disease
- Rationale for causality determination

**5. Action Taken**
- Modification of study intervention (dose reduction, temporary hold, permanent discontinuation)
- Concomitant medications or treatments administered
- Hospitalization details
- Outcome and follow-up plan

**6. Expectedness**
- Expected per protocol or investigator's brochure
- Unexpected event requiring expedited reporting
- Comparison to known safety profile

**7. Narrative**
- Detailed description of the event
- Timeline of events
- Clinical course and management
- Laboratory and diagnostic test results
- Final diagnosis or conclusion

**8. Reporter Information**
- Name and contact of reporter
- Report date
- Signature

**Regulatory Timelines:**
- Fatal or life-threatening unexpected SAEs: 7 days for preliminary report, 15 days for complete report
- Other serious unexpected events: 15 days
- IRB notification: per institutional policy, typically within 5-10 days

For detailed SAE reporting guidance, see `references/clinical_trial_reporting.md`.

#### Clinical Study Reports (CSR)

Clinical study reports are comprehensive documents summarizing the design, conduct, and results of clinical trials. They are submitted to regulatory agencies as part of drug approval applications.

**ICH-E3 Structure:**

The ICH E3 guideline defines the structure and content of clinical study reports.

**Main Sections:**

**1. Title Page**
- Study title and protocol number
- Sponsor and investigator information
- Report date and version

**2. Synopsis** (5-15 pages)
- Brief summary of entire study
- Objectives, methods, results, conclusions
- Key efficacy and safety findings
- Can stand alone

**3. Table of Contents**

**4. List of Abbreviations and Definitions**

**5. Ethics** (Section 2)
- IRB/IEC approvals
- Informed consent process
- GCP compliance statement

**6. Investigators and Study Administrative Structure** (Section 3)
- List of investigators and sites
- Study organization
- Monitoring and quality assurance

**7. Introduction** (Section 4)
- Background and rationale
- Study objectives and purpose

**8. Study Objectives and Plan** (Section 5)
- Overall design and plan
- Objectives (primary and secondary)
- Endpoints (efficacy and safety)
- Sample size determination

**9. Study Patients** (Section 6)
- Inclusion and exclusion criteria
- Patient disposition
- Protocol deviations
- Demographic and baseline characteristics

**10. Efficacy Evaluation** (Section 7)
- Data sets analyzed (ITT, PP, safety)
- Demographic and other baseline characteristics
- Efficacy results for primary and secondary endpoints
- Subgroup analyses
- Dropouts and missing data

**11. Safety Evaluation** (Section 8)
- Extent of exposure
- Adverse events (summary tables)
- Serious adverse events (narratives)
- Laboratory values
- Vital signs and physical findings
- Deaths and other serious events

**12. Discussion and Overall Conclusions** (Section 9)
- Interpretation of results
- Benefit-risk assessment
- Clinical implications

**13. Tables, Figures, and Graphs** (Section 10)

**14. Reference List** (Section 11)

**15. Appendices** (Section 12)
- Study protocol and amendments
- Sample case report forms
- List of investigators and ethics committees
- Patient information and consent forms
- Investigator's brochure references
- Publications based on the study

**Key Principles:**
- Objectivity and transparency
- Comprehensive data presentation
- Adherence to statistical analysis plan
- Clear presentation of safety data
- Integration of appendices

For ICH-E3 templates and detailed guidance, see `references/clinical_trial_reporting.md` and `assets/clinical_trial_csr_template.md`.

#### Protocol Deviations

Protocol deviations are departures from the approved study protocol. They must be documented, assessed, and reported.

**Categories:**
- **Minor deviation**: Does not significantly impact patient safety or data integrity
- **Major deviation**: May impact patient safety, data integrity, or study conduct
- **Violation**: Serious deviation requiring immediate action and reporting

**Documentation Requirements:**
- Description of deviation
- Date of occurrence
- Subject ID affected
- Impact on safety and data
- Corrective and preventive actions (CAPA)
- Root cause analysis
- Preventive measures implemented

### 4. Patient Clinical Documentation

Patient documentation records clinical encounters, progress, and care plans. Accurate documentation supports continuity of care, billing, and legal protection.

#### SOAP Notes

SOAP notes are the most common format for progress notes in clinical practice.

**Structure:**

**S - Subjective**
- Patient's reported symptoms and concerns
- History of present illness (HPI)
- Review of systems (ROS) relevant to visit
- Patient's own words (use quotes when helpful)
- Example: "Patient reports worsening shortness of breath over the past 3 days, particularly with exertion. Denies chest pain, fever, or cough."

**O - Objective**
- Measurable clinical findings
- Vital signs (temperature, blood pressure, heart rate, respiratory rate, oxygen saturation)
- Physical examination findings (organized by system)
- Laboratory and imaging results
- Example:
  - Vitals: T 98.6°F, BP 142/88, HR 92, RR 22, SpO2 91% on room air
  - General: Mild respiratory distress
  - Cardiovascular: Regular rhythm, no murmurs
  - Pulmonary: Bilateral crackles at bases
  - Extremities: 2+ pitting edema bilaterally

**A - Assessment**
- Clinical impression or diagnosis
- Differential diagnosis
- Severity and stability
- Progress toward treatment goals
- Example:
  - "1. Acute decompensated heart failure, NYHA Class III
  - 2. Hypertension, poorly controlled
  - 3. Chronic kidney disease, stage 3"

**P - Plan**
- Diagnostic plan (further testing)
- Therapeutic plan (medications, procedures)
- Patient education and counseling
- Follow-up arrangements
- Example:
  - "Diagnostics: BNP, chest X-ray, echocardiogram
  - Therapeutics: Increase furosemide to 40 mg PO BID, continue lisinopril 10 mg daily, strict fluid restriction to 1.5 L/day
  - Education: Signs of worsening heart failure, daily weights
  - Follow-up: Cardiology appointment in 1 week, call if weight gain >2 lbs in 1 day"

**Documentation Tips:**
- Be concise but complete
- Use standard medical abbreviations
- Document time of encounter
- Sign and date all notes
- Avoid speculation or judgment
- Document medical necessity for billing
- Include patient's response to treatment

For SOAP note templates and examples, see `assets/soap_note_template.md`.

#### History and Physical (H&P)

The H&P is a comprehensive assessment performed at admission or initial encounter.

**Components:**

**1. Chief Complaint (CC)**
- Brief statement of why patient is seeking care
- Use patient's own words
- Example: "Chest pain for 2 hours"

**2. History of Present Illness (HPI)**
- Detailed chronological narrative of current problem
- Use OPQRST mnemonic for pain:
  - Onset: When did it start?
  - Provocation/Palliation: What makes it better or worse?
  - Quality: What does it feel like?
  - Region/Radiation: Where is it? Does it spread?
  - Severity: How bad is it (0-10 scale)?
  - Timing: Constant or intermittent? Duration?
- Associated symptoms
- Prior evaluations or treatments

**3. Past Medical History (PMH)**
- Chronic medical conditions
- Previous hospitalizations
- Surgeries and procedures
- Example: "Hypertension (diagnosed 2015), type 2 diabetes mellitus (diagnosed 2018), prior appendectomy (2010)"

**4. Medications**
- Current medications with doses and frequencies
- Over-the-counter medications
- Herbal supplements
- Allergies and reactions

**5. Allergies**
- Drug allergies with type of reaction
- Food allergies
- Environmental allergies
- Example: "Penicillin (rash), shellfish (anaphylaxis)"

**6. Family History (FH)**
- Medical conditions in first-degree relatives
- Age and cause of death of parents
- Hereditary conditions
- Example: "Father with coronary artery disease (MI at age 55), mother with breast cancer (diagnosed age 62)"

**7. Social History (SH)**
- Tobacco use (pack-years)
- Alcohol use (drinks per week)
- Illicit drug use
- Occupation
- Living situation
- Sexual history if relevant
- Example: "Former smoker, quit 5 years ago (20 pack-year history). Occasional alcohol (2-3 drinks/week). Works as accountant. Lives with spouse."

**8. Review of Systems (ROS)**
- Systematic review of symptoms by organ system
- Typically 10-14 systems
- Pertinent positives and negatives
- Systems: Constitutional, Eyes, ENT, Cardiovascular, Respiratory, GI, GU, Musculoskeletal, Skin, Neurological, Psychiatric, Endocrine, Hematologic/Lymphatic, Allergic/Immunologic

**9. Physical Examination**
- Vital signs
- General appearance
- Systematic examination by organ system
- HEENT, Neck, Cardiovascular, Pulmonary, Abdomen, Extremities, Neurological, Skin
- Use standard terminology and abbreviations

**10. Assessment and Plan**
- Problem list with assessment and plan for each
- Numbered list format
- Diagnostic and therapeutic plans
- Disposition (admit, discharge, transfer)

For H&P templates, see `assets/history_physical_template.md`.

#### Discharge Summaries

Discharge summaries document the hospital stay and communicate care plan to outpatient providers.

**Required Elements:**

**1. Patient Identification**
- Name, date of birth, medical record number
- Admission and discharge dates
- Attending physician
- Admitting and discharge diagnoses

**2. Reason for Hospitalization**
- Brief description of presenting problem
- Chief complaint

**3. Hospital Course**
- Chronological narrative of key events
- Significant findings and procedures
- Response to treatment
- Complications
- Consultations obtained
- Organized by problem or chronologically

**4. Discharge Diagnoses**
- Primary diagnosis
- Secondary diagnoses
- Complications
- Comorbidities

**5. Procedures Performed**
- Surgeries
- Invasive procedures
- Diagnostic procedures

**6. Discharge Medications**
- Complete medication list with instructions
- Changes from admission medications
- New medications with indications

**7. Discharge Condition**
- Stable, improved, unchanged, expired
- Functional status
- Mental status

**8. Discharge Disposition**
- Home, skilled nursing facility, rehabilitation, hospice
- With or without services

**9. Follow-up Plans**
- Appointments scheduled
- Recommended follow-up timing
- Pending tests or studies
- Referrals

**10. Patient Instructions**
- Activity restrictions
- Dietary restrictions
- Wound care
- Warning signs to seek care
- Medication instructions

**Best Practices:**
- Complete within 24-48 hours of discharge
- Use clear language for outpatient providers
- Highlight important pending results
- Document code status discussions
- Include patient education provided

For discharge summary templates, see `assets/discharge_summary_template.md`.

## Regulatory Compliance and Privacy

### HIPAA Compliance

The Health Insurance Portability and Accountability Act (HIPAA) mandates protection of patient health information.

**Key Requirements:**
- Minimum necessary disclosure
- Patient authorization for use beyond treatment/payment/operations
- Secure storage and transmission
- Audit trails for electronic records
- Breach notification procedures

**De-identification Methods:**
1. **Safe Harbor Method**: Remove 18 identifiers
2. **Expert Determination**: Statistical method confirming low re-identification risk

**Business Associate Agreements:**
Required when PHI is shared with third parties for services

For detailed HIPAA guidance, see `references/regulatory_compliance.md`.

### FDA Regulations

Clinical trial documentation must comply with FDA regulations:
- 21 CFR Part 11 (Electronic Records and Signatures)
- 21 CFR Part 50 (Informed Consent)
- 21 CFR Part 56 (IRB Standards)
- 21 CFR Part 312 (IND Regulations)

### ICH-GCP Guidelines

Good Clinical Practice (GCP) guidelines ensure quality and ethical standards in clinical trials:
- Protocol adherence
- Informed consent documentation
- Source document requirements
- Audit trails and data integrity
- Investigator responsibilities

For ICH-GCP compliance, see `references/regulatory_compliance.md`.

## Medical Terminology and Standards

### Standardized Nomenclature

**SNOMED CT (Systematized Nomenclature of Medicine - Clinical Terms)**
- Comprehensive clinical terminology
- Used for electronic health records
- Enables semantic interoperability

**LOINC (Logical Observation Identifiers Names and Codes)**
- Standard for laboratory and clinical observations
- Facilitates data exchange and reporting

**ICD-10-CM (International Classification of Diseases, 10th Revision, Clinical Modification)**
- Diagnosis coding for billing and epidemiology
- Required for reimbursement

**CPT (Current Procedural Terminology)**
- Procedure coding for billing
- Maintained by AMA

### Abbreviation Standards

**Acceptable Abbreviations:**
Use standard abbreviations to improve efficiency while maintaining clarity.

**Do Not Use List (Joint Commission):**
- U (unit) - write "unit"
- IU (international unit) - write "international unit"
- QD, QOD (daily, every other day) - write "daily" or "every other day"
- Trailing zero (X.0 mg) - never use after decimal
- Lack of leading zero (.X mg) - always use before decimal (0.X mg)
- MS, MSO4, MgSO4 - write "morphine sulfate" or "magnesium sulfate"

For comprehensive terminology standards, see `references/medical_terminology.md`.

## Quality Assurance and Validation

### Documentation Quality Principles

**Completeness:**
- All required elements present
- No missing data fields
- Comprehensive patient information

**Accuracy:**
- Factually correct information
- Verified data sources
- Appropriate clinical reasoning

**Timeliness:**
- Documented contemporaneously or shortly after encounter
- Time-sensitive reports prioritized
- Regulatory deadlines met

**Clarity:**
- Clear and unambiguous language
- Organized logical structure
- Appropriate use of medical terminology

**Compliance:**
- Regulatory requirements met
- Privacy protections in place
- Institutional policies followed

### Validation Checklists

For each report type, use validation checklists to ensure quality:
- Case report CARE checklist
- Diagnostic report completeness
- SAE report regulatory compliance
- Clinical documentation billing requirements

Validation scripts are available in the `scripts/` directory.

## Data Presentation in Clinical Reports

### Tables and Figures

**Tables for Clinical Data:**
- Demographic and baseline characteristics
- Adverse events summary
- Laboratory values over time
- Efficacy outcomes

**Table Design Principles:**
- Clear column headers with units
- Footnotes for abbreviations and statistical notes
- Consistent formatting
- Appropriate precision (significant figures)

**Figures for Clinical Data:**
- Kaplan-Meier survival curves
- Forest plots for subgroup analyses
- Patient flow diagrams (CONSORT)
- Timeline figures for case reports
- Before-and-after images

**Image Guidelines:**
- High resolution (300 dpi minimum)
- Appropriate scale bars
- Annotations for key features
- De-identified (no patient identifiers visible)
- Informed consent for recognizable images

For data presentation standards, see `references/data_presentation.md`.

## Integration with Other Skills

This clinical reports skill integrates with:
- **Scientific Writing**: For clear, professional medical writing
- **Peer Review**: For quality assessment of case reports
- **Citation Management**: For literature references in case reports
- **Research Grants**: For clinical trial protocol development
- **Literature Review**: For background sections in case reports

## Workflow for Clinical Report Writing

### Case Report Workflow

**Phase 1: Case Identification and Consent (Week 1)**
- Identify novel or educational case
- Obtain patient informed consent
- De-identify patient information
- Collect clinical data and images

**Phase 2: Literature Review (Week 1-2)**
- Search for similar cases
- Review relevant pathophysiology
- Identify knowledge gaps
- Determine novelty and significance

**Phase 3: Drafting (Week 2-3)**
- Write structured outline following CARE guidelines
- Draft all sections (abstract through discussion)
- Create timeline and figures
- Format references

**Phase 4: Internal Review (Week 3-4)**
- Co-author review
- Attending physician review
- Institutional review if required
- Patient review of de-identified draft

**Phase 5: Journal Selection and Submission (Week 4-5)**
- Select appropriate journal
- Format per journal guidelines
- Prepare cover letter
- Submit manuscript

**Phase 6: Revision (Variable)**
- Respond to peer reviewer comments
- Revise manuscript
- Resubmit

### Diagnostic Report Workflow

**Real-time Workflow:**
- Review clinical indication and prior studies
- Interpret imaging, pathology, or laboratory findings
- Dictate or type report using structured format
- Peer review for complex cases
- Final sign-out and distribution
- Critical value notification if applicable

**Turnaround Time Benchmarks:**
- STAT reports: <1 hour
- Routine reports: 24-48 hours
- Complex cases: 2-5 days
- Pending additional studies: documented delay

### Clinical Trial Report Workflow

**SAE Report: 24 hours to 15 days**
- Event identified by site
- Initial assessment and documentation
- Causality and expectedness determination
- Report completion and review
- Submission to sponsor, IRB, FDA (as required)
- Follow-up reporting until resolution

**CSR: 6-12 months post-study completion**
- Database lock and data cleaning
- Statistical analysis per SAP
- Drafting by medical writer
- Review by biostatistician and clinical team
- Quality control review
- Final approval and regulatory submission

## Resources

This skill includes comprehensive reference files and templates:

### Reference Files

- `references/case_report_guidelines.md` - CARE guidelines, journal requirements, writing tips
- `references/diagnostic_reports_standards.md` - ACR, CAP, laboratory reporting standards
- `references/clinical_trial_reporting.md` - ICH-E3, CONSORT, SAE reporting, CSR structure
- `references/patient_documentation.md` - SOAP notes, H&P, discharge summaries, coding
- `references/regulatory_compliance.md` - HIPAA, 21 CFR Part 11, ICH-GCP, FDA requirements
- `references/medical_terminology.md` - SNOMED, LOINC, ICD-10, abbreviations, nomenclature
- `references/data_presentation.md` - Tables, figures, safety data, CONSORT diagrams
- `references/peer_review_standards.md` - Review criteria for clinical manuscripts

### Template Assets

- `assets/case_report_template.md` - Structured case report following CARE guidelines
- `assets/radiology_report_template.md` - Standard radiology report format
- `assets/pathology_report_template.md` - Surgical pathology report with synoptic elements
- `assets/lab_report_template.md` - Clinical laboratory report format
- `assets/clinical_trial_sae_template.md` - Serious adverse event report form
- `assets/clinical_trial_csr_template.md` - Clinical study report outline per ICH-E3
- `assets/soap_note_template.md` - SOAP progress note format
- `assets/history_physical_template.md` - Comprehensive H&P template
- `assets/discharge_summary_template.md` - Hospital discharge summary
- `assets/consult_note_template.md` - Consultation note format
- `assets/quality_checklist.md` - Quality assurance checklist for all report types
- `assets/hipaa_compliance_checklist.md` - Privacy and de-identification checklist

### Automation Scripts

- `scripts/validate_case_report.py` - Check CARE guideline compliance and completeness
- `scripts/validate_trial_report.py` - Verify ICH-E3 structure and required elements
- `scripts/check_deidentification.py` - Scan for 18 HIPAA identifiers in text
- `scripts/format_adverse_events.py` - Generate AE summary tables from data
- `scripts/generate_report_template.py` - Interactive template selection and generation
- `scripts/extract_clinical_data.py` - Parse structured data from clinical reports
- `scripts/compliance_checker.py` - Verify regulatory compliance requirements
- `scripts/terminology_validator.py` - Validate medical terminology and coding

Load these resources as needed when working on specific clinical reports.

## Common Pitfalls to Avoid

### Case Reports
- **Privacy violations**: Inadequate de-identification or missing consent
- **Lack of novelty**: Reporting common or well-documented cases
- **Insufficient detail**: Missing key clinical information
- **Poor literature review**: Failure to contextualize within existing knowledge
- **Overgeneralization**: Drawing broad conclusions from single case

### Diagnostic Reports
- **Vague language**: Using ambiguous terms like "unremarkable" without specifics
- **Incomplete comparison**: Not reviewing prior imaging
- **Missing clinical correlation**: Failing to answer clinical question
- **Technical jargon**: Overuse of terminology without explanation
- **Delayed critical value notification**: Not communicating urgent findings

### Clinical Trial Reports
- **Late reporting**: Missing regulatory deadlines for SAE reporting
- **Incomplete causality**: Inadequate causality assessment
- **Data inconsistencies**: Discrepancies between data sources
- **Protocol deviations**: Unreported or inadequately documented deviations
- **Selective reporting**: Omitting negative or unfavorable results

### Patient Documentation
- **Illegibility**: Poor handwriting in paper records
- **Copy-forward errors**: Propagating outdated information
- **Insufficient detail**: Vague or incomplete documentation affecting billing
- **Lack of medical necessity**: Not documenting indication for services
- **Missing signatures**: Unsigned or undated notes

## Final Checklist

Before finalizing any clinical report, verify:

- [ ] All required sections complete
- [ ] Patient privacy protected (HIPAA compliance)
- [ ] Informed consent obtained (if applicable)
- [ ] Accurate and verified clinical data
- [ ] Appropriate medical terminology and coding
- [ ] Clear, professional language
- [ ] Proper formatting per guidelines
- [ ] References cited appropriately
- [ ] Figures and tables labeled correctly
- [ ] Spell-checked and proofread
- [ ] Regulatory requirements met
- [ ] Institutional policies followed
- [ ] Signatures and dates present
- [ ] Quality assurance review completed

---

**Final Note**: Clinical report writing requires attention to detail, medical accuracy, regulatory compliance, and clear communication. Whether documenting patient care, reporting research findings, or communicating diagnostic results, the quality of clinical reports directly impacts patient safety, healthcare delivery, and medical knowledge advancement. Always prioritize accuracy, privacy, and professionalism in all clinical documentation.


