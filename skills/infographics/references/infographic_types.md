# Infographic Types Reference Guide

This reference provides extended templates, examples, and prompt patterns for each infographic type.

---

## 1. Statistical/Data-Driven Infographics

### Purpose
Present quantitative data, statistics, survey results, and numerical comparisons in an engaging visual format.

### Visual Elements
- **Bar charts**: Horizontal or vertical for comparisons
- **Pie/donut charts**: For proportions and percentages
- **Line charts**: For trends over time
- **Large number callouts**: Highlight key statistics
- **Icons**: Represent categories visually
- **Progress bars**: Show percentages or completion

### Layout Patterns
- **Single-stat hero**: One large number with supporting context
- **Multi-stat grid**: 3-6 statistics in a grid layout
- **Chart-centric**: Large visualization with supporting text
- **Comparison bars**: Side-by-side bar comparisons

### Prompt Templates

**Single Statistic Hero:**
```
Statistical infographic featuring one key statistic about [TOPIC]:
Main stat: [LARGE NUMBER] [UNIT/CONTEXT]
Supporting context: [2-3 sentences explaining the significance]
Large bold number in center, supporting text below,
relevant icon or illustration, [COLOR] accent color,
clean minimal design, white background.
```

**Multi-Statistic Grid:**
```
Statistical infographic presenting [TOPIC] data:
Stat 1: [NUMBER] [LABEL] (icon: [ICON])
Stat 2: [NUMBER] [LABEL] (icon: [ICON])
Stat 3: [NUMBER] [LABEL] (icon: [ICON])
Stat 4: [NUMBER] [LABEL] (icon: [ICON])
2x2 grid layout, large bold numbers, small icons above each,
[COLOR SCHEME], modern clean typography, white background.
```

**Chart-Focused:**
```
Statistical infographic with [CHART TYPE] showing [TOPIC]:
Data points: [VALUE 1], [VALUE 2], [VALUE 3], [VALUE 4]
Labels: [LABEL 1], [LABEL 2], [LABEL 3], [LABEL 4]
Large [bar/pie/donut] chart as main element,
title at top, legend below chart, [COLOR SCHEME],
data labels on chart, clean professional design.
```

### Example Prompts

**Healthcare Statistics:**
```bash
python skills/generate-image/scripts/generate_image.py \
  "Statistical infographic about heart disease: \
   Main stat: 17.9 million deaths per year globally. \
   Supporting stats in grid: 1 in 4 deaths caused by heart disease, \
   80% of heart disease is preventable, \
   150 minutes of exercise weekly reduces risk by 30%. \
   Heart icon, red and pink color scheme with gray accents, \
   large bold numbers, clean medical professional design, white background" \
  --output figures/heart_disease_stats.png
```

**Business Metrics:**
```bash
python skills/generate-image/scripts/generate_image.py \
  "Statistical infographic for Q4 business results: \
   Revenue: $2.4M (+15% YoY), Customers: 12,500 (+22%), \
   NPS Score: 78 (+8 points), Retention: 94%. \
   4-stat grid with upward arrow indicators for growth, \
   bar chart showing quarterly trend, \
   navy blue and gold corporate color scheme, \
   professional business design, white background" \
  --output figures/q4_metrics.png
```

---

## 2. Timeline Infographics

### Purpose
Display events, milestones, or developments in chronological order.

### Visual Elements
- **Timeline axis**: Horizontal or vertical line
- **Date markers**: Years, months, or specific dates
- **Event nodes**: Circles, icons, or images at each point
- **Description boxes**: Brief text for each event
- **Connecting elements**: Lines, arrows, or paths

### Layout Patterns
- **Horizontal timeline**: Left-to-right progression
- **Vertical timeline**: Top-to-bottom progression
- **Winding/snake timeline**: S-curve for many events
- **Circular timeline**: For cyclical or repeating events

### Prompt Templates

