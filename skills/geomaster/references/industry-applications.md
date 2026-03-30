# Industry Applications

Real-world geospatial workflows across industries: urban planning, disaster management, utilities, and more.

## Urban Planning

### Land Use Classification

```python
def classify_urban_land_use(sentinel2_path, training_data_path):
    """
    Urban land use classification workflow.
    Classes: Residential, Commercial, Industrial, Green Space, Water
    """
    from sklearn.ensemble import RandomForestClassifier
    import geopandas as gpd
    import rasterio

    # 1. Load training data
    training = gpd.read_file(training_data_path)

    # 2. Extract spectral and textural features
    features = extract_features(sentinel2_path, training)

    # 3. Train classifier
    rf = RandomForestClassifier(n_estimators=100, max_depth=20)
    rf.fit(features['X'], features['y'])

    # 4. Classify full image
    classified = classify_image(sentinel2_path, rf)

    # 5. Post-processing
    cleaned = remove_small_objects(classified, min_size=100)
    smoothed = majority_filter(cleaned, size=3)

    # 6. Calculate statistics
    stats = calculate_class_statistics(cleaned)

    return cleaned, stats

def extract_features(image_path, training_gdf):
    """Extract spectral and textural features."""
    with rasterio.open(image_path) as src:
        image = src.read()
        profile = src.profile

    # Spectral features
    features = {
        'NDVI': (image[7] - image[3]) / (image[7] + image[3] + 1e-8),
        'NDWI': (image[2] - image[7]) / (image[2] + image[7] + 1e-8),
        'NDBI': (image[10] - image[7]) / (image[10] + image[7] + 1e-8),
        'UI': (image[10] + image[3]) / (image[7] + image[2] + 1e-8)  # Urban Index
    }

    # Textural features (GLCM)
    from skimage.feature import graycomatrix, graycoprops

    textures = {}
    for band_idx in [3, 7, 10]:  # Red, NIR, SWIR
        band = image[band_idx]
        band_8bit = ((band - band.min()) / (band.max() - band.min()) * 255).astype(np.uint8)

        glcm = graycomatrix(band_8bit, distances=[1], angles=[0], levels=256, symmetric=True)
        contrast = graycoprops(glcm, 'contrast')[0, 0]
        homogeneity = graycoprops(glcm, 'homogeneity')[0, 0]

        textures[f'contrast_{band_idx}'] = contrast
        textures[f'homogeneity_{band_idx}'] = homogeneity

    # Combine all features
    # ... (implementation)

    return features
```

### Population Estimation

```python
def dasymetric_population(population_raster, land_use_classified):
    """
    Dasymetric population redistribution.
    """
    # 1. Identify inhabitable areas
    inhabitable_mask = (
        (land_use_classified != 0) &  # Water
        (land_use_classified != 4) &  # Industrial
        (land_use_classified != 5)    # Roads
    )

    # 2. Assign weights by land use type
    weights = np.zeros_like(land_use_classified, dtype=float)
    weights[land_use_classified == 1] = 1.0  # Residential
    weights[land_use_classified == 2] = 0.3  # Commercial
    weights[land_use_classified == 3] = 0.5  # Green Space

    # 3. Calculate weighting layer
    weighting_layer = weights * inhabitable_mask
    total_weight = np.sum(weighting_layer)

    # 4. Redistribute population
    total_population = np.sum(population_raster)
    redistributed = population_raster * (weighting_layer / total_weight) * total_population

    return redistributed
```

## Disaster Management

### Flood Risk Assessment

```python
def flood_risk_assessment(dem_path, river_path, return_period_years=100):
    """
    Comprehensive flood risk assessment.
    """

    # 1. Hydrological modeling
    flow_accumulation = calculate_flow_accumulation(dem_path)
    flow_direction = calculate_flow_direction(dem_path)
    watershed = delineate_watershed(dem_path, flow_direction)

    # 2. Flood extent estimation
    flood_depth = estimate_flood_extent(dem_path, river_path, return_period_years)

    # 3. Exposure analysis
    settlements = gpd.read_file('settlements.shp')
    roads = gpd.read_file('roads.shp')
    infrastructure = gpd.read_file('infrastructure.shp')

    exposed_settlements = gpd.clip(settlements, flood_extent_polygon)
    exposed_roads = gpd.clip(roads, flood_extent_polygon)

    # 4. Vulnerability assessment
    vulnerability = assess_vulnerability(exposed_settlements)

    # 5. Risk calculation
    risk = flood_depth * vulnerability  # Risk = Hazard × Vulnerability

    # 6. Generate risk maps
    create_risk_map(risk, settlements, output_path='flood_risk.tif')

    return {
        'flood_extent': flood_extent_polygon,
        'exposed_population': calculate_exposed_population(exposed_settlements),
        'risk_zones': risk
    }

def estimate_flood_extent(dem_path, river_path, return_period):
    """
    Estimate flood extent using Manning's equation and hydraulic modeling.
    """
    # 1. Get river cross-section
    # 2. Calculate discharge for return period
    # 3. Apply Manning's equation for water depth
    # 4. Create flood raster

    # Simplified: flat water level
    with rasterio.open(dem_path) as src:
        dem = src.read(1)
        profile = src.profile

    # Water level based on return period
    water_levels = {10: 5, 50: 8, 100: 10, 500: 12}
    water_level = water_levels.get(return_period, 10)

    # Flood extent
    flood_extent = dem < water_level

    return flood_extent
```

