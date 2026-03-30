# QuTiP Time Evolution and Dynamics Solvers

## Overview

QuTiP provides multiple solvers for quantum dynamics:
- `sesolve` - Schrödinger equation (unitary evolution)
- `mesolve` - Master equation (open systems with dissipation)
- `mcsolve` - Monte Carlo (quantum trajectories)
- `brmesolve` - Bloch-Redfield master equation
- `fmmesolve` - Floquet-Markov master equation
- `ssesolve/smesolve` - Stochastic Schrödinger/master equations

## Schrödinger Equation Solver (sesolve)

For closed quantum systems evolving unitarily.

### Basic Usage

```python
from qutip import *
import numpy as np

# System setup
N = 10
psi0 = basis(N, 0)  # Initial state
H = num(N)  # Hamiltonian

# Time points
tlist = np.linspace(0, 10, 100)

# Solve
result = sesolve(H, psi0, tlist)

# Access results
states = result.states  # List of states at each time
final_state = result.states[-1]
```

### With Expectation Values

```python
# Operators to compute expectation values
e_ops = [num(N), destroy(N), create(N)]

result = sesolve(H, psi0, tlist, e_ops=e_ops)

# Access expectation values
n_t = result.expect[0]  # ⟨n⟩(t)
a_t = result.expect[1]  # ⟨a⟩(t)
```

### Time-Dependent Hamiltonians

```python
# Method 1: String-based (faster, requires Cython)
H = [num(N), [destroy(N) + create(N), 'cos(w*t)']]
args = {'w': 1.0}
result = sesolve(H, psi0, tlist, args=args)

# Method 2: Function-based
def drive(t, args):
    return np.exp(-t/args['tau']) * np.sin(args['w'] * t)

H = [num(N), [destroy(N) + create(N), drive]]
args = {'w': 1.0, 'tau': 5.0}
result = sesolve(H, psi0, tlist, args=args)

# Method 3: QobjEvo (most flexible)
from qutip import QobjEvo
H_td = QobjEvo([num(N), [destroy(N) + create(N), drive]], args=args)
result = sesolve(H_td, psi0, tlist)
```

## Master Equation Solver (mesolve)

For open quantum systems with dissipation and decoherence.

### Basic Usage

```python
# System Hamiltonian
H = num(N)

# Collapse operators (Lindblad operators)
kappa = 0.1  # Decay rate
c_ops = [np.sqrt(kappa) * destroy(N)]

# Initial state
psi0 = coherent(N, 2.0)

# Solve
result = mesolve(H, psi0, tlist, c_ops, e_ops=[num(N)])

# Result is a density matrix evolution
rho_t = result.states  # List of density matrices
n_t = result.expect[0]  # ⟨n⟩(t)
```

### Multiple Dissipation Channels

```python
# Photon loss
kappa = 0.1
# Dephasing
gamma = 0.05
# Thermal excitation
nth = 0.5  # Thermal photon number

c_ops = [
    np.sqrt(kappa * (1 + nth)) * destroy(N),  # Thermal decay
    np.sqrt(kappa * nth) * create(N),  # Thermal excitation
    np.sqrt(gamma) * num(N)  # Pure dephasing
]

result = mesolve(H, psi0, tlist, c_ops)
```

### Time-Dependent Dissipation

```python
# Time-dependent decay rate
def kappa_t(t, args):
    return args['k0'] * (1 + np.sin(args['w'] * t))

c_ops = [[np.sqrt(1.0) * destroy(N), kappa_t]]
args = {'k0': 0.1, 'w': 1.0}

result = mesolve(H, psi0, tlist, c_ops, args=args)
```

## Monte Carlo Solver (mcsolve)

Simulates quantum trajectories for open systems.

### Basic Usage

```python
# Same setup as mesolve
H = num(N)
c_ops = [np.sqrt(0.1) * destroy(N)]
psi0 = coherent(N, 2.0)

# Number of trajectories
ntraj = 500

result = mcsolve(H, psi0, tlist, c_ops, e_ops=[num(N)], ntraj=ntraj)

# Results averaged over trajectories
n_avg = result.expect[0]
n_std = result.std_expect[0]  # Standard deviation

# Individual trajectories (if options.store_states=True)
options = Options(store_states=True)
result = mcsolve(H, psi0, tlist, c_ops, ntraj=ntraj, options=options)
trajectories = result.states  # List of trajectory lists
```

### Photon Counting

```python
# Track quantum jumps
result = mcsolve(H, psi0, tlist, c_ops, ntraj=ntraj, options=options)

# Access jump times and which operator caused the jump
for traj in result.col_times:
    print(f"Jump times: {traj}")

for traj in result.col_which:
    print(f"Jump operator indices: {traj}")
```

## Bloch-Redfield Solver (brmesolve)

