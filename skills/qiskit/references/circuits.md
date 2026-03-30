# Quantum Circuit Building

## Creating a Quantum Circuit

Create circuits using the `QuantumCircuit` class:

```python
from qiskit import QuantumCircuit

# Create a circuit with 3 qubits
qc = QuantumCircuit(3)

# Create a circuit with 3 qubits and 3 classical bits
qc = QuantumCircuit(3, 3)
```

## Single-Qubit Gates

### Pauli Gates

```python
qc.x(0)   # NOT/Pauli-X gate on qubit 0
qc.y(1)   # Pauli-Y gate on qubit 1
qc.z(2)   # Pauli-Z gate on qubit 2
```

### Hadamard Gate

Creates superposition:

```python
qc.h(0)   # Hadamard gate on qubit 0
```

### Phase Gates

```python
qc.s(0)   # S gate (√Z)
qc.t(0)   # T gate (√S)
qc.p(π/4, 0)   # Phase gate with custom angle
```

### Rotation Gates

```python
from math import pi

qc.rx(pi/2, 0)   # Rotation around X-axis
qc.ry(pi/4, 1)   # Rotation around Y-axis
qc.rz(pi/3, 2)   # Rotation around Z-axis
```

## Multi-Qubit Gates

### CNOT (Controlled-NOT)

```python
qc.cx(0, 1)   # CNOT with control=0, target=1
```

### Controlled Gates

```python
qc.cy(0, 1)   # Controlled-Y
qc.cz(0, 1)   # Controlled-Z
qc.ch(0, 1)   # Controlled-Hadamard
```

### SWAP Gate

```python
qc.swap(0, 1)   # Swap qubits 0 and 1
```

### Toffoli (CCX) Gate

```python
qc.ccx(0, 1, 2)   # Toffoli with controls=0,1 and target=2
```

## Measurements

Add measurements to read qubit states:

```python
# Measure all qubits
qc.measure_all()

# Measure specific qubits to specific classical bits
qc.measure(0, 0)   # Measure qubit 0 to classical bit 0
qc.measure([0, 1], [0, 1])   # Measure qubits 0,1 to bits 0,1
```

## Circuit Composition

### Combining Circuits

```python
qc1 = QuantumCircuit(2)
qc1.h(0)

qc2 = QuantumCircuit(2)
qc2.cx(0, 1)

# Compose circuits
qc_combined = qc1.compose(qc2)
```

### Tensor Product

```python
qc1 = QuantumCircuit(1)
qc1.h(0)

qc2 = QuantumCircuit(1)
qc2.x(0)

# Create larger circuit from smaller ones
qc_tensor = qc1.tensor(qc2)   # Results in 2-qubit circuit
```

## Barriers and Labels

```python
qc.barrier()   # Add visual barrier in circuit
qc.barrier([0, 1])   # Barrier on specific qubits

# Add labels for clarity
qc.barrier(label="Initialization")
```

## Circuit Properties

```python
print(qc.num_qubits)   # Number of qubits
print(qc.num_clbits)   # Number of classical bits
print(qc.depth())      # Circuit depth
print(qc.size())       # Total gate count
print(qc.count_ops())  # Dictionary of gate counts
```

## Example: Bell State

Create entanglement between two qubits:

```python
qc = QuantumCircuit(2)
qc.h(0)           # Superposition on qubit 0
qc.cx(0, 1)       # Entangle qubit 0 and 1
qc.measure_all()  # Measure both qubits
```

## Example: Quantum Fourier Transform (QFT)

```python
from math import pi

def qft(n):
    qc = QuantumCircuit(n)
    for j in range(n):
        qc.h(j)
        for k in range(j+1, n):
            qc.cp(pi/2**(k-j), k, j)
    return qc

# Create 3-qubit QFT
qc_qft = qft(3)
```

## Parameterized Circuits

Create circuits with parameters for variational algorithms:

```python
from qiskit.circuit import Parameter

theta = Parameter('θ')
qc = QuantumCircuit(1)
qc.ry(theta, 0)

# Bind parameter value
qc_bound = qc.assign_parameters({theta: pi/4})
```

## Circuit Operations

```python
# Inverse of a circuit
qc_inverse = qc.inverse()

# Decompose gates to basis gates
qc_decomposed = qc.decompose()

# Draw circuit (returns string or diagram)
print(qc.draw())
print(qc.draw('mpl'))   # Matplotlib figure
```
