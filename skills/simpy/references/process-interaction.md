# SimPy Process Interaction

This guide covers the mechanisms for processes to interact and synchronize in SimPy simulations.

## Interaction Mechanisms Overview

SimPy provides three primary ways for processes to interact:

1. **Event-based passivation/reactivation** - Shared events for signaling
2. **Waiting for process termination** - Yielding process objects
3. **Interruption** - Forcefully resuming paused processes

## 1. Event-Based Passivation and Reactivation

Processes can share events to coordinate their execution.

### Basic Signal Pattern

```python
import simpy

def controller(env, signal_event):
    print(f'Controller: Preparing at {env.now}')
    yield env.timeout(5)
    print(f'Controller: Sending signal at {env.now}')
    signal_event.succeed()

def worker(env, signal_event):
    print(f'Worker: Waiting for signal at {env.now}')
    yield signal_event
    print(f'Worker: Received signal, starting work at {env.now}')
    yield env.timeout(3)
    print(f'Worker: Work complete at {env.now}')

env = simpy.Environment()
signal = env.event()
env.process(controller(env, signal))
env.process(worker(env, signal))
env.run()
```

**Use cases:**
- Start signals for coordinated operations
- Completion notifications
- Broadcasting state changes

### Multiple Waiters

Multiple processes can wait for the same signal event.

```python
import simpy

def broadcaster(env, signal):
    yield env.timeout(5)
    print(f'Broadcasting signal at {env.now}')
    signal.succeed(value='Go!')

def listener(env, name, signal):
    print(f'{name}: Waiting at {env.now}')
    msg = yield signal
    print(f'{name}: Received "{msg}" at {env.now}')
    yield env.timeout(2)
    print(f'{name}: Done at {env.now}')

env = simpy.Environment()
broadcast_signal = env.event()

env.process(broadcaster(env, broadcast_signal))
for i in range(3):
    env.process(listener(env, f'Listener {i+1}', broadcast_signal))

env.run()
```

### Barrier Synchronization

```python
import simpy

class Barrier:
    def __init__(self, env, n):
        self.env = env
        self.n = n
        self.count = 0
        self.event = env.event()

    def wait(self):
        self.count += 1
        if self.count >= self.n:
            self.event.succeed()
        return self.event

def worker(env, barrier, name, work_time):
    print(f'{name}: Working at {env.now}')
    yield env.timeout(work_time)
    print(f'{name}: Reached barrier at {env.now}')
    yield barrier.wait()
    print(f'{name}: Passed barrier at {env.now}')

env = simpy.Environment()
barrier = Barrier(env, 3)

env.process(worker(env, barrier, 'Worker A', 3))
env.process(worker(env, barrier, 'Worker B', 5))
env.process(worker(env, barrier, 'Worker C', 7))

env.run()
```

## 2. Waiting for Process Termination

Processes are events themselves, so you can yield them to wait for completion.

### Sequential Process Execution

```python
import simpy

def task(env, name, duration):
    print(f'{name}: Starting at {env.now}')
    yield env.timeout(duration)
    print(f'{name}: Completed at {env.now}')
    return f'{name} result'

def sequential_coordinator(env):
    # Execute tasks sequentially
    result1 = yield env.process(task(env, 'Task 1', 5))
    print(f'Coordinator: {result1}')

    result2 = yield env.process(task(env, 'Task 2', 3))
    print(f'Coordinator: {result2}')

    result3 = yield env.process(task(env, 'Task 3', 4))
    print(f'Coordinator: {result3}')

env = simpy.Environment()
env.process(sequential_coordinator(env))
env.run()
```

### Parallel Process Execution

```python
import simpy

def task(env, name, duration):
    print(f'{name}: Starting at {env.now}')
    yield env.timeout(duration)
    print(f'{name}: Completed at {env.now}')
    return f'{name} result'

def parallel_coordinator(env):
    # Start all tasks
    task1 = env.process(task(env, 'Task 1', 5))
    task2 = env.process(task(env, 'Task 2', 3))
    task3 = env.process(task(env, 'Task 3', 4))

    # Wait for all to complete
    results = yield task1 & task2 & task3
    print(f'All tasks completed at {env.now}')
    print(f'Task 1 result: {task1.value}')
    print(f'Task 2 result: {task2.value}')
    print(f'Task 3 result: {task3.value}')

env = simpy.Environment()
env.process(parallel_coordinator(env))
env.run()
```

### First-to-Complete Pattern

```python
import simpy

def server(env, name, processing_time):
    print(f'{name}: Starting request at {env.now}')
    yield env.timeout(processing_time)
    print(f'{name}: Completed at {env.now}')
    return name

def load_balancer(env):
    # Send request to multiple servers
    server1 = env.process(server(env, 'Server 1', 5))
    server2 = env.process(server(env, 'Server 2', 3))
    server3 = env.process(server(env, 'Server 3', 7))

    # Wait for first to respond
    result = yield server1 | server2 | server3

    # Get the winner
    winner = list(result.values())[0]
    print(f'Load balancer: {winner} responded first at {env.now}')

env = simpy.Environment()
env.process(load_balancer(env))
env.run()
```

## 3. Process Interruption

Processes can be interrupted using `process.interrupt()`, which throws an `Interrupt` exception.

### Basic Interruption

