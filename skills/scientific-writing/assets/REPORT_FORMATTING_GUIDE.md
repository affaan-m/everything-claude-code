# Scientific Report Formatting Guide

Quick reference for using the `scientific_report.sty` style package.

## Overview

The `scientific_report.sty` package provides professional formatting for scientific reports, technical documents, and white papers. It features:

- **Helvetica font family** for a clean, modern appearance
- **Professional color scheme** with blues, greens, and accent colors
- **Colored box environments** for organizing different types of content
- **Attractive tables** with alternating row colors and professional headers
- **Scientific notation commands** for p-values, effect sizes, and statistics
- **Professional headers and footers** with automatic section titles

---

## Color Palette

### Primary Colors (Blues)

| Color Name | RGB | Hex | Usage |
|------------|-----|-----|-------|
| `primaryblue` | (0, 51, 102) | `#003366` | Headers, titles, primary elements |
| `secondaryblue` | (74, 144, 226) | `#4A90E2` | Subsections, secondary headings |
| `lightblue` | (220, 235, 252) | `#DCEBFC` | Key findings box backgrounds |
| `accentblue` | (0, 120, 215) | `#0078D7` | Accent highlights, hypothesis boxes |

### Scientific Colors (Greens)

| Color Name | RGB | Hex | Usage |
|------------|-----|-----|-------|
| `sciencegreen` | (0, 168, 150) | `#00A896` | Methodology boxes, positive findings |
| `lightgreen` | (220, 245, 240) | `#DCF5F0` | Methodology box backgrounds |
| `darkgreen` | (0, 128, 96) | `#008060` | Results boxes, strong evidence |

### Warning Colors (Orange/Red)

| Color Name | RGB | Hex | Usage |
|------------|-----|-----|-------|
| `cautionorange` | (255, 140, 66) | `#FF8C42` | Limitations, warnings, cautions |
| `lightorange` | (255, 243, 224) | `#FFF3E0` | Limitations box backgrounds |
| `criticalred` | (198, 40, 40) | `#C62828` | Critical notices, alerts |
| `lightred` | (255, 235, 238) | `#FFEBEE` | Critical notice backgrounds |

### Recommendation Colors

| Color Name | RGB | Hex | Usage |
|------------|-----|-----|-------|
| `recommendpurple` | (103, 58, 183) | `#673AB7` | Recommendations boxes |
| `lightpurple` | (237, 231, 246) | `#EDE7F6` | Recommendations box backgrounds |

### Neutral Colors

| Color Name | RGB | Hex | Usage |
|------------|-----|-----|-------|
| `darkgray` | (66, 66, 66) | `#424242` | Body text |
| `mediumgray` | (117, 117, 117) | `#757575` | Secondary text, definitions |
| `lightgray` | (245, 245, 245) | `#F5F5F5` | Backgrounds, definition boxes |
| `tablealt` | (248, 250, 252) | `#F8FAFC` | Alternating table rows |

---

## Box Environments

### Key Findings Box (Blue)

For major findings, discoveries, and important results.

```latex
\begin{keyfindings}[Custom Title]
This study found that treatment A significantly outperformed
treatment B (\pvalue{0.001}, \effectsize{d}{0.75}).
\end{keyfindings}
```

### Methodology Box (Green)

For methods, procedures, and study design highlights.

```latex
\begin{methodology}[Study Design]
This randomized controlled trial employed a 2×2 factorial design
with pre-post measurements and 6-month follow-up.
\end{methodology}
```

### Results Box (Blue-Green)

For highlighting specific results and statistical findings.

```latex
\begin{resultsbox}[Primary Outcome]
Analysis revealed a significant main effect, F(2, 147) = 12.45,
\psig{< 0.001}, $\eta^2$ = 0.145.
\end{resultsbox}
```

### Recommendations Box (Purple)

For recommendations, implications, and action items.

```latex
\begin{recommendations}[Clinical Implications]
\begin{enumerate}
    \item Implement screening protocol for high-risk patients
    \item Adjust treatment dosage based on biomarker levels
    \item Monitor patients at 3-month intervals
\end{enumerate}
\end{recommendations}
```

