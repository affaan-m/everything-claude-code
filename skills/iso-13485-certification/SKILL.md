---
name: iso-13485-certification
description: Comprehensive toolkit for preparing ISO 13485 certification documentation for medical device Quality Management Systems. Use when users need help with ISO 13485 QMS documentation, including (1) conducting gap analysis of existing documentation, (2) creating Quality Manuals, (3) developing required procedures and work instructions, (4) preparing Medical Device Files, (5) understanding ISO 13485 requirements, or (6) identifying missing documentation for medical device certification. Also use when users mention medical device regulations, QMS certification, FDA QMSR, EU MDR, or need help with quality system documentation.
license: MIT license
metadata:
    skill-author: K-Dense Inc.
---

# ISO 13485 Certification Documentation Assistant

## Overview

This skill helps medical device manufacturers prepare comprehensive documentation for ISO 13485:2016 certification. It provides tools, templates, references, and guidance to create, review, and gap-analyze all required Quality Management System (QMS) documentation.

**What this skill provides:**
- Gap analysis of existing documentation
- Templates for all mandatory documents
- Comprehensive requirements guidance
- Step-by-step documentation creation
- Identification of missing documentation
- Compliance checklists

**When to use this skill:**
- Starting ISO 13485 certification process
- Conducting gap analysis against ISO 13485
- Creating or updating QMS documentation
- Preparing for certification audit
- Transitioning from FDA QSR to QMSR
- Harmonizing with EU MDR requirements

## Core Workflow

### 1. Assess Current State (Gap Analysis)

**When to start here:** User has existing documentation and needs to identify gaps

**Process:**

1. **Collect existing documentation:**
   - Ask user to provide directory of current QMS documents
   - Documents can be in any format (.txt, .md, .doc, .docx, .pdf)
   - Include any procedures, manuals, work instructions, forms

2. **Run gap analysis script:**
   ```bash
   python scripts/gap_analyzer.py --docs-dir <path_to_docs> --output gap-report.json
   ```

3. **Review results:**
   - Identify which of the 31 required procedures are present
   - Identify missing key documents (Quality Manual, MDF, etc.)
   - Calculate compliance percentage
   - Prioritize missing documentation

4. **Present findings to user:**
   - Summarize what exists
   - Clearly list what's missing
   - Provide prioritized action plan
   - Estimate effort required

**Output:** Comprehensive gap analysis report with prioritized action items

### 2. Understand Requirements (Reference Consultation)

**When to use:** User needs to understand specific ISO 13485 requirements

**Available references:**
- `references/iso-13485-requirements.md` - Complete clause-by-clause breakdown
- `references/mandatory-documents.md` - All 31 required procedures explained
- `references/gap-analysis-checklist.md` - Detailed compliance checklist
- `references/quality-manual-guide.md` - How to create Quality Manual

**How to use:**

1. **For specific clause questions:**
   - Read relevant section from `iso-13485-requirements.md`
   - Explain requirements in plain language
   - Provide practical examples

2. **For document requirements:**
   - Consult `mandatory-documents.md`
   - Explain what must be documented
   - Clarify when documents are applicable vs. excludable

3. **For implementation guidance:**
   - Use `quality-manual-guide.md` for policy-level documents
   - Provide step-by-step creation process
   - Show examples of good vs. poor implementation

**Key reference sections to know:**

- **Clause 4:** QMS requirements, documentation, risk management, software validation
- **Clause 5:** Management responsibility, quality policy, objectives, management review
- **Clause 6:** Resources, competence, training, infrastructure
- **Clause 7:** Product realization, design, purchasing, production, traceability
- **Clause 8:** Measurement, audits, CAPA, complaints, data analysis

### 3. Create Documentation (Template-Based Generation)

**When to use:** User needs to create specific QMS documents

**Available templates:**
- Quality Manual: `assets/templates/quality-manual-template.md`
- CAPA Procedure: `assets/templates/procedures/CAPA-procedure-template.md`
- Document Control: `assets/templates/procedures/document-control-procedure-template.md`

**Process for document creation:**

1. **Identify what needs to be created:**
   - Based on gap analysis or user request
   - Prioritize critical documents first (Quality Manual, CAPA, Complaints, Audits)

2. **Select appropriate template:**
   - Use Quality Manual template for QM
   - Use procedure templates as examples for SOPs
   - Adapt structure to organization's needs

