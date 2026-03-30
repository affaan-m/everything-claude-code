# Chemical Properties and Similarity Analysis

## Overview
DrugBank provides extensive chemical property data including molecular structures, physicochemical properties, and calculated descriptors. This information enables structure-based analysis, similarity searches, and QSAR modeling.

## Chemical Identifiers and Structures

### Available Structure Formats
- **SMILES**: Simplified Molecular Input Line Entry System
- **InChI**: International Chemical Identifier
- **InChIKey**: Hashed InChI for database searching
- **Molecular Formula**: Chemical formula (e.g., C9H8O4)
- **IUPAC Name**: Systematic chemical name
- **Traditional Names**: Common names and synonyms

### Extract Chemical Structures
```python
from drugbank_downloader import get_drugbank_root

def get_drug_structures(drugbank_id):
    """Extract chemical structure representations"""
    root = get_drugbank_root()
    ns = {'db': 'http://www.drugbank.ca'}

    for drug in root.findall('db:drug', ns):
        primary_id = drug.find('db:drugbank-id[@primary="true"]', ns)
        if primary_id is not None and primary_id.text == drugbank_id:
            structures = {}

            # Get calculated properties
            calc_props = drug.find('db:calculated-properties', ns)
            if calc_props is not None:
                for prop in calc_props.findall('db:property', ns):
                    kind = prop.find('db:kind', ns).text
                    value = prop.find('db:value', ns).text

                    if kind in ['SMILES', 'InChI', 'InChIKey', 'Molecular Formula', 'IUPAC Name']:
                        structures[kind] = value

            return structures
    return {}

# Usage
structures = get_drug_structures('DB00001')
print(f"SMILES: {structures.get('SMILES')}")
print(f"InChI: {structures.get('InChI')}")
```

## Physicochemical Properties

### Calculated Properties
Properties computed from structure:
- **Molecular Weight**: Exact mass in Daltons
- **logP**: Partition coefficient (lipophilicity)
- **logS**: Aqueous solubility
- **Polar Surface Area (PSA)**: Topological polar surface area
- **H-Bond Donors**: Number of hydrogen bond donors
- **H-Bond Acceptors**: Number of hydrogen bond acceptors
- **Rotatable Bonds**: Number of rotatable bonds
- **Refractivity**: Molar refractivity
- **Polarizability**: Molecular polarizability

### Experimental Properties
Measured properties from literature:
- **Melting Point**: Physical melting point
- **Water Solubility**: Experimental solubility data
- **pKa**: Acid dissociation constant
- **Hydrophobicity**: Experimental logP/logD values

### Extract All Properties
```python
def get_all_properties(drugbank_id):
    """Extract all calculated and experimental properties"""
    root = get_drugbank_root()
    ns = {'db': 'http://www.drugbank.ca'}

    for drug in root.findall('db:drug', ns):
        primary_id = drug.find('db:drugbank-id[@primary="true"]', ns)
        if primary_id is not None and primary_id.text == drugbank_id:
            properties = {
                'calculated': {},
                'experimental': {}
            }

            # Calculated properties
            calc_props = drug.find('db:calculated-properties', ns)
            if calc_props is not None:
                for prop in calc_props.findall('db:property', ns):
                    kind = prop.find('db:kind', ns).text
                    value = prop.find('db:value', ns).text
                    source = prop.find('db:source', ns)
                    properties['calculated'][kind] = {
                        'value': value,
                        'source': source.text if source is not None else None
                    }

            # Experimental properties
            exp_props = drug.find('db:experimental-properties', ns)
            if exp_props is not None:
                for prop in exp_props.findall('db:property', ns):
                    kind = prop.find('db:kind', ns).text
                    value = prop.find('db:value', ns).text
                    properties['experimental'][kind] = value

            return properties
    return {}

# Usage
props = get_all_properties('DB00001')
print(f"Molecular Weight: {props['calculated'].get('Molecular Weight', {}).get('value')}")
print(f"logP: {props['calculated'].get('logP', {}).get('value')}")
```

