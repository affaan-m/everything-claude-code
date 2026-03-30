---
name: scientific-slides
description: Build slide decks and presentations for research talks. Use this for making PowerPoint slides, conference presentations, seminar talks, research presentations, thesis defense slides, or any scientific talk. Provides slide structure, design templates, timing guidance, and visual validation. Works with PowerPoint and LaTeX Beamer.
allowed-tools: Read Write Edit Bash
license: MIT license
metadata:
    skill-author: K-Dense Inc.
---

# Scientific Slides

## Overview

Scientific presentations are a critical medium for communicating research, sharing findings, and engaging with academic and professional audiences. This skill provides comprehensive guidance for creating effective scientific presentations, from structure and content development to visual design and delivery preparation.

**Key Focus**: Oral presentations for conferences, seminars, defenses, and professional talks.

**CRITICAL DESIGN PHILOSOPHY**: Scientific presentations should be VISUALLY ENGAGING and RESEARCH-BACKED. Avoid dry, text-heavy slides at all costs. Great scientific presentations combine:
- **Compelling visuals**: High-quality figures, images, diagrams (not just bullet points)
- **Research context**: Proper citations from research-lookup establishing credibility
- **Minimal text**: Bullet points as prompts, YOU provide the explanation verbally
- **Professional design**: Modern color schemes, strong visual hierarchy, generous white space
- **Story-driven**: Clear narrative arc, not just data dumps

**Remember**: Boring presentations = forgotten science. Make your slides visually memorable while maintaining scientific rigor through proper citations.

## When to Use This Skill

This skill should be used when:
- Preparing conference presentations (5-20 minutes)
- Developing academic seminars (45-60 minutes)
- Creating thesis or dissertation defense presentations
- Designing grant pitch presentations
- Preparing journal club presentations
- Giving research talks at institutions or companies
- Teaching or tutorial presentations on scientific topics

## Slide Generation with Nano Banana Pro

**This skill uses Nano Banana Pro AI to generate stunning presentation slides automatically.**

There are two workflows depending on output format:

### Default Workflow: PDF Slides (Recommended)

Generate each slide as a complete image using Nano Banana Pro, then combine into a PDF. This produces the most visually stunning results.

**How it works:**
1. **Plan the deck**: Create a detailed plan for each slide (title, key points, visual elements)
2. **Generate slides**: Call Nano Banana Pro for each slide to create complete slide images
3. **Combine to PDF**: Assemble slide images into a single PDF presentation

**Step 1: Plan Each Slide**

Before generating, create a detailed plan for your presentation:

```markdown
# Presentation Plan: Introduction to Machine Learning

## Slide 1: Title Slide
- Title: "Machine Learning: From Theory to Practice"
- Subtitle: "AI Conference 2025"
- Speaker: Dr. Jane Smith, University of XYZ
- Visual: Modern abstract neural network background

## Slide 2: Introduction
- Title: "Why Machine Learning Matters"
- Key points: Industry adoption, breakthrough applications, future potential
- Visual: Icons showing different ML applications (healthcare, finance, robotics)

## Slide 3: Core Concepts
- Title: "The Three Types of Learning"
- Content: Supervised, Unsupervised, Reinforcement
- Visual: Three-part diagram showing each type with examples

... (continue for all slides)
```

**Step 2: Generate Each Slide**

Use the `generate_slide_image.py` script to create each slide.

**CRITICAL: Formatting Consistency Protocol**

To ensure unified formatting across all slides in a presentation:

1. **Define a Formatting Goal** at the start of your presentation and include it in EVERY prompt:
   - Color scheme (e.g., "dark blue background, white text, gold accents")
   - Typography style (e.g., "bold sans-serif titles, clean body text")
   - Visual style (e.g., "minimal, professional, corporate aesthetic")
   - Layout approach (e.g., "generous white space, left-aligned content")

2. **Always attach the previous slide** when generating subsequent slides using `--attach`:
   - This allows Nano Banana Pro to see and match the existing style
   - Creates visual continuity throughout the deck
   - Ensures consistent colors, fonts, and design language

3. **Default author is "K-Dense"** unless another name is specified

4. **Include citations directly in the prompt** for slides that reference research:
   - Add citations in the prompt text so they appear on the generated slide
   - Use format: "Include citation: (Author et al., Year)" or "Show reference: Author et al., Year"
   - For multiple citations, list them all in the prompt
   - Citations should appear in small text at the bottom of the slide or near relevant content

5. **Attach existing figures/data for results slides** (CRITICAL for data-driven presentations):
   - When creating slides about results, ALWAYS check for existing figures in:
     - The working directory (e.g., `figures/`, `results/`, `plots/`, `images/`)
     - User-provided input files or directories
     - Any data visualizations, charts, or graphs relevant to the presentation
   - Use `--attach` to include these figures so Nano Banana Pro can incorporate them:
     - Attach the actual data figure/chart for results slides
     - Attach relevant diagrams for methodology slides
     - Attach logos or institutional images for title slides
   - When attaching data figures, describe what you want in the prompt:
     - "Create a slide presenting the attached results chart with key findings highlighted"
     - "Build a slide around this attached figure, add title and bullet points explaining the data"
     - "Incorporate the attached graph into a results slide with interpretation"
   - **Before generating results slides**: List files in the working directory to find relevant figures
   - Multiple figures can be attached: `--attach fig1.png --attach fig2.png`

**Example with formatting consistency, citations, and figure attachments:**

