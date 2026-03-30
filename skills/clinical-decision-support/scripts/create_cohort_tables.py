#!/usr/bin/env python3
"""
Generate Clinical Cohort Tables for Baseline Characteristics and Outcomes

Creates publication-ready tables with:
- Baseline demographics (Table 1 style)
- Efficacy outcomes
- Safety/adverse events
- Statistical comparisons between groups

Dependencies: pandas, numpy, scipy
"""

import pandas as pd
import numpy as np
from scipy import stats
from pathlib import Path
import argparse


def calculate_p_value(data, variable, group_col='group', var_type='categorical'):
    """
    Calculate appropriate p-value for group comparison.
    
    Parameters:
        data: DataFrame
        variable: Column name to compare
        group_col: Grouping variable
        var_type: 'categorical', 'continuous_normal', 'continuous_nonnormal'
    
    Returns:
        p-value (float)
    """
    
    groups = data[group_col].unique()
    
    if len(groups) != 2:
        return np.nan  # Only handle 2-group comparisons
    
    group1_data = data[data[group_col] == groups[0]][variable].dropna()
    group2_data = data[data[group_col] == groups[1]][variable].dropna()
    
    if var_type == 'categorical':
        # Chi-square or Fisher's exact test
        contingency = pd.crosstab(data[variable], data[group_col])
        
        # Check if Fisher's exact is needed (expected count < 5)
        if contingency.min().min() < 5:
            # Fisher's exact (2x2 only)
            if contingency.shape == (2, 2):
                _, p_value = stats.fisher_exact(contingency)
            else:
                # Use chi-square but note limitation
                _, p_value, _, _ = stats.chi2_contingency(contingency)
        else:
            _, p_value, _, _ = stats.chi2_contingency(contingency)
    
    elif var_type == 'continuous_normal':
        # Independent t-test
        _, p_value = stats.ttest_ind(group1_data, group2_data, equal_var=False)
    
    elif var_type == 'continuous_nonnormal':
        # Mann-Whitney U test
        _, p_value = stats.mannwhitneyu(group1_data, group2_data, alternative='two-sided')
    
    else:
        raise ValueError("var_type must be 'categorical', 'continuous_normal', or 'continuous_nonnormal'")
    
    return p_value


def format_continuous_variable(data, variable, group_col, distribution='normal'):
    """
    Format continuous variable for table display.
    
    Returns:
        Dictionary with formatted strings for each group and p-value
    """
    
    groups = data[group_col].unique()
    results = {}
    
    for group in groups:
        group_data = data[data[group_col] == group][variable].dropna()
        
        if distribution == 'normal':
            # Mean ± SD
            mean = group_data.mean()
            std = group_data.std()
            results[group] = f"{mean:.1f} ± {std:.1f}"
        else:
            # Median [IQR]
            median = group_data.median()
            q1 = group_data.quantile(0.25)
            q3 = group_data.quantile(0.75)
            results[group] = f"{median:.1f} [{q1:.1f}-{q3:.1f}]"
    
    # Calculate p-value
    var_type = 'continuous_normal' if distribution == 'normal' else 'continuous_nonnormal'
    p_value = calculate_p_value(data, variable, group_col, var_type)
    results['p_value'] = f"{p_value:.3f}" if p_value < 0.001 else f"{p_value:.2f}" if p_value < 1.0 else "—"
    
    return results


def format_categorical_variable(data, variable, group_col):
    """
    Format categorical variable for table display.
    
    Returns:
        List of dictionaries for each category with counts and percentages
    """
    
    groups = data[group_col].unique()
    categories = data[variable].dropna().unique()
    
    results = []
    
    for category in categories:
        row = {'category': category}
        
        for group in groups:
            group_data = data[data[group_col] == group]
            count = (group_data[variable] == category).sum()
            total = group_data[variable].notna().sum()
            percentage = (count / total * 100) if total > 0 else 0
            row[group] = f"{count} ({percentage:.0f}%)"
        
        results.append(row)
    
    # Calculate p-value for overall categorical variable
    p_value = calculate_p_value(data, variable, group_col, 'categorical')
    results[0]['p_value'] = f"{p_value:.3f}" if p_value < 0.001 else f"{p_value:.2f}" if p_value < 1.0 else "—"
    
    return results


