# Rowan API Reference

## Table of Contents

1. [Workflow Class](#workflow-class)
2. [Workflow Submission Functions](#workflow-submission-functions)
3. [Workflow Retrieval Functions](#workflow-retrieval-functions)
4. [Batch Operations](#batch-operations)
5. [Utility Functions](#utility-functions)

---

## Workflow Class

The `Workflow` class represents a submitted computational job.

### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `uuid` | str | Unique identifier |
| `name` | str | User-assigned name |
| `status` | str | Current status: "pending", "running", "completed", "failed" |
| `created_at` | datetime | Submission timestamp |
| `completed_at` | datetime | Completion timestamp (None if not finished) |
| `credits_charged` | float | Credits consumed |
| `data` | dict | Workflow results (lazy-loaded) |
| `workflow_type` | str | Type of calculation |
| `folder_uuid` | str | Parent folder UUID |

**Note:** Workflow data is not loaded by default to avoid unnecessary downloads. Call `fetch_latest()` to load results.

### Methods

#### Status Management

```python
# Get current status
status = workflow.get_status()

# Check if finished
if workflow.is_finished():
    print("Done!")

# Block until completion
workflow.wait_for_result(timeout=3600)  # Optional timeout in seconds

# Refresh from API
workflow.fetch_latest(in_place=True)
```

#### Data Operations

```python
# Update metadata
workflow.update(
    name="New name",
    notes="Additional notes",
    starred=True
)

# Delete workflow
workflow.delete()

# Delete only results data (keep metadata)
workflow.delete_data()

# Download trajectory files (for MD workflows)
workflow.download_dcd_files(output_dir="trajectories/")

# Download SDF file
workflow.download_sdf_file(output_path="molecule.sdf")
```

#### Execution Control

```python
# Stop a running workflow
workflow.stop()
```

---

## Workflow Submission Functions

### Generic Submission

```python
rowan.submit_workflow(
    name: str,                      # Workflow name
    initial_molecule: Molecule,     # stjames.Molecule object
    workflow_type: str,             # e.g., "pka", "optimization", "conformer_search"
    workflow_data: dict = {},       # Workflow-specific parameters
    folder_uuid: str = None,        # Optional folder
    max_credits: float = None       # Credit limit
) -> Workflow
```

### Specialized Submission Functions

All functions return a `Workflow` object.

#### Property Prediction

```python
# pKa calculation
rowan.submit_pka_workflow(
    initial_molecule: Molecule,
    name: str = None,
    folder_uuid: str = None,
    max_credits: float = None
)

# Redox potential
rowan.submit_redox_potential_workflow(
    initial_molecule: Molecule,
    name: str = None,
    folder_uuid: str = None,
    max_credits: float = None
)

# Solubility prediction
rowan.submit_solubility_workflow(
    initial_molecule: Molecule,
    name: str = None,
    folder_uuid: str = None,
    max_credits: float = None
)

# Fukui indices (reactivity)
rowan.submit_fukui_workflow(
    initial_molecule: Molecule,
    name: str = None,
    folder_uuid: str = None,
    max_credits: float = None
)

# Bond dissociation energy
rowan.submit_bde_workflow(
    initial_molecule: Molecule,
    bond_indices: tuple,  # (atom1_idx, atom2_idx)
    name: str = None,
    folder_uuid: str = None,
    max_credits: float = None
)
```

#### Molecular Modeling

```python
# Geometry optimization
rowan.submit_basic_calculation_workflow(
    initial_molecule: Molecule,
    workflow_type: str = "optimization",  # or "single_point", "frequency"
    name: str = None,
    folder_uuid: str = None,
    max_credits: float = None
)

# Conformer search
rowan.submit_conformer_search_workflow(
    initial_molecule: Molecule,
    name: str = None,
    folder_uuid: str = None,
    max_credits: float = None
)

# Tautomer search
rowan.submit_tautomer_search_workflow(
    initial_molecule: Molecule,
    name: str = None,
    folder_uuid: str = None,
    max_credits: float = None
)

# Dihedral scan
rowan.submit_dihedral_scan_workflow(
    initial_molecule: Molecule,
    dihedral_indices: tuple,  # (a1, a2, a3, a4)
    name: str = None,
    folder_uuid: str = None,
    max_credits: float = None
)

# Transition state search
rowan.submit_ts_search_workflow(
    initial_molecule: Molecule,  # Starting guess
    name: str = None,
    folder_uuid: str = None,
    max_credits: float = None
)
```

#### Protein-Ligand Workflows

```python
# Docking
rowan.submit_docking_workflow(
    protein: str,                   # Protein UUID
    pocket: dict,                   # {"center": [x,y,z], "size": [dx,dy,dz]}
    initial_molecule: Molecule,
    executable: str = "vina",       # "vina" or "qvina2"
    scoring_function: str = "vinardo",
    exhaustiveness: int = 8,
    do_csearch: bool = True,
    do_optimization: bool = True,
    do_pose_refinement: bool = True,
    name: str = None,
    folder_uuid: str = None,
    max_credits: float = None
)

# Batch docking
rowan.submit_batch_docking_workflow(
    protein: str,
    pocket: dict,
    smiles_list: list,              # List of SMILES strings
    executable: str = "qvina2",
    scoring_function: str = "vina",
    name: str = None,
    folder_uuid: str = None,
    max_credits: float = None
)

# Protein cofolding
rowan.submit_protein_cofolding_workflow(
    initial_protein_sequences: list,  # List of amino acid sequences
    initial_smiles_list: list = None, # Optional ligand SMILES
    ligand_binding_affinity_index: int = None,
    use_msa_server: bool = False,
    use_potentials: bool = True,
    compute_strain: bool = False,
    do_pose_refinement: bool = False,
    model: str = "boltz_2",         # "boltz_1x", "boltz_2", "chai_1r"
    name: str = None,
    folder_uuid: str = None,
    max_credits: float = None
)
```

#### Spectroscopy & Analysis

```python
# NMR prediction
rowan.submit_nmr_workflow(
    initial_molecule: Molecule,
    name: str = None,
    folder_uuid: str = None,
    max_credits: float = None
)

# Ion mobility (collision cross-section)
rowan.submit_ion_mobility_workflow(
    initial_molecule: Molecule,
    name: str = None,
    folder_uuid: str = None,
    max_credits: float = None
)

# Molecular descriptors
rowan.submit_descriptors_workflow(
    initial_molecule: Molecule,
    name: str = None,
    folder_uuid: str = None,
    max_credits: float = None
)
```

---

## Workflow Retrieval Functions

```python
# Retrieve single workflow by UUID
workflow = rowan.retrieve_workflow(uuid: str) -> Workflow

# Retrieve multiple workflows
workflows = rowan.retrieve_workflows(uuids: list) -> list[Workflow]

# List workflows with filtering
workflows = rowan.list_workflows(
    name: str = None,           # Filter by name (partial match)
    status: str = None,         # "pending", "running", "completed", "failed"
    workflow_type: str = None,  # e.g., "pka", "docking"
    starred: bool = None,       # Filter by starred status
    folder_uuid: str = None,    # Filter by folder
    page: int = 1,              # Pagination
    size: int = 20              # Results per page
) -> list[Workflow]
```

---

## Batch Operations

```python
# Submit multiple workflows at once
workflows = rowan.batch_submit_workflow(
    molecules: list,            # List of stjames.Molecule objects
    workflow_type: str,         # Workflow type for all
    workflow_data: dict = {},
    folder_uuid: str = None,
    max_credits: float = None
) -> list[Workflow]

# Poll status of multiple workflows
statuses = rowan.batch_poll_status(
    uuids: list                 # List of workflow UUIDs
) -> dict                       # {uuid: status}
```

---

## Utility Functions

```python
# Get current user info
user = rowan.whoami() -> User
# user.username, user.email, user.credits, user.weekly_credits

# Convert SMILES to stjames.Molecule
mol = rowan.smiles_to_stjames(smiles: str) -> Molecule

# Get API key from environment
api_key = rowan.get_api_key() -> str

# Low-level API client
client = rowan.api_client() -> httpx.Client

# Molecule name lookup
smiles = rowan.molecule_lookup(name: str) -> str
# e.g., rowan.molecule_lookup("aspirin") -> "CC(=O)Oc1ccccc1C(=O)O"
```

---

## User Class

Returned by `rowan.whoami()`.

### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `username` | str | Username |
| `email` | str | Email address |
| `firstname` | str | First name |
| `lastname` | str | Last name |
| `credits` | float | Available credits |
| `weekly_credits` | float | Weekly credit allocation |
| `organization` | dict | Organization details |
| `individual_subscription` | dict | Subscription information |

---

## Error Handling

```python
import rowan

try:
    workflow = rowan.submit_pka_workflow(mol, name="test")
except rowan.RowanAPIError as e:
    print(f"API error: {e}")
except rowan.AuthenticationError as e:
    print(f"Authentication failed: {e}")
except rowan.RateLimitError as e:
    print(f"Rate limited, retry after: {e.retry_after}")
```

---

## Common Patterns

### Waiting for Multiple Workflows

```python
import rowan
import time

workflows = [rowan.submit_pka_workflow(mol) for mol in molecules]

# Poll until all complete
while True:
    statuses = rowan.batch_poll_status([wf.uuid for wf in workflows])
    if all(s in ["completed", "failed"] for s in statuses.values()):
        break
    time.sleep(10)

# Fetch results
for wf in workflows:
    wf.fetch_latest(in_place=True)
    if wf.status == "completed":
        print(wf.data)
```

### Organizing Workflows in Folders

```python
import rowan

# Create project structure
project = rowan.create_project("Drug Discovery")
lead_folder = rowan.create_folder("Lead Compounds", project_uuid=project.uuid)
backup_folder = rowan.create_folder("Backup Series", project_uuid=project.uuid)

# Submit to specific folder
workflow = rowan.submit_pka_workflow(
    mol,
    name="Lead 1 pKa",
    folder_uuid=lead_folder.uuid
)
```
