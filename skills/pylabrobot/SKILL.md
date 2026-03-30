---
name: pylabrobot
description: Vendor-agnostic lab automation framework. Use when controlling multiple equipment types (Hamilton, Tecan, Opentrons, plate readers, pumps) or needing unified programming across different vendors. Best for complex workflows, multi-vendor setups, simulation. For Opentrons-only protocols with official API, opentrons-integration may be simpler.
license: MIT license
metadata:
    skill-author: K-Dense Inc.
---

# PyLabRobot

## Overview

PyLabRobot is a hardware-agnostic, pure Python Software Development Kit for automated and autonomous laboratories. Use this skill to control liquid handling robots, plate readers, pumps, heater shakers, incubators, centrifuges, and other laboratory automation equipment through a unified Python interface that works across platforms (Windows, macOS, Linux).

## When to Use This Skill

Use this skill when:
- Programming liquid handling robots (Hamilton STAR/STARlet, Opentrons OT-2, Tecan EVO)
- Automating laboratory workflows involving pipetting, sample preparation, or analytical measurements
- Managing deck layouts and laboratory resources (plates, tips, containers, troughs)
- Integrating multiple lab devices (liquid handlers, plate readers, heater shakers, pumps)
- Creating reproducible laboratory protocols with state management
- Simulating protocols before running on physical hardware
- Reading plates using BMG CLARIOstar or other supported plate readers
- Controlling temperature, shaking, centrifugation, or other material handling operations
- Working with laboratory automation in Python

## Core Capabilities

PyLabRobot provides comprehensive laboratory automation through six main capability areas, each detailed in the references/ directory:

### 1. Liquid Handling (`references/liquid-handling.md`)

Control liquid handling robots for aspirating, dispensing, and transferring liquids. Key operations include:
- **Basic Operations**: Aspirate, dispense, transfer liquids between wells
- **Tip Management**: Pick up, drop, and track pipette tips automatically
- **Advanced Techniques**: Multi-channel pipetting, serial dilutions, plate replication
- **Volume Tracking**: Automatic tracking of liquid volumes in wells
- **Hardware Support**: Hamilton STAR/STARlet, Opentrons OT-2, Tecan EVO, and others

### 2. Resource Management (`references/resources.md`)

Manage laboratory resources in a hierarchical system:
- **Resource Types**: Plates, tip racks, troughs, tubes, carriers, and custom labware
- **Deck Layout**: Assign resources to deck positions with coordinate systems
- **State Management**: Track tip presence, liquid volumes, and resource states
- **Serialization**: Save and load deck layouts and states from JSON files
- **Resource Discovery**: Access wells, tips, and containers through intuitive APIs

### 3. Hardware Backends (`references/hardware-backends.md`)

Connect to diverse laboratory equipment through backend abstraction:
- **Liquid Handlers**: Hamilton STAR (full support), Opentrons OT-2, Tecan EVO
- **Simulation**: ChatterboxBackend for protocol testing without hardware
- **Platform Support**: Works on Windows, macOS, Linux, and Raspberry Pi
- **Backend Switching**: Change robots by swapping backend without rewriting protocols

### 4. Analytical Equipment (`references/analytical-equipment.md`)

Integrate plate readers and analytical instruments:
- **Plate Readers**: BMG CLARIOstar for absorbance, luminescence, fluorescence
- **Scales**: Mettler Toledo integration for mass measurements
- **Integration Patterns**: Combine liquid handlers with analytical equipment
- **Automated Workflows**: Move plates between devices automatically

### 5. Material Handling (`references/material-handling.md`)

Control environmental and material handling equipment:
- **Heater Shakers**: Hamilton HeaterShaker, Inheco ThermoShake
- **Incubators**: Inheco and Thermo Fisher incubators with temperature control
- **Centrifuges**: Agilent VSpin with bucket positioning and spin control
- **Pumps**: Cole Parmer Masterflex for fluid pumping operations
- **Temperature Control**: Set and monitor temperatures during protocols

### 6. Visualization & Simulation (`references/visualization.md`)

