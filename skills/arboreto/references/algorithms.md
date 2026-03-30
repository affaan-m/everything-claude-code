# GRN Inference Algorithms

Arboreto provides two algorithms for gene regulatory network (GRN) inference, both based on the multiple regression approach.

## Algorithm Overview

Both algorithms follow the same inference strategy:
1. For each target gene in the dataset, train a regression model
2. Identify the most important features (potential regulators) from the model
3. Emit these features as candidate regulators with importance scores

The key difference is **computational efficiency** and the underlying regression method.

## GRNBoost2 (Recommended)

**Purpose**: Fast GRN inference for large-scale datasets using gradient boosting.

### When to Use
- **Large datasets**: Tens of thousands of observations (e.g., single-cell RNA-seq)
- **Time-constrained analysis**: Need faster results than GENIE3
- **Default choice**: GRNBoost2 is the flagship algorithm and recommended for most use cases

### Technical Details
- **Method**: Stochastic gradient boosting with early-stopping regularization
- **Performance**: Significantly faster than GENIE3 on large datasets
- **Output**: Same format as GENIE3 (TF-target-importance triplets)

### Usage
```python
from arboreto.algo import grnboost2

network = grnboost2(
    expression_data=expression_matrix,
    tf_names=tf_names,
    seed=42  # For reproducibility
)
```

### Parameters
```python
grnboost2(
    expression_data,           # Required: pandas DataFrame or numpy array
    gene_names=None,           # Required for numpy arrays
    tf_names='all',            # List of TF names or 'all'
    verbose=False,             # Print progress messages
    client_or_address='local', # Dask client or scheduler address
    seed=None                  # Random seed for reproducibility
)
```

## GENIE3

**Purpose**: Classic Random Forest-based GRN inference, serving as the conceptual blueprint.

### When to Use
- **Smaller datasets**: When dataset size allows for longer computation
- **Comparison studies**: When comparing with published GENIE3 results
- **Validation**: To validate GRNBoost2 results

### Technical Details
- **Method**: Random Forest or ExtraTrees regression
- **Foundation**: Original multiple regression GRN inference strategy
- **Trade-off**: More computationally expensive but well-established

### Usage
```python
from arboreto.algo import genie3

network = genie3(
    expression_data=expression_matrix,
    tf_names=tf_names,
    seed=42
)
```

### Parameters
```python
genie3(
    expression_data,           # Required: pandas DataFrame or numpy array
    gene_names=None,           # Required for numpy arrays
    tf_names='all',            # List of TF names or 'all'
    verbose=False,             # Print progress messages
    client_or_address='local', # Dask client or scheduler address
    seed=None                  # Random seed for reproducibility
)
```

## Algorithm Comparison

| Feature | GRNBoost2 | GENIE3 |
|---------|-----------|--------|
| **Speed** | Fast (optimized for large data) | Slower |
| **Method** | Gradient boosting | Random Forest |
| **Best for** | Large-scale data (10k+ observations) | Small-medium datasets |
| **Output format** | Same | Same |
| **Inference strategy** | Multiple regression | Multiple regression |
| **Recommended** | Yes (default choice) | For comparison/validation |

## Advanced: Custom Regressor Parameters

For advanced users, pass custom scikit-learn regressor parameters:

```python
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor

# Custom GRNBoost2 parameters
custom_grnboost2 = grnboost2(
    expression_data=expression_matrix,
    regressor_type='GBM',
    regressor_kwargs={
        'n_estimators': 100,
        'max_depth': 5,
        'learning_rate': 0.1
    }
)

# Custom GENIE3 parameters
custom_genie3 = genie3(
    expression_data=expression_matrix,
    regressor_type='RF',
    regressor_kwargs={
        'n_estimators': 1000,
        'max_features': 'sqrt'
    }
)
```

## Choosing the Right Algorithm

**Decision guide**:

1. **Start with GRNBoost2** - It's faster and handles large datasets better
2. **Use GENIE3 if**:
   - Comparing with existing GENIE3 publications
   - Dataset is small-medium sized
   - Validating GRNBoost2 results

Both algorithms produce comparable regulatory networks with the same output format, making them interchangeable for most analyses.
