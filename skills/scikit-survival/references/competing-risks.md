# Competing Risks Analysis

## Overview

Competing risks occur when subjects can experience one of several mutually exclusive events (event types). When one event occurs, it prevents ("competes with") the occurrence of other events.

### Examples of Competing Risks

**Medical Research:**
- Death from cancer vs. death from cardiovascular disease vs. death from other causes
- Relapse vs. death without relapse in cancer studies
- Different types of infections in transplant patients

**Other Applications:**
- Job termination: retirement vs. resignation vs. termination for cause
- Equipment failure: different failure modes
- Customer churn: different reasons for leaving

### Key Concept: Cumulative Incidence Function (CIF)

The **Cumulative Incidence Function (CIF)** represents the probability of experiencing a specific event type by time *t*, accounting for the presence of competing risks.

**CIF_k(t) = P(T ≤ t, event type = k)**

This differs from the Kaplan-Meier estimator, which would overestimate event probabilities when competing risks are present.

## When to Use Competing Risks Analysis

**Use competing risks when:**
- Multiple mutually exclusive event types exist
- Occurrence of one event prevents others
- Need to estimate probability of specific event types
- Want to understand how covariates affect different event types

**Don't use when:**
- Only one event type of interest (standard survival analysis)
- Events are not mutually exclusive (use recurrent events methods)
- Competing events are extremely rare (can treat as censoring)

## Cumulative Incidence with Competing Risks

### cumulative_incidence_competing_risks Function

Estimates the cumulative incidence function for each event type.

```python
from sksurv.nonparametric import cumulative_incidence_competing_risks
from sksurv.datasets import load_leukemia

# Load data with competing risks
X, y = load_leukemia()
# y has event types: 0=censored, 1=relapse, 2=death

# Compute cumulative incidence for each event type
# Returns: time points, CIF for event 1, CIF for event 2, ...
time_points, cif_1, cif_2 = cumulative_incidence_competing_risks(y)

# Plot cumulative incidence functions
import matplotlib.pyplot as plt

plt.figure(figsize=(10, 6))
plt.step(time_points, cif_1, where='post', label='Relapse', linewidth=2)
plt.step(time_points, cif_2, where='post', label='Death in remission', linewidth=2)
plt.xlabel('Time (weeks)')
plt.ylabel('Cumulative Incidence')
plt.title('Competing Risks: Relapse vs Death')
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()
```

### Interpretation

- **CIF at time t**: Probability of experiencing that specific event by time t
- **Sum of all CIFs**: Total probability of experiencing any event (all cause)
- **1 - sum of CIFs**: Probability of being event-free and uncensored

## Data Format for Competing Risks

### Creating Structured Array with Event Types

```python
import numpy as np
from sksurv.util import Surv

# Event types: 0 = censored, 1 = event type 1, 2 = event type 2
event_types = np.array([0, 1, 2, 1, 0, 2, 1])
times = np.array([10.2, 5.3, 8.1, 3.7, 12.5, 6.8, 4.2])

# Create survival array
# For competing risks: event=True if any event occurred
# Store event type separately or encode in the event field
y = Surv.from_arrays(
    event=(event_types > 0),  # True if any event
    time=times
)

# Keep event_types for distinguishing between event types
```

### Converting Data with Event Types

```python
import pandas as pd
from sksurv.util import Surv

# Assume data has: time, event_type columns
# event_type: 0=censored, 1=type1, 2=type2, etc.

df = pd.read_csv('competing_risks_data.csv')

# Create survival outcome
y = Surv.from_arrays(
    event=(df['event_type'] > 0),
    time=df['time']
)

# Store event types
event_types = df['event_type'].values
```

## Comparing Cumulative Incidence Between Groups

### Stratified Analysis

