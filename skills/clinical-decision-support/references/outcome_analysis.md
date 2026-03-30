# Outcome Analysis and Statistical Methods Guide

## Overview

Rigorous outcome analysis is essential for clinical decision support documents. This guide covers survival analysis, response assessment, statistical testing, and data visualization for patient cohort analyses and treatment evaluation.

## Survival Analysis

### Kaplan-Meier Method

**Overview**
- Non-parametric estimator of survival function from time-to-event data
- Handles censored observations (patients alive at last follow-up)
- Provides survival probability at each time point
- Generates characteristic step-function survival curves

**Key Concepts**

**Censoring**
- **Right censoring**: Most common - patient alive at last follow-up or study end
- **Left censoring**: Rare in clinical studies
- **Interval censoring**: Event occurred between two assessment times
- **Informative vs non-informative**: Censoring should be independent of outcome

**Survival Function S(t)**
- S(t) = Probability of surviving beyond time t
- S(0) = 1.0 (100% alive at time zero)
- S(t) decreases as time increases
- Step decreases at each event time

**Median Survival**
- Time point where S(t) = 0.50
- 50% of patients alive, 50% have had event
- Reported with 95% confidence interval
- "Not reached (NR)" if fewer than 50% events

**Survival Rates at Fixed Time Points**
- 1-year survival rate, 2-year survival rate, 5-year survival rate
- Read from K-M curve at specific time point
- Report with 95% CI: S(t) ± 1.96 × SE

**Calculation Example**
```
Time  Events  At Risk  Survival Probability
0     0       100      1.000
3     2       100      0.980 (98/100)
5     1       95       0.970 (97/100 × 95/98)
8     3       87       0.936 (94/100 × 92/95 × 84/87)
...
```

### Log-Rank Test

**Purpose**: Compare survival curves between two or more groups

**Null Hypothesis**: No difference in survival distributions between groups

**Test Statistic**
- Compares observed vs expected events in each group at each time point
- Weights all time points equally
- Follows chi-square distribution with df = k-1 (k groups)

**Reporting**
- Chi-square statistic, degrees of freedom, p-value
- Example: χ² = 6.82, df = 1, p = 0.009
- Interpretation: Significant difference in survival curves

**Assumptions**
- Censoring is non-informative and independent
- Proportional hazards (constant HR over time)
- If non-proportional, consider time-varying effects

**Alternatives for Non-Proportional Hazards**
- **Gehan-Breslow test**: Weights early events more heavily
- **Peto-Peto test**: Modifies Gehan-Breslow weighting
- **Restricted mean survival time (RMST)**: Difference in area under K-M curve

### Cox Proportional Hazards Regression

**Purpose**: Multivariable survival analysis, estimate hazard ratios adjusting for covariates

**Model**: h(t|X) = h₀(t) × exp(β₁X₁ + β₂X₂ + ... + βₚXₚ)
- h(t|X): Hazard rate for individual with covariates X
- h₀(t): Baseline hazard function (unspecified)
- exp(β): Hazard ratio for one-unit change in covariate

**Hazard Ratio Interpretation**
- HR = 1.0: No effect
- HR > 1.0: Increased risk (harmful)
- HR < 1.0: Decreased risk (beneficial)
- HR = 0.50: 50% reduction in hazard (risk of event)

**Example Output**
```
Variable              HR      95% CI         p-value
Treatment (B vs A)    0.62    0.43-0.89      0.010
Age (per 10 years)    1.15    1.02-1.30      0.021
ECOG PS (2 vs 0-1)    1.85    1.21-2.83      0.004
Biomarker+ (vs -)     0.71    0.48-1.05      0.089
```

**Proportional Hazards Assumption**
- Hazard ratio constant over time
- Test: Schoenfeld residuals, log-minus-log plots
- Violation: Time-varying effects, consider stratification or time-dependent covariates

**Multivariable vs Univariable**
- **Univariable**: One covariate at a time, unadjusted HRs
- **Multivariable**: Multiple covariates simultaneously, adjusted HRs
- Report both: Univariable for all variables, multivariable for final model

