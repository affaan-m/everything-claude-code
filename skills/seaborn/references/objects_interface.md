# Seaborn Objects Interface

The `seaborn.objects` interface provides a modern, declarative API for building visualizations through composition. This guide covers the complete objects interface introduced in seaborn 0.12+.

## Core Concept

The objects interface separates **what you want to show** (data and mappings) from **how to show it** (marks, stats, and moves). Build plots by:

1. Creating a `Plot` object with data and aesthetic mappings
2. Adding layers with `.add()` combining marks and statistical transformations
3. Customizing with `.scale()`, `.label()`, `.limit()`, `.theme()`, etc.
4. Rendering with `.show()` or `.save()`

## Basic Usage

```python
from seaborn import objects as so
import pandas as pd

# Create plot with data and mappings
p = so.Plot(data=df, x='x_var', y='y_var')

# Add mark (visual representation)
p = p.add(so.Dot())

# Display (automatic in Jupyter)
p.show()
```

## Plot Class

The `Plot` class is the foundation of the objects interface.

### Initialization

```python
so.Plot(data=None, x=None, y=None, color=None, alpha=None,
        fill=None, fillalpha=None, fillcolor=None, marker=None,
        pointsize=None, stroke=None, text=None, **variables)
```

**Parameters:**
- `data` - DataFrame or dict of data vectors
- `x, y` - Variables for position
- `color` - Variable for color encoding
- `alpha` - Variable for transparency
- `marker` - Variable for marker shape
- `pointsize` - Variable for point size
- `stroke` - Variable for line width
- `text` - Variable for text labels
- `**variables` - Additional mappings using property names

**Examples:**
```python
# Basic mapping
so.Plot(df, x='total_bill', y='tip')

# Multiple mappings
so.Plot(df, x='total_bill', y='tip', color='day', pointsize='size')

# All variables in Plot
p = so.Plot(df, x='x', y='y', color='cat')
p.add(so.Dot())  # Uses all mappings

# Some variables in add()
p = so.Plot(df, x='x', y='y')
p.add(so.Dot(), color='cat')  # Only this layer uses color
```

### Methods

#### add()

Add a layer to the plot with mark and optional stat/move.

```python
Plot.add(mark, *transforms, orient=None, legend=True, data=None,
         **variables)
```

**Parameters:**
- `mark` - Mark object defining visual representation
- `*transforms` - Stat and/or Move objects for data transformation
- `orient` - "x", "y", or "v"/"h" for orientation
- `legend` - Include in legend (True/False)
- `data` - Override data for this layer
- `**variables` - Override or add variable mappings

**Examples:**
```python
# Simple mark
p.add(so.Dot())

# Mark with stat
p.add(so.Line(), so.PolyFit(order=2))

# Mark with multiple transforms
p.add(so.Bar(), so.Agg(), so.Dodge())

# Layer-specific mappings
p.add(so.Dot(), color='category')
p.add(so.Line(), so.Agg(), color='category')

# Layer-specific data
p.add(so.Dot())
p.add(so.Line(), data=summary_df)
```

#### facet()

Create subplots from categorical variables.

```python
Plot.facet(col=None, row=None, order=None, wrap=None)
```

**Parameters:**
- `col` - Variable for column facets
- `row` - Variable for row facets
- `order` - Dict with facet orders (keys: variable names)
- `wrap` - Wrap columns after this many

**Example:**
```python
p.facet(col='time', row='sex')
p.facet(col='category', wrap=3)
p.facet(col='day', order={'day': ['Thur', 'Fri', 'Sat', 'Sun']})
```

#### pair()

Create pairwise subplots for multiple variables.

```python
Plot.pair(x=None, y=None, wrap=None, cross=True)
```

**Parameters:**
- `x` - Variables for x-axis pairings
- `y` - Variables for y-axis pairings (if None, uses x)
- `wrap` - Wrap after this many columns
- `cross` - Include all x/y combinations (vs. only diagonal)

