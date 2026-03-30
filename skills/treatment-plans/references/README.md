# Treatment Plans Skill

## Overview

Skill for generating **concise, clinician-focused** medical treatment plans across all clinical specialties. Provides LaTeX/PDF templates with SMART goal frameworks, evidence-based interventions, regulatory compliance, and validation tools for patient-centered care planning.

**Default to 1-page format** for most cases - think "quick reference card" not "comprehensive textbook".

## What's Included

### 📋 Seven Treatment Plan Types

1. **One-Page Treatment Plan** (PREFERRED) - Concise, quick-reference format for most clinical scenarios
2. **General Medical Treatment Plans** - Primary care, chronic diseases (diabetes, hypertension, heart failure)
3. **Rehabilitation Treatment Plans** - Physical therapy, occupational therapy, cardiac/pulmonary rehab
4. **Mental Health Treatment Plans** - Psychiatric care, depression, anxiety, PTSD, substance use
5. **Chronic Disease Management Plans** - Complex multimorbidity, long-term care coordination
6. **Perioperative Care Plans** - Preoperative optimization, ERAS protocols, postoperative recovery
7. **Pain Management Plans** - Acute and chronic pain, multimodal analgesia, opioid-sparing strategies

### 📚 Reference Files (5 comprehensive guides)

- `treatment_plan_standards.md` - Professional standards, documentation requirements, legal considerations
- `goal_setting_frameworks.md` - SMART goals, patient-centered outcomes, shared decision-making
- `intervention_guidelines.md` - Evidence-based treatments, pharmacological and non-pharmacological
- `regulatory_compliance.md` - HIPAA compliance, billing documentation, quality measures
- `specialty_specific_guidelines.md` - Detailed guidelines for each treatment plan type

### 📄 LaTeX Templates (7 professional templates)

- `one_page_treatment_plan.tex` - **FIRST CHOICE** - Dense, scannable 1-page format (like precision oncology reports)
- `general_medical_treatment_plan.tex` - Comprehensive medical care planning
- `rehabilitation_treatment_plan.tex` - Functional restoration and therapy
- `mental_health_treatment_plan.tex` - Psychiatric and behavioral health
- `chronic_disease_management_plan.tex` - Long-term disease management
- `perioperative_care_plan.tex` - Surgical and procedural care
- `pain_management_plan.tex` - Multimodal pain treatment

### 🔧 Validation Scripts (4 automation tools)

- `generate_template.py` - Interactive template selection and generation
- `validate_treatment_plan.py` - Comprehensive quality and compliance checking
- `check_completeness.py` - Verify all required sections present
- `timeline_generator.py` - Create visual treatment timelines and schedules

## Quick Start

### Generate a Treatment Plan Template

```bash
cd .claude/skills/treatment-plans/scripts
python generate_template.py

# Or specify type directly
python generate_template.py --type general_medical --output diabetes_plan.tex
```

Available template types:
- `one_page` (PREFERRED - use for most cases)
- `general_medical`
- `rehabilitation`
- `mental_health`
- `chronic_disease`
- `perioperative`
- `pain_management`

### Compile to PDF

```bash
cd /path/to/your/treatment/plan
pdflatex my_treatment_plan.tex
```

### Validate Your Treatment Plan

```bash
# Check for completeness
python check_completeness.py my_treatment_plan.tex

# Comprehensive validation
python validate_treatment_plan.py my_treatment_plan.tex
```

### Generate Treatment Timeline

```bash
python timeline_generator.py --plan my_treatment_plan.tex --output timeline.pdf
```

## Standard Treatment Plan Components

All templates include these essential sections:

### 1. Patient Information (De-identified)
- Demographics and relevant medical background
- Active conditions and comorbidities
- Current medications and allergies
- Functional status baseline
- HIPAA-compliant de-identification

### 2. Diagnosis and Assessment Summary
- Primary diagnosis (ICD-10 coded)
- Secondary diagnoses
- Severity classification
- Functional limitations
- Risk stratification

### 3. Treatment Goals (SMART Format)

**Short-term goals** (1-3 months):
- Specific, measurable outcomes
- Realistic targets with defined timeframes
- Patient-centered priorities

