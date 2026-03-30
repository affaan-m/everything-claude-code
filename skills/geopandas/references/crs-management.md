# Coordinate Reference Systems (CRS)

A coordinate reference system defines how coordinates relate to locations on Earth.

## Understanding CRS

CRS information is stored as `pyproj.CRS` objects:

```python
# Check CRS
print(gdf.crs)

# Check if CRS is set
if gdf.crs is None:
    print("No CRS defined")
```

## Setting vs Reprojecting

### Setting CRS

Use `set_crs()` when coordinates are correct but CRS metadata is missing:

```python
# Set CRS (doesn't transform coordinates)
gdf = gdf.set_crs("EPSG:4326")
gdf = gdf.set_crs(4326)
```

**Warning**: Only use when CRS metadata is missing. This does not transform coordinates.

### Reprojecting

Use `to_crs()` to transform coordinates between coordinate systems:

```python
# Reproject to different CRS
gdf_projected = gdf.to_crs("EPSG:3857")  # Web Mercator
gdf_projected = gdf.to_crs(3857)

# Reproject to match another GeoDataFrame
gdf1_reprojected = gdf1.to_crs(gdf2.crs)
```

## CRS Formats

GeoPandas accepts multiple formats via `pyproj.CRS.from_user_input()`:

```python
# EPSG code (integer)
gdf.to_crs(4326)

# Authority string
gdf.to_crs("EPSG:4326")
gdf.to_crs("ESRI:102003")

# WKT string (Well-Known Text)
gdf.to_crs("GEOGCS[...]")

# PROJ string
gdf.to_crs("+proj=longlat +datum=WGS84")

# pyproj.CRS object
from pyproj import CRS
crs_obj = CRS.from_epsg(4326)
gdf.to_crs(crs_obj)
```

**Best Practice**: Use WKT2 or authority strings (EPSG) to preserve full CRS information.

## Common EPSG Codes

### Geographic Coordinate Systems

```python
# WGS 84 (latitude/longitude)
gdf.to_crs("EPSG:4326")

# NAD83
gdf.to_crs("EPSG:4269")
```

### Projected Coordinate Systems

```python
# Web Mercator (used by web maps)
gdf.to_crs("EPSG:3857")

# UTM zones (example: UTM Zone 33N)
gdf.to_crs("EPSG:32633")

# UTM zones (Southern hemisphere, example: UTM Zone 33S)
gdf.to_crs("EPSG:32733")

# US National Atlas Equal Area
gdf.to_crs("ESRI:102003")

# Albers Equal Area Conic (North America)
gdf.to_crs("EPSG:5070")
```

## CRS Requirements for Operations

### Operations Requiring Matching CRS

These operations require identical CRS:

```python
# Spatial joins
gpd.sjoin(gdf1, gdf2, ...)  # CRS must match

# Overlay operations
gpd.overlay(gdf1, gdf2, ...)  # CRS must match

# Appending
pd.concat([gdf1, gdf2])  # CRS must match

# Reproject first if needed
gdf2_reprojected = gdf2.to_crs(gdf1.crs)
result = gpd.sjoin(gdf1, gdf2_reprojected)
```

### Operations Best in Projected CRS

Area and distance calculations should use projected CRS:

```python
# Bad: area in degrees (meaningless)
areas_degrees = gdf.geometry.area  # If CRS is EPSG:4326

# Good: reproject to appropriate projected CRS first
gdf_projected = gdf.to_crs("EPSG:3857")
areas_meters = gdf_projected.geometry.area  # Square meters

# Better: use appropriate local UTM zone for accuracy
gdf_utm = gdf.to_crs("EPSG:32633")  # UTM Zone 33N
accurate_areas = gdf_utm.geometry.area
```

## Choosing Appropriate CRS

### For Area/Distance Calculations

Use equal-area projections:

```python
# Albers Equal Area Conic (North America)
gdf.to_crs("EPSG:5070")

# Lambert Azimuthal Equal Area
gdf.to_crs("EPSG:3035")  # Europe

# UTM zones (for local areas)
gdf.to_crs("EPSG:32633")  # Appropriate UTM zone
```

### For Distance-Preserving (Navigation)

Use equidistant projections:

```python
# Azimuthal Equidistant
gdf.to_crs("ESRI:54032")
```

### For Shape-Preserving (Angles)

Use conformal projections:

```python
# Web Mercator (conformal but distorts area)
gdf.to_crs("EPSG:3857")

# UTM zones (conformal for local areas)
gdf.to_crs("EPSG:32633")
```

### For Web Mapping

```python
# Web Mercator (standard for web maps)
gdf.to_crs("EPSG:3857")
```

## Estimating UTM Zone

```python
# Estimate appropriate UTM CRS from data
utm_crs = gdf.estimate_utm_crs()
gdf_utm = gdf.to_crs(utm_crs)
```

## Multiple Geometry Columns with Different CRS

GeoPandas 0.8+ supports different CRS per geometry column:

```python
# Set CRS for specific geometry column
gdf = gdf.set_crs("EPSG:4326", allow_override=True)

# Active geometry determines operations
gdf = gdf.set_geometry('other_geom_column')

# Check CRS mismatch
try:
    result = gdf1.overlay(gdf2)
except ValueError as e:
    print("CRS mismatch:", e)
```

## CRS Information

```python
# Get full CRS details
print(gdf.crs)

# Get EPSG code if available
print(gdf.crs.to_epsg())

# Get WKT representation
print(gdf.crs.to_wkt())

# Get PROJ string
print(gdf.crs.to_proj4())

# Check if CRS is geographic (lat/lon)
print(gdf.crs.is_geographic)

# Check if CRS is projected
print(gdf.crs.is_projected)
```

## Transforming Individual Geometries

```python
from pyproj import Transformer

# Create transformer
transformer = Transformer.from_crs("EPSG:4326", "EPSG:3857", always_xy=True)

# Transform point
x_new, y_new = transformer.transform(x, y)
```
