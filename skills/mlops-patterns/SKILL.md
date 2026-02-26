---
name: mlops-patterns
description: MLOps patterns for model training, evaluation, deployment, monitoring, and experiment tracking with reproducible ML pipelines.
origin: ECC
---

# MLOps Patterns

Patterns for building reproducible, production-grade machine learning systems.

## When to Activate

- Training and evaluating ML models
- Setting up experiment tracking
- Deploying models to production
- Monitoring model performance and drift
- Building ML CI/CD pipelines

## Core Principles

- **Reproducibility**: Same code + data + config = same result
- **Versioning**: Track code, data, models, and configs together
- **Monitoring**: Detect drift before it impacts users
- **Automation**: CI/CD for ML with validation gates

## Reproducibility

```python
import random
import numpy as np
import torch
from dataclasses import dataclass
from hashlib import sha256

@dataclass(frozen=True)
class ExperimentConfig:
    model_name: str
    learning_rate: float
    batch_size: int
    epochs: int
    seed: int = 42

    @property
    def fingerprint(self) -> str:
        config_str = f"{self.model_name}-{self.learning_rate}-{self.batch_size}-{self.epochs}-{self.seed}"
        return sha256(config_str.encode()).hexdigest()[:12]

def set_all_seeds(seed: int) -> None:
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)
```

## Experiment Tracking

### MLflow Integration

```python
import mlflow
from contextlib import contextmanager

@contextmanager
def tracked_experiment(config: ExperimentConfig):
    mlflow.set_experiment(config.model_name)
    with mlflow.start_run(run_name=config.fingerprint):
        mlflow.log_params({
            'learning_rate': config.learning_rate,
            'batch_size': config.batch_size,
            'epochs': config.epochs,
        })
        yield mlflow
        mlflow.log_artifact('model/')

# Usage
with tracked_experiment(config) as tracker:
    for epoch in range(config.epochs):
        loss = train_epoch(model, dataloader)
        tracker.log_metric('train_loss', loss, step=epoch)

    metrics = evaluate(model, test_loader)
    tracker.log_metrics(metrics)
```

## Model Training

### Hyperparameter Tuning with Optuna

```python
import optuna

def objective(trial: optuna.Trial) -> float:
    lr = trial.suggest_float('learning_rate', 1e-5, 1e-2, log=True)
    batch_size = trial.suggest_categorical('batch_size', [16, 32, 64])
    dropout = trial.suggest_float('dropout', 0.1, 0.5)

    model = create_model(dropout=dropout)
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)

    for epoch in range(10):
        train_loss = train_epoch(model, train_loader, optimizer)
        val_loss = evaluate(model, val_loader)

        trial.report(val_loss, epoch)
        if trial.should_prune():
            raise optuna.TrialPruned()

    return val_loss

study = optuna.create_study(
    direction='minimize',
    pruner=optuna.pruners.MedianPruner(),
)
study.optimize(objective, n_trials=50)
```

### Early Stopping

```python
@dataclass
class EarlyStopping:
    patience: int = 5
    min_delta: float = 0.001
    best_score: float = float('inf')
    counter: int = 0

    def should_stop(self, score: float) -> bool:
        if score < self.best_score - self.min_delta:
            return EarlyStopping(
                patience=self.patience,
                min_delta=self.min_delta,
                best_score=score,
                counter=0,
            ).counter > self.patience  # Always False, resets counter
        new_counter = self.counter + 1
        return new_counter >= self.patience

    def step(self, score: float) -> 'EarlyStopping':
        if score < self.best_score - self.min_delta:
            return EarlyStopping(
                patience=self.patience,
                min_delta=self.min_delta,
                best_score=score,
                counter=0,
            )
        return EarlyStopping(
            patience=self.patience,
            min_delta=self.min_delta,
            best_score=self.best_score,
            counter=self.counter + 1,
        )
```

## Model Serving

### FastAPI Prediction Endpoint

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib

app = FastAPI()

class PredictionRequest(BaseModel):
    features: list[float]

class PredictionResponse(BaseModel):
    prediction: float
    model_version: str
    confidence: float

@app.on_event("startup")
async def load_model():
    app.state.model = joblib.load("models/latest/model.joblib")
    app.state.model_version = open("models/latest/version.txt").read().strip()

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    try:
        prediction = app.state.model.predict([request.features])[0]
        confidence = max(app.state.model.predict_proba([request.features])[0])
        return PredictionResponse(
            prediction=prediction,
            model_version=app.state.model_version,
            confidence=confidence,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")
```

### A/B Testing Router

```python
from hashlib import md5

def get_model_variant(user_id: str, experiment: str) -> str:
    """Deterministic bucketing for A/B tests."""
    hash_input = f"{user_id}:{experiment}"
    hash_value = int(md5(hash_input.encode()).hexdigest(), 16)
    return "control" if hash_value % 100 < 50 else "treatment"
```

## Monitoring

### Drift Detection

```python
from scipy import stats
from dataclasses import dataclass

@dataclass(frozen=True)
class DriftResult:
    feature: str
    statistic: float
    p_value: float
    is_drifted: bool

def detect_drift(
    reference: pd.DataFrame,
    current: pd.DataFrame,
    threshold: float = 0.05,
) -> list[DriftResult]:
    results = []
    for col in reference.select_dtypes(include=[np.number]).columns:
        stat, p_value = stats.ks_2samp(reference[col], current[col])
        results.append(DriftResult(
            feature=col,
            statistic=stat,
            p_value=p_value,
            is_drifted=p_value < threshold,
        ))
    return results
```

## Validation Gates

```python
@dataclass(frozen=True)
class QualityGate:
    metric: str
    threshold: float
    direction: str  # 'higher' or 'lower'

GATES = [
    QualityGate('accuracy', 0.85, 'higher'),
    QualityGate('f1_score', 0.80, 'higher'),
    QualityGate('latency_p95_ms', 100, 'lower'),
]

def check_gates(metrics: dict[str, float], gates: list[QualityGate]) -> list[str]:
    failures = []
    for gate in gates:
        value = metrics.get(gate.metric, 0)
        if gate.direction == 'higher' and value < gate.threshold:
            failures.append(f"{gate.metric}: {value:.4f} < {gate.threshold}")
        elif gate.direction == 'lower' and value > gate.threshold:
            failures.append(f"{gate.metric}: {value:.4f} > {gate.threshold}")
    return failures
```

## Testing ML Code

```python
def test_feature_transform_preserves_shape():
    raw = pd.DataFrame({'age': [25, 30], 'income': [50000, 75000]})
    transformed = transform_features(raw)
    assert transformed.shape[0] == raw.shape[0]

def test_model_beats_baseline():
    predictions = model.predict(test_features)
    model_accuracy = accuracy_score(test_labels, predictions)
    baseline_accuracy = test_labels.value_counts(normalize=True).max()
    assert model_accuracy > baseline_accuracy

def test_no_data_leakage():
    train_ids = set(train_df['user_id'])
    test_ids = set(test_df['user_id'])
    assert train_ids.isdisjoint(test_ids), "Data leakage detected"
```

**Remember**: ML systems fail in ways traditional software doesn't. Monitor predictions, validate data, and treat model training as a reproducible pipeline, not a notebook experiment.
