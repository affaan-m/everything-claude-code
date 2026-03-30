---
name: qiskit
description: IBM quantum computing framework. Use when targeting IBM Quantum hardware, working with Qiskit Runtime for production workloads, or needing IBM optimization tools. Best for IBM hardware execution, quantum error mitigation, and enterprise quantum computing. For Google hardware use cirq; for gradient-based quantum ML use pennylane; for open quantum system simulations use qutip.
license: Apache-2.0 license
metadata:
    skill-author: K-Dense Inc.
---

# Qiskit

## Overview

Qiskit is the world's most popular open-source quantum computing framework with 13M+ downloads. Build quantum circuits, optimize for hardware, execute on simulators or real quantum computers, and analyze results. Supports IBM Quantum (100+ qubit systems), IonQ, Amazon Braket, and other providers.

**Key Features:**
- 83x faster transpilation than competitors
- 29% fewer two-qubit gates in optimized circuits
- Backend-agnostic execution (local simulators or cloud hardware)
- Comprehensive algorithm libraries for optimization, chemistry, and ML

## Quick Start

### Installation

```bash
uv pip install qiskit
uv pip install "qiskit[visualization]" matplotlib
```

### First Circuit

```python
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

# Create Bell state (entangled qubits)
qc = QuantumCircuit(2)
qc.h(0)           # Hadamard on qubit 0
qc.cx(0, 1)       # CNOT from qubit 0 to 1
qc.measure_all()  # Measure both qubits

# Run locally
sampler = StatevectorSampler()
result = sampler.run([qc], shots=1024).result()
counts = result[0].data.meas.get_counts()
print(counts)  # {'00': ~512, '11': ~512}
```

### Visualization

```python
from qiskit.visualization import plot_histogram

qc.draw('mpl')           # Circuit diagram
plot_histogram(counts)   # Results histogram
```

## Core Capabilities

### 1. Setup and Installation
For detailed installation, authentication, and IBM Quantum account setup:
- **See `references/setup.md`**

Topics covered:
- Installation with uv
- Python environment setup
- IBM Quantum account and API token configuration
- Local vs. cloud execution

### 2. Building Quantum Circuits
For constructing quantum circuits with gates, measurements, and composition:
- **See `references/circuits.md`**

Topics covered:
- Creating circuits with QuantumCircuit
- Single-qubit gates (H, X, Y, Z, rotations, phase gates)
- Multi-qubit gates (CNOT, SWAP, Toffoli)
- Measurements and barriers
- Circuit composition and properties
- Parameterized circuits for variational algorithms

### 3. Primitives (Sampler and Estimator)
For executing quantum circuits and computing results:
- **See `references/primitives.md`**

Topics covered:
- **Sampler**: Get bitstring measurements and probability distributions
- **Estimator**: Compute expectation values of observables
- V2 interface (StatevectorSampler, StatevectorEstimator)
- IBM Quantum Runtime primitives for hardware
- Sessions and Batch modes
- Parameter binding

### 4. Transpilation and Optimization
For optimizing circuits and preparing for hardware execution:
- **See `references/transpilation.md`**

Topics covered:
- Why transpilation is necessary
- Optimization levels (0-3)
- Six transpilation stages (init, layout, routing, translation, optimization, scheduling)
- Advanced features (virtual permutation elision, gate cancellation)
- Common parameters (initial_layout, approximation_degree, seed)
- Best practices for efficient circuits

### 5. Visualization
For displaying circuits, results, and quantum states:
- **See `references/visualization.md`**

Topics covered:
- Circuit drawings (text, matplotlib, LaTeX)
- Result histograms
- Quantum state visualization (Bloch sphere, state city, QSphere)
- Backend topology and error maps
- Customization and styling
- Saving publication-quality figures

### 6. Hardware Backends
For running on simulators and real quantum computers:
- **See `references/backends.md`**

Topics covered:
- IBM Quantum backends and authentication
- Backend properties and status
- Running on real hardware with Runtime primitives
- Job management and queuing
- Session mode (iterative algorithms)
- Batch mode (parallel jobs)
- Local simulators (StatevectorSampler, Aer)
- Third-party providers (IonQ, Amazon Braket)
- Error mitigation strategies

### 7. Qiskit Patterns Workflow
For implementing the four-step quantum computing workflow:
- **See `references/patterns.md`**

