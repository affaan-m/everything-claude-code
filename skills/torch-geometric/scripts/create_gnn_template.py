#!/usr/bin/env python3
"""
Generate boilerplate code for common GNN architectures in PyTorch Geometric.

This script creates ready-to-use GNN model templates with training loops,
evaluation metrics, and proper data handling.

Usage:
    python create_gnn_template.py --model gcn --task node_classification --output my_model.py
    python create_gnn_template.py --model gat --task graph_classification --output graph_classifier.py
"""

import argparse
from pathlib import Path


TEMPLATES = {
    'node_classification': {
        'gcn': '''import torch
import torch.nn.functional as F
from torch_geometric.nn import GCNConv
from torch_geometric.datasets import Planetoid


class GCN(torch.nn.Module):
    """Graph Convolutional Network for node classification."""

    def __init__(self, num_features, hidden_channels, num_classes, num_layers=2, dropout=0.5):
        super().__init__()
        self.convs = torch.nn.ModuleList()

        # First layer
        self.convs.append(GCNConv(num_features, hidden_channels))

        # Hidden layers
        for _ in range(num_layers - 2):
            self.convs.append(GCNConv(hidden_channels, hidden_channels))

        # Output layer
        self.convs.append(GCNConv(hidden_channels, num_classes))

        self.dropout = dropout

    def forward(self, data):
        x, edge_index = data.x, data.edge_index

        # Apply conv layers with ReLU and dropout
        for conv in self.convs[:-1]:
            x = conv(x, edge_index)
            x = F.relu(x)
            x = F.dropout(x, p=self.dropout, training=self.training)

        # Final layer without activation
        x = self.convs[-1](x, edge_index)
        return F.log_softmax(x, dim=1)


def train(model, data, optimizer):
    """Train the model for one epoch."""
    model.train()
    optimizer.zero_grad()
    out = model(data)
    loss = F.nll_loss(out[data.train_mask], data.y[data.train_mask])
    loss.backward()
    optimizer.step()
    return loss.item()


@torch.no_grad()
def test(model, data):
    """Evaluate the model."""
    model.eval()
    out = model(data)
    pred = out.argmax(dim=1)

    accs = []
    for mask in [data.train_mask, data.val_mask, data.test_mask]:
        correct = (pred[mask] == data.y[mask]).sum()
        accs.append(int(correct) / int(mask.sum()))

    return accs


def main():
    # Load dataset
    dataset = Planetoid(root='/tmp/Cora', name='Cora')
    data = dataset[0]

    # Create model
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = GCN(
        num_features=dataset.num_features,
        hidden_channels=64,
        num_classes=dataset.num_classes,
        num_layers=3,
        dropout=0.5
    ).to(device)
    data = data.to(device)

    # Setup optimizer
    optimizer = torch.optim.Adam(model.parameters(), lr=0.01, weight_decay=5e-4)

    # Training loop
    print("Training GCN model...")
    best_val_acc = 0
    for epoch in range(1, 201):
        loss = train(model, data, optimizer)
        train_acc, val_acc, test_acc = test(model, data)

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            best_test_acc = test_acc

        if epoch % 10 == 0:
            print(f'Epoch {epoch:03d}, Loss: {loss:.4f}, '
                  f'Train: {train_acc:.4f}, Val: {val_acc:.4f}, Test: {test_acc:.4f}')

    print(f'\\nBest Test Accuracy: {best_test_acc:.4f}')


if __name__ == '__main__':
    main()
''',

        'gat': '''import torch
import torch.nn.functional as F
from torch_geometric.nn import GATConv
from torch_geometric.datasets import Planetoid


class GAT(torch.nn.Module):
    """Graph Attention Network for node classification."""

    def __init__(self, num_features, hidden_channels, num_classes, heads=8, dropout=0.6):
        super().__init__()

        self.conv1 = GATConv(num_features, hidden_channels, heads=heads, dropout=dropout)
        self.conv2 = GATConv(hidden_channels * heads, num_classes, heads=1,
                             concat=False, dropout=dropout)

        self.dropout = dropout

    def forward(self, data):
        x, edge_index = data.x, data.edge_index

        x = F.dropout(x, p=self.dropout, training=self.training)
        x = F.elu(self.conv1(x, edge_index))
        x = F.dropout(x, p=self.dropout, training=self.training)
        x = self.conv2(x, edge_index)

        return F.log_softmax(x, dim=1)


def train(model, data, optimizer):
    """Train the model for one epoch."""
    model.train()
    optimizer.zero_grad()
    out = model(data)
    loss = F.nll_loss(out[data.train_mask], data.y[data.train_mask])
    loss.backward()
    optimizer.step()
    return loss.item()


@torch.no_grad()
def test(model, data):
    """Evaluate the model."""
    model.eval()
    out = model(data)
    pred = out.argmax(dim=1)

    accs = []
    for mask in [data.train_mask, data.val_mask, data.test_mask]:
        correct = (pred[mask] == data.y[mask]).sum()
        accs.append(int(correct) / int(mask.sum()))

    return accs


def main():
    # Load dataset
    dataset = Planetoid(root='/tmp/Cora', name='Cora')
    data = dataset[0]

    # Create model
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = GAT(
        num_features=dataset.num_features,
        hidden_channels=8,
        num_classes=dataset.num_classes,
        heads=8,
        dropout=0.6
    ).to(device)
    data = data.to(device)

    # Setup optimizer
    optimizer = torch.optim.Adam(model.parameters(), lr=0.005, weight_decay=5e-4)

    # Training loop
    print("Training GAT model...")
    best_val_acc = 0
    for epoch in range(1, 201):
        loss = train(model, data, optimizer)
        train_acc, val_acc, test_acc = test(model, data)

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            best_test_acc = test_acc

        if epoch % 10 == 0:
            print(f'Epoch {epoch:03d}, Loss: {loss:.4f}, '
                  f'Train: {train_acc:.4f}, Val: {val_acc:.4f}, Test: {test_acc:.4f}')

    print(f'\\nBest Test Accuracy: {best_test_acc:.4f}')


if __name__ == '__main__':
    main()
''',

        'graphsage': '''import torch
import torch.nn.functional as F
from torch_geometric.nn import SAGEConv
from torch_geometric.datasets import Planetoid


class GraphSAGE(torch.nn.Module):
    """GraphSAGE for node classification."""

    def __init__(self, num_features, hidden_channels, num_classes, num_layers=2, dropout=0.5):
        super().__init__()
        self.convs = torch.nn.ModuleList()

        self.convs.append(SAGEConv(num_features, hidden_channels))
        for _ in range(num_layers - 2):
            self.convs.append(SAGEConv(hidden_channels, hidden_channels))
        self.convs.append(SAGEConv(hidden_channels, num_classes))

        self.dropout = dropout

    def forward(self, data):
        x, edge_index = data.x, data.edge_index

        for conv in self.convs[:-1]:
            x = conv(x, edge_index)
            x = F.relu(x)
            x = F.dropout(x, p=self.dropout, training=self.training)

        x = self.convs[-1](x, edge_index)
        return F.log_softmax(x, dim=1)


def train(model, data, optimizer):
    model.train()
    optimizer.zero_grad()
    out = model(data)
    loss = F.nll_loss(out[data.train_mask], data.y[data.train_mask])
    loss.backward()
    optimizer.step()
    return loss.item()


@torch.no_grad()
def test(model, data):
    model.eval()
    out = model(data)
    pred = out.argmax(dim=1)

    accs = []
    for mask in [data.train_mask, data.val_mask, data.test_mask]:
        correct = (pred[mask] == data.y[mask]).sum()
        accs.append(int(correct) / int(mask.sum()))

    return accs


def main():
    dataset = Planetoid(root='/tmp/Cora', name='Cora')
    data = dataset[0]

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = GraphSAGE(
        num_features=dataset.num_features,
        hidden_channels=64,
        num_classes=dataset.num_classes,
        num_layers=2,
        dropout=0.5
    ).to(device)
    data = data.to(device)

    optimizer = torch.optim.Adam(model.parameters(), lr=0.01, weight_decay=5e-4)

    print("Training GraphSAGE model...")
    best_val_acc = 0
    for epoch in range(1, 201):
        loss = train(model, data, optimizer)
        train_acc, val_acc, test_acc = test(model, data)

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            best_test_acc = test_acc

        if epoch % 10 == 0:
            print(f'Epoch {epoch:03d}, Loss: {loss:.4f}, '
                  f'Train: {train_acc:.4f}, Val: {val_acc:.4f}, Test: {test_acc:.4f}')

    print(f'\\nBest Test Accuracy: {best_test_acc:.4f}')


if __name__ == '__main__':
    main()
''',
    },

    'graph_classification': {
        'gin': '''import torch
import torch.nn.functional as F
from torch_geometric.nn import GINConv, global_add_pool
from torch_geometric.datasets import TUDataset
from torch_geometric.loader import DataLoader


class GIN(torch.nn.Module):
    """Graph Isomorphism Network for graph classification."""

    def __init__(self, num_features, hidden_channels, num_classes, num_layers=3, dropout=0.5):
        super().__init__()

        self.convs = torch.nn.ModuleList()
        self.batch_norms = torch.nn.ModuleList()

        # Create MLP for first layer
        nn = torch.nn.Sequential(
            torch.nn.Linear(num_features, hidden_channels),
            torch.nn.ReLU(),
            torch.nn.Linear(hidden_channels, hidden_channels)
        )
        self.convs.append(GINConv(nn))
        self.batch_norms.append(torch.nn.BatchNorm1d(hidden_channels))

        # Hidden layers
        for _ in range(num_layers - 2):
            nn = torch.nn.Sequential(
                torch.nn.Linear(hidden_channels, hidden_channels),
                torch.nn.ReLU(),
                torch.nn.Linear(hidden_channels, hidden_channels)
            )
            self.convs.append(GINConv(nn))
            self.batch_norms.append(torch.nn.BatchNorm1d(hidden_channels))

        # Output MLP
        self.lin = torch.nn.Linear(hidden_channels, num_classes)
        self.dropout = dropout

    def forward(self, data):
        x, edge_index, batch = data.x, data.edge_index, data.batch

        for conv, batch_norm in zip(self.convs, self.batch_norms):
            x = conv(x, edge_index)
            x = batch_norm(x)
            x = F.relu(x)
            x = F.dropout(x, p=self.dropout, training=self.training)

        # Global pooling
        x = global_add_pool(x, batch)

        # Output layer
        x = self.lin(x)
        return F.log_softmax(x, dim=1)


def train(model, loader, optimizer, device):
    """Train the model for one epoch."""
    model.train()
    total_loss = 0

    for data in loader:
        data = data.to(device)
        optimizer.zero_grad()
        out = model(data)
        loss = F.nll_loss(out, data.y)
        loss.backward()
        optimizer.step()
        total_loss += loss.item() * data.num_graphs

    return total_loss / len(loader.dataset)


@torch.no_grad()
def test(model, loader, device):
    """Evaluate the model."""
    model.eval()
    correct = 0

    for data in loader:
        data = data.to(device)
        out = model(data)
        pred = out.argmax(dim=1)
        correct += (pred == data.y).sum().item()

    return correct / len(loader.dataset)


def main():
    # Load dataset
    dataset = TUDataset(root='/tmp/ENZYMES', name='ENZYMES')
    print(f"Dataset: {dataset}")
    print(f"Number of graphs: {len(dataset)}")
    print(f"Number of features: {dataset.num_features}")
    print(f"Number of classes: {dataset.num_classes}")

    # Shuffle and split
    dataset = dataset.shuffle()
    train_dataset = dataset[:int(len(dataset) * 0.8)]
    test_dataset = dataset[int(len(dataset) * 0.8):]

    # Create data loaders
    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
    test_loader = DataLoader(test_dataset, batch_size=32)

    # Create model
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = GIN(
        num_features=dataset.num_features,
        hidden_channels=64,
        num_classes=dataset.num_classes,
        num_layers=3,
        dropout=0.5
    ).to(device)

    optimizer = torch.optim.Adam(model.parameters(), lr=0.01)

    # Training loop
    print("\\nTraining GIN model...")
    for epoch in range(1, 101):
        loss = train(model, train_loader, optimizer, device)
        train_acc = test(model, train_loader, device)
        test_acc = test(model, test_loader, device)

        if epoch % 10 == 0:
            print(f'Epoch {epoch:03d}, Loss: {loss:.4f}, '
                  f'Train Acc: {train_acc:.4f}, Test Acc: {test_acc:.4f}')


if __name__ == '__main__':
    main()
''',
    },
}


