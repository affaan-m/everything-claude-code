# Microscopy and Imaging File Formats Reference

This reference covers file formats used in microscopy, medical imaging, remote sensing, and scientific image analysis.

## Microscopy-Specific Formats

### .tif / .tiff - Tagged Image File Format
**Description:** Flexible image format supporting multiple pages and metadata
**Typical Data:** Microscopy images, z-stacks, time series, multi-channel
**Use Cases:** Fluorescence microscopy, confocal imaging, biological imaging
**Python Libraries:**
- `tifffile`: `tifffile.imread('file.tif')` - Microscopy TIFF support
- `PIL/Pillow`: `Image.open('file.tif')` - Basic TIFF
- `scikit-image`: `io.imread('file.tif')`
- `AICSImageIO`: Multi-format microscopy reader
**EDA Approach:**
- Image dimensions and bit depth
- Multi-page/z-stack analysis
- Metadata extraction (OME-TIFF)
- Channel analysis and intensity distributions
- Temporal dynamics (time-lapse)
- Pixel size and spatial calibration
- Histogram analysis per channel
- Dynamic range utilization

### .nd2 - Nikon NIS-Elements
**Description:** Proprietary Nikon microscope format
**Typical Data:** Multi-dimensional microscopy (XYZCT)
**Use Cases:** Nikon microscope data, confocal, widefield
**Python Libraries:**
- `nd2reader`: `ND2Reader('file.nd2')`
- `pims`: `pims.ND2_Reader('file.nd2')`
- `AICSImageIO`: Universal reader
**EDA Approach:**
- Experiment metadata extraction
- Channel configurations
- Time-lapse frame analysis
- Z-stack depth and spacing
- XY stage positions
- Laser settings and power
- Pixel binning information
- Acquisition timestamps

### .lif - Leica Image Format
**Description:** Leica microscope proprietary format
**Typical Data:** Multi-experiment, multi-dimensional images
**Use Cases:** Leica confocal and widefield data
**Python Libraries:**
- `readlif`: `readlif.LifFile('file.lif')`
- `AICSImageIO`: LIF support
- `python-bioformats`: Via Bio-Formats
**EDA Approach:**
- Multiple experiment detection
- Image series enumeration
- Metadata per experiment
- Channel and timepoint structure
- Physical dimensions extraction
- Objective and detector information
- Scan settings analysis

### .czi - Carl Zeiss Image
**Description:** Zeiss microscope format
**Typical Data:** Multi-dimensional microscopy with rich metadata
**Use Cases:** Zeiss confocal, lightsheet, widefield
**Python Libraries:**
- `czifile`: `czifile.CziFile('file.czi')`
- `AICSImageIO`: CZI support
- `pylibCZIrw`: Official Zeiss library
**EDA Approach:**
- Scene and position analysis
- Mosaic tile structure
- Channel wavelength information
- Acquisition mode detection
- Scaling and calibration
- Instrument configuration
- ROI definitions

### .oib / .oif - Olympus Image Format
**Description:** Olympus microscope formats
**Typical Data:** Confocal and multiphoton imaging
**Use Cases:** Olympus FluoView data
**Python Libraries:**
- `AICSImageIO`: OIB/OIF support
- `python-bioformats`: Via Bio-Formats
**EDA Approach:**
- Directory structure validation (OIF)
- Metadata file parsing
- Channel configuration
- Scan parameters
- Objective and filter information
- PMT settings

### .vsi - Olympus VSI
**Description:** Olympus slide scanner format
**Typical Data:** Whole slide imaging, large mosaics
**Use Cases:** Virtual microscopy, pathology
**Python Libraries:**
- `openslide-python`: `openslide.OpenSlide('file.vsi')`
- `AICSImageIO`: VSI support
**EDA Approach:**
- Pyramid level analysis
- Tile structure and overlap
- Macro and label images
- Magnification levels
- Whole slide statistics
- Region detection

