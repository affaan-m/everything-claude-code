# SHAP Visualization Reference

This document provides comprehensive information about all SHAP plotting functions, their parameters, use cases, and best practices for visualizing model explanations.

## Overview

SHAP provides diverse visualization tools for explaining model predictions at both individual and global levels. Each plot type serves specific purposes in understanding feature importance, interactions, and prediction mechanisms.

## Plot Types

### Waterfall Plots

**Purpose**: Display explanations for individual predictions, showing how each feature moves the prediction from the baseline (expected value) toward the final prediction.

**Function**: `shap.plots.waterfall(explanation, max_display=10, show=True)`

**Key Parameters**:
- `explanation`: Single row from an Explanation object (not multiple samples)
- `max_display`: Number of features to show (default: 10); less impactful features collapse into a single "other features" term
- `show`: Whether to display the plot immediately

**Visual Elements**:
- **X-axis**: Shows SHAP values (contribution to prediction)
- **Starting point**: Model's expected value (baseline)
- **Feature contributions**: Red bars (positive) or blue bars (negative) showing how each feature moves the prediction
- **Feature values**: Displayed in gray to the left of feature names
- **Ending point**: Final model prediction

**When to Use**:
- Explaining individual predictions in detail
- Understanding which features drove a specific decision
- Communicating model behavior for single instances (e.g., loan denial, diagnosis)
- Debugging unexpected predictions

**Important Notes**:
- For XGBoost classifiers, predictions are explained in log-odds units (margin output before logistic transformation)
- SHAP values sum to the difference between baseline and final prediction (additivity property)
- Use scatter plots alongside waterfall plots to explore patterns across multiple samples

**Example**:
```python
import shap

# Compute SHAP values
explainer = shap.TreeExplainer(model)
shap_values = explainer(X_test)

# Plot waterfall for first prediction
shap.plots.waterfall(shap_values[0])

# Show more features
shap.plots.waterfall(shap_values[0], max_display=20)
```

### Beeswarm Plots

**Purpose**: Information-dense summary of how top features impact model output across the entire dataset, combining feature importance with value distributions.

**Function**: `shap.plots.beeswarm(shap_values, max_display=10, order=Explanation.abs.mean(0), color=None, show=True)`

**Key Parameters**:
- `shap_values`: Explanation object containing multiple samples
- `max_display`: Number of features to display (default: 10)
- `order`: How to rank features
  - `Explanation.abs.mean(0)`: Mean absolute SHAP values (default)
  - `Explanation.abs.max(0)`: Maximum absolute values (highlights outlier impacts)
- `color`: matplotlib colormap; defaults to red-blue scheme
- `show`: Whether to display the plot immediately

**Visual Elements**:
- **Y-axis**: Features ranked by importance
- **X-axis**: SHAP value (impact on model output)
- **Each dot**: Single instance from dataset
- **Dot position (X)**: SHAP value magnitude
- **Dot color**: Original feature value (red = high, blue = low)
- **Dot clustering**: Shows density/distribution of impacts

**When to Use**:
- Summarizing feature importance across entire datasets
- Understanding both average and individual feature impacts
- Identifying feature value patterns and their effects
- Comparing global model behavior across features
- Detecting nonlinear relationships (e.g., higher age → lower income likelihood)

**Practical Variations**:
```python
# Standard beeswarm plot
shap.plots.beeswarm(shap_values)

# Show more features
shap.plots.beeswarm(shap_values, max_display=20)

# Order by maximum absolute values (highlight outliers)
shap.plots.beeswarm(shap_values, order=shap_values.abs.max(0))

# Plot absolute SHAP values with fixed coloring
shap.plots.beeswarm(shap_values.abs, color="shap_red")

# Custom matplotlib colormap
shap.plots.beeswarm(shap_values, color=plt.cm.viridis)
```

### Bar Plots

**Purpose**: Display feature importance as mean absolute SHAP values, providing clean, simple visualizations of global feature impact.

**Function**: `shap.plots.bar(shap_values, max_display=10, clustering=None, clustering_cutoff=0.5, show=True)`

