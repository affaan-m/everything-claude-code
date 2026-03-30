# Qiskit Patterns: The Four-Step Workflow

Qiskit Patterns provide a general framework for solving domain-specific quantum computing problems in four stages: Map, Optimize, Execute, and Post-process.

## Overview

The patterns framework enables seamless composition of quantum capabilities and supports heterogeneous computing infrastructure (CPU/GPU/QPU). Execute locally, through cloud services, or via Qiskit Serverless.

## The Four Steps

```
Problem → [Map] → [Optimize] → [Execute] → [Post-process] → Solution
```

### 1. Map
Translate classical problems into quantum circuits and operators

### 2. Optimize
Prepare circuits for target hardware through transpilation

### 3. Execute
Run circuits on quantum hardware using primitives

### 4. Post-process
Extract and refine results with classical computation

## Step 1: Map

### Goal
Transform domain-specific problems into quantum representations (circuits, operators, Hamiltonians).

### Key Decisions

**Choose Output Type:**
- **Sampler**: For bitstring outputs (optimization, search)
- **Estimator**: For expectation values (chemistry, physics)

**Design Circuit Structure:**
```python
from qiskit import QuantumCircuit
from qiskit.circuit import Parameter
import numpy as np

# Example: Parameterized circuit for VQE
def create_ansatz(num_qubits, depth):
    qc = QuantumCircuit(num_qubits)
    params = []

    for d in range(depth):
        # Rotation layer
        for i in range(num_qubits):
            theta = Parameter(f'θ_{d}_{i}')
            params.append(theta)
            qc.ry(theta, i)

        # Entanglement layer
        for i in range(num_qubits - 1):
            qc.cx(i, i + 1)

    return qc, params

ansatz, params = create_ansatz(num_qubits=4, depth=2)
```

### Considerations

- **Hardware topology**: Design with backend coupling map in mind
- **Gate efficiency**: Minimize two-qubit gates
- **Measurement basis**: Determine required measurements

### Domain-Specific Examples

**Chemistry: Molecular Hamiltonian**
```python
from qiskit_nature.second_q.drivers import PySCFDriver
from qiskit_nature.second_q.mappers import JordanWignerMapper

# Define molecule
driver = PySCFDriver(atom='H 0 0 0; H 0 0 0.735', basis='sto3g')
problem = driver.run()

# Map to qubit Hamiltonian
mapper = JordanWignerMapper()
hamiltonian = mapper.map(problem.hamiltonian)
```

**Optimization: QAOA Circuit**
```python
from qiskit.circuit import QuantumCircuit, Parameter

def qaoa_circuit(graph, p):
    """Create QAOA circuit for MaxCut problem"""
    num_qubits = len(graph.nodes())
    qc = QuantumCircuit(num_qubits)

    # Initial superposition
    qc.h(range(num_qubits))

    # Alternating layers
    betas = [Parameter(f'β_{i}') for i in range(p)]
    gammas = [Parameter(f'γ_{i}') for i in range(p)]

    for i in range(p):
        # Problem Hamiltonian
        for edge in graph.edges():
            qc.cx(edge[0], edge[1])
            qc.rz(2 * gammas[i], edge[1])
            qc.cx(edge[0], edge[1])

        # Mixer Hamiltonian
        qc.rx(2 * betas[i], range(num_qubits))

    return qc
```

## Step 2: Optimize

### Goal
Transform abstract circuits to hardware-compatible ISA (Instruction Set Architecture) circuits.

### Transpilation

```python
from qiskit import transpile

# Basic transpilation
qc_isa = transpile(qc, backend=backend, optimization_level=3)

# With specific initial layout
qc_isa = transpile(
    qc,
    backend=backend,
    optimization_level=3,
    initial_layout=[0, 2, 4, 6],  # Map to specific physical qubits
    seed_transpiler=42  # Reproducibility
)
```

### Pre-optimization Tips

1. **Test with simulators first**:
```python
from qiskit_aer import AerSimulator

sim = AerSimulator.from_backend(backend)
qc_test = transpile(qc, sim, optimization_level=3)
print(f"Estimated depth: {qc_test.depth()}")
```

2. **Analyze transpilation results**:
```python
print(f"Original gates: {qc.size()}")
print(f"Transpiled gates: {qc_isa.size()}")
print(f"Two-qubit gates: {qc_isa.count_ops().get('cx', 0)}")
```

3. **Consider circuit cutting** for large circuits:
```python
# For circuits too large for available hardware
# Use circuit cutting techniques to split into smaller subcircuits
```

## Step 3: Execute

### Goal
Run ISA circuits on quantum hardware using primitives.

### Using Sampler

