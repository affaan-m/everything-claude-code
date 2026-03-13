---
name: mlops-patterns
description: MLOps patterns for model training, evaluation, deployment, monitoring, and experiment tracking with reproducible ML pipelines.
origin: ECC
---

# MLOps Patterns

## When to Use

Use this skill when the user is:
- Training machine learning models
- Deploying ML models to production
- Setting up experiment tracking (MLflow, W&B)
- Building feature engineering pipelines
- Implementing model monitoring and drift detection
- Creating reproducible ML workflows
- Designing model serving infrastructure
- Setting up CI/CD for ML pipelines
- Building A/B testing for model variants
- Managing model registries and versioning

## How It Works

### Reproducibility

Every experiment must be fully reproducible from code, data, and configuration.

```python
import hashlib
import json
from dataclasses import dataclass, asdict
from pathlib import Path

@dataclass(frozen=True)
class ExperimentConfig:
    model_type: str
    learning_rate: float
    batch_size: int
    epochs: int
    random_seed: int
    data_version: str
    feature_columns: tuple[str, ...]
    train_split_ratio: float = 0.8
    early_stopping_patience: int = 5

    def to_hash(self) -> str:
        config_str = json.dumps(asdict(self), sort_keys=True)
        return hashlib.sha256(config_str.encode()).hexdigest()[:12]

    def save(self, path: Path) -> None:
        path.write_text(json.dumps(asdict(self), indent=2))

    @classmethod
    def load(cls, path: Path) -> "ExperimentConfig":
        data = json.loads(path.read_text())
        data["feature_columns"] = tuple(data["feature_columns"])
        return cls(**data)

def set_all_seeds(seed: int) -> None:
    import random
    import numpy as np

    random.seed(seed)
    np.random.seed(seed)

    try:
        import torch
        torch.manual_seed(seed)
        torch.cuda.manual_seed_all(seed)
        torch.backends.cudnn.deterministic = True
        torch.backends.cudnn.benchmark = False
    except ImportError:
        pass

    try:
        import tensorflow as tf
        tf.random.set_seed(seed)
    except ImportError:
        pass
```

### Versioning

Version everything: data, code, models, and configurations.

```python
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum

class ModelStage(str, Enum):
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"
    ARCHIVED = "archived"

@dataclass(frozen=True)
class ModelVersion:
    model_name: str
    version: str
    stage: ModelStage
    metrics: dict[str, float]
    config_hash: str
    data_version: str
    git_commit: str
    created_at: datetime
    artifact_path: str

@dataclass(frozen=True)
class ModelRegistry:
    """Tracks all model versions and their lifecycle stages."""
    versions: tuple[ModelVersion, ...] = ()

    def register(self, version: ModelVersion) -> "ModelRegistry":
        return ModelRegistry(versions=(*self.versions, version))

    def promote(self, model_name: str, version: str, stage: ModelStage) -> "ModelRegistry":
        updated = tuple(
            ModelVersion(
                model_name=v.model_name,
                version=v.version,
                stage=stage if v.model_name == model_name and v.version == version else v.stage,
                metrics=v.metrics,
                config_hash=v.config_hash,
                data_version=v.data_version,
                git_commit=v.git_commit,
                created_at=v.created_at,
                artifact_path=v.artifact_path,
            )
            for v in self.versions
        )
        return ModelRegistry(versions=updated)

    def get_production_model(self, model_name: str) -> ModelVersion | None:
        production_versions = [
            v for v in self.versions
            if v.model_name == model_name and v.stage == ModelStage.PRODUCTION
        ]
        if not production_versions:
            return None
        return max(production_versions, key=lambda v: v.created_at)
```

### Monitoring

Monitor model performance, data quality, and system health continuously.

```python
@dataclass(frozen=True)
class MonitoringThresholds:
    accuracy_min: float = 0.85
    latency_p99_ms: float = 200.0
    drift_score_max: float = 0.1
    error_rate_max: float = 0.01
    data_quality_min: float = 0.95

@dataclass(frozen=True)
class MonitoringAlert:
    metric_name: str
    current_value: float
    threshold: float
    severity: str  # "warning", "critical"
    timestamp: datetime
    message: str
```

## Examples

### Experiment Tracking