### Limitations Box (Orange)

For limitations, cautions, and caveats.

```latex
\begin{limitations}[Study Limitations]
\begin{itemize}
    \item Sample limited to urban populations
    \item Cross-sectional design precludes causal inference
    \item Self-report measures may introduce bias
\end{itemize}
\end{limitations}
```

### Critical Notice Box (Red)

For critical warnings, important notices, or safety information.

```latex
\begin{criticalnotice}[Safety Warning]
Patients with contraindication X should not receive this treatment.
Consult specialist before proceeding.
\end{criticalnotice}
```

### Definition Box (Gray)

For definitions, notes, and supplementary information.

```latex
\begin{definition}[Key Term]
\textbf{Effect size} refers to a quantitative measure of the
magnitude of a phenomenon, independent of sample size.
\end{definition}
```

### Executive Summary Box (Special)

For executive summaries with enhanced styling and shadow effect.

```latex
\begin{executivesummary}[Report Overview]
This report presents findings from a comprehensive analysis
of [topic]. Key findings indicate that...
\end{executivesummary}
```

### Hypothesis Box (Light Blue)

For stating research hypotheses.

```latex
\begin{hypothesis}[Primary Hypothesis]
We hypothesize that intervention X will significantly improve
outcome Y compared to control conditions.
\end{hypothesis}
```

---

## Pull Quotes

For highlighting important quotes or statements.

```latex
\begin{pullquote}
"These findings represent a paradigm shift in our understanding
of the underlying mechanisms."
\end{pullquote}
```

---

## Statistic Boxes

For highlighting key statistics (use in rows of 3).

```latex
\begin{center}
\statbox{n = 500}{Participants}
\statbox{p < 0.001}{Significance}
\statbox{d = 0.75}{Effect Size}
\end{center}
```

---

## Scientific Notation Commands

### P-Values

```latex
\pvalue{0.023}          % Outputs: p = 0.023
\psig{< 0.001}          % Outputs: p = < 0.001 (bold for significant)
```

### Confidence Intervals

```latex
\CI{0.45}{0.72}         % Outputs: 95% CI [0.45, 0.72]
```

### Effect Sizes

```latex
\effectsize{d}{0.75}    % Outputs: d = 0.75
\effectsize{r}{0.42}    % Outputs: r = 0.42
\effectsize{F(2, 97)}{12.45}  % Outputs: F(2, 97) = 12.45
```

### Sample Size

```latex
\samplesize{250}        % Outputs: n = 250
```

### Mean with Standard Deviation

```latex
\meansd{42.5}{8.3}      % Outputs: 42.5 ± 8.3
```

### Significance Indicators (for tables)

```latex
Result\sigone           % * for p < 0.05
Result\sigtwo           % ** for p < 0.01
Result\sigthree         % *** for p < 0.001
Result\signs            % ns for not significant

% Legend for table footnotes:
\siglegend              % Outputs: *p < 0.05; **p < 0.01; ***p < 0.001; ns not significant
```

### Quality/Evidence Indicators

```latex
\qualityhigh            % HIGH (green)
\qualitymedium          % MEDIUM (orange)
\qualitylow             % LOW (red)

\evidencestrong         % Strong (green)
\evidencemoderate       % Moderate (orange)
\evidenceweak           % Weak (red)
```

### Trend Indicators

```latex
\trendup                % Green up triangle ▲
\trenddown              % Red down triangle ▼
\trendflat              % Gray right arrow →
```

### Text Highlighting

```latex
\highlight{important text}  % Blue bold text
```

---

## Table Formatting

### Standard Table with Alternating Rows

