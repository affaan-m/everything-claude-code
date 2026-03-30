# Data Visualization

This reference covers Vaex's visualization capabilities for creating plots, heatmaps, and interactive visualizations of large datasets.

## Overview

Vaex excels at visualizing datasets with billions of rows through efficient binning and aggregation. The visualization system works directly with large data without sampling, providing accurate representations of the entire dataset.

**Key features:**
- Visualize billion-row datasets interactively
- No sampling required - uses all data
- Automatic binning and aggregation
- Integration with matplotlib
- Interactive widgets for Jupyter

## Basic Plotting

### 1D Histograms

```python
import vaex
import matplotlib.pyplot as plt

df = vaex.open('data.hdf5')

# Simple histogram
df.plot1d(df.age)

# With customization
df.plot1d(df.age,
          limits=[0, 100],
          shape=50,              # Number of bins
          figsize=(10, 6),
          xlabel='Age',
          ylabel='Count')

plt.show()
```

### 2D Density Plots (Heatmaps)

```python
# Basic 2D plot
df.plot(df.x, df.y)

# With limits
df.plot(df.x, df.y, limits=[[0, 10], [0, 10]])

# Auto limits using percentiles
df.plot(df.x, df.y, limits='99.7%')  # 3-sigma limits

# Customize shape (resolution)
df.plot(df.x, df.y, shape=(512, 512))

# Logarithmic color scale
df.plot(df.x, df.y, f='log')
```

### Scatter Plots (Small Data)

```python
# For smaller datasets or samples
df_sample = df.sample(n=1000)

df_sample.scatter(df_sample.x, df_sample.y,
                  alpha=0.5,
                  s=10)  # Point size

plt.show()
```

## Advanced Visualization Options

### Color Scales and Normalization

```python
# Linear scale (default)
df.plot(df.x, df.y, f='identity')

# Logarithmic scale
df.plot(df.x, df.y, f='log')
df.plot(df.x, df.y, f='log10')

# Square root scale
df.plot(df.x, df.y, f='sqrt')

# Custom colormap
df.plot(df.x, df.y, colormap='viridis')
df.plot(df.x, df.y, colormap='plasma')
df.plot(df.x, df.y, colormap='hot')
```

### Limits and Ranges

```python
# Manual limits
df.plot(df.x, df.y, limits=[[xmin, xmax], [ymin, ymax]])

# Percentile-based limits
df.plot(df.x, df.y, limits='99.7%')  # 3-sigma
df.plot(df.x, df.y, limits='95%')
df.plot(df.x, df.y, limits='minmax')  # Full range

# Mixed limits
df.plot(df.x, df.y, limits=[[0, 100], 'minmax'])
```

### Resolution Control

```python
# Higher resolution (more bins)
df.plot(df.x, df.y, shape=(1024, 1024))

# Lower resolution (faster)
df.plot(df.x, df.y, shape=(128, 128))

# Different resolutions per axis
df.plot(df.x, df.y, shape=(512, 256))
```

## Statistical Visualizations

### Visualizing Aggregations

```python
# Mean on a grid
df.plot(df.x, df.y, what=df.z.mean(),
        limits=[[0, 10], [0, 10]],
        shape=(100, 100),
        colormap='viridis')

# Standard deviation
df.plot(df.x, df.y, what=df.z.std())

# Sum
df.plot(df.x, df.y, what=df.z.sum())

# Count (default)
df.plot(df.x, df.y, what='count')
```

### Multiple Statistics

```python
# Create figure with subplots
fig, axes = plt.subplots(2, 2, figsize=(12, 10))

# Count
df.plot(df.x, df.y, what='count',
        ax=axes[0, 0], show=False)
axes[0, 0].set_title('Count')

# Mean
df.plot(df.x, df.y, what=df.z.mean(),
        ax=axes[0, 1], show=False)
axes[0, 1].set_title('Mean of z')

# Std
df.plot(df.x, df.y, what=df.z.std(),
        ax=axes[1, 0], show=False)
axes[1, 0].set_title('Std of z')

# Min
df.plot(df.x, df.y, what=df.z.min(),
        ax=axes[1, 1], show=False)
axes[1, 1].set_title('Min of z')

plt.tight_layout()
plt.show()
```

