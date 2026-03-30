# Data Management

## Overview
Latch provides comprehensive data management through cloud storage abstractions (LatchFile, LatchDir) and a structured Registry system for organizing experimental data.

## Cloud Storage: LatchFile and LatchDir

### LatchFile

Represents a file in Latch's cloud storage system.

```python
from latch.types import LatchFile

# Create reference to existing file
input_file = LatchFile("latch:///data/sample.fastq")

# Access file properties
file_path = input_file.local_path  # Local path when executing
file_remote = input_file.remote_path  # Cloud storage path
```

### LatchDir

Represents a directory in Latch's cloud storage system.

```python
from latch.types import LatchDir

# Create reference to directory
output_dir = LatchDir("latch:///results/experiment_1")

# Directory operations
all_files = output_dir.glob("*.bam")  # Find files matching pattern
subdirs = output_dir.iterdir()  # List contents
```

### Path Formats

Latch storage uses a special URL scheme:
- **Latch paths**: `latch:///path/to/file`
- **Local paths**: Automatically resolved during workflow execution
- **S3 paths**: Can be used directly if configured

### File Transfer

Files are automatically transferred between local execution and cloud storage:

```python
from latch import small_task
from latch.types import LatchFile

@small_task
def process_file(input_file: LatchFile) -> LatchFile:
    # File is automatically downloaded to local execution
    local_path = input_file.local_path

    # Process the file
    with open(local_path, 'r') as f:
        data = f.read()

    # Write output
    output_path = "output.txt"
    with open(output_path, 'w') as f:
        f.write(processed_data)

    # Automatically uploaded back to cloud storage
    return LatchFile(output_path, "latch:///results/output.txt")
```

### Glob Patterns

Find files using pattern matching:

```python
from latch.types import LatchDir

data_dir = LatchDir("latch:///data")

# Find all FASTQ files
fastq_files = data_dir.glob("**/*.fastq")

# Find files in subdirectories
bam_files = data_dir.glob("alignments/**/*.bam")

# Multiple patterns
results = data_dir.glob("*.{bam,sam}")
```

## Registry System

The Registry provides structured data organization with projects, tables, and records.

### Registry Architecture

```
Account/Workspace
└── Projects
    └── Tables
        └── Records
```

### Working with Projects

```python
from latch.registry.project import Project

# Get or create a project
project = Project.create(
    name="RNA-seq Analysis",
    description="Bulk RNA-seq experiments"
)

# List existing projects
all_projects = Project.list()

# Get project by ID
project = Project.get(project_id="proj_123")
```

### Working with Tables

Tables store structured data records:

```python
from latch.registry.table import Table

# Create a table
table = Table.create(
    project_id=project.id,
    name="Samples",
    columns=[
        {"name": "sample_id", "type": "string"},
        {"name": "condition", "type": "string"},
        {"name": "replicate", "type": "number"},
        {"name": "fastq_file", "type": "file"}
    ]
)

# List tables in project
tables = Table.list(project_id=project.id)

# Get table by ID
table = Table.get(table_id="tbl_456")
```

### Column Types

Supported data types:
- `string` - Text data
- `number` - Numeric values (integer or float)
- `boolean` - True/False values
- `date` - Date values
- `file` - LatchFile references
- `directory` - LatchDir references
- `link` - References to records in other tables
- `enum` - Enumerated values from predefined list

### Working with Records

```python
from latch.registry.record import Record

# Create a record
record = Record.create(
    table_id=table.id,
    values={
        "sample_id": "S001",
        "condition": "treated",
        "replicate": 1,
        "fastq_file": LatchFile("latch:///data/S001.fastq")
    }
)

# Bulk create records
records = Record.bulk_create(
    table_id=table.id,
    records=[
        {"sample_id": "S001", "condition": "treated"},
        {"sample_id": "S002", "condition": "control"}
    ]
)

# Query records
all_records = Record.list(table_id=table.id)
filtered = Record.list(
    table_id=table.id,
    filter={"condition": "treated"}
)

# Update record
record.update(values={"replicate": 2})

# Delete record
record.delete()
```

### Linked Records

Create relationships between tables:

```python
# Define table with link column
results_table = Table.create(
    project_id=project.id,
    name="Results",
    columns=[
        {"name": "sample", "type": "link", "target_table": samples_table.id},
        {"name": "alignment_bam", "type": "file"},
        {"name": "gene_counts", "type": "file"}
    ]
)

# Create record with link
result_record = Record.create(
    table_id=results_table.id,
    values={
        "sample": sample_record.id,  # Link to sample record
        "alignment_bam": LatchFile("latch:///results/aligned.bam"),
        "gene_counts": LatchFile("latch:///results/counts.tsv")
    }
)

# Access linked data
sample_data = result_record.values["sample"].resolve()
```

