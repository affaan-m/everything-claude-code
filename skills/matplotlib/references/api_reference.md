# Matplotlib API Reference

This document provides a quick reference for the most commonly used matplotlib classes and methods.

## Core Classes

### Figure

The top-level container for all plot elements.

**Creation:**
```python
fig = plt.figure(figsize=(10, 6), dpi=100, facecolor='white')
fig, ax = plt.subplots(nrows=1, ncols=1, figsize=(10, 6))
fig, axes = plt.subplots(2, 2, figsize=(12, 10))
```

**Key Methods:**
- `fig.add_subplot(nrows, ncols, index)` - Add a subplot
- `fig.add_axes([left, bottom, width, height])` - Add axes at specific position
- `fig.savefig(filename, dpi=300, bbox_inches='tight')` - Save figure
- `fig.tight_layout()` - Adjust spacing to prevent overlaps
- `fig.suptitle(title)` - Set figure title
- `fig.legend()` - Create figure-level legend
- `fig.colorbar(mappable)` - Add colorbar to figure
- `plt.close(fig)` - Close figure to free memory

**Key Attributes:**
- `fig.axes` - List of all axes in the figure
- `fig.dpi` - Resolution in dots per inch
- `fig.figsize` - Figure dimensions in inches (width, height)

### Axes

The actual plotting area where data is visualized.

**Creation:**
```python
fig, ax = plt.subplots()  # Single axes
ax = fig.add_subplot(111)  # Alternative method
```

**Plotting Methods:**

**Line plots:**
- `ax.plot(x, y, **kwargs)` - Line plot
- `ax.step(x, y, where='pre'/'mid'/'post')` - Step plot
- `ax.errorbar(x, y, yerr, xerr)` - Error bars

**Scatter plots:**
- `ax.scatter(x, y, s=size, c=color, marker='o', alpha=0.5)` - Scatter plot

**Bar charts:**
- `ax.bar(x, height, width=0.8, align='center')` - Vertical bar chart
- `ax.barh(y, width)` - Horizontal bar chart

**Statistical plots:**
- `ax.hist(data, bins=10, density=False)` - Histogram
- `ax.boxplot(data, labels=None)` - Box plot
- `ax.violinplot(data)` - Violin plot

**2D plots:**
- `ax.imshow(array, cmap='viridis', aspect='auto')` - Display image/matrix
- `ax.contour(X, Y, Z, levels=10)` - Contour lines
- `ax.contourf(X, Y, Z, levels=10)` - Filled contours
- `ax.pcolormesh(X, Y, Z)` - Pseudocolor plot

**Filling:**
- `ax.fill_between(x, y1, y2, alpha=0.3)` - Fill between curves
- `ax.fill_betweenx(y, x1, x2)` - Fill between vertical curves

**Text and annotations:**
- `ax.text(x, y, text, fontsize=12)` - Add text
- `ax.annotate(text, xy=(x, y), xytext=(x2, y2), arrowprops={})` - Annotate with arrow

**Customization Methods:**

**Labels and titles:**
- `ax.set_xlabel(label, fontsize=12)` - Set x-axis label
- `ax.set_ylabel(label, fontsize=12)` - Set y-axis label
- `ax.set_title(title, fontsize=14)` - Set axes title

**Limits and scales:**
- `ax.set_xlim(left, right)` - Set x-axis limits
- `ax.set_ylim(bottom, top)` - Set y-axis limits
- `ax.set_xscale('linear'/'log'/'symlog')` - Set x-axis scale
- `ax.set_yscale('linear'/'log'/'symlog')` - Set y-axis scale

**Ticks:**
- `ax.set_xticks(positions)` - Set x-tick positions
- `ax.set_xticklabels(labels)` - Set x-tick labels
- `ax.tick_params(axis='both', labelsize=10)` - Customize tick appearance

**Grid and spines:**
- `ax.grid(True, alpha=0.3, linestyle='--')` - Add grid
- `ax.spines['top'].set_visible(False)` - Hide top spine
- `ax.spines['right'].set_visible(False)` - Hide right spine

**Legend:**
- `ax.legend(loc='best', fontsize=10, frameon=True)` - Add legend
- `ax.legend(handles, labels)` - Custom legend

**Aspect and layout:**
- `ax.set_aspect('equal'/'auto'/ratio)` - Set aspect ratio
- `ax.invert_xaxis()` - Invert x-axis
- `ax.invert_yaxis()` - Invert y-axis

### pyplot Module

High-level interface for quick plotting.

