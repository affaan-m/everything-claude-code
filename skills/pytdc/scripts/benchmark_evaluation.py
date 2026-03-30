#!/usr/bin/env python3
"""
TDC Benchmark Group Evaluation Template

This script demonstrates how to use TDC benchmark groups for systematic
model evaluation following the required 5-seed protocol.

Usage:
    python benchmark_evaluation.py
"""

from tdc.benchmark_group import admet_group
from tdc import Evaluator
import numpy as np
import pandas as pd


def load_benchmark_group():
    """
    Load the ADMET benchmark group
    """
    print("=" * 60)
    print("Loading ADMET Benchmark Group")
    print("=" * 60)

    # Initialize benchmark group
    group = admet_group(path='data/')

    # Get available benchmarks
    print("\nAvailable benchmarks in ADMET group:")
    benchmark_names = group.dataset_names
    print(f"Total: {len(benchmark_names)} datasets")

    for i, name in enumerate(benchmark_names[:10], 1):
        print(f"  {i}. {name}")

    if len(benchmark_names) > 10:
        print(f"  ... and {len(benchmark_names) - 10} more")

    return group


def single_dataset_evaluation(group, dataset_name='Caco2_Wang'):
    """
    Example: Evaluate on a single dataset with 5-seed protocol
    """
    print("\n" + "=" * 60)
    print(f"Example 1: Single Dataset Evaluation ({dataset_name})")
    print("=" * 60)

    # Get dataset benchmarks
    benchmark = group.get(dataset_name)

    print(f"\nBenchmark structure:")
    print(f"  Seeds: {list(benchmark.keys())}")

    # Required: Evaluate with 5 different seeds
    predictions = {}

    for seed in [1, 2, 3, 4, 5]:
        print(f"\n--- Seed {seed} ---")

        # Get train/valid data for this seed
        train = benchmark[seed]['train']
        valid = benchmark[seed]['valid']

        print(f"Train size: {len(train)}")
        print(f"Valid size: {len(valid)}")

        # TODO: Replace with your model training
        # model = YourModel()
        # model.fit(train['Drug'], train['Y'])

        # For demonstration, create dummy predictions
        # Replace with: predictions[seed] = model.predict(benchmark[seed]['test'])
        test = benchmark[seed]['test']
        y_true = test['Y'].values

        # Simulate predictions (add controlled noise)
        np.random.seed(seed)
        y_pred = y_true + np.random.normal(0, 0.3, len(y_true))

        predictions[seed] = y_pred

        # Evaluate this seed
        evaluator = Evaluator(name='MAE')
        score = evaluator(y_true, y_pred)
        print(f"MAE for seed {seed}: {score:.4f}")

    # Evaluate across all seeds
    print("\n--- Overall Evaluation ---")
    results = group.evaluate(predictions)

    print(f"\nResults for {dataset_name}:")
    mean_score, std_score = results[dataset_name]
    print(f"  Mean MAE: {mean_score:.4f}")
    print(f"  Std MAE: {std_score:.4f}")

    return predictions, results


def multiple_datasets_evaluation(group):
    """
    Example: Evaluate on multiple datasets
    """
    print("\n" + "=" * 60)
    print("Example 2: Multiple Datasets Evaluation")
    print("=" * 60)

    # Select a subset of datasets for demonstration
    selected_datasets = ['Caco2_Wang', 'HIA_Hou', 'Bioavailability_Ma']

    all_predictions = {}
    all_results = {}

    for dataset_name in selected_datasets:
        print(f"\n{'='*40}")
        print(f"Evaluating: {dataset_name}")
        print(f"{'='*40}")

        benchmark = group.get(dataset_name)
        predictions = {}

        # Train and predict for each seed
        for seed in [1, 2, 3, 4, 5]:
            train = benchmark[seed]['train']
            test = benchmark[seed]['test']

            # TODO: Replace with your model
            # model = YourModel()
            # model.fit(train['Drug'], train['Y'])
            # predictions[seed] = model.predict(test['Drug'])

            # Dummy predictions for demonstration
            np.random.seed(seed)
            y_true = test['Y'].values
            y_pred = y_true + np.random.normal(0, 0.3, len(y_true))
            predictions[seed] = y_pred

        all_predictions[dataset_name] = predictions

        # Evaluate this dataset
        results = group.evaluate({dataset_name: predictions})
        all_results[dataset_name] = results[dataset_name]

        mean_score, std_score = results[dataset_name]
        print(f"  {dataset_name}: {mean_score:.4f} ± {std_score:.4f}")

    # Summary
    print("\n" + "=" * 60)
    print("Summary of Results")
    print("=" * 60)

    results_df = pd.DataFrame([
        {
            'Dataset': name,
            'Mean MAE': f"{mean:.4f}",
            'Std MAE': f"{std:.4f}"
        }
        for name, (mean, std) in all_results.items()
    ])

    print(results_df.to_string(index=False))

    return all_predictions, all_results