### .ims - Imaris Format
**Description:** Bitplane Imaris HDF5-based format
**Typical Data:** Large 3D/4D microscopy datasets
**Use Cases:** 3D rendering, time-lapse analysis
**Python Libraries:**
- `h5py`: Direct HDF5 access
- `imaris_ims_file_reader`: Specialized reader
**EDA Approach:**
- Resolution level analysis
- Time point structure
- Channel organization
- Dataset hierarchy
- Thumbnail generation
- Memory-mapped access strategies
- Chunking optimization

### .lsm - Zeiss LSM
**Description:** Legacy Zeiss confocal format
**Typical Data:** Confocal laser scanning microscopy
**Use Cases:** Older Zeiss confocal data
**Python Libraries:**
- `tifffile`: LSM support (TIFF-based)
- `python-bioformats`: LSM reading
**EDA Approach:**
- Similar to TIFF with LSM-specific metadata
- Scan speed and resolution
- Laser lines and power
- Detector gain and offset
- LUT information

### .stk - MetaMorph Stack
**Description:** MetaMorph image stack format
**Typical Data:** Time-lapse or z-stack sequences
**Use Cases:** MetaMorph software output
**Python Libraries:**
- `tifffile`: STK is TIFF-based
- `python-bioformats`: STK support
**EDA Approach:**
- Stack dimensionality
- Plane metadata
- Timing information
- Stage positions
- UIC tags parsing

### .dv - DeltaVision
**Description:** Applied Precision DeltaVision format
**Typical Data:** Deconvolution microscopy
**Use Cases:** DeltaVision microscope data
**Python Libraries:**
- `mrc`: Can read DV (MRC-related)
- `AICSImageIO`: DV support
**EDA Approach:**
- Wave information (channels)
- Extended header analysis
- Lens and magnification
- Deconvolution status
- Time stamps per section

### .mrc - Medical Research Council
**Description:** Electron microscopy format
**Typical Data:** EM images, cryo-EM, tomography
**Use Cases:** Structural biology, electron microscopy
**Python Libraries:**
- `mrcfile`: `mrcfile.open('file.mrc')`
- `EMAN2`: EM-specific tools
**EDA Approach:**
- Volume dimensions
- Voxel size and units
- Origin and map statistics
- Symmetry information
- Extended header analysis
- Density statistics
- Header consistency validation

### .dm3 / .dm4 - Gatan Digital Micrograph
**Description:** Gatan TEM/STEM format
**Typical Data:** Transmission electron microscopy
**Use Cases:** TEM imaging and analysis
**Python Libraries:**
- `hyperspy`: `hs.load('file.dm3')`
- `ncempy`: `ncempy.io.dm.dmReader('file.dm3')`
**EDA Approach:**
- Microscope parameters
- Energy dispersive spectroscopy data
- Diffraction patterns
- Calibration information
- Tag structure analysis
- Image series handling

### .eer - Electron Event Representation
**Description:** Direct electron detector format
**Typical Data:** Electron counting data from detectors
**Use Cases:** Cryo-EM data collection
**Python Libraries:**
- `mrcfile`: Some EER support
- Vendor-specific tools (Gatan, TFS)
**EDA Approach:**
- Event counting statistics
- Frame rate and dose
- Detector configuration
- Motion correction assessment
- Gain reference validation

### .ser - TIA Series
**Description:** FEI/TFS TIA format
**Typical Data:** EM image series
**Use Cases:** FEI/Thermo Fisher EM data
**Python Libraries:**
- `hyperspy`: SER support
- `ncempy`: TIA reader
**EDA Approach:**
- Series structure
- Calibration data
- Acquisition metadata
- Time stamps
- Multi-dimensional data organization

## Medical and Biological Imaging

### .dcm - DICOM
**Description:** Digital Imaging and Communications in Medicine
**Typical Data:** Medical images with patient/study metadata
**Use Cases:** Clinical imaging, radiology, CT, MRI, PET
**Python Libraries:**
- `pydicom`: `pydicom.dcmread('file.dcm')`
- `SimpleITK`: `sitk.ReadImage('file.dcm')`
- `nibabel`: Limited DICOM support
**EDA Approach:**
- Patient metadata extraction (anonymization check)
- Modality-specific analysis
- Series and study organization
- Slice thickness and spacing
- Window/level settings
- Hounsfield units (CT)
- Image orientation and position
- Multi-frame analysis

