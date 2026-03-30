# Simulation in Cirq

This guide covers quantum circuit simulation, including exact and noisy simulations, parameter sweeps, and the Quantum Virtual Machine (QVM).

## Exact Simulation

### Basic Simulation

```python
import cirq
import numpy as np

# Create circuit
q0, q1 = cirq.LineQubit.range(2)
circuit = cirq.Circuit(
    cirq.H(q0),
    cirq.CNOT(q0, q1),
    cirq.measure(q0, q1, key='result')
)

# Simulate
simulator = cirq.Simulator()
result = simulator.run(circuit, repetitions=1000)

# Get measurement results
print(result.histogram(key='result'))
```

### State Vector Simulation

```python
# Simulate without measurement to get final state
simulator = cirq.Simulator()
result = simulator.simulate(circuit_without_measurement)

# Access state vector
state_vector = result.final_state_vector
print(f"State vector: {state_vector}")

# Get amplitudes
print(f"Amplitude of |00⟩: {state_vector[0]}")
print(f"Amplitude of |11⟩: {state_vector[3]}")
```

### Density Matrix Simulation

```python
# Use density matrix simulator for mixed states
simulator = cirq.DensityMatrixSimulator()
result = simulator.simulate(circuit)

# Access density matrix
density_matrix = result.final_density_matrix
print(f"Density matrix shape: {density_matrix.shape}")
```

### Step-by-Step Simulation

```python
# Simulate moment-by-moment
simulator = cirq.Simulator()
for step in simulator.simulate_moment_steps(circuit):
    print(f"State after moment {step.moment}: {step.state_vector()}")
```

## Sampling and Measurements

### Run Multiple Shots

```python
# Run circuit multiple times
result = simulator.run(circuit, repetitions=10000)

# Access measurement counts
counts = result.histogram(key='result')
print(f"Measurement counts: {counts}")

# Get raw measurements
measurements = result.measurements['result']
print(f"Shape: {measurements.shape}")  # (repetitions, num_qubits)
```

### Expectation Values

```python
# Measure observable expectation value
from cirq import PauliString

observable = PauliString({q0: cirq.Z, q1: cirq.Z})
result = simulator.simulate_expectation_values(
    circuit,
    observables=[observable]
)
print(f"⟨ZZ⟩ = {result[0]}")
```

## Parameter Sweeps

### Sweep Over Parameters

```python
import sympy

# Create parameterized circuit
theta = sympy.Symbol('theta')
q = cirq.LineQubit(0)
circuit = cirq.Circuit(
    cirq.ry(theta)(q),
    cirq.measure(q, key='m')
)

# Define parameter sweep
sweep = cirq.Linspace(key='theta', start=0, stop=2*np.pi, length=50)

# Run sweep
simulator = cirq.Simulator()
results = simulator.run_sweep(circuit, params=sweep, repetitions=1000)

# Process results
for params, result in zip(sweep, results):
    theta_val = params['theta']
    counts = result.histogram(key='m')
    print(f"θ={theta_val:.2f}: {counts}")
```

### Multiple Parameters

```python
# Sweep over multiple parameters
theta = sympy.Symbol('theta')
phi = sympy.Symbol('phi')

circuit = cirq.Circuit(
    cirq.ry(theta)(q0),
    cirq.rz(phi)(q1)
)

# Product sweep (all combinations)
sweep = cirq.Product(
    cirq.Linspace('theta', 0, np.pi, 10),
    cirq.Linspace('phi', 0, 2*np.pi, 10)
)

results = simulator.run_sweep(circuit, params=sweep, repetitions=100)
```

### Zip Sweep (Paired Parameters)

```python
# Sweep parameters together
sweep = cirq.Zip(
    cirq.Linspace('theta', 0, np.pi, 20),
    cirq.Linspace('phi', 0, 2*np.pi, 20)
)

results = simulator.run_sweep(circuit, params=sweep, repetitions=100)
```

## Noisy Simulation

### Adding Noise Channels

```python
# Create noisy circuit
noisy_circuit = circuit.with_noise(cirq.depolarize(p=0.01))

# Simulate noisy circuit
simulator = cirq.DensityMatrixSimulator()
result = simulator.run(noisy_circuit, repetitions=1000)
```

### Custom Noise Models

```python
# Apply different noise to different gates
noise_model = cirq.NoiseModel.from_noise_model_like(
    cirq.ConstantQubitNoiseModel(cirq.depolarize(0.01))
)

# Simulate with noise model
result = cirq.DensityMatrixSimulator(noise=noise_model).run(
    circuit, repetitions=1000
)
```

