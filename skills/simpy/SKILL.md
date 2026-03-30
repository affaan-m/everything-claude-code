---
name: simpy
description: Process-based discrete-event simulation framework in Python. Use this skill when building simulations of systems with processes, queues, resources, and time-based events such as manufacturing systems, service operations, network traffic, logistics, or any system where entities interact with shared resources over time.
license: MIT license
metadata:
    skill-author: K-Dense Inc.
---

# SimPy - Discrete-Event Simulation

## Overview

SimPy is a process-based discrete-event simulation framework based on standard Python. Use SimPy to model systems where entities (customers, vehicles, packets, etc.) interact with each other and compete for shared resources (servers, machines, bandwidth, etc.) over time.

**Core capabilities:**
- Process modeling using Python generator functions
- Shared resource management (servers, containers, stores)
- Event-driven scheduling and synchronization
- Real-time simulations synchronized with wall-clock time
- Comprehensive monitoring and data collection

## When to Use This Skill

Use the SimPy skill when:

1. **Modeling discrete-event systems** - Systems where events occur at irregular intervals
2. **Resource contention** - Entities compete for limited resources (servers, machines, staff)
3. **Queue analysis** - Studying waiting lines, service times, and throughput
4. **Process optimization** - Analyzing manufacturing, logistics, or service processes
5. **Network simulation** - Packet routing, bandwidth allocation, latency analysis
6. **Capacity planning** - Determining optimal resource levels for desired performance
7. **System validation** - Testing system behavior before implementation

**Not suitable for:**
- Continuous simulations with fixed time steps (consider SciPy ODE solvers)
- Independent processes without resource sharing
- Pure mathematical optimization (consider SciPy optimize)

## Quick Start

### Basic Simulation Structure

```python
import simpy

def process(env, name):
    """A simple process that waits and prints."""
    print(f'{name} starting at {env.now}')
    yield env.timeout(5)
    print(f'{name} finishing at {env.now}')

# Create environment
env = simpy.Environment()

# Start processes
env.process(process(env, 'Process 1'))
env.process(process(env, 'Process 2'))

# Run simulation
env.run(until=10)
```

### Resource Usage Pattern

```python
import simpy

def customer(env, name, resource):
    """Customer requests resource, uses it, then releases."""
    with resource.request() as req:
        yield req  # Wait for resource
        print(f'{name} got resource at {env.now}')
        yield env.timeout(3)  # Use resource
        print(f'{name} released resource at {env.now}')

env = simpy.Environment()
server = simpy.Resource(env, capacity=1)

env.process(customer(env, 'Customer 1', server))
env.process(customer(env, 'Customer 2', server))
env.run()
```

## Core Concepts

### 1. Environment

The simulation environment manages time and schedules events.

```python
import simpy

# Standard environment (runs as fast as possible)
env = simpy.Environment(initial_time=0)

# Real-time environment (synchronized with wall-clock)
import simpy.rt
env_rt = simpy.rt.RealtimeEnvironment(factor=1.0)

# Run simulation
env.run(until=100)  # Run until time 100
env.run()  # Run until no events remain
```

### 2. Processes

Processes are defined using Python generator functions (functions with `yield` statements).

```python
def my_process(env, param1, param2):
    """Process that yields events to pause execution."""
    print(f'Starting at {env.now}')

    # Wait for time to pass
    yield env.timeout(5)

    print(f'Resumed at {env.now}')

    # Wait for another event
    yield env.timeout(3)

    print(f'Done at {env.now}')
    return 'result'

# Start the process
env.process(my_process(env, 'value1', 'value2'))
```

### 3. Events

Events are the fundamental mechanism for process synchronization. Processes yield events and resume when those events are triggered.

**Common event types:**
- `env.timeout(delay)` - Wait for time to pass
- `resource.request()` - Request a resource
- `env.event()` - Create a custom event
- `env.process(func())` - Process as an event
- `event1 & event2` - Wait for all events (AllOf)
- `event1 | event2` - Wait for any event (AnyOf)

## Resources

SimPy provides several resource types for different scenarios. For comprehensive details, see `references/resources.md`.

### Resource Types Summary

| Resource Type | Use Case |
|---------------|----------|
| Resource | Limited capacity (servers, machines) |
| PriorityResource | Priority-based queuing |
| PreemptiveResource | High-priority can interrupt low-priority |
| Container | Bulk materials (fuel, water) |
| Store | Python object storage (FIFO) |
| FilterStore | Selective item retrieval |
| PriorityStore | Priority-ordered items |

### Quick Reference

```python
import simpy

env = simpy.Environment()

# Basic resource (e.g., servers)
resource = simpy.Resource(env, capacity=2)

# Priority resource
priority_resource = simpy.PriorityResource(env, capacity=1)

# Container (e.g., fuel tank)
fuel_tank = simpy.Container(env, capacity=100, init=50)

# Store (e.g., warehouse)
warehouse = simpy.Store(env, capacity=10)
```

## Common Simulation Patterns

### Pattern 1: Customer-Server Queue

```python
import simpy
import random

def customer(env, name, server):
    arrival = env.now
    with server.request() as req:
        yield req
        wait = env.now - arrival
        print(f'{name} waited {wait:.2f}, served at {env.now}')
        yield env.timeout(random.uniform(2, 4))

def customer_generator(env, server):
    i = 0
    while True:
        yield env.timeout(random.uniform(1, 3))
        i += 1
        env.process(customer(env, f'Customer {i}', server))

env = simpy.Environment()
server = simpy.Resource(env, capacity=2)
env.process(customer_generator(env, server))
env.run(until=20)
```

### Pattern 2: Producer-Consumer

