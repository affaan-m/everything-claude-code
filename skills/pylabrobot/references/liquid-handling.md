# Liquid Handling with PyLabRobot

## Overview

The liquid handling module (`pylabrobot.liquid_handling`) provides a unified interface for controlling liquid handling robots. The `LiquidHandler` class serves as the main interface for all pipetting operations, working across different hardware platforms through backend abstraction.

## Basic Setup

### Initializing a Liquid Handler

```python
from pylabrobot.liquid_handling import LiquidHandler
from pylabrobot.liquid_handling.backends import STAR
from pylabrobot.resources import STARLetDeck

# Create liquid handler with STAR backend
lh = LiquidHandler(backend=STAR(), deck=STARLetDeck())
await lh.setup()

# When done
await lh.stop()
```

### Switching Between Backends

Change robots by swapping the backend without rewriting protocols:

```python
# Hamilton STAR
from pylabrobot.liquid_handling.backends import STAR
lh = LiquidHandler(backend=STAR(), deck=STARLetDeck())

# Opentrons OT-2
from pylabrobot.liquid_handling.backends import OpentronsBackend
lh = LiquidHandler(backend=OpentronsBackend(host="192.168.1.100"), deck=OTDeck())

# Simulation (no hardware required)
from pylabrobot.liquid_handling.backends.simulation import ChatterboxBackend
lh = LiquidHandler(backend=ChatterboxBackend(), deck=STARLetDeck())
```

## Core Operations

### Tip Management

Picking up and dropping tips is fundamental to liquid handling operations:

```python
# Pick up tips from specific positions
await lh.pick_up_tips(tip_rack["A1"])           # Single tip
await lh.pick_up_tips(tip_rack["A1:H1"])        # Row of 8 tips
await lh.pick_up_tips(tip_rack["A1:A12"])       # Column of 12 tips

# Drop tips
await lh.drop_tips()                             # Drop at current location
await lh.drop_tips(waste)                        # Drop at specific location

# Return tips to original rack
await lh.return_tips()
```

**Tip Tracking**: Enable automatic tip tracking to monitor tip usage:

```python
from pylabrobot.resources import set_tip_tracking
set_tip_tracking(True)  # Enable globally
```

### Aspirating Liquids

Draw liquid from wells or containers:

```python
# Basic aspiration
await lh.aspirate(plate["A1"], vols=100)         # 100 µL from A1

# Multiple wells with same volume
await lh.aspirate(plate["A1:H1"], vols=100)      # 100 µL from each well

# Multiple wells with different volumes
await lh.aspirate(
    plate["A1:A3"],
    vols=[100, 150, 200]                          # Different volumes
)

# Advanced parameters
await lh.aspirate(
    plate["A1"],
    vols=100,
    flow_rate=50,                                 # µL/s
    liquid_height=5,                              # mm from bottom
    blow_out_air_volume=10                        # µL air
)
```

### Dispensing Liquids

Dispense liquid into wells or containers:

```python
# Basic dispensing
await lh.dispense(plate["A2"], vols=100)         # 100 µL to A2

# Multiple wells
await lh.dispense(plate["A1:H1"], vols=100)      # 100 µL to each

# Different volumes
await lh.dispense(
    plate["A1:A3"],
    vols=[100, 150, 200]
)

# Advanced parameters
await lh.dispense(
    plate["A2"],
    vols=100,
    flow_rate=50,                                 # µL/s
    liquid_height=2,                              # mm from bottom
    blow_out_air_volume=10                        # µL air
)
```

### Transferring Liquids

Transfer combines aspirate and dispense in a single operation:

```python
# Basic transfer
await lh.transfer(
    source=source_plate["A1"],
    dest=dest_plate["A1"],
    vols=100
)

# Multiple transfers (same tips)
await lh.transfer(
    source=source_plate["A1:H1"],
    dest=dest_plate["A1:H1"],
    vols=100
)

# Different volumes per well
await lh.transfer(
    source=source_plate["A1:A3"],
    dest=dest_plate["B1:B3"],
    vols=[50, 100, 150]
)

# With tip handling
await lh.pick_up_tips(tip_rack["A1:H1"])
await lh.transfer(
    source=source_plate["A1:H12"],
    dest=dest_plate["A1:H12"],
    vols=100
)
await lh.drop_tips()
```

## Advanced Techniques

### Serial Dilutions

Create serial dilutions across plate rows or columns:

```python
# 2-fold serial dilution
source_vols = [100, 50, 50, 50, 50, 50, 50, 50]
dest_vols = [0, 50, 50, 50, 50, 50, 50, 50]

# Add diluent first
await lh.pick_up_tips(tip_rack["A1"])
await lh.transfer(
    source=buffer["A1"],
    dest=plate["A2:A8"],
    vols=50
)
await lh.drop_tips()

# Perform serial dilution
await lh.pick_up_tips(tip_rack["A2"])
for i in range(7):
    await lh.aspirate(plate[f"A{i+1}"], vols=50)
    await lh.dispense(plate[f"A{i+2}"], vols=50)
    # Mix
    await lh.aspirate(plate[f"A{i+2}"], vols=50)
    await lh.dispense(plate[f"A{i+2}"], vols=50)
await lh.drop_tips()
```

### Plate Replication

Copy an entire plate layout to another plate:

```python
# Setup tips
await lh.pick_up_tips(tip_rack["A1:H1"])

# Replicate 96-well plate (12 columns)
for col in range(1, 13):
    await lh.transfer(
        source=source_plate[f"A{col}:H{col}"],
        dest=dest_plate[f"A{col}:H{col}"],
        vols=100
    )

await lh.drop_tips()
```

