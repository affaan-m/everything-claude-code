#!/usr/bin/env python3
"""
TDC Data Loading and Splitting Template

This script demonstrates how to load TDC datasets and apply different
splitting strategies for model training and evaluation.

Usage:
    python load_and_split_data.py
"""

from tdc.single_pred import ADME
from tdc.multi_pred import DTI
from tdc import Evaluator
import pandas as pd


def load_single_pred_example():
    """
    Example: Loading and splitting a single-prediction dataset (ADME)
    """
    print("=" * 60)
    print("Example 1: Single-Prediction Task (ADME)")
    print("=" * 60)

    # Load Caco2 dataset (intestinal permeability)
    print("\nLoading Caco2_Wang dataset...")
    data = ADME(name='Caco2_Wang')

    # Get basic dataset info
    print(f"\nDataset size: {len(data.get_data())} molecules")
    data.print_stats()

    # Method 1: Scaffold split (default, recommended)
    print("\n--- Scaffold Split ---")
    split = data.get_split(method='scaffold', seed=42, frac=[0.7, 0.1, 0.2])

    train = split['train']
    valid = split['valid']
    test = split['test']

    print(f"Train: {len(train)} molecules")
    print(f"Valid: {len(valid)} molecules")
    print(f"Test: {len(test)} molecules")

    # Display sample data
    print("\nSample training data:")
    print(train.head(3))

    # Method 2: Random split
    print("\n--- Random Split ---")
    split_random = data.get_split(method='random', seed=42, frac=[0.8, 0.1, 0.1])
    print(f"Train: {len(split_random['train'])} molecules")
    print(f"Valid: {len(split_random['valid'])} molecules")
    print(f"Test: {len(split_random['test'])} molecules")

    return split


def load_multi_pred_example():
    """
    Example: Loading and splitting a multi-prediction dataset (DTI)
    """
    print("\n" + "=" * 60)
    print("Example 2: Multi-Prediction Task (DTI)")
    print("=" * 60)

    # Load BindingDB Kd dataset (drug-target interactions)
    print("\nLoading BindingDB_Kd dataset...")
    data = DTI(name='BindingDB_Kd')

    # Get basic dataset info
    full_data = data.get_data()
    print(f"\nDataset size: {len(full_data)} drug-target pairs")
    print(f"Unique drugs: {full_data['Drug_ID'].nunique()}")
    print(f"Unique targets: {full_data['Target_ID'].nunique()}")

    # Method 1: Random split
    print("\n--- Random Split ---")
    split_random = data.get_split(method='random', seed=42)
    print(f"Train: {len(split_random['train'])} pairs")
    print(f"Valid: {len(split_random['valid'])} pairs")
    print(f"Test: {len(split_random['test'])} pairs")

    # Method 2: Cold drug split (unseen drugs in test)
    print("\n--- Cold Drug Split ---")
    split_cold_drug = data.get_split(method='cold_drug', seed=42)

    train = split_cold_drug['train']
    test = split_cold_drug['test']

    # Verify no drug overlap
    train_drugs = set(train['Drug_ID'])
    test_drugs = set(test['Drug_ID'])
    overlap = train_drugs & test_drugs

    print(f"Train: {len(train)} pairs, {len(train_drugs)} unique drugs")
    print(f"Test: {len(test)} pairs, {len(test_drugs)} unique drugs")
    print(f"Drug overlap: {len(overlap)} (should be 0)")

    # Method 3: Cold target split (unseen targets in test)
    print("\n--- Cold Target Split ---")
    split_cold_target = data.get_split(method='cold_target', seed=42)

    train = split_cold_target['train']
    test = split_cold_target['test']

    train_targets = set(train['Target_ID'])
    test_targets = set(test['Target_ID'])
    overlap = train_targets & test_targets

    print(f"Train: {len(train)} pairs, {len(train_targets)} unique targets")
    print(f"Test: {len(test)} pairs, {len(test_targets)} unique targets")
    print(f"Target overlap: {len(overlap)} (should be 0)")

    # Display sample data
    print("\nSample DTI data:")
    print(full_data.head(3))

    return split_cold_drug


def evaluation_example(split):
    """
    Example: Evaluating model predictions with TDC evaluators
    """
    print("\n" + "=" * 60)
    print("Example 3: Model Evaluation")
    print("=" * 60)

    test = split['test']

    # For demonstration, create dummy predictions
    # In practice, replace with your model's predictions
    import numpy as np
    np.random.seed(42)

    # Simulate predictions (replace with model.predict(test['Drug']))
    y_true = test['Y'].values
    y_pred = y_true + np.random.normal(0, 0.5, len(y_true))  # Add noise

    # Evaluate with different metrics
    print("\nEvaluating predictions...")

    # Regression metrics
    mae_evaluator = Evaluator(name='MAE')
    mae = mae_evaluator(y_true, y_pred)
    print(f"MAE: {mae:.4f}")

    rmse_evaluator = Evaluator(name='RMSE')
    rmse = rmse_evaluator(y_true, y_pred)
    print(f"RMSE: {rmse:.4f}")

    r2_evaluator = Evaluator(name='R2')
    r2 = r2_evaluator(y_true, y_pred)
    print(f"R²: {r2:.4f}")

    spearman_evaluator = Evaluator(name='Spearman')
    spearman = spearman_evaluator(y_true, y_pred)
    print(f"Spearman: {spearman:.4f}")


def custom_split_example():
    """
    Example: Creating custom splits with different fractions
    """
    print("\n" + "=" * 60)
    print("Example 4: Custom Split Fractions")
    print("=" * 60)

    data = ADME(name='HIA_Hou')

    # Custom split fractions
    custom_fracs = [
        ([0.6, 0.2, 0.2], "60/20/20 split"),
        ([0.8, 0.1, 0.1], "80/10/10 split"),
        ([0.7, 0.15, 0.15], "70/15/15 split")
    ]

    for frac, description in custom_fracs:
        split = data.get_split(method='scaffold', seed=42, frac=frac)
        print(f"\n{description}:")
        print(f"  Train: {len(split['train'])} ({frac[0]*100:.0f}%)")
        print(f"  Valid: {len(split['valid'])} ({frac[1]*100:.0f}%)")
        print(f"  Test: {len(split['test'])} ({frac[2]*100:.0f}%)")


def main():
    """
    Main function to run all examples
    """
    print("\n" + "=" * 60)
    print("TDC Data Loading and Splitting Examples")
    print("=" * 60)

    # Example 1: Single prediction with scaffold split
    split = load_single_pred_example()

    # Example 2: Multi prediction with cold splits
    dti_split = load_multi_pred_example()

    # Example 3: Model evaluation
    evaluation_example(split)

    # Example 4: Custom split fractions
    custom_split_example()

    print("\n" + "=" * 60)
    print("Examples completed!")
    print("=" * 60)


if __name__ == "__main__":
    main()
