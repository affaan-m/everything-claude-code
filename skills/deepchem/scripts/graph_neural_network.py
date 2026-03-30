#!/usr/bin/env python3
"""
Graph Neural Network Training Script

This script demonstrates training Graph Convolutional Networks (GCNs) and other
graph-based models for molecular property prediction.

Usage:
    python graph_neural_network.py --dataset tox21 --model gcn
    python graph_neural_network.py --dataset bbbp --model attentivefp
    python graph_neural_network.py --data custom.csv --task-type regression
"""

import argparse
import deepchem as dc
import sys


AVAILABLE_MODELS = {
    'gcn': 'Graph Convolutional Network',
    'gat': 'Graph Attention Network',
    'attentivefp': 'Attentive Fingerprint',
    'mpnn': 'Message Passing Neural Network',
    'dmpnn': 'Directed Message Passing Neural Network'
}

MOLNET_DATASETS = {
    'tox21': ('classification', 12),
    'bbbp': ('classification', 1),
    'bace': ('classification', 1),
    'hiv': ('classification', 1),
    'delaney': ('regression', 1),
    'freesolv': ('regression', 1),
    'lipo': ('regression', 1)
}


def create_model(model_type, n_tasks, mode='classification'):
    """
    Create a graph neural network model.

    Args:
        model_type: Type of model ('gcn', 'gat', 'attentivefp', etc.)
        n_tasks: Number of prediction tasks
        mode: 'classification' or 'regression'

    Returns:
        DeepChem model
    """
    if model_type == 'gcn':
        return dc.models.GCNModel(
            n_tasks=n_tasks,
            mode=mode,
            batch_size=128,
            learning_rate=0.001,
            dropout=0.0
        )
    elif model_type == 'gat':
        return dc.models.GATModel(
            n_tasks=n_tasks,
            mode=mode,
            batch_size=128,
            learning_rate=0.001
        )
    elif model_type == 'attentivefp':
        return dc.models.AttentiveFPModel(
            n_tasks=n_tasks,
            mode=mode,
            batch_size=128,
            learning_rate=0.001
        )
    elif model_type == 'mpnn':
        return dc.models.MPNNModel(
            n_tasks=n_tasks,
            mode=mode,
            batch_size=128,
            learning_rate=0.001
        )
    elif model_type == 'dmpnn':
        return dc.models.DMPNNModel(
            n_tasks=n_tasks,
            mode=mode,
            batch_size=128,
            learning_rate=0.001
        )
    else:
        raise ValueError(f"Unknown model type: {model_type}")


def train_on_molnet(dataset_name, model_type, n_epochs=50):
    """
    Train a graph neural network on a MoleculeNet benchmark dataset.

    Args:
        dataset_name: Name of MoleculeNet dataset
        model_type: Type of model to train
        n_epochs: Number of training epochs

    Returns:
        Trained model and test scores
    """
    print("=" * 70)
    print(f"Training {AVAILABLE_MODELS[model_type]} on {dataset_name.upper()}")
    print("=" * 70)

    # Get dataset info
    task_type, n_tasks_default = MOLNET_DATASETS[dataset_name]

    # Load dataset with graph featurization
    print(f"\nLoading {dataset_name} dataset with GraphConv featurizer...")
    load_func = getattr(dc.molnet, f'load_{dataset_name}')
    tasks, datasets, transformers = load_func(
        featurizer='GraphConv',
        splitter='scaffold'
    )
    train, valid, test = datasets

    n_tasks = len(tasks)
    print(f"\nDataset Information:")
    print(f"  Task type: {task_type}")
    print(f"  Number of tasks: {n_tasks}")
    print(f"  Training samples: {len(train)}")
    print(f"  Validation samples: {len(valid)}")
    print(f"  Test samples: {len(test)}")

    # Create model
    print(f"\nCreating {AVAILABLE_MODELS[model_type]} model...")
    model = create_model(model_type, n_tasks, mode=task_type)

    # Train
    print(f"\nTraining for {n_epochs} epochs...")
    model.fit(train, nb_epoch=n_epochs)
    print("Training complete!")

    # Evaluate
    print("\n" + "=" * 70)
    print("Model Evaluation")
    print("=" * 70)

    if task_type == 'classification':
        metrics = [
            dc.metrics.Metric(dc.metrics.roc_auc_score, name='ROC-AUC'),
            dc.metrics.Metric(dc.metrics.accuracy_score, name='Accuracy'),
            dc.metrics.Metric(dc.metrics.f1_score, name='F1'),
        ]
    else:
        metrics = [
            dc.metrics.Metric(dc.metrics.r2_score, name='R²'),
            dc.metrics.Metric(dc.metrics.mean_absolute_error, name='MAE'),
            dc.metrics.Metric(dc.metrics.root_mean_squared_error, name='RMSE'),
        ]

    results = {}
    for dataset_name_eval, dataset in [('Train', train), ('Valid', valid), ('Test', test)]:
        print(f"\n{dataset_name_eval} Set:")
        scores = model.evaluate(dataset, metrics)
        results[dataset_name_eval] = scores
        for metric_name, score in scores.items():
            print(f"  {metric_name}: {score:.4f}")

    return model, results


