# Pymoo Visualization Reference

Comprehensive reference for visualization capabilities in pymoo.

## Overview

Pymoo provides eight visualization types for analyzing multi-objective optimization results. All plots wrap matplotlib and accept standard matplotlib keyword arguments for customization.

## Core Visualization Types

### 1. Scatter Plots
**Purpose:** Visualize objective space for 2D, 3D, or higher dimensions
**Best for:** Pareto fronts, solution distributions, algorithm comparisons

**Usage:**
```python
from pymoo.visualization.scatter import Scatter

# 2D scatter plot
plot = Scatter()
plot.add(result.F, color="red", label="Algorithm A")
plot.add(ref_pareto_front, color="black", alpha=0.3, label="True PF")
plot.show()

# 3D scatter plot
plot = Scatter(title="3D Pareto Front")
plot.add(result.F)
plot.show()
```

**Parameters:**
- `title`: Plot title
- `figsize`: Figure size tuple (width, height)
- `legend`: Show legend (default: True)
- `labels`: Axis labels list

**Add method parameters:**
- `color`: Color specification
- `alpha`: Transparency (0-1)
- `s`: Marker size
- `marker`: Marker style
- `label`: Legend label

**N-dimensional projection:**
For >3 objectives, automatically creates scatter plot matrix

### 2. Parallel Coordinate Plots (PCP)
**Purpose:** Compare multiple solutions across many objectives
**Best for:** Many-objective problems, comparing algorithm performance

**Mechanism:** Each vertical axis represents one objective, lines connect objective values for each solution

**Usage:**
```python
from pymoo.visualization.pcp import PCP

plot = PCP()
plot.add(result.F, color="blue", alpha=0.5)
plot.add(reference_set, color="red", alpha=0.8)
plot.show()
```

**Parameters:**
- `title`: Plot title
- `figsize`: Figure size
- `labels`: Objective labels
- `bounds`: Normalization bounds (min, max) per objective
- `normalize_each_axis`: Normalize to [0,1] per axis (default: True)

**Best practices:**
- Normalize for different objective scales
- Use transparency for overlapping lines
- Limit number of solutions for clarity (<1000)

### 3. Heatmap
**Purpose:** Show solution density and distribution patterns
**Best for:** Understanding solution clustering, identifying gaps

**Usage:**
```python
from pymoo.visualization.heatmap import Heatmap

plot = Heatmap(title="Solution Density")
plot.add(result.F)
plot.show()
```

**Parameters:**
- `bins`: Number of bins per dimension (default: 20)
- `cmap`: Colormap name (e.g., "viridis", "plasma", "hot")
- `norm`: Normalization method

**Interpretation:**
- Bright regions: High solution density
- Dark regions: Few or no solutions
- Reveals distribution uniformity

### 4. Petal Diagram
**Purpose:** Radial representation of multiple objectives
**Best for:** Comparing individual solutions across objectives

**Structure:** Each "petal" represents one objective, length indicates objective value

**Usage:**
```python
from pymoo.visualization.petal import Petal

plot = Petal(title="Solution Comparison", bounds=[min_vals, max_vals])
plot.add(result.F[0], color="blue", label="Solution 1")
plot.add(result.F[1], color="red", label="Solution 2")
plot.show()
```

**Parameters:**
- `bounds`: [min, max] per objective for normalization
- `labels`: Objective names
- `reverse`: Reverse specific objectives (for minimization display)

**Use cases:**
- Decision making between few solutions
- Presenting trade-offs to stakeholders

### 5. Radar Charts
**Purpose:** Multi-criteria performance profiles
**Best for:** Comparing solution characteristics

**Similar to:** Petal diagram but with connected vertices

**Usage:**
```python
from pymoo.visualization.radar import Radar

plot = Radar(bounds=[min_vals, max_vals])
plot.add(solution_A, label="Design A")
plot.add(solution_B, label="Design B")
plot.show()
```

### 6. Radviz
**Purpose:** Dimensional reduction for visualization
**Best for:** High-dimensional data exploration, pattern recognition

**Mechanism:** Projects high-dimensional points onto 2D circle, dimension anchors on perimeter

**Usage:**
```python
from pymoo.visualization.radviz import Radviz

plot = Radviz(title="High-dimensional Solution Space")
plot.add(result.F, color="blue", s=30)
plot.show()
```

**Parameters:**
- `endpoint_style`: Anchor point visualization
- `labels`: Dimension labels

**Interpretation:**
- Points near anchor: High value in that dimension
- Central points: Balanced across dimensions
- Clusters: Similar solutions

### 7. Star Coordinates
**Purpose:** Alternative high-dimensional visualization
**Best for:** Comparing multi-dimensional datasets

**Mechanism:** Each dimension as axis from origin, points plotted based on values

**Usage:**
```python
from pymoo.visualization.star_coordinate import StarCoordinate

plot = StarCoordinate()
plot.add(result.F)
plot.show()
```

