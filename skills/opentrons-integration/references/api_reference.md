# Opentrons Python Protocol API v2 Reference

## Protocol Context Methods

### Labware Management

| Method | Description | Returns |
|--------|-------------|---------|
| `load_labware(name, location, label=None, namespace=None, version=None)` | Load labware onto deck | Labware object |
| `load_adapter(name, location, namespace=None, version=None)` | Load adapter onto deck | Labware object |
| `load_labware_from_definition(definition, location, label=None)` | Load custom labware from JSON | Labware object |
| `load_labware_on_adapter(name, adapter, label=None)` | Load labware on adapter | Labware object |
| `load_labware_by_name(name, location, label=None, namespace=None, version=None)` | Alternative load method | Labware object |
| `load_lid_stack(load_name, location, quantity=None)` | Load lid stack (Flex only) | Labware object |

### Instrument Management

| Method | Description | Returns |
|--------|-------------|---------|
| `load_instrument(instrument_name, mount, tip_racks=None, replace=False)` | Load pipette | InstrumentContext |

### Module Management

| Method | Description | Returns |
|--------|-------------|---------|
| `load_module(module_name, location=None, configuration=None)` | Load hardware module | ModuleContext |

### Liquid Management

| Method | Description | Returns |
|--------|-------------|---------|
| `define_liquid(name, description=None, display_color=None)` | Define liquid type | Liquid object |

### Execution Control

| Method | Description | Returns |
|--------|-------------|---------|
| `pause(msg=None)` | Pause protocol execution | None |
| `resume()` | Resume after pause | None |
| `delay(seconds=0, minutes=0, msg=None)` | Delay execution | None |
| `comment(msg)` | Add comment to protocol log | None |
| `home()` | Home all axes | None |
| `set_rail_lights(on)` | Control rail lights (Flex only) | None |

### Protocol Properties

| Property | Description | Type |
|----------|-------------|------|
| `deck` | Deck layout | Deck object |
| `fixed_trash` | Fixed trash location (OT-2) | TrashBin object |
| `loaded_labwares` | Dictionary of loaded labware | Dict |
| `loaded_instruments` | Dictionary of loaded instruments | Dict |
| `loaded_modules` | Dictionary of loaded modules | Dict |
| `is_simulating()` | Check if protocol is simulating | Bool |
| `bundled_data` | Access to bundled data files | Dict |
| `params` | Runtime parameters | ParametersContext |

## Instrument Context (Pipette) Methods

### Tip Management

| Method | Description | Returns |
|--------|-------------|---------|
| `pick_up_tip(location=None, presses=None, increment=None)` | Pick up tip | InstrumentContext |
| `drop_tip(location=None, home_after=True)` | Drop tip in trash | InstrumentContext |
| `return_tip(home_after=True)` | Return tip to rack | InstrumentContext |
| `reset_tipracks()` | Reset tip tracking | None |

### Liquid Handling - Basic

| Method | Description | Returns |
|--------|-------------|---------|
| `aspirate(volume=None, location=None, rate=1.0)` | Aspirate liquid | InstrumentContext |
| `dispense(volume=None, location=None, rate=1.0, push_out=None)` | Dispense liquid | InstrumentContext |
| `blow_out(location=None)` | Expel remaining liquid | InstrumentContext |
| `touch_tip(location=None, radius=1.0, v_offset=-1.0, speed=60.0)` | Remove droplets from tip | InstrumentContext |
| `mix(repetitions=1, volume=None, location=None, rate=1.0)` | Mix liquid | InstrumentContext |
| `air_gap(volume=None, height=None)` | Create air gap | InstrumentContext |

### Liquid Handling - Complex

| Method | Description | Returns |
|--------|-------------|---------|
| `transfer(volume, source, dest, **kwargs)` | Transfer liquid | InstrumentContext |
| `distribute(volume, source, dest, **kwargs)` | Distribute from one to many | InstrumentContext |
| `consolidate(volume, source, dest, **kwargs)` | Consolidate from many to one | InstrumentContext |

**transfer(), distribute(), consolidate() kwargs:**
- `new_tip`: 'always', 'once', or 'never'
- `trash`: True/False - trash tips after use
- `touch_tip`: True/False - touch tip after aspirate/dispense
- `blow_out`: True/False - blow out after dispense
- `mix_before`: (repetitions, volume) tuple
- `mix_after`: (repetitions, volume) tuple
- `disposal_volume`: Extra volume for contamination prevention
- `carryover`: True/False - enable multi-transfer for large volumes
- `gradient`: (start_concentration, end_concentration) for gradients

### Movement and Positioning

