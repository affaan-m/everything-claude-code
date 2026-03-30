# Material Handling Equipment in PyLabRobot

## Overview

PyLabRobot integrates with material handling equipment including heater shakers, incubators, centrifuges, and pumps. These devices enable environmental control, sample preparation, and automated workflows beyond basic liquid handling.

## Heater Shakers

### Hamilton HeaterShaker

The Hamilton HeaterShaker provides temperature control and orbital shaking for microplates.

#### Setup

```python
from pylabrobot.heating_shaking import HeaterShaker
from pylabrobot.heating_shaking.hamilton import HamiltonHeaterShakerBackend

# Create heater shaker
hs = HeaterShaker(
    name="heater_shaker_1",
    backend=HamiltonHeaterShakerBackend(),
    size_x=156.0,
    size_y=  156.0,
    size_z=18.0
)

await hs.setup()
```

#### Operations

**Temperature Control:**

```python
# Set temperature (Celsius)
await hs.set_temperature(37)

# Get current temperature
temp = await hs.get_temperature()
print(f"Current temperature: {temp}°C")

# Turn off heating
await hs.set_temperature(None)
```

**Shaking Control:**

```python
# Start shaking (RPM)
await hs.set_shake_rate(300)  # 300 RPM

# Stop shaking
await hs.set_shake_rate(0)
```

**Plate Operations:**

```python
# Lock plate in position
await hs.lock_plate()

# Unlock plate
await hs.unlock_plate()
```

#### Integration with Liquid Handler

```python
from pylabrobot.liquid_handling import LiquidHandler
from pylabrobot.liquid_handling.backends import STAR
from pylabrobot.resources import STARLetDeck

# Initialize devices
lh = LiquidHandler(backend=STAR(), deck=STARLetDeck())
hs = HeaterShaker(name="hs", backend=HamiltonHeaterShakerBackend())

await lh.setup()
await hs.setup()

try:
    # Assign heater shaker to deck
    lh.deck.assign_child_resource(hs, rails=8)

    # Prepare samples
    tip_rack = TIP_CAR_480_A00(name="tips")
    plate = Cos_96_DW_1mL(name="plate")

    lh.deck.assign_child_resource(tip_rack, rails=1)

    # Place plate on heater shaker
    hs.assign_child_resource(plate, location=(0, 0, 0))

    # Transfer reagents to plate on heater shaker
    await lh.pick_up_tips(tip_rack["A1:H1"])
    await lh.transfer(reagent["A1:H1"], plate["A1:H1"], vols=100)
    await lh.drop_tips()

    # Lock plate and start incubation
    await hs.lock_plate()
    await hs.set_temperature(37)
    await hs.set_shake_rate(300)

    # Incubate
    import asyncio
    await asyncio.sleep(600)  # 10 minutes

    # Stop shaking and heating
    await hs.set_shake_rate(0)
    await hs.set_temperature(None)
    await hs.unlock_plate()

finally:
    await lh.stop()
    await hs.stop()
```

#### Multiple Heater Shakers

The HamiltonHeaterShakerBackend handles multiple units:

```python
# Backend automatically manages multiple heater shakers
hs1 = HeaterShaker(name="hs1", backend=HamiltonHeaterShakerBackend())
hs2 = HeaterShaker(name="hs2", backend=HamiltonHeaterShakerBackend())

await hs1.setup()
await hs2.setup()

# Assign to different deck positions
lh.deck.assign_child_resource(hs1, rails=8)
lh.deck.assign_child_resource(hs2, rails=12)

# Control independently
await hs1.set_temperature(37)
await hs2.set_temperature(42)
```

### Inheco ThermoShake

The Inheco ThermoShake provides temperature control and shaking.

#### Setup

```python
from pylabrobot.heating_shaking import HeaterShaker
from pylabrobot.heating_shaking.inheco import InhecoThermoShakeBackend

hs = HeaterShaker(
    name="thermoshake",
    backend=InhecoThermoShakeBackend(),
    size_x=156.0,
    size_y=156.0,
    size_z=18.0
)

await hs.setup()
```

#### Operations

Similar to Hamilton HeaterShaker:

```python
# Temperature control
await hs.set_temperature(37)
temp = await hs.get_temperature()

# Shaking control
await hs.set_shake_rate(300)

# Plate locking
await hs.lock_plate()
await hs.unlock_plate()
```

## Incubators

### Inheco Incubators

PyLabRobot supports various Inheco incubator models for temperature-controlled plate storage.

#### Supported Models

- Inheco Single Plate Incubator
- Inheco Multi-Plate Incubators
- Other Inheco temperature controllers

#### Setup

```python
from pylabrobot.temperature_control import TemperatureController
from pylabrobot.temperature_control.inheco import InhecoBackend

# Create incubator
incubator = TemperatureController(
    name="incubator",
    backend=InhecoBackend(),
    size_x=156.0,
    size_y=156.0,
    size_z=50.0
)

await incubator.setup()
```

#### Operations

