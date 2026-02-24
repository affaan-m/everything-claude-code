---
name: mlops-pipeline-patterns
description: ML pipeline architecture, experiment tracking, feature stores, model serving, A/B testing, and model monitoring patterns.
---

# MLOps Pipeline Patterns

## When to Activate
- Building or maintaining ML training/inference pipelines
- Setting up experiment tracking or model registry
- Deploying models to production with serving infrastructure
- Implementing model monitoring or A/B testing

## Core Principles
- **Reproducibility**: Every experiment must be reproducible from code + data + config
- **Automation**: Manual steps are bugs waiting to happen — automate the pipeline
- **Monitoring**: Models degrade silently — monitor data drift and prediction quality
- **Versioning**: Version everything — code, data, models, and configs

---

## 1. ML Pipeline Architecture

```
┌──────────┐    ┌───────────┐    ┌──────────┐    ┌──────────┐
│  Data     │───>│  Feature   │───>│ Training │───>│  Model   │
│ Ingestion │    │  Store     │    │ Pipeline │    │ Registry │
└──────────┘    └───────────┘    └──────────┘    └────┬─────┘
                                                       │
                ┌───────────┐    ┌──────────┐    ┌────▼─────┐
                │ Monitoring│<───│  A/B Test │<───│ Serving  │
                └───────────┘    └──────────┘    └──────────┘
```

**Key stages:**
1. **Data ingestion**: Collect, validate, version raw data
2. **Feature engineering**: Transform raw data into model features
3. **Training**: Train, evaluate, compare model versions
4. **Registry**: Store approved models with metadata
5. **Serving**: Deploy models behind inference APIs
6. **Monitoring**: Track drift, performance, and business metrics

---

## 2. Experiment Tracking

### MLflow

```python
import mlflow

mlflow.set_tracking_uri("http://mlflow.internal:5000")
mlflow.set_experiment("recommendation-model")

with mlflow.start_run(run_name="v2-transformer"):
    mlflow.log_params({
        "model_type": "transformer",
        "learning_rate": 1e-4,
        "batch_size": 64,
        "epochs": 10,
    })

    model = train(config)
    metrics = evaluate(model, test_data)

    mlflow.log_metrics({
        "accuracy": metrics["accuracy"],
        "f1_score": metrics["f1"],
        "auc_roc": metrics["auc"],
    })

    mlflow.sklearn.log_model(model, "model")
    mlflow.log_artifact("confusion_matrix.png")
```

### Weights & Biases

```python
import wandb

wandb.init(project="recommendation", name="v2-transformer")
wandb.config.update({"lr": 1e-4, "batch_size": 64})

for epoch in range(10):
    loss = train_epoch(model)
    wandb.log({"loss": loss, "epoch": epoch})

wandb.log({"confusion_matrix": wandb.plot.confusion_matrix(
    y_true=labels, preds=predictions, class_names=classes
)})
wandb.finish()
```

---

## 3. Feature Store

### Feast

```python
# feature_repo/features.py
from feast import Entity, FeatureView, FileSource, Field
from feast.types import Float32, Int64

user = Entity(name="user_id", join_keys=["user_id"])

user_features = FeatureView(
    name="user_features",
    entities=[user],
    schema=[
        Field(name="age", dtype=Int64),
        Field(name="lifetime_value", dtype=Float32),
        Field(name="purchase_count", dtype=Int64),
    ],
    source=FileSource(
        path="data/user_features.parquet",
        timestamp_field="event_timestamp",
    ),
    ttl=timedelta(days=1),
)
```

### Retrieval

```python
from feast import FeatureStore

store = FeatureStore(repo_path="feature_repo/")

# Online (serving — single entity, low latency)
features = store.get_online_features(
    features=["user_features:age", "user_features:lifetime_value"],
    entity_rows=[{"user_id": 123}],
).to_dict()

# Offline (training — point-in-time join)
training_df = store.get_historical_features(
    entity_df=entity_df,  # with user_id + event_timestamp
    features=["user_features:age", "user_features:purchase_count"],
).to_df()
```

---

## 4. Model Registry

### MLflow Model Registry

```python
import mlflow

# Register a model
result = mlflow.register_model(
    model_uri="runs:/abc123/model",
    name="recommendation-model",
)

# Set model alias (MLflow 2.9+)
client = mlflow.tracking.MlflowClient()
client.set_registered_model_alias(
    name="recommendation-model",
    alias="champion",
    version=result.version,
)
```

### Approval Workflow

```
┌─────────┐    ┌──────────┐    ┌───────────┐    ┌────────────┐
│  None    │───>│  Staging  │───>│ Production│───>│  Archived  │
└─────────┘    └──────────┘    └───────────┘    └────────────┘
     │              │                │
     │         Validation        Approval
     │         - accuracy > 0.95  - A/B test passed
     │         - latency < 100ms  - no drift detected
```

---

## 5. Model Serving

### FastAPI + ONNX Runtime