**Long-term goals** (6-12 months):
- Disease control targets
- Functional improvement objectives
- Quality of life enhancement
- Complication prevention

### 4. Interventions

- **Pharmacological**: Medications with dosages, frequencies, monitoring
- **Non-pharmacological**: Lifestyle modifications, behavioral interventions, education
- **Procedural**: Planned procedures, specialist referrals, diagnostic testing

### 5. Timeline and Schedule
- Treatment phases with timeframes
- Appointment frequency
- Milestone assessments
- Expected treatment duration

### 6. Monitoring Parameters
- Clinical outcomes to track
- Assessment tools and scales
- Monitoring frequency
- Intervention thresholds

### 7. Expected Outcomes
- Primary outcome measures
- Success criteria
- Timeline for improvement
- Long-term prognosis

### 8. Follow-up Plan
- Scheduled appointments
- Communication protocols
- Emergency procedures
- Transition planning

### 9. Patient Education
- Condition understanding
- Self-management skills
- Warning signs
- Resources and support

### 10. Risk Mitigation
- Adverse effect management
- Safety monitoring
- Emergency action plans
- Fall/infection prevention

## Common Use Cases

### 1. Type 2 Diabetes Management

```
Goal: Create comprehensive treatment plan for newly diagnosed diabetes

Template: general_medical_treatment_plan.tex

Key Components:
- SMART goals: HbA1c <7% in 3 months, weight loss 10 lbs in 6 months
- Medications: Metformin titration schedule
- Lifestyle: Diet, exercise, glucose monitoring
- Monitoring: HbA1c every 3 months, quarterly visits
- Education: Diabetes self-management education
```

### 2. Post-Stroke Rehabilitation

```
Goal: Develop rehab plan for stroke patient with hemiparesis

Template: rehabilitation_treatment_plan.tex

Key Components:
- Functional assessment: FIM scores, ROM, strength testing
- PT goals: Ambulation 150 feet with cane in 12 weeks
- OT goals: Independent ADLs, upper extremity function
- Treatment schedule: PT/OT/SLP 3x week each
- Home exercise program
```

### 3. Major Depressive Disorder

```
Goal: Create integrated treatment plan for depression

Template: mental_health_treatment_plan.tex

Key Components:
- Assessment: PHQ-9 score 16 (moderate depression)
- Goals: Reduce PHQ-9 to <5, return to work in 12 weeks
- Psychotherapy: CBT weekly sessions
- Medication: SSRI with titration schedule
- Safety planning: Crisis contacts, warning signs
```

### 4. Total Knee Replacement

```
Goal: Perioperative care plan for elective TKA

Template: perioperative_care_plan.tex

Key Components:
- Preop optimization: Medical clearance, medication management
- ERAS protocol implementation
- Postop milestones: Ambulation POD 1, discharge POD 2-3
- Pain management: Multimodal analgesia
- Rehab plan: PT starting POD 0
```

### 5. Chronic Low Back Pain

```
Goal: Multimodal pain management plan

Template: pain_management_plan.tex

Key Components:
- Pain assessment: Location, intensity, functional impact
- Goals: Reduce pain 7/10 to 3/10, return to work
- Medications: Non-opioid analgesics, adjuvants
- PT: Core strengthening, McKenzie exercises
- Behavioral: CBT for pain, mindfulness
- Interventional: Consider ESI if inadequate response
```

## SMART Goals Framework

All treatment plans use SMART criteria for goal-setting:

- **Specific**: Clear, well-defined outcome (not vague)
- **Measurable**: Quantifiable metrics or observable behaviors
- **Achievable**: Realistic given patient capabilities and resources
- **Relevant**: Aligned with patient priorities and values
- **Time-bound**: Specific timeframe for achievement

### Examples

**Good SMART Goals**:
- Reduce HbA1c from 8.5% to <7% within 3 months
- Walk independently 150 feet with assistive device by 8 weeks
- Decrease PHQ-9 depression score from 18 to <10 in 8 weeks
- Achieve knee flexion >90 degrees by postoperative day 14
- Reduce pain from 7/10 to ≤4/10 within 6 weeks