#### MLflow Integration

```python
import mlflow
from contextlib import contextmanager
import logging

logger = logging.getLogger(__name__)

@contextmanager
def tracked_experiment(
    experiment_name: str,
    config: ExperimentConfig,
    tags: dict[str, str] | None = None,
):
    mlflow.set_experiment(experiment_name)

    with mlflow.start_run(tags=tags or {}) as run:
        # Log configuration
        mlflow.log_params({
            "model_type": config.model_type,
            "learning_rate": config.learning_rate,
            "batch_size": config.batch_size,
            "epochs": config.epochs,
            "random_seed": config.random_seed,
            "data_version": config.data_version,
            "config_hash": config.to_hash(),
        })

        mlflow.set_tag("feature_count", len(config.feature_columns))

        try:
            yield run
        except Exception as error:
            mlflow.set_tag("status", "failed")
            mlflow.set_tag("error", str(error))
            logger.error("Experiment run failed: %s", error)
            raise

def log_training_step(epoch: int, metrics: dict[str, float]) -> None:
    for name, value in metrics.items():
        mlflow.log_metric(name, value, step=epoch)

def log_model_artifact(
    model,
    model_name: str,
    input_example=None,
    signature=None,
) -> None:
    mlflow.sklearn.log_model(
        model,
        artifact_path=model_name,
        input_example=input_example,
        signature=signature,
        registered_model_name=model_name,
    )
```

#### Weights & Biases Integration

```python
import wandb
from dataclasses import asdict

def init_wandb_experiment(
    project: str,
    config: ExperimentConfig,
    group: str | None = None,
    tags: list[str] | None = None,
) -> wandb.Run:
    run = wandb.init(
        project=project,
        config=asdict(config),
        group=group,
        tags=tags or [],
        reinit=True,
    )
    return run

class WandbCallback:
    def __init__(self, log_frequency: int = 10) -> None:
        self._log_frequency = log_frequency
        self._step = 0

    def on_epoch_end(self, epoch: int, logs: dict[str, float]) -> None:
        wandb.log(
            {f"train/{k}": v for k, v in logs.items()},
            step=epoch,
        )
        self._step = epoch

    def on_evaluation(self, metrics: dict[str, float]) -> None:
        wandb.log(
            {f"eval/{k}": v for k, v in metrics.items()},
            step=self._step,
        )

    def log_confusion_matrix(
        self, y_true, y_pred, class_names: list[str]
    ) -> None:
        wandb.log({
            "confusion_matrix": wandb.plot.confusion_matrix(
                y_true=y_true,
                preds=y_pred,
                class_names=class_names,
            )
        })
```

#### Experiment Comparison

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class ExperimentResult:
    run_id: str
    config: ExperimentConfig
    metrics: dict[str, float]
    training_time_seconds: float
    model_size_mb: float

def compare_experiments(results: list[ExperimentResult]) -> dict:
    if not results:
        return {"error": "No experiments to compare"}

    best_by_metric: dict[str, ExperimentResult] = {}
    metric_names = results[0].metrics.keys()

    for metric in metric_names:
        best = max(results, key=lambda r: r.metrics.get(metric, float("-inf")))
        best_by_metric[metric] = best

    summary = {
        "total_experiments": len(results),
        "best_by_metric": {
            metric: {
                "run_id": exp.run_id,
                "value": exp.metrics[metric],
                "config_hash": exp.config.to_hash(),
            }
            for metric, exp in best_by_metric.items()
        },
        "metric_ranges": {
            metric: {
                "min": min(r.metrics.get(metric, 0) for r in results),
                "max": max(r.metrics.get(metric, 0) for r in results),
                "mean": sum(r.metrics.get(metric, 0) for r in results) / len(results),
            }
            for metric in metric_names
        },
    }

    return summary
```

### Model Training Patterns

#### Hyperparameter Tuning

```python
from sklearn.model_selection import cross_val_score
import optuna
import logging

logger = logging.getLogger(__name__)

