# Data Handling and Preprocessing

## Understanding Survival Data

### The Surv Object

Survival data in scikit-survival is represented using structured arrays with two fields:
- **event**: Boolean indicating whether the event occurred (True) or was censored (False)
- **time**: Time to event or censoring

```python
from sksurv.util import Surv

# Create survival outcome from separate arrays
event = np.array([True, False, True, False, True])
time = np.array([5.2, 10.1, 3.7, 8.9, 6.3])

y = Surv.from_arrays(event=event, time=time)
print(y.dtype)  # [('event', '?'), ('time', '<f8')]
```

### Types of Censoring

**Right Censoring** (most common):
- Subject didn't experience event by end of study
- Subject lost to follow-up
- Subject withdrew from study

**Left Censoring**:
- Event occurred before observation began
- Rare in practice

**Interval Censoring**:
- Event occurred in a known time interval
- Requires specialized methods

scikit-survival primarily handles right-censored data.

## Loading Data

### Built-in Datasets

```python
from sksurv.datasets import (
    load_aids,
    load_breast_cancer,
    load_gbsg2,
    load_veterans_lung_cancer,
    load_whas500
)

# Load dataset
X, y = load_breast_cancer()

# X is pandas DataFrame with features
# y is structured array with 'event' and 'time'
print(f"Features shape: {X.shape}")
print(f"Number of events: {y['event'].sum()}")
print(f"Censoring rate: {1 - y['event'].mean():.2%}")
```

### Loading Custom Data

#### From Pandas DataFrame

```python
import pandas as pd
from sksurv.util import Surv

# Load data
df = pd.read_csv('survival_data.csv')

# Separate features and outcome
X = df.drop(['time', 'event'], axis=1)
y = Surv.from_dataframe('event', 'time', df)
```

#### From CSV with Surv.from_arrays

```python
import numpy as np
import pandas as pd
from sksurv.util import Surv

# Load data
df = pd.read_csv('survival_data.csv')

# Create feature matrix
X = df.drop(['time', 'event'], axis=1)

# Create survival outcome
y = Surv.from_arrays(
    event=df['event'].astype(bool),
    time=df['time'].astype(float)
)
```

### Loading ARFF Files

```python
from sksurv.io import loadarff

# Load ARFF format (Weka format)
data = loadarff('survival_data.arff')

# Extract X and y
X = data[0]  # pandas DataFrame
y = data[1]  # structured array
```

## Data Preprocessing

### Handling Categorical Variables

#### Method 1: OneHotEncoder (scikit-survival)

```python
from sksurv.preprocessing import OneHotEncoder
import pandas as pd

# Identify categorical columns
categorical_cols = ['gender', 'race', 'treatment']

# One-hot encode
encoder = OneHotEncoder()
X_encoded = encoder.fit_transform(X[categorical_cols])

# Combine with numerical features
numerical_cols = [col for col in X.columns if col not in categorical_cols]
X_processed = pd.concat([X[numerical_cols], X_encoded], axis=1)
```

#### Method 2: encode_categorical

```python
from sksurv.preprocessing import encode_categorical

# Automatically encode all categorical columns
X_encoded = encode_categorical(X)
```

#### Method 3: Pandas get_dummies

```python
import pandas as pd

# One-hot encode categorical variables
X_encoded = pd.get_dummies(X, drop_first=True)
```

### Standardization

Standardization is important for:
- Cox models with regularization
- SVMs
- Models sensitive to feature scales

```python
from sklearn.preprocessing import StandardScaler

# Standardize features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Convert back to DataFrame
X_scaled = pd.DataFrame(X_scaled, columns=X.columns, index=X.index)
```

### Handling Missing Data

#### Check for Missing Values

```python
# Check missing values
missing = X.isnull().sum()
print(missing[missing > 0])

# Visualize missing data
import seaborn as sns
sns.heatmap(X.isnull(), cbar=False)
```

