# Spatial Analysis

## Attribute Joins

Combine datasets based on common variables using standard pandas merge:

```python
# Merge on common column
result = gdf.merge(df, on='common_column')

# Left join
result = gdf.merge(df, on='common_column', how='left')

# Important: Call merge on GeoDataFrame to preserve geometry
# This works: gdf.merge(df, ...)
# This doesn't: df.merge(gdf, ...) # Returns DataFrame, not GeoDataFrame
```

## Spatial Joins

Combine datasets based on spatial relationships.

### Binary Predicate Joins (sjoin)

Join based on geometric predicates:

```python
# Intersects (default)
joined = gpd.sjoin(gdf1, gdf2, how='inner', predicate='intersects')

# Available predicates
joined = gpd.sjoin(gdf1, gdf2, predicate='contains')
joined = gpd.sjoin(gdf1, gdf2, predicate='within')
joined = gpd.sjoin(gdf1, gdf2, predicate='touches')
joined = gpd.sjoin(gdf1, gdf2, predicate='crosses')
joined = gpd.sjoin(gdf1, gdf2, predicate='overlaps')

# Join types
joined = gpd.sjoin(gdf1, gdf2, how='left')   # Keep all from left
joined = gpd.sjoin(gdf1, gdf2, how='right')  # Keep all from right
joined = gpd.sjoin(gdf1, gdf2, how='inner')  # Intersection only
```

The `how` parameter determines which geometries are retained:
- **left**: Retains left GeoDataFrame's index and geometry
- **right**: Retains right GeoDataFrame's index and geometry
- **inner**: Uses intersection of indices, keeps left geometry

### Nearest Joins (sjoin_nearest)

Join to nearest features:

```python
# Find nearest neighbor
nearest = gpd.sjoin_nearest(gdf1, gdf2)

# Add distance column
nearest = gpd.sjoin_nearest(gdf1, gdf2, distance_col='distance')

# Limit search radius (significantly improves performance)
nearest = gpd.sjoin_nearest(gdf1, gdf2, max_distance=1000)

# Find k nearest neighbors
nearest = gpd.sjoin_nearest(gdf1, gdf2, k=5)
```

## Overlay Operations

Set-theoretic operations combining geometries from two GeoDataFrames:

```python
# Intersection - keep areas where both overlap
intersection = gpd.overlay(gdf1, gdf2, how='intersection')

# Union - combine all areas
union = gpd.overlay(gdf1, gdf2, how='union')

# Difference - areas in first not in second
difference = gpd.overlay(gdf1, gdf2, how='difference')

# Symmetric difference - areas in either but not both
sym_diff = gpd.overlay(gdf1, gdf2, how='symmetric_difference')

# Identity - intersection + difference
identity = gpd.overlay(gdf1, gdf2, how='identity')
```

Result includes attributes from both input GeoDataFrames.

## Dissolve (Aggregation)

Aggregate geometries based on attribute values:

```python
# Dissolve by attribute
dissolved = gdf.dissolve(by='region')

# Dissolve with aggregation functions
dissolved = gdf.dissolve(by='region', aggfunc='sum')
dissolved = gdf.dissolve(by='region', aggfunc={'population': 'sum', 'area': 'mean'})

# Dissolve all into single geometry
dissolved = gdf.dissolve()

# Preserve internal boundaries
dissolved = gdf.dissolve(by='region', as_index=False)
```

## Clipping

Clip geometries to boundary of another geometry:

```python
# Clip to polygon boundary
clipped = gpd.clip(gdf, boundary_polygon)

# Clip to another GeoDataFrame
clipped = gpd.clip(gdf, boundary_gdf)
```

## Appending

Combine multiple GeoDataFrames:

```python
import pandas as pd

# Concatenate GeoDataFrames (CRS must match)
combined = pd.concat([gdf1, gdf2], ignore_index=True)

# With keys for identification
combined = pd.concat([gdf1, gdf2], keys=['source1', 'source2'])
```

## Spatial Indexing

Improve performance for spatial operations:

```python
# GeoPandas uses spatial index automatically for most operations
# Access the spatial index directly
sindex = gdf.sindex

# Query geometries intersecting a bounding box
possible_matches_index = list(sindex.intersection((xmin, ymin, xmax, ymax)))
possible_matches = gdf.iloc[possible_matches_index]

# Query geometries intersecting a polygon
possible_matches_index = list(sindex.query(polygon_geometry))
possible_matches = gdf.iloc[possible_matches_index]
```

Spatial indexing significantly speeds up:
- Spatial joins
- Overlay operations
- Queries with geometric predicates

## Distance Calculations

```python
# Distance between geometries
distances = gdf1.geometry.distance(gdf2.geometry)

# Distance to single geometry
distances = gdf.geometry.distance(single_point)

# Minimum distance to any feature
min_dist = gdf.geometry.distance(point).min()
```

## Area and Length Calculations

For accurate measurements, ensure proper CRS:

```python
# Reproject to appropriate projected CRS for area/length calculations
gdf_projected = gdf.to_crs(epsg=3857)  # Or appropriate UTM zone

# Calculate area (in CRS units, typically square meters)
areas = gdf_projected.geometry.area

# Calculate length/perimeter (in CRS units)
lengths = gdf_projected.geometry.length
```
