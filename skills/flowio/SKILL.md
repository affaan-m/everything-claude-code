---
name: flowio
description: Parse FCS (Flow Cytometry Standard) files v2.0-3.1. Extract events as NumPy arrays, read metadata/channels, convert to CSV/DataFrame, for flow cytometry data preprocessing.
license: BSD-3-Clause license
metadata:
    skill-author: K-Dense Inc.
---

# FlowIO: Flow Cytometry Standard File Handler

## Overview

FlowIO is a lightweight Python library for reading and writing Flow Cytometry Standard (FCS) files. Parse FCS metadata, extract event data, and create new FCS files with minimal dependencies. The library supports FCS versions 2.0, 3.0, and 3.1, making it ideal for backend services, data pipelines, and basic cytometry file operations.

## When to Use This Skill

This skill should be used when:

- FCS files requiring parsing or metadata extraction
- Flow cytometry data needing conversion to NumPy arrays
- Event data requiring export to FCS format
- Multi-dataset FCS files needing separation
- Channel information extraction (scatter, fluorescence, time)
- Cytometry file validation or inspection
- Pre-processing workflows before advanced analysis

**Related Tools:** For advanced flow cytometry analysis including compensation, gating, and FlowJo/GatingML support, recommend FlowKit library as a companion to FlowIO.

## Installation

```bash
uv pip install flowio
```

Requires Python 3.9 or later.

## Quick Start

### Basic File Reading

```python
from flowio import FlowData

# Read FCS file
flow_data = FlowData('experiment.fcs')

# Access basic information
print(f"FCS Version: {flow_data.version}")
print(f"Events: {flow_data.event_count}")
print(f"Channels: {flow_data.pnn_labels}")

# Get event data as NumPy array
events = flow_data.as_array()  # Shape: (events, channels)
```

### Creating FCS Files

```python
import numpy as np
from flowio import create_fcs

# Prepare data
data = np.array([[100, 200, 50], [150, 180, 60]])  # 2 events, 3 channels
channels = ['FSC-A', 'SSC-A', 'FL1-A']

# Create FCS file
create_fcs('output.fcs', data, channels)
```

## Core Workflows

### Reading and Parsing FCS Files

The FlowData class provides the primary interface for reading FCS files.

**Standard Reading:**

```python
from flowio import FlowData

# Basic reading
flow = FlowData('sample.fcs')

# Access attributes
version = flow.version              # '3.0', '3.1', etc.
event_count = flow.event_count      # Number of events
channel_count = flow.channel_count  # Number of channels
pnn_labels = flow.pnn_labels        # Short channel names
pns_labels = flow.pns_labels        # Descriptive stain names

# Get event data
events = flow.as_array()            # Preprocessed (gain, log scaling applied)
raw_events = flow.as_array(preprocess=False)  # Raw data
```

**Memory-Efficient Metadata Reading:**

When only metadata is needed (no event data):

```python
# Only parse TEXT segment, skip DATA and ANALYSIS
flow = FlowData('sample.fcs', only_text=True)

# Access metadata
metadata = flow.text  # Dictionary of TEXT segment keywords
print(metadata.get('$DATE'))  # Acquisition date
print(metadata.get('$CYT'))   # Instrument name
```

**Handling Problematic Files:**

Some FCS files have offset discrepancies or errors:

```python
# Ignore offset discrepancies between HEADER and TEXT sections
flow = FlowData('problematic.fcs', ignore_offset_discrepancy=True)

# Use HEADER offsets instead of TEXT offsets
flow = FlowData('problematic.fcs', use_header_offsets=True)

# Ignore offset errors entirely
flow = FlowData('problematic.fcs', ignore_offset_error=True)
```

**Excluding Null Channels:**

```python
# Exclude specific channels during parsing
flow = FlowData('sample.fcs', null_channel_list=['Time', 'Null'])
```

### Extracting Metadata and Channel Information

FCS files contain rich metadata in the TEXT segment.

**Common Metadata Keywords:**

```python
flow = FlowData('sample.fcs')

# File-level metadata
text_dict = flow.text
acquisition_date = text_dict.get('$DATE', 'Unknown')
instrument = text_dict.get('$CYT', 'Unknown')
data_type = flow.data_type  # 'I', 'F', 'D', 'A'

# Channel metadata
for i in range(flow.channel_count):
    pnn = flow.pnn_labels[i]      # Short name (e.g., 'FSC-A')
    pns = flow.pns_labels[i]      # Descriptive name (e.g., 'Forward Scatter')
    pnr = flow.pnr_values[i]      # Range/max value
    print(f"Channel {i}: {pnn} ({pns}), Range: {pnr}")
```

