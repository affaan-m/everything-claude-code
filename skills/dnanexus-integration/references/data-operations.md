# DNAnexus Data Operations

## Overview

DNAnexus provides comprehensive data management capabilities for files, records, databases, and other data objects. All data operations can be performed via the Python SDK (dxpy) or command-line interface (dx).

## Data Object Types

### Files
Binary or text data stored on the platform.

### Records
Structured data objects with arbitrary JSON details and metadata.

### Databases
Structured database objects for relational data.

### Applets and Apps
Executable programs (covered in app-development.md).

### Workflows
Multi-step analysis pipelines.

## Data Object Lifecycle

### States

**Open State**: Data can be modified
- Files: Contents can be written
- Records: Details can be updated
- Applets: Created in closed state by default

**Closed State**: Data becomes immutable
- File contents are fixed
- Metadata fields are locked (types, details, links, visibility)
- Objects are ready for sharing and analysis

### Transitions

```
Create (open) → Modify → Close (immutable)
```

Most objects start open and require explicit closure:
```python
# Close a file
file_obj.close()
```

Some objects can be created and closed in one operation:
```python
# Create closed record
record = dxpy.new_dxrecord(details={...}, close=True)
```

## File Operations

### Uploading Files

**From local file**:
```python
import dxpy

# Upload a file
file_obj = dxpy.upload_local_file("data.txt", project="project-xxxx")
print(f"Uploaded: {file_obj.get_id()}")
```

**With metadata**:
```python
file_obj = dxpy.upload_local_file(
    "data.txt",
    name="my_data",
    project="project-xxxx",
    folder="/results",
    properties={"sample": "sample1", "type": "raw"},
    tags=["experiment1", "batch2"]
)
```

**Streaming upload**:
```python
# For large files or generated data
file_obj = dxpy.new_dxfile(project="project-xxxx", name="output.txt")
file_obj.write("Line 1\n")
file_obj.write("Line 2\n")
file_obj.close()
```

### Downloading Files

**To local file**:
```python
# Download by ID
dxpy.download_dxfile("file-xxxx", "local_output.txt")

# Download using handler
file_obj = dxpy.DXFile("file-xxxx")
dxpy.download_dxfile(file_obj.get_id(), "local_output.txt")
```

**Read file contents**:
```python
file_obj = dxpy.DXFile("file-xxxx")
with file_obj.open_file() as f:
    contents = f.read()
```

**Download to specific directory**:
```python
dxpy.download_dxfile("file-xxxx", "/path/to/directory/filename.txt")
```

### File Metadata

**Get file information**:
```python
file_obj = dxpy.DXFile("file-xxxx")
describe = file_obj.describe()

print(f"Name: {describe['name']}")
print(f"Size: {describe['size']} bytes")
print(f"State: {describe['state']}")
print(f"Created: {describe['created']}")
```

**Update file metadata**:
```python
file_obj.set_properties({"experiment": "exp1", "version": "v2"})
file_obj.add_tags(["validated", "published"])
file_obj.rename("new_name.txt")
```

## Record Operations

Records store structured metadata with arbitrary JSON.

### Creating Records

```python
# Create a record
record = dxpy.new_dxrecord(
    name="sample_metadata",
    types=["SampleMetadata"],
    details={
        "sample_id": "S001",
        "tissue": "blood",
        "age": 45,
        "conditions": ["diabetes"]
    },
    project="project-xxxx",
    close=True
)
```

### Reading Records

```python
record = dxpy.DXRecord("record-xxxx")
describe = record.describe()

# Access details
details = record.get_details()
sample_id = details["sample_id"]
tissue = details["tissue"]
```

### Updating Records

```python
# Record must be open to update
record = dxpy.DXRecord("record-xxxx")
details = record.get_details()
details["processed"] = True
record.set_details(details)
record.close()
```

## Search and Discovery

### Finding Data Objects

**Search by name**:
```python
results = dxpy.find_data_objects(
    name="*.fastq",
    project="project-xxxx",
    folder="/raw_data"
)

for result in results:
    print(f"{result['describe']['name']}: {result['id']}")
```

