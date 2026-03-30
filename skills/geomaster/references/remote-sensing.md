# Remote Sensing Reference

Comprehensive guide to satellite data acquisition, processing, and analysis.

## Satellite Missions Overview

| Satellite | Operator | Resolution | Revisit | Key Features |
|-----------|----------|------------|---------|--------------|
| **Sentinel-2** | ESA | 10-60m | 5 days | 13 bands, free access |
| **Landsat 8/9** | USGS | 30m | 16 days | Historical archive (1972+) |
| **MODIS** | NASA | 250-1000m | Daily | Vegetation indices |
| **PlanetScope** | Planet | 3m | Daily | Commercial, high-res |
| **WorldView** | Maxar | 0.3m | Variable | Very high resolution |
| **Sentinel-1** | ESA | 5-40m | 6-12 days | SAR, all-weather |
| **Envisat** | ESA | 30m | 35 days | SAR (archival) |

## Sentinel-2 Processing

### Accessing Sentinel-2 Data

```python
import pystac_client
import planetary_computer
import odc.stac
import xarray as xr

# Search Sentinel-2 collection
catalog = pystac_client.Client.open(
    "https://planetarycomputer.microsoft.com/api/stac/v1",
    modifier=planetary_computer.sign_inplace,
)

# Define AOI and time range
bbox = [-122.5, 37.7, -122.3, 37.9]
search = catalog.search(
    collections=["sentinel-2-l2a"],
    bbox=bbox,
    datetime="2023-01-01/2023-12-31",
    query={"eo:cloud_cover": {"lt": 20}},
)

items = list(search.get_items())
print(f"Found {len(items)} items")

# Load as xarray dataset
data = odc.stac.load(
    [items[0]],
    bands=["B02", "B03", "B04", "B08", "B11"],
    crs="EPSG:32610",
    resolution=10,
)

print(data)
```

### Calculating Spectral Indices

```python
import numpy as np
import rasterio

def ndvi(nir, red):
    """Normalized Difference Vegetation Index"""
    return (nir - red) / (nir + red + 1e-8)

def evi(nir, red, blue):
    """Enhanced Vegetation Index"""
    return 2.5 * (nir - red) / (nir + 6*red - 7.5*blue + 1)

def savi(nir, red, L=0.5):
    """Soil Adjusted Vegetation Index"""
    return ((nir - red) / (nir + red + L)) * (1 + L)

def ndwi(green, nir):
    """Normalized Difference Water Index"""
    return (green - nir) / (green + nir + 1e-8)

def mndwi(green, swir):
    """Modified NDWI for open water"""
    return (green - swir) / (green + swir + 1e-8)

def nbr(nir, swir):
    """Normalized Burn Ratio"""
    return (nir - swir) / (nir + swir + 1e-8)

def ndbi(swir, nir):
    """Normalized Difference Built-up Index"""
    return (swir - nir) / (swir + nir + 1e-8)

# Batch processing
with rasterio.open('sentinel2.tif') as src:
    # Sentinel-2 band mapping
    B02 = src.read(1).astype(float)  # Blue (10m)
    B03 = src.read(2).astype(float)  # Green (10m)
    B04 = src.read(3).astype(float)  # Red (10m)
    B08 = src.read(4).astype(float)  # NIR (10m)
    B11 = src.read(5).astype(float)  # SWIR1 (20m, resampled)

    # Calculate indices
    NDVI = ndvi(B08, B04)
    EVI = evi(B08, B04, B02)
    SAVI = savi(B08, B04, L=0.5)
    NDWI = ndwi(B03, B08)
    NBR = nbr(B08, B11)
    NDBI = ndbi(B11, B08)
```

## Landsat Processing

### Landsat Collection 2