**Example:**
```python
# Pairs of all variables
p = so.Plot(df).pair(x=['a', 'b', 'c'])
p.add(so.Dot())

# Rectangular grid
p = so.Plot(df).pair(x=['a', 'b'], y=['c', 'd'])
p.add(so.Dot(), alpha=0.5)
```

#### scale()

Customize how data maps to visual properties.

```python
Plot.scale(**scales)
```

**Parameters:** Keyword arguments with property names and Scale objects

**Example:**
```python
p.scale(
    x=so.Continuous().tick(every=5),
    y=so.Continuous().label(like='{x:.1f}'),
    color=so.Nominal(['#1f77b4', '#ff7f0e', '#2ca02c']),
    pointsize=(5, 10)  # Shorthand for range
)
```

#### limit()

Set axis limits.

```python
Plot.limit(x=None, y=None)
```

**Parameters:**
- `x` - Tuple of (min, max) for x-axis
- `y` - Tuple of (min, max) for y-axis

**Example:**
```python
p.limit(x=(0, 100), y=(0, 50))
```

#### label()

Set axis labels and titles.

```python
Plot.label(x=None, y=None, color=None, title=None, **labels)
```

**Parameters:** Keyword arguments with property names and label strings

**Example:**
```python
p.label(
    x='Total Bill ($)',
    y='Tip Amount ($)',
    color='Day of Week',
    title='Restaurant Tips Analysis'
)
```

#### theme()

Apply matplotlib style settings.

```python
Plot.theme(config, **kwargs)
```

**Parameters:**
- `config` - Dict of rcParams or seaborn theme dict
- `**kwargs` - Individual rcParams

**Example:**
```python
# Seaborn theme
p.theme({**sns.axes_style('whitegrid'), **sns.plotting_context('talk')})

# Custom rcParams
p.theme({'axes.facecolor': 'white', 'axes.grid': True})

# Individual parameters
p.theme(axes_facecolor='white', font_scale=1.2)
```

#### layout()

Configure subplot layout.

```python
Plot.layout(size=None, extent=None, engine=None)
```

**Parameters:**
- `size` - (width, height) in inches
- `extent` - (left, bottom, right, top) for subplots
- `engine` - "tight", "constrained", or None

**Example:**
```python
p.layout(size=(10, 6), engine='constrained')
```

#### share()

Control axis sharing across facets.

```python
Plot.share(x=None, y=None)
```

**Parameters:**
- `x` - Share x-axis: True, False, or "col"/"row"
- `y` - Share y-axis: True, False, or "col"/"row"

**Example:**
```python
p.share(x=True, y=False)  # Share x across all, independent y
p.share(x='col')  # Share x within columns only
```

#### on()

Plot on existing matplotlib figure or axes.

```python
Plot.on(target)
```

**Parameters:**
- `target` - matplotlib Figure or Axes object

**Example:**
```python
import matplotlib.pyplot as plt

fig, axes = plt.subplots(2, 2, figsize=(10, 10))
so.Plot(df, x='x', y='y').add(so.Dot()).on(axes[0, 0])
so.Plot(df, x='x', y='z').add(so.Line()).on(axes[0, 1])
```

#### show()

Render and display the plot.

```python
Plot.show(**kwargs)
```

**Parameters:** Passed to `matplotlib.pyplot.show()`

#### save()

Save the plot to file.

```python
Plot.save(filename, **kwargs)
```

**Parameters:**
- `filename` - Output filename
- `**kwargs` - Passed to `matplotlib.figure.Figure.savefig()`

**Example:**
```python
p.save('plot.png', dpi=300, bbox_inches='tight')
p.save('plot.pdf')
```

## Mark Objects

Marks define how data is visually represented.

### Dot

Points/markers for individual observations.

```python
so.Dot(artist_kws=None, **kwargs)
```

