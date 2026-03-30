# Dask Arrays

## Overview

Dask Array implements NumPy's ndarray interface using blocked algorithms. It coordinates many NumPy arrays arranged into a grid to enable computation on datasets larger than available memory, utilizing parallelism across multiple cores.

## Core Concept

A Dask Array is divided into chunks (blocks):
- Each chunk is a regular NumPy array
- Operations are applied to each chunk in parallel
- Results are combined automatically
- Enables out-of-core computation (data larger than RAM)

## Key Capabilities

### What Dask Arrays Support

**Mathematical Operations**:
- Arithmetic operations (+, -, *, /)
- Scalar functions (exponentials, logarithms, trigonometric)
- Element-wise operations

**Reductions**:
- `sum()`, `mean()`, `std()`, `var()`
- Reductions along specified axes
- `min()`, `max()`, `argmin()`, `argmax()`

**Linear Algebra**:
- Tensor contractions
- Dot products and matrix multiplication
- Some decompositions (SVD, QR)

**Data Manipulation**:
- Transposition
- Slicing (standard and fancy indexing)
- Reshaping
- Concatenation and stacking

**Array Protocols**:
- Universal functions (ufuncs)
- NumPy protocols for interoperability

## When to Use Dask Arrays

**Use Dask Arrays When**:
- Arrays exceed available RAM
- Computation can be parallelized across chunks
- Working with NumPy-style numerical operations
- Need to scale NumPy code to larger datasets

**Stick with NumPy When**:
- Arrays fit comfortably in memory
- Operations require global views of data
- Using specialized functions not available in Dask
- Performance is adequate with NumPy alone

## Important Limitations

Dask Arrays intentionally don't implement certain NumPy features:

**Not Implemented**:
- Most `np.linalg` functions (only basic operations available)
- Operations difficult to parallelize (like full sorting)
- Memory-inefficient operations (converting to lists, iterating via loops)
- Many specialized functions (driven by community needs)

**Workarounds**: For unsupported operations, consider using `map_blocks` with custom NumPy code.

## Creating Dask Arrays

### From NumPy Arrays
```python
import dask.array as da
import numpy as np

# Create from NumPy array with specified chunks
x = np.arange(10000)
dx = da.from_array(x, chunks=1000)  # Creates 10 chunks of 1000 elements each
```

### Random Arrays
```python
# Create random array with specified chunks
x = da.random.random((10000, 10000), chunks=(1000, 1000))

# Other random functions
x = da.random.normal(10, 0.1, size=(10000, 10000), chunks=(1000, 1000))
```

### Zeros, Ones, and Empty
```python
# Create arrays filled with constants
zeros = da.zeros((10000, 10000), chunks=(1000, 1000))
ones = da.ones((10000, 10000), chunks=(1000, 1000))
empty = da.empty((10000, 10000), chunks=(1000, 1000))
```

### From Functions
```python
# Create array from function
def create_block(block_id):
    return np.random.random((1000, 1000)) * block_id[0]

x = da.from_delayed(
    [[dask.delayed(create_block)((i, j)) for j in range(10)] for i in range(10)],
    shape=(10000, 10000),
    dtype=float
)
```

### From Disk
```python
# Load from HDF5
import h5py
f = h5py.File('myfile.hdf5', mode='r')
x = da.from_array(f['/data'], chunks=(1000, 1000))

# Load from Zarr
import zarr
z = zarr.open('myfile.zarr', mode='r')
x = da.from_array(z, chunks=(1000, 1000))
```

## Common Operations

### Arithmetic Operations
```python
import dask.array as da

x = da.random.random((10000, 10000), chunks=(1000, 1000))
y = da.random.random((10000, 10000), chunks=(1000, 1000))

# Element-wise operations (lazy)
z = x + y
z = x * y
z = da.exp(x)
z = da.log(y)

# Compute result
result = z.compute()
```

### Reductions
```python
# Reductions along axes
total = x.sum().compute()
mean = x.mean().compute()
std = x.std().compute()

# Reduction along specific axis
row_means = x.mean(axis=1).compute()
col_sums = x.sum(axis=0).compute()
```

