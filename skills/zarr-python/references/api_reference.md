# Zarr Python Quick Reference

This reference provides a concise overview of commonly used Zarr functions, parameters, and patterns for quick lookup during development.

## Array Creation Functions

### `zarr.zeros()` / `zarr.ones()` / `zarr.empty()`
```python
zarr.zeros(shape, chunks=None, dtype='f8', store=None, compressor='default',
           fill_value=0, order='C', filters=None)
```
Create arrays filled with zeros, ones, or empty (uninitialized) values.

**Key parameters:**
- `shape`: Tuple defining array dimensions (e.g., `(1000, 1000)`)
- `chunks`: Tuple defining chunk dimensions (e.g., `(100, 100)`), or `None` for no chunking
- `dtype`: NumPy data type (e.g., `'f4'`, `'i8'`, `'bool'`)
- `store`: Storage location (string path, Store object, or `None` for memory)
- `compressor`: Compression codec or `None` for no compression

### `zarr.create_array()` / `zarr.create()`
```python
zarr.create_array(store, shape, chunks, dtype='f8', compressor='default',
                  fill_value=0, order='C', filters=None, overwrite=False)
```
Create a new array with explicit control over all parameters.

### `zarr.array()`
```python
zarr.array(data, chunks=None, dtype=None, compressor='default', store=None)
```
Create array from existing data (NumPy array, list, etc.).

**Example:**
```python
import numpy as np
data = np.random.random((1000, 1000))
z = zarr.array(data, chunks=(100, 100), store='data.zarr')
```

### `zarr.open_array()` / `zarr.open()`
```python
zarr.open_array(store, mode='a', shape=None, chunks=None, dtype=None,
                compressor='default', fill_value=0)
```
Open existing array or create new one.

**Mode options:**
- `'r'`: Read-only
- `'r+'`: Read-write, file must exist
- `'a'`: Read-write, create if doesn't exist (default)
- `'w'`: Create new, overwrite if exists
- `'w-'`: Create new, fail if exists

## Storage Classes

### LocalStore (Default)
```python
from zarr.storage import LocalStore

store = LocalStore('path/to/data.zarr')
z = zarr.open_array(store=store, mode='w', shape=(1000, 1000), chunks=(100, 100))
```

### MemoryStore
```python
from zarr.storage import MemoryStore

store = MemoryStore()  # Data only in memory
z = zarr.open_array(store=store, mode='w', shape=(1000, 1000), chunks=(100, 100))
```

### ZipStore
```python
from zarr.storage import ZipStore

# Write
store = ZipStore('data.zip', mode='w')
z = zarr.open_array(store=store, mode='w', shape=(1000, 1000), chunks=(100, 100))
z[:] = data
store.close()  # MUST close

# Read
store = ZipStore('data.zip', mode='r')
z = zarr.open_array(store=store)
data = z[:]
store.close()
```

### Cloud Storage (S3/GCS)
```python
# S3
import s3fs
s3 = s3fs.S3FileSystem(anon=False)
store = s3fs.S3Map(root='bucket/path/data.zarr', s3=s3)

# GCS
import gcsfs
gcs = gcsfs.GCSFileSystem(project='my-project')
store = gcsfs.GCSMap(root='bucket/path/data.zarr', gcs=gcs)
```

## Compression Codecs

### Blosc Codec (Default)
```python
from zarr.codecs.blosc import BloscCodec

codec = BloscCodec(
    cname='zstd',      # Compressor: 'blosclz', 'lz4', 'lz4hc', 'snappy', 'zlib', 'zstd'
    clevel=5,          # Compression level: 0-9
    shuffle='shuffle'  # Shuffle filter: 'noshuffle', 'shuffle', 'bitshuffle'
)

z = zarr.create_array(store='data.zarr', shape=(1000, 1000), chunks=(100, 100),
                      dtype='f4', codecs=[codec])
```

**Blosc compressor characteristics:**
- `'lz4'`: Fastest compression, lower ratio
- `'zstd'`: Balanced (default), good ratio and speed
- `'zlib'`: Good compatibility, moderate performance
- `'lz4hc'`: Better ratio than lz4, slower
- `'snappy'`: Fast, moderate ratio
- `'blosclz'`: Blosc's default

### Other Codecs
```python
from zarr.codecs import GzipCodec, ZstdCodec, BytesCodec

# Gzip compression (maximum ratio, slower)
GzipCodec(level=6)  # Level 0-9

# Zstandard compression
ZstdCodec(level=3)  # Level 1-22

# No compression
BytesCodec()
```

## Array Indexing and Selection

### Basic Indexing (NumPy-style)
```python
z = zarr.zeros((1000, 1000), chunks=(100, 100))

# Read
row = z[0, :]           # Single row
col = z[:, 0]           # Single column
block = z[10:20, 50:60] # Slice
element = z[5, 10]      # Single element

# Write
z[0, :] = 42
z[10:20, 50:60] = np.random.random((10, 10))
```

