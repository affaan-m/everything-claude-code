# Tile Extraction

## Overview

Tile extraction is the process of cropping smaller, manageable regions from large whole slide images. Histolab provides three main extraction strategies, each suited for different analysis needs. All tilers share common parameters and provide methods for previewing and extracting tiles.

## Common Parameters

All tiler classes accept these parameters:

```python
tile_size: tuple = (512, 512)           # Tile dimensions in pixels (width, height)
level: int = 0                          # Pyramid level for extraction (0=highest resolution)
check_tissue: bool = True               # Filter tiles by tissue content
tissue_percent: float = 80.0            # Minimum tissue coverage (0-100)
pixel_overlap: int = 0                  # Overlap between adjacent tiles (GridTiler only)
prefix: str = ""                        # Prefix for saved tile filenames
suffix: str = ".png"                    # File extension for saved tiles
extraction_mask: BinaryMask = BiggestTissueBoxMask()  # Mask defining extraction region
```

## RandomTiler

**Purpose:** Extract a fixed number of randomly positioned tiles from tissue regions.

```python
from histolab.tiler import RandomTiler

random_tiler = RandomTiler(
    tile_size=(512, 512),
    n_tiles=100,                # Number of random tiles to extract
    level=0,
    seed=42,                    # Random seed for reproducibility
    check_tissue=True,
    tissue_percent=80.0
)

# Extract tiles
random_tiler.extract(slide, extraction_mask=TissueMask())
```

**Key Parameters:**
- `n_tiles`: Number of random tiles to extract
- `seed`: Random seed for reproducible tile selection
- `max_iter`: Maximum attempts to find valid tiles (default 1000)

**Use cases:**
- Exploratory analysis of slide content
- Sampling diverse regions for training data
- Quick assessment of tissue characteristics
- Balanced dataset creation from multiple slides

**Advantages:**
- Computationally efficient
- Good for sampling diverse tissue morphologies
- Reproducible with seed parameter
- Fast execution

**Limitations:**
- May miss rare tissue patterns
- No guarantee of coverage
- Random distribution may not capture structured features

## GridTiler

**Purpose:** Extract tiles systematically across tissue regions following a grid pattern.

```python
from histolab.tiler import GridTiler

grid_tiler = GridTiler(
    tile_size=(512, 512),
    level=0,
    check_tissue=True,
    tissue_percent=80.0,
    pixel_overlap=0             # Overlap in pixels between adjacent tiles
)

# Extract tiles
grid_tiler.extract(slide)
```

**Key Parameters:**
- `pixel_overlap`: Number of overlapping pixels between adjacent tiles
  - `pixel_overlap=0`: Non-overlapping tiles
  - `pixel_overlap=128`: 128-pixel overlap on each side
  - Can be used for sliding window approaches

**Use cases:**
- Comprehensive slide coverage
- Spatial analysis requiring positional information
- Image reconstruction from tiles
- Semantic segmentation tasks
- Region-based analysis

**Advantages:**
- Complete tissue coverage
- Preserves spatial relationships
- Predictable tile positions
- Suitable for whole-slide analysis

**Limitations:**
- Computationally intensive for large slides
- May generate many background-heavy tiles (mitigated by `check_tissue`)
- Larger output datasets

**Grid Pattern:**
```
[Tile 1][Tile 2][Tile 3]
[Tile 4][Tile 5][Tile 6]
[Tile 7][Tile 8][Tile 9]
```

With `pixel_overlap=64`:
```
[Tile 1-overlap-Tile 2-overlap-Tile 3]
[    overlap       overlap       overlap]
[Tile 4-overlap-Tile 5-overlap-Tile 6]
```

## ScoreTiler

**Purpose:** Extract top-ranked tiles based on custom scoring functions.

```python
from histolab.tiler import ScoreTiler
from histolab.scorer import NucleiScorer

score_tiler = ScoreTiler(
    tile_size=(512, 512),
    n_tiles=50,                 # Number of top-scoring tiles to extract
    level=0,
    scorer=NucleiScorer(),      # Scoring function
    check_tissue=True
)

# Extract top-scoring tiles
score_tiler.extract(slide)
```

