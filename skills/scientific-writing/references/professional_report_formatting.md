# Professional Report Formatting for Scientific Documents

This reference guide covers professional formatting for scientific reports, technical documents, and white papers. Use the `scientific_report.sty` LaTeX style package for consistent, professional output.

---

## When to Use Professional Report Formatting

### Use This Style For:

- **Research reports** - Internal and external research summaries
- **Technical reports** - Detailed technical documentation and analyses
- **White papers** - Position papers and thought leadership documents
- **Grant reports** - Progress reports and final grant reports
- **Policy briefs** - Research-informed policy recommendations
- **Industry reports** - Technical reports for industry audiences
- **Internal research summaries** - Team and stakeholder communications
- **Feasibility studies** - Technical and research feasibility assessments
- **Project documentation** - Research project deliverables

### Do NOT Use This Style For:

- **Journal manuscripts** → Use `venue-templates` skill for journal-specific formatting
- **Conference papers** → Use `venue-templates` skill for conference requirements
- **Academic theses/dissertations** → Use institutional templates
- **Peer-reviewed submissions** → Follow journal author guidelines

**Key Distinction**: Professional report formatting prioritizes visual appeal and readability for general audiences, while journal manuscripts must follow strict publisher requirements.

---

## Overview of scientific_report.sty

The `scientific_report.sty` package provides:

| Feature | Description |
|---------|-------------|
| Typography | Helvetica font family for modern, professional appearance |
| Color Scheme | Coordinated blues, greens, oranges, and purples |
| Box Environments | Colored boxes for organizing content types |
| Tables | Professional styling with alternating rows |
| Figures | Consistent caption formatting |
| Headers/Footers | Professional page headers and footers |
| Scientific Commands | Shortcuts for p-values, effect sizes, statistics |

### Basic Document Setup

```latex
\documentclass[11pt,letterpaper]{report}
\usepackage{scientific_report}

\begin{document}
% Your content here
\end{document}
```

**Compilation**: Use XeLaTeX or LuaLaTeX for proper Helvetica font rendering:
```bash
xelatex document.tex
```

---

## Box Environments for Content Organization

### Purpose and Usage

Colored boxes help readers quickly identify different types of content. Use them strategically to highlight important information.

### Available Box Environments

| Environment | Color | Purpose |
|-------------|-------|---------|
| `keyfindings` | Blue | Major findings, discoveries, key takeaways |
| `methodology` | Green | Methods, procedures, study design |
| `resultsbox` | Blue-green | Statistical results, data highlights |
| `recommendations` | Purple | Recommendations, action items, implications |
| `limitations` | Orange | Limitations, cautions, caveats |
| `criticalnotice` | Red | Critical warnings, safety notices |
| `definition` | Gray | Definitions, notes, supplementary info |
| `executivesummary` | Blue (shadow) | Executive summaries |
| `hypothesis` | Light blue | Research hypotheses |

### Key Findings Box

Use for major findings and important discoveries:

```latex
\begin{keyfindings}[Research Highlights]
Our analysis revealed three significant findings:
\begin{enumerate}
    \item Treatment A was 40% more effective than control (\pvalue{0.001})
    \item Effect sizes were clinically meaningful (\effectsize{d}{0.82})
    \item Benefits persisted at 12-month follow-up
\end{enumerate}
\end{keyfindings}
```

**Best Practices:**
- Use sparingly (1-3 per chapter maximum)
- Reserve for genuinely important findings
- Include specific numbers and statistics
- Write concisely

### Methodology Box

Use for highlighting methods and procedures:

```latex
\begin{methodology}[Study Design]
This double-blind, randomized controlled trial employed a 2×2 factorial
design. Participants (\samplesize{450}) were randomized to one of four
conditions: (1) Treatment A, (2) Treatment B, (3) Combined A+B, or
(4) Placebo control.
\end{methodology}
```

**Best Practices:**
- Summarize key methodological features
- Use at the start of methods sections
- Include sample size and design type
- Keep technical but accessible

### Results Box

Use for highlighting specific statistical results:

```latex
\begin{resultsbox}[Primary Outcome Analysis]
Mixed-effects regression revealed a significant treatment × time
interaction, \effectsize{F(3, 446)}{8.72}, \psig{< 0.001},
$\eta^2_p$ = 0.055, indicating differential improvement across
treatment conditions over the study period.
\end{resultsbox}
```

