---
name: zarr-python
description: Chunked N-D arrays for cloud storage. Compressed arrays, parallel I/O, S3/GCS integration, NumPy/Dask/Xarray compatible, for large-scale scientific computing pipelines.
license: MIT license
metadata:
    skill-author: K-Dense Inc.
---

# Zarr Python

## Overview

Zarr is a Python library for storing large N-dimensional arrays with chunking and compression. Apply this skill for efficient parallel I/O, cloud-native workflows, and seamless integration with NumPy, Dask, and Xarray.

## Quick Start

### Installation

```bash
uv pip install zarr
```

Requires Python 3.11+. For cloud storage support, install additional packages:
```python
uv pip install s3fs  # For S3
uv pip install gcsfs  # For Google Cloud Storage
```

### Basic Array Creation

```python
import zarr
import numpy as np

# Create a 2D array with chunking and compression
z = zarr.create_array(
    store="data/my_array.zarr",
    shape=(10000, 10000),
    chunks=(1000, 1000),
    dtype="f4"
)

# Write data using NumPy-style indexing
z[:, :] = np.random.random((10000, 10000))

# Read data
data = z[0:100, 0:100]  # Returns NumPy array
```

## Core Operations

### Creating Arrays

Zarr provides multiple convenience functions for array creation:

```python
# Create empty array
z = zarr.zeros(shape=(10000, 10000), chunks=(1000, 1000), dtype='f4',
               store='data.zarr')

# Create filled arrays
z = zarr.ones((5000, 5000), chunks=(500, 500))
z = zarr.full((1000, 1000), fill_value=42, chunks=(100, 100))

# Create from existing data
data = np.arange(10000).reshape(100, 100)
z = zarr.array(data, chunks=(10, 10), store='data.zarr')

# Create like another array
z2 = zarr.zeros_like(z)  # Matches shape, chunks, dtype of z
```

### Opening Existing Arrays

```python
# Open array (read/write mode by default)
z = zarr.open_array('data.zarr', mode='r+')

# Read-only mode
z = zarr.open_array('data.zarr', mode='r')

# The open() function auto-detects arrays vs groups
z = zarr.open('data.zarr')  # Returns Array or Group
```

### Reading and Writing Data

Zarr arrays support NumPy-like indexing:

```python
# Write entire array
z[:] = 42

# Write slices
z[0, :] = np.arange(100)
z[10:20, 50:60] = np.random.random((10, 10))

# Read data (returns NumPy array)
data = z[0:100, 0:100]
row = z[5, :]

# Advanced indexing
z.vindex[[0, 5, 10], [2, 8, 15]]  # Coordinate indexing
z.oindex[0:10, [5, 10, 15]]       # Orthogonal indexing
z.blocks[0, 0]                     # Block/chunk indexing
```

### Resizing and Appending

```python
# Resize array
z.resize(15000, 15000)  # Expands or shrinks dimensions

# Append data along an axis
z.append(np.random.random((1000, 10000)), axis=0)  # Adds rows
```

## Chunking Strategies

Chunking is critical for performance. Choose chunk sizes and shapes based on access patterns.

### Chunk Size Guidelines

- **Minimum chunk size**: 1 MB recommended for optimal performance
- **Balance**: Larger chunks = fewer metadata operations; smaller chunks = better parallel access
- **Memory consideration**: Entire chunks must fit in memory during compression

```python
# Configure chunk size (aim for ~1MB per chunk)
# For float32 data: 1MB = 262,144 elements = 512×512 array
z = zarr.zeros(
    shape=(10000, 10000),
    chunks=(512, 512),  # ~1MB chunks
    dtype='f4'
)
```

### Aligning Chunks with Access Patterns

**Critical**: Chunk shape dramatically affects performance based on how data is accessed.

```python
# If accessing rows frequently (first dimension)
z = zarr.zeros((10000, 10000), chunks=(10, 10000))  # Chunk spans columns

# If accessing columns frequently (second dimension)
z = zarr.zeros((10000, 10000), chunks=(10000, 10))  # Chunk spans rows

# For mixed access patterns (balanced approach)
z = zarr.zeros((10000, 10000), chunks=(1000, 1000))  # Square chunks
```

**Performance example**: For a (200, 200, 200) array, reading along the first dimension:
- Using chunks (1, 200, 200): ~107ms
- Using chunks (200, 200, 1): ~1.65ms (65× faster!)

