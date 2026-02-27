---
name: vector-index-tuning
description: Optimize vector index performance for latency, recall, and memory. Use when tuning HNSW parameters, selecting quantization strategies, or scaling vector search infrastructure.
---

# Vector Index Tuning

Guide to optimizing vector indexes for production performance.

## When to Use This Skill

- Tuning HNSW parameters
- Implementing quantization
- Optimizing memory usage
- Reducing search latency
- Balancing recall vs speed
- Scaling to billions of vectors

## Core Concepts

### 1. Index Type Selection

```
Data Size           Recommended Index
────────────────────────────────────────
< 10K vectors  →    Flat (exact search)
10K - 1M       →    HNSW
1M - 100M      →    HNSW + Quantization
> 100M         →    IVF + PQ or DiskANN
```

### 2. HNSW Parameters

| Parameter          | Default | Effect                                               |
| ------------------ | ------- | ---------------------------------------------------- |
| **M**              | 16      | Connections per node, ↑ = better recall, more memory |
| **efConstruction** | 100     | Build quality, ↑ = better index, slower build        |
| **efSearch**       | 50      | Search quality, ↑ = better recall, slower search     |

### 3. Quantization Types

```
Full Precision (FP32): 4 bytes × dimensions
Half Precision (FP16): 2 bytes × dimensions
INT8 Scalar:           1 byte × dimensions
Product Quantization:  ~32-64 bytes total
Binary:                dimensions/8 bytes
```

## Templates

### Template 1: HNSW Parameter Tuning

```python
import numpy as np
from typing import List, Tuple
import time

def benchmark_hnsw_parameters(
    vectors: np.ndarray,
    queries: np.ndarray,
    ground_truth: np.ndarray,
    m_values: List[int] = [8, 16, 32, 64],
    ef_construction_values: List[int] = [64, 128, 256],
    ef_search_values: List[int] = [32, 64, 128, 256]
) -> List[dict]:
    """Benchmark different HNSW configurations."""
    import hnswlib

    results = []
    dim = vectors.shape[1]
    n = vectors.shape[0]

    for m in m_values:
        for ef_construction in ef_construction_values:
            # Build index
            index = hnswlib.Index(space='cosine', dim=dim)
            index.init_index(max_elements=n, M=m, ef_construction=ef_construction)

            build_start = time.time()
            index.add_items(vectors)
            build_time = time.time() - build_start

            # Get memory usage
            memory_bytes = index.element_count * (
                dim * 4 +  # Vector storage
                m * 2 * 4  # Graph edges (approximate)
            )

            for ef_search in ef_search_values:
                index.set_ef(ef_search)

                # Measure search
                search_start = time.time()
                labels, distances = index.knn_query(queries, k=10)
                search_time = time.time() - search_start

                # Calculate recall
                recall = calculate_recall(labels, ground_truth, k=10)

                results.append({
                    "M": m,
                    "ef_construction": ef_construction,
                    "ef_search": ef_search,
                    "build_time_s": build_time,
                    "search_time_ms": search_time * 1000 / len(queries),
                    "recall@10": recall,
                    "memory_mb": memory_bytes / 1024 / 1024
                })

    return results


def calculate_recall(predictions: np.ndarray, ground_truth: np.ndarray, k: int) -> float:
    """Calculate recall@k."""
    correct = 0
    for pred, truth in zip(predictions, ground_truth):
        correct += len(set(pred[:k]) & set(truth[:k]))
    return correct / (len(predictions) * k)


def recommend_hnsw_params(
    num_vectors: int,
    target_recall: float = 0.95,
    max_latency_ms: float = 10,
    available_memory_gb: float = 8
) -> dict:
    """Recommend HNSW parameters based on requirements."""

    # Base recommendations
    if num_vectors < 100_000:
        m = 16
        ef_construction = 100
    elif num_vectors < 1_000_000:
        m = 32
        ef_construction = 200
    else:
        m = 48
        ef_construction = 256

    # Adjust ef_search based on recall target
    if target_recall >= 0.99:
        ef_search = 256
    elif target_recall >= 0.95:
        ef_search = 128
    else:
        ef_search = 64

    return {
        "M": m,
        "ef_construction": ef_construction,
        "ef_search": ef_search,
        "notes": f"Estimated for {num_vectors:,} vectors, {target_recall:.0%} recall"
    }
```

### Template 2: Quantization Strategies

