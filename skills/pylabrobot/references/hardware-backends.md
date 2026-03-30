# Hardware Backends in PyLabRobot

## Overview

PyLabRobot uses a backend abstraction system that allows the same protocol code to run on different liquid handling robots and platforms. Backends handle device-specific communication while the `LiquidHandler` frontend provides a unified interface.

## Backend Architecture

### How Backends Work

1. **Frontend**: `LiquidHandler` class provides high-level API
2. **Backend**: Device-specific class handles hardware communication
3. **Protocol**: Same code works across different backends

```python
# Same protocol code
await lh.pick_up_tips(tip_rack["A1"])
await lh.aspirate(plate["A1"], vols=100)
await lh.dispense(plate["A2"], vols=100)
await lh.drop_tips()

# Works with any backend (STAR, Opentrons, simulation, etc.)
```

### Backend Interface

All backends inherit from `LiquidHandlerBackend` and implement:
- `setup()`: Initialize connection to hardware
- `stop()`: Close connection and cleanup
- Device-specific command methods (aspirate, dispense, etc.)

## Supported Backends

### Hamilton STAR (Full Support)

The Hamilton STAR and STARlet liquid handling robots have full PyLabRobot support.

**Setup:**

```python
from pylabrobot.liquid_handling import LiquidHandler
from pylabrobot.liquid_handling.backends import STAR
from pylabrobot.resources import STARLetDeck

# Create STAR backend
backend = STAR()

# Initialize liquid handler
lh = LiquidHandler(backend=backend, deck=STARLetDeck())
await lh.setup()
```

**Platform Support:**
- Windows ✅
- macOS ✅
- Linux ✅
- Raspberry Pi ✅

**Communication:**
- USB connection to robot
- Direct firmware commands
- No Hamilton software required

**Features:**
- Full liquid handling operations
- CO-RE tip support
- 96-channel head support (if equipped)
- Temperature control
- Carrier and rail-based positioning

**Deck Types:**
```python
from pylabrobot.resources import STARLetDeck, STARDeck

# For STARlet (smaller deck)
deck = STARLetDeck()

# For STAR (full deck)
deck = STARDeck()
```

**Example:**

```python
from pylabrobot.liquid_handling import LiquidHandler
from pylabrobot.liquid_handling.backends import STAR
from pylabrobot.resources import STARLetDeck, TIP_CAR_480_A00, Cos_96_DW_1mL

# Initialize
lh = LiquidHandler(backend=STAR(), deck=STARLetDeck())
await lh.setup()

# Define resources
tip_rack = TIP_CAR_480_A00(name="tips")
plate = Cos_96_DW_1mL(name="plate")

# Assign to rails
lh.deck.assign_child_resource(tip_rack, rails=1)
lh.deck.assign_child_resource(plate, rails=10)

# Execute protocol
await lh.pick_up_tips(tip_rack["A1"])
await lh.transfer(plate["A1"], plate["A2"], vols=100)
await lh.drop_tips()

await lh.stop()
```

### Opentrons OT-2 (Supported)

The Opentrons OT-2 is supported through the Opentrons HTTP API.

**Setup:**

```python
from pylabrobot.liquid_handling import LiquidHandler
from pylabrobot.liquid_handling.backends import OpentronsBackend
from pylabrobot.resources import OTDeck

# Create Opentrons backend (requires robot IP address)
backend = OpentronsBackend(host="192.168.1.100")  # Replace with your robot's IP

# Initialize liquid handler
lh = LiquidHandler(backend=backend, deck=OTDeck())
await lh.setup()
```

**Platform Support:**
- Any platform with network access to OT-2

**Communication:**
- HTTP API over network
- Requires robot IP address
- No Opentrons app required

**Features:**
- 8-channel pipette support
- Single-channel pipette support
- Standard OT-2 deck layout
- Coordinate-based positioning

**Limitations:**
- Uses older Opentrons HTTP API
- Some features may be limited compared to STAR

**Example:**

```python
from pylabrobot.liquid_handling import LiquidHandler
from pylabrobot.liquid_handling.backends import OpentronsBackend
from pylabrobot.resources import OTDeck

# Initialize with robot IP
lh = LiquidHandler(
    backend=OpentronsBackend(host="192.168.1.100"),
    deck=OTDeck()
)
await lh.setup()

# Load deck layout
lh.deck = Deck.load_from_json_file("opentrons_layout.json")

# Execute protocol
await lh.pick_up_tips(tip_rack["A1"])
await lh.transfer(plate["A1"], plate["A2"], vols=100)
await lh.drop_tips()

await lh.stop()
```

