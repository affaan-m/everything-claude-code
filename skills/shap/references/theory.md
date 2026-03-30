# SHAP Theoretical Foundation

This document explains the theoretical foundations of SHAP (SHapley Additive exPlanations), including Shapley values from game theory, the principles that make SHAP unique, and connections to other explanation methods.

## Game Theory Origins

### Shapley Values

SHAP is grounded in **Shapley values**, a solution concept from cooperative game theory developed by Lloyd Shapley in 1951.

**Core Concept**:
In cooperative game theory, players collaborate to achieve a total payoff, and the question is: how should this payoff be fairly distributed among players?

**Mapping to Machine Learning**:
- **Players** → Input features
- **Game** → Model prediction task
- **Payoff** → Model output (prediction value)
- **Coalition** → Subset of features with known values
- **Fair Distribution** → Attributing prediction to features

### The Shapley Value Formula

For a feature $i$, its Shapley value $\phi_i$ is:

$$\phi_i = \sum_{S \subseteq F \setminus \{i\}} \frac{|S|!(|F|-|S|-1)!}{|F|!} [f(S \cup \{i\}) - f(S)]$$

Where:
- $F$ is the set of all features
- $S$ is a subset of features not including $i$
- $f(S)$ is the model's expected output given only features in $S$
- $|S|$ is the size of subset $S$

**Interpretation**:
The Shapley value averages the marginal contribution of feature $i$ across all possible feature coalitions (subsets). The contribution is weighted by how likely each coalition is to occur.

### Key Properties of Shapley Values

**1. Efficiency (Additivity)**:
$$\sum_{i=1}^{n} \phi_i = f(x) - f(\emptyset)$$

The sum of all SHAP values equals the difference between the model's prediction for the instance and the expected value (baseline).

This is why SHAP waterfall plots always sum to the total prediction change.

**2. Symmetry**:
If two features $i$ and $j$ contribute equally to all coalitions, then $\phi_i = \phi_j$.

Features with identical effects receive identical attribution.

**3. Dummy**:
If a feature $i$ doesn't change the model output for any coalition, then $\phi_i = 0$.

Irrelevant features receive zero attribution.

**4. Monotonicity**:
If a feature's marginal contribution increases across coalitions, its Shapley value increases.

## From Game Theory to Machine Learning

### The Challenge

Computing exact Shapley values requires evaluating the model on all possible feature coalitions:
- For $n$ features, there are $2^n$ possible coalitions
- For 50 features, this is over 1 quadrillion evaluations

This exponential complexity makes exact computation intractable for most real-world models.

### SHAP's Solution: Additive Feature Attribution

SHAP connects Shapley values to **additive feature attribution methods**, enabling efficient computation.