### Sharding for Large-Scale Storage

When arrays have millions of small chunks, use sharding to group chunks into larger storage objects:

```python
from zarr.codecs import ShardingCodec, BytesCodec
from zarr.codecs.blosc import BloscCodec

# Create array with sharding
z = zarr.create_array(
    store='data.zarr',
    shape=(100000, 100000),
    chunks=(100, 100),  # Small chunks for access
    shards=(1000, 1000),  # Groups 100 chunks per shard
    dtype='f4'
)
```

**Benefits**:
- Reduces file system overhead from millions of small files
- Improves cloud storage performance (fewer object requests)
- Prevents filesystem block size waste

**Important**: Entire shards must fit in memory before writing.

## Compression

Zarr applies compression per chunk to reduce storage while maintaining fast access.

### Configuring Compression

```python
from zarr.codecs.blosc import BloscCodec
from zarr.codecs import GzipCodec, ZstdCodec

# Default: Blosc with Zstandard
z = zarr.zeros((1000, 1000), chunks=(100, 100))  # Uses default compression

# Configure Blosc codec
z = zarr.create_array(
    store='data.zarr',
    shape=(1000, 1000),
    chunks=(100, 100),
    dtype='f4',
    codecs=[BloscCodec(cname='zstd', clevel=5, shuffle='shuffle')]
)

# Available Blosc compressors: 'blosclz', 'lz4', 'lz4hc', 'snappy', 'zlib', 'zstd'

# Use Gzip compression
z = zarr.create_array(
    store='data.zarr',
    shape=(1000, 1000),
    chunks=(100, 100),
    dtype='f4',
    codecs=[GzipCodec(level=6)]
)

# Disable compression
z = zarr.create_array(
    store='data.zarr',
    shape=(1000, 1000),
    chunks=(100, 100),
    dtype='f4',
    codecs=[BytesCodec()]  # No compression
)
```

### Compression Performance Tips

- **Blosc** (default): Fast compression/decompression, good for interactive workloads
- **Zstandard**: Better compression ratios, slightly slower than LZ4
- **Gzip**: Maximum compression, slower performance
- **LZ4**: Fastest compression, lower ratios
- **Shuffle**: Enable shuffle filter for better compression on numeric data

```python
# Optimal for numeric scientific data
codecs=[BloscCodec(cname='zstd', clevel=5, shuffle='shuffle')]

# Optimal for speed
codecs=[BloscCodec(cname='lz4', clevel=1)]

# Optimal for compression ratio
codecs=[GzipCodec(level=9)]
```

## Storage Backends

Zarr supports multiple storage backends through a flexible storage interface.

### Local Filesystem (Default)

```python
from zarr.storage import LocalStore

# Explicit store creation
store = LocalStore('data/my_array.zarr')
z = zarr.open_array(store=store, mode='w', shape=(1000, 1000), chunks=(100, 100))

# Or use string path (creates LocalStore automatically)
z = zarr.open_array('data/my_array.zarr', mode='w', shape=(1000, 1000),
                    chunks=(100, 100))
```

### In-Memory Storage

```python
from zarr.storage import MemoryStore

# Create in-memory store
store = MemoryStore()
z = zarr.open_array(store=store, mode='w', shape=(1000, 1000), chunks=(100, 100))

# Data exists only in memory, not persisted
```

### ZIP File Storage

```python
from zarr.storage import ZipStore

# Write to ZIP file
store = ZipStore('data.zip', mode='w')
z = zarr.open_array(store=store, mode='w', shape=(1000, 1000), chunks=(100, 100))
z[:] = np.random.random((1000, 1000))
store.close()  # IMPORTANT: Must close ZipStore

# Read from ZIP file
store = ZipStore('data.zip', mode='r')
z = zarr.open_array(store=store)
data = z[:]
store.close()
```

### Cloud Storage (S3, GCS)

```python
import s3fs
import zarr

# S3 storage
s3 = s3fs.S3FileSystem(anon=False)  # Use credentials
store = s3fs.S3Map(root='my-bucket/path/to/array.zarr', s3=s3)
z = zarr.open_array(store=store, mode='w', shape=(1000, 1000), chunks=(100, 100))
z[:] = data

# Google Cloud Storage
import gcsfs
gcs = gcsfs.GCSFileSystem(project='my-project')
store = gcsfs.GCSMap(root='my-bucket/path/to/array.zarr', gcs=gcs)
z = zarr.open_array(store=store, mode='w', shape=(1000, 1000), chunks=(100, 100))
```

