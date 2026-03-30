# Pymoo Test Problems Reference

Comprehensive reference for benchmark optimization problems in pymoo.

## Single-Objective Test Problems

### Ackley Function
**Characteristics:**
- Highly multimodal
- Many local optima
- Tests algorithm's ability to escape local minima
- Continuous variables

### Griewank Function
**Characteristics:**
- Multimodal with regularly distributed local minima
- Product term introduces interdependencies between variables
- Global minimum at origin

### Rastrigin Function
**Characteristics:**
- Highly multimodal with regularly spaced local minima
- Challenging for gradient-based methods
- Tests global search capability

### Rosenbrock Function
**Characteristics:**
- Unimodal but narrow valley to global optimum
- Tests algorithm's convergence in difficult landscape
- Classic benchmark for continuous optimization

### Zakharov Function
**Characteristics:**
- Unimodal
- Single global minimum
- Tests basic convergence capability

## Multi-Objective Test Problems (2-3 objectives)

### ZDT Test Suite
**Purpose:** Standard benchmark for bi-objective optimization
**Construction:** f₂(x) = g(x) · h(f₁(x), g(x)) where g(x) = 1 at Pareto-optimal solutions

#### ZDT1
- **Variables:** 30 continuous
- **Bounds:** [0, 1]
- **Pareto front:** Convex
- **Purpose:** Basic convergence and diversity test

#### ZDT2
- **Variables:** 30 continuous
- **Bounds:** [0, 1]
- **Pareto front:** Non-convex (concave)
- **Purpose:** Tests handling of non-convex fronts

#### ZDT3
- **Variables:** 30 continuous
- **Bounds:** [0, 1]
- **Pareto front:** Disconnected (5 separate regions)
- **Purpose:** Tests diversity maintenance across discontinuous front

#### ZDT4
- **Variables:** 10 continuous (x₁ ∈ [0,1], x₂₋₁₀ ∈ [-10,10])
- **Pareto front:** Convex
- **Difficulty:** 21⁹ local Pareto fronts
- **Purpose:** Tests global search with many local optima

#### ZDT5
- **Variables:** 11 discrete (bitstring)
- **Encoding:** x₁ uses 30 bits, x₂₋₁₁ use 5 bits each
- **Pareto front:** Convex
- **Purpose:** Tests discrete optimization and deceptive landscapes

#### ZDT6
- **Variables:** 10 continuous
- **Bounds:** [0, 1]
- **Pareto front:** Non-convex with non-uniform density
- **Purpose:** Tests handling of biased solution distributions

**Usage:**
```python
from pymoo.problems.multi import ZDT1, ZDT2, ZDT3, ZDT4, ZDT5, ZDT6
problem = ZDT1()  # or ZDT2(), ZDT3(), etc.
```

### BNH (Binh and Korn)
**Characteristics:**
- 2 objectives
- 2 variables
- Constrained problem
- Tests constraint handling in multi-objective context

### OSY (Osyczka and Kundu)
**Characteristics:**
- 6 objectives
- 6 variables
- Multiple constraints
- Real-world inspired

### TNK (Tanaka)
**Characteristics:**
- 2 objectives
- 2 variables
- Disconnected feasible region
- Tests handling of disjoint search spaces

### Truss2D
**Characteristics:**
- Structural engineering problem
- Bi-objective (weight vs displacement)
- Practical application test

### Welded Beam
**Characteristics:**
- Engineering design problem
- Multiple constraints
- Practical optimization scenario

### Omni-test
**Characteristics:**
- Configurable test problem
- Various difficulty levels
- Systematic testing

### SYM-PART
**Characteristics:**
- Symmetric problem structure
- Tests specific algorithmic behaviors

## Many-Objective Test Problems (4+ objectives)

### DTLZ Test Suite
**Purpose:** Scalable many-objective benchmarks
**Objectives:** Configurable (typically 3-15)
**Variables:** Scalable