| Method | Description | Returns |
|--------|-------------|---------|
| `move_to(location, force_direct=False, minimum_z_height=None, speed=None)` | Move to location | InstrumentContext |
| `home()` | Home pipette axes | None |

### Pipette Properties

| Property | Description | Type |
|----------|-------------|------|
| `default_speed` | Default movement speed | Float |
| `min_volume` | Minimum pipette volume | Float |
| `max_volume` | Maximum pipette volume | Float |
| `current_volume` | Current volume in tip | Float |
| `has_tip` | Check if tip is attached | Bool |
| `name` | Pipette name | String |
| `model` | Pipette model | String |
| `mount` | Mount location | String |
| `channels` | Number of channels | Int |
| `tip_racks` | Associated tip racks | List |
| `trash_container` | Trash location | TrashBin object |
| `starting_tip` | Starting tip for protocol | Well object |
| `flow_rate` | Flow rate settings | FlowRates object |

### Flow Rate Properties

Access via `pipette.flow_rate`:

| Property | Description | Units |
|----------|-------------|-------|
| `aspirate` | Aspirate flow rate | µL/s |
| `dispense` | Dispense flow rate | µL/s |
| `blow_out` | Blow out flow rate | µL/s |

## Labware Methods

### Well Access

| Method | Description | Returns |
|--------|-------------|---------|
| `wells()` | Get all wells | List[Well] |
| `wells_by_name()` | Get wells dictionary | Dict[str, Well] |
| `rows()` | Get wells by row | List[List[Well]] |
| `columns()` | Get wells by column | List[List[Well]] |
| `rows_by_name()` | Get rows dictionary | Dict[str, List[Well]] |
| `columns_by_name()` | Get columns dictionary | Dict[str, List[Well]] |

### Labware Properties

| Property | Description | Type |
|----------|-------------|------|
| `name` | Labware name | String |
| `parent` | Parent location | Location object |
| `quirks` | Labware quirks list | List |
| `magdeck_engage_height` | Magnetic module height | Float |
| `uri` | Labware URI | String |
| `calibrated_offset` | Calibration offset | Point |

## Well Methods and Properties

### Liquid Operations

| Method | Description | Returns |
|--------|-------------|---------|
| `load_liquid(liquid, volume)` | Load liquid into well | None |
| `load_empty()` | Mark well as empty | None |
| `from_center_cartesian(x, y, z)` | Get location from center | Location |

### Location Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `top(z=0)` | Get location at top of well | Location |
| `bottom(z=0)` | Get location at bottom of well | Location |
| `center()` | Get location at center of well | Location |

### Well Properties

| Property | Description | Type |
|----------|-------------|------|
| `diameter` | Well diameter (circular) | Float |
| `length` | Well length (rectangular) | Float |
| `width` | Well width (rectangular) | Float |
| `depth` | Well depth | Float |
| `max_volume` | Maximum volume | Float |
| `display_name` | Display name | String |
| `has_tip` | Check if tip present | Bool |

## Module Contexts

### Temperature Module

| Method | Description | Returns |
|--------|-------------|---------|
| `set_temperature(celsius)` | Set target temperature | None |
| `await_temperature(celsius)` | Wait for temperature | None |
| `deactivate()` | Turn off temperature control | None |
| `load_labware(name, label=None, namespace=None, version=None)` | Load labware on module | Labware |

**Properties:**
- `temperature`: Current temperature (°C)
- `target`: Target temperature (°C)
- `status`: 'idle', 'holding', 'cooling', or 'heating'
- `labware`: Loaded labware

### Magnetic Module

| Method | Description | Returns |
|--------|-------------|---------|
| `engage(height_from_base=None, offset=None, height=None)` | Engage magnets | None |
| `disengage()` | Disengage magnets | None |
| `load_labware(name, label=None, namespace=None, version=None)` | Load labware on module | Labware |

**Properties:**
- `status`: 'engaged' or 'disengaged'
- `labware`: Loaded labware

### Heater-Shaker Module

| Method | Description | Returns |
|--------|-------------|---------|
| `set_target_temperature(celsius)` | Set heater target | None |
| `wait_for_temperature()` | Wait for temperature | None |
| `set_and_wait_for_temperature(celsius)` | Set and wait | None |
| `deactivate_heater()` | Turn off heater | None |
| `set_and_wait_for_shake_speed(rpm)` | Set shake speed | None |
| `deactivate_shaker()` | Turn off shaker | None |
| `open_labware_latch()` | Open latch | None |
| `close_labware_latch()` | Close latch | None |
| `load_labware(name, label=None, namespace=None, version=None)` | Load labware on module | Labware |

