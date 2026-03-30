# I/O Operations

This reference covers file input/output operations, format conversions, export strategies, and working with various data formats in Vaex.

## Overview

Vaex supports multiple file formats with varying performance characteristics. The choice of format significantly impacts loading speed, memory usage, and overall performance.

**Format recommendations:**
- **HDF5** - Best for most use cases (instant loading, memory-mapped)
- **Apache Arrow** - Best for interoperability (instant loading, columnar)
- **Parquet** - Good for distributed systems (compressed, columnar)
- **CSV** - Avoid for large datasets (slow loading, not memory-mapped)

## Reading Data

### HDF5 Files (Recommended)

```python
import vaex

# Open HDF5 file (instant, memory-mapped)
df = vaex.open('data.hdf5')

# Multiple files as one DataFrame
df = vaex.open('data_part*.hdf5')
df = vaex.open(['data_2020.hdf5', 'data_2021.hdf5', 'data_2022.hdf5'])
```

**Advantages:**
- Instant loading (memory-mapped, no data read into RAM)
- Optimal performance for Vaex operations
- Supports compression
- Random access patterns

### Apache Arrow Files

```python
# Open Arrow file (instant, memory-mapped)
df = vaex.open('data.arrow')
df = vaex.open('data.feather')  # Feather is Arrow format

# Multiple Arrow files
df = vaex.open('data_*.arrow')
```

**Advantages:**
- Instant loading (memory-mapped)
- Language-agnostic format
- Excellent for data sharing
- Zero-copy integration with Arrow ecosystem

### Parquet Files

```python
# Open Parquet file
df = vaex.open('data.parquet')

# Multiple Parquet files
df = vaex.open('data_*.parquet')

# From cloud storage
df = vaex.open('s3://bucket/data.parquet')
df = vaex.open('gs://bucket/data.parquet')
```

**Advantages:**
- Compressed by default
- Columnar format
- Wide ecosystem support
- Good for distributed systems

**Considerations:**
- Slower than HDF5/Arrow for local files
- May require full file read for some operations

### CSV Files

```python
# Simple CSV
df = vaex.from_csv('data.csv')

# Large CSV with automatic chunking
df = vaex.from_csv('large_data.csv', chunk_size=5_000_000)

# CSV with conversion to HDF5
df = vaex.from_csv('large_data.csv', convert='large_data.hdf5')
# Creates HDF5 file for future fast loading

# CSV with options
df = vaex.from_csv(
    'data.csv',
    sep=',',
    header=0,
    names=['col1', 'col2', 'col3'],
    dtype={'col1': 'int64', 'col2': 'float64'},
    usecols=['col1', 'col2'],  # Only load specific columns
    nrows=100000  # Limit number of rows
)
```

**Recommendations:**
- **Always convert large CSVs to HDF5** for repeated use
- Use `convert` parameter to create HDF5 automatically
- CSV loading can take significant time for large files

### FITS Files (Astronomy)

```python
# Open FITS file
df = vaex.open('astronomical_data.fits')

# Multiple FITS files
df = vaex.open('survey_*.fits')
```

## Writing/Exporting Data

### Export to HDF5

```python
# Export to HDF5 (recommended for Vaex)
df.export_hdf5('output.hdf5')

# With progress bar
df.export_hdf5('output.hdf5', progress=True)

# Export subset of columns
df[['col1', 'col2', 'col3']].export_hdf5('subset.hdf5')

# Export with compression
df.export_hdf5('compressed.hdf5', compression='gzip')
```

### Export to Arrow

```python
# Export to Arrow format
df.export_arrow('output.arrow')

# Export to Feather (Arrow format)
df.export_feather('output.feather')
```

### Export to Parquet

```python
# Export to Parquet
df.export_parquet('output.parquet')

# With compression
df.export_parquet('output.parquet', compression='snappy')
df.export_parquet('output.parquet', compression='gzip')
```

### Export to CSV

```python
# Export to CSV (not recommended for large data)
df.export_csv('output.csv')

# With options
df.export_csv(
    'output.csv',
    sep=',',
    header=True,
    index=False,
    chunk_size=1_000_000
)

# Export subset
df[df.age > 25].export_csv('filtered_output.csv')
```