## Lipinski's Rule of Five Analysis

### Rule of Five Checker
```python
def check_lipinski_rule_of_five(drugbank_id):
    """Check if drug satisfies Lipinski's Rule of Five"""
    props = get_all_properties(drugbank_id)
    calc_props = props.get('calculated', {})

    # Extract values
    mw = float(calc_props.get('Molecular Weight', {}).get('value', 0))
    logp = float(calc_props.get('logP', {}).get('value', 0))
    h_donors = int(calc_props.get('H Bond Donor Count', {}).get('value', 0))
    h_acceptors = int(calc_props.get('H Bond Acceptor Count', {}).get('value', 0))

    # Check rules
    rules = {
        'molecular_weight': mw <= 500,
        'logP': logp <= 5,
        'h_bond_donors': h_donors <= 5,
        'h_bond_acceptors': h_acceptors <= 10
    }

    violations = sum(1 for passes in rules.values() if not passes)

    return {
        'passes': violations <= 1,  # Allow 1 violation
        'violations': violations,
        'rules': rules,
        'values': {
            'molecular_weight': mw,
            'logP': logp,
            'h_bond_donors': h_donors,
            'h_bond_acceptors': h_acceptors
        }
    }

# Usage
ro5 = check_lipinski_rule_of_five('DB00001')
print(f"Passes Ro5: {ro5['passes']} (Violations: {ro5['violations']})")
```

### Veber's Rules
```python
def check_veber_rules(drugbank_id):
    """Check Veber's rules for oral bioavailability"""
    props = get_all_properties(drugbank_id)
    calc_props = props.get('calculated', {})

    psa = float(calc_props.get('Polar Surface Area (PSA)', {}).get('value', 0))
    rotatable = int(calc_props.get('Rotatable Bond Count', {}).get('value', 0))

    rules = {
        'polar_surface_area': psa <= 140,
        'rotatable_bonds': rotatable <= 10
    }

    return {
        'passes': all(rules.values()),
        'rules': rules,
        'values': {
            'psa': psa,
            'rotatable_bonds': rotatable
        }
    }
```

## Chemical Similarity Analysis

### Structure-Based Similarity with RDKit
```python
from rdkit import Chem
from rdkit.Chem import AllChem, DataStructs

def calculate_tanimoto_similarity(smiles1, smiles2):
    """Calculate Tanimoto similarity between two molecules"""
    mol1 = Chem.MolFromSmiles(smiles1)
    mol2 = Chem.MolFromSmiles(smiles2)

    if mol1 is None or mol2 is None:
        return None

    # Generate Morgan fingerprints (ECFP4)
    fp1 = AllChem.GetMorganFingerprintAsBitVect(mol1, 2, nBits=2048)
    fp2 = AllChem.GetMorganFingerprintAsBitVect(mol2, 2, nBits=2048)

    # Calculate Tanimoto similarity
    similarity = DataStructs.TanimotoSimilarity(fp1, fp2)
    return similarity

# Usage
struct1 = get_drug_structures('DB00001')
struct2 = get_drug_structures('DB00002')

similarity = calculate_tanimoto_similarity(
    struct1.get('SMILES'),
    struct2.get('SMILES')
)
print(f"Tanimoto similarity: {similarity:.3f}")
```

