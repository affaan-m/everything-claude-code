"""
BRENDA Database Query Utilities

This module provides high-level functions for querying and analyzing
enzyme data from the BRENDA database using the SOAP API.

Key features:
- Parse BRENDA response data entries
- Search for enzymes by substrate/product
- Compare enzyme properties across organisms
- Retrieve kinetic parameters and environmental conditions
- Analyze substrate specificity and inhibition
- Support for enzyme engineering and pathway design
- Export data in various formats

Installation:
    uv pip install zeep requests pandas

Usage:
    from scripts.brenda_queries import search_enzymes_by_substrate, compare_across_organisms

    enzymes = search_enzymes_by_substrate("glucose", limit=20)
    comparison = compare_across_organisms("1.1.1.1", ["E. coli", "S. cerevisiae"])
"""

import re
import time
import json
import csv
from typing import List, Dict, Any, Optional, Tuple
from pathlib import Path

try:
    from zeep import Client, Settings
    from zeep.exceptions import Fault, TransportError
    ZEEP_AVAILABLE = True
except ImportError:
    print("Warning: zeep not installed. Install with: uv pip install zeep")
    ZEEP_AVAILABLE = False

try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    print("Warning: requests not installed. Install with: uv pip install requests")
    REQUESTS_AVAILABLE = False

try:
    import pandas as pd
    PANDAS_AVAILABLE = True
except ImportError:
    print("Warning: pandas not installed. Install with: uv pip install pandas")
    PANDAS_AVAILABLE = False

# Import the brenda_client from the project root
import sys
sys.path.append(str(Path(__file__).parent.parent.parent.parent))

try:
    from brenda_client import get_km_values, get_reactions, call_brenda
    BRENDA_CLIENT_AVAILABLE = True
except ImportError:
    print("Warning: brenda_client not available")
    BRENDA_CLIENT_AVAILABLE = False


def validate_dependencies():
    """Validate that required dependencies are installed."""
    missing = []
    if not ZEEP_AVAILABLE:
        missing.append("zeep")
    if not REQUESTS_AVAILABLE:
        missing.append("requests")
    if not BRENDA_CLIENT_AVAILABLE:
        missing.append("brenda_client")
    if missing:
        raise ImportError(f"Missing required dependencies: {', '.join(missing)}")


def parse_km_entry(entry: str) -> Dict[str, Any]:
    """Parse a BRENDA Km value entry into structured data."""
    if not entry or not isinstance(entry, str):
        return {}

    parsed = {}
    parts = entry.split('#')

    for part in parts:
        if '*' in part:
            key, value = part.split('*', 1)
            parsed[key.strip()] = value.strip()

    # Extract numeric values from kmValue
    if 'kmValue' in parsed:
        km_value = parsed['kmValue']
        # Extract first numeric value (in mM typically)
        numeric_match = re.search(r'(\d+\.?\d*)', km_value)
        if numeric_match:
            parsed['km_value_numeric'] = float(numeric_match.group(1))

    # Extract pH from commentary
    if 'commentary' in parsed:
        commentary = parsed['commentary']
        ph_match = re.search(r'pH\s*([0-9.]+)', commentary)
        if ph_match:
            parsed['ph'] = float(ph_match.group(1))

        temp_match = re.search(r'(\d+)\s*°?C', commentary)
        if temp_match:
            parsed['temperature'] = float(temp_match.group(1))

    return parsed


def parse_reaction_entry(entry: str) -> Dict[str, Any]:
    """Parse a BRENDA reaction entry into structured data."""
    if not entry or not isinstance(entry, str):
        return {}

    parsed = {}
    parts = entry.split('#')

    for part in parts:
        if '*' in part:
            key, value = part.split('*', 1)
            parsed[key.strip()] = value.strip()

    # Parse reaction equation
    if 'reaction' in parsed:
        reaction = parsed['reaction']
        # Extract reactants and products
        if '<=>' in reaction:
            reactants, products = reaction.split('<=>', 1)
        elif '->' in reaction:
            reactants, products = reaction.split('->', 1)
        elif '=' in reaction:
            reactants, products = reaction.split('=', 1)
        else:
            reactants, products = reaction, ''

        parsed['reactants'] = [r.strip() for r in reactants.split('+')]
        parsed['products'] = [p.strip() for p in products.split('+')]

    return parsed


