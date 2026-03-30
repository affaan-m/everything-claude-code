# Figures and Tables Best Practices

## Overview

Figures and tables are essential components of scientific papers, serving to display data patterns, summarize results, and provide evidence for conclusions. Effective visual displays enhance comprehension and can sustain reader interest while illustrating trends, patterns, and relationships not easily conveyed through text alone.

A recent Nature Cell Biology checklist (2025) emphasizes that creating clear and engaging scientific figures is crucial for communicating complex data with clarity, accessibility, and design excellence.

## When to Use Tables vs. Figures

### Use Tables When:
- Presenting precise numerical values that readers need to reference
- Comparing exact measurements across multiple variables
- Showing detailed statistical outputs
- Data cannot be adequately summarized in 1-2 sentences
- Readers need access to specific data points
- Displaying demographic or baseline characteristics
- Presenting multiple related statistical tests

**Example use cases:**
- Baseline participant characteristics (age, sex, diagnosis, etc.)
- Detailed statistical model outputs (coefficients, p-values, confidence intervals)
- Dose-response data with exact values
- Gene expression levels for specific genes
- Chemical compositions or concentrations

### Use Figures When:
- Showing trends over time
- Displaying relationships or correlations
- Comparing groups visually
- Illustrating distributions
- Demonstrating patterns not easily seen in numbers
- Showing images (microscopy, radiography, etc.)
- Displaying workflows, diagrams, or schematics

**Example use cases:**
- Growth curves or time series
- Dose-response curves
- Scatter plots showing correlations
- Bar graphs comparing treatment groups
- Histograms showing distributions
- Heatmaps displaying patterns across conditions
- Microscopy images or Western blots

### General Decision Rule

**Can the information be conveyed in 1-2 sentences of text?**
- Yes → Use text only
- No, and precise values are needed → Use a table
- No, and patterns/trends are most important → Use a figure

## Core Design Principles

### 1. Self-Explanatory Display Items

**Each figure or table must stand alone without requiring the main text.**

**Essential elements:**
- Complete, descriptive caption
- All abbreviations defined (in caption or footnote)
- Units of measurement clearly indicated
- Sample sizes (n) reported
- Statistical significance annotations explained
- Legend included (for figures with multiple data series)

**Example of self-explanatory caption:**
```
Figure 1. Mean systolic blood pressure (SBP) over 12 weeks in intervention and control groups.
Error bars represent standard error of the mean (SEM). Asterisks indicate significant
differences between groups at each time point (*p < 0.05, **p < 0.01, ***p < 0.001,
two-tailed t-tests). n = 48 per group. BP = blood pressure; SEM = standard error of mean.
```

### 2. Avoid Redundancy

**Do not duplicate information between text, tables, and figures.**

**Bad practice:**
```
"Mean age was 45.2 years in Group A and 47.8 years in Group B. Mean BMI was 26.3 in
Group A and 28.1 in Group B. Mean systolic blood pressure was 132 mmHg in Group A..."
[Also shown in Table 1]
```

**Good practice:**
```
"Baseline characteristics were similar between groups (Table 1), with no significant
differences in age, BMI, or blood pressure (all p > 0.15)."
[Details in Table 1]
```

**Key principle:** Text should highlight key findings from tables/figures, not repeat all data.

### 3. Consistency

**Maintain uniform formatting across all display items:**
- Font types and sizes
- Color schemes
- Terminology and abbreviations
- Axis labels and units
- Statistical annotation methods
- Figure styles (all line graphs should look similar)

**Example of inconsistency to avoid:**
- Figure 1 uses "standard error" while Figure 2 uses "SE"
- Figure 1 has blue/red color scheme while Figure 2 uses green/yellow
- Table 1 reports p-values as "p = 0.023" while Table 2 uses "p-value = .023"

### 4. Optimal Quantity

**Follow the "one display item per 1000 words" guideline.**

**Typical manuscript:**
- 3000-4000 words → 3-4 tables/figures total
- 5000-6000 words → 5-6 tables/figures total

**Quality over quantity:** A few well-designed, information-rich displays are better than many redundant or poorly designed ones.

### 5. Clarity and Simplicity

**Avoid cluttered or overly complex displays:**
- Don't include too many variables in one figure
- Use clear, readable fonts (minimum 8-10 pt in final size)
- Provide adequate spacing between elements
- Use high contrast (especially for color-blind accessibility)
- Remove unnecessary grid lines, borders, or decoration
- Maximize data-ink ratio (Tufte principle: minimize non-data ink)

