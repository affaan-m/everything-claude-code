---
name: histolab
description: Lightweight WSI tile extraction and preprocessing. Use for basic slide processing tissue detection, tile extraction, stain normalization for H&E images. Best for simple pipelines, dataset preparation, quick tile-based analysis. For advanced spatial proteomics, multiplexed imaging, or deep learning pipelines use pathml.
license: Apache-2.0 license
metadata:
    skill-author: K-Dense Inc.
---

# Histolab

## Overview

Histolab is a Python library for processing whole slide images (WSI) in digital pathology. It automates tissue detection, extracts informative tiles from gigapixel images, and prepares datasets for deep learning pipelines. The library handles multiple WSI formats, implements sophisticated tissue segmentation, and provides flexible tile extraction strategies.

## Installation

```bash
uv pip install histolab
```

## Quick Start

Basic workflow for extracting tiles from a whole slide image:

```python
from histolab.slide import Slide
from histolab.tiler import RandomTiler

# Load slide
slide = Slide("slide.svs", processed_path="output/")

# Configure tiler
tiler = RandomTiler(
    tile_size=(512, 512),
    n_tiles=100,
    level=0,
    seed=42
)

# Preview tile locations
tiler.locate_tiles(slide, n_tiles=20)

# Extract tiles
tiler.extract(slide)
```

## Core Capabilities

### 1. Slide Management

Load, inspect, and work with whole slide images in various formats.

**Common operations:**
- Loading WSI files (SVS, TIFF, NDPI, etc.)
- Accessing slide metadata (dimensions, magnification, properties)
- Generating thumbnails for visualization
- Working with pyramidal image structures
- Extracting regions at specific coordinates

**Key classes:** `Slide`

**Reference:** `references/slide_management.md` contains comprehensive documentation on:
- Slide initialization and configuration
- Built-in sample datasets (prostate, ovarian, breast, heart, kidney tissues)
- Accessing slide properties and metadata
- Thumbnail generation and visualization
- Working with pyramid levels
- Multi-slide processing workflows

**Example workflow:**
```python
from histolab.slide import Slide
from histolab.data import prostate_tissue

# Load sample data
prostate_svs, prostate_path = prostate_tissue()

# Initialize slide
slide = Slide(prostate_path, processed_path="output/")

# Inspect properties
print(f"Dimensions: {slide.dimensions}")
print(f"Levels: {slide.levels}")
print(f"Magnification: {slide.properties.get('openslide.objective-power')}")

# Save thumbnail
slide.save_thumbnail()
```

### 2. Tissue Detection and Masks

Automatically identify tissue regions and filter background/artifacts.

**Common operations:**
- Creating binary tissue masks
- Detecting largest tissue region
- Excluding background and artifacts
- Custom tissue segmentation
- Removing pen annotations

**Key classes:** `TissueMask`, `BiggestTissueBoxMask`, `BinaryMask`

**Reference:** `references/tissue_masks.md` contains comprehensive documentation on:
- TissueMask: Segments all tissue regions using automated filters
- BiggestTissueBoxMask: Returns bounding box of largest tissue region (default)
- BinaryMask: Base class for custom mask implementations
- Visualizing masks with `locate_mask()`
- Creating custom rectangular and annotation-exclusion masks
- Mask integration with tile extraction
- Best practices and troubleshooting

**Example workflow:**
```python
from histolab.masks import TissueMask, BiggestTissueBoxMask

# Create tissue mask for all tissue regions
tissue_mask = TissueMask()

# Visualize mask on slide
slide.locate_mask(tissue_mask)

# Get mask array
mask_array = tissue_mask(slide)

# Use largest tissue region (default for most extractors)
biggest_mask = BiggestTissueBoxMask()
```

**When to use each mask:**
- `TissueMask`: Multiple tissue sections, comprehensive analysis
- `BiggestTissueBoxMask`: Single main tissue section, exclude artifacts (default)
- Custom `BinaryMask`: Specific ROI, exclude annotations, custom segmentation

### 3. Tile Extraction

Extract smaller regions from large WSI using different strategies.

**Three extraction strategies:**

