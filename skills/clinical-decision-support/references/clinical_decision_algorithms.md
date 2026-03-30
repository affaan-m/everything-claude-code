# Clinical Decision Algorithms Guide

## Overview

Clinical decision algorithms provide systematic, step-by-step guidance for diagnosis, treatment selection, and patient management. This guide covers algorithm development, validation, and visual presentation using decision trees and flowcharts.

## Algorithm Design Principles

### Key Components

**Decision Nodes**
- **Question/Criteria**: Clear, measurable clinical parameter
- **Binary vs Multi-Way**: Yes/no (simple) vs multiple options (complex)
- **Objective**: Lab value, imaging finding vs Subjective: Clinical judgment

**Action Nodes**
- **Treatment**: Specific intervention with dosing
- **Test**: Additional diagnostic procedure
- **Referral**: Specialist consultation, higher level of care
- **Observation**: Watchful waiting with defined follow-up

**Terminal Nodes**
- **Outcome**: Final decision point
- **Follow-up**: Schedule for reassessment
- **Exit criteria**: When to exit algorithm

### Design Criteria

**Clarity**
- Unambiguous decision points
- Mutually exclusive pathways
- No circular loops (unless intentional reassessment cycles)
- Clear entry and exit points

**Clinical Validity**
- Evidence-based decision criteria
- Validated cut-points for biomarkers
- Guideline-concordant recommendations
- Expert consensus where evidence limited

**Usability**
- Maximum 7 decision points per pathway (cognitive load)
- Visual hierarchy (most common path highlighted)
- Printable single-page format preferred
- Color coding for urgency/safety

**Completeness**
- All possible scenarios covered
- Default pathway for edge cases
- Safety-net provisions for unusual presentations
- Escalation criteria clearly stated

## Clinical Decision Trees

### Diagnostic Algorithms

**Chest Pain Evaluation Algorithm**

```
Entry: Patient with chest pain

├─ STEMI Criteria? (ST elevation ≥1mm in ≥2 contiguous leads)
│  ├─ YES → Activate cath lab, aspirin 325mg, heparin, clopidogrel 600mg
│  │        Transfer for primary PCI (goal door-to-balloon <90 minutes)
│  └─ NO → Continue evaluation

├─ High-Risk Features? (Hemodynamic instability, arrhythmia, troponin elevation)
│  ├─ YES → Admit CCU, serial troponins, cardiology consultation
│  │        Consider early angiography if NSTEMI
│  └─ NO → Calculate TIMI or HEART score

├─ TIMI Score 0-1 or HEART Score 0-3? (Low risk)
│  ├─ YES → Observe 6-12 hours, serial troponins, stress test if negative
│  │        Discharge if all negative with cardiology follow-up in 72 hours
│  └─ NO → TIMI 2-4 or HEART 4-6 (Intermediate risk)

├─ TIMI Score 2-4 or HEART Score 4-6? (Intermediate risk)
│  ├─ YES → Admit telemetry, serial troponins, stress imaging vs CT angiography
│  │        Medical management: Aspirin, statin, beta-blocker
│  └─ NO → TIMI ≥5 or HEART ≥7 (High risk) → Treat as NSTEMI

Decision Endpoint: Risk-stratified pathway with 30-day event rate documented
```

**Pulmonary Embolism Diagnostic Algorithm (Wells Criteria)**

