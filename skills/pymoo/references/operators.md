# Pymoo Genetic Operators Reference

Comprehensive reference for genetic operators in pymoo.

## Sampling Operators

Sampling operators initialize populations at the start of optimization.

### Random Sampling
**Purpose:** Generate random initial solutions
**Types:**
- `FloatRandomSampling`: Continuous variables
- `BinaryRandomSampling`: Binary variables
- `IntegerRandomSampling`: Integer variables
- `PermutationRandomSampling`: Permutation-based problems

**Usage:**
```python
from pymoo.operators.sampling.rnd import FloatRandomSampling
sampling = FloatRandomSampling()
```

### Latin Hypercube Sampling (LHS)
**Purpose:** Space-filling initial population
**Benefit:** Better coverage of search space than random
**Types:**
- `LHS`: Standard Latin Hypercube

**Usage:**
```python
from pymoo.operators.sampling.lhs import LHS
sampling = LHS()
```

### Custom Sampling
Provide initial population through Population object or NumPy array

## Selection Operators

Selection operators choose parents for reproduction.

### Tournament Selection
**Purpose:** Select parents through tournament competition
**Mechanism:** Randomly select k individuals, choose best
**Parameters:**
- `pressure`: Tournament size (default: 2)
- `func_comp`: Comparison function

**Usage:**
```python
from pymoo.operators.selection.tournament import TournamentSelection
selection = TournamentSelection(pressure=2)
```

### Random Selection
**Purpose:** Uniform random parent selection
**Use case:** Baseline or exploration-focused algorithms

**Usage:**
```python
from pymoo.operators.selection.rnd import RandomSelection
selection = RandomSelection()
```

## Crossover Operators

Crossover operators recombine parent solutions to create offspring.

### For Continuous Variables

#### Simulated Binary Crossover (SBX)
**Purpose:** Primary crossover for continuous optimization
**Mechanism:** Simulates single-point crossover of binary-encoded variables
**Parameters:**
- `prob`: Crossover probability (default: 0.9)
- `eta`: Distribution index (default: 15)
  - Higher eta → offspring closer to parents
  - Lower eta → more exploration

**Usage:**
```python
from pymoo.operators.crossover.sbx import SBX
crossover = SBX(prob=0.9, eta=15)
```

**String shorthand:** `"real_sbx"`

#### Differential Evolution Crossover
**Purpose:** DE-specific recombination
**Variants:**
- `DE/rand/1/bin`
- `DE/best/1/bin`
- `DE/current-to-best/1/bin`

**Parameters:**
- `CR`: Crossover rate
- `F`: Scaling factor

### For Binary Variables

#### Single Point Crossover
**Purpose:** Cut and swap at one point
**Usage:**
```python
from pymoo.operators.crossover.pntx import SinglePointCrossover
crossover = SinglePointCrossover()
```

#### Two Point Crossover
**Purpose:** Cut and swap between two points
**Usage:**
```python
from pymoo.operators.crossover.pntx import TwoPointCrossover
crossover = TwoPointCrossover()
```

#### K-Point Crossover
**Purpose:** Multiple cut points
**Parameters:**
- `n_points`: Number of crossover points

#### Uniform Crossover
**Purpose:** Each gene independently from either parent
**Parameters:**
- `prob`: Per-gene swap probability (default: 0.5)

**Usage:**
```python
from pymoo.operators.crossover.ux import UniformCrossover
crossover = UniformCrossover(prob=0.5)
```

#### Half Uniform Crossover (HUX)
**Purpose:** Exchange exactly half of differing genes
**Benefit:** Maintains genetic diversity

### For Permutations

#### Order Crossover (OX)
**Purpose:** Preserve relative order from parents
**Use case:** Traveling salesman, scheduling problems

**Usage:**
```python
from pymoo.operators.crossover.ox import OrderCrossover
crossover = OrderCrossover()
```

#### Edge Recombination Crossover (ERX)
**Purpose:** Preserve edge information from parents
**Use case:** Routing problems where edge connectivity matters

#### Partially Mapped Crossover (PMX)
**Purpose:** Exchange segments while maintaining permutation validity

## Mutation Operators

Mutation operators introduce variation to maintain diversity.

### For Continuous Variables

#### Polynomial Mutation (PM)
**Purpose:** Primary mutation for continuous optimization
**Mechanism:** Polynomial probability distribution
**Parameters:**
- `prob`: Per-variable mutation probability
- `eta`: Distribution index (default: 20)
  - Higher eta → smaller perturbations
  - Lower eta → larger perturbations

**Usage:**
```python
from pymoo.operators.mutation.pm import PM
mutation = PM(prob=None, eta=20)  # prob=None means 1/n_var
```