def create_objective(X_train, y_train, cv_folds: int = 5):
    def objective(trial: optuna.Trial) -> float:
        params = {
            "n_estimators": trial.suggest_int("n_estimators", 100, 1000, step=50),
            "max_depth": trial.suggest_int("max_depth", 3, 15),
            "learning_rate": trial.suggest_float("learning_rate", 1e-4, 0.3, log=True),
            "min_child_weight": trial.suggest_int("min_child_weight", 1, 10),
            "subsample": trial.suggest_float("subsample", 0.6, 1.0),
            "colsample_bytree": trial.suggest_float("colsample_bytree", 0.6, 1.0),
            "reg_alpha": trial.suggest_float("reg_alpha", 1e-8, 10.0, log=True),
            "reg_lambda": trial.suggest_float("reg_lambda", 1e-8, 10.0, log=True),
        }

        from xgboost import XGBClassifier
        model = XGBClassifier(**params, random_state=42, use_label_encoder=False)

        scores = cross_val_score(
            model, X_train, y_train,
            cv=cv_folds, scoring="roc_auc", n_jobs=-1,
        )

        return scores.mean()

    return objective

def run_hyperparameter_search(
    X_train, y_train,
    n_trials: int = 100,
    timeout_seconds: int = 3600,
) -> dict:
    study = optuna.create_study(
        direction="maximize",
        sampler=optuna.samplers.TPESampler(seed=42),
        pruner=optuna.pruners.MedianPruner(n_warmup_steps=10),
    )

    objective = create_objective(X_train, y_train)
    study.optimize(objective, n_trials=n_trials, timeout=timeout_seconds)

    return {
        "best_params": study.best_params,
        "best_score": study.best_value,
        "n_trials_completed": len(study.trials),
        "optimization_history": [
            {"trial": t.number, "value": t.value, "params": t.params}
            for t in study.trials
            if t.value is not None
        ],
    }
```

#### Cross-Validation with Stratification

```python
from sklearn.model_selection import StratifiedKFold
import numpy as np

@dataclass(frozen=True)
class CVResult:
    fold_scores: tuple[float, ...]
    mean_score: float
    std_score: float
    fold_predictions: tuple  # tuple of arrays

def run_stratified_cv(
    model_factory,
    X, y,
    n_folds: int = 5,
    scoring_fn=None,
    random_seed: int = 42,
) -> CVResult:
    skf = StratifiedKFold(n_splits=n_folds, shuffle=True, random_state=random_seed)
    fold_scores = []
    fold_predictions = []

    for fold_idx, (train_idx, val_idx) in enumerate(skf.split(X, y)):
        X_train, X_val = X[train_idx], X[val_idx]
        y_train, y_val = y[train_idx], y[val_idx]

        model = model_factory()
        model.fit(X_train, y_train)
        predictions = model.predict(X_val)

        if scoring_fn is not None:
            score = scoring_fn(y_val, predictions)
        else:
            score = model.score(X_val, y_val)

        fold_scores.append(score)
        fold_predictions.append((val_idx, predictions))
        logger.info("Fold %d/%d: score=%.4f", fold_idx + 1, n_folds, score)

    scores_array = np.array(fold_scores)

    return CVResult(
        fold_scores=tuple(fold_scores),
        mean_score=float(scores_array.mean()),
        std_score=float(scores_array.std()),
        fold_predictions=tuple(fold_predictions),
    )
```

#### Early Stopping

```python
class EarlyStopping:
    def __init__(
        self,
        patience: int,
        min_delta: float = 1e-4,
        mode: str = "min",
    ) -> None:
        self.patience = patience
        self.min_delta = min_delta
        self.mode = mode
        self.best_score: float | None = None
        self.counter: int = 0
        self._best_epoch: int = 0

    def __call__(self, epoch: int, score: float) -> bool:
        if self.best_score is None:
            self.best_score = score
            self._best_epoch = epoch
            return False

        improved = (
            (self.mode == "min" and score < self.best_score - self.min_delta)
            or (self.mode == "max" and score > self.best_score + self.min_delta)
        )

        if improved:
            self.best_score = score
            self.counter = 0
            self._best_epoch = epoch
            return False
        else:
            self.counter += 1
            if self.counter >= self.patience:
                logger.info(
                    "Early stopping at epoch %d. Best: %.4f at epoch %d",
                    epoch, self.best_score, self._best_epoch,
                )
                return True
            return False

    @property
    def best_epoch(self) -> int:
        return self._best_epoch

