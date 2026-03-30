# Matplotlib Styling Guide

Comprehensive guide for styling and customizing matplotlib visualizations.

## Colormaps

### Colormap Categories

**1. Perceptually Uniform Sequential**
Best for ordered data that progresses from low to high values.
- `viridis` (default, colorblind-friendly)
- `plasma`
- `inferno`
- `magma`
- `cividis` (optimized for colorblind viewers)

**Usage:**
```python
im = ax.imshow(data, cmap='viridis')
scatter = ax.scatter(x, y, c=values, cmap='plasma')
```

**2. Sequential**
Traditional colormaps for ordered data.
- `Blues`, `Greens`, `Reds`, `Oranges`, `Purples`
- `YlOrBr`, `YlOrRd`, `OrRd`, `PuRd`
- `BuPu`, `GnBu`, `PuBu`, `YlGnBu`

**3. Diverging**
Best for data with a meaningful center point (e.g., zero, mean).
- `coolwarm` (blue to red)
- `RdBu` (red-blue)
- `RdYlBu` (red-yellow-blue)
- `RdYlGn` (red-yellow-green)
- `PiYG`, `PRGn`, `BrBG`, `PuOr`, `RdGy`

**Usage:**
```python
# Center colormap at zero
im = ax.imshow(data, cmap='coolwarm', vmin=-1, vmax=1)
```

**4. Qualitative**
Best for categorical/nominal data without inherent ordering.
- `tab10` (10 distinct colors)
- `tab20` (20 distinct colors)
- `Set1`, `Set2`, `Set3`
- `Pastel1`, `Pastel2`
- `Dark2`, `Accent`, `Paired`

**Usage:**
```python
colors = plt.cm.tab10(np.linspace(0, 1, n_categories))
for i, category in enumerate(categories):
    ax.plot(x, y[i], color=colors[i], label=category)
```

**5. Cyclic**
Best for cyclic data (e.g., phase, angle).
- `twilight`
- `twilight_shifted`
- `hsv`

### Colormap Best Practices

1. **Avoid `jet` colormap** - Not perceptually uniform, misleading
2. **Use perceptually uniform colormaps** - `viridis`, `plasma`, `cividis`
3. **Consider colorblind users** - Use `viridis`, `cividis`, or test with colorblind simulators
4. **Match colormap to data type**:
   - Sequential: increasing/decreasing data
   - Diverging: data with meaningful center
   - Qualitative: categories
5. **Reverse colormaps** - Add `_r` suffix: `viridis_r`, `coolwarm_r`

### Creating Custom Colormaps

```python
from matplotlib.colors import LinearSegmentedColormap

# From color list
colors = ['blue', 'white', 'red']
n_bins = 100
cmap = LinearSegmentedColormap.from_list('custom', colors, N=n_bins)

# From RGB values
colors = [(0, 0, 1), (1, 1, 1), (1, 0, 0)]  # RGB tuples
cmap = LinearSegmentedColormap.from_list('custom', colors)

# Use the custom colormap
ax.imshow(data, cmap=cmap)
```

### Discrete Colormaps

```python
import matplotlib.colors as mcolors

# Create discrete colormap from continuous
cmap = plt.cm.viridis
bounds = np.linspace(0, 10, 11)
norm = mcolors.BoundaryNorm(bounds, cmap.N)
im = ax.imshow(data, cmap=cmap, norm=norm)
```

## Style Sheets

### Using Built-in Styles

```python
# List available styles
print(plt.style.available)

# Apply a style
plt.style.use('seaborn-v0_8-darkgrid')

# Apply multiple styles (later styles override earlier ones)
plt.style.use(['seaborn-v0_8-whitegrid', 'seaborn-v0_8-poster'])

# Temporarily use a style
with plt.style.context('ggplot'):
    fig, ax = plt.subplots()
    ax.plot(x, y)
```

### Popular Built-in Styles

