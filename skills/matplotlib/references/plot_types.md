# Matplotlib Plot Types Guide

Comprehensive guide to different plot types in matplotlib with examples and use cases.

## 1. Line Plots

**Use cases:** Time series, continuous data, trends, function visualization

### Basic Line Plot
```python
fig, ax = plt.subplots(figsize=(10, 6))
ax.plot(x, y, linewidth=2, label='Data')
ax.set_xlabel('X axis')
ax.set_ylabel('Y axis')
ax.legend()
```

### Multiple Lines
```python
ax.plot(x, y1, label='Dataset 1', linewidth=2)
ax.plot(x, y2, label='Dataset 2', linewidth=2, linestyle='--')
ax.plot(x, y3, label='Dataset 3', linewidth=2, linestyle=':')
ax.legend()
```

### Line with Markers
```python
ax.plot(x, y, marker='o', markersize=8, linestyle='-',
        linewidth=2, markerfacecolor='red', markeredgecolor='black')
```

### Step Plot
```python
ax.step(x, y, where='mid', linewidth=2, label='Step function')
# where options: 'pre', 'post', 'mid'
```

### Error Bars
```python
ax.errorbar(x, y, yerr=error, fmt='o-', linewidth=2,
            capsize=5, capthick=2, label='With uncertainty')
```

## 2. Scatter Plots

**Use cases:** Correlations, relationships between variables, clusters, outliers

### Basic Scatter
```python
ax.scatter(x, y, s=50, alpha=0.6)
```

### Sized and Colored Scatter
```python
scatter = ax.scatter(x, y, s=sizes*100, c=colors,
                     cmap='viridis', alpha=0.6, edgecolors='black')
plt.colorbar(scatter, ax=ax, label='Color variable')
```

### Categorical Scatter
```python
for category in categories:
    mask = data['category'] == category
    ax.scatter(data[mask]['x'], data[mask]['y'],
               label=category, s=50, alpha=0.7)
ax.legend()
```

## 3. Bar Charts

**Use cases:** Categorical comparisons, discrete data, counts

### Vertical Bar Chart
```python
ax.bar(categories, values, color='steelblue',
       edgecolor='black', linewidth=1.5)
ax.set_ylabel('Values')
```

### Horizontal Bar Chart
```python
ax.barh(categories, values, color='coral',
        edgecolor='black', linewidth=1.5)
ax.set_xlabel('Values')
```

### Grouped Bar Chart
```python
x = np.arange(len(categories))
width = 0.35

ax.bar(x - width/2, values1, width, label='Group 1')
ax.bar(x + width/2, values2, width, label='Group 2')
ax.set_xticks(x)
ax.set_xticklabels(categories)
ax.legend()
```

### Stacked Bar Chart
```python
ax.bar(categories, values1, label='Part 1')
ax.bar(categories, values2, bottom=values1, label='Part 2')
ax.bar(categories, values3, bottom=values1+values2, label='Part 3')
ax.legend()
```

### Bar Chart with Error Bars
```python
ax.bar(categories, values, yerr=errors, capsize=5,
       color='steelblue', edgecolor='black')
```

### Bar Chart with Patterns
```python
bars1 = ax.bar(x - width/2, values1, width, label='Group 1',
               color='white', edgecolor='black', hatch='//')
bars2 = ax.bar(x + width/2, values2, width, label='Group 2',
               color='white', edgecolor='black', hatch='\\\\')
```

## 4. Histograms

**Use cases:** Distributions, frequency analysis

### Basic Histogram
```python
ax.hist(data, bins=30, edgecolor='black', alpha=0.7)
ax.set_xlabel('Value')
ax.set_ylabel('Frequency')
```

### Multiple Overlapping Histograms
```python
ax.hist(data1, bins=30, alpha=0.5, label='Dataset 1')
ax.hist(data2, bins=30, alpha=0.5, label='Dataset 2')
ax.legend()
```

### Normalized Histogram (Density)
```python
ax.hist(data, bins=30, density=True, alpha=0.7,
        edgecolor='black', label='Empirical')

# Overlay theoretical distribution
from scipy.stats import norm
x = np.linspace(data.min(), data.max(), 100)
ax.plot(x, norm.pdf(x, data.mean(), data.std()),
        'r-', linewidth=2, label='Normal fit')
ax.legend()
```

### 2D Histogram (Hexbin)
```python
hexbin = ax.hexbin(x, y, gridsize=30, cmap='Blues')
plt.colorbar(hexbin, ax=ax, label='Counts')
```

### 2D Histogram (hist2d)
```python
h = ax.hist2d(x, y, bins=30, cmap='Blues')
plt.colorbar(h[3], ax=ax, label='Counts')
```

## 5. Box and Violin Plots

**Use cases:** Statistical distributions, outlier detection, comparing distributions

