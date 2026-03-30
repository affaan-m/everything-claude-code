# Multiparametric Imaging

## Overview

PathML provides specialized support for multiparametric imaging technologies that simultaneously measure multiple markers at single-cell resolution. These techniques include CODEX, Vectra multiplex immunofluorescence, MERFISH, and other spatial proteomics and transcriptomics platforms. PathML handles the unique data structures, processing requirements, and quantification workflows specific to each technology.

## Supported Technologies

### CODEX (CO-Detection by indEXing)
- Cyclic immunofluorescence imaging
- 40+ protein markers simultaneously
- Single-cell spatial proteomics
- Multi-cycle acquisition with antibody barcoding

### Vectra Polaris
- Multispectral multiplex immunofluorescence
- 6-8 markers per slide
- Spectral unmixing
- Whole-slide scanning

### MERFISH (Multiplexed Error-Robust FISH)
- Spatial transcriptomics
- 100s-1000s of genes
- Single-molecule resolution
- Error-correcting barcodes

### Other Platforms
- CycIF (Cyclic Immunofluorescence)
- IMC (Imaging Mass Cytometry)
- MIBI (Multiplexed Ion Beam Imaging)

## CODEX Workflows

### Loading CODEX Data

CODEX data is typically organized in multi-channel image stacks from multiple acquisition cycles:

```python
from pathml.core import CODEXSlide

# Load CODEX dataset
codex_slide = CODEXSlide(
    path='path/to/codex_directory',
    stain='IF',  # Immunofluorescence
    backend='bioformats'
)

# Inspect channels and cycles
print(f"Number of channels: {codex_slide.num_channels}")
print(f"Channel names: {codex_slide.channel_names}")
print(f"Number of cycles: {codex_slide.num_cycles}")
print(f"Image shape: {codex_slide.shape}")
```

**CODEX directory structure:**
```
codex_directory/
├── cyc001_reg001/
│   ├── 1_00001_Z001_CH1.tif
│   ├── 1_00001_Z001_CH2.tif
│   └── ...
├── cyc002_reg001/
│   └── ...
└── channelnames.txt
```

### CODEX Preprocessing Pipeline

Complete pipeline for CODEX data processing:

```python
from pathml.preprocessing import Pipeline, CollapseRunsCODEX, SegmentMIF, QuantifyMIF

# Create CODEX-specific pipeline
codex_pipeline = Pipeline([
    # 1. Collapse multi-cycle data
    CollapseRunsCODEX(
        z_slice=2,  # Select focal plane from z-stack
        run_order=None,  # Automatic cycle ordering, or specify [0, 1, 2, ...]
        method='max'  # 'max', 'mean', or 'median' across cycles
    ),

    # 2. Cell segmentation using Mesmer
    SegmentMIF(
        nuclear_channel='DAPI',
        cytoplasm_channel='CD45',  # Or other membrane/cytoplasm marker
        model='mesmer',
        image_resolution=0.377,  # Microns per pixel
        compartment='whole-cell'  # 'nuclear', 'cytoplasm', or 'whole-cell'
    ),

    # 3. Quantify marker expression per cell
    QuantifyMIF(
        segmentation_mask_name='cell_segmentation',
        markers=[
            'DAPI', 'CD3', 'CD4', 'CD8', 'CD20', 'CD45',
            'CD68', 'PD1', 'PDL1', 'Ki67', 'panCK'
        ],
        output_format='anndata'
    )
])

# Run pipeline
codex_pipeline.run(codex_slide)

# Access results
segmentation_mask = codex_slide.masks['cell_segmentation']
cell_data = codex_slide.cell_data  # AnnData object
```

### CollapseRunsCODEX

Consolidates multi-cycle CODEX acquisitions into a single multi-channel image:

```python
from pathml.preprocessing import CollapseRunsCODEX

transform = CollapseRunsCODEX(
    z_slice=2,  # Select which z-plane (0-indexed)
    run_order=[0, 1, 2, 3],  # Order of acquisition cycles
    method='max',  # Aggregation method across cycles
    background_subtract=True,  # Subtract background fluorescence
    channel_mapping=None  # Optional: remap channel order
)
```

