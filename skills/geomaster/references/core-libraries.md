# Core Geospatial Libraries

This reference covers the fundamental Python libraries for geospatial data processing.

## GDAL (Geospatial Data Abstraction Library)

GDAL is the foundation for geospatial I/O in Python.

```python
from osgeo import gdal

# Open a raster file
ds = gdal.Open('raster.tif')
band = ds.GetRasterBand(1)
data = band.ReadAsArray()

# Get geotransform
geotransform = ds.GetGeoTransform()
origin_x = geotransform[0]
pixel_width = geotransform[1]

# Get projection
proj = ds.GetProjection()
```

## Rasterio

Rasterio provides a cleaner interface to GDAL.

```python
import rasterio
import numpy as np

# Basic reading
with rasterio.open('raster.tif') as src:
    data = src.read()           # All bands
    band1 = src.read(1)         # Single band
    profile = src.profile       # Metadata

# Windowed reading (memory efficient)
with rasterio.open('large.tif') as src:
    window = ((0, 100), (0, 100))
    subset = src.read(1, window=window)

# Writing
with rasterio.open('output.tif', 'w',
                   driver='GTiff',
                   height=data.shape[0],
                   width=data.shape[1],
                   count=1,
                   dtype=data.dtype,
                   crs=src.crs,
                   transform=src.transform) as dst:
    dst.write(data, 1)

# Masking
with rasterio.open('raster.tif') as src:
    masked_data, mask = rasterio.mask.mask(src, shapes=[polygon], crop=True)
```

## Fiona

Fiona handles vector data I/O.

```python
import fiona

# Read features
with fiona.open('data.geojson') as src:
    for feature in src:
        geom = feature['geometry']
        props = feature['properties']

# Get schema and CRS
with fiona.open('data.shp') as src:
    schema = src.schema
    crs = src.crs

# Write data
schema = {'geometry': 'Point', 'properties': {'name': 'str'}}
with fiona.open('output.geojson', 'w', driver='GeoJSON',
                schema=schema, crs='EPSG:4326') as dst:
    dst.write({
        'geometry': {'type': 'Point', 'coordinates': [0, 0]},
        'properties': {'name': 'Origin'}
    })
```

## Shapely

Shapely provides geometric operations.

```python
from shapely.geometry import Point, LineString, Polygon
from shapely.ops import unary_union

# Create geometries
point = Point(0, 0)
line = LineString([(0, 0), (1, 1)])
poly = Polygon([(0, 0), (1, 0), (1, 1), (0, 1)])

# Geometric operations
buffered = point.buffer(1)              # Buffer
simplified = poly.simplify(0.01)        # Simplify
centroid = poly.centroid                 # Centroid
intersection = poly1.intersection(poly2) # Intersection

# Spatial relationships
point.within(poly)      # True if point inside polygon
poly1.intersects(poly2) # True if geometries intersect
poly1.contains(poly2)   # True if poly2 inside poly1

# Unary union
combined = unary_union([poly1, poly2, poly3])

# Buffer with different joins
buffer_round = point.buffer(1, quad_segs=16)
buffer_mitre = point.buffer(1, mitre_limit=1, join_style=2)
```

## PyProj

PyProj handles coordinate transformations.

```python
from pyproj import Transformer, CRS

# Coordinate transformation
transformer = Transformer.from_crs('EPSG:4326', 'EPSG:32633')
x, y = transformer.transform(lat, lon)
x_inv, y_inv = transformer.transform(x, y, direction='INVERSE')

# Batch transformation
lon_array = [-122.4, -122.3]
lat_array = [37.7, 37.8]
x_array, y_array = transformer.transform(lon_array, lat_array)

# Always z/height if available
transformer_always_z = Transformer.from_crs(
    'EPSG:4326', 'EPSG:32633', always_z=True
)

# Get CRS info
crs = CRS.from_epsg(4326)
print(crs.name)  # WGS 84
print(crs.axis_info)  # Axis info

# Custom transformation
transformer = Transformer.from_pipeline(
    'proj=pipeline step inv proj=utm zone=32 ellps=WGS84 step proj=unitconvert xy_in=rad xy_out=deg'
)
```

## GeoPandas

GeoPandas combines pandas with geospatial capabilities.

```python
import geopandas as gpd

# Reading data
gdf = gpd.read_file('data.geojson')
gdf = gpd.read_file('data.shp', encoding='utf-8')
gdf = gpd.read_postgis('SELECT * FROM data', con=engine)

# Writing data
gdf.to_file('output.geojson', driver='GeoJSON')
gdf.to_file('output.gpkg', layer='data', use_arrow=True)

# CRS operations
gdf.crs  # Get CRS
gdf = gdf.to_crs('EPSG:32633')  # Reproject
gdf = gdf.set_crs('EPSG:4326')  # Set CRS

# Geometric operations
gdf['area'] = gdf.geometry.area
gdf['length'] = gdf.geometry.length
gdf['buffer'] = gdf.geometry.buffer(100)
gdf['centroid'] = gdf.geometry.centroid

# Spatial joins
joined = gpd.sjoin(gdf1, gdf2, how='inner', predicate='intersects')
joined = gpd.sjoin_nearest(gdf1, gdf2, max_distance=1000)

# Overlay operations
intersection = gpd.overlay(gdf1, gdf2, how='intersection')
union = gpd.overlay(gdf1, gdf2, how='union')
difference = gpd.overlay(gdf1, gdf2, how='difference')

# Dissolve
dissolved = gdf.dissolve(by='region', aggfunc='sum')

# Clipping
clipped = gpd.clip(gdf, mask_gdf)

# Spatial indexing (for performance)
idx = gdf.sindex
possible_matches = idx.intersection(polygon.bounds)
```

## Common Workflows

### Batch Reprojection

```python
import geopandas as gpd
from pathlib import Path

input_dir = Path('input')
output_dir = Path('output')

for shp in input_dir.glob('*.shp'):
    gdf = gpd.read_file(shp)
    gdf = gdf.to_crs('EPSG:32633')
    gdf.to_file(output_dir / shp.name)
```

### Raster to Vector Conversion

```python
import rasterio.features
import geopandas as gpd
from shapely.geometry import shape

with rasterio.open('raster.tif') as src:
    image = src.read(1)
    results = (
        {'properties': {'value': v}, 'geometry': s}
        for s, v in rasterio.features.shapes(image, transform=src.transform)
    )

geoms = list(results)
gdf = gpd.GeoDataFrame.from_features(geoms, crs=src.crs)
```

### Vector to Raster Conversion

```python
from rasterio.features import rasterize
import geopandas as gpd

gdf = gpd.read_file('polygons.gpkg')
shapes = ((geom, 1) for geom in gdf.geometry)

raster = rasterize(
    shapes,
    out_shape=(height, width),
    transform=transform,
    fill=0,
    dtype=np.uint8
)
```

### Combining Multiple Rasters

```python
import rasterio.merge
import rasterio as rio

files = ['tile1.tif', 'tile2.tif', 'tile3.tif']
datasets = [rio.open(f) for f in files]

merged, transform = rasterio.merge.merge(datasets)

# Save
profile = datasets[0].profile
profile.update(transform=transform, height=merged.shape[1], width=merged.shape[2])

with rio.open('merged.tif', 'w', **profile) as dst:
    dst.write(merged)
```

For more detailed examples, see [code-examples.md](code-examples.md).
