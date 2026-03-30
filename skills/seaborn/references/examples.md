# Seaborn Common Use Cases and Examples

This document provides practical examples for common data visualization scenarios using seaborn.

## Exploratory Data Analysis

### Quick Dataset Overview

```python
import seaborn as sns
import matplotlib.pyplot as plt
import pandas as pd

# Load data
df = pd.read_csv('data.csv')

# Pairwise relationships for all numeric variables
sns.pairplot(df, hue='target_variable', corner=True, diag_kind='kde')
plt.suptitle('Dataset Overview', y=1.01)
plt.savefig('overview.png', dpi=300, bbox_inches='tight')
```

### Distribution Exploration

```python
# Multiple distributions across categories
g = sns.displot(
    data=df,
    x='measurement',
    hue='condition',
    col='timepoint',
    kind='kde',
    fill=True,
    height=3,
    aspect=1.5,
    col_wrap=3,
    common_norm=False
)
g.set_axis_labels('Measurement Value', 'Density')
g.set_titles('{col_name}')
```

### Correlation Analysis

```python
# Compute correlation matrix
corr = df.select_dtypes(include='number').corr()

# Create mask for upper triangle
mask = np.triu(np.ones_like(corr, dtype=bool))

# Plot heatmap
fig, ax = plt.subplots(figsize=(10, 8))
sns.heatmap(
    corr,
    mask=mask,
    annot=True,
    fmt='.2f',
    cmap='coolwarm',
    center=0,
    square=True,
    linewidths=1,
    cbar_kws={'shrink': 0.8}
)
plt.title('Correlation Matrix')
plt.tight_layout()
```

## Scientific Publications

### Multi-Panel Figure with Different Plot Types

```python
# Set publication style
sns.set_theme(style='ticks', context='paper', font_scale=1.1)
sns.set_palette('colorblind')

# Create figure with custom layout
fig = plt.figure(figsize=(12, 8))
gs = fig.add_gridspec(2, 3, hspace=0.3, wspace=0.3)

# Panel A: Time series
ax1 = fig.add_subplot(gs[0, :2])
sns.lineplot(
    data=timeseries_df,
    x='time',
    y='expression',
    hue='gene',
    style='treatment',
    markers=True,
    dashes=False,
    ax=ax1
)
ax1.set_title('A. Gene Expression Over Time', loc='left', fontweight='bold')
ax1.set_xlabel('Time (hours)')
ax1.set_ylabel('Expression Level (AU)')

# Panel B: Distribution comparison
ax2 = fig.add_subplot(gs[0, 2])
sns.violinplot(
    data=expression_df,
    x='treatment',
    y='expression',
    inner='box',
    ax=ax2
)
ax2.set_title('B. Expression Distribution', loc='left', fontweight='bold')
ax2.set_xlabel('Treatment')
ax2.set_ylabel('')

# Panel C: Correlation
ax3 = fig.add_subplot(gs[1, 0])
sns.scatterplot(
    data=correlation_df,
    x='gene1',
    y='gene2',
    hue='cell_type',
    alpha=0.6,
    ax=ax3
)
sns.regplot(
    data=correlation_df,
    x='gene1',
    y='gene2',
    scatter=False,
    color='black',
    ax=ax3
)
ax3.set_title('C. Gene Correlation', loc='left', fontweight='bold')
ax3.set_xlabel('Gene 1 Expression')
ax3.set_ylabel('Gene 2 Expression')

# Panel D: Heatmap
ax4 = fig.add_subplot(gs[1, 1:])
sns.heatmap(
    sample_matrix,
    cmap='RdBu_r',
    center=0,
    annot=True,
    fmt='.1f',
    cbar_kws={'label': 'Log2 Fold Change'},
    ax=ax4
)
ax4.set_title('D. Treatment Effects', loc='left', fontweight='bold')
ax4.set_xlabel('Sample')
ax4.set_ylabel('Gene')

# Clean up
sns.despine()
plt.savefig('figure.pdf', dpi=300, bbox_inches='tight')
plt.savefig('figure.png', dpi=300, bbox_inches='tight')
```

### Box Plot with Significance Annotations

