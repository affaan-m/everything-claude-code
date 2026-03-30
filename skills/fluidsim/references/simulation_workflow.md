# Simulation Workflow

## Standard Workflow

Follow these steps to run a fluidsim simulation:

### 1. Import Solver

```python
from fluidsim.solvers.ns2d.solver import Simul

# Or use dynamic import
import fluidsim
Simul = fluidsim.import_simul_class_from_key("ns2d")
```

### 2. Create Default Parameters

```python
params = Simul.create_default_params()
```

This returns a hierarchical `Parameters` object containing all simulation settings.

### 3. Configure Parameters

Modify parameters as needed. The Parameters object prevents typos by raising `AttributeError` for non-existent parameters:

```python
# Domain and resolution
params.oper.nx = 256  # grid points in x
params.oper.ny = 256  # grid points in y
params.oper.Lx = 2 * pi  # domain size x
params.oper.Ly = 2 * pi  # domain size y

# Physical parameters
params.nu_2 = 1e-3  # viscosity (negative Laplacian)

# Time stepping
params.time_stepping.t_end = 10.0  # end time
params.time_stepping.deltat0 = 0.01  # initial time step
params.time_stepping.USE_CFL = True  # adaptive time step

# Initial conditions
params.init_fields.type = "noise"  # or "dipole", "vortex", etc.

# Output settings
params.output.periods_save.phys_fields = 1.0  # save every 1.0 time units
params.output.periods_save.spectra = 0.5
params.output.periods_save.spatial_means = 0.1
```

### 4. Instantiate Simulation

```python
sim = Simul(params)
```

This initializes:
- Operators (FFT, differential operators)
- State variables (velocity, vorticity, etc.)
- Output handlers
- Time stepping scheme

### 5. Run Simulation

```python
sim.time_stepping.start()
```

The simulation runs until `t_end` or specified number of iterations.

### 6. Analyze Results During/After Simulation

```python
# Plot physical fields
sim.output.phys_fields.plot()
sim.output.phys_fields.plot("vorticity")
sim.output.phys_fields.plot("div")

# Plot spatial means
sim.output.spatial_means.plot()

# Plot spectra
sim.output.spectra.plot1d()
sim.output.spectra.plot2d()
```

## Loading Previous Simulations

### Quick Loading (For Plotting Only)

```python
from fluidsim import load_sim_for_plot

sim = load_sim_for_plot("path/to/simulation")
sim.output.phys_fields.plot()
sim.output.spatial_means.plot()
```

Fast loading without full state initialization. Use for post-processing.

### Full State Loading (For Restarting)

```python
from fluidsim import load_state_phys_file

sim = load_state_phys_file("path/to/state_file.h5")
sim.time_stepping.start()  # continue simulation
```

Loads complete state for continuing simulations.

## Restarting Simulations

To restart from a saved state:

```python
params = Simul.create_default_params()
params.init_fields.type = "from_file"
params.init_fields.from_file.path = "path/to/state_file.h5"

# Optionally modify parameters for the continuation
params.time_stepping.t_end = 20.0  # extend simulation

sim = Simul(params)
sim.time_stepping.start()
```

## Running on Clusters

FluidSim integrates with cluster submission systems:

```python
from fluiddyn.clusters.legi import Calcul8 as Cluster

# Configure cluster job
cluster = Cluster()
cluster.submit_script(
    "my_simulation.py",
    name_run="my_job",
    nb_nodes=4,
    nb_cores_per_node=24,
    walltime="24:00:00"
)
```

Script should contain standard workflow steps (import, configure, run).

## Complete Example

```python
from fluidsim.solvers.ns2d.solver import Simul
from math import pi

# Create and configure parameters
params = Simul.create_default_params()
params.oper.nx = params.oper.ny = 256
params.oper.Lx = params.oper.Ly = 2 * pi
params.nu_2 = 1e-3
params.time_stepping.t_end = 10.0
params.init_fields.type = "dipole"
params.output.periods_save.phys_fields = 1.0

# Run simulation
sim = Simul(params)
sim.time_stepping.start()

# Analyze results
sim.output.phys_fields.plot("vorticity")
sim.output.spatial_means.plot()
```
