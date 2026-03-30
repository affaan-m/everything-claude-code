# Biomarker Classification and Interpretation Guide

## Overview

Biomarkers are measurable indicators of biological state or condition. In clinical decision support, biomarkers guide diagnosis, prognosis, treatment selection, and monitoring. This guide covers genomic, proteomic, and molecular biomarkers with emphasis on clinical actionability.

## Biomarker Categories

### Prognostic Biomarkers

**Definition**: Predict clinical outcome (survival, recurrence) regardless of treatment received

**Examples by Disease**

**Cancer**
- **Ki-67 index**: High proliferation (>20%) predicts worse outcome in breast cancer
- **TP53 mutation**: Poor prognosis across many cancer types
- **Tumor stage/grade**: TNM staging, histologic grade
- **LDH elevation**: Poor prognosis in melanoma, lymphoma
- **AFP elevation**: Poor prognosis in hepatocellular carcinoma

**Cardiovascular**
- **NT-proBNP/BNP**: Elevated levels predict mortality in heart failure
- **Troponin**: Predicts adverse events in ACS
- **CRP**: Inflammation marker, predicts cardiovascular events

**Infectious Disease**
- **HIV viral load**: Predicts disease progression if untreated
- **HCV genotype**: Predicts treatment duration needed

**Application**: Risk stratification, treatment intensity selection, clinical trial enrollment

### Predictive Biomarkers

**Definition**: Identify patients likely to benefit (or not benefit) from specific therapy

**Positive Predictive Biomarkers (Treatment Benefit)**

**Oncology - Targeted Therapy**
- **EGFR exon 19 del/L858R → EGFR TKIs**: Response rate 60-70%, PFS 10-14 months
- **ALK rearrangement → ALK inhibitors**: ORR 70-90%, PFS 25-34 months  
- **HER2 amplification → Trastuzumab**: Benefit only in HER2+ (IHC 3+ or FISH+)
- **BRAF V600E → BRAF inhibitors**: ORR 50%, PFS 6-7 months (melanoma)
- **PD-L1 ≥50% → Pembrolizumab**: ORR 45%, PFS 10 months vs 6 months (chemo)

**Oncology - Immunotherapy**
- **MSI-H/dMMR → Anti-PD-1**: ORR 40-60% across tumor types
- **TMB-high → Immunotherapy**: Investigational, some benefit signals
- **PD-L1 expression → Anti-PD-1/PD-L1**: Higher expression correlates with better response

**Hematology**
- **BCR-ABL → Imatinib (CML)**: Complete cytogenetic response 80%
- **CD20+ → Rituximab (lymphoma)**: Benefit only if CD20-expressing cells
- **CD33+ → Gemtuzumab ozogamicin (AML)**: Benefit in CD33+ subset

**Negative Predictive Biomarkers (Resistance/No Benefit)**
- **KRAS mutation → Anti-EGFR mAbs (CRC)**: No benefit, contraindicated
- **EGFR T790M → 1st/2nd-gen TKIs**: Resistance mechanism, use osimertinib
- **RAS/RAF wild-type required → BRAF inhibitors (melanoma)**: Paradoxical MAPK activation

### Diagnostic Biomarkers

**Definition**: Detect or confirm presence of disease

**Infectious Disease**
- **PCR for pathogen DNA/RNA**: SARS-CoV-2, HIV, HCV viral load
- **Antibody titers**: IgM (acute), IgG (prior exposure/immunity)
- **Antigen tests**: Rapid detection (strep, flu, COVID)

**Autoimmune**
- **ANA**: Screen for lupus, connective tissue disease
- **Anti-CCP**: Specific for rheumatoid arthritis
- **Anti-dsDNA**: Lupus, correlates with disease activity
- **ANCA**: Vasculitis (c-ANCA for GPA, p-ANCA for MPA)

**Cancer**
- **PSA**: Prostate cancer screening/monitoring
- **CA 19-9**: Pancreatic cancer, biliary obstruction
- **CEA**: Colorectal cancer monitoring
- **AFP**: Hepatocellular carcinoma, germ cell tumors

### Pharmacodynamic Biomarkers

**Definition**: Assess treatment response or mechanism of action