### .nii / .nii.gz - NIfTI
**Description:** Neuroimaging Informatics Technology Initiative
**Typical Data:** Brain imaging, fMRI, structural MRI
**Use Cases:** Neuroimaging research, brain analysis
**Python Libraries:**
- `nibabel`: `nibabel.load('file.nii')`
- `nilearn`: Neuroimaging with ML
- `SimpleITK`: NIfTI support
**EDA Approach:**
- Volume dimensions and voxel size
- Affine transformation matrix
- Time series analysis (fMRI)
- Intensity distribution
- Brain extraction quality
- Registration assessment
- Orientation validation
- Header information consistency

### .mnc - MINC Format
**Description:** Medical Image NetCDF
**Typical Data:** Medical imaging (predecessor to NIfTI)
**Use Cases:** Legacy neuroimaging data
**Python Libraries:**
- `pyminc`: MINC-specific tools
- `nibabel`: MINC support
**EDA Approach:**
- Similar to NIfTI
- NetCDF structure exploration
- Dimension ordering
- Metadata extraction

### .nrrd - Nearly Raw Raster Data
**Description:** Medical imaging format with detached header
**Typical Data:** Medical images, research imaging
**Use Cases:** 3D Slicer, ITK-based applications
**Python Libraries:**
- `pynrrd`: `nrrd.read('file.nrrd')`
- `SimpleITK`: NRRD support
**EDA Approach:**
- Header field analysis
- Encoding format
- Dimension and spacing
- Orientation matrix
- Compression assessment
- Endianness handling

### .mha / .mhd - MetaImage
**Description:** MetaImage format (ITK)
**Typical Data:** Medical/scientific 3D images
**Use Cases:** ITK/SimpleITK applications
**Python Libraries:**
- `SimpleITK`: Native MHA/MHD support
- `itk`: Direct ITK integration
**EDA Approach:**
- Header-data file pairing (MHD)
- Transform matrix
- Element spacing
- Compression format
- Data type and dimensions

### .hdr / .img - Analyze Format
**Description:** Legacy medical imaging format
**Typical Data:** Brain imaging (pre-NIfTI)
**Use Cases:** Old neuroimaging datasets
**Python Libraries:**
- `nibabel`: Analyze support
- Conversion to NIfTI recommended
**EDA Approach:**
- Header-image pairing validation
- Byte order issues
- Conversion to modern formats
- Metadata limitations

## Scientific Image Formats

### .png - Portable Network Graphics
**Description:** Lossless compressed image format
**Typical Data:** 2D images, screenshots, processed data
**Use Cases:** Publication figures, lossless storage
**Python Libraries:**
- `PIL/Pillow`: `Image.open('file.png')`
- `scikit-image`: `io.imread('file.png')`
- `imageio`: `imageio.imread('file.png')`
**EDA Approach:**
- Bit depth analysis (8-bit, 16-bit)
- Color mode (grayscale, RGB, palette)
- Metadata (PNG chunks)
- Transparency handling
- Compression efficiency
- Histogram analysis

### .jpg / .jpeg - Joint Photographic Experts Group
**Description:** Lossy compressed image format
**Typical Data:** Natural images, photos
**Use Cases:** Visualization, web graphics (not raw data)
**Python Libraries:**
- `PIL/Pillow`: Standard JPEG support
- `scikit-image`: JPEG reading
**EDA Approach:**
- Compression artifacts detection
- Quality factor estimation
- Color space (RGB, grayscale)
- EXIF metadata
- Quantization table analysis
- Note: Not suitable for quantitative analysis

### .bmp - Bitmap Image
**Description:** Uncompressed raster image
**Typical Data:** Simple images, screenshots
**Use Cases:** Compatibility, simple storage
**Python Libraries:**
- `PIL/Pillow`: BMP support
- `scikit-image`: BMP reading
**EDA Approach:**
- Color depth
- Palette analysis (if indexed)
- File size efficiency
- Pixel format validation

