# QuTiP Advanced Features

## Floquet Theory

For time-periodic Hamiltonians H(t + T) = H(t).

### Floquet Modes and Quasi-Energies

```python
from qutip import *
import numpy as np

# Time-periodic Hamiltonian
w_d = 1.0  # Drive frequency
T = 2 * np.pi / w_d  # Period

H0 = sigmaz()
H1 = sigmax()
H = [H0, [H1, 'cos(w*t)']]
args = {'w': w_d}

# Calculate Floquet modes and quasi-energies
f_modes, f_energies = floquet_modes(H, T, args)

print("Quasi-energies:", f_energies)
print("Floquet modes:", f_modes)
```

### Floquet States at Time t

```python
# Get Floquet state at specific time
t = 1.0
f_states_t = floquet_states(f_modes, f_energies, t)
```

### Floquet State Decomposition

```python
# Decompose initial state in Floquet basis
psi0 = basis(2, 0)
f_coeff = floquet_state_decomposition(f_modes, f_energies, psi0)
```

### Floquet-Markov Master Equation

```python
# Time evolution with dissipation
c_ops = [np.sqrt(0.1) * sigmam()]
tlist = np.linspace(0, 20, 200)

result = fmmesolve(H, psi0, tlist, c_ops, e_ops=[sigmaz()], T=T, args=args)

# Plot results
import matplotlib.pyplot as plt
plt.plot(tlist, result.expect[0])
plt.xlabel('Time')
plt.ylabel('⟨σz⟩')
plt.show()
```

### Floquet Tensor

```python
# Floquet tensor (generalized Bloch-Redfield)
A_ops = [[sigmaz(), lambda w: 0.1 * w if w > 0 else 0]]

# Build Floquet tensor
R, U = floquet_markov_mesolve(H, psi0, tlist, A_ops, e_ops=[sigmaz()],
                               T=T, args=args)
```

### Effective Hamiltonian

```python
# Time-averaged effective Hamiltonian
H_eff = floquet_master_equation_steadystate(H, c_ops, T, args)
```

## Hierarchical Equations of Motion (HEOM)

For non-Markovian open quantum systems with strong system-bath coupling.

### Basic HEOM Setup

```python
from qutip import heom

# System Hamiltonian
H_sys = sigmaz()

# Bath correlation function (exponential)
Q = sigmax()  # System-bath coupling operator
ck_real = [0.1]  # Coupling strengths
vk_real = [0.5]  # Bath frequencies

# HEOM bath
bath = heom.BosonicBath(Q, ck_real, vk_real)

# Initial state
rho0 = basis(2, 0) * basis(2, 0).dag()

# Create HEOM solver
max_depth = 5
hsolver = heom.HEOMSolver(H_sys, [bath], max_depth=max_depth)

# Time evolution
tlist = np.linspace(0, 10, 100)
result = hsolver.run(rho0, tlist)

# Extract reduced system density matrix
rho_sys = [r.extract_state(0) for r in result.states]
```

### Multiple Baths

```python
# Define multiple baths
bath1 = heom.BosonicBath(sigmax(), [0.1], [0.5])
bath2 = heom.BosonicBath(sigmay(), [0.05], [1.0])

hsolver = heom.HEOMSolver(H_sys, [bath1, bath2], max_depth=5)
```

### Drude-Lorentz Spectral Density

```python
# Common in condensed matter physics
from qutip.nonmarkov.heom import DrudeLorentzBath

lam = 0.1  # Reorganization energy
gamma = 0.5  # Bath cutoff frequency
T = 1.0  # Temperature (in energy units)
Nk = 2  # Number of Matsubara terms

bath = DrudeLorentzBath(Q, lam, gamma, T, Nk)
```

### HEOM Options

```python
options = heom.HEOMSolver.Options(
    nsteps=2000,
    store_states=True,
    rtol=1e-7,
    atol=1e-9
)

hsolver = heom.HEOMSolver(H_sys, [bath], max_depth=5, options=options)
```

## Permutational Invariance

For identical particle systems (e.g., spin ensembles).

### Dicke States

```python
from qutip import dicke

# Dicke state |j, m⟩ for N spins
N = 10  # Number of spins
j = N/2  # Total angular momentum
m = 0   # z-component

psi = dicke(N, j, m)
```

### Permutation-Invariant Operators

```python
from qutip.piqs import jspin

# Collective spin operators
N = 10
Jx = jspin(N, 'x')
Jy = jspin(N, 'y')
Jz = jspin(N, 'z')
Jp = jspin(N, '+')
Jm = jspin(N, '-')
```

### PIQS Dynamics

