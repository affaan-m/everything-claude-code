# LaminDB Core Concepts

This document covers the fundamental concepts and building blocks of LaminDB: Artifacts, Records, Runs, Transforms, Features, and data lineage tracking.

## Artifacts

Artifacts represent datasets in various formats (DataFrames, AnnData, SpatialData, Parquet, Zarr, etc.). They serve as the primary data objects in LaminDB.

### Creating and Saving Artifacts

**From file:**
```python
import lamindb as ln

# Save a file as artifact
ln.Artifact("sample.fasta", key="sample.fasta").save()

# With description
artifact = ln.Artifact(
    "data/analysis.h5ad",
    key="experiments/scrna_batch1.h5ad",
    description="Single-cell RNA-seq batch 1"
).save()
```

**From DataFrame:**
```python
import pandas as pd

df = pd.read_csv("data.csv")
artifact = ln.Artifact.from_dataframe(
    df,
    key="datasets/processed_data.parquet",
    description="Processed experimental data"
).save()
```

**From AnnData:**
```python
import anndata as ad

adata = ad.read_h5ad("data.h5ad")
artifact = ln.Artifact.from_anndata(
    adata,
    key="scrna/experiment1.h5ad",
    description="scRNA-seq data with QC"
).save()
```

### Retrieving Artifacts

```python
# By key
artifact = ln.Artifact.get(key="sample.fasta")

# By UID
artifact = ln.Artifact.get("aRt1Fact0uid000")

# By filter
artifact = ln.Artifact.filter(suffix=".h5ad").first()
```

### Accessing Artifact Content

```python
# Get cached local path
local_path = artifact.cache()

# Load into memory
data = artifact.load()  # Returns DataFrame, AnnData, etc.

# Streaming access (for large files)
with artifact.open() as f:
    # Read incrementally
    chunk = f.read(1000)
```

### Artifact Metadata

```python
# View all metadata
artifact.describe()

# Access specific metadata
artifact.size          # File size in bytes
artifact.suffix        # File extension
artifact.created_at    # Timestamp
artifact.created_by    # User who created it
artifact.run          # Associated run
artifact.transform    # Associated transform
artifact.version      # Version string
```

## Records

Records represent experimental entities: samples, perturbations, instruments, cell lines, and any other metadata entities. They support hierarchical relationships through type definitions.

### Creating Records

```python
# Define a type
sample_type = ln.Record(name="Sample", is_type=True).save()

# Create instances of that type
ln.Record(name="P53mutant1", type=sample_type).save()
ln.Record(name="P53mutant2", type=sample_type).save()
ln.Record(name="WT-control", type=sample_type).save()
```

### Searching Records

```python
# Text search
ln.Record.search("p53").to_dataframe()

# Filter by fields
ln.Record.filter(type=sample_type).to_dataframe()

# Get specific record
record = ln.Record.get(name="P53mutant1")
```

### Hierarchical Relationships

```python
# Establish parent-child relationships
parent_record = ln.Record.get(name="P53mutant1")
child_record = ln.Record(name="P53mutant1-replicate1", type=sample_type).save()
child_record.parents.add(parent_record)

# Query relationships
parent_record.children.to_dataframe()
child_record.parents.to_dataframe()
```

## Runs & Transforms

These capture computational lineage. A **Transform** represents a reusable analysis step (notebook, script, or function), while a **Run** documents a specific execution instance.

### Basic Tracking Workflow

```python
import lamindb as ln

# Start tracking (beginning of notebook/script)
ln.track()

# Your analysis code
data = ln.Artifact.get(key="input.csv").load()
# ... perform analysis ...
result.to_csv("output.csv")
artifact = ln.Artifact("output.csv", key="output.csv").save()

# Finish tracking (end of notebook/script)
ln.finish()
```

### Tracking with Parameters

```python
ln.track(params={
    "learning_rate": 0.01,
    "batch_size": 32,
    "epochs": 100,
    "downsample": True
})

# Query runs by parameters
ln.Run.filter(params__learning_rate=0.01).to_dataframe()
ln.Run.filter(params__downsample=True).to_dataframe()
```

### Tracking with Projects

```python
# Associate with project
ln.track(project="Cancer Drug Screen 2025")

# Query by project
project = ln.Project.get(name="Cancer Drug Screen 2025")
ln.Artifact.filter(projects=project).to_dataframe()
ln.Run.filter(project=project).to_dataframe()
```

### Function-Level Tracking

Use the `@ln.tracked()` decorator for fine-grained lineage:

```python
@ln.tracked()
def preprocess_data(input_key: str, output_key: str, normalize: bool = True) -> None:
    """Preprocess raw data and save result."""
    # Load input (automatically tracked)
    artifact = ln.Artifact.get(key=input_key)
    data = artifact.load()

    # Process
    if normalize:
        data = (data - data.mean()) / data.std()

    # Save output (automatically tracked)
    ln.Artifact.from_dataframe(data, key=output_key).save()

# Each call creates a separate Transform and Run
preprocess_data("raw/batch1.csv", "processed/batch1.csv", normalize=True)
preprocess_data("raw/batch2.csv", "processed/batch2.csv", normalize=False)
```