**Examples**
- **HbA1c**: Glycemic control in diabetes (target <7% typically)
- **LDL cholesterol**: Statin efficacy (target <70 mg/dL in high-risk)
- **Blood pressure**: Antihypertensive efficacy (target <130/80 mmHg)
- **Viral load suppression**: Antiretroviral efficacy (target <20 copies/mL)
- **INR**: Warfarin anticoagulation monitoring (target 2-3 for most indications)

## Genomic Biomarkers

### Mutation Analysis

**Driver Mutations (Oncogenic)**
- **Activating mutations**: Constitutive pathway activation (BRAF V600E, EGFR L858R)
- **Inactivating mutations**: Tumor suppressor loss (TP53, PTEN)
- **Hotspot mutations**: Recurrent positions (KRAS G12/G13, PIK3CA H1047R)
- **Variant allele frequency (VAF)**: Clonality (VAF ≈50% clonal, <10% subclonal)

**Resistance Mutations**
- **EGFR T790M**: Resistance to 1st/2nd-gen TKIs (40-60% of cases)
- **ALK G1202R, I1171N**: Resistance to early ALK inhibitors
- **ESR1 mutations**: Resistance to aromatase inhibitors (breast cancer)
- **RAS mutations**: Acquired resistance to anti-EGFR therapy (CRC)

**Mutation Detection Methods**
- **Tissue NGS**: Comprehensive genomic profiling, 300-500 genes
- **Liquid biopsy**: ctDNA analysis, non-invasive, serial monitoring
- **PCR-based assays**: Targeted hotspot detection, FDA-approved companion diagnostics
- **Allele-specific PCR**: High sensitivity for known mutations (cobas EGFR test)

### Copy Number Variations (CNV)

**Amplifications**
- **HER2 (ERBB2)**: Breast, gastric cancer → trastuzumab, pertuzumab
  - Testing: IHC (0, 1+, 2+, 3+) → FISH if 2+ (HER2/CEP17 ratio ≥2.0)
- **MET amplification**: NSCLC resistance mechanism → crizotinib, capmatinib
  - Cut-point: Gene copy number ≥5, GCN/CEP7 ratio ≥2.0
- **EGFR amplification**: Glioblastoma, some NSCLC
- **FGFR2 amplification**: Gastric cancer → investigational FGFR inhibitors

**Deletions**
- **PTEN loss**: Common in many cancers, predicts PI3K pathway activation
- **RB1 loss**: Small cell transformation, poor prognosis
- **CDKN2A/B deletion**: Cell cycle dysregulation
- **Homozygous deletion**: Complete loss of both alleles (more significant)

**Detection Methods**
- **FISH (Fluorescence In Situ Hybridization)**: HER2, ALK rearrangements
- **NGS copy number calling**: Depth of coverage analysis
- **SNP array**: Genome-wide CNV detection
- **ddPCR**: Quantitative copy number measurement

### Gene Fusions and Rearrangements

**Oncogenic Fusions**
- **ALK fusions** (NSCLC): EML4-ALK most common (60%), 20+ partners
  - Detection: IHC (D5F3 antibody), FISH (break-apart probe), NGS/RNA-seq
- **ROS1 fusions** (NSCLC, glioblastoma): CD74-ROS1, SLC34A2-ROS1, others
- **RET fusions** (NSCLC, thyroid): KIF5B-RET, CCDC6-RET
- **NTRK fusions** (many tumor types, rare): ETV6-NTRK3, others
  - Pan-cancer: Larotrectinib, entrectinib approved across tumor types
- **BCR-ABL** (CML, ALL): t(9;22), Philadelphia chromosome

**Fusion Partner Considerations**
- Partner influences drug sensitivity (EML4-ALK variant 3 more sensitive)
- 5' vs 3' fusion affects detection methods
- Intron breakpoints vary (RNA-seq more comprehensive than DNA panels)

**Detection Methods**
- **FISH break-apart probes**: ALK, ROS1, RET
- **IHC**: ALK protein overexpression (screening), ROS1
- **RT-PCR**: Targeted fusion detection
- **RNA-seq**: Comprehensive fusion detection, identifies novel partners

### Tumor Mutational Burden (TMB)

**Definition**: Number of somatic mutations per megabase of DNA