### Advanced Indexing
```python
# Coordinate indexing (point selection)
z.vindex[[0, 5, 10], [2, 8, 15]]  # Specific coordinates

# Orthogonal indexing (outer product)
z.oindex[0:10, [5, 10, 15]]  # Rows 0-9, columns 5, 10, 15

# Block/chunk indexing
z.blocks[0, 0]  # First chunk
z.blocks[0:2, 0:2]  # First four chunks
```

## Groups and Hierarchies

### Creating Groups
```python
# Create root group
root = zarr.group(store='data.zarr')

# Create nested groups
grp1 = root.create_group('group1')
grp2 = grp1.create_group('subgroup')

# Create arrays in groups
arr = grp1.create_array(name='data', shape=(1000, 1000),
                        chunks=(100, 100), dtype='f4')

# Access by path
arr2 = root['group1/data']
```

### Group Methods
```python
root = zarr.group('data.zarr')

# h5py-compatible methods
dataset = root.create_dataset('data', shape=(1000, 1000), chunks=(100, 100))
subgrp = root.require_group('subgroup')  # Create if doesn't exist

# Visualize structure
print(root.tree())

# List contents
print(list(root.keys()))
print(list(root.groups()))
print(list(root.arrays()))
```

## Array Attributes and Metadata

### Working with Attributes
```python
z = zarr.zeros((1000, 1000), chunks=(100, 100))

# Set attributes
z.attrs['units'] = 'meters'
z.attrs['description'] = 'Temperature data'
z.attrs['created'] = '2024-01-15'
z.attrs['version'] = 1.2
z.attrs['tags'] = ['climate', 'temperature']

# Read attributes
print(z.attrs['units'])
print(dict(z.attrs))  # All attributes as dict

# Update/delete
z.attrs['version'] = 2.0
del z.attrs['tags']
```

**Note:** Attributes must be JSON-serializable.

## Array Properties and Methods

### Properties
```python
z = zarr.zeros((1000, 1000), chunks=(100, 100), dtype='f4')

z.shape          # (1000, 1000)
z.chunks         # (100, 100)
z.dtype          # dtype('float32')
z.size           # 1000000
z.nbytes         # 4000000 (uncompressed size in bytes)
z.nbytes_stored  # Actual compressed size on disk
z.nchunks        # 100 (number of chunks)
z.cdata_shape    # Shape in terms of chunks: (10, 10)
```

### Methods
```python
# Information
print(z.info)  # Detailed information about array
print(z.info_items())  # Info as list of tuples

# Resizing
z.resize(1500, 1500)  # Change dimensions

# Appending
z.append(new_data, axis=0)  # Add data along axis

# Copying
z2 = z.copy(store='new_location.zarr')
```

## Chunking Guidelines

### Chunk Size Calculation
```python
# For float32 (4 bytes per element):
# 1 MB = 262,144 elements
# 10 MB = 2,621,440 elements

# Examples for 1 MB chunks:
(512, 512)      # For 2D: 512 × 512 × 4 = 1,048,576 bytes
(128, 128, 128) # For 3D: 128 × 128 × 128 × 4 = 8,388,608 bytes ≈ 8 MB
(64, 256, 256)  # For 3D: 64 × 256 × 256 × 4 = 16,777,216 bytes ≈ 16 MB
```

### Chunking Strategies by Access Pattern

**Time series (sequential access along first dimension):**
```python
chunks=(1, 720, 1440)  # One time step per chunk
```

**Row-wise access:**
```python
chunks=(10, 10000)  # Small rows, span columns
```

**Column-wise access:**
```python
chunks=(10000, 10)  # Span rows, small columns
```

**Random access:**
```python
chunks=(500, 500)  # Balanced square chunks
```

**3D volumetric data:**
```python
chunks=(64, 64, 64)  # Cubic chunks for isotropic access
```

## Integration APIs

### NumPy Integration
```python
import numpy as np

z = zarr.zeros((1000, 1000), chunks=(100, 100))

# Use NumPy functions
result = np.sum(z, axis=0)
mean = np.mean(z)
std = np.std(z)

# Convert to NumPy
arr = z[:]  # Loads entire array into memory
```

### Dask Integration
```python
import dask.array as da

# Load Zarr as Dask array
dask_array = da.from_zarr('data.zarr')

# Compute operations in parallel
result = dask_array.mean(axis=0).compute()

# Write Dask array to Zarr
large_array = da.random.random((100000, 100000), chunks=(1000, 1000))
da.to_zarr(large_array, 'output.zarr')
```

