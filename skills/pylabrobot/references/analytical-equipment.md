# Analytical Equipment in PyLabRobot

## Overview

PyLabRobot integrates with analytical equipment including plate readers, scales, and other measurement devices. This allows automated workflows that combine liquid handling with analytical measurements.

## Plate Readers

### BMG CLARIOstar (Plus)

The BMG Labtech CLARIOstar and CLARIOstar Plus are microplate readers that measure absorbance, luminescence, and fluorescence.

#### Hardware Setup

**Physical Connections:**
1. IEC C13 power cord to mains power
2. USB-B cable to computer (with security screws on device end)
3. Optional: RS-232 port for plate stacking units

**Communication:**
- Serial connection through FTDI/USB-A at firmware level
- Cross-platform support (Windows, macOS, Linux)

#### Software Setup

```python
from pylabrobot.plate_reading import PlateReader
from pylabrobot.plate_reading.clario_star_backend import CLARIOstarBackend

# Create backend
backend = CLARIOstarBackend()

# Initialize plate reader
pr = PlateReader(
    name="CLARIOstar",
    backend=backend,
    size_x=0.0,    # Physical dimensions not critical for plate readers
    size_y=0.0,
    size_z=0.0
)

# Setup (initializes device)
await pr.setup()

# When done
await pr.stop()
```

#### Basic Operations

**Opening and Closing:**

```python
# Open loading tray
await pr.open()

# (Load plate manually or robotically)

# Close loading tray
await pr.close()
```

**Temperature Control:**

```python
# Set temperature (in Celsius)
await pr.set_temperature(37)

# Note: Reaching temperature is slow
# Set temperature early in protocol
```

**Reading Measurements:**

```python
# Absorbance reading
data = await pr.read_absorbance(wavelength=450)  # nm

# Luminescence reading
data = await pr.read_luminescence()

# Fluorescence reading
data = await pr.read_fluorescence(
    excitation_wavelength=485,  # nm
    emission_wavelength=535     # nm
)
```

#### Data Format

Plate reader methods return array data:

```python
import numpy as np

# Read absorbance
data = await pr.read_absorbance(wavelength=450)

# data is typically a 2D array (8x12 for 96-well plate)
print(f"Data shape: {data.shape}")
print(f"Well A1: {data[0][0]}")
print(f"Well H12: {data[7][11]}")

# Convert to DataFrame for easier handling
import pandas as pd
df = pd.DataFrame(data)
```

#### Integration with Liquid Handler

Combine plate reading with liquid handling:

```python
from pylabrobot.liquid_handling import LiquidHandler
from pylabrobot.liquid_handling.backends import STAR
from pylabrobot.resources import STARLetDeck
from pylabrobot.plate_reading import PlateReader
from pylabrobot.plate_reading.clario_star_backend import CLARIOstarBackend

# Initialize liquid handler
lh = LiquidHandler(backend=STAR(), deck=STARLetDeck())
await lh.setup()

# Initialize plate reader
pr = PlateReader(name="CLARIOstar", backend=CLARIOstarBackend())
await pr.setup()

# Set temperature early
await pr.set_temperature(37)

try:
    # Prepare samples with liquid handler
    tip_rack = TIP_CAR_480_A00(name="tips")
    reagent_plate = Cos_96_DW_1mL(name="reagents")
    assay_plate = Cos_96_DW_1mL(name="assay")

    lh.deck.assign_child_resource(tip_rack, rails=1)
    lh.deck.assign_child_resource(reagent_plate, rails=10)
    lh.deck.assign_child_resource(assay_plate, rails=15)

    # Transfer samples
    await lh.pick_up_tips(tip_rack["A1:H1"])
    await lh.transfer(
        reagent_plate["A1:H12"],
        assay_plate["A1:H12"],
        vols=100
    )
    await lh.drop_tips()

    # Move plate to reader (manual or robotic arm)
    print("Move assay plate to plate reader")
    input("Press Enter when plate is loaded...")

    # Read plate
    await pr.open()
    # (plate loaded here)
    await pr.close()

    data = await pr.read_absorbance(wavelength=450)
    print(f"Absorbance data: {data}")

finally:
    await lh.stop()
    await pr.stop()
```