3. **Customize template with user-specific information:**
   - Replace all placeholder text: [COMPANY NAME], [DATE], [NAME], etc.
   - Tailor scope to user's actual operations
   - Add or remove sections based on applicability
   - Ensure consistency with organization's processes

4. **Key customization areas:**
   - Company information and addresses
   - Product types and classifications
   - Applicable regulatory requirements
   - Organization structure and responsibilities
   - Actual processes and procedures
   - Document numbering schemes
   - Exclusions and justifications

5. **Validate completeness:**
   - All required sections present
   - All placeholders replaced
   - Cross-references correct
   - Approval sections complete

**Document creation priority order:**

**Phase 1 - Foundation (Critical):**
1. Quality Manual
2. Quality Policy and Objectives
3. Document Control procedure
4. Record Control procedure

**Phase 2 - Core Processes (High Priority):**
5. Corrective and Preventive Action (CAPA)
6. Complaint Handling
7. Internal Audit
8. Management Review
9. Risk Management

**Phase 3 - Product Realization (High Priority):**
10. Design and Development (if applicable)
11. Purchasing
12. Production and Service Provision
13. Control of Nonconforming Product

**Phase 4 - Supporting Processes (Medium Priority):**
14. Training and Competence
15. Calibration/Control of M&M Equipment
16. Process Validation
17. Product Identification and Traceability

**Phase 5 - Additional Requirements (Medium Priority):**
18. Feedback and Post-Market Surveillance
19. Regulatory Reporting
20. Customer Communication
21. Data Analysis

**Phase 6 - Specialized (If Applicable):**
22. Installation (if applicable)
23. Servicing (if applicable)
24. Sterilization (if applicable)
25. Contamination Control (if applicable)

### 4. Develop Specific Documents

#### Creating a Quality Manual

**Process:**

1. **Read the comprehensive guide:**
   - Read `references/quality-manual-guide.md` in full
   - Understand structure and required content
   - Review examples provided

2. **Gather organization information:**
   - Legal company name and addresses
   - Product types and classifications
   - Organizational structure
   - Applicable regulations
   - Scope of operations
   - Any exclusions needed

3. **Use template:**
   - Start with `assets/templates/quality-manual-template.md`
   - Follow structure exactly (required by ISO 13485)
   - Replace all placeholders

4. **Complete required sections:**
   - **Section 0:** Document control, approvals
   - **Section 1:** Introduction, company overview
   - **Section 2:** Scope and exclusions (critical - must justify exclusions)
   - **Section 3:** Quality Policy (must be signed by top management)
   - **Sections 4-8:** Address each ISO 13485 clause at policy level
   - **Appendices:** Procedure list, org chart, process map, definitions

5. **Key requirements:**
   - Must reference all 31 documented procedures (Appendix A)
   - Must describe process interactions (Appendix C - create process map)
   - Must define documentation structure (Section 4.2)
   - Must justify any exclusions (Section 2.4)

6. **Validation checklist:**
   - [ ] All required content per ISO 13485 Clause 4.2.2
   - [ ] Quality Policy signed by top management
   - [ ] All exclusions justified
   - [ ] All procedures listed in Appendix A
   - [ ] Process map included
   - [ ] Organization chart included

#### Creating Procedures (SOPs)

**General approach for all procedures:**

1. **Understand the requirement:**
   - Read relevant clause in `references/iso-13485-requirements.md`
   - Understand WHAT must be documented
   - Identify WHO, WHEN, WHERE for your organization

2. **Use template structure:**
   - Follow CAPA or Document Control templates as examples
   - Standard sections: Purpose, Scope, Definitions, Responsibilities, Procedure, Records, References
   - Keep procedures clear and actionable

3. **Define responsibilities clearly:**
   - Identify specific roles (not names)
   - Define responsibilities for each role
   - Ensure coverage of all required activities

4. **Document the "what" not excessive "how":**
   - Procedures should define WHAT must be done
   - Detailed HOW-TO goes in Work Instructions (Tier 3)
   - Strike balance between guidance and flexibility

5. **Include required elements:**
   - All elements specified in ISO 13485 clause
   - Records that must be maintained
   - Responsibilities for each activity
   - References to related documents

**Example: Creating CAPA Procedure**

