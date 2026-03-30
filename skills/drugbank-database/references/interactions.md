# Drug-Drug Interactions

## Overview
DrugBank provides comprehensive drug-drug interaction (DDI) data including mechanism, severity, and clinical significance. This information is critical for pharmacovigilance, clinical decision support, and drug safety research.

## Interaction Data Structure

### XML Structure
```xml
<drug-interactions>
  <drug-interaction>
    <drugbank-id>DB00001</drugbank-id>
    <name>Warfarin</name>
    <description>The risk or severity of adverse effects can be increased...</description>
  </drug-interaction>
  <drug-interaction>
    <drugbank-id>DB00002</drugbank-id>
    <name>Aspirin</name>
    <description>May increase the anticoagulant activities...</description>
  </drug-interaction>
</drug-interactions>
```

### Interaction Components
- **drugbank-id**: DrugBank ID of interacting drug
- **name**: Name of interacting drug
- **description**: Detailed description of interaction mechanism and clinical significance

## Extract Drug Interactions

### Basic Interaction Extraction
```python
from drugbank_downloader import get_drugbank_root

def get_drug_interactions(drugbank_id):
    """Get all interactions for a specific drug"""
    root = get_drugbank_root()
    ns = {'db': 'http://www.drugbank.ca'}

    # Find the drug
    for drug in root.findall('db:drug', ns):
        primary_id = drug.find('db:drugbank-id[@primary="true"]', ns)
        if primary_id is not None and primary_id.text == drugbank_id:
            interactions = []

            # Extract interactions
            ddi_elem = drug.find('db:drug-interactions', ns)
            if ddi_elem is not None:
                for interaction in ddi_elem.findall('db:drug-interaction', ns):
                    interaction_data = {
                        'partner_id': interaction.find('db:drugbank-id', ns).text,
                        'partner_name': interaction.find('db:name', ns).text,
                        'description': interaction.find('db:description', ns).text
                    }
                    interactions.append(interaction_data)

            return interactions
    return []

# Example usage
interactions = get_drug_interactions('DB00001')
print(f"Found {len(interactions)} interactions")
```

### Bidirectional Interaction Mapping
```python
def build_interaction_network():
    """Build complete interaction network (all drug pairs)"""
    root = get_drugbank_root()
    ns = {'db': 'http://www.drugbank.ca'}

    interaction_network = {}

    for drug in root.findall('db:drug', ns):
        drug_id = drug.find('db:drugbank-id[@primary="true"]', ns).text

        ddi_elem = drug.find('db:drug-interactions', ns)
        if ddi_elem is not None:
            interactions = []
            for interaction in ddi_elem.findall('db:drug-interaction', ns):
                partner_id = interaction.find('db:drugbank-id', ns).text
                interactions.append(partner_id)

            interaction_network[drug_id] = interactions

    return interaction_network

# Usage
network = build_interaction_network()
```

## Analyze Interaction Patterns

### Count Interactions per Drug
```python
def rank_drugs_by_interactions():
    """Rank drugs by number of known interactions"""
    root = get_drugbank_root()
    ns = {'db': 'http://www.drugbank.ca'}

    drug_interaction_counts = []

    for drug in root.findall('db:drug', ns):
        drug_id = drug.find('db:drugbank-id[@primary="true"]', ns).text
        drug_name = drug.find('db:name', ns).text

        ddi_elem = drug.find('db:drug-interactions', ns)
        count = 0
        if ddi_elem is not None:
            count = len(ddi_elem.findall('db:drug-interaction', ns))

        drug_interaction_counts.append({
            'id': drug_id,
            'name': drug_name,
            'interaction_count': count
        })

    # Sort by count
    drug_interaction_counts.sort(key=lambda x: x['interaction_count'], reverse=True)
    return drug_interaction_counts

# Get top 10 drugs with most interactions
top_drugs = rank_drugs_by_interactions()[:10]
for drug in top_drugs:
    print(f"{drug['name']}: {drug['interaction_count']} interactions")
```

### Find Common Interaction Partners
```python
def find_common_interactors(drugbank_id1, drugbank_id2):
    """Find drugs that interact with both specified drugs"""
    interactions1 = set(i['partner_id'] for i in get_drug_interactions(drugbank_id1))
    interactions2 = set(i['partner_id'] for i in get_drug_interactions(drugbank_id2))

    common = interactions1.intersection(interactions2)
    return list(common)

# Example
common = find_common_interactors('DB00001', 'DB00002')
print(f"Common interacting drugs: {len(common)}")
```

