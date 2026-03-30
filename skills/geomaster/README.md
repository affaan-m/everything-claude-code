# GeoMaster Geospatial Science Skill

## Overview

GeoMaster is a comprehensive geospatial science skill covering:
- **70+ sections** on geospatial science topics
- **500+ code examples** across 7 programming languages
- **300+ geospatial libraries** and tools
- Remote sensing, GIS, spatial statistics, ML/AI for Earth observation

## Contents

### Main Documentation
- **SKILL.md** - Main skill documentation with installation, quick start, core concepts, common operations, and workflows

### Reference Documentation
1. **core-libraries.md** - GDAL, Rasterio, Fiona, Shapely, PyProj, GeoPandas
2. **remote-sensing.md** - Satellite missions, optical/SAR/hyperspectral analysis, image processing
3. **gis-software.md** - QGIS/PyQGIS, ArcGIS/ArcPy, GRASS GIS, SAGA GIS integration
4. **scientific-domains.md** - Marine, atmospheric, hydrology, agriculture, forestry applications
5. **advanced-gis.md** - 3D GIS, spatiotemporal analysis, topology, network analysis
6. **programming-languages.md** - R, Julia, JavaScript, C++, Java, Go geospatial tools
7. **machine-learning.md** - Deep learning for RS, spatial ML, GNNs, XAI for geospatial
8. **big-data.md** - Distributed processing, cloud platforms, GPU acceleration
9. **industry-applications.md** - Urban planning, disaster management, utilities, transportation
10. **specialized-topics.md** - Geostatistics, optimization, ethics, best practices
11. **data-sources.md** - Satellite data catalogs, open data repositories, API access
12. **code-examples.md** - 500+ code examples across 7 programming languages

## Key Topics Covered

### Remote Sensing
- Sentinel-1/2/3, Landsat, MODIS, Planet, Maxar
- SAR, hyperspectral, LiDAR, thermal imaging
- Spectral indices, classification, change detection

### GIS Operations
- Vector data (points, lines, polygons)
- Raster data processing
- Coordinate reference systems
- Spatial analysis and statistics

### Machine Learning
- Random Forest, SVM, CNN, U-Net
- Spatial statistics, geostatistics
- Graph neural networks
- Explainable AI

### Programming Languages
- **Python** - GDAL, Rasterio, GeoPandas, TorchGeo, RSGISLib
- **R** - sf, terra, raster, stars
- **Julia** - ArchGDAL, GeoStats.jl
- **JavaScript** - Turf.js, Leaflet
- **C++** - GDAL C++ API
- **Java** - GeoTools
- **Go** - Simple Features Go

## Installation

See [SKILL.md](SKILL.md) for detailed installation instructions.

### Core Python Stack
```bash
conda install -c conda-forge gdal rasterio fiona shapely pyproj geopandas
```

### Remote Sensing
```bash
pip install rsgislib torchgeo earthengine-api
```

## Quick Examples

### Calculate NDVI from Sentinel-2
```python
import rasterio
import numpy as np

with rasterio.open('sentinel2.tif') as src:
    red = src.read(4)
    nir = src.read(8)
    ndvi = (nir - red) / (nir + red + 1e-8)
```

### Spatial Analysis with GeoPandas
```python
import geopandas as gpd

zones = gpd.read_file('zones.geojson')
points = gpd.read_file('points.geojson')
joined = gpd.sjoin(points, zones, predicate='within')
```

## License

MIT License

## Author

K-Dense Inc.

## Contributing

This skill is part of the K-Dense-AI/claude-scientific-skills repository.
For contributions, see the main repository guidelines.