**Search by properties**:
```python
results = dxpy.find_data_objects(
    classname="file",
    properties={"sample": "sample1", "type": "processed"},
    project="project-xxxx"
)
```

**Search by type**:
```python
# Find all records of specific type
results = dxpy.find_data_objects(
    classname="record",
    typename="SampleMetadata",
    project="project-xxxx"
)
```

**Search with state filter**:
```python
# Find only closed files
results = dxpy.find_data_objects(
    classname="file",
    state="closed",
    project="project-xxxx"
)
```

### System-wide Search

```python
# Search across all accessible projects
results = dxpy.find_data_objects(
    name="important_data.txt",
    describe=True  # Include full descriptions
)
```

## Cloning and Copying

### Clone Data Between Projects

```python
# Clone file to another project
new_file = dxpy.DXFile("file-xxxx").clone(
    project="project-yyyy",
    folder="/imported_data"
)
```

### Clone Multiple Objects

```python
# Clone folder contents
files = dxpy.find_data_objects(
    classname="file",
    project="project-xxxx",
    folder="/results"
)

for file in files:
    file_obj = dxpy.DXFile(file['id'])
    file_obj.clone(project="project-yyyy", folder="/backup")
```

## Project Management

### Creating Projects

```python
# Create a new project
project = dxpy.api.project_new({
    "name": "My Analysis Project",
    "description": "RNA-seq analysis for experiment X"
})

project_id = project['id']
```

### Project Permissions

```python
# Invite user to project
dxpy.api.project_invite(
    project_id,
    {
        "invitee": "user-xxxx",
        "level": "CONTRIBUTE"  # VIEW, UPLOAD, CONTRIBUTE, ADMINISTER
    }
)
```

### List Projects

```python
# List accessible projects
projects = dxpy.find_projects(describe=True)

for proj in projects:
    desc = proj['describe']
    print(f"{desc['name']}: {proj['id']}")
```

## Folder Operations

### Creating Folders

```python
# Create nested folders
dxpy.api.project_new_folder(
    "project-xxxx",
    {"folder": "/analysis/batch1/results", "parents": True}
)
```

### Moving Objects

```python
# Move file to different folder
file_obj = dxpy.DXFile("file-xxxx", project="project-xxxx")
file_obj.move("/new_location")
```

### Removing Objects

```python
# Remove file from project (not permanent deletion)
dxpy.api.project_remove_objects(
    "project-xxxx",
    {"objects": ["file-xxxx"]}
)

# Permanent deletion
file_obj = dxpy.DXFile("file-xxxx")
file_obj.remove()
```

## Archival

### Archive Data

Archived data is moved to cheaper long-term storage:

```python
# Archive a file
dxpy.api.project_archive(
    "project-xxxx",
    {"files": ["file-xxxx"]}
)
```

### Unarchive Data

```python
# Unarchive when needed
dxpy.api.project_unarchive(
    "project-xxxx",
    {"files": ["file-xxxx"]}
)
```

## Batch Operations

### Upload Multiple Files

```python
import os

# Upload all files in directory
for filename in os.listdir("./data"):
    filepath = os.path.join("./data", filename)
    if os.path.isfile(filepath):
        dxpy.upload_local_file(
            filepath,
            project="project-xxxx",
            folder="/batch_upload"
        )
```

### Download Multiple Files

```python
# Download all files from folder
files = dxpy.find_data_objects(
    classname="file",
    project="project-xxxx",
    folder="/results"
)

for file in files:
    file_obj = dxpy.DXFile(file['id'])
    filename = file_obj.describe()['name']
    dxpy.download_dxfile(file['id'], f"./downloads/{filename}")
```

## Best Practices

1. **Close Files**: Always close files after writing to make them accessible
2. **Use Properties**: Tag data with meaningful properties for easier discovery
3. **Organize Folders**: Use logical folder structures
4. **Clean Up**: Remove temporary or obsolete data
5. **Batch Operations**: Group operations when processing many objects
6. **Error Handling**: Check object states before operations
7. **Permissions**: Verify project permissions before data operations
8. **Archive Old Data**: Use archival for long-term storage cost savings
