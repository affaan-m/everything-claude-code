# General Scientific Data Formats Reference

This reference covers general-purpose scientific data formats used across multiple disciplines.

## Numerical and Array Data

### .npy - NumPy Array
**Description:** Binary NumPy array format
**Typical Data:** N-dimensional arrays of any data type
**Use Cases:** Fast I/O for numerical data, intermediate results
**Python Libraries:**
- `numpy`: `np.load('file.npy')`, `np.save()`
- Memory-mapped access: `np.load('file.npy', mmap_mode='r')`
**EDA Approach:**
- Array shape and dimensionality
- Data type and precision
- Statistical summary (mean, std, min, max, percentiles)
- Missing or invalid values (NaN, inf)
- Memory footprint
- Value distribution and histogram
- Sparsity analysis
- Correlation structure (if 2D)

### .npz - Compressed NumPy Archive
**Description:** Multiple NumPy arrays in one file
**Typical Data:** Collections of related arrays
**Use Cases:** Saving multiple arrays together, compressed storage
**Python Libraries:**
- `numpy`: `np.load('file.npz')` returns dict-like object
- `np.savez()` or `np.savez_compressed()`
**EDA Approach:**
- List of contained arrays
- Individual array analysis
- Relationships between arrays
- Total file size and compression ratio
- Naming conventions
- Data consistency checks

### .csv - Comma-Separated Values
**Description:** Plain text tabular data
**Typical Data:** Experimental measurements, results tables
**Use Cases:** Universal data exchange, spreadsheet export
**Python Libraries:**
- `pandas`: `pd.read_csv('file.csv')`
- `csv`: Built-in module
- `polars`: High-performance CSV reading
- `numpy`: `np.loadtxt()` or `np.genfromtxt()`
**EDA Approach:**
- Row and column counts
- Data type inference
- Missing value patterns and frequency
- Column statistics (numeric: mean, std; categorical: frequencies)
- Outlier detection
- Correlation matrix
- Duplicate row detection
- Header and index validation
- Encoding issues detection

### .tsv / .tab - Tab-Separated Values
**Description:** Tab-delimited tabular data
**Typical Data:** Similar to CSV but tab-separated
**Use Cases:** Bioinformatics, text processing output
**Python Libraries:**
- `pandas`: `pd.read_csv('file.tsv', sep='\t')`
**EDA Approach:**
- Same as CSV format
- Tab vs space validation
- Quote handling

### .xlsx / .xls - Excel Spreadsheets
**Description:** Microsoft Excel binary/XML formats
**Typical Data:** Tabular data with formatting, formulas
**Use Cases:** Lab notebooks, data entry, reports
**Python Libraries:**
- `pandas`: `pd.read_excel('file.xlsx')`
- `openpyxl`: Full Excel file manipulation
- `xlrd`: Reading .xls (legacy)
**EDA Approach:**
- Sheet enumeration and names
- Per-sheet data analysis
- Formula evaluation
- Merged cells handling
- Hidden rows/columns
- Data validation rules
- Named ranges
- Formatting-only cells detection

### .json - JavaScript Object Notation
**Description:** Hierarchical text data format
**Typical Data:** Nested data structures, metadata
**Use Cases:** API responses, configuration, results
**Python Libraries:**
- `json`: Built-in module
- `pandas`: `pd.read_json()`
- `ujson`: Faster JSON parsing
**EDA Approach:**
- Schema inference
- Nesting depth
- Key-value distribution
- Array lengths
- Data type consistency
- Missing keys
- Duplicate detection
- Size and complexity metrics

### .xml - Extensible Markup Language
**Description:** Hierarchical markup format
**Typical Data:** Structured data with metadata
**Use Cases:** Standards-based data exchange, APIs
**Python Libraries:**
- `lxml`: `lxml.etree.parse()`
- `xml.etree.ElementTree`: Built-in XML
- `xmltodict`: Convert XML to dict
**EDA Approach:**
- Schema/DTD validation
- Element hierarchy and depth
- Namespace handling
- Attribute vs element content
- CDATA sections
- Text content extraction
- Sibling and child counts