def generate_baseline_table(data, group_col='group', output_file='table1_baseline.csv'):
    """
    Generate Table 1: Baseline characteristics.
    
    Customize the variables list for your specific cohort.
    """
    
    groups = data[group_col].unique()
    
    # Initialize results list
    table_rows = []
    
    # Header row
    header = {
        'Characteristic': 'Characteristic',
        **{group: f"{group} (n={len(data[data[group_col]==group])})" for group in groups},
        'p_value': 'p-value'
    }
    table_rows.append(header)
    
    # Age (continuous)
    if 'age' in data.columns:
        age_results = format_continuous_variable(data, 'age', group_col, distribution='nonnormal')
        row = {'Characteristic': 'Age, years (median [IQR])'}
        for group in groups:
            row[group] = age_results[group]
        row['p_value'] = age_results['p_value']
        table_rows.append(row)
    
    # Sex (categorical)
    if 'sex' in data.columns:
        table_rows.append({'Characteristic': 'Sex, n (%)', **{g: '' for g in groups}, 'p_value': ''})
        sex_results = format_categorical_variable(data, 'sex', group_col)
        for sex_row in sex_results:
            row = {'Characteristic': f"  {sex_row['category']}"}
            for group in groups:
                row[group] = sex_row[group]
            row['p_value'] = sex_row.get('p_value', '')
            table_rows.append(row)
    
    # ECOG Performance Status (categorical)
    if 'ecog_ps' in data.columns:
        table_rows.append({'Characteristic': 'ECOG PS, n (%)', **{g: '' for g in groups}, 'p_value': ''})
        ecog_results = format_categorical_variable(data, 'ecog_ps', group_col)
        for ecog_row in ecog_results:
            row = {'Characteristic': f"  {ecog_row['category']}"}
            for group in groups:
                row[group] = ecog_row[group]
            row['p_value'] = ecog_row.get('p_value', '')
            table_rows.append(row)
    
    # Convert to DataFrame and save
    df_table = pd.DataFrame(table_rows)
    df_table.to_csv(output_file, index=False)
    print(f"Baseline characteristics table saved to: {output_file}")
    
    return df_table


def generate_efficacy_table(data, group_col='group', output_file='table2_efficacy.csv'):
    """
    Generate efficacy outcomes table.
    
    Expected columns:
    - best_response: CR, PR, SD, PD
    - Additional binary outcomes (response, disease_control, etc.)
    """
    
    groups = data[group_col].unique()
    table_rows = []
    
    # Header
    header = {
        'Outcome': 'Outcome',
        **{group: f"{group} (n={len(data[data[group_col]==group])})" for group in groups},
        'p_value': 'p-value'
    }
    table_rows.append(header)
    
    # Objective Response Rate (ORR = CR + PR)
    if 'best_response' in data.columns:
        for group in groups:
            group_data = data[data[group_col] == group]
            cr_pr = ((group_data['best_response'] == 'CR') | (group_data['best_response'] == 'PR')).sum()
            total = len(group_data)
            orr = cr_pr / total * 100
            
            # Calculate exact binomial CI (Clopper-Pearson)
            ci_lower, ci_upper = _binomial_ci(cr_pr, total)
            
            if group == groups[0]:
                orr_row = {'Outcome': 'ORR, n (%) [95% CI]'}
            
            orr_row[group] = f"{cr_pr} ({orr:.0f}%) [{ci_lower:.0f}-{ci_upper:.0f}]"
        
        # P-value for ORR difference
        contingency = pd.crosstab(
            data['best_response'].isin(['CR', 'PR']),
            data[group_col]
        )
        _, p_value, _, _ = stats.chi2_contingency(contingency)
        orr_row['p_value'] = f"{p_value:.3f}" if p_value >= 0.001 else "<0.001"
        table_rows.append(orr_row)
        
        # Individual response categories
        for response in ['CR', 'PR', 'SD', 'PD']:
            row = {'Outcome': f"  {response}"}
            for group in groups:
                group_data = data[data[group_col] == group]
                count = (group_data['best_response'] == response).sum()
                total = len(group_data)
                pct = count / total * 100
                row[group] = f"{count} ({pct:.0f}%)"
            row['p_value'] = ''
            table_rows.append(row)
    
    # Disease Control Rate (DCR = CR + PR + SD)
    if 'best_response' in data.columns:
        dcr_row = {'Outcome': 'DCR, n (%) [95% CI]'}
        for group in groups:
            group_data = data[data[group_col] == group]
            dcr_count = group_data['best_response'].isin(['CR', 'PR', 'SD']).sum()
            total = len(group_data)
            dcr = dcr_count / total * 100
            ci_lower, ci_upper = _binomial_ci(dcr_count, total)
            dcr_row[group] = f"{dcr_count} ({dcr:.0f}%) [{ci_lower:.0f}-{ci_upper:.0f}]"
        
        # P-value
        contingency = pd.crosstab(
            data['best_response'].isin(['CR', 'PR', 'SD']),
            data[group_col]
        )
        _, p_value, _, _ = stats.chi2_contingency(contingency)
        dcr_row['p_value'] = f"{p_value:.3f}" if p_value >= 0.001 else "<0.001"
        table_rows.append(dcr_row)
    
    # Save table
    df_table = pd.DataFrame(table_rows)
    df_table.to_csv(output_file, index=False)
    print(f"Efficacy table saved to: {output_file}")
    
    return df_table


