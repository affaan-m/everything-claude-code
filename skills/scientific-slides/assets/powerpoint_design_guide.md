# PowerPoint Design Guide for Scientific Presentations

## Overview

This guide provides comprehensive instructions for creating professional scientific presentations using PowerPoint, with emphasis on integration with the pptx skill for programmatic creation and best practices for scientific content.

**CRITICAL**: Avoid dry, text-heavy presentations. Scientific slides should be:
- **Visually engaging**: High-quality images, figures, diagrams on EVERY slide
- **Research-backed**: Citations from research-lookup for credibility (8-15 papers minimum)
- **Modern design**: Contemporary color palettes, not default themes
- **Minimal text**: 3-4 bullets with 4-6 words each, visuals do the talking
- **Professional polish**: Consistent but varied layouts, generous white space

**Anti-Pattern Warning**: All-bullet-point slides with black text on white background = instant boredom and forgotten science.

## Using the PPTX Skill

### Reference

For complete technical documentation on PowerPoint creation, refer to:
- **Main documentation**: `document-skills/pptx/SKILL.md`
- **HTML to PowerPoint workflow**: Detailed in `pptx/html2pptx.md`
- **OOXML editing**: For advanced editing in `pptx/ooxml.md`

### Two Approaches to PowerPoint Creation

#### 1. Programmatic Creation (html2pptx)

**Best for**: Creating presentations from scratch with custom designs and data visualizations.

**Workflow**:
1. Read `document-skills/pptx/SKILL.md` completely
2. Design slides in HTML with proper dimensions (720pt × 405pt for 16:9)
3. Create JavaScript file using `html2pptx()` function
4. Add charts and tables using PptxGenJS API
5. Generate thumbnails and validate visually
6. Iterate based on visual inspection

**Example Structure**:
```javascript
const pptx = new PptxGenJS();

// Add title slide
const slide1 = pptx.addSlide();
slide1.addText("Your Title", {
  x: 1, y: 2, w: 8, h: 1,
  fontSize: 44, bold: true, align: "center"
});

// Add content slide with figure
const slide2 = pptx.addSlide();
slide2.addText("Results", { x: 0.5, y: 0.5, fontSize: 32 });
slide2.addImage({ path: "figure.png", x: 1, y: 1.5, w: 8, h: 4 });

pptx.writeFile({ fileName: "presentation.pptx" });
```

#### 2. Template-Based Creation

**Best for**: Using existing PowerPoint templates or editing existing presentations.

**Workflow**:
1. Start with template.pptx
2. Use `scripts/rearrange.py` to duplicate/reorder slides
3. Use `scripts/inventory.py` to extract text
4. Generate replacement text JSON
5. Use `scripts/replace.py` to update content
6. Validate with thumbnail grids

**Key Scripts**:
- `rearrange.py`: Duplicate and reorder slides
- `inventory.py`: Extract all text shapes
- `replace.py`: Apply text replacements
- `thumbnail.py`: Visual validation

## Design Principles for Scientific Presentations

### 1. Layout and Structure

**Slide Master Setup**:
- Create consistent master slides
- Define 4-5 layout types (title, content, figure, two-column, closing)
- Set default fonts, colors, and spacing
- Include placeholders for logos and footers

**Standard Layouts**:

**Title Slide**:
```
┌─────────────────────────┐
│                         │
│   Presentation Title    │
│   Your Name             │
│   Institution           │
│   Date / Conference     │
│                         │
└─────────────────────────┘
```

**Content Slide**:
```
┌─────────────────────────┐
│ Slide Title             │
├─────────────────────────┤
│ • Bullet point 1        │
│ • Bullet point 2        │
│ • Bullet point 3        │
│                         │
│ [Optional figure]       │
└─────────────────────────┘
```

**Two-Column Slide**:
```
┌─────────────────────────┐
│ Slide Title             │
├───────────┬─────────────┤
│           │             │
│  Text     │   Figure    │
│  Content  │   or        │
│           │   Data      │
└───────────┴─────────────┘
```

