# Qiskit Setup and Installation

## Installation

Install Qiskit using uv:

```bash
uv pip install qiskit
```

For visualization capabilities:

```bash
uv pip install "qiskit[visualization]" matplotlib
```

## Python Environment Setup

Create and activate a virtual environment to isolate dependencies:

```bash
# macOS/Linux
python3 -m venv .venv
source .venv/bin/activate

# Windows
python -m venv .venv
.venv\Scripts\activate
```

## Supported Python Versions

Check the [Qiskit PyPI page](https://pypi.org/project/qiskit/) for currently supported Python versions. As of 2025, Qiskit typically supports Python 3.8+.

## IBM Quantum Account Setup

To run circuits on real IBM Quantum hardware, you need an IBM Quantum account and API token.

### Creating an Account

1. Visit [IBM Quantum Platform](https://quantum.ibm.com/)
2. Sign up for a free account
3. Navigate to your account settings to retrieve your API token

### Configuring Authentication

Save your IBM Quantum credentials:

```python
from qiskit_ibm_runtime import QiskitRuntimeService

# Save credentials (first time only)
QiskitRuntimeService.save_account(
    channel="ibm_quantum",
    token="YOUR_IBM_QUANTUM_TOKEN"
)

# Later sessions - load saved credentials
service = QiskitRuntimeService()
```

### Environment Variable Method

Alternatively, set the API token as an environment variable:

```bash
export QISKIT_IBM_TOKEN="YOUR_IBM_QUANTUM_TOKEN"
```

## Local Development (No Account Required)

You can build and test quantum circuits locally without an IBM Quantum account using simulators:

```python
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)
qc.measure_all()

# Run locally with simulator
sampler = StatevectorSampler()
result = sampler.run([qc], shots=1024).result()
```

## Verifying Installation

Test your installation:

```python
import qiskit
print(qiskit.__version__)

from qiskit import QuantumCircuit
qc = QuantumCircuit(2)
print("Qiskit installed successfully!")
```
