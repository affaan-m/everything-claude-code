# LaminDB Data Management

This document covers querying, searching, filtering, and streaming data in LaminDB, as well as best practices for organizing and accessing datasets.

## Registry Overview

View available registries and their contents:

```python
import lamindb as ln

# View all registries across modules
ln.view()

# View latest 100 artifacts
ln.Artifact.to_dataframe()

# View other registries
ln.Transform.to_dataframe()
ln.Run.to_dataframe()
ln.User.to_dataframe()
```

## Lookup for Quick Access

For registries with fewer than 100k records, `Lookup` objects enable convenient auto-complete:

```python
# Create lookup
records = ln.Record.lookup()

# Access by name (auto-complete enabled in IDEs)
experiment_1 = records.experiment_1
sample_a = records.sample_a

# Works with biological ontologies too
import bionty as bt
cell_types = bt.CellType.lookup()
t_cell = cell_types.t_cell
```

## Retrieving Single Records

### Using get()

Retrieve exactly one record (errors if zero or multiple matches):

```python
# By UID
artifact = ln.Artifact.get("aRt1Fact0uid000")

# By field
artifact = ln.Artifact.get(key="data/experiment.h5ad")
user = ln.User.get(handle="researcher123")

# By ontology ID (for bionty)
cell_type = bt.CellType.get(ontology_id="CL:0000084")
```

### Using one() and one_or_none()

```python
# Get exactly one from QuerySet (errors if 0 or >1)
artifact = ln.Artifact.filter(key="data.csv").one()

# Get one or None (errors if >1)
artifact = ln.Artifact.filter(key="maybe_data.csv").one_or_none()

# Get first match
artifact = ln.Artifact.filter(suffix=".h5ad").first()
```

## Filtering Data

The `filter()` method returns a QuerySet for flexible retrieval:

```python
# Basic filtering
artifacts = ln.Artifact.filter(suffix=".h5ad")
artifacts.to_dataframe()

# Multiple conditions (AND logic)
artifacts = ln.Artifact.filter(
    suffix=".h5ad",
    created_by=user
)

# Comparison operators
ln.Artifact.filter(size__gt=1e6).to_dataframe()           # Greater than
ln.Artifact.filter(size__gte=1e6).to_dataframe()          # Greater than or equal
ln.Artifact.filter(size__lt=1e9).to_dataframe()           # Less than
ln.Artifact.filter(size__lte=1e9).to_dataframe()          # Less than or equal

# Range queries
ln.Artifact.filter(size__gte=1e6, size__lte=1e9).to_dataframe()
```

## Text and String Queries

```python
# Exact match
ln.Artifact.filter(description="Experiment 1").to_dataframe()

# Contains (case-sensitive)
ln.Artifact.filter(description__contains="RNA").to_dataframe()

# Case-insensitive contains
ln.Artifact.filter(description__icontains="rna").to_dataframe()

# Starts with
ln.Artifact.filter(key__startswith="experiments/").to_dataframe()

# Ends with
ln.Artifact.filter(key__endswith=".csv").to_dataframe()

# IN list
ln.Artifact.filter(suffix__in=[".h5ad", ".csv", ".parquet"]).to_dataframe()
```

## Feature-Based Queries

Query artifacts by their annotated features:

```python
# Filter by feature value
ln.Artifact.filter(cell_type="T cell").to_dataframe()
ln.Artifact.filter(treatment="DMSO").to_dataframe()

# Include features in output
ln.Artifact.filter(treatment="DMSO").to_dataframe(include="features")

# Nested dictionary access
ln.Artifact.filter(study_metadata__assay="RNA-seq").to_dataframe()
ln.Artifact.filter(study_metadata__detail1="123").to_dataframe()

# Check annotation status
ln.Artifact.filter(cell_type__isnull=False).to_dataframe()  # Has annotation
ln.Artifact.filter(treatment__isnull=True).to_dataframe()    # Missing annotation
```