1. Read ISO 13485 Clauses 8.5.2 and 8.5.3 from references
2. Use `assets/templates/procedures/CAPA-procedure-template.md`
3. Customize:
   - CAPA prioritization criteria for your organization
   - Root cause analysis methods you'll use
   - Approval authorities and responsibilities
   - Timeframes based on your operations
   - Integration with complaint handling, audits, etc.
4. Add forms as attachments:
   - CAPA Request Form
   - Root Cause Analysis Worksheet
   - Action Plan Template
   - Effectiveness Verification Checklist

#### Creating Medical Device Files (MDF)

**What is an MDF:**
- File for each medical device type or family
- Replaces separate DHF, DMR, DHR (per FDA QMSR harmonization)
- Contains all documentation about the device

**Required contents per ISO 13485 Clause 4.2.3:**

1. General description and intended use
2. Label and instructions for use specifications
3. Product specifications
4. Manufacturing specifications
5. Procedures for purchasing, manufacturing, servicing
6. Procedures for measuring and monitoring
7. Installation requirements (if applicable)
8. Risk management file(s)
9. Verification and validation information
10. Design and development file(s) (when applicable)

**Process:**

1. Identify each device type or family
2. Create MDF structure (folder or binder)
3. Collect or create each required element
4. Ensure traceability between documents
5. Maintain as living document (update with changes)

### 5. Conduct Comprehensive Gap Analysis

**When to use:** User wants detailed assessment of all requirements

**Process:**

1. **Use comprehensive checklist:**
   - Open `references/gap-analysis-checklist.md`
   - Work through clause by clause
   - Mark status for each requirement: Compliant, Partial, Non-compliant, N/A

2. **For each clause:**
   - Read requirement description
   - Identify existing evidence
   - Note gaps or deficiencies
   - Define action required
   - Assign responsibility and target date

3. **Summarize by clause:**
   - Calculate compliance percentage per clause
   - Identify highest-risk gaps
   - Prioritize actions

4. **Create action plan:**
   - List all gaps
   - Prioritize: Critical > High > Medium > Low
   - Assign owners and dates
   - Estimate resources needed

5. **Output:**
   - Completed gap analysis checklist
   - Summary report with compliance percentages
   - Prioritized action plan
   - Timeline and milestones

## Common Scenarios

### Scenario 1: Starting from Scratch

**User request:** "We're a medical device startup and need to implement ISO 13485. Where do we start?"

**Approach:**

1. **Explain the journey:**
   - ISO 13485 requires comprehensive QMS documentation
   - Typically 6-12 months for full implementation
   - Can be done incrementally

2. **Start with foundation:**
   - Quality Policy and Objectives
   - Quality Manual
   - Organization structure and responsibilities

3. **Follow the priority order:**
   - Use Phase 1-6 priority list above
   - Create documents in logical sequence
   - Build on previously created documents

4. **Key milestones:**
   - Month 1-2: Foundation documents (Quality Manual, policies)
   - Month 3-4: Core processes (CAPA, Complaints, Audits)
   - Month 5-6: Product realization processes
   - Month 7-8: Supporting processes
   - Month 9-10: Internal audits and refinement
   - Month 11-12: Management review and certification audit

### Scenario 2: Gap Analysis for Existing QMS

**User request:** "We have some procedures but don't know what we're missing for ISO 13485."

**Approach:**

1. **Run automated gap analysis:**
   - Ask for document directory
   - Run `scripts/gap_analyzer.py`
   - Review automated findings

2. **Conduct detailed assessment:**
   - Use comprehensive checklist for user's specific situation
   - Go deeper than automated analysis
   - Assess quality of existing documents, not just presence

3. **Provide prioritized gap list:**
   - Missing mandatory procedures
   - Incomplete procedures
   - Quality issues with existing documents
   - Missing records or forms

4. **Create remediation plan:**
   - High priority: Safety-related, regulatory-required
   - Medium priority: Core QMS processes
   - Low priority: Improvement opportunities

### Scenario 3: Creating Specific Document

**User request:** "Help me create a CAPA procedure."

**Approach:**

1. **Explain requirements:**
   - Read ISO 13485 Clauses 8.5.2 and 8.5.3 from references
   - Explain what must be in CAPA procedure
   - Provide examples of good CAPA processes

2. **Use template:**
   - Start with CAPA procedure template
   - Explain each section's purpose
   - Show what needs customization