### .yaml / .yml - YAML
**Description:** Human-readable data serialization
**Typical Data:** Configuration, metadata, parameters
**Use Cases:** Experiment configurations, pipelines
**Python Libraries:**
- `yaml`: `yaml.safe_load()` or `yaml.load()`
- `ruamel.yaml`: YAML 1.2 support
**EDA Approach:**
- Configuration structure
- Data type handling
- List and dict depth
- Anchor and alias usage
- Multi-document files
- Comments preservation
- Validation against schema

### .toml - TOML Configuration
**Description:** Configuration file format
**Typical Data:** Settings, parameters
**Use Cases:** Python package configuration, settings
**Python Libraries:**
- `tomli` / `tomllib`: TOML reading (tomllib in Python 3.11+)
- `toml`: Reading and writing
**EDA Approach:**
- Section structure
- Key-value pairs
- Data type inference
- Nested table validation
- Required vs optional fields

### .ini - INI Configuration
**Description:** Simple configuration format
**Typical Data:** Application settings
**Use Cases:** Legacy configurations, simple settings
**Python Libraries:**
- `configparser`: Built-in INI parser
**EDA Approach:**
- Section enumeration
- Key-value extraction
- Type conversion
- Comment handling
- Case sensitivity

## Binary and Compressed Data

### .hdf5 / .h5 - Hierarchical Data Format 5
**Description:** Container for large scientific datasets
**Typical Data:** Multi-dimensional arrays, metadata, groups
**Use Cases:** Large datasets, multi-modal data, parallel I/O
**Python Libraries:**
- `h5py`: `h5py.File('file.h5', 'r')`
- `pytables`: Advanced HDF5 interface
- `pandas`: HDF5 storage via HDFStore
**EDA Approach:**
- Group and dataset hierarchy
- Dataset shapes and dtypes
- Attributes and metadata
- Compression and chunking strategy
- Memory-efficient sampling
- Dataset relationships
- File size and efficiency
- Access patterns optimization

### .zarr - Chunked Array Storage
**Description:** Cloud-optimized chunked arrays
**Typical Data:** Large N-dimensional arrays
**Use Cases:** Cloud storage, parallel computing, streaming
**Python Libraries:**
- `zarr`: `zarr.open('file.zarr')`
- `xarray`: Zarr backend support
**EDA Approach:**
- Array metadata and dimensions
- Chunk size optimization
- Compression codec and ratio
- Synchronizer and store type
- Multi-scale hierarchies
- Parallel access performance
- Attribute metadata

### .gz / .gzip - Gzip Compressed
**Description:** Compressed data files
**Typical Data:** Any compressed text or binary
**Use Cases:** Compression for storage/transfer
**Python Libraries:**
- `gzip`: Built-in gzip module
- `pandas`: Automatic gzip handling in read functions
**EDA Approach:**
- Compression ratio
- Original file type detection
- Decompression validation
- Header information
- Multi-member archives

### .bz2 - Bzip2 Compressed
**Description:** Bzip2 compression
**Typical Data:** Highly compressed files
**Use Cases:** Better compression than gzip
**Python Libraries:**
- `bz2`: Built-in bz2 module
- Automatic handling in pandas
**EDA Approach:**
- Compression efficiency
- Decompression time
- Content validation

### .zip - ZIP Archive
**Description:** Archive with multiple files
**Typical Data:** Collections of files
**Use Cases:** File distribution, archiving
**Python Libraries:**
- `zipfile`: Built-in ZIP support
- `pandas`: Can read zipped CSVs
**EDA Approach:**
- Archive member listing
- Compression method per file
- Total vs compressed size
- Directory structure
- File type distribution
- Extraction validation

### .tar / .tar.gz - TAR Archive
**Description:** Unix tape archive
**Typical Data:** Multiple files and directories
**Use Cases:** Software distribution, backups
**Python Libraries:**
- `tarfile`: Built-in TAR support
**EDA Approach:**
- Member file listing
- Compression (if .tar.gz, .tar.bz2)
- Directory structure
- Permissions preservation
- Extraction testing