**Best Practices:**
- Report complete statistical information
- Use scientific notation commands
- Include effect sizes alongside p-values
- One box per major analysis

### Recommendations Box

Use for recommendations and implications:

```latex
\begin{recommendations}[Clinical Practice Guidelines]
Based on our findings, we recommend:
\begin{enumerate}
    \item \textbf{Primary recommendation:} Implement screening protocol
        for high-risk populations.
    \item \textbf{Secondary recommendation:} Adjust treatment intensity
        based on baseline severity scores.
    \item \textbf{Monitoring:} Reassess at 3-month intervals.
\end{enumerate}
\end{recommendations}
```

**Best Practices:**
- Make recommendations specific and actionable
- Prioritize with clear labels
- Link to supporting evidence
- Include implementation guidance

### Limitations Box

Use for limitations, caveats, and cautions:

```latex
\begin{limitations}[Study Limitations]
Several limitations should be considered:
\begin{itemize}
    \item \textbf{Sample:} Participants were recruited from academic
        medical centers, limiting generalizability to community settings.
    \item \textbf{Design:} The observational design precludes causal
        inference about treatment effects.
    \item \textbf{Attrition:} 15% dropout rate may introduce bias.
\end{itemize}
\end{limitations}
```

**Best Practices:**
- Be honest and thorough
- Explain implications of each limitation
- Suggest how future research could address limitations
- Don't over-qualify findings

### Critical Notice Box

Use for critical warnings or safety information:

```latex
\begin{criticalnotice}[Safety Warning]
\textbf{Contraindication:} This intervention is contraindicated for
patients with [condition]. Monitor for [adverse effects] and discontinue
immediately if [symptoms] occur. Report serious adverse events to [contact].
\end{criticalnotice}
```

**Best Practices:**
- Reserve for genuinely critical information
- Be clear and direct
- Include specific actions to take
- Provide contact information if relevant

### Definition Box

Use for definitions and explanatory notes:

```latex
\begin{definition}[Effect Size]
An \textbf{effect size} is a quantitative measure of the magnitude of a
phenomenon. Unlike significance tests, effect sizes are independent of
sample size and allow comparison across studies. Common measures include
Cohen's \textit{d} for mean differences and Pearson's \textit{r} for
correlations.
\end{definition}
```

**Best Practices:**
- Define technical terms at first use
- Keep definitions concise
- Include practical interpretation guidance
- Use for audience-appropriate terms

---

## Professional Table Formatting

### Design Principles

1. **Clean appearance**: Use `booktabs` rules (`\toprule`, `\midrule`, `\bottomrule`)
2. **Alternating rows**: Apply `\rowcolor{tablealt}` to every other row
3. **Clear headers**: Bold headers for column identification
4. **Appropriate precision**: Report statistics to appropriate decimal places
5. **Complete information**: Include sample sizes, units, and notes

### Standard Data Table

```latex
\begin{table}[htbp]
\centering
\caption{Demographic Characteristics by Treatment Group}
\label{tab:demographics}
\begin{tabular}{@{}lcc@{}}
\toprule
\textbf{Characteristic} & \textbf{Treatment} & \textbf{Control} \\
 & (\samplesize{225}) & (\samplesize{225}) \\
\midrule
Age, years, \meansd{M}{SD} & \meansd{42.3}{12.5} & \meansd{43.1}{11.8} \\
\rowcolor{tablealt} Female, n (\%) & 128 (56.9) & 121 (53.8) \\
Education, years, \meansd{M}{SD} & \meansd{14.2}{2.8} & \meansd{14.5}{2.6} \\
\rowcolor{tablealt} Baseline score, \meansd{M}{SD} & \meansd{52.4}{15.3} & \meansd{51.8}{14.9} \\
\bottomrule
\end{tabular}
\figurenote{No significant differences between groups at baseline (all \textit{p} > .10).}
\end{table}
```

### Results Table with Significance Indicators

