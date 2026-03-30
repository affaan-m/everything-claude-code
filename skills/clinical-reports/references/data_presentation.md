# Data Presentation in Clinical Reports

## Tables for Clinical Data

### Table Design Principles

**General guidelines:**
- Clear, concise title describing table contents
- Column headers with units
- Row labels aligned left, data aligned appropriately (numbers right, text left)
- Footnotes for abbreviations, statistical notation, special cases
- Consistent decimal places (typically 1-2 for percentages, 1-3 for continuous variables)
- Consistent formatting throughout document

**Title placement:**
- Above table
- Numbered sequentially (Table 1, Table 2, etc.)
- Descriptive enough to stand alone

**Footnote symbols (in order):**
- *, †, ‡, §, ||, ¶, #
- Or use superscript letters (a, b, c...)
- Or use superscript numbers if not confused with references

### Demographic and Baseline Characteristics Table

**Purpose:** Describe study population at baseline

**Standard format:**

```
Table 1. Baseline Demographics and Clinical Characteristics

Characteristic                  Treatment Group    Control Group    Total
                               (N=150)            (N=145)          (N=295)
─────────────────────────────────────────────────────────────────────────
Age, years
  Mean (SD)                    64.2 (8.5)         63.8 (9.1)       64.0 (8.8)
  Median (IQR)                 65 (58-71)         64 (57-70)       64 (58-71)
  Range                        45-82              43-85            43-85

Sex, n (%)
  Male                         95 (63.3)          88 (60.7)        183 (62.0)
  Female                       55 (36.7)          57 (39.3)        112 (38.0)

Race, n (%)
  White                        110 (73.3)         105 (72.4)       215 (72.9)
  Black/African American       25 (16.7)          28 (19.3)        53 (18.0)
  Asian                        10 (6.7)           8 (5.5)          18 (6.1)
  Other                        5 (3.3)            4 (2.8)          9 (3.0)

BMI, kg/m²
  Mean (SD)                    28.5 (4.2)         28.1 (4.5)       28.3 (4.4)

Baseline HbA1c, %
  Mean (SD)                    8.9 (1.2)          9.0 (1.3)        9.0 (1.2)

Disease duration, years
  Median (IQR)                 6 (3-10)           5 (3-9)          6 (3-10)

Prior medications, n (%)
  Metformin                    135 (90.0)         130 (89.7)       265 (89.8)
  Sulfonylurea                 45 (30.0)          42 (29.0)        87 (29.5)
  Insulin                      20 (13.3)          18 (12.4)        38 (12.9)
─────────────────────────────────────────────────────────────────────────
SD = standard deviation; IQR = interquartile range; BMI = body mass index;
HbA1c = hemoglobin A1c
```

**Key elements:**
- Sample size for each group (N=)
- Continuous variables: mean (SD), median (IQR), range
- Categorical variables: n (%)
- No p-values for baseline comparisons (debated but generally not recommended)

### Efficacy Results Table

**Purpose:** Present primary and secondary endpoint results

**Example:**

```
Table 2. Primary and Secondary Efficacy Endpoints at Week 24

Endpoint                           Treatment      Control        Difference    P-value
                                   (N=150)        (N=145)        (95% CI)
──────────────────────────────────────────────────────────────────────────────────
Primary Endpoint
Change in HbA1c from baseline, %
  Mean (SE)                        -1.8 (0.1)     -0.6 (0.1)     -1.2          <0.001
  95% CI                           (-2.0, -1.6)   (-0.8, -0.4)   (-1.5, -0.9)

Secondary Endpoints
Change in FPG, mg/dL
  Mean (SE)                        -42.5 (3.2)    -15.2 (3.4)    -27.3         <0.001
  95% CI                           (-48.8, -36.2) (-21.9, -8.5)  (-36.4, -18.2)

% achieving HbA1c <7%
  n (%)                            78 (52.0)      25 (17.2)      -              <0.001
  95% CI                           (43.9, 60.1)   (11.4, 24.5)   

Change in body weight, kg
  Mean (SE)                        -3.2 (0.4)     -0.5 (0.4)     -2.7          <0.001
  95% CI                           (-4.0, -2.4)   (-1.3, 0.3)    (-3.8, -1.6)
──────────────────────────────────────────────────────────────────────────────
SE = standard error; CI = confidence interval; HbA1c = hemoglobin A1c; 
FPG = fasting plasma glucose
```

