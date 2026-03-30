---
name: market-research-reports
description: Generate comprehensive market research reports (50+ pages) in the style of top consulting firms (McKinsey, BCG, Gartner). Features professional LaTeX formatting, extensive visual generation with scientific-schematics and generate-image, deep integration with research-lookup for data gathering, and multi-framework strategic analysis including Porter Five Forces, PESTLE, SWOT, TAM/SAM/SOM, and BCG Matrix.
allowed-tools: Read Write Edit Bash
license: MIT license
metadata:
    skill-author: K-Dense Inc.
---

# Market Research Reports

## Overview

Market research reports are comprehensive strategic documents that analyze industries, markets, and competitive landscapes to inform business decisions, investment strategies, and strategic planning. This skill generates **professional-grade reports of 50+ pages** with extensive visual content, modeled after deliverables from top consulting firms like McKinsey, BCG, Bain, Gartner, and Forrester.

**Key Features:**
- **Comprehensive length**: Reports are designed to be 50+ pages with no token constraints
- **Visual-rich content**: 5-6 key diagrams generated at start (more added as needed during writing)
- **Data-driven analysis**: Deep integration with research-lookup for market data
- **Multi-framework approach**: Porter's Five Forces, PESTLE, SWOT, BCG Matrix, TAM/SAM/SOM
- **Professional formatting**: Consulting-firm quality typography, colors, and layout
- **Actionable recommendations**: Strategic focus with implementation roadmaps

**Output Format:** LaTeX with professional styling, compiled to PDF. Uses the `market_research.sty` style package for consistent, professional formatting.

## When to Use This Skill

This skill should be used when:
- Creating comprehensive market analysis for investment decisions
- Developing industry reports for strategic planning
- Analyzing competitive landscapes and market dynamics
- Conducting market sizing exercises (TAM/SAM/SOM)
- Evaluating market entry opportunities
- Preparing due diligence materials for M&A activities
- Creating thought leadership content for industry positioning
- Developing go-to-market strategy documentation
- Analyzing regulatory and policy impacts on markets
- Building business cases for new product launches

## Visual Enhancement Requirements

**CRITICAL: Market research reports should include key visual content.**

Every report should generate **6 essential visuals** at the start, with additional visuals added as needed during writing. Start with the most critical visualizations to establish the report framework.

### Visual Generation Tools

**Use `scientific-schematics` for:**
- Market growth trajectory charts
- TAM/SAM/SOM breakdown diagrams (concentric circles)
- Porter's Five Forces diagrams
- Competitive positioning matrices
- Market segmentation charts
- Value chain diagrams
- Technology roadmaps
- Risk heatmaps
- Strategic prioritization matrices
- Implementation timelines/Gantt charts
- SWOT analysis diagrams
- BCG Growth-Share matrices

```bash
# Example: Generate a TAM/SAM/SOM diagram
python skills/scientific-schematics/scripts/generate_schematic.py \
  "TAM SAM SOM concentric circle diagram showing Total Addressable Market $50B outer circle, Serviceable Addressable Market $15B middle circle, Serviceable Obtainable Market $3B inner circle, with labels and arrows pointing to each segment" \
  -o figures/tam_sam_som.png --doc-type report

# Example: Generate Porter's Five Forces
python skills/scientific-schematics/scripts/generate_schematic.py \
  "Porter's Five Forces diagram with center box 'Competitive Rivalry' connected to four surrounding boxes: 'Threat of New Entrants' (top), 'Bargaining Power of Suppliers' (left), 'Bargaining Power of Buyers' (right), 'Threat of Substitutes' (bottom). Each box should show High/Medium/Low rating" \
  -o figures/porters_five_forces.png --doc-type report
```

**Use `generate-image` for:**
- Executive summary hero infographics
- Industry/sector conceptual illustrations
- Abstract technology visualizations
- Cover page imagery

```bash
# Example: Generate executive summary infographic
python skills/generate-image/scripts/generate_image.py \
  "Professional executive summary infographic for market research report, showing key metrics in modern data visualization style, blue and green color scheme, clean minimalist design with icons representing market size, growth rate, and competitive landscape" \
  --output figures/executive_summary.png
```