### .gif - Graphics Interchange Format
**Description:** Image format with animation support
**Typical Data:** Animated images, simple graphics
**Use Cases:** Animations, time-lapse visualization
**Python Libraries:**
- `PIL/Pillow`: GIF support
- `imageio`: Better GIF animation support
**EDA Approach:**
- Frame count and timing
- Palette limitations (256 colors)
- Loop count
- Disposal method
- Transparency handling

### .svg - Scalable Vector Graphics
**Description:** XML-based vector graphics
**Typical Data:** Vector drawings, plots, diagrams
**Use Cases:** Publication-quality figures, plots
**Python Libraries:**
- `svgpathtools`: Path manipulation
- `cairosvg`: Rasterization
- `lxml`: XML parsing
**EDA Approach:**
- Element structure analysis
- Style information
- Viewbox and dimensions
- Path complexity
- Text element extraction
- Layer organization

### .eps - Encapsulated PostScript
**Description:** Vector graphics format
**Typical Data:** Publication figures
**Use Cases:** Legacy publication graphics
**Python Libraries:**
- `PIL/Pillow`: Basic EPS rasterization
- `ghostscript` via subprocess
**EDA Approach:**
- Bounding box information
- Preview image validation
- Font embedding
- Conversion to modern formats

### .pdf (Images)
**Description:** Portable Document Format with images
**Typical Data:** Publication figures, multi-page documents
**Use Cases:** Publication, data presentation
**Python Libraries:**
- `PyMuPDF/fitz`: `fitz.open('file.pdf')`
- `pdf2image`: Rasterization
- `pdfplumber`: Text and layout extraction
**EDA Approach:**
- Page count
- Image extraction
- Resolution and DPI
- Embedded fonts and metadata
- Compression methods
- Image vs vector content

### .fig - MATLAB Figure
**Description:** MATLAB figure file
**Typical Data:** MATLAB plots and figures
**Use Cases:** MATLAB data visualization
**Python Libraries:**
- Custom parsers (MAT file structure)
- Conversion to other formats
**EDA Approach:**
- Figure structure
- Data extraction from plots
- Axes and label information
- Plot type identification

### .hdf5 (Imaging Specific)
**Description:** HDF5 for large imaging datasets
**Typical Data:** High-content screening, large microscopy
**Use Cases:** BigDataViewer, large-scale imaging
**Python Libraries:**
- `h5py`: Universal HDF5 access
- Imaging-specific readers (BigDataViewer)
**EDA Approach:**
- Dataset hierarchy
- Chunk and compression strategy
- Multi-resolution pyramid
- Metadata organization
- Memory-mapped access
- Parallel I/O performance

### .zarr - Chunked Array Storage
**Description:** Cloud-optimized array storage
**Typical Data:** Large imaging datasets, OME-ZARR
**Use Cases:** Cloud microscopy, large-scale analysis
**Python Libraries:**
- `zarr`: `zarr.open('file.zarr')`
- `ome-zarr-py`: OME-ZARR support
**EDA Approach:**
- Chunk size optimization
- Compression codec analysis
- Multi-scale representation
- Array dimensions and dtype
- Metadata structure (OME)
- Cloud access patterns

### .raw - Raw Image Data
**Description:** Unformatted binary pixel data
**Typical Data:** Raw detector output
**Use Cases:** Custom imaging systems
**Python Libraries:**
- `numpy`: `np.fromfile()` with dtype
- `imageio`: Raw format plugins
**EDA Approach:**
- Dimensions determination (external info needed)
- Byte order and data type
- Header presence detection
- Pixel value range
- Noise characteristics

### .bin - Binary Image Data
**Description:** Generic binary image format
**Typical Data:** Raw or custom-formatted images
**Use Cases:** Instrument-specific outputs
**Python Libraries:**
- `numpy`: Custom binary reading
- `struct`: For structured binary data
**EDA Approach:**
- Format specification required
- Header parsing (if present)
- Data type inference
- Dimension extraction
- Validation with known parameters