### Check Specific Drug Pair
```python
def check_interaction(drug1_id, drug2_id):
    """Check if two drugs interact and get details"""
    interactions = get_drug_interactions(drug1_id)

    for interaction in interactions:
        if interaction['partner_id'] == drug2_id:
            return interaction

    # Check reverse direction
    interactions_reverse = get_drug_interactions(drug2_id)
    for interaction in interactions_reverse:
        if interaction['partner_id'] == drug1_id:
            return interaction

    return None

# Usage
interaction = check_interaction('DB00001', 'DB00002')
if interaction:
    print(f"Interaction found: {interaction['description']}")
else:
    print("No interaction found")
```

## Interaction Classification

### Parse Interaction Descriptions
```python
import re

def classify_interaction_severity(description):
    """Classify interaction severity based on description keywords"""
    description_lower = description.lower()

    # Severity indicators
    if any(word in description_lower for word in ['contraindicated', 'avoid', 'should not']):
        return 'major'
    elif any(word in description_lower for word in ['may increase', 'can increase', 'risk']):
        return 'moderate'
    elif any(word in description_lower for word in ['may decrease', 'minor', 'monitor']):
        return 'minor'
    else:
        return 'unknown'

def classify_interaction_mechanism(description):
    """Extract interaction mechanism from description"""
    description_lower = description.lower()

    mechanisms = []

    if 'metabolism' in description_lower or 'cyp' in description_lower:
        mechanisms.append('metabolic')
    if 'absorption' in description_lower:
        mechanisms.append('absorption')
    if 'excretion' in description_lower or 'renal' in description_lower:
        mechanisms.append('excretion')
    if 'synergistic' in description_lower or 'additive' in description_lower:
        mechanisms.append('pharmacodynamic')
    if 'protein binding' in description_lower:
        mechanisms.append('protein_binding')

    return mechanisms if mechanisms else ['unspecified']
```

### Categorize Interactions
```python
def categorize_drug_interactions(drugbank_id):
    """Categorize interactions by severity and mechanism"""
    interactions = get_drug_interactions(drugbank_id)

    categorized = {
        'major': [],
        'moderate': [],
        'minor': [],
        'unknown': []
    }

    for interaction in interactions:
        severity = classify_interaction_severity(interaction['description'])
        interaction['severity'] = severity
        interaction['mechanisms'] = classify_interaction_mechanism(interaction['description'])
        categorized[severity].append(interaction)

    return categorized

# Usage
categorized = categorize_drug_interactions('DB00001')
print(f"Major: {len(categorized['major'])}")
print(f"Moderate: {len(categorized['moderate'])}")
print(f"Minor: {len(categorized['minor'])}")
```

## Build Interaction Matrix

### Create Pairwise Interaction Matrix
```python
import pandas as pd
import numpy as np

def create_interaction_matrix(drug_ids):
    """Create binary interaction matrix for specified drugs"""
    n = len(drug_ids)
    matrix = np.zeros((n, n), dtype=int)

    # Build index mapping
    id_to_idx = {drug_id: idx for idx, drug_id in enumerate(drug_ids)}

    # Fill matrix
    for i, drug_id in enumerate(drug_ids):
        interactions = get_drug_interactions(drug_id)
        for interaction in interactions:
            partner_id = interaction['partner_id']
            if partner_id in id_to_idx:
                j = id_to_idx[partner_id]
                matrix[i, j] = 1
                matrix[j, i] = 1  # Symmetric

    df = pd.DataFrame(matrix, index=drug_ids, columns=drug_ids)
    return df

# Example: Create matrix for top 100 drugs
top_100_drugs = [drug['id'] for drug in rank_drugs_by_interactions()[:100]]
interaction_matrix = create_interaction_matrix(top_100_drugs)
```

