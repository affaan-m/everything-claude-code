# Metadata & Annotations

This reference covers creating and managing annotations in OMERO, including tags, key-value pairs, file attachments, and comments.

## Annotation Types

OMERO supports several annotation types:

- **TagAnnotation**: Text labels for categorization
- **MapAnnotation**: Key-value pairs for structured metadata
- **FileAnnotation**: File attachments (PDFs, CSVs, analysis results, etc.)
- **CommentAnnotation**: Free-text comments
- **LongAnnotation**: Integer values
- **DoubleAnnotation**: Floating-point values
- **BooleanAnnotation**: Boolean values
- **TimestampAnnotation**: Date/time stamps
- **TermAnnotation**: Ontology terms

## Tag Annotations

### Create and Link Tag

```python
import omero.gateway

# Create new tag
tag_ann = omero.gateway.TagAnnotationWrapper(conn)
tag_ann.setValue("Experiment 2024")
tag_ann.setDescription("Optional description of this tag")
tag_ann.save()

# Link tag to an object
project = conn.getObject("Project", project_id)
project.linkAnnotation(tag_ann)
```

### Create Tag with Namespace

```python
# Create tag with custom namespace
tag_ann = omero.gateway.TagAnnotationWrapper(conn)
tag_ann.setValue("Quality Control")
tag_ann.setNs("mylab.qc.tags")
tag_ann.save()

# Link to image
image = conn.getObject("Image", image_id)
image.linkAnnotation(tag_ann)
```

### Reuse Existing Tag

```python
# Find existing tag
tag_id = 123
tag_ann = conn.getObject("TagAnnotation", tag_id)

# Link to multiple images
for image in conn.getObjects("Image", [img1, img2, img3]):
    image.linkAnnotation(tag_ann)
```

### Create Tag Set (Tag with Children)

```python
# Create tag set (parent tag)
tag_set = omero.gateway.TagAnnotationWrapper(conn)
tag_set.setValue("Cell Types")
tag_set.save()

# Create child tags
tags = ["HeLa", "U2OS", "HEK293"]
for tag_value in tags:
    tag = omero.gateway.TagAnnotationWrapper(conn)
    tag.setValue(tag_value)
    tag.save()

    # Link child to parent
    tag_set.linkAnnotation(tag)
```

## Map Annotations (Key-Value Pairs)

### Create Map Annotation

```python
import omero.gateway
import omero.constants.metadata

# Prepare key-value data
key_value_data = [
    ["Drug Name", "Monastrol"],
    ["Concentration", "5 mg/ml"],
    ["Treatment Time", "24 hours"],
    ["Temperature", "37C"]
]

# Create map annotation
map_ann = omero.gateway.MapAnnotationWrapper(conn)

# Use standard client namespace
namespace = omero.constants.metadata.NSCLIENTMAPANNOTATION
map_ann.setNs(namespace)

# Set data
map_ann.setValue(key_value_data)
map_ann.save()

# Link to dataset
dataset = conn.getObject("Dataset", dataset_id)
dataset.linkAnnotation(map_ann)
```

### Custom Namespace for Map Annotations

```python
# Use custom namespace for organization-specific metadata
key_value_data = [
    ["Microscope", "Zeiss LSM 880"],
    ["Objective", "63x Oil"],
    ["Laser Power", "10%"]
]

map_ann = omero.gateway.MapAnnotationWrapper(conn)
map_ann.setNs("mylab.microscopy.settings")
map_ann.setValue(key_value_data)
map_ann.save()

image = conn.getObject("Image", image_id)
image.linkAnnotation(map_ann)
```

### Read Map Annotation

```python
# Get map annotation
image = conn.getObject("Image", image_id)

for ann in image.listAnnotations():
    if isinstance(ann, omero.gateway.MapAnnotationWrapper):
        print(f"Map Annotation (ID: {ann.getId()}):")
        print(f"Namespace: {ann.getNs()}")

        # Get key-value pairs
        for key, value in ann.getValue():
            print(f"  {key}: {value}")
```

## File Annotations

### Upload and Attach File

```python
import os

# Prepare file
file_path = "analysis_results.csv"

# Create file annotation
namespace = "mylab.analysis.results"
file_ann = conn.createFileAnnfromLocalFile(
    file_path,
    mimetype="text/csv",
    ns=namespace,
    desc="Cell segmentation results"
)

# Link to dataset
dataset = conn.getObject("Dataset", dataset_id)
dataset.linkAnnotation(file_ann)
```

### Supported MIME Types

