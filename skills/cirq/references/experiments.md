# Running Quantum Experiments

This guide covers designing and executing quantum experiments, including parameter sweeps, data collection, and using the ReCirq framework.

## Experiment Design

### Basic Experiment Structure

```python
import cirq
import numpy as np
import pandas as pd

class QuantumExperiment:
    """Base class for quantum experiments."""

    def __init__(self, qubits, simulator=None):
        self.qubits = qubits
        self.simulator = simulator or cirq.Simulator()
        self.results = []

    def build_circuit(self, **params):
        """Build circuit with given parameters."""
        raise NotImplementedError

    def run(self, params_list, repetitions=1000):
        """Run experiment with parameter sweep."""
        for params in params_list:
            circuit = self.build_circuit(**params)
            result = self.simulator.run(circuit, repetitions=repetitions)
            self.results.append({
                'params': params,
                'result': result
            })
        return self.results

    def analyze(self):
        """Analyze experimental results."""
        raise NotImplementedError
```

### Parameter Sweeps

```python
import sympy

# Define parameters
theta = sympy.Symbol('theta')
phi = sympy.Symbol('phi')

# Create parameterized circuit
def parameterized_circuit(qubits, theta, phi):
    return cirq.Circuit(
        cirq.ry(theta)(qubits[0]),
        cirq.rz(phi)(qubits[1]),
        cirq.CNOT(qubits[0], qubits[1]),
        cirq.measure(*qubits, key='result')
    )

# Define sweep
sweep = cirq.Product(
    cirq.Linspace('theta', 0, np.pi, 20),
    cirq.Linspace('phi', 0, 2*np.pi, 20)
)

# Run sweep
circuit = parameterized_circuit(cirq.LineQubit.range(2), theta, phi)
results = cirq.Simulator().run_sweep(circuit, params=sweep, repetitions=1000)
```

### Data Collection

```python
def collect_experiment_data(circuit, sweep, simulator, repetitions=1000):
    """Collect and organize experimental data."""

    data = []
    results = simulator.run_sweep(circuit, params=sweep, repetitions=repetitions)

    for params, result in zip(sweep, results):
        # Extract parameters
        param_dict = {k: v for k, v in params.param_dict.items()}

        # Extract measurements
        counts = result.histogram(key='result')

        # Store in structured format
        data.append({
            **param_dict,
            'counts': counts,
            'total': repetitions
        })

    return pd.DataFrame(data)

# Collect data
df = collect_experiment_data(circuit, sweep, cirq.Simulator())

# Save to file
df.to_csv('experiment_results.csv', index=False)
```

## ReCirq Framework

ReCirq provides a structured framework for reproducible quantum experiments.

### ReCirq Experiment Structure

```python
"""
Standard ReCirq experiment structure:

experiment_name/
├── __init__.py
├── experiment.py        # Main experiment code
├── tasks.py            # Data generation tasks
├── data_collection.py  # Parallel data collection
├── analysis.py         # Data analysis
└── plots.py           # Visualization
"""
```

### Task-Based Data Collection

```python
from dataclasses import dataclass
from typing import List
import cirq

@dataclass
class ExperimentTask:
    """Single task in parameter sweep."""
    theta: float
    phi: float
    repetitions: int = 1000

    def build_circuit(self, qubits):
        """Build circuit for this task."""
        return cirq.Circuit(
            cirq.ry(self.theta)(qubits[0]),
            cirq.rz(self.phi)(qubits[1]),
            cirq.CNOT(qubits[0], qubits[1]),
            cirq.measure(*qubits, key='result')
        )

    def run(self, qubits, simulator):
        """Execute task."""
        circuit = self.build_circuit(qubits)
        result = simulator.run(circuit, repetitions=self.repetitions)
        return {
            'theta': self.theta,
            'phi': self.phi,
            'result': result
        }

# Create tasks
tasks = [
    ExperimentTask(theta=t, phi=p)
    for t in np.linspace(0, np.pi, 10)
    for p in np.linspace(0, 2*np.pi, 10)
]

# Execute tasks
qubits = cirq.LineQubit.range(2)
simulator = cirq.Simulator()
results = [task.run(qubits, simulator) for task in tasks]
```