**Classification**
- **TMB-high**: ≥10 mutations/Mb (some definitions ≥20 mut/Mb)
- **TMB-intermediate**: 6-9 mutations/Mb
- **TMB-low**: <6 mutations/Mb

**Clinical Application**
- **Predictive for immunotherapy**: Higher TMB → more neoantigens → better immune response
- **FDA approval**: Pembrolizumab for TMB-H (≥10 mut/Mb) solid tumors (2020)
- **Limitations**: Not validated in all tumor types, assay variability

**Tumor Types with Typically High TMB**
- Melanoma (median 10-15 mut/Mb)
- NSCLC (especially smoking-associated, 8-12 mut/Mb)
- Urothelial carcinoma (8-10 mut/Mb)
- Microsatellite instable tumors (30-50 mut/Mb)

### Microsatellite Instability (MSI) and Mismatch Repair (MMR)

**Classification**
- **MSI-high (MSI-H)**: Instability at ≥2 of 5 loci or ≥30% of markers
- **MSI-low (MSI-L)**: Instability at <2 of 5 loci
- **Microsatellite stable (MSS)**: No instability

**Mismatch Repair Status**
- **dMMR (deficient)**: Loss of MLH1, MSH2, MSH6, or PMS2 by IHC
- **pMMR (proficient)**: Intact expression of all four MMR proteins

**Clinical Significance**
- **MSI-H/dMMR Tumors**: 3-5% of most solid tumors, 15% of colorectal cancer
- **Immunotherapy Sensitivity**: ORR 30-60% to anti-PD-1 therapy
  - Pembrolizumab FDA-approved for MSI-H/dMMR solid tumors (2017)
  - Nivolumab ± ipilimumab approved
- **Chemotherapy Resistance**: MSI-H CRC does not benefit from 5-FU adjuvant therapy
- **Lynch Syndrome**: Germline MMR mutation if MSI-H + young age + family history

**Testing Algorithm**
```
Colorectal Cancer (all newly diagnosed):
1. IHC for MMR proteins (MLH1, MSH2, MSH6, PMS2)
   ├─ All intact → pMMR (MSS) → Standard chemotherapy if indicated
   │
   └─ Loss of one or more → dMMR (likely MSI-H)
      └─ Reflex MLH1 promoter hypermethylation test
         ├─ Methylated → Sporadic MSI-H, immunotherapy option
         └─ Unmethylated → Germline testing for Lynch syndrome
```

## Expression Biomarkers

### Immunohistochemistry (IHC)

**PD-L1 Expression (Immune Checkpoint)**
- **Assays**: 22C3 (FDA), 28-8, SP263, SP142 (some differences in scoring)
- **Scoring**: Tumor Proportion Score (TPS) = % tumor cells with membrane staining
  - TPS <1%: Low/negative
  - TPS 1-49%: Intermediate
  - TPS ≥50%: High
- **Combined Positive Score (CPS)**: (PD-L1+ tumor + immune cells) / total tumor cells × 100
  - Used for some indications (e.g., CPS ≥10 for pembrolizumab in HNSCC)

**Hormone Receptors (Breast Cancer)**
- **ER/PR Positivity**: ≥1% nuclear staining by IHC (ASCO/CAP guidelines)
  - Allred Score 0-8 (proportion + intensity) - historical
  - H-score 0-300 (percentage at each intensity) - quantitative
- **Clinical Cut-Points**:
  - ER ≥1%: Endocrine therapy indicated
  - ER 1-10%: "Low positive," may have lower benefit
  - PR loss with ER+: Possible endocrine resistance

**HER2 Testing (Breast/Gastric Cancer)**
```
IHC Initial Test:
├─ 0 or 1+: HER2-negative (no further testing)
│
├─ 2+: Equivocal → Reflex FISH testing
│  ├─ FISH+ (HER2/CEP17 ratio ≥2.0 OR HER2 copies ≥6/cell) → HER2-positive
│  └─ FISH- → HER2-negative
│
└─ 3+: HER2-positive (no FISH needed)
   └─ Uniform intense complete membrane staining in >10% of tumor cells

HER2-positive: Trastuzumab-based therapy indicated
HER2-low (IHC 1+ or 2+/FISH-): Trastuzumab deruxtecan eligibility (2022)
```

