---
name: pathml
description: Full-featured computational pathology toolkit. Use for advanced WSI analysis including multiplexed immunofluorescence (CODEX, Vectra), nucleus segmentation, tissue graph construction, and ML model training on pathology data. Supports 160+ slide formats. For simple tile extraction from H&E slides, histolab may be simpler.
license: GPL-2.0 license
metadata:
    skill-author: K-Dense Inc.
---

# PathML

## Overview

PathML is a comprehensive Python toolkit for computational pathology workflows, designed to facilitate machine learning and image analysis for whole-slide pathology images. The framework provides modular, composable tools for loading diverse slide formats, preprocessing images, constructing spatial graphs, training deep learning models, and analyzing multiparametric imaging data from technologies like CODEX and multiplex immunofluorescence.

## When to Use This Skill

Apply this skill for:
- Loading and processing whole-slide images (WSI) in various proprietary formats
- Preprocessing H&E stained tissue images with stain normalization
- Nucleus detection, segmentation, and classification workflows
- Building cell and tissue graphs for spatial analysis
- Training or deploying machine learning models (HoVer-Net, HACTNet) on pathology data
- Analyzing multiparametric imaging (CODEX, Vectra, MERFISH) for spatial proteomics
- Quantifying marker expression from multiplex immunofluorescence
- Managing large-scale pathology datasets with HDF5 storage
- Tile-based analysis and stitching operations

## Core Capabilities

PathML provides six major capability areas documented in detail within reference files:

### 1. Image Loading & Formats

Load whole-slide images from 160+ proprietary formats including Aperio SVS, Hamamatsu NDPI, Leica SCN, Zeiss ZVI, DICOM, and OME-TIFF. PathML automatically handles vendor-specific formats and provides unified interfaces for accessing image pyramids, metadata, and regions of interest.

**See:** `references/image_loading.md` for supported formats, loading strategies, and working with different slide types.

### 2. Preprocessing Pipelines

Build modular preprocessing pipelines by composing transforms for image manipulation, quality control, stain normalization, tissue detection, and mask operations. PathML's Pipeline architecture enables reproducible, scalable preprocessing across large datasets.

**Key transforms:**
- `StainNormalizationHE` - Macenko/Vahadane stain normalization
- `TissueDetectionHE`, `NucleusDetectionHE` - Tissue/nucleus segmentation
- `MedianBlur`, `GaussianBlur` - Noise reduction
- `LabelArtifactTileHE` - Quality control for artifacts

**See:** `references/preprocessing.md` for complete transform catalog, pipeline construction, and preprocessing workflows.

### 3. Graph Construction

Construct spatial graphs representing cellular and tissue-level relationships. Extract features from segmented objects to create graph-based representations suitable for graph neural networks and spatial analysis.

**See:** `references/graphs.md` for graph construction methods, feature extraction, and spatial analysis workflows.

### 4. Machine Learning

Train and deploy deep learning models for nucleus detection, segmentation, and classification. PathML integrates PyTorch with pre-built models (HoVer-Net, HACTNet), custom DataLoaders, and ONNX support for inference.

**Key models:**
- **HoVer-Net** - Simultaneous nucleus segmentation and classification
- **HACTNet** - Hierarchical cell-type classification

**See:** `references/machine_learning.md` for model training, evaluation, inference workflows, and working with public datasets.

### 5. Multiparametric Imaging

Analyze spatial proteomics and gene expression data from CODEX, Vectra, MERFISH, and other multiplex imaging platforms. PathML provides specialized slide classes and transforms for processing multiparametric data, cell segmentation with Mesmer, and quantification workflows.

**See:** `references/multiparametric.md` for CODEX/Vectra workflows, cell segmentation, marker quantification, and integration with AnnData.

### 6. Data Management

Efficiently store and manage large pathology datasets using HDF5 format. PathML handles tiles, masks, metadata, and extracted features in unified storage structures optimized for machine learning workflows.

**See:** `references/data_management.md` for HDF5 integration, tile management, dataset organization, and batch processing strategies.

## Quick Start

### Installation

```bash
# Install PathML
uv pip install pathml

# With optional dependencies for all features
uv pip install pathml[all]
```

### Basic Workflow Example

```python
from pathml.core import SlideData
from pathml.preprocessing import Pipeline, StainNormalizationHE, TissueDetectionHE

# Load a whole-slide image
wsi = SlideData.from_slide("path/to/slide.svs")

# Create preprocessing pipeline
pipeline = Pipeline([
    TissueDetectionHE(),
    StainNormalizationHE(target='normalize', stain_estimation_method='macenko')
])

# Run pipeline
pipeline.run(wsi)

# Access processed tiles
for tile in wsi.tiles:
    processed_image = tile.image
    tissue_mask = tile.masks['tissue']
```

### Common Workflows

**H&E Image Analysis:**
1. Load WSI with appropriate slide class
2. Apply tissue detection and stain normalization
3. Perform nucleus detection or train segmentation models
4. Extract features and build spatial graphs
5. Conduct downstream analysis

**Multiparametric Imaging (CODEX):**
1. Load CODEX slide with `CODEXSlide`
2. Collapse multi-run channel data
3. Segment cells using Mesmer model
4. Quantify marker expression
5. Export to AnnData for single-cell analysis

**Training ML Models:**
1. Prepare dataset with public pathology data
2. Create PyTorch DataLoader with PathML datasets
3. Train HoVer-Net or custom models
4. Evaluate on held-out test sets
5. Deploy with ONNX for inference

## References to Detailed Documentation

When working on specific tasks, refer to the appropriate reference file for comprehensive information:

- **Loading images:** `references/image_loading.md`
- **Preprocessing workflows:** `references/preprocessing.md`
- **Spatial analysis:** `references/graphs.md`
- **Model training:** `references/machine_learning.md`
- **CODEX/multiplex IF:** `references/multiparametric.md`
- **Data storage:** `references/data_management.md`

## Resources

This skill includes comprehensive reference documentation organized by capability area. Each reference file contains detailed API information, workflow examples, best practices, and troubleshooting guidance for specific PathML functionality.

### references/

Documentation files providing in-depth coverage of PathML capabilities:

- `image_loading.md` - Whole-slide image formats, loading strategies, slide classes
- `preprocessing.md` - Complete transform catalog, pipeline construction, preprocessing workflows
- `graphs.md` - Graph construction methods, feature extraction, spatial analysis
- `machine_learning.md` - Model architectures, training workflows, evaluation, inference
- `multiparametric.md` - CODEX, Vectra, multiplex IF analysis, cell segmentation, quantification
- `data_management.md` - HDF5 storage, tile management, batch processing, dataset organization

Load these references as needed when working on specific computational pathology tasks.

