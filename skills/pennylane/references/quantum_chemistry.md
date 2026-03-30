# Quantum Chemistry with PennyLane

## Table of Contents
1. [Molecular Hamiltonians](#molecular-hamiltonians)
2. [Variational Quantum Eigensolver (VQE)](#variational-quantum-eigensolver-vqe)
3. [Molecular Structure](#molecular-structure)
4. [Basis Sets and Mapping](#basis-sets-and-mapping)
5. [Excited States](#excited-states)
6. [Quantum Chemistry Workflows](#quantum-chemistry-workflows)

## Molecular Hamiltonians

### Building Molecular Hamiltonians

```python
import pennylane as qml
from pennylane import qchem
import numpy as np

# Define molecule
symbols = ['H', 'H']
coordinates = np.array([0.0, 0.0, 0.0, 0.0, 0.0, 0.74])  # Angstroms

# Generate Hamiltonian
hamiltonian, n_qubits = qchem.molecular_hamiltonian(
    symbols,
    coordinates,
    charge=0,
    mult=1,  # Spin multiplicity
    basis='sto-3g',
    method='dhf'  # Dirac-Hartree-Fock
)

print(f"Hamiltonian: {hamiltonian}")
print(f"Number of qubits needed: {n_qubits}")
```

### Jordan-Wigner Transformation

```python
# Hamiltonian is automatically in qubit form via Jordan-Wigner
# Manual transformation:
from pennylane import fermi

# Fermionic operators
a_0 = fermi.FermiC(0)  # Creation operator
a_1 = fermi.FermiA(1)  # Annihilation operator

# Convert to qubits
qubit_op = qml.qchem.jordan_wigner(a_0 * a_1)
```

### Bravyi-Kitaev Transformation

```python
# Alternative mapping (more efficient for some systems)
from pennylane.qchem import bravyi_kitaev

# Build Hamiltonian with Bravyi-Kitaev
hamiltonian, n_qubits = qchem.molecular_hamiltonian(
    symbols,
    coordinates,
    mapping='bravyi_kitaev'
)
```

### Custom Hamiltonians

```python
# Build Hamiltonian from coefficients and operators
coeffs = [0.2, -0.8, 0.5]
obs = [
    qml.PauliZ(0),
    qml.PauliZ(0) @ qml.PauliZ(1),
    qml.PauliX(0) @ qml.PauliX(1)
]

H = qml.Hamiltonian(coeffs, obs)

# Or use simplified syntax
H = 0.2 * qml.PauliZ(0) - 0.8 * qml.PauliZ(0) @ qml.PauliZ(1) + 0.5 * qml.PauliX(0) @ qml.PauliX(1)
```

## Variational Quantum Eigensolver (VQE)

### Basic VQE Implementation

```python
from pennylane import numpy as np

# Define device
dev = qml.device('default.qubit', wires=n_qubits)

# Hartree-Fock state preparation
hf_state = qchem.hf_state(electrons=2, orbitals=n_qubits)

def ansatz(params, wires):
    """Variational ansatz."""
    qml.BasisState(hf_state, wires=wires)

    for i in range(len(wires)):
        qml.RY(params[i], wires=i)

    for i in range(len(wires)-1):
        qml.CNOT(wires=[i, i+1])

@qml.qnode(dev)
def vqe_circuit(params):
    ansatz(params, wires=range(n_qubits))
    return qml.expval(hamiltonian)

# Optimize
opt = qml.GradientDescentOptimizer(stepsize=0.4)
params = np.random.normal(0, np.pi, n_qubits, requires_grad=True)

for n in range(100):
    params, energy = opt.step_and_cost(vqe_circuit, params)

    if n % 20 == 0:
        print(f"Step {n}: Energy = {energy:.8f} Ha")

print(f"Final ground state energy: {energy:.8f} Ha")
```

### UCCSD Ansatz

```python
from pennylane.qchem import UCCSD

# Singles and doubles excitations
singles, doubles = qchem.excitations(electrons=2, orbitals=n_qubits)

@qml.qnode(dev)
def uccsd_circuit(params):
    # Hartree-Fock reference
    qml.BasisState(hf_state, wires=range(n_qubits))

    # UCCSD ansatz
    UCCSD(params, wires=range(n_qubits), s_wires=singles, d_wires=doubles)

    return qml.expval(hamiltonian)

# Initialize parameters
n_params = len(singles) + len(doubles)
params = np.zeros(n_params, requires_grad=True)

# Optimize
opt = qml.AdamOptimizer(stepsize=0.1)
for n in range(100):
    params, energy = opt.step_and_cost(uccsd_circuit, params)
```

### Adaptive VQE

```python
def adaptive_vqe(hamiltonian, n_qubits, max_gates=10):
    """Adaptive VQE: Grow ansatz iteratively."""
    dev = qml.device('default.qubit', wires=n_qubits)

    # Start with HF state
    operations = []
    params = []

    hf_state = qchem.hf_state(electrons=2, orbitals=n_qubits)

    @qml.qnode(dev)
    def circuit(p):
        qml.BasisState(hf_state, wires=range(n_qubits))

        for op, param in zip(operations, p):
            op(param)

        return qml.expval(hamiltonian)

    # Iteratively add gates
    for _ in range(max_gates):
        # Find best gate to add
        best_op = None
        best_improvement = 0

        for candidate_op in generate_candidates():
            # Test adding this operation
            test_ops = operations + [candidate_op]
            test_params = params + [0.0]

            improvement = evaluate_improvement(test_ops, test_params)

            if improvement > best_improvement:
                best_improvement = improvement
                best_op = candidate_op

        if best_improvement < threshold:
            break

        operations.append(best_op)
        params.append(0.0)

        # Optimize current ansatz
        opt = qml.AdamOptimizer(stepsize=0.1)
        for _ in range(50):
            params = opt.step(circuit, params)

    return circuit, params
```

## Molecular Structure

### Defining Molecules

```python
# Simple diatomic
h2_symbols = ['H', 'H']
h2_coords = np.array([0.0, 0.0, 0.0, 0.0, 0.0, 0.74])

# Water molecule
h2o_symbols = ['O', 'H', 'H']
h2o_coords = np.array([
    0.0, 0.0, 0.0,      # O
    0.757, 0.586, 0.0,  # H
   -0.757, 0.586, 0.0   # H
])

# From XYZ format
molecule = qchem.read_structure('molecule.xyz')
symbols, coords = molecule
```

### Geometry Optimization

```python
def optimize_geometry(symbols, initial_coords, basis='sto-3g'):
    """Optimize molecular geometry."""

    def energy_surface(coords):
        H, n_qubits = qchem.molecular_hamiltonian(
            symbols, coords, basis=basis
        )

        # Run VQE to get energy
        energy = run_vqe(H, n_qubits)
        return energy

    # Classical optimization of nuclear coordinates
    from scipy.optimize import minimize

    result = minimize(
        energy_surface,
        initial_coords,
        method='BFGS',
        options={'gtol': 1e-5}
    )

    return result.x, result.fun

optimized_coords, min_energy = optimize_geometry(h2_symbols, h2_coords)
print(f"Optimized geometry: {optimized_coords}")
print(f"Energy: {min_energy} Ha")
```

### Bond Dissociation Curves

```python
def dissociation_curve(symbols, axis=2, distances=None):
    """Calculate potential energy surface."""

    if distances is None:
        distances = np.linspace(0.5, 3.0, 20)

    energies = []

    for d in distances:
        coords = np.zeros(6)
        coords[axis] = d  # Set bond length

        H, n_qubits = qchem.molecular_hamiltonian(
            symbols, coords, basis='sto-3g'
        )

        energy = run_vqe(H, n_qubits)
        energies.append(energy)

        print(f"Distance: {d:.2f} Å, Energy: {energy:.6f} Ha")

    return distances, energies

# H2 dissociation
distances, energies = dissociation_curve(['H', 'H'])

import matplotlib.pyplot as plt
plt.plot(distances, energies)
plt.xlabel('Bond length (Å)')
plt.ylabel('Energy (Ha)')
plt.title('H2 Dissociation Curve')
plt.show()
```

## Basis Sets and Mapping

### Basis Set Selection

```python
# Minimal basis (fastest, least accurate)
H_sto3g, n_qubits = qchem.molecular_hamiltonian(
    symbols, coords, basis='sto-3g'
)

# Double-zeta basis
H_631g, n_qubits = qchem.molecular_hamiltonian(
    symbols, coords, basis='6-31g'
)

# Large basis (slower, more accurate)
H_ccpvdz, n_qubits = qchem.molecular_hamiltonian(
    symbols, coords, basis='cc-pvdz'
)
```

### Active Space Selection

```python
# Select active orbitals
active_electrons = 2
active_orbitals = 2

H_active, n_qubits = qchem.molecular_hamiltonian(
    symbols,
    coords,
    active_electrons=active_electrons,
    active_orbitals=active_orbitals
)

print(f"Full system: {len(symbols)} electrons")
print(f"Active space: {active_electrons} electrons in {active_orbitals} orbitals")
print(f"Qubits needed: {n_qubits}")
```

### Fermion-to-Qubit Mappings

```python
# Jordan-Wigner (default)
H_jw, n_q_jw = qchem.molecular_hamiltonian(
    symbols, coords, mapping='jordan_wigner'
)

# Bravyi-Kitaev
H_bk, n_q_bk = qchem.molecular_hamiltonian(
    symbols, coords, mapping='bravyi_kitaev'
)

# Parity
H_parity, n_q_parity = qchem.molecular_hamiltonian(
    symbols, coords, mapping='parity'
)

print(f"Jordan-Wigner terms: {len(H_jw.ops)}")
print(f"Bravyi-Kitaev terms: {len(H_bk.ops)}")
```

## Excited States

### Quantum Subspace Expansion

```python
def quantum_subspace_expansion(hamiltonian, ground_state_params, excitations):
    """Calculate excited states via subspace expansion."""

    @qml.qnode(dev)
    def ground_state():
        ansatz(ground_state_params, wires=range(n_qubits))
        return qml.state()

    # Get ground state
    psi_0 = ground_state()

    # Generate excited state basis
    basis = [psi_0]

    for exc in excitations:
        @qml.qnode(dev)
        def excited_state():
            ansatz(ground_state_params, wires=range(n_qubits))
            # Apply excitation
            apply_excitation(exc)
            return qml.state()

        psi_exc = excited_state()
        basis.append(psi_exc)

    # Build Hamiltonian matrix in subspace
    n_basis = len(basis)
    H_matrix = np.zeros((n_basis, n_basis))

    for i in range(n_basis):
        for j in range(n_basis):
            H_matrix[i, j] = np.vdot(basis[i], hamiltonian @ basis[j])

    # Diagonalize
    eigenvalues, eigenvectors = np.linalg.eigh(H_matrix)

    return eigenvalues, eigenvectors
```

### SSVQE (Subspace-Search VQE)

```python
def ssvqe(hamiltonian, n_states=3):
    """Calculate multiple states simultaneously."""

    def cost_function(params):
        states = []

        for i in range(n_states):
            @qml.qnode(dev)
            def state_i():
                ansatz(params[i], wires=range(n_qubits))
                return qml.state()

            states.append(state_i())

        # Energy expectation
        energies = [np.vdot(s, hamiltonian @ s) for s in states]

        # Orthogonality penalty
        penalty = 0
        for i in range(n_states):
            for j in range(i+1, n_states):
                overlap = np.abs(np.vdot(states[i], states[j]))
                penalty += overlap ** 2

        return sum(energies) + 1000 * penalty

    # Initialize parameters for all states
    params = [np.random.random(n_params) for _ in range(n_states)]

    opt = qml.AdamOptimizer(stepsize=0.01)
    for _ in range(100):
        params = opt.step(cost_function, params)

    return params
```

## Quantum Chemistry Workflows

### Full VQE Workflow

```python
def full_chemistry_workflow(symbols, coords, basis='sto-3g'):
    """Complete quantum chemistry calculation."""

    print("1. Building molecular Hamiltonian...")
    H, n_qubits = qchem.molecular_hamiltonian(
        symbols, coords, basis=basis
    )

    print(f"   Molecule: {' '.join(symbols)}")
    print(f"   Qubits: {n_qubits}")
    print(f"   Hamiltonian terms: {len(H.ops)}")

    print("\n2. Preparing Hartree-Fock state...")
    n_electrons = sum(qchem.atomic_numbers[s] for s in symbols)
    hf_state = qchem.hf_state(n_electrons, n_qubits)

    print("\n3. Running VQE...")
    energy, params = run_vqe(H, n_qubits, hf_state)

    print(f"\n4. Results:")
    print(f"   Ground state energy: {energy:.8f} Ha")

    print("\n5. Computing properties...")
    dipole = compute_dipole_moment(symbols, coords, params)
    print(f"   Dipole moment: {dipole:.4f} D")

    return {
        'energy': energy,
        'params': params,
        'dipole': dipole
    }

results = full_chemistry_workflow(['H', 'H'], h2_coords)
```

### Molecular Property Calculation

```python
def compute_molecular_properties(symbols, coords, vqe_params):
    """Calculate molecular properties from VQE solution."""

    # Energy
    H, n_qubits = qchem.molecular_hamiltonian(symbols, coords)
    energy = vqe_circuit(vqe_params)

    # Dipole moment
    dipole_obs = qchem.dipole_moment(symbols, coords)

    @qml.qnode(dev)
    def dipole_circuit(axis):
        ansatz(vqe_params, wires=range(n_qubits))
        return qml.expval(dipole_obs[axis])

    dipole = [dipole_circuit(i) for i in range(3)]
    dipole_magnitude = np.linalg.norm(dipole)

    # Particle number (sanity check)
    @qml.qnode(dev)
    def particle_number():
        ansatz(vqe_params, wires=range(n_qubits))
        N_op = qchem.particle_number(n_qubits)
        return qml.expval(N_op)

    n_particles = particle_number()

    return {
        'energy': energy,
        'dipole_moment': dipole_magnitude,
        'dipole_vector': dipole,
        'particle_number': n_particles
    }
```

### Reaction Energy Calculation

```python
def reaction_energy(reactants, products):
    """Calculate energy of chemical reaction."""

    # Calculate energies of reactants
    E_reactants = 0
    for molecule in reactants:
        symbols, coords = molecule
        H, n_qubits = qchem.molecular_hamiltonian(symbols, coords)
        E_reactants += run_vqe(H, n_qubits)

    # Calculate energies of products
    E_products = 0
    for molecule in products:
        symbols, coords = molecule
        H, n_qubits = qchem.molecular_hamiltonian(symbols, coords)
        E_products += run_vqe(H, n_qubits)

    # Reaction energy
    delta_E = E_products - E_reactants

    print(f"Reactant energy: {E_reactants:.6f} Ha")
    print(f"Product energy: {E_products:.6f} Ha")
    print(f"Reaction energy: {delta_E:.6f} Ha ({delta_E * 627.5:.2f} kcal/mol)")

    return delta_E

# Example: H2 dissociation
reactants = [((['H', 'H'], h2_coords_bonded))]
products = [((['H'], [0, 0, 0]), (['H'], [10, 0, 0]))]  # Separated atoms

delta_E = reaction_energy(reactants, products)
```

## Best Practices

1. **Start with small basis sets** - Use STO-3G for testing, upgrade for production
2. **Use active space** - Reduce qubits by selecting relevant orbitals
3. **Choose appropriate mapping** - Bravyi-Kitaev often reduces circuit depth
4. **Initialize with HF** - Start VQE from Hartree-Fock state
5. **Validate results** - Compare with classical methods (FCI, CCSD)
6. **Consider symmetries** - Exploit molecular symmetries to reduce complexity
7. **Use UCCSD for accuracy** - UCCSD ansatz is chemically motivated
8. **Monitor convergence** - Check gradient norms and energy variance
9. **Account for correlation** - Ensure ansatz captures electron correlation
10. **Benchmark thoroughly** - Test on known systems before novel molecules