def custom_model_template():
    """
    Template for integrating your own model with TDC benchmarks
    """
    print("\n" + "=" * 60)
    print("Example 3: Custom Model Template")
    print("=" * 60)

    code_template = '''
# Template for using your own model with TDC benchmarks

from tdc.benchmark_group import admet_group
from your_library import YourModel  # Replace with your model

# Initialize benchmark group
group = admet_group(path='data/')
benchmark = group.get('Caco2_Wang')

predictions = {}

for seed in [1, 2, 3, 4, 5]:
    # Get data for this seed
    train = benchmark[seed]['train']
    valid = benchmark[seed]['valid']
    test = benchmark[seed]['test']

    # Extract features and labels
    X_train, y_train = train['Drug'], train['Y']
    X_valid, y_valid = valid['Drug'], valid['Y']
    X_test = test['Drug']

    # Initialize and train model
    model = YourModel(random_state=seed)
    model.fit(X_train, y_train)

    # Optionally use validation set for early stopping
    # model.fit(X_train, y_train, validation_data=(X_valid, y_valid))

    # Make predictions on test set
    predictions[seed] = model.predict(X_test)

# Evaluate with TDC
results = group.evaluate(predictions)
print(f"Results: {results}")
'''

    print("\nCustom Model Integration Template:")
    print("=" * 60)
    print(code_template)

    return code_template


def multi_seed_statistics(predictions_dict):
    """
    Example: Analyzing multi-seed prediction statistics
    """
    print("\n" + "=" * 60)
    print("Example 4: Multi-Seed Statistics Analysis")
    print("=" * 60)

    # Analyze prediction variability across seeds
    all_preds = np.array([predictions_dict[seed] for seed in [1, 2, 3, 4, 5]])

    print("\nPrediction statistics across 5 seeds:")
    print(f"  Shape: {all_preds.shape}")
    print(f"  Mean prediction: {all_preds.mean():.4f}")
    print(f"  Std across seeds: {all_preds.std(axis=0).mean():.4f}")
    print(f"  Min prediction: {all_preds.min():.4f}")
    print(f"  Max prediction: {all_preds.max():.4f}")

    # Per-sample variance
    per_sample_std = all_preds.std(axis=0)
    print(f"\nPer-sample prediction std:")
    print(f"  Mean: {per_sample_std.mean():.4f}")
    print(f"  Median: {np.median(per_sample_std):.4f}")
    print(f"  Max: {per_sample_std.max():.4f}")


def leaderboard_submission_guide():
    """
    Guide for submitting to TDC leaderboards
    """
    print("\n" + "=" * 60)
    print("Example 5: Leaderboard Submission Guide")
    print("=" * 60)

    guide = """
To submit results to TDC leaderboards:

1. Evaluate your model following the 5-seed protocol:
   - Use seeds [1, 2, 3, 4, 5] exactly as provided
   - Do not modify the train/valid/test splits
   - Report mean ± std across all 5 seeds

2. Format your results:
   results = group.evaluate(predictions)
   # Returns: {'dataset_name': [mean_score, std_score]}

3. Submit to leaderboard:
   - Visit: https://tdcommons.ai/benchmark/admet_group/
   - Click on your dataset of interest
   - Submit your results with:
     * Model name and description
     * Mean score ± standard deviation
     * Reference to paper/code (if available)

4. Best practices:
   - Report all datasets in the benchmark group
   - Include model hyperparameters
   - Share code for reproducibility
   - Compare against baseline models

5. Evaluation metrics:
   - ADMET Group uses MAE by default
   - Other groups may use different metrics
   - Check benchmark-specific requirements
"""

    print(guide)


def main():
    """
    Main function to run all benchmark evaluation examples
    """
    print("\n" + "=" * 60)
    print("TDC Benchmark Group Evaluation Examples")
    print("=" * 60)

    # Load benchmark group
    group = load_benchmark_group()

    # Example 1: Single dataset evaluation
    predictions, results = single_dataset_evaluation(group)

    # Example 2: Multiple datasets evaluation
    all_predictions, all_results = multiple_datasets_evaluation(group)

    # Example 3: Custom model template
    custom_model_template()

    # Example 4: Multi-seed statistics
    multi_seed_statistics(predictions)

    # Example 5: Leaderboard submission guide
    leaderboard_submission_guide()

    print("\n" + "=" * 60)
    print("Benchmark evaluation examples completed!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Replace dummy predictions with your model")
    print("2. Run full evaluation on all benchmark datasets")
    print("3. Submit results to TDC leaderboard")
    print("=" * 60)


if __name__ == "__main__":
    main()
