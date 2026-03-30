#!/usr/bin/env python3
"""
Basic SimPy Simulation Template

This template provides a starting point for building SimPy simulations.
Customize the process functions and parameters for your specific use case.
"""

import simpy
import random


class SimulationConfig:
    """Configuration parameters for the simulation."""

    def __init__(self):
        self.random_seed = 42
        self.num_resources = 2
        self.num_processes = 10
        self.sim_time = 100
        self.arrival_rate = 5.0  # Average time between arrivals
        self.service_time_mean = 3.0  # Average service time
        self.service_time_std = 1.0  # Service time standard deviation


class SimulationStats:
    """Collect and report simulation statistics."""

    def __init__(self):
        self.arrival_times = []
        self.service_start_times = []
        self.departure_times = []
        self.wait_times = []
        self.service_times = []

    def record_arrival(self, time):
        self.arrival_times.append(time)

    def record_service_start(self, time):
        self.service_start_times.append(time)

    def record_departure(self, time):
        self.departure_times.append(time)

    def record_wait_time(self, wait_time):
        self.wait_times.append(wait_time)

    def record_service_time(self, service_time):
        self.service_times.append(service_time)

    def report(self):
        print("\n" + "=" * 50)
        print("SIMULATION STATISTICS")
        print("=" * 50)

        if self.wait_times:
            print(f"Total customers: {len(self.wait_times)}")
            print(f"Average wait time: {sum(self.wait_times) / len(self.wait_times):.2f}")
            print(f"Max wait time: {max(self.wait_times):.2f}")
            print(f"Min wait time: {min(self.wait_times):.2f}")

        if self.service_times:
            print(f"Average service time: {sum(self.service_times) / len(self.service_times):.2f}")

        if self.arrival_times and self.departure_times:
            throughput = len(self.departure_times) / max(self.departure_times)
            print(f"Throughput: {throughput:.2f} customers/time unit")

        print("=" * 50)


def customer_process(env, name, resource, stats, config):
    """
    Simulate a customer process.

    Args:
        env: SimPy environment
        name: Customer identifier
        resource: Shared resource (e.g., server, machine)
        stats: Statistics collector
        config: Simulation configuration
    """
    # Record arrival
    arrival_time = env.now
    stats.record_arrival(arrival_time)
    print(f"{name} arrived at {arrival_time:.2f}")

    # Request resource
    with resource.request() as request:
        yield request

        # Record service start and calculate wait time
        service_start = env.now
        wait_time = service_start - arrival_time
        stats.record_service_start(service_start)
        stats.record_wait_time(wait_time)
        print(f"{name} started service at {service_start:.2f} (waited {wait_time:.2f})")

        # Service time (normally distributed)
        service_time = max(0.1, random.gauss(
            config.service_time_mean,
            config.service_time_std
        ))
        stats.record_service_time(service_time)

        yield env.timeout(service_time)

        # Record departure
        departure_time = env.now
        stats.record_departure(departure_time)
        print(f"{name} departed at {departure_time:.2f}")


def customer_generator(env, resource, stats, config):
    """
    Generate customers arriving at random intervals.

    Args:
        env: SimPy environment
        resource: Shared resource
        stats: Statistics collector
        config: Simulation configuration
    """
    customer_count = 0

    while True:
        # Wait for next customer arrival (exponential distribution)
        inter_arrival_time = random.expovariate(1.0 / config.arrival_rate)
        yield env.timeout(inter_arrival_time)

        # Create new customer process
        customer_count += 1
        customer_name = f"Customer {customer_count}"
        env.process(customer_process(env, customer_name, resource, stats, config))


def run_simulation(config):
    """
    Run the simulation with given configuration.

    Args:
        config: SimulationConfig object with simulation parameters

    Returns:
        SimulationStats object with collected statistics
    """
    # Set random seed for reproducibility
    random.seed(config.random_seed)

    # Create environment
    env = simpy.Environment()

    # Create shared resource
    resource = simpy.Resource(env, capacity=config.num_resources)

    # Create statistics collector
    stats = SimulationStats()

    # Start customer generator
    env.process(customer_generator(env, resource, stats, config))

    # Run simulation
    print(f"Starting simulation for {config.sim_time} time units...")
    print(f"Resources: {config.num_resources}")
    print(f"Average arrival rate: {config.arrival_rate:.2f}")
    print(f"Average service time: {config.service_time_mean:.2f}")
    print("-" * 50)

    env.run(until=config.sim_time)

    return stats


def main():
    """Main function to run the simulation."""
    # Create configuration
    config = SimulationConfig()

    # Customize configuration if needed
    config.num_resources = 2
    config.sim_time = 50
    config.arrival_rate = 2.0
    config.service_time_mean = 3.0

    # Run simulation
    stats = run_simulation(config)

    # Report statistics
    stats.report()


if __name__ == "__main__":
    main()
