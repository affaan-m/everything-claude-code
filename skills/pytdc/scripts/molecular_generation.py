#!/usr/bin/env python3
"""
TDC Molecular Generation with Oracles Template

This script demonstrates how to use TDC oracles for molecular generation
tasks including goal-directed generation and distribution learning.

Usage:
    python molecular_generation.py
"""

from tdc.generation import MolGen
from tdc import Oracle
import numpy as np


def load_generation_dataset():
    """
    Load molecular generation dataset
    """
    print("=" * 60)
    print("Loading Molecular Generation Dataset")
    print("=" * 60)

    # Load ChEMBL dataset
    data = MolGen(name='ChEMBL_V29')

    # Get training molecules
    split = data.get_split()
    train_smiles = split['train']['Drug'].tolist()

    print(f"\nDataset: ChEMBL_V29")
    print(f"Training molecules: {len(train_smiles)}")

    # Display sample molecules
    print("\nSample SMILES:")
    for i, smiles in enumerate(train_smiles[:5], 1):
        print(f"  {i}. {smiles}")

    return train_smiles


def single_oracle_example():
    """
    Example: Using a single oracle for molecular evaluation
    """
    print("\n" + "=" * 60)
    print("Example 1: Single Oracle Evaluation")
    print("=" * 60)

    # Initialize oracle for GSK3B target
    oracle = Oracle(name='GSK3B')

    # Test molecules
    test_molecules = [
        'CC(C)Cc1ccc(cc1)C(C)C(O)=O',  # Ibuprofen
        'CC(=O)Oc1ccccc1C(=O)O',        # Aspirin
        'Cn1c(=O)c2c(ncn2C)n(C)c1=O',   # Caffeine
        'CN1C=NC2=C1C(=O)N(C(=O)N2C)C'  # Theophylline
    ]

    print("\nEvaluating molecules with GSK3B oracle:")
    print("-" * 60)

    for smiles in test_molecules:
        score = oracle(smiles)
        print(f"SMILES: {smiles}")
        print(f"GSK3B score: {score:.4f}\n")


def multiple_oracles_example():
    """
    Example: Using multiple oracles for multi-objective optimization
    """
    print("\n" + "=" * 60)
    print("Example 2: Multiple Oracles (Multi-Objective)")
    print("=" * 60)

    # Initialize multiple oracles
    oracles = {
        'QED': Oracle(name='QED'),        # Drug-likeness
        'SA': Oracle(name='SA'),          # Synthetic accessibility
        'GSK3B': Oracle(name='GSK3B'),    # Target binding
        'LogP': Oracle(name='LogP')       # Lipophilicity
    }

    # Test molecule
    test_smiles = 'CC(C)Cc1ccc(cc1)C(C)C(O)=O'

    print(f"\nEvaluating: {test_smiles}")
    print("-" * 60)

    scores = {}
    for name, oracle in oracles.items():
        score = oracle(test_smiles)
        scores[name] = score
        print(f"{name:10s}: {score:.4f}")

    # Multi-objective score (weighted combination)
    print("\n--- Multi-Objective Scoring ---")

    # Invert SA (lower is better, so we invert for maximization)
    sa_score = 1.0 / (1.0 + scores['SA'])

    # Weighted combination
    weights = {'QED': 0.3, 'SA': 0.2, 'GSK3B': 0.4, 'LogP': 0.1}
    multi_score = (
        weights['QED'] * scores['QED'] +
        weights['SA'] * sa_score +
        weights['GSK3B'] * scores['GSK3B'] +
        weights['LogP'] * (scores['LogP'] / 5.0)  # Normalize LogP
    )

    print(f"Multi-objective score: {multi_score:.4f}")
    print(f"Weights: {weights}")


