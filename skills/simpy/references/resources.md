# SimPy Shared Resources

This guide covers all resource types in SimPy for modeling congestion points and resource allocation.

## Resource Types Overview

SimPy provides three main categories of shared resources:

1. **Resources** - Limited capacity resources (e.g., gas pumps, servers)
2. **Containers** - Homogeneous bulk materials (e.g., fuel tanks, silos)
3. **Stores** - Python object storage (e.g., item queues, warehouses)

## 1. Resources

Model resources that can be used by a limited number of processes at a time.

### Resource (Basic)

The basic resource is a semaphore with specified capacity.

```python
import simpy

env = simpy.Environment()
resource = simpy.Resource(env, capacity=2)

def process(env, resource, name):
    with resource.request() as req:
        yield req
        print(f'{name} has the resource at {env.now}')
        yield env.timeout(5)
        print(f'{name} releases the resource at {env.now}')

env.process(process(env, resource, 'Process 1'))
env.process(process(env, resource, 'Process 2'))
env.process(process(env, resource, 'Process 3'))
env.run()
```

**Key properties:**
- `capacity` - Maximum number of concurrent users (default: 1)
- `count` - Current number of users
- `queue` - List of queued requests

### PriorityResource

Extends basic resource with priority levels (lower numbers = higher priority).

```python
import simpy

env = simpy.Environment()
resource = simpy.PriorityResource(env, capacity=1)

def process(env, resource, name, priority):
    with resource.request(priority=priority) as req:
        yield req
        print(f'{name} (priority {priority}) has the resource at {env.now}')
        yield env.timeout(5)

env.process(process(env, resource, 'Low priority', priority=10))
env.process(process(env, resource, 'High priority', priority=1))
env.run()
```

**Use cases:**
- Emergency services (ambulances before regular vehicles)
- VIP customer queues
- Job scheduling with priorities

### PreemptiveResource

Allows high-priority requests to interrupt lower-priority users.

```python
import simpy

env = simpy.Environment()
resource = simpy.PreemptiveResource(env, capacity=1)

def process(env, resource, name, priority):
    with resource.request(priority=priority) as req:
        try:
            yield req
            print(f'{name} acquired resource at {env.now}')
            yield env.timeout(10)
            print(f'{name} finished at {env.now}')
        except simpy.Interrupt:
            print(f'{name} was preempted at {env.now}')

env.process(process(env, resource, 'Low priority', priority=10))
env.process(process(env, resource, 'High priority', priority=1))
env.run()
```

**Use cases:**
- Operating system CPU scheduling
- Emergency room triage
- Network packet prioritization

## 2. Containers

Model production and consumption of homogeneous bulk materials (continuous or discrete).

```python
import simpy

env = simpy.Environment()
container = simpy.Container(env, capacity=100, init=50)

def producer(env, container):
    while True:
        yield env.timeout(5)
        yield container.put(20)
        print(f'Produced 20. Level: {container.level}')

def consumer(env, container):
    while True:
        yield env.timeout(7)
        yield container.get(15)
        print(f'Consumed 15. Level: {container.level}')

env.process(producer(env, container))
env.process(consumer(env, container))
env.run(until=50)
```

**Key properties:**
- `capacity` - Maximum amount (default: float('inf'))
- `level` - Current amount
- `init` - Initial amount (default: 0)

**Operations:**
- `put(amount)` - Add to container (blocks if full)
- `get(amount)` - Remove from container (blocks if insufficient)

**Use cases:**
- Gas station fuel tanks
- Buffer storage in manufacturing
- Water reservoirs
- Battery charge levels

## 3. Stores

Model production and consumption of Python objects.

### Store (Basic)

Generic FIFO object storage.

```python
import simpy

env = simpy.Environment()
store = simpy.Store(env, capacity=2)

def producer(env, store):
    for i in range(5):
        yield env.timeout(2)
        item = f'Item {i}'
        yield store.put(item)
        print(f'Produced {item} at {env.now}')

def consumer(env, store):
    while True:
        yield env.timeout(3)
        item = yield store.get()
        print(f'Consumed {item} at {env.now}')

env.process(producer(env, store))
env.process(consumer(env, store))
env.run()
```

**Key properties:**
- `capacity` - Maximum number of items (default: float('inf'))
- `items` - List of stored items

**Operations:**
- `put(item)` - Add item to store (blocks if full)
- `get()` - Remove and return item (blocks if empty)

### FilterStore

Allows retrieval of specific objects based on filter functions.

```python
import simpy

env = simpy.Environment()
store = simpy.FilterStore(env, capacity=10)

def producer(env, store):
    for color in ['red', 'blue', 'green', 'red', 'blue']:
        yield env.timeout(1)
        yield store.put({'color': color, 'time': env.now})
        print(f'Produced {color} item at {env.now}')

def consumer(env, store, color):
    while True:
        yield env.timeout(2)
        item = yield store.get(lambda x: x['color'] == color)
        print(f'{color} consumer got item from {item["time"]} at {env.now}')

env.process(producer(env, store))
env.process(consumer(env, store, 'red'))
env.process(consumer(env, store, 'blue'))
env.run(until=15)
```

**Use cases:**
- Warehouse item picking (specific SKUs)
- Job queues with skill matching
- Packet routing by destination

### PriorityStore

Items retrieved in priority order (lowest first).

```python
import simpy

class PriorityItem:
    def __init__(self, priority, data):
        self.priority = priority
        self.data = data

    def __lt__(self, other):
        return self.priority < other.priority

env = simpy.Environment()
store = simpy.PriorityStore(env, capacity=10)

def producer(env, store):
    items = [(10, 'Low'), (1, 'High'), (5, 'Medium')]
    for priority, name in items:
        yield env.timeout(1)
        yield store.put(PriorityItem(priority, name))
        print(f'Produced {name} priority item')

def consumer(env, store):
    while True:
        yield env.timeout(5)
        item = yield store.get()
        print(f'Retrieved {item.data} priority item')

env.process(producer(env, store))
env.process(consumer(env, store))
env.run()
```

**Use cases:**
- Task scheduling
- Print job queues
- Message prioritization

## Choosing the Right Resource Type

| Scenario | Resource Type |
|----------|---------------|
| Limited servers/machines | Resource |
| Priority-based queuing | PriorityResource |
| Preemptive scheduling | PreemptiveResource |
| Fuel, water, bulk materials | Container |
| Generic item queue (FIFO) | Store |
| Selective item retrieval | FilterStore |
| Priority-ordered items | PriorityStore |

## Best Practices

1. **Capacity planning**: Set realistic capacities based on system constraints
2. **Request patterns**: Use context managers (`with resource.request()`) for automatic cleanup
3. **Error handling**: Wrap preemptive resources in try-except for Interrupt handling
4. **Monitoring**: Track queue lengths and utilization (see monitoring.md)
5. **Performance**: FilterStore and PriorityStore have O(n) retrieval time; use wisely for large stores
