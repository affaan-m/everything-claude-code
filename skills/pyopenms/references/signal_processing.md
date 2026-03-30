# Signal Processing

## Overview

PyOpenMS provides algorithms for processing raw mass spectrometry data including smoothing, filtering, peak picking, centroiding, normalization, and deconvolution.

## Algorithm Pattern

Most signal processing algorithms follow a standard pattern:

```python
import pyopenms as ms

# 1. Create algorithm instance
algo = ms.AlgorithmName()

# 2. Get and modify parameters
params = algo.getParameters()
params.setValue("parameter_name", value)
algo.setParameters(params)

# 3. Apply to data
algo.filterExperiment(exp)  # or filterSpectrum(spec)
```

## Smoothing

### Gaussian Filter

Apply Gaussian smoothing to reduce noise:

```python
# Create Gaussian filter
gaussian = ms.GaussFilter()

# Configure parameters
params = gaussian.getParameters()
params.setValue("gaussian_width", 0.2)  # Width in m/z or RT units
params.setValue("ppm_tolerance", 10.0)  # For m/z dimension
params.setValue("use_ppm_tolerance", "true")
gaussian.setParameters(params)

# Apply to experiment
gaussian.filterExperiment(exp)

# Or apply to single spectrum
spec = exp.getSpectrum(0)
gaussian.filterSpectrum(spec)
```

### Savitzky-Golay Filter

Polynomial smoothing that preserves peak shapes:

```python
# Create Savitzky-Golay filter
sg_filter = ms.SavitzkyGolayFilter()

# Configure parameters
params = sg_filter.getParameters()
params.setValue("frame_length", 11)  # Window size (must be odd)
params.setValue("polynomial_order", 4)  # Polynomial degree
sg_filter.setParameters(params)

# Apply smoothing
sg_filter.filterExperiment(exp)
```

## Peak Picking and Centroiding

### Peak Picker High Resolution

Detect peaks in high-resolution data:

```python
# Create peak picker
peak_picker = ms.PeakPickerHiRes()

# Configure parameters
params = peak_picker.getParameters()
params.setValue("signal_to_noise", 3.0)  # S/N threshold
params.setValue("spacing_difference", 1.5)  # Minimum peak spacing
peak_picker.setParameters(params)

# Pick peaks
exp_picked = ms.MSExperiment()
peak_picker.pickExperiment(exp, exp_picked)
```

### Peak Picker for CWT

Continuous wavelet transform-based peak picking:

```python
# Create CWT peak picker
cwt_picker = ms.PeakPickerCWT()

# Configure parameters
params = cwt_picker.getParameters()
params.setValue("signal_to_noise", 1.0)
params.setValue("peak_width", 0.15)  # Expected peak width
cwt_picker.setParameters(params)

# Pick peaks
cwt_picker.pickExperiment(exp, exp_picked)
```

## Normalization

### Normalizer

Normalize peak intensities within spectra:

```python
# Create normalizer
normalizer = ms.Normalizer()

# Configure normalization method
params = normalizer.getParameters()
params.setValue("method", "to_one")  # Options: "to_one", "to_TIC"
normalizer.setParameters(params)

# Apply normalization
normalizer.filterExperiment(exp)
```

## Peak Filtering

### Threshold Mower

Remove peaks below intensity threshold:

```python
# Create threshold filter
mower = ms.ThresholdMower()

# Configure threshold
params = mower.getParameters()
params.setValue("threshold", 1000.0)  # Absolute intensity threshold
mower.setParameters(params)

# Apply filter
mower.filterExperiment(exp)
```

### Window Mower

Keep only highest peaks in sliding windows:

```python
# Create window mower
window_mower = ms.WindowMower()

# Configure parameters
params = window_mower.getParameters()
params.setValue("windowsize", 50.0)  # Window size in m/z
params.setValue("peakcount", 2)  # Keep top N peaks per window
window_mower.setParameters(params)

# Apply filter
window_mower.filterExperiment(exp)
```

### N Largest Peaks

Keep only the N most intense peaks:

```python
# Create N largest filter
n_largest = ms.NLargest()

# Configure parameters
params = n_largest.getParameters()
params.setValue("n", 200)  # Keep 200 most intense peaks
n_largest.setParameters(params)

# Apply filter
n_largest.filterExperiment(exp)
```

## Baseline Reduction

### Morphological Filter

Remove baseline using morphological operations:

```python
# Create morphological filter
morph_filter = ms.MorphologicalFilter()

# Configure parameters
params = morph_filter.getParameters()
params.setValue("struc_elem_length", 3.0)  # Structuring element size
params.setValue("method", "tophat")  # Method: "tophat", "bothat", "erosion", "dilation"
morph_filter.setParameters(params)

# Apply filter
morph_filter.filterExperiment(exp)
```

## Spectrum Merging

### Spectra Merger

Combine multiple spectra into one:

```python
# Create merger
merger = ms.SpectraMerger()

# Configure parameters
params = merger.getParameters()
params.setValue("average_gaussian:spectrum_type", "profile")
params.setValue("average_gaussian:rt_FWHM", 5.0)  # RT window
merger.setParameters(params)

# Merge spectra
merger.mergeSpectraBlockWise(exp)
```