- `default` - Matplotlib's default style
- `classic` - Classic matplotlib look (pre-2.0)
- `seaborn-v0_8-*` - Seaborn-inspired styles
  - `seaborn-v0_8-darkgrid`, `seaborn-v0_8-whitegrid`
  - `seaborn-v0_8-dark`, `seaborn-v0_8-white`
  - `seaborn-v0_8-ticks`, `seaborn-v0_8-poster`, `seaborn-v0_8-talk`
- `ggplot` - ggplot2-inspired style
- `bmh` - Bayesian Methods for Hackers style
- `fivethirtyeight` - FiveThirtyEight style
- `grayscale` - Grayscale style

### Creating Custom Style Sheets

Create a file named `custom_style.mplstyle`:

```
# custom_style.mplstyle

# Figure
figure.figsize: 10, 6
figure.dpi: 100
figure.facecolor: white

# Font
font.family: sans-serif
font.sans-serif: Arial, Helvetica
font.size: 12

# Axes
axes.labelsize: 14
axes.titlesize: 16
axes.facecolor: white
axes.edgecolor: black
axes.linewidth: 1.5
axes.grid: True
axes.axisbelow: True

# Grid
grid.color: gray
grid.linestyle: --
grid.linewidth: 0.5
grid.alpha: 0.3

# Lines
lines.linewidth: 2
lines.markersize: 8

# Ticks
xtick.labelsize: 10
ytick.labelsize: 10
xtick.direction: in
ytick.direction: in
xtick.major.size: 6
ytick.major.size: 6
xtick.minor.size: 3
ytick.minor.size: 3

# Legend
legend.fontsize: 12
legend.frameon: True
legend.framealpha: 0.8
legend.fancybox: True

# Savefig
savefig.dpi: 300
savefig.bbox: tight
savefig.facecolor: white
```

Load and use:
```python
plt.style.use('path/to/custom_style.mplstyle')
```

## rcParams Configuration

### Global Configuration

```python
import matplotlib.pyplot as plt

# Configure globally
plt.rcParams['figure.figsize'] = (10, 6)
plt.rcParams['font.size'] = 12
plt.rcParams['axes.labelsize'] = 14

# Or update multiple at once
plt.rcParams.update({
    'figure.figsize': (10, 6),
    'font.size': 12,
    'axes.labelsize': 14,
    'axes.titlesize': 16,
    'lines.linewidth': 2
})
```

### Temporary Configuration

```python
# Context manager for temporary changes
with plt.rc_context({'font.size': 14, 'lines.linewidth': 2.5}):
    fig, ax = plt.subplots()
    ax.plot(x, y)
```

### Common rcParams

**Figure settings:**
```python
plt.rcParams['figure.figsize'] = (10, 6)
plt.rcParams['figure.dpi'] = 100
plt.rcParams['figure.facecolor'] = 'white'
plt.rcParams['figure.edgecolor'] = 'white'
plt.rcParams['figure.autolayout'] = False
plt.rcParams['figure.constrained_layout.use'] = True
```

**Font settings:**
```python
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.sans-serif'] = ['Arial', 'Helvetica', 'DejaVu Sans']
plt.rcParams['font.size'] = 12
plt.rcParams['font.weight'] = 'normal'
```

**Axes settings:**
```python
plt.rcParams['axes.facecolor'] = 'white'
plt.rcParams['axes.edgecolor'] = 'black'
plt.rcParams['axes.linewidth'] = 1.5
plt.rcParams['axes.grid'] = True
plt.rcParams['axes.labelsize'] = 14
plt.rcParams['axes.titlesize'] = 16
plt.rcParams['axes.labelweight'] = 'normal'
plt.rcParams['axes.spines.top'] = True
plt.rcParams['axes.spines.right'] = True
```

**Line settings:**
```python
plt.rcParams['lines.linewidth'] = 2
plt.rcParams['lines.linestyle'] = '-'
plt.rcParams['lines.marker'] = 'None'
plt.rcParams['lines.markersize'] = 6
```

**Save settings:**
```python
plt.rcParams['savefig.dpi'] = 300
plt.rcParams['savefig.format'] = 'png'
plt.rcParams['savefig.bbox'] = 'tight'
plt.rcParams['savefig.pad_inches'] = 0.1
plt.rcParams['savefig.transparent'] = False
```

## Color Palettes