For weak system-bath coupling in the secular approximation.

```python
# System Hamiltonian
H = sigmaz()

# Coupling operators and spectral density
a_ops = [[sigmax(), lambda w: 0.1 * w if w > 0 else 0]]  # Ohmic bath

psi0 = basis(2, 0)
result = brmesolve(H, psi0, tlist, a_ops, e_ops=[sigmaz(), sigmax()])
```

## Floquet Solver (fmmesolve)

For time-periodic Hamiltonians.

```python
# Time-periodic Hamiltonian
w_d = 1.0  # Drive frequency
H0 = sigmaz()
H1 = sigmax()
H = [H0, [H1, 'cos(w*t)']]
args = {'w': w_d}

# Floquet modes and quasi-energies
T = 2 * np.pi / w_d  # Period
f_modes, f_energies = floquet_modes(H, T, args)

# Initial state in Floquet basis
psi0 = basis(2, 0)

# Dissipation in Floquet basis
c_ops = [np.sqrt(0.1) * sigmam()]

result = fmmesolve(H, psi0, tlist, c_ops, e_ops=[num(2)], T=T, args=args)
```

## Stochastic Solvers

### Stochastic Schrödinger Equation (ssesolve)

```python
# Diffusion operator
sc_ops = [np.sqrt(0.1) * destroy(N)]

# Heterodyne detection
result = ssesolve(H, psi0, tlist, sc_ops=sc_ops, e_ops=[num(N)],
                   ntraj=500, noise=1)  # noise=1 for heterodyne
```

### Stochastic Master Equation (smesolve)

```python
result = smesolve(H, psi0, tlist, c_ops=[], sc_ops=sc_ops,
                   e_ops=[num(N)], ntraj=500)
```

## Propagators

### Time-Evolution Operator

```python
# Evolution operator U(t) such that ψ(t) = U(t)ψ(0)
U = (-1j * H * t).expm()
psi_t = U * psi0

# For master equation (superoperator propagator)
L = liouvillian(H, c_ops)
U_super = (L * t).expm()
rho_t = vector_to_operator(U_super * operator_to_vector(rho0))
```

### Propagator Function

```python
# Generate propagators for multiple times
U_list = propagator(H, tlist, c_ops)

# Apply to states
psi_t = [U_list[i] * psi0 for i in range(len(tlist))]
```

## Steady State Solutions

### Direct Steady State

```python
# Find steady state of Liouvillian
rho_ss = steadystate(H, c_ops)

# Check it's steady
L = liouvillian(H, c_ops)
assert (L * operator_to_vector(rho_ss)).norm() < 1e-10
```

### Pseudo-Inverse Method

```python
# For degenerate steady states
rho_ss = steadystate(H, c_ops, method='direct')
# or 'eigen', 'svd', 'power'
```

## Correlation Functions

### Two-Time Correlation

```python
# ⟨A(t+τ)B(t)⟩
A = destroy(N)
B = create(N)

# Emission spectrum
taulist = np.linspace(0, 10, 200)
corr = correlation_2op_1t(H, None, taulist, c_ops, A, B)

# Power spectrum
w, S = spectrum_correlation_fft(taulist, corr)
```

### Multi-Time Correlation

```python
# ⟨A(t3)B(t2)C(t1)⟩
corr = correlation_3op_1t(H, None, taulist, c_ops, A, B, C)
```

## Solver Options

```python
from qutip import Options

options = Options()
options.nsteps = 10000  # Max internal steps
options.atol = 1e-8  # Absolute tolerance
options.rtol = 1e-6  # Relative tolerance
options.method = 'adams'  # or 'bdf' for stiff problems
options.store_states = True  # Store all states
options.store_final_state = True  # Store only final state

result = mesolve(H, psi0, tlist, c_ops, options=options)
```

### Progress Bar

```python
options.progress_bar = True
result = mesolve(H, psi0, tlist, c_ops, options=options)
```

## Saving and Loading Results

```python
# Save results
result.save("my_simulation.dat")

# Load results
from qutip import Result
loaded_result = Result.load("my_simulation.dat")
```

## Tips for Efficient Simulations

1. **Sparse matrices**: QuTiP automatically uses sparse matrices
2. **Small Hilbert spaces**: Truncate when possible
3. **Time-dependent terms**: String format is fastest (requires compilation)
4. **Parallel trajectories**: mcsolve automatically parallelizes
5. **Convergence**: Check by varying `ntraj`, `nsteps`, tolerances
6. **Solver selection**:
   - Pure states: Use `sesolve` (faster)
   - Mixed states/dissipation: Use `mesolve`
   - Noise/measurements: Use `mcsolve`
   - Weak coupling: Use `brmesolve`
   - Periodic driving: Use Floquet methods
