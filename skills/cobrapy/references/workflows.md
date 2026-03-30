# COBRApy Comprehensive Workflows

This document provides detailed step-by-step workflows for common COBRApy tasks in metabolic modeling.

## Workflow 1: Complete Knockout Study with Visualization

This workflow demonstrates how to perform a comprehensive gene knockout study and visualize the results.

```python
import pandas as pd
import matplotlib.pyplot as plt
from cobra.io import load_model
from cobra.flux_analysis import single_gene_deletion, double_gene_deletion

# Step 1: Load model
model = load_model("ecoli")
print(f"Loaded model: {model.id}")
print(f"Model contains {len(model.reactions)} reactions, {len(model.metabolites)} metabolites, {len(model.genes)} genes")

# Step 2: Get baseline growth rate
baseline = model.slim_optimize()
print(f"Baseline growth rate: {baseline:.3f} /h")

# Step 3: Perform single gene deletions
print("Performing single gene deletions...")
single_results = single_gene_deletion(model)

# Step 4: Classify genes by impact
essential_genes = single_results[single_results["growth"] < 0.01]
severely_impaired = single_results[(single_results["growth"] >= 0.01) &
                                   (single_results["growth"] < 0.5 * baseline)]
moderately_impaired = single_results[(single_results["growth"] >= 0.5 * baseline) &
                                     (single_results["growth"] < 0.9 * baseline)]
neutral_genes = single_results[single_results["growth"] >= 0.9 * baseline]

print(f"\nSingle Deletion Results:")
print(f"  Essential genes: {len(essential_genes)}")
print(f"  Severely impaired: {len(severely_impaired)}")
print(f"  Moderately impaired: {len(moderately_impaired)}")
print(f"  Neutral genes: {len(neutral_genes)}")

# Step 5: Visualize distribution
fig, ax = plt.subplots(figsize=(10, 6))
single_results["growth"].hist(bins=50, ax=ax)
ax.axvline(baseline, color='r', linestyle='--', label='Baseline')
ax.set_xlabel("Growth rate (/h)")
ax.set_ylabel("Number of genes")
ax.set_title("Distribution of Growth Rates After Single Gene Deletions")
ax.legend()
plt.tight_layout()
plt.savefig("single_deletion_distribution.png", dpi=300)

# Step 6: Identify gene pairs for double deletions
# Focus on non-essential genes to find synthetic lethals
target_genes = single_results[single_results["growth"] >= 0.5 * baseline].index.tolist()
target_genes = [list(gene)[0] for gene in target_genes[:50]]  # Limit for performance

print(f"\nPerforming double deletions on {len(target_genes)} genes...")
double_results = double_gene_deletion(
    model,
    gene_list1=target_genes,
    processes=4
)

# Step 7: Find synthetic lethal pairs
synthetic_lethals = double_results[
    (double_results["growth"] < 0.01) &
    (single_results.loc[double_results.index.get_level_values(0)]["growth"].values >= 0.5 * baseline) &
    (single_results.loc[double_results.index.get_level_values(1)]["growth"].values >= 0.5 * baseline)
]

print(f"Found {len(synthetic_lethals)} synthetic lethal gene pairs")
print("\nTop 10 synthetic lethal pairs:")
print(synthetic_lethals.head(10))

# Step 8: Export results
single_results.to_csv("single_gene_deletions.csv")
double_results.to_csv("double_gene_deletions.csv")
synthetic_lethals.to_csv("synthetic_lethals.csv")
```

## Workflow 2: Media Design and Optimization

This workflow shows how to systematically design growth media and find minimal media compositions.