## Deconvolution

### Charge Deconvolution

Determine charge states and convert to neutral masses:

```python
# Create feature deconvoluter
deconvoluter = ms.FeatureDeconvolution()

# Configure parameters
params = deconvoluter.getParameters()
params.setValue("charge_min", 1)
params.setValue("charge_max", 4)
params.setValue("potential_charge_states", "1,2,3,4")
deconvoluter.setParameters(params)

# Apply deconvolution
feature_map_out = ms.FeatureMap()
deconvoluter.compute(exp, feature_map, feature_map_out, ms.ConsensusMap())
```

### Isotope Deconvolution

Remove isotopic patterns:

```python
# Create isotope wavelet transform
isotope_wavelet = ms.IsotopeWaveletTransform()

# Configure parameters
params = isotope_wavelet.getParameters()
params.setValue("max_charge", 3)
params.setValue("intensity_threshold", 10.0)
isotope_wavelet.setParameters(params)

# Apply transformation
isotope_wavelet.transform(exp)
```

## Retention Time Alignment

### Map Alignment

Align retention times across multiple runs:

```python
# Create map aligner
aligner = ms.MapAlignmentAlgorithmPoseClustering()

# Load multiple experiments
exp1 = ms.MSExperiment()
exp2 = ms.MSExperiment()
ms.MzMLFile().load("run1.mzML", exp1)
ms.MzMLFile().load("run2.mzML", exp2)

# Create reference
reference = ms.MSExperiment()

# Align experiments
transformations = []
aligner.align(exp1, exp2, transformations)

# Apply transformation
transformer = ms.MapAlignmentTransformer()
transformer.transformRetentionTimes(exp2, transformations[0])
```

## Mass Calibration

### Internal Calibration

Calibrate mass axis using known reference masses:

```python
# Create internal calibration
calibration = ms.InternalCalibration()

# Set reference masses
reference_masses = [500.0, 1000.0, 1500.0]  # Known m/z values

# Calibrate
calibration.calibrate(exp, reference_masses)
```

## Quality Control

### Spectrum Statistics

Calculate quality metrics:

```python
# Get spectrum
spec = exp.getSpectrum(0)

# Calculate statistics
mz, intensity = spec.get_peaks()

# Total ion current
tic = sum(intensity)

# Base peak
base_peak_intensity = max(intensity)
base_peak_mz = mz[intensity.argmax()]

print(f"TIC: {tic}")
print(f"Base peak: {base_peak_mz} m/z at {base_peak_intensity}")
```

## Spectrum Preprocessing Pipeline

### Complete Preprocessing Example

```python
import pyopenms as ms

def preprocess_experiment(input_file, output_file):
    """Complete preprocessing pipeline."""

    # Load data
    exp = ms.MSExperiment()
    ms.MzMLFile().load(input_file, exp)

    # 1. Smooth with Gaussian filter
    gaussian = ms.GaussFilter()
    gaussian.filterExperiment(exp)

    # 2. Pick peaks
    picker = ms.PeakPickerHiRes()
    exp_picked = ms.MSExperiment()
    picker.pickExperiment(exp, exp_picked)

    # 3. Normalize intensities
    normalizer = ms.Normalizer()
    params = normalizer.getParameters()
    params.setValue("method", "to_TIC")
    normalizer.setParameters(params)
    normalizer.filterExperiment(exp_picked)

    # 4. Filter low-intensity peaks
    mower = ms.ThresholdMower()
    params = mower.getParameters()
    params.setValue("threshold", 10.0)
    mower.setParameters(params)
    mower.filterExperiment(exp_picked)

    # Save processed data
    ms.MzMLFile().store(output_file, exp_picked)

    return exp_picked

# Run pipeline
exp_processed = preprocess_experiment("raw_data.mzML", "processed_data.mzML")
```

## Best Practices

### Parameter Optimization

Test parameters on representative data:

```python
# Try different Gaussian widths
widths = [0.1, 0.2, 0.5]

for width in widths:
    exp_test = ms.MSExperiment()
    ms.MzMLFile().load("test_data.mzML", exp_test)

    gaussian = ms.GaussFilter()
    params = gaussian.getParameters()
    params.setValue("gaussian_width", width)
    gaussian.setParameters(params)
    gaussian.filterExperiment(exp_test)

    # Evaluate quality
    # ... add evaluation code ...
```

### Preserve Original Data

Keep original data for comparison:

```python
# Load original
exp_original = ms.MSExperiment()
ms.MzMLFile().load("data.mzML", exp_original)

# Create copy for processing
exp_processed = ms.MSExperiment(exp_original)

# Process copy
gaussian = ms.GaussFilter()
gaussian.filterExperiment(exp_processed)

# Original remains unchanged
```

### Profile vs Centroid Data

Check data type before processing:

```python
# Check if spectrum is centroided
spec = exp.getSpectrum(0)

if spec.isSorted():
    # Likely centroided
    print("Centroid data")
else:
    # Likely profile
    print("Profile data - apply peak picking")
```
