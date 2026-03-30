# Visual Generation Guide for Market Research Reports

Complete prompts and guidance for generating visualizations in market research reports.

---

## Overview

Market research reports should start with **5-6 essential visuals** to establish the analytical framework. Additional visuals can be generated as needed when writing specific sections. This guide provides ready-to-use prompts for the `scientific-schematics` and `generate-image` skills.

### Core Visuals (Generate First - Priority 1-6)

Start every market report by generating these 5-6 core visuals:

1. **Market Growth Trajectory Chart** - Shows market size trends
2. **TAM/SAM/SOM Diagram** - Market opportunity breakdown
3. **Porter's Five Forces** - Competitive dynamics framework
4. **Competitive Positioning Matrix** - Strategic positioning
5. **Risk Heatmap** - Risk assessment visualization
6. **Executive Summary Infographic** (optional) - Report overview

### Extended Visuals (Generate as Needed - Priority 7+)

Additional visuals can be generated during writing when specific sections require visual support:
- Regional breakdown charts
- Segment analysis
- Customer journey maps
- Technology roadmaps
- Regulatory timelines
- Financial projections
- Implementation timelines

### Tool Selection

| Visual Type | Tool | Rationale |
|-------------|------|-----------|
| Charts (bar, line, pie) | scientific-schematics | Precise data representation |
| Diagrams (flow, structure) | scientific-schematics | Clear technical layouts |
| Matrices (2x2, positioning) | scientific-schematics | Strategic frameworks |
| Timelines | scientific-schematics | Sequential information |
| Infographics | generate-image | Creative visual synthesis |
| Conceptual illustrations | generate-image | Abstract concepts |

---

## Visual Naming Convention

### Core Visuals (Generate First)
```
figures/
├── 01_market_growth_trajectory.png      # PRIORITY 1
├── 02_tam_sam_som.png                   # PRIORITY 2
├── 03_porters_five_forces.png           # PRIORITY 3
├── 04_competitive_positioning.png       # PRIORITY 4
├── 05_risk_heatmap.png                  # PRIORITY 5
└── 06_exec_summary_infographic.png      # PRIORITY 6 (optional)
```

### Extended Visuals (Generate as Needed)
```
figures/
├── 07_industry_ecosystem.png
├── 08_regional_breakdown.png
├── 09_segment_growth.png
├── 10_driver_impact_matrix.png
├── 11_pestle_analysis.png
├── 12_trends_timeline.png
├── 13_market_share.png
├── 14_strategic_groups.png
├── 15_customer_segments.png
├── 16_segment_attractiveness.png
├── 17_customer_journey.png
├── 18_technology_roadmap.png
├── 19_innovation_curve.png
├── 20_regulatory_timeline.png
├── 21_risk_mitigation.png
├── 22_opportunity_matrix.png
├── 23_recommendation_priority.png
├── 24_implementation_timeline.png
├── 25_milestone_tracker.png
├── 26_financial_projections.png
└── 27_scenario_analysis.png
```

---

## CORE VISUALS (Priority 1-6) - Generate These First

### Priority 1: Market Growth Trajectory Chart

**Tool:** scientific-schematics

**Purpose:** Foundation visual showing historical and projected market size

**Command:**
```bash
python skills/scientific-schematics/scripts/generate_schematic.py \
  "Bar chart market growth 2020 to 2034. Historical bars 2020-2024 in dark blue, projected bars 2025-2034 in light blue. Y-axis billions USD, X-axis years. CAGR annotation. Data labels on each bar. Vertical dashed line between 2024 and 2025. Title: Market Growth Trajectory. Professional white background" \
  -o figures/01_market_growth_trajectory.png --doc-type report
```

---

### Priority 2: TAM/SAM/SOM Diagram

**Tool:** scientific-schematics

**Purpose:** Market opportunity sizing visualization

**Command:**
```bash
python skills/scientific-schematics/scripts/generate_schematic.py \
  "TAM SAM SOM concentric circles. Outer circle TAM Total Addressable Market. Middle circle SAM Serviceable Addressable Market. Inner circle SOM Serviceable Obtainable Market. Each labeled with acronym, full name, placeholder for dollar value. Arrows pointing to each with descriptions. Blue gradient darkest outer to lightest inner. White background professional appearance" \
  -o figures/02_tam_sam_som.png --doc-type report
```

---

### Priority 3: Porter's Five Forces Diagram

**Tool:** scientific-schematics

**Purpose:** Competitive dynamics framework

**Command:**
```bash
python skills/scientific-schematics/scripts/generate_schematic.py \
  "Porter's Five Forces diagram. Center box Competitive Rivalry with rating. Four surrounding boxes with arrows to center: Top Threat of New Entrants, Left Bargaining Power Suppliers, Right Bargaining Power Buyers, Bottom Threat of Substitutes. Color code HIGH red, MEDIUM yellow, LOW green. Include 2-3 key factors per box. Professional appearance" \
  -o figures/03_porters_five_forces.png --doc-type report
```

