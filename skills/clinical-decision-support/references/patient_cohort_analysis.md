# Patient Cohort Analysis Guide

## Overview

Patient cohort analysis involves systematically studying groups of patients to identify patterns, compare outcomes, and derive clinical insights. In pharmaceutical and clinical research settings, cohort analysis is essential for understanding treatment effectiveness, biomarker correlations, and patient stratification.

## Patient Stratification Methods

### Biomarker-Based Stratification

**Genomic Biomarkers**
- **Mutations**: Driver mutations (EGFR, KRAS, BRAF), resistance mutations (T790M)
- **Copy Number Variations**: Amplifications (HER2, MET), deletions (PTEN, RB1)
- **Gene Fusions**: ALK, ROS1, NTRK, RET rearrangements
- **Tumor Mutational Burden (TMB)**: High (≥10 mut/Mb) vs low TMB
- **Microsatellite Instability**: MSI-high vs MSS/MSI-low

**Expression Biomarkers**
- **IHC Scores**: PD-L1 TPS (<1%, 1-49%, ≥50%), HER2 (0, 1+, 2+, 3+)
- **RNA Expression**: Gene signatures, pathway activity scores
- **Protein Levels**: Ki-67 proliferation index, hormone receptors (ER/PR)

**Molecular Subtypes**
- **Breast Cancer**: Luminal A, Luminal B, HER2-enriched, Triple-negative
- **Glioblastoma**: Proneural, neural, classical, mesenchymal
- **Lung Adenocarcinoma**: Terminal respiratory unit, proximal inflammatory, proximal proliferative
- **Colorectal Cancer**: CMS1-4 (consensus molecular subtypes)

### Demographic Stratification

- **Age Groups**: Pediatric (<18), young adult (18-39), middle-age (40-64), elderly (65-79), very elderly (≥80)
- **Sex/Gender**: Male, female, sex-specific biomarkers
- **Race/Ethnicity**: FDA-recognized categories, ancestry-informative markers
- **Geographic Location**: Regional variation in disease prevalence

### Clinical Stratification

**Disease Characteristics**
- **Stage**: TNM staging (I, II, III, IV), Ann Arbor (lymphoma)
- **Grade**: Well-differentiated (G1), moderately differentiated (G2), poorly differentiated (G3), undifferentiated (G4)
- **Histology**: Adenocarcinoma vs squamous vs other subtypes
- **Disease Burden**: Tumor volume, number of lesions, organ involvement

**Patient Status**
- **Performance Status**: ECOG (0-4), Karnofsky (0-100)
- **Comorbidities**: Charlson Comorbidity Index, organ dysfunction
- **Prior Treatment**: Treatment-naïve, previously treated, lines of therapy
- **Response to Prior Therapy**: Responders vs non-responders, progressive disease

### Risk Stratification

**Prognostic Scores**
- **Cancer**: AJCC staging, Gleason score, Nottingham grade
- **Cardiovascular**: Framingham risk, TIMI, GRACE, CHADS2-VASc
- **Liver Disease**: Child-Pugh class, MELD score
- **Renal Disease**: eGFR categories, albuminuria stages

**Composite Risk Models**
- Low risk: Good prognosis, less aggressive treatment
- Intermediate risk: Moderate prognosis, standard treatment
- High risk: Poor prognosis, intensive treatment or clinical trials

## Cluster Analysis and Subgroup Identification

### Unsupervised Clustering

**Methods**
- **K-means**: Partition-based clustering with pre-defined number of clusters
- **Hierarchical Clustering**: Agglomerative or divisive, creates dendrogram
- **DBSCAN**: Density-based clustering, identifies outliers
- **Consensus Clustering**: Robust cluster identification across multiple runs

**Applications**
- Molecular subtype discovery (e.g., GBM mesenchymal-immune-active cluster)
- Patient phenotype identification
- Treatment response patterns
- Multi-omic data integration

### Supervised Classification

**Approaches**
- **Pre-defined Criteria**: Clinical guidelines, established biomarker cut-points
- **Machine Learning**: Random forests, support vector machines for prediction
- **Neural Networks**: Deep learning for complex pattern recognition
- **Validated Signatures**: Published gene expression panels (Oncotype DX, MammaPrint)

### Validation Requirements

- **Internal Validation**: Cross-validation, bootstrap resampling
- **External Validation**: Independent cohort confirmation
- **Clinical Validation**: Prospective trial confirmation of utility
- **Analytical Validation**: Assay reproducibility, inter-lab concordance

