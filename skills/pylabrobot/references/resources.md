# Resource Management in PyLabRobot

## Overview

Resources in PyLabRobot represent laboratory equipment, labware, or components used in protocols. The resource system provides a hierarchical structure for managing plates, tip racks, troughs, tubes, carriers, and other labware with precise spatial positioning and state tracking.

## Resource Basics

### What is a Resource?

A resource represents:
- A piece of labware (plate, tip rack, trough, tube)
- Equipment (liquid handler, plate reader)
- A part of labware (well, tip)
- A container of labware (deck, carrier)

All resources inherit from the base `Resource` class and form a tree structure (arborescence) with parent-child relationships.

### Resource Attributes

Every resource requires:
- **name**: Unique identifier for the resource
- **size_x, size_y, size_z**: Dimensions in millimeters (cuboid representation)
- **location**: Coordinate relative to parent's origin (optional, set when assigned)

```python
from pylabrobot.resources import Resource

# Create a basic resource
resource = Resource(
    name="my_resource",
    size_x=127.76,  # mm
    size_y=85.48,   # mm
    size_z=14.5     # mm
)
```

## Resource Types

### Plates

Microplates with wells for holding liquids:

```python
from pylabrobot.resources import (
    Cos_96_DW_1mL,      # 96-well plate, 1mL deep well
    Cos_96_DW_500ul,    # 96-well plate, 500µL
    Plate_384_Sq,       # 384-well square plate
    Cos_96_PCR          # 96-well PCR plate
)

# Create plate
plate = Cos_96_DW_1mL(name="sample_plate")

# Access wells
well_a1 = plate["A1"]                  # Single well
row_a = plate["A1:H1"]                 # Entire row (A1-H1)
col_1 = plate["A1:A12"]                # Entire column (A1-A12)
range_wells = plate["A1:C3"]           # Range of wells
all_wells = plate.children             # All wells as list
```

### Tip Racks

Containers holding pipette tips:

```python
from pylabrobot.resources import (
    TIP_CAR_480_A00,    # 96 standard tips
    HTF_L,              # Hamilton tips, filtered
    TipRack             # Generic tip rack
)

# Create tip rack
tip_rack = TIP_CAR_480_A00(name="tips")

# Access tips
tip_a1 = tip_rack["A1"]                # Single tip position
tips_row = tip_rack["A1:H1"]           # Row of tips
tips_col = tip_rack["A1:A12"]          # Column of tips

# Check tip presence (requires tip tracking enabled)
from pylabrobot.resources import set_tip_tracking
set_tip_tracking(True)

has_tip = tip_rack["A1"].tracker.has_tip
```

### Troughs

Reservoir containers for reagents:

```python
from pylabrobot.resources import Trough_100ml

# Create trough
trough = Trough_100ml(name="buffer")

# Access channels
channel_1 = trough["channel_1"]
all_channels = trough.children
```

### Tubes

Individual tubes or tube racks:

```python
from pylabrobot.resources import Tube, TubeRack

# Create tube rack
tube_rack = TubeRack(name="samples")

# Access tubes
tube_a1 = tube_rack["A1"]
```

### Carriers

Platforms that hold plates, tips, or other labware:

```python
from pylabrobot.resources import (
    PlateCarrier,
    TipCarrier,
    MFXCarrier
)

# Carriers provide positions for labware
carrier = PlateCarrier(name="plate_carrier")

# Assign plate to carrier
plate = Cos_96_DW_1mL(name="plate")
carrier.assign_child_resource(plate, location=(0, 0, 0))
```

## Deck Management

### Working with Decks

The deck represents the robot's work surface:

```python
from pylabrobot.resources import STARLetDeck, OTDeck

# Hamilton STARlet deck
deck = STARLetDeck()

# Opentrons OT-2 deck
deck = OTDeck()
```

### Assigning Resources to Deck

Resources are assigned to specific deck positions using rails or coordinates:

```python
from pylabrobot.liquid_handling import LiquidHandler
from pylabrobot.resources import STARLetDeck, TIP_CAR_480_A00, Cos_96_DW_1mL

lh = LiquidHandler(backend=backend, deck=STARLetDeck())

# Assign using rail positions (Hamilton STAR)
tip_rack = TIP_CAR_480_A00(name="tips")
source_plate = Cos_96_DW_1mL(name="source")
dest_plate = Cos_96_DW_1mL(name="dest")

lh.deck.assign_child_resource(tip_rack, rails=1)
lh.deck.assign_child_resource(source_plate, rails=10)
lh.deck.assign_child_resource(dest_plate, rails=15)

# Assign using coordinates (x, y, z in mm)
lh.deck.assign_child_resource(
    resource=tip_rack,
    location=(100, 200, 0)
)
```