def extract_organism_data(entry: str) -> Dict[str, Any]:
    """Extract organism-specific information from BRENDA entry."""
    parsed = parse_km_entry(entry) if 'kmValue' in entry else parse_reaction_entry(entry)

    if 'organism' in parsed:
        return {
            'organism': parsed['organism'],
            'ec_number': parsed.get('ecNumber', ''),
            'substrate': parsed.get('substrate', ''),
            'km_value': parsed.get('kmValue', ''),
            'km_numeric': parsed.get('km_value_numeric', None),
            'ph': parsed.get('ph', None),
            'temperature': parsed.get('temperature', None),
            'commentary': parsed.get('commentary', ''),
            'literature': parsed.get('literature', '')
        }

    return {}


def search_enzymes_by_substrate(substrate: str, limit: int = 50) -> List[Dict[str, Any]]:
    """Search for enzymes that act on a specific substrate."""
    validate_dependencies()

    enzymes = []

    # Search for Km values with the substrate
    try:
        km_data = get_km_values("*", substrate=substrate)
        time.sleep(0.5)  # Rate limiting

        for entry in km_data[:limit]:
            parsed = parse_km_entry(entry)
            if parsed:
                enzymes.append({
                    'ec_number': parsed.get('ecNumber', ''),
                    'organism': parsed.get('organism', ''),
                    'substrate': parsed.get('substrate', ''),
                    'km_value': parsed.get('kmValue', ''),
                    'km_numeric': parsed.get('km_value_numeric', None),
                    'commentary': parsed.get('commentary', '')
                })
    except Exception as e:
        print(f"Error searching enzymes by substrate: {e}")

    # Remove duplicates based on EC number and organism
    unique_enzymes = []
    seen = set()
    for enzyme in enzymes:
        key = (enzyme['ec_number'], enzyme['organism'])
        if key not in seen:
            seen.add(key)
            unique_enzymes.append(enzyme)

    return unique_enzymes[:limit]


def search_enzymes_by_product(product: str, limit: int = 50) -> List[Dict[str, Any]]:
    """Search for enzymes that produce a specific product."""
    validate_dependencies()

    enzymes = []

    # Search for reactions containing the product
    try:
        # This is a simplified approach - in practice you might need
        # more sophisticated pattern matching for products
        reactions = get_reactions("*", reaction=f"*{product}*")
        time.sleep(0.5)  # Rate limiting

        for entry in reactions[:limit]:
            parsed = parse_reaction_entry(entry)
            if parsed and 'products' in parsed:
                # Check if our target product is in the products list
                if any(product.lower() in prod.lower() for prod in parsed['products']):
                    enzymes.append({
                        'ec_number': parsed.get('ecNumber', ''),
                        'organism': parsed.get('organism', ''),
                        'reaction': parsed.get('reaction', ''),
                        'reactants': parsed.get('reactants', []),
                        'products': parsed.get('products', []),
                        'commentary': parsed.get('commentary', '')
                    })
    except Exception as e:
        print(f"Error searching enzymes by product: {e}")

    return enzymes[:limit]


