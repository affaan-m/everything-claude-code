---
name: cobrapy
description: Constraint-based metabolic modeling (COBRA). FBA, FVA, gene knockouts, flux sampling, SBML models, for systems biology and metabolic engineering analysis.
license: GPL-2.0 license
metadata:
    skill-author: K-Dense Inc.
---

# COBRApy - Constraint-Based Reconstruction and Analysis

## Overview

COBRApy is a Python library for constraint-based reconstruction and analysis (COBRA) of metabolic models, essential for systems biology research. Work with genome-scale metabolic models, perform computational simulations of cellular metabolism, conduct metabolic engineering analyses, and predict phenotypic behaviors.

## Core Capabilities

COBRApy provides comprehensive tools organized into several key areas:

### 1. Model Management

Load existing models from repositories or files:
```python
from cobra.io import load_model

# Load bundled test models
model = load_model("textbook")  # E. coli core model
model = load_model("ecoli")     # Full E. coli model
model = load_model("salmonella")

# Load from files
from cobra.io import read_sbml_model, load_json_model, load_yaml_model
model = read_sbml_model("path/to/model.xml")
model = load_json_model("path/to/model.json")
model = load_yaml_model("path/to/model.yml")
```

Save models in various formats:
```python
from cobra.io import write_sbml_model, save_json_model, save_yaml_model
write_sbml_model(model, "output.xml")  # Preferred format
save_json_model(model, "output.json")  # For Escher compatibility
save_yaml_model(model, "output.yml")   # Human-readable
```

### 2. Model Structure and Components

Access and inspect model components:
```python
# Access components
model.reactions      # DictList of all reactions
model.metabolites    # DictList of all metabolites
model.genes          # DictList of all genes

# Get specific items by ID or index
reaction = model.reactions.get_by_id("PFK")
metabolite = model.metabolites[0]

# Inspect properties
print(reaction.reaction)        # Stoichiometric equation
print(reaction.bounds)          # Flux constraints
print(reaction.gene_reaction_rule)  # GPR logic
print(metabolite.formula)       # Chemical formula
print(metabolite.compartment)   # Cellular location
```

### 3. Flux Balance Analysis (FBA)

Perform standard FBA simulation:
```python
# Basic optimization
solution = model.optimize()
print(f"Objective value: {solution.objective_value}")
print(f"Status: {solution.status}")

# Access fluxes
print(solution.fluxes["PFK"])
print(solution.fluxes.head())

# Fast optimization (objective value only)
objective_value = model.slim_optimize()

# Change objective
model.objective = "ATPM"
solution = model.optimize()
```

Parsimonious FBA (minimize total flux):
```python
from cobra.flux_analysis import pfba
solution = pfba(model)
```

Geometric FBA (find central solution):
```python
from cobra.flux_analysis import geometric_fba
solution = geometric_fba(model)
```

### 4. Flux Variability Analysis (FVA)

Determine flux ranges for all reactions:
```python
from cobra.flux_analysis import flux_variability_analysis

# Standard FVA
fva_result = flux_variability_analysis(model)

# FVA at 90% optimality
fva_result = flux_variability_analysis(model, fraction_of_optimum=0.9)

# Loopless FVA (eliminates thermodynamically infeasible loops)
fva_result = flux_variability_analysis(model, loopless=True)

# FVA for specific reactions
fva_result = flux_variability_analysis(
    model,
    reaction_list=["PFK", "FBA", "PGI"]
)
```

### 5. Gene and Reaction Deletion Studies

Perform knockout analyses:
```python
from cobra.flux_analysis import (
    single_gene_deletion,
    single_reaction_deletion,
    double_gene_deletion,
    double_reaction_deletion
)

# Single deletions
gene_results = single_gene_deletion(model)
reaction_results = single_reaction_deletion(model)

# Double deletions (uses multiprocessing)
double_gene_results = double_gene_deletion(
    model,
    processes=4  # Number of CPU cores
)

# Manual knockout using context manager
with model:
    model.genes.get_by_id("b0008").knock_out()
    solution = model.optimize()
    print(f"Growth after knockout: {solution.objective_value}")
# Model automatically reverts after context exit
```

### 6. Growth Media and Minimal Media

