# Denario Examples

## Complete End-to-End Research Example

This example demonstrates a full research pipeline from data to publication.

### Setup

```python
from denario import Denario, Journal
import os

# Create project directory
os.makedirs("climate_research", exist_ok=True)
den = Denario(project_dir="./climate_research")
```

### Define Research Context

```python
den.set_data_description("""
Available data: Global temperature anomaly dataset (1880-2023)
- Monthly mean temperature deviations from 1951-1980 baseline
- Global coverage with land and ocean measurements
- Format: CSV with columns [year, month, temperature_anomaly]

Available tools:
- pandas for data manipulation
- scipy for statistical analysis
- sklearn for regression modeling
- matplotlib and seaborn for visualization

Research domain: Climate science
Research goal: Quantify and characterize long-term global warming trends

Data source: NASA GISTEMP
Known characteristics: Strong autocorrelation, seasonal patterns, missing data pre-1900
""")
```

### Execute Full Pipeline

```python
# Generate research idea
den.get_idea()
# Output: "Quantify the rate of global temperature increase using
# linear regression and assess acceleration in warming trends"

# Develop methodology
den.get_method()
# Output: Creates methodology including:
# - Time-series preprocessing
# - Linear trend analysis
# - Moving average smoothing
# - Statistical significance testing
# - Visualization of trends

# Execute analysis
den.get_results()
# Output: Runs the analysis, generates:
# - Computed trend: +0.18°C per decade
# - Statistical tests: p < 0.001
# - Figure 1: Temperature anomaly over time with trend line
# - Figure 2: Decadal averages
# - Figure 3: Acceleration analysis

# Generate publication
den.get_paper(journal=Journal.APS)
# Output: Creates formatted LaTeX paper with:
# - Title, abstract, introduction
# - Methods section
# - Results with embedded figures
# - Discussion and conclusions
# - References
```

### Review Outputs

```bash
tree climate_research/
# climate_research/
# ├── data_description.txt
# ├── idea.md
# ├── methodology.md
# ├── results.md
# ├── figures/
# │   ├── temperature_trend.png
# │   ├── decadal_averages.png
# │   └── acceleration_analysis.png
# ├── paper.tex
# └── paper.pdf
```

## Enhancing Input Descriptions

Improve data descriptions for better idea generation.

### Basic Description

```python
den = Denario(project_dir="./enhanced_input")

# Start with minimal description
den.set_data_description("Gene expression data from cancer patients")
```

### Enhanced Description

```python
# Enhance with specifics
den.set_data_description("""
Dataset: Gene expression microarray data from breast cancer patients
- Sample size: 500 patients (250 responders, 250 non-responders to therapy)
- Features: Expression levels of 20,000 genes
- Format: CSV matrix (samples × genes)
- Clinical metadata: Age, tumor stage, treatment response, survival time

Available analytical tools:
- pandas for data processing
- sklearn for machine learning (PCA, random forests, SVM)
- lifelines for survival analysis
- matplotlib/seaborn for visualization

Research objectives:
- Identify gene signatures predictive of treatment response
- Discover potential therapeutic targets
- Validate findings using cross-validation

Data characteristics:
- Normalized log2 expression values
- Some missing data (<5% of values)
- Batch effects corrected
""")

den.get_idea()
# Now generates more specific and relevant research ideas
```

## Literature Search Integration

Incorporate existing research into your workflow.

### Example: Finding Related Work

```python
den = Denario(project_dir="./literature_review")

# Define research area
den.set_data_description("""
Research area: Machine learning for protein structure prediction
Available data: Protein sequence database with known structures
Tools: Biopython, TensorFlow, scikit-learn
""")

# Generate idea
den.set_idea("Develop a deep learning model for predicting protein secondary structure from amino acid sequences")

# NOTE: Literature search functionality would be integrated here
# The specific API for literature search should be checked in denario's documentation
# Example conceptual usage:
# den.search_literature(keywords=["protein structure prediction", "deep learning", "LSTM"])
# This would inform methodology and provide citations for the paper
```

