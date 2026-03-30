# Quantum Machine Learning with PennyLane

## Table of Contents
1. [Hybrid Quantum-Classical Models](#hybrid-quantum-classical-models)
2. [Framework Integration](#framework-integration)
3. [Quantum Neural Networks](#quantum-neural-networks)
4. [Variational Classifiers](#variational-classifiers)
5. [Training and Optimization](#training-and-optimization)
6. [Data Encoding Strategies](#data-encoding-strategies)
7. [Transfer Learning](#transfer-learning)

## Hybrid Quantum-Classical Models

### Basic Hybrid Model

```python
import pennylane as qml
import numpy as np

dev = qml.device('default.qubit', wires=4)

@qml.qnode(dev)
def quantum_layer(inputs, weights):
    # Encode classical data
    for i, inp in enumerate(inputs):
        qml.RY(inp, wires=i)

    # Parameterized quantum circuit
    for wire in range(4):
        qml.RX(weights[wire], wires=wire)

    for wire in range(3):
        qml.CNOT(wires=[wire, wire+1])

    # Measure
    return [qml.expval(qml.PauliZ(i)) for i in range(4)]

# Use in classical workflow
inputs = np.array([0.1, 0.2, 0.3, 0.4])
weights = np.random.random(4)
output = quantum_layer(inputs, weights)
```

### Quantum-Classical Pipeline

```python
def hybrid_model(x, quantum_weights, classical_weights):
    # Classical preprocessing
    x_preprocessed = np.tanh(classical_weights['pre'] @ x)

    # Quantum layer
    quantum_out = quantum_layer(x_preprocessed, quantum_weights)

    # Classical postprocessing
    output = classical_weights['post'] @ quantum_out

    return output
```

## Framework Integration

### PyTorch Integration

```python
import torch
import pennylane as qml

dev = qml.device('default.qubit', wires=2)

@qml.qnode(dev, interface='torch')
def quantum_circuit(inputs, weights):
    qml.RY(inputs[0], wires=0)
    qml.RY(inputs[1], wires=1)
    qml.RX(weights[0], wires=0)
    qml.RX(weights[1], wires=1)
    qml.CNOT(wires=[0, 1])
    return qml.expval(qml.PauliZ(0))

# Create PyTorch layer
class QuantumLayer(torch.nn.Module):
    def __init__(self, n_qubits):
        super().__init__()
        self.n_qubits = n_qubits
        self.weights = torch.nn.Parameter(torch.randn(n_qubits))

    def forward(self, x):
        return torch.stack([quantum_circuit(xi, self.weights) for xi in x])

# Use in PyTorch model
class HybridModel(torch.nn.Module):
    def __init__(self):
        super().__init__()
        self.classical_1 = torch.nn.Linear(10, 2)
        self.quantum = QuantumLayer(2)
        self.classical_2 = torch.nn.Linear(1, 2)

    def forward(self, x):
        x = torch.relu(self.classical_1(x))
        x = self.quantum(x)
        x = self.classical_2(x.unsqueeze(1))
        return x

# Training loop
model = HybridModel()
optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
criterion = torch.nn.CrossEntropyLoss()

for epoch in range(100):
    optimizer.zero_grad()
    outputs = model(inputs)
    loss = criterion(outputs, labels)
    loss.backward()
    optimizer.step()
```

### JAX Integration

```python
import jax
import jax.numpy as jnp
import pennylane as qml

dev = qml.device('default.qubit', wires=2)

@qml.qnode(dev, interface='jax')
def quantum_circuit(inputs, weights):
    qml.RY(inputs[0], wires=0)
    qml.RY(inputs[1], wires=1)
    qml.RX(weights[0], wires=0)
    qml.RX(weights[1], wires=1)
    qml.CNOT(wires=[0, 1])
    return qml.expval(qml.PauliZ(0))

# JAX-compatible training
@jax.jit
def loss_fn(weights, x, y):
    predictions = quantum_circuit(x, weights)
    return jnp.mean((predictions - y) ** 2)

# Compute gradients with JAX
grad_fn = jax.grad(loss_fn)

# Training
weights = jnp.array([0.1, 0.2])
for i in range(100):
    grads = grad_fn(weights, x_train, y_train)
    weights = weights - 0.01 * grads
```

### TensorFlow Integration

```python
import tensorflow as tf
import pennylane as qml

dev = qml.device('default.qubit', wires=2)

@qml.qnode(dev, interface='tf')
def quantum_circuit(inputs, weights):
    qml.RY(inputs[0], wires=0)
    qml.RY(inputs[1], wires=1)
    qml.RX(weights[0], wires=0)
    qml.RX(weights[1], wires=1)
    qml.CNOT(wires=[0, 1])
    return qml.expval(qml.PauliZ(0))

# Keras layer
class QuantumLayer(tf.keras.layers.Layer):
    def __init__(self, n_qubits):
        super().__init__()
        self.n_qubits = n_qubits
        weight_init = tf.random_uniform_initializer()
        self.weights = tf.Variable(
            initial_value=weight_init(shape=(n_qubits,), dtype=tf.float32),
            trainable=True
        )

    def call(self, inputs):
        return tf.stack([quantum_circuit(x, self.weights) for x in inputs])

# Keras model
model = tf.keras.Sequential([
    tf.keras.layers.Dense(2, activation='relu'),
    QuantumLayer(2),
    tf.keras.layers.Dense(2, activation='softmax')
])

model.compile(
    optimizer=tf.keras.optimizers.Adam(0.01),
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

model.fit(x_train, y_train, epochs=100, batch_size=32)
```

## Quantum Neural Networks

### Variational Quantum Circuit (VQC)

```python
from pennylane import numpy as np

dev = qml.device('default.qubit', wires=4)

def variational_block(weights, wires):
    """Single layer of variational circuit."""
    for i, wire in enumerate(wires):
        qml.RY(weights[i, 0], wires=wire)
        qml.RZ(weights[i, 1], wires=wire)

    for i in range(len(wires)-1):
        qml.CNOT(wires=[wires[i], wires[i+1]])

@qml.qnode(dev)
def quantum_neural_network(inputs, weights):
    # Encode inputs
    for i, inp in enumerate(inputs):
        qml.RY(inp, wires=i)

    # Apply variational layers
    n_layers = len(weights)
    for layer_weights in weights:
        variational_block(layer_weights, wires=range(4))

    return qml.expval(qml.PauliZ(0))

# Initialize weights
n_layers = 3
n_wires = 4
weights_shape = (n_layers, n_wires, 2)
weights = np.random.random(weights_shape, requires_grad=True)
```

### Quantum Convolutional Neural Network

```python
def conv_layer(weights, wires):
    """Quantum convolutional layer."""
    n_wires = len(wires)

    # Apply local unitaries
    for i in range(n_wires):
        qml.RY(weights[i], wires=wires[i])

    # Nearest-neighbor entanglement
    for i in range(0, n_wires-1, 2):
        qml.CNOT(wires=[wires[i], wires[i+1]])

def pooling_layer(wires):
    """Quantum pooling (measure and discard)."""
    measurements = []
    for i in range(0, len(wires), 2):
        measurements.append(qml.measure(wires[i]))
    return measurements

@qml.qnode(dev)
def qcnn(inputs, weights):
    # Encode image data
    for i, pixel in enumerate(inputs):
        qml.RY(pixel, wires=i)

    # Convolutional layers
    conv_layer(weights[0], wires=range(8))
    pooling_layer(wires=range(0, 8, 2))

    conv_layer(weights[1], wires=range(1, 8, 2))
    pooling_layer(wires=range(1, 8, 4))

    return qml.expval(qml.PauliZ(1))
```

### Quantum Recurrent Neural Network

```python
def qrnn_cell(x, hidden, weights):
    """Single QRNN cell."""
    @qml.qnode(dev)
    def cell(x, h, w):
        # Encode input and hidden state
        qml.RY(x, wires=0)
        qml.RY(h, wires=1)

        # Apply recurrent transformation
        qml.RX(w[0], wires=0)
        qml.RX(w[1], wires=1)
        qml.CNOT(wires=[0, 1])
        qml.RY(w[2], wires=1)

        return qml.expval(qml.PauliZ(1))

    return cell(x, hidden, weights)

def qrnn_sequence(sequence, weights):
    """Process sequence with QRNN."""
    hidden = 0.0
    outputs = []

    for x in sequence:
        hidden = qrnn_cell(x, hidden, weights)
        outputs.append(hidden)

    return outputs
```

## Variational Classifiers

### Binary Classification

```python
dev = qml.device('default.qubit', wires=2)

@qml.qnode(dev)
def variational_classifier(x, weights):
    # Feature map
    qml.RY(x[0], wires=0)
    qml.RY(x[1], wires=1)

    # Variational layers
    for w in weights:
        qml.RX(w[0], wires=0)
        qml.RX(w[1], wires=1)
        qml.CNOT(wires=[0, 1])
        qml.RY(w[2], wires=0)
        qml.RY(w[3], wires=1)

    return qml.expval(qml.PauliZ(0))

def cost_function(weights, X, y):
    """Binary cross-entropy loss."""
    predictions = np.array([variational_classifier(x, weights) for x in X])
    predictions = (predictions + 1) / 2  # Map [-1, 1] to [0, 1]
    return -np.mean(y * np.log(predictions) + (1 - y) * np.log(1 - predictions))

# Training
n_layers = 2
n_params_per_layer = 4
weights = np.random.random((n_layers, n_params_per_layer), requires_grad=True)

opt = qml.GradientDescentOptimizer(stepsize=0.1)
for i in range(100):
    weights = opt.step(lambda w: cost_function(w, X_train, y_train), weights)
```

### Multi-Class Classification

```python
@qml.qnode(dev)
def multiclass_circuit(x, weights):
    # Encode input
    for i, val in enumerate(x):
        qml.RY(val, wires=i)

    # Variational circuit
    for layer_weights in weights:
        for i, w in enumerate(layer_weights):
            qml.RY(w, wires=i)
        for i in range(len(x)-1):
            qml.CNOT(wires=[i, i+1])

    # Multiple outputs for classes
    return [qml.expval(qml.PauliZ(i)) for i in range(3)]

def softmax(x):
    exp_x = np.exp(x - np.max(x))
    return exp_x / exp_x.sum()

def predict_class(x, weights):
    logits = multiclass_circuit(x, weights)
    return softmax(logits)
```

## Training and Optimization

### Gradient-Based Training

```python
# Automatic differentiation
@qml.qnode(dev, diff_method='backprop')
def circuit_backprop(x, weights):
    # ... circuit definition
    return qml.expval(qml.PauliZ(0))

# Parameter shift rule
@qml.qnode(dev, diff_method='parameter-shift')
def circuit_param_shift(x, weights):
    # ... circuit definition
    return qml.expval(qml.PauliZ(0))

# Finite differences
@qml.qnode(dev, diff_method='finite-diff')
def circuit_finite_diff(x, weights):
    # ... circuit definition
    return qml.expval(qml.PauliZ(0))
```

### Mini-Batch Training

```python
def batch_cost(weights, X_batch, y_batch):
    predictions = np.array([variational_classifier(x, weights) for x in X_batch])
    return np.mean((predictions - y_batch) ** 2)

# Mini-batch training
batch_size = 32
n_epochs = 100

for epoch in range(n_epochs):
    for i in range(0, len(X_train), batch_size):
        X_batch = X_train[i:i+batch_size]
        y_batch = y_train[i:i+batch_size]

        weights = opt.step(lambda w: batch_cost(w, X_batch, y_batch), weights)
```

### Learning Rate Scheduling

```python
def train_with_schedule(weights, X, y, n_epochs):
    initial_lr = 0.1
    decay = 0.95

    for epoch in range(n_epochs):
        lr = initial_lr * (decay ** epoch)
        opt = qml.GradientDescentOptimizer(stepsize=lr)

        weights = opt.step(lambda w: cost_function(w, X, y), weights)

        if epoch % 10 == 0:
            print(f"Epoch {epoch}, Loss: {cost_function(weights, X, y)}")

    return weights
```

## Data Encoding Strategies

### Angle Encoding

```python
def angle_encoding(x, wires):
    """Encode features as rotation angles."""
    for i, feature in enumerate(x):
        qml.RY(feature, wires=wires[i])
```

### Amplitude Encoding

```python
def amplitude_encoding(x, wires):
    """Encode features as state amplitudes."""
    # Normalize
    x_norm = x / np.linalg.norm(x)
    qml.MottonenStatePreparation(x_norm, wires=wires)
```

### Basis Encoding

```python
def basis_encoding(x, wires):
    """Encode binary features in computational basis."""
    for i, bit in enumerate(x):
        if bit:
            qml.PauliX(wires=wires[i])
```

### IQP Encoding

```python
def iqp_encoding(x, wires):
    """Instantaneous Quantum Polynomial encoding."""
    # Hadamard layer
    for wire in wires:
        qml.Hadamard(wires=wire)

    # Encode features
    for i, feature in enumerate(x):
        qml.RZ(feature, wires=wires[i])

    # Entanglement
    for i in range(len(wires)-1):
        qml.IsingZZ(x[i] * x[i+1], wires=[wires[i], wires[i+1]])
```

### Hamiltonian Encoding

```python
def hamiltonian_encoding(x, wires, time=1.0):
    """Encode via Hamiltonian evolution."""
    # Build Hamiltonian from features
    coeffs = x
    obs = [qml.PauliZ(i) for i in wires]

    H = qml.Hamiltonian(coeffs, obs)

    # Apply time evolution
    qml.ApproxTimeEvolution(H, time, n=10)
```

## Transfer Learning

### Pre-trained Quantum Model

```python
# Train on large dataset
pretrained_weights = train_quantum_model(large_dataset)

# Fine-tune on specific task
def fine_tune(pretrained_weights, small_dataset, n_epochs=50):
    # Freeze early layers
    frozen_weights = pretrained_weights[:-1]  # All but last layer
    trainable_weights = pretrained_weights[-1:]  # Only last layer

    @qml.qnode(dev)
    def transfer_circuit(x, trainable):
        # Apply frozen layers
        for layer_w in frozen_weights:
            variational_block(layer_w, wires=range(4))

        # Apply trainable layer
        variational_block(trainable, wires=range(4))

        return qml.expval(qml.PauliZ(0))

    # Train only last layer
    opt = qml.AdamOptimizer(stepsize=0.01)
    for epoch in range(n_epochs):
        trainable_weights = opt.step(
            lambda w: cost_function(w, small_dataset),
            trainable_weights
        )

    return np.concatenate([frozen_weights, trainable_weights])
```

### Classical-to-Quantum Transfer

```python
# Use classical network for feature extraction
import torch.nn as nn

classical_extractor = nn.Sequential(
    nn.Conv2d(3, 16, 3),
    nn.ReLU(),
    nn.MaxPool2d(2),
    nn.Flatten(),
    nn.Linear(16*13*13, 4)  # Output 4 features for quantum circuit
)

# Quantum classifier
@qml.qnode(dev)
def quantum_classifier(features, weights):
    angle_encoding(features, wires=range(4))
    variational_block(weights, wires=range(4))
    return qml.expval(qml.PauliZ(0))

# Combined model
def hybrid_transfer_model(image, classical_weights, quantum_weights):
    features = classical_extractor(image)
    return quantum_classifier(features, quantum_weights)
```

## Best Practices

1. **Start simple** - Begin with small circuits and scale up
2. **Choose encoding wisely** - Match encoding to data structure
3. **Use appropriate interfaces** - Select interface matching your ML framework
4. **Monitor gradients** - Check for vanishing/exploding gradients (barren plateaus)
5. **Regularize** - Add L2 regularization to prevent overfitting
6. **Validate hardware compatibility** - Test on simulators before hardware
7. **Batch efficiently** - Use vectorization when possible
8. **Cache compilations** - Reuse compiled circuits for inference
