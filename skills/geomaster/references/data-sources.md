# Geospatial Data Sources

Comprehensive catalog of satellite imagery, vector data, and APIs for geospatial analysis.

## Satellite Data Sources

### Sentinel Missions (ESA)

| Platform | Resolution | Coverage | Access |
|----------|------------|----------|--------|
| **Sentinel-2** | 10-60m | Global | https://scihub.copernicus.eu/ |
| **Sentinel-1** | 5-40m (SAR) | Global | https://scihub.copernicus.eu/ |
| **Sentinel-3** | 300m-1km | Global | https://scihub.copernicus.eu/ |
| **Sentinel-5P** | Various | Global | https://scihub.copernicus.eu/ |

```python
# Access via Sentinelsat
from sentinelsat import SentinelAPI, read_geojson, geojson_to_wkt

api = SentinelAPI('user', 'password', 'https://scihub.copernicus.eu/dhus')

# Search
products = api.query(geojson_to_wkt(aoi_geojson),
                     date=('20230101', '20231231'),
                     platformname='Sentinel-2',
                     cloudcoverpercentage=(0, 20))

# Download
api.download_all(products)
```

### Landsat (USGS/NASA)

| Platform | Resolution | Coverage | Access |
|----------|------------|----------|--------|
| **Landsat 9** | 30m | Global | https://earthexplorer.usgs.gov/ |
| **Landsat 8** | 30m | Global | https://earthexplorer.usgs.gov/ |
| **Landsat 7** | 15-60m | Global | https://earthexplorer.usgs.gov/ |
| **Landsat 5-7** | 30-60m | Global | https://earthexplorer.usgs.gov/ |

### Commercial Satellite Data

| Provider | Platform | Resolution | API |
|----------|----------|------------|-----|
| **Planet** | PlanetScope, SkySat | 0.5-3m | planet.com |
| **Maxar** | WorldView, GeoEye | 0.3-1.2m | maxar.com |
| **Airbus** | Pleiades, SPOT | 0.5-2m | airbus.com |
| **Capella** | Capella-2 (SAR) | 0.5-1m | capellaspace.com |

## Elevation Data

| Dataset | Resolution | Coverage | Source |
|---------|------------|----------|--------|
| **AW3D30** | 30m | Global | https://www.eorc.jaxa.jp/ALOS/en/aw3d30/ |
| **SRTM** | 30m | 56°S-60°N | https://www.usgs.gov/ |
| **ASTER GDEM** | 30m | 83°S-83°N | https://asterweb.jpl.nasa.gov/ |
| **Copernicus DEM** | 30m | Global | https://copernicus.eu/ |
| **ArcticDEM** | 2-10m | Arctic | https://www.pgc.umn.edu/ |

```python
# Download SRTM via API
import elevation

# Download SRTM 1 arc-second (30m)
elevation.clip(bounds=(-122.5, 37.7, -122.3, 37.9), output='srtm.tif')

# Clean and fill gaps
elevation.clean('srtm.tif', 'srtm_filled.tif')
```

## Land Cover Data

| Dataset | Resolution | Classes | Source |
|---------|------------|---------|--------|
| **ESA WorldCover** | 10m | 11 classes | https://worldcover2021.esa.int/ |
| **ESRI Land Cover** | 10m | 10 classes | https://www.esri.com/ |
| **Copernicus Global** | 100m | 23 classes | https://land.copernicus.eu/ |
| **MODIS MCD12Q1** | 500m | 17 classes | https://lpdaac.usgs.gov/ |
| **NLCD (US)** | 30m | 20 classes | https://www.mrlc.gov/ |

## Climate & Weather Data

### Reanalysis Data

| Dataset | Resolution | Temporal | Access |
|---------|------------|----------|--------|
| **ERA5** | 31km | Hourly (1979+) | https://cds.climate.copernicus.eu/ |
| **MERRA-2** | 50km | Hourly (1980+) | https://gmao.gsfc.nasa.gov/ |
| **JRA-55** | 55km | 3-hourly (1958+) | https://jra.kishou.go.jp/ |

```python
# Download ERA5 via CDS API
import cdsapi

c = cdsapi.Client()

c.retrieve(
    'reanalysis-era5-single-levels',
    {
        'product_type': 'reanalysis',
        'variable': '2m_temperature',
        'year': '2023',
        'month': '01',
        'day': '01',
        'time': '12:00',
        'area': [37.9, -122.5, 37.7, -122.3],
        'format': 'netcdf'
    },
    'era5_temp.nc'
)
```

## OpenStreetMap Data

### Access Methods

```python
# Via OSMnx
import osmnx as ox

# Download place boundary
gdf = ox.geocode_to_gdf('San Francisco, CA')

# Download street network
G = ox.graph_from_place('San Francisco, CA', network_type='drive')

# Download building footprints
buildings = ox.geometries_from_place('San Francisco, CA', tags={'building': True})

# Via Overpass API
import requests

overpass_url = "http://overpass-api.de/api/interpreter"
query = """
    [out:json];
    way["highway"](37.7,-122.5,37.9,-122.3);
    out geom;
"""

response = requests.get(overpass_url, params={'data': query})
data = response.json()
```