def train_with_early_stopping(
    model,
    train_loader,
    val_loader,
    optimizer,
    loss_fn,
    config: ExperimentConfig,
) -> dict:
    tracker = EarlyStopping(
        patience=config.early_stopping_patience,
        mode="min",
    )
    history: dict[str, list[float]] = {"train_loss": [], "val_loss": []}

    for epoch in range(config.epochs):
        train_loss = _train_epoch(model, train_loader, optimizer, loss_fn)
        val_loss = _evaluate(model, val_loader, loss_fn)

        history["train_loss"].append(train_loss)
        history["val_loss"].append(val_loss)

        log_training_step(epoch, {"train_loss": train_loss, "val_loss": val_loss})

        if tracker(epoch, val_loss):
            break

    return {
        "history": history,
        "best_epoch": tracker.best_epoch,
        "total_epochs": len(history["train_loss"]),
    }
```

### Feature Engineering

#### Feature Store Pattern

```python
from abc import ABC, abstractmethod
from datetime import datetime

@dataclass(frozen=True)
class FeatureDefinition:
    name: str
    dtype: str
    description: str
    source: str
    version: str
    tags: tuple[str, ...] = ()

@dataclass(frozen=True)
class FeatureSet:
    name: str
    entity_key: str
    features: tuple[FeatureDefinition, ...]
    created_at: datetime

class FeatureStore(ABC):
    @abstractmethod
    def register_feature_set(self, feature_set: FeatureSet) -> None:
        pass

    @abstractmethod
    def get_online_features(
        self, feature_set_name: str, entity_ids: list[str]
    ) -> dict[str, list]:
        pass

    @abstractmethod
    def get_offline_features(
        self, feature_set_name: str, entity_df, timestamp_col: str
    ):
        pass

class RedisFeatureStore(FeatureStore):
    def __init__(self, redis_client, prefix: str = "features") -> None:
        self._redis = redis_client
        self._prefix = prefix
        self._registry: dict[str, FeatureSet] = {}

    def register_feature_set(self, feature_set: FeatureSet) -> None:
        self._registry[feature_set.name] = feature_set

    def get_online_features(
        self, feature_set_name: str, entity_ids: list[str]
    ) -> dict[str, list]:
        feature_set = self._registry[feature_set_name]
        results: dict[str, list] = {f.name: [] for f in feature_set.features}

        pipeline = self._redis.pipeline()
        for entity_id in entity_ids:
            key = f"{self._prefix}:{feature_set_name}:{entity_id}"
            pipeline.hgetall(key)

        responses = pipeline.execute()
        for response in responses:
            for feature in feature_set.features:
                value = response.get(feature.name)
                results[feature.name].append(value)

        return results

    def materialize_features(
        self, feature_set_name: str, features_df, entity_col: str
    ) -> int:
        feature_set = self._registry[feature_set_name]
        feature_names = [f.name for f in feature_set.features]

        pipeline = self._redis.pipeline()
        count = 0
        for _, row in features_df.iterrows():
            key = f"{self._prefix}:{feature_set_name}:{row[entity_col]}"
            values = {name: str(row[name]) for name in feature_names if name in row}
            pipeline.hset(key, mapping=values)
            count += 1

            if count % 1000 == 0:
                pipeline.execute()
                pipeline = self._redis.pipeline()

        pipeline.execute()
        return count

    def get_offline_features(
        self, feature_set_name: str, entity_df, timestamp_col: str
    ):
        raise NotImplementedError("Use a data warehouse for offline features")
```

#### Feature Pipeline

```python
from abc import ABC, abstractmethod
import pandas as pd
import numpy as np

class FeatureTransformer(ABC):
    @abstractmethod
    def fit(self, df: pd.DataFrame) -> "FeatureTransformer":
        pass

    @abstractmethod
    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        pass

    def fit_transform(self, df: pd.DataFrame) -> pd.DataFrame:
        return self.fit(df).transform(df)