## Format Conversion

### CSV to HDF5 (Most Common)

```python
import vaex

# Method 1: Automatic conversion during read
df = vaex.from_csv('large.csv', convert='large.hdf5')
# Creates large.hdf5, returns DataFrame pointing to it

# Method 2: Explicit conversion
df = vaex.from_csv('large.csv')
df.export_hdf5('large.hdf5')

# Future loads (instant)
df = vaex.open('large.hdf5')
```

### HDF5 to Arrow

```python
# Load HDF5
df = vaex.open('data.hdf5')

# Export to Arrow
df.export_arrow('data.arrow')
```

### Parquet to HDF5

```python
# Load Parquet
df = vaex.open('data.parquet')

# Export to HDF5
df.export_hdf5('data.hdf5')
```

### Multiple CSV Files to Single HDF5

```python
import vaex
import glob

# Find all CSV files
csv_files = glob.glob('data_*.csv')

# Load and concatenate
dfs = [vaex.from_csv(f) for f in csv_files]
df_combined = vaex.concat(dfs)

# Export as single HDF5
df_combined.export_hdf5('combined_data.hdf5')
```

## Incremental/Chunked I/O

### Processing Large CSV in Chunks

```python
import vaex

# Process CSV in chunks
chunk_size = 1_000_000
output_file = 'processed.hdf5'

for i, df_chunk in enumerate(vaex.from_csv_chunked('huge.csv', chunk_size=chunk_size)):
    # Process chunk
    df_chunk['new_col'] = df_chunk.x + df_chunk.y

    # Append to HDF5
    if i == 0:
        df_chunk.export_hdf5(output_file)
    else:
        df_chunk.export_hdf5(output_file, mode='a')  # Append

# Load final result
df = vaex.open(output_file)
```

### Exporting in Chunks

```python
# Export large DataFrame in chunks (for CSV)
chunk_size = 1_000_000

for i in range(0, len(df), chunk_size):
    df_chunk = df[i:i+chunk_size]
    mode = 'w' if i == 0 else 'a'
    df_chunk.export_csv('large_output.csv', mode=mode, header=(i == 0))
```

## Pandas Integration

### From Pandas to Vaex

```python
import pandas as pd
import vaex

# Read with pandas
pdf = pd.read_csv('data.csv')

# Convert to Vaex
df = vaex.from_pandas(pdf, copy_index=False)

# For better performance: Use Vaex directly
df = vaex.from_csv('data.csv')  # Preferred
```

### From Vaex to Pandas

```python
# Full conversion (careful with large data!)
pdf = df.to_pandas_df()

# Convert subset
pdf = df[['col1', 'col2']].to_pandas_df()
pdf = df[:10000].to_pandas_df()  # First 10k rows
pdf = df[df.age > 25].to_pandas_df()  # Filtered

# Sample for exploration
pdf_sample = df.sample(n=10000).to_pandas_df()
```

## Arrow Integration

### From Arrow to Vaex

```python
import pyarrow as pa
import vaex

# From Arrow Table
arrow_table = pa.table({
    'a': [1, 2, 3],
    'b': [4, 5, 6]
})
df = vaex.from_arrow_table(arrow_table)

# From Arrow file
arrow_table = pa.ipc.open_file('data.arrow').read_all()
df = vaex.from_arrow_table(arrow_table)
```

### From Vaex to Arrow

```python
# Convert to Arrow Table
arrow_table = df.to_arrow_table()

# Write Arrow file
import pyarrow as pa
with pa.ipc.new_file('output.arrow', arrow_table.schema) as writer:
    writer.write_table(arrow_table)

# Or use Vaex export
df.export_arrow('output.arrow')
```

## Remote and Cloud Storage

### Reading from S3

```python
import vaex

# Read from S3 (requires s3fs)
df = vaex.open('s3://bucket-name/data.parquet')
df = vaex.open('s3://bucket-name/data.hdf5')

# With credentials
import s3fs
fs = s3fs.S3FileSystem(key='access_key', secret='secret_key')
df = vaex.open('s3://bucket-name/data.parquet', fs=fs)
```

### Reading from Google Cloud Storage

