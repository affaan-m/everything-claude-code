# Research Poster Quality Checklist

Use this comprehensive checklist before printing or presenting your research poster.

## Pre-Compilation Checks

### Content Completeness
- [ ] Title is concise and descriptive (10-15 words)
- [ ] All author names spelled correctly
- [ ] Affiliations complete and accurate
- [ ] Contact email address included
- [ ] All sections present: Introduction, Methods, Results, Conclusions
- [ ] References cited (5-10 key citations)
- [ ] Acknowledgments included (funding, collaborators)
- [ ] No placeholder text remaining (TODO, Lorem ipsum, etc.)

### Visual Content
- [ ] All figures prepared and high resolution (300+ DPI)
- [ ] Figure captions written and descriptive
- [ ] Logos available (university, funding agencies)
- [ ] QR codes generated and tested
- [ ] Icons/graphics sourced (if used)

### LaTeX Configuration
- [ ] Correct paper size specified (A0, A1, 36×48", etc.)
- [ ] Correct orientation (portrait/landscape)
- [ ] Minimal margins configured (5-15mm)
- [ ] Font sizes appropriate (title 72pt+, body 24pt+)
- [ ] Color scheme defined
- [ ] All packages installed and working

## Compilation Checks

### Successful Compilation
- [ ] PDF compiles without errors
- [ ] No critical warnings in .log file
- [ ] All citations resolved (no [?] marks)
- [ ] All cross-references working
- [ ] Bibliography generated correctly (if using BibTeX)

### Warning Review
Run in terminal: `grep -i "warning\|overfull\|underfull" poster.log`

- [ ] No overfull hbox warnings (text too wide)
- [ ] No underfull hbox warnings (excessive spacing)
- [ ] No missing figure warnings
- [ ] No missing font warnings
- [ ] No undefined reference warnings

## PDF Quality Checks

### Automated Checks

Run: `./scripts/review_poster.sh poster.pdf` or manually verify:

#### Page Specifications
```bash
pdfinfo poster.pdf | grep "Page size"
```
- [ ] Page size matches requirements exactly
- [ ] Single page document (not multi-page)
- [ ] Correct orientation

#### Font Embedding
```bash
pdffonts poster.pdf
```
- [ ] All fonts show "yes" in "emb" column
- [ ] No bitmap fonts (should be Type 1 or TrueType)

#### Image Quality
```bash
pdfimages -list poster.pdf
```
- [ ] All images at least 300 DPI
- [ ] No JPEG artifacts in figures
- [ ] Vector graphics used where possible

#### File Size
```bash
ls -lh poster.pdf
```
- [ ] Reasonable size (2-50 MB typical)
- [ ] Not too large for email (<50 MB) if sharing digitally
- [ ] Not suspiciously small (<1 MB - may indicate low quality)

## Visual Inspection (100% Zoom)

### Layout and Spacing
- [ ] Content fills entire page (no excessive white margins)
- [ ] Consistent spacing between columns (1-2cm)
- [ ] Consistent spacing between blocks (1-2cm)
- [ ] All elements aligned to grid
- [ ] No overlapping text or figures
- [ ] White space evenly distributed (30-40% total)
- [ ] Visual balance across poster (no heavy/empty areas)

### Typography
- [ ] Title readable and prominent (72-120pt)
- [ ] Section headers clear (48-72pt)
- [ ] Body text large enough (24-36pt minimum, 30pt+ recommended)
- [ ] Captions readable (18-24pt)
- [ ] No text running off edges
- [ ] Consistent font usage throughout
- [ ] Line spacing adequate (1.2-1.5×)
- [ ] No awkward hyphenation or word breaks
- [ ] All special characters render correctly (Greek, math symbols)

### Visual Elements
- [ ] All figures display correctly
- [ ] No pixelated or blurry images
- [ ] Figure resolution high (zoom to 200% to verify)
- [ ] Figure labels large and clear
- [ ] Graph axes labeled with units
- [ ] Color schemes consistent across figures
- [ ] Legends readable and well-positioned
- [ ] Logos crisp and professional
- [ ] QR codes sharp and high-contrast (minimum 2×2cm)
- [ ] No visual artifacts or rendering errors

### Colors
- [ ] Colors render as intended (not washed out)
- [ ] High contrast between text and background (≥4.5:1)
- [ ] Color scheme harmonious
- [ ] Colors appropriate for printing (not too bright/neon)
- [ ] Institutional colors used correctly
- [ ] Color-blind friendly palette (avoid red-green only)

### Content
- [ ] Title complete and correctly positioned
- [ ] All author names and affiliations visible
- [ ] All sections present and labeled
- [ ] Results section has figures/data
- [ ] Conclusions clearly stated
- [ ] References formatted consistently
- [ ] Contact information clearly visible
- [ ] No missing content

## Reduced-Scale Print Test (CRITICAL)

### Test Print Preparation
Print poster at 25% scale:
- A0 poster → Print on A4 paper
- 36×48" poster → Print on Letter paper
- A1 poster → Print on A5 paper

### Readability from Distance

**From 6 feet (2 meters):**
- [ ] Title clearly readable
- [ ] Authors identifiable
- [ ] Main figures visible

**From 4 feet (1.2 meters):**
- [ ] Section headers readable
- [ ] Figure captions readable
- [ ] Key results visible

**From 2 feet (0.6 meters):**
- [ ] Body text readable
- [ ] References readable
- [ ] All details clear

### Print Quality
- [ ] Colors accurate (match screen expectations)
- [ ] No banding or color shifts
- [ ] Sharp edges (not blurry)
- [ ] Consistent print density
- [ ] No printer artifacts

## Content Proofreading

### Text Accuracy
- [ ] Spell-checked all text
- [ ] Grammar checked
- [ ] All author names spelled correctly
- [ ] All affiliations accurate
- [ ] Email address correct
- [ ] No typos in title or headers

### Scientific Accuracy
- [ ] All numbers and statistics verified
- [ ] Units included and correct
- [ ] Statistical significance correctly indicated
- [ ] Sample sizes (n=) reported
- [ ] Figure numbering consistent
- [ ] Citations accurate and complete
- [ ] Methodology accurately described
- [ ] Results match figures/data
- [ ] Conclusions supported by data

### Consistency
- [ ] Terminology consistent throughout
- [ ] Abbreviations defined at first use
- [ ] Consistent notation (italics for genes, etc.)
- [ ] Consistent units (don't mix metric/imperial)
- [ ] Consistent decimal places
- [ ] Consistent citation format

## Accessibility Checks

### Color Contrast
Test at: https://webaim.org/resources/contrastchecker/

- [ ] Title-background contrast ≥ 7:1
- [ ] Body text-background contrast ≥ 4.5:1
- [ ] All text meets WCAG AA standard minimum

### Color Blindness
Test with simulator: https://www.color-blindness.com/coblis-color-blindness-simulator/

- [ ] Information not lost with deuteranopia (red-green)
- [ ] Key distinctions visible with protanopia
- [ ] Patterns/shapes used in addition to color
- [ ] No critical info conveyed by color alone

### Visual Clarity
- [ ] Clear visual hierarchy (size, weight, position)
- [ ] Logical reading order
- [ ] Grouping of related elements obvious
- [ ] Important info emphasized appropriately

## Peer Review

### 30-Second Test
Show poster to colleague for 30 seconds, then ask:
- [ ] They can identify the research topic
- [ ] They can state the main finding
- [ ] They remember the key figure

### 5-Minute Review
Ask colleague to read poster (5 minutes), then ask:
- [ ] They understand the research question
- [ ] They can explain the approach
- [ ] They can summarize the conclusions
- [ ] They identify what makes it novel/important

### Feedback
- [ ] Noted any confusing elements
- [ ] Identified any unclear figures
- [ ] Checked for jargon that needs definition
- [ ] Verified logical flow

## Pre-Printing Final Checks

### Technical Specifications
- [ ] PDF size exactly matches conference requirements
- [ ] Orientation correct (portrait vs landscape)
- [ ] All fonts embedded (verified with pdffonts)
- [ ] Color space correct (RGB for screen, CMYK if printer requires)
- [ ] Resolution adequate (300+ DPI for all images)
- [ ] Bleed area added if required (typically 3-5mm)
- [ ] Crop marks visible if required
- [ ] File naming convention followed

### Printer Communication
- [ ] Confirmed paper type (matte vs glossy)
- [ ] Confirmed poster size
- [ ] Provided color profile if required
- [ ] Verified delivery deadline
- [ ] Confirmed shipping/pickup arrangements
- [ ] Discussed backup plan if issues arise

### Backup and Storage
- [ ] PDF saved with clear filename: `LastName_Conference_Poster.pdf`
- [ ] Source .tex file backed up
- [ ] All figure files backed up
- [ ] Copy saved to cloud storage
- [ ] Copy saved on USB drive for conference
- [ ] Digital version ready to email if requested

## Digital Presentation Checks

If presenting digitally or sharing online:

### File Optimization
- [ ] PDF compressed if >10MB (for email)
- [ ] Test opens in Adobe Reader
- [ ] Test opens in Preview (Mac)
- [ ] Test opens in browser PDF viewers
- [ ] Test on mobile devices

### Interactive Elements
- [ ] All QR codes tested and functional
- [ ] QR codes link to correct URLs
- [ ] Hyperlinks work (if included)
- [ ] Links open in new tabs/windows appropriately

### Alternative Formats
- [ ] PNG version created for social media (if needed)
- [ ] Thumbnail image created
- [ ] Poster description/abstract prepared
- [ ] Hashtags and social media text ready

## Conference-Specific

### Requirements Verification
- [ ] Poster size matches conference specifications exactly
- [ ] Orientation matches requirements
- [ ] File format correct (usually PDF)
- [ ] Submission deadline met
- [ ] File naming convention followed
- [ ] Abstract/description submitted if required

### Physical Preparation
- [ ] Poster printed and inspected
- [ ] Backup printed copy prepared
- [ ] Push pins/mounting materials ready
- [ ] Poster tube or flat portfolio for transport
- [ ] Business cards/handouts prepared
- [ ] Digital backup on laptop/phone

### Presentation Preparation
- [ ] 30-second elevator pitch prepared
- [ ] 2-minute summary prepared
- [ ] 5-minute detailed explanation prepared
- [ ] Anticipated questions considered
- [ ] Follow-up materials ready (QR code to paper, etc.)

## Final Sign-Off

Date: ________________

Poster Title: _______________________________________________

Conference: _______________________________________________

Reviewed by: _______________________________________________

All critical items checked: [ ]

Ready for printing: [ ]

Ready for presentation: [ ]

Notes/Issues to address:
_________________________________________________________
_________________________________________________________
_________________________________________________________

---

## Quick Reference: Common Issues

| Issue | Quick Fix |
|-------|-----------|
| Large white margins | Reduce margin in documentclass: `margin=5mm` |
| Text too small | Increase scale: `scale=1.5` in beamerposter |
| Blurry figures | Use vector graphics (PDF) or higher resolution (600+ DPI) |
| Colors wrong | Check RGB vs CMYK, test print before final |
| Fonts not embedded | Compile with: `pdflatex -dEmbedAllFonts=true` |
| Content cut off | Check total width: columns + spacing + margins = pagewidth |
| QR codes don't scan | Increase size (min 2×2cm), ensure high contrast |
| File too large | Compress: `gs -sDEVICE=pdfwrite -dPDFSETTINGS=/printer ...` |

## Checklist Version
Version 1.0 - For use with LaTeX poster packages (beamerposter, tikzposter, baposter)

