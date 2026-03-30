#!/usr/bin/env python3
"""
Biomarker-Based Patient Stratification and Classification

Performs patient stratification based on biomarker profiles with:
- Binary classification (biomarker+/-)
- Multi-class molecular subtypes
- Continuous biomarker scoring
- Correlation with clinical outcomes

Dependencies: pandas, numpy, scipy, scikit-learn (optional for clustering)
"""

import pandas as pd
import numpy as np
from scipy import stats
import argparse
from pathlib import Path


def classify_binary_biomarker(data, biomarker_col, threshold, 
                              above_label='Biomarker+', below_label='Biomarker-'):
    """
    Binary classification based on biomarker threshold.
    
    Parameters:
        data: DataFrame
        biomarker_col: Column name for biomarker values
        threshold: Cut-point value
        above_label: Label for values >= threshold
        below_label: Label for values < threshold
    
    Returns:
        DataFrame with added 'biomarker_class' column
    """
    
    data = data.copy()
    data['biomarker_class'] = data[biomarker_col].apply(
        lambda x: above_label if x >= threshold else below_label
    )
    
    return data


def classify_pd_l1_tps(data, pd_l1_col='pd_l1_tps'):
    """
    Classify PD-L1 Tumor Proportion Score into clinical categories.
    
    Categories:
    - Negative: <1%
    - Low: 1-49%
    - High: >=50%
    
    Returns:
        DataFrame with 'pd_l1_category' column
    """
    
    data = data.copy()
    
    def categorize(tps):
        if tps < 1:
            return 'PD-L1 Negative (<1%)'
        elif tps < 50:
            return 'PD-L1 Low (1-49%)'
        else:
            return 'PD-L1 High (≥50%)'
    
    data['pd_l1_category'] = data[pd_l1_col].apply(categorize)
    
    # Distribution
    print("\nPD-L1 TPS Distribution:")
    print(data['pd_l1_category'].value_counts())
    
    return data


def classify_her2_status(data, ihc_col='her2_ihc', fish_col='her2_fish'):
    """
    Classify HER2 status based on IHC and FISH results (ASCO/CAP guidelines).
    
    IHC Scores: 0, 1+, 2+, 3+
    FISH: Positive, Negative (if IHC 2+)
    
    Classification:
    - HER2-positive: IHC 3+ OR IHC 2+/FISH+
    - HER2-negative: IHC 0/1+ OR IHC 2+/FISH-
    - HER2-low: IHC 1+ or IHC 2+/FISH- (subset of HER2-negative)
    
    Returns:
        DataFrame with 'her2_status' and 'her2_low' columns
    """
    
    data = data.copy()
    
    def classify_her2(row):
        ihc = row[ihc_col]
        fish = row.get(fish_col, None)
        
        if ihc == '3+':
            status = 'HER2-positive'
            her2_low = False
        elif ihc == '2+':
            if fish == 'Positive':
                status = 'HER2-positive'
                her2_low = False
            elif fish == 'Negative':
                status = 'HER2-negative'
                her2_low = True  # HER2-low
            else:
                status = 'HER2-equivocal (FISH needed)'
                her2_low = False
        elif ihc == '1+':
            status = 'HER2-negative'
            her2_low = True  # HER2-low
        else:  # IHC 0
            status = 'HER2-negative'
            her2_low = False
        
        return pd.Series({'her2_status': status, 'her2_low': her2_low})
    
    data[['her2_status', 'her2_low']] = data.apply(classify_her2, axis=1)
    
    print("\nHER2 Status Distribution:")
    print(data['her2_status'].value_counts())
    print(f"\nHER2-low (IHC 1+ or 2+/FISH-): {data['her2_low'].sum()} patients")
    
    return data


def classify_breast_cancer_subtype(data, er_col='er_positive', pr_col='pr_positive', 
                                   her2_col='her2_positive'):
    """
    Classify breast cancer into molecular subtypes.
    
    Subtypes:
    - HR+/HER2-: Luminal (ER+ and/or PR+, HER2-)
    - HER2+: Any HER2-positive (regardless of HR status)
    - Triple-negative: ER-, PR-, HER2-
    
    Returns:
        DataFrame with 'bc_subtype' column
    """
    
    data = data.copy()
    
    def get_subtype(row):
        er = row[er_col]
        pr = row[pr_col]
        her2 = row[her2_col]
        
        if her2:
            if er or pr:
                return 'HR+/HER2+ (Luminal B HER2+)'
            else:
                return 'HR-/HER2+ (HER2-enriched)'
        elif er or pr:
            return 'HR+/HER2- (Luminal)'
        else:
            return 'Triple-Negative'
    
    data['bc_subtype'] = data.apply(get_subtype, axis=1)
    
    print("\nBreast Cancer Subtype Distribution:")
    print(data['bc_subtype'].value_counts())
    
    return data