```python
import ee

# Initialize Earth Engine
ee.Initialize(project='your-project')

# Landsat 8 Collection 2 Level 2
landsat = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2') \
    .filterBounds(ee.Geometry.Point([-122.4, 37.7])) \
    .filterDate('2020-01-01', '2023-12-31') \
    .filter(ee.Filter.lt('CLOUD_COVER', 20))

# Apply scaling factors (Collection 2)
def apply_scale_factors(image):
    optical = image.select('SR_B.').multiply(0.0000275).add(-0.2)
    thermal = image.select('ST_B10').multiply(0.00341802).add(149.0)
    return image.addBands(optical, None, True).addBands(thermal, None, True)

landsat_scaled = landsat.map(apply_scale_factors)

# Calculate NDVI
def add_ndvi(image):
    ndvi = image.normalizedDifference(['SR_B5', 'SR_B4']).rename('NDVI')
    return image.addBands(ndvi)

landsat_ndvi = landsat_scaled.map(add_ndvi)

# Get composite
composite = landsat_ndvi.median()
```

### Landsat Surface Temperature

```python
def land_surface_temperature(image):
    """Calculate land surface temperature from Landsat 8."""
    # Brightness temperature
    Tb = image.select('ST_B10')

    # NDVI for emissivity
    ndvi = image.normalizedDifference(['SR_B5', 'SR_B4'])
    pv = ((ndvi - 0.2) / (0.5 - 0.2)) ** 2  # Proportion of vegetation

    # Emissivity
    em = 0.004 * pv + 0.986

    # LST in Kelvin
    lst = Tb.divide(1 + (0.00115 * Tb / 1.4388) * np.log(em))

    # Convert to Celsius
    lst_c = lst.subtract(273.15).rename('LST')

    return image.addBands(lst_c)

landsat_lst = landsat_scaled.map(land_surface_temperature)
```

## SAR Processing (Synthetic Aperture Radar)

### Sentinel-1 GRD Processing

```python
import rasterio
from scipy.ndimage import gaussian_filter
import numpy as np

def process_sentinel1_grd(input_path, output_path):
    """Process Sentinel-1 GRD data."""
    with rasterio.open(input_path) as src:
        # Read VV and VH bands
        vv = src.read(1).astype(float)
        vh = src.read(2).astype(float)

        # Convert to decibels
        vv_db = 10 * np.log10(vv + 1e-8)
        vh_db = 10 * np.log10(vh + 1e-8)

        # Speckle filtering (Lee filter approximation)
        def lee_filter(img, size=3):
            """Simple Lee filter for speckle reduction."""
            # Local mean
            mean = gaussian_filter(img, size)
            # Local variance
            sq_mean = gaussian_filter(img**2, size)
            variance = sq_mean - mean**2
            # Noise variance
            noise_var = np.var(img) * 0.5
            # Lee filter formula
            return mean + (variance - noise_var) / (variance) * (img - mean)

        vv_filtered = lee_filter(vv_db)
        vh_filtered = lee_filter(vh_db)

        # Calculate ratio
        ratio = vv_db - vh_db  # In dB: difference = ratio

        # Save
        profile = src.profile
        profile.update(dtype=rasterio.float32, count=3)

        with rasterio.open(output_path, 'w', **profile) as dst:
            dst.write(vv_filtered.astype(np.float32), 1)
            dst.write(vh_filtered.astype(np.float32), 2)
            dst.write(ratio.astype(np.float32), 3)

# Usage
process_sentinel1_grd('S1A_IW_GRDH.tif', 'S1A_processed.tif')
```

### SAR Polarimetric Indices

```python
def calculate_sar_indices(vv, vh):
    """Calculate SAR-derived indices."""
    # Backscatter ratio in dB
    ratio_db = 10 * np.log10(vv / (vh + 1e-8) + 1e-8)

    # Radar Vegetation Index
    rvi = (4 * vh) / (vv + vh + 1e-8)

    # Soil Moisture Index (approximation)
    smi = vv / (vv + vh + 1e-8)

    return ratio_db, rvi, smi
```

## Hyperspectral Imaging

### Hyperspectral Data Processing

