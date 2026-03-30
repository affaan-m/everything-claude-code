"""
Multi-objective optimization example using pymoo.

This script demonstrates multi-objective optimization using
NSGA-II on the ZDT1 benchmark problem.
"""

from pymoo.algorithms.moo.nsga2 import NSGA2
from pymoo.problems import get_problem
from pymoo.optimize import minimize
from pymoo.visualization.scatter import Scatter
import matplotlib.pyplot as plt


def run_multi_objective_optimization():
    """Run multi-objective optimization example."""

    # Define the problem - ZDT1 (bi-objective)
    problem = get_problem("zdt1")

    # Configure NSGA-II algorithm
    algorithm = NSGA2(
        pop_size=100,
        eliminate_duplicates=True
    )

    # Run optimization
    result = minimize(
        problem,
        algorithm,
        ('n_gen', 200),
        seed=1,
        verbose=True
    )

    # Print results summary
    print("\n" + "="*60)
    print("MULTI-OBJECTIVE OPTIMIZATION RESULTS")
    print("="*60)
    print(f"Number of solutions in Pareto front: {len(result.F)}")
    print(f"Number of generations: {result.algorithm.n_gen}")
    print(f"Number of function evaluations: {result.algorithm.evaluator.n_eval}")
    print("\nFirst 5 solutions (decision variables):")
    print(result.X[:5])
    print("\nFirst 5 solutions (objective values):")
    print(result.F[:5])
    print("="*60)

    # Visualize results
    plot = Scatter(title="ZDT1 - NSGA-II Results")
    plot.add(result.F, color="red", alpha=0.7, s=30, label="Obtained Pareto Front")

    # Add true Pareto front for comparison
    pf = problem.pareto_front()
    plot.add(pf, color="black", alpha=0.3, label="True Pareto Front")

    plot.show()

    return result


if __name__ == "__main__":
    result = run_multi_objective_optimization()