**Full-Figure Slide**:
```
┌─────────────────────────┐
│ Figure Title (small)    │
├─────────────────────────┤
│                         │
│    Large Figure or      │
│    Visualization        │
│                         │
└─────────────────────────┘
```

### 2. Typography

**Font Selection**:
- **Primary**: Sans-serif (Arial, Calibri, Helvetica)
- **Alternative**: Verdana, Tahoma, Trebuchet MS
- **Avoid**: Serif fonts (harder to read on screens), decorative fonts

**Font Sizes**:
- Title slide title: 44-54pt
- Slide titles: 32-40pt
- Body text: 24-28pt (minimum 18pt)
- Captions: 16-20pt
- Footer: 10-12pt

**Text Formatting**:
- **Bold**: For emphasis (use sparingly)
- **Color**: For highlighting (consistent meaning)
- **Size**: For hierarchy
- **Alignment**: Left for body, center for titles

**The 6×6 Rule**:
- Maximum 6 bullet points per slide
- Maximum 6 words per bullet
- Better: 3-4 bullets with 4-8 words each

### 3. Color Schemes

**Selecting Colors**:

Consider your subject matter and audience:
- **Academic/Professional**: Navy blue, gray, white with minimal accent
- **Biomedical**: Blue and green tones (avoid red-green combinations)
- **Technology**: Modern colors (teal, orange, purple)
- **Clinical**: Conservative (blue, gray, subdued greens)

**Example Palettes**:

**Classic Scientific**:
- Background: White (#FFFFFF)
- Title: Navy (#1C3D5A)
- Text: Dark gray (#2D3748)
- Accent: Orange (#E67E22)

**Modern Research**:
- Background: Light gray (#F7FAFC)
- Title: Teal (#0A9396)
- Text: Charcoal (#2C2C2C)
- Accent: Coral (#EE6C4D)

**High Contrast** (for large venues):
- Background: White (#FFFFFF)
- Title: Black (#000000)
- Text: Dark gray (#1A1A1A)
- Accent: Bright blue (#0066CC)

**Accessibility Guidelines**:
- Minimum contrast ratio: 4.5:1 (body text)
- Preferred contrast ratio: 7:1 (AAA standard)
- Avoid red-green combinations (8% of men are color-blind)
- Use patterns or shapes in addition to color for data

### 4. Visual Elements

**Figures and Images**:
- **Resolution**: Minimum 300 DPI for print, 150 DPI for projection
- **Format**: PNG for screenshots, PDF/SVG for vector graphics
- **Size**: Large enough to be readable from back of room
- **Placement**: Center or use two-column layout

**Data Visualizations**:
- **Simplify** from journal figures (fewer panels, larger text)
- **Font sizes**: 18-24pt for axis labels
- **Line widths**: 2-4pt thickness
- **Colors**: High contrast, color-blind safe
- **Labels**: Direct labeling preferred over legends

**Icons and Shapes**:
- Use for visual interest and organization
- Consistent style (all outline or all filled)
- Size appropriately (not too large or small)
- Limit colors (match theme)

### 5. Animations and Transitions

**When to Use**:
- ✅ Progressive disclosure of bullet points
- ✅ Building complex figures incrementally
- ✅ Emphasizing key findings
- ✅ Showing process steps

**When to Avoid**:
- ❌ Decoration or entertainment
- ❌ Every single slide
- ❌ Distracting effects (fly in, bounce, spin)

**Recommended Animations**:
- **Appear**: Clean, professional
- **Fade**: Subtle transition
- **Wipe**: Directional reveal
- **Duration**: Fast (0.2-0.3 seconds)
- **Trigger**: On click (not automatic)

**Slide Transitions**:
- Use consistent transition throughout (or none)
- Recommended: None, Fade, or Push
- Avoid: 3D rotations, complex effects
- Duration: Very fast (0.3-0.5 seconds)

## Creating Presentations with PPTX Skill

### Design-First Workflow

**Step 0: Choose Modern Color Palette Based on Topic**

**CRITICAL**: Select colors that reflect your subject matter, not generic defaults.

**Topic-Based Palette Examples:**
- **Biotechnology/Life Sciences**: Teal (#0A9396), Coral (#EE6C4D), Cream (#F4F1DE)
- **Neuroscience/Brain Research**: Deep Purple (#722880), Magenta (#D72D51), White
- **Machine Learning/AI**: Bold Red (#E74C3C), Orange (#F39C12), Dark Gray (#2C2C2C)
- **Physics/Engineering**: Navy (#1C3D5A), Orange (#E67E22), Light Gray (#F7FAFC)
- **Medicine/Healthcare**: Teal (#5EA8A7), Coral (#FE4447), White (#FFFFFF)
- **Environmental Science**: Sage (#87A96B), Terracotta (#E07A5F), Cream (#F4F1DE)

See full palette options in pptx skill SKILL.md (lines 76-94).

**Step 1: Plan Design System** (With Modern Palette)
```javascript
// Define design constants with MODERN colors (not defaults)
const DESIGN = {
  colors: {
    primary: "0A9396",    // Teal (modern, engaging)
    accent: "EE6C4D",     // Coral (attention-grabbing)
    text: "2C2C2C",       // Charcoal (readable)
    background: "FFFFFF"  // White (clean)
  },
  fonts: {
    title: { size: 40, bold: true, face: "Arial" },
    heading: { size: 28, bold: true, face: "Arial" },
    body: { size: 24, face: "Arial" },
    caption: { size: 16, face: "Arial" }
  },
  layout: {
    margin: 0.5,
    titleY: 0.5,
    contentY: 1.5
  }
};
```

**Step 2: Create Reusable Functions**
```javascript
function addTitleSlide(pptx, title, subtitle, author) {
  const slide = pptx.addSlide();
  slide.background = { color: DESIGN.colors.primary };
  
  slide.addText(title, {
    x: 1, y: 2, w: 8, h: 1,
    fontSize: 44, bold: true, color: "FFFFFF",
    align: "center"
  });
  
  slide.addText(subtitle, {
    x: 1, y: 3.2, w: 8, h: 0.5,
    fontSize: 24, color: "FFFFFF",
    align: "center"
  });
  
  slide.addText(author, {
    x: 1, y: 4, w: 8, h: 0.4,
    fontSize: 18, color: "FFFFFF",
    align: "center"
  });
  
  return slide;
}

function addContentSlide(pptx, title, bullets) {
  const slide = pptx.addSlide();
  
  slide.addText(title, {
    x: DESIGN.layout.margin,
    y: DESIGN.layout.titleY,
    w: 9,
    h: 0.5,
    ...DESIGN.fonts.heading,
    color: DESIGN.colors.primary
  });
  
  slide.addText(bullets, {
    x: DESIGN.layout.margin,
    y: DESIGN.layout.contentY,
    w: 9,
    h: 3,
    ...DESIGN.fonts.body,
    bullet: true
  });
  
  return slide;
}
```

**Step 3: Build Presentation** (Visual-First Approach)
```javascript
const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_16x9";

// Title slide with background image or color block
const titleSlide = pptx.addSlide();
titleSlide.background = { color: DESIGN.colors.primary }; // Bold color background
addTitleSlide(
  pptx,
  "Research Title",
  "Subtitle or Conference Name",
  "Your Name • Institution • Date"
);

// Introduction with image/icon
const introSlide = pptx.addSlide();
introSlide.addImage({
  path: "concept_image.png",  // Visual representation of concept
  x: 5, y: 1.5, w: 4, h: 3
});
introSlide.addText("Background", { x: 0.5, y: 0.5, fontSize: 36, bold: true });
introSlide.addText([
  "Key context point 1 (AuthorA, 2023)",
  "Key context point 2 (AuthorB, 2022)",
  "Research gap identified (AuthorC, 2021)"
], {
  x: 0.5, y: 1.5, w: 4, h: 2,
  fontSize: 24, bullet: true
});

// Results slide - FIGURE DOMINATES
const resultsSlide = pptx.addSlide();
resultsSlide.addText("Main Finding", { x: 0.5, y: 0.5, fontSize: 32, bold: true });
resultsSlide.addImage({
  path: "results_figure.png",  // Large, clear figure
  x: 0.5, y: 1.5, w: 9, h: 4   // Nearly full slide
});
// Minimal text annotation only
resultsSlide.addText("34% improvement (p < 0.001)", {
  x: 7, y: 1, fontSize: 20, color: DESIGN.colors.accent, bold: true
});

// Save
pptx.writeFile({ fileName: "presentation.pptx" });
```

**Key Changes from Dry Presentations:**
- Title slide uses bold background color (not plain white)
- Introduction includes relevant image (not just bullets)
- Results slide is figure-dominated (not text-dominated)
- Citations included in bullets for research context
- Text is minimal and supporting, visuals are primary

### Adding Scientific Content

**Equations** (as images):
```javascript
// Render equation as PNG first (using LaTeX or online tool)
// Then add to slide
slide.addImage({
  path: "equation.png",
  x: 2, y: 3, w: 6, h: 1
});
```

**Tables**:
```javascript
slide.addTable([
  [
    { text: "Method", options: { bold: true } },
    { text: "Accuracy", options: { bold: true } },
    { text: "Time (s)", options: { bold: true } }
  ],
  ["Method A", "0.85", "10"],
  ["Method B", "0.92", "25"],
  ["Method C", "0.88", "15"]
], {
  x: 2, y: 2, w: 6,
  fontSize: 20,
  border: { pt: 1, color: "888888" },
  fill: { color: "F5F5F5" }
});
```

**Charts**:
```javascript
// Bar chart
slide.addChart(pptx.ChartType.bar, [
  {
    name: "Control",
    labels: ["Metric 1", "Metric 2", "Metric 3"],
    values: [45, 67, 82]
  },
  {
    name: "Treatment",
    labels: ["Metric 1", "Metric 2", "Metric 3"],
    values: [52, 78, 91]
  }
], {
  x: 1, y: 1.5, w: 8, h: 4,
  chartColors: [DESIGN.colors.primary, DESIGN.colors.accent],
  showTitle: false,
  showLegend: true,
  fontSize: 18
});
```

## Visual Validation Workflow

### Generate Thumbnails

After creating presentation:

```bash
# Create thumbnail grid for quick review
python scripts/thumbnail.py presentation.pptx review/thumbnails --cols 4

# Or for individual slides
python scripts/thumbnail.py presentation.pptx review/slide
```

### Inspection Checklist

For each slide, check:
- [ ] Text readable (not cut off or too small)
- [ ] No element overlap
- [ ] Consistent colors and fonts
- [ ] Adequate white space
- [ ] Figures clear and properly sized
- [ ] Alignment correct

### Common Issues

**Text Overflow**:
- Reduce font size or text length
- Increase text box size
- Split into multiple slides

**Element Overlap**:
- Use two-column layout
- Reduce element sizes
- Adjust positioning

**Poor Contrast**:
- Choose higher contrast colors
- Use dark text on light background
- Test with contrast checker

## Templates and Examples

### Starting from Template

If you have an existing template:

1. **Extract template structure**:
```bash
python scripts/inventory.py template.pptx inventory.json
```

2. **Create thumbnail grid**:
```bash
python scripts/thumbnail.py template.pptx template_review
```

3. **Analyze layouts** and document which slides to use

4. **Rearrange slides**:
```bash
python scripts/rearrange.py template.pptx working.pptx 0,5,5,12,18,22
```

5. **Replace content**:
```bash
python scripts/replace.py working.pptx replacements.json output.pptx
```

## Best Practices Summary

### Do's (Make Presentations Engaging)

- ✅ Use research-lookup to find 8-15 papers for citations
- ✅ Add HIGH-QUALITY visuals to EVERY slide (figures, images, diagrams, icons)
- ✅ Choose MODERN color palette reflecting your topic (not defaults)
- ✅ Keep text MINIMAL (3-4 bullets, 4-6 words each)
- ✅ Use LARGE fonts (24-28pt body, 36-44pt titles)
- ✅ Vary slide layouts (full-figure, two-column, visual overlays)
- ✅ Maintain high contrast (7:1 preferred)
- ✅ Generous white space (40-50% of slide)
- ✅ Cite papers in intro and discussion (establish credibility)
- ✅ Test readability from distance
- ✅ Validate visually before presenting

### Don'ts (Avoid Dry Presentations)

- ❌ Don't create text-only slides (add visuals to EVERY slide)
- ❌ Don't use default themes unchanged (customize for your topic)
- ❌ Don't have all bullet-point slides (vary layouts)
- ❌ Don't skip research-lookup (presentations need citations too)
- ❌ Don't cram too much text on one slide
- ❌ Don't use tiny fonts (<24pt for body)
- ❌ Don't rely solely on color
- ❌ Don't use complex animations
- ❌ Don't mix too many font styles
- ❌ Don't ignore accessibility
- ❌ Don't skip visual validation

## Accessibility Considerations

**Color Contrast**:
- Use WebAIM contrast checker
- Minimum 4.5:1 for normal text
- Preferred 7:1 for optimal readability

**Color Blindness**:
- Test with Coblis simulator
- Use patterns/shapes with colors
- Avoid red-green combinations

**Readability**:
- Sans-serif fonts only
- Minimum 18pt, prefer 24pt+
- Clear visual hierarchy
- Adequate spacing

## Integration with Other Skills

**With Scientific Writing**:
- Convert paper content to slides
- Simplify dense text
- Extract key findings
- Create visual abstracts

**With Data Visualization**:
- Simplify journal figures
- Recreate with larger labels
- Use progressive disclosure
- Emphasize key results

**With Research Lookup**:
- Find relevant papers
- Extract key citations
- Build background context
- Support claims with evidence

## Resources

**PowerPoint Tutorials**:
- Microsoft PowerPoint documentation
- PowerPoint design templates
- Scientific presentation examples

**Design Tools**:
- Color palette generators (Coolors.co)
- Contrast checkers (WebAIM)
- Icon libraries (Noun Project)
- Image editing (PowerPoint built-in, external tools)

**PPTX Skill Documentation**:
- `document-skills/pptx/SKILL.md`: Main documentation
- `document-skills/pptx/html2pptx.md`: HTML to PPTX workflow
- `document-skills/pptx/ooxml.md`: Advanced editing
- `document-skills/pptx/scripts/`: Utility scripts

## Quick Reference

### Common Slide Dimensions

- **16:9 aspect ratio**: 10" × 5.625" (720pt × 405pt)
- **4:3 aspect ratio**: 10" × 7.5" (720pt × 540pt)

### Measurement Units

- PowerPoint uses inches
- 72 points = 1 inch
- Position (x, y) from top-left corner
- Size (w, h) for width and height

### Font Size Guidelines

| Element | Minimum | Recommended |
|---------|---------|-------------|
| Title slide | 40pt | 44-54pt |
| Slide title | 28pt | 32-40pt |
| Body text | 18pt | 24-28pt |
| Caption | 14pt | 16-20pt |
| Footer | 10pt | 10-12pt |

### Color Usage

- **Backgrounds**: White or very light colors
- **Text**: Dark (black/dark gray) on light, or white on dark
- **Accents**: One or two accent colors max
- **Data**: Color-blind safe palettes (blue/orange)

## Troubleshooting

**Problem**: Text appears cut off
- **Solution**: Increase text box size or reduce font size

**Problem**: Figures are blurry
- **Solution**: Use higher resolution images (300 DPI)

**Problem**: Colors look different when projected
- **Solution**: Test with projector beforehand, use high contrast

**Problem**: File size too large
- **Solution**: Compress images, reduce image resolution

**Problem**: Animations not working
- **Solution**: Check PowerPoint version compatibility

## Conclusion

Effective PowerPoint presentations for science require:
1. Clear, simple design
2. Readable text (24pt+ body)
3. High-quality figures
4. Consistent formatting
5. Visual validation
6. Accessibility considerations

Use the pptx skill for programmatic creation and the visual review workflow to ensure professional quality before presenting.