```bash
# Title slide (first slide - establishes the style)
python scripts/generate_slide_image.py "Title slide for presentation: 'Machine Learning: From Theory to Practice'. Subtitle: 'AI Conference 2025'. Speaker: K-Dense. FORMATTING GOAL: Dark blue background (#1a237e), white text, gold accents (#ffc107), minimal design, sans-serif fonts, generous margins, no decorative elements." -o slides/01_title.png

# Content slide with citations (attach previous slide for consistency)
python scripts/generate_slide_image.py "Presentation slide titled 'Why Machine Learning Matters'. Three key points with simple icons: 1) Industry adoption, 2) Breakthrough applications, 3) Future potential. CITATIONS: Include at bottom in small text: (LeCun et al., 2015; Goodfellow et al., 2016). FORMATTING GOAL: Match attached slide style - dark blue background, white text, gold accents, minimal professional design, no visual clutter." -o slides/02_intro.png --attach slides/01_title.png

# Background slide with multiple citations
python scripts/generate_slide_image.py "Presentation slide titled 'Deep Learning Revolution'. Key milestones: ImageNet breakthrough (2012), transformer architecture (2017), GPT models (2018-present). CITATIONS: Show references at bottom: (Krizhevsky et al., 2012; Vaswani et al., 2017; Brown et al., 2020). FORMATTING GOAL: Match attached slide style exactly - same colors, fonts, minimal design." -o slides/03_background.png --attach slides/02_intro.png

# RESULTS SLIDE - Attach actual data figure from working directory
# First, check what figures exist: ls figures/ or ls results/
python scripts/generate_slide_image.py "Presentation slide titled 'Model Performance Results'. Create a slide presenting the attached accuracy chart. Key findings to highlight: 1) 95% accuracy achieved, 2) Outperforms baseline by 12%, 3) Consistent across test sets. CITATIONS: Include at bottom: (Our results, 2025). FORMATTING GOAL: Match attached slide style exactly." -o slides/04_results.png --attach slides/03_background.png --attach figures/accuracy_chart.png

# RESULTS SLIDE - Multiple figures comparison
python scripts/generate_slide_image.py "Presentation slide titled 'Before vs After Comparison'. Build a side-by-side comparison slide using the two attached figures. Left: baseline results, Right: our improved results. Add brief labels explaining the improvement. FORMATTING GOAL: Match attached slide style exactly." -o slides/05_comparison.png --attach slides/04_results.png --attach figures/baseline.png --attach figures/improved.png

# METHODOLOGY SLIDE - Attach existing diagram
python scripts/generate_slide_image.py "Presentation slide titled 'System Architecture'. Present the attached architecture diagram with brief explanatory bullet points: 1) Input processing, 2) Model inference, 3) Output generation. FORMATTING GOAL: Match attached slide style exactly." -o slides/06_architecture.png --attach slides/05_comparison.png --attach diagrams/system_architecture.png
```

**IMPORTANT: Before creating results slides, always:**
1. List files in working directory: `ls -la figures/` or `ls -la results/`
2. Check user-provided directories for relevant figures
3. Attach ALL relevant figures that should appear on the slide
4. Describe how Nano Banana Pro should incorporate the attached figures

**Prompt Template:**

Include these elements in every prompt (customize as needed):
```
[Slide content description]
CITATIONS: Include at bottom: (Author1 et al., Year; Author2 et al., Year)
FORMATTING GOAL: [Background color], [text color], [accent color], minimal professional design, no decorative elements, consistent with attached slide style.
```

**Step 3: Combine to PDF**

```bash
# Combine all slides into a PDF presentation
python scripts/slides_to_pdf.py slides/*.png -o presentation.pdf
```

### PPT Workflow: PowerPoint with Generated Visuals

When creating PowerPoint presentations, use Nano Banana Pro to generate images and figures for each slide, then add text separately using the PPTX skill.

**How it works:**
1. **Plan the deck**: Create content plan for each slide
2. **Generate visuals**: Use Nano Banana Pro with `--visual-only` flag to create images for slides
3. **Build PPTX**: Use the PPTX skill (html2pptx or template-based) to create slides with generated visuals and separate text

**Step 1: Generate Visuals for Each Slide**

```bash
# Generate a figure for the introduction slide
python scripts/generate_slide_image.py "Professional illustration showing machine learning applications: healthcare diagnosis, financial analysis, autonomous vehicles, and robotics. Modern flat design, colorful icons on white background." -o figures/ml_applications.png --visual-only

# Generate a diagram for the methods slide
python scripts/generate_slide_image.py "Neural network architecture diagram showing input layer, three hidden layers, and output layer. Clean, technical style with node connections. Blue and gray color scheme." -o figures/neural_network.png --visual-only

# Generate a conceptual graphic for results
python scripts/generate_slide_image.py "Before and after comparison showing improvement: left side shows cluttered data, right side shows organized insights. Arrow connecting them. Professional business style." -o figures/results_visual.png --visual-only
```

**Step 2: Build PowerPoint with PPTX Skill**

Use the PPTX skill's html2pptx workflow to create slides that include:
- Generated images from step 1
- Title and body text added separately
- Professional layout and formatting

See `document-skills/pptx/SKILL.md` for complete PPTX creation documentation.

---

## Nano Banana Pro Script Reference

### generate_slide_image.py

Generate presentation slides or visuals using Nano Banana Pro AI.

```bash
# Full slide (default) - generates complete slide as image
python scripts/generate_slide_image.py "slide description" -o output.png

# Visual only - generates just the image/figure for embedding in PPT
python scripts/generate_slide_image.py "visual description" -o output.png --visual-only

# With reference images attached (Nano Banana Pro will see these)
python scripts/generate_slide_image.py "Create a slide explaining this chart" -o slide.png --attach chart.png
python scripts/generate_slide_image.py "Combine these into a comparison slide" -o compare.png --attach before.png --attach after.png
```

