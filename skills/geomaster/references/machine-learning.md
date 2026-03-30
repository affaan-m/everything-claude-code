# Machine Learning for Geospatial Data

Guide to ML and deep learning applications for remote sensing and spatial analysis.

## Traditional Machine Learning

### Random Forest for Land Cover

```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import rasterio
from rasterio.features import rasterize
import geopandas as gpd
import numpy as np

def train_random_forest_classifier(raster_path, training_gdf):
    """Train Random Forest for image classification."""

    # Load imagery
    with rasterio.open(raster_path) as src:
        image = src.read()
        profile = src.profile
        transform = src.transform

    # Extract training data
    X, y = [], []

    for _, row in training_gdf.iterrows():
        mask = rasterize(
            [(row.geometry, 1)],
            out_shape=(profile['height'], profile['width']),
            transform=transform,
            fill=0,
            dtype=np.uint8
        )
        pixels = image[:, mask > 0].T
        X.extend(pixels)
        y.extend([row['class_id']] * len(pixels))

    X = np.array(X)
    y = np.array(y)

    # Split data
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Train model
    rf = RandomForestClassifier(
        n_estimators=100,
        max_depth=20,
        min_samples_split=10,
        min_samples_leaf=4,
        class_weight='balanced',
        n_jobs=-1,
        random_state=42
    )
    rf.fit(X_train, y_train)

    # Validate
    y_pred = rf.predict(X_val)
    print("Classification Report:")
    print(classification_report(y_val, y_pred))

    # Feature importance
    feature_names = [f'Band_{i}' for i in range(X.shape[1])]
    importances = pd.DataFrame({
        'feature': feature_names,
        'importance': rf.feature_importances_
    }).sort_values('importance', ascending=False)

    print("\nFeature Importance:")
    print(importances)

    return rf

# Classify full image
def classify_image(model, image_path, output_path):
    with rasterio.open(image_path) as src:
        image = src.read()
        profile = src.profile

    image_reshaped = image.reshape(image.shape[0], -1).T
    prediction = model.predict(image_reshaped)
    prediction = prediction.reshape(image.shape[1], image.shape[2])

    profile.update(dtype=rasterio.uint8, count=1)
    with rasterio.open(output_path, 'w', **profile) as dst:
        dst.write(prediction.astype(rasterio.uint8), 1)
```

### Support Vector Machine

```python
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler

def svm_classifier(X_train, y_train):
    """SVM classifier for remote sensing."""

    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)

    # Train SVM
    svm = SVC(
        kernel='rbf',
        C=100,
        gamma='scale',
        class_weight='balanced',
        probability=True
    )
    svm.fit(X_train_scaled, y_train)

    return svm, scaler

# Multi-class classification
def multiclass_svm(X_train, y_train):
    from sklearn.multiclass import OneVsRestClassifier

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)

    svm_ovr = OneVsRestClassifier(
        SVC(kernel='rbf', C=10, probability=True),
        n_jobs=-1
    )
    svm_ovr.fit(X_train_scaled, y_train)

    return svm_ovr, scaler
```

## Deep Learning

### CNN with TorchGeo

```python
import torch
import torch.nn as nn
import torchgeo.datasets as datasets
import torchgeo.models as models
from torch.utils.data import DataLoader

# Define CNN
class LandCoverCNN(nn.Module):
    def __init__(self, in_channels=12, num_classes=10):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Conv2d(in_channels, 64, 3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d(2),

            nn.Conv2d(64, 128, 3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),
            nn.MaxPool2d(2),

            nn.Conv2d(128, 256, 3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(),
            nn.MaxPool2d(2),
        )

        self.decoder = nn.Sequential(
            nn.ConvTranspose2d(256, 128, 2, stride=2),
            nn.BatchNorm2d(128),
            nn.ReLU(),

            nn.ConvTranspose2d(128, 64, 2, stride=2),
            nn.BatchNorm2d(64),
            nn.ReLU(),

            nn.ConvTranspose2d(64, num_classes, 2, stride=2),
        )

    def forward(self, x):
        x = self.encoder(x)
        x = self.decoder(x)
        return x

# Training
def train_model(train_loader, val_loader, num_epochs=50):
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = LandCoverCNN().to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

    for epoch in range(num_epochs):
        model.train()
        train_loss = 0

        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)

            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            train_loss += loss.item()

        # Validation
        model.eval()
        val_loss = 0
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)
                val_loss += loss.item()

        print(f'Epoch {epoch+1}/{num_epochs}, Train Loss: {train_loss:.4f}, Val Loss: {val_loss:.4f}')

    return model
```