### Recommended Visuals by Section (Generate as Needed)

| Section | Priority Visuals | Optional Visuals |
|---------|-----------------|------------------|
| Executive Summary | Executive infographic (START) | - |
| Market Size & Growth | Growth trajectory (START), TAM/SAM/SOM (START) | Regional breakdown, segment growth |
| Competitive Landscape | Porter's Five Forces (START), Positioning matrix (START) | Market share chart, strategic groups |
| Risk Analysis | Risk heatmap (START) | Mitigation matrix |
| Strategic Recommendations | Opportunity matrix | Priority framework |
| Implementation Roadmap | Timeline/Gantt | Milestone tracker |
| Investment Thesis | Financial projections | Scenario analysis |

**Start with 6 priority visuals** (marked as START above), then generate additional visuals as specific sections are written and require visual support.

---

## Report Structure (50+ Pages)

### Front Matter (~5 pages)

#### Cover Page (1 page)
- Report title and subtitle
- Hero visualization (generated)
- Date and classification
- Prepared for / Prepared by

#### Table of Contents (1-2 pages)
- Automated from LaTeX
- List of Figures
- List of Tables

#### Executive Summary (2-3 pages)
- **Market Snapshot Box**: Key metrics at a glance
- **Investment Thesis**: 3-5 bullet point summary
- **Key Findings**: Major discoveries and insights
- **Strategic Recommendations**: Top 3-5 actionable recommendations
- **Executive Summary Infographic**: Visual synthesis of report highlights

---

### Core Analysis (~35 pages)

#### Chapter 1: Market Overview & Definition (4-5 pages)

**Content Requirements:**
- Market definition and scope
- Industry ecosystem mapping
- Key stakeholders and their roles
- Market boundaries and adjacencies
- Historical context and evolution

**Required Visuals (2):**
1. Market ecosystem/value chain diagram
2. Industry structure diagram

**Key Data Points:**
- Market definition criteria
- Included/excluded segments
- Geographic scope
- Time horizon for analysis

---

#### Chapter 2: Market Size & Growth Analysis (6-8 pages)

**Content Requirements:**
- Total Addressable Market (TAM) calculation
- Serviceable Addressable Market (SAM) definition
- Serviceable Obtainable Market (SOM) estimation
- Historical growth analysis (5-10 years)
- Growth projections (5-10 years forward)
- Growth drivers and inhibitors
- Regional market breakdown
- Segment-level analysis

**Required Visuals (4):**
1. Market growth trajectory chart (historical + projected)
2. TAM/SAM/SOM concentric circles diagram
3. Regional market breakdown (pie chart or treemap)
4. Segment growth comparison (bar chart)

**Key Data Points:**
- Current market size (with source)
- CAGR (historical and projected)
- Market size by region
- Market size by segment
- Key assumptions for projections

**Data Sources:**
Use `research-lookup` to find:
- Market research reports (Gartner, Forrester, IDC, etc.)
- Industry association data
- Government statistics
- Company financial reports
- Academic studies

---

#### Chapter 3: Industry Drivers & Trends (5-6 pages)

**Content Requirements:**
- Macroeconomic factors
- Technology trends
- Regulatory drivers
- Social and demographic shifts
- Environmental factors
- Industry-specific trends

**Analysis Frameworks:**
- **PESTLE Analysis**: Political, Economic, Social, Technological, Legal, Environmental
- **Trend Impact Assessment**: Likelihood vs Impact matrix

**Required Visuals (3):**
1. Industry trends timeline or radar chart
2. Driver impact matrix
3. PESTLE analysis diagram

**Key Data Points:**
- Top 5-10 growth drivers with quantified impact
- Emerging trends with timeline
- Disruption factors

---

#### Chapter 4: Competitive Landscape (6-8 pages)

**Content Requirements:**
- Market structure analysis
- Major player profiles
- Market share analysis
- Competitive positioning
- Barriers to entry
- Competitive dynamics

**Analysis Frameworks:**
- **Porter's Five Forces**: Comprehensive industry analysis
- **Competitive Positioning Matrix**: 2x2 matrix on key dimensions
- **Strategic Group Mapping**: Cluster competitors by strategy

