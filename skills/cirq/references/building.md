# Building Quantum Circuits

This guide covers circuit construction in Cirq, including qubits, gates, operations, and circuit patterns.

## Basic Circuit Construction

### Creating Circuits

```python
import cirq

# Create a circuit
circuit = cirq.Circuit()

# Create qubits
q0 = cirq.GridQubit(0, 0)
q1 = cirq.GridQubit(0, 1)
q2 = cirq.LineQubit(0)

# Add gates to circuit
circuit.append([
    cirq.H(q0),
    cirq.CNOT(q0, q1),
    cirq.measure(q0, q1, key='result')
])
```

### Qubit Types

**GridQubit**: 2D grid topology for hardware-like layouts
```python
qubits = cirq.GridQubit.square(2)  # 2x2 grid
qubit = cirq.GridQubit(row=0, col=1)
```

**LineQubit**: 1D linear topology
```python
qubits = cirq.LineQubit.range(5)  # 5 qubits in a line
qubit = cirq.LineQubit(3)
```

**NamedQubit**: Custom-named qubits
```python
qubit = cirq.NamedQubit('my_qubit')
```

## Common Gates and Operations

### Single-Qubit Gates

```python
# Pauli gates
cirq.X(qubit)  # NOT gate
cirq.Y(qubit)
cirq.Z(qubit)

# Hadamard
cirq.H(qubit)

# Rotation gates
cirq.rx(angle)(qubit)  # Rotation around X-axis
cirq.ry(angle)(qubit)  # Rotation around Y-axis
cirq.rz(angle)(qubit)  # Rotation around Z-axis

# Phase gates
cirq.S(qubit)  # √Z gate
cirq.T(qubit)  # ⁴√Z gate
```

### Two-Qubit Gates

```python
# CNOT (Controlled-NOT)
cirq.CNOT(control, target)
cirq.CX(control, target)  # Alias

# CZ (Controlled-Z)
cirq.CZ(q0, q1)

# SWAP
cirq.SWAP(q0, q1)

# iSWAP
cirq.ISWAP(q0, q1)

# Controlled rotations
cirq.CZPowGate(exponent=0.5)(q0, q1)
```

### Measurement Operations

```python
# Measure single qubit
cirq.measure(qubit, key='m')

# Measure multiple qubits
cirq.measure(q0, q1, q2, key='result')

# Measure all qubits in circuit
circuit.append(cirq.measure(*qubits, key='final'))
```

## Advanced Circuit Construction

### Parameterized Gates

```python
import sympy

# Create symbolic parameters
theta = sympy.Symbol('theta')
phi = sympy.Symbol('phi')

# Use in gates
circuit = cirq.Circuit(
    cirq.rx(theta)(q0),
    cirq.ry(phi)(q1),
    cirq.CNOT(q0, q1)
)

# Resolve parameters later
resolved = cirq.resolve_parameters(circuit, {'theta': 0.5, 'phi': 1.2})
```

### Custom Gates via Unitaries

```python
import numpy as np

# Define unitary matrix
unitary = np.array([
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 0, 1],
    [0, 0, 1, 0]
]) / np.sqrt(2)

# Create gate from unitary
gate = cirq.MatrixGate(unitary)
operation = gate(q0, q1)
```

### Gate Decomposition

```python
# Define custom gate with decomposition
class MyGate(cirq.Gate):
    def _num_qubits_(self):
        return 1

    def _decompose_(self, qubits):
        q = qubits[0]
        return [cirq.H(q), cirq.T(q), cirq.H(q)]

    def _circuit_diagram_info_(self, args):
        return 'MyGate'

# Use the custom gate
my_gate = MyGate()
circuit.append(my_gate(q0))
```

## Circuit Organization

### Moments

Circuits are organized into moments (parallel operations):

```python
# Explicit moment construction
circuit = cirq.Circuit(
    cirq.Moment([cirq.H(q0), cirq.H(q1)]),
    cirq.Moment([cirq.CNOT(q0, q1)]),
    cirq.Moment([cirq.measure(q0, key='m0'), cirq.measure(q1, key='m1')])
)

# Access moments
for i, moment in enumerate(circuit):
    print(f"Moment {i}: {moment}")
```

### Circuit Operations

```python
# Concatenate circuits
circuit3 = circuit1 + circuit2

# Insert operations
circuit.insert(index, operation)

# Append with strategy
circuit.append(operations, strategy=cirq.InsertStrategy.NEW_THEN_INLINE)
```

## Circuit Patterns

### Bell State Preparation

```python
def bell_state_circuit():
    q0, q1 = cirq.LineQubit.range(2)
    return cirq.Circuit(
        cirq.H(q0),
        cirq.CNOT(q0, q1)
    )
```

### GHZ State

```python
def ghz_circuit(qubits):
    circuit = cirq.Circuit()
    circuit.append(cirq.H(qubits[0]))
    for i in range(len(qubits) - 1):
        circuit.append(cirq.CNOT(qubits[i], qubits[i+1]))
    return circuit
```

### Quantum Fourier Transform

```python
def qft_circuit(qubits):
    circuit = cirq.Circuit()
    for i, q in enumerate(qubits):
        circuit.append(cirq.H(q))
        for j in range(i + 1, len(qubits)):
            circuit.append(cirq.CZPowGate(exponent=1/2**(j-i))(qubits[j], q))

    # Reverse qubit order
    for i in range(len(qubits) // 2):
        circuit.append(cirq.SWAP(qubits[i], qubits[len(qubits) - i - 1]))

    return circuit
```

## Circuit Import/Export

### OpenQASM

```python
# Export to QASM
qasm_str = circuit.to_qasm()

# Import from QASM
from cirq.contrib.qasm_import import circuit_from_qasm
circuit = circuit_from_qasm(qasm_str)
```

### Circuit JSON

```python
import json

# Serialize
json_str = cirq.to_json(circuit)

# Deserialize
circuit = cirq.read_json(json_text=json_str)
```

## Working with Qudits

Qudits are higher-dimensional quantum systems (qutrits, ququarts, etc.):

```python
# Create qutrit (3-level system)
qutrit = cirq.LineQid(0, dimension=3)

# Custom qutrit gate
class QutritXGate(cirq.Gate):
    def _qid_shape_(self):
        return (3,)

    def _unitary_(self):
        return np.array([
            [0, 0, 1],
            [1, 0, 0],
            [0, 1, 0]
        ])

gate = QutritXGate()
circuit = cirq.Circuit(gate(qutrit))
```

## Observables

Create observables from Pauli operators:

```python
# Single Pauli observable
obs = cirq.Z(q0)

# Pauli string
obs = cirq.X(q0) * cirq.Y(q1) * cirq.Z(q2)

# Linear combination
from cirq import PauliSum
obs = 0.5 * cirq.X(q0) + 0.3 * cirq.Z(q1)
```

## Best Practices

1. **Use appropriate qubit types**: GridQubit for hardware-like topologies, LineQubit for 1D problems
2. **Keep circuits modular**: Build reusable circuit functions
3. **Use symbolic parameters**: For parameter sweeps and optimization
4. **Label measurements clearly**: Use descriptive keys for measurement results
5. **Document custom gates**: Include circuit diagram information for visualization