class NumericBinning(FeatureTransformer):
    def __init__(self, column: str, n_bins: int = 10, strategy: str = "quantile") -> None:
        self._column = column
        self._n_bins = n_bins
        self._strategy = strategy
        self._bin_edges: np.ndarray | None = None

    def fit(self, df: pd.DataFrame) -> "NumericBinning":
        values = df[self._column].dropna()
        if self._strategy == "quantile":
            self._bin_edges = np.percentile(
                values, np.linspace(0, 100, self._n_bins + 1)
            )
        elif self._strategy == "uniform":
            self._bin_edges = np.linspace(values.min(), values.max(), self._n_bins + 1)
        else:
            raise ValueError(f"Unknown strategy: {self._strategy}")
        return self

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        if self._bin_edges is None:
            raise RuntimeError("Must call fit() before transform()")
        binned = np.digitize(df[self._column], self._bin_edges[1:-1])
        return df.assign(**{f"{self._column}_bin": binned})

class FeaturePipeline:
    def __init__(self, transformers: list[FeatureTransformer]) -> None:
        self._transformers = transformers

    def fit(self, df: pd.DataFrame) -> "FeaturePipeline":
        current = df
        for transformer in self._transformers:
            transformer.fit(current)
            current = transformer.transform(current)
        return self

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        current = df
        for transformer in self._transformers:
            current = transformer.transform(current)
        return current
```

### Model Serving

#### FastAPI Model Endpoint

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import numpy as np
import logging
import time

logger = logging.getLogger(__name__)

class PredictionRequest(BaseModel):
    features: list[float]
    model_version: str | None = None

    class Config:
        frozen = True

class PredictionResponse(BaseModel):
    prediction: float
    confidence: float
    model_version: str
    latency_ms: float

    class Config:
        frozen = True

class ModelServer:
    def __init__(self) -> None:
        self._models: dict[str, object] = {}
        self._default_version: str | None = None

    def load_model(self, version: str, model_path: str) -> None:
        import joblib
        self._models[version] = joblib.load(model_path)
        if self._default_version is None:
            self._default_version = version
        logger.info("Loaded model version: %s", version)

    def set_default(self, version: str) -> None:
        if version not in self._models:
            raise ValueError(f"Model version {version} not loaded")
        self._default_version = version

    def predict(self, features: list[float], version: str | None = None) -> dict:
        model_version = version or self._default_version
        if model_version is None or model_version not in self._models:
            raise ValueError(f"Model version {model_version} not available")

        model = self._models[model_version]
        start_time = time.monotonic()

        input_array = np.array(features).reshape(1, -1)
        prediction = float(model.predict(input_array)[0])

        confidence = 0.0
        if hasattr(model, "predict_proba"):
            probabilities = model.predict_proba(input_array)[0]
            confidence = float(max(probabilities))

        latency = (time.monotonic() - start_time) * 1000

        return {
            "prediction": prediction,
            "confidence": confidence,
            "model_version": model_version,
            "latency_ms": round(latency, 2),
        }

def create_app(model_server: ModelServer) -> FastAPI:
    app = FastAPI(title="ML Model Serving API", version="1.0.0")

    @app.post("/predict", response_model=PredictionResponse)
    async def predict(request: PredictionRequest) -> PredictionResponse:
        try:
            result = model_server.predict(
                features=request.features,
                version=request.model_version,
            )
            return PredictionResponse(**result)
        except ValueError as error:
            raise HTTPException(status_code=400, detail=str(error))
        except Exception as error:
            logger.error("Prediction failed: %s", error)
            raise HTTPException(status_code=500, detail="Prediction failed")

    @app.get("/health")
    async def health() -> dict:
        return {"status": "healthy", "models_loaded": len(model_server._models)}

    return app
```

#### Batch Inference