def compare_across_organisms(ec_number: str, organisms: List[str]) -> List[Dict[str, Any]]:
    """Compare enzyme properties across different organisms."""
    validate_dependencies()

    comparison = []

    for organism in organisms:
        try:
            # Get Km data for this organism
            km_data = get_km_values(ec_number, organism=organism)
            time.sleep(0.5)  # Rate limiting

            if km_data:
                # Calculate statistics
                numeric_kms = []
                phs = []
                temperatures = []

                for entry in km_data:
                    parsed = parse_km_entry(entry)
                    if 'km_value_numeric' in parsed:
                        numeric_kms.append(parsed['km_value_numeric'])
                    if 'ph' in parsed:
                        phs.append(parsed['ph'])
                    if 'temperature' in parsed:
                        temperatures.append(parsed['temperature'])

                org_data = {
                    'organism': organism,
                    'ec_number': ec_number,
                    'data_points': len(km_data),
                    'average_km': sum(numeric_kms) / len(numeric_kms) if numeric_kms else None,
                    'min_km': min(numeric_kms) if numeric_kms else None,
                    'max_km': max(numeric_kms) if numeric_kms else None,
                    'optimal_ph': sum(phs) / len(phs) if phs else None,
                    'optimal_temperature': sum(temperatures) / len(temperatures) if temperatures else None,
                    'temperature_range': (min(temperatures), max(temperatures)) if temperatures else None
                }

                comparison.append(org_data)
            else:
                comparison.append({
                    'organism': organism,
                    'ec_number': ec_number,
                    'data_points': 0,
                    'note': 'No data found'
                })

        except Exception as e:
            print(f"Error comparing organism {organism}: {e}")
            comparison.append({
                'organism': organism,
                'ec_number': ec_number,
                'error': str(e)
            })

    return comparison


def get_organisms_for_enzyme(ec_number: str) -> List[str]:
    """Get list of organisms that have data for a specific enzyme."""
    validate_dependencies()

    try:
        km_data = get_km_values(ec_number)
        time.sleep(0.5)  # Rate limiting

        organisms = set()
        for entry in km_data:
            parsed = parse_km_entry(entry)
            if 'organism' in parsed:
                organisms.add(parsed['organism'])

        return sorted(list(organisms))

    except Exception as e:
        print(f"Error getting organisms for enzyme {ec_number}: {e}")
        return []


def get_environmental_parameters(ec_number: str) -> Dict[str, Any]:
    """Get environmental parameters (pH, temperature) for an enzyme."""
    validate_dependencies()

    try:
        km_data = get_km_values(ec_number)
        time.sleep(0.5)  # Rate limiting

        phs = []
        temperatures = []
        ph_stabilities = []
        temp_stabilities = []

        for entry in km_data:
            parsed = parse_km_entry(entry)

            if 'ph' in parsed:
                phs.append(parsed['ph'])
            if 'temperature' in parsed:
                temperatures.append(parsed['temperature'])

            # Check commentary for stability information
            commentary = parsed.get('commentary', '').lower()
            if 'stable' in commentary and 'ph' in commentary:
                # Extract pH stability range
                ph_range_match = re.search(r'ph\s*([\d.]+)\s*[-–]\s*([\d.]+)', commentary)
                if ph_range_match:
                    ph_stabilities.append((float(ph_range_match.group(1)), float(ph_range_match.group(2))))

            if 'stable' in commentary and ('temp' in commentary or '°c' in commentary):
                # Extract temperature stability
                temp_match = re.search(r'(\d+)\s*[-–]\s*(\d+)\s*°?c', commentary)
                if temp_match:
                    temp_stabilities.append((int(temp_match.group(1)), int(temp_match.group(2))))

        params = {
            'ec_number': ec_number,
            'data_points': len(km_data),
            'ph_range': (min(phs), max(phs)) if phs else None,
            'optimal_ph': sum(phs) / len(phs) if phs else None,
            'optimal_temperature': sum(temperatures) / len(temperatures) if temperatures else None,
            'temperature_range': (min(temperatures), max(temperatures)) if temperatures else None,
            'stability_ph': ph_stabilities[0] if ph_stabilities else None,
            'temperature_stability': temp_stabilities[0] if temp_stabilities else None
        }

        return params

    except Exception as e:
        print(f"Error getting environmental parameters for {ec_number}: {e}")
        return {'ec_number': ec_number, 'error': str(e)}


