# Workflow Creation and Registration

## Overview
The Latch SDK enables defining serverless bioinformatics workflows using Python decorators and deploying them with automatic containerization and UI generation.

## Installation

Install the Latch SDK:
```bash
python3 -m pip install latch
```

**Prerequisites:**
- Docker must be installed and running locally
- Latch account credentials

## Initializing a New Workflow

Create a new workflow template:
```bash
latch init <workflow-name>
```

This generates a workflow directory with:
- `wf/__init__.py` - Main workflow definition
- `Dockerfile` - Container configuration
- `version` - Version tracking file

## Workflow Definition Structure

### Basic Workflow Example

```python
from latch import workflow
from latch.types import LatchFile, LatchDir

@workflow
def my_workflow(input_file: LatchFile, output_dir: LatchDir) -> LatchFile:
    """
    Workflow description that appears in the UI

    Args:
        input_file: Input file description
        output_dir: Output directory description
    """
    return process_task(input_file, output_dir)
```

### Task Definition

Tasks are the individual computation steps within workflows:

```python
from latch import small_task, large_task

@small_task
def process_task(input_file: LatchFile, output_dir: LatchDir) -> LatchFile:
    """Task-level computation"""
    # Processing logic here
    return output_file
```

### Task Resource Decorators

The SDK provides multiple task decorators for different resource requirements:

- `@small_task` - Default resources for lightweight tasks
- `@large_task` - Increased memory and CPU
- `@small_gpu_task` - GPU-enabled tasks with minimal resources
- `@large_gpu_task` - GPU-enabled tasks with maximum resources
- `@custom_task` - Custom resource specifications

## Registering Workflows

Register the workflow to the Latch platform:
```bash
latch register <workflow-directory>
```

The registration process:
1. Builds Docker container with all dependencies
2. Serializes workflow code
3. Uploads container to registry
4. Generates no-code UI automatically
5. Makes workflow available on the platform

### Registration Output

Upon successful registration:
- Workflow appears in Latch workspace
- Automatic UI is generated with parameter forms
- Version is tracked and containerized
- Workflow can be executed immediately

## Supporting Multiple Pipeline Languages

Latch supports uploading existing pipelines in:
- **Python** - Native Latch SDK workflows
- **Nextflow** - Import existing Nextflow pipelines
- **Snakemake** - Import existing Snakemake pipelines

### Nextflow Integration

Import Nextflow pipelines:
```bash
latch register --nextflow <nextflow-directory>
```

### Snakemake Integration

Import Snakemake pipelines:
```bash
latch register --snakemake <snakemake-directory>
```

## Workflow Execution

### From CLI

Execute a registered workflow:
```bash
latch execute <workflow-name> --input-file <path> --output-dir <path>
```

### From Python

Execute workflows programmatically:
```python
from latch.account import Account
from latch.executions import execute_workflow

account = Account.current()
execution = execute_workflow(
    workflow_name="my_workflow",
    parameters={
        "input_file": "/path/to/file",
        "output_dir": "/path/to/output"
    }
)
```

## Launch Plans

Launch plans define preset parameter configurations:

```python
from latch.resources.launch_plan import LaunchPlan

# Define a launch plan with preset parameters
launch_plan = LaunchPlan.create(
    workflow_name="my_workflow",
    name="default_config",
    default_inputs={
        "input_file": "/data/sample.fastq",
        "output_dir": "/results"
    }
)
```

## Conditional Sections

Create dynamic UIs with conditional parameter sections:

```python
from latch.types import LatchParameter
from latch.resources.conditional import conditional_section

@workflow
def my_workflow(
    mode: str,
    advanced_param: str = conditional_section(
        condition=lambda inputs: inputs.mode == "advanced"
    )
):
    """Workflow with conditional parameters"""
    pass
```

## Best Practices

1. **Type Annotations**: Always use type hints for workflow parameters
2. **Docstrings**: Provide clear docstrings - they populate the UI descriptions
3. **Version Control**: Use semantic versioning for workflow updates
4. **Testing**: Test workflows locally before registration
5. **Resource Sizing**: Start with smaller resource decorators and scale up as needed
6. **Modular Design**: Break complex workflows into reusable tasks
7. **Error Handling**: Implement proper error handling in tasks
8. **Logging**: Use Python logging for debugging and monitoring

## Common Patterns

### Multi-Step Pipeline

```python
from latch import workflow, small_task
from latch.types import LatchFile

@small_task
def quality_control(input_file: LatchFile) -> LatchFile:
    """QC step"""
    return qc_output

@small_task
def alignment(qc_file: LatchFile) -> LatchFile:
    """Alignment step"""
    return aligned_output

@workflow
def rnaseq_pipeline(input_fastq: LatchFile) -> LatchFile:
    """RNA-seq analysis pipeline"""
    qc_result = quality_control(input_file=input_fastq)
    aligned = alignment(qc_file=qc_result)
    return aligned
```

### Parallel Processing

```python
from typing import List
from latch import workflow, small_task, map_task
from latch.types import LatchFile

@small_task
def process_sample(sample: LatchFile) -> LatchFile:
    """Process individual sample"""
    return processed_sample

@workflow
def batch_pipeline(samples: List[LatchFile]) -> List[LatchFile]:
    """Process multiple samples in parallel"""
    return map_task(process_sample)(sample=samples)
```

## Troubleshooting

### Common Issues

1. **Docker not running**: Ensure Docker daemon is active
2. **Authentication errors**: Run `latch login` to refresh credentials
3. **Build failures**: Check Dockerfile for missing dependencies
4. **Type errors**: Ensure all parameters have proper type annotations

### Debug Mode

Enable verbose logging during registration:
```bash
latch register --verbose <workflow-directory>
```

## References

- Official Documentation: https://docs.latch.bio
- GitHub Repository: https://github.com/latchbio/latch
- Slack Community: https://join.slack.com/t/latchbiosdk