```latex
\begin{table}[htbp]
\centering
\caption{Treatment Effects on Primary and Secondary Outcomes}
\label{tab:results}
\begin{tabular}{@{}lcccc@{}}
\toprule
\textbf{Outcome} & \textbf{Treatment} & \textbf{Control} & \textbf{Effect} & \textbf{p} \\
 & \meansd{M}{SD} & \meansd{M}{SD} & \textbf{(d)} & \\
\midrule
Primary outcome & \meansd{68.4}{14.2} & \meansd{54.1}{15.8} & 0.95\sigthree & <.001 \\
\rowcolor{tablealt} Secondary A & \meansd{4.2}{1.1} & \meansd{3.5}{1.2} & 0.61\sigtwo & .003 \\
Secondary B & \meansd{22.8}{5.4} & \meansd{21.2}{5.1} & 0.31\sigone & .042 \\
\rowcolor{tablealt} Secondary C & \meansd{8.9}{2.3} & \meansd{8.5}{2.4} & 0.17\signs & .285 \\
\bottomrule
\end{tabular}

\vspace{0.5em}
{\small \siglegend}
\end{table}
```

### Comparison Table with Quality Ratings

```latex
\begin{table}[htbp]
\centering
\caption{Evidence Summary by Study}
\label{tab:evidence}
\begin{tabular}{@{}llccc@{}}
\toprule
\textbf{Study} & \textbf{Design} & \textbf{N} & \textbf{Quality} & \textbf{Evidence} \\
\midrule
Smith et al. (2024) & RCT & 450 & \qualityhigh & \evidencestrong \\
\rowcolor{tablealt} Jones et al. (2023) & Cohort & 1,250 & \qualitymedium & \evidencemoderate \\
Chen et al. (2023) & Case-control & 320 & \qualitymedium & \evidencemoderate \\
\rowcolor{tablealt} Lee et al. (2022) & Cross-sectional & 890 & \qualitylow & \evidenceweak \\
\bottomrule
\end{tabular}
\end{table}
```

---

## Figure and Caption Styling

### Caption Formatting

The style package automatically formats captions with:
- Blue, bold figure labels
- Gray descriptive text
- Centered alignment with margins

### Standard Figure

```latex
\begin{figure}[htbp]
\centering
\includegraphics[width=0.9\textwidth]{../figures/results_comparison.png}
\caption{Comparison of Outcome Scores by Treatment Condition and Time Point}
\label{fig:results}
\end{figure}
```

### Figure with Source Attribution

```latex
\begin{figure}[htbp]
\centering
\includegraphics[width=0.85\textwidth]{../figures/trend_analysis.png}
\caption{Trends in Key Metrics Over the Study Period}
\figuresource{Study data collected January--December 2024}
\label{fig:trends}
\end{figure}
```

### Figure with Explanatory Note

```latex
\begin{figure}[htbp]
\centering
\includegraphics[width=0.8\textwidth]{../figures/conceptual_model.png}
\caption{Conceptual Model of Hypothesized Relationships}
\figurenote{Solid arrows indicate primary pathways; dashed arrows indicate moderated relationships. Numbers represent standardized coefficients.}
\label{fig:model}
\end{figure}
```

---

## Color Palette and Visual Hierarchy

### Color Usage Guidelines

| Color | Use For | Avoid Using For |
|-------|---------|-----------------|
| Primary Blue | Headers, important findings | Warnings, cautions |
| Science Green | Methods, positive results | Negative findings |
| Orange | Cautions, limitations | Positive findings |
| Red | Critical warnings | Routine content |
| Purple | Recommendations | Findings, methods |
| Gray | Definitions, notes | Key findings |

### Visual Hierarchy

1. **Executive summary boxes** (shadow effect) - Most prominent
2. **Colored content boxes** - High prominence for key content
3. **Tables with color** - Medium prominence for data
4. **Body text** - Standard prominence
5. **Definition boxes** - Lower prominence for supplementary info

### Accessibility Considerations

- Color palette is designed to be distinguishable for common color vision deficiencies
- All boxes have both color AND structural indicators (borders, backgrounds)
- Text maintains sufficient contrast ratios
- Don't rely solely on color to convey meaning

---

## Typography Guidelines

### Font Specifications