### Find Similar Drugs
```python
def find_similar_drugs(reference_drugbank_id, similarity_threshold=0.7):
    """Find structurally similar drugs in DrugBank"""
    root = get_drugbank_root()
    ns = {'db': 'http://www.drugbank.ca'}

    # Get reference structure
    ref_structures = get_drug_structures(reference_drugbank_id)
    ref_smiles = ref_structures.get('SMILES')

    if not ref_smiles:
        return []

    similar_drugs = []

    for drug in root.findall('db:drug', ns):
        drug_id = drug.find('db:drugbank-id[@primary="true"]', ns).text

        if drug_id == reference_drugbank_id:
            continue

        # Get SMILES
        drug_structures = get_drug_structures(drug_id)
        drug_smiles = drug_structures.get('SMILES')

        if drug_smiles:
            similarity = calculate_tanimoto_similarity(ref_smiles, drug_smiles)

            if similarity and similarity >= similarity_threshold:
                drug_name = drug.find('db:name', ns).text
                indication = drug.find('db:indication', ns)
                indication_text = indication.text if indication is not None else None

                similar_drugs.append({
                    'drug_id': drug_id,
                    'drug_name': drug_name,
                    'similarity': similarity,
                    'indication': indication_text
                })

    # Sort by similarity
    similar_drugs.sort(key=lambda x: x['similarity'], reverse=True)
    return similar_drugs

# Find similar drugs
similar = find_similar_drugs('DB00001', similarity_threshold=0.7)
for drug in similar[:10]:
    print(f"{drug['drug_name']}: {drug['similarity']:.3f}")
```

### Batch Similarity Matrix
```python
import numpy as np
import pandas as pd

def create_similarity_matrix(drug_ids):
    """Create pairwise similarity matrix for a list of drugs"""
    n = len(drug_ids)
    matrix = np.zeros((n, n))

    # Get all SMILES
    smiles_dict = {}
    for drug_id in drug_ids:
        structures = get_drug_structures(drug_id)
        smiles_dict[drug_id] = structures.get('SMILES')

    # Calculate similarities
    for i, drug1_id in enumerate(drug_ids):
        for j, drug2_id in enumerate(drug_ids):
            if i == j:
                matrix[i, j] = 1.0
            elif i < j:  # Only calculate upper triangle
                smiles1 = smiles_dict[drug1_id]
                smiles2 = smiles_dict[drug2_id]

                if smiles1 and smiles2:
                    sim = calculate_tanimoto_similarity(smiles1, smiles2)
                    matrix[i, j] = sim if sim is not None else 0
                    matrix[j, i] = matrix[i, j]  # Symmetric

    df = pd.DataFrame(matrix, index=drug_ids, columns=drug_ids)
    return df

# Create similarity matrix for a set of drugs
drug_list = ['DB00001', 'DB00002', 'DB00003', 'DB00005']
sim_matrix = create_similarity_matrix(drug_list)
```

## Molecular Fingerprints

### Generate Different Fingerprint Types
```python
from rdkit.Chem import MACCSkeys
from rdkit.Chem.AtomPairs import Pairs
from rdkit.Chem.Fingerprints import FingerprintMols

def generate_fingerprints(smiles):
    """Generate multiple types of molecular fingerprints"""
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        return None

    fingerprints = {
        'morgan_fp': AllChem.GetMorganFingerprintAsBitVect(mol, 2, nBits=2048),
        'maccs_keys': MACCSkeys.GenMACCSKeys(mol),
        'topological_fp': FingerprintMols.FingerprintMol(mol),
        'atom_pairs': Pairs.GetAtomPairFingerprint(mol)
    }

    return fingerprints

# Generate fingerprints for a drug
structures = get_drug_structures('DB00001')
fps = generate_fingerprints(structures.get('SMILES'))
```

### Substructure Search
```python
from rdkit.Chem import Fragments

def search_substructure(substructure_smarts):
    """Find drugs containing a specific substructure"""
    root = get_drugbank_root()
    ns = {'db': 'http://www.drugbank.ca'}

    pattern = Chem.MolFromSmarts(substructure_smarts)
    if pattern is None:
        print("Invalid SMARTS pattern")
        return []

    matching_drugs = []

    for drug in root.findall('db:drug', ns):
        drug_id = drug.find('db:drugbank-id[@primary="true"]', ns).text
        structures = get_drug_structures(drug_id)
        smiles = structures.get('SMILES')

        if smiles:
            mol = Chem.MolFromSmiles(smiles)
            if mol and mol.HasSubstructMatch(pattern):
                drug_name = drug.find('db:name', ns).text
                matching_drugs.append({
                    'drug_id': drug_id,
                    'drug_name': drug_name
                })

    return matching_drugs

# Example: Find drugs with benzene ring
benzene_drugs = search_substructure('c1ccccc1')
print(f"Found {len(benzene_drugs)} drugs with benzene ring")
```

