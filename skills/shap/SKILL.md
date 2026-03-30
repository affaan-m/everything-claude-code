---
name: shap
description: Model interpretability and explainability using SHAP (SHapley Additive exPlanations). Use this skill when explaining machine learning model predictions, computing feature importance, generating SHAP plots (waterfall, beeswarm, bar, scatter, force, heatmap), debugging models, analyzing model bias or fairness, comparing models, or implementing explainable AI. Works with tree-based models (XGBoost, LightGBM, Random Forest), deep learning (TensorFlow, PyTorch), linear models, and any black-box model.
license: MIT license
metadata:
    skill-author: K-Dense Inc.
---

# SHAP (SHapley Additive exPlanations)

## Overview

SHAP is a unified approach to explain machine learning model outputs using Shapley values from cooperative game theory. This skill provides comprehensive guidance for:

- Computing SHAP values for any model type
- Creating visualizations to understand feature importance
- Debugging and validating model behavior
- Analyzing fairness and bias
- Implementing explainable AI in production

SHAP works with all model types: tree-based models (XGBoost, LightGBM, CatBoost, Random Forest), deep learning models (TensorFlow, PyTorch, Keras), linear models, and black-box models.

## When to Use This Skill

**Trigger this skill when users ask about**:
- "Explain which features are most important in my model"
- "Generate SHAP plots" (waterfall, beeswarm, bar, scatter, force, heatmap, etc.)
- "Why did my model make this prediction?"
- "Calculate SHAP values for my model"
- "Visualize feature importance using SHAP"
- "Debug my model's behavior" or "validate my model"
- "Check my model for bias" or "analyze fairness"
- "Compare feature importance across models"
- "Implement explainable AI" or "add explanations to my model"
- "Understand feature interactions"
- "Create model interpretation dashboard"

## Quick Start Guide

### Step 1: Select the Right Explainer

**Decision Tree**:

1. **Tree-based model?** (XGBoost, LightGBM, CatBoost, Random Forest, Gradient Boosting)
   - Use `shap.TreeExplainer` (fast, exact)

2. **Deep neural network?** (TensorFlow, PyTorch, Keras, CNNs, RNNs, Transformers)
   - Use `shap.DeepExplainer` or `shap.GradientExplainer`

3. **Linear model?** (Linear/Logistic Regression, GLMs)
   - Use `shap.LinearExplainer` (extremely fast)

4. **Any other model?** (SVMs, custom functions, black-box models)
   - Use `shap.KernelExplainer` (model-agnostic but slower)

5. **Unsure?**
   - Use `shap.Explainer` (automatically selects best algorithm)

**See `references/explainers.md` for detailed information on all explainer types.**

### Step 2: Compute SHAP Values

```python
import shap

# Example with tree-based model (XGBoost)
import xgboost as xgb

# Train model
model = xgb.XGBClassifier().fit(X_train, y_train)

# Create explainer
explainer = shap.TreeExplainer(model)

# Compute SHAP values
shap_values = explainer(X_test)

# The shap_values object contains:
# - values: SHAP values (feature attributions)
# - base_values: Expected model output (baseline)
# - data: Original feature values
```

### Step 3: Visualize Results

**For Global Understanding** (entire dataset):
```python
# Beeswarm plot - shows feature importance with value distributions
shap.plots.beeswarm(shap_values, max_display=15)

# Bar plot - clean summary of feature importance
shap.plots.bar(shap_values)
```

**For Individual Predictions**:
```python
# Waterfall plot - detailed breakdown of single prediction
shap.plots.waterfall(shap_values[0])

# Force plot - additive force visualization
shap.plots.force(shap_values[0])
```

**For Feature Relationships**:
```python
# Scatter plot - feature-prediction relationship
shap.plots.scatter(shap_values[:, "Feature_Name"])

# Colored by another feature to show interactions
shap.plots.scatter(shap_values[:, "Age"], color=shap_values[:, "Education"])
```

**See `references/plots.md` for comprehensive guide on all plot types.**

## Core Workflows

This skill supports several common workflows. Choose the workflow that matches the current task.

### Workflow 1: Basic Model Explanation

**Goal**: Understand what drives model predictions

**Steps**:
1. Train model and create appropriate explainer
2. Compute SHAP values for test set
3. Generate global importance plots (beeswarm or bar)
4. Examine top feature relationships (scatter plots)
5. Explain specific predictions (waterfall plots)

