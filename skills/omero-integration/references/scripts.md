# Scripts & Batch Operations

This reference covers creating OMERO.scripts for server-side processing and batch operations.

## OMERO.scripts Overview

OMERO.scripts are Python scripts that run on the OMERO server and can be called from OMERO clients (web, insight, CLI). They function as plugins that extend OMERO functionality.

### Key Features

- **Server-Side Execution**: Scripts run on the server, avoiding data transfer
- **Client Integration**: Callable from any OMERO client with auto-generated UI
- **Parameter Handling**: Define input parameters with validation
- **Result Reporting**: Return images, files, or messages to clients
- **Batch Processing**: Process multiple images or datasets efficiently

## Basic Script Structure

### Minimal Script Template

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-

import omero
from omero.gateway import BlitzGateway
import omero.scripts as scripts
from omero.rtypes import rlong, rstring, robject

def run_script():
    """
    Main script function.
    """
    # Script definition
    client = scripts.client(
        'Script_Name.py',
        """
        Description of what this script does.
        """,

        # Input parameters
        scripts.String("Data_Type", optional=False, grouping="1",
                      description="Choose source of images",
                      values=[rstring('Dataset'), rstring('Image')],
                      default=rstring('Dataset')),

        scripts.Long("IDs", optional=False, grouping="2",
                    description="Dataset or Image ID(s)").ofType(rlong(0)),

        # Outputs
        namespaces=[omero.constants.namespaces.NSDYNAMIC],
        version="1.0"
    )

    try:
        # Get connection
        conn = BlitzGateway(client_obj=client)

        # Get script parameters
        script_params = client.getInputs(unwrap=True)
        data_type = script_params["Data_Type"]
        ids = script_params["IDs"]

        # Process data
        message = process_data(conn, data_type, ids)

        # Return results
        client.setOutput("Message", rstring(message))

    finally:
        client.closeSession()

def process_data(conn, data_type, ids):
    """
    Process images based on parameters.
    """
    # Implementation here
    return "Processing complete"

if __name__ == "__main__":
    run_script()
```

## Script Parameters

### Parameter Types

```python
# String parameter
scripts.String("Name", optional=False,
              description="Enter a name")

# String with choices
scripts.String("Mode", optional=False,
              values=[rstring('Fast'), rstring('Accurate')],
              default=rstring('Fast'))

# Integer parameter
scripts.Long("ImageID", optional=False,
            description="Image to process").ofType(rlong(0))

# List of integers
scripts.List("ImageIDs", optional=False,
            description="Multiple images").ofType(rlong(0))

# Float parameter
scripts.Float("Threshold", optional=True,
             description="Threshold value",
             min=0.0, max=1.0, default=0.5)

# Boolean parameter
scripts.Bool("SaveResults", optional=True,
            description="Save results to OMERO",
            default=True)
```

### Parameter Grouping

```python
# Group related parameters
scripts.String("Data_Type", grouping="1",
              description="Source type",
              values=[rstring('Dataset'), rstring('Image')])

scripts.Long("Dataset_ID", grouping="1.1",
            description="Dataset ID").ofType(rlong(0))

scripts.List("Image_IDs", grouping="1.2",
            description="Image IDs").ofType(rlong(0))
```

## Accessing Input Data

### Get Script Parameters

```python
# Inside run_script()
client = scripts.client(...)

# Get parameters as Python objects
script_params = client.getInputs(unwrap=True)

# Access individual parameters
data_type = script_params.get("Data_Type", "Image")
image_ids = script_params.get("Image_IDs", [])
threshold = script_params.get("Threshold", 0.5)
save_results = script_params.get("SaveResults", True)
```

### Get Images from Parameters

```python
def get_images_from_params(conn, script_params):
    """
    Get image objects based on script parameters.
    """
    images = []

    data_type = script_params["Data_Type"]

    if data_type == "Dataset":
        dataset_id = script_params["Dataset_ID"]
        dataset = conn.getObject("Dataset", dataset_id)
        if dataset:
            images = list(dataset.listChildren())

    elif data_type == "Image":
        image_ids = script_params["Image_IDs"]
        for image_id in image_ids:
            image = conn.getObject("Image", image_id)
            if image:
                images.append(image)

    return images
