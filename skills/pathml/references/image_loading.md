# Image Loading & Formats

## Overview

PathML provides comprehensive support for loading whole-slide images (WSI) from 160+ proprietary medical imaging formats. The framework abstracts vendor-specific complexities through unified slide classes and interfaces, enabling seamless access to image pyramids, metadata, and regions of interest across different file formats.

## Supported Formats

PathML supports the following slide formats:

### Brightfield Microscopy Formats
- **Aperio SVS** (`.svs`) - Leica Biosystems
- **Hamamatsu NDPI** (`.ndpi`) - Hamamatsu Photonics
- **Leica SCN** (`.scn`) - Leica Biosystems
- **Zeiss ZVI** (`.zvi`) - Carl Zeiss
- **3DHISTECH** (`.mrxs`) - 3DHISTECH Ltd.
- **Ventana BIF** (`.bif`) - Roche Ventana
- **Generic tiled TIFF** (`.tif`, `.tiff`)

### Medical Imaging Standards
- **DICOM** (`.dcm`) - Digital Imaging and Communications in Medicine
- **OME-TIFF** (`.ome.tif`, `.ome.tiff`) - Open Microscopy Environment

### Multiparametric Imaging
- **CODEX** - Spatial proteomics imaging
- **Vectra** (`.qptiff`) - Multiplex immunofluorescence
- **MERFISH** - Multiplexed error-robust FISH

PathML leverages OpenSlide and other specialized libraries to handle format-specific nuances automatically.

## Core Classes for Loading Images

### SlideData

`SlideData` is the fundamental class for representing whole-slide images in PathML.

**Loading from file:**
```python
from pathml.core import SlideData

# Load a whole-slide image
wsi = SlideData.from_slide("path/to/slide.svs")

# Load with specific backend
wsi = SlideData.from_slide("path/to/slide.svs", backend="openslide")

# Load from OME-TIFF
wsi = SlideData.from_slide("path/to/slide.ome.tiff", backend="bioformats")
```

**Key attributes:**
- `wsi.slide` - Backend slide object (OpenSlide, BioFormats, etc.)
- `wsi.tiles` - Collection of image tiles
- `wsi.metadata` - Slide metadata dictionary
- `wsi.level_dimensions` - Image pyramid level dimensions
- `wsi.level_downsamples` - Downsample factors for each pyramid level

**Methods:**
- `wsi.generate_tiles()` - Generate tiles from the slide
- `wsi.read_region()` - Read a specific region at a given level
- `wsi.get_thumbnail()` - Get a thumbnail image

### SlideType

`SlideType` is an enumeration defining supported slide backends:

```python
from pathml.core import SlideType

# Available backends
SlideType.OPENSLIDE  # For most WSI formats (SVS, NDPI, etc.)
SlideType.BIOFORMATS  # For OME-TIFF and other formats
SlideType.DICOM  # For DICOM WSI
SlideType.VectraQPTIFF  # For Vectra multiplex IF
```

### Specialized Slide Classes

PathML provides specialized slide classes for specific imaging modalities:

**CODEXSlide:**
```python
from pathml.core import CODEXSlide

# Load CODEX spatial proteomics data
codex_slide = CODEXSlide(
    path="path/to/codex_dir",
    stain="IF",  # Immunofluorescence
    backend="bioformats"
)
```

**VectraSlide:**
```python
from pathml.core import types

# Load Vectra multiplex IF data
vectra_slide = SlideData.from_slide(
    "path/to/vectra.qptiff",
    backend=SlideType.VectraQPTIFF
)
```

**MultiparametricSlide:**
```python
from pathml.core import MultiparametricSlide

# Generic multiparametric imaging
mp_slide = MultiparametricSlide(path="path/to/multiparametric_data")
```

## Loading Strategies

### Tile-Based Loading

For large WSI files, tile-based loading enables memory-efficient processing:

```python
from pathml.core import SlideData

# Load slide
wsi = SlideData.from_slide("path/to/slide.svs")

# Generate tiles at specific magnification level
wsi.generate_tiles(
    level=0,  # Pyramid level (0 = highest resolution)
    tile_size=256,  # Tile dimensions in pixels
    stride=256,  # Spacing between tiles (256 = no overlap)
    pad=False  # Whether to pad edge tiles
)

# Iterate over tiles
for tile in wsi.tiles:
    image = tile.image  # numpy array
    coords = tile.coords  # (x, y) coordinates
    # Process tile...
```