**Model Selection**
- **Forward selection**: Start with empty model, add significant variables
- **Backward elimination**: Start with all variables, remove non-significant
- **Clinical judgment**: Include known prognostic factors regardless of p-value
- **Parsimony**: Avoid overfitting, rule of thumb 1 variable per 10-15 events

## Response Assessment

### RECIST v1.1 (Response Evaluation Criteria in Solid Tumors)

**Target Lesions**
- Select up to 5 lesions total (maximum 2 per organ)
- Measurable: ≥10 mm longest diameter (≥15 mm for lymph nodes short axis)
- Sum of longest diameters (SLD) at baseline

**Response Categories**

**Complete Response (CR)**
- Disappearance of all target and non-target lesions
- Lymph nodes must regress to <10 mm short axis
- Confirmation required at ≥4 weeks

**Partial Response (PR)**
- ≥30% decrease in SLD from baseline
- No new lesions or unequivocal progression of non-target lesions
- Confirmation required at ≥4 weeks

**Stable Disease (SD)**
- Neither PR nor PD criteria met
- Minimum duration typically 6-8 weeks from baseline

**Progressive Disease (PD)**
- ≥20% increase in SLD AND ≥5 mm absolute increase from smallest SLD (nadir)
- OR appearance of new lesions
- OR unequivocal progression of non-target lesions

**Example Calculation**
```
Baseline SLD: 80 mm (4 target lesions)
Week 6 SLD: 52 mm

Percent change: (52 - 80)/80 × 100% = -35%
Classification: Partial Response (≥30% decrease)

Week 12 SLD: 48 mm (nadir)
Week 18 SLD: 62 mm

Percent change from nadir: (62 - 48)/48 × 100% = +29%
Absolute change: 62 - 48 = 14 mm
Classification: Progressive Disease (>20% AND ≥5 mm increase)
```

### iRECIST (Immune RECIST)

**Purpose**: Account for atypical response patterns with immunotherapy

**Modifications from RECIST v1.1**

**iUPD (Immune Unconfirmed Progressive Disease)**
- Initial increase in tumor burden or new lesions
- Requires confirmation at next assessment (≥4 weeks later)
- Continue treatment if clinically stable

**iCPD (Immune Confirmed Progressive Disease)**
- Confirmed progression at repeat imaging
- Discontinue immunotherapy

**Pseudoprogression**
- Initial apparent progression followed by response
- Mechanism: Immune cell infiltration increases tumor size
- Incidence: 5-10% of patients on immunotherapy
- Management: Continue treatment if patient clinically stable

**New Lesions**
- Record size and location but continue treatment
- Do not automatically classify as PD
- Confirm progression if new lesions grow or additional new lesions appear

### Other Response Criteria

**Lugano Classification (Lymphoma)**
- **PET-based**: Deauville 5-point scale
  - Score 1-3: Negative (metabolic CR)
  - Score 4-5: Positive (residual disease)
- **CT-based**: If PET not available
- **Bone marrow**: Required for staging in some lymphomas

**RANO (Response Assessment in Neuro-Oncology)**
- **Glioblastoma-specific**: Accounts for pseudoprogression with radiation/temozolomide
- **Enhancing disease**: Bidimensional measurements (product of perpendicular diameters)
- **Non-enhancing disease**: FLAIR changes assessed separately
- **Corticosteroid dose**: Must document, increase may indicate progression

**mRECIST (Modified RECIST for HCC)**
- **Viable tumor**: Enhancing portion only (arterial phase enhancement)
- **Necrosis**: Non-enhancing areas excluded from measurements
- **Application**: Hepatocellular carcinoma with arterial enhancement

## Outcome Metrics

### Efficacy Endpoints

**Overall Survival (OS)**
- **Definition**: Time from randomization/treatment start to death from any cause
- **Advantages**: Objective, not subject to assessment bias, regulatory gold standard
- **Disadvantages**: Requires long follow-up, affected by subsequent therapies
- **Censoring**: Last known alive date
- **Analysis**: Kaplan-Meier, log-rank test, Cox regression

**Progression-Free Survival (PFS)**
- **Definition**: Time from randomization to progression (RECIST) or death
- **Advantages**: Earlier readout than OS, direct treatment effect
- **Disadvantages**: Requires regular imaging, subject to assessment timing
- **Censoring**: Last tumor assessment without progression
- **Sensitivity Analysis**: Assess impact of censoring assumptions