## Figure Types and When to Use Them

### Bar Graphs

**Best for:**
- Comparing discrete categories or groups
- Showing counts or frequencies
- Displaying mean values with error bars

**Design guidelines:**
- Start y-axis at zero (unless showing small differences in large values)
- Order bars logically (by size, alphabetically, or temporally)
- Use error bars (SD, SEM, or CI) consistently
- Include sample sizes
- Avoid 3D effects (they distort perception)

**Common mistakes:**
- Not starting at zero (can exaggerate differences)
- Too many categories (consider table instead)
- Missing error bars

**Example applications:**
- Mean gene expression across tissue types
- Treatment group comparisons
- Frequency of adverse events

### Line Graphs

**Best for:**
- Showing trends over continuous variables (usually time)
- Displaying multiple groups on same axes
- Illustrating dose-response relationships

**Design guidelines:**
- Use different line styles or colors for groups
- Include data point markers for sparse data
- Show error bars or shaded confidence intervals
- Label axes clearly with units
- Use consistent intervals on x-axis

**Common mistakes:**
- Connecting discrete data points that shouldn't be connected
- Too many lines making graph unreadable
- Inconsistent time intervals without indication

**Example applications:**
- Growth curves
- Time course experiments
- Survival curves (Kaplan-Meier plots)
- Pharmacokinetic profiles

### Scatter Plots

**Best for:**
- Showing relationships between two continuous variables
- Displaying correlations
- Identifying outliers

**Design guidelines:**
- Include trend line or regression line with equation and R²
- Report correlation coefficient and p-value
- Use semi-transparent points if data overlap
- Consider logarithmic scales for wide ranges
- Mark outliers if relevant

**Common mistakes:**
- Not showing individual data points
- Using scatter plots for categorical data
- Missing correlation statistics

**Example applications:**
- Correlation between biomarkers
- Relationship between dose and response
- Method comparison (Bland-Altman plots)

### Box Plots (Box-and-Whisker Plots)

**Best for:**
- Showing distributions and spread
- Comparing distributions across groups
- Identifying outliers

**Design guidelines:**
- Clearly define box elements (median, quartiles, whiskers)
- Show or note outliers explicitly
- Consider violin plots for small sample sizes
- Overlay individual data points when n < 20

**Common mistakes:**
- Not defining what whiskers represent
- Using for very small samples without showing raw data
- Not marking outliers

**Example applications:**
- Comparing distributions across treatment groups
- Showing variability in measurements
- Quality control data

### Heatmaps

**Best for:**
- Displaying matrices of data
- Showing patterns across many conditions
- Representing clustering or grouping

**Design guidelines:**
- Use color scales that are perceptually uniform
- Include color scale bar with units
- Consider hierarchical clustering for rows/columns
- Use appropriate color scheme (diverging vs. sequential)
- Make axes labels readable

**Common mistakes:**
- Poor color choice (rainbow scales are often misleading)
- Too many rows/columns making labels unreadable
- No color scale bar

**Example applications:**
- Gene expression across samples
- Correlation matrices
- Time-series data across multiple variables

### Images (Microscopy, Gels, Blots)

**Best for:**
- Showing representative examples
- Demonstrating morphology or localization
- Presenting gel electrophoresis or Western blots

**Design guidelines:**
- Include scale bars (not magnification in caption)
- Show representative images with quantification in separate panel
- Label important features with arrows or labels
- Ensure adequate resolution (usually 300+ dpi)
- Show full, unmanipulated images with cropping noted
- Include all relevant controls

**Common mistakes:**
- No scale bar
- Over-processed or manipulated images
- Cherry-picking best images without quantification
- Insufficient resolution

**Example applications:**
- Histological sections
- Immunofluorescence
- Western blots
- Gel electrophoresis

### Forest Plots

**Best for:**
- Displaying meta-analysis results
- Showing effect sizes with confidence intervals
- Comparing multiple studies or subgroups

**Design guidelines:**
- Include point estimates and CI for each study
- Show overall pooled estimate clearly
- Include line of no effect (typically at 1.0 or 0)
- List study details or weights

**Example applications:**
- Meta-analyses
- Systematic reviews
- Subgroup analyses

### Flow Diagrams

**Best for:**
- Study participant flow (CONSORT diagrams)
- Systematic review search process (PRISMA diagrams)
- Experimental workflows