def correlate_biomarker_outcome(data, biomarker_col, outcome_col, biomarker_type='binary'):
    """
    Assess correlation between biomarker and clinical outcome.
    
    Parameters:
        biomarker_col: Biomarker variable
        outcome_col: Outcome variable  
        biomarker_type: 'binary', 'categorical', 'continuous'
    
    Returns:
        Statistical test results
    """
    
    print(f"\nCorrelation Analysis: {biomarker_col} vs {outcome_col}")
    print("="*60)
    
    # Remove missing data
    analysis_data = data[[biomarker_col, outcome_col]].dropna()
    
    if biomarker_type == 'binary' or biomarker_type == 'categorical':
        # Cross-tabulation
        contingency = pd.crosstab(analysis_data[biomarker_col], analysis_data[outcome_col])
        print("\nContingency Table:")
        print(contingency)
        
        # Chi-square test
        chi2, p_value, dof, expected = stats.chi2_contingency(contingency)
        
        print(f"\nChi-square test:")
        print(f"  χ² = {chi2:.2f}, df = {dof}, p = {p_value:.4f}")
        
        # Odds ratio if 2x2 table
        if contingency.shape == (2, 2):
            a, b = contingency.iloc[0, :]
            c, d = contingency.iloc[1, :]
            or_value = (a * d) / (b * c) if b * c > 0 else np.inf
            
            # Confidence interval for OR (log method)
            log_or = np.log(or_value)
            se_log_or = np.sqrt(1/a + 1/b + 1/c + 1/d)
            ci_lower = np.exp(log_or - 1.96 * se_log_or)
            ci_upper = np.exp(log_or + 1.96 * se_log_or)
            
            print(f"\nOdds Ratio: {or_value:.2f} (95% CI {ci_lower:.2f}-{ci_upper:.2f})")
    
    elif biomarker_type == 'continuous':
        # Correlation coefficient
        r, p_value = stats.pearsonr(analysis_data[biomarker_col], analysis_data[outcome_col])
        
        print(f"\nPearson correlation:")
        print(f"  r = {r:.3f}, p = {p_value:.4f}")
        
        # Also report Spearman for robustness
        rho, p_spearman = stats.spearmanr(analysis_data[biomarker_col], analysis_data[outcome_col])
        print(f"Spearman correlation:")
        print(f"  ρ = {rho:.3f}, p = {p_spearman:.4f}")
    
    return p_value


def stratify_cohort_report(data, stratification_var, output_dir='stratification_report'):
    """
    Generate comprehensive stratification report.
    
    Parameters:
        data: DataFrame with patient data
        stratification_var: Column name for stratification
        output_dir: Output directory for reports
    """
    
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"\nCOHORT STRATIFICATION REPORT")
    print("="*60)
    print(f"Stratification Variable: {stratification_var}")
    print(f"Total Patients: {len(data)}")
    
    # Group distribution
    distribution = data[stratification_var].value_counts()
    print(f"\nGroup Distribution:")
    for group, count in distribution.items():
        pct = count / len(data) * 100
        print(f"  {group}: {count} ({pct:.1f}%)")
    
    # Save distribution
    distribution.to_csv(output_dir / 'group_distribution.csv')
    
    # Compare baseline characteristics across groups
    print(f"\nBaseline Characteristics by {stratification_var}:")
    
    results = []
    
    # Continuous variables
    continuous_vars = data.select_dtypes(include=[np.number]).columns.tolist()
    continuous_vars = [v for v in continuous_vars if v != stratification_var]
    
    for var in continuous_vars[:5]:  # Limit to first 5 for demo
        print(f"\n{var}:")
        for group in distribution.index:
            group_data = data[data[stratification_var] == group][var].dropna()
            print(f"  {group}: median {group_data.median():.1f} [IQR {group_data.quantile(0.25):.1f}-{group_data.quantile(0.75):.1f}]")
        
        # Statistical test
        if len(distribution) == 2:
            groups_list = distribution.index.tolist()
            g1 = data[data[stratification_var] == groups_list[0]][var].dropna()
            g2 = data[data[stratification_var] == groups_list[1]][var].dropna()
            _, p_value = stats.mannwhitneyu(g1, g2, alternative='two-sided')
            print(f"  p-value: {p_value:.4f}")
            
            results.append({
                'Variable': var,
                'Test': 'Mann-Whitney U',
                'p_value': p_value,
                'Significant': 'Yes' if p_value < 0.05 else 'No'
            })
    
    # Save results
    if results:
        df_results = pd.DataFrame(results)
        df_results.to_csv(output_dir / 'statistical_comparisons.csv', index=False)
        print(f"\nStatistical comparison results saved to: {output_dir}/statistical_comparisons.csv")
    
    print(f"\nStratification report complete! Files saved to {output_dir}/")


