# OMERO Tables

This reference covers creating and managing structured tabular data in OMERO using OMERO.tables.

## OMERO.tables Overview

OMERO.tables provides a way to store structured tabular data associated with OMERO objects. Tables are stored as HDF5 files and can be queried efficiently. Common use cases include:

- Storing quantitative measurements from images
- Recording analysis results
- Tracking experimental metadata
- Linking measurements to specific images or ROIs

## Column Types

OMERO.tables supports various column types:

- **LongColumn**: Integer values (64-bit)
- **DoubleColumn**: Floating-point values
- **StringColumn**: Text data (fixed max length)
- **BoolColumn**: Boolean values
- **LongArrayColumn**: Arrays of integers
- **DoubleArrayColumn**: Arrays of floats
- **FileColumn**: References to OMERO files
- **ImageColumn**: References to OMERO images
- **RoiColumn**: References to OMERO ROIs
- **WellColumn**: References to OMERO wells

## Creating Tables

### Basic Table Creation

```python
from random import random
import omero.grid

# Create unique table name
table_name = f"MyAnalysisTable_{random()}"

# Define columns (empty data for initialization)
col1 = omero.grid.LongColumn('ImageID', 'Image identifier', [])
col2 = omero.grid.DoubleColumn('MeanIntensity', 'Mean pixel intensity', [])
col3 = omero.grid.StringColumn('Category', 'Classification', 64, [])

columns = [col1, col2, col3]

# Get resources and create table
resources = conn.c.sf.sharedResources()
repository_id = resources.repositories().descriptions[0].getId().getValue()
table = resources.newTable(repository_id, table_name)

# Initialize table with column definitions
table.initialize(columns)
```

### Add Data to Table

```python
# Prepare data
image_ids = [1, 2, 3, 4, 5]
intensities = [123.4, 145.2, 98.7, 156.3, 132.8]
categories = ["Good", "Good", "Poor", "Excellent", "Good"]

# Create data columns
data_col1 = omero.grid.LongColumn('ImageID', 'Image identifier', image_ids)
data_col2 = omero.grid.DoubleColumn('MeanIntensity', 'Mean pixel intensity', intensities)
data_col3 = omero.grid.StringColumn('Category', 'Classification', 64, categories)

data = [data_col1, data_col2, data_col3]

# Add data to table
table.addData(data)

# Get file reference
orig_file = table.getOriginalFile()
table.close()  # Always close table when done
```

### Link Table to Dataset

```python
# Create file annotation from table
orig_file_id = orig_file.id.val
file_ann = omero.model.FileAnnotationI()
file_ann.setFile(omero.model.OriginalFileI(orig_file_id, False))
file_ann = conn.getUpdateService().saveAndReturnObject(file_ann)

# Link to dataset
link = omero.model.DatasetAnnotationLinkI()
link.setParent(omero.model.DatasetI(dataset_id, False))
link.setChild(omero.model.FileAnnotationI(file_ann.getId().getValue(), False))
conn.getUpdateService().saveAndReturnObject(link)

print(f"Linked table to dataset {dataset_id}")
```

## Column Types in Detail

### Long Column (Integers)

```python
# Column for integer values
image_ids = [101, 102, 103, 104, 105]
col = omero.grid.LongColumn('ImageID', 'Image identifier', image_ids)
```

### Double Column (Floats)

```python
# Column for floating-point values
measurements = [12.34, 56.78, 90.12, 34.56, 78.90]
col = omero.grid.DoubleColumn('Measurement', 'Value in microns', measurements)
```

### String Column (Text)

```python
# Column for text (max length required)
labels = ["Control", "Treatment A", "Treatment B", "Control", "Treatment A"]
col = omero.grid.StringColumn('Condition', 'Experimental condition', 64, labels)
```

### Boolean Column

```python
# Column for boolean values
flags = [True, False, True, True, False]
col = omero.grid.BoolColumn('QualityPass', 'Passes quality control', flags)
```

