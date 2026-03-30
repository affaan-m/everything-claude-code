# Statistical Tests and Diagnostics Reference

This document provides comprehensive guidance on statistical tests, diagnostics, and tools available in statsmodels.

## Overview

Statsmodels provides extensive statistical testing capabilities:
- Residual diagnostics and specification tests
- Hypothesis testing (parametric and non-parametric)
- Goodness-of-fit tests
- Multiple comparisons and post-hoc tests
- Power and sample size calculations
- Robust covariance matrices
- Influence and outlier detection

## Residual Diagnostics

### Autocorrelation Tests

**Ljung-Box Test**: Tests for autocorrelation in residuals

```python
from statsmodels.stats.diagnostic import acorr_ljungbox

# Test residuals for autocorrelation
lb_test = acorr_ljungbox(residuals, lags=10, return_df=True)
print(lb_test)

# H0: No autocorrelation up to lag k
# If p-value < 0.05, reject H0 (autocorrelation present)
```

**Durbin-Watson Test**: Tests for first-order autocorrelation

```python
from statsmodels.stats.stattools import durbin_watson

dw_stat = durbin_watson(residuals)
print(f"Durbin-Watson: {dw_stat:.4f}")

# DW ≈ 2: no autocorrelation
# DW < 2: positive autocorrelation
# DW > 2: negative autocorrelation
# Exact critical values depend on n and k
```

**Breusch-Godfrey Test**: More general test for autocorrelation

```python
from statsmodels.stats.diagnostic import acorr_breusch_godfrey

bg_test = acorr_breusch_godfrey(results, nlags=5)
lm_stat, lm_pval, f_stat, f_pval = bg_test

print(f"LM statistic: {lm_stat:.4f}, p-value: {lm_pval:.4f}")
# H0: No autocorrelation up to lag k
```

### Heteroskedasticity Tests

**Breusch-Pagan Test**: Tests for heteroskedasticity

```python
from statsmodels.stats.diagnostic import het_breuschpagan

bp_test = het_breuschpagan(residuals, exog)
lm_stat, lm_pval, f_stat, f_pval = bp_test

print(f"Breusch-Pagan test p-value: {lm_pval:.4f}")
# H0: Homoskedasticity (constant variance)
# If p-value < 0.05, reject H0 (heteroskedasticity present)
```

**White Test**: More general test for heteroskedasticity

```python
from statsmodels.stats.diagnostic import het_white

white_test = het_white(residuals, exog)
lm_stat, lm_pval, f_stat, f_pval = white_test

print(f"White test p-value: {lm_pval:.4f}")
# H0: Homoskedasticity
```

**ARCH Test**: Tests for autoregressive conditional heteroskedasticity

```python
from statsmodels.stats.diagnostic import het_arch

arch_test = het_arch(residuals, nlags=5)
lm_stat, lm_pval, f_stat, f_pval = arch_test

print(f"ARCH test p-value: {lm_pval:.4f}")
# H0: No ARCH effects
# If significant, consider GARCH model
```

### Normality Tests

**Jarque-Bera Test**: Tests for normality using skewness and kurtosis

```python
from statsmodels.stats.stattools import jarque_bera

jb_stat, jb_pval, skew, kurtosis = jarque_bera(residuals)

print(f"Jarque-Bera statistic: {jb_stat:.4f}")
print(f"p-value: {jb_pval:.4f}")
print(f"Skewness: {skew:.4f}")
print(f"Kurtosis: {kurtosis:.4f}")

# H0: Residuals are normally distributed
# Normal: skewness ≈ 0, kurtosis ≈ 3
```

**Omnibus Test**: Another normality test (also based on skewness/kurtosis)

```python
from statsmodels.stats.stattools import omni_normtest

omni_stat, omni_pval = omni_normtest(residuals)
print(f"Omnibus test p-value: {omni_pval:.4f}")
# H0: Normality
```

**Anderson-Darling Test**: Distribution fit test

```python
from statsmodels.stats.diagnostic import normal_ad

ad_stat, ad_pval = normal_ad(residuals)
print(f"Anderson-Darling test p-value: {ad_pval:.4f}")
```

**Lilliefors Test**: Modified Kolmogorov-Smirnov test

```python
from statsmodels.stats.diagnostic import lilliefors

lf_stat, lf_pval = lilliefors(residuals, dist='norm')
print(f"Lilliefors test p-value: {lf_pval:.4f}")
```

### Linearity and Specification Tests

**Ramsey RESET Test**: Tests for functional form misspecification