```python
from cobra.io import load_model
from cobra.medium import minimal_medium
import pandas as pd

# Step 1: Load model and check current medium
model = load_model("ecoli")
current_medium = model.medium
print("Current medium composition:")
for exchange, bound in current_medium.items():
    metabolite_id = exchange.replace("EX_", "").replace("_e", "")
    print(f"  {metabolite_id}: {bound:.2f} mmol/gDW/h")

# Step 2: Get baseline growth
baseline_growth = model.slim_optimize()
print(f"\nBaseline growth rate: {baseline_growth:.3f} /h")

# Step 3: Calculate minimal medium for different growth targets
growth_targets = [0.25, 0.5, 0.75, 1.0]
minimal_media = {}

for fraction in growth_targets:
    target_growth = baseline_growth * fraction
    print(f"\nCalculating minimal medium for {fraction*100:.0f}% growth ({target_growth:.3f} /h)...")

    min_medium = minimal_medium(
        model,
        target_growth,
        minimize_components=True,
        open_exchanges=True
    )

    minimal_media[fraction] = min_medium
    print(f"  Required components: {len(min_medium)}")
    print(f"  Components: {list(min_medium.index)}")

# Step 4: Compare media compositions
media_df = pd.DataFrame(minimal_media).fillna(0)
media_df.to_csv("minimal_media_comparison.csv")

# Step 5: Test aerobic vs anaerobic conditions
print("\n--- Aerobic vs Anaerobic Comparison ---")

# Aerobic
model_aerobic = model.copy()
aerobic_growth = model_aerobic.slim_optimize()
aerobic_medium = minimal_medium(model_aerobic, aerobic_growth * 0.9, minimize_components=True)

# Anaerobic
model_anaerobic = model.copy()
medium_anaerobic = model_anaerobic.medium
medium_anaerobic["EX_o2_e"] = 0.0
model_anaerobic.medium = medium_anaerobic
anaerobic_growth = model_anaerobic.slim_optimize()
anaerobic_medium = minimal_medium(model_anaerobic, anaerobic_growth * 0.9, minimize_components=True)

print(f"Aerobic growth: {aerobic_growth:.3f} /h (requires {len(aerobic_medium)} components)")
print(f"Anaerobic growth: {anaerobic_growth:.3f} /h (requires {len(anaerobic_medium)} components)")

# Step 6: Identify unique requirements
aerobic_only = set(aerobic_medium.index) - set(anaerobic_medium.index)
anaerobic_only = set(anaerobic_medium.index) - set(aerobic_medium.index)
shared = set(aerobic_medium.index) & set(anaerobic_medium.index)

print(f"\nShared components: {len(shared)}")
print(f"Aerobic-only: {aerobic_only}")
print(f"Anaerobic-only: {anaerobic_only}")

# Step 7: Test custom medium
print("\n--- Testing Custom Medium ---")
custom_medium = {
    "EX_glc__D_e": 10.0,  # Glucose
    "EX_o2_e": 20.0,       # Oxygen
    "EX_nh4_e": 5.0,       # Ammonium
    "EX_pi_e": 5.0,        # Phosphate
    "EX_so4_e": 1.0,       # Sulfate
}

with model:
    model.medium = custom_medium
    custom_growth = model.optimize().objective_value
    print(f"Growth on custom medium: {custom_growth:.3f} /h")

    # Check which nutrients are limiting
    for exchange in custom_medium:
        with model:
            # Double the uptake rate
            medium_test = model.medium
            medium_test[exchange] *= 2
            model.medium = medium_test
            test_growth = model.optimize().objective_value
            improvement = (test_growth - custom_growth) / custom_growth * 100
            if improvement > 1:
                print(f"  {exchange}: +{improvement:.1f}% growth when doubled (LIMITING)")
```

## Workflow 3: Flux Space Exploration with Sampling

This workflow demonstrates comprehensive flux space analysis using FVA and sampling.