#### Advanced Features

**Development Status:**

Some CLARIOstar features are under development:
- Spectral scanning
- Injector needle control
- Detailed measurement parameter configuration
- Well-specific reading patterns

Check current documentation for latest feature support.

#### Best Practices

1. **Temperature Control**: Set temperature early as heating is slow
2. **Plate Loading**: Ensure plate is properly seated before closing
3. **Measurement Selection**: Choose appropriate wavelengths for your assay
4. **Data Validation**: Check measurement quality and expected ranges
5. **Error Handling**: Handle timeout and communication errors
6. **Maintenance**: Keep optics clean per manufacturer guidelines

#### Example: Complete Plate Reading Workflow

```python
async def run_plate_reading_assay():
    """Complete workflow with sample prep and reading"""

    # Initialize equipment
    lh = LiquidHandler(backend=STAR(), deck=STARLetDeck())
    pr = PlateReader(name="CLARIOstar", backend=CLARIOstarBackend())

    await lh.setup()
    await pr.setup()

    # Set plate reader temperature
    await pr.set_temperature(37)

    try:
        # Define resources
        tip_rack = TIP_CAR_480_A00(name="tips")
        samples = Cos_96_DW_1mL(name="samples")
        assay_plate = Cos_96_DW_1mL(name="assay")
        substrate = Trough_100ml(name="substrate")

        lh.deck.assign_child_resource(tip_rack, rails=1)
        lh.deck.assign_child_resource(substrate, rails=5)
        lh.deck.assign_child_resource(samples, rails=10)
        lh.deck.assign_child_resource(assay_plate, rails=15)

        # Transfer samples
        await lh.pick_up_tips(tip_rack["A1:H1"])
        await lh.transfer(
            samples["A1:H12"],
            assay_plate["A1:H12"],
            vols=50
        )
        await lh.drop_tips()

        # Add substrate
        await lh.pick_up_tips(tip_rack["A2:H2"])
        for col in range(1, 13):
            await lh.transfer(
                substrate["channel_1"],
                assay_plate[f"A{col}:H{col}"],
                vols=50
            )
        await lh.drop_tips()

        # Incubate (if needed)
        # await asyncio.sleep(300)  # 5 minutes

        # Move to plate reader
        print("Transfer assay plate to CLARIOstar")
        input("Press Enter when ready...")

        await pr.open()
        input("Press Enter when plate is loaded...")
        await pr.close()

        # Read absorbance
        data = await pr.read_absorbance(wavelength=450)

        # Process results
        import pandas as pd
        df = pd.DataFrame(
            data,
            index=[f"{r}" for r in "ABCDEFGH"],
            columns=[f"{c}" for c in range(1, 13)]
        )

        print("Absorbance Results:")
        print(df)

        # Save results
        df.to_csv("plate_reading_results.csv")

        return df

    finally:
        await lh.stop()
        await pr.stop()

# Run assay
results = await run_plate_reading_assay()
```

## Scales

### Mettler Toledo Scales

PyLabRobot supports Mettler Toledo scales for mass measurements.

#### Setup

```python
from pylabrobot.scales import Scale
from pylabrobot.scales.mettler_toledo_backend import MettlerToledoBackend

# Create scale
scale = Scale(
    name="analytical_scale",
    backend=MettlerToledoBackend()
)

await scale.setup()
```

#### Operations

```python
# Get weight measurement
weight = await scale.get_weight()  # Returns weight in grams
print(f"Weight: {weight} g")

# Tare (zero) the scale
await scale.tare()

# Get multiple measurements
weights = []
for i in range(5):
    w = await scale.get_weight()
    weights.append(w)
    await asyncio.sleep(1)

average_weight = sum(weights) / len(weights)
print(f"Average weight: {average_weight} g")
```

#### Integration with Liquid Handler

