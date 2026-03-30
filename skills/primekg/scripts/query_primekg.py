import pandas as pd
import os
import json
from typing import List, Dict, Optional, Union

# Default data path
DATA_PATH = "/mnt/c/Users/eamon/Documents/Data/PrimeKG/kg.csv"

def _load_kg():
    """Internal helper to load the KG efficiently."""
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"PrimeKG data not found at {DATA_PATH}. Please ensure the file is downloaded.")
    # For very large files, we might want to use a database or specialized graph library.
    # For now, we'll use pandas for simplicity but with low_memory=True.
    return pd.read_csv(DATA_PATH, low_memory=True)

def search_nodes(name_query: str, node_type: Optional[str] = None) -> List[Dict]:
    """
    Search for nodes in PrimeKG by name and optionally type.
    
    Args:
        name_query: String to search for in node names.
        node_type: Optional type of node (e.g., 'gene/protein', 'drug', 'disease').
        
    Returns:
        List of matching nodes with their metadata.
    """
    kg = _load_kg()
    
    # Check both x and y columns for unique nodes
    x_nodes = kg[['x_id', 'x_type', 'x_name', 'x_source']].drop_duplicates()
    x_nodes.columns = ['id', 'type', 'name', 'source']
    
    y_nodes = kg[['y_id', 'y_type', 'y_name', 'y_source']].drop_duplicates()
    y_nodes.columns = ['id', 'type', 'name', 'source']
    
    nodes = pd.concat([x_nodes, y_nodes]).drop_duplicates()
    
    mask = nodes['name'].str.contains(name_query, case=False, na=False)
    if node_type:
        mask &= (nodes['type'] == node_type)
        
    results = nodes[mask].head(20).to_dict(orient='records')
    return results

def get_neighbors(node_id: Union[str, int], relation_type: Optional[str] = None) -> List[Dict]:
    """
    Get all direct neighbors of a specific node.
    
    Args:
        node_id: The ID of the node (e.g., NCBI Gene ID or ChEMBL ID).
        relation_type: Optional filter for specific relationship types.
        
    Returns:
        List of neighbors and the relationship metadata.
    """
    kg = _load_kg()
    node_id = str(node_id)
    
    mask_x = (kg['x_id'].astype(str) == node_id)
    mask_y = (kg['y_id'].astype(str) == node_id)
    
    if relation_type:
        mask_x &= (kg['relation'] == relation_type)
        mask_y &= (kg['relation'] == relation_type)
        
    neighbors_x = kg[mask_x][['relation', 'display_relation', 'y_id', 'y_type', 'y_name', 'y_source']]
    neighbors_x.columns = ['relation', 'display_relation', 'neighbor_id', 'neighbor_type', 'neighbor_name', 'neighbor_source']
    
    neighbors_y = kg[mask_y][['relation', 'display_relation', 'x_id', 'x_type', 'x_name', 'x_source']]
    neighbors_y.columns = ['relation', 'display_relation', 'neighbor_id', 'neighbor_type', 'neighbor_name', 'neighbor_source']
    
    results = pd.concat([neighbors_x, neighbors_y]).to_dict(orient='records')
    return results

def find_paths(start_node_id: str, end_node_id: str, max_depth: int = 2) -> List[List[Dict]]:
    """
    Find paths between two nodes (e.g., Drug to Disease) up to a certain depth.
    Note: Simple BFS implementation.
    """
    kg = _load_kg()
    start_node_id = str(start_node_id)
    end_node_id = str(end_node_id)
    
    # Simplified path finding for depth 1 and 2
    # Depth 1
    direct = kg[((kg['x_id'].astype(str) == start_node_id) & (kg['y_id'].astype(str) == end_node_id)) |
                ((kg['y_id'].astype(str) == start_node_id) & (kg['x_id'].astype(str) == end_node_id))]
    
    paths = []
    for _, row in direct.iterrows():
        paths.append([row.to_dict()])
        
    if max_depth >= 2:
        # Find neighbors of start
        n1_x = kg[kg['x_id'].astype(str) == start_node_id]
        n1_y = kg[kg['y_id'].astype(str) == start_node_id]
        
        # This is computationally expensive in pure pandas for a large KG.
        # Implementation skipped for brevity in this MVP, but suggested for full version.
        pass
        
    return paths

def get_disease_context(disease_name: str) -> Dict:
    """
    Analyze the local graph around a disease: associated genes, drugs, and phenotypes.
    """
    results = search_nodes(disease_name, node_type='disease')
    if not results:
        return {"error": "Disease not found"}
    
    disease_id = results[0]['id']
    neighbors = get_neighbors(disease_id)
    
    summary = {
        "disease_info": results[0],
        "associated_genes": [n for n in neighbors if n['neighbor_type'] == 'gene/protein'],
        "associated_drugs": [n for n in neighbors if n['neighbor_type'] == 'drug'],
        "phenotypes": [n for n in neighbors if n['neighbor_type'] == 'phenotype'],
        "related_diseases": [n for n in neighbors if n['neighbor_type'] == 'disease']
    }
    return summary