### Image Column (References to Images)

```python
# Column linking to OMERO images
image_ids = [101, 102, 103, 104, 105]
col = omero.grid.ImageColumn('Image', 'Source image', image_ids)
```

### ROI Column (References to ROIs)

```python
# Column linking to OMERO ROIs
roi_ids = [201, 202, 203, 204, 205]
col = omero.grid.RoiColumn('ROI', 'Associated ROI', roi_ids)
```

### Array Columns

```python
# Column for arrays of doubles
histogram_data = [
    [10, 20, 30, 40],
    [15, 25, 35, 45],
    [12, 22, 32, 42]
]
col = omero.grid.DoubleArrayColumn('Histogram', 'Intensity histogram', histogram_data)

# Column for arrays of longs
bin_counts = [[5, 10, 15], [8, 12, 16], [6, 11, 14]]
col = omero.grid.LongArrayColumn('Bins', 'Histogram bins', bin_counts)
```

## Reading Table Data

### Open Existing Table

```python
# Get table file by name
orig_table_file = conn.getObject("OriginalFile",
                                 attributes={'name': table_name})

# Open table
resources = conn.c.sf.sharedResources()
table = resources.openTable(orig_table_file._obj)

print(f"Opened table: {table.getOriginalFile().getName().getValue()}")
print(f"Number of rows: {table.getNumberOfRows()}")
```

### Read All Data

```python
# Get column headers
print("Columns:")
for col in table.getHeaders():
    print(f"  {col.name}: {col.description}")

# Read all data
row_count = table.getNumberOfRows()
data = table.readCoordinates(range(row_count))

# Display data
for col in data.columns:
    print(f"\nColumn: {col.name}")
    for value in col.values:
        print(f"  {value}")

table.close()
```

### Read Specific Rows

```python
# Read rows 10-20
start = 10
stop = 20
data = table.read(list(range(table.getHeaders().__len__())), start, stop)

for col in data.columns:
    print(f"Column: {col.name}")
    for value in col.values:
        print(f"  {value}")
```

### Read Specific Columns

```python
# Read only columns 0 and 2
column_indices = [0, 2]
start = 0
stop = table.getNumberOfRows()

data = table.read(column_indices, start, stop)

for col in data.columns:
    print(f"Column: {col.name}")
    print(f"Values: {col.values}")
```

## Querying Tables

### Query with Conditions

```python
# Query rows where MeanIntensity > 100
row_count = table.getNumberOfRows()

query_rows = table.getWhereList(
    "(MeanIntensity > 100)",
    variables={},
    start=0,
    stop=row_count,
    step=0
)

print(f"Found {len(query_rows)} matching rows")

# Read matching rows
data = table.readCoordinates(query_rows)

for col in data.columns:
    print(f"\n{col.name}:")
    for value in col.values:
        print(f"  {value}")
```

### Complex Queries

```python
# Multiple conditions with AND
query_rows = table.getWhereList(
    "(MeanIntensity > 100) & (MeanIntensity < 150)",
    variables={},
    start=0,
    stop=row_count,
    step=0
)

# Multiple conditions with OR
query_rows = table.getWhereList(
    "(Category == 'Good') | (Category == 'Excellent')",
    variables={},
    start=0,
    stop=row_count,
    step=0
)

# String matching
query_rows = table.getWhereList(
    "(Category == 'Good')",
    variables={},
    start=0,
    stop=row_count,
    step=0
)
```

## Complete Example: Image Analysis Results

