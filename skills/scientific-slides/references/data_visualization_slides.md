# Data Visualization for Slides

## Overview

Effective data visualization in presentations differs fundamentally from journal figures. While publications prioritize comprehensive detail, presentation slides must emphasize clarity, impact, and immediate comprehension. This guide covers adapting figures for slides, choosing appropriate chart types, and avoiding common visualization mistakes.

## Key Principles for Presentation Figures

### 1. Simplify, Don't Replicate

**The Core Difference**:
- **Journal figures**: Dense, detailed, for careful study
- **Presentation figures**: Clear, simplified, for quick understanding

**Simplification Strategies**:

**Remove Non-Essential Elements**:
- ❌ Minor gridlines
- ❌ Detailed legends (label directly instead)
- ❌ Multiple panels (split into separate slides)
- ❌ Secondary axes (rarely work in presentations)
- ❌ Dense tick marks and minor labels

**Focus on Key Message**:
- Show only the data supporting your current point
- Subset data if full dataset is overwhelming
- Highlight the specific comparison you're discussing
- Remove context that isn't immediately relevant

**Example Transformation**:
```
Journal Figure:
- 6 panels (A-F)
- 4 experimental conditions per panel
- 50+ data points visible
- Complex statistical annotations
- Small font labels

Presentation Version:
- 3 separate slides (1-2 panels each)
- Focus on key comparison per slide
- Large, clear data representation
- One statistical result highlighted
- Large, readable labels
```

### 2. Emphasize Visual Hierarchy

**Guide Attention**:
- Make key result visually dominant
- De-emphasize background or comparison data
- Use size, color, and position strategically

**Techniques**:

**Color Emphasis**:
```
Main Result: Bold, saturated color (e.g., blue)
Comparison: Muted gray or desaturated color
Background: Very light gray or white
```

**Size Emphasis**:
```
Key line/bar: Thicker (3-4pt)
Reference lines: Thinner (1-2pt)
Grid lines: Very thin (0.5pt) or remove
```

**Annotation**:
```
Add text callouts: "34% increase" with arrow
Add shapes: Circle key region
Add color highlights: Background shading for important area
```

### 3. Maximize Readability

**Font Sizes for Presentations**:
- **Axis labels**: 18-24pt minimum
- **Tick labels**: 16-20pt minimum
- **Title**: 24-32pt
- **Legend**: 16-20pt (or label directly on plot)
- **Annotations**: 18-24pt

**The Distance Test**:
- If your figure isn't readable at 2-3 feet from your laptop screen, it won't work in a presentation
- Test by stepping back from screen
- Better to split into multiple simpler figures

**Line and Marker Sizes**:
- **Lines**: 2-4pt thickness (thicker than journal figures)
- **Markers**: 8-12pt size
- **Error bars**: 1.5-2pt thickness
- **Bars**: Adequate width with clear spacing

### 4. Use Progressive Disclosure

**Build Complex Figures Incrementally**:

Instead of showing complete figure at once:
1. **Baseline**: Show axes and basic setup
2. **Data Group 1**: Add first dataset
3. **Data Group 2**: Add comparison dataset
4. **Highlight**: Emphasize key difference
5. **Interpretation**: Add annotation with finding

**Benefits**:
- Controls audience attention
- Prevents information overload
- Guides interpretation
- Emphasizes narrative structure

**Implementation**:
- PowerPoint: Use animation to reveal layers
- Beamer: Use `\pause` or overlays
- Static: Create sequence of slides building the figure

## Chart Types and When to Use Them

### Bar Charts

**Best For**:
- Comparing discrete categories
- Showing counts or frequencies
- Highlighting differences between groups

**Presentation Optimization**:
```
✅ DO:
- Large, clear bars with adequate spacing
- Horizontal bars for long category names
- Direct labeling on bars (not legend)
- Order by value (highest to lowest) unless natural order exists
- Start y-axis at zero for accurate visual comparison

❌ DON'T:
- Too many categories (max 8-10)
- 3D bars (distorts perception)
- Multiple grouped comparisons (split to separate slides)
- Decorative patterns or gradients
```

**Example Enhancement**:
```
Before: 12 categories, small fonts, legend
After: Top 6 categories only, large fonts, direct labels, key bar highlighted
```

### Line Graphs

**Best For**:
- Trends over time
- Continuous data relationships
- Comparing trajectories