```python
from fastapi import FastAPI
import onnxruntime as ort
import numpy as np

app = FastAPI()
session = ort.InferenceSession("model.onnx")

@app.post("/predict")
async def predict(features: list[float]):
    inputs = np.array([features], dtype=np.float32)
    result = session.run(None, {"input": inputs})
    return {"prediction": result[0].tolist()}
```

### Batching for Throughput

```python
from asyncio import Queue, sleep, create_task

batch_queue: Queue = Queue()
BATCH_SIZE = 32
BATCH_TIMEOUT = 0.05  # 50ms

async def batch_processor():
    while True:
        batch = []
        while len(batch) < BATCH_SIZE:
            try:
                item = batch_queue.get_nowait()
                batch.append(item)
            except Exception:
                if batch:
                    break
                await sleep(BATCH_TIMEOUT)
        if batch:
            inputs = np.array([b["features"] for b in batch])
            results = session.run(None, {"input": inputs})
            for item, result in zip(batch, results[0]):
                item["future"].set_result(result.tolist())
```

### Serving Architecture

| Pattern | Latency | Throughput | Use Case |
|---------|---------|------------|----------|
| Synchronous | Low | Low | Real-time single prediction |
| Batched | Medium | High | Bulk scoring |
| Streaming | Low | High | Event-driven predictions |
| Pre-computed | Minimal | Maximal | Recommendation caches |

---

## 6. A/B Testing & Canary

### Traffic Splitting

```python
import hashlib

def get_model_variant(user_id: str, experiment: str = "rec-v2") -> str:
    hash_input = f"{user_id}:{experiment}"
    hash_val = int(hashlib.sha256(hash_input.encode()).hexdigest(), 16)
    # 90% control, 10% treatment
    return "treatment" if (hash_val % 100) < 10 else "control"
```

### Statistical Significance

```python
from scipy import stats

def is_significant(control_conversions, control_total,
                   treatment_conversions, treatment_total,
                   alpha=0.05):
    control_rate = control_conversions / control_total
    treatment_rate = treatment_conversions / treatment_total
    z_stat, p_value = stats.proportions_ztest(
        [treatment_conversions, control_conversions],
        [treatment_total, control_total],
    )
    return {
        "significant": p_value < alpha,
        "p_value": p_value,
        "lift": (treatment_rate - control_rate) / control_rate,
    }
```

### Rollback Criteria
- p99 latency increase > 20%
- Error rate increase > 0.5%
- Core business metric (conversion, revenue) decrease > 2%

---

## 7. Model Monitoring

### Data Drift Detection

```python
from evidently.report import Report
from evidently.metric_preset import DataDriftPreset

report = Report(metrics=[DataDriftPreset()])
report.run(reference_data=training_df, current_data=production_df)
report.save_html("drift_report.html")

# Programmatic check
result = report.as_dict()
drift_detected = result["metrics"][0]["result"]["dataset_drift"]
```

### Prediction Quality Monitoring

```python
# Log predictions with ground truth when available
metrics = {
    "prediction_count": len(predictions),
    "mean_prediction": float(np.mean(predictions)),
    "prediction_std": float(np.std(predictions)),
    "null_feature_ratio": float(null_count / total),
}

# Alert if distribution shifts
if abs(metrics["mean_prediction"] - baseline_mean) > 2 * baseline_std:
    alert("Prediction distribution shift detected")
```

### Monitoring Checklist
- **Data drift**: Feature distributions vs training data
- **Concept drift**: Relationship between features and target changes
- **Prediction drift**: Output distribution shift
- **Performance**: Accuracy/F1 when labels become available

---

## 8. CI/CD for ML

### DVC Pipeline

```yaml
# dvc.yaml
stages:
  prepare:
    cmd: python src/prepare.py
    deps: [src/prepare.py, data/raw/]
    outs: [data/processed/]

  train:
    cmd: python src/train.py
    deps: [src/train.py, data/processed/]
    outs: [models/latest/]
    metrics: [metrics.json]
    plots: [plots/]

  evaluate:
    cmd: python src/evaluate.py
    deps: [src/evaluate.py, models/latest/, data/test/]
    metrics: [evaluation.json]
```

```bash
# Reproduce pipeline
dvc repro

# Compare experiments
dvc metrics diff

# Push data/models to remote storage
dvc push
```

### Model Validation Gate

```python
def validate_model(model_path: str, threshold: dict) -> bool:
    metrics = evaluate(load_model(model_path))
    checks = {
        "accuracy": metrics["accuracy"] >= threshold["min_accuracy"],
        "latency": metrics["p99_latency_ms"] <= threshold["max_latency_ms"],
        "size": os.path.getsize(model_path) <= threshold["max_size_bytes"],
    }
    return all(checks.values())
```

---

## Checklist

- [ ] All experiments are tracked with parameters, metrics, and artifacts
- [ ] Training data is versioned (DVC, Delta Lake, or equivalent)
- [ ] Feature store serves consistent features for training and serving
- [ ] Model registry manages stage transitions with approval gates
- [ ] Serving endpoint has health checks, batching, and graceful shutdown
- [ ] A/B tests have proper traffic splitting and statistical validation
- [ ] Data drift and prediction quality are monitored in production
- [ ] CI/CD pipeline includes model validation gates before deployment
