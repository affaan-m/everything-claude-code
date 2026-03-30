# Pymoo Algorithms Reference

Comprehensive reference for optimization algorithms available in pymoo.

## Single-Objective Optimization Algorithms

### Genetic Algorithm (GA)
**Purpose:** General-purpose single-objective evolutionary optimization
**Best for:** Continuous, discrete, or mixed-variable problems
**Algorithm type:** (μ+λ) genetic algorithm

**Key parameters:**
- `pop_size`: Population size (default: 100)
- `sampling`: Initial population generation strategy
- `selection`: Parent selection mechanism (default: Tournament)
- `crossover`: Recombination operator (default: SBX)
- `mutation`: Variation operator (default: Polynomial)
- `eliminate_duplicates`: Remove redundant solutions (default: True)
- `n_offsprings`: Offspring per generation

**Usage:**
```python
from pymoo.algorithms.soo.nonconvex.ga import GA
algorithm = GA(pop_size=100, eliminate_duplicates=True)
```

### Differential Evolution (DE)
**Purpose:** Single-objective continuous optimization
**Best for:** Continuous parameter optimization with good global search
**Algorithm type:** Population-based differential evolution

**Variants:** Multiple DE strategies available (rand/1/bin, best/1/bin, etc.)

### Particle Swarm Optimization (PSO)
**Purpose:** Single-objective optimization through swarm intelligence
**Best for:** Continuous problems, fast convergence on smooth landscapes

### CMA-ES
**Purpose:** Covariance Matrix Adaptation Evolution Strategy
**Best for:** Continuous optimization, particularly for noisy or ill-conditioned problems

### Pattern Search
**Purpose:** Direct search method
**Best for:** Problems where gradient information is unavailable

### Nelder-Mead
**Purpose:** Simplex-based optimization
**Best for:** Local optimization of continuous functions

## Multi-Objective Optimization Algorithms

### NSGA-II (Non-dominated Sorting Genetic Algorithm II)
**Purpose:** Multi-objective optimization with 2-3 objectives
**Best for:** Bi- and tri-objective problems requiring well-distributed Pareto fronts
**Selection strategy:** Non-dominated sorting + crowding distance

**Key features:**
- Fast non-dominated sorting
- Crowding distance for diversity
- Elitist approach
- Binary tournament mating selection

**Key parameters:**
- `pop_size`: Population size (default: 100)
- `sampling`: Initial population strategy
- `crossover`: Default SBX for continuous
- `mutation`: Default Polynomial Mutation
- `survival`: RankAndCrowding

**Usage:**
```python
from pymoo.algorithms.moo.nsga2 import NSGA2
algorithm = NSGA2(pop_size=100)
```

**When to use:**
- 2-3 objectives
- Need for distributed solutions across Pareto front
- Standard multi-objective benchmark

### NSGA-III
**Purpose:** Many-objective optimization (4+ objectives)
**Best for:** Problems with 4 or more objectives requiring uniform Pareto front coverage
**Selection strategy:** Reference direction-based diversity maintenance

**Key features:**
- Reference directions guide population
- Maintains diversity in high-dimensional objective spaces
- Niche preservation through reference points
- Underrepresented reference direction selection

**Key parameters:**
- `ref_dirs`: Reference directions (REQUIRED)
- `pop_size`: Defaults to number of reference directions
- `crossover`: Default SBX
- `mutation`: Default Polynomial Mutation

**Usage:**
```python
from pymoo.algorithms.moo.nsga3 import NSGA3
from pymoo.util.ref_dirs import get_reference_directions

ref_dirs = get_reference_directions("das-dennis", n_dim=4, n_partitions=12)
algorithm = NSGA3(ref_dirs=ref_dirs)
```

**NSGA-II vs NSGA-III:**
- Use NSGA-II for 2-3 objectives
- Use NSGA-III for 4+ objectives
- NSGA-III provides more uniform distribution
- NSGA-II has lower computational overhead

### R-NSGA-II (Reference Point Based NSGA-II)
**Purpose:** Multi-objective optimization with preference articulation
**Best for:** When decision maker has preferred regions of Pareto front

### U-NSGA-III (Unified NSGA-III)
**Purpose:** Improved version handling various scenarios
**Best for:** Many-objective problems with additional robustness

### MOEA/D (Multi-Objective Evolutionary Algorithm based on Decomposition)
**Purpose:** Decomposition-based multi-objective optimization
**Best for:** Problems where decomposition into scalar subproblems is effective

### AGE-MOEA
**Purpose:** Adaptive geometry estimation
**Best for:** Multi and many-objective problems with adaptive mechanisms

### RVEA (Reference Vector guided Evolutionary Algorithm)
**Purpose:** Reference vector-based many-objective optimization
**Best for:** Many-objective problems with adaptive reference vectors

### SMS-EMOA
**Purpose:** S-Metric Selection Evolutionary Multi-objective Algorithm
**Best for:** Problems where hypervolume indicator is critical
**Selection:** Uses dominated hypervolume contribution

## Dynamic Multi-Objective Algorithms

### D-NSGA-II
**Purpose:** Dynamic multi-objective problems
**Best for:** Time-varying objective functions or constraints

### KGB-DMOEA
**Purpose:** Knowledge-guided dynamic multi-objective optimization
**Best for:** Dynamic problems leveraging historical information

## Constrained Optimization

### SRES (Stochastic Ranking Evolution Strategy)
**Purpose:** Single-objective constrained optimization
**Best for:** Heavily constrained problems

### ISRES (Improved SRES)
**Purpose:** Enhanced constrained optimization
**Best for:** Complex constraint landscapes

## Algorithm Selection Guidelines

**For single-objective problems:**
- Start with GA for general problems
- Use DE for continuous optimization
- Try PSO for faster convergence on smooth problems
- Use CMA-ES for difficult/noisy landscapes

**For multi-objective problems:**
- 2-3 objectives: NSGA-II
- 4+ objectives: NSGA-III
- Preference articulation: R-NSGA-II
- Decomposition-friendly: MOEA/D
- Hypervolume focus: SMS-EMOA

**For constrained problems:**
- Feasibility-based survival selection (works with most algorithms)
- Heavy constraints: SRES/ISRES
- Penalty methods for algorithm compatibility

**For dynamic problems:**
- Time-varying: D-NSGA-II
- Historical knowledge useful: KGB-DMOEA