---

### Priority 4: Competitive Positioning Matrix

**Tool:** scientific-schematics

**Purpose:** Strategic positioning of key market players

**Command:**
```bash
python skills/scientific-schematics/scripts/generate_schematic.py \
  "2x2 competitive positioning matrix. X-axis Market Focus Niche to Broad. Y-axis Solution Approach Product to Platform. Quadrants: Upper-right Platform Leaders, Upper-left Niche Platforms, Lower-right Product Leaders, Lower-left Specialists. Plot 8-10 company circles with names. Circle size = market share. Legend for sizes. Professional appearance" \
  -o figures/04_competitive_positioning.png --doc-type report
```

---

### Priority 5: Risk Heatmap

**Tool:** scientific-schematics

**Purpose:** Visual risk assessment matrix

**Command:**
```bash
python skills/scientific-schematics/scripts/generate_schematic.py \
  "Risk heatmap matrix. X-axis Impact Low Medium High Critical. Y-axis Probability Unlikely Possible Likely Very Likely. Cell colors: Green low risk, Yellow medium, Orange high, Red critical. Plot 10-12 numbered risks R1 R2 etc as labeled points. Legend with risk names. Professional clear" \
  -o figures/05_risk_heatmap.png --doc-type report
```

---

### Priority 6: Executive Summary Infographic (Optional)

**Tool:** generate-image

**Purpose:** High-level visual synthesis for cover or executive summary

**Command:**
```bash
python skills/generate-image/scripts/generate_image.py \
  "Executive summary infographic for market research, one page layout, central large metric showing market size, four quadrants showing growth rate key players top segments regional leaders, modern flat design, professional blue and green color scheme, clean white background, corporate business aesthetic" \
  --output figures/06_exec_summary_infographic.png
```

---

## EXTENDED VISUALS - Generate During Writing as Needed

The following visuals can be generated when writing specific chapters that require them.

---

## Front Matter Visuals

### Extended: Cover Image / Hero Visual

**Tool:** generate-image

**Prompt:**
```
Professional executive summary infographic for [MARKET NAME] market research report. 
Modern data visualization style showing key metrics: market size, growth rate, key players.
Blue and green color scheme matching corporate design.
Clean minimalist design with icons.
High resolution, publication quality.
No text overlays, image only.
```

**Command:**
```bash
python skills/generate-image/scripts/generate_image.py \
  "Professional executive summary infographic for [MARKET] market research report, modern data visualization style, key metrics display, blue and green corporate color scheme, clean minimalist design with icons, high resolution publication quality" \
  --output figures/01_cover_image.png
```

### 2. Executive Summary Infographic

**Tool:** generate-image

**Prompt:**
```
One-page executive summary infographic showing:
- Large central metric: $XX billion market size
- Four quadrants with: Growth Rate, Key Players, Top Segments, Regional Leaders
- Modern flat design with data visualization elements
- Professional blue (#003366) and green (#008060) color scheme
- Clean white background
- Business/corporate aesthetic
```

**Command:**
```bash
python skills/generate-image/scripts/generate_image.py \
  "Executive summary infographic for market research, one page layout, central large metric showing market size, four quadrants showing growth rate key players top segments regional leaders, modern flat design, professional blue and green color scheme, clean white background, corporate business aesthetic" \
  --output figures/02_exec_summary_infographic.png
```

---

## Chapter 1: Market Overview Visuals

### 3. Industry Ecosystem Diagram

**Tool:** scientific-schematics

**Prompt:**
```
Industry ecosystem value chain diagram showing horizontal flow from left to right:
[Suppliers/Inputs] → [Manufacturers/Processors] → [Distributors/Channels] → [End Users/Customers]

At each stage, show 3-4 example player types in smaller boxes below.
Use arrows to show product/service flow (solid) and money flow (dashed).
Include regulatory bodies as oversight layer above the chain.
Professional blue color scheme.
Clean white background.
All text clearly readable.
```

**Command:**
```bash
python skills/scientific-schematics/scripts/generate_schematic.py \
  "Industry ecosystem value chain diagram. Horizontal flow left to right: Suppliers box → Manufacturers box → Distributors box → End Users box. Below each main box show 3-4 smaller boxes with example player types. Solid arrows for product flow, dashed arrows for money flow. Regulatory oversight layer above. Professional blue color scheme, white background, clear labels" \
  -o figures/03_industry_ecosystem.png --doc-type report
```

### 4. Market Structure Diagram

**Tool:** scientific-schematics

