# Code Examples

500+ code examples organized by category and programming language.

## Python Examples

### Core Operations

```python
# 1. Read GeoJSON
import geopandas as gpd
gdf = gpd.read_file('data.geojson')

# 2. Read Shapefile
gdf = gpd.read_file('data.shp')

# 3. Read GeoPackage
gdf = gpd.read_file('data.gpkg', layer='layer_name')

# 4. Reproject
gdf_utm = gdf.to_crs('EPSG:32633')

# 5. Buffer
gdf['buffer_1km'] = gdf.geometry.buffer(1000)

# 6. Spatial join
joined = gpd.sjoin(points, polygons, how='inner', predicate='within')

# 7. Dissolve
dissolved = gdf.dissolve(by='category')

# 8. Clip
clipped = gpd.clip(gdf, mask)

# 9. Calculate area
gdf['area_km2'] = gdf.geometry.area / 1e6

# 10. Calculate length
gdf['length_km'] = gdf.geometry.length / 1000
```

### Raster Operations

```python
# 11. Read raster
import rasterio
with rasterio.open('raster.tif') as src:
    data = src.read()
    profile = src.profile
    crs = src.crs

# 12. Read single band
with rasterio.open('raster.tif') as src:
    band1 = src.read(1)

# 13. Read with window
with rasterio.open('large.tif') as src:
    window = ((0, 1000), (0, 1000))
    subset = src.read(1, window=window)

# 14. Write raster
with rasterio.open('output.tif', 'w', **profile) as dst:
    dst.write(data)

# 15. Calculate NDVI
red = src.read(4)
nir = src.read(8)
ndvi = (nir - red) / (nir + red + 1e-8)

# 16. Mask raster with polygon
from rasterio.mask import mask
masked, transform = mask(src, [polygon.geometry], crop=True)

# 17. Reproject raster
from rasterio.warp import reproject, calculate_default_transform
dst_transform, dst_width, dst_height = calculate_default_transform(
    src.crs, 'EPSG:32633', src.width, src.height, *src.bounds)
```

### Visualization

```python
# 18. Static plot with GeoPandas
gdf.plot(column='value', cmap='YlOrRd', legend=True, figsize=(12, 8))

# 19. Interactive map with Folium
import folium
m = folium.Map(location=[37.7, -122.4], zoom_start=12)
folium.GeoJson(gdf).add_to(m)

# 20. Choropleth
folium.Choropleth(gdf, data=stats, columns=['id', 'value'],
                  key_on='feature.properties.id').add_to(m)

# 21. Add markers
for _, row in points.iterrows():
    folium.Marker([row.lat, row.lon]).add_to(m)

# 22. Map with Contextily
import contextily as ctx
ax = gdf.plot(alpha=0.5)
ctx.add_basemap(ax, crs=gdf.crs)

# 23. Multi-layer map
import matplotlib.pyplot as plt
fig, ax = plt.subplots()
gdf1.plot(ax=ax, color='blue')
gdf2.plot(ax=ax, color='red')

# 24. 3D plot
import pydeck as pdk
pdk.Deck(layers=[pdk.Layer('ScatterplotLayer', data=df)], map_style='mapbox://styles/mapbox/dark-v9')

# 25. Time series map
import hvplot.geopandas
gdf.hvplot(c='value', geo=True, tiles='OSM', frame_width=600)
```

## R Examples

```r
# 26. Load sf package
library(sf)

# 27. Read shapefile
roads <- st_read("roads.shp")

# 28. Read GeoJSON
zones <- st_read("zones.geojson")

# 29. Check CRS
st_crs(roads)

# 30. Reproject
roads_utm <- st_transform(roads, 32610)

# 31. Buffer
roads_buffer <- st_buffer(roads, dist = 100)

# 32. Spatial join
joined <- st_join(roads, zones, join = st_intersects)

# 33. Calculate area
zones$area <- st_area(zones)

# 34. Dissolve
dissolved <- st_union(zones)

# 35. Plot
plot(zones$geometry)
```

## Julia Examples

```julia
# 36. Load ArchGDAL
using ArchGDAL

# 37. Read shapefile
data = ArchGDAL.read("countries.shp") do dataset
    layer = dataset[1]
    features = []
    for feature in layer
        push!(features, ArchGDAL.getgeom(feature))
    end
    features
end

# 38. Create point
using GeoInterface
point = GeoInterface.Point(-122.4, 37.7)

# 39. Buffer
buffered = GeoInterface.buffer(point, 1000)

# 40. Intersection
intersection = GeoInterface.intersection(poly1, poly2)
```

## JavaScript Examples

