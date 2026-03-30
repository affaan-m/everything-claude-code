# Pymoo Constraints and Decision Making Reference

Reference for constraint handling and multi-criteria decision making in pymoo.

## Constraint Handling

### Defining Constraints

Constraints are specified in the Problem definition:

```python
from pymoo.core.problem import ElementwiseProblem
import numpy as np

class ConstrainedProblem(ElementwiseProblem):
    def __init__(self):
        super().__init__(
            n_var=2,
            n_obj=2,
            n_ieq_constr=2,    # Number of inequality constraints
            n_eq_constr=1,      # Number of equality constraints
            xl=np.array([0, 0]),
            xu=np.array([5, 5])
        )

    def _evaluate(self, x, out, *args, **kwargs):
        # Objectives
        f1 = x[0]**2 + x[1]**2
        f2 = (x[0]-1)**2 + (x[1]-1)**2

        out["F"] = [f1, f2]

        # Inequality constraints (formulated as g(x) <= 0)
        g1 = x[0] + x[1] - 5  # x[0] + x[1] >= 5 → -(x[0] + x[1] - 5) <= 0
        g2 = x[0]**2 + x[1]**2 - 25  # x[0]^2 + x[1]^2 <= 25

        out["G"] = [g1, g2]

        # Equality constraints (formulated as h(x) = 0)
        h1 = x[0] - 2*x[1]

        out["H"] = [h1]
```

**Constraint formulation rules:**
- Inequality: `g(x) <= 0` (feasible when negative or zero)
- Equality: `h(x) = 0` (feasible when zero)
- Convert `g(x) >= 0` to `-g(x) <= 0`

### Constraint Handling Techniques

#### 1. Feasibility First (Default)
**Mechanism:** Always prefer feasible over infeasible solutions
**Comparison:**
1. Both feasible → compare by objective values
2. One feasible, one infeasible → feasible wins
3. Both infeasible → compare by constraint violation

**Usage:**
```python
from pymoo.algorithms.moo.nsga2 import NSGA2

# Feasibility first is default for most algorithms
algorithm = NSGA2(pop_size=100)
```

**Advantages:**
- Works with any sorting-based algorithm
- Simple and effective
- No parameter tuning

**Disadvantages:**
- May struggle with small feasible regions
- Can ignore good infeasible solutions

#### 2. Penalty Methods
**Mechanism:** Add penalty to objective based on constraint violation
**Formula:** `F_penalized = F + penalty_factor * violation`

**Usage:**
```python
from pymoo.algorithms.soo.nonconvex.ga import GA
from pymoo.constraints.as_penalty import ConstraintsAsPenalty

# Wrap problem with penalty
problem_with_penalty = ConstraintsAsPenalty(problem, penalty=1e6)

algorithm = GA(pop_size=100)
```

**Parameters:**
- `penalty`: Penalty coefficient (tune based on problem scale)

**Advantages:**
- Converts constrained to unconstrained problem
- Works with any optimization algorithm

**Disadvantages:**
- Penalty parameter sensitive
- May need problem-specific tuning

#### 3. Constraint as Objective
**Mechanism:** Treat constraint violation as additional objective
**Result:** Multi-objective problem with M+1 objectives (M original + constraint)

**Usage:**
```python
from pymoo.algorithms.moo.nsga2 import NSGA2
from pymoo.constraints.as_obj import ConstraintsAsObjective

# Add constraint violation as objective
problem_with_cv_obj = ConstraintsAsObjective(problem)

algorithm = NSGA2(pop_size=100)
```

**Advantages:**
- No parameter tuning
- Maintains infeasible solutions that may be useful
- Works well when feasible region is small

**Disadvantages:**
- Increases problem dimensionality
- More complex Pareto front analysis

#### 4. Epsilon-Constraint Handling
**Mechanism:** Dynamic feasibility threshold
**Concept:** Gradually tighten constraint tolerance over generations

**Advantages:**
- Smooth transition to feasible region
- Helps with difficult constraint landscapes

**Disadvantages:**
- Algorithm-specific implementation
- Requires parameter tuning

#### 5. Repair Operators
**Mechanism:** Modify infeasible solutions to satisfy constraints
**Application:** After crossover/mutation, repair offspring

**Usage:**
```python
from pymoo.core.repair import Repair

class MyRepair(Repair):
    def _do(self, problem, X, **kwargs):
        # Project X onto feasible region
        # Example: clip to bounds
        X = np.clip(X, problem.xl, problem.xu)
        return X

from pymoo.algorithms.soo.nonconvex.ga import GA

algorithm = GA(pop_size=100, repair=MyRepair())
```

**Advantages:**
- Maintains feasibility throughout optimization
- Can encode domain knowledge

**Disadvantages:**
- Requires problem-specific implementation
- May restrict search

### Constraint-Handling Algorithms

Some algorithms have built-in constraint handling:

#### SRES (Stochastic Ranking Evolution Strategy)
**Purpose:** Single-objective constrained optimization
**Mechanism:** Stochastic ranking balances objectives and constraints

**Usage:**
```python
from pymoo.algorithms.soo.nonconvex.sres import SRES

algorithm = SRES()
```

#### ISRES (Improved SRES)
**Purpose:** Enhanced constrained optimization
**Improvements:** Better parameter adaptation

**Usage:**
```python
from pymoo.algorithms.soo.nonconvex.isres import ISRES

algorithm = ISRES()
```

### Constraint Handling Guidelines

**Choose technique based on:**

| Problem Characteristic | Recommended Technique |
|------------------------|----------------------|
| Large feasible region | Feasibility First |
| Small feasible region | Constraint as Objective, Repair |
| Heavily constrained | SRES/ISRES, Epsilon-constraint |
| Linear constraints | Repair (projection) |
| Nonlinear constraints | Feasibility First, Penalty |
| Known feasible solutions | Biased initialization |