def get_cofactor_requirements(ec_number: str) -> List[Dict[str, Any]]:
    """Get cofactor requirements for an enzyme from reaction data."""
    validate_dependencies()

    cofactors = []

    try:
        reactions = get_reactions(ec_number)
        time.sleep(0.5)  # Rate limiting

        for entry in reactions:
            parsed = parse_reaction_entry(entry)
            if parsed and 'reactants' in parsed:
                # Look for common cofactors in reactants
                common_cofactors = [
                    'NAD+', 'NADH', 'NADP+', 'NADPH',
                    'ATP', 'ADP', 'AMP',
                    'FAD', 'FADH2',
                    'CoA', 'acetyl-CoA',
                    'pyridoxal phosphate', 'PLP',
                    'biotin',
                    'heme', 'iron-sulfur'
                ]

                for reactant in parsed['reactants']:
                    for cofactor in common_cofactors:
                        if cofactor.lower() in reactant.lower():
                            cofactors.append({
                                'name': cofactor,
                                'full_name': reactant,
                                'type': 'oxidoreductase' if 'NAD' in cofactor else 'other',
                                'organism': parsed.get('organism', ''),
                                'ec_number': ec_number
                            })

    except Exception as e:
        print(f"Error getting cofactor requirements for {ec_number}: {e}")

    # Remove duplicates
    unique_cofactors = []
    seen = set()
    for cofactor in cofactors:
        key = (cofactor['name'], cofactor['organism'])
        if key not in seen:
            seen.add(key)
            unique_cofactors.append(cofactor)

    return unique_cofactors


def get_substrate_specificity(ec_number: str) -> List[Dict[str, Any]]:
    """Get substrate specificity data for an enzyme."""
    validate_dependencies()

    specificity = []

    try:
        km_data = get_km_values(ec_number)
        time.sleep(0.5)  # Rate limiting

        substrate_data = {}

        for entry in km_data:
            parsed = parse_km_entry(entry)
            if 'substrate' in parsed and 'km_value_numeric' in parsed:
                substrate = parsed['substrate']
                if substrate not in substrate_data:
                    substrate_data[substrate] = {
                        'name': substrate,
                        'km_values': [],
                        'organisms': set(),
                        'vmax_values': [],  # If available
                        'kcat_values': []   # If available
                    }

                substrate_data[substrate]['km_values'].append(parsed['km_value_numeric'])
                if 'organism' in parsed:
                    substrate_data[substrate]['organisms'].add(parsed['organism'])

        # Calculate summary statistics
        for substrate, data in substrate_data.items():
            if data['km_values']:
                specificity.append({
                    'name': substrate,
                    'km': sum(data['km_values']) / len(data['km_values']),
                    'min_km': min(data['km_values']),
                    'max_km': max(data['km_values']),
                    'data_points': len(data['km_values']),
                    'organisms': list(data['organisms']),
                    'vmax': sum(data['vmax_values']) / len(data['vmax_values']) if data['vmax_values'] else None,
                    'kcat': sum(data['kcat_values']) / len(data['kcat_values']) if data['kcat_values'] else None,
                    'kcat_km_ratio': None  # Would need kcat data to calculate
                })

        # Sort by Km (lower is better affinity)
        specificity.sort(key=lambda x: x['km'] if x['km'] else float('inf'))

    except Exception as e:
        print(f"Error getting substrate specificity for {ec_number}: {e}")

    return specificity


def compare_substrate_affinity(ec_number: str) -> List[Dict[str, Any]]:
    """Compare substrate affinity for an enzyme."""
    return get_substrate_specificity(ec_number)


