# Filters and Preprocessing

## Overview

Histolab provides a comprehensive set of filters for preprocessing whole slide images and tiles. Filters can be applied to images for visualization, quality control, tissue detection, and artifact removal. They are composable and can be chained together to create sophisticated preprocessing pipelines.

## Filter Categories

### Image Filters
Color space conversions, thresholding, and intensity adjustments

### Morphological Filters
Structural operations like dilation, erosion, opening, and closing

### Composition Filters
Utilities for combining multiple filters

## Image Filters

### RgbToGrayscale

Convert RGB images to grayscale.

```python
from histolab.filters.image_filters import RgbToGrayscale

gray_filter = RgbToGrayscale()
gray_image = gray_filter(rgb_image)
```

**Use cases:**
- Preprocessing for intensity-based operations
- Simplifying color complexity
- Input for morphological operations

### RgbToHsv

Convert RGB to HSV (Hue, Saturation, Value) color space.

```python
from histolab.filters.image_filters import RgbToHsv

hsv_filter = RgbToHsv()
hsv_image = hsv_filter(rgb_image)
```

**Use cases:**
- Color-based tissue segmentation
- Detecting pen markings by hue
- Separating chromatic from achromatic content

### RgbToHed

Convert RGB to HED (Hematoxylin-Eosin-DAB) color space for stain deconvolution.

```python
from histolab.filters.image_filters import RgbToHed

hed_filter = RgbToHed()
hed_image = hed_filter(rgb_image)
```

**Use cases:**
- Separating H&E stain components
- Analyzing nuclear (hematoxylin) vs. cytoplasmic (eosin) staining
- Quantifying stain intensity

### OtsuThreshold

Apply Otsu's automatic thresholding method to create binary images.

```python
from histolab.filters.image_filters import OtsuThreshold

otsu_filter = OtsuThreshold()
binary_image = otsu_filter(grayscale_image)
```

**How it works:**
- Automatically determines optimal threshold
- Separates foreground from background
- Minimizes intra-class variance

**Use cases:**
- Tissue detection
- Nuclei segmentation
- Binary mask creation

### AdaptiveThreshold

Apply adaptive thresholding for local intensity variations.

```python
from histolab.filters.image_filters import AdaptiveThreshold

adaptive_filter = AdaptiveThreshold(
    block_size=11,      # Size of local neighborhood
    offset=2            # Constant subtracted from mean
)
binary_image = adaptive_filter(grayscale_image)
```

**Use cases:**
- Non-uniform illumination
- Local contrast enhancement
- Handling variable staining intensity

### Invert

Invert image intensity values.

```python
from histolab.filters.image_filters import Invert

invert_filter = Invert()
inverted_image = invert_filter(image)
```

**Use cases:**
- Preprocessing for certain segmentation algorithms
- Visualization adjustments

### StretchContrast

Enhance image contrast by stretching intensity range.

```python
from histolab.filters.image_filters import StretchContrast

contrast_filter = StretchContrast()
enhanced_image = contrast_filter(image)
```

**Use cases:**
- Improving visibility of low-contrast features
- Preprocessing for visualization
- Enhancing faint structures

### HistogramEqualization

Equalize image histogram for contrast enhancement.

```python
from histolab.filters.image_filters import HistogramEqualization

hist_eq_filter = HistogramEqualization()
equalized_image = hist_eq_filter(grayscale_image)
```

**Use cases:**
- Standardizing image contrast
- Revealing hidden details
- Preprocessing for feature extraction

## Morphological Filters

### BinaryDilation

Expand white regions in binary images.

```python
from histolab.filters.morphological_filters import BinaryDilation

dilation_filter = BinaryDilation(disk_size=5)
dilated_image = dilation_filter(binary_image)
```

**Parameters:**
- `disk_size`: Size of structuring element (default: 5)

**Use cases:**
- Connecting nearby tissue regions
- Filling small gaps
- Expanding tissue masks

### BinaryErosion

Shrink white regions in binary images.

```python
from histolab.filters.morphological_filters import BinaryErosion

erosion_filter = BinaryErosion(disk_size=5)
eroded_image = erosion_filter(binary_image)
```

**Use cases:**
- Removing small protrusions
- Separating connected objects
- Shrinking tissue boundaries

### BinaryOpening

Erosion followed by dilation (removes small objects).

