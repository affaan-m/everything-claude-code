---
name: pptx-posters
description: Create research posters using HTML/CSS that can be exported to PDF or PPTX. Use this skill ONLY when the user explicitly requests PowerPoint/PPTX poster format. For standard research posters, use latex-posters instead. This skill provides modern web-based poster design with responsive layouts and easy visual integration.
allowed-tools: Read Write Edit Bash
license: MIT license
metadata:
    skill-author: K-Dense Inc.
---

# PPTX Research Posters (HTML-Based)

## Overview

**⚠️ USE THIS SKILL ONLY WHEN USER EXPLICITLY REQUESTS PPTX/POWERPOINT POSTER FORMAT.**

For standard research posters, use the **latex-posters** skill instead, which provides better typographic control and is the default for academic conferences.

This skill creates research posters using HTML/CSS, which can then be exported to PDF or converted to PowerPoint format. The web-based approach offers:
- Modern, responsive layouts
- Easy integration of AI-generated visuals
- Quick iteration and preview in browser
- Export to PDF via browser print function
- Conversion to PPTX if specifically needed

## When to Use This Skill

**ONLY use this skill when:**
- User explicitly requests "PPTX poster", "PowerPoint poster", or "PPT poster"
- User specifically asks for HTML-based poster
- User needs to edit poster in PowerPoint after creation
- LaTeX is not available or user requests non-LaTeX solution

**DO NOT use this skill when:**
- User asks for a "poster" without specifying format → Use latex-posters
- User asks for "research poster" or "conference poster" → Use latex-posters
- User mentions LaTeX, tikzposter, beamerposter, or baposter → Use latex-posters

## AI-Powered Visual Element Generation

**STANDARD WORKFLOW: Generate ALL major visual elements using AI before creating the HTML poster.**

This is the recommended approach for creating visually compelling posters:
1. Plan all visual elements needed (hero image, intro, methods, results, conclusions)
2. Generate each element using scientific-schematics or Nano Banana Pro
3. Assemble generated images in the HTML template
4. Add text content around the visuals

**Target: 60-70% of poster area should be AI-generated visuals, 30-40% text.**

---

### CRITICAL: Poster-Size Font Requirements

**⚠️ ALL text within AI-generated visualizations MUST be poster-readable.**

When generating graphics for posters, you MUST include font size specifications in EVERY prompt. Poster graphics are viewed from 4-6 feet away, so text must be LARGE.

**MANDATORY prompt requirements for EVERY poster graphic:**

```
POSTER FORMAT REQUIREMENTS (STRICTLY ENFORCE):
- ABSOLUTE MAXIMUM 3-4 elements per graphic (3 is ideal)
- ABSOLUTE MAXIMUM 10 words total in the entire graphic
- NO complex workflows with 5+ steps (split into 2-3 simple graphics instead)
- NO multi-level nested diagrams (flatten to single level)
- NO case studies with multiple sub-sections (one key point per case)
- ALL text GIANT BOLD (80pt+ for labels, 120pt+ for key numbers)
- High contrast ONLY (dark on white OR white on dark, NO gradients with text)
- MANDATORY 50% white space minimum (half the graphic should be empty)
- Thick lines only (5px+ minimum), large icons (200px+ minimum)
- ONE SINGLE MESSAGE per graphic (not 3 related messages)
```

**⚠️ BEFORE GENERATING: Review your prompt and count elements**
- If your description has 5+ items → STOP. Split into multiple graphics
- If your workflow has 5+ stages → STOP. Show only 3-4 high-level steps
- If your comparison has 4+ methods → STOP. Show only top 3 or Our vs Best Baseline

**Example - WRONG (7-stage workflow):**
```bash
# ❌ Creates tiny unreadable text
python scripts/generate_schematic.py "Drug discovery workflow: Stage 1 Target ID, Stage 2 Synthesis, Stage 3 Screening, Stage 4 Lead Opt, Stage 5 Validation, Stage 6 Clinical Trial, Stage 7 FDA Approval with metrics." -o figures/workflow.png
```

**Example - CORRECT (3 mega-stages):**
```bash
# ✅ Same content, simplified to readable poster format
python scripts/generate_schematic.py "POSTER FORMAT for A0. ULTRA-SIMPLE 3-box workflow: 'DISCOVER' → 'VALIDATE' → 'APPROVE'. Each word in GIANT bold (120pt+). Thick arrows (10px). 60% white space. ONLY these 3 words. NO substeps. Readable from 12 feet." -o figures/workflow_simple.png
```

---

### CRITICAL: Preventing Content Overflow

**⚠️ POSTERS MUST NOT HAVE TEXT OR CONTENT CUT OFF AT EDGES.**

**Prevention Rules:**

**1. Limit Content Sections (MAXIMUM 5-6 sections):**
```
✅ GOOD - 5 sections with room to breathe:
   - Title/Header
   - Introduction/Problem
   - Methods
   - Results (1-2 key findings)
   - Conclusions

❌ BAD - 8+ sections crammed together
```

