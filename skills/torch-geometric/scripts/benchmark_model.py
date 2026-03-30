#!/usr/bin/env python3
"""
Benchmark GNN models on standard datasets.

This script provides a simple way to benchmark different GNN architectures
on common datasets and compare their performance.

Usage:
    python benchmark_model.py --models gcn gat --dataset Cora
    python benchmark_model.py --models gcn --dataset Cora --epochs 200 --runs 10
"""

import argparse
import torch
import torch.nn.functional as F
from torch_geometric.nn import GCNConv, GATConv, SAGEConv, GINConv
from torch_geometric.datasets import Planetoid, TUDataset
from torch_geometric.loader import DataLoader
from torch_geometric.nn import global_mean_pool
import time
import numpy as np


class GCN(torch.nn.Module):
    def __init__(self, num_features, hidden_channels, num_classes, dropout=0.5):
        super().__init__()
        self.conv1 = GCNConv(num_features, hidden_channels)
        self.conv2 = GCNConv(hidden_channels, num_classes)
        self.dropout = dropout

    def forward(self, x, edge_index, batch=None):
        x = self.conv1(x, edge_index)
        x = F.relu(x)
        x = F.dropout(x, p=self.dropout, training=self.training)
        x = self.conv2(x, edge_index)
        if batch is not None:
            x = global_mean_pool(x, batch)
        return F.log_softmax(x, dim=1)


class GAT(torch.nn.Module):
    def __init__(self, num_features, hidden_channels, num_classes, heads=8, dropout=0.6):
        super().__init__()
        self.conv1 = GATConv(num_features, hidden_channels, heads=heads, dropout=dropout)
        self.conv2 = GATConv(hidden_channels * heads, num_classes, heads=1,
                             concat=False, dropout=dropout)
        self.dropout = dropout

    def forward(self, x, edge_index, batch=None):
        x = F.dropout(x, p=self.dropout, training=self.training)
        x = F.elu(self.conv1(x, edge_index))
        x = F.dropout(x, p=self.dropout, training=self.training)
        x = self.conv2(x, edge_index)
        if batch is not None:
            x = global_mean_pool(x, batch)
        return F.log_softmax(x, dim=1)


class GraphSAGE(torch.nn.Module):
    def __init__(self, num_features, hidden_channels, num_classes, dropout=0.5):
        super().__init__()
        self.conv1 = SAGEConv(num_features, hidden_channels)
        self.conv2 = SAGEConv(hidden_channels, num_classes)
        self.dropout = dropout

    def forward(self, x, edge_index, batch=None):
        x = self.conv1(x, edge_index)
        x = F.relu(x)
        x = F.dropout(x, p=self.dropout, training=self.training)
        x = self.conv2(x, edge_index)
        if batch is not None:
            x = global_mean_pool(x, batch)
        return F.log_softmax(x, dim=1)


MODELS = {
    'gcn': GCN,
    'gat': GAT,
    'graphsage': GraphSAGE,
}


def train_node_classification(model, data, optimizer):
    """Train for node classification."""
    model.train()
    optimizer.zero_grad()
    out = model(data.x, data.edge_index)
    loss = F.nll_loss(out[data.train_mask], data.y[data.train_mask])
    loss.backward()
    optimizer.step()
    return loss.item()


@torch.no_grad()
def test_node_classification(model, data):
    """Test for node classification."""
    model.eval()
    out = model(data.x, data.edge_index)
    pred = out.argmax(dim=1)

    accs = []
    for mask in [data.train_mask, data.val_mask, data.test_mask]:
        correct = (pred[mask] == data.y[mask]).sum()
        accs.append(float(correct) / int(mask.sum()))

    return accs


def train_graph_classification(model, loader, optimizer, device):
    """Train for graph classification."""
    model.train()
    total_loss = 0

    for data in loader:
        data = data.to(device)
        optimizer.zero_grad()
        out = model(data.x, data.edge_index, data.batch)
        loss = F.nll_loss(out, data.y)
        loss.backward()
        optimizer.step()
        total_loss += loss.item() * data.num_graphs

    return total_loss / len(loader.dataset)


@torch.no_grad()
def test_graph_classification(model, loader, device):
    """Test for graph classification."""
    model.eval()
    correct = 0

    for data in loader:
        data = data.to(device)
        out = model(data.x, data.edge_index, data.batch)
        pred = out.argmax(dim=1)
        correct += (pred == data.y).sum().item()

    return correct / len(loader.dataset)