```python
import numpy as np
from scipy import stats

# Create plot
fig, ax = plt.subplots(figsize=(8, 6))
sns.boxplot(
    data=df,
    x='treatment',
    y='response',
    order=['Control', 'Low', 'Medium', 'High'],
    palette='Set2',
    ax=ax
)

# Add individual points
sns.stripplot(
    data=df,
    x='treatment',
    y='response',
    order=['Control', 'Low', 'Medium', 'High'],
    color='black',
    alpha=0.3,
    size=3,
    ax=ax
)

# Add significance bars
def add_significance_bar(ax, x1, x2, y, h, text):
    ax.plot([x1, x1, x2, x2], [y, y+h, y+h, y], 'k-', lw=1.5)
    ax.text((x1+x2)/2, y+h, text, ha='center', va='bottom')

y_max = df['response'].max()
add_significance_bar(ax, 0, 3, y_max + 1, 0.5, '***')
add_significance_bar(ax, 0, 1, y_max + 3, 0.5, 'ns')

ax.set_ylabel('Response (μM)')
ax.set_xlabel('Treatment Condition')
ax.set_title('Treatment Response Analysis')
sns.despine()
```

## Time Series Analysis

### Multiple Time Series with Confidence Bands

```python
# Plot with automatic aggregation
fig, ax = plt.subplots(figsize=(10, 6))
sns.lineplot(
    data=timeseries_df,
    x='timestamp',
    y='value',
    hue='sensor',
    style='location',
    markers=True,
    dashes=False,
    errorbar=('ci', 95),
    ax=ax
)

# Customize
ax.set_xlabel('Date')
ax.set_ylabel('Measurement (units)')
ax.set_title('Sensor Measurements Over Time')
ax.legend(title='Sensor & Location', bbox_to_anchor=(1.05, 1), loc='upper left')

# Format x-axis for dates
import matplotlib.dates as mdates
ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
ax.xaxis.set_major_locator(mdates.DayLocator(interval=7))
plt.xticks(rotation=45, ha='right')

plt.tight_layout()
```

### Faceted Time Series

```python
# Create faceted time series
g = sns.relplot(
    data=long_timeseries,
    x='date',
    y='measurement',
    hue='device',
    col='location',
    row='metric',
    kind='line',
    height=3,
    aspect=2,
    errorbar='sd',
    facet_kws={'sharex': True, 'sharey': False}
)

# Customize facet titles
g.set_titles('{row_name} - {col_name}')
g.set_axis_labels('Date', 'Value')

# Rotate x-axis labels
for ax in g.axes.flat:
    ax.tick_params(axis='x', rotation=45)

g.tight_layout()
```

## Categorical Comparisons

### Nested Categorical Variables

```python
# Create figure
fig, axes = plt.subplots(1, 2, figsize=(14, 6))

# Left panel: Grouped bar plot
sns.barplot(
    data=df,
    x='category',
    y='value',
    hue='subcategory',
    errorbar=('ci', 95),
    capsize=0.1,
    ax=axes[0]
)
axes[0].set_title('Mean Values with 95% CI')
axes[0].set_ylabel('Value (units)')
axes[0].legend(title='Subcategory')

# Right panel: Strip + violin plot
sns.violinplot(
    data=df,
    x='category',
    y='value',
    hue='subcategory',
    inner=None,
    alpha=0.3,
    ax=axes[1]
)
sns.stripplot(
    data=df,
    x='category',
    y='value',
    hue='subcategory',
    dodge=True,
    size=3,
    alpha=0.6,
    ax=axes[1]
)
axes[1].set_title('Distribution of Individual Values')
axes[1].set_ylabel('')
axes[1].get_legend().remove()

plt.tight_layout()
```

### Point Plot for Trends

```python
# Show how values change across categories
sns.pointplot(
    data=df,
    x='timepoint',
    y='score',
    hue='treatment',
    markers=['o', 's', '^'],
    linestyles=['-', '--', '-.'],
    dodge=0.3,
    capsize=0.1,
    errorbar=('ci', 95)
)

plt.xlabel('Timepoint')
plt.ylabel('Performance Score')
plt.title('Treatment Effects Over Time')
plt.legend(title='Treatment', bbox_to_anchor=(1.05, 1), loc='upper left')
sns.despine()
plt.tight_layout()
```

## Regression and Relationships

### Linear Regression with Facets