### Unassigning Resources

Remove resources from deck:

```python
# Unassign specific resource
lh.deck.unassign_child_resource(tip_rack)

# Access assigned resources
all_resources = lh.deck.children
resource_names = [r.name for r in lh.deck.children]
```

## Coordinate System

PyLabRobot uses a right-handed Cartesian coordinate system:

- **X-axis**: Left to right (increasing rightward)
- **Y-axis**: Front to back (increasing toward back)
- **Z-axis**: Down to up (increasing upward)
- **Origin**: Bottom-front-left corner of parent

### Location Calculations

```python
# Get absolute location (relative to deck/root)
absolute_loc = plate.get_absolute_location()

# Get location relative to another resource
relative_loc = well.get_location_wrt(deck)

# Get location relative to parent
parent_relative = plate.location
```

## State Management

### Tracking Liquid Volumes

Track liquid volumes in wells and containers:

```python
from pylabrobot.resources import set_volume_tracking

# Enable volume tracking globally
set_volume_tracking(True)

# Set liquid in well
plate["A1"].tracker.set_liquids([
    (None, 200)  # (liquid_type, volume_in_uL)
])

# Multiple liquids
plate["A2"].tracker.set_liquids([
    ("water", 100),
    ("ethanol", 50)
])

# Get current volume
volume = plate["A1"].tracker.get_volume()  # Returns total volume

# Get liquids
liquids = plate["A1"].tracker.get_liquids()  # Returns list of (type, vol) tuples
```

### Tracking Tip Presence

Track which tips are present in tip racks:

```python
from pylabrobot.resources import set_tip_tracking

# Enable tip tracking globally
set_tip_tracking(True)

# Check if tip is present
has_tip = tip_rack["A1"].tracker.has_tip

# Tips are automatically tracked when using pick_up_tips/drop_tips
await lh.pick_up_tips(tip_rack["A1"])  # Marks tip as absent
await lh.return_tips()                  # Marks tip as present
```

## Serialization

### Saving and Loading Resources

Save resource definitions and states to JSON:

```python
# Save resource definition
plate.save("plate_definition.json")

# Load resource from JSON
from pylabrobot.resources import Plate
plate = Plate.load_from_json_file("plate_definition.json")

# Save deck layout
lh.deck.save("deck_layout.json")

# Load deck layout
from pylabrobot.resources import Deck
deck = Deck.load_from_json_file("deck_layout.json")
```

### State Serialization

Save and restore resource states separately from definitions:

```python
# Save state (tip presence, liquid volumes)
state = plate.serialize_state()
with open("plate_state.json", "w") as f:
    json.dump(state, f)

# Load state
with open("plate_state.json", "r") as f:
    state = json.load(f)
plate.load_state(state)

# Save all states in hierarchy
all_states = lh.deck.serialize_all_state()

# Load all states
lh.deck.load_all_state(all_states)
```

## Custom Resources

### Defining Custom Labware

Create custom labware when built-in resources don't match your equipment:

```python
from pylabrobot.resources import Plate, Well

# Define custom plate
class CustomPlate(Plate):
    def __init__(self, name: str):
        super().__init__(
            name=name,
            size_x=127.76,
            size_y=85.48,
            size_z=14.5,
            num_items_x=12,  # 12 columns
            num_items_y=8,   # 8 rows
            dx=9.0,          # Well spacing X
            dy=9.0,          # Well spacing Y
            dz=0.0,          # Well spacing Z (usually 0)
            item_dx=9.0,     # Distance between well centers X
            item_dy=9.0      # Distance between well centers Y
        )

# Use custom plate
custom_plate = CustomPlate(name="my_custom_plate")
```

### Custom Wells

Define custom well geometry:

```python
from pylabrobot.resources import Well

# Create custom well
well = Well(
    name="custom_well",
    size_x=8.0,
    size_y=8.0,
    size_z=10.5,
    max_volume=200,      # µL
    bottom_shape="flat"  # or "v", "u"
)
```

