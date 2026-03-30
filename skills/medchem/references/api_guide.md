# Medchem API Reference

Comprehensive reference for all medchem modules and functions.

## Module: medchem.rules

### Class: RuleFilters

Filter molecules based on multiple medicinal chemistry rules.

**Constructor:**
```python
RuleFilters(rule_list: List[str])
```

**Parameters:**
- `rule_list`: List of rule names to apply. See available rules below.

**Methods:**

```python
__call__(mols: List[Chem.Mol], n_jobs: int = 1, progress: bool = False) -> Dict
```
- `mols`: List of RDKit molecule objects
- `n_jobs`: Number of parallel jobs (-1 uses all cores)
- `progress`: Show progress bar
- **Returns**: Dictionary with results for each rule

**Example:**
```python
rfilter = mc.rules.RuleFilters(rule_list=["rule_of_five", "rule_of_cns"])
results = rfilter(mols=mol_list, n_jobs=-1, progress=True)
```

### Module: medchem.rules.basic_rules

Individual rule functions that can be applied to single molecules.

#### rule_of_five()

```python
rule_of_five(mol: Union[str, Chem.Mol]) -> bool
```

Lipinski's Rule of Five for oral bioavailability.

**Criteria:**
- Molecular weight ≤ 500 Da
- LogP ≤ 5
- H-bond donors ≤ 5
- H-bond acceptors ≤ 10

**Parameters:**
- `mol`: SMILES string or RDKit molecule object

**Returns:** True if molecule passes all criteria

#### rule_of_three()

```python
rule_of_three(mol: Union[str, Chem.Mol]) -> bool
```

Rule of Three for fragment screening libraries.

**Criteria:**
- Molecular weight ≤ 300 Da
- LogP ≤ 3
- H-bond donors ≤ 3
- H-bond acceptors ≤ 3
- Rotatable bonds ≤ 3
- Polar surface area ≤ 60 Ų

#### rule_of_oprea()

```python
rule_of_oprea(mol: Union[str, Chem.Mol]) -> bool
```

Oprea's lead-like criteria for hit-to-lead optimization.

**Criteria:**
- Molecular weight: 200-350 Da
- LogP: -2 to 4
- Rotatable bonds ≤ 7
- Rings ≤ 4

#### rule_of_cns()

```python
rule_of_cns(mol: Union[str, Chem.Mol]) -> bool
```

CNS drug-likeness rules.

**Criteria:**
- Molecular weight ≤ 450 Da
- LogP: -1 to 5
- H-bond donors ≤ 2
- TPSA ≤ 90 Ų

#### rule_of_leadlike_soft()

```python
rule_of_leadlike_soft(mol: Union[str, Chem.Mol]) -> bool
```

Soft lead-like criteria (more permissive).

**Criteria:**
- Molecular weight: 250-450 Da
- LogP: -3 to 4
- Rotatable bonds ≤ 10

#### rule_of_leadlike_strict()

```python
rule_of_leadlike_strict(mol: Union[str, Chem.Mol]) -> bool
```

Strict lead-like criteria (more restrictive).

**Criteria:**
- Molecular weight: 200-350 Da
- LogP: -2 to 3.5
- Rotatable bonds ≤ 7
- Rings: 1-3

#### rule_of_veber()

```python
rule_of_veber(mol: Union[str, Chem.Mol]) -> bool
```

Veber's rules for oral bioavailability.

**Criteria:**
- Rotatable bonds ≤ 10
- TPSA ≤ 140 Ų

#### rule_of_reos()

```python
rule_of_reos(mol: Union[str, Chem.Mol]) -> bool
```

Rapid Elimination Of Swill (REOS) filter.

**Criteria:**
- Molecular weight: 200-500 Da
- LogP: -5 to 5
- H-bond donors: 0-5
- H-bond acceptors: 0-10

#### rule_of_drug()

```python
rule_of_drug(mol: Union[str, Chem.Mol]) -> bool
```

Combined drug-likeness criteria.

**Criteria:**
- Passes Rule of Five
- Passes Veber rules
- No PAINS substructures

#### golden_triangle()

```python
golden_triangle(mol: Union[str, Chem.Mol]) -> bool
```

Golden Triangle for drug-likeness balance.

**Criteria:**
- 200 ≤ MW ≤ 50×LogP + 400
- LogP: -2 to 5

#### pains_filter()

```python
pains_filter(mol: Union[str, Chem.Mol]) -> bool
```

Pan Assay INterference compoundS (PAINS) filter.

**Returns:** True if molecule does NOT contain PAINS substructures

---

## Module: medchem.structural

### Class: CommonAlertsFilters

Filter for common structural alerts derived from ChEMBL and literature.

**Constructor:**
```python
CommonAlertsFilters()
```

**Methods:**

