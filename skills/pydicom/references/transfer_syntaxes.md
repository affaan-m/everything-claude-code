# DICOM Transfer Syntaxes Reference

This document provides a comprehensive reference for DICOM transfer syntaxes and compression formats. Transfer syntaxes define how DICOM data is encoded, including byte ordering, compression method, and other encoding rules.

## Overview

A Transfer Syntax UID specifies:
1. **Byte ordering**: Little Endian or Big Endian
2. **Value Representation (VR)**: Implicit or Explicit
3. **Compression**: None, or specific compression algorithm

## Uncompressed Transfer Syntaxes

### Implicit VR Little Endian (1.2.840.10008.1.2)
- **Default** transfer syntax
- Value Representations are implicit (not explicitly encoded)
- Little Endian byte ordering
- **Pydicom constant**: `pydicom.uid.ImplicitVRLittleEndian`

**Usage:**
```python
import pydicom
ds.file_meta.TransferSyntaxUID = pydicom.uid.ImplicitVRLittleEndian
```

### Explicit VR Little Endian (1.2.840.10008.1.2.1)
- **Most common** transfer syntax
- Value Representations are explicit
- Little Endian byte ordering
- **Pydicom constant**: `pydicom.uid.ExplicitVRLittleEndian`

**Usage:**
```python
ds.file_meta.TransferSyntaxUID = pydicom.uid.ExplicitVRLittleEndian
```

### Explicit VR Big Endian (1.2.840.10008.1.2.2) - RETIRED
- Value Representations are explicit
- Big Endian byte ordering
- **Deprecated** - not recommended for new implementations
- **Pydicom constant**: `pydicom.uid.ExplicitVRBigEndian`

## JPEG Compression

### JPEG Baseline (Process 1) (1.2.840.10008.1.2.4.50)
- **Lossy** compression
- 8-bit samples only
- Most widely supported JPEG format
- **Pydicom constant**: `pydicom.uid.JPEGBaseline8Bit`

**Dependencies:** Requires `pylibjpeg` or `pillow`

**Usage:**
```python
# Compress
ds.compress(pydicom.uid.JPEGBaseline8Bit)

# Decompress
ds.decompress()
```

### JPEG Extended (Process 2 & 4) (1.2.840.10008.1.2.4.51)
- **Lossy** compression
- 8-bit and 12-bit samples
- **Pydicom constant**: `pydicom.uid.JPEGExtended12Bit`

### JPEG Lossless, Non-Hierarchical (Process 14) (1.2.840.10008.1.2.4.57)
- **Lossless** compression
- First-Order Prediction
- **Pydicom constant**: `pydicom.uid.JPEGLossless`

**Dependencies:** Requires `pylibjpeg-libjpeg` or `gdcm`

### JPEG Lossless, Non-Hierarchical, First-Order Prediction (1.2.840.10008.1.2.4.70)
- **Lossless** compression
- Uses Process 14 Selection Value 1
- **Pydicom constant**: `pydicom.uid.JPEGLosslessSV1`

**Usage:**
```python
# Compress to JPEG Lossless
ds.compress(pydicom.uid.JPEGLossless)
```

### JPEG-LS Lossless (1.2.840.10008.1.2.4.80)
- **Lossless** compression
- Low complexity, good compression
- **Pydicom constant**: `pydicom.uid.JPEGLSLossless`

**Dependencies:** Requires `pylibjpeg-libjpeg` or `gdcm`

### JPEG-LS Lossy (Near-Lossless) (1.2.840.10008.1.2.4.81)
- **Near-lossless** compression
- Allows controlled loss of precision
- **Pydicom constant**: `pydicom.uid.JPEGLSNearLossless`

## JPEG 2000 Compression

### JPEG 2000 Lossless Only (1.2.840.10008.1.2.4.90)
- **Lossless** compression
- Wavelet-based compression
- Better compression than JPEG Lossless
- **Pydicom constant**: `pydicom.uid.JPEG2000Lossless`

**Dependencies:** Requires `pylibjpeg-openjpeg`, `gdcm`, or `pillow`

**Usage:**
```python
# Compress to JPEG 2000 Lossless
ds.compress(pydicom.uid.JPEG2000Lossless)
```

### JPEG 2000 (1.2.840.10008.1.2.4.91)
- **Lossy or lossless** compression
- Wavelet-based compression
- High quality at low bit rates
- **Pydicom constant**: `pydicom.uid.JPEG2000`

**Dependencies:** Requires `pylibjpeg-openjpeg`, `gdcm`, or `pillow`

### JPEG 2000 Part 2 Multi-component Lossless (1.2.840.10008.1.2.4.92)
- **Lossless** compression
- Supports multi-component images
- **Pydicom constant**: `pydicom.uid.JPEG2000MCLossless`

### JPEG 2000 Part 2 Multi-component (1.2.840.10008.1.2.4.93)
- **Lossy or lossless** compression
- Supports multi-component images
- **Pydicom constant**: `pydicom.uid.JPEG2000MC`

## RLE Compression

### RLE Lossless (1.2.840.10008.1.2.5)
- **Lossless** compression
- Run-Length Encoding
- Simple, fast algorithm
- Good for images with repeated values
- **Pydicom constant**: `pydicom.uid.RLELossless`

**Dependencies:** Built into pydicom (no additional packages needed)

**Usage:**
```python
# Compress with RLE
ds.compress(pydicom.uid.RLELossless)

# Decompress
ds.decompress()
```

## Deflated Transfer Syntaxes

### Deflated Explicit VR Little Endian (1.2.840.10008.1.2.1.99)
- Uses ZLIB compression on entire dataset
- Not commonly used
- **Pydicom constant**: `pydicom.uid.DeflatedExplicitVRLittleEndian`

