#!/usr/bin/env python3
"""
PubChem Compound Search Utility

This script provides functions for searching and retrieving compound information
from PubChem using the PubChemPy library.
"""

import sys
import json
from typing import List, Dict, Optional, Union

try:
    import pubchempy as pcp
except ImportError:
    print("Error: pubchempy is not installed. Install it with: pip install pubchempy")
    sys.exit(1)


def search_by_name(name: str, max_results: int = 10) -> List[pcp.Compound]:
    """
    Search for compounds by name.

    Args:
        name: Chemical name to search for
        max_results: Maximum number of results to return

    Returns:
        List of Compound objects
    """
    try:
        compounds = pcp.get_compounds(name, 'name')
        return compounds[:max_results]
    except Exception as e:
        print(f"Error searching for '{name}': {e}")
        return []


def search_by_smiles(smiles: str) -> Optional[pcp.Compound]:
    """
    Search for a compound by SMILES string.

    Args:
        smiles: SMILES string

    Returns:
        Compound object or None if not found
    """
    try:
        compounds = pcp.get_compounds(smiles, 'smiles')
        return compounds[0] if compounds else None
    except Exception as e:
        print(f"Error searching for SMILES '{smiles}': {e}")
        return None


def get_compound_by_cid(cid: int) -> Optional[pcp.Compound]:
    """
    Retrieve a compound by its CID (Compound ID).

    Args:
        cid: PubChem Compound ID

    Returns:
        Compound object or None if not found
    """
    try:
        return pcp.Compound.from_cid(cid)
    except Exception as e:
        print(f"Error retrieving CID {cid}: {e}")
        return None


def get_compound_properties(
    identifier: Union[str, int],
    namespace: str = 'name',
    properties: Optional[List[str]] = None
) -> Dict:
    """
    Get specific properties for a compound.

    Args:
        identifier: Compound identifier (name, SMILES, CID, etc.)
        namespace: Type of identifier ('name', 'smiles', 'cid', 'inchi', etc.)
        properties: List of properties to retrieve. If None, returns common properties.

    Returns:
        Dictionary of properties
    """
    if properties is None:
        properties = [
            'MolecularFormula',
            'MolecularWeight',
            'CanonicalSMILES',
            'IUPACName',
            'XLogP',
            'TPSA',
            'HBondDonorCount',
            'HBondAcceptorCount'
        ]

    try:
        result = pcp.get_properties(properties, identifier, namespace)
        return result[0] if result else {}
    except Exception as e:
        print(f"Error getting properties for '{identifier}': {e}")
        return {}


def similarity_search(
    smiles: str,
    threshold: int = 90,
    max_records: int = 10
) -> List[pcp.Compound]:
    """
    Perform similarity search for compounds similar to the query structure.

    Args:
        smiles: Query SMILES string
        threshold: Similarity threshold (0-100)
        max_records: Maximum number of results

    Returns:
        List of similar Compound objects
    """
    try:
        compounds = pcp.get_compounds(
            smiles,
            'smiles',
            searchtype='similarity',
            Threshold=threshold,
            MaxRecords=max_records
        )
        return compounds
    except Exception as e:
        print(f"Error in similarity search: {e}")
        return []


def substructure_search(
    smiles: str,
    max_records: int = 100
) -> List[pcp.Compound]:
    """
    Perform substructure search for compounds containing the query structure.

    Args:
        smiles: Query SMILES string (substructure)
        max_records: Maximum number of results

    Returns:
        List of Compound objects containing the substructure
    """
    try:
        compounds = pcp.get_compounds(
            smiles,
            'smiles',
            searchtype='substructure',
            MaxRecords=max_records
        )
        return compounds
    except Exception as e:
        print(f"Error in substructure search: {e}")
        return []