**Options:**
- `-o, --output`: Output file path (required)
- `--attach IMAGE`: Attach image file(s) as context for generation (can use multiple times)
- `--visual-only`: Generate just the visual/figure, not a complete slide
- `--iterations`: Max refinement iterations (default: 2)
- `--api-key`: OpenRouter API key (or set OPENROUTER_API_KEY env var)
- `-v, --verbose`: Verbose output

**Attaching Reference Images:**

Use `--attach` when you want Nano Banana Pro to see existing images as context:
- "Create a slide about this data" + attach the data chart
- "Make a title slide with this logo" + attach the logo
- "Combine these figures into one slide" + attach multiple images
- "Explain this diagram in a slide" + attach the diagram

**Environment Setup:**
```bash
export OPENROUTER_API_KEY='your_api_key_here'
# Get key at: https://openrouter.ai/keys
```

### slides_to_pdf.py

Combine multiple slide images into a single PDF.

```bash
# Combine PNG files
python scripts/slides_to_pdf.py slides/*.png -o presentation.pdf

# Combine specific files in order
python scripts/slides_to_pdf.py title.png intro.png methods.png -o talk.pdf

# From directory (sorted by filename)
python scripts/slides_to_pdf.py slides/ -o presentation.pdf
```

**Options:**
- `-o, --output`: Output PDF path (required)
- `--dpi`: PDF resolution (default: 150)
- `-v, --verbose`: Verbose output

**Tip:** Name slides with numbers for correct ordering: `01_title.png`, `02_intro.png`, etc.

---

## Prompt Writing for Slide Generation

### Full Slide Prompts (PDF Workflow)

For complete slides, include:
1. **Slide type**: Title slide, content slide, diagram slide, etc.
2. **Title**: The slide title text
3. **Content**: Key points, bullet items, or descriptions
4. **Visual elements**: What imagery, icons, or graphics to include
5. **Design style**: Color scheme, mood, aesthetic

**Example prompts:**

```
Title slide:
"Title slide for a medical research presentation. Title: 'Advances in Cancer Immunotherapy'. Subtitle: 'Clinical Trial Results 2024'. Professional medical theme with subtle DNA helix in background. Navy blue and white color scheme."

Content slide:
"Presentation slide titled 'Key Findings'. Three bullet points: 1) 40% improvement in response rate, 2) Reduced side effects, 3) Extended survival outcomes. Include relevant medical icons. Clean, professional design with green and white colors."

Diagram slide:
"Presentation slide showing the research methodology. Title: 'Study Design'. Flowchart showing: Patient Screening → Randomization → Treatment Groups (A, B, Control) → Follow-up → Analysis. CONSORT-style flow diagram. Professional academic style."
```

### Visual-Only Prompts (PPT Workflow)

For images to embed in PowerPoint, focus on the visual element only:

```
"Flowchart showing machine learning pipeline: Data Collection → Preprocessing → Model Training → Validation → Deployment. Clean technical style, blue and gray colors."

"Conceptual illustration of cloud computing with servers, data flow, and connected devices. Modern flat design, suitable for business presentation."

"Scientific diagram of cell division process showing mitosis phases. Educational style with labels, colorblind-friendly colors."
```

---

## Visual Enhancement with Scientific Schematics

In addition to slide generation, use the **scientific-schematics** skill for technical diagrams:

**When to use scientific-schematics instead:**
- Complex technical diagrams (circuit diagrams, chemical structures)
- Publication-quality figures for papers (higher quality threshold)
- Diagrams requiring scientific accuracy review

**How to generate schematics:**
```bash
python scripts/generate_schematic.py "your diagram description" -o figures/output.png
```

For detailed guidance on creating schematics, refer to the scientific-schematics skill documentation.

---

## Core Capabilities

### 1. Presentation Structure and Organization

Build presentations with clear narrative flow and appropriate structure for different contexts. For detailed guidance, refer to `references/presentation_structure.md`.

**Universal Story Arc**:
1. **Hook**: Grab attention (30-60 seconds)
2. **Context**: Establish importance (5-10% of talk)
3. **Problem/Gap**: Identify what's unknown (5-10% of talk)
4. **Approach**: Explain your solution (15-25% of talk)
5. **Results**: Present key findings (40-50% of talk)
6. **Implications**: Discuss meaning (15-20% of talk)
7. **Closure**: Memorable conclusion (1-2 minutes)

**Talk-Specific Structures**:
- **Conference talks (15 min)**: Focused on 1-2 key findings, minimal methods
- **Academic seminars (45 min)**: Comprehensive coverage, detailed methods, multiple studies
- **Thesis defenses (60 min)**: Complete dissertation overview, all studies covered
- **Grant pitches (15 min)**: Emphasis on significance, feasibility, and impact
- **Journal clubs (30 min)**: Critical analysis of published work

### 2. Slide Design Principles

Create professional, readable, and accessible slides that enhance understanding. For complete design guidelines, refer to `references/slide_design_principles.md`.

**ANTI-PATTERN: Avoid Dry, Text-Heavy Presentations**

❌ **What Makes Presentations Dry and Forgettable:**
- Walls of text (more than 6 bullets per slide)
- Small fonts (<24pt body text)
- Black text on white background only (no visual interest)
- No images or graphics (bullet points only)
- Generic templates with no customization
- Dense, paragraph-like bullet points
- Missing research context (no citations)
- All slides look the same (repetitive)

✅ **What Makes Presentations Engaging and Memorable:**
- HIGH-QUALITY VISUALS dominate (figures, photos, diagrams, icons)
- Large, clear text as accent (not the main content)
- Modern, purposeful color schemes (not default themes)
- Generous white space (slides breathe)
- Research-backed context (proper citations from research-lookup)
- Variety in slide layouts (not all bullet lists)
- Story-driven flow with visual anchors
- Professional, polished appearance

