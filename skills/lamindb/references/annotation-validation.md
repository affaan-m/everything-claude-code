# LaminDB Annotation & Validation

This document covers data curation, validation, schema management, and annotation best practices in LaminDB.

## Overview

LaminDB's curation process ensures datasets are both validated and queryable through three essential steps:

1. **Validation**: Confirming datasets match desired schemas
2. **Standardization**: Fixing inconsistencies like typos and mapping synonyms
3. **Annotation**: Linking datasets to metadata entities for queryability

## Schema Design

Schemas define expected data structure, types, and validation rules. LaminDB supports three main schema approaches:

### 1. Flexible Schema

Validates only columns matching Feature registry names, allowing additional metadata:

```python
import lamindb as ln

# Create flexible schema
schema = ln.Schema(
    name="valid_features",
    itype=ln.Feature  # Validates against Feature registry
).save()

# Any column matching a Feature name will be validated
# Additional columns are permitted but not validated
```

### 2. Minimal Required Schema

Specifies essential columns while permitting extra metadata:

```python
# Define required features
required_features = [
    ln.Feature.get(name="cell_type"),
    ln.Feature.get(name="tissue"),
    ln.Feature.get(name="donor_id")
]

# Create schema with required features
schema = ln.Schema(
    name="minimal_immune_schema",
    features=required_features,
    flexible=True  # Allows additional columns
).save()
```

### 3. Strict Schema

Enforces complete control over data structure:

```python
# Define all allowed features
all_features = [
    ln.Feature.get(name="cell_type"),
    ln.Feature.get(name="tissue"),
    ln.Feature.get(name="donor_id"),
    ln.Feature.get(name="disease")
]

# Create strict schema
schema = ln.Schema(
    name="strict_immune_schema",
    features=all_features,
    flexible=False  # No additional columns allowed
).save()
```

## DataFrame Curation Workflow

The typical curation process involves six key steps:

### Step 1-2: Load Data and Establish Registries

```python
import pandas as pd
import lamindb as ln

# Load data
df = pd.read_csv("experiment.csv")

# Define and save features
ln.Feature(name="cell_type", dtype=str).save()
ln.Feature(name="tissue", dtype=str).save()
ln.Feature(name="gene_count", dtype=int).save()
ln.Feature(name="experiment_date", dtype="date").save()

# Populate valid values (if using controlled vocabulary)
import bionty as bt
bt.CellType.import_source()
bt.Tissue.import_source()
```

### Step 3: Create Schema

```python
# Link features to schema
features = [
    ln.Feature.get(name="cell_type"),
    ln.Feature.get(name="tissue"),
    ln.Feature.get(name="gene_count"),
    ln.Feature.get(name="experiment_date")
]

schema = ln.Schema(
    name="experiment_schema",
    features=features,
    flexible=True
).save()
```

### Step 4: Initialize Curator and Validate

```python
# Initialize curator
curator = ln.curators.DataFrameCurator(df, schema)

# Validate dataset
validation = curator.validate()

# Check validation results
if validation:
    print("✓ Validation passed")
else:
    print("✗ Validation failed")
    curator.non_validated  # See problematic fields
```

### Step 5: Fix Validation Issues

#### Standardize Values

```python
# Fix typos and synonyms in categorical columns
curator.cat.standardize("cell_type")
curator.cat.standardize("tissue")

# View standardization mapping
curator.cat.inspect_standardize("cell_type")
```

#### Map to Ontologies

```python
# Map values to ontology terms
curator.cat.add_ontology("cell_type", bt.CellType)
curator.cat.add_ontology("tissue", bt.Tissue)

# Look up public ontologies for unmapped terms
curator.cat.lookup(public=True).cell_type  # Interactive lookup
```

#### Add New Terms

```python
# Add new valid terms to registry
curator.cat.add_new_from("cell_type")

# Or manually create records
new_cell_type = bt.CellType(name="my_novel_cell_type").save()
```

#### Rename Columns

```python
# Rename columns to match feature names
df = df.rename(columns={"celltype": "cell_type"})

# Re-initialize curator with fixed DataFrame
curator = ln.curators.DataFrameCurator(df, schema)
```