**Prompt:**
```
Market structure diagram showing concentric rectangles:
- Center: Core Market (labeled with market name)
- Second layer: Adjacent Markets (labeled with 4-5 adjacent market names)
- Third layer: Enabling Technologies (labeled with key technologies)
- Outer layer: Regulatory Framework

Use different shades of blue for each layer.
Include small icons or labels for key elements.
Professional appearance.
```

**Command:**
```bash
python skills/scientific-schematics/scripts/generate_schematic.py \
  "Market structure diagram with concentric rectangles. Center: Core Market [MARKET NAME]. Second layer: Adjacent Markets with 4-5 labels. Third layer: Enabling Technologies with key tech labels. Outer layer: Regulatory Framework. Different blue shades for each layer, professional appearance, clear labels" \
  -o figures/03b_market_structure.png --doc-type report
```

---

## Chapter 2: Market Size & Growth Visuals

### 5. Market Growth Trajectory Chart

**Tool:** scientific-schematics

**Prompt:**
```
Bar chart showing market growth from 2020 to 2034.
Historical years (2020-2024): Dark blue bars
Projected years (2025-2034): Light blue bars
Y-axis: Market size in billions USD (0 to $XXX)
X-axis: Years
Include CAGR annotation showing "XX.X% CAGR (2024-2034)"
Data labels on top of each bar
Vertical dashed line separating historical from projected
Title: "[MARKET NAME] Market Growth Trajectory"
Professional appearance, white background
```

**Command:**
```bash
python skills/scientific-schematics/scripts/generate_schematic.py \
  "Bar chart market growth 2020 to 2034. Historical bars 2020-2024 in dark blue, projected bars 2025-2034 in light blue. Y-axis billions USD, X-axis years. CAGR annotation XX.X% (2024-2034). Data labels on each bar. Vertical dashed line between 2024 and 2025. Title: Market Growth Trajectory. Professional white background" \
  -o figures/04_market_growth_trajectory.png --doc-type report
```

### 6. TAM/SAM/SOM Diagram

**Tool:** scientific-schematics

**Prompt:**
```
TAM SAM SOM concentric circles diagram:
- Outer circle: TAM (Total Addressable Market) - $XXX billion
- Middle circle: SAM (Serviceable Addressable Market) - $XX billion  
- Inner circle: SOM (Serviceable Obtainable Market) - $X billion

Each circle labeled with:
- Acronym in bold
- Full name
- Dollar value

Arrows pointing to each circle with descriptions
Use blue color gradient (darkest for TAM, lightest for SOM)
Professional appearance
White background
```

**Command:**
```bash
python skills/scientific-schematics/scripts/generate_schematic.py \
  "TAM SAM SOM concentric circles. Outer circle TAM Total Addressable Market [VALUE]B. Middle circle SAM Serviceable Addressable Market [VALUE]B. Inner circle SOM Serviceable Obtainable Market [VALUE]B. Each labeled with acronym, full name, dollar value. Arrows pointing to each with descriptions. Blue gradient darkest outer to lightest inner. White background professional" \
  -o figures/05_tam_sam_som.png --doc-type report
```

### 7. Regional Market Breakdown

**Tool:** scientific-schematics

**Prompt:**
```
Pie chart OR treemap showing regional market breakdown:
- North America: XX% ($X.XB) - Dark blue
- Europe: XX% ($X.XB) - Medium blue
- Asia-Pacific: XX% ($X.XB) - Teal
- Latin America: X% ($X.XB) - Light blue
- Middle East & Africa: X% ($X.XB) - Gray blue

Include both percentage and dollar value for each region
Legend on right side
Title: "Market Size by Region (2024)"
Professional appearance
```

**Command:**
```bash
python skills/scientific-schematics/scripts/generate_schematic.py \
  "Pie chart regional market breakdown. North America XX% dark blue, Europe XX% medium blue, Asia-Pacific XX% teal, Latin America XX% light blue, Middle East Africa XX% gray blue. Show percentage and dollar value for each slice. Legend on right. Title: Market Size by Region 2024. Professional appearance" \
  -o figures/06_regional_breakdown.png --doc-type report
```

### 8. Segment Growth Comparison

**Tool:** scientific-schematics

**Prompt:**
```
Horizontal bar chart comparing segment growth rates:
- Y-axis: Segment names (5-7 segments)
- X-axis: CAGR percentage (0% to 30%)
- Bars colored by growth rate: Green (highest) to blue (lowest)
- Data labels showing exact percentage on each bar
- Sort segments from highest to lowest growth
- Title: "Segment Growth Rate Comparison (CAGR 2024-2034)"
- Include average line or marker
```