**Required Visuals (4):**
1. Porter's Five Forces diagram
2. Market share pie chart or bar chart
3. Competitive positioning matrix (2x2)
4. Strategic group map

**Key Data Points:**
- Market share by company (top 10)
- Competitive intensity rating
- Entry barriers assessment
- Supplier/buyer power assessment

---

#### Chapter 5: Customer Analysis & Segmentation (4-5 pages)

**Content Requirements:**
- Customer segment definitions
- Segment size and growth
- Buying behavior analysis
- Customer needs and pain points
- Decision-making process
- Value drivers by segment

**Analysis Frameworks:**
- **Customer Segmentation Matrix**: Size vs Growth
- **Value Proposition Canvas**: Jobs, Pains, Gains
- **Customer Journey Mapping**: Awareness to Advocacy

**Required Visuals (3):**
1. Customer segmentation breakdown (pie/treemap)
2. Segment attractiveness matrix
3. Customer journey or value proposition diagram

**Key Data Points:**
- Segment sizes and percentages
- Growth rates by segment
- Average deal size / revenue per customer
- Customer acquisition cost by segment

---

#### Chapter 6: Technology & Innovation Landscape (4-5 pages)

**Content Requirements:**
- Current technology stack
- Emerging technologies
- Innovation trends
- Technology adoption curves
- R&D investment analysis
- Patent landscape

**Analysis Frameworks:**
- **Technology Readiness Assessment**: TRL levels
- **Hype Cycle Positioning**: Where technologies sit
- **Technology Roadmap**: Evolution over time

**Required Visuals (2):**
1. Technology roadmap diagram
2. Innovation/adoption curve or hype cycle

**Key Data Points:**
- R&D spending in the industry
- Key technology milestones
- Patent filing trends
- Technology adoption rates

---

#### Chapter 7: Regulatory & Policy Environment (3-4 pages)

**Content Requirements:**
- Current regulatory framework
- Key regulatory bodies
- Compliance requirements
- Upcoming regulatory changes
- Policy trends
- Impact assessment

**Required Visuals (1):**
1. Regulatory timeline or framework diagram

**Key Data Points:**
- Key regulations and effective dates
- Compliance costs
- Regulatory risks
- Policy change probability

---

#### Chapter 8: Risk Analysis (3-4 pages)

**Content Requirements:**
- Market risks
- Competitive risks
- Regulatory risks
- Technology risks
- Operational risks
- Financial risks
- Risk mitigation strategies

**Analysis Frameworks:**
- **Risk Heatmap**: Probability vs Impact
- **Risk Register**: Comprehensive risk inventory
- **Mitigation Matrix**: Risk vs Mitigation strategy

**Required Visuals (2):**
1. Risk heatmap (probability vs impact)
2. Risk mitigation matrix

**Key Data Points:**
- Top 10 risks with ratings
- Risk probability scores
- Impact severity scores
- Mitigation cost estimates

---

### Strategic Recommendations (~10 pages)

#### Chapter 9: Strategic Opportunities & Recommendations (4-5 pages)

**Content Requirements:**
- Opportunity identification
- Opportunity sizing
- Strategic options analysis
- Prioritization framework
- Detailed recommendations
- Success factors

**Analysis Frameworks:**
- **Opportunity Attractiveness Matrix**: Attractiveness vs Ability to Win
- **Strategic Options Framework**: Build, Buy, Partner, Ignore
- **Priority Matrix**: Impact vs Effort

**Required Visuals (3):**
1. Opportunity matrix
2. Strategic options framework
3. Priority/recommendation matrix

**Key Data Points:**
- Opportunity sizes
- Investment requirements
- Expected returns
- Timeline to value

---

#### Chapter 10: Implementation Roadmap (3-4 pages)

**Content Requirements:**
- Phased implementation plan
- Key milestones and deliverables
- Resource requirements
- Timeline and sequencing
- Dependencies and critical path
- Governance structure

**Required Visuals (2):**
1. Implementation timeline/Gantt chart
2. Milestone tracker or phase diagram

