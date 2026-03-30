# Layouts, Styling, and Customization

## Subplots

### Creating Subplots

```python
from plotly.subplots import make_subplots
import plotly.graph_objects as go

# Basic grid
fig = make_subplots(rows=2, cols=2)

# Add traces to specific positions
fig.add_trace(go.Scatter(x=[1, 2, 3], y=[4, 5, 6]), row=1, col=1)
fig.add_trace(go.Bar(x=['A', 'B', 'C'], y=[1, 3, 2]), row=1, col=2)
fig.add_trace(go.Scatter(x=[1, 2, 3], y=[2, 3, 4]), row=2, col=1)
```

### Subplot Options

```python
fig = make_subplots(
    rows=2, cols=2,

    # Titles
    subplot_titles=('Plot 1', 'Plot 2', 'Plot 3', 'Plot 4'),

    # Custom dimensions
    column_widths=[0.7, 0.3],
    row_heights=[0.4, 0.6],

    # Spacing
    horizontal_spacing=0.1,
    vertical_spacing=0.15,

    # Shared axes
    shared_xaxes=True,  # or 'columns', 'rows', 'all'
    shared_yaxes=False,

    # Trace types (optional, for mixed types)
    specs=[[{'type': 'scatter'}, {'type': 'bar'}],
           [{'type': 'surface'}, {'type': 'table'}]]
)
```

### Mixed Subplot Types

```python
from plotly.subplots import make_subplots
import plotly.graph_objects as go

# 2D and 3D subplots
fig = make_subplots(
    rows=1, cols=2,
    specs=[[{'type': 'scatter'}, {'type': 'scatter3d'}]]
)

fig.add_trace(go.Scatter(x=[1, 2], y=[3, 4]), row=1, col=1)
fig.add_trace(go.Scatter3d(x=[1, 2], y=[3, 4], z=[5, 6]), row=1, col=2)
```

### Customizing Subplot Axes

```python
# Update specific subplot axes
fig.update_xaxes(title_text='X Label', row=1, col=1)
fig.update_yaxes(title_text='Y Label', range=[0, 100], row=2, col=1)

# Update all x-axes
fig.update_xaxes(showgrid=True, gridcolor='lightgray')
```

### Shared Colorscale

```python
fig = make_subplots(rows=1, cols=2)
fig.add_trace(go.Bar(x=['A', 'B'], y=[1, 2],
                     marker=dict(color=[1, 2], coloraxis='coloraxis')),
              row=1, col=1)
fig.add_trace(go.Bar(x=['C', 'D'], y=[3, 4],
                     marker=dict(color=[3, 4], coloraxis='coloraxis')),
              row=1, col=2)

fig.update_layout(coloraxis=dict(colorscale='Viridis'))
```

## Templates and Themes

### Built-in Templates

```python
import plotly.express as px
import plotly.io as pio

# Available templates
templates = [
    'plotly',          # Default
    'plotly_white',    # White background
    'plotly_dark',     # Dark theme
    'ggplot2',         # ggplot2 style
    'seaborn',         # Seaborn style
    'simple_white',    # Minimal white
    'presentation',    # For presentations
    'xgridoff',        # No x grid
    'ygridoff',        # No y grid
    'gridon',          # Grid on
    'none'             # No styling
]

# Use in Plotly Express
fig = px.scatter(df, x='x', y='y', template='plotly_dark')

# Use in graph_objects
fig.update_layout(template='seaborn')

# Set default template for session
pio.templates.default = 'plotly_white'
```

### Custom Templates

```python
import plotly.graph_objects as go
import plotly.io as pio

# Create custom template
custom_template = go.layout.Template(
    layout=go.Layout(
        font=dict(family='Arial', size=14),
        plot_bgcolor='#f0f0f0',
        paper_bgcolor='white',
        colorway=['#1f77b4', '#ff7f0e', '#2ca02c'],
        title_font_size=20
    )
)

# Register template
pio.templates['custom'] = custom_template

# Use it
fig = px.scatter(df, x='x', y='y', template='custom')
```

## Styling with Plotly Express

### Built-in Arguments

```python
fig = px.scatter(
    df, x='x', y='y',

    # Dimensions
    width=800,
    height=600,

    # Title
    title='Figure Title',

    # Labels
    labels={'x': 'X Axis Label', 'y': 'Y Axis Label'},

    # Colors
    color='category',
    color_discrete_sequence=px.colors.qualitative.Set2,
    color_discrete_map={'A': 'red', 'B': 'blue'},
    color_continuous_scale='Viridis',

    # Ordering
    category_orders={'category': ['A', 'B', 'C']},

    # Template
    template='plotly_white'
)
```

### Setting Defaults

```python
import plotly.express as px

# Session-wide defaults
px.defaults.template = 'plotly_white'
px.defaults.width = 800
px.defaults.height = 600
px.defaults.color_continuous_scale = 'Viridis'
```

## Color Scales

### Discrete Colors

```python
import plotly.express as px

# Named color sequences
color_sequences = [
    px.colors.qualitative.Plotly,
    px.colors.qualitative.D3,
    px.colors.qualitative.G10,
    px.colors.qualitative.Set1,
    px.colors.qualitative.Pastel,
    px.colors.qualitative.Dark2,
]

fig = px.scatter(df, x='x', y='y', color='category',
                color_discrete_sequence=px.colors.qualitative.Set2)
```

