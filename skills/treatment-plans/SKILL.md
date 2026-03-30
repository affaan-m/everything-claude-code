---
name: treatment-plans
description: Generate concise (3-4 page), focused medical treatment plans in LaTeX/PDF format for all clinical specialties. Supports general medical treatment, rehabilitation therapy, mental health care, chronic disease management, perioperative care, and pain management. Includes SMART goal frameworks, evidence-based interventions with minimal text citations, regulatory compliance (HIPAA), and professional formatting. Prioritizes brevity and clinical actionability.
allowed-tools: Read Write Edit Bash
license: MIT license
metadata:
    skill-author: K-Dense Inc.
---

# Treatment Plan Writing

## Overview

Treatment plan writing is the systematic documentation of clinical care strategies designed to address patient health conditions through evidence-based interventions, measurable goals, and structured follow-up. This skill provides comprehensive LaTeX templates and validation tools for creating **concise, focused** treatment plans (3-4 pages standard) across all medical specialties with full regulatory compliance.

**Critical Principles:**
1. **CONCISE & ACTIONABLE**: Treatment plans default to 3-4 pages maximum, focusing only on clinically essential information that impacts care decisions
2. **Patient-Centered**: Plans must be evidence-based, measurable, and compliant with healthcare regulations (HIPAA, documentation standards)
3. **Minimal Citations**: Use brief in-text citations only when needed to support clinical recommendations; avoid extensive bibliographies

Every treatment plan should include clear goals, specific interventions, defined timelines, monitoring parameters, and expected outcomes that align with patient preferences and current clinical guidelines - all presented as efficiently as possible.

## When to Use This Skill

This skill should be used when:
- Creating individualized treatment plans for patient care
- Documenting therapeutic interventions for chronic disease management
- Developing rehabilitation programs (physical therapy, occupational therapy, cardiac rehab)
- Writing mental health and psychiatric treatment plans
- Planning perioperative and surgical care pathways
- Establishing pain management protocols
- Setting patient-centered goals using SMART criteria
- Coordinating multidisciplinary care across specialties
- Ensuring regulatory compliance in treatment documentation
- Generating professional treatment plans for medical records

## Visual Enhancement with Scientific Schematics

**⚠️ MANDATORY: Every treatment plan MUST include at least 1 AI-generated figure using the scientific-schematics skill.**

This is not optional. Treatment plans benefit greatly from visual elements. Before finalizing any document:
1. Generate at minimum ONE schematic or diagram (e.g., treatment pathway flowchart, care coordination diagram, or therapy timeline)
2. For complex plans: include decision algorithm flowchart
3. For rehabilitation plans: include milestone progression diagram

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
- Treatment pathway flowcharts
- Care coordination diagrams
- Therapy progression timelines
- Multidisciplinary team interaction diagrams
- Medication management flowcharts
- Rehabilitation protocol visualizations
- Clinical decision algorithm diagrams
- Any complex concept that benefits from visualization

For detailed guidance on creating schematics, refer to the scientific-schematics skill documentation.

---

## Document Format and Best Practices

### Document Length Options

Treatment plans come in three format options based on clinical complexity and use case:

#### Option 1: One-Page Treatment Plan (PREFERRED for most cases)

**When to use**: Straightforward clinical scenarios, standard protocols, busy clinical settings

**Format**: Single page containing all essential treatment information in scannable sections
- No table of contents needed
- No extensive narratives
- Focused on actionable items only
- Similar to precision oncology reports or treatment recommendation cards

**Required sections** (all on one page):
1. **Header Box**: Patient info, diagnosis, date, molecular/risk profile if applicable
2. **Treatment Regimen**: Numbered list of specific interventions
3. **Supportive Care**: Brief bullet points
4. **Rationale**: 1-2 sentence justification (optional for standard protocols)
5. **Monitoring**: Key parameters and frequency
6. **Evidence Level**: Guideline reference or evidence grade (e.g., "Level 1, FDA approved")
7. **Expected Outcome**: Timeline and success metrics

**Design principles**:
- Use small boxes/tables for organization (like the clinical treatment recommendation card format)
- Eliminate all non-essential text
- Use abbreviations familiar to clinicians
- Dense information layout - maximize information per square inch
- Think "quick reference card" not "comprehensive documentation"

**Example structure**:
```latex
[Patient ID/Diagnosis Box at top]

TARGET PATIENT POPULATION
  Number of patients, demographics, key features

PRIMARY TREATMENT REGIMEN
  • Medication 1: dose, frequency, duration
  • Procedure: specific details
  • Monitoring: what and when

SUPPORTIVE CARE
  • Key supportive medications

RATIONALE
  Brief clinical justification

MOLECULAR TARGETS / RISK FACTORS
  Relevant biomarkers or risk stratification

EVIDENCE LEVEL
  Guideline reference, trial data

MONITORING REQUIREMENTS
  Key labs/vitals, frequency

EXPECTED CLINICAL BENEFIT
  Primary endpoint, timeline
```

#### Option 2: Standard 3-4 Page Format

**When to use**: Moderate complexity, need for patient education materials, multidisciplinary coordination

Uses the Foundation Medicine first-page summary model with 2-3 additional pages of details.

#### Option 3: Extended 5-6 Page Format

**When to use**: Complex comorbidities, research protocols, extensive safety monitoring required

### First Page Summary (Foundation Medicine Model)

**CRITICAL REQUIREMENT: All treatment plans MUST have a complete executive summary on the first page ONLY, before any table of contents or detailed sections.**

Following the Foundation Medicine model for precision medicine reporting and clinical summary documents, treatment plans begin with a one-page executive summary that provides immediate access to key actionable information. This entire summary must fit on the first page.

**Required First Page Structure (in order):**

1. **Title and Subtitle**
   - Main title: Treatment plan type (e.g., "Comprehensive Treatment Plan")
   - Subtitle: Specific condition or focus (e.g., "Type 2 Diabetes Mellitus - Young Adult Patient")

2. **Report Information Box** (using `\begin{infobox}` or `\begin{patientinfo}`)
   - Report type/document purpose
   - Date of plan creation
   - Patient demographics (age, sex, de-identified)
   - Primary diagnosis with ICD-10 code
   - Report author/clinic (if applicable)
   - Analysis approach or framework used