**Properties:**
- `color` - Fill color
- `alpha` - Transparency
- `fillcolor` - Alternate color property
- `fillalpha` - Alternate alpha property
- `edgecolor` - Edge color
- `edgealpha` - Edge transparency
- `edgewidth` - Edge line width
- `marker` - Marker style
- `pointsize` - Marker size
- `stroke` - Edge width

**Example:**
```python
so.Plot(df, x='x', y='y').add(so.Dot(color='blue', pointsize=10))
so.Plot(df, x='x', y='y', color='cat').add(so.Dot(alpha=0.5))
```

### Line

Lines connecting observations.

```python
so.Line(artist_kws=None, **kwargs)
```

**Properties:**
- `color` - Line color
- `alpha` - Transparency
- `linewidth` - Line width
- `linestyle` - Line style ("-", "--", "-.", ":")
- `marker` - Marker at data points
- `pointsize` - Marker size
- `edgecolor` - Marker edge color
- `edgewidth` - Marker edge width

**Example:**
```python
so.Plot(df, x='x', y='y').add(so.Line())
so.Plot(df, x='x', y='y', color='cat').add(so.Line(linewidth=2))
```

### Path

Like Line but connects points in data order (not sorted by x).

```python
so.Path(artist_kws=None, **kwargs)
```

Properties same as `Line`.

**Example:**
```python
# For trajectories, loops, etc.
so.Plot(trajectory_df, x='x', y='y').add(so.Path())
```

### Bar

Rectangular bars.

```python
so.Bar(artist_kws=None, **kwargs)
```

**Properties:**
- `color` - Fill color
- `alpha` - Transparency
- `edgecolor` - Edge color
- `edgealpha` - Edge transparency
- `edgewidth` - Edge line width
- `width` - Bar width (data units)

**Example:**
```python
so.Plot(df, x='category', y='value').add(so.Bar())
so.Plot(df, x='x', y='y').add(so.Bar(color='#1f77b4', width=0.5))
```

### Bars

Multiple bars (for aggregated data with error bars).

```python
so.Bars(artist_kws=None, **kwargs)
```

Properties same as `Bar`. Used with `Agg()` or `Est()` stats.

**Example:**
```python
so.Plot(df, x='category', y='value').add(so.Bars(), so.Agg())
```

### Area

Filled area between line and baseline.

```python
so.Area(artist_kws=None, **kwargs)
```

**Properties:**
- `color` - Fill color
- `alpha` - Transparency
- `edgecolor` - Edge color
- `edgealpha` - Edge transparency
- `edgewidth` - Edge line width
- `baseline` - Baseline value (default: 0)

**Example:**
```python
so.Plot(df, x='x', y='y').add(so.Area(alpha=0.3))
so.Plot(df, x='x', y='y', color='cat').add(so.Area())
```

### Band

Filled band between two lines (for ranges/intervals).

```python
so.Band(artist_kws=None, **kwargs)
```

Properties same as `Area`. Requires `ymin` and `ymax` mappings or used with `Est()` stat.

**Example:**
```python
so.Plot(df, x='x', ymin='lower', ymax='upper').add(so.Band())
so.Plot(df, x='x', y='y').add(so.Band(), so.Est())
```

### Range

Line with markers at endpoints (for ranges).

```python
so.Range(artist_kws=None, **kwargs)
```

**Properties:**
- `color` - Line and marker color
- `alpha` - Transparency
- `linewidth` - Line width
- `marker` - Marker style at endpoints
- `pointsize` - Marker size
- `edgewidth` - Marker edge width

**Example:**
```python
so.Plot(df, x='x', y='y').add(so.Range(), so.Est())
```

### Dash

Short horizontal/vertical lines (for distribution marks).

```python
so.Dash(artist_kws=None, **kwargs)
```

**Properties:**
- `color` - Line color
- `alpha` - Transparency
- `linewidth` - Line width
- `width` - Dash length (data units)

**Example:**
```python
so.Plot(df, x='category', y='value').add(so.Dash())
```

### Text

Text labels at data points.

```python
so.Text(artist_kws=None, **kwargs)
```