### Continuous Colors

```python
# Named continuous scales
continuous_scales = [
    'Viridis', 'Plasma', 'Inferno', 'Magma', 'Cividis',  # Perceptually uniform
    'Blues', 'Greens', 'Reds', 'YlOrRd', 'YlGnBu',       # Sequential
    'RdBu', 'RdYlGn', 'Spectral', 'Picnic',              # Diverging
]

fig = px.scatter(df, x='x', y='y', color='value',
                color_continuous_scale='Viridis')

# Reverse scale
fig = px.scatter(df, x='x', y='y', color='value',
                color_continuous_scale='Viridis_r')

# Custom scale
fig = px.scatter(df, x='x', y='y', color='value',
                color_continuous_scale=['blue', 'white', 'red'])
```

### Colorbar Customization

```python
fig.update_coloraxes(
    colorbar=dict(
        title='Value',
        tickmode='linear',
        tick0=0,
        dtick=10,
        len=0.7,           # Length relative to plot
        thickness=20,
        x=1.02             # Position
    )
)
```

## Layout Customization

### Title and Fonts

```python
fig.update_layout(
    title=dict(
        text='Main Title',
        font=dict(size=24, family='Arial', color='darkblue'),
        x=0.5,              # Center title
        xanchor='center'
    ),

    font=dict(
        family='Arial',
        size=14,
        color='black'
    )
)
```

### Margins and Size

```python
fig.update_layout(
    width=1000,
    height=600,

    margin=dict(
        l=50,    # left
        r=50,    # right
        t=100,   # top
        b=50,    # bottom
        pad=10   # padding
    ),

    autosize=True  # Auto-resize to container
)
```

### Background Colors

```python
fig.update_layout(
    plot_bgcolor='#f0f0f0',   # Plot area
    paper_bgcolor='white'      # Figure background
)
```

### Legend

```python
fig.update_layout(
    showlegend=True,

    legend=dict(
        title='Legend Title',
        orientation='h',           # 'h' or 'v'
        x=0.5,                     # Position
        y=-0.2,
        xanchor='center',
        yanchor='top',
        bgcolor='rgba(255, 255, 255, 0.8)',
        bordercolor='black',
        borderwidth=1,
        font=dict(size=12)
    )
)
```

### Axes

```python
fig.update_xaxes(
    title='X Axis Title',
    title_font=dict(size=16, family='Arial'),

    # Range
    range=[0, 10],
    autorange=True,  # Auto range

    # Grid
    showgrid=True,
    gridwidth=1,
    gridcolor='lightgray',

    # Ticks
    showticklabels=True,
    tickmode='linear',
    tick0=0,
    dtick=1,
    tickformat='.2f',
    tickangle=-45,

    # Zero line
    zeroline=True,
    zerolinewidth=2,
    zerolinecolor='black',

    # Scale
    type='linear',  # 'linear', 'log', 'date', 'category'
)

fig.update_yaxes(
    title='Y Axis Title',
    # ... same options as xaxes
)
```

### Hover Behavior

```python
fig.update_layout(
    hovermode='closest',  # 'x', 'y', 'closest', 'x unified', False
)

# Customize hover template
fig.update_traces(
    hovertemplate='<b>%{x}</b><br>Value: %{y:.2f}<extra></extra>'
)
```

### Annotations

```python
fig.add_annotation(
    text='Important Note',
    x=2,
    y=5,
    showarrow=True,
    arrowhead=2,
    arrowsize=1,
    arrowwidth=2,
    arrowcolor='red',
    ax=40,  # Arrow x offset
    ay=-40, # Arrow y offset
    font=dict(size=14, color='black'),
    bgcolor='yellow',
    opacity=0.8
)
```

### Shapes

```python
# Rectangle
fig.add_shape(
    type='rect',
    x0=1, y0=2, x1=3, y1=4,
    line=dict(color='red', width=2),
    fillcolor='lightblue',
    opacity=0.3
)

# Circle
fig.add_shape(
    type='circle',
    x0=0, y0=0, x1=1, y1=1,
    line_color='purple'
)

# Convenience methods
fig.add_hline(y=5, line_dash='dash', line_color='red',
              annotation_text='Threshold')
fig.add_vline(x=3, line_dash='dot')
fig.add_vrect(x0=1, x1=2, fillcolor='green', opacity=0.2)
fig.add_hrect(y0=4, y1=6, fillcolor='red', opacity=0.2)
```

## Update Methods

### Update Layout

```python
fig.update_layout(
    title='New Title',
    xaxis_title='X',
    yaxis_title='Y'
)
```

### Update Traces

```python
# Update all traces
fig.update_traces(marker=dict(size=10, opacity=0.7))

# Update with selector
fig.update_traces(
    marker=dict(color='red'),
    selector=dict(mode='markers', name='Series 1')
)
```

### Update Axes

```python
fig.update_xaxes(showgrid=True, gridcolor='lightgray')
fig.update_yaxes(type='log')
```

## Responsive Design

```python
# Auto-resize to container
fig.update_layout(autosize=True)

# Responsive in HTML
fig.write_html('plot.html', config={'responsive': True})
```
