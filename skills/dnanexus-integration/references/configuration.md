# DNAnexus App Configuration and Dependencies

## Overview

This guide covers configuring apps through dxapp.json metadata and managing dependencies including system packages, Python libraries, and Docker containers.

## dxapp.json Structure

The `dxapp.json` file is the configuration file for DNAnexus apps and applets. It defines metadata, inputs, outputs, execution requirements, and dependencies.

### Minimal Example

```json
{
  "name": "my-app",
  "title": "My Analysis App",
  "summary": "Performs analysis on input files",
  "dxapi": "1.0.0",
  "version": "1.0.0",
  "inputSpec": [],
  "outputSpec": [],
  "runSpec": {
    "interpreter": "python3",
    "file": "src/my-app.py",
    "distribution": "Ubuntu",
    "release": "24.04"
  }
}
```

## Metadata Fields

### Required Fields

```json
{
  "name": "my-app",           // Unique identifier (lowercase, numbers, hyphens, underscores)
  "title": "My App",          // Human-readable name
  "summary": "One line description",
  "dxapi": "1.0.0"           // API version
}
```

### Optional Metadata

```json
{
  "version": "1.0.0",        // Semantic version (required for apps)
  "description": "Extended description...",
  "developerNotes": "Implementation notes...",
  "categories": [            // For app discovery
    "Read Mapping",
    "Variation Calling"
  ],
  "details": {               // Arbitrary metadata
    "contactEmail": "dev@example.com",
    "upstreamVersion": "2.1.0",
    "citations": ["doi:10.1000/example"],
    "changelog": {
      "1.0.0": "Initial release"
    }
  }
}
```

## Input Specification

Define input parameters:

```json
{
  "inputSpec": [
    {
      "name": "reads",
      "label": "Input reads",
      "class": "file",
      "patterns": ["*.fastq", "*.fastq.gz"],
      "optional": false,
      "help": "FASTQ file containing sequencing reads"
    },
    {
      "name": "quality_threshold",
      "label": "Quality threshold",
      "class": "int",
      "default": 30,
      "optional": true,
      "help": "Minimum base quality score"
    },
    {
      "name": "reference",
      "label": "Reference genome",
      "class": "file",
      "patterns": ["*.fa", "*.fasta"],
      "suggestions": [
        {
          "name": "Human GRCh38",
          "project": "project-xxxx",
          "path": "/references/human_g1k_v37.fasta"
        }
      ]
    }
  ]
}
```

### Input Classes

- `file` - File object
- `record` - Record object
- `applet` - Applet reference
- `string` - Text string
- `int` - Integer number
- `float` - Floating point number
- `boolean` - True/false
- `hash` - Key-value mapping
- `array:class` - Array of specified class

### Input Options

- `name` - Parameter name (required)
- `class` - Data type (required)
- `optional` - Whether parameter is optional (default: false)
- `default` - Default value for optional parameters
- `label` - Display name in UI
- `help` - Description text
- `patterns` - File name patterns (for files)
- `suggestions` - Pre-defined reference data
- `choices` - Allowed values (for strings/numbers)
- `group` - UI grouping

## Output Specification

Define output parameters:

```json
{
  "outputSpec": [
    {
      "name": "aligned_reads",
      "label": "Aligned reads",
      "class": "file",
      "patterns": ["*.bam"],
      "help": "BAM file with aligned reads"
    },
    {
      "name": "mapping_stats",
      "label": "Mapping statistics",
      "class": "record",
      "help": "Record containing alignment statistics"
    }
  ]
}
```

## Run Specification

Define how the app executes:

```json
{
  "runSpec": {
    "interpreter": "python3",        // or "bash"
    "file": "src/my-app.py",         // Entry point script
    "distribution": "Ubuntu",
    "release": "24.04",
    "version": "0",                   // Distribution version
    "execDepends": [                  // System packages
      {"name": "samtools"},
      {"name": "bwa"}
    ],
    "bundledDepends": [              // Bundled resources
      {"name": "scripts.tar.gz", "id": {"$dnanexus_link": "file-xxxx"}}
    ],
    "assetDepends": [                // Asset dependencies
      {"name": "asset-name", "id": {"$dnanexus_link": "record-xxxx"}}
    ],
    "systemRequirements": {
      "*": {
        "instanceType": "mem2_ssd1_v2_x4"
      }
    },
    "headJobOnDemand": true,
    "restartableEntryPoints": ["main"]
  }
}
```

## System Requirements

### Instance Type Selection

```json
{
  "systemRequirements": {
    "main": {
      "instanceType": "mem2_ssd1_v2_x8"
    },
    "process": {
      "instanceType": "mem3_ssd1_v2_x16"
    }
  }
}
```