```python
from omero.gateway import BlitzGateway
import omero.grid
import omero.model
import numpy as np

HOST = 'omero.example.com'
PORT = 4064
USERNAME = 'user'
PASSWORD = 'pass'

with BlitzGateway(USERNAME, PASSWORD, host=HOST, port=PORT) as conn:
    # Get dataset
    dataset = conn.getObject("Dataset", dataset_id)
    print(f"Analyzing dataset: {dataset.getName()}")

    # Collect measurements from images
    image_ids = []
    mean_intensities = []
    max_intensities = []
    cell_counts = []

    for image in dataset.listChildren():
        image_ids.append(image.getId())

        # Get pixel data
        pixels = image.getPrimaryPixels()
        plane = pixels.getPlane(0, 0, 0)  # Z=0, C=0, T=0

        # Calculate statistics
        mean_intensities.append(float(np.mean(plane)))
        max_intensities.append(float(np.max(plane)))

        # Simulate cell count (would be from actual analysis)
        cell_counts.append(np.random.randint(50, 200))

    # Create table
    table_name = f"Analysis_Results_{dataset.getId()}"

    # Define columns
    col1 = omero.grid.ImageColumn('Image', 'Source image', [])
    col2 = omero.grid.DoubleColumn('MeanIntensity', 'Mean pixel value', [])
    col3 = omero.grid.DoubleColumn('MaxIntensity', 'Maximum pixel value', [])
    col4 = omero.grid.LongColumn('CellCount', 'Number of cells detected', [])

    # Initialize table
    resources = conn.c.sf.sharedResources()
    repository_id = resources.repositories().descriptions[0].getId().getValue()
    table = resources.newTable(repository_id, table_name)
    table.initialize([col1, col2, col3, col4])

    # Add data
    data_col1 = omero.grid.ImageColumn('Image', 'Source image', image_ids)
    data_col2 = omero.grid.DoubleColumn('MeanIntensity', 'Mean pixel value',
                                        mean_intensities)
    data_col3 = omero.grid.DoubleColumn('MaxIntensity', 'Maximum pixel value',
                                        max_intensities)
    data_col4 = omero.grid.LongColumn('CellCount', 'Number of cells detected',
                                      cell_counts)

    table.addData([data_col1, data_col2, data_col3, data_col4])

    # Get file and close table
    orig_file = table.getOriginalFile()
    table.close()

    # Link to dataset
    orig_file_id = orig_file.id.val
    file_ann = omero.model.FileAnnotationI()
    file_ann.setFile(omero.model.OriginalFileI(orig_file_id, False))
    file_ann = conn.getUpdateService().saveAndReturnObject(file_ann)

    link = omero.model.DatasetAnnotationLinkI()
    link.setParent(omero.model.DatasetI(dataset_id, False))
    link.setChild(omero.model.FileAnnotationI(file_ann.getId().getValue(), False))
    conn.getUpdateService().saveAndReturnObject(link)

    print(f"Created and linked table with {len(image_ids)} rows")

    # Query results
    table = resources.openTable(orig_file)

    high_cell_count_rows = table.getWhereList(
        "(CellCount > 100)",
        variables={},
        start=0,
        stop=table.getNumberOfRows(),
        step=0
    )

    print(f"Images with >100 cells: {len(high_cell_count_rows)}")

    # Read those rows
    data = table.readCoordinates(high_cell_count_rows)
    for i in range(len(high_cell_count_rows)):
        img_id = data.columns[0].values[i]
        count = data.columns[3].values[i]
        print(f"  Image {img_id}: {count} cells")

    table.close()
```

## Retrieve Tables from Objects

### Find Tables Attached to Dataset

```python
# Get dataset
dataset = conn.getObject("Dataset", dataset_id)

# List file annotations
for ann in dataset.listAnnotations():
    if isinstance(ann, omero.gateway.FileAnnotationWrapper):
        file_obj = ann.getFile()
        file_name = file_obj.getName()

        # Check if it's a table (might have specific naming pattern)
        if "Table" in file_name or file_name.endswith(".h5"):
            print(f"Found table: {file_name} (ID: {file_obj.getId()})")

            # Open and inspect
            resources = conn.c.sf.sharedResources()
            table = resources.openTable(file_obj._obj)

            print(f"  Rows: {table.getNumberOfRows()}")
            print(f"  Columns:")
            for col in table.getHeaders():
                print(f"    {col.name}")

            table.close()
```

