# Publication-Ready Figure Guidelines

## Core Principles

Scientific figures must be clear, accurate, and accessible. Publication-ready figures follow these fundamental principles:

1. **Clarity**: Information should be immediately understandable
2. **Accuracy**: Data representation must be truthful and unmanipulated
3. **Accessibility**: Figures should be interpretable by all readers, including those with visual impairments
4. **Professional**: Clean, polished appearance suitable for peer-reviewed journals

## Resolution and File Format

### Resolution Requirements
- **Raster images (photos, microscopy)**: 300-600 DPI at final print size
- **Line art and graphs**: 600-1200 DPI (or vector format)
- **Combined figures**: 300-600 DPI

### File Formats
- **Vector formats (preferred for graphs/plots)**: PDF, EPS, SVG
  - Infinitely scalable without quality loss
  - Smaller file sizes for line art
  - Best for: plots, diagrams, schematics

- **Raster formats**: TIFF, PNG (never JPEG for scientific data)
  - Use for: photographs, microscopy, images with continuous tone
  - TIFF: Lossless, widely accepted
  - PNG: Lossless, good for web and supplementary materials
  - **Never use JPEG**: Lossy compression introduces artifacts

### Size Specifications
- **Single column**: 85-90 mm (3.35-3.54 inches) width
- **1.5 column**: 114-120 mm (4.49-4.72 inches) width
- **Double column**: 174-180 mm (6.85-7.08 inches) width
- **Maximum height**: Usually 230-240 mm (9-9.5 inches)

## Typography

### Font Guidelines
- **Font family**: Sans-serif fonts (Arial, Helvetica, Calibri) for most journals
  - Some journals prefer specific fonts (check guidelines)
  - Consistency across all figures in manuscript

- **Font sizes at final print size**:
  - Axis labels: 7-9 pt minimum
  - Tick labels: 6-8 pt minimum
  - Legends: 6-8 pt
  - Panel labels (A, B, C): 8-12 pt, bold
  - Title: Generally avoided in multi-panel figures

- **Font weight**: Regular weight for most text; bold for panel labels only

### Text Best Practices
- Use sentence case for axis labels ("Time (hours)" not "TIME (HOURS)")
- Include units in parentheses
- Avoid abbreviations unless space-constrained (define in caption)
- No text smaller than 5-6 pt at final size

## Color Usage

### Color Selection Principles
1. **Colorblind-friendly**: ~8% of males have color vision deficiency
   - Avoid red/green combinations
   - Use blue/orange, blue/yellow, or add texture/pattern
   - Test with colorblindness simulators

2. **Purposeful color**: Color should convey meaning, not just aesthetics
   - Use color to distinguish categories or highlight key data
   - Maintain consistency across figures (same treatment = same color)

3. **Print considerations**:
   - Colors may appear different in print vs. screen
   - Use CMYK color space for print, RGB for digital
   - Ensure sufficient contrast (especially for grayscale conversion)

### Recommended Color Palettes
- **Qualitative (categories)**: ColorBrewer, Okabe-Ito palette
- **Sequential (low to high)**: Viridis, Cividis, Blues, Oranges
- **Diverging (negative to positive)**: RdBu, PuOr, BrBG (ensure colorblind-safe)

### Grayscale Compatibility
- All figures should be interpretable in grayscale
- Use different line styles (solid, dashed, dotted) and markers
- Add patterns/hatching to bars and areas

## Layout and Composition

### Multi-Panel Figures
- **Panel labels**: Use bold uppercase letters (A, B, C) in top-left corner
- **Spacing**: Adequate white space between panels
- **Alignment**: Align panels along edges or axes where possible
- **Sizing**: Related panels should have consistent sizes
- **Arrangement**: Logical flow (left-to-right, top-to-bottom)

### Plot Elements

#### Axes
- **Axis lines**: 0.5-1 pt thickness
- **Tick marks**: Point inward or outward consistently
- **Tick frequency**: Enough to read values, not cluttered (typically 4-7 major ticks)
- **Axis labels**: Required on all plots; state units
- **Axis ranges**: Start from zero for bar charts (unless scientifically inappropriate)