def get_inhibitors(ec_number: str) -> List[Dict[str, Any]]:
    """Get inhibitor information for an enzyme (from commentary)."""
    validate_dependencies()

    inhibitors = []

    try:
        km_data = get_km_values(ec_number)
        time.sleep(0.5)  # Rate limiting

        for entry in km_data:
            parsed = parse_km_entry(entry)
            commentary = parsed.get('commentary', '').lower()

            # Look for inhibitor keywords
            inhibitor_keywords = ['inhibited', 'inhibition', 'blocked', 'prevented', 'reduced']
            if any(keyword in commentary for keyword in inhibitor_keywords):
                # Try to extract inhibitor names (this is approximate)
                # Common inhibitors
                common_inhibitors = [
                    'iodoacetate', 'n-ethylmaleimide', 'p-chloromercuribenzoate',
                    'heavy metals', 'mercury', 'copper', 'zinc',
                    'cyanide', 'azide', 'carbon monoxide',
                    'edta', 'egta'
                ]

                for inhibitor in common_inhibitors:
                    if inhibitor in commentary:
                        inhibitors.append({
                            'name': inhibitor,
                            'type': 'irreversible' if 'iodoacetate' in inhibitor or 'maleimide' in inhibitor else 'reversible',
                            'organism': parsed.get('organism', ''),
                            'ec_number': ec_number,
                            'commentary': parsed.get('commentary', '')
                        })

    except Exception as e:
        print(f"Error getting inhibitors for {ec_number}: {e}")

    # Remove duplicates
    unique_inhibitors = []
    seen = set()
    for inhibitor in inhibitors:
        key = (inhibitor['name'], inhibitor['organism'])
        if key not in seen:
            seen.add(key)
            unique_inhibitors.append(inhibitor)

    return unique_inhibitors


def get_activators(ec_number: str) -> List[Dict[str, Any]]:
    """Get activator information for an enzyme (from commentary)."""
    validate_dependencies()

    activators = []

    try:
        km_data = get_km_values(ec_number)
        time.sleep(0.5)  # Rate limiting

        for entry in km_data:
            parsed = parse_km_entry(entry)
            commentary = parsed.get('commentary', '').lower()

            # Look for activator keywords
            activator_keywords = ['activated', 'stimulated', 'enhanced', 'increased']
            if any(keyword in commentary for keyword in activator_keywords):
                # Try to extract activator names (this is approximate)
                common_activators = [
                    'mg2+', 'mn2+', 'ca2+', 'zn2+',
                    'k+', 'na+',
                    'phosphate', 'pyrophosphate',
                    'dithiothreitol', 'dtt',
                    'β-mercaptoethanol'
                ]

                for activator in common_activators:
                    if activator in commentary:
                        activators.append({
                            'name': activator,
                            'type': 'metal ion' if '+' in activator else 'reducing agent' if 'dtt' in activator.lower() or 'mercapto' in activator.lower() else 'other',
                            'mechanism': 'allosteric' if 'allosteric' in commentary else 'cofactor' else 'unknown',
                            'organism': parsed.get('organism', ''),
                            'ec_number': ec_number,
                            'commentary': parsed.get('commentary', '')
                        })

    except Exception as e:
        print(f"Error getting activators for {ec_number}: {e}")

    # Remove duplicates
    unique_activators = []
    seen = set()
    for activator in activators:
        key = (activator['name'], activator['organism'])
        if key not in seen:
            seen.add(key)
            unique_activators.append(activator)

    return unique_activators


def find_thermophilic_homologs(ec_number: str, min_temp: int = 50) -> List[Dict[str, Any]]:
    """Find thermophilic homologs of an enzyme."""
    validate_dependencies()

    thermophilic = []

    try:
        organisms = get_organisms_for_enzyme(ec_number)

        for organism in organisms:
            # Check if organism might be thermophilic based on name
            thermophilic_keywords = ['therm', 'hypertherm', 'pyro']
            if any(keyword in organism.lower() for keyword in thermophilic_keywords):
                # Get kinetic data to extract temperature information
                km_data = get_km_values(ec_number, organism=organism)
                time.sleep(0.2)  # Rate limiting

                temperatures = []
                kms = []

                for entry in km_data:
                    parsed = parse_km_entry(entry)
                    if 'temperature' in parsed:
                        temperatures.append(parsed['temperature'])
                    if 'km_value_numeric' in parsed:
                        kms.append(parsed['km_value_numeric'])

                if temperatures and max(temperatures) >= min_temp:
                    thermophilic.append({
                        'organism': organism,
                        'ec_number': ec_number,
                        'optimal_temperature': max(temperatures),
                        'temperature_range': (min(temperatures), max(temperatures)),
                        'km': sum(kms) / len(kms) if kms else None,
                        'data_points': len(km_data)
                    })

    except Exception as e:
        print(f"Error finding thermophilic homologs for {ec_number}: {e}")

    return thermophilic


