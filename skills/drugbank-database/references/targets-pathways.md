# Drug Targets and Pathways

## Overview
DrugBank provides comprehensive information about drug-protein interactions including targets, enzymes, transporters, and carriers. This data is essential for understanding drug mechanisms, identifying repurposing opportunities, and predicting off-target effects.

## Protein Interaction Categories

### Target Proteins
Primary proteins that drugs bind to produce therapeutic effects:
- **Receptors**: G-protein coupled receptors, nuclear receptors, ion channels
- **Enzymes**: Kinases, proteases, phosphatases
- **Transporters**: Used as targets (not just for ADME)
- **Other**: Structural proteins, DNA/RNA

### Metabolic Enzymes
Enzymes involved in drug metabolism:
- **Cytochrome P450 enzymes**: CYP3A4, CYP2D6, CYP2C9, etc.
- **Phase II enzymes**: UGTs, SULTs, GSTs
- **Esterases and peptidases**

### Transporters
Proteins involved in drug transport across membranes:
- **Uptake transporters**: OATPs, OCTs
- **Efflux transporters**: P-glycoprotein, BCRP, MRPs
- **Other**: SLC and ABC transporter families

### Carriers
Plasma proteins that bind and transport drugs:
- **Albumin**: Major drug carrier in blood
- **Alpha-1-acid glycoprotein**
- **Lipoproteins**
- **Specific binding proteins**: SHBG, CBG, etc.

## XML Data Structure

### Target Element Structure
```xml
<targets>
  <target>
    <id>BE0000001</id>
    <name>Prothrombin</name>
    <organism>Humans</organism>
    <actions>
      <action>inhibitor</action>
    </actions>
    <known-action>yes</known-action>
    <polypeptide id="P00734" source="Swiss-Prot">
      <name>Prothrombin</name>
      <general-function>Serine-type endopeptidase activity</general-function>
      <specific-function>Thrombin plays a role in...</specific-function>
      <gene-name>F2</gene-name>
      <organism>Homo sapiens</organism>
      <external-identifiers>
        <external-identifier>
          <resource>UniProtKB</resource>
          <identifier>P00734</identifier>
        </external-identifier>
      </external-identifiers>
      <amino-acid-sequence>MAHVRGLQLP...</amino-acid-sequence>
      <pfams>...</pfams>
      <go-classifiers>...</go-classifiers>
    </polypeptide>
  </target>
</targets>
```

## Extract Target Information

### Get Drug Targets
```python
from drugbank_downloader import get_drugbank_root

def get_drug_targets(drugbank_id):
    """Extract all targets for a drug"""
    root = get_drugbank_root()
    ns = {'db': 'http://www.drugbank.ca'}

    for drug in root.findall('db:drug', ns):
        primary_id = drug.find('db:drugbank-id[@primary="true"]', ns)
        if primary_id is not None and primary_id.text == drugbank_id:
            targets = []

            targets_elem = drug.find('db:targets', ns)
            if targets_elem is not None:
                for target in targets_elem.findall('db:target', ns):
                    target_data = extract_target_details(target, ns)
                    targets.append(target_data)

            return targets
    return []

def extract_target_details(target, ns):
    """Extract detailed target information"""
    target_data = {
        'id': target.find('db:id', ns).text,
        'name': target.find('db:name', ns).text,
        'organism': target.find('db:organism', ns).text,
        'known_action': target.find('db:known-action', ns).text,
    }

    # Extract actions
    actions_elem = target.find('db:actions', ns)
    if actions_elem is not None:
        actions = [action.text for action in actions_elem.findall('db:action', ns)]
        target_data['actions'] = actions

    # Extract polypeptide info
    polypeptide = target.find('db:polypeptide', ns)
    if polypeptide is not None:
        target_data['uniprot_id'] = polypeptide.get('id')
        target_data['gene_name'] = get_text_safe(polypeptide.find('db:gene-name', ns))
        target_data['general_function'] = get_text_safe(polypeptide.find('db:general-function', ns))
        target_data['specific_function'] = get_text_safe(polypeptide.find('db:specific-function', ns))

    return target_data

def get_text_safe(element):
    return element.text if element is not None else None
```

