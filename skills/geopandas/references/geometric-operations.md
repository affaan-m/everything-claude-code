# Geometric Operations

GeoPandas provides extensive geometric manipulation through Shapely integration.

## Constructive Operations

Create new geometries from existing ones:

### Buffer

Create geometries representing all points within a distance:

```python
# Buffer by fixed distance
buffered = gdf.geometry.buffer(10)

# Negative buffer (erosion)
eroded = gdf.geometry.buffer(-5)

# Buffer with resolution parameter
smooth_buffer = gdf.geometry.buffer(10, resolution=16)
```

### Boundary

Get lower-dimensional boundary:

```python
# Polygon -> LineString, LineString -> MultiPoint
boundaries = gdf.geometry.boundary
```

### Centroid

Get center point of each geometry:

```python
centroids = gdf.geometry.centroid
```

### Convex Hull

Smallest convex polygon containing all points:

```python
hulls = gdf.geometry.convex_hull
```

### Concave Hull

Smallest concave polygon containing all points:

```python
# ratio parameter controls concavity (0 = convex hull, 1 = most concave)
concave_hulls = gdf.geometry.concave_hull(ratio=0.5)
```

### Envelope

Smallest axis-aligned rectangle:

```python
envelopes = gdf.geometry.envelope
```

### Simplify

Reduce geometric complexity:

```python
# Douglas-Peucker algorithm with tolerance
simplified = gdf.geometry.simplify(tolerance=10)

# Preserve topology (prevents self-intersections)
simplified = gdf.geometry.simplify(tolerance=10, preserve_topology=True)
```

### Segmentize

Add vertices to line segments:

```python
# Add vertices with maximum segment length
segmented = gdf.geometry.segmentize(max_segment_length=5)
```

### Union All

Combine all geometries into single geometry:

```python
# Union all features
unified = gdf.geometry.union_all()
```

## Affine Transformations

Mathematical transformations of coordinates:

### Rotate

```python
# Rotate around origin (0, 0) by angle in degrees
rotated = gdf.geometry.rotate(angle=45, origin='center')

# Rotate around custom point
rotated = gdf.geometry.rotate(angle=45, origin=(100, 100))
```

### Scale

```python
# Scale uniformly
scaled = gdf.geometry.scale(xfact=2.0, yfact=2.0)

# Scale with origin
scaled = gdf.geometry.scale(xfact=2.0, yfact=2.0, origin='center')
```

### Translate

```python
# Shift coordinates
translated = gdf.geometry.translate(xoff=100, yoff=50)
```

### Skew

```python
# Shear transformation
skewed = gdf.geometry.skew(xs=15, ys=0, origin='center')
```

### Custom Affine Transform

```python
from shapely import affinity

# Apply 6-parameter affine transformation matrix
# [a, b, d, e, xoff, yoff]
transformed = gdf.geometry.affine_transform([1, 0, 0, 1, 100, 50])
```

## Geometric Properties

Access geometric properties (returns pandas Series):

```python
# Area
areas = gdf.geometry.area

# Length/perimeter
lengths = gdf.geometry.length

# Bounding box coordinates
bounds = gdf.geometry.bounds  # Returns DataFrame with minx, miny, maxx, maxy

# Total bounds for entire GeoSeries
total_bounds = gdf.geometry.total_bounds  # Returns array [minx, miny, maxx, maxy]

# Check geometry types
geom_types = gdf.geometry.geom_type

# Check if valid
is_valid = gdf.geometry.is_valid

# Check if empty
is_empty = gdf.geometry.is_empty
```

## Geometric Relationships

Binary predicates testing relationships:

```python
# Within
gdf1.geometry.within(gdf2.geometry)

# Contains
gdf1.geometry.contains(gdf2.geometry)

# Intersects
gdf1.geometry.intersects(gdf2.geometry)

# Touches
gdf1.geometry.touches(gdf2.geometry)

# Crosses
gdf1.geometry.crosses(gdf2.geometry)

# Overlaps
gdf1.geometry.overlaps(gdf2.geometry)

# Covers
gdf1.geometry.covers(gdf2.geometry)

# Covered by
gdf1.geometry.covered_by(gdf2.geometry)
```

## Point Extraction

Extract specific points from geometries:

```python
# Representative point (guaranteed to be within geometry)
rep_points = gdf.geometry.representative_point()

# Interpolate point along line at distance
points = line_gdf.geometry.interpolate(distance=10)

# Interpolate point at normalized distance (0 to 1)
midpoints = line_gdf.geometry.interpolate(distance=0.5, normalized=True)
```

## Delaunay Triangulation

```python
# Create triangulation
triangles = gdf.geometry.delaunay_triangles()
```
