# Big Data and Cloud Computing

Distributed processing, cloud platforms, and GPU acceleration for geospatial data.

## Distributed Processing with Dask

### Dask-GeoPandas

```python
import dask_geopandas
import geopandas as gpd
import dask.dataframe as dd

# Read large GeoPackage in chunks
dask_gdf = dask_geopandas.read_file('large.gpkg', npartitions=10)

# Perform spatial operations
dask_gdf['area'] = dask_gdf.geometry.area
dask_gdf['buffer'] = dask_gdf.geometry.buffer(1000)

# Compute result
result = dask_gdf.compute()

# Distributed spatial join
dask_points = dask_geopandas.read_file('points.gpkg', npartitions=5)
dask_zones = dask_geopandas.read_file('zones.gpkg', npartitions=3)

joined = dask_points.sjoin(dask_zones, how='inner', predicate='within')
result = joined.compute()
```

### Dask for Raster Processing

```python
import dask.array as da
import rasterio

# Create lazy-loaded raster array
def lazy_raster(path, chunks=(1, 1024, 1024)):
    with rasterio.open(path) as src:
        profile = src.profile
        # Create dask array
        raster = da.from_rasterio(src, chunks=chunks)

    return raster, profile

# Process large raster
raster, profile = lazy_raster('very_large.tif')

# Calculate NDVI (lazy operation)
ndvi = (raster[3] - raster[2]) / (raster[3] + raster[2] + 1e-8)

# Apply function to each chunk
def process_chunk(chunk):
    return (chunk - chunk.min()) / (chunk.max() - chunk.min())

normalized = da.map_blocks(process_chunk, ndvi, dtype=np.float32)

# Compute and save
with rasterio.open('output.tif', 'w', **profile) as dst:
    dst.write(normalized.compute())
```

### Dask Distributed Cluster

```python
from dask.distributed import Client

# Connect to cluster
client = Client('scheduler-address:8786')

# Or create local cluster
from dask.distributed import LocalCluster
cluster = LocalCluster(n_workers=4, threads_per_worker=2, memory_limit='4GB')
client = Client(cluster)

# Use Dask-GeoPandas with cluster
dask_gdf = dask_geopandas.from_geopandas(gdf, npartitions=10)
dask_gdf = dask_gdf.set_index(calculate_spatial_partitions=True)

# Operations are now distributed
result = dask_gdf.buffer(1000).compute()
```

## Cloud Platforms

### Google Earth Engine

```python
import ee

# Initialize
ee.Initialize(project='your-project')

# Large-scale composite
def create_annual_composite(year):
    """Create cloud-free annual composite."""

    # Sentinel-2 collection
    s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') \
        .filterBounds(ee.Geometry.Rectangle([-125, 32, -114, 42])) \
        .filterDate(f'{year}-01-01', f'{year}-12-31') \
        .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))

    # Cloud masking
    def mask_s2(image):
        qa = image.select('QA60')
        cloud_bit_mask = 1 << 10
        cirrus_bit_mask = 1 << 11
        mask = qa.bitwiseAnd(cloud_bit_mask).eq(0).And(
               qa.bitwiseAnd(cirrus_bit_mask).eq(0))
        return image.updateMask(mask.Not())

    s2_masked = s2.map(mask_s2)

    # Median composite
    composite = s2_masked.median().clip(roi)

    return composite

# Export to Google Drive
task = ee.batch.Export.image.toDrive(
    image=composite,
    description='CA_composite_2023',
    scale=10,
    region=roi,
    crs='EPSG:32611',
    maxPixels=1e13
)
task.start()
```

### Planetary Computer (Microsoft)

```python
import pystac_client
import planetary_computer
import odc.stac
import xarray as xr

# Search catalog
catalog = pystac_client.Client.open(
    "https://planetarycomputer.microsoft.com/api/stac/v1",
    modifier=planetary_computer.sign_inplace,
)

# Search NAIP imagery
search = catalog.search(
    collections=["naip"],
    bbox=[-125, 32, -114, 42],
    datetime="2020-01-01/2023-12-31",
)

items = list(search.get_items())

# Load as xarray dataset
data = odc.stac.load(
    items[:100],  # Process in batches
    bands=["image"],
    crs="EPSG:32611",
    resolution=1.0,
    chunkx=1024,
    chunky=1024,
)

# Compute statistics lazily
mean = data.mean().compute()
std = data.std().compute()

# Export to COG
import rioxarray
data.isel(time=0).rio.to_raster('naip_composite.tif', compress='DEFLATE')
```

### Google Cloud Storage