## Working with Selections

Visualize different segments of data simultaneously:

```python
import vaex
import matplotlib.pyplot as plt

df = vaex.open('data.hdf5')

# Create selections
df.select(df.category == 'A', name='group_a')
df.select(df.category == 'B', name='group_b')

# Plot both selections
df.plot1d(df.value, selection='group_a', label='Group A')
df.plot1d(df.value, selection='group_b', label='Group B')
plt.legend()
plt.show()

# 2D plot with selection
df.plot(df.x, df.y, selection='group_a')
```

### Overlay Multiple Selections

```python
# Create base plot
fig, ax = plt.subplots(figsize=(10, 8))

# Plot each selection with different colors
df.plot(df.x, df.y, selection='group_a',
        ax=ax, show=False, colormap='Reds', alpha=0.5)
df.plot(df.x, df.y, selection='group_b',
        ax=ax, show=False, colormap='Blues', alpha=0.5)

ax.set_title('Overlaid Selections')
plt.show()
```

## Subplots and Layouts

### Creating Multiple Plots

```python
import matplotlib.pyplot as plt

# Create subplot grid
fig, axes = plt.subplots(2, 3, figsize=(15, 10))

# Plot different variables
variables = ['x', 'y', 'z', 'a', 'b', 'c']
for idx, var in enumerate(variables):
    row = idx // 3
    col = idx % 3
    df.plot1d(df[var], ax=axes[row, col], show=False)
    axes[row, col].set_title(f'Distribution of {var}')

plt.tight_layout()
plt.show()
```

### Faceted Plots

```python
# Plot by category
categories = df.category.unique()

fig, axes = plt.subplots(1, len(categories), figsize=(15, 5))

for idx, cat in enumerate(categories):
    df_cat = df[df.category == cat]
    df_cat.plot(df_cat.x, df_cat.y,
                ax=axes[idx], show=False)
    axes[idx].set_title(f'Category {cat}')

plt.tight_layout()
plt.show()
```

## Interactive Widgets (Jupyter)

Create interactive visualizations in Jupyter notebooks:

### Selection Widget

```python
# Interactive selection
df.widget.selection_expression()
```

### Histogram Widget

```python
# Interactive histogram with selection
df.plot_widget(df.x, df.y)
```

### Scatter Widget

```python
# Interactive scatter plot
df.scatter_widget(df.x, df.y)
```

## Customization

### Styling Plots

```python
import matplotlib.pyplot as plt

# Create plot with custom styling
fig, ax = plt.subplots(figsize=(12, 8))

df.plot(df.x, df.y,
        limits='99%',
        shape=(256, 256),
        colormap='plasma',
        ax=ax,
        show=False)

# Customize axes
ax.set_xlabel('X Variable', fontsize=14, fontweight='bold')
ax.set_ylabel('Y Variable', fontsize=14, fontweight='bold')
ax.set_title('Custom Density Plot', fontsize=16, fontweight='bold')
ax.grid(alpha=0.3)

# Add colorbar
plt.colorbar(ax.collections[0], ax=ax, label='Density')

plt.tight_layout()
plt.show()
```

### Figure Size and DPI

```python
# High-resolution plot
df.plot(df.x, df.y,
        figsize=(12, 10),
        dpi=300)
```

## Specialized Visualizations

### Hexbin Plots

```python
# Alternative to heatmap using hexagonal bins
plt.figure(figsize=(10, 8))
plt.hexbin(df.x.values[:100000], df.y.values[:100000],
           gridsize=50, cmap='viridis')
plt.colorbar(label='Count')
plt.xlabel('X')
plt.ylabel('Y')
plt.show()
```

### Contour Plots

