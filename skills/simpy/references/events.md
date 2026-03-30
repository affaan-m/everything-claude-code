# SimPy Events System

This guide covers the event system in SimPy, which forms the foundation of discrete-event simulation.

## Event Basics

Events are the core mechanism for controlling simulation flow. Processes yield events and resume when those events are triggered.

### Event Lifecycle

Events progress through three states:

1. **Not triggered** - Initial state as memory objects
2. **Triggered** - Scheduled in event queue; `triggered` property is `True`
3. **Processed** - Removed from queue with callbacks executed; `processed` property is `True`

```python
import simpy

env = simpy.Environment()

# Create an event
event = env.event()
print(f'Triggered: {event.triggered}, Processed: {event.processed}')  # Both False

# Trigger the event
event.succeed(value='Event result')
print(f'Triggered: {event.triggered}, Processed: {event.processed}')  # True, False

# Run to process the event
env.run()
print(f'Triggered: {event.triggered}, Processed: {event.processed}')  # True, True
print(f'Value: {event.value}')  # 'Event result'
```

## Core Event Types

### Timeout

Controls time progression in simulations. Most common event type.

```python
import simpy

def process(env):
    print(f'Starting at {env.now}')
    yield env.timeout(5)
    print(f'Resumed at {env.now}')

    # Timeout with value
    result = yield env.timeout(3, value='Done')
    print(f'Result: {result} at {env.now}')

env = simpy.Environment()
env.process(process(env))
env.run()
```

**Usage:**
- `env.timeout(delay)` - Wait for specified time
- `env.timeout(delay, value=val)` - Wait and return value

### Process Events

Processes themselves are events, allowing processes to wait for other processes to complete.

```python
import simpy

def worker(env, name, duration):
    print(f'{name} starting at {env.now}')
    yield env.timeout(duration)
    print(f'{name} finished at {env.now}')
    return f'{name} result'

def coordinator(env):
    # Start worker processes
    worker1 = env.process(worker(env, 'Worker 1', 5))
    worker2 = env.process(worker(env, 'Worker 2', 3))

    # Wait for worker1 to complete
    result = yield worker1
    print(f'Coordinator received: {result}')

    # Wait for worker2
    result = yield worker2
    print(f'Coordinator received: {result}')

env = simpy.Environment()
env.process(coordinator(env))
env.run()
```

### Event

Generic event that can be manually triggered.

```python
import simpy

def waiter(env, event):
    print(f'Waiting for event at {env.now}')
    value = yield event
    print(f'Event received with value: {value} at {env.now}')

def triggerer(env, event):
    yield env.timeout(5)
    print(f'Triggering event at {env.now}')
    event.succeed(value='Hello!')

env = simpy.Environment()
event = env.event()
env.process(waiter(env, event))
env.process(triggerer(env, event))
env.run()
```

## Composite Events

### AllOf - Wait for Multiple Events

Triggers when all specified events have occurred.

```python
import simpy

def process(env):
    # Start multiple tasks
    task1 = env.timeout(3, value='Task 1 done')
    task2 = env.timeout(5, value='Task 2 done')
    task3 = env.timeout(4, value='Task 3 done')

    # Wait for all to complete
    results = yield simpy.AllOf(env, [task1, task2, task3])
    print(f'All tasks completed at {env.now}')
    print(f'Results: {results}')

    # Alternative syntax using & operator
    task4 = env.timeout(2)
    task5 = env.timeout(3)
    yield task4 & task5
    print(f'Tasks 4 and 5 completed at {env.now}')

env = simpy.Environment()
env.process(process(env))
env.run()
```

**Returns:** Dictionary mapping events to their values

**Use cases:**
- Parallel task completion
- Barrier synchronization
- Waiting for multiple resources

### AnyOf - Wait for Any Event

Triggers when at least one specified event has occurred.

```python
import simpy

def process(env):
    # Start multiple tasks with different durations
    fast_task = env.timeout(2, value='Fast')
    slow_task = env.timeout(10, value='Slow')

    # Wait for first to complete
    results = yield simpy.AnyOf(env, [fast_task, slow_task])
    print(f'First task completed at {env.now}')
    print(f'Results: {results}')

    # Alternative syntax using | operator
    task1 = env.timeout(5)
    task2 = env.timeout(3)
    yield task1 | task2
    print(f'One of the tasks completed at {env.now}')

env = simpy.Environment()
env.process(process(env))
env.run()
```

