# Specialized Topics

Advanced specialized topics: geostatistics, optimization, ethics, and best practices.

## Geostatistics

### Variogram Analysis

```python
import numpy as np
from scipy.spatial.distance import pdist, squareform
import matplotlib.pyplot as plt

def empirical_variogram(points, values, max_lag=None, n_lags=15):
    """
    Calculate empirical variogram.
    """
    n = len(points)

    # Distance matrix
    dist_matrix = squareform(pdist(points))

    if max_lag is None:
        max_lag = np.max(dist_matrix) / 2

    # Calculate semivariance
    semivariance = []
    mean_distances = []

    for lag in np.linspace(0, max_lag, n_lags):
        # Pair selection
        mask = (dist_matrix >= lag) & (dist_matrix < lag + max_lag/n_lags)

        if np.sum(mask) == 0:
            continue

        # Semivariance: (1/2n) * sum(z_i - z_j)^2
        diff_squared = (values[:, None] - values) ** 2
        gamma = 0.5 * np.mean(diff_squared[mask])

        semivariance.append(gamma)
        mean_distances.append(lag + max_lag/(2*n_lags))

    return np.array(mean_distances), np.array(semivariance)

# Fit variogram model
def fit_variogram_model(lags, gammas, model='spherical'):
    """
    Fit theoretical variogram model.
    """
    from scipy.optimize import curve_fit

    def spherical(h, nugget, sill, range_):
        """Spherical model."""
        h = np.asarray(h)
        gamma = np.where(h < range_,
                        nugget + sill * (1.5 * h/range_ - 0.5 * (h/range_)**3),
                        nugget + sill)
        return gamma

    def exponential(h, nugget, sill, range_):
        """Exponential model."""
        return nugget + sill * (1 - np.exp(-3 * h / range_))

    def gaussian(h, nugget, sill, range_):
        """Gaussian model."""
        return nugget + sill * (1 - np.exp(-3 * (h/range_)**2))

    models = {
        'spherical': spherical,
        'exponential': exponential,
        'gaussian': gaussian
    }

    # Fit model
    popt, _ = curve_fit(models[model], lags, gammas,
                        p0=[np.min(gammas), np.max(gammas), np.max(lags)/2],
                        bounds=(0, np.inf))

    return popt, models[model]
```

### Kriging Interpolation

```python
from pykrige.ok import OrdinaryKriging
import numpy as np

def ordinary_kriging(x, y, z, grid_resolution=100):
    """
    Perform ordinary kriging interpolation.
    """
    # Create grid
    gridx = np.linspace(x.min(), x.max(), grid_resolution)
    gridy = np.linspace(y.min(), y.max(), grid_resolution)

    # Fit variogram
    OK = OrdinaryKriging(
        x, y, z,
        variogram_model='spherical',
        verbose=False,
        enable_plotting=False,
        coordinates_type='euclidean',
    )

    # Interpolate
    zinterp, sigmasq = OK.execute('grid', gridx, gridy)

    return zinterp, sigmasq, gridx, gridy

# Cross-validation
def kriging_cross_validation(x, y, z, n_folds=5):
    """
    Perform k-fold cross-validation for kriging.
    """
    from sklearn.model_selection import KFold

    kf = KFold(n_splits=n_folds)
    errors = []

    for train_idx, test_idx in kf.split(z):
        # Train
        OK = OrdinaryKriging(
            x[train_idx], y[train_idx], z[train_idx],
            variogram_model='spherical',
            verbose=False
        )

        # Predict at test locations
        predictions, _ = OK.execute('points',
                                    x[test_idx], y[test_idx])

        # Calculate error
        rmse = np.sqrt(np.mean((predictions - z[test_idx])**2))
        errors.append(rmse)

    return np.mean(errors), np.std(errors)
```

## Spatial Optimization

### Location-Allocation Problem

```python
from scipy.optimize import minimize
import numpy as np

def facility_location(demand_points, n_facilities=5):
    """
    Solve p-median facility location problem.
    """

    n_demand = len(demand_points)

    # Distance matrix
    dist_matrix = np.zeros((n_demand, n_demand))
    for i, p1 in enumerate(demand_points):
        for j, p2 in enumerate(demand_points):
            dist_matrix[i, j] = np.sqrt((p1[0]-p2[0])**2 + (p1[1]-p2[1])**2)

    # Decision variables: which demand points get facilities
    def objective(x):
        """Minimize total weighted distance."""
        # x is binary array of facility locations
        facility_indices = np.where(x > 0.5)[0]

        # Assign each demand to nearest facility
        total_distance = 0
        for i in range(n_demand):
            min_dist = np.min([dist_matrix[i, f] for f in facility_indices])
            total_distance += min_dist

        return total_distance

    # Constraints: exactly n_facilities
    constraints = {'type': 'eq', 'fun': lambda x: np.sum(x) - n_facilities}

    # Bounds: binary
    bounds = [(0, 1)] * n_demand

    # Initial guess: random locations
    x0 = np.zeros(n_demand)
    x0[:n_facilities] = 1

    # Solve
    result = minimize(
        objective, x0,
        method='SLSQP',
        bounds=bounds,
        constraints=constraints
    )

    facility_indices = np.where(result.x > 0.5)[0]
    return demand_points[facility_indices]
```

### Routing Optimization