```
Entry: Suspected PE

Step 1: Calculate Wells Score
  Clinical features points:
  - Clinical signs of DVT: 3 points
  - PE more likely than alternative diagnosis: 3 points  
  - Heart rate >100: 1.5 points
  - Immobilization/surgery in past 4 weeks: 1.5 points
  - Previous PE/DVT: 1.5 points
  - Hemoptysis: 1 point
  - Malignancy: 1 point

Step 2: Risk Stratify
  ├─ Wells Score ≤4 (PE unlikely)
  │  └─ D-dimer test
  │     ├─ D-dimer negative (<500 ng/mL) → PE excluded, consider alternative diagnosis
  │     └─ D-dimer positive (≥500 ng/mL) → CTPA
  │
  └─ Wells Score >4 (PE likely)
     └─ CTPA (skip D-dimer)

Step 3: CTPA Results
  ├─ Positive for PE → Risk stratify severity
  │  ├─ Massive PE (hypotension, shock) → Thrombolytics vs embolectomy
  │  ├─ Submassive PE (RV strain, troponin+) → Admit ICU, consider thrombolytics
  │  └─ Low-risk PE → Anticoagulation, consider outpatient management
  │
  └─ Negative for PE → PE excluded, investigate alternative diagnosis

Step 4: Treatment Decision (if PE confirmed)
  ├─ Absolute contraindication to anticoagulation?
  │  ├─ YES → IVC filter placement, treat underlying condition
  │  └─ NO → Anticoagulation therapy
  │
  ├─ Cancer-associated thrombosis?
  │  ├─ YES → LMWH preferred (edoxaban alternative)
  │  └─ NO → DOAC preferred (apixaban, rivaroxaban, edoxaban)
  │
  └─ Duration: Minimum 3 months, extended if unprovoked or recurrent
```

### Treatment Selection Algorithms

**NSCLC First-Line Treatment Algorithm**

```
Entry: Advanced/Metastatic NSCLC, adequate PS (ECOG 0-2)

Step 1: Biomarker Testing Complete?
  ├─ NO → Reflex testing: EGFR, ALK, ROS1, BRAF, PD-L1, consider NGS
  │       Hold systemic therapy pending results (unless rapidly progressive)
  └─ YES → Proceed to Step 2

Step 2: Actionable Genomic Alteration?
  ├─ EGFR exon 19 deletion or L858R → Osimertinib 80mg daily
  │  └─ Alternative: Erlotinib, gefitinib, afatinib (less preferred)
  │
  ├─ ALK rearrangement → Alectinib 600mg BID
  │  └─ Alternatives: Brigatinib, lorlatinib, crizotinib (less preferred)
  │
  ├─ ROS1 rearrangement → Crizotinib 250mg BID or entrectinib
  │
  ├─ BRAF V600E → Dabrafenib + trametinib
  │
  ├─ MET exon 14 skipping → Capmatinib or tepotinib
  │
  ├─ RET rearrangement → Selpercatinib or pralsetinib
  │
  ├─ NTRK fusion → Larotrectinib or entrectinib
  │
  ├─ KRAS G12C → Sotorasib or adagrasib (if no other options)
  │
  └─ NO actionable alteration → Proceed to Step 3

Step 3: PD-L1 Testing Result?
  ├─ PD-L1 ≥50% (TPS)
  │  ├─ Option 1: Pembrolizumab 200mg Q3W (monotherapy, NCCN Category 1)
  │  ├─ Option 2: Pembrolizumab + platinum doublet chemotherapy
  │  └─ Option 3: Atezolizumab + bevacizumab + carboplatin + paclitaxel
  │
  ├─ PD-L1 1-49% (TPS)
  │  ├─ Preferred: Pembrolizumab + platinum doublet chemotherapy
  │  └─ Alternative: Platinum doublet chemotherapy alone
  │
  └─ PD-L1 <1% (TPS)
     ├─ Preferred: Pembrolizumab + platinum doublet chemotherapy
     └─ Alternative: Platinum doublet chemotherapy ± bevacizumab

Step 4: Platinum Doublet Selection (if applicable)
  ├─ Squamous histology
  │  └─ Carboplatin AUC 6 + paclitaxel 200 mg/m² Q3W (4 cycles)
  │      or Carboplatin AUC 5 + nab-paclitaxel 100 mg/m² D1,8,15 Q4W
  │
  └─ Non-squamous histology  
     └─ Carboplatin AUC 6 + pemetrexed 500 mg/m² Q3W (4 cycles)
         Continue pemetrexed maintenance if responding
         Add bevacizumab 15 mg/kg if eligible (no hemoptysis, brain mets)

Step 5: Monitoring and Response Assessment
  - Imaging every 6 weeks for first 12 weeks, then every 9 weeks
  - Continue until progression or unacceptable toxicity
  - At progression, proceed to second-line algorithm
```

