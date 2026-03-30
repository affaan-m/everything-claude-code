#!/usr/bin/env python3
"""
Serial Dilution Protocol Template

This template demonstrates how to perform a serial dilution across a plate row.
Useful for creating concentration gradients for assays.
"""

from opentrons import protocol_api

metadata = {
    'protocolName': 'Serial Dilution Template',
    'author': 'Opentrons',
    'description': 'Serial dilution protocol for creating concentration gradients',
    'apiLevel': '2.19'
}

requirements = {
    'robotType': 'Flex',
    'apiLevel': '2.19'
}

def run(protocol: protocol_api.ProtocolContext):
    """
    Performs a serial dilution across plate rows.

    Protocol performs:
    1. Adds diluent to all wells except the first column
    2. Transfers stock solution to first column
    3. Performs serial dilutions across rows
    """

    # Load labware
    tips = protocol.load_labware('opentrons_flex_96_tiprack_200ul', 'D1')
    reservoir = protocol.load_labware('nest_12_reservoir_15ml', 'D2', label='Reservoir')
    plate = protocol.load_labware('corning_96_wellplate_360ul_flat', 'D3', label='Dilution Plate')

    # Load pipette
    p300 = protocol.load_instrument('p300_single_flex', 'left', tip_racks=[tips])

    # Define liquids (optional, for visualization)
    diluent = protocol.define_liquid(
        name='Diluent',
        description='Buffer or growth media',
        display_color='#B0E0E6'
    )

    stock = protocol.define_liquid(
        name='Stock Solution',
        description='Concentrated stock',
        display_color='#FF6347'
    )

    # Load liquids into wells
    reservoir['A1'].load_liquid(liquid=diluent, volume=15000)
    reservoir['A2'].load_liquid(liquid=stock, volume=5000)

    # Protocol parameters
    dilution_factor = 2  # 1:2 dilution
    transfer_volume = 100  # µL
    num_dilutions = 11  # Number of dilution steps

    protocol.comment('Starting serial dilution protocol')

    # Step 1: Add diluent to all wells except first column
    protocol.comment('Adding diluent to wells...')
    for row in plate.rows()[:8]:  # For each row (A-H)
        p300.transfer(
            transfer_volume,
            reservoir['A1'],  # Diluent source
            row[1:],  # All wells except first (columns 2-12)
            new_tip='once'
        )

    # Step 2: Add stock solution to first column
    protocol.comment('Adding stock solution to first column...')
    p300.transfer(
        transfer_volume * 2,  # Double volume for first well
        reservoir['A2'],  # Stock source
        [row[0] for row in plate.rows()[:8]],  # First column (wells A1-H1)
        new_tip='always'
    )

    # Step 3: Perform serial dilution
    protocol.comment('Performing serial dilutions...')
    for row in plate.rows()[:8]:  # For each row
        p300.transfer(
            transfer_volume,
            row[:num_dilutions],  # Source wells (1-11)
            row[1:num_dilutions + 1],  # Destination wells (2-12)
            mix_after=(3, 50),  # Mix 3x with 50µL after each transfer
            new_tip='always'
        )

    protocol.comment('Serial dilution complete!')
    protocol.comment(f'Created {num_dilutions} dilutions with {dilution_factor}x dilution factor')