### U-Net for Semantic Segmentation

```python
class UNet(nn.Module):
    def __init__(self, in_channels=4, num_classes=5):
        super().__init__()

        # Encoder
        self.enc1 = self.conv_block(in_channels, 64)
        self.enc2 = self.conv_block(64, 128)
        self.enc3 = self.conv_block(128, 256)
        self.enc4 = self.conv_block(256, 512)

        # Bottleneck
        self.bottleneck = self.conv_block(512, 1024)

        # Decoder
        self.up1 = nn.ConvTranspose2d(1024, 512, 2, stride=2)
        self.dec1 = self.conv_block(1024, 512)

        self.up2 = nn.ConvTranspose2d(512, 256, 2, stride=2)
        self.dec2 = self.conv_block(512, 256)

        self.up3 = nn.ConvTranspose2d(256, 128, 2, stride=2)
        self.dec3 = self.conv_block(256, 128)

        self.up4 = nn.ConvTranspose2d(128, 64, 2, stride=2)
        self.dec4 = self.conv_block(128, 64)

        # Final layer
        self.final = nn.Conv2d(64, num_classes, 1)

    def conv_block(self, in_ch, out_ch):
        return nn.Sequential(
            nn.Conv2d(in_ch, out_ch, 3, padding=1),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_ch, out_ch, 3, padding=1),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True)
        )

    def forward(self, x):
        # Encoder
        e1 = self.enc1(x)
        e2 = self.enc2(F.max_pool2d(e1, 2))
        e3 = self.enc3(F.max_pool2d(e2, 2))
        e4 = self.enc4(F.max_pool2d(e3, 2))

        # Bottleneck
        b = self.bottleneck(F.max_pool2d(e4, 2))

        # Decoder with skip connections
        d1 = self.dec1(torch.cat([self.up1(b), e4], dim=1))
        d2 = self.dec2(torch.cat([self.up2(d1), e3], dim=1))
        d3 = self.dec3(torch.cat([self.up3(d2), e2], dim=1))
        d4 = self.dec4(torch.cat([self.up4(d3), e1], dim=1))

        return self.final(d4)
```

### Change Detection with Siamese Network

```python
class SiameseNetwork(nn.Module):
    """Siamese network for change detection."""

    def __init__(self):
        super().__init__()
        self.feature_extractor = nn.Sequential(
            nn.Conv2d(3, 32, 3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(2),

            nn.Conv2d(32, 64, 3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d(2),

            nn.Conv2d(64, 128, 3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),
        )

        self.classifier = nn.Sequential(
            nn.Conv2d(256, 128, 3, padding=1),
            nn.ReLU(),
            nn.Conv2d(128, 64, 3, padding=1),
            nn.ReLU(),
            nn.Conv2d(64, 2, 1),  # Binary: change / no change
        )

    def forward(self, x1, x2):
        f1 = self.feature_extractor(x1)
        f2 = self.feature_extractor(x2)

        # Concatenate features
        diff = torch.abs(f1 - f2)
        combined = torch.cat([f1, f2, diff], dim=1)

        return self.classifier(combined)
```

## Graph Neural Networks

### PyTorch Geometric for Spatial Data