### Tecan EVO (Work in Progress)

Support for Tecan EVO liquid handling robots is under development.

**Current Status:**
- Work-in-progress
- Basic commands may be available
- Check documentation for current feature support

**Setup (when available):**

```python
from pylabrobot.liquid_handling import LiquidHandler
from pylabrobot.liquid_handling.backends import TecanBackend
from pylabrobot.resources import TecanDeck

backend = TecanBackend()
lh = LiquidHandler(backend=backend, deck=TecanDeck())
```

### Hamilton Vantage (Mostly Supported)

Hamilton Vantage has "mostly" complete support.

**Setup:**

```python
from pylabrobot.liquid_handling.backends import Vantage
from pylabrobot.resources import VantageDeck

lh = LiquidHandler(backend=Vantage(), deck=VantageDeck())
```

**Features:**
- Similar to STAR support
- Some advanced features may be limited

## Simulation Backend

### ChatterboxBackend (Simulation)

Test protocols without physical hardware using the simulation backend.

**Setup:**

```python
from pylabrobot.liquid_handling import LiquidHandler
from pylabrobot.liquid_handling.backends.simulation import ChatterboxBackend
from pylabrobot.resources import STARLetDeck

# Create simulation backend
backend = ChatterboxBackend(num_channels=8)

# Initialize liquid handler
lh = LiquidHandler(backend=backend, deck=STARLetDeck())
await lh.setup()
```

**Features:**
- No hardware required
- Simulates all liquid handling operations
- Works with visualizer for real-time feedback
- Validates protocol logic
- Tracks tips and volumes

**Use Cases:**
- Protocol development and testing
- Training and education
- CI/CD pipeline testing
- Debugging without hardware access

**Example:**

```python
from pylabrobot.liquid_handling import LiquidHandler
from pylabrobot.liquid_handling.backends.simulation import ChatterboxBackend
from pylabrobot.resources import STARLetDeck, TIP_CAR_480_A00, Cos_96_DW_1mL
from pylabrobot.resources import set_tip_tracking, set_volume_tracking

# Enable tracking for simulation
set_tip_tracking(True)
set_volume_tracking(True)

# Initialize with simulation backend
lh = LiquidHandler(
    backend=ChatterboxBackend(num_channels=8),
    deck=STARLetDeck()
)
await lh.setup()

# Define resources
tip_rack = TIP_CAR_480_A00(name="tips")
plate = Cos_96_DW_1mL(name="plate")

lh.deck.assign_child_resource(tip_rack, rails=1)
lh.deck.assign_child_resource(plate, rails=10)

# Set initial volumes
for well in plate.children:
    well.tracker.set_liquids([(None, 200)])

# Run simulated protocol
await lh.pick_up_tips(tip_rack["A1:H1"])
await lh.transfer(plate["A1:H1"], plate["A2:H2"], vols=100)
await lh.drop_tips()

# Check results
print(f"A1 volume: {plate['A1'].tracker.get_volume()} µL")  # 100 µL
print(f"A2 volume: {plate['A2'].tracker.get_volume()} µL")  # 100 µL

await lh.stop()
```

## Switching Backends

### Backend-Agnostic Protocols

Write protocols that work with any backend:

```python
def get_backend(robot_type: str):
    """Factory function to create appropriate backend"""
    if robot_type == "star":
        from pylabrobot.liquid_handling.backends import STAR
        return STAR()
    elif robot_type == "opentrons":
        from pylabrobot.liquid_handling.backends import OpentronsBackend
        return OpentronsBackend(host="192.168.1.100")
    elif robot_type == "simulation":
        from pylabrobot.liquid_handling.backends.simulation import ChatterboxBackend
        return ChatterboxBackend()
    else:
        raise ValueError(f"Unknown robot type: {robot_type}")

def get_deck(robot_type: str):
    """Factory function to create appropriate deck"""
    if robot_type == "star":
        from pylabrobot.resources import STARLetDeck
        return STARLetDeck()
    elif robot_type == "opentrons":
        from pylabrobot.resources import OTDeck
        return OTDeck()
    elif robot_type == "simulation":
        from pylabrobot.resources import STARLetDeck
        return STARLetDeck()
    else:
        raise ValueError(f"Unknown robot type: {robot_type}")

# Use in protocol
robot_type = "simulation"  # Change to "star" or "opentrons" as needed
backend = get_backend(robot_type)
deck = get_deck(robot_type)

lh = LiquidHandler(backend=backend, deck=deck)
await lh.setup()

# Protocol code works with any backend
await lh.pick_up_tips(tip_rack["A1"])
await lh.transfer(plate["A1"], plate["A2"], vols=100)
await lh.drop_tips()
```