### Export Interaction Network
```python
def export_interaction_network_csv(output_file='drugbank_interactions.csv'):
    """Export all interactions as edge list (CSV)"""
    root = get_drugbank_root()
    ns = {'db': 'http://www.drugbank.ca'}

    edges = []

    for drug in root.findall('db:drug', ns):
        drug_id = drug.find('db:drugbank-id[@primary="true"]', ns).text
        drug_name = drug.find('db:name', ns).text

        ddi_elem = drug.find('db:drug-interactions', ns)
        if ddi_elem is not None:
            for interaction in ddi_elem.findall('db:drug-interaction', ns):
                partner_id = interaction.find('db:drugbank-id', ns).text
                partner_name = interaction.find('db:name', ns).text
                description = interaction.find('db:description', ns).text

                edges.append({
                    'drug1_id': drug_id,
                    'drug1_name': drug_name,
                    'drug2_id': partner_id,
                    'drug2_name': partner_name,
                    'description': description
                })

    df = pd.DataFrame(edges)
    df.to_csv(output_file, index=False)
    print(f"Exported {len(edges)} interactions to {output_file}")

# Usage
export_interaction_network_csv()
```

## Network Analysis

### Graph Representation
```python
import networkx as nx

def build_interaction_graph():
    """Build NetworkX graph of drug interactions"""
    network = build_interaction_network()

    G = nx.Graph()

    # Add nodes and edges
    for drug_id, partners in network.items():
        G.add_node(drug_id)
        for partner_id in partners:
            G.add_edge(drug_id, partner_id)

    return G

# Build graph
G = build_interaction_graph()
print(f"Nodes: {G.number_of_nodes()}, Edges: {G.number_of_edges()}")

# Network statistics
density = nx.density(G)
print(f"Network density: {density:.4f}")

# Find highly connected drugs (hubs)
degree_dict = dict(G.degree())
top_hubs = sorted(degree_dict.items(), key=lambda x: x[1], reverse=True)[:10]
print("Top 10 hubs:", top_hubs)
```

### Community Detection
```python
def detect_interaction_communities():
    """Detect communities in interaction network"""
    G = build_interaction_graph()

    # Louvain community detection
    from networkx.algorithms import community
    communities = community.louvain_communities(G)

    print(f"Detected {len(communities)} communities")

    # Analyze communities
    for i, comm in enumerate(communities[:5], 1):  # Top 5 communities
        print(f"Community {i}: {len(comm)} drugs")

    return communities

# Usage
communities = detect_interaction_communities()
```

## Clinical Applications

### Polypharmacy Analysis
```python
def check_polypharmacy_interactions(drug_list):
    """Check for interactions in a drug regimen"""
    print(f"Checking interactions for {len(drug_list)} drugs...")

    all_interactions = []

    # Check all pairs
    for i, drug1 in enumerate(drug_list):
        for drug2 in drug_list[i+1:]:
            interaction = check_interaction(drug1, drug2)
            if interaction:
                interaction['drug1'] = drug1
                interaction['drug2'] = drug2
                all_interactions.append(interaction)

    return all_interactions

# Example: Check patient drug regimen
patient_drugs = ['DB00001', 'DB00002', 'DB00005', 'DB00009']
interactions = check_polypharmacy_interactions(patient_drugs)

print(f"\nFound {len(interactions)} interactions:")
for interaction in interactions:
    print(f"\n{interaction['drug1']} + {interaction['drug2']}")
    print(f"  {interaction['description'][:100]}...")
```

### Interaction Risk Score
```python
def calculate_interaction_risk_score(drug_list):
    """Calculate overall interaction risk for drug combination"""
    interactions = check_polypharmacy_interactions(drug_list)

    severity_weights = {'major': 3, 'moderate': 2, 'minor': 1, 'unknown': 1}

    total_score = 0
    for interaction in interactions:
        severity = classify_interaction_severity(interaction['description'])
        total_score += severity_weights[severity]

    return {
        'total_interactions': len(interactions),
        'risk_score': total_score,
        'average_severity': total_score / len(interactions) if interactions else 0
    }

# Usage
risk = calculate_interaction_risk_score(patient_drugs)
print(f"Risk Score: {risk['risk_score']}, Avg Severity: {risk['average_severity']:.2f}")
```

## Best Practices

1. **Bidirectional Checking**: Always check interactions in both directions (A→B and B→A)
2. **Context Matters**: Consider clinical context when interpreting interaction significance
3. **Up-to-date Data**: Use latest DrugBank version for most current interaction data
4. **Severity Classification**: Implement custom classification based on your clinical needs
5. **Network Analysis**: Use graph analysis to identify high-risk drug combinations
6. **Clinical Validation**: Cross-reference with clinical guidelines and literature
7. **Documentation**: Document DrugBank version and analysis methods for reproducibility