**Command:**
```bash
python skills/scientific-schematics/scripts/generate_schematic.py \
  "Horizontal bar chart segment growth comparison. Y-axis 5-7 segment names, X-axis CAGR percentage 0-30%. Bars colored green highest to blue lowest. Data labels with exact percentages. Sorted highest to lowest. Title: Segment Growth Rate Comparison CAGR 2024-2034. Include market average line" \
  -o figures/07_segment_growth.png --doc-type report
```

---

## Chapter 3: Industry Drivers & Trends Visuals

### 9. Driver Impact Matrix

**Tool:** scientific-schematics

**Prompt:**
```
2x2 matrix for market driver assessment:
- X-axis: Impact on Market (Low → High)
- Y-axis: Probability of Occurrence (Low → High)
- Upper-right quadrant: "CRITICAL DRIVERS" (red/orange background)
- Upper-left quadrant: "MONITOR" (yellow background)
- Lower-right quadrant: "WATCH CAREFULLY" (yellow background)
- Lower-left quadrant: "LOWER PRIORITY" (green background)

Plot 8-10 drivers as labeled circles:
- Size of circle represents current market impact
- Position based on ratings

Include legend for circle sizes
Professional appearance with clear labels
```

**Command:**
```bash
python skills/scientific-schematics/scripts/generate_schematic.py \
  "2x2 matrix driver impact assessment. X-axis Impact Low to High, Y-axis Probability Low to High. Quadrants: Upper-right CRITICAL DRIVERS red, Upper-left MONITOR yellow, Lower-right WATCH CAREFULLY yellow, Lower-left LOWER PRIORITY green. Plot 8-10 labeled driver circles at appropriate positions. Circle size indicates current impact. Professional clear labels" \
  -o figures/08_driver_impact_matrix.png --doc-type report
```

### 10. PESTLE Analysis Diagram

**Tool:** scientific-schematics

**Prompt:**
```
PESTLE analysis hexagonal diagram:
- Center hexagon: "[MARKET NAME]" 
- Six surrounding hexagons connected to center:
  - Political (red/orange)
  - Economic (blue)
  - Social (green)
  - Technological (orange)
  - Legal (purple)
  - Environmental (teal)

Each outer hexagon contains 2-3 key bullet points
Connecting lines between center and outer hexagons
Professional appearance
Clear, readable text in each hexagon
```

**Command:**
```bash
python skills/scientific-schematics/scripts/generate_schematic.py \
  "PESTLE hexagonal diagram. Center hexagon labeled MARKET. Six surrounding hexagons: Political red, Economic blue, Social green, Technological orange, Legal purple, Environmental teal. Each outer hexagon has 2-3 bullet points of key factors. Lines connecting center to each. Professional appearance clear readable text" \
  -o figures/09_pestle_analysis.png --doc-type report
```

### 11. Industry Trends Timeline

**Tool:** scientific-schematics

**Prompt:**
```
Horizontal timeline showing emerging trends from 2024 to 2030:
- Main horizontal axis with year markers
- Plot 6-8 trends at different points on timeline
- Each trend shown with:
  - Icon or symbol
  - Trend name
  - Brief 3-5 word description below

Color-code by trend category:
- Technology trends: Blue
- Market trends: Green
- Regulatory trends: Orange

Include "Current" marker at 2024
Professional appearance with clear labels
```

**Command:**
```bash
python skills/scientific-schematics/scripts/generate_schematic.py \
  "Horizontal timeline 2024 to 2030. Plot 6-8 emerging trends at different years. Each trend with icon, name, brief description. Color code: Technology trends blue, Market trends green, Regulatory trends orange. Current marker at 2024. Professional clear labels" \
  -o figures/10_trends_timeline.png --doc-type report
```

---

## Chapter 4: Competitive Landscape Visuals

### 12. Porter's Five Forces Diagram

**Tool:** scientific-schematics

**Prompt:**
```
Porter's Five Forces diagram with center and four surrounding boxes:

Center box: "Competitive Rivalry" with rating [HIGH/MEDIUM/LOW]

Surrounding boxes connected by arrows:
- Top: "Threat of New Entrants" [RATING]
- Left: "Bargaining Power of Suppliers" [RATING]
- Right: "Bargaining Power of Buyers" [RATING]
- Bottom: "Threat of Substitutes" [RATING]

Color-code ratings:
- HIGH: Red/orange background
- MEDIUM: Yellow background
- LOW: Green background

Arrows pointing toward center
Include key factors as bullet points in each box
Professional appearance
```

**Command:**
```bash
python skills/scientific-schematics/scripts/generate_schematic.py \
  "Porter's Five Forces diagram. Center box Competitive Rivalry [RATING]. Four surrounding boxes with arrows to center: Top Threat of New Entrants [RATING], Left Bargaining Power Suppliers [RATING], Right Bargaining Power Buyers [RATING], Bottom Threat of Substitutes [RATING]. Color code HIGH red, MEDIUM yellow, LOW green. Include 2-3 key factors per box. Professional appearance" \
  -o figures/11_porters_five_forces.png --doc-type report
```