def train_on_custom_data(data_path, model_type, task_type, target_cols, smiles_col='smiles', n_epochs=50):
    """
    Train a graph neural network on custom CSV data.

    Args:
        data_path: Path to CSV file
        model_type: Type of model to train
        task_type: 'classification' or 'regression'
        target_cols: List of target column names
        smiles_col: Name of SMILES column
        n_epochs: Number of training epochs

    Returns:
        Trained model and test dataset
    """
    print("=" * 70)
    print(f"Training {AVAILABLE_MODELS[model_type]} on Custom Data")
    print("=" * 70)

    # Load and featurize data
    print(f"\nLoading data from {data_path}...")
    featurizer = dc.feat.MolGraphConvFeaturizer()
    loader = dc.data.CSVLoader(
        tasks=target_cols,
        feature_field=smiles_col,
        featurizer=featurizer
    )
    dataset = loader.create_dataset(data_path)

    print(f"Loaded {len(dataset)} molecules")

    # Split data
    print("\nSplitting data with scaffold splitter...")
    splitter = dc.splits.ScaffoldSplitter()
    train, valid, test = splitter.train_valid_test_split(
        dataset,
        frac_train=0.8,
        frac_valid=0.1,
        frac_test=0.1
    )

    print(f"  Training: {len(train)}")
    print(f"  Validation: {len(valid)}")
    print(f"  Test: {len(test)}")

    # Create model
    print(f"\nCreating {AVAILABLE_MODELS[model_type]} model...")
    n_tasks = len(target_cols)
    model = create_model(model_type, n_tasks, mode=task_type)

    # Train
    print(f"\nTraining for {n_epochs} epochs...")
    model.fit(train, nb_epoch=n_epochs)
    print("Training complete!")

    # Evaluate
    print("\n" + "=" * 70)
    print("Model Evaluation")
    print("=" * 70)

    if task_type == 'classification':
        metrics = [
            dc.metrics.Metric(dc.metrics.roc_auc_score, name='ROC-AUC'),
            dc.metrics.Metric(dc.metrics.accuracy_score, name='Accuracy'),
        ]
    else:
        metrics = [
            dc.metrics.Metric(dc.metrics.r2_score, name='R²'),
            dc.metrics.Metric(dc.metrics.mean_absolute_error, name='MAE'),
        ]

    for dataset_name, dataset in [('Train', train), ('Valid', valid), ('Test', test)]:
        print(f"\n{dataset_name} Set:")
        scores = model.evaluate(dataset, metrics)
        for metric_name, score in scores.items():
            print(f"  {metric_name}: {score:.4f}")

    return model, test


def main():
    parser = argparse.ArgumentParser(
        description='Train graph neural networks for molecular property prediction'
    )
    parser.add_argument(
        '--model',
        type=str,
        choices=list(AVAILABLE_MODELS.keys()),
        default='gcn',
        help='Type of graph neural network model'
    )
    parser.add_argument(
        '--dataset',
        type=str,
        choices=list(MOLNET_DATASETS.keys()),
        default=None,
        help='MoleculeNet dataset to use'
    )
    parser.add_argument(
        '--data',
        type=str,
        default=None,
        help='Path to custom CSV file'
    )
    parser.add_argument(
        '--task-type',
        type=str,
        choices=['classification', 'regression'],
        default='classification',
        help='Type of prediction task (for custom data)'
    )
    parser.add_argument(
        '--targets',
        nargs='+',
        default=['target'],
        help='Names of target columns (for custom data)'
    )
    parser.add_argument(
        '--smiles-col',
        type=str,
        default='smiles',
        help='Name of SMILES column'
    )
    parser.add_argument(
        '--epochs',
        type=int,
        default=50,
        help='Number of training epochs'
    )

    args = parser.parse_args()

    # Validate arguments
    if args.dataset is None and args.data is None:
        print("Error: Must specify either --dataset (MoleculeNet) or --data (custom CSV)",
              file=sys.stderr)
        return 1

    if args.dataset and args.data:
        print("Error: Cannot specify both --dataset and --data",
              file=sys.stderr)
        return 1

    # Train model
    try:
        if args.dataset:
            model, results = train_on_molnet(
                args.dataset,
                args.model,
                n_epochs=args.epochs
            )
        else:
            model, test_set = train_on_custom_data(
                args.data,
                args.model,
                args.task_type,
                args.targets,
                smiles_col=args.smiles_col,
                n_epochs=args.epochs
            )

        print("\n" + "=" * 70)
        print("Training Complete!")
        print("=" * 70)
        return 0

    except Exception as e:
        print(f"\nError: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    sys.exit(main())
