# PyTorch Geometric Datasets Reference

This document provides a comprehensive catalog of all datasets available in `torch_geometric.datasets`.

## Citation Networks

### Planetoid
**Usage**: Node classification, semi-supervised learning
**Networks**: Cora, CiteSeer, PubMed
**Description**: Citation networks where nodes are papers and edges are citations
- **Cora**: 2,708 nodes, 5,429 edges, 7 classes, 1,433 features
- **CiteSeer**: 3,327 nodes, 4,732 edges, 6 classes, 3,703 features
- **PubMed**: 19,717 nodes, 44,338 edges, 3 classes, 500 features

```python
from torch_geometric.datasets import Planetoid
dataset = Planetoid(root='/tmp/Cora', name='Cora')
```

### Coauthor
**Usage**: Node classification on collaboration networks
**Networks**: CS, Physics
**Description**: Co-authorship networks from Microsoft Academic Graph
- **CS**: 18,333 nodes, 81,894 edges, 15 classes (computer science)
- **Physics**: 34,493 nodes, 247,962 edges, 5 classes (physics)

```python
from torch_geometric.datasets import Coauthor
dataset = Coauthor(root='/tmp/CS', name='CS')
```

### Amazon
**Usage**: Node classification on product networks
**Networks**: Computers, Photo
**Description**: Amazon co-purchase networks where nodes are products
- **Computers**: 13,752 nodes, 245,861 edges, 10 classes
- **Photo**: 7,650 nodes, 119,081 edges, 8 classes

```python
from torch_geometric.datasets import Amazon
dataset = Amazon(root='/tmp/Computers', name='Computers')
```

### CitationFull
**Usage**: Citation network analysis
**Networks**: Cora, Cora_ML, DBLP, PubMed
**Description**: Full citation networks without sampling

```python
from torch_geometric.datasets import CitationFull
dataset = CitationFull(root='/tmp/Cora', name='Cora')
```

## Graph Classification

### TUDataset
**Usage**: Graph classification, graph kernel benchmarks
**Description**: Collection of 120+ graph classification datasets
- **MUTAG**: 188 graphs, 2 classes (molecular compounds)
- **PROTEINS**: 1,113 graphs, 2 classes (protein structures)
- **ENZYMES**: 600 graphs, 6 classes (protein enzymes)
- **IMDB-BINARY**: 1,000 graphs, 2 classes (social networks)
- **REDDIT-BINARY**: 2,000 graphs, 2 classes (discussion threads)
- **COLLAB**: 5,000 graphs, 3 classes (scientific collaborations)
- **NCI1**: 4,110 graphs, 2 classes (chemical compounds)
- **DD**: 1,178 graphs, 2 classes (protein structures)

```python
from torch_geometric.datasets import TUDataset
dataset = TUDataset(root='/tmp/ENZYMES', name='ENZYMES')
```

### MoleculeNet
**Usage**: Molecular property prediction
**Datasets**: Over 10 molecular benchmark datasets
**Description**: Comprehensive molecular machine learning benchmarks
- **ESOL**: Aqueous solubility (regression)
- **FreeSolv**: Hydration free energy (regression)
- **Lipophilicity**: Octanol/water distribution (regression)
- **BACE**: Binding results (classification)
- **BBBP**: Blood-brain barrier penetration (classification)
- **HIV**: HIV inhibition (classification)
- **Tox21**: Toxicity prediction (multi-task classification)
- **ToxCast**: Toxicology forecasting (multi-task classification)
- **SIDER**: Side effects (multi-task classification)
- **ClinTox**: Clinical trial toxicity (multi-task classification)

```python
from torch_geometric.datasets import MoleculeNet
dataset = MoleculeNet(root='/tmp/ESOL', name='ESOL')
```

## Molecular and Chemical Datasets

### QM7b
**Usage**: Molecular property prediction (quantum mechanics)
**Description**: 7,211 molecules with up to 7 heavy atoms
- Properties: Atomization energies, electronic properties

```python
from torch_geometric.datasets import QM7b
dataset = QM7b(root='/tmp/QM7b')
```

### QM9
**Usage**: Molecular property prediction (quantum mechanics)
**Description**: ~130,000 molecules with up to 9 heavy atoms (C, O, N, F)
- Properties: 19 quantum chemical properties including HOMO, LUMO, gap, energy