**Presentation Optimization**:
```
✅ DO:
- Thick lines (2-4pt)
- Distinct colors AND line styles (solid, dashed, dotted)
- Direct line labeling (at end of lines, not legend)
- Highlight key line with color/thickness
- Minimal gridlines or none
- Clear markers at data points

❌ DON'T:
- More than 4-5 lines per plot
- Similar colors (ensure high contrast)
- Small markers or thin lines
- Cluttered with excess gridlines
```

**Time Series Tips**:
- Mark key events or interventions with vertical lines
- Annotate important time points
- Use shaded regions for different phases

### Scatter Plots

**Best For**:
- Relationships between two variables
- Correlations
- Distributions
- Outliers

**Presentation Optimization**:
```
✅ DO:
- Large, distinct markers (8-12pt)
- Color code groups clearly
- Show trendline if discussing correlation
- Annotate key points (outliers, examples)
- Report R² or p-value directly on plot

❌ DON'T:
- Overplot (too many overlapping points)
- Small markers
- Multiple marker types that look similar
- Missing scale information
```

**Overplotting Solutions**:
- Transparency (alpha) for overlapping points
- Hexbin or density plots for very large datasets
- Random jitter for discrete data
- Marginal distributions on axes

### Box Plots / Violin Plots

**Best For**:
- Distribution comparisons
- Showing variability and outliers
- Multiple group comparisons

**Presentation Optimization**:
```
✅ DO:
- Large, clear boxes
- Color code groups
- Add individual data points if n is small (< 30)
- Annotate median or mean values
- Explain components (quartiles, whiskers) first time shown

❌ DON'T:
- Assume audience knows box plot conventions
- Use without brief explanation
- Too many groups (max 6-8)
- Omit axis labels and units
```

**First Use**:
If your audience may be unfamiliar, briefly explain: "Box shows middle 50% of data, line is median, whiskers show range"

### Heatmaps

**Best For**:
- Matrix data
- Gene expression or correlation patterns
- Large datasets with patterns

**Presentation Optimization**:
```
✅ DO:
- Large cells (readable grid)
- Clear, intuitive color scale (diverging or sequential)
- Label rows and columns with large fonts
- Show color scale legend prominently
- Cluster or order meaningfully
- Highlight key region with border

❌ DON'T:
- Too many rows/columns (200×200 matrix unreadable)
- Poor color scales (rainbow, red-green)
- Missing dendrograms if claiming clusters
- Tiny labels
```

**Simplification**:
- Show subset of most interesting rows/columns
- Zoom to relevant region
- Split large heatmap across multiple slides

### Network Diagrams

**Best For**:
- Relationships and connections
- Pathways and networks
- Hierarchical structures

**Presentation Optimization**:
```
✅ DO:
- Large nodes and labels
- Clear edge directionality (arrows)
- Color or size code importance
- Highlight path of interest
- Simplify to essential connections
- Use layout that minimizes crossing edges

❌ DON'T:
- Show entire complex network at once
- Hairball diagrams (too many connections)
- Small labels on nodes
- Unclear what nodes and edges represent
```

**Build Strategy**:
1. Show simplified structure
2. Add key nodes progressively
3. Highlight path or subnetwork of interest
4. Annotate with functional interpretation

### Statistical Plots

**Kaplan-Meier Survival Curves**:
```
✅ Optimize:
- Thick lines (3-4pt)
- Show confidence intervals as shaded regions
- Mark censored observations clearly
- Report hazard ratio and p-value on plot
- Extend axes to show full follow-up
```

**Forest Plots**:
```
✅ Optimize:
- Large markers (diamonds or squares)
- Clear confidence interval bars
- Large font for study names
- Highlight overall estimate
- Show line of no effect prominently
```

**ROC Curves**:
```
✅ Optimize:
- Thick curve line
- Show diagonal reference line (AUC = 0.5)
- Report AUC with confidence interval on plot
- Mark optimal threshold if discussing cutpoint
- Compare ≤ 3 curves per plot
```

## Color in Data Visualizations

### Sequential Color Scales

**When to Use**: Ordered data (low to high)

**Good Palettes**:
- Blues: Light blue → Dark blue
- Greens: Light green → Dark green  
- Grays: Light gray → Black
- Viridis: Yellow → Purple (perceptually uniform)

**Avoid**:
- Rainbow scales (non-uniform perception)
- Red-green scales (color blindness)

### Diverging Color Scales

**When to Use**: Data with meaningful midpoint (e.g., +/− change, correlation from -1 to +1)

**Good Palettes**:
- Blue → White → Red
- Purple → White → Orange
- Blue → Gray → Orange

**Key Principle**: Midpoint should be visually neutral (white or light gray)

