"""
Single-objective optimization example using pymoo.

This script demonstrates basic single-objective optimization
using the Genetic Algorithm on the Sphere function.
"""

from pymoo.algorithms.soo.nonconvex.ga import GA
from pymoo.problems import get_problem
from pymoo.optimize import minimize
from pymoo.operators.crossover.sbx import SBX
from pymoo.operators.mutation.pm import PM
from pymoo.operators.sampling.rnd import FloatRandomSampling
from pymoo.termination import get_termination
import numpy as np


def run_single_objective_optimization():
    """Run single-objective optimization example."""

    # Define the problem - Sphere function (sum of squares)
    problem = get_problem("sphere", n_var=10)

    # Configure the algorithm
    algorithm = GA(
        pop_size=100,
        sampling=FloatRandomSampling(),
        crossover=SBX(prob=0.9, eta=15),
        mutation=PM(eta=20),
        eliminate_duplicates=True
    )

    # Define termination criteria
    termination = get_termination("n_gen", 100)

    # Run optimization
    result = minimize(
        problem,
        algorithm,
        termination,
        seed=1,
        verbose=True
    )

    # Print results
    print("\n" + "="*60)
    print("OPTIMIZATION RESULTS")
    print("="*60)
    print(f"Best solution: {result.X}")
    print(f"Best objective value: {result.F[0]:.6f}")
    print(f"Number of generations: {result.algorithm.n_gen}")
    print(f"Number of function evaluations: {result.algorithm.evaluator.n_eval}")
    print("="*60)

    return result


if __name__ == "__main__":
    result = run_single_objective_optimization()
