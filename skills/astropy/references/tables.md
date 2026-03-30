# Table Operations (astropy.table)

The `astropy.table` module provides flexible tools for working with tabular data, with support for units, masked values, and various file formats.

## Creating Tables

### Basic Table Creation

```python
from astropy.table import Table, QTable
import astropy.units as u
import numpy as np

# From column arrays
a = [1, 4, 5]
b = [2.0, 5.0, 8.2]
c = ['x', 'y', 'z']

t = Table([a, b, c], names=('id', 'flux', 'name'))

# With units (use QTable)
flux = [1.2, 2.3, 3.4] * u.Jy
wavelength = [500, 600, 700] * u.nm
t = QTable([flux, wavelength], names=('flux', 'wavelength'))
```

### From Lists of Rows

```python
# List of tuples
rows = [(1, 10.5, 'A'), (2, 11.2, 'B'), (3, 12.3, 'C')]
t = Table(rows=rows, names=('id', 'value', 'name'))

# List of dictionaries
rows = [{'id': 1, 'value': 10.5}, {'id': 2, 'value': 11.2}]
t = Table(rows)
```

### From NumPy Arrays

```python
# Structured array
arr = np.array([(1, 2.0, 'x'), (4, 5.0, 'y')],
               dtype=[('a', 'i4'), ('b', 'f8'), ('c', 'U10')])
t = Table(arr)

# 2D array with column names
data = np.random.random((100, 3))
t = Table(data, names=['col1', 'col2', 'col3'])
```

### From Pandas DataFrame

```python
import pandas as pd

df = pd.DataFrame({'a': [1, 2, 3], 'b': [4, 5, 6]})
t = Table.from_pandas(df)
```

## Accessing Table Data

### Basic Access

```python
# Column access
ra_col = t['ra']           # Returns Column object
dec_col = t['dec']

# Row access
first_row = t[0]           # Returns Row object
row_slice = t[10:20]       # Returns new Table

# Cell access
value = t['ra'][5]         # 6th value in 'ra' column
value = t[5]['ra']         # Same thing

# Multiple columns
subset = t['ra', 'dec', 'mag']
```

### Table Properties

```python
len(t)              # Number of rows
t.colnames          # List of column names
t.dtype             # Column data types
t.info              # Detailed information
t.meta              # Metadata dictionary
```

### Iteration

```python
# Iterate over rows
for row in t:
    print(row['ra'], row['dec'])

# Iterate over columns
for colname in t.colnames:
    print(t[colname])
```

## Modifying Tables

### Adding Columns

```python
# Add new column
t['new_col'] = [1, 2, 3, 4, 5]
t['calc'] = t['a'] + t['b']  # Calculated column

# Add column with units
t['velocity'] = [10, 20, 30] * u.km / u.s

# Add empty column
from astropy.table import Column
t['empty'] = Column(length=len(t), dtype=float)

# Insert at specific position
t.add_column([7, 8, 9], name='inserted', index=2)
```

### Removing Columns

```python
# Remove single column
t.remove_column('old_col')

# Remove multiple columns
t.remove_columns(['col1', 'col2'])

# Delete syntax
del t['col_name']

# Keep only specific columns
t.keep_columns(['ra', 'dec', 'mag'])
```

### Renaming Columns

```python
t.rename_column('old_name', 'new_name')

# Rename multiple
t.rename_columns(['old1', 'old2'], ['new1', 'new2'])
```

### Adding Rows

```python
# Add single row
t.add_row([1, 2.5, 'new'])

# Add row as dict
t.add_row({'ra': 10.5, 'dec': 41.2, 'mag': 18.5})

# Note: Adding rows one at a time is slow!
# Better to collect rows and create table at once
```

### Modifying Data

```python
# Modify column values
t['flux'] = t['flux'] * gain
t['mag'][t['mag'] < 0] = np.nan

# Modify single cell
t['ra'][5] = 10.5

# Modify entire row
t[0] = [new_id, new_ra, new_dec]
```

## Sorting and Filtering

### Sorting

```python
# Sort by single column
t.sort('mag')

# Sort descending
t.sort('mag', reverse=True)

# Sort by multiple columns
t.sort(['priority', 'mag'])

# Get sorted indices without modifying table
indices = t.argsort('mag')
sorted_table = t[indices]
```

### Filtering

```python
# Boolean indexing
bright = t[t['mag'] < 18]
nearby = t[t['distance'] < 100*u.pc]

# Multiple conditions
selected = t[(t['mag'] < 18) & (t['dec'] > 0)]

# Using numpy functions
high_snr = t[np.abs(t['flux'] / t['error']) > 5]
```

## Reading and Writing Files

### Supported Formats

FITS, HDF5, ASCII (CSV, ECSV, IPAC, etc.), VOTable, Parquet, ASDF

### Reading Files

```python
# Automatic format detection
t = Table.read('catalog.fits')
t = Table.read('data.csv')
t = Table.read('table.vot')

# Specify format explicitly
t = Table.read('data.txt', format='ascii')
t = Table.read('catalog.hdf5', path='/dataset/table')

# Read specific HDU from FITS
t = Table.read('file.fits', hdu=2)
```

### Writing Files

```python
# Automatic format from extension
t.write('output.fits')
t.write('output.csv')

# Specify format
t.write('output.txt', format='ascii.csv')
t.write('output.hdf5', path='/data/table', serialize_meta=True)

# Overwrite existing file
t.write('output.fits', overwrite=True)
```

### ASCII Format Options