```python
from cobra.io import load_model
from cobra.flux_analysis import flux_variability_analysis
from cobra.sampling import sample
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Step 1: Load model
model = load_model("ecoli")
baseline = model.slim_optimize()
print(f"Baseline growth: {baseline:.3f} /h")

# Step 2: Perform FVA at optimal growth
print("\nPerforming FVA at optimal growth...")
fva_optimal = flux_variability_analysis(model, fraction_of_optimum=1.0)

# Step 3: Identify reactions with flexibility
fva_optimal["range"] = fva_optimal["maximum"] - fva_optimal["minimum"]
fva_optimal["relative_range"] = fva_optimal["range"] / (fva_optimal["maximum"].abs() + 1e-9)

flexible_reactions = fva_optimal[fva_optimal["range"] > 1.0].sort_values("range", ascending=False)
print(f"\nFound {len(flexible_reactions)} reactions with >1.0 mmol/gDW/h flexibility")
print("\nTop 10 most flexible reactions:")
print(flexible_reactions.head(10)[["minimum", "maximum", "range"]])

# Step 4: Perform FVA at suboptimal growth (90%)
print("\nPerforming FVA at 90% optimal growth...")
fva_suboptimal = flux_variability_analysis(model, fraction_of_optimum=0.9)
fva_suboptimal["range"] = fva_suboptimal["maximum"] - fva_suboptimal["minimum"]

# Step 5: Compare flexibility at different optimality levels
comparison = pd.DataFrame({
    "range_100": fva_optimal["range"],
    "range_90": fva_suboptimal["range"]
})
comparison["range_increase"] = comparison["range_90"] - comparison["range_100"]

print("\nReactions with largest increase in flexibility at suboptimality:")
print(comparison.sort_values("range_increase", ascending=False).head(10))

# Step 6: Perform flux sampling
print("\nPerforming flux sampling (1000 samples)...")
samples = sample(model, n=1000, method="optgp", processes=4)

# Step 7: Analyze sampling results for key reactions
key_reactions = ["PFK", "FBA", "TPI", "GAPD", "PGK", "PGM", "ENO", "PYK"]
available_key_reactions = [r for r in key_reactions if r in samples.columns]

if available_key_reactions:
    fig, axes = plt.subplots(2, 4, figsize=(16, 8))
    axes = axes.flatten()

    for idx, reaction_id in enumerate(available_key_reactions[:8]):
        ax = axes[idx]
        samples[reaction_id].hist(bins=30, ax=ax, alpha=0.7)

        # Overlay FVA bounds
        fva_min = fva_optimal.loc[reaction_id, "minimum"]
        fva_max = fva_optimal.loc[reaction_id, "maximum"]
        ax.axvline(fva_min, color='r', linestyle='--', label='FVA min')
        ax.axvline(fva_max, color='r', linestyle='--', label='FVA max')

        ax.set_xlabel("Flux (mmol/gDW/h)")
        ax.set_ylabel("Frequency")
        ax.set_title(reaction_id)
        if idx == 0:
            ax.legend()

    plt.tight_layout()
    plt.savefig("flux_distributions.png", dpi=300)

# Step 8: Calculate correlation between reactions
print("\nCalculating flux correlations...")
correlation_matrix = samples[available_key_reactions].corr()

fig, ax = plt.subplots(figsize=(10, 8))
sns.heatmap(correlation_matrix, annot=True, fmt=".2f", cmap="coolwarm",
            center=0, ax=ax, square=True)
ax.set_title("Flux Correlations Between Key Glycolysis Reactions")
plt.tight_layout()
plt.savefig("flux_correlations.png", dpi=300)

# Step 9: Identify reaction modules (highly correlated groups)
print("\nHighly correlated reaction pairs (|r| > 0.9):")
for i in range(len(correlation_matrix)):
    for j in range(i+1, len(correlation_matrix)):
        corr = correlation_matrix.iloc[i, j]
        if abs(corr) > 0.9:
            print(f"  {correlation_matrix.index[i]} <-> {correlation_matrix.columns[j]}: {corr:.3f}")

# Step 10: Export all results
fva_optimal.to_csv("fva_optimal.csv")
fva_suboptimal.to_csv("fva_suboptimal.csv")
samples.to_csv("flux_samples.csv")
correlation_matrix.to_csv("flux_correlations.csv")
```

## Workflow 4: Production Strain Design

This workflow demonstrates how to design a production strain for a target metabolite.