```python
from sksurv.nonparametric import cumulative_incidence_competing_risks
import matplotlib.pyplot as plt

# Split by treatment group
mask_treatment = X['treatment'] == 'A'
mask_control = X['treatment'] == 'B'

y_treatment = y[mask_treatment]
y_control = y[mask_control]

# Compute CIF for each group
time_trt, cif1_trt, cif2_trt = cumulative_incidence_competing_risks(y_treatment)
time_ctl, cif1_ctl, cif2_ctl = cumulative_incidence_competing_risks(y_control)

# Plot comparison
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

# Event type 1
ax1.step(time_trt, cif1_trt, where='post', label='Treatment', linewidth=2)
ax1.step(time_ctl, cif1_ctl, where='post', label='Control', linewidth=2)
ax1.set_xlabel('Time')
ax1.set_ylabel('Cumulative Incidence')
ax1.set_title('Event Type 1')
ax1.legend()
ax1.grid(True, alpha=0.3)

# Event type 2
ax2.step(time_trt, cif2_trt, where='post', label='Treatment', linewidth=2)
ax2.step(time_ctl, cif2_ctl, where='post', label='Control', linewidth=2)
ax2.set_xlabel('Time')
ax2.set_ylabel('Cumulative Incidence')
ax2.set_title('Event Type 2')
ax2.legend()
ax2.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()
```

## Statistical Testing with Competing Risks

### Gray's Test

Compare cumulative incidence functions between groups using Gray's test (available in other packages like lifelines).

```python
# Note: Gray's test not directly available in scikit-survival
# Consider using lifelines or other packages

# from lifelines.statistics import multivariate_logrank_test
# result = multivariate_logrank_test(times, groups, events, event_of_interest=1)
```

## Modeling with Competing Risks

### Approach 1: Cause-Specific Hazard Models

Fit separate Cox models for each event type, treating other event types as censored.

```python
from sksurv.linear_model import CoxPHSurvivalAnalysis
from sksurv.util import Surv

# Separate outcome for each event type
# Event type 1: treat type 2 as censored
y_event1 = Surv.from_arrays(
    event=(event_types == 1),
    time=times
)

# Event type 2: treat type 1 as censored
y_event2 = Surv.from_arrays(
    event=(event_types == 2),
    time=times
)

# Fit cause-specific models
cox_event1 = CoxPHSurvivalAnalysis()
cox_event1.fit(X, y_event1)

cox_event2 = CoxPHSurvivalAnalysis()
cox_event2.fit(X, y_event2)

# Interpret coefficients for each event type
print("Event Type 1 (e.g., Relapse):")
print(cox_event1.coef_)

print("\nEvent Type 2 (e.g., Death):")
print(cox_event2.coef_)
```

**Interpretation:**
- Separate model for each competing event
- Coefficients show effect on cause-specific hazard for that event type
- A covariate may increase risk for one event type but decrease for another

### Approach 2: Fine-Gray Sub-distribution Hazard Model

Models the cumulative incidence directly (not available directly in scikit-survival, but can use other packages).

```python
# Note: Fine-Gray model not directly in scikit-survival
# Consider using lifelines or rpy2 to access R's cmprsk package

# from lifelines import CRCSplineFitter
# crc = CRCSplineFitter()
# crc.fit(df, event_col='event', duration_col='time')
```

## Practical Example: Complete Competing Risks Analysis

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sksurv.nonparametric import cumulative_incidence_competing_risks
from sksurv.linear_model import CoxPHSurvivalAnalysis
from sksurv.util import Surv

# Simulate competing risks data
np.random.seed(42)
n = 200

# Create features
age = np.random.normal(60, 10, n)
treatment = np.random.choice(['A', 'B'], n)

# Simulate event times and types
# Event types: 0=censored, 1=relapse, 2=death
times = np.random.exponential(100, n)
event_types = np.zeros(n, dtype=int)

# Higher age increases both events, treatment A reduces relapse
for i in range(n):
    if times[i] < 150:  # Event occurred
        # Probability of each event type
        p_relapse = 0.6 if treatment[i] == 'B' else 0.4
        event_types[i] = 1 if np.random.rand() < p_relapse else 2
    else:
        times[i] = 150  # Censored at study end

# Create DataFrame
df = pd.DataFrame({
    'time': times,
    'event_type': event_types,
    'age': age,
    'treatment': treatment
})

# Encode treatment
df['treatment_A'] = (df['treatment'] == 'A').astype(int)

# 1. OVERALL CUMULATIVE INCIDENCE
print("=" * 60)
print("OVERALL CUMULATIVE INCIDENCE")
print("=" * 60)

