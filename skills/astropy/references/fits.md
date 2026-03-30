# FITS File Handling (astropy.io.fits)

The `astropy.io.fits` module provides comprehensive tools for reading, writing, and manipulating FITS (Flexible Image Transport System) files.

## Opening FITS Files

### Basic File Opening

```python
from astropy.io import fits

# Open file (returns HDUList - list of HDUs)
hdul = fits.open('filename.fits')

# Always close when done
hdul.close()

# Better: use context manager (automatically closes)
with fits.open('filename.fits') as hdul:
    hdul.info()  # Display file structure
    data = hdul[0].data
```

### File Opening Modes

```python
fits.open('file.fits', mode='readonly')   # Read-only (default)
fits.open('file.fits', mode='update')     # Read and write
fits.open('file.fits', mode='append')     # Add HDUs to file
```

### Memory Mapping

For large files, use memory mapping (default behavior):

```python
hdul = fits.open('large_file.fits', memmap=True)
# Only loads data chunks as needed
```

### Remote Files

Access cloud-hosted FITS files:

```python
uri = "s3://bucket-name/image.fits"
with fits.open(uri, use_fsspec=True, fsspec_kwargs={"anon": True}) as hdul:
    # Use .section to get cutouts without downloading entire file
    cutout = hdul[1].section[100:200, 100:200]
```

## HDU Structure

FITS files contain Header Data Units (HDUs):
- **Primary HDU** (`hdul[0]`): First HDU, always present
- **Extension HDUs** (`hdul[1:]`): Image or table extensions

```python
hdul.info()  # Display all HDUs
# Output:
# No.    Name      Ver    Type      Cards   Dimensions   Format
#  0  PRIMARY       1 PrimaryHDU     220   ()
#  1  SCI           1 ImageHDU       140   (1014, 1014)   float32
#  2  ERR           1 ImageHDU        51   (1014, 1014)   float32
```

## Accessing HDUs

```python
# By index
primary = hdul[0]
extension1 = hdul[1]

# By name
sci = hdul['SCI']

# By name and version number
sci2 = hdul['SCI', 2]  # Second SCI extension
```

## Working with Headers

### Reading Header Values

```python
hdu = hdul[0]
header = hdu.header

# Get keyword value (case-insensitive)
observer = header['OBSERVER']
exptime = header['EXPTIME']

# Get with default if missing
filter_name = header.get('FILTER', 'Unknown')

# Access by index
value = header[7]  # 8th card's value
```

### Modifying Headers

```python
# Update existing keyword
header['OBSERVER'] = 'Edwin Hubble'

# Add/update with comment
header['OBSERVER'] = ('Edwin Hubble', 'Name of observer')

# Add keyword at specific position
header.insert(5, ('NEWKEY', 'value', 'comment'))

# Add HISTORY and COMMENT
header['HISTORY'] = 'File processed on 2025-01-15'
header['COMMENT'] = 'Note about the data'

# Delete keyword
del header['OLDKEY']
```

### Header Cards

Each keyword is stored as a "card" (80-character record):

```python
# Access full card
card = header.cards[0]
print(f"{card.keyword} = {card.value} / {card.comment}")

# Iterate over all cards
for card in header.cards:
    print(f"{card.keyword}: {card.value}")
```

## Working with Image Data

### Reading Image Data

```python
# Get data from HDU
data = hdul[1].data  # Returns NumPy array

# Data properties
print(data.shape)      # e.g., (1024, 1024)
print(data.dtype)      # e.g., float32
print(data.min(), data.max())

# Access specific pixels
pixel_value = data[100, 200]
region = data[100:200, 300:400]
```

### Data Operations

Data is a NumPy array, so use standard NumPy operations:

```python
import numpy as np

# Statistics
mean = np.mean(data)
median = np.median(data)
std = np.std(data)

# Modify data
data[data < 0] = 0  # Clip negative values
data = data * gain + bias  # Calibration

# Mathematical operations
log_data = np.log10(data)
smoothed = scipy.ndimage.gaussian_filter(data, sigma=2)
```

### Cutouts and Sections

Extract regions without loading entire array:

```python
# Section notation [y_start:y_end, x_start:x_end]
cutout = hdul[1].section[500:600, 700:800]
```

## Creating New FITS Files

### Simple Image File

```python
# Create data
data = np.random.random((100, 100))

# Create HDU
hdu = fits.PrimaryHDU(data=data)

# Add header keywords
hdu.header['OBJECT'] = 'Test Image'
hdu.header['EXPTIME'] = 300.0

# Write to file
hdu.writeto('new_image.fits')

# Overwrite if exists
hdu.writeto('new_image.fits', overwrite=True)
```

### Multi-Extension File