**Example**:
```python
# Step 1-2: Setup
explainer = shap.TreeExplainer(model)
shap_values = explainer(X_test)

# Step 3: Global importance
shap.plots.beeswarm(shap_values)

# Step 4: Feature relationships
shap.plots.scatter(shap_values[:, "Most_Important_Feature"])

# Step 5: Individual explanation
shap.plots.waterfall(shap_values[0])
```

### Workflow 2: Model Debugging

**Goal**: Identify and fix model issues

**Steps**:
1. Compute SHAP values
2. Identify prediction errors
3. Explain misclassified samples
4. Check for unexpected feature importance (data leakage)
5. Validate feature relationships make sense
6. Check feature interactions

**See `references/workflows.md` for detailed debugging workflow.**

### Workflow 3: Feature Engineering

**Goal**: Use SHAP insights to improve features

**Steps**:
1. Compute SHAP values for baseline model
2. Identify nonlinear relationships (candidates for transformation)
3. Identify feature interactions (candidates for interaction terms)
4. Engineer new features
5. Retrain and compare SHAP values
6. Validate improvements

**See `references/workflows.md` for detailed feature engineering workflow.**

### Workflow 4: Model Comparison

**Goal**: Compare multiple models to select best interpretable option

**Steps**:
1. Train multiple models
2. Compute SHAP values for each
3. Compare global feature importance
4. Check consistency of feature rankings
5. Analyze specific predictions across models
6. Select based on accuracy, interpretability, and consistency

**See `references/workflows.md` for detailed model comparison workflow.**

### Workflow 5: Fairness and Bias Analysis

**Goal**: Detect and analyze model bias across demographic groups

**Steps**:
1. Identify protected attributes (gender, race, age, etc.)
2. Compute SHAP values
3. Compare feature importance across groups
4. Check protected attribute SHAP importance
5. Identify proxy features
6. Implement mitigation strategies if bias found

**See `references/workflows.md` for detailed fairness analysis workflow.**

### Workflow 6: Production Deployment

**Goal**: Integrate SHAP explanations into production systems

**Steps**:
1. Train and save model
2. Create and save explainer
3. Build explanation service
4. Create API endpoints for predictions with explanations
5. Implement caching and optimization
6. Monitor explanation quality

**See `references/workflows.md` for detailed production deployment workflow.**

## Key Concepts

### SHAP Values

**Definition**: SHAP values quantify each feature's contribution to a prediction, measured as the deviation from the expected model output (baseline).

**Properties**:
- **Additivity**: SHAP values sum to difference between prediction and baseline
- **Fairness**: Based on Shapley values from game theory
- **Consistency**: If a feature becomes more important, its SHAP value increases

**Interpretation**:
- Positive SHAP value → Feature pushes prediction higher
- Negative SHAP value → Feature pushes prediction lower
- Magnitude → Strength of feature's impact
- Sum of SHAP values → Total prediction change from baseline

**Example**:
```
Baseline (expected value): 0.30
Feature contributions (SHAP values):
  Age: +0.15
  Income: +0.10
  Education: -0.05
Final prediction: 0.30 + 0.15 + 0.10 - 0.05 = 0.50
```

### Background Data / Baseline

**Purpose**: Represents "typical" input to establish baseline expectations

**Selection**:
- Random sample from training data (50-1000 samples)
- Or use kmeans to select representative samples
- For DeepExplainer/KernelExplainer: 100-1000 samples balances accuracy and speed

**Impact**: Baseline affects SHAP value magnitudes but not relative importance

### Model Output Types

**Critical Consideration**: Understand what your model outputs

- **Raw output**: For regression or tree margins
- **Probability**: For classification probability
- **Log-odds**: For logistic regression (before sigmoid)

**Example**: XGBoost classifiers explain margin output (log-odds) by default. To explain probabilities, use `model_output="probability"` in TreeExplainer.

## Common Patterns

### Pattern 1: Complete Model Analysis

```python
# 1. Setup
explainer = shap.TreeExplainer(model)
shap_values = explainer(X_test)

# 2. Global importance
shap.plots.beeswarm(shap_values)
shap.plots.bar(shap_values)

# 3. Top feature relationships
top_features = X_test.columns[np.abs(shap_values.values).mean(0).argsort()[-5:]]
for feature in top_features:
    shap.plots.scatter(shap_values[:, feature])

# 4. Example predictions
for i in range(5):
    shap.plots.waterfall(shap_values[i])
```

