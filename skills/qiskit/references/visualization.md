# Visualization in Qiskit

Qiskit provides comprehensive visualization tools for quantum circuits, measurement results, and quantum states.

## Installation

Install visualization dependencies:

```bash
uv pip install "qiskit[visualization]" matplotlib
```

## Circuit Visualization

### Text-Based Drawings

```python
from qiskit import QuantumCircuit

qc = QuantumCircuit(3)
qc.h(0)
qc.cx(0, 1)
qc.cx(1, 2)

# Simple text output
print(qc.draw())

# Text with more detail
print(qc.draw('text', fold=-1))  # Don't fold long circuits
```

### Matplotlib Drawings

```python
# High-quality matplotlib figure
qc.draw('mpl')

# Save to file
fig = qc.draw('mpl')
fig.savefig('circuit.png', dpi=300, bbox_inches='tight')
```

### LaTeX Drawings

```python
# Generate LaTeX circuit diagram
qc.draw('latex')

# Save LaTeX source
latex_source = qc.draw('latex_source')
with open('circuit.tex', 'w') as f:
    f.write(latex_source)
```

## Customizing Circuit Drawings

### Styling Options

```python
from qiskit.visualization import circuit_drawer

# Reverse qubit order
qc.draw('mpl', reverse_bits=True)

# Fold long circuits
qc.draw('mpl', fold=20)  # Fold at 20 columns

# Show idle wires
qc.draw('mpl', idle_wires=False)

# Add initial state
qc.draw('mpl', initial_state=True)
```

### Color Customization

```python
style = {
    'displaycolor': {
        'h': ('#FA74A6', '#000000'),     # Hadamard: pink
        'cx': ('#A8D0DB', '#000000'),    # CNOT: light blue
        'measure': ('#F7E7B4', '#000000') # Measure: yellow
    }
}

qc.draw('mpl', style=style)
```

## Result Visualization

### Histogram of Counts

```python
from qiskit.visualization import plot_histogram
from qiskit.primitives import StatevectorSampler

qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)
qc.measure_all()

sampler = StatevectorSampler()
result = sampler.run([qc], shots=1024).result()
counts = result[0].data.meas.get_counts()

# Plot histogram
plot_histogram(counts)

# Compare multiple experiments
counts1 = {'00': 500, '11': 524}
counts2 = {'00': 480, '11': 544}
plot_histogram([counts1, counts2], legend=['Run 1', 'Run 2'])

# Save figure
fig = plot_histogram(counts)
fig.savefig('histogram.png', dpi=300, bbox_inches='tight')
```

### Histogram Options

```python
# Customize colors
plot_histogram(counts, color=['#1f77b4', '#ff7f0e'])

# Sort by value
plot_histogram(counts, sort='value')

# Set bar labels
plot_histogram(counts, bar_labels=True)

# Set target distribution (for comparison)
target = {'00': 0.5, '11': 0.5}
plot_histogram(counts, target=target)
```

## State Visualization

### Bloch Sphere

Visualize single-qubit states on the Bloch sphere:

```python
from qiskit.visualization import plot_bloch_vector
from qiskit.quantum_info import Statevector
import numpy as np

# Visualize a specific state vector
# State |+⟩: equal superposition of |0⟩ and |1⟩
state = Statevector.from_label('+')
plot_bloch_vector(state.to_bloch())

# Custom vector
plot_bloch_vector([0, 1, 0])  # |+⟩ state on X-axis
```

### Multi-Qubit Bloch Sphere

```python
from qiskit.visualization import plot_bloch_multivector

qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)

state = Statevector.from_instruction(qc)
plot_bloch_multivector(state)
```

### State City Plot

Visualize state amplitudes as a 3D city:

```python
from qiskit.visualization import plot_state_city
from qiskit.quantum_info import Statevector

qc = QuantumCircuit(3)
qc.h(range(3))
state = Statevector.from_instruction(qc)

plot_state_city(state)

# Customize
plot_state_city(state, color=['#FF6B6B', '#4ECDC4'])
```

### QSphere

Visualize quantum states on a sphere:

```python
from qiskit.visualization import plot_state_qsphere

state = Statevector.from_instruction(qc)
plot_state_qsphere(state)
```

### Hinton Diagram

Display state amplitudes:

```python
from qiskit.visualization import plot_state_hinton

state = Statevector.from_instruction(qc)
plot_state_hinton(state)
```