**Properties:**
- `color` - Text color
- `alpha` - Transparency
- `fontsize` - Font size
- `halign` - Horizontal alignment: "left", "center", "right"
- `valign` - Vertical alignment: "bottom", "center", "top"
- `offset` - (x, y) offset from point

Requires `text` mapping.

**Example:**
```python
so.Plot(df, x='x', y='y', text='label').add(so.Text())
so.Plot(df, x='x', y='y', text='value').add(so.Text(fontsize=10, offset=(0, 5)))
```

## Stat Objects

Stats transform data before rendering. Compose with marks in `.add()`.

### Agg

Aggregate observations by group.

```python
so.Agg(func='mean')
```

**Parameters:**
- `func` - Aggregation function: "mean", "median", "sum", "min", "max", "count", or callable

**Example:**
```python
so.Plot(df, x='category', y='value').add(so.Bar(), so.Agg('mean'))
so.Plot(df, x='x', y='y', color='group').add(so.Line(), so.Agg('median'))
```

### Est

Estimate central tendency with error intervals.

```python
so.Est(func='mean', errorbar=('ci', 95), n_boot=1000, seed=None)
```

**Parameters:**
- `func` - Estimator: "mean", "median", "sum", or callable
- `errorbar` - Error representation:
  - `("ci", level)` - Confidence interval via bootstrap
  - `("pi", level)` - Percentile interval
  - `("se", scale)` - Standard error scaled by factor
  - `"sd"` - Standard deviation
- `n_boot` - Bootstrap iterations
- `seed` - Random seed

**Example:**
```python
so.Plot(df, x='category', y='value').add(so.Bar(), so.Est())
so.Plot(df, x='x', y='y').add(so.Line(), so.Est(errorbar='sd'))
so.Plot(df, x='x', y='y').add(so.Line(), so.Est(errorbar=('ci', 95)))
so.Plot(df, x='x', y='y').add(so.Band(), so.Est())
```

### Hist

Bin observations and count/aggregate.

```python
so.Hist(stat='count', bins='auto', binwidth=None, binrange=None,
        common_norm=True, common_bins=True, cumulative=False)
```

**Parameters:**
- `stat` - "count", "density", "probability", "percent", "frequency"
- `bins` - Number of bins, bin method, or edges
- `binwidth` - Width of bins
- `binrange` - (min, max) range for binning
- `common_norm` - Normalize across groups together
- `common_bins` - Use same bins for all groups
- `cumulative` - Cumulative histogram

**Example:**
```python
so.Plot(df, x='value').add(so.Bars(), so.Hist())
so.Plot(df, x='value').add(so.Bars(), so.Hist(bins=20, stat='density'))
so.Plot(df, x='value', color='group').add(so.Area(), so.Hist(cumulative=True))
```

### KDE

Kernel density estimate.

```python
so.KDE(bw_method='scott', bw_adjust=1, gridsize=200,
       cut=3, cumulative=False)
```

**Parameters:**
- `bw_method` - Bandwidth method: "scott", "silverman", or scalar
- `bw_adjust` - Bandwidth multiplier
- `gridsize` - Resolution of density curve
- `cut` - Extension beyond data range (in bandwidth units)
- `cumulative` - Cumulative density

**Example:**
```python
so.Plot(df, x='value').add(so.Line(), so.KDE())
so.Plot(df, x='value', color='group').add(so.Area(alpha=0.5), so.KDE())
so.Plot(df, x='x', y='y').add(so.Line(), so.KDE(bw_adjust=0.5))
```

### Count

Count observations per group.

```python
so.Count()
```

**Example:**
```python
so.Plot(df, x='category').add(so.Bar(), so.Count())
```

### PolyFit

Polynomial regression fit.

```python
so.PolyFit(order=1)
```

**Parameters:**
- `order` - Polynomial order (1 = linear, 2 = quadratic, etc.)

**Example:**
```python
so.Plot(df, x='x', y='y').add(so.Dot())
so.Plot(df, x='x', y='y').add(so.Line(), so.PolyFit(order=2))
```