def generate_safety_table(data, ae_columns, group_col='group', output_file='table3_safety.csv'):
    """
    Generate adverse events table.
    
    Parameters:
        data: DataFrame with AE data
        ae_columns: List of AE column names (each should have values 0-5 for CTCAE grades)
        group_col: Grouping variable
        output_file: Output CSV path
    """
    
    groups = data[group_col].unique()
    table_rows = []
    
    # Header
    header = {
        'Adverse Event': 'Adverse Event',
        **{f'{group}_any': f'Any Grade' for group in groups},
        **{f'{group}_g34': f'Grade 3-4' for group in groups}
    }
    
    for ae in ae_columns:
        if ae not in data.columns:
            continue
        
        row = {'Adverse Event': ae.replace('_', ' ').title()}
        
        for group in groups:
            group_data = data[data[group_col] == group][ae].dropna()
            total = len(group_data)
            
            # Any grade (Grade 1-5)
            any_grade = (group_data > 0).sum()
            any_pct = any_grade / total * 100 if total > 0 else 0
            row[f'{group}_any'] = f"{any_grade} ({any_pct:.0f}%)"
            
            # Grade 3-4
            grade_34 = (group_data >= 3).sum()
            g34_pct = grade_34 / total * 100 if total > 0 else 0
            row[f'{group}_g34'] = f"{grade_34} ({g34_pct:.0f}%)"
        
        table_rows.append(row)
    
    # Save table
    df_table = pd.DataFrame(table_rows)
    df_table.to_csv(output_file, index=False)
    print(f"Safety table saved to: {output_file}")
    
    return df_table


def generate_latex_table(df, caption, label='table'):
    """
    Convert DataFrame to LaTeX table code.
    
    Returns:
        String with LaTeX table code
    """
    
    latex_code = "\\begin{table}[H]\n"
    latex_code += "\\centering\n"
    latex_code += "\\small\n"
    latex_code += "\\begin{tabular}{" + "l" * len(df.columns) + "}\n"
    latex_code += "\\toprule\n"
    
    # Header
    header_row = " & ".join([f"\\textbf{{{col}}}" for col in df.columns])
    latex_code += header_row + " \\\\\n"
    latex_code += "\\midrule\n"
    
    # Data rows
    for _, row in df.iterrows():
        # Handle indentation for subcategories (lines starting with spaces)
        first_col = str(row.iloc[0])
        if first_col.startswith('  '):
            first_col = '\\quad ' + first_col.strip()
        
        data_row = [first_col] + [str(val) if pd.notna(val) else '—' for val in row.iloc[1:]]
        latex_code += " & ".join(data_row) + " \\\\\n"
    
    latex_code += "\\bottomrule\n"
    latex_code += "\\end{tabular}\n"
    latex_code += f"\\caption{{{caption}}}\n"
    latex_code += f"\\label{{tab:{label}}}\n"
    latex_code += "\\end{table}\n"
    
    return latex_code


def _binomial_ci(successes, trials, confidence=0.95):
    """
    Calculate exact binomial confidence interval (Clopper-Pearson method).
    
    Returns:
        Lower and upper bounds as percentages
    """
    
    if trials == 0:
        return 0.0, 0.0
    
    alpha = 1 - confidence
    
    # Use beta distribution
    from scipy.stats import beta
    
    if successes == 0:
        lower = 0.0
    else:
        lower = beta.ppf(alpha/2, successes, trials - successes + 1)
    
    if successes == trials:
        upper = 1.0
    else:
        upper = beta.ppf(1 - alpha/2, successes + 1, trials - successes)
    
    return lower * 100, upper * 100


