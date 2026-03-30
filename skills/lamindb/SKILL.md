---
name: lamindb
description: This skill should be used when working with LaminDB, an open-source data framework for biology that makes data queryable, traceable, reproducible, and FAIR. Use when managing biological datasets (scRNA-seq, spatial, flow cytometry, etc.), tracking computational workflows, curating and validating data with biological ontologies, building data lakehouses, or ensuring data lineage and reproducibility in biological research. Covers data management, annotation, ontologies (genes, cell types, diseases, tissues), schema validation, integrations with workflow managers (Nextflow, Snakemake) and MLOps platforms (W&B, MLflow), and deployment strategies.
license: Apache-2.0 license
metadata:
    skill-author: K-Dense Inc.
---

# LaminDB

## Overview

LaminDB is an open-source data framework for biology designed to make data queryable, traceable, reproducible, and FAIR (Findable, Accessible, Interoperable, Reusable). It provides a unified platform that combines lakehouse architecture, lineage tracking, feature stores, biological ontologies, LIMS (Laboratory Information Management System), and ELN (Electronic Lab Notebook) capabilities through a single Python API.

**Core Value Proposition:**
- **Queryability**: Search and filter datasets by metadata, features, and ontology terms
- **Traceability**: Automatic lineage tracking from raw data through analysis to results
- **Reproducibility**: Version control for data, code, and environment
- **FAIR Compliance**: Standardized annotations using biological ontologies

## When to Use This Skill

Use this skill when:

- **Managing biological datasets**: scRNA-seq, bulk RNA-seq, spatial transcriptomics, flow cytometry, multi-modal data, EHR data
- **Tracking computational workflows**: Notebooks, scripts, pipeline execution (Nextflow, Snakemake, Redun)
- **Curating and validating data**: Schema validation, standardization, ontology-based annotation
- **Working with biological ontologies**: Genes, proteins, cell types, tissues, diseases, pathways (via Bionty)
- **Building data lakehouses**: Unified query interface across multiple datasets
- **Ensuring reproducibility**: Automatic versioning, lineage tracking, environment capture
- **Integrating ML pipelines**: Connecting with Weights & Biases, MLflow, HuggingFace, scVI-tools
- **Deploying data infrastructure**: Setting up local or cloud-based data management systems
- **Collaborating on datasets**: Sharing curated, annotated data with standardized metadata

## Core Capabilities

LaminDB provides six interconnected capability areas, each documented in detail in the references folder.

### 1. Core Concepts and Data Lineage

**Core entities:**
- **Artifacts**: Versioned datasets (DataFrame, AnnData, Parquet, Zarr, etc.)
- **Records**: Experimental entities (samples, perturbations, instruments)
- **Runs & Transforms**: Computational lineage tracking (what code produced what data)
- **Features**: Typed metadata fields for annotation and querying

**Key workflows:**
- Create and version artifacts from files or Python objects
- Track notebook/script execution with `ln.track()` and `ln.finish()`
- Annotate artifacts with typed features
- Visualize data lineage graphs with `artifact.view_lineage()`
- Query by provenance (find all outputs from specific code/inputs)

**Reference:** `references/core-concepts.md` - Read this for detailed information on artifacts, records, runs, transforms, features, versioning, and lineage tracking.

### 2. Data Management and Querying

**Query capabilities:**
- Registry exploration and lookup with auto-complete
- Single record retrieval with `get()`, `one()`, `one_or_none()`
- Filtering with comparison operators (`__gt`, `__lte`, `__contains`, `__startswith`)
- Feature-based queries (query by annotated metadata)
- Cross-registry traversal with double-underscore syntax
- Full-text search across registries
- Advanced logical queries with Q objects (AND, OR, NOT)
- Streaming large datasets without loading into memory

**Key workflows:**
- Browse artifacts with filters and ordering
- Query by features, creation date, creator, size, etc.
- Stream large files in chunks or with array slicing
- Organize data with hierarchical keys
- Group artifacts into collections

**Reference:** `references/data-management.md` - Read this for comprehensive query patterns, filtering examples, streaming strategies, and data organization best practices.

### 3. Annotation and Validation

**Curation process:**
1. **Validation**: Confirm datasets match desired schemas
2. **Standardization**: Fix typos, map synonyms to canonical terms
3. **Annotation**: Link datasets to metadata entities for queryability

**Schema types:**
- **Flexible schemas**: Validate only known columns, allow additional metadata
- **Minimal required schemas**: Specify essential columns, permit extras
- **Strict schemas**: Complete control over structure and values

**Supported data types:**
- DataFrames (Parquet, CSV)
- AnnData (single-cell genomics)
- MuData (multi-modal)
- SpatialData (spatial transcriptomics)
- TileDB-SOMA (scalable arrays)

