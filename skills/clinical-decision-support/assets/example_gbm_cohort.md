# Example: GBM Molecular Subtype Cohort Analysis

## Clinical Context

This example demonstrates a patient cohort analysis stratified by molecular biomarkers, similar to the GBM Mesenchymal-Immune-Active cluster analysis provided as reference.

## Cohort Overview

**Disease**: Glioblastoma (GBM), IDH-wild-type

**Study Population**: n=60 patients with newly diagnosed GBM treated with standard Stupp protocol (temozolomide + radiation → adjuvant temozolomide)

**Molecular Classification**: Verhaak 2010 subtypes with immune signature refinement
- **Group A**: Mesenchymal-Immune-Active subtype (n=18, 30%)
- **Group B**: Other molecular subtypes (Proneural, Classical, Neural) (n=42, 70%)

**Study Period**: January 2019 - December 2022

**Data Source**: Single academic medical center, retrospective cohort analysis

## Biomarker Classification

### Mesenchymal-Immune-Active Subtype Characteristics

**Molecular Features**:
- NF1 alterations (mutations or deletions): 72% (13/18)
- High YKL-40 (CHI3L1) expression: 100% (18/18, median z-score +2.8)
- Immune gene signature: Elevated (median ESTIMATE immune score +1250)
- CD163+ macrophage infiltration: High density (median 195 cells/mm², range 120-340)
- MES (mesenchymal) signature score: >0.5 (all patients)

**Clinical Characteristics**:
- Median age: 64 years (range 42-76)
- Male: 61% (11/18)
- Tumor location: Temporal lobe predominant (55%)
- Multifocal disease: 33% (6/18) - higher than overall cohort

### Comparison Groups (Other Subtypes)

**Molecular Features**:
- Proneural: n=15 (25%) - PDGFRA amplification, younger age
- Classical: n=18 (30%) - EGFR amplification, chromosome 7+/10-
- Neural: n=9 (15%) - neuronal markers, may include normal tissue

## Treatment Outcomes

### Response Assessment (RANO Criteria)

