#!/usr/bin/env python3
"""
Basic Opentrons Protocol Template

This template provides a minimal starting point for creating Opentrons protocols.
Replace the placeholder values and add your specific protocol logic.
"""

from opentrons import protocol_api

# Metadata
metadata = {
    'protocolName': 'Basic Protocol Template',
    'author': 'Your Name <email@example.com>',
    'description': 'A basic protocol template for Opentrons',
    'apiLevel': '2.19'
}

# Requirements
requirements = {
    'robotType': 'Flex',  # or 'OT-2'
    'apiLevel': '2.19'
}

def run(protocol: protocol_api.ProtocolContext):
    """
    Main protocol function.

    Args:
        protocol: The protocol context provided by Opentrons
    """

    # Load tip racks
    tips_200 = protocol.load_labware('opentrons_flex_96_tiprack_200ul', 'D1')

    # Load labware
    source_plate = protocol.load_labware(
        'nest_96_wellplate_200ul_flat',
        'D2',
        label='Source Plate'
    )

    dest_plate = protocol.load_labware(
        'nest_96_wellplate_200ul_flat',
        'D3',
        label='Destination Plate'
    )

    # Load pipette
    pipette = protocol.load_instrument(
        'p300_single_flex',
        'left',
        tip_racks=[tips_200]
    )

    # Protocol commands
    protocol.comment('Starting protocol...')

    # Example: Transfer from A1 to B1
    pipette.transfer(
        volume=50,
        source=source_plate['A1'],
        dest=dest_plate['B1'],
        new_tip='always'
    )

    protocol.comment('Protocol complete!')
