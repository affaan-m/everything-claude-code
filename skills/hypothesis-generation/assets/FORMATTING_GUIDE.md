# Hypothesis Generation Report - Formatting Quick Reference

## Overview

This guide provides quick reference for using the hypothesis generation LaTeX template and style package. For complete documentation, see `SKILL.md`.

## Quick Start

```latex
% !TEX program = xelatex
\documentclass[11pt,letterpaper]{article}
\usepackage{hypothesis_generation}
\usepackage{natbib}

\title{Your Phenomenon Name}
\begin{document}
\maketitle
% Your content
\end{document}
```

**Compilation:** Use XeLaTeX or LuaLaTeX for best results
```bash
xelatex your_document.tex
bibtex your_document
xelatex your_document.tex
xelatex your_document.tex
```

## Color Scheme Reference

### Hypothesis Colors
- **Hypothesis 1**: Deep Blue (RGB: 0, 102, 153) - Use for first hypothesis
- **Hypothesis 2**: Forest Green (RGB: 0, 128, 96) - Use for second hypothesis
- **Hypothesis 3**: Royal Purple (RGB: 102, 51, 153) - Use for third hypothesis
- **Hypothesis 4**: Teal (RGB: 0, 128, 128) - Use for fourth hypothesis (if needed)
- **Hypothesis 5**: Burnt Orange (RGB: 204, 85, 0) - Use for fifth hypothesis (if needed)

### Utility Colors
- **Predictions**: Amber (RGB: 255, 191, 0) - For testable predictions
- **Evidence**: Light Blue (RGB: 102, 178, 204) - For supporting evidence
- **Comparisons**: Steel Gray (RGB: 108, 117, 125) - For critical comparisons
- **Limitations**: Coral Red (RGB: 220, 53, 69) - For limitations/challenges

## Custom Box Environments

### 1. Executive Summary Box

```latex
\begin{summarybox}[Executive Summary]
  Content here
\end{summarybox}
```

**Use for:** High-level overview at the beginning of the document

---

### 2. Hypothesis Boxes (5 variants)

```latex
\begin{hypothesisbox1}[Hypothesis 1: Title]
  \textbf{Mechanistic Explanation:}
  [2-3 paragraphs explaining HOW and WHY]
  
  \textbf{Key Supporting Evidence:}
  \begin{itemize}
    \item Evidence point 1 \citep{ref1}
    \item Evidence point 2 \citep{ref2}
  \end{itemize}
  
  \textbf{Core Assumptions:}
  \begin{enumerate}
    \item Assumption 1
    \item Assumption 2
  \end{enumerate}
\end{hypothesisbox1}
```

**Available boxes:** `hypothesisbox1`, `hypothesisbox2`, `hypothesisbox3`, `hypothesisbox4`, `hypothesisbox5`

**Use for:** Presenting each competing hypothesis with its mechanism, evidence, and assumptions

**Best practices for 4-page main text:**
- Keep mechanistic explanations to 1-2 brief paragraphs only (6-10 sentences max)
- Include 2-3 most essential evidence points with citations
- List 1-2 most critical assumptions
- Ensure each hypothesis is genuinely distinct
- All detailed explanations go to Appendix A
- **Use `\newpage` before each hypothesis box to prevent overflow**
- Each complete hypothesis box should be ≤0.6 pages

---

### 3. Prediction Box

```latex
\begin{predictionbox}[Predictions: Hypothesis 1]
  \textbf{Prediction 1.1:} [Specific prediction]
  \begin{itemize}
    \item \textbf{Conditions:} When/where this applies
    \item \textbf{Expected Outcome:} Specific measurable result
    \item \textbf{Falsification:} What would disprove it
  \end{itemize}
\end{predictionbox}
```

**Use for:** Testable predictions derived from each hypothesis

**Best practices for 4-page main text:**
- Make predictions specific and quantitative when possible
- Clearly state conditions under which prediction should hold
- Always specify falsification criteria
- Include only 1-2 most critical predictions per hypothesis in main text
- Additional predictions go to appendices

---

### 4. Evidence Box

```latex
\begin{evidencebox}[Supporting Evidence]
  Content discussing supporting evidence
\end{evidencebox}
```

**Use for:** Highlighting key supporting evidence or literature synthesis