**2. Word Count Limits:**
- **Per section**: 50-100 words maximum
- **Total poster**: 300-800 words MAXIMUM
- **If you have more content**: Cut it or make a handout

---

## Core Capabilities

### 1. HTML/CSS Poster Design

The HTML template (`assets/poster_html_template.html`) provides:
- Fixed poster dimensions (36×48 inches = 2592×3456 pt)
- Professional header with gradient styling
- Three-column content layout
- Block-based sections with modern styling
- Footer with references and contact info

### 2. Poster Structure

**Standard Layout:**
```
┌─────────────────────────────────────────┐
│  HEADER: Title, Authors, Hero Image     │
├─────────────┬─────────────┬─────────────┤
│ Introduction│   Results   │  Discussion │
│             │             │             │
│   Methods   │   (charts)  │ Conclusions │
│             │             │             │
│  (diagram)  │   (data)    │   (summary) │
├─────────────┴─────────────┴─────────────┤
│  FOOTER: References & Contact Info      │
└─────────────────────────────────────────┘
```

### 3. Visual Integration

Each section should prominently feature AI-generated visuals:

**Hero Image (Header):**
```html
<img src="figures/hero.png" class="hero-image">
```

**Section Graphics:**
```html
<div class="block">
  <h2 class="block-title">Methods</h2>
  <div class="block-content">
    <img src="figures/workflow.png" class="block-image">
    <ul>
      <li>Brief methodology point</li>
    </ul>
  </div>
</div>
```

### 4. Generating Visual Elements

**Before creating the HTML, generate all visual elements:**

```bash
# Create figures directory
mkdir -p figures

# Hero image - SIMPLE, impactful
python scripts/generate_schematic.py "POSTER FORMAT for A0. Hero banner: '[TOPIC]' in HUGE text (120pt+). Dark blue gradient background. ONE iconic visual. Minimal text. Readable from 15 feet." -o figures/hero.png

# Introduction visual - ONLY 3 elements
python scripts/generate_schematic.py "POSTER FORMAT for A0. SIMPLE visual with ONLY 3 icons: [icon1] → [icon2] → [icon3]. ONE word labels (80pt+). 50% white space. Readable from 8 feet." -o figures/intro.png

# Methods flowchart - ONLY 4 steps
python scripts/generate_schematic.py "POSTER FORMAT for A0. SIMPLE flowchart with ONLY 4 boxes: STEP1 → STEP2 → STEP3 → STEP4. GIANT labels (100pt+). Thick arrows. 50% white space. NO sub-steps." -o figures/workflow.png

# Results visualization - ONLY 3 bars
python scripts/generate_schematic.py "POSTER FORMAT for A0. SIMPLE bar chart with ONLY 3 bars: BASELINE (70%), EXISTING (85%), OURS (95%). GIANT percentages ON bars (120pt+). NO axis, NO legend. 50% white space." -o figures/results.png

# Conclusions - EXACTLY 3 key findings
python scripts/generate_schematic.py "POSTER FORMAT for A0. EXACTLY 3 cards: '95%' (150pt) 'ACCURACY' (60pt), '2X' (150pt) 'FASTER' (60pt), checkmark 'READY' (60pt). 50% white space. NO other text." -o figures/conclusions.png
```

---

## Workflow for PPTX Poster Creation

### Stage 1: Planning

1. **Confirm PPTX is explicitly requested**
2. **Determine poster requirements:**
   - Size: 36×48 inches (most common) or A0
   - Orientation: Portrait (most common)
3. **Develop content outline:**
   - Identify 1-3 core messages
   - Plan 3-5 visual elements
   - Draft minimal text (300-800 words total)

### Stage 2: Generate Visual Elements (AI-Powered)

**CRITICAL: Generate SIMPLE figures with MINIMAL content.**

```bash
mkdir -p figures

# Generate each element with POSTER FORMAT specifications
# (See examples in Section 4 above)
```

### Stage 3: Create HTML Poster

1. **Copy the template:**
   ```bash
   cp skills/pptx-posters/assets/poster_html_template.html poster.html
   ```

2. **Update content:**
   - Replace placeholder title and authors
   - Insert AI-generated images
   - Add minimal supporting text
   - Update references and contact info

3. **Preview in browser:**
   ```bash
   open poster.html  # macOS
   # or
   xdg-open poster.html  # Linux
   ```

### Stage 4: Export to PDF

**Browser Print Method:**
1. Open poster.html in Chrome or Firefox
2. Print (Cmd/Ctrl + P)
3. Select "Save as PDF"
4. Set paper size to match poster dimensions
5. Remove margins
6. Enable "Background graphics"

**Command Line (if Chrome available):**
```bash
# Chrome headless PDF export
google-chrome --headless --print-to-pdf=poster.pdf \
  --print-to-pdf-no-header \
  --no-margins \
  poster.html
```

### Stage 5: Convert to PPTX (If Required)

**Option 1: PDF to PPTX conversion**
```bash
# Using LibreOffice
libreoffice --headless --convert-to pptx poster.pdf

# Or use online converters for simple cases
```