3. **Key Findings or Treatment Highlights** (2-4 colored boxes using appropriate box types)
   - **Primary Treatment Goals** (using `\begin{goalbox}`)
     - 2-3 SMART goals in bullet format
   - **Main Interventions** (using `\begin{keybox}` or `\begin{infobox}`)
     - 2-3 key interventions (pharmacological, non-pharmacological, monitoring)
   - **Critical Decision Points** (using `\begin{warningbox}` if urgent)
     - Important monitoring thresholds or safety considerations
   - **Timeline Overview** (using `\begin{infobox}`)
     - Brief treatment duration/phases
     - Key milestone dates

**Visual Format Requirements:**
- Use `\thispagestyle{empty}` to remove page numbers from first page
- All content must fit on page 1 (before `\newpage`)
- Use colored boxes (tcolorbox package) with different colors for different information types
- Boxes should be visually prominent and easy to scan
- Use concise, bullet-point format
- Table of contents (if included) starts on page 2
- Detailed sections start on page 3

**Example First Page Structure:**
```latex
\maketitle
\thispagestyle{empty}

% Report Information Box
\begin{patientinfo}
  Report Type, Date, Patient Info, Diagnosis, etc.
\end{patientinfo}

% Key Finding #1: Treatment Goals
\begin{goalbox}[Primary Treatment Goals]
  • Goal 1
  • Goal 2
  • Goal 3
\end{goalbox}

% Key Finding #2: Main Interventions
\begin{keybox}[Core Interventions]
  • Intervention 1
  • Intervention 2
  • Intervention 3
\end{keybox}

% Key Finding #3: Critical Monitoring (if applicable)
\begin{warningbox}[Critical Decision Points]
  • Decision point 1
  • Decision point 2
\end{warningbox}

\newpage
\tableofcontents  % TOC on page 2
\newpage  % Detailed content starts page 3
```

### Concise Documentation

**CRITICAL: Treatment plans MUST prioritize brevity and clinical relevance. Default to 3-4 pages maximum unless clinical complexity absolutely demands more detail.**

Treatment plans should prioritize **clarity and actionability** over exhaustive detail:

- **Focused**: Include only clinically essential information that impacts care decisions
- **Actionable**: Emphasize what needs to be done, when, and why
- **Efficient**: Facilitate quick decision-making without sacrificing clinical quality
- **Target length options**:
  - **1-page format** (preferred for straightforward cases): Quick-reference card with all essential information
  - **3-4 pages standard**: Standard format with first-page summary + supporting details
  - **5-6 pages** (rare): Only for highly complex cases with multiple comorbidities or multidisciplinary interventions

**Streamlining Guidelines:**
- **First Page Summary**: Use individual colored boxes to consolidate key information (goals, interventions, decision points) - this alone can often convey the essential treatment plan
- **Eliminate Redundancy**: If information is in the first-page summary, don't repeat it verbatim in detailed sections
- **Patient Education section**: 3-5 key bullet points on critical topics and warning signs only
- **Risk Mitigation section**: Highlight only critical medication safety concerns and emergency actions (not exhaustive lists)
- **Expected Outcomes section**: 2-3 concise statements on anticipated responses and timelines
- **Interventions**: Focus on primary interventions; secondary/supportive measures in brief bullet format
- **Use tables and bullet points** extensively for efficient presentation
- **Avoid narrative prose** where structured lists suffice
- **Combine related sections** when appropriate to reduce page count

### Quality Over Quantity

The goal is professional, clinically complete documentation that respects clinicians' time while ensuring comprehensive patient care. Every section should add value; remove or condense sections that don't directly inform treatment decisions.

### Citations and Evidence Support

**Use minimal, targeted citations to support clinical recommendations:**

- **Text Citations Preferred**: Use brief in-text citations (Author Year) or simple references rather than extensive bibliographies unless specifically requested
- **When to Cite**:
  - Clinical practice guideline recommendations (e.g., "per ADA 2024 guidelines")
  - Specific medication dosing or protocols (e.g., "ACC/AHA recommendations")
  - Novel or controversial interventions requiring evidence support
  - Risk stratification tools or validated assessment scales
- **When NOT to Cite**:
  - Standard-of-care interventions widely accepted in the field
  - Basic medical facts and routine clinical practices
  - General patient education content
- **Citation Format**: 
  - Inline: "Initiate metformin as first-line therapy (ADA Standards of Care 2024)"
  - Minimal: "Treatment follows ACC/AHA heart failure guidelines"
  - Avoid formal numbered references and extensive bibliography sections unless document is for academic/research purposes
- **Keep it Brief**: A 3-4 page treatment plan should have 0-3 citations maximum, only where essential for clinical credibility or novel recommendations

## Core Capabilities

### 1. General Medical Treatment Plans

General medical treatment plans address common chronic conditions and acute medical issues requiring structured therapeutic interventions.

#### Standard Components

**Patient Information (De-identified)**
- Demographics (age, sex, relevant medical background)
- Active medical conditions and comorbidities
- Current medications and allergies
- Relevant social and family history
- Functional status and baseline assessments
- **HIPAA Compliance**: Remove all 18 identifiers per Safe Harbor method

**Diagnosis and Assessment Summary**
- Primary diagnosis with ICD-10 code
- Secondary diagnoses and comorbidities
- Severity classification and staging
- Functional limitations and quality of life impact
- Risk stratification (e.g., cardiovascular risk, fall risk)
- Prognostic indicators

**Treatment Goals (SMART Format)**

Short-term goals (1-3 months):
- **Specific**: Clearly defined outcome (e.g., "Reduce HbA1c to <7%")
- **Measurable**: Quantifiable metrics (e.g., "Decrease systolic BP by 10 mmHg")
- **Achievable**: Realistic given patient capabilities
- **Relevant**: Aligned with patient priorities and values
- **Time-bound**: Specific timeframe (e.g., "within 8 weeks")

Long-term goals (6-12 months):
- Disease control or remission targets
- Functional improvement objectives
- Quality of life enhancement
- Prevention of complications
- Maintenance of independence

**Interventions**

*Pharmacological*:
- Medications with specific dosages, routes, frequencies
- Titration schedules and target doses
- Drug-drug interaction considerations
- Monitoring for adverse effects
- Medication reconciliation

*Non-pharmacological*:
- Lifestyle modifications (diet, exercise, smoking cessation)
- Behavioral interventions
- Patient education and self-management
- Monitoring and self-tracking (glucose, blood pressure, weight)
- Assistive devices or adaptive equipment