def main():
    parser = argparse.ArgumentParser(description='Biomarker-based patient classification')
    parser.add_argument('input_file', type=str, nargs='?', default=None,
                       help='CSV file with patient and biomarker data')
    parser.add_argument('-b', '--biomarker', type=str, default=None,
                       help='Biomarker column name for stratification')
    parser.add_argument('-t', '--threshold', type=float, default=None,
                       help='Threshold for binary classification')
    parser.add_argument('-o', '--output-dir', type=str, default='stratification',
                       help='Output directory')
    parser.add_argument('--example', action='store_true',
                       help='Run with example data')
    
    args = parser.parse_args()
    
    # Example data if requested
    if args.example or args.input_file is None:
        print("Generating example dataset...")
        np.random.seed(42)
        n = 80
        
        data = pd.DataFrame({
            'patient_id': [f'PT{i:03d}' for i in range(1, n+1)],
            'age': np.random.normal(62, 10, n),
            'sex': np.random.choice(['Male', 'Female'], n),
            'pd_l1_tps': np.random.exponential(20, n),  # Exponential distribution for PD-L1
            'tmb': np.random.exponential(8, n),  # Mutations per Mb
            'her2_ihc': np.random.choice(['0', '1+', '2+', '3+'], n, p=[0.6, 0.2, 0.15, 0.05]),
            'response': np.random.choice(['Yes', 'No'], n, p=[0.4, 0.6]),
        })
        
        # Simulate correlation: higher PD-L1 -> better response
        data.loc[data['pd_l1_tps'] >= 50, 'response'] = np.random.choice(['Yes', 'No'], 
                                                                         (data['pd_l1_tps'] >= 50).sum(),
                                                                         p=[0.65, 0.35])
    else:
        print(f"Loading data from {args.input_file}...")
        data = pd.read_csv(args.input_file)
    
    print(f"Dataset: {len(data)} patients")
    print(f"Columns: {list(data.columns)}")
    
    # PD-L1 classification example
    if 'pd_l1_tps' in data.columns or args.biomarker == 'pd_l1_tps':
        data = classify_pd_l1_tps(data, 'pd_l1_tps')
        
        # Correlate with response if available
        if 'response' in data.columns:
            correlate_biomarker_outcome(data, 'pd_l1_category', 'response', biomarker_type='categorical')
    
    # HER2 classification if columns present
    if 'her2_ihc' in data.columns:
        if 'her2_fish' not in data.columns:
            # Add placeholder FISH for IHC 2+
            data['her2_fish'] = np.nan
        data = classify_her2_status(data, 'her2_ihc', 'her2_fish')
    
    # Generic binary classification if threshold provided
    if args.biomarker and args.threshold is not None:
        print(f"\nBinary classification: {args.biomarker} with threshold {args.threshold}")
        data = classify_binary_biomarker(data, args.biomarker, args.threshold)
        print(data['biomarker_class'].value_counts())
    
    # Generate stratification report
    if args.biomarker:
        stratify_cohort_report(data, args.biomarker, output_dir=args.output_dir)
    elif 'pd_l1_category' in data.columns:
        stratify_cohort_report(data, 'pd_l1_category', output_dir=args.output_dir)
    
    # Save classified data
    output_path = Path(args.output_dir) / 'classified_data.csv'
    data.to_csv(output_path, index=False)
    print(f"\nClassified data saved to: {output_path}")


if __name__ == '__main__':
    main()


# Example usage:
# python biomarker_classifier.py data.csv -b pd_l1_tps -t 50 -o classification/
# python biomarker_classifier.py --example
#
# Input CSV format:
# patient_id,pd_l1_tps,tmb,her2_ihc,response,pfs_months,event
# PT001,55.5,12.3,1+,Yes,14.2,1
# PT002,8.2,5.1,0,No,6.5,1
# ...