## Outcome Metrics

### Survival Endpoints

**Overall Survival (OS)**
- Definition: Time from treatment start (or randomization) to death from any cause
- Censoring: Last known alive date for patients lost to follow-up
- Reporting: Median OS, 1-year/2-year/5-year OS rates, hazard ratio
- Gold Standard: Primary endpoint for regulatory approval

**Progression-Free Survival (PFS)**
- Definition: Time from treatment start to disease progression or death
- Assessment: RECIST v1.1, iRECIST (for immunotherapy)
- Advantages: Earlier readout than OS, direct measure of treatment benefit
- Limitations: Requires imaging, subject to assessment timing

**Disease-Free Survival (DFS)**
- Definition: Time from complete response to recurrence or death (adjuvant setting)
- Application: Post-surgery, post-curative treatment
- Synonyms: Recurrence-free survival (RFS), event-free survival (EFS)

### Response Endpoints

**Objective Response Rate (ORR)**
- Definition: Proportion achieving complete response (CR) or partial response (PR)
- Measurement: RECIST v1.1 criteria (≥30% tumor shrinkage for PR)
- Reporting: ORR with 95% confidence interval
- Advantage: Earlier endpoint than survival

**Duration of Response (DOR)**
- Definition: Time from first response (CR/PR) to progression
- Population: Responders only
- Clinical Relevance: Durability of treatment benefit
- Reporting: Median DOR among responders

**Disease Control Rate (DCR)**
- Definition: CR + PR + stable disease (SD)
- Threshold: SD must persist ≥6-8 weeks typically
- Application: Less stringent than ORR, captures clinical benefit

### Quality of Life and Functional Status

**Performance Status**
- **ECOG Scale**: 0 (fully active) to 4 (bedridden)
- **Karnofsky Scale**: 100% (normal) to 0% (dead)
- **Assessment Frequency**: Baseline and each cycle

**Patient-Reported Outcomes (PROs)**
- **Symptom Scales**: EORTC QLQ-C30, FACT-G
- **Disease-Specific**: FACT-L (lung), FACT-B (breast)
- **Toxicity**: PRO-CTCAE for adverse events
- **Reporting**: Change from baseline, clinically meaningful differences

### Safety and Tolerability

**Adverse Events (AEs)**
- **Grading**: CTCAE v5.0 (Grade 1-5)
- **Attribution**: Related vs unrelated to treatment
- **Serious AEs (SAEs)**: Death, life-threatening, hospitalization, disability
- **Reporting**: Incidence, severity, time to onset, resolution

**Treatment Modifications**
- **Dose Reductions**: Proportion requiring dose decrease
- **Dose Delays**: Treatment interruptions, cycle delays
- **Discontinuations**: Treatment termination due to toxicity
- **Relative Dose Intensity**: Actual dose / planned dose ratio

## Statistical Methods for Group Comparisons

### Continuous Variables

**Parametric Tests (Normal Distribution)**
- **Two Groups**: Independent t-test, paired t-test
- **Multiple Groups**: ANOVA (analysis of variance), repeated measures ANOVA
- **Reporting**: Mean ± SD, mean difference with 95% CI, p-value

**Non-Parametric Tests (Non-Normal Distribution)**
- **Two Groups**: Mann-Whitney U test (Wilcoxon rank-sum)
- **Paired Data**: Wilcoxon signed-rank test
- **Multiple Groups**: Kruskal-Wallis test
- **Reporting**: Median [IQR], median difference, p-value

### Categorical Variables

**Chi-Square Test**
- **Application**: Compare proportions between ≥2 groups
- **Assumptions**: Expected count ≥5 in each cell
- **Reporting**: Proportions, chi-square statistic, df, p-value

**Fisher's Exact Test**
- **Application**: 2x2 tables with small sample sizes (expected count <5)
- **Advantage**: Exact p-value, no large-sample approximation
- **Limitation**: Computationally intensive for large tables

### Survival Analysis

**Kaplan-Meier Method**
- **Application**: Estimate survival curves with censored data
- **Output**: Survival probability at each time point, median survival
- **Visualization**: Step function curves with 95% CI bands

**Log-Rank Test**
- **Application**: Compare survival curves between groups
- **Null Hypothesis**: No difference in survival distributions
- **Reporting**: Chi-square statistic, df, p-value
- **Limitation**: Assumes proportional hazards

