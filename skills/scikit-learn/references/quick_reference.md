# Scikit-learn Quick Reference

## Common Import Patterns

```python
# Core scikit-learn
import sklearn

# Data splitting and cross-validation
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV

# Preprocessing
from sklearn.preprocessing import StandardScaler, MinMaxScaler, OneHotEncoder
from sklearn.impute import SimpleImputer

# Feature selection
from sklearn.feature_selection import SelectKBest, RFE

# Supervised learning
from sklearn.linear_model import LogisticRegression, Ridge, Lasso
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.svm import SVC, SVR
from sklearn.tree import DecisionTreeClassifier

# Unsupervised learning
from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering
from sklearn.decomposition import PCA, NMF

# Metrics
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    mean_squared_error, r2_score, confusion_matrix, classification_report
)

# Pipeline
from sklearn.pipeline import Pipeline, make_pipeline
from sklearn.compose import ColumnTransformer, make_column_transformer

# Utilities
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
```

## Installation

```bash
# Using uv (recommended)
uv pip install scikit-learn

# Optional dependencies
uv pip install scikit-learn[plots]  # For plotting utilities
uv pip install pandas numpy matplotlib seaborn  # Common companions
```

## Quick Workflow Templates

### Classification Pipeline

```python
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

# Preprocess
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train_scaled, y_train)

# Evaluate
y_pred = model.predict(X_test_scaled)
print(classification_report(y_test, y_pred))
print(confusion_matrix(y_test, y_pred))
```

### Regression Pipeline

```python
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_squared_error, r2_score

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Preprocess and train
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

model = GradientBoostingRegressor(n_estimators=100, random_state=42)
model.fit(X_train_scaled, y_train)

# Evaluate
y_pred = model.predict(X_test_scaled)
print(f"RMSE: {mean_squared_error(y_test, y_pred, squared=False):.3f}")
print(f"R² Score: {r2_score(y_test, y_pred):.3f}")
```

### Cross-Validation

```python
from sklearn.model_selection import cross_val_score
from sklearn.ensemble import RandomForestClassifier

model = RandomForestClassifier(n_estimators=100, random_state=42)
scores = cross_val_score(model, X, y, cv=5, scoring='accuracy')
print(f"CV Accuracy: {scores.mean():.3f} (+/- {scores.std() * 2:.3f})")
```

### Complete Pipeline with Mixed Data Types

```python
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier

# Define feature types
numeric_features = ['age', 'income']
categorical_features = ['gender', 'occupation']

# Create preprocessing pipelines
numeric_transformer = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler())
])

categorical_transformer = Pipeline([
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('onehot', OneHotEncoder(handle_unknown='ignore'))
])

# Combine transformers
preprocessor = ColumnTransformer([
    ('num', numeric_transformer, numeric_features),
    ('cat', categorical_transformer, categorical_features)
])

# Full pipeline
model = Pipeline([
    ('preprocessor', preprocessor),
    ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
])

# Fit and predict
model.fit(X_train, y_train)
y_pred = model.predict(X_test)
```

### Hyperparameter Tuning

```python
from sklearn.model_selection import GridSearchCV
from sklearn.ensemble import RandomForestClassifier

param_grid = {
    'n_estimators': [100, 200, 300],
    'max_depth': [10, 20, None],
    'min_samples_split': [2, 5, 10]
}

model = RandomForestClassifier(random_state=42)
grid_search = GridSearchCV(
    model, param_grid, cv=5, scoring='accuracy', n_jobs=-1
)

grid_search.fit(X_train, y_train)
print(f"Best params: {grid_search.best_params_}")
print(f"Best score: {grid_search.best_score_:.3f}")

# Use best model
best_model = grid_search.best_estimator_
```

## Common Patterns

### Loading Data

```python
# From scikit-learn datasets
from sklearn.datasets import load_iris, load_digits, make_classification

# Built-in datasets
iris = load_iris()
X, y = iris.data, iris.target

# Synthetic data
X, y = make_classification(
    n_samples=1000, n_features=20, n_classes=2, random_state=42
)

# From pandas
import pandas as pd
df = pd.read_csv('data.csv')
X = df.drop('target', axis=1)
y = df['target']
```

### Handling Imbalanced Data

```python
from sklearn.ensemble import RandomForestClassifier

# Use class_weight parameter
model = RandomForestClassifier(class_weight='balanced', random_state=42)
model.fit(X_train, y_train)

# Or use appropriate metrics
from sklearn.metrics import balanced_accuracy_score, f1_score
print(f"Balanced Accuracy: {balanced_accuracy_score(y_test, y_pred):.3f}")
print(f"F1 Score: {f1_score(y_test, y_pred):.3f}")
```

### Feature Importance

```python
from sklearn.ensemble import RandomForestClassifier
import pandas as pd

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Get feature importances
importances = pd.DataFrame({
    'feature': feature_names,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)

print(importances.head(10))
```

### Clustering

