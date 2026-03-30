# PyHealth Training, Evaluation, and Interpretability

## Overview

PyHealth provides comprehensive tools for training models, evaluating predictions, ensuring model reliability, and interpreting results for clinical applications.

## Trainer Class

### Core Functionality

The `Trainer` class manages the complete model training and evaluation workflow with PyTorch integration.

**Initialization:**
```python
from pyhealth.trainer import Trainer

trainer = Trainer(
    model=model,  # PyHealth or PyTorch model
    device="cuda",  # or "cpu"
)
```

### Training

**train() method**

Trains models with comprehensive monitoring and checkpointing.

**Parameters:**
- `train_dataloader`: Training data loader
- `val_dataloader`: Validation data loader (optional)
- `test_dataloader`: Test data loader (optional)
- `epochs`: Number of training epochs
- `optimizer`: Optimizer instance or class
- `learning_rate`: Learning rate (default: 1e-3)
- `weight_decay`: L2 regularization (default: 0)
- `max_grad_norm`: Gradient clipping threshold
- `monitor`: Metric to monitor (e.g., "pr_auc_score")
- `monitor_criterion`: "max" or "min"
- `save_path`: Checkpoint save directory

**Usage:**
```python
trainer.train(
    train_dataloader=train_loader,
    val_dataloader=val_loader,
    test_dataloader=test_loader,
    epochs=50,
    optimizer=torch.optim.Adam,
    learning_rate=1e-3,
    weight_decay=1e-5,
    max_grad_norm=5.0,
    monitor="pr_auc_score",
    monitor_criterion="max",
    save_path="./checkpoints"
)
```

**Training Features:**

1. **Automatic Checkpointing**: Saves best model based on monitored metric

2. **Early Stopping**: Stops training if no improvement

3. **Gradient Clipping**: Prevents exploding gradients

4. **Progress Tracking**: Displays training progress and metrics

5. **Multi-GPU Support**: Automatic device placement

### Inference

**inference() method**

Performs predictions on datasets.

**Parameters:**
- `dataloader`: Data loader for inference
- `additional_outputs`: List of additional outputs to return
- `return_patient_ids`: Return patient identifiers

**Usage:**
```python
predictions = trainer.inference(
    dataloader=test_loader,
    additional_outputs=["attention_weights", "embeddings"],
    return_patient_ids=True
)
```

**Returns:**
- `y_pred`: Model predictions
- `y_true`: Ground truth labels
- `patient_ids`: Patient identifiers (if requested)
- Additional outputs (if specified)

### Evaluation

**evaluate() method**

Computes comprehensive evaluation metrics.

**Parameters:**
- `dataloader`: Data loader for evaluation
- `metrics`: List of metric functions

**Usage:**
```python
from pyhealth.metrics import binary_metrics_fn

results = trainer.evaluate(
    dataloader=test_loader,
    metrics=["accuracy", "pr_auc_score", "roc_auc_score", "f1_score"]
)

print(results)
# Output: {'accuracy': 0.85, 'pr_auc_score': 0.78, 'roc_auc_score': 0.82, 'f1_score': 0.73}
```

### Checkpoint Management

**save() method**
```python
trainer.save("./models/best_model.pt")
```

**load() method**
```python
trainer.load("./models/best_model.pt")
```

## Evaluation Metrics

### Binary Classification Metrics

**Available Metrics:**
- `accuracy`: Overall accuracy
- `precision`: Positive predictive value
- `recall`: Sensitivity/True positive rate
- `f1_score`: F1 score (harmonic mean of precision and recall)
- `roc_auc_score`: Area under ROC curve
- `pr_auc_score`: Area under precision-recall curve
- `cohen_kappa`: Inter-rater reliability

**Usage:**
```python
from pyhealth.metrics import binary_metrics_fn

# Comprehensive binary metrics
metrics = binary_metrics_fn(
    y_true=labels,
    y_pred=predictions,
    metrics=["accuracy", "f1_score", "pr_auc_score", "roc_auc_score"]
)
```

**Threshold Selection:**
```python
# Default threshold: 0.5
predictions_binary = (predictions > 0.5).astype(int)

# Optimal threshold by F1
from sklearn.metrics import f1_score
thresholds = np.arange(0.1, 0.9, 0.05)
f1_scores = [f1_score(y_true, (y_pred > t).astype(int)) for t in thresholds]
optimal_threshold = thresholds[np.argmax(f1_scores)]
```

**Best Practices:**
- **Use AUROC**: Overall model discrimination
- **Use AUPRC**: Especially for imbalanced classes
- **Use F1**: Balance precision and recall
- **Report confidence intervals**: Bootstrap resampling