```python
import pandas as pd
import pyarrow.parquet as pq
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

@dataclass(frozen=True)
class BatchInferenceConfig:
    model_path: str
    input_path: str
    output_path: str
    batch_size: int = 10_000
    feature_columns: tuple[str, ...] = ()

def run_batch_inference(config: BatchInferenceConfig) -> dict:
    import joblib

    model = joblib.load(config.model_path)
    results: list[pd.DataFrame] = []
    total_rows = 0

    parquet_file = pq.ParquetFile(config.input_path)
    for batch in parquet_file.iter_batches(batch_size=config.batch_size, columns=list(config.feature_columns)):
        chunk = batch.to_pandas()
        if chunk.empty:
            continue
        predictions = model.predict(chunk)

        output_chunk = chunk.assign(
            prediction=predictions,
            model_path=config.model_path,
            scored_at=pd.Timestamp.utcnow(),
        )
        results.append(output_chunk)
        total_rows += len(chunk)
        logger.info("Scored %d rows (total: %d)", len(chunk), total_rows)

    if not results:
        raise ValueError(f"No data found in {config.input_path}")
    output_df = pd.concat(results, ignore_index=True)
    output_df.to_parquet(config.output_path, index=False)

    return {
        "total_rows": total_rows,
        "output_path": config.output_path,
        "prediction_distribution": {
            "mean": float(output_df["prediction"].mean()),
            "std": float(output_df["prediction"].std()),
            "min": float(output_df["prediction"].min()),
            "max": float(output_df["prediction"].max()),
        },
    }
```

#### A/B Testing and Canary Deployment

```python
import random
import hashlib
from dataclasses import dataclass

@dataclass(frozen=True)
class ABTestConfig:
    experiment_name: str
    control_version: str
    treatment_version: str
    traffic_split: float  # fraction going to treatment (0.0 to 1.0)

class ABRouter:
    def __init__(self, config: ABTestConfig, model_server: ModelServer) -> None:
        self._config = config
        self._model_server = model_server

    def route(self, user_id: str, features: list[float]) -> dict:
        bucket = self._get_bucket(user_id)

        if bucket < self._config.traffic_split:
            version = self._config.treatment_version
            variant = "treatment"
        else:
            version = self._config.control_version
            variant = "control"

        result = self._model_server.predict(features, version=version)
        return {
            **result,
            "experiment": self._config.experiment_name,
            "variant": variant,
            "user_id": user_id,
        }

    def _get_bucket(self, user_id: str) -> float:
        hash_input = f"{self._config.experiment_name}:{user_id}"
        hash_value = hashlib.md5(hash_input.encode()).hexdigest()
        return int(hash_value[:8], 16) / 0xFFFFFFFF
```

### Monitoring

#### Data Drift Detection

```python
import pandas as pd
import numpy as np
from scipy import stats
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)

@dataclass(frozen=True)
class DriftResult:
    feature_name: str
    statistic: float
    p_value: float
    is_drifted: bool
    method: str

def detect_drift_ks(
    reference: np.ndarray,
    current: np.ndarray,
    threshold: float = 0.05,
) -> DriftResult:
    statistic, p_value = stats.ks_2samp(reference, current)
    return DriftResult(
        feature_name="",
        statistic=float(statistic),
        p_value=float(p_value),
        is_drifted=p_value < threshold,
        method="kolmogorov_smirnov",
    )

def detect_drift_psi(
    reference: np.ndarray,
    current: np.ndarray,
    n_bins: int = 10,
    threshold: float = 0.1,
) -> DriftResult:
    """Population Stability Index for drift detection."""
    breakpoints = np.percentile(reference, np.linspace(0, 100, n_bins + 1))
    breakpoints[0] = -np.inf
    breakpoints[-1] = np.inf

    ref_counts = np.histogram(reference, bins=breakpoints)[0] / len(reference)
    cur_counts = np.histogram(current, bins=breakpoints)[0] / len(current)

    # Avoid division by zero
    ref_counts = np.clip(ref_counts, 1e-6, None)
    cur_counts = np.clip(cur_counts, 1e-6, None)

    psi = float(np.sum((cur_counts - ref_counts) * np.log(cur_counts / ref_counts)))

    return DriftResult(
        feature_name="",
        statistic=psi,
        p_value=0.0,
        is_drifted=psi > threshold,
        method="psi",
    )

class DriftMonitor:
    def __init__(
        self,
        reference_data: dict[str, np.ndarray],
        threshold: float = 0.05,
    ) -> None:
        self._reference = reference_data
        self._threshold = threshold

    def check_all_features(
        self, current_data: dict[str, np.ndarray]
    ) -> list[DriftResult]:
        results = []
        for feature_name, ref_values in self._reference.items():
            if feature_name not in current_data:
                logger.warning("Feature %s missing from current data", feature_name)
                continue

            result = detect_drift_ks(
                ref_values,
                current_data[feature_name],
                self._threshold,
            )
            results.append(DriftResult(
                feature_name=feature_name,
                statistic=result.statistic,
                p_value=result.p_value,
                is_drifted=result.is_drifted,
                method=result.method,
            ))

            if result.is_drifted:
                logger.warning(
                    "Drift detected for feature %s (p=%.4f)",
                    feature_name, result.p_value,
                )

        return results
```

