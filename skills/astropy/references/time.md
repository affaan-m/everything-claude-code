# Time Handling (astropy.time)

The `astropy.time` module provides robust tools for manipulating times and dates with support for various time scales and formats.

## Creating Time Objects

### Basic Creation

```python
from astropy.time import Time
import astropy.units as u

# ISO format (automatically detected)
t = Time('2023-01-15 12:30:45')
t = Time('2023-01-15T12:30:45')

# Specify format explicitly
t = Time('2023-01-15 12:30:45', format='iso', scale='utc')

# Julian Date
t = Time(2460000.0, format='jd')

# Modified Julian Date
t = Time(59945.0, format='mjd')

# Unix time (seconds since 1970-01-01)
t = Time(1673785845.0, format='unix')
```

### Array of Times

```python
# Multiple times
times = Time(['2023-01-01', '2023-06-01', '2023-12-31'])

# From arrays
import numpy as np
jd_array = np.linspace(2460000, 2460100, 100)
times = Time(jd_array, format='jd')
```

## Time Formats

### Supported Formats

```python
# ISO 8601
t = Time('2023-01-15 12:30:45', format='iso')
t = Time('2023-01-15T12:30:45.123', format='isot')

# Julian dates
t = Time(2460000.0, format='jd')          # Julian Date
t = Time(59945.0, format='mjd')           # Modified Julian Date

# Decimal year
t = Time(2023.5, format='decimalyear')
t = Time(2023.5, format='jyear')          # Julian year
t = Time(2023.5, format='byear')          # Besselian year

# Year and day-of-year
t = Time('2023:046', format='yday')       # 46th day of 2023

# FITS format
t = Time('2023-01-15T12:30:45', format='fits')

# GPS seconds
t = Time(1000000000.0, format='gps')

# Unix time
t = Time(1673785845.0, format='unix')

# Matplotlib dates
t = Time(738521.0, format='plot_date')

# datetime objects
from datetime import datetime
dt = datetime(2023, 1, 15, 12, 30, 45)
t = Time(dt)
```

## Time Scales

### Available Time Scales

```python
# UTC - Coordinated Universal Time (default)
t = Time('2023-01-15 12:00:00', scale='utc')

# TAI - International Atomic Time
t = Time('2023-01-15 12:00:00', scale='tai')

# TT - Terrestrial Time
t = Time('2023-01-15 12:00:00', scale='tt')

# TDB - Barycentric Dynamical Time
t = Time('2023-01-15 12:00:00', scale='tdb')

# TCG - Geocentric Coordinate Time
t = Time('2023-01-15 12:00:00', scale='tcg')

# TCB - Barycentric Coordinate Time
t = Time('2023-01-15 12:00:00', scale='tcb')

# UT1 - Universal Time
t = Time('2023-01-15 12:00:00', scale='ut1')
```

### Converting Time Scales

```python
t = Time('2023-01-15 12:00:00', scale='utc')

# Convert to different scales
t_tai = t.tai
t_tt = t.tt
t_tdb = t.tdb
t_ut1 = t.ut1

# Check offset
print(f"TAI - UTC = {(t.tai - t.utc).sec} seconds")
# TAI - UTC = 37 seconds (leap seconds)
```

## Format Conversions

### Change Output Format

```python
t = Time('2023-01-15 12:30:45')

# Access in different formats
print(t.jd)           # Julian Date
print(t.mjd)          # Modified Julian Date
print(t.iso)          # ISO format
print(t.isot)         # ISO with 'T'
print(t.unix)         # Unix time
print(t.decimalyear)  # Decimal year

# Change default format
t.format = 'mjd'
print(t)  # Displays as MJD
```

### High-Precision Output

```python
# Use subfmt for precision control
t.to_value('mjd', subfmt='float')    # Standard float
t.to_value('mjd', subfmt='long')     # Extended precision
t.to_value('mjd', subfmt='decimal')  # Decimal (highest precision)
t.to_value('mjd', subfmt='str')      # String representation
```

## Time Arithmetic

### TimeDelta Objects

```python
from astropy.time import TimeDelta

# Create time difference
dt = TimeDelta(1.0, format='jd')      # 1 day
dt = TimeDelta(3600.0, format='sec')  # 1 hour

# Subtract times
t1 = Time('2023-01-15')
t2 = Time('2023-02-15')
dt = t2 - t1
print(dt.jd)   # 31 days
print(dt.sec)  # 2678400 seconds
```

### Adding/Subtracting Time

```python
t = Time('2023-01-15 12:00:00')

# Add TimeDelta
t_future = t + TimeDelta(7, format='jd')  # Add 7 days

# Add Quantity
t_future = t + 1*u.hour
t_future = t + 30*u.day
t_future = t + 1*u.year

# Subtract
t_past = t - 1*u.week
```

### Time Ranges

```python
# Create range of times
start = Time('2023-01-01')
end = Time('2023-12-31')
times = start + np.linspace(0, 365, 100) * u.day

# Or using TimeDelta
times = start + TimeDelta(np.linspace(0, 365, 100), format='jd')
```

## Observing-Related Features

### Sidereal Time