**Core Design Principles**:

**Visual-First Approach** (CRITICAL):
- Start with visuals (figures, images, diagrams), add text as support
- Every slide should have STRONG visual element (figure, chart, photo, diagram)
- Text explains or complements visuals, not replaces them
- Think: "How can I show this, not just tell it?"
- Target: 60-70% visual content, 30-40% text

**Simplicity with Impact**:
- One main idea per slide
- MINIMAL text (3-4 bullets, 4-6 words each preferred)
- Generous white space (40-50% of slide)
- Clear visual focus
- Bold, confident design choices

**Typography for Engagement**:
- Sans-serif fonts (Arial, Calibri, Helvetica)
- LARGE fonts: 24-28pt for body text (not minimum 18pt)
- 36-44pt for slide titles (make bold)
- High contrast (minimum 4.5:1, prefer 7:1)
- Use size for hierarchy, not just weight

**Color for Impact**:
- MODERN color palettes (not default blue/gray)
- Consider your topic: biotech? vibrant colors. Physics? sleek darks. Health? warm tones.
- Limited palette (3-5 colors total)
- High contrast combinations
- Color-blind safe (avoid red-green combinations)
- Use color purposefully (not decoration)

**Layout for Visual Interest**:
- Vary layouts (not all bullet lists)
- Use two-column layouts (text + figure)
- Full-slide figures for key results
- Asymmetric compositions (more interesting than centered)
- Rule of thirds for focal points
- Consistent but not repetitive

### 3. Data Visualization for Slides

Adapt scientific figures for presentation context. For detailed guidance, refer to `references/data_visualization_slides.md`.

**Key Differences from Journal Figures**:
- Simplify, don't replicate
- Larger fonts (18-24pt minimum)
- Fewer panels (split across slides)
- Direct labeling (not legends)
- Emphasis through color and size
- Progressive disclosure for complex data

**Visualization Best Practices**:
- **Bar charts**: Comparing discrete categories
- **Line graphs**: Trends and trajectories
- **Scatter plots**: Relationships and correlations
- **Heatmaps**: Matrix data and patterns
- **Network diagrams**: Relationships and connections

**Common Mistakes to Avoid**:
- Tiny fonts (<18pt)
- Too many panels on one slide
- Complex legends
- Insufficient contrast
- Cluttered layouts

### 4. Talk-Specific Guidance

Different presentation contexts require different approaches. For comprehensive guidance on each type, refer to `references/talk_types_guide.md`.

**Conference Talks** (10-20 minutes):
- Structure: Brief intro → minimal methods → key results → quick conclusion
- Focus: 1-2 main findings only
- Style: Engaging, fast-paced, memorable
- Goal: Generate interest, network, get invited

**Academic Seminars** (45-60 minutes):
- Structure: Comprehensive coverage with detailed methods
- Focus: Multiple findings, depth of analysis
- Style: Scholarly, interactive, discussion-oriented
- Goal: Demonstrate expertise, get feedback, collaborate

**Thesis Defenses** (45-60 minutes):
- Structure: Complete dissertation overview, all studies
- Focus: Demonstrating mastery and independent thinking
- Style: Formal, comprehensive, prepared for interrogation
- Goal: Pass examination, defend research decisions

**Grant Pitches** (10-20 minutes):
- Structure: Problem → significance → approach → feasibility → impact
- Focus: Innovation, preliminary data, team qualifications
- Style: Persuasive, focused on outcomes and impact
- Goal: Secure funding, demonstrate viability

**Journal Clubs** (20-45 minutes):
- Structure: Context → methods → results → critical analysis
- Focus: Understanding and critiquing published work
- Style: Educational, critical, discussion-facilitating
- Goal: Learn, critique, discuss implications

### 5. Implementation Options

#### Nano Banana Pro PDF (Default - Recommended)

**Best for**: Visually stunning slides, fast creation, non-technical audiences

**This is the default and recommended approach.** Generate each slide as a complete image using AI.

**Workflow**:
1. Plan each slide (title, content, visual elements)
2. Generate each slide with `generate_slide_image.py`
3. Combine into PDF with `slides_to_pdf.py`

```bash
# Generate slides
python scripts/generate_slide_image.py "Title: Introduction..." -o slides/01.png
python scripts/generate_slide_image.py "Title: Methods..." -o slides/02.png

# Combine to PDF
python scripts/slides_to_pdf.py slides/*.png -o presentation.pdf
```

**Advantages**:
- Most visually impressive results
- Fast creation (describe and generate)
- No design skills required
- Consistent, professional appearance
- Perfect for general audiences

**Best for**:
- Conference talks
- Business presentations
- General scientific talks
- Pitch presentations

#### PowerPoint via PPTX Skill

**Best for**: Editable slides, custom designs, template-based workflows

**Reference**: See `document-skills/pptx/SKILL.md` for complete documentation

Use Nano Banana Pro with `--visual-only` to generate images, then build PPTX with text.

**Key Resources**:
- `assets/powerpoint_design_guide.md`: Complete PowerPoint design guide
- PPTX skill's `html2pptx.md`: Programmatic creation workflow
- PPTX skill's scripts: `rearrange.py`, `inventory.py`, `replace.py`, `thumbnail.py`

**Workflow**:
1. Generate visuals with `generate_slide_image.py --visual-only`
2. Design HTML slides (for programmatic) or use templates
3. Create presentation using html2pptx or template editing
4. Add generated images and text content
5. Generate thumbnails for visual validation
6. Iterate based on visual inspection

**Advantages**:
- Editable slides (can modify text later)
- Complex animations and transitions
- Interactive elements
- Company template compatibility

#### LaTeX Beamer

**Best for**: Mathematical content, consistent formatting, version control

**Reference**: See `references/beamer_guide.md` for complete documentation