**Best practices:**
- Use sparingly in main text (detailed evidence goes in Appendix A)
- Include citations for all evidence
- Focus on most compelling evidence

---

### 5. Comparison Box

```latex
\begin{comparisonbox}[H1 vs. H2: Key Distinction]
  \textbf{Fundamental Difference:}
  [Description of core difference]
  
  \textbf{Discriminating Experiment:}
  [Description of experiment]
  
  \textbf{Outcome Interpretation:}
  \begin{itemize}
    \item \textbf{If [Result A]:} H1 supported
    \item \textbf{If [Result B]:} H2 supported
  \end{itemize}
\end{comparisonbox}
```

**Use for:** Explaining how to distinguish between competing hypotheses

**Best practices:**
- Focus on fundamental mechanistic differences
- Propose clear, feasible discriminating experiments
- Specify concrete outcome interpretations
- Create comparisons for all major hypothesis pairs

---

### 6. Limitation Box

```latex
\begin{limitationbox}[Limitations \& Challenges]
  Discussion of limitations
\end{limitationbox}
```

**Use for:** Highlighting important limitations or challenges

**Best practices:**
- Use when limitations are particularly important
- Be honest about challenges
- Suggest how limitations might be addressed

---

## Document Structure

### Main Text (Maximum 4 Pages - Highly Concise)

1. **Executive Summary** (0.5-1 page)
   - Use `summarybox`
   - Brief phenomenon overview
   - List all hypotheses in 1 sentence each
   - Recommended approach

2. **Competing Hypotheses** (2-2.5 pages)
   - Use `hypothesisbox1`, `hypothesisbox2`, etc.
   - One box per hypothesis
   - Brief mechanistic explanation (1-2 paragraphs) + essential evidence (2-3 points) + key assumptions (1-2)
   - Target: 3-5 hypotheses
   - Keep highly concise - details go to appendices

3. **Testable Predictions** (0.5-1 page)
   - Use `predictionbox` for each hypothesis
   - 1-2 most critical predictions per hypothesis only
   - Very brief - full predictions in appendices

4. **Critical Comparisons** (0.5-1 page)
   - Use `comparisonbox` for highest priority comparison only
   - Show how to distinguish top hypotheses
   - Additional comparisons in appendices

**Main text total: Maximum 4 pages - be extremely selective about what goes here**

### Appendices (Comprehensive, Detailed)

**Appendix A: Comprehensive Literature Review**
- Detailed background (extensive citations)
- Current understanding
- Evidence for each hypothesis (detailed)
- Conflicting findings
- Knowledge gaps
- **Target: 40-60+ citations**

**Appendix B: Detailed Experimental Designs**
- Full protocols for each hypothesis
- Methods, controls, sample sizes
- Statistical approaches
- Feasibility assessments
- Timeline and resource requirements

**Appendix C: Quality Assessment**
- Detailed evaluation tables
- Strengths and weaknesses analysis
- Comparative scoring
- Recommendations

**Appendix D: Supplementary Evidence**
- Analogous mechanisms
- Preliminary data
- Theoretical frameworks
- Historical context

**References**
- **Target: 50+ total references**

## Citation Best Practices

### In Main Text
- Cite 15-20 key papers
- Use `\citep{author2023}` for parenthetical citations
- Use `\citet{author2023}` for textual citations
- Focus on most important/recent evidence

### In Appendices
- Cite 40-60+ papers total
- Comprehensive coverage of relevant literature
- Include reviews, primary research, theoretical papers
- Cite every claim and piece of evidence

### Citation Density Guidelines
- Main hypothesis boxes: 2-3 citations per box (most essential only)
- Main text total: 10-15 citations maximum (keep concise)
- Appendix A literature sections: 8-15 citations per subsection
- Experimental designs: 2-5 citations for methods/precedents
- Quality assessments: Citations as needed for evaluation criteria
- Total document: 50+ citations (vast majority in appendices)

## Tables

### Professional Table Formatting

```latex
\begin{hypotable}{Caption}
\begin{tabular}{|l|l|l|}
\hline
\tableheadercolor
\textcolor{white}{\textbf{Header 1}} & \textcolor{white}{\textbf{Header 2}} \\
\hline
Data row 1 & Data \\
\hline
\tablerowcolor  % Alternating gray background
Data row 2 & Data \\
\hline
\end{tabular}
\caption{Your caption}
\end{hypotable}
```