### Step 6: Save Curated Artifact

```python
# Save with schema linkage
artifact = curator.save_artifact(
    key="experiments/curated_data.parquet",
    description="Validated and annotated experimental data"
)

# Verify artifact has schema
artifact.schema  # Returns the schema object
artifact.describe()  # Shows validation status
```

## AnnData Curation

For composite structures like AnnData, use "slots" to validate different components:

### Defining AnnData Schemas

```python
# Create schemas for different slots
obs_schema = ln.Schema(
    name="cell_metadata",
    features=[
        ln.Feature.get(name="cell_type"),
        ln.Feature.get(name="tissue"),
        ln.Feature.get(name="donor_id")
    ]
).save()

var_schema = ln.Schema(
    name="gene_ids",
    features=[ln.Feature.get(name="ensembl_gene_id")]
).save()

# Create composite AnnData schema
anndata_schema = ln.Schema(
    name="scrna_schema",
    otype="AnnData",
    slots={
        "obs": obs_schema,
        "var.T": var_schema  # .T indicates transposition
    }
).save()
```

### Curating AnnData Objects

```python
import anndata as ad

# Load AnnData
adata = ad.read_h5ad("data.h5ad")

# Initialize curator
curator = ln.curators.AnnDataCurator(adata, anndata_schema)

# Validate all slots
validation = curator.validate()

# Fix issues by slot
curator.cat.standardize("obs", "cell_type")
curator.cat.add_ontology("obs", "cell_type", bt.CellType)
curator.cat.standardize("var.T", "ensembl_gene_id")

# Save curated artifact
artifact = curator.save_artifact(
    key="scrna/validated_data.h5ad",
    description="Curated single-cell RNA-seq data"
)
```

## MuData Curation

MuData supports multi-modal data through modality-specific slots:

```python
# Define schemas for each modality
rna_obs_schema = ln.Schema(name="rna_obs_schema", features=[...]).save()
protein_obs_schema = ln.Schema(name="protein_obs_schema", features=[...]).save()

# Create MuData schema
mudata_schema = ln.Schema(
    name="multimodal_schema",
    otype="MuData",
    slots={
        "rna:obs": rna_obs_schema,
        "protein:obs": protein_obs_schema
    }
).save()

# Curate
curator = ln.curators.MuDataCurator(mdata, mudata_schema)
curator.validate()
```

## SpatialData Curation

For spatial transcriptomics data:

```python
# Define spatial schema
spatial_schema = ln.Schema(
    name="spatial_schema",
    otype="SpatialData",
    slots={
        "tables:cell_metadata.obs": cell_schema,
        "attrs:bio": bio_metadata_schema
    }
).save()

# Curate
curator = ln.curators.SpatialDataCurator(sdata, spatial_schema)
curator.validate()
```

## TileDB-SOMA Curation

For scalable array-backed data:

```python
# Define SOMA schema
soma_schema = ln.Schema(
    name="soma_schema",
    otype="tiledbsoma",
    slots={
        "obs": obs_schema,
        "ms:RNA.T": var_schema  # measurement:modality.T
    }
).save()

# Curate
curator = ln.curators.TileDBSOMACurator(soma_exp, soma_schema)
curator.validate()
```

## Feature Validation

### Data Type Validation

```python
# Define typed features
ln.Feature(name="age", dtype=int).save()
ln.Feature(name="weight", dtype=float).save()
ln.Feature(name="is_treated", dtype=bool).save()
ln.Feature(name="collection_date", dtype="date").save()

# Coerce types during validation
ln.Feature(name="age_str", dtype=int, coerce_dtype=True).save()  # Auto-convert strings to int
```

### Value Validation

```python
# Validate against allowed values
cell_type_feature = ln.Feature(name="cell_type", dtype=str).save()

# Link to registry for controlled vocabulary
cell_type_feature.link_to_registry(bt.CellType)

# Now validation checks against CellType registry
curator = ln.curators.DataFrameCurator(df, schema)
curator.validate()  # Errors if cell_type values not in registry
```

## Standardization Strategies

### Using Public Ontologies