**Key Parameters**:
- `shap_values`: Explanation object (can be single instance, global, or cohorts)
- `max_display`: Maximum number of features/bars to show
- `clustering`: Optional hierarchical clustering object from `shap.utils.hclust`
- `clustering_cutoff`: Threshold for displaying clustering structure (0-1, default: 0.5)

**Plot Types**:

#### Global Bar Plot
Shows overall feature importance across all samples. Importance calculated as mean absolute SHAP value.

```python
# Global feature importance
explainer = shap.TreeExplainer(model)
shap_values = explainer(X_test)
shap.plots.bar(shap_values)
```

#### Local Bar Plot
Displays SHAP values for a single instance with feature values shown in gray.

```python
# Single prediction explanation
shap.plots.bar(shap_values[0])
```

#### Cohort Bar Plot
Compares feature importance across subgroups by passing a dictionary of Explanation objects.

```python
# Compare cohorts
cohorts = {
    "Group A": shap_values[mask_A],
    "Group B": shap_values[mask_B]
}
shap.plots.bar(cohorts)
```

**Feature Clustering**:
Identifies redundant features using model-based clustering (more accurate than correlation-based methods).

```python
# Add feature clustering
clustering = shap.utils.hclust(X_train, y_train)
shap.plots.bar(shap_values, clustering=clustering)

# Adjust clustering display threshold
shap.plots.bar(shap_values, clustering=clustering, clustering_cutoff=0.3)
```

**When to Use**:
- Quick overview of global feature importance
- Comparing feature importance across cohorts or models
- Identifying redundant or correlated features
- Clean, simple visualizations for presentations

### Force Plots

**Purpose**: Additive force visualization showing how features push prediction higher (red) or lower (blue) from baseline.

**Function**: `shap.plots.force(base_value, shap_values, features, feature_names=None, out_names=None, link="identity", matplotlib=False, show=True)`

**Key Parameters**:
- `base_value`: Expected value (baseline prediction)
- `shap_values`: SHAP values for sample(s)
- `features`: Feature values for sample(s)
- `feature_names`: Optional feature names
- `link`: Transform function ("identity" or "logit")
- `matplotlib`: Use matplotlib backend (default: interactive JavaScript)

**Visual Elements**:
- **Baseline**: Starting prediction (expected value)
- **Red arrows**: Features pushing prediction higher
- **Blue arrows**: Features pushing prediction lower
- **Final value**: Resulting prediction

**Interactive Features** (JavaScript mode):
- Hover for detailed feature information
- Multiple samples create stacked visualization
- Can rotate for different perspectives

**When to Use**:
- Interactive exploration of predictions
- Visualizing multiple predictions simultaneously
- Presentations requiring interactive elements
- Understanding prediction composition at a glance

**Example**:
```python
# Single prediction force plot
shap.plots.force(
    shap_values.base_values[0],
    shap_values.values[0],
    X_test.iloc[0],
    matplotlib=True
)

# Multiple predictions (interactive)
shap.plots.force(
    shap_values.base_values,
    shap_values.values,
    X_test
)
```

### Scatter Plots (Dependence Plots)

**Purpose**: Show relationship between feature values and their SHAP values, revealing how feature values impact predictions.

**Function**: `shap.plots.scatter(shap_values, color=None, hist=True, alpha=1, show=True)`

**Key Parameters**:
- `shap_values`: Explanation object, can specify feature with subscript (e.g., `shap_values[:, "Age"]`)
- `color`: Feature to use for coloring points (string name or Explanation object)
- `hist`: Show histogram of feature values on y-axis
- `alpha`: Point transparency (useful for dense plots)

**Visual Elements**:
- **X-axis**: Feature value
- **Y-axis**: SHAP value (impact on prediction)
- **Point color**: Another feature's value (for interaction detection)
- **Histogram**: Distribution of feature values

**When to Use**:
- Understanding feature-prediction relationships
- Detecting nonlinear effects
- Identifying feature interactions
- Validating or discovering patterns in model behavior
- Exploring counterintuitive predictions from waterfall plots