```python
import torch
from torch_geometric.data import Data
from torch_geometric.nn import GCNConv

# Create spatial graph
def create_spatial_graph(points_gdf, k_neighbors=5):
    """Create graph from point data using k-NN."""

    from sklearn.neighbors import NearestNeighbors

    coords = np.array([[p.x, p.y] for p in points_gdf.geometry])

    # Find k-nearest neighbors
    nbrs = NearestNeighbors(n_neighbors=k_neighbors).fit(coords)
    distances, indices = nbrs.kneighbors(coords)

    # Create edge index
    edge_index = []
    for i, neighbors in enumerate(indices):
        for j in neighbors:
            edge_index.append([i, j])

    edge_index = torch.tensor(edge_index, dtype=torch.long).t().contiguous()

    # Node features
    features = points_gdf.drop('geometry', axis=1).values
    x = torch.tensor(features, dtype=torch.float)

    return Data(x=x, edge_index=edge_index)

# GCN for spatial prediction
class SpatialGCN(torch.nn.Module):
    def __init__(self, num_features, hidden_channels=64):
        super().__init__()
        self.conv1 = GCNConv(num_features, hidden_channels)
        self.conv2 = GCNConv(hidden_channels, hidden_channels)
        self.conv3 = GCNConv(hidden_channels, 1)

    def forward(self, data):
        x, edge_index = data.x, data.edge_index
        x = self.conv1(x, edge_index).relu()
        x = F.dropout(x, p=0.5, training=self.training)
        x = self.conv2(x, edge_index).relu()
        x = self.conv3(x, edge_index)
        return x
```

## Explainable AI (XAI) for Geospatial

### SHAP for Model Interpretation

```python
import shap
import numpy as np

def explain_model(model, X, feature_names):
    """Explain model predictions using SHAP."""

    # Create explainer
    explainer = shap.Explainer(model, X)

    # Calculate SHAP values
    shap_values = explainer(X)

    # Summary plot
    shap.summary_plot(shap_values, X, feature_names=feature_names)

    # Dependence plot for important features
    for i in range(X.shape[1]):
        shap.dependence_plot(i, shap_values, X, feature_names=feature_names)

    return shap_values

# Spatial SHAP (accounting for spatial autocorrelation)
def spatial_shap(model, X, coordinates):
    """Spatial explanation considering neighborhood effects."""

    # Compute SHAP values
    explainer = shap.Explainer(model, X)
    shap_values = explainer(X)

    # Spatial aggregation
    shap_spatial = {}
    for i, coord in enumerate(coordinates):
        # Find neighbors
        neighbors = find_neighbors(coord, coordinates, radius=1000)

        # Aggregate SHAP values for neighborhood
        neighbor_shap = shap_values.values[neighbors]
        shap_spatial[i] = np.mean(neighbor_shap, axis=0)

    return shap_spatial
```

### Attention Maps for CNNs

```python
import cv2
import torch
import torch.nn.functional as F

def generate_attention_map(model, image_tensor, target_layer):
    """Generate attention map using Grad-CAM."""

    # Forward pass
    model.eval()
    output = model(image_tensor)

    # Backward pass
    model.zero_grad()
    output[0, torch.argmax(output)].backward()

    # Get gradients
    gradients = model.get_gradient(target_layer)

    # Global average pooling
    weights = torch.mean(gradients, axis=(2, 3), keepdim=True)

    # Weighted combination of activation maps
    activations = model.get_activation(target_layer)
    attention = torch.sum(weights * activations, axis=1, keepdim=True)

    # ReLU and normalize
    attention = F.relu(attention)
    attention = F.interpolate(attention, size=image_tensor.shape[2:],
                              mode='bilinear', align_corners=False)
    attention = (attention - attention.min()) / (attention.max() - attention.min())

    return attention.squeeze().cpu().numpy()
```

For more ML examples, see [code-examples.md](code-examples.md).
