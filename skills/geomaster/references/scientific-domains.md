# Scientific Domain Applications

Geospatial applications across scientific disciplines: marine, atmospheric, hydrology, and more.

## Marine & Coastal GIS

### Coastal Vulnerability Assessment

```python
import geopandas as gpd
import rasterio
import numpy as np

def coastal_vulnerability_index(dem_path, shoreline_path, output_path):
    """Calculate coastal vulnerability index."""

    # 1. Load elevation
    with rasterio.open(dem_path) as src:
        dem = src.read(1)
        transform = src.transform

    # 2. Distance to shoreline
    shoreline = gpd.read_file(shoreline_path)
    # ... calculate distance raster ...

    # 3. Vulnerability criteria (0-1 scale)
    elevation_vuln = 1 - np.clip(dem / 10, 0, 1)  # Lower = more vulnerable
    slope_vuln = 1 - np.clip(slope / 10, 0, 1)

    # 4. Weighted overlay
    weights = {
        'elevation': 0.3,
        'slope': 0.2,
        'distance_to_shore': 0.2,
        'wave_height': 0.2,
        'sea_level_trend': 0.1
    }

    cvi = sum(vuln * w for vuln, w in zip(
        [elevation_vuln, slope_vuln, distance_vuln, wave_vuln, slr_vuln],
        weights.values()
    ))

    return cvi
```

### Marine Habitat Mapping

```python
# Benthic habitat classification
def classify_benthic_habitat(bathymetry, backscatter, derived_layers):
    """
    Classify benthic habitat using:
    - Bathymetry (depth)
    - Backscatter intensity
    - Derived terrain features
    """

    # 1. Extract features
    features = {
        'depth': bathymetry,
        'backscatter': backscatter,
        'slope': calculate_slope(bathymetry),
        'rugosity': calculate_rugosity(bathymetry),
        'curvature': calculate_curvature(bathymetry)
    }

    # 2. Classification rules
    habitat_classes = {}

    # Coral reef: shallow, high rugosity, moderate backscatter
    coral_mask = (
        (features['depth'] > -30) &
        (features['depth'] < -5) &
        (features['rugosity'] > 2) &
        (features['backscatter'] > -15)
    )
    habitat_classes[coral_mask] = 1  # Coral

    # Seagrass: very shallow, low backscatter
    seagrass_mask = (
        (features['depth'] > -15) &
        (features['depth'] < -2) &
        (features['backscatter'] < -20)
    )
    habitat_classes[seagrass_mask] = 2  # Seagrass

    # Sandy bottom: low rugosity
    sand_mask = (
        (features['rugosity'] < 1.5) &
        (features['slope'] < 5)
    )
    habitat_classes[sand_mask] = 3  # Sand

    return habitat_classes
```

## Atmospheric Science

### Weather Data Processing

```python
import xarray as xr
import rioxarray

# Open NetCDF weather data
ds = xr.open_dataset('era5_data.nc')

# Select variable and time
temperature = ds.t2m  # 2m temperature
precipitation = ds.tp  # Total precipitation

# Spatial subsetting
roi = ds.sel(latitude=slice(20, 30), longitude=slice(65, 75))

# Temporal aggregation
monthly = roi.resample(time='1M').mean()
daily = roi.resample(time='1D').sum()

# Export to GeoTIFF
temperature.rio.to_raster('temperature.tif')

# Calculate climate indices
def calculate_spi(precip, scale=3):
    """Standardized Precipitation Index."""
    # Fit gamma distribution
    from scipy import stats
    # ... SPI calculation ...
    return spi
```

### Air Quality Analysis

```python
# PM2.5 interpolation
def interpolate_pm25(sensor_gdf, grid_resolution=1000):
    """
    Interpolate PM2.5 from sensor network.
    Uses IDW or Kriging.
    """
    from pykrige.ok import OrdinaryKriging
    import numpy as np

    # Extract coordinates and values
    lon = sensor_gdf.geometry.x.values
    lat = sensor_gdf.geometry.y.values
    values = sensor_gdf['PM25'].values

    # Create grid
    grid_lon = np.arange(lon.min(), lon.max(), grid_resolution)
    grid_lat = np.arange(lat.min(), lat.max(), grid_resolution)

    # Ordinary Kriging
    OK = OrdinaryKriging(lon, lat, values,
                        variogram_model='exponential',
                        verbose=False,
                        enable_plotting=False)

    # Interpolate
    z, ss = OK.execute('grid', grid_lon, grid_lat)

    return z, grid_lon, grid_lat
```

## Hydrology

### Watershed Delineation

```python
import rasterio
import numpy as np
from scipy import ndimage

def delineate_watershed(dem_path, outlet_point):
    """
    Delineate watershed from DEM and outlet point.
    """

    # 1. Load DEM
    with rasterio.open(dem_path) as src:
        dem = src.read(1)
        transform = src.transform

    # 2. Fill sinks
    filled = fill_sinks(dem)

    # 3. Calculate flow direction (D8 method)
    flow_dir = calculate_flow_direction_d8(filled)

    # 4. Calculate flow accumulation
    flow_acc = calculate_flow_accumulation(flow_dir)

    # 5. Delineate watershed
    # Convert outlet point to raster coordinates
    row, col = ~transform * (outlet_point.x, outlet_point.y)
    row, col = int(row), int(col)

    # Trace upstream
    watershed = trace_upstream(flow_dir, row, col)

    return watershed, flow_acc, flow_dir

def calculate_flow_direction_d8(dem):
    """D8 flow direction algorithm."""
    # Encode direction as powers of 2
    # 32 64 128
    # 16  0   1
    # 8   4   2

    rows, cols = dem.shape
    flow_dir = np.zeros_like(dem, dtype=np.uint8)

    directions = [
        (-1, 0, 64), (-1, 1, 128), (0, 1, 1), (1, 1, 2),
        (1, 0, 4), (1, -1, 8), (0, -1, 16), (-1, -1, 32)
    ]

    for i in range(1, rows - 1):
        for j in range(1, cols - 1):
            max_drop = -np.inf
            steepest_dir = 0

            for di, dj, code in directions:
                ni, nj = i + di, j + dj
                drop = dem[i, j] - dem[ni, nj]

                if drop > max_drop and drop > 0:
                    max_drop = drop
                    steepest_dir = code

            flow_dir[i, j] = steepest_dir

    return flow_dir
```