## Updating Tables

### Append Rows

```python
# Open existing table
resources = conn.c.sf.sharedResources()
table = resources.openTable(orig_file._obj)

# Prepare new data
new_image_ids = [106, 107]
new_intensities = [88.9, 92.3]
new_categories = ["Good", "Excellent"]

# Create data columns
data_col1 = omero.grid.LongColumn('ImageID', '', new_image_ids)
data_col2 = omero.grid.DoubleColumn('MeanIntensity', '', new_intensities)
data_col3 = omero.grid.StringColumn('Category', '', 64, new_categories)

# Append data
table.addData([data_col1, data_col2, data_col3])

print(f"New row count: {table.getNumberOfRows()}")
table.close()
```

## Deleting Tables

### Delete Table File

```python
# Get file object
orig_file = conn.getObject("OriginalFile", file_id)

# Delete file (also deletes table)
conn.deleteObjects("OriginalFile", [file_id], wait=True)
print(f"Deleted table file {file_id}")
```

### Unlink Table from Object

```python
# Find annotation links
dataset = conn.getObject("Dataset", dataset_id)

for ann in dataset.listAnnotations():
    if isinstance(ann, omero.gateway.FileAnnotationWrapper):
        if "Table" in ann.getFile().getName():
            # Delete link (keeps table, removes association)
            conn.deleteObjects("DatasetAnnotationLink",
                             [ann.link.getId()],
                             wait=True)
            print(f"Unlinked table from dataset")
```

## Best Practices

1. **Descriptive Names**: Use meaningful table and column names
2. **Close Tables**: Always close tables after use
3. **String Length**: Set appropriate max length for string columns
4. **Link to Objects**: Attach tables to relevant datasets or projects
5. **Use References**: Use ImageColumn, RoiColumn for object references
6. **Query Efficiently**: Use getWhereList() instead of reading all data
7. **Document**: Add descriptions to columns
8. **Version Control**: Include version info in table name or metadata
9. **Batch Operations**: Add data in batches for better performance
10. **Error Handling**: Check for None returns and handle exceptions

## Common Patterns

### ROI Measurements Table

```python
# Table structure for ROI measurements
columns = [
    omero.grid.ImageColumn('Image', 'Source image', []),
    omero.grid.RoiColumn('ROI', 'Measured ROI', []),
    omero.grid.LongColumn('ChannelIndex', 'Channel number', []),
    omero.grid.DoubleColumn('Area', 'ROI area in pixels', []),
    omero.grid.DoubleColumn('MeanIntensity', 'Mean intensity', []),
    omero.grid.DoubleColumn('IntegratedDensity', 'Sum of intensities', []),
    omero.grid.StringColumn('CellType', 'Cell classification', 32, [])
]
```

### Time Series Data Table

```python
# Table structure for time series measurements
columns = [
    omero.grid.ImageColumn('Image', 'Time series image', []),
    omero.grid.LongColumn('Timepoint', 'Time index', []),
    omero.grid.DoubleColumn('Timestamp', 'Time in seconds', []),
    omero.grid.DoubleColumn('Value', 'Measured value', []),
    omero.grid.StringColumn('Measurement', 'Type of measurement', 64, [])
]
```

### Screening Results Table

```python
# Table structure for screening plate analysis
columns = [
    omero.grid.WellColumn('Well', 'Plate well', []),
    omero.grid.LongColumn('FieldIndex', 'Field number', []),
    omero.grid.DoubleColumn('CellCount', 'Number of cells', []),
    omero.grid.DoubleColumn('Viability', 'Percent viable', []),
    omero.grid.StringColumn('Phenotype', 'Observed phenotype', 128, []),
    omero.grid.BoolColumn('Hit', 'Hit in screen', [])
]
```