```python
import numpy as np
from typing import Optional

class VectorQuantizer:
    """Quantization strategies for vector compression."""

    @staticmethod
    def scalar_quantize_int8(
        vectors: np.ndarray,
        min_val: Optional[float] = None,
        max_val: Optional[float] = None
    ) -> Tuple[np.ndarray, dict]:
        """Scalar quantization to INT8."""
        if min_val is None:
            min_val = vectors.min()
        if max_val is None:
            max_val = vectors.max()

        # Scale to 0-255 range
        scale = 255.0 / (max_val - min_val)
        quantized = np.clip(
            np.round((vectors - min_val) * scale),
            0, 255
        ).astype(np.uint8)

        params = {"min_val": min_val, "max_val": max_val, "scale": scale}
        return quantized, params

    @staticmethod
    def dequantize_int8(
        quantized: np.ndarray,
        params: dict
    ) -> np.ndarray:
        """Dequantize INT8 vectors."""
        return quantized.astype(np.float32) / params["scale"] + params["min_val"]

    @staticmethod
    def product_quantize(
        vectors: np.ndarray,
        n_subvectors: int = 8,
        n_centroids: int = 256
    ) -> Tuple[np.ndarray, dict]:
        """Product quantization for aggressive compression."""
        from sklearn.cluster import KMeans

        n, dim = vectors.shape
        assert dim % n_subvectors == 0
        subvector_dim = dim // n_subvectors

        codebooks = []
        codes = np.zeros((n, n_subvectors), dtype=np.uint8)

        for i in range(n_subvectors):
            start = i * subvector_dim
            end = (i + 1) * subvector_dim
            subvectors = vectors[:, start:end]

            kmeans = KMeans(n_clusters=n_centroids, random_state=42)
            codes[:, i] = kmeans.fit_predict(subvectors)
            codebooks.append(kmeans.cluster_centers_)

        params = {
            "codebooks": codebooks,
            "n_subvectors": n_subvectors,
            "subvector_dim": subvector_dim
        }
        return codes, params

    @staticmethod
    def binary_quantize(vectors: np.ndarray) -> np.ndarray:
        """Binary quantization (sign of each dimension)."""
        # Convert to binary: positive = 1, negative = 0
        binary = (vectors > 0).astype(np.uint8)

        # Pack bits into bytes
        n, dim = vectors.shape
        packed_dim = (dim + 7) // 8

        packed = np.zeros((n, packed_dim), dtype=np.uint8)
        for i in range(dim):
            byte_idx = i // 8
            bit_idx = i % 8
            packed[:, byte_idx] |= (binary[:, i] << bit_idx)

        return packed


def estimate_memory_usage(
    num_vectors: int,
    dimensions: int,
    quantization: str = "fp32",
    index_type: str = "hnsw",
    hnsw_m: int = 16
) -> dict:
    """Estimate memory usage for different configurations."""

    # Vector storage
    bytes_per_dimension = {
        "fp32": 4,
        "fp16": 2,
        "int8": 1,
        "pq": 0.05,  # Approximate
        "binary": 0.125
    }

    vector_bytes = num_vectors * dimensions * bytes_per_dimension[quantization]

    # Index overhead
    if index_type == "hnsw":
        # Each node has ~M*2 edges, each edge is 4 bytes (int32)
        index_bytes = num_vectors * hnsw_m * 2 * 4
    elif index_type == "ivf":
        # Inverted lists + centroids
        index_bytes = num_vectors * 8 + 65536 * dimensions * 4
    else:
        index_bytes = 0

    total_bytes = vector_bytes + index_bytes

    return {
        "vector_storage_mb": vector_bytes / 1024 / 1024,
        "index_overhead_mb": index_bytes / 1024 / 1024,
        "total_mb": total_bytes / 1024 / 1024,
        "total_gb": total_bytes / 1024 / 1024 / 1024
    }
```

### Template 3: Qdrant Index Configuration

