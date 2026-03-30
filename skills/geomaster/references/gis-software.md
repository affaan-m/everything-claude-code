# GIS Software Integration

Guide to integrating with major GIS platforms: QGIS, ArcGIS, GRASS GIS, and SAGA GIS.

## QGIS / PyQGIS

### Running Python Scripts in QGIS

```python
# Processing framework script
from qgis.core import (QgsProject, QgsVectorLayer, QgsRasterLayer,
                       QgsProcessingAlgorithm, QgsProcessingParameterRasterLayer)

# Load layers
vector_layer = QgsVectorLayer("path/to/shapefile.shp", "layer_name", "ogr")
raster_layer = QgsRasterLayer("path/to/raster.tif", "raster_name", "gdal")

# Add to project
QgsProject.instance().addMapLayer(vector_layer)
QgsProject.instance().addMapLayer(raster_layer)

# Access features
for feature in vector_layer.getFeatures():
    geom = feature.geometry()
    attrs = feature.attributes()
```

### Creating QGIS Processing Scripts

```python
from qgis.PyQt.QtCore import QCoreApplication
from qgis.core import (QgsProcessingAlgorithm, QgsProcessingParameterRasterDestination,
                       QgsProcessingParameterRasterLayer)

class NDVIAlgorithm(QgsProcessingAlgorithm):
    INPUT = 'INPUT'
    OUTPUT = 'OUTPUT'

    def tr(self, string):
        return QCoreApplication.translate('Processing', string)

    def createInstance(self):
        return NDVIAlgorithm()

    def name(self):
        return 'ndvi_calculation'

    def displayName(self):
        return self.tr('Calculate NDVI')

    def group(self):
        return self.tr('Raster')

    def groupId(self):
        return 'raster'

    def shortHelpString(self):
        return self.tr("Calculate NDVI from Sentinel-2 imagery")

    def initAlgorithm(self, config=None):
        self.addParameter(QgsProcessingParameterRasterLayer(
            self.INPUT, self.tr('Input Sentinel-2 Raster')))

        self.addParameter(QgsProcessingParameterRasterDestination(
            self.OUTPUT, self.tr('Output NDVI')))

    def processAlgorithm(self, parameters, context, feedback):
        raster = self.parameterAsRasterLayer(parameters, self.INPUT, context)

        # NDVI calculation
        # ... implementation ...

        return {self.OUTPUT: destination}
```

### Plugin Development

```python
# __init__.py
def classFactory(iface):
    from .my_plugin import MyPlugin
    return MyPlugin(iface)

# my_plugin.py
from qgis.PyQt.QtCore import QSettings
from qgis.PyQt.QtWidgets import QAction
from qgis.core import QgsProject

class MyPlugin:
    def __init__(self, iface):
        self.iface = iface

    def initGui(self):
        self.action = QAction("My Plugin", self.iface.mainWindow())
        self.action.triggered.connect(self.run)
        self.iface.addPluginToMenu("My Plugin", self.action)

    def run(self):
        # Plugin logic here
        pass

    def unload(self):
        self.iface.removePluginMenu("My Plugin", self.action)
```

## ArcGIS / ArcPy

### Basic ArcPy Operations

```python
import arcpy

# Set workspace
arcpy.env.workspace = "C:/data"

# Set output overwrite
arcpy.env.overwriteOutput = True

# Set scratch workspace
arcpy.env.scratchWorkspace = "C:/data/scratch"

# List features
feature_classes = arcpy.ListFeatureClasses()
rasters = arcpy.ListRasters()
```

### Geoprocessing Workflows

```python
import arcpy
from arcpy.sa import *

# Check out Spatial Analyst extension
arcpy.CheckOutExtension("Spatial")

# Set environment
arcpy.env.workspace = "C:/data"
arcpy.env.cellSize = 10
arcpy.env.extent = "study_area"

# Slope analysis
out_slope = Slope("dem.tif")
out_slope.save("slope.tif")

# Aspect
out_aspect = Aspect("dem.tif")
out_aspect.save("aspect.tif")

# Hillshade
out_hillshade = Hillshade("dem.tif", azimuth=315, altitude=45)
out_hillshade.save("hillshade.tif")

# Viewshed analysis
out_viewshed = Viewshed("observer_points.shp", "dem.tif", obs_elevation_field="HEIGHT")
out_viewshed.save("viewshed.tif")

# Cost distance
cost_raster = CostDistance("source.shp", "cost.tif")
cost_raster.save("cost_distance.tif")

# Hydrology: Flow direction
flow_dir = FlowDirection("dem.tif")
flow_dir.save("flowdir.tif")

# Flow accumulation
flow_acc = FlowAccumulation(flow_dir)
flow_acc.save("flowacc.tif")

# Stream delineation
stream = Con(flow_acc > 1000, 1)
stream_raster = StreamOrder(stream, flow_dir)
```

### Vector Analysis