```python
# Read from GCS (requires gcsfs)
df = vaex.open('gs://bucket-name/data.parquet')

# With credentials
import gcsfs
fs = gcsfs.GCSFileSystem(token='path/to/credentials.json')
df = vaex.open('gs://bucket-name/data.parquet', fs=fs)
```

### Reading from Azure

```python
# Read from Azure Blob Storage (requires adlfs)
df = vaex.open('az://container-name/data.parquet')
```

### Writing to Cloud Storage

```python
# Export to S3
df.export_parquet('s3://bucket-name/output.parquet')
df.export_hdf5('s3://bucket-name/output.hdf5')

# Export to GCS
df.export_parquet('gs://bucket-name/output.parquet')
```

## Database Integration

### Reading from SQL Databases

```python
import vaex
import pandas as pd
from sqlalchemy import create_engine

# Read with pandas, convert to Vaex
engine = create_engine('postgresql://user:password@host:port/database')
pdf = pd.read_sql('SELECT * FROM table', engine)
df = vaex.from_pandas(pdf)

# For large tables: Read in chunks
chunks = []
for chunk in pd.read_sql('SELECT * FROM large_table', engine, chunksize=100000):
    chunks.append(vaex.from_pandas(chunk))
df = vaex.concat(chunks)

# Better: Export from database to CSV/Parquet, then load with Vaex
```

### Writing to SQL Databases

```python
# Convert to pandas, then write
pdf = df.to_pandas_df()
pdf.to_sql('table_name', engine, if_exists='replace', index=False)

# For large data: Write in chunks
chunk_size = 100000
for i in range(0, len(df), chunk_size):
    chunk = df[i:i+chunk_size].to_pandas_df()
    chunk.to_sql('table_name', engine,
                 if_exists='append' if i > 0 else 'replace',
                 index=False)
```

## Memory-Mapped Files

### Understanding Memory Mapping

```python
# HDF5 and Arrow files are memory-mapped by default
df = vaex.open('data.hdf5')  # No data loaded into RAM

# Data is read from disk on-demand
mean = df.x.mean()  # Streams through data, minimal memory

# Check if column is memory-mapped
print(df.is_local('column_name'))  # False = memory-mapped
```

### Forcing Data into Memory

```python
# If needed, load data into memory
df_in_memory = df.copy()
for col in df.get_column_names():
    df_in_memory[col] = df[col].values  # Materializes in memory
```

## File Compression

### HDF5 Compression

```python
# Export with compression
df.export_hdf5('compressed.hdf5', compression='gzip')
df.export_hdf5('compressed.hdf5', compression='lzf')
df.export_hdf5('compressed.hdf5', compression='blosc')

# Trade-off: Smaller file size, slightly slower I/O
```

### Parquet Compression

```python
# Parquet is compressed by default
df.export_parquet('data.parquet', compression='snappy')  # Fast
df.export_parquet('data.parquet', compression='gzip')    # Better compression
df.export_parquet('data.parquet', compression='brotli')  # Best compression
```

## Vaex Server (Remote Data)

### Starting Vaex Server

```bash
# Start server
vaex-server data.hdf5 --host 0.0.0.0 --port 9000
```

### Connecting to Remote Server

```python
import vaex

# Connect to remote Vaex server
df = vaex.open('ws://hostname:9000/data')

# Operations work transparently
mean = df.x.mean()  # Computed on server
```

## State Files

### Saving DataFrame State

```python
# Save state (includes virtual columns, selections, etc.)
df.state_write('state.json')

# Includes:
# - Virtual column definitions
# - Active selections
# - Variables
# - Transformations (scalers, encoders, models)
```

### Loading DataFrame State

```python
# Load data
df = vaex.open('data.hdf5')

# Apply saved state
df.state_load('state.json')

# All virtual columns, selections, and transformations restored
```

## Best Practices

### 1. Choose the Right Format

```python
# For local work: HDF5
df.export_hdf5('data.hdf5')

# For sharing/interoperability: Arrow
df.export_arrow('data.arrow')

# For distributed systems: Parquet
df.export_parquet('data.parquet')

# Avoid CSV for large data
```

### 2. Convert CSV Once

