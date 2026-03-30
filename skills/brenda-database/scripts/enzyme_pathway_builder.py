"""
Enzyme Pathway Builder for Retrosynthetic Analysis

This module provides tools for constructing enzymatic pathways and
retrosynthetic trees using BRENDA database information.

Key features:
- Find enzymatic pathways for target products
- Build retrosynthetic trees from products
- Suggest enzyme substitutions and alternatives
- Calculate pathway feasibility and thermodynamics
- Optimize pathway conditions (pH, temperature, cofactors)
- Generate detailed pathway reports
- Support for metabolic engineering and synthetic biology

Installation:
    uv pip install networkx matplotlib pandas

Usage:
    from scripts.enzyme_pathway_builder import find_pathway_for_product, build_retrosynthetic_tree

    pathway = find_pathway_for_product("lactate", max_steps=3)
    tree = build_retrosynthetic_tree("lactate", depth=2)
"""

import re
import json
import time
from typing import List, Dict, Any, Optional, Set, Tuple
from pathlib import Path

try:
    import networkx as nx
    NETWORKX_AVAILABLE = True
except ImportError:
    print("Warning: networkx not installed. Install with: uv pip install networkx")
    NETWORKX_AVAILABLE = False

try:
    import pandas as pd
    PANDAS_AVAILABLE = True
except ImportError:
    print("Warning: pandas not installed. Install with: uv pip install pandas")
    PANDAS_AVAILABLE = False

try:
    import matplotlib.pyplot as plt
    MATPLOTLIB_AVAILABLE = True
except ImportError:
    print("Warning: matplotlib not installed. Install with: uv pip install matplotlib")
    MATPLOTLIB_AVAILABLE = False

try:
    from brenda_queries import (
        search_enzymes_by_product, search_enzymes_by_substrate,
        get_environmental_parameters, compare_across_organisms,
        get_substrate_specificity, get_cofactor_requirements,
        find_thermophilic_homologs, find_ph_stable_variants
    )
    BRENDA_QUERIES_AVAILABLE = True
except ImportError:
    print("Warning: brenda_queries not available")
    BRENDA_QUERIES_AVAILABLE = False


def validate_dependencies():
    """Validate that required dependencies are installed."""
    missing = []
    if not NETWORKX_AVAILABLE:
        missing.append("networkx")
    if not PANDAS_AVAILABLE:
        missing.append("pandas")
    if not BRENDA_QUERIES_AVAILABLE:
        missing.append("brenda_queries")
    if missing:
        raise ImportError(f"Missing required dependencies: {', '.join(missing)}")


# Common biochemical transformations with typical EC numbers
COMMON_TRANSFORMATIONS = {
    'oxidation': ['1.1.1'],      # Alcohol dehydrogenases
    'reduction': ['1.1.1'],      # Alcohol dehydrogenases
    'hydrolysis': ['3.1.1', '3.1.3'],  # Esterases, phosphatases
    'carboxylation': ['6.4.1'],   # Carboxylases
    'decarboxylation': ['4.1.1'], # Decarboxylases
    'transamination': ['2.6.1'],  # Aminotransferases
    'phosphorylation': ['2.7.1'], # Kinases
    'dephosphorylation': ['3.1.3'], # Phosphatases
    'isomerization': ['5.1.1', '5.3.1'], # Isomerases
    'ligation': ['6.3.1'],       # Ligases
    'transfer': ['2.1.1', '2.2.1', '2.4.1'], # Transferases
    'hydride_transfer': ['1.1.1', '1.2.1'],  # Oxidoreductases
    'group_transfer': ['2.1.1'],  # Methyltransferases
}