### 13. Market Share Chart

**Tool:** scientific-schematics

**Prompt:**
```
Pie chart or donut chart showing market share:
- Top 10 companies with distinct colors
- Company A: XX% (largest slice, dark blue)
- Company B: XX% (medium blue)
- [Continue for top 10]
- Others: XX% (gray)

Include:
- Percentage labels on each slice
- Company names in legend or on slices
- Total market size annotation
- Title: "Market Share by Company (2024)"

Professional appearance
Colorblind-friendly palette
```

**Command:**
```bash
python skills/scientific-schematics/scripts/generate_schematic.py \
  "Pie chart market share top 10 companies. Company A XX% dark blue, Company B XX% medium blue, [list companies and shares], Others XX% gray. Percentage labels on slices. Legend with company names. Total market size annotation. Title: Market Share by Company 2024. Colorblind-friendly colors professional" \
  -o figures/12_market_share.png --doc-type report
```

### 14. Competitive Positioning Matrix

**Tool:** scientific-schematics

**Prompt:**
```
2x2 competitive positioning matrix:
- X-axis: Market Focus (Niche ← → Broad)
- Y-axis: Solution Approach (Product ← → Platform)

Quadrant labels:
- Upper-right: "Platform Leaders"
- Upper-left: "Niche Platforms"
- Lower-right: "Product Leaders"
- Lower-left: "Specialists"

Plot 8-10 companies as labeled circles:
- Circle size represents market share
- Position based on strategy

Include legend for circle sizes
Company name labels
Professional appearance
```

**Command:**
```bash
python skills/scientific-schematics/scripts/generate_schematic.py \
  "2x2 competitive positioning matrix. X-axis Market Focus Niche to Broad. Y-axis Solution Approach Product to Platform. Quadrants: Upper-right Platform Leaders, Upper-left Niche Platforms, Lower-right Product Leaders, Lower-left Specialists. Plot 8-10 company circles with names. Circle size = market share. Legend for sizes. Professional" \
  -o figures/13_competitive_positioning.png --doc-type report
```

### 15. Strategic Group Map

**Tool:** scientific-schematics

**Prompt:**
```
Strategic group map showing competitor clusters:
- X-axis: Geographic Scope (Regional ← → Global)
- Y-axis: Product Breadth (Narrow ← → Broad)

Draw 4-5 oval "bubbles" representing strategic groups:
- Each bubble contains 2-4 company names
- Bubble size represents collective market share of group
- Different colors for each strategic group

Label each strategic group:
- "Global Generalists"
- "Regional Specialists"
- "Focused Innovators"
- etc.

Professional appearance
Clear company name labels
```

**Command:**
```bash
python skills/scientific-schematics/scripts/generate_schematic.py \
  "Strategic group map. X-axis Geographic Scope Regional to Global. Y-axis Product Breadth Narrow to Broad. Draw 4-5 oval bubbles for strategic groups. Each bubble contains 2-4 company names. Bubble size = collective market share. Label groups: Global Generalists, Regional Specialists, Focused Innovators etc. Different colors per group. Professional clear labels" \
  -o figures/14_strategic_groups.png --doc-type report
```

---

## Chapter 5: Customer Analysis Visuals

### 16. Customer Segmentation Breakdown

**Tool:** scientific-schematics

**Prompt:**
```
Treemap or pie chart showing customer segments:
- Large Enterprise: XX% (dark blue)
- Mid-Market: XX% (medium blue)
- SMB: XX% (light blue)
- Consumer: XX% (teal)

Size represents market share
Include for each segment:
- Segment name
- Percentage
- Dollar value

Title: "Customer Segmentation by Market Share"
Professional appearance
```

**Command:**
```bash
python skills/scientific-schematics/scripts/generate_schematic.py \
  "Treemap customer segmentation. Large Enterprise XX% dark blue, Mid-Market XX% medium blue, SMB XX% light blue, Consumer XX% teal. Each segment shows name percentage dollar value. Title: Customer Segmentation by Market Share. Professional appearance" \
  -o figures/15_customer_segments.png --doc-type report
```

### 17. Segment Attractiveness Matrix

**Tool:** scientific-schematics

**Prompt:**
```
2x2 segment attractiveness matrix:
- X-axis: Segment Size (Small ← → Large)
- Y-axis: Growth Rate (Low ← → High)

Quadrant labels and actions:
- Upper-right: "PRIORITY - Invest Heavily"
- Upper-left: "INVEST TO GROW"
- Lower-right: "HARVEST"
- Lower-left: "DEPRIORITIZE"

Plot customer segments as labeled circles
Circle size represents profitability
Different colors for each segment
Professional appearance
```