**Channel Type Identification:**

FlowIO automatically categorizes channels:

```python
# Get indices by channel type
scatter_idx = flow.scatter_indices    # [0, 1] for FSC, SSC
fluoro_idx = flow.fluoro_indices      # [2, 3, 4] for FL channels
time_idx = flow.time_index            # Index of time channel (or None)

# Access specific channel types
events = flow.as_array()
scatter_data = events[:, scatter_idx]
fluorescence_data = events[:, fluoro_idx]
```

**ANALYSIS Segment:**

If present, access processed results:

```python
if flow.analysis:
    analysis_keywords = flow.analysis  # Dictionary of ANALYSIS keywords
    print(analysis_keywords)
```

### Creating New FCS Files

Generate FCS files from NumPy arrays or other data sources.

**Basic Creation:**

```python
import numpy as np
from flowio import create_fcs

# Create event data (rows=events, columns=channels)
events = np.random.rand(10000, 5) * 1000

# Define channel names
channel_names = ['FSC-A', 'SSC-A', 'FL1-A', 'FL2-A', 'Time']

# Create FCS file
create_fcs('output.fcs', events, channel_names)
```

**With Descriptive Channel Names:**

```python
# Add optional descriptive names (PnS)
channel_names = ['FSC-A', 'SSC-A', 'FL1-A', 'FL2-A', 'Time']
descriptive_names = ['Forward Scatter', 'Side Scatter', 'FITC', 'PE', 'Time']

create_fcs('output.fcs',
           events,
           channel_names,
           opt_channel_names=descriptive_names)
```

**With Custom Metadata:**

```python
# Add TEXT segment metadata
metadata = {
    '$SRC': 'Python script',
    '$DATE': '19-OCT-2025',
    '$CYT': 'Synthetic Instrument',
    '$INST': 'Laboratory A'
}

create_fcs('output.fcs',
           events,
           channel_names,
           opt_channel_names=descriptive_names,
           metadata=metadata)
```

**Note:** FlowIO exports as FCS 3.1 with single-precision floating-point data.

### Exporting Modified Data

Modify existing FCS files and re-export them.

**Approach 1: Using write_fcs() Method:**

```python
from flowio import FlowData

# Read original file
flow = FlowData('original.fcs')

# Write with updated metadata
flow.write_fcs('modified.fcs', metadata={'$SRC': 'Modified data'})
```

**Approach 2: Extract, Modify, and Recreate:**

For modifying event data:

```python
from flowio import FlowData, create_fcs

# Read and extract data
flow = FlowData('original.fcs')
events = flow.as_array(preprocess=False)

# Modify event data
events[:, 0] = events[:, 0] * 1.5  # Scale first channel

# Create new FCS file with modified data
create_fcs('modified.fcs',
           events,
           flow.pnn_labels,
           opt_channel_names=flow.pns_labels,
           metadata=flow.text)
```

### Handling Multi-Dataset FCS Files

Some FCS files contain multiple datasets in a single file.

**Detecting Multi-Dataset Files:**

```python
from flowio import FlowData, MultipleDataSetsError

try:
    flow = FlowData('sample.fcs')
except MultipleDataSetsError:
    print("File contains multiple datasets")
    # Use read_multiple_data_sets() instead
```

**Reading All Datasets:**

```python
from flowio import read_multiple_data_sets

# Read all datasets from file
datasets = read_multiple_data_sets('multi_dataset.fcs')

print(f"Found {len(datasets)} datasets")

# Process each dataset
for i, dataset in enumerate(datasets):
    print(f"\nDataset {i}:")
    print(f"  Events: {dataset.event_count}")
    print(f"  Channels: {dataset.pnn_labels}")

    # Get event data for this dataset
    events = dataset.as_array()
    print(f"  Shape: {events.shape}")
    print(f"  Mean values: {events.mean(axis=0)}")
```

**Reading Specific Dataset:**

```python
from flowio import FlowData

# Read first dataset (nextdata_offset=0)
first_dataset = FlowData('multi.fcs', nextdata_offset=0)

# Read second dataset using NEXTDATA offset from first
next_offset = int(first_dataset.text['$NEXTDATA'])
if next_offset > 0:
    second_dataset = FlowData('multi.fcs', nextdata_offset=next_offset)
```