**Parameters:**
- `z_slice`: Which focal plane to extract from z-stacks (typically middle slice)
- `run_order`: Order of cycles; None for automatic detection
- `method`: How to combine channels from multiple cycles ('max', 'mean', 'median')
- `background_subtract`: Whether to subtract background fluorescence

**Output:** Single multi-channel image with all markers (H, W, C)

### Cell Segmentation with Mesmer

DeepCell Mesmer provides accurate cell segmentation for multiparametric imaging:

```python
from pathml.preprocessing import SegmentMIF

transform = SegmentMIF(
    nuclear_channel='DAPI',  # Nuclear marker (required)
    cytoplasm_channel='CD45',  # Cytoplasm/membrane marker (required)
    model='mesmer',  # DeepCell Mesmer model
    image_resolution=0.377,  # Microns per pixel (important for accuracy)
    compartment='whole-cell',  # Segmentation output
    min_cell_size=50,  # Minimum cell size in pixels
    max_cell_size=1000  # Maximum cell size in pixels
)
```

**Choosing cytoplasm channel:**
- **CD45**: Pan-leukocyte marker (good for immune-rich tissues)
- **panCK**: Pan-cytokeratin (good for epithelial tissues)
- **CD298/b2m**: Universal membrane marker
- **Combination**: Average multiple membrane markers

**Compartment options:**
- `'whole-cell'`: Full cell segmentation (nucleus + cytoplasm)
- `'nuclear'`: Nuclear segmentation only
- `'cytoplasm'`: Cytoplasmic compartment only

### Remote Segmentation

Use DeepCell cloud API for segmentation without local GPU:

```python
from pathml.preprocessing import SegmentMIFRemote

transform = SegmentMIFRemote(
    nuclear_channel='DAPI',
    cytoplasm_channel='CD45',
    model='mesmer',
    api_url='https://deepcell.org/api/predict',
    timeout=300  # Timeout in seconds
)
```

### Marker Quantification

Extract single-cell marker expression from segmented images:

```python
from pathml.preprocessing import QuantifyMIF

transform = QuantifyMIF(
    segmentation_mask_name='cell_segmentation',
    markers=['DAPI', 'CD3', 'CD4', 'CD8', 'CD20', 'CD68', 'panCK'],
    output_format='anndata',  # or 'dataframe'
    statistics=['mean', 'median', 'std', 'total'],  # Aggregation methods
    compartments=['whole-cell', 'nuclear', 'cytoplasm']  # If multiple masks
)
```

**Output:** AnnData object with:
- `adata.X`: Marker expression matrix (cells × markers)
- `adata.obs`: Cell metadata (cell ID, coordinates, area, etc.)
- `adata.var`: Marker metadata
- `adata.obsm['spatial']`: Cell centroid coordinates

### Integration with AnnData

Process multiple CODEX slides into unified AnnData object:

```python
from pathml.core import SlideDataset
import anndata as ad

# Process multiple slides
slide_paths = ['slide1', 'slide2', 'slide3']
dataset = SlideDataset(
    [CODEXSlide(p, stain='IF') for p in slide_paths]
)

# Run pipeline on all slides
dataset.run(codex_pipeline, distributed=True, n_workers=8)

# Combine into single AnnData
adatas = []
for slide in dataset:
    adata = slide.cell_data
    adata.obs['slide_id'] = slide.name
    adatas.append(adata)

# Concatenate
combined_adata = ad.concat(adatas, join='outer', label='batch', keys=slide_paths)

# Save for downstream analysis
combined_adata.write('codex_dataset.h5ad')
```

## Vectra Workflows

### Loading Vectra Data

Vectra stores data in proprietary `.qptiff` format:

```python
from pathml.core import SlideData, SlideType

# Load Vectra slide
vectra_slide = SlideData.from_slide(
    'path/to/slide.qptiff',
    backend=SlideType.VectraQPTIFF
)

# Access spectral channels
print(f"Channels: {vectra_slide.channel_names}")
```

### Vectra Preprocessing

