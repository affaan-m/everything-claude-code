# Scientific Color Palettes and Guidelines

## Overview

Color choice in scientific visualization is critical for accessibility, clarity, and accurate data representation. This reference provides colorblind-friendly palettes and best practices for color usage.

## Colorblind-Friendly Palettes

### Okabe-Ito Palette (Recommended for Categories)

The Okabe-Ito palette is specifically designed to be distinguishable by people with all forms of color blindness.

```python
# Okabe-Ito colors (RGB values)
okabe_ito = {
    'orange': '#E69F00',      # RGB: (230, 159, 0)
    'sky_blue': '#56B4E9',    # RGB: (86, 180, 233)
    'bluish_green': '#009E73', # RGB: (0, 158, 115)
    'yellow': '#F0E442',      # RGB: (240, 228, 66)
    'blue': '#0072B2',        # RGB: (0, 114, 178)
    'vermillion': '#D55E00',  # RGB: (213, 94, 0)
    'reddish_purple': '#CC79A7', # RGB: (204, 121, 167)
    'black': '#000000'        # RGB: (0, 0, 0)
}
```

**Usage in Matplotlib:**
```python
import matplotlib.pyplot as plt

colors = ['#E69F00', '#56B4E9', '#009E73', '#F0E442',
          '#0072B2', '#D55E00', '#CC79A7', '#000000']
plt.rcParams['axes.prop_cycle'] = plt.cycler(color=colors)
```

**Usage in Seaborn:**
```python
import seaborn as sns

okabe_ito_palette = ['#E69F00', '#56B4E9', '#009E73', '#F0E442',
                      '#0072B2', '#D55E00', '#CC79A7']
sns.set_palette(okabe_ito_palette)
```

**Usage in Plotly:**
```python
import plotly.graph_objects as go

okabe_ito_plotly = ['#E69F00', '#56B4E9', '#009E73', '#F0E442',
                     '#0072B2', '#D55E00', '#CC79A7']
fig = go.Figure()
# Apply to discrete color scale
```

### Wong Palette (Alternative for Categories)

Another excellent colorblind-friendly palette by Bang Wong (Nature Methods).

```python
wong_palette = {
    'black': '#000000',
    'orange': '#E69F00',
    'sky_blue': '#56B4E9',
    'green': '#009E73',
    'yellow': '#F0E442',
    'blue': '#0072B2',
    'vermillion': '#D55E00',
    'purple': '#CC79A7'
}
```

### Paul Tol Palettes

Paul Tol has designed multiple scientifically-optimized palettes for different use cases.

**Bright Palette (up to 7 categories):**
```python
tol_bright = ['#4477AA', '#EE6677', '#228833', '#CCBB44',
              '#66CCEE', '#AA3377', '#BBBBBB']
```

**Muted Palette (up to 9 categories):**
```python
tol_muted = ['#332288', '#88CCEE', '#44AA99', '#117733',
             '#999933', '#DDCC77', '#CC6677', '#882255', '#AA4499']
```

**High Contrast (3 categories only):**
```python
tol_high_contrast = ['#004488', '#DDAA33', '#BB5566']
```

## Sequential Colormaps (Continuous Data)

Sequential colormaps represent data from low to high values with a single hue.

### Perceptually Uniform Colormaps

These colormaps have uniform perceptual change across the color scale.

**Viridis (default in Matplotlib):**
- Colorblind-friendly
- Prints well in grayscale
- Perceptually uniform
```python
plt.imshow(data, cmap='viridis')
```

**Cividis:**
- Optimized for colorblind viewers
- Designed specifically for deuteranopia/protanopia
```python
plt.imshow(data, cmap='cividis')
```

**Plasma, Inferno, Magma:**
- Perceptually uniform alternatives to viridis
- Good for different aesthetic preferences
```python
plt.imshow(data, cmap='plasma')
```

### When to Use Sequential Maps
- Heatmaps showing intensity
- Geographic elevation data
- Probability distributions
- Any single-variable continuous data (low → high)

## Diverging Colormaps (Negative to Positive)

Diverging colormaps have a neutral middle color with two contrasting colors at extremes.

### Colorblind-Safe Diverging Maps

**RdYlBu (Red-Yellow-Blue):**
```python
plt.imshow(data, cmap='RdYlBu_r')  # _r reverses: blue (low) to red (high)
```

**PuOr (Purple-Orange):**
- Excellent for colorblind viewers
```python
plt.imshow(data, cmap='PuOr')
```

**BrBG (Brown-Blue-Green):**
- Good colorblind accessibility
```python
plt.imshow(data, cmap='BrBG')
```

### Avoid These Diverging Maps
- **RdGn (Red-Green)**: Problematic for red-green colorblindness
- **RdYlGn (Red-Yellow-Green)**: Same issue

### When to Use Diverging Maps
- Correlation matrices
- Change/difference data (positive vs. negative)
- Deviation from a central value
- Temperature anomalies

## Special Purpose Palettes

### For Genomics/Bioinformatics

**Sequence type identification:**
```python
# DNA/RNA bases
nucleotide_colors = {
    'A': '#00CC00',  # Green
    'C': '#0000CC',  # Blue
    'G': '#FFB300',  # Orange
    'T': '#CC0000',  # Red
    'U': '#CC0000'   # Red (RNA)
}
```

**Gene expression:**
- Use sequential colormaps (viridis, YlOrRd) for expression levels
- Use diverging colormaps (RdBu) for log2 fold change

### For Microscopy

