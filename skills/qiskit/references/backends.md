# Hardware Backends and Execution

Qiskit is backend-agnostic and supports execution on simulators and real quantum hardware from multiple providers.

## Backend Types

### Local Simulators
- Run on your machine
- No account required
- Perfect for development and testing

### Cloud-Based Hardware
- IBM Quantum (100+ qubit systems)
- IonQ (trapped ion)
- Amazon Braket (Rigetti, IonQ, Oxford Quantum Circuits)
- Other providers via plugins

## IBM Quantum Backends

### Connecting to IBM Quantum

```python
from qiskit_ibm_runtime import QiskitRuntimeService

# First time: save credentials
QiskitRuntimeService.save_account(
    channel="ibm_quantum",
    token="YOUR_IBM_QUANTUM_TOKEN"
)

# Subsequent sessions: load credentials
service = QiskitRuntimeService()
```

### Listing Available Backends

```python
# List all available backends
backends = service.backends()
for backend in backends:
    print(f"{backend.name}: {backend.num_qubits} qubits")

# Filter by minimum qubits
backends_127q = service.backends(min_num_qubits=127)

# Get specific backend
backend = service.backend("ibm_brisbane")
backend = service.least_busy()  # Get least busy backend
```

### Backend Properties

```python
backend = service.backend("ibm_brisbane")

# Basic info
print(f"Name: {backend.name}")
print(f"Qubits: {backend.num_qubits}")
print(f"Version: {backend.version}")
print(f"Status: {backend.status()}")

# Coupling map (qubit connectivity)
print(backend.coupling_map)

# Basis gates
print(backend.configuration().basis_gates)

# Qubit properties
print(backend.qubit_properties(0))  # Properties of qubit 0
```

### Checking Backend Status

```python
status = backend.status()
print(f"Operational: {status.operational}")
print(f"Pending jobs: {status.pending_jobs}")
print(f"Status message: {status.status_msg}")
```

## Running on IBM Quantum Hardware

### Using Runtime Primitives

```python
from qiskit import QuantumCircuit, transpile
from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2 as Sampler

service = QiskitRuntimeService()
backend = service.backend("ibm_brisbane")

# Create and transpile circuit
qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)
qc.measure_all()

# Transpile for backend
transpiled_qc = transpile(qc, backend=backend, optimization_level=3)

# Run with Sampler
sampler = Sampler(backend)
job = sampler.run([transpiled_qc], shots=1024)

# Retrieve results
result = job.result()
counts = result[0].data.meas.get_counts()
print(counts)
```

### Job Management

```python
# Submit job
job = sampler.run([qc], shots=1024)

# Get job ID (save for later retrieval)
job_id = job.job_id()
print(f"Job ID: {job_id}")

# Check job status
print(job.status())

# Wait for completion
result = job.result()

# Retrieve job later
service = QiskitRuntimeService()
retrieved_job = service.job(job_id)
result = retrieved_job.result()
```

### Job Queuing

```python
# Check queue position
job_status = job.status()
print(f"Queue position: {job.queue_position()}")

# Cancel job if needed
job.cancel()
```

## Session Mode

Use sessions for iterative algorithms (VQE, QAOA) to reduce queue time:

```python
from qiskit_ibm_runtime import Session, SamplerV2 as Sampler

service = QiskitRuntimeService()
backend = service.backend("ibm_brisbane")

with Session(backend=backend) as session:
    sampler = Sampler(session=session)

    # Multiple iterations in same session
    for iteration in range(10):
        # Parameterized circuit
        qc = create_parameterized_circuit(params[iteration])
        job = sampler.run([qc], shots=1024)
        result = job.result()

        # Update parameters based on results
        params[iteration + 1] = optimize(result)
```

Session benefits:
- Reduced queue waiting between iterations
- Guaranteed backend availability during session
- Better for variational algorithms

## Batch Mode

Use batch mode for independent parallel jobs:

```python
from qiskit_ibm_runtime import Batch, SamplerV2 as Sampler

service = QiskitRuntimeService()
backend = service.backend("ibm_brisbane")

with Batch(backend=backend) as batch:
    sampler = Sampler(session=batch)

    # Submit multiple independent jobs
    jobs = []
    for qc in circuit_list:
        job = sampler.run([qc], shots=1024)
        jobs.append(job)

    # Collect all results
    results = [job.result() for job in jobs]
```

## Local Simulators

### StatevectorSampler (Ideal Simulation)

```python
from qiskit.primitives import StatevectorSampler

sampler = StatevectorSampler()
result = sampler.run([qc], shots=1024).result()
counts = result[0].data.meas.get_counts()
```

### Aer Simulator (Realistic Noise)

```python
from qiskit_aer import AerSimulator
from qiskit_ibm_runtime import SamplerV2 as Sampler

# Ideal simulation
simulator = AerSimulator()

# Simulate with backend noise model
backend = service.backend("ibm_brisbane")
noisy_simulator = AerSimulator.from_backend(backend)

# Run simulation
transpiled_qc = transpile(qc, simulator)
sampler = Sampler(simulator)
job = sampler.run([transpiled_qc], shots=1024)
result = job.result()
```