```python
from qutip.piqs import Dicke

# Setup Dicke model
N = 10
emission = 1.0
dephasing = 0.5
pumping = 0.0
collective_emission = 0.0

system = Dicke(N=N, emission=emission, dephasing=dephasing,
               pumping=pumping, collective_emission=collective_emission)

# Initial state
psi0 = dicke(N, N/2, N/2)  # All spins up

# Time evolution
tlist = np.linspace(0, 10, 100)
result = system.solve(psi0, tlist, e_ops=[Jz])
```

## Non-Markovian Monte Carlo

Quantum trajectories with memory effects.

```python
from qutip import nm_mcsolve

# Non-Markovian bath correlation
def bath_correlation(t1, t2):
    tau = abs(t2 - t1)
    return np.exp(-tau / 2.0) * np.cos(tau)

# System setup
H = sigmaz()
c_ops = [sigmax()]
psi0 = basis(2, 0)
tlist = np.linspace(0, 10, 100)

# Solve with memory
result = nm_mcsolve(H, psi0, tlist, c_ops, sc_ops=[],
                     bath_corr=bath_correlation, ntraj=500,
                     e_ops=[sigmaz()])
```

## Stochastic Solvers with Measurements

### Continuous Measurement

```python
# Homodyne detection
sc_ops = [np.sqrt(0.1) * destroy(N)]  # Measurement operator

result = ssesolve(H, psi0, tlist, sc_ops=sc_ops,
                   e_ops=[num(N)], ntraj=100,
                   noise=11)  # 11 for homodyne

# Heterodyne detection
result = ssesolve(H, psi0, tlist, sc_ops=sc_ops,
                   e_ops=[num(N)], ntraj=100,
                   noise=12)  # 12 for heterodyne
```

### Photon Counting

```python
# Quantum jump times
result = mcsolve(H, psi0, tlist, c_ops, ntraj=50,
                 options=Options(store_states=True))

# Extract measurement times
for i, jump_times in enumerate(result.col_times):
    print(f"Trajectory {i} jump times: {jump_times}")
    print(f"Which operator: {result.col_which[i]}")
```

## Krylov Subspace Methods

Efficient for large systems.

```python
from qutip import krylovsolve

# Use Krylov solver
result = krylovsolve(H, psi0, tlist, krylov_dim=10, e_ops=[num(N)])
```

## Bloch-Redfield Master Equation

For weak system-bath coupling.

```python
# Bath spectral density
def ohmic_spectrum(w):
    if w >= 0:
        return 0.1 * w  # Ohmic
    else:
        return 0

# Coupling operators and spectra
a_ops = [[sigmax(), ohmic_spectrum]]

# Solve
result = brmesolve(H, psi0, tlist, a_ops, e_ops=[sigmaz()])
```

### Temperature-Dependent Bath

```python
def thermal_spectrum(w):
    # Bose-Einstein distribution
    T = 1.0  # Temperature
    if abs(w) < 1e-10:
        return 0.1 * T
    n_th = 1 / (np.exp(abs(w)/T) - 1)
    if w >= 0:
        return 0.1 * w * (n_th + 1)
    else:
        return 0.1 * abs(w) * n_th

a_ops = [[sigmax(), thermal_spectrum]]
result = brmesolve(H, psi0, tlist, a_ops, e_ops=[sigmaz()])
```

## Superoperators and Quantum Channels

### Superoperator Representations

```python
# Liouvillian
L = liouvillian(H, c_ops)

# Convert between representations
from qutip import (spre, spost, sprepost,
                    super_to_choi, choi_to_super,
                    super_to_kraus, kraus_to_super)

# Superoperator forms
L_spre = spre(H)  # Left multiplication
L_spost = spost(H)  # Right multiplication
L_sprepost = sprepost(H, H.dag())

# Choi matrix
choi = super_to_choi(L)

# Kraus operators
kraus = super_to_kraus(L)
```

### Quantum Channels

```python
# Depolarizing channel
p = 0.1  # Error probability
K0 = np.sqrt(1 - 3*p/4) * qeye(2)
K1 = np.sqrt(p/4) * sigmax()
K2 = np.sqrt(p/4) * sigmay()
K3 = np.sqrt(p/4) * sigmaz()

kraus_ops = [K0, K1, K2, K3]
E = kraus_to_super(kraus_ops)

# Apply channel
rho_out = E * operator_to_vector(rho_in)
rho_out = vector_to_operator(rho_out)
```

### Amplitude Damping

```python
# T1 decay
gamma = 0.1
K0 = Qobj([[1, 0], [0, np.sqrt(1 - gamma)]])
K1 = Qobj([[0, np.sqrt(gamma)], [0, 0]])

E_damping = kraus_to_super([K0, K1])
```

### Phase Damping