y_all = Surv.from_arrays(event=(df['event_type'] > 0), time=df['time'])
time_points, cif_relapse, cif_death = cumulative_incidence_competing_risks(y_all)

plt.figure(figsize=(10, 6))
plt.step(time_points, cif_relapse, where='post', label='Relapse', linewidth=2)
plt.step(time_points, cif_death, where='post', label='Death', linewidth=2)
plt.xlabel('Time (days)')
plt.ylabel('Cumulative Incidence')
plt.title('Competing Risks: Relapse vs Death')
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()

print(f"5-year relapse incidence: {cif_relapse[-1]:.2%}")
print(f"5-year death incidence: {cif_death[-1]:.2%}")

# 2. STRATIFIED BY TREATMENT
print("\n" + "=" * 60)
print("CUMULATIVE INCIDENCE BY TREATMENT")
print("=" * 60)

for trt in ['A', 'B']:
    mask = df['treatment'] == trt
    y_trt = Surv.from_arrays(
        event=(df.loc[mask, 'event_type'] > 0),
        time=df.loc[mask, 'time']
    )
    time_trt, cif1_trt, cif2_trt = cumulative_incidence_competing_risks(y_trt)
    print(f"\nTreatment {trt}:")
    print(f"  5-year relapse: {cif1_trt[-1]:.2%}")
    print(f"  5-year death: {cif2_trt[-1]:.2%}")

# 3. CAUSE-SPECIFIC MODELS
print("\n" + "=" * 60)
print("CAUSE-SPECIFIC HAZARD MODELS")
print("=" * 60)

X = df[['age', 'treatment_A']]

# Model for relapse (event type 1)
y_relapse = Surv.from_arrays(
    event=(df['event_type'] == 1),
    time=df['time']
)
cox_relapse = CoxPHSurvivalAnalysis()
cox_relapse.fit(X, y_relapse)

print("\nRelapse Model:")
print(f"  Age:        HR = {np.exp(cox_relapse.coef_[0]):.3f}")
print(f"  Treatment A: HR = {np.exp(cox_relapse.coef_[1]):.3f}")

# Model for death (event type 2)
y_death = Surv.from_arrays(
    event=(df['event_type'] == 2),
    time=df['time']
)
cox_death = CoxPHSurvivalAnalysis()
cox_death.fit(X, y_death)

print("\nDeath Model:")
print(f"  Age:        HR = {np.exp(cox_death.coef_[0]):.3f}")
print(f"  Treatment A: HR = {np.exp(cox_death.coef_[1]):.3f}")

print("\n" + "=" * 60)
```

## Important Considerations

### Censoring in Competing Risks

- **Administrative censoring**: Subject still at risk at end of study
- **Loss to follow-up**: Subject leaves study before event
- **Competing event**: Other event occurred - NOT censored for CIF, but censored for cause-specific models

### Choosing Between Cause-Specific and Sub-distribution Models

**Cause-Specific Hazard Models:**
- Easier to interpret
- Direct effect on hazard rate
- Better for understanding etiology
- Can fit with scikit-survival

**Fine-Gray Sub-distribution Models:**
- Models cumulative incidence directly
- Better for prediction and risk stratification
- More appropriate for clinical decision-making
- Requires other packages

### Common Mistakes

**Mistake 1**: Using Kaplan-Meier to estimate event-specific probabilities
- **Wrong**: Kaplan-Meier for event type 1, treating type 2 as censored
- **Correct**: Cumulative incidence function accounting for competing risks

**Mistake 2**: Ignoring competing risks when they're substantial
- If competing event rate > 10-20%, should use competing risks methods

**Mistake 3**: Confusing cause-specific and sub-distribution hazards
- They answer different questions
- Use appropriate model for your research question

## Summary

**Key Functions:**
- `cumulative_incidence_competing_risks`: Estimate CIF for each event type
- Fit separate Cox models for cause-specific hazards
- Use stratified analysis to compare groups

**Best Practices:**
1. Always plot cumulative incidence functions
2. Report both event-specific and overall incidence
3. Use cause-specific models in scikit-survival
4. Consider Fine-Gray models (other packages) for prediction
5. Be explicit about which events are competing vs censored