*Procedural*:
- Planned procedures or interventions
- Referrals to specialists
- Diagnostic testing schedule
- Preventive care (vaccinations, screenings)

**Timeline and Schedule**
- Treatment phases with specific timeframes
- Appointment frequency (weekly, monthly, quarterly)
- Milestone assessments and goal evaluations
- Medication adjustments schedule
- Expected duration of treatment

**Monitoring Parameters**
- Clinical outcomes to track (vital signs, lab values, symptoms)
- Assessment tools and scales (e.g., PHQ-9, pain scales)
- Frequency of monitoring
- Thresholds for intervention or escalation
- Patient-reported outcomes

**Expected Outcomes**
- Primary outcome measures
- Success criteria and benchmarks
- Expected timeline for improvement
- Criteria for treatment modification
- Long-term prognosis

**Follow-up Plan**
- Scheduled appointments and reassessments
- Communication plan (phone calls, secure messaging)
- Emergency contact procedures
- Criteria for urgent evaluation
- Transition or discharge planning

**Patient Education**
- Understanding of condition and treatment rationale
- Self-management skills training
- Medication administration and adherence
- Warning signs and when to seek help
- Resources and support services

**Risk Mitigation**
- Potential adverse effects and management
- Drug interactions and contraindications
- Fall prevention, infection prevention
- Emergency action plans
- Safety monitoring

#### Common Applications

- Diabetes mellitus management
- Hypertension control
- Heart failure treatment
- COPD management
- Asthma care plans
- Hyperlipidemia treatment
- Osteoarthritis management
- Chronic kidney disease

### 2. Rehabilitation Treatment Plans

Rehabilitation plans focus on restoring function, improving mobility, and enhancing quality of life through structured therapeutic programs.

#### Core Components

**Functional Assessment**
- Baseline functional status (ADLs, IADLs)
- Range of motion, strength, balance, endurance
- Gait analysis and mobility assessment
- Standardized measures (FIM, Barthel Index, Berg Balance Scale)
- Environmental assessment (home safety, accessibility)

**Rehabilitation Goals**

*Impairment-level goals*:
- Improve shoulder flexion to 140 degrees
- Increase quadriceps strength by 2/5 MMT grades
- Enhance balance (Berg Score >45/56)

*Activity-level goals*:
- Independent ambulation 150 feet with assistive device
- Climb 12 stairs with handrail supervision
- Transfer bed-to-chair independently

*Participation-level goals*:
- Return to work with modifications
- Resume recreational activities
- Independent community mobility

**Therapeutic Interventions**

*Physical Therapy*:
- Therapeutic exercises (strengthening, stretching, endurance)
- Manual therapy techniques
- Gait training and balance activities
- Modalities (heat, ice, electrical stimulation, ultrasound)
- Assistive device training

*Occupational Therapy*:
- ADL training (bathing, dressing, grooming, feeding)
- Upper extremity strengthening and coordination
- Adaptive equipment and modifications
- Energy conservation techniques
- Cognitive rehabilitation

*Speech-Language Pathology*:
- Swallowing therapy and dysphagia management
- Communication strategies and augmentative devices
- Cognitive-linguistic therapy
- Voice therapy

*Other Services*:
- Recreational therapy
- Aquatic therapy
- Cardiac rehabilitation
- Pulmonary rehabilitation
- Vestibular rehabilitation

**Treatment Schedule**
- Frequency: 3x/week PT, 2x/week OT (example)
- Session duration: 45-60 minutes
- Treatment phase durations (acute, subacute, maintenance)
- Expected total duration: 8-12 weeks
- Reassessment intervals

**Progress Monitoring**
- Weekly functional assessments
- Standardized outcome measures
- Goal attainment scaling
- Pain and symptom tracking
- Patient satisfaction

**Home Exercise Program**
- Specific exercises with repetitions/sets/frequency
- Precautions and safety instructions
- Progression criteria
- Self-monitoring strategies

#### Specialty Rehabilitation

- Post-stroke rehabilitation
- Orthopedic rehabilitation (joint replacement, fracture)
- Cardiac rehabilitation (post-MI, post-surgery)
- Pulmonary rehabilitation
- Vestibular rehabilitation
- Neurological rehabilitation
- Sports injury rehabilitation

### 3. Mental Health Treatment Plans

Mental health treatment plans address psychiatric conditions through integrated psychotherapeutic, pharmacological, and psychosocial interventions.

#### Essential Components

**Psychiatric Assessment**
- Primary psychiatric diagnosis (DSM-5 criteria)
- Symptom severity and functional impairment
- Co-occurring mental health conditions
- Substance use assessment
- Suicide/homicide risk assessment
- Trauma history and PTSD screening
- Social determinants of mental health

**Treatment Goals**

*Symptom reduction*:
- Decrease depression severity (PHQ-9 score from 18 to <10)
- Reduce anxiety symptoms (GAD-7 score <5)
- Improve sleep quality (Pittsburgh Sleep Quality Index)
- Stabilize mood (reduced mood episodes)

*Functional improvement*:
- Return to work or school
- Improve social relationships and support
- Enhance coping skills and emotional regulation
- Increase engagement in meaningful activities

*Recovery-oriented goals*:
- Build resilience and self-efficacy
- Develop crisis management skills
- Establish sustainable wellness routines
- Achieve personal recovery goals

**Therapeutic Interventions**

*Psychotherapy*:
- Evidence-based modality (CBT, DBT, ACT, psychodynamic, IPT)
- Session frequency (weekly, biweekly)
- Treatment duration (12-16 weeks, ongoing)
- Specific techniques and targets
- Group therapy participation

*Psychopharmacology*:
- Medication class and rationale
- Starting dose and titration schedule
- Target symptoms
- Expected response timeline (2-4 weeks for antidepressants)
- Side effect monitoring
- Combination therapy considerations

*Psychosocial Interventions*:
- Case management services
- Peer support programs
- Family therapy or psychoeducation
- Vocational rehabilitation
- Supported housing or community integration
- Substance abuse treatment

**Safety Planning**
- Crisis contacts and emergency services
- Warning signs and triggers
- Coping strategies and self-soothing techniques
- Safe environment modifications
- Means restriction (firearms, medications)
- Support system activation