**Key Parameters:**
- `n_tiles`: Number of top-scoring tiles to extract
- `scorer`: Scoring function (e.g., `NucleiScorer`, `CellularityScorer`, custom scorer)

**Use cases:**
- Extracting most informative regions
- Prioritizing tiles with specific features (nuclei, cells, etc.)
- Quality-based tile selection
- Focusing on diagnostically relevant areas
- Training data curation

**Advantages:**
- Focuses on most informative tiles
- Reduces dataset size while maintaining quality
- Customizable with different scorers
- Efficient for targeted analysis

**Limitations:**
- Slower than RandomTiler (must score all candidate tiles)
- Requires appropriate scorer for task
- May miss low-scoring but relevant regions

## Available Scorers

### NucleiScorer

Scores tiles based on nuclei detection and density.

```python
from histolab.scorer import NucleiScorer

nuclei_scorer = NucleiScorer()
```

**How it works:**
1. Converts tile to grayscale
2. Applies thresholding to detect nuclei
3. Counts nuclei-like structures
4. Assigns score based on nuclei density

**Best for:**
- Cell-rich tissue regions
- Tumor detection
- Mitosis analysis
- Areas with high cellular content

### CellularityScorer

Scores tiles based on overall cellular content.

```python
from histolab.scorer import CellularityScorer

cellularity_scorer = CellularityScorer()
```

**Best for:**
- Identifying cellular vs. stromal regions
- Tumor cellularity assessment
- Separating dense from sparse tissue areas

### Custom Scorers

Create custom scoring functions for specific needs:

```python
from histolab.scorer import Scorer
import numpy as np

class ColorVarianceScorer(Scorer):
    def __call__(self, tile):
        """Score tiles based on color variance."""
        tile_array = np.array(tile.image)
        # Calculate color variance
        variance = np.var(tile_array, axis=(0, 1)).sum()
        return variance

# Use custom scorer
variance_scorer = ColorVarianceScorer()
score_tiler = ScoreTiler(
    tile_size=(512, 512),
    n_tiles=30,
    scorer=variance_scorer
)
```

## Tile Preview with locate_tiles()

Preview tile locations before extraction to validate tiler configuration:

```python
# Preview random tile locations
random_tiler.locate_tiles(
    slide=slide,
    extraction_mask=TissueMask(),
    n_tiles=20  # Number of tiles to preview (for RandomTiler)
)
```

This displays the slide thumbnail with colored rectangles indicating tile positions.

## Extraction Workflow

### Basic Extraction

```python
from histolab.slide import Slide
from histolab.tiler import RandomTiler

# Load slide
slide = Slide("slide.svs", processed_path="output/tiles/")

# Configure tiler
tiler = RandomTiler(
    tile_size=(512, 512),
    n_tiles=100,
    level=0,
    seed=42
)

# Extract tiles (saved to processed_path)
tiler.extract(slide)
```

### Extraction with Logging

```python
import logging

# Enable logging
logging.basicConfig(level=logging.INFO)

# Extract tiles with progress information
tiler.extract(slide)
# Output: INFO: Tile 1/100 saved...
# Output: INFO: Tile 2/100 saved...
```

### Extraction with Report

```python
# Generate CSV report with tile information
score_tiler = ScoreTiler(
    tile_size=(512, 512),
    n_tiles=50,
    scorer=NucleiScorer()
)

# Extract and save report
score_tiler.extract(slide, report_path="tiles_report.csv")

# Report contains: tile name, coordinates, score, tissue percentage
```

Report format:
```csv
tile_name,x_coord,y_coord,level,score,tissue_percent
tile_001.png,10240,5120,0,0.89,95.2
tile_002.png,15360,7680,0,0.85,91.7
...
```

## Advanced Extraction Patterns