```

## Processing Images

### Batch Image Processing

```python
def process_images(conn, images, threshold):
    """
    Process multiple images.
    """
    results = []

    for image in images:
        print(f"Processing: {image.getName()}")

        # Get pixel data
        pixels = image.getPrimaryPixels()
        size_z = image.getSizeZ()
        size_c = image.getSizeC()
        size_t = image.getSizeT()

        # Process each plane
        for z in range(size_z):
            for c in range(size_c):
                for t in range(size_t):
                    plane = pixels.getPlane(z, c, t)

                    # Apply threshold
                    binary = (plane > threshold).astype(np.uint8)

                    # Count features
                    feature_count = count_features(binary)

                    results.append({
                        'image_id': image.getId(),
                        'image_name': image.getName(),
                        'z': z, 'c': c, 't': t,
                        'feature_count': feature_count
                    })

    return results
```

## Generating Outputs

### Return Messages

```python
# Simple message
message = "Processed 10 images successfully"
client.setOutput("Message", rstring(message))

# Detailed message
message = "Results:\n"
for result in results:
    message += f"Image {result['image_id']}: {result['count']} cells\n"
client.setOutput("Message", rstring(message))
```

### Return Images

```python
# Return newly created image
new_image = conn.createImageFromNumpySeq(...)
client.setOutput("New_Image", robject(new_image._obj))
```

### Return Files

```python
# Create and return file annotation
file_ann = conn.createFileAnnfromLocalFile(
    output_file_path,
    mimetype="text/csv",
    ns="analysis.results"
)

client.setOutput("Result_File", robject(file_ann._obj))
```

### Return Tables

```python
# Create OMERO table and return
resources = conn.c.sf.sharedResources()
table = create_results_table(resources, results)
orig_file = table.getOriginalFile()
table.close()

# Create file annotation
file_ann = omero.model.FileAnnotationI()
file_ann.setFile(orig_file)
file_ann = conn.getUpdateService().saveAndReturnObject(file_ann)

client.setOutput("Results_Table", robject(file_ann._obj))
```

## Complete Example Scripts

### Example 1: Maximum Intensity Projection

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-

import omero
from omero.gateway import BlitzGateway
import omero.scripts as scripts
from omero.rtypes import rlong, rstring, robject
import numpy as np

def run_script():
    client = scripts.client(
        'Maximum_Intensity_Projection.py',
        """
        Creates maximum intensity projection from Z-stack images.
        """,

        scripts.String("Data_Type", optional=False, grouping="1",
                      description="Process images from",
                      values=[rstring('Dataset'), rstring('Image')],
                      default=rstring('Image')),

        scripts.List("IDs", optional=False, grouping="2",
                    description="Dataset or Image ID(s)").ofType(rlong(0)),

        scripts.Bool("Link_to_Source", optional=True, grouping="3",
                    description="Link results to source dataset",
                    default=True),

        version="1.0"
    )

    try:
        conn = BlitzGateway(client_obj=client)
        script_params = client.getInputs(unwrap=True)

        # Get images
        images = get_images(conn, script_params)
        created_images = []

        for image in images:
            print(f"Processing: {image.getName()}")

            # Create MIP
            mip_image = create_mip(conn, image)
            if mip_image:
                created_images.append(mip_image)

        # Report results
        if created_images:
            message = f"Created {len(created_images)} MIP images"
            # Return first image for display
            client.setOutput("Message", rstring(message))
            client.setOutput("Result", robject(created_images[0]._obj))
        else:
            client.setOutput("Message", rstring("No images created"))

    finally:
        client.closeSession()

def get_images(conn, script_params):
    """Get images from script parameters."""
    images = []
    data_type = script_params["Data_Type"]
    ids = script_params["IDs"]

    if data_type == "Dataset":
        for dataset_id in ids:
            dataset = conn.getObject("Dataset", dataset_id)
            if dataset:
                images.extend(list(dataset.listChildren()))
    else:
        for image_id in ids:
            image = conn.getObject("Image", image_id)
            if image:
                images.append(image)

    return images

def create_mip(conn, source_image):
    """Create maximum intensity projection."""
    pixels = source_image.getPrimaryPixels()
    size_z = source_image.getSizeZ()
    size_c = source_image.getSizeC()
    size_t = source_image.getSizeT()

    if size_z == 1:
        print("  Skipping (single Z-section)")
        return None

    def plane_gen():
        for c in range(size_c):
            for t in range(size_t):
                # Get Z-stack
                z_stack = []
                for z in range(size_z):
                    plane = pixels.getPlane(z, c, t)
                    z_stack.append(plane)

                # Maximum projection
                max_proj = np.max(z_stack, axis=0)
                yield max_proj

    # Create new image
    new_image = conn.createImageFromNumpySeq(
        plane_gen(),
        f"{source_image.getName()}_MIP",
        1, size_c, size_t,
        description="Maximum intensity projection",
        dataset=source_image.getParent()
    )

    return new_image

if __name__ == "__main__":
    run_script()
```

