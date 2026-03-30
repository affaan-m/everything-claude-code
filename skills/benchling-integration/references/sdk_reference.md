# Benchling Python SDK Reference

## Installation & Setup

### Installation

```bash
# Stable release
pip install benchling-sdk

# With Poetry
poetry add benchling-sdk

# Pre-release/preview versions (not recommended for production)
pip install benchling-sdk --pre
poetry add benchling-sdk --allow-prereleases
```

### Requirements
- Python 3.7 or higher
- API access enabled on your Benchling tenant

### Basic Initialization

```python
from benchling_sdk.benchling import Benchling
from benchling_sdk.auth.api_key_auth import ApiKeyAuth

benchling = Benchling(
    url="https://your-tenant.benchling.com",
    auth_method=ApiKeyAuth("your_api_key")
)
```

## SDK Architecture

### Main Classes

**Benchling Client:**
The `benchling_sdk.benchling.Benchling` class is the root of all SDK interactions. It provides access to all resource endpoints:

```python
benchling.dna_sequences      # DNA sequence operations
benchling.rna_sequences      # RNA sequence operations
benchling.aa_sequences       # Amino acid sequence operations
benchling.custom_entities    # Custom entity operations
benchling.mixtures           # Mixture operations
benchling.containers         # Container operations
benchling.boxes              # Box operations
benchling.locations          # Location operations
benchling.plates             # Plate operations
benchling.entries            # Notebook entry operations
benchling.workflow_tasks     # Workflow task operations
benchling.requests           # Request operations
benchling.folders            # Folder operations
benchling.projects           # Project operations
benchling.users              # User operations
benchling.teams              # Team operations
```

### Resource Pattern

All resources follow a consistent CRUD pattern:

```python
# Create
resource.create(CreateModel(...))

# Read (single)
resource.get(id="resource_id")

# Read (list)
resource.list(optional_filters...)

# Update
resource.update(id="resource_id", UpdateModel(...))

# Archive/Delete
resource.archive(id="resource_id")
```

## Entity Management

### DNA Sequences

**Create:**
```python
from benchling_sdk.models import DnaSequenceCreate

sequence = benchling.dna_sequences.create(
    DnaSequenceCreate(
        name="pET28a-GFP",
        bases="ATCGATCGATCG",
        is_circular=True,
        folder_id="fld_abc123",
        schema_id="ts_abc123",
        fields=benchling.models.fields({
            "gene_name": "GFP",
            "resistance": "Kanamycin",
            "copy_number": "High"
        })
    )
)
```

**Read:**
```python
# Get by ID
seq = benchling.dna_sequences.get(sequence_id="seq_abc123")
print(f"{seq.name}: {len(seq.bases)} bp")

# List with filters
sequences = benchling.dna_sequences.list(
    folder_id="fld_abc123",
    schema_id="ts_abc123",
    name="pET28a"  # Filter by name
)

for page in sequences:
    for seq in page:
        print(f"{seq.id}: {seq.name}")
```

**Update:**
```python
from benchling_sdk.models import DnaSequenceUpdate

updated = benchling.dna_sequences.update(
    sequence_id="seq_abc123",
    dna_sequence=DnaSequenceUpdate(
        name="pET28a-GFP-v2",
        fields=benchling.models.fields({
            "gene_name": "eGFP",
            "notes": "Codon optimized"
        })
    )
)
```

**Archive:**
```python
benchling.dna_sequences.archive(
    sequence_id="seq_abc123",
    reason="Deprecated construct"
)
```

### RNA Sequences

Similar pattern to DNA sequences:

```python
from benchling_sdk.models import RnaSequenceCreate, RnaSequenceUpdate

# Create
rna = benchling.rna_sequences.create(
    RnaSequenceCreate(
        name="gRNA-target1",
        bases="AUCGAUCGAUCG",
        folder_id="fld_abc123",
        fields=benchling.models.fields({
            "target_gene": "TP53",
            "off_target_score": "95"
        })
    )
)

# Update
updated_rna = benchling.rna_sequences.update(
    rna_sequence_id=rna.id,
    rna_sequence=RnaSequenceUpdate(
        fields=benchling.models.fields({
            "validated": "Yes"
        })
    )
)
```

### Amino Acid (Protein) Sequences

```python
from benchling_sdk.models import AaSequenceCreate

protein = benchling.aa_sequences.create(
    AaSequenceCreate(
        name="Green Fluorescent Protein",
        amino_acids="MSKGEELFTGVVPILVELDGDVNGHKFSVSGEGEGDATYGKLTLKF",
        folder_id="fld_abc123",
        fields=benchling.models.fields({
            "molecular_weight": "27000",
            "extinction_coefficient": "21000"
        })
    )
)
```