**Horizontal Timeline:**
```
Horizontal timeline infographic showing [TOPIC] from [START YEAR] to [END YEAR]:
[YEAR 1]: [EVENT 1] - [brief description]
[YEAR 2]: [EVENT 2] - [brief description]
[YEAR 3]: [EVENT 3] - [brief description]
[YEAR 4]: [EVENT 4] - [brief description]
Left-to-right timeline with circular nodes for each event,
connecting line between nodes, icons above each node,
[COLOR] gradient from past to present, date labels below,
clean modern design, white background.
```

**Vertical Timeline:**
```
Vertical timeline infographic showing [TOPIC]:
Top (earliest): [YEAR] - [EVENT]
Middle events: [YEAR] - [EVENT], [YEAR] - [EVENT]
Bottom (latest): [YEAR] - [EVENT]
Top-to-bottom flow, alternating left-right event boxes,
central vertical line connecting all events,
circular nodes with dates, [COLOR SCHEME],
professional clean design, white background.
```

**Project Milestone Timeline:**
```
Project timeline infographic for [PROJECT NAME]:
Phase 1: [DATES] - [MILESTONE] (status: complete)
Phase 2: [DATES] - [MILESTONE] (status: in progress)
Phase 3: [DATES] - [MILESTONE] (status: upcoming)
Phase 4: [DATES] - [MILESTONE] (status: planned)
Gantt-style horizontal bars, color-coded by status,
green for complete, yellow for in progress, gray for upcoming,
project name header, clean professional design.
```

### Example Prompts

**Technology Evolution:**
```bash
python skills/generate-image/scripts/generate_image.py \
  "Horizontal timeline infographic: Evolution of Mobile Phones \
   1983: First mobile phone (Motorola DynaTAC), \
   1992: First smartphone (IBM Simon), \
   2007: iPhone launches touchscreen era, \
   2010: First 4G networks, \
   2019: First 5G phones, \
   2023: Foldable phones mainstream. \
   Phone icons evolving at each node, gradient from gray (old) to blue (new), \
   connecting timeline arrow, year labels, clean tech design" \
  --output figures/mobile_evolution.png
```

**Company History:**
```bash
python skills/generate-image/scripts/generate_image.py \
  "Vertical timeline infographic: Our Company Journey \
   2010: Founded in garage with 2 employees, \
   2012: First major client signed, \
   2015: Reached 100 employees, \
   2018: IPO on NASDAQ, \
   2022: Expanded to 30 countries, \
   2025: 10,000 employees worldwide. \
   Milestone icons for each event, alternating left-right layout, \
   blue and gold corporate colors, growth trajectory feel, \
   professional business design" \
  --output figures/company_history.png
```

---

## 3. Process/How-To Infographics

### Purpose
Explain step-by-step procedures, workflows, instructions, or methodologies.

### Visual Elements
- **Numbered steps**: Clear sequence indicators
- **Arrows/connectors**: Show flow and direction
- **Action icons**: Illustrate each step
- **Brief descriptions**: Concise action text
- **Start/end indicators**: Clear beginning and conclusion

### Layout Patterns
- **Vertical cascade**: Steps flow top-to-bottom
- **Horizontal flow**: Left-to-right progression
- **Circular process**: Steps form a cycle
- **Branching flow**: Decision points with alternatives

### Prompt Templates

**Linear Process:**
```
Process infographic: How to [ACCOMPLISH GOAL]
Step 1: [ACTION] - [brief explanation] (icon: [ICON])
Step 2: [ACTION] - [brief explanation] (icon: [ICON])
Step 3: [ACTION] - [brief explanation] (icon: [ICON])
Step 4: [ACTION] - [brief explanation] (icon: [ICON])
Step 5: [ACTION] - [brief explanation] (icon: [ICON])
Numbered circles connected by arrows, icons for each step,
[VERTICAL/HORIZONTAL] flow, [COLOR SCHEME],
clear step labels, clean instructional design, white background.
```