def get_synonyms(identifier: Union[str, int], namespace: str = 'name') -> List[str]:
    """
    Get all synonyms for a compound.

    Args:
        identifier: Compound identifier
        namespace: Type of identifier

    Returns:
        List of synonym strings
    """
    try:
        results = pcp.get_synonyms(identifier, namespace)
        if results:
            return results[0].get('Synonym', [])
        return []
    except Exception as e:
        print(f"Error getting synonyms: {e}")
        return []


def batch_search(
    identifiers: List[str],
    namespace: str = 'name',
    properties: Optional[List[str]] = None
) -> List[Dict]:
    """
    Batch search for multiple compounds.

    Args:
        identifiers: List of compound identifiers
        namespace: Type of identifiers
        properties: List of properties to retrieve

    Returns:
        List of dictionaries containing properties for each compound
    """
    results = []
    for identifier in identifiers:
        props = get_compound_properties(identifier, namespace, properties)
        if props:
            props['query'] = identifier
            results.append(props)
    return results


def download_structure(
    identifier: Union[str, int],
    namespace: str = 'name',
    format: str = 'SDF',
    filename: Optional[str] = None
) -> Optional[str]:
    """
    Download compound structure in specified format.

    Args:
        identifier: Compound identifier
        namespace: Type of identifier
        format: Output format ('SDF', 'JSON', 'PNG', etc.)
        filename: Output filename (if None, returns data as string)

    Returns:
        Data string if filename is None, else None
    """
    try:
        if filename:
            pcp.download(format, identifier, namespace, filename, overwrite=True)
            return None
        else:
            return pcp.download(format, identifier, namespace)
    except Exception as e:
        print(f"Error downloading structure: {e}")
        return None


def print_compound_info(compound: pcp.Compound) -> None:
    """
    Print formatted compound information.

    Args:
        compound: PubChemPy Compound object
    """
    print(f"\n{'='*60}")
    print(f"Compound CID: {compound.cid}")
    print(f"{'='*60}")
    print(f"IUPAC Name: {compound.iupac_name or 'N/A'}")
    print(f"Molecular Formula: {compound.molecular_formula or 'N/A'}")
    print(f"Molecular Weight: {compound.molecular_weight or 'N/A'} g/mol")
    print(f"Canonical SMILES: {compound.canonical_smiles or 'N/A'}")
    print(f"InChI: {compound.inchi or 'N/A'}")
    print(f"InChI Key: {compound.inchikey or 'N/A'}")
    print(f"XLogP: {compound.xlogp or 'N/A'}")
    print(f"TPSA: {compound.tpsa or 'N/A'} Ų")
    print(f"H-Bond Donors: {compound.h_bond_donor_count or 'N/A'}")
    print(f"H-Bond Acceptors: {compound.h_bond_acceptor_count or 'N/A'}")
    print(f"{'='*60}\n")


def main():
    """Example usage of PubChem search functions."""

    # Example 1: Search by name
    print("Example 1: Searching for 'aspirin'...")
    compounds = search_by_name('aspirin', max_results=1)
    if compounds:
        print_compound_info(compounds[0])

    # Example 2: Get properties
    print("\nExample 2: Getting properties for caffeine...")
    props = get_compound_properties('caffeine', 'name')
    print(json.dumps(props, indent=2))

    # Example 3: Similarity search
    print("\nExample 3: Finding compounds similar to benzene...")
    benzene_smiles = 'c1ccccc1'
    similar = similarity_search(benzene_smiles, threshold=95, max_records=5)
    print(f"Found {len(similar)} similar compounds:")
    for comp in similar:
        print(f"  CID {comp.cid}: {comp.iupac_name or 'N/A'}")

    # Example 4: Batch search
    print("\nExample 4: Batch search for multiple compounds...")
    names = ['aspirin', 'ibuprofen', 'paracetamol']
    results = batch_search(names, properties=['MolecularFormula', 'MolecularWeight'])
    for result in results:
        print(f"  {result.get('query')}: {result.get('MolecularFormula')} "
              f"({result.get('MolecularWeight')} g/mol)")


if __name__ == '__main__':
    main()