def find_ph_stable_variants(ec_number: str, min_ph: float = 8.0, max_ph: float = 6.0) -> List[Dict[str, Any]]:
    """Find pH-stable variants of an enzyme."""
    validate_dependencies()

    ph_stable = []

    try:
        organisms = get_organisms_for_enzyme(ec_number)

        for organism in organisms:
            km_data = get_km_values(ec_number, organism=organism)
            time.sleep(0.2)  # Rate limiting

            phs = []
            kms = []

            for entry in km_data:
                parsed = parse_km_entry(entry)
                if 'ph' in parsed:
                    phs.append(parsed['ph'])
                if 'km_value_numeric' in parsed:
                    kms.append(parsed['km_value_numeric'])

            if phs:
                ph_range = (min(phs), max(phs))
                is_alkaline_stable = min_ph and ph_range[0] >= min_ph
                is_acid_stable = max_ph and ph_range[1] <= max_ph

                if is_alkaline_stable or is_acid_stable:
                    ph_stable.append({
                        'organism': organism,
                        'ec_number': ec_number,
                        'ph_range': ph_range,
                        'optimal_ph': sum(phs) / len(phs),
                        'km': sum(kms) / len(kms) if kms else None,
                        'stability_type': 'alkaline' if is_alkaline_stable else 'acidic',
                        'data_points': len(km_data)
                    })

    except Exception as e:
        print(f"Error finding pH-stable variants for {ec_number}: {e}")

    return ph_stable


def get_modeling_parameters(ec_number: str, substrate: str = None) -> Dict[str, Any]:
    """Get parameters suitable for kinetic modeling."""
    validate_dependencies()

    try:
        if substrate:
            km_data = get_km_values(ec_number, substrate=substrate)
        else:
            km_data = get_km_values(ec_number)

        time.sleep(0.5)  # Rate limiting

        if not km_data:
            return {'ec_number': ec_number, 'error': 'No kinetic data found'}

        # Extract modeling parameters
        kms = []
        phs = []
        temperatures = []
        v_max_values = []
        kcat_values = []

        for entry in km_data:
            parsed = parse_km_entry(entry)

            if 'km_value_numeric' in parsed:
                kms.append(parsed['km_value_numeric'])
            if 'ph' in parsed:
                phs.append(parsed['ph'])
            if 'temperature' in parsed:
                temperatures.append(parsed['temperature'])

            # Look for Vmax and kcat in commentary (rare in BRENDA)
            commentary = parsed.get('commentary', '').lower()
            vmax_match = re.search(r'vmax\s*=\s*([\d.]+)', commentary)
            if vmax_match:
                v_max_values.append(float(vmax_match.group(1)))

            kcat_match = re.search(r'kcat\s*=\s*([\d.]+)', commentary)
            if kcat_match:
                kcat_values.append(float(kcat_match.group(1)))

        modeling_data = {
            'ec_number': ec_number,
            'substrate': substrate if substrate else 'various',
            'km': sum(kms) / len(kms) if kms else None,
            'km_std': (sum((x - sum(kms)/len(kms))**2 for x in kms) / len(kms))**0.5 if kms else None,
            'vmax': sum(v_max_values) / len(v_max_values) if v_max_values else None,
            'kcat': sum(kcat_values) / len(kcat_values) if kcat_values else None,
            'optimal_ph': sum(phs) / len(phs) if phs else None,
            'optimal_temperature': sum(temperatures) / len(temperatures) if temperatures else None,
            'data_points': len(km_data),
            'temperature': sum(temperatures) / len(temperatures) if temperatures else 25.0,  # Default to 25°C
            'ph': sum(phs) / len(phs) if phs else 7.0,  # Default to pH 7.0
            'enzyme_conc': 1.0,  # Default enzyme concentration (μM)
            'substrate_conc': None,  # Would be set by user
        }

        return modeling_data

    except Exception as e:
        return {'ec_number': ec_number, 'error': str(e)}