## Generate Research Ideas from Data

Focus on idea generation without full pipeline execution.

### Example: Brainstorming Research Questions

```python
den = Denario(project_dir="./idea_generation")

# Provide comprehensive data description
den.set_data_description("""
Available datasets:
1. Social media sentiment data (1M tweets, 2020-2023)
2. Stock market prices (S&P 500, daily, 2020-2023)
3. Economic indicators (GDP, unemployment, inflation)

Tools: pandas, sklearn, statsmodels, Prophet, VADER sentiment analysis

Domain: Computational social science and finance
Research interests: Market prediction, sentiment analysis, causal inference
""")

# Generate multiple ideas (conceptual - depends on denario API)
den.get_idea()

# Review the generated idea in idea.md
# Decide whether to proceed or regenerate
```

## Writing a Paper from Existing Results

Use denario for paper generation when analysis is already complete.

### Example: Formatting Existing Research

```python
den = Denario(project_dir="./paper_generation")

# Provide all components manually
den.set_data_description("""
Completed analysis of traffic pattern data from urban sensors
Dataset: 6 months of traffic flow measurements from 100 intersections
Analysis completed using R and Python
""")

den.set_idea("""
Research question: Optimize traffic light timing using reinforcement learning
to reduce congestion and improve traffic flow efficiency
""")

den.set_method("""
# Methodology

## Data Collection
Traffic flow data collected from 100 intersections in downtown area from
January-June 2023. Measurements include vehicle counts, wait times, and
queue lengths at 1-minute intervals.

## Model Development
Developed a Deep Q-Network (DQN) reinforcement learning agent to optimize
traffic light timing. State space includes current queue lengths and
historical flow patterns. Actions correspond to light timing adjustments.

## Training
Trained the agent using historical data with a reward function based on
total wait time reduction. Used experience replay and target networks for
stable learning.

## Validation
Validated using held-out test data and compared against:
- Current fixed-timing system
- Actuated control system
- Alternative RL algorithms (A3C, PPO)

## Metrics
- Average wait time reduction
- Total throughput improvement
- Queue length distribution
- Computational efficiency
""")

den.set_results("""
# Results

## Training Performance
The DQN agent converged after 500,000 training episodes. Training time: 12 hours
on NVIDIA V100 GPU.

## Wait Time Reduction
- Current system: Average wait time 45.2 seconds
- DQN system: Average wait time 32.8 seconds
- Improvement: 27.4% reduction (p < 0.001)

## Throughput Analysis
- Vehicles processed per hour increased from 2,850 to 3,420 (+20%)
- Peak hour congestion reduced by 35%

## Comparison with Baselines
- Actuated control: 38.1 seconds average wait (DQN still 14% better)
- A3C: 34.5 seconds (DQN slightly better, 5%)
- PPO: 33.2 seconds (DQN marginally better, 1%)

## Queue Length Analysis
Maximum queue length reduced from 42 vehicles to 28 vehicles during peak hours.

## Figures
- Figure 1: Training curve showing convergence
- Figure 2: Wait time distribution comparison
- Figure 3: Throughput over time of day
- Figure 4: Heatmap of queue lengths across intersections
""")

# Generate publication-ready paper
den.get_paper(journal=Journal.APS)
```

## Fast Mode with Gemini

Use Google's Gemini models for faster execution.

### Example: Rapid Prototyping

```python
# Configure for fast mode (conceptual - check denario documentation)
# This would involve setting appropriate LLM backend

den = Denario(project_dir="./fast_research")

# Same workflow, optimized for speed
den.set_data_description("""
Quick analysis needed: Monthly sales data (2 years)
Goal: Identify seasonal patterns and forecast next quarter
Tools: pandas, Prophet
""")

# Fast execution
den.get_idea()
den.get_method()
den.get_results()
den.get_paper()

# Trade-off: Faster execution, potentially less detailed analysis
```

## Hybrid Workflow: Custom Idea + Automated Method

Combine manual and automated approaches.

### Example: Directed Research