**Interaction Detection**:
Color points by another feature to reveal interactions.

```python
# Basic dependence plot
shap.plots.scatter(shap_values[:, "Age"])

# Color by another feature to show interactions
shap.plots.scatter(shap_values[:, "Age"], color=shap_values[:, "Education"])

# Multiple features in one plot
shap.plots.scatter(shap_values[:, ["Age", "Education", "Hours-per-week"]])

# Increase transparency for dense data
shap.plots.scatter(shap_values[:, "Age"], alpha=0.5)
```

### Heatmap Plots

**Purpose**: Visualize SHAP values for multiple samples simultaneously, showing feature impacts across instances.

**Function**: `shap.plots.heatmap(shap_values, instance_order=None, feature_values=None, max_display=10, show=True)`

**Key Parameters**:
- `shap_values`: Explanation object
- `instance_order`: How to order instances (can be Explanation object for custom ordering)
- `feature_values`: Display feature values on hover
- `max_display`: Maximum features to display

**Visual Elements**:
- **Rows**: Individual instances/samples
- **Columns**: Features
- **Cell color**: SHAP value (red = positive, blue = negative)
- **Intensity**: Magnitude of impact

**When to Use**:
- Comparing explanations across multiple instances
- Identifying patterns in feature impacts
- Understanding which features vary most across predictions
- Detecting subgroups or clusters with similar explanation patterns

**Example**:
```python
# Basic heatmap
shap.plots.heatmap(shap_values)

# Order instances by model output
shap.plots.heatmap(shap_values, instance_order=shap_values.sum(1))

# Show specific subset
shap.plots.heatmap(shap_values[:100])
```

### Violin Plots

**Purpose**: Similar to beeswarm plots but uses violin (kernel density) visualization instead of individual dots.

**Function**: `shap.plots.violin(shap_values, features=None, feature_names=None, max_display=10, show=True)`

**When to Use**:
- Alternative to beeswarm when dataset is very large
- Emphasizing distribution density over individual points
- Cleaner visualization for presentations

**Example**:
```python
shap.plots.violin(shap_values)
```

### Decision Plots

**Purpose**: Show prediction paths through cumulative SHAP values, particularly useful for multiclass classification.

**Function**: `shap.plots.decision(base_value, shap_values, features, feature_names=None, feature_order="importance", highlight=None, link="identity", show=True)`

**Key Parameters**:
- `base_value`: Expected value
- `shap_values`: SHAP values for samples
- `features`: Feature values
- `feature_order`: How to order features ("importance" or list)
- `highlight`: Indices of samples to highlight
- `link`: Transform function

**When to Use**:
- Multiclass classification explanations
- Understanding cumulative feature effects
- Comparing prediction paths across samples
- Identifying where predictions diverge

**Example**:
```python
# Decision plot for multiple predictions
shap.plots.decision(
    shap_values.base_values,
    shap_values.values,
    X_test,
    feature_names=X_test.columns.tolist()
)

# Highlight specific instances
shap.plots.decision(
    shap_values.base_values,
    shap_values.values,
    X_test,
    highlight=[0, 5, 10]
)
```

## Plot Selection Guide

**For Individual Predictions**:
- **Waterfall**: Best for detailed, sequential explanation
- **Force**: Good for interactive exploration
- **Bar (local)**: Simple, clean single-prediction importance

**For Global Understanding**:
- **Beeswarm**: Information-dense summary with value distributions
- **Bar (global)**: Clean, simple importance ranking
- **Violin**: Distribution-focused alternative to beeswarm

**For Feature Relationships**:
- **Scatter**: Understand feature-prediction relationships and interactions
- **Heatmap**: Compare patterns across multiple instances

**For Multiple Samples**:
- **Heatmap**: Grid view of SHAP values
- **Force (stacked)**: Interactive multi-sample visualization
- **Decision**: Prediction paths for multiclass problems

**For Cohort Comparison**:
- **Bar (cohort)**: Clean comparison of feature importance
- **Multiple beeswarms**: Side-by-side distribution comparisons