### Pattern 2: Cohort Comparison

```python
# Define cohorts
cohort1_mask = X_test['Group'] == 'A'
cohort2_mask = X_test['Group'] == 'B'

# Compare feature importance
shap.plots.bar({
    "Group A": shap_values[cohort1_mask],
    "Group B": shap_values[cohort2_mask]
})
```

### Pattern 3: Debugging Errors

```python
# Find errors
errors = model.predict(X_test) != y_test
error_indices = np.where(errors)[0]

# Explain errors
for idx in error_indices[:5]:
    print(f"Sample {idx}:")
    shap.plots.waterfall(shap_values[idx])

    # Investigate key features
    shap.plots.scatter(shap_values[:, "Suspicious_Feature"])
```

## Performance Optimization

### Speed Considerations

**Explainer Speed** (fastest to slowest):
1. `LinearExplainer` - Nearly instantaneous
2. `TreeExplainer` - Very fast
3. `DeepExplainer` - Fast for neural networks
4. `GradientExplainer` - Fast for neural networks
5. `KernelExplainer` - Slow (use only when necessary)
6. `PermutationExplainer` - Very slow but accurate

### Optimization Strategies

**For Large Datasets**:
```python
# Compute SHAP for subset
shap_values = explainer(X_test[:1000])

# Or use batching
batch_size = 100
all_shap_values = []
for i in range(0, len(X_test), batch_size):
    batch_shap = explainer(X_test[i:i+batch_size])
    all_shap_values.append(batch_shap)
```

**For Visualizations**:
```python
# Sample subset for plots
shap.plots.beeswarm(shap_values[:1000])

# Adjust transparency for dense plots
shap.plots.scatter(shap_values[:, "Feature"], alpha=0.3)
```

**For Production**:
```python
# Cache explainer
import joblib
joblib.dump(explainer, 'explainer.pkl')
explainer = joblib.load('explainer.pkl')

# Pre-compute for batch predictions
# Only compute top N features for API responses
```

## Troubleshooting

### Issue: Wrong explainer choice
**Problem**: Using KernelExplainer for tree models (slow and unnecessary)
**Solution**: Always use TreeExplainer for tree-based models

### Issue: Insufficient background data
**Problem**: DeepExplainer/KernelExplainer with too few background samples
**Solution**: Use 100-1000 representative samples

### Issue: Confusing units
**Problem**: Interpreting log-odds as probabilities
**Solution**: Check model output type; understand whether values are probabilities, log-odds, or raw outputs

### Issue: Plots don't display
**Problem**: Matplotlib backend issues
**Solution**: Ensure backend is set correctly; use `plt.show()` if needed

### Issue: Too many features cluttering plots
**Problem**: Default max_display=10 may be too many or too few
**Solution**: Adjust `max_display` parameter or use feature clustering

### Issue: Slow computation
**Problem**: Computing SHAP for very large datasets
**Solution**: Sample subset, use batching, or ensure using specialized explainer (not KernelExplainer)

## Integration with Other Tools

### Jupyter Notebooks
- Interactive force plots work seamlessly
- Inline plot display with `show=True` (default)
- Combine with markdown for narrative explanations

### MLflow / Experiment Tracking
```python
import mlflow

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

    # Log feature importance metrics
    mean_abs_shap = np.abs(shap_values.values).mean(axis=0)
    for feature, importance in zip(X_test.columns, mean_abs_shap):
        mlflow.log_metric(f"shap_{feature}", importance)
```

### Production APIs
```python
class ExplanationService:
    def __init__(self, model_path, explainer_path):
        self.model = joblib.load(model_path)
        self.explainer = joblib.load(explainer_path)

    def predict_with_explanation(self, X):
        prediction = self.model.predict(X)
        shap_values = self.explainer(X)

        return {
            'prediction': prediction[0],
            'base_value': shap_values.base_values[0],
            'feature_contributions': dict(zip(X.columns, shap_values.values[0]))
        }
```

## Reference Documentation

This skill includes comprehensive reference documentation organized by topic:

### references/explainers.md
Complete guide to all explainer classes:
- `TreeExplainer` - Fast, exact explanations for tree-based models
- `DeepExplainer` - Deep learning models (TensorFlow, PyTorch)
- `KernelExplainer` - Model-agnostic (works with any model)
- `LinearExplainer` - Fast explanations for linear models
- `GradientExplainer` - Gradient-based for neural networks
- `PermutationExplainer` - Exact but slow for any model