```python
# Weigh samples during protocol
lh = LiquidHandler(backend=STAR(), deck=STARLetDeck())
scale = Scale(name="scale", backend=MettlerToledoBackend())

await lh.setup()
await scale.setup()

try:
    # Tare scale
    await scale.tare()

    # Dispense liquid
    await lh.pick_up_tips(tip_rack["A1"])
    await lh.aspirate(reagent["A1"], vols=1000)

    # (Move to scale position)

    # Dispense and weigh
    await lh.dispense(container, vols=1000)
    weight = await scale.get_weight()

    print(f"Dispensed weight: {weight} g")

    # Calculate actual volume (assuming density = 1 g/mL for water)
    actual_volume = weight * 1000  # Convert g to µL
    print(f"Actual volume: {actual_volume} µL")

    await lh.drop_tips()

finally:
    await lh.stop()
    await scale.stop()
```

## Other Analytical Devices

### Flow Cytometers

Some flow cytometer integrations are in development. Check current documentation for support status.

### Spectrophotometers

Additional spectrophotometer models may be supported. Check documentation for current device compatibility.

## Multi-Device Workflows

### Coordinating Multiple Devices

```python
async def multi_device_workflow():
    """Coordinate liquid handler, plate reader, and scale"""

    # Initialize all devices
    lh = LiquidHandler(backend=STAR(), deck=STARLetDeck())
    pr = PlateReader(name="CLARIOstar", backend=CLARIOstarBackend())
    scale = Scale(name="scale", backend=MettlerToledoBackend())

    await lh.setup()
    await pr.setup()
    await scale.setup()

    try:
        # 1. Weigh reagent
        await scale.tare()
        # (place container on scale)
        reagent_weight = await scale.get_weight()

        # 2. Prepare samples with liquid handler
        await lh.pick_up_tips(tip_rack["A1:H1"])
        await lh.transfer(source["A1:H12"], dest["A1:H12"], vols=100)
        await lh.drop_tips()

        # 3. Read plate
        await pr.open()
        # (load plate)
        await pr.close()
        data = await pr.read_absorbance(wavelength=450)

        return {
            "reagent_weight": reagent_weight,
            "absorbance_data": data
        }

    finally:
        await lh.stop()
        await pr.stop()
        await scale.stop()
```

## Best Practices

1. **Device Initialization**: Setup all devices at start of protocol
2. **Error Handling**: Handle communication errors gracefully
3. **Cleanup**: Always call `stop()` on all devices
4. **Timing**: Account for device-specific timing (temperature equilibration, measurement time)
5. **Calibration**: Follow manufacturer calibration procedures
6. **Data Validation**: Verify measurements are within expected ranges
7. **Documentation**: Record device settings and parameters
8. **Integration Testing**: Test multi-device workflows thoroughly
9. **Concurrent Operations**: Use async to overlap operations when possible
10. **Data Storage**: Save raw data with metadata (timestamps, settings)

## Common Patterns

### Kinetic Plate Reading

```python
async def kinetic_reading(num_reads: int, interval: int):
    """Perform kinetic plate reading"""

    pr = PlateReader(name="CLARIOstar", backend=CLARIOstarBackend())
    await pr.setup()

    try:
        await pr.set_temperature(37)
        await pr.open()
        # (load plate)
        await pr.close()

        results = []
        for i in range(num_reads):
            data = await pr.read_absorbance(wavelength=450)
            timestamp = time.time()
            results.append({
                "read_number": i + 1,
                "timestamp": timestamp,
                "data": data
            })

            if i < num_reads - 1:
                await asyncio.sleep(interval)

        return results

    finally:
        await pr.stop()

# Read every 30 seconds for 10 minutes
results = await kinetic_reading(num_reads=20, interval=30)
```

## Additional Resources

- Plate Reading Documentation: https://docs.pylabrobot.org/user_guide/02_analytical/
- BMG CLARIOstar Guide: https://docs.pylabrobot.org/user_guide/02_analytical/plate-reading/bmg-clariostar.html
- API Reference: https://docs.pylabrobot.org/api/pylabrobot.plate_reading.html
- Supported Equipment: https://docs.pylabrobot.org/user_guide/machines.html