```python
import networkx as nx

def traveling_salesman(G, start_node):
    """
    Solve TSP using heuristic.
    """
    unvisited = set(G.nodes())
    unvisited.remove(start_node)

    route = [start_node]
    current = start_node

    while unvisited:
        # Find nearest unvisited node
        nearest = min(unvisited,
                     key=lambda n: G[current][n].get('weight', 1))
        route.append(nearest)
        unvisited.remove(nearest)
        current = nearest

    # Return to start
    route.append(start_node)

    return route

# Vehicle Routing Problem
def vehicle_routing(G, depot, customers, n_vehicles=3, capacity=100):
    """
    Solve VRP using heuristic (cluster-first, route-second).
    """
    from sklearn.cluster import KMeans

    # 1. Cluster customers
    coords = np.array([[G.nodes[n]['x'], G.nodes[n]['y']] for n in customers])
    kmeans = KMeans(n_clusters=n_vehicles, random_state=42)
    labels = kmeans.fit_predict(coords)

    # 2. Route each cluster
    routes = []
    for i in range(n_vehicles):
        cluster_customers = [customers[j] for j in range(len(customers)) if labels[j] == i]
        route = traveling_salesman(G.subgraph(cluster_customers + [depot]), depot)
        routes.append(route)

    return routes
```

## Ethics and Privacy

### Privacy-Preserving Geospatial Analysis

```python
# Differential privacy for spatial data
def add_dp_noise(locations, epsilon=1.0, radius=100):
    """
    Add differential privacy noise to locations.
    """
    import numpy as np

    noisy_locations = []
    for lon, lat in locations:
        # Calculate noise (Laplace mechanism)
        sensitivity = radius
        scale = sensitivity / epsilon

        noise_lon = np.random.laplace(0, scale)
        noise_lat = np.random.laplace(0, scale)

        noisy_locations.append((lon + noise_lon, lat + noise_lat))

    return noisy_locations

# K-anonymity for trajectory data
def k_anonymize_trajectory(trajectory, k=5):
    """
    Apply k-anonymity to trajectory.
    """
    # 1. Divide into segments
    # 2. Find k-1 similar trajectories
    # 3. Replace segment with generalization

    # Simplified: spatial generalization
    from shapely.geometry import LineString

    simplified = LineString(trajectory).simplify(0.01)
    return list(simplified.coords)
```

### Data Provenance

```python
# Track geospatial data lineage
class DataLineage:
    def __init__(self):
        self.history = []

    def record_transformation(self, input_data, operation, output_data, params):
        """Record data transformation."""
        record = {
            'timestamp': pd.Timestamp.now(),
            'input': input_data,
            'operation': operation,
            'output': output_data,
            'parameters': params
        }
        self.history.append(record)

    def get_lineage(self, data_id):
        """Get complete lineage for a dataset."""
        lineage = []
        for record in reversed(self.history):
            if record['output'] == data_id:
                lineage.append(record)
                lineage.extend(self.get_lineage(record['input']))
        return lineage
```

## Best Practices

### Reproducible Research

```python
# Use environment.yml for dependencies
# environment.yml:
"""
name: geomaster
dependencies:
  - python=3.11
  - geopandas
  - rasterio
  - scikit-learn
  - pip
  - pip:
    - torchgeo
"""

# Capture session info
def capture_environment():
    """Capture software and data versions."""
    import platform
    import geopandas as gpd
    import rasterio
    import numpy as np
    import pandas as pd

    info = {
        'os': platform.platform(),
        'python': platform.python_version(),
        'geopandas': gpd.__version__,
        'rasterio': rasterio.__version__,
        'numpy': np.__version__,
        'pandas': pd.__version__,
        'timestamp': pd.Timestamp.now()
    }

    return info

# Save with output
import json
with open('processing_info.json', 'w') as f:
    json.dump(capture_environment(), f, indent=2, default=str)
```

### Code Organization

```python
# Project structure
"""
project/
├── data/
│   ├── raw/
│   ├── processed/
│   └── external/
├── notebooks/
├── src/
│   ├── __init__.py
│   ├── data_loading.py
│   ├── preprocessing.py
│   ├── analysis.py
│   └── visualization.py
├── tests/
├── config.yaml
└── README.md
"""

# Configuration management
import yaml

with open('config.yaml') as f:
    config = yaml.safe_load(f)

# Access parameters
crs = config['projection']['output_crs']
resolution = config['data']['resolution']
```

### Performance Optimization

```python
# Memory profiling
import memory_profiler

@memory_profiler.profile
def process_large_dataset(data_path):
    """Profile memory usage."""
    data = load_data(data_path)
    result = process(data)
    return result

# Vectorization vs loops
# BAD: Iterating rows
for idx, row in gdf.iterrows():
    gdf.loc[idx, 'buffer'] = row.geometry.buffer(100)

# GOOD: Vectorized
gdf['buffer'] = gdf.geometry.buffer(100)

# Chunked processing
def process_in_chunks(gdf, func, chunk_size=1000):
    """Process GeoDataFrame in chunks."""
    results = []
    for i in range(0, len(gdf), chunk_size):
        chunk = gdf.iloc[i:i+chunk_size]
        result = func(chunk)
        results.append(result)
    return pd.concat(results)
```

For more code examples, see [code-examples.md](code-examples.md).
