---
name: latex-posters
description: "Create professional research posters in LaTeX using beamerposter, tikzposter, or baposter. Support for conference presentations, academic posters, and scientific communication. Includes layout design, color schemes, multi-column formats, figure integration, and poster-specific best practices for visual communication."
allowed-tools: Read Write Edit Bash
---

# LaTeX Research Posters

## Overview

Research posters are a critical medium for scientific communication at conferences, symposia, and academic events. This skill provides comprehensive guidance for creating professional, visually appealing research posters using LaTeX packages. Generate publication-quality posters with proper layout, typography, color schemes, and visual hierarchy.

## When to Use This Skill

This skill should be used when:
- Creating research posters for conferences, symposia, or poster sessions
- Designing academic posters for university events or thesis defenses
- Preparing visual summaries of research for public engagement
- Converting scientific papers into poster format
- Creating template posters for research groups or departments
- Designing posters that comply with specific conference size requirements (A0, A1, 36×48", etc.)
- Building posters with complex multi-column layouts
- Integrating figures, tables, equations, and citations in poster format

## AI-Powered Visual Element Generation

**STANDARD WORKFLOW: Generate ALL major visual elements using AI before creating the LaTeX poster.**

This is the recommended approach for creating visually compelling posters:
1. Plan all visual elements needed (title, intro, methods, results, conclusions)
2. Generate each element using scientific-schematics or Nano Banana Pro
3. Assemble generated images in the LaTeX template
4. Add text content around the visuals

**Target: 60-70% of poster area should be AI-generated visuals, 30-40% text.**

---

### CRITICAL: Preventing Content Overflow

**⚠️ POSTERS MUST NOT HAVE TEXT OR CONTENT CUT OFF AT EDGES.**

**Common Overflow Problems:**
1. **Title/footer text extending beyond page boundaries**
2. **Too many sections crammed into available space**
3. **Figures placed too close to edges**
4. **Text blocks exceeding column widths**

**Prevention Rules:**

**1. Limit Content Sections (MAXIMUM 5-6 sections for A0):**
```
✅ GOOD - 5 sections with room to breathe:
   - Title/Header
   - Introduction/Problem
   - Methods
   - Results (1-2 key findings)
   - Conclusions

❌ BAD - 8+ sections crammed together:
   - Overview, Introduction, Background, Methods, 
   - Results 1, Results 2, Discussion, Conclusions, Future Work
```

**2. Set Safe Margins in LaTeX:**
```latex
% tikzposter - add generous margins
\documentclass[25pt, a0paper, portrait, margin=25mm]{tikzposter}

% baposter - ensure content doesn't touch edges
\begin{poster}{
  columns=3,
  colspacing=2em,           % Space between columns
  headerheight=0.1\textheight,  % Smaller header
  % Leave space at bottom
}
```

**3. Figure Sizing - Never 100% Width:**
```latex
% Leave margins around figures
\includegraphics[width=0.85\linewidth]{figure.png}  % NOT 1.0\linewidth
```

**4. Check for Overflow Before Printing:**
```bash
# Compile and check PDF at 100% zoom
pdflatex poster.tex

# Look for:
# - Text cut off at any edge
# - Content touching page boundaries  
# - Overfull hbox warnings in .log file
grep -i "overfull" poster.log
```

**5. Word Count Limits:**
- **A0 poster**: 300-800 words MAXIMUM
- **Per section**: 50-100 words maximum
- **If you have more content**: Cut it or make a handout

---

### CRITICAL: Poster-Size Font Requirements

**⚠️ ALL text within AI-generated visualizations MUST be poster-readable.**

When generating graphics for posters, you MUST include font size specifications in EVERY prompt. Poster graphics are viewed from 4-6 feet away, so text must be LARGE.

**⚠️ COMMON PROBLEM: Content Overflow and Density**

The #1 issue with AI-generated poster graphics is **TOO MUCH CONTENT**. This causes:
- Text overflow beyond boundaries
- Unreadable small fonts
- Cluttered, overwhelming visuals
- Poor white space usage

**SOLUTION: Generate SIMPLE graphics with MINIMAL content.**

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

**Content limits per graphic type (STRICT):**
| Graphic Type | Max Elements | Max Words | Reject If | Good Example |
|--------------|--------------|-----------|-----------|--------------|
| Flowchart | **3-4 boxes MAX** | **8 words** | 5+ stages, nested steps | "DISCOVER → VALIDATE → APPROVE" (3 words) |
| Key findings | **3 items MAX** | **9 words** | 4+ metrics, paragraphs | "95% ACCURATE" "2X FASTER" "FDA READY" (6 words) |
| Comparison chart | **3 bars MAX** | **6 words** | 4+ methods, legend text | "OURS: 95%" "BEST: 85%" (4 words) |
| Case study | **1 case, 3 elements** | **6 words** | Multiple cases, substories | Logo + "18 MONTHS" + "to discovery" (2 words) |
| Timeline | **3-4 points MAX** | **8 words** | Year-by-year detail | "2020 START" "2022 TRIAL" "2024 APPROVED" (6 words) |

**Example - WRONG (7-stage workflow - TOO COMPLEX):**
```bash
# ❌ BAD - This creates tiny unreadable text like the drug discovery poster
python scripts/generate_schematic.py "Drug discovery workflow showing: Stage 1 Target Identification, Stage 2 Molecular Synthesis, Stage 3 Virtual Screening, Stage 4 AI Lead Optimization, Stage 5 Clinical Trial Design, Stage 6 FDA Approval. Include success metrics, timelines, and validation steps for each stage." -o figures/workflow.png
# Result: 7+ stages with tiny text, unreadable from 6 feet - POSTER FAILURE
```

**Example - CORRECT (simplified to 3 key stages):**
```bash
# ✅ GOOD - Same content, split into ONE simple high-level graphic
python scripts/generate_schematic.py "POSTER FORMAT for A0. ULTRA-SIMPLE 3-box workflow: 'DISCOVER' → 'VALIDATE' → 'APPROVE'. Each word in GIANT bold (120pt+). Thick arrows (10px). 60% white space. NO substeps, NO details. 3 words total. Readable from 10 feet." -o figures/workflow_overview.png
# Result: Clean, impactful, readable - can add detail graphics separately if needed
```

**Example - WRONG (complex case studies with multiple sections):**
```bash
# ❌ BAD - Creates cramped unreadable sections
python scripts/generate_schematic.py "Case studies: Insilico Medicine (drug candidate, discovery time, clinical trials), Recursion Pharma (platform, methodology, results), Exscientia (drug candidates, FDA status, timeline). Include company logos, metrics, and outcomes." -o figures/cases.png
# Result: 3 case studies with 4+ elements each = 12+ total elements, tiny text
```

**Example - CORRECT (one case study, one key metric):**
```bash
# ✅ GOOD - Show ONE case with ONE key number
python scripts/generate_schematic.py "POSTER FORMAT for A0. ONE case study card: Company logo (large), '18 MONTHS' in GIANT text (150pt), 'to discovery' below (60pt). 3 elements total: logo + number + caption. 50% white space. Readable from 10 feet." -o figures/case_single.png
# Result: Clear, readable, impactful. Make 3 separate graphics if you need 3 cases.
```

**Example - WRONG (key findings too complex):**
```bash
# BAD - too many items, too much detail
python scripts/generate_schematic.py "Key findings showing 8 metrics: accuracy 95%, precision 92%, recall 94%, F1 0.93, AUC 0.97, training time 2.3 hours, inference 50ms, model size 145MB with comparison to 5 baseline methods" -o figures/findings.png
# Result: Cramped graphic with tiny numbers
```

**Example - CORRECT (key findings simple):**
```bash
# GOOD - only 3 key items, giant numbers
python scripts/generate_schematic.py "POSTER FORMAT for A0. KEY FINDINGS with ONLY 3 large cards. Card 1: '95%' in GIANT text (120pt) with 'ACCURACY' below (48pt). Card 2: '2X' in GIANT text with 'FASTER' below. Card 3: checkmark icon with 'VALIDATED' in large text. 50% white space. High contrast colors. NO other text or details." -o figures/findings.png
# Result: Bold, readable impact statement
```

**Font size reference for poster prompts:**
| Element | Minimum Size | Prompt Keywords |
|---------|--------------|-----------------|
| Main numbers/metrics | 72pt+ | "huge", "very large", "giant", "poster-size" |
| Section titles | 60pt+ | "large bold", "prominent" |
| Labels/captions | 36pt+ | "readable from 6 feet", "clear labels" |
| Body text | 24pt+ | "poster-readable", "large text" |

**Always include in prompts:**
- "POSTER FORMAT" or "for A0 poster" or "readable from 6 feet"
- "VERY LARGE TEXT" or "huge bold fonts"
- Specific text that should appear (so it's baked into the image)
- "minimal text, maximum impact"
- "high contrast" for readability
- "generous margins" and "no text near edges"

---

### CRITICAL: AI-Generated Graphic Sizing

**⚠️ Each AI-generated graphic should focus on ONE concept with MINIMAL content.**

**Problem**: Generating complex diagrams with many elements leads to small text.

**Solution**: Generate SIMPLE graphics with FEW elements and LARGE text.

**Example - WRONG (too complex, text will be small):**
```bash
# BAD - too many elements in one graphic
python scripts/generate_schematic.py "Complete ML pipeline showing data collection, 
preprocessing with 5 steps, feature engineering with 8 techniques, model training 
with hyperparameter tuning, validation with cross-validation, and deployment with 
monitoring. Include all labels and descriptions." -o figures/pipeline.png
```

**Example - CORRECT (simple, focused, large text):**
```bash
# GOOD - split into multiple simple graphics with large text

# Graphic 1: High-level overview (3-4 elements max)
python scripts/generate_schematic.py "POSTER FORMAT for A0: Simple 4-step pipeline. 
Four large boxes: DATA → PROCESS → MODEL → RESULTS. 
GIANT labels (80pt+), thick arrows, lots of white space. 
Only 4 words total. Readable from 8 feet." -o figures/overview.png

# Graphic 2: Key result (1 metric highlighted)
python scripts/generate_schematic.py "POSTER FORMAT for A0: Single key metric display.
Giant '95%' text (150pt+) with 'ACCURACY' below (60pt+).
Checkmark icon. Minimal design, high contrast.
Readable from 10 feet." -o figures/accuracy.png
```

**Rules for AI-generated poster graphics:**
| Rule | Limit | Reason |
|------|-------|--------|
| **Elements per graphic** | 3-5 maximum | More elements = smaller text |
| **Words per graphic** | 10-15 maximum | Minimal text = larger fonts |
| **Flowchart steps** | 4-5 maximum | Keeps labels readable |
| **Chart categories** | 3-4 maximum | Prevents crowding |
| **Nested levels** | 1-2 maximum | Avoids complexity |

**Split complex content into multiple simple graphics:**
```
Instead of 1 complex diagram with 12 elements:
→ Create 3 simple diagrams with 4 elements each
→ Each graphic can have LARGER text
→ Arrange in poster with clear visual flow
```

---

### Step 0: MANDATORY Pre-Generation Review (DO THIS FIRST)

**⚠️ BEFORE generating ANY graphics, review your content plan:**

**For EACH planned graphic, ask these questions:**
1. **Element count**: Can I describe this in 3-4 items or less?
   - ❌ NO → Simplify or split into multiple graphics
   - ✅ YES → Continue

2. **Complexity check**: Is this a multi-stage workflow (5+ steps) or nested diagram?
   - ❌ YES → Flatten to 3-4 high-level steps only
   - ✅ NO → Continue

3. **Word count**: Can I describe all text in 10 words or less?
   - ❌ NO → Cut text, use single-word labels
   - ✅ YES → Continue

4. **Message clarity**: Does this graphic convey ONE clear message?
   - ❌ NO → Split into multiple focused graphics
   - ✅ YES → Continue to generation

**Common patterns that ALWAYS fail (reject these):**
- "Show stages 1 through 7..." → Split into high-level overview (3 stages) + detail graphics
- "Multiple case studies..." → One case per graphic
- "Timeline from 2015 to 2024 with annual milestones..." → Show only 3-4 key years
- "Comparison of 6 methods..." → Show only top 3 or Our method vs Best baseline
- "Architecture with all layers and connections..." → High-level only (3-4 components)

### Step 1: Plan Your Poster Elements

After passing the pre-generation review, identify visual elements needed:

1. **Title Block** - Stylized title with institutional branding (optional - can be LaTeX text)
2. **Introduction Graphic** - Conceptual overview (3 elements max)
3. **Methods Diagram** - High-level workflow (3-4 steps max)
4. **Results Figures** - Key findings (3 metrics max per figure, may need 2-3 separate figures)
5. **Conclusion Graphic** - Summary visual (3 takeaways max)
6. **Supplementary Icons** - Simple icons, QR codes, logos (minimal)

### Step 2: Generate Each Element (After Pre-Generation Review)

**⚠️ CRITICAL: Review Step 0 checklist before proceeding.**

Use the appropriate tool for each element type:

**For Schematics and Diagrams (scientific-schematics):**
```bash
# Create figures directory
mkdir -p figures

# Drug discovery workflow - HIGH-LEVEL ONLY, 3 stages
# BAD: "Stage 1: Target ID, Stage 2: Molecular Synthesis, Stage 3: Virtual Screening, Stage 4: AI Lead Opt..."
# GOOD: Collapse to 3 mega-stages
python scripts/generate_schematic.py "POSTER FORMAT for A0. ULTRA-SIMPLE 3-box workflow: 'DISCOVER' (120pt bold) → 'VALIDATE' (120pt bold) → 'APPROVE' (120pt bold). Thick arrows (10px). 60% white space. ONLY these 3 words. NO substeps. Readable from 12 feet." -o figures/workflow_simple.png

# System architecture - MAXIMUM 3 components
python scripts/generate_schematic.py "POSTER FORMAT for A0. ULTRA-SIMPLE 3-component stack: 'DATA' box (120pt) → 'AI MODEL' box (120pt) → 'PREDICTION' box (120pt). Thick vertical arrows. 60% white space. 3 words only. Readable from 12 feet." -o figures/architecture.png

# Timeline - ONLY 3 key milestones (not year-by-year)
# BAD: "2018, 2019, 2020, 2021, 2022, 2023, 2024 with events"
# GOOD: Only 3 breakthrough moments
python scripts/generate_schematic.py "POSTER FORMAT for A0. Timeline with ONLY 3 points: '2018' + icon, '2021' + icon, '2024' + icon. GIANT years (120pt). Large icons. 60% white space. NO connecting lines or details. Readable from 12 feet." -o figures/timeline.png

# Case study - ONE case, ONE key metric
# BAD: "3 case studies: Insilico (details), Recursion (details), Exscientia (details)"
# GOOD: ONE case with ONE number
python scripts/generate_schematic.py "POSTER FORMAT for A0. ONE case study: Large logo + '18 MONTHS' (150pt bold) + 'to discovery' (60pt). 3 elements total. 60% white space. Readable from 12 feet." -o figures/case1.png

# If you need 3 cases → make 3 separate simple graphics (not one complex graphic)
```

**For Stylized Blocks and Graphics (Nano Banana Pro):**
```bash
# Title block - SIMPLE
python scripts/generate_schematic.py "POSTER FORMAT for A0. Title block: 'ML FOR DRUG DISCOVERY' in HUGE bold text (120pt+). Dark blue background. ONE subtle icon. NO other text. 40% white space. Readable from 15 feet." -o figures/title_block.png

# Introduction visual - SIMPLE, 3 elements only
python scripts/generate_schematic.py "POSTER FORMAT for A0. SIMPLE problem visual with ONLY 3 icons: drug icon, arrow, target icon. ONE label per icon (80pt+). 50% white space. NO detailed text. Readable from 8 feet." -o figures/intro_visual.png

# Conclusion/summary - ONLY 3 items, GIANT numbers
python scripts/generate_schematic.py "POSTER FORMAT for A0. KEY FINDINGS with EXACTLY 3 cards only. Card 1: '95%' (150pt font) with 'ACCURACY' (60pt). Card 2: '2X' (150pt) with 'FASTER' (60pt). Card 3: checkmark icon with 'READY' (60pt). 50% white space. NO other text. Readable from 10 feet." -o figures/conclusions_graphic.png

# Background visual - SIMPLE, 3 icons only
python scripts/generate_schematic.py "POSTER FORMAT for A0. SIMPLE visual with ONLY 3 large icons in a row: problem icon → challenge icon → impact icon. ONE word label each (80pt+). 50% white space. NO detailed text. Readable from 8 feet." -o figures/background_visual.png
```

**For Data Visualizations - SIMPLE, 3 bars max:**
```bash
# SIMPLE chart with ONLY 3 bars, GIANT labels
python scripts/generate_schematic.py "POSTER FORMAT for A0. SIMPLE bar chart with ONLY 3 bars: BASELINE (70%), EXISTING (85%), OURS (95%). GIANT percentage labels ON the bars (100pt+). NO axis labels, NO legend, NO gridlines. Our bar highlighted in different color. 40% white space. Readable from 8 feet." -o figures/comparison_chart.png
```

### Step 2b: MANDATORY Post-Generation Review (Before Assembly)

**⚠️ CRITICAL: Review EVERY generated graphic before adding to poster.**

**For each generated figure, open at 25% zoom and check:**

1. **✅ PASS criteria (all must be true):**
   - Can read ALL text clearly at 25% zoom
   - Count elements: 3-4 or fewer
   - White space: 50%+ of image is empty
   - Simple enough to understand in 2 seconds
   - NOT a complex workflow with 5+ stages
   - NOT multiple nested sections

2. **❌ FAIL criteria (regenerate if ANY are true):**
   - Text is small or hard to read at 25% zoom → REGENERATE with "150pt+" fonts
   - More than 4 elements → REGENERATE with "ONLY 3 elements"
   - Less than 50% white space → REGENERATE with "60% white space"
   - Complex multi-stage workflow → SPLIT into 2-3 simple graphics
   - Multiple case studies cramped together → SPLIT into separate graphics
   - Takes more than 3 seconds to understand → SIMPLIFY and regenerate

**Common failures and fixes:**
- "7-stage workflow with tiny text" → Regenerate as "3 high-level stages only"
- "3 case studies in one graphic" → Generate 3 separate simple graphics
- "Timeline with 8 years" → Regenerate with "ONLY 3 key milestones"
- "Comparison of 5 methods" → Regenerate with "ONLY Our method vs Best baseline (2 bars)"

**DO NOT PROCEED to assembly if ANY graphic fails the checks above.**

### Step 3: Assemble in LaTeX Template

After all figures pass the post-generation review, include them in your poster template:

**tikzposter example:**
```latex
\documentclass[25pt, a0paper, portrait]{tikzposter}

\begin{document}

\maketitle

\begin{columns}
\column{0.5}

\block{Introduction}{
  \centering
  \includegraphics[width=0.85\linewidth]{figures/intro_visual.png}
  
  \vspace{0.5em}
  Brief context text here (2-3 sentences max).
}

\block{Methods}{
  \centering
  \includegraphics[width=0.9\linewidth]{figures/methods_flowchart.png}
}

\column{0.5}

\block{Results}{
  \begin{minipage}{0.48\linewidth}
    \centering
    \includegraphics[width=\linewidth]{figures/result_1.png}
  \end{minipage}
  \hfill
  \begin{minipage}{0.48\linewidth}
    \centering
    \includegraphics[width=\linewidth]{figures/result_2.png}
  \end{minipage}
  
  \vspace{0.5em}
  Key findings in 3-4 bullet points.
}

\block{Conclusions}{
  \centering
  \includegraphics[width=0.8\linewidth]{figures/conclusions_graphic.png}
}

\end{columns}

\end{document}
```

**baposter example:**
```latex
\headerbox{Methods}{name=methods,column=0,row=0}{
  \centering
  \includegraphics[width=0.95\linewidth]{figures/methods_flowchart.png}
}

\headerbox{Results}{name=results,column=1,row=0}{
  \includegraphics[width=\linewidth]{figures/comparison_chart.png}
  \vspace{0.3em}
  
  Key finding: Our method achieves 92% accuracy.
}
```

### Example: Complete Poster Generation Workflow

**Full workflow with ALL quality checks:**

```bash
# STEP 0: Pre-Generation Review (MANDATORY)
# Content plan: Drug discovery poster
# - Workflow: 7 stages → ❌ TOO MANY → Reduce to 3 mega-stages ✅
# - 3 case studies → ❌ TOO MANY → One case per graphic (make 3 graphics) ✅
# - Timeline 2018-2024 → ❌ TOO DETAILED → Only 3 key years ✅

# STEP 1: Create figures directory
mkdir -p figures

# STEP 2: Generate ULTRA-SIMPLE graphics with strict limits

# Workflow - HIGH-LEVEL ONLY (collapsed from 7 stages to 3)
python scripts/generate_schematic.py "POSTER FORMAT for A0. ULTRA-SIMPLE 3-box workflow: 'DISCOVER' → 'VALIDATE' → 'APPROVE'. Each word 120pt+ bold. Thick arrows (10px). 60% white space. ONLY 3 words total. Readable from 12 feet." -o figures/workflow.png

# Case study 1 - ONE case, ONE metric (will make 3 separate graphics)
python scripts/generate_schematic.py "POSTER FORMAT for A0. ONE case: Company logo + '18 MONTHS' (150pt bold) + 'to drug discovery' (60pt). 3 elements only. 60% white space. Readable from 12 feet." -o figures/case1.png

python scripts/generate_schematic.py "POSTER FORMAT for A0. ONE case: Company logo + '95% SUCCESS' (150pt bold) + 'in trials' (60pt). 3 elements only. 60% white space." -o figures/case2.png

python scripts/generate_schematic.py "POSTER FORMAT for A0. ONE case: Company logo + 'FDA APPROVED' (150pt bold) + '2024' (60pt). 3 elements only. 60% white space." -o figures/case3.png

# Timeline - ONLY 3 key years (not 7 years)
python scripts/generate_schematic.py "POSTER FORMAT for A0. ONLY 3 years: '2018' (150pt) + icon, '2021' (150pt) + icon, '2024' (150pt) + icon. Large icons. 60% white space. NO lines or details. Readable from 12 feet." -o figures/timeline.png

# Results - ONLY 2 bars (our method vs best baseline, not 5 methods)
python scripts/generate_schematic.py "POSTER FORMAT for A0. TWO bars only: 'BASELINE 70%' and 'OURS 95%' (highlighted). GIANT percentages (150pt) ON bars. NO axis, NO legend. 60% white space. Readable from 12 feet." -o figures/results.png

# STEP 2b: Post-Generation Review (MANDATORY)
# Open each figure at 25% zoom:
# ✅ workflow.png: 3 elements, text readable, 60% white - PASS
# ✅ case1.png: 3 elements, giant numbers, clean - PASS
# ✅ case2.png: 3 elements, giant numbers, clean - PASS  
# ✅ case3.png: 3 elements, giant numbers, clean - PASS
# ✅ timeline.png: 3 elements, readable, simple - PASS
# ✅ results.png: 2 bars, giant percentages, clear - PASS
# ALL PASS → Proceed to assembly

# STEP 3: Compile LaTeX poster
pdflatex poster.tex

# STEP 4: PDF Overflow Check (see Section 11)
grep "Overfull" poster.log
# Open at 100% and check all 4 edges
```

**If ANY graphic fails Step 2b review:**
- Too many elements → Regenerate with "ONLY 3 elements"
- Small text → Regenerate with "150pt+" or "GIANT BOLD (150pt+)"
- Cluttered → Regenerate with "60% white space" and "ULTRA-SIMPLE"
- Complex workflow → SPLIT into multiple simple 3-element graphics

### Visual Element Guidelines

**⚠️ CRITICAL: Each graphic must have ONE message and MAXIMUM 3-4 elements.**

**ABSOLUTE LIMITS - These are NOT guidelines, these are HARD LIMITS:**
- **MAXIMUM 3-4 elements** per graphic (3 is ideal)
- **MAXIMUM 10 words** total per graphic
- **MINIMUM 50% white space** (60% is better)
- **MINIMUM 120pt** for key numbers/metrics
- **MINIMUM 80pt** for labels

**For each poster section - STRICT requirements:**

| Section | Max Elements | Max Words | Example Prompt (REQUIRED PATTERN) |
|---------|--------------|-----------|-------------------------------------|
| **Introduction** | 3 icons | 6 words | "POSTER FORMAT for A0: ULTRA-SIMPLE 3 icons: [icon1] [icon2] [icon3]. ONE WORD labels (100pt bold). 60% white space. 3 words total." |
| **Methods** | 3 boxes | 6 words | "POSTER FORMAT for A0: ULTRA-SIMPLE 3-box workflow: 'STEP1' → 'STEP2' → 'STEP3'. GIANT labels (120pt+). 60% white space. 3 words only." |
| **Results** | 2-3 bars | 6 words | "POSTER FORMAT for A0: TWO bars: 'BASELINE 70%' 'OURS 95%'. GIANT percentages (150pt+) ON bars. NO axis. 60% white space." |
| **Conclusions** | 3 cards | 9 words | "POSTER FORMAT for A0: THREE cards: '95%' (150pt) 'ACCURATE', '2X' (150pt) 'FASTER', checkmark 'READY'. 60% white space." |
| **Case Study** | 3 elements | 5 words | "POSTER FORMAT for A0: ONE case: logo + '18 MONTHS' (150pt) + 'to discovery' (60pt). 60% white space." |
| **Timeline** | 3 points | 3 words | "POSTER FORMAT for A0: THREE years only: '2018' '2021' '2024' (150pt each). Large icons. 60% white space. NO details." |

**MANDATORY prompt elements (ALL required, NO exceptions):**
1. **"POSTER FORMAT for A0"** - MUST be first
2. **"ULTRA-SIMPLE"** or **"ONLY X elements"** - content limit
3. **"GIANT (120pt+)"** or specific font sizes - readability
4. **"60% white space"** - mandatory breathing room
5. **"readable from 10-12 feet"** - viewing distance
6. **Exact count** of words/elements - "3 words total" or "ONLY 3 icons"

**PATTERNS THAT ALWAYS FAIL (REJECT IMMEDIATELY):**
- ❌ "7-stage drug discovery workflow" → Split to "3 mega-stages"
- ❌ "Timeline from 2015-2024 with annual updates" → "ONLY 3 key years"
- ❌ "3 case studies with details" → Make 3 separate simple graphics
- ❌ "Comparison of 5 methods with metrics" → "ONLY 2: ours vs best"
- ❌ "Complete architecture showing all layers" → "3 components only"
- ❌ "Show stages 1,2,3,4,5,6" → "3 high-level stages"

**PATTERNS THAT WORK:**
- ✅ "3 mega-stages collapsed from 7" → Proper simplification
- ✅ "ONE case with ONE metric" → Will make multiple if needed
- ✅ "ONLY 3 milestones" → Selective, focused
- ✅ "2 bars: ours vs baseline" → Direct comparison
- ✅ "3-component high-level view" → Appropriately simplified

---

## Scientific Schematics Integration

For detailed guidance on creating schematics, refer to the **scientific-schematics** skill documentation.

**Key capabilities:**
- Nano Banana Pro automatically generates, reviews, and refines diagrams
- Creates publication-quality images with proper formatting
- Ensures accessibility (colorblind-friendly, high contrast)
- Supports iterative refinement for complex diagrams

---

## Core Capabilities

### 1. LaTeX Poster Packages

Support for three major LaTeX poster packages, each with distinct advantages. For detailed comparison and package-specific guidance, refer to `references/latex_poster_packages.md`.

**beamerposter**:
- Extension of the Beamer presentation class
- Familiar syntax for Beamer users
- Excellent theme support and customization
- Best for: Traditional academic posters, institutional branding

**tikzposter**:
- Modern, flexible design with TikZ integration
- Built-in color themes and layout templates
- Extensive customization through TikZ commands
- Best for: Colorful, modern designs, custom graphics

**baposter**:
- Box-based layout system
- Automatic spacing and positioning
- Professional-looking default styles
- Best for: Multi-column layouts, consistent spacing

### 2. Poster Layout and Structure

Create effective poster layouts following visual communication principles. For comprehensive layout guidance, refer to `references/poster_layout_design.md`.

**Common Poster Sections**:
- **Header/Title**: Title, authors, affiliations, logos
- **Introduction/Background**: Research context and motivation
- **Methods/Approach**: Methodology and experimental design
- **Results**: Key findings with figures and data visualizations
- **Conclusions**: Main takeaways and implications
- **References**: Key citations (typically abbreviated)
- **Acknowledgments**: Funding, collaborators, institutions

**Layout Strategies**:
- **Column-based layouts**: 2-column, 3-column, or 4-column grids
- **Block-based layouts**: Flexible arrangement of content blocks
- **Z-pattern flow**: Guide readers through content logically
- **Visual hierarchy**: Use size, color, and spacing to emphasize key points

### 3. Design Principles for Research Posters

Apply evidence-based design principles for maximum impact. For detailed design guidance, refer to `references/poster_design_principles.md`.

**Typography**:
- Title: 72-120pt for visibility from distance
- Section headers: 48-72pt
- Body text: 24-36pt minimum for readability from 4-6 feet
- Use sans-serif fonts (Arial, Helvetica, Calibri) for clarity
- Limit to 2-3 font families maximum

**Color and Contrast**:
- Use high-contrast color schemes for readability
- Institutional color palettes for branding
- Color-blind friendly palettes (avoid red-green combinations)
- White space is active space—don't overcrowd

**Visual Elements**:
- High-resolution figures (300 DPI minimum for print)
- Large, clear labels on all figures
- Consistent figure styling throughout
- Strategic use of icons and graphics
- Balance text with visual content (40-50% visual recommended)

**Content Guidelines**:
- **Less is more**: 300-800 words total recommended
- Bullet points over paragraphs for scannability
- Clear, concise messaging
- Self-explanatory figures with minimal text explanation
- QR codes for supplementary materials or online resources

### 4. Standard Poster Sizes

Support for international and conference-specific poster dimensions:

**International Standards**:
- A0 (841 × 1189 mm / 33.1 × 46.8 inches) - Most common European standard
- A1 (594 × 841 mm / 23.4 × 33.1 inches) - Smaller format
- A2 (420 × 594 mm / 16.5 × 23.4 inches) - Compact posters

**North American Standards**:
- 36 × 48 inches (914 × 1219 mm) - Common US conference size
- 42 × 56 inches (1067 × 1422 mm) - Large format
- 48 × 72 inches (1219 × 1829 mm) - Extra large

**Orientation**:
- Portrait (vertical) - Most common, traditional
- Landscape (horizontal) - Better for wide content, timelines

### 5. Package-Specific Templates

Provide ready-to-use templates for each major package. Templates available in `assets/` directory.

**beamerposter Templates**:
- `beamerposter_classic.tex` - Traditional academic style
- `beamerposter_modern.tex` - Clean, minimal design
- `beamerposter_colorful.tex` - Vibrant theme with blocks

**tikzposter Templates**:
- `tikzposter_default.tex` - Standard tikzposter layout
- `tikzposter_rays.tex` - Modern design with ray theme
- `tikzposter_wave.tex` - Professional wave-style theme

**baposter Templates**:
- `baposter_portrait.tex` - Classic portrait layout
- `baposter_landscape.tex` - Landscape multi-column
- `baposter_minimal.tex` - Minimalist design

### 6. Figure and Image Integration

Optimize visual content for poster presentations:

**Best Practices**:
- Use vector graphics (PDF, SVG) when possible for scalability
- Raster images: minimum 300 DPI at final print size
- Consistent image styling (borders, captions, sizes)
- Group related figures together
- Use subfigures for comparisons

**LaTeX Figure Commands**:
```latex
% Include graphics package
\usepackage{graphicx}

% Simple figure
\includegraphics[width=0.8\linewidth]{figure.pdf}

% Figure with caption in tikzposter
\block{Results}{
  \begin{tikzfigure}
    \includegraphics[width=0.9\linewidth]{results.png}
  \end{tikzfigure}
}

% Multiple subfigures
\usepackage{subcaption}
\begin{figure}
  \begin{subfigure}{0.48\linewidth}
    \includegraphics[width=\linewidth]{fig1.pdf}
    \caption{Condition A}
  \end{subfigure}
  \begin{subfigure}{0.48\linewidth}
    \includegraphics[width=\linewidth]{fig2.pdf}
    \caption{Condition B}
  \end{subfigure}
\end{figure}
```

### 7. Color Schemes and Themes

Provide professional color palettes for various contexts:

**Academic Institution Colors**:
- Match university or department branding
- Use official color codes (RGB, CMYK, or LaTeX color definitions)

**Scientific Color Palettes** (color-blind friendly):
- Viridis: Professional gradient from purple to yellow
- ColorBrewer: Research-tested palettes for data visualization
- IBM Color Blind Safe: Accessible corporate palette

**Package-Specific Theme Selection**:

**beamerposter**:
```latex
\usetheme{Berlin}
\usecolortheme{beaver}
```

**tikzposter**:
```latex
\usetheme{Rays}
\usecolorstyle{Denmark}
```

**baposter**:
```latex
\begin{poster}{
  background=plain,
  bgColorOne=white,
  headerColorOne=blue!70,
  textborder=rounded
}
```

### 8. Typography and Text Formatting

Ensure readability and visual appeal:

**Font Selection**:
```latex
% Sans-serif fonts recommended for posters
\usepackage{helvet}      % Helvetica
\usepackage{avant}       % Avant Garde
\usepackage{sfmath}      % Sans-serif math fonts

% Set default to sans-serif
\renewcommand{\familydefault}{\sfdefault}
```

**Text Sizing**:
```latex
% Adjust text sizes for visibility
\setbeamerfont{title}{size=\VeryHuge}
\setbeamerfont{author}{size=\Large}
\setbeamerfont{institute}{size=\normalsize}
```

**Emphasis and Highlighting**:
- Use bold for key terms: `\textbf{important}`
- Color highlights sparingly: `\textcolor{blue}{highlight}`
- Boxes for critical information
- Avoid italics (harder to read from distance)

### 9. QR Codes and Interactive Elements

Enhance poster interactivity for modern conferences:

**QR Code Integration**:
```latex
\usepackage{qrcode}

% Link to paper, code repository, or supplementary materials
\qrcode[height=2cm]{https://github.com/username/project}

% QR code with caption
\begin{center}
  \qrcode[height=3cm]{https://doi.org/10.1234/paper}\\
  \small Scan for full paper
\end{center}
```

**Digital Enhancements**:
- Link to GitHub repositories for code
- Link to video presentations or demos
- Link to interactive web visualizations
- Link to supplementary data or appendices

### 10. Compilation and Output

Generate high-quality PDF output for printing or digital display:

**Compilation Commands**:
```bash
# Basic compilation
pdflatex poster.tex

# With bibliography
pdflatex poster.tex
bibtex poster
pdflatex poster.tex
pdflatex poster.tex

# For beamer-based posters
lualatex poster.tex  # Better font support
xelatex poster.tex   # Unicode and modern fonts
```

**Ensuring Full Page Coverage**:

Posters should use the entire page without excessive margins. Configure packages correctly:

**beamerposter - Full Page Setup**:
```latex
\documentclass[final,t]{beamer}
\usepackage[size=a0,scale=1.4,orientation=portrait]{beamerposter}

% Remove default beamer margins
\setbeamersize{text margin left=0mm, text margin right=0mm}

% Use geometry for precise control
\usepackage[margin=10mm]{geometry}  % 10mm margins all around

% Remove navigation symbols
\setbeamertemplate{navigation symbols}{}

% Remove footline and headline if not needed
\setbeamertemplate{footline}{}
\setbeamertemplate{headline}{}
```

**tikzposter - Full Page Setup**:
```latex
\documentclass[
  25pt,                      % Font scaling
  a0paper,                   % Paper size
  portrait,                  % Orientation
  margin=10mm,               % Outer margins (minimal)
  innermargin=15mm,          % Space inside blocks
  blockverticalspace=15mm,   % Space between blocks
  colspace=15mm,             % Space between columns
  subcolspace=8mm            % Space between subcolumns
]{tikzposter}

% This ensures content fills the page
```

**baposter - Full Page Setup**:
```latex
\documentclass[a0paper,portrait,fontscale=0.285]{baposter}

\begin{poster}{
  grid=false,
  columns=3,
  colspacing=1.5em,          % Space between columns
  eyecatcher=true,
  background=plain,
  bgColorOne=white,
  borderColor=blue!50,
  headerheight=0.12\textheight,  % 12% for header
  textborder=roundedleft,
  headerborder=closed,
  boxheaderheight=2em        % Consistent box header heights
}
% Content here
\end{poster}
```

**Common Issues and Fixes**:

**Problem**: Large white margins around poster
```latex
% Fix for beamerposter
\setbeamersize{text margin left=5mm, text margin right=5mm}

% Fix for tikzposter
\documentclass[..., margin=5mm, innermargin=10mm]{tikzposter}

% Fix for baposter - adjust in document class
\documentclass[a0paper, margin=5mm]{baposter}
```

**Problem**: Content doesn't fill vertical space
```latex
% Use \vfill between sections to distribute space
\block{Introduction}{...}
\vfill
\block{Methods}{...}
\vfill
\block{Results}{...}

% Or manually adjust block spacing
\vspace{1cm}  % Add space between specific blocks
```

**Problem**: Poster extends beyond page boundaries
```latex
% Check total width calculation
% For 3 columns with spacing:
% Total = 3×columnwidth + 2×colspace + 2×margins
% Ensure this equals \paperwidth

% Debug by adding visible page boundary
\usepackage{eso-pic}
\AddToShipoutPictureBG{
  \AtPageLowerLeft{
    \put(0,0){\framebox(\LenToUnit{\paperwidth},\LenToUnit{\paperheight}){}}
  }
}
```

**Print Preparation**:
- Generate PDF/X-1a for professional printing
- Embed all fonts
- Convert colors to CMYK if required
- Check resolution of all images (minimum 300 DPI)
- Add bleed area if required by printer (usually 3-5mm)
- Verify page size matches requirements exactly

**Digital Display**:
- RGB color space for screen display
- Optimize file size for email/web
- Test readability on different screens

### 11. PDF Review and Quality Control

**CRITICAL**: Always review the generated PDF before printing or presenting. Use this systematic checklist:

**Step 1: Page Size Verification**
```bash
# Check PDF dimensions (should match poster size exactly)
pdfinfo poster.pdf | grep "Page size"

# Expected outputs:
# A0: 2384 x 3370 points (841 x 1189 mm)
# 36x48": 2592 x 3456 points
# A1: 1684 x 2384 points (594 x 841 mm)
```

**Step 2: OVERFLOW CHECK (CRITICAL) - DO THIS IMMEDIATELY AFTER COMPILATION**

**⚠️ THIS IS THE #1 CAUSE OF POSTER FAILURES. Check BEFORE proceeding.**

**Step 2a: Check LaTeX Log File**
```bash
# Check for overflow warnings (these are ERRORS, not suggestions)
grep -i "overfull\|underfull\|badbox" poster.log

# ANY "Overfull" warning = content is cut off or extending beyond boundaries
# FIX ALL OF THESE before proceeding
```

**Common overflow warnings and what they mean:**
- `Overfull \hbox (15.2pt too wide)` → Text or graphic is 15.2pt wider than column
- `Overfull \vbox (23.5pt too high)` → Content is 23.5pt taller than available space
- `Badbox` → LaTeX struggling to fit content within boundaries

**Step 2b: Visual Edge Inspection (100% zoom in PDF viewer)**

**Check ALL FOUR EDGES systematically:**

1. **TOP EDGE:**
   - [ ] Title completely visible (not cut off)
   - [ ] Author names fully visible
   - [ ] No graphics touching top margin
   - [ ] Header content within safe zone

2. **BOTTOM EDGE:**
   - [ ] References fully visible (not cut off)
   - [ ] Acknowledgments complete
   - [ ] Contact info readable
   - [ ] No graphics cut off at bottom

3. **LEFT EDGE:**
   - [ ] No text touching left margin
   - [ ] All bullet points fully visible
   - [ ] Graphics have left margin (not bleeding off)
   - [ ] Column content within bounds

4. **RIGHT EDGE:**
   - [ ] No text extending beyond right margin
   - [ ] Graphics not cut off on right
   - [ ] Column content stays within bounds
   - [ ] QR codes fully visible

5. **BETWEEN COLUMNS:**
   - [ ] Content stays within individual columns
   - [ ] No text bleeding into adjacent columns
   - [ ] Figures respect column boundaries

**If ANY check fails, you have overflow. FIX IMMEDIATELY before continuing:**

**Fix hierarchy (try in order):**
1. **Check AI-generated graphics first:**
   - Are they too complex (5+ elements)? → Regenerate simpler
   - Do they have tiny text? → Regenerate with "150pt+" fonts
   - Are there too many? → Reduce number of figures

2. **Reduce sections:**
   - More than 5-6 sections? → Combine or remove
   - Example: Merge "Discussion" into "Conclusions"

3. **Cut text content:**
   - More than 800 words total? → Cut to 300-500
   - More than 100 words per section? → Cut to 50-80

4. **Adjust figure sizing:**
   - Using `width=\linewidth`? → Change to `width=0.85\linewidth`
   - Using `width=1.0\columnwidth`? → Change to `width=0.9\columnwidth`

5. **Increase margins (last resort):**
   ```latex
   \documentclass[25pt, a0paper, portrait, margin=25mm]{tikzposter}
   ```

**DO NOT proceed to Step 3 if ANY overflow exists.**

**Step 3: Visual Inspection Checklist**

Open PDF at 100% zoom and check:

**Layout and Spacing**:
- [ ] Content fills entire page (no large white margins)
- [ ] Consistent spacing between columns
- [ ] Consistent spacing between blocks/sections
- [ ] All elements aligned properly (use ruler tool)
- [ ] No overlapping text or figures
- [ ] White space evenly distributed

**Typography**:
- [ ] Title clearly visible and large (72pt+)
- [ ] Section headers readable (48-72pt)
- [ ] Body text readable at 100% zoom (24-36pt minimum)
- [ ] No text cutoff or running off edges
- [ ] Consistent font usage throughout
- [ ] All special characters render correctly (symbols, Greek letters)

**Visual Elements**:
- [ ] All figures display correctly
- [ ] No pixelated or blurry images
- [ ] Figure captions present and readable
- [ ] Colors render as expected (not washed out or too dark)
- [ ] Logos display clearly
- [ ] QR codes visible and scannable

**Content Completeness**:
- [ ] Title and authors complete
- [ ] All sections present (Intro, Methods, Results, Conclusions)
- [ ] References included
- [ ] Contact information visible
- [ ] Acknowledgments (if applicable)
- [ ] No placeholder text remaining (Lorem ipsum, TODO, etc.)

**Technical Quality**:
- [ ] No LaTeX compilation warnings in important areas
- [ ] All citations resolved (no [?] marks)
- [ ] All cross-references working
- [ ] Page boundaries correct (no content cut off)

**Step 4: Reduced-Scale Print Test**

**Essential Pre-Printing Test**:
```bash
# Create reduced-size test print (25% of final size)
# This simulates viewing full poster from ~8-10 feet

# For A0 poster, print on A4 paper (24.7% scale)
# For 36x48" poster, print on letter paper (~25% scale)
```

**Print Test Checklist**:
- [ ] Title readable from 6 feet away
- [ ] Section headers readable from 4 feet away
- [ ] Body text readable from 2 feet away
- [ ] Figures clear and understandable
- [ ] Colors printed accurately
- [ ] No obvious design flaws

**Step 5: Digital Quality Checks**

**Font Embedding Verification**:
```bash
# Check that all fonts are embedded (required for printing)
pdffonts poster.pdf

# All fonts should show "yes" in "emb" column
# If any show "no", recompile with:
pdflatex -dEmbedAllFonts=true poster.tex
```

**Image Resolution Check**:
```bash
# Extract image information
pdfimages -list poster.pdf

# Check that all images are at least 300 DPI
# Formula: DPI = pixels / (inches in poster)
# For A0 width (33.1"): 300 DPI = 9930 pixels minimum
```

**File Size Optimization**:
```bash
# For email/web, compress if needed (>50MB)
gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 \
   -dPDFSETTINGS=/printer -dNOPAUSE -dQUIET -dBATCH \
   -sOutputFile=poster_compressed.pdf poster.pdf

# For printing, keep original (no compression)
```

**Step 6: Accessibility Check**

**Color Contrast Verification**:
- [ ] Text-background contrast ratio ≥ 4.5:1 (WCAG AA)
- [ ] Important elements contrast ratio ≥ 7:1 (WCAG AAA)
- Test online: https://webaim.org/resources/contrastchecker/

**Color Blindness Simulation**:
- [ ] View PDF through color blindness simulator
- [ ] Information not lost with red-green simulation
- [ ] Use Coblis (color-blindness.com) or similar tool

**Step 7: Content Proofreading**

**Systematic Review**:
- [ ] Spell-check all text
- [ ] Verify all author names and affiliations
- [ ] Check all numbers and statistics for accuracy
- [ ] Confirm all citations are correct
- [ ] Review figure labels and captions
- [ ] Check for typos in headers and titles

**Peer Review**:
- [ ] Ask colleague to review poster
- [ ] 30-second test: Can they identify main message?
- [ ] 5-minute review: Do they understand conclusions?
- [ ] Note any confusing elements

**Step 8: Technical Validation**

**LaTeX Compilation Log Review**:
```bash
# Check for warnings in .log file
grep -i "warning\|error\|overfull\|underfull" poster.log

# Common issues to fix:
# - Overfull hbox: Text extending beyond margins
# - Underfull hbox: Excessive spacing
# - Missing references: Citations not resolved
# - Missing figures: Image files not found
```

**Fix Common Warnings**:
```latex
% Overfull hbox (text too wide)
\usepackage{microtype}  % Better spacing
\sloppy  % Allow slightly looser spacing
\hyphenation{long-word}  % Manual hyphenation

% Missing fonts
\usepackage[T1]{fontenc}  % Better font encoding

% Image not found
% Ensure paths are correct and files exist
\graphicspath{{./figures/}{./images/}}
```

**Step 9: Final Pre-Print Checklist**

**Before Sending to Printer**:
- [ ] PDF size exactly matches requirements (check with pdfinfo)
- [ ] All fonts embedded (check with pdffonts)
- [ ] Color mode correct (RGB for screen, CMYK for print if required)
- [ ] Bleed area added if required (usually 3-5mm)
- [ ] Crop marks visible if required
- [ ] Test print completed and reviewed
- [ ] File naming clear: [LastName]_[Conference]_Poster.pdf
- [ ] Backup copy saved

**Printing Specifications to Confirm**:
- [ ] Paper type (matte vs. glossy)
- [ ] Printing method (inkjet, large format, fabric)
- [ ] Color profile (provided to printer if required)
- [ ] Delivery deadline and shipping address
- [ ] Tube or flat packaging preference

**Digital Presentation Checklist**:
- [ ] PDF size optimized (<10MB for email)
- [ ] Tested on multiple PDF viewers (Adobe, Preview, etc.)
- [ ] Displays correctly on different screens
- [ ] QR codes tested and functional
- [ ] Alternative formats prepared (PNG for social media)

**Review Script** (Available in `scripts/review_poster.sh`):
```bash
#!/bin/bash
# Automated poster PDF review script

echo "Poster PDF Quality Check"
echo "======================="

# Check file exists
if [ ! -f "$1" ]; then
    echo "Error: File not found"
    exit 1
fi

echo "File: $1"
echo ""

# Check page size
echo "1. Page Dimensions:"
pdfinfo "$1" | grep "Page size"
echo ""

# Check fonts
echo "2. Font Embedding:"
pdffonts "$1" | head -20
echo ""

# Check file size
echo "3. File Size:"
ls -lh "$1" | awk '{print $5}'
echo ""

# Count pages (should be 1 for poster)
echo "4. Page Count:"
pdfinfo "$1" | grep "Pages"
echo ""

echo "Manual checks required:"
echo "- Visual inspection at 100% zoom"
echo "- Reduced-scale print test (25%)"
echo "- Color contrast verification"
echo "- Proofreading for typos"
```

**Common PDF Issues and Solutions**:

| Issue | Cause | Solution |
|-------|-------|----------|
| Large white margins | Incorrect margin settings | Reduce margin in documentclass |
| Content cut off | Exceeds page boundaries | Check total width/height calculations |
| Blurry images | Low resolution (<300 DPI) | Replace with higher resolution images |
| Missing fonts | Fonts not embedded | Compile with -dEmbedAllFonts=true |
| Wrong page size | Incorrect paper size setting | Verify documentclass paper size |
| Colors look wrong | RGB vs CMYK mismatch | Convert color space for print |
| File too large (>50MB) | Uncompressed images | Optimize images or compress PDF |
| QR codes don't work | Too small or low resolution | Minimum 2×2cm, high contrast |

### 11. Common Poster Content Patterns

Effective content organization for different research types:

**Experimental Research Poster**:
1. Title and authors
2. Introduction: Problem and hypothesis
3. Methods: Experimental design (with diagram)
4. Results: Key findings (2-4 main figures)
5. Conclusions: Main takeaways (3-5 bullet points)
6. Future work (optional)
7. References and acknowledgments

**Computational/Modeling Poster**:
1. Title and authors
2. Motivation: Problem statement
3. Approach: Algorithm or model (with flowchart)
4. Implementation: Technical details
5. Results: Performance metrics and comparisons
6. Applications: Use cases
7. Code availability (QR code to GitHub)
8. References

**Review/Survey Poster**:
1. Title and authors
2. Scope: Topic overview
3. Methods: Literature search strategy
4. Key findings: Main themes (organized by category)
5. Trends: Visualizations of publication patterns
6. Gaps: Identified research needs
7. Conclusions: Summary and implications
8. References

### 12. Accessibility and Inclusive Design

Design posters that are accessible to diverse audiences:

**Color Blindness Considerations**:
- Avoid red-green combinations (most common color blindness)
- Use patterns or shapes in addition to color
- Test with color-blindness simulators
- Provide high contrast (WCAG AA standard: 4.5:1 minimum)

**Visual Impairment Accommodations**:
- Large, clear fonts (minimum 24pt body text)
- High contrast text and background
- Clear visual hierarchy
- Avoid complex textures or patterns in backgrounds

**Language and Content**:
- Clear, concise language
- Define acronyms and jargon
- International audience considerations
- Consider multilingual QR code options for global conferences

### 13. Poster Presentation Best Practices

Guidance beyond LaTeX for effective poster sessions:

**Content Strategy**:
- Tell a story, don't just list facts
- Focus on 1-3 main messages
- Use visual abstract or graphical summary
- Leave room for conversation (don't over-explain)

**Physical Presentation Tips**:
- Bring printed handouts or business cards with QR code
- Prepare 30-second, 2-minute, and 5-minute verbal summaries
- Stand to the side, not blocking the poster
- Engage viewers with open-ended questions

**Digital Backups**:
- Save poster as PDF on mobile device
- Prepare digital version for email sharing
- Create social media-friendly image version
- Have backup printed copy or digital display option

## Workflow for Poster Creation

### Stage 1: Planning and Content Development

1. **Determine poster requirements**:
   - Conference size specifications (A0, 36×48", etc.)
   - Orientation (portrait vs. landscape)
   - Submission deadlines and format requirements

2. **Develop content outline**:
   - Identify 1-3 core messages
   - Select key figures (typically 3-6 main visuals)
   - Draft concise text for each section (bullet points preferred)
   - Aim for 300-800 words total

3. **Choose LaTeX package**:
   - beamerposter: If familiar with Beamer, need institutional themes
   - tikzposter: For modern, colorful designs with flexibility
   - baposter: For structured, professional multi-column layouts

### Stage 2: Generate Visual Elements (AI-Powered)

**CRITICAL: Generate SIMPLE figures with MINIMAL content. Each graphic = ONE message.**

**Content limits:**
- Maximum 4-5 elements per graphic
- Maximum 15 words total per graphic
- 50% white space minimum
- GIANT fonts (80pt+ for labels, 120pt+ for key numbers)

1. **Create figures directory**:
   ```bash
   mkdir -p figures
   ```

2. **Generate SIMPLE visual elements**:
   ```bash
   # Introduction - ONLY 3 icons/elements
   python scripts/generate_schematic.py "POSTER FORMAT for A0. SIMPLE visual with ONLY 3 elements: [icon1] [icon2] [icon3]. ONE word labels (80pt+). 50% white space. Readable from 8 feet." -o figures/intro.png
   
   # Methods - ONLY 4 steps maximum
   python scripts/generate_schematic.py "POSTER FORMAT for A0. SIMPLE flowchart with ONLY 4 boxes: STEP1 → STEP2 → STEP3 → STEP4. GIANT labels (100pt+). 50% white space. NO sub-steps." -o figures/methods.png
   
   # Results - ONLY 3 bars/comparisons
   python scripts/generate_schematic.py "POSTER FORMAT for A0. SIMPLE chart with ONLY 3 bars. GIANT percentages ON bars (120pt+). NO axis, NO legend. 50% white space." -o figures/results.png
   
   # Conclusions - EXACTLY 3 items with GIANT numbers
   python scripts/generate_schematic.py "POSTER FORMAT for A0. EXACTLY 3 key findings: '[NUMBER]' (150pt) '[LABEL]' (60pt) for each. 50% white space. NO other text." -o figures/conclusions.png
   ```

3. **Review generated figures - check for overflow:**
   - **View at 25% zoom**: All text still readable?
   - **Count elements**: More than 5? → Regenerate simpler
   - **Check white space**: Less than 40%? → Add "60% white space" to prompt
   - **Font too small?**: Add "EVEN LARGER" or increase pt sizes
   - **Still overflowing?**: Reduce to 3 elements instead of 4-5

### Stage 3: Design and Layout

1. **Select or create template**:
   - Start with provided templates in `assets/`
   - Customize color scheme to match branding
   - Configure page size and orientation

2. **Design layout structure**:
   - Plan column structure (2, 3, or 4 columns)
   - Map content flow (typically left-to-right, top-to-bottom)
   - Allocate space for title (10-15%), content (70-80%), footer (5-10%)

3. **Set typography**:
   - Configure font sizes for different hierarchy levels
   - Ensure minimum 24pt body text
   - Test readability from 4-6 feet distance

### Stage 4: Content Integration

1. **Create poster header**:
   - Title (concise, descriptive, 10-15 words)
   - Authors and affiliations
   - Institution logos (high-resolution)
   - Conference logo if required

2. **Integrate AI-generated figures**:
   - Add all figures from Stage 2 to appropriate sections
   - Use `\includegraphics` with proper sizing
   - Ensure figures dominate each section (visuals first, text second)
   - Center figures within blocks for visual impact

3. **Add minimal supporting text**:
   - Keep text minimal and scannable (300-800 words total)
   - Use bullet points, not paragraphs
   - Write in active voice
   - Text should complement figures, not duplicate them

4. **Add supplementary elements**:
   - QR codes for supplementary materials
   - References (cite key papers only, 5-10 typical)
   - Contact information and acknowledgments

### Stage 5: Refinement and Testing

1. **Review and iterate**:
   - Check for typos and errors
   - Verify all figures are high resolution
   - Ensure consistent formatting
   - Confirm color scheme works well together

2. **Test readability**:
   - Print at 25% scale and read from 2-3 feet (simulates poster from 8-12 feet)
   - Check color on different monitors
   - Verify QR codes function correctly
   - Ask colleague to review

3. **Optimize for printing**:
   - Embed all fonts in PDF
   - Verify image resolution
   - Check PDF size requirements
   - Include bleed area if required

### Stage 6: Compilation and Delivery

1. **Compile final PDF**:
   ```bash
   pdflatex poster.tex
   # Or for better font support:
   lualatex poster.tex
   ```

2. **Verify output quality**:
   - Check all elements are visible and correctly positioned
   - Zoom to 100% and inspect figure quality
   - Verify colors match expectations
   - Confirm PDF opens correctly on different viewers

3. **Prepare for printing**:
   - Export as PDF/X-1a if required
   - Save backup copies
   - Get test print on regular paper first
   - Order professional printing 2-3 days before deadline

4. **Create supplementary materials**:
   - Save PNG/JPG version for social media
   - Create handout version (8.5×11" summary)
   - Prepare digital version for email sharing

## Integration with Other Skills

This skill works effectively with:
- **Scientific Schematics**: CRITICAL - Use for generating all poster diagrams and flowcharts
- **Generate Image / Nano Banana Pro**: For stylized graphics, conceptual illustrations, and summary visuals
- **Scientific Writing**: For developing poster content from papers
- **Literature Review**: For contextualizing research
- **Data Analysis**: For creating result figures and charts

**Recommended workflow**: Always use scientific-schematics and generate-image skills BEFORE creating the LaTeX poster to generate all visual elements.

## Common Pitfalls to Avoid

**AI-Generated Graphics Mistakes (MOST COMMON):**
- ❌ Too many elements in one graphic (10+ items) → Keep to 3-5 max
- ❌ Text too small in AI graphics → Specify "GIANT (100pt+)" or "HUGE (150pt+)"
- ❌ Too much detail in prompts → Use "SIMPLE" and "ONLY X elements"
- ❌ No white space specification → Add "50% white space" to every prompt
- ❌ Complex flowcharts with 8+ steps → Limit to 4-5 steps maximum
- ❌ Comparison charts with 6+ items → Limit to 3 items maximum
- ❌ Key findings with 5+ metrics → Show only top 3

**Fixing Overflow in AI Graphics:**
If your AI-generated graphics are overflowing or have small text:
1. Add "SIMPLER" or "ONLY 3 elements" to prompt
2. Increase font sizes: "150pt+" instead of "80pt+"
3. Add "60% white space" instead of "50%"
4. Remove sub-details: "NO sub-steps", "NO axis labels", "NO legend"
5. Regenerate with fewer elements

**Design Mistakes**:
- ❌ Too much text (over 1000 words)
- ❌ Font sizes too small (under 24pt body text)
- ❌ Low-contrast color combinations
- ❌ Cluttered layout with no white space
- ❌ Inconsistent styling across sections
- ❌ Poor quality or pixelated images

**Content Mistakes**:
- ❌ No clear narrative or message
- ❌ Too many research questions or objectives
- ❌ Overuse of jargon without definitions
- ❌ Results without context or interpretation
- ❌ Missing author contact information

**Technical Mistakes**:
- ❌ Wrong poster dimensions for conference requirements
- ❌ RGB colors sent to CMYK printer (color shift)
- ❌ Fonts not embedded in PDF
- ❌ File size too large for submission portal
- ❌ QR codes too small or not tested

**Best Practices**:
- ✅ Generate SIMPLE AI graphics with 3-5 elements max
- ✅ Use GIANT fonts (100pt+) for key numbers in graphics
- ✅ Specify "50% white space" in every AI prompt
- ✅ Follow conference size specifications exactly
- ✅ Test print at reduced scale before final printing
- ✅ Use high-contrast, accessible color schemes
- ✅ Keep text minimal and highly scannable
- ✅ Include clear contact information and QR codes
- ✅ Proofread carefully (errors are magnified on posters!)

## Package Installation

Ensure required LaTeX packages are installed:

```bash
# For TeX Live (Linux/Mac)
tlmgr install beamerposter tikzposter baposter

# For MiKTeX (Windows)
# Packages typically auto-install on first use

# Additional recommended packages
tlmgr install qrcode graphics xcolor tcolorbox subcaption
```

## Scripts and Automation

Helper scripts available in `scripts/` directory:

- `compile_poster.sh`: Automated compilation with error handling
- `generate_template.py`: Interactive template generator
- `resize_images.py`: Batch image optimization for posters
- `poster_checklist.py`: Pre-submission validation tool

## References

Comprehensive reference files for detailed guidance:

- `references/latex_poster_packages.md`: Detailed comparison of beamerposter, tikzposter, and baposter with examples
- `references/poster_layout_design.md`: Layout principles, grid systems, and visual flow
- `references/poster_design_principles.md`: Typography, color theory, visual hierarchy, and accessibility
- `references/poster_content_guide.md`: Content organization, writing style, and section-specific guidance

## Templates

Ready-to-use poster templates in `assets/` directory:

- beamerposter templates (classic, modern, colorful)
- tikzposter templates (default, rays, wave, envelope)
- baposter templates (portrait, landscape, minimal)
- Example posters from various scientific disciplines
- Color scheme definitions and institutional templates

Load these templates and customize for your specific research and conference requirements.

