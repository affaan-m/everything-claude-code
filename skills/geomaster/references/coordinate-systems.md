# Coordinate Reference Systems (CRS)

Complete guide to coordinate systems, projections, and transformations for geospatial data.

## Table of Contents

1. [Fundamentals](#fundamentals)
2. [Common CRS Codes](#common-crs-codes)
3. [Projected vs Geographic](#projected-vs-geographic)
4. [UTM Zones](#utm-zones)
5. [Transformations](#transformations)
6. [Best Practices](#best-practices)

## Fundamentals

### What is a CRS?

A Coordinate Reference System defines how coordinates relate to positions on Earth:

- **Geographic CRS**: Uses latitude/longitude (degrees)
- **Projected CRS**: Uses Cartesian coordinates (meters, feet)
- **Vertical CRS**: Defines height/depth (e.g., ellipsoidal heights)

### Components

1. **Datum**: Mathematical model of Earth's shape
   - WGS 84 (EPSG:4326) - Global GPS
   - NAD 83 (EPSG:4269) - North America
   - ETRS89 (EPSG:4258) - Europe

2. **Projection**: Transformation from curved to flat surface
   - Cylindrical (Mercator)
   - Conic (Lambert Conformal)
   - Azimuthal (Polar Stereographic)

3. **Units**: Degrees, meters, feet, etc.

## Common CRS Codes

### Geographic CRS (Lat/Lon)

| EPSG | Name | Area | Notes |
|------|------|------|-------|
| 4326 | WGS 84 | Global | GPS default, use for storage |
| 4269 | NAD83 | North America | USGS data, slightly different from WGS84 |
| 4258 | ETRS89 | Europe | European reference frame |
| 4612 | GDA94 | Australia | Australian datum |

### Projected CRS (Meters)

| EPSG | Name | Area | Distortion | Notes |
|------|------|------|------------|-------|
| 3857 | Web Mercator | Global (85°S-85°N) | High near poles | Web maps (Google, OSM) |
| 32601-32660 | UTM Zone N | Global (1° bands) | <1% per zone | Metric calculations |
| 32701-32760 | UTM Zone S | Global (1° bands) | <1% per zone | Southern hemisphere |
| 3395 | Mercator | World | Moderate | World maps |
| 5070 | CONUS Albers | USA (conterminous) | Low | US national mapping |
| 2154 | Lambert-93 | France | Very low | French national projection |

### Regional Projections

**United States:**
- EPSG:5070 - US National Atlas Equal Area (CONUS)
- EPSG:6350 - US National Atlas (Alaska)
- EPSG:102003 - USA Contiguous Albers Equal Area
- EPSG:2227 - California Zone 3 (US Feet)

**Europe:**
- EPSG:3035 - Europe Equal Area 2001
- EPSG:3857 - Web Mercator (web mapping)
- EPSG:2154 - Lambert 93 (France)
- EPSG:25832-25836 - UTM zones (ETRS89)

**Other:**
- EPSG:3112 - GDA94 / MGA zone 52 (Australia)
- EPSG:2056 - CH1903+ / LV95 (Switzerland)
- EPSG:4326 - WGS 84 (global default)

## Projected vs Geographic

### When to Use Geographic (EPSG:4326)

✅ Storing data (databases, files)
✅ Global datasets
✅ Web APIs (GeoJSON, KML)
✅ Latitude/longitude queries
✅ GPS coordinates

```python
# Bad: Distance calculation in geographic CRS
gpd.geographic_crs = "EPSG:4326"
distance = gdf.geometry.length  # WRONG! Returns degrees, not meters

# Good: Calculate distance in projected CRS
gdf_projected = gdf.to_crs("EPSG:32633")  # UTM Zone 33N
distance_m = gdf_projected.geometry.length  # Correct: meters
```

### When to Use Projected

✅ Area/distance calculations
✅ Buffer operations
✅ Spatial analysis
✅ High-resolution mapping
✅ Engineering applications

```python
import geopandas as gpd

# Project to appropriate UTM zone
gdf = gpd.to_crs(gdf.estimate_utm_crs())

# Now area and distance are accurate
area_sqm = gdf.geometry.area
buffer_1km = gdf.geometry.buffer(1000)  # 1000 meters
```

### Web Mercator Warning

⚠️ **EPSG:3857 (Web Mercator) for visualization only**

```python
# DON'T use Web Mercator for area calculations
gdf_web = gdf.to_crs("EPSG:3857")
area = gdf_web.geometry.area  # WRONG! Significant distortion

# DO use appropriate projection
gdf_utm = gdf.to_crs("EPSG:32633")  # or estimate_utm_crs()
area = gdf_utm.geometry.area  # Correct
```

## UTM Zones

### Understanding UTM Zones

Earth is divided into 60 zones (6° longitude each):
- Zones 1-60: West to East
- Each zone divided into North (326xx) and South (327xx)

### Finding Your UTM Zone

```python
def get_utm_zone(longitude, latitude):
    """Get UTM zone EPSG code from coordinates."""
    import math

    zone = math.floor((longitude + 180) / 6) + 1

    if latitude >= 0:
        epsg = 32600 + zone  # Northern hemisphere
    else:
        epsg = 32700 + zone  # Southern hemisphere

    return f"EPSG:{epsg}"

# Example
get_utm_zone(-122.4, 37.7)  # Returns 'EPSG:32610' (Zone 10N)
```

### Auto-Detect UTM Zone with GeoPandas

```python
import geopandas as gpd

# Load data
gdf = gpd.read_file('data.geojson')

# Estimate best UTM zone
utm_crs = gdf.estimate_utm_crs()
print(f"Best UTM CRS: {utm_crs}")

# Reproject
gdf_projected = gdf.to_crs(utm_crs)
```

### Special UTM Cases

**UPS (Universal Polar Stereographic):**
- EPSG:5041 - UPS North (Arctic)
- EPSG:5042 - UPS South (Antarctic)

**UTM Non-standard:**
- EPSG:31466-31469 - German Gauss-Krüger zones
- EPSG:2056 - Swiss LV95 (based on UTM principles)

## Transformations

### Basic Transformation

```python
from pyproj import Transformer

# Create transformer
transformer = Transformer.from_crs(
    "EPSG:4326",  # WGS 84 (lat/lon)
    "EPSG:32633", # UTM Zone 33N (meters)
    always_xy=True  # Input: x=lon, y=lat (not y=lat, x=lon)
)

# Transform single point
lon, lat = -122.4, 37.7
x, y = transformer.transform(lon, lat)
print(f"Easting: {x:.2f}, Northing: {y:.2f}")
```

### Batch Transformation

```python
import numpy as np
from pyproj import Transformer

# Arrays of coordinates
lon_array = [-122.4, -122.3]
lat_array = [37.7, 37.8]

transformer = Transformer.from_crs("EPSG:4326", "EPSG:32610", always_xy=True)
xs, ys = transformer.transform(lon_array, lat_array)
```

### Transformation with PyProj CRS

```python
from pyproj import CRS

# Get CRS information
crs = CRS.from_epsg(32633)

print(f"Name: {crs.name}")
print(f"Type: {crs.type_name}")
print(f"Area of use: {crs.area_of_use.name}")
print(f"Datum: {crs.datum.name}")
print(f"Ellipsoid: {crs.ellipsoid_name}")
```

## Best Practices

### 1. Always Know Your CRS

```python
import geopandas as gpd

gdf = gpd.read_file('data.geojson')

# Check CRS immediately
print(f"CRS: {gdf.crs}")  # Should never be None!

# If None, set it
if gdf.crs is None:
    gdf.set_crs("EPSG:4326", inplace=True)
```

### 2. Verify CRS Before Operations

```python
def ensure_same_crs(gdf1, gdf2):
    """Ensure two GeoDataFrames have same CRS."""
    if gdf1.crs != gdf2.crs:
        gdf2 = gdf2.to_crs(gdf1.crs)
        print(f"Reprojected gdf2 to {gdf1.crs}")
    return gdf1, gdf2

# Use before spatial operations
zones, points = ensure_same_crs(zones_gdf, points_gdf)
result = gpd.sjoin(points, zones, predicate='within')
```

### 3. Use Appropriate Projections

```python
# For local analysis (< 500km extent)
gdf_local = gdf.to_crs(gdf.estimate_utm_crs())

# For national/regional analysis
gdf_us = gdf.to_crs("EPSG:5070")  # US National Atlas Equal Area
gdf_eu = gdf.to_crs("EPSG:3035")  # Europe Equal Area

# For web visualization
gdf_web = gdf.to_crs("EPSG:3857")  # Web Mercator
```

### 4. Preserve Original CRS

```python
# Keep original as backup
gdf_original = gdf.copy()
original_crs = gdf.crs

# Do analysis in projected CRS
gdf_projected = gdf.to_crs(gdf.estimate_utm_crs())
result = gdf_projected.geometry.buffer(1000)

# Convert back if needed
result = result.to_crs(original_crs)
```

## Common Pitfalls

### Mistake 1: Area in Degrees

```python
# WRONG: Area in square degrees
gdf = gpd.read_file('data.geojson')
area = gdf.geometry.area  # Wrong!

# CORRECT: Use projected CRS
gdf_proj = gdf.to_crs(gdf.estimate_utm_crs())
area_sqm = gdf_proj.geometry.area
area_sqkm = area_sqm / 1_000_000
```

### Mistake 2: Buffer in Geographic CRS

```python
# WRONG: Buffer of 1000 degrees
gdf['buffer'] = gdf.geometry.buffer(1000)

# CORRECT: Project first
gdf_proj = gdf.to_crs("EPSG:32610")
gdf_proj['buffer_km'] = gdf_proj.geometry.buffer(1000)  # 1000 meters
```

### Mistake 3: Mixing CRS

```python
# WRONG: Spatial join without checking CRS
result = gpd.sjoin(gdf1, gdf2, predicate='intersects')

# CORRECT: Ensure same CRS
if gdf1.crs != gdf2.crs:
    gdf2 = gdf2.to_crs(gdf1.crs)
result = gpd.sjoin(gdf1, gdf2, predicate='intersects')
```

## Quick Reference

```python
# Common operations

# Check CRS
gdf.crs
rasterio.open('file.tif').crs

# Reproject
gdf.to_crs("EPSG:32633")

# Auto-detect UTM
gdf.estimate_utm_crs()

# Transform single point
from pyproj import Transformer
tx = Transformer.from_crs("EPSG:4326", "EPSG:32610", always_xy=True)
x, y = tx.transform(lon, lat)

# Create custom CRS
from pyproj import CRS
custom_crs = CRS.from_proj4(
    "+proj=utm +zone=10 +ellps=WGS84 +datum=WGS84 +units=m +no_defs"
)
```

For more information, see:
- [EPSG Registry](https://epsg.org/)
- [PROJ documentation](https://proj.org/)
- [pyproj documentation](https://pyproj4.github.io/pyproj/)