```python
from cobra.io import load_model
from cobra.flux_analysis import (
    production_envelope,
    flux_variability_analysis,
    single_gene_deletion
)
import pandas as pd
import matplotlib.pyplot as plt

# Step 1: Define production target
TARGET_METABOLITE = "EX_ac_e"  # Acetate production
CARBON_SOURCE = "EX_glc__D_e"  # Glucose uptake

# Step 2: Load model
model = load_model("ecoli")
print(f"Designing strain for {TARGET_METABOLITE} production")

# Step 3: Calculate baseline production envelope
print("\nCalculating production envelope...")
envelope = production_envelope(
    model,
    reactions=[CARBON_SOURCE, TARGET_METABOLITE],
    carbon_sources=CARBON_SOURCE
)

# Visualize production envelope
fig, ax = plt.subplots(figsize=(10, 6))
ax.plot(envelope[CARBON_SOURCE], envelope["mass_yield_maximum"], 'b-', label='Max yield')
ax.plot(envelope[CARBON_SOURCE], envelope["mass_yield_minimum"], 'r-', label='Min yield')
ax.set_xlabel(f"Glucose uptake (mmol/gDW/h)")
ax.set_ylabel(f"Acetate yield")
ax.set_title("Wild-type Production Envelope")
ax.legend()
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig("production_envelope_wildtype.png", dpi=300)

# Step 4: Maximize production while maintaining growth
print("\nOptimizing for production...")

# Set minimum growth constraint
MIN_GROWTH = 0.1  # Maintain at least 10% of max growth

with model:
    # Change objective to product formation
    model.objective = TARGET_METABOLITE
    model.objective_direction = "max"

    # Add growth constraint
    growth_reaction = model.reactions.get_by_id(model.objective.name) if hasattr(model.objective, 'name') else list(model.objective.variables.keys())[0].name
    max_growth = model.slim_optimize()

model.reactions.BIOMASS_Ecoli_core_w_GAM.lower_bound = MIN_GROWTH

with model:
    model.objective = TARGET_METABOLITE
    model.objective_direction = "max"
    production_solution = model.optimize()

    max_production = production_solution.objective_value
    print(f"Maximum production: {max_production:.3f} mmol/gDW/h")
    print(f"Growth rate: {production_solution.fluxes['BIOMASS_Ecoli_core_w_GAM']:.3f} /h")

# Step 5: Identify beneficial gene knockouts
print("\nScreening for beneficial knockouts...")

# Reset model
model.reactions.BIOMASS_Ecoli_core_w_GAM.lower_bound = MIN_GROWTH
model.objective = TARGET_METABOLITE
model.objective_direction = "max"

knockout_results = []
for gene in model.genes:
    with model:
        gene.knock_out()
        try:
            solution = model.optimize()
            if solution.status == "optimal":
                production = solution.objective_value
                growth = solution.fluxes["BIOMASS_Ecoli_core_w_GAM"]

                if production > max_production * 1.05:  # >5% improvement
                    knockout_results.append({
                        "gene": gene.id,
                        "production": production,
                        "growth": growth,
                        "improvement": (production / max_production - 1) * 100
                    })
        except:
            continue

knockout_df = pd.DataFrame(knockout_results)
if len(knockout_df) > 0:
    knockout_df = knockout_df.sort_values("improvement", ascending=False)
    print(f"\nFound {len(knockout_df)} beneficial knockouts:")
    print(knockout_df.head(10))
    knockout_df.to_csv("beneficial_knockouts.csv", index=False)
else:
    print("No beneficial single knockouts found")

# Step 6: Test combination of best knockouts
if len(knockout_df) > 0:
    print("\nTesting knockout combinations...")
    top_genes = knockout_df.head(3)["gene"].tolist()

    with model:
        for gene_id in top_genes:
            model.genes.get_by_id(gene_id).knock_out()

        solution = model.optimize()
        if solution.status == "optimal":
            combined_production = solution.objective_value
            combined_growth = solution.fluxes["BIOMASS_Ecoli_core_w_GAM"]
            combined_improvement = (combined_production / max_production - 1) * 100

            print(f"\nCombined knockout results:")
            print(f"  Genes: {', '.join(top_genes)}")
            print(f"  Production: {combined_production:.3f} mmol/gDW/h")
            print(f"  Growth: {combined_growth:.3f} /h")
            print(f"  Improvement: {combined_improvement:.1f}%")

# Step 7: Analyze flux distribution in production strain
if len(knockout_df) > 0:
    best_gene = knockout_df.iloc[0]["gene"]

    with model:
        model.genes.get_by_id(best_gene).knock_out()
        solution = model.optimize()

        # Get active pathways
        active_fluxes = solution.fluxes[solution.fluxes.abs() > 0.1]
        active_fluxes.to_csv(f"production_strain_fluxes_{best_gene}_knockout.csv")

        print(f"\nActive reactions in production strain: {len(active_fluxes)}")
```

## Workflow 5: Model Validation and Debugging

This workflow shows systematic approaches to validate and debug metabolic models.

