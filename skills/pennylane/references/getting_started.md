# Getting Started with PennyLane

## What is PennyLane?

PennyLane is a cross-platform Python library for quantum computing, quantum machine learning, and quantum chemistry. It enables training quantum computers like neural networks through automatic differentiation and seamless integration with classical machine learning frameworks.

## Installation

Install PennyLane using uv:

```bash
uv pip install pennylane
```

For specific device plugins (IBM, Amazon Braket, Google, Rigetti, etc.):

```bash
# IBM Qiskit
uv pip install pennylane-qiskit

# Amazon Braket
uv pip install amazon-braket-pennylane-plugin

# Google Cirq
uv pip install pennylane-cirq

# Rigetti
uv pip install pennylane-rigetti
```

## Core Concepts

### Quantum Nodes (QNodes)

A QNode is a quantum function that can be evaluated on a quantum device. It combines a quantum circuit definition with a device:

```python
import pennylane as qml

# Define a device
dev = qml.device('default.qubit', wires=2)

# Create a QNode
@qml.qnode(dev)
def circuit(params):
    qml.RX(params[0], wires=0)
    qml.RY(params[1], wires=1)
    qml.CNOT(wires=[0, 1])
    return qml.expval(qml.PauliZ(0))
```

### Devices

Devices execute quantum circuits. PennyLane supports:
- **Simulators**: `default.qubit`, `default.mixed`, `lightning.qubit`
- **Hardware**: Access through plugins (IBM, Amazon Braket, Rigetti, etc.)

```python
# Local simulator
dev = qml.device('default.qubit', wires=4)

# Lightning high-performance simulator
dev = qml.device('lightning.qubit', wires=10)
```

### Measurements

PennyLane supports various measurement types:

```python
@qml.qnode(dev)
def measure_circuit():
    qml.Hadamard(wires=0)
    # Expectation value
    return qml.expval(qml.PauliZ(0))

@qml.qnode(dev)
def measure_probs():
    qml.Hadamard(wires=0)
    # Probability distribution
    return qml.probs(wires=[0, 1])

@qml.qnode(dev)
def measure_samples():
    qml.Hadamard(wires=0)
    # Sample measurements
    return qml.sample(qml.PauliZ(0))
```

## Basic Workflow

### 1. Build a Circuit

```python
import pennylane as qml
import numpy as np

dev = qml.device('default.qubit', wires=3)

@qml.qnode(dev)
def quantum_circuit(weights):
    # Apply gates
    qml.RX(weights[0], wires=0)
    qml.RY(weights[1], wires=1)
    qml.CNOT(wires=[0, 1])
    qml.RZ(weights[2], wires=2)

    # Measure
    return qml.expval(qml.PauliZ(0) @ qml.PauliZ(1))
```

### 2. Compute Gradients

```python
# Automatic differentiation
grad_fn = qml.grad(quantum_circuit)
weights = np.array([0.1, 0.2, 0.3])
gradients = grad_fn(weights)
```

### 3. Optimize Parameters

```python
from pennylane import numpy as np

# Define optimizer
opt = qml.GradientDescentOptimizer(stepsize=0.1)

# Optimization loop
weights = np.array([0.1, 0.2, 0.3], requires_grad=True)
for i in range(100):
    weights = opt.step(quantum_circuit, weights)
    if i % 20 == 0:
        print(f"Step {i}: Cost = {quantum_circuit(weights)}")
```

## Device-Independent Programming

Write circuits once, run anywhere:

```python
# Same circuit, different backends
@qml.qnode(qml.device('default.qubit', wires=2))
def circuit_simulator(x):
    qml.RX(x, wires=0)
    return qml.expval(qml.PauliZ(0))

# Switch to hardware (if available)
@qml.qnode(qml.device('qiskit.ibmq', wires=2))
def circuit_hardware(x):
    qml.RX(x, wires=0)
    return qml.expval(qml.PauliZ(0))
```

## Common Patterns

### Parameterized Circuits

```python
@qml.qnode(dev)
def parameterized_circuit(params, x):
    # Encode data
    qml.RX(x, wires=0)

    # Apply parameterized layers
    for param in params:
        qml.RY(param, wires=0)
        qml.CNOT(wires=[0, 1])

    return qml.expval(qml.PauliZ(0))
```

### Circuit Templates

Use built-in templates for common patterns:

```python
from pennylane.templates import StronglyEntanglingLayers

@qml.qnode(dev)
def template_circuit(weights):
    StronglyEntanglingLayers(weights, wires=range(3))
    return qml.expval(qml.PauliZ(0))

# Generate random weights for template
n_layers = 2
n_wires = 3
shape = StronglyEntanglingLayers.shape(n_layers, n_wires)
weights = np.random.random(shape)
```

## Debugging and Visualization

### Print Circuit Structure

```python
print(qml.draw(circuit)(params))
print(qml.draw_mpl(circuit)(params))  # Matplotlib visualization
```

### Inspect Operations

```python
with qml.tape.QuantumTape() as tape:
    qml.Hadamard(wires=0)
    qml.CNOT(wires=[0, 1])

print(tape.operations)
print(tape.measurements)
```

## Next Steps

For detailed information on specific topics:
- **Building circuits**: See `references/quantum_circuits.md`
- **Quantum ML**: See `references/quantum_ml.md`
- **Chemistry applications**: See `references/quantum_chemistry.md`
- **Device management**: See `references/devices_backends.md`
- **Optimization**: See `references/optimization.md`
- **Advanced features**: See `references/advanced_features.md`

## Resources

- Official docs: https://docs.pennylane.ai
- Codebook: https://pennylane.ai/codebook
- QML demos: https://pennylane.ai/qml/demonstrations
- Community forum: https://discuss.pennylane.ai
