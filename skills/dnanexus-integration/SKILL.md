---
name: dnanexus-integration
description: DNAnexus cloud genomics platform. Build apps/applets, manage data (upload/download), dxpy Python SDK, run workflows, FASTQ/BAM/VCF, for genomics pipeline development and execution.
license: Unknown
compatibility: Requires a DNAnexus account
metadata:
    skill-author: K-Dense Inc.
---

# DNAnexus Integration

## Overview

DNAnexus is a cloud platform for biomedical data analysis and genomics. Build and deploy apps/applets, manage data objects, run workflows, and use the dxpy Python SDK for genomics pipeline development and execution.

## When to Use This Skill

This skill should be used when:
- Creating, building, or modifying DNAnexus apps/applets
- Uploading, downloading, searching, or organizing files and records
- Running analyses, monitoring jobs, creating workflows
- Writing scripts using dxpy to interact with the platform
- Setting up dxapp.json, managing dependencies, using Docker
- Processing FASTQ, BAM, VCF, or other bioinformatics files
- Managing projects, permissions, or platform resources

## Core Capabilities

The skill is organized into five main areas, each with detailed reference documentation:

### 1. App Development

**Purpose**: Create executable programs (apps/applets) that run on the DNAnexus platform.

**Key Operations**:
- Generate app skeleton with `dx-app-wizard`
- Write Python or Bash apps with proper entry points
- Handle input/output data objects
- Deploy with `dx build` or `dx build --app`
- Test apps on the platform

**Common Use Cases**:
- Bioinformatics pipelines (alignment, variant calling)
- Data processing workflows
- Quality control and filtering
- Format conversion tools

**Reference**: See `references/app-development.md` for:
- Complete app structure and patterns
- Python entry point decorators
- Input/output handling with dxpy
- Development best practices
- Common issues and solutions

### 2. Data Operations

**Purpose**: Manage files, records, and other data objects on the platform.

**Key Operations**:
- Upload/download files with `dxpy.upload_local_file()` and `dxpy.download_dxfile()`
- Create and manage records with metadata
- Search for data objects by name, properties, or type
- Clone data between projects
- Manage project folders and permissions

**Common Use Cases**:
- Uploading sequencing data (FASTQ files)
- Organizing analysis results
- Searching for specific samples or experiments
- Backing up data across projects
- Managing reference genomes and annotations

**Reference**: See `references/data-operations.md` for:
- Complete file and record operations
- Data object lifecycle (open/closed states)
- Search and discovery patterns
- Project management
- Batch operations

### 3. Job Execution

**Purpose**: Run analyses, monitor execution, and orchestrate workflows.

**Key Operations**:
- Launch jobs with `applet.run()` or `app.run()`
- Monitor job status and logs
- Create subjobs for parallel processing
- Build and run multi-step workflows
- Chain jobs with output references

**Common Use Cases**:
- Running genomics analyses on sequencing data
- Parallel processing of multiple samples
- Multi-step analysis pipelines
- Monitoring long-running computations
- Debugging failed jobs

**Reference**: See `references/job-execution.md` for:
- Complete job lifecycle and states
- Workflow creation and orchestration
- Parallel execution patterns
- Job monitoring and debugging
- Resource management

### 4. Python SDK (dxpy)

**Purpose**: Programmatic access to DNAnexus platform through Python.

**Key Operations**:
- Work with data object handlers (DXFile, DXRecord, DXApplet, etc.)
- Use high-level functions for common tasks
- Make direct API calls for advanced operations
- Create links and references between objects
- Search and discover platform resources

**Common Use Cases**:
- Automation scripts for data management
- Custom analysis pipelines
- Batch processing workflows
- Integration with external tools
- Data migration and organization

**Reference**: See `references/python-sdk.md` for:
- Complete dxpy class reference
- High-level utility functions
- API method documentation
- Error handling patterns
- Common code patterns

### 5. Configuration and Dependencies

**Purpose**: Configure app metadata and manage dependencies.

**Key Operations**:
- Write dxapp.json with inputs, outputs, and run specs
- Install system packages (execDepends)
- Bundle custom tools and resources
- Use assets for shared dependencies
- Integrate Docker containers
- Configure instance types and timeouts

**Common Use Cases**:
- Defining app input/output specifications
- Installing bioinformatics tools (samtools, bwa, etc.)
- Managing Python package dependencies
- Using Docker images for complex environments
- Selecting computational resources

**Reference**: See `references/configuration.md` for:
- Complete dxapp.json specification
- Dependency management strategies
- Docker integration patterns
- Regional and resource configuration
- Example configurations

## Quick Start Examples

### Upload and Analyze Data

```python
import dxpy

# Upload input file
input_file = dxpy.upload_local_file("sample.fastq", project="project-xxxx")

# Run analysis
job = dxpy.DXApplet("applet-xxxx").run({
    "reads": dxpy.dxlink(input_file.get_id())
})

# Wait for completion
job.wait_on_done()

# Download results
output_id = job.describe()["output"]["aligned_reads"]["$dnanexus_link"]
dxpy.download_dxfile(output_id, "aligned.bam")
```