```python
from torch_geometric.datasets import QM9
dataset = QM9(root='/tmp/QM9')
```

### ZINC
**Usage**: Molecular generation, property prediction
**Description**: ~250,000 drug-like molecular graphs
- Properties: Constrained solubility, molecular weight

```python
from torch_geometric.datasets import ZINC
dataset = ZINC(root='/tmp/ZINC', subset=True)
```

### AQSOL
**Usage**: Aqueous solubility prediction
**Description**: ~10,000 molecules with solubility measurements

```python
from torch_geometric.datasets import AQSOL
dataset = AQSOL(root='/tmp/AQSOL')
```

### MD17
**Usage**: Molecular dynamics, force field learning
**Description**: Molecular dynamics trajectories for small molecules
- Molecules: Benzene, Uracil, Naphthalene, Aspirin, Salicylic acid, etc.

```python
from torch_geometric.datasets import MD17
dataset = MD17(root='/tmp/MD17', name='benzene')
```

### PCQM4Mv2
**Usage**: Large-scale molecular property prediction
**Description**: 3.8M molecules from PubChem for quantum chemistry
- Part of OGB Large-Scale Challenge

```python
from torch_geometric.datasets import PCQM4Mv2
dataset = PCQM4Mv2(root='/tmp/PCQM4Mv2')
```

## Social Networks

### Reddit
**Usage**: Large-scale node classification
**Description**: Reddit posts from September 2014
- 232,965 nodes, 11,606,919 edges, 41 classes
- Features: TF-IDF of post content

```python
from torch_geometric.datasets import Reddit
dataset = Reddit(root='/tmp/Reddit')
```

### Reddit2
**Usage**: Large-scale node classification
**Description**: Updated Reddit dataset with more posts

```python
from torch_geometric.datasets import Reddit2
dataset = Reddit2(root='/tmp/Reddit2')
```

### Twitch
**Usage**: Node classification, social network analysis
**Networks**: DE, EN, ES, FR, PT, RU
**Description**: Twitch user networks by language

```python
from torch_geometric.datasets import Twitch
dataset = Twitch(root='/tmp/Twitch', name='DE')
```

### Facebook
**Usage**: Social network analysis, node classification
**Description**: Facebook page-page networks

```python
from torch_geometric.datasets import FacebookPagePage
dataset = FacebookPagePage(root='/tmp/Facebook')
```

### GitHub
**Usage**: Social network analysis
**Description**: GitHub developer networks

```python
from torch_geometric.datasets import GitHub
dataset = GitHub(root='/tmp/GitHub')
```

## Knowledge Graphs

### Entities
**Usage**: Link prediction, knowledge graph embeddings
**Datasets**: AIFB, MUTAG, BGS, AM
**Description**: RDF knowledge graphs with typed relations

```python
from torch_geometric.datasets import Entities
dataset = Entities(root='/tmp/AIFB', name='AIFB')
```

### WordNet18
**Usage**: Link prediction on semantic networks
**Description**: Subset of WordNet with 18 relations
- 40,943 entities, 151,442 triplets

```python
from torch_geometric.datasets import WordNet18
dataset = WordNet18(root='/tmp/WordNet18')
```

### WordNet18RR
**Usage**: Link prediction (no inverse relations)
**Description**: Refined version without inverse relations

```python
from torch_geometric.datasets import WordNet18RR
dataset = WordNet18RR(root='/tmp/WordNet18RR')
```

### FB15k-237
**Usage**: Link prediction on Freebase
**Description**: Subset of Freebase with 237 relations
- 14,541 entities, 310,116 triplets

```python
from torch_geometric.datasets import FB15k_237
dataset = FB15k_237(root='/tmp/FB15k')
```

## Heterogeneous Graphs

### OGB_MAG
**Usage**: Heterogeneous graph learning, node classification
**Description**: Microsoft Academic Graph with multiple node/edge types
- Node types: paper, author, institution, field of study
- 1M+ nodes, 21M+ edges

```python
from torch_geometric.datasets import OGB_MAG
dataset = OGB_MAG(root='/tmp/OGB_MAG')
```

### MovieLens
**Usage**: Recommendation systems, link prediction
**Versions**: 100K, 1M, 10M, 20M
**Description**: User-movie rating networks
- Node types: user, movie
- Edge types: rates

```python
from torch_geometric.datasets import MovieLens
dataset = MovieLens(root='/tmp/MovieLens', model_name='100k')
```

