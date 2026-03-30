---
name: pydicom
description: Python library for working with DICOM (Digital Imaging and Communications in Medicine) files. Use this skill when reading, writing, or modifying medical imaging data in DICOM format, extracting pixel data from medical images (CT, MRI, X-ray, ultrasound), anonymizing DICOM files, working with DICOM metadata and tags, converting DICOM images to other formats, handling compressed DICOM data, or processing medical imaging datasets. Applies to tasks involving medical image analysis, PACS systems, radiology workflows, and healthcare imaging applications.
license: https://github.com/pydicom/pydicom/blob/main/LICENSE
metadata:
    skill-author: K-Dense Inc.
---

# Pydicom

## Overview

Pydicom is a pure Python package for working with DICOM files, the standard format for medical imaging data. This skill provides guidance on reading, writing, and manipulating DICOM files, including working with pixel data, metadata, and various compression formats.

## When to Use This Skill

Use this skill when working with:
- Medical imaging files (CT, MRI, X-ray, ultrasound, PET, etc.)
- DICOM datasets requiring metadata extraction or modification
- Pixel data extraction and image processing from medical scans
- DICOM anonymization for research or data sharing
- Converting DICOM files to standard image formats
- Compressed DICOM data requiring decompression
- DICOM sequences and structured reports
- Multi-slice volume reconstruction
- PACS (Picture Archiving and Communication System) integration

## Installation

Install pydicom and common dependencies:

```bash
uv pip install pydicom
uv pip install pillow  # For image format conversion
uv pip install numpy   # For pixel array manipulation
uv pip install matplotlib  # For visualization
```

For handling compressed DICOM files, additional packages may be needed:

```bash
uv pip install pylibjpeg pylibjpeg-libjpeg pylibjpeg-openjpeg  # JPEG compression
uv pip install python-gdcm  # Alternative compression handler
```

## Core Workflows

### Reading DICOM Files

Read a DICOM file using `pydicom.dcmread()`:

```python
import pydicom

# Read a DICOM file
ds = pydicom.dcmread('path/to/file.dcm')

# Access metadata
print(f"Patient Name: {ds.PatientName}")
print(f"Study Date: {ds.StudyDate}")
print(f"Modality: {ds.Modality}")

# Display all elements
print(ds)
```

**Key points:**
- `dcmread()` returns a `Dataset` object
- Access data elements using attribute notation (e.g., `ds.PatientName`) or tag notation (e.g., `ds[0x0010, 0x0010]`)
- Use `ds.file_meta` to access file metadata like Transfer Syntax UID
- Handle missing attributes with `getattr(ds, 'AttributeName', default_value)` or `hasattr(ds, 'AttributeName')`

### Working with Pixel Data

Extract and manipulate image data from DICOM files:

```python
import pydicom
import numpy as np
import matplotlib.pyplot as plt

# Read DICOM file
ds = pydicom.dcmread('image.dcm')

# Get pixel array (requires numpy)
pixel_array = ds.pixel_array

# Image information
print(f"Shape: {pixel_array.shape}")
print(f"Data type: {pixel_array.dtype}")
print(f"Rows: {ds.Rows}, Columns: {ds.Columns}")

# Apply windowing for display (CT/MRI)
if hasattr(ds, 'WindowCenter') and hasattr(ds, 'WindowWidth'):
    from pydicom.pixel_data_handlers.util import apply_voi_lut
    windowed_image = apply_voi_lut(pixel_array, ds)
else:
    windowed_image = pixel_array

# Display image
plt.imshow(windowed_image, cmap='gray')
plt.title(f"{ds.Modality} - {ds.StudyDescription}")
plt.axis('off')
plt.show()
```

**Working with color images:**

```python
# RGB images have shape (rows, columns, 3)
if ds.PhotometricInterpretation == 'RGB':
    rgb_image = ds.pixel_array
    plt.imshow(rgb_image)
elif ds.PhotometricInterpretation == 'YBR_FULL':
    from pydicom.pixel_data_handlers.util import convert_color_space
    rgb_image = convert_color_space(ds.pixel_array, 'YBR_FULL', 'RGB')
    plt.imshow(rgb_image)
```

**Multi-frame images (videos/series):**

```python
# For multi-frame DICOM files
if hasattr(ds, 'NumberOfFrames') and ds.NumberOfFrames > 1:
    frames = ds.pixel_array  # Shape: (num_frames, rows, columns)
    print(f"Number of frames: {frames.shape[0]}")

    # Display specific frame
    plt.imshow(frames[0], cmap='gray')
```

### Converting DICOM to Image Formats

Use the provided `dicom_to_image.py` script or convert manually:

```python
from PIL import Image
import pydicom
import numpy as np

ds = pydicom.dcmread('input.dcm')
pixel_array = ds.pixel_array

# Normalize to 0-255 range
if pixel_array.dtype != np.uint8:
    pixel_array = ((pixel_array - pixel_array.min()) /
                   (pixel_array.max() - pixel_array.min()) * 255).astype(np.uint8)

# Save as PNG
image = Image.fromarray(pixel_array)
image.save('output.png')
```

Use the script: `python scripts/dicom_to_image.py input.dcm output.png`

### Modifying Metadata

Modify DICOM data elements:

```python
import pydicom
from datetime import datetime

ds = pydicom.dcmread('input.dcm')

# Modify existing elements
ds.PatientName = "Doe^John"
ds.StudyDate = datetime.now().strftime('%Y%m%d')
ds.StudyDescription = "Modified Study"

# Add new elements
ds.SeriesNumber = 1
ds.SeriesDescription = "New Series"

# Remove elements
if hasattr(ds, 'PatientComments'):
    delattr(ds, 'PatientComments')
# Or using del
if 'PatientComments' in ds:
    del ds.PatientComments

# Save modified file
ds.save_as('modified.dcm')
```

### Anonymizing DICOM Files

Remove or replace patient identifiable information:

```python
import pydicom
from datetime import datetime

ds = pydicom.dcmread('input.dcm')

# Tags commonly containing PHI (Protected Health Information)
tags_to_anonymize = [
    'PatientName', 'PatientID', 'PatientBirthDate',
    'PatientSex', 'PatientAge', 'PatientAddress',
    'InstitutionName', 'InstitutionAddress',
    'ReferringPhysicianName', 'PerformingPhysicianName',
    'OperatorsName', 'StudyDescription', 'SeriesDescription',
]

# Remove or replace sensitive data
for tag in tags_to_anonymize:
    if hasattr(ds, tag):
        if tag in ['PatientName', 'PatientID']:
            setattr(ds, tag, 'ANONYMOUS')
        elif tag == 'PatientBirthDate':
            setattr(ds, tag, '19000101')
        else:
            delattr(ds, tag)

# Update dates to maintain temporal relationships
if hasattr(ds, 'StudyDate'):
    # Shift dates by a random offset
    ds.StudyDate = '20000101'

# Keep pixel data intact
ds.save_as('anonymized.dcm')
```

Use the provided script: `python scripts/anonymize_dicom.py input.dcm output.dcm`

### Writing DICOM Files

Create DICOM files from scratch:

```python
import pydicom
from pydicom.dataset import Dataset, FileDataset
from datetime import datetime
import numpy as np

# Create file meta information
file_meta = Dataset()
file_meta.MediaStorageSOPClassUID = pydicom.uid.generate_uid()
file_meta.MediaStorageSOPInstanceUID = pydicom.uid.generate_uid()
file_meta.TransferSyntaxUID = pydicom.uid.ExplicitVRLittleEndian

# Create the FileDataset instance
ds = FileDataset('new_dicom.dcm', {}, file_meta=file_meta, preamble=b"\0" * 128)

# Add required DICOM elements
ds.PatientName = "Test^Patient"
ds.PatientID = "123456"
ds.Modality = "CT"
ds.StudyDate = datetime.now().strftime('%Y%m%d')
ds.StudyTime = datetime.now().strftime('%H%M%S')
ds.ContentDate = ds.StudyDate
ds.ContentTime = ds.StudyTime

# Add image-specific elements
ds.SamplesPerPixel = 1
ds.PhotometricInterpretation = "MONOCHROME2"
ds.Rows = 512
ds.Columns = 512
ds.BitsAllocated = 16
ds.BitsStored = 16
ds.HighBit = 15
ds.PixelRepresentation = 0

# Create pixel data
pixel_array = np.random.randint(0, 4096, (512, 512), dtype=np.uint16)
ds.PixelData = pixel_array.tobytes()

# Add required UIDs
ds.SOPClassUID = pydicom.uid.CTImageStorage
ds.SOPInstanceUID = file_meta.MediaStorageSOPInstanceUID
ds.SeriesInstanceUID = pydicom.uid.generate_uid()
ds.StudyInstanceUID = pydicom.uid.generate_uid()

# Save the file
ds.save_as('new_dicom.dcm')
```

### Compression and Decompression

Handle compressed DICOM files:

```python
import pydicom

# Read compressed DICOM file
ds = pydicom.dcmread('compressed.dcm')

# Check transfer syntax
print(f"Transfer Syntax: {ds.file_meta.TransferSyntaxUID}")
print(f"Transfer Syntax Name: {ds.file_meta.TransferSyntaxUID.name}")

# Decompress and save as uncompressed
ds.decompress()
ds.save_as('uncompressed.dcm', write_like_original=False)

# Or compress when saving (requires appropriate encoder)
ds_uncompressed = pydicom.dcmread('uncompressed.dcm')
ds_uncompressed.compress(pydicom.uid.JPEGBaseline8Bit)
ds_uncompressed.save_as('compressed_jpeg.dcm')
```