## Image Analysis Formats

### .roi - ImageJ ROI
**Description:** ImageJ region of interest format
**Typical Data:** Geometric ROIs, selections
**Use Cases:** ImageJ/Fiji analysis workflows
**Python Libraries:**
- `read-roi`: `read_roi.read_roi_file('file.roi')`
- `roifile`: ROI manipulation
**EDA Approach:**
- ROI type analysis (rectangle, polygon, etc.)
- Coordinate extraction
- ROI properties (area, perimeter)
- Group analysis (ROI sets)
- Z-position and time information

### .zip (ROI sets)
**Description:** ZIP archive of ImageJ ROIs
**Typical Data:** Multiple ROI files
**Use Cases:** Batch ROI analysis
**Python Libraries:**
- `read-roi`: `read_roi.read_roi_zip('file.zip')`
- Standard `zipfile` module
**EDA Approach:**
- ROI count in set
- ROI type distribution
- Spatial distribution
- Overlapping ROI detection
- Naming conventions

### .ome.tif / .ome.tiff - OME-TIFF
**Description:** TIFF with OME-XML metadata
**Typical Data:** Standardized microscopy with rich metadata
**Use Cases:** Bio-Formats compatible storage
**Python Libraries:**
- `tifffile`: OME-TIFF support
- `AICSImageIO`: OME reading
- `python-bioformats`: Bio-Formats integration
**EDA Approach:**
- OME-XML validation
- Physical dimensions extraction
- Channel naming and wavelengths
- Plane positions (Z, C, T)
- Instrument metadata
- Bio-Formats compatibility

### .ome.zarr - OME-ZARR
**Description:** OME-NGFF specification on ZARR
**Typical Data:** Next-generation file format for bioimaging
**Use Cases:** Cloud-native imaging, large datasets
**Python Libraries:**
- `ome-zarr-py`: Official implementation
- `zarr`: Underlying array storage
**EDA Approach:**
- Multiscale resolution levels
- Metadata compliance with OME-NGFF spec
- Coordinate transformations
- Label and ROI handling
- Cloud storage optimization
- Chunk access patterns

### .klb - Keller Lab Block
**Description:** Fast microscopy format for large data
**Typical Data:** Lightsheet microscopy, time-lapse
**Use Cases:** High-throughput imaging
**Python Libraries:**
- `pyklb`: KLB reading and writing
**EDA Approach:**
- Compression efficiency
- Block structure
- Multi-resolution support
- Read performance benchmarking
- Metadata extraction

### .vsi - Whole Slide Imaging
**Description:** Virtual slide format (multiple vendors)
**Typical Data:** Pathology slides, large mosaics
**Use Cases:** Digital pathology
**Python Libraries:**
- `openslide-python`: Multi-format WSI
- `tiffslide`: Pure Python alternative
**EDA Approach:**
- Pyramid level count
- Downsampling factors
- Associated images (macro, label)
- Tile size and overlap
- MPP (microns per pixel)
- Background detection
- Tissue segmentation

### .ndpi - Hamamatsu NanoZoomer
**Description:** Hamamatsu slide scanner format
**Typical Data:** Whole slide pathology images
**Use Cases:** Digital pathology workflows
**Python Libraries:**
- `openslide-python`: NDPI support
**EDA Approach:**
- Multi-resolution pyramid
- Lens and objective information
- Scan area and magnification
- Focal plane information
- Tissue detection

### .svs - Aperio ScanScope
**Description:** Aperio whole slide format
**Typical Data:** Digital pathology slides
**Use Cases:** Pathology image analysis
**Python Libraries:**
- `openslide-python`: SVS support
**EDA Approach:**
- Pyramid structure
- MPP calibration
- Label and macro images
- Compression quality
- Thumbnail generation

### .scn - Leica SCN
**Description:** Leica slide scanner format
**Typical Data:** Whole slide imaging
**Use Cases:** Digital pathology
**Python Libraries:**
- `openslide-python`: SCN support
**EDA Approach:**
- Tile structure analysis
- Collection organization
- Metadata extraction
- Magnification levels