### Accessing Lineage Information

```python
# From artifact to run
artifact = ln.Artifact.get(key="output.csv")
run = artifact.run
transform = run.transform

# View details
run.describe()          # Run metadata
transform.describe()    # Transform metadata

# Access inputs
run.inputs.to_dataframe()

# Visualize lineage graph
artifact.view_lineage()
```

## Features

Features define typed metadata fields for validation and querying. They enable structured annotation and searching.

### Defining Features

```python
from datetime import date

# Numeric feature
ln.Feature(name="gc_content", dtype=float).save()
ln.Feature(name="read_count", dtype=int).save()

# Date feature
ln.Feature(name="experiment_date", dtype=date).save()

# Categorical feature
ln.Feature(name="cell_type", dtype=str).save()
ln.Feature(name="treatment", dtype=str).save()
```

### Annotating Artifacts with Features

```python
# Single values
artifact.features.add_values({
    "gc_content": 0.55,
    "experiment_date": "2025-10-31"
})

# Using feature registry records
gc_content_feature = ln.Feature.get(name="gc_content")
artifact.features.add(gc_content_feature)
```

### Querying by Features

```python
# Filter by feature value
ln.Artifact.filter(gc_content=0.55).to_dataframe()
ln.Artifact.filter(experiment_date="2025-10-31").to_dataframe()

# Comparison operators
ln.Artifact.filter(read_count__gt=1000000).to_dataframe()
ln.Artifact.filter(gc_content__gte=0.5, gc_content__lte=0.6).to_dataframe()

# Check for presence of annotation
ln.Artifact.filter(cell_type__isnull=False).to_dataframe()

# Include features in output
ln.Artifact.filter(treatment="DMSO").to_dataframe(include="features")
```

### Nested Dictionary Features

For complex metadata stored as dictionaries:

```python
# Access nested values
ln.Artifact.filter(study_metadata__detail1="123").to_dataframe()
ln.Artifact.filter(study_metadata__assay__type="RNA-seq").to_dataframe()
```

## Data Lineage Tracking

LaminDB automatically captures execution context and relationships between data, code, and runs.

### What Gets Tracked

- **Source code**: Script/notebook content and git commit
- **Environment**: Python packages and versions
- **Input artifacts**: Data loaded during execution
- **Output artifacts**: Data created during execution
- **Execution metadata**: Timestamps, user, parameters
- **Computational dependencies**: Transform relationships

### Viewing Lineage

```python
# Visualize full lineage graph
artifact.view_lineage()

# View captured metadata
artifact.describe()

# Access related entities
artifact.run              # The run that created it
artifact.run.transform    # The transform (code) used
artifact.run.inputs       # Input artifacts
artifact.run.report       # Execution report
```

### Querying Lineage

```python
# Find all outputs from a transform
transform = ln.Transform.get(name="preprocessing.py")
ln.Artifact.filter(transform=transform).to_dataframe()

# Find all artifacts from a specific user
user = ln.User.get(handle="researcher123")
ln.Artifact.filter(created_by=user).to_dataframe()

# Find artifacts using specific inputs
input_artifact = ln.Artifact.get(key="raw/data.csv")
runs = ln.Run.filter(inputs=input_artifact)
ln.Artifact.filter(run__in=runs).to_dataframe()
```

## Versioning

LaminDB manages artifact versioning automatically when source data or code changes.

### Automatic Versioning

```python
# First version
artifact_v1 = ln.Artifact("data.csv", key="experiment/data.csv").save()

# Modify and save again - creates new version
# (modify data.csv)
artifact_v2 = ln.Artifact("data.csv", key="experiment/data.csv").save()
```

### Working with Versions

```python
# Get latest version (default)
artifact = ln.Artifact.get(key="experiment/data.csv")

# View all versions
artifact.versions.to_dataframe()

# Get specific version
artifact_v1 = artifact.versions.filter(version="1").first()

# Compare versions
v1_data = artifact_v1.load()
v2_data = artifact.load()
```

## Best Practices

1. **Use meaningful keys**: Structure keys hierarchically (e.g., `project/experiment/sample.h5ad`)
2. **Add descriptions**: Help future users understand artifact contents
3. **Track consistently**: Call `ln.track()` at the start of every analysis
4. **Define features upfront**: Create feature registry before annotation
5. **Use typed features**: Specify dtypes for better validation
6. **Leverage versioning**: Don't create new keys for minor changes
7. **Document transforms**: Add docstrings to tracked functions
8. **Set projects**: Group related work for easier organization and access control
9. **Query efficiently**: Use filters before loading large datasets
10. **Visualize lineage**: Use `view_lineage()` to understand data provenance
