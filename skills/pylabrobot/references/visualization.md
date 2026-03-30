# Visualization & Simulation in PyLabRobot

## Overview

PyLabRobot provides visualization and simulation tools for developing, testing, and validating laboratory protocols without physical hardware. The visualizer offers real-time 3D visualization of deck state, while simulation backends enable protocol testing and validation.

## The Visualizer

### What is the Visualizer?

The PyLabRobot Visualizer is a browser-based tool that:
- Displays 3D visualization of the deck layout
- Shows real-time tip presence and liquid volumes
- Works with both simulated and physical robots
- Provides interactive deck state inspection
- Enables visual protocol validation

### Starting the Visualizer

The visualizer runs as a web server and displays in your browser:

```python
from pylabrobot.visualizer import Visualizer

# Create visualizer
vis = Visualizer()

# Start web server (opens browser automatically)
await vis.start()

# Stop visualizer
await vis.stop()
```

**Default Settings:**
- Port: 1234 (http://localhost:1234)
- Opens browser automatically when started

### Connecting Liquid Handler to Visualizer

```python
from pylabrobot.liquid_handling import LiquidHandler
from pylabrobot.liquid_handling.backends.simulation import ChatterboxBackend
from pylabrobot.resources import STARLetDeck
from pylabrobot.visualizer import Visualizer

# Create visualizer
vis = Visualizer()
await vis.start()

# Create liquid handler with simulation backend
lh = LiquidHandler(
    backend=ChatterboxBackend(num_channels=8),
    deck=STARLetDeck()
)

# Connect liquid handler to visualizer
lh.visualizer = vis

await lh.setup()

# Now all operations are visualized in real-time
await lh.pick_up_tips(tip_rack["A1:H1"])
await lh.aspirate(plate["A1:H1"], vols=100)
await lh.dispense(plate["A2:H2"], vols=100)
await lh.drop_tips()
```

### Tracking Features

#### Enable Tracking

For the visualizer to display tips and liquids, enable tracking:

```python
from pylabrobot.resources import set_tip_tracking, set_volume_tracking

# Enable globally (before creating resources)
set_tip_tracking(True)
set_volume_tracking(True)
```

#### Setting Initial Liquids

Define initial liquid contents for visualization:

```python
# Set liquid in a single well
plate["A1"].tracker.set_liquids([
    (None, 200)  # (liquid_type, volume_in_µL)
])

# Set multiple liquids in one well
plate["A2"].tracker.set_liquids([
    ("water", 100),
    ("ethanol", 50)
])

# Set liquids in multiple wells
for well in plate["A1:H1"]:
    well.tracker.set_liquids([(None, 200)])

# Set liquids in entire plate
for well in plate.children:
    well.tracker.set_liquids([("sample", 150)])
```

#### Visualizing Tip Presence

```python
# Tips are automatically tracked when using pick_up/drop operations
await lh.pick_up_tips(tip_rack["A1:H1"])  # Tips shown as absent in visualizer
await lh.return_tips()                     # Tips shown as present in visualizer
```

### Complete Visualizer Example

```python
from pylabrobot.liquid_handling import LiquidHandler
from pylabrobot.liquid_handling.backends.simulation import ChatterboxBackend
from pylabrobot.resources import (
    STARLetDeck,
    TIP_CAR_480_A00,
    Cos_96_DW_1mL,
    set_tip_tracking,
    set_volume_tracking
)
from pylabrobot.visualizer import Visualizer

# Enable tracking
set_tip_tracking(True)
set_volume_tracking(True)

# Create visualizer
vis = Visualizer()
await vis.start()

# Create liquid handler
lh = LiquidHandler(
    backend=ChatterboxBackend(num_channels=8),
    deck=STARLetDeck()
)
lh.visualizer = vis
await lh.setup()

# Define resources
tip_rack = TIP_CAR_480_A00(name="tips")
source_plate = Cos_96_DW_1mL(name="source")
dest_plate = Cos_96_DW_1mL(name="dest")

# Assign to deck
lh.deck.assign_child_resource(tip_rack, rails=1)
lh.deck.assign_child_resource(source_plate, rails=10)
lh.deck.assign_child_resource(dest_plate, rails=15)

# Set initial volumes
for well in source_plate.children:
    well.tracker.set_liquids([("sample", 200)])

# Execute protocol with visualization
await lh.pick_up_tips(tip_rack["A1:H1"])
await lh.transfer(
    source_plate["A1:H12"],
    dest_plate["A1:H12"],
    vols=100
)
await lh.drop_tips()

# Keep visualizer open to inspect final state
input("Press Enter to close visualizer...")

# Cleanup
await lh.stop()
await vis.stop()
```

## Deck Layout Editor

### Using the Deck Editor

PyLabRobot includes a graphical deck layout editor:

**Features:**
- Visual deck design interface
- Drag-and-drop resource placement
- Edit initial liquid states
- Set tip presence
- Save/load layouts as JSON

**Usage:**
- Accessed through the visualizer interface
- Create layouts graphically instead of code
- Export to JSON for use in protocols

### Loading Deck Layouts

```python
from pylabrobot.resources import Deck

# Load deck from JSON file
deck = Deck.load_from_json_file("my_deck_layout.json")

# Use with liquid handler
lh = LiquidHandler(backend=backend, deck=deck)
await lh.setup()

# Resources are already assigned
source = deck.get_resource("source")
dest = deck.get_resource("dest")
tip_rack = deck.get_resource("tips")
```

## Simulation

### ChatterboxBackend

The ChatterboxBackend simulates liquid handling operations:

**Features:**
- No hardware required
- Validates protocol logic
- Tracks tips and volumes
- Supports all liquid handling operations
- Works with visualizer

**Setup:**

```python
from pylabrobot.liquid_handling.backends.simulation import ChatterboxBackend

# Create simulation backend
backend = ChatterboxBackend(
    num_channels=8  # Simulate 8-channel pipette
)

# Use with liquid handler
lh = LiquidHandler(backend=backend, deck=STARLetDeck())
```

### Simulation Use Cases

#### Protocol Development

```python
async def develop_protocol():
    """Develop protocol using simulation"""

    # Use simulation for development
    lh = LiquidHandler(
        backend=ChatterboxBackend(),
        deck=STARLetDeck()
    )

    # Connect visualizer
    vis = Visualizer()
    await vis.start()
    lh.visualizer = vis

    await lh.setup()

    try:
        # Develop and test protocol
        await lh.pick_up_tips(tip_rack["A1"])
        await lh.transfer(plate["A1"], plate["A2"], vols=100)
        await lh.drop_tips()

        print("Protocol development complete!")

    finally:
        await lh.stop()
        await vis.stop()
```

#### Protocol Validation

```python
async def validate_protocol():
    """Validate protocol logic without hardware"""

    set_tip_tracking(True)
    set_volume_tracking(True)

    lh = LiquidHandler(
        backend=ChatterboxBackend(),
        deck=STARLetDeck()
    )
    await lh.setup()

    try:
        # Setup resources
        tip_rack = TIP_CAR_480_A00(name="tips")
        plate = Cos_96_DW_1mL(name="plate")

        lh.deck.assign_child_resource(tip_rack, rails=1)
        lh.deck.assign_child_resource(plate, rails=10)

        # Set initial state
        for well in plate.children:
            well.tracker.set_liquids([(None, 200)])

        # Execute protocol
        await lh.pick_up_tips(tip_rack["A1:H1"])

        # Test different volumes
        test_volumes = [50, 100, 150]
        for i, vol in enumerate(test_volumes):
            await lh.transfer(
                plate[f"A{i+1}:H{i+1}"],
                plate[f"A{i+4}:H{i+4}"],
                vols=vol
            )

        await lh.drop_tips()

        # Validate volumes
        for i, vol in enumerate(test_volumes):
            for row in "ABCDEFGH":
                well = plate[f"{row}{i+4}"]
                actual_vol = well.tracker.get_volume()
                assert actual_vol == vol, f"Volume mismatch in {well.name}"

        print("✓ Protocol validation passed!")

    finally:
        await lh.stop()
```

#### Testing Edge Cases

```python
async def test_edge_cases():
    """Test protocol edge cases in simulation"""

    lh = LiquidHandler(
        backend=ChatterboxBackend(),
        deck=STARLetDeck()
    )
    await lh.setup()

    try:
        # Test 1: Empty well aspiration
        try:
            await lh.aspirate(empty_plate["A1"], vols=100)
            print("✗ Should have raised error for empty well")
        except Exception as e:
            print(f"✓ Correctly raised error: {e}")

        # Test 2: Overfilling well
        try:
            await lh.dispense(small_well, vols=1000)  # Too much
            print("✗ Should have raised error for overfilling")
        except Exception as e:
            print(f"✓ Correctly raised error: {e}")

        # Test 3: Tip capacity
        try:
            await lh.aspirate(large_volume_well, vols=2000)  # Exceeds tip capacity
            print("✗ Should have raised error for tip capacity")
        except Exception as e:
            print(f"✓ Correctly raised error: {e}")

    finally:
        await lh.stop()
```

### CI/CD Integration

Use simulation for automated testing:

```python
# test_protocols.py
import pytest
from pylabrobot.liquid_handling import LiquidHandler
from pylabrobot.liquid_handling.backends.simulation import ChatterboxBackend

@pytest.mark.asyncio
async def test_transfer_protocol():
    """Test liquid transfer protocol"""

    lh = LiquidHandler(
        backend=ChatterboxBackend(),
        deck=STARLetDeck()
    )
    await lh.setup()

    try:
        # Setup
        tip_rack = TIP_CAR_480_A00(name="tips")
        plate = Cos_96_DW_1mL(name="plate")

        lh.deck.assign_child_resource(tip_rack, rails=1)
        lh.deck.assign_child_resource(plate, rails=10)

        # Set initial volumes
        plate["A1"].tracker.set_liquids([(None, 200)])

        # Execute
        await lh.pick_up_tips(tip_rack["A1"])
        await lh.transfer(plate["A1"], plate["A2"], vols=100)
        await lh.drop_tips()

        # Assert
        assert plate["A1"].tracker.get_volume() == 100
        assert plate["A2"].tracker.get_volume() == 100

    finally:
        await lh.stop()
```

## Best Practices

1. **Always Use Simulation First**: Develop and test protocols in simulation before running on hardware
2. **Enable Tracking**: Turn on tip and volume tracking for accurate visualization
3. **Set Initial States**: Define initial liquid volumes for realistic simulation
4. **Visual Inspection**: Use visualizer to verify deck layout and protocol execution
5. **Validate Logic**: Test edge cases and error conditions in simulation
6. **Automated Testing**: Integrate simulation into CI/CD pipelines
7. **Save Layouts**: Use JSON to save and share deck layouts
8. **Document States**: Record initial states for reproducibility
9. **Interactive Development**: Keep visualizer open during development
10. **Protocol Refinement**: Iterate in simulation before hardware runs

## Common Patterns

### Development to Production Workflow

```python
import os

# Configuration
USE_HARDWARE = os.getenv("USE_HARDWARE", "false").lower() == "true"

# Create appropriate backend
if USE_HARDWARE:
    from pylabrobot.liquid_handling.backends import STAR
    backend = STAR()
    print("Running on Hamilton STAR hardware")
else:
    from pylabrobot.liquid_handling.backends.simulation import ChatterboxBackend
    backend = ChatterboxBackend()
    print("Running in simulation mode")

# Rest of protocol is identical
lh = LiquidHandler(backend=backend, deck=STARLetDeck())

if not USE_HARDWARE:
    # Enable visualizer for simulation
    vis = Visualizer()
    await vis.start()
    lh.visualizer = vis

await lh.setup()

# Protocol execution
# ... (same code for hardware and simulation)

# Run with: USE_HARDWARE=false python protocol.py  # Simulation
# Run with: USE_HARDWARE=true python protocol.py   # Hardware
```

### Visual Protocol Verification

```python
async def visual_verification():
    """Run protocol with visual verification pauses"""

    vis = Visualizer()
    await vis.start()

    lh = LiquidHandler(
        backend=ChatterboxBackend(),
        deck=STARLetDeck()
    )
    lh.visualizer = vis
    await lh.setup()

    try:
        # Step 1
        await lh.pick_up_tips(tip_rack["A1:H1"])
        input("Press Enter to continue...")

        # Step 2
        await lh.aspirate(source["A1:H1"], vols=100)
        input("Press Enter to continue...")

        # Step 3
        await lh.dispense(dest["A1:H1"], vols=100)
        input("Press Enter to continue...")

        # Step 4
        await lh.drop_tips()
        input("Press Enter to finish...")

    finally:
        await lh.stop()
        await vis.stop()
```

## Troubleshooting

### Visualizer Not Updating

- Ensure `lh.visualizer = vis` is set before operations
- Check that tracking is enabled globally
- Verify visualizer is running (`vis.start()`)
- Refresh browser if connection is lost

### Tracking Not Working

```python
# Must enable tracking BEFORE creating resources
set_tip_tracking(True)
set_volume_tracking(True)

# Then create resources
tip_rack = TIP_CAR_480_A00(name="tips")
plate = Cos_96_DW_1mL(name="plate")
```

### Simulation Errors

- Simulation validates operations (e.g., can't aspirate from empty well)
- Use try/except to handle validation errors
- Check initial states are set correctly
- Verify volumes don't exceed capacities

## Additional Resources

- Visualizer Documentation: https://docs.pylabrobot.org/user_guide/using-the-visualizer.html (if available)
- Simulation Guide: https://docs.pylabrobot.org/user_guide/simulation.html (if available)
- API Reference: https://docs.pylabrobot.org/api/pylabrobot.visualizer.html
- GitHub Examples: https://github.com/PyLabRobot/pylabrobot/tree/main/examples