**Monitoring and Assessment**
- Symptom rating scales (weekly or biweekly)
- Medication adherence and side effects
- Suicidal ideation screening
- Functional status assessments
- Treatment engagement and therapeutic alliance

**Patient and Family Education**
- Psychoeducation about diagnosis
- Treatment rationale and expectations
- Medication information
- Relapse prevention strategies
- Community resources

#### Mental Health Conditions

- Major depressive disorder
- Anxiety disorders (GAD, panic, social anxiety)
- Bipolar disorder
- Schizophrenia and psychotic disorders
- PTSD and trauma-related disorders
- Eating disorders
- Substance use disorders
- Personality disorders

### 4. Chronic Disease Management Plans

Comprehensive long-term care plans for chronic conditions requiring ongoing monitoring, treatment adjustments, and multidisciplinary coordination.

#### Key Features

**Disease-Specific Targets**
- Evidence-based treatment goals per guidelines
- Stage-appropriate interventions
- Complication prevention strategies
- Disease progression monitoring

**Self-Management Support**
- Patient activation and engagement
- Shared decision-making
- Action plans for symptom changes
- Technology-enabled monitoring (apps, remote monitoring)

**Care Coordination**
- Primary care physician oversight
- Specialist consultations and co-management
- Care transitions (hospital to home)
- Medication management across providers
- Communication protocols

**Population Health Integration**
- Registry tracking and outreach
- Preventive care and screening schedules
- Quality measure reporting
- Care gaps identification

#### Applicable Conditions

- Type 1 and Type 2 diabetes
- Cardiovascular disease (CHF, CAD)
- Chronic respiratory diseases (COPD, asthma)
- Chronic kidney disease
- Inflammatory bowel disease
- Rheumatoid arthritis and autoimmune conditions
- HIV/AIDS
- Cancer survivorship care

### 5. Perioperative Care Plans

Structured plans for surgical and procedural patients covering preoperative preparation, intraoperative management, and postoperative recovery.

#### Components

**Preoperative Assessment**
- Surgical indication and planned procedure
- Preoperative risk stratification (ASA class, cardiac risk)
- Optimization of medical conditions
- Medication management (continuation, discontinuation)
- Preoperative testing and clearances
- Informed consent and patient education

**Perioperative Interventions**
- Enhanced recovery after surgery (ERAS) protocols
- Venous thromboembolism prophylaxis
- Antibiotic prophylaxis
- Glycemic control strategies
- Pain management plan (multimodal analgesia)

**Postoperative Care**
- Immediate recovery goals (24-48 hours)
- Early mobilization protocols
- Diet advancement
- Wound care and drain management
- Pain control regimen
- Complication monitoring

**Discharge Planning**
- Activity restrictions and progression
- Medication reconciliation
- Follow-up appointments
- Home health or rehabilitation services
- Return-to-work timeline

### 6. Pain Management Plans

Multimodal approaches to acute and chronic pain using evidence-based interventions and opioid-sparing strategies.

#### Comprehensive Components

**Pain Assessment**
- Pain location, quality, intensity (0-10 scale)
- Temporal pattern (constant, intermittent, breakthrough)
- Aggravating and alleviating factors
- Functional impact (sleep, activities, mood)
- Previous treatments and responses
- Psychosocial contributors

**Multimodal Interventions**

*Pharmacological*:
- Non-opioid analgesics (acetaminophen, NSAIDs)
- Adjuvant medications (antidepressants, anticonvulsants, muscle relaxants)
- Topical agents (lidocaine, capsaicin, diclofenac)
- Opioid therapy (when appropriate, with risk mitigation)
- Titration and rotation strategies

*Interventional Procedures*:
- Nerve blocks and injections
- Radiofrequency ablation
- Spinal cord stimulation
- Intrathecal drug delivery

*Non-pharmacological*:
- Physical therapy and exercise
- Cognitive-behavioral therapy for pain
- Mindfulness and relaxation techniques
- Acupuncture
- TENS units

**Opioid Safety (when prescribed)**
- Indication and planned duration
- Prescription drug monitoring program (PDMP) check
- Opioid risk assessment tools
- Naloxone prescription
- Treatment agreements
- Random urine drug screening
- Frequent follow-up and reassessment

**Functional Goals**
- Specific activity improvements
- Sleep quality enhancement
- Reduced pain interference
- Improved quality of life
- Return to work or meaningful activities

## Best Practices

### Brevity and Focus (HIGHEST PRIORITY)

**Treatment plans MUST be concise and focused on actionable clinical information:**

- **1-page format is PREFERRED**: For most clinical scenarios, a single-page treatment plan (like precision oncology reports) provides all necessary information
- **Default to shortest format possible**: Start with 1-page; only expand if clinical complexity genuinely requires it
- **Every sentence must add value**: If a section doesn't change clinical decision-making, omit it entirely
- **Think "quick reference card" not "comprehensive textbook"**: Busy clinicians need scannable, dense information
- **Avoid academic verbosity**: This is clinical documentation, not a literature review or teaching document
- **Maximum lengths by complexity**:
  - Simple/standard cases: 1 page
  - Moderate complexity: 3-4 pages (first-page summary + details)
  - High complexity (rare): 5-6 pages maximum

### First Page Summary (Most Important)

**ALWAYS create a one-page executive summary as the first page:**
- The first page must contain ONLY: Title, Report Info Box, and Key Findings boxes
- This provides an at-a-glance overview similar to precision medicine reports
- Table of contents and detailed sections start on page 2 or later
- Think of it as a "clinical highlights" page that a busy clinician can scan in 30 seconds
- Use 2-4 colored boxes for different key findings (goals, interventions, decision points)
- **A strong first page can often stand alone** - subsequent pages are for details, not repetition

### SMART Goal Setting

All treatment goals should meet SMART criteria:

- **Specific**: "Improve HbA1c to <7%" not "Better diabetes control"
- **Measurable**: Use quantifiable metrics, validated scales, objective measures
- **Achievable**: Consider patient capabilities, resources, social support
- **Relevant**: Align with patient values, priorities, and life circumstances
- **Time-bound**: Define clear timeframes for goal achievement and reassessment

### Patient-Centered Care

✓ **Shared Decision-Making**: Involve patients in goal-setting and treatment choices  
✓ **Cultural Competence**: Respect cultural beliefs, language preferences, health literacy  
✓ **Patient Preferences**: Honor treatment preferences and personal values  
✓ **Individualization**: Tailor plans to patient's unique circumstances  
✓ **Empowerment**: Support patient activation and self-management  