## Vector Data Sources

### Natural Earth

```python
import geopandas as gpd

# Admin boundaries (scale: 10m, 50m, 110m)
countries = gpd.read_file('https://naturalearth.s3.amazonaws.com/10m_cultural/ne_10m_admin_0_countries.zip')
urban_areas = gpd.read_file('https://naturalearth.s3.amazonaws.com/10m_cultural/ne_10m_urban_areas.zip')
ports = gpd.read_file('https://naturalearth.s3.amazonaws.com/10m_cultural/ne_10m_ports.zip')
```

### Other Sources

| Dataset | Type | Access |
|---------|------|--------|
| **GADM** | Admin boundaries | https://gadm.org/ |
| **HydroSHEDS** | Rivers, basins | https://www.hydrosheds.org/ |
| **Global Power Plant** | Power plants | https://datasets.wri.org/ |
| **WorldPop** | Population | https://www.worldpop.org/ |
| **GPW** | Population | https://sedac.ciesin.columbia.edu/ |
| **HDX** | Humanitarian data | https://data.humdata.org/ |

## APIs

### Google Maps Platform

```python
import requests

# Geocoding
url = "https://maps.googleapis.com/maps/api/geocode/json"
params = {
    'address': 'Golden Gate Bridge',
    'key': YOUR_API_KEY
}

response = requests.get(url, params=params)
data = response.json()
location = data['results'][0]['geometry']['location']
```

### Mapbox

```python
# Geocoding
import requests

url = "https://api.mapbox.com/geocoding/v5/mapbox.places/Golden%20Gate%20Bridge.json"
params = {'access_token': YOUR_ACCESS_TOKEN}

response = requests.get(url, params=params)
data = response.json()
```

### OpenWeatherMap

```python
# Current weather
url = "https://api.openweathermap.org/data/2.5/weather"
params = {
    'lat': 37.7,
    'lon': -122.4,
    'appid': YOUR_API_KEY
}

response = requests.get(url, params=params)
weather = response.json()
```

## Data APIs in Python

### STAC (SpatioTemporal Asset Catalog)

```python
import pystac_client

# Connect to STAC catalog
catalog = pystac_client.Client.open("https://earth-search.aws.element84.com/v1")

# Search
search = catalog.search(
    collections=["sentinel-2-l2a"],
    bbox=[-122.5, 37.7, -122.3, 37.9],
    datetime="2023-01-01/2023-12-31",
    query={"eo:cloud_cover": {"lt": 20}}
)

items = search.get_all_items()
```

### Planetary Computer

```python
import planetary_computer
import pystac_client

catalog = pystac_client.Client.open(
    "https://planetarycomputer.microsoft.com/api/stac/v1",
    modifier=planetary_computer.sign_inplace
)

# Search and sign items
items = catalog.search(...)
signed_items = [planetary_computer.sign(item) for item in items]
```

## Download Scripts

### Automated Download Script

```python
from sentinelsat import SentinelAPI
import rasterio
from rasterio.warp import calculate_default_transform, reproject, Resampling
import os

def download_and_process_sentinel2(aoi, date_range, output_dir):
    """
    Download and process Sentinel-2 imagery.
    """
    # Initialize API
    api = SentinelAPI('user', 'password', 'https://scihub.copernicus.eu/dhus')

    # Search
    products = api.query(
        aoi,
        date=date_range,
        platformname='Sentinel-2',
        processinglevel='Level-2A',
        cloudcoverpercentage=(0, 20)
    )

    # Download
    api.download_all(products, directory_path=output_dir)

    # Process each product
    for product in products:
        product_path = f"{output_dir}/{product['identifier']}.SAFE"
        processed = process_sentinel2_product(product_path)
        save_rgb_composite(processed, f"{output_dir}/{product['identifier']}_rgb.tif")

def process_sentinel2_product(product_path):
    """Process Sentinel-2 L2A product."""
    # Find 10m bands (B02, B03, B04, B08)
    bands = {}
    for band_id in ['B02', 'B03', 'B04', 'B08']:
        band_path = find_band_file(product_path, band_id, resolution='10m')
        with rasterio.open(band_path) as src:
            bands[band_id] = src.read(1)
            profile = src.profile

    # Stack bands
    stacked = np.stack([bands['B04'], bands['B03'], bands['B02']])  # RGB

    return stacked, profile
```

## Data Quality Assessment

```python
def assess_data_quality(raster_path):
    """
    Assess quality of geospatial raster data.
    """
    import rasterio
    import numpy as np

    with rasterio.open(raster_path) as src:
        data = src.read()
        profile = src.profile

    quality_report = {
        'nodata_percentage': np.sum(data == src.nodata) / data.size * 100,
        'data_range': (data.min(), data.max()),
        'mean': np.mean(data),
        'std': np.std(data),
        'has_gaps': np.any(data == src.nodata),
        'projection': profile['crs'],
        'resolution': (profile['transform'][0], abs(profile['transform'][4]))
    }

    return quality_report
```

For data access code examples, see [code-examples.md](code-examples.md).