```python
# Set temperature
await incubator.set_temperature(37)

# Get temperature
temp = await incubator.get_temperature()
print(f"Incubator temperature: {temp}°C")

# Turn off
await incubator.set_temperature(None)
```

### Thermo Fisher Cytomat Incubators

Cytomat incubators provide automated plate storage with temperature and CO2 control.

#### Setup

```python
from pylabrobot.incubation import Incubator
from pylabrobot.incubation.cytomat_backend import CytomatBackend

incubator = Incubator(
    name="cytomat",
    backend=CytomatBackend()
)

await incubator.setup()
```

#### Operations

```python
# Store plate
await incubator.store_plate(plate_id="plate_001", position=1)

# Retrieve plate
await incubator.retrieve_plate(position=1)

# Set environmental conditions
await incubator.set_temperature(37)
await incubator.set_co2(5.0)  # 5% CO2
```

## Centrifuges

### Agilent VSpin

The Agilent VSpin is a vacuum-assisted centrifuge for plate processing.

#### Setup

```python
from pylabrobot.centrifuge import Centrifuge
from pylabrobot.centrifuge.vspin import VSpinBackend

centrifuge = Centrifuge(
    name="vspin",
    backend=VSpinBackend()
)

await centrifuge.setup()
```

#### Operations

**Door Control:**

```python
# Open door
await centrifuge.open_door()

# Close door
await centrifuge.close_door()

# Lock door
await centrifuge.lock_door()

# Unlock door
await centrifuge.unlock_door()
```

**Bucket Positioning:**

```python
# Move bucket to loading position
await centrifuge.move_bucket_to_loading()

# Move bucket to home position
await centrifuge.move_bucket_to_home()
```

**Spinning:**

```python
# Run centrifuge
await centrifuge.spin(
    speed=2000,      # RPM
    duration=300     # seconds
)

# Stop spinning
await centrifuge.stop_spin()
```

#### Integration Example

```python
async def centrifuge_workflow():
    """Complete centrifugation workflow"""

    lh = LiquidHandler(backend=STAR(), deck=STARLetDeck())
    centrifuge = Centrifuge(name="vspin", backend=VSpinBackend())

    await lh.setup()
    await centrifuge.setup()

    try:
        # Prepare samples
        await lh.pick_up_tips(tip_rack["A1:H1"])
        await lh.transfer(samples["A1:H12"], plate["A1:H12"], vols=200)
        await lh.drop_tips()

        # Load into centrifuge
        print("Move plate to centrifuge")
        await centrifuge.open_door()
        await centrifuge.move_bucket_to_loading()
        input("Press Enter when plate is loaded...")

        await centrifuge.move_bucket_to_home()
        await centrifuge.close_door()
        await centrifuge.lock_door()

        # Centrifuge
        await centrifuge.spin(speed=2000, duration=300)

        # Unload
        await centrifuge.unlock_door()
        await centrifuge.open_door()
        await centrifuge.move_bucket_to_loading()
        input("Press Enter when plate is removed...")

        await centrifuge.move_bucket_to_home()
        await centrifuge.close_door()

    finally:
        await lh.stop()
        await centrifuge.stop()
```

## Pumps

### Cole Parmer Masterflex

PyLabRobot supports Cole Parmer Masterflex peristaltic pumps for fluid transfer.

#### Setup

```python
from pylabrobot.pumps import Pump
from pylabrobot.pumps.cole_parmer import ColeParmerMasterflexBackend

pump = Pump(
    name="masterflex",
    backend=ColeParmerMasterflexBackend()
)

await pump.setup()
```

#### Operations

**Running Pump:**

```python
# Run for duration
await pump.run_for_duration(
    duration=10,      # seconds
    speed=50          # % of maximum
)

# Run continuously
await pump.start(speed=50)

# Stop pump
await pump.stop()
```

**Volume-Based Pumping:**

```python
# Pump specific volume (requires calibration)
await pump.pump_volume(
    volume=10,        # mL
    speed=50          # % of maximum
)
```

#### Calibration

```python
# Calibrate pump for volume accuracy
# (requires known volume measurement)
await pump.run_for_duration(duration=60, speed=50)
actual_volume = 25.3  # mL measured

pump.calibrate(duration=60, speed=50, volume=actual_volume)
```

### Agrowtek Pump Array

Support for Agrowtek pump arrays for multiple simultaneous fluid transfers.

#### Setup

```python
from pylabrobot.pumps import PumpArray
from pylabrobot.pumps.agrowtek import AgrowtekBackend

pump_array = PumpArray(
    name="agrowtek",
    backend=AgrowtekBackend(),
    num_pumps=8
)

await pump_array.setup()
```

#### Operations

```python
# Run specific pump
await pump_array.run_pump(
    pump_number=1,
    duration=10,
    speed=50
)

# Run multiple pumps simultaneously
await pump_array.run_pumps(
    pump_numbers=[1, 2, 3],
    duration=10,
    speed=50
)
```

