# Astronomical Coordinates (astropy.coordinates)

The `astropy.coordinates` package provides tools for representing celestial coordinates and transforming between different coordinate systems.

## Creating Coordinates with SkyCoord

The high-level `SkyCoord` class is the recommended interface:

```python
from astropy import units as u
from astropy.coordinates import SkyCoord

# Decimal degrees
c = SkyCoord(ra=10.625*u.degree, dec=41.2*u.degree, frame='icrs')

# Sexagesimal strings
c = SkyCoord(ra='00h42m30s', dec='+41d12m00s', frame='icrs')

# Mixed formats
c = SkyCoord('00h42.5m +41d12m', unit=(u.hourangle, u.deg))

# Galactic coordinates
c = SkyCoord(l=120.5*u.degree, b=-23.4*u.degree, frame='galactic')
```

## Array Coordinates

Process multiple coordinates efficiently using arrays:

```python
# Create array of coordinates
coords = SkyCoord(ra=[10, 11, 12]*u.degree,
                  dec=[41, -5, 42]*u.degree)

# Access individual elements
coords[0]
coords[1:3]

# Array operations
coords.shape
len(coords)
```

## Accessing Components

```python
c = SkyCoord(ra=10.68*u.degree, dec=41.27*u.degree, frame='icrs')

# Access coordinates
c.ra        # <Longitude 10.68 deg>
c.dec       # <Latitude 41.27 deg>
c.ra.hour   # Convert to hours
c.ra.hms    # Hours, minutes, seconds tuple
c.dec.dms   # Degrees, arcminutes, arcseconds tuple
```

## String Formatting

```python
c.to_string('decimal')      # '10.68 41.27'
c.to_string('dms')          # '10d40m48s 41d16m12s'
c.to_string('hmsdms')       # '00h42m43.2s +41d16m12s'

# Custom formatting
c.ra.to_string(unit=u.hour, sep=':', precision=2)
```

## Coordinate Transformations

Transform between reference frames:

```python
c_icrs = SkyCoord(ra=10.68*u.degree, dec=41.27*u.degree, frame='icrs')

# Simple transformations (as attributes)
c_galactic = c_icrs.galactic
c_fk5 = c_icrs.fk5
c_fk4 = c_icrs.fk4

# Explicit transformations
c_icrs.transform_to('galactic')
c_icrs.transform_to(FK5(equinox='J1975'))  # Custom frame parameters
```

## Common Coordinate Frames

### Celestial Frames
- **ICRS**: International Celestial Reference System (default, most common)
- **FK5**: Fifth Fundamental Catalogue (equinox J2000.0 by default)
- **FK4**: Fourth Fundamental Catalogue (older, requires equinox specification)
- **GCRS**: Geocentric Celestial Reference System
- **CIRS**: Celestial Intermediate Reference System

### Galactic Frames
- **Galactic**: IAU 1958 galactic coordinates
- **Supergalactic**: De Vaucouleurs supergalactic coordinates
- **Galactocentric**: Galactic center-based 3D coordinates

### Horizontal Frames
- **AltAz**: Altitude-azimuth (observer-dependent)
- **HADec**: Hour angle-declination

### Ecliptic Frames
- **GeocentricMeanEcliptic**: Geocentric mean ecliptic
- **BarycentricMeanEcliptic**: Barycentric mean ecliptic
- **HeliocentricMeanEcliptic**: Heliocentric mean ecliptic

## Observer-Dependent Transformations

For altitude-azimuth coordinates, specify observation time and location:

```python
from astropy.time import Time
from astropy.coordinates import EarthLocation, AltAz

# Define observer location
observing_location = EarthLocation(lat=40.8*u.deg, lon=-121.5*u.deg, height=1060*u.m)
# Or use named observatory
observing_location = EarthLocation.of_site('Apache Point Observatory')

# Define observation time
observing_time = Time('2023-01-15 23:00:00')

# Transform to alt-az
aa_frame = AltAz(obstime=observing_time, location=observing_location)
aa = c_icrs.transform_to(aa_frame)

print(f"Altitude: {aa.alt}")
print(f"Azimuth: {aa.az}")
```

## Working with Distances