### Enum Columns

Define columns with predefined values:

```python
table = Table.create(
    project_id=project.id,
    name="Experiments",
    columns=[
        {
            "name": "status",
            "type": "enum",
            "options": ["pending", "running", "completed", "failed"]
        }
    ]
)
```

### Transactions and Bulk Updates

Efficiently update multiple records:

```python
from latch.registry.transaction import Transaction

# Start transaction
with Transaction() as txn:
    for record in records:
        record.update(values={"status": "processed"}, transaction=txn)
    # Changes committed when exiting context
```

## Integration with Workflows

### Using Registry in Workflows

```python
from latch import workflow, small_task
from latch.types import LatchFile
from latch.registry.table import Table
from latch.registry.record import Record

@small_task
def process_and_save(sample_id: str, table_id: str) -> str:
    # Get sample from registry
    table = Table.get(table_id=table_id)
    records = Record.list(
        table_id=table_id,
        filter={"sample_id": sample_id}
    )
    sample = records[0]

    # Process file
    input_file = sample.values["fastq_file"]
    # ... processing logic ...

    # Save results back to registry
    sample.update(values={
        "status": "completed",
        "results_file": output_file
    })

    return "Success"

@workflow
def registry_workflow(sample_id: str, table_id: str):
    """Workflow integrated with Registry"""
    return process_and_save(sample_id=sample_id, table_id=table_id)
```

### Automatic Workflow Execution on Data

Configure workflows to run automatically when data is added to Registry folders:

```python
from latch.resources.launch_plan import LaunchPlan

# Create launch plan that watches a folder
launch_plan = LaunchPlan.create(
    workflow_name="rnaseq_pipeline",
    name="auto_process",
    trigger_folder="latch:///incoming_data",
    default_inputs={
        "output_dir": "latch:///results"
    }
)
```

## Account and Workspace Management

### Account Information

```python
from latch.account import Account

# Get current account
account = Account.current()

# Account properties
workspace_id = account.id
workspace_name = account.name
```

### Team Workspaces

Access shared team workspaces:

```python
# List available workspaces
workspaces = Account.list()

# Switch workspace
Account.set_current(workspace_id="ws_789")
```

## Functions for Data Operations

### Joining Data

The `latch.functions` module provides data manipulation utilities:

```python
from latch.functions import left_join, inner_join, outer_join, right_join

# Join tables
combined = left_join(
    left_table=table1,
    right_table=table2,
    on="sample_id"
)
```

### Filtering

```python
from latch.functions import filter_records

# Filter records
filtered = filter_records(
    table=table,
    condition=lambda record: record["replicate"] > 1
)
```

### Secrets Management

Store and retrieve secrets securely:

```python
from latch.functions import get_secret

# Retrieve secret in workflow
api_key = get_secret("api_key")
```

## Best Practices

1. **Path Organization**: Use consistent folder structure (e.g., `/data`, `/results`, `/logs`)
2. **Registry Schema**: Define table schemas before bulk data entry
3. **Linked Records**: Use links to maintain relationships between experiments
4. **Bulk Operations**: Use transactions for updating multiple records
5. **File Naming**: Use consistent, descriptive file naming conventions
6. **Metadata**: Store experimental metadata in Registry for traceability
7. **Validation**: Validate data types when creating records
8. **Cleanup**: Regularly archive or delete unused data

## Common Patterns

### Sample Tracking

```python
# Create samples table
samples = Table.create(
    project_id=project.id,
    name="Samples",
    columns=[
        {"name": "sample_id", "type": "string"},
        {"name": "collection_date", "type": "date"},
        {"name": "raw_fastq_r1", "type": "file"},
        {"name": "raw_fastq_r2", "type": "file"},
        {"name": "status", "type": "enum", "options": ["pending", "processing", "complete"]}
    ]
)
```

### Results Organization

```python
# Create results table linked to samples
results = Table.create(
    project_id=project.id,
    name="Analysis Results",
    columns=[
        {"name": "sample", "type": "link", "target_table": samples.id},
        {"name": "alignment_bam", "type": "file"},
        {"name": "variants_vcf", "type": "file"},
        {"name": "qc_metrics", "type": "file"}
    ]
)
```