**Heart Failure Management Algorithm (AHA/ACC Guidelines)**

```
Entry: Heart Failure Diagnosis Confirmed

Step 1: Determine HF Type
  ├─ HFrEF (EF ≤40%)
  │  └─ Proceed to Guideline-Directed Medical Therapy (GDMT)
  │
  ├─ HFpEF (EF ≥50%)
  │  └─ Treat comorbidities, diuretics for congestion, consider SGLT2i
  │
  └─ HFmrEF (EF 41-49%)
     └─ Consider HFrEF GDMT, evidence less robust

Step 2: GDMT for HFrEF (All patients unless contraindicated)

Quadruple Therapy (Class 1 recommendations):

1. ACE Inhibitor/ARB/ARNI
   ├─ Preferred: Sacubitril-valsartan 49/51mg BID → titrate to 97/103mg BID
   │  └─ If ACE-I naïve or taking <10mg enalapril equivalent
   ├─ Alternative: ACE-I (enalapril, lisinopril, ramipril) to target dose
   └─ Alternative: ARB (losartan, valsartan) if ACE-I intolerant

2. Beta-Blocker (start low, titrate slowly)
   ├─ Bisoprolol 1.25mg daily → 10mg daily target
   ├─ Metoprolol succinate 12.5mg daily → 200mg daily target
   └─ Carvedilol 3.125mg BID → 25mg BID target (50mg BID if >85kg)

3. Mineralocorticoid Receptor Antagonist (MRA)
   ├─ Spironolactone 12.5-25mg daily → 50mg daily target
   └─ Eplerenone 25mg daily → 50mg daily target
   └─ Contraindications: K >5.0, CrCl <30 mL/min

4. SGLT2 Inhibitor (regardless of diabetes status)
   ├─ Dapagliflozin 10mg daily
   └─ Empagliflozin 10mg daily

Step 3: Additional Therapies Based on Phenotype

├─ Sinus rhythm + HR ≥70 despite beta-blocker?
│  └─ YES: Add ivabradine 5mg BID → 7.5mg BID target
│
├─ African American + NYHA III-IV?
│  └─ YES: Add hydralazine 37.5mg TID + isosorbide dinitrate 20mg TID
│           (Target: hydralazine 75mg TID + ISDN 40mg TID)
│
├─ Atrial fibrillation?
│  ├─ Rate control (target <80 bpm at rest, <110 bpm with activity)
│  └─ Anticoagulation (DOAC preferred, warfarin if valvular)
│
└─ Iron deficiency (ferritin <100 or <300 with TSAT <20%)?
   └─ YES: IV iron supplementation (ferric carboxymaltose)

Step 4: Device Therapy Evaluation

├─ EF ≤35%, NYHA II-III, LBBB with QRS ≥150 ms, sinus rhythm?
│  └─ YES: Cardiac resynchronization therapy (CRT-D)
│
├─ EF ≤35%, NYHA II-III, on GDMT ≥3 months?
│  └─ YES: ICD for primary prevention
│           (if life expectancy >1 year with good functional status)
│
└─ EF ≤35%, NYHA IV despite GDMT, or advanced HF?
   └─ Refer to advanced HF specialist
      ├─ LVAD evaluation
      ├─ Heart transplant evaluation
      └─ Palliative care consultation

Step 5: Monitoring and Titration

Weekly to biweekly visits during titration:
- Blood pressure (target SBP ≥90 mmHg)
- Heart rate (target 50-60 bpm)
- Potassium (target 4.0-5.0 mEq/L, hold MRA if >5.5)
- Creatinine (expect 10-20% increase, acceptable if <30% and stable)
- Symptoms and congestion status (daily weights, NYHA class)

Stable on GDMT:
- Visits every 3-6 months
- Echocardiogram at 3-6 months after GDMT optimization, then annually
- NT-proBNP or BNP trending (biomarker-guided therapy investigational)
```

## Risk Stratification Tools

### Cardiovascular Risk Scores

**TIMI Risk Score (NSTEMI/Unstable Angina)**