3. **Gather user-specific info:**
   - How are CAPAs initiated in their organization?
   - Who are the responsible parties?
   - What prioritization criteria make sense?
   - What RCA methods will they use?
   - What are appropriate timeframes?

4. **Create customized procedure:**
   - Replace all placeholders
   - Adapt to user's processes
   - Ensure completeness

5. **Add supporting materials:**
   - CAPA request form
   - RCA worksheets
   - Action plan template
   - Effectiveness verification checklist

### Scenario 4: Updating for Regulatory Changes

**User request:** "We need to update our QMS for FDA QMSR harmonization."

**Approach:**

1. **Explain changes:**
   - FDA 21 CFR Part 820 harmonized with ISO 13485
   - Now called QMSR (effective Feb 2, 2026)
   - Key change: Medical Device File replaces DHF/DMR/DHR

2. **Review current documentation:**
   - Identify documents referencing QSR
   - Find separate DHF, DMR, DHR structures
   - Check for ISO 13485 compliance gaps

3. **Update strategy:**
   - Update references from QSR to QMSR
   - Consolidate DHF/DMR/DHR into Medical Device Files
   - Add any missing ISO 13485 requirements
   - Maintain backward compatibility during transition

4. **Create transition plan:**
   - Update Quality Manual
   - Update MDF procedure
   - Reorganize device history files
   - Train personnel on changes

### Scenario 5: Preparing for Certification Audit

**User request:** "We have our documentation ready. How do we prepare for the certification audit?"

**Approach:**

1. **Conduct readiness assessment:**
   - Use comprehensive gap analysis checklist
   - Review all documentation for completeness
   - Verify records exist for all required items
   - Check for consistent implementation

2. **Pre-audit checklist:**
   - [ ] All 31 procedures documented and approved
   - [ ] Quality Manual complete with all required content
   - [ ] Medical Device Files complete for all products
   - [ ] Internal audit completed with findings addressed
   - [ ] Management review completed
   - [ ] Personnel trained on QMS procedures
   - [ ] Records maintained per retention requirements
   - [ ] CAPA system functional with effectiveness demonstrated
   - [ ] Complaints system operational

3. **Conduct mock audit:**
   - Use ISO 13485 requirements as audit criteria
   - Sample records to verify consistent implementation
   - Interview personnel to verify understanding
   - Identify any non-conformances

4. **Address findings:**
   - Correct any deficiencies
   - Document corrections
   - Verify effectiveness

5. **Final preparation:**
   - Brief management and staff
   - Prepare audit schedule
   - Organize evidence and records
   - Designate escorts and support personnel

## Best Practices

### Document Development

1. **Start at policy level, then add detail:**
   - Quality Manual = policy level
   - Procedures = what, who, when
   - Work Instructions = detailed how-to
   - Forms = data collection

2. **Maintain consistency:**
   - Use same terminology throughout
   - Cross-reference related documents
   - Keep numbering scheme consistent
   - Update all related documents together

3. **Write for your audience:**
   - Clear, simple language
   - Avoid jargon
   - Define technical terms
   - Provide examples where helpful

4. **Make procedures usable:**
   - Action-oriented language
   - Logical flow
   - Clear responsibilities
   - Realistic timeframes

### Exclusions

**When you can exclude:**
- Design and development (if contract manufacturer only)
- Installation (if product requires no installation)
- Servicing (if not offered)
- Sterilization (if non-sterile product)

**Justification requirements:**
- Must be in Quality Manual
- Must explain why excluded
- Cannot exclude if process performed
- Cannot affect ability to provide safe, effective devices

**Example good justification:**
> "Clause 7.3 Design and Development is excluded. ABC Company operates as a contract manufacturer and produces medical devices according to complete design specifications provided by customers. All design activities are performed by the customer and ABC Company has no responsibility for design inputs, outputs, verification, validation, or design changes."