## Density Matrix Visualization

```python
from qiskit.visualization import plot_state_density
from qiskit.quantum_info import DensityMatrix

qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)

state = DensityMatrix.from_instruction(qc)
plot_state_density(state)
```

## Gate Map Visualization

Visualize backend coupling map:

```python
from qiskit.visualization import plot_gate_map
from qiskit_ibm_runtime import QiskitRuntimeService

service = QiskitRuntimeService()
backend = service.backend("ibm_brisbane")

# Show qubit connectivity
plot_gate_map(backend)

# Show with error rates
plot_gate_map(backend, plot_error_rates=True)
```

## Error Map Visualization

Display backend error rates:

```python
from qiskit.visualization import plot_error_map

plot_error_map(backend)
```

## Circuit Properties Display

```python
from qiskit.visualization import plot_circuit_layout

# Show how circuit maps to physical qubits
transpiled_qc = transpile(qc, backend=backend)
plot_circuit_layout(transpiled_qc, backend)
```

## Pulse Visualization

For pulse-level control:

```python
from qiskit import pulse
from qiskit.visualization import pulse_drawer

# Create pulse schedule
with pulse.build(backend) as schedule:
    pulse.play(pulse.Gaussian(duration=160, amp=0.1, sigma=40), pulse.drive_channel(0))

# Visualize
schedule.draw()
```

## Interactive Widgets (Jupyter)

### Circuit Composer Widget

```python
from qiskit.tools.jupyter import QuantumCircuitComposer

composer = QuantumCircuitComposer()
composer.show()
```

### Interactive State Visualization

```python
from qiskit.visualization import plot_histogram
import matplotlib.pyplot as plt

# Enable interactive mode
plt.ion()
plot_histogram(counts)
plt.show()
```

## Comparison Plots

### Multiple Histograms

```python
# Compare results from different backends
counts_sim = {'00': 500, '11': 524}
counts_hw = {'00': 480, '01': 20, '10': 24, '11': 500}

plot_histogram(
    [counts_sim, counts_hw],
    legend=['Simulator', 'Hardware'],
    figsize=(12, 6)
)
```

### Before/After Transpilation

```python
import matplotlib.pyplot as plt

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 4))

# Original circuit
qc.draw('mpl', ax=ax1)
ax1.set_title('Original Circuit')

# Transpiled circuit
qc_transpiled = transpile(qc, backend=backend, optimization_level=3)
qc_transpiled.draw('mpl', ax=ax2)
ax2.set_title('Transpiled Circuit')

plt.tight_layout()
plt.show()
```

## Saving Visualizations

### Save to Various Formats

```python
# PNG
fig = qc.draw('mpl')
fig.savefig('circuit.png', dpi=300, bbox_inches='tight')

# PDF
fig.savefig('circuit.pdf', bbox_inches='tight')

# SVG (vector graphics)
fig.savefig('circuit.svg', bbox_inches='tight')

# Histogram
hist_fig = plot_histogram(counts)
hist_fig.savefig('results.png', dpi=300, bbox_inches='tight')
```

## Styling Best Practices

### Publication-Quality Figures

```python
import matplotlib.pyplot as plt

# Set matplotlib style
plt.rcParams['figure.dpi'] = 300
plt.rcParams['font.size'] = 12
plt.rcParams['font.family'] = 'sans-serif'

# Create high-quality visualization
fig = qc.draw('mpl', style='iqp')
fig.savefig('publication_circuit.png', dpi=600, bbox_inches='tight')
```

### Available Styles

```python
# Default style
qc.draw('mpl')

# IQP style (IBM Quantum)
qc.draw('mpl', style='iqp')

# Colorblind-friendly
qc.draw('mpl', style='bw')  # Black and white
```

## Troubleshooting Visualization

### Common Issues

**Issue**: "No module named 'matplotlib'"
```bash
uv pip install matplotlib
```

**Issue**: Circuit too large to display
```python
# Use folding
qc.draw('mpl', fold=50)

# Or export to file instead of displaying
fig = qc.draw('mpl')
fig.savefig('large_circuit.png', dpi=150, bbox_inches='tight')
```

**Issue**: Jupyter notebook not displaying plots
```python
# Add magic command at notebook start
%matplotlib inline
```

**Issue**: LaTeX visualization not working
```bash
# Install LaTeX support
uv pip install pylatexenc
```