**Templates Available**:
- `assets/beamer_template_conference.tex`: 15-minute conference talk
- `assets/beamer_template_seminar.tex`: 45-minute academic seminar
- `assets/beamer_template_defense.tex`: Dissertation defense

**Workflow**:
1. Choose appropriate template
2. Customize theme and colors
3. Add content (LaTeX native: equations, code, algorithms)
4. Compile to PDF
5. Convert to images for visual validation

**Advantages**:
- Beautiful mathematics and equations
- Consistent, professional appearance
- Version control friendly (plain text)
- Excellent for algorithms and code
- Reproducible and programmatic

### 6. Visual Review and Iteration

Implement iterative improvement through visual inspection. For complete workflow, refer to `references/visual_review_workflow.md`.

**Visual Validation Workflow**:

**Step 1: Generate PDF** (if not already PDF)
- PowerPoint: Export as PDF
- Beamer: Compile LaTeX source

**Step 2: Convert to Images**
```bash
# Using the pdf_to_images script
python scripts/pdf_to_images.py presentation.pdf review/slide --dpi 150

# Or use pptx skill's thumbnail tool
python ../document-skills/pptx/scripts/thumbnail.py presentation.pptx review/thumb
```

**Step 3: Systematic Inspection**

Check each slide for:
- **Text overflow**: Text cut off at edges
- **Element overlap**: Text overlapping images or other text
- **Font sizes**: Text too small (<18pt)
- **Contrast**: Insufficient contrast between text and background
- **Layout issues**: Misalignment, poor spacing
- **Visual quality**: Pixelated images, poor rendering

**Step 4: Document Issues**

Create issue log:
```
Slide # | Issue Type | Description | Priority
--------|-----------|-------------|----------
3       | Text overflow | Bullet 4 extends beyond box | High
7       | Overlap | Figure overlaps with caption | High
12      | Font size | Axis labels too small | Medium
```

**Step 5: Apply Fixes**

Make corrections to source files:
- PowerPoint: Edit text boxes, resize elements
- Beamer: Adjust LaTeX code, recompile

**Step 6: Re-Validate**

Repeat Steps 1-5 until no critical issues remain.

**Stopping Criteria**:
- No text overflow
- No inappropriate overlaps
- All text readable (≥18pt equivalent)
- Adequate contrast (≥4.5:1)
- Professional appearance

### 7. Timing and Pacing

Ensure presentations fit allocated time. For comprehensive timing guidance, refer to `assets/timing_guidelines.md`.

**The One-Slide-Per-Minute Rule**:
- General guideline: ~1 slide per minute
- Adjust for complex slides (2-3 minutes)
- Adjust for simple slides (15-30 seconds)

**Time Allocation**:
- Introduction: 15-20%
- Methods: 15-20%
- Results: 40-50% (MOST TIME)
- Discussion: 15-20%
- Conclusion: 5%

**Practice Requirements**:
- 5-minute talk: Practice 5-7 times
- 15-minute talk: Practice 3-5 times
- 45-minute talk: Practice 3-4 times
- Defense: Practice 4-6 times

**Timing Checkpoints**:

For 15-minute talk:
- 3-4 minutes: Finishing introduction
- 7-8 minutes: Halfway through results
- 12-13 minutes: Starting conclusions

**Emergency Strategies**:
- Running behind: Skip backup slides (prepare in advance)
- Running ahead: Expand examples, slow slightly
- Never skip conclusions

### 8. Validation and Quality Assurance

**Automated Validation**:
```bash
# Validate slide count, timing, file size
python scripts/validate_presentation.py presentation.pdf --duration 15

# Generates report on:
# - Slide count vs. recommended range
# - File size warnings
# - Slide dimensions
# - Font size issues (PowerPoint)
# - Compilation success (Beamer)
```

**Manual Validation Checklist**:
- [ ] Slide count appropriate for duration
- [ ] Title slide complete (name, affiliation, date)
- [ ] Clear narrative flow
- [ ] One main idea per slide
- [ ] Font sizes ≥18pt (preferably 24pt+)
- [ ] High contrast colors
- [ ] Figures large and readable
- [ ] No text overflow or element overlap
- [ ] Consistent design throughout
- [ ] Slide numbers present
- [ ] Contact info on final slide
- [ ] Backup slides prepared
- [ ] Tested on projector (if possible)

## Workflow for Presentation Development

### Stage 1: Planning (Before Creating Slides)

**Define Context**:
1. What type of talk? (Conference, seminar, defense, etc.)
2. How long? (Duration in minutes)
3. Who is the audience? (Specialists, general, mixed)
4. What's the venue? (Room size, A/V setup, virtual/in-person)
5. What happens after? (Q&A, discussion, networking)

**Research and Literature Review** (Use research-lookup skill):
1. **Search for background literature**: Find 5-10 key papers establishing context
2. **Identify knowledge gaps**: Use research-lookup to find what's unknown
3. **Locate comparison studies**: Find papers with similar methods or results
4. **Gather supporting citations**: Collect papers supporting your interpretations
5. **Build reference list**: Create .bib file or citation list for slides
6. **Note key findings to cite**: Document specific results to reference

**Develop Content Outline**:
1. Identify 1-3 core messages
2. Select key findings to present
3. Choose essential figures (typically 3-6 for 15-min talk)
4. Plan narrative arc with proper citations
5. Allocate time by section