**Key workflows:**
- Define features and schemas for data validation
- Use `DataFrameCurator` or `AnnDataCurator` for validation
- Standardize values with `.cat.standardize()`
- Map to ontologies with `.cat.add_ontology()`
- Save curated artifacts with schema linkage
- Query validated datasets by features

**Reference:** `references/annotation-validation.md` - Read this for detailed curation workflows, schema design patterns, handling validation errors, and best practices.

### 4. Biological Ontologies

**Available ontologies (via Bionty):**
- Genes (Ensembl), Proteins (UniProt)
- Cell types (CL), Cell lines (CLO)
- Tissues (Uberon), Diseases (Mondo, DOID)
- Phenotypes (HPO), Pathways (GO)
- Experimental factors (EFO), Developmental stages
- Organisms (NCBItaxon), Drugs (DrugBank)

**Key workflows:**
- Import public ontologies with `bt.CellType.import_source()`
- Search ontologies with keyword or exact matching
- Standardize terms using synonym mapping
- Explore hierarchical relationships (parents, children, ancestors)
- Validate data against ontology terms
- Annotate datasets with ontology records
- Create custom terms and hierarchies
- Handle multi-organism contexts (human, mouse, etc.)

**Reference:** `references/ontologies.md` - Read this for comprehensive ontology operations, standardization strategies, hierarchy navigation, and annotation workflows.

### 5. Integrations

**Workflow managers:**
- Nextflow: Track pipeline processes and outputs
- Snakemake: Integrate into Snakemake rules
- Redun: Combine with Redun task tracking

**MLOps platforms:**
- Weights & Biases: Link experiments with data artifacts
- MLflow: Track models and experiments
- HuggingFace: Track model fine-tuning
- scVI-tools: Single-cell analysis workflows

**Storage systems:**
- Local filesystem, AWS S3, Google Cloud Storage
- S3-compatible (MinIO, Cloudflare R2)
- HTTP/HTTPS endpoints (read-only)
- HuggingFace datasets

**Array stores:**
- TileDB-SOMA (with cellxgene support)
- DuckDB for SQL queries on Parquet files

**Visualization:**
- Vitessce for interactive spatial/single-cell visualization

**Version control:**
- Git integration for source code tracking

**Reference:** `references/integrations.md` - Read this for integration patterns, code examples, and troubleshooting for third-party systems.

### 6. Setup and Deployment

**Installation:**
- Basic: `uv pip install lamindb`
- With extras: `uv pip install 'lamindb[gcp,zarr,fcs]'`
- Modules: bionty, wetlab, clinical

**Instance types:**
- Local SQLite (development)
- Cloud storage + SQLite (small teams)
- Cloud storage + PostgreSQL (production)

**Storage options:**
- Local filesystem
- AWS S3 with configurable regions and permissions
- Google Cloud Storage
- S3-compatible endpoints (MinIO, Cloudflare R2)

**Configuration:**
- Cache management for cloud files
- Multi-user system configurations
- Git repository sync
- Environment variables

**Deployment patterns:**
- Local dev → Cloud production migration
- Multi-region deployments
- Shared storage with personal instances

**Reference:** `references/setup-deployment.md` - Read this for detailed installation, configuration, storage setup, database management, security best practices, and troubleshooting.

## Common Use Case Workflows

### Use Case 1: Single-Cell RNA-seq Analysis with Ontology Validation

```python
import lamindb as ln
import bionty as bt
import anndata as ad

# Start tracking
ln.track(params={"analysis": "scRNA-seq QC and annotation"})

# Import cell type ontology
bt.CellType.import_source()

# Load data
adata = ad.read_h5ad("raw_counts.h5ad")

# Validate and standardize cell types
adata.obs["cell_type"] = bt.CellType.standardize(adata.obs["cell_type"])

# Curate with schema
curator = ln.curators.AnnDataCurator(adata, schema)
curator.validate()
artifact = curator.save_artifact(key="scrna/validated.h5ad")

# Link ontology annotations
cell_types = bt.CellType.from_values(adata.obs.cell_type)
artifact.feature_sets.add_ontology(cell_types)

ln.finish()
```

### Use Case 2: Building a Queryable Data Lakehouse

```python
import lamindb as ln

# Register multiple experiments
for i, file in enumerate(data_files):
    artifact = ln.Artifact.from_anndata(
        ad.read_h5ad(file),
        key=f"scrna/batch_{i}.h5ad",
        description=f"scRNA-seq batch {i}"
    ).save()

    # Annotate with features
    artifact.features.add_values({
        "batch": i,
        "tissue": tissues[i],
        "condition": conditions[i]
    })

# Query across all experiments
immune_datasets = ln.Artifact.filter(
    key__startswith="scrna/",
    tissue="PBMC",
    condition="treated"
).to_dataframe()

# Load specific datasets
for artifact in immune_datasets:
    adata = artifact.load()
    # Analyze
```