**Cloud Storage Best Practices**:
- Use consolidated metadata to reduce latency: `zarr.consolidate_metadata(store)`
- Align chunk sizes with cloud object sizing (typically 5-100 MB optimal)
- Enable parallel writes using Dask for large-scale data
- Consider sharding to reduce number of objects

## Groups and Hierarchies

Groups organize multiple arrays hierarchically, similar to directories or HDF5 groups.

### Creating and Using Groups

```python
# Create root group
root = zarr.group(store='data/hierarchy.zarr')

# Create sub-groups
temperature = root.create_group('temperature')
precipitation = root.create_group('precipitation')

# Create arrays within groups
temp_array = temperature.create_array(
    name='t2m',
    shape=(365, 720, 1440),
    chunks=(1, 720, 1440),
    dtype='f4'
)

precip_array = precipitation.create_array(
    name='prcp',
    shape=(365, 720, 1440),
    chunks=(1, 720, 1440),
    dtype='f4'
)

# Access using paths
array = root['temperature/t2m']

# Visualize hierarchy
print(root.tree())
# Output:
# /
#  ├── temperature
#  │   └── t2m (365, 720, 1440) f4
#  └── precipitation
#      └── prcp (365, 720, 1440) f4
```

### H5py-Compatible API

Zarr provides an h5py-compatible interface for familiar HDF5 users:

```python
# Create group with h5py-style methods
root = zarr.group('data.zarr')
dataset = root.create_dataset('my_data', shape=(1000, 1000), chunks=(100, 100),
                              dtype='f4')

# Access like h5py
grp = root.require_group('subgroup')
arr = grp.require_dataset('array', shape=(500, 500), chunks=(50, 50), dtype='i4')
```

## Attributes and Metadata

Attach custom metadata to arrays and groups using attributes:

```python
# Add attributes to array
z = zarr.zeros((1000, 1000), chunks=(100, 100))
z.attrs['description'] = 'Temperature data in Kelvin'
z.attrs['units'] = 'K'
z.attrs['created'] = '2024-01-15'
z.attrs['processing_version'] = 2.1

# Attributes are stored as JSON
print(z.attrs['units'])  # Output: K

# Add attributes to groups
root = zarr.group('data.zarr')
root.attrs['project'] = 'Climate Analysis'
root.attrs['institution'] = 'Research Institute'

# Attributes persist with the array/group
z2 = zarr.open('data.zarr')
print(z2.attrs['description'])
```

**Important**: Attributes must be JSON-serializable (strings, numbers, lists, dicts, booleans, null).

## Integration with NumPy, Dask, and Xarray

### NumPy Integration

Zarr arrays implement the NumPy array interface:

```python
import numpy as np
import zarr

z = zarr.zeros((1000, 1000), chunks=(100, 100))

# Use NumPy functions directly
result = np.sum(z, axis=0)  # NumPy operates on Zarr array
mean = np.mean(z[:100, :100])

# Convert to NumPy array
numpy_array = z[:]  # Loads entire array into memory
```

### Dask Integration

Dask provides lazy, parallel computation on Zarr arrays:

```python
import dask.array as da
import zarr

# Create large Zarr array
z = zarr.open('data.zarr', mode='w', shape=(100000, 100000),
              chunks=(1000, 1000), dtype='f4')

# Load as Dask array (lazy, no data loaded)
dask_array = da.from_zarr('data.zarr')

# Perform computations (parallel, out-of-core)
result = dask_array.mean(axis=0).compute()  # Parallel computation

# Write Dask array to Zarr
large_array = da.random.random((100000, 100000), chunks=(1000, 1000))
da.to_zarr(large_array, 'output.zarr')
```

**Benefits**:
- Process datasets larger than memory
- Automatic parallel computation across chunks
- Efficient I/O with chunked storage

### Xarray Integration

Xarray provides labeled, multidimensional arrays with Zarr backend:

```python
import xarray as xr
import zarr

# Open Zarr store as Xarray Dataset (lazy loading)
ds = xr.open_zarr('data.zarr')

# Dataset includes coordinates and metadata
print(ds)

# Access variables
temperature = ds['temperature']

# Perform labeled operations
subset = ds.sel(time='2024-01', lat=slice(30, 60))

# Write Xarray Dataset to Zarr
ds.to_zarr('output.zarr')

# Create from scratch with coordinates
ds = xr.Dataset(
    {
        'temperature': (['time', 'lat', 'lon'], data),
        'precipitation': (['time', 'lat', 'lon'], data2)
    },
    coords={
        'time': pd.date_range('2024-01-01', periods=365),
        'lat': np.arange(-90, 91, 1),
        'lon': np.arange(-180, 180, 1)
    }
)
ds.to_zarr('climate_data.zarr')
```

**Benefits**:
- Named dimensions and coordinates
- Label-based indexing and selection
- Integration with pandas for time series
- NetCDF-like interface familiar to climate/geospatial scientists

## Parallel Computing and Synchronization

### Thread-Safe Operations

```python
from zarr import ThreadSynchronizer
import zarr

# For multi-threaded writes
synchronizer = ThreadSynchronizer()
z = zarr.open_array('data.zarr', mode='r+', shape=(10000, 10000),
                    chunks=(1000, 1000), synchronizer=synchronizer)

# Safe for concurrent writes from multiple threads
# (when writes don't span chunk boundaries)
```

### Process-Safe Operations

```python
from zarr import ProcessSynchronizer
import zarr

# For multi-process writes
synchronizer = ProcessSynchronizer('sync_data.sync')
z = zarr.open_array('data.zarr', mode='r+', shape=(10000, 10000),
                    chunks=(1000, 1000), synchronizer=synchronizer)

# Safe for concurrent writes from multiple processes
```

**Note**:
- Concurrent reads require no synchronization
- Synchronization only needed for writes that may span chunk boundaries
- Each process/thread writing to separate chunks needs no synchronization

## Consolidated Metadata

For hierarchical stores with many arrays, consolidate metadata into a single file to reduce I/O operations:

```python
import zarr

# After creating arrays/groups
root = zarr.group('data.zarr')
# ... create multiple arrays/groups ...

# Consolidate metadata
zarr.consolidate_metadata('data.zarr')

# Open with consolidated metadata (faster, especially on cloud storage)
root = zarr.open_consolidated('data.zarr')
```

**Benefits**:
- Reduces metadata read operations from N (one per array) to 1
- Critical for cloud storage (reduces latency)
- Speeds up `tree()` operations and group traversal

**Cautions**:
- Metadata can become stale if arrays update without re-consolidation
- Not suitable for frequently-updated datasets
- Multi-writer scenarios may have inconsistent reads

## Performance Optimization

### Checklist for Optimal Performance

1. **Chunk Size**: Aim for 1-10 MB per chunk
   ```python
   # For float32: 1MB = 262,144 elements
   chunks = (512, 512)  # 512×512×4 bytes = ~1MB
   ```

2. **Chunk Shape**: Align with access patterns
   ```python
   # Row-wise access → chunk spans columns: (small, large)
   # Column-wise access → chunk spans rows: (large, small)
   # Random access → balanced: (medium, medium)
   ```

3. **Compression**: Choose based on workload
   ```python
   # Interactive/fast: BloscCodec(cname='lz4')
   # Balanced: BloscCodec(cname='zstd', clevel=5)
   # Maximum compression: GzipCodec(level=9)
   ```

4. **Storage Backend**: Match to environment
   ```python
   # Local: LocalStore (default)
   # Cloud: S3Map/GCSMap with consolidated metadata
   # Temporary: MemoryStore
   ```

5. **Sharding**: Use for large-scale datasets
   ```python
   # When you have millions of small chunks
   shards=(10*chunk_size, 10*chunk_size)
   ```

6. **Parallel I/O**: Use Dask for large operations
   ```python
   import dask.array as da
   dask_array = da.from_zarr('data.zarr')
   result = dask_array.compute(scheduler='threads', num_workers=8)
   ```

### Profiling and Debugging

```python
# Print detailed array information
print(z.info)

# Output includes:
# - Type, shape, chunks, dtype
# - Compression codec and level
# - Storage size (compressed vs uncompressed)
# - Storage location

# Check storage size
print(f"Compressed size: {z.nbytes_stored / 1e6:.2f} MB")
print(f"Uncompressed size: {z.nbytes / 1e6:.2f} MB")
print(f"Compression ratio: {z.nbytes / z.nbytes_stored:.2f}x")
```

## Common Patterns and Best Practices

### Pattern: Time Series Data

