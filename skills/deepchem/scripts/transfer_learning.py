#!/usr/bin/env python3
"""
Transfer Learning Script for DeepChem

Use pretrained models (ChemBERTa, GROVER, MolFormer) for molecular property prediction
with transfer learning. Particularly useful for small datasets.

Usage:
    python transfer_learning.py --model chemberta --data my_data.csv --target activity
    python transfer_learning.py --model grover --dataset bbbp
"""

import argparse
import deepchem as dc
import sys


PRETRAINED_MODELS = {
    'chemberta': {
        'name': 'ChemBERTa',
        'description': 'BERT pretrained on 77M molecules from ZINC15',
        'model_id': 'seyonec/ChemBERTa-zinc-base-v1'
    },
    'grover': {
        'name': 'GROVER',
        'description': 'Graph transformer pretrained on 10M molecules',
        'model_id': None  # GROVER uses its own loading mechanism
    },
    'molformer': {
        'name': 'MolFormer',
        'description': 'Transformer pretrained on molecular structures',
        'model_id': 'ibm/MoLFormer-XL-both-10pct'
    }
}


def train_chemberta(train_dataset, valid_dataset, test_dataset, task_type='classification', n_tasks=1, n_epochs=10):
    """
    Fine-tune ChemBERTa on a dataset.

    Args:
        train_dataset: Training dataset
        valid_dataset: Validation dataset
        test_dataset: Test dataset
        task_type: 'classification' or 'regression'
        n_tasks: Number of prediction tasks
        n_epochs: Number of fine-tuning epochs

    Returns:
        Trained model and evaluation results
    """
    print("=" * 70)
    print("Fine-tuning ChemBERTa")
    print("=" * 70)
    print("\nChemBERTa is a BERT model pretrained on 77M molecules from ZINC15.")
    print("It uses SMILES strings as input and has learned rich molecular")
    print("representations that transfer well to downstream tasks.")

    print(f"\nLoading pretrained ChemBERTa model...")
    model = dc.models.HuggingFaceModel(
        model=PRETRAINED_MODELS['chemberta']['model_id'],
        task=task_type,
        n_tasks=n_tasks,
        batch_size=32,
        learning_rate=2e-5  # Lower LR for fine-tuning
    )

    print(f"\nFine-tuning for {n_epochs} epochs...")
    print("(This may take a while on the first run as the model is downloaded)")
    model.fit(train_dataset, nb_epoch=n_epochs)
    print("Fine-tuning complete!")

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

    results = {}
    for name, dataset in [('Train', train_dataset), ('Valid', valid_dataset), ('Test', test_dataset)]:
        print(f"\n{name} Set:")
        scores = model.evaluate(dataset, metrics)
        results[name] = scores
        for metric_name, score in scores.items():
            print(f"  {metric_name}: {score:.4f}")

    return model, results


def train_grover(train_dataset, test_dataset, task_type='classification', n_tasks=1, n_epochs=20):
    """
    Fine-tune GROVER on a dataset.

    Args:
        train_dataset: Training dataset
        test_dataset: Test dataset
        task_type: 'classification' or 'regression'
        n_tasks: Number of prediction tasks
        n_epochs: Number of fine-tuning epochs

    Returns:
        Trained model and evaluation results
    """
    print("=" * 70)
    print("Fine-tuning GROVER")
    print("=" * 70)
    print("\nGROVER is a graph transformer pretrained on 10M molecules using")
    print("self-supervised learning. It learns both node and graph-level")
    print("representations through masked atom/bond prediction tasks.")

    print(f"\nCreating GROVER model...")
    model = dc.models.GroverModel(
        task=task_type,
        n_tasks=n_tasks,
        model_dir='./grover_pretrained'
    )

    print(f"\nFine-tuning for {n_epochs} epochs...")
    model.fit(train_dataset, nb_epoch=n_epochs)
    print("Fine-tuning complete!")

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

    results = {}
    for name, dataset in [('Train', train_dataset), ('Test', test_dataset)]:
        print(f"\n{name} Set:")
        scores = model.evaluate(dataset, metrics)
        results[name] = scores
        for metric_name, score in scores.items():
            print(f"  {metric_name}: {score:.4f}")

    return model, results