```python
# Look up standardized terms from public sources
curator.cat.lookup(public=True).cell_type

# Returns auto-complete object with public ontology terms
# User can select correct term interactively
```

### Synonym Mapping

```python
# Add synonyms to records
t_cell = bt.CellType.get(name="T cell")
t_cell.add_synonym("T lymphocyte")
t_cell.add_synonym("T-cell")

# Now standardization maps synonyms automatically
curator.cat.standardize("cell_type")
# "T lymphocyte" → "T cell"
# "T-cell" → "T cell"
```

### Custom Standardization

```python
# Manual mapping
mapping = {
    "TCell": "T cell",
    "t cell": "T cell",
    "T-cells": "T cell"
}

# Apply mapping
df["cell_type"] = df["cell_type"].map(lambda x: mapping.get(x, x))
```

## Handling Validation Errors

### Common Issues and Solutions

**Issue: Column not in schema**
```python
# Solution 1: Rename column
df = df.rename(columns={"old_name": "feature_name"})

# Solution 2: Add feature to schema
new_feature = ln.Feature(name="new_column", dtype=str).save()
schema.features.add(new_feature)
```

**Issue: Invalid values**
```python
# Solution 1: Standardize
curator.cat.standardize("column_name")

# Solution 2: Add new valid values
curator.cat.add_new_from("column_name")

# Solution 3: Map to ontology
curator.cat.add_ontology("column_name", bt.Registry)
```

**Issue: Data type mismatch**
```python
# Solution 1: Convert data type
df["column"] = df["column"].astype(int)

# Solution 2: Enable coercion in feature
feature = ln.Feature.get(name="column")
feature.coerce_dtype = True
feature.save()
```

## Schema Versioning

Schemas can be versioned like other records:

```python
# Create initial schema
schema_v1 = ln.Schema(name="experiment_schema", features=[...]).save()

# Update schema with new features
schema_v2 = ln.Schema(
    name="experiment_schema",
    features=[...],  # Updated list
    version="2"
).save()

# Link artifacts to specific schema versions
artifact.schema = schema_v2
artifact.save()
```

## Querying Validated Data

Once data is validated and annotated, it becomes queryable:

```python
# Find all validated artifacts
ln.Artifact.filter(is_valid=True).to_dataframe()

# Find artifacts with specific schema
ln.Artifact.filter(schema=schema).to_dataframe()

# Query by annotated features
ln.Artifact.filter(cell_type="T cell", tissue="blood").to_dataframe()

# Include features in results
ln.Artifact.filter(is_valid=True).to_dataframe(include="features")
```

## Best Practices

1. **Define features first**: Create Feature registry before curation
2. **Use public ontologies**: Leverage bt.lookup(public=True) for standardization
3. **Start flexible**: Use flexible schemas initially, tighten as understanding grows
4. **Document slots**: Clearly specify transposition (.T) in composite schemas
5. **Standardize early**: Fix typos and synonyms before validation
6. **Validate incrementally**: Check each slot separately for composite structures
7. **Version schemas**: Track schema changes over time
8. **Add synonyms**: Register common variations to simplify future curation
9. **Coerce types cautiously**: Enable dtype coercion only when safe
10. **Test on samples**: Validate small subsets before full dataset curation

## Advanced: Custom Validators

Create custom validation logic:

```python
def validate_gene_expression(df):
    """Custom validator for gene expression values."""
    # Check non-negative
    if (df < 0).any().any():
        return False, "Negative expression values found"

    # Check reasonable range
    if (df > 1e6).any().any():
        return False, "Unreasonably high expression values"

    return True, "Valid"

# Apply during curation
is_valid, message = validate_gene_expression(df)
if not is_valid:
    print(f"Validation failed: {message}")
```

## Tracking Curation Provenance

```python
# Curated artifacts track curation lineage
ln.track()  # Start tracking

# Perform curation
curator = ln.curators.DataFrameCurator(df, schema)
curator.validate()
curator.cat.standardize("cell_type")
artifact = curator.save_artifact(key="curated.parquet")

ln.finish()  # Complete tracking

# View curation lineage
artifact.run.describe()  # Shows curation transform
artifact.view_lineage()  # Visualizes curation process
```