```
Score Calculation (0-7 points):
☐ Age ≥65 years (1 point)
☐ ≥3 cardiac risk factors (HTN, hyperlipidemia, diabetes, smoking, family history) (1)
☐ Known CAD (stenosis ≥50%) (1)
☐ ASA use in past 7 days (1)
☐ Severe angina (≥2 episodes in 24 hours) (1)
☐ ST deviation ≥0.5 mm (1)
☐ Elevated cardiac biomarkers (1)

Risk Stratification:
├─ Score 0-1: 5% risk of death/MI/urgent revasc at 14 days (Low)
│  └─ Management: Observation, stress test, outpatient follow-up
│
├─ Score 2: 8% risk (Low-intermediate)
│  └─ Management: Admission, medical therapy, stress imaging
│
├─ Score 3-4: 13-20% risk (Intermediate-high)
│  └─ Management: Admission, aggressive medical therapy, early invasive strategy
│
└─ Score 5-7: 26-41% risk (High)
   └─ Management: Aggressive treatment, urgent angiography (<24 hours)
```

**CHA2DS2-VASc Score (Stroke Risk in Atrial Fibrillation)**

```
Score Calculation:
☐ Congestive heart failure (1 point)
☐ Hypertension (1)
☐ Age ≥75 years (2)
☐ Diabetes mellitus (1)
☐ Prior stroke/TIA/thromboembolism (2)
☐ Vascular disease (MI, PAD, aortic plaque) (1)
☐ Age 65-74 years (1)
☐ Sex category (female) (1)

Maximum score: 9 points

Treatment Algorithm:
├─ Score 0 (male) or 1 (female): 0-1.3% annual stroke risk
│  └─ No anticoagulation or aspirin (Class IIb)
│
├─ Score 1 (male): 1.3% annual stroke risk
│  └─ Consider anticoagulation (Class IIa)
│      Factors: Patient preference, bleeding risk, comorbidities
│
└─ Score ≥2 (male) or ≥3 (female): ≥2.2% annual stroke risk
   └─ Anticoagulation recommended (Class I)
      ├─ Preferred: DOAC (apixaban, rivaroxaban, edoxaban, dabigatran)
      └─ Alternative: Warfarin (INR 2-3) if DOAC contraindicated

Bleeding Risk Assessment (HAS-BLED):
H - Hypertension (SBP >160)
A - Abnormal renal/liver function (1 point each)
S - Stroke history
B - Bleeding history or predisposition
L - Labile INR (if on warfarin)
E - Elderly (age >65)
D - Drugs (antiplatelet, NSAIDs) or alcohol (1 point each)

HAS-BLED ≥3: High bleeding risk → Modifiable factors, consider DOAC over warfarin
```

### Oncology Risk Calculators

**MELD Score (Hepatocellular Carcinoma Eligibility)**

```
MELD = 3.78×ln(bilirubin mg/dL) + 11.2×ln(INR) + 9.57×ln(creatinine mg/dL) + 6.43

Interpretation:
├─ MELD <10: 1.9% 3-month mortality (Low)
│  └─ Consider resection or ablation for HCC
│
├─ MELD 10-19: 6-20% 3-month mortality (Moderate)
│  └─ Transplant evaluation if within Milan criteria
│      Milan: Single ≤5cm or ≤3 lesions each ≤3cm, no vascular invasion
│
├─ MELD 20-29: 20-45% 3-month mortality (High)
│  └─ Urgent transplant evaluation, bridge therapy (TACE, ablation)
│
└─ MELD ≥30: 50-70% 3-month mortality (Very high)
   └─ Transplant vs palliative care discussion
      Too ill for transplant if MELD >35-40 typically
```

**Adjuvant! Online (Breast Cancer Recurrence Risk)**