```python
# Store time series with time as first dimension
# This allows efficient appending of new time steps
z = zarr.open('timeseries.zarr', mode='a',
              shape=(0, 720, 1440),  # Start with 0 time steps
              chunks=(1, 720, 1440),  # One time step per chunk
              dtype='f4')

# Append new time steps
new_data = np.random.random((1, 720, 1440))
z.append(new_data, axis=0)
```

### Pattern: Large Matrix Operations

```python
import dask.array as da

# Create large matrix in Zarr
z = zarr.open('matrix.zarr', mode='w',
              shape=(100000, 100000),
              chunks=(1000, 1000),
              dtype='f8')

# Use Dask for parallel computation
dask_z = da.from_zarr('matrix.zarr')
result = (dask_z @ dask_z.T).compute()  # Parallel matrix multiply
```

### Pattern: Cloud-Native Workflow

```python
import s3fs
import zarr

# Write to S3
s3 = s3fs.S3FileSystem()
store = s3fs.S3Map(root='s3://my-bucket/data.zarr', s3=s3)

# Create array with appropriate chunking for cloud
z = zarr.open_array(store=store, mode='w',
                    shape=(10000, 10000),
                    chunks=(500, 500),  # ~1MB chunks
                    dtype='f4')
z[:] = data

# Consolidate metadata for faster reads
zarr.consolidate_metadata(store)

# Read from S3 (anywhere, anytime)
store_read = s3fs.S3Map(root='s3://my-bucket/data.zarr', s3=s3)
z_read = zarr.open_consolidated(store_read)
subset = z_read[0:100, 0:100]
```

### Pattern: Format Conversion

```python
# HDF5 to Zarr
import h5py
import zarr

with h5py.File('data.h5', 'r') as h5:
    dataset = h5['dataset_name']
    z = zarr.array(dataset[:],
                   chunks=(1000, 1000),
                   store='data.zarr')

# NumPy to Zarr
import numpy as np
data = np.load('data.npy')
z = zarr.array(data, chunks='auto', store='data.zarr')

# Zarr to NetCDF (via Xarray)
import xarray as xr
ds = xr.open_zarr('data.zarr')
ds.to_netcdf('data.nc')
```

## Common Issues and Solutions

### Issue: Slow Performance

**Diagnosis**: Check chunk size and alignment
```python
print(z.chunks)  # Are chunks appropriate size?
print(z.info)    # Check compression ratio
```

**Solutions**:
- Increase chunk size to 1-10 MB
- Align chunks with access pattern
- Try different compression codecs
- Use Dask for parallel operations

### Issue: High Memory Usage

**Cause**: Loading entire array or large chunks into memory

**Solutions**:
```python
# Don't load entire array
# Bad: data = z[:]
# Good: Process in chunks
for i in range(0, z.shape[0], 1000):
    chunk = z[i:i+1000, :]
    process(chunk)

# Or use Dask for automatic chunking
import dask.array as da
dask_z = da.from_zarr('data.zarr')
result = dask_z.mean().compute()  # Processes in chunks
```

### Issue: Cloud Storage Latency

**Solutions**:
```python
# 1. Consolidate metadata
zarr.consolidate_metadata(store)
z = zarr.open_consolidated(store)

# 2. Use appropriate chunk sizes (5-100 MB for cloud)
chunks = (2000, 2000)  # Larger chunks for cloud

# 3. Enable sharding
shards = (10000, 10000)  # Groups many chunks
```

### Issue: Concurrent Write Conflicts

**Solution**: Use synchronizers or ensure non-overlapping writes
```python
from zarr import ProcessSynchronizer

sync = ProcessSynchronizer('sync.sync')
z = zarr.open_array('data.zarr', mode='r+', synchronizer=sync)

# Or design workflow so each process writes to separate chunks
```

## Additional Resources

For detailed API documentation, advanced usage, and the latest updates:

- **Official Documentation**: https://zarr.readthedocs.io/
- **Zarr Specifications**: https://zarr-specs.readthedocs.io/
- **GitHub Repository**: https://github.com/zarr-developers/zarr-python
- **Community Chat**: https://gitter.im/zarr-developers/community

**Related Libraries**:
- **Xarray**: https://docs.xarray.dev/ (labeled arrays)
- **Dask**: https://docs.dask.org/ (parallel computing)
- **NumCodecs**: https://numcodecs.readthedocs.io/ (compression codecs)