Visualize and simulate laboratory protocols:
- **Browser Visualizer**: Real-time 3D visualization of deck state
- **Simulation Mode**: Test protocols without physical hardware
- **State Tracking**: Monitor tip presence and liquid volumes visually
- **Deck Editor**: Graphical tool for designing deck layouts
- **Protocol Validation**: Verify protocols before running on hardware

## Quick Start

To get started with PyLabRobot, install the package and initialize a liquid handler:

```python
# Install PyLabRobot
# uv pip install pylabrobot

# Basic liquid handling setup
from pylabrobot.liquid_handling import LiquidHandler
from pylabrobot.liquid_handling.backends import STAR
from pylabrobot.resources import STARLetDeck

# Initialize liquid handler
lh = LiquidHandler(backend=STAR(), deck=STARLetDeck())
await lh.setup()

# Basic operations
await lh.pick_up_tips(tip_rack["A1:H1"])
await lh.aspirate(plate["A1"], vols=100)
await lh.dispense(plate["A2"], vols=100)
await lh.drop_tips()
```

## Working with References

This skill organizes detailed information across multiple reference files. Load the relevant reference when:
- **Liquid Handling**: Writing pipetting protocols, tip management, transfers
- **Resources**: Defining deck layouts, managing plates/tips, custom labware
- **Hardware Backends**: Connecting to specific robots, switching platforms
- **Analytical Equipment**: Integrating plate readers, scales, or analytical devices
- **Material Handling**: Using heater shakers, incubators, centrifuges, pumps
- **Visualization**: Simulating protocols, visualizing deck states

All reference files can be found in the `references/` directory and contain comprehensive examples, API usage patterns, and best practices.

## Best Practices

When creating laboratory automation protocols with PyLabRobot:

1. **Start with Simulation**: Use ChatterboxBackend and the visualizer to test protocols before running on hardware
2. **Enable Tracking**: Turn on tip tracking and volume tracking for accurate state management
3. **Resource Naming**: Use clear, descriptive names for all resources (plates, tip racks, containers)
4. **State Serialization**: Save deck layouts and states to JSON for reproducibility
5. **Error Handling**: Implement proper async error handling for hardware operations
6. **Temperature Control**: Set temperatures early as heating/cooling takes time
7. **Modular Protocols**: Break complex workflows into reusable functions
8. **Documentation**: Reference official docs at https://docs.pylabrobot.org for latest features

## Common Workflows

### Liquid Transfer Protocol

```python
# Setup
lh = LiquidHandler(backend=STAR(), deck=STARLetDeck())
await lh.setup()

# Define resources
tip_rack = TIP_CAR_480_A00(name="tip_rack")
source_plate = Cos_96_DW_1mL(name="source")
dest_plate = Cos_96_DW_1mL(name="dest")

lh.deck.assign_child_resource(tip_rack, rails=1)
lh.deck.assign_child_resource(source_plate, rails=10)
lh.deck.assign_child_resource(dest_plate, rails=15)

# Transfer protocol
await lh.pick_up_tips(tip_rack["A1:H1"])
await lh.transfer(source_plate["A1:H12"], dest_plate["A1:H12"], vols=100)
await lh.drop_tips()
```

### Plate Reading Workflow

```python
# Setup plate reader
from pylabrobot.plate_reading import PlateReader
from pylabrobot.plate_reading.clario_star_backend import CLARIOstarBackend

pr = PlateReader(name="CLARIOstar", backend=CLARIOstarBackend())
await pr.setup()

# Set temperature and read
await pr.set_temperature(37)
await pr.open()
# (manually or robotically load plate)
await pr.close()
data = await pr.read_absorbance(wavelength=450)
```

## Additional Resources

- **Official Documentation**: https://docs.pylabrobot.org
- **GitHub Repository**: https://github.com/PyLabRobot/pylabrobot
- **Community Forum**: https://discuss.pylabrobot.org
- **PyPI Package**: https://pypi.org/project/PyLabRobot/

For detailed usage of specific capabilities, refer to the corresponding reference file in the `references/` directory.