**Figure creation:**
- `plt.figure()` - Create new figure
- `plt.subplots()` - Create figure and axes
- `plt.subplot()` - Add subplot to current figure

**Plotting (uses current axes):**
- `plt.plot()` - Line plot
- `plt.scatter()` - Scatter plot
- `plt.bar()` - Bar chart
- `plt.hist()` - Histogram
- (All axes methods available)

**Display and save:**
- `plt.show()` - Display figure
- `plt.savefig()` - Save figure
- `plt.close()` - Close figure

**Style:**
- `plt.style.use(style_name)` - Apply style sheet
- `plt.style.available` - List available styles

**State management:**
- `plt.gca()` - Get current axes
- `plt.gcf()` - Get current figure
- `plt.sca(ax)` - Set current axes
- `plt.clf()` - Clear current figure
- `plt.cla()` - Clear current axes

## Line and Marker Styles

### Line Styles
- `'-'` or `'solid'` - Solid line
- `'--'` or `'dashed'` - Dashed line
- `'-.'` or `'dashdot'` - Dash-dot line
- `':'` or `'dotted'` - Dotted line
- `''` or `' '` or `'None'` - No line

### Marker Styles
- `'.'` - Point marker
- `'o'` - Circle marker
- `'v'`, `'^'`, `'<'`, `'>'` - Triangle markers
- `'s'` - Square marker
- `'p'` - Pentagon marker
- `'*'` - Star marker
- `'h'`, `'H'` - Hexagon markers
- `'+'` - Plus marker
- `'x'` - X marker
- `'D'`, `'d'` - Diamond markers

### Color Specifications

**Single character shortcuts:**
- `'b'` - Blue
- `'g'` - Green
- `'r'` - Red
- `'c'` - Cyan
- `'m'` - Magenta
- `'y'` - Yellow
- `'k'` - Black
- `'w'` - White

**Named colors:**
- `'steelblue'`, `'coral'`, `'teal'`, etc.
- See full list: https://matplotlib.org/stable/gallery/color/named_colors.html

**Other formats:**
- Hex: `'#FF5733'`
- RGB tuple: `(0.1, 0.2, 0.3)`
- RGBA tuple: `(0.1, 0.2, 0.3, 0.5)`

## Common Parameters

### Plot Function Parameters

```python
ax.plot(x, y,
    color='blue',           # Line color
    linewidth=2,            # Line width
    linestyle='--',         # Line style
    marker='o',             # Marker style
    markersize=8,           # Marker size
    markerfacecolor='red',  # Marker fill color
    markeredgecolor='black',# Marker edge color
    markeredgewidth=1,      # Marker edge width
    alpha=0.7,              # Transparency (0-1)
    label='data',           # Legend label
    zorder=2,               # Drawing order
    rasterized=True         # Rasterize for smaller file size
)
```

### Scatter Function Parameters

```python
ax.scatter(x, y,
    s=50,                   # Size (scalar or array)
    c='blue',               # Color (scalar, array, or sequence)
    marker='o',             # Marker style
    cmap='viridis',         # Colormap (if c is numeric)
    alpha=0.5,              # Transparency
    edgecolors='black',     # Edge color
    linewidths=1,           # Edge width
    vmin=0, vmax=1,         # Color scale limits
    label='data'            # Legend label
)
```

### Text Parameters

```python
ax.text(x, y, text,
    fontsize=12,            # Font size
    fontweight='normal',    # 'normal', 'bold', 'heavy', 'light'
    fontstyle='normal',     # 'normal', 'italic', 'oblique'
    fontfamily='sans-serif',# Font family
    color='black',          # Text color
    alpha=1.0,              # Transparency
    ha='center',            # Horizontal alignment: 'left', 'center', 'right'
    va='center',            # Vertical alignment: 'top', 'center', 'bottom', 'baseline'
    rotation=0,             # Rotation angle in degrees
    bbox=dict(              # Background box
        facecolor='white',
        edgecolor='black',
        boxstyle='round'
    )
)
```

## rcParams Configuration

Common rcParams settings for global customization:

```python
# Font settings
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.sans-serif'] = ['Arial', 'Helvetica']
plt.rcParams['font.size'] = 12

# Figure settings
plt.rcParams['figure.figsize'] = (10, 6)
plt.rcParams['figure.dpi'] = 100
plt.rcParams['figure.facecolor'] = 'white'
plt.rcParams['savefig.dpi'] = 300
plt.rcParams['savefig.bbox'] = 'tight'

# Axes settings
plt.rcParams['axes.labelsize'] = 14
plt.rcParams['axes.titlesize'] = 16
plt.rcParams['axes.grid'] = True
plt.rcParams['axes.grid.alpha'] = 0.3

# Line settings
plt.rcParams['lines.linewidth'] = 2
plt.rcParams['lines.markersize'] = 8

# Tick settings
plt.rcParams['xtick.labelsize'] = 10
plt.rcParams['ytick.labelsize'] = 10
plt.rcParams['xtick.direction'] = 'in'  # 'in', 'out', 'inout'
plt.rcParams['ytick.direction'] = 'in'

# Legend settings
plt.rcParams['legend.fontsize'] = 12
plt.rcParams['legend.frameon'] = True
plt.rcParams['legend.framealpha'] = 0.8

# Grid settings
plt.rcParams['grid.alpha'] = 0.3
plt.rcParams['grid.linestyle'] = '--'
```

## GridSpec for Complex Layouts

```python
from matplotlib.gridspec import GridSpec

fig = plt.figure(figsize=(12, 8))
gs = GridSpec(3, 3, figure=fig, hspace=0.3, wspace=0.3)

# Span multiple cells
ax1 = fig.add_subplot(gs[0, :])      # Top row, all columns
ax2 = fig.add_subplot(gs[1:, 0])     # Bottom two rows, first column
ax3 = fig.add_subplot(gs[1, 1:])     # Middle row, last two columns
ax4 = fig.add_subplot(gs[2, 1])      # Bottom row, middle column
ax5 = fig.add_subplot(gs[2, 2])      # Bottom row, right column
```

## 3D Plotting

```python
from mpl_toolkits.mplot3d import Axes3D

fig = plt.figure()
ax = fig.add_subplot(111, projection='3d')

# Plot types
ax.plot(x, y, z)                    # 3D line
ax.scatter(x, y, z)                 # 3D scatter
ax.plot_surface(X, Y, Z)            # 3D surface
ax.plot_wireframe(X, Y, Z)          # 3D wireframe
ax.contour(X, Y, Z)                 # 3D contour
ax.bar3d(x, y, z, dx, dy, dz)       # 3D bar

# Customization
ax.set_xlabel('X')
ax.set_ylabel('Y')
ax.set_zlabel('Z')
ax.view_init(elev=30, azim=45)      # Set viewing angle
```

## Animation

```python
from matplotlib.animation import FuncAnimation

fig, ax = plt.subplots()
line, = ax.plot([], [])

def init():
    ax.set_xlim(0, 2*np.pi)
    ax.set_ylim(-1, 1)
    return line,

def update(frame):
    x = np.linspace(0, 2*np.pi, 100)
    y = np.sin(x + frame/10)
    line.set_data(x, y)
    return line,

anim = FuncAnimation(fig, update, init_func=init,
                     frames=100, interval=50, blit=True)

# Save animation
anim.save('animation.gif', writer='pillow', fps=20)
anim.save('animation.mp4', writer='ffmpeg', fps=20)
```

## Image Operations

```python
# Read and display image
img = plt.imread('image.png')
ax.imshow(img)

# Display matrix as image
ax.imshow(matrix, cmap='viridis', aspect='auto',
          interpolation='nearest', origin='lower')

# Colorbar
cbar = plt.colorbar(im, ax=ax)
cbar.set_label('Values')

# Image extent (set coordinates)
ax.imshow(img, extent=[x_min, x_max, y_min, y_max])
```

## Event Handling

```python
# Mouse click event
def on_click(event):
    if event.inaxes:
        print(f'Clicked at x={event.xdata:.2f}, y={event.ydata:.2f}')

fig.canvas.mpl_connect('button_press_event', on_click)

# Key press event
def on_key(event):
    print(f'Key pressed: {event.key}')

fig.canvas.mpl_connect('key_press_event', on_key)
```

## Useful Utilities

```python
# Get current axis limits
xlims = ax.get_xlim()
ylims = ax.get_ylim()

# Set equal aspect ratio
ax.set_aspect('equal', adjustable='box')

# Share axes between subplots
fig, (ax1, ax2) = plt.subplots(2, 1, sharex=True)

# Twin axes (two y-axes)
ax2 = ax1.twinx()

# Remove tick labels
ax.set_xticklabels([])
ax.set_yticklabels([])

# Scientific notation
ax.ticklabel_format(style='scientific', axis='y', scilimits=(0,0))

# Date formatting
import matplotlib.dates as mdates
ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
ax.xaxis.set_major_locator(mdates.DayLocator(interval=7))
```
