#!/usr/bin/env python3
"""
SimPy Resource Monitoring Utilities

This module provides reusable classes and functions for monitoring
SimPy resources during simulation. Includes utilities for tracking
queue lengths, utilization, wait times, and generating reports.
"""

import simpy
from collections import defaultdict
from typing import List, Tuple, Dict, Any


class ResourceMonitor:
    """
    Monitor resource usage with detailed statistics tracking.

    Tracks:
    - Queue lengths over time
    - Resource utilization
    - Wait times for requests
    - Request and release events
    """

    def __init__(self, env: simpy.Environment, resource: simpy.Resource, name: str = "Resource"):
        """
        Initialize the resource monitor.

        Args:
            env: SimPy environment
            resource: Resource to monitor
            name: Name for the resource (for reporting)
        """
        self.env = env
        self.resource = resource
        self.name = name

        # Data storage
        self.queue_data: List[Tuple[float, int]] = [(0, 0)]
        self.utilization_data: List[Tuple[float, float]] = [(0, 0.0)]
        self.request_times: Dict[Any, float] = {}
        self.wait_times: List[float] = []
        self.events: List[Tuple[float, str, Dict]] = []

        # Patch the resource
        self._patch_resource()

    def _patch_resource(self):
        """Patch resource methods to intercept requests and releases."""
        original_request = self.resource.request
        original_release = self.resource.release

        def monitored_request(*args, **kwargs):
            req = original_request(*args, **kwargs)

            # Record request event
            queue_length = len(self.resource.queue)
            utilization = self.resource.count / self.resource.capacity

            self.queue_data.append((self.env.now, queue_length))
            self.utilization_data.append((self.env.now, utilization))
            self.events.append((self.env.now, 'request', {
                'queue_length': queue_length,
                'utilization': utilization
            }))

            # Store request time for wait time calculation
            self.request_times[req] = self.env.now

            # Add callback to record when request is granted
            def on_granted(event):
                if req in self.request_times:
                    wait_time = self.env.now - self.request_times[req]
                    self.wait_times.append(wait_time)
                    del self.request_times[req]

            req.callbacks.append(on_granted)
            return req

        def monitored_release(*args, **kwargs):
            result = original_release(*args, **kwargs)

            # Record release event
            queue_length = len(self.resource.queue)
            utilization = self.resource.count / self.resource.capacity

            self.queue_data.append((self.env.now, queue_length))
            self.utilization_data.append((self.env.now, utilization))
            self.events.append((self.env.now, 'release', {
                'queue_length': queue_length,
                'utilization': utilization
            }))

            return result

        self.resource.request = monitored_request
        self.resource.release = monitored_release

    def average_queue_length(self) -> float:
        """Calculate time-weighted average queue length."""
        if len(self.queue_data) < 2:
            return 0.0

        total_time = 0.0
        weighted_sum = 0.0

        for i in range(len(self.queue_data) - 1):
            time1, length1 = self.queue_data[i]
            time2, length2 = self.queue_data[i + 1]
            duration = time2 - time1
            total_time += duration
            weighted_sum += length1 * duration

        return weighted_sum / total_time if total_time > 0 else 0.0

    def average_utilization(self) -> float:
        """Calculate time-weighted average utilization."""
        if len(self.utilization_data) < 2:
            return 0.0

        total_time = 0.0
        weighted_sum = 0.0

        for i in range(len(self.utilization_data) - 1):
            time1, util1 = self.utilization_data[i]
            time2, util2 = self.utilization_data[i + 1]
            duration = time2 - time1
            total_time += duration
            weighted_sum += util1 * duration

        return weighted_sum / total_time if total_time > 0 else 0.0

    def average_wait_time(self) -> float:
        """Calculate average wait time for requests."""
        return sum(self.wait_times) / len(self.wait_times) if self.wait_times else 0.0

    def max_queue_length(self) -> int:
        """Get maximum queue length observed."""
        return max(length for _, length in self.queue_data) if self.queue_data else 0

    def report(self):
        """Print detailed statistics report."""
        print(f"\n{'=' * 60}")
        print(f"RESOURCE MONITOR REPORT: {self.name}")
        print(f"{'=' * 60}")
        print(f"Simulation time: 0.00 to {self.env.now:.2f}")
        print(f"Capacity: {self.resource.capacity}")
        print(f"\nUtilization:")
        print(f"  Average: {self.average_utilization():.2%}")
        print(f"  Final: {self.resource.count / self.resource.capacity:.2%}")
        print(f"\nQueue Statistics:")
        print(f"  Average length: {self.average_queue_length():.2f}")
        print(f"  Max length: {self.max_queue_length()}")
        print(f"  Final length: {len(self.resource.queue)}")
        print(f"\nWait Time Statistics:")
        print(f"  Total requests: {len(self.wait_times)}")
        if self.wait_times:
            print(f"  Average wait: {self.average_wait_time():.2f}")
            print(f"  Max wait: {max(self.wait_times):.2f}")
            print(f"  Min wait: {min(self.wait_times):.2f}")
        print(f"\nEvent Summary:")
        print(f"  Total events: {len(self.events)}")
        request_count = sum(1 for _, event_type, _ in self.events if event_type == 'request')
        release_count = sum(1 for _, event_type, _ in self.events if event_type == 'release')
        print(f"  Requests: {request_count}")
        print(f"  Releases: {release_count}")
        print(f"{'=' * 60}")

    def export_csv(self, filename: str):
        """
        Export monitoring data to CSV file.

        Args:
            filename: Output CSV filename
        """
        import csv

        with open(filename, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['Time', 'Event', 'Queue Length', 'Utilization'])

            for time, event_type, data in self.events:
                writer.writerow([
                    time,
                    event_type,
                    data['queue_length'],
                    data['utilization']
                ])

        print(f"Data exported to {filename}")


