# Advanced Features in PennyLane

## Table of Contents
1. [Templates and Layers](#templates-and-layers)
2. [Transforms](#transforms)
3. [Pulse Programming](#pulse-programming)
4. [Catalyst and JIT Compilation](#catalyst-and-jit-compilation)
5. [Adaptive Circuits](#adaptive-circuits)
6. [Noise Models](#noise-models)
7. [Resource Estimation](#resource-estimation)

## Templates and Layers

### Built-in Templates

```python
import pennylane as qml
from pennylane.templates import *
from pennylane import numpy as np

dev = qml.device('default.qubit', wires=4)

# Strongly Entangling Layers
@qml.qnode(dev)
def circuit_sel(weights):
    StronglyEntanglingLayers(weights, wires=range(4))
    return qml.expval(qml.PauliZ(0))

# Generate appropriately shaped weights
n_layers = 3
n_wires = 4
shape = StronglyEntanglingLayers.shape(n_layers, n_wires)
weights = np.random.random(shape)

result = circuit_sel(weights)
```

### Basic Entangler Layers

```python
@qml.qnode(dev)
def circuit_bel(weights):
    # Simple entangling layer
    BasicEntanglerLayers(weights, wires=range(4))
    return qml.expval(qml.PauliZ(0))

n_layers = 2
weights = np.random.random((n_layers, 4))
```

### Random Layers

```python
@qml.qnode(dev)
def circuit_random(weights):
    # Random circuit structure
    RandomLayers(weights, wires=range(4))
    return qml.expval(qml.PauliZ(0))

n_layers = 5
weights = np.random.random((n_layers, 4))
```

### Simplified Two Design

```python
@qml.qnode(dev)
def circuit_s2d(weights):
    # Simplified two-design
    SimplifiedTwoDesign(initial_layer_weights=weights[0],
                       weights=weights[1:],
                       wires=range(4))
    return qml.expval(qml.PauliZ(0))
```

### Particle-Conserving Layers

```python
@qml.qnode(dev)
def circuit_particle_conserving(weights):
    # Preserve particle number (useful for chemistry)
    ParticleConservingU1(weights, wires=range(4))
    return qml.expval(qml.PauliZ(0))

shape = ParticleConservingU1.shape(n_layers=2, n_wires=4)
weights = np.random.random(shape)
```

### Embedding Templates

```python
# Angle embedding
@qml.qnode(dev)
def angle_embed(features):
    AngleEmbedding(features, wires=range(4))
    return qml.expval(qml.PauliZ(0))

features = np.array([0.1, 0.2, 0.3, 0.4])

# Amplitude embedding
@qml.qnode(dev)
def amplitude_embed(features):
    AmplitudeEmbedding(features, wires=range(2), normalize=True)
    return qml.expval(qml.PauliZ(0))

features = np.array([0.5, 0.5, 0.5, 0.5])

# IQP embedding
@qml.qnode(dev)
def iqp_embed(features):
    IQPEmbedding(features, wires=range(4), n_repeats=2)
    return qml.expval(qml.PauliZ(0))
```

### Custom Templates

```python
def custom_layer(weights, wires):
    """Define custom template."""
    n_wires = len(wires)

    # Rotation layer
    for i, wire in enumerate(wires):
        qml.RY(weights[i], wires=wire)

    # Entanglement pattern
    for i in range(0, n_wires-1, 2):
        qml.CNOT(wires=[wires[i], wires[i+1]])

    for i in range(1, n_wires-1, 2):
        qml.CNOT(wires=[wires[i], wires[i+1]])

@qml.qnode(dev)
def circuit_custom(weights, n_layers):
    for i in range(n_layers):
        custom_layer(weights[i], wires=range(4))
    return qml.expval(qml.PauliZ(0))
```

## Transforms

### Circuit Transformations

```python
# Cancel adjacent inverse operations
from pennylane import transforms

@transforms.cancel_inverses
@qml.qnode(dev)
def circuit():
    qml.Hadamard(wires=0)
    qml.Hadamard(wires=0)  # These cancel
    qml.RX(0.5, wires=1)
    return qml.expval(qml.PauliZ(0))

# Merge rotations
@transforms.merge_rotations
@qml.qnode(dev)
def circuit():
    qml.RX(0.1, wires=0)
    qml.RX(0.2, wires=0)  # These merge into single RX(0.3)
    return qml.expval(qml.PauliZ(0))

# Commute measurements to end
@transforms.commute_controlled
@qml.qnode(dev)
def circuit():
    qml.Hadamard(wires=0)
    qml.CNOT(wires=[0, 1])
    return qml.expval(qml.PauliZ(0))
```

### Parameter Broadcasting

```python
# Execute circuit with multiple parameter sets
@qml.qnode(dev)
def circuit(x):
    qml.RX(x, wires=0)
    return qml.expval(qml.PauliZ(0))

# Broadcast over parameters
params = np.array([0.1, 0.2, 0.3, 0.4])
results = circuit(params)  # Returns array of results
```

### Metric Tensor

```python
# Compute quantum geometric tensor
@qml.qnode(dev)
def variational_circuit(params):
    for i, param in enumerate(params):
        qml.RY(param, wires=i % 4)
    for i in range(3):
        qml.CNOT(wires=[i, i+1])
    return qml.expval(qml.PauliZ(0))

params = np.array([0.1, 0.2, 0.3, 0.4], requires_grad=True)

# Get metric tensor (useful for quantum natural gradient)
metric_tensor = qml.metric_tensor(variational_circuit)(params)
```

### Tape Manipulation

```python
with qml.tape.QuantumTape() as tape:
    qml.Hadamard(wires=0)
    qml.CNOT(wires=[0, 1])
    qml.RX(0.5, wires=1)
    qml.expval(qml.PauliZ(0))

# Inspect tape
print("Operations:", tape.operations)
print("Observables:", tape.observables)

# Transform tape
expanded_tape = transforms.expand_tape(tape)
optimized_tape = transforms.cancel_inverses(tape)
```

### Decomposition

```python
# Decompose operations into native gate set
@qml.qnode(dev)
def circuit():
    qml.U3(0.1, 0.2, 0.3, wires=0)  # Arbitrary single-qubit gate
    return qml.expval(qml.PauliZ(0))

# Decompose U3 into RZ, RY
decomposed = qml.transforms.decompose(circuit, gate_set={qml.RZ, qml.RY, qml.CNOT})
```

## Pulse Programming

### Pulse-Level Control

```python
from pennylane import pulse

# Define pulse envelope
def gaussian_pulse(t, amplitude, sigma):
    return amplitude * np.exp(-(t**2) / (2 * sigma**2))

# Create pulse program
dev_pulse = qml.device('default.qubit', wires=2)

@qml.qnode(dev_pulse)
def pulse_circuit():
    # Apply pulse to qubit
    pulse.drive(
        amplitude=lambda t: gaussian_pulse(t, 1.0, 0.5),
        phase=0.0,
        freq=5.0,
        wires=0,
        duration=2.0
    )

    return qml.expval(qml.PauliZ(0))
```

### Pulse Sequences

```python
@qml.qnode(dev_pulse)
def pulse_sequence():
    # Sequence of pulses
    duration = 1.0

    # X pulse
    pulse.drive(
        amplitude=lambda t: np.sin(np.pi * t / duration),
        phase=0.0,
        freq=5.0,
        wires=0,
        duration=duration
    )

    # Y pulse
    pulse.drive(
        amplitude=lambda t: np.sin(np.pi * t / duration),
        phase=np.pi/2,
        freq=5.0,
        wires=0,
        duration=duration
    )

    return qml.expval(qml.PauliZ(0))
```

### Optimal Control

```python
def optimize_pulse(target_gate):
    """Optimize pulse to implement target gate."""

    def pulse_fn(t, params):
        # Parameterized pulse
        return params[0] * np.sin(params[1] * t + params[2])

    @qml.qnode(dev_pulse)
    def pulse_circuit(params):
        pulse.drive(
            amplitude=lambda t: pulse_fn(t, params),
            phase=0.0,
            freq=5.0,
            wires=0,
            duration=2.0
        )
        return qml.expval(qml.PauliZ(0))

    # Cost: fidelity with target
    def cost(params):
        result_state = pulse_circuit(params)
        target_state = target_gate()
        return 1 - np.abs(np.vdot(result_state, target_state))**2

    # Optimize
    opt = qml.AdamOptimizer(stepsize=0.01)
    params = np.random.random(3, requires_grad=True)

    for i in range(100):
        params = opt.step(cost, params)

    return params
```

## Catalyst and JIT Compilation

### Basic JIT Compilation

```python
from catalyst import qjit

dev = qml.device('lightning.qubit', wires=4)

@qjit  # Just-in-time compile
@qml.qnode(dev)
def compiled_circuit(x):
    qml.RX(x, wires=0)
    qml.Hadamard(wires=1)
    qml.CNOT(wires=[0, 1])
    return qml.expval(qml.PauliZ(0))

# First call compiles, subsequent calls are fast
result = compiled_circuit(0.5)
```

### Compiled Control Flow

```python
@qjit
@qml.qnode(dev)
def circuit_with_loops(n):
    qml.Hadamard(wires=0)

    # Compiled for loop
    @qml.for_loop(0, n, 1)
    def loop_body(i):
        qml.RX(0.1 * i, wires=0)

    loop_body()

    return qml.expval(qml.PauliZ(0))

result = circuit_with_loops(10)
```

### Compiled While Loops

```python
@qjit
@qml.qnode(dev)
def circuit_while():
    qml.Hadamard(wires=0)

    # Compiled while loop
    @qml.while_loop(lambda i: i < 10)
    def loop_body(i):
        qml.RX(0.1, wires=0)
        return i + 1

    loop_body(0)

    return qml.expval(qml.PauliZ(0))
```

### Autodiff with JIT

```python
@qjit
@qml.qnode(dev)
def circuit(params):
    qml.RX(params[0], wires=0)
    qml.RY(params[1], wires=1)
    return qml.expval(qml.PauliZ(0))

# Compiled gradient
grad_fn = qjit(qml.grad(circuit))

params = np.array([0.1, 0.2])
gradients = grad_fn(params)
```

## Adaptive Circuits

### Mid-Circuit Measurements with Feedback

```python
dev = qml.device('default.qubit', wires=3)

@qml.qnode(dev)
def adaptive_circuit():
    # Prepare state
    qml.Hadamard(wires=0)
    qml.CNOT(wires=[0, 1])

    # Mid-circuit measurement
    m0 = qml.measure(0)

    # Conditional operation based on measurement
    qml.cond(m0, qml.PauliX)(wires=2)

    # Another measurement
    m1 = qml.measure(1)

    # More complex conditional
    qml.cond(m0 & m1, qml.Hadamard)(wires=2)

    return qml.expval(qml.PauliZ(2))
```

### Dynamic Circuit Depth

```python
@qml.qnode(dev)
def dynamic_depth_circuit(max_depth):
    qml.Hadamard(wires=0)

    converged = False
    depth = 0

    while not converged and depth < max_depth:
        # Apply layer
        qml.RX(0.1 * depth, wires=0)

        # Check convergence via measurement
        m = qml.measure(0, reset=True)

        if m == 1:
            converged = True

        depth += 1

    return qml.expval(qml.PauliZ(0))
```

### Quantum Error Correction

```python
def bit_flip_code():
    """3-qubit bit flip error correction."""

    @qml.qnode(dev)
    def circuit():
        # Encode logical qubit
        qml.CNOT(wires=[0, 1])
        qml.CNOT(wires=[0, 2])

        # Simulate error
        qml.PauliX(wires=1)  # Bit flip on qubit 1

        # Syndrome measurement
        qml.CNOT(wires=[0, 3])
        qml.CNOT(wires=[1, 3])
        s1 = qml.measure(3)

        qml.CNOT(wires=[1, 4])
        qml.CNOT(wires=[2, 4])
        s2 = qml.measure(4)

        # Correction
        qml.cond(s1 & ~s2, qml.PauliX)(wires=0)
        qml.cond(s1 & s2, qml.PauliX)(wires=1)
        qml.cond(~s1 & s2, qml.PauliX)(wires=2)

        return qml.expval(qml.PauliZ(0))

    return circuit()
```

## Noise Models

### Built-in Noise Channels

```python
dev_noisy = qml.device('default.mixed', wires=2)

@qml.qnode(dev_noisy)
def noisy_circuit():
    qml.Hadamard(wires=0)

    # Depolarizing noise
    qml.DepolarizingChannel(0.1, wires=0)

    qml.CNOT(wires=[0, 1])

    # Amplitude damping (energy loss)
    qml.AmplitudeDamping(0.05, wires=0)

    # Phase damping (dephasing)
    qml.PhaseDamping(0.05, wires=1)

    # Bit flip error
    qml.BitFlip(0.01, wires=0)

    # Phase flip error
    qml.PhaseFlip(0.01, wires=1)

    return qml.expval(qml.PauliZ(0))
```

### Custom Noise Models

```python
def custom_noise(p):
    """Custom noise channel."""
    # Kraus operators for custom noise
    K0 = np.sqrt(1 - p) * np.eye(2)
    K1 = np.sqrt(p/3) * np.array([[0, 1], [1, 0]])  # X
    K2 = np.sqrt(p/3) * np.array([[0, -1j], [1j, 0]])  # Y
    K3 = np.sqrt(p/3) * np.array([[1, 0], [0, -1]])  # Z

    return [K0, K1, K2, K3]

@qml.qnode(dev_noisy)
def circuit_custom_noise():
    qml.Hadamard(wires=0)

    # Apply custom noise
    qml.QubitChannel(custom_noise(0.1), wires=0)

    return qml.expval(qml.PauliZ(0))
```

### Noise-Aware Training

```python
def train_with_noise(circuit, params, noise_level):
    """Train considering hardware noise."""

    dev_ideal = qml.device('default.qubit', wires=4)
    dev_noisy = qml.device('default.mixed', wires=4)

    @qml.qnode(dev_noisy)
    def noisy_circuit(p):
        circuit(p)

        # Add noise after each gate
        for wire in range(4):
            qml.DepolarizingChannel(noise_level, wires=wire)

        return qml.expval(qml.PauliZ(0))

    # Optimize noisy circuit
    opt = qml.AdamOptimizer(stepsize=0.01)

    for i in range(100):
        params = opt.step(noisy_circuit, params)

    return params
```

## Resource Estimation

### Count Operations

```python
@qml.qnode(dev)
def circuit(params):
    for i, param in enumerate(params):
        qml.RY(param, wires=i % 4)
    for i in range(3):
        qml.CNOT(wires=[i, i+1])
    return qml.expval(qml.PauliZ(0))

params = np.random.random(10)

# Get resource information
specs = qml.specs(circuit)(params)

print(f"Total gates: {specs['num_operations']}")
print(f"Circuit depth: {specs['depth']}")
print(f"Gate types: {specs['gate_types']}")
print(f"Gate sizes: {specs['gate_sizes']}")
print(f"Trainable params: {specs['num_trainable_params']}")
```

### Estimate Execution Time

```python
import time

def estimate_runtime(circuit, params, n_runs=10):
    """Estimate circuit execution time."""

    times = []
    for _ in range(n_runs):
        start = time.time()
        result = circuit(params)
        times.append(time.time() - start)

    mean_time = np.mean(times)
    std_time = np.std(times)

    print(f"Mean execution time: {mean_time*1000:.2f} ms")
    print(f"Std deviation: {std_time*1000:.2f} ms")

    return mean_time
```

### Resource Requirements

```python
def estimate_resources(n_qubits, depth):
    """Estimate computational resources."""

    # Classical simulation cost
    state_vector_size = 2**n_qubits * 16  # bytes (complex128)

    # Number of operations
    n_operations = depth * n_qubits

    print(f"Qubits: {n_qubits}")
    print(f"Circuit depth: {depth}")
    print(f"State vector size: {state_vector_size / 1e9:.2f} GB")
    print(f"Number of operations: {n_operations}")

    # Approximate simulation time (very rough)
    gate_time = 1e-6  # seconds per gate (varies by device)
    total_time = n_operations * gate_time * 2**n_qubits

    print(f"Estimated simulation time: {total_time:.4f} seconds")

    return {
        'memory': state_vector_size,
        'operations': n_operations,
        'time': total_time
    }

estimate_resources(n_qubits=20, depth=100)
```

## Best Practices

1. **Use templates** - Leverage built-in templates for common patterns
2. **Apply transforms** - Optimize circuits with transforms before execution
3. **Compile with JIT** - Use Catalyst for performance-critical code
4. **Consider noise** - Include noise models for realistic hardware simulation
5. **Estimate resources** - Profile circuits before running on hardware
6. **Use adaptive circuits** - Implement mid-circuit measurements for flexibility
7. **Optimize pulses** - Fine-tune pulse parameters for hardware control
8. **Cache compilations** - Reuse compiled circuits
9. **Monitor performance** - Track execution times and resource usage
10. **Test thoroughly** - Validate on simulators before hardware deployment