### Parallel Data Collection

```python
from multiprocessing import Pool
import functools

def run_task_parallel(task, qubits, simulator):
    """Run single task (for parallel execution)."""
    return task.run(qubits, simulator)

def collect_data_parallel(tasks, qubits, simulator, n_workers=4):
    """Collect data using parallel processing."""

    # Create partial function with fixed arguments
    run_func = functools.partial(
        run_task_parallel,
        qubits=qubits,
        simulator=simulator
    )

    # Run in parallel
    with Pool(n_workers) as pool:
        results = pool.map(run_func, tasks)

    return results

# Use parallel collection
results = collect_data_parallel(tasks, qubits, cirq.Simulator(), n_workers=8)
```

## Common Quantum Algorithms

### Variational Quantum Eigensolver (VQE)

```python
import scipy.optimize

def vqe_experiment(hamiltonian, ansatz_func, initial_params):
    """Run VQE to find ground state energy."""

    def cost_function(params):
        """Energy expectation value."""
        circuit = ansatz_func(params)

        # Measure expectation value of Hamiltonian
        simulator = cirq.Simulator()
        result = simulator.simulate(circuit)
        energy = hamiltonian.expectation_from_state_vector(
            result.final_state_vector,
            qubit_map={q: i for i, q in enumerate(circuit.all_qubits())}
        )
        return energy.real

    # Optimize parameters
    result = scipy.optimize.minimize(
        cost_function,
        initial_params,
        method='COBYLA'
    )

    return result

# Example: H2 molecule
def h2_ansatz(params, qubits):
    """UCC ansatz for H2."""
    theta = params[0]
    return cirq.Circuit(
        cirq.X(qubits[1]),
        cirq.ry(theta)(qubits[0]),
        cirq.CNOT(qubits[0], qubits[1])
    )

# Define Hamiltonian (simplified)
qubits = cirq.LineQubit.range(2)
hamiltonian = cirq.PauliSum.from_pauli_strings([
    cirq.PauliString({qubits[0]: cirq.Z}),
    cirq.PauliString({qubits[1]: cirq.Z}),
    cirq.PauliString({qubits[0]: cirq.Z, qubits[1]: cirq.Z})
])

# Run VQE
result = vqe_experiment(
    hamiltonian,
    lambda p: h2_ansatz(p, qubits),
    initial_params=[0.0]
)

print(f"Ground state energy: {result.fun}")
print(f"Optimal parameters: {result.x}")
```

### Quantum Approximate Optimization Algorithm (QAOA)

```python
def qaoa_circuit(graph, params, p_layers):
    """QAOA circuit for MaxCut problem."""

    qubits = cirq.LineQubit.range(graph.number_of_nodes())
    circuit = cirq.Circuit()

    # Initial superposition
    circuit.append(cirq.H(q) for q in qubits)

    # QAOA layers
    for layer in range(p_layers):
        gamma = params[layer]
        beta = params[p_layers + layer]

        # Problem Hamiltonian (cost)
        for edge in graph.edges():
            i, j = edge
            circuit.append(cirq.ZZPowGate(exponent=gamma)(qubits[i], qubits[j]))

        # Mixer Hamiltonian
        circuit.append(cirq.rx(2 * beta)(q) for q in qubits)

    circuit.append(cirq.measure(*qubits, key='result'))
    return circuit

# Run QAOA
import networkx as nx

graph = nx.cycle_graph(4)
p_layers = 2

def qaoa_cost(params):
    """Evaluate QAOA cost function."""
    circuit = qaoa_circuit(graph, params, p_layers)
    simulator = cirq.Simulator()
    result = simulator.run(circuit, repetitions=1000)

    # Calculate MaxCut objective
    total_cost = 0
    counts = result.histogram(key='result')

    for bitstring, count in counts.items():
        cost = 0
        bits = [(bitstring >> i) & 1 for i in range(graph.number_of_nodes())]
        for edge in graph.edges():
            i, j = edge
            if bits[i] != bits[j]:
                cost += 1
        total_cost += cost * count

    return -total_cost / 1000  # Maximize cut

# Optimize
initial_params = np.random.random(2 * p_layers) * np.pi
result = scipy.optimize.minimize(qaoa_cost, initial_params, method='COBYLA')

print(f"Optimal cost: {-result.fun}")
print(f"Optimal parameters: {result.x}")
```

