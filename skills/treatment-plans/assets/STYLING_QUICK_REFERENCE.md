# Professional Treatment Plan Styling - Quick Reference

## File Location
`medical_treatment_plan.sty` - Available in the assets directory

## Quick Start

```latex
% !TEX program = xelatex
\documentclass[11pt,letterpaper]{article}
\usepackage{medical_treatment_plan}
\usepackage{natbib}

\begin{document}
\maketitle
% Your content
\end{document}
```

## Custom Box Environments

### 1. Info Box (Blue) - General Information
```latex
\begin{infobox}[Title]
  Content
\end{infobox}
```
**Use for:** Clinical assessments, monitoring schedules, titration protocols

### 2. Warning Box (Yellow/Red) - Critical Alerts
```latex
\begin{warningbox}[Title]
  Critical information
\end{warningbox}
```
**Use for:** Safety protocols, decision points, contraindications

### 3. Goal Box (Green) - Treatment Goals
```latex
\begin{goalbox}[Title]
  Goals and targets
\end{goalbox}
```
**Use for:** SMART goals, target outcomes, success metrics

### 4. Key Points Box (Light Blue) - Highlights
```latex
\begin{keybox}[Title]
  Important highlights
\end{keybox}
```
**Use for:** Executive summaries, key takeaways, essential recommendations

### 5. Emergency Box (Red) - Emergency Info
```latex
\begin{emergencybox}
  Emergency contacts
\end{emergencybox}
```
**Use for:** Emergency contacts, urgent protocols

### 6. Patient Info Box (White/Blue) - Demographics
```latex
\begin{patientinfo}
  Patient information
\end{patientinfo}
```
**Use for:** Patient demographics and baseline data

## Professional Tables

```latex
\begin{medtable}{Caption}
\begin{tabular}{|l|l|l|}
\hline
\tableheadercolor
\textcolor{white}{\textbf{Header 1}} & \textcolor{white}{\textbf{Header 2}} \\
\hline
Data row 1 \\
\hline
\tablerowcolor  % Alternating gray
Data row 2 \\
\hline
\end{tabular}
\caption{Table caption}
\end{medtable}
```

## Color Scheme

- **Primary Blue** (0, 102, 153): Headers, titles
- **Secondary Blue** (102, 178, 204): Light backgrounds
- **Accent Blue** (0, 153, 204): Links, highlights
- **Success Green** (0, 153, 76): Goals
- **Warning Red** (204, 0, 0): Warnings

## Compilation

```bash
xelatex document.tex
bibtex document
xelatex document.tex
xelatex document.tex
```

## Best Practices

1. **Match box type to purpose:** Green for goals, red/yellow for warnings
2. **Don't overuse boxes:** Reserve for important information only
3. **Maintain color consistency:** Stick to the defined scheme
4. **Use white space:** Add `\vspace{0.5cm}` between major sections
5. **Table alternating rows:** Use `\tablerowcolor` for readability

## Installation

**Option 1:** Copy `assets/medical_treatment_plan.sty` to your document directory

**Option 2:** Install to user TeX directory
```bash
mkdir -p ~/texmf/tex/latex/medical_treatment_plan
cp assets/medical_treatment_plan.sty ~/texmf/tex/latex/medical_treatment_plan/
texhash ~/texmf
```

## Required Packages
All automatically loaded by the style:
- tcolorbox, tikz, xcolor
- fancyhdr, titlesec, enumitem
- booktabs, longtable, array, colortbl
- hyperref, natbib, fontspec

## Example Structure

```latex
\maketitle

\section*{Patient Information}
\begin{patientinfo}
  Demographics
\end{patientinfo}

\section{Executive Summary}
\begin{keybox}[Plan Overview]
  Key highlights
\end{keybox}

\section{Treatment Goals}
\begin{goalbox}[SMART Goals]
  Goals list
\end{goalbox}

\section{Medication Plan}
\begin{infobox}[Dosing]
  Instructions
\end{infobox}

\begin{warningbox}[Safety]
  Warnings
\end{warningbox}

\section{Emergency}
\begin{emergencybox}
  Contacts
\end{emergencybox}
```

## Troubleshooting

**Missing packages:**
```bash
sudo tlmgr install tcolorbox tikz pgf
```

**Special characters not showing:**
- Use XeLaTeX instead of PDFLaTeX
- Or use LaTeX commands: `$\checkmark$`, `$\geq$`

**Header warnings:**
- Already set to 22pt in style file
- Adjust if needed

---

For complete documentation, see the "Professional Document Styling" section in SKILL.md