```python
from pathml.preprocessing import Pipeline, CollapseRunsVectra, SegmentMIF, QuantifyMIF

vectra_pipeline = Pipeline([
    # 1. Process Vectra multi-channel data
    CollapseRunsVectra(
        wavelengths=[520, 540, 570, 620, 670, 780],  # Emission wavelengths
        unmix=True,  # Apply spectral unmixing
        autofluorescence_correction=True
    ),

    # 2. Cell segmentation
    SegmentMIF(
        nuclear_channel='DAPI',
        cytoplasm_channel='FITC',
        model='mesmer',
        image_resolution=0.5
    ),

    # 3. Quantification
    QuantifyMIF(
        segmentation_mask_name='cell_segmentation',
        markers=['DAPI', 'CD3', 'CD8', 'PD1', 'PDL1', 'panCK'],
        output_format='anndata'
    )
])

vectra_pipeline.run(vectra_slide)
```

## Downstream Analysis

### Cell Type Annotation

Annotate cells based on marker expression:

```python
import anndata as ad
import numpy as np

# Load quantified data
adata = ad.read_h5ad('codex_dataset.h5ad')

# Define cell types by marker thresholds
def annotate_cell_types(adata, thresholds):
    cell_types = np.full(adata.n_obs, 'Unknown', dtype=object)

    # T cells: CD3+
    cd3_pos = adata[:, 'CD3'].X.flatten() > thresholds['CD3']
    cell_types[cd3_pos] = 'T cell'

    # CD4 T cells: CD3+ CD4+ CD8-
    cd4_tcells = (
        (adata[:, 'CD3'].X.flatten() > thresholds['CD3']) &
        (adata[:, 'CD4'].X.flatten() > thresholds['CD4']) &
        (adata[:, 'CD8'].X.flatten() < thresholds['CD8'])
    )
    cell_types[cd4_tcells] = 'CD4 T cell'

    # CD8 T cells: CD3+ CD8+ CD4-
    cd8_tcells = (
        (adata[:, 'CD3'].X.flatten() > thresholds['CD3']) &
        (adata[:, 'CD8'].X.flatten() > thresholds['CD8']) &
        (adata[:, 'CD4'].X.flatten() < thresholds['CD4'])
    )
    cell_types[cd8_tcells] = 'CD8 T cell'

    # B cells: CD20+
    b_cells = adata[:, 'CD20'].X.flatten() > thresholds['CD20']
    cell_types[b_cells] = 'B cell'

    # Macrophages: CD68+
    macrophages = adata[:, 'CD68'].X.flatten() > thresholds['CD68']
    cell_types[macrophages] = 'Macrophage'

    # Tumor cells: panCK+
    tumor = adata[:, 'panCK'].X.flatten() > thresholds['panCK']
    cell_types[tumor] = 'Tumor'

    return cell_types

# Apply annotation
thresholds = {
    'CD3': 0.5,
    'CD4': 0.4,
    'CD8': 0.4,
    'CD20': 0.3,
    'CD68': 0.3,
    'panCK': 0.5
}

adata.obs['cell_type'] = annotate_cell_types(adata, thresholds)

# Visualize cell type composition
import matplotlib.pyplot as plt
cell_type_counts = adata.obs['cell_type'].value_counts()
plt.figure(figsize=(10, 6))
cell_type_counts.plot(kind='bar')
plt.xlabel('Cell Type')
plt.ylabel('Count')
plt.title('Cell Type Composition')
plt.xticks(rotation=45)
plt.tight_layout()
plt.show()
```

### Clustering

Unsupervised clustering to identify cell populations:

```python
import scanpy as sc

# Preprocessing for clustering
sc.pp.normalize_total(adata, target_sum=1e4)
sc.pp.log1p(adata)
sc.pp.scale(adata, max_value=10)

# PCA
sc.tl.pca(adata, n_comps=50)

# Neighborhood graph
sc.pp.neighbors(adata, n_neighbors=15, n_pcs=30)

# UMAP embedding
sc.tl.umap(adata)

# Leiden clustering
sc.tl.leiden(adata, resolution=0.5)

# Visualize
sc.pl.umap(adata, color=['leiden', 'CD3', 'CD8', 'CD20', 'panCK'])
```

### Spatial Visualization

Visualize cells in spatial context:

```python
import matplotlib.pyplot as plt

# Spatial scatter plot
fig, ax = plt.subplots(figsize=(15, 15))

# Color by cell type
cell_types = adata.obs['cell_type'].unique()
colors = plt.cm.tab10(np.linspace(0, 1, len(cell_types)))

for i, cell_type in enumerate(cell_types):
    mask = adata.obs['cell_type'] == cell_type
    coords = adata.obsm['spatial'][mask]
    ax.scatter(
        coords[:, 0],
        coords[:, 1],
        c=[colors[i]],
        label=cell_type,
        s=5,
        alpha=0.7
    )

ax.legend(markerscale=2)
ax.set_xlabel('X (pixels)')
ax.set_ylabel('Y (pixels)')
ax.set_title('Spatial Cell Type Distribution')
ax.axis('equal')
plt.tight_layout()
plt.show()
```

### Spatial Neighborhood Analysis

Analyze cell neighborhoods and interactions:

```python
import squidpy as sq

# Calculate spatial neighborhood enrichment
sq.gr.spatial_neighbors(adata, coord_type='generic', spatial_key='spatial')

# Neighborhood enrichment test
sq.gr.nhood_enrichment(adata, cluster_key='cell_type')

# Visualize interaction matrix
sq.pl.nhood_enrichment(adata, cluster_key='cell_type')

# Co-occurrence score
sq.gr.co_occurrence(adata, cluster_key='cell_type')
sq.pl.co_occurrence(
    adata,
    cluster_key='cell_type',
    clusters=['CD8 T cell', 'Tumor'],
    figsize=(8, 8)
)
```

### Spatial Autocorrelation

Test for spatial clustering of markers:

```python
# Moran's I spatial autocorrelation
sq.gr.spatial_autocorr(
    adata,
    mode='moran',
    genes=['CD3', 'CD8', 'PD1', 'PDL1', 'panCK']
)

# Visualize
results = adata.uns['moranI']
print(results.head())
```

## MERFISH Workflows

### Loading MERFISH Data

```python
from pathml.core import MERFISHSlide

# Load MERFISH dataset
merfish_slide = MERFISHSlide(
    path='path/to/merfish_data',
    fov_size=2048,  # Field of view size
    microns_per_pixel=0.108
)
```

### MERFISH Processing

```python
from pathml.preprocessing import Pipeline, DecodeMERFISH, SegmentMIF

merfish_pipeline = Pipeline([
    # 1. Decode barcodes to genes
    DecodeMERFISH(
        codebook='path/to/codebook.csv',
        error_correction=True,
        distance_threshold=0.5
    ),

    # 2. Cell segmentation
    SegmentMIF(
        nuclear_channel='DAPI',
        cytoplasm_channel='polyT',  # poly(T) stain for cell boundaries
        model='mesmer'
    ),

    # 3. Assign transcripts to cells
    AssignTranscripts(
        segmentation_mask_name='cell_segmentation',
        transcript_coords='decoded_spots'
    )
])

merfish_pipeline.run(merfish_slide)

# Output: AnnData with gene counts per cell
gene_expression = merfish_slide.cell_data
```

## Quality Control

### Segmentation Quality

```python
from pathml.utils import assess_segmentation_quality

# Check segmentation quality metrics
qc_metrics = assess_segmentation_quality(
    segmentation_mask,
    image,
    metrics=['cell_count', 'mean_cell_size', 'size_distribution']
)

print(f"Total cells: {qc_metrics['cell_count']}")
print(f"Mean cell size: {qc_metrics['mean_cell_size']:.1f} pixels")

# Visualize
import matplotlib.pyplot as plt
plt.hist(qc_metrics['cell_sizes'], bins=50)
plt.xlabel('Cell Size (pixels)')
plt.ylabel('Frequency')
plt.title('Cell Size Distribution')
plt.show()
```

### Marker Expression QC

```python
import scanpy as sc

# Load AnnData
adata = ad.read_h5ad('codex_dataset.h5ad')

# Calculate QC metrics
adata.obs['total_intensity'] = adata.X.sum(axis=1)
adata.obs['n_markers_detected'] = (adata.X > 0).sum(axis=1)

# Filter low-quality cells
adata = adata[adata.obs['total_intensity'] > 100, :]
adata = adata[adata.obs['n_markers_detected'] >= 3, :]

# Visualize
sc.pl.violin(adata, ['total_intensity', 'n_markers_detected'], multi_panel=True)
```