### Categorical Colors

**When to Use**: Distinct groups with no order

**Good Practices**:
- Maximum 5-7 colors for clarity
- High contrast between adjacent categories
- Color-blind safe combinations
- Consistent color mapping across slides

**Example Set**:
```
Blue (#0173B2)
Orange (#DE8F05)
Green (#029E73)
Purple (#CC78BC)
Red (#CA3542)
```

### Highlight Colors

**Strategy**: Use color to direct attention

```
Main Result: Bright, saturated color (e.g., blue)
Comparison: Neutral (gray) or muted color
Background: Very light gray or white
```

**Example Application**:
- Bar chart: Key bar in blue, others in light gray
- Line plot: Main line in bold blue, reference lines in thin gray
- Scatter: Group of interest in color, others faded

## Common Visualization Mistakes

### Mistake 1: Overwhelming Complexity

**Problem**: Showing too much data at once

**Example**:
- Figure with 12 panels
- Each panel has 6 experimental conditions
- Tiny fonts and dense layout
- Audience has 10 seconds to process

**Solution**:
- Split into 3-4 slides
- One comparison per slide
- Focus on key result
- Build understanding progressively

### Mistake 2: Illegible Labels

**Problem**: Text too small to read

**Common Issues**:
- 8-10pt axis labels (need ≥18pt)
- Tiny legend text
- Subscripts and superscripts disappear
- Fine-print p-values

