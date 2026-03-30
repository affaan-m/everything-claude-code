# BEDspace: Joint Region and Metadata Embeddings

## Overview

BEDspace applies the StarSpace model to genomic data, enabling simultaneous training of numerical embeddings for both region sets and their metadata labels in a shared low-dimensional space. This allows for rich queries across regions and metadata.

## When to Use

Use BEDspace when working with:
- Region sets with associated metadata (cell types, tissues, conditions)
- Search tasks requiring metadata-aware similarity
- Cross-modal queries (e.g., "find regions similar to label X")
- Joint analysis of genomic content and experimental conditions

## Workflow

BEDspace consists of four sequential operations:

### 1. Preprocess

Format genomic intervals and metadata for StarSpace training:

```bash
geniml bedspace preprocess \
  --input /path/to/regions/ \
  --metadata labels.csv \
  --universe universe.bed \
  --labels "cell_type,tissue" \
  --output preprocessed.txt
```

**Required files:**
- **Input folder**: Directory containing BED files
- **Metadata CSV**: Must include `file_name` column matching BED filenames, plus metadata columns
- **Universe file**: Reference BED file for tokenization
- **Labels**: Comma-separated list of metadata columns to use

The preprocessing step adds `__label__` prefixes to metadata and converts regions to StarSpace-compatible format.

### 2. Train

Execute StarSpace model on preprocessed data:

```bash
geniml bedspace train \
  --path-to-starspace /path/to/starspace \
  --input preprocessed.txt \
  --output model/ \
  --dim 100 \
  --epochs 50 \
  --lr 0.05
```

**Key training parameters:**
- `--dim`: Embedding dimension (typical: 50-200)
- `--epochs`: Training epochs (typical: 20-100)
- `--lr`: Learning rate (typical: 0.01-0.1)

### 3. Distances

Compute distance metrics between region sets and metadata labels:

```bash
geniml bedspace distances \
  --input model/ \
  --metadata labels.csv \
  --universe universe.bed \
  --output distances.pkl
```

This step creates a distance matrix needed for similarity searches.

### 4. Search

Retrieve similar items across three scenarios:

**Region-to-Label (r2l)**: Query region set → retrieve similar metadata labels
```bash
geniml bedspace search -t r2l -d distances.pkl -q query_regions.bed -n 10
```

**Label-to-Region (l2r)**: Query metadata label → retrieve similar region sets
```bash
geniml bedspace search -t l2r -d distances.pkl -q "T_cell" -n 10
```

**Region-to-Region (r2r)**: Query region set → retrieve similar region sets
```bash
geniml bedspace search -t r2r -d distances.pkl -q query_regions.bed -n 10
```

The `-n` parameter controls the number of results returned.

## Python API

```python
from geniml.bedspace import BEDSpaceModel

# Load trained model
model = BEDSpaceModel.load('model/')

# Query similar items
results = model.search(
    query="T_cell",
    search_type="l2r",
    top_k=10
)
```

## Best Practices

- **Metadata structure**: Ensure metadata CSV includes `file_name` column that exactly matches BED filenames (without path)
- **Label selection**: Choose informative metadata columns that capture biological variation of interest
- **Universe consistency**: Use the same universe file across preprocessing, distances, and any subsequent analyses
- **Validation**: Preprocess and check output format before investing in training
- **StarSpace installation**: Install StarSpace separately as it's an external dependency

## Output Interpretation

Search results return items ranked by similarity in the joint embedding space:
- **r2l**: Identifies metadata labels characterizing your query regions
- **l2r**: Finds region sets matching your metadata criteria
- **r2r**: Discovers region sets with similar genomic content

## Requirements

BEDspace requires StarSpace to be installed separately. Download from: https://github.com/facebookresearch/StarSpace