**Cox Proportional Hazards Model**
- **Application**: Multivariable survival analysis
- **Output**: Hazard ratio (HR) with 95% CI for each covariate
- **Interpretation**: HR > 1 (increased risk), HR < 1 (decreased risk)
- **Assumptions**: Proportional hazards (test with Schoenfeld residuals)

### Effect Sizes

**Hazard Ratio (HR)**
- Definition: Ratio of hazard rates between groups
- Interpretation: HR = 0.5 means 50% reduction in risk
- Reporting: HR (95% CI), p-value
- Example: HR = 0.65 (0.52-0.81), p<0.001

**Odds Ratio (OR)**
- Application: Case-control studies, logistic regression
- Interpretation: OR > 1 (increased odds), OR < 1 (decreased odds)
- Reporting: OR (95% CI), p-value

**Risk Ratio (RR) / Relative Risk**
- Application: Cohort studies, clinical trials
- Interpretation: RR = 2.0 means 2-fold increased risk
- More intuitive than OR for interpreting probabilities

### Multiple Testing Corrections

**Bonferroni Correction**
- Method: Divide α by number of tests (α/n)
- Example: 5 tests → significance threshold = 0.05/5 = 0.01
- Conservative: Reduces Type I error but increases Type II error

**False Discovery Rate (FDR)**
- Method: Benjamini-Hochberg procedure
- Interpretation: Expected proportion of false positives among significant results
- Less Conservative: More power than Bonferroni

**Family-Wise Error Rate (FWER)**
- Method: Control probability of any false positive
- Application: When even one false positive is problematic
- Examples: Bonferroni, Holm-Bonferroni

## Biomarker Correlation with Outcomes

### Predictive Biomarkers

**Definition**: Biomarkers that identify patients likely to respond to a specific treatment

**Examples**
- **PD-L1 ≥50%**: Predicts response to pembrolizumab monotherapy (NSCLC)
- **HER2 3+**: Predicts response to trastuzumab (breast cancer)
- **EGFR mutations**: Predicts response to EGFR TKIs (lung cancer)
- **BRAF V600E**: Predicts response to vemurafenib (melanoma)
- **MSI-H/dMMR**: Predicts response to immune checkpoint inhibitors

**Analysis**
- Stratified analysis: Compare treatment effect within biomarker-positive vs negative
- Interaction test: Test if treatment effect differs by biomarker status
- Reporting: HR in biomarker+ vs biomarker-, interaction p-value

### Prognostic Biomarkers

**Definition**: Biomarkers that predict outcome regardless of treatment

**Examples**
- **High Ki-67**: Poor prognosis independent of treatment (breast cancer)
- **TP53 mutation**: Poor prognosis in many cancers
- **Low albumin**: Poor prognosis marker (many diseases)
- **Elevated LDH**: Poor prognosis (melanoma, lymphoma)

**Analysis**
- Compare outcomes across biomarker levels in untreated or uniformly treated cohort
- Multivariable Cox model adjusting for other prognostic factors
- Validate in independent cohorts

### Continuous Biomarker Analysis

**Cut-Point Selection**
- **Data-Driven**: Maximally selected rank statistics, ROC curve analysis
- **Literature-Based**: Established clinical cut-points
- **Median/Tertiles**: Simple divisions for exploration
- **Validation**: Cut-points must be validated in independent cohort

**Continuous Analysis**
- Treat biomarker as continuous variable in Cox model
- Report HR per unit increase or per standard deviation
- Spline curves to assess non-linear relationships
- Advantage: No information loss from dichotomization

## Data Presentation

### Baseline Characteristics Table (Table 1)

**Standard Format**
```
Characteristic              Group A (n=50)  Group B (n=45)  p-value
Age, years (median [IQR])   62 [54-68]     59 [52-66]      0.34
Sex, n (%)
  Male                      30 (60%)       28 (62%)        0.82
  Female                    20 (40%)       17 (38%)
ECOG PS, n (%)
  0-1                       42 (84%)       39 (87%)        0.71
  2                         8 (16%)        6 (13%)
Biomarker+, n (%)           23 (46%)       21 (47%)        0.94
```

**Key Principles**
- Report all clinically relevant baseline variables
- Use appropriate summary statistics (mean±SD for normal, median[IQR] for skewed)
- Include sample size for each group
- Report p-values for group comparisons (but baseline imbalances expected by chance)
- Do NOT adjust baseline p-values for multiple testing

