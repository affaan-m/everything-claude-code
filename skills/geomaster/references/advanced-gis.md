# Advanced GIS Topics

Advanced spatial analysis techniques: 3D GIS, spatiotemporal analysis, topology, and network analysis.

## 3D GIS

### 3D Vector Operations

```python
import geopandas as gpd
from shapely.geometry import Point, LineString, Polygon
import pyproj
import numpy as np

# Create 3D geometries (with Z coordinate)
point_3d = Point(0, 0, 100)  # x, y, elevation
line_3d = LineString([(0, 0, 0), (100, 100, 50)])

# Load 3D data
gdf_3d = gpd.read_file('buildings_3d.geojson')

# Access Z coordinates
gdf_3d['height'] = gdf_3d.geometry.apply(lambda g: g.coords[0][2] if g.has_z else None)

# 3D buffer (cylinder)
def buffer_3d(point, radius, height):
    """Create a 3D cylindrical buffer."""
    base = Point(point.x, point.y).buffer(radius)
    # Extrude to 3D (conceptual)
    return base, point.z, point.z + height

# 3D distance (Euclidean in 3D space)
def distance_3d(point1, point2):
    """Calculate 3D Euclidean distance."""
    dx = point2.x - point1.x
    dy = point2.y - point1.y
    dz = point2.z - point1.z
    return np.sqrt(dx**2 + dy**2 + dz**2)
```

### 3D Raster Analysis

```python
import rasterio
import numpy as np

# Voxel-based analysis
def voxel_analysis(dem_path, dsm_path):
    """Analyze volume between DEM and DSM."""
    with rasterio.open(dem_path) as src_dem:
        dem = src_dem.read(1)
        transform = src_dem.transform

    with rasterio.open(dsm_path) as src_dsm:
        dsm = src_dsm.read(1)

    # Height difference
    height = dsm - dem

    # Volume calculation
    pixel_area = transform[0] * transform[4]  # Usually negative
    volume = np.sum(height[height > 0]) * abs(pixel_area)

    # Volume per height class
    height_bins = [0, 5, 10, 20, 50, 100]
    volume_by_class = {}

    for i in range(len(height_bins) - 1):
        mask = (height >= height_bins[i]) & (height < height_bins[i + 1])
        volume_by_class[f'{height_bins[i]}-{height_bins[i+1]}m'] = \
            np.sum(height[mask]) * abs(pixel_area)

    return volume, volume_by_class
```

### Viewshed Analysis

```python
def viewshed(dem, observer_x, observer_y, observer_height=1.7, max_distance=5000):
    """
    Calculate viewshed using line-of-sight algorithm.
    """

    # Convert observer to raster coordinates
    observer_row = int((observer_y - dem_origin_y) / cell_size)
    observer_col = int((observer_x - dem_origin_x) / cell_size)

    rows, cols = dem.shape
    viewshed = np.zeros_like(dem, dtype=bool)

    observer_z = dem[observer_row, observer_col] + observer_height

    # For each direction
    for angle in np.linspace(0, 2*np.pi, 360):
        # Cast ray
        for r in range(1, int(max_distance / cell_size)):
            row = observer_row + int(r * np.sin(angle))
            col = observer_col + int(r * np.cos(angle))

            if row < 0 or row >= rows or col < 0 or col >= cols:
                break

            target_z = dem[row, col]

            # Line-of-sight calculation
            dist = r * cell_size
            line_height = observer_z + (target_z - observer_z) * (dist / max_distance)

            if target_z > line_height:
                viewshed[row, col] = False
            else:
                viewshed[row, col] = True

    return viewshed
```

## Spatiotemporal Analysis

### Trajectory Analysis

```python
import movingpandas as mpd
import geopandas as gpd
import pandas as pd

# Create trajectory from point data
gdf = gpd.read_file('gps_points.gpkg')

# Convert to trajectory
traj_collection = mpd.TrajectoryCollection(gdf, 'track_id', t='timestamp')

# Split trajectories (e.g., by time gap)
traj_collection = mpd.SplitByObservationGap(traj_collection, gap=pd.Timedelta('1 hour'))

# Trajectory statistics
for traj in traj_collection:
    print(f"Trajectory {traj.id}:")
    print(f"  Length: {traj.get_length() / 1000:.2f} km")
    print(f"  Duration: {traj.get_duration()}")
    print(f"  Speed: {traj.get_speed() * 3.6:.2f} km/h")

# Stop detection
stops = mpd.stop_detection(
    traj_collection,
    max_diameter=100,  # meters
    min_duration=pd.Timedelta('5 minutes')
)

# Generalization (simplify trajectories)
traj_generalized = mpd.DouglasPeuckerGeneralizer(traj_collection, tolerance=10).generalize()

# Split by stop
traj_moving, stops = mpd.StopSplitter(traj_collection).split()
```

### Space-Time Cube

```python
def create_space_time_cube(gdf, time_column='timestamp', grid_size=100, time_step='1H'):
    """
    Create a 3D space-time cube for hotspot analysis.
    """

    # 1. Spatial binning
    gdf['x_bin'] = (gdf.geometry.x // grid_size).astype(int)
    gdf['y_bin'] = (gdf.geometry.y // grid_size).astype(int)

    # 2. Temporal binning
    gdf['t_bin'] = gdf[time_column].dt.floor(time_step)

    # 3. Create cube (x, y, time)
    cube = gdf.groupby(['x_bin', 'y_bin', 't_bin']).size().unstack(fill_value=0)

    return cube

def emerging_hot_spot_analysis(cube, k=8):
    """
    Emerging Hot Spot Analysis (as implemented in ArcGIS).
    Simplified version using Getis-Ord Gi* statistic.
    """
    from esda.getisord import G_Local

    # Calculate Gi* statistic for each time step
    hotspots = {}
    for timestep in cube.columns:
        data = cube[timestep].values.reshape(-1, 1)
        g_local = G_Local(data, k=k)
        hotspots[timestep] = g_local.p_sim < 0.05  # Significant hotspots

    return hotspots
```

