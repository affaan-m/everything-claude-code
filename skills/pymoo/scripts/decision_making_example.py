"""
Multi-criteria decision making example using pymoo.

This script demonstrates how to select preferred solutions from
a Pareto front using various MCDM methods.
"""

from pymoo.algorithms.moo.nsga2 import NSGA2
from pymoo.problems import get_problem
from pymoo.optimize import minimize
from pymoo.mcdm.pseudo_weights import PseudoWeights
from pymoo.visualization.scatter import Scatter
from pymoo.visualization.petal import Petal
import numpy as np


def run_optimization_for_decision_making():
    """Run optimization to obtain Pareto front."""

    print("Running optimization to obtain Pareto front...")

    # Solve ZDT1 problem
    problem = get_problem("zdt1")
    algorithm = NSGA2(pop_size=100)

    result = minimize(
        problem,
        algorithm,
        ('n_gen', 200),
        seed=1,
        verbose=False
    )

    print(f"Obtained {len(result.F)} solutions in Pareto front\n")

    return problem, result


def apply_pseudo_weights(result, weights):
    """Apply pseudo-weights MCDM method."""

    print(f"Applying Pseudo-Weights with weights: {weights}")

    # Normalize objectives to [0, 1]
    F_norm = (result.F - result.F.min(axis=0)) / (result.F.max(axis=0) - result.F.min(axis=0))

    # Apply MCDM
    dm = PseudoWeights(weights)
    selected_idx = dm.do(F_norm)

    selected_x = result.X[selected_idx]
    selected_f = result.F[selected_idx]

    print(f"Selected solution (decision variables): {selected_x}")
    print(f"Selected solution (objectives): {selected_f}")
    print()

    return selected_idx, selected_x, selected_f


def compare_different_preferences(result):
    """Compare selections with different preference weights."""

    print("="*60)
    print("COMPARING DIFFERENT PREFERENCE WEIGHTS")
    print("="*60 + "\n")

    # Define different preference scenarios
    scenarios = [
        ("Equal preference", np.array([0.5, 0.5])),
        ("Prefer f1", np.array([0.8, 0.2])),
        ("Prefer f2", np.array([0.2, 0.8])),
    ]

    selections = {}

    for name, weights in scenarios:
        print(f"Scenario: {name}")
        idx, x, f = apply_pseudo_weights(result, weights)
        selections[name] = (idx, f)

    # Visualize all selections
    plot = Scatter(title="Decision Making - Different Preferences")
    plot.add(result.F, color="lightgray", alpha=0.5, s=20, label="Pareto Front")

    colors = ["red", "blue", "green"]
    for (name, (idx, f)), color in zip(selections.items(), colors):
        plot.add(f, color=color, s=100, marker="*", label=name)

    plot.show()

    return selections


def visualize_selected_solutions(result, selections):
    """Visualize selected solutions using petal diagram."""

    # Get objective bounds for normalization
    f_min = result.F.min(axis=0)
    f_max = result.F.max(axis=0)

    plot = Petal(
        title="Selected Solutions Comparison",
        bounds=[f_min, f_max],
        labels=["f1", "f2"]
    )

    colors = ["red", "blue", "green"]
    for (name, (idx, f)), color in zip(selections.items(), colors):
        plot.add(f, color=color, label=name)

    plot.show()


def find_extreme_solutions(result):
    """Find extreme solutions (best in each objective)."""

    print("\n" + "="*60)
    print("EXTREME SOLUTIONS")
    print("="*60 + "\n")

    # Best f1 (minimize f1)
    best_f1_idx = np.argmin(result.F[:, 0])
    print(f"Best f1 solution: {result.F[best_f1_idx]}")
    print(f"  Decision variables: {result.X[best_f1_idx]}\n")

    # Best f2 (minimize f2)
    best_f2_idx = np.argmin(result.F[:, 1])
    print(f"Best f2 solution: {result.F[best_f2_idx]}")
    print(f"  Decision variables: {result.X[best_f2_idx]}\n")

    return best_f1_idx, best_f2_idx


def main():
    """Main execution function."""

    # Step 1: Run optimization
    problem, result = run_optimization_for_decision_making()

    # Step 2: Find extreme solutions
    best_f1_idx, best_f2_idx = find_extreme_solutions(result)

    # Step 3: Compare different preference weights
    selections = compare_different_preferences(result)

    # Step 4: Visualize selections with petal diagram
    visualize_selected_solutions(result, selections)

    print("="*60)
    print("DECISION MAKING EXAMPLE COMPLETED")
    print("="*60)
    print("\nKey Takeaways:")
    print("1. Different weights lead to different selected solutions")
    print("2. Higher weight on an objective selects solutions better in that objective")
    print("3. Visualization helps understand trade-offs")
    print("4. MCDM methods help formalize decision maker preferences")


if __name__ == "__main__":
    main()
