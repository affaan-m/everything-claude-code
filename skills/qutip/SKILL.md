---
name: qutip
description: Quantum physics simulation library for open quantum systems. Use when studying master equations, Lindblad dynamics, decoherence, quantum optics, or cavity QED. Best for physics research, open system dynamics, and educational simulations. NOT for circuit-based quantum computing—use qiskit, cirq, or pennylane for quantum algorithms and hardware execution.
license: BSD-3-Clause license
metadata:
    skill-author: K-Dense Inc.
---

# QuTiP: Quantum Toolbox in Python

## Overview

QuTiP provides comprehensive tools for simulating and analyzing quantum mechanical systems. It handles both closed (unitary) and open (dissipative) quantum systems with multiple solvers optimized for different scenarios.

## Installation

```bash
uv pip install qutip
```

Optional packages for additional functionality:

```bash
# Quantum information processing (circuits, gates)
uv pip install qutip-qip

# Quantum trajectory viewer
uv pip install qutip-qtrl
```

## Quick Start

```python
from qutip import *
import numpy as np
import matplotlib.pyplot as plt

# Create quantum state
psi = basis(2, 0)  # |0⟩ state

# Create operator
H = sigmaz()  # Hamiltonian

# Time evolution
tlist = np.linspace(0, 10, 100)
result = sesolve(H, psi, tlist, e_ops=[sigmaz()])

# Plot results
plt.plot(tlist, result.expect[0])
plt.xlabel('Time')
plt.ylabel('⟨σz⟩')
plt.show()
```

## Core Capabilities

### 1. Quantum Objects and States

Create and manipulate quantum states and operators:

```python
# States
psi = basis(N, n)  # Fock state |n⟩
psi = coherent(N, alpha)  # Coherent state |α⟩
rho = thermal_dm(N, n_avg)  # Thermal density matrix

# Operators
a = destroy(N)  # Annihilation operator
H = num(N)  # Number operator
sx, sy, sz = sigmax(), sigmay(), sigmaz()  # Pauli matrices

# Composite systems
psi_AB = tensor(psi_A, psi_B)  # Tensor product
```

**See** `references/core_concepts.md` for comprehensive coverage of quantum objects, states, operators, and tensor products.

### 2. Time Evolution and Dynamics

Multiple solvers for different scenarios:

```python
# Closed systems (unitary evolution)
result = sesolve(H, psi0, tlist, e_ops=[num(N)])

# Open systems (dissipation)
c_ops = [np.sqrt(0.1) * destroy(N)]  # Collapse operators
result = mesolve(H, psi0, tlist, c_ops, e_ops=[num(N)])

# Quantum trajectories (Monte Carlo)
result = mcsolve(H, psi0, tlist, c_ops, ntraj=500, e_ops=[num(N)])
```

**Solver selection guide:**
- `sesolve`: Pure states, unitary evolution
- `mesolve`: Mixed states, dissipation, general open systems
- `mcsolve`: Quantum jumps, photon counting, individual trajectories
- `brmesolve`: Weak system-bath coupling
- `fmmesolve`: Time-periodic Hamiltonians (Floquet)

**See** `references/time_evolution.md` for detailed solver documentation, time-dependent Hamiltonians, and advanced options.

### 3. Analysis and Measurement

Compute physical quantities:

```python
# Expectation values
n_avg = expect(num(N), psi)

# Entropy measures
S = entropy_vn(rho)  # Von Neumann entropy
C = concurrence(rho)  # Entanglement (two qubits)

# Fidelity and distance
F = fidelity(psi1, psi2)
D = tracedist(rho1, rho2)

# Correlation functions
corr = correlation_2op_1t(H, rho0, taulist, c_ops, A, B)
w, S = spectrum_correlation_fft(taulist, corr)

# Steady states
rho_ss = steadystate(H, c_ops)
```

**See** `references/analysis.md` for entropy, fidelity, measurements, correlation functions, and steady state calculations.

### 4. Visualization

Visualize quantum states and dynamics:

```python
# Bloch sphere
b = Bloch()
b.add_states(psi)
b.show()

# Wigner function (phase space)
xvec = np.linspace(-5, 5, 200)
W = wigner(psi, xvec, xvec)
plt.contourf(xvec, xvec, W, 100, cmap='RdBu')

# Fock distribution
plot_fock_distribution(psi)

# Matrix visualization
hinton(rho)  # Hinton diagram
matrix_histogram(H.full())  # 3D bars
```

**See** `references/visualization.md` for Bloch sphere animations, Wigner functions, Q-functions, and matrix visualizations.

### 5. Advanced Methods

Specialized techniques for complex scenarios:

```python
# Floquet theory (periodic Hamiltonians)
T = 2 * np.pi / w_drive
f_modes, f_energies = floquet_modes(H, T, args)
result = fmmesolve(H, psi0, tlist, c_ops, T=T, args=args)

# HEOM (non-Markovian, strong coupling)
from qutip.nonmarkov.heom import HEOMSolver, BosonicBath
bath = BosonicBath(Q, ck_real, vk_real)
hsolver = HEOMSolver(H_sys, [bath], max_depth=5)
result = hsolver.run(rho0, tlist)

# Permutational invariance (identical particles)
psi = dicke(N, j, m)  # Dicke states
Jz = jspin(N, 'z')  # Collective operators
```

