# SQL Query Patterns for IDC

**Tested with:** idc-index 0.11.9 (IDC data version v23)

Quick reference for common SQL query patterns when working with IDC data. For detailed examples with context, see the "Core Capabilities" section in the main SKILL.md.

## When to Use This Guide

Load this guide when you need quick-reference SQL patterns for:
- Discovering available filter values (modalities, body parts, manufacturers)
- Finding annotations and segmentations across collections
- Querying slide microscopy and annotation data
- Estimating download sizes before download
- Linking imaging data to clinical data

For table schemas, DataFrame access, and join column references, see `references/index_tables_guide.md`.

## Prerequisites

```bash
pip install --upgrade idc-index
```

```python
from idc_index import IDCClient
client = IDCClient()
```

## Discover Available Filter Values

```python
# What modalities exist?
client.sql_query("SELECT DISTINCT Modality FROM index")

# What body parts for a specific modality?
client.sql_query("""
    SELECT DISTINCT BodyPartExamined, COUNT(*) as n
    FROM index WHERE Modality = 'CT' AND BodyPartExamined IS NOT NULL
    GROUP BY BodyPartExamined ORDER BY n DESC
""")

# What manufacturers for MR?
client.sql_query("""
    SELECT DISTINCT Manufacturer, COUNT(*) as n
    FROM index WHERE Modality = 'MR'
    GROUP BY Manufacturer ORDER BY n DESC
""")
```

## Find Annotations and Segmentations

**Note:** Not all image-derived objects belong to analysis result collections. Some annotations are deposited alongside original images. Use DICOM Modality or SOPClassUID to find all derived objects regardless of collection type.

```python
# Find ALL segmentations and structure sets by DICOM Modality
# SEG = DICOM Segmentation, RTSTRUCT = Radiotherapy Structure Set
client.sql_query("""
    SELECT collection_id, Modality, COUNT(*) as series_count
    FROM index
    WHERE Modality IN ('SEG', 'RTSTRUCT')
    GROUP BY collection_id, Modality
    ORDER BY series_count DESC
""")

# Find segmentations for a specific collection (includes non-analysis-result items)
client.sql_query("""
    SELECT SeriesInstanceUID, SeriesDescription, analysis_result_id
    FROM index
    WHERE collection_id = 'tcga_luad' AND Modality = 'SEG'
""")

# List analysis result collections (curated derived datasets)
client.fetch_index("analysis_results_index")
client.sql_query("""
    SELECT analysis_result_id, analysis_result_title, Collections, Modalities
    FROM analysis_results_index
""")

# Find analysis results for a specific source collection
client.sql_query("""
    SELECT analysis_result_id, analysis_result_title
    FROM analysis_results_index
    WHERE Collections LIKE '%tcga_luad%'
""")

# Use seg_index for detailed DICOM Segmentation metadata
client.fetch_index("seg_index")

# Get segmentation statistics by algorithm
client.sql_query("""
    SELECT AlgorithmName, AlgorithmType, COUNT(*) as seg_count
    FROM seg_index
    WHERE AlgorithmName IS NOT NULL
    GROUP BY AlgorithmName, AlgorithmType
    ORDER BY seg_count DESC
    LIMIT 10
""")

# Find segmentations for specific source images (e.g., chest CT)
client.sql_query("""
    SELECT
        s.SeriesInstanceUID as seg_series,
        s.AlgorithmName,
        s.total_segments,
        s.segmented_SeriesInstanceUID as source_series
    FROM seg_index s
    JOIN index src ON s.segmented_SeriesInstanceUID = src.SeriesInstanceUID
    WHERE src.Modality = 'CT' AND src.BodyPartExamined = 'CHEST'
    LIMIT 10
""")

# Find TotalSegmentator results with source image context
client.sql_query("""
    SELECT
        seg_info.collection_id,
        COUNT(DISTINCT s.SeriesInstanceUID) as seg_count,
        SUM(s.total_segments) as total_segments
    FROM seg_index s
    JOIN index seg_info ON s.SeriesInstanceUID = seg_info.SeriesInstanceUID
    WHERE s.AlgorithmName LIKE '%TotalSegmentator%'
    GROUP BY seg_info.collection_id
    ORDER BY seg_count DESC
""")

# Use ann_index and ann_group_index for Microscopy Bulk Simple Annotations
# ann_group_index has AnnotationGroupLabel, GraphicType, NumberOfAnnotations, AlgorithmName
client.fetch_index("ann_index")
client.fetch_index("ann_group_index")
client.sql_query("""
    SELECT g.AnnotationGroupLabel, g.GraphicType, g.NumberOfAnnotations, i.collection_id
    FROM ann_group_index g
    JOIN ann_index a ON g.SeriesInstanceUID = a.SeriesInstanceUID
    JOIN index i ON a.SeriesInstanceUID = i.SeriesInstanceUID
    WHERE g.AlgorithmName IS NOT NULL
    LIMIT 10
""")
# See references/digital_pathology_guide.md for AnnotationGroupLabel filtering, SM+ANN joins, and more
```

## Query Slide Microscopy and Annotation Data

Use `sm_index` for slide microscopy metadata and `ann_index`/`ann_group_index` for annotations on slides (DICOM ANN objects). Filter annotation groups by `AnnotationGroupLabel` to find annotations by name.

```python
client.fetch_index("sm_index")
client.fetch_index("ann_index")
client.fetch_index("ann_group_index")

# Example: find annotation groups by label within a collection
client.sql_query("""
    SELECT g.AnnotationGroupLabel, g.GraphicType, g.NumberOfAnnotations
    FROM ann_group_index g
    JOIN index i ON g.SeriesInstanceUID = i.SeriesInstanceUID
    WHERE i.collection_id = 'your_collection_id'
      AND LOWER(g.AnnotationGroupLabel) LIKE '%keyword%'
""")
```

See `references/digital_pathology_guide.md` for SM queries, ANN filtering patterns, SM+ANN cross-references, and join examples.

## Estimate Download Size

```python
# Size for specific criteria
client.sql_query("""
    SELECT SUM(series_size_MB) as total_mb, COUNT(*) as series_count
    FROM index
    WHERE collection_id = 'nlst' AND Modality = 'CT'
""")
```

## Link to Clinical Data

```python
client.fetch_index("clinical_index")

# Find collections with clinical data and their tables
client.sql_query("""
    SELECT collection_id, table_name, COUNT(DISTINCT column_label) as columns
    FROM clinical_index
    GROUP BY collection_id, table_name
    ORDER BY collection_id
""")
```

See `references/clinical_data_guide.md` for complete patterns including value mapping and patient cohort selection.

## Troubleshooting

**Issue:** Query returns error "table not found"
- **Cause:** Index not fetched before query
- **Solution:** Call `client.fetch_index("table_name")` before using tables other than the primary `index`

**Issue:** LIKE pattern not matching expected results
- **Cause:** Case sensitivity or whitespace
- **Solution:** Use `LOWER(column)` for case-insensitive matching, `TRIM()` for whitespace

**Issue:** JOIN returns fewer rows than expected
- **Cause:** NULL values in join columns or no matching records
- **Solution:** Use `LEFT JOIN` to include rows without matches, check for NULLs with `IS NOT NULL`

## Resources

- `references/index_tables_guide.md` for table schemas, DataFrame access, and join column references
- `references/clinical_data_guide.md` for clinical data patterns and value mapping
- `references/digital_pathology_guide.md` for pathology-specific queries
- `references/bigquery_guide.md` for advanced queries requiring full DICOM metadata