**Command:**
```bash
python skills/scientific-schematics/scripts/generate_schematic.py \
  "2x2 segment attractiveness matrix. X-axis Segment Size Small to Large. Y-axis Growth Rate Low to High. Quadrants: Upper-right PRIORITY Invest Heavily, Upper-left INVEST TO GROW, Lower-right HARVEST, Lower-left DEPRIORITIZE. Plot customer segments as circles. Circle size = profitability. Different colors. Professional" \
  -o figures/16_segment_attractiveness.png --doc-type report
```

### 18. Customer Journey Map

**Tool:** scientific-schematics

**Prompt:**
```
Customer journey horizontal flowchart showing 5-6 stages:
Awareness → Consideration → Decision → Implementation → Usage → Advocacy

For each stage, show three rows:
1. Key Activities (what customer does)
2. Pain Points (challenges faced)
3. Touchpoints (how they interact)

Use icons for each stage
Color gradient from light to dark as journey progresses
Professional appearance
Clear labels
```

**Command:**
```bash
python skills/scientific-schematics/scripts/generate_schematic.py \
  "Customer journey horizontal flowchart. 5 stages left to right: Awareness, Consideration, Decision, Implementation, Usage, Advocacy. Each stage shows Key Activities, Pain Points, Touchpoints in rows below. Icons for each stage. Color gradient light to dark. Professional clear labels" \
  -o figures/17_customer_journey.png --doc-type report
```

---

## Chapter 6: Technology Landscape Visuals

### 19. Technology Roadmap

**Tool:** scientific-schematics

**Prompt:**
```
Technology roadmap timeline from 2024 to 2030:
Three parallel horizontal tracks:
1. Core Technology (blue) - current foundation
2. Emerging Technology (green) - developing capabilities
3. Enabling Technology (orange) - infrastructure/support

Each track shows milestones and technology introductions as markers
Vertical lines connect related technologies across tracks
Timeline markers for each year
Technology names labeled at introduction points
Professional appearance
```

**Command:**
```bash
python skills/scientific-schematics/scripts/generate_schematic.py \
  "Technology roadmap 2024 to 2030. Three parallel horizontal tracks: Core Technology blue, Emerging Technology green, Enabling Technology orange. Milestones and tech introductions marked on each track. Vertical lines connect related tech. Year markers. Technology names labeled. Professional appearance" \
  -o figures/18_technology_roadmap.png --doc-type report
```

### 20. Innovation/Adoption Curve

**Tool:** scientific-schematics

**Prompt:**
```
Gartner Hype Cycle or Technology Adoption Curve:
Five phases from left to right:
1. Innovation Trigger (rising)
2. Peak of Inflated Expectations (peak)
3. Trough of Disillusionment (bottom)
4. Slope of Enlightenment (rising)
5. Plateau of Productivity (stable)

Plot 6-8 technologies at different positions on the curve
Each technology labeled with name
Color-code by technology category
Professional appearance
Clear axis labels
```

**Command:**
```bash
python skills/scientific-schematics/scripts/generate_schematic.py \
  "Gartner Hype Cycle curve. Five phases: Innovation Trigger rising, Peak of Inflated Expectations at top, Trough of Disillusionment at bottom, Slope of Enlightenment rising, Plateau of Productivity stable. Plot 6-8 technologies on curve with labels. Color by category. Professional clear labels" \
  -o figures/19_innovation_curve.png --doc-type report
```

---

## Chapter 7: Regulatory Environment Visuals

### 21. Regulatory Timeline

**Tool:** scientific-schematics

**Prompt:**
```
Regulatory timeline from 2020 to 2028:
Horizontal timeline with year markers
Mark key regulatory events:
- Past regulations (dark blue markers, solid)
- Current regulations (green marker at current year)
- Upcoming regulations (light blue markers, dashed)

Each marker shows:
- Regulation name
- Effective date
- Brief description (5-7 words)

Vertical "NOW" line at current year (2024)
Group by region if multiple jurisdictions
Professional appearance
```

**Command:**
```bash
python skills/scientific-schematics/scripts/generate_schematic.py \
  "Regulatory timeline 2020 to 2028. Past regulations dark blue solid markers, current green marker, upcoming light blue dashed. Each shows regulation name, date, brief description. Vertical NOW line at 2024. Professional appearance clear labels" \
  -o figures/20_regulatory_timeline.png --doc-type report
```

---

## Chapter 8: Risk Analysis Visuals

### 22. Risk Heatmap

**Tool:** scientific-schematics

