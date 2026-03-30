# Circuit Transpilation and Optimization

Transpilation is the process of rewriting a quantum circuit to match the topology and gate set of a specific quantum device, while optimizing for execution on noisy quantum computers.

## Why Transpilation?

**Problem**: Abstract quantum circuits may use gates not available on hardware and assume all-to-all qubit connectivity.

**Solution**: Transpilation transforms circuits to:
1. Use only hardware-native gates (basis gates)
2. Respect physical qubit connectivity
3. Minimize circuit depth and gate count
4. Optimize for reduced errors on noisy devices

## Basic Transpilation

### Simple Transpile

```python
from qiskit import QuantumCircuit, transpile

qc = QuantumCircuit(3)
qc.h(0)
qc.cx(0, 1)
qc.cx(1, 2)

# Transpile for a specific backend
transpiled_qc = transpile(qc, backend=backend)
```

### Optimization Levels

Choose optimization level 0-3:

```python
# Level 0: No optimization (fastest)
qc_0 = transpile(qc, backend=backend, optimization_level=0)

# Level 1: Light optimization
qc_1 = transpile(qc, backend=backend, optimization_level=1)

# Level 2: Moderate optimization (default)
qc_2 = transpile(qc, backend=backend, optimization_level=2)

# Level 3: Heavy optimization (slowest, best results)
qc_3 = transpile(qc, backend=backend, optimization_level=3)
```

**Qiskit SDK v2.2** provides **83x faster transpilation** compared to competitors.

## Transpilation Stages

The transpiler pipeline consists of six stages:

### 1. Init Stage
- Validates circuit instructions
- Translates multi-qubit gates to standard form

### 2. Layout Stage
- Maps virtual qubits to physical qubits
- Considers qubit connectivity and error rates

```python
from qiskit.transpiler import CouplingMap

# Define custom coupling
coupling = CouplingMap([(0, 1), (1, 2), (2, 3)])
qc_transpiled = transpile(qc, coupling_map=coupling)
```

### 3. Routing Stage
- Inserts SWAP gates to satisfy connectivity constraints
- Minimizes additional SWAP overhead

### 4. Translation Stage
- Converts gates to hardware basis gates
- Typical basis: {RZ, SX, X, CX}

```python
# Specify basis gates
basis_gates = ['cx', 'id', 'rz', 'sx', 'x']
qc_transpiled = transpile(qc, basis_gates=basis_gates)
```

### 5. Optimization Stage
- Reduces gate count and circuit depth
- Applies gate cancellation and commutation rules
- Uses **virtual permutation elision** (levels 2-3)
- Finds separable operations to decompose

### 6. Scheduling Stage
- Adds timing information for pulse-level control

## Advanced Optimization Features

### Virtual Permutation Elision

At optimization levels 2-3, Qiskit analyzes commutation structure to eliminate unnecessary SWAP gates by tracking virtual qubit permutations.

### Gate Cancellation

Identifies and removes pairs of gates that cancel:
- X-X → I
- H-H → I
- CNOT-CNOT → I

### Numerical Decomposition

Splits two-qubit gates that can be expressed as separable one-qubit operations.

## Common Transpilation Parameters

### Initial Layout

Specify which physical qubits to use:

```python
# Use specific physical qubits
initial_layout = [0, 2, 4]  # Maps circuit qubits 0,1,2 to physical qubits 0,2,4
qc_transpiled = transpile(qc, backend=backend, initial_layout=initial_layout)
```

### Approximation Degree

Trade accuracy for fewer gates (0.0 = max approximation, 1.0 = no approximation):

```python
# Allow 5% approximation error for fewer gates
qc_transpiled = transpile(qc, backend=backend, approximation_degree=0.95)
```

### Seed for Reproducibility

```python
qc_transpiled = transpile(qc, backend=backend, seed_transpiler=42)
```

### Scheduling Method

```python
# Add timing constraints
qc_transpiled = transpile(
    qc,
    backend=backend,
    scheduling_method='alap'  # As Late As Possible
)
```

## Transpiling for Simulators

Even for simulators, transpilation can optimize circuits:

```python
from qiskit_aer import AerSimulator

simulator = AerSimulator()
qc_optimized = transpile(qc, backend=simulator, optimization_level=3)

# Compare gate counts
print(f"Original: {qc.size()} gates")
print(f"Optimized: {qc_optimized.size()} gates")
```

## Target-Aware Transpilation

Use `Target` objects for detailed backend specifications:

```python
from qiskit.transpiler import Target

# Transpile with target specification
qc_transpiled = transpile(qc, target=backend.target)
```

## Circuit Analysis After Transpilation

```python
qc_transpiled = transpile(qc, backend=backend, optimization_level=3)

# Analyze results
print(f"Depth: {qc_transpiled.depth()}")
print(f"Gate count: {qc_transpiled.size()}")
print(f"Operations: {qc_transpiled.count_ops()}")

# Check two-qubit gate count (major error source)
two_qubit_gates = qc_transpiled.count_ops().get('cx', 0)
print(f"Two-qubit gates: {two_qubit_gates}")
```

**Qiskit produces circuits with 29% fewer two-qubit gates** than leading alternatives, significantly reducing errors.

## Multiple Circuit Transpilation

Transpile multiple circuits efficiently:

```python
circuits = [qc1, qc2, qc3]
transpiled_circuits = transpile(
    circuits,
    backend=backend,
    optimization_level=3
)
```

## Pre-transpilation Best Practices

### 1. Design with Hardware Topology in Mind

Consider backend coupling map when designing circuits:

```python
# Check backend coupling
print(backend.coupling_map)

# Design circuits that align with coupling
```

### 2. Use Native Gates When Possible

Some backends support gates beyond {CX, RZ, SX, X}:

```python
# Check available basis gates
print(backend.configuration().basis_gates)
```

### 3. Minimize Two-Qubit Gates

Two-qubit gates have significantly higher error rates:
- Design algorithms to minimize CNOT gates
- Use gate identities to reduce counts

### 4. Test with Simulators First

```python
from qiskit_aer import AerSimulator

# Test transpilation locally
sim_backend = AerSimulator.from_backend(backend)
qc_test = transpile(qc, backend=sim_backend, optimization_level=3)
```

## Transpilation for Different Providers

### IBM Quantum

```python
from qiskit_ibm_runtime import QiskitRuntimeService

service = QiskitRuntimeService()
backend = service.backend("ibm_brisbane")
qc_transpiled = transpile(qc, backend=backend)
```

### IonQ

```python
# IonQ has all-to-all connectivity, different basis gates
basis_gates = ['gpi', 'gpi2', 'ms']
qc_transpiled = transpile(qc, basis_gates=basis_gates)
```

### Amazon Braket

Transpilation depends on specific device (Rigetti, IonQ, etc.)

## Performance Tips

1. **Cache transpiled circuits** - Transpilation is expensive, reuse when possible
2. **Use appropriate optimization level** - Level 3 is slow but best for production
3. **Leverage v2.2 speed improvements** - Update to latest Qiskit for 83x speedup
4. **Parallelize transpilation** - Qiskit automatically parallelizes when transpiling multiple circuits

## Common Issues and Solutions

### Issue: Circuit too deep after transpilation
**Solution**: Use higher optimization level or redesign circuit with fewer layers

### Issue: Too many SWAP gates inserted
**Solution**: Adjust initial_layout to better match qubit topology

### Issue: Transpilation takes too long
**Solution**: Reduce optimization level or update to Qiskit v2.2+ for speed improvements

### Issue: Unexpected gate decompositions
**Solution**: Check basis_gates and consider specifying custom decomposition rules