### Multi-Channel Pipetting

Use multiple channels simultaneously for parallel operations:

```python
# 8-channel transfer (entire row)
await lh.pick_up_tips(tip_rack["A1:H1"])
await lh.transfer(
    source=source_plate["A1:H1"],
    dest=dest_plate["A1:H1"],
    vols=100
)
await lh.drop_tips()

# Process entire plate with 8-channel
for col in range(1, 13):
    await lh.pick_up_tips(tip_rack[f"A{col}:H{col}"])
    await lh.transfer(
        source=source_plate[f"A{col}:H{col}"],
        dest=dest_plate[f"A{col}:H{col}"],
        vols=100
    )
    await lh.drop_tips()
```

### Mixing Liquids

Mix liquids by repeatedly aspirating and dispensing:

```python
# Mix by aspiration/dispensing
await lh.pick_up_tips(tip_rack["A1"])

# Mix 5 times
for _ in range(5):
    await lh.aspirate(plate["A1"], vols=80)
    await lh.dispense(plate["A1"], vols=80)

await lh.drop_tips()
```

## Volume Tracking

Track liquid volumes in wells automatically:

```python
from pylabrobot.resources import set_volume_tracking

# Enable volume tracking globally
set_volume_tracking(True)

# Set initial volumes
plate["A1"].tracker.set_liquids([(None, 200)])  # 200 µL

# After aspirating 100 µL
await lh.aspirate(plate["A1"], vols=100)
print(plate["A1"].tracker.get_volume())  # 100 µL

# Check remaining volume
remaining = plate["A1"].tracker.get_volume()
```

## Liquid Classes

Define liquid properties for optimal pipetting:

```python
# Liquid classes control aspiration/dispense parameters
from pylabrobot.liquid_handling import LiquidClass

# Create custom liquid class
water = LiquidClass(
    name="Water",
    aspiration_flow_rate=100,
    dispense_flow_rate=150,
    aspiration_mix_flow_rate=100,
    dispense_mix_flow_rate=100,
    air_transport_retract_dist=10
)

# Use with operations
await lh.aspirate(
    plate["A1"],
    vols=100,
    liquid_class=water
)
```

## Error Handling

Handle errors in liquid handling operations:

```python
try:
    await lh.setup()
    await lh.pick_up_tips(tip_rack["A1"])
    await lh.transfer(source["A1"], dest["A1"], vols=100)
    await lh.drop_tips()
except Exception as e:
    print(f"Error during liquid handling: {e}")
    # Attempt to drop tips if holding them
    try:
        await lh.drop_tips()
    except:
        pass
finally:
    await lh.stop()
```

## Best Practices

1. **Always Setup and Stop**: Call `await lh.setup()` before operations and `await lh.stop()` when done
2. **Enable Tracking**: Use tip tracking and volume tracking for accurate state management
3. **Tip Management**: Always pick up tips before aspirating and drop them when done
4. **Flow Rates**: Adjust flow rates based on liquid viscosity and vessel type
5. **Liquid Height**: Set appropriate aspiration/dispense heights to avoid splashing
6. **Error Handling**: Use try/finally blocks to ensure proper cleanup
7. **Test in Simulation**: Use ChatterboxBackend to test protocols before running on hardware
8. **Volume Limits**: Respect tip volume limits and well capacities
9. **Mixing**: Mix after dispensing viscous liquids or when accuracy is critical
10. **Documentation**: Document liquid classes and custom parameters for reproducibility

## Common Patterns

### Complete Liquid Handling Protocol

```python
from pylabrobot.liquid_handling import LiquidHandler
from pylabrobot.liquid_handling.backends import STAR
from pylabrobot.resources import STARLetDeck, TIP_CAR_480_A00, Cos_96_DW_1mL
from pylabrobot.resources import set_tip_tracking, set_volume_tracking

# Enable tracking
set_tip_tracking(True)
set_volume_tracking(True)

# Initialize
lh = LiquidHandler(backend=STAR(), deck=STARLetDeck())
await lh.setup()

try:
    # Define resources
    tip_rack = TIP_CAR_480_A00(name="tips")
    source = Cos_96_DW_1mL(name="source")
    dest = Cos_96_DW_1mL(name="dest")

    # Assign to deck
    lh.deck.assign_child_resource(tip_rack, rails=1)
    lh.deck.assign_child_resource(source, rails=10)
    lh.deck.assign_child_resource(dest, rails=15)

    # Set initial volumes
    for well in source.children:
        well.tracker.set_liquids([(None, 200)])

    # Execute protocol
    await lh.pick_up_tips(tip_rack["A1:H1"])
    await lh.transfer(
        source=source["A1:H12"],
        dest=dest["A1:H12"],
        vols=100
    )
    await lh.drop_tips()

finally:
    await lh.stop()
```

## Hardware-Specific Notes

### Hamilton STAR

- Supports full liquid handling capabilities
- Uses USB connection for communication
- Firmware commands executed directly
- Supports CO-RE (Compressed O-Ring Expansion) tips

### Opentrons OT-2

- Requires IP address for network connection
- Uses HTTP API for communication
- Limited to 8-channel and single-channel pipettes
- Simpler deck layout compared to STAR

### Tecan EVO

- Work-in-progress support
- Similar capabilities to Hamilton STAR
- Check current compatibility status in documentation

## Additional Resources

- Official Liquid Handling Guide: https://docs.pylabrobot.org/user_guide/basic.html
- API Reference: https://docs.pylabrobot.org/api/pylabrobot.liquid_handling.html
- Example Protocols: https://github.com/PyLabRobot/pylabrobot/tree/main/examples