**Circular Process:**
```
Circular process infographic showing [CYCLE NAME]:
Step 1: [ACTION] leads to
Step 2: [ACTION] leads to
Step 3: [ACTION] leads to
Step 4: [ACTION] returns to Step 1
Circular arrangement with arrows forming a cycle,
icons at each point, step numbers, [COLOR SCHEME],
continuous flow design, white background.
```

**Decision Flowchart:**
```
Decision flowchart infographic for [SCENARIO]:
Start: [INITIAL QUESTION]
If Yes: [PATH A] → [OUTCOME A]
If No: [PATH B] → [OUTCOME B]
Diamond shapes for decisions, rectangles for actions,
arrows connecting all elements, [COLOR SCHEME],
clear yes/no labels, flowchart style, white background.
```

### Example Prompts

**Recipe Process:**
```bash
python skills/generate-image/scripts/generate_image.py \
  "Process infographic: How to Make Perfect Coffee \
   Step 1: Grind fresh beans (coffee grinder icon), \
   Step 2: Heat water to 200°F (thermometer icon), \
   Step 3: Add 2 tablespoons per 6 oz water (measuring spoon icon), \
   Step 4: Brew for 4 minutes (timer icon), \
   Step 5: Serve and enjoy (coffee cup icon). \
   Vertical flow with large numbered circles, \
   brown and cream coffee color scheme, \
   arrows between steps, cozy design feel" \
  --output figures/coffee_process.png
```

**Onboarding Workflow:**
```bash
python skills/generate-image/scripts/generate_image.py \
  "Process infographic: New Employee Onboarding \
   Day 1: Welcome orientation and paperwork (clipboard icon), \
   Week 1: Meet your team and set up workspace (people icon), \
   Week 2: Training and system access (laptop icon), \
   Week 3: Shadow senior colleagues (handshake icon), \
   Week 4: First independent project (checkmark icon). \
   Horizontal timeline flow with milestones, \
   teal and coral corporate colors, \
   professional HR design style" \
  --output figures/onboarding_process.png
```

---

## 4. Comparison Infographics

### Purpose
Compare two or more options, products, concepts, or choices side by side.

### Visual Elements
- **Split layout**: Clear division between options
- **Matching rows**: Same categories for fair comparison
- **Check/cross marks**: Quick visual indicators
- **Rating systems**: Stars, bars, or numbers
- **Headers**: Clear identification of each option

### Layout Patterns
- **Two-column split**: Left vs Right
- **Table format**: Rows and columns
- **Venn diagram**: Overlapping comparisons
- **Feature matrix**: Multi-option comparison grid

### Prompt Templates

**Two-Option Comparison:**
```
Comparison infographic: [OPTION A] vs [OPTION B]
Header: [OPTION A] on left | [OPTION B] on right
Row 1 - [CATEGORY 1]: [A VALUE] | [B VALUE]
Row 2 - [CATEGORY 2]: [A VALUE] | [B VALUE]
Row 3 - [CATEGORY 3]: [A VALUE] | [B VALUE]
Row 4 - [CATEGORY 4]: [A VALUE] | [B VALUE]
Row 5 - [CATEGORY 5]: [A VALUE] | [B VALUE]
Split layout with [COLOR A] for left, [COLOR B] for right,
icons for each option header, checkmarks for advantages,
clean symmetrical design, white background.
```

**Multi-Option Matrix:**
```
Comparison matrix infographic: [TOPIC]
Options: [OPTION 1], [OPTION 2], [OPTION 3]
Feature 1: [✓/✗ for each]
Feature 2: [✓/✗ for each]
Feature 3: [✓/✗ for each]
Feature 4: [✓/✗ for each]
Table layout with colored headers for each option,
checkmarks and X marks in cells, [COLOR SCHEME],
clean grid design, white background.
```