```python
import simpy

def producer(env, store):
    item_id = 0
    while True:
        yield env.timeout(2)
        item = f'Item {item_id}'
        yield store.put(item)
        print(f'Produced {item} at {env.now}')
        item_id += 1

def consumer(env, store):
    while True:
        item = yield store.get()
        print(f'Consumed {item} at {env.now}')
        yield env.timeout(3)

env = simpy.Environment()
store = simpy.Store(env, capacity=10)
env.process(producer(env, store))
env.process(consumer(env, store))
env.run(until=20)
```

### Pattern 3: Parallel Task Execution

```python
import simpy

def task(env, name, duration):
    print(f'{name} starting at {env.now}')
    yield env.timeout(duration)
    print(f'{name} done at {env.now}')
    return f'{name} result'

def coordinator(env):
    # Start tasks in parallel
    task1 = env.process(task(env, 'Task 1', 5))
    task2 = env.process(task(env, 'Task 2', 3))
    task3 = env.process(task(env, 'Task 3', 4))

    # Wait for all to complete
    results = yield task1 & task2 & task3
    print(f'All done at {env.now}')

env = simpy.Environment()
env.process(coordinator(env))
env.run()
```

## Workflow Guide

### Step 1: Define the System

Identify:
- **Entities**: What moves through the system? (customers, parts, packets)
- **Resources**: What are the constraints? (servers, machines, bandwidth)
- **Processes**: What are the activities? (arrival, service, departure)
- **Metrics**: What to measure? (wait times, utilization, throughput)

### Step 2: Implement Process Functions

Create generator functions for each process type:

```python
def entity_process(env, name, resources, parameters):
    # Arrival logic
    arrival_time = env.now

    # Request resources
    with resource.request() as req:
        yield req

        # Service logic
        service_time = calculate_service_time(parameters)
        yield env.timeout(service_time)

    # Departure logic
    collect_statistics(env.now - arrival_time)
```

### Step 3: Set Up Monitoring

Use monitoring utilities to collect data. See `references/monitoring.md` for comprehensive techniques.

```python
from scripts.resource_monitor import ResourceMonitor

# Create and monitor resource
resource = simpy.Resource(env, capacity=2)
monitor = ResourceMonitor(env, resource, "Server")

# After simulation
monitor.report()
```

### Step 4: Run and Analyze

```python
# Run simulation
env.run(until=simulation_time)

# Generate reports
monitor.report()
stats.report()

# Export data for further analysis
monitor.export_csv('results.csv')
```

## Advanced Features

### Process Interaction

Processes can interact through events, process yields, and interrupts. See `references/process-interaction.md` for detailed patterns.

**Key mechanisms:**
- **Event signaling**: Shared events for coordination
- **Process yields**: Wait for other processes to complete
- **Interrupts**: Forcefully resume processes for preemption

### Real-Time Simulations

Synchronize simulation with wall-clock time for hardware-in-the-loop or interactive applications. See `references/real-time.md`.

```python
import simpy.rt

env = simpy.rt.RealtimeEnvironment(factor=1.0)  # 1:1 time mapping
# factor=0.5 means 1 sim unit = 0.5 seconds (2x faster)
```

### Comprehensive Monitoring

Monitor processes, resources, and events. See `references/monitoring.md` for techniques including:
- State variable tracking
- Resource monkey-patching
- Event tracing
- Statistical collection

## Scripts and Templates

### basic_simulation_template.py

Complete template for building queue simulations with:
- Configurable parameters
- Statistics collection
- Customer generation
- Resource usage
- Report generation

**Usage:**
```python
from scripts.basic_simulation_template import SimulationConfig, run_simulation

config = SimulationConfig()
config.num_resources = 2
config.sim_time = 100
stats = run_simulation(config)
stats.report()
```

### resource_monitor.py

Reusable monitoring utilities:
- `ResourceMonitor` - Track single resource
- `MultiResourceMonitor` - Monitor multiple resources
- `ContainerMonitor` - Track container levels
- Automatic statistics calculation
- CSV export functionality

**Usage:**
```python
from scripts.resource_monitor import ResourceMonitor

monitor = ResourceMonitor(env, resource, "My Resource")
# ... run simulation ...
monitor.report()
monitor.export_csv('data.csv')
```

## Reference Documentation

Detailed guides for specific topics:

- **`references/resources.md`** - All resource types with examples
- **`references/events.md`** - Event system and patterns
- **`references/process-interaction.md`** - Process synchronization
- **`references/monitoring.md`** - Data collection techniques
- **`references/real-time.md`** - Real-time simulation setup

## Best Practices

1. **Generator functions**: Always use `yield` in process functions
2. **Resource context managers**: Use `with resource.request() as req:` for automatic cleanup
3. **Reproducibility**: Set `random.seed()` for consistent results
4. **Monitoring**: Collect data throughout simulation, not just at the end
5. **Validation**: Compare simple cases with analytical solutions
6. **Documentation**: Comment process logic and parameter choices
7. **Modular design**: Separate process logic, statistics, and configuration

## Common Pitfalls

1. **Forgetting yield**: Processes must yield events to pause
2. **Event reuse**: Events can only be triggered once
3. **Resource leaks**: Use context managers or ensure release
4. **Blocking operations**: Avoid Python blocking calls in processes
5. **Time units**: Stay consistent with time unit interpretation
6. **Deadlocks**: Ensure at least one process can make progress

## Example Use Cases

- **Manufacturing**: Machine scheduling, production lines, inventory management
- **Healthcare**: Emergency room simulation, patient flow, staff allocation
- **Telecommunications**: Network traffic, packet routing, bandwidth allocation
- **Transportation**: Traffic flow, logistics, vehicle routing
- **Service operations**: Call centers, retail checkout, appointment scheduling
- **Computer systems**: CPU scheduling, memory management, I/O operations