#### Prediction Quality Monitoring

```python
from collections import deque
from datetime import datetime, timedelta

class PredictionMonitor:
    def __init__(self, window_size: int = 1000) -> None:
        self._predictions: deque = deque(maxlen=window_size)
        self._paired: deque[tuple[float, float]] = deque(maxlen=window_size)
        self._latencies: deque = deque(maxlen=window_size)
        self._errors: deque = deque(maxlen=window_size)

    def record_prediction(
        self,
        prediction: float,
        latency_ms: float,
        actual: float | None = None,
    ) -> None:
        self._predictions.append(prediction)
        self._latencies.append(latency_ms)
        if actual is not None:
            self._paired.append((prediction, actual))

    def record_error(self, error: str) -> None:
        self._errors.append({"error": error, "timestamp": datetime.utcnow()})

    def get_metrics(self) -> dict:
        predictions = np.array(self._predictions)
        latencies = np.array(self._latencies)

        metrics = {
            "prediction_count": len(predictions),
            "prediction_mean": float(predictions.mean()) if len(predictions) > 0 else 0,
            "prediction_std": float(predictions.std()) if len(predictions) > 0 else 0,
            "latency_p50_ms": float(np.percentile(latencies, 50)) if len(latencies) > 0 else 0,
            "latency_p95_ms": float(np.percentile(latencies, 95)) if len(latencies) > 0 else 0,
            "latency_p99_ms": float(np.percentile(latencies, 99)) if len(latencies) > 0 else 0,
            "error_count": len(self._errors),
            "error_rate": len(self._errors) / max(len(predictions), 1),
        }

        if self._paired:
            paired_preds, actuals = zip(*self._paired)
            paired_preds = np.array(paired_preds)
            actuals = np.array(actuals)
            metrics["mae"] = float(np.mean(np.abs(actuals - paired_preds)))
            metrics["rmse"] = float(np.sqrt(np.mean((actuals - paired_preds) ** 2)))

        return metrics
```

### CI/CD for ML

#### Model Validation Gates

```python
@dataclass(frozen=True)
class ValidationGate:
    metric_name: str
    threshold: float
    comparison: str  # "gte", "lte", "gt", "lt"

    def passes(self, value: float) -> bool:
        comparisons = {
            "gte": value >= self.threshold,
            "lte": value <= self.threshold,
            "gt": value > self.threshold,
            "lt": value < self.threshold,
        }
        return comparisons[self.comparison]

def validate_model_for_promotion(
    metrics: dict[str, float],
    gates: list[ValidationGate],
) -> tuple[bool, list[str]]:
    failures = []

    for gate in gates:
        value = metrics.get(gate.metric_name)
        if value is None:
            failures.append(f"Missing metric: {gate.metric_name}")
            continue
        if not gate.passes(value):
            failures.append(
                f"{gate.metric_name}={value:.4f} fails gate "
                f"({gate.comparison} {gate.threshold})"
            )

    return len(failures) == 0, failures

# Usage
PRODUCTION_GATES = [
    ValidationGate("accuracy", 0.85, "gte"),
    ValidationGate("f1_score", 0.80, "gte"),
    ValidationGate("latency_p99_ms", 200.0, "lte"),
    ValidationGate("auc_roc", 0.90, "gte"),
    ValidationGate("false_positive_rate", 0.05, "lte"),
]
```

### Testing ML Code

#### Unit Tests for Transforms