## Traversing Related Registries

Django's double-underscore syntax enables queries across related tables:

```python
# Find artifacts by creator handle
ln.Artifact.filter(created_by__handle="researcher123").to_dataframe()
ln.Artifact.filter(created_by__handle__startswith="test").to_dataframe()

# Find artifacts by transform name
ln.Artifact.filter(transform__name="preprocess.py").to_dataframe()

# Find artifacts measuring specific genes
ln.Artifact.filter(feature_sets__genes__symbol="CD8A").to_dataframe()
ln.Artifact.filter(feature_sets__genes__ensembl_gene_id="ENSG00000153563").to_dataframe()

# Find runs with specific parameters
ln.Run.filter(params__learning_rate=0.01).to_dataframe()
ln.Run.filter(params__downsample=True).to_dataframe()

# Find artifacts from specific project
project = ln.Project.get(name="Cancer Study")
ln.Artifact.filter(projects=project).to_dataframe()
```

## Ordering Results

```python
# Order by field (ascending)
ln.Artifact.filter(suffix=".h5ad").order_by("created_at").to_dataframe()

# Order descending
ln.Artifact.filter(suffix=".h5ad").order_by("-created_at").to_dataframe()

# Multiple order fields
ln.Artifact.order_by("-created_at", "size").to_dataframe()
```

## Advanced Logical Queries

### OR Logic

```python
from lamindb import Q

# OR condition
artifacts = ln.Artifact.filter(
    Q(suffix=".jpg") | Q(suffix=".png")
).to_dataframe()

# Complex OR with multiple conditions
artifacts = ln.Artifact.filter(
    Q(suffix=".h5ad", size__gt=1e6) | Q(suffix=".csv", size__lt=1e3)
).to_dataframe()
```

### NOT Logic

```python
# Exclude condition
artifacts = ln.Artifact.filter(
    ~Q(suffix=".tmp")
).to_dataframe()

# Complex exclusion
artifacts = ln.Artifact.filter(
    ~Q(created_by__handle="testuser")
).to_dataframe()
```

### Combining AND, OR, NOT

```python
# Complex query
artifacts = ln.Artifact.filter(
    (Q(suffix=".h5ad") | Q(suffix=".csv")) &
    Q(size__gt=1e6) &
    ~Q(created_by__handle__startswith="test")
).to_dataframe()
```

## Search Functionality

Full-text search across registry fields:

```python
# Basic search
ln.Artifact.search("iris").to_dataframe()
ln.User.search("smith").to_dataframe()

# Search in specific registry
bt.CellType.search("T cell").to_dataframe()
bt.Gene.search("CD8").to_dataframe()
```

## Working with QuerySets

QuerySets are lazy - they don't hit the database until evaluated:

```python
# Create query (no database hit)
qs = ln.Artifact.filter(suffix=".h5ad")

# Evaluate in different ways
df = qs.to_dataframe()        # As pandas DataFrame
list_records = list(qs)       # As Python list
count = qs.count()            # Count only
exists = qs.exists()          # Boolean check

# Iteration
for artifact in qs:
    print(artifact.key, artifact.size)

# Slicing
first_10 = qs[:10]
next_10 = qs[10:20]
```

## Chaining Filters

```python
# Build query incrementally
qs = ln.Artifact.filter(suffix=".h5ad")
qs = qs.filter(size__gt=1e6)
qs = qs.filter(created_at__year=2025)
qs = qs.order_by("-created_at")

# Execute
results = qs.to_dataframe()
```

## Streaming Large Datasets

For datasets too large to fit in memory, use streaming access:

### Streaming Files

```python
# Open file stream
artifact = ln.Artifact.get(key="large_file.csv")

with artifact.open() as f:
    # Read in chunks
    chunk = f.read(10000)  # Read 10KB
    # Process chunk
```

### Array Slicing

For array-based formats (Zarr, HDF5, AnnData):