### Multi-Class Classification Metrics

**Available Metrics:**
- `accuracy`: Overall accuracy
- `macro_f1`: Unweighted mean F1 across classes
- `micro_f1`: Global F1 (total TP, FP, FN)
- `weighted_f1`: Weighted mean F1 by class frequency
- `cohen_kappa`: Multi-class kappa

**Usage:**
```python
from pyhealth.metrics import multiclass_metrics_fn

metrics = multiclass_metrics_fn(
    y_true=labels,
    y_pred=predictions,
    metrics=["accuracy", "macro_f1", "weighted_f1"]
)
```

**Per-Class Metrics:**
```python
from sklearn.metrics import classification_report

print(classification_report(y_true, y_pred,
    target_names=["Wake", "N1", "N2", "N3", "REM"]))
```

**Confusion Matrix:**
```python
from sklearn.metrics import confusion_matrix
import seaborn as sns

cm = confusion_matrix(y_true, y_pred)
sns.heatmap(cm, annot=True, fmt='d')
```

### Multi-Label Classification Metrics

**Available Metrics:**
- `jaccard_score`: Intersection over union
- `hamming_loss`: Fraction of incorrect labels
- `example_f1`: F1 per example (micro average)
- `label_f1`: F1 per label (macro average)

**Usage:**
```python
from pyhealth.metrics import multilabel_metrics_fn

# y_pred: [n_samples, n_labels] binary matrix
metrics = multilabel_metrics_fn(
    y_true=label_matrix,
    y_pred=pred_matrix,
    metrics=["jaccard_score", "example_f1", "label_f1"]
)
```

**Drug Recommendation Metrics:**
```python
# Jaccard similarity (intersection/union)
jaccard = len(set(true_drugs) & set(pred_drugs)) / len(set(true_drugs) | set(pred_drugs))

# Precision@k: Precision for top-k predictions
def precision_at_k(y_true, y_pred, k=10):
    top_k_pred = y_pred.argsort()[-k:]
    return len(set(y_true) & set(top_k_pred)) / k
```

### Regression Metrics

**Available Metrics:**
- `mean_absolute_error`: Average absolute error
- `mean_squared_error`: Average squared error
- `root_mean_squared_error`: RMSE
- `r2_score`: Coefficient of determination

**Usage:**
```python
from pyhealth.metrics import regression_metrics_fn

metrics = regression_metrics_fn(
    y_true=true_values,
    y_pred=predictions,
    metrics=["mae", "rmse", "r2"]
)
```

**Percentage Error Metrics:**
```python
# Mean Absolute Percentage Error
mape = np.mean(np.abs((y_true - y_pred) / y_true)) * 100

# Median Absolute Percentage Error (robust to outliers)
medape = np.median(np.abs((y_true - y_pred) / y_true)) * 100
```

### Fairness Metrics

**Purpose:** Assess model bias across demographic groups

**Available Metrics:**
- `demographic_parity`: Equal positive prediction rates
- `equalized_odds`: Equal TPR and FPR across groups
- `equal_opportunity`: Equal TPR across groups
- `predictive_parity`: Equal PPV across groups

**Usage:**
```python
from pyhealth.metrics import fairness_metrics_fn

fairness_results = fairness_metrics_fn(
    y_true=labels,
    y_pred=predictions,
    sensitive_attributes=demographics,  # e.g., race, gender
    metrics=["demographic_parity", "equalized_odds"]
)
```

**Example:**
```python
# Evaluate fairness across gender
male_mask = (demographics == "male")
female_mask = (demographics == "female")

male_tpr = recall_score(y_true[male_mask], y_pred[male_mask])
female_tpr = recall_score(y_true[female_mask], y_pred[female_mask])

tpr_disparity = abs(male_tpr - female_tpr)
print(f"TPR disparity: {tpr_disparity:.3f}")
```

## Calibration and Uncertainty Quantification

### Model Calibration

**Purpose:** Ensure predicted probabilities match actual frequencies

**Calibration Plot:**
```python
from sklearn.calibration import calibration_curve
import matplotlib.pyplot as plt

fraction_of_positives, mean_predicted_value = calibration_curve(
    y_true, y_prob, n_bins=10
)

plt.plot(mean_predicted_value, fraction_of_positives, marker='o')
plt.plot([0, 1], [0, 1], linestyle='--', label='Perfect calibration')
plt.xlabel('Mean predicted probability')
plt.ylabel('Fraction of positives')
plt.legend()
```

