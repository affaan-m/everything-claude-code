# Plotly Express - High-Level API

Plotly Express (px) is a high-level interface for creating data visualizations with minimal code (typically 1-5 lines).

## Installation

```bash
uv pip install plotly
```

## Key Advantages

- Concise syntax for common chart types
- Automatic color encoding and legends
- Works seamlessly with pandas DataFrames
- Smart defaults for layout and styling
- Returns graph_objects.Figure for further customization

## Basic Usage Pattern

```python
import plotly.express as px
import pandas as pd

# Most functions follow this pattern
fig = px.chart_type(
    data_frame=df,
    x="column_x",
    y="column_y",
    color="category_column",  # Auto-color by category
    size="size_column",        # Size by values
    title="Chart Title"
)
fig.show()
```

## 40+ Chart Types

### Basic Charts
- `px.scatter()` - Scatter plots with optional trendlines
- `px.line()` - Line charts for time series
- `px.bar()` - Bar charts (vertical/horizontal)
- `px.area()` - Area charts
- `px.pie()` - Pie charts

### Statistical Charts
- `px.histogram()` - Histograms with automatic binning
- `px.box()` - Box plots for distributions
- `px.violin()` - Violin plots
- `px.strip()` - Strip plots
- `px.ecdf()` - Empirical cumulative distribution

### Maps
- `px.scatter_geo()` - Geographic scatter plots
- `px.choropleth()` - Choropleth maps
- `px.scatter_mapbox()` - Mapbox scatter plots
- `px.density_mapbox()` - Density heatmaps on maps

### Specialized
- `px.sunburst()` - Hierarchical sunburst charts
- `px.treemap()` - Treemap visualizations
- `px.funnel()` - Funnel charts
- `px.parallel_coordinates()` - Parallel coordinates
- `px.scatter_matrix()` - Scatter matrix (SPLOM)
- `px.density_heatmap()` - 2D density heatmaps
- `px.density_contour()` - Density contours

### 3D Charts
- `px.scatter_3d()` - 3D scatter plots
- `px.line_3d()` - 3D line plots

## Common Parameters

All Plotly Express functions support these styling parameters:

```python
fig = px.scatter(
    df, x="x", y="y",
    # Dimensions
    width=800,
    height=600,

    # Labels
    title="Figure Title",
    labels={"x": "X Axis", "y": "Y Axis"},

    # Colors
    color="category",
    color_discrete_map={"A": "red", "B": "blue"},
    color_continuous_scale="Viridis",

    # Ordering
    category_orders={"category": ["A", "B", "C"]},

    # Theming
    template="plotly_dark"  # or "simple_white", "seaborn", "ggplot2"
)
```

## Data Format

Plotly Express works with:
- **Long-form data** (tidy): One row per observation
- **Wide-form data**: Multiple columns as separate traces

```python
# Long-form (preferred)
df_long = pd.DataFrame({
    'fruit': ['apple', 'orange', 'apple', 'orange'],
    'contestant': ['A', 'A', 'B', 'B'],
    'count': [1, 3, 2, 4]
})
fig = px.bar(df_long, x='fruit', y='count', color='contestant')

# Wide-form
df_wide = pd.DataFrame({
    'fruit': ['apple', 'orange'],
    'A': [1, 3],
    'B': [2, 4]
})
fig = px.bar(df_wide, x='fruit', y=['A', 'B'])
```

## Trendlines

Add statistical trendlines to scatter plots:

```python
fig = px.scatter(
    df, x="x", y="y",
    trendline="ols",  # "ols", "lowess", "rolling", "ewm", "expanding"
    trendline_options=dict(log_x=True)  # Additional options
)
```

## Faceting (Subplots)

Create faceted plots automatically:

```python
fig = px.scatter(
    df, x="x", y="y",
    facet_row="category_1",    # Separate rows
    facet_col="category_2",    # Separate columns
    facet_col_wrap=3           # Wrap columns
)
```

## Animation

Create animated visualizations:

```python
fig = px.scatter(
    df, x="gdp", y="life_exp",
    animation_frame="year",     # Animate over this column
    animation_group="country",  # Group animated elements
    size="population",
    color="continent",
    hover_name="country"
)
```

## Hover Data

Customize hover tooltips:

```python
fig = px.scatter(
    df, x="x", y="y",
    hover_data={
        "extra_col": True,      # Add column
        "x": ":.2f",            # Format existing
        "hidden_col": False     # Hide column
    },
    hover_name="name_column"    # Bold title in hover
)
```

## Further Customization

Plotly Express returns a `graph_objects.Figure` that can be further customized:

```python
fig = px.scatter(df, x="x", y="y")

# Use graph_objects methods
fig.update_layout(
    title="Custom Title",
    xaxis_title="X Axis",
    font=dict(size=14)
)

fig.update_traces(
    marker=dict(size=10, opacity=0.7)
)

fig.add_hline(y=0, line_dash="dash")
```

## When to Use Plotly Express

Use Plotly Express when:
- Creating standard chart types quickly
- Working with pandas DataFrames
- Need automatic color/size encoding
- Want sensible defaults with minimal code

Use graph_objects when:
- Building custom chart types not in px
- Need fine-grained control over every element
- Creating complex multi-trace figures
- Building specialized visualizations
