---
name: pymoo
description: Multi-objective optimization framework. NSGA-II, NSGA-III, MOEA/D, Pareto fronts, constraint handling, benchmarks (ZDT, DTLZ), for engineering design and optimization problems.
license: Apache-2.0 license
metadata:
    skill-author: K-Dense Inc.
---

# Pymoo - Multi-Objective Optimization in Python

## Overview

Pymoo is a comprehensive Python framework for optimization with emphasis on multi-objective problems. Solve single and multi-objective optimization using state-of-the-art algorithms (NSGA-II/III, MOEA/D), benchmark problems (ZDT, DTLZ), customizable genetic operators, and multi-criteria decision making methods. Excels at finding trade-off solutions (Pareto fronts) for problems with conflicting objectives.

## When to Use This Skill

This skill should be used when:
- Solving optimization problems with one or multiple objectives
- Finding Pareto-optimal solutions and analyzing trade-offs
- Implementing evolutionary algorithms (GA, DE, PSO, NSGA-II/III)
- Working with constrained optimization problems
- Benchmarking algorithms on standard test problems (ZDT, DTLZ, WFG)
- Customizing genetic operators (crossover, mutation, selection)
- Visualizing high-dimensional optimization results
- Making decisions from multiple competing solutions
- Handling binary, discrete, continuous, or mixed-variable problems

## Core Concepts

### The Unified Interface

Pymoo uses a consistent `minimize()` function for all optimization tasks:

```python
from pymoo.optimize import minimize

result = minimize(
    problem,        # What to optimize
    algorithm,      # How to optimize
    termination,    # When to stop
    seed=1,
    verbose=True
)
```

**Result object contains:**
- `result.X`: Decision variables of optimal solution(s)
- `result.F`: Objective values of optimal solution(s)
- `result.G`: Constraint violations (if constrained)
- `result.algorithm`: Algorithm object with history

### Problem Types

**Single-objective:** One objective to minimize/maximize
**Multi-objective:** 2-3 conflicting objectives → Pareto front
**Many-objective:** 4+ objectives → High-dimensional Pareto front
**Constrained:** Objectives + inequality/equality constraints
**Dynamic:** Time-varying objectives or constraints

## Quick Start Workflows

### Workflow 1: Single-Objective Optimization

**When:** Optimizing one objective function

**Steps:**
1. Define or select problem
2. Choose single-objective algorithm (GA, DE, PSO, CMA-ES)
3. Configure termination criteria
4. Run optimization
5. Extract best solution

**Example:**
```python
from pymoo.algorithms.soo.nonconvex.ga import GA
from pymoo.problems import get_problem
from pymoo.optimize import minimize

# Built-in problem
problem = get_problem("rastrigin", n_var=10)

# Configure Genetic Algorithm
algorithm = GA(
    pop_size=100,
    eliminate_duplicates=True
)

# Optimize
result = minimize(
    problem,
    algorithm,
    ('n_gen', 200),
    seed=1,
    verbose=True
)

print(f"Best solution: {result.X}")
print(f"Best objective: {result.F[0]}")
```

**See:** `scripts/single_objective_example.py` for complete example

### Workflow 2: Multi-Objective Optimization (2-3 objectives)

**When:** Optimizing 2-3 conflicting objectives, need Pareto front

**Algorithm choice:** NSGA-II (standard for bi/tri-objective)

**Steps:**
1. Define multi-objective problem
2. Configure NSGA-II
3. Run optimization to obtain Pareto front
4. Visualize trade-offs
5. Apply decision making (optional)

**Example:**
```python
from pymoo.algorithms.moo.nsga2 import NSGA2
from pymoo.problems import get_problem
from pymoo.optimize import minimize
from pymoo.visualization.scatter import Scatter

# Bi-objective benchmark problem
problem = get_problem("zdt1")

# NSGA-II algorithm
algorithm = NSGA2(pop_size=100)

# Optimize
result = minimize(problem, algorithm, ('n_gen', 200), seed=1)

# Visualize Pareto front
plot = Scatter()
plot.add(result.F, label="Obtained Front")
plot.add(problem.pareto_front(), label="True Front", alpha=0.3)
plot.show()

print(f"Found {len(result.F)} Pareto-optimal solutions")
```

**See:** `scripts/multi_objective_example.py` for complete example

### Workflow 3: Many-Objective Optimization (4+ objectives)