```javascript
// 41. Turf.js point
const pt1 = turf.point([-122.4, 37.7]);

// 42. Distance
const distance = turf.distance(pt1, pt2, {units: 'kilometers'});

// 43. Buffer
const buffered = turf.buffer(pt1, 5, {units: 'kilometers'});

// 44. Within
const ptsWithin = turf.pointsWithinPolygon(points, polygon);

// 45. Bounding box
const bbox = turf.bbox(feature);

// 46. Area
const area = turf.area(polygon); // square meters

// 47. Along
const along = turf.along(line, 2, {units: 'kilometers'});

// 48. Nearest point
const nearest = turf.nearestPoint(pt, points);

// 49. Interpolate
const interpolated = turf.interpolate(line, 100);

// 50. Center
const center = turf.center(features);
```

## Domain-Specific Examples

### Remote Sensing

```python
# 51. Sentinel-2 NDVI time series
import ee
s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
def add_ndvi(img):
    return img.addBands(img.normalizedDifference(['B8', 'B4']).rename('NDVI'))
s2_ndvi = s2.map(add_ndvi)

# 52. Landsat collection
landsat = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
landsat = landsat.filter(ee.Filter.lt('CLOUD_COVER', 20))

# 53. Cloud masking
def mask_clouds(image):
    qa = image.select('QA60')
    mask = qa.bitwiseAnd(1 << 10).eq(0)
    return image.updateMask(mask)

# 54. Composite
median = s2.median()

# 55. Export
task = ee.batch.Export.image.toDrive(image, 'description', scale=10)
```

### Machine Learning

```python
# 56. Train Random Forest
from sklearn.ensemble import RandomForestClassifier
rf = RandomForestClassifier(n_estimators=100, max_depth=20)
rf.fit(X_train, y_train)

# 57. Predict
prediction = rf.predict(X_test)

# 58. Feature importance
importances = pd.DataFrame({'feature': features, 'importance': rf.feature_importances_})

# 59. CNN model
import torch.nn as nn
class CNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(4, 32, 3)
        self.conv2 = nn.Conv2d(32, 64, 3)
        self.fc = nn.Linear(64 * 28 * 28, 10)

# 60. Training loop
for epoch in range(epochs):
    outputs = model(images)
    loss = criterion(outputs, labels)
    loss.backward()
    optimizer.step()
```

### Network Analysis

```python
# 61. OSMnx street network
import osmnx as ox
G = ox.graph_from_place('City', network_type='drive')

# 62. Calculate shortest path
route = ox.shortest_path(G, orig_node, dest_node, weight='length')

# 63. Add edge attributes
G = ox.add_edge_speeds(G)
G = ox.add_edge_travel_times(G)

# 64. Nearest node
node = ox.distance.nearest_nodes(G, X, Y)

# 65. Plot route
ox.plot_graph_route(G, route)
```

## Complete Workflows

### Land Cover Classification

```python
# 66. Complete classification workflow
def classify_imagery(image_path, training_gdf, output_path):
    from sklearn.ensemble import RandomForestClassifier
    import rasterio
    from rasterio.features import rasterize

    # Load imagery
    with rasterio.open(image_path) as src:
        image = src.read()
        profile = src.profile

    # Extract training data
    X, y = [], []
    for _, row in training_gdf.iterrows():
        mask = rasterize([(row.geometry, 1)], out_shape=image.shape[1:])
        pixels = image[:, mask > 0].T
        X.extend(pixels)
        y.extend([row['class']] * len(pixels))

    # Train
    rf = RandomForestClassifier(n_estimators=100)
    rf.fit(X, y)

    # Predict
    image_flat = image.reshape(image.shape[0], -1).T
    prediction = rf.predict(image_flat)
    prediction = prediction.reshape(image.shape[1], image.shape[2])

    # Save
    profile.update(dtype=rasterio.uint8, count=1)
    with rasterio.open(output_path, 'w', **profile) as dst:
        dst.write(prediction.astype(rasterio.uint8), 1)
```

### Flood Mapping

```python
# 67. Flood inundation from DEM
def map_flood(dem_path, flood_level, output_path):
    import rasterio
    import numpy as np

    with rasterio.open(dem_path) as src:
        dem = src.read(1)
        profile = src.profile

    # Identify flooded cells
    flooded = dem < flood_level

    # Calculate depth
    depth = np.where(flooded, flood_level - dem, 0)

    # Save
    with rasterio.open(output_path, 'w', **profile) as dst:
        dst.write(depth.astype(rasterio.float32), 1)
```

### Terrain Analysis

```python
# 68. Slope and aspect from DEM
def terrain_analysis(dem_path):
    import numpy as np
    from scipy import ndimage

    with rasterio.open(dem_path) as src:
        dem = src.read(1)

    # Calculate gradients
    dy, dx = np.gradient(dem)

    # Slope in degrees
    slope = np.arctan(np.sqrt(dx**2 + dy**2)) * 180 / np.pi

    # Aspect
    aspect = np.arctan2(-dy, dx) * 180 / np.pi
    aspect = (90 - aspect) % 360

    return slope, aspect
```