## MPEG Compression

### MPEG2 Main Profile @ Main Level (1.2.840.10008.1.2.4.100)
- **Lossy** video compression
- For multi-frame images/videos
- **Pydicom constant**: `pydicom.uid.MPEG2MPML`

### MPEG2 Main Profile @ High Level (1.2.840.10008.1.2.4.101)
- **Lossy** video compression
- Higher resolution than MPML
- **Pydicom constant**: `pydicom.uid.MPEG2MPHL`

### MPEG-4 AVC/H.264 High Profile (1.2.840.10008.1.2.4.102-106)
- **Lossy** video compression
- Various levels (BD, 2D, 3D, Stereo)
- Modern video codec

## Checking Transfer Syntax

### Identify Current Transfer Syntax
```python
import pydicom

ds = pydicom.dcmread('image.dcm')

# Get transfer syntax UID
ts_uid = ds.file_meta.TransferSyntaxUID
print(f"Transfer Syntax UID: {ts_uid}")

# Get human-readable name
print(f"Transfer Syntax Name: {ts_uid.name}")

# Check if compressed
print(f"Is compressed: {ts_uid.is_compressed}")
```

### Common Checks
```python
# Check if little endian
if ts_uid.is_little_endian:
    print("Little Endian")

# Check if implicit VR
if ts_uid.is_implicit_VR:
    print("Implicit VR")

# Check compression type
if 'JPEG' in ts_uid.name:
    print("JPEG compressed")
elif 'JPEG2000' in ts_uid.name:
    print("JPEG 2000 compressed")
elif 'RLE' in ts_uid.name:
    print("RLE compressed")
```

## Decompression

### Automatic Decompression
Pydicom can automatically decompress pixel data when accessing `pixel_array`:

```python
import pydicom

# Read compressed DICOM
ds = pydicom.dcmread('compressed.dcm')

# Pixel data is automatically decompressed
pixel_array = ds.pixel_array  # Decompresses if needed
```

### Manual Decompression
```python
import pydicom

ds = pydicom.dcmread('compressed.dcm')

# Decompress in-place
ds.decompress()

# Now save as uncompressed
ds.save_as('uncompressed.dcm', write_like_original=False)
```

## Compression

### Compressing DICOM Files
```python
import pydicom

ds = pydicom.dcmread('uncompressed.dcm')

# Compress using JPEG 2000 Lossless
ds.compress(pydicom.uid.JPEG2000Lossless)
ds.save_as('compressed_j2k.dcm')

# Compress using RLE Lossless (no additional dependencies)
ds.compress(pydicom.uid.RLELossless)
ds.save_as('compressed_rle.dcm')

# Compress using JPEG Baseline (lossy)
ds.compress(pydicom.uid.JPEGBaseline8Bit)
ds.save_as('compressed_jpeg.dcm')
```

### Compression with Custom Encoding Parameters
```python
import pydicom
from pydicom.encoders import JPEGLSLosslessEncoder

ds = pydicom.dcmread('uncompressed.dcm')

# Compress with custom parameters
ds.compress(pydicom.uid.JPEGLSLossless, encoding_plugin='pylibjpeg')
```

## Installing Compression Handlers

Different transfer syntaxes require different Python packages:

### JPEG Baseline/Extended
```bash
pip install pylibjpeg pylibjpeg-libjpeg
# Or
pip install pillow
```

### JPEG Lossless/JPEG-LS
```bash
pip install pylibjpeg pylibjpeg-libjpeg
# Or
pip install python-gdcm
```

### JPEG 2000
```bash
pip install pylibjpeg pylibjpeg-openjpeg
# Or
pip install python-gdcm
# Or
pip install pillow
```

### RLE
No additional packages needed - built into pydicom

### Comprehensive Installation
```bash
# Install all common handlers
pip install pylibjpeg pylibjpeg-libjpeg pylibjpeg-openjpeg python-gdcm
```

## Checking Available Handlers

```python
import pydicom

# List available pixel data handlers
from pydicom.pixel_data_handlers.util import get_pixel_data_handlers
handlers = get_pixel_data_handlers()

print("Available handlers:")
for handler in handlers:
    print(f"  - {handler.__name__}")
```

## Best Practices

1. **Use Explicit VR Little Endian** for maximum compatibility when creating new files
2. **Use JPEG 2000 Lossless** for good compression with no quality loss
3. **Use RLE Lossless** if you can't install additional dependencies
4. **Check Transfer Syntax** before processing to ensure you have the right handlers
5. **Test decompression** before deploying to ensure all required packages are installed
6. **Preserve original** transfer syntax when possible using `write_like_original=True`
7. **Consider file size** vs. quality tradeoffs when choosing lossy compression
8. **Use lossless compression** for diagnostic images to maintain clinical quality

## Common Issues

### Issue: "Unable to decode pixel data"
**Cause:** Missing compression handler
**Solution:** Install the appropriate package (see Installing Compression Handlers above)

### Issue: "Unsupported Transfer Syntax"
**Cause:** Rare or unsupported compression format
**Solution:** Try installing `python-gdcm` which supports more formats

### Issue: "Pixel data decompressed but looks wrong"
**Cause:** May need to apply VOI LUT or rescale
**Solution:** Use `apply_voi_lut()` or apply `RescaleSlope`/`RescaleIntercept`

## References

- DICOM Standard Part 5 (Data Structures and Encoding): https://dicom.nema.org/medical/dicom/current/output/chtml/part05/PS3.5.html
- Pydicom Transfer Syntax Documentation: https://pydicom.github.io/pydicom/stable/guides/user/transfer_syntaxes.html
- Pydicom Compression Guide: https://pydicom.github.io/pydicom/stable/old/image_data_compression.html
