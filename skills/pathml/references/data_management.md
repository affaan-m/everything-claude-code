# Data Management & Storage

## Overview

PathML provides efficient data management solutions for handling large-scale pathology datasets through HDF5 storage, tile management strategies, and optimized batch processing workflows. The framework enables seamless storage and retrieval of images, masks, features, and metadata in formats optimized for machine learning pipelines and downstream analysis.

## HDF5 Integration

HDF5 (Hierarchical Data Format) is the primary storage format for processed PathML data, providing:
- Efficient compression and chunked storage
- Fast random access to subsets of data
- Support for arbitrarily large datasets
- Hierarchical organization of heterogeneous data types
- Cross-platform compatibility

### Saving to HDF5

**Single slide:**
```python
from pathml.core import SlideData

# Load and process slide
wsi = SlideData.from_slide("slide.svs")
wsi.generate_tiles(level=1, tile_size=256, stride=256)

# Run preprocessing pipeline
pipeline.run(wsi)

# Save to HDF5
wsi.to_hdf5("processed_slide.h5")
```

**Multiple slides (SlideDataset):**
```python
from pathml.core import SlideDataset
import glob

# Create dataset
slide_paths = glob.glob("data/*.svs")
dataset = SlideDataset(slide_paths, tile_size=256, stride=256, level=1)

# Process
dataset.run(pipeline, distributed=True, n_workers=8)

# Save entire dataset
dataset.to_hdf5("processed_dataset.h5")
```

### HDF5 File Structure

PathML HDF5 files are organized hierarchically:

```
processed_dataset.h5
├── slide_0/
│   ├── metadata/
│   │   ├── name
│   │   ├── level
│   │   ├── dimensions
│   │   └── ...
│   ├── tiles/
│   │   ├── tile_0/
│   │   │   ├── image  (H, W, C) array
│   │   │   ├── coords  (x, y)
│   │   │   └── masks/
│   │   │       ├── tissue
│   │   │       ├── nucleus
│   │   │       └── ...
│   │   ├── tile_1/
│   │   └── ...
│   └── features/
│       ├── tile_features  (n_tiles, n_features)
│       └── feature_names
├── slide_1/
└── ...
```

### Loading from HDF5

**Load entire slide:**
```python
from pathml.core import SlideData

# Load from HDF5
wsi = SlideData.from_hdf5("processed_slide.h5")

# Access tiles
for tile in wsi.tiles:
    image = tile.image
    masks = tile.masks
    # Process tile...
```

**Load specific tiles:**
```python
# Load only tiles at specific indices
tile_indices = [0, 10, 20, 30]
tiles = wsi.load_tiles_from_hdf5("processed_slide.h5", indices=tile_indices)

for tile in tiles:
    # Process subset...
    pass
```

**Memory-mapped access:**
```python
import h5py

# Open HDF5 file without loading into memory
with h5py.File("processed_dataset.h5", 'r') as f:
    # Access specific data
    tile_0_image = f['slide_0/tiles/tile_0/image'][:]
    tissue_mask = f['slide_0/tiles/tile_0/masks/tissue'][:]

    # Iterate through tiles efficiently
    for tile_key in f['slide_0/tiles'].keys():
        tile_image = f[f'slide_0/tiles/{tile_key}/image'][:]
        # Process without loading all tiles...
```

## Tile Management

### Tile Generation Strategies

**Fixed-size tiles with no overlap:**
```python
wsi.generate_tiles(
    level=1,
    tile_size=256,
    stride=256,  # stride = tile_size → no overlap
    pad=False  # Don't pad edge tiles
)
```
- **Use case:** Standard tile-based processing, classification
- **Pros:** Simple, no redundancy, fast processing
- **Cons:** Edge effects at tile boundaries

**Overlapping tiles:**
```python
wsi.generate_tiles(
    level=1,
    tile_size=256,
    stride=128,  # 50% overlap
    pad=False
)
```
- **Use case:** Segmentation, detection (reduces boundary artifacts)
- **Pros:** Better boundary handling, smoother stitching
- **Cons:** More tiles, redundant computation