### Multi-Level Extraction

Extract tiles at different magnification levels:

```python
# High resolution tiles (level 0)
high_res_tiler = RandomTiler(tile_size=(512, 512), n_tiles=50, level=0)
high_res_tiler.extract(slide)

# Medium resolution tiles (level 1)
med_res_tiler = RandomTiler(tile_size=(512, 512), n_tiles=50, level=1)
med_res_tiler.extract(slide)

# Low resolution tiles (level 2)
low_res_tiler = RandomTiler(tile_size=(512, 512), n_tiles=50, level=2)
low_res_tiler.extract(slide)
```

### Hierarchical Extraction

Extract at multiple scales from same locations:

```python
# Extract random locations at level 0
random_tiler_l0 = RandomTiler(
    tile_size=(512, 512),
    n_tiles=30,
    level=0,
    seed=42,
    prefix="level0_"
)
random_tiler_l0.extract(slide)

# Extract same locations at level 1 (use same seed)
random_tiler_l1 = RandomTiler(
    tile_size=(512, 512),
    n_tiles=30,
    level=1,
    seed=42,
    prefix="level1_"
)
random_tiler_l1.extract(slide)
```

### Custom Tile Filtering

Apply additional filtering after extraction:

```python
from PIL import Image
import numpy as np
from pathlib import Path

def filter_blurry_tiles(tile_dir, threshold=100):
    """Remove blurry tiles using Laplacian variance."""
    for tile_path in Path(tile_dir).glob("*.png"):
        img = Image.open(tile_path)
        gray = np.array(img.convert('L'))
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()

        if laplacian_var < threshold:
            tile_path.unlink()  # Remove blurry tile
            print(f"Removed blurry tile: {tile_path.name}")

# Use after extraction
tiler.extract(slide)
filter_blurry_tiles("output/tiles/")
```

## Best Practices

1. **Preview before extraction**: Always use `locate_tiles()` to verify tile placement
2. **Use appropriate level**: Match extraction level to analysis resolution requirements
3. **Set tissue_percent threshold**: Adjust based on staining and tissue type (70-90% typical)
4. **Choose right tiler**:
   - RandomTiler for sampling and exploration
   - GridTiler for comprehensive coverage
   - ScoreTiler for targeted, quality-driven extraction
5. **Enable logging**: Monitor extraction progress for large datasets
6. **Use seeds for reproducibility**: Set random seeds in RandomTiler
7. **Consider storage**: GridTiler can generate thousands of tiles per slide
8. **Validate tile quality**: Check extracted tiles for artifacts, blur, or focus issues

## Performance Optimization

1. **Extract at appropriate level**: Lower levels (1, 2) extract faster
2. **Adjust tissue_percent**: Higher thresholds reduce invalid tile attempts
3. **Use BiggestTissueBoxMask**: Faster than TissueMask for single tissue sections
4. **Limit n_tiles**: For RandomTiler and ScoreTiler
5. **Use pixel_overlap=0**: For non-overlapping GridTiler extraction

## Troubleshooting

### Issue: No tiles extracted
**Solutions:**
- Lower `tissue_percent` threshold
- Verify slide contains tissue (check thumbnail)
- Ensure extraction_mask captures tissue regions
- Check that tile_size is appropriate for slide resolution

### Issue: Many background tiles extracted
**Solutions:**
- Enable `check_tissue=True`
- Increase `tissue_percent` threshold
- Use appropriate mask (TissueMask vs. BiggestTissueBoxMask)

### Issue: Extraction is very slow
**Solutions:**
- Extract at lower pyramid level (level=1 or 2)
- Reduce `n_tiles` for RandomTiler/ScoreTiler
- Use RandomTiler instead of GridTiler for sampling
- Use BiggestTissueBoxMask instead of TissueMask

### Issue: Tiles have too much overlap (GridTiler)
**Solutions:**
- Set `pixel_overlap=0` for non-overlapping tiles
- Reduce `pixel_overlap` value
