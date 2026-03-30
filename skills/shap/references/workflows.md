# SHAP Workflows and Best Practices

This document provides comprehensive workflows, best practices, and common use cases for using SHAP in various model interpretation scenarios.

## Basic Workflow Structure

Every SHAP analysis follows a general workflow:

1. **Train Model**: Build and train the machine learning model
2. **Select Explainer**: Choose appropriate explainer based on model type
3. **Compute SHAP Values**: Generate explanations for test samples
4. **Visualize Results**: Use plots to understand feature impacts
5. **Interpret and Act**: Draw conclusions and make decisions

## Workflow 1: Basic Model Explanation

**Use Case**: Understanding feature importance and prediction behavior for a trained model

```python
import shap
import pandas as pd
from sklearn.model_selection import train_test_split

# Step 1: Load and split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Step 2: Train model (example with XGBoost)
import xgboost as xgb
model = xgb.XGBClassifier(n_estimators=100, max_depth=5)
model.fit(X_train, y_train)

# Step 3: Create explainer
explainer = shap.TreeExplainer(model)

# Step 4: Compute SHAP values
shap_values = explainer(X_test)

# Step 5: Visualize global importance
shap.plots.beeswarm(shap_values, max_display=15)

# Step 6: Examine top features in detail
shap.plots.scatter(shap_values[:, "Feature1"])
shap.plots.scatter(shap_values[:, "Feature2"], color=shap_values[:, "Feature1"])

# Step 7: Explain individual predictions
shap.plots.waterfall(shap_values[0])
```

**Key Decisions**:
- Explainer type based on model architecture
- Background dataset size (for DeepExplainer, KernelExplainer)
- Number of samples to explain (all test set vs. subset)

## Workflow 2: Model Debugging and Validation

**Use Case**: Identifying and fixing model issues, validating expected behavior

```python
# Step 1: Compute SHAP values
explainer = shap.TreeExplainer(model)
shap_values = explainer(X_test)

# Step 2: Identify prediction errors
predictions = model.predict(X_test)
errors = predictions != y_test
error_indices = np.where(errors)[0]

# Step 3: Analyze errors
print(f"Total errors: {len(error_indices)}")
print(f"Error rate: {len(error_indices) / len(y_test):.2%}")

# Step 4: Explain misclassified samples
for idx in error_indices[:10]:  # First 10 errors
    print(f"\n=== Error {idx} ===")
    print(f"Prediction: {predictions[idx]}, Actual: {y_test.iloc[idx]}")
    shap.plots.waterfall(shap_values[idx])

# Step 5: Check if model learned correct patterns
# Look for unexpected feature importance
shap.plots.beeswarm(shap_values)

# Step 6: Investigate specific feature relationships
# Verify nonlinear relationships make sense
for feature in model.feature_importances_.argsort()[-5:]:  # Top 5 features
    feature_name = X_test.columns[feature]
    shap.plots.scatter(shap_values[:, feature_name])

# Step 7: Validate feature interactions
# Check if interactions align with domain knowledge
shap.plots.scatter(shap_values[:, "Feature1"], color=shap_values[:, "Feature2"])
```