**RandomTiler:** Extract fixed number of randomly positioned tiles
- Best for: Sampling diverse regions, exploratory analysis, training data
- Key parameters: `n_tiles`, `seed` for reproducibility

**GridTiler:** Systematically extract tiles across tissue in grid pattern
- Best for: Complete coverage, spatial analysis, reconstruction
- Key parameters: `pixel_overlap` for sliding windows

**ScoreTiler:** Extract top-ranked tiles based on scoring functions
- Best for: Most informative regions, quality-driven selection
- Key parameters: `scorer` (NucleiScorer, CellularityScorer, custom)

**Common parameters:**
- `tile_size`: Tile dimensions (e.g., (512, 512))
- `level`: Pyramid level for extraction (0 = highest resolution)
- `check_tissue`: Filter tiles by tissue content
- `tissue_percent`: Minimum tissue coverage (default 80%)
- `extraction_mask`: Mask defining extraction region

**Reference:** `references/tile_extraction.md` contains comprehensive documentation on:
- Detailed explanation of each tiler strategy
- Available scorers (NucleiScorer, CellularityScorer, custom)
- Tile preview with `locate_tiles()`
- Extraction workflows and reporting
- Advanced patterns (multi-level, hierarchical extraction)
- Performance optimization and troubleshooting

**Example workflows:**

```python
from histolab.tiler import RandomTiler, GridTiler, ScoreTiler
from histolab.scorer import NucleiScorer

# Random sampling (fast, diverse)
random_tiler = RandomTiler(
    tile_size=(512, 512),
    n_tiles=100,
    level=0,
    seed=42,
    check_tissue=True,
    tissue_percent=80.0
)
random_tiler.extract(slide)

# Grid coverage (comprehensive)
grid_tiler = GridTiler(
    tile_size=(512, 512),
    level=0,
    pixel_overlap=0,
    check_tissue=True
)
grid_tiler.extract(slide)

# Score-based selection (most informative)
score_tiler = ScoreTiler(
    tile_size=(512, 512),
    n_tiles=50,
    scorer=NucleiScorer(),
    level=0
)
score_tiler.extract(slide, report_path="tiles_report.csv")
```

**Always preview before extracting:**
```python
# Preview tile locations on thumbnail
tiler.locate_tiles(slide, n_tiles=20)
```

### 4. Filters and Preprocessing

Apply image processing filters for tissue detection, quality control, and preprocessing.

**Filter categories:**

**Image Filters:** Color space conversions, thresholding, contrast enhancement
- `RgbToGrayscale`, `RgbToHsv`, `RgbToHed`
- `OtsuThreshold`, `AdaptiveThreshold`
- `StretchContrast`, `HistogramEqualization`

**Morphological Filters:** Structural operations on binary images
- `BinaryDilation`, `BinaryErosion`
- `BinaryOpening`, `BinaryClosing`
- `RemoveSmallObjects`, `RemoveSmallHoles`

**Composition:** Chain multiple filters together
- `Compose`: Create filter pipelines

**Reference:** `references/filters_preprocessing.md` contains comprehensive documentation on:
- Detailed explanation of each filter type
- Filter composition and chaining
- Common preprocessing pipelines (tissue detection, pen removal, nuclei enhancement)
- Applying filters to tiles
- Custom mask filters
- Quality control filters (blur detection, tissue coverage)
- Best practices and troubleshooting

**Example workflows:**

```python
from histolab.filters.compositions import Compose
from histolab.filters.image_filters import RgbToGrayscale, OtsuThreshold
from histolab.filters.morphological_filters import (
    BinaryDilation, RemoveSmallHoles, RemoveSmallObjects
)

# Standard tissue detection pipeline
tissue_detection = Compose([
    RgbToGrayscale(),
    OtsuThreshold(),
    BinaryDilation(disk_size=5),
    RemoveSmallHoles(area_threshold=1000),
    RemoveSmallObjects(area_threshold=500)
])

# Use with custom mask
from histolab.masks import TissueMask
custom_mask = TissueMask(filters=tissue_detection)

# Apply filters to tile
from histolab.tile import Tile
filtered_tile = tile.apply_filters(tissue_detection)
```

### 5. Visualization