```python
from google.cloud import storage
import rasterio
from rasterio.session import GSSession

# Upload to GCS
client = storage.Client()
bucket = client.bucket('my-bucket')
blob = bucket.blob('geospatial/data.tif')
blob.upload_from_filename('local_data.tif')

# Read directly from GCS
with rasterio.open(
    'gs://my-bucket/geospatial/data.tif',
    session=GSSession()
) as src:
    data = src.read()

# Use with Rioxarray
import rioxarray
da = rioxarray.open_rasterio('gs://my-bucket/geospatial/data.tif')
```

## GPU Acceleration

### CuPy for Raster Processing

```python
import cupy as cp
import numpy as np

def gpu_ndvi(nir, red):
    """Calculate NDVI on GPU."""
    # Transfer to GPU
    nir_gpu = cp.asarray(nir)
    red_gpu = cp.asarray(red)

    # Calculate on GPU
    ndvi_gpu = (nir_gpu - red_gpu) / (nir_gpu + red_gpu + 1e-8)

    # Transfer back
    return cp.asnumpy(ndvi_gpu)

# Batch processing
def batch_process_gpu(raster_path):
    with rasterio.open(raster_path) as src:
        data = src.read()  # (bands, height, width)

    data_gpu = cp.asarray(data)

    # Process all bands
    for i in range(data.shape[0]):
        data_gpu[i] = (data_gpu[i] - data_gpu[i].min()) / \
                      (data_gpu[i].max() - data_gpu[i].min())

    return cp.asnumpy(data_gpu)
```

### RAPIDS for Spatial Analysis

```python
import cudf
import cuspatial

# Load data to GPU
gdf_gpu = cuspatial.from_geopandas(gdf)

# Spatial join on GPU
points_gpu = cuspatial.from_geopandas(points_gdf)
polygons_gpu = cuspatial.from_geopandas(polygons_gdf)

joined = cuspatial.join_polygon_points(
    polygons_gpu,
    points_gpu
)

# Convert back
result = joined.to_pandas()
```

### PyTorch for Geospatial Deep Learning

```python
import torch
from torch.utils.data import DataLoader

# Custom dataset
class SatelliteDataset(torch.utils.data.Dataset):
    def __init__(self, image_paths, label_paths):
        self.image_paths = image_paths
        self.label_paths = label_paths

    def __getitem__(self, idx):
        with rasterio.open(self.image_paths[idx]) as src:
            image = src.read().astype(np.float32)

        with rasterio.open(self.label_paths[idx]) as src:
            label = src.read(1).astype(np.int64)

        return torch.from_numpy(image), torch.from_numpy(label)

# DataLoader with GPU prefetching
dataset = SatelliteDataset(images, labels)
loader = DataLoader(
    dataset,
    batch_size=16,
    shuffle=True,
    num_workers=4,
    pin_memory=True,  # Faster transfer to GPU
)

# Training with mixed precision
from torch.cuda.amp import autocast, GradScaler

scaler = GradScaler()

for images, labels in loader:
    images, labels = images.to('cuda'), labels.to('cuda')

    with autocast():
        outputs = model(images)
        loss = criterion(outputs, labels)

    scaler.scale(loss).backward()
    scaler.step(optimizer)
    scaler.update()
```

## Efficient Data Formats

### Cloud-Optimized GeoTIFF (COG)

```python
from rio_cogeo.cogeo import cog_translate

# Convert to COG
cog_translate(
    src_path='input.tif',
    dst_path='output_cog.tif',
    dst_kwds={'compress': 'DEFLATE', 'predictor': 2},
    overview_level=5,
    overview_resampling='average',
    config={'GDAL_TIFF_INTERNAL_MASK': True}
)

# Create overviews for faster access
with rasterio.open('output.tif', 'r+') as src:
    src.build_overviews([2, 4, 8, 16], resampling='average')
    src.update_tags(ns='rio_overview', resampling='average')
```

### Zarr for Multidimensional Arrays

```python
import xarray as xr
import zarr

# Create Zarr store
store = zarr.DirectoryStore('data.zarr')

# Save datacube to Zarr
ds.to_zarr(store, consolidated=True)

# Read efficiently
ds = xr.open_zarr('data.zarr', consolidated=True)

# Extract subset efficiently
subset = ds.sel(time='2023-01', latitude=slice(30, 40))
```

### Parquet for Vector Data

```python
import geopandas as gpd

# Write to Parquet (with spatial index)
gdf.to_parquet('data.parquet', compression='snappy', index=True)

# Read efficiently
gdf = gpd.read_parquet('data.parquet')

# Read subset with filtering
import pyarrow.parquet as pq
table = pq.read_table('data.parquet', filters=[('column', '==', 'value')])
```

For more big data examples, see [code-examples.md](code-examples.md).