**Returns:** Dictionary with completed events and their values

**Use cases:**
- Racing conditions
- Timeout mechanisms
- First-to-respond scenarios

## Event Triggering Methods

Events can be triggered in three ways:

### succeed(value=None)

Marks event as successful.

```python
event = env.event()
event.succeed(value='Success!')
```

### fail(exception)

Marks event as failed with an exception.

```python
def process(env):
    event = env.event()
    event.fail(ValueError('Something went wrong'))

    try:
        yield event
    except ValueError as e:
        print(f'Caught exception: {e}')

env = simpy.Environment()
env.process(process(env))
env.run()
```

### trigger(event)

Copies another event's outcome.

```python
event1 = env.event()
event1.succeed(value='Original')

event2 = env.event()
event2.trigger(event1)  # event2 now has same outcome as event1
```

## Callbacks

Attach functions to execute when events are triggered.

```python
import simpy

def callback(event):
    print(f'Callback executed! Event value: {event.value}')

def process(env):
    event = env.timeout(5, value='Done')
    event.callbacks.append(callback)
    yield event

env = simpy.Environment()
env.process(process(env))
env.run()
```

**Note:** Yielding an event from a process automatically adds the process's resume method as a callback.

## Event Sharing

Multiple processes can wait for the same event.

```python
import simpy

def waiter(env, name, event):
    print(f'{name} waiting at {env.now}')
    value = yield event
    print(f'{name} resumed with {value} at {env.now}')

def trigger_event(env, event):
    yield env.timeout(5)
    event.succeed(value='Go!')

env = simpy.Environment()
shared_event = env.event()

env.process(waiter(env, 'Process 1', shared_event))
env.process(waiter(env, 'Process 2', shared_event))
env.process(waiter(env, 'Process 3', shared_event))
env.process(trigger_event(env, shared_event))

env.run()
```

**Use cases:**
- Broadcasting signals
- Barrier synchronization
- Coordinated process resumption

## Advanced Event Patterns

### Timeout with Cancellation

```python
import simpy

def process_with_timeout(env):
    work = env.timeout(10, value='Work complete')
    timeout = env.timeout(5, value='Timeout!')

    # Race between work and timeout
    result = yield work | timeout

    if work in result:
        print(f'Work completed: {result[work]}')
    else:
        print(f'Timed out: {result[timeout]}')

env = simpy.Environment()
env.process(process_with_timeout(env))
env.run()
```

### Event Chaining

```python
import simpy

def event_chain(env):
    # Create chain of dependent events
    event1 = env.event()
    event2 = env.event()
    event3 = env.event()

    def trigger_sequence(env):
        yield env.timeout(2)
        event1.succeed(value='Step 1')
        yield env.timeout(2)
        event2.succeed(value='Step 2')
        yield env.timeout(2)
        event3.succeed(value='Step 3')

    env.process(trigger_sequence(env))

    # Wait for sequence
    val1 = yield event1
    print(f'{val1} at {env.now}')
    val2 = yield event2
    print(f'{val2} at {env.now}')
    val3 = yield event3
    print(f'{val3} at {env.now}')

env = simpy.Environment()
env.process(event_chain(env))
env.run()
```

### Conditional Events

```python
import simpy

def conditional_process(env):
    temperature = 20

    if temperature > 25:
        yield env.timeout(5)  # Cooling required
        print('System cooled')
    else:
        yield env.timeout(1)  # No cooling needed
        print('Temperature acceptable')

env = simpy.Environment()
env.process(conditional_process(env))
env.run()
```

## Best Practices

1. **Always yield events**: Processes must yield events to pause execution
2. **Don't trigger events multiple times**: Events can only be triggered once
3. **Handle failures**: Use try-except when yielding events that might fail
4. **Composite events for parallelism**: Use AllOf/AnyOf for concurrent operations
5. **Shared events for broadcasting**: Multiple processes can yield the same event
6. **Event values for data passing**: Use event values to pass results between processes