### Flood Inundation Modeling

```python
def flood_inundation(dem, flood_level, roughness=0.03):
    """
    Simple flood inundation modeling.
    """

    # 1. Identify flooded cells
    flooded_mask = dem < flood_level

    # 2. Calculate flood depth
    flood_depth = np.where(flood_mask, flood_level - dem, 0)

    # 3. Remove isolated pixels (connected components)
    labeled, num_features = ndimage.label(flooded_mask)

    # Keep only large components (lakes, not pixels)
    component_sizes = np.bincount(labeled.ravel())
    large_components = component_sizes > 100  # Threshold

    mask_indices = large_components[labeled]
    final_flooded = flooded_mask & mask_indices

    # 4. Flood extent area
    cell_area = 30 * 30  # Assuming 30m resolution
    flooded_area = np.sum(final_flooded) * cell_area

    return flood_depth, final_flooded, flooded_area
```

## Agriculture

### Crop Condition Monitoring

```python
def crop_condition_indices(ndvi_time_series):
    """
    Monitor crop condition using NDVI time series.
    """

    # 1. Calculate growing season metrics
    max_ndvi = np.max(ndvi_time_series)
    time_to_peak = np.argmax(ndvi_time_series)

    # 2. Compare to historical baseline
    baseline_max = 0.8  # From historical data
    condition = (max_ndvi / baseline_max) * 100

    # 3. Classify condition
    if condition > 90:
        status = "Excellent"
    elif condition > 75:
        status = "Good"
    elif condition > 60:
        status = "Fair"
    else:
        status = "Poor"

    # 4. Estimate yield (simplified)
    yield_potential = condition * 0.5  # tonnes/ha

    return {
        'condition': condition,
        'status': status,
        'yield_potential': yield_potential
    }
```

### Precision Agriculture

```python
def prescription_map(soil_data, yield_data, nutrient_data):
    """
    Generate variable rate prescription map.
    """

    # 1. Grid analysis
    # Divide field into management zones
    from sklearn.cluster import KMeans

    features = np.column_stack([
        soil_data['organic_matter'],
        soil_data['ph'],
        yield_data['yield_t'],
        nutrient_data['nitrogen']
    ])

    # Cluster into 3-4 zones
    kmeans = KMeans(n_clusters=3, random_state=42)
    zones = kmeans.fit_predict(features)

    # 2. Prescription rates per zone
    prescriptions = {}
    for zone_id in range(3):
        zone_mask = zones == zone_id
        avg_yield = np.mean(yield_data['yield_t'][zone_mask])

        # Higher yield areas = higher nutrient requirement
        nitrogen_rate = avg_yield * 0.02  # kg N per kg yield
        prescriptions[zone_id] = {
            'nitrogen': nitrogen_rate,
            'phosphorus': nitrogen_rate * 0.3,
            'potassium': nitrogen_rate * 0.4
        }

    return zones, prescriptions
```

## Forestry

### Forest Inventory Analysis

```python
def estimate_biomass_from_lidar(chm_path, plot_data):
    """
    Estimate above-ground biomass from LiDAR CHM.
    """

    # 1. Load Canopy Height Model
    with rasterio.open(chm_path) as src:
        chm = src.read(1)

    # 2. Extract metrics per plot
    metrics = {}
    for plot_id, geom in plot_data.geometry.items():
        # Extract CHM values for plot
        # ... (mask and extract)

        plot_metrics = {
            'height_max': np.max(plot_chm),
            'height_mean': np.mean(plot_chm),
            'height_std': np.std(plot_chm),
            'height_p95': np.percentile(plot_chm, 95),
            'canopy_cover': np.sum(plot_chm > 2) / plot_chm.size
        }

        # 3. Allometric equation for biomass
        # Biomass = a * (height^b) * (cover^c)
        biomass = 0.2 * (plot_metrics['height_mean'] ** 1.5) * \
                  (plot_metrics['canopy_cover'] ** 0.8)

        metrics[plot_id] = {
            **plot_metrics,
            'biomass_tonnes': biomass
        }

    return metrics
```

### Deforestation Detection

```python
def detect_deforestation(image1_path, image2_path, threshold=0.3):
    """
    Detect deforestation between two dates.
    """

    # 1. Load NDVI images
    with rasterio.open(image1_path) as src:
        ndvi1 = src.read(1)
    with rasterio.open(image2_path) as src:
        ndvi2 = src.read(1)

    # 2. Calculate NDVI difference
    ndvi_diff = ndvi2 - ndvi1

    # 3. Detect deforestation (significant NDVI decrease)
    deforestation = ndvi_diff < -threshold

    # 4. Remove small patches
    deforestation_cleaned = remove_small_objects(deforestation, min_size=100)

    # 5. Calculate area
    pixel_area = 900  # m2 (30m resolution)
    deforested_area = np.sum(deforestation_cleaned) * pixel_area

    return deforestation_cleaned, deforested_area
```

For more domain-specific examples, see [code-examples.md](code-examples.md).
