# Basic GRN Inference with Arboreto

## Input Data Requirements

Arboreto requires gene expression data in one of two formats:

### Pandas DataFrame (Recommended)
- **Rows**: Observations (cells, samples, conditions)
- **Columns**: Genes (with gene names as column headers)
- **Format**: Numeric expression values

Example:
```python
import pandas as pd

# Load expression matrix with genes as columns
expression_matrix = pd.read_csv('expression_data.tsv', sep='\t')
# Columns: ['gene1', 'gene2', 'gene3', ...]
# Rows: observation data
```

### NumPy Array
- **Shape**: (observations, genes)
- **Requirement**: Separately provide gene names list matching column order

Example:
```python
import numpy as np

expression_matrix = np.genfromtxt('expression_data.tsv', delimiter='\t', skip_header=1)
with open('expression_data.tsv') as f:
    gene_names = [gene.strip() for gene in f.readline().split('\t')]

assert expression_matrix.shape[1] == len(gene_names)
```

## Transcription Factors (TFs)

Optionally provide a list of transcription factor names to restrict regulatory inference:

```python
from arboreto.utils import load_tf_names

# Load from file (one TF per line)
tf_names = load_tf_names('transcription_factors.txt')

# Or define directly
tf_names = ['TF1', 'TF2', 'TF3']
```

If not provided, all genes are considered potential regulators.

## Basic Inference Workflow

### Using Pandas DataFrame

```python
import pandas as pd
from arboreto.utils import load_tf_names
from arboreto.algo import grnboost2

if __name__ == '__main__':
    # Load expression data
    expression_matrix = pd.read_csv('expression_data.tsv', sep='\t')

    # Load transcription factors (optional)
    tf_names = load_tf_names('tf_list.txt')

    # Run GRN inference
    network = grnboost2(
        expression_data=expression_matrix,
        tf_names=tf_names  # Optional
    )

    # Save results
    network.to_csv('network_output.tsv', sep='\t', index=False, header=False)
```

**Critical**: The `if __name__ == '__main__':` guard is required because Dask spawns new processes internally.

### Using NumPy Array

```python
import numpy as np
from arboreto.algo import grnboost2

if __name__ == '__main__':
    # Load expression matrix
    expression_matrix = np.genfromtxt('expression_data.tsv', delimiter='\t', skip_header=1)

    # Extract gene names from header
    with open('expression_data.tsv') as f:
        gene_names = [gene.strip() for gene in f.readline().split('\t')]

    # Verify dimensions match
    assert expression_matrix.shape[1] == len(gene_names)

    # Run inference with explicit gene names
    network = grnboost2(
        expression_data=expression_matrix,
        gene_names=gene_names,
        tf_names=tf_names
    )

    network.to_csv('network_output.tsv', sep='\t', index=False, header=False)
```

## Output Format

Arboreto returns a Pandas DataFrame with three columns:

| Column | Description |
|--------|-------------|
| `TF` | Transcription factor (regulator) gene name |
| `target` | Target gene name |
| `importance` | Regulatory importance score (higher = stronger regulation) |

Example output:
```
TF1    gene5    0.856
TF2    gene12   0.743
TF1    gene8    0.621
```

## Setting Random Seed

For reproducible results, provide a seed parameter:

```python
network = grnboost2(
    expression_data=expression_matrix,
    tf_names=tf_names,
    seed=777
)
```

## Algorithm Selection

Use `grnboost2()` for most cases (faster, handles large datasets):
```python
from arboreto.algo import grnboost2
network = grnboost2(expression_data=expression_matrix)
```

Use `genie3()` for comparison or specific requirements:
```python
from arboreto.algo import genie3
network = genie3(expression_data=expression_matrix)
```

See `references/algorithms.md` for detailed algorithm comparison.
