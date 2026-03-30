---
name: medchem
description: Medicinal chemistry filters. Apply drug-likeness rules (Lipinski, Veber), PAINS filters, structural alerts, complexity metrics, for compound prioritization and library filtering.
license: Apache-2.0 license
metadata:
    skill-author: K-Dense Inc.
---

# Medchem

## Overview

Medchem is a Python library for molecular filtering and prioritization in drug discovery workflows. Apply hundreds of well-established and novel molecular filters, structural alerts, and medicinal chemistry rules to efficiently triage and prioritize compound libraries at scale. Rules and filters are context-specific—use as guidelines combined with domain expertise.

## When to Use This Skill

This skill should be used when:
- Applying drug-likeness rules (Lipinski, Veber, etc.) to compound libraries
- Filtering molecules by structural alerts or PAINS patterns
- Prioritizing compounds for lead optimization
- Assessing compound quality and medicinal chemistry properties
- Detecting reactive or problematic functional groups
- Calculating molecular complexity metrics

## Installation

```bash
uv pip install medchem
```

## Core Capabilities

### 1. Medicinal Chemistry Rules

Apply established drug-likeness rules to molecules using the `medchem.rules` module.

**Available Rules:**
- Rule of Five (Lipinski)
- Rule of Oprea
- Rule of CNS
- Rule of leadlike (soft and strict)
- Rule of three
- Rule of Reos
- Rule of drug
- Rule of Veber
- Golden triangle
- PAINS filters

**Single Rule Application:**

```python
import medchem as mc

# Apply Rule of Five to a SMILES string
smiles = "CC(=O)OC1=CC=CC=C1C(=O)O"  # Aspirin
passes = mc.rules.basic_rules.rule_of_five(smiles)
# Returns: True

# Check specific rules
passes_oprea = mc.rules.basic_rules.rule_of_oprea(smiles)
passes_cns = mc.rules.basic_rules.rule_of_cns(smiles)
```

**Multiple Rules with RuleFilters:**

```python
import datamol as dm
import medchem as mc

# Load molecules
mols = [dm.to_mol(smiles) for smiles in smiles_list]

# Create filter with multiple rules
rfilter = mc.rules.RuleFilters(
    rule_list=[
        "rule_of_five",
        "rule_of_oprea",
        "rule_of_cns",
        "rule_of_leadlike_soft"
    ]
)

# Apply filters with parallelization
results = rfilter(
    mols=mols,
    n_jobs=-1,  # Use all CPU cores
    progress=True
)
```

**Result Format:**
Results are returned as dictionaries with pass/fail status and detailed information for each rule.

### 2. Structural Alert Filters

Detect potentially problematic structural patterns using the `medchem.structural` module.

**Available Filters:**

1. **Common Alerts** - General structural alerts derived from ChEMBL curation and literature
2. **NIBR Filters** - Novartis Institutes for BioMedical Research filter set
3. **Lilly Demerits** - Eli Lilly's demerit-based system (275 rules, molecules rejected at >100 demerits)

**Common Alerts:**

```python
import medchem as mc

# Create filter
alert_filter = mc.structural.CommonAlertsFilters()

# Check single molecule
mol = dm.to_mol("c1ccccc1")
has_alerts, details = alert_filter.check_mol(mol)

# Batch filtering with parallelization
results = alert_filter(
    mols=mol_list,
    n_jobs=-1,
    progress=True
)
```

**NIBR Filters:**

```python
import medchem as mc

# Apply NIBR filters
nibr_filter = mc.structural.NIBRFilters()
results = nibr_filter(mols=mol_list, n_jobs=-1)
```

**Lilly Demerits:**

```python
import medchem as mc

# Calculate Lilly demerits
lilly = mc.structural.LillyDemeritsFilters()
results = lilly(mols=mol_list, n_jobs=-1)

# Each result includes demerit score and whether it passes (≤100 demerits)
```

### 3. Functional API for High-Level Operations

The `medchem.functional` module provides convenient functions for common workflows.

**Quick Filtering:**

```python
import medchem as mc

# Apply NIBR filters to a list
filter_ok = mc.functional.nibr_filter(
    mols=mol_list,
    n_jobs=-1
)

# Apply common alerts
alert_results = mc.functional.common_alerts_filter(
    mols=mol_list,
    n_jobs=-1
)
```

### 4. Chemical Groups Detection

Identify specific chemical groups and functional groups using `medchem.groups`.

**Available Groups:**
- Hinge binders
- Phosphate binders
- Michael acceptors
- Reactive groups
- Custom SMARTS patterns

**Usage:**

```python
import medchem as mc

# Create group detector
group = mc.groups.ChemicalGroup(groups=["hinge_binders"])

# Check for matches
has_matches = group.has_match(mol_list)

# Get detailed match information
matches = group.get_matches(mol)
```

### 5. Named Catalogs

Access curated collections of chemical structures through `medchem.catalogs`.

**Available Catalogs:**
- Functional groups
- Protecting groups
- Common reagents
- Standard fragments

**Usage:**

```python
import medchem as mc

# Access named catalogs
catalogs = mc.catalogs.NamedCatalogs

# Use catalog for matching
catalog = catalogs.get("functional_groups")
matches = catalog.get_matches(mol)
```

### 6. Molecular Complexity