def generate_template(model_type: str, task: str, output_path: str):
    """Generate a GNN template file."""
    if task not in TEMPLATES:
        raise ValueError(f"Unknown task: {task}. Available: {list(TEMPLATES.keys())}")

    if model_type not in TEMPLATES[task]:
        raise ValueError(f"Model {model_type} not available for task {task}. "
                         f"Available: {list(TEMPLATES[task].keys())}")

    template = TEMPLATES[task][model_type]

    # Write to file
    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)

    with open(output_file, 'w') as f:
        f.write(template)

    print(f"✓ Generated {model_type.upper()} template for {task}")
    print(f"  Saved to: {output_path}")
    print(f"\\nTo run the template:")
    print(f"  python {output_path}")


def list_templates():
    """List all available templates."""
    print("Available GNN Templates")
    print("=" * 50)
    for task, models in TEMPLATES.items():
        print(f"\\n{task.upper()}")
        print("-" * 50)
        for model in models.keys():
            print(f"  - {model}")
    print()


def main():
    parser = argparse.ArgumentParser(
        description="Generate GNN model templates",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python create_gnn_template.py --model gcn --task node_classification --output gcn_model.py
  python create_gnn_template.py --model gin --task graph_classification --output gin_model.py
  python create_gnn_template.py --list
        """
    )

    parser.add_argument('--model', type=str,
                        help='Model type (gcn, gat, graphsage, gin)')
    parser.add_argument('--task', type=str,
                        help='Task type (node_classification, graph_classification)')
    parser.add_argument('--output', type=str, default='gnn_model.py',
                        help='Output file path (default: gnn_model.py)')
    parser.add_argument('--list', action='store_true',
                        help='List all available templates')

    args = parser.parse_args()

    if args.list:
        list_templates()
        return

    if not args.model or not args.task:
        parser.print_help()
        print("\\n" + "=" * 50)
        list_templates()
        return

    try:
        generate_template(args.model, args.task, args.output)
    except ValueError as e:
        print(f"Error: {e}")
        print("\\nUse --list to see available templates")


if __name__ == '__main__':
    main()