### Box Plot
```python
ax.boxplot([data1, data2, data3],
           labels=['Group A', 'Group B', 'Group C'],
           showmeans=True, meanline=True)
ax.set_ylabel('Values')
```

### Horizontal Box Plot
```python
ax.boxplot([data1, data2, data3], vert=False,
           labels=['Group A', 'Group B', 'Group C'])
ax.set_xlabel('Values')
```

### Violin Plot
```python
parts = ax.violinplot([data1, data2, data3],
                      positions=[1, 2, 3],
                      showmeans=True, showmedians=True)
ax.set_xticks([1, 2, 3])
ax.set_xticklabels(['Group A', 'Group B', 'Group C'])
```

## 6. Heatmaps

**Use cases:** Matrix data, correlations, intensity maps

### Basic Heatmap
```python
im = ax.imshow(matrix, cmap='coolwarm', aspect='auto')
plt.colorbar(im, ax=ax, label='Values')
ax.set_xlabel('X')
ax.set_ylabel('Y')
```

### Heatmap with Annotations
```python
im = ax.imshow(matrix, cmap='coolwarm')
plt.colorbar(im, ax=ax)

# Add text annotations
for i in range(matrix.shape[0]):
    for j in range(matrix.shape[1]):
        text = ax.text(j, i, f'{matrix[i, j]:.2f}',
                       ha='center', va='center', color='black')
```

### Correlation Matrix
```python
corr = data.corr()
im = ax.imshow(corr, cmap='RdBu_r', vmin=-1, vmax=1)
plt.colorbar(im, ax=ax, label='Correlation')

# Set tick labels
ax.set_xticks(range(len(corr)))
ax.set_yticks(range(len(corr)))
ax.set_xticklabels(corr.columns, rotation=45, ha='right')
ax.set_yticklabels(corr.columns)
```

## 7. Contour Plots

**Use cases:** 3D data on 2D plane, topography, function visualization

### Contour Lines
```python
contour = ax.contour(X, Y, Z, levels=10, cmap='viridis')
ax.clabel(contour, inline=True, fontsize=8)
plt.colorbar(contour, ax=ax)
```

### Filled Contours
```python
contourf = ax.contourf(X, Y, Z, levels=20, cmap='viridis')
plt.colorbar(contourf, ax=ax)
```

### Combined Contours
```python
contourf = ax.contourf(X, Y, Z, levels=20, cmap='viridis', alpha=0.8)
contour = ax.contour(X, Y, Z, levels=10, colors='black',
                     linewidths=0.5, alpha=0.4)
ax.clabel(contour, inline=True, fontsize=8)
plt.colorbar(contourf, ax=ax)
```

## 8. Pie Charts

**Use cases:** Proportions, percentages (use sparingly)

### Basic Pie Chart
```python
ax.pie(sizes, labels=labels, autopct='%1.1f%%',
       startangle=90, colors=colors)
ax.axis('equal')  # Equal aspect ratio ensures circular pie
```

### Exploded Pie Chart
```python
explode = (0.1, 0, 0, 0)  # Explode first slice
ax.pie(sizes, explode=explode, labels=labels,
       autopct='%1.1f%%', shadow=True, startangle=90)
ax.axis('equal')
```

### Donut Chart
```python
ax.pie(sizes, labels=labels, autopct='%1.1f%%',
       wedgeprops=dict(width=0.5), startangle=90)
ax.axis('equal')
```

## 9. Polar Plots

**Use cases:** Cyclic data, directional data, radar charts

### Basic Polar Plot
```python
theta = np.linspace(0, 2*np.pi, 100)
r = np.abs(np.sin(2*theta))

ax = plt.subplot(111, projection='polar')
ax.plot(theta, r, linewidth=2)
```

### Radar Chart
```python
categories = ['A', 'B', 'C', 'D', 'E']
values = [4, 3, 5, 2, 4]

# Add first value to the end to close the polygon
angles = np.linspace(0, 2*np.pi, len(categories), endpoint=False)
values_closed = np.concatenate((values, [values[0]]))
angles_closed = np.concatenate((angles, [angles[0]]))

ax = plt.subplot(111, projection='polar')
ax.plot(angles_closed, values_closed, 'o-', linewidth=2)
ax.fill(angles_closed, values_closed, alpha=0.25)
ax.set_xticks(angles)
ax.set_xticklabels(categories)
```

## 10. Stream and Quiver Plots

**Use cases:** Vector fields, flow visualization

### Quiver Plot (Vector Field)
```python
ax.quiver(X, Y, U, V, alpha=0.8)
ax.set_xlabel('X')
ax.set_ylabel('Y')
ax.set_aspect('equal')
```

### Stream Plot
```python
ax.streamplot(X, Y, U, V, density=1.5, color='k', linewidth=1)
ax.set_xlabel('X')
ax.set_ylabel('Y')
ax.set_aspect('equal')
```

## 11. Fill Between

