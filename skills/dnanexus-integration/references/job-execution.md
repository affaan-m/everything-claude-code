# DNAnexus Job Execution and Workflows

## Overview

Jobs are the fundamental execution units on DNAnexus. When an applet or app runs, a job is created and executed on a worker node in an isolated Linux environment with constant API access.

## Job Types

### Origin Jobs
Initially created by users or automated systems.

### Master Jobs
Result from directly launching an executable (app/applet).

### Child Jobs
Spawned by parent jobs for parallel processing or sub-workflows.

## Running Jobs

### Running an Applet

**Basic execution**:
```python
import dxpy

# Run an applet
job = dxpy.DXApplet("applet-xxxx").run({
    "input1": {"$dnanexus_link": "file-yyyy"},
    "input2": "parameter_value"
})

print(f"Job ID: {job.get_id()}")
```

**Using command line**:
```bash
dx run applet-xxxx -i input1=file-yyyy -i input2="value"
```

### Running an App

```python
# Run an app by name
job = dxpy.DXApp(name="my-app").run({
    "reads": {"$dnanexus_link": "file-xxxx"},
    "quality_threshold": 30
})
```

### Specifying Execution Parameters

```python
job = dxpy.DXApplet("applet-xxxx").run(
    applet_input={
        "input_file": {"$dnanexus_link": "file-yyyy"}
    },
    project="project-zzzz",  # Output project
    folder="/results",        # Output folder
    name="My Analysis Job",   # Job name
    instance_type="mem2_hdd2_x4",  # Override instance type
    priority="high"           # Job priority
)
```

## Job Monitoring

### Checking Job Status

```python
job = dxpy.DXJob("job-xxxx")
state = job.describe()["state"]

# States: idle, waiting_on_input, runnable, running, done, failed, terminated
print(f"Job state: {state}")
```

**Using command line**:
```bash
dx watch job-xxxx
```

### Waiting for Job Completion

```python
# Block until job completes
job.wait_on_done()

# Check if successful
if job.describe()["state"] == "done":
    output = job.describe()["output"]
    print(f"Job completed: {output}")
else:
    print("Job failed")
```

### Getting Job Output

```python
job = dxpy.DXJob("job-xxxx")

# Wait for completion
job.wait_on_done()

# Get outputs
output = job.describe()["output"]
output_file_id = output["result_file"]["$dnanexus_link"]

# Download result
dxpy.download_dxfile(output_file_id, "result.txt")
```

### Job Output References

Create references to job outputs before they complete:

```python
# Launch first job
job1 = dxpy.DXApplet("applet-1").run({"input": "..."})

# Launch second job using output reference
job2 = dxpy.DXApplet("applet-2").run({
    "input": dxpy.dxlink(job1.get_output_ref("output_name"))
})
```

## Job Logs

### Viewing Logs

**Command line**:
```bash
dx watch job-xxxx --get-streams
```

**Programmatically**:
```python
import sys

# Get job logs
job = dxpy.DXJob("job-xxxx")
log = dxpy.api.job_get_log(job.get_id())

for log_entry in log["loglines"]:
    print(log_entry)
```

## Parallel Execution

### Creating Subjobs

```python
@dxpy.entry_point('main')
def main(input_files):
    # Create subjobs for parallel processing
    subjobs = []

    for input_file in input_files:
        subjob = dxpy.new_dxjob(
            fn_input={"file": input_file},
            fn_name="process_file"
        )
        subjobs.append(subjob)

    # Collect results
    results = []
    for subjob in subjobs:
        result = subjob.get_output_ref("processed_file")
        results.append(result)

    return {"all_results": results}

@dxpy.entry_point('process_file')
def process_file(file):
    # Process single file
    # ...
    return {"processed_file": output_file}
```

### Scatter-Gather Pattern

```python
# Scatter: Process items in parallel
scatter_jobs = []
for item in items:
    job = dxpy.new_dxjob(
        fn_input={"item": item},
        fn_name="process_item"
    )
    scatter_jobs.append(job)

# Gather: Combine results
gather_job = dxpy.new_dxjob(
    fn_input={
        "results": [job.get_output_ref("result") for job in scatter_jobs]
    },
    fn_name="combine_results"
)
```

## Workflows

Workflows combine multiple apps/applets into multi-step pipelines.

### Creating a Workflow

```python
# Create workflow
workflow = dxpy.new_dxworkflow(
    name="My Analysis Pipeline",
    project="project-xxxx"
)

# Add stages
stage1 = workflow.add_stage(
    dxpy.DXApplet("applet-1"),
    name="Quality Control",
    folder="/qc"
)

stage2 = workflow.add_stage(
    dxpy.DXApplet("applet-2"),
    name="Alignment",
    folder="/alignment"
)

# Connect stages
stage2.set_input("reads", stage1.get_output_ref("filtered_reads"))

# Close workflow
workflow.close()
```