## Resource Discovery

### Finding Resources

Navigate the resource hierarchy:

```python
# Get all wells in a plate
wells = plate.children

# Find resource by name
resource = lh.deck.get_resource("plate_name")

# Iterate through resources
for resource in lh.deck.children:
    print(f"{resource.name}: {resource.get_absolute_location()}")

# Get wells by pattern
wells_a = [w for w in plate.children if w.name.startswith("A")]
```

### Resource Metadata

Access resource information:

```python
# Resource properties
print(f"Name: {plate.name}")
print(f"Size: {plate.size_x} x {plate.size_y} x {plate.size_z} mm")
print(f"Location: {plate.get_absolute_location()}")
print(f"Parent: {plate.parent.name if plate.parent else None}")
print(f"Children: {len(plate.children)}")

# Type checking
from pylabrobot.resources import Plate, TipRack
if isinstance(resource, Plate):
    print("This is a plate")
elif isinstance(resource, TipRack):
    print("This is a tip rack")
```

## Best Practices

1. **Unique Names**: Use descriptive, unique names for all resources
2. **Enable Tracking**: Turn on tip and volume tracking for accurate state management
3. **Coordinate Validation**: Verify resource positions don't overlap on deck
4. **State Serialization**: Save deck layouts and states for reproducible protocols
5. **Resource Cleanup**: Unassign resources when no longer needed
6. **Custom Resources**: Define custom labware when built-in options don't match
7. **Documentation**: Document custom resource dimensions and properties
8. **Type Checking**: Use isinstance() to verify resource types before operations
9. **Hierarchy Navigation**: Use parent/children relationships to navigate resource tree
10. **JSON Storage**: Store deck layouts in JSON for version control and sharing

## Common Patterns

### Complete Deck Setup

```python
from pylabrobot.liquid_handling import LiquidHandler
from pylabrobot.liquid_handling.backends import STAR
from pylabrobot.resources import (
    STARLetDeck,
    TIP_CAR_480_A00,
    Cos_96_DW_1mL,
    Trough_100ml,
    set_tip_tracking,
    set_volume_tracking
)

# Enable tracking
set_tip_tracking(True)
set_volume_tracking(True)

# Initialize liquid handler
lh = LiquidHandler(backend=STAR(), deck=STARLetDeck())
await lh.setup()

# Define resources
tip_rack_1 = TIP_CAR_480_A00(name="tips_1")
tip_rack_2 = TIP_CAR_480_A00(name="tips_2")
source_plate = Cos_96_DW_1mL(name="source")
dest_plate = Cos_96_DW_1mL(name="dest")
buffer = Trough_100ml(name="buffer")

# Assign to deck
lh.deck.assign_child_resource(tip_rack_1, rails=1)
lh.deck.assign_child_resource(tip_rack_2, rails=2)
lh.deck.assign_child_resource(buffer, rails=5)
lh.deck.assign_child_resource(source_plate, rails=10)
lh.deck.assign_child_resource(dest_plate, rails=15)

# Set initial volumes
for well in source_plate.children:
    well.tracker.set_liquids([(None, 200)])

buffer["channel_1"].tracker.set_liquids([(None, 50000)])  # 50 mL

# Save deck layout
lh.deck.save("my_protocol_deck.json")

# Save initial state
import json
with open("initial_state.json", "w") as f:
    json.dump(lh.deck.serialize_all_state(), f)
```

### Loading Saved Deck

```python
from pylabrobot.resources import Deck

# Load deck from file
deck = Deck.load_from_json_file("my_protocol_deck.json")

# Load state
import json
with open("initial_state.json", "r") as f:
    state = json.load(f)
deck.load_all_state(state)

# Use with liquid handler
lh = LiquidHandler(backend=STAR(), deck=deck)
await lh.setup()

# Access resources by name
source_plate = deck.get_resource("source")
dest_plate = deck.get_resource("dest")
```

## Additional Resources

- Resource Documentation: https://docs.pylabrobot.org/resources/introduction.html
- Custom Resources Guide: https://docs.pylabrobot.org/resources/custom-resources.html
- API Reference: https://docs.pylabrobot.org/api/pylabrobot.resources.html
- Deck Layouts: https://github.com/PyLabRobot/pylabrobot/tree/main/pylabrobot/resources/deck
