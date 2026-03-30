# Medical Terminology and Coding Standards

## Standard Nomenclature Systems

### SNOMED CT (Systematized Nomenclature of Medicine - Clinical Terms)

**Purpose:** Comprehensive clinical terminology for electronic health records

**Coverage:**
- Clinical findings
- Symptoms
- Diagnoses
- Procedures
- Body structures
- Organisms
- Substances
- Pharmaceutical products
- Specimens

**Structure:**
- Concepts with unique identifiers
- Descriptions (preferred and synonyms)
- Relationships between concepts
- Hierarchical organization

**Example:**
- Concept: Myocardial infarction
- SNOMED CT code: 22298006
- Parent: Heart disease
- Children: Acute myocardial infarction, Old myocardial infarction

**Benefits:**
- Enables semantic interoperability
- Supports clinical decision support
- Facilitates data analytics
- International standard

### LOINC (Logical Observation Identifiers Names and Codes)

**Purpose:** Universal code system for laboratory and clinical observations

**Components of LOINC code:**
1. **Component** (analyte or measurement): What is measured
2. **Property**: What characteristic (mass, volume, etc.)
3. **Timing**: When measured (point in time, 24-hour)
4. **System**: Specimen or system (serum, urine, arterial blood)
5. **Scale**: Type of result (quantitative, ordinal, nominal)
6. **Method**: How measured (when relevant to interpretation)

**Examples:**
- **Glucose [Mass/volume] in Serum or Plasma**: 2345-7
  - Component: Glucose
  - Property: Mass concentration
  - Timing: Point in time
  - System: Serum/Plasma
  - Scale: Quantitative

- **Hemoglobin A1c/Hemoglobin.total in Blood**: 4548-4
  - Component: Hemoglobin A1c/Hemoglobin.total
  - Property: Mass fraction
  - Timing: Point in time
  - System: Blood
  - Scale: Quantitative

**LOINC Parts:**
- Document types
- Survey instruments
- Clinical attachments
- Radiology codes
- Pathology codes

### ICD-10-CM (International Classification of Diseases, 10th Revision, Clinical Modification)

**Purpose:** Diagnosis and procedure coding for billing, epidemiology, and health statistics

**Structure:**
- Alphanumeric codes (3-7 characters)
- First character: letter (except U)
- Characters 2-3: numbers
- Characters 4-7: alphanumeric (decimal after 3rd character)
- Laterality, severity, encounter type specified

**Code structure example:**
- **S72.001A**: Fracture of unspecified part of neck of right femur, initial encounter
  - S: Injury category
  - 72: Femur
  - 001: Unspecified part of neck
  - A: Initial encounter for closed fracture
  - Right side indicated by 1 in 5th position

**Common categories:**
- A00-B99: Infectious diseases
- C00-D49: Neoplasms
- E00-E89: Endocrine, nutritional, metabolic
- F01-F99: Mental and behavioral
- G00-G99: Nervous system
- I00-I99: Circulatory system
- J00-J99: Respiratory system
- K00-K95: Digestive system
- M00-M99: Musculoskeletal
- N00-N99: Genitourinary
- S00-T88: Injury, poisoning

**Seventh character extensions:**
- A: Initial encounter
- D: Subsequent encounter
- S: Sequela

**Placeholder X:**
- Used when code requires 7th character but fewer than 6 characters
- Example: T36.0X5A (Adverse effect of penicillins, initial encounter)

**Combination codes:**
- Single code describing two diagnoses or diagnosis with manifestation
- Example: E11.21 (Type 2 diabetes with diabetic nephropathy)

### CPT (Current Procedural Terminology)

**Purpose:** Procedure and service coding for billing

**Maintained by:** American Medical Association (AMA)

**Categories:**
- **Category I**: Procedures and services (5-digit numeric codes)
- **Category II**: Performance measurement (4 digits + F)
- **Category III**: Emerging technology (4 digits + T)

**Category I Sections:**
- 00100-01999: Anesthesia
- 10000-69990: Surgery
- 70000-79999: Radiology
- 80000-89999: Pathology and Laboratory
- 90000-99999: Medicine
- 99000-99607: Evaluation and Management (E/M)

**E/M Codes (commonly used):**
- **99201-99215**: Office visits (new and established)
- **99221-99239**: Hospital inpatient services
- **99281-99285**: Emergency department visits
- **99291-99292**: Critical care
- **99304-99318**: Nursing facility services

