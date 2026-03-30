# Data Access & Retrieval

This reference covers navigating OMERO's hierarchical data structure and retrieving objects.

## OMERO Data Hierarchy

### Standard Hierarchy

```
Project
  └─ Dataset
       └─ Image
```

### Screening Hierarchy

```
Screen
  └─ Plate
       └─ Well
            └─ WellSample
                 └─ Image
```

## Listing Objects

### List Projects

```python
# List all projects for current user
for project in conn.listProjects():
    print(f"Project: {project.getName()} (ID: {project.getId()})")
```

### List Projects with Filtering

```python
# Get current user and group
my_exp_id = conn.getUser().getId()
default_group_id = conn.getEventContext().groupId

# List projects with filters
for project in conn.getObjects("Project", opts={
    'owner': my_exp_id,                    # Filter by owner
    'group': default_group_id,             # Filter by group
    'order_by': 'lower(obj.name)',         # Sort alphabetically
    'limit': 10,                           # Limit results
    'offset': 0                            # Pagination offset
}):
    print(f"Project: {project.getName()}")
```

### List Datasets

```python
# List all datasets
for dataset in conn.getObjects("Dataset"):
    print(f"Dataset: {dataset.getName()} (ID: {dataset.getId()})")

# List orphaned datasets (not in any project)
for dataset in conn.getObjects("Dataset", opts={'orphaned': True}):
    print(f"Orphaned Dataset: {dataset.getName()}")
```

### List Images

```python
# List all images
for image in conn.getObjects("Image"):
    print(f"Image: {image.getName()} (ID: {image.getId()})")

# List images in specific dataset
dataset_id = 123
for image in conn.getObjects("Image", opts={'dataset': dataset_id}):
    print(f"Image: {image.getName()}")

# List orphaned images
for image in conn.getObjects("Image", opts={'orphaned': True}):
    print(f"Orphaned Image: {image.getName()}")
```

## Retrieving Objects by ID

### Get Single Object

```python
# Get project by ID
project = conn.getObject("Project", project_id)
if project:
    print(f"Project: {project.getName()}")
else:
    print("Project not found")

# Get dataset by ID
dataset = conn.getObject("Dataset", dataset_id)

# Get image by ID
image = conn.getObject("Image", image_id)
```

### Get Multiple Objects by ID

```python
# Get multiple projects at once
project_ids = [1, 2, 3, 4, 5]
projects = conn.getObjects("Project", project_ids)

for project in projects:
    print(f"Project: {project.getName()}")
```

### Supported Object Types

The `getObject()` and `getObjects()` methods support:
- `"Project"`
- `"Dataset"`
- `"Image"`
- `"Screen"`
- `"Plate"`
- `"Well"`
- `"Roi"`
- `"Annotation"` (and specific types: `"TagAnnotation"`, `"FileAnnotation"`, etc.)
- `"Experimenter"`
- `"ExperimenterGroup"`
- `"Fileset"`

## Query by Attributes

### Query Objects by Name

```python
# Find images with specific name
images = conn.getObjects("Image", attributes={"name": "sample_001.tif"})

for image in images:
    print(f"Found image: {image.getName()} (ID: {image.getId()})")

# Find datasets with specific name
datasets = conn.getObjects("Dataset", attributes={"name": "Control Group"})
```

### Query Annotations by Value

```python
# Find tags with specific text value
tags = conn.getObjects("TagAnnotation",
                      attributes={"textValue": "experiment_tag"})

for tag in tags:
    print(f"Tag: {tag.getValue()}")

# Find map annotations
map_anns = conn.getObjects("MapAnnotation",
                          attributes={"ns": "custom.namespace"})
```

## Navigating Hierarchies

### Navigate Down (Parent to Children)

```python
# Project → Datasets → Images
project = conn.getObject("Project", project_id)

for dataset in project.listChildren():
    print(f"Dataset: {dataset.getName()}")

    for image in dataset.listChildren():
        print(f"  Image: {image.getName()}")
```

### Navigate Up (Child to Parent)

```python
# Image → Dataset → Project
image = conn.getObject("Image", image_id)

# Get parent dataset
dataset = image.getParent()
if dataset:
    print(f"Dataset: {dataset.getName()}")

    # Get parent project
    project = dataset.getParent()
    if project:
        print(f"Project: {project.getName()}")
```

### Complete Hierarchy Traversal

```python
# Traverse complete project hierarchy
for project in conn.getObjects("Project", opts={'order_by': 'lower(obj.name)'}):
    print(f"Project: {project.getName()} (ID: {project.getId()})")

    for dataset in project.listChildren():
        image_count = dataset.countChildren()
        print(f"  Dataset: {dataset.getName()} ({image_count} images)")

        for image in dataset.listChildren():
            print(f"    Image: {image.getName()}")
            print(f"      Size: {image.getSizeX()} x {image.getSizeY()}")
            print(f"      Channels: {image.getSizeC()}")
```