```python
from qdrant_client import QdrantClient
from qdrant_client.http import models

def create_optimized_collection(
    client: QdrantClient,
    collection_name: str,
    vector_size: int,
    num_vectors: int,
    optimize_for: str = "balanced"  # "recall", "speed", "memory"
) -> None:
    """Create collection with optimized settings."""

    # HNSW configuration based on optimization target
    hnsw_configs = {
        "recall": models.HnswConfigDiff(m=32, ef_construct=256),
        "speed": models.HnswConfigDiff(m=16, ef_construct=64),
        "balanced": models.HnswConfigDiff(m=16, ef_construct=128),
        "memory": models.HnswConfigDiff(m=8, ef_construct=64)
    }

    # Quantization configuration
    quantization_configs = {
        "recall": None,  # No quantization for max recall
        "speed": models.ScalarQuantization(
            scalar=models.ScalarQuantizationConfig(
                type=models.ScalarType.INT8,
                quantile=0.99,
                always_ram=True
            )
        ),
        "balanced": models.ScalarQuantization(
            scalar=models.ScalarQuantizationConfig(
                type=models.ScalarType.INT8,
                quantile=0.99,
                always_ram=False
            )
        ),
        "memory": models.ProductQuantization(
            product=models.ProductQuantizationConfig(
                compression=models.CompressionRatio.X16,
                always_ram=False
            )
        )
    }

    # Optimizer configuration
    optimizer_configs = {
        "recall": models.OptimizersConfigDiff(
            indexing_threshold=10000,
            memmap_threshold=50000
        ),
        "speed": models.OptimizersConfigDiff(
            indexing_threshold=5000,
            memmap_threshold=20000
        ),
        "balanced": models.OptimizersConfigDiff(
            indexing_threshold=20000,
            memmap_threshold=50000
        ),
        "memory": models.OptimizersConfigDiff(
            indexing_threshold=50000,
            memmap_threshold=10000  # Use disk sooner
        )
    }

    client.create_collection(
        collection_name=collection_name,
        vectors_config=models.VectorParams(
            size=vector_size,
            distance=models.Distance.COSINE
        ),
        hnsw_config=hnsw_configs[optimize_for],
        quantization_config=quantization_configs[optimize_for],
        optimizers_config=optimizer_configs[optimize_for]
    )


def tune_search_parameters(
    client: QdrantClient,
    collection_name: str,
    target_recall: float = 0.95
) -> dict:
    """Tune search parameters for target recall."""

    # Search parameter recommendations
    if target_recall >= 0.99:
        search_params = models.SearchParams(
            hnsw_ef=256,
            exact=False,
            quantization=models.QuantizationSearchParams(
                ignore=True,  # Don't use quantization for search
                rescore=True
            )
        )
    elif target_recall >= 0.95:
        search_params = models.SearchParams(
            hnsw_ef=128,
            exact=False,
            quantization=models.QuantizationSearchParams(
                ignore=False,
                rescore=True,
                oversampling=2.0
            )
        )
    else:
        search_params = models.SearchParams(
            hnsw_ef=64,
            exact=False,
            quantization=models.QuantizationSearchParams(
                ignore=False,
                rescore=False
            )
        )

    return search_params
```

### Template 4: Performance Monitoring

```python
import time
from dataclasses import dataclass
from typing import List
import numpy as np

@dataclass
class SearchMetrics:
    latency_p50_ms: float
    latency_p95_ms: float
    latency_p99_ms: float
    recall: float
    qps: float


class VectorSearchMonitor:
    """Monitor vector search performance."""

    def __init__(self, ground_truth_fn=None):
        self.latencies = []
        self.recalls = []
        self.ground_truth_fn = ground_truth_fn

    def measure_search(
        self,
        search_fn,
        query_vectors: np.ndarray,
        k: int = 10,
        num_iterations: int = 100
    ) -> SearchMetrics:
        """Benchmark search performance."""
        latencies = []

        for _ in range(num_iterations):
            for query in query_vectors:
                start = time.perf_counter()
                results = search_fn(query, k=k)
                latency = (time.perf_counter() - start) * 1000
                latencies.append(latency)

        latencies = np.array(latencies)
        total_queries = num_iterations * len(query_vectors)
        total_time = sum(latencies) / 1000  # seconds

        return SearchMetrics(
            latency_p50_ms=np.percentile(latencies, 50),
            latency_p95_ms=np.percentile(latencies, 95),
            latency_p99_ms=np.percentile(latencies, 99),
            recall=self._calculate_recall(search_fn, query_vectors, k) if self.ground_truth_fn else 0,
            qps=total_queries / total_time
        )

    def _calculate_recall(self, search_fn, queries: np.ndarray, k: int) -> float:
        """Calculate recall against ground truth."""
        if not self.ground_truth_fn:
            return 0

        correct = 0
        total = 0

        for query in queries:
            predicted = set(search_fn(query, k=k))
            actual = set(self.ground_truth_fn(query, k=k))
            correct += len(predicted & actual)
            total += k

        return correct / total


def profile_index_build(
    build_fn,
    vectors: np.ndarray,
    batch_sizes: List[int] = [1000, 10000, 50000]
) -> dict:
    """Profile index build performance."""
    results = {}

    for batch_size in batch_sizes:
        times = []
        for i in range(0, len(vectors), batch_size):
            batch = vectors[i:i + batch_size]
            start = time.perf_counter()
            build_fn(batch)
            times.append(time.perf_counter() - start)

        results[batch_size] = {
            "avg_batch_time_s": np.mean(times),
            "vectors_per_second": batch_size / np.mean(times)
        }

    return results
```

## Best Practices

### Do's

- **Benchmark with real queries** - Synthetic may not represent production
- **Monitor recall continuously** - Can degrade with data drift
- **Start with defaults** - Tune only when needed
- **Use quantization** - Significant memory savings
- **Consider tiered storage** - Hot/cold data separation

### Don'ts

- **Don't over-optimize early** - Profile first
- **Don't ignore build time** - Index updates have cost
- **Don't forget reindexing** - Plan for maintenance
- **Don't skip warming** - Cold indexes are slow

## Resources

- [HNSW Paper](https://arxiv.org/abs/1603.09320)
- [Faiss Wiki](https://github.com/facebookresearch/faiss/wiki)
- [ANN Benchmarks](https://ann-benchmarks.com/)