```python
__call__(mols: List[Chem.Mol], n_jobs: int = 1, progress: bool = False) -> List[Dict]
```

Apply common alerts filter to a list of molecules.

**Returns:** List of dictionaries with keys:
- `has_alerts`: Boolean indicating if molecule has alerts
- `alert_details`: List of matched alert patterns
- `num_alerts`: Number of alerts found

```python
check_mol(mol: Chem.Mol) -> Tuple[bool, List[str]]
```

Check a single molecule for structural alerts.

**Returns:** Tuple of (has_alerts, list_of_alert_names)

### Class: NIBRFilters

Novartis NIBR medicinal chemistry filters.

**Constructor:**
```python
NIBRFilters()
```

**Methods:**

```python
__call__(mols: List[Chem.Mol], n_jobs: int = 1, progress: bool = False) -> List[bool]
```

Apply NIBR filters to molecules.

**Returns:** List of booleans (True if molecule passes)

### Class: LillyDemeritsFilters

Eli Lilly's demerit-based structural alert system (275 rules).

**Constructor:**
```python
LillyDemeritsFilters()
```

**Methods:**

```python
__call__(mols: List[Chem.Mol], n_jobs: int = 1, progress: bool = False) -> List[Dict]
```

Calculate Lilly demerits for molecules.

**Returns:** List of dictionaries with keys:
- `demerits`: Total demerit score
- `passes`: Boolean (True if demerits ≤ 100)
- `matched_patterns`: List of matched patterns with scores

---

## Module: medchem.functional

High-level functional API for common operations.

### nibr_filter()

```python
nibr_filter(mols: List[Chem.Mol], n_jobs: int = 1) -> List[bool]
```

Apply NIBR filters using functional API.

**Parameters:**
- `mols`: List of molecules
- `n_jobs`: Parallelization level

**Returns:** List of pass/fail booleans

### common_alerts_filter()

```python
common_alerts_filter(mols: List[Chem.Mol], n_jobs: int = 1) -> List[Dict]
```

Apply common alerts filter using functional API.

**Returns:** List of results dictionaries

### lilly_demerits_filter()

```python
lilly_demerits_filter(mols: List[Chem.Mol], n_jobs: int = 1) -> List[Dict]
```

Calculate Lilly demerits using functional API.

---

## Module: medchem.groups

### Class: ChemicalGroup

Detect specific chemical groups in molecules.

**Constructor:**
```python
ChemicalGroup(groups: List[str], custom_smarts: Optional[Dict[str, str]] = None)
```

**Parameters:**
- `groups`: List of predefined group names
- `custom_smarts`: Dictionary mapping custom group names to SMARTS patterns

**Predefined Groups:**
- `"hinge_binders"`: Kinase hinge binding motifs
- `"phosphate_binders"`: Phosphate binding groups
- `"michael_acceptors"`: Michael acceptor electrophiles
- `"reactive_groups"`: General reactive functionalities

**Methods:**

```python
has_match(mols: List[Chem.Mol]) -> List[bool]
```

Check if molecules contain any of the specified groups.

```python
get_matches(mol: Chem.Mol) -> Dict[str, List[Tuple]]
```

Get detailed match information for a single molecule.

**Returns:** Dictionary mapping group names to lists of atom indices

```python
get_all_matches(mols: List[Chem.Mol]) -> List[Dict]
```

Get match information for all molecules.

**Example:**
```python
group = mc.groups.ChemicalGroup(groups=["hinge_binders", "phosphate_binders"])
matches = group.get_all_matches(mol_list)
```

---

## Module: medchem.catalogs

### Class: NamedCatalogs

Access to curated chemical catalogs.

**Available Catalogs:**
- `"functional_groups"`: Common functional groups
- `"protecting_groups"`: Protecting group structures
- `"reagents"`: Common reagents
- `"fragments"`: Standard fragments

**Usage:**
```python
catalog = mc.catalogs.NamedCatalogs.get("functional_groups")
matches = catalog.get_matches(mol)
```

---

## Module: medchem.complexity

Calculate molecular complexity metrics.

### calculate_complexity()

```python
calculate_complexity(mol: Chem.Mol, method: str = "bertz") -> float
```

Calculate complexity score for a molecule.

**Parameters:**
- `mol`: RDKit molecule
- `method`: Complexity metric ("bertz", "whitlock", "barone")

**Returns:** Complexity score (higher = more complex)

### Class: ComplexityFilter

Filter molecules by complexity threshold.

**Constructor:**
```python
ComplexityFilter(max_complexity: float, method: str = "bertz")
```

**Methods:**

```python
__call__(mols: List[Chem.Mol], n_jobs: int = 1) -> List[bool]
```

Filter molecules exceeding complexity threshold.

---

## Module: medchem.constraints

### Class: Constraints

Apply custom property-based constraints.