### RNA Expression Analysis

**Gene Expression Signatures (Breast Cancer)**

**Oncotype DX (21-gene assay)**
- **Recurrence Score (RS)**: 0-100
  - RS <26: Low risk → Endocrine therapy alone (most patients)
  - RS 26-100: High risk → Chemotherapy + endocrine therapy
- **Population**: ER+/HER2-, node-negative or 1-3 positive nodes
- **Evidence**: TAILORx trial (N=10,273) validated RS <26 can omit chemo

**MammaPrint (70-gene assay)**
- **Result**: High risk vs Low risk (binary)
- **Population**: Early-stage breast cancer, ER+/HER2-
- **Evidence**: MINDACT trial validated low-risk can omit chemo

**Prosigna (PAM50)**
- **Result**: Risk of Recurrence (ROR) score + intrinsic subtype
- **Subtypes**: Luminal A, Luminal B, HER2-enriched, Basal-like
- **Application**: Post-menopausal, ER+, node-negative or 1-3 nodes

**RNA-Seq for Fusion Detection**
- **Advantage**: Detects novel fusion partners, quantifies expression
- **Application**: NTRK fusions (rare, many partners), RET fusions
- **Limitation**: Requires fresh/frozen tissue or good-quality FFPE RNA

## Molecular Subtypes

### Glioblastoma (GBM) Molecular Classification

**Verhaak 2010 Classification (4 subtypes)**

**Proneural Subtype**
- **Characteristics**: PDGFRA amplification, IDH1 mutations (secondary GBM), TP53 mutations
- **Age**: Younger patients typically
- **Prognosis**: Better prognosis (median OS 15-18 months)
- **Treatment**: May benefit from bevacizumab less than other subtypes

**Neural Subtype**
- **Characteristics**: Neuron markers (NEFL, GABRA1, SYT1, SLC12A5)
- **Controversy**: May represent normal brain contamination
- **Prognosis**: Intermediate
- **Treatment**: Standard temozolomide-based therapy

**Classical Subtype**
- **Characteristics**: EGFR amplification (97%), chromosome 7 gain, chromosome 10 loss
- **Association**: Lacks TP53, PDGFRA, NF1 mutations
- **Prognosis**: Intermediate
- **Treatment**: May benefit from EGFR inhibitors (investigational)

**Mesenchymal Subtype**
- **Characteristics**: NF1 mutations/deletions, high expression of mesenchymal markers (CHI3L1/YKL-40)
- **Immune Features**: Higher macrophage/microglia infiltration
- **Subgroup**: Mesenchymal-immune-active (high immune signature)
- **Prognosis**: Poor prognosis (median OS 12-13 months)
- **Treatment**: May respond better to anti-angiogenic therapy, immunotherapy investigational

**Clinical Application**
```
GBM Molecular Subtyping Report:

Patient Cohort: Mesenchymal-Immune-Active Subtype (n=15)

Molecular Features:
- NF1 alterations: 73% (11/15)
- High YKL-40 expression: 100% (15/15)
- Immune gene signature: Elevated (median z-score +2.3)
- CD163+ macrophages: High density (median 180/mm²)

Treatment Implications:
- Standard therapy: Temozolomide-based (Stupp protocol)
- Consider: Bevacizumab for recurrent disease (may have enhanced benefit)
- Clinical trial: Immune checkpoint inhibitors ± anti-angiogenic therapy
- Prognosis: Median OS 12-14 months (worse than proneural)

Recommendation:
Enroll in combination immunotherapy trial if eligible, otherwise standard therapy
with early consideration of bevacizumab at progression.
```

### Breast Cancer Intrinsic Subtypes

**PAM50-Based Classification**

**Luminal A**
- **Characteristics**: ER+, HER2-, low proliferation (Ki-67 <20%)
- **Gene signature**: High ER-related genes, low proliferation genes
- **Prognosis**: Best prognosis, low recurrence risk
- **Treatment**: Endocrine therapy alone usually sufficient
- **Chemotherapy**: Rarely needed unless high-risk features