**Best practices:**
- Use `\tableheadercolor` for header rows
- Alternate `\tablerowcolor` for tables >3 rows
- Keep tables readable (not too wide)
- Use for quality assessments, comparisons

## Common Formatting Patterns

### Hypothesis Section Pattern

```latex
% Use \newpage before hypothesis box to prevent overflow
\newpage
\subsection*{Hypothesis N: [Concise Title]}

\begin{hypothesisboxN}[Hypothesis N: [Title]]

\textbf{Mechanistic Explanation:}

[1-2 brief paragraphs of explanation - 6-10 sentences max]

\vspace{0.3cm}

\textbf{Key Supporting Evidence:}
\begin{itemize}
  \item [Evidence 1] \citep{ref1}
  \item [Evidence 2] \citep{ref2}
  \item [Evidence 3] \citep{ref3}
\end{itemize}

\vspace{0.3cm}

\textbf{Core Assumptions:}
\begin{enumerate}
  \item [Assumption 1]
  \item [Assumption 2]
\end{enumerate}

\end{hypothesisboxN}

\vspace{0.5cm}
```

**Note:** The `\newpage` before the hypothesis box ensures it starts on a fresh page, preventing overflow. This is especially important when boxes contain substantial content.

### Prediction Section Pattern

```latex
\subsection*{Predictions from Hypothesis N}

\begin{predictionbox}[Predictions: Hypothesis N]

\textbf{Prediction N.1:} [Statement]
\begin{itemize}
  \item \textbf{Conditions:} [Conditions]
  \item \textbf{Expected Outcome:} [Outcome]
  \item \textbf{Falsification:} [Falsification]
\end{itemize}

\vspace{0.2cm}

\textbf{Prediction N.2:} [Statement]
[... continue ...]

\end{predictionbox}
```

### Comparison Section Pattern

```latex
\subsection*{Distinguishing Hypothesis X vs. Hypothesis Y}

\begin{comparisonbox}[HX vs. HY: Key Distinction]

\textbf{Fundamental Difference:}

[Description of core difference]

\vspace{0.3cm}

\textbf{Discriminating Experiment:}

[Experiment description]

\vspace{0.3cm}

\textbf{Outcome Interpretation:}
\begin{itemize}
  \item \textbf{If [Result A]:} HX supported
  \item \textbf{If [Result B]:} HY supported
  \item \textbf{If [Result C]:} Both/neither supported
\end{itemize}

\end{comparisonbox}
```

## Spacing and Layout

### Vertical Spacing
- `\vspace{0.3cm}` - Between elements within boxes
- `\vspace{0.5cm}` - Between major sections or boxes
- `\vspace{1cm}` - After title, before main content

### Page Breaks and Overflow Prevention

**CRITICAL: Prevent Content Overflow**

LaTeX boxes (tcolorbox environments) do not automatically break across pages. Content that exceeds the remaining page space will overflow and cause formatting issues. Follow these guidelines:

1. **Strategic Page Breaks Before Long Boxes:**
```latex
\newpage  % Start on fresh page if box will be long
\begin{hypothesisbox1}[Hypothesis 1: Title]
  % Substantial content here
\end{hypothesisbox1}
```

2. **Monitor Box Content Length:**
   - Each hypothesis box should be ≤0.7 pages maximum
   - If mechanistic explanation + evidence + assumptions exceeds ~0.6 pages, content is too long
   - Solution: Move detailed content to appendices, keep only essentials in main text boxes

3. **When to Use `\newpage`:**
   - Before any hypothesis box with >3 subsections or >15 lines of content
   - Before comparison boxes with extensive experimental descriptions
   - Between major appendix sections
   - If less than 0.6 pages remain on current page before starting a new box

4. **Content Length Guidelines for Main Text:**
   - Executive summary box: 0.5-0.8 pages max
   - Each hypothesis box: 0.4-0.6 pages max
   - Each prediction box: 0.3-0.5 pages max
   - Each comparison box: 0.4-0.6 pages max