**Example Outline for 15-Minute Talk**:
```
1. Title (30 sec)
2. Hook: Compelling problem (60 sec) [Cite 1-2 papers via research-lookup]
3. Background (90 sec) [Cite 3-4 key papers establishing context]
4. Research question (45 sec) [Cite papers showing gap]
5. Methods overview (2 min)
6-8. Main result 1 (3 min, 3 slides)
9-10. Main result 2 (2 min, 2 slides)
11-12. Result 3 or validation (2 min, 2 slides)
13-14. Discussion and implications (2 min) [Compare to 2-3 prior studies]
15. Conclusions (45 sec)
16. Acknowledgments (15 sec)

NOTE: Use research-lookup to find papers for background (slides 2-4) 
and discussion (slides 13-14) BEFORE creating slides.
```

### Stage 2: Design and Creation

**Choose Implementation Method**:

**Option A: PowerPoint (via PPTX skill)**
1. Read `assets/powerpoint_design_guide.md`
2. Read `document-skills/pptx/SKILL.md`
3. Choose approach (programmatic or template-based)
4. Create master slides with consistent design
5. Build presentation following outline

**Option B: LaTeX Beamer**
1. Read `references/beamer_guide.md`
2. Select appropriate template from `assets/`
3. Customize theme and colors
4. Write content in LaTeX
5. Compile to PDF

**Design Considerations** (Make It Visually Appealing):
- **Select MODERN color palette**: Match your topic (biotech=vibrant, physics=sleek, health=warm)
  - Use pptx skill's color palette examples (Teal & Coral, Bold Red, Deep Purple & Emerald, etc.)
  - NOT just default blue/gray themes
  - 3-5 colors with high contrast
- **Choose clean fonts**: Sans-serif, large sizes (24pt+ body)
- **Plan visual elements**: What images, diagrams, icons for each slide?
- **Create varied layouts**: Mix full-figure, two-column, text-overlay (not all bullets)
- **Design section dividers**: Visual breaks with striking graphics
- **Plan animations/builds**: Control information flow for complex slides
- **Add visual interest**: Background images, color blocks, shapes, icons

### Stage 3: Content Development

**Populate Slides** (Visual-First Strategy):
1. **Start with visuals**: Plan which figures, images, diagrams for each key point
2. **Use research-lookup extensively**: Find 8-15 papers for proper citations
3. **Create visual backbone first**: Add all figures, charts, images, diagrams
4. **Add minimal text as support**: Bullet points complement visuals, don't replace them
5. **Design section dividers**: Visual breaks with images or graphics (not just text)
6. **Polish title/closing**: Make visually striking, include contact info
7. **Add transitions/builds**: Control information flow

**VISUAL CONTENT REQUIREMENTS** (Make Slides Engaging):
- **Images**: Use high-quality photos, illustrations, conceptual graphics
- **Icons**: Visual representations of concepts (not decoration)
- **Diagrams**: Flowcharts, schematics, process diagrams
- **Figures**: Simplified research figures with LARGE labels (18-24pt)
- **Charts**: Clean data visualizations with clear messages
- **Graphics**: Visual metaphors, conceptual illustrations
- **Color blocks**: Use colored shapes to organize content visually
- Target: MINIMUM 1-2 strong visual elements per slide

**Scientific Content** (Research-Backed):
- **Citations**: Use research-lookup EXTENSIVELY to find relevant papers
  - Introduction: Cite 3-5 papers establishing context and gap
  - Background: Show key prior work visually (not just cite)
  - Discussion: Cite 3-5 papers for comparison with your results
  - Use author-year format (Smith et al., 2023) for readability
  - Citations establish credibility and scientific rigor
- **Figures**: Simplified from papers, LARGE labels (18-24pt minimum)
- **Equations**: Large, clear, explain each term (use sparingly)
- **Tables**: Minimal, highlight key comparisons (not data dumps)
- **Code/Algorithms**: Use syntax highlighting, keep brief

**Text Guidelines** (Less is More):
- Bullet points, NEVER paragraphs
- 3-4 bullets per slide (max 6 only if essential)
- 4-6 words per bullet (shorter than 6×6 rule)
- Key terms in bold
- Text is SUPPORTING ROLE, visuals are stars
- Use builds to control pacing

### Stage 4: Visual Validation

**Generate Images**:
```bash
# Convert PDF to images
python scripts/pdf_to_images.py presentation.pdf review/slides

# Or create thumbnail grid
python ../document-skills/pptx/scripts/thumbnail.py presentation.pptx review/grid
```

**Systematic Review**:
1. View each slide image
2. Check against issue checklist
3. Document problems with slide numbers
4. Test readability from distance (view at 50% size)

**Common Issues to Fix**:
- Text extending beyond boundaries
- Figures overlapping with text
- Font sizes too small
- Poor contrast
- Misalignment

**Iteration**:
1. Fix identified issues in source
2. Regenerate PDF/presentation
3. Convert to images again
4. Re-inspect
5. Repeat until clean

### Stage 5: Practice and Refinement

**Practice Schedule**:
- Run 1: Rough draft (will run long)
- Run 2: Smooth transitions
- Run 3: Exact timing
- Run 4: Final polish
- Run 5+: Maintenance (day before, morning of)

**What to Practice**:
- Full talk with timer
- Difficult explanations
- Transitions between sections
- Opening and closing (until flawless)
- Anticipated questions

**Refinement Based on Practice**:
- Cut slides if running over
- Expand explanations if unclear
- Adjust wording for clarity
- Mark timing checkpoints
- Prepare backup slides

### Stage 6: Final Preparation

**Technical Checks**:
- [ ] Multiple copies saved (laptop, cloud, USB)
- [ ] Works on presentation computer
- [ ] Adapters/cables available
- [ ] Backup PDF version
- [ ] Tested with projector (if possible)

**Content Final**:
- [ ] No typos or errors
- [ ] All figures high quality
- [ ] Slide numbers correct
- [ ] Contact info on final slide
- [ ] Backup slides ready