### Named Color Sets

```python
# Tableau colors
tableau_colors = plt.cm.tab10.colors

# CSS4 colors (subset)
css_colors = ['steelblue', 'coral', 'teal', 'goldenrod', 'crimson']

# Manual definition
custom_colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd']
```

### Color Cycles

```python
# Set default color cycle
from cycler import cycler
colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728']
plt.rcParams['axes.prop_cycle'] = cycler(color=colors)

# Or combine color and line style
plt.rcParams['axes.prop_cycle'] = cycler(color=colors) + cycler(linestyle=['-', '--', ':', '-.'])
```

### Palette Generation

```python
# Evenly spaced colors from colormap
n_colors = 5
colors = plt.cm.viridis(np.linspace(0, 1, n_colors))

# Use in plot
for i, (x, y) in enumerate(data):
    ax.plot(x, y, color=colors[i])
```

## Typography

### Font Configuration

```python
# Set font family
plt.rcParams['font.family'] = 'serif'
plt.rcParams['font.serif'] = ['Times New Roman', 'DejaVu Serif']

# Or sans-serif
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.sans-serif'] = ['Arial', 'Helvetica']

# Or monospace
plt.rcParams['font.family'] = 'monospace'
plt.rcParams['font.monospace'] = ['Courier New', 'DejaVu Sans Mono']
```

### Font Properties in Text

```python
from matplotlib import font_manager

# Specify font properties
ax.text(x, y, 'Text',
        fontsize=14,
        fontweight='bold',  # 'normal', 'bold', 'heavy', 'light'
        fontstyle='italic',  # 'normal', 'italic', 'oblique'
        fontfamily='serif')

# Use specific font file
prop = font_manager.FontProperties(fname='path/to/font.ttf')
ax.text(x, y, 'Text', fontproperties=prop)
```

### Mathematical Text

```python
# LaTeX-style math
ax.set_title(r'$\alpha > \beta$')
ax.set_xlabel(r'$\mu \pm \sigma$')
ax.text(x, y, r'$\int_0^\infty e^{-x} dx = 1$')

# Subscripts and superscripts
ax.set_ylabel(r'$y = x^2 + 2x + 1$')
ax.text(x, y, r'$x_1, x_2, \ldots, x_n$')

# Greek letters
ax.text(x, y, r'$\alpha, \beta, \gamma, \delta, \epsilon$')
```

### Using Full LaTeX

```python
# Enable full LaTeX rendering (requires LaTeX installation)
plt.rcParams['text.usetex'] = True
plt.rcParams['text.latex.preamble'] = r'\usepackage{amsmath}'

ax.set_title(r'\textbf{Bold Title}')
ax.set_xlabel(r'Time $t$ (s)')
```

## Spines and Grids

### Spine Customization

```python
# Hide specific spines
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)

# Move spine position
ax.spines['left'].set_position(('outward', 10))
ax.spines['bottom'].set_position(('data', 0))

# Change spine color and width
ax.spines['left'].set_color('red')
ax.spines['bottom'].set_linewidth(2)
```

### Grid Customization

```python
# Basic grid
ax.grid(True)

# Customized grid
ax.grid(True, which='major', linestyle='--', linewidth=0.8, alpha=0.3)
ax.grid(True, which='minor', linestyle=':', linewidth=0.5, alpha=0.2)

# Grid for specific axis
ax.grid(True, axis='x')  # Only vertical lines
ax.grid(True, axis='y')  # Only horizontal lines

# Grid behind or in front of data
ax.set_axisbelow(True)  # Grid behind data
```

## Legend Customization

### Legend Positioning

```python
# Location strings
ax.legend(loc='best')  # Automatic best position
ax.legend(loc='upper right')
ax.legend(loc='upper left')
ax.legend(loc='lower right')
ax.legend(loc='lower left')
ax.legend(loc='center')
ax.legend(loc='upper center')
ax.legend(loc='lower center')
ax.legend(loc='center left')
ax.legend(loc='center right')

# Precise positioning (bbox_to_anchor)
ax.legend(bbox_to_anchor=(1.05, 1), loc='upper left')  # Outside plot area
ax.legend(bbox_to_anchor=(0.5, -0.15), loc='upper center', ncol=3)  # Below plot
```