**Statistical presentation:**
- Point estimates with measures of precision (SE or CI)
- p-values (consider adjustment for multiplicity)
- Effect size (difference or ratio) with 95% CI
- Significance level noted (e.g., p<0.05, p<0.01, p<0.001)

### Adverse Events Table

**Purpose:** Summarize safety data

**Example:**

```
Table 3. Summary of Adverse Events

Event Category                        Treatment     Control       P-value
                                      (N=150)       (N=145)
                                      n (%)         n (%)
──────────────────────────────────────────────────────────────────────────
Any adverse event                     120 (80.0)    95 (65.5)     0.004

Treatment-related adverse events       85 (56.7)    42 (29.0)     <0.001

Serious adverse events                 12 (8.0)     8 (5.5)       0.412

Adverse events leading to              8 (5.3)      4 (2.8)       0.257
discontinuation

Deaths                                 0 (0.0)      1 (0.7)       0.492

Common adverse events (≥5% in any group)
  Nausea                              45 (30.0)     12 (8.3)      <0.001
  Diarrhea                            38 (25.3)     10 (6.9)      <0.001
  Headache                            22 (14.7)     18 (12.4)     0.568
  Hypoglycemia                        18 (12.0)     5 (3.4)       0.007
  Dizziness                           12 (8.0)      8 (5.5)       0.412
──────────────────────────────────────────────────────────────────────────
Adverse events coded using MedDRA version 24.0
```

**Key elements:**
- Overall AE summary
- Serious AEs highlighted
- Deaths reported
- Common AEs (typically ≥5% or ≥10% threshold)
- MedDRA coding indicated

### Laboratory Abnormalities Table

**Shift tables showing changes from baseline:**

```
Table 4. Laboratory Values Meeting Predefined Criteria for Abnormality

Laboratory Parameter                 Treatment      Control
                                     (N=150)        (N=145)
                                     n (%)          n (%)
──────────────────────────────────────────────────────────────────────────
ALT >3× ULN                          8 (5.3)        3 (2.1)
AST >3× ULN                          5 (3.3)        2 (1.4)
Total bilirubin >2× ULN              2 (1.3)        1 (0.7)
Creatinine >1.5× baseline            12 (8.0)       5 (3.4)
Hemoglobin <10 g/dL                  3 (2.0)        2 (1.4)
Platelets <100 × 10³/μL              1 (0.7)        0 (0.0)
──────────────────────────────────────────────────────────────────────────
ULN = upper limit of normal; ALT = alanine aminotransferase; 
AST = aspartate aminotransferase
```

### Patient Disposition Table (CONSORT Format)

```
Table 5. Patient Disposition

Disposition                              Treatment     Control       Total
                                         (N=150)       (N=145)       (N=295)
────────────────────────────────────────────────────────────────────────────
Screened                                 -             -             425

Randomized                               150           145           295

Completed study                          135 (90.0)    130 (89.7)    265 (89.8)

Discontinued, n (%)                      15 (10.0)     15 (10.3)     30 (10.2)
  Adverse event                          8 (5.3)       4 (2.8)       12 (4.1)
  Lack of efficacy                       2 (1.3)       5 (3.4)       7 (2.4)
  Lost to follow-up                      3 (2.0)       4 (2.8)       7 (2.4)
  Withdrawal of consent                  2 (1.3)       2 (1.4)       4 (1.4)

Included in efficacy analysis
  ITT population                         150 (100)     145 (100)     295 (100)
  Per-protocol population                142 (94.7)    138 (95.2)    280 (94.9)

Included in safety analysis              150 (100)     145 (100)     295 (100)
────────────────────────────────────────────────────────────────────────────
ITT = intent-to-treat
```

## Figures for Clinical Data

### Figure Design Principles

**General guidelines:**
- Clear, concise caption/legend below figure
- Numbered sequentially (Figure 1, Figure 2, etc.)
- Axis labels with units
- Legible font size (minimum 8-10 point)
- High resolution (300 dpi for print, 150 dpi for web)
- Color-blind friendly palette
- Black and white compatible (use different symbols/patterns)

**Figure caption:**
- Describes what is shown
- Explains symbols, error bars, statistical annotations
- Defines abbreviations
- Provides context for interpretation

### CONSORT Flow Diagram

**Purpose:** Show patient flow through randomized trial