**When:** Optimizing 4 or more objectives

**Algorithm choice:** NSGA-III (designed for many objectives)

**Key difference:** Must provide reference directions for population guidance

**Steps:**
1. Define many-objective problem
2. Generate reference directions
3. Configure NSGA-III with reference directions
4. Run optimization
5. Visualize using Parallel Coordinate Plot

**Example:**
```python
from pymoo.algorithms.moo.nsga3 import NSGA3
from pymoo.problems import get_problem
from pymoo.optimize import minimize
from pymoo.util.ref_dirs import get_reference_directions
from pymoo.visualization.pcp import PCP

# Many-objective problem (5 objectives)
problem = get_problem("dtlz2", n_obj=5)

# Generate reference directions (required for NSGA-III)
ref_dirs = get_reference_directions("das-dennis", n_dim=5, n_partitions=12)

# Configure NSGA-III
algorithm = NSGA3(ref_dirs=ref_dirs)

# Optimize
result = minimize(problem, algorithm, ('n_gen', 300), seed=1)

# Visualize with Parallel Coordinates
plot = PCP(labels=[f"f{i+1}" for i in range(5)])
plot.add(result.F, alpha=0.3)
plot.show()
```

**See:** `scripts/many_objective_example.py` for complete example

### Workflow 4: Custom Problem Definition

**When:** Solving domain-specific optimization problem

**Steps:**
1. Extend `ElementwiseProblem` class
2. Define `__init__` with problem dimensions and bounds
3. Implement `_evaluate` method for objectives (and constraints)
4. Use with any algorithm

**Unconstrained example:**
```python
from pymoo.core.problem import ElementwiseProblem
import numpy as np

class MyProblem(ElementwiseProblem):
    def __init__(self):
        super().__init__(
            n_var=2,              # Number of variables
            n_obj=2,              # Number of objectives
            xl=np.array([0, 0]),  # Lower bounds
            xu=np.array([5, 5])   # Upper bounds
        )

    def _evaluate(self, x, out, *args, **kwargs):
        # Define objectives
        f1 = x[0]**2 + x[1]**2
        f2 = (x[0]-1)**2 + (x[1]-1)**2

        out["F"] = [f1, f2]
```

**Constrained example:**
```python
class ConstrainedProblem(ElementwiseProblem):
    def __init__(self):
        super().__init__(
            n_var=2,
            n_obj=2,
            n_ieq_constr=2,        # Inequality constraints
            n_eq_constr=1,         # Equality constraints
            xl=np.array([0, 0]),
            xu=np.array([5, 5])
        )

    def _evaluate(self, x, out, *args, **kwargs):
        # Objectives
        out["F"] = [f1, f2]

        # Inequality constraints (g <= 0)
        out["G"] = [g1, g2]

        # Equality constraints (h = 0)
        out["H"] = [h1]
```

**Constraint formulation rules:**
- Inequality: Express as `g(x) <= 0` (feasible when ≤ 0)
- Equality: Express as `h(x) = 0` (feasible when = 0)
- Convert `g(x) >= b` to `-(g(x) - b) <= 0`

**See:** `scripts/custom_problem_example.py` for complete examples

### Workflow 5: Constraint Handling

**When:** Problem has feasibility constraints

**Approach options:**

**1. Feasibility First (Default - Recommended)**
```python
from pymoo.algorithms.moo.nsga2 import NSGA2

# Works automatically with constrained problems
algorithm = NSGA2(pop_size=100)
result = minimize(problem, algorithm, termination)

# Check feasibility
feasible = result.CV[:, 0] == 0  # CV = constraint violation
print(f"Feasible solutions: {np.sum(feasible)}")
```

**2. Penalty Method**
```python
from pymoo.constraints.as_penalty import ConstraintsAsPenalty

# Wrap problem to convert constraints to penalties
problem_penalized = ConstraintsAsPenalty(problem, penalty=1e6)
```

**3. Constraint as Objective**
```python
from pymoo.constraints.as_obj import ConstraintsAsObjective

# Treat constraint violation as additional objective
problem_with_cv = ConstraintsAsObjective(problem)
```

**4. Specialized Algorithms**
```python
from pymoo.algorithms.soo.nonconvex.sres import SRES

# SRES has built-in constraint handling
algorithm = SRES()
```