**Pros and Cons:**
```
Pros and Cons infographic for [TOPIC]:
Pros (left side, green):
- [PRO 1]
- [PRO 2]
- [PRO 3]
Cons (right side, red):
- [CON 1]
- [CON 2]
- [CON 3]
Split layout with green left side, red right side,
thumbs up icon for pros, thumbs down for cons,
balanced visual weight, white background.
```

### Example Prompts

**Software Comparison:**
```bash
python skills/generate-image/scripts/generate_image.py \
  "Comparison infographic: Slack vs Microsoft Teams \
   Pricing: Both offer free tiers with paid upgrades, \
   Integration: Slack 2000+ apps, Teams Microsoft ecosystem, \
   Video calls: Teams native, Slack via Huddles, \
   File storage: Teams 1TB, Slack 5GB free, \
   Best for: Slack small teams, Teams enterprise. \
   Purple left side (Slack), blue right side (Teams), \
   logos at top, feature comparison rows, \
   checkmarks for strengths, modern tech design" \
  --output figures/slack_vs_teams.png
```

**Diet Comparison:**
```bash
python skills/generate-image/scripts/generate_image.py \
  "Comparison infographic: Keto Diet vs Mediterranean Diet \
   Weight loss: Both effective, Keto faster initial, \
   Heart health: Mediterranean better long-term, \
   Sustainability: Mediterranean easier to maintain, \
   Foods allowed: Keto high fat low carb, Med balanced, \
   Research support: Mediterranean more studied. \
   Green left (Keto), blue right (Mediterranean), \
   food icons for each, health/heart icons, \
   clean wellness design style" \
  --output figures/diet_comparison.png
```

---

## 5. List/Informational Infographics

### Purpose
Present tips, facts, key points, or information in an organized, scannable format.

### Visual Elements
- **Numbers or bullets**: Clear list indicators
- **Icons**: Visual representation of each point
- **Brief text**: Concise descriptions
- **Header**: Topic introduction
- **Consistent styling**: Uniform treatment of all items

### Layout Patterns
- **Vertical list**: Standard top-to-bottom
- **Two-column list**: For longer lists
- **Icon grid**: Icons with labels below
- **Cards**: Each point in a card/box

### Prompt Templates

**Numbered List:**
```
List infographic: [NUMBER] [TOPIC]
1. [POINT 1] - [brief explanation] (icon: [ICON])
2. [POINT 2] - [brief explanation] (icon: [ICON])
3. [POINT 3] - [brief explanation] (icon: [ICON])
4. [POINT 4] - [brief explanation] (icon: [ICON])
5. [POINT 5] - [brief explanation] (icon: [ICON])
Large numbers in circles, icons next to each point,
brief text descriptions, [COLOR SCHEME],
vertical layout with spacing, white background.
```

**Tips Format:**
```
Tips infographic: [NUMBER] Tips for [TOPIC]
Tip 1: [TIP] (lightbulb icon)
Tip 2: [TIP] (star icon)
Tip 3: [TIP] (checkmark icon)
Tip 4: [TIP] (target icon)
Tip 5: [TIP] (rocket icon)
Colorful tip boxes or cards, icons for each tip,
[COLOR SCHEME], engaging friendly design,
header at top, white background.
```

**Facts Format:**
```
Facts infographic: [NUMBER] Facts About [TOPIC]
Fact 1: [INTERESTING FACT]
Fact 2: [INTERESTING FACT]
Fact 3: [INTERESTING FACT]
Fact 4: [INTERESTING FACT]
Fact 5: [INTERESTING FACT]
Speech bubble or card style for each fact,
relevant icons, [COLOR SCHEME],
educational engaging design, white background.
```

### Example Prompts