## ADMET Property Prediction

### Predict Absorption
```python
def predict_oral_absorption(drugbank_id):
    """Predict oral absorption based on physicochemical properties"""
    props = get_all_properties(drugbank_id)
    calc_props = props.get('calculated', {})

    mw = float(calc_props.get('Molecular Weight', {}).get('value', 0))
    logp = float(calc_props.get('logP', {}).get('value', 0))
    psa = float(calc_props.get('Polar Surface Area (PSA)', {}).get('value', 0))
    h_donors = int(calc_props.get('H Bond Donor Count', {}).get('value', 0))

    # Simple absorption prediction
    good_absorption = (
        mw <= 500 and
        -0.5 <= logp <= 5.0 and
        psa <= 140 and
        h_donors <= 5
    )

    absorption_score = 0
    if mw <= 500:
        absorption_score += 25
    if -0.5 <= logp <= 5.0:
        absorption_score += 25
    if psa <= 140:
        absorption_score += 25
    if h_donors <= 5:
        absorption_score += 25

    return {
        'predicted_absorption': 'good' if good_absorption else 'poor',
        'absorption_score': absorption_score,
        'properties': {
            'molecular_weight': mw,
            'logP': logp,
            'psa': psa,
            'h_donors': h_donors
        }
    }
```

### BBB Permeability Prediction
```python
def predict_bbb_permeability(drugbank_id):
    """Predict blood-brain barrier permeability"""
    props = get_all_properties(drugbank_id)
    calc_props = props.get('calculated', {})

    mw = float(calc_props.get('Molecular Weight', {}).get('value', 0))
    logp = float(calc_props.get('logP', {}).get('value', 0))
    psa = float(calc_props.get('Polar Surface Area (PSA)', {}).get('value', 0))
    h_donors = int(calc_props.get('H Bond Donor Count', {}).get('value', 0))

    # BBB permeability criteria (simplified)
    bbb_permeable = (
        mw <= 450 and
        logp <= 5.0 and
        psa <= 90 and
        h_donors <= 3
    )

    return {
        'bbb_permeable': bbb_permeable,
        'properties': {
            'molecular_weight': mw,
            'logP': logp,
            'psa': psa,
            'h_donors': h_donors
        }
    }
```

## Chemical Space Analysis

### Principal Component Analysis
```python
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

def perform_chemical_space_pca(drug_ids):
    """Perform PCA on chemical descriptor space"""
    # Extract properties for all drugs
    properties_list = []
    valid_ids = []

    for drug_id in drug_ids:
        props = get_all_properties(drug_id)
        calc_props = props.get('calculated', {})

        try:
            prop_vector = [
                float(calc_props.get('Molecular Weight', {}).get('value', 0)),
                float(calc_props.get('logP', {}).get('value', 0)),
                float(calc_props.get('Polar Surface Area (PSA)', {}).get('value', 0)),
                int(calc_props.get('H Bond Donor Count', {}).get('value', 0)),
                int(calc_props.get('H Bond Acceptor Count', {}).get('value', 0)),
                int(calc_props.get('Rotatable Bond Count', {}).get('value', 0)),
            ]
            properties_list.append(prop_vector)
            valid_ids.append(drug_id)
        except (ValueError, TypeError):
            continue

    # Perform PCA
    X = np.array(properties_list)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    pca = PCA(n_components=2)
    X_pca = pca.fit_transform(X_scaled)

    # Create DataFrame
    df = pd.DataFrame({
        'drug_id': valid_ids,
        'PC1': X_pca[:, 0],
        'PC2': X_pca[:, 1]
    })

    return df, pca

# Visualize chemical space
# drug_list = [all approved drugs]
# pca_df, pca_model = perform_chemical_space_pca(drug_list)
```

