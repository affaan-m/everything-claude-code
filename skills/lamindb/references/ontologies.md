# LaminDB Ontology Management

This document covers biological ontology management in LaminDB through the Bionty plugin, including accessing, searching, and annotating data with standardized biological terms.

## Overview

LaminDB integrates the `bionty` plugin to manage standardized biological ontologies, enabling consistent metadata curation and data annotation across research projects. Bionty provides access to 20+ curated biological ontologies covering genes, proteins, cell types, tissues, diseases, and more.

## Available Ontologies

LaminDB provides access to multiple curated ontology sources:

| Registry | Ontology Source | Description |
|----------|----------------|-------------|
| **Gene** | Ensembl | Genes across organisms (human, mouse, etc.) |
| **Protein** | UniProt | Protein sequences and annotations |
| **CellType** | Cell Ontology (CL) | Standardized cell type classifications |
| **CellLine** | Cell Line Ontology (CLO) | Cell line annotations |
| **Tissue** | Uberon | Anatomical structures and tissues |
| **Disease** | Mondo, DOID | Disease classifications |
| **Phenotype** | Human Phenotype Ontology (HPO) | Phenotypic abnormalities |
| **Pathway** | Gene Ontology (GO) | Biological pathways and processes |
| **ExperimentalFactor** | Experimental Factor Ontology (EFO) | Experimental variables |
| **DevelopmentalStage** | Various | Developmental stages across organisms |
| **Ethnicity** | HANCESTRO | Human ancestry ontology |
| **Drug** | DrugBank | Drug compounds |
| **Organism** | NCBItaxon | Taxonomic classifications |

## Installation and Import

```python
# Install bionty (included with lamindb)
pip install lamindb

# Import
import lamindb as ln
import bionty as bt
```

## Importing Public Ontologies

Populate your registry with a public ontology source:

```python
# Import Cell Ontology
bt.CellType.import_source()

# Import organism-specific genes
bt.Gene.import_source(organism="human")
bt.Gene.import_source(organism="mouse")

# Import tissues
bt.Tissue.import_source()

# Import diseases
bt.Disease.import_source(source="mondo")  # Mondo Disease Ontology
bt.Disease.import_source(source="doid")   # Disease Ontology
```

## Searching and Accessing Records

### Keyword Search

```python
# Search cell types
bt.CellType.search("T cell").to_dataframe()
bt.CellType.search("gamma-delta").to_dataframe()

# Search genes
bt.Gene.search("CD8").to_dataframe()
bt.Gene.search("TP53").to_dataframe()

# Search diseases
bt.Disease.search("cancer").to_dataframe()

# Search tissues
bt.Tissue.search("brain").to_dataframe()
```

### Auto-Complete Lookup

For registries with fewer than 100k records:

```python
# Create lookup object
cell_types = bt.CellType.lookup()

# Access by name (auto-complete in IDEs)
t_cell = cell_types.t_cell
hsc = cell_types.hematopoietic_stem_cell

# Similarly for other registries
genes = bt.Gene.lookup()
cd8a = genes.cd8a
```

### Exact Field Matching

```python
# By ontology ID
cell_type = bt.CellType.get(ontology_id="CL:0000798")
disease = bt.Disease.get(ontology_id="MONDO:0004992")

# By name
cell_type = bt.CellType.get(name="T cell")
gene = bt.Gene.get(symbol="CD8A")

# By Ensembl ID
gene = bt.Gene.get(ensembl_gene_id="ENSG00000153563")
```

## Ontological Hierarchies

### Exploring Relationships

```python
# Get a cell type
gdt_cell = bt.CellType.get(ontology_id="CL:0000798")  # gamma-delta T cell

# View direct parents
gdt_cell.parents.to_dataframe()

# View all ancestors recursively
ancestors = []
current = gdt_cell
while current.parents.exists():
    parent = current.parents.first()
    ancestors.append(parent)
    current = parent

# View direct children
gdt_cell.children.to_dataframe()

# View all descendants recursively
gdt_cell.query_children().to_dataframe()
```

### Visualizing Hierarchies

```python
# Visualize parent hierarchy
gdt_cell.view_parents()

# Include children in visualization
gdt_cell.view_parents(with_children=True)

# Get all related terms for visualization
t_cell = bt.CellType.get(name="T cell")
t_cell.view_parents(with_children=True)  # Shows T cell subtypes
```

## Standardizing and Validating Data

### Validation

Check if terms exist in the ontology:

```python
# Validate cell types
bt.CellType.validate(["T cell", "B cell", "invalid_cell"])
# Returns: [True, True, False]

# Validate genes
bt.Gene.validate(["CD8A", "TP53", "FAKEGENE"], organism="human")
# Returns: [True, True, False]

# Check which terms are invalid
terms = ["T cell", "fat cell", "neuron", "invalid_term"]
invalid = [t for t, valid in zip(terms, bt.CellType.validate(terms)) if not valid]
print(f"Invalid terms: {invalid}")
```