**Objective Response Rate** (after chemoradiation, ~3 months):
- Mesenchymal-Immune-Active: 6/18 (33%) - CR 0, PR 6  
- Other subtypes: 18/42 (43%) - CR 1, PR 17
- p = 0.48 (Fisher's exact)

**Interpretation**: No significant difference in initial response rates

### Survival Outcomes

**Progression-Free Survival (PFS)**:
- Mesenchymal-Immune-Active: Median 7.2 months (95% CI 5.8-9.1)
- Other subtypes: Median 9.5 months (95% CI 8.1-11.3)
- Hazard Ratio: 1.58 (95% CI 0.89-2.81), p = 0.12
- 6-month PFS rate: 61% vs 74%

**Overall Survival (OS)**:
- Mesenchymal-Immune-Active: Median 12.8 months (95% CI 10.2-15.4)
- Other subtypes: Median 16.3 months (95% CI 14.7-18.9)
- Hazard Ratio: 1.72 (95% CI 0.95-3.11), p = 0.073
- 12-month OS rate: 55% vs 68%
- 24-month OS rate: 17% vs 31%

**Interpretation**: Trend toward worse survival in mesenchymal-immune-active subtype, not reaching statistical significance in this cohort size

### Response to Bevacizumab at Recurrence

**Subset Analysis** (patients receiving bevacizumab at first recurrence, n=35):
- Mesenchymal-Immune-Active: n=12
  - ORR: 58% (7/12)
  - Median PFS2 (from bevacizumab start): 6.8 months
- Other subtypes: n=23
  - ORR: 35% (8/23)
  - Median PFS2: 4.2 months
- p = 0.19 (Fisher's exact for ORR)
- HR for PFS2: 0.62 (95% CI 0.29-1.32), p = 0.21

**Interpretation**: Exploratory finding suggesting enhanced benefit from bevacizumab in mesenchymal-immune-active subtype (not statistically significant with small sample)

## Safety Profile

**Treatment-Related Adverse Events** (Temozolomide):

No significant differences in toxicity between molecular subtypes:
- Lymphopenia (any grade): 89% vs 86%, p = 0.77
- Thrombocytopenia (grade 3-4): 22% vs 19%, p = 0.79
- Fatigue (any grade): 94% vs 90%, p = 0.60
- Treatment discontinuation: 17% vs 14%, p = 0.77

## Clinical Implications

### Treatment Recommendations

**For Mesenchymal-Immune-Active GBM**:

1. **First-Line**: Standard Stupp protocol (no change based on subtype)
   - Evidence: No proven benefit for alternative first-line strategies
   - GRADE: 1A (strong recommendation, high-quality evidence)

2. **At Recurrence - Consider Bevacizumab Earlier**:
   - Rationale: Exploratory data suggesting enhanced anti-angiogenic response
   - Evidence: Mesenchymal GBM has high VEGF expression, angiogenic phenotype
   - GRADE: 2C (conditional recommendation, low-quality evidence from subset)

3. **Clinical Trial Enrollment - Immunotherapy Combinations**:
   - Rationale: High immune cell infiltration may predict immunotherapy benefit
   - Targets: PD-1/PD-L1 blockade ± anti-CTLA-4 or anti-angiogenic agents
   - Evidence: Ongoing trials (CheckMate-498, CheckMate-548 showed negative results, but did not select for immune-active)
   - GRADE: R (research recommendation)

**For Other GBM Subtypes**:
- Standard treatment per NCCN guidelines
- Consider tumor treating fields (Optune) after radiation completion
- Clinical trials based on specific molecular features (EGFR amplification → EGFR inhibitor trials)

### Prognostic Information

**Counseling Patients**:
- Mesenchymal-immune-active subtype associated with trend toward shorter survival (12.8 vs 16.3 months)
- Not definitive due to small sample size and confidence intervals overlapping
- Prospective validation needed
- Should not alter standard first-line treatment

## Study Limitations

1. **Small Sample Size**: n=18 in mesenchymal-immune-active group limits statistical power
2. **Retrospective Design**: Potential selection bias, unmeasured confounders
3. **Single Institution**: May not generalize to other populations
4. **Heterogeneous Recurrence Treatment**: Not all patients received bevacizumab; treatment selection bias
5. **Molecular Classification**: Based on bulk tumor RNA-seq; intratumoral heterogeneity not captured
6. **No Central Pathology Review**: Molecular classification performed locally

## Future Directions

1. **Prospective Validation**: Confirm survival differences in independent cohort (n>100 per group for adequate power)
2. **Biomarker Testing**: Develop clinically feasible assay for mesenchymal-immune subtype identification
3. **Clinical Trial Design**: Immunotherapy combinations targeting mesenchymal-immune-active GBM specifically
4. **Mechanistic Studies**: Investigate why mesenchymal-immune GBM may respond better to bevacizumab
5. **Longitudinal Analysis**: Track molecular subtype evolution over treatment course

## Data Presentation Example

### Baseline Characteristics Table

```
Characteristic                    Mesenchymal-IA (n=18)  Other (n=42)  p-value
Age, years (median [IQR])         64 [56-71]            61 [53-68]    0.42
Sex, n (%)
  Male                            11 (61%)              24 (57%)      0.78
  Female                          7 (39%)               18 (43%)
ECOG PS, n (%)
  0-1                             15 (83%)              37 (88%)      0.63
  2                               3 (17%)               5 (12%)
Tumor location
  Frontal                         4 (22%)               15 (36%)      0.35
  Temporal                        10 (56%)              16 (38%)
  Parietal/Occipital              4 (22%)               11 (26%)
Extent of resection
  Gross total                     8 (44%)               22 (52%)      0.58
  Subtotal                        10 (56%)              20 (48%)
MGMT promoter methylated          5 (28%)               18 (43%)      0.27
```

### Survival Outcomes Summary

```
Endpoint                          Mesenchymal-IA        Other         HR (95% CI)        p-value
Median PFS, months (95% CI)       7.2 (5.8-9.1)        9.5 (8.1-11.3) 1.58 (0.89-2.81)   0.12
6-month PFS rate                  61%                  74%
Median OS, months (95% CI)        12.8 (10.2-15.4)     16.3 (14.7-18.9) 1.72 (0.95-3.11) 0.073
12-month OS rate                  55%                  68%
24-month OS rate                  17%                  31%
```

## Key Takeaways

1. **Molecular heterogeneity exists** in GBM with distinct subtypes
2. **Mesenchymal-immune-active subtype** characterized by NF1 alterations, immune infiltration
3. **Trend toward worse prognosis** but not statistically significant (power limitations)
4. **Potential bevacizumab benefit** hypothesis-generating, requires prospective validation
5. **Immunotherapy target**: High immune infiltration rational for checkpoint inhibitor trials
6. **Clinical implementation pending**: Need prospective validation before routine subtyping

## References

1. Verhaak RG, et al. Integrated genomic analysis identifies clinically relevant subtypes of glioblastoma characterized by abnormalities in PDGFRA, IDH1, EGFR, and NF1. Cancer Cell. 2010;17(1):98-110.
2. Wang Q, et al. Tumor Evolution of Glioma-Intrinsic Gene Expression Subtypes Associates with Immunological Changes in the Microenvironment. Cancer Cell. 2017;32(1):42-56.
3. Stupp R, et al. Radiotherapy plus Concomitant and Adjuvant Temozolomide for Glioblastoma. NEJM. 2005;352(10):987-996.
4. Gilbert MR, et al. Bevacizumab for Newly Diagnosed Glioblastoma. NEJM. 2014;370(8):699-708.
5. NCCN Clinical Practice Guidelines in Oncology: Central Nervous System Cancers. Version 1.2024.

---

**This example demonstrates**:
- Biomarker-based stratification methodology
- Outcome reporting with appropriate statistics
- Clinical contextualization of findings
- Evidence-based recommendations with grading
- Transparent limitation discussion
- Structure suitable for pharmaceutical/clinical research documentation