```python
# Create primary HDU (can have no data)
primary = fits.PrimaryHDU()
primary.header['TELESCOP'] = 'HST'

# Create image extensions
sci_data = np.ones((100, 100))
sci = fits.ImageHDU(data=sci_data, name='SCI')

err_data = np.ones((100, 100)) * 0.1
err = fits.ImageHDU(data=err_data, name='ERR')

# Combine into HDUList
hdul = fits.HDUList([primary, sci, err])

# Write to file
hdul.writeto('multi_extension.fits')
```

## Working with Table Data

### Reading Tables

```python
# Open table
with fits.open('table.fits') as hdul:
    table = hdul[1].data  # BinTableHDU or TableHDU

    # Access columns
    ra = table['RA']
    dec = table['DEC']
    mag = table['MAG']

    # Access rows
    first_row = table[0]
    subset = table[10:20]

    # Column info
    cols = hdul[1].columns
    print(cols.names)
    cols.info()
```

### Creating Tables

```python
# Define columns
col1 = fits.Column(name='ID', format='K', array=[1, 2, 3, 4])
col2 = fits.Column(name='RA', format='D', array=[10.5, 11.2, 12.3, 13.1])
col3 = fits.Column(name='DEC', format='D', array=[41.2, 42.1, 43.5, 44.2])
col4 = fits.Column(name='Name', format='20A',
                   array=['Star1', 'Star2', 'Star3', 'Star4'])

# Create table HDU
table_hdu = fits.BinTableHDU.from_columns([col1, col2, col3, col4])
table_hdu.name = 'CATALOG'

# Write to file
table_hdu.writeto('catalog.fits', overwrite=True)
```

### Column Formats

Common FITS table column formats:
- `'A'`: Character string (e.g., '20A' for 20 characters)
- `'L'`: Logical (boolean)
- `'B'`: Unsigned byte
- `'I'`: 16-bit integer
- `'J'`: 32-bit integer
- `'K'`: 64-bit integer
- `'E'`: 32-bit floating point
- `'D'`: 64-bit floating point

## Modifying Existing Files

### Update Mode

```python
with fits.open('file.fits', mode='update') as hdul:
    # Modify header
    hdul[0].header['NEWKEY'] = 'value'

    # Modify data
    hdul[1].data[100, 100] = 999

    # Changes automatically saved when context exits
```

### Append Mode

```python
# Add new extension to existing file
new_data = np.random.random((50, 50))
new_hdu = fits.ImageHDU(data=new_data, name='NEW_EXT')

with fits.open('file.fits', mode='append') as hdul:
    hdul.append(new_hdu)
```

## Convenience Functions

For quick operations without managing HDU lists:

```python
# Get data only
data = fits.getdata('file.fits', ext=1)

# Get header only
header = fits.getheader('file.fits', ext=0)

# Get both
data, header = fits.getdata('file.fits', ext=1, header=True)

# Get single keyword value
exptime = fits.getval('file.fits', 'EXPTIME', ext=0)

# Set keyword value
fits.setval('file.fits', 'NEWKEY', value='newvalue', ext=0)

# Write simple file
fits.writeto('output.fits', data, header, overwrite=True)

# Append to file
fits.append('file.fits', data, header)

# Display file info
fits.info('file.fits')
```

## Comparing FITS Files

```python
# Print differences between two files
fits.printdiff('file1.fits', 'file2.fits')

# Compare programmatically
diff = fits.FITSDiff('file1.fits', 'file2.fits')
print(diff.report())
```

## Converting Between Formats

### FITS to/from Astropy Table

```python
from astropy.table import Table

# FITS to Table
table = Table.read('catalog.fits')

# Table to FITS
table.write('output.fits', format='fits', overwrite=True)
```

## Best Practices

1. **Always use context managers** (`with` statements) for safe file handling
2. **Avoid modifying structural keywords** (SIMPLE, BITPIX, NAXIS, etc.)
3. **Use memory mapping** for large files to conserve RAM
4. **Use .section** for remote files to avoid full downloads
5. **Check HDU structure** with `.info()` before accessing data
6. **Verify data types** before operations to avoid unexpected behavior
7. **Use convenience functions** for simple one-off operations

## Common Issues

### Handling Non-Standard FITS

Some files violate FITS standards:

```python
# Ignore verification warnings
hdul = fits.open('bad_file.fits', ignore_missing_end=True)

# Fix non-standard files
hdul = fits.open('bad_file.fits')
hdul.verify('fix')  # Try to fix issues
hdul.writeto('fixed_file.fits')
```

### Large File Performance

```python
# Use memory mapping (default)
hdul = fits.open('huge_file.fits', memmap=True)

# For write operations with large arrays, use Dask
import dask.array as da
large_array = da.random.random((10000, 10000))
fits.writeto('output.fits', large_array)
```