```python
# Fit separate regressions for each category
g = sns.lmplot(
    data=df,
    x='predictor',
    y='response',
    hue='treatment',
    col='cell_line',
    height=4,
    aspect=1.2,
    scatter_kws={'alpha': 0.5, 's': 50},
    ci=95,
    palette='Set2'
)

g.set_axis_labels('Predictor Variable', 'Response Variable')
g.set_titles('{col_name}')
g.tight_layout()
```

### Polynomial Regression

```python
fig, axes = plt.subplots(1, 3, figsize=(15, 5))

for idx, order in enumerate([1, 2, 3]):
    sns.regplot(
        data=df,
        x='x',
        y='y',
        order=order,
        scatter_kws={'alpha': 0.5},
        line_kws={'color': 'red'},
        ci=95,
        ax=axes[idx]
    )
    axes[idx].set_title(f'Order {order} Polynomial Fit')
    axes[idx].set_xlabel('X Variable')
    axes[idx].set_ylabel('Y Variable')

plt.tight_layout()
```

### Residual Analysis

```python
fig, axes = plt.subplots(2, 2, figsize=(12, 10))

# Main regression
sns.regplot(data=df, x='x', y='y', ax=axes[0, 0])
axes[0, 0].set_title('Regression Fit')

# Residuals vs fitted
sns.residplot(data=df, x='x', y='y', lowess=True,
              scatter_kws={'alpha': 0.5},
              line_kws={'color': 'red', 'lw': 2},
              ax=axes[0, 1])
axes[0, 1].set_title('Residuals vs Fitted')
axes[0, 1].axhline(0, ls='--', color='gray')

# Q-Q plot (using scipy)
from scipy import stats as sp_stats
residuals = df['y'] - np.poly1d(np.polyfit(df['x'], df['y'], 1))(df['x'])
sp_stats.probplot(residuals, dist="norm", plot=axes[1, 0])
axes[1, 0].set_title('Q-Q Plot')

# Histogram of residuals
sns.histplot(residuals, kde=True, ax=axes[1, 1])
axes[1, 1].set_title('Residual Distribution')
axes[1, 1].set_xlabel('Residuals')

plt.tight_layout()
```

## Bivariate and Joint Distributions

### Joint Plot with Multiple Representations

```python
# Scatter with marginals
g = sns.jointplot(
    data=df,
    x='var1',
    y='var2',
    hue='category',
    kind='scatter',
    height=8,
    ratio=4,
    space=0.1,
    joint_kws={'alpha': 0.5, 's': 50},
    marginal_kws={'kde': True, 'bins': 30}
)

# Add reference lines
g.ax_joint.axline((0, 0), slope=1, color='r', ls='--', alpha=0.5, label='y=x')
g.ax_joint.legend()

g.set_axis_labels('Variable 1', 'Variable 2', fontsize=12)
```

### KDE Contour Plot

```python
fig, ax = plt.subplots(figsize=(8, 8))

# Bivariate KDE with filled contours
sns.kdeplot(
    data=df,
    x='x',
    y='y',
    fill=True,
    levels=10,
    cmap='viridis',
    thresh=0.05,
    ax=ax
)

# Overlay scatter
sns.scatterplot(
    data=df,
    x='x',
    y='y',
    color='white',
    edgecolor='black',
    s=50,
    alpha=0.6,
    ax=ax
)

ax.set_xlabel('X Variable')
ax.set_ylabel('Y Variable')
ax.set_title('Bivariate Distribution')
```

### Hexbin with Marginals

```python
# For large datasets
g = sns.jointplot(
    data=large_df,
    x='x',
    y='y',
    kind='hex',
    height=8,
    ratio=5,
    space=0.1,
    joint_kws={'gridsize': 30, 'cmap': 'viridis'},
    marginal_kws={'bins': 50, 'color': 'skyblue'}
)

g.set_axis_labels('X Variable', 'Y Variable')
```

## Matrix and Heatmap Visualizations

### Hierarchical Clustering Heatmap

