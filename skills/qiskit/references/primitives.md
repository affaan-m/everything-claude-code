# Qiskit Primitives

Primitives are the fundamental building blocks for executing quantum circuits. Qiskit provides two main primitives: **Sampler** (for measuring bitstrings) and **Estimator** (for computing expectation values).

## Primitive Types

### Sampler
Calculates probabilities or quasi-probabilities of bitstrings from quantum circuits. Use when you need:
- Measurement outcomes
- Output probability distributions
- Sampling from quantum states

### Estimator
Computes expectation values of observables for quantum circuits. Use when you need:
- Energy calculations
- Observable measurements
- Variational algorithm optimization

## V2 Interface (Current Standard)

Qiskit uses V2 primitives (BaseSamplerV2, BaseEstimatorV2) as the current standard. V1 primitives are legacy.

## Sampler Primitive

### StatevectorSampler (Local Simulation)

```python
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

# Create circuit
qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)
qc.measure_all()

# Run with Sampler
sampler = StatevectorSampler()
result = sampler.run([qc], shots=1024).result()

# Access results
counts = result[0].data.meas.get_counts()
print(counts)  # e.g., {'00': 523, '11': 501}
```

### Multiple Circuits

```python
qc1 = QuantumCircuit(2)
qc1.h(0)
qc1.measure_all()

qc2 = QuantumCircuit(2)
qc2.x(0)
qc2.measure_all()

# Run multiple circuits
sampler = StatevectorSampler()
job = sampler.run([qc1, qc2], shots=1000)
results = job.result()

# Access individual results
counts1 = results[0].data.meas.get_counts()
counts2 = results[1].data.meas.get_counts()
```

### Using Parameters

```python
from qiskit.circuit import Parameter

theta = Parameter('θ')
qc = QuantumCircuit(1)
qc.ry(theta, 0)
qc.measure_all()

# Run with parameter values
sampler = StatevectorSampler()
param_values = [[0], [np.pi/4], [np.pi/2]]
result = sampler.run([(qc, param_values)], shots=1024).result()
```

## Estimator Primitive

### StatevectorEstimator (Local Simulation)

```python
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorEstimator
from qiskit.quantum_info import SparsePauliOp

# Create circuit WITHOUT measurements
qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)

# Define observable
observable = SparsePauliOp(["ZZ", "XX"])

# Run Estimator
estimator = StatevectorEstimator()
result = estimator.run([(qc, observable)]).result()

# Access expectation values
exp_value = result[0].data.evs
print(f"Expectation value: {exp_value}")
```

### Multiple Observables

```python
from qiskit.quantum_info import SparsePauliOp

qc = QuantumCircuit(2)
qc.h(0)

obs1 = SparsePauliOp(["ZZ"])
obs2 = SparsePauliOp(["XX"])

estimator = StatevectorEstimator()
result = estimator.run([(qc, obs1), (qc, obs2)]).result()

ev1 = result[0].data.evs
ev2 = result[1].data.evs
```

### Parameterized Estimator

```python
from qiskit.circuit import Parameter
import numpy as np

theta = Parameter('θ')
qc = QuantumCircuit(1)
qc.ry(theta, 0)

observable = SparsePauliOp(["Z"])

# Run with multiple parameter values
estimator = StatevectorEstimator()
param_values = [[0], [np.pi/4], [np.pi/2], [np.pi]]
result = estimator.run([(qc, observable, param_values)]).result()
```

## IBM Quantum Runtime Primitives

For running on real hardware, use runtime primitives:

### Runtime Sampler

```python
from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2 as Sampler

service = QiskitRuntimeService()
backend = service.backend("ibm_brisbane")

qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)
qc.measure_all()

# Run on real hardware
sampler = Sampler(backend)
job = sampler.run([qc], shots=1024)
result = job.result()
counts = result[0].data.meas.get_counts()
```

### Runtime Estimator

```python
from qiskit_ibm_runtime import QiskitRuntimeService, EstimatorV2 as Estimator
from qiskit.quantum_info import SparsePauliOp

service = QiskitRuntimeService()
backend = service.backend("ibm_brisbane")

qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)

observable = SparsePauliOp(["ZZ"])

# Run on real hardware
estimator = Estimator(backend)
job = estimator.run([(qc, observable)])
result = job.result()
exp_value = result[0].data.evs
```

## Sessions for Iterative Workloads

Sessions group multiple jobs to reduce queue wait times:

```python
from qiskit_ibm_runtime import Session

service = QiskitRuntimeService()
backend = service.backend("ibm_brisbane")

with Session(backend=backend) as session:
    sampler = Sampler(session=session)

    # Run multiple jobs in session
    job1 = sampler.run([qc1], shots=1024)
    result1 = job1.result()

    job2 = sampler.run([qc2], shots=1024)
    result2 = job2.result()
```

## Batch Mode for Parallel Jobs

Batch mode runs independent jobs in parallel:

```python
from qiskit_ibm_runtime import Batch

service = QiskitRuntimeService()
backend = service.backend("ibm_brisbane")

with Batch(backend=backend) as batch:
    sampler = Sampler(session=batch)

    # Submit multiple independent jobs
    job1 = sampler.run([qc1], shots=1024)
    job2 = sampler.run([qc2], shots=1024)

    # Retrieve results when ready
    result1 = job1.result()
    result2 = job2.result()
```

## Result Processing

### Sampler Results

```python
result = sampler.run([qc], shots=1024).result()

# Get counts
counts = result[0].data.meas.get_counts()

# Get probabilities
probs = {k: v/1024 for k, v in counts.items()}

# Get metadata
metadata = result[0].metadata
```

### Estimator Results

```python
result = estimator.run([(qc, observable)]).result()

# Expectation value
exp_val = result[0].data.evs

# Standard deviation (if available)
std_dev = result[0].data.stds

# Metadata
metadata = result[0].metadata
```

## Differences from V1 Primitives

**V2 Improvements:**
- More flexible parameter binding
- Better result structure
- Improved performance
- Cleaner API design

**Migration from V1:**
- Use `StatevectorSampler` instead of `Sampler`
- Use `StatevectorEstimator` instead of `Estimator`
- Result access changed from `.result().quasi_dists[0]` to `.result()[0].data.meas.get_counts()`