**Poor Goals** (not SMART):
- "Feel better" (not specific or measurable)
- "Improve diabetes" (not specific or time-bound)
- "Get stronger" (not measurable)
- "Return to normal" (vague, not specific)

## Workflow Examples

### Standard Treatment Plan Workflow

1. **Assess patient** - Complete history, physical, diagnostic testing
2. **Select template** - Choose appropriate template for clinical context
3. **Generate template** - `python generate_template.py --type [type]`
4. **Customize plan** - Fill in patient-specific information (de-identified)
5. **Set SMART goals** - Define measurable short and long-term goals
6. **Specify interventions** - Evidence-based pharmacological and non-pharmacological
7. **Create timeline** - Schedule appointments, milestones, reassessments
8. **Define monitoring** - Outcome measures, assessment frequency
9. **Validate completeness** - `python check_completeness.py plan.tex`
10. **Quality check** - `python validate_treatment_plan.py plan.tex`
11. **Review quality checklist** - Compare to `quality_checklist.md`
12. **Generate PDF** - `pdflatex plan.tex`
13. **Review with patient** - Shared decision-making, confirm understanding
14. **Implement and document** - Execute plan, track progress in clinical notes
15. **Reassess and modify** - Adjust plan based on outcomes

### Multidisciplinary Care Plan Workflow

1. **Identify team members** - PCP, specialists, therapists, case manager
2. **Create base plan** - Generate template for primary condition
3. **Add specialty sections** - Integrate consultant recommendations
4. **Coordinate goals** - Ensure alignment across disciplines
5. **Define communication** - Team meeting schedule, documentation sharing
6. **Assign responsibilities** - Clarify who manages each intervention
7. **Create care timeline** - Coordinate appointments across providers
8. **Share plan** - Distribute to all team members and patient
9. **Track collectively** - Shared monitoring and outcome tracking
10. **Regular team review** - Adjust plan collaboratively

## Best Practices

### Patient-Centered Care
✓ Involve patients in goal-setting and decision-making  
✓ Respect cultural beliefs and language preferences  
✓ Address health literacy with appropriate language  
✓ Align plan with patient values and life circumstances  
✓ Support patient activation and self-management  

### Evidence-Based Practice
✓ Follow current clinical practice guidelines  
✓ Use interventions with proven efficacy  
✓ Incorporate quality measures (HEDIS, CMS)  
✓ Avoid low-value or ineffective interventions  
✓ Update plans based on emerging evidence  

### Regulatory Compliance
✓ De-identify per HIPAA Safe Harbor method (18 identifiers)  
✓ Document medical necessity for billing support  
✓ Include informed consent documentation  
✓ Sign and date all treatment plans  
✓ Maintain professional documentation standards  

### Quality Documentation
✓ Complete all required sections  
✓ Use clear, professional medical language  
✓ Include specific, measurable goals  
✓ Specify exact medications (dose, route, frequency)  
✓ Define monitoring parameters and frequency  
✓ Address safety and risk mitigation  

### Care Coordination
✓ Communicate plan to entire care team  
✓ Define roles and responsibilities  
✓ Coordinate across care settings  
✓ Integrate specialist recommendations  
✓ Plan for care transitions  

## Integration with Other Skills

### Clinical Reports
- **SOAP Notes**: Document treatment plan implementation and progress
- **H&P Documents**: Initial assessment informs treatment planning
- **Discharge Summaries**: Summarize treatment plan execution
- **Progress Notes**: Track goal achievement and plan modifications

### Scientific Writing
- **Citation Management**: Reference clinical practice guidelines
- **Literature Review**: Understand evidence base for interventions
- **Research Lookup**: Find current treatment recommendations

### Research
- **Research Grants**: Treatment protocols for clinical trials
- **Clinical Trial Reports**: Document trial interventions

## Clinical Practice Guidelines

Treatment plans should align with evidence-based guidelines:

### General Medicine
- American Diabetes Association (ADA) Standards of Care
- ACC/AHA Cardiovascular Guidelines
- GOLD COPD Guidelines
- JNC-8 Hypertension Guidelines
- KDIGO Chronic Kidney Disease Guidelines