| Element | Font | Size | Color |
|---------|------|------|-------|
| Body text | Helvetica | 11pt | Dark gray (#424242) |
| Chapter titles | Helvetica Bold | Huge | Primary blue (#003366) |
| Section headings | Helvetica Bold | Large | Primary blue (#003366) |
| Subsections | Helvetica Bold | large | Secondary blue (#4A90E2) |
| Subsubsections | Helvetica Bold | normalsize | Dark gray (#424242) |

### Spacing

- Line spacing: 1.15 (for readability)
- Paragraph spacing: 0.5em between paragraphs
- Page margins: 1 inch on all sides

### Best Typography Practices

1. **Consistency**: Use the same formatting for similar elements
2. **Hierarchy**: Use visual weight to indicate importance
3. **Readability**: Adequate spacing and contrast
4. **Professionalism**: Avoid mixing fonts or excessive formatting

---

## Scientific Notation Commands Reference

### Statistical Reporting

| Command | Output | When to Use |
|---------|--------|-------------|
| `\pvalue{0.023}` | *p* = 0.023 | Report p-values |
| `\psig{< 0.001}` | ***p*** = < 0.001 | Significant p-values (bold) |
| `\CI{0.45}{0.72}` | 95% CI [0.45, 0.72] | Confidence intervals |
| `\effectsize{d}{0.75}` | d = 0.75 | Effect sizes |
| `\samplesize{250}` | *n* = 250 | Sample sizes |
| `\meansd{42.5}{8.3}` | 42.5 ± 8.3 | Mean with SD |

### Significance Indicators

| Command | Output | Meaning |
|---------|--------|---------|
| `\sigone` | * | p < 0.05 |
| `\sigtwo` | ** | p < 0.01 |
| `\sigthree` | *** | p < 0.001 |
| `\signs` | ns | not significant |
| `\siglegend` | Full legend | For table footnotes |

### Quality and Evidence Ratings

| Command | Output | Meaning |
|---------|--------|---------|
| `\qualityhigh` | **HIGH** (green) | High quality |
| `\qualitymedium` | **MEDIUM** (orange) | Moderate quality |
| `\qualitylow` | **LOW** (red) | Low quality |
| `\evidencestrong` | **Strong** (green) | Strong evidence |
| `\evidencemoderate` | **Moderate** (orange) | Moderate evidence |
| `\evidenceweak` | **Weak** (red) | Weak evidence |

### Trend Indicators

| Command | Symbol | Meaning |
|---------|--------|---------|
| `\trendup` | ▲ (green) | Increasing trend |
| `\trenddown` | ▼ (red) | Decreasing trend |
| `\trendflat` | → (gray) | Stable/no change |

---

## Complete LaTeX Examples

### Executive Summary Example

```latex
\chapter*{Executive Summary}
\addcontentsline{toc}{chapter}{Executive Summary}

\begin{executivesummary}[Report Highlights]
This report presents findings from a comprehensive study of [topic]
involving \samplesize{450} participants across 12 research sites.
The research addressed [key question] using [methodology].
\end{executivesummary}

\subsection*{Key Findings}

\begin{keyfindings}
\begin{enumerate}
    \item The primary intervention demonstrated a large effect
          (\effectsize{d}{0.82}, \psig{< 0.001}).
    \item Benefits were maintained at 12-month follow-up.
    \item Cost-effectiveness analysis supports implementation.
\end{enumerate}
\end{keyfindings}

\subsection*{Recommendations}

\begin{recommendations}
Based on these findings, we recommend:
\begin{enumerate}
    \item Implement the intervention in [settings].
    \item Train practitioners using the standardized protocol.
    \item Monitor outcomes using the validated measures.
\end{enumerate}
\end{recommendations}
```

### Methods Section Example

```latex
\chapter{Methods}

\begin{methodology}[Study Overview]
This randomized controlled trial employed a parallel-group design with
1:1 allocation to intervention or control conditions. The study was
conducted across 12 sites between January 2023 and December 2024.
\end{methodology}

\section{Participants}

A total of \samplesize{450} participants were enrolled. Eligibility
criteria were:

\begin{itemize}
    \item Age 18--65 years
    \item Diagnosis of [condition] per [criteria]
    \item No contraindications to [intervention]
\end{itemize}

Table~\ref{tab:participants} presents participant characteristics.

\begin{limitations}[Recruitment Challenges]
Recruitment was slower than anticipated due to [reasons]. The final
sample was 10% below target, which may affect statistical power for
secondary analyses.
\end{limitations}
```

### Results Section Example

```latex
\chapter{Results}

\section{Primary Outcome}

\begin{resultsbox}[Primary Analysis]
Mixed-effects regression revealed a significant treatment effect,
\effectsize{F(1, 448)}{42.18}, \psig{< 0.001}, with a large effect
size (\effectsize{d}{0.82}). The treatment group showed significantly
greater improvement (\meansd{16.4}{5.2} points) compared to control
(\meansd{8.1}{4.8} points).
\end{resultsbox}

Figure~\ref{fig:primary} illustrates the treatment effects over time.

\begin{figure}[htbp]
\centering
\includegraphics[width=0.9\textwidth]{../figures/primary_outcome.png}
\caption{Primary Outcome Scores by Treatment Group and Time Point}
\figurenote{Error bars represent 95\% confidence intervals.}
\label{fig:primary}
\end{figure}

\section{Secondary Outcomes}

Results for secondary outcomes are presented in Table~\ref{tab:secondary}.
```

### Discussion Section Example

```latex
\chapter{Discussion}

\section{Summary of Findings}

\begin{keyfindings}[Main Conclusions]
\begin{enumerate}
    \item The intervention was highly effective (primary hypothesis
          \highlight{supported})
    \item Effects were clinically meaningful and durable
    \item Evidence strength: \evidencestrong
\end{enumerate}
\end{keyfindings}

\section{Limitations}

\begin{limitations}
Several limitations warrant consideration:
\begin{itemize}
    \item The sample was predominantly [demographic], limiting
          generalizability.
    \item Attrition was higher in the control group (18\% vs. 12\%).
    \item Self-report measures may be subject to response bias.
\end{itemize}
\end{limitations}

\section{Implications}

\begin{recommendations}[Research Implications]
\begin{enumerate}
    \item Replicate in diverse populations
    \item Investigate mechanisms of change
    \item Test implementation strategies
\end{enumerate}
\end{recommendations}

\begin{recommendations}[Practice Implications]
\begin{enumerate}
    \item Adopt the intervention in [settings]
    \item Train providers using standardized protocols
    \item Monitor fidelity and outcomes
\end{enumerate}
\end{recommendations}
```

---

## Checklist: Professional Report Quality

Before finalizing your report, verify:

### Formatting
- [ ] Using `scientific_report.sty` package
- [ ] Compiled with XeLaTeX or LuaLaTeX
- [ ] Helvetica font rendering correctly
- [ ] Colors displaying properly

### Content Organization
- [ ] Executive summary present and complete
- [ ] Key findings highlighted in boxes
- [ ] Methods clearly described
- [ ] Results properly formatted with statistics
- [ ] Limitations acknowledged
- [ ] Recommendations are specific and actionable

### Tables
- [ ] All tables have captions and labels
- [ ] Alternating row colors applied
- [ ] Significance indicators explained
- [ ] Numbers formatted consistently

### Figures
- [ ] All figures have captions and labels
- [ ] Sources attributed where appropriate
- [ ] Resolution sufficient for printing (300 DPI)
- [ ] Referenced in text

### Statistical Reporting
- [ ] P-values reported appropriately
- [ ] Effect sizes included
- [ ] Confidence intervals where relevant
- [ ] Sample sizes stated

### Professional Appearance
- [ ] Consistent formatting throughout
- [ ] No orphaned headers or widows
- [ ] Page breaks at appropriate locations
- [ ] References complete and formatted

---

## Resources

### Files in This Skill

- `assets/scientific_report.sty` - The LaTeX style package
- `assets/scientific_report_template.tex` - Complete report template
- `assets/REPORT_FORMATTING_GUIDE.md` - Quick reference guide

### Related Skills

- `venue-templates` - For journal manuscripts and conference papers
- `scientific-schematics` - For generating diagrams and figures
- `generate-image` - For creating illustrations and graphics

### External Resources

- [LaTeX Wikibook](https://en.wikibooks.org/wiki/LaTeX) - General LaTeX reference
- [Booktabs Package Documentation](https://ctan.org/pkg/booktabs) - Professional table styling
- [tcolorbox Package Documentation](https://ctan.org/pkg/tcolorbox) - Colored box environments