## Screening Data Access

### List Screens and Plates

```python
# List all screens
for screen in conn.getObjects("Screen"):
    print(f"Screen: {screen.getName()} (ID: {screen.getId()})")

    # List plates in screen
    for plate in screen.listChildren():
        print(f"  Plate: {plate.getName()} (ID: {plate.getId()})")
```

### Access Plate Wells

```python
# Get plate
plate = conn.getObject("Plate", plate_id)

# Plate metadata
print(f"Plate: {plate.getName()}")
print(f"Grid size: {plate.getGridSize()}")  # e.g., (8, 12) for 96-well
print(f"Number of fields: {plate.getNumberOfFields()}")

# Iterate through wells
for well in plate.listChildren():
    print(f"Well at row {well.row}, column {well.column}")

    # Count images in well (fields)
    field_count = well.countWellSample()
    print(f"  Number of fields: {field_count}")

    # Access images in well
    for index in range(field_count):
        image = well.getImage(index)
        print(f"    Field {index}: {image.getName()}")
```

### Direct Well Access

```python
# Get specific well by row and column
well = plate.getWell(row=0, column=0)  # Top-left well

# Get image from well
if well.countWellSample() > 0:
    image = well.getImage(0)  # First field
    print(f"Image: {image.getName()}")
```

### Well Sample Access

```python
# Access well samples directly
for well in plate.listChildren():
    for ws in well.listChildren():  # ws = WellSample
        image = ws.getImage()
        print(f"WellSample {ws.getId()}: {image.getName()}")
```

## Image Properties

### Basic Dimensions

```python
image = conn.getObject("Image", image_id)

# Pixel dimensions
print(f"X: {image.getSizeX()}")
print(f"Y: {image.getSizeY()}")
print(f"Z: {image.getSizeZ()} (Z-sections)")
print(f"C: {image.getSizeC()} (Channels)")
print(f"T: {image.getSizeT()} (Time points)")

# Image type
print(f"Type: {image.getPixelsType()}")  # e.g., 'uint16', 'uint8'
```

### Physical Dimensions

```python
# Get pixel sizes with units (OMERO 5.1.0+)
size_x_obj = image.getPixelSizeX(units=True)
size_y_obj = image.getPixelSizeY(units=True)
size_z_obj = image.getPixelSizeZ(units=True)

print(f"Pixel Size X: {size_x_obj.getValue()} {size_x_obj.getSymbol()}")
print(f"Pixel Size Y: {size_y_obj.getValue()} {size_y_obj.getSymbol()}")
print(f"Pixel Size Z: {size_z_obj.getValue()} {size_z_obj.getSymbol()}")

# Get as floats (micrometers)
size_x = image.getPixelSizeX()  # Returns float in µm
size_y = image.getPixelSizeY()
size_z = image.getPixelSizeZ()
```

### Channel Information

```python
# Iterate through channels
for channel in image.getChannels():
    print(f"Channel {channel.getLabel()}:")
    print(f"  Color: {channel.getColor().getRGB()}")
    print(f"  Lookup Table: {channel.getLut()}")
    print(f"  Wavelength: {channel.getEmissionWave()}")
```

### Image Metadata

```python
# Acquisition date
acquired = image.getAcquisitionDate()
if acquired:
    print(f"Acquired: {acquired}")

# Description
description = image.getDescription()
if description:
    print(f"Description: {description}")

# Owner and group
details = image.getDetails()
print(f"Owner: {details.getOwner().getFullName()}")
print(f"Username: {details.getOwner().getOmeName()}")
print(f"Group: {details.getGroup().getName()}")
print(f"Created: {details.getCreationEvent().getTime()}")
```

## Object Ownership and Permissions

### Get Owner Information

```python
# Get object owner
obj = conn.getObject("Dataset", dataset_id)
owner = obj.getDetails().getOwner()

print(f"Owner ID: {owner.getId()}")
print(f"Username: {owner.getOmeName()}")
print(f"Full Name: {owner.getFullName()}")
print(f"Email: {owner.getEmail()}")
```

### Get Group Information

```python
# Get object's group
obj = conn.getObject("Image", image_id)
group = obj.getDetails().getGroup()

print(f"Group: {group.getName()} (ID: {group.getId()})")
```

### Filter by Owner

```python
# Get objects for specific user
user_id = 5
datasets = conn.getObjects("Dataset", opts={'owner': user_id})

for dataset in datasets:
    print(f"Dataset: {dataset.getName()}")
```

