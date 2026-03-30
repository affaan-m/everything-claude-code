# LaTeX Research Poster Generation Skill

Create professional, publication-ready research posters for conferences and academic presentations using LaTeX.

## Overview

This skill provides comprehensive guidance for creating research posters with three major LaTeX packages:
- **beamerposter**: Traditional academic posters, familiar Beamer syntax
- **tikzposter**: Modern, colorful designs with TikZ integration
- **baposter**: Structured multi-column layouts with automatic positioning

## Quick Start

### 1. Choose a Template

Browse templates in `assets/`:
- `beamerposter_template.tex` - Classic academic style
- `tikzposter_template.tex` - Modern, colorful design
- `baposter_template.tex` - Structured multi-column layout

### 2. Customize Content

Edit the template with your research:
- Title, authors, affiliations
- Introduction, methods, results, conclusions
- Replace placeholder figures with your images
- Update references and acknowledgments

### 3. Configure for Full Page

Posters should span the entire page with minimal margins:

```latex
% beamerposter - full page setup
\documentclass[final,t]{beamer}
\usepackage[size=a0,scale=1.4,orientation=portrait]{beamerposter}
\setbeamersize{text margin left=5mm, text margin right=5mm}
\usepackage[margin=10mm]{geometry}

% tikzposter - full page setup
\documentclass[25pt,a0paper,portrait,margin=10mm,innermargin=15mm]{tikzposter}

% baposter - full page setup
\documentclass[a0paper,portrait,fontscale=0.285]{baposter}
```

### 4. Compile

```bash
pdflatex poster.tex

# Or for better font support:
lualatex poster.tex
xelatex poster.tex
```

### 5. Review PDF Quality

**Essential before printing!**

```bash
# Run automated checks
./scripts/review_poster.sh poster.pdf

# Manual verification (see checklist below)
```

## Key Features

### Full Page Coverage

All templates configured to maximize content area:
- Minimal outer margins (5-15mm)
- Optimal spacing between columns (15-20mm)
- Proper block padding for readability
- No wasted white space

### PDF Quality Control

**Automated Checks** (`review_poster.sh`):
- Page size verification
- Font embedding check
- Image resolution analysis
- File size optimization

**Manual Verification** (`assets/poster_quality_checklist.md`):
- Visual inspection at 100% zoom
- Reduced-scale print test (25%)
- Typography and spacing review
- Content completeness check

### Design Principles

All templates follow evidence-based poster design:
- **Typography**: 72pt+ title, 48-72pt headers, 24-36pt body text
- **Color**: High contrast (≥4.5:1), color-blind friendly palettes
- **Layout**: Clear visual hierarchy, logical flow
- **Content**: 300-800 words maximum, 40-50% visual content

## Common Poster Sizes

Templates support all standard sizes:

| Size | Dimensions | Configuration |
|------|------------|---------------|
| A0 | 841 × 1189 mm | `size=a0` or `a0paper` |
| A1 | 594 × 841 mm | `size=a1` or `a1paper` |
| 36×48" | 914 × 1219 mm | Custom page size |
| 42×56" | 1067 × 1422 mm | Custom page size |

## Documentation

### Reference Guides

**Comprehensive Documentation** (in `references/`):

1. **`latex_poster_packages.md`** (746 lines)
   - Detailed comparison of beamerposter, tikzposter, baposter
   - Package-specific syntax and examples
   - Strengths, limitations, best use cases
   - Theme and color customization
   - Compilation tips and troubleshooting

2. **`poster_design_principles.md`** (807 lines)
   - Visual hierarchy and white space
   - Typography: font selection, sizing, readability
   - Color theory: schemes, contrast, accessibility
   - Color-blind friendly palettes
   - Icons, graphics, and visual elements
   - Common design mistakes to avoid

3. **`poster_layout_design.md`** (650+ lines)
   - Grid systems (2, 3, 4-column layouts)
   - Visual flow and reading patterns
   - Spatial organization strategies
   - White space management
   - Block and box design
   - Layout patterns by research type