## Data Preprocessing

FlowIO applies standard FCS preprocessing transformations when `preprocess=True`.

**Preprocessing Steps:**

1. **Gain Scaling:** Multiply values by PnG (gain) keyword
2. **Logarithmic Transformation:** Apply PnE exponential transformation if present
   - Formula: `value = a * 10^(b * raw_value)` where PnE = "a,b"
3. **Time Scaling:** Convert time values to appropriate units

**Controlling Preprocessing:**

```python
# Preprocessed data (default)
preprocessed = flow.as_array(preprocess=True)

# Raw data (no transformations)
raw = flow.as_array(preprocess=False)
```

## Error Handling

Handle common FlowIO exceptions appropriately.

```python
from flowio import (
    FlowData,
    FCSParsingError,
    DataOffsetDiscrepancyError,
    MultipleDataSetsError
)

try:
    flow = FlowData('sample.fcs')
    events = flow.as_array()

except FCSParsingError as e:
    print(f"Failed to parse FCS file: {e}")
    # Try with relaxed parsing
    flow = FlowData('sample.fcs', ignore_offset_error=True)

except DataOffsetDiscrepancyError as e:
    print(f"Offset discrepancy detected: {e}")
    # Use ignore_offset_discrepancy parameter
    flow = FlowData('sample.fcs', ignore_offset_discrepancy=True)

except MultipleDataSetsError as e:
    print(f"Multiple datasets detected: {e}")
    # Use read_multiple_data_sets instead
    from flowio import read_multiple_data_sets
    datasets = read_multiple_data_sets('sample.fcs')

except Exception as e:
    print(f"Unexpected error: {e}")
```

## Common Use Cases

### Inspecting FCS File Contents

Quick exploration of FCS file structure:

```python
from flowio import FlowData

flow = FlowData('unknown.fcs')

print("=" * 50)
print(f"File: {flow.name}")
print(f"Version: {flow.version}")
print(f"Size: {flow.file_size:,} bytes")
print("=" * 50)

print(f"\nEvents: {flow.event_count:,}")
print(f"Channels: {flow.channel_count}")

print("\nChannel Information:")
for i, (pnn, pns) in enumerate(zip(flow.pnn_labels, flow.pns_labels)):
    ch_type = "scatter" if i in flow.scatter_indices else \
              "fluoro" if i in flow.fluoro_indices else \
              "time" if i == flow.time_index else "other"
    print(f"  [{i}] {pnn:10s} | {pns:30s} | {ch_type}")

print("\nKey Metadata:")
for key in ['$DATE', '$BTIM', '$ETIM', '$CYT', '$INST', '$SRC']:
    value = flow.text.get(key, 'N/A')
    print(f"  {key:15s}: {value}")
```

### Batch Processing Multiple Files

Process a directory of FCS files:

```python
from pathlib import Path
from flowio import FlowData
import pandas as pd

# Find all FCS files
fcs_files = list(Path('data/').glob('*.fcs'))

# Extract summary information
summaries = []
for fcs_path in fcs_files:
    try:
        flow = FlowData(str(fcs_path), only_text=True)
        summaries.append({
            'filename': fcs_path.name,
            'version': flow.version,
            'events': flow.event_count,
            'channels': flow.channel_count,
            'date': flow.text.get('$DATE', 'N/A')
        })
    except Exception as e:
        print(f"Error processing {fcs_path.name}: {e}")

# Create summary DataFrame
df = pd.DataFrame(summaries)
print(df)
```

### Converting FCS to CSV

Export event data to CSV format:

```python
from flowio import FlowData
import pandas as pd

# Read FCS file
flow = FlowData('sample.fcs')

# Convert to DataFrame
df = pd.DataFrame(
    flow.as_array(),
    columns=flow.pnn_labels
)

# Add metadata as attributes
df.attrs['fcs_version'] = flow.version
df.attrs['instrument'] = flow.text.get('$CYT', 'Unknown')

# Export to CSV
df.to_csv('output.csv', index=False)
print(f"Exported {len(df)} events to CSV")
```

### Filtering Events and Re-exporting

Apply filters and save filtered data:

```python
from flowio import FlowData, create_fcs
import numpy as np

# Read original file
flow = FlowData('sample.fcs')
events = flow.as_array(preprocess=False)

# Apply filtering (example: threshold on first channel)
fsc_idx = 0
threshold = 500
mask = events[:, fsc_idx] > threshold
filtered_events = events[mask]

print(f"Original events: {len(events)}")
print(f"Filtered events: {len(filtered_events)}")

# Create new FCS file with filtered data
create_fcs('filtered.fcs',
           filtered_events,
           flow.pnn_labels,
           opt_channel_names=flow.pns_labels,
           metadata={**flow.text, '$SRC': 'Filtered data'})
```

### Extracting Specific Channels

Extract and process specific channels:

```python
from flowio import FlowData
import numpy as np

flow = FlowData('sample.fcs')
events = flow.as_array()

# Extract fluorescence channels only
fluoro_indices = flow.fluoro_indices
fluoro_data = events[:, fluoro_indices]
fluoro_names = [flow.pnn_labels[i] for i in fluoro_indices]

print(f"Fluorescence channels: {fluoro_names}")
print(f"Shape: {fluoro_data.shape}")

# Calculate statistics per channel
for i, name in enumerate(fluoro_names):
    channel_data = fluoro_data[:, i]
    print(f"\n{name}:")
    print(f"  Mean: {channel_data.mean():.2f}")
    print(f"  Median: {np.median(channel_data):.2f}")
    print(f"  Std Dev: {channel_data.std():.2f}")
```

## Best Practices

1. **Memory Efficiency:** Use `only_text=True` when event data is not needed
2. **Error Handling:** Wrap file operations in try-except blocks for robust code
3. **Multi-Dataset Detection:** Check for MultipleDataSetsError and use appropriate function
4. **Preprocessing Control:** Explicitly set `preprocess` parameter based on analysis needs
5. **Offset Issues:** If parsing fails, try `ignore_offset_discrepancy=True` parameter
6. **Channel Validation:** Verify channel counts and names match expectations before processing
7. **Metadata Preservation:** When modifying files, preserve original TEXT segment keywords

## Advanced Topics

### Understanding FCS File Structure

FCS files consist of four segments:

1. **HEADER:** FCS version and byte offsets for other segments
2. **TEXT:** Key-value metadata pairs (delimiter-separated)
3. **DATA:** Raw event data (binary/float/ASCII format)
4. **ANALYSIS** (optional): Results from data processing

Access these segments via FlowData attributes:
- `flow.header` - HEADER segment
- `flow.text` - TEXT segment keywords
- `flow.events` - DATA segment (as bytes)
- `flow.analysis` - ANALYSIS segment keywords (if present)

### Detailed API Reference

For comprehensive API documentation including all parameters, methods, exceptions, and FCS keyword reference, consult the detailed reference file:

**Read:** `references/api_reference.md`

The reference includes:
- Complete FlowData class documentation
- All utility functions (read_multiple_data_sets, create_fcs)
- Exception classes and handling
- FCS file structure details
- Common TEXT segment keywords
- Extended example workflows

When working with complex FCS operations or encountering unusual file formats, load this reference for detailed guidance.

## Integration Notes

**NumPy Arrays:** All event data is returned as NumPy ndarrays with shape (events, channels)

**Pandas DataFrames:** Easily convert to DataFrames for analysis:
```python
import pandas as pd
df = pd.DataFrame(flow.as_array(), columns=flow.pnn_labels)
```

**FlowKit Integration:** For advanced analysis (compensation, gating, FlowJo support), use FlowKit library which builds on FlowIO's parsing capabilities

**Web Applications:** FlowIO's minimal dependencies make it ideal for web backend services processing FCS uploads

## Troubleshooting

**Problem:** "Offset discrepancy error"
**Solution:** Use `ignore_offset_discrepancy=True` parameter

**Problem:** "Multiple datasets error"
**Solution:** Use `read_multiple_data_sets()` function instead of FlowData constructor

**Problem:** Out of memory with large files
**Solution:** Use `only_text=True` for metadata-only operations, or process events in chunks

**Problem:** Unexpected channel counts
**Solution:** Check for null channels; use `null_channel_list` parameter to exclude them

**Problem:** Cannot modify event data in place
**Solution:** FlowIO doesn't support direct modification; extract data, modify, then use `create_fcs()` to save

## Summary

FlowIO provides essential FCS file handling capabilities for flow cytometry workflows. Use it for parsing, metadata extraction, and file creation. For simple file operations and data extraction, FlowIO is sufficient. For complex analysis including compensation and gating, integrate with FlowKit or other specialized tools.