**Design guidelines:**
- Follow reporting guideline templates (CONSORT, PRISMA)
- Use consistent shapes and connectors
- Include numbers at each stage
- Clearly show inclusions and exclusions

## Table Design Guidelines

### Structure

**Basic anatomy:**
1. **Table number and title** (above table)
2. **Column headers** (with units)
3. **Row labels**
4. **Data cells** (with appropriate precision)
5. **Footnotes** (below table for abbreviations, statistics, notes)

### Formatting Best Practices

**Column headers:**
- Use clear, concise labels
- Include units in parentheses
- Use abbreviations sparingly (define in footnote)

**Data presentation:**
- Align decimal points in columns
- Use consistent decimal places (usually 1-2 for means)
- Report same precision across rows/columns
- Use en-dash (–) for "not applicable"
- Use appropriate precision (don't over-report)

**Statistical annotations:**
- Use superscript letters (ᵃ, ᵇ, ᶜ) or symbols (*, †, ‡) for footnotes
- Define p-value thresholds clearly
- Report exact p-values when possible (p = 0.032, not p < 0.05)

**Footnotes:**
- Define all abbreviations
- Explain statistical tests used
- Note any missing data
- Indicate data source if not original

### Example Table Format

```
Table 1. Baseline Characteristics of Study Participants

Characteristic          Intervention (n=50)   Control (n=48)    p-value
─────────────────────────────────────────────────────────────────────────
Age, years               45.3 ± 8.2           47.1 ± 9.1        0.28
Male sex, n (%)          28 (56)              25 (52)           0.71
BMI, kg/m²               26.3 ± 3.8           27.1 ± 4.2        0.32
Current smoker, n (%)    12 (24)              15 (31)           0.42
Systolic BP, mmHg        132 ± 15             134 ± 18          0.54
─────────────────────────────────────────────────────────────────────────

Data presented as mean ± SD or n (%). p-values from independent t-tests for
continuous variables and χ² tests for categorical variables. BMI = body mass
index; BP = blood pressure; SD = standard deviation.
```

### Common Table Mistakes

1. **Excessive complexity** (too many rows/columns)
2. **Insufficient context** (missing units, unclear abbreviations)
3. **Over-precision** (reporting 5 decimal places for p-values)
4. **Missing sample sizes**
5. **No statistical comparisons when appropriate**
6. **Inconsistent formatting** across multiple tables
7. **Duplicate information** with figures or text

## Statistical Presentation in Figures and Tables

### Reporting Requirements

**For each comparison, report:**
1. **Point estimate** (mean, median, proportion)
2. **Measure of variability** (SD, SEM, CI)
3. **Sample size** (n)
4. **Test statistic** (t, F, χ², etc.)
5. **p-value** (exact when p > 0.001)
6. **Effect size** (when appropriate)

### Error Bars

**Choose the appropriate measure:**

| Measure | Meaning | When to Use |
|---------|---------|-------------|
| **SD (Standard Deviation)** | Variability in the data | Showing data spread |
| **SEM (Standard Error of Mean)** | Precision of mean estimate | Showing measurement precision |
| **95% CI (Confidence Interval)** | Range likely to contain true mean | Showing statistical significance |

**Key rule:** Always state which measure is shown.

**Example caption:**
```
"Error bars represent 95% confidence intervals."
NOT: "Error bars represent standard error."
```

**Recommendation:** 95% CI preferred because non-overlapping CIs indicate significant differences.

### Significance Indicators

**Common notation:**
```
* p < 0.05
** p < 0.01
*** p < 0.001
n.s. or NS = not significant
```

**Alternative:** Show exact p-values in table or caption

**Best practice:** Define significance indicators in every figure caption or table footnote.

## Accessibility Considerations

### Color-Blind Friendly Design

**Recommendations:**
- Use color palettes designed for color-blind accessibility
- Don't rely on color alone (add patterns, shapes, or labels)
- Test figures in grayscale
- Avoid red-green combinations

**Color-blind safe palettes:**
- Blue-Orange
- Purple-Yellow
- Colorbrewer2.org palettes
- Viridis, Plasma, Inferno (for heatmaps)

### High Contrast

**Ensure readability:**
- Dark text on light background (or vice versa)
- Avoid low-contrast color combinations (gray on gray)
- Use thick enough lines (minimum 0.5-1 pt)
- Large enough text (minimum 8-10 pt after scaling)

### Screen and Print Compatibility

**Design for both media:**
- Use vector formats when possible (PDF, EPS, SVG)
- Minimum 300 dpi for raster images (TIFF, PNG)
- Test appearance at final print size
- Ensure color figures work in grayscale if printed

## Technical Requirements

### File Formats

**Vector formats** (preferred for graphs and diagrams):
- **PDF**: Universal, preserves quality
- **EPS**: Encapsulated PostScript, publishing standard
- **SVG**: Scalable vector graphics, web-friendly

**Raster formats** (for photos and images):
- **TIFF**: Uncompressed, high quality, large files
- **PNG**: Lossless compression, good for screen
- **JPEG**: Lossy compression, avoid for data figures

**Avoid:**
- Low-resolution screenshots
- Figures copied from presentations (usually too low resolution)
- Heavily compressed JPEGs (artifacts)

### Resolution Requirements

**Minimum standards:**
- **Line art** (graphs, diagrams): 300-600 dpi
- **Halftones** (photos, grayscale): 300 dpi
- **Combination** (images with labels): 300-600 dpi

**Best practice:** Create figures at final size and resolution.

### Dimensions

**Check journal requirements:**
- **Single column**: typically 8-9 cm (3-3.5 inches) wide
- **Double column**: typically 17-18 cm (6.5-7 inches) wide
- **Full page**: varies by journal

**Recommendation:** Design figures to fit single column when possible.

### Image Manipulation

**Allowed:**
- Brightness/contrast adjustment applied to entire image
- Color balance adjustment
- Cropping (with notation)
- Rotation

**NOT allowed:**
- Selective editing (e.g., enhancing bands in gels)
- Removing background artifacts
- Splicing images without clear indication
- Any manipulation that obscures, eliminates, or misrepresents data

**Ethical requirement:** Report all image adjustments in Methods section.

## Figure and Table Numbering

### Numbering System

**Figures:**
- Number consecutively in order of first mention in text
- Use Arabic numerals: Figure 1, Figure 2, Figure 3...
- Supplementary figures: Figure S1, Figure S2...

**Tables:**
- Number separately from figures
- Use Arabic numerals: Table 1, Table 2, Table 3...
- Supplementary tables: Table S1, Table S2...

### In-Text References

**Format:**
```
"Results are shown in Figure 1."
"Participant characteristics are presented in Table 2."
"Multiple analyses confirmed this finding (Figures 3-5)."
```

**NOT:**
```
"Figure 1 below shows..." (avoid "above" or "below" - pagination may change)
"The figure shows..." (always use specific number)
```

## Captions

### Caption Structure

**For figures:**
```
Figure 1. [One-sentence title]. [Additional description sentences providing context,
defining abbreviations, explaining panels, describing statistical tests, and noting
sample sizes].
```

**For tables:**
```
Table 1. [Descriptive Title]
[Table contents]
[Footnotes defining abbreviations, statistical methods, and providing additional context]
```

### Caption Content

**Essential information:**
1. What is being shown (brief title)
2. Detailed description of content
3. Definition of all abbreviations and symbols
4. Sample sizes
5. Statistical tests used
6. Meaning of error bars or annotations
7. Panel labels explained (if multiple panels)

**Example comprehensive caption:**
```
Figure 3. Cognitive performance improves with treatment over 12 weeks. (A) Mean Mini-Mental
State Examination (MMSE) scores at baseline, 6 weeks, and 12 weeks for treatment (blue) and
placebo (gray) groups. (B) Individual participant trajectories for treatment group. Error bars
represent 95% confidence intervals. Asterisks indicate significant between-group differences
(*p < 0.05, **p < 0.01, ***p < 0.001; repeated measures ANOVA with Bonferroni correction).
n = 42 treatment, n = 40 placebo. MMSE scores range from 0-30, with higher scores indicating
better cognitive function.
```

## Journal-Specific Requirements

### Before Creating Figures/Tables

**Check journal guidelines for:**
- Preferred file formats
- Resolution requirements
- Color specifications (RGB vs. CMYK)
- Maximum number of display items
- Dimension requirements
- Font restrictions
- Whether to embed figures in manuscript or submit separately

### During Submission

**Prepare checklist:**
- [ ] All figures/tables numbered correctly
- [ ] All cited in text in order
- [ ] Captions complete and self-explanatory
- [ ] Abbreviations defined
- [ ] Correct file format and resolution
- [ ] Appropriate size/dimensions
- [ ] High enough quality for print
- [ ] Color-blind friendly (if using color)
- [ ] Permissions obtained (if adapting from others' work)

## Common Pitfalls to Avoid

### Content Issues
1. **Duplication** between text, tables, and figures
2. **Insufficient context** (unclear what is shown)
3. **Too much information** in one display
4. **Missing key information** (sample sizes, units, statistics)
5. **Cherry-picking** data without showing full picture

### Design Issues
6. **Poor color choices** (not color-blind friendly)
7. **Inconsistent formatting** across displays
8. **Cluttered or busy designs**
9. **Too small text** at final size
10. **Misleading visualizations** (truncated axes, 3D distortions)

### Technical Issues
11. **Insufficient resolution** (pixelated when printed)
12. **Wrong file format** (lossy compression, non-vector graphs)
13. **Improper image manipulation** (undeclared editing)
14. **Missing scale bars** on images
15. **Figures that don't work in grayscale** (if journal prints in B&W)

## Tools for Creating Figures

### Graphing Software
- **R (ggplot2)**: Highly customizable, publication-quality, reproducible
- **Python (matplotlib, seaborn)**: Flexible, programmable, widely used
- **GraphPad Prism**: User-friendly, statistics integrated, common in life sciences
- **Origin**: Advanced graphing, popular in physics/engineering
- **Excel**: Basic graphs, widely available, limited customization
- **MATLAB**: Technical computing, good for complex visualizations

### Image Processing
- **ImageJ/Fiji**: Free, powerful, widely used in microscopy
- **Adobe Photoshop**: Professional standard, extensive tools
- **GIMP**: Free alternative to Photoshop
- **Adobe Illustrator**: Vector graphics, figure assembly
- **Inkscape**: Free vector graphics editor

### Best Practices for Software Choice
- Use tools that produce vector output for graphs
- Learn one tool well rather than many superficially
- Script your figure generation for reproducibility
- Save original data files separately from figure files

## Journal-Specific Figure and Table Requirements

### Understanding Journal Expectations

**Different journals have vastly different requirements for figures and tables.** Before creating display items, always consult your target journal's author guidelines for specific requirements.

### Common Journal-Specific Variations

| Aspect | Variation by Journal | Example Journals |
|--------|---------------------|------------------|
| **Number allowed** | 4-10 display items for research articles | Nature (4-6), PLOS ONE (unlimited), Science (4-5) |
| **File format** | TIFF, EPS, PDF, AI, or specific formats | Nature (EPS/PDF for line art), Cell (TIFF preferred) |
| **Resolution** | 300-1000 dpi depending on type | JAMA (300-600 dpi), Nature (300+ dpi) |
| **Color** | RGB vs. CMYK | Print journals: CMYK; Online: RGB |
| **Dimensions** | Single vs. double column widths | Nature (89mm or 183mm), Science (specific templates) |
| **Figure legends** | Length limits, specific format | Some journals: 150 word max per legend |
| **Table format** | Editable vs. image | Most prefer editable tables, not images |

### Venue-Specific Requirements Summary

| Venue Type | Display Limit | Format | Resolution | Key Features |
|-----------|--------------|--------|------------|--------------|
| **Nature/Science** | 4-6 main | EPS/PDF/TIFF | 300+ dpi | Extended data allowed; multi-panel figures |
| **Medical journals** | 3-5 | TIFF/EPS | 300-600 dpi | CONSORT diagrams; conservative design |
| **PLOS ONE** | Unlimited | TIFF/EPS/PDF | 300+ dpi | Must work in grayscale |
| **ML conferences** | 4-6 in 8-page limit | PDF (vector preferred) | Print quality | Compact design; info-dense figures |

**ML Conference Figure Requirements:**

**NeurIPS/ICML/ICLR:**
- Figures count toward page limit (typically 8 pages including references)
- Vector graphics (PDF) preferred for plots
- High information density expected
- Supplementary material for additional figures
- LaTeX template provided (use neurips_2024.sty or equivalent)
- Figures must be legible when printed in grayscale

**Computer Vision (CVPR/ICCV/ECCV):**
- Qualitative results figures critical
- Side-by-side comparisons standard
- Must show failure cases
- Supplementary material for videos/additional examples
- Often 6-8 main figures in 8-page papers

**Key ML conference figure practices:**
- **Ablation studies**: Compact tables/plots showing component contributions
- **Architecture diagrams**: Clear, professional block diagrams
- **Performance plots**: Include error bars/confidence intervals
- **Qualitative examples**: Show diverse, representative samples
- **Comparison tables**: Concise, bold best results

### Evaluation Criteria Across Venues

**What reviewers check:**
- **Necessity**: Each figure/table supports conclusions
- **Quality**: Professional appearance, sufficient resolution
- **Clarity**: Self-explanatory with captions; proper labeling
- **Statistics**: Error bars, sample sizes, significance indicators
- **Consistency**: Formatting uniform across display items

**Common rejection reasons:**
- Poor resolution or image quality
- Missing error bars or sample sizes
- Unclear or missing labels
- Too many figures (exceeds venue limits)
- Figures duplicate text information

**ML conference specific evaluation:**
- **Ablation studies**: Must demonstrate component contributions
- **Baselines**: Comparison with relevant prior work required
- **Error bars**: Confidence intervals/std dev expected
- **Architecture diagrams**: Must be clear and informative
- **Space efficiency**: Information density valued (page limits strict)

### Caption/Legend Styles by Venue

| Venue Type | Style | Example Features |
|-----------|-------|------------------|
| **Nature/Science** | Concise | Brief; *P<0.05; minimal methods |
| **Medical** | Formal | Title case; 95% CIs; statistical tests spelled out |
| **PLOS/BMC** | Detailed | Complete sentences; all abbreviations defined |
| **ML conferences** | Technical | Architecture details; hyperparameters; dataset info |

**ML conference caption example:**
```
Figure 1. Architecture of proposed model. (a) Encoder with 12 transformer layers.
(b) Attention visualization. (c) Performance vs. baseline on ImageNet (error bars:
95% CI over 3 runs).
```
- Technical precision
- Hyperparameters when relevant
- Dataset/experimental setup details
- Compact to save space

### Quick Adaptation Guide

**When changing venues:**
- **Journal → ML conference**: Compress figures; increase information density; add hyperparameters to captions
- **ML conference → journal**: Expand captions; separate dense figures; add more methodological detail
- **Specialist → broad journal**: Simplify; add explanatory panels; define terms in captions
- **Broad → specialist journal**: Add technical detail; use field-standard plot types

### Pre-Submission Figure/Table Checklist

**Technical (all venues):**
- [ ] Meets format requirements (PDF/EPS/TIFF)
- [ ] Sufficient resolution (300+ dpi) 
- [ ] Fits venue dimensions/page limits
- [ ] Self-explanatory captions
- [ ] All symbols/abbreviations defined
- [ ] Error bars defined; sample sizes noted

**ML conferences additional:**
- [ ] Figures fit in page limit (8-9 pages typical)
- [ ] Comparison with baselines shown
- [ ] Ablation studies included
- [ ] Architecture diagram clear
- [ ] Legible in grayscale

## Checklist for Final Review

### Before Submission

**For every figure:**
- [ ] High enough resolution (300+ dpi)?
- [ ] Correct file format per journal requirements?
- [ ] Correct dimensions for journal (single/double column)?
- [ ] Meets journal's RGB/CMYK requirements?
- [ ] Self-explanatory caption with all abbreviations defined?
- [ ] Caption length within journal limits?
- [ ] All symbols/colors explained in caption or legend?
- [ ] Error bars included and defined?
- [ ] Sample sizes noted?
- [ ] Statistical tests described?
- [ ] Axes labeled with units?
- [ ] Readable text at final print size?
- [ ] Works in grayscale or color-blind friendly?
- [ ] Referenced in text in correct order?
- [ ] Style matches target journal's published figures?

**For every table:**
- [ ] Clear, descriptive title?
- [ ] Title capitalization matches journal style?
- [ ] Column headers include units?
- [ ] Appropriate numerical precision?
- [ ] Abbreviations defined in footnotes?
- [ ] Statistical methods explained?
- [ ] Sample sizes included?
- [ ] Consistent formatting with other tables?
- [ ] Editable format (not image)?
- [ ] Referenced in text in correct order?
- [ ] Formatting matches target journal's tables?

**Overall:**
- [ ] Number of display items within journal limits?
- [ ] Appropriate number of display items (~1 per 1000 words)?
- [ ] No duplication between text, figures, and tables?
- [ ] Consistent formatting across all display items?
- [ ] All display items necessary (each tells important part of story)?
- [ ] Visual style matches target journal?
- [ ] Quality comparable to published examples in journal?