**Prompt:**
```
Risk assessment heatmap/matrix:
- X-axis: Impact (Low → Medium → High → Critical)
- Y-axis: Probability (Unlikely → Possible → Likely → Very Likely)

Color gradient for cells:
- Green: Low risk (low probability, low impact)
- Yellow: Medium risk
- Orange: High risk
- Red: Critical risk (high probability, high impact)

Plot 10-12 risks as labeled points/circles in appropriate cells
Risk labels should be clearly readable
Include risk numbers (R1, R2, etc.)
Legend linking numbers to risk names
Professional appearance
```

**Command:**
```bash
python skills/scientific-schematics/scripts/generate_schematic.py \
  "Risk heatmap matrix. X-axis Impact Low Medium High Critical. Y-axis Probability Unlikely Possible Likely Very Likely. Cell colors: Green low risk, Yellow medium, Orange high, Red critical. Plot 10-12 numbered risks R1 R2 etc as labeled points. Legend with risk names. Professional clear" \
  -o figures/21_risk_heatmap.png --doc-type report
```

### 23. Risk Mitigation Framework

**Tool:** scientific-schematics

**Prompt:**
```
Risk mitigation diagram showing risks and their mitigations:
Left column: Risks (in red/orange boxes)
Right column: Mitigation Strategies (in green/blue boxes)

Connect each risk to its mitigation(s) with arrows
Group risks by category (Market, Regulatory, Technology, etc.)
Include both prevention and response strategies

Risk severity indicated by box color intensity
Professional appearance
Clear labels
```

**Command:**
```bash
python skills/scientific-schematics/scripts/generate_schematic.py \
  "Risk mitigation diagram. Left column risks in orange/red boxes. Right column mitigation strategies in green/blue boxes. Arrows connecting risks to mitigations. Group by category. Risk severity by color intensity. Include prevention and response. Professional clear labels" \
  -o figures/22_risk_mitigation.png --doc-type report
```

---

## Chapter 9: Strategic Recommendations Visuals

### 24. Opportunity Matrix

**Tool:** scientific-schematics

**Prompt:**
```
2x2 opportunity assessment matrix:
- X-axis: Market Attractiveness (Low ← → High)
- Y-axis: Ability to Win (Low ← → High)

Quadrant labels and strategies:
- Upper-right: "PURSUE AGGRESSIVELY" (green)
- Upper-left: "BUILD CAPABILITIES" (yellow)
- Lower-right: "SELECTIVE INVESTMENT" (yellow)
- Lower-left: "AVOID/DIVEST" (red)

Plot 6-8 opportunities as labeled circles
Circle size represents opportunity size ($)
Include opportunity names
Professional appearance
```

**Command:**
```bash
python skills/scientific-schematics/scripts/generate_schematic.py \
  "2x2 opportunity matrix. X-axis Market Attractiveness Low to High. Y-axis Ability to Win Low to High. Quadrants: Upper-right PURSUE AGGRESSIVELY green, Upper-left BUILD CAPABILITIES yellow, Lower-right SELECTIVE INVESTMENT yellow, Lower-left AVOID red. Plot 6-8 opportunity circles with labels. Size = opportunity value. Professional" \
  -o figures/23_opportunity_matrix.png --doc-type report
```

### 25. Recommendation Priority Matrix

**Tool:** scientific-schematics

**Prompt:**
```
2x2 priority matrix for recommendations:
- X-axis: Effort/Investment (Low ← → High)
- Y-axis: Impact/Value (Low ← → High)

Quadrant labels:
- Upper-left: "QUICK WINS" (green) - Do First
- Upper-right: "MAJOR PROJECTS" (blue) - Plan Carefully
- Lower-left: "FILL-INS" (gray) - Do If Time
- Lower-right: "THANKLESS TASKS" (red) - Avoid

Plot 6-8 recommendations as labeled points
Number recommendations by priority
Professional appearance
```

**Command:**
```bash
python skills/scientific-schematics/scripts/generate_schematic.py \
  "2x2 priority matrix. X-axis Effort Low to High. Y-axis Impact Low to High. Quadrants: Upper-left QUICK WINS green Do First, Upper-right MAJOR PROJECTS blue Plan Carefully, Lower-left FILL-INS gray Do If Time, Lower-right THANKLESS TASKS red Avoid. Plot 6-8 numbered recommendations. Professional" \
  -o figures/24_recommendation_priority.png --doc-type report
```

---

## Chapter 10: Implementation Roadmap Visuals

### 26. Implementation Timeline/Gantt

**Tool:** scientific-schematics

**Prompt:**
```
Gantt chart style implementation timeline over 24 months:
Four phases shown as horizontal bars:
- Phase 1: Foundation (Months 1-6) - Dark blue
- Phase 2: Build (Months 4-12) - Medium blue
- Phase 3: Scale (Months 10-18) - Teal
- Phase 4: Optimize (Months 16-24) - Light blue

Phases overlap as shown in dates
Key milestones marked as diamonds on timeline
Month markers on X-axis
Phase names on Y-axis
Professional appearance
```

