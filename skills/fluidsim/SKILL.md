---
name: fluidsim
description: Framework for computational fluid dynamics simulations using Python. Use when running fluid dynamics simulations including Navier-Stokes equations (2D/3D), shallow water equations, stratified flows, or when analyzing turbulence, vortex dynamics, or geophysical flows. Provides pseudospectral methods with FFT, HPC support, and comprehensive output analysis.
license: CeCILL FREE SOFTWARE LICENSE AGREEMENT
metadata:
    skill-author: K-Dense Inc.
---

# FluidSim

## Overview

FluidSim is an object-oriented Python framework for high-performance computational fluid dynamics (CFD) simulations. It provides solvers for periodic-domain equations using pseudospectral methods with FFT, delivering performance comparable to Fortran/C++ while maintaining Python's ease of use.

**Key strengths**:
- Multiple solvers: 2D/3D Navier-Stokes, shallow water, stratified flows
- High performance: Pythran/Transonic compilation, MPI parallelization
- Complete workflow: Parameter configuration, simulation execution, output analysis
- Interactive analysis: Python-based post-processing and visualization

## Core Capabilities

### 1. Installation and Setup

Install fluidsim using uv with appropriate feature flags:

```bash
# Basic installation
uv uv pip install fluidsim

# With FFT support (required for most solvers)
uv uv pip install "fluidsim[fft]"

# With MPI for parallel computing
uv uv pip install "fluidsim[fft,mpi]"
```

Set environment variables for output directories (optional):

```bash
export FLUIDSIM_PATH=/path/to/simulation/outputs
export FLUIDDYN_PATH_SCRATCH=/path/to/working/directory
```

No API keys or authentication required.

See `references/installation.md` for complete installation instructions and environment configuration.

### 2. Running Simulations

Standard workflow consists of five steps:

**Step 1**: Import solver
```python
from fluidsim.solvers.ns2d.solver import Simul
```

**Step 2**: Create and configure parameters
```python
params = Simul.create_default_params()
params.oper.nx = params.oper.ny = 256
params.oper.Lx = params.oper.Ly = 2 * 3.14159
params.nu_2 = 1e-3
params.time_stepping.t_end = 10.0
params.init_fields.type = "noise"
```

**Step 3**: Instantiate simulation
```python
sim = Simul(params)
```

**Step 4**: Execute
```python
sim.time_stepping.start()
```

**Step 5**: Analyze results
```python
sim.output.phys_fields.plot("vorticity")
sim.output.spatial_means.plot()
```

See `references/simulation_workflow.md` for complete examples, restarting simulations, and cluster deployment.

### 3. Available Solvers

Choose solver based on physical problem:

**2D Navier-Stokes** (`ns2d`): 2D turbulence, vortex dynamics
```python
from fluidsim.solvers.ns2d.solver import Simul
```

**3D Navier-Stokes** (`ns3d`): 3D turbulence, realistic flows
```python
from fluidsim.solvers.ns3d.solver import Simul
```

**Stratified flows** (`ns2d.strat`, `ns3d.strat`): Oceanic/atmospheric flows
```python
from fluidsim.solvers.ns2d.strat.solver import Simul
params.N = 1.0  # Brunt-Väisälä frequency
```

**Shallow water** (`sw1l`): Geophysical flows, rotating systems
```python
from fluidsim.solvers.sw1l.solver import Simul
params.f = 1.0  # Coriolis parameter
```

See `references/solvers.md` for complete solver list and selection guidance.

### 4. Parameter Configuration

Parameters are organized hierarchically and accessed via dot notation:

**Domain and resolution**:
```python
params.oper.nx = 256  # grid points
params.oper.Lx = 2 * pi  # domain size
```

**Physical parameters**:
```python
params.nu_2 = 1e-3  # viscosity
params.nu_4 = 0     # hyperviscosity (optional)
```

**Time stepping**:
```python
params.time_stepping.t_end = 10.0
params.time_stepping.USE_CFL = True  # adaptive time step
params.time_stepping.CFL = 0.5
```

**Initial conditions**:
```python
params.init_fields.type = "noise"  # or "dipole", "vortex", "from_file", "in_script"
```

**Output settings**:
```python
params.output.periods_save.phys_fields = 1.0  # save every 1.0 time units
params.output.periods_save.spectra = 0.5
params.output.periods_save.spatial_means = 0.1
```

The Parameters object raises `AttributeError` for typos, preventing silent configuration errors.

See `references/parameters.md` for comprehensive parameter documentation.

### 5. Output and Analysis

FluidSim produces multiple output types automatically saved during simulation:

**Physical fields**: Velocity, vorticity in HDF5 format
```python
sim.output.phys_fields.plot("vorticity")
sim.output.phys_fields.plot("vx")
```

**Spatial means**: Time series of volume-averaged quantities
```python
sim.output.spatial_means.plot()
```

**Spectra**: Energy and enstrophy spectra
```python
sim.output.spectra.plot1d()
sim.output.spectra.plot2d()
```

**Load previous simulations**:
```python
from fluidsim import load_sim_for_plot
sim = load_sim_for_plot("simulation_dir")
sim.output.phys_fields.plot()
```