### Standardization with Synonyms

Convert non-standard terms to validated names:

```python
# Standardize cell type names
bt.CellType.standardize(["fat cell", "blood forming stem cell"])
# Returns: ['adipocyte', 'hematopoietic stem cell']

# Standardize genes
bt.Gene.standardize(["BRCA-1", "p53"], organism="human")
# Returns: ['BRCA1', 'TP53']

# Handle mixed valid/invalid terms
terms = ["T cell", "T lymphocyte", "invalid"]
standardized = bt.CellType.standardize(terms)
# Returns standardized names where possible
```

### Loading Validated Records

```python
# Load records from values (including synonyms)
records = bt.CellType.from_values(["fat cell", "blood forming stem cell"])

# Returns list of CellType records
for record in records:
    print(record.name, record.ontology_id)

# Use with gene symbols
genes = bt.Gene.from_values(["CD8A", "CD8B"], organism="human")
```

## Annotating Datasets

### Annotating AnnData

```python
import anndata as ad
import lamindb as ln

# Load example data
adata = ad.read_h5ad("data.h5ad")

# Validate and retrieve matching records
cell_types = bt.CellType.from_values(adata.obs.cell_type)

# Create artifact with annotations
artifact = ln.Artifact.from_anndata(
    adata,
    key="scrna/annotated_data.h5ad",
    description="scRNA-seq data with validated cell type annotations"
).save()

# Link ontology records to artifact
artifact.feature_sets.add_ontology(cell_types)
```

### Annotating DataFrames

```python
import pandas as pd

# Create DataFrame with biological entities
df = pd.DataFrame({
    "cell_type": ["T cell", "B cell", "NK cell"],
    "tissue": ["blood", "spleen", "liver"],
    "disease": ["healthy", "lymphoma", "healthy"]
})

# Validate and standardize
df["cell_type"] = bt.CellType.standardize(df["cell_type"])
df["tissue"] = bt.Tissue.standardize(df["tissue"])

# Create artifact
artifact = ln.Artifact.from_dataframe(
    df,
    key="metadata/sample_info.parquet"
).save()

# Link ontology records
cell_type_records = bt.CellType.from_values(df["cell_type"])
tissue_records = bt.Tissue.from_values(df["tissue"])

artifact.feature_sets.add_ontology(cell_type_records)
artifact.feature_sets.add_ontology(tissue_records)
```

## Managing Custom Terms and Hierarchies

### Adding Custom Terms

```python
# Register new term not in public ontology
my_celltype = bt.CellType(name="my_novel_T_cell_subtype").save()

# Establish parent-child relationship
parent = bt.CellType.get(name="T cell")
my_celltype.parents.add(parent)

# Verify relationship
my_celltype.parents.to_dataframe()
parent.children.to_dataframe()  # Should include my_celltype
```

### Adding Synonyms

```python
# Add synonyms for standardization
hsc = bt.CellType.get(name="hematopoietic stem cell")
hsc.add_synonym("HSC")
hsc.add_synonym("blood stem cell")
hsc.add_synonym("hematopoietic progenitor")

# Set abbreviation
hsc.set_abbr("HSC")

# Now standardization works with synonyms
bt.CellType.standardize(["HSC", "blood stem cell"])
# Returns: ['hematopoietic stem cell', 'hematopoietic stem cell']
```

### Creating Custom Hierarchies

```python
# Build custom cell type hierarchy
immune_cell = bt.CellType.get(name="immune cell")

# Add custom subtypes
my_subtype1 = bt.CellType(name="custom_immune_subtype_1").save()
my_subtype2 = bt.CellType(name="custom_immune_subtype_2").save()

# Link to parent
my_subtype1.parents.add(immune_cell)
my_subtype2.parents.add(immune_cell)

# Create sub-subtypes
my_subsubtype = bt.CellType(name="custom_sub_subtype").save()
my_subsubtype.parents.add(my_subtype1)

# Visualize custom hierarchy
immune_cell.view_parents(with_children=True)
```

## Multi-Organism Support

For organism-aware registries like Gene:

```python
# Set global organism
bt.settings.organism = "human"

# Validate human genes
bt.Gene.validate(["TCF7", "CD8A"], organism="human")

# Load genes for specific organism
human_genes = bt.Gene.from_values(["CD8A", "TP53"], organism="human")
mouse_genes = bt.Gene.from_values(["Cd8a", "Trp53"], organism="mouse")

# Search organism-specific genes
bt.Gene.search("CD8", organism="human").to_dataframe()
bt.Gene.search("Cd8", organism="mouse").to_dataframe()

# Switch organism context
bt.settings.organism = "mouse"
genes = bt.Gene.from_source(symbol="Ap5b1")
```

