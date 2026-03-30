# Mapping and Visualization

GeoPandas provides plotting through matplotlib integration.

## Basic Plotting

```python
# Simple plot
gdf.plot()

# Customize figure size
gdf.plot(figsize=(10, 10))

# Set colors
gdf.plot(color='blue', edgecolor='black')

# Control line width
gdf.plot(edgecolor='black', linewidth=0.5)
```

## Choropleth Maps

Color features based on data values:

```python
# Basic choropleth
gdf.plot(column='population', legend=True)

# Specify colormap
gdf.plot(column='population', cmap='OrRd', legend=True)

# Other colormaps: 'viridis', 'plasma', 'inferno', 'YlOrRd', 'Blues', 'Greens'
```

### Classification Schemes

Requires: `uv pip install mapclassify`

```python
# Quantiles
gdf.plot(column='population', scheme='quantiles', k=5, legend=True)

# Equal interval
gdf.plot(column='population', scheme='equal_interval', k=5, legend=True)

# Natural breaks (Fisher-Jenks)
gdf.plot(column='population', scheme='fisher_jenks', k=5, legend=True)

# Other schemes: 'box_plot', 'headtail_breaks', 'max_breaks', 'std_mean'

# Pass parameters to classification
gdf.plot(column='population', scheme='quantiles', k=7,
         classification_kwds={'pct': [10, 20, 30, 40, 50, 60, 70, 80, 90]})
```

### Legend Customization

```python
# Position legend outside plot
gdf.plot(column='population', legend=True,
         legend_kwds={'loc': 'upper left', 'bbox_to_anchor': (1, 1)})

# Horizontal legend
gdf.plot(column='population', legend=True,
         legend_kwds={'orientation': 'horizontal'})

# Custom legend label
gdf.plot(column='population', legend=True,
         legend_kwds={'label': 'Population Count'})

# Use separate axes for colorbar
import matplotlib.pyplot as plt
fig, ax = plt.subplots(1, 1, figsize=(10, 6))
divider = make_axes_locatable(ax)
cax = divider.append_axes("right", size="5%", pad=0.1)
gdf.plot(column='population', ax=ax, legend=True, cax=cax)
```

## Handling Missing Data

```python
# Style missing values
gdf.plot(column='population',
         missing_kwds={'color': 'lightgrey', 'edgecolor': 'red', 'hatch': '///',
                      'label': 'Missing data'})
```

## Multi-Layer Maps

Combine multiple GeoDataFrames:

```python
import matplotlib.pyplot as plt

# Create base plot
fig, ax = plt.subplots(figsize=(10, 10))

# Add layers
gdf1.plot(ax=ax, color='lightblue', edgecolor='black')
gdf2.plot(ax=ax, color='red', markersize=5)
gdf3.plot(ax=ax, color='green', alpha=0.5)

plt.show()

# Control layer order with zorder (higher = on top)
gdf1.plot(ax=ax, zorder=1)
gdf2.plot(ax=ax, zorder=2)
```

## Styling Options

```python
# Transparency
gdf.plot(alpha=0.5)

# Marker style for points
points.plot(marker='o', markersize=50)
points.plot(marker='^', markersize=100, color='red')

# Line styles
lines.plot(linestyle='--', linewidth=2)
lines.plot(linestyle=':', color='blue')

# Categorical coloring
gdf.plot(column='category', categorical=True, legend=True)

# Vary marker size by column
gdf.plot(markersize=gdf['value']/1000)
```

## Map Enhancements

```python
import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(12, 8))
gdf.plot(ax=ax, column='population', legend=True)

# Add title
ax.set_title('Population by Region', fontsize=16)

# Add axis labels
ax.set_xlabel('Longitude')
ax.set_ylabel('Latitude')

# Remove axes
ax.set_axis_off()

# Add north arrow and scale bar (requires separate packages)
# See geopandas-plot or contextily for these features

plt.tight_layout()
plt.show()
```

## Interactive Maps

Requires: `uv pip install folium`

```python
# Create interactive map
m = gdf.explore(column='population', cmap='YlOrRd', legend=True)
m.save('map.html')

# Customize base map
m = gdf.explore(tiles='OpenStreetMap', legend=True)
m = gdf.explore(tiles='CartoDB positron', legend=True)

# Add tooltip
m = gdf.explore(column='population', tooltip=['name', 'population'], legend=True)

# Style options
m = gdf.explore(color='red', style_kwds={'fillOpacity': 0.5, 'weight': 2})

# Multiple layers
m = gdf1.explore(color='blue', name='Layer 1')
gdf2.explore(m=m, color='red', name='Layer 2')
folium.LayerControl().add_to(m)
```

## Integration with Other Plot Types

GeoPandas supports pandas plot types:

```python
# Histogram of attribute
gdf['population'].plot.hist(bins=20)

# Scatter plot
gdf.plot.scatter(x='income', y='population')

# Box plot
gdf.boxplot(column='population', by='region')
```

## Basemaps with Contextily

Requires: `uv pip install contextily`

```python
import contextily as ctx

# Reproject to Web Mercator for basemap compatibility
gdf_webmercator = gdf.to_crs(epsg=3857)

fig, ax = plt.subplots(figsize=(10, 10))
gdf_webmercator.plot(ax=ax, alpha=0.5, edgecolor='k')

# Add basemap
ctx.add_basemap(ax, source=ctx.providers.OpenStreetMap.Mapnik)
# Other sources: ctx.providers.CartoDB.Positron, ctx.providers.Stamen.Terrain

plt.show()
```

## Cartographic Projections with CartoPy

Requires: `uv pip install cartopy`

```python
import cartopy.crs as ccrs

# Create map with specific projection
fig, ax = plt.subplots(subplot_kw={'projection': ccrs.Robinson()}, figsize=(15, 10))

gdf.plot(ax=ax, transform=ccrs.PlateCarree(), column='population', legend=True)

ax.coastlines()
ax.gridlines(draw_labels=True)

plt.show()
```

## Saving Figures

```python
# Save to file
ax = gdf.plot()
fig = ax.get_figure()
fig.savefig('map.png', dpi=300, bbox_inches='tight')
fig.savefig('map.pdf')
fig.savefig('map.svg')
```