**Example poor justification:**
> "We don't do design." (Too brief, doesn't explain why or demonstrate no impact)

### Common Mistakes to Avoid

1. **Copying ISO 13485 text verbatim**
   - Write in your own words
   - Describe YOUR processes
   - Make it actionable for your organization

2. **Making procedures too detailed**
   - Procedures should be stable
   - Excessive detail belongs in work instructions
   - Balance guidance with flexibility

3. **Creating documents in isolation**
   - Ensure consistency across QMS
   - Cross-reference related documents
   - Build on previously created documents

4. **Forgetting records**
   - Every procedure should specify records
   - Define retention requirements
   - Ensure records actually maintained

5. **Inadequate approval**
   - Quality Manual must be signed by top management
   - All procedures must be properly approved
   - Train staff before documents become effective

## Resources

### scripts/
- `gap_analyzer.py` - Automated tool to analyze existing documentation and identify gaps against ISO 13485 requirements

### references/
- `iso-13485-requirements.md` - Complete breakdown of ISO 13485:2016 requirements clause by clause
- `mandatory-documents.md` - Detailed list of all 31 required procedures plus other mandatory documents
- `gap-analysis-checklist.md` - Comprehensive checklist for detailed gap assessment
- `quality-manual-guide.md` - Step-by-step guide for creating a compliant Quality Manual

### assets/templates/
- `quality-manual-template.md` - Complete template for Quality Manual with all required sections
- `procedures/CAPA-procedure-template.md` - Example CAPA procedure following best practices
- `procedures/document-control-procedure-template.md` - Example document control procedure

## Quick Reference

### The 31 Required Documented Procedures

1. Risk Management (4.1.5)
2. Software Validation (4.1.6)
3. Control of Documents (4.2.4)
4. Control of Records (4.2.5)
5. Internal Communication (5.5.3)
6. Management Review (5.6.1)
7. Human Resources/Competence (6.2)
8. Infrastructure Maintenance (6.3) - when applicable
9. Contamination Control (6.4.2) - when applicable
10. Customer Communication (7.2.3)
11. Design and Development (7.3.1-10) - when applicable
12. Purchasing (7.4.1)
13. Verification of Purchased Product (7.4.3)
14. Production Control (7.5.1)
15. Product Cleanliness (7.5.2) - when applicable
16. Installation (7.5.3) - when applicable
17. Servicing (7.5.4) - when applicable
18. Process Validation (7.5.6) - when applicable
19. Sterilization Validation (7.5.7) - when applicable
20. Product Identification (7.5.8)
21. Traceability (7.5.9)
22. Customer Property (7.5.10) - when applicable
23. Preservation of Product (7.5.11)
24. Control of M&M Equipment (7.6)
25. Feedback (8.2.1)
26. Complaint Handling (8.2.2)
27. Regulatory Reporting (8.2.3)
28. Internal Audit (8.2.4)
29. Process Monitoring (8.2.5)
30. Product Monitoring (8.2.6)
31. Control of Nonconforming Product (8.3)
32. Corrective Action (8.5.2)
33. Preventive Action (8.5.3)

*(Note: Traditional count is "31 procedures" though list shows more because some are conditional)*

### Key Regulatory Requirements

**FDA (United States):**
- 21 CFR Part 820 (now QMSR) - harmonized with ISO 13485 as of Feb 2026
- Device classification determines requirements
- Establishment registration and device listing required

**EU (European Union):**
- MDR 2017/745 (Medical Devices Regulation)
- IVDR 2017/746 (In Vitro Diagnostic Regulation)
- Technical documentation requirements
- CE marking requirements

**Canada:**
- Canadian Medical Devices Regulations (SOR/98-282)
- Device classification system
- Medical Device Establishment License (MDEL)

**Other Regions:**
- Australia TGA, Japan PMDA, China NMPA, etc.
- Often require or recognize ISO 13485 certification

### Document Retention

**Minimum retention:** Lifetime of medical device as defined by organization

**Typical retention periods:**
- Design documents: Life of device + 5-10 years
- Manufacturing records: Life of device
- Complaint records: Life of device + 5-10 years
- CAPA records: 5-10 years minimum
- Calibration records: Retention period of equipment + 1 calibration cycle

**Always comply with applicable regulatory requirements which may specify longer periods.**

---

## Getting Started

**First-time users should:**

1. Read `references/iso-13485-requirements.md` to understand the standard
2. If you have existing documentation, run gap analysis script
3. Create Quality Manual using template and guide
4. Develop procedures in priority order
5. Use comprehensive checklist for final validation

**For specific tasks:**
- Creating Quality Manual → See Section 4 and use quality-manual-guide.md
- Creating CAPA procedure → See Section 4 and use CAPA template
- Gap analysis → See Section 1 and 5
- Understanding requirements → See Section 2

**Need help?** Start by describing your situation: what stage you're at, what you have, and what you need to create.

