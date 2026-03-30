# FlowIO API Reference

## Overview

FlowIO is a Python library for reading and writing Flow Cytometry Standard (FCS) files. It supports FCS versions 2.0, 3.0, and 3.1 with minimal dependencies.

## Installation

```bash
pip install flowio
```

Supports Python 3.9 and later.

## Core Classes

### FlowData

The primary class for working with FCS files.

#### Constructor

```python
FlowData(fcs_file,
         ignore_offset_error=False,
         ignore_offset_discrepancy=False,
         use_header_offsets=False,
         only_text=False,
         nextdata_offset=None,
         null_channel_list=None)
```

**Parameters:**
- `fcs_file`: File path (str), Path object, or file handle
- `ignore_offset_error` (bool): Ignore offset errors (default: False)
- `ignore_offset_discrepancy` (bool): Ignore offset discrepancies between HEADER and TEXT sections (default: False)
- `use_header_offsets` (bool): Use HEADER section offsets instead of TEXT section (default: False)
- `only_text` (bool): Only parse the TEXT segment, skip DATA and ANALYSIS (default: False)
- `nextdata_offset` (int): Byte offset for reading multi-dataset files
- `null_channel_list` (list): List of PnN labels for null channels to exclude

#### Attributes

**File Information:**
- `name`: Name of the FCS file
- `file_size`: Size of the file in bytes
- `version`: FCS version (e.g., '3.0', '3.1')
- `header`: Dictionary containing HEADER segment information
- `data_type`: Type of data format ('I', 'F', 'D', 'A')

**Channel Information:**
- `channel_count`: Number of channels in the dataset
- `channels`: Dictionary mapping channel numbers to channel info
- `pnn_labels`: List of PnN (short channel name) labels
- `pns_labels`: List of PnS (descriptive stain name) labels
- `pnr_values`: List of PnR (range) values for each channel
- `fluoro_indices`: List of indices for fluorescence channels
- `scatter_indices`: List of indices for scatter channels
- `time_index`: Index of the time channel (or None)
- `null_channels`: List of null channel indices

**Event Data:**
- `event_count`: Number of events (rows) in the dataset
- `events`: Raw event data as bytes

**Metadata:**
- `text`: Dictionary of TEXT segment key-value pairs
- `analysis`: Dictionary of ANALYSIS segment key-value pairs (if present)

#### Methods

##### as_array()

```python
as_array(preprocess=True)
```

Return event data as a 2-D NumPy array.

**Parameters:**
- `preprocess` (bool): Apply gain, logarithmic, and time scaling transformations (default: True)

**Returns:**
- NumPy ndarray with shape (event_count, channel_count)

**Example:**
```python
flow_data = FlowData('sample.fcs')
events_array = flow_data.as_array()  # Preprocessed data
raw_array = flow_data.as_array(preprocess=False)  # Raw data
```

##### write_fcs()

```python
write_fcs(filename, metadata=None)
```

Export the FlowData instance as a new FCS file.

**Parameters:**
- `filename` (str): Output file path
- `metadata` (dict): Optional dictionary of TEXT segment keywords to add/update

**Example:**
```python
flow_data = FlowData('sample.fcs')
flow_data.write_fcs('output.fcs', metadata={'$SRC': 'Modified data'})
```

**Note:** Exports as FCS 3.1 with single-precision floating-point data.

## Utility Functions

### read_multiple_data_sets()

```python
read_multiple_data_sets(fcs_file,
                        ignore_offset_error=False,
                        ignore_offset_discrepancy=False,
                        use_header_offsets=False)
```

Read all datasets from an FCS file containing multiple datasets.

**Parameters:**
- Same as FlowData constructor (except `nextdata_offset`)

**Returns:**
- List of FlowData instances, one for each dataset

**Example:**
```python
from flowio import read_multiple_data_sets

datasets = read_multiple_data_sets('multi_dataset.fcs')
print(f"Found {len(datasets)} datasets")
for i, dataset in enumerate(datasets):
    print(f"Dataset {i}: {dataset.event_count} events")
```

### create_fcs()

```python
create_fcs(filename,
           event_data,
           channel_names,
           opt_channel_names=None,
           metadata=None)
```

Create a new FCS file from event data.

**Parameters:**
- `filename` (str): Output file path
- `event_data` (ndarray): 2-D NumPy array of event data (rows=events, columns=channels)
- `channel_names` (list): List of PnN (short) channel names
- `opt_channel_names` (list): Optional list of PnS (descriptive) channel names
- `metadata` (dict): Optional dictionary of TEXT segment keywords

**Example:**
```python
import numpy as np
from flowio import create_fcs

# Create synthetic data
events = np.random.rand(10000, 5)
channels = ['FSC-A', 'SSC-A', 'FL1-A', 'FL2-A', 'Time']
opt_channels = ['Forward Scatter', 'Side Scatter', 'FITC', 'PE', 'Time']

create_fcs('synthetic.fcs',
           events,
           channels,
           opt_channel_names=opt_channels,
           metadata={'$SRC': 'Synthetic data'})
```

## Exception Classes

### FlowIOWarning

Generic warning class for non-critical issues.

### PnEWarning

Warning raised when PnE values are invalid during FCS file creation.

### FlowIOException

Base exception class for FlowIO errors.

### FCSParsingError

Raised when there are issues parsing an FCS file.

### DataOffsetDiscrepancyError

Raised when the HEADER and TEXT sections provide different byte offsets for data segments.