**Productivity Tips:**
```bash
python skills/generate-image/scripts/generate_image.py \
  "List infographic: 7 Productivity Tips for Remote Workers \
   1. Create a dedicated workspace (desk icon), \
   2. Set regular working hours (clock icon), \
   3. Take scheduled breaks (coffee icon), \
   4. Use noise-canceling headphones (headphones icon), \
   5. Batch similar tasks together (stack icon), \
   6. Limit social media during work (phone icon), \
   7. End each day with tomorrow's plan (checklist icon). \
   Large colorful numbers, icons beside each tip, \
   teal and orange color scheme, friendly modern design" \
  --output figures/remote_work_tips.png
```

**Fun Facts:**
```bash
python skills/generate-image/scripts/generate_image.py \
  "Facts infographic: 5 Amazing Facts About Honey \
   Fact 1: Honey never spoils - 3000 year old honey is still edible, \
   Fact 2: Bees visit 2 million flowers to make 1 lb of honey, \
   Fact 3: Honey can be used to treat wounds and burns, \
   Fact 4: A bee produces only 1/12 teaspoon in its lifetime, \
   Fact 5: Honey contains natural antibiotics. \
   Hexagon honeycomb shapes for each fact, \
   golden yellow and black color scheme, bee illustrations, \
   fun educational design" \
  --output figures/honey_facts.png
```

---

## 6. Geographic/Map-Based Infographics

### Purpose
Display location-based data, regional statistics, or geographic trends.

### Visual Elements
- **Map visualization**: World, country, or region
- **Color coding**: Data intensity by region
- **Data callouts**: Key statistics for regions
- **Legend**: Color scale explanation
- **Labels**: Region or country names

### Layout Patterns
- **Full map**: Map as primary element
- **Map with sidebar**: Data summary alongside
- **Regional focus**: Zoomed map section
- **Multi-map**: Several maps showing different data

### Prompt Templates

**World Map Data:**
```
Geographic infographic showing [TOPIC] globally:
Highest: [REGION/COUNTRY] - [VALUE]
Medium: [REGIONS] - [VALUE RANGE]
Lowest: [REGION/COUNTRY] - [VALUE]
World map with color-coded countries,
[DARK COLOR] for highest values, [LIGHT COLOR] for lowest,
legend showing color scale, key statistics callout,
clean cartographic design, light gray background.
```

**Country/Region Focus:**
```
Geographic infographic showing [TOPIC] in [COUNTRY/REGION]:
Region 1: [VALUE]
Region 2: [VALUE]
Region 3: [VALUE]
Map of [COUNTRY/REGION] with color-coded areas,
data labels for key regions, [COLOR] gradient,
legend with value scale, clean map design.
```

### Example Prompts

**Global Data:**
```bash
python skills/generate-image/scripts/generate_image.py \
  "Geographic infographic: Global Renewable Energy Adoption 2025 \
   Leaders: Iceland 100%, Norway 98%, Costa Rica 95%, \
   Growing: Germany 50%, UK 45%, China 30%, \
   Emerging: USA 22%, India 20%, Brazil 18%. \
   World map with green gradient coloring, \
   darker green for higher adoption, \
   legend showing percentage scale, \
   key country callouts with percentages, \
   clean modern cartographic style" \
  --output figures/renewable_map.png
```

**US Regional:**
```bash
python skills/generate-image/scripts/generate_image.py \
  "Geographic infographic: Tech Jobs by US Region 2025 \
   West Coast: 35% of tech jobs (California, Washington), \
   Northeast: 25% (New York, Massachusetts), \
   South: 22% (Texas, Florida, Georgia), \
   Midwest: 18% (Illinois, Colorado, Michigan). \
   US map with color-coded regions, \
   percentage labels on each region, \
   blue and purple tech color scheme, \
   legend showing job concentration, \
   professional business design" \
  --output figures/tech_jobs_map.png
```

---

## 7. Hierarchical/Pyramid Infographics

### Purpose
Show levels of importance, organizational structures, or ranked information.

