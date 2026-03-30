# Regions of Interest (ROIs)

This reference covers creating, retrieving, and analyzing ROIs in OMERO.

## ROI Overview

ROIs (Regions of Interest) in OMERO are containers for geometric shapes that mark specific regions on images. Each ROI can contain multiple shapes, and shapes can be specific to Z-sections and timepoints.

### Supported Shape Types

- **Rectangle**: Rectangular regions
- **Ellipse**: Circular and elliptical regions
- **Line**: Line segments
- **Point**: Single points
- **Polygon**: Multi-point polygons
- **Mask**: Pixel-based masks
- **Polyline**: Multi-segment lines

## Creating ROIs

### Helper Functions

```python
from omero.rtypes import rdouble, rint, rstring
import omero.model

def create_roi(conn, image, shapes):
    """
    Create an ROI and link it to shapes.

    Args:
        conn: BlitzGateway connection
        image: Image object
        shapes: List of shape objects

    Returns:
        Saved ROI object
    """
    roi = omero.model.RoiI()
    roi.setImage(image._obj)

    for shape in shapes:
        roi.addShape(shape)

    updateService = conn.getUpdateService()
    return updateService.saveAndReturnObject(roi)

def rgba_to_int(red, green, blue, alpha=255):
    """
    Convert RGBA values (0-255) to integer encoding for OMERO.

    Args:
        red, green, blue, alpha: Color values (0-255)

    Returns:
        Integer color value
    """
    return int.from_bytes([red, green, blue, alpha],
                          byteorder='big', signed=True)
```

### Rectangle ROI

```python
from omero.rtypes import rdouble, rint, rstring
import omero.model

# Get image
image = conn.getObject("Image", image_id)

# Define position and size
x, y = 50, 100
width, height = 200, 150
z, t = 0, 0  # Z-section and timepoint

# Create rectangle
rect = omero.model.RectangleI()
rect.x = rdouble(x)
rect.y = rdouble(y)
rect.width = rdouble(width)
rect.height = rdouble(height)
rect.theZ = rint(z)
rect.theT = rint(t)

# Set label and colors
rect.textValue = rstring("Cell Region")
rect.fillColor = rint(rgba_to_int(255, 0, 0, 50))    # Red, semi-transparent
rect.strokeColor = rint(rgba_to_int(255, 255, 0, 255))  # Yellow border

# Create ROI
roi = create_roi(conn, image, [rect])
print(f"Created ROI ID: {roi.getId().getValue()}")
```

### Ellipse ROI

```python
# Center position and radii
center_x, center_y = 250, 250
radius_x, radius_y = 100, 75
z, t = 0, 0

# Create ellipse
ellipse = omero.model.EllipseI()
ellipse.x = rdouble(center_x)
ellipse.y = rdouble(center_y)
ellipse.radiusX = rdouble(radius_x)
ellipse.radiusY = rdouble(radius_y)
ellipse.theZ = rint(z)
ellipse.theT = rint(t)
ellipse.textValue = rstring("Nucleus")
ellipse.fillColor = rint(rgba_to_int(0, 255, 0, 50))

# Create ROI
roi = create_roi(conn, image, [ellipse])
```

### Line ROI

```python
# Line endpoints
x1, y1 = 100, 100
x2, y2 = 300, 200
z, t = 0, 0

# Create line
line = omero.model.LineI()
line.x1 = rdouble(x1)
line.y1 = rdouble(y1)
line.x2 = rdouble(x2)
line.y2 = rdouble(y2)
line.theZ = rint(z)
line.theT = rint(t)
line.textValue = rstring("Measurement Line")
line.strokeColor = rint(rgba_to_int(0, 0, 255, 255))

# Create ROI
roi = create_roi(conn, image, [line])
```

### Point ROI

```python
# Point position
x, y = 150, 150
z, t = 0, 0

# Create point
point = omero.model.PointI()
point.x = rdouble(x)
point.y = rdouble(y)
point.theZ = rint(z)
point.theT = rint(t)
point.textValue = rstring("Feature Point")

# Create ROI
roi = create_roi(conn, image, [point])
```

### Polygon ROI

```python
from omero.model.enums import UnitsLength

# Define vertices as string "x1,y1 x2,y2 x3,y3 ..."
vertices = "10,20 50,150 200,200 250,75"
z, t = 0, 0

# Create polygon
polygon = omero.model.PolygonI()
polygon.points = rstring(vertices)
polygon.theZ = rint(z)
polygon.theT = rint(t)
polygon.textValue = rstring("Cell Outline")

# Set colors and stroke width
polygon.fillColor = rint(rgba_to_int(255, 0, 255, 50))
polygon.strokeColor = rint(rgba_to_int(255, 255, 0, 255))
polygon.strokeWidth = omero.model.LengthI(2, UnitsLength.PIXEL)

# Create ROI
roi = create_roi(conn, image, [polygon])
```