```python
# T2 dephasing
gamma = 0.1
K0 = Qobj([[1, 0], [0, np.sqrt(1 - gamma/2)]])
K1 = Qobj([[0, 0], [0, np.sqrt(gamma/2)]])

E_dephasing = kraus_to_super([K0, K1])
```

## Quantum Trajectories Analysis

### Extract Individual Trajectories

```python
options = Options(store_states=True, store_final_state=False)
result = mcsolve(H, psi0, tlist, c_ops, ntraj=100, options=options)

# Access individual trajectories
for i in range(len(result.states)):
    trajectory = result.states[i]  # List of states for trajectory i
    # Analyze trajectory
```

### Trajectory Statistics

```python
# Mean and standard deviation
result = mcsolve(H, psi0, tlist, c_ops, e_ops=[num(N)], ntraj=500)

n_mean = result.expect[0]
n_std = result.std_expect[0]

# Photon number distribution at final time
final_states = [result.states[i][-1] for i in range(len(result.states))]
```

## Time-Dependent Terms Advanced

### QobjEvo

```python
from qutip import QobjEvo

# Time-dependent Hamiltonian with QobjEvo
def drive(t, args):
    return args['A'] * np.exp(-t/args['tau']) * np.sin(args['w'] * t)

H0 = num(N)
H1 = destroy(N) + create(N)
args = {'A': 1.0, 'w': 1.0, 'tau': 5.0}

H_td = QobjEvo([H0, [H1, drive]], args=args)

# Can update args without recreating
H_td.arguments({'A': 2.0, 'w': 1.5, 'tau': 10.0})
```

### Compiled Time-Dependent Terms

```python
# Fastest method (requires Cython)
H = [num(N), [destroy(N) + create(N), 'A * exp(-t/tau) * sin(w*t)']]
args = {'A': 1.0, 'w': 1.0, 'tau': 5.0}

# QuTiP compiles this for speed
result = sesolve(H, psi0, tlist, args=args)
```

### Callback Functions

```python
# Advanced control
def time_dependent_coeff(t, args):
    # Access solver state if needed
    return complex_function(t, args)

H = [H0, [H1, time_dependent_coeff]]
```

## Parallel Processing

### Parallel Map

```python
from qutip import parallel_map

# Define task
def simulate(gamma):
    c_ops = [np.sqrt(gamma) * destroy(N)]
    result = mesolve(H, psi0, tlist, c_ops, e_ops=[num(N)])
    return result.expect[0]

# Run in parallel
gamma_values = np.linspace(0, 1, 20)
results = parallel_map(simulate, gamma_values, num_cpus=4)
```

### Serial Map (for debugging)

```python
from qutip import serial_map

# Same interface but runs serially
results = serial_map(simulate, gamma_values)
```

## File I/O

### Save/Load Quantum Objects

```python
# Save
H.save('hamiltonian.qu')
psi.save('state.qu')

# Load
H_loaded = qload('hamiltonian.qu')
psi_loaded = qload('state.qu')
```

### Save/Load Results

```python
# Save simulation results
result = mesolve(H, psi0, tlist, c_ops, e_ops=[num(N)])
result.save('simulation.dat')

# Load results
from qutip import Result
loaded_result = Result.load('simulation.dat')
```

### Export to MATLAB

```python
# Export to .mat file
H.matlab_export('hamiltonian.mat', 'H')
```

## Solver Options

### Fine-Tuning Solvers

```python
options = Options()

# Integration parameters
options.nsteps = 10000  # Max internal steps
options.rtol = 1e-8     # Relative tolerance
options.atol = 1e-10    # Absolute tolerance

# Method selection
options.method = 'adams'  # Non-stiff (default)
# options.method = 'bdf'  # Stiff problems

# Storage options
options.store_states = True
options.store_final_state = True

# Progress
options.progress_bar = True

# Random number seed (for reproducibility)
options.seeds = 12345

result = mesolve(H, psi0, tlist, c_ops, options=options)
```

### Debugging

```python
# Enable detailed output
options.verbose = True

# Memory tracking
options.num_cpus = 1  # Easier debugging
```

## Performance Tips

1. **Use sparse matrices**: QuTiP does this automatically
2. **Minimize Hilbert space**: Truncate when possible
3. **Choose right solver**:
   - Pure states: `sesolve` faster than `mesolve`
   - Stochastic: `mcsolve` for quantum jumps
   - Periodic: Floquet methods
4. **Time-dependent terms**: String format fastest
5. **Expectation values**: Only compute needed observables
6. **Parallel trajectories**: `mcsolve` uses all CPUs
7. **Krylov methods**: For very large systems
8. **Memory**: Use `store_final_state` instead of `store_states` when possible
