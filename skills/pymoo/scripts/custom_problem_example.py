"""
Custom problem definition example using pymoo.

This script demonstrates how to define a custom optimization problem
and solve it using pymoo.
"""

from pymoo.core.problem import ElementwiseProblem
from pymoo.algorithms.moo.nsga2 import NSGA2
from pymoo.optimize import minimize
from pymoo.visualization.scatter import Scatter
import numpy as np


class MyBiObjectiveProblem(ElementwiseProblem):
    """
    Custom bi-objective optimization problem.

    Minimize:
        f1(x) = x1^2 + x2^2
        f2(x) = (x1-1)^2 + (x2-1)^2

    Subject to:
        0 <= x1 <= 5
        0 <= x2 <= 5
    """

    def __init__(self):
        super().__init__(
            n_var=2,                    # Number of decision variables
            n_obj=2,                    # Number of objectives
            n_ieq_constr=0,            # Number of inequality constraints
            n_eq_constr=0,             # Number of equality constraints
            xl=np.array([0, 0]),       # Lower bounds
            xu=np.array([5, 5])        # Upper bounds
        )

    def _evaluate(self, x, out, *args, **kwargs):
        """Evaluate objectives for a single solution."""
        # Objective 1: Distance from origin
        f1 = x[0]**2 + x[1]**2

        # Objective 2: Distance from (1, 1)
        f2 = (x[0] - 1)**2 + (x[1] - 1)**2

        # Return objectives
        out["F"] = [f1, f2]


class ConstrainedProblem(ElementwiseProblem):
    """
    Custom constrained bi-objective problem.

    Minimize:
        f1(x) = x1
        f2(x) = (1 + x2) / x1

    Subject to:
        x2 + 9*x1 >= 6          (g1 <= 0)
        -x2 + 9*x1 >= 1         (g2 <= 0)
        0.1 <= x1 <= 1
        0 <= x2 <= 5
    """

    def __init__(self):
        super().__init__(
            n_var=2,
            n_obj=2,
            n_ieq_constr=2,            # Two inequality constraints
            xl=np.array([0.1, 0.0]),
            xu=np.array([1.0, 5.0])
        )

    def _evaluate(self, x, out, *args, **kwargs):
        """Evaluate objectives and constraints."""
        # Objectives
        f1 = x[0]
        f2 = (1 + x[1]) / x[0]

        out["F"] = [f1, f2]

        # Inequality constraints (g <= 0)
        # Convert g1: x2 + 9*x1 >= 6  →  -(x2 + 9*x1 - 6) <= 0
        g1 = -(x[1] + 9 * x[0] - 6)

        # Convert g2: -x2 + 9*x1 >= 1  →  -(-x2 + 9*x1 - 1) <= 0
        g2 = -(-x[1] + 9 * x[0] - 1)

        out["G"] = [g1, g2]


def solve_custom_problem():
    """Solve custom bi-objective problem."""

    print("="*60)
    print("CUSTOM PROBLEM - UNCONSTRAINED")
    print("="*60)

    # Define custom problem
    problem = MyBiObjectiveProblem()

    # Configure algorithm
    algorithm = NSGA2(pop_size=100)

    # Solve
    result = minimize(
        problem,
        algorithm,
        ('n_gen', 200),
        seed=1,
        verbose=False
    )

    print(f"Number of solutions: {len(result.F)}")
    print(f"Objective space range:")
    print(f"  f1: [{result.F[:, 0].min():.3f}, {result.F[:, 0].max():.3f}]")
    print(f"  f2: [{result.F[:, 1].min():.3f}, {result.F[:, 1].max():.3f}]")

    # Visualize
    plot = Scatter(title="Custom Bi-Objective Problem")
    plot.add(result.F, color="blue", alpha=0.7)
    plot.show()

    return result


def solve_constrained_problem():
    """Solve custom constrained problem."""

    print("\n" + "="*60)
    print("CUSTOM PROBLEM - CONSTRAINED")
    print("="*60)

    # Define constrained problem
    problem = ConstrainedProblem()

    # Configure algorithm
    algorithm = NSGA2(pop_size=100)

    # Solve
    result = minimize(
        problem,
        algorithm,
        ('n_gen', 200),
        seed=1,
        verbose=False
    )

    # Check feasibility
    feasible = result.CV[:, 0] == 0  # Constraint violation = 0

    print(f"Total solutions: {len(result.F)}")
    print(f"Feasible solutions: {np.sum(feasible)}")
    print(f"Infeasible solutions: {np.sum(~feasible)}")

    if np.any(feasible):
        F_feasible = result.F[feasible]
        print(f"\nFeasible objective space range:")
        print(f"  f1: [{F_feasible[:, 0].min():.3f}, {F_feasible[:, 0].max():.3f}]")
        print(f"  f2: [{F_feasible[:, 1].min():.3f}, {F_feasible[:, 1].max():.3f}]")

        # Visualize feasible solutions
        plot = Scatter(title="Constrained Problem - Feasible Solutions")
        plot.add(F_feasible, color="green", alpha=0.7, label="Feasible")

        if np.any(~feasible):
            plot.add(result.F[~feasible], color="red", alpha=0.3, s=10, label="Infeasible")

        plot.show()

    return result


if __name__ == "__main__":
    # Run both examples
    result1 = solve_custom_problem()
    result2 = solve_constrained_problem()

    print("\n" + "="*60)
    print("EXAMPLES COMPLETED")
    print("="*60)