### Mask ROI

```python
import numpy as np
import struct
import math

def create_mask_bytes(mask_array, bytes_per_pixel=1):
    """
    Convert binary mask array to bit-packed bytes for OMERO.

    Args:
        mask_array: Binary numpy array (0s and 1s)
        bytes_per_pixel: 1 or 2

    Returns:
        Byte array for OMERO mask
    """
    if bytes_per_pixel == 2:
        divider = 16.0
        format_string = "H"
        byte_factor = 0.5
    elif bytes_per_pixel == 1:
        divider = 8.0
        format_string = "B"
        byte_factor = 1
    else:
        raise ValueError("bytes_per_pixel must be 1 or 2")

    mask_bytes = mask_array.astype(np.uint8).tobytes()
    steps = math.ceil(len(mask_bytes) / divider)
    packed_mask = []

    for i in range(int(steps)):
        binary = mask_bytes[i * int(divider):
                           i * int(divider) + int(divider)]
        format_str = str(int(byte_factor * len(binary))) + format_string
        binary = struct.unpack(format_str, binary)
        s = "".join(str(bit) for bit in binary)
        packed_mask.append(int(s, 2))

    return bytearray(packed_mask)

# Create binary mask (1s and 0s)
mask_w, mask_h = 100, 100
mask_array = np.fromfunction(
    lambda x, y: ((x - 50)**2 + (y - 50)**2) < 40**2,  # Circle
    (mask_w, mask_h)
)

# Pack mask
mask_packed = create_mask_bytes(mask_array, bytes_per_pixel=1)

# Mask position
mask_x, mask_y = 50, 50
z, t, c = 0, 0, 0

# Create mask
mask = omero.model.MaskI()
mask.setX(rdouble(mask_x))
mask.setY(rdouble(mask_y))
mask.setWidth(rdouble(mask_w))
mask.setHeight(rdouble(mask_h))
mask.setTheZ(rint(z))
mask.setTheT(rint(t))
mask.setTheC(rint(c))
mask.setBytes(mask_packed)
mask.textValue = rstring("Segmentation Mask")

# Set color
from omero.gateway import ColorHolder
mask_color = ColorHolder()
mask_color.setRed(255)
mask_color.setGreen(0)
mask_color.setBlue(0)
mask_color.setAlpha(100)
mask.setFillColor(rint(mask_color.getInt()))

# Create ROI
roi = create_roi(conn, image, [mask])
```

## Multiple Shapes in One ROI

```python
# Create multiple shapes for the same ROI
shapes = []

# Rectangle
rect = omero.model.RectangleI()
rect.x = rdouble(100)
rect.y = rdouble(100)
rect.width = rdouble(50)
rect.height = rdouble(50)
rect.theZ = rint(0)
rect.theT = rint(0)
shapes.append(rect)

# Ellipse
ellipse = omero.model.EllipseI()
ellipse.x = rdouble(125)
ellipse.y = rdouble(125)
ellipse.radiusX = rdouble(20)
ellipse.radiusY = rdouble(20)
ellipse.theZ = rint(0)
ellipse.theT = rint(0)
shapes.append(ellipse)

# Create single ROI with both shapes
roi = create_roi(conn, image, shapes)
```

## Retrieving ROIs

### Get All ROIs for Image

```python
# Get ROI service
roi_service = conn.getRoiService()

# Find all ROIs for image
result = roi_service.findByImage(image_id, None)

print(f"Found {len(result.rois)} ROIs")

for roi in result.rois:
    print(f"ROI ID: {roi.getId().getValue()}")
    print(f"  Number of shapes: {len(roi.copyShapes())}")
```

### Parse ROI Shapes