Topics covered:
- **Map**: Translate problems to quantum circuits
- **Optimize**: Transpile for hardware
- **Execute**: Run with primitives
- **Post-process**: Extract and analyze results
- Complete VQE example
- Session vs. Batch execution
- Common workflow patterns

### 8. Quantum Algorithms and Applications
For implementing specific quantum algorithms:
- **See `references/algorithms.md`**

Topics covered:
- **Optimization**: VQE, QAOA, Grover's algorithm
- **Chemistry**: Molecular ground states, excited states, Hamiltonians
- **Machine Learning**: Quantum kernels, VQC, QNN
- **Algorithm libraries**: Qiskit Nature, Qiskit ML, Qiskit Optimization
- Physics simulations and benchmarking

## Workflow Decision Guide

**If you need to:**

- Install Qiskit or set up IBM Quantum account → `references/setup.md`
- Build a new quantum circuit → `references/circuits.md`
- Understand gates and circuit operations → `references/circuits.md`
- Run circuits and get measurements → `references/primitives.md`
- Compute expectation values → `references/primitives.md`
- Optimize circuits for hardware → `references/transpilation.md`
- Visualize circuits or results → `references/visualization.md`
- Execute on IBM Quantum hardware → `references/backends.md`
- Connect to third-party providers → `references/backends.md`
- Implement end-to-end quantum workflow → `references/patterns.md`
- Build specific algorithm (VQE, QAOA, etc.) → `references/algorithms.md`
- Solve chemistry or optimization problems → `references/algorithms.md`

## Best Practices

### Development Workflow

1. **Start with simulators**: Test locally before using hardware
   ```python
   from qiskit.primitives import StatevectorSampler
   sampler = StatevectorSampler()
   ```

2. **Always transpile**: Optimize circuits before execution
   ```python
   from qiskit import transpile
   qc_optimized = transpile(qc, backend=backend, optimization_level=3)
   ```

3. **Use appropriate primitives**:
   - Sampler for bitstrings (optimization algorithms)
   - Estimator for expectation values (chemistry, physics)

4. **Choose execution mode**:
   - Session: Iterative algorithms (VQE, QAOA)
   - Batch: Independent parallel jobs
   - Single job: One-off experiments

### Performance Optimization

- Use optimization_level=3 for production
- Minimize two-qubit gates (major error source)
- Test with noisy simulators before hardware
- Save and reuse transpiled circuits
- Monitor convergence in variational algorithms

### Hardware Execution

- Check backend status before submitting
- Use least_busy() for testing
- Save job IDs for later retrieval
- Apply error mitigation (resilience_level)
- Start with fewer shots, increase for final runs

## Common Patterns

### Pattern 1: Simple Circuit Execution

```python
from qiskit import QuantumCircuit, transpile
from qiskit.primitives import StatevectorSampler

qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)
qc.measure_all()

sampler = StatevectorSampler()
result = sampler.run([qc], shots=1024).result()
counts = result[0].data.meas.get_counts()
```

### Pattern 2: Hardware Execution with Transpilation

```python
from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2 as Sampler
from qiskit import transpile

service = QiskitRuntimeService()
backend = service.backend("ibm_brisbane")

qc_optimized = transpile(qc, backend=backend, optimization_level=3)

sampler = Sampler(backend)
job = sampler.run([qc_optimized], shots=1024)
result = job.result()
```

### Pattern 3: Variational Algorithm (VQE)

```python
from qiskit_ibm_runtime import Session, EstimatorV2 as Estimator
from scipy.optimize import minimize

with Session(backend=backend) as session:
    estimator = Estimator(session=session)

    def cost_function(params):
        bound_qc = ansatz.assign_parameters(params)
        qc_isa = transpile(bound_qc, backend=backend)
        result = estimator.run([(qc_isa, hamiltonian)]).result()
        return result[0].data.evs

    result = minimize(cost_function, initial_params, method='COBYLA')
```

## Additional Resources

- **Official Docs**: https://quantum.ibm.com/docs
- **Qiskit Textbook**: https://qiskit.org/learn
- **API Reference**: https://docs.quantum.ibm.com/api/qiskit
- **Patterns Guide**: https://quantum.cloud.ibm.com/docs/en/guides/intro-to-patterns

