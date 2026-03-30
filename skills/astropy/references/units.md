# Units and Quantities (astropy.units)

The `astropy.units` module handles defining, converting between, and performing arithmetic with physical quantities.

## Creating Quantities

Multiply or divide numeric values by built-in units to create Quantity objects:

```python
from astropy import units as u
import numpy as np

# Scalar quantities
distance = 42.0 * u.meter
velocity = 100 * u.km / u.s

# Array quantities
distances = np.array([1., 2., 3.]) * u.m
wavelengths = [500, 600, 700] * u.nm
```

Access components via `.value` and `.unit` attributes:
```python
distance.value  # 42.0
distance.unit   # Unit("m")
```

## Unit Conversions

Use `.to()` method for conversions:

```python
distance = 1.0 * u.parsec
distance.to(u.km)  # <Quantity 30856775814671.914 km>

wavelength = 500 * u.nm
wavelength.to(u.angstrom)  # <Quantity 5000. Angstrom>
```

## Arithmetic Operations

Quantities support standard arithmetic with automatic unit management:

```python
# Basic operations
speed = 15.1 * u.meter / (32.0 * u.second)  # <Quantity 0.471875 m / s>
area = (5 * u.m) * (3 * u.m)  # <Quantity 15. m2>

# Units cancel when appropriate
ratio = (10 * u.m) / (5 * u.m)  # <Quantity 2. (dimensionless)>

# Decompose complex units
time = (3.0 * u.kilometer / (130.51 * u.meter / u.second))
time.decompose()  # <Quantity 22.986744310780782 s>
```

## Unit Systems

Convert between major unit systems:

```python
# SI to CGS
pressure = 1.0 * u.Pa
pressure.cgs  # <Quantity 10. Ba>

# Find equivalent representations
(u.s ** -1).compose()  # [Unit("Bq"), Unit("Hz"), ...]
```

## Equivalencies

Domain-specific conversions require equivalencies:

```python
# Spectral equivalency (wavelength ↔ frequency)
wavelength = 1000 * u.nm
wavelength.to(u.Hz, equivalencies=u.spectral())
# <Quantity 2.99792458e+14 Hz>

# Doppler equivalencies
velocity = 1000 * u.km / u.s
velocity.to(u.Hz, equivalencies=u.doppler_optical(500*u.nm))

# Other equivalencies
u.brightness_temperature(500*u.GHz)
u.doppler_radio(1.4*u.GHz)
u.mass_energy()
u.parallax()
```

## Logarithmic Units

Special units for magnitudes, decibels, and dex:

```python
# Magnitudes
flux = -2.5 * u.mag(u.ct / u.s)

# Decibels
power_ratio = 3 * u.dB(u.W)

# Dex (base-10 logarithm)
abundance = 8.5 * u.dex(u.cm**-3)
```

## Common Units

### Length
`u.m, u.km, u.cm, u.mm, u.micron, u.angstrom, u.au, u.pc, u.kpc, u.Mpc, u.lyr`

### Time
`u.s, u.min, u.hour, u.day, u.year, u.Myr, u.Gyr`

### Mass
`u.kg, u.g, u.M_sun, u.M_earth, u.M_jup`

### Temperature
`u.K, u.deg_C`

### Angle
`u.deg, u.arcmin, u.arcsec, u.rad, u.hourangle, u.mas`

### Energy/Power
`u.J, u.erg, u.eV, u.keV, u.MeV, u.GeV, u.W, u.L_sun`

### Frequency
`u.Hz, u.kHz, u.MHz, u.GHz`

### Flux
`u.Jy, u.mJy, u.erg / u.s / u.cm**2`

## Performance Optimization

Pre-compute composite units for array operations:

```python
# Slow (creates intermediate quantities)
result = array * u.m / u.s / u.kg / u.sr

# Fast (pre-computed composite unit)
UNIT_COMPOSITE = u.m / u.s / u.kg / u.sr
result = array * UNIT_COMPOSITE

# Fastest (avoid copying with <<)
result = array << UNIT_COMPOSITE  # 10000x faster
```

## String Formatting

Format quantities with standard Python syntax:

```python
velocity = 15.1 * u.meter / (32.0 * u.second)
f"{velocity:0.03f}"     # '0.472 m / s'
f"{velocity:.2e}"       # '4.72e-01 m / s'
f"{velocity.unit:FITS}" # 'm s-1'
```

## Defining Custom Units

```python
# Create new unit
bakers_fortnight = u.def_unit('bakers_fortnight', 13 * u.day)

# Enable in string parsing
u.add_enabled_units([bakers_fortnight])
```

## Constants

Access physical constants with units:

```python
from astropy.constants import c, G, M_sun, h, k_B

speed_of_light = c.to(u.km/u.s)
gravitational_constant = G.to(u.m**3 / u.kg / u.s**2)
```