Common MIME types:
- Text: `"text/plain"`, `"text/csv"`, `"text/tab-separated-values"`
- Documents: `"application/pdf"`, `"application/vnd.ms-excel"`
- Images: `"image/png"`, `"image/jpeg"`
- Data: `"application/json"`, `"application/xml"`
- Archives: `"application/zip"`, `"application/gzip"`

### Upload Multiple Files

```python
files = ["figure1.pdf", "figure2.pdf", "table1.csv"]
namespace = "publication.supplementary"

dataset = conn.getObject("Dataset", dataset_id)

for file_path in files:
    file_ann = conn.createFileAnnfromLocalFile(
        file_path,
        mimetype="application/octet-stream",
        ns=namespace,
        desc=f"Supplementary file: {os.path.basename(file_path)}"
    )
    dataset.linkAnnotation(file_ann)
```

### Download File Annotation

```python
import os

# Get object with file annotation
image = conn.getObject("Image", image_id)

# Download directory
download_path = "./downloads"
os.makedirs(download_path, exist_ok=True)

# Filter by namespace
namespace = "mylab.analysis.results"

for ann in image.listAnnotations(ns=namespace):
    if isinstance(ann, omero.gateway.FileAnnotationWrapper):
        file_name = ann.getFile().getName()
        file_path = os.path.join(download_path, file_name)

        print(f"Downloading: {file_name}")

        # Download file in chunks
        with open(file_path, 'wb') as f:
            for chunk in ann.getFileInChunks():
                f.write(chunk)

        print(f"Saved to: {file_path}")
```

### Get File Annotation Metadata

```python
for ann in dataset.listAnnotations():
    if isinstance(ann, omero.gateway.FileAnnotationWrapper):
        orig_file = ann.getFile()

        print(f"File Annotation ID: {ann.getId()}")
        print(f"  File Name: {orig_file.getName()}")
        print(f"  File Size: {orig_file.getSize()} bytes")
        print(f"  MIME Type: {orig_file.getMimetype()}")
        print(f"  Namespace: {ann.getNs()}")
        print(f"  Description: {ann.getDescription()}")
```

## Comment Annotations

### Add Comment

```python
# Create comment
comment = omero.gateway.CommentAnnotationWrapper(conn)
comment.setValue("This image shows excellent staining quality")
comment.save()

# Link to image
image = conn.getObject("Image", image_id)
image.linkAnnotation(comment)
```

### Add Comment with Namespace

```python
comment = omero.gateway.CommentAnnotationWrapper(conn)
comment.setValue("Approved for publication")
comment.setNs("mylab.publication.status")
comment.save()

dataset = conn.getObject("Dataset", dataset_id)
dataset.linkAnnotation(comment)
```

## Numeric Annotations

### Long Annotation (Integer)

```python
# Create long annotation
long_ann = omero.gateway.LongAnnotationWrapper(conn)
long_ann.setValue(42)
long_ann.setNs("mylab.cell.count")
long_ann.save()

image = conn.getObject("Image", image_id)
image.linkAnnotation(long_ann)
```

### Double Annotation (Float)

```python
# Create double annotation
double_ann = omero.gateway.DoubleAnnotationWrapper(conn)
double_ann.setValue(3.14159)
double_ann.setNs("mylab.fluorescence.intensity")
double_ann.save()

image = conn.getObject("Image", image_id)
image.linkAnnotation(double_ann)
```

## Listing Annotations

### List All Annotations on Object

```python
import omero.model

# Get object
project = conn.getObject("Project", project_id)

# List all annotations
for ann in project.listAnnotations():
    print(f"Annotation ID: {ann.getId()}")
    print(f"  Type: {ann.OMERO_TYPE}")
    print(f"  Added by: {ann.link.getDetails().getOwner().getOmeName()}")

    # Type-specific handling
    if ann.OMERO_TYPE == omero.model.TagAnnotationI:
        print(f"  Tag value: {ann.getTextValue()}")

    elif isinstance(ann, omero.gateway.MapAnnotationWrapper):
        print(f"  Map data: {ann.getValue()}")

    elif isinstance(ann, omero.gateway.FileAnnotationWrapper):
        print(f"  File: {ann.getFile().getName()}")

    elif isinstance(ann, omero.gateway.CommentAnnotationWrapper):
        print(f"  Comment: {ann.getValue()}")

    print()
```

### Filter Annotations by Namespace

```python
# Get annotations with specific namespace
namespace = "mylab.qc.tags"

for ann in image.listAnnotations(ns=namespace):
    print(f"Found annotation: {ann.getId()}")

    if isinstance(ann, omero.gateway.MapAnnotationWrapper):
        for key, value in ann.getValue():
            print(f"  {key}: {value}")
```

### Get First Annotation with Namespace