**Workaround:** Use `ignore_offset_discrepancy=True` parameter when creating FlowData instance.

### MultipleDataSetsError

Raised when attempting to read a file with multiple datasets using the standard FlowData constructor.

**Solution:** Use `read_multiple_data_sets()` function instead.

## FCS File Structure Reference

FCS files consist of four segments:

1. **HEADER**: Contains FCS version and byte locations of other segments
2. **TEXT**: Key-value metadata pairs (delimited format)
3. **DATA**: Raw event data (binary, floating-point, or ASCII)
4. **ANALYSIS** (optional): Results from data processing

### Common TEXT Segment Keywords

- `$BEGINDATA`, `$ENDDATA`: Byte offsets for DATA segment
- `$BEGINANALYSIS`, `$ENDANALYSIS`: Byte offsets for ANALYSIS segment
- `$BYTEORD`: Byte order (1,2,3,4 for little-endian; 4,3,2,1 for big-endian)
- `$DATATYPE`: Data type ('I'=integer, 'F'=float, 'D'=double, 'A'=ASCII)
- `$MODE`: Data mode ('L'=list mode, most common)
- `$NEXTDATA`: Offset to next dataset (0 if single dataset)
- `$PAR`: Number of parameters (channels)
- `$TOT`: Total number of events
- `PnN`: Short name for parameter n
- `PnS`: Descriptive stain name for parameter n
- `PnR`: Range (max value) for parameter n
- `PnE`: Amplification exponent for parameter n (format: "a,b" where value = a * 10^(b*x))
- `PnG`: Amplification gain for parameter n

## Channel Types

FlowIO automatically categorizes channels:

- **Scatter channels**: FSC (forward scatter), SSC (side scatter)
- **Fluorescence channels**: FL1, FL2, FITC, PE, etc.
- **Time channel**: Usually labeled "Time"

Access indices via:
- `flow_data.scatter_indices`
- `flow_data.fluoro_indices`
- `flow_data.time_index`

## Data Preprocessing

When calling `as_array(preprocess=True)`, FlowIO applies:

1. **Gain scaling**: Multiply by PnG value
2. **Logarithmic transformation**: Apply PnE exponential transformation if present
3. **Time scaling**: Convert time values to appropriate units

To access raw, unprocessed data: `as_array(preprocess=False)`

## Best Practices

1. **Memory efficiency**: Use `only_text=True` when only metadata is needed
2. **Error handling**: Wrap file operations in try-except blocks for FCSParsingError
3. **Multi-dataset files**: Always use `read_multiple_data_sets()` if unsure about dataset count
4. **Offset issues**: If encountering offset errors, try `ignore_offset_discrepancy=True`
5. **Channel selection**: Use null_channel_list to exclude unwanted channels during parsing

## Integration with FlowKit

For advanced flow cytometry analysis including compensation, gating, and GatingML support, consider using FlowKit library alongside FlowIO. FlowKit provides higher-level abstractions built on top of FlowIO's file parsing capabilities.

## Example Workflows

### Basic File Reading

```python
from flowio import FlowData

# Read FCS file
flow = FlowData('experiment.fcs')

# Print basic info
print(f"Version: {flow.version}")
print(f"Events: {flow.event_count}")
print(f"Channels: {flow.channel_count}")
print(f"Channel names: {flow.pnn_labels}")

# Get event data
events = flow.as_array()
print(f"Data shape: {events.shape}")
```

### Metadata Extraction

```python
from flowio import FlowData

flow = FlowData('sample.fcs', only_text=True)

# Access metadata
print(f"Acquisition date: {flow.text.get('$DATE', 'N/A')}")
print(f"Instrument: {flow.text.get('$CYT', 'N/A')}")

# Channel information
for i, (pnn, pns) in enumerate(zip(flow.pnn_labels, flow.pns_labels)):
    print(f"Channel {i}: {pnn} ({pns})")
```

### Creating New FCS Files

```python
import numpy as np
from flowio import create_fcs

# Generate or process data
data = np.random.rand(5000, 3) * 1000

# Define channels
channels = ['FSC-A', 'SSC-A', 'FL1-A']
stains = ['Forward Scatter', 'Side Scatter', 'GFP']

# Create FCS file
create_fcs('output.fcs',
           data,
           channels,
           opt_channel_names=stains,
           metadata={
               '$SRC': 'Python script',
               '$DATE': '19-OCT-2025'
           })
```

### Processing Multi-Dataset Files

```python
from flowio import read_multiple_data_sets

# Read all datasets
datasets = read_multiple_data_sets('multi.fcs')

# Process each dataset
for i, dataset in enumerate(datasets):
    print(f"\nDataset {i}:")
    print(f"  Events: {dataset.event_count}")
    print(f"  Channels: {dataset.pnn_labels}")

    # Get data array
    events = dataset.as_array()
    mean_values = events.mean(axis=0)
    print(f"  Mean values: {mean_values}")
```

### Modifying and Re-exporting

```python
from flowio import FlowData

# Read original file
flow = FlowData('original.fcs')

# Get event data
events = flow.as_array(preprocess=False)

# Modify data (example: apply custom transformation)
events[:, 0] = events[:, 0] * 1.5  # Scale first channel

# Note: Currently, FlowIO doesn't support direct modification of event data
# For modifications, use create_fcs() instead:
from flowio import create_fcs

create_fcs('modified.fcs',
           events,
           flow.pnn_labels,
           opt_channel_names=flow.pns_labels,
           metadata=flow.text)
```