**Luminal B**
- **Characteristics**: ER+, HER2- or HER2+, high proliferation (Ki-67 ≥20%)
- **Subtypes**: Luminal B (HER2-) and Luminal B (HER2+)
- **Prognosis**: Intermediate prognosis
- **Treatment**: Chemotherapy + endocrine therapy; add trastuzumab if HER2+

**HER2-Enriched**
- **Characteristics**: HER2+, ER-, PR-
- **Gene signature**: High HER2 and proliferation genes, low ER genes
- **Prognosis**: Poor if untreated, good with HER2-targeted therapy
- **Treatment**: Chemotherapy + trastuzumab + pertuzumab

**Basal-Like**
- **Characteristics**: ER-, PR-, HER2- (triple-negative), high proliferation
- **Gene signature**: Basal cytokeratins (CK5/6, CK17), EGFR
- **Overlap**: 80% concordance with TNBC, but not identical
- **Prognosis**: Aggressive, high early recurrence risk
- **Treatment**: Chemotherapy (platinum, anthracycline), PARP inhibitors if BRCA-mutated
- **Immunotherapy**: PD-L1+ may benefit from pembrolizumab + chemotherapy

### Colorectal Cancer Consensus Molecular Subtypes (CMS)

**CMS1 (14%): MSI Immune**
- **Features**: MSI-high, BRAF mutations, strong immune activation
- **Prognosis**: Poor survival after relapse despite immune infiltration
- **Treatment**: Immunotherapy highly effective, 5-FU chemotherapy ineffective

**CMS2 (37%): Canonical**
- **Features**: Epithelial, marked WNT and MYC activation
- **Prognosis**: Better survival
- **Treatment**: Benefits from adjuvant chemotherapy

**CMS3 (13%): Metabolic**
- **Features**: Metabolic dysregulation, KRAS mutations
- **Prognosis**: Intermediate survival
- **Treatment**: May benefit from targeted metabolic therapies (investigational)

**CMS4 (23%): Mesenchymal**
- **Features**: Stromal infiltration, TGF-β activation, angiogenesis
- **Prognosis**: Worst survival, often diagnosed at advanced stage
- **Treatment**: May benefit from anti-angiogenic therapy (bevacizumab)

## Companion Diagnostics

### FDA-Approved Biomarker-Drug Pairs

**Required Testing (Label Indication)**
```
Biomarker                Drug(s)                     Indication              Assay
EGFR exon 19 del/L858R  Osimertinib                NSCLC                   cobas EGFR v2, NGS
ALK rearrangement       Alectinib, brigatinib      NSCLC                   Vysis ALK FISH, IHC (D5F3)
BRAF V600E              Vemurafenib, dabrafenib    Melanoma, NSCLC         THxID BRAF, cobas BRAF
HER2 amplification      Trastuzumab, pertuzumab    Breast, gastric         HercepTest IHC, FISH
ROS1 rearrangement      Crizotinib, entrectinib    NSCLC                   FISH, NGS
PD-L1 ≥50% TPS          Pembrolizumab (mono)       NSCLC first-line        22C3 pharmDx
MSI-H/dMMR              Pembrolizumab              Any solid tumor         IHC (MMR), PCR (MSI)
NTRK fusion             Larotrectinib, entrectinib Pan-cancer              FoundationOne CDx
BRCA1/2 mutations       Olaparib, talazoparib      Breast, ovarian, prostate BRACAnalysis CDx
```

### Complementary Diagnostics (Informative, Not Required)

- **PD-L1 1-49%**: Informs combination vs monotherapy choice
- **TMB-high**: May predict immunotherapy benefit (not FDA-approved indication)
- **STK11/KEAP1 mutations**: Associated with immunotherapy resistance
- **Homologous recombination deficiency (HRD)**: Predicts PARP inhibitor benefit

## Clinical Actionability Frameworks

### OncoKB Levels of Evidence (Memorial Sloan Kettering)

**Level 1: FDA-Approved**
- Biomarker-drug pair with FDA approval in specific tumor type
- Example: EGFR L858R → osimertinib in NSCLC

**Level 2: Standard Care Off-Label**
- Biomarker-drug in professional guidelines for specific tumor type (not FDA-approved for biomarker)
- Example: BRAF V600E → dabrafenib + trametinib in CRC (NCCN-recommended)