#### DTLZ1
- **Pareto front:** Linear (hyperplane)
- **Difficulty:** 11^k local Pareto fronts
- **Purpose:** Tests convergence with many local optima

#### DTLZ2
- **Pareto front:** Spherical (concave)
- **Difficulty:** Straightforward convergence
- **Purpose:** Basic many-objective diversity test

#### DTLZ3
- **Pareto front:** Spherical
- **Difficulty:** 3^k local Pareto fronts
- **Purpose:** Combines DTLZ1's multimodality with DTLZ2's geometry

#### DTLZ4
- **Pareto front:** Spherical with biased density
- **Difficulty:** Non-uniform solution distribution
- **Purpose:** Tests diversity maintenance with bias

#### DTLZ5
- **Pareto front:** Degenerate (curve in M-dimensional space)
- **Purpose:** Tests handling of degenerate fronts

#### DTLZ6
- **Pareto front:** Degenerate curve
- **Difficulty:** Harder convergence than DTLZ5
- **Purpose:** Challenging degenerate front

#### DTLZ7
- **Pareto front:** Disconnected regions
- **Difficulty:** 2^(M-1) disconnected regions
- **Purpose:** Tests diversity across disconnected fronts

**Usage:**
```python
from pymoo.problems.many import DTLZ1, DTLZ2
problem = DTLZ1(n_var=7, n_obj=3)  # 7 variables, 3 objectives
```

### WFG Test Suite
**Purpose:** Walking Fish Group scalable benchmarks
**Features:** More complex than DTLZ, various front shapes and difficulties

**Variants:** WFG1-WFG9 with different characteristics
- Non-separable
- Deceptive
- Multimodal
- Biased
- Scaled fronts

## Constrained Multi-Objective Problems

### MW Test Suite
**Purpose:** Multi-objective problems with various constraint types
**Features:** Different constraint difficulty levels

### DAS-CMOP
**Purpose:** Difficulty-adjustable and scalable constrained multi-objective problems
**Features:** Tunable constraint difficulty

### MODAct
**Purpose:** Multi-objective optimization with active constraints
**Features:** Realistic constraint scenarios

## Dynamic Multi-Objective Problems

### DF Test Suite
**Purpose:** CEC2018 Competition dynamic multi-objective benchmarks
**Features:**
- Time-varying objectives
- Changing Pareto fronts
- Tests algorithm adaptability

**Variants:** DF1-DF14 with different dynamics

## Custom Problem Definition

Define custom problems by extending base classes:

```python
from pymoo.core.problem import ElementwiseProblem
import numpy as np

class MyProblem(ElementwiseProblem):
    def __init__(self):
        super().__init__(
            n_var=2,           # number of variables
            n_obj=2,           # number of objectives
            n_ieq_constr=0,    # inequality constraints
            n_eq_constr=0,     # equality constraints
            xl=np.array([0, 0]),   # lower bounds
            xu=np.array([1, 1])    # upper bounds
        )

    def _evaluate(self, x, out, *args, **kwargs):
        # Define objectives
        f1 = x[0]**2 + x[1]**2
        f2 = (x[0]-1)**2 + x[1]**2

        out["F"] = [f1, f2]

        # Optional: constraints
        # out["G"] = constraint_values  # <= 0
        # out["H"] = equality_constraints  # == 0
```

## Problem Selection Guidelines

**For algorithm development:**
- Simple convergence: DTLZ2, ZDT1
- Multimodal: ZDT4, DTLZ1, DTLZ3
- Non-convex: ZDT2
- Disconnected: ZDT3, DTLZ7

**For comprehensive testing:**
- ZDT suite for bi-objective
- DTLZ suite for many-objective
- WFG for complex landscapes
- MW/DAS-CMOP for constraints

**For real-world validation:**
- Engineering problems (Truss2D, Welded Beam)
- Match problem characteristics to application domain

**Variable types:**
- Continuous: Most problems
- Discrete: ZDT5
- Mixed: Define custom problem