```python
from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2 as Sampler

service = QiskitRuntimeService()
backend = service.backend("ibm_brisbane")

# Transpile first
qc_isa = transpile(qc, backend=backend, optimization_level=3)

# Execute
sampler = Sampler(backend)
job = sampler.run([qc_isa], shots=10000)
result = job.result()
counts = result[0].data.meas.get_counts()
```

### Using Estimator

```python
from qiskit_ibm_runtime import EstimatorV2 as Estimator
from qiskit.quantum_info import SparsePauliOp

service = QiskitRuntimeService()
backend = service.backend("ibm_brisbane")

# Transpile
qc_isa = transpile(qc, backend=backend, optimization_level=3)

# Define observable
observable = SparsePauliOp(["ZZZZ", "XXXX"])

# Execute
estimator = Estimator(backend)
job = estimator.run([(qc_isa, observable)])
result = job.result()
expectation_value = result[0].data.evs
```

### Execution Modes

**Session Mode (Iterative):**
```python
from qiskit_ibm_runtime import Session

with Session(backend=backend) as session:
    sampler = Sampler(session=session)

    # Multiple iterations
    for iteration in range(max_iterations):
        qc_iteration = update_circuit(params[iteration])
        qc_isa = transpile(qc_iteration, backend=backend)

        job = sampler.run([qc_isa], shots=1000)
        result = job.result()

        # Update parameters
        params[iteration + 1] = optimize_params(result)
```

**Batch Mode (Parallel):**
```python
from qiskit_ibm_runtime import Batch

with Batch(backend=backend) as batch:
    sampler = Sampler(session=batch)

    # Submit all jobs at once
    jobs = []
    for qc in circuit_list:
        qc_isa = transpile(qc, backend=backend)
        job = sampler.run([qc_isa], shots=1000)
        jobs.append(job)

    # Collect results
    results = [job.result() for job in jobs]
```

### Error Mitigation

```python
from qiskit_ibm_runtime import Options

options = Options()
options.resilience_level = 2  # 0=none, 1=light, 2=moderate, 3=heavy
options.optimization_level = 3

sampler = Sampler(backend, options=options)
```

## Step 4: Post-process

### Goal
Extract meaningful results from quantum measurements using classical computation.

### Result Processing

**For Sampler (Bitstrings):**
```python
counts = result[0].data.meas.get_counts()

# Convert to probabilities
total_shots = sum(counts.values())
probabilities = {state: count/total_shots for state, count in counts.items()}

# Find most probable state
max_state = max(counts, key=counts.get)
print(f"Most probable state: {max_state} ({counts[max_state]}/{total_shots})")
```

**For Estimator (Expectation Values):**
```python
expectation_value = result[0].data.evs
std_dev = result[0].data.stds  # Standard deviation

print(f"Energy: {expectation_value} ± {std_dev}")
```

### Domain-Specific Post-Processing

**Chemistry: Ground State Energy**
```python
def post_process_chemistry(result, nuclear_repulsion):
    """Extract ground state energy"""
    electronic_energy = result[0].data.evs
    total_energy = electronic_energy + nuclear_repulsion
    return total_energy
```

**Optimization: MaxCut Solution**
```python
def post_process_maxcut(counts, graph):
    """Find best cut from measurement results"""
    def compute_cut_value(bitstring, graph):
        cut_value = 0
        for edge in graph.edges():
            if bitstring[edge[0]] != bitstring[edge[1]]:
                cut_value += 1
        return cut_value

    # Find bitstring with maximum cut
    best_cut = 0
    best_string = None

    for bitstring, count in counts.items():
        cut = compute_cut_value(bitstring, graph)
        if cut > best_cut:
            best_cut = cut
            best_string = bitstring

    return best_string, best_cut
```

### Advanced Post-Processing

**Error Mitigation Post-Processing:**
```python
# Apply additional classical error mitigation
from qiskit.result import marginal_counts

# Marginalize to relevant qubits
relevant_qubits = [0, 1, 2]
marginal = marginal_counts(counts, indices=relevant_qubits)
```

**Statistical Analysis:**
```python
import numpy as np

def analyze_results(results_list):
    """Analyze multiple runs for statistics"""
    energies = [r[0].data.evs for r in results_list]

    mean_energy = np.mean(energies)
    std_energy = np.std(energies)
    confidence_interval = 1.96 * std_energy / np.sqrt(len(energies))

    return {
        'mean': mean_energy,
        'std': std_energy,
        '95% CI': (mean_energy - confidence_interval, mean_energy + confidence_interval)
    }
```

**Visualization:**
```python
from qiskit.visualization import plot_histogram
import matplotlib.pyplot as plt

# Visualize results
plot_histogram(counts, figsize=(12, 6))
plt.title("Measurement Results")
plt.show()
```