```python
from statsmodels.stats.diagnostic import linear_reset

reset_test = linear_reset(results, power=2)
f_stat, f_pval = reset_test

print(f"RESET test p-value: {f_pval:.4f}")
# H0: Model is correctly specified (linear)
# If rejected, may need polynomial terms or transformations
```

**Harvey-Collier Test**: Tests for linearity

```python
from statsmodels.stats.diagnostic import linear_harvey_collier

hc_stat, hc_pval = linear_harvey_collier(results)
print(f"Harvey-Collier test p-value: {hc_pval:.4f}")
# H0: Linear specification is correct
```

## Multicollinearity Detection

**Variance Inflation Factor (VIF)**:

```python
from statsmodels.stats.outliers_influence import variance_inflation_factor
import pandas as pd

# Calculate VIF for each variable
vif_data = pd.DataFrame()
vif_data["Variable"] = X.columns
vif_data["VIF"] = [variance_inflation_factor(X.values, i)
                   for i in range(X.shape[1])]

print(vif_data.sort_values('VIF', ascending=False))

# Interpretation:
# VIF = 1: No correlation with other predictors
# VIF > 5: Moderate multicollinearity
# VIF > 10: Serious multicollinearity problem
# VIF > 20: Severe multicollinearity (consider removing variable)
```

**Condition Number**: From regression results

```python
print(f"Condition number: {results.condition_number:.2f}")

# Interpretation:
# < 10: No multicollinearity concern
# 10-30: Moderate multicollinearity
# > 30: Strong multicollinearity
# > 100: Severe multicollinearity
```

## Influence and Outlier Detection

### Leverage

High leverage points have extreme predictor values.

```python
from statsmodels.stats.outliers_influence import OLSInfluence

influence = results.get_influence()

# Hat values (leverage)
leverage = influence.hat_matrix_diag

# Rule of thumb: leverage > 2*p/n or 3*p/n is high
# p = number of parameters, n = sample size
threshold = 2 * len(results.params) / len(y)
high_leverage = np.where(leverage > threshold)[0]

print(f"High leverage observations: {high_leverage}")
```

### Cook's Distance

Measures overall influence of each observation.

```python
# Cook's distance
cooks_d = influence.cooks_distance[0]

# Rule of thumb: Cook's D > 4/n is influential
threshold = 4 / len(y)
influential = np.where(cooks_d > threshold)[0]

print(f"Influential observations (Cook's D): {influential}")

# Plot
import matplotlib.pyplot as plt
plt.stem(range(len(cooks_d)), cooks_d)
plt.axhline(y=threshold, color='r', linestyle='--', label=f'Threshold (4/n)')
plt.xlabel('Observation')
plt.ylabel("Cook's Distance")
plt.legend()
plt.show()
```

### DFFITS

Measures influence on fitted value.

```python
# DFFITS
dffits = influence.dffits[0]

# Rule of thumb: |DFFITS| > 2*sqrt(p/n) is influential
p = len(results.params)
n = len(y)
threshold = 2 * np.sqrt(p / n)

influential_dffits = np.where(np.abs(dffits) > threshold)[0]
print(f"Influential observations (DFFITS): {influential_dffits}")
```

### DFBETAs

Measures influence on each coefficient.

```python
# DFBETAs (one for each parameter)
dfbetas = influence.dfbetas

# Rule of thumb: |DFBETA| > 2/sqrt(n)
threshold = 2 / np.sqrt(n)

for i, param_name in enumerate(results.params.index):
    influential = np.where(np.abs(dfbetas[:, i]) > threshold)[0]
    if len(influential) > 0:
        print(f"Influential for {param_name}: {influential}")
```

### Influence Plot

```python
from statsmodels.graphics.regressionplots import influence_plot

fig, ax = plt.subplots(figsize=(12, 8))
influence_plot(results, ax=ax, criterion='cooks')
plt.show()

# Combines leverage, residuals, and Cook's distance
# Large bubbles = high Cook's distance
# Far from x=0 = high leverage
# Far from y=0 = large residual
```

### Studentized Residuals

```python
# Studentized residuals (outliers)
student_resid = influence.resid_studentized_internal

# External studentized residuals (more conservative)
student_resid_external = influence.resid_studentized_external

# Outliers: |studentized residual| > 3 (or > 2.5)
outliers = np.where(np.abs(student_resid_external) > 3)[0]
print(f"Outliers: {outliers}")
```

## Hypothesis Testing

### t-tests

**One-sample t-test**: Test if mean equals specific value

```python
from scipy import stats

# H0: population mean = mu_0
t_stat, p_value = stats.ttest_1samp(data, popmean=mu_0)

print(f"t-statistic: {t_stat:.4f}")
print(f"p-value: {p_value:.4f}")
```