## Public Ontology Lookup

Access terms from public ontologies without importing:

```python
# Interactive lookup in public sources
cell_types_public = bt.CellType.lookup(public=True)

# Access public terms
hepatocyte = cell_types_public.hepatocyte

# Import specific term
hepatocyte_local = bt.CellType.from_source(name="hepatocyte")

# Or import by ontology ID
specific_cell = bt.CellType.from_source(ontology_id="CL:0000182")
```

## Version Tracking

LaminDB automatically tracks ontology versions:

```python
# View current source versions
bt.Source.filter(currently_used=True).to_dataframe()

# Check which source a record derives from
cell_type = bt.CellType.get(name="hepatocyte")
cell_type.source  # Returns Source metadata

# View source details
source = cell_type.source
print(source.name)        # e.g., "cl"
print(source.version)     # e.g., "2023-05-18"
print(source.url)         # Ontology URL
```

## Ontology Integration Workflows

### Workflow 1: Validate Existing Data

```python
# Load data with biological annotations
adata = ad.read_h5ad("uncurated_data.h5ad")

# Validate cell types
validation = bt.CellType.validate(adata.obs.cell_type)

# Identify invalid terms
invalid_idx = [i for i, v in enumerate(validation) if not v]
invalid_terms = adata.obs.cell_type.iloc[invalid_idx].unique()
print(f"Invalid cell types: {invalid_terms}")

# Fix invalid terms manually or with standardization
adata.obs["cell_type"] = bt.CellType.standardize(adata.obs.cell_type)

# Re-validate
validation = bt.CellType.validate(adata.obs.cell_type)
assert all(validation), "All terms should now be valid"
```

### Workflow 2: Curate and Annotate

```python
import lamindb as ln

ln.track()  # Start tracking

# Load data
df = pd.read_csv("experimental_data.csv")

# Standardize using ontologies
df["cell_type"] = bt.CellType.standardize(df["cell_type"])
df["tissue"] = bt.Tissue.standardize(df["tissue"])

# Create curated artifact
artifact = ln.Artifact.from_dataframe(
    df,
    key="curated/experiment_2025_10.parquet",
    description="Curated experimental data with ontology-validated annotations"
).save()

# Link ontology records
artifact.feature_sets.add_ontology(bt.CellType.from_values(df["cell_type"]))
artifact.feature_sets.add_ontology(bt.Tissue.from_values(df["tissue"]))

ln.finish()  # Complete tracking
```

### Workflow 3: Cross-Organism Gene Mapping

```python
# Get human genes
human_genes = ["CD8A", "CD8B", "TP53"]
human_records = bt.Gene.from_values(human_genes, organism="human")

# Find mouse orthologs (requires external mapping)
# LaminDB doesn't provide built-in ortholog mapping
# Use external tools like Ensembl BioMart or homologene

mouse_orthologs = ["Cd8a", "Cd8b", "Trp53"]
mouse_records = bt.Gene.from_values(mouse_orthologs, organism="mouse")
```

## Querying Ontology-Annotated Data

```python
# Find all datasets with specific cell type
t_cell = bt.CellType.get(name="T cell")
ln.Artifact.filter(feature_sets__cell_types=t_cell).to_dataframe()

# Find datasets measuring specific genes
cd8a = bt.Gene.get(symbol="CD8A", organism="human")
ln.Artifact.filter(feature_sets__genes=cd8a).to_dataframe()

# Query across ontology hierarchy
# Find all datasets with T cell or T cell subtypes
t_cell_subtypes = t_cell.query_children()
ln.Artifact.filter(
    feature_sets__cell_types__in=t_cell_subtypes
).to_dataframe()
```

## Best Practices

1. **Import ontologies first**: Call `import_source()` before validation
2. **Use standardization**: Leverage synonym mapping to handle variations
3. **Validate early**: Check terms before creating artifacts
4. **Set organism context**: Specify organism for gene-related queries
5. **Add custom synonyms**: Register common variations in your domain
6. **Use public lookup**: Access `lookup(public=True)` for term discovery
7. **Track versions**: Monitor ontology source versions for reproducibility
8. **Build hierarchies**: Link custom terms to existing ontology structures
9. **Query hierarchically**: Use `query_children()` for comprehensive searches
10. **Document mappings**: Track custom term additions and relationships

## Common Ontology Operations

```python
# Check if term exists
exists = bt.CellType.filter(name="T cell").exists()

# Count terms in registry
n_cell_types = bt.CellType.filter().count()

# Get all terms with specific parent
immune_cells = bt.CellType.filter(parents__name="immune cell")

# Find orphan terms (no parents)
orphans = bt.CellType.filter(parents__isnull=True)

# Get recently added terms
from datetime import datetime, timedelta
recent = bt.CellType.filter(
    created_at__gte=datetime.now() - timedelta(days=7)
)
```
