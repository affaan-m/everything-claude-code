# Distributed Computing with Arboreto

Arboreto leverages Dask for parallelized computation, enabling efficient GRN inference from single-machine multi-core processing to multi-node cluster environments.

## Computation Architecture

GRN inference is inherently parallelizable:
- Each target gene's regression model can be trained independently
- Arboreto represents computation as a Dask task graph
- Tasks are distributed across available computational resources

## Local Multi-Core Processing (Default)

By default, arboreto uses all available CPU cores on the local machine:

```python
from arboreto.algo import grnboost2

# Automatically uses all local cores
network = grnboost2(expression_data=expression_matrix, tf_names=tf_names)
```

This is sufficient for most use cases and requires no additional configuration.

## Custom Local Dask Client

For fine-grained control over local resources, create a custom Dask client:

```python
from distributed import LocalCluster, Client
from arboreto.algo import grnboost2

if __name__ == '__main__':
    # Configure local cluster
    local_cluster = LocalCluster(
        n_workers=10,              # Number of worker processes
        threads_per_worker=1,       # Threads per worker
        memory_limit='8GB'          # Memory limit per worker
    )

    # Create client
    custom_client = Client(local_cluster)

    # Run inference with custom client
    network = grnboost2(
        expression_data=expression_matrix,
        tf_names=tf_names,
        client_or_address=custom_client
    )

    # Clean up
    custom_client.close()
    local_cluster.close()
```

### Benefits of Custom Client
- **Resource control**: Limit CPU and memory usage
- **Multiple runs**: Reuse same client for different parameter sets
- **Monitoring**: Access Dask dashboard for performance insights

## Multiple Inference Runs with Same Client

Reuse a single Dask client for multiple inference runs with different parameters:

```python
from distributed import LocalCluster, Client
from arboreto.algo import grnboost2

if __name__ == '__main__':
    # Initialize client once
    local_cluster = LocalCluster(n_workers=8, threads_per_worker=1)
    client = Client(local_cluster)

    # Run multiple inferences
    network_seed1 = grnboost2(
        expression_data=expression_matrix,
        tf_names=tf_names,
        client_or_address=client,
        seed=666
    )

    network_seed2 = grnboost2(
        expression_data=expression_matrix,
        tf_names=tf_names,
        client_or_address=client,
        seed=777
    )

    # Different algorithms with same client
    from arboreto.algo import genie3
    network_genie3 = genie3(
        expression_data=expression_matrix,
        tf_names=tf_names,
        client_or_address=client
    )

    # Clean up once
    client.close()
    local_cluster.close()
```

## Distributed Cluster Computing

For very large datasets, connect to a remote Dask distributed scheduler running on a cluster:

### Step 1: Set Up Dask Scheduler (on cluster head node)
```bash
dask-scheduler
# Output: Scheduler at tcp://10.118.224.134:8786
```

### Step 2: Start Dask Workers (on cluster compute nodes)
```bash
dask-worker tcp://10.118.224.134:8786
```

### Step 3: Connect from Client
```python
from distributed import Client
from arboreto.algo import grnboost2

if __name__ == '__main__':
    # Connect to remote scheduler
    scheduler_address = 'tcp://10.118.224.134:8786'
    cluster_client = Client(scheduler_address)

    # Run inference on cluster
    network = grnboost2(
        expression_data=expression_matrix,
        tf_names=tf_names,
        client_or_address=cluster_client
    )

    cluster_client.close()
```

### Cluster Configuration Best Practices

**Worker configuration**:
```bash
dask-worker tcp://scheduler:8786 \
    --nprocs 4 \              # Number of processes per node
    --nthreads 1 \            # Threads per process
    --memory-limit 16GB       # Memory per process
```

**For large-scale inference**:
- Use more workers with moderate memory rather than fewer workers with large memory
- Set `threads_per_worker=1` to avoid GIL contention in scikit-learn
- Monitor memory usage to prevent workers from being killed

## Monitoring and Debugging

### Dask Dashboard

Access the Dask dashboard for real-time monitoring:

```python
from distributed import Client

client = Client()  # Prints dashboard URL
# Dashboard available at: http://localhost:8787/status
```

The dashboard shows:
- **Task progress**: Number of tasks completed/pending
- **Resource usage**: CPU, memory per worker
- **Task stream**: Real-time visualization of computation
- **Performance**: Bottleneck identification

### Verbose Output

Enable verbose logging to track inference progress:

```python
network = grnboost2(
    expression_data=expression_matrix,
    tf_names=tf_names,
    verbose=True
)
```

## Performance Optimization Tips

### 1. Data Format
- **Use Pandas DataFrame when possible**: More efficient than NumPy for Dask operations
- **Reduce data size**: Filter low-variance genes before inference

### 2. Worker Configuration
- **CPU-bound tasks**: Set `threads_per_worker=1`, increase `n_workers`
- **Memory-bound tasks**: Increase `memory_limit` per worker

### 3. Cluster Setup
- **Network**: Ensure high-bandwidth, low-latency network between nodes
- **Storage**: Use shared filesystem or object storage for large datasets
- **Scheduling**: Allocate dedicated nodes to avoid resource contention

### 4. Transcription Factor Filtering
- **Limit TF list**: Providing specific TF names reduces computation
```python
# Full search (slow)
network = grnboost2(expression_data=matrix)

# Filtered search (faster)
network = grnboost2(expression_data=matrix, tf_names=known_tfs)
```

## Example: Large-Scale Single-Cell Analysis

Complete workflow for processing single-cell RNA-seq data on a cluster:

```python
from distributed import Client
from arboreto.algo import grnboost2
import pandas as pd

if __name__ == '__main__':
    # Connect to cluster
    client = Client('tcp://cluster-scheduler:8786')

    # Load large single-cell dataset (50,000 cells x 20,000 genes)
    expression_data = pd.read_csv('scrnaseq_data.tsv', sep='\t')

    # Load cell-type-specific TFs
    tf_names = pd.read_csv('tf_list.txt', header=None)[0].tolist()

    # Run distributed inference
    network = grnboost2(
        expression_data=expression_data,
        tf_names=tf_names,
        client_or_address=client,
        verbose=True,
        seed=42
    )

    # Save results
    network.to_csv('grn_results.tsv', sep='\t', index=False)

    client.close()
```

This approach enables analysis of datasets that would be impractical on a single machine.