### Aer GPU Acceleration

```python
# Use GPU for faster simulation
simulator = AerSimulator(method='statevector', device='GPU')
```

## Third-Party Providers

### IonQ

IonQ offers trapped-ion quantum computers with all-to-all connectivity:

```python
from qiskit_ionq import IonQProvider

provider = IonQProvider("YOUR_IONQ_API_TOKEN")

# List IonQ backends
backends = provider.backends()
backend = provider.get_backend("ionq_qpu")

# Run circuit
job = backend.run(qc, shots=1024)
result = job.result()
```

### Amazon Braket

```python
from qiskit_braket_provider import BraketProvider

provider = BraketProvider()

# List available devices
backends = provider.backends()

# Use specific device
backend = provider.get_backend("Rigetti")
job = backend.run(qc, shots=1024)
result = job.result()
```

## Error Mitigation

### Measurement Error Mitigation

```python
from qiskit_ibm_runtime import SamplerV2 as Sampler, Options

# Configure error mitigation
options = Options()
options.resilience_level = 1  # 0=none, 1=minimal, 2=moderate, 3=heavy

sampler = Sampler(backend, options=options)
job = sampler.run([qc], shots=1024)
result = job.result()
```

### Error Mitigation Levels

- **Level 0**: No mitigation
- **Level 1**: Readout error mitigation
- **Level 2**: Level 1 + gate error mitigation
- **Level 3**: Level 2 + advanced techniques

**Qiskit's Samplomatic package** can reduce sampling overhead by up to 100x with probabilistic error cancellation.

### Zero Noise Extrapolation (ZNE)

```python
options = Options()
options.resilience_level = 2
options.resilience.zne_mitigation = True

sampler = Sampler(backend, options=options)
```

## Monitoring Usage and Costs

### Check Account Usage

```python
# For IBM Quantum
service = QiskitRuntimeService()

# Check remaining credits
print(service.usage())
```

### Estimate Job Cost

```python
from qiskit_ibm_runtime import EstimatorV2 as Estimator

backend = service.backend("ibm_brisbane")

# Estimate job cost
estimator = Estimator(backend)
# Cost depends on circuit complexity and shots
```

## Best Practices

### 1. Always Transpile Before Running

```python
# Bad: Run without transpilation
job = sampler.run([qc], shots=1024)

# Good: Transpile first
qc_transpiled = transpile(qc, backend=backend, optimization_level=3)
job = sampler.run([qc_transpiled], shots=1024)
```

### 2. Test with Simulators First

```python
# Test with noisy simulator before hardware
noisy_sim = AerSimulator.from_backend(backend)
qc_test = transpile(qc, noisy_sim, optimization_level=3)

# Verify results look reasonable
# Then run on hardware
```

### 3. Use Appropriate Shot Counts

```python
# For optimization algorithms: fewer shots (100-1000)
# For final measurements: more shots (10000+)

# Adaptive shots based on stage
shots_optimization = 500
shots_final = 10000
```

### 4. Choose Backend Strategically

```python
# For testing: Use least busy backend
backend = service.least_busy(min_num_qubits=5)

# For production: Use backend matching requirements
backend = service.backend("ibm_brisbane")  # 127 qubits
```

### 5. Use Sessions for Variational Algorithms

Sessions are ideal for VQE, QAOA, and other iterative algorithms.

### 6. Monitor Job Status

```python
import time

job = sampler.run([qc], shots=1024)

while job.status().name not in ['DONE', 'ERROR', 'CANCELLED']:
    print(f"Status: {job.status().name}")
    time.sleep(10)

result = job.result()
```

## Troubleshooting

### Issue: "Backend not found"
```python
# List available backends
print([b.name for b in service.backends()])
```

### Issue: "Invalid credentials"
```python
# Re-save credentials
QiskitRuntimeService.save_account(
    channel="ibm_quantum",
    token="YOUR_TOKEN",
    overwrite=True
)
```

### Issue: Long queue times
```python
# Use least busy backend
backend = service.least_busy(min_num_qubits=5)

# Or use batch mode for multiple independent jobs
```

### Issue: Job fails with "Circuit too large"
```python
# Reduce circuit complexity
# Use higher transpilation optimization
qc_opt = transpile(qc, backend=backend, optimization_level=3)
```

## Backend Comparison

| Provider | Connectivity | Gate Set | Notes |
|----------|-------------|----------|--------|
| IBM Quantum | Limited | CX, RZ, SX, X | 100+ qubit systems, high quality |
| IonQ | All-to-all | GPI, GPI2, MS | Trapped ion, low error rates |
| Rigetti | Limited | CZ, RZ, RX | Superconducting qubits |
| Oxford Quantum Circuits | Limited | ECR, RZ, SX | Coaxmon technology |
