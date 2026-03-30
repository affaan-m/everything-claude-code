# WCS and Other Astropy Modules

## World Coordinate System (astropy.wcs)

The WCS module manages transformations between pixel coordinates in images and world coordinates (e.g., celestial coordinates).

### Reading WCS from FITS

```python
from astropy.wcs import WCS
from astropy.io import fits

# Read WCS from FITS header
with fits.open('image.fits') as hdul:
    wcs = WCS(hdul[0].header)
```

### Pixel to World Transformations

```python
# Single pixel to world coordinates
world = wcs.pixel_to_world(100, 200)  # Returns SkyCoord
print(f"RA: {world.ra}, Dec: {world.dec}")

# Arrays of pixels
import numpy as np
x_pixels = np.array([100, 200, 300])
y_pixels = np.array([150, 250, 350])
world_coords = wcs.pixel_to_world(x_pixels, y_pixels)
```

### World to Pixel Transformations

```python
from astropy.coordinates import SkyCoord
import astropy.units as u

# Single coordinate
coord = SkyCoord(ra=10.5*u.degree, dec=41.2*u.degree)
x, y = wcs.world_to_pixel(coord)

# Array of coordinates
coords = SkyCoord(ra=[10, 11, 12]*u.degree, dec=[41, 42, 43]*u.degree)
x_pixels, y_pixels = wcs.world_to_pixel(coords)
```

### WCS Information

```python
# Print WCS details
print(wcs)

# Access key properties
print(wcs.wcs.crpix)  # Reference pixel
print(wcs.wcs.crval)  # Reference value (world coords)
print(wcs.wcs.cd)     # CD matrix
print(wcs.wcs.ctype)  # Coordinate types

# Pixel scale
pixel_scale = wcs.proj_plane_pixel_scales()  # Returns Quantity array
```

### Creating WCS

```python
from astropy.wcs import WCS

# Create new WCS
wcs = WCS(naxis=2)
wcs.wcs.crpix = [512.0, 512.0]  # Reference pixel
wcs.wcs.crval = [10.5, 41.2]     # RA, Dec at reference pixel
wcs.wcs.ctype = ['RA---TAN', 'DEC--TAN']  # Projection type
wcs.wcs.cdelt = [-0.0001, 0.0001]  # Pixel scale (degrees/pixel)
wcs.wcs.cunit = ['deg', 'deg']
```

### Footprint and Coverage

```python
# Calculate image footprint (corner coordinates)
footprint = wcs.calc_footprint()
# Returns array of [RA, Dec] for each corner
```

## NDData (astropy.nddata)

Container for n-dimensional datasets with metadata, uncertainty, and masking.

### Creating NDData

```python
from astropy.nddata import NDData
import numpy as np
import astropy.units as u

# Basic NDData
data = np.random.random((100, 100))
ndd = NDData(data)

# With units
ndd = NDData(data, unit=u.electron/u.s)

# With uncertainty
from astropy.nddata import StdDevUncertainty
uncertainty = StdDevUncertainty(np.sqrt(data))
ndd = NDData(data, uncertainty=uncertainty, unit=u.electron/u.s)

# With mask
mask = data < 0.1  # Mask low values
ndd = NDData(data, mask=mask)

# With WCS
from astropy.wcs import WCS
ndd = NDData(data, wcs=wcs)
```

### CCDData for CCD Images

```python
from astropy.nddata import CCDData

# Create CCDData
ccd = CCDData(data, unit=u.adu, meta={'object': 'M31'})

# Read from FITS
ccd = CCDData.read('image.fits', unit=u.adu)

# Write to FITS
ccd.write('output.fits', overwrite=True)
```

## Modeling (astropy.modeling)

Framework for creating and fitting models to data.

### Common Models

```python
from astropy.modeling import models, fitting
import numpy as np

# 1D Gaussian
gauss = models.Gaussian1D(amplitude=10, mean=5, stddev=1)
x = np.linspace(0, 10, 100)
y = gauss(x)

# 2D Gaussian
gauss_2d = models.Gaussian2D(amplitude=10, x_mean=50, y_mean=50,
                              x_stddev=5, y_stddev=3)

# Polynomial
poly = models.Polynomial1D(degree=3)

# Power law
power_law = models.PowerLaw1D(amplitude=10, x_0=1, alpha=2)
```

### Fitting Models to Data

```python
# Generate noisy data
true_model = models.Gaussian1D(amplitude=10, mean=5, stddev=1)
x = np.linspace(0, 10, 100)
y_true = true_model(x)
y_noisy = y_true + np.random.normal(0, 0.5, x.shape)

# Fit model
fitter = fitting.LevMarLSQFitter()
initial_model = models.Gaussian1D(amplitude=8, mean=4, stddev=1.5)
fitted_model = fitter(initial_model, x, y_noisy)

print(f"Fitted amplitude: {fitted_model.amplitude.value}")
print(f"Fitted mean: {fitted_model.mean.value}")
print(f"Fitted stddev: {fitted_model.stddev.value}")
```