```latex
\begin{table}[htbp]
\centering
\caption{Descriptive Statistics by Group}
\label{tab:descriptives}
\begin{tabular}{@{}lccc@{}}
\toprule
\textbf{Variable} & \textbf{Group A} & \textbf{Group B} & \textbf{p} \\
\midrule
Age (years) & \meansd{42.5}{8.3} & \meansd{43.1}{7.9} & .58 \\
\rowcolor{tablealt} Score 1 & \meansd{15.2}{3.4} & \meansd{18.7}{4.1} & <.001\sigthree \\
Score 2 & \meansd{22.8}{5.1} & \meansd{23.4}{4.8} & .42 \\
\rowcolor{tablealt} Score 3 & \meansd{8.9}{2.2} & \meansd{7.2}{2.5} & .003\sigtwo \\
\bottomrule
\end{tabular}

\vspace{0.5em}
{\small \siglegend}
\end{table}
```

### Table with Quality Indicators

```latex
\begin{tabular}{@{}llcc@{}}
\toprule
\textbf{Study} & \textbf{Design} & \textbf{Quality} & \textbf{Evidence} \\
\midrule
Smith et al. (2023) & RCT & \qualityhigh & \evidencestrong \\
\rowcolor{tablealt} Jones et al. (2022) & Cohort & \qualitymedium & \evidencemoderate \\
Lee et al. (2021) & Cross-sectional & \qualitylow & \evidenceweak \\
\bottomrule
\end{tabular}
```

### Table with Trend Indicators

```latex
\begin{tabular}{@{}lrrl@{}}
\toprule
\textbf{Metric} & \textbf{Baseline} & \textbf{Follow-up} & \textbf{Change} \\
\midrule
Score A & 42.5 & 58.3 & \trendup +37\% \\
\rowcolor{tablealt} Score B & 18.2 & 15.1 & \trenddown -17\% \\
Score C & 7.8 & 7.9 & \trendflat +1\% \\
\bottomrule
\end{tabular}
```

---

## Figure Formatting

### Standard Figure

```latex
\begin{figure}[htbp]
\centering
\includegraphics[width=0.9\textwidth]{../figures/results_chart.png}
\caption{Comparison of Outcome Scores Across Treatment Conditions}
\label{fig:results}
\end{figure}
```

### Figure with Source Attribution

```latex
\begin{figure}[htbp]
\centering
\includegraphics[width=0.85\textwidth]{../figures/data_visualization.png}
\caption{Distribution of Participant Responses by Category}
\figuresource{Study data, collected January-March 2024}
\label{fig:distribution}
\end{figure}
```

### Figure with Note

```latex
\begin{figure}[htbp]
\centering
\includegraphics[width=0.8\textwidth]{../figures/model_diagram.png}
\caption{Conceptual Model of Proposed Relationships}
\figurenote{Solid arrows indicate direct effects; dashed arrows indicate moderated effects.}
\label{fig:model}
\end{figure}
```

---

## Title Page

### Standard Title Page

```latex
\makereporttitle
    {Research Report Title}              % Title
    {A Comprehensive Analysis}           % Subtitle
    {Author Name, PhD}                   % Author(s)
    {Research Institution}               % Institution
    {January 2025}                        % Date
```

### Title Page with Cover Image

```latex
\makereporttitlewithimage
    {Research Report Title}              % Title
    {A Comprehensive Analysis}           % Subtitle
    {../figures/cover_image.png}         % Image path
    {Author Name, PhD}                   % Author(s)
    {Research Institution}               % Institution
    {January 2025}                        % Date
```

---

## List Formatting

Lists automatically use blue bullets/numbers.

### Bullet Lists

```latex
\begin{itemize}
    \item First item with automatic blue bullet
    \item Second item
    \item Third item
\end{itemize}
```

### Numbered Lists

```latex
\begin{enumerate}
    \item First item with blue number
    \item Second item
    \item Third item
\end{enumerate}
```

---

## Appendix Sections

```latex
\appendix

\chapter{Supplementary Materials}

\appendixsection{Additional Tables}
% Content appears in table of contents

\appendixsection{Instruments}
% Additional appendix content
```

---

## Compilation

Compile with XeLaTeX or LuaLaTeX for best font rendering:

```bash
# Using XeLaTeX
xelatex report.tex
bibtex report        # If using BibTeX
xelatex report.tex
xelatex report.tex

# Using latexmk (recommended)
latexmk -xelatex report.tex

# Using LuaLaTeX
lualatex report.tex
```

---

## Common Patterns

### Results Section Example

```latex
\section{Primary Outcomes}

\begin{resultsbox}[Main Finding]
The intervention group showed significantly higher scores than
the control group, \effectsize{t(98)}{3.45}, \psig{< 0.001},
\effectsize{d}{0.69}, \CI{0.42}{0.96}.
\end{resultsbox}

Table~\ref{tab:outcomes} presents the complete results for all
outcome measures.

\begin{table}[htbp]
\centering
\caption{Outcome Measures by Treatment Condition}
\label{tab:outcomes}
\begin{tabular}{@{}lcccc@{}}
\toprule
\textbf{Measure} & \textbf{Control} & \textbf{Treatment} & \textbf{d} & \textbf{p} \\
\midrule
Primary & \meansd{42.1}{8.2} & \meansd{51.3}{9.1} & 0.69\sigthree & <.001 \\
\rowcolor{tablealt} Secondary & \meansd{3.2}{1.1} & \meansd{4.1}{1.3} & 0.52\sigtwo & .004 \\
Tertiary & \meansd{18.5}{4.2} & \meansd{19.2}{4.5} & 0.16\signs & .328 \\
\bottomrule
\end{tabular}
\end{table}
```

### Discussion Section Example

```latex
\section{Interpretation of Findings}

\begin{keyfindings}[Summary]
\begin{enumerate}
    \item Primary hypothesis \highlight{supported} with large effect
    \item Secondary hypothesis partially supported
    \item Evidence quality: \evidencestrong
\end{enumerate}
\end{keyfindings}

\begin{limitations}
This study has several limitations that should be considered...
\end{limitations}

\begin{recommendations}[Future Research]
Future studies should address the following:
\begin{enumerate}
    \item Replicate findings in diverse populations
    \item Extend follow-up period to assess long-term effects
    \item Investigate moderating variables
\end{enumerate}
\end{recommendations}
```

---

## Troubleshooting

### Box Overflow
If box content overflows the page:
```latex
\newpage
\begin{keyfindings}[Continued...]
```

### Figure Placement
Use `[htbp]` for flexible placement, or `[H]` (requires `float` package) for exact:
```latex
\usepackage{float}
\begin{figure}[H]
```

### Table Too Wide
Use `\resizebox` or reduce font size:
```latex
\resizebox{\textwidth}{!}{
\begin{tabular}{...}
...
\end{tabular}
}
```

### Font Issues
If Helvetica isn't rendering, ensure you're using XeLaTeX or LuaLaTeX:
```bash
xelatex report.tex   # NOT pdflatex
```

---

## Quick Reference Card

| Purpose | Command/Environment |
|---------|---------------------|
| Major finding | `\begin{keyfindings}...\end{keyfindings}` |
| Methods | `\begin{methodology}...\end{methodology}` |
| Results | `\begin{resultsbox}...\end{resultsbox}` |
| Recommendation | `\begin{recommendations}...\end{recommendations}` |
| Limitation | `\begin{limitations}...\end{limitations}` |
| Warning | `\begin{criticalnotice}...\end{criticalnotice}` |
| Definition | `\begin{definition}...\end{definition}` |
| Executive summary | `\begin{executivesummary}...\end{executivesummary}` |
| Hypothesis | `\begin{hypothesis}...\end{hypothesis}` |
| P-value | `\pvalue{0.05}` or `\psig{< 0.001}` |
| Effect size | `\effectsize{d}{0.75}` |
| Sample size | `\samplesize{250}` |
| Mean ± SD | `\meansd{42.5}{8.3}` |
| CI | `\CI{0.38}{0.72}` |
| Highlight | `\highlight{text}` |
| Alt row | `\rowcolor{tablealt}` |
| Significance | `\sigone`, `\sigtwo`, `\sigthree`, `\signs` |