### Efficacy Outcomes Table

**Response Outcomes**
```
Outcome                     Group A (n=50)    Group B (n=45)    p-value
ORR, n (%) [95% CI]         25 (50%) [36-64]  15 (33%) [20-48]  0.08
  Complete Response         3 (6%)            1 (2%)
  Partial Response          22 (44%)          14 (31%)
DCR, n (%) [95% CI]         40 (80%) [66-90]  35 (78%) [63-89]  0.79
Median DOR, months (95% CI) 8.2 (6.1-11.3)    6.8 (4.9-9.7)     0.12
```

**Survival Outcomes**
```
Endpoint                    Group A         Group B         HR (95% CI)    p-value
Median PFS, months (95% CI) 10.2 (8.3-12.1) 6.5 (5.1-7.9)  0.62 (0.41-0.94) 0.02
12-month PFS rate           42%             28%
Median OS, months (95% CI)  21.3 (17.8-NR)  15.7 (12.4-19.1) 0.71 (0.45-1.12) 0.14
12-month OS rate            68%             58%
```

### Safety and Tolerability Table

**Adverse Events**
```
Adverse Event              Any Grade, n (%)  Grade 3-4, n (%)
                           Group A  Group B   Group A  Group B
Fatigue                    35 (70%) 32 (71%)  3 (6%)   2 (4%)
Nausea                     28 (56%) 25 (56%)  1 (2%)   1 (2%)
Neutropenia                15 (30%) 18 (40%)  8 (16%)  10 (22%)
Thrombocytopenia           12 (24%) 14 (31%)  4 (8%)   6 (13%)
Hepatotoxicity             8 (16%)  6 (13%)   2 (4%)   1 (2%)
Treatment discontinuation  6 (12%)  8 (18%)   -        -
```

### Visualization Formats

**Survival Curves**
- Kaplan-Meier plots with 95% CI bands
- Number at risk table below x-axis
- Log-rank p-value and HR prominently displayed
- Clear legend identifying groups

**Forest Plots**
- Subgroup analysis showing HR with 95% CI for each subgroup
- Test for interaction assessing heterogeneity
- Overall effect at bottom

**Waterfall Plots**
- Individual patient best response (% change from baseline)
- Ordered from best to worst response
- Color-coded by response category (CR, PR, SD, PD)
- Biomarker status annotation

**Swimmer Plots**
- Time on treatment for each patient
- Response duration for responders
- Treatment modifications marked
- Ongoing treatments indicated with arrow

## Quality Control and Validation

### Data Quality Checks

- **Completeness**: Missing data patterns, loss to follow-up
- **Consistency**: Cross-field validation, logical checks
- **Outliers**: Identify and investigate extreme values
- **Duplicates**: Patient ID verification, enrollment checks

### Statistical Assumptions

- **Normality**: Shapiro-Wilk test, Q-Q plots for continuous variables
- **Proportional Hazards**: Schoenfeld residuals for Cox models
- **Independence**: Check for clustering, matched data
- **Missing Data**: Assess mechanism (MCAR, MAR, NMAR), handle appropriately

### Reporting Standards

- **CONSORT**: Randomized controlled trials
- **STROBE**: Observational studies  
- **REMARK**: Tumor marker prognostic studies
- **STARD**: Diagnostic accuracy studies
- **TRIPOD**: Prediction model development/validation

## Clinical Interpretation

### Translating Statistics to Clinical Meaning

**Statistical Significance vs Clinical Significance**
- p<0.05 does not guarantee clinical importance
- Small effects can be statistically significant with large samples
- Large effects can be non-significant with small samples
- Consider effect size magnitude and confidence interval width

**Number Needed to Treat (NNT)**
- NNT = 1 / absolute risk reduction
- Example: 10% vs 5% event rate → ARR = 5% → NNT = 20
- Interpretation: Treat 20 patients to prevent 1 event
- Useful for communicating treatment benefit

**Minimal Clinically Important Difference (MCID)**
- Pre-defined threshold for meaningful clinical benefit
- OS: Often 2-3 months in oncology
- PFS: Context-dependent, often 1.5-3 months
- QoL: 10-point change on 100-point scale
- Response rate: Often 10-15 percentage point difference

### Contextualization

- Compare to historical controls or standard of care
- Consider patient population characteristics
- Account for prior treatment exposure
- Evaluate toxicity trade-offs
- Assess quality of life impact