### Compound Models

```python
# Add models
double_gauss = models.Gaussian1D(amp=5, mean=3, stddev=1) + \
               models.Gaussian1D(amp=8, mean=7, stddev=1.5)

# Compose models
composite = models.Gaussian1D(amp=10, mean=5, stddev=1) | \
            models.Scale(factor=2)  # Scale output
```

## Visualization (astropy.visualization)

Tools for visualizing astronomical images and data.

### Image Normalization

```python
from astropy.visualization import simple_norm
import matplotlib.pyplot as plt

# Load image
from astropy.io import fits
data = fits.getdata('image.fits')

# Normalize for display
norm = simple_norm(data, 'sqrt', percent=99)

# Display
plt.imshow(data, norm=norm, cmap='gray', origin='lower')
plt.colorbar()
plt.show()
```

### Stretching and Intervals

```python
from astropy.visualization import (MinMaxInterval, AsinhStretch,
                                    ImageNormalize, ZScaleInterval)

# Z-scale interval
interval = ZScaleInterval()
vmin, vmax = interval.get_limits(data)

# Asinh stretch
stretch = AsinhStretch()
norm = ImageNormalize(data, interval=interval, stretch=stretch)

plt.imshow(data, norm=norm, cmap='gray', origin='lower')
```

### PercentileInterval

```python
from astropy.visualization import PercentileInterval

# Show data between 5th and 95th percentiles
interval = PercentileInterval(90)  # 90% of data
vmin, vmax = interval.get_limits(data)

plt.imshow(data, vmin=vmin, vmax=vmax, cmap='gray', origin='lower')
```

## Constants (astropy.constants)

Physical and astronomical constants with units.

```python
from astropy import constants as const

# Speed of light
c = const.c
print(f"c = {c}")
print(f"c in km/s = {c.to(u.km/u.s)}")

# Gravitational constant
G = const.G

# Astronomical constants
M_sun = const.M_sun     # Solar mass
R_sun = const.R_sun     # Solar radius
L_sun = const.L_sun     # Solar luminosity
au = const.au           # Astronomical unit
pc = const.pc           # Parsec

# Fundamental constants
h = const.h             # Planck constant
hbar = const.hbar       # Reduced Planck constant
k_B = const.k_B         # Boltzmann constant
m_e = const.m_e         # Electron mass
m_p = const.m_p         # Proton mass
e = const.e             # Elementary charge
N_A = const.N_A         # Avogadro constant
```

### Using Constants in Calculations

```python
# Calculate Schwarzschild radius
M = 10 * const.M_sun
r_s = 2 * const.G * M / const.c**2
print(f"Schwarzschild radius: {r_s.to(u.km)}")

# Calculate escape velocity
M = const.M_earth
R = const.R_earth
v_esc = np.sqrt(2 * const.G * M / R)
print(f"Earth escape velocity: {v_esc.to(u.km/u.s)}")
```

## Convolution (astropy.convolution)

Convolution kernels for image processing.

```python
from astropy.convolution import Gaussian2DKernel, convolve

# Create Gaussian kernel
kernel = Gaussian2DKernel(x_stddev=2)

# Convolve image
smoothed_image = convolve(data, kernel)

# Handle NaNs
from astropy.convolution import convolve_fft
smoothed = convolve_fft(data, kernel, nan_treatment='interpolate')
```

## Stats (astropy.stats)

Statistical functions for astronomical data.

```python
from astropy.stats import sigma_clip, sigma_clipped_stats

# Sigma clipping
clipped_data = sigma_clip(data, sigma=3, maxiters=5)

# Get statistics with sigma clipping
mean, median, std = sigma_clipped_stats(data, sigma=3.0)

# Robust statistics
from astropy.stats import mad_std, biweight_location, biweight_scale
robust_std = mad_std(data)
robust_mean = biweight_location(data)
robust_scale = biweight_scale(data)
```

## Utils

### Data Downloads

```python
from astropy.utils.data import download_file

# Download file (caches locally)
url = 'https://example.com/data.fits'
local_file = download_file(url, cache=True)
```

### Progress Bars

```python
from astropy.utils.console import ProgressBar

with ProgressBar(len(data_list)) as bar:
    for item in data_list:
        # Process item
        bar.update()
```

## SAMP (Simple Application Messaging Protocol)

Interoperability with other astronomy tools.

```python
from astropy.samp import SAMPIntegratedClient

# Connect to SAMP hub
client = SAMPIntegratedClient()
client.connect()

# Broadcast table to other applications
message = {
    'samp.mtype': 'table.load.votable',
    'samp.params': {
        'url': 'file:///path/to/table.xml',
        'table-id': 'my_table',
        'name': 'My Catalog'
    }
}
client.notify_all(message)

# Disconnect
client.disconnect()
```