## Multi-Criteria Decision Making (MCDM)

After obtaining a Pareto front, MCDM helps select preferred solution(s).

### Decision Making Context

**Pareto front characteristics:**
- Multiple non-dominated solutions
- Each represents different trade-off
- No objectively "best" solution
- Requires decision maker preferences

### MCDM Methods in Pymoo

#### 1. Pseudo-Weights
**Concept:** Weight each objective, select solution minimizing weighted sum
**Formula:** `score = w1*f1 + w2*f2 + ... + wM*fM`

**Usage:**
```python
from pymoo.mcdm.pseudo_weights import PseudoWeights

# Define weights (must sum to 1)
weights = np.array([0.3, 0.7])  # 30% weight on f1, 70% on f2

dm = PseudoWeights(weights)
best_idx = dm.do(result.F)
best_solution = result.X[best_idx]
```

**When to use:**
- Clear preference articulation available
- Objectives commensurable
- Linear trade-offs acceptable

**Limitations:**
- Requires weight specification
- Linear assumption may not capture preferences
- Sensitive to objective scaling

#### 2. Compromise Programming
**Concept:** Select solution closest to ideal point
**Metric:** Distance to ideal (e.g., Euclidean, Tchebycheff)

**Usage:**
```python
from pymoo.mcdm.compromise_programming import CompromiseProgramming

dm = CompromiseProgramming()
best_idx = dm.do(result.F, ideal=ideal_point, nadir=nadir_point)
```

**When to use:**
- Ideal objective values known or estimable
- Balanced consideration of all objectives
- No clear weight preferences

#### 3. Interactive Decision Making
**Concept:** Iterative preference refinement
**Process:**
1. Show representative solutions to decision maker
2. Gather feedback on preferences
3. Focus search on preferred regions
4. Repeat until satisfactory solution found

**Approaches:**
- Reference point methods
- Trade-off analysis
- Progressive preference articulation

### Decision Making Workflow

**Step 1: Normalize objectives**
```python
# Normalize to [0, 1] for fair comparison
F_norm = (result.F - result.F.min(axis=0)) / (result.F.max(axis=0) - result.F.min(axis=0))
```

**Step 2: Analyze trade-offs**
```python
from pymoo.visualization.scatter import Scatter

plot = Scatter()
plot.add(result.F)
plot.show()

# Identify knee points, extreme solutions
```

**Step 3: Apply MCDM method**
```python
from pymoo.mcdm.pseudo_weights import PseudoWeights

weights = np.array([0.4, 0.6])  # Based on preferences
dm = PseudoWeights(weights)
selected = dm.do(F_norm)
```

**Step 4: Validate selection**
```python
# Visualize selected solution
from pymoo.visualization.petal import Petal

plot = Petal()
plot.add(result.F[selected], label="Selected")
# Add other candidates for comparison
plot.show()
```

### Advanced MCDM Techniques

#### Knee Point Detection
**Concept:** Solutions where small improvement in one objective causes large degradation in others

**Usage:**
```python
from pymoo.mcdm.knee import KneePoint

km = KneePoint()
knee_idx = km.do(result.F)
knee_solutions = result.X[knee_idx]
```

**When to use:**
- No clear preferences
- Balanced trade-offs desired
- Convex Pareto fronts

#### Hypervolume Contribution
**Concept:** Select solutions contributing most to hypervolume
**Use case:** Maintain diverse subset of solutions

**Usage:**
```python
from pymoo.indicators.hv import HV

hv = HV(ref_point=reference_point)
hv_contributions = hv.calc_contributions(result.F)

# Select top contributors
top_k = 5
top_indices = np.argsort(hv_contributions)[-top_k:]
selected_solutions = result.X[top_indices]
```

### Decision Making Guidelines

**When decision maker has:**

| Preference Information | Recommended Method |
|------------------------|-------------------|
| Clear objective weights | Pseudo-Weights |
| Ideal target values | Compromise Programming |
| No prior preferences | Knee Point, Visual inspection |
| Conflicting criteria | Interactive methods |
| Need diverse subset | Hypervolume contribution |

**Best practices:**
1. **Normalize objectives** before MCDM
2. **Visualize Pareto front** to understand trade-offs
3. **Consider multiple methods** for robust selection
4. **Validate results** with domain experts
5. **Document assumptions** and preference sources
6. **Perform sensitivity analysis** on weights/parameters

### Integration Example

Complete workflow with constraint handling and decision making:

```python
from pymoo.algorithms.moo.nsga2 import NSGA2
from pymoo.optimize import minimize
from pymoo.mcdm.pseudo_weights import PseudoWeights
import numpy as np

# Define constrained problem
problem = MyConstrainedProblem()

# Setup algorithm with feasibility-first constraint handling
algorithm = NSGA2(
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

# Filter feasible solutions only
feasible_mask = result.CV[:, 0] == 0  # Constraint violation = 0
F_feasible = result.F[feasible_mask]
X_feasible = result.X[feasible_mask]

# Normalize objectives
F_norm = (F_feasible - F_feasible.min(axis=0)) / (F_feasible.max(axis=0) - F_feasible.min(axis=0))

# Apply MCDM
weights = np.array([0.5, 0.5])
dm = PseudoWeights(weights)
best_idx = dm.do(F_norm)

# Get final solution
best_solution = X_feasible[best_idx]
best_objectives = F_feasible[best_idx]

print(f"Selected solution: {best_solution}")
print(f"Objective values: {best_objectives}")
```