### Wildfire Risk Modeling

```python
def wildfire_risk_assessment(vegetation_path, dem_path, weather_data, infrastructure_path):
    """
    Wildfire risk assessment combining multiple factors.
    """

    # 1. Fuel load (from vegetation)
    with rasterio.open(vegetation_path) as src:
        vegetation = src.read(1)

    # Fuel types: 0=No fuel, 1=Low, 2=Medium, 3=High
    fuel_load = vegetation.map_classes({1: 0.2, 2: 0.5, 3: 0.8, 4: 1.0})

    # 2. Slope (fires spread faster uphill)
    with rasterio.open(dem_path) as src:
        dem = src.read(1)

    slope = calculate_slope(dem)
    slope_factor = 1 + (slope / 90) * 0.5  # Up to 50% increase

    # 3. Wind influence
    wind_speed = weather_data['wind_speed']
    wind_direction = weather_data['wind_direction']
    wind_factor = 1 + (wind_speed / 50) * 0.3

    # 4. Vegetation dryness (from NDWI anomaly)
    dryness = calculate_vegetation_dryness(vegetation_path)
    dryness_factor = 1 + dryness * 0.4

    # 5. Combine factors
    risk = fuel_load * slope_factor * wind_factor * dryness_factor

    # 6. Identify assets at risk
    infrastructure = gpd.read_file(infrastructure_path)
    risk_at_infrastructure = extract_raster_values_at_points(risk, infrastructure)

    infrastructure['risk_level'] = risk_at_infrastructure
    high_risk_assets = infrastructure[infrastructure['risk_level'] > 0.7]

    return risk, high_risk_assets
```

## Utilities & Infrastructure

### Power Line Corridor Mapping

```python
def power_line_corridor_analysis(power_lines_path, vegetation_height_path, buffer_distance=50):
    """
    Analyze vegetation encroachment on power line corridors.
    """

    # 1. Load power lines
    power_lines = gpd.read_file(power_lines_path)

    # 2. Create corridor buffer
    corridor = power_lines.buffer(buffer_distance)

    # 3. Load vegetation height
    with rasterio.open(vegetation_height_path) as src:
        veg_height = src.read(1)
        profile = src.profile

    # 4. Extract vegetation height within corridor
    veg_within_corridor = rasterio.mask.mask(veg_height, corridor.geometry, crop=True)[0]

    # 5. Identify encroachment (vegetation > safe height)
    safe_height = 10  # meters
    encroachment = veg_within_corridor > safe_height

    # 6. Classify risk zones
    high_risk = encroachment & (veg_within_corridor > safe_height * 1.5)
    medium_risk = encroachment & ~high_risk

    # 7. Generate maintenance priority map
    priority = np.zeros_like(veg_within_corridor)
    priority[high_risk] = 3  # Urgent
    priority[medium_risk] = 2  # Monitor
    priority[~encroachment] = 1  # Clear

    # 8. Create work order points
    from scipy import ndimage
    labeled, num_features = ndimage.label(high_risk)

    work_orders = []
    for i in range(1, num_features + 1):
        mask = labeled == i
        centroid = ndimage.center_of_mass(mask)
        work_orders.append({
            'location': centroid,
            'area_ha': np.sum(mask) * 0.0001,  # Assuming 1m resolution
            'priority': 'Urgent'
        })

    return priority, work_orders
```

### Pipeline Route Optimization

