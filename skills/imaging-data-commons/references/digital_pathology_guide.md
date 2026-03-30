# Digital Pathology Guide for IDC

**Tested with:** IDC data version v23, idc-index 0.11.10

For general IDC queries and downloads, use `idc-index` (see main SKILL.md). This guide covers slide microscopy (SM) imaging, microscopy bulk simple annotations (ANN), and segmentations (SEG) in the context of digital pathology in IDC.

## Index Tables for Digital Pathology

Five specialized index tables provide curated metadata without needing BigQuery:

| Table | Row Granularity | Description |
|-------|-----------------|-------------|
| `sm_index` | 1 row = 1 SM series | Slide Microscopy series metadata: container/slide ID, tissue type, anatomic structure, diagnosis, lens power, pixel spacing, image dimensions |
| `sm_instance_index` | 1 row = 1 SM instance | Instance-level (SOPInstanceUID) metadata for individual slide images |
| `seg_index` | 1 row = 1 SEG series | DICOM Segmentation metadata: algorithm, segment count, reference to source series. Used for both radiology and pathology — filter by source Modality to find pathology-specific segmentations |
| `ann_index` | 1 row = 1 ANN series | Microscopy Bulk Simple Annotations series metadata; includes `referenced_SeriesInstanceUID` linking to the annotated slide |
| `ann_group_index` | 1 row = 1 annotation group | Annotation group details: `AnnotationGroupLabel`, `GraphicType`, `NumberOfAnnotations`, `AlgorithmName`, property codes |

All require `client.fetch_index("table_name")` before querying. Use `client.indices_overview` to inspect column schemas programmatically.

## Slide Microscopy Queries

### Basic SM metadata

```python
from idc_index import IDCClient
client = IDCClient()

# sm_index has detailed metadata; join with index for collection_id
client.fetch_index("sm_index")
client.sql_query("""
    SELECT i.collection_id, COUNT(*) as slides,
           MIN(s.min_PixelSpacing_2sf) as min_resolution
    FROM sm_index s
    JOIN index i ON s.SeriesInstanceUID = i.SeriesInstanceUID
    GROUP BY i.collection_id
    ORDER BY slides DESC
""")
```

### Find SM series with specific properties

```python
# Find high-resolution slides with specific objective lens power
client.fetch_index("sm_index")
client.sql_query("""
    SELECT
        i.collection_id,
        i.PatientID,
        s.ObjectiveLensPower,
        s.min_PixelSpacing_2sf
    FROM sm_index s
    JOIN index i ON s.SeriesInstanceUID = i.SeriesInstanceUID
    WHERE s.ObjectiveLensPower >= 40
    ORDER BY s.min_PixelSpacing_2sf
    LIMIT 20
""")
```

### Filter by specimen preparation

The `sm_index` includes staining, embedding, and fixative metadata. These columns are **arrays** (e.g., `[hematoxylin stain, water soluble eosin stain]` for H&E) — use `array_to_string()` with `LIKE` or `list_contains()` to filter.

```python
# Find H&E-stained slides in a collection
client.fetch_index("sm_index")
client.sql_query("""
    SELECT
        i.PatientID,
        s.staining_usingSubstance_CodeMeaning as staining,
        s.embeddingMedium_CodeMeaning as embedding,
        s.tissueFixative_CodeMeaning as fixative
    FROM sm_index s
    JOIN index i ON s.SeriesInstanceUID = i.SeriesInstanceUID
    WHERE i.collection_id = 'tcga_brca'
      AND array_to_string(s.staining_usingSubstance_CodeMeaning, ', ') LIKE '%hematoxylin%'
    LIMIT 10
""")
```

```python
# Compare FFPE vs frozen slides across collections
client.sql_query("""
    SELECT
        i.collection_id,
        s.embeddingMedium_CodeMeaning as embedding,
        COUNT(*) as slide_count
    FROM sm_index s
    JOIN index i ON s.SeriesInstanceUID = i.SeriesInstanceUID
    GROUP BY i.collection_id, embedding
    ORDER BY i.collection_id, slide_count DESC
""")
```

## Identifying Tumor vs Normal Slides

The `sm_index` table provides two ways to identify tissue type:

| Column | Use Case |
|--------|----------|
| `primaryAnatomicStructureModifier_CodeMeaning` | Structured tissue type from DICOM specimen metadata (e.g., `Neoplasm, Primary`, `Normal`, `Tumor`, `Neoplasm, Metastatic`). Works across all collections with SM data. |
| `ContainerIdentifier` | Slide/container identifier. For TCGA collections, contains the [TCGA barcode](https://docs.gdc.cancer.gov/Encyclopedia/pages/TCGA_Barcode/) where the [sample type code](https://gdc.cancer.gov/resources-tcga-users/tcga-code-tables/sample-type-codes) (positions 14-15) encodes tissue origin: `01`-`09` = tumor, `10`-`19` = normal. |

### Using structured tissue type metadata

```python
from idc_index import IDCClient
client = IDCClient()
client.fetch_index("sm_index")

# Discover tissue type values across all SM data
client.sql_query("""
    SELECT
        s.primaryAnatomicStructureModifier_CodeMeaning as tissue_type,
        COUNT(*) as slide_count
    FROM sm_index s
    WHERE s.primaryAnatomicStructureModifier_CodeMeaning IS NOT NULL
    GROUP BY tissue_type
    ORDER BY slide_count DESC
""")
```

#### Example: Tumor vs normal slides in TCGA-BRCA

```python
# Tissue type breakdown for TCGA-BRCA
client.sql_query("""
    SELECT
        s.primaryAnatomicStructureModifier_CodeMeaning as tissue_type,
        COUNT(*) as slide_count,
        COUNT(DISTINCT i.PatientID) as patient_count
    FROM sm_index s
    JOIN index i ON s.SeriesInstanceUID = i.SeriesInstanceUID
    WHERE i.collection_id = 'tcga_brca'
    GROUP BY tissue_type
    ORDER BY slide_count DESC
""")
# Returns: Neoplasm, Primary (2704 slides), Normal (399 slides)
```

### Using TCGA barcode (TCGA collections only)

For TCGA collections, `ContainerIdentifier` contains the slide barcode (e.g., `TCGA-E9-A3X8-01A-03-TSC`). Extract the sample type code to classify tissue:

```python
# Parse sample type from TCGA barcode
client.sql_query("""
    SELECT
        SUBSTRING(SPLIT_PART(s.ContainerIdentifier, '-', 4), 1, 2) as sample_type_code,
        s.primaryAnatomicStructureModifier_CodeMeaning as tissue_type,
        COUNT(*) as slide_count
    FROM sm_index s
    JOIN index i ON s.SeriesInstanceUID = i.SeriesInstanceUID
    WHERE i.collection_id = 'tcga_brca'
    GROUP BY sample_type_code, tissue_type
    ORDER BY sample_type_code
""")
# Returns: 01 → Neoplasm, Primary (2704), 06 → None (8), 11 → Normal (399)
```

The barcode approach catches cases where structured metadata is NULL (e.g., `06` = Metastatic slides have `primaryAnatomicStructureModifier_CodeMeaning` = NULL in TCGA-BRCA).

## Annotation Queries (ANN)

DICOM Microscopy Bulk Simple Annotations (Modality = 'ANN') are annotations **on** slide microscopy images. They appear in `ann_index` (series-level) and `ann_group_index` (group-level detail). Each ANN series references the slide it annotates via `referenced_SeriesInstanceUID`.

### Basic annotation discovery

```python
# Find annotation series and their referenced images
client.fetch_index("ann_index")
client.fetch_index("ann_group_index")

client.sql_query("""
    SELECT
        a.SeriesInstanceUID as ann_series,
        a.AnnotationCoordinateType,
        a.referenced_SeriesInstanceUID as source_series
    FROM ann_index a
    LIMIT 10
""")
```

### Annotation group statistics

```python
# Get annotation group details (graphic types, counts, algorithms)
client.sql_query("""
    SELECT
        GraphicType,
        SUM(NumberOfAnnotations) as total_annotations,
        COUNT(*) as group_count
    FROM ann_group_index
    GROUP BY GraphicType
    ORDER BY total_annotations DESC
""")
```

### Find annotations with source slide context

```python
# Find annotations with their source slide microscopy context
client.sql_query("""
    SELECT
        i.collection_id,
        g.GraphicType,
        g.AnnotationPropertyType_CodeMeaning,
        g.AlgorithmName,
        g.NumberOfAnnotations
    FROM ann_group_index g
    JOIN ann_index a ON g.SeriesInstanceUID = a.SeriesInstanceUID
    JOIN index i ON a.referenced_SeriesInstanceUID = i.SeriesInstanceUID
    WHERE g.AlgorithmName IS NOT NULL
    LIMIT 10
""")
```

## Segmentations on Slide Microscopy

DICOM Segmentations (Modality = 'SEG') are used for both radiology (e.g., organ segmentations on CT) and pathology (e.g., tissue region segmentations on whole slide images). Use `seg_index.segmented_SeriesInstanceUID` to find the source series, then filter by source Modality to isolate pathology segmentations.

```python
# Find segmentations whose source is a slide microscopy image
client.fetch_index("seg_index")
client.fetch_index("sm_index")
client.sql_query("""
    SELECT
        seg.SeriesInstanceUID as seg_series,
        seg.AlgorithmName,
        seg.total_segments,
        src.collection_id,
        src.Modality as source_modality
    FROM seg_index seg
    JOIN index src ON seg.segmented_SeriesInstanceUID = src.SeriesInstanceUID
    WHERE src.Modality = 'SM'
    LIMIT 20
""")
```

## Finding Pre-Computed Analysis Results

IDC hosts derived datasets (nuclei segmentations, TIL maps, AI annotations) identified by `analysis_result_id` in the main `index` table. Use `analysis_results_index` to discover what's available for pathology.

```python
from idc_index import IDCClient
client = IDCClient()
client.fetch_index("analysis_results_index")

# Find analysis results that include pathology annotations or segmentations
client.sql_query("""
    SELECT
        ar.analysis_result_id,
        ar.analysis_result_title,
        ar.Modalities,
        ar.Subjects,
        ar.Collections
    FROM analysis_results_index ar
    WHERE ar.Modalities LIKE '%ANN%' OR ar.Modalities LIKE '%SEG%'
    ORDER BY ar.Subjects DESC
""")
```

### Find analysis results for a specific slide

```python
# Find all derived data (annotations, segmentations) for TCGA-BRCA slides
client.fetch_index("ann_index")
client.sql_query("""
    SELECT
        i.analysis_result_id,
        i.PatientID,
        a.referenced_SeriesInstanceUID as source_slide,
        g.AnnotationGroupLabel,
        g.NumberOfAnnotations,
        g.AlgorithmName
    FROM ann_group_index g
    JOIN ann_index a ON g.SeriesInstanceUID = a.SeriesInstanceUID
    JOIN index i ON a.SeriesInstanceUID = i.SeriesInstanceUID
    WHERE i.collection_id = 'tcga_brca'
    LIMIT 10
""")
```

Annotation objects can also contain per-annotation **measurements** (e.g., nucleus area, eccentricity) stored within the DICOM file. These are not in the index tables — extract them after download using [highdicom](https://github.com/ImagingDataCommons/highdicom) (`ann.get_annotation_groups()`, `group.get_measurements()`). See the [microscopy_dicom_ann_intro](https://github.com/ImagingDataCommons/IDC-Tutorials/blob/master/notebooks/pathomics/microscopy_dicom_ann_intro.ipynb) tutorial for a worked example including spatial analysis and cellularity computation.

## Filter by AnnotationGroupLabel

`AnnotationGroupLabel` is the most direct column for finding annotation groups by name or semantic content. Use `LIKE` with wildcards for text search.

### Simple label filtering

```python
# Find annotation groups by label (e.g., groups mentioning "blast")
client.fetch_index("ann_group_index")
client.sql_query("""
    SELECT
        g.SeriesInstanceUID,
        g.AnnotationGroupLabel,
        g.GraphicType,
        g.NumberOfAnnotations,
        g.AlgorithmName
    FROM ann_group_index g
    WHERE LOWER(g.AnnotationGroupLabel) LIKE '%blast%'
    ORDER BY g.NumberOfAnnotations DESC
""")
```

### Label filtering with collection context

```python
# Find annotation groups matching a label within a specific collection
client.fetch_index("ann_index")
client.fetch_index("ann_group_index")
client.sql_query("""
    SELECT
        i.collection_id,
        g.AnnotationGroupLabel,
        g.GraphicType,
        g.NumberOfAnnotations,
        g.AnnotationPropertyType_CodeMeaning
    FROM ann_group_index g
    JOIN ann_index a ON g.SeriesInstanceUID = a.SeriesInstanceUID
    JOIN index i ON a.SeriesInstanceUID = i.SeriesInstanceUID
    WHERE i.collection_id = 'your_collection_id'
      AND LOWER(g.AnnotationGroupLabel) LIKE '%keyword%'
    ORDER BY g.NumberOfAnnotations DESC
""")
```

## Annotations on Slide Microscopy (SM + ANN Cross-Reference)

When looking for annotations related to slide microscopy data, use both SM and ANN tables together. The `ann_index.referenced_SeriesInstanceUID` links each annotation series to its source slide.

```python
# Find slide microscopy images and their annotations in a collection
client.fetch_index("sm_index")
client.fetch_index("ann_index")
client.fetch_index("ann_group_index")
client.sql_query("""
    SELECT
        i.collection_id,
        s.ObjectiveLensPower,
        g.AnnotationGroupLabel,
        g.NumberOfAnnotations,
        g.GraphicType
    FROM ann_group_index g
    JOIN ann_index a ON g.SeriesInstanceUID = a.SeriesInstanceUID
    JOIN sm_index s ON a.referenced_SeriesInstanceUID = s.SeriesInstanceUID
    JOIN index i ON a.SeriesInstanceUID = i.SeriesInstanceUID
    WHERE i.collection_id = 'your_collection_id'
    ORDER BY g.NumberOfAnnotations DESC
""")
```

## Join Patterns

### SM join (slide microscopy details with collection context)

```python
client.fetch_index("sm_index")
result = client.sql_query("""
    SELECT i.collection_id, i.PatientID, s.ObjectiveLensPower, s.min_PixelSpacing_2sf
    FROM index i
    JOIN sm_index s ON i.SeriesInstanceUID = s.SeriesInstanceUID
    LIMIT 10
""")
```

### ANN join (annotation groups with collection context)

```python
client.fetch_index("ann_index")
client.fetch_index("ann_group_index")
result = client.sql_query("""
    SELECT
        i.collection_id,
        g.AnnotationGroupLabel,
        g.GraphicType,
        g.NumberOfAnnotations,
        a.referenced_SeriesInstanceUID as source_series
    FROM ann_group_index g
    JOIN ann_index a ON g.SeriesInstanceUID = a.SeriesInstanceUID
    JOIN index i ON a.SeriesInstanceUID = i.SeriesInstanceUID
    LIMIT 10
""")
```

## Related Tools

The following tools work with DICOM format for digital pathology workflows:

**Python Libraries:**
- [highdicom](https://github.com/ImagingDataCommons/highdicom) - High-level DICOM abstractions for Python. Create and read DICOM Segmentations (SEG), Structured Reports (SR), and parametric maps for pathology and radiology. Developed by IDC.
- [wsidicom](https://github.com/imi-bigpicture/wsidicom) - Python package for reading DICOM WSI datasets. Parses metadata into easy-to-use dataclasses for whole slide image analysis.
- [TIA-Toolbox](https://github.com/TissueImageAnalytics/tiatoolbox) - End-to-end computational pathology library with DICOM support via `DICOMWSIReader`. Provides tile extraction, feature extraction, and pretrained deep learning models.
- [EZ-WSI-DICOMweb](https://github.com/GoogleCloudPlatform/EZ-WSI-DICOMweb) - Extract image patches from DICOM whole slide images via DICOMweb. Designed for AI/ML workflows with cloud DICOM stores.

**Viewers:**
- [Slim](https://github.com/ImagingDataCommons/slim) - Web-based DICOM slide microscopy viewer and annotation tool. Supports brightfield and multiplexed immunofluorescence imaging via DICOMweb. Developed by IDC.
- [QuPath](https://qupath.github.io/) - Cross-platform open source software for whole slide image analysis. Supports DICOM WSI via Bio-Formats and OpenSlide (v0.4.0+).

**Conversion:**
- [dicom_wsi](https://github.com/Steven-N-Hart/dicom_wsi) - Python implementation for converting proprietary WSI formats to DICOM-compliant files.