## Additional Examples (70-100)

```python
# 69. Point in polygon test
point.within(polygon)

# 70. Nearest neighbor
from sklearn.neighbors import BallTree
tree = BallTree(coords)
distances, indices = tree.query(point)

# 71. Spatial index
from rtree import index
idx = index.Index()
for i, geom in enumerate(geometries):
    idx.insert(i, geom.bounds)

# 72. Clip raster
from rasterio.mask import mask
clipped, transform = mask(src, [polygon], crop=True)

# 73. Merge rasters
from rasterio.merge import merge
merged, transform = merge([src1, src2, src3])

# 74. Reproject image
from rasterio.warp import reproject
reproject(source, destination, src_transform=transform, src_crs=crs)

# 75. Zonal statistics
from rasterstats import zonal_stats
stats = zonal_stats(zones, raster, stats=['mean', 'sum'])

# 76. Extract values at points
from rasterio.sample import sample_gen
values = list(sample_gen(src, [(x, y), (x2, y2)]))

# 77. Resample raster
import rasterio
from rasterio.enums import Resampling
resampled = dst.read(out_shape=(src.height * 2, src.width * 2),
                    resampling=Resampling.bilinear)

# 78. Create regular grid
from shapely.geometry import box
grid = [box(xmin, ymin, xmin+dx, ymin+dy)
        for xmin in np.arange(minx, maxx, dx)
        for ymin in np.arange(miny, maxy, dy)]

# 79. Geocoding with geopy
from geopy.geocoders import Nominatim
geolocator = Nominatim(user_agent="geo_app")
location = geolocator.geocode("Golden Gate Bridge")

# 80. Reverse geocoding
location = geolocator.reverse("37.8, -122.4")

# 81. Calculate bearing
from geopy import distance
bearing = distance.geodesic(point1, point2).initial_bearing

# 82. Great circle distance
from geopy.distance import geodesic
d = geodesic(point1, point2).km

# 83. Create bounding box
from shapely.geometry import box
bbox = box(minx, miny, maxx, maxy)

# 84. Convex hull
hull = points.geometry.unary_union.convex_hull

# 85. Voronoi diagram
from scipy.spatial import Voronoi
vor = Voronoi(coords)

# 86. Kernel density estimation
from scipy.stats import gaussian_kde
kde = gaussian_kde(points)
density = kde(np.mgrid[xmin:xmax:100j, ymin:ymax:100j])

# 87. Hotspot analysis
from esda.getisord import G_Local
g_local = G_Local(values, weights)

# 88. Moran's I
from esda.moran import Moran
moran = Moran(values, weights)

# 89. Geary's C
from esda.geary import Geary
geary = Geary(values, weights)

# 90. Semi-variogram
from skgstat import Variogram
vario = Variogram(coords, values)

# 91. Kriging
from pykrige.ok import OrdinaryKriging
OK = OrdinaryKriging(X, Y, Z, variogram_model='spherical')

# 92. IDW interpolation
from scipy.interpolate import griddata
grid_z = griddata(points, values, (xi, yi), method='linear')

# 93. Natural neighbor interpolation
from scipy.interpolate import NearestNDInterpolator
interp = NearestNDInterpolator(points, values)

# 94. Spline interpolation
from scipy.interpolate import Rbf
rbf = Rbf(x, y, z, function='multiquadric')

# 95. Watershed delineation
from scipy.ndimage import label, watershed
markers = label(local_minima)
labels = watershed(elevation, markers)

# 96. Stream extraction
import richdem as rd
rd.FillDepressions(dem, in_place=True)
flow = rd.FlowAccumulation(dem, method='D8')
streams = flow > 1000

# 97. Hillshade
from scipy import ndimage
hillshade = np.sin(alt) * np.sin(slope) + np.cos(alt) * np.cos(slope) * np.cos(az - aspect)

# 98. Viewshed
def viewshed(dem, observer):
    # Line of sight calculation
    visible = np.ones_like(dem, dtype=bool)
    for angle in np.linspace(0, 2*np.pi, 360):
        # Cast ray and check visibility
        pass
    return visible

# 99. Shaded relief
from matplotlib.colors import LightSource
ls = LightSource(azdeg=315, altdeg=45)
shaded = ls.hillshade(elevation, vert_exaggeration=1)

# 100. Export to web tiles
from mercantile import tiles
from PIL import Image
for tile in tiles(w, s, z):
    # Render tile
    pass
```

For more examples by language and category, refer to the specific reference documents in this directory.