### Perc

Compute percentiles.

```python
so.Perc(k=5, method='linear')
```

**Parameters:**
- `k` - Number of percentile intervals
- `method` - Interpolation method

**Example:**
```python
so.Plot(df, x='x', y='y').add(so.Band(), so.Perc())
```

## Move Objects

Moves adjust positions to resolve overlaps or create specific layouts.

### Dodge

Shift positions side-by-side.

```python
so.Dodge(empty='keep', gap=0)
```

**Parameters:**
- `empty` - How to handle empty groups: "keep", "drop", "fill"
- `gap` - Gap between dodged elements (proportion)

**Example:**
```python
so.Plot(df, x='category', y='value', color='group').add(so.Bar(), so.Dodge())
so.Plot(df, x='cat', y='val', color='hue').add(so.Dot(), so.Dodge(gap=0.1))
```

### Stack

Stack marks vertically.

```python
so.Stack()
```

**Example:**
```python
so.Plot(df, x='x', y='y', color='category').add(so.Bar(), so.Stack())
so.Plot(df, x='x', y='y', color='group').add(so.Area(), so.Stack())
```

### Jitter

Add random noise to positions.

```python
so.Jitter(width=None, height=None, seed=None)
```

**Parameters:**
- `width` - Jitter in x direction (data units or proportion)
- `height` - Jitter in y direction
- `seed` - Random seed

**Example:**
```python
so.Plot(df, x='category', y='value').add(so.Dot(), so.Jitter())
so.Plot(df, x='cat', y='val').add(so.Dot(), so.Jitter(width=0.2))
```

### Shift

Shift positions by constant amount.

```python
so.Shift(x=0, y=0)
```

**Parameters:**
- `x` - Shift in x direction (data units)
- `y` - Shift in y direction

**Example:**
```python
so.Plot(df, x='x', y='y').add(so.Dot(), so.Shift(x=1))
```

### Norm

Normalize values.

```python
so.Norm(func='max', where=None, by=None, percent=False)
```

**Parameters:**
- `func` - Normalization: "max", "sum", "area", or callable
- `where` - Apply to which axis: "x", "y", or None
- `by` - Grouping variables for separate normalization
- `percent` - Show as percentage

**Example:**
```python
so.Plot(df, x='x', y='y', color='group').add(so.Area(), so.Norm())
```

## Scale Objects

Scales control how data values map to visual properties.

### Continuous

For numeric data.

```python
so.Continuous(values=None, norm=None, trans=None)
```

**Methods:**
- `.tick(at=None, every=None, between=None, minor=None)` - Configure ticks
- `.label(like=None, base=None, unit=None)` - Format labels

**Parameters:**
- `values` - Explicit value range (min, max)
- `norm` - Normalization function
- `trans` - Transformation: "log", "sqrt", "symlog", "logit", "pow10", or callable

**Example:**
```python
p.scale(
    x=so.Continuous().tick(every=10),
    y=so.Continuous(trans='log').tick(at=[1, 10, 100]),
    color=so.Continuous(values=(0, 1)),
    pointsize=(5, 20)  # Shorthand for Continuous range
)
```

### Nominal

For categorical data.

```python
so.Nominal(values=None, order=None)
```

**Parameters:**
- `values` - Explicit values (e.g., colors, markers)
- `order` - Category order

**Example:**
```python
p.scale(
    color=so.Nominal(['#1f77b4', '#ff7f0e', '#2ca02c']),
    marker=so.Nominal(['o', 's', '^']),
    x=so.Nominal(order=['Low', 'Medium', 'High'])
)
```

### Temporal

For datetime data.

```python
so.Temporal(values=None, trans=None)
```

**Methods:**
- `.tick(every=None, between=None)` - Configure ticks
- `.label(concise=False)` - Format labels

**Example:**
```python
p.scale(x=so.Temporal().tick(every=('month', 1)).label(concise=True))
```

## Complete Examples