**Two-sample t-test**: Compare means of two groups

```python
# H0: mean1 = mean2 (equal variances)
t_stat, p_value = stats.ttest_ind(group1, group2)

# Welch's t-test (unequal variances)
t_stat, p_value = stats.ttest_ind(group1, group2, equal_var=False)

print(f"t-statistic: {t_stat:.4f}")
print(f"p-value: {p_value:.4f}")
```

**Paired t-test**: Compare paired observations

```python
# H0: mean difference = 0
t_stat, p_value = stats.ttest_rel(before, after)

print(f"t-statistic: {t_stat:.4f}")
print(f"p-value: {p_value:.4f}")
```

### Proportion Tests

**One-proportion test**:

```python
from statsmodels.stats.proportion import proportions_ztest

# H0: proportion = p0
count = 45  # successes
nobs = 100  # total observations
p0 = 0.5    # hypothesized proportion

z_stat, p_value = proportions_ztest(count, nobs, value=p0)

print(f"z-statistic: {z_stat:.4f}")
print(f"p-value: {p_value:.4f}")
```

**Two-proportion test**:

```python
# H0: proportion1 = proportion2
counts = [45, 60]
nobs = [100, 120]

z_stat, p_value = proportions_ztest(counts, nobs)
print(f"z-statistic: {z_stat:.4f}")
print(f"p-value: {p_value:.4f}")
```

### Chi-square Tests

**Chi-square test of independence**:

```python
from scipy.stats import chi2_contingency

# Contingency table
contingency_table = pd.crosstab(variable1, variable2)

chi2, p_value, dof, expected = chi2_contingency(contingency_table)

print(f"Chi-square statistic: {chi2:.4f}")
print(f"p-value: {p_value:.4f}")
print(f"Degrees of freedom: {dof}")

# H0: Variables are independent
```

**Chi-square goodness-of-fit**:

```python
from scipy.stats import chisquare

# Observed frequencies
observed = [20, 30, 25, 25]

# Expected frequencies (equal by default)
expected = [25, 25, 25, 25]

chi2, p_value = chisquare(observed, expected)

print(f"Chi-square statistic: {chi2:.4f}")
print(f"p-value: {p_value:.4f}")

# H0: Data follow the expected distribution
```

### Non-parametric Tests

**Mann-Whitney U test** (independent samples):

```python
from scipy.stats import mannwhitneyu

# H0: Distributions are equal
u_stat, p_value = mannwhitneyu(group1, group2, alternative='two-sided')

print(f"U statistic: {u_stat:.4f}")
print(f"p-value: {p_value:.4f}")
```

**Wilcoxon signed-rank test** (paired samples):

```python
from scipy.stats import wilcoxon

# H0: Median difference = 0
w_stat, p_value = wilcoxon(before, after)

print(f"W statistic: {w_stat:.4f}")
print(f"p-value: {p_value:.4f}")
```

**Kruskal-Wallis H test** (>2 groups):

```python
from scipy.stats import kruskal

# H0: All groups have same distribution
h_stat, p_value = kruskal(group1, group2, group3)

print(f"H statistic: {h_stat:.4f}")
print(f"p-value: {p_value:.4f}")
```

**Sign test**:

```python
from statsmodels.stats.descriptivestats import sign_test

# H0: Median = m0
result = sign_test(data, m0=0)
print(result)
```

### ANOVA

**One-way ANOVA**:

```python
from scipy.stats import f_oneway

# H0: All group means are equal
f_stat, p_value = f_oneway(group1, group2, group3)

print(f"F-statistic: {f_stat:.4f}")
print(f"p-value: {p_value:.4f}")
```

**Two-way ANOVA** (with statsmodels):

```python
from statsmodels.formula.api import ols
from statsmodels.stats.anova import anova_lm

# Fit model
model = ols('response ~ C(factor1) + C(factor2) + C(factor1):C(factor2)',
            data=df).fit()

# ANOVA table
anova_table = anova_lm(model, typ=2)
print(anova_table)
```

**Repeated measures ANOVA**:

```python
from statsmodels.stats.anova import AnovaRM

# Requires long-format data
aovrm = AnovaRM(df, depvar='score', subject='subject_id', within=['time'])
results = aovrm.fit()

print(results.summary())
```

## Multiple Comparisons

### Post-hoc Tests

**Tukey's HSD** (Honest Significant Difference):

```python
from statsmodels.stats.multicomp import pairwise_tukeyhsd

# Perform Tukey HSD test
tukey = pairwise_tukeyhsd(data, groups, alpha=0.05)

print(tukey.summary())

# Plot confidence intervals
tukey.plot_simultaneous()
plt.show()
```

