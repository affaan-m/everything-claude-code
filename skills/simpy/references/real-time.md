# SimPy Real-Time Simulations

This guide covers real-time simulation capabilities in SimPy, where simulation time is synchronized with wall-clock time.

## Overview

Real-time simulations synchronize simulation time with actual wall-clock time. This is useful for:

- **Hardware-in-the-loop (HIL)** testing
- **Human interaction** with simulations
- **Algorithm behavior analysis** under real-time constraints
- **System integration** testing
- **Demonstration** purposes

## RealtimeEnvironment

Replace the standard `Environment` with `simpy.rt.RealtimeEnvironment` to enable real-time synchronization.

### Basic Usage

```python
import simpy.rt

def process(env):
    while True:
        print(f'Tick at {env.now}')
        yield env.timeout(1)

# Real-time environment with 1:1 time mapping
env = simpy.rt.RealtimeEnvironment(factor=1.0)
env.process(process(env))
env.run(until=5)
```

### Constructor Parameters

```python
simpy.rt.RealtimeEnvironment(
    initial_time=0,      # Starting simulation time
    factor=1.0,          # Real time per simulation time unit
    strict=True          # Raise errors on timing violations
)
```

## Time Scaling with Factor

The `factor` parameter controls how simulation time maps to real time.

### Factor Examples

```python
import simpy.rt
import time

def timed_process(env, label):
    start = time.time()
    print(f'{label}: Starting at {env.now}')
    yield env.timeout(2)
    elapsed = time.time() - start
    print(f'{label}: Completed at {env.now} (real time: {elapsed:.2f}s)')

# Factor = 1.0: 1 simulation time unit = 1 second
print('Factor = 1.0 (2 sim units = 2 seconds)')
env = simpy.rt.RealtimeEnvironment(factor=1.0)
env.process(timed_process(env, 'Normal speed'))
env.run()

# Factor = 0.5: 1 simulation time unit = 0.5 seconds
print('\nFactor = 0.5 (2 sim units = 1 second)')
env = simpy.rt.RealtimeEnvironment(factor=0.5)
env.process(timed_process(env, 'Double speed'))
env.run()

# Factor = 2.0: 1 simulation time unit = 2 seconds
print('\nFactor = 2.0 (2 sim units = 4 seconds)')
env = simpy.rt.RealtimeEnvironment(factor=2.0)
env.process(timed_process(env, 'Half speed'))
env.run()
```

**Factor interpretation:**
- `factor=1.0` → 1 simulation time unit takes 1 real second
- `factor=0.1` → 1 simulation time unit takes 0.1 real seconds (10x faster)
- `factor=60` → 1 simulation time unit takes 60 real seconds (1 minute)

## Strict Mode

### strict=True (Default)

Raises `RuntimeError` if computation exceeds allocated real-time budget.

```python
import simpy.rt
import time

def heavy_computation(env):
    print(f'Starting computation at {env.now}')
    yield env.timeout(1)

    # Simulate heavy computation (exceeds 1 second budget)
    time.sleep(1.5)

    print(f'Computation done at {env.now}')

env = simpy.rt.RealtimeEnvironment(factor=1.0, strict=True)
env.process(heavy_computation(env))

try:
    env.run()
except RuntimeError as e:
    print(f'Error: {e}')
```

### strict=False

Allows simulation to run slower than intended without crashing.

```python
import simpy.rt
import time

def heavy_computation(env):
    print(f'Starting at {env.now}')
    yield env.timeout(1)

    # Heavy computation
    time.sleep(1.5)

    print(f'Done at {env.now}')

env = simpy.rt.RealtimeEnvironment(factor=1.0, strict=False)
env.process(heavy_computation(env))
env.run()

print('Simulation completed (slower than real-time)')
```

**Use strict=False when:**
- Development and debugging
- Computation time is unpredictable
- Acceptable to run slower than target rate
- Analyzing worst-case behavior

## Hardware-in-the-Loop Example

```python
import simpy.rt

class HardwareInterface:
    """Simulated hardware interface."""

    def __init__(self):
        self.sensor_value = 0

    def read_sensor(self):
        """Simulate reading from hardware sensor."""
        import random
        self.sensor_value = random.uniform(20.0, 30.0)
        return self.sensor_value

    def write_actuator(self, value):
        """Simulate writing to hardware actuator."""
        print(f'Actuator set to {value:.2f}')

def control_loop(env, hardware, setpoint):
    """Simple control loop running in real-time."""
    while True:
        # Read sensor
        sensor_value = hardware.read_sensor()
        print(f'[{env.now}] Sensor: {sensor_value:.2f}°C')

        # Simple proportional control
        error = setpoint - sensor_value
        control_output = error * 0.1

        # Write actuator
        hardware.write_actuator(control_output)

        # Control loop runs every 0.5 seconds
        yield env.timeout(0.5)

# Real-time environment: 1 sim unit = 1 second
env = simpy.rt.RealtimeEnvironment(factor=1.0, strict=False)
hardware = HardwareInterface()
setpoint = 25.0

env.process(control_loop(env, hardware, setpoint))
env.run(until=5)
```

## Human Interaction Example

```python
import simpy.rt

def interactive_process(env):
    """Process that waits for simulated user input."""
    print('Simulation started. Events will occur in real-time.')

    yield env.timeout(2)
    print(f'[{env.now}] Event 1: System startup')

    yield env.timeout(3)
    print(f'[{env.now}] Event 2: Initialization complete')

    yield env.timeout(2)
    print(f'[{env.now}] Event 3: Ready for operation')

# Real-time environment for human-paced demonstration
env = simpy.rt.RealtimeEnvironment(factor=1.0)
env.process(interactive_process(env))
env.run()
```