### Visual Elements
- **Pyramid shape**: Triangle with levels
- **Level labels**: Clear tier identification
- **Size progression**: Larger at base, smaller at top
- **Color progression**: Gradient or distinct colors per level
- **Icons**: Optional for each level

### Layout Patterns
- **Traditional pyramid**: Wide base, narrow top
- **Inverted pyramid**: Narrow base, wide top
- **Org chart**: Tree structure
- **Stacked blocks**: Square levels

### Prompt Templates

**Classic Pyramid:**
```
Hierarchical pyramid infographic: [TOPIC]
Top (Level 1 - most important/rare): [ITEM]
Level 2: [ITEM]
Level 3: [ITEM]
Level 4: [ITEM]
Base (Level 5 - foundation/most common): [ITEM]
Triangle pyramid with 5 horizontal sections,
[COLOR] gradient from [TOP COLOR] to [BASE COLOR],
labels on each tier, icons optional,
clean geometric design, white background.
```

**Organizational Hierarchy:**
```
Organizational chart infographic for [ORGANIZATION]:
Top: [CEO/LEADER]
Level 2: [VPs/DIRECTORS] (3-4 boxes)
Level 3: [MANAGERS] (6-8 boxes)
Level 4: [TEAM LEADS] (multiple boxes)
Tree structure flowing down, connecting lines between levels,
[COLOR SCHEME], professional corporate design,
role titles in boxes, white background.
```

### Example Prompts

**Learning Pyramid:**
```bash
python skills/generate-image/scripts/generate_image.py \
  "Hierarchical pyramid infographic: Learning Retention Rates \
   Top: Teaching others - 90% retention, \
   Level 2: Practice by doing - 75% retention, \
   Level 3: Discussion groups - 50% retention, \
   Level 4: Demonstration - 30% retention, \
   Level 5: Audio/Visual - 20% retention, \
   Base: Lecture/Reading - 5-10% retention. \
   Colorful pyramid with 6 levels, \
   gradient from green (top) to red (base), \
   percentage labels, educational design" \
  --output figures/learning_pyramid.png
```

**Energy Pyramid:**
```bash
python skills/generate-image/scripts/generate_image.py \
  "Hierarchical pyramid infographic: Ecological Energy Pyramid \
   Top: Apex predators (eagles, wolves) - smallest, \
   Level 2: Secondary consumers (snakes, foxes), \
   Level 3: Primary consumers (rabbits, deer), \
   Base: Producers (plants, algae) - largest. \
   Triangle pyramid with animal silhouettes, \
   green gradient from base to top, \
   energy flow arrows on side, \
   scientific educational design" \
  --output figures/energy_pyramid.png
```

---

## 8. Anatomical/Visual Metaphor Infographics

### Purpose
Explain complex systems using familiar visual metaphors (bodies, machines, trees, etc.).

### Visual Elements
- **Central metaphor image**: The main visual (body, tree, machine)
- **Labeled parts**: Components identified
- **Callout lines**: Connecting labels to parts
- **Descriptions**: Explanations for each part
- **Color coding**: Different parts in different colors

### Layout Patterns
- **Central image with callouts**: Labels pointing to parts
- **Exploded view**: Parts separated but arranged
- **Cross-section**: Inside view of metaphor
- **Before/after**: Metaphor in different states

### Prompt Templates

**Body Metaphor:**
```
Anatomical infographic using human body to explain [TOPIC]:
Brain represents [CONCEPT] - [explanation]
Heart represents [CONCEPT] - [explanation]
Hands represent [CONCEPT] - [explanation]
Feet represent [CONCEPT] - [explanation]
Human body silhouette with labeled callouts,
[COLOR SCHEME], clean medical illustration style,
connecting lines to descriptions, white background.
```

**Machine Metaphor:**
```
Anatomical infographic using machine/engine to explain [TOPIC]:
Fuel tank represents [CONCEPT]
Engine represents [CONCEPT]
Wheels represent [CONCEPT]
Steering represents [CONCEPT]
Machine illustration with labeled components,
callout lines and descriptions, [COLOR SCHEME],
technical illustration style, white background.
```