**Objective Response Rate (ORR)**
- **Definition**: Proportion of patients achieving CR or PR (best response)
- **Denominator**: Evaluable patients (baseline measurable disease)
- **Reporting**: Percentage with 95% CI (exact binomial method)
- **Duration**: Time from first response to progression (DOR)
- **Advantage**: Binary endpoint, no censoring complications

**Disease Control Rate (DCR)**
- **Definition**: CR + PR + SD (stable disease ≥6-8 weeks)
- **Less Stringent**: Captures clinical benefit beyond objective response
- **Reporting**: Percentage with 95% CI

**Duration of Response (DOR)**
- **Definition**: Time from first CR or PR to progression (among responders only)
- **Population**: Subset analysis of responders
- **Analysis**: Kaplan-Meier among responders
- **Reporting**: Median DOR with 95% CI

**Time to Treatment Failure (TTF)**
- **Definition**: Time from start to discontinuation for any reason (progression, toxicity, death, patient choice)
- **Advantage**: Reflects real-world treatment duration
- **Components**: PFS + toxicity-related discontinuations

### Safety Endpoints

**Adverse Events (CTCAE v5.0)**

**Grading**
- **Grade 1**: Mild, asymptomatic or mild symptoms, clinical intervention not indicated
- **Grade 2**: Moderate, minimal/local intervention indicated, age-appropriate ADL limitation
- **Grade 3**: Severe or medically significant, not immediately life-threatening, hospitalization/prolongation indicated, disabling, self-care ADL limitation
- **Grade 4**: Life-threatening consequences, urgent intervention indicated
- **Grade 5**: Death related to adverse event

**Reporting Standards**
```
Adverse Event Summary Table:

AE Term (MedDRA)        Any Grade, n (%)  Grade 3-4, n (%)  Grade 5, n (%)
                        Trt A    Trt B    Trt A   Trt B     Trt A   Trt B
─────────────────────────────────────────────────────────────────────────
Hematologic
  Anemia                45 (90%) 42 (84%) 8 (16%) 6 (12%)   0       0
  Neutropenia           35 (70%) 38 (76%) 15 (30%) 18 (36%) 0       0
  Thrombocytopenia      28 (56%) 25 (50%) 6 (12%) 4 (8%)    0       0
  Febrile neutropenia   4 (8%)   6 (12%)  4 (8%)  6 (12%)   0       0

Gastrointestinal
  Nausea                42 (84%) 40 (80%) 2 (4%)  1 (2%)    0       0
  Diarrhea              31 (62%) 28 (56%) 5 (10%) 3 (6%)    0       0
  Mucositis             18 (36%) 15 (30%) 3 (6%)  2 (4%)    0       0

Any AE                  50 (100%) 50 (100%) 38 (76%) 35 (70%) 1 (2%) 0
```

**Serious Adverse Events (SAEs)**
- SAE incidence and type
- Relationship to treatment (related vs unrelated)
- Outcome (resolved, ongoing, fatal)
- Causality assessment (definite, probable, possible, unlikely, unrelated)

**Treatment Modifications**
- Dose reductions: n (%), reason
- Dose delays: n (%), duration
- Discontinuations: n (%), reason (toxicity vs progression vs other)
- Relative dose intensity: (actual dose delivered / planned dose) × 100%

## Statistical Analysis Methods

### Comparing Continuous Outcomes

