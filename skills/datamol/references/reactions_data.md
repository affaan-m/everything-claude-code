# Datamol Reactions and Data Modules Reference

## Reactions Module (`datamol.reactions`)

The reactions module enables programmatic application of chemical transformations using SMARTS reaction patterns.

### Applying Chemical Reactions

#### `dm.reactions.apply_reaction(rxn, reactants, as_smiles=False, sanitize=True, single_product_group=True, rm_attach=True, product_index=0)`
Apply a chemical reaction to reactant molecules.
- **Parameters**:
  - `rxn`: Reaction object (from SMARTS pattern)
  - `reactants`: Tuple of reactant molecules
  - `as_smiles`: Return SMILES strings (True) or molecule objects (False)
  - `sanitize`: Sanitize product molecules
  - `single_product_group`: Return single product (True) or all product groups (False)
  - `rm_attach`: Remove attachment point markers
  - `product_index`: Which product to return from reaction
- **Returns**: Product molecule(s) or SMILES
- **Example**:
  ```python
  from rdkit import Chem

  # Define reaction: alcohol + carboxylic acid → ester
  rxn = Chem.rdChemReactions.ReactionFromSmarts(
      '[C:1][OH:2].[C:3](=[O:4])[OH:5]>>[C:1][O:2][C:3](=[O:4])'
  )

  # Apply to reactants
  alcohol = dm.to_mol("CCO")
  acid = dm.to_mol("CC(=O)O")
  product = dm.reactions.apply_reaction(rxn, (alcohol, acid))
  ```

### Creating Reactions

Reactions are typically created from SMARTS patterns using RDKit:
```python
from rdkit.Chem import rdChemReactions

# Reaction pattern: [reactant1].[reactant2]>>[product]
rxn = rdChemReactions.ReactionFromSmarts(
    '[1*][*:1].[1*][*:2]>>[*:1][*:2]'
)
```

### Validation Functions

The module includes functions to:
- **Check if molecule is reactant**: Verify if molecule matches reactant pattern
- **Validate reaction**: Check if reaction is synthetically reasonable
- **Process reaction files**: Load reactions from files or databases

### Common Reaction Patterns

**Amide formation**:
```python
# Amine + carboxylic acid → amide
amide_rxn = rdChemReactions.ReactionFromSmarts(
    '[N:1].[C:2](=[O:3])[OH]>>[N:1][C:2](=[O:3])'
)
```

**Suzuki coupling**:
```python
# Aryl halide + boronic acid → biaryl
suzuki_rxn = rdChemReactions.ReactionFromSmarts(
    '[c:1][Br].[c:2][B]([OH])[OH]>>[c:1][c:2]'
)
```

**Functional group transformations**:
```python
# Alcohol → ester
esterification = rdChemReactions.ReactionFromSmarts(
    '[C:1][OH:2].[C:3](=[O:4])[Cl]>>[C:1][O:2][C:3](=[O:4])'
)
```

### Workflow Example

```python
import datamol as dm
from rdkit.Chem import rdChemReactions

# 1. Define reaction
rxn_smarts = '[C:1](=[O:2])[OH:3]>>[C:1](=[O:2])[Cl:3]'  # Acid → acid chloride
rxn = rdChemReactions.ReactionFromSmarts(rxn_smarts)

# 2. Apply to molecule library
acids = [dm.to_mol(smi) for smi in acid_smiles_list]
acid_chlorides = []

for acid in acids:
    try:
        product = dm.reactions.apply_reaction(
            rxn,
            (acid,),  # Single reactant as tuple
            sanitize=True
        )
        acid_chlorides.append(product)
    except Exception as e:
        print(f"Reaction failed: {e}")

# 3. Validate products
valid_products = [p for p in acid_chlorides if p is not None]
```

### Key Concepts

- **SMARTS**: SMiles ARbitrary Target Specification - pattern language for reactions
- **Atom Mapping**: Numbers like [C:1] preserve atom identity through reaction
- **Attachment Points**: [1*] represents generic connection points
- **Reaction Validation**: Not all SMARTS reactions are chemically reasonable

---

## Data Module (`datamol.data`)

The data module provides convenient access to curated molecular datasets for testing and learning.

### Available Datasets

#### `dm.data.cdk2(as_df=True, mol_column='mol')`
RDKit CDK2 dataset - kinase inhibitor data.
- **Parameters**:
  - `as_df`: Return as DataFrame (True) or list of molecules (False)
  - `mol_column`: Name for molecule column
- **Returns**: Dataset with molecular structures and activity data
- **Use case**: Small dataset for algorithm testing
- **Example**:
  ```python
  cdk2_df = dm.data.cdk2(as_df=True)
  print(cdk2_df.shape)
  print(cdk2_df.columns)
  ```

#### `dm.data.freesolv()`
FreeSolv dataset - experimental and calculated hydration free energies.
- **Contents**: 642 molecules with:
  - IUPAC names
  - SMILES strings
  - Experimental hydration free energy values
  - Calculated values
- **Warning**: "Only meant to be used as a toy dataset for pedagogic and testing purposes"
- **Not suitable for**: Benchmarking or production model training
- **Example**:
  ```python
  freesolv_df = dm.data.freesolv()
  # Columns: iupac, smiles, expt (kcal/mol), calc (kcal/mol)
  ```

#### `dm.data.solubility(as_df=True, mol_column='mol')`
RDKit solubility dataset with train/test splits.
- **Contents**: Aqueous solubility data with pre-defined splits
- **Columns**: Includes 'split' column with 'train' or 'test' values
- **Use case**: Testing ML workflows with proper train/test separation
- **Example**:
  ```python
  sol_df = dm.data.solubility(as_df=True)

  # Split into train/test
  train_df = sol_df[sol_df['split'] == 'train']
  test_df = sol_df[sol_df['split'] == 'test']

  # Use for model development
  X_train = dm.to_fp(train_df[mol_column])
  y_train = train_df['solubility']
  ```

### Usage Guidelines

**For testing and tutorials**:
```python
# Quick dataset for testing code
df = dm.data.cdk2()
mols = df['mol'].tolist()

# Test descriptor calculation
descriptors_df = dm.descriptors.batch_compute_many_descriptors(mols)

# Test clustering
clusters = dm.cluster_mols(mols, cutoff=0.3)
```

**For learning workflows**:
```python
# Complete ML pipeline example
sol_df = dm.data.solubility()

# Preprocessing
train = sol_df[sol_df['split'] == 'train']
test = sol_df[sol_df['split'] == 'test']

# Featurization
X_train = dm.to_fp(train['mol'])
X_test = dm.to_fp(test['mol'])

# Model training (example)
from sklearn.ensemble import RandomForestRegressor
model = RandomForestRegressor()
model.fit(X_train, train['solubility'])
predictions = model.predict(X_test)
```

### Important Notes

- **Toy Datasets**: Designed for pedagogical purposes, not production use
- **Small Size**: Limited number of compounds suitable for quick tests
- **Pre-processed**: Data already cleaned and formatted
- **Citations**: Check dataset documentation for proper attribution if publishing

### Best Practices

1. **Use for development only**: Don't draw scientific conclusions from toy datasets
2. **Validate on real data**: Always test production code on actual project data
3. **Proper attribution**: Cite original data sources if using in publications
4. **Understand limitations**: Know the scope and quality of each dataset