```python
# Get single annotation by namespace
namespace = "mylab.analysis.results"
ann = dataset.getAnnotation(namespace)

if ann:
    print(f"Found annotation with namespace: {ann.getNs()}")
else:
    print("No annotation found with that namespace")
```

### Query Annotations Across Multiple Objects

```python
# Get all tag annotations linked to image IDs
image_ids = [1, 2, 3, 4, 5]

for link in conn.getAnnotationLinks('Image', parent_ids=image_ids):
    ann = link.getChild()

    if isinstance(ann._obj, omero.model.TagAnnotationI):
        print(f"Image {link.getParent().getId()}: Tag '{ann.getTextValue()}'")
```

## Counting Annotations

```python
# Count annotations on project
project_id = 123
count = conn.countAnnotations('Project', [project_id])
print(f"Project has {count[project_id]} annotations")

# Count annotations on multiple images
image_ids = [1, 2, 3]
counts = conn.countAnnotations('Image', image_ids)

for image_id, count in counts.items():
    print(f"Image {image_id}: {count} annotations")
```

## Annotation Links

### Create Annotation Link Manually

```python
# Get annotation and image
tag = conn.getObject("TagAnnotation", tag_id)
image = conn.getObject("Image", image_id)

# Create link
link = omero.model.ImageAnnotationLinkI()
link.setParent(omero.model.ImageI(image.getId(), False))
link.setChild(omero.model.TagAnnotationI(tag.getId(), False))

# Save link
conn.getUpdateService().saveAndReturnObject(link)
```

### Update Annotation Links

```python
# Get existing links
annotation_ids = [1, 2, 3]
new_tag_id = 5

for link in conn.getAnnotationLinks('Image', ann_ids=annotation_ids):
    print(f"Image ID: {link.getParent().id}")

    # Change linked annotation
    link._obj.child = omero.model.TagAnnotationI(new_tag_id, False)
    link.save()
```

## Removing Annotations

### Delete Annotations

```python
# Get image
image = conn.getObject("Image", image_id)

# Collect annotation IDs to delete
to_delete = []
namespace = "mylab.temp.annotations"

for ann in image.listAnnotations(ns=namespace):
    to_delete.append(ann.getId())

# Delete annotations
if to_delete:
    conn.deleteObjects('Annotation', to_delete, wait=True)
    print(f"Deleted {len(to_delete)} annotations")
```

### Unlink Annotations (Keep Annotation, Remove Link)

```python
# Get image
image = conn.getObject("Image", image_id)

# Collect link IDs to delete
to_delete = []

for ann in image.listAnnotations():
    if isinstance(ann, omero.gateway.TagAnnotationWrapper):
        to_delete.append(ann.link.getId())

# Delete links (annotations remain in database)
if to_delete:
    conn.deleteObjects("ImageAnnotationLink", to_delete, wait=True)
    print(f"Unlinked {len(to_delete)} annotations")
```

### Delete Specific Annotation Types

```python
import omero.gateway

# Delete only map annotations
image = conn.getObject("Image", image_id)
to_delete = []

for ann in image.listAnnotations():
    if isinstance(ann, omero.gateway.MapAnnotationWrapper):
        to_delete.append(ann.getId())

conn.deleteObjects('Annotation', to_delete, wait=True)
```

## Annotation Ownership

### Set Annotation Owner (Admin Only)

```python
import omero.model

# Create tag with specific owner
tag_ann = omero.gateway.TagAnnotationWrapper(conn)
tag_ann.setValue("Admin Tag")

# Set owner (requires admin privileges)
user_id = 5
tag_ann._obj.details.owner = omero.model.ExperimenterI(user_id, False)
tag_ann.save()
```

### Create Annotation as Another User (Admin Only)

```python
# Admin connection
admin_conn = BlitzGateway(admin_user, admin_pass, host=host, port=4064)
admin_conn.connect()

# Get target user
user_id = 10
user = admin_conn.getObject("Experimenter", user_id).getName()

# Create connection as user
user_conn = admin_conn.suConn(user)

# Create annotation as that user
map_ann = omero.gateway.MapAnnotationWrapper(user_conn)
map_ann.setNs("mylab.metadata")
map_ann.setValue([["key", "value"]])
map_ann.save()

# Link to project
project = admin_conn.getObject("Project", project_id)
project.linkAnnotation(map_ann)

# Close connections
user_conn.close()
admin_conn.close()
```

## Bulk Annotation Operations

### Tag Multiple Images

```python
# Create or get tag
tag = omero.gateway.TagAnnotationWrapper(conn)
tag.setValue("Validated")
tag.save()

# Get images to tag
dataset = conn.getObject("Dataset", dataset_id)

# Tag all images in dataset
for image in dataset.listChildren():
    image.linkAnnotation(tag)
    print(f"Tagged image: {image.getName()}")
```

