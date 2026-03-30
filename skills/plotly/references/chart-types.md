# Plotly Chart Types

Comprehensive guide to chart types organized by category.

## Basic Charts

### Scatter Plots

```python
import plotly.express as px
fig = px.scatter(df, x='x', y='y', color='category', size='size')

# With trendlines
fig = px.scatter(df, x='x', y='y', trendline='ols')
```

### Line Charts

```python
fig = px.line(df, x='date', y='value', color='group')

# Multiple lines from wide-form data
fig = px.line(df, x='date', y=['metric1', 'metric2', 'metric3'])
```

### Bar Charts

```python
# Vertical bars
fig = px.bar(df, x='category', y='value', color='group')

# Horizontal bars
fig = px.bar(df, x='value', y='category', orientation='h')

# Stacked bars
fig = px.bar(df, x='category', y='value', color='group', barmode='stack')

# Grouped bars
fig = px.bar(df, x='category', y='value', color='group', barmode='group')
```

### Pie Charts

```python
fig = px.pie(df, names='category', values='count')

# Donut chart
fig = px.pie(df, names='category', values='count', hole=0.4)
```

### Area Charts

```python
fig = px.area(df, x='date', y='value', color='category')
```

## Statistical Charts

### Histograms

```python
# Basic histogram
fig = px.histogram(df, x='values', nbins=30)

# With marginal plot
fig = px.histogram(df, x='values', marginal='box')  # or 'violin', 'rug'

# 2D histogram
fig = px.density_heatmap(df, x='x', y='y', nbinsx=20, nbinsy=20)
```

### Box Plots

```python
fig = px.box(df, x='category', y='value', color='group')

# Notched box plot
fig = px.box(df, x='category', y='value', notched=True)

# Show all points
fig = px.box(df, x='category', y='value', points='all')
```

### Violin Plots

```python
fig = px.violin(df, x='category', y='value', color='group', box=True, points='all')
```

### Strip/Dot Plots

```python
fig = px.strip(df, x='category', y='value', color='group')
```

### Distribution Plots

```python
# Empirical cumulative distribution
fig = px.ecdf(df, x='value', color='group')

# Marginal distribution
fig = px.scatter(df, x='x', y='y', marginal_x='histogram', marginal_y='box')
```

### Error Bars

```python
fig = px.scatter(df, x='x', y='y', error_y='error', error_x='x_error')

# Using graph_objects for custom error bars
import plotly.graph_objects as go
fig = go.Figure()
fig.add_trace(go.Scatter(
    x=[1, 2, 3],
    y=[5, 10, 15],
    error_y=dict(
        type='data',
        array=[1, 2, 3],
        visible=True
    )
))
```

## Scientific Charts

### Heatmaps

```python
# From matrix data
fig = px.imshow(z_matrix, color_continuous_scale='Viridis')

# With graph_objects
fig = go.Figure(data=go.Heatmap(
    z=z_matrix,
    x=x_labels,
    y=y_labels,
    colorscale='RdBu'
))
```

### Contour Plots

```python
# 2D contour
fig = px.density_contour(df, x='x', y='y')

# Filled contour
fig = go.Figure(data=go.Contour(
    z=z_matrix,
    contours=dict(
        coloring='heatmap',
        showlabels=True
    )
))
```

### Ternary Plots

```python
fig = px.scatter_ternary(df, a='component_a', b='component_b', c='component_c')
```

### Log Scales

```python
fig = px.scatter(df, x='x', y='y', log_x=True, log_y=True)
```

### Image Display

```python
import plotly.express as px
fig = px.imshow(img_array)  # img_array from PIL, numpy, etc.
```

## Financial Charts

### Candlestick Charts

```python
import plotly.graph_objects as go
fig = go.Figure(data=[go.Candlestick(
    x=df['date'],
    open=df['open'],
    high=df['high'],
    low=df['low'],
    close=df['close']
)])
```

### OHLC Charts

```python
fig = go.Figure(data=[go.Ohlc(
    x=df['date'],
    open=df['open'],
    high=df['high'],
    low=df['low'],
    close=df['close']
)])
```

### Waterfall Charts

```python
fig = go.Figure(go.Waterfall(
    x=categories,
    y=values,
    measure=['relative', 'relative', 'total', 'relative', 'total']
))
```

### Funnel Charts

```python
fig = px.funnel(df, x='count', y='stage')

# Or with graph_objects
fig = go.Figure(go.Funnel(
    y=['Stage 1', 'Stage 2', 'Stage 3'],
    x=[100, 60, 40]
))
```

### Time Series

```python
fig = px.line(df, x='date', y='price')

# With rangeslider
fig.update_xaxes(rangeslider_visible=True)

# With range selector buttons
fig.update_xaxes(
    rangeselector=dict(
        buttons=list([
            dict(count=1, label='1m', step='month', stepmode='backward'),
            dict(count=6, label='6m', step='month', stepmode='backward'),
            dict(count=1, label='YTD', step='year', stepmode='todate'),
            dict(count=1, label='1y', step='year', stepmode='backward'),
            dict(step='all')
        ])
    )
)
```

