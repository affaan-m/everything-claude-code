# Export and Interactivity

## Static Image Export

### Installation

Static image export requires Kaleido:

```bash
uv pip install kaleido
```

Kaleido v1+ requires Chrome/Chromium on your system.

### Supported Formats

- **Raster**: PNG, JPEG, WebP
- **Vector**: SVG, PDF

### Writing to File

```python
import plotly.express as px

fig = px.scatter(df, x='x', y='y')

# Format inferred from extension
fig.write_image('chart.png')
fig.write_image('chart.pdf')
fig.write_image('chart.svg')

# Explicit format
fig.write_image('chart', format='png')
```

### Converting to Bytes

```python
# Get image as bytes
img_bytes = fig.to_image(format='png')

# Display in Jupyter
from IPython.display import Image
Image(img_bytes)

# Save to file manually
with open('chart.png', 'wb') as f:
    f.write(img_bytes)
```

### Customizing Export

```python
fig.write_image(
    'chart.png',
    format='png',
    width=1200,
    height=800,
    scale=2  # Higher resolution
)
```

### Setting Export Defaults

```python
import plotly.io as pio

pio.kaleido.scope.default_format = 'png'
pio.kaleido.scope.default_width = 800
pio.kaleido.scope.default_height = 600
pio.kaleido.scope.default_scale = 2
```

### Exporting Multiple Figures

```python
import plotly.io as pio

# Kaleido v1+ only
pio.write_images(
    fig=[fig1, fig2, fig3],
    file=['chart1.png', 'chart2.png', 'chart3.png']
)
```

## Interactive HTML Export

### Basic Export

```python
# Full standalone HTML
fig.write_html('interactive_chart.html')

# Open in browser
fig.show()
```

### File Size Control

```python
# Full library embedded (~5MB file)
fig.write_html('chart.html', include_plotlyjs=True)

# CDN reference (~2KB file, requires internet)
fig.write_html('chart.html', include_plotlyjs='cdn')

# Local reference (requires plotly.min.js in same directory)
fig.write_html('chart.html', include_plotlyjs='directory')

# No library (for embedding in existing HTML with Plotly.js)
fig.write_html('chart.html', include_plotlyjs=False)
```

### HTML Configuration

```python
fig.write_html(
    'chart.html',
    config={
        'displayModeBar': True,
        'displaylogo': False,
        'toImageButtonOptions': {
            'format': 'png',
            'filename': 'custom_image',
            'height': 800,
            'width': 1200,
            'scale': 2
        }
    }
)
```

### Embedding in Templates

```python
# Get only the div (no full HTML structure)
html_div = fig.to_html(
    full_html=False,
    include_plotlyjs='cdn',
    div_id='my-plot'
)

# Use in Jinja2 template
template = """
<html>
<body>
    <h1>My Dashboard</h1>
    {{ plot_div | safe }}
</body>
</html>
"""
```

## Interactivity Features

### Built-in Interactions

Plotly figures automatically support:

- **Hover tooltips** - Display data on hover
- **Pan and zoom** - Click and drag to pan, scroll to zoom
- **Box/lasso select** - Select multiple points
- **Legend toggling** - Click to hide/show traces
- **Double-click** - Reset axes

### Hover Customization

```python
# Hover mode
fig.update_layout(
    hovermode='closest'  # 'x', 'y', 'closest', 'x unified', False
)

# Custom hover template
fig.update_traces(
    hovertemplate='<b>%{x}</b><br>' +
                  'Value: %{y:.2f}<br>' +
                  'Extra: %{customdata[0]}<br>' +
                  '<extra></extra>'
)

# Hover data in Plotly Express
fig = px.scatter(
    df, x='x', y='y',
    hover_data={
        'extra_col': True,     # Show column
        'x': ':.2f',           # Format column
        'hidden': False        # Hide column
    },
    hover_name='name_column'   # Bold title
)
```

### Click Events (Dash/FigureWidget)

For web applications, use Dash or FigureWidget for click handling:

```python
# With FigureWidget in Jupyter
import plotly.graph_objects as go

fig = go.FigureWidget(data=[go.Scatter(x=[1, 2, 3], y=[4, 5, 6])])

def on_click(trace, points, selector):
    print(f'Clicked on points: {points.point_inds}')

fig.data[0].on_click(on_click)
fig
```

### Zoom and Pan

```python
# Disable zoom/pan
fig.update_xaxes(fixedrange=True)
fig.update_yaxes(fixedrange=True)

# Set initial zoom
fig.update_xaxes(range=[0, 10])
fig.update_yaxes(range=[0, 100])

# Constrain zoom
fig.update_xaxes(
    range=[0, 10],
    constrain='domain'
)
```

### Rangeslider (Time Series)

