# DNAnexus Python SDK (dxpy)

## Overview

The dxpy library provides Python bindings to interact with the DNAnexus Platform. It's available both within the DNAnexus Execution Environment (for apps running on the platform) and for external scripts accessing the API.

## Installation

```bash
# Install dxpy
pip install dxpy

# Or using conda
conda install -c bioconda dxpy
```

**Requirements**: Python 3.8 or higher

## Authentication

### Login

```bash
# Login via command line
dx login
```

### API Token

```python
import dxpy

# Set authentication token
dxpy.set_security_context({
    "auth_token_type": "Bearer",
    "auth_token": "YOUR_API_TOKEN"
})
```

### Environment Variables

```bash
# Set token via environment
export DX_SECURITY_CONTEXT='{"auth_token": "YOUR_TOKEN", "auth_token_type": "Bearer"}'
```

## Core Classes

### DXFile

Handler for file objects.

```python
import dxpy

# Get file handler
file_obj = dxpy.DXFile("file-xxxx")

# Get file info
desc = file_obj.describe()
print(f"Name: {desc['name']}")
print(f"Size: {desc['size']} bytes")

# Download file
dxpy.download_dxfile(file_obj.get_id(), "local_file.txt")

# Read file contents
with file_obj.open_file() as f:
    contents = f.read()

# Update metadata
file_obj.set_properties({"key": "value"})
file_obj.add_tags(["tag1", "tag2"])
file_obj.rename("new_name.txt")

# Close file
file_obj.close()
```

### DXRecord

Handler for record objects.

```python
# Create record
record = dxpy.new_dxrecord(
    name="metadata",
    types=["Metadata"],
    details={"key": "value"},
    project="project-xxxx",
    close=True
)

# Get record handler
record = dxpy.DXRecord("record-xxxx")

# Get details
details = record.get_details()

# Update details (must be open)
record.set_details({"updated": True})
record.close()
```

### DXApplet

Handler for applet objects.

```python
# Get applet
applet = dxpy.DXApplet("applet-xxxx")

# Get applet info
desc = applet.describe()
print(f"Name: {desc['name']}")
print(f"Version: {desc.get('version', 'N/A')}")

# Run applet
job = applet.run({
    "input1": {"$dnanexus_link": "file-yyyy"},
    "param1": "value"
})
```

### DXApp

Handler for app objects.

```python
# Get app by name
app = dxpy.DXApp(name="my-app")

# Or by ID
app = dxpy.DXApp("app-xxxx")

# Run app
job = app.run({
    "input": {"$dnanexus_link": "file-yyyy"}
})
```

### DXWorkflow

Handler for workflow objects.

```python
# Create workflow
workflow = dxpy.new_dxworkflow(
    name="My Pipeline",
    project="project-xxxx"
)

# Add stage
stage = workflow.add_stage(
    dxpy.DXApplet("applet-xxxx"),
    name="Step 1"
)

# Set stage input
stage.set_input("input1", {"$dnanexus_link": "file-yyyy"})

# Close workflow
workflow.close()

# Run workflow
analysis = workflow.run({})
```

### DXJob

Handler for job objects.

```python
# Get job
job = dxpy.DXJob("job-xxxx")

# Get job info
desc = job.describe()
print(f"State: {desc['state']}")
print(f"Name: {desc['name']}")

# Wait for completion
job.wait_on_done()

# Get output
output = desc.get("output", {})

# Terminate job
job.terminate()
```

### DXProject

Handler for project objects.

```python
# Get project
project = dxpy.DXProject("project-xxxx")

# Get project info
desc = project.describe()
print(f"Name: {desc['name']}")
print(f"Region: {desc.get('region', 'N/A')}")

# List folder contents
contents = project.list_folder("/data")
print(f"Objects: {contents['objects']}")
print(f"Folders: {contents['folders']}")
```

## High-Level Functions

### File Operations

```python
# Upload file
file_obj = dxpy.upload_local_file(
    "local_file.txt",
    project="project-xxxx",
    folder="/data",
    name="uploaded_file.txt"
)

# Download file
dxpy.download_dxfile("file-xxxx", "downloaded.txt")

# Upload string as file
file_obj = dxpy.upload_string("Hello World", project="project-xxxx")
```

### Creating Data Objects

```python
# New file
file_obj = dxpy.new_dxfile(
    project="project-xxxx",
    name="output.txt"
)
file_obj.write("content")
file_obj.close()

# New record
record = dxpy.new_dxrecord(
    name="metadata",
    details={"key": "value"},
    project="project-xxxx"
)
```

### Search Functions

```python
# Find data objects
results = dxpy.find_data_objects(
    classname="file",
    name="*.fastq",
    project="project-xxxx",
    folder="/raw_data",
    describe=True
)

for result in results:
    print(f"{result['describe']['name']}: {result['id']}")

# Find projects
projects = dxpy.find_projects(
    name="*analysis*",
    describe=True
)

# Find jobs
jobs = dxpy.find_jobs(
    project="project-xxxx",
    created_after="2025-01-01",
    state="failed"
)

# Find apps
apps = dxpy.find_apps(
    category="Read Mapping"
)
```

### Links and References