### Custom Entities

Custom entities are defined by your tenant's schemas:

```python
from benchling_sdk.models import CustomEntityCreate, CustomEntityUpdate

# Create
cell_line = benchling.custom_entities.create(
    CustomEntityCreate(
        name="HEK293T-Clone5",
        schema_id="ts_cellline_abc123",
        folder_id="fld_abc123",
        fields=benchling.models.fields({
            "passage_number": "15",
            "mycoplasma_test": "Negative",
            "freezing_date": "2025-10-15"
        })
    )
)

# Update
updated_cell_line = benchling.custom_entities.update(
    entity_id=cell_line.id,
    custom_entity=CustomEntityUpdate(
        fields=benchling.models.fields({
            "passage_number": "16",
            "notes": "Expanded for experiment"
        })
    )
)
```

### Mixtures

Mixtures combine multiple components:

```python
from benchling_sdk.models import MixtureCreate, IngredientCreate

mixture = benchling.mixtures.create(
    MixtureCreate(
        name="LB-Amp Media",
        folder_id="fld_abc123",
        schema_id="ts_mixture_abc123",
        ingredients=[
            IngredientCreate(
                component_entity_id="ent_lb_base",
                amount="1000 mL"
            ),
            IngredientCreate(
                component_entity_id="ent_ampicillin",
                amount="100 mg"
            )
        ],
        fields=benchling.models.fields({
            "pH": "7.0",
            "sterilized": "Yes"
        })
    )
)
```

### Registry Operations

**Direct Registry Registration:**
```python
# Register entity upon creation
registered_seq = benchling.dna_sequences.create(
    DnaSequenceCreate(
        name="Construct-001",
        bases="ATCG",
        is_circular=True,
        folder_id="fld_abc123",
        entity_registry_id="src_abc123",
        naming_strategy="NEW_IDS"  # or "IDS_FROM_NAMES"
    )
)
print(f"Registry ID: {registered_seq.registry_id}")
```

**Naming Strategies:**
- `NEW_IDS`: Benchling generates new registry IDs
- `IDS_FROM_NAMES`: Use entity names as registry IDs (names must be unique)

## Inventory Management

### Containers

```python
from benchling_sdk.models import ContainerCreate, ContainerUpdate

# Create
container = benchling.containers.create(
    ContainerCreate(
        name="Sample-001-Tube",
        schema_id="cont_schema_abc123",
        barcode="CONT001",
        parent_storage_id="box_abc123",  # Place in box
        fields=benchling.models.fields({
            "concentration": "100 ng/μL",
            "volume": "50 μL",
            "sample_type": "gDNA"
        })
    )
)

# Update location
benchling.containers.transfer(
    container_id=container.id,
    destination_id="box_xyz789"
)

# Update properties
updated = benchling.containers.update(
    container_id=container.id,
    container=ContainerUpdate(
        fields=benchling.models.fields({
            "volume": "45 μL",
            "notes": "Used 5 μL for PCR"
        })
    )
)

# Check out
benchling.containers.check_out(
    container_id=container.id,
    comment="Taking to bench"
)

# Check in
benchling.containers.check_in(
    container_id=container.id,
    location_id="bench_location_abc"
)
```

### Boxes

```python
from benchling_sdk.models import BoxCreate

box = benchling.boxes.create(
    BoxCreate(
        name="Freezer-A-Box-01",
        schema_id="box_schema_abc123",
        parent_storage_id="loc_freezer_a",
        barcode="BOX001",
        fields=benchling.models.fields({
            "box_type": "81-place",
            "temperature": "-80C"
        })
    )
)

# List containers in box
containers = benchling.containers.list(
    parent_storage_id=box.id
)
```

### Locations

```python
from benchling_sdk.models import LocationCreate

location = benchling.locations.create(
    LocationCreate(
        name="Freezer A - Shelf 2",
        parent_storage_id="loc_freezer_a",
        barcode="LOC-A-S2"
    )
)
```

### Plates

```python
from benchling_sdk.models import PlateCreate, WellCreate

# Create 96-well plate
plate = benchling.plates.create(
    PlateCreate(
        name="PCR-Plate-001",
        schema_id="plate_schema_abc123",
        barcode="PLATE001",
        wells=[
            WellCreate(
                position="A1",
                entity_id="sample_entity_abc"
            ),
            WellCreate(
                position="A2",
                entity_id="sample_entity_xyz"
            )
            # ... more wells
        ]
    )
)
```