**Common transfer syntaxes:**
- `ExplicitVRLittleEndian` - Uncompressed, most common
- `JPEGBaseline8Bit` - JPEG lossy compression
- `JPEGLossless` - JPEG lossless compression
- `JPEG2000Lossless` - JPEG 2000 lossless
- `RLELossless` - Run-Length Encoding lossless

See `references/transfer_syntaxes.md` for complete list.

### Working with DICOM Sequences

Handle nested data structures:

```python
import pydicom

ds = pydicom.dcmread('file.dcm')

# Access sequences
if 'ReferencedStudySequence' in ds:
    for item in ds.ReferencedStudySequence:
        print(f"Referenced SOP Instance UID: {item.ReferencedSOPInstanceUID}")

# Create a sequence
from pydicom.sequence import Sequence

sequence_item = Dataset()
sequence_item.ReferencedSOPClassUID = pydicom.uid.CTImageStorage
sequence_item.ReferencedSOPInstanceUID = pydicom.uid.generate_uid()

ds.ReferencedImageSequence = Sequence([sequence_item])
```

### Processing DICOM Series

Work with multiple related DICOM files:

```python
import pydicom
import numpy as np
from pathlib import Path

# Read all DICOM files in a directory
dicom_dir = Path('dicom_series/')
slices = []

for file_path in dicom_dir.glob('*.dcm'):
    ds = pydicom.dcmread(file_path)
    slices.append(ds)

# Sort by slice location or instance number
slices.sort(key=lambda x: float(x.ImagePositionPatient[2]))
# Or: slices.sort(key=lambda x: int(x.InstanceNumber))

# Create 3D volume
volume = np.stack([s.pixel_array for s in slices])
print(f"Volume shape: {volume.shape}")  # (num_slices, rows, columns)

# Get spacing information for proper scaling
pixel_spacing = slices[0].PixelSpacing  # [row_spacing, col_spacing]
slice_thickness = slices[0].SliceThickness
print(f"Voxel size: {pixel_spacing[0]}x{pixel_spacing[1]}x{slice_thickness} mm")
```

## Helper Scripts

This skill includes utility scripts in the `scripts/` directory:

### anonymize_dicom.py
Anonymize DICOM files by removing or replacing Protected Health Information (PHI).

```bash
python scripts/anonymize_dicom.py input.dcm output.dcm
```

### dicom_to_image.py
Convert DICOM files to common image formats (PNG, JPEG, TIFF).

```bash
python scripts/dicom_to_image.py input.dcm output.png
python scripts/dicom_to_image.py input.dcm output.jpg --format JPEG
```

### extract_metadata.py
Extract and display DICOM metadata in a readable format.

```bash
python scripts/extract_metadata.py file.dcm
python scripts/extract_metadata.py file.dcm --output metadata.txt
```

## Reference Materials

Detailed reference information is available in the `references/` directory:

- **common_tags.md**: Comprehensive list of commonly used DICOM tags organized by category (Patient, Study, Series, Image, etc.)
- **transfer_syntaxes.md**: Complete reference of DICOM transfer syntaxes and compression formats

## Common Issues and Solutions

**Issue: "Unable to decode pixel data"**
- Solution: Install additional compression handlers: `uv pip install pylibjpeg pylibjpeg-libjpeg python-gdcm`

**Issue: "AttributeError" when accessing tags**
- Solution: Check if attribute exists with `hasattr(ds, 'AttributeName')` or use `ds.get('AttributeName', default)`

**Issue: Incorrect image display (too dark/bright)**
- Solution: Apply VOI LUT windowing: `apply_voi_lut(pixel_array, ds)` or manually adjust with `WindowCenter` and `WindowWidth`

**Issue: Memory issues with large series**
- Solution: Process files iteratively, use memory-mapped arrays, or downsample images

## Best Practices

1. **Always check for required attributes** before accessing them using `hasattr()` or `get()`
2. **Preserve file metadata** when modifying files by using `save_as()` with `write_like_original=True`
3. **Use Transfer Syntax UIDs** to understand compression format before processing pixel data
4. **Handle exceptions** when reading files from untrusted sources
5. **Apply proper windowing** (VOI LUT) for medical image visualization
6. **Maintain spatial information** (pixel spacing, slice thickness) when processing 3D volumes
7. **Verify anonymization** thoroughly before sharing medical data
8. **Use UIDs correctly** - generate new UIDs when creating new instances, preserve them when modifying

## Documentation

Official pydicom documentation: https://pydicom.github.io/pydicom/dev/
- User Guide: https://pydicom.github.io/pydicom/dev/guides/user/index.html
- Tutorials: https://pydicom.github.io/pydicom/dev/tutorials/index.html
- API Reference: https://pydicom.github.io/pydicom/dev/reference/index.html
- Examples: https://pydicom.github.io/pydicom/dev/auto_examples/index.html