```python
fig = px.line(df, x='date', y='value')

# Add rangeslider
fig.update_xaxes(rangeslider_visible=True)

# Customize rangeslider
fig.update_xaxes(
    rangeslider=dict(
        visible=True,
        thickness=0.05,
        bgcolor='lightgray'
    )
)
```

### Range Selector Buttons

```python
fig.update_xaxes(
    rangeselector=dict(
        buttons=list([
            dict(count=1, label='1m', step='month', stepmode='backward'),
            dict(count=6, label='6m', step='month', stepmode='backward'),
            dict(count=1, label='YTD', step='year', stepmode='todate'),
            dict(count=1, label='1y', step='year', stepmode='backward'),
            dict(step='all', label='All')
        ]),
        x=0.0,
        y=1.0,
        xanchor='left',
        yanchor='top'
    )
)
```

### Buttons and Dropdowns

```python
fig.update_layout(
    updatemenus=[
        dict(
            type='buttons',
            direction='left',
            buttons=list([
                dict(
                    args=[{'type': 'scatter'}],
                    label='Scatter',
                    method='restyle'
                ),
                dict(
                    args=[{'type': 'bar'}],
                    label='Bar',
                    method='restyle'
                )
            ]),
            x=0.1,
            y=1.15
        )
    ]
)
```

### Sliders

```python
fig.update_layout(
    sliders=[
        dict(
            active=0,
            steps=[
                dict(
                    method='update',
                    args=[{'visible': [True, False]},
                          {'title': 'Dataset 1'}],
                    label='Dataset 1'
                ),
                dict(
                    method='update',
                    args=[{'visible': [False, True]},
                          {'title': 'Dataset 2'}],
                    label='Dataset 2'
                )
            ],
            x=0.1,
            y=0,
            len=0.9
        )
    ]
)
```

## Animations

### Using Plotly Express

```python
fig = px.scatter(
    df, x='gdp', y='life_exp',
    animation_frame='year',     # Animate over this column
    animation_group='country',  # Group animated elements
    size='population',
    color='continent',
    hover_name='country',
    log_x=True,
    range_x=[100, 100000],
    range_y=[25, 90]
)

# Customize animation speed
fig.layout.updatemenus[0].buttons[0].args[1]['frame']['duration'] = 1000
fig.layout.updatemenus[0].buttons[0].args[1]['transition']['duration'] = 500
```

### Using Graph Objects

```python
import plotly.graph_objects as go

fig = go.Figure(
    data=[go.Scatter(x=[1, 2], y=[1, 2])],
    layout=go.Layout(
        updatemenus=[dict(
            type='buttons',
            buttons=[dict(label='Play',
                         method='animate',
                         args=[None])]
        )]
    ),
    frames=[
        go.Frame(data=[go.Scatter(x=[1, 2], y=[1, 2])]),
        go.Frame(data=[go.Scatter(x=[1, 2], y=[2, 3])]),
        go.Frame(data=[go.Scatter(x=[1, 2], y=[3, 4])])
    ]
)
```

## Displaying Figures

### In Jupyter

```python
# Default renderer
fig.show()

# Specific renderer
fig.show(renderer='notebook')  # or 'jupyterlab', 'colab', 'kaggle'
```

### In Web Browser

```python
fig.show()  # Opens in default browser
```

### In Dash Applications

```python
import dash
from dash import dcc, html
import plotly.express as px

app = dash.Dash(__name__)

fig = px.scatter(df, x='x', y='y')

app.layout = html.Div([
    dcc.Graph(figure=fig)
])

app.run_server(debug=True)
```

### Saving and Loading

```python
# Save as JSON
fig.write_json('figure.json')

# Load from JSON
import plotly.io as pio
fig = pio.read_json('figure.json')

# Save as HTML
fig.write_html('figure.html')
```

## Configuration Options

### Display Config

```python
config = {
    'displayModeBar': True,      # Show toolbar
    'displaylogo': False,        # Hide Plotly logo
    'modeBarButtonsToRemove': ['pan2d', 'lasso2d'],  # Remove buttons
    'toImageButtonOptions': {
        'format': 'png',
        'filename': 'custom_image',
        'height': 500,
        'width': 700,
        'scale': 1
    },
    'scrollZoom': True,          # Enable scroll zoom
    'editable': True,            # Enable editing
    'responsive': True           # Responsive sizing
}

fig.show(config=config)
fig.write_html('chart.html', config=config)
```

### Available Config Options

- `displayModeBar`: Show/hide toolbar ('hover', True, False)
- `displaylogo`: Show Plotly logo
- `modeBarButtonsToRemove`: List of buttons to hide
- `modeBarButtonsToAdd`: Custom buttons
- `scrollZoom`: Enable scroll to zoom
- `doubleClick`: Double-click behavior ('reset', 'autosize', 'reset+autosize', False)
- `showAxisDragHandles`: Show axis drag handles
- `editable`: Allow editing
- `responsive`: Responsive sizing