5. **Breaking Up Long Content:**
   ```latex
   % GOOD: Concise main text with page break
   \newpage
   \begin{hypothesisbox1}[Hypothesis 1: Brief Title]
   \textbf{Mechanistic Explanation:}
   Brief overview in 1-2 paragraphs (6-10 sentences).
   
   \textbf{Key Supporting Evidence:}
   \begin{itemize}
     \item Evidence 1 \citep{ref1}
     \item Evidence 2 \citep{ref2}
   \end{itemize}
   
   \textbf{Core Assumptions:}
   \begin{enumerate}
     \item Assumption 1
   \end{enumerate}
   
   See Appendix A for detailed mechanism and comprehensive evidence.
   \end{hypothesisbox1}
   ```

   ```latex
   % BAD: Overly long content that will overflow
   \begin{hypothesisbox1}[Hypothesis 1]
   \subsection{Very Long Section}
   Multiple paragraphs...
   \subsection{Another Long Section}
   More paragraphs...
   \subsection{Even More Content}
   [Content continues beyond page boundary → OVERFLOW!]
   \end{hypothesisbox1}
   ```

6. **Page Break Commands:**
   - `\newpage` - Force new page (recommended before long boxes)
   - `\clearpage` - Force new page and flush floats (use before appendices)

### Section Spacing
Already handled by style package, but you can adjust:
```latex
\vspace{0.5cm}  % Add extra space if needed
```

## Troubleshooting

### Common Issues

**Issue: "File hypothesis_generation.sty not found"**
- Solution: Ensure the .sty file is in the same directory as your .tex file, or in your LaTeX path

**Issue: Boxes don't have colors**
- Solution: Compile with XeLaTeX or LuaLaTeX, not pdfLaTeX
- Command: `xelatex yourfile.tex`

**Issue: Citations show as [?]**
- Solution: Run bibtex after first xelatex compilation
```bash
xelatex yourfile.tex
bibtex yourfile
xelatex yourfile.tex
xelatex yourfile.tex
```

**Issue: Fonts not found**
- Solution: Comment out font lines in the .sty file if custom fonts aren't installed
- Lines to comment: `\setmainfont{...}` and `\setsansfont{...}`

**Issue: Box titles overlap with content**
- Solution: Add more vertical space with `\vspace{0.3cm}` after titles

**Issue: Tables too wide**
- Solution: Use `\small` or `\footnotesize` before tabular, or use `p{width}` column specs

**Issue: Content overflowing off the page**
- **Cause:** Boxes (tcolorbox environments) are too long to fit on remaining page space
- **Solution 1:** Add `\newpage` before the box to start it on a fresh page
- **Solution 2:** Reduce box content - move detailed information to appendices
- **Solution 3:** Break content into multiple smaller boxes
- **Prevention:** Keep each hypothesis box to 0.4-0.6 pages maximum; use `\newpage` liberally before boxes with substantial content

**Issue: Main text exceeds 4 pages**
- **Cause:** Boxes contain too much detailed information
- **Solution:** Aggressively move content to appendices - main text boxes should contain only:
  - Brief mechanistic overview (1-2 paragraphs)
  - 2-3 key evidence bullets
  - 1-2 core assumptions
- All detailed explanations, additional evidence, and comprehensive discussions belong in Appendix A

### Package Requirements

Ensure these packages are installed:
- `tcolorbox` (with `most` option)
- `xcolor`
- `fontspec` (for XeLaTeX/LuaLaTeX)
- `fancyhdr`
- `titlesec`
- `enumitem`
- `booktabs`
- `natbib`

Install missing packages:
```bash
# For TeX Live
tlmgr install tcolorbox xcolor fontspec fancyhdr titlesec enumitem booktabs natbib

# For MiKTeX (Windows)
# Use MiKTeX Package Manager GUI
```

## Style Consistency Tips

1. **Color Usage**
   - Always use the same color for each hypothesis throughout the document
   - H1 = blue, H2 = green, H3 = purple, etc.
   - Don't mix colors for the same hypothesis

2. **Box Usage**
   - Main text: Hypothesis boxes, prediction boxes, comparison boxes
   - Appendix: Can use evidence boxes, limitation boxes as needed
   - Don't overuse boxes - reserve for key content

3. **Citation Style**
   - Consistent citation format throughout
   - Use `\citep{}` for most citations
   - Group multiple citations: `\citep{ref1, ref2, ref3}`