```python
import numpy as np

# Get 2D histogram data
counts = df.count(binby=[df.x, df.y],
                  limits=[[0, 10], [0, 10]],
                  shape=(100, 100))

# Create contour plot
x = np.linspace(0, 10, 100)
y = np.linspace(0, 10, 100)
plt.contourf(x, y, counts.T, levels=20, cmap='viridis')
plt.colorbar(label='Count')
plt.xlabel('X')
plt.ylabel('Y')
plt.title('Contour Plot')
plt.show()
```

### Vector Field Overlay

```python
# Compute mean vectors on grid
mean_vx = df.mean(df.vx, binby=[df.x, df.y],
                  limits=[[0, 10], [0, 10]],
                  shape=(20, 20))
mean_vy = df.mean(df.vy, binby=[df.x, df.y],
                  limits=[[0, 10], [0, 10]],
                  shape=(20, 20))

# Create grid
x = np.linspace(0, 10, 20)
y = np.linspace(0, 10, 20)
X, Y = np.meshgrid(x, y)

# Plot
fig, ax = plt.subplots(figsize=(10, 8))

# Base heatmap
df.plot(df.x, df.y, ax=ax, show=False)

# Vector overlay
ax.quiver(X, Y, mean_vx.T, mean_vy.T, alpha=0.7, color='white')

plt.show()
```

## Performance Considerations

### Optimizing Large Visualizations

```python
# For very large datasets, reduce shape
df.plot(df.x, df.y, shape=(256, 256))  # Fast

# For publication quality
df.plot(df.x, df.y, shape=(1024, 1024))  # Higher quality

# Balance quality and performance
df.plot(df.x, df.y, shape=(512, 512))  # Good balance
```

### Caching Visualization Data

```python
# Compute once, plot multiple times
counts = df.count(binby=[df.x, df.y],
                  limits=[[0, 10], [0, 10]],
                  shape=(512, 512))

# Use in different plots
plt.figure()
plt.imshow(counts.T, origin='lower', cmap='viridis')
plt.colorbar()
plt.show()

plt.figure()
plt.imshow(np.log10(counts.T + 1), origin='lower', cmap='plasma')
plt.colorbar()
plt.show()
```

## Export and Saving

### Saving Figures

```python
# Save as PNG
df.plot(df.x, df.y)
plt.savefig('plot.png', dpi=300, bbox_inches='tight')

# Save as PDF (vector)
plt.savefig('plot.pdf', bbox_inches='tight')

# Save as SVG
plt.savefig('plot.svg', bbox_inches='tight')
```

### Batch Plotting

```python
# Generate multiple plots
variables = ['x', 'y', 'z']

for var in variables:
    plt.figure(figsize=(10, 6))
    df.plot1d(df[var])
    plt.title(f'Distribution of {var}')
    plt.savefig(f'plot_{var}.png', dpi=300, bbox_inches='tight')
    plt.close()
```

## Common Patterns

### Pattern: Exploratory Data Analysis

```python
import matplotlib.pyplot as plt

# Create comprehensive visualization
fig = plt.figure(figsize=(16, 12))

# 1D histograms
ax1 = plt.subplot(3, 3, 1)
df.plot1d(df.x, ax=ax1, show=False)
ax1.set_title('X Distribution')

ax2 = plt.subplot(3, 3, 2)
df.plot1d(df.y, ax=ax2, show=False)
ax2.set_title('Y Distribution')

ax3 = plt.subplot(3, 3, 3)
df.plot1d(df.z, ax=ax3, show=False)
ax3.set_title('Z Distribution')

# 2D plots
ax4 = plt.subplot(3, 3, 4)
df.plot(df.x, df.y, ax=ax4, show=False)
ax4.set_title('X vs Y')

ax5 = plt.subplot(3, 3, 5)
df.plot(df.x, df.z, ax=ax5, show=False)
ax5.set_title('X vs Z')

ax6 = plt.subplot(3, 3, 6)
df.plot(df.y, df.z, ax=ax6, show=False)
ax6.set_title('Y vs Z')

# Statistics on grids
ax7 = plt.subplot(3, 3, 7)
df.plot(df.x, df.y, what=df.z.mean(), ax=ax7, show=False)
ax7.set_title('Mean Z on X-Y grid')

plt.tight_layout()
plt.savefig('eda_summary.png', dpi=300, bbox_inches='tight')
plt.show()
```