```python
import pytest
import numpy as np
import pandas as pd

class TestFeatureTransforms:
    @pytest.fixture
    def sample_data(self) -> pd.DataFrame:
        return pd.DataFrame({
            "age": [25, 30, 35, 40, 45],
            "income": [30000, 50000, 70000, 90000, 110000],
            "category": ["A", "B", "A", "C", "B"],
        })

    def test_numeric_binning_fit_transform(self, sample_data: pd.DataFrame):
        binner = NumericBinning("income", n_bins=3, strategy="quantile")
        result = binner.fit_transform(sample_data)

        assert "income_bin" in result.columns
        assert result["income_bin"].nunique() <= 3
        assert len(result) == len(sample_data)

    def test_numeric_binning_raises_without_fit(self, sample_data: pd.DataFrame):
        binner = NumericBinning("income", n_bins=3)
        with pytest.raises(RuntimeError, match="Must call fit"):
            binner.transform(sample_data)

    def test_feature_pipeline_preserves_rows(self, sample_data: pd.DataFrame):
        pipeline = FeaturePipeline([
            NumericBinning("age", n_bins=3),
            NumericBinning("income", n_bins=5),
        ])
        result = pipeline.fit(sample_data).transform(sample_data)
        assert len(result) == len(sample_data)
```

#### Integration Tests for Pipelines

```python
class TestTrainingPipeline:
    @pytest.fixture
    def training_config(self) -> ExperimentConfig:
        return ExperimentConfig(
            model_type="xgboost",
            learning_rate=0.1,
            batch_size=32,
            epochs=5,
            random_seed=42,
            data_version="test-v1",
            feature_columns=("feature_a", "feature_b", "feature_c"),
        )

    def test_full_training_pipeline(self, training_config, tmp_path):
        # Arrange
        X = np.random.randn(100, 3)
        y = (X[:, 0] + X[:, 1] > 0).astype(int)

        # Act
        set_all_seeds(training_config.random_seed)
        from sklearn.ensemble import RandomForestClassifier
        model = RandomForestClassifier(
            n_estimators=10, random_state=training_config.random_seed
        )
        model.fit(X, y)

        # Assert
        accuracy = model.score(X, y)
        assert accuracy > 0.7, f"Model accuracy too low: {accuracy}"

    def test_config_reproducibility(self, training_config):
        hash1 = training_config.to_hash()
        hash2 = training_config.to_hash()
        assert hash1 == hash2

        different_config = ExperimentConfig(
            model_type="xgboost",
            learning_rate=0.01,
            batch_size=32,
            epochs=5,
            random_seed=42,
            data_version="test-v1",
            feature_columns=("feature_a", "feature_b", "feature_c"),
        )
        assert training_config.to_hash() != different_config.to_hash()
```

#### Model Quality Tests

```python
class TestModelQuality:
    def test_model_beats_baseline(self, trained_model, test_data):
        X_test, y_test = test_data
        model_accuracy = trained_model.score(X_test, y_test)

        # Baseline: always predict the majority class
        majority_class = np.bincount(y_test).argmax()
        baseline_accuracy = (y_test == majority_class).mean()

        assert model_accuracy > baseline_accuracy, (
            f"Model ({model_accuracy:.4f}) does not beat "
            f"baseline ({baseline_accuracy:.4f})"
        )

    def test_no_feature_leakage(self, model, training_data, holdout_data):
        train_score = model.score(*training_data)
        holdout_score = model.score(*holdout_data)

        gap = train_score - holdout_score
        assert gap < 0.15, (
            f"Possible feature leakage: train={train_score:.4f}, "
            f"holdout={holdout_score:.4f}, gap={gap:.4f}"
        )

    def test_prediction_distribution(self, model, test_features):
        predictions = model.predict(test_features)

        assert not np.all(predictions == predictions[0]), (
            "Model produces constant predictions"
        )

        unique_ratio = len(np.unique(predictions)) / len(predictions)
        assert unique_ratio > 0.01, (
            f"Model predictions lack diversity: {unique_ratio:.4f} unique ratio"
        )

    def test_model_fairness(self, model, test_data_with_groups):
        X_test, y_test, groups = test_data_with_groups

        group_accuracies = {}
        for group in np.unique(groups):
            mask = groups == group
            if mask.sum() > 0:
                accuracy = model.score(X_test[mask], y_test[mask])
                group_accuracies[group] = accuracy

        accuracies = list(group_accuracies.values())
        disparity = max(accuracies) - min(accuracies)

        assert disparity < 0.1, (
            f"Fairness violation: accuracy disparity={disparity:.4f}. "
            f"Group accuracies: {group_accuracies}"
        )
```