### Development Workflow

1. **Develop**: Write protocol using ChatterboxBackend
2. **Test**: Run with visualizer to validate logic
3. **Verify**: Test on simulation with real deck layout
4. **Deploy**: Switch to hardware backend (STAR, Opentrons)

```python
# Development
lh = LiquidHandler(backend=ChatterboxBackend(), deck=STARLetDeck())

# ... develop protocol ...

# Production (just change backend)
lh = LiquidHandler(backend=STAR(), deck=STARLetDeck())
```

## Backend Configuration

### Custom Backend Parameters

Some backends accept configuration parameters:

```python
# Opentrons with custom parameters
backend = OpentronsBackend(
    host="192.168.1.100",
    port=31950  # Default Opentrons API port
)

# ChatterboxBackend with custom channels
backend = ChatterboxBackend(
    num_channels=8  # 8-channel simulation
)
```

### Connection Troubleshooting

**Hamilton STAR:**
- Ensure USB cable is connected
- Check that no other software is using the robot
- Verify firmware is up to date
- On macOS/Linux, may need USB permissions

**Opentrons OT-2:**
- Verify robot IP address is correct
- Check network connectivity (ping robot)
- Ensure robot is powered on
- Confirm Opentrons app is not blocking API access

**General:**
- Use `await lh.setup()` to test connection
- Check error messages for specific issues
- Ensure proper permissions for device access

## Backend-Specific Features

### Hamilton STAR Specific

```python
# Access backend directly for hardware-specific features
star_backend = lh.backend

# Hamilton-specific commands (if needed)
# Most operations should go through LiquidHandler interface
```

### Opentrons Specific

```python
# Opentrons-specific configuration
ot_backend = lh.backend

# Access OT-2 API directly if needed (advanced)
# Most operations should go through LiquidHandler interface
```

## Best Practices

1. **Abstract Hardware**: Write backend-agnostic protocols when possible
2. **Test in Simulation**: Always test with ChatterboxBackend first
3. **Factory Pattern**: Use factory functions to create backends
4. **Error Handling**: Handle connection errors gracefully
5. **Documentation**: Document which backends your protocol supports
6. **Configuration**: Use config files for backend parameters
7. **Version Control**: Track backend versions and compatibility
8. **Cleanup**: Always call `await lh.stop()` to release hardware
9. **Single Connection**: Only one program should connect to hardware at a time
10. **Platform Testing**: Test on target platform before deployment

## Common Patterns

### Multi-Backend Support

```python
import asyncio
from typing import Literal

async def run_protocol(
    robot_type: Literal["star", "opentrons", "simulation"],
    visualize: bool = False
):
    """Run protocol on specified backend"""

    # Create backend
    if robot_type == "star":
        from pylabrobot.liquid_handling.backends import STAR
        backend = STAR()
        deck = STARLetDeck()
    elif robot_type == "opentrons":
        from pylabrobot.liquid_handling.backends import OpentronsBackend
        backend = OpentronsBackend(host="192.168.1.100")
        deck = OTDeck()
    elif robot_type == "simulation":
        from pylabrobot.liquid_handling.backends.simulation import ChatterboxBackend
        backend = ChatterboxBackend()
        deck = STARLetDeck()

    # Initialize
    lh = LiquidHandler(backend=backend, deck=deck)
    await lh.setup()

    try:
        # Load deck layout (backend-agnostic)
        # lh.deck = Deck.load_from_json_file(f"{robot_type}_layout.json")

        # Execute protocol (backend-agnostic)
        await lh.pick_up_tips(tip_rack["A1"])
        await lh.transfer(plate["A1"], plate["A2"], vols=100)
        await lh.drop_tips()

        print("Protocol completed successfully!")

    finally:
        await lh.stop()

# Run on different backends
await run_protocol("simulation")      # Test in simulation
await run_protocol("star")            # Run on Hamilton STAR
await run_protocol("opentrons")       # Run on Opentrons OT-2
```

## Additional Resources

- Backend Documentation: https://docs.pylabrobot.org/user_guide/backends.html
- Supported Machines: https://docs.pylabrobot.org/user_guide/machines.html
- API Reference: https://docs.pylabrobot.org/api/pylabrobot.liquid_handling.backends.html
- GitHub Examples: https://github.com/PyLabRobot/pylabrobot/tree/main/examples