```python
import omero.model

result = roi_service.findByImage(image_id, None)

for roi in result.rois:
    roi_id = roi.getId().getValue()
    print(f"ROI ID: {roi_id}")

    for shape in roi.copyShapes():
        shape_id = shape.getId().getValue()
        z = shape.getTheZ().getValue() if shape.getTheZ() else None
        t = shape.getTheT().getValue() if shape.getTheT() else None

        # Get label
        label = ""
        if shape.getTextValue():
            label = shape.getTextValue().getValue()

        print(f"  Shape ID: {shape_id}, Z: {z}, T: {t}, Label: {label}")

        # Type-specific parsing
        if isinstance(shape, omero.model.RectangleI):
            x = shape.getX().getValue()
            y = shape.getY().getValue()
            width = shape.getWidth().getValue()
            height = shape.getHeight().getValue()
            print(f"    Rectangle: ({x}, {y}) {width}x{height}")

        elif isinstance(shape, omero.model.EllipseI):
            x = shape.getX().getValue()
            y = shape.getY().getValue()
            rx = shape.getRadiusX().getValue()
            ry = shape.getRadiusY().getValue()
            print(f"    Ellipse: center ({x}, {y}), radii ({rx}, {ry})")

        elif isinstance(shape, omero.model.PointI):
            x = shape.getX().getValue()
            y = shape.getY().getValue()
            print(f"    Point: ({x}, {y})")

        elif isinstance(shape, omero.model.LineI):
            x1 = shape.getX1().getValue()
            y1 = shape.getY1().getValue()
            x2 = shape.getX2().getValue()
            y2 = shape.getY2().getValue()
            print(f"    Line: ({x1}, {y1}) to ({x2}, {y2})")

        elif isinstance(shape, omero.model.PolygonI):
            points = shape.getPoints().getValue()
            print(f"    Polygon: {points}")

        elif isinstance(shape, omero.model.MaskI):
            x = shape.getX().getValue()
            y = shape.getY().getValue()
            width = shape.getWidth().getValue()
            height = shape.getHeight().getValue()
            print(f"    Mask: ({x}, {y}) {width}x{height}")
```

## Analyzing ROI Intensities

### Get Statistics for ROI Shapes

```python
# Get all shapes from ROIs
roi_service = conn.getRoiService()
result = roi_service.findByImage(image_id, None)

shape_ids = []
for roi in result.rois:
    for shape in roi.copyShapes():
        shape_ids.append(shape.id.val)

# Define position
z, t = 0, 0
channel_index = 0

# Get statistics
stats = roi_service.getShapeStatsRestricted(
    shape_ids, z, t, [channel_index]
)

# Display statistics
for i, stat in enumerate(stats):
    shape_id = shape_ids[i]
    print(f"Shape {shape_id} statistics:")
    print(f"  Points Count: {stat.pointsCount[channel_index]}")
    print(f"  Min: {stat.min[channel_index]}")
    print(f"  Mean: {stat.mean[channel_index]}")
    print(f"  Max: {stat.max[channel_index]}")
    print(f"  Sum: {stat.sum[channel_index]}")
    print(f"  Std Dev: {stat.stdDev[channel_index]}")
```

### Extract Pixel Values Within ROI

```python
import numpy as np

# Get image and ROI
image = conn.getObject("Image", image_id)
result = roi_service.findByImage(image_id, None)

# Get first rectangle shape
roi = result.rois[0]
rect = roi.copyShapes()[0]

# Get rectangle bounds
x = int(rect.getX().getValue())
y = int(rect.getY().getValue())
width = int(rect.getWidth().getValue())
height = int(rect.getHeight().getValue())
z = rect.getTheZ().getValue()
t = rect.getTheT().getValue()

# Get pixel data
pixels = image.getPrimaryPixels()

# Extract region for each channel
for c in range(image.getSizeC()):
    # Get plane
    plane = pixels.getPlane(z, c, t)

    # Extract ROI region
    roi_region = plane[y:y+height, x:x+width]

    print(f"Channel {c}:")
    print(f"  Mean intensity: {np.mean(roi_region)}")
    print(f"  Max intensity: {np.max(roi_region)}")
```

## Modifying ROIs

### Update Shape Properties

```python
# Get ROI and shape
result = roi_service.findByImage(image_id, None)
roi = result.rois[0]
shape = roi.copyShapes()[0]

# Modify shape (example: change rectangle size)
if isinstance(shape, omero.model.RectangleI):
    shape.setWidth(rdouble(150))
    shape.setHeight(rdouble(100))
    shape.setTextValue(rstring("Updated Rectangle"))

# Save changes
updateService = conn.getUpdateService()
updated_roi = updateService.saveAndReturnObject(roi._obj)
```

### Remove Shape from ROI

```python
result = roi_service.findByImage(image_id, None)

for roi in result.rois:
    for shape in roi.copyShapes():
        # Check condition (e.g., remove by label)
        if (shape.getTextValue() and
            shape.getTextValue().getValue() == "test-Ellipse"):

            print(f"Removing shape {shape.getId().getValue()}")
            roi.removeShape(shape)

            # Save modified ROI
            updateService = conn.getUpdateService()
            roi = updateService.saveAndReturnObject(roi)
```

## Deleting ROIs

### Delete Single ROI

```python
# Delete ROI by ID
roi_id = 123
conn.deleteObjects("Roi", [roi_id], wait=True)
print(f"Deleted ROI {roi_id}")
```

### Delete All ROIs for Image