Visualize slides, masks, tile locations, and extraction quality.

**Common visualization tasks:**
- Displaying slide thumbnails
- Visualizing tissue masks
- Previewing tile locations
- Assessing tile quality
- Creating reports and figures

**Reference:** `references/visualization.md` contains comprehensive documentation on:
- Slide thumbnail display and saving
- Mask visualization with `locate_mask()`
- Tile location preview with `locate_tiles()`
- Displaying extracted tiles and mosaics
- Quality assessment (score distributions, top vs bottom tiles)
- Multi-slide visualization
- Filter effect visualization
- Exporting high-resolution figures and PDF reports
- Interactive visualization in Jupyter notebooks

**Example workflows:**

```python
import matplotlib.pyplot as plt
from histolab.masks import TissueMask

# Display slide thumbnail
plt.figure(figsize=(10, 10))
plt.imshow(slide.thumbnail)
plt.title(f"Slide: {slide.name}")
plt.axis('off')
plt.show()

# Visualize tissue mask
tissue_mask = TissueMask()
slide.locate_mask(tissue_mask)

# Preview tile locations
tiler = RandomTiler(tile_size=(512, 512), n_tiles=50)
tiler.locate_tiles(slide, n_tiles=20)

# Display extracted tiles in grid
from pathlib import Path
from PIL import Image

tile_paths = list(Path("output/tiles/").glob("*.png"))[:16]
fig, axes = plt.subplots(4, 4, figsize=(12, 12))
axes = axes.ravel()

for idx, tile_path in enumerate(tile_paths):
    tile_img = Image.open(tile_path)
    axes[idx].imshow(tile_img)
    axes[idx].set_title(tile_path.stem, fontsize=8)
    axes[idx].axis('off')

plt.tight_layout()
plt.show()
```

## Typical Workflows

### Workflow 1: Exploratory Tile Extraction

Quick sampling of diverse tissue regions for initial analysis.

```python
from histolab.slide import Slide
from histolab.tiler import RandomTiler
import logging

# Enable logging for progress tracking
logging.basicConfig(level=logging.INFO)

# Load slide
slide = Slide("slide.svs", processed_path="output/random_tiles/")

# Inspect slide
print(f"Dimensions: {slide.dimensions}")
print(f"Levels: {slide.levels}")
slide.save_thumbnail()

# Configure random tiler
random_tiler = RandomTiler(
    tile_size=(512, 512),
    n_tiles=100,
    level=0,
    seed=42,
    check_tissue=True,
    tissue_percent=80.0
)

# Preview locations
random_tiler.locate_tiles(slide, n_tiles=20)

# Extract tiles
random_tiler.extract(slide)
```

### Workflow 2: Comprehensive Grid Extraction

Complete tissue coverage for whole-slide analysis.

```python
from histolab.slide import Slide
from histolab.tiler import GridTiler
from histolab.masks import TissueMask

# Load slide
slide = Slide("slide.svs", processed_path="output/grid_tiles/")

# Use TissueMask for all tissue sections
tissue_mask = TissueMask()
slide.locate_mask(tissue_mask)

# Configure grid tiler
grid_tiler = GridTiler(
    tile_size=(512, 512),
    level=1,  # Use level 1 for faster extraction
    pixel_overlap=0,
    check_tissue=True,
    tissue_percent=70.0
)

# Preview grid
grid_tiler.locate_tiles(slide)

# Extract all tiles
grid_tiler.extract(slide, extraction_mask=tissue_mask)
```

### Workflow 3: Quality-Driven Tile Selection

Extract most informative tiles based on nuclei density.

```python
from histolab.slide import Slide
from histolab.tiler import ScoreTiler
from histolab.scorer import NucleiScorer
import pandas as pd
import matplotlib.pyplot as plt

# Load slide
slide = Slide("slide.svs", processed_path="output/scored_tiles/")

# Configure score tiler
score_tiler = ScoreTiler(
    tile_size=(512, 512),
    n_tiles=50,
    level=0,
    scorer=NucleiScorer(),
    check_tissue=True
)

# Preview top tiles
score_tiler.locate_tiles(slide, n_tiles=15)

# Extract with report
score_tiler.extract(slide, report_path="tiles_report.csv")

# Analyze scores
report_df = pd.read_csv("tiles_report.csv")
plt.hist(report_df['score'], bins=20, edgecolor='black')
plt.xlabel('Tile Score')
plt.ylabel('Frequency')
plt.title('Distribution of Tile Scores')
plt.show()
```