## Batch Processing

Process large multiparametric datasets efficiently:

```python
from pathml.core import SlideDataset
from pathml.preprocessing import Pipeline
from dask.distributed import Client
import glob

# Start Dask cluster
client = Client(n_workers=16, threads_per_worker=2, memory_limit='8GB')

# Find all CODEX slides
slide_dirs = glob.glob('data/codex_slides/*/')

# Create dataset
codex_slides = [CODEXSlide(d, stain='IF') for d in slide_dirs]
dataset = SlideDataset(codex_slides)

# Run pipeline in parallel
dataset.run(
    codex_pipeline,
    distributed=True,
    client=client,
    scheduler='distributed'
)

# Save processed data
for i, slide in enumerate(dataset):
    slide.cell_data.write(f'processed/slide_{i}.h5ad')

client.close()
```

## Integration with Other Tools

### Export to Spatial Analysis Tools

```python
# Export to Giotto
def export_to_giotto(adata, output_dir):
    import os
    os.makedirs(output_dir, exist_ok=True)

    # Expression matrix
    pd.DataFrame(
        adata.X.T,
        index=adata.var_names,
        columns=adata.obs_names
    ).to_csv(f'{output_dir}/expression.csv')

    # Cell coordinates
    pd.DataFrame(
        adata.obsm['spatial'],
        columns=['x', 'y'],
        index=adata.obs_names
    ).to_csv(f'{output_dir}/spatial_locs.csv')

# Export to Seurat
def export_to_seurat(adata, output_file):
    adata.write_h5ad(output_file)
    # Read in R with: library(Seurat); ReadH5AD(output_file)
```

## Best Practices

1. **Channel selection for segmentation:**
   - Use brightest, most consistent nuclear marker (usually DAPI)
   - Choose membrane/cytoplasm marker based on tissue type
   - Test multiple options to optimize segmentation

2. **Background subtraction:**
   - Apply before quantification to reduce autofluorescence
   - Use blank/control images to model background

3. **Quality control:**
   - Visualize segmentation on sample regions
   - Check cell size distributions for outliers
   - Validate marker expression ranges

4. **Cell type annotation:**
   - Start with canonical markers (CD3, CD20, panCK)
   - Use multiple markers for robust classification
   - Consider unsupervised clustering to discover populations

5. **Spatial analysis:**
   - Account for tissue architecture (epithelium, stroma, etc.)
   - Consider local density when interpreting interactions
   - Use permutation tests for statistical significance

6. **Batch effects:**
   - Include batch information in AnnData.obs
   - Apply batch correction if combining multiple experiments
   - Visualize batch effects with UMAP colored by batch

## Common Issues and Solutions

**Issue: Poor segmentation quality**
- Verify nuclear and cytoplasm channels are correctly specified
- Adjust image_resolution parameter to match actual resolution
- Try different cytoplasm markers
- Manually tune min/max cell size parameters

**Issue: Low marker intensity**
- Check for background subtraction artifacts
- Verify channel names match actual channels
- Inspect raw images for technical issues (focus, exposure)

**Issue: Cell type annotations don't match expectations**
- Adjust marker thresholds (too high/low)
- Visualize marker distributions to set data-driven thresholds
- Check for antibody specificity issues

**Issue: Spatial analysis shows no significant interactions**
- Increase neighborhood radius
- Check for sufficient cell numbers per type
- Verify spatial coordinates are correctly scaled

## Additional Resources

- **PathML Multiparametric API:** https://pathml.readthedocs.io/en/latest/api_multiparametric_reference.html
- **CODEX:** https://www.akoyabio.com/codex/
- **Vectra:** https://www.akoyabio.com/vectra/
- **DeepCell Mesmer:** https://www.deepcell.org/
- **Scanpy:** https://scanpy.readthedocs.io/ (single-cell analysis)
- **Squidpy:** https://squidpy.readthedocs.io/ (spatial omics analysis)