def create_example_data():
    """Create example dataset for testing."""
    
    np.random.seed(42)
    n = 100
    
    data = pd.DataFrame({
        'patient_id': [f'PT{i:03d}' for i in range(1, n+1)],
        'group': np.random.choice(['Biomarker+', 'Biomarker-'], n),
        'age': np.random.normal(62, 10, n),
        'sex': np.random.choice(['Male', 'Female'], n),
        'ecog_ps': np.random.choice(['0-1', '2'], n, p=[0.8, 0.2]),
        'stage': np.random.choice(['III', 'IV'], n, p=[0.3, 0.7]),
        'best_response': np.random.choice(['CR', 'PR', 'SD', 'PD'], n, p=[0.05, 0.35, 0.40, 0.20]),
        'fatigue_grade': np.random.choice([0, 1, 2, 3], n, p=[0.3, 0.4, 0.2, 0.1]),
        'nausea_grade': np.random.choice([0, 1, 2, 3], n, p=[0.4, 0.35, 0.20, 0.05]),
        'neutropenia_grade': np.random.choice([0, 1, 2, 3, 4], n, p=[0.5, 0.2, 0.15, 0.10, 0.05]),
    })
    
    return data


def main():
    parser = argparse.ArgumentParser(description='Generate clinical cohort tables')
    parser.add_argument('input_file', type=str, nargs='?', default=None,
                       help='CSV file with cohort data (if not provided, uses example data)')
    parser.add_argument('-o', '--output-dir', type=str, default='tables',
                       help='Output directory (default: tables)')
    parser.add_argument('--group-col', type=str, default='group',
                       help='Column name for grouping variable')
    parser.add_argument('--example', action='store_true',
                       help='Generate tables using example data')
    
    args = parser.parse_args()
    
    # Create output directory
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Load or create data
    if args.example or args.input_file is None:
        print("Generating example dataset...")
        data = create_example_data()
    else:
        print(f"Loading data from {args.input_file}...")
        data = pd.read_csv(args.input_file)
    
    print(f"Dataset: {len(data)} patients, {len(data[args.group_col].unique())} groups")
    print(f"Groups: {data[args.group_col].value_counts().to_dict()}")
    
    # Generate Table 1: Baseline characteristics
    print("\nGenerating baseline characteristics table...")
    baseline_table = generate_baseline_table(
        data, 
        group_col=args.group_col,
        output_file=output_dir / 'table1_baseline.csv'
    )
    
    # Generate LaTeX code for baseline table
    latex_code = generate_latex_table(
        baseline_table,
        caption="Baseline patient demographics and clinical characteristics",
        label="baseline"
    )
    with open(output_dir / 'table1_baseline.tex', 'w') as f:
        f.write(latex_code)
    print(f"LaTeX code saved to: {output_dir}/table1_baseline.tex")
    
    # Generate Table 2: Efficacy outcomes
    if 'best_response' in data.columns:
        print("\nGenerating efficacy outcomes table...")
        efficacy_table = generate_efficacy_table(
            data,
            group_col=args.group_col,
            output_file=output_dir / 'table2_efficacy.csv'
        )
        
        latex_code = generate_latex_table(
            efficacy_table,
            caption="Treatment efficacy outcomes by group",
            label="efficacy"
        )
        with open(output_dir / 'table2_efficacy.tex', 'w') as f:
            f.write(latex_code)
    
    # Generate Table 3: Safety (identify AE columns)
    ae_columns = [col for col in data.columns if col.endswith('_grade')]
    if ae_columns:
        print("\nGenerating safety table...")
        safety_table = generate_safety_table(
            data,
            ae_columns=ae_columns,
            group_col=args.group_col,
            output_file=output_dir / 'table3_safety.csv'
        )
        
        latex_code = generate_latex_table(
            safety_table,
            caption="Treatment-emergent adverse events by group (CTCAE v5.0)",
            label="safety"
        )
        with open(output_dir / 'table3_safety.tex', 'w') as f:
            f.write(latex_code)
    
    print(f"\nAll tables generated successfully in {output_dir}/")
    print("Files created:")
    print("  - table1_baseline.csv / .tex")
    print("  - table2_efficacy.csv / .tex (if response data available)")
    print("  - table3_safety.csv / .tex (if AE data available)")


if __name__ == '__main__':
    main()


# Example usage:
# python create_cohort_tables.py cohort_data.csv -o tables/
# python create_cohort_tables.py --example  # Generate example tables
#
# Input CSV format:
# patient_id,group,age,sex,ecog_ps,stage,best_response,fatigue_grade,nausea_grade,...
# PT001,Biomarker+,65,Male,0-1,IV,PR,1,0,...
# PT002,Biomarker-,58,Female,0-1,III,SD,2,1,...
# ...