See `noise.md` for comprehensive noise modeling details.

## State Histograms

### Visualize Results

```python
import matplotlib.pyplot as plt

# Get histogram
result = simulator.run(circuit, repetitions=1000)
counts = result.histogram(key='result')

# Plot
plt.bar(counts.keys(), counts.values())
plt.xlabel('State')
plt.ylabel('Counts')
plt.title('Measurement Results')
plt.show()
```

### State Probability Distribution

```python
# Get state vector
result = simulator.simulate(circuit_without_measurement)
state_vector = result.final_state_vector

# Compute probabilities
probabilities = np.abs(state_vector) ** 2

# Plot
plt.bar(range(len(probabilities)), probabilities)
plt.xlabel('Basis State Index')
plt.ylabel('Probability')
plt.show()
```

## Quantum Virtual Machine (QVM)

QVM simulates realistic quantum hardware with device-specific constraints and noise.

### Using Virtual Devices

```python
# Use a virtual Google device
import cirq_google

# Get virtual device
device = cirq_google.Sycamore

# Create circuit on device
qubits = device.metadata.qubit_set
circuit = cirq.Circuit(device=device)

# Add operations respecting device constraints
circuit.append(cirq.CZ(qubits[0], qubits[1]))

# Validate circuit against device
device.validate_circuit(circuit)
```

### Noisy Virtual Hardware

```python
# Simulate with device noise
processor = cirq_google.get_engine().get_processor('weber')
noise_props = processor.get_device_specification()

# Create realistic noisy simulator
noisy_sim = cirq.DensityMatrixSimulator(
    noise=cirq_google.NoiseModelFromGoogleNoiseProperties(noise_props)
)

result = noisy_sim.run(circuit, repetitions=1000)
```

## Advanced Simulation Techniques

### Custom Initial State

```python
# Start from custom state
initial_state = np.array([1, 0, 0, 1]) / np.sqrt(2)  # |00⟩ + |11⟩

simulator = cirq.Simulator()
result = simulator.simulate(circuit, initial_state=initial_state)
```

### Partial Trace

```python
# Trace out subsystems
result = simulator.simulate(circuit)
full_state = result.final_state_vector

# Compute reduced density matrix for first qubit
from cirq import partial_trace
reduced_dm = partial_trace(result.final_density_matrix, keep_indices=[0])
```

### Intermediate State Access

```python
# Get state at specific moment
simulator = cirq.Simulator()
for i, step in enumerate(simulator.simulate_moment_steps(circuit)):
    if i == 5:  # After 5th moment
        state = step.state_vector()
        print(f"State after moment 5: {state}")
        break
```

## Simulation Performance

### Optimizing Large Simulations

1. **Use state vector for pure states**: Faster than density matrix
2. **Avoid density matrix when possible**: Exponentially more expensive
3. **Batch parameter sweeps**: More efficient than individual runs
4. **Use appropriate repetitions**: Balance accuracy vs computation time

```python
# Efficient: Single sweep
results = simulator.run_sweep(circuit, params=sweep, repetitions=100)

# Inefficient: Multiple individual runs
results = [simulator.run(circuit, param_resolver=p, repetitions=100)
           for p in sweep]
```

### Memory Considerations

```python
# For large systems, monitor state vector size
n_qubits = 20
state_size = 2**n_qubits * 16  # bytes (complex128)
print(f"State vector size: {state_size / 1e9:.2f} GB")
```

## Stabilizer Simulation

For circuits with only Clifford gates, use efficient stabilizer simulation:

```python
# Clifford circuit (H, S, CNOT)
circuit = cirq.Circuit(
    cirq.H(q0),
    cirq.S(q1),
    cirq.CNOT(q0, q1)
)

# Use stabilizer simulator (exponentially faster)
simulator = cirq.CliffordSimulator()
result = simulator.run(circuit, repetitions=1000)
```

## Best Practices

1. **Choose appropriate simulator**: Use Simulator for pure states, DensityMatrixSimulator for mixed states
2. **Use parameter sweeps**: More efficient than running individual circuits
3. **Validate circuits**: Check circuit validity before long simulations
4. **Monitor resource usage**: Track memory for large-scale simulations
5. **Use stabilizer simulation**: When circuits contain only Clifford gates
6. **Save intermediate results**: For long parameter sweeps or optimization runs