### Batch Add Map Annotations

```python
# Prepare metadata for multiple images
image_metadata = {
    101: [["Quality", "Good"], ["Reviewed", "Yes"]],
    102: [["Quality", "Excellent"], ["Reviewed", "Yes"]],
    103: [["Quality", "Poor"], ["Reviewed", "No"]]
}

# Add annotations
for image_id, kv_data in image_metadata.items():
    image = conn.getObject("Image", image_id)

    if image:
        map_ann = omero.gateway.MapAnnotationWrapper(conn)
        map_ann.setNs("mylab.qc")
        map_ann.setValue(kv_data)
        map_ann.save()

        image.linkAnnotation(map_ann)
        print(f"Annotated image {image_id}")
```

## Namespaces

### Standard OMERO Namespaces

```python
import omero.constants.metadata as omero_ns

# Client map annotation namespace
omero_ns.NSCLIENTMAPANNOTATION
# "openmicroscopy.org/omero/client/mapAnnotation"

# Bulk annotations namespace
omero_ns.NSBULKANNOTATIONS
# "openmicroscopy.org/omero/bulk_annotations"
```

### Custom Namespaces

Best practices for custom namespaces:
- Use reverse domain notation: `"org.mylab.category.subcategory"`
- Be specific: `"com.company.project.analysis.v1"`
- Include version if schema may change: `"mylab.metadata.v2"`

```python
# Define namespaces
NS_QC = "org.mylab.quality_control"
NS_ANALYSIS = "org.mylab.image_analysis.v1"
NS_PUBLICATION = "org.mylab.publication.2024"

# Use in annotations
map_ann.setNs(NS_ANALYSIS)
```

## Load All Annotations by Type

### Load All File Annotations

```python
# Define namespaces to include/exclude
ns_to_include = ["mylab.analysis.results"]
ns_to_exclude = []

# Get metadata service
metadataService = conn.getMetadataService()

# Load all file annotations with namespace
annotations = metadataService.loadSpecifiedAnnotations(
    'omero.model.FileAnnotation',
    ns_to_include,
    ns_to_exclude,
    None
)

for ann in annotations:
    print(f"File Annotation ID: {ann.getId().getValue()}")
    print(f"  File: {ann.getFile().getName().getValue()}")
    print(f"  Size: {ann.getFile().getSize().getValue()} bytes")
```

## Complete Example

```python
from omero.gateway import BlitzGateway
import omero.gateway
import omero.constants.metadata

HOST = 'omero.example.com'
PORT = 4064
USERNAME = 'user'
PASSWORD = 'pass'

with BlitzGateway(USERNAME, PASSWORD, host=HOST, port=PORT) as conn:
    # Get dataset
    dataset = conn.getObject("Dataset", dataset_id)

    # Add tag
    tag = omero.gateway.TagAnnotationWrapper(conn)
    tag.setValue("Analysis Complete")
    tag.save()
    dataset.linkAnnotation(tag)

    # Add map annotation with metadata
    metadata = [
        ["Analysis Date", "2024-10-20"],
        ["Software", "CellProfiler 4.2"],
        ["Pipeline", "cell_segmentation_v3"]
    ]
    map_ann = omero.gateway.MapAnnotationWrapper(conn)
    map_ann.setNs(omero.constants.metadata.NSCLIENTMAPANNOTATION)
    map_ann.setValue(metadata)
    map_ann.save()
    dataset.linkAnnotation(map_ann)

    # Add file annotation
    file_ann = conn.createFileAnnfromLocalFile(
        "analysis_summary.pdf",
        mimetype="application/pdf",
        ns="mylab.reports",
        desc="Analysis summary report"
    )
    dataset.linkAnnotation(file_ann)

    # Add comment
    comment = omero.gateway.CommentAnnotationWrapper(conn)
    comment.setValue("Dataset ready for review")
    comment.save()
    dataset.linkAnnotation(comment)

    print(f"Added 4 annotations to dataset {dataset.getName()}")
```

## Best Practices

1. **Use Namespaces**: Always use namespaces to organize annotations
2. **Descriptive Tags**: Use clear, consistent tag names
3. **Structured Metadata**: Prefer map annotations over comments for structured data
4. **File Organization**: Use descriptive filenames and MIME types
5. **Link Reuse**: Reuse existing tags instead of creating duplicates
6. **Batch Operations**: Process multiple objects in loops for efficiency
7. **Error Handling**: Check for successful saves before linking
8. **Cleanup**: Remove temporary annotations when no longer needed
9. **Documentation**: Document custom namespace meanings
10. **Permissions**: Consider annotation ownership for collaborative workflows