**String shorthand:** `"real_pm"`

**Probability guidelines:**
- `None` or `1/n_var`: Standard recommendation
- Higher for more exploration
- Lower for more exploitation

### For Binary Variables

#### Bitflip Mutation
**Purpose:** Flip bits with specified probability
**Parameters:**
- `prob`: Per-bit flip probability

**Usage:**
```python
from pymoo.operators.mutation.bitflip import BitflipMutation
mutation = BitflipMutation(prob=0.05)
```

### For Integer Variables

#### Integer Polynomial Mutation
**Purpose:** PM adapted for integers
**Ensures:** Valid integer values after mutation

### For Permutations

#### Inversion Mutation
**Purpose:** Reverse a segment of the permutation
**Use case:** Maintains some order structure

**Usage:**
```python
from pymoo.operators.mutation.inversion import InversionMutation
mutation = InversionMutation()
```

#### Scramble Mutation
**Purpose:** Randomly shuffle a segment

### Custom Mutation
Define custom mutation by extending `Mutation` class

## Repair Operators

Repair operators fix constraint violations or ensure solution feasibility.

### Rounding Repair
**Purpose:** Round to nearest valid value
**Use case:** Integer/discrete variables with bound constraints

### Bounce Back Repair
**Purpose:** Reflect out-of-bounds values back into feasible region
**Use case:** Box-constrained continuous problems

### Projection Repair
**Purpose:** Project infeasible solutions onto feasible region
**Use case:** Linear constraints

### Custom Repair
**Purpose:** Domain-specific constraint handling
**Implementation:** Extend `Repair` class

**Example:**
```python
from pymoo.core.repair import Repair

class MyRepair(Repair):
    def _do(self, problem, X, **kwargs):
        # Modify X to satisfy constraints
        # Return repaired X
        return X
```

## Operator Configuration Guidelines

### Parameter Tuning

**Crossover probability:**
- High (0.8-0.95): Standard for most problems
- Lower: More emphasis on mutation

**Mutation probability:**
- `1/n_var`: Standard recommendation
- Higher: More exploration, slower convergence
- Lower: Faster convergence, risk of premature convergence

**Distribution indices (eta):**
- Crossover eta (15-30): Higher for local search
- Mutation eta (20-50): Higher for exploitation

### Problem-Specific Selection

**Continuous problems:**
- Crossover: SBX
- Mutation: Polynomial Mutation
- Selection: Tournament

**Binary problems:**
- Crossover: Two-point or Uniform
- Mutation: Bitflip
- Selection: Tournament

**Permutation problems:**
- Crossover: Order Crossover (OX)
- Mutation: Inversion or Scramble
- Selection: Tournament

**Mixed-variable problems:**
- Use appropriate operators per variable type
- Ensure operator compatibility

### String-Based Configuration

Pymoo supports convenient string-based operator specification:

```python
from pymoo.algorithms.soo.nonconvex.ga import GA

algorithm = GA(
    pop_size=100,
    sampling="real_random",
    crossover="real_sbx",
    mutation="real_pm"
)
```

**Available strings:**
- Sampling: `"real_random"`, `"real_lhs"`, `"bin_random"`, `"perm_random"`
- Crossover: `"real_sbx"`, `"real_de"`, `"int_sbx"`, `"bin_ux"`, `"bin_hux"`
- Mutation: `"real_pm"`, `"int_pm"`, `"bin_bitflip"`, `"perm_inv"`

## Operator Combination Examples

### Standard Continuous GA:
```python
from pymoo.operators.sampling.rnd import FloatRandomSampling
from pymoo.operators.crossover.sbx import SBX
from pymoo.operators.mutation.pm import PM
from pymoo.operators.selection.tournament import TournamentSelection

sampling = FloatRandomSampling()
crossover = SBX(prob=0.9, eta=15)
mutation = PM(eta=20)
selection = TournamentSelection()
```

### Binary GA:
```python
from pymoo.operators.sampling.rnd import BinaryRandomSampling
from pymoo.operators.crossover.pntx import TwoPointCrossover
from pymoo.operators.mutation.bitflip import BitflipMutation

sampling = BinaryRandomSampling()
crossover = TwoPointCrossover()
mutation = BitflipMutation(prob=0.05)
```

### Permutation GA (TSP):
```python
from pymoo.operators.sampling.rnd import PermutationRandomSampling
from pymoo.operators.crossover.ox import OrderCrossover
from pymoo.operators.mutation.inversion import InversionMutation

sampling = PermutationRandomSampling()
crossover = OrderCrossover()
mutation = InversionMutation()
```