```python
import spectral.io.envi as envi
import numpy as np
import matplotlib.pyplot as plt

# Load hyperspectral cube
hdr_path = 'hyperspectral.hdr'
img = envi.open(hdr_path)
data = img.load()

print(f"Data shape: {data.shape}")  # (rows, cols, bands)

# Extract spectral signature at a pixel
pixel_signature = data[100, 100, :]
plt.plot(img.bands.centers, pixel_signature)
plt.xlabel('Wavelength (nm)')
plt.ylabel('Reflectance')
plt.show()

# Spectral indices for hyperspectral
def calculate_ndi(hyper_data, band1_idx, band2_idx):
    """Normalized Difference Index for any two bands."""
    band1 = hyper_data[:, :, band1_idx]
    band2 = hyper_data[:, :, band2_idx]
    return (band1 - band2) / (band1 + band2 + 1e-8)

# Red Edge Position (REP)
def red_edge_position(hyper_data, wavelengths):
    """Calculate red edge position."""
    # Find wavelength of maximum slope in red-edge region (680-750nm)
    red_edge_idx = np.where((wavelengths >= 680) & (wavelengths <= 750))[0]

    first_derivative = np.diff(hyper_data, axis=2)
    rep_idx = np.argmax(first_derivative[:, :, red_edge_idx], axis=2)
    return wavelengths[red_edge_idx][rep_idx]
```

## Image Preprocessing

### Atmospheric Correction

```python
# Using 6S (via Py6S)
from Py6S import *

# Create 6S instance
s = SixS()

# Set atmospheric conditions
s.atmos_profile = AtmosProfile.PredefinedType(AtmosProfile.MidlatitudeSummer)
s.aero_profile = AeroProfile.PredefinedType(AeroProfile.Continental)

# Set geometry
s.geometry = Geometry.User()
s.geometry.month = 6
s.geometry.day = 15
s.geometry.solar_z = 30
s.geometry.solar_a = 180

# Run simulation
s.run()

# Get correction coefficients
xa, xb, xc = s.outputs.coef_xa, s.outputs.coef_xb, s.outputs.coef_xc

def atmospheric_correction(dn, xa, xb, xc):
    """Apply 6S atmospheric correction."""
    y = xa * dn - xb
    y = y / (1 + xc * y)
    return y
```

### Cloud Masking

```python
def sentinel2_cloud_mask(s2_image):
    """Generate cloud mask for Sentinel-2."""
    # Simple cloud detection using spectral tests
    scl = s2_image.select('SCL')  # Scene Classification Layer

    # Cloud classes: 8=Cloud, 9=Cloud medium, 10=Cloud high
    cloud_mask = scl.gt(7).And(scl.lt(11))

    # Additional test: Brightness threshold
    brightness = s2_image.select(['B02','B03','B04','B08']).mean()

    return cloud_mask.Or(brightness.gt(0.4))

# Apply mask
def apply_mask(image):
    mask = sentinel2_cloud_mask(image)
    return image.updateMask(mask.Not())
```

### Pan-Sharpening

```python
import cv2
import numpy as np

def gram_schmidt_pansharpen(ms, pan):
    """Gram-Schmidt pan-sharpening."""
    # Multispectral: (H, W, bands)
    # Panchromatic: (H, W)

    # 1. Upsample MS to pan resolution
    ms_up = cv2.resize(ms, (pan.shape[1], pan.shape[0]),
                       interpolation=cv2.INTER_CUBIC)

    # 2. Simulate panchromatic from MS
    weights = np.array([0.25, 0.25, 0.25, 0.25])  # Equal weights
    simulated = np.sum(ms_up * weights.reshape(1, 1, -1), axis=2)

    # 3. Gram-Schmidt orthogonalization
    # (Simplified version)
    for i in range(ms_up.shape[2]):
        band = ms_up[:, :, i].astype(float)
        mean_sim = np.mean(simulated)
        mean_band = np.mean(band)
        diff = band - mean_band
        sim_diff = simulated - mean_sim

        # Adjust
        ms_up[:, :, i] = band + diff * (pan - simulated) / (np.std(sim_diff) + 1e-8)

    return ms_up
```

For more code examples, see [code-examples.md](code-examples.md).