```python
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

# Scale data first
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Fit K-Means
kmeans = KMeans(n_clusters=3, random_state=42)
labels = kmeans.fit_predict(X_scaled)

# Evaluate
from sklearn.metrics import silhouette_score
score = silhouette_score(X_scaled, labels)
print(f"Silhouette Score: {score:.3f}")
```

### Dimensionality Reduction

```python
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt

# Fit PCA
pca = PCA(n_components=2)
X_reduced = pca.fit_transform(X)

# Plot
plt.scatter(X_reduced[:, 0], X_reduced[:, 1], c=y, cmap='viridis')
plt.xlabel('PC1')
plt.ylabel('PC2')
plt.title(f'PCA (explained variance: {pca.explained_variance_ratio_.sum():.2%})')
```

### Model Persistence

```python
import joblib

# Save model
joblib.dump(model, 'model.pkl')

# Load model
loaded_model = joblib.load('model.pkl')
predictions = loaded_model.predict(X_new)
```

## Common Gotchas and Solutions

### Data Leakage
```python
# WRONG: Fitting scaler on all data
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
X_train, X_test = train_test_split(X_scaled)

# RIGHT: Fit on training data only
X_train, X_test = train_test_split(X)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# BEST: Use Pipeline
from sklearn.pipeline import Pipeline
pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('model', LogisticRegression())
])
pipeline.fit(X_train, y_train)  # No leakage!
```

### Stratified Splitting for Classification
```python
# Always use stratify for classification
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)
```

### Random State for Reproducibility
```python
# Set random_state for reproducibility
model = RandomForestClassifier(n_estimators=100, random_state=42)
```

### Handling Unknown Categories
```python
# Use handle_unknown='ignore' for OneHotEncoder
encoder = OneHotEncoder(handle_unknown='ignore')
```

### Feature Names with Pipelines
```python
# Get feature names after transformation
preprocessor.fit(X_train)
feature_names = preprocessor.get_feature_names_out()
```

## Cheat Sheet: Algorithm Selection

### Classification

| Problem | Algorithm | When to Use |
|---------|-----------|-------------|
| Binary/Multiclass | Logistic Regression | Fast baseline, interpretability |
| Binary/Multiclass | Random Forest | Good default, robust |
| Binary/Multiclass | Gradient Boosting | Best accuracy, willing to tune |
| Binary/Multiclass | SVM | Small data, complex boundaries |
| Binary/Multiclass | Naive Bayes | Text classification, fast |
| High dimensions | Linear SVM or Logistic | Text, many features |

### Regression

| Problem | Algorithm | When to Use |
|---------|-----------|-------------|
| Continuous target | Linear Regression | Fast baseline, interpretability |
| Continuous target | Ridge/Lasso | Regularization needed |
| Continuous target | Random Forest | Good default, non-linear |
| Continuous target | Gradient Boosting | Best accuracy |
| Continuous target | SVR | Small data, non-linear |

### Clustering

| Problem | Algorithm | When to Use |
|---------|-----------|-------------|
| Known K, spherical | K-Means | Fast, simple |
| Unknown K, arbitrary shapes | DBSCAN | Noise/outliers present |
| Hierarchical structure | Agglomerative | Need dendrogram |
| Soft clustering | Gaussian Mixture | Probability estimates |

### Dimensionality Reduction

| Problem | Algorithm | When to Use |
|---------|-----------|-------------|
| Linear reduction | PCA | Variance explanation |
| Visualization | t-SNE | 2D/3D plots |
| Non-negative data | NMF | Images, text |
| Sparse data | TruncatedSVD | Text, recommender systems |

## Performance Tips

### Speed Up Training
```python
# Use n_jobs=-1 for parallel processing
model = RandomForestClassifier(n_estimators=100, n_jobs=-1)

# Use warm_start for incremental learning
model = RandomForestClassifier(n_estimators=100, warm_start=True)
model.fit(X, y)
model.n_estimators += 50
model.fit(X, y)  # Adds 50 more trees

# Use partial_fit for online learning
from sklearn.linear_model import SGDClassifier
model = SGDClassifier()
for X_batch, y_batch in batches:
    model.partial_fit(X_batch, y_batch, classes=np.unique(y))
```

### Memory Efficiency
```python
# Use sparse matrices
from scipy.sparse import csr_matrix
X_sparse = csr_matrix(X)

# Use MiniBatchKMeans for large data
from sklearn.cluster import MiniBatchKMeans
model = MiniBatchKMeans(n_clusters=8, batch_size=100)
```

## Version Check

```python
import sklearn
print(f"scikit-learn version: {sklearn.__version__}")
```

## Useful Resources

- Official Documentation: https://scikit-learn.org/stable/
- User Guide: https://scikit-learn.org/stable/user_guide.html
- API Reference: https://scikit-learn.org/stable/api/index.html
- Examples: https://scikit-learn.org/stable/auto_examples/index.html
- Tutorials: https://scikit-learn.org/stable/tutorial/index.html