4. **`poster_content_guide.md`** (900+ lines)
   - Content strategy (3-5 minute rule)
   - Word budgets by section
   - Visual-to-text ratio (40-50% visual)
   - Section-specific writing guidance
   - Figure integration and captions
   - From paper to poster adaptation

### Tools and Assets

**Scripts** (in `scripts/`):
- `review_poster.sh`: Automated PDF quality check
  - Page size verification
  - Font embedding check
  - Image resolution analysis
  - File size assessment

**Checklists** (in `assets/`):
- `poster_quality_checklist.md`: Comprehensive pre-printing checklist
  - Pre-compilation checks
  - PDF quality verification
  - Visual inspection items
  - Accessibility checks
  - Peer review guidelines
  - Final printing checklist

**Templates** (in `assets/`):
- `beamerposter_template.tex`: Full working template
- `tikzposter_template.tex`: Full working template
- `baposter_template.tex`: Full working template

## Workflow

### Recommended Poster Creation Process

**1. Planning** (before LaTeX)
- Determine conference requirements (size, orientation)
- Identify 3-5 key results to highlight
- Create figures (300+ DPI)
- Draft 300-800 word content outline

**2. Template Selection**
- Choose package based on needs:
  - **beamerposter**: Traditional conferences, institutional branding
  - **tikzposter**: Modern conferences, creative fields
  - **baposter**: Multi-section posters, structured layouts

**3. Content Integration**
- Copy template and customize
- Replace placeholder text
- Add figures and ensure high resolution
- Configure colors to match branding

**4. Compilation & Review**
- Compile to PDF
- Run `review_poster.sh` for automated checks
- Review visually at 100% zoom
- Check against `poster_quality_checklist.md`

**5. Test Print**
- **Critical step!** Print at 25% scale
- A0 → A4 paper, 36×48" → Letter paper
- View from 2-3 feet (simulates 8-12 feet for full poster)
- Verify readability and colors

**6. Revisions**
- Fix any issues identified
- Proofread carefully (errors are magnified!)
- Get colleague feedback
- Final compilation

**7. Printing**
- Verify page size: `pdfinfo poster.pdf`
- Check fonts embedded: `pdffonts poster.pdf`
- Send to professional printer 2-3 days before deadline
- Keep backup copy

## Troubleshooting

### Large White Margins

**Problem**: Excessive white space around poster edges

**Solution**:
```latex
% beamerposter
\setbeamersize{text margin left=5mm, text margin right=5mm}
\usepackage[margin=10mm]{geometry}

% tikzposter
\documentclass[..., margin=5mm, innermargin=10mm]{tikzposter}

% baposter
\documentclass[a0paper, margin=5mm]{baposter}
```

### Content Cut Off

**Problem**: Text or figures extending beyond page

**Solution**:
- Check total width: columns + spacing + margins = pagewidth
- Reduce column widths or spacing
- Debug with visible page boundary:
```latex
\usepackage{eso-pic}
\AddToShipoutPictureBG{
  \AtPageLowerLeft{
    \put(0,0){\framebox(\LenToUnit{\paperwidth},\LenToUnit{\paperheight}){}}
  }
}
```

### Blurry Images

**Problem**: Pixelated or low-quality figures