# Simple metabolite database (expanded for pathway building)
METABOLITE_DATABASE = {
    # Primary metabolites
    'glucose': {'formula': 'C6H12O6', 'mw': 180.16, 'class': 'sugar'},
    'fructose': {'formula': 'C6H12O6', 'mw': 180.16, 'class': 'sugar'},
    'galactose': {'formula': 'C6H12O6', 'mw': 180.16, 'class': 'sugar'},
    'pyruvate': {'formula': 'C3H4O3', 'mw': 90.08, 'class': 'carboxylic_acid'},
    'lactate': {'formula': 'C3H6O3', 'mw': 90.08, 'class': 'carboxylic_acid'},
    'acetate': {'formula': 'C2H4O2', 'mw': 60.05, 'class': 'carboxylic_acid'},
    'ethanol': {'formula': 'C2H6O', 'mw': 46.07, 'class': 'alcohol'},
    'acetaldehyde': {'formula': 'C2H4O', 'mw': 44.05, 'class': 'aldehyde'},
    'acetone': {'formula': 'C3H6O', 'mw': 58.08, 'class': 'ketone'},
    'glycerol': {'formula': 'C3H8O3', 'mw': 92.09, 'class': 'alcohol'},
    'ammonia': {'formula': 'NH3', 'mw': 17.03, 'class': 'inorganic'},
    'carbon dioxide': {'formula': 'CO2', 'mw': 44.01, 'class': 'inorganic'},
    'water': {'formula': 'H2O', 'mw': 18.02, 'class': 'inorganic'},
    'oxygen': {'formula': 'O2', 'mw': 32.00, 'class': 'inorganic'},
    'hydrogen': {'formula': 'H2', 'mw': 2.02, 'class': 'inorganic'},
    'nitrogen': {'formula': 'N2', 'mw': 28.01, 'class': 'inorganic'},
    'phosphate': {'formula': 'PO4', 'mw': 94.97, 'class': 'inorganic'},
    'sulfate': {'formula': 'SO4', 'mw': 96.06, 'class': 'inorganic'},

    # Amino acids
    'alanine': {'formula': 'C3H7NO2', 'mw': 89.09, 'class': 'amino_acid'},
    'glycine': {'formula': 'C2H5NO2', 'mw': 75.07, 'class': 'amino_acid'},
    'serine': {'formula': 'C3H7NO3', 'mw': 105.09, 'class': 'amino_acid'},
    'threonine': {'formula': 'C4H9NO3', 'mw': 119.12, 'class': 'amino_acid'},
    'aspartate': {'formula': 'C4H7NO4', 'mw': 133.10, 'class': 'amino_acid'},
    'glutamate': {'formula': 'C5H9NO4', 'mw': 147.13, 'class': 'amino_acid'},
    'asparagine': {'formula': 'C4H8N2O3', 'mw': 132.12, 'class': 'amino_acid'},
    'glutamine': {'formula': 'C5H10N2O3', 'mw': 146.15, 'class': 'amino_acid'},
    'lysine': {'formula': 'C6H14N2O2', 'mw': 146.19, 'class': 'amino_acid'},
    'arginine': {'formula': 'C6H14N4O2', 'mw': 174.20, 'class': 'amino_acid'},
    'histidine': {'formula': 'C6H9N3O2', 'mw': 155.16, 'class': 'amino_acid'},
    'phenylalanine': {'formula': 'C9H11NO2', 'mw': 165.19, 'class': 'amino_acid'},
    'tyrosine': {'formula': 'C9H11NO3', 'mw': 181.19, 'class': 'amino_acid'},
    'tryptophan': {'formula': 'C11H12N2O2', 'mw': 204.23, 'class': 'amino_acid'},
    'leucine': {'formula': 'C6H13NO2', 'mw': 131.18, 'class': 'amino_acid'},
    'isoleucine': {'formula': 'C6H13NO2', 'mw': 131.18, 'class': 'amino_acid'},
    'valine': {'formula': 'C5H11NO2', 'mw': 117.15, 'class': 'amino_acid'},
    'methionine': {'formula': 'C5H11NO2S', 'mw': 149.21, 'class': 'amino_acid'},
    'cysteine': {'formula': 'C3H7NO2S', 'mw': 121.16, 'class': 'amino_acid'},
    'proline': {'formula': 'C5H9NO2', 'mw': 115.13, 'class': 'amino_acid'},

    # Nucleotides (simplified)
    'atp': {'formula': 'C10H16N5O13P3', 'mw': 507.18, 'class': 'nucleotide'},
    'adp': {'formula': 'C10H15N5O10P2', 'mw': 427.20, 'class': 'nucleotide'},
    'amp': {'formula': 'C10H14N5O7P', 'mw': 347.22, 'class': 'nucleotide'},
    'nad': {'formula': 'C21H27N7O14P2', 'mw': 663.43, 'class': 'cofactor'},
    'nadh': {'formula': 'C21H29N7O14P2', 'mw': 665.44, 'class': 'cofactor'},
    'nadp': {'formula': 'C21H28N7O17P3', 'mw': 743.44, 'class': 'cofactor'},
    'nadph': {'formula': 'C21H30N7O17P3', 'mw': 745.45, 'class': 'cofactor'},
    'fadh2': {'formula': 'C21H30N7O14P2', 'mw': 785.55, 'class': 'cofactor'},
    'fadx': {'formula': 'C21H20N4O2', 'mw': 350.36, 'class': 'cofactor'},

    # Common organic acids
    'malate': {'formula': 'C4H6O5', 'mw': 134.09, 'class': 'carboxylic_acid'},
    'oxaloacetate': {'formula': 'C4H4O5', 'mw': 132.07, 'class': 'carboxylic_acid'},
    'succinate': {'formula': 'C4H6O4', 'mw': 118.09, 'class': 'carboxylic_acid'},
    'fumarate': {'formula': 'C4H4O4', 'mw': 116.07, 'class': 'carboxylic_acid'},
    'oxalosuccinate': {'formula': 'C6H6O7', 'mw': 190.12, 'class': 'carboxylic_acid'},
    'alpha-ketoglutarate': {'formula': 'C5H6O5', 'mw': 146.11, 'class': 'carboxylic_acid'},

    # Energy carriers
    'acetyl-coa': {'formula': 'C23H38N7O17P3S', 'mw': 809.51, 'class': 'cofactor'},
    'coenzyme-a': {'formula': 'C21H36N7O16P3S', 'mw': 767.54, 'class': 'cofactor'},
}

# Common cofactors and their roles
COFACTOR_ROLES = {
    'nad+': {'role': 'oxidation', 'oxidation_state': '+1'},
    'nadh': {'role': 'reduction', 'oxidation_state': '0'},
    'nadp+': {'role': 'oxidation', 'oxidation_state': '+1'},
    'nadph': {'role': 'reduction', 'oxidation_state': '0'},
    'fadx': {'role': 'oxidation', 'oxidation_state': '0'},
    'fadh2': {'role': 'reduction', 'oxidation_state': '-2'},
    'atp': {'role': 'phosphorylation', 'oxidation_state': '0'},
    'adp': {'role': 'energy', 'oxidation_state': '0'},
    'amp': {'role': 'energy', 'oxidation_state': '0'},
    'acetyl-coa': {'role': 'acetylation', 'oxidation_state': '0'},
    'coenzyme-a': {'role': 'thiolation', 'oxidation_state': '0'},
}