**Advanced visualization**: Open `.h5` files in ParaView or VisIt for 3D visualization.

See `references/output_analysis.md` for detailed analysis workflows, parametric study analysis, and data export.

### 6. Advanced Features

**Custom forcing**: Maintain turbulence or drive specific dynamics
```python
params.forcing.enable = True
params.forcing.type = "tcrandom"  # time-correlated random forcing
params.forcing.forcing_rate = 1.0
```

**Custom initial conditions**: Define fields in script
```python
params.init_fields.type = "in_script"
sim = Simul(params)
X, Y = sim.oper.get_XY_loc()
vx = sim.state.state_phys.get_var("vx")
vx[:] = sin(X) * cos(Y)
sim.time_stepping.start()
```

**MPI parallelization**: Run on multiple processors
```bash
mpirun -np 8 python simulation_script.py
```

**Parametric studies**: Run multiple simulations with different parameters
```python
for nu in [1e-3, 5e-4, 1e-4]:
    params = Simul.create_default_params()
    params.nu_2 = nu
    params.output.sub_directory = f"nu{nu}"
    sim = Simul(params)
    sim.time_stepping.start()
```

See `references/advanced_features.md` for forcing types, custom solvers, cluster submission, and performance optimization.

## Common Use Cases

### 2D Turbulence Study

```python
from fluidsim.solvers.ns2d.solver import Simul
from math import pi

params = Simul.create_default_params()
params.oper.nx = params.oper.ny = 512
params.oper.Lx = params.oper.Ly = 2 * pi
params.nu_2 = 1e-4
params.time_stepping.t_end = 50.0
params.time_stepping.USE_CFL = True
params.init_fields.type = "noise"
params.output.periods_save.phys_fields = 5.0
params.output.periods_save.spectra = 1.0

sim = Simul(params)
sim.time_stepping.start()

# Analyze energy cascade
sim.output.spectra.plot1d(tmin=30.0, tmax=50.0)
```

### Stratified Flow Simulation

```python
from fluidsim.solvers.ns2d.strat.solver import Simul

params = Simul.create_default_params()
params.oper.nx = params.oper.ny = 256
params.N = 2.0  # stratification strength
params.nu_2 = 5e-4
params.time_stepping.t_end = 20.0

# Initialize with dense layer
params.init_fields.type = "in_script"
sim = Simul(params)
X, Y = sim.oper.get_XY_loc()
b = sim.state.state_phys.get_var("b")
b[:] = exp(-((X - 3.14)**2 + (Y - 3.14)**2) / 0.5)
sim.state.statephys_from_statespect()

sim.time_stepping.start()
sim.output.phys_fields.plot("b")
```

### High-Resolution 3D Simulation with MPI

```python
from fluidsim.solvers.ns3d.solver import Simul

params = Simul.create_default_params()
params.oper.nx = params.oper.ny = params.oper.nz = 512
params.nu_2 = 1e-5
params.time_stepping.t_end = 10.0
params.init_fields.type = "noise"

sim = Simul(params)
sim.time_stepping.start()
```

Run with:
```bash
mpirun -np 64 python script.py
```

### Taylor-Green Vortex Validation

```python
from fluidsim.solvers.ns2d.solver import Simul
import numpy as np
from math import pi

params = Simul.create_default_params()
params.oper.nx = params.oper.ny = 128
params.oper.Lx = params.oper.Ly = 2 * pi
params.nu_2 = 1e-3
params.time_stepping.t_end = 10.0
params.init_fields.type = "in_script"

sim = Simul(params)
X, Y = sim.oper.get_XY_loc()
vx = sim.state.state_phys.get_var("vx")
vy = sim.state.state_phys.get_var("vy")
vx[:] = np.sin(X) * np.cos(Y)
vy[:] = -np.cos(X) * np.sin(Y)
sim.state.statephys_from_statespect()

sim.time_stepping.start()

# Validate energy decay
df = sim.output.spatial_means.load()
# Compare with analytical solution
```

## Quick Reference

**Import solver**: `from fluidsim.solvers.ns2d.solver import Simul`

**Create parameters**: `params = Simul.create_default_params()`

**Set resolution**: `params.oper.nx = params.oper.ny = 256`

**Set viscosity**: `params.nu_2 = 1e-3`

**Set end time**: `params.time_stepping.t_end = 10.0`

**Run simulation**: `sim = Simul(params); sim.time_stepping.start()`

**Plot results**: `sim.output.phys_fields.plot("vorticity")`

**Load simulation**: `sim = load_sim_for_plot("path/to/sim")`

## Resources

**Documentation**: https://fluidsim.readthedocs.io/

**Reference files**:
- `references/installation.md`: Complete installation instructions
- `references/solvers.md`: Available solvers and selection guide
- `references/simulation_workflow.md`: Detailed workflow examples
- `references/parameters.md`: Comprehensive parameter documentation
- `references/output_analysis.md`: Output types and analysis methods
- `references/advanced_features.md`: Forcing, MPI, parametric studies, custom solvers