```python
# Create link to data object
link = dxpy.dxlink("file-xxxx")
# Returns: {"$dnanexus_link": "file-xxxx"}

# Create link with project
link = dxpy.dxlink("file-xxxx", "project-yyyy")

# Get job output reference (for chaining jobs)
output_ref = job.get_output_ref("output_name")
```

## API Methods

### Direct API Calls

For operations not covered by high-level functions:

```python
# Call API method directly
result = dxpy.api.project_new({
    "name": "New Project",
    "description": "Created via API"
})

project_id = result["id"]

# File describe
file_desc = dxpy.api.file_describe("file-xxxx")

# System find data objects
results = dxpy.api.system_find_data_objects({
    "class": "file",
    "project": "project-xxxx",
    "name": {"regexp": ".*\\.bam$"}
})
```

### Common API Methods

```python
# Project operations
dxpy.api.project_invite("project-xxxx", {"invitee": "user-yyyy", "level": "VIEW"})
dxpy.api.project_new_folder("project-xxxx", {"folder": "/new_folder"})

# File operations
dxpy.api.file_close("file-xxxx")
dxpy.api.file_remove("file-xxxx")

# Job operations
dxpy.api.job_terminate("job-xxxx")
dxpy.api.job_get_log("job-xxxx")
```

## App Development Functions

### Entry Points

```python
import dxpy

@dxpy.entry_point('main')
def main(input1, input2):
    """Main entry point for app"""
    # Process inputs
    result = process(input1, input2)

    # Return outputs
    return {
        "output1": result
    }

# Required at end of app code
dxpy.run()
```

### Creating Subjobs

```python
# Spawn subjob within app
subjob = dxpy.new_dxjob(
    fn_input={"input": value},
    fn_name="helper_function"
)

# Get output reference
output_ref = subjob.get_output_ref("result")

@dxpy.entry_point('helper_function')
def helper_function(input):
    # Process
    return {"result": output}
```

## Error Handling

### Exception Types

```python
import dxpy
from dxpy.exceptions import DXError, DXAPIError

try:
    file_obj = dxpy.DXFile("file-xxxx")
    desc = file_obj.describe()
except DXAPIError as e:
    print(f"API Error: {e}")
    print(f"Status Code: {e.code}")
except DXError as e:
    print(f"General Error: {e}")
```

### Common Exceptions

- `DXAPIError`: API request failed
- `DXError`: General DNAnexus error
- `ResourceNotFound`: Object doesn't exist
- `PermissionDenied`: Insufficient permissions
- `InvalidInput`: Invalid input parameters

## Utility Functions

### Getting Handlers

```python
# Get handler from ID/link
handler = dxpy.get_handler("file-xxxx")
# Returns DXFile, DXRecord, etc. based on object class

# Bind handler to project
handler = dxpy.DXFile("file-xxxx", project="project-yyyy")
```

### Describe Methods

```python
# Describe any object
desc = dxpy.describe("file-xxxx")
print(desc)

# Describe with fields
desc = dxpy.describe("file-xxxx", fields={"name": True, "size": True})
```

## Configuration

### Setting Project Context

```python
# Set default project
dxpy.set_workspace_id("project-xxxx")

# Get current project
project_id = dxpy.WORKSPACE_ID
```

### Setting Region

```python
# Set API server
dxpy.set_api_server_info(host="api.dnanexus.com", port=443)
```

## Best Practices

1. **Use High-Level Functions**: Prefer `upload_local_file()` over manual file creation
2. **Handler Reuse**: Create handlers once and reuse them
3. **Batch Operations**: Use find functions to process multiple objects
4. **Error Handling**: Always wrap API calls in try-except blocks
5. **Close Objects**: Remember to close files and records after modifications
6. **Project Context**: Set workspace context for apps
7. **API Token Security**: Never hardcode tokens in source code
8. **Describe Fields**: Request only needed fields to reduce latency
9. **Search Filters**: Use specific filters to narrow search results
10. **Link Format**: Use `dxpy.dxlink()` for consistent link creation

## Common Patterns

### Upload and Process Pattern

```python
# Upload input
input_file = dxpy.upload_local_file("data.txt", project="project-xxxx")

# Run analysis
job = dxpy.DXApplet("applet-xxxx").run({
    "input": dxpy.dxlink(input_file.get_id())
})

# Wait and download result
job.wait_on_done()
output_id = job.describe()["output"]["result"]["$dnanexus_link"]
dxpy.download_dxfile(output_id, "result.txt")
```

### Batch File Processing

```python
# Find all FASTQ files
files = dxpy.find_data_objects(
    classname="file",
    name="*.fastq",
    project="project-xxxx"
)

# Process each file
jobs = []
for file_result in files:
    job = dxpy.DXApplet("applet-xxxx").run({
        "input": dxpy.dxlink(file_result["id"])
    })
    jobs.append(job)

# Wait for all jobs
for job in jobs:
    job.wait_on_done()
    print(f"Job {job.get_id()} completed")
```

### Workflow with Dependencies

```python
# Job 1
job1 = applet1.run({"input": data})

# Job 2 depends on job1 output
job2 = applet2.run({
    "input": job1.get_output_ref("result")
})

# Job 3 depends on job2
job3 = applet3.run({
    "input": job2.get_output_ref("processed")
})

# Wait for final result
job3.wait_on_done()
```