## Monitoring Real-Time Performance

```python
import simpy.rt
import time

class RealTimeMonitor:
    def __init__(self):
        self.step_times = []
        self.drift_values = []

    def record_step(self, sim_time, real_time, expected_real_time):
        self.step_times.append(sim_time)
        drift = real_time - expected_real_time
        self.drift_values.append(drift)

    def report(self):
        if self.drift_values:
            avg_drift = sum(self.drift_values) / len(self.drift_values)
            max_drift = max(abs(d) for d in self.drift_values)
            print(f'\nReal-time performance:')
            print(f'Average drift: {avg_drift*1000:.2f} ms')
            print(f'Maximum drift: {max_drift*1000:.2f} ms')

def monitored_process(env, monitor, start_time, factor):
    for i in range(5):
        step_start = time.time()
        yield env.timeout(1)

        real_elapsed = time.time() - start_time
        expected_elapsed = env.now * factor
        monitor.record_step(env.now, real_elapsed, expected_elapsed)

        print(f'Sim time: {env.now}, Real time: {real_elapsed:.2f}s, ' +
              f'Expected: {expected_elapsed:.2f}s')

start = time.time()
factor = 1.0
env = simpy.rt.RealtimeEnvironment(factor=factor, strict=False)
monitor = RealTimeMonitor()

env.process(monitored_process(env, monitor, start, factor))
env.run()
monitor.report()
```

## Mixed Real-Time and Fast Simulation

```python
import simpy.rt

def background_simulation(env):
    """Fast background simulation."""
    for i in range(100):
        yield env.timeout(0.01)
    print(f'Background simulation completed at {env.now}')

def real_time_display(env):
    """Real-time display updates."""
    for i in range(5):
        print(f'Display update at {env.now}')
        yield env.timeout(1)

# Note: This is conceptual - SimPy doesn't directly support mixed modes
# Consider running separate simulations or using strict=False
env = simpy.rt.RealtimeEnvironment(factor=1.0, strict=False)
env.process(background_simulation(env))
env.process(real_time_display(env))
env.run()
```

## Converting Standard to Real-Time

Converting a standard simulation to real-time is straightforward:

```python
import simpy
import simpy.rt

def process(env):
    print(f'Event at {env.now}')
    yield env.timeout(1)
    print(f'Event at {env.now}')
    yield env.timeout(1)
    print(f'Event at {env.now}')

# Standard simulation (runs instantly)
print('Standard simulation:')
env = simpy.Environment()
env.process(process(env))
env.run()

# Real-time simulation (2 real seconds)
print('\nReal-time simulation:')
env_rt = simpy.rt.RealtimeEnvironment(factor=1.0)
env_rt.process(process(env_rt))
env_rt.run()
```

## Best Practices

1. **Factor selection**: Choose factor based on hardware/human constraints
   - Human interaction: `factor=1.0` (1:1 time mapping)
   - Fast hardware: `factor=0.01` (100x faster)
   - Slow processes: `factor=60` (1 sim unit = 1 minute)

2. **Strict mode usage**:
   - Use `strict=True` for timing validation
   - Use `strict=False` for development and variable workloads

3. **Computation budget**: Ensure process logic executes faster than timeout duration

4. **Error handling**: Wrap real-time runs in try-except for timing violations

5. **Testing strategy**:
   - Develop with standard Environment (fast iteration)
   - Test with RealtimeEnvironment (validation)
   - Deploy with appropriate factor and strict settings

6. **Performance monitoring**: Track drift between simulation and real time

7. **Graceful degradation**: Use `strict=False` when timing guarantees aren't critical

## Common Patterns

### Periodic Real-Time Tasks

```python
import simpy.rt

def periodic_task(env, name, period, duration):
    """Task that runs periodically in real-time."""
    while True:
        start = env.now
        print(f'{name}: Starting at {start}')

        # Simulate work
        yield env.timeout(duration)

        print(f'{name}: Completed at {env.now}')

        # Wait for next period
        elapsed = env.now - start
        wait_time = period - elapsed
        if wait_time > 0:
            yield env.timeout(wait_time)

env = simpy.rt.RealtimeEnvironment(factor=1.0)
env.process(periodic_task(env, 'Task', period=2.0, duration=0.5))
env.run(until=6)
```

### Synchronized Multi-Device Control

```python
import simpy.rt

def device_controller(env, device_id, update_rate):
    """Control loop for individual device."""
    while True:
        print(f'Device {device_id}: Update at {env.now}')
        yield env.timeout(update_rate)

# All devices synchronized to real-time
env = simpy.rt.RealtimeEnvironment(factor=1.0)

# Different update rates for different devices
env.process(device_controller(env, 'A', 1.0))
env.process(device_controller(env, 'B', 0.5))
env.process(device_controller(env, 'C', 2.0))

env.run(until=5)
```

## Limitations

1. **Performance**: Real-time simulation adds overhead; not suitable for high-frequency events
2. **Synchronization**: Single-threaded; all processes share same time base
3. **Precision**: Limited by Python's time resolution and system scheduling
4. **Strict mode**: May raise errors frequently with computationally intensive processes
5. **Platform-dependent**: Timing accuracy varies across operating systems