```
                    Assessed for eligibility (n=425)
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
    Excluded (n=130)                                │
    • Not meeting inclusion criteria (n=85)         │
    • Declined to participate (n=32)                │
    • Other reasons (n=13)                          │
                                                    │
                                           Randomized (n=295)
                                                    │
                    ┌───────────────────────────────┴───────────────────────────────┐
                    │                                                               │
        Allocated to Treatment (n=150)                             Allocated to Control (n=145)
        • Received allocated intervention (n=148)                  • Received allocated intervention (n=143)
        • Did not receive allocated intervention (n=2)             • Did not receive allocated intervention (n=2)
          Reasons: withdrew consent before treatment                Reasons: withdrew consent before treatment
                    │                                                               │
        ┌───────────┴────────────┐                                  ┌──────────────┴─────────────┐
        │                        │                                  │                            │
    Lost to follow-up (n=3)  Discontinued (n=12)              Lost to follow-up (n=4)     Discontinued (n=11)
                             • Adverse events (n=8)                                       • Adverse events (n=4)
                             • Lack of efficacy (n=2)                                     • Lack of efficacy (n=5)
                             • Withdrew consent (n=2)                                     • Withdrew consent (n=2)
                    │                                                               │
            Analyzed (n=150)                                               Analyzed (n=145)
            • ITT analysis (n=150)                                         • ITT analysis (n=145)
            • Per-protocol analysis (n=142)                                • Per-protocol analysis (n=138)
            • Excluded from analysis (n=0)                                 • Excluded from analysis (n=0)
```

### Kaplan-Meier Survival Curve

**Purpose:** Show time-to-event data

**Elements:**
- X-axis: Time (weeks, months, years)
- Y-axis: Probability of event-free survival (0 to 1 or 0% to 100%)
- Separate curves for each treatment group
- Censored observations marked (often with vertical tick marks)
- Number at risk table below graph
- Median survival time indicated
- Log-rank p-value
- Hazard ratio with 95% CI

**Caption example:**
```
Figure 1. Kaplan-Meier Curves for Overall Survival

Kaplan-Meier estimates of overall survival in the treatment and control groups.
Tick marks indicate censored observations. Number at risk shown below graph.
Log-rank p<0.001. Median survival: Treatment 24.5 months (95% CI: 22.1-26.8),
Control 18.2 months (95% CI: 16.5-20.1). Hazard ratio 0.68 (95% CI: 0.55-0.84).
```

### Forest Plot

**Purpose:** Display subgroup analyses or meta-analysis results

**Elements:**
- Point estimates (squares or diamonds)
- Size of symbol proportional to precision (inverse variance) or sample size
- Horizontal lines showing 95% CI
- Vertical line at null effect (HR=1.0, OR=1.0, or difference=0)
- Subgroup labels on left
- Effect size values on right
- Overall estimate (if meta-analysis)
- Heterogeneity statistics (I², p-value)

**Caption example:**
```
Figure 2. Forest Plot of Treatment Effect by Subgroup

Effect of treatment vs. control on primary endpoint across pre-specified subgroups.
Squares represent point estimates; horizontal lines represent 95% confidence intervals.
Square size is proportional to subgroup sample size. Overall effect shown as diamond.
p-value for interaction testing heterogeneity of treatment effect across subgroups.
```

### Box Plot

**Purpose:** Show distribution of continuous variable

**Elements:**
- Box: IQR (25th to 75th percentile)
- Line in box: Median
- Whiskers: Extend to most extreme data point within 1.5 × IQR
- Outliers: Points beyond whiskers (often shown as circles)
- X-axis: Groups or time points
- Y-axis: Continuous variable with units

### Scatter Plot with Regression

**Purpose:** Show relationship between two continuous variables

**Elements:**
- X-axis: Independent variable
- Y-axis: Dependent variable
- Individual data points
- Regression line (if appropriate)
- Regression equation
- R² value
- P-value for slope
- 95% confidence interval for regression line (optional, shown as shaded area)

### Spaghetti Plot

**Purpose:** Show individual trajectories over time

**Elements:**
- X-axis: Time
- Y-axis: Outcome variable
- Individual patient lines (often semi-transparent)
- Mean trajectory (bold line)
- Separate colors for treatment groups

### Bar Chart

**Purpose:** Compare proportions or means across groups

**Elements:**
- Clear separation between bars
- Error bars (SEM or 95% CI)
- Y-axis starts at 0 (do not truncate for bar charts)
- Group labels on X-axis
- Value labels on Y-axis with units
- Statistical significance indicated (p-values or asterisks)

**Avoid:**
- 3D bar charts (distort perception)
- Excessive decoration
- Truncated Y-axis for bars

### Line Graph

**Purpose:** Show changes over time