def export_kinetic_data(ec_number: str, format: str = 'csv', filename: str = None) -> str:
    """Export kinetic data to file."""
    validate_dependencies()

    if not filename:
        filename = f"brenda_kinetic_data_{ec_number.replace('.', '_')}.{format}"

    try:
        # Get all kinetic data
        km_data = get_km_values(ec_number)
        time.sleep(0.5)  # Rate limiting

        if not km_data:
            print(f"No kinetic data found for EC {ec_number}")
            return filename

        # Parse all entries
        parsed_data = []
        for entry in km_data:
            parsed = parse_km_entry(entry)
            if parsed:
                parsed_data.append(parsed)

        # Export based on format
        if format.lower() == 'csv':
            if parsed_data:
                df = pd.DataFrame(parsed_data)
                df.to_csv(filename, index=False)
            else:
                with open(filename, 'w', newline='') as f:
                    f.write('No data found')

        elif format.lower() == 'json':
            with open(filename, 'w') as f:
                json.dump(parsed_data, f, indent=2, default=str)

        elif format.lower() == 'excel':
            if parsed_data and PANDAS_AVAILABLE:
                df = pd.DataFrame(parsed_data)
                df.to_excel(filename, index=False)
            else:
                print("pandas required for Excel export")
                return filename

        print(f"Exported {len(parsed_data)} entries to {filename}")
        return filename

    except Exception as e:
        print(f"Error exporting data: {e}")
        return filename


def search_by_pattern(pattern: str, limit: int = 50) -> List[Dict[str, Any]]:
    """Search enzymes using a reaction pattern or keyword."""
    validate_dependencies()

    enzymes = []

    try:
        # Search reactions containing the pattern
        reactions = get_reactions("*", reaction=f"*{pattern}*")
        time.sleep(0.5)  # Rate limiting

        for entry in reactions[:limit]:
            parsed = parse_reaction_entry(entry)
            if parsed:
                enzymes.append({
                    'ec_number': parsed.get('ecNumber', ''),
                    'organism': parsed.get('organism', ''),
                    'reaction': parsed.get('reaction', ''),
                    'reactants': parsed.get('reactants', []),
                    'products': parsed.get('products', []),
                    'commentary': parsed.get('commentary', '')
                })

    except Exception as e:
        print(f"Error searching by pattern '{pattern}': {e}")

    return enzymes


if __name__ == "__main__":
    # Example usage
    print("BRENDA Database Query Examples")
    print("=" * 40)

    try:
        # Example 1: Search enzymes by substrate
        print("\n1. Searching enzymes for 'glucose':")
        enzymes = search_enzymes_by_substrate("glucose", limit=5)
        for enzyme in enzymes:
            print(f"  EC {enzyme['ec_number']}: {enzyme['organism']}")
            print(f"    Km: {enzyme['km_value']}")

        # Example 2: Compare across organisms
        print("\n2. Comparing alcohol dehydrogenase (1.1.1.1) across organisms:")
        organisms = ["Escherichia coli", "Saccharomyces cerevisiae", "Homo sapiens"]
        comparison = compare_across_organisms("1.1.1.1", organisms)
        for comp in comparison:
            if comp.get('data_points', 0) > 0:
                print(f"  {comp['organism']}:")
                print(f"    Avg Km: {comp.get('average_km', 'N/A')}")
                print(f"    Optimal pH: {comp.get('optimal_ph', 'N/A')}")

        # Example 3: Get environmental parameters
        print("\n3. Environmental parameters for 1.1.1.1:")
        params = get_environmental_parameters("1.1.1.1")
        if params.get('data_points', 0) > 0:
            print(f"  pH range: {params.get('ph_range', 'N/A')}")
            print(f"  Temperature range: {params.get('temperature_range', 'N/A')}")

    except Exception as e:
        print(f"Example failed: {e}")