#### Imputation Strategies

```python
from sklearn.impute import SimpleImputer

# Mean imputation for numerical features
num_imputer = SimpleImputer(strategy='mean')
X_num = X.select_dtypes(include=[np.number])
X_num_imputed = num_imputer.fit_transform(X_num)

# Most frequent for categorical
cat_imputer = SimpleImputer(strategy='most_frequent')
X_cat = X.select_dtypes(include=['object', 'category'])
X_cat_imputed = cat_imputer.fit_transform(X_cat)
```

#### Advanced Imputation

```python
from sklearn.experimental import enable_iterative_imputer
from sklearn.impute import IterativeImputer

# Iterative imputation
imputer = IterativeImputer(random_state=42)
X_imputed = imputer.fit_transform(X)
```

### Feature Selection

#### Variance Threshold

```python
from sklearn.feature_selection import VarianceThreshold

# Remove low variance features
selector = VarianceThreshold(threshold=0.01)
X_selected = selector.fit_transform(X)

# Get selected feature names
selected_features = X.columns[selector.get_support()]
```

#### Univariate Feature Selection

```python
from sklearn.feature_selection import SelectKBest
from sksurv.util import Surv

# Select top k features
selector = SelectKBest(k=10)
X_selected = selector.fit_transform(X, y)

# Get selected features
selected_features = X.columns[selector.get_support()]
```

## Complete Preprocessing Pipeline

### Using sklearn Pipeline

```python
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sksurv.linear_model import CoxPHSurvivalAnalysis

# Create preprocessing and modeling pipeline
pipeline = Pipeline([
    ('imputer', SimpleImputer(strategy='mean')),
    ('scaler', StandardScaler()),
    ('model', CoxPHSurvivalAnalysis())
])

# Fit pipeline
pipeline.fit(X, y)

# Predict
predictions = pipeline.predict(X_test)
```

### Custom Preprocessing Function

```python
def preprocess_survival_data(X, y=None, scaler=None, encoder=None):
    """
    Complete preprocessing pipeline for survival data

    Parameters:
    -----------
    X : DataFrame
        Feature matrix
    y : structured array, optional
        Survival outcome (for filtering invalid samples)
    scaler : StandardScaler, optional
        Fitted scaler (for test data)
    encoder : OneHotEncoder, optional
        Fitted encoder (for test data)

    Returns:
    --------
    X_processed : DataFrame
        Processed features
    scaler : StandardScaler
        Fitted scaler
    encoder : OneHotEncoder
        Fitted encoder
    """
    from sklearn.preprocessing import StandardScaler
    from sksurv.preprocessing import encode_categorical

    # 1. Handle missing values
    # Remove rows with missing outcome
    if y is not None:
        mask = np.isfinite(y['time']) & (y['time'] > 0)
        X = X[mask]
        y = y[mask]

    # Impute missing features
    X = X.fillna(X.median())

    # 2. Encode categorical variables
    if encoder is None:
        X_processed = encode_categorical(X)
        encoder = None  # encode_categorical doesn't return encoder
    else:
        X_processed = encode_categorical(X)

    # 3. Standardize numerical features
    if scaler is None:
        scaler = StandardScaler()
        X_processed = pd.DataFrame(
            scaler.fit_transform(X_processed),
            columns=X_processed.columns,
            index=X_processed.index
        )
    else:
        X_processed = pd.DataFrame(
            scaler.transform(X_processed),
            columns=X_processed.columns,
            index=X_processed.index
        )

    if y is not None:
        return X_processed, y, scaler, encoder
    else:
        return X_processed, scaler, encoder

# Usage
X_train_processed, y_train_processed, scaler, encoder = preprocess_survival_data(X_train, y_train)
X_test_processed, _, _ = preprocess_survival_data(X_test, scaler=scaler, encoder=encoder)
```

## Data Quality Checks

### Validate Survival Data