**Use cases:** Uncertainty bounds, confidence intervals, areas under curves

### Fill Between Two Curves
```python
ax.plot(x, y, 'k-', linewidth=2, label='Mean')
ax.fill_between(x, y - std, y + std, alpha=0.3,
                label='±1 std dev')
ax.legend()
```

### Fill Between with Condition
```python
ax.plot(x, y1, label='Line 1')
ax.plot(x, y2, label='Line 2')
ax.fill_between(x, y1, y2, where=(y2 >= y1),
                alpha=0.3, label='y2 > y1', interpolate=True)
ax.legend()
```

## 12. 3D Plots

**Use cases:** Three-dimensional data visualization

### 3D Scatter
```python
from mpl_toolkits.mplot3d import Axes3D

fig = plt.figure(figsize=(10, 8))
ax = fig.add_subplot(111, projection='3d')
scatter = ax.scatter(x, y, z, c=colors, cmap='viridis',
                     marker='o', s=50)
plt.colorbar(scatter, ax=ax)
ax.set_xlabel('X')
ax.set_ylabel('Y')
ax.set_zlabel('Z')
```

### 3D Surface Plot
```python
fig = plt.figure(figsize=(10, 8))
ax = fig.add_subplot(111, projection='3d')
surf = ax.plot_surface(X, Y, Z, cmap='viridis',
                       edgecolor='none', alpha=0.9)
plt.colorbar(surf, ax=ax)
ax.set_xlabel('X')
ax.set_ylabel('Y')
ax.set_zlabel('Z')
```

### 3D Wireframe
```python
fig = plt.figure(figsize=(10, 8))
ax = fig.add_subplot(111, projection='3d')
ax.plot_wireframe(X, Y, Z, color='black', linewidth=0.5)
ax.set_xlabel('X')
ax.set_ylabel('Y')
ax.set_zlabel('Z')
```

### 3D Contour
```python
fig = plt.figure(figsize=(10, 8))
ax = fig.add_subplot(111, projection='3d')
ax.contour(X, Y, Z, levels=15, cmap='viridis')
ax.set_xlabel('X')
ax.set_ylabel('Y')
ax.set_zlabel('Z')
```

## 13. Specialized Plots

### Stem Plot
```python
ax.stem(x, y, linefmt='C0-', markerfmt='C0o', basefmt='k-')
ax.set_xlabel('X')
ax.set_ylabel('Y')
```

### Filled Polygon
```python
vertices = [(0, 0), (1, 0), (1, 1), (0, 1)]
from matplotlib.patches import Polygon
polygon = Polygon(vertices, closed=True, edgecolor='black',
                  facecolor='lightblue', alpha=0.5)
ax.add_patch(polygon)
ax.set_xlim(-0.5, 1.5)
ax.set_ylim(-0.5, 1.5)
```

### Staircase Plot
```python
ax.stairs(values, edges, fill=True, alpha=0.5)
```

### Broken Barh (Gantt-style)
```python
ax.broken_barh([(10, 50), (100, 20), (130, 10)], (10, 9),
               facecolors='tab:blue')
ax.broken_barh([(10, 20), (50, 50), (120, 30)], (20, 9),
               facecolors='tab:orange')
ax.set_ylim(5, 35)
ax.set_xlim(0, 200)
ax.set_xlabel('Time')
ax.set_yticks([15, 25])
ax.set_yticklabels(['Task 1', 'Task 2'])
```

## 14. Time Series Plots

### Basic Time Series
```python
import pandas as pd
import matplotlib.dates as mdates

ax.plot(dates, values, linewidth=2)
ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
ax.xaxis.set_major_locator(mdates.DayLocator(interval=7))
plt.xticks(rotation=45)
ax.set_xlabel('Date')
ax.set_ylabel('Value')
```

### Time Series with Shaded Regions
```python
ax.plot(dates, values, linewidth=2)
# Shade weekends or specific periods
ax.axvspan(start_date, end_date, alpha=0.2, color='gray')
```

## Plot Selection Guide

| Data Type | Recommended Plot | Alternative Options |
|-----------|-----------------|---------------------|
| Single continuous variable | Histogram, KDE | Box plot, Violin plot |
| Two continuous variables | Scatter plot | Hexbin, 2D histogram |
| Time series | Line plot | Area plot, Step plot |
| Categorical vs continuous | Bar chart, Box plot | Violin plot, Strip plot |
| Two categorical variables | Heatmap | Grouped bar chart |
| Three continuous variables | 3D scatter, Contour | Color-coded scatter |
| Proportions | Bar chart | Pie chart (use sparingly) |
| Distributions comparison | Box plot, Violin plot | Overlaid histograms |
| Correlation matrix | Heatmap | Clustered heatmap |
| Vector field | Quiver plot, Stream plot | - |
| Function visualization | Line plot, Contour | 3D surface |
