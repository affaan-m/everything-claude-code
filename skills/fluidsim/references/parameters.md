# Parameter Configuration

## Parameters Object

The `Parameters` object is hierarchical and organized into logical groups. Access using dot notation:

```python
params = Simul.create_default_params()
params.group.subgroup.parameter = value
```

## Key Parameter Groups

### Operators (`params.oper`)

Define domain and resolution:

```python
params.oper.nx = 256  # number of grid points in x
params.oper.ny = 256  # number of grid points in y
params.oper.nz = 128  # number of grid points in z (3D only)

params.oper.Lx = 2 * pi  # domain length in x
params.oper.Ly = 2 * pi  # domain length in y
params.oper.Lz = pi      # domain length in z (3D only)

params.oper.coef_dealiasing = 2./3.  # dealiasing cutoff (default 2/3)
```

**Resolution guidance**: Use powers of 2 for optimal FFT performance (128, 256, 512, 1024, etc.)

### Physical Parameters

#### Viscosity

```python
params.nu_2 = 1e-3  # Laplacian viscosity (negative Laplacian)
params.nu_4 = 0     # hyperviscosity (optional)
params.nu_8 = 0     # hyper-hyperviscosity (very high wavenumber damping)
```

Higher-order viscosity (`nu_4`, `nu_8`) damps high wavenumbers without affecting large scales.

#### Stratification (Stratified Solvers)

```python
params.N = 1.0  # Brunt-Väisälä frequency (buoyancy frequency)
```

#### Rotation (Shallow Water)

```python
params.f = 1.0  # Coriolis parameter
params.c2 = 10.0  # squared phase velocity (gravity wave speed)
```

### Time Stepping (`params.time_stepping`)

```python
params.time_stepping.t_end = 10.0  # simulation end time
params.time_stepping.it_end = 100  # or maximum iterations

params.time_stepping.deltat0 = 0.01  # initial time step
params.time_stepping.USE_CFL = True  # adaptive CFL-based time step
params.time_stepping.CFL = 0.5  # CFL number (if USE_CFL=True)

params.time_stepping.type_time_scheme = "RK4"  # or "RK2", "Euler"
```

**Recommended**: Use `USE_CFL=True` with `CFL=0.5` for adaptive time stepping.

### Initial Fields (`params.init_fields`)

```python
params.init_fields.type = "noise"  # initialization method
```

**Available types**:
- `"noise"`: Random noise
- `"dipole"`: Vortex dipole
- `"vortex"`: Single vortex
- `"taylor_green"`: Taylor-Green vortex
- `"from_file"`: Load from file
- `"in_script"`: Define in script

#### From File

```python
params.init_fields.type = "from_file"
params.init_fields.from_file.path = "path/to/state_file.h5"
```

#### In Script

```python
params.init_fields.type = "in_script"

# Define initialization after creating sim
sim = Simul(params)

# Access state fields
vx = sim.state.state_phys.get_var("vx")
vy = sim.state.state_phys.get_var("vy")

# Set fields
X, Y = sim.oper.get_XY_loc()
vx[:] = np.sin(X) * np.cos(Y)
vy[:] = -np.cos(X) * np.sin(Y)

# Run simulation
sim.time_stepping.start()
```

### Output Settings (`params.output`)

#### Output Directory

```python
params.output.sub_directory = "my_simulation"
```

Directory created within `$FLUIDSIM_PATH` or current directory.

#### Save Periods

```python
params.output.periods_save.phys_fields = 1.0  # save fields every 1.0 time units
params.output.periods_save.spectra = 0.5      # save spectra
params.output.periods_save.spatial_means = 0.1  # save spatial averages
params.output.periods_save.spect_energy_budg = 0.5  # spectral energy budget
```

Set to `0` to disable a particular output type.

#### Print Control

```python
params.output.periods_print.print_stdout = 0.5  # print status every 0.5 time units
```

#### Online Plotting

```python
params.output.periods_plot.phys_fields = 2.0  # plot every 2.0 time units

# Must also enable the output module
params.output.ONLINE_PLOT_OK = True
params.output.phys_fields.field_to_plot = "vorticity"  # or "vx", "vy", etc.
```

### Forcing (`params.forcing`)

Add forcing terms to maintain energy:

```python
params.forcing.enable = True
params.forcing.type = "tcrandom"  # time-correlated random forcing

# Forcing parameters
params.forcing.nkmax_forcing = 5  # maximum forced wavenumber
params.forcing.nkmin_forcing = 2  # minimum forced wavenumber
params.forcing.forcing_rate = 1.0  # energy injection rate
```

**Common forcing types**:
- `"tcrandom"`: Time-correlated random forcing
- `"proportional"`: Proportional forcing (maintains specific spectrum)
- `"in_script"`: Custom forcing defined in script

## Parameter Safety

The Parameters object raises `AttributeError` when accessing non-existent parameters:

```python
params.nu_2 = 1e-3  # OK
params.nu2 = 1e-3   # ERROR: AttributeError
```

This prevents typos that would be silently ignored in text-based configuration files.

## Viewing All Parameters

```python
# Print all parameters
params._print_as_xml()

# Get as dictionary
param_dict = params._make_dict()
```

## Saving Parameter Configuration

Parameters are automatically saved with simulation output:

```python
params._save_as_xml("simulation_params.xml")
params._save_as_json("simulation_params.json")
```