### Get All Protein Interactions
```python
def get_all_protein_interactions(drugbank_id):
    """Get targets, enzymes, transporters, and carriers for a drug"""
    root = get_drugbank_root()
    ns = {'db': 'http://www.drugbank.ca'}

    for drug in root.findall('db:drug', ns):
        primary_id = drug.find('db:drugbank-id[@primary="true"]', ns)
        if primary_id is not None and primary_id.text == drugbank_id:
            interactions = {
                'targets': extract_protein_list(drug.find('db:targets', ns), ns),
                'enzymes': extract_protein_list(drug.find('db:enzymes', ns), ns),
                'transporters': extract_protein_list(drug.find('db:transporters', ns), ns),
                'carriers': extract_protein_list(drug.find('db:carriers', ns), ns),
            }
            return interactions
    return None

def extract_protein_list(parent_elem, ns):
    """Extract list of proteins from parent element"""
    if parent_elem is None:
        return []

    proteins = []
    # Same structure for targets, enzymes, transporters, carriers
    for protein_elem in parent_elem:
        protein_data = extract_target_details(protein_elem, ns)
        proteins.append(protein_data)

    return proteins

# Usage
interactions = get_all_protein_interactions('DB00001')
print(f"Targets: {len(interactions['targets'])}")
print(f"Enzymes: {len(interactions['enzymes'])}")
print(f"Transporters: {len(interactions['transporters'])}")
print(f"Carriers: {len(interactions['carriers'])}")
```

## Build Target-Drug Networks

### Create Target-Drug Matrix
```python
import pandas as pd

def build_drug_target_matrix():
    """Build matrix of drugs vs targets"""
    root = get_drugbank_root()
    ns = {'db': 'http://www.drugbank.ca'}

    drug_target_pairs = []

    for drug in root.findall('db:drug', ns):
        drug_id = drug.find('db:drugbank-id[@primary="true"]', ns).text
        drug_name = drug.find('db:name', ns).text

        targets_elem = drug.find('db:targets', ns)
        if targets_elem is not None:
            for target in targets_elem.findall('db:target', ns):
                target_id = target.find('db:id', ns).text
                target_name = target.find('db:name', ns).text

                # Get UniProt ID if available
                polypeptide = target.find('db:polypeptide', ns)
                uniprot_id = polypeptide.get('id') if polypeptide is not None else None

                drug_target_pairs.append({
                    'drug_id': drug_id,
                    'drug_name': drug_name,
                    'target_id': target_id,
                    'target_name': target_name,
                    'uniprot_id': uniprot_id
                })

    df = pd.DataFrame(drug_target_pairs)
    return df

# Usage
dt_matrix = build_drug_target_matrix()
dt_matrix.to_csv('drug_target_matrix.csv', index=False)
```

### Find Drugs Targeting Specific Protein
```python
def find_drugs_for_target(target_name):
    """Find all drugs that target a specific protein"""
    root = get_drugbank_root()
    ns = {'db': 'http://www.drugbank.ca'}

    drugs_for_target = []
    target_name_lower = target_name.lower()

    for drug in root.findall('db:drug', ns):
        drug_id = drug.find('db:drugbank-id[@primary="true"]', ns).text
        drug_name = drug.find('db:name', ns).text

        targets_elem = drug.find('db:targets', ns)
        if targets_elem is not None:
            for target in targets_elem.findall('db:target', ns):
                tgt_name = target.find('db:name', ns).text
                if target_name_lower in tgt_name.lower():
                    drugs_for_target.append({
                        'drug_id': drug_id,
                        'drug_name': drug_name,
                        'target_name': tgt_name
                    })
                    break  # Found match, move to next drug

    return drugs_for_target

# Example: Find drugs targeting kinases
kinase_drugs = find_drugs_for_target('kinase')
print(f"Found {len(kinase_drugs)} drugs targeting kinases")
```

### Find Drugs with Shared Targets
```python
def find_shared_targets(drug1_id, drug2_id):
    """Find common targets between two drugs"""
    targets1 = get_drug_targets(drug1_id)
    targets2 = get_drug_targets(drug2_id)

    # Compare by UniProt ID if available, otherwise by name
    targets1_ids = set()
    for t in targets1:
        if t.get('uniprot_id'):
            targets1_ids.add(t['uniprot_id'])
        else:
            targets1_ids.add(t['name'])

    targets2_ids = set()
    for t in targets2:
        if t.get('uniprot_id'):
            targets2_ids.add(t['uniprot_id'])
        else:
            targets2_ids.add(t['name'])

    shared = targets1_ids.intersection(targets2_ids)
    return list(shared)

# Usage for drug repurposing
shared = find_shared_targets('DB00001', 'DB00002')
print(f"Shared targets: {shared}")
```