**Expected Calibration Error (ECE):**
```python
def expected_calibration_error(y_true, y_prob, n_bins=10):
    """Compute ECE"""
    bins = np.linspace(0, 1, n_bins + 1)
    bin_indices = np.digitize(y_prob, bins) - 1

    ece = 0
    for i in range(n_bins):
        mask = bin_indices == i
        if mask.sum() > 0:
            bin_accuracy = y_true[mask].mean()
            bin_confidence = y_prob[mask].mean()
            ece += mask.sum() / len(y_true) * abs(bin_accuracy - bin_confidence)

    return ece
```

**Calibration Methods:**

1. **Platt Scaling**: Logistic regression on validation predictions
```python
from sklearn.linear_model import LogisticRegression

calibrator = LogisticRegression()
calibrator.fit(val_predictions.reshape(-1, 1), val_labels)
calibrated_probs = calibrator.predict_proba(test_predictions.reshape(-1, 1))[:, 1]
```

2. **Isotonic Regression**: Non-parametric calibration
```python
from sklearn.isotonic import IsotonicRegression

calibrator = IsotonicRegression(out_of_bounds='clip')
calibrator.fit(val_predictions, val_labels)
calibrated_probs = calibrator.predict(test_predictions)
```

3. **Temperature Scaling**: Scale logits before softmax
```python
def find_temperature(logits, labels):
    """Find optimal temperature parameter"""
    from scipy.optimize import minimize

    def nll(temp):
        scaled_logits = logits / temp
        probs = torch.softmax(scaled_logits, dim=1)
        return F.cross_entropy(probs, labels).item()

    result = minimize(nll, x0=1.0, method='BFGS')
    return result.x[0]

temperature = find_temperature(val_logits, val_labels)
calibrated_logits = test_logits / temperature
```

### Uncertainty Quantification

**Conformal Prediction:**

Provide prediction sets with guaranteed coverage.

**Usage:**
```python
from pyhealth.metrics import prediction_set_metrics_fn

# Calibrate on validation set
scores = 1 - val_predictions[np.arange(len(val_labels)), val_labels]
quantile_level = np.quantile(scores, 0.9)  # 90% coverage

# Generate prediction sets on test set
prediction_sets = test_predictions > (1 - quantile_level)

# Evaluate
metrics = prediction_set_metrics_fn(
    y_true=test_labels,
    prediction_sets=prediction_sets,
    metrics=["coverage", "average_size"]
)
```

**Monte Carlo Dropout:**

Estimate uncertainty through dropout at inference.

```python
def predict_with_uncertainty(model, dataloader, num_samples=20):
    """Predict with uncertainty using MC dropout"""
    model.train()  # Keep dropout active

    predictions = []
    for _ in range(num_samples):
        batch_preds = []
        for batch in dataloader:
            with torch.no_grad():
                output = model(batch)
                batch_preds.append(output)
        predictions.append(torch.cat(batch_preds))

    predictions = torch.stack(predictions)
    mean_pred = predictions.mean(dim=0)
    std_pred = predictions.std(dim=0)  # Uncertainty

    return mean_pred, std_pred
```

**Ensemble Uncertainty:**

```python
# Train multiple models
models = [train_model(seed=i) for i in range(5)]

# Predict with ensemble
ensemble_preds = []
for model in models:
    pred = model.predict(test_data)
    ensemble_preds.append(pred)

mean_pred = np.mean(ensemble_preds, axis=0)
std_pred = np.std(ensemble_preds, axis=0)  # Uncertainty
```

## Interpretability

### Attention Visualization

**For Transformer and RETAIN models:**

```python
# Get attention weights during inference
outputs = trainer.inference(
    test_loader,
    additional_outputs=["attention_weights"]
)

attention = outputs["attention_weights"]

# Visualize attention for sample
import matplotlib.pyplot as plt
import seaborn as sns

sample_idx = 0
sample_attention = attention[sample_idx]  # [seq_length, seq_length]

sns.heatmap(sample_attention, cmap='viridis')
plt.xlabel('Key Position')
plt.ylabel('Query Position')
plt.title('Attention Weights')
plt.show()
```

**RETAIN Interpretation:**

```python
# RETAIN provides visit-level and feature-level attention
visit_attention = outputs["visit_attention"]  # Which visits are important
feature_attention = outputs["feature_attention"]  # Which features are important

# Find most influential visit
most_important_visit = visit_attention[sample_idx].argmax()

# Find most influential features in that visit
important_features = feature_attention[sample_idx, most_important_visit].argsort()[-10:]
```

### Feature Importance

**Permutation Importance:**