## Notebook Operations

### Entries

```python
from benchling_sdk.models import EntryCreate, EntryUpdate

# Create entry
entry = benchling.entries.create(
    EntryCreate(
        name="Cloning Experiment 2025-10-20",
        folder_id="fld_abc123",
        schema_id="entry_schema_abc123",
        fields=benchling.models.fields({
            "objective": "Clone GFP into pET28a",
            "date": "2025-10-20",
            "experiment_type": "Molecular Biology"
        })
    )
)

# Update entry
updated_entry = benchling.entries.update(
    entry_id=entry.id,
    entry=EntryUpdate(
        fields=benchling.models.fields({
            "results": "Successful cloning, 10 colonies",
            "notes": "Colony 5 shows best fluorescence"
        })
    )
)
```

### Linking Entities to Entries

```python
# Link DNA sequence to entry
link = benchling.entry_links.create(
    entry_id="entry_abc123",
    entity_id="seq_xyz789"
)

# List links for an entry
links = benchling.entry_links.list(entry_id="entry_abc123")
```

## Workflow Management

### Tasks

```python
from benchling_sdk.models import WorkflowTaskCreate, WorkflowTaskUpdate

# Create task
task = benchling.workflow_tasks.create(
    WorkflowTaskCreate(
        name="PCR Amplification",
        workflow_id="wf_abc123",
        assignee_id="user_abc123",
        schema_id="task_schema_abc123",
        fields=benchling.models.fields({
            "template": "seq_abc123",
            "primers": "Forward: ATCG, Reverse: CGAT",
            "priority": "High"
        })
    )
)

# Update status
completed_task = benchling.workflow_tasks.update(
    task_id=task.id,
    workflow_task=WorkflowTaskUpdate(
        status_id="status_complete_abc123",
        fields=benchling.models.fields({
            "completion_date": "2025-10-20",
            "yield": "500 ng"
        })
    )
)

# List tasks
tasks = benchling.workflow_tasks.list(
    workflow_id="wf_abc123",
    status_ids=["status_pending", "status_in_progress"]
)
```

## Advanced Features

### Pagination

The SDK uses generators for memory-efficient pagination:

```python
# Automatic pagination
sequences = benchling.dna_sequences.list()

# Get estimated total count
total = sequences.estimated_count()
print(f"Total sequences: {total}")

# Iterate through all pages
for page in sequences:
    for seq in page:
        process(seq)

# Manual page size control
sequences = benchling.dna_sequences.list(page_size=50)
```

### Async Task Handling

Some operations are asynchronous and return task IDs:

```python
from benchling_sdk.helpers.tasks import wait_for_task
from benchling_sdk.errors import WaitForTaskExpiredError

# Start async operation
response = benchling.some_bulk_operation(...)
task_id = response.task_id

# Wait for completion
try:
    result = wait_for_task(
        benchling,
        task_id=task_id,
        interval_wait_seconds=2,  # Poll every 2 seconds
        max_wait_seconds=600       # Timeout after 10 minutes
    )
    print("Task completed successfully")
except WaitForTaskExpiredError:
    print("Task timed out")
```

### Error Handling

```python
from benchling_sdk.errors import (
    BenchlingError,
    NotFoundError,
    ValidationError,
    UnauthorizedError
)

try:
    sequence = benchling.dna_sequences.get(sequence_id="seq_invalid")
except NotFoundError:
    print("Sequence not found")
except UnauthorizedError:
    print("Insufficient permissions")
except ValidationError as e:
    print(f"Invalid data: {e}")
except BenchlingError as e:
    print(f"General Benchling error: {e}")
```

### Retry Strategy

Customize retry behavior:

```python
from benchling_sdk.benchling import Benchling
from benchling_sdk.auth.api_key_auth import ApiKeyAuth
from benchling_sdk.retry import RetryStrategy

# Custom retry configuration
retry_strategy = RetryStrategy(
    max_retries=3,
    backoff_factor=0.5,
    status_codes_to_retry=[429, 502, 503, 504]
)

benchling = Benchling(
    url="https://your-tenant.benchling.com",
    auth_method=ApiKeyAuth("your_api_key"),
    retry_strategy=retry_strategy
)

# Disable retries
benchling = Benchling(
    url="https://your-tenant.benchling.com",
    auth_method=ApiKeyAuth("your_api_key"),
    retry_strategy=RetryStrategy(max_retries=0)
)
```