## Complete Example: VQE for Chemistry

```python
from qiskit import QuantumCircuit, transpile
from qiskit_ibm_runtime import QiskitRuntimeService, EstimatorV2 as Estimator, Session
from qiskit.quantum_info import SparsePauliOp
from scipy.optimize import minimize
import numpy as np

# 1. MAP: Create parameterized circuit
def create_ansatz(num_qubits):
    qc = QuantumCircuit(num_qubits)
    params = []

    for i in range(num_qubits):
        theta = f'θ_{i}'
        params.append(theta)
        qc.ry(theta, i)

    for i in range(num_qubits - 1):
        qc.cx(i, i + 1)

    return qc, params

# Define Hamiltonian (example: H2 molecule)
hamiltonian = SparsePauliOp(["IIZZ", "ZZII", "XXII", "IIXX"], coeffs=[0.3, 0.3, 0.1, 0.1])

# 2. OPTIMIZE: Connect and prepare
service = QiskitRuntimeService()
backend = service.backend("ibm_brisbane")

ansatz, param_names = create_ansatz(num_qubits=4)

# 3. EXECUTE: Run VQE
def cost_function(params):
    # Bind parameters
    bound_circuit = ansatz.assign_parameters({param_names[i]: params[i] for i in range(len(params))})

    # Transpile
    qc_isa = transpile(bound_circuit, backend=backend, optimization_level=3)

    # Execute
    job = estimator.run([(qc_isa, hamiltonian)])
    result = job.result()
    energy = result[0].data.evs

    return energy

with Session(backend=backend) as session:
    estimator = Estimator(session=session)

    # Classical optimization loop
    initial_params = np.random.random(len(param_names)) * 2 * np.pi
    result = minimize(cost_function, initial_params, method='COBYLA')

# 4. POST-PROCESS: Extract ground state energy
ground_state_energy = result.fun
optimized_params = result.x

print(f"Ground state energy: {ground_state_energy}")
print(f"Optimized parameters: {optimized_params}")
```

## Best Practices

### 1. Iterate Locally First
Test the full workflow with simulators before using hardware:
```python
from qiskit.primitives import StatevectorEstimator

estimator = StatevectorEstimator()
# Test workflow locally
```

### 2. Use Sessions for Iterative Algorithms
VQE, QAOA, and other variational algorithms benefit from sessions.

### 3. Choose Appropriate Shots
- Development/testing: 100-1000 shots
- Production: 10,000+ shots

### 4. Monitor Convergence
```python
energies = []

def cost_function_with_tracking(params):
    energy = cost_function(params)
    energies.append(energy)
    print(f"Iteration {len(energies)}: E = {energy}")
    return energy
```

### 5. Save Results
```python
import json

results_data = {
    'energy': float(ground_state_energy),
    'parameters': optimized_params.tolist(),
    'iterations': len(energies),
    'backend': backend.name
}

with open('vqe_results.json', 'w') as f:
    json.dump(results_data, f, indent=2)
```

## Qiskit Serverless

For large-scale workflows, use Qiskit Serverless for distributed computation:

```python
from qiskit_serverless import ServerlessClient, QiskitFunction

client = ServerlessClient()

# Define serverless function
@QiskitFunction()
def run_vqe_serverless(hamiltonian, ansatz):
    # Your VQE implementation
    pass

# Execute remotely
job = run_vqe_serverless(hamiltonian, ansatz)
result = job.result()
```

## Common Workflow Patterns

### Pattern 1: Parameter Sweep
```python
# Map → Optimize once → Execute many → Post-process
qc_isa = transpile(parameterized_circuit, backend=backend)

with Batch(backend=backend) as batch:
    sampler = Sampler(session=batch)
    results = []

    for param_set in parameter_sweep:
        bound_qc = qc_isa.assign_parameters(param_set)
        job = sampler.run([bound_qc], shots=1000)
        results.append(job.result())
```

### Pattern 2: Iterative Refinement
```python
# Map → (Optimize → Execute → Post-process) repeated
with Session(backend=backend) as session:
    estimator = Estimator(session=session)

    for iteration in range(max_iter):
        qc = update_circuit(params)
        qc_isa = transpile(qc, backend=backend)

        result = estimator.run([(qc_isa, observable)]).result()
        params = update_params(result)
```

### Pattern 3: Ensemble Measurement
```python
# Map → Optimize → Execute many observables → Post-process
qc_isa = transpile(qc, backend=backend)

observables = [obs1, obs2, obs3, obs4]
jobs = [(qc_isa, obs) for obs in observables]

estimator = Estimator(backend)
result = estimator.run(jobs).result()
expectation_values = [r.data.evs for r in result]
```