### Xarray Integration
```python
import xarray as xr

# Open Zarr as Xarray Dataset
ds = xr.open_zarr('data.zarr')

# Write Xarray to Zarr
ds.to_zarr('output.zarr')

# Create with coordinates
ds = xr.Dataset(
    {'temperature': (['time', 'lat', 'lon'], data)},
    coords={
        'time': pd.date_range('2024-01-01', periods=365),
        'lat': np.arange(-90, 91, 1),
        'lon': np.arange(-180, 180, 1)
    }
)
ds.to_zarr('climate.zarr')
```

## Parallel Computing

### Synchronizers
```python
from zarr import ThreadSynchronizer, ProcessSynchronizer

# Multi-threaded writes
sync = ThreadSynchronizer()
z = zarr.open_array('data.zarr', mode='r+', synchronizer=sync)

# Multi-process writes
sync = ProcessSynchronizer('sync.sync')
z = zarr.open_array('data.zarr', mode='r+', synchronizer=sync)
```

**Note:** Synchronization only needed for:
- Concurrent writes that may span chunk boundaries
- Not needed for reads (always safe)
- Not needed if each process writes to separate chunks

## Metadata Consolidation

```python
# Consolidate metadata (after creating all arrays/groups)
zarr.consolidate_metadata('data.zarr')

# Open with consolidated metadata (faster, especially on cloud)
root = zarr.open_consolidated('data.zarr')
```

**Benefits:**
- Reduces I/O from N operations to 1
- Critical for cloud storage (reduces latency)
- Speeds up hierarchy traversal

**Cautions:**
- Can become stale if data updates
- Re-consolidate after modifications
- Not for frequently-updated datasets

## Common Patterns

### Time Series with Growing Data
```python
# Start with empty first dimension
z = zarr.open('timeseries.zarr', mode='a',
              shape=(0, 720, 1440),
              chunks=(1, 720, 1440),
              dtype='f4')

# Append new time steps
for new_timestep in data_stream:
    z.append(new_timestep, axis=0)
```

### Processing Large Arrays in Chunks
```python
z = zarr.open('large_data.zarr', mode='r')

# Process without loading entire array
for i in range(0, z.shape[0], 1000):
    chunk = z[i:i+1000, :]
    result = process(chunk)
    save(result)
```

### Format Conversion Pipeline
```python
# HDF5 → Zarr
import h5py
with h5py.File('data.h5', 'r') as h5:
    z = zarr.array(h5['dataset'][:], chunks=(1000, 1000), store='data.zarr')

# Zarr → NumPy file
z = zarr.open('data.zarr', mode='r')
np.save('data.npy', z[:])

# Zarr → NetCDF (via Xarray)
ds = xr.open_zarr('data.zarr')
ds.to_netcdf('data.nc')
```

## Performance Optimization Quick Checklist

1. **Chunk size**: 1-10 MB per chunk
2. **Chunk shape**: Align with access pattern
3. **Compression**:
   - Fast: `BloscCodec(cname='lz4', clevel=1)`
   - Balanced: `BloscCodec(cname='zstd', clevel=5)`
   - Maximum: `GzipCodec(level=9)`
4. **Cloud storage**:
   - Larger chunks (5-100 MB)
   - Consolidate metadata
   - Consider sharding
5. **Parallel I/O**: Use Dask for large operations
6. **Memory**: Process in chunks, don't load entire arrays

## Debugging and Profiling

```python
z = zarr.open('data.zarr', mode='r')

# Detailed information
print(z.info)

# Size statistics
print(f"Uncompressed: {z.nbytes / 1e6:.2f} MB")
print(f"Compressed: {z.nbytes_stored / 1e6:.2f} MB")
print(f"Ratio: {z.nbytes / z.nbytes_stored:.1f}x")

# Chunk information
print(f"Chunks: {z.chunks}")
print(f"Number of chunks: {z.nchunks}")
print(f"Chunk grid: {z.cdata_shape}")
```

## Common Data Types

```python
# Integers
'i1', 'i2', 'i4', 'i8'  # Signed: 8, 16, 32, 64-bit
'u1', 'u2', 'u4', 'u8'  # Unsigned: 8, 16, 32, 64-bit

# Floats
'f2', 'f4', 'f8'  # 16, 32, 64-bit (half, single, double precision)

# Others
'bool'     # Boolean
'c8', 'c16'  # Complex: 64, 128-bit
'S10'      # Fixed-length string (10 bytes)
'U10'      # Unicode string (10 characters)
```

## Version Compatibility

Zarr-Python version 3.x supports both:
- **Zarr v2 format**: Legacy format, widely compatible
- **Zarr v3 format**: New format with sharding, improved metadata

Check format version:
```python
# Zarr automatically detects format version
z = zarr.open('data.zarr', mode='r')
# Format info available in metadata
```

## Error Handling

```python
try:
    z = zarr.open_array('data.zarr', mode='r')
except zarr.errors.PathNotFoundError:
    print("Array does not exist")
except zarr.errors.ReadOnlyError:
    print("Cannot write to read-only array")
except Exception as e:
    print(f"Unexpected error: {e}")
```