**Elements:**
- X-axis: Time (with consistent intervals)
- Y-axis: Outcome variable
- Separate lines for each group (different colors/patterns)
- Data points marked (circles, squares, triangles)
- Error bars at each time point (SE or 95% CI)
- Legend identifying groups
- Grid lines (optional, light gray)

### Histogram

**Purpose:** Show distribution of continuous variable

**Elements:**
- X-axis: Variable (divided into bins)
- Y-axis: Frequency or density
- Appropriate bin width (not too few, not too many)
- Overlay normal distribution curve (if testing normality)

## Special Considerations for Clinical Data

### Presenting Proportions

**Numerator and denominator:**
- Always provide both: 25/100 (25%)
- Not just percentage (25%)

**Percentages:**
- No decimal places if n<100
- 1 decimal place if n≥100
- Never report >1 decimal place for percentages

**Confidence intervals for proportions:**
- Wilson score interval or exact binomial (better than Wald for small samples)
- Always report with percentage

### Presenting Continuous Data

**Measures of central tendency:**
- Mean for normally distributed data
- Median for skewed data or ordinal data
- Report both if distribution unclear

**Measures of dispersion:**
- **Standard deviation (SD)**: Describes variability in data
- **Standard error (SE)**: Describes precision of mean estimate
- **95% Confidence interval**: Preferred for inferential statistics
- **Interquartile range (IQR)**: With median for skewed data
- **Range**: Min to max

**When to use each:**
- Descriptive statistics → Mean (SD) or Median (IQR)
- Inferential statistics → Mean (95% CI) or Mean (SE)
- Never use ± without specifying SD, SE, or CI

### Presenting P-values

**Reporting guidelines:**
- Report exact p-values to 2-3 decimal places (p=0.042)
- For very small p-values, use p<0.001 (not p=0.000)
- Do not report as "NS" or "p=NS"
- For non-significant results, report exact p-value (p=0.18, not p>0.05)
- Specify two-tailed unless pre-specified one-tailed
- Correct for multiple comparisons when appropriate
- Report significance threshold used (α=0.05 is standard)

**Avoid:**
- p<0.05 (report exact value)
- p=0.00 (impossible)
- Multiple decimal places (p=0.04235891)

### Statistical Significance Indicators

**Options:**
1. Report p-values in table
2. Use asterisks with legend:
   - *p<0.05
   - **p<0.01
   - ***p<0.001
3. Use confidence intervals (preferred)

### Confidence Intervals

**Reporting:**
- 95% CI is standard
- Format: (lower limit, upper limit)
- Or: lower limit to upper limit
- Or: lower limit-upper limit

**Interpretation:**
- If CI for difference excludes 0 → significant
- If CI for ratio excludes 1 → significant
- Width of CI indicates precision

### Missing Data

**Indicate clearly:**
- Footnote explaining missing data
- State clearly if analysis is complete case
- Describe imputation method if used
- Report amount of missing data per variable

### Decimal Places and Rounding

**General rules:**
- Report to level of measurement precision
- Consistent decimal places within table
- Round p-values to 2-3 decimal places
- Round percentages to 0-1 decimal place
- Round means/medians to 1-2 decimal places
- Include appropriate significant figures

## Software for Creating Figures

**Statistical software:**
- R (ggplot2) - highly customizable
- GraphPad Prism - user-friendly for biomedical
- SAS, Stata, SPSS - comprehensive statistical packages
- Python (matplotlib, seaborn) - flexible and powerful

**General graphics software:**
- Adobe Illustrator - professional publication-quality
- Inkscape - free vector graphics editor
- PowerPoint - basic graphs, easy to use
- BioRender - biological schematics and figures

## Color Schemes

**Color-blind friendly palettes:**
- Avoid red-green combinations
- Use blue-orange, blue-yellow
- Include shape/pattern differences
- Test figures in grayscale

**Recommended palettes:**
- ColorBrewer (designed for data visualization)
- Viridis (perceptually uniform)
- IBM Color Blind Safe Palette

## Image Quality Standards

**Resolution:**
- 300 dpi for print publication
- 150 dpi for web/screen
- Vector graphics (PDF, SVG) preferred for graphs

**File formats:**
- TIFF or EPS for print
- PNG for web
- PDF for vector graphics
- JPEG acceptable for photographs (high quality)

**Image editing:**
- No manipulation that alters data
- Only acceptable adjustments: brightness, contrast, color balance applied to entire image
- Document all adjustments
- Provide original images if requested

---

This reference provides comprehensive guidance for presenting clinical data in tables and figures following best practices and publication standards. Use these guidelines to create clear, accurate, and professional data presentations.