**Adaptive tiling based on tissue content:**
```python
from pathml.utils import adaptive_tile_generation

# Generate tiles only in tissue regions
wsi.generate_tiles(level=1, tile_size=256, stride=256)

# Filter to keep only tiles with sufficient tissue
tissue_tiles = []
for tile in wsi.tiles:
    if tile.masks.get('tissue') is not None:
        tissue_coverage = tile.masks['tissue'].sum() / (tile_size**2)
        if tissue_coverage > 0.5:  # Keep tiles with >50% tissue
            tissue_tiles.append(tile)

wsi.tiles = tissue_tiles
```
- **Use case:** Sparse tissue samples, efficiency
- **Pros:** Reduces processing of background tiles
- **Cons:** Requires tissue detection preprocessing step

### Tile Stitching

Reconstruct full slide from processed tiles:

```python
from pathml.utils import stitch_tiles

# Process tiles
for tile in wsi.tiles:
    tile.prediction = model.predict(tile.image)

# Stitch predictions back to full resolution
full_prediction_map = stitch_tiles(
    wsi.tiles,
    output_shape=wsi.level_dimensions[1],  # Use level 1 dimensions
    tile_size=256,
    stride=256,
    method='average'  # 'average', 'max', or 'first'
)

# Visualize
import matplotlib.pyplot as plt
plt.figure(figsize=(15, 15))
plt.imshow(full_prediction_map)
plt.title('Stitched Prediction Map')
plt.axis('off')
plt.show()
```

**Stitching methods:**
- `'average'`: Average overlapping regions (smooth transitions)
- `'max'`: Maximum value in overlapping regions
- `'first'`: Keep first tile's value (no blending)
- `'weighted'`: Distance-weighted blending for smooth boundaries

### Tile Caching

Cache frequently accessed tiles for faster iteration:

```python
from pathml.utils import TileCache

# Create cache
cache = TileCache(max_size_gb=10)

# Cache tiles during first iteration
for i, tile in enumerate(wsi.tiles):
    cache.add(f'tile_{i}', tile.image)
    # Process tile...

# Subsequent iterations use cached data
for i in range(len(wsi.tiles)):
    cached_image = cache.get(f'tile_{i}')
    # Fast access...
```

## Dataset Organization

### Directory Structure for Large Projects

Organize pathology projects with consistent structure:

```
project/
├── raw_slides/
│   ├── cohort1/
│   │   ├── slide001.svs
│   │   ├── slide002.svs
│   │   └── ...
│   └── cohort2/
│       └── ...
├── processed/
│   ├── cohort1/
│   │   ├── slide001.h5
│   │   ├── slide002.h5
│   │   └── ...
│   └── cohort2/
│       └── ...
├── features/
│   ├── cohort1_features.h5
│   └── cohort2_features.h5
├── models/
│   ├── hovernet_checkpoint.pth
│   └── classifier.onnx
├── results/
│   ├── predictions/
│   ├── visualizations/
│   └── metrics.csv
└── metadata/
    ├── clinical_data.csv
    └── slide_manifest.csv
```

### Metadata Management

Store slide-level and cohort-level metadata:

```python
import pandas as pd

# Slide manifest
manifest = pd.DataFrame({
    'slide_id': ['slide001', 'slide002', 'slide003'],
    'path': ['raw_slides/cohort1/slide001.svs', ...],
    'cohort': ['cohort1', 'cohort1', 'cohort2'],
    'tissue_type': ['breast', 'breast', 'lung'],
    'scanner': ['Aperio', 'Hamamatsu', 'Aperio'],
    'magnification': [40, 40, 20],
    'staining': ['H&E', 'H&E', 'H&E']
})

manifest.to_csv('metadata/slide_manifest.csv', index=False)

# Clinical data
clinical = pd.DataFrame({
    'slide_id': ['slide001', 'slide002', 'slide003'],
    'patient_id': ['P001', 'P002', 'P003'],
    'age': [55, 62, 48],
    'diagnosis': ['invasive', 'in_situ', 'invasive'],
    'stage': ['II', 'I', 'III'],
    'outcome': ['favorable', 'favorable', 'poor']
})

clinical.to_csv('metadata/clinical_data.csv', index=False)

# Load and merge
manifest = pd.read_csv('metadata/slide_manifest.csv')
clinical = pd.read_csv('metadata/clinical_data.csv')
data = manifest.merge(clinical, on='slide_id')
```