Calculate complexity metrics that approximate synthetic accessibility using `medchem.complexity`.

**Common Metrics:**
- Bertz complexity
- Whitlock complexity
- Barone complexity

**Usage:**

```python
import medchem as mc

# Calculate complexity
complexity_score = mc.complexity.calculate_complexity(mol)

# Filter by complexity threshold
complex_filter = mc.complexity.ComplexityFilter(max_complexity=500)
results = complex_filter(mols=mol_list)
```

### 7. Constraints Filtering

Apply custom property-based constraints using `medchem.constraints`.

**Example Constraints:**
- Molecular weight ranges
- LogP bounds
- TPSA limits
- Rotatable bond counts

**Usage:**

```python
import medchem as mc

# Define constraints
constraints = mc.constraints.Constraints(
    mw_range=(200, 500),
    logp_range=(-2, 5),
    tpsa_max=140,
    rotatable_bonds_max=10
)

# Apply constraints
results = constraints(mols=mol_list, n_jobs=-1)
```

### 8. Medchem Query Language

Use a specialized query language for complex filtering criteria.

**Query Examples:**
```
# Molecules passing Ro5 AND not having common alerts
"rule_of_five AND NOT common_alerts"

# CNS-like molecules with low complexity
"rule_of_cns AND complexity < 400"

# Leadlike molecules without Lilly demerits
"rule_of_leadlike AND lilly_demerits == 0"
```

**Usage:**

```python
import medchem as mc

# Parse and apply query
query = mc.query.parse("rule_of_five AND NOT common_alerts")
results = query.apply(mols=mol_list, n_jobs=-1)
```

## Workflow Patterns

### Pattern 1: Initial Triage of Compound Library

Filter a large compound collection to identify drug-like candidates.

```python
import datamol as dm
import medchem as mc
import pandas as pd

# Load compound library
df = pd.read_csv("compounds.csv")
mols = [dm.to_mol(smi) for smi in df["smiles"]]

# Apply primary filters
rule_filter = mc.rules.RuleFilters(rule_list=["rule_of_five", "rule_of_veber"])
rule_results = rule_filter(mols=mols, n_jobs=-1, progress=True)

# Apply structural alerts
alert_filter = mc.structural.CommonAlertsFilters()
alert_results = alert_filter(mols=mols, n_jobs=-1, progress=True)

# Combine results
df["passes_rules"] = rule_results["pass"]
df["has_alerts"] = alert_results["has_alerts"]
df["drug_like"] = df["passes_rules"] & ~df["has_alerts"]

# Save filtered compounds
filtered_df = df[df["drug_like"]]
filtered_df.to_csv("filtered_compounds.csv", index=False)
```

### Pattern 2: Lead Optimization Filtering

Apply stricter criteria during lead optimization.

```python
import medchem as mc

# Create comprehensive filter
filters = {
    "rules": mc.rules.RuleFilters(rule_list=["rule_of_leadlike_strict"]),
    "alerts": mc.structural.NIBRFilters(),
    "lilly": mc.structural.LillyDemeritsFilters(),
    "complexity": mc.complexity.ComplexityFilter(max_complexity=400)
}

# Apply all filters
results = {}
for name, filt in filters.items():
    results[name] = filt(mols=candidate_mols, n_jobs=-1)

# Identify compounds passing all filters
passes_all = all(r["pass"] for r in results.values())
```

### Pattern 3: Identify Specific Chemical Groups

Find molecules containing specific functional groups or scaffolds.

```python
import medchem as mc

# Create group detector for multiple groups
group_detector = mc.groups.ChemicalGroup(
    groups=["hinge_binders", "phosphate_binders"]
)

# Screen library
matches = group_detector.get_all_matches(mol_list)

# Filter molecules with desired groups
mol_with_groups = [mol for mol, match in zip(mol_list, matches) if match]
```

## Best Practices

1. **Context Matters**: Don't blindly apply filters. Understand the biological target and chemical space.

2. **Combine Multiple Filters**: Use rules, structural alerts, and domain knowledge together for better decisions.

3. **Use Parallelization**: For large datasets (>1000 molecules), always use `n_jobs=-1` for parallel processing.

4. **Iterative Refinement**: Start with broad filters (Ro5), then apply more specific criteria (CNS, leadlike) as needed.

5. **Document Filtering Decisions**: Track which molecules were filtered out and why for reproducibility.

6. **Validate Results**: Remember that marketed drugs often fail standard filters—use these as guidelines, not absolute rules.

7. **Consider Prodrugs**: Molecules designed as prodrugs may intentionally violate standard medicinal chemistry rules.

## Resources

### references/api_guide.md
Comprehensive API reference covering all medchem modules with detailed function signatures, parameters, and return types.

### references/rules_catalog.md
Complete catalog of available rules, filters, and alerts with descriptions, thresholds, and literature references.

### scripts/filter_molecules.py
Production-ready script for batch filtering workflows. Supports multiple input formats (CSV, SDF, SMILES), configurable filter combinations, and detailed reporting.

**Usage:**
```bash
python scripts/filter_molecules.py input.csv --rules rule_of_five,rule_of_cns --alerts nibr --output filtered.csv
```

## Documentation

Official documentation: https://medchem-docs.datamol.io/
GitHub repository: https://github.com/datamol-io/medchem