## Pathway Analysis

### Extract Pathway Information
```python
def get_drug_pathways(drugbank_id):
    """Extract pathway information for a drug"""
    root = get_drugbank_root()
    ns = {'db': 'http://www.drugbank.ca'}

    for drug in root.findall('db:drug', ns):
        primary_id = drug.find('db:drugbank-id[@primary="true"]', ns)
        if primary_id is not None and primary_id.text == drugbank_id:
            pathways = []

            pathways_elem = drug.find('db:pathways', ns)
            if pathways_elem is not None:
                for pathway in pathways_elem.findall('db:pathway', ns):
                    pathway_data = {
                        'smpdb_id': pathway.find('db:smpdb-id', ns).text,
                        'name': pathway.find('db:name', ns).text,
                        'category': pathway.find('db:category', ns).text,
                    }

                    # Extract drugs in pathway
                    drugs_elem = pathway.find('db:drugs', ns)
                    if drugs_elem is not None:
                        pathway_drugs = []
                        for drug_elem in drugs_elem.findall('db:drug', ns):
                            pathway_drugs.append(drug_elem.find('db:drugbank-id', ns).text)
                        pathway_data['drugs'] = pathway_drugs

                    # Extract enzymes in pathway
                    enzymes_elem = pathway.find('db:enzymes', ns)
                    if enzymes_elem is not None:
                        pathway_enzymes = []
                        for enzyme in enzymes_elem.findall('db:uniprot-id', ns):
                            pathway_enzymes.append(enzyme.text)
                        pathway_data['enzymes'] = pathway_enzymes

                    pathways.append(pathway_data)

            return pathways
    return []
```

### Build Pathway Network
```python
def build_pathway_drug_network():
    """Build network of pathways and drugs"""
    root = get_drugbank_root()
    ns = {'db': 'http://www.drugbank.ca'}

    pathway_network = {}

    for drug in root.findall('db:drug', ns):
        drug_id = drug.find('db:drugbank-id[@primary="true"]', ns).text

        pathways_elem = drug.find('db:pathways', ns)
        if pathways_elem is not None:
            for pathway in pathways_elem.findall('db:pathway', ns):
                pathway_id = pathway.find('db:smpdb-id', ns).text
                pathway_name = pathway.find('db:name', ns).text

                if pathway_id not in pathway_network:
                    pathway_network[pathway_id] = {
                        'name': pathway_name,
                        'drugs': []
                    }

                pathway_network[pathway_id]['drugs'].append(drug_id)

    return pathway_network
```

## Target-Based Drug Repurposing

### Find Drugs with Similar Target Profiles
```python
def find_similar_target_profiles(drugbank_id, min_shared_targets=2):
    """Find drugs with similar target profiles for repurposing"""
    reference_targets = get_drug_targets(drugbank_id)
    reference_target_ids = set(t.get('uniprot_id') or t['name'] for t in reference_targets)

    root = get_drugbank_root()
    ns = {'db': 'http://www.drugbank.ca'}

    similar_drugs = []

    for drug in root.findall('db:drug', ns):
        drug_id = drug.find('db:drugbank-id[@primary="true"]', ns).text

        if drug_id == drugbank_id:
            continue

        drug_targets = get_drug_targets(drug_id)
        drug_target_ids = set(t.get('uniprot_id') or t['name'] for t in drug_targets)

        shared = reference_target_ids.intersection(drug_target_ids)

        if len(shared) >= min_shared_targets:
            drug_name = drug.find('db:name', ns).text
            indication = get_text_safe(drug.find('db:indication', ns))

            similar_drugs.append({
                'drug_id': drug_id,
                'drug_name': drug_name,
                'shared_targets': len(shared),
                'total_targets': len(drug_target_ids),
                'overlap_ratio': len(shared) / len(drug_target_ids) if drug_target_ids else 0,
                'indication': indication,
                'shared_target_names': list(shared)
            })

    # Sort by overlap ratio
    similar_drugs.sort(key=lambda x: x['overlap_ratio'], reverse=True)
    return similar_drugs

# Example: Find repurposing candidates
candidates = find_similar_target_profiles('DB00001', min_shared_targets=2)
for drug in candidates[:5]:
    print(f"{drug['drug_name']}: {drug['shared_targets']} shared targets")
```