**Solution**:
- Recreate figures for presentation (don't use journal versions directly)
- Test readability from distance
- Remove or enlarge small text
- Put detailed statistics in notes

### Mistake 3: Chart Junk

**Problem**: Unnecessary decorative elements

**Examples**:
- 3D effects on 2D data
- Excessive gridlines
- Distracting backgrounds
- Decorative borders or shadows
- Animation for decoration only

**Solution**:
- Remove all non-data ink
- Maximize data-ink ratio
- Clean, minimal design
- Let data be the focus

### Mistake 4: Misleading Scales

**Problem**: Visual representation distorts data

**Examples**:
- Bar charts not starting at zero
- Truncated y-axes exaggerating differences
- Inconsistent scales between panels
- Log scales without clear labeling

**Solution**:
- Bar charts: Always start at zero
- Line charts: Can truncate, but make clear
- Label log scales explicitly
- Maintain consistent scales for comparisons

### Mistake 5: Poor Color Choices

**Problem**: Colors reduce clarity or accessibility

**Examples**:
- Red-green for color-blind audience
- Low contrast (yellow on white)
- Too many colors
- Inconsistent color meaning

**Solution**:
- Use color-blind safe palettes
- Test contrast (minimum 4.5:1)
- Limit to 5-7 colors maximum
- Consistent meaning across slides

### Mistake 6: Missing Context

**Problem**: Audience can't interpret visualization

**Missing Elements**:
- Axis labels or units
- Sample sizes (n)
- Error bar meaning (SEM vs SD vs CI)
- Statistical significance indicators
- Scale or reference points

**Solution**:
- Label everything clearly
- Define abbreviations
- Report key statistics on plot
- Provide reference for comparison

### Mistake 7: Inefficient Chart Type

**Problem**: Wrong visualization for data type

**Examples**:
- Pie chart for >5 categories (use bar chart)
- 3D pie chart (especially bad)
- Dual y-axes (confusing)
- Line plot for discrete categories (use bar chart)

**Solution**:
- Match chart type to data type
- Consider what comparison you're showing
- Choose format that makes pattern obvious
- Test if message is immediately clear

## Progressive Disclosure Techniques

### Building a Complex Figure

**Scenario**: Showing multi-panel experimental result

**Approach 1: Sequential Panels**
```
Slide 1: Panel A only (baseline condition)
Slide 2: Panels A+B (add treatment effect)
Slide 3: Panels A+B+C (add time course)
Slide 4: All panels with interpretation overlay
```

**Approach 2: Layered Data**
```
Slide 1: Axes and experimental design schematic
Slide 2: Add control group data
Slide 3: Add treatment group data
Slide 4: Highlight difference, show statistics
```

**Approach 3: Zoom and Context**
```
Slide 1: Full dataset overview
Slide 2: Zoom to interesting region
Slide 3: Highlight specific points in zoomed view
```

### Animation vs. Multiple Slides

**Use Animation** (PowerPoint/Beamer overlays):
- Building bullet points
- Adding layers to same plot
- Highlighting different regions sequentially
- Smooth transitions within a concept

**Use Separate Slides**:
- Different data or experiments
- Major conceptual shifts
- Want to return to previous view
- Need to control timing flexibly

## Figure Preparation Workflow

### Step 1: Start with High-Quality Source

**For Generated Figures**:
- Export at high resolution (300 DPI minimum)
- Vector formats preferred (PDF, SVG)
- Large size (can scale down, not up)
- Clean, professional appearance

**For Published Figures**:
- Request high-resolution versions from authors/publishers
- Recreate if source not available
- Check reuse permissions

### Step 2: Simplify for Presentation

**Edit in Graphics Software**:
- Remove non-essential panels
- Enlarge fonts and labels
- Increase line widths and marker sizes
- Remove or simplify legends
- Add direct labels
- Remove excess gridlines

**Tools**:
- Adobe Illustrator (vector editing)
- Inkscape (free vector editing)
- PowerPoint/Keynote (basic editing)
- Python/R (programmatic recreation)

### Step 3: Optimize for Projection

**Check**:
- ✅ Readable from 10 feet away
- ✅ High contrast between elements
- ✅ Large enough to fill significant slide area
- ✅ Maintains quality when projected
- ✅ Works in various lighting conditions

**Test**:
- View on different screens
- Project if possible before talk
- Print at small scale (simulates distance)
- Check in grayscale (color-blind simulation)

### Step 4: Add Context and Annotations

**Enhancements**:
- Arrows pointing to key features
- Text boxes with key findings ("p < 0.001")
- Circles or rectangles highlighting regions
- Color coding matched to verbal description
- Reference lines or benchmarks

**Verbal Integration**:
- Plan what you'll say about each element
- Use "Notice that..." or "Here you can see..."
- Point to specific features during talk
- Explain axes and scales first time shown

## Recreating Journal Figures for Presentations

### When to Recreate

**Recreate When**:
- Original has small fonts
- Too many panels for one slide
- Multiple comparisons to parse
- Colors not accessible
- Data available to you

**Reuse When**:
- Already simple and clear
- Appropriate font sizes
- Single focused message
- High resolution available
- Remaking not feasible

### Recreation Tools

**Python (matplotlib, seaborn)**:
```python
import matplotlib.pyplot as plt
import seaborn as sns

# Set presentation-friendly defaults
plt.rcParams['font.size'] = 18
plt.rcParams['axes.linewidth'] = 2
plt.rcParams['lines.linewidth'] = 3
plt.rcParams['figure.figsize'] = (10, 6)

# Create plot with large, clear elements
# Export as high-res PNG or PDF
```

**R (ggplot2)**:
```r
library(ggplot2)

# Presentation theme
theme_presentation <- theme_minimal() +
  theme(
    text = element_text(size = 18),
    axis.text = element_text(size = 16),
    axis.title = element_text(size = 20),
    legend.text = element_text(size = 16)
  )

# Apply to plots
ggplot(data, aes(x, y)) + geom_point(size=4) + theme_presentation
```

**GraphPad Prism**:
- Increase font sizes in Format Axes
- Thicken lines in Format Graph
- Enlarge symbols
- Export as high-resolution image

**Excel/PowerPoint**:
- Select chart, Format → Text Options → Size (increase to 18-24pt)
- Format → Line → Width (increase to 2-3pt)
- Format → Marker → Size (increase to 10-12pt)

## Summary Checklist

Before including a figure in your presentation:

**Clarity**:
- [ ] One clear message per figure
- [ ] Immediately understandable (< 5 seconds)
- [ ] Appropriate chart type for data
- [ ] Simplified from journal version (if applicable)

**Readability**:
- [ ] Font sizes ≥18pt for labels
- [ ] Thick lines (2-4pt) and large markers (8-12pt)
- [ ] High contrast colors
- [ ] Readable from back of room

**Design**:
- [ ] Minimal chart junk (removed gridlines, simplify)
- [ ] Axes clearly labeled with units
- [ ] Color-blind friendly palette
- [ ] Consistent style with other figures

**Context**:
- [ ] Sample sizes indicated (n)
- [ ] Statistical results shown (p-values, CI)
- [ ] Error bars defined (SE, SD, or CI?)
- [ ] Key finding annotated or highlighted

**Technical Quality**:
- [ ] High resolution (300 DPI minimum)
- [ ] Vector format preferred
- [ ] Properly sized for slide
- [ ] Quality maintained when projected

**Progressive Disclosure** (if complex):
- [ ] Plan for building figure incrementally
- [ ] Each step adds one new element
- [ ] Final version shows complete picture
- [ ] Animation or separate slides prepared