## Time Series and Waveform Data

### .wav - Waveform Audio
**Description:** Audio waveform data
**Typical Data:** Acoustic signals, audio recordings
**Use Cases:** Acoustic analysis, ultrasound, signal processing
**Python Libraries:**
- `scipy.io.wavfile`: `scipy.io.wavfile.read()`
- `wave`: Built-in module
- `soundfile`: Enhanced audio I/O
**EDA Approach:**
- Sample rate and duration
- Bit depth and channels
- Amplitude distribution
- Spectral analysis (FFT)
- Signal-to-noise ratio
- Clipping detection
- Frequency content

### .mat - MATLAB Data
**Description:** MATLAB workspace variables
**Typical Data:** Arrays, structures, cells
**Use Cases:** MATLAB-Python interoperability
**Python Libraries:**
- `scipy.io`: `scipy.io.loadmat()`
- `h5py`: For MATLAB v7.3 files (HDF5-based)
- `mat73`: Pure Python for v7.3
**EDA Approach:**
- Variable names and types
- Array dimensions
- Structure field exploration
- Cell array handling
- Sparse matrix detection
- MATLAB version compatibility
- Metadata extraction

### .edf - European Data Format
**Description:** Time series data (especially medical)
**Typical Data:** EEG, physiological signals
**Use Cases:** Medical signal storage
**Python Libraries:**
- `pyedflib`: EDF/EDF+ reading and writing
- `mne`: Neurophysiology data (supports EDF)
**EDA Approach:**
- Signal count and names
- Sampling frequencies
- Signal ranges and units
- Recording duration
- Annotation events
- Data quality (saturation, noise)
- Patient/study information

### .csv (Time Series)
**Description:** CSV with timestamp column
**Typical Data:** Time-indexed measurements
**Use Cases:** Sensor data, monitoring, experiments
**Python Libraries:**
- `pandas`: `pd.read_csv()` with `parse_dates`
**EDA Approach:**
- Temporal range and resolution
- Sampling regularity
- Missing time points
- Trend and seasonality
- Stationarity tests
- Autocorrelation
- Anomaly detection

## Geospatial and Environmental Data

### .shp - Shapefile
**Description:** Geospatial vector data
**Typical Data:** Geographic features (points, lines, polygons)
**Use Cases:** GIS analysis, spatial data
**Python Libraries:**
- `geopandas`: `gpd.read_file('file.shp')`
- `fiona`: Lower-level shapefile access
- `pyshp`: Pure Python shapefile reader
**EDA Approach:**
- Geometry type and count
- Coordinate reference system
- Bounding box
- Attribute table analysis
- Geometry validity
- Spatial distribution
- Multi-part features
- Associated files (.shx, .dbf, .prj)

### .geojson - GeoJSON
**Description:** JSON format for geographic data
**Typical Data:** Features with geometry and properties
**Use Cases:** Web mapping, spatial analysis
**Python Libraries:**
- `geopandas`: Native GeoJSON support
- `json`: Parse as JSON then process
**EDA Approach:**
- Feature count and types
- CRS specification
- Bounding box calculation
- Property schema
- Geometry complexity
- Nesting structure

### .tif / .tiff (Geospatial)
**Description:** GeoTIFF with spatial reference
**Typical Data:** Satellite imagery, DEMs, rasters
**Use Cases:** Remote sensing, terrain analysis
**Python Libraries:**
- `rasterio`: `rasterio.open('file.tif')`
- `gdal`: Geospatial Data Abstraction Library
- `xarray` with `rioxarray`: N-D geospatial arrays
**EDA Approach:**
- Raster dimensions and resolution
- Band count and descriptions
- Coordinate reference system
- Geotransform parameters
- NoData value handling
- Pixel value distribution
- Histogram analysis
- Overviews and pyramids