```python
def validate_survival_data(y):
    """Check survival data quality"""

    # Check for negative times
    if np.any(y['time'] <= 0):
        print("WARNING: Found non-positive survival times")
        print(f"Negative times: {np.sum(y['time'] <= 0)}")

    # Check for missing values
    if np.any(~np.isfinite(y['time'])):
        print("WARNING: Found missing survival times")
        print(f"Missing times: {np.sum(~np.isfinite(y['time']))}")

    # Censoring rate
    censor_rate = 1 - y['event'].mean()
    print(f"Censoring rate: {censor_rate:.2%}")

    if censor_rate > 0.7:
        print("WARNING: High censoring rate (>70%)")
        print("Consider using Uno's C-index instead of Harrell's")

    # Event rate
    print(f"Number of events: {y['event'].sum()}")
    print(f"Number of censored: {(~y['event']).sum()}")

    # Time statistics
    print(f"Median time: {np.median(y['time']):.2f}")
    print(f"Time range: [{np.min(y['time']):.2f}, {np.max(y['time']):.2f}]")

# Use validation
validate_survival_data(y)
```

### Check for Sufficient Events

```python
def check_events_per_feature(X, y, min_events_per_feature=10):
    """
    Check if there are sufficient events per feature.
    Rule of thumb: at least 10 events per feature for Cox models.
    """
    n_events = y['event'].sum()
    n_features = X.shape[1]
    events_per_feature = n_events / n_features

    print(f"Number of events: {n_events}")
    print(f"Number of features: {n_features}")
    print(f"Events per feature: {events_per_feature:.1f}")

    if events_per_feature < min_events_per_feature:
        print(f"WARNING: Low events per feature ratio (<{min_events_per_feature})")
        print("Consider:")
        print("  - Feature selection")
        print("  - Regularization (CoxnetSurvivalAnalysis)")
        print("  - Collecting more data")

    return events_per_feature

# Use check
check_events_per_feature(X, y)
```

## Train-Test Split

### Random Split

```python
from sklearn.model_selection import train_test_split

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
```

### Stratified Split

Ensure similar censoring rates and time distributions:

```python
from sklearn.model_selection import train_test_split

# Create stratification labels
# Stratify by event status and time quartiles
time_quartiles = pd.qcut(y['time'], q=4, labels=False)
strat_labels = y['event'].astype(int) * 10 + time_quartiles

# Stratified split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=strat_labels, random_state=42
)

# Verify similar distributions
print("Training set:")
print(f"  Censoring rate: {1 - y_train['event'].mean():.2%}")
print(f"  Median time: {np.median(y_train['time']):.2f}")

print("Test set:")
print(f"  Censoring rate: {1 - y_test['event'].mean():.2%}")
print(f"  Median time: {np.median(y_test['time']):.2f}")
```

## Working with Time-Varying Covariates

Note: scikit-survival doesn't directly support time-varying covariates. For such data, consider:
1. Time-stratified analysis
2. Landmarking approach
3. Using other packages (e.g., lifelines)

## Summary: Complete Data Preparation Workflow

```python
from sksurv.util import Surv
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sksurv.preprocessing import encode_categorical
import pandas as pd
import numpy as np

# 1. Load data
df = pd.read_csv('data.csv')

# 2. Create survival outcome
y = Surv.from_dataframe('event', 'time', df)

# 3. Prepare features
X = df.drop(['event', 'time'], axis=1)

# 4. Validate data
validate_survival_data(y)
check_events_per_feature(X, y)

# 5. Handle missing values
X = X.fillna(X.median())

# 6. Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 7. Encode categorical variables
X_train = encode_categorical(X_train)
X_test = encode_categorical(X_test)

# 8. Standardize
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Convert back to DataFrames
X_train_scaled = pd.DataFrame(X_train_scaled, columns=X_train.columns)
X_test_scaled = pd.DataFrame(X_test_scaled, columns=X_test.columns)

# Now ready for modeling!
```