```python
# One-time conversion
df = vaex.from_csv('large.csv', convert='large.hdf5')

# All future loads
df = vaex.open('large.hdf5')  # Instant!
```

### 3. Materialize Before Export

```python
# If DataFrame has many virtual columns
df_materialized = df.materialize()
df_materialized.export_hdf5('output.hdf5')

# Faster exports and future loads
```

### 4. Use Compression Wisely

```python
# For archival or infrequently accessed data
df.export_hdf5('archived.hdf5', compression='gzip')

# For active work (faster I/O)
df.export_hdf5('working.hdf5')  # No compression
```

### 5. Checkpoint Long Pipelines

```python
# After expensive preprocessing
df_preprocessed = preprocess(df)
df_preprocessed.export_hdf5('checkpoint_preprocessed.hdf5')

# After feature engineering
df_features = engineer_features(df_preprocessed)
df_features.export_hdf5('checkpoint_features.hdf5')

# Enables resuming from checkpoints
```

## Performance Comparisons

### Format Loading Speed

```python
import time
import vaex

# CSV (slowest)
start = time.time()
df_csv = vaex.from_csv('data.csv')
csv_time = time.time() - start

# HDF5 (instant)
start = time.time()
df_hdf5 = vaex.open('data.hdf5')
hdf5_time = time.time() - start

# Arrow (instant)
start = time.time()
df_arrow = vaex.open('data.arrow')
arrow_time = time.time() - start

print(f"CSV: {csv_time:.2f}s")
print(f"HDF5: {hdf5_time:.4f}s")
print(f"Arrow: {arrow_time:.4f}s")
```

## Common Patterns

### Pattern: Production Data Pipeline

```python
import vaex

# Read from source (CSV, database export, etc.)
df = vaex.from_csv('raw_data.csv')

# Process
df['cleaned'] = clean(df.raw_column)
df['feature'] = engineer_feature(df)

# Export for production use
df.export_hdf5('production_data.hdf5')
df.state_write('production_state.json')

# In production: Fast loading
df_prod = vaex.open('production_data.hdf5')
df_prod.state_load('production_state.json')
```

### Pattern: Archiving with Compression

```python
# Archive old data with compression
df_2020 = vaex.open('data_2020.hdf5')
df_2020.export_hdf5('archive_2020.hdf5', compression='gzip')

# Remove uncompressed original
import os
os.remove('data_2020.hdf5')
```

### Pattern: Multi-Source Data Loading

```python
import vaex

# Load from multiple sources
df_csv = vaex.from_csv('data.csv')
df_hdf5 = vaex.open('data.hdf5')
df_parquet = vaex.open('data.parquet')

# Concatenate
df_all = vaex.concat([df_csv, df_hdf5, df_parquet])

# Export unified format
df_all.export_hdf5('unified.hdf5')
```

## Troubleshooting

### Issue: CSV Loading Too Slow

```python
# Solution: Convert to HDF5
df = vaex.from_csv('large.csv', convert='large.hdf5')
# Future: df = vaex.open('large.hdf5')
```

### Issue: Out of Memory on Export

```python
# Solution: Export in chunks or materialize first
df_materialized = df.materialize()
df_materialized.export_hdf5('output.hdf5')
```

### Issue: Can't Read File from Cloud

```python
# Install required libraries
# pip install s3fs gcsfs adlfs

# Verify credentials
import s3fs
fs = s3fs.S3FileSystem()
fs.ls('s3://bucket-name/')
```

## Format Feature Matrix

| Feature | HDF5 | Arrow | Parquet | CSV |
|---------|------|-------|---------|-----|
| Load Speed | Instant | Instant | Fast | Slow |
| Memory-mapped | Yes | Yes | No | No |
| Compression | Optional | No | Yes | No |
| Columnar | Yes | Yes | Yes | No |
| Portability | Good | Excellent | Excellent | Excellent |
| File Size | Medium | Medium | Small | Large |
| Best For | Vaex workflows | Interop | Distributed | Exchange |

## Related Resources

- For DataFrame creation: See `core_dataframes.md`
- For performance optimization: See `performance.md`
- For data processing: See `data_processing.md`