## Visualization Best Practices

**1. Start Global, Then Go Local**:
- Begin with beeswarm or bar plot to understand global patterns
- Dive into waterfall or scatter plots for specific instances or features

**2. Use Multiple Plot Types**:
- Different plots reveal different insights
- Combine waterfall (individual) + scatter (relationship) + beeswarm (global)

**3. Adjust max_display**:
- Default (10) is good for presentations
- Increase (20-30) for detailed analysis
- Consider clustering for redundant features

**4. Color Meaningfully**:
- Use default red-blue for SHAP values (red = positive, blue = negative)
- Color scatter plots by interacting features
- Custom colormaps for specific domains

**5. Consider Audience**:
- Technical audience: Beeswarm, scatter, heatmap
- Non-technical audience: Waterfall, bar, force plots
- Interactive presentations: Force plots with JavaScript

**6. Save High-Quality Figures**:
```python
import matplotlib.pyplot as plt

# Create plot
shap.plots.beeswarm(shap_values, show=False)

# Save with high DPI
plt.savefig('shap_plot.png', dpi=300, bbox_inches='tight')
plt.close()
```

**7. Handle Large Datasets**:
- Sample subset for visualization (e.g., `shap_values[:1000]`)
- Use violin instead of beeswarm for very large datasets
- Adjust alpha for scatter plots with many points

## Common Patterns and Workflows

**Pattern 1: Complete Model Explanation**
```python
# 1. Global importance
shap.plots.beeswarm(shap_values)

# 2. Top feature relationships
for feature in top_features:
    shap.plots.scatter(shap_values[:, feature])

# 3. Example predictions
for i in interesting_indices:
    shap.plots.waterfall(shap_values[i])
```

**Pattern 2: Model Comparison**
```python
# Compute SHAP for multiple models
shap_model1 = explainer1(X_test)
shap_model2 = explainer2(X_test)

# Compare feature importance
shap.plots.bar({
    "Model 1": shap_model1,
    "Model 2": shap_model2
})
```

**Pattern 3: Subgroup Analysis**
```python
# Define cohorts
male_mask = X_test['Sex'] == 'Male'
female_mask = X_test['Sex'] == 'Female'

# Compare cohorts
shap.plots.bar({
    "Male": shap_values[male_mask],
    "Female": shap_values[female_mask]
})

# Separate beeswarm plots
shap.plots.beeswarm(shap_values[male_mask])
shap.plots.beeswarm(shap_values[female_mask])
```

**Pattern 4: Debugging Predictions**
```python
# Identify outliers or errors
errors = (model.predict(X_test) != y_test)
error_indices = np.where(errors)[0]

# Explain errors
for idx in error_indices[:5]:
    print(f"Sample {idx}:")
    shap.plots.waterfall(shap_values[idx])

    # Explore key features
    shap.plots.scatter(shap_values[:, "Key_Feature"])
```

## Integration with Notebooks and Reports

**Jupyter Notebooks**:
- Interactive force plots work seamlessly
- Use `show=True` (default) for inline display
- Combine with markdown explanations

**Static Reports**:
- Use matplotlib backend for force plots
- Save figures programmatically
- Prefer waterfall and bar plots for clarity

**Web Applications**:
- Export force plots as HTML
- Use shap.save_html() for interactive visualizations
- Consider generating plots on-demand

## Troubleshooting Visualizations

**Issue**: Plots don't display
- **Solution**: Ensure matplotlib backend is set correctly; use `plt.show()` if needed

**Issue**: Too many features cluttering plot
- **Solution**: Reduce `max_display` parameter or use feature clustering

**Issue**: Colors reversed or confusing
- **Solution**: Check model output type (probability vs. log-odds) and use appropriate link function

**Issue**: Slow plotting with large datasets
- **Solution**: Sample subset of data; use `shap_values[:1000]` for visualization

**Issue**: Feature names missing
- **Solution**: Ensure feature_names are in Explanation object or pass explicitly to plot functions