def benchmark_node_classification(model_name, dataset_name, epochs, lr, weight_decay, device):
    """Benchmark a model on node classification."""
    # Load dataset
    dataset = Planetoid(root=f'/tmp/{dataset_name}', name=dataset_name)
    data = dataset[0].to(device)

    # Create model
    model_class = MODELS[model_name]
    model = model_class(
        num_features=dataset.num_features,
        hidden_channels=64,
        num_classes=dataset.num_classes
    ).to(device)

    optimizer = torch.optim.Adam(model.parameters(), lr=lr, weight_decay=weight_decay)

    # Training
    start_time = time.time()
    best_val_acc = 0
    best_test_acc = 0

    for epoch in range(1, epochs + 1):
        loss = train_node_classification(model, data, optimizer)
        train_acc, val_acc, test_acc = test_node_classification(model, data)

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            best_test_acc = test_acc

    train_time = time.time() - start_time

    return {
        'train_acc': train_acc,
        'val_acc': best_val_acc,
        'test_acc': best_test_acc,
        'train_time': train_time,
    }


def benchmark_graph_classification(model_name, dataset_name, epochs, lr, device):
    """Benchmark a model on graph classification."""
    # Load dataset
    dataset = TUDataset(root=f'/tmp/{dataset_name}', name=dataset_name)

    # Split dataset
    dataset = dataset.shuffle()
    train_dataset = dataset[:int(len(dataset) * 0.8)]
    test_dataset = dataset[int(len(dataset) * 0.8):]

    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
    test_loader = DataLoader(test_dataset, batch_size=32)

    # Create model
    model_class = MODELS[model_name]
    model = model_class(
        num_features=dataset.num_features,
        hidden_channels=64,
        num_classes=dataset.num_classes
    ).to(device)

    optimizer = torch.optim.Adam(model.parameters(), lr=lr)

    # Training
    start_time = time.time()

    for epoch in range(1, epochs + 1):
        loss = train_graph_classification(model, train_loader, optimizer, device)

    # Final evaluation
    train_acc = test_graph_classification(model, train_loader, device)
    test_acc = test_graph_classification(model, test_loader, device)
    train_time = time.time() - start_time

    return {
        'train_acc': train_acc,
        'test_acc': test_acc,
        'train_time': train_time,
    }


def run_benchmark(args):
    """Run benchmark experiments."""
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")

    # Determine task type
    if args.dataset in ['Cora', 'CiteSeer', 'PubMed']:
        task = 'node_classification'
    else:
        task = 'graph_classification'

    print(f"\\nDataset: {args.dataset}")
    print(f"Task: {task}")
    print(f"Models: {', '.join(args.models)}")
    print(f"Epochs: {args.epochs}")
    print(f"Runs: {args.runs}")
    print("=" * 60)

    results = {model: [] for model in args.models}

    # Run experiments
    for run in range(args.runs):
        print(f"\\nRun {run + 1}/{args.runs}")
        print("-" * 60)

        for model_name in args.models:
            if model_name not in MODELS:
                print(f"Unknown model: {model_name}")
                continue

            print(f"  Training {model_name.upper()}...", end=" ")

            try:
                if task == 'node_classification':
                    result = benchmark_node_classification(
                        model_name, args.dataset, args.epochs,
                        args.lr, args.weight_decay, device
                    )
                    print(f"Test Acc: {result['test_acc']:.4f}, "
                          f"Time: {result['train_time']:.2f}s")
                else:
                    result = benchmark_graph_classification(
                        model_name, args.dataset, args.epochs, args.lr, device
                    )
                    print(f"Test Acc: {result['test_acc']:.4f}, "
                          f"Time: {result['train_time']:.2f}s")

                results[model_name].append(result)
            except Exception as e:
                print(f"Error: {e}")

    # Print summary
    print("\\n" + "=" * 60)
    print("BENCHMARK RESULTS")
    print("=" * 60)

    for model_name in args.models:
        if not results[model_name]:
            continue

        test_accs = [r['test_acc'] for r in results[model_name]]
        times = [r['train_time'] for r in results[model_name]]

        print(f"\\n{model_name.upper()}")
        print(f"  Test Accuracy: {np.mean(test_accs):.4f} ± {np.std(test_accs):.4f}")
        print(f"  Training Time: {np.mean(times):.2f} ± {np.std(times):.2f}s")


def main():
    parser = argparse.ArgumentParser(description="Benchmark GNN models")
    parser.add_argument('--models', nargs='+', default=['gcn'],
                        help='Model types to benchmark (gcn, gat, graphsage)')
    parser.add_argument('--dataset', type=str, default='Cora',
                        help='Dataset name (Cora, CiteSeer, PubMed, ENZYMES, PROTEINS)')
    parser.add_argument('--epochs', type=int, default=200,
                        help='Number of training epochs')
    parser.add_argument('--runs', type=int, default=5,
                        help='Number of runs to average over')
    parser.add_argument('--lr', type=float, default=0.01,
                        help='Learning rate')
    parser.add_argument('--weight-decay', type=float, default=5e-4,
                        help='Weight decay for node classification')

    args = parser.parse_args()
    run_benchmark(args)


if __name__ == '__main__':
    main()