### IMDB
**Usage**: Heterogeneous graph learning
**Description**: IMDB movie network
- Node types: movie, actor, director

```python
from torch_geometric.datasets import IMDB
dataset = IMDB(root='/tmp/IMDB')
```

### DBLP
**Usage**: Heterogeneous graph learning, node classification
**Description**: DBLP bibliography network
- Node types: author, paper, term, conference

```python
from torch_geometric.datasets import DBLP
dataset = DBLP(root='/tmp/DBLP')
```

### LastFM
**Usage**: Heterogeneous recommendation
**Description**: LastFM music network
- Node types: user, artist, tag

```python
from torch_geometric.datasets import LastFM
dataset = LastFM(root='/tmp/LastFM')
```

## Temporal Graphs

### BitcoinOTC
**Usage**: Temporal link prediction, trust networks
**Description**: Bitcoin OTC trust network over time

```python
from torch_geometric.datasets import BitcoinOTC
dataset = BitcoinOTC(root='/tmp/BitcoinOTC')
```

### ICEWS18
**Usage**: Temporal knowledge graph completion
**Description**: Integrated Crisis Early Warning System events

```python
from torch_geometric.datasets import ICEWS18
dataset = ICEWS18(root='/tmp/ICEWS18')
```

### GDELT
**Usage**: Temporal event forecasting
**Description**: Global Database of Events, Language, and Tone

```python
from torch_geometric.datasets import GDELT
dataset = GDELT(root='/tmp/GDELT')
```

### JODIEDataset
**Usage**: Dynamic graph learning
**Datasets**: Reddit, Wikipedia, MOOC, LastFM
**Description**: Temporal interaction networks

```python
from torch_geometric.datasets import JODIEDataset
dataset = JODIEDataset(root='/tmp/JODIE', name='Reddit')
```

## 3D Meshes and Point Clouds

### ShapeNet
**Usage**: 3D shape classification and segmentation
**Description**: Large-scale 3D CAD model dataset
- 16,881 models across 16 categories
- Part-level segmentation labels

```python
from torch_geometric.datasets import ShapeNet
dataset = ShapeNet(root='/tmp/ShapeNet', categories=['Airplane'])
```

### ModelNet
**Usage**: 3D shape classification
**Versions**: ModelNet10, ModelNet40
**Description**: CAD models for 3D object classification
- ModelNet10: 4,899 models, 10 categories
- ModelNet40: 12,311 models, 40 categories

```python
from torch_geometric.datasets import ModelNet
dataset = ModelNet(root='/tmp/ModelNet', name='10')
```

### FAUST
**Usage**: 3D shape matching, correspondence
**Description**: Human body scans for shape analysis
- 100 meshes of 10 people in 10 poses

```python
from torch_geometric.datasets import FAUST
dataset = FAUST(root='/tmp/FAUST')
```

### CoMA
**Usage**: 3D mesh deformation
**Description**: Facial expression meshes
- 20,466 3D face scans with expressions

```python
from torch_geometric.datasets import CoMA
dataset = CoMA(root='/tmp/CoMA')
```

### S3DIS
**Usage**: 3D semantic segmentation
**Description**: Stanford Large-Scale 3D Indoor Spaces
- 6 areas, 271 rooms, point cloud data

```python
from torch_geometric.datasets import S3DIS
dataset = S3DIS(root='/tmp/S3DIS', test_area=6)
```

## Image and Vision Datasets

### MNISTSuperpixels
**Usage**: Graph-based image classification
**Description**: MNIST images as superpixel graphs
- 70,000 graphs (60k train, 10k test)

```python
from torch_geometric.datasets import MNISTSuperpixels
dataset = MNISTSuperpixels(root='/tmp/MNIST')
```

### Flickr
**Usage**: Image description, node classification
**Description**: Flickr image network
- 89,250 nodes, 899,756 edges

```python
from torch_geometric.datasets import Flickr
dataset = Flickr(root='/tmp/Flickr')
```

### PPI
**Usage**: Protein-protein interaction prediction
**Description**: Multi-graph protein interaction networks
- 24 graphs, 2,373 nodes total

```python
from torch_geometric.datasets import PPI
dataset = PPI(root='/tmp/PPI', split='train')
```

## Small Classic Graphs

### KarateClub
**Usage**: Community detection, visualization
**Description**: Zachary's karate club network
- 34 nodes, 78 edges, 2 communities