### Evidence-Based Practice

✓ **Clinical Guidelines**: Follow current specialty society recommendations  
✓ **Quality Measures**: Incorporate HEDIS, CMS quality measures  
✓ **Comparative Effectiveness**: Use treatments with proven efficacy  
✓ **Avoid Low-Value Care**: Eliminate unnecessary tests and interventions  
✓ **Stay Current**: Update plans based on emerging evidence  

### Documentation Standards

✓ **Completeness**: Include all required elements  
✓ **Clarity**: Use clear, professional medical language  
✓ **Accuracy**: Ensure factual correctness and current information  
✓ **Timeliness**: Document plans promptly  
✓ **Legibility**: Professional formatting and organization  
✓ **Signature and Date**: Authenticate all treatment plans  

### Regulatory Compliance

✓ **HIPAA Privacy**: De-identify all protected health information  
✓ **Informed Consent**: Document patient understanding and agreement  
✓ **Billing Support**: Include documentation to support medical necessity  
✓ **Quality Reporting**: Enable extraction of quality metrics  
✓ **Legal Protection**: Maintain defensible clinical documentation  

### Multidisciplinary Coordination

✓ **Team Communication**: Share plans across care team  
✓ **Role Clarity**: Define responsibilities for each team member  
✓ **Care Transitions**: Ensure continuity across settings  
✓ **Specialist Integration**: Coordinate with subspecialty care  
✓ **Patient-Centered Medical Home**: Align with PCMH principles  

## LaTeX Template Usage

### Template Selection

Choose the appropriate template based on clinical context and desired length:

#### Concise Templates (PREFERRED)

1. **one_page_treatment_plan.tex** - **FIRST CHOICE** for most cases
   - All clinical specialties
   - Standard protocols and straightforward cases
   - Quick-reference format similar to precision oncology reports
   - Dense, scannable, clinician-focused
   - Use this unless complexity demands more detail

#### Standard Templates (3-4 pages)

Use only when one-page format is insufficient due to complexity:

2. **general_medical_treatment_plan.tex** - Primary care, chronic disease, general medicine
3. **rehabilitation_treatment_plan.tex** - PT/OT, post-surgery, injury recovery
4. **mental_health_treatment_plan.tex** - Psychiatric conditions, behavioral health
5. **chronic_disease_management_plan.tex** - Complex chronic diseases, multiple conditions
6. **perioperative_care_plan.tex** - Surgical patients, procedural care
7. **pain_management_plan.tex** - Acute or chronic pain conditions

**Note**: Even when using standard templates, adapt them to be concise (3-4 pages max) by removing non-essential sections.

### Template Structure

All LaTeX templates include:
- Professional formatting with appropriate margins and fonts
- Structured sections for all required components
- Tables for medications, interventions, timelines
- Goal-tracking sections with SMART criteria
- Space for provider signatures and dates
- HIPAA-compliant de-identification guidance
- Comments with detailed instructions

### Generating PDFs

```bash
# Compile LaTeX template to PDF
pdflatex general_medical_treatment_plan.tex

# For templates with references
pdflatex treatment_plan.tex
bibtex treatment_plan
pdflatex treatment_plan.tex
pdflatex treatment_plan.tex
```

## Validation and Quality Assurance

### Completeness Checking

Use validation scripts to ensure all required sections are present:

```bash
python check_completeness.py my_treatment_plan.tex
```

The script checks for:
- Patient information section
- Diagnosis and assessment
- SMART goals (short-term and long-term)
- Interventions (pharmacological, non-pharmacological)
- Timeline and schedule
- Monitoring parameters
- Expected outcomes
- Follow-up plan
- Patient education
- Risk mitigation

### Treatment Plan Validation

Comprehensive validation of treatment plan quality:

```bash
python validate_treatment_plan.py my_treatment_plan.tex
```

Validation includes:
- SMART goal criteria assessment
- Evidence-based intervention verification
- Timeline feasibility check
- Monitoring parameter adequacy
- Safety and risk mitigation review
- Regulatory compliance check

### Quality Checklist

Review treatment plans against the quality checklist (`quality_checklist.md`):

**Clinical Quality**
- [ ] Diagnosis is accurate and properly coded (ICD-10)
- [ ] Goals are SMART and patient-centered
- [ ] Interventions are evidence-based and guideline-concordant
- [ ] Timeline is realistic and clearly defined
- [ ] Monitoring plan is comprehensive
- [ ] Safety considerations are addressed

**Patient-Centered Care**
- [ ] Patient preferences and values incorporated
- [ ] Shared decision-making documented
- [ ] Health literacy appropriate language
- [ ] Cultural considerations addressed
- [ ] Patient education plan included

**Regulatory Compliance**
- [ ] HIPAA-compliant de-identification
- [ ] Medical necessity documented
- [ ] Informed consent noted
- [ ] Provider signature and credentials
- [ ] Date of plan creation/revision

**Coordination and Communication**
- [ ] Specialist referrals documented
- [ ] Care team roles defined
- [ ] Follow-up schedule clear
- [ ] Emergency contacts provided
- [ ] Transition planning addressed

## Integration with Other Skills

### Clinical Reports Integration

Treatment plans often accompany other clinical documentation:

- **SOAP Notes** (`clinical-reports` skill): Document ongoing implementation
- **H&P** (`clinical-reports` skill): Initial assessment informs treatment plan
- **Discharge Summaries** (`clinical-reports` skill): Summarize treatment plan execution
- **Progress Notes**: Track goal achievement and plan modifications

### Scientific Writing Integration

Evidence-based treatment planning requires literature support:

- **Citation Management** (`citation-management` skill): Reference clinical guidelines
- **Literature Review** (`literature-review` skill): Understand treatment evidence base
- **Research Lookup** (`research-lookup` skill): Find current best practices

### Research Integration

Treatment plans may be developed for clinical trials or research studies:

- **Research Grants** (`research-grants` skill): Treatment protocols for funded studies
- **Clinical Trial Reports** (`clinical-reports` skill): Intervention documentation

## Common Use Cases

### Example 1: Type 2 Diabetes Management

**Scenario**: 58-year-old patient with newly diagnosed Type 2 diabetes, HbA1c 8.5%, BMI 32