## Batch Processing Strategies

### Sequential Processing

Process slides one at a time (memory-efficient):

```python
import glob
from pathml.core import SlideData
from pathml.preprocessing import Pipeline

slide_paths = glob.glob('raw_slides/**/*.svs', recursive=True)

for slide_path in slide_paths:
    # Load slide
    wsi = SlideData.from_slide(slide_path)
    wsi.generate_tiles(level=1, tile_size=256, stride=256)

    # Process
    pipeline.run(wsi)

    # Save
    output_path = slide_path.replace('raw_slides', 'processed').replace('.svs', '.h5')
    wsi.to_hdf5(output_path)

    print(f"Processed: {slide_path}")
```

### Parallel Processing with Dask

Process multiple slides in parallel:

```python
from pathml.core import SlideDataset
from dask.distributed import Client, LocalCluster
from pathml.preprocessing import Pipeline

# Start Dask cluster
cluster = LocalCluster(
    n_workers=8,
    threads_per_worker=2,
    memory_limit='8GB',
    dashboard_address=':8787'  # View progress at localhost:8787
)
client = Client(cluster)

# Create dataset
slide_paths = glob.glob('raw_slides/**/*.svs', recursive=True)
dataset = SlideDataset(slide_paths, tile_size=256, stride=256, level=1)

# Distribute processing
dataset.run(
    pipeline,
    distributed=True,
    client=client,
    scheduler='distributed'
)

# Save results
for i, slide in enumerate(dataset):
    output_path = slide_paths[i].replace('raw_slides', 'processed').replace('.svs', '.h5')
    slide.to_hdf5(output_path)

client.close()
cluster.close()
```

### Batch Processing with Job Arrays

For HPC clusters (SLURM, PBS):

```python
# submit_jobs.py
import os
import glob

slide_paths = glob.glob('raw_slides/**/*.svs', recursive=True)

# Write slide list
with open('slide_list.txt', 'w') as f:
    for path in slide_paths:
        f.write(path + '\n')

# Create SLURM job script
slurm_script = """#!/bin/bash
#SBATCH --array=1-{n_slides}
#SBATCH --cpus-per-task=4
#SBATCH --mem=16G
#SBATCH --time=4:00:00
#SBATCH --output=logs/slide_%A_%a.out

# Get slide path for this array task
SLIDE_PATH=$(sed -n "${{SLURM_ARRAY_TASK_ID}}p" slide_list.txt)

# Run processing
python process_slide.py --slide_path $SLIDE_PATH
""".format(n_slides=len(slide_paths))

with open('submit_jobs.sh', 'w') as f:
    f.write(slurm_script)

# Submit: sbatch submit_jobs.sh
```

```python
# process_slide.py
import argparse
from pathml.core import SlideData
from pathml.preprocessing import Pipeline

parser = argparse.ArgumentParser()
parser.add_argument('--slide_path', type=str, required=True)
args = parser.parse_args()

# Load and process
wsi = SlideData.from_slide(args.slide_path)
wsi.generate_tiles(level=1, tile_size=256, stride=256)

pipeline = Pipeline([...])
pipeline.run(wsi)

# Save
output_path = args.slide_path.replace('raw_slides', 'processed').replace('.svs', '.h5')
wsi.to_hdf5(output_path)

print(f"Processed: {args.slide_path}")
```

## Feature Extraction and Storage

### Extracting Features