**Key Data Points:**
- Phase durations
- Resource requirements
- Key milestones with dates
- Budget allocation by phase

---

#### Chapter 11: Investment Thesis & Financial Projections (3-4 pages)

**Content Requirements:**
- Investment summary
- Financial projections
- Scenario analysis
- Return expectations
- Key assumptions
- Sensitivity analysis

**Required Visuals (2):**
1. Financial projection chart (revenue, growth)
2. Scenario analysis comparison

**Key Data Points:**
- Revenue projections (3-5 years)
- CAGR projections
- ROI/IRR expectations
- Key financial assumptions

---

### Back Matter (~5 pages)

#### Appendix A: Methodology & Data Sources (1-2 pages)
- Research methodology
- Data collection approach
- Data sources and citations
- Limitations and assumptions

#### Appendix B: Detailed Market Data Tables (2-3 pages)
- Comprehensive market data tables
- Regional breakdowns
- Segment details
- Historical data series

#### Appendix C: Company Profiles (1-2 pages)
- Brief profiles of key competitors
- Financial highlights
- Strategic focus areas

#### References/Bibliography
- All sources cited
- BibTeX format for LaTeX

---

## Workflow

### Phase 1: Research & Data Gathering

**Step 1: Define Scope**
- Clarify market definition
- Set geographic boundaries
- Determine time horizon
- Identify key questions to answer

**Step 2: Conduct Deep Research**

Use `research-lookup` extensively to gather market data:

```bash
# Market size and growth data
python skills/research-lookup/scripts/research_lookup.py \
  "What is the current market size and projected growth rate for [MARKET] industry? Include TAM, SAM, SOM estimates and CAGR projections"

# Competitive landscape
python skills/research-lookup/scripts/research_lookup.py \
  "Who are the top 10 competitors in the [MARKET] market? What is their market share and competitive positioning?"

# Industry trends
python skills/research-lookup/scripts/research_lookup.py \
  "What are the major trends and growth drivers in the [MARKET] industry for 2024-2030?"

# Regulatory environment
python skills/research-lookup/scripts/research_lookup.py \
  "What are the key regulations and policy changes affecting the [MARKET] industry?"
```

**Step 3: Data Organization**
- Create `sources/` folder with research notes
- Organize data by section
- Identify data gaps
- Conduct follow-up research as needed

### Phase 2: Analysis & Framework Application

**Step 4: Apply Analysis Frameworks**

For each framework, conduct structured analysis:

- **Market Sizing**: TAM → SAM → SOM with clear assumptions
- **Porter's Five Forces**: Rate each force High/Medium/Low with rationale
- **PESTLE**: Analyze each dimension with trends and impacts
- **SWOT**: Internal strengths/weaknesses, external opportunities/threats
- **Competitive Positioning**: Define axes, plot competitors

**Step 5: Develop Insights**
- Synthesize findings into key insights
- Identify strategic implications
- Develop recommendations
- Prioritize opportunities

### Phase 3: Visual Generation

**Step 6: Generate All Visuals**

Generate visuals BEFORE writing the report. Use the batch generation script:

```bash
# Generate all standard market report visuals
python skills/market-research-reports/scripts/generate_market_visuals.py \
  --topic "[MARKET NAME]" \
  --output-dir figures/
```

Or generate individually:

```bash
# 1. Market growth trajectory
python skills/scientific-schematics/scripts/generate_schematic.py \
  "Bar chart showing market growth from 2020 to 2034, with historical bars in dark blue (2020-2024) and projected bars in light blue (2025-2034). Y-axis shows market size in billions USD. Include CAGR annotation" \
  -o figures/01_market_growth.png --doc-type report

# 2. TAM/SAM/SOM breakdown
python skills/scientific-schematics/scripts/generate_schematic.py \
  "TAM SAM SOM concentric circles diagram. Outer circle TAM Total Addressable Market, middle circle SAM Serviceable Addressable Market, inner circle SOM Serviceable Obtainable Market. Each labeled with acronym and description. Blue gradient" \
  -o figures/02_tam_sam_som.png --doc-type report

# 3. Porter's Five Forces
python skills/scientific-schematics/scripts/generate_schematic.py \
  "Porter's Five Forces diagram with center box 'Competitive Rivalry' connected to four surrounding boxes: Threat of New Entrants (top), Bargaining Power of Suppliers (left), Bargaining Power of Buyers (right), Threat of Substitutes (bottom). Color code by rating: High=red, Medium=yellow, Low=green" \
  -o figures/03_porters_five_forces.png --doc-type report

# 4. Competitive positioning matrix
python skills/scientific-schematics/scripts/generate_schematic.py \
  "2x2 competitive positioning matrix with X-axis 'Market Focus (Niche to Broad)' and Y-axis 'Solution Approach (Product to Platform)'. Plot 8-10 competitors as labeled circles of varying sizes. Include quadrant labels" \
  -o figures/04_competitive_positioning.png --doc-type report

# 5. Risk heatmap
python skills/scientific-schematics/scripts/generate_schematic.py \
  "Risk heatmap matrix. X-axis Impact (Low to Critical), Y-axis Probability (Unlikely to Very Likely). Color gradient: Green (low risk) to Red (critical risk). Plot 10-12 risks as labeled points" \
  -o figures/05_risk_heatmap.png --doc-type report

# 6. (Optional) Executive summary infographic
python skills/generate-image/scripts/generate_image.py \
  "Professional executive summary infographic for market research report, modern data visualization style, blue and green color scheme, clean minimalist design" \
  --output figures/06_exec_summary.png
```

### Phase 4: Report Writing

**Step 7: Initialize Project Structure**

Create the standard project structure:

```
writing_outputs/YYYYMMDD_HHMMSS_market_report_[topic]/
├── progress.md
├── drafts/
│   └── v1_market_report.tex
├── references/
│   └── references.bib
├── figures/
│   └── [all generated visuals]
├── sources/
│   └── [research notes]
└── final/
```

**Step 8: Write Report Using Template**

Use the `market_report_template.tex` as a starting point. Write each section following the structure guide, ensuring:

- **Comprehensive coverage**: Every subsection addressed
- **Data-driven content**: Claims supported by research
- **Visual integration**: Reference all generated figures
- **Professional tone**: Consulting-style writing
- **No token constraints**: Write fully, don't abbreviate

**Writing Guidelines:**
- Use active voice where possible
- Lead with insights, support with data
- Use numbered lists for recommendations
- Include data sources for all statistics
- Create smooth transitions between sections

### Phase 5: Compilation & Review

**Step 9: Compile LaTeX**

```bash
cd writing_outputs/[project_folder]/drafts/
xelatex v1_market_report.tex
bibtex v1_market_report
xelatex v1_market_report.tex
xelatex v1_market_report.tex
```

**Step 10: Quality Review**

Verify the report meets quality standards:

- [ ] Total page count is 50+ pages
- [ ] All essential visuals (5-6 core + any additional) are included and render correctly
- [ ] Executive summary captures key findings
- [ ] All data points have sources cited
- [ ] Analysis frameworks are properly applied
- [ ] Recommendations are actionable and prioritized
- [ ] No orphaned figures or tables
- [ ] Table of contents, list of figures, list of tables are accurate
- [ ] Bibliography is complete
- [ ] PDF renders without errors

**Step 11: Peer Review**

Use the peer-review skill to evaluate the report:
- Assess comprehensiveness
- Verify data accuracy
- Check logical flow
- Evaluate recommendation quality

---

## Quality Standards

### Page Count Targets

| Section | Minimum Pages | Target Pages |
|---------|---------------|--------------|
| Front Matter | 4 | 5 |
| Market Overview | 4 | 5 |
| Market Size & Growth | 5 | 7 |
| Industry Drivers | 4 | 6 |
| Competitive Landscape | 5 | 7 |
| Customer Analysis | 3 | 5 |
| Technology Landscape | 3 | 5 |
| Regulatory Environment | 2 | 4 |
| Risk Analysis | 2 | 4 |
| Strategic Recommendations | 3 | 5 |
| Implementation Roadmap | 2 | 4 |
| Investment Thesis | 2 | 4 |
| Back Matter | 4 | 5 |
| **TOTAL** | **43** | **66** |