```python
# Buffer analysis
arcpy.Buffer_analysis("roads.shp", "roads_buffer.shp", "100 meters")

# Spatial join
arcpy.SpatialJoin_analysis("points.shp", "zones.shp", "points_joined.shp",
                           join_operation="JOIN_ONE_TO_ONE",
                           match_option="HAVE_THEIR_CENTER_IN")

# Dissolve
arcpy.Dissolve_management("parcels.shp", "parcels_dissolved.shp",
                          dissolve_field="OWNER_ID")

# Intersect
arcpy.Intersect_analysis(["layer1.shp", "layer2.shp"], "intersection.shp")

# Clip
arcpy.Clip_analysis("input.shp", "clip_boundary.shp", "output.shp")

# Select by location
arcpy.SelectLayerByLocation_management("points_layer", "HAVE_THEIR_CENTER_IN",
                                      "polygon_layer")

# Feature to raster
arcpy.FeatureToRaster_conversion("landuse.shp", "LU_CODE", "landuse.tif", 10)
```

### ArcGIS Pro Notebooks

```python
# ArcGIS Pro Jupyter Notebook
import arcpy
import pandas as pd
import matplotlib.pyplot as plt

# Use current project's map
aprx = arcpy.mp.ArcGISProject("CURRENT")
m = aprx.listMaps()[0]

# Get layer
layer = m.listLayers("Parcels")[0]

# Export to spatial dataframe
sdf = pd.DataFrame.spatial.from_layer(layer)

# Plot
sdf.plot(column='VALUE', cmap='YlOrRd', legend=True)
plt.show()

# Geocode addresses
locator = "C:/data/locators/composite.locator"
results = arcpy.geocoding.GeocodeAddresses(
    "addresses.csv", locator, "Address Address",
    None, "geocoded_results.gdb"
)
```

## GRASS GIS

### Python API for GRASS

```python
import grass.script as gscript
import grass.script.array as garray

# Initialize GRASS session
gscript.run_command('g.gisenv', set='GISDBASE=/grassdata')
gscript.run_command('g.gisenv', set='LOCATION_NAME=nc_spm_08')
gscript.run_command('g.gisenv', set='MAPSET=user1')

# Import raster
gscript.run_command('r.in.gdal', input='elevation.tif', output='elevation')

# Import vector
gscript.run_command('v.in.ogr', input='roads.shp', output='roads')

# Get raster info
info = gscript.raster_info('elevation')
print(info)

# Slope analysis
gscript.run_command('r.slope.aspect', elevation='elevation',
                    slope='slope', aspect='aspect')

# Buffer
gscript.run_command('v.buffer', input='roads', output='roads_buffer',
                    distance=100)

# Overlay
gscript.run_command('v.overlay', ainput='zones', binput='roads',
                    operator='and', output='zones_roads')

# Calculate statistics
stats = gscript.parse_command('r.univar', map='elevation', flags='g')
```

## SAGA GIS

### Using SAGA via Command Line

```python
import subprocess
import os

# SAGA path
saga_cmd = "/usr/local/saga/saga_cmd"

# Grid Calculus
def saga_grid_calculus(input1, input2, output, formula):
    cmd = [
        saga_cmd, "grid_calculus", "GridCalculator",
        f"-GRIDS={input1};{input2}",
        f"-RESULT={output}",
        f"-FORMULA={formula}"
    ]
    subprocess.run(cmd)

# Slope analysis
def saga_slope(dem, output_slope):
    cmd = [
        saga_cmd, "ta_morphometry", "SlopeAspectCurvature",
        f"-ELEVATION={dem}",
        f"-SLOPE={output_slope}"
    ]
    subprocess.run(cmd)

# Morphometric features
def saga_morphometry(dem):
    cmd = [
        saga_cmd, "ta_morphometry", "MorphometricFeatures",
        f"-DEM={dem}",
        f"-SLOPE=slope.sgrd",
        f"-ASPECT=aspect.sgrd",
        f"-CURVATURE=curvature.sgrd"
    ]
    subprocess.run(cmd)

# Channel network
def saga_channels(dem, threshold=1000):
    cmd = [
        saga_cmd, "ta_channels", "ChannelNetworkAndDrainageBasins",
        f"-ELEVATION={dem}",
        f"-CHANNELS=channels.shp",
        f"-BASINS=basins.shp",
        f"-THRESHOLD={threshold}"
    ]
    subprocess.run(cmd)
```

## Cross-Platform Workflows

### Export QGIS to ArcGIS

```python
import geopandas as gpd

# Read data processed in QGIS
gdf = gpd.read_file('qgis_output.geojson')

# Ensure CRS
gdf = gdf.to_crs('EPSG:32633')

# Export for ArcGIS (File Geodatabase)
gdf.to_file('arcgis_input.gpkg', driver='GPKG')
# ArcGIS can read GPKG directly

# Or export to shapefile
gdf.to_file('arcgis_input.shp')
```

### Batch Processing

```python
import geopandas as gpd
from pathlib import Path

# Process multiple files
input_dir = Path('input')
output_dir = Path('output')

for shp in input_dir.glob('*.shp'):
    gdf = gpd.read_file(shp)

    # Process
    gdf['area'] = gdf.geometry.area
    gdf['buffered'] = gdf.geometry.buffer(100)

    # Export for various platforms
    basename = shp.stem
    gdf.to_file(output_dir / f'{basename}_qgis.geojson')
    gdf.to_file(output_dir / f'{basename}_arcgis.shp')
```

For more GIS-specific examples, see [code-examples.md](code-examples.md).