class MultiResourceMonitor:
    """Monitor multiple resources simultaneously."""

    def __init__(self, env: simpy.Environment):
        """
        Initialize multi-resource monitor.

        Args:
            env: SimPy environment
        """
        self.env = env
        self.monitors: Dict[str, ResourceMonitor] = {}

    def add_resource(self, resource: simpy.Resource, name: str):
        """
        Add a resource to monitor.

        Args:
            resource: SimPy resource to monitor
            name: Name for the resource
        """
        monitor = ResourceMonitor(self.env, resource, name)
        self.monitors[name] = monitor
        return monitor

    def report_all(self):
        """Generate reports for all monitored resources."""
        for name, monitor in self.monitors.items():
            monitor.report()

    def summary(self):
        """Print summary statistics for all resources."""
        print(f"\n{'=' * 60}")
        print("MULTI-RESOURCE SUMMARY")
        print(f"{'=' * 60}")
        print(f"{'Resource':<20} {'Avg Util':<12} {'Avg Queue':<12} {'Avg Wait':<12}")
        print(f"{'-' * 20} {'-' * 12} {'-' * 12} {'-' * 12}")

        for name, monitor in self.monitors.items():
            print(f"{name:<20} {monitor.average_utilization():<12.2%} "
                  f"{monitor.average_queue_length():<12.2f} "
                  f"{monitor.average_wait_time():<12.2f}")

        print(f"{'=' * 60}")


class ContainerMonitor:
    """Monitor Container resources (for tracking level changes)."""

    def __init__(self, env: simpy.Environment, container: simpy.Container, name: str = "Container"):
        """
        Initialize container monitor.

        Args:
            env: SimPy environment
            container: Container to monitor
            name: Name for the container
        """
        self.env = env
        self.container = container
        self.name = name
        self.level_data: List[Tuple[float, float]] = [(0, container.level)]

        self._patch_container()

    def _patch_container(self):
        """Patch container methods to track level changes."""
        original_put = self.container.put
        original_get = self.container.get

        def monitored_put(amount):
            result = original_put(amount)

            def on_put(event):
                self.level_data.append((self.env.now, self.container.level))

            result.callbacks.append(on_put)
            return result

        def monitored_get(amount):
            result = original_get(amount)

            def on_get(event):
                self.level_data.append((self.env.now, self.container.level))

            result.callbacks.append(on_get)
            return result

        self.container.put = monitored_put
        self.container.get = monitored_get

    def average_level(self) -> float:
        """Calculate time-weighted average level."""
        if len(self.level_data) < 2:
            return self.level_data[0][1] if self.level_data else 0.0

        total_time = 0.0
        weighted_sum = 0.0

        for i in range(len(self.level_data) - 1):
            time1, level1 = self.level_data[i]
            time2, level2 = self.level_data[i + 1]
            duration = time2 - time1
            total_time += duration
            weighted_sum += level1 * duration

        return weighted_sum / total_time if total_time > 0 else 0.0

    def report(self):
        """Print container statistics."""
        print(f"\n{'=' * 60}")
        print(f"CONTAINER MONITOR REPORT: {self.name}")
        print(f"{'=' * 60}")
        print(f"Capacity: {self.container.capacity}")
        print(f"Current level: {self.container.level:.2f}")
        print(f"Average level: {self.average_level():.2f}")
        print(f"Utilization: {self.average_level() / self.container.capacity:.2%}")

        if self.level_data:
            levels = [level for _, level in self.level_data]
            print(f"Max level: {max(levels):.2f}")
            print(f"Min level: {min(levels):.2f}")

        print(f"{'=' * 60}")


# Example usage
if __name__ == "__main__":
    def example_process(env, name, resource, duration):
        """Example process using a resource."""
        with resource.request() as req:
            yield req
            print(f"{name} started at {env.now}")
            yield env.timeout(duration)
            print(f"{name} finished at {env.now}")

    # Create environment and resource
    env = simpy.Environment()
    resource = simpy.Resource(env, capacity=2)

    # Create monitor
    monitor = ResourceMonitor(env, resource, "Example Resource")

    # Start processes
    for i in range(5):
        env.process(example_process(env, f"Process {i}", resource, 3 + i))

    # Run simulation
    env.run()

    # Generate report
    monitor.report()