### Workflow 4: Multi-Slide Processing Pipeline

Process entire slide collection with consistent parameters.

```python
from pathlib import Path
from histolab.slide import Slide
from histolab.tiler import RandomTiler
import logging

logging.basicConfig(level=logging.INFO)

# Configure tiler once
tiler = RandomTiler(
    tile_size=(512, 512),
    n_tiles=50,
    level=0,
    seed=42,
    check_tissue=True
)

# Process all slides
slide_dir = Path("slides/")
output_base = Path("output/")

for slide_path in slide_dir.glob("*.svs"):
    print(f"\nProcessing: {slide_path.name}")

    # Create slide-specific output directory
    output_dir = output_base / slide_path.stem
    output_dir.mkdir(parents=True, exist_ok=True)

    # Load and process slide
    slide = Slide(slide_path, processed_path=output_dir)

    # Save thumbnail for review
    slide.save_thumbnail()

    # Extract tiles
    tiler.extract(slide)

    print(f"Completed: {slide_path.name}")
```

### Workflow 5: Custom Tissue Detection and Filtering

Handle slides with artifacts, annotations, or unusual staining.

```python
from histolab.slide import Slide
from histolab.masks import TissueMask
from histolab.tiler import RandomTiler
from histolab.filters.compositions import Compose
from histolab.filters.image_filters import RgbToGrayscale, OtsuThreshold
from histolab.filters.morphological_filters import (
    BinaryDilation, RemoveSmallObjects, RemoveSmallHoles
)

# Define custom filter pipeline for aggressive artifact removal
aggressive_filters = Compose([
    RgbToGrayscale(),
    OtsuThreshold(),
    BinaryDilation(disk_size=10),
    RemoveSmallHoles(area_threshold=5000),
    RemoveSmallObjects(area_threshold=3000)  # Remove larger artifacts
])

# Create custom mask
custom_mask = TissueMask(filters=aggressive_filters)

# Load slide and visualize mask
slide = Slide("slide.svs", processed_path="output/")
slide.locate_mask(custom_mask)

# Extract with custom mask
tiler = RandomTiler(tile_size=(512, 512), n_tiles=100)
tiler.extract(slide, extraction_mask=custom_mask)
```

## Best Practices

### Slide Loading and Inspection
1. Always inspect slide properties before processing
2. Save thumbnails for quick visual review
3. Check pyramid levels and dimensions
4. Verify tissue is present using thumbnails

### Tissue Detection
1. Preview masks with `locate_mask()` before extraction
2. Use `TissueMask` for multiple sections, `BiggestTissueBoxMask` for single sections
3. Customize filters for specific stains (H&E vs IHC)
4. Handle pen annotations with custom masks
5. Test masks on diverse slides

### Tile Extraction
1. **Always preview with `locate_tiles()` before extracting**
2. Choose appropriate tiler:
   - RandomTiler: Sampling and exploration
   - GridTiler: Complete coverage
   - ScoreTiler: Quality-driven selection
3. Set appropriate `tissue_percent` threshold (70-90% typical)
4. Use seeds for reproducibility in RandomTiler
5. Extract at appropriate pyramid level for analysis resolution
6. Enable logging for large datasets

### Performance
1. Extract at lower levels (1, 2) for faster processing
2. Use `BiggestTissueBoxMask` over `TissueMask` when appropriate
3. Adjust `tissue_percent` to reduce invalid tile attempts
4. Limit `n_tiles` for initial exploration
5. Use `pixel_overlap=0` for non-overlapping grids

### Quality Control
1. Validate tile quality (check for blur, artifacts, focus)
2. Review score distributions for ScoreTiler
3. Inspect top and bottom scoring tiles
4. Monitor tissue coverage statistics
5. Filter extracted tiles by additional quality metrics if needed

## Common Use Cases