**Overlapping tiles:**
```python
# Generate tiles with 50% overlap
wsi.generate_tiles(
    level=0,
    tile_size=256,
    stride=128  # 50% overlap
)
```

### Region-Based Loading

Extract specific regions of interest directly:

```python
# Read region at specific location and level
region = wsi.read_region(
    location=(10000, 15000),  # (x, y) in level 0 coordinates
    level=1,  # Pyramid level
    size=(512, 512)  # Width, height in pixels
)

# Returns numpy array
```

### Pyramid Level Selection

Whole-slide images are stored in multi-resolution pyramids. Select the appropriate level based on desired magnification:

```python
# Inspect available levels
print(wsi.level_dimensions)  # [(width0, height0), (width1, height1), ...]
print(wsi.level_downsamples)  # [1.0, 4.0, 16.0, ...]

# Load at lower resolution for faster processing
wsi.generate_tiles(level=2, tile_size=256)  # Use level 2 (16x downsampled)
```

**Common pyramid levels:**
- Level 0: Full resolution (e.g., 40x magnification)
- Level 1: 4x downsampled (e.g., 10x magnification)
- Level 2: 16x downsampled (e.g., 2.5x magnification)
- Level 3: 64x downsampled (thumbnail)

### Thumbnail Loading

Generate low-resolution thumbnails for visualization and quality control:

```python
# Get thumbnail
thumbnail = wsi.get_thumbnail(size=(1024, 1024))

# Display with matplotlib
import matplotlib.pyplot as plt
plt.imshow(thumbnail)
plt.axis('off')
plt.show()
```

## Batch Loading with SlideDataset

Process multiple slides efficiently using `SlideDataset`:

```python
from pathml.core import SlideDataset
import glob

# Create dataset from multiple slides
slide_paths = glob.glob("data/*.svs")
dataset = SlideDataset(
    slide_paths,
    tile_size=256,
    stride=256,
    level=0
)

# Iterate over all tiles from all slides
for tile in dataset:
    image = tile.image
    slide_id = tile.slide_id
    # Process tile...
```

**With preprocessing pipeline:**
```python
from pathml.preprocessing import Pipeline, StainNormalizationHE

# Create pipeline
pipeline = Pipeline([
    StainNormalizationHE(target='normalize')
])

# Apply to entire dataset
dataset = SlideDataset(slide_paths)
dataset.run(pipeline, distributed=True, n_workers=8)
```

## Metadata Access

Extract slide metadata including acquisition parameters, magnification, and vendor-specific information:

```python
# Access metadata
metadata = wsi.metadata

# Common metadata fields
print(metadata.get('openslide.objective-power'))  # Magnification
print(metadata.get('openslide.mpp-x'))  # Microns per pixel X
print(metadata.get('openslide.mpp-y'))  # Microns per pixel Y
print(metadata.get('openslide.vendor'))  # Scanner vendor

# Slide dimensions
print(wsi.level_dimensions[0])  # (width, height) at level 0
```

## Working with DICOM Slides

PathML supports DICOM WSI through specialized handling:

```python
from pathml.core import SlideData, SlideType

# Load DICOM WSI
dicom_slide = SlideData.from_slide(
    "path/to/slide.dcm",
    backend=SlideType.DICOM
)

# DICOM-specific metadata
print(dicom_slide.metadata.get('PatientID'))
print(dicom_slide.metadata.get('StudyDate'))
```

## Working with OME-TIFF

OME-TIFF provides an open standard for multi-dimensional imaging:

```python
from pathml.core import SlideData

# Load OME-TIFF
ome_slide = SlideData.from_slide(
    "path/to/slide.ome.tiff",
    backend="bioformats"
)

# Access channel information for multi-channel images
n_channels = ome_slide.shape[2]  # Number of channels
```

## Performance Considerations

### Memory Management

For large WSI files (often >1GB), use tile-based loading to avoid memory exhaustion:

```python
# Efficient: Tile-based processing
wsi.generate_tiles(level=1, tile_size=256)
for tile in wsi.tiles:
    process_tile(tile)  # Process one tile at a time

# Inefficient: Loading entire slide into memory
full_image = wsi.read_region((0, 0), level=0, wsi.level_dimensions[0])  # May crash
```

### Distributed Processing