```python
den = Denario(project_dir="./hybrid_workflow")

# Describe data
den.set_data_description("""
Medical imaging dataset: 10,000 chest X-rays
Labels: Normal, pneumonia, COVID-19
Format: 224x224 grayscale PNG files
Tools: TensorFlow, Keras, scikit-learn, OpenCV
""")

# Provide specific research direction
den.set_idea("""
Develop a transfer learning approach using pre-trained ResNet50 for multi-class
classification of chest X-rays, with focus on interpretability using Grad-CAM
to identify diagnostic regions
""")

# Let denario develop the methodology
den.get_method()

# Review methodology, then execute
den.get_results()

# Generate paper
den.get_paper(journal=Journal.APS)
```

## Time-Series Analysis Example

Specialized example for temporal data.

### Example: Economic Forecasting

```python
den = Denario(project_dir="./time_series_analysis")

den.set_data_description("""
Dataset: Monthly unemployment rates (US, 1950-2023)
Additional features: GDP growth, inflation, interest rates
Format: Multivariate time-series DataFrame
Tools: statsmodels, Prophet, pmdarima, sklearn

Analysis goals:
- Model unemployment trends
- Forecast next 12 months
- Identify leading indicators
- Assess forecast uncertainty

Data characteristics:
- Seasonal patterns (annual cycles)
- Structural breaks (recessions)
- Autocorrelation present
- Non-stationary (unit root)
""")

den.get_idea()
# Might generate: "Develop a SARIMAX model incorporating economic indicators
# as exogenous variables to forecast unemployment with confidence intervals"

den.get_method()
den.get_results()
den.get_paper(journal=Journal.APS)
```

## Machine Learning Pipeline Example

Complete ML workflow with validation.

### Example: Predictive Modeling

```python
den = Denario(project_dir="./ml_pipeline")

den.set_data_description("""
Dataset: Customer churn prediction
- 50,000 customers, 30 features (demographics, usage patterns, service history)
- Binary target: churned (1) or retained (0)
- Imbalanced: 20% churn rate
- Features: Numerical and categorical mixed

Available tools:
- pandas for preprocessing
- sklearn for modeling (RF, XGBoost, logistic regression)
- imblearn for handling imbalance
- SHAP for feature importance

Goals:
- Build predictive model for churn
- Identify key churn factors
- Provide actionable insights
- Achieve >85% AUC-ROC
""")

den.get_idea()
# Might generate: "Develop an ensemble model combining XGBoost and Random Forest
# with SMOTE oversampling, and use SHAP values to identify interpretable
# churn risk factors"

den.get_method()
# Will include: train/test split, cross-validation, hyperparameter tuning,
# performance metrics, feature importance analysis

den.get_results()
# Executes full ML pipeline, generates:
# - Model performance metrics
# - ROC curves
# - Feature importance plots
# - Confusion matrices

den.get_paper(journal=Journal.APS)
```

## Tips for Effective Usage

### Provide Rich Context

More context → better ideas and methodologies:

```python
# Include:
# - Data characteristics (size, format, quality issues)
# - Available tools and libraries
# - Domain-specific knowledge
# - Research objectives and constraints
# - Known challenges or considerations
```

### Iterate on Intermediate Outputs

Review and refine at each stage:

```python
# Generate
den.get_idea()

# Review idea.md
# If needed, refine:
den.set_idea("Refined version of the idea")

# Continue
den.get_method()
# Review methodology.md
# Refine if needed, then proceed
```

### Save Your Workflow

Document the complete pipeline:

```python
# Save workflow script
with open("research_workflow.py", "w") as f:
    f.write("""
from denario import Denario, Journal

den = Denario(project_dir="./project")
den.set_data_description("...")
den.get_idea()
den.get_method()
den.get_results()
den.get_paper(journal=Journal.APS)
""")
```

### Use Version Control

Track research evolution:

```bash
cd project_dir
git init
git add .
git commit -m "Initial data description"

# After each stage
git add .
git commit -m "Generated research idea"
# ... continue committing after each stage
```