### Example 2: Batch ROI Analysis

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-

import omero
from omero.gateway import BlitzGateway
import omero.scripts as scripts
from omero.rtypes import rlong, rstring, robject
import omero.grid

def run_script():
    client = scripts.client(
        'Batch_ROI_Analysis.py',
        """
        Analyzes ROIs across multiple images and creates results table.
        """,

        scripts.Long("Dataset_ID", optional=False,
                    description="Dataset with images and ROIs").ofType(rlong(0)),

        scripts.Long("Channel_Index", optional=True,
                    description="Channel to analyze (0-indexed)",
                    default=0, min=0),

        version="1.0"
    )

    try:
        conn = BlitzGateway(client_obj=client)
        script_params = client.getInputs(unwrap=True)

        dataset_id = script_params["Dataset_ID"]
        channel_index = script_params["Channel_Index"]

        # Get dataset
        dataset = conn.getObject("Dataset", dataset_id)
        if not dataset:
            client.setOutput("Message", rstring("Dataset not found"))
            return

        # Analyze ROIs
        results = analyze_rois(conn, dataset, channel_index)

        # Create table
        table_file = create_results_table(conn, dataset, results)

        # Report
        message = f"Analyzed {len(results)} ROIs from {dataset.getName()}"
        client.setOutput("Message", rstring(message))
        client.setOutput("Results_Table", robject(table_file._obj))

    finally:
        client.closeSession()

def analyze_rois(conn, dataset, channel_index):
    """Analyze all ROIs in dataset images."""
    roi_service = conn.getRoiService()
    results = []

    for image in dataset.listChildren():
        result = roi_service.findByImage(image.getId(), None)

        if not result.rois:
            continue

        # Get shape IDs
        shape_ids = []
        for roi in result.rois:
            for shape in roi.copyShapes():
                shape_ids.append(shape.id.val)

        # Get statistics
        stats = roi_service.getShapeStatsRestricted(
            shape_ids, 0, 0, [channel_index]
        )

        # Store results
        for i, stat in enumerate(stats):
            results.append({
                'image_id': image.getId(),
                'image_name': image.getName(),
                'shape_id': shape_ids[i],
                'mean': stat.mean[channel_index],
                'min': stat.min[channel_index],
                'max': stat.max[channel_index],
                'sum': stat.sum[channel_index],
                'area': stat.pointsCount[channel_index]
            })

    return results