## Topology

### Topological Relationships

```python
from shapely.geometry import Point, LineString, Polygon
from shapely.ops import unary_union

# Planar graph
def build_planar_graph(lines_gdf):
    """Build a planar graph from line features."""
    import networkx as nx

    G = nx.Graph()

    # Add nodes at intersections
    for i, line1 in lines_gdf.iterrows():
        for j, line2 in lines_gdf.iterrows():
            if i < j:
                if line1.geometry.intersects(line2.geometry):
                    intersection = line1.geometry.intersection(line2.geometry)
                    G.add_node((intersection.x, intersection.y))

    # Add edges
    for _, line in lines_gdf.iterrows():
        coords = list(line.geometry.coords)
        G.add_edge(coords[0], coords[-1],
                   weight=line.geometry.length,
                   geometry=line.geometry)

    return G

# Topology validation
def validate_topology(gdf):
    """Check for topological errors."""

    errors = []

    # 1. Check for gaps
    if gdf.geom_type.iloc[0] == 'Polygon':
        dissolved = unary_union(gdf.geometry)
        for i, geom in enumerate(gdf.geometry):
            if not geom.touches(dissolved - geom):
                errors.append(f"Gap detected at feature {i}")

    # 2. Check for overlaps
    for i, geom1 in enumerate(gdf.geometry):
        for j, geom2 in enumerate(gdf.geometry):
            if i < j and geom1.overlaps(geom2):
                errors.append(f"Overlap between features {i} and {j}")

    # 3. Check for self-intersections
    for i, geom in enumerate(gdf.geometry):
        if not geom.is_valid:
            errors.append(f"Self-intersection at feature {i}: {geom.is_valid}")

    return errors
```

## Network Analysis

### Advanced Routing

```python
import osmnx as ox
import networkx as nx

# Download and prepare network
G = ox.graph_from_place('Portland, Maine, USA', network_type='drive')
G = ox.add_edge_speeds(G)
G = ox.add_edge_travel_times(G)

# Multi-criteria routing
def multi_criteria_routing(G, orig, dest, weights=['length', 'travel_time']):
    """
    Find routes optimizing for multiple criteria.
    """
    # Normalize weights
    for w in weights:
        values = [G.edges[e][w] for e in G.edges]
        min_val, max_val = min(values), max(values)
        for e in G.edges:
            G.edges[e][f'{w}_norm'] = (G.edges[e][w] - min_val) / (max_val - min_val)

    # Combined weight
    for e in G.edges:
        G.edges[e]['combined'] = sum(G.edges[e][f'{w}_norm'] for w in weights) / len(weights)

    # Find path
    route = nx.shortest_path(G, orig, dest, weight='combined')
    return route

# Isochrone (accessibility area)
def isochrone(G, center_node, time_limit=600):
    """
    Calculate accessible area within time limit.
    """
    # Get subgraph of reachable nodes
    subgraph = nx.ego_graph(G, center_node,
                            radius=time_limit,
                            distance='travel_time')

    # Get node geometries
    nodes = ox.graph_to_gdfs(subgraph, edges=False)

    # Create polygon of accessible area
    from shapely.geometry import MultiPoint
    points = MultiPoint(nodes.geometry.tolist())
    isochrone_polygon = points.convex_hull

    return isochrone_polygon, subgraph

# Betweenness centrality (importance of nodes)
def calculate_centrality(G):
    """
    Calculate betweenness centrality for network analysis.
    """
    centrality = nx.betweenness_centrality(G, weight='length')

    # Add to nodes
    for node, value in centrality.items():
        G.nodes[node]['betweenness'] = value

    return centrality
```

### Service Area Analysis

```python
def service_area(G, facilities, max_distance=1000):
    """
    Calculate service areas for facilities.
    """

    service_areas = []

    for facility in facilities:
        # Find nearest node
        node = ox.distance.nearest_nodes(G, facility.x, facility.y)

        # Get nodes within distance
        subgraph = nx.ego_graph(G, node, radius=max_distance, distance='length')

        # Create convex hull
        nodes = ox.graph_to_gdfs(subgraph, edges=False)
        service_area = nodes.geometry.unary_union.convex_hull

        service_areas.append({
            'facility': facility,
            'area': service_area,
            'nodes_served': len(subgraph.nodes())
        })

    return service_areas

# Location-allocation (facility location)
def location_allocation(demand_points, candidate_sites, n_facilities=5):
    """
    Solve facility location problem (p-median).
    """
    from scipy.spatial.distance import cdist

    # Distance matrix
    coords_demand = [[p.x, p.y] for p in demand_points]
    coords_sites = [[s.x, s.y] for s in candidate_sites]
    distances = cdist(coords_demand, coords_sites)

    # Simple heuristic: K-means clustering
    from sklearn.cluster import KMeans

    kmeans = KMeans(n_clusters=n_facilities, random_state=42)
    labels = kmeans.fit_predict(coords_demand)

    # Find nearest candidate site to each cluster center
    facilities = []
    for i in range(n_facilities):
        cluster_center = kmeans.cluster_centers_[i]
        nearest_site_idx = np.argmin(cdist([cluster_center], coords_sites))
        facilities.append(candidate_sites[nearest_site_idx])

    return facilities
```

For more advanced examples, see [code-examples.md](code-examples.md).