**Common instance types**:
- `mem1_ssd1_v2_x2` - 2 cores, 3.9 GB RAM
- `mem1_ssd1_v2_x4` - 4 cores, 7.8 GB RAM
- `mem2_ssd1_v2_x4` - 4 cores, 15.6 GB RAM
- `mem2_ssd1_v2_x8` - 8 cores, 31.2 GB RAM
- `mem3_ssd1_v2_x8` - 8 cores, 62.5 GB RAM
- `mem3_ssd1_v2_x16` - 16 cores, 125 GB RAM

### Cluster Specifications

For distributed computing:

```json
{
  "systemRequirements": {
    "main": {
      "clusterSpec": {
        "type": "spark",
        "version": "3.1.2",
        "initialInstanceCount": 3,
        "instanceType": "mem1_ssd1_v2_x4",
        "bootstrapScript": "bootstrap.sh"
      }
    }
  }
}
```

## Regional Options

Deploy apps across regions:

```json
{
  "regionalOptions": {
    "aws:us-east-1": {
      "systemRequirements": {
        "*": {"instanceType": "mem2_ssd1_v2_x4"}
      },
      "assetDepends": [
        {"id": "record-xxxx"}
      ]
    },
    "azure:westus": {
      "systemRequirements": {
        "*": {"instanceType": "azure:mem2_ssd1_x4"}
      }
    }
  }
}
```

## Dependency Management

### System Packages (execDepends)

Install Ubuntu packages at runtime:

```json
{
  "runSpec": {
    "execDepends": [
      {"name": "samtools"},
      {"name": "bwa"},
      {"name": "python3-pip"},
      {"name": "r-base", "version": "4.0.0"}
    ]
  }
}
```

Packages are installed using `apt-get` from Ubuntu repositories.

### Python Dependencies

#### Option 1: Install via pip in execDepends

```json
{
  "runSpec": {
    "execDepends": [
      {"name": "python3-pip"}
    ]
  }
}
```

Then in your app script:
```python
import subprocess
subprocess.check_call(["pip", "install", "numpy==1.24.0", "pandas==2.0.0"])
```

#### Option 2: Requirements file

Create `resources/requirements.txt`:
```
numpy==1.24.0
pandas==2.0.0
scikit-learn==1.3.0
```

In your app:
```python
subprocess.check_call(["pip", "install", "-r", "requirements.txt"])
```

### Bundled Dependencies

Include custom tools or libraries in the app:

**File structure**:
```
my-app/
├── dxapp.json
├── src/
│   └── my-app.py
└── resources/
    ├── tools/
    │   └── custom_tool
    └── scripts/
        └── helper.py
```

Access resources in app:
```python
import os

# Resources are in parent directory
resources_dir = os.path.join(os.path.dirname(__file__), "..", "resources")
tool_path = os.path.join(resources_dir, "tools", "custom_tool")

# Run bundled tool
subprocess.check_call([tool_path, "arg1", "arg2"])
```

### Asset Dependencies

Assets are pre-built bundles of dependencies that can be shared across apps.

#### Using Assets

```json
{
  "runSpec": {
    "assetDepends": [
      {
        "name": "bwa-asset",
        "id": {"$dnanexus_link": "record-xxxx"}
      }
    ]
  }
}
```

Assets are mounted at runtime and accessible via environment variable:
```python
import os
asset_dir = os.environ.get("DX_ASSET_BWA")
bwa_path = os.path.join(asset_dir, "bin", "bwa")
```

#### Creating Assets

Create asset directory:
```bash
mkdir bwa-asset
cd bwa-asset
# Install software
./configure --prefix=$PWD/usr/local
make && make install
```

Build asset:
```bash
dx build_asset bwa-asset --destination=project-xxxx:/assets/
```

## Docker Integration

### Using Docker Images

```json
{
  "runSpec": {
    "interpreter": "python3",
    "file": "src/my-app.py",
    "distribution": "Ubuntu",
    "release": "24.04",
    "systemRequirements": {
      "*": {
        "instanceType": "mem2_ssd1_v2_x4"
      }
    },
    "execDepends": [
      {"name": "docker.io"}
    ]
  }
}
```

Use Docker in app:
```python
import subprocess

# Pull Docker image
subprocess.check_call(["docker", "pull", "biocontainers/samtools:v1.9"])

# Run command in container
subprocess.check_call([
    "docker", "run",
    "-v", f"{os.getcwd()}:/data",
    "biocontainers/samtools:v1.9",
    "samtools", "view", "/data/input.bam"
])
```

### Docker as Base Image

For apps that run entirely in Docker:

```json
{
  "runSpec": {
    "interpreter": "bash",
    "file": "src/wrapper.sh",
    "distribution": "Ubuntu",
    "release": "24.04",
    "execDepends": [
      {"name": "docker.io"}
    ]
  }
}
```

## Access Requirements

Request special permissions:

```json
{
  "access": {
    "network": ["*"],           // Internet access
    "project": "CONTRIBUTE",    // Project write access
    "allProjects": "VIEW",      // Read other projects
    "developer": true           // Advanced permissions
  }
}
```

**Network access**:
- `["*"]` - Full internet
- `["github.com", "pypi.org"]` - Specific domains

## Timeout Configuration

```json
{
  "runSpec": {
    "timeoutPolicy": {
      "*": {
        "days": 1,
        "hours": 12,
        "minutes": 30
      }
    }
  }
}
```

## Example: Complete dxapp.json

```json
{
  "name": "rna-seq-pipeline",
  "title": "RNA-Seq Analysis Pipeline",
  "summary": "Aligns RNA-seq reads and quantifies gene expression",
  "description": "Comprehensive RNA-seq pipeline using STAR aligner and featureCounts",
  "version": "1.0.0",
  "dxapi": "1.0.0",
  "categories": ["Read Mapping", "RNA-Seq"],

  "inputSpec": [
    {
      "name": "reads",
      "label": "FASTQ reads",
      "class": "array:file",
      "patterns": ["*.fastq.gz", "*.fq.gz"],
      "help": "Single-end or paired-end RNA-seq reads"
    },
    {
      "name": "reference_genome",
      "label": "Reference genome",
      "class": "file",
      "patterns": ["*.fa", "*.fasta"],
      "suggestions": [
        {
          "name": "Human GRCh38",
          "project": "project-reference",
          "path": "/genomes/GRCh38.fa"
        }
      ]
    },
    {
      "name": "gtf_file",
      "label": "Gene annotation (GTF)",
      "class": "file",
      "patterns": ["*.gtf", "*.gtf.gz"]
    }
  ],

  "outputSpec": [
    {
      "name": "aligned_bam",
      "label": "Aligned reads (BAM)",
      "class": "file",
      "patterns": ["*.bam"]
    },
    {
      "name": "counts",
      "label": "Gene counts",
      "class": "file",
      "patterns": ["*.counts.txt"]
    },
    {
      "name": "qc_report",
      "label": "QC report",
      "class": "file",
      "patterns": ["*.html"]
    }
  ],

  "runSpec": {
    "interpreter": "python3",
    "file": "src/rna-seq-pipeline.py",
    "distribution": "Ubuntu",
    "release": "24.04",

    "execDepends": [
      {"name": "python3-pip"},
      {"name": "samtools"},
      {"name": "subread"}
    ],

    "assetDepends": [
      {
        "name": "star-aligner",
        "id": {"$dnanexus_link": "record-star-asset"}
      }
    ],

    "systemRequirements": {
      "main": {
        "instanceType": "mem3_ssd1_v2_x16"
      }
    },

    "timeoutPolicy": {
      "*": {"hours": 8}
    }
  },

  "access": {
    "network": ["*"]
  },

  "details": {
    "contactEmail": "support@example.com",
    "upstreamVersion": "STAR 2.7.10a, Subread 2.0.3",
    "citations": ["doi:10.1093/bioinformatics/bts635"]
  }
}
```

## Best Practices

1. **Version Management**: Use semantic versioning for apps
2. **Instance Type**: Start with smaller instances, scale up as needed
3. **Dependencies**: Document all dependencies clearly
4. **Error Messages**: Provide helpful error messages for invalid inputs
5. **Testing**: Test with various input types and sizes
6. **Documentation**: Write clear descriptions and help text
7. **Resources**: Bundle frequently-used tools to avoid repeated downloads
8. **Docker**: Use Docker for complex dependency chains
9. **Assets**: Create assets for heavy dependencies shared across apps
10. **Timeouts**: Set reasonable timeouts based on expected runtime
11. **Network Access**: Request only necessary network permissions
12. **Region Support**: Use regionalOptions for multi-region apps

## Common Patterns

### Bioinformatics Tool

```json
{
  "inputSpec": [
    {"name": "input_file", "class": "file", "patterns": ["*.bam"]},
    {"name": "threads", "class": "int", "default": 4, "optional": true}
  ],
  "runSpec": {
    "execDepends": [{"name": "tool-name"}],
    "systemRequirements": {
      "main": {"instanceType": "mem2_ssd1_v2_x8"}
    }
  }
}
```

### Python Data Analysis

```json
{
  "runSpec": {
    "interpreter": "python3",
    "execDepends": [
      {"name": "python3-pip"}
    ],
    "systemRequirements": {
      "main": {"instanceType": "mem2_ssd1_v2_x4"}
    }
  }
}
```

### Docker-based App

```json
{
  "runSpec": {
    "interpreter": "bash",
    "execDepends": [
      {"name": "docker.io"}
    ],
    "systemRequirements": {
      "main": {"instanceType": "mem2_ssd1_v2_x8"}
    }
  },
  "access": {
    "network": ["*"]
  }
}
```