Includes: Constructor parameters, methods, supported models, when to use, examples, performance considerations.

### references/plots.md
Comprehensive visualization guide:
- **Waterfall plots** - Individual prediction breakdowns
- **Beeswarm plots** - Global importance with value distributions
- **Bar plots** - Clean feature importance summaries
- **Scatter plots** - Feature-prediction relationships and interactions
- **Force plots** - Interactive additive force visualizations
- **Heatmap plots** - Multi-sample comparison grids
- **Violin plots** - Distribution-focused alternatives
- **Decision plots** - Multiclass prediction paths

Includes: Parameters, use cases, examples, best practices, plot selection guide.

### references/workflows.md
Detailed workflows and best practices:
- Basic model explanation workflow
- Model debugging and validation
- Feature engineering guidance
- Model comparison and selection
- Fairness and bias analysis
- Deep learning model explanation
- Production deployment
- Time series model explanation
- Common pitfalls and solutions
- Advanced techniques
- MLOps integration

Includes: Step-by-step instructions, code examples, decision criteria, troubleshooting.

### references/theory.md
Theoretical foundations:
- Shapley values from game theory
- Mathematical formulas and properties
- Connection to other explanation methods (LIME, DeepLIFT, etc.)
- SHAP computation algorithms (Tree SHAP, Kernel SHAP, etc.)
- Conditional expectations and baseline selection
- Interpreting SHAP values
- Interaction values
- Theoretical limitations and considerations

Includes: Mathematical foundations, proofs, comparisons, advanced topics.

## Usage Guidelines

**When to load reference files**:
- Load `explainers.md` when user needs detailed information about specific explainer types or parameters
- Load `plots.md` when user needs detailed visualization guidance or exploring plot options
- Load `workflows.md` when user has complex multi-step tasks (debugging, fairness analysis, production deployment)
- Load `theory.md` when user asks about theoretical foundations, Shapley values, or mathematical details

**Default approach** (without loading references):
- Use this SKILL.md for basic explanations and quick start
- Provide standard workflows and common patterns
- Reference files are available if more detail is needed

**Loading references**:
```python
# To load reference files, use the Read tool with appropriate file path:
# /path/to/shap/references/explainers.md
# /path/to/shap/references/plots.md
# /path/to/shap/references/workflows.md
# /path/to/shap/references/theory.md
```

## Best Practices Summary

1. **Choose the right explainer**: Use specialized explainers (TreeExplainer, DeepExplainer, LinearExplainer) when possible; avoid KernelExplainer unless necessary

2. **Start global, then go local**: Begin with beeswarm/bar plots for overall understanding, then dive into waterfall/scatter plots for details

3. **Use multiple visualizations**: Different plots reveal different insights; combine global (beeswarm) + local (waterfall) + relationship (scatter) views

4. **Select appropriate background data**: Use 50-1000 representative samples from training data

5. **Understand model output units**: Know whether explaining probabilities, log-odds, or raw outputs

6. **Validate with domain knowledge**: SHAP shows model behavior; use domain expertise to interpret and validate

7. **Optimize for performance**: Sample subsets for visualization, batch for large datasets, cache explainers in production

8. **Check for data leakage**: Unexpectedly high feature importance may indicate data quality issues

9. **Consider feature correlations**: Use TreeExplainer's correlation-aware options or feature clustering for redundant features

10. **Remember SHAP shows association, not causation**: Use domain knowledge for causal interpretation

## Installation

```bash
# Basic installation
uv pip install shap

# With visualization dependencies
uv pip install shap matplotlib

# Latest version
uv pip install -U shap
```

**Dependencies**: numpy, pandas, scikit-learn, matplotlib, scipy

**Optional**: xgboost, lightgbm, tensorflow, torch (depending on model types)

## Additional Resources

- **Official Documentation**: https://shap.readthedocs.io/
- **GitHub Repository**: https://github.com/slundberg/shap
- **Original Paper**: Lundberg & Lee (2017) - "A Unified Approach to Interpreting Model Predictions"
- **Nature MI Paper**: Lundberg et al. (2020) - "From local explanations to global understanding with explainable AI for trees"

This skill provides comprehensive coverage of SHAP for model interpretability across all use cases and model types.