**Properties:**
- `temperature`: Current temperature (°C)
- `target_temperature`: Target temperature (°C)
- `current_speed`: Current shake speed (rpm)
- `target_speed`: Target shake speed (rpm)
- `labware_latch_status`: 'idle_open', 'idle_closed', 'opening', 'closing'
- `status`: Module status
- `labware`: Loaded labware

### Thermocycler Module

| Method | Description | Returns |
|--------|-------------|---------|
| `open_lid()` | Open lid | None |
| `close_lid()` | Close lid | None |
| `set_lid_temperature(celsius)` | Set lid temperature | None |
| `deactivate_lid()` | Turn off lid heater | None |
| `set_block_temperature(temperature, hold_time_seconds=0, hold_time_minutes=0, ramp_rate=None, block_max_volume=None)` | Set block temperature | None |
| `deactivate_block()` | Turn off block | None |
| `execute_profile(steps, repetitions, block_max_volume=None)` | Run temperature profile | None |
| `load_labware(name, label=None, namespace=None, version=None)` | Load labware on module | Labware |

**Profile step format:**
```python
{'temperature': 95, 'hold_time_seconds': 30, 'hold_time_minutes': 0}
```

**Properties:**
- `block_temperature`: Current block temperature (°C)
- `block_target_temperature`: Target block temperature (°C)
- `lid_temperature`: Current lid temperature (°C)
- `lid_target_temperature`: Target lid temperature (°C)
- `lid_position`: 'open', 'closed', 'in_between'
- `ramp_rate`: Block temperature ramp rate (°C/s)
- `status`: Module status
- `labware`: Loaded labware

### Absorbance Plate Reader Module

| Method | Description | Returns |
|--------|-------------|---------|
| `initialize(mode, wavelengths)` | Initialize reader | None |
| `read(export_filename=None)` | Read plate | Dict |
| `close_lid()` | Close lid | None |
| `open_lid()` | Open lid | None |
| `load_labware(name, label=None, namespace=None, version=None)` | Load labware on module | Labware |

**Read modes:**
- `'single'`: Single wavelength
- `'multi'`: Multiple wavelengths

**Properties:**
- `is_lid_on`: Lid status
- `labware`: Loaded labware

## Common Labware API Names

### Plates

- `corning_96_wellplate_360ul_flat`
- `nest_96_wellplate_100ul_pcr_full_skirt`
- `nest_96_wellplate_200ul_flat`
- `biorad_96_wellplate_200ul_pcr`
- `appliedbiosystems_384_wellplate_40ul`

### Reservoirs

- `nest_12_reservoir_15ml`
- `nest_1_reservoir_195ml`
- `usascientific_12_reservoir_22ml`

### Tip Racks

**Flex:**
- `opentrons_flex_96_tiprack_50ul`
- `opentrons_flex_96_tiprack_200ul`
- `opentrons_flex_96_tiprack_1000ul`

**OT-2:**
- `opentrons_96_tiprack_20ul`
- `opentrons_96_tiprack_300ul`
- `opentrons_96_tiprack_1000ul`

### Tube Racks

- `opentrons_10_tuberack_falcon_4x50ml_6x15ml_conical`
- `opentrons_24_tuberack_nest_1.5ml_snapcap`
- `opentrons_24_tuberack_nest_1.5ml_screwcap`
- `opentrons_15_tuberack_falcon_15ml_conical`

### Adapters

- `opentrons_flex_96_tiprack_adapter`
- `opentrons_96_deep_well_adapter`
- `opentrons_aluminum_flat_bottom_plate`

## Error Handling

Common exceptions:

- `OutOfTipsError`: No tips available
- `LabwareNotLoadedError`: Labware not loaded on deck
- `InvalidContainerError`: Invalid labware specification
- `InstrumentNotLoadedError`: Pipette not loaded
- `InvalidVolumeError`: Volume out of range

## Simulation and Debugging

Check simulation status:
```python
if protocol.is_simulating():
    protocol.comment('Running in simulation')
```

Access bundled data files:
```python
data_file = protocol.bundled_data['data.csv']
with open(data_file) as f:
    data = f.read()
```

## Version Compatibility

API Level compatibility:

| API Level | Features |
|-----------|----------|
| 2.19 | Latest features, Flex support |
| 2.18 | Absorbance plate reader |
| 2.17 | Liquid tracking improvements |
| 2.16 | Flex 8-channel partial tip pickup |
| 2.15 | Heater-Shaker Gen1 |
| 2.13 | Temperature Module Gen2 |
| 2.0-2.12 | Core OT-2 functionality |

Always use the latest stable API version for new protocols.