```python
from cobra.io import load_model, read_sbml_model
from cobra.flux_analysis import flux_variability_analysis
import pandas as pd

# Step 1: Load model
model = load_model("ecoli")  # Or read_sbml_model("your_model.xml")
print(f"Model: {model.id}")
print(f"Reactions: {len(model.reactions)}")
print(f"Metabolites: {len(model.metabolites)}")
print(f"Genes: {len(model.genes)}")

# Step 2: Check model feasibility
print("\n--- Feasibility Check ---")
try:
    objective_value = model.slim_optimize()
    print(f"Model is feasible (objective: {objective_value:.3f})")
except:
    print("Model is INFEASIBLE")
    print("Troubleshooting steps:")

    # Check for blocked reactions
    from cobra.flux_analysis import find_blocked_reactions
    blocked = find_blocked_reactions(model)
    print(f"  Blocked reactions: {len(blocked)}")
    if len(blocked) > 0:
        print(f"  First 10 blocked: {list(blocked)[:10]}")

    # Check medium
    print(f"\n  Current medium: {model.medium}")

    # Try opening all exchanges
    for reaction in model.exchanges:
        reaction.lower_bound = -1000

    try:
        objective_value = model.slim_optimize()
        print(f"\n  Model feasible with open exchanges (objective: {objective_value:.3f})")
        print("  Issue: Medium constraints too restrictive")
    except:
        print("\n  Model still infeasible with open exchanges")
        print("  Issue: Structural problem (missing reactions, mass imbalance, etc.)")

# Step 3: Check mass and charge balance
print("\n--- Mass and Charge Balance Check ---")
unbalanced_reactions = []
for reaction in model.reactions:
    try:
        balance = reaction.check_mass_balance()
        if balance:
            unbalanced_reactions.append({
                "reaction": reaction.id,
                "imbalance": balance
            })
    except:
        pass

if unbalanced_reactions:
    print(f"Found {len(unbalanced_reactions)} unbalanced reactions:")
    for item in unbalanced_reactions[:10]:
        print(f"  {item['reaction']}: {item['imbalance']}")
else:
    print("All reactions are mass balanced")

# Step 4: Identify dead-end metabolites
print("\n--- Dead-end Metabolite Check ---")
dead_end_metabolites = []
for metabolite in model.metabolites:
    producing_reactions = [r for r in metabolite.reactions
                          if r.metabolites[metabolite] > 0]
    consuming_reactions = [r for r in metabolite.reactions
                          if r.metabolites[metabolite] < 0]

    if len(producing_reactions) == 0 or len(consuming_reactions) == 0:
        dead_end_metabolites.append({
            "metabolite": metabolite.id,
            "producers": len(producing_reactions),
            "consumers": len(consuming_reactions)
        })

if dead_end_metabolites:
    print(f"Found {len(dead_end_metabolites)} dead-end metabolites:")
    for item in dead_end_metabolites[:10]:
        print(f"  {item['metabolite']}: {item['producers']} producers, {item['consumers']} consumers")
else:
    print("No dead-end metabolites found")

# Step 5: Check for duplicate reactions
print("\n--- Duplicate Reaction Check ---")
reaction_equations = {}
duplicates = []

for reaction in model.reactions:
    equation = reaction.build_reaction_string()
    if equation in reaction_equations:
        duplicates.append({
            "reaction1": reaction_equations[equation],
            "reaction2": reaction.id,
            "equation": equation
        })
    else:
        reaction_equations[equation] = reaction.id

if duplicates:
    print(f"Found {len(duplicates)} duplicate reaction pairs:")
    for item in duplicates[:10]:
        print(f"  {item['reaction1']} == {item['reaction2']}")
else:
    print("No duplicate reactions found")

# Step 6: Identify orphan genes
print("\n--- Orphan Gene Check ---")
orphan_genes = [gene for gene in model.genes if len(gene.reactions) == 0]

if orphan_genes:
    print(f"Found {len(orphan_genes)} orphan genes (not associated with reactions):")
    print(f"  First 10: {[g.id for g in orphan_genes[:10]]}")
else:
    print("No orphan genes found")

# Step 7: Check for thermodynamically infeasible loops
print("\n--- Thermodynamic Loop Check ---")
fva_loopless = flux_variability_analysis(model, loopless=True)
fva_standard = flux_variability_analysis(model)

loop_reactions = []
for reaction_id in fva_standard.index:
    standard_range = fva_standard.loc[reaction_id, "maximum"] - fva_standard.loc[reaction_id, "minimum"]
    loopless_range = fva_loopless.loc[reaction_id, "maximum"] - fva_loopless.loc[reaction_id, "minimum"]

    if standard_range > loopless_range + 0.1:
        loop_reactions.append({
            "reaction": reaction_id,
            "standard_range": standard_range,
            "loopless_range": loopless_range
        })

if loop_reactions:
    print(f"Found {len(loop_reactions)} reactions potentially involved in loops:")
    loop_df = pd.DataFrame(loop_reactions).sort_values("standard_range", ascending=False)
    print(loop_df.head(10))
else:
    print("No thermodynamically infeasible loops detected")

# Step 8: Generate validation report
print("\n--- Generating Validation Report ---")
validation_report = {
    "model_id": model.id,
    "feasible": objective_value if 'objective_value' in locals() else None,
    "n_reactions": len(model.reactions),
    "n_metabolites": len(model.metabolites),
    "n_genes": len(model.genes),
    "n_unbalanced": len(unbalanced_reactions),
    "n_dead_ends": len(dead_end_metabolites),
    "n_duplicates": len(duplicates),
    "n_orphan_genes": len(orphan_genes),
    "n_loop_reactions": len(loop_reactions)
}

validation_df = pd.DataFrame([validation_report])
validation_df.to_csv("model_validation_report.csv", index=False)
print("Validation report saved to model_validation_report.csv")
```

These workflows provide comprehensive templates for common COBRApy tasks. Adapt them as needed for specific research questions and models.