### Polypharmacology Analysis
```python
def analyze_polypharmacology(drugbank_id):
    """Analyze on-target and off-target effects"""
    targets = get_drug_targets(drugbank_id)

    analysis = {
        'total_targets': len(targets),
        'known_action_targets': [],
        'unknown_action_targets': [],
        'target_classes': {},
        'organisms': {}
    }

    for target in targets:
        if target.get('known_action') == 'yes':
            analysis['known_action_targets'].append(target)
        else:
            analysis['unknown_action_targets'].append(target)

        # Count by organism
        organism = target.get('organism', 'Unknown')
        analysis['organisms'][organism] = analysis['organisms'].get(organism, 0) + 1

    return analysis

# Usage
poly_analysis = analyze_polypharmacology('DB00001')
print(f"Total targets: {poly_analysis['total_targets']}")
print(f"Known action: {len(poly_analysis['known_action_targets'])}")
print(f"Unknown action: {len(poly_analysis['unknown_action_targets'])}")
```

## Enzyme and Transporter Analysis

### CYP450 Interaction Analysis
```python
def analyze_cyp450_metabolism(drugbank_id):
    """Analyze CYP450 enzyme involvement"""
    interactions = get_all_protein_interactions(drugbank_id)
    enzymes = interactions['enzymes']

    cyp_enzymes = []
    for enzyme in enzymes:
        gene_name = enzyme.get('gene_name', '')
        if gene_name and gene_name.startswith('CYP'):
            cyp_enzymes.append({
                'gene': gene_name,
                'name': enzyme['name'],
                'actions': enzyme.get('actions', [])
            })

    return cyp_enzymes

# Check CYP involvement
cyp_data = analyze_cyp450_metabolism('DB00001')
for cyp in cyp_data:
    print(f"{cyp['gene']}: {cyp['actions']}")
```

### Transporter Substrate Analysis
```python
def analyze_transporter_substrates(drugbank_id):
    """Identify transporter involvement for ADME"""
    interactions = get_all_protein_interactions(drugbank_id)
    transporters = interactions['transporters']

    transporter_info = {
        'efflux': [],
        'uptake': [],
        'other': []
    }

    for transporter in transporters:
        name = transporter['name'].lower()
        gene = transporter.get('gene_name', '').upper()

        if 'p-glycoprotein' in name or gene == 'ABCB1':
            transporter_info['efflux'].append(transporter)
        elif 'oatp' in name or 'slco' in gene.lower():
            transporter_info['uptake'].append(transporter)
        else:
            transporter_info['other'].append(transporter)

    return transporter_info
```

## GO Term and Protein Function Analysis

### Extract GO Terms
```python
def get_target_go_terms(drugbank_id):
    """Extract Gene Ontology terms for drug targets"""
    root = get_drugbank_root()
    ns = {'db': 'http://www.drugbank.ca'}

    for drug in root.findall('db:drug', ns):
        primary_id = drug.find('db:drugbank-id[@primary="true"]', ns)
        if primary_id is not None and primary_id.text == drugbank_id:
            go_terms = []

            targets_elem = drug.find('db:targets', ns)
            if targets_elem is not None:
                for target in targets_elem.findall('db:target', ns):
                    polypeptide = target.find('db:polypeptide', ns)
                    if polypeptide is not None:
                        go_classifiers = polypeptide.find('db:go-classifiers', ns)
                        if go_classifiers is not None:
                            for go_class in go_classifiers.findall('db:go-classifier', ns):
                                go_term = {
                                    'category': go_class.find('db:category', ns).text,
                                    'description': go_class.find('db:description', ns).text,
                                }
                                go_terms.append(go_term)

            return go_terms
    return []
```

## Best Practices

1. **UniProt Cross-Reference**: Use UniProt IDs for accurate protein matching across databases
2. **Action Classification**: Pay attention to action types (inhibitor, agonist, antagonist, etc.)
3. **Known vs Unknown**: Distinguish between validated targets and predicted/unknown interactions
4. **Organism Specificity**: Consider organism when analyzing target data
5. **Polypharmacology**: Account for multiple targets when predicting drug effects
6. **Pathway Context**: Use pathway data to understand systemic effects
7. **CYP450 Profiling**: Essential for predicting drug-drug interactions
8. **Transporter Analysis**: Critical for understanding bioavailability and tissue distribution