def identify_metabolite(metabolite_name: str) -> Dict[str, Any]:
    """Identify a metabolite from the database or create entry."""
    metabolite_name = metabolite_name.lower().strip()

    # Check if it's in the database
    if metabolite_name in METABOLITE_DATABASE:
        return {'name': metabolite_name, **METABOLITE_DATABASE[metabolite_name]}

    # Simple formula extraction from common patterns
    formula_patterns = {
        r'c(\d+)h(\d+)o(\d+)': lambda m: f"C{m[0]}H{m[1]}O{m[2]}",
        r'c(\d+)h(\d+)n(\d+)o(\d+)': lambda m: f"C{m[0]}H{m[1]}N{m[2]}O{m[3]}",
    }

    for pattern, formatter in formula_patterns.items():
        match = re.search(pattern, metabolite_name)
        if match:
            formula = formatter(match.groups())
            # Estimate molecular weight (C=12, H=1, N=14, O=16)
            mw = 0
            elements = re.findall(r'([A-Z])(\d*)', formula)
            for elem, count in elements:
                count = int(count) if count else 1
                if elem == 'C':
                    mw += count * 12.01
                elif elem == 'H':
                    mw += count * 1.008
                elif elem == 'N':
                    mw += count * 14.01
                elif elem == 'O':
                    mw += count * 16.00
                elif elem == 'P':
                    mw += count * 30.97
                elif elem == 'S':
                    mw += count * 32.07

            return {
                'name': metabolite_name,
                'formula': formula,
                'mw': mw,
                'class': 'unknown'
            }

    # Fallback - unknown metabolite
    return {
        'name': metabolite_name,
        'formula': 'Unknown',
        'mw': 0,
        'class': 'unknown'
    }


def infer_transformation_type(substrate: str, product: str) -> List[str]:
    """Infer the type of transformation based on substrate and product."""
    substrate_info = identify_metabolite(substrate)
    product_info = identify_metabolite(product)

    transformations = []

    # Check for oxidation/reduction patterns
    if 'alcohol' in substrate_info.get('class', '') and 'carboxylic_acid' in product_info.get('class', ''):
        transformations.append('oxidation')
    elif 'aldehyde' in substrate_info.get('class', '') and 'alcohol' in product_info.get('class', ''):
        transformations.append('reduction')
    elif 'alcohol' in substrate_info.get('class', '') and 'aldehyde' in product_info.get('class', ''):
        transformations.append('oxidation')

    # Check for phosphorylation/dephosphorylation
    if 'phosphate' in product and 'phosphate' not in substrate:
        transformations.append('phosphorylation')
    elif 'phosphate' in substrate and 'phosphate' not in product:
        transformations.append('dephosphorylation')

    # Check for carboxylation/decarboxylation
    if 'co2' in product and 'co2' not in substrate:
        transformations.append('carboxylation')
    elif 'co2' in substrate and 'co2' not in product:
        transformations.append('decarboxylation')

    # Check for hydrolysis (simple heuristic)
    if 'ester' in substrate.lower() and ('carboxylic_acid' in product_info.get('class', '') or 'alcohol' in product_info.get('class', '')):
        transformations.append('hydrolysis')

    # Check for transamination
    if 'amino_acid' in product_info.get('class', '') and 'amino_acid' not in substrate_info.get('class', ''):
        transformations.append('transamination')

    # Default to generic transformation
    if not transformations:
        transformations.append('generic')

    return transformations


def find_enzymes_for_transformation(substrate: str, product: str, limit: int = 10) -> List[Dict[str, Any]]:
    """Find enzymes that catalyze a specific transformation."""
    validate_dependencies()

    # Infer transformation types
    transformations = infer_transformation_type(substrate, product)

    all_enzymes = []

    # Try to find enzymes by product
    try:
        product_enzymes = search_enzymes_by_product(product, limit=limit)
        for enzyme in product_enzymes:
            # Check if substrate is in the reactants
            if substrate.lower() in enzyme.get('reaction', '').lower():
                enzyme['transformation'] = transformations[0] if transformations else 'generic'
                enzyme['substrate'] = substrate
                enzyme['product'] = product
                enzyme['confidence'] = 'high'
                all_enzymes.append(enzyme)
        time.sleep(0.5)  # Rate limiting
    except Exception as e:
        print(f"Error searching enzymes by product: {e}")

    # Try to find enzymes by substrate
    try:
        substrate_enzymes = search_enzymes_by_substrate(substrate, limit=limit)
        for enzyme in substrate_enzymes:
            # Check if product is mentioned in substrate data (limited approach)
            enzyme['transformation'] = transformations[0] if transformations else 'generic'
            enzyme['substrate'] = substrate
            enzyme['product'] = product
            enzyme['confidence'] = 'medium'
            all_enzymes.append(enzyme)
        time.sleep(0.5)  # Rate limiting
    except Exception as e:
        print(f"Error searching enzymes by substrate: {e}")

    # If no enzymes found, try common EC numbers for transformation types
    if not all_enzymes and transformations:
        for trans_type in transformations:
            if trans_type in COMMON_TRANSFORMATIONS:
                for ec_prefix in COMMON_TRANSFORMATIONS[trans_type]:
                    # This is a simplified approach - in practice you'd want
                    # to query the specific EC numbers with more detail
                    try:
                        generic_enzymes = search_by_pattern(trans_type, limit=5)
                        for enzyme in generic_enzymes:
                            enzyme['transformation'] = trans_type
                            enzyme['substrate'] = substrate
                            enzyme['product'] = product
                            enzyme['confidence'] = 'low'
                            all_enzymes.append(enzyme)
                        time.sleep(0.5)
                        break
                    except Exception as e:
                        print(f"Error searching for transformation type {trans_type}: {e}")

    # Remove duplicates and sort by confidence
    unique_enzymes = []
    seen = set()
    for enzyme in all_enzymes:
        key = (enzyme.get('ec_number', ''), enzyme.get('organism', ''))
        if key not in seen:
            seen.add(key)
            unique_enzymes.append(enzyme)

    # Sort by confidence (high > medium > low)
    confidence_order = {'high': 3, 'medium': 2, 'low': 1}
    unique_enzymes.sort(key=lambda x: confidence_order.get(x.get('confidence', 'low'), 0), reverse=True)

    return unique_enzymes[:limit]


