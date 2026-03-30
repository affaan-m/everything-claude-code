# Quantum Algorithms and Applications

Qiskit supports a wide range of quantum algorithms for optimization, chemistry, machine learning, and physics simulations.

## Table of Contents

1. [Optimization Algorithms](#optimization-algorithms)
2. [Chemistry and Materials Science](#chemistry-and-materials-science)
3. [Machine Learning](#machine-learning)
4. [Algorithm Libraries](#algorithm-libraries)

## Optimization Algorithms

### Variational Quantum Eigensolver (VQE)

VQE finds the minimum eigenvalue of a Hamiltonian using a hybrid quantum-classical approach.

**Use Cases:**
- Molecular ground state energy
- Combinatorial optimization
- Materials simulation

**Implementation:**
```python
from qiskit import QuantumCircuit, transpile
from qiskit_ibm_runtime import QiskitRuntimeService, EstimatorV2 as Estimator, Session
from qiskit.quantum_info import SparsePauliOp
from scipy.optimize import minimize
import numpy as np

def vqe_algorithm(hamiltonian, ansatz, backend, initial_params):
    """
    Run VQE algorithm

    Args:
        hamiltonian: Observable (SparsePauliOp)
        ansatz: Parameterized quantum circuit
        backend: Quantum backend
        initial_params: Initial parameter values
    """

    with Session(backend=backend) as session:
        estimator = Estimator(session=session)

        def cost_function(params):
            # Bind parameters to circuit
            bound_circuit = ansatz.assign_parameters(params)

            # Transpile for hardware
            qc_isa = transpile(bound_circuit, backend=backend, optimization_level=3)

            # Compute expectation value
            job = estimator.run([(qc_isa, hamiltonian)])
            result = job.result()
            energy = result[0].data.evs

            return energy

        # Classical optimization
        result = minimize(
            cost_function,
            initial_params,
            method='COBYLA',
            options={'maxiter': 100}
        )

    return result.fun, result.x

# Example: H2 molecule Hamiltonian
hamiltonian = SparsePauliOp(
    ["IIII", "ZZII", "IIZZ", "ZZZI", "IZZI"],
    coeffs=[-0.8, 0.17, 0.17, -0.24, 0.17]
)

# Create ansatz
qc = QuantumCircuit(4)
# ... define ansatz structure ...

service = QiskitRuntimeService()
backend = service.backend("ibm_brisbane")

energy, params = vqe_algorithm(hamiltonian, qc, backend, np.random.rand(10))
print(f"Ground state energy: {energy}")
```

### Quantum Approximate Optimization Algorithm (QAOA)

QAOA solves combinatorial optimization problems like MaxCut, TSP, and graph coloring.

**Use Cases:**
- MaxCut problems
- Portfolio optimization
- Vehicle routing
- Scheduling problems

**Implementation:**
```python
from qiskit import QuantumCircuit
from qiskit.circuit import Parameter
import networkx as nx

def qaoa_maxcut(graph, p, backend):
    """
    QAOA for MaxCut problem

    Args:
        graph: NetworkX graph
        p: Number of QAOA layers
        backend: Quantum backend
    """
    num_qubits = len(graph.nodes())
    qc = QuantumCircuit(num_qubits)

    # Initial superposition
    qc.h(range(num_qubits))

    # Alternating layers
    betas = [Parameter(f'β_{i}') for i in range(p)]
    gammas = [Parameter(f'γ_{i}') for i in range(p)]

    for i in range(p):
        # Problem Hamiltonian (MaxCut)
        for edge in graph.edges():
            u, v = edge
            qc.cx(u, v)
            qc.rz(2 * gammas[i], v)
            qc.cx(u, v)

        # Mixer Hamiltonian
        for qubit in range(num_qubits):
            qc.rx(2 * betas[i], qubit)

    qc.measure_all()
    return qc, betas + gammas

# Example: MaxCut on 4-node graph
G = nx.Graph()
G.add_edges_from([(0, 1), (1, 2), (2, 3), (3, 0)])

qaoa_circuit, params = qaoa_maxcut(G, p=2, backend=backend)

# Run with Sampler and optimize parameters
# ... (similar to VQE optimization loop)
```

### Grover's Algorithm

Quantum search algorithm providing quadratic speedup for unstructured search.

**Use Cases:**
- Database search
- SAT solving
- Finding marked items

**Implementation:**
```python
from qiskit import QuantumCircuit

def grover_oracle(marked_states):
    """Create oracle that marks target states"""
    num_qubits = len(marked_states[0])
    qc = QuantumCircuit(num_qubits)

    for target in marked_states:
        # Flip phase of target state
        for i, bit in enumerate(target):
            if bit == '0':
                qc.x(i)

        # Multi-controlled Z
        qc.h(num_qubits - 1)
        qc.mcx(list(range(num_qubits - 1)), num_qubits - 1)
        qc.h(num_qubits - 1)

        for i, bit in enumerate(target):
            if bit == '0':
                qc.x(i)

    return qc

def grover_diffusion(num_qubits):
    """Create Grover diffusion operator"""
    qc = QuantumCircuit(num_qubits)

    qc.h(range(num_qubits))
    qc.x(range(num_qubits))

    qc.h(num_qubits - 1)
    qc.mcx(list(range(num_qubits - 1)), num_qubits - 1)
    qc.h(num_qubits - 1)

    qc.x(range(num_qubits))
    qc.h(range(num_qubits))

    return qc

def grover_algorithm(marked_states, num_iterations):
    """Complete Grover's algorithm"""
    num_qubits = len(marked_states[0])
    qc = QuantumCircuit(num_qubits)

    # Initialize superposition
    qc.h(range(num_qubits))

    # Grover iterations
    oracle = grover_oracle(marked_states)
    diffusion = grover_diffusion(num_qubits)

    for _ in range(num_iterations):
        qc.compose(oracle, inplace=True)
        qc.compose(diffusion, inplace=True)

    qc.measure_all()
    return qc

# Search for state |101⟩ in 3-qubit space
marked = ['101']
iterations = int(np.pi/4 * np.sqrt(2**3))  # Optimal iterations
qc_grover = grover_algorithm(marked, iterations)
```

## Chemistry and Materials Science

### Molecular Ground State Energy

**Install Qiskit Nature:**
```bash
uv pip install qiskit-nature qiskit-nature-pyscf
```

**Example: H2 Molecule**
```python
from qiskit_nature.second_q.drivers import PySCFDriver
from qiskit_nature.second_q.mappers import JordanWignerMapper, ParityMapper
from qiskit_nature.second_q.circuit.library import UCCSD, HartreeFock

# Define molecule
driver = PySCFDriver(
    atom="H 0 0 0; H 0 0 0.735",
    basis="sto3g",
    charge=0,
    spin=0
)

# Get electronic structure problem
problem = driver.run()

# Map fermionic operators to qubits
mapper = JordanWignerMapper()
hamiltonian = mapper.map(problem.hamiltonian.second_q_op())

# Create initial state
num_particles = problem.num_particles
num_spatial_orbitals = problem.num_spatial_orbitals

init_state = HartreeFock(
    num_spatial_orbitals,
    num_particles,
    mapper
)

# Create ansatz
ansatz = UCCSD(
    num_spatial_orbitals,
    num_particles,
    mapper,
    initial_state=init_state
)

# Run VQE
energy, params = vqe_algorithm(
    hamiltonian,
    ansatz,
    backend,
    np.zeros(ansatz.num_parameters)
)

# Add nuclear repulsion energy
total_energy = energy + problem.nuclear_repulsion_energy
print(f"Ground state energy: {total_energy} Ha")
```

### Different Molecular Mappers

```python
# Jordan-Wigner mapping
jw_mapper = JordanWignerMapper()
ham_jw = jw_mapper.map(problem.hamiltonian.second_q_op())

# Parity mapping (often more efficient)
parity_mapper = ParityMapper()
ham_parity = parity_mapper.map(problem.hamiltonian.second_q_op())

# Bravyi-Kitaev mapping
from qiskit_nature.second_q.mappers import BravyiKitaevMapper
bk_mapper = BravyiKitaevMapper()
ham_bk = bk_mapper.map(problem.hamiltonian.second_q_op())
```

### Excited States

```python
from qiskit_nature.second_q.algorithms import QEOM

# Quantum Equation of Motion for excited states
qeom = QEOM(estimator, ansatz, 'sd')  # Singles and doubles excitations
excited_states = qeom.solve(problem)
```

## Machine Learning

### Quantum Kernels

Quantum computers can compute kernel functions for machine learning.

**Install Qiskit Machine Learning:**
```bash
uv pip install qiskit-machine-learning
```

**Example: Classification with Quantum Kernel**
```python
from qiskit_machine_learning.kernels import FidelityQuantumKernel
from qiskit_algorithms.state_fidelities import ComputeUncompute
from qiskit.circuit.library import ZZFeatureMap
from sklearn.svm import SVC
import numpy as np

# Create feature map
num_features = 2
feature_map = ZZFeatureMap(feature_dimension=num_features, reps=2)

# Create quantum kernel
fidelity = ComputeUncompute(sampler=sampler)
qkernel = FidelityQuantumKernel(fidelity=fidelity, feature_map=feature_map)

# Use with scikit-learn
X_train = np.random.rand(50, 2)
y_train = np.random.choice([0, 1], 50)

# Compute kernel matrix
kernel_matrix = qkernel.evaluate(X_train)

# Train SVM with quantum kernel
svc = SVC(kernel='precomputed')
svc.fit(kernel_matrix, y_train)

# Predict
X_test = np.random.rand(10, 2)
kernel_test = qkernel.evaluate(X_test, X_train)
predictions = svc.predict(kernel_test)
```

### Variational Quantum Classifier (VQC)

```python
from qiskit_machine_learning.algorithms import VQC
from qiskit.circuit.library import RealAmplitudes

# Create feature map and ansatz
feature_map = ZZFeatureMap(2)
ansatz = RealAmplitudes(2, reps=1)

# Create VQC
vqc = VQC(
    sampler=sampler,
    feature_map=feature_map,
    ansatz=ansatz,
    optimizer='COBYLA'
)

# Train
vqc.fit(X_train, y_train)

# Predict
predictions = vqc.predict(X_test)
accuracy = vqc.score(X_test, y_test)
```

### Quantum Neural Networks (QNN)

```python
from qiskit_machine_learning.neural_networks import SamplerQNN
from qiskit.circuit import QuantumCircuit, Parameter

# Create parameterized circuit
qc = QuantumCircuit(2)
params = [Parameter(f'θ_{i}') for i in range(4)]

# Network structure
for i, param in enumerate(params[:2]):
    qc.ry(param, i)

qc.cx(0, 1)

for i, param in enumerate(params[2:]):
    qc.ry(param, i)

qc.measure_all()

# Create QNN
qnn = SamplerQNN(
    circuit=qc,
    sampler=sampler,
    input_params=[],  # No input parameters for this example
    weight_params=params
)

# Use with PyTorch or TensorFlow for training
```

## Algorithm Libraries

### Qiskit Algorithms

Standard implementations of quantum algorithms:

```bash
uv pip install qiskit-algorithms
```

**Available Algorithms:**
- Amplitude Estimation
- Phase Estimation
- Shor's Algorithm
- Quantum Fourier Transform
- HHL (Linear systems)

**Example: Quantum Phase Estimation**
```python
from qiskit.circuit.library import QFT
from qiskit_algorithms import PhaseEstimation

# Create unitary operator
num_qubits = 3
unitary = QuantumCircuit(num_qubits)
# ... define unitary ...

# Phase estimation
pe = PhaseEstimation(num_evaluation_qubits=3, quantum_instance=backend)
result = pe.estimate(unitary=unitary, state_preparation=initial_state)
```

### Qiskit Optimization

Optimization problem solvers:

```bash
uv pip install qiskit-optimization
```

**Supported Problems:**
- Quadratic programs
- Integer programming
- Linear programming
- Constraint satisfaction

**Example: Portfolio Optimization**
```python
from qiskit_optimization.applications import PortfolioOptimization
from qiskit_optimization.algorithms import MinimumEigenOptimizer
from qiskit_algorithms import QAOA

# Define portfolio problem
returns = [0.1, 0.15, 0.12]  # Expected returns
covariances = [[1, 0.5, 0.3], [0.5, 1, 0.4], [0.3, 0.4, 1]]
budget = 2  # Number of assets to select

portfolio = PortfolioOptimization(
    expected_returns=returns,
    covariances=covariances,
    budget=budget
)

# Convert to quadratic program
qp = portfolio.to_quadratic_program()

# Solve with QAOA
qaoa = QAOA(sampler=sampler, optimizer='COBYLA', reps=2)
optimizer = MinimumEigenOptimizer(qaoa)

result = optimizer.solve(qp)
print(f"Optimal portfolio: {result.x}")
```

## Physics Simulations

### Time Evolution

```python
from qiskit.synthesis import SuzukiTrotter
from qiskit.quantum_info import SparsePauliOp

# Define Hamiltonian
hamiltonian = SparsePauliOp(["XX", "YY", "ZZ"], coeffs=[1.0, 1.0, 1.0])

# Time evolution
time = 1.0
evolution_gate = SuzukiTrotter(order=2, reps=10).synthesize(
    hamiltonian,
    time
)

qc = QuantumCircuit(2)
qc.append(evolution_gate, range(2))
```

### Partial Differential Equations

**Use Case:** Quantum algorithms for solving PDEs with potential exponential speedup.

```python
# Quantum PDE solver implementation
# Requires advanced techniques like HHL algorithm
# and amplitude encoding of solution vectors
```

## Benchmarking

### Benchpress Toolkit

Benchmark quantum algorithms:

```python
# Benchpress provides standardized benchmarks
# for comparing quantum algorithm performance

# Examples:
# - Quantum volume circuits
# - Random circuit sampling
# - Application-specific benchmarks
```

## Best Practices

### 1. Start Simple
Begin with small problem instances to validate your approach:
```python
# Test with 2-3 qubits first
# Scale up after confirming correctness
```

### 2. Use Simulators for Development
```python
from qiskit.primitives import StatevectorSampler

# Develop with local simulator
sampler_sim = StatevectorSampler()

# Switch to hardware for production
# sampler_hw = Sampler(backend)
```

### 3. Monitor Convergence
```python
convergence_data = []

def tracked_cost_function(params):
    energy = cost_function(params)
    convergence_data.append(energy)
    return energy

# Plot convergence after optimization
import matplotlib.pyplot as plt
plt.plot(convergence_data)
plt.xlabel('Iteration')
plt.ylabel('Energy')
plt.show()
```

### 4. Parameter Initialization
```python
# Use problem-specific initialization when possible
# Random initialization
initial_params = np.random.uniform(0, 2*np.pi, num_params)

# Or use classical preprocessing
# initial_params = classical_solution_to_params(classical_result)
```

### 5. Save Intermediate Results
```python
import json

checkpoint = {
    'iteration': iteration,
    'params': params.tolist(),
    'energy': energy,
    'timestamp': time.time()
}

with open(f'checkpoint_{iteration}.json', 'w') as f:
    json.dump(checkpoint, f)
```

## Resources and Further Reading

**Official Documentation:**
- [Qiskit Textbook](https://qiskit.org/learn)
- [Qiskit Nature Documentation](https://qiskit.org/ecosystem/nature)
- [Qiskit Machine Learning Documentation](https://qiskit.org/ecosystem/machine-learning)
- [Qiskit Optimization Documentation](https://qiskit.org/ecosystem/optimization)

**Research Papers:**
- VQE: Peruzzo et al., Nature Communications (2014)
- QAOA: Farhi et al., arXiv:1411.4028
- Quantum Kernels: Havlíček et al., Nature (2019)