**Delivery Prep**:
- [ ] Notes prepared (if using)
- [ ] Timer/phone ready
- [ ] Water available
- [ ] Business cards/handouts
- [ ] Comfortable with material (3+ practices)

## Integration with Other Skills

**Research Lookup** (Critical for Scientific Presentations):
- **Background development**: Search literature to build introduction context
- **Citation gathering**: Find key papers to cite in your talk
- **Gap identification**: Identify what's unknown to motivate research
- **Prior work comparison**: Find papers to compare your results against
- **Supporting evidence**: Locate literature supporting your interpretations
- **Question preparation**: Find papers that might inform Q&A responses
- **Always use research-lookup** when developing any scientific presentation to ensure proper context and citations

**Scientific Writing**:
- Convert paper content to presentation format
- Extract key findings and simplify
- Use same figures (but redesigned for slides)
- Maintain consistent terminology

**PPTX Skill**:
- Use for PowerPoint creation and editing
- Leverage scripts for template workflows
- Use thumbnail generation for validation
- Reference html2pptx for programmatic creation

**Data Visualization**:
- Create presentation-appropriate figures
- Simplify complex visualizations
- Ensure readability from distance
- Use progressive disclosure

## Common Pitfalls to Avoid

### Content Mistakes

**Dry, Boring Presentations** (CRITICAL TO AVOID):
- Problem: Text-heavy slides with no visual interest, missing research context
- Signs: All bullet points, no images, default templates, no citations
- Solution: 
  - Use research-lookup to find 8-15 papers for credible context
  - Add high-quality visuals to EVERY slide (figures, photos, diagrams, icons)
  - Choose modern color palette reflecting your topic
  - Vary slide layouts (not all bullet lists)
  - Tell a story with visuals, use text sparingly

**Too Much Content**:
- Problem: Trying to include everything from paper
- Solution: Focus on 1-2 key findings for short talks, show visually

**Too Much Text**:
- Problem: Full paragraphs on slides, dense bullet points, reading verbatim
- Solution: 3-4 bullets with 4-6 words each, let visuals carry the message

**Missing Research Context**:
- Problem: No citations, claims without support, unclear positioning
- Solution: Use research-lookup to find papers, cite 3-5 in intro, 3-5 in discussion

**Poor Narrative**:
- Problem: Jumping between topics, no clear story, no flow
- Solution: Follow story arc, use visual transitions, maintain thread

**Rushing Through Results**:
- Problem: Brief methods, brief results, long discussion
- Solution: Spend 40-50% of time on results, show data visually

### Design Mistakes

**Generic, Default Appearance**:
- Problem: Using default PowerPoint/Beamer themes without customization, looks dated
- Solution: Choose modern color palette, customize fonts/layouts, add visual personality

**Text-Heavy, Visual-Poor**:
- Problem: All bullet point slides, no images or graphics, boring to look at
- Solution: Add figures, photos, diagrams, icons to EVERY slide, make visually interesting

**Small Fonts**:
- Problem: Body text <18pt, unreadable from back, looks unprofessional
- Solution: 24-28pt for body (not just 18pt minimum), 36-44pt for titles

**Low Contrast**:
- Problem: Light text on light background, poor visibility, hard to read
- Solution: High contrast (7:1 preferred, not just 4.5:1 minimum), test with contrast checker

**Cluttered Slides**:
- Problem: Too many elements, no white space, overwhelming
- Solution: One idea per slide, 40-50% white space, generous spacing

**Inconsistent Formatting**:
- Problem: Different fonts, colors, layouts slide-to-slide, looks amateurish
- Solution: Use master slides, maintain design system, professional consistency

**Missing Visual Hierarchy**:
- Problem: Everything same size and color, no emphasis, unclear focus
- Solution: Size differences (titles large, body medium), color for emphasis, clear focal point

### Timing Mistakes

**Not Practicing**:
- Problem: First time through is during presentation
- Solution: Practice minimum 3 times with timer

**No Time Checkpoints**:
- Problem: Don't realize running behind until too late
- Solution: Set 3-4 checkpoints, monitor throughout

**Going Over Time**:
- Problem: Extremely unprofessional, cuts into Q&A
- Solution: Practice to exact time, prepare Plan B (slides to skip)

**Skipping Conclusions**:
- Problem: Running out of time, rush through or skip ending
- Solution: Never skip conclusions, cut earlier content instead

## Tools and Scripts

### Nano Banana Pro Scripts

**generate_slide_image.py** - Generate slides or visuals with AI:
```bash
# Full slide (for PDF workflow)
python scripts/generate_slide_image.py "Title: Introduction\nContent: Key points" -o slide.png

# Visual only (for PPT workflow)
python scripts/generate_slide_image.py "Diagram description" -o figure.png --visual-only

# Options:
# -o, --output       Output file path (required)
# --visual-only      Generate just the visual, not complete slide
# --iterations N     Max refinement iterations (default: 2)
# -v, --verbose      Verbose output
```

**slides_to_pdf.py** - Combine slide images into PDF:
```bash
# From glob pattern
python scripts/slides_to_pdf.py slides/*.png -o presentation.pdf

# From directory (sorted by filename)
python scripts/slides_to_pdf.py slides/ -o presentation.pdf

# Options:
# -o, --output    Output PDF path (required)
# --dpi N         PDF resolution (default: 150)
# -v, --verbose   Verbose output
```

### Validation Scripts

**validate_presentation.py**:
```bash
python scripts/validate_presentation.py presentation.pdf --duration 15

# Checks:
# - Slide count vs. recommended range
# - File size warnings
# - Slide dimensions
# - Font sizes (PowerPoint)
# - Compilation (Beamer)
```

**pdf_to_images.py**:
```bash
python scripts/pdf_to_images.py presentation.pdf output/slide --dpi 150

# Converts PDF to images for visual inspection
# Supports: JPG, PNG
# Adjustable DPI
# Page range selection
```