def load_molnet_dataset(dataset_name, model_type):
    """
    Load a MoleculeNet dataset with appropriate featurization.

    Args:
        dataset_name: Name of MoleculeNet dataset
        model_type: Type of pretrained model being used

    Returns:
        tasks, train/valid/test datasets, transformers
    """
    # Map of MoleculeNet datasets
    molnet_datasets = {
        'tox21': dc.molnet.load_tox21,
        'bbbp': dc.molnet.load_bbbp,
        'bace': dc.molnet.load_bace_classification,
        'hiv': dc.molnet.load_hiv,
        'delaney': dc.molnet.load_delaney,
        'freesolv': dc.molnet.load_freesolv,
        'lipo': dc.molnet.load_lipo
    }

    if dataset_name not in molnet_datasets:
        raise ValueError(f"Unknown dataset: {dataset_name}")

    # ChemBERTa and MolFormer use raw SMILES
    if model_type in ['chemberta', 'molformer']:
        featurizer = 'Raw'
    # GROVER needs graph features
    elif model_type == 'grover':
        featurizer = 'GraphConv'
    else:
        featurizer = 'ECFP'

    print(f"\nLoading {dataset_name} dataset...")
    load_func = molnet_datasets[dataset_name]
    tasks, datasets, transformers = load_func(
        featurizer=featurizer,
        splitter='scaffold'
    )

    return tasks, datasets, transformers


def load_custom_dataset(data_path, target_cols, smiles_col, model_type):
    """
    Load a custom CSV dataset.

    Args:
        data_path: Path to CSV file
        target_cols: List of target column names
        smiles_col: Name of SMILES column
        model_type: Type of pretrained model being used

    Returns:
        train, valid, test datasets
    """
    print(f"\nLoading custom data from {data_path}...")

    # Choose featurizer based on model
    if model_type in ['chemberta', 'molformer']:
        featurizer = dc.feat.DummyFeaturizer()  # Models handle featurization
    elif model_type == 'grover':
        featurizer = dc.feat.MolGraphConvFeaturizer()
    else:
        featurizer = dc.feat.CircularFingerprint()

    loader = dc.data.CSVLoader(
        tasks=target_cols,
        feature_field=smiles_col,
        featurizer=featurizer
    )
    dataset = loader.create_dataset(data_path)

    print(f"Loaded {len(dataset)} molecules")

    # Split data
    print("Splitting data with scaffold splitter...")
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

    return train, valid, test


def main():
    parser = argparse.ArgumentParser(
        description='Transfer learning for molecular property prediction'
    )
    parser.add_argument(
        '--model',
        type=str,
        choices=list(PRETRAINED_MODELS.keys()),
        required=True,
        help='Pretrained model to use'
    )
    parser.add_argument(
        '--dataset',
        type=str,
        choices=['tox21', 'bbbp', 'bace', 'hiv', 'delaney', 'freesolv', 'lipo'],
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
        '--target',
        nargs='+',
        default=['target'],
        help='Target column name(s) for custom data'
    )
    parser.add_argument(
        '--smiles-col',
        type=str,
        default='smiles',
        help='SMILES column name for custom data'
    )
    parser.add_argument(
        '--task-type',
        type=str,
        choices=['classification', 'regression'],
        default='classification',
        help='Type of prediction task'
    )
    parser.add_argument(
        '--epochs',
        type=int,
        default=10,
        help='Number of fine-tuning epochs'
    )

    args = parser.parse_args()

    # Validate arguments
    if args.dataset is None and args.data is None:
        print("Error: Must specify either --dataset or --data", file=sys.stderr)
        return 1

    if args.dataset and args.data:
        print("Error: Cannot specify both --dataset and --data", file=sys.stderr)
        return 1

    # Print model info
    model_info = PRETRAINED_MODELS[args.model]
    print("\n" + "=" * 70)
    print(f"Transfer Learning with {model_info['name']}")
    print("=" * 70)
    print(f"\n{model_info['description']}")

    try:
        # Load dataset
        if args.dataset:
            tasks, datasets, transformers = load_molnet_dataset(args.dataset, args.model)
            train, valid, test = datasets
            task_type = 'classification' if args.dataset in ['tox21', 'bbbp', 'bace', 'hiv'] else 'regression'
            n_tasks = len(tasks)
        else:
            train, valid, test = load_custom_dataset(
                args.data,
                args.target,
                args.smiles_col,
                args.model
            )
            task_type = args.task_type
            n_tasks = len(args.target)

        # Train model
        if args.model == 'chemberta':
            model, results = train_chemberta(
                train, valid, test,
                task_type=task_type,
                n_tasks=n_tasks,
                n_epochs=args.epochs
            )
        elif args.model == 'grover':
            model, results = train_grover(
                train, test,
                task_type=task_type,
                n_tasks=n_tasks,
                n_epochs=args.epochs
            )
        else:
            print(f"Error: Model {args.model} not yet implemented", file=sys.stderr)
            return 1

        print("\n" + "=" * 70)
        print("Transfer Learning Complete!")
        print("=" * 70)
        print("\nTip: Pretrained models often work best with:")
        print("  - Small datasets (< 1000 samples)")
        print("  - Lower learning rates (1e-5 to 5e-5)")
        print("  - Fewer epochs (5-20)")
        print("  - Avoiding overfitting through early stopping")

        return 0

    except Exception as e:
        print(f"\nError: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    sys.exit(main())