def batch_evaluation_example():
    """
    Example: Batch evaluation of multiple molecules
    """
    print("\n" + "=" * 60)
    print("Example 3: Batch Evaluation")
    print("=" * 60)

    # Generate sample molecules
    molecules = [
        'CC(C)Cc1ccc(cc1)C(C)C(O)=O',
        'CC(=O)Oc1ccccc1C(=O)O',
        'Cn1c(=O)c2c(ncn2C)n(C)c1=O',
        'CN1C=NC2=C1C(=O)N(C(=O)N2C)C',
        'CC(C)NCC(COc1ccc(cc1)COCCOC(C)C)O'
    ]

    # Initialize oracle
    oracle = Oracle(name='DRD2')

    print(f"\nBatch evaluating {len(molecules)} molecules with DRD2 oracle...")

    # Batch evaluation (more efficient than individual calls)
    scores = oracle(molecules)

    print("\nResults:")
    print("-" * 60)
    for smiles, score in zip(molecules, scores):
        print(f"{smiles[:40]:40s}... Score: {score:.4f}")

    # Statistics
    print(f"\nStatistics:")
    print(f"  Mean score: {np.mean(scores):.4f}")
    print(f"  Std score: {np.std(scores):.4f}")
    print(f"  Min score: {np.min(scores):.4f}")
    print(f"  Max score: {np.max(scores):.4f}")


def goal_directed_generation_template():
    """
    Template for goal-directed molecular generation
    """
    print("\n" + "=" * 60)
    print("Example 4: Goal-Directed Generation Template")
    print("=" * 60)

    template = '''
# Template for goal-directed molecular generation

from tdc.generation import MolGen
from tdc import Oracle
import numpy as np

# 1. Load training data
data = MolGen(name='ChEMBL_V29')
train_smiles = data.get_split()['train']['Drug'].tolist()

# 2. Initialize oracle(s)
oracle = Oracle(name='GSK3B')

# 3. Initialize your generative model
# model = YourGenerativeModel()
# model.fit(train_smiles)

# 4. Generation loop
num_iterations = 100
num_molecules_per_iter = 100
best_molecules = []

for iteration in range(num_iterations):
    # Generate candidate molecules
    # candidates = model.generate(num_molecules_per_iter)

    # Evaluate with oracle
    scores = oracle(candidates)

    # Select top molecules
    top_indices = np.argsort(scores)[-10:]
    top_molecules = [candidates[i] for i in top_indices]
    top_scores = [scores[i] for i in top_indices]

    # Store best molecules
    best_molecules.extend(zip(top_molecules, top_scores))

    # Optional: Fine-tune model on top molecules
    # model.fine_tune(top_molecules)

    # Print progress
    print(f"Iteration {iteration}: Best score = {max(scores):.4f}")

# Sort and display top molecules
best_molecules.sort(key=lambda x: x[1], reverse=True)
print("\\nTop 10 molecules:")
for smiles, score in best_molecules[:10]:
    print(f"{smiles}: {score:.4f}")
'''

    print("\nGoal-Directed Generation Template:")
    print("=" * 60)
    print(template)


def distribution_learning_example(train_smiles):
    """
    Example: Distribution learning evaluation
    """
    print("\n" + "=" * 60)
    print("Example 5: Distribution Learning")
    print("=" * 60)

    # Use subset for demonstration
    train_subset = train_smiles[:1000]

    # Initialize oracle
    oracle = Oracle(name='QED')

    print("\nEvaluating property distribution...")

    # Evaluate training set
    print("Computing training set distribution...")
    train_scores = oracle(train_subset)

    # Simulate generated molecules (in practice, use your generative model)
    # For demo: add noise to training molecules
    print("Computing generated set distribution...")
    generated_scores = train_scores + np.random.normal(0, 0.1, len(train_scores))
    generated_scores = np.clip(generated_scores, 0, 1)  # QED is [0, 1]

    # Compare distributions
    print("\n--- Distribution Statistics ---")
    print(f"Training set (n={len(train_subset)}):")
    print(f"  Mean: {np.mean(train_scores):.4f}")
    print(f"  Std: {np.std(train_scores):.4f}")
    print(f"  Median: {np.median(train_scores):.4f}")

    print(f"\nGenerated set (n={len(generated_scores)}):")
    print(f"  Mean: {np.mean(generated_scores):.4f}")
    print(f"  Std: {np.std(generated_scores):.4f}")
    print(f"  Median: {np.median(generated_scores):.4f}")

    # Distribution similarity metrics
    from scipy.stats import ks_2samp
    ks_statistic, p_value = ks_2samp(train_scores, generated_scores)

    print(f"\nKolmogorov-Smirnov Test:")
    print(f"  KS statistic: {ks_statistic:.4f}")
    print(f"  P-value: {p_value:.4f}")

    if p_value > 0.05:
        print("  → Distributions are similar (p > 0.05)")
    else:
        print("  → Distributions are significantly different (p < 0.05)")