### Layered Plot with Statistics

```python
(
    so.Plot(df, x='total_bill', y='tip', color='time')
    .add(so.Dot(), alpha=0.5)
    .add(so.Line(), so.PolyFit(order=2))
    .scale(color=so.Nominal(['#1f77b4', '#ff7f0e']))
    .label(x='Total Bill ($)', y='Tip ($)', title='Tips Analysis')
    .theme({**sns.axes_style('whitegrid')})
)
```

### Faceted Distribution

```python
(
    so.Plot(df, x='measurement', color='treatment')
    .facet(col='timepoint', wrap=3)
    .add(so.Area(alpha=0.5), so.KDE())
    .add(so.Dot(), so.Jitter(width=0.1), y=0)
    .scale(x=so.Continuous().tick(every=5))
    .label(x='Measurement (units)', title='Treatment Effects Over Time')
    .share(x=True, y=False)
)
```

### Grouped Bar Chart

```python
(
    so.Plot(df, x='category', y='value', color='group')
    .add(so.Bar(), so.Agg('mean'), so.Dodge())
    .add(so.Range(), so.Est(errorbar='se'), so.Dodge())
    .scale(color=so.Nominal(order=['A', 'B', 'C']))
    .label(y='Mean Value', title='Comparison by Category and Group')
)
```

### Complex Multi-Layer

```python
(
    so.Plot(df, x='date', y='value')
    .add(so.Dot(color='gray', pointsize=3), alpha=0.3)
    .add(so.Line(color='blue', linewidth=2), so.Agg('mean'))
    .add(so.Band(color='blue', alpha=0.2), so.Est(errorbar=('ci', 95)))
    .facet(col='sensor', row='location')
    .scale(
        x=so.Temporal().label(concise=True),
        y=so.Continuous().tick(every=10)
    )
    .label(
        x='Date',
        y='Measurement',
        title='Sensor Measurements by Location'
    )
    .layout(size=(12, 8), engine='constrained')
)
```

## Migration from Function Interface

### Scatter Plot

**Function interface:**
```python
sns.scatterplot(data=df, x='x', y='y', hue='category', size='value')
```

**Objects interface:**
```python
so.Plot(df, x='x', y='y', color='category', pointsize='value').add(so.Dot())
```

### Line Plot with CI

**Function interface:**
```python
sns.lineplot(data=df, x='time', y='measurement', hue='group', errorbar='ci')
```

**Objects interface:**
```python
(
    so.Plot(df, x='time', y='measurement', color='group')
    .add(so.Line(), so.Est())
)
```

### Histogram

**Function interface:**
```python
sns.histplot(data=df, x='value', hue='category', stat='density', kde=True)
```

**Objects interface:**
```python
(
    so.Plot(df, x='value', color='category')
    .add(so.Bars(), so.Hist(stat='density'))
    .add(so.Line(), so.KDE())
)
```

### Bar Plot with Error Bars

**Function interface:**
```python
sns.barplot(data=df, x='category', y='value', hue='group', errorbar='ci')
```

**Objects interface:**
```python
(
    so.Plot(df, x='category', y='value', color='group')
    .add(so.Bar(), so.Agg(), so.Dodge())
    .add(so.Range(), so.Est(), so.Dodge())
)
```

## Tips and Best Practices

1. **Method chaining**: Each method returns a new Plot object, enabling fluent chaining
2. **Layer composition**: Combine multiple `.add()` calls to overlay different marks
3. **Transform order**: In `.add(mark, stat, move)`, stat applies first, then move
4. **Variable priority**: Layer-specific mappings override Plot-level mappings
5. **Scale shortcuts**: Use tuples for simple ranges: `color=(min, max)` vs full Scale object
6. **Jupyter rendering**: Plots render automatically when returned; use `.show()` otherwise
7. **Saving**: Use `.save()` rather than `plt.savefig()` for proper handling
8. **Matplotlib access**: Use `.on(ax)` to integrate with matplotlib figures