### Slicing and Indexing
```python
# Standard slicing (returns Dask Array)
subset = x[1000:5000, 2000:8000]

# Fancy indexing
indices = [0, 5, 10, 15]
selected = x[indices, :]

# Boolean indexing
mask = x > 0.5
filtered = x[mask]
```

### Matrix Operations
```python
# Matrix multiplication
A = da.random.random((10000, 5000), chunks=(1000, 1000))
B = da.random.random((5000, 8000), chunks=(1000, 1000))
C = da.matmul(A, B)
result = C.compute()

# Dot product
dot_product = da.dot(A, B)

# Transpose
AT = A.T
```

### Linear Algebra
```python
# SVD (Singular Value Decomposition)
U, s, Vt = da.linalg.svd(A)
U_computed, s_computed, Vt_computed = dask.compute(U, s, Vt)

# QR decomposition
Q, R = da.linalg.qr(A)
Q_computed, R_computed = dask.compute(Q, R)

# Note: Only some linalg operations are available
```

### Reshaping and Manipulation
```python
# Reshape
x = da.random.random((10000, 10000), chunks=(1000, 1000))
reshaped = x.reshape(5000, 20000)

# Transpose
transposed = x.T

# Concatenate
x1 = da.random.random((5000, 10000), chunks=(1000, 1000))
x2 = da.random.random((5000, 10000), chunks=(1000, 1000))
combined = da.concatenate([x1, x2], axis=0)

# Stack
stacked = da.stack([x1, x2], axis=0)
```

## Chunking Strategy

Chunking is critical for Dask Array performance.

### Chunk Size Guidelines

**Good Chunk Sizes**:
- Each chunk: ~10-100 MB (compressed)
- ~1 million elements per chunk for numeric data
- Balance between parallelism and overhead

**Example Calculation**:
```python
# For float64 data (8 bytes per element)
# Target 100 MB chunks: 100 MB / 8 bytes = 12.5M elements

# For 2D array (10000, 10000):
x = da.random.random((10000, 10000), chunks=(1000, 1000))  # ~8 MB per chunk
```

### Viewing Chunk Structure
```python
# Check chunks
print(x.chunks)  # ((1000, 1000, ...), (1000, 1000, ...))

# Number of chunks
print(x.npartitions)

# Chunk sizes in bytes
print(x.nbytes / x.npartitions)
```

### Rechunking
```python
# Change chunk sizes
x = da.random.random((10000, 10000), chunks=(500, 500))
x_rechunked = x.rechunk((2000, 2000))

# Rechunk specific dimension
x_rechunked = x.rechunk({0: 2000, 1: 'auto'})
```

## Custom Operations with map_blocks

For operations not available in Dask, use `map_blocks`:

```python
import dask.array as da
import numpy as np

def custom_function(block):
    # Apply custom NumPy operation
    return np.fft.fft2(block)

x = da.random.random((10000, 10000), chunks=(1000, 1000))
result = da.map_blocks(custom_function, x, dtype=x.dtype)

# Compute
output = result.compute()
```

### map_blocks with Different Output Shape
```python
def reduction_function(block):
    # Returns scalar for each block
    return np.array([block.mean()])

result = da.map_blocks(
    reduction_function,
    x,
    dtype='float64',
    drop_axis=[0, 1],  # Output has no axes from input
    new_axis=0,        # Output has new axis
    chunks=(1,)        # One element per block
)
```

## Lazy Evaluation and Computation

### Lazy Operations
```python
# All operations are lazy (instant, no computation)
x = da.random.random((10000, 10000), chunks=(1000, 1000))
y = x + 100
z = y.mean(axis=0)
result = z * 2

# Nothing computed yet, just task graph built
```

### Triggering Computation
```python
# Compute single result
final = result.compute()

# Compute multiple results efficiently
result1, result2 = dask.compute(operation1, operation2)
```

### Persist in Memory
```python
# Keep intermediate results in memory
x_cached = x.persist()

# Reuse cached results
y1 = (x_cached + 10).compute()
y2 = (x_cached * 2).compute()
```

## Saving Results

### To NumPy
```python
# Convert to NumPy (loads all in memory)
numpy_array = dask_array.compute()
```