```python
# Get backing file without loading
artifact = ln.Artifact.get(key="large_data.h5ad")
adata = artifact.backed()  # Returns backed AnnData

# Slice specific portions
subset = adata[:1000, :]  # First 1000 cells
genes_of_interest = adata[:, ["CD4", "CD8A", "CD8B"]]

# Stream batches
for i in range(0, adata.n_obs, 1000):
    batch = adata[i:i+1000, :]
    # Process batch
```

### Iterator Access

```python
# Process large collections incrementally
artifacts = ln.Artifact.filter(suffix=".fastq.gz")

for artifact in artifacts.iterator(chunk_size=10):
    # Process 10 at a time
    path = artifact.cache()
    # Analyze file
```

## Aggregation and Statistics

```python
# Count records
ln.Artifact.filter(suffix=".h5ad").count()

# Distinct values
ln.Artifact.values_list("suffix", flat=True).distinct()

# Aggregation (requires Django ORM knowledge)
from django.db.models import Sum, Avg, Max, Min

# Total size of all artifacts
ln.Artifact.aggregate(Sum("size"))

# Average artifact size by suffix
ln.Artifact.values("suffix").annotate(avg_size=Avg("size"))
```

## Caching and Performance

```python
# Check cache location
ln.settings.cache_dir

# Configure cache
lamin cache set /path/to/cache

# Clear cache for specific artifact
artifact.delete_cache()

# Get cached path (downloads if needed)
path = artifact.cache()

# Check if cached
if artifact.is_cached():
    path = artifact.cache()
```

## Organizing Data with Keys

Best practices for structuring keys:

```python
# Hierarchical organization
ln.Artifact("data.h5ad", key="project/experiment/batch1/data.h5ad").save()
ln.Artifact("data.h5ad", key="scrna/2025/oct/sample_001.h5ad").save()

# Browse by prefix
ln.Artifact.filter(key__startswith="scrna/2025/oct/").to_dataframe()

# Version in key (alternative to built-in versioning)
ln.Artifact("data.h5ad", key="data/processed/v1/final.h5ad").save()
ln.Artifact("data.h5ad", key="data/processed/v2/final.h5ad").save()
```

## Collections

Group related artifacts into collections:

```python
# Create collection
collection = ln.Collection(
    [artifact1, artifact2, artifact3],
    name="scRNA-seq batch 1-3",
    description="Complete dataset across three batches"
).save()

# Access collection members
for artifact in collection.artifacts:
    print(artifact.key)

# Query collections
ln.Collection.filter(name__contains="batch").to_dataframe()
```

## Best Practices

1. **Use filters before loading**: Query metadata before accessing file contents
2. **Leverage QuerySets**: Build queries incrementally for complex conditions
3. **Stream large files**: Don't load entire datasets into memory unnecessarily
4. **Structure keys hierarchically**: Makes browsing and filtering easier
5. **Use search for discovery**: When you don't know exact field values
6. **Cache strategically**: Configure cache location based on storage capacity
7. **Index features**: Define features upfront for efficient feature-based queries
8. **Use collections**: Group related artifacts for dataset-level operations
9. **Order results**: Sort by creation date or other fields for consistent retrieval
10. **Check existence**: Use `exists()` or `one_or_none()` to avoid errors

## Common Query Patterns

```python
# Recent artifacts
ln.Artifact.order_by("-created_at")[:10].to_dataframe()

# My artifacts
me = ln.setup.settings.user
ln.Artifact.filter(created_by=me).to_dataframe()

# Large files
ln.Artifact.filter(size__gt=1e9).order_by("-size").to_dataframe()

# This month's data
from datetime import datetime
ln.Artifact.filter(
    created_at__year=2025,
    created_at__month=10
).to_dataframe()

# Validated datasets with specific features
ln.Artifact.filter(
    is_valid=True,
    cell_type__isnull=False
).to_dataframe(include="features")
```