Use Dask for parallel processing across multiple workers:

```python
from pathml.core import SlideDataset
from dask.distributed import Client

# Start Dask client
client = Client(n_workers=8, threads_per_worker=2)

# Process dataset in parallel
dataset = SlideDataset(slide_paths)
dataset.run(pipeline, distributed=True, client=client)
```

### Level Selection

Balance resolution and performance by selecting appropriate pyramid levels:

- **Level 0:** Use for final analysis requiring maximum detail
- **Level 1-2:** Use for most preprocessing and model training
- **Level 3+:** Use for thumbnails, quality control, and rapid exploration

## Common Issues and Solutions

**Issue: Slide fails to load**
- Verify file format is supported
- Check file permissions and path
- Try different backend: `backend="bioformats"` or `backend="openslide"`

**Issue: Out of memory errors**
- Use tile-based loading instead of full-slide loading
- Process at lower pyramid level (e.g., level=1 or level=2)
- Reduce tile_size parameter
- Enable distributed processing with Dask

**Issue: Color inconsistencies across slides**
- Apply stain normalization preprocessing (see `preprocessing.md`)
- Check scanner metadata for calibration information
- Use `StainNormalizationHE` transform in preprocessing pipeline

**Issue: Metadata missing or incorrect**
- Different vendors store metadata in different locations
- Use `wsi.metadata` to inspect available fields
- Some formats may have limited metadata support

## Best Practices

1. **Always inspect pyramid structure** before processing: Check `level_dimensions` and `level_downsamples` to understand available resolutions

2. **Use appropriate pyramid levels**: Process at level 1-2 for most tasks; reserve level 0 for final high-resolution analysis

3. **Tile with overlap** for segmentation tasks: Use stride < tile_size to avoid edge artifacts

4. **Verify magnification consistency**: Check `openslide.objective-power` metadata when combining slides from different sources

5. **Handle vendor-specific formats**: Use specialized slide classes (CODEXSlide, VectraSlide) for multiparametric data

6. **Implement quality control**: Generate thumbnails and inspect for artifacts before processing

7. **Use distributed processing** for large datasets: Leverage Dask for parallel processing across multiple workers

## Example Workflows

### Loading and Inspecting a New Slide

```python
from pathml.core import SlideData
import matplotlib.pyplot as plt

# Load slide
wsi = SlideData.from_slide("path/to/slide.svs")

# Inspect properties
print(f"Dimensions: {wsi.level_dimensions}")
print(f"Downsamples: {wsi.level_downsamples}")
print(f"Magnification: {wsi.metadata.get('openslide.objective-power')}")

# Generate thumbnail for QC
thumbnail = wsi.get_thumbnail(size=(1024, 1024))
plt.imshow(thumbnail)
plt.title(f"Slide: {wsi.name}")
plt.axis('off')
plt.show()
```

### Processing Multiple Slides

```python
from pathml.core import SlideDataset
from pathml.preprocessing import Pipeline, TissueDetectionHE
import glob

# Find all slides
slide_paths = glob.glob("data/slides/*.svs")

# Create pipeline
pipeline = Pipeline([TissueDetectionHE()])

# Process all slides
dataset = SlideDataset(
    slide_paths,
    tile_size=512,
    stride=512,
    level=1
)

# Run pipeline with distributed processing
dataset.run(pipeline, distributed=True, n_workers=8)

# Save processed data
dataset.to_hdf5("processed_dataset.h5")
```

### Loading CODEX Multiparametric Data

```python
from pathml.core import CODEXSlide
from pathml.preprocessing import Pipeline, CollapseRunsCODEX, SegmentMIF

# Load CODEX slide
codex = CODEXSlide("path/to/codex_dir", stain="IF")

# Create CODEX-specific pipeline
pipeline = Pipeline([
    CollapseRunsCODEX(z_slice=2),  # Select z-slice
    SegmentMIF(
        nuclear_channel='DAPI',
        cytoplasm_channel='CD45',
        model='mesmer'
    )
])

# Process
pipeline.run(codex)
```

## Additional Resources

- **PathML Documentation:** https://pathml.readthedocs.io/
- **OpenSlide:** https://openslide.org/ (underlying library for WSI formats)
- **Bio-Formats:** https://www.openmicroscopy.org/bio-formats/ (alternative backend)
- **DICOM Standard:** https://www.dicomstandard.org/