```python
# CSV with custom delimiter
t.write('output.csv', format='ascii.csv', delimiter='|')

# Fixed-width format
t.write('output.txt', format='ascii.fixed_width')

# IPAC format
t.write('output.tbl', format='ascii.ipac')

# LaTeX table
t.write('table.tex', format='ascii.latex')
```

## Table Operations

### Stacking Tables (Vertical)

```python
from astropy.table import vstack

# Concatenate tables vertically
t1 = Table([[1, 2], [3, 4]], names=('a', 'b'))
t2 = Table([[5, 6], [7, 8]], names=('a', 'b'))
t_combined = vstack([t1, t2])
```

### Joining Tables (Horizontal)

```python
from astropy.table import hstack

# Concatenate tables horizontally
t1 = Table([[1, 2]], names=['a'])
t2 = Table([[3, 4]], names=['b'])
t_combined = hstack([t1, t2])
```

### Database-Style Joins

```python
from astropy.table import join

# Inner join on common column
t1 = Table([[1, 2, 3], ['a', 'b', 'c']], names=('id', 'data1'))
t2 = Table([[1, 2, 4], ['x', 'y', 'z']], names=('id', 'data2'))
t_joined = join(t1, t2, keys='id')

# Left/right/outer joins
t_joined = join(t1, t2, join_type='left')
t_joined = join(t1, t2, join_type='outer')
```

### Grouping and Aggregating

```python
# Group by column
g = t.group_by('filter')

# Aggregate groups
means = g.groups.aggregate(np.mean)

# Iterate over groups
for group in g.groups:
    print(f"Filter: {group['filter'][0]}")
    print(f"Mean mag: {np.mean(group['mag'])}")
```

### Unique Rows

```python
# Get unique rows
t_unique = t.unique('id')

# Multiple columns
t_unique = t.unique(['ra', 'dec'])
```

## Units and Quantities

Use QTable for unit-aware operations:

```python
from astropy.table import QTable

# Create table with units
t = QTable()
t['flux'] = [1.2, 2.3, 3.4] * u.Jy
t['wavelength'] = [500, 600, 700] * u.nm

# Unit conversions
t['flux'].to(u.mJy)
t['wavelength'].to(u.angstrom)

# Calculations preserve units
t['freq'] = t['wavelength'].to(u.Hz, equivalencies=u.spectral())
```

## Masking Missing Data

```python
from astropy.table import MaskedColumn
import numpy as np

# Create masked column
flux = MaskedColumn([1.2, np.nan, 3.4], mask=[False, True, False])
t = Table([flux], names=['flux'])

# Operations automatically handle masks
mean_flux = np.ma.mean(t['flux'])

# Fill masked values
t['flux'].filled(0)  # Replace masked with 0
```

## Indexing for Fast Lookup

Create indices for fast row retrieval:

```python
# Add index on column
t.add_index('id')

# Fast lookup by index
row = t.loc[12345]  # Find row where id=12345

# Range queries
subset = t.loc[100:200]
```

## Table Metadata

```python
# Set table-level metadata
t.meta['TELESCOPE'] = 'HST'
t.meta['FILTER'] = 'F814W'
t.meta['EXPTIME'] = 300.0

# Set column-level metadata
t['ra'].meta['unit'] = 'deg'
t['ra'].meta['description'] = 'Right Ascension'
t['ra'].description = 'Right Ascension'  # Shortcut
```

## Performance Tips

### Fast Table Construction

```python
# SLOW: Adding rows one at a time
t = Table(names=['a', 'b'])
for i in range(1000):
    t.add_row([i, i**2])

# FAST: Build from lists
rows = [(i, i**2) for i in range(1000)]
t = Table(rows=rows, names=['a', 'b'])
```

### Memory-Mapped FITS Tables

```python
# Don't load entire table into memory
t = Table.read('huge_catalog.fits', memmap=True)

# Only loads data when accessed
subset = t[10000:10100]  # Efficient
```

### Copy vs. View

```python
# Create view (shares data, fast)
t_view = t['ra', 'dec']

# Create copy (independent data)
t_copy = t['ra', 'dec'].copy()
```

## Displaying Tables

```python
# Print to console
print(t)

# Show in interactive browser
t.show_in_browser()
t.show_in_browser(jsviewer=True)  # Interactive sorting/filtering

# Paginated viewing
t.more()

# Custom formatting
t['flux'].format = '%.3f'
t['ra'].format = '{:.6f}'
```

## Converting to Other Formats

```python
# To NumPy array
arr = np.array(t)

# To Pandas DataFrame
df = t.to_pandas()

# To dictionary
d = {name: t[name] for name in t.colnames}
```

## Common Use Cases

### Cross-Matching Catalogs

```python
from astropy.coordinates import SkyCoord, match_coordinates_sky

# Create coordinate objects from table columns
coords1 = SkyCoord(t1['ra'], t1['dec'], unit='deg')
coords2 = SkyCoord(t2['ra'], t2['dec'], unit='deg')

# Find matches
idx, sep, _ = coords1.match_to_catalog_sky(coords2)

# Filter by separation
max_sep = 1 * u.arcsec
matches = sep < max_sep
t1_matched = t1[matches]
t2_matched = t2[idx[matches]]
```

### Binning Data

```python
from astropy.table import Table
import numpy as np

# Bin by magnitude
mag_bins = np.arange(10, 20, 0.5)
binned = t.group_by(np.digitize(t['mag'], mag_bins))
counts = binned.groups.aggregate(len)
```