**See:** `references/constraints_mcdm.md` for comprehensive constraint handling guide

### Workflow 6: Decision Making from Pareto Front

**When:** Have Pareto front, need to select preferred solution(s)

**Steps:**
1. Run multi-objective optimization
2. Normalize objectives to [0, 1]
3. Define preference weights
4. Apply MCDM method
5. Visualize selected solution

**Example using Pseudo-Weights:**
```python
from pymoo.mcdm.pseudo_weights import PseudoWeights
import numpy as np

# After obtaining result from multi-objective optimization
# Normalize objectives
F_norm = (result.F - result.F.min(axis=0)) / (result.F.max(axis=0) - result.F.min(axis=0))

# Define preferences (must sum to 1)
weights = np.array([0.3, 0.7])  # 30% f1, 70% f2

# Apply decision making
dm = PseudoWeights(weights)
selected_idx = dm.do(F_norm)

# Get selected solution
best_solution = result.X[selected_idx]
best_objectives = result.F[selected_idx]

print(f"Selected solution: {best_solution}")
print(f"Objective values: {best_objectives}")
```

**Other MCDM methods:**
- Compromise Programming: Select closest to ideal point
- Knee Point: Find balanced trade-off solutions
- Hypervolume Contribution: Select most diverse subset

**See:**
- `scripts/decision_making_example.py` for complete example
- `references/constraints_mcdm.md` for detailed MCDM methods

### Workflow 7: Visualization

**Choose visualization based on number of objectives:**

**2 objectives: Scatter Plot**
```python
from pymoo.visualization.scatter import Scatter

plot = Scatter(title="Bi-objective Results")
plot.add(result.F, color="blue", alpha=0.7)
plot.show()
```

**3 objectives: 3D Scatter**
```python
plot = Scatter(title="Tri-objective Results")
plot.add(result.F)  # Automatically renders in 3D
plot.show()
```

**4+ objectives: Parallel Coordinate Plot**
```python
from pymoo.visualization.pcp import PCP

plot = PCP(
    labels=[f"f{i+1}" for i in range(n_obj)],
    normalize_each_axis=True
)
plot.add(result.F, alpha=0.3)
plot.show()
```

**Solution comparison: Petal Diagram**
```python
from pymoo.visualization.petal import Petal

plot = Petal(
    bounds=[result.F.min(axis=0), result.F.max(axis=0)],
    labels=["Cost", "Weight", "Efficiency"]
)
plot.add(solution_A, label="Design A")
plot.add(solution_B, label="Design B")
plot.show()
```

**See:** `references/visualization.md` for all visualization types and usage

## Algorithm Selection Guide

### Single-Objective Problems

| Algorithm | Best For | Key Features |
|-----------|----------|--------------|
| **GA** | General-purpose | Flexible, customizable operators |
| **DE** | Continuous optimization | Good global search |
| **PSO** | Smooth landscapes | Fast convergence |
| **CMA-ES** | Difficult/noisy problems | Self-adapting |

### Multi-Objective Problems (2-3 objectives)

| Algorithm | Best For | Key Features |
|-----------|----------|--------------|
| **NSGA-II** | Standard benchmark | Fast, reliable, well-tested |
| **R-NSGA-II** | Preference regions | Reference point guidance |
| **MOEA/D** | Decomposable problems | Scalarization approach |

### Many-Objective Problems (4+ objectives)

| Algorithm | Best For | Key Features |
|-----------|----------|--------------|
| **NSGA-III** | 4-15 objectives | Reference direction-based |
| **RVEA** | Adaptive search | Reference vector evolution |
| **AGE-MOEA** | Complex landscapes | Adaptive geometry |

### Constrained Problems

| Approach | Algorithm | When to Use |
|----------|-----------|-------------|
| Feasibility-first | Any algorithm | Large feasible region |
| Specialized | SRES, ISRES | Heavy constraints |
| Penalty | GA + penalty | Algorithm compatibility |

**See:** `references/algorithms.md` for comprehensive algorithm reference

## Benchmark Problems

### Quick problem access:
```python
from pymoo.problems import get_problem

# Single-objective
problem = get_problem("rastrigin", n_var=10)
problem = get_problem("rosenbrock", n_var=10)

# Multi-objective
problem = get_problem("zdt1")        # Convex front
problem = get_problem("zdt2")        # Non-convex front
problem = get_problem("zdt3")        # Disconnected front

# Many-objective
problem = get_problem("dtlz2", n_obj=5, n_var=12)
problem = get_problem("dtlz7", n_obj=4)
```

**See:** `references/problems.md` for complete test problem reference

## Genetic Operator Customization

### Standard operator configuration:
```python
from pymoo.algorithms.soo.nonconvex.ga import GA
from pymoo.operators.crossover.sbx import SBX
from pymoo.operators.mutation.pm import PM

algorithm = GA(
    pop_size=100,
    crossover=SBX(prob=0.9, eta=15),
    mutation=PM(eta=20),
    eliminate_duplicates=True
)
```

### Operator selection by variable type:

**Continuous variables:**
- Crossover: SBX (Simulated Binary Crossover)
- Mutation: PM (Polynomial Mutation)

**Binary variables:**
- Crossover: TwoPointCrossover, UniformCrossover
- Mutation: BitflipMutation

**Permutations (TSP, scheduling):**
- Crossover: OrderCrossover (OX)
- Mutation: InversionMutation

**See:** `references/operators.md` for comprehensive operator reference

## Performance and Troubleshooting

### Common issues and solutions:

**Problem: Algorithm not converging**
- Increase population size
- Increase number of generations
- Check if problem is multimodal (try different algorithms)
- Verify constraints are correctly formulated

**Problem: Poor Pareto front distribution**
- For NSGA-III: Adjust reference directions
- Increase population size
- Check for duplicate elimination
- Verify problem scaling

**Problem: Few feasible solutions**
- Use constraint-as-objective approach
- Apply repair operators
- Try SRES/ISRES for constrained problems
- Check constraint formulation (should be g <= 0)

**Problem: High computational cost**
- Reduce population size
- Decrease number of generations
- Use simpler operators
- Enable parallelization (if problem supports)

### Best practices:

1. **Normalize objectives** when scales differ significantly
2. **Set random seed** for reproducibility
3. **Save history** to analyze convergence: `save_history=True`
4. **Visualize results** to understand solution quality
5. **Compare with true Pareto front** when available
6. **Use appropriate termination criteria** (generations, evaluations, tolerance)
7. **Tune operator parameters** for problem characteristics

## Resources

This skill includes comprehensive reference documentation and executable examples:

### references/
Detailed documentation for in-depth understanding:

- **algorithms.md**: Complete algorithm reference with parameters, usage, and selection guidelines
- **problems.md**: Benchmark test problems (ZDT, DTLZ, WFG) with characteristics
- **operators.md**: Genetic operators (sampling, selection, crossover, mutation) with configuration
- **visualization.md**: All visualization types with examples and selection guide
- **constraints_mcdm.md**: Constraint handling techniques and multi-criteria decision making methods

**Search patterns for references:**
- Algorithm details: `grep -r "NSGA-II\|NSGA-III\|MOEA/D" references/`
- Constraint methods: `grep -r "Feasibility First\|Penalty\|Repair" references/`
- Visualization types: `grep -r "Scatter\|PCP\|Petal" references/`

### scripts/
Executable examples demonstrating common workflows:

- **single_objective_example.py**: Basic single-objective optimization with GA
- **multi_objective_example.py**: Multi-objective optimization with NSGA-II, visualization
- **many_objective_example.py**: Many-objective optimization with NSGA-III, reference directions
- **custom_problem_example.py**: Defining custom problems (constrained and unconstrained)
- **decision_making_example.py**: Multi-criteria decision making with different preferences

**Run examples:**
```bash
python3 scripts/single_objective_example.py
python3 scripts/multi_objective_example.py
python3 scripts/many_objective_example.py
python3 scripts/custom_problem_example.py
python3 scripts/decision_making_example.py
```

## Additional Notes

**Installation:**
```bash
uv pip install pymoo
```

**Dependencies:** NumPy, SciPy, matplotlib, autograd (optional for gradient-based)

**Documentation:** https://pymoo.org/

**Version:** This skill is based on pymoo 0.6.x

**Common patterns:**
- Always use `ElementwiseProblem` for custom problems
- Constraints formulated as `g(x) <= 0` and `h(x) = 0`
- Reference directions required for NSGA-III
- Normalize objectives before MCDM
- Use appropriate termination: `('n_gen', N)` or `get_termination("f_tol", tol=0.001)`