#### Lines and Markers
- **Line width**: 1-2 pt for data lines; 0.5-1 pt for reference lines
- **Marker size**: 3-6 pt, larger than line width
- **Marker types**: Differentiate when multiple series (circles, squares, triangles)
- **Error bars**: 0.5-1 pt width; include caps if appropriate

#### Legends
- **Position**: Inside plot area if space permits, outside otherwise
- **Frame**: Optional; if used, thin line (0.5 pt)
- **Order**: Match order of data appearance (top to bottom or left to right)
- **Content**: Concise descriptions; full details in caption

### White Space and Margins
- Remove unnecessary white space around plots
- Maintain consistent margins
- `tight_layout()` or `constrained_layout=True` in matplotlib

## Data Representation Best Practices

### Statistical Rigor
- **Error bars**: Always show uncertainty (SD, SEM, CI) and state which in caption
- **Sample size**: Indicate n in figure or caption
- **Significance**: Mark statistical significance clearly (*, **, ***)
- **Replicates**: Show individual data points when possible, not just summary statistics

### Appropriate Chart Types
- **Bar plots**: Comparing discrete categories; always start y-axis at zero
- **Line plots**: Time series or continuous relationships
- **Scatter plots**: Correlation between variables; add regression line if appropriate
- **Box plots**: Distribution comparisons; show outliers
- **Heatmaps**: Matrix data, correlations, expression patterns
- **Violin plots**: Distribution shape comparison (better than box plots for bimodal data)

### Avoiding Distortion
- **No 3D effects**: Distorts perception of values
- **No unnecessary decorations**: No gradients, shadows, or chart junk
- **Consistent scales**: Use same scale for comparable panels
- **No truncated axes**: Unless clearly indicated and scientifically justified
- **Linear vs. log scales**: Choose appropriate scale; always label clearly

## Accessibility

### Colorblind Considerations
- Test with online simulators (e.g., Coblis, Color Oracle)
- Use patterns/textures in addition to color
- Provide alternative representations in supplementary materials if needed

### Visual Impairment
- High contrast between elements
- Thick enough lines (minimum 0.5 pt)
- Clear, uncluttered layouts

### Data Availability
- Include data tables in supplementary materials
- Provide source data files for graphs
- Consider interactive figures for online supplementary materials

## Common Mistakes to Avoid

1. **Font too small**: Text unreadable at final print size
2. **Low resolution**: Pixelated or blurry images
3. **Chart junk**: Unnecessary grid lines, 3D effects, decorations
4. **Poor color choices**: Red/green combinations, low contrast
5. **Missing elements**: No axis labels, no units, no error bars
6. **Inconsistent styling**: Different fonts/sizes within figure or between figures
7. **Data distortion**: Truncated axes, inappropriate scales, 3D effects
8. **JPEG compression**: Artifacts around text and lines
9. **Too much information**: Cramming too many data series into one plot
10. **Inaccessible legends**: Legends outside the figure boundary after export

## Figure Checklist

Before submission, verify:

- [ ] Resolution meets journal requirements (300+ DPI for raster)
- [ ] File format is acceptable (vector for plots, TIFF/PNG for images)
- [ ] Figure dimensions match journal specifications
- [ ] All text is readable at final size (minimum 6-7 pt)
- [ ] Fonts are consistent and embedded (for PDF/EPS)
- [ ] Colors are colorblind-friendly
- [ ] Figure is interpretable in grayscale
- [ ] All axes are labeled with units
- [ ] Error bars or uncertainty indicators are present
- [ ] Statistical significance is marked if applicable
- [ ] Panel labels are present and consistent (A, B, C)
- [ ] Legend is clear and complete
- [ ] No chart junk or unnecessary elements
- [ ] File naming follows journal conventions
- [ ] Figure caption is comprehensive
- [ ] Source data is available

## Journal-Specific Considerations

Always consult the specific journal's author guidelines. Common variations include:

- **Nature journals**: RGB, 300 DPI minimum, specific size requirements
- **Science**: EPS or high-res TIFF, specific font requirements
- **Cell Press**: PDF or EPS preferred, Arial or Helvetica fonts
- **PLOS**: TIFF or EPS, specific color space requirements
- **ACS journals**: Application files (AI, EPS) or high-res TIFF

See `journal_requirements.md` for detailed specifications from major publishers.