**Common Issues to Check**:
- Data leakage (feature with suspiciously high importance)
- Spurious correlations (unexpected feature relationships)
- Target leakage (features that shouldn't be predictive)
- Biases (disproportionate impact on certain groups)

## Workflow 3: Feature Engineering Guidance

**Use Case**: Using SHAP insights to improve feature engineering

```python
# Step 1: Initial model with baseline features
model_v1 = train_model(X_train_v1, y_train)
explainer_v1 = shap.TreeExplainer(model_v1)
shap_values_v1 = explainer_v1(X_test_v1)

# Step 2: Identify feature engineering opportunities
shap.plots.beeswarm(shap_values_v1)

# Check for:
# - Nonlinear relationships (candidates for transformation)
shap.plots.scatter(shap_values_v1[:, "Age"])  # Maybe age^2 or age bins?

# - Feature interactions (candidates for interaction terms)
shap.plots.scatter(shap_values_v1[:, "Income"], color=shap_values_v1[:, "Education"])
# Maybe create Income * Education interaction?

# Step 3: Engineer new features based on insights
X_train_v2 = X_train_v1.copy()
X_train_v2['Age_squared'] = X_train_v2['Age'] ** 2
X_train_v2['Income_Education'] = X_train_v2['Income'] * X_train_v2['Education']

# Step 4: Retrain with engineered features
model_v2 = train_model(X_train_v2, y_train)
explainer_v2 = shap.TreeExplainer(model_v2)
shap_values_v2 = explainer_v2(X_test_v2)

# Step 5: Compare feature importance
shap.plots.bar({
    "Baseline": shap_values_v1,
    "With Engineered Features": shap_values_v2
})

# Step 6: Validate improvement
print(f"V1 Score: {model_v1.score(X_test_v1, y_test):.4f}")
print(f"V2 Score: {model_v2.score(X_test_v2, y_test):.4f}")
```

**Feature Engineering Insights from SHAP**:
- Strong nonlinear patterns → Try transformations (log, sqrt, polynomial)
- Color-coded interactions in scatter → Create interaction terms
- Redundant features in clustering → Remove or combine
- Unexpected importance → Investigate for data quality issues

## Workflow 4: Model Comparison and Selection

**Use Case**: Comparing multiple models to select the best interpretable model

```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
import xgboost as xgb

# Step 1: Train multiple models
models = {
    'Logistic Regression': LogisticRegression(max_iter=1000).fit(X_train, y_train),
    'Random Forest': RandomForestClassifier(n_estimators=100).fit(X_train, y_train),
    'XGBoost': xgb.XGBClassifier(n_estimators=100).fit(X_train, y_train)
}

# Step 2: Compute SHAP values for each model
shap_values_dict = {}
for name, model in models.items():
    if name == 'Logistic Regression':
        explainer = shap.LinearExplainer(model, X_train)
    else:
        explainer = shap.TreeExplainer(model)
    shap_values_dict[name] = explainer(X_test)

# Step 3: Compare global feature importance
shap.plots.bar(shap_values_dict)

# Step 4: Compare model scores
for name, model in models.items():
    score = model.score(X_test, y_test)
    print(f"{name}: {score:.4f}")

# Step 5: Check consistency of feature importance
for feature in X_test.columns[:5]:  # Top 5 features
    fig, axes = plt.subplots(1, 3, figsize=(15, 4))
    for idx, (name, shap_vals) in enumerate(shap_values_dict.items()):
        plt.sca(axes[idx])
        shap.plots.scatter(shap_vals[:, feature], show=False)
        plt.title(f"{name} - {feature}")
    plt.tight_layout()
    plt.show()

# Step 6: Analyze specific predictions across models
sample_idx = 0
for name, shap_vals in shap_values_dict.items():
    print(f"\n=== {name} ===")
    shap.plots.waterfall(shap_vals[sample_idx])

# Step 7: Decision based on:
# - Accuracy/Performance
# - Interpretability (consistent feature importance)
# - Deployment constraints
# - Stakeholder requirements
```

**Model Selection Criteria**:
- **Accuracy vs. Interpretability**: Sometimes simpler models with SHAP are preferable
- **Feature Consistency**: Models agreeing on feature importance are more trustworthy
- **Explanation Quality**: Clear, actionable explanations
- **Computational Cost**: TreeExplainer is faster than KernelExplainer

## Workflow 5: Fairness and Bias Analysis

**Use Case**: Detecting and analyzing model bias across demographic groups

```python
# Step 1: Identify protected attributes
protected_attr = 'Gender'  # or 'Race', 'Age_Group', etc.

# Step 2: Compute SHAP values
explainer = shap.TreeExplainer(model)
shap_values = explainer(X_test)

# Step 3: Compare feature importance across groups
groups = X_test[protected_attr].unique()
cohorts = {
    f"{protected_attr}={group}": shap_values[X_test[protected_attr] == group]
    for group in groups
}
shap.plots.bar(cohorts)

# Step 4: Check if protected attribute has high SHAP importance
# (should be low/zero for fair models)
protected_importance = np.abs(shap_values[:, protected_attr].values).mean()
print(f"{protected_attr} mean |SHAP|: {protected_importance:.4f}")

# Step 5: Analyze predictions for each group
for group in groups:
    mask = X_test[protected_attr] == group
    group_shap = shap_values[mask]

    print(f"\n=== {protected_attr} = {group} ===")
    print(f"Sample size: {mask.sum()}")
    print(f"Positive prediction rate: {(model.predict(X_test[mask]) == 1).mean():.2%}")

    # Visualize
    shap.plots.beeswarm(group_shap, max_display=10)

# Step 6: Check for proxy features
# Features correlated with protected attribute that shouldn't have high importance
# Example: 'Zip_Code' might be proxy for race
proxy_features = ['Zip_Code', 'Last_Name_Prefix']  # Domain-specific
for feature in proxy_features:
    if feature in X_test.columns:
        importance = np.abs(shap_values[:, feature].values).mean()
        print(f"Potential proxy '{feature}' importance: {importance:.4f}")

# Step 7: Mitigation strategies if bias found
# - Remove protected attribute and proxies
# - Add fairness constraints during training
# - Post-process predictions to equalize outcomes
# - Use different model architecture
```

**Fairness Metrics to Check**:
- **Demographic Parity**: Similar positive prediction rates across groups
- **Equal Opportunity**: Similar true positive rates across groups
- **Feature Importance Parity**: Similar feature rankings across groups
- **Protected Attribute Importance**: Should be minimal

## Workflow 6: Deep Learning Model Explanation

**Use Case**: Explaining neural network predictions with DeepExplainer

```python
import tensorflow as tf
import shap

# Step 1: Load or build neural network
model = tf.keras.models.load_model('my_model.h5')

# Step 2: Select background dataset
# Use subset (100-1000 samples) from training data
background = X_train[:100]

# Step 3: Create DeepExplainer
explainer = shap.DeepExplainer(model, background)

# Step 4: Compute SHAP values (may take time)
# Explain subset of test data
test_subset = X_test[:50]
shap_values = explainer.shap_values(test_subset)

# Step 5: Handle multi-output models
# For binary classification, shap_values is a list [class_0_values, class_1_values]
# For regression, it's a single array
if isinstance(shap_values, list):
    # Focus on positive class
    shap_values_positive = shap_values[1]
    shap_exp = shap.Explanation(
        values=shap_values_positive,
        base_values=explainer.expected_value[1],
        data=test_subset
    )
else:
    shap_exp = shap.Explanation(
        values=shap_values,
        base_values=explainer.expected_value,
        data=test_subset
    )

# Step 6: Visualize
shap.plots.beeswarm(shap_exp)
shap.plots.waterfall(shap_exp[0])

# Step 7: For image/text data, use specialized plots
# Image: shap.image_plot
# Text: shap.plots.text (for transformers)
```

**Deep Learning Considerations**:
- Background dataset size affects accuracy and speed
- Multi-output handling (classification vs. regression)
- Specialized plots for image/text data
- Computational cost (consider GPU acceleration)

## Workflow 7: Production Deployment

**Use Case**: Integrating SHAP explanations into production systems

```python
import joblib
import shap

# Step 1: Train and save model
model = train_model(X_train, y_train)
joblib.dump(model, 'model.pkl')

# Step 2: Create and save explainer
explainer = shap.TreeExplainer(model)
joblib.dump(explainer, 'explainer.pkl')

# Step 3: Create explanation service
class ExplanationService:
    def __init__(self, model_path, explainer_path):
        self.model = joblib.load(model_path)
        self.explainer = joblib.load(explainer_path)

    def predict_with_explanation(self, X):
        """
        Returns prediction and explanation
        """
        # Prediction
        prediction = self.model.predict(X)

        # SHAP values
        shap_values = self.explainer(X)

        # Format explanation
        explanations = []
        for i in range(len(X)):
            exp = {
                'prediction': prediction[i],
                'base_value': shap_values.base_values[i],
                'shap_values': dict(zip(X.columns, shap_values.values[i])),
                'feature_values': X.iloc[i].to_dict()
            }
            explanations.append(exp)

        return explanations

    def get_top_features(self, X, n=5):
        """
        Returns top N features for each prediction
        """
        shap_values = self.explainer(X)

        top_features = []
        for i in range(len(X)):
            # Get absolute SHAP values
            abs_shap = np.abs(shap_values.values[i])

            # Sort and get top N
            top_indices = abs_shap.argsort()[-n:][::-1]
            top_feature_names = X.columns[top_indices].tolist()
            top_shap_values = shap_values.values[i][top_indices].tolist()

            top_features.append({
                'features': top_feature_names,
                'shap_values': top_shap_values
            })

        return top_features

# Step 4: Usage in API
service = ExplanationService('model.pkl', 'explainer.pkl')

# Example API endpoint
def predict_endpoint(input_data):
    X = pd.DataFrame([input_data])
    explanations = service.predict_with_explanation(X)
    return {
        'prediction': explanations[0]['prediction'],
        'explanation': explanations[0]
    }

# Step 5: Generate static explanations for batch predictions
def batch_explain_and_save(X_batch, output_dir):
    shap_values = explainer(X_batch)

    # Save global plot
    shap.plots.beeswarm(shap_values, show=False)
    plt.savefig(f'{output_dir}/global_importance.png', dpi=300, bbox_inches='tight')
    plt.close()

    # Save individual explanations
    for i in range(min(100, len(X_batch))):  # First 100
        shap.plots.waterfall(shap_values[i], show=False)
        plt.savefig(f'{output_dir}/explanation_{i}.png', dpi=300, bbox_inches='tight')
        plt.close()
```

**Production Best Practices**:
- Cache explainers to avoid recomputation
- Batch explanations when possible
- Limit explanation complexity (top N features)
- Monitor explanation latency
- Version explainers alongside models
- Consider pre-computing explanations for common inputs

## Workflow 8: Time Series Model Explanation

**Use Case**: Explaining time series forecasting models

```python
# Step 1: Prepare data with time-based features
# Example: Predicting next day's sales
df['DayOfWeek'] = df['Date'].dt.dayofweek
df['Month'] = df['Date'].dt.month
df['Lag_1'] = df['Sales'].shift(1)
df['Lag_7'] = df['Sales'].shift(7)
df['Rolling_Mean_7'] = df['Sales'].rolling(7).mean()

# Step 2: Train model
features = ['DayOfWeek', 'Month', 'Lag_1', 'Lag_7', 'Rolling_Mean_7']
X_train, X_test, y_train, y_test = train_test_split(df[features], df['Sales'])
model = xgb.XGBRegressor().fit(X_train, y_train)

# Step 3: Compute SHAP values
explainer = shap.TreeExplainer(model)
shap_values = explainer(X_test)

# Step 4: Analyze temporal patterns
# Which features drive predictions at different times?
shap.plots.beeswarm(shap_values)

# Step 5: Check lagged feature importance
# Lag features should have high importance for time series
lag_features = ['Lag_1', 'Lag_7', 'Rolling_Mean_7']
for feature in lag_features:
    shap.plots.scatter(shap_values[:, feature])

# Step 6: Explain specific predictions
# E.g., why was Monday's forecast so different?
monday_mask = X_test['DayOfWeek'] == 0
shap.plots.waterfall(shap_values[monday_mask][0])

# Step 7: Validate seasonality understanding
shap.plots.scatter(shap_values[:, 'Month'])
```

**Time Series Considerations**:
- Lagged features and their importance
- Rolling statistics interpretation
- Seasonal patterns in SHAP values
- Avoiding data leakage in feature engineering

## Common Pitfalls and Solutions

### Pitfall 1: Wrong Explainer Choice
**Problem**: Using KernelExplainer for tree models (slow and unnecessary)
**Solution**: Always use TreeExplainer for tree-based models

### Pitfall 2: Insufficient Background Data
**Problem**: DeepExplainer/KernelExplainer with too few background samples
**Solution**: Use 100-1000 representative samples

### Pitfall 3: Misinterpreting Log-Odds
**Problem**: Confusion about units (probability vs. log-odds)
**Solution**: Check model output type; use link="logit" when needed

### Pitfall 4: Ignoring Feature Correlations
**Problem**: Interpreting features as independent when they're correlated
**Solution**: Use feature clustering; understand domain relationships

### Pitfall 5: Overfitting to Explanations
**Problem**: Feature engineering based solely on SHAP without validation
**Solution**: Always validate improvements with cross-validation

### Pitfall 6: Data Leakage Undetected
**Problem**: Not noticing unexpected feature importance indicating leakage
**Solution**: Validate SHAP results against domain knowledge

### Pitfall 7: Computational Constraints Ignored
**Problem**: Computing SHAP for entire large dataset
**Solution**: Use sampling, batching, or subset analysis

## Advanced Techniques

### Technique 1: SHAP Interaction Values
Capture pairwise feature interactions:
```python
explainer = shap.TreeExplainer(model)
shap_interaction_values = explainer.shap_interaction_values(X_test)

# Analyze specific interaction
feature1_idx = 0
feature2_idx = 3
interaction = shap_interaction_values[:, feature1_idx, feature2_idx]
print(f"Interaction strength: {np.abs(interaction).mean():.4f}")
```

### Technique 2: Partial Dependence with SHAP
Combine partial dependence plots with SHAP:
```python
from sklearn.inspection import partial_dependence

# SHAP dependence
shap.plots.scatter(shap_values[:, "Feature1"])

# Partial dependence (model-agnostic)
pd_result = partial_dependence(model, X_test, features=["Feature1"])
plt.plot(pd_result['grid_values'][0], pd_result['average'][0])
```

### Technique 3: Conditional Expectations
Analyze SHAP values conditioned on other features:
```python
# High Income group
high_income = X_test['Income'] > X_test['Income'].median()
shap.plots.beeswarm(shap_values[high_income])

# Low Income group
low_income = X_test['Income'] <= X_test['Income'].median()
shap.plots.beeswarm(shap_values[low_income])
```

### Technique 4: Feature Clustering for Redundancy
```python
# Create hierarchical clustering
clustering = shap.utils.hclust(X_train, y_train)

# Visualize with clustering
shap.plots.bar(shap_values, clustering=clustering, clustering_cutoff=0.5)

# Identify redundant features to remove
# Features with distance < 0.1 are highly redundant
```

## Integration with MLOps

**Experiment Tracking**:
```python
import mlflow

# Log SHAP values
with mlflow.start_run():
    # Train model
    model = train_model(X_train, y_train)

    # Compute SHAP
    explainer = shap.TreeExplainer(model)
    shap_values = explainer(X_test)

    # Log plots
    shap.plots.beeswarm(shap_values, show=False)
    mlflow.log_figure(plt.gcf(), "shap_beeswarm.png")
    plt.close()

    # Log feature importance as metrics
    mean_abs_shap = np.abs(shap_values.values).mean(axis=0)
    for feature, importance in zip(X_test.columns, mean_abs_shap):
        mlflow.log_metric(f"shap_{feature}", importance)
```

**Model Monitoring**:
```python
# Track SHAP distribution drift over time
def compute_shap_summary(shap_values):
    return {
        'mean': shap_values.values.mean(axis=0),
        'std': shap_values.values.std(axis=0),
        'percentiles': np.percentile(shap_values.values, [25, 50, 75], axis=0)
    }

# Compute baseline
baseline_summary = compute_shap_summary(shap_values_train)

# Monitor production data
production_summary = compute_shap_summary(shap_values_production)

# Detect drift
drift_detected = np.abs(
    production_summary['mean'] - baseline_summary['mean']
) > threshold
```

This comprehensive workflows document covers the most common and advanced use cases for SHAP in practice.