def create_results_table(conn, dataset, results):
    """Create OMERO table from results."""
    # Prepare data
    image_ids = [r['image_id'] for r in results]
    shape_ids = [r['shape_id'] for r in results]
    means = [r['mean'] for r in results]
    mins = [r['min'] for r in results]
    maxs = [r['max'] for r in results]
    sums = [r['sum'] for r in results]
    areas = [r['area'] for r in results]

    # Create table
    resources = conn.c.sf.sharedResources()
    repository_id = resources.repositories().descriptions[0].getId().getValue()
    table = resources.newTable(repository_id, f"ROI_Analysis_{dataset.getId()}")

    # Define columns
    columns = [
        omero.grid.ImageColumn('Image', 'Source image', []),
        omero.grid.LongColumn('ShapeID', 'ROI shape ID', []),
        omero.grid.DoubleColumn('Mean', 'Mean intensity', []),
        omero.grid.DoubleColumn('Min', 'Min intensity', []),
        omero.grid.DoubleColumn('Max', 'Max intensity', []),
        omero.grid.DoubleColumn('Sum', 'Integrated density', []),
        omero.grid.LongColumn('Area', 'Area in pixels', [])
    ]
    table.initialize(columns)

    # Add data
    data = [
        omero.grid.ImageColumn('Image', 'Source image', image_ids),
        omero.grid.LongColumn('ShapeID', 'ROI shape ID', shape_ids),
        omero.grid.DoubleColumn('Mean', 'Mean intensity', means),
        omero.grid.DoubleColumn('Min', 'Min intensity', mins),
        omero.grid.DoubleColumn('Max', 'Max intensity', maxs),
        omero.grid.DoubleColumn('Sum', 'Integrated density', sums),
        omero.grid.LongColumn('Area', 'Area in pixels', areas)
    ]
    table.addData(data)

    orig_file = table.getOriginalFile()
    table.close()

    # Link to dataset
    file_ann = omero.model.FileAnnotationI()
    file_ann.setFile(orig_file)
    file_ann = conn.getUpdateService().saveAndReturnObject(file_ann)

    link = omero.model.DatasetAnnotationLinkI()
    link.setParent(dataset._obj)
    link.setChild(file_ann)
    conn.getUpdateService().saveAndReturnObject(link)

    return file_ann

if __name__ == "__main__":
    run_script()
```

## Script Deployment

### Installation Location

Scripts should be placed in the OMERO server scripts directory:
```
OMERO_DIR/lib/scripts/
```

### Recommended Structure

```
lib/scripts/
├── analysis/
│   ├── Cell_Counter.py
│   └── ROI_Analyzer.py
├── export/
│   ├── Export_Images.py
│   └── Export_ROIs.py
└── util/
    └── Helper_Functions.py
```

### Testing Scripts

```bash
# Test script syntax
python Script_Name.py

# Upload to OMERO
omero script upload Script_Name.py

# List scripts
omero script list

# Run script from CLI
omero script launch Script_ID Dataset_ID=123
```

## Best Practices

1. **Error Handling**: Always use try-finally to close session
2. **Progress Updates**: Print status messages for long operations
3. **Parameter Validation**: Check parameters before processing
4. **Memory Management**: Process large datasets in batches
5. **Documentation**: Include clear description and parameter docs
6. **Versioning**: Include version number in script
7. **Namespaces**: Use appropriate namespaces for outputs
8. **Return Objects**: Return created objects for client display
9. **Logging**: Use print() for server logs
10. **Testing**: Test with various input combinations

## Common Patterns

### Progress Reporting

```python
total = len(images)
for idx, image in enumerate(images):
    print(f"Processing {idx + 1}/{total}: {image.getName()}")
    # Process image
```

### Error Collection

```python
errors = []
for image in images:
    try:
        process_image(image)
    except Exception as e:
        errors.append(f"{image.getName()}: {str(e)}")

if errors:
    message = "Completed with errors:\n" + "\n".join(errors)
else:
    message = "All images processed successfully"
```

### Resource Cleanup

```python
try:
    # Script processing
    pass
finally:
    # Clean up temporary files
    if os.path.exists(temp_file):
        os.remove(temp_file)
    client.closeSession()
```