```python
# Get all ROI IDs for image
result = roi_service.findByImage(image_id, None)
roi_ids = [roi.getId().getValue() for roi in result.rois]

# Delete all
if roi_ids:
    conn.deleteObjects("Roi", roi_ids, wait=True)
    print(f"Deleted {len(roi_ids)} ROIs")
```

## Batch ROI Creation

### Create ROIs for Multiple Images

```python
# Get images
dataset = conn.getObject("Dataset", dataset_id)

for image in dataset.listChildren():
    # Create rectangle at center of each image
    x = image.getSizeX() // 2 - 50
    y = image.getSizeY() // 2 - 50

    rect = omero.model.RectangleI()
    rect.x = rdouble(x)
    rect.y = rdouble(y)
    rect.width = rdouble(100)
    rect.height = rdouble(100)
    rect.theZ = rint(0)
    rect.theT = rint(0)
    rect.textValue = rstring("Auto ROI")

    roi = create_roi(conn, image, [rect])
    print(f"Created ROI for image {image.getName()}")
```

### Create ROIs Across Z-Stack

```python
image = conn.getObject("Image", image_id)
size_z = image.getSizeZ()

# Create rectangle on each Z-section
shapes = []
for z in range(size_z):
    rect = omero.model.RectangleI()
    rect.x = rdouble(100)
    rect.y = rdouble(100)
    rect.width = rdouble(50)
    rect.height = rdouble(50)
    rect.theZ = rint(z)
    rect.theT = rint(0)
    shapes.append(rect)

# Single ROI with shapes across Z
roi = create_roi(conn, image, shapes)
```

## Complete Example

```python
from omero.gateway import BlitzGateway
from omero.rtypes import rdouble, rint, rstring
import omero.model

HOST = 'omero.example.com'
PORT = 4064
USERNAME = 'user'
PASSWORD = 'pass'

def rgba_to_int(r, g, b, a=255):
    return int.from_bytes([r, g, b, a], byteorder='big', signed=True)

with BlitzGateway(USERNAME, PASSWORD, host=HOST, port=PORT) as conn:
    # Get image
    image = conn.getObject("Image", image_id)
    print(f"Processing: {image.getName()}")

    # Create multiple ROIs
    updateService = conn.getUpdateService()

    # ROI 1: Rectangle
    roi1 = omero.model.RoiI()
    roi1.setImage(image._obj)

    rect = omero.model.RectangleI()
    rect.x = rdouble(50)
    rect.y = rdouble(50)
    rect.width = rdouble(100)
    rect.height = rdouble(100)
    rect.theZ = rint(0)
    rect.theT = rint(0)
    rect.textValue = rstring("Cell 1")
    rect.strokeColor = rint(rgba_to_int(255, 0, 0, 255))

    roi1.addShape(rect)
    roi1 = updateService.saveAndReturnObject(roi1)
    print(f"Created ROI 1: {roi1.getId().getValue()}")

    # ROI 2: Ellipse
    roi2 = omero.model.RoiI()
    roi2.setImage(image._obj)

    ellipse = omero.model.EllipseI()
    ellipse.x = rdouble(200)
    ellipse.y = rdouble(150)
    ellipse.radiusX = rdouble(40)
    ellipse.radiusY = rdouble(30)
    ellipse.theZ = rint(0)
    ellipse.theT = rint(0)
    ellipse.textValue = rstring("Cell 2")
    ellipse.strokeColor = rint(rgba_to_int(0, 255, 0, 255))

    roi2.addShape(ellipse)
    roi2 = updateService.saveAndReturnObject(roi2)
    print(f"Created ROI 2: {roi2.getId().getValue()}")

    # Retrieve and analyze
    roi_service = conn.getRoiService()
    result = roi_service.findByImage(image_id, None)

    shape_ids = []
    for roi in result.rois:
        for shape in roi.copyShapes():
            shape_ids.append(shape.id.val)

    # Get statistics
    stats = roi_service.getShapeStatsRestricted(shape_ids, 0, 0, [0])

    for i, stat in enumerate(stats):
        print(f"Shape {shape_ids[i]}:")
        print(f"  Mean intensity: {stat.mean[0]:.2f}")
```

## Best Practices

1. **Organize Shapes**: Group related shapes in single ROIs
2. **Label Shapes**: Use textValue for identification
3. **Set Z and T**: Always specify Z-section and timepoint
4. **Color Coding**: Use consistent colors for shape types
5. **Validate Coordinates**: Ensure shapes are within image bounds
6. **Batch Creation**: Create multiple ROIs in single transaction when possible
7. **Delete Unused**: Remove temporary or test ROIs
8. **Export Data**: Store ROI statistics in tables for later analysis
9. **Version Control**: Document ROI creation methods in annotations
10. **Performance**: Use shape statistics service instead of manual pixel extraction