## Advanced Queries

### Pagination

```python
# Paginate through large result sets
page_size = 50
offset = 0

while True:
    images = list(conn.getObjects("Image", opts={
        'limit': page_size,
        'offset': offset,
        'order_by': 'obj.id'
    }))

    if not images:
        break

    for image in images:
        print(f"Image: {image.getName()}")

    offset += page_size
```

### Sorting Results

```python
# Sort by name (case-insensitive)
projects = conn.getObjects("Project", opts={
    'order_by': 'lower(obj.name)'
})

# Sort by ID (ascending)
datasets = conn.getObjects("Dataset", opts={
    'order_by': 'obj.id'
})

# Sort by name (descending)
images = conn.getObjects("Image", opts={
    'order_by': 'lower(obj.name) desc'
})
```

### Combining Filters

```python
# Complex query with multiple filters
my_exp_id = conn.getUser().getId()
default_group_id = conn.getEventContext().groupId

images = conn.getObjects("Image", opts={
    'owner': my_exp_id,
    'group': default_group_id,
    'dataset': dataset_id,
    'order_by': 'lower(obj.name)',
    'limit': 100,
    'offset': 0
})
```

## Counting Objects

### Count Children

```python
# Count images in dataset
dataset = conn.getObject("Dataset", dataset_id)
image_count = dataset.countChildren()
print(f"Dataset contains {image_count} images")

# Count datasets in project
project = conn.getObject("Project", project_id)
dataset_count = project.countChildren()
print(f"Project contains {dataset_count} datasets")
```

### Count Annotations

```python
# Count annotations on object
image = conn.getObject("Image", image_id)
annotation_count = image.countAnnotations()
print(f"Image has {annotation_count} annotations")
```

## Orphaned Objects

### Find Orphaned Datasets

```python
# Datasets not linked to any project
orphaned_datasets = conn.getObjects("Dataset", opts={'orphaned': True})

print("Orphaned Datasets:")
for dataset in orphaned_datasets:
    print(f"  {dataset.getName()} (ID: {dataset.getId()})")
    print(f"    Owner: {dataset.getDetails().getOwner().getOmeName()}")
    print(f"    Images: {dataset.countChildren()}")
```

### Find Orphaned Images

```python
# Images not in any dataset
orphaned_images = conn.getObjects("Image", opts={'orphaned': True})

print("Orphaned Images:")
for image in orphaned_images:
    print(f"  {image.getName()} (ID: {image.getId()})")
```

### Find Orphaned Plates

```python
# Plates not in any screen
orphaned_plates = conn.getObjects("Plate", opts={'orphaned': True})

for plate in orphaned_plates:
    print(f"Orphaned Plate: {plate.getName()}")
```

## Complete Example

```python
from omero.gateway import BlitzGateway

# Connection details
HOST = 'omero.example.com'
PORT = 4064
USERNAME = 'user'
PASSWORD = 'pass'

# Connect and query data
with BlitzGateway(USERNAME, PASSWORD, host=HOST, port=PORT) as conn:
    # Get user context
    user = conn.getUser()
    group = conn.getGroupFromContext()

    print(f"Connected as {user.getName()} in group {group.getName()}")
    print()

    # List projects with datasets and images
    for project in conn.getObjects("Project", opts={'limit': 5}):
        print(f"Project: {project.getName()} (ID: {project.getId()})")

        for dataset in project.listChildren():
            image_count = dataset.countChildren()
            print(f"  Dataset: {dataset.getName()} ({image_count} images)")

            # Show first 3 images
            for idx, image in enumerate(dataset.listChildren()):
                if idx >= 3:
                    print(f"    ... and {image_count - 3} more")
                    break
                print(f"    Image: {image.getName()}")
                print(f"      Size: {image.getSizeX()}x{image.getSizeY()}")
                print(f"      Channels: {image.getSizeC()}, Z: {image.getSizeZ()}")

        print()
```

## Best Practices

1. **Use Context Managers**: Always use `with` statements for automatic connection cleanup
2. **Limit Results**: Use `limit` and `offset` for large datasets
3. **Filter Early**: Apply filters to reduce data transfer
4. **Check for None**: Always check if `getObject()` returns None before using
5. **Efficient Traversal**: Use `listChildren()` instead of querying separately
6. **Count Before Loading**: Use `countChildren()` to decide whether to load data
7. **Group Context**: Set appropriate group context before cross-group queries
8. **Pagination**: Implement pagination for large result sets
9. **Object Reuse**: Cache frequently accessed objects to reduce queries
10. **Error Handling**: Wrap queries in try-except blocks for robustness