### Rehabilitation
- APTA Physical Therapy Clinical Practice Guidelines
- AOTA Occupational Therapy Practice Guidelines
- AHA/AACVPR Cardiac Rehabilitation Guidelines
- Stroke Rehabilitation Best Practices

### Mental Health
- APA (American Psychiatric Association) Practice Guidelines
- VA/DoD Clinical Practice Guidelines for Mental Health
- NICE Guidelines (UK)
- Evidence-based psychotherapy protocols (CBT, DBT, ACT)

### Pain Management
- CDC Opioid Prescribing Guidelines
- AAPM (American Academy of Pain Medicine) Guidelines
- WHO Analgesic Ladder
- Multimodal Analgesia Best Practices

### Perioperative Care
- ERAS (Enhanced Recovery After Surgery) Society Guidelines
- ASA Perioperative Guidelines
- SCIP (Surgical Care Improvement Project) Measures

## Professional Standards

### Documentation Requirements
- Complete and accurate patient information
- Clear diagnosis with appropriate ICD-10 coding
- Evidence-based interventions
- Measurable goals and outcomes
- Defined monitoring and follow-up
- Provider signature, credentials, and date

### Medical Necessity
Treatment plans must demonstrate:
- Medical appropriateness of interventions
- Alignment with diagnosis and severity
- Evidence supporting treatment choices
- Expected outcomes and benefit
- Frequency and duration justification

### Legal Considerations
- Informed consent documentation
- Patient understanding and agreement
- Risk disclosure and mitigation
- Professional liability protection
- Compliance with state/federal regulations

## Support and Resources

### Getting Help

1. **Check reference files** - Comprehensive guidance in `references/` directory
2. **Review templates** - See example structures in `assets/` directory
3. **Run validation scripts** - Identify issues with automated tools
4. **Consult SKILL.md** - Detailed documentation and best practices
5. **Review quality checklist** - Ensure all quality criteria met

### External Resources

- Clinical practice guidelines from specialty societies
- UpToDate and DynaMed for treatment recommendations
- AHRQ Effective Health Care Program
- Cochrane Library for intervention evidence
- CMS Quality Measures and HEDIS specifications
- HEDIS (Healthcare Effectiveness Data and Information Set)

### Professional Organizations

- American Medical Association (AMA)
- American Academy of Family Physicians (AAFP)
- Specialty society guidelines (ADA, ACC, AHA, APA, etc.)
- Joint Commission standards
- Centers for Medicare & Medicaid Services (CMS)

## Frequently Asked Questions

### How do I choose the right template?

Match the template to your primary clinical focus:
- **Chronic medical conditions** → general_medical or chronic_disease
- **Post-surgery or injury** → rehabilitation or perioperative
- **Psychiatric conditions** → mental_health
- **Pain as primary issue** → pain_management

### What if my patient has multiple conditions?

Use the `chronic_disease_management_plan.tex` template for complex multimorbidity, or choose the template for the primary condition and add sections for comorbidities.

### How often should treatment plans be updated?

- **Initial creation**: At diagnosis or treatment initiation
- **Regular updates**: Every 3-6 months for chronic conditions
- **Significant changes**: When goals are met or treatment is modified
- **Annual review**: Minimum for all chronic disease plans

### Can I modify the LaTeX templates?

Yes! Templates are designed to be customized. Modify sections, add specialty-specific content, or adjust formatting to meet your needs.

### How do I ensure HIPAA compliance?

- Remove all 18 HIPAA identifiers (see Safe Harbor method)
- Use age ranges instead of exact ages (e.g., "60-65" not "63")
- Remove specific dates, use relative timelines
- Omit geographic identifiers smaller than state
- Use `check_deidentification.py` script from clinical-reports skill

### What if validation scripts find issues?

Review the specific issues identified, consult reference files for guidance, and revise the plan accordingly. Common issues include:
- Missing required sections
- Goals not meeting SMART criteria
- Insufficient monitoring parameters
- Incomplete medication information

## License

Part of the Claude Scientific Writer project. See main LICENSE file.

---

For detailed documentation, see `SKILL.md`. For issues or questions, consult the comprehensive reference files in the `references/` directory.

