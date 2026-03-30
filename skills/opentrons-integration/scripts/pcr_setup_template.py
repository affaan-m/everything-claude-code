#!/usr/bin/env python3
"""
PCR Setup Protocol Template

This template demonstrates how to set up PCR reactions using the Thermocycler module.
Includes master mix distribution, sample addition, and PCR cycling.
"""

from opentrons import protocol_api

metadata = {
    'protocolName': 'PCR Setup with Thermocycler',
    'author': 'Opentrons',
    'description': 'Automated PCR setup and cycling protocol',
    'apiLevel': '2.19'
}

requirements = {
    'robotType': 'Flex',
    'apiLevel': '2.19'
}

def run(protocol: protocol_api.ProtocolContext):
    """
    Sets up PCR reactions and runs thermocycler.

    Protocol performs:
    1. Distributes master mix to PCR plate
    2. Adds DNA samples
    3. Runs PCR cycling program
    """

    # Load thermocycler module
    tc_mod = protocol.load_module('thermocyclerModuleV2')
    tc_plate = tc_mod.load_labware('nest_96_wellplate_100ul_pcr_full_skirt')

    # Load tips and reagents
    tips_20 = protocol.load_labware('opentrons_flex_96_tiprack_50ul', 'C1')
    tips_200 = protocol.load_labware('opentrons_flex_96_tiprack_200ul', 'C2')
    reagent_rack = protocol.load_labware(
        'opentrons_24_tuberack_nest_1.5ml_snapcap',
        'D1',
        label='Reagents'
    )

    # Load pipettes
    p20 = protocol.load_instrument('p50_single_flex', 'left', tip_racks=[tips_20])
    p300 = protocol.load_instrument('p300_single_flex', 'right', tip_racks=[tips_200])

    # Define liquids
    master_mix = protocol.define_liquid(
        name='PCR Master Mix',
        description='2x PCR master mix',
        display_color='#FFB6C1'
    )

    template_dna = protocol.define_liquid(
        name='Template DNA',
        description='DNA samples',
        display_color='#90EE90'
    )

    # Load liquids
    reagent_rack['A1'].load_liquid(liquid=master_mix, volume=1000)
    for i in range(8):  # 8 samples
        reagent_rack.wells()[i + 1].load_liquid(liquid=template_dna, volume=50)

    # PCR setup parameters
    num_samples = 8
    master_mix_volume = 20  # µL per reaction
    template_volume = 5  # µL per reaction
    total_reaction_volume = 25  # µL

    protocol.comment('Starting PCR setup...')

    # Open thermocycler lid
    tc_mod.open_lid()
    protocol.comment('Thermocycler lid opened')

    # Step 1: Distribute master mix
    protocol.comment(f'Distributing {master_mix_volume}µL master mix to {num_samples} wells...')
    p300.distribute(
        master_mix_volume,
        reagent_rack['A1'],
        tc_plate.wells()[:num_samples],
        new_tip='once',
        disposal_volume=10  # Extra volume to prevent shortage
    )

    # Step 2: Add template DNA
    protocol.comment('Adding template DNA to each well...')
    for i in range(num_samples):
        p20.transfer(
            template_volume,
            reagent_rack.wells()[i + 1],  # Sample tubes
            tc_plate.wells()[i],  # PCR plate wells
            mix_after=(3, 10),  # Mix 3x with 10µL
            new_tip='always'
        )

    protocol.comment('PCR reactions prepared')

    # Close lid and start PCR
    tc_mod.close_lid()
    protocol.comment('Thermocycler lid closed')

    # Set lid temperature
    tc_mod.set_lid_temperature(celsius=105)
    protocol.comment('Lid heating to 105°C')

    # Initial denaturation
    protocol.comment('Initial denaturation...')
    tc_mod.set_block_temperature(
        temperature=95,
        hold_time_seconds=180,
        block_max_volume=total_reaction_volume
    )

    # PCR cycling profile
    protocol.comment('Starting PCR cycling...')
    profile = [
        {'temperature': 95, 'hold_time_seconds': 15},  # Denaturation
        {'temperature': 60, 'hold_time_seconds': 30},  # Annealing
        {'temperature': 72, 'hold_time_seconds': 30}   # Extension
    ]

    num_cycles = 35
    tc_mod.execute_profile(
        steps=profile,
        repetitions=num_cycles,
        block_max_volume=total_reaction_volume
    )

    # Final extension
    protocol.comment('Final extension...')
    tc_mod.set_block_temperature(
        temperature=72,
        hold_time_minutes=5,
        block_max_volume=total_reaction_volume
    )

    # Hold at 4°C
    protocol.comment('Cooling to 4°C for storage...')
    tc_mod.set_block_temperature(
        temperature=4,
        block_max_volume=total_reaction_volume
    )

    # Deactivate and open
    tc_mod.deactivate_lid()
    tc_mod.open_lid()

    protocol.comment('PCR complete! Plate ready for removal.')
    protocol.comment(f'Completed {num_cycles} cycles for {num_samples} samples')