**Modifiers:**
- Two-digit codes appended to CPT codes
- Indicate service was altered but not changed
- Examples:
  - -25: Significant, separately identifiable E/M service
  - -50: Bilateral procedure
  - -59: Distinct procedural service
  - -76: Repeat procedure by same physician
  - -RT/LT: Right/Left side

### RxNorm

**Purpose:** Normalized names for clinical drugs and drug delivery devices

**Structure:**
- Includes brand and generic names
- Dose forms
- Strengths
- Links to other drug vocabularies (NDC, SNOMED CT)

**Example:**
- Concept: Amoxicillin 500 MG Oral Capsule
- RxNorm CUI: 308191
- Ingredients: Amoxicillin
- Strength: 500 MG
- Dose Form: Oral Capsule

## Medical Abbreviations

### Acceptable Standard Abbreviations

**Time:**
- q: every (q4h = every 4 hours)
- qd: daily (avoid - use "daily")
- bid: twice daily
- tid: three times daily
- qid: four times daily
- qhs: at bedtime
- prn: as needed
- ac: before meals
- pc: after meals
- hs: at bedtime

**Routes:**
- PO: by mouth (per os)
- IV: intravenous
- IM: intramuscular
- SC/SQ/subcut: subcutaneous
- SL: sublingual
- PR: per rectum
- NG: nasogastric
- GT: gastrostomy tube
- TD: transdermal
- inh: inhaled

**Frequency:**
- stat: immediately
- now: immediately
- continuous: without interruption
- PRN: as needed

**Laboratory:**
- CBC: complete blood count
- BMP: basic metabolic panel
- CMP: comprehensive metabolic panel
- LFTs: liver function tests
- PT/INR: prothrombin time/international normalized ratio
- PTT/aPTT: partial thromboplastin time/activated PTT
- ESR: erythrocyte sedimentation rate
- CRP: C-reactive protein
- ABG: arterial blood gas
- UA: urinalysis
- HbA1c: hemoglobin A1c

**Diagnoses:**
- HTN: hypertension
- DM: diabetes mellitus
- CHF: congestive heart failure
- CAD: coronary artery disease
- COPD: chronic obstructive pulmonary disease
- CVA: cerebrovascular accident
- MI: myocardial infarction
- PE: pulmonary embolism
- DVT: deep vein thrombosis
- UTI: urinary tract infection
- CKD: chronic kidney disease
- ESRD: end-stage renal disease

**Physical Examination:**
- HEENT: head, eyes, ears, nose, throat
- PERRLA: pupils equal, round, reactive to light and accommodation
- EOMI: extraocular movements intact
- JVP: jugular venous pressure
- RRR: regular rate and rhythm
- CTAB: clear to auscultation bilaterally
- BS: bowel sounds or breath sounds (context dependent)
- NT/ND: non-tender, non-distended
- FROM: full range of motion

**Vital Signs:**
- BP: blood pressure
- HR: heart rate
- RR: respiratory rate
- T or Temp: temperature
- SpO2: oxygen saturation
- Wt: weight
- Ht: height
- BMI: body mass index

### Do Not Use Abbreviations (Joint Commission)

**Prohibited abbreviations:**

| Abbreviation | Intended Meaning | Problem | Use Instead |
|--------------|------------------|---------|-------------|
| U | Unit | Mistaken for 0, 4, or cc | Write "unit" |
| IU | International Unit | Mistaken for IV or 10 | Write "international unit" |
| Q.D., QD, q.d., qd | Daily | Mistaken for each other | Write "daily" |
| Q.O.D., QOD, q.o.d., qod | Every other day | Mistaken for QD or QID | Write "every other day" |
| Trailing zero (X.0 mg) | X mg | Decimal point missed | Never write zero after decimal (write X mg) |
| Lack of leading zero (.X mg) | 0.X mg | Decimal point missed | Always write zero before decimal (write 0.X mg) |
| MS, MSO4, MgSO4 | Morphine sulfate or magnesium sulfate | Confused for each other | Write "morphine sulfate" or "magnesium sulfate" |

**Additional problematic abbreviations:**
- µg: micrograms (mistaken for mg) → write "mcg"
- cc: cubic centimeters → write "mL"
- hs: half-strength or hour of sleep → write "half-strength" or "bedtime"
- TIW: three times a week → write "three times weekly"
- SC, SQ: subcutaneous → write "subcut" or "subcutaneous"
- D/C: discharge or discontinue → write full word
- AS, AD, AU: left ear, right ear, both ears → write "left ear," "right ear," "both ears"
- OS, OD, OU: left eye, right eye, both eyes → write "left eye," "right eye," "both eyes"