```
Input Variables:
- Age at diagnosis
- Tumor size
- Tumor grade (1-3)
- ER status
- Node status (0, 1-3, 4-9, ≥10)
- HER2 status
- Comorbidity index

Output: 10-year risk of:
- Recurrence
- Breast cancer mortality
- Overall mortality

Treatment Benefit Estimates:
- Chemotherapy: Absolute reduction in recurrence
- Endocrine therapy: Absolute reduction in recurrence
- Trastuzumab: Absolute reduction (if HER2+)

Clinical Application:
├─ Low risk (<10% recurrence): Consider endocrine therapy alone if ER+
├─ Intermediate risk (10-20%): Chemotherapy discussion, genomic assay
│  └─ Oncotype DX score <26: Endocrine therapy alone
│  └─ Oncotype DX score ≥26: Chemotherapy + endocrine therapy
└─ High risk (>20%): Chemotherapy + endocrine therapy if ER+
```

## TikZ Flowchart Best Practices

### Visual Design Principles

**Node Styling**
```latex
% Decision nodes (diamond)
\tikzstyle{decision} = [diamond, draw, fill=yellow!20, text width=4.5em, text centered, inner sep=0pt]

% Process nodes (rectangle)
\tikzstyle{process} = [rectangle, draw, fill=blue!20, text width=5em, text centered, rounded corners, minimum height=3em]

% Terminal nodes (rounded rectangle)
\tikzstyle{terminal} = [rectangle, draw, fill=green!20, text width=5em, text centered, rounded corners=1em, minimum height=3em]

% Input/Output (parallelogram)
\tikzstyle{io} = [trapezium, draw, fill=purple!20, text width=5em, text centered, minimum height=3em]
```

**Color Coding by Urgency**
- **Red**: Life-threatening, immediate action required
- **Orange**: Urgent, action within hours
- **Yellow**: Semi-urgent, action within 24-48 hours
- **Green**: Routine, stable clinical situation
- **Blue**: Informational, monitoring only

**Pathway Emphasis**
- Bold arrows for most common pathway
- Dashed arrows for rare scenarios
- Arrow thickness proportional to pathway frequency
- Highlight boxes around critical decision points

### LaTeX TikZ Template

```latex
\documentclass{article}
\usepackage{tikz}
\usetikzlibrary{shapes, arrows, positioning}

\begin{document}

\tikzstyle{decision} = [diamond, draw, fill=yellow!20, text width=4em, text centered, inner sep=2pt, font=\small]
\tikzstyle{process} = [rectangle, draw, fill=blue!20, text width=6em, text centered, rounded corners, minimum height=2.5em, font=\small]
\tikzstyle{terminal} = [rectangle, draw, fill=green!20, text width=6em, text centered, rounded corners=8pt, minimum height=2.5em, font=\small]
\tikzstyle{alert} = [rectangle, draw=red, line width=1.5pt, fill=red!10, text width=6em, text centered, rounded corners, minimum height=2.5em, font=\small\bfseries]
\tikzstyle{arrow} = [thick,->,>=stealth]

\begin{tikzpicture}[node distance=2cm, auto]
    % Nodes
    \node [terminal] (start) {Patient presents with symptom X};
    \node [decision, below of=start] (decision1) {Criterion A met?};
    \node [alert, below of=decision1, node distance=2.5cm] (alert1) {Immediate action};
    \node [process, right of=decision1, node distance=4cm] (process1) {Standard evaluation};
    \node [terminal, below of=process1, node distance=2.5cm] (end) {Outcome};
    
    % Arrows
    \draw [arrow] (start) -- (decision1);
    \draw [arrow] (decision1) -- node {Yes} (alert1);
    \draw [arrow] (decision1) -- node {No} (process1);
    \draw [arrow] (process1) -- (end);
    \draw [arrow] (alert1) -| (end);
\end{tikzpicture}

\end{document}
```

## Algorithm Validation

### Development Process

**Step 1: Literature Review and Evidence Synthesis**
- Systematic review of guidelines (NCCN, ASCO, ESMO, AHA/ACC)
- Meta-analyses of clinical trials
- Expert consensus statements
- Local practice patterns and resource availability

**Step 2: Draft Algorithm Development**
- Multidisciplinary team input (physicians, nurses, pharmacists)
- Define decision nodes and criteria
- Specify actions and outcomes
- Identify areas of uncertainty