**Command:**
```bash
python skills/scientific-schematics/scripts/generate_schematic.py \
  "Gantt chart implementation 24 months. Phase 1 Foundation months 1-6 dark blue. Phase 2 Build months 4-12 medium blue. Phase 3 Scale months 10-18 teal. Phase 4 Optimize months 16-24 light blue. Overlapping bars. Key milestones as diamonds. Month markers X-axis. Professional" \
  -o figures/25_implementation_timeline.png --doc-type report
```

### 27. Milestone Tracker

**Tool:** scientific-schematics

**Prompt:**
```
Milestone tracker showing 8-10 key milestones on horizontal timeline:
Each milestone shows:
- Date/Month
- Milestone name
- Status indicator:
  - Completed: Green checkmark ✓
  - In Progress: Yellow circle ○
  - Upcoming: Gray circle ○

Group milestones by phase
Connect milestones with timeline line
Include phase labels above timeline
Professional appearance
```

**Command:**
```bash
python skills/scientific-schematics/scripts/generate_schematic.py \
  "Milestone tracker horizontal timeline 8-10 milestones. Each shows date, name, status: Completed green check, In Progress yellow circle, Upcoming gray circle. Group by phase. Phase labels above. Connected timeline line. Professional" \
  -o figures/26_milestone_tracker.png --doc-type report
```

---

## Chapter 11: Investment Thesis Visuals

### 28. Financial Projections Chart

**Tool:** scientific-schematics

**Prompt:**
```
Combined bar and line chart showing 5-year financial projections:
- Bar chart: Revenue by year (primary Y-axis, in $M)
- Line chart: Growth rate overlay (secondary Y-axis, in %)

Three scenarios shown:
- Conservative: Gray bars
- Base Case: Blue bars
- Optimistic: Green bars

X-axis: Year 1 through Year 5
Include data labels on bars
Legend for scenarios and growth line
Title: "Financial Projections (5-Year)"
Professional appearance
```

**Command:**
```bash
python skills/scientific-schematics/scripts/generate_schematic.py \
  "Combined bar and line chart 5-year projections. Bar chart revenue primary Y-axis dollars. Line chart growth rate secondary Y-axis percent. Three scenarios: Conservative gray, Base Case blue, Optimistic green. X-axis Year 1-5. Data labels. Legend. Title Financial Projections 5-Year. Professional" \
  -o figures/27_financial_projections.png --doc-type report
```

### 29. Scenario Analysis Comparison

**Tool:** scientific-schematics

**Prompt:**
```
Grouped bar chart comparing three scenarios across key metrics:
X-axis: Metrics (Revenue Y5, EBITDA Y5, Market Share, ROI)
Y-axis: Value (scale appropriate for each metric)

Three bars per metric:
- Conservative: Gray
- Base Case: Blue
- Optimistic: Green

Data labels on each bar
Legend for scenarios
Title: "Scenario Analysis Comparison"
Professional appearance
Clear metric labels
```

**Command:**
```bash
python skills/scientific-schematics/scripts/generate_schematic.py \
  "Grouped bar chart scenario comparison. X-axis metrics: Revenue Y5, EBITDA Y5, Market Share, ROI. Three bars per metric: Conservative gray, Base Case blue, Optimistic green. Data labels. Legend. Title Scenario Analysis Comparison. Professional clear labels" \
  -o figures/28_scenario_analysis.png --doc-type report
```

---

## Batch Generation Script

For convenience, use the `generate_market_visuals.py` script to batch generate visuals:

```bash
# Generate core 5-6 visuals only (recommended for starting reports)
python skills/market-research-reports/scripts/generate_market_visuals.py \
  --topic "Electric Vehicle Charging Infrastructure" \
  --output-dir figures/

# Generate all 27 visuals (core + extended, for comprehensive coverage)
python skills/market-research-reports/scripts/generate_market_visuals.py \
  --topic "Electric Vehicle Charging Infrastructure" \
  --output-dir figures/ \
  --all

# Skip already generated files
python skills/market-research-reports/scripts/generate_market_visuals.py \
  --topic "Your Market" \
  --output-dir figures/ \
  --skip-existing
```

**Default behavior**: Generates only the 5-6 core priority visuals. Use `--all` flag if you need comprehensive visual coverage for all sections.

---

## Quality Checklist

Before including visuals in the report, verify:

- [ ] All text is readable at intended size
- [ ] Colors are consistent across all visuals
- [ ] Color scheme is colorblind-friendly
- [ ] Data labels are accurate
- [ ] Legends are clear and complete
- [ ] Titles are descriptive
- [ ] Sources are noted where applicable
- [ ] Resolution is 300 DPI or higher
- [ ] File format is PNG
- [ ] Naming convention is followed