```python
from torch_geometric.datasets import KarateClub
dataset = KarateClub()
```

## Open Graph Benchmark (OGB)

PyG integrates seamlessly with OGB datasets:

### Node Property Prediction
- **ogbn-products**: Amazon product network (2.4M nodes)
- **ogbn-proteins**: Protein association network (132K nodes)
- **ogbn-arxiv**: Citation network (169K nodes)
- **ogbn-papers100M**: Large citation network (111M nodes)
- **ogbn-mag**: Heterogeneous academic graph

### Link Property Prediction
- **ogbl-ppa**: Protein association networks
- **ogbl-collab**: Collaboration networks
- **ogbl-ddi**: Drug-drug interaction network
- **ogbl-citation2**: Citation network
- **ogbl-wikikg2**: Wikidata knowledge graph

### Graph Property Prediction
- **ogbg-molhiv**: Molecular HIV activity prediction
- **ogbg-molpcba**: Molecular bioassays (multi-task)
- **ogbg-ppa**: Protein function prediction
- **ogbg-code2**: Code abstract syntax trees

```python
from torch_geometric.datasets import OGB_MAG, OGB_PPA
# or
from ogb.nodeproppred import PygNodePropPredDataset
dataset = PygNodePropPredDataset(name='ogbn-arxiv')
```

## Synthetic Datasets

### FakeDataset
**Usage**: Testing, debugging
**Description**: Generates random graph data

```python
from torch_geometric.datasets import FakeDataset
dataset = FakeDataset(num_graphs=100, avg_num_nodes=50)
```

### StochasticBlockModelDataset
**Usage**: Community detection benchmarks
**Description**: Graphs generated from stochastic block models

```python
from torch_geometric.datasets import StochasticBlockModelDataset
dataset = StochasticBlockModelDataset(root='/tmp/SBM', num_graphs=1000)
```

### ExplainerDataset
**Usage**: Testing explainability methods
**Description**: Synthetic graphs with known explanation ground truth

```python
from torch_geometric.datasets import ExplainerDataset
dataset = ExplainerDataset(num_graphs=1000)
```

## Materials Science

### QM8
**Usage**: Molecular property prediction
**Description**: Electronic properties of small molecules

```python
from torch_geometric.datasets import QM8
dataset = QM8(root='/tmp/QM8')
```

## Biological Networks

### PPI (Protein-Protein Interaction)
Already listed above under Image and Vision Datasets

### STRING
**Usage**: Protein interaction networks
**Description**: Known and predicted protein-protein interactions

```python
# Available through external sources or custom loading
```

## Usage Tips

1. **Start with small datasets**: Use Cora, KarateClub, or ENZYMES for prototyping
2. **Citation networks**: Planetoid datasets are perfect for node classification
3. **Graph classification**: TUDataset provides diverse benchmarks
4. **Molecular**: QM9, ZINC, MoleculeNet for chemistry applications
5. **Large-scale**: Use Reddit, OGB datasets with NeighborLoader
6. **Heterogeneous**: OGB_MAG, MovieLens, IMDB for multi-type graphs
7. **Temporal**: JODIE, ICEWS for dynamic graph learning
8. **3D**: ShapeNet, ModelNet, S3DIS for geometric learning

## Common Patterns

### Loading with Transforms
```python
from torch_geometric.datasets import Planetoid
from torch_geometric.transforms import NormalizeFeatures

dataset = Planetoid(root='/tmp/Cora', name='Cora',
                    transform=NormalizeFeatures())
```

### Train/Val/Test Splits
```python
# For datasets with pre-defined splits
data = dataset[0]
train_data = data[data.train_mask]
val_data = data[data.val_mask]
test_data = data[data.test_mask]

# For graph classification
from torch_geometric.loader import DataLoader
train_dataset = dataset[:int(len(dataset) * 0.8)]
test_dataset = dataset[int(len(dataset) * 0.8):]
train_loader = DataLoader(train_dataset, batch_size=32)
```

### Custom Data Loading
```python
from torch_geometric.data import Data, Dataset

class MyCustomDataset(Dataset):
    def __init__(self, root, transform=None):
        super().__init__(root, transform)
        # Your initialization

    def len(self):
        return len(self.data_list)

    def get(self, idx):
        # Load and return data object
        return self.data_list[idx]
```
