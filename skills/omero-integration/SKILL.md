---
name: omero-integration
description: Microscopy data management platform. Access images via Python, retrieve datasets, analyze pixels, manage ROIs/annotations, batch processing, for high-content screening and microscopy workflows.
license: Unknown
metadata:
    skill-author: K-Dense Inc.
---

# OMERO Integration

## Overview

OMERO is an open-source platform for managing, visualizing, and analyzing microscopy images and metadata. Access images via Python API, retrieve datasets, analyze pixels, manage ROIs and annotations, for high-content screening and microscopy workflows.

## When to Use This Skill

This skill should be used when:
- Working with OMERO Python API (omero-py) to access microscopy data
- Retrieving images, datasets, projects, or screening data programmatically
- Analyzing pixel data and creating derived images
- Creating or managing ROIs (regions of interest) on microscopy images
- Adding annotations, tags, or metadata to OMERO objects
- Storing measurement results in OMERO tables
- Creating server-side scripts for batch processing
- Performing high-content screening analysis

## Core Capabilities

This skill covers eight major capability areas. Each is documented in detail in the references/ directory:

### 1. Connection & Session Management
**File**: `references/connection.md`

Establish secure connections to OMERO servers, manage sessions, handle authentication, and work with group contexts. Use this for initial setup and connection patterns.

**Common scenarios:**
- Connect to OMERO server with credentials
- Use existing session IDs
- Switch between group contexts
- Manage connection lifecycle with context managers

### 2. Data Access & Retrieval
**File**: `references/data_access.md`

Navigate OMERO's hierarchical data structure (Projects → Datasets → Images) and screening data (Screens → Plates → Wells). Retrieve objects, query by attributes, and access metadata.

**Common scenarios:**
- List all projects and datasets for a user
- Retrieve images by ID or dataset
- Access screening plate data
- Query objects with filters

### 3. Metadata & Annotations
**File**: `references/metadata.md`

Create and manage annotations including tags, key-value pairs, file attachments, and comments. Link annotations to images, datasets, or other objects.

**Common scenarios:**
- Add tags to images
- Attach analysis results as files
- Create custom key-value metadata
- Query annotations by namespace

### 4. Image Processing & Rendering
**File**: `references/image_processing.md`

Access raw pixel data as NumPy arrays, manipulate rendering settings, create derived images, and manage physical dimensions.

**Common scenarios:**
- Extract pixel data for computational analysis
- Generate thumbnail images
- Create maximum intensity projections
- Modify channel rendering settings

### 5. Regions of Interest (ROIs)
**File**: `references/rois.md`

Create, retrieve, and analyze ROIs with various shapes (rectangles, ellipses, polygons, masks, points, lines). Extract intensity statistics from ROI regions.

**Common scenarios:**
- Draw rectangular ROIs on images
- Create polygon masks for segmentation
- Analyze pixel intensities within ROIs
- Export ROI coordinates

### 6. OMERO Tables
**File**: `references/tables.md`

Store and query structured tabular data associated with OMERO objects. Useful for analysis results, measurements, and metadata.

**Common scenarios:**
- Store quantitative measurements for images
- Create tables with multiple column types
- Query table data with conditions
- Link tables to specific images or datasets

### 7. Scripts & Batch Operations
**File**: `references/scripts.md`

Create OMERO.scripts that run server-side for batch processing, automated workflows, and integration with OMERO clients.

**Common scenarios:**
- Process multiple images in batch
- Create automated analysis pipelines
- Generate summary statistics across datasets
- Export data in custom formats

### 8. Advanced Features
**File**: `references/advanced.md`

Covers permissions, filesets, cross-group queries, delete operations, and other advanced functionality.

**Common scenarios:**
- Handle group permissions
- Access original imported files
- Perform cross-group queries
- Delete objects with callbacks

## Installation

```bash
uv pip install omero-py
```

**Requirements:**
- Python 3.7+
- Zeroc Ice 3.6+
- Access to an OMERO server (host, port, credentials)

## Quick Start

Basic connection pattern:

```python
from omero.gateway import BlitzGateway

# Connect to OMERO server
conn = BlitzGateway(username, password, host=host, port=port)
connected = conn.connect()

if connected:
    # Perform operations
    for project in conn.listProjects():
        print(project.getName())

    # Always close connection
    conn.close()
else:
    print("Connection failed")
```

**Recommended pattern with context manager:**

```python
from omero.gateway import BlitzGateway

with BlitzGateway(username, password, host=host, port=port) as conn:
    # Connection automatically managed
    for project in conn.listProjects():
        print(project.getName())
    # Automatically closed on exit
```

## Selecting the Right Capability

**For data exploration:**
- Start with `references/connection.md` to establish connection
- Use `references/data_access.md` to navigate hierarchy
- Check `references/metadata.md` for annotation details

**For image analysis:**
- Use `references/image_processing.md` for pixel data access
- Use `references/rois.md` for region-based analysis
- Use `references/tables.md` to store results

**For automation:**
- Use `references/scripts.md` for server-side processing
- Use `references/data_access.md` for batch data retrieval

**For advanced operations:**
- Use `references/advanced.md` for permissions and deletion
- Check `references/connection.md` for cross-group queries

## Common Workflows

### Workflow 1: Retrieve and Analyze Images

1. Connect to OMERO server (`references/connection.md`)
2. Navigate to dataset (`references/data_access.md`)
3. Retrieve images from dataset (`references/data_access.md`)
4. Access pixel data as NumPy array (`references/image_processing.md`)
5. Perform analysis
6. Store results as table or file annotation (`references/tables.md` or `references/metadata.md`)

### Workflow 2: Batch ROI Analysis

1. Connect to OMERO server
2. Retrieve images with existing ROIs (`references/rois.md`)
3. For each image, get ROI shapes
4. Extract pixel intensities within ROIs (`references/rois.md`)
5. Store measurements in OMERO table (`references/tables.md`)

### Workflow 3: Create Analysis Script

1. Design analysis workflow
2. Use OMERO.scripts framework (`references/scripts.md`)
3. Access data through script parameters
4. Process images in batch
5. Generate outputs (new images, tables, files)

## Error Handling

Always wrap OMERO operations in try-except blocks and ensure connections are properly closed:

```python
from omero.gateway import BlitzGateway
import traceback

try:
    conn = BlitzGateway(username, password, host=host, port=port)
    if not conn.connect():
        raise Exception("Connection failed")

    # Perform operations

except Exception as e:
    print(f"Error: {e}")
    traceback.print_exc()
finally:
    if conn:
        conn.close()
```

## Additional Resources

- **Official Documentation**: https://omero.readthedocs.io/en/stable/developers/Python.html
- **BlitzGateway API**: https://omero.readthedocs.io/en/stable/developers/Python.html#omero-blitzgateway
- **OMERO Model**: https://omero.readthedocs.io/en/stable/developers/Model.html
- **Community Forum**: https://forum.image.sc/tag/omero

## Notes

- OMERO uses group-based permissions (READ-ONLY, READ-ANNOTATE, READ-WRITE)
- Images in OMERO are organized hierarchically: Project > Dataset > Image
- Screening data uses: Screen > Plate > Well > WellSample > Image
- Always close connections to free server resources
- Use context managers for automatic resource management
- Pixel data is returned as NumPy arrays for analysis