**Option 2: Direct PPTX creation with python-pptx**
```python
from pptx import Presentation
from pptx.util import Inches, Pt

prs = Presentation()
prs.slide_width = Inches(48)
prs.slide_height = Inches(36)

slide = prs.slides.add_slide(prs.slide_layouts[6])  # Blank

# Add images from figures/
slide.shapes.add_picture("figures/hero.png", Inches(0), Inches(0), width=Inches(48))
# ... add other elements

prs.save("poster.pptx")
```

---

## HTML Template Structure

The provided template (`assets/poster_html_template.html`) includes:

### CSS Variables for Customization

```css
/* Poster dimensions */
body {
  width: 2592pt;   /* 36 inches */
  height: 3456pt;  /* 48 inches */
}

/* Color scheme - customize these */
.header {
  background: linear-gradient(135deg, #1a365d 0%, #2b6cb0 50%, #3182ce 100%);
}

/* Typography */
.poster-title { font-size: 108pt; }
.authors { font-size: 48pt; }
.block-title { font-size: 52pt; }
.block-content { font-size: 34pt; }
```

### Key Classes

| Class | Purpose | Font Size |
|-------|---------|-----------|
| `.poster-title` | Main title | 108pt |
| `.authors` | Author names | 48pt |
| `.affiliations` | Institutions | 38pt |
| `.block-title` | Section headers | 52pt |
| `.block-content` | Body text | 34pt |
| `.key-finding` | Highlight box | 36pt |

---

## Quality Checklist

### Step 0: Pre-Generation Review (MANDATORY)

**For EACH planned graphic, verify:**
- [ ] Can describe in 3-4 items or less? (NOT 5+)
- [ ] Is it a simple workflow (3-4 steps, NOT 7+)?
- [ ] Can describe all text in 10 words or less?
- [ ] Does it convey ONE message (not multiple)?

**Reject these patterns:**
- ❌ "7-stage workflow" → Simplify to "3 mega-stages"
- ❌ "Multiple case studies" → One case per graphic
- ❌ "Timeline 2015-2024 annual" → "ONLY 3 key years"
- ❌ "Compare 6 methods" → "ONLY 2: ours vs best"

### Step 2b: Post-Generation Review (MANDATORY)

**For EACH generated figure at 25% zoom:**

**✅ PASS criteria (ALL must be true):**
- [ ] Can read ALL text clearly
- [ ] Count: 3-4 elements or fewer
- [ ] White space: 50%+ empty
- [ ] Understand in 2 seconds
- [ ] NOT a complex 5+ stage workflow
- [ ] NOT multiple nested sections

**❌ FAIL criteria (regenerate if ANY true):**
- [ ] Text small/hard to read → Regenerate with "150pt+"
- [ ] More than 4 elements → Regenerate "ONLY 3 elements"
- [ ] Less than 50% white space → Regenerate "60% white space"
- [ ] Complex multi-stage → SPLIT into 2-3 graphics
- [ ] Multiple cases cramped → SPLIT into separate graphics

### After Export

- [ ] NO content cut off at ANY of the 4 edges (check carefully)
- [ ] All images display correctly
- [ ] Colors render as expected
- [ ] Text readable at 25% scale
- [ ] Graphics look SIMPLE (not like complex 7-stage workflows)

---

## Common Pitfalls to Avoid

**AI-Generated Graphics Mistakes:**
- ❌ Too many elements (10+ items) → Keep to 3-5 max
- ❌ Text too small → Specify "GIANT (100pt+)" in prompts
- ❌ No white space → Add "50% white space" to every prompt
- ❌ Complex flowcharts (8+ steps) → Limit to 4-5 steps

**HTML/Export Mistakes:**
- ❌ Content exceeding poster dimensions → Check overflow in browser
- ❌ Missing background graphics in PDF → Enable in print settings
- ❌ Wrong paper size in PDF → Match poster dimensions exactly
- ❌ Low-resolution images → Use 300 DPI minimum

**Content Mistakes:**
- ❌ Too much text (over 1000 words) → Cut to 300-800 words
- ❌ Too many sections (7+) → Consolidate to 5-6
- ❌ No clear visual hierarchy → Make key findings prominent

---

## Integration with Other Skills

This skill works with:
- **Scientific Schematics**: Generate all poster diagrams and flowcharts
- **Generate Image / Nano Banana Pro**: Create stylized graphics and hero images
- **LaTeX Posters**: DEFAULT skill for poster creation (use this instead unless PPTX explicitly requested)

---

## Template Assets

Available in `assets/` directory:

- `poster_html_template.html`: Main HTML poster template (36×48 inches)
- `poster_quality_checklist.md`: Pre-submission validation checklist

## References

Available in `references/` directory:

- `poster_content_guide.md`: Content organization and writing guidelines
- `poster_design_principles.md`: Typography, color theory, and visual hierarchy
- `poster_layout_design.md`: Layout principles and grid systems