**See** `references/advanced.md` for Floquet theory, HEOM, permutational invariance, stochastic solvers, superoperators, and performance optimization.

## Common Workflows

### Simulating a Damped Harmonic Oscillator

```python
# System parameters
N = 20  # Hilbert space dimension
omega = 1.0  # Oscillator frequency
kappa = 0.1  # Decay rate

# Hamiltonian and collapse operators
H = omega * num(N)
c_ops = [np.sqrt(kappa) * destroy(N)]

# Initial state
psi0 = coherent(N, 3.0)

# Time evolution
tlist = np.linspace(0, 50, 200)
result = mesolve(H, psi0, tlist, c_ops, e_ops=[num(N)])

# Visualize
plt.plot(tlist, result.expect[0])
plt.xlabel('Time')
plt.ylabel('⟨n⟩')
plt.title('Photon Number Decay')
plt.show()
```

### Two-Qubit Entanglement Dynamics

```python
# Create Bell state
psi0 = bell_state('00')

# Local dephasing on each qubit
gamma = 0.1
c_ops = [
    np.sqrt(gamma) * tensor(sigmaz(), qeye(2)),
    np.sqrt(gamma) * tensor(qeye(2), sigmaz())
]

# Track entanglement
def compute_concurrence(t, psi):
    rho = ket2dm(psi) if psi.isket else psi
    return concurrence(rho)

tlist = np.linspace(0, 10, 100)
result = mesolve(qeye([2, 2]), psi0, tlist, c_ops)

# Compute concurrence for each state
C_t = [concurrence(state.proj()) for state in result.states]

plt.plot(tlist, C_t)
plt.xlabel('Time')
plt.ylabel('Concurrence')
plt.title('Entanglement Decay')
plt.show()
```

### Jaynes-Cummings Model

```python
# System parameters
N = 10  # Cavity Fock space
wc = 1.0  # Cavity frequency
wa = 1.0  # Atom frequency
g = 0.05  # Coupling strength

# Operators
a = tensor(destroy(N), qeye(2))  # Cavity
sm = tensor(qeye(N), sigmam())  # Atom

# Hamiltonian (RWA)
H = wc * a.dag() * a + wa * sm.dag() * sm + g * (a.dag() * sm + a * sm.dag())

# Initial state: cavity in coherent state, atom in ground state
psi0 = tensor(coherent(N, 2), basis(2, 0))

# Dissipation
kappa = 0.1  # Cavity decay
gamma = 0.05  # Atomic decay
c_ops = [np.sqrt(kappa) * a, np.sqrt(gamma) * sm]

# Observables
n_cav = a.dag() * a
n_atom = sm.dag() * sm

# Evolve
tlist = np.linspace(0, 50, 200)
result = mesolve(H, psi0, tlist, c_ops, e_ops=[n_cav, n_atom])

# Plot
fig, axes = plt.subplots(2, 1, figsize=(8, 6), sharex=True)
axes[0].plot(tlist, result.expect[0])
axes[0].set_ylabel('⟨n_cavity⟩')
axes[1].plot(tlist, result.expect[1])
axes[1].set_ylabel('⟨n_atom⟩')
axes[1].set_xlabel('Time')
plt.tight_layout()
plt.show()
```

## Tips for Efficient Simulations

1. **Truncate Hilbert spaces**: Use smallest dimension that captures dynamics
2. **Choose appropriate solver**: `sesolve` for pure states is faster than `mesolve`
3. **Time-dependent terms**: String format (e.g., `'cos(w*t)'`) is fastest
4. **Store only needed data**: Use `e_ops` instead of storing all states
5. **Adjust tolerances**: Balance accuracy with computation time via `Options`
6. **Parallel trajectories**: `mcsolve` automatically uses multiple CPUs
7. **Check convergence**: Vary `ntraj`, Hilbert space size, and tolerances

## Troubleshooting

**Memory issues**: Reduce Hilbert space dimension, use `store_final_state` option, or consider Krylov methods

**Slow simulations**: Use string-based time-dependence, increase tolerances slightly, or try `method='bdf'` for stiff problems

**Numerical instabilities**: Decrease time steps (`nsteps` option), increase tolerances, or check Hamiltonian/operators are properly defined

**Import errors**: Ensure QuTiP is installed correctly; quantum gates require `qutip-qip` package

## References

This skill includes detailed reference documentation:

- **`references/core_concepts.md`**: Quantum objects, states, operators, tensor products, composite systems
- **`references/time_evolution.md`**: All solvers (sesolve, mesolve, mcsolve, brmesolve, etc.), time-dependent Hamiltonians, solver options
- **`references/visualization.md`**: Bloch sphere, Wigner functions, Q-functions, Fock distributions, matrix plots
- **`references/analysis.md`**: Expectation values, entropy, fidelity, entanglement measures, correlation functions, steady states
- **`references/advanced.md`**: Floquet theory, HEOM, permutational invariance, stochastic methods, superoperators, performance tips

## External Resources

- Documentation: https://qutip.readthedocs.io/
- Tutorials: https://qutip.org/qutip-tutorials/
- API Reference: https://qutip.readthedocs.io/en/stable/apidoc/apidoc.html
- GitHub: https://github.com/qutip/qutip