def available_oracles_info():
    """
    Display information about available oracles
    """
    print("\n" + "=" * 60)
    print("Example 6: Available Oracles")
    print("=" * 60)

    oracle_info = {
        'Biochemical Targets': [
            'DRD2', 'GSK3B', 'JNK3', '5HT2A', 'ACE',
            'MAPK', 'CDK', 'P38', 'PARP1', 'PIK3CA'
        ],
        'Physicochemical Properties': [
            'QED', 'SA', 'LogP', 'MW', 'Lipinski'
        ],
        'Composite Metrics': [
            'Isomer_Meta', 'Median1', 'Median2',
            'Rediscovery', 'Similarity', 'Uniqueness', 'Novelty'
        ],
        'Specialized': [
            'ASKCOS', 'Docking', 'Vina'
        ]
    }

    print("\nAvailable Oracle Categories:")
    print("-" * 60)

    for category, oracles in oracle_info.items():
        print(f"\n{category}:")
        for oracle_name in oracles:
            print(f"  - {oracle_name}")

    print("\nFor detailed oracle documentation, see:")
    print("  references/oracles.md")


def constraint_satisfaction_example():
    """
    Example: Molecular generation with constraints
    """
    print("\n" + "=" * 60)
    print("Example 7: Constraint Satisfaction")
    print("=" * 60)

    # Define constraints
    constraints = {
        'QED': (0.5, 1.0),      # Drug-likeness >= 0.5
        'SA': (1.0, 5.0),       # Easy to synthesize
        'MW': (200, 500),       # Molecular weight 200-500 Da
        'LogP': (0, 3)          # Lipophilicity 0-3
    }

    # Initialize oracles
    oracles = {name: Oracle(name=name) for name in constraints.keys()}

    # Test molecules
    test_molecules = [
        'CC(C)Cc1ccc(cc1)C(C)C(O)=O',
        'CC(=O)Oc1ccccc1C(=O)O',
        'Cn1c(=O)c2c(ncn2C)n(C)c1=O'
    ]

    print("\nConstraints:")
    for prop, (min_val, max_val) in constraints.items():
        print(f"  {prop}: [{min_val}, {max_val}]")

    print("\n" + "-" * 60)
    print("Evaluating molecules against constraints:")
    print("-" * 60)

    for smiles in test_molecules:
        print(f"\nSMILES: {smiles}")

        satisfies_all = True
        for prop, (min_val, max_val) in constraints.items():
            score = oracles[prop](smiles)
            satisfies = min_val <= score <= max_val

            status = "✓" if satisfies else "✗"
            print(f"  {prop:10s}: {score:7.2f} [{min_val:5.1f}, {max_val:5.1f}] {status}")

            satisfies_all = satisfies_all and satisfies

        result = "PASS" if satisfies_all else "FAIL"
        print(f"  Overall: {result}")


def main():
    """
    Main function to run all molecular generation examples
    """
    print("\n" + "=" * 60)
    print("TDC Molecular Generation with Oracles Examples")
    print("=" * 60)

    # Load generation dataset
    train_smiles = load_generation_dataset()

    # Example 1: Single oracle
    single_oracle_example()

    # Example 2: Multiple oracles
    multiple_oracles_example()

    # Example 3: Batch evaluation
    batch_evaluation_example()

    # Example 4: Goal-directed generation template
    goal_directed_generation_template()

    # Example 5: Distribution learning
    distribution_learning_example(train_smiles)

    # Example 6: Available oracles
    available_oracles_info()

    # Example 7: Constraint satisfaction
    constraint_satisfaction_example()

    print("\n" + "=" * 60)
    print("Molecular generation examples completed!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Implement your generative model")
    print("2. Use oracles to guide generation")
    print("3. Evaluate generated molecules")
    print("4. Iterate and optimize")
    print("=" * 60)


if __name__ == "__main__":
    main()