### PPTX Skill Scripts

From `document-skills/pptx/scripts/`:
- `thumbnail.py`: Create thumbnail grids
- `rearrange.py`: Duplicate and reorder slides
- `inventory.py`: Extract text content
- `replace.py`: Update text programmatically

### External Tools

**Recommended**:
- PDF viewer: For reviewing presentations
- Color contrast checker: WebAIM Contrast Checker
- Color blindness simulator: Coblis
- Timer app: For practice sessions
- Screen recorder: For self-review

## Reference Files

Comprehensive guides for specific aspects:

- **`references/presentation_structure.md`**: Detailed structure for all talk types, timing allocation, opening/closing strategies, transition techniques
- **`references/slide_design_principles.md`**: Typography, color theory, layout, accessibility, visual hierarchy, design workflow
- **`references/data_visualization_slides.md`**: Simplifying figures, chart types, progressive disclosure, common mistakes, recreation workflow
- **`references/talk_types_guide.md`**: Specific guidance for conferences, seminars, defenses, grants, journal clubs, with examples
- **`references/beamer_guide.md`**: Complete LaTeX Beamer documentation, themes, customization, advanced features, compilation
- **`references/visual_review_workflow.md`**: PDF to images conversion, systematic inspection, issue documentation, iterative improvement

## Assets

### Templates

- **`assets/beamer_template_conference.tex`**: 15-minute conference talk template
- **`assets/beamer_template_seminar.tex`**: 45-minute academic seminar template
- **`assets/beamer_template_defense.tex`**: Dissertation defense template

### Guides

- **`assets/powerpoint_design_guide.md`**: Complete PowerPoint design and implementation guide
- **`assets/timing_guidelines.md`**: Comprehensive timing, pacing, and practice strategies

## Quick Start Guide

### For a 15-Minute Conference Talk (PDF Workflow - Recommended)

1. **Research & Plan** (45 minutes):
   - **Use research-lookup** to find 8-12 relevant papers for citations
   - Build reference list (background, comparison studies)
   - Outline content (intro → methods → 2-3 key results → conclusion)
   - **Create detailed plan for each slide** (title, key points, visual elements)
   - Target 15-18 slides

2. **Generate Slides with Nano Banana Pro** (1-2 hours):
   
   **Important: Use consistent formatting, attach previous slides, and include citations!**
   
   ```bash
   # Title slide (establishes style - default author: K-Dense)
   python scripts/generate_slide_image.py "Title slide: 'Your Research Title'. Conference name, K-Dense. FORMATTING GOAL: [your color scheme], minimal professional design, no decorative elements, clean and corporate." -o slides/01_title.png
   
   # Introduction slide with citations (attach previous for consistency)
   python scripts/generate_slide_image.py "Slide titled 'Why This Matters'. Three key points with simple icons. CITATIONS: Include at bottom: (Smith et al., 2023; Jones et al., 2024). FORMATTING GOAL: Match attached slide style exactly." -o slides/02_intro.png --attach slides/01_title.png
   
   # Continue for each slide (always attach previous, include citations where relevant)
   python scripts/generate_slide_image.py "Slide titled 'Methods'. Key methodology points. CITATIONS: (Based on Chen et al., 2022). FORMATTING GOAL: Match attached slide style exactly." -o slides/03_methods.png --attach slides/02_intro.png
   
   # Combine to PDF
   python scripts/slides_to_pdf.py slides/*.png -o presentation.pdf
   ```

3. **Review & Iterate** (30 minutes):
   - Open the PDF and review each slide
   - Regenerate any slides that need improvement
   - Re-combine to PDF

4. **Practice** (2-3 hours):
   - Practice 3-5 times with timer
   - Aim for 13-14 minutes (leave buffer)
   - Record yourself, watch playback
   - **Prepare for questions** (use research-lookup to anticipate)

5. **Finalize** (30 minutes):
   - Generate backup/appendix slides if needed
   - Save multiple copies
   - Test on presentation computer

Total time: ~5-6 hours for quality AI-generated presentation

### Alternative: PowerPoint Workflow

If you need editable slides (e.g., for company templates):

1. **Plan slides** as above
2. **Generate visuals** with `--visual-only` flag:
   ```bash
   python scripts/generate_slide_image.py "diagram description" -o figures/fig1.png --visual-only
   ```
3. **Build PPTX** using the PPTX skill with generated images
4. **Add text** separately using PPTX workflow

See `document-skills/pptx/SKILL.md` for complete PowerPoint workflow.

## Summary: Key Principles

1. **Visual-First Design**: Every slide needs strong visual element (figure, image, diagram) - avoid text-only slides
2. **Research-Backed**: Use research-lookup to find 8-15 papers, cite 3-5 in intro, 3-5 in discussion
3. **Modern Aesthetics**: Choose contemporary color palette matching topic, not default themes
4. **Minimal Text**: 3-4 bullets, 4-6 words each (24-28pt font), let visuals tell story
5. **Structure**: Follow story arc, spend 40-50% on results
6. **High Contrast**: 7:1 preferred for professional appearance
7. **Varied Layouts**: Mix full-figure, two-column, visual overlays (not all bullets)
8. **Timing**: Practice 3-5 times, ~1 slide per minute, never skip conclusions
9. **Validation**: Visual review workflow to catch overflow and overlap
10. **White Space**: 40-50% of slide empty for visual breathing room

**Remember**: 
- **Boring = Forgotten**: Dry, text-heavy slides fail to communicate your science
- **Visual + Research = Impact**: Combine compelling visuals with research-backed context
- **You are the presentation, slides are visual support**: They should enhance, not replace your talk