### Example Prompts

**Business as Body:**
```bash
python skills/generate-image/scripts/generate_image.py \
  "Anatomical infographic: A Business is Like a Human Body \
   Brain = Leadership and strategy (makes decisions), \
   Heart = Company culture (pumps energy), \
   Arms = Sales and marketing (reaches out), \
   Legs = Operations (keeps moving forward), \
   Skeleton = Systems and processes (provides structure). \
   Human body silhouette in blue, \
   labeled callout boxes for each part, \
   professional corporate design, white background" \
  --output figures/business_body.png
```

**Computer as House:**
```bash
python skills/generate-image/scripts/generate_image.py \
  "Anatomical infographic: Computer as a House \
   CPU = The brain/office (processes information), \
   RAM = The desk (temporary workspace), \
   Hard Drive = The filing cabinet (long-term storage), \
   GPU = The entertainment room (handles visuals), \
   Motherboard = The foundation (connects everything). \
   House illustration with cutaway view, \
   labeled rooms matching computer parts, \
   blue and gray tech colors, educational style" \
  --output figures/computer_house.png
```

---

## 9. Resume/Professional Infographics

### Purpose
Present professional information, skills, experience, and achievements visually.

### Visual Elements
- **Photo/avatar section**: Personal branding
- **Skills visualization**: Bars, charts, ratings
- **Timeline**: Career progression
- **Contact icons**: Email, phone, social
- **Achievement badges**: Certifications, awards

### Layout Patterns
- **Single column**: Vertical flow
- **Two column**: Info left, skills right
- **Header focus**: Large header with photo
- **Modular**: Distinct sections/cards

### Prompt Templates

**Professional Resume:**
```
Resume infographic for [NAME], [PROFESSION]:
Photo area: Circular avatar placeholder
Skills: [SKILL 1] 90%, [SKILL 2] 85%, [SKILL 3] 75%
Experience: [YEAR-YEAR] [ROLE] at [COMPANY], [YEAR-YEAR] [ROLE] at [COMPANY]
Education: [DEGREE] from [INSTITUTION]
Contact: Email, LinkedIn, Portfolio icons
Professional photo area at top, horizontal skill bars,
timeline for experience, [COLOR SCHEME],
modern professional design, white background.
```

### Example Prompts

**Designer Resume:**
```bash
python skills/generate-image/scripts/generate_image.py \
  "Resume infographic for a Graphic Designer: \
   Circular avatar placeholder at top, \
   Skills with colored bars: Adobe Suite 95%, UI/UX 90%, Branding 85%, Motion 75%. \
   Experience timeline: 2018-2020 Junior Designer at Agency X, \
   2020-2023 Senior Designer at Studio Y, 2023-Present Creative Director at Company Z. \
   Education: BFA Graphic Design. \
   Contact icons row at bottom. \
   Coral and teal color scheme, creative modern design" \
  --output figures/designer_resume.png
```

---

## 10. Social Media/Interactive Infographics

### Purpose
Create shareable, engaging content optimized for social media platforms.

### Visual Elements
- **Bold headlines**: Attention-grabbing text
- **Minimal text**: Quick to read
- **Vibrant colors**: Stand out in feeds
- **Central visual**: Eye-catching image or icon
- **Call to action**: Engagement prompt

### Layout Patterns
- **Square format**: Instagram, Facebook
- **Vertical format**: Pinterest, Stories
- **Carousel**: Multi-slide series
- **Quote card**: Impactful statement focus

### Platform Dimensions
- **Instagram Square**: 1080x1080px
- **Instagram Portrait**: 1080x1350px
- **Twitter/X**: 1200x675px
- **LinkedIn**: 1200x627px
- **Pinterest**: 1000x1500px