### Search and Download Files

```python
import dxpy

# Find BAM files from a specific experiment
files = dxpy.find_data_objects(
    classname="file",
    name="*.bam",
    properties={"experiment": "exp001"},
    project="project-xxxx"
)

# Download each file
for file_result in files:
    file_obj = dxpy.DXFile(file_result["id"])
    filename = file_obj.describe()["name"]
    dxpy.download_dxfile(file_result["id"], filename)
```

### Create Simple App

```python
# src/my-app.py
import dxpy
import subprocess

@dxpy.entry_point('main')
def main(input_file, quality_threshold=30):
    # Download input
    dxpy.download_dxfile(input_file["$dnanexus_link"], "input.fastq")

    # Process
    subprocess.check_call([
        "quality_filter",
        "--input", "input.fastq",
        "--output", "filtered.fastq",
        "--threshold", str(quality_threshold)
    ])

    # Upload output
    output_file = dxpy.upload_local_file("filtered.fastq")

    return {
        "filtered_reads": dxpy.dxlink(output_file)
    }

dxpy.run()
```

## Workflow Decision Tree

When working with DNAnexus, follow this decision tree:

1. **Need to create a new executable?**
   - Yes → Use **App Development** (references/app-development.md)
   - No → Continue to step 2

2. **Need to manage files or data?**
   - Yes → Use **Data Operations** (references/data-operations.md)
   - No → Continue to step 3

3. **Need to run an analysis or workflow?**
   - Yes → Use **Job Execution** (references/job-execution.md)
   - No → Continue to step 4

4. **Writing Python scripts for automation?**
   - Yes → Use **Python SDK** (references/python-sdk.md)
   - No → Continue to step 5

5. **Configuring app settings or dependencies?**
   - Yes → Use **Configuration** (references/configuration.md)

Often you'll need multiple capabilities together (e.g., app development + configuration, or data operations + job execution).

## Installation and Authentication

### Install dxpy

```bash
uv pip install dxpy
```

### Login to DNAnexus

```bash
dx login
```

This authenticates your session and sets up access to projects and data.

### Verify Installation

```bash
dx --version
dx whoami
```

## Common Patterns

### Pattern 1: Batch Processing

Process multiple files with the same analysis:

```python
# Find all FASTQ files
files = dxpy.find_data_objects(
    classname="file",
    name="*.fastq",
    project="project-xxxx"
)

# Launch parallel jobs
jobs = []
for file_result in files:
    job = dxpy.DXApplet("applet-xxxx").run({
        "input": dxpy.dxlink(file_result["id"])
    })
    jobs.append(job)

# Wait for all completions
for job in jobs:
    job.wait_on_done()
```

### Pattern 2: Multi-Step Pipeline

Chain multiple analyses together:

```python
# Step 1: Quality control
qc_job = qc_applet.run({"reads": input_file})

# Step 2: Alignment (uses QC output)
align_job = align_applet.run({
    "reads": qc_job.get_output_ref("filtered_reads")
})

# Step 3: Variant calling (uses alignment output)
variant_job = variant_applet.run({
    "bam": align_job.get_output_ref("aligned_bam")
})
```

### Pattern 3: Data Organization

Organize analysis results systematically:

```python
# Create organized folder structure
dxpy.api.project_new_folder(
    "project-xxxx",
    {"folder": "/experiments/exp001/results", "parents": True}
)

# Upload with metadata
result_file = dxpy.upload_local_file(
    "results.txt",
    project="project-xxxx",
    folder="/experiments/exp001/results",
    properties={
        "experiment": "exp001",
        "sample": "sample1",
        "analysis_date": "2025-10-20"
    },
    tags=["validated", "published"]
)
```

## Best Practices

1. **Error Handling**: Always wrap API calls in try-except blocks
2. **Resource Management**: Choose appropriate instance types for workloads
3. **Data Organization**: Use consistent folder structures and metadata
4. **Cost Optimization**: Archive old data, use appropriate storage classes
5. **Documentation**: Include clear descriptions in dxapp.json
6. **Testing**: Test apps with various input types before production use
7. **Version Control**: Use semantic versioning for apps
8. **Security**: Never hardcode credentials in source code
9. **Logging**: Include informative log messages for debugging
10. **Cleanup**: Remove temporary files and failed jobs

## Resources

This skill includes detailed reference documentation:

### references/

- **app-development.md** - Complete guide to building and deploying apps/applets
- **data-operations.md** - File management, records, search, and project operations
- **job-execution.md** - Running jobs, workflows, monitoring, and parallel processing
- **python-sdk.md** - Comprehensive dxpy library reference with all classes and functions
- **configuration.md** - dxapp.json specification and dependency management

Load these references when you need detailed information about specific operations or when working on complex tasks.

## Getting Help

- Official documentation: https://documentation.dnanexus.com/
- API reference: http://autodoc.dnanexus.com/
- GitHub repository: https://github.com/dnanexus/dx-toolkit
- Support: support@dnanexus.com