### Clustering by Chemical Properties
```python
from sklearn.cluster import KMeans

def cluster_drugs_by_properties(drug_ids, n_clusters=10):
    """Cluster drugs based on chemical properties"""
    properties_list = []
    valid_ids = []

    for drug_id in drug_ids:
        props = get_all_properties(drug_id)
        calc_props = props.get('calculated', {})

        try:
            prop_vector = [
                float(calc_props.get('Molecular Weight', {}).get('value', 0)),
                float(calc_props.get('logP', {}).get('value', 0)),
                float(calc_props.get('Polar Surface Area (PSA)', {}).get('value', 0)),
                int(calc_props.get('H Bond Donor Count', {}).get('value', 0)),
                int(calc_props.get('H Bond Acceptor Count', {}).get('value', 0)),
            ]
            properties_list.append(prop_vector)
            valid_ids.append(drug_id)
        except (ValueError, TypeError):
            continue

    X = np.array(properties_list)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # K-means clustering
    kmeans = KMeans(n_clusters=n_clusters, random_state=42)
    clusters = kmeans.fit_predict(X_scaled)

    df = pd.DataFrame({
        'drug_id': valid_ids,
        'cluster': clusters
    })

    return df, kmeans
```

## Export Chemical Data

### Create Chemical Property Database
```python
def export_chemical_properties(output_file='drugbank_chemical_properties.csv'):
    """Export all chemical properties to CSV"""
    root = get_drugbank_root()
    ns = {'db': 'http://www.drugbank.ca'}

    all_properties = []

    for drug in root.findall('db:drug', ns):
        drug_id = drug.find('db:drugbank-id[@primary="true"]', ns).text
        drug_name = drug.find('db:name', ns).text

        props = get_all_properties(drug_id)
        calc_props = props.get('calculated', {})

        property_dict = {
            'drug_id': drug_id,
            'drug_name': drug_name,
            'smiles': calc_props.get('SMILES', {}).get('value'),
            'inchi': calc_props.get('InChI', {}).get('value'),
            'inchikey': calc_props.get('InChIKey', {}).get('value'),
            'molecular_weight': calc_props.get('Molecular Weight', {}).get('value'),
            'logP': calc_props.get('logP', {}).get('value'),
            'psa': calc_props.get('Polar Surface Area (PSA)', {}).get('value'),
            'h_donors': calc_props.get('H Bond Donor Count', {}).get('value'),
            'h_acceptors': calc_props.get('H Bond Acceptor Count', {}).get('value'),
            'rotatable_bonds': calc_props.get('Rotatable Bond Count', {}).get('value'),
        }

        all_properties.append(property_dict)

    df = pd.DataFrame(all_properties)
    df.to_csv(output_file, index=False)
    print(f"Exported {len(all_properties)} drug properties to {output_file}")

# Usage
export_chemical_properties()
```

## Best Practices

1. **Structure Validation**: Always validate SMILES/InChI before use with RDKit
2. **Multiple Descriptors**: Use multiple fingerprint types for comprehensive similarity
3. **Threshold Selection**: Tanimoto >0.85 = very similar, 0.7-0.85 = similar, <0.7 = different
4. **Rule Application**: Lipinski's Ro5 and Veber's rules are guidelines, not absolute cutoffs
5. **ADMET Prediction**: Use computational predictions as screening, validate experimentally
6. **Chemical Space**: Visualize chemical space to understand drug diversity
7. **Standardization**: Standardize molecules (neutralize, remove salts) before comparison
8. **Performance**: Cache computed fingerprints for large-scale similarity searches