### Quantum Phase Estimation

```python
def qpe_circuit(unitary, eigenstate_prep, n_counting_qubits):
    """Quantum Phase Estimation circuit."""

    counting_qubits = cirq.LineQubit.range(n_counting_qubits)
    target_qubit = cirq.LineQubit(n_counting_qubits)

    circuit = cirq.Circuit()

    # Prepare eigenstate
    circuit.append(eigenstate_prep(target_qubit))

    # Apply Hadamard to counting qubits
    circuit.append(cirq.H(q) for q in counting_qubits)

    # Controlled unitaries
    for i, q in enumerate(counting_qubits):
        power = 2 ** (n_counting_qubits - 1 - i)
        # Apply controlled-U^power
        for _ in range(power):
            circuit.append(cirq.ControlledGate(unitary)(q, target_qubit))

    # Inverse QFT on counting qubits
    circuit.append(inverse_qft(counting_qubits))

    # Measure counting qubits
    circuit.append(cirq.measure(*counting_qubits, key='phase'))

    return circuit

def inverse_qft(qubits):
    """Inverse Quantum Fourier Transform."""
    n = len(qubits)
    ops = []

    for i in range(n // 2):
        ops.append(cirq.SWAP(qubits[i], qubits[n - i - 1]))

    for i in range(n):
        for j in range(i):
            ops.append(cirq.CZPowGate(exponent=-1/2**(i-j))(qubits[j], qubits[i]))
        ops.append(cirq.H(qubits[i]))

    return ops
```

## Data Analysis

### Statistical Analysis

```python
def analyze_measurement_statistics(results):
    """Analyze measurement statistics."""

    counts = results.histogram(key='result')
    total = sum(counts.values())

    # Calculate probabilities
    probabilities = {state: count/total for state, count in counts.items()}

    # Shannon entropy
    entropy = -sum(p * np.log2(p) for p in probabilities.values() if p > 0)

    # Most likely outcome
    most_likely = max(counts.items(), key=lambda x: x[1])

    return {
        'probabilities': probabilities,
        'entropy': entropy,
        'most_likely_state': most_likely[0],
        'most_likely_probability': most_likely[1] / total
    }
```

### Expectation Value Calculation

```python
def calculate_expectation_value(circuit, observable, simulator):
    """Calculate expectation value of observable."""

    # Remove measurements
    circuit_no_measure = cirq.Circuit(
        m for m in circuit if not isinstance(m, cirq.MeasurementGate)
    )

    result = simulator.simulate(circuit_no_measure)
    state_vector = result.final_state_vector

    # Calculate ⟨ψ|O|ψ⟩
    expectation = observable.expectation_from_state_vector(
        state_vector,
        qubit_map={q: i for i, q in enumerate(circuit.all_qubits())}
    )

    return expectation.real
```

### Fidelity Estimation

```python
def state_fidelity(state1, state2):
    """Calculate fidelity between two states."""
    return np.abs(np.vdot(state1, state2)) ** 2

def process_fidelity(result1, result2):
    """Calculate process fidelity from measurement results."""

    counts1 = result1.histogram(key='result')
    counts2 = result2.histogram(key='result')

    # Normalize to probabilities
    total1 = sum(counts1.values())
    total2 = sum(counts2.values())

    probs1 = {k: v/total1 for k, v in counts1.items()}
    probs2 = {k: v/total2 for k, v in counts2.items()}

    # Classical fidelity (Bhattacharyya coefficient)
    all_states = set(probs1.keys()) | set(probs2.keys())
    fidelity = sum(np.sqrt(probs1.get(s, 0) * probs2.get(s, 0))
                   for s in all_states) ** 2

    return fidelity
```