### Training Deep Learning Models
- Extract balanced datasets using RandomTiler across multiple slides
- Use ScoreTiler with NucleiScorer to focus on cell-rich regions
- Extract at consistent resolution (level 0 or level 1)
- Generate CSV reports for tracking tile metadata

### Whole Slide Analysis
- Use GridTiler for complete tissue coverage
- Extract at multiple pyramid levels for hierarchical analysis
- Maintain spatial relationships with grid positions
- Use `pixel_overlap` for sliding window approaches

### Tissue Characterization
- Sample diverse regions with RandomTiler
- Quantify tissue coverage with masks
- Extract stain-specific information with HED decomposition
- Compare tissue patterns across slides

### Quality Assessment
- Identify optimal focus regions with ScoreTiler
- Detect artifacts using custom masks and filters
- Assess staining quality across slide collection
- Flag problematic slides for manual review

### Dataset Curation
- Use ScoreTiler to prioritize informative tiles
- Filter tiles by tissue percentage
- Generate reports with tile scores and metadata
- Create stratified datasets across slides and tissue types

## Troubleshooting

### No tiles extracted
- Lower `tissue_percent` threshold
- Verify slide contains tissue (check thumbnail)
- Ensure extraction_mask captures tissue regions
- Check tile_size is appropriate for slide resolution

### Many background tiles
- Enable `check_tissue=True`
- Increase `tissue_percent` threshold
- Use appropriate mask (TissueMask vs BiggestTissueBoxMask)
- Customize mask filters to better detect tissue

### Extraction very slow
- Extract at lower pyramid level (level=1 or 2)
- Reduce `n_tiles` for RandomTiler/ScoreTiler
- Use RandomTiler instead of GridTiler for sampling
- Use BiggestTissueBoxMask instead of TissueMask

### Tiles have artifacts
- Implement custom annotation-exclusion masks
- Adjust filter parameters for artifact removal
- Increase small object removal threshold
- Apply post-extraction quality filtering

### Inconsistent results across slides
- Use same seed for RandomTiler
- Normalize staining with preprocessing filters
- Adjust `tissue_percent` per staining quality
- Implement slide-specific mask customization

## Resources

This skill includes detailed reference documentation in the `references/` directory:

### references/slide_management.md
Comprehensive guide to loading, inspecting, and working with whole slide images:
- Slide initialization and configuration
- Built-in sample datasets
- Slide properties and metadata
- Thumbnail generation and visualization
- Working with pyramid levels
- Multi-slide processing workflows
- Best practices and common patterns

### references/tissue_masks.md
Complete documentation on tissue detection and masking:
- TissueMask, BiggestTissueBoxMask, BinaryMask classes
- How tissue detection filters work
- Customizing masks with filter chains
- Visualizing masks
- Creating custom rectangular and annotation-exclusion masks
- Integration with tile extraction
- Best practices and troubleshooting

### references/tile_extraction.md
Detailed explanation of tile extraction strategies:
- RandomTiler, GridTiler, ScoreTiler comparison
- Available scorers (NucleiScorer, CellularityScorer, custom)
- Common and strategy-specific parameters
- Tile preview with locate_tiles()
- Extraction workflows and CSV reporting
- Advanced patterns (multi-level, hierarchical)
- Performance optimization
- Troubleshooting common issues

### references/filters_preprocessing.md
Complete filter reference and preprocessing guide:
- Image filters (color conversion, thresholding, contrast)
- Morphological filters (dilation, erosion, opening, closing)
- Filter composition and chaining
- Common preprocessing pipelines
- Applying filters to tiles
- Custom mask filters
- Quality control filters
- Best practices and troubleshooting

### references/visualization.md
Comprehensive visualization guide:
- Slide thumbnail display and saving
- Mask visualization techniques
- Tile location preview
- Displaying extracted tiles and creating mosaics
- Quality assessment visualizations
- Multi-slide comparison
- Filter effect visualization
- Exporting high-resolution figures and PDFs
- Interactive visualization in Jupyter notebooks

**Usage pattern:** Reference files contain in-depth information to support workflows described in this main skill document. Load specific reference files as needed for detailed implementation guidance, troubleshooting, or advanced features.