**Level 3: Clinical Evidence**
- Clinical trial evidence supporting biomarker-drug association
- 3A: Compelling clinical evidence
- 3B: Standard care for different tumor type or investigational

**Level 4: Biological Evidence**
- Preclinical evidence only (cell lines, mouse models)
- 4: Biological evidence supporting association

**Level R1-R2: Resistance**
- R1: Standard care associated with resistance
- R2: Investigational or preclinical resistance evidence

### CIViC (Clinical Interpretation of Variants in Cancer)

**Evidence Levels**
- **A**: Validated in clinical practice or validated by regulatory association
- **B**: Clinical trial or other primary patient data supporting association
- **C**: Case study with molecular analysis
- **D**: Preclinical evidence (cell culture, animal models)
- **E**: Inferential association (literature review, expert opinion)

**Clinical Significance Tiers**
- **Tier I**: Variants with strong clinical significance (predictive, diagnostic, prognostic in professional guidelines)
- **Tier II**: Variants with potential clinical significance (clinical trial or case study evidence)
- **Tier III**: Variants with uncertain significance
- **Tier IV**: Benign or likely benign variants

## Multi-Biomarker Panels

### Comprehensive Genomic Profiling (CGP)

**FoundationOne CDx**
- **Genes**: 324 genes (SNVs, indels, CNVs, rearrangements)
- **Additional**: TMB, MSI status
- **FDA-Approved**: Companion diagnostic for 18+ targeted therapies
- **Turnaround**: 10-14 days
- **Tissue**: FFPE, 40 unstained slides or tissue block

**Guardant360 CDx (Liquid Biopsy)**
- **Genes**: 74 genes in cell-free DNA (cfDNA)
- **Sample**: 2 tubes of blood (20 mL total)
- **FDA-Approved**: Companion diagnostic for osimertinib (EGFR), NSCLC
- **Application**: Non-invasive, serial monitoring, when tissue unavailable
- **Limitation**: Lower sensitivity than tissue (especially for low tumor burden)

**Tempus xT**
- **Genes**: 648 genes (DNA) + whole transcriptome (RNA)
- **Advantage**: RNA detects fusions, expression signatures
- **Application**: Research and clinical use
- **Not FDA-Approved**: Not a companion diagnostic currently

### Testing Recommendations by Tumor Type

**NSCLC (NCCN Guidelines)**
```
Broad molecular profiling for all advanced NSCLC at diagnosis:

Required (FDA-approved therapies available):
✓ EGFR mutations (exons 18, 19, 20, 21)
✓ ALK rearrangement
✓ ROS1 rearrangement  
✓ BRAF V600E
✓ MET exon 14 skipping
✓ RET rearrangements
✓ NTRK fusions
✓ KRAS G12C
✓ PD-L1 IHC

Recommended (to inform treatment strategy):
✓ Comprehensive NGS panel (captures all above + emerging targets)
✓ Consider liquid biopsy if tissue insufficient

At progression on targeted therapy:
✓ Repeat tissue biopsy or liquid biopsy for resistance mechanisms
✓ Examples: EGFR T790M, ALK resistance mutations, MET amplification
```

**Metastatic Colorectal Cancer**
```
Required before anti-EGFR therapy (cetuximab, panitumumab):
✓ RAS testing (KRAS exons 2, 3, 4; NRAS exons 2, 3, 4)
  └─ RAS mutation → Do NOT use anti-EGFR therapy (resistance)
✓ BRAF V600E
  └─ If BRAF V600E+ → Consider encorafenib + cetuximab + binimetinib

Recommended for all metastatic CRC:
✓ MSI/MMR testing (immunotherapy indication)
✓ HER2 amplification (investigational trastuzumab-based therapy if RAS/BRAF WT)
✓ NTRK fusions (rare, <1%, but actionable)

Left-sided vs Right-sided:
- Left-sided (descending, sigmoid, rectum): Better prognosis, anti-EGFR more effective
- Right-sided (cecum, ascending): Worse prognosis, anti-EGFR less effective, consider bevacizumab
```