def find_pathway_for_product(product: str, max_steps: int = 3, starting_materials: List[str] = None) -> Dict[str, Any]:
    """Find enzymatic pathways to synthesize a target product."""
    validate_dependencies()

    if starting_materials is None:
        # Common starting materials
        starting_materials = ['glucose', 'pyruvate', 'acetate', 'ethanol', 'glycerol']

    pathway = {
        'target': product,
        'max_steps': max_steps,
        'starting_materials': starting_materials,
        'steps': [],
        'alternative_pathways': [],
        'warnings': [],
        'confidence': 0
    }

    # Simple breadth-first search for pathway
    from collections import deque

    queue = deque([(product, 0, [product])])  # (current_metabolite, step_count, pathway)
    visited = set()

    while queue and len(pathway['steps']) == 0:
        current_metabolite, step_count, current_path = queue.popleft()

        if current_metabolite in visited or step_count >= max_steps:
            continue

        visited.add(current_metabolite)

        # Check if current metabolite is a starting material
        if current_metabolite.lower() in [sm.lower() for sm in starting_materials]:
            # Found a complete pathway
            pathway['steps'] = []
            for i in range(len(current_path) - 1):
                substrate = current_path[i + 1]
                product_step = current_path[i]
                enzymes = find_enzymes_for_transformation(substrate, product_step, limit=5)

                if enzymes:
                    pathway['steps'].append({
                        'step_number': i + 1,
                        'substrate': substrate,
                        'product': product_step,
                        'enzymes': enzymes,
                        'transformation': infer_transformation_type(substrate, product_step)
                    })
                else:
                    pathway['warnings'].append(f"No enzymes found for step: {substrate} -> {product_step}")

            pathway['confidence'] = 0.8  # High confidence for found pathway
            break

        # Try to find enzymes that produce current metabolite
        if step_count < max_steps:
            # Generate possible substrates (simplified - in practice you'd need metabolic knowledge)
            possible_substrates = []

            # Try common metabolic precursors
            common_precursors = ['glucose', 'pyruvate', 'acetate', 'ethanol', 'acetyl-CoA', 'oxaloacetate']
            for precursor in common_precursors:
                enzymes = find_enzymes_for_transformation(precursor, current_metabolite, limit=2)
                if enzymes:
                    possible_substrates.append(precursor)
                    pathway['alternative_pathways'].append({
                        'precursor': precursor,
                        'product': current_metabolite,
                        'enzymes': enzymes
                    })

            # Add found substrates to queue
            for substrate in possible_substrates:
                if substrate not in current_path:
                    new_path = [substrate] + current_path
                    queue.append((substrate, step_count + 1, new_path))

        time.sleep(0.2)  # Rate limiting

    # If no complete pathway found, create partial pathway
    if not pathway['steps'] and pathway['alternative_pathways']:
        # Create best guess pathway from alternatives
        best_alternative = max(pathway['alternative_pathways'],
                               key=lambda x: len(x.get('enzymes', [])))
        pathway['steps'] = [{
            'step_number': 1,
            'substrate': best_alternative['precursor'],
            'product': best_alternative['product'],
            'enzymes': best_alternative['enzymes'],
            'transformation': infer_transformation_type(best_alternative['precursor'], best_alternative['product'])
        }]
        pathway['confidence'] = 0.3  # Low confidence for partial pathway
        pathway['warnings'].append("Partial pathway only - complete synthesis route not found")

    elif not pathway['steps']:
        pathway['warnings'].append("No enzymatic pathway found for target product")
        pathway['confidence'] = 0.1

    return pathway