```python
from histolab.filters.morphological_filters import BinaryOpening

opening_filter = BinaryOpening(disk_size=3)
opened_image = opening_filter(binary_image)
```

**Use cases:**
- Removing small artifacts
- Smoothing object boundaries
- Noise reduction

### BinaryClosing

Dilation followed by erosion (fills small holes).

```python
from histolab.filters.morphological_filters import BinaryClosing

closing_filter = BinaryClosing(disk_size=5)
closed_image = closing_filter(binary_image)
```

**Use cases:**
- Filling small holes in tissue regions
- Connecting nearby objects
- Smoothing internal boundaries

### RemoveSmallObjects

Remove connected components smaller than a threshold.

```python
from histolab.filters.morphological_filters import RemoveSmallObjects

remove_small_filter = RemoveSmallObjects(
    area_threshold=500  # Minimum area in pixels
)
cleaned_image = remove_small_filter(binary_image)
```

**Use cases:**
- Removing dust and artifacts
- Filtering noise
- Cleaning tissue masks

### RemoveSmallHoles

Fill holes smaller than a threshold.

```python
from histolab.filters.morphological_filters import RemoveSmallHoles

fill_holes_filter = RemoveSmallHoles(
    area_threshold=1000  # Maximum hole size to fill
)
filled_image = fill_holes_filter(binary_image)
```

**Use cases:**
- Filling small gaps in tissue
- Creating continuous tissue regions
- Removing internal artifacts

## Filter Composition

### Chaining Filters

Combine multiple filters in sequence:

```python
from histolab.filters.image_filters import RgbToGrayscale, OtsuThreshold
from histolab.filters.morphological_filters import BinaryDilation, RemoveSmallObjects
from histolab.filters.compositions import Compose

# Create filter pipeline
tissue_detection_pipeline = Compose([
    RgbToGrayscale(),
    OtsuThreshold(),
    BinaryDilation(disk_size=5),
    RemoveSmallHoles(area_threshold=1000),
    RemoveSmallObjects(area_threshold=500)
])

# Apply pipeline
result = tissue_detection_pipeline(rgb_image)
```

### Lambda Filters

Create custom filters inline:

```python
from histolab.filters.image_filters import Lambda
import numpy as np

# Custom brightness adjustment
brightness_filter = Lambda(lambda img: np.clip(img * 1.2, 0, 255).astype(np.uint8))

# Custom color channel extraction
red_channel_filter = Lambda(lambda img: img[:, :, 0])
```

## Common Preprocessing Pipelines

### Standard Tissue Detection

```python
from histolab.filters.compositions import Compose
from histolab.filters.image_filters import RgbToGrayscale, OtsuThreshold
from histolab.filters.morphological_filters import (
    BinaryDilation, RemoveSmallHoles, RemoveSmallObjects
)

tissue_detection = Compose([
    RgbToGrayscale(),
    OtsuThreshold(),
    BinaryDilation(disk_size=5),
    RemoveSmallHoles(area_threshold=1000),
    RemoveSmallObjects(area_threshold=500)
])
```

### Pen Mark Removal

```python
from histolab.filters.image_filters import RgbToHsv, Lambda
import numpy as np

def remove_pen_marks(hsv_image):
    """Remove blue/green pen markings."""
    h, s, v = hsv_image[:, :, 0], hsv_image[:, :, 1], hsv_image[:, :, 2]
    # Mask for blue/green hues (common pen colors)
    pen_mask = ((h > 0.45) & (h < 0.7) & (s > 0.3))
    # Set pen regions to white
    hsv_image[pen_mask] = [0, 0, 1]
    return hsv_image

pen_removal = Compose([
    RgbToHsv(),
    Lambda(remove_pen_marks)
])
```

### Nuclei Enhancement

```python
from histolab.filters.image_filters import RgbToHed, HistogramEqualization
from histolab.filters.compositions import Compose

nuclei_enhancement = Compose([
    RgbToHed(),
    Lambda(lambda hed: hed[:, :, 0]),  # Extract hematoxylin channel
    HistogramEqualization()
])
```

### Contrast Normalization

```python
from histolab.filters.image_filters import StretchContrast, HistogramEqualization

contrast_normalization = Compose([
    RgbToGrayscale(),
    StretchContrast(),
    HistogramEqualization()
])
```

## Applying Filters to Tiles

Filters can be applied to individual tiles:

```python
from histolab.tile import Tile
from histolab.filters.image_filters import RgbToGrayscale

# Load or extract tile
tile = Tile(image=pil_image, coords=(x, y))

# Apply filter
gray_filter = RgbToGrayscale()
filtered_tile = tile.apply_filters(gray_filter)

# Chain multiple filters
from histolab.filters.compositions import Compose
from histolab.filters.image_filters import StretchContrast

filter_chain = Compose([
    RgbToGrayscale(),
    StretchContrast()
])
processed_tile = tile.apply_filters(filter_chain)
```

## Custom Mask Filters

Integrate custom filters with tissue masks:

```python
from histolab.masks import TissueMask
from histolab.filters.compositions import Compose
from histolab.filters.image_filters import RgbToGrayscale, OtsuThreshold
from histolab.filters.morphological_filters import BinaryDilation

# Custom aggressive tissue detection
aggressive_filters = Compose([
    RgbToGrayscale(),
    OtsuThreshold(),
    BinaryDilation(disk_size=10),  # Larger dilation
    RemoveSmallObjects(area_threshold=5000)  # Remove only large artifacts
])

# Create mask with custom filters
custom_mask = TissueMask(filters=aggressive_filters)
```

## Stain Normalization

While histolab doesn't have built-in stain normalization, filters can be used for basic normalization:

```python
from histolab.filters.image_filters import RgbToHed, Lambda
import numpy as np

def normalize_hed(hed_image, target_means=[0.65, 0.70], target_stds=[0.15, 0.13]):
    """Simple H&E normalization."""
    h_channel = hed_image[:, :, 0]
    e_channel = hed_image[:, :, 1]

    # Normalize hematoxylin
    h_normalized = (h_channel - h_channel.mean()) / h_channel.std()
    h_normalized = h_normalized * target_stds[0] + target_means[0]

    # Normalize eosin
    e_normalized = (e_channel - e_channel.mean()) / e_channel.std()
    e_normalized = e_normalized * target_stds[1] + target_means[1]

    hed_image[:, :, 0] = h_normalized
    hed_image[:, :, 1] = e_normalized

    return hed_image

normalization_pipeline = Compose([
    RgbToHed(),
    Lambda(normalize_hed)
    # Convert back to RGB if needed
])
```

## Best Practices

1. **Preview filters**: Visualize filter outputs on thumbnails before applying to tiles
2. **Chain efficiently**: Order filters logically (e.g., color conversion before thresholding)
3. **Tune parameters**: Adjust thresholds and structuring element sizes for specific tissues
4. **Use composition**: Build reusable filter pipelines with `Compose`
5. **Consider performance**: Complex filter chains increase processing time
6. **Validate on diverse slides**: Test filters across different scanners, stains, and tissue types
7. **Document custom filters**: Clearly describe purpose and parameters of custom pipelines

## Quality Control Filters

### Blur Detection

```python
from histolab.filters.image_filters import Lambda
import cv2
import numpy as np

def laplacian_blur_score(gray_image):
    """Calculate Laplacian variance (blur metric)."""
    return cv2.Laplacian(np.array(gray_image), cv2.CV_64F).var()

blur_detector = Lambda(lambda img: laplacian_blur_score(
    RgbToGrayscale()(img)
))
```

### Tissue Coverage

```python
from histolab.filters.image_filters import RgbToGrayscale, OtsuThreshold
from histolab.filters.compositions import Compose

def tissue_coverage(image):
    """Calculate percentage of tissue in image."""
    tissue_mask = Compose([
        RgbToGrayscale(),
        OtsuThreshold()
    ])(image)
    return tissue_mask.sum() / tissue_mask.size * 100

coverage_filter = Lambda(tissue_coverage)
```

## Troubleshooting

### Issue: Tissue detection misses valid tissue
**Solutions:**
- Reduce `area_threshold` in `RemoveSmallObjects`
- Decrease erosion/opening disk size
- Try adaptive thresholding instead of Otsu

### Issue: Too many artifacts included
**Solutions:**
- Increase `area_threshold` in `RemoveSmallObjects`
- Add opening/closing operations
- Use custom color-based filtering for specific artifacts

### Issue: Tissue boundaries too rough
**Solutions:**
- Add `BinaryClosing` or `BinaryOpening` for smoothing
- Adjust disk_size for morphological operations

### Issue: Variable staining quality
**Solutions:**
- Apply histogram equalization
- Use adaptive thresholding
- Implement stain normalization pipeline