**Bonferroni correction**:

```python
from statsmodels.stats.multitest import multipletests

# P-values from multiple tests
p_values = [0.01, 0.03, 0.04, 0.15, 0.001]

# Apply correction
reject, pvals_corrected, alphac_sidak, alphac_bonf = multipletests(
    p_values,
    alpha=0.05,
    method='bonferroni'
)

print("Rejected:", reject)
print("Corrected p-values:", pvals_corrected)
```

**False Discovery Rate (FDR)**:

```python
# FDR correction (less conservative than Bonferroni)
reject, pvals_corrected, alphac_sidak, alphac_bonf = multipletests(
    p_values,
    alpha=0.05,
    method='fdr_bh'  # Benjamini-Hochberg
)

print("Rejected:", reject)
print("Corrected p-values:", pvals_corrected)
```

## Robust Covariance Matrices

### Heteroskedasticity-Consistent (HC) Standard Errors

```python
# After fitting OLS
results = sm.OLS(y, X).fit()

# HC0 (White's heteroskedasticity-consistent SEs)
results_hc0 = results.get_robustcov_results(cov_type='HC0')

# HC1 (degrees of freedom adjustment)
results_hc1 = results.get_robustcov_results(cov_type='HC1')

# HC2 (leverage adjustment)
results_hc2 = results.get_robustcov_results(cov_type='HC2')

# HC3 (most conservative, recommended for small samples)
results_hc3 = results.get_robustcov_results(cov_type='HC3')

print("Standard OLS SEs:", results.bse)
print("Robust HC3 SEs:", results_hc3.bse)
```

### HAC (Heteroskedasticity and Autocorrelation Consistent)

**Newey-West standard errors**:

```python
# For time series with autocorrelation and heteroskedasticity
results_hac = results.get_robustcov_results(cov_type='HAC', maxlags=4)

print("HAC (Newey-West) SEs:", results_hac.bse)
print(results_hac.summary())
```

### Cluster-Robust Standard Errors

```python
# For clustered/grouped data
results_cluster = results.get_robustcov_results(
    cov_type='cluster',
    groups=cluster_ids
)

print("Cluster-robust SEs:", results_cluster.bse)
```

## Descriptive Statistics

**Basic descriptive statistics**:

```python
from statsmodels.stats.api import DescrStatsW

# Comprehensive descriptive stats
desc = DescrStatsW(data)

print("Mean:", desc.mean)
print("Std Dev:", desc.std)
print("Variance:", desc.var)
print("Confidence interval:", desc.tconfint_mean())

# Quantiles
print("Median:", desc.quantile(0.5))
print("IQR:", desc.quantile([0.25, 0.75]))
```

**Weighted statistics**:

```python
# With weights
desc_weighted = DescrStatsW(data, weights=weights)

print("Weighted mean:", desc_weighted.mean)
print("Weighted std:", desc_weighted.std)
```

**Compare two groups**:

```python
from statsmodels.stats.weightstats import CompareMeans

# Create comparison object
cm = CompareMeans(DescrStatsW(group1), DescrStatsW(group2))

# t-test
print("t-test:", cm.ttest_ind())

# Confidence interval for difference
print("CI for difference:", cm.tconfint_diff())

# Test for equal variances
print("Equal variance test:", cm.test_equal_var())
```

## Power Analysis and Sample Size

**Power for t-test**:

```python
from statsmodels.stats.power import tt_ind_solve_power

# Solve for sample size
effect_size = 0.5  # Cohen's d
alpha = 0.05
power = 0.8

n = tt_ind_solve_power(effect_size=effect_size,
                        alpha=alpha,
                        power=power,
                        alternative='two-sided')

print(f"Required sample size per group: {n:.0f}")

# Solve for power given n
power = tt_ind_solve_power(effect_size=0.5,
                           nobs1=50,
                           alpha=0.05,
                           alternative='two-sided')

print(f"Power: {power:.4f}")
```

**Power for proportion test**:

```python
from statsmodels.stats.power import zt_ind_solve_power

# For proportion tests (z-test)
effect_size = 0.3  # Difference in proportions
alpha = 0.05
power = 0.8

n = zt_ind_solve_power(effect_size=effect_size,
                        alpha=alpha,
                        power=power,
                        alternative='two-sided')

print(f"Required sample size per group: {n:.0f}")
```

**Power curves**:

```python
from statsmodels.stats.power import TTestIndPower
import matplotlib.pyplot as plt

# Create power analysis object
analysis = TTestIndPower()

# Plot power curves for different sample sizes
sample_sizes = range(10, 200, 10)
effect_sizes = [0.2, 0.5, 0.8]  # Small, medium, large

fig, ax = plt.subplots(figsize=(10, 6))

for es in effect_sizes:
    power = [analysis.solve_power(effect_size=es, nobs1=n, alpha=0.05)
             for n in sample_sizes]
    ax.plot(sample_sizes, power, label=f'Effect size = {es}')

ax.axhline(y=0.8, color='r', linestyle='--', label='Power = 0.8')
ax.set_xlabel('Sample size per group')
ax.set_ylabel('Power')
ax.set_title('Power Curves for Two-Sample t-test')
ax.legend()
ax.grid(True, alpha=0.3)
plt.show()
```

## Effect Sizes

**Cohen's d** (standardized mean difference):

```python
def cohens_d(group1, group2):
    \"\"\"Calculate Cohen's d for independent samples\"\"\"
    n1, n2 = len(group1), len(group2)
    var1, var2 = np.var(group1, ddof=1), np.var(group2, ddof=1)

    # Pooled standard deviation
    pooled_std = np.sqrt(((n1-1)*var1 + (n2-1)*var2) / (n1+n2-2))

    # Cohen's d
    d = (np.mean(group1) - np.mean(group2)) / pooled_std

    return d

d = cohens_d(group1, group2)
print(f"Cohen's d: {d:.4f}")

# Interpretation:
# |d| < 0.2: negligible
# |d| ~ 0.2: small
# |d| ~ 0.5: medium
# |d| ~ 0.8: large
```

**Eta-squared** (for ANOVA):

```python
# From ANOVA table
# η² = SS_between / SS_total

def eta_squared(anova_table):
    return anova_table['sum_sq'][0] / anova_table['sum_sq'].sum()

# After running ANOVA
eta_sq = eta_squared(anova_table)
print(f"Eta-squared: {eta_sq:.4f}")

# Interpretation:
# 0.01: small effect
# 0.06: medium effect
# 0.14: large effect
```

## Contingency Tables and Association

**McNemar's test** (paired binary data):

```python
from statsmodels.stats.contingency_tables import mcnemar

# 2x2 contingency table
table = [[a, b],
         [c, d]]

result = mcnemar(table, exact=True)  # or exact=False for large samples
print(f"p-value: {result.pvalue:.4f}")

# H0: Marginal probabilities are equal
```

**Cochran-Mantel-Haenszel test**:

```python
from statsmodels.stats.contingency_tables import StratifiedTable

# For stratified 2x2 tables
strat_table = StratifiedTable(tables_list)
result = strat_table.test_null_odds()

print(f"p-value: {result.pvalue:.4f}")
```

## Treatment Effects and Causal Inference

**Propensity score matching**:

```python
from statsmodels.treatment import propensity_score

# Estimate propensity scores
ps_model = sm.Logit(treatment, X).fit()
propensity_scores = ps_model.predict(X)

# Use for matching or weighting
# (manual implementation of matching needed)
```

**Difference-in-differences**:

```python
# Did formula: outcome ~ treatment * post
model = ols('outcome ~ treatment + post + treatment:post', data=df).fit()

# DiD estimate is the interaction coefficient
did_estimate = model.params['treatment:post']
print(f"DiD estimate: {did_estimate:.4f}")
```

## Best Practices

1. **Always check assumptions**: Test before interpreting results
2. **Report effect sizes**: Not just p-values
3. **Use appropriate tests**: Match test to data type and distribution
4. **Correct for multiple comparisons**: When conducting many tests
5. **Check sample size**: Ensure adequate power
6. **Visual inspection**: Plot data before testing
7. **Report confidence intervals**: Along with point estimates
8. **Consider alternatives**: Non-parametric when assumptions violated
9. **Robust standard errors**: Use when heteroskedasticity/autocorrelation present
10. **Document decisions**: Note which tests used and why

## Common Pitfalls

1. **Not checking test assumptions**: May invalidate results
2. **Multiple testing without correction**: Inflated Type I error
3. **Using parametric tests on non-normal data**: Consider non-parametric
4. **Ignoring heteroskedasticity**: Use robust SEs
5. **Confusing statistical and practical significance**: Check effect sizes
6. **Not reporting confidence intervals**: Only p-values insufficient
7. **Using wrong test**: Match test to research question
8. **Insufficient power**: Risk of Type II error (false negatives)
9. **p-hacking**: Testing many specifications until significant
10. **Overinterpreting p-values**: Remember limitations of NHST
