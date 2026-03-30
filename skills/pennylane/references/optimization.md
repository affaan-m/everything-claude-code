# Optimization in PennyLane

## Table of Contents
1. [Built-in Optimizers](#built-in-optimizers)
2. [Gradient Computation](#gradient-computation)
3. [Variational Algorithms](#variational-algorithms)
4. [QAOA](#qaoa-quantum-approximate-optimization-algorithm)
5. [Training Strategies](#training-strategies)
6. [Optimization Challenges](#optimization-challenges)

## Built-in Optimizers

### Gradient Descent Optimizer

```python
import pennylane as qml
from pennylane import numpy as np

dev = qml.device('default.qubit', wires=2)

@qml.qnode(dev)
def cost_function(params):
    qml.RX(params[0], wires=0)
    qml.RY(params[1], wires=1)
    qml.CNOT(wires=[0, 1])
    return qml.expval(qml.PauliZ(0) @ qml.PauliZ(1))

# Initialize optimizer
opt = qml.GradientDescentOptimizer(stepsize=0.1)

# Initialize parameters
params = np.array([0.1, 0.2], requires_grad=True)

# Training loop
for i in range(100):
    params = opt.step(cost_function, params)

    if i % 10 == 0:
        print(f"Step {i}: Cost = {cost_function(params):.6f}")
```

### Adam Optimizer

```python
# Adaptive learning rate optimizer
opt = qml.AdamOptimizer(stepsize=0.01, beta1=0.9, beta2=0.999)

params = np.random.random(10, requires_grad=True)

for i in range(100):
    params, cost = opt.step_and_cost(cost_function, params)

    if i % 10 == 0:
        print(f"Step {i}: Cost = {cost:.6f}")
```

### Momentum Optimizer

```python
# Gradient descent with momentum
opt = qml.MomentumOptimizer(stepsize=0.01, momentum=0.9)

params = np.random.random(5, requires_grad=True)

for i in range(100):
    params = opt.step(cost_function, params)
```

### AdaGrad Optimizer

```python
# Adaptive gradient algorithm
opt = qml.AdagradOptimizer(stepsize=0.1)

params = np.random.random(8, requires_grad=True)

for i in range(100):
    params = opt.step(cost_function, params)
```

### RMSProp Optimizer

```python
# Root mean square propagation
opt = qml.RMSPropOptimizer(stepsize=0.01, decay=0.9, eps=1e-8)

params = np.random.random(6, requires_grad=True)

for i in range(100):
    params = opt.step(cost_function, params)
```

### Nesterov Momentum Optimizer

```python
# Nesterov accelerated gradient
opt = qml.NesterovMomentumOptimizer(stepsize=0.01, momentum=0.9)

params = np.random.random(4, requires_grad=True)

for i in range(100):
    params = opt.step(cost_function, params)
```

## Gradient Computation

### Automatic Differentiation

```python
# Backpropagation (for simulators)
@qml.qnode(dev, diff_method='backprop')
def circuit_backprop(params):
    qml.RX(params[0], wires=0)
    qml.RY(params[1], wires=1)
    return qml.expval(qml.PauliZ(0))

# Compute gradient
grad_fn = qml.grad(circuit_backprop)
params = np.array([0.1, 0.2], requires_grad=True)
gradients = grad_fn(params)
```

### Parameter-Shift Rule

```python
# Hardware-compatible gradient method
@qml.qnode(dev, diff_method='parameter-shift')
def circuit_param_shift(params):
    qml.RX(params[0], wires=0)
    qml.RY(params[1], wires=1)
    qml.CNOT(wires=[0, 1])
    return qml.expval(qml.PauliZ(0))

# Works on quantum hardware
grad_fn = qml.grad(circuit_param_shift)
gradients = grad_fn(params)
```

### Finite Differences

```python
# Numerical gradient approximation
@qml.qnode(dev, diff_method='finite-diff')
def circuit_finite_diff(params):
    qml.RX(params[0], wires=0)
    return qml.expval(qml.PauliZ(0))

grad_fn = qml.grad(circuit_finite_diff)
gradients = grad_fn(params)
```

### Adjoint Method

```python
# Efficient gradient for state vector simulators
@qml.qnode(dev, diff_method='adjoint')
def circuit_adjoint(params):
    qml.RX(params[0], wires=0)
    qml.RY(params[1], wires=1)
    return qml.expval(qml.PauliZ(0))

grad_fn = qml.grad(circuit_adjoint)
gradients = grad_fn(params)
```

### Custom Gradients

```python
@qml.qnode(dev, diff_method='parameter-shift')
def circuit(params):
    qml.RX(params[0], wires=0)
    qml.RY(params[1], wires=1)
    return qml.expval(qml.PauliZ(0))

# Compute Hessian
hessian_fn = qml.jacobian(qml.grad(circuit))
hessian = hessian_fn(params)
```

### Stochastic Parameter-Shift

```python
# For circuits with many parameters
@qml.qnode(dev, diff_method='spsa')  # Simultaneous Perturbation Stochastic Approximation
def large_circuit(params):
    for i, param in enumerate(params):
        qml.RY(param, wires=i % 4)
    return qml.expval(qml.PauliZ(0))

# Efficient for high-dimensional parameter spaces
opt = qml.SPSAOptimizer(maxiter=100)
params = np.random.random(100, requires_grad=True)
params = opt.minimize(large_circuit, params)
```

## Variational Algorithms

### Variational Quantum Eigensolver (VQE)

```python
# Ground state energy calculation
def vqe(hamiltonian, ansatz, n_qubits):
    """VQE implementation."""

    dev = qml.device('default.qubit', wires=n_qubits)

    @qml.qnode(dev)
    def cost_fn(params):
        ansatz(params, wires=range(n_qubits))
        return qml.expval(hamiltonian)

    # Initialize parameters
    n_params = 10  # Depends on ansatz
    params = np.random.random(n_params, requires_grad=True)

    # Optimize
    opt = qml.AdamOptimizer(stepsize=0.1)

    energies = []
    for i in range(100):
        params, energy = opt.step_and_cost(cost_fn, params)
        energies.append(energy)

        if i % 10 == 0:
            print(f"Step {i}: Energy = {energy:.6f}")

    return params, energy, energies

# Example usage
from pennylane import qchem

symbols = ['H', 'H']
coords = np.array([0.0, 0.0, 0.0, 0.0, 0.0, 0.74])
H, n_qubits = qchem.molecular_hamiltonian(symbols, coords)

def simple_ansatz(params, wires):
    qml.BasisState(qchem.hf_state(2, n_qubits), wires=wires)
    for i, param in enumerate(params):
        qml.RY(param, wires=i % len(wires))
    for i in range(len(wires)-1):
        qml.CNOT(wires=[i, i+1])

params, energy, history = vqe(H, simple_ansatz, n_qubits)
```

### Quantum Natural Gradient

```python
# More efficient optimization for variational circuits
@qml.qnode(dev)
def circuit(params):
    for i, param in enumerate(params):
        qml.RY(param, wires=i)
    return qml.expval(qml.PauliZ(0))

# Use quantum natural gradient
opt = qml.QNGOptimizer(stepsize=0.01)
params = np.random.random(4, requires_grad=True)

for i in range(100):
    params, cost = opt.step_and_cost(circuit, params)
```

### Rotosolve

```python
# Analytical parameter update
opt = qml.RotosolveOptimizer()

@qml.qnode(dev)
def cost_fn(params):
    qml.RX(params[0], wires=0)
    qml.RY(params[1], wires=1)
    return qml.expval(qml.PauliZ(0))

params = np.array([0.1, 0.2], requires_grad=True)

for i in range(20):  # Converges quickly
    params = opt.step(cost_fn, params)
```

### Quantum Analytic Descent

```python
# Hybrid quantum-classical optimization
opt = qml.QNSPSAOptimizer(stepsize=0.01)

params = np.random.random(10, requires_grad=True)

for i in range(100):
    params = opt.step(cost_function, params)
```

## QAOA (Quantum Approximate Optimization Algorithm)

### Basic QAOA

```python
from pennylane import qaoa

# Define problem: MaxCut on a graph
edges = [(0, 1), (1, 2), (2, 0)]
graph = [(edge[0], edge[1], 1.0) for edge in edges]

# Cost Hamiltonian
cost_h = qaoa.maxcut(graph)

# Mixer Hamiltonian
mixer_h = qaoa.x_mixer(range(3))

# QAOA circuit
def qaoa_layer(gamma, alpha):
    """Single QAOA layer."""
    qaoa.cost_layer(gamma, cost_h)
    qaoa.mixer_layer(alpha, mixer_h)

@qml.qnode(dev)
def qaoa_circuit(params, depth):
    """Full QAOA circuit."""
    # Initialize in superposition
    for wire in range(3):
        qml.Hadamard(wires=wire)

    # Apply QAOA layers
    for i in range(depth):
        gamma = params[i]
        alpha = params[depth + i]
        qaoa_layer(gamma, alpha)

    # Measure in computational basis
    return qml.expval(cost_h)

# Optimize
depth = 3
params = np.random.uniform(0, 2*np.pi, 2*depth, requires_grad=True)

opt = qml.AdamOptimizer(stepsize=0.1)

for i in range(100):
    params = opt.step(lambda p: -qaoa_circuit(p, depth), params)  # Minimize negative = maximize

    if i % 10 == 0:
        print(f"Step {i}: Cost = {-qaoa_circuit(params, depth):.4f}")
```

### QAOA for MaxCut

```python
import networkx as nx

# Create graph
G = nx.cycle_graph(4)

# Generate cost Hamiltonian
cost_h, mixer_h = qaoa.maxcut(G, constrained=False)

n_wires = len(G.nodes)
dev = qml.device('default.qubit', wires=n_wires)

def qaoa_maxcut(params, depth):
    """QAOA for MaxCut problem."""

    @qml.qnode(dev)
    def circuit(gammas, betas):
        # Initialize
        for wire in range(n_wires):
            qml.Hadamard(wires=wire)

        # QAOA layers
        for gamma, beta in zip(gammas, betas):
            # Cost layer
            for edge in G.edges:
                wire1, wire2 = edge
                qml.CNOT(wires=[wire1, wire2])
                qml.RZ(gamma, wires=wire2)
                qml.CNOT(wires=[wire1, wire2])

            # Mixer layer
            for wire in range(n_wires):
                qml.RX(2 * beta, wires=wire)

        return qml.expval(cost_h)

    gammas = params[:depth]
    betas = params[depth:]
    return circuit(gammas, betas)

# Optimize
depth = 3
params = np.random.uniform(0, 2*np.pi, 2*depth, requires_grad=True)

opt = qml.AdamOptimizer(0.1)
for i in range(100):
    params = opt.step(lambda p: -qaoa_maxcut(p, depth), params)
```

### QAOA for QUBO

```python
def qaoa_qubo(Q, depth):
    """QAOA for Quadratic Unconstrained Binary Optimization."""

    n = len(Q)
    dev = qml.device('default.qubit', wires=n)

    # Build cost Hamiltonian from QUBO matrix
    coeffs = []
    obs = []

    for i in range(n):
        for j in range(i, n):
            if Q[i][j] != 0:
                if i == j:
                    coeffs.append(-Q[i][j] / 2)
                    obs.append(qml.PauliZ(i))
                else:
                    coeffs.append(-Q[i][j] / 4)
                    obs.append(qml.PauliZ(i) @ qml.PauliZ(j))

    cost_h = qml.Hamiltonian(coeffs, obs)

    @qml.qnode(dev)
    def circuit(params):
        # Initialize
        for wire in range(n):
            qml.Hadamard(wires=wire)

        # QAOA layers
        for i in range(depth):
            gamma = params[i]
            beta = params[depth + i]

            # Cost layer
            for coeff, op in zip(coeffs, obs):
                qml.exp(op, -1j * gamma * coeff)

            # Mixer layer
            for wire in range(n):
                qml.RX(2 * beta, wires=wire)

        return qml.expval(cost_h)

    return circuit

# Example QUBO
Q = np.array([[1, -2], [-2, 1]])
circuit = qaoa_qubo(Q, depth=2)

params = np.random.random(4, requires_grad=True)
opt = qml.AdamOptimizer(0.1)

for i in range(100):
    params = opt.step(circuit, params)
```

## Training Strategies

### Learning Rate Scheduling

```python
def train_with_schedule(circuit, initial_params, n_epochs):
    """Train with learning rate decay."""

    params = initial_params
    base_lr = 0.1
    decay_rate = 0.95
    decay_steps = 10

    for epoch in range(n_epochs):
        # Update learning rate
        lr = base_lr * (decay_rate ** (epoch // decay_steps))
        opt = qml.GradientDescentOptimizer(stepsize=lr)

        # Training step
        params = opt.step(circuit, params)

        if epoch % 10 == 0:
            print(f"Epoch {epoch}: LR = {lr:.4f}, Cost = {circuit(params):.4f}")

    return params
```

### Mini-Batch Training

```python
def minibatch_train(circuit, X, y, batch_size=32, n_epochs=100):
    """Mini-batch training for quantum circuits."""

    params = np.random.random(10, requires_grad=True)
    opt = qml.AdamOptimizer(stepsize=0.01)

    n_samples = len(X)

    for epoch in range(n_epochs):
        # Shuffle data
        indices = np.random.permutation(n_samples)
        X_shuffled = X[indices]
        y_shuffled = y[indices]

        # Mini-batch updates
        for i in range(0, n_samples, batch_size):
            X_batch = X_shuffled[i:i+batch_size]
            y_batch = y_shuffled[i:i+batch_size]

            # Compute batch cost
            def batch_cost(p):
                predictions = np.array([circuit(x, p) for x in X_batch])
                return np.mean((predictions - y_batch) ** 2)

            params = opt.step(batch_cost, params)

        if epoch % 10 == 0:
            loss = batch_cost(params)
            print(f"Epoch {epoch}: Loss = {loss:.4f}")

    return params
```

### Early Stopping

```python
def train_with_early_stopping(circuit, params, X_train, X_val, patience=10):
    """Train with early stopping based on validation loss."""

    opt = qml.AdamOptimizer(stepsize=0.01)

    best_val_loss = float('inf')
    patience_counter = 0
    best_params = params.copy()

    for epoch in range(1000):
        # Training step
        params = opt.step(lambda p: cost_fn(p, X_train), params)

        # Validation
        val_loss = cost_fn(params, X_val)

        if val_loss < best_val_loss:
            best_val_loss = val_loss
            best_params = params.copy()
            patience_counter = 0
        else:
            patience_counter += 1

        if patience_counter >= patience:
            print(f"Early stopping at epoch {epoch}")
            break

    return best_params
```

### Gradient Clipping

```python
def train_with_gradient_clipping(circuit, params, max_norm=1.0):
    """Train with gradient clipping to prevent exploding gradients."""

    opt = qml.GradientDescentOptimizer(stepsize=0.1)

    for i in range(100):
        # Compute gradients
        grad_fn = qml.grad(circuit)
        grads = grad_fn(params)

        # Clip gradients
        grad_norm = np.linalg.norm(grads)
        if grad_norm > max_norm:
            grads = grads * (max_norm / grad_norm)

        # Manual update with clipped gradients
        params = params - opt.stepsize * grads

        if i % 10 == 0:
            print(f"Step {i}: Grad norm = {grad_norm:.4f}")

    return params
```

## Optimization Challenges

### Barren Plateaus

```python
def detect_barren_plateau(circuit, params, n_samples=100):
    """Detect barren plateau by measuring gradient variance."""

    grad_fn = qml.grad(circuit)
    grad_variances = []

    for _ in range(n_samples):
        # Random initialization
        random_params = np.random.uniform(-np.pi, np.pi, len(params))

        # Compute gradient
        grads = grad_fn(random_params)
        grad_variances.append(np.var(grads))

    mean_var = np.mean(grad_variances)

    print(f"Mean gradient variance: {mean_var:.6f}")

    if mean_var < 1e-6:
        print("Warning: Barren plateau detected!")

    return mean_var
```

### Parameter Initialization

```python
def initialize_params_smart(n_params, strategy='small_random'):
    """Smart parameter initialization strategies."""

    if strategy == 'small_random':
        # Small random values
        return np.random.uniform(-0.1, 0.1, n_params, requires_grad=True)

    elif strategy == 'xavier':
        # Xavier initialization
        return np.random.normal(0, 1/np.sqrt(n_params), n_params, requires_grad=True)

    elif strategy == 'identity':
        # Start near identity (zeros for rotations)
        return np.zeros(n_params, requires_grad=True)

    elif strategy == 'layerwise':
        # Layer-dependent initialization
        return np.array([0.1 / (i+1) for i in range(n_params)], requires_grad=True)
```

### Local Minima Escape

```python
def train_with_restarts(circuit, n_restarts=5):
    """Multiple random restarts to escape local minima."""

    best_cost = float('inf')
    best_params = None

    for restart in range(n_restarts):
        # Random initialization
        params = np.random.uniform(-np.pi, np.pi, 10, requires_grad=True)

        # Optimize
        opt = qml.AdamOptimizer(stepsize=0.1)
        for i in range(100):
            params = opt.step(circuit, params)

        # Check if better
        cost = circuit(params)
        if cost < best_cost:
            best_cost = cost
            best_params = params

        print(f"Restart {restart}: Cost = {cost:.6f}")

    return best_params, best_cost
```

## Best Practices

1. **Choose appropriate optimizer** - Adam for general use, QNG for variational circuits
2. **Use parameter-shift on hardware** - Backprop only works on simulators
3. **Initialize carefully** - Avoid barren plateaus with smart initialization
4. **Monitor gradients** - Check for vanishing/exploding gradients
5. **Use learning rate schedules** - Decay learning rate over time
6. **Try multiple restarts** - Escape local minima
7. **Validate on test set** - Prevent overfitting
8. **Profile optimization** - Identify bottlenecks
9. **Clip gradients** - Prevent instability
10. **Start shallow** - Use fewer layers initially, then grow