### To Disk
```python
# Save to HDF5
import h5py
with h5py.File('output.hdf5', mode='w') as f:
    dset = f.create_dataset('/data', shape=x.shape, dtype=x.dtype)
    da.store(x, dset)

# Save to Zarr
import zarr
z = zarr.open('output.zarr', mode='w', shape=x.shape, dtype=x.dtype, chunks=x.chunks)
da.store(x, z)
```

## Performance Considerations

### Efficient Operations
- Element-wise operations: Very efficient
- Reductions with parallelizable operations: Efficient
- Slicing along chunk boundaries: Efficient
- Matrix operations with good chunk alignment: Efficient

### Expensive Operations
- Slicing across many chunks: Requires data movement
- Operations requiring global sorting: Not well supported
- Extremely irregular access patterns: Poor performance
- Operations with poor chunk alignment: Requires rechunking

### Optimization Tips

**1. Choose Good Chunk Sizes**
```python
# Aim for balanced chunks
# Good: ~100 MB per chunk
x = da.random.random((100000, 10000), chunks=(10000, 10000))
```

**2. Align Chunks for Operations**
```python
# Make sure chunks align for operations
x = da.random.random((10000, 10000), chunks=(1000, 1000))
y = da.random.random((10000, 10000), chunks=(1000, 1000))  # Aligned
z = x + y  # Efficient
```

**3. Use Appropriate Scheduler**
```python
# Arrays work well with threaded scheduler (default)
# Shared memory access is efficient
result = x.compute()  # Uses threads by default
```

**4. Minimize Data Transfer**
```python
# Better: Compute on each chunk, then transfer results
means = x.mean(axis=1).compute()  # Transfers less data

# Worse: Transfer all data then compute
x_numpy = x.compute()
means = x_numpy.mean(axis=1)  # Transfers more data
```

## Common Patterns

### Image Processing
```python
import dask.array as da

# Load large image stack
images = da.from_zarr('images.zarr')

# Apply filtering
def apply_gaussian(block):
    from scipy.ndimage import gaussian_filter
    return gaussian_filter(block, sigma=2)

filtered = da.map_blocks(apply_gaussian, images, dtype=images.dtype)

# Compute statistics
mean_intensity = filtered.mean().compute()
```

### Scientific Computing
```python
# Large-scale numerical simulation
x = da.random.random((100000, 100000), chunks=(10000, 10000))

# Apply iterative computation
for i in range(num_iterations):
    x = da.exp(-x) * da.sin(x)
    x = x.persist()  # Keep in memory for next iteration

# Final result
result = x.compute()
```

### Data Analysis
```python
# Load large dataset
data = da.from_zarr('measurements.zarr')

# Compute statistics
mean = data.mean(axis=0)
std = data.std(axis=0)
normalized = (data - mean) / std

# Save normalized data
da.to_zarr(normalized, 'normalized.zarr')
```

## Integration with Other Tools

### XArray
```python
import xarray as xr
import dask.array as da

# XArray wraps Dask arrays with labeled dimensions
data = da.random.random((1000, 2000, 3000), chunks=(100, 200, 300))
dataset = xr.DataArray(
    data,
    dims=['time', 'y', 'x'],
    coords={'time': range(1000), 'y': range(2000), 'x': range(3000)}
)
```

### Scikit-learn (via Dask-ML)
```python
# Some scikit-learn compatible operations
from dask_ml.preprocessing import StandardScaler

X = da.random.random((10000, 100), chunks=(1000, 100))
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
```

## Debugging Tips

### Visualize Task Graph
```python
# Visualize computation graph (for small arrays)
x = da.random.random((100, 100), chunks=(10, 10))
y = x + 1
y.visualize(filename='graph.png')
```

### Check Array Properties
```python
# Inspect before computing
print(f"Shape: {x.shape}")
print(f"Dtype: {x.dtype}")
print(f"Chunks: {x.chunks}")
print(f"Number of tasks: {len(x.__dask_graph__())}")
```

### Test on Small Arrays First
```python
# Test logic on small array
small_x = da.random.random((100, 100), chunks=(50, 50))
result_small = computation(small_x).compute()

# Validate, then scale
large_x = da.random.random((100000, 100000), chunks=(10000, 10000))
result_large = computation(large_x).compute()
```