```python
from pathml.core import SlideData
import torch
import numpy as np

# Load pre-trained model for feature extraction
model = torch.load('models/feature_extractor.pth')
model.eval()
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = model.to(device)

# Load processed slide
wsi = SlideData.from_hdf5('processed/slide001.h5')

# Extract features for each tile
features = []
coords = []

for tile in wsi.tiles:
    # Preprocess tile
    tile_tensor = torch.from_numpy(tile.image).permute(2, 0, 1).unsqueeze(0).float()
    tile_tensor = tile_tensor.to(device)

    # Extract features
    with torch.no_grad():
        feature_vec = model(tile_tensor).cpu().numpy().flatten()

    features.append(feature_vec)
    coords.append(tile.coords)

features = np.array(features)  # Shape: (n_tiles, feature_dim)
coords = np.array(coords)  # Shape: (n_tiles, 2)
```

### Storing Features in HDF5

```python
import h5py

# Save features
with h5py.File('features/slide001_features.h5', 'w') as f:
    f.create_dataset('features', data=features, compression='gzip')
    f.create_dataset('coords', data=coords)
    f.attrs['feature_dim'] = features.shape[1]
    f.attrs['num_tiles'] = features.shape[0]
    f.attrs['model'] = 'resnet50'

# Load features
with h5py.File('features/slide001_features.h5', 'r') as f:
    features = f['features'][:]
    coords = f['coords'][:]
    feature_dim = f.attrs['feature_dim']
```

### Feature Database for Multiple Slides

```python
# Create consolidated feature database
import h5py
import glob

feature_files = glob.glob('features/*_features.h5')

with h5py.File('features/all_features.h5', 'w') as out_f:
    for i, feature_file in enumerate(feature_files):
        slide_name = feature_file.split('/')[-1].replace('_features.h5', '')

        with h5py.File(feature_file, 'r') as in_f:
            features = in_f['features'][:]
            coords = in_f['coords'][:]

            # Store in consolidated file
            grp = out_f.create_group(f'slide_{i}')
            grp.create_dataset('features', data=features, compression='gzip')
            grp.create_dataset('coords', data=coords)
            grp.attrs['slide_name'] = slide_name

# Query features from all slides
with h5py.File('features/all_features.h5', 'r') as f:
    for slide_key in f.keys():
        slide_name = f[slide_key].attrs['slide_name']
        features = f[f'{slide_key}/features'][:]
        # Process...
```

## Data Versioning

### Version Control with DVC

Use Data Version Control (DVC) for large dataset management:

```bash
# Initialize DVC
dvc init

# Add data directory
dvc add raw_slides/
dvc add processed/

# Commit to git
git add raw_slides.dvc processed.dvc .gitignore
git commit -m "Add raw and processed slides"

# Push data to remote storage (S3, GCS, etc.)
dvc remote add -d storage s3://my-bucket/pathml-data
dvc push

# Pull data on another machine
git pull
dvc pull
```

### Checksums and Validation

Validate data integrity:

```python
import hashlib
import pandas as pd

def compute_checksum(file_path):
    """Compute MD5 checksum of file."""
    hash_md5 = hashlib.md5()
    with open(file_path, 'rb') as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()

# Create checksum manifest
slide_paths = glob.glob('raw_slides/**/*.svs', recursive=True)
checksums = []

for slide_path in slide_paths:
    checksum = compute_checksum(slide_path)
    checksums.append({
        'path': slide_path,
        'checksum': checksum,
        'size_mb': os.path.getsize(slide_path) / 1e6
    })

checksum_df = pd.DataFrame(checksums)
checksum_df.to_csv('metadata/checksums.csv', index=False)

# Validate files
def validate_files(manifest_path):
    manifest = pd.read_csv(manifest_path)
    for _, row in manifest.iterrows():
        current_checksum = compute_checksum(row['path'])
        if current_checksum != row['checksum']:
            print(f"ERROR: Checksum mismatch for {row['path']}")
        else:
            print(f"OK: {row['path']}")

validate_files('metadata/checksums.csv')
```

## Performance Optimization

### Compression Settings

Optimize HDF5 compression for speed vs. size:

```python
import h5py

# Fast compression (less CPU, larger files)
with h5py.File('output.h5', 'w') as f:
    f.create_dataset(
        'images',
        data=images,
        compression='gzip',
        compression_opts=1  # Level 1-9, lower = faster
    )

# Maximum compression (more CPU, smaller files)
with h5py.File('output.h5', 'w') as f:
    f.create_dataset(
        'images',
        data=images,
        compression='gzip',
        compression_opts=9
    )

# Balanced (recommended)
with h5py.File('output.h5', 'w') as f:
    f.create_dataset(
        'images',
        data=images,
        compression='gzip',
        compression_opts=4,
        chunks=True  # Enable chunking for better I/O
    )
```

### Chunking Strategy

Optimize chunked storage for access patterns:

```python
# For tile-based access (access one tile at a time)
with h5py.File('tiles.h5', 'w') as f:
    f.create_dataset(
        'tiles',
        shape=(n_tiles, 256, 256, 3),
        dtype='uint8',
        chunks=(1, 256, 256, 3),  # One tile per chunk
        compression='gzip'
    )

# For channel-based access (access all tiles for one channel)
with h5py.File('tiles.h5', 'w') as f:
    f.create_dataset(
        'tiles',
        shape=(n_tiles, 256, 256, 3),
        dtype='uint8',
        chunks=(n_tiles, 256, 256, 1),  # All tiles for one channel
        compression='gzip'
    )
```

### Memory-Mapped Arrays

Use memory mapping for large arrays:

```python
import numpy as np

# Save as memory-mapped file
features_mmap = np.memmap(
    'features/features.mmap',
    dtype='float32',
    mode='w+',
    shape=(n_tiles, feature_dim)
)

# Populate
for i, tile in enumerate(wsi.tiles):
    features_mmap[i] = extract_features(tile)

# Flush to disk
features_mmap.flush()

# Load without reading into memory
features_mmap = np.memmap(
    'features/features.mmap',
    dtype='float32',
    mode='r',
    shape=(n_tiles, feature_dim)
)

# Access subset efficiently
subset = features_mmap[1000:2000]  # Only loads requested rows
```

## Best Practices

1. **Use HDF5 for processed data:** Save preprocessed tiles and features to HDF5 for fast access

2. **Separate raw and processed data:** Keep original slides separate from processed outputs

3. **Maintain metadata:** Track slide provenance, processing parameters, and clinical annotations

4. **Implement checksums:** Validate data integrity, especially after transfers

5. **Version datasets:** Use DVC or similar tools to version large datasets

6. **Optimize storage:** Balance compression level with I/O performance

7. **Organize by cohort:** Structure directories by study cohort for clarity

8. **Regular backups:** Back up both data and metadata to remote storage

9. **Document processing:** Keep logs of processing steps, parameters, and versions

10. **Monitor disk usage:** Track storage consumption as datasets grow

## Common Issues and Solutions

**Issue: HDF5 files very large**
- Increase compression level: `compression_opts=9`
- Store only necessary data (avoid redundant copies)
- Use appropriate data types (uint8 for images vs. float64)

**Issue: Slow HDF5 read/write**
- Optimize chunk size for access pattern
- Reduce compression level for faster I/O
- Use SSD storage instead of HDD
- Enable parallel HDF5 with MPI

**Issue: Running out of disk space**
- Delete intermediate files after processing
- Compress inactive datasets
- Move old data to archival storage
- Use cloud storage for less-accessed data

**Issue: Data corruption or loss**
- Implement regular backups
- Use RAID for redundancy
- Validate checksums after transfers
- Use version control (DVC)

## Additional Resources

- **HDF5 Documentation:** https://www.hdfgroup.org/solutions/hdf5/
- **h5py:** https://docs.h5py.org/
- **DVC (Data Version Control):** https://dvc.org/
- **Dask:** https://docs.dask.org/
- **PathML Data Management API:** https://pathml.readthedocs.io/en/latest/api_data_reference.html