**Independent Samples t-test**
- **Application**: Compare means between two independent groups (normally distributed)
- **Assumptions**: Normal distribution, equal variances (or use Welch's t-test)
- **Reporting**: Mean ± SD for each group, mean difference (95% CI), t-statistic, df, p-value
- **Example**: Mean age 62.3 ± 8.4 vs 58.7 ± 9.1 years, difference 3.6 years (95% CI 0.2-7.0, p=0.038)

**Mann-Whitney U Test (Wilcoxon Rank-Sum)**
- **Application**: Compare medians between two groups (non-normal distribution)
- **Non-parametric**: No distributional assumptions
- **Reporting**: Median [IQR] for each group, median difference, U-statistic, p-value
- **Example**: Median time to response 6.2 [4.1-8.3] vs 8.5 [5.9-11.2] weeks, p=0.042

**ANOVA (Analysis of Variance)**
- **Application**: Compare means across three or more groups
- **Output**: F-statistic, p-value (overall test)
- **Post-hoc**: If significant, pairwise comparisons with Tukey or Bonferroni correction
- **Example**: Treatment effect varied by biomarker subgroup (F=4.32, df=2, p=0.016)

### Comparing Categorical Outcomes

**Chi-Square Test for Independence**
- **Application**: Compare proportions between two or more groups
- **Assumptions**: Expected count ≥5 in at least 80% of cells
- **Reporting**: n (%) for each cell, χ², df, p-value
- **Example**: ORR 45% vs 30%, χ²=6.21, df=1, p=0.013

**Fisher's Exact Test**
- **Application**: 2×2 tables when expected count <5
- **Exact p-value**: No large-sample approximation
- **Two-sided vs one-sided**: Typically report two-sided
- **Example**: SAE rate 3/20 (15%) vs 8/22 (36%), Fisher's exact p=0.083

**McNemar's Test**
- **Application**: Paired categorical data (before/after, matched pairs)
- **Example**: Response before vs after treatment switch in same patients

### Sample Size and Power

**Power Analysis Components**
- **Alpha (α)**: Type I error rate, typically 0.05 (two-sided)
- **Beta (β)**: Type II error rate, typically 0.10 or 0.20
- **Power**: 1 - β, typically 0.80 or 0.90 (80-90% power)
- **Effect size**: Expected difference (HR, mean difference, proportion difference)
- **Sample size**: Number of patients or events needed

**Survival Study Sample Size**
- Events-driven: Need sufficient events (deaths, progressions)
- Rule of thumb: 80% power requires approximately 165 events for HR=0.70 (α=0.05, two-sided)
- Accrual time + follow-up time determines calendar time

**Response Rate Study**
```
Example: Detect ORR difference 45% vs 30% (15 percentage points)
- α = 0.05 (two-sided)
- Power = 0.80
- Sample size: n = 94 per group (188 total)
- With 10% dropout: n = 105 per group (210 total)
```

## Data Visualization

### Survival Curves

**Kaplan-Meier Plot Best Practices**

```python
# Key elements for publication-quality survival curve
1. X-axis: Time (months or years), starts at 0
2. Y-axis: Survival probability (0 to 1.0 or 0% to 100%)
3. Step function: Survival curve with steps at event times
4. 95% CI bands: Shaded region around survival curve (optional but recommended)
5. Number at risk table: Below x-axis showing n at risk at time intervals
6. Censoring marks: Vertical tick marks (|) at censored observations
7. Legend: Clearly identify each curve
8. Log-rank p-value: Prominently displayed
9. Median survival: Horizontal line at 0.50, labeled
10. Follow-up: Median follow-up time reported
```

**Number at Risk Table Format**
```
Number at risk
Group A   50    42    35    28    18    10     5
Group B   48    38    29    19    12     6     2
Time      0     6     12    18    24    30    36 (months)
```

**Hazard Ratio Annotation**
```
On plot: HR 0.62 (95% CI 0.43-0.89), p=0.010
Or in caption: Log-rank test p=0.010; Cox model HR=0.62 (95% CI 0.43-0.89)
```

### Waterfall Plots

**Purpose**: Visualize individual patient responses to treatment

**Construction**
- **X-axis**: Individual patients (anonymized patient IDs)
- **Y-axis**: Best % change from baseline tumor burden
- **Bars**: Vertical bars, one per patient
  - Positive values: Tumor growth
  - Negative values: Tumor shrinkage
- **Ordering**: Sorted from best response (left) to worst (right)
- **Color coding**:
  - Green/blue: CR or PR (≥30% decrease)
  - Yellow: SD (-30% to +20%)
  - Red: PD (≥20% increase)
- **Reference lines**: Horizontal lines at +20% (PD), -30% (PR)
- **Annotations**: Biomarker status, response duration (symbols)

**Example Annotations**
```
■ = Biomarker-positive
○ = Biomarker-negative
* = Ongoing response
† = Progressed
```

### Forest Plots

**Purpose**: Display subgroup analyses with hazard ratios and confidence intervals

**Construction**
- **Y-axis**: Subgroup categories
- **X-axis**: Hazard ratio (log scale), vertical line at HR=1.0
- **Points**: HR estimate for each subgroup
- **Horizontal lines**: 95% confidence interval
- **Square size**: Proportional to sample size or precision
- **Overall effect**: Diamond at bottom, width represents 95% CI

**Subgroups to Display**
```
Subgroup                    n     HR (95% CI)          Favors A  Favors B
──────────────────────────────────────────────────────────────────────────
Overall                     300   0.65 (0.48-0.88)         ●────┤
Age
  <65 years                 180   0.58 (0.39-0.86)        ●────┤
  ≥65 years                 120   0.78 (0.49-1.24)          ●──────┤
Sex
  Male                      175   0.62 (0.43-0.90)        ●────┤
  Female                    125   0.70 (0.44-1.12)         ●─────┤
Biomarker Status
  Positive                  140   0.45 (0.28-0.72)      ●───┤
  Negative                  160   0.89 (0.59-1.34)           ●──────┤
                                  p-interaction=0.041

                                  0.25  0.5   1.0   2.0
                                        Hazard Ratio
```

**Interaction Testing**
- Test whether treatment effect differs across subgroups
- p-interaction <0.05 suggests heterogeneity
- Pre-specify subgroups to avoid data mining

### Spider Plots

**Purpose**: Display longitudinal tumor burden changes over time for individual patients

**Construction**
- **X-axis**: Time from treatment start (weeks or months)
- **Y-axis**: % change from baseline tumor burden
- **Lines**: One line per patient connecting assessments
- **Color coding**: By response category or biomarker status
- **Reference lines**: 0% (no change), +20% (PD threshold), -30% (PR threshold)

**Clinical Insights**
- Identify delayed responders (initial SD then PR)
- Detect early progression (rapid upward trajectory)
- Assess depth of response (maximum tumor shrinkage)
- Duration visualization (when lines cross PD threshold)

### Swimmer Plots

**Purpose**: Display treatment duration and response for individual patients

**Construction**
- **X-axis**: Time from treatment start (weeks or months)
- **Y-axis**: Individual patients (one row per patient)
- **Bars**: Horizontal bars representing treatment duration
- **Symbols**:
  - ● Start of treatment
  - ▼ Ongoing treatment (arrow)
  - ■ Progressive disease (end of bar)
  - ◆ Death
  - | Dose modification
- **Color**: Response status (CR=green, PR=blue, SD=yellow, PD=red)

**Example**
```
Patient ID    |0   3   6   9   12  15  18  21  24 months
──────────────|──────────────────────────────────────────
Pt-001        ●═══PR═══════════|════════PR══════════▼
Pt-002        ●═══PR═══════════════PD■
Pt-003        ●══════SD══════════PD■
Pt-004        ●PR══════════════════════════════════PR▼
...
```

## Confidence Intervals

### Interpretation

**95% Confidence Interval**
- Range of plausible values for true population parameter
- If study repeated 100 times, 95 of the 95% CIs would contain true value
- **Not**: 95% probability true value within this interval (frequentist, not Bayesian)

**Relationship to p-value**
- If 95% CI excludes null value (HR=1.0, difference=0), p<0.05
- If 95% CI includes null value, p≥0.05
- CI provides more information: magnitude and precision of effect

**Precision**
- **Narrow CI**: High precision, large sample size
- **Wide CI**: Low precision, small sample size or high variability
- **Example**: HR 0.65 (95% CI 0.62-0.68) very precise; HR 0.65 (0.30-1.40) imprecise

### Calculation Methods

**Hazard Ratio CI**
- From Cox regression output
- Standard error of log(HR) → exp(log(HR) ± 1.96×SE)
- Example: HR=0.62, SE(logHR)=0.185 → 95% CI (0.43, 0.89)

**Survival Rate CI (Greenwood Formula)**
- SE(S(t)) = S(t) × sqrt(Σ[d_i / (n_i × (n_i - d_i))])
- 95% CI: S(t) ± 1.96 × SE(S(t))
- Can use complementary log-log transformation for better properties

**Proportion CI (Exact Binomial)**
- For ORR, DCR: Use exact method (Clopper-Pearson) for small samples
- Wilson score interval: Better properties than normal approximation
- Example: 12/30 responses → ORR 40% (95% CI 22.7-59.4%)

## Censoring and Missing Data

### Types of Censoring

**Right Censoring**
- **End of study**: Patient alive at study termination (administrative censoring)
- **Loss to follow-up**: Patient stops attending visits
- **Withdrawal**: Patient withdraws consent
- **Competing risk**: Death from unrelated cause (in disease-specific survival)

**Handling Censoring**
- **Assumption**: Non-informative - censoring independent of event probability
- **Sensitivity Analysis**: Assess impact if assumption violated
  - Best case: All censored patients never progress
  - Worst case: All censored patients progress immediately after censoring
  - Actual result should fall between best/worst case

### Missing Data

**Mechanisms**
- **MCAR (Missing Completely at Random)**: Missingness unrelated to any variable
- **MAR (Missing at Random)**: Missingness related to observed but not unobserved variables
- **NMAR (Not Missing at Random)**: Missingness related to the missing value itself

**Handling Strategies**
- **Complete case analysis**: Exclude patients with missing data (biased if not MCAR)
- **Multiple imputation**: Generate multiple plausible datasets, analyze each, pool results
- **Maximum likelihood**: Estimate parameters using all available data
- **Sensitivity analysis**: Assess robustness to missing data assumptions

**Response Assessment Missing Data**
- **Unevaluable for response**: Baseline measurable disease but post-baseline assessment missing
  - Exclude from ORR denominator or count as non-responder (sensitivity analysis)
- **PFS censoring**: Last adequate tumor assessment date if later assessments missing

## Reporting Standards

### CONSORT Statement (RCTs)

**Flow Diagram**
- Assessed for eligibility (n=)
- Randomized (n=)
- Allocated to intervention (n=)
- Lost to follow-up (n=, reasons)
- Discontinued intervention (n=, reasons)
- Analyzed (n=)

**Baseline Table**
- Demographics and clinical characteristics
- Baseline prognostic factors
- Show balance between arms

**Outcomes Table**
- Primary endpoint results with CI and p-value
- Secondary endpoints
- Safety summary

### STROBE Statement (Observational Studies)

**Study Design**: Cohort, case-control, or cross-sectional

**Participants**: Eligibility, sources, selection methods, sample size

**Variables**: Clearly define outcomes, exposures, predictors, confounders

**Statistical Methods**: Describe all methods, handling of missing data, sensitivity analyses

**Results**: Participant flow, descriptive data, outcome data, main results, other analyses

### Reproducible Research Practices

**Statistical Analysis Plan (SAP)**
- Pre-specify all analyses before data lock
- Primary and secondary endpoints
- Analysis populations (ITT, per-protocol, safety)
- Statistical tests and models
- Subgroup analyses (pre-specified)
- Interim analyses (if planned)
- Multiple testing procedures

**Transparency**
- Report all pre-specified analyses
- Distinguish pre-specified from post-hoc exploratory
- Report both positive and negative results
- Provide access to anonymized individual patient data (when possible)

## Software and Tools

### R Packages for Survival Analysis
- **survival**: Core package (Surv, survfit, coxph, survdiff)
- **survminer**: Publication-ready Kaplan-Meier plots (ggsurvplot)
- **rms**: Regression modeling strategies
- **flexsurv**: Flexible parametric survival models

### Python Libraries
- **lifelines**: Kaplan-Meier, Cox regression, survival curves
- **scikit-survival**: Machine learning for survival analysis
- **matplotlib**: Custom survival curve plotting

### Statistical Software
- **R**: Most comprehensive for survival analysis
- **Stata**: Medical statistics, good for epidemiology
- **SAS**: Industry standard for clinical trials
- **GraphPad Prism**: User-friendly for basic analyses
- **SPSS**: Point-and-click interface, limited survival features

