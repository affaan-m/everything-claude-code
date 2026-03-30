#!/usr/bin/env python3
"""
ChEMBL Database Query Examples

This script demonstrates common query patterns for the ChEMBL database
using the chembl_webresource_client Python library.

Requirements:
    pip install chembl_webresource_client
    pip install pandas (optional, for data manipulation)
"""

from chembl_webresource_client.new_client import new_client


def get_molecule_info(chembl_id):
    """
    Retrieve detailed information about a molecule by ChEMBL ID.

    Args:
        chembl_id: ChEMBL identifier (e.g., 'CHEMBL25')

    Returns:
        Dictionary containing molecule information
    """
    molecule = new_client.molecule
    return molecule.get(chembl_id)


def search_molecules_by_name(name_pattern):
    """
    Search for molecules by name pattern.

    Args:
        name_pattern: Name or pattern to search for

    Returns:
        List of matching molecules
    """
    molecule = new_client.molecule
    results = molecule.filter(pref_name__icontains=name_pattern)
    return list(results)


def find_molecules_by_properties(max_mw=500, min_logp=None, max_logp=None):
    """
    Find molecules based on physicochemical properties.

    Args:
        max_mw: Maximum molecular weight
        min_logp: Minimum LogP value
        max_logp: Maximum LogP value

    Returns:
        List of matching molecules
    """
    molecule = new_client.molecule

    filters = {
        'molecule_properties__mw_freebase__lte': max_mw
    }

    if min_logp is not None:
        filters['molecule_properties__alogp__gte'] = min_logp
    if max_logp is not None:
        filters['molecule_properties__alogp__lte'] = max_logp

    results = molecule.filter(**filters)
    return list(results)


def get_target_info(target_chembl_id):
    """
    Retrieve information about a biological target.

    Args:
        target_chembl_id: ChEMBL target identifier (e.g., 'CHEMBL240')

    Returns:
        Dictionary containing target information
    """
    target = new_client.target
    return target.get(target_chembl_id)


def search_targets_by_name(target_name):
    """
    Search for targets by name or keyword.

    Args:
        target_name: Target name or keyword (e.g., 'kinase', 'EGFR')

    Returns:
        List of matching targets
    """
    target = new_client.target
    results = target.filter(
        target_type='SINGLE PROTEIN',
        pref_name__icontains=target_name
    )
    return list(results)


def get_bioactivity_data(target_chembl_id, activity_type='IC50', max_value=100):
    """
    Retrieve bioactivity data for a specific target.

    Args:
        target_chembl_id: ChEMBL target identifier
        activity_type: Type of activity (IC50, Ki, EC50, etc.)
        max_value: Maximum activity value in nM

    Returns:
        List of activity records
    """
    activity = new_client.activity
    results = activity.filter(
        target_chembl_id=target_chembl_id,
        standard_type=activity_type,
        standard_value__lte=max_value,
        standard_units='nM'
    )
    return list(results)


def find_similar_compounds(smiles, similarity_threshold=85):
    """
    Find compounds similar to a query structure.

    Args:
        smiles: SMILES string of query molecule
        similarity_threshold: Minimum similarity percentage (0-100)

    Returns:
        List of similar compounds
    """
    similarity = new_client.similarity
    results = similarity.filter(
        smiles=smiles,
        similarity=similarity_threshold
    )
    return list(results)


def substructure_search(smiles):
    """
    Search for compounds containing a specific substructure.

    Args:
        smiles: SMILES string of substructure

    Returns:
        List of compounds containing the substructure
    """
    substructure = new_client.substructure
    results = substructure.filter(smiles=smiles)
    return list(results)


def get_drug_info(molecule_chembl_id):
    """
    Retrieve drug information including indications and mechanisms.

    Args:
        molecule_chembl_id: ChEMBL molecule identifier

    Returns:
        Tuple of (drug_info, mechanisms, indications)
    """
    drug = new_client.drug
    mechanism = new_client.mechanism
    drug_indication = new_client.drug_indication

    try:
        drug_info = drug.get(molecule_chembl_id)
    except:
        drug_info = None

    mechanisms = list(mechanism.filter(molecule_chembl_id=molecule_chembl_id))
    indications = list(drug_indication.filter(molecule_chembl_id=molecule_chembl_id))

    return drug_info, mechanisms, indications


def find_kinase_inhibitors(max_ic50=100):
    """
    Find potent kinase inhibitors.

    Args:
        max_ic50: Maximum IC50 value in nM

    Returns:
        List of kinase inhibitor activities
    """
    target = new_client.target
    activity = new_client.activity

    # Find kinase targets
    kinase_targets = target.filter(
        target_type='SINGLE PROTEIN',
        pref_name__icontains='kinase'
    )

    # Get target IDs
    target_ids = [t['target_chembl_id'] for t in kinase_targets[:10]]  # Limit to first 10

    # Find activities
    results = activity.filter(
        target_chembl_id__in=target_ids,
        standard_type='IC50',
        standard_value__lte=max_ic50,
        standard_units='nM'
    )

    return list(results)


def get_compound_bioactivities(molecule_chembl_id):
    """
    Get all bioactivity data for a specific compound.

    Args:
        molecule_chembl_id: ChEMBL molecule identifier

    Returns:
        List of all activity records for the compound
    """
    activity = new_client.activity
    results = activity.filter(
        molecule_chembl_id=molecule_chembl_id,
        pchembl_value__isnull=False
    )
    return list(results)


def export_to_dataframe(data):
    """
    Convert ChEMBL data to pandas DataFrame (requires pandas).

    Args:
        data: List of ChEMBL records

    Returns:
        pandas DataFrame
    """
    try:
        import pandas as pd
        return pd.DataFrame(data)
    except ImportError:
        print("pandas not installed. Install with: pip install pandas")
        return None


# Example usage
if __name__ == "__main__":
    print("ChEMBL Database Query Examples")
    print("=" * 50)

    # Example 1: Get information about aspirin
    print("\n1. Getting information about aspirin (CHEMBL25)...")
    aspirin = get_molecule_info('CHEMBL25')
    print(f"Name: {aspirin.get('pref_name')}")
    print(f"Formula: {aspirin.get('molecule_properties', {}).get('full_molformula')}")

    # Example 2: Search for EGFR inhibitors
    print("\n2. Searching for EGFR targets...")
    egfr_targets = search_targets_by_name('EGFR')
    if egfr_targets:
        print(f"Found {len(egfr_targets)} EGFR-related targets")
        print(f"First target: {egfr_targets[0]['pref_name']}")

    # Example 3: Find potent activities for a target
    print("\n3. Finding potent compounds for EGFR (CHEMBL203)...")
    activities = get_bioactivity_data('CHEMBL203', 'IC50', max_value=10)
    print(f"Found {len(activities)} compounds with IC50 <= 10 nM")

    print("\n" + "=" * 50)
    print("Examples completed successfully!")