## Medication Nomenclature

### Generic vs. Brand Names

**Best practice:** Use generic names in medical documentation

**Examples:**
- Acetaminophen (generic) vs. Tylenol (brand)
- Ibuprofen (generic) vs. Advil, Motrin (brand)
- Atorvastatin (generic) vs. Lipitor (brand)
- Metformin (generic) vs. Glucophage (brand)
- Lisinopril (generic) vs. Zestril, Prinivil (brand)

**When to include brand:**
- Patient education (recognition)
- Novel drugs without generic
- Narrow therapeutic index drugs with bioequivalence issues
- Biologic products

### Dosage Forms

**Solid oral:**
- Tablet
- Capsule
- Caplet
- Chewable tablet
- Orally disintegrating tablet (ODT)
- Extended-release (ER, XR, SR)
- Delayed-release (DR)

**Liquid oral:**
- Solution
- Suspension
- Syrup
- Elixir
- Drops

**Parenteral:**
- Solution for injection
- Powder for injection (reconstituted)
- Intravenous infusion
- Intramuscular injection
- Subcutaneous injection

**Topical:**
- Cream
- Ointment
- Gel
- Lotion
- Paste
- Patch (transdermal)
- Foam
- Spray

**Other:**
- Suppository (rectal, vaginal)
- Inhaler (MDI, DPI)
- Nebulizer solution
- Ophthalmic (drops, ointment)
- Otic (drops)
- Nasal spray

### Prescription Writing Elements

**Complete prescription includes:**
1. Patient name and DOB
2. Date
3. Medication name (generic preferred)
4. Strength/concentration
5. Dosage form
6. Quantity to dispense
7. Directions (Sig)
8. Number of refills
9. Prescriber signature and credentials
10. DEA number (for controlled substances)

**Sig (Directions for use):**
- Clear, specific instructions
- Route of administration
- Frequency
- Duration (if applicable)
- Special instructions

**Example:**
- "Take one tablet by mouth twice daily with food for 10 days"
- "Apply thin layer to affected area three times daily"
- "Instill 1 drop in each eye every 4 hours while awake"

## Anatomical Terminology

### Directional Terms

**Superior/Inferior:**
- Superior: toward the head
- Inferior: toward the feet
- Cranial: toward the head
- Caudal: toward the tail/feet

**Anterior/Posterior:**
- Anterior: toward the front
- Posterior: toward the back
- Ventral: toward the belly
- Dorsal: toward the back

**Medial/Lateral:**
- Medial: toward the midline
- Lateral: away from the midline

**Proximal/Distal:**
- Proximal: closer to the trunk or point of origin
- Distal: farther from the trunk or point of origin

**Superficial/Deep:**
- Superficial: toward the surface
- Deep: away from the surface

### Body Planes

**Sagittal plane:** Divides body into right and left
- Midsagittal: exactly through midline
- Parasagittal: parallel to midline

**Coronal (frontal) plane:** Divides body into anterior and posterior

**Transverse (axial) plane:** Divides body into superior and inferior

### Anatomical Position

- Standing upright
- Feet parallel
- Arms at sides
- Palms facing forward
- Head facing forward

### Regional Terms

**Head and Neck:**
- Cephalic: head
- Frontal: forehead
- Orbital: eye
- Nasal: nose
- Oral: mouth
- Cervical: neck
- Occipital: back of head

**Trunk:**
- Thoracic: chest
- Abdominal: abdomen
- Pelvic: pelvis
- Lumbar: lower back
- Sacral: sacrum

**Extremities:**
- Brachial: arm
- Antebrachial: forearm
- Carpal: wrist
- Manual: hand
- Digital: fingers/toes
- Femoral: thigh
- Crural: leg
- Tarsal: ankle
- Pedal: foot

## Laboratory Units and Conversions

### Common Laboratory Units

**Hematology:**
- RBC: × 10⁶/μL or × 10¹²/L
- WBC: × 10³/μL or × 10⁹/L
- Hemoglobin: g/dL or g/L
- Hematocrit: % or fraction
- Platelets: × 10³/μL or × 10⁹/L
- MCV: fL
- MCHC: g/dL or g/L

**Chemistry:**
- Glucose: mg/dL or mmol/L
- BUN: mg/dL or mmol/L
- Creatinine: mg/dL or μmol/L
- Sodium, potassium, chloride: mEq/L or mmol/L
- Calcium: mg/dL or mmol/L
- Albumin: g/dL or g/L
- Bilirubin: mg/dL or μmol/L
- Cholesterol: mg/dL or mmol/L

