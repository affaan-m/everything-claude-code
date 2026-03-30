"""
Many-objective optimization example using pymoo.

This script demonstrates many-objective optimization (4+ objectives)
using NSGA-III on the DTLZ2 benchmark problem.
"""

from pymoo.algorithms.moo.nsga3 import NSGA3
from pymoo.problems import get_problem
from pymoo.optimize import minimize
from pymoo.util.ref_dirs import get_reference_directions
from pymoo.visualization.pcp import PCP
import numpy as np


def run_many_objective_optimization():
    """Run many-objective optimization example."""

    # Define the problem - DTLZ2 with 5 objectives
    n_obj = 5
    problem = get_problem("dtlz2", n_obj=n_obj)

    # Generate reference directions for NSGA-III
    # Das-Dennis method for uniform distribution
    ref_dirs = get_reference_directions("das-dennis", n_obj, n_partitions=12)

    print(f"Number of reference directions: {len(ref_dirs)}")

    # Configure NSGA-III algorithm
    algorithm = NSGA3(
        ref_dirs=ref_dirs,
        eliminate_duplicates=True
    )

    # Run optimization
    result = minimize(
        problem,
        algorithm,
        ('n_gen', 300),
        seed=1,
        verbose=True
    )

    # Print results summary
    print("\n" + "="*60)
    print("MANY-OBJECTIVE OPTIMIZATION RESULTS")
    print("="*60)
    print(f"Number of objectives: {n_obj}")
    print(f"Number of solutions: {len(result.F)}")
    print(f"Number of generations: {result.algorithm.n_gen}")
    print(f"Number of function evaluations: {result.algorithm.evaluator.n_eval}")

    # Show objective space statistics
    print("\nObjective space statistics:")
    print(f"Minimum values per objective: {result.F.min(axis=0)}")
    print(f"Maximum values per objective: {result.F.max(axis=0)}")
    print("="*60)

    # Visualize using Parallel Coordinate Plot
    plot = PCP(
        title=f"DTLZ2 ({n_obj} objectives) - NSGA-III Results",
        labels=[f"f{i+1}" for i in range(n_obj)],
        normalize_each_axis=True
    )
    plot.add(result.F, alpha=0.3, color="blue")
    plot.show()

    return result


if __name__ == "__main__":
    result = run_many_objective_optimization()
