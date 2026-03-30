# Market Research Report Formatting Guide

Quick reference for using the `market_research.sty` style package.

## Color Palette

### Primary Colors
| Color Name | RGB | Hex | Usage |
|------------|-----|-----|-------|
| `primaryblue` | (0, 51, 102) | `#003366` | Headers, titles, links |
| `secondaryblue` | (51, 102, 153) | `#336699` | Subsections, secondary elements |
| `lightblue` | (173, 216, 230) | `#ADD8E6` | Key insight box backgrounds |
| `accentblue` | (0, 120, 215) | `#0078D7` | Accent highlights, opportunity boxes |

### Secondary Colors
| Color Name | RGB | Hex | Usage |
|------------|-----|-----|-------|
| `accentgreen` | (0, 128, 96) | `#008060` | Market data boxes, positive indicators |
| `lightgreen` | (200, 230, 201) | `#C8E6C9` | Market data box backgrounds |
| `warningorange` | (255, 140, 0) | `#FF8C00` | Risk boxes, warnings |
| `alertred` | (198, 40, 40) | `#C62828` | Critical risks |
| `recommendpurple` | (103, 58, 183) | `#673AB7` | Recommendation boxes |

### Neutral Colors
| Color Name | RGB | Hex | Usage |
|------------|-----|-----|-------|
| `darkgray` | (66, 66, 66) | `#424242` | Body text |
| `mediumgray` | (117, 117, 117) | `#757575` | Secondary text |
| `lightgray` | (240, 240, 240) | `#F0F0F0` | Backgrounds, callout boxes |
| `tablealt` | (245, 247, 250) | `#F5F7FA` | Alternating table rows |

---

## Box Environments

### Key Insight Box (Blue)
For major findings, insights, and important discoveries.

```latex
\begin{keyinsightbox}[Custom Title]
The market is projected to grow at 15.3% CAGR through 2030, driven by
increasing enterprise adoption and favorable regulatory conditions.
\end{keyinsightbox}
```

### Market Data Box (Green)
For market statistics, metrics, and data highlights.

```latex
\begin{marketdatabox}[Market Snapshot]
\begin{itemize}
    \item \textbf{Market Size (2024):} \marketsize{45.2 billion}
    \item \textbf{Projected Size (2030):} \marketsize{98.7 billion}
    \item \textbf{CAGR:} \growthrate{15.3}
\end{itemize}
\end{marketdatabox}
```

### Risk Box (Orange/Warning)
For risk factors, warnings, and cautions.

```latex
\begin{riskbox}[Market Risk]
Regulatory changes in the European Union could impact 40% of market
participants within the next 18 months.
\end{riskbox}
```

### Critical Risk Box (Red)
For high-severity or critical risks.

```latex
\begin{criticalriskbox}[Critical: Supply Chain Disruption]
A major supply chain disruption could result in 6-12 month delays
and 30% cost increases.
\end{criticalriskbox}
```

### Recommendation Box (Purple)
For strategic recommendations and action items.

```latex
\begin{recommendationbox}[Strategic Recommendation]
\begin{enumerate}
    \item Prioritize market entry in Asia-Pacific region
    \item Develop strategic partnerships with local distributors
    \item Invest in localization of product offerings
\end{enumerate}
\end{recommendationbox}
```

### Callout Box (Gray)
For definitions, notes, and supplementary information.

```latex
\begin{calloutbox}[Definition: TAM]
Total Addressable Market (TAM) represents the total revenue opportunity
available if 100% market share was achieved.
\end{calloutbox}
```

### Executive Summary Box
Special styling for executive summary highlights.

```latex
\begin{executivesummarybox}[Executive Summary]
Key findings and highlights of the report...
\end{executivesummarybox}
```

### Opportunity Box (Teal/Accent Blue)
For opportunities and positive findings.

```latex
\begin{opportunitybox}[Growth Opportunity]
The Asia-Pacific market represents a \$15 billion opportunity
growing at 22% CAGR.
\end{opportunitybox}
```

### Framework Boxes
For strategic analysis frameworks.

```latex
% SWOT Analysis
\begin{swotbox}[SWOT Analysis Summary]
Content...
\end{swotbox}

% Porter's Five Forces
\begin{porterbox}[Porter's Five Forces Analysis]
Content...
\end{porterbox}
```

---

## Pull Quotes

For highlighting important statistics or quotes.

```latex
\begin{pullquote}
"The convergence of AI and healthcare represents a \$199 billion
opportunity by 2034."
\end{pullquote}
```

---

## Stat Boxes

For highlighting key statistics (use in rows of 3).

```latex
\begin{center}
\statbox{\$45.2B}{Market Size 2024}
\statbox{15.3\%}{CAGR 2024-2030}
\statbox{23\%}{Market Leader Share}
\end{center}
```

---

## Custom Commands

### Highlighting Text
```latex
\highlight{Important text}  % Blue bold
```

### Market Size Formatting
```latex
\marketsize{45.2 billion}   % Outputs: $45.2 billion in green
```

### Growth Rate Formatting
```latex
\growthrate{15.3}           % Outputs: 15.3% in green
```

### Risk Indicators
```latex
\riskhigh{}     % Outputs: HIGH in red
\riskmedium{}   % Outputs: MEDIUM in orange
\risklow{}      % Outputs: LOW in green
```

### Rating Stars (1-5)
```latex
\rating{4}      % Outputs: ★★★★☆
```

### Trend Indicators
```latex
\trendup{}      % Green up triangle
\trenddown{}    % Red down triangle
\trendflat{}    % Gray right arrow
```

---

## Table Formatting