## Maps and Geographic

### Scatter Maps

```python
# Geographic projection
fig = px.scatter_geo(df, lat='lat', lon='lon', color='value', size='size')

# Mapbox (requires token for some styles)
fig = px.scatter_mapbox(
    df, lat='lat', lon='lon',
    color='value',
    zoom=10,
    mapbox_style='open-street-map'  # or 'carto-positron', 'carto-darkmatter'
)
```

### Choropleth Maps

```python
# Country-level
fig = px.choropleth(
    df,
    locations='iso_alpha',
    color='value',
    hover_name='country',
    color_continuous_scale='Viridis'
)

# US States
fig = px.choropleth(
    df,
    locations='state_code',
    locationmode='USA-states',
    color='value',
    scope='usa'
)
```

### Density Maps

```python
fig = px.density_mapbox(
    df, lat='lat', lon='lon', z='value',
    radius=10,
    zoom=10,
    mapbox_style='open-street-map'
)
```

## 3D Charts

### 3D Scatter

```python
fig = px.scatter_3d(df, x='x', y='y', z='z', color='category', size='size')
```

### 3D Line

```python
fig = px.line_3d(df, x='x', y='y', z='z', color='group')
```

### 3D Surface

```python
import plotly.graph_objects as go
fig = go.Figure(data=[go.Surface(z=z_matrix, x=x_array, y=y_array)])

fig.update_layout(scene=dict(
    xaxis_title='X',
    yaxis_title='Y',
    zaxis_title='Z'
))
```

### 3D Mesh

```python
fig = go.Figure(data=[go.Mesh3d(
    x=x_coords,
    y=y_coords,
    z=z_coords,
    i=i_indices,
    j=j_indices,
    k=k_indices,
    intensity=intensity_values,
    colorscale='Viridis'
)]
```

### 3D Cone (Vector Field)

```python
fig = go.Figure(data=go.Cone(
    x=x, y=y, z=z,
    u=u, v=v, w=w,
    colorscale='Blues',
    sizemode='absolute',
    sizeref=0.5
))
```

## Hierarchical Charts

### Sunburst

```python
fig = px.sunburst(
    df,
    path=['continent', 'country', 'city'],
    values='population',
    color='value'
)
```

### Treemap

```python
fig = px.treemap(
    df,
    path=['category', 'subcategory', 'item'],
    values='count',
    color='value',
    color_continuous_scale='RdBu'
)
```

### Sankey Diagram

```python
fig = go.Figure(data=[go.Sankey(
    node=dict(
        pad=15,
        thickness=20,
        line=dict(color='black', width=0.5),
        label=['A', 'B', 'C', 'D', 'E'],
        color='blue'
    ),
    link=dict(
        source=[0, 1, 0, 2, 3],
        target=[2, 3, 3, 4, 4],
        value=[8, 4, 2, 8, 4]
    )
)])
```

## Specialized Charts

### Parallel Coordinates

```python
fig = px.parallel_coordinates(
    df,
    dimensions=['dim1', 'dim2', 'dim3', 'dim4'],
    color='target',
    color_continuous_scale='Viridis'
)
```

### Parallel Categories

```python
fig = px.parallel_categories(
    df,
    dimensions=['cat1', 'cat2', 'cat3'],
    color='value'
)
```

### Scatter Matrix (SPLOM)

```python
fig = px.scatter_matrix(
    df,
    dimensions=['col1', 'col2', 'col3', 'col4'],
    color='category'
)
```

### Indicator/Gauge

```python
fig = go.Figure(go.Indicator(
    mode='gauge+number+delta',
    value=75,
    delta={'reference': 60},
    gauge={'axis': {'range': [None, 100]},
           'bar': {'color': 'darkblue'},
           'steps': [
               {'range': [0, 50], 'color': 'lightgray'},
               {'range': [50, 100], 'color': 'gray'}
           ],
           'threshold': {'line': {'color': 'red', 'width': 4},
                        'thickness': 0.75,
                        'value': 90}
    }
))
```

### Table

```python
fig = go.Figure(data=[go.Table(
    header=dict(values=['A', 'B', 'C']),
    cells=dict(values=[col_a, col_b, col_c])
)])
```

## Bioinformatics

### Dendrogram

```python
from plotly.figure_factory import create_dendrogram
fig = create_dendrogram(data_matrix)
```

### Annotated Heatmap

```python
from plotly.figure_factory import create_annotated_heatmap
fig = create_annotated_heatmap(z_matrix, x=x_labels, y=y_labels)
```

### Volcano Plot

```python
# Typically built with scatter plot
fig = px.scatter(
    df,
    x='log2_fold_change',
    y='neg_log10_pvalue',
    color='significant',
    hover_data=['gene_name']
)
fig.add_hline(y=-np.log10(0.05), line_dash='dash')
fig.add_vline(x=-1, line_dash='dash')
fig.add_vline(x=1, line_dash='dash')
```