**Parameters:**
- `axis_style`: Axis appearance
- `axis_extension`: Axis length beyond max value
- `labels`: Dimension labels

### 8. Video/Animation
**Purpose:** Show optimization progress over time
**Best for:** Understanding convergence behavior, presentations

**Usage:**
```python
from pymoo.visualization.video import Video

# Create animation from algorithm history
anim = Video(result.algorithm)
anim.save("optimization_progress.mp4")
```

**Requirements:**
- Algorithm must store history (use `save_history=True` in minimize)
- ffmpeg installed for video export

**Customization:**
- Frame rate
- Plot type per frame
- Overlay information (generation, hypervolume, etc.)

## Advanced Features

### Multiple Dataset Overlay

All plot types support adding multiple datasets:

```python
plot = Scatter(title="Algorithm Comparison")
plot.add(nsga2_result.F, color="red", alpha=0.5, label="NSGA-II")
plot.add(nsga3_result.F, color="blue", alpha=0.5, label="NSGA-III")
plot.add(true_pareto_front, color="black", linewidth=2, label="True PF")
plot.show()
```

### Custom Styling

Pass matplotlib kwargs directly:

```python
plot = Scatter(
    title="My Results",
    figsize=(10, 8),
    tight_layout=True
)
plot.add(
    result.F,
    color="red",
    marker="o",
    s=50,
    alpha=0.7,
    edgecolors="black",
    linewidth=0.5
)
```

### Normalization

Normalize objectives to [0,1] for fair comparison:

```python
plot = PCP(normalize_each_axis=True, bounds=[min_bounds, max_bounds])
```

### Save to File

Save plots instead of displaying:

```python
plot = Scatter()
plot.add(result.F)
plot.save("my_plot.png", dpi=300)
```

## Visualization Selection Guide

**Choose visualization based on:**

| Problem Type | Primary Plot | Secondary Plot |
|--------------|--------------|----------------|
| 2-objective | Scatter | Heatmap |
| 3-objective | 3D Scatter | Parallel Coordinates |
| Many-objective (4-10) | Parallel Coordinates | Radviz |
| Many-objective (>10) | Radviz | Star Coordinates |
| Solution comparison | Petal/Radar | Parallel Coordinates |
| Algorithm convergence | Video | Scatter (final) |
| Distribution analysis | Heatmap | Scatter |

**Combinations:**
- Scatter + Heatmap: Overall distribution + density
- PCP + Petal: Population overview + individual solutions
- Scatter + Video: Final result + convergence process

## Common Visualization Workflows

### 1. Algorithm Comparison
```python
from pymoo.visualization.scatter import Scatter

plot = Scatter(title="Algorithm Comparison on ZDT1")
plot.add(ga_result.F, color="blue", label="GA", alpha=0.6)
plot.add(nsga2_result.F, color="red", label="NSGA-II", alpha=0.6)
plot.add(zdt1.pareto_front(), color="black", label="True PF")
plot.show()
```

### 2. Many-objective Analysis
```python
from pymoo.visualization.pcp import PCP

plot = PCP(
    title="5-objective DTLZ2 Results",
    labels=["f1", "f2", "f3", "f4", "f5"],
    normalize_each_axis=True
)
plot.add(result.F, alpha=0.3)
plot.show()
```

### 3. Decision Making
```python
from pymoo.visualization.petal import Petal

# Compare top 3 solutions
candidates = result.F[:3]

plot = Petal(
    title="Top 3 Solutions",
    bounds=[result.F.min(axis=0), result.F.max(axis=0)],
    labels=["Cost", "Weight", "Efficiency", "Safety"]
)
for i, sol in enumerate(candidates):
    plot.add(sol, label=f"Solution {i+1}")
plot.show()
```

### 4. Convergence Visualization
```python
from pymoo.optimize import minimize

# Enable history
result = minimize(
    problem,
    algorithm,
    ('n_gen', 200),
    seed=1,
    save_history=True,
    verbose=False
)

# Create convergence plot
from pymoo.visualization.scatter import Scatter

plot = Scatter(title="Convergence Over Generations")
for gen in [0, 50, 100, 150, 200]:
    F = result.history[gen].opt.get("F")
    plot.add(F, alpha=0.5, label=f"Gen {gen}")
plot.show()
```

## Tips and Best Practices

1. **Use appropriate alpha:** For overlapping points, use `alpha=0.3-0.7`
2. **Normalize objectives:** Different scales? Normalize for fair visualization
3. **Label clearly:** Always provide meaningful labels and legends
4. **Limit data points:** >10000 points? Sample or use heatmap
5. **Color schemes:** Use colorblind-friendly palettes
6. **Save high-res:** Use `dpi=300` for publications
7. **Interactive exploration:** Consider plotly for interactive plots
8. **Combine views:** Show multiple perspectives for comprehensive analysis