```python
import simpy

def worker(env):
    try:
        print(f'Worker: Starting long task at {env.now}')
        yield env.timeout(10)
        print(f'Worker: Task completed at {env.now}')
    except simpy.Interrupt as interrupt:
        print(f'Worker: Interrupted at {env.now}')
        print(f'Interrupt cause: {interrupt.cause}')

def interrupter(env, target_process):
    yield env.timeout(5)
    print(f'Interrupter: Interrupting worker at {env.now}')
    target_process.interrupt(cause='Higher priority task')

env = simpy.Environment()
worker_process = env.process(worker(env))
env.process(interrupter(env, worker_process))
env.run()
```

### Resumable Interruption

Process can re-yield the same event after interruption to continue waiting.

```python
import simpy

def resumable_worker(env):
    work_left = 10

    while work_left > 0:
        try:
            print(f'Worker: Working ({work_left} units left) at {env.now}')
            start = env.now
            yield env.timeout(work_left)
            work_left = 0
            print(f'Worker: Completed at {env.now}')
        except simpy.Interrupt:
            work_left -= (env.now - start)
            print(f'Worker: Interrupted! {work_left} units left at {env.now}')

def interrupter(env, worker_proc):
    yield env.timeout(3)
    worker_proc.interrupt()
    yield env.timeout(2)
    worker_proc.interrupt()

env = simpy.Environment()
worker_proc = env.process(resumable_worker(env))
env.process(interrupter(env, worker_proc))
env.run()
```

### Interrupt with Custom Cause

```python
import simpy

def machine(env, name):
    while True:
        try:
            print(f'{name}: Operating at {env.now}')
            yield env.timeout(5)
        except simpy.Interrupt as interrupt:
            if interrupt.cause == 'maintenance':
                print(f'{name}: Maintenance required at {env.now}')
                yield env.timeout(2)
                print(f'{name}: Maintenance complete at {env.now}')
            elif interrupt.cause == 'emergency':
                print(f'{name}: Emergency stop at {env.now}')
                break

def maintenance_scheduler(env, machine_proc):
    yield env.timeout(7)
    machine_proc.interrupt(cause='maintenance')
    yield env.timeout(10)
    machine_proc.interrupt(cause='emergency')

env = simpy.Environment()
machine_proc = env.process(machine(env, 'Machine 1'))
env.process(maintenance_scheduler(env, machine_proc))
env.run()
```

### Preemptive Resource with Interruption

```python
import simpy

def user(env, name, resource, priority, duration):
    with resource.request(priority=priority) as req:
        try:
            yield req
            print(f'{name} (priority {priority}): Got resource at {env.now}')
            yield env.timeout(duration)
            print(f'{name}: Done at {env.now}')
        except simpy.Interrupt:
            print(f'{name}: Preempted at {env.now}')

env = simpy.Environment()
resource = simpy.PreemptiveResource(env, capacity=1)

env.process(user(env, 'Low priority user', resource, priority=10, duration=10))
env.process(user(env, 'High priority user', resource, priority=1, duration=5))
env.run()
```

## Advanced Patterns

### Producer-Consumer with Signaling

```python
import simpy

class Buffer:
    def __init__(self, env, capacity):
        self.env = env
        self.capacity = capacity
        self.items = []
        self.item_available = env.event()

    def put(self, item):
        if len(self.items) < self.capacity:
            self.items.append(item)
            if not self.item_available.triggered:
                self.item_available.succeed()
            return True
        return False

    def get(self):
        if self.items:
            return self.items.pop(0)
        return None

def producer(env, buffer):
    item_id = 0
    while True:
        yield env.timeout(2)
        item = f'Item {item_id}'
        if buffer.put(item):
            print(f'Producer: Added {item} at {env.now}')
            item_id += 1

def consumer(env, buffer):
    while True:
        if buffer.items:
            item = buffer.get()
            print(f'Consumer: Retrieved {item} at {env.now}')
            yield env.timeout(3)
        else:
            print(f'Consumer: Waiting for items at {env.now}')
            yield buffer.item_available
            buffer.item_available = env.event()

env = simpy.Environment()
buffer = Buffer(env, capacity=5)
env.process(producer(env, buffer))
env.process(consumer(env, buffer))
env.run(until=20)
```

### Handshake Protocol

```python
import simpy

def sender(env, request_event, acknowledge_event):
    for i in range(3):
        print(f'Sender: Sending request {i} at {env.now}')
        request_event.succeed(value=f'Request {i}')
        yield acknowledge_event
        print(f'Sender: Received acknowledgment at {env.now}')

        # Reset events for next iteration
        request_event = env.event()
        acknowledge_event = env.event()
        yield env.timeout(1)

def receiver(env, request_event, acknowledge_event):
    for i in range(3):
        request = yield request_event
        print(f'Receiver: Got {request} at {env.now}')
        yield env.timeout(2)  # Process request
        acknowledge_event.succeed()
        print(f'Receiver: Sent acknowledgment at {env.now}')

        # Reset for next iteration
        request_event = env.event()
        acknowledge_event = env.event()

env = simpy.Environment()
request = env.event()
ack = env.event()
env.process(sender(env, request, ack))
env.process(receiver(env, request, ack))
env.run()
```

## Best Practices

1. **Choose the right mechanism**:
   - Use events for signals and broadcasts
   - Use process yields for sequential/parallel workflows
   - Use interrupts for preemption and emergency handling

2. **Exception handling**: Always wrap interrupt-prone code in try-except blocks

3. **Event lifecycle**: Remember that events can only be triggered once; create new events for repeated signaling

4. **Process references**: Store process objects if you need to interrupt them later

5. **Cause information**: Use interrupt causes to communicate why interruption occurred

6. **Resumable patterns**: Track progress to enable resumption after interruption

7. **Avoid deadlocks**: Ensure at least one process can make progress at any time