### Visual Quality Requirements

- **Resolution**: All images at 300 DPI minimum
- **Format**: PNG for raster, PDF for vector
- **Accessibility**: Colorblind-friendly palettes
- **Consistency**: Same color scheme throughout
- **Labeling**: All axes, legends, and data points labeled
- **Source Attribution**: Sources cited in figure captions

### Data Quality Requirements

- **Currency**: Data no older than 2 years (prefer current year)
- **Sourcing**: All statistics attributed to specific sources
- **Validation**: Cross-reference multiple sources when possible
- **Assumptions**: All projections state underlying assumptions
- **Limitations**: Acknowledge data limitations and gaps

### Writing Quality Requirements

- **Objectivity**: Present balanced analysis, acknowledge uncertainties
- **Clarity**: Avoid jargon, define technical terms
- **Precision**: Use specific numbers over vague qualifiers
- **Structure**: Clear headings, logical flow, smooth transitions
- **Actionability**: Recommendations are specific and implementable

---

## LaTeX Formatting

### Using the Style Package

The `market_research.sty` package provides professional formatting. Include it in your document:

```latex
\documentclass[11pt,letterpaper]{report}
\usepackage{market_research}
```

### Box Environments

Use colored boxes to highlight key content:

```latex
% Key insight box (blue)
\begin{keyinsightbox}[Key Finding]
The market is projected to grow at 15.3% CAGR through 2030.
\end{keyinsightbox}

% Market data box (green)
\begin{marketdatabox}[Market Snapshot]
\begin{itemize}
    \item Market Size (2024): \$45.2B
    \item Projected Size (2030): \$98.7B
    \item CAGR: 15.3%
\end{itemize}
\end{marketdatabox}

% Risk box (orange/warning)
\begin{riskbox}[Critical Risk]
Regulatory changes could impact 40% of market participants.
\end{riskbox}

% Recommendation box (purple)
\begin{recommendationbox}[Strategic Recommendation]
Prioritize market entry in the Asia-Pacific region.
\end{recommendationbox}

% Callout box (gray)
\begin{calloutbox}[Definition]
TAM (Total Addressable Market) represents the total revenue opportunity.
\end{calloutbox}
```

### Figure Formatting

```latex
\begin{figure}[htbp]
\centering
\includegraphics[width=0.9\textwidth]{../figures/market_growth.png}
\caption{Market Growth Trajectory (2020-2030). Source: Industry analysis, company data.}
\label{fig:market_growth}
\end{figure}
```

### Table Formatting

```latex
\begin{table}[htbp]
\centering
\caption{Market Size by Region (2024)}
\begin{tabular}{@{}lrrr@{}}
\toprule
\textbf{Region} & \textbf{Size (USD)} & \textbf{Share} & \textbf{CAGR} \\
\midrule
North America & \$18.2B & 40.3\% & 12.5\% \\
\rowcolor{tablealt} Europe & \$12.1B & 26.8\% & 14.2\% \\
Asia-Pacific & \$10.5B & 23.2\% & 18.7\% \\
\rowcolor{tablealt} Rest of World & \$4.4B & 9.7\% & 11.3\% \\
\midrule
\textbf{Total} & \textbf{\$45.2B} & \textbf{100\%} & \textbf{15.3\%} \\
\bottomrule
\end{tabular}
\label{tab:market_by_region}
\end{table}
```

For complete formatting reference, see `assets/FORMATTING_GUIDE.md`.

---

## Integration with Other Skills

This skill works synergistically with:

- **research-lookup**: Essential for gathering market data, statistics, and competitive intelligence
- **scientific-schematics**: Generate all diagrams, charts, and visualizations
- **generate-image**: Create infographics and conceptual illustrations
- **peer-review**: Evaluate report quality and completeness
- **citation-management**: Manage BibTeX references

---

## Example Prompts

### Market Overview Section

```
Write a comprehensive market overview section for the [Electric Vehicle Charging Infrastructure] market. Include:
- Clear market definition and scope
- Industry ecosystem with key stakeholders
- Value chain analysis
- Historical evolution of the market
- Current market dynamics

Generate 2 supporting visuals using scientific-schematics.
```