```python
from astropy.coordinates import EarthLocation

# Define observer location
location = EarthLocation(lat=40*u.deg, lon=-120*u.deg, height=1000*u.m)

# Create time with location
t = Time('2023-06-15 23:00:00', location=location)

# Calculate sidereal time
lst_apparent = t.sidereal_time('apparent')
lst_mean = t.sidereal_time('mean')

print(f"Local Sidereal Time: {lst_apparent}")
```

### Light Travel Time Corrections

```python
from astropy.coordinates import SkyCoord, EarthLocation

# Define target and observer
target = SkyCoord(ra=10*u.deg, dec=20*u.deg)
location = EarthLocation.of_site('Keck Observatory')

# Observation times
times = Time(['2023-01-01', '2023-06-01', '2023-12-31'],
             location=location)

# Calculate light travel time to solar system barycenter
ltt_bary = times.light_travel_time(target, kind='barycentric')
ltt_helio = times.light_travel_time(target, kind='heliocentric')

# Apply correction
times_barycentric = times.tdb + ltt_bary
```

### Earth Rotation Angle

```python
# Earth rotation angle (for celestial to terrestrial transformations)
era = t.earth_rotation_angle()
```

## Handling Missing or Invalid Times

### Masked Times

```python
import numpy as np

# Create times with missing values
times = Time(['2023-01-01', '2023-06-01', '2023-12-31'])
times[1] = np.ma.masked  # Mark as missing

# Check for masks
print(times.mask)  # [False True False]

# Get unmasked version
times_clean = times.unmasked

# Fill masked values
times_filled = times.filled(Time('2000-01-01'))
```

## Time Precision and Representation

### Internal Representation

Time objects use two 64-bit floats (jd1, jd2) for high precision:

```python
t = Time('2023-01-15 12:30:45.123456789', format='iso', scale='utc')

# Access internal representation
print(t.jd1, t.jd2)  # Integer and fractional parts

# This allows sub-nanosecond precision over astronomical timescales
```

### Precision

```python
# High precision for long time intervals
t1 = Time('1900-01-01')
t2 = Time('2100-01-01')
dt = t2 - t1
print(f"Time span: {dt.sec / (365.25 * 86400)} years")
# Maintains precision throughout
```

## Time Formatting

### Custom String Format

```python
t = Time('2023-01-15 12:30:45')

# Strftime-style formatting
t.strftime('%Y-%m-%d %H:%M:%S')  # '2023-01-15 12:30:45'
t.strftime('%B %d, %Y')          # 'January 15, 2023'

# ISO format subformats
t.iso                    # '2023-01-15 12:30:45.000'
t.isot                   # '2023-01-15T12:30:45.000'
t.to_value('iso', subfmt='date_hms')  # '2023-01-15 12:30:45.000'
```

## Common Use Cases

### Converting Between Formats

```python
# MJD to ISO
t_mjd = Time(59945.0, format='mjd')
iso_string = t_mjd.iso

# ISO to JD
t_iso = Time('2023-01-15 12:00:00')
jd_value = t_iso.jd

# Unix to ISO
t_unix = Time(1673785845.0, format='unix')
iso_string = t_unix.iso
```

### Time Differences in Various Units

```python
t1 = Time('2023-01-01')
t2 = Time('2023-12-31')

dt = t2 - t1
print(f"Days: {dt.to(u.day)}")
print(f"Hours: {dt.to(u.hour)}")
print(f"Seconds: {dt.sec}")
print(f"Years: {dt.to(u.year)}")
```

### Creating Regular Time Series

```python
# Daily observations for a year
start = Time('2023-01-01')
times = start + np.arange(365) * u.day

# Hourly observations for a day
start = Time('2023-01-15 00:00:00')
times = start + np.arange(24) * u.hour

# Observations every 30 seconds
start = Time('2023-01-15 12:00:00')
times = start + np.arange(1000) * 30 * u.second
```

### Time Zone Handling

```python
# UTC to local time (requires datetime)
t = Time('2023-01-15 12:00:00', scale='utc')
dt_utc = t.to_datetime()

# Convert to specific timezone using pytz
import pytz
eastern = pytz.timezone('US/Eastern')
dt_eastern = dt_utc.replace(tzinfo=pytz.utc).astimezone(eastern)
```

### Barycentric Correction Example

```python
from astropy.coordinates import SkyCoord, EarthLocation

# Target coordinates
target = SkyCoord(ra='23h23m08.55s', dec='+18d24m59.3s')

# Observatory location
location = EarthLocation.of_site('Keck Observatory')

# Observation times (must include location)
times = Time(['2023-01-15 08:30:00', '2023-01-16 08:30:00'],
             location=location)

# Calculate barycentric correction
ltt_bary = times.light_travel_time(target, kind='barycentric')

# Apply correction to get barycentric times
times_bary = times.tdb + ltt_bary

# For radial velocity correction
rv_correction = ltt_bary.to(u.km, equivalencies=u.dimensionless_angles())
```

## Performance Considerations

1. **Array operations are fast**: Process multiple times as arrays
2. **Format conversions are cached**: Repeated access is efficient
3. **Scale conversions may require IERS data**: Downloads automatically
4. **High precision maintained**: Sub-nanosecond accuracy across astronomical timescales