**Melanoma**
```
All advanced melanoma:
✓ BRAF V600 mutation (30-50% of cutaneous melanoma)
  └─ If BRAF V600E/K → Dabrafenib + trametinib or vemurafenib + cobimetinib
✓ NRAS mutation (20-30%)
  └─ No targeted therapy approved, consider MEK inhibitor trials
✓ KIT mutations (mucosal, acral, chronic sun-damaged melanoma)
  └─ If KIT exon 11 or 13 mutation → Imatinib (off-label)
✓ PD-L1 (optional, not required for immunotherapy eligibility)

Note: Uveal melanoma has different biology (GNAQ, GNA11 mutations)
```

## Biomarker Cut-Points and Thresholds

### Establishing Clinical Cut-Points

**Methods for Cut-Point Determination**

**Data-Driven Approaches**
- **Median split**: Simple but arbitrary, may not be optimal
- **Tertiles/quartiles**: Categorizes into 3-4 groups
- **ROC curve analysis**: Maximizes sensitivity and specificity
- **Maximally selected rank statistics**: Finds optimal prognostic cut-point
- **Validation required**: Independent cohort confirmation essential

**Biologically Informed**
- **Detection limit**: Assay lower limit of quantification
- **Mechanism-based**: Threshold for pathway activation
- **Pharmacodynamic**: Threshold for target engagement
- **Normal range**: Comparison to healthy individuals

**Clinically Defined**
- **Guideline-recommended**: Established by professional societies
- **Regulatory-approved**: FDA-specified threshold for companion diagnostic
- **Trial-defined**: Cut-point used in pivotal clinical trial

**PD-L1 Example**
- **Cut-points**: 1%, 5%, 10%, 50% TPS used in different trials
- **Context-dependent**: Varies by drug, disease, line of therapy
- **≥50%**: Pembrolizumab monotherapy (KEYNOTE-024)
- **≥1%**: Atezolizumab combinations, broader population

### Continuous vs Categorical

**Continuous Analysis Advantages**
- Preserves information (no dichotomization loss)
- Statistical power maintained
- Can assess dose-response relationship
- HR per unit increase or per standard deviation

**Categorical Analysis Advantages**
- Clinically interpretable (high vs low)
- Facilitates treatment decisions (binary: use targeted therapy yes/no)
- Aligns with regulatory approvals (biomarker-positive = eligible)

**Best Practice**: Report both continuous and categorical analyses
- Cox model with continuous biomarker
- Stratified analysis by clinically relevant cut-point
- Subgroup analysis to confirm consistency

## Germline vs Somatic Testing

### Germline (Inherited) Mutations

**Indications for Germline Testing**
- **Cancer predisposition syndromes**: BRCA1/2, Lynch syndrome (MLH1, MSH2), Li-Fraumeni (TP53)
- **Family history**: Multiple affected relatives, young age at diagnosis
- **Tumor features**: MSI-H in young patient, triple-negative breast cancer <60 years
- **Treatment implications**: PARP inhibitors for BRCA-mutated (germline or somatic)

**Common Hereditary Cancer Syndromes**
- **BRCA1/2**: Breast, ovarian, pancreatic, prostate cancer
  - Testing: All ovarian cancer, TNBC <60 years, male breast cancer
  - Treatment: PARP inhibitors (olaparib, talazoparib)
  - Prevention: Prophylactic mastectomy, oophorectomy (risk-reducing)
- **Lynch syndrome (MLH1, MSH2, MSH6, PMS2)**: Colorectal, endometrial, ovarian, gastric
  - Testing: MSI-H/dMMR tumors, Amsterdam II criteria families
  - Surveillance: Colonoscopy every 1-2 years starting age 20-25
- **Li-Fraumeni (TP53)**: Diverse cancers at young age
- **PTEN (Cowden syndrome)**: Breast, thyroid, endometrial cancer

**Genetic Counseling**
- Pre-test counseling: Implications for patient and family
- Post-test counseling: Management, surveillance, family testing
- Informed consent: Genetic discrimination concerns (GINA protections)

### Somatic (Tumor-Only) Testing

**Tumor Tissue Testing**
- Detects mutations present in cancer cells only (not inherited)
- Most cancer driver mutations are somatic (KRAS, EGFR in lung cancer)
- No implications for family members
- Guides therapy selection