Manage growth medium:
```python
# View current medium
print(model.medium)

# Modify medium (must reassign entire dict)
medium = model.medium
medium["EX_glc__D_e"] = 10.0  # Set glucose uptake
medium["EX_o2_e"] = 0.0       # Anaerobic conditions
model.medium = medium

# Calculate minimal media
from cobra.medium import minimal_medium

# Minimize total import flux
min_medium = minimal_medium(model, minimize_components=False)

# Minimize number of components (uses MILP, slower)
min_medium = minimal_medium(
    model,
    minimize_components=True,
    open_exchanges=True
)
```

### 7. Flux Sampling

Sample the feasible flux space:
```python
from cobra.sampling import sample

# Sample using OptGP (default, supports parallel processing)
samples = sample(model, n=1000, method="optgp", processes=4)

# Sample using ACHR
samples = sample(model, n=1000, method="achr")

# Validate samples
from cobra.sampling import OptGPSampler
sampler = OptGPSampler(model, processes=4)
sampler.sample(1000)
validation = sampler.validate(sampler.samples)
print(validation.value_counts())  # Should be all 'v' for valid
```

### 8. Production Envelopes

Calculate phenotype phase planes:
```python
from cobra.flux_analysis import production_envelope

# Standard production envelope
envelope = production_envelope(
    model,
    reactions=["EX_glc__D_e", "EX_o2_e"],
    objective="EX_ac_e"  # Acetate production
)

# With carbon yield
envelope = production_envelope(
    model,
    reactions=["EX_glc__D_e", "EX_o2_e"],
    carbon_sources="EX_glc__D_e"
)

# Visualize (use matplotlib or pandas plotting)
import matplotlib.pyplot as plt
envelope.plot(x="EX_glc__D_e", y="EX_o2_e", kind="scatter")
plt.show()
```

### 9. Gapfilling

Add reactions to make models feasible:
```python
from cobra.flux_analysis import gapfill

# Prepare universal model with candidate reactions
universal = load_model("universal")

# Perform gapfilling
with model:
    # Remove reactions to create gaps for demonstration
    model.remove_reactions([model.reactions.PGI])

    # Find reactions needed
    solution = gapfill(model, universal)
    print(f"Reactions to add: {solution}")
```

### 10. Model Building

Build models from scratch:
```python
from cobra import Model, Reaction, Metabolite

# Create model
model = Model("my_model")

# Create metabolites
atp_c = Metabolite("atp_c", formula="C10H12N5O13P3",
                   name="ATP", compartment="c")
adp_c = Metabolite("adp_c", formula="C10H12N5O10P2",
                   name="ADP", compartment="c")
pi_c = Metabolite("pi_c", formula="HO4P",
                  name="Phosphate", compartment="c")

# Create reaction
reaction = Reaction("ATPASE")
reaction.name = "ATP hydrolysis"
reaction.subsystem = "Energy"
reaction.lower_bound = 0.0
reaction.upper_bound = 1000.0

# Add metabolites with stoichiometry
reaction.add_metabolites({
    atp_c: -1.0,
    adp_c: 1.0,
    pi_c: 1.0
})

# Add gene-reaction rule
reaction.gene_reaction_rule = "(gene1 and gene2) or gene3"

# Add to model
model.add_reactions([reaction])

# Add boundary reactions
model.add_boundary(atp_c, type="exchange")
model.add_boundary(adp_c, type="demand")

# Set objective
model.objective = "ATPASE"
```

## Common Workflows

### Workflow 1: Load Model and Predict Growth

```python
from cobra.io import load_model

# Load model
model = load_model("ecoli")

# Run FBA
solution = model.optimize()
print(f"Growth rate: {solution.objective_value:.3f} /h")

# Show active pathways
print(solution.fluxes[solution.fluxes.abs() > 1e-6])
```

### Workflow 2: Gene Knockout Screen

```python
from cobra.io import load_model
from cobra.flux_analysis import single_gene_deletion

# Load model
model = load_model("ecoli")

# Perform single gene deletions
results = single_gene_deletion(model)

# Find essential genes (growth < threshold)
essential_genes = results[results["growth"] < 0.01]
print(f"Found {len(essential_genes)} essential genes")

# Find genes with minimal impact
neutral_genes = results[results["growth"] > 0.9 * solution.objective_value]
```