### Legend Styling

```python
ax.legend(
    fontsize=12,
    frameon=True,           # Show frame
    framealpha=0.9,         # Frame transparency
    fancybox=True,          # Rounded corners
    shadow=True,            # Shadow effect
    ncol=2,                 # Number of columns
    title='Legend Title',   # Legend title
    title_fontsize=14,      # Title font size
    edgecolor='black',      # Frame edge color
    facecolor='white'       # Frame background color
)
```

### Custom Legend Entries

```python
from matplotlib.lines import Line2D

# Create custom legend handles
custom_lines = [Line2D([0], [0], color='red', lw=2),
                Line2D([0], [0], color='blue', lw=2, linestyle='--'),
                Line2D([0], [0], marker='o', color='w', markerfacecolor='green', markersize=10)]

ax.legend(custom_lines, ['Label 1', 'Label 2', 'Label 3'])
```

## Layout and Spacing

### Constrained Layout

```python
# Preferred method (automatic adjustment)
fig, axes = plt.subplots(2, 2, constrained_layout=True)
```

### Tight Layout

```python
# Alternative method
fig, axes = plt.subplots(2, 2)
plt.tight_layout(pad=1.5, h_pad=2.0, w_pad=2.0)
```

### Manual Adjustment

```python
# Fine-grained control
plt.subplots_adjust(left=0.1, right=0.9, top=0.9, bottom=0.1,
                    hspace=0.3, wspace=0.4)
```

## Professional Publication Style

Example configuration for publication-quality figures:

```python
# Publication style configuration
plt.rcParams.update({
    # Figure
    'figure.figsize': (8, 6),
    'figure.dpi': 100,
    'savefig.dpi': 300,
    'savefig.bbox': 'tight',
    'savefig.pad_inches': 0.1,

    # Font
    'font.family': 'sans-serif',
    'font.sans-serif': ['Arial', 'Helvetica'],
    'font.size': 11,

    # Axes
    'axes.labelsize': 12,
    'axes.titlesize': 14,
    'axes.linewidth': 1.5,
    'axes.grid': False,
    'axes.spines.top': False,
    'axes.spines.right': False,

    # Lines
    'lines.linewidth': 2,
    'lines.markersize': 8,

    # Ticks
    'xtick.labelsize': 10,
    'ytick.labelsize': 10,
    'xtick.major.size': 6,
    'ytick.major.size': 6,
    'xtick.major.width': 1.5,
    'ytick.major.width': 1.5,
    'xtick.direction': 'in',
    'ytick.direction': 'in',

    # Legend
    'legend.fontsize': 10,
    'legend.frameon': True,
    'legend.framealpha': 1.0,
    'legend.edgecolor': 'black'
})
```

## Dark Theme

```python
# Dark background style
plt.style.use('dark_background')

# Or manual configuration
plt.rcParams.update({
    'figure.facecolor': '#1e1e1e',
    'axes.facecolor': '#1e1e1e',
    'axes.edgecolor': 'white',
    'axes.labelcolor': 'white',
    'text.color': 'white',
    'xtick.color': 'white',
    'ytick.color': 'white',
    'grid.color': 'gray',
    'legend.facecolor': '#1e1e1e',
    'legend.edgecolor': 'white'
})
```

## Color Accessibility

### Colorblind-Friendly Palettes

```python
# Use colorblind-friendly colormaps
colorblind_friendly = ['viridis', 'plasma', 'cividis']

# Colorblind-friendly discrete colors
cb_colors = ['#0173B2', '#DE8F05', '#029E73', '#CC78BC',
             '#CA9161', '#949494', '#ECE133', '#56B4E9']

# Test with simulation tools or use these validated palettes
```

### High Contrast

```python
# Ensure sufficient contrast
plt.rcParams['axes.edgecolor'] = 'black'
plt.rcParams['axes.linewidth'] = 2
plt.rcParams['xtick.major.width'] = 2
plt.rcParams['ytick.major.width'] = 2
```