## Visualization

### Plot Parameter Landscapes

```python
import matplotlib.pyplot as plt

def plot_parameter_landscape(theta_vals, phi_vals, energies):
    """Plot 2D parameter landscape."""

    plt.figure(figsize=(10, 8))
    plt.contourf(theta_vals, phi_vals, energies, levels=50, cmap='viridis')
    plt.colorbar(label='Energy')
    plt.xlabel('θ')
    plt.ylabel('φ')
    plt.title('Energy Landscape')
    plt.show()
```

### Plot Convergence

```python
def plot_optimization_convergence(optimization_history):
    """Plot optimization convergence."""

    iterations = range(len(optimization_history))
    energies = [result['energy'] for result in optimization_history]

    plt.figure(figsize=(10, 6))
    plt.plot(iterations, energies, 'b-', linewidth=2)
    plt.xlabel('Iteration')
    plt.ylabel('Energy')
    plt.title('Optimization Convergence')
    plt.grid(True)
    plt.show()
```

### Plot Measurement Distributions

```python
def plot_measurement_distribution(results):
    """Plot measurement outcome distribution."""

    counts = results.histogram(key='result')

    plt.figure(figsize=(12, 6))
    plt.bar(counts.keys(), counts.values())
    plt.xlabel('Measurement Outcome')
    plt.ylabel('Counts')
    plt.title('Measurement Distribution')
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.show()
```

## Best Practices

1. **Structure experiments clearly**: Use ReCirq patterns for reproducibility
2. **Separate tasks**: Divide data generation, collection, and analysis
3. **Use parameter sweeps**: Explore parameter space systematically
4. **Save intermediate results**: Don't lose expensive computation
5. **Parallelize when possible**: Use multiprocessing for independent tasks
6. **Track metadata**: Record experiment conditions, timestamps, versions
7. **Validate on simulators**: Test experimental code before hardware
8. **Implement error handling**: Robust code for long-running experiments
9. **Version control data**: Track experimental data alongside code
10. **Document thoroughly**: Clear documentation for reproducibility

## Example: Complete Experiment

```python
# Full experimental workflow
class VQEExperiment(QuantumExperiment):
    """Complete VQE experiment."""

    def __init__(self, hamiltonian, ansatz, qubits):
        super().__init__(qubits)
        self.hamiltonian = hamiltonian
        self.ansatz = ansatz
        self.history = []

    def build_circuit(self, params):
        return self.ansatz(params, self.qubits)

    def cost_function(self, params):
        circuit = self.build_circuit(params)
        result = self.simulator.simulate(circuit)
        energy = self.hamiltonian.expectation_from_state_vector(
            result.final_state_vector,
            qubit_map={q: i for i, q in enumerate(self.qubits)}
        )
        self.history.append({'params': params, 'energy': energy.real})
        return energy.real

    def run(self, initial_params):
        result = scipy.optimize.minimize(
            self.cost_function,
            initial_params,
            method='COBYLA',
            options={'maxiter': 100}
        )
        return result

    def analyze(self):
        # Plot convergence
        energies = [h['energy'] for h in self.history]
        plt.plot(energies)
        plt.xlabel('Iteration')
        plt.ylabel('Energy')
        plt.title('VQE Convergence')
        plt.show()

        return {
            'final_energy': self.history[-1]['energy'],
            'optimal_params': self.history[-1]['params'],
            'num_iterations': len(self.history)
        }

# Run experiment
experiment = VQEExperiment(hamiltonian, h2_ansatz, qubits)
result = experiment.run(initial_params=[0.0])
analysis = experiment.analyze()
```