### Workflow 3: Media Optimization

```python
from cobra.io import load_model
from cobra.medium import minimal_medium

# Load model
model = load_model("ecoli")

# Calculate minimal medium for 50% of max growth
target_growth = model.slim_optimize() * 0.5
min_medium = minimal_medium(
    model,
    target_growth,
    minimize_components=True
)

print(f"Minimal medium components: {len(min_medium)}")
print(min_medium)
```

### Workflow 4: Flux Uncertainty Analysis

```python
from cobra.io import load_model
from cobra.flux_analysis import flux_variability_analysis
from cobra.sampling import sample

# Load model
model = load_model("ecoli")

# First check flux ranges at optimality
fva = flux_variability_analysis(model, fraction_of_optimum=1.0)

# For reactions with large ranges, sample to understand distribution
samples = sample(model, n=1000)

# Analyze specific reaction
reaction_id = "PFK"
import matplotlib.pyplot as plt
samples[reaction_id].hist(bins=50)
plt.xlabel(f"Flux through {reaction_id}")
plt.ylabel("Frequency")
plt.show()
```

### Workflow 5: Context Manager for Temporary Changes

Use context managers to make temporary modifications:
```python
# Model remains unchanged outside context
with model:
    # Temporarily change objective
    model.objective = "ATPM"

    # Temporarily modify bounds
    model.reactions.EX_glc__D_e.lower_bound = -5.0

    # Temporarily knock out genes
    model.genes.b0008.knock_out()

    # Optimize with changes
    solution = model.optimize()
    print(f"Modified growth: {solution.objective_value}")

# All changes automatically reverted
solution = model.optimize()
print(f"Original growth: {solution.objective_value}")
```

## Key Concepts

### DictList Objects
Models use `DictList` objects for reactions, metabolites, and genes - behaving like both lists and dictionaries:
```python
# Access by index
first_reaction = model.reactions[0]

# Access by ID
pfk = model.reactions.get_by_id("PFK")

# Query methods
atp_reactions = model.reactions.query("atp")
```

### Flux Constraints
Reaction bounds define feasible flux ranges:
- **Irreversible**: `lower_bound = 0, upper_bound > 0`
- **Reversible**: `lower_bound < 0, upper_bound > 0`
- Set both bounds simultaneously with `.bounds` to avoid inconsistencies

### Gene-Reaction Rules (GPR)
Boolean logic linking genes to reactions:
```python
# AND logic (both required)
reaction.gene_reaction_rule = "gene1 and gene2"

# OR logic (either sufficient)
reaction.gene_reaction_rule = "gene1 or gene2"

# Complex logic
reaction.gene_reaction_rule = "(gene1 and gene2) or (gene3 and gene4)"
```

### Exchange Reactions
Special reactions representing metabolite import/export:
- Named with prefix `EX_` by convention
- Positive flux = secretion, negative flux = uptake
- Managed through `model.medium` dictionary

## Best Practices

1. **Use context managers** for temporary modifications to avoid state management issues
2. **Validate models** before analysis using `model.slim_optimize()` to ensure feasibility
3. **Check solution status** after optimization - `optimal` indicates successful solve
4. **Use loopless FVA** when thermodynamic feasibility matters
5. **Set fraction_of_optimum** appropriately in FVA to explore suboptimal space
6. **Parallelize** computationally expensive operations (sampling, double deletions)
7. **Prefer SBML format** for model exchange and long-term storage
8. **Use slim_optimize()** when only objective value needed for performance
9. **Validate flux samples** to ensure numerical stability

## Troubleshooting

**Infeasible solutions**: Check medium constraints, reaction bounds, and model consistency
**Slow optimization**: Try different solvers (GLPK, CPLEX, Gurobi) via `model.solver`
**Unbounded solutions**: Verify exchange reactions have appropriate upper bounds
**Import errors**: Ensure correct file format and valid SBML identifiers

## References

For detailed workflows and API patterns, refer to:
- `references/workflows.md` - Comprehensive step-by-step workflow examples
- `references/api_quick_reference.md` - Common function signatures and patterns

Official documentation: https://cobrapy.readthedocs.io/en/latest/