def build_retrosynthetic_tree(target: str, depth: int = 2) -> Dict[str, Any]:
    """Build a retrosynthetic tree for a target molecule."""
    validate_dependencies()

    tree = {
        'target': target,
        'depth': depth,
        'nodes': {target: {'level': 0, 'children': [], 'enzymes': []}},
        'edges': [],
        'alternative_routes': []
    }

    # Build tree recursively
    def build_node_recursive(metabolite: str, current_depth: int, parent: str = None) -> None:
        if current_depth >= depth:
            return

        # Find enzymes that can produce this metabolite
        potential_precursors = ['glucose', 'pyruvate', 'acetate', 'ethanol', 'acetyl-CoA',
                                'oxaloacetate', 'alpha-ketoglutarate', 'malate']

        for precursor in potential_precursors:
            enzymes = find_enzymes_for_transformation(precursor, metabolite, limit=3)

            if enzymes:
                # Add precursor as node if not exists
                if precursor not in tree['nodes']:
                    tree['nodes'][precursor] = {
                        'level': current_depth + 1,
                        'children': [],
                        'enzymes': enzymes
                    }
                    tree['nodes'][metabolite]['children'].append(precursor)
                    tree['edges'].append({
                        'from': precursor,
                        'to': metabolite,
                        'enzymes': enzymes,
                        'transformation': infer_transformation_type(precursor, metabolite)
                    })

                # Recursively build tree
                if current_depth + 1 < depth:
                    build_node_recursive(precursor, current_depth + 1, metabolite)

        # Try common metabolic transformations
        if current_depth < depth - 1:
            transformations = ['oxidation', 'reduction', 'hydrolysis', 'carboxylation', 'decarboxylation']
            for trans in transformations:
                try:
                    generic_enzymes = search_by_pattern(trans, limit=2)
                    if generic_enzymes:
                        # Create hypothetical precursor
                        hypothetical_precursor = f"precursor_{trans}_{metabolite}"
                        tree['nodes'][hypothetical_precursor] = {
                            'level': current_depth + 1,
                            'children': [],
                            'enzymes': generic_enzymes,
                            'hypothetical': True
                        }
                        tree['nodes'][metabolite]['children'].append(hypothetical_precursor)
                        tree['edges'].append({
                            'from': hypothetical_precursor,
                            'to': metabolite,
                            'enzymes': generic_enzymes,
                            'transformation': trans,
                            'hypothetical': True
                        })
                except Exception as e:
                    print(f"Error in retrosynthetic search for {trans}: {e}")

        time.sleep(0.3)  # Rate limiting

    # Start building from target
    build_node_recursive(target, 0)

    # Calculate tree statistics
    tree['total_nodes'] = len(tree['nodes'])
    tree['total_edges'] = len(tree['edges'])
    tree['max_depth'] = max(node['level'] for node in tree['nodes'].values()) if tree['nodes'] else 0

    return tree


def suggest_enzyme_substitutions(ec_number: str, criteria: Dict[str, Any] = None) -> List[Dict[str, Any]]:
    """Suggest alternative enzymes with improved properties."""
    validate_dependencies()

    if criteria is None:
        criteria = {
            'min_temperature': 30,
            'max_temperature': 70,
            'min_ph': 6.0,
            'max_ph': 8.0,
            'min_thermostability': 40,
            'prefer_organisms': ['Escherichia coli', 'Saccharomyces cerevisiae', 'Bacillus subtilis']
        }

    substitutions = []

    # Get organisms for the target enzyme
    try:
        organisms = compare_across_organisms(ec_number, criteria['prefer_organisms'])
        time.sleep(0.5)
    except Exception as e:
        print(f"Error comparing organisms: {e}")
        organisms = []

    # Find thermophilic homologs if temperature is a criterion
    if criteria.get('min_thermostability'):
        try:
            thermophilic = find_thermophilic_homologs(ec_number, criteria['min_thermostability'])
            time.sleep(0.5)

            for enzyme in thermophilic:
                enzyme['substitution_reason'] = f"Thermostable (optimal temp: {enzyme['optimal_temperature']}°C)"
                enzyme['score'] = 8.0 if enzyme['optimal_temperature'] >= criteria['min_thermostability'] else 6.0
                substitutions.append(enzyme)
        except Exception as e:
            print(f"Error finding thermophilic homologs: {e}")

    # Find pH-stable variants
    if criteria.get('min_ph') or criteria.get('max_ph'):
        try:
            ph_stable = find_ph_stable_variants(ec_number, criteria.get('min_ph'), criteria.get('max_ph'))
            time.sleep(0.5)

            for enzyme in ph_stable:
                enzyme['substitution_reason'] = f"pH stable ({enzyme['stability_type']} range: {enzyme['ph_range']})"
                enzyme['score'] = 7.5
                substitutions.append(enzyme)
        except Exception as e:
            print(f"Error finding pH-stable variants: {e}")

    # Add organism comparison results
    for org_data in organisms:
        if org_data.get('data_points', 0) > 0:
            org_data['substitution_reason'] = f"Well-characterized in {org_data['organism']}"
            org_data['score'] = 6.5 if org_data['organism'] in criteria['prefer_organisms'] else 5.0
            substitutions.append(org_data)

    # Sort by score
    substitutions.sort(key=lambda x: x.get('score', 0), reverse=True)

    return substitutions[:10]  # Return top 10 suggestions