## Multi-Device Protocols

### Complex Workflow Example

```python
async def complex_workflow():
    """Multi-device automated workflow"""

    # Initialize all devices
    lh = LiquidHandler(backend=STAR(), deck=STARLetDeck())
    hs = HeaterShaker(name="hs", backend=HamiltonHeaterShakerBackend())
    centrifuge = Centrifuge(name="vspin", backend=VSpinBackend())
    pump = Pump(name="pump", backend=ColeParmerMasterflexBackend())

    await lh.setup()
    await hs.setup()
    await centrifuge.setup()
    await pump.setup()

    try:
        # 1. Sample preparation
        await lh.pick_up_tips(tip_rack["A1:H1"])
        await lh.transfer(samples["A1:H12"], plate["A1:H12"], vols=100)
        await lh.drop_tips()

        # 2. Add reagent via pump
        await pump.pump_volume(volume=50, speed=50)

        # 3. Mix on heater shaker
        await hs.lock_plate()
        await hs.set_temperature(37)
        await hs.set_shake_rate(300)
        await asyncio.sleep(600)  # 10 min incubation
        await hs.set_shake_rate(0)
        await hs.set_temperature(None)
        await hs.unlock_plate()

        # 4. Centrifuge
        await centrifuge.open_door()
        # (load plate)
        await centrifuge.close_door()
        await centrifuge.spin(speed=2000, duration=180)
        await centrifuge.open_door()
        # (unload plate)

        # 5. Transfer supernatant
        await lh.pick_up_tips(tip_rack["A2:H2"])
        await lh.transfer(
            plate["A1:H12"],
            output_plate["A1:H12"],
            vols=80
        )
        await lh.drop_tips()

    finally:
        await lh.stop()
        await hs.stop()
        await centrifuge.stop()
        await pump.stop()
```

## Best Practices

1. **Device Initialization**: Setup all devices at protocol start
2. **Sequential Operations**: Material handling often requires sequential steps
3. **Safety**: Always unlock/open doors before manual plate handling
4. **Temperature Equilibration**: Allow time for devices to reach temperature
5. **Error Handling**: Handle device errors gracefully with try/finally
6. **State Verification**: Check device state before operations
7. **Timing**: Account for device-specific delays (heating, centrifugation)
8. **Maintenance**: Follow manufacturer maintenance schedules
9. **Calibration**: Regularly calibrate pumps and temperature controllers
10. **Documentation**: Record all device settings and parameters

## Common Patterns

### Temperature-Controlled Incubation

```python
async def incubate_with_shaking(
    plate,
    temperature: float,
    shake_rate: int,
    duration: int
):
    """Incubate plate with temperature and shaking"""

    hs = HeaterShaker(name="hs", backend=HamiltonHeaterShakerBackend())
    await hs.setup()

    try:
        # Assign plate to heater shaker
        hs.assign_child_resource(plate, location=(0, 0, 0))

        # Start incubation
        await hs.lock_plate()
        await hs.set_temperature(temperature)
        await hs.set_shake_rate(shake_rate)

        # Wait
        await asyncio.sleep(duration)

        # Stop
        await hs.set_shake_rate(0)
        await hs.set_temperature(None)
        await hs.unlock_plate()

    finally:
        await hs.stop()

# Use in protocol
await incubate_with_shaking(
    plate=assay_plate,
    temperature=37,
    shake_rate=300,
    duration=600  # 10 minutes
)
```

### Automated Plate Processing

```python
async def process_plates(plate_list: list):
    """Process multiple plates through workflow"""

    lh = LiquidHandler(backend=STAR(), deck=STARLetDeck())
    hs = HeaterShaker(name="hs", backend=HamiltonHeaterShakerBackend())

    await lh.setup()
    await hs.setup()

    try:
        for i, plate in enumerate(plate_list):
            print(f"Processing plate {i+1}/{len(plate_list)}")

            # Transfer samples
            await lh.pick_up_tips(tip_rack[f"A{i+1}:H{i+1}"])
            await lh.transfer(
                source[f"A{i+1}:H{i+1}"],
                plate["A1:H1"],
                vols=100
            )
            await lh.drop_tips()

            # Incubate
            hs.assign_child_resource(plate, location=(0, 0, 0))
            await hs.lock_plate()
            await hs.set_temperature(37)
            await hs.set_shake_rate(300)
            await asyncio.sleep(300)  # 5 min
            await hs.set_shake_rate(0)
            await hs.set_temperature(None)
            await hs.unlock_plate()
            hs.unassign_child_resource(plate)

    finally:
        await lh.stop()
        await hs.stop()
```

## Additional Resources

- Material Handling Documentation: https://docs.pylabrobot.org/user_guide/01_material-handling/
- Heater Shakers: https://docs.pylabrobot.org/user_guide/01_material-handling/heating_shaking/
- API Reference: https://docs.pylabrobot.org/api/
- Supported Equipment: https://docs.pylabrobot.org/user_guide/machines.html