### Custom API Calls

For unsupported endpoints:

```python
# GET request with model parsing
from benchling_sdk.models import DnaSequence

response = benchling.api.get_modeled(
    path="/api/v2/dna-sequences/seq_abc123",
    response_type=DnaSequence
)

# POST request
from benchling_sdk.models import DnaSequenceCreate

response = benchling.api.post_modeled(
    path="/api/v2/dna-sequences",
    request_body=DnaSequenceCreate(...),
    response_type=DnaSequence
)

# Raw requests
raw_response = benchling.api.get(
    path="/api/v2/custom-endpoint",
    params={"key": "value"}
)
```

### Batch Operations

Efficiently process multiple items:

```python
# Bulk create
from benchling_sdk.models import DnaSequenceCreate

sequences_to_create = [
    DnaSequenceCreate(name=f"Seq-{i}", bases="ATCG", folder_id="fld_abc")
    for i in range(100)
]

# Create in batches
batch_size = 10
for i in range(0, len(sequences_to_create), batch_size):
    batch = sequences_to_create[i:i+batch_size]
    for seq in batch:
        benchling.dna_sequences.create(seq)
```

### Schema Fields Helper

Convert dictionaries to Fields objects:

```python
# Using fields helper
fields_dict = {
    "concentration": "100 ng/μL",
    "volume": "50 μL",
    "quality_score": "8.5",
    "date_prepared": "2025-10-20"
}

fields = benchling.models.fields(fields_dict)

# Use in create/update
container = benchling.containers.create(
    ContainerCreate(
        name="Sample-001",
        schema_id="schema_abc",
        fields=fields
    )
)
```

### Forward Compatibility

The SDK handles unknown API values gracefully:

```python
# Unknown enum values are preserved
entity = benchling.dna_sequences.get("seq_abc")
# Even if API returns new enum value not in SDK, it's preserved

# Unknown polymorphic types return UnknownType
from benchling_sdk.models import UnknownType

if isinstance(entity, UnknownType):
    print(f"Unknown type: {entity.type}")
    # Can still access raw data
    print(entity.raw_data)
```

## Best Practices

### Use Type Hints

```python
from benchling_sdk.models import DnaSequence, DnaSequenceCreate
from typing import List

def create_sequences(names: List[str], folder_id: str) -> List[DnaSequence]:
    sequences = []
    for name in names:
        seq = benchling.dna_sequences.create(
            DnaSequenceCreate(
                name=name,
                bases="ATCG",
                folder_id=folder_id
            )
        )
        sequences.append(seq)
    return sequences
```

### Efficient Filtering

Use API filters instead of client-side filtering:

```python
# Good - filter on server
sequences = benchling.dna_sequences.list(
    folder_id="fld_abc123",
    schema_id="ts_abc123"
)

# Bad - loads everything then filters
all_sequences = benchling.dna_sequences.list()
filtered = [s for page in all_sequences for s in page if s.folder_id == "fld_abc123"]
```

### Resource Cleanup

```python
# Archive old entities
cutoff_date = "2024-01-01"
sequences = benchling.dna_sequences.list()

for page in sequences:
    for seq in page:
        if seq.created_at < cutoff_date:
            benchling.dna_sequences.archive(
                sequence_id=seq.id,
                reason="Archiving old sequences"
            )
```

## Troubleshooting

### Common Issues

**Import Errors:**
```python
# Wrong
from benchling_sdk import Benchling  # ImportError

# Correct
from benchling_sdk.benchling import Benchling
```

**Field Validation:**
```python
# Fields must match schema
# Check schema field types in Benchling UI
fields = benchling.models.fields({
    "numeric_field": "123",    # Should be string even for numbers
    "date_field": "2025-10-20", # Format: YYYY-MM-DD
    "dropdown_field": "Option1" # Must match dropdown options exactly
})
```

**Pagination Exhaustion:**
```python
# Generators can only be iterated once
sequences = benchling.dna_sequences.list()
for page in sequences:  # First iteration OK
    pass
for page in sequences:  # Second iteration returns nothing!
    pass

# Solution: Create new generator
sequences = benchling.dna_sequences.list()  # New generator
```

## References

- **SDK Source:** https://github.com/benchling/benchling-sdk
- **SDK Docs:** https://benchling.com/sdk-docs/
- **API Reference:** https://benchling.com/api/reference
- **Common Examples:** https://docs.benchling.com/docs/common-sdk-interactions-and-examples