4. **Hypothesis Numbering**
   - Number hypotheses consistently (H1, H2, H3, etc.)
   - Use same numbering in predictions (P1.1, P1.2 for H1)
   - Use same numbering in comparisons (H1 vs. H2)

5. **Language**
   - Be precise and specific
   - Avoid vague language ("may", "could", "possibly")
   - Use active voice when possible
   - Make predictions quantitative when feasible

## Quick Checklist

Before finalizing your document:

- [ ] Title page has phenomenon name
- [ ] **Main text is 4 pages maximum**
- [ ] Executive summary is concise (0.5-1 page)
- [ ] Each hypothesis in its own colored box
- [ ] 3-5 hypotheses presented (not more)
- [ ] Each hypothesis has brief mechanistic explanation (1-2 paragraphs)
- [ ] Each hypothesis has 2-3 most essential evidence points with citations
- [ ] Each hypothesis has 1-2 most critical assumptions
- [ ] Predictions boxes with 1-2 key predictions per hypothesis
- [ ] Priority comparison box in main text (others in appendix)
- [ ] Priority experiments identified
- [ ] **Page breaks (`\newpage`) used before long boxes to prevent overflow**
- [ ] **No content overflows off page boundaries (check PDF carefully)**
- [ ] **Each hypothesis box is ≤0.6 pages (if longer, move details to appendix)**
- [ ] Appendix A has comprehensive literature review with detailed evidence
- [ ] Appendix B has detailed experimental protocols
- [ ] Appendix C has quality assessment tables
- [ ] Appendix D has supplementary evidence
- [ ] 10-15 citations in main text (selective)
- [ ] 50+ total citations in full document
- [ ] All boxes use correct colors
- [ ] Document compiles without errors
- [ ] References formatted correctly
- [ ] **Compiled PDF checked visually for overflow issues**

## Example Minimal Document

```latex
% !TEX program = xelatex
\documentclass[11pt,letterpaper]{article}
\usepackage{hypothesis_generation}
\usepackage{natbib}

\title{Role of X in Y}

\begin{document}
\maketitle

\section*{Executive Summary}
\begin{summarybox}[Executive Summary]
Brief overview of phenomenon and hypotheses.
\end{summarybox}

\section{Competing Hypotheses}

% Use \newpage before each hypothesis box to prevent overflow
\newpage
\subsection*{Hypothesis 1: Title}
\begin{hypothesisbox1}[Hypothesis 1: Title]
\textbf{Mechanistic Explanation:}
Brief explanation in 1-2 paragraphs.

\textbf{Key Supporting Evidence:}
\begin{itemize}
  \item Evidence point \citep{ref1}
\end{itemize}
\end{hypothesisbox1}

\newpage
\subsection*{Hypothesis 2: Title}
\begin{hypothesisbox2}[Hypothesis 2: Title]
\textbf{Mechanistic Explanation:}
Brief explanation in 1-2 paragraphs.

\textbf{Key Supporting Evidence:}
\begin{itemize}
  \item Evidence point \citep{ref2}
\end{itemize}
\end{hypothesisbox2}

\section{Testable Predictions}

\subsection*{Predictions from Hypothesis 1}
\begin{predictionbox}[Predictions: Hypothesis 1]
Predictions here.
\end{predictionbox}

\section{Critical Comparisons}

\subsection*{H1 vs. H2}
\begin{comparisonbox}[H1 vs. H2]
Comparison here.
\end{comparisonbox}

% Force new page before appendices
\appendix
\newpage
\appendixsection{Appendix A: Literature Review}
Detailed literature review here.

\newpage
\bibliographystyle{plainnat}
\bibliography{references}

\end{document}
```

**Key Points:**
- `\newpage` used before each hypothesis box to ensure they start on fresh pages
- This prevents content overflow issues
- Main text boxes kept concise (1-2 paragraphs + bullet points)
- Detailed content goes to appendices

## Additional Resources

- See `hypothesis_report_template.tex` for complete annotated template
- See `SKILL.md` for workflow and methodology guidance
- See `references/hypothesis_quality_criteria.md` for evaluation framework
- See `references/experimental_design_patterns.md` for design guidance
- See treatment-plans skill for additional LaTeX styling examples