```python
def optimize_pipeline_route(origin, destination, constraints_path, cost_surface_path):
    """
    Optimize pipeline route using least-cost path analysis.
    """

    # 1. Load cost surface
    with rasterio.open(cost_surface_path) as src:
        cost = src.read(1)
        profile = src.profile

    # 2. Apply constraints
    constraints = gpd.read_file(constraints_path)
    no_go_zones = constraints[constraints['type'] == 'no_go']

    # Set very high cost for no-go zones
    for _, zone in no_go_zones.iterrows():
        mask = rasterize_features(zone.geometry, profile['shape'])
        cost[mask > 0] = 999999

    # 3. Least-cost path (Dijkstra)
    from scipy.sparse import csr_matrix
    from scipy.sparse.csgraph import shortest_path

    # Convert to graph (8-connected)
    graph = create_graph_from_raster(cost)

    # Origin and destination nodes
    orig_node = coord_to_node(origin, profile)
    dest_node = coord_to_node(destination, profile)

    # Find path
    _, predecessors = shortest_path(csgraph=graph,
                                   directed=True,
                                   indices=orig_node,
                                   return_predecessors=True)

    # Reconstruct path
    path = reconstruct_path(predecessors, dest_node)

    # 4. Convert path to coordinates
    route_coords = [node_to_coord(node, profile) for node in path]
    route = LineString(route_coords)

    return route

def create_graph_from_raster(cost_raster):
    """Create graph from cost raster for least-cost path."""
    # 8-connected neighbor costs
    # Implementation depends on library choice
    pass
```

## Transportation

### Traffic Analysis

```python
def traffic_analysis(roads_gdf, traffic_counts_path):
    """
    Analyze traffic patterns and congestion.
    """

    # 1. Load traffic count data
    counts = gpd.read_file(traffic_counts_path)

    # 2. Interpolate traffic to all roads
    import networkx as nx

    # Create road network
    G = nx.Graph()
    for _, road in roads_gdf.iterrows():
        coords = list(road.geometry.coords)
        for i in range(len(coords) - 1):
            G.add_edge(coords[i], coords[i+1],
                      length=road.geometry.length,
                      road_id=road.id)

    # 3. Spatial interpolation of counts
    from sklearn.neighbors import KNeighborsRegressor

    count_coords = np.array([[p.x, p.y] for p in counts.geometry])
    count_values = counts['AADT'].values

    knn = KNeighborsRegressor(n_neighbors=5, weights='distance')
    knn.fit(count_coords, count_values)

    # 4. Predict traffic for all road segments
    all_coords = np.array([[n[0], n[1]] for n in G.nodes()])
    predicted_traffic = knn.predict(all_coords)

    # 5. Identify congested segments
    for i, (u, v) in enumerate(G.edges()):
        avg_traffic = (predicted_traffic[list(G.nodes()).index(u)] +
                      predicted_traffic[list(G.nodes()).index(v)]) / 2
        capacity = G[u][v]['capacity']  # Need capacity data

        G[u][v]['v_c_ratio'] = avg_traffic / capacity

    # 6. Congestion hotspots
    congested_edges = [(u, v) for u, v, d in G.edges(data=True)
                      if d.get('v_c_ratio', 0) > 0.9]

    return G, congested_edges
```

### Transit Service Area Analysis

```python
def transit_service_area(stops_gdf, max_walk_distance=800, max_time=30):
    """
    Calculate transit service area considering walk distance and travel time.
    """

    # 1. Walkable area around stops
    walk_buffer = stops_gdf.buffer(max_walk_distance)

    # 2. Load road network for walk time
    roads = gpd.read_file('roads.shp')
    G = osmnx.graph_from_gdf(roads)

    # 3. For each stop, calculate accessible area within walk time
    service_areas = []

    for _, stop in stops_gdf.iterrows():
        # Find nearest node
        stop_node = ox.distance.nearest_nodes(G, stop.geometry.x, stop.geometry.y)

        # Get subgraph within walk time
        walk_speed = 5 / 3.6  # km/h to m/s
        max_nodes = int(max_time * 60 * walk_speed / 20)  # Assuming ~20m per edge

        subgraph = nx.ego_graph(G, stop_node, radius=max_nodes)

        # Create polygon from reachable nodes
        reachable_nodes = ox.graph_to_gdfs(subgraph, edges=False)
        service_area = reachable_nodes.geometry.unary_union.convex_hull

        service_areas.append({
            'stop_id': stop.stop_id,
            'service_area': service_area,
            'area_km2': service_area.area / 1e6
        })

    return service_areas
```

For more industry-specific workflows, see [code-examples.md](code-examples.md).