**Template**: `general_medical_treatment_plan.tex`

**Goals**:
- Short-term: Reduce HbA1c to <7.5% in 3 months
- Long-term: Achieve HbA1c <7%, lose 15 pounds in 6 months

**Interventions**:
- Pharmacological: Metformin 500mg BID, titrate to 1000mg BID
- Lifestyle: Mediterranean diet, 150 min/week moderate exercise
- Education: Diabetes self-management education, glucose monitoring

### Example 2: Post-Stroke Rehabilitation

**Scenario**: 70-year-old patient s/p left MCA stroke with right hemiparesis

**Template**: `rehabilitation_treatment_plan.tex`

**Goals**:
- Short-term: Improve right arm strength 2/5 to 3/5 in 4 weeks
- Long-term: Independent ambulation 150 feet with cane in 12 weeks

**Interventions**:
- PT 3x/week: Gait training, balance, strengthening
- OT 3x/week: ADL training, upper extremity function
- SLP 2x/week: Dysphagia therapy

### Example 3: Major Depressive Disorder

**Scenario**: 35-year-old with moderate depression, PHQ-9 score 16

**Template**: `mental_health_treatment_plan.tex`

**Goals**:
- Short-term: Reduce PHQ-9 to <10 in 8 weeks
- Long-term: Achieve remission (PHQ-9 <5), return to work

**Interventions**:
- Psychotherapy: CBT weekly sessions
- Medication: Sertraline 50mg daily, titrate to 100mg
- Lifestyle: Sleep hygiene, exercise 30 min 5x/week

### Example 4: Total Knee Arthroplasty

**Scenario**: 68-year-old scheduled for right TKA for osteoarthritis

**Template**: `perioperative_care_plan.tex`

**Preoperative Goals**:
- Optimize diabetes control (glucose <180)
- Discontinue anticoagulation per protocol
- Complete medical clearance

**Postoperative Goals**:
- Ambulate 50 feet by POD 1
- 90-degree knee flexion by POD 3
- Discharge home with PT services by POD 2-3

### Example 5: Chronic Low Back Pain

**Scenario**: 45-year-old with chronic non-specific low back pain, pain 7/10

**Template**: `pain_management_plan.tex`

**Goals**:
- Short-term: Reduce pain to 4/10 in 6 weeks
- Long-term: Return to work full-time, pain 2-3/10

**Interventions**:
- Pharmacological: Gabapentin 300mg TID, duloxetine 60mg daily
- PT: Core strengthening, McKenzie exercises 2x/week x 8 weeks
- Behavioral: CBT for pain, mindfulness meditation
- Interventional: Consider lumbar ESI if inadequate response

## Professional Standards and Guidelines

Treatment plans should align with:

### General Medicine
- American Diabetes Association (ADA) Standards of Care
- ACC/AHA Cardiovascular Guidelines
- GOLD COPD Guidelines
- JNC-8 Hypertension Guidelines
- KDIGO Chronic Kidney Disease Guidelines

### Rehabilitation
- APTA Clinical Practice Guidelines
- AOTA Practice Guidelines
- Cardiac Rehabilitation Guidelines (AHA/AACVPR)
- Stroke Rehabilitation Guidelines

### Mental Health
- APA Practice Guidelines
- VA/DoD Clinical Practice Guidelines
- NICE Guidelines (National Institute for Health and Care Excellence)
- Cochrane Reviews for psychiatric interventions

### Pain Management
- CDC Opioid Prescribing Guidelines
- AAPM/APS Chronic Pain Guidelines
- WHO Pain Ladder
- Multimodal Analgesia Best Practices

## Timeline Generation

Use the timeline generator script to create visual treatment timelines:

```bash
python timeline_generator.py --plan my_treatment_plan.tex --output timeline.pdf
```

Generates:
- Gantt chart of treatment phases
- Milestone markers for goal assessments
- Medication titration schedules
- Follow-up appointment calendar
- Intervention intensity over time

## Support and Resources

### Template Generation

Interactive template selection:

```bash
cd .claude/skills/treatment-plans/scripts
python generate_template.py

# Or specify type directly
python generate_template.py --type mental_health --output depression_treatment_plan.tex
```

### Validation Workflow

1. **Create treatment plan** using appropriate LaTeX template
2. **Check completeness**: `python check_completeness.py plan.tex`
3. **Validate quality**: `python validate_treatment_plan.py plan.tex`
4. **Review checklist**: Compare against `quality_checklist.md`
5. **Generate PDF**: `pdflatex plan.tex`
6. **Review with patient**: Ensure understanding and agreement
7. **Implement and document**: Track progress in clinical notes

### Additional Resources

- Clinical practice guidelines from specialty societies
- AHRQ Effective Health Care Program
- Cochrane Library for intervention evidence
- UpToDate and DynaMed for treatment recommendations
- CMS Quality Measures and HEDIS specifications

## Professional Document Styling

### Overview

Treatment plans can be enhanced with professional medical document styling using the `medical_treatment_plan.sty` LaTeX package. This custom style transforms plain academic documents into visually appealing, color-coded clinical documents that maintain scientific rigor while improving readability and usability.

### Medical Treatment Plan Style Package

The `medical_treatment_plan.sty` package (located in `assets/medical_treatment_plan.sty`) provides:

**Professional Color Scheme**
- **Primary Blue** (RGB: 0, 102, 153): Headers, section titles, primary accents
- **Secondary Blue** (RGB: 102, 178, 204): Light backgrounds, subtle accents
- **Accent Blue** (RGB: 0, 153, 204): Hyperlinks, key highlights
- **Success Green** (RGB: 0, 153, 76): Goals, positive outcomes
- **Warning Red** (RGB: 204, 0, 0): Warnings, critical information
- **Dark Gray** (RGB: 64, 64, 64): Body text
- **Light Gray** (RGB: 245, 245, 245): Background fills

**Styled Elements**
- Custom colored headers and footers with professional rules
- Blue section titles with underlines for clear hierarchy
- Enhanced table formatting with colored headers and alternating rows
- Optimized list spacing with colored bullets and numbering
- Professional page layout with appropriate margins

### Custom Information Boxes

The style package includes five specialized box environments for organizing clinical information:

#### 1. Info Box (Blue Border, Light Gray Background)

For general information, clinical assessments, and testing schedules:

```latex
\begin{infobox}[Title]
  \textbf{Key Information:}
  \begin{itemize}
    \item Clinical assessment details
    \item Testing schedules
    \item General guidance
  \end{itemize}
\end{infobox}
```

**Use cases**: Metabolic status, baseline assessments, monitoring schedules, titration protocols

#### 2. Warning Box (Red Border, Yellow Background)

For critical decision points, safety protocols, and alerts:

```latex
\begin{warningbox}[Alert Title]
  \textbf{Important Safety Information:}
  \begin{itemize}
    \item Critical drug interactions
    \item Safety monitoring requirements
    \item Red flag symptoms requiring immediate action
  \end{itemize}
\end{warningbox}
```

**Use cases**: Medication safety, decision points, contraindications, emergency protocols

#### 3. Goal Box (Green Border, Green-Tinted Background)

For treatment goals, targets, and success criteria:

```latex
\begin{goalbox}[Treatment Goals]
  \textbf{Primary Objectives:}
  \begin{itemize}
    \item Reduce HbA1c to <7\% within 3 months
    \item Achieve 5-7\% weight loss in 12 weeks
    \item Complete diabetes education program
  \end{itemize}
\end{goalbox}
```

**Use cases**: SMART goals, target outcomes, success metrics, CGM goals

#### 4. Key Points Box (Blue Background)

For executive summaries, key takeaways, and important recommendations:

```latex
\begin{keybox}[Key Highlights]
  \textbf{Essential Points:}
  \begin{itemize}
    \item Main therapeutic approach
    \item Critical patient instructions
    \item Priority interventions
  \end{itemize}
\end{keybox}
```

**Use cases**: Plan overview, plate method instructions, important dietary guidelines

#### 5. Emergency Box (Large Red Design)

For emergency contacts and urgent protocols:

```latex
\begin{emergencybox}
  \begin{itemize}
    \item \textbf{Emergency Services:} 911
    \item \textbf{Endocrinology Office:} [Phone] (business hours)
    \item \textbf{After-Hours Hotline:} [Phone] (nights/weekends)
    \item \textbf{Pharmacy:} [Phone and location]
  \end{itemize}
\end{emergencybox}
```

**Use cases**: Emergency contacts, critical hotlines, urgent resource information

#### 6. Patient Info Box (White with Blue Border)

For patient demographics and baseline information:

```latex
\begin{patientinfo}
  \begin{tabular}{ll}
    \textbf{Age:} & 23 years \\
    \textbf{Sex:} & Male \\
    \textbf{Diagnosis:} & Type 2 Diabetes Mellitus \\
    \textbf{Plan Start Date:} & \today \\
  \end{tabular}
\end{patientinfo}
```

**Use cases**: Patient information sections, demographic data

### Professional Table Formatting

Enhanced table environment with medical styling:

```latex
\begin{medtable}{Caption Text}
\begin{tabular}{|p{5cm}|p{4cm}|p{4.5cm}|}
\hline
\tableheadercolor  % Blue header with white text
\textcolor{white}{\textbf{Column 1}} & 
\textcolor{white}{\textbf{Column 2}} & 
\textcolor{white}{\textbf{Column 3}} \\
\hline
Data row 1 content & Value 1 & Details 1 \\
\hline
\tablerowcolor  % Alternating light gray row
Data row 2 content & Value 2 & Details 2 \\
\hline
Data row 3 content & Value 3 & Details 3 \\
\hline
\end{tabular}
\caption{Table caption}
\end{medtable}
```

**Features:**
- Blue headers with white text for visual prominence
- Alternating row colors (`\tablerowcolor`) for improved readability
- Automatic centering and spacing
- Professional borders and padding

### Using the Style Package

#### Basic Setup

1. **Add to document preamble:**

```latex
% !TEX program = xelatex
\documentclass[11pt,letterpaper]{article}

% Use custom medical treatment plan style
\usepackage{medical_treatment_plan}
\usepackage{natbib}

\begin{document}
\maketitle
% Your content here
\end{document}
```

2. **Ensure style file is in same directory** as your `.tex` file, or install to LaTeX path

3. **Compile with XeLaTeX** (recommended for best results):

```bash
xelatex treatment_plan.tex
bibtex treatment_plan
xelatex treatment_plan.tex
xelatex treatment_plan.tex
```

#### Custom Title Page

The package automatically formats the title with a professional blue header:

```latex
\title{\textbf{Individualized Diabetes Treatment Plan}\\
\large{23-Year-Old Male Patient with Type 2 Diabetes}}
\author{Comprehensive Care Plan}
\date{\today}

\begin{document}
\maketitle
```

This creates an eye-catching blue box with white text and clear hierarchy.

### Compilation Requirements

**Required LaTeX Packages** (automatically loaded by the style):
- `geometry` - Page layout and margins
- `xcolor` - Color support
- `tcolorbox` with `[most]` library - Custom colored boxes
- `tikz` - Graphics and drawing
- `fontspec` - Font management (XeLaTeX/LuaLaTeX)
- `fancyhdr` - Custom headers and footers
- `titlesec` - Section styling
- `enumitem` - Enhanced list formatting
- `booktabs` - Professional table rules
- `longtable` - Multi-page tables
- `array` - Enhanced table features
- `colortbl` - Colored table cells
- `hyperref` - Hyperlinks and PDF metadata
- `natbib` - Bibliography management

**Recommended Compilation:**

```bash
# Using XeLaTeX (best font support)
xelatex document.tex
bibtex document
xelatex document.tex
xelatex document.tex

# Using PDFLaTeX (alternative)
pdflatex document.tex
bibtex document
pdflatex document.tex
pdflatex document.tex
```

### Customization Options

#### Changing Colors

Edit the style file to modify the color scheme:

```latex
% In medical_treatment_plan.sty
\definecolor{primaryblue}{RGB}{0, 102, 153}      % Modify these
\definecolor{secondaryblue}{RGB}{102, 178, 204}
\definecolor{accentblue}{RGB}{0, 153, 204}
\definecolor{successgreen}{RGB}{0, 153, 76}
\definecolor{warningred}{RGB}{204, 0, 0}
```

#### Adjusting Page Layout

Modify geometry settings in the style file:

```latex
\RequirePackage[margin=1in, top=1.2in, bottom=1.2in]{geometry}
```

#### Custom Fonts (XeLaTeX only)

Uncomment and modify in the style file:

```latex
\setmainfont{Your Preferred Font}
\setsansfont{Your Sans-Serif Font}
```

#### Header/Footer Customization

Modify in the style file:

```latex
\fancyhead[L]{\color{primaryblue}\sffamily\small\textbf{Treatment Plan Title}}
\fancyhead[R]{\color{darkgray}\sffamily\small Patient Info}
```

### Style Package Download and Installation

#### Option 1: Copy to Project Directory

Copy `assets/medical_treatment_plan.sty` to the same directory as your `.tex` file.

#### Option 2: Install to User TeX Directory

```bash
# Find your local texmf directory
kpsewhich -var-value TEXMFHOME

# Copy to appropriate location (usually ~/texmf/tex/latex/)
mkdir -p ~/texmf/tex/latex/medical_treatment_plan
cp assets/medical_treatment_plan.sty ~/texmf/tex/latex/medical_treatment_plan/

# Update TeX file database
texhash ~/texmf
```

#### Option 3: System-Wide Installation

```bash
# Copy to system texmf directory (requires sudo)
sudo cp assets/medical_treatment_plan.sty /usr/local/texlive/texmf-local/tex/latex/
sudo texhash
```

### Additional Professional Styles (Optional)

Other medical/clinical document styles available from CTAN:

**Journal Styles:**
```bash
# Install via TeX Live Manager
tlmgr install nejm        # New England Journal of Medicine
tlmgr install jama        # JAMA style
tlmgr install bmj         # British Medical Journal
```

**General Professional Styles:**
```bash
tlmgr install apa7        # APA 7th edition (health sciences)
tlmgr install IEEEtran    # IEEE (medical devices/engineering)
tlmgr install springer    # Springer journals
```

**Download from CTAN:**
- Visit: https://ctan.org/
- Search for medical document classes
- Download and install per package instructions

### Troubleshooting

**Issue: Package not found**
```bash
# Install missing packages via TeX Live Manager
sudo tlmgr update --self
sudo tlmgr install tcolorbox tikz pgf
```

**Issue: Missing characters (✓, ≥, etc.)**
- Use XeLaTeX instead of PDFLaTeX
- Or replace with LaTeX commands: `$\checkmark$`, `$\geq$`
- Requires `amssymb` package for math symbols

**Issue: Header height warnings**
- Style file sets `\setlength{\headheight}{22pt}`
- Adjust if needed for your content

**Issue: Boxes not rendering**
```bash
# Ensure complete tcolorbox installation
sudo tlmgr install tcolorbox tikz pgf
```

**Issue: Font not found (XeLaTeX)**
- Comment out custom font lines in .sty file
- Or install specified fonts on your system

### Best Practices for Styled Documents

1. **Appropriate Box Usage**
   - Match box type to content purpose (goals→green, warnings→yellow/red)
   - Don't overuse boxes; reserve for truly important information
   - Keep box content concise and focused

2. **Visual Hierarchy**
   - Use section styling for structure
   - Boxes for emphasis and organization
   - Tables for comparative data
   - Lists for sequential or grouped items

3. **Color Consistency**
   - Stick to defined color scheme
   - Use `\textcolor{primaryblue}{\textbf{Text}}` for emphasis
   - Maintain consistent meaning (red=warning, green=goals)

4. **White Space**
   - Don't overcrowd pages with boxes
   - Use `\vspace{0.5cm}` between major sections
   - Allow breathing room around colored elements

5. **Professional Appearance**
   - Maintain readability as top priority
   - Ensure sufficient contrast for accessibility
   - Test print output in grayscale
   - Keep styling consistent throughout document

6. **Table Formatting**
   - Use `\tableheadercolor` for all header rows
   - Apply `\tablerowcolor` to alternating rows in tables >3 rows
   - Keep column widths balanced
   - Use `\small\sffamily` for large tables

### Example: Styled Treatment Plan Structure

```latex
% !TEX program = xelatex
\documentclass[11pt,letterpaper]{article}
\usepackage{medical_treatment_plan}
\usepackage{natbib}

\title{\textbf{Comprehensive Treatment Plan}\\
\large{Patient-Centered Care Strategy}}
\author{Multidisciplinary Care Team}
\date{\today}

\begin{document}
\maketitle

\section*{Patient Information}
\begin{patientinfo}
  % Demographics table
\end{patientinfo}

\section{Executive Summary}
\begin{keybox}[Plan Overview]
  % Key highlights
\end{keybox}

\section{Treatment Goals}
\begin{goalbox}[SMART Goals - 3 Months]
  \begin{medtable}{Primary Treatment Targets}
    % Goals table with colored headers
  \end{medtable}
\end{goalbox}

\section{Medication Plan}
\begin{infobox}[Titration Schedule]
  % Medication instructions
\end{infobox}

\begin{warningbox}[Critical Decision Point]
  % Important safety information
\end{warningbox}

\section{Emergency Protocols}
\begin{emergencybox}
  % Emergency contacts
\end{emergencybox}

\bibliographystyle{plainnat}
\bibliography{references}
\end{document}
```

### Benefits of Professional Styling

**Clinical Practice:**
- Faster information scanning during patient encounters
- Clear visual hierarchy for critical vs. routine information
- Professional appearance suitable for patient-facing documents
- Color-coded sections reduce cognitive load

**Educational Use:**
- Enhanced readability for teaching materials
- Visual differentiation of concept types (goals, warnings, procedures)
- Professional presentation for case discussions
- Print and digital-ready formats

**Documentation Quality:**
- Modern, polished appearance
- Maintains clinical accuracy while improving aesthetics
- Standardized formatting across treatment plans
- Easy to customize for institutional branding

**Patient Engagement:**
- More approachable than dense text documents
- Color coding helps patients identify key sections
- Professional appearance builds trust
- Clear organization facilitates understanding

## Ethical Considerations

### Informed Consent
All treatment plans should involve patient understanding and voluntary agreement to proposed interventions.

### Cultural Sensitivity
Treatment plans must respect diverse cultural beliefs, health practices, and communication styles.

### Health Equity
Consider social determinants of health, access barriers, and health disparities when developing plans.

### Privacy Protection
Maintain strict HIPAA compliance; de-identify all protected health information in shared documents.

### Autonomy and Beneficence
Balance medical recommendations with patient autonomy and values while promoting patient welfare.

## License

Part of the Claude Scientific Writer project. See main LICENSE file.