**Additive Feature Attribution Model**:
$$g(z') = \phi_0 + \sum_{i=1}^{M} \phi_i z'_i$$

Where:
- $g$ is the explanation model
- $z' \in \{0,1\}^M$ indicates feature presence/absence
- $\phi_i$ is the attribution to feature $i$
- $\phi_0$ is the baseline (expected value)

SHAP proves that **Shapley values are the only attribution values satisfying three desirable properties**: local accuracy, missingness, and consistency.

## SHAP Properties and Guarantees

### Local Accuracy

**Property**: The explanation matches the model's output:
$$f(x) = g(x') = \phi_0 + \sum_{i=1}^{M} \phi_i x'_i$$

**Interpretation**: SHAP values exactly account for the model's prediction. This enables waterfall plots to precisely decompose predictions.

### Missingness

**Property**: If a feature is missing (not observed), its attribution is zero:
$$x'_i = 0 \Rightarrow \phi_i = 0$$

**Interpretation**: Only features that are present contribute to explanations.

### Consistency

**Property**: If a model changes so a feature's marginal contribution increases (or stays the same) for all inputs, that feature's attribution should not decrease.

**Interpretation**: If a feature becomes more important to the model, its SHAP value reflects this. This enables meaningful model comparisons.

## SHAP as a Unified Framework

SHAP unifies several existing explanation methods by showing they're special cases of Shapley values under specific assumptions.

### LIME (Local Interpretable Model-agnostic Explanations)

**LIME's Approach**: Fit a local linear model around a prediction using perturbed samples.

**Connection to SHAP**: LIME approximates Shapley values but with suboptimal sample weighting. SHAP uses theoretically optimal weights derived from Shapley value formula.

**Key Difference**: LIME's loss function and sampling don't guarantee consistency or exact additivity; SHAP does.

### DeepLIFT

**DeepLIFT's Approach**: Backpropagate contributions through neural networks by comparing to reference activations.

**Connection to SHAP**: DeepExplainer uses DeepLIFT but averages over multiple reference samples to approximate conditional expectations, yielding Shapley values.

### Layer-Wise Relevance Propagation (LRP)

**LRP's Approach**: Decompose neural network predictions by propagating relevance scores backward through layers.

**Connection to SHAP**: LRP is a special case of SHAP with specific propagation rules. SHAP generalizes these rules with Shapley value theory.

### Integrated Gradients

**Integrated Gradients' Approach**: Integrate gradients along path from baseline to input.

**Connection to SHAP**: When using a single reference point, Integrated Gradients approximates SHAP values for smooth models.

## SHAP Computation Methods

Different SHAP explainers use specialized algorithms to compute Shapley values efficiently for specific model types.

### Tree SHAP (TreeExplainer)

**Innovation**: Exploits tree structure to compute exact Shapley values in polynomial time instead of exponential.

**Algorithm**:
- Traverses each tree path from root to leaf
- Computes feature contributions using tree splits and weights
- Aggregates across all trees in ensemble

**Complexity**: $O(TLD^2)$ where $T$ = number of trees, $L$ = max leaves, $D$ = max depth

**Key Advantage**: Exact Shapley values computed efficiently for tree-based models (XGBoost, LightGBM, Random Forest, etc.)

### Kernel SHAP (KernelExplainer)

**Innovation**: Uses weighted linear regression to estimate Shapley values for any model.

**Algorithm**:
- Samples coalitions (feature subsets) according to Shapley kernel weights
- Evaluates model on each coalition (missing features replaced by background values)
- Fits weighted linear model to estimate feature attributions

**Complexity**: $O(n \cdot 2^M)$ but approximates with fewer samples

**Key Advantage**: Model-agnostic; works with any prediction function

**Trade-off**: Slower than specialized explainers; approximate rather than exact

### Deep SHAP (DeepExplainer)

**Innovation**: Combines DeepLIFT with Shapley value sampling.

**Algorithm**:
- Computes DeepLIFT attributions for each reference sample
- Averages attributions across multiple reference samples
- Approximates conditional expectations: $E[f(x) | x_S]$

**Complexity**: $O(n \cdot m)$ where $m$ = number of reference samples

**Key Advantage**: Efficiently approximates Shapley values for deep neural networks

### Linear SHAP (LinearExplainer)

**Innovation**: Closed-form Shapley values for linear models.

**Algorithm**:
- For independent features: $\phi_i = w_i \cdot (x_i - E[x_i])$
- For correlated features: Adjusts for feature covariance

**Complexity**: $O(n)$ - nearly instantaneous

**Key Advantage**: Exact Shapley values with minimal computation

## Understanding Conditional Expectations

### The Core Challenge

Computing $f(S)$ (model output given only features in $S$) requires handling missing features.

**Question**: How should we represent "missing" features when the model requires all features as input?

### Two Approaches

**1. Interventional (Marginal) Approach**:
- Replace missing features with values from background dataset
- Estimates: $E[f(x) | x_S]$ by marginalizing over $x_{\bar{S}}$
- Interpretation: "What would the model predict if we didn't know features $\bar{S}$?"

**2. Observational (Conditional) Approach**:
- Use conditional distribution: $E[f(x) | x_S = x_S^*]$
- Accounts for feature dependencies
- Interpretation: "What would the model predict for similar instances with features $S = x_S^*$?"

**Trade-offs**:
- **Interventional**: Simpler, assumes feature independence, matches causal interpretation
- **Observational**: More accurate for correlated features, requires conditional distribution estimation

**TreeExplainer** supports both via `feature_perturbation` parameter.

## Baseline (Expected Value) Selection

The **baseline** $\phi_0 = E[f(x)]$ represents the model's average prediction.

### Computing the Baseline

**For TreeExplainer**:
- With background data: Average prediction on background dataset
- With tree_path_dependent: Weighted average using tree leaf distributions

**For DeepExplainer / KernelExplainer**:
- Average prediction on background samples

### Importance of Baseline

- SHAP values measure deviation from baseline
- Different baselines → different SHAP values (but still sum correctly)
- Choose baseline representative of "typical" or "neutral" input
- Common choices: Training set mean, median, or mode

## Interpreting SHAP Values

### Units and Scale

**SHAP values have the same units as the model output**:
- Regression: Same units as target variable (dollars, temperature, etc.)
- Classification (log-odds): Log-odds units
- Classification (probability): Probability units (if model output transformed)

**Magnitude**: Higher absolute SHAP value = stronger feature impact

**Sign**:
- Positive SHAP value = Feature pushes prediction higher
- Negative SHAP value = Feature pushes prediction lower

### Additive Decomposition

For a prediction $f(x)$:
$$f(x) = E[f(X)] + \sum_{i=1}^{n} \phi_i(x)$$

**Example**:
- Expected value (baseline): 0.3
- SHAP values: {Age: +0.15, Income: +0.10, Education: -0.05}
- Prediction: $0.3 + 0.15 + 0.10 - 0.05 = 0.50$

### Global vs. Local Importance

**Local (Instance-level)**:
- SHAP values for single prediction: $\phi_i(x)$
- Explains: "Why did the model predict $f(x)$ for this instance?"
- Visualization: Waterfall, force plots

**Global (Dataset-level)**:
- Average absolute SHAP values: $E[|\phi_i(x)|]$
- Explains: "Which features are most important overall?"
- Visualization: Beeswarm, bar plots

**Key Insight**: Global importance is the aggregation of local importances, maintaining consistency between instance and dataset explanations.

## SHAP vs. Other Feature Importance Methods

### Comparison with Permutation Importance

**Permutation Importance**:
- Shuffles a feature and measures accuracy drop
- Global metric only (no instance-level explanations)
- Can be misleading with correlated features

**SHAP**:
- Provides both local and global importance
- Handles feature correlations through coalitional averaging
- Consistent: Additive property guarantees sum to prediction

### Comparison with Feature Coefficients (Linear Models)

**Feature Coefficients** ($w_i$):
- Measure impact per unit change in feature
- Don't account for feature scale or distribution

**SHAP for Linear Models**:
- $\phi_i = w_i \cdot (x_i - E[x_i])$
- Accounts for feature value relative to average
- More interpretable for comparing features with different units/scales

### Comparison with Tree Feature Importance (Gini/Split-based)

**Gini/Split Importance**:
- Based on training process (purity gain or frequency of splits)
- Biased toward high-cardinality features
- No instance-level explanations
- Can be misleading (importance ≠ predictive power)

**SHAP (Tree SHAP)**:
- Based on model output (prediction behavior)
- Fair attribution through Shapley values
- Provides instance-level explanations
- Consistent and theoretically grounded

## Interactions and Higher-Order Effects

### SHAP Interaction Values

Standard SHAP captures main effects. **SHAP interaction values** capture pairwise interactions.

**Formula for Interaction**:
$$\phi_{i,j} = \sum_{S \subseteq F \setminus \{i,j\}} \frac{|S|!(|F|-|S|-2)!}{2(|F|-1)!} \Delta_{ij}(S)$$

Where $\Delta_{ij}(S)$ is the interaction effect of features $i$ and $j$ given coalition $S$.

**Interpretation**:
- $\phi_{i,i}$: Main effect of feature $i$
- $\phi_{i,j}$ ($i \neq j$): Interaction effect between features $i$ and $j$

**Property**:
$$\phi_i = \phi_{i,i} + \sum_{j \neq i} \phi_{i,j}$$

Main SHAP value equals main effect plus half of all pairwise interactions involving feature $i$.

### Computing Interactions

**TreeExplainer** supports exact interaction computation:
```python
explainer = shap.TreeExplainer(model)
shap_interaction_values = explainer.shap_interaction_values(X)
```

**Limitation**: Exponentially complex for other explainers (only practical for tree models)

## Theoretical Limitations and Considerations

### Computational Complexity

**Exact Computation**: $O(2^n)$ - intractable for large $n$

**Specialized Algorithms**:
- Tree SHAP: $O(TLD^2)$ - efficient for trees
- Deep SHAP, Kernel SHAP: Approximations required

**Implication**: For non-tree models with many features, explanations may be approximate.

### Feature Independence Assumption

**Kernel SHAP and Basic Implementation**: Assume features can be independently manipulated

**Challenge**: Real features are often correlated (e.g., height and weight)

**Solutions**:
- Use observational approach (conditional expectations)
- TreeExplainer with correlation-aware perturbation
- Feature grouping for highly correlated features

### Out-of-Distribution Samples

**Issue**: Creating coalitions by replacing features may create unrealistic samples (outside training distribution)

**Example**: Setting "Age=5" and "Has PhD=Yes" simultaneously

**Implication**: SHAP values reflect model behavior on potentially unrealistic inputs

**Mitigation**: Use observational approach or carefully selected background data

### Causality

**SHAP measures association, not causation**

SHAP answers: "How does the model's prediction change with this feature?"
SHAP does NOT answer: "What would happen if we changed this feature in reality?"

**Example**:
- SHAP: "Hospital stay length increases prediction of mortality" (association)
- Causality: "Longer hospital stays cause higher mortality" (incorrect!)

**Implication**: Use domain knowledge to interpret SHAP causally; SHAP alone doesn't establish causation.

## Advanced Theoretical Topics

### SHAP as Optimal Credit Allocation

SHAP is the unique attribution method satisfying:
1. **Local accuracy**: Explanation matches model
2. **Missingness**: Absent features have zero attribution
3. **Consistency**: Attribution reflects feature importance changes

**Proof**: Lundberg & Lee (2017) showed Shapley values are the only solution satisfying these axioms.

### Connection to Functional ANOVA

SHAP values correspond to first-order terms in functional ANOVA decomposition:
$$f(x) = f_0 + \sum_i f_i(x_i) + \sum_{i,j} f_{ij}(x_i, x_j) + ...$$

Where $f_i(x_i)$ captures main effect of feature $i$, and $\phi_i \approx f_i(x_i)$.

### Relationship to Sensitivity Analysis

SHAP generalizes sensitivity analysis:
- **Sensitivity Analysis**: $\frac{\partial f}{\partial x_i}$ (local gradient)
- **SHAP**: Integrated sensitivity over feature coalition space

Gradient-based methods (GradientExplainer, Integrated Gradients) approximate SHAP using derivatives.

## Practical Implications of Theory

### Why Use SHAP?

1. **Theoretical Guarantees**: Only method with consistency, local accuracy, and missingness
2. **Unified Framework**: Connects and generalizes multiple explanation methods
3. **Additive Decomposition**: Predictions precisely decompose into feature contributions
4. **Model Comparison**: Consistency enables comparing feature importance across models
5. **Versatility**: Works with any model type (with appropriate explainer)

### When to Be Cautious

1. **Computational Cost**: May be slow for complex models without specialized explainers
2. **Feature Correlation**: Standard approaches may create unrealistic samples
3. **Interpretation**: Requires understanding baseline, units, and assumptions
4. **Causality**: SHAP doesn't imply causation; use domain knowledge
5. **Approximations**: Non-tree methods use approximations; understand accuracy trade-offs

## References and Further Reading

**Foundational Papers**:
- Shapley, L. S. (1951). "A value for n-person games"
- Lundberg, S. M., & Lee, S. I. (2017). "A Unified Approach to Interpreting Model Predictions" (NeurIPS)
- Lundberg, S. M., et al. (2020). "From local explanations to global understanding with explainable AI for trees" (Nature Machine Intelligence)

**Key Concepts**:
- Cooperative game theory and Shapley values
- Additive feature attribution methods
- Conditional expectation estimation
- Tree SHAP algorithm and polynomial-time computation

This theoretical foundation explains why SHAP is a principled, versatile, and powerful tool for model interpretation.