### Running a Workflow

```python
# Run workflow
analysis = workflow.run({
    "stage-xxxx.input1": {"$dnanexus_link": "file-yyyy"}
})

# Monitor analysis (collection of jobs)
analysis.wait_on_done()

# Get workflow outputs
outputs = analysis.describe()["output"]
```

**Using command line**:
```bash
dx run workflow-xxxx -i stage-1.input=file-yyyy
```

## Job Permissions and Context

### Workspace Context

Jobs run in a workspace project with cloned input data:
- Jobs require `CONTRIBUTE` permission to workspace
- Jobs need `VIEW` access to source projects
- All charges accumulate to the originating project

### Data Requirements

Jobs cannot start until:
1. All input data objects are in `closed` state
2. Required permissions are available
3. Resources are allocated

Output objects must reach `closed` state before workspace cleanup.

## Job Lifecycle

```
Created → Waiting on Input → Runnable → Running → Done/Failed
```

**States**:
- `idle`: Job created but not yet queued
- `waiting_on_input`: Waiting for input data objects to close
- `runnable`: Ready to run, waiting for resources
- `running`: Currently executing
- `done`: Completed successfully
- `failed`: Execution failed
- `terminated`: Manually stopped

## Error Handling

### Job Failure

```python
job = dxpy.DXJob("job-xxxx")
job.wait_on_done()

desc = job.describe()
if desc["state"] == "failed":
    print(f"Job failed: {desc.get('failureReason', 'Unknown')}")
    print(f"Failure message: {desc.get('failureMessage', '')}")
```

### Retry Failed Jobs

```python
# Rerun failed job
new_job = dxpy.DXApplet(desc["applet"]).run(
    desc["originalInput"],
    project=desc["project"]
)
```

### Terminating Jobs

```python
# Stop a running job
job = dxpy.DXJob("job-xxxx")
job.terminate()
```

**Using command line**:
```bash
dx terminate job-xxxx
```

## Resource Management

### Instance Types

Specify computational resources:

```python
# Run with specific instance type
job = dxpy.DXApplet("applet-xxxx").run(
    {"input": "..."},
    instance_type="mem3_ssd1_v2_x8"  # 8 cores, high memory, SSD
)
```

Common instance types:
- `mem1_ssd1_v2_x4` - 4 cores, standard memory
- `mem2_ssd1_v2_x8` - 8 cores, high memory
- `mem3_ssd1_v2_x16` - 16 cores, very high memory
- `mem1_ssd1_v2_x36` - 36 cores for parallel workloads

### Timeout Settings

Set maximum execution time:

```python
job = dxpy.DXApplet("applet-xxxx").run(
    {"input": "..."},
    timeout="24h"  # Maximum runtime
)
```

## Job Tagging and Metadata

### Add Job Tags

```python
job = dxpy.DXApplet("applet-xxxx").run(
    {"input": "..."},
    tags=["experiment1", "batch2", "production"]
)
```

### Add Job Properties

```python
job = dxpy.DXApplet("applet-xxxx").run(
    {"input": "..."},
    properties={
        "experiment": "exp001",
        "sample": "sample1",
        "batch": "batch2"
    }
)
```

### Finding Jobs

```python
# Find jobs by tag
jobs = dxpy.find_jobs(
    project="project-xxxx",
    tags=["experiment1"],
    describe=True
)

for job in jobs:
    print(f"{job['describe']['name']}: {job['id']}")
```

## Best Practices

1. **Job Naming**: Use descriptive names for easier tracking
2. **Tags and Properties**: Tag jobs for organization and searchability
3. **Resource Selection**: Choose appropriate instance types for workload
4. **Error Handling**: Check job state and handle failures gracefully
5. **Parallel Processing**: Use subjobs for independent parallel tasks
6. **Workflows**: Use workflows for complex multi-step analyses
7. **Monitoring**: Monitor long-running jobs and check logs for issues
8. **Cost Management**: Use appropriate instance types to balance cost/performance
9. **Timeouts**: Set reasonable timeouts to prevent runaway jobs
10. **Cleanup**: Remove failed or obsolete jobs

## Debugging Tips

1. **Check Logs**: Always review job logs for error messages
2. **Verify Inputs**: Ensure input files are closed and accessible
3. **Test Locally**: Test logic locally before deploying to platform
4. **Start Small**: Test with small datasets before scaling up
5. **Monitor Resources**: Check if job is running out of memory or disk space
6. **Instance Type**: Try larger instance if job fails due to resources