### Prompt Templates

**Social Quote Card:**
```
Social media infographic: Inspirational quote
Quote: "[QUOTE TEXT]"
Attribution: - [AUTHOR]
Large quotation marks, centered quote text,
author name below, [COLOR SCHEME],
Instagram square format, bold typography,
solid gradient background.
```

**Quick Stats Social:**
```
Social media infographic: [TOPIC] in Numbers
Headline: [ATTENTION-GRABBING HEADLINE]
Stat 1: [BIG NUMBER] [CONTEXT]
Stat 2: [BIG NUMBER] [CONTEXT]
Call to action: [CTA]
Bold numbers, minimal text, [COLOR SCHEME],
vibrant engaging design, social media optimized,
Instagram square format.
```

### Example Prompts

**Inspirational Quote:**
```bash
python skills/generate-image/scripts/generate_image.py \
  "Social media infographic quote card: \
   Quote: 'The best time to plant a tree was 20 years ago. \
   The second best time is now.' \
   Attribution: Chinese Proverb. \
   Large decorative quotation marks, centered text, \
   gradient background from deep green to teal, \
   tree silhouette illustration, Instagram square format, \
   modern inspirational design" \
  --output figures/tree_quote.png
```

**Engagement Stats:**
```bash
python skills/generate-image/scripts/generate_image.py \
  "Social media infographic: Email Marketing Stats \
   Headline: Is Your Email Strategy Working? \
   Stat 1: 4400% ROI on email marketing, \
   Stat 2: 59% of consumers say email influences purchases, \
   Call to action: Double tap if you're an email marketer! \
   Bold colorful numbers, envelope icons, \
   purple and yellow vibrant colors, \
   Instagram square format, engaging design" \
  --output figures/email_stats_social.png
```

---

## Style Variations by Industry

### Corporate/Business Style
- Colors: Navy, gray, gold accents
- Typography: Clean sans-serif (Arial, Helvetica)
- Design: Minimal, professional, structured
- Elements: Charts, icons, clean lines

### Healthcare/Medical Style
- Colors: Blue, teal, green, white
- Typography: Clear, readable
- Design: Trust-inducing, clean, clinical
- Elements: Medical icons, anatomy, research imagery

### Technology/Data Style
- Colors: Dark backgrounds, neon accents, blue/purple
- Typography: Modern sans-serif, monospace for data
- Design: Futuristic, clean, dark mode friendly
- Elements: Circuit patterns, data visualizations, glows

### Education/Academic Style
- Colors: Neutral tones, soft blues, warm accents
- Typography: Readable, slightly traditional
- Design: Organized, clear hierarchy, accessible
- Elements: Books, lightbulbs, graduation icons

### Marketing/Creative Style
- Colors: Bold, vibrant, trendy combinations
- Typography: Mix of display and body fonts
- Design: Eye-catching, dynamic, playful
- Elements: Abstract shapes, gradients, illustrations

---

## Prompt Modifiers Reference

Add these modifiers to any prompt to adjust style:

### Design Style
- "clean minimal design"
- "modern professional design"
- "flat design with bold colors"
- "hand-drawn illustration style"
- "3D isometric style"
- "vintage retro style"
- "corporate business style"
- "playful friendly design"

### Color Instructions
- "[color] and [color] color scheme"
- "monochromatic [color] palette"
- "colorblind-safe palette"
- "warm/cool color tones"
- "high contrast design"
- "muted pastel colors"
- "bold vibrant colors"

### Layout Instructions
- "vertical layout"
- "horizontal layout"
- "centered composition"
- "asymmetrical balance"
- "grid-based layout"
- "flowing organic layout"

### Background Options
- "white background"
- "light gray background"
- "dark background"
- "gradient background from [color] to [color]"
- "subtle pattern background"
- "solid [color] background"

---

Use these templates and examples as starting points, then customize for your specific needs.