def calculate_pathway_feasibility(pathway: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate feasibility scores and potential issues for a pathway."""
    validate_dependencies()

    feasibility = {
        'overall_score': 0,
        'step_scores': [],
        'warnings': [],
        'recommendations': [],
        'thermodynamic_feasibility': 0,
        'enzyme_availability': 0,
        'cofactor_requirements': [],
        'optimal_conditions': {}
    }

    if not pathway.get('steps'):
        feasibility['warnings'].append("No steps in pathway")
        feasibility['overall_score'] = 0.1
        return feasibility

    total_score = 0
    step_scores = []

    for step in pathway['steps']:
        step_score = 0
        enzymes = step.get('enzymes', [])

        # Score based on number of available enzymes
        if len(enzymes) >= 3:
            step_score += 3  # Multiple enzyme options
        elif len(enzymes) >= 1:
            step_score += 2  # At least one enzyme
        else:
            step_score += 0  # No enzymes
            feasibility['warnings'].append(f"No enzymes found for step: {step['substrate']} -> {step['product']}")

        # Score based on enzyme confidence
        if enzymes:
            high_confidence = sum(1 for e in enzymes if e.get('confidence') == 'high')
            confidence_bonus = min(high_confidence, 2)  # Max 2 points for confidence
            step_score += confidence_bonus

        # Check for industrial viability
        industrial_organisms = ['Escherichia coli', 'Saccharomyces cerevisiae', 'Bacillus subtilis']
        industrial_enzymes = sum(1 for e in enzymes if e.get('organism') in industrial_organisms)
        if industrial_enzymes > 0:
            step_score += 1

        # Cap step score at 5
        step_score = min(step_score, 5)
        step_scores.append(step_score)
        total_score += step_score

        # Analyze cofactor requirements
        try:
            for enzyme in enzymes:
                ec_number = enzyme.get('ec_number', '')
                if ec_number:
                    cofactors = get_cofactor_requirements(ec_number)
                    for cofactor in cofactors:
                        if cofactor['name'] not in [c['name'] for c in feasibility['cofactor_requirements']]:
                            feasibility['cofactor_requirements'].append(cofactor)
            time.sleep(0.3)
        except Exception as e:
            print(f"Error analyzing cofactors: {e}")

    feasibility['step_scores'] = step_scores
    feasibility['enzyme_availability'] = total_score / (len(step_scores) * 5)  # Normalize to 0-1
    feasibility['overall_score'] = feasibility['enzyme_availability'] * 0.7  # Weight enzyme availability

    # Thermodynamic feasibility (simplified heuristic)
    pathway_length = len(pathway['steps'])
    if pathway_length <= 2:
        feasibility['thermodynamic_feasibility'] = 0.8  # Short pathways are often feasible
    elif pathway_length <= 4:
        feasibility['thermodynamic_feasibility'] = 0.6
    else:
        feasibility['thermodynamic_feasibility'] = 0.4  # Long pathways may have thermodynamic issues

    # Overall feasibility is weighted combination
    feasibility['overall_score'] = (
        feasibility['enzyme_availability'] * 0.6 +
        feasibility['thermodynamic_feasibility'] * 0.4
    )

    # Generate recommendations
    if feasibility['overall_score'] < 0.3:
        feasibility['warnings'].append("Low overall pathway feasibility")
        feasibility['recommendations'].append("Consider alternative starting materials or target molecules")
    elif feasibility['overall_score'] < 0.6:
        feasibility['warnings'].append("Moderate pathway feasibility")
        feasibility['recommendations'].append("Consider enzyme engineering or cofactor recycling")

    if feasibility['cofactor_requirements']:
        feasibility['recommendations'].append("Implement cofactor recycling system for: " +
                                            ", ".join([c['name'] for c in feasibility['cofactor_requirements']]))

    return feasibility


def optimize_pathway_conditions(pathway: Dict[str, Any]) -> Dict[str, Any]:
    """Suggest optimal conditions for the entire pathway."""
    validate_dependencies()

    optimization = {
        'optimal_temperature': 30.0,  # Default
        'optimal_ph': 7.0,           # Default
        'temperature_range': (20, 40),  # Default
        'ph_range': (6.5, 7.5),         # Default
        'cofactor_system': [],
        'organism_compatibility': {},
        'process_recommendations': []
    }

    temperatures = []
    phs = []
    organism_preferences = {}

    # Collect environmental data from all enzymes
    for step in pathway.get('steps', []):
        for enzyme in step.get('enzymes', []):
            ec_number = enzyme.get('ec_number', '')
            organism = enzyme.get('organism', '')

            if ec_number:
                try:
                    env_params = get_environmental_parameters(ec_number)
                    time.sleep(0.3)

                    if env_params.get('optimal_temperature'):
                        temperatures.append(env_params['optimal_temperature'])
                    if env_params.get('optimal_ph'):
                        phs.append(env_params['optimal_ph'])

                    # Track organism preferences
                    if organism not in organism_preferences:
                        organism_preferences[organism] = {
                            'temperature_optima': [],
                            'ph_optima': [],
                            'step_count': 0
                        }

                    organism_preferences[organism]['step_count'] += 1
                    if env_params.get('optimal_temperature'):
                        organism_preferences[organism]['temperature_optima'].append(env_params['optimal_temperature'])
                    if env_params.get('optimal_ph'):
                        organism_preferences[organism]['ph_optima'].append(env_params['optimal_ph'])

                except Exception as e:
                    print(f"Error getting environmental parameters for {ec_number}: {e}")

    # Calculate optimal conditions
    if temperatures:
        optimization['optimal_temperature'] = sum(temperatures) / len(temperatures)
        optimization['temperature_range'] = (min(temperatures) - 5, max(temperatures) + 5)

    if phs:
        optimization['optimal_ph'] = sum(phs) / len(phs)
        optimization['ph_range'] = (min(phs) - 0.5, max(phs) + 0.5)

    # Find best organism compatibility
    for organism, data in organism_preferences.items():
        if data['temperature_optima'] and data['ph_optima']:
            organism_preferences[organism]['avg_temp'] = sum(data['temperature_optima']) / len(data['temperature_optima'])
            organism_preferences[organism]['avg_ph'] = sum(data['ph_optima']) / len(data['ph_optima'])
            organism_preferences[organism]['compatibility_score'] = data['step_count']

    # Sort organisms by compatibility
    compatible_organisms = sorted(
        [(org, data) for org, data in organism_preferences.items() if data.get('compatibility_score', 0) > 0],
        key=lambda x: x[1]['compatibility_score'],
        reverse=True
    )

    optimization['organism_compatibility'] = dict(compatible_organisms[:5])  # Top 5 organisms

    # Generate process recommendations
    if len(optimization['organism_compatibility']) > 1:
        optimization['process_recommendations'].append("Consider multi-organism system or enzyme cocktails")

    if optimization['temperature_range'][1] - optimization['temperature_range'][0] > 30:
        optimization['process_recommendations'].append("Consider temperature gradient or staged process")

    if optimization['ph_range'][1] - optimization['ph_range'][0] > 2:
        optimization['process_recommendations'].append("Consider pH control system or buffer optimization")

    # Cofactor system optimization
    cofactor_types = {}
    for step in pathway.get('steps', []):
        for enzyme in step.get('enzymes', []):
            ec_number = enzyme.get('ec_number', '')
            if ec_number:
                try:
                    cofactors = get_cofactor_requirements(ec_number)
                    for cofactor in cofactors:
                        cofactor_type = cofactor.get('type', 'other')
                        if cofactor_type not in cofactor_types:
                            cofactor_types[cofactor_type] = []
                        if cofactor['name'] not in cofactor_types[cofactor_type]:
                            cofactor_types[cofactor_type].append(cofactor['name'])
                    time.sleep(0.3)
                except Exception as e:
                    print(f"Error getting cofactors for {ec_number}: {e}")

    optimization['cofactor_system'] = cofactor_types

    return optimization


def generate_pathway_report(pathway: Dict[str, Any], filename: str = None) -> str:
    """Generate a comprehensive pathway report."""
    validate_dependencies()

    if filename is None:
        target_name = pathway.get('target', 'pathway').replace(' ', '_').lower()
        filename = f"pathway_report_{target_name}.txt"

    # Calculate feasibility and optimization
    feasibility = calculate_pathway_feasibility(pathway)
    optimization = optimize_pathway_conditions(pathway)

    report = []
    report.append("=" * 80)
    report.append(f"ENZYMATIC PATHWAY REPORT")
    report.append("=" * 80)

    # Overview
    report.append(f"\nTARGET PRODUCT: {pathway.get('target', 'Unknown')}")
    report.append(f"PATHWAY LENGTH: {len(pathway.get('steps', []))} steps")
    report.append(f"OVERALL FEASIBILITY: {feasibility['overall_score']:.2f}/1.00")

    # Pathway steps
    if pathway.get('steps'):
        report.append("\n" + "=" * 40)
        report.append("PATHWAY STEPS")
        report.append("=" * 40)

        for i, step in enumerate(pathway['steps'], 1):
            report.append(f"\nStep {i}: {step['substrate']} -> {step['product']}")
            report.append(f"Transformation: {', '.join(step.get('transformation', ['Unknown']))}")

            if step.get('enzymes'):
                report.append(f"Available enzymes: {len(step['enzymes'])}")
                for j, enzyme in enumerate(step['enzymes'][:3], 1):  # Top 3 enzymes
                    report.append(f"  {j}. EC {enzyme.get('ec_number', 'Unknown')} - {enzyme.get('organism', 'Unknown')}")
                    report.append(f"     Confidence: {enzyme.get('confidence', 'Unknown')}")
                    if enzyme.get('reaction'):
                        report.append(f"     Reaction: {enzyme['reaction'][:100]}...")

                if len(step['enzymes']) > 3:
                    report.append(f"  ... and {len(step['enzymes']) - 3} additional enzymes")
            else:
                report.append("  No enzymes found for this step")

            if feasibility.get('step_scores') and i-1 < len(feasibility['step_scores']):
                report.append(f"Step feasibility score: {feasibility['step_scores'][i-1]}/5.0")

    # Cofactor requirements
    if feasibility.get('cofactor_requirements'):
        report.append("\n" + "=" * 40)
        report.append("COFACTOR REQUIREMENTS")
        report.append("=" * 40)

        for cofactor in feasibility['cofactor_requirements']:
            report.append(f"- {cofactor['name']} ({cofactor.get('type', 'Unknown')})")
            report.append(f"  Organism: {cofactor.get('organism', 'Unknown')}")
            report.append(f"  EC Number: {cofactor.get('ec_number', 'Unknown')}")

    # Optimal conditions
    report.append("\n" + "=" * 40)
    report.append("OPTIMAL CONDITIONS")
    report.append("=" * 40)

    report.append(f"Temperature: {optimization['optimal_temperature']:.1f}°C")
    report.append(f"pH: {optimization['optimal_ph']:.1f}")
    report.append(f"Temperature range: {optimization['temperature_range'][0]:.1f} - {optimization['temperature_range'][1]:.1f}°C")
    report.append(f"pH range: {optimization['ph_range'][0]:.1f} - {optimization['ph_range'][1]:.1f}")

    if optimization.get('organism_compatibility'):
        report.append("\nCompatible organisms (by preference):")
        for organism, data in list(optimization['organism_compatibility'].items())[:3]:
            report.append(f"- {organism} (compatibility score: {data.get('compatibility_score', 0)})")
            if data.get('avg_temp'):
                report.append(f"  Optimal temperature: {data['avg_temp']:.1f}°C")
            if data.get('avg_ph'):
                report.append(f"  Optimal pH: {data['avg_ph']:.1f}")

    # Warnings and recommendations
    if feasibility.get('warnings'):
        report.append("\n" + "=" * 40)
        report.append("WARNINGS")
        report.append("=" * 40)

        for warning in feasibility['warnings']:
            report.append(f"⚠️  {warning}")

    if feasibility.get('recommendations'):
        report.append("\n" + "=" * 40)
        report.append("RECOMMENDATIONS")
        report.append("=" * 40)

        for rec in feasibility['recommendations']:
            report.append(f"💡 {rec}")

    if optimization.get('process_recommendations'):
        for rec in optimization['process_recommendations']:
            report.append(f"🔧 {rec}")

    # Alternative pathways
    if pathway.get('alternative_pathways'):
        report.append("\n" + "=" * 40)
        report.append("ALTERNATIVE ROUTES")
        report.append("=" * 40)

        for alt in pathway['alternative_pathways'][:5]:  # Top 5 alternatives
            report.append(f"\n{alt['precursor']} -> {alt['product']}")
            report.append(f"Enzymes available: {len(alt.get('enzymes', []))}")
            for enzyme in alt.get('enzymes', [])[:2]:  # Top 2 enzymes
                report.append(f"  - {enzyme.get('ec_number', 'Unknown')} ({enzyme.get('organism', 'Unknown')})")

    # Feasibility analysis
    report.append("\n" + "=" * 40)
    report.append("FEASIBILITY ANALYSIS")
    report.append("=" * 40)

    report.append(f"Enzyme availability score: {feasibility['enzyme_availability']:.2f}/1.00")
    report.append(f"Thermodynamic feasibility: {feasibility['thermodynamic_feasibility']:.2f}/1.00")

    # Write report to file
    with open(filename, 'w') as f:
        f.write('\n'.join(report))

    print(f"Pathway report saved to {filename}")
    return filename


def visualize_pathway(pathway: Dict[str, Any], save_path: str = None) -> str:
    """Create a visual representation of the pathway."""
    validate_dependencies()

    if not NETWORKX_AVAILABLE or not MATPLOTLIB_AVAILABLE:
        print("networkx and matplotlib required for pathway visualization")
        return save_path or "pathway_visualization.png"

    try:
        # Create directed graph
        G = nx.DiGraph()

        # Add nodes and edges
        for step in pathway.get('steps', []):
            substrate = step['substrate']
            product = step['product']
            enzymes = step.get('enzymes', [])

            G.add_node(substrate, type='substrate')
            G.add_node(product, type='product')

            # Add edge with enzyme information
            edge_label = f"{len(enzymes)} enzymes"
            if enzymes:
                primary_ec = enzymes[0].get('ec_number', 'Unknown')
                edge_label += f"\nEC {primary_ec}"

            G.add_edge(substrate, product, label=edge_label)

        # Create figure
        plt.figure(figsize=(12, 8))

        # Layout
        pos = nx.spring_layout(G, k=2, iterations=50)

        # Draw nodes
        substrate_nodes = [n for n, d in G.nodes(data=True) if d.get('type') == 'substrate']
        product_nodes = [n for n, d in G.nodes(data=True) if d.get('type') == 'product']
        intermediate_nodes = [n for n in G.nodes() if n not in substrate_nodes and n not in product_nodes]

        nx.draw_networkx_nodes(G, pos, nodelist=substrate_nodes, node_color='lightblue', node_size=1500)
        nx.draw_networkx_nodes(G, pos, nodelist=product_nodes, node_color='lightgreen', node_size=1500)
        nx.draw_networkx_nodes(G, pos, nodelist=intermediate_nodes, node_color='lightyellow', node_size=1200)

        # Draw edges
        nx.draw_networkx_edges(G, pos, edge_color='gray', arrows=True, arrowsize=20)

        # Draw labels
        nx.draw_networkx_labels(G, pos, font_size=10, font_weight='bold')

        # Draw edge labels
        edge_labels = nx.get_edge_attributes(G, 'label')
        nx.draw_networkx_edge_labels(G, pos, edge_labels, font_size=8)

        # Add title
        plt.title(f"Enzymatic Pathway to {pathway.get('target', 'Target')}", fontsize=14, fontweight='bold')

        # Add legend
        plt.scatter([], [], c='lightblue', s=150, label='Starting Materials')
        plt.scatter([], [], c='lightyellow', s=120, label='Intermediates')
        plt.scatter([], [], c='lightgreen', s=150, label='Products')
        plt.legend()

        plt.axis('off')
        plt.tight_layout()

        # Save or show
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            print(f"Pathway visualization saved to {save_path}")
        else:
            plt.show()

        plt.close()
        return save_path or "pathway_visualization.png"

    except Exception as e:
        print(f"Error visualizing pathway: {e}")
        return save_path or "pathway_visualization.png"


if __name__ == "__main__":
    # Example usage
    print("Enzyme Pathway Builder Examples")
    print("=" * 50)

    try:
        # Example 1: Find pathway for lactate
        print("\n1. Finding pathway for lactate production:")
        pathway = find_pathway_for_product("lactate", max_steps=3)
        print(f"Found pathway with {len(pathway['steps'])} steps")
        print(f"Feasibility: {pathway['confidence']:.2f}")

        # Example 2: Build retrosynthetic tree
        print("\n2. Building retrosynthetic tree for ethanol:")
        tree = build_retrosynthetic_tree("ethanol", depth=2)
        print(f"Tree has {tree['total_nodes']} nodes and {tree['total_edges']} edges")

        # Example 3: Suggest enzyme substitutions
        print("\n3. Suggesting enzyme substitutions for alcohol dehydrogenase:")
        substitutions = suggest_enzyme_substitutions("1.1.1.1")
        for sub in substitutions[:3]:
            print(f"  - {sub.get('organism', 'Unknown')}: {sub.get('substitution_reason', 'No reason')}")

        # Example 4: Calculate feasibility
        print("\n4. Calculating pathway feasibility:")
        feasibility = calculate_pathway_feasibility(pathway)
        print(f"Overall score: {feasibility['overall_score']:.2f}")
        print(f"Warnings: {len(feasibility['warnings'])}")

        # Example 5: Generate pathway report
        print("\n5. Generating pathway report:")
        report_file = generate_pathway_report(pathway)
        print(f"Report saved to: {report_file}")

        # Example 6: Visualize pathway
        print("\n6. Visualizing pathway:")
        viz_file = visualize_pathway(pathway, "example_pathway.png")
        print(f"Visualization saved to: {viz_file}")

    except Exception as e:
        print(f"Example failed: {e}")