**Therapeutic Drug Levels:**
- Usually: mcg/mL, ng/mL, or μmol/L

### Unit Conversions (Selected)

**Glucose:**
- mg/dL ÷ 18 = mmol/L
- mmol/L × 18 = mg/dL

**Creatinine:**
- mg/dL × 88.4 = μmol/L
- μmol/L ÷ 88.4 = mg/dL

**Bilirubin:**
- mg/dL × 17.1 = μmol/L
- μmol/L ÷ 17.1 = mg/dL

**Cholesterol:**
- mg/dL × 0.0259 = mmol/L
- mmol/L × 38.67 = mg/dL

**Hemoglobin:**
- g/dL × 10 = g/L
- g/L ÷ 10 = g/dL

## Grading and Staging Systems

### Cancer Staging (TNM)

**T (Primary Tumor):**
- TX: Cannot be assessed
- T0: No evidence of primary tumor
- Tis: Carcinoma in situ
- T1-T4: Size and/or extent of primary tumor

**N (Regional Lymph Nodes):**
- NX: Cannot be assessed
- N0: No regional lymph node metastasis
- N1-N3: Involvement of regional lymph nodes

**M (Distant Metastasis):**
- M0: No distant metastasis
- M1: Distant metastasis present

**Stage Grouping:**
- Stage 0: Tis N0 M0
- Stage I-III: Various T and N combinations, M0
- Stage IV: Any T, any N, M1

### NYHA Heart Failure Classification

- **Class I**: No limitation. Ordinary physical activity does not cause symptoms
- **Class II**: Slight limitation. Comfortable at rest, ordinary activity causes symptoms
- **Class III**: Marked limitation. Comfortable at rest, less than ordinary activity causes symptoms
- **Class IV**: Unable to carry out any physical activity without symptoms. Symptoms at rest

### Child-Pugh Score (Liver Disease)

**Parameters:** Bilirubin, albumin, INR, ascites, encephalopathy

**Classes:**
- **Class A (5-6 points)**: Well-compensated
- **Class B (7-9 points)**: Significant functional compromise
- **Class C (10-15 points)**: Decompensated

### Glasgow Coma Scale

**Eye Opening (1-4):**
- 4: Spontaneous
- 3: To speech
- 2: To pain
- 1: None

**Verbal Response (1-5):**
- 5: Oriented
- 4: Confused
- 3: Inappropriate words
- 2: Incomprehensible sounds
- 1: None

**Motor Response (1-6):**
- 6: Obeys commands
- 5: Localizes pain
- 4: Withdraws from pain
- 3: Abnormal flexion
- 2: Extension
- 1: None

**Total Score:** 3-15 (3 = worst, 15 = best)
- Severe: ≤8
- Moderate: 9-12
- Mild: 13-15

## Medical Prefixes and Suffixes

### Common Prefixes

- **a-/an-**: without, absence (anemia, aphasia)
- **brady-**: slow (bradycardia)
- **dys-**: abnormal, difficult (dyspnea, dysuria)
- **hyper-**: excessive, above (hypertension, hyperglycemia)
- **hypo-**: below, deficient (hypotension, hypoglycemia)
- **poly-**: many (polyuria, polydipsia)
- **tachy-**: fast (tachycardia, tachypnea)
- **macro-**: large (macrocephaly)
- **micro-**: small (microcephaly)
- **hemi-**: half (hemiplegia)
- **bi-/di-**: two (bilateral, diplopia)

### Common Suffixes

- **-algia**: pain (arthralgia, neuralgia)
- **-ectomy**: surgical removal (appendectomy, cholecystectomy)
- **-emia**: blood condition (anemia, leukemia)
- **-itis**: inflammation (appendicitis, arthritis)
- **-oma**: tumor (carcinoma, melanoma)
- **-osis**: abnormal condition (cirrhosis, osteoporosis)
- **-pathy**: disease (neuropathy, nephropathy)
- **-penia**: deficiency (thrombocytopenia, neutropenia)
- **-plasty**: surgical repair (rhinoplasty, angioplasty)
- **-scopy**: visual examination (colonoscopy, bronchoscopy)
- **-stomy**: surgical opening (colostomy, tracheostomy)

---

This reference provides comprehensive medical terminology, coding systems, abbreviations, and nomenclature standards. Use these guidelines to ensure accurate, standardized clinical documentation.