```python
from sklearn.inspection import permutation_importance

def get_predictions(model, X):
    return model.predict(X)

result = permutation_importance(
    model, X_test, y_test,
    n_repeats=10,
    scoring='roc_auc'
)

# Sort features by importance
indices = result.importances_mean.argsort()[::-1]
for i in indices[:10]:
    print(f"{feature_names[i]}: {result.importances_mean[i]:.3f}")
```

**SHAP Values:**

```python
import shap

# Create explainer
explainer = shap.DeepExplainer(model, train_data)

# Compute SHAP values
shap_values = explainer.shap_values(test_data)

# Visualize
shap.summary_plot(shap_values, test_data, feature_names=feature_names)
```

### ChEFER (Clinical Health Event Feature Extraction and Ranking)

**PyHealth's Interpretability Tool:**

```python
from pyhealth.explain import ChEFER

explainer = ChEFER(model=model, dataset=test_dataset)

# Get feature importance for prediction
importance_scores = explainer.explain(
    patient_id="patient_123",
    visit_id="visit_456"
)

# Visualize top features
explainer.plot_importance(importance_scores, top_k=20)
```

## Complete Training Pipeline Example

```python
from pyhealth.datasets import MIMIC4Dataset
from pyhealth.tasks import mortality_prediction_mimic4_fn
from pyhealth.datasets import split_by_patient, get_dataloader
from pyhealth.models import Transformer
from pyhealth.trainer import Trainer
from pyhealth.metrics import binary_metrics_fn

# 1. Load and prepare data
dataset = MIMIC4Dataset(root="/path/to/mimic4")
sample_dataset = dataset.set_task(mortality_prediction_mimic4_fn)

# 2. Split data
train_data, val_data, test_data = split_by_patient(
    sample_dataset, ratios=[0.7, 0.1, 0.2], seed=42
)

# 3. Create data loaders
train_loader = get_dataloader(train_data, batch_size=64, shuffle=True)
val_loader = get_dataloader(val_data, batch_size=64, shuffle=False)
test_loader = get_dataloader(test_data, batch_size=64, shuffle=False)

# 4. Initialize model
model = Transformer(
    dataset=sample_dataset,
    feature_keys=["diagnoses", "procedures", "medications"],
    mode="binary",
    embedding_dim=128,
    num_heads=8,
    num_layers=3,
    dropout=0.3
)

# 5. Train model
trainer = Trainer(model=model, device="cuda")
trainer.train(
    train_dataloader=train_loader,
    val_dataloader=val_loader,
    epochs=50,
    optimizer=torch.optim.Adam,
    learning_rate=1e-3,
    weight_decay=1e-5,
    monitor="pr_auc_score",
    monitor_criterion="max",
    save_path="./checkpoints/mortality_model"
)

# 6. Evaluate on test set
test_results = trainer.evaluate(
    test_loader,
    metrics=["accuracy", "precision", "recall", "f1_score",
             "roc_auc_score", "pr_auc_score"]
)

print("Test Results:")
for metric, value in test_results.items():
    print(f"{metric}: {value:.4f}")

# 7. Get predictions for analysis
predictions = trainer.inference(test_loader, return_patient_ids=True)
y_pred, y_true, patient_ids = predictions

# 8. Calibration analysis
from sklearn.calibration import calibration_curve

fraction_pos, mean_pred = calibration_curve(y_true, y_pred, n_bins=10)
ece = expected_calibration_error(y_true, y_pred)
print(f"Expected Calibration Error: {ece:.4f}")

# 9. Save final model
trainer.save("./models/mortality_transformer_final.pt")
```

## Best Practices

### Training

1. **Monitor multiple metrics**: Track both loss and task-specific metrics
2. **Use validation set**: Prevent overfitting with early stopping
3. **Gradient clipping**: Stabilize training (max_grad_norm=5.0)
4. **Learning rate scheduling**: Reduce LR on plateau
5. **Checkpoint best model**: Save based on validation performance

### Evaluation

1. **Use task-appropriate metrics**: AUROC/AUPRC for binary, macro-F1 for imbalanced multi-class
2. **Report confidence intervals**: Bootstrap or cross-validation
3. **Stratified evaluation**: Report metrics by subgroups
4. **Clinical metrics**: Include clinically relevant thresholds
5. **Fairness assessment**: Evaluate across demographic groups

### Deployment

1. **Calibrate predictions**: Ensure probabilities are reliable
2. **Quantify uncertainty**: Provide confidence estimates
3. **Monitor performance**: Track metrics in production
4. **Handle distribution shift**: Detect when data changes
5. **Interpretability**: Provide explanations for predictions