```python
# Prepare data (samples x features)
data_matrix = df.set_index('sample_id')[feature_columns]

# Create color annotations
row_colors = df.set_index('sample_id')['condition'].map({
    'control': '#1f77b4',
    'treatment': '#ff7f0e'
})

col_colors = pd.Series(['#2ca02c' if 'gene' in col else '#d62728'
                        for col in data_matrix.columns])

# Plot
g = sns.clustermap(
    data_matrix,
    method='ward',
    metric='euclidean',
    z_score=0,  # Normalize rows
    cmap='RdBu_r',
    center=0,
    row_colors=row_colors,
    col_colors=col_colors,
    figsize=(12, 10),
    dendrogram_ratio=(0.1, 0.1),
    cbar_pos=(0.02, 0.8, 0.03, 0.15),
    linewidths=0.5
)

g.ax_heatmap.set_xlabel('Features')
g.ax_heatmap.set_ylabel('Samples')
plt.savefig('clustermap.png', dpi=300, bbox_inches='tight')
```

### Annotated Heatmap with Custom Colorbar

```python
# Pivot data for heatmap
pivot_data = df.pivot(index='row_var', columns='col_var', values='value')

# Create heatmap
fig, ax = plt.subplots(figsize=(10, 8))
sns.heatmap(
    pivot_data,
    annot=True,
    fmt='.1f',
    cmap='RdYlGn',
    center=pivot_data.mean().mean(),
    vmin=pivot_data.min().min(),
    vmax=pivot_data.max().max(),
    linewidths=0.5,
    linecolor='gray',
    cbar_kws={
        'label': 'Value (units)',
        'orientation': 'vertical',
        'shrink': 0.8,
        'aspect': 20
    },
    ax=ax
)

ax.set_title('Variable Relationships', fontsize=14, pad=20)
ax.set_xlabel('Column Variable', fontsize=12)
ax.set_ylabel('Row Variable', fontsize=12)

plt.xticks(rotation=45, ha='right')
plt.yticks(rotation=0)
plt.tight_layout()
```

## Statistical Comparisons

### Before/After Comparison

```python
# Reshape data for paired comparison
df_paired = df.melt(
    id_vars='subject',
    value_vars=['before', 'after'],
    var_name='timepoint',
    value_name='measurement'
)

fig, axes = plt.subplots(1, 2, figsize=(12, 5))

# Left: Individual trajectories
for subject in df_paired['subject'].unique():
    subject_data = df_paired[df_paired['subject'] == subject]
    axes[0].plot(subject_data['timepoint'], subject_data['measurement'],
                 'o-', alpha=0.3, color='gray')

sns.pointplot(
    data=df_paired,
    x='timepoint',
    y='measurement',
    color='red',
    markers='D',
    scale=1.5,
    errorbar=('ci', 95),
    capsize=0.2,
    ax=axes[0]
)
axes[0].set_title('Individual Changes')
axes[0].set_ylabel('Measurement')

# Right: Distribution comparison
sns.violinplot(
    data=df_paired,
    x='timepoint',
    y='measurement',
    inner='box',
    ax=axes[1]
)
sns.swarmplot(
    data=df_paired,
    x='timepoint',
    y='measurement',
    color='black',
    alpha=0.5,
    size=3,
    ax=axes[1]
)
axes[1].set_title('Distribution Comparison')
axes[1].set_ylabel('')

plt.tight_layout()
```

### Dose-Response Curve

```python
# Create dose-response plot
fig, ax = plt.subplots(figsize=(8, 6))

# Plot individual points
sns.stripplot(
    data=dose_df,
    x='dose',
    y='response',
    order=sorted(dose_df['dose'].unique()),
    color='gray',
    alpha=0.3,
    jitter=0.2,
    ax=ax
)

# Overlay mean with CI
sns.pointplot(
    data=dose_df,
    x='dose',
    y='response',
    order=sorted(dose_df['dose'].unique()),
    color='blue',
    markers='o',
    scale=1.2,
    errorbar=('ci', 95),
    capsize=0.1,
    ax=ax
)

# Fit sigmoid curve
from scipy.optimize import curve_fit

def sigmoid(x, bottom, top, ec50, hill):
    return bottom + (top - bottom) / (1 + (ec50 / x) ** hill)

doses_numeric = dose_df['dose'].astype(float)
params, _ = curve_fit(sigmoid, doses_numeric, dose_df['response'])

x_smooth = np.logspace(np.log10(doses_numeric.min()),
                       np.log10(doses_numeric.max()), 100)
y_smooth = sigmoid(x_smooth, *params)

ax.plot(range(len(sorted(dose_df['dose'].unique()))),
        sigmoid(sorted(doses_numeric.unique()), *params),
        'r-', linewidth=2, label='Sigmoid Fit')

ax.set_xlabel('Dose')
ax.set_ylabel('Response')
ax.set_title('Dose-Response Analysis')
ax.legend()
sns.despine()
```