Add distance information for 3D coordinates:

```python
# With distance
c = SkyCoord(ra=10*u.degree, dec=9*u.degree, distance=770*u.kpc, frame='icrs')

# Access 3D Cartesian coordinates
c.cartesian.x
c.cartesian.y
c.cartesian.z

# Distance from origin
c.distance

# 3D separation
c1 = SkyCoord(ra=10*u.degree, dec=9*u.degree, distance=10*u.pc)
c2 = SkyCoord(ra=11*u.degree, dec=10*u.degree, distance=11.5*u.pc)
sep_3d = c1.separation_3d(c2)  # 3D distance
```

## Angular Separation

Calculate on-sky separations:

```python
c1 = SkyCoord(ra=10*u.degree, dec=9*u.degree, frame='icrs')
c2 = SkyCoord(ra=11*u.degree, dec=10*u.degree, frame='fk5')

# Angular separation (handles frame conversion automatically)
sep = c1.separation(c2)
print(f"Separation: {sep.arcsec} arcsec")

# Position angle
pa = c1.position_angle(c2)
```

## Catalog Matching

Match coordinates to catalog sources:

```python
# Single target matching
catalog = SkyCoord(ra=ra_array*u.degree, dec=dec_array*u.degree)
target = SkyCoord(ra=10.5*u.degree, dec=41.2*u.degree)

# Find closest match
idx, sep2d, dist3d = target.match_to_catalog_sky(catalog)
matched_coord = catalog[idx]

# Match with maximum separation constraint
matches = target.separation(catalog) < 1*u.arcsec
```

## Named Objects

Retrieve coordinates from online catalogs:

```python
# Query by name (requires internet)
m31 = SkyCoord.from_name("M31")
crab = SkyCoord.from_name("Crab Nebula")
psr = SkyCoord.from_name("PSR J1012+5307")
```

## Earth Locations

Define observer locations:

```python
# By coordinates
location = EarthLocation(lat=40*u.deg, lon=-120*u.deg, height=1000*u.m)

# By named observatory
keck = EarthLocation.of_site('Keck Observatory')
vlt = EarthLocation.of_site('Paranal Observatory')

# By address (requires internet)
location = EarthLocation.of_address('1002 Holy Grail Court, St. Louis, MO')

# List available observatories
EarthLocation.get_site_names()
```

## Velocity Information

Include proper motion and radial velocity:

```python
# Proper motion
c = SkyCoord(ra=10*u.degree, dec=41*u.degree,
             pm_ra_cosdec=15*u.mas/u.yr,
             pm_dec=5*u.mas/u.yr,
             distance=150*u.pc)

# Radial velocity
c = SkyCoord(ra=10*u.degree, dec=41*u.degree,
             radial_velocity=20*u.km/u.s)

# Both
c = SkyCoord(ra=10*u.degree, dec=41*u.degree, distance=150*u.pc,
             pm_ra_cosdec=15*u.mas/u.yr, pm_dec=5*u.mas/u.yr,
             radial_velocity=20*u.km/u.s)
```

## Representation Types

Switch between coordinate representations:

```python
# Cartesian representation
c = SkyCoord(x=1*u.kpc, y=2*u.kpc, z=3*u.kpc,
             representation_type='cartesian', frame='icrs')

# Change representation
c.representation_type = 'cylindrical'
c.rho  # Cylindrical radius
c.phi  # Azimuthal angle
c.z    # Height

# Spherical (default for most frames)
c.representation_type = 'spherical'
```

## Performance Tips

1. **Use arrays, not loops**: Process multiple coordinates as single array
2. **Pre-compute frames**: Reuse frame objects for multiple transformations
3. **Use broadcasting**: Efficiently transform many positions across many times
4. **Enable interpolation**: For dense time sampling, use ErfaAstromInterpolator

```python
# Fast approach
coords = SkyCoord(ra=ra_array*u.degree, dec=dec_array*u.degree)
coords_transformed = coords.transform_to('galactic')

# Slow approach (avoid)
for ra, dec in zip(ra_array, dec_array):
    c = SkyCoord(ra=ra*u.degree, dec=dec*u.degree)
    c_transformed = c.transform_to('galactic')
```