### Pattern: Comparison Across Groups

```python
# Compare distributions by category
categories = df.category.unique()

fig, axes = plt.subplots(len(categories), 2,
                         figsize=(12, 4 * len(categories)))

for idx, cat in enumerate(categories):
    df.select(df.category == cat, name=f'cat_{cat}')

    # 1D histogram
    df.plot1d(df.value, selection=f'cat_{cat}',
              ax=axes[idx, 0], show=False)
    axes[idx, 0].set_title(f'Category {cat} - Distribution')

    # 2D plot
    df.plot(df.x, df.y, selection=f'cat_{cat}',
            ax=axes[idx, 1], show=False)
    axes[idx, 1].set_title(f'Category {cat} - X vs Y')

plt.tight_layout()
plt.show()
```

### Pattern: Time Series Visualization

```python
# Aggregate by time bins
df['year'] = df.timestamp.dt.year
df['month'] = df.timestamp.dt.month

# Plot time series
monthly_sales = df.groupby(['year', 'month']).agg({'sales': 'sum'})

plt.figure(figsize=(14, 6))
plt.plot(range(len(monthly_sales)), monthly_sales['sales'])
plt.xlabel('Time Period')
plt.ylabel('Sales')
plt.title('Sales Over Time')
plt.grid(alpha=0.3)
plt.show()
```

## Integration with Other Libraries

### Plotly for Interactivity

```python
import plotly.graph_objects as go

# Get data from Vaex
counts = df.count(binby=[df.x, df.y], shape=(100, 100))

# Create plotly figure
fig = go.Figure(data=go.Heatmap(z=counts.T))
fig.update_layout(title='Interactive Heatmap')
fig.show()
```

### Seaborn Style

```python
import seaborn as sns
import matplotlib.pyplot as plt

# Use seaborn styling
sns.set_style('darkgrid')
sns.set_palette('husl')

df.plot1d(df.value)
plt.show()
```

## Best Practices

1. **Use appropriate shape** - Balance resolution and performance (256-512 for exploration, 1024+ for publication)
2. **Apply sensible limits** - Use percentile-based limits ('99%', '99.7%') to handle outliers
3. **Choose color scales wisely** - Log scale for wide-ranging counts, linear for uniform data
4. **Leverage selections** - Compare subsets without creating new DataFrames
5. **Cache aggregations** - Compute once if creating multiple similar plots
6. **Use vector formats for publication** - Save as PDF or SVG for scalable figures
7. **Avoid sampling** - Vaex visualizations use all data, no sampling needed

## Troubleshooting

### Issue: Empty or Sparse Plot

```python
# Problem: Limits don't match data range
df.plot(df.x, df.y, limits=[[0, 10], [0, 10]])

# Solution: Use automatic limits
df.plot(df.x, df.y, limits='minmax')
df.plot(df.x, df.y, limits='99%')
```

### Issue: Plot Too Slow

```python
# Problem: Too high resolution
df.plot(df.x, df.y, shape=(2048, 2048))

# Solution: Reduce shape
df.plot(df.x, df.y, shape=(512, 512))
```

### Issue: Can't See Low-Density Regions

```python
# Problem: Linear scale overwhelmed by high-density areas
df.plot(df.x, df.y, f='identity')

# Solution: Use logarithmic scale
df.plot(df.x, df.y, f='log')
```

## Related Resources

- For data aggregation: See `data_processing.md`
- For performance optimization: See `performance.md`
- For DataFrame basics: See `core_dataframes.md`