### Use Case 3: ML Pipeline with W&B Integration

```python
import lamindb as ln
import wandb

# Initialize both systems
wandb.init(project="drug-response", name="exp-42")
ln.track(params={"model": "random_forest", "n_estimators": 100})

# Load training data from LaminDB
train_artifact = ln.Artifact.get(key="datasets/train.parquet")
train_data = train_artifact.load()

# Train model
model = train_model(train_data)

# Log to W&B
wandb.log({"accuracy": 0.95})

# Save model in LaminDB with W&B linkage
import joblib
joblib.dump(model, "model.pkl")
model_artifact = ln.Artifact("model.pkl", key="models/exp-42.pkl").save()
model_artifact.features.add_values({"wandb_run_id": wandb.run.id})

ln.finish()
wandb.finish()
```

### Use Case 4: Nextflow Pipeline Integration

```python
# In Nextflow process script
import lamindb as ln

ln.track()

# Load input artifact
input_artifact = ln.Artifact.get(key="raw/batch_${batch_id}.fastq.gz")
input_path = input_artifact.cache()

# Process (alignment, quantification, etc.)
# ... Nextflow process logic ...

# Save output
output_artifact = ln.Artifact(
    "counts.csv",
    key="processed/batch_${batch_id}_counts.csv"
).save()

ln.finish()
```

## Getting Started Checklist

To start using LaminDB effectively:

1. **Installation & Setup** (`references/setup-deployment.md`)
   - Install LaminDB and required extras
   - Authenticate with `lamin login`
   - Initialize instance with `lamin init --storage ...`

2. **Learn Core Concepts** (`references/core-concepts.md`)
   - Understand Artifacts, Records, Runs, Transforms
   - Practice creating and retrieving artifacts
   - Implement `ln.track()` and `ln.finish()` in workflows

3. **Master Querying** (`references/data-management.md`)
   - Practice filtering and searching registries
   - Learn feature-based queries
   - Experiment with streaming large files

4. **Set Up Validation** (`references/annotation-validation.md`)
   - Define features relevant to research domain
   - Create schemas for data types
   - Practice curation workflows

5. **Integrate Ontologies** (`references/ontologies.md`)
   - Import relevant biological ontologies (genes, cell types, etc.)
   - Validate existing annotations
   - Standardize metadata with ontology terms

6. **Connect Tools** (`references/integrations.md`)
   - Integrate with existing workflow managers
   - Link ML platforms for experiment tracking
   - Configure cloud storage and compute

## Key Principles

Follow these principles when working with LaminDB:

1. **Track everything**: Use `ln.track()` at the start of every analysis for automatic lineage capture

2. **Validate early**: Define schemas and validate data before extensive analysis

3. **Use ontologies**: Leverage public biological ontologies for standardized annotations

4. **Organize with keys**: Structure artifact keys hierarchically (e.g., `project/experiment/batch/file.h5ad`)

5. **Query metadata first**: Filter and search before loading large files

6. **Version, don't duplicate**: Use built-in versioning instead of creating new keys for modifications

7. **Annotate with features**: Define typed features for queryable metadata

8. **Document thoroughly**: Add descriptions to artifacts, schemas, and transforms

9. **Leverage lineage**: Use `view_lineage()` to understand data provenance

10. **Start local, scale cloud**: Develop locally with SQLite, deploy to cloud with PostgreSQL

## Reference Files

This skill includes comprehensive reference documentation organized by capability:

- **`references/core-concepts.md`** - Artifacts, records, runs, transforms, features, versioning, lineage
- **`references/data-management.md`** - Querying, filtering, searching, streaming, organizing data
- **`references/annotation-validation.md`** - Schema design, curation workflows, validation strategies
- **`references/ontologies.md`** - Biological ontology management, standardization, hierarchies
- **`references/integrations.md`** - Workflow managers, MLOps platforms, storage systems, tools
- **`references/setup-deployment.md`** - Installation, configuration, deployment, troubleshooting

Read the relevant reference file(s) based on the specific LaminDB capability needed for the task at hand.

## Additional Resources

- **Official Documentation**: https://docs.lamin.ai
- **API Reference**: https://docs.lamin.ai/api
- **GitHub Repository**: https://github.com/laminlabs/lamindb
- **Tutorial**: https://docs.lamin.ai/tutorial
- **FAQ**: https://docs.lamin.ai/faq