### .nc / .netcdf - Network Common Data Form
**Description:** Self-describing array-based data
**Typical Data:** Climate, atmospheric, oceanographic data
**Use Cases:** Scientific datasets, model output
**Python Libraries:**
- `netCDF4`: `netCDF4.Dataset('file.nc')`
- `xarray`: `xr.open_dataset('file.nc')`
**EDA Approach:**
- Variable enumeration
- Dimension analysis
- Time series properties
- Spatial coverage
- Attribute metadata (CF conventions)
- Coordinate systems
- Chunking and compression
- Data quality flags

### .grib / .grib2 - Gridded Binary
**Description:** Meteorological data format
**Typical Data:** Weather forecasts, climate data
**Use Cases:** Numerical weather prediction
**Python Libraries:**
- `pygrib`: GRIB file reading
- `xarray` with `cfgrib`: GRIB to xarray
**EDA Approach:**
- Message inventory
- Parameter and level types
- Spatial grid specification
- Temporal coverage
- Ensemble members
- Forecast vs analysis
- Data packing and precision

### .hdf4 - HDF4 Format
**Description:** Older HDF format
**Typical Data:** NASA Earth Science data
**Use Cases:** Satellite data (MODIS, etc.)
**Python Libraries:**
- `pyhdf`: HDF4 access
- `gdal`: Can read HDF4
**EDA Approach:**
- Scientific dataset listing
- Vdata and attributes
- Dimension scales
- Metadata extraction
- Quality flags
- Conversion to HDF5 or NetCDF

## Specialized Scientific Formats

### .fits - Flexible Image Transport System
**Description:** Astronomy data format
**Typical Data:** Images, tables, spectra from telescopes
**Use Cases:** Astronomical observations
**Python Libraries:**
- `astropy.io.fits`: `fits.open('file.fits')`
- `fitsio`: Alternative FITS library
**EDA Approach:**
- HDU (Header Data Unit) structure
- Image dimensions and WCS
- Header keyword analysis
- Table column descriptions
- Data type and scaling
- FITS convention compliance
- Checksum validation

### .asdf - Advanced Scientific Data Format
**Description:** Next-gen data format for astronomy
**Typical Data:** Complex hierarchical scientific data
**Use Cases:** James Webb Space Telescope data
**Python Libraries:**
- `asdf`: `asdf.open('file.asdf')`
**EDA Approach:**
- Tree structure exploration
- Schema validation
- Internal vs external arrays
- Compression methods
- YAML metadata
- Version compatibility

### .root - ROOT Data Format
**Description:** CERN ROOT framework format
**Typical Data:** High-energy physics data
**Use Cases:** Particle physics experiments
**Python Libraries:**
- `uproot`: Pure Python ROOT reading
- `ROOT`: Official PyROOT bindings
**EDA Approach:**
- TTree structure
- Branch types and entries
- Histogram inventory
- Event loop statistics
- File compression
- Split level analysis

### .txt - Plain Text Data
**Description:** Generic text-based data
**Typical Data:** Tab/space-delimited, custom formats
**Use Cases:** Simple data exchange, logs
**Python Libraries:**
- `pandas`: `pd.read_csv()` with custom delimiters
- `numpy`: `np.loadtxt()`, `np.genfromtxt()`
- Built-in file reading
**EDA Approach:**
- Format detection (delimiter, header)
- Data type inference
- Comment line handling
- Missing value codes
- Column alignment
- Encoding detection

### .dat - Generic Data File
**Description:** Binary or text data
**Typical Data:** Instrument output, custom formats
**Use Cases:** Various scientific instruments
**Python Libraries:**
- Format-specific: requires knowledge of structure
- `numpy`: `np.fromfile()` for binary
- `struct`: Parse binary structures
**EDA Approach:**
- Binary vs text determination
- Header detection
- Record structure inference
- Endianness
- Data type patterns
- Validation with documentation

### .log - Log Files
**Description:** Text logs from software/instruments
**Typical Data:** Timestamped events, messages
**Use Cases:** Troubleshooting, experiment tracking
**Python Libraries:**
- Built-in file reading
- `pandas`: Structured log parsing
- Regular expressions for parsing
**EDA Approach:**
- Log level distribution
- Timestamp parsing
- Error and warning frequency
- Event sequencing
- Pattern recognition
- Anomaly detection
- Session boundaries