**Step 3: Pilot Testing**
- Retrospective application to historical cases (n=20-50)
- Identify scenarios not covered by algorithm
- Refine decision criteria
- Usability testing with end-users

**Step 4: Prospective Validation**
- Implement in clinical practice with data collection
- Track adherence rate (target >80%)
- Monitor outcomes vs historical controls
- User satisfaction surveys

**Step 5: Continuous Quality Improvement**
- Quarterly review of algorithm performance
- Update based on new evidence
- Address deviations and reasons for non-adherence
- Version control and change documentation

### Performance Metrics

**Process Metrics**
- Algorithm adherence rate (% cases following algorithm)
- Time to decision (median time from presentation to treatment start)
- Completion rate (% cases reaching terminal node)

**Outcome Metrics**
- Appropriateness of care (concordance with guidelines)
- Clinical outcomes (mortality, morbidity, readmissions)
- Resource utilization (length of stay, unnecessary tests)
- Safety (adverse events, errors)

**User Experience Metrics**
- Ease of use (Likert scale survey)
- Time to use (median time to navigate algorithm)
- Perceived utility (% users reporting algorithm helpful)
- Barriers to use (qualitative feedback)

## Implementation Strategies

### Integration into Clinical Workflow

**Electronic Health Record Integration**
- Clinical decision support (CDS) alerts at key decision points
- Order sets linked to algorithm pathways
- Auto-population of risk scores from EHR data
- Documentation templates following algorithm structure

**Point-of-Care Tools**
- Pocket cards for quick reference
- Mobile apps with interactive algorithms
- Wall posters in clinical areas
- QR codes linking to full algorithm

**Education and Training**
- Didactic presentation of algorithm rationale
- Case-based exercises
- Simulation scenarios
- Audit and feedback on adherence

### Overcoming Barriers

**Common Barriers**
- Algorithm complexity (too many decision points)
- Lack of awareness (not disseminated effectively)
- Disagreement with recommendations (perceived as cookbook medicine)
- Competing priorities (time pressure, multiple patients)
- Resource limitations (recommended tests/treatments not available)

**Mitigation Strategies**
- Simplify algorithms (≤7 decision points per pathway preferred)
- Champion network (local opinion leaders promoting algorithm)
- Customize to local context (allow flexibility for clinical judgment)
- Measure and report outcomes (demonstrate value)
- Provide resources (ensure algorithm-recommended options available)

## Algorithm Maintenance and Updates

### Version Control

**Change Log Documentation**
```
Algorithm: NSCLC First-Line Treatment
Version: 3.2
Effective Date: January 1, 2024
Previous Version: 3.1 (effective July 1, 2023)

Changes in Version 3.2:
1. Added KRAS G12C-mutated pathway (sotorasib, adagrasib)
   - Evidence: FDA approval May 2021/2022
   - Guideline: NCCN v4.2023

2. Updated PD-L1 ≥50% recommendation to include pembrolizumab monotherapy as Option 1
   - Evidence: KEYNOTE-024 5-year follow-up
   - Guideline: NCCN Category 1 preferred

3. Removed crizotinib as preferred ALK inhibitor, moved to alternative
   - Evidence: ALEX, CROWN trials showing superiority of alectinib, lorlatinib
   - Guideline: NCCN/ESMO Category 1 for alectinib as first-line

Reviewed by: Thoracic Oncology Committee
Approved by: Dr. [Name], Medical Director
Next Review Date: July 1, 2024
```

### Trigger for Updates

**Mandatory Updates (Within 3 Months)**
- FDA approval of new drug for algorithm indication
- Guideline change (NCCN, ASCO, ESMO Category 1 recommendation)
- Safety alert or black box warning added to recommended agent
- Major clinical trial results changing standard of care

**Routine Updates (Annually)**
- Minor evidence updates
- Optimization based on local performance data
- Formatting or usability improvements
- Addition of new clinical scenarios encountered

**Emergency Updates (Within 1 Week)**
- Drug shortage requiring alternative pathways
- Drug recall or safety withdrawal
- Outbreak or pandemic requiring modified protocols