**Distinguishing Germline from Somatic**
- **Variant allele frequency**: Germline ~50% (heterozygous) or ~100% (homozygous); somatic variable
- **Matched normal**: Paired tumor-normal sequencing definitive
- **Databases**: Germline variant databases (gnomAD, ClinVar)
- **Reflex germline testing**: Trigger testing if pathogenic germline variant suspected

## Reporting Biomarker Results

### Structured Report Template

```
MOLECULAR PROFILING REPORT

Patient: [De-identified ID]
Tumor Type: Non-Small Cell Lung Adenocarcinoma
Specimen: Lung biopsy (left upper lobe)
Testing Date: [Date]
Report Date: [Date]

METHODOLOGY
- Assay: FoundationOne CDx (comprehensive genomic profiling)
- Specimen Type: Formalin-fixed paraffin-embedded (FFPE)
- Tumor Content: 40% (adequate for testing)

RESULTS SUMMARY
Biomarkers Detected: 4
- 1 FDA-approved therapy target
- 1 prognostic biomarker
- 2 variants of uncertain significance

ACTIONABLE FINDINGS

Tier 1: FDA-Approved Targeted Therapy Available
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EGFR Exon 19 Deletion (p.E746_A750del)
  Variant Allele Frequency: 42%
  Clinical Significance: Sensitizing mutation
  FDA-Approved Therapy: Osimertinib (Tagrisso) 80 mg daily
  Evidence: FLAURA trial - median PFS 18.9 vs 10.2 months (HR 0.46, p<0.001)
  Guideline: NCCN Category 1 preferred first-line
  Recommendation: Strong recommendation for EGFR TKI therapy (GRADE 1A)

Tier 2: Prognostic Biomarker
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TP53 Mutation (p.R273H)
  Variant Allele Frequency: 85%
  Clinical Significance: Poor prognostic marker, no targeted therapy
  Implication: Associated with worse survival, does not impact first-line treatment selection

BIOMARKERS ASSESSED - NEGATIVE
- ALK rearrangement: Not detected
- ROS1 rearrangement: Not detected  
- BRAF V600E: Not detected
- MET exon 14 skipping: Not detected
- RET rearrangement: Not detected
- KRAS mutation: Not detected
- PD-L1 IHC: Separate report (TPS 30%)

TUMOR MUTATIONAL BURDEN: 8 mutations/Mb (Intermediate)
- Interpretation: Below threshold for TMB-high designation (≥10 mut/Mb)
- Clinical relevance: May still benefit from immunotherapy combinations

MICROSATELLITE STATUS: Stable (MSS)

CLINICAL RECOMMENDATIONS

Primary Recommendation:
First-line therapy with osimertinib 80 mg PO daily until progression or unacceptable toxicity.

Monitoring:
- CT imaging every 6 weeks for first 12 weeks, then every 9 weeks
- At progression, repeat tissue or liquid biopsy for resistance mechanisms (T790M, C797S, MET amplification)

Alternative Options:
- Clinical trial enrollment for novel EGFR TKI combinations
- Erlotinib or afatinib (second-line for osimertinib if used first-line)

References:
1. Soria JC, et al. Osimertinib in Untreated EGFR-Mutated Advanced NSCLC. NEJM 2018.
2. NCCN Guidelines for Non-Small Cell Lung Cancer v4.2024.

Report Prepared By: [Lab Name]
Medical Director: [Name, MD, PhD]
CLIA #: [Number]  |  CAP #: [Number]
```

## Quality Assurance

### Analytical Validation

- **Sensitivity**: Minimum 5-10% variant allele frequency detection
- **Specificity**: <1% false positive rate
- **Reproducibility**: >95% concordance between replicates
- **Accuracy**: >99% concordance with validated orthogonal method
- **Turnaround time**: Median time from sample receipt to report

### Clinical Validation

- **Positive Predictive Value**: % biomarker+ patients who respond to therapy
- **Negative Predictive Value**: % biomarker- patients who do not respond
- **Clinical Utility**: Does testing improve patient outcomes?
- **Cost-Effectiveness**: QALY gained vs cost of testing and treatment

### Proficiency Testing

- CAP/CLIA proficiency testing for clinical labs
- Participate in external quality assurance schemes
- Blinded sample exchange with reference laboratories
- Document corrective actions for failures