**Fluorescence channels:**
```python
# Traditional fluorophore colors (use with caution)
fluorophore_colors = {
    'DAPI': '#0000FF',      # Blue - DNA
    'GFP': '#00FF00',       # Green (problematic for colorblind)
    'RFP': '#FF0000',       # Red
    'Cy5': '#FF00FF'        # Magenta
}

# Colorblind-friendly alternatives
fluorophore_alt = {
    'Channel1': '#0072B2',  # Blue
    'Channel2': '#E69F00',  # Orange (instead of green)
    'Channel3': '#D55E00',  # Vermillion
    'Channel4': '#CC79A7'   # Magenta
}
```

## Color Usage Best Practices

### Categorical Data (Qualitative Color Schemes)

**Do:**
- Use distinct, saturated colors from Okabe-Ito or Wong palette
- Limit to 7-8 categories max in one plot
- Use consistent colors for same categories across figures
- Add patterns/markers when colors alone might be insufficient

**Don't:**
- Use red/green combinations
- Use rainbow (jet) colormap for categories
- Use similar hues that are hard to distinguish

### Continuous Data (Sequential/Diverging Schemes)

**Do:**
- Use perceptually uniform colormaps (viridis, plasma, cividis)
- Choose diverging maps when data has meaningful center point
- Include colorbar with labeled ticks
- Test appearance in grayscale

**Don't:**
- Use rainbow (jet) colormap - not perceptually uniform
- Use red-green diverging maps
- Omit colorbar on heatmaps

## Testing for Colorblind Accessibility

### Online Simulators
- **Coblis**: https://www.color-blindness.com/coblis-color-blindness-simulator/
- **Color Oracle**: Free downloadable tool for Windows/Mac/Linux
- **Sim Daltonism**: Mac application

### Types of Color Vision Deficiency
- **Deuteranopia** (~5% of males): Cannot distinguish green
- **Protanopia** (~2% of males): Cannot distinguish red
- **Tritanopia** (<1%): Cannot distinguish blue (rare)

### Python Tools
```python
# Using colorspacious to simulate colorblind vision
from colorspacious import cspace_convert

def simulate_deuteranopia(image_rgb):
    from colorspacious import cspace_convert
    # Convert to colorblind simulation
    # (Implementation would require colorspacious library)
    pass
```

## Implementation Examples

### Setting Global Matplotlib Style
```python
import matplotlib.pyplot as plt
import matplotlib as mpl

# Set Okabe-Ito as default color cycle
okabe_ito_colors = ['#E69F00', '#56B4E9', '#009E73', '#F0E442',
                     '#0072B2', '#D55E00', '#CC79A7']
mpl.rcParams['axes.prop_cycle'] = mpl.cycler(color=okabe_ito_colors)

# Set default colormap to viridis
mpl.rcParams['image.cmap'] = 'viridis'
```

### Seaborn with Custom Palette
```python
import seaborn as sns

# Set Paul Tol muted palette
tol_muted = ['#332288', '#88CCEE', '#44AA99', '#117733',
             '#999933', '#DDCC77', '#CC6677', '#882255', '#AA4499']
sns.set_palette(tol_muted)

# For heatmaps
sns.heatmap(data, cmap='viridis', annot=True)
```

### Plotly with Discrete Colors
```python
import plotly.express as px

# Use Okabe-Ito for categorical data
okabe_ito_plotly = ['#E69F00', '#56B4E9', '#009E73', '#F0E442',
                     '#0072B2', '#D55E00', '#CC79A7']

fig = px.scatter(df, x='x', y='y', color='category',
                 color_discrete_sequence=okabe_ito_plotly)
```

## Grayscale Compatibility

All figures should remain interpretable in grayscale. Test by converting to grayscale:

```python
# Convert figure to grayscale for testing
fig.savefig('figure_gray.png', dpi=300, colormap='gray')
```

**Strategies for grayscale compatibility:**
1. Use different line styles (solid, dashed, dotted)
2. Use different marker shapes (circles, squares, triangles)
3. Add hatching patterns to bars
4. Ensure sufficient luminance contrast between colors

## Color Spaces

### RGB vs CMYK
- **RGB** (Red, Green, Blue): For digital/screen display
- **CMYK** (Cyan, Magenta, Yellow, Black): For print

**Important:** Colors appear different in print vs. screen. When preparing for print:
1. Convert to CMYK color space
2. Check color appearance in CMYK preview
3. Ensure sufficient contrast remains

### Matplotlib Color Spaces
```python
# Save for print (CMYK)
# Note: Direct CMYK support limited; use PDF and let publisher convert
fig.savefig('figure.pdf', dpi=300)

# For RGB (digital)
fig.savefig('figure.png', dpi=300)
```

## Common Mistakes

1. **Using jet/rainbow colormap**: Not perceptually uniform; avoid
2. **Red-green combinations**: ~8% of males cannot distinguish
3. **Too many colors**: More than 7-8 becomes difficult to distinguish
4. **Inconsistent color meaning**: Same color should mean same thing across figures
5. **Missing colorbar**: Always include for continuous data
6. **Low contrast**: Ensure colors differ sufficiently
7. **Relying solely on color**: Add texture, patterns, or markers

## Resources

- **ColorBrewer**: http://colorbrewer2.org/ - Choose palettes by colorblind-safe option
- **Paul Tol's palettes**: https://personal.sron.nl/~pault/
- **Okabe-Ito palette origin**: "Color Universal Design" (Okabe & Ito, 2008)
- **Matplotlib colormaps**: https://matplotlib.org/stable/tutorials/colors/colormaps.html
- **Seaborn palettes**: https://seaborn.pydata.org/tutorial/color_palettes.html