### Standard Table with Alternating Rows
```latex
\begin{table}[htbp]
\centering
\caption{Market Size by Region}
\begin{tabular}{@{}lrrr@{}}
\toprule
\textbf{Region} & \textbf{Size} & \textbf{Share} & \textbf{CAGR} \\
\midrule
North America & \$18.2B & 40.3\% & 12.5\% \\
\rowcolor{tablealt} Europe & \$12.1B & 26.8\% & 14.2\% \\
Asia-Pacific & \$10.5B & 23.2\% & 18.7\% \\
\rowcolor{tablealt} Rest of World & \$4.4B & 9.7\% & 11.3\% \\
\midrule
\textbf{Total} & \textbf{\$45.2B} & \textbf{100\%} & \textbf{15.3\%} \\
\bottomrule
\end{tabular}
\label{tab:regional}
\end{table}
```

### Table with Trend Indicators
```latex
\begin{tabular}{@{}lrrl@{}}
\toprule
\textbf{Company} & \textbf{Revenue} & \textbf{Share} & \textbf{Trend} \\
\midrule
Company A & \$5.2B & 15.3\% & \trendup{} +12\% \\
Company B & \$4.8B & 14.1\% & \trenddown{} -3\% \\
Company C & \$4.2B & 12.4\% & \trendflat{} +1\% \\
\bottomrule
\end{tabular}
```

---

## Figure Formatting

### Standard Figure
```latex
\begin{figure}[htbp]
\centering
\includegraphics[width=0.9\textwidth]{../figures/market_growth.png}
\caption{Market Growth Trajectory (2020-2030)}
\label{fig:growth}
\end{figure}
```

### Figure with Source Attribution
```latex
\begin{figure}[htbp]
\centering
\includegraphics[width=0.85\textwidth]{../figures/market_share.png}
\caption{Market Share Distribution (2024)}
\figuresource{Company annual reports, industry analysis}
\label{fig:market_share}
\end{figure}
```

---

## List Formatting

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

### Nested Lists
```latex
\begin{itemize}
    \item Main point
    \begin{itemize}
        \item Sub-point A
        \item Sub-point B
    \end{itemize}
    \item Another main point
\end{itemize}
```

---

## Title Page

### Using the Custom Title Command
```latex
\makemarketreporttitle
    {Market Title}              % Report title
    {Subtitle Here}             % Subtitle
    {../figures/cover.png}      % Hero image (leave empty for no image)
    {January 2025}              % Date
    {Market Intelligence Team}  % Author/prepared by
```

### Manual Title Page
See the template for full manual title page code.

---

## Appendix Sections

```latex
\appendix

\chapter{Methodology}

\appendixsection{Data Sources}
Content that appears in table of contents...
```

---

## Common Patterns

### Market Snapshot Section
```latex
\begin{marketdatabox}[Market Snapshot]
\begin{itemize}
    \item \textbf{Current Market Size:} \marketsize{45.2 billion}
    \item \textbf{Projected Size (2030):} \marketsize{98.7 billion}
    \item \textbf{CAGR:} \growthrate{15.3}
    \item \textbf{Largest Segment:} Enterprise (42\% share)
    \item \textbf{Fastest Growing Region:} APAC (\growthrate{22.1} CAGR)
\end{itemize}
\end{marketdatabox}
```

### Risk Register Summary
```latex
\begin{table}[htbp]
\centering
\caption{Risk Assessment Summary}
\begin{tabular}{@{}llccl@{}}
\toprule
\textbf{Risk} & \textbf{Category} & \textbf{Prob.} & \textbf{Impact} & \textbf{Rating} \\
\midrule
Market disruption & Market & High & High & \riskhigh{} \\
\rowcolor{tablealt} Regulatory change & Regulatory & Med & High & \riskhigh{} \\
New entrant & Competitive & Med & Med & \riskmedium{} \\
\rowcolor{tablealt} Tech obsolescence & Technology & Low & High & \riskmedium{} \\
Currency fluctuation & Financial & Med & Low & \risklow{} \\
\bottomrule
\end{tabular}
\end{table}
```

### Competitive Comparison Table
```latex
\begin{table}[htbp]
\centering
\caption{Competitive Comparison}
\begin{tabular}{@{}lccccc@{}}
\toprule
\textbf{Factor} & \textbf{Co. A} & \textbf{Co. B} & \textbf{Co. C} & \textbf{Co. D} \\
\midrule
Market Share & \rating{5} & \rating{4} & \rating{3} & \rating{2} \\
\rowcolor{tablealt} Product Quality & \rating{4} & \rating{5} & \rating{3} & \rating{4} \\
Price Competitiveness & \rating{3} & \rating{3} & \rating{5} & \rating{4} \\
\rowcolor{tablealt} Innovation & \rating{5} & \rating{4} & \rating{2} & \rating{3} \\
Customer Service & \rating{4} & \rating{4} & \rating{4} & \rating{5} \\
\bottomrule
\end{tabular}
\end{table}
```

---

## Troubleshooting

### Box Overflow
If box content overflows the page, break into multiple boxes or use page breaks:
```latex
\newpage
\begin{keyinsightbox}[Continued...]
```

### Figure Placement
Use `[htbp]` for flexible placement, or `[H]` (requires `float` package) for exact placement:
```latex
\begin{figure}[H]  % Requires \usepackage{float}
```

### Table Too Wide
Use `\resizebox` or `adjustbox`:
```latex
\resizebox{\textwidth}{!}{
\begin{tabular}{...}
...
\end{tabular}
}
```

### Color Not Appearing
Ensure `xcolor` package is loaded with `[table]` option (already included in style file).

---

## Compilation

Compile with XeLaTeX for best results:
```bash
xelatex report.tex
bibtex report
xelatex report.tex
xelatex report.tex
```

Or use latexmk:
```bash
latexmk -xelatex report.tex
```