**Constructor:**
```python
Constraints(
    mw_range: Optional[Tuple[float, float]] = None,
    logp_range: Optional[Tuple[float, float]] = None,
    tpsa_max: Optional[float] = None,
    tpsa_range: Optional[Tuple[float, float]] = None,
    hbd_max: Optional[int] = None,
    hba_max: Optional[int] = None,
    rotatable_bonds_max: Optional[int] = None,
    rings_range: Optional[Tuple[int, int]] = None,
    aromatic_rings_max: Optional[int] = None,
)
```

**Parameters:** All parameters are optional. Specify only the constraints needed.

**Methods:**

```python
__call__(mols: List[Chem.Mol], n_jobs: int = 1) -> List[Dict]
```

Apply constraints to molecules.

**Returns:** List of dictionaries with keys:
- `passes`: Boolean indicating if all constraints pass
- `violations`: List of constraint names that failed

**Example:**
```python
constraints = mc.constraints.Constraints(
    mw_range=(200, 500),
    logp_range=(-2, 5),
    tpsa_max=140
)
results = constraints(mols=mol_list, n_jobs=-1)
```

---

## Module: medchem.query

Query language for complex filtering.

### parse()

```python
parse(query: str) -> Query
```

Parse a medchem query string into a Query object.

**Query Syntax:**
- Operators: `AND`, `OR`, `NOT`
- Comparisons: `<`, `>`, `<=`, `>=`, `==`, `!=`
- Properties: `complexity`, `lilly_demerits`, `mw`, `logp`, `tpsa`
- Rules: `rule_of_five`, `rule_of_cns`, etc.
- Filters: `common_alerts`, `nibr_filter`, `pains_filter`

**Example Queries:**
```python
"rule_of_five AND NOT common_alerts"
"rule_of_cns AND complexity < 400"
"mw > 200 AND mw < 500 AND logp < 5"
"(rule_of_five OR rule_of_oprea) AND NOT pains_filter"
```

### Class: Query

**Methods:**

```python
apply(mols: List[Chem.Mol], n_jobs: int = 1) -> List[bool]
```

Apply parsed query to molecules.

**Example:**
```python
query = mc.query.parse("rule_of_five AND NOT common_alerts")
results = query.apply(mols=mol_list, n_jobs=-1)
passing_mols = [mol for mol, passes in zip(mol_list, results) if passes]
```

---

## Module: medchem.utils

Utility functions for working with molecules.

### batch_process()

```python
batch_process(
    mols: List[Chem.Mol],
    func: Callable,
    n_jobs: int = 1,
    progress: bool = False,
    batch_size: Optional[int] = None
) -> List
```

Process molecules in parallel batches.

**Parameters:**
- `mols`: List of molecules
- `func`: Function to apply to each molecule
- `n_jobs`: Number of parallel workers
- `progress`: Show progress bar
- `batch_size`: Size of processing batches

### standardize_mol()

```python
standardize_mol(mol: Chem.Mol) -> Chem.Mol
```

Standardize molecule representation (sanitize, neutralize charges, etc.).

---

## Common Patterns

### Pattern: Parallel Processing

All filters support parallelization:

```python
# Use all CPU cores
results = filter_object(mols=mol_list, n_jobs=-1, progress=True)

# Use specific number of cores
results = filter_object(mols=mol_list, n_jobs=4, progress=True)
```

### Pattern: Combining Multiple Filters

```python
import medchem as mc

# Apply multiple filters
rule_filter = mc.rules.RuleFilters(rule_list=["rule_of_five"])
alert_filter = mc.structural.CommonAlertsFilters()
lilly_filter = mc.structural.LillyDemeritsFilters()

# Get results
rule_results = rule_filter(mols=mol_list, n_jobs=-1)
alert_results = alert_filter(mols=mol_list, n_jobs=-1)
lilly_results = lilly_filter(mols=mol_list, n_jobs=-1)

# Combine criteria
passing_mols = [
    mol for i, mol in enumerate(mol_list)
    if rule_results[i]["passes"]
    and not alert_results[i]["has_alerts"]
    and lilly_results[i]["passes"]
]
```

### Pattern: Working with DataFrames

```python
import pandas as pd
import datamol as dm
import medchem as mc

# Load data
df = pd.read_csv("molecules.csv")
df["mol"] = df["smiles"].apply(dm.to_mol)

# Apply filters
rfilter = mc.rules.RuleFilters(rule_list=["rule_of_five", "rule_of_cns"])
results = rfilter(mols=df["mol"].tolist(), n_jobs=-1)

# Add results to dataframe
df["passes_ro5"] = [r["rule_of_five"] for r in results]
df["passes_cns"] = [r["rule_of_cns"] for r in results]

# Filter dataframe
filtered_df = df[df["passes_ro5"] & df["passes_cns"]]
```