## Custom Styling

### Custom Color Palette from Hex Codes

```python
# Define custom palette
custom_palette = ['#E64B35', '#4DBBD5', '#00A087', '#3C5488', '#F39B7F']
sns.set_palette(custom_palette)

# Or use for specific plot
sns.scatterplot(
    data=df,
    x='x',
    y='y',
    hue='category',
    palette=custom_palette
)
```

### Publication-Ready Theme

```python
# Set comprehensive theme
sns.set_theme(
    context='paper',
    style='ticks',
    palette='colorblind',
    font='Arial',
    font_scale=1.1,
    rc={
        'figure.dpi': 300,
        'savefig.dpi': 300,
        'savefig.format': 'pdf',
        'axes.linewidth': 1.0,
        'axes.labelweight': 'bold',
        'xtick.major.width': 1.0,
        'ytick.major.width': 1.0,
        'xtick.direction': 'out',
        'ytick.direction': 'out',
        'legend.frameon': False,
        'pdf.fonttype': 42,  # True Type fonts for PDFs
    }
)
```

### Diverging Colormap Centered on Zero

```python
# For data with meaningful zero point (e.g., log fold change)
from matplotlib.colors import TwoSlopeNorm

# Find data range
vmin, vmax = df['value'].min(), df['value'].max()
vcenter = 0

# Create norm
norm = TwoSlopeNorm(vmin=vmin, vcenter=vcenter, vmax=vmax)

# Plot
sns.heatmap(
    pivot_data,
    cmap='RdBu_r',
    norm=norm,
    center=0,
    annot=True,
    fmt='.2f'
)
```

## Large Datasets

### Downsampling Strategy

```python
# For very large datasets, sample intelligently
def smart_sample(df, target_size=10000, category_col=None):
    if len(df) <= target_size:
        return df

    if category_col:
        # Stratified sampling
        return df.groupby(category_col, group_keys=False).apply(
            lambda x: x.sample(min(len(x), target_size // df[category_col].nunique()))
        )
    else:
        # Simple random sampling
        return df.sample(target_size)

# Use sampled data for visualization
df_sampled = smart_sample(large_df, target_size=5000, category_col='category')

sns.scatterplot(data=df_sampled, x='x', y='y', hue='category', alpha=0.5)
```

### Hexbin for Dense Scatter Plots

```python
# For millions of points
fig, axes = plt.subplots(1, 2, figsize=(14, 6))

# Regular scatter (slow)
axes[0].scatter(df['x'], df['y'], alpha=0.1, s=1)
axes[0].set_title('Scatter (all points)')

# Hexbin (fast)
hb = axes[1].hexbin(df['x'], df['y'], gridsize=50, cmap='viridis', mincnt=1)
axes[1].set_title('Hexbin Aggregation')
plt.colorbar(hb, ax=axes[1], label='Count')

plt.tight_layout()
```

## Interactive Elements for Notebooks

### Adjustable Parameters

```python
from ipywidgets import interact, FloatSlider

@interact(bandwidth=FloatSlider(min=0.1, max=3.0, step=0.1, value=1.0))
def plot_kde(bandwidth):
    plt.figure(figsize=(10, 6))
    sns.kdeplot(data=df, x='value', hue='category',
                bw_adjust=bandwidth, fill=True)
    plt.title(f'KDE with bandwidth adjustment = {bandwidth}')
    plt.show()
```

### Dynamic Filtering

```python
from ipywidgets import interact, SelectMultiple

categories = df['category'].unique().tolist()

@interact(selected=SelectMultiple(options=categories, value=[categories[0]]))
def filtered_plot(selected):
    filtered_df = df[df['category'].isin(selected)]

    fig, ax = plt.subplots(figsize=(10, 6))
    sns.violinplot(data=filtered_df, x='category', y='value', ax=ax)
    ax.set_title(f'Showing {len(selected)} categories')
    plt.show()
```