**Solution**:
- Use vector graphics (PDF, SVG) when possible
- Raster images: minimum 300 DPI at final print size
- For A0 width (33.1"): 300 DPI = 9930 pixels minimum
- Check with: `pdfimages -list poster.pdf`

### Fonts Not Embedded

**Problem**: Printer rejects PDF due to missing fonts

**Solution**:
```bash
# Recompile with embedded fonts
pdflatex -dEmbedAllFonts=true poster.tex

# Verify embedding
pdffonts poster.pdf
# All fonts should show "yes" in "emb" column
```

### File Too Large

**Problem**: PDF exceeds email size limit (>50MB)

**Solution**:
```bash
# Compress for digital sharing
gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 \
   -dPDFSETTINGS=/printer -dNOPAUSE -dQUIET -dBATCH \
   -sOutputFile=poster_compressed.pdf poster.pdf

# Keep original uncompressed version for printing
```

## Common Mistakes to Avoid

### Content
- ❌ Too much text (>1000 words)
- ❌ Font sizes too small (<24pt body text)
- ❌ No clear main message
- ✅ 300-800 words, 30pt+ body text, 1-3 key findings

### Design
- ❌ Poor color contrast (<4.5:1)
- ❌ Red-green color combinations (color-blind issue)
- ❌ Cluttered layout with no white space
- ✅ High contrast, accessible colors, generous spacing

### Technical
- ❌ Wrong poster dimensions
- ❌ Low resolution images (<300 DPI)
- ❌ Fonts not embedded
- ✅ Verify specs, high-res images, embedded fonts

## Package Comparison

Quick reference for choosing the right package:

| Feature | beamerposter | tikzposter | baposter |
|---------|--------------|------------|----------|
| **Learning Curve** | Easy (Beamer users) | Moderate | Moderate |
| **Aesthetics** | Traditional | Modern | Professional |
| **Customization** | Moderate | High (TikZ) | Structured |
| **Compilation Speed** | Fast | Slower | Fast-Medium |
| **Best For** | Academic conferences | Creative designs | Multi-column layouts |

**Recommendation**:
- First-time poster makers: **beamerposter** (familiar, simple)
- Modern conferences: **tikzposter** (beautiful, flexible)
- Complex layouts: **baposter** (automatic positioning)

## Example Usage

### In Scientific Writer CLI

```
> Create a research poster for NeurIPS conference on transformer attention

The assistant will:
1. Ask about poster size and orientation
2. Generate complete LaTeX poster with your content
3. Configure for full page coverage
4. Provide compilation instructions
5. Run quality checks on generated PDF
```

### Manual Creation

```bash
# 1. Copy template
cp assets/tikzposter_template.tex my_poster.tex

# 2. Edit content
vim my_poster.tex

# 3. Compile
pdflatex my_poster.tex

# 4. Review
./scripts/review_poster.sh my_poster.pdf

# 5. Test print at 25% scale
# (A0 on A4 paper)

# 6. Final printing
```

## Tips for Success

### Content Strategy
1. **One main message**: What's the one thing viewers should remember?
2. **3-5 key figures**: Visual content dominates
3. **300-800 words**: Less is more
4. **Bullet points**: More scannable than paragraphs

### Design Strategy
1. **High contrast**: Dark on light or light on dark
2. **Large fonts**: 30pt+ body text for readability from distance
3. **White space**: 30-40% of poster should be empty
4. **Visual hierarchy**: Vary sizes significantly (title 3× body text)

### Technical Strategy
1. **Test early**: Print at 25% scale before final printing
2. **Vector graphics**: Use PDF/SVG when possible
3. **Verify specs**: Check page size, fonts, resolution
4. **Get feedback**: Ask colleague to review before printing

## Additional Resources

### Online Tools
- **Color contrast checker**: https://webaim.org/resources/contrastchecker/
- **Color blindness simulator**: https://www.color-blindness.com/coblis-color-blindness-simulator/
- **Color palette generator**: https://coolors.co/

### LaTeX Packages
- `beamerposter`: Extends Beamer for poster-sized documents
- `tikzposter`: Modern poster creation with TikZ
- `baposter`: Box-based automatic poster layout
- `qrcode`: Generate QR codes in LaTeX
- `graphicx`: Include images
- `tcolorbox`: Colored boxes and frames

### Further Reading
- All reference documents in `references/` directory
- Quality checklist in `assets/poster_quality_checklist.md`
- Package comparison in `references/latex_poster_packages.md`

## Support

For issues or questions:
- Review reference documentation in `references/`
- Check troubleshooting section above
- Run automated review: `./scripts/review_poster.sh`
- Use quality checklist: `assets/poster_quality_checklist.md`

## Version

LaTeX Poster Skill v1.0
Compatible with: beamerposter, tikzposter, baposter
Last updated: January 2025