### Competitive Landscape Section

```
Analyze the competitive landscape for the [Cloud Computing] market. Include:
- Porter's Five Forces analysis with High/Medium/Low ratings
- Top 10 competitors with market share
- Competitive positioning matrix
- Strategic group mapping
- Barriers to entry analysis

Generate 4 supporting visuals including Porter's Five Forces diagram and positioning matrix.
```

### Strategic Recommendations Section

```
Develop strategic recommendations for entering the [Renewable Energy Storage] market. Include:
- 5-7 prioritized recommendations
- Opportunity sizing for each
- Implementation considerations
- Risk factors and mitigations
- Success criteria

Generate 3 supporting visuals including opportunity matrix and priority framework.
```

---

## Checklist: 50+ Page Validation

Before finalizing the report, verify:

### Structure Completeness
- [ ] Cover page with hero visual
- [ ] Table of contents (auto-generated)
- [ ] List of figures (auto-generated)
- [ ] List of tables (auto-generated)
- [ ] Executive summary (2-3 pages)
- [ ] All 11 core chapters present
- [ ] Appendix A: Methodology
- [ ] Appendix B: Data tables
- [ ] Appendix C: Company profiles
- [ ] References/Bibliography

### Visual Completeness (Core 5-6)
- [ ] Market growth trajectory chart (Priority 1)
- [ ] TAM/SAM/SOM diagram (Priority 2)
- [ ] Porter's Five Forces (Priority 3)
- [ ] Competitive positioning matrix (Priority 4)
- [ ] Risk heatmap (Priority 5)
- [ ] Executive summary infographic (Priority 6, optional)

### Additional Visuals (Generate as Needed)
- [ ] Market ecosystem diagram
- [ ] Regional breakdown chart
- [ ] Segment growth chart
- [ ] Industry trends/PESTLE diagram
- [ ] Market share chart
- [ ] Customer segmentation chart
- [ ] Technology roadmap
- [ ] Regulatory timeline
- [ ] Opportunity matrix
- [ ] Implementation timeline
- [ ] Financial projections chart
- [ ] Other section-specific visuals

### Content Quality
- [ ] All statistics have sources
- [ ] Projections include assumptions
- [ ] Frameworks properly applied
- [ ] Recommendations are actionable
- [ ] Writing is professional quality
- [ ] No placeholder or incomplete sections

### Technical Quality
- [ ] PDF compiles without errors
- [ ] All figures render correctly
- [ ] Cross-references work
- [ ] Bibliography complete
- [ ] Page count exceeds 50

---

## Resources

### Reference Files

Load these files for detailed guidance:

- **`references/report_structure_guide.md`**: Detailed section-by-section content requirements
- **`references/visual_generation_guide.md`**: Complete prompts for generating all visual types
- **`references/data_analysis_patterns.md`**: Templates for Porter's, PESTLE, SWOT, etc.

### Assets

- **`assets/market_research.sty`**: LaTeX style package
- **`assets/market_report_template.tex`**: Complete LaTeX template
- **`assets/FORMATTING_GUIDE.md`**: Quick reference for box environments and styling

### Scripts

- **`scripts/generate_market_visuals.py`**: Batch generate all report visuals

---

## Troubleshooting

### Common Issues

**Problem**: Report is under 50 pages
- **Solution**: Expand data tables in appendices, add more detailed company profiles, include additional regional breakdowns

**Problem**: Visuals not rendering
- **Solution**: Check file paths in LaTeX, ensure images are in figures/ folder, verify file extensions

**Problem**: Bibliography missing entries
- **Solution**: Run bibtex after first xelatex pass, check .bib file for syntax errors

**Problem**: Table/figure overflow
- **Solution**: Use `\resizebox` or `adjustbox` package, reduce image width percentage

**Problem**: Poor visual quality from generation
- **Solution**: Use `--doc-type report` flag, increase iterations with `--iterations 5`

---

Use this skill to create comprehensive, visually-rich market research reports that rival top consulting firm deliverables. The combination of deep research, structured frameworks, and extensive visualization produces documents that inform strategic decisions and demonstrate analytical rigor.

