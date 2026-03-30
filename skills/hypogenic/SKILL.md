---
name: hypogenic
description: Automated LLM-driven hypothesis generation and testing on tabular datasets. Use when you want to systematically explore hypotheses about patterns in empirical data (e.g., deception detection, content analysis). Combines literature insights with data-driven hypothesis testing. For manual hypothesis formulation use hypothesis-generation; for creative ideation use scientific-brainstorming.
license: MIT license
metadata:
    skill-author: K-Dense Inc.
---

# Hypogenic

## Overview

Hypogenic provides automated hypothesis generation and testing using large language models to accelerate scientific discovery. The framework supports three approaches: HypoGeniC (data-driven hypothesis generation), HypoRefine (synergistic literature and data integration), and Union methods (mechanistic combination of literature and data-driven hypotheses).

## Quick Start

Get started with Hypogenic in minutes:

```bash
# Install the package
uv pip install hypogenic

# Clone example datasets
git clone https://github.com/ChicagoHAI/HypoGeniC-datasets.git ./data

# Run basic hypothesis generation
hypogenic_generation --config ./data/your_task/config.yaml --method hypogenic --num_hypotheses 20

# Run inference on generated hypotheses
hypogenic_inference --config ./data/your_task/config.yaml --hypotheses output/hypotheses.json
```

**Or use Python API:**

```python
from hypogenic import BaseTask

# Create task with your configuration
task = BaseTask(config_path="./data/your_task/config.yaml")

# Generate hypotheses
task.generate_hypotheses(method="hypogenic", num_hypotheses=20)

# Run inference
results = task.inference(hypothesis_bank="./output/hypotheses.json")
```

## When to Use This Skill

Use this skill when working on:
- Generating scientific hypotheses from observational datasets
- Testing multiple competing hypotheses systematically
- Combining literature insights with empirical patterns
- Accelerating research discovery through automated hypothesis ideation
- Domains requiring hypothesis-driven analysis: deception detection, AI-generated content identification, mental health indicators, predictive modeling, or other empirical research

## Key Features

**Automated Hypothesis Generation**
- Generate 10-20+ testable hypotheses from data in minutes
- Iterative refinement based on validation performance
- Support for both API-based (OpenAI, Anthropic) and local LLMs

**Literature Integration**
- Extract insights from research papers via PDF processing
- Combine theoretical foundations with empirical patterns
- Systematic literature-to-hypothesis pipeline with GROBID

**Performance Optimization**
- Redis caching reduces API costs for repeated experiments
- Parallel processing for large-scale hypothesis testing
- Adaptive refinement focuses on challenging examples

**Flexible Configuration**
- Template-based prompt engineering with variable injection
- Custom label extraction for domain-specific tasks
- Modular architecture for easy extension

**Proven Results**
- 8.97% improvement over few-shot baselines
- 15.75% improvement over literature-only approaches
- 80-84% hypothesis diversity (non-redundant insights)
- Human evaluators report significant decision-making improvements

## Core Capabilities

### 1. HypoGeniC: Data-Driven Hypothesis Generation

Generate hypotheses solely from observational data through iterative refinement.

**Process:**
1. Initialize with a small data subset to generate candidate hypotheses
2. Iteratively refine hypotheses based on performance
3. Replace poorly-performing hypotheses with new ones from challenging examples

**Best for:** Exploratory research without existing literature, pattern discovery in novel datasets

### 2. HypoRefine: Literature and Data Integration

Synergistically combine existing literature with empirical data through an agentic framework.

**Process:**
1. Extract insights from relevant research papers (typically 10 papers)
2. Generate theory-grounded hypotheses from literature
3. Generate data-driven hypotheses from observational patterns
4. Refine both hypothesis banks through iterative improvement

**Best for:** Research with established theoretical foundations, validating or extending existing theories

### 3. Union Methods

Mechanistically combine literature-only hypotheses with framework outputs.

**Variants:**
- **Literature ∪ HypoGeniC**: Combines literature hypotheses with data-driven generation
- **Literature ∪ HypoRefine**: Combines literature hypotheses with integrated approach

**Best for:** Comprehensive hypothesis coverage, eliminating redundancy while maintaining diverse perspectives

## Installation

Install via pip:
```bash
uv pip install hypogenic
```

**Optional dependencies:**
- **Redis server** (port 6832): Enables caching of LLM responses to significantly reduce API costs during iterative hypothesis generation
- **s2orc-doc2json**: Required for processing literature PDFs in HypoRefine workflows
- **GROBID**: Required for PDF preprocessing (see Literature Processing section)

**Clone example datasets:**
```bash
# For HypoGeniC examples
git clone https://github.com/ChicagoHAI/HypoGeniC-datasets.git ./data

# For HypoRefine/Union examples
git clone https://github.com/ChicagoHAI/Hypothesis-agent-datasets.git ./data
```

## Dataset Format

Datasets must follow HuggingFace datasets format with specific naming conventions:

**Required files:**
- `<TASK>_train.json`: Training data
- `<TASK>_val.json`: Validation data  
- `<TASK>_test.json`: Test data

**Required keys in JSON:**
- `text_features_1` through `text_features_n`: Lists of strings containing feature values
- `label`: List of strings containing ground truth labels

**Example (headline click prediction):**
```json
{
  "headline_1": [
    "What Up, Comet? You Just Got *PROBED*",
    "Scientists Made a Breakthrough in Quantum Computing"
  ],
  "headline_2": [
    "Scientists Everywhere Were Holding Their Breath Today. Here's Why.",
    "New Quantum Computer Achieves Milestone"
  ],
  "label": [
    "Headline 2 has more clicks than Headline 1",
    "Headline 1 has more clicks than Headline 2"
  ]
}
```

**Important notes:**
- All lists must have the same length
- Label format must match your `extract_label()` function output format
- Feature keys can be customized to match your domain (e.g., `review_text`, `post_content`, etc.)

## Configuration

Each task requires a `config.yaml` file specifying:

**Required elements:**
- Dataset paths (train/val/test)
- Prompt templates for:
  - Observations generation
  - Batched hypothesis generation
  - Hypothesis inference
  - Relevance checking
  - Adaptive methods (for HypoRefine)

**Template capabilities:**
- Dataset placeholders for dynamic variable injection (e.g., `${text_features_1}`, `${num_hypotheses}`)
- Custom label extraction functions for domain-specific parsing
- Role-based prompt structure (system, user, assistant roles)

**Configuration structure:**
```yaml
task_name: your_task_name

train_data_path: ./your_task_train.json
val_data_path: ./your_task_val.json
test_data_path: ./your_task_test.json

prompt_templates:
  # Extra keys for reusable prompt components
  observations: |
    Feature 1: ${text_features_1}
    Feature 2: ${text_features_2}
    Observation: ${label}
  
  # Required templates
  batched_generation:
    system: "Your system prompt here"
    user: "Your user prompt with ${num_hypotheses} placeholder"
  
  inference:
    system: "Your inference system prompt"
    user: "Your inference user prompt"
  
  # Optional templates for advanced features
  few_shot_baseline: {...}
  is_relevant: {...}
  adaptive_inference: {...}
  adaptive_selection: {...}
```

Refer to `references/config_template.yaml` for a complete example configuration.

## Literature Processing (HypoRefine/Union Methods)

To use literature-based hypothesis generation, you must preprocess PDF papers:

**Step 1: Setup GROBID** (first time only)
```bash
bash ./modules/setup_grobid.sh
```

**Step 2: Add PDF files**
Place research papers in `literature/YOUR_TASK_NAME/raw/`

**Step 3: Process PDFs**
```bash
# Start GROBID service
bash ./modules/run_grobid.sh

# Process PDFs for your task
cd examples
python pdf_preprocess.py --task_name YOUR_TASK_NAME
```

This converts PDFs to structured format for hypothesis extraction. Automated literature search will be supported in future releases.

## CLI Usage

### Hypothesis Generation

```bash
hypogenic_generation --help
```

**Key parameters:**
- Task configuration file path
- Model selection (API-based or local)
- Generation method (HypoGeniC, HypoRefine, or Union)
- Number of hypotheses to generate
- Output directory for hypothesis banks

### Hypothesis Inference

```bash
hypogenic_inference --help
```

**Key parameters:**
- Task configuration file path
- Hypothesis bank file path
- Test dataset path
- Inference method (default or multi-hypothesis)
- Output file for results

## Python API Usage

For programmatic control and custom workflows, use Hypogenic directly in your Python code:

### Basic HypoGeniC Generation

```python
from hypogenic import BaseTask

# Clone example datasets first
# git clone https://github.com/ChicagoHAI/HypoGeniC-datasets.git ./data

# Load your task with custom extract_label function
task = BaseTask(
    config_path="./data/your_task/config.yaml",
    extract_label=lambda text: extract_your_label(text)
)

# Generate hypotheses
task.generate_hypotheses(
    method="hypogenic",
    num_hypotheses=20,
    output_path="./output/hypotheses.json"
)

# Run inference
results = task.inference(
    hypothesis_bank="./output/hypotheses.json",
    test_data="./data/your_task/your_task_test.json"
)
```

### HypoRefine/Union Methods

```python
# For literature-integrated approaches
# git clone https://github.com/ChicagoHAI/Hypothesis-agent-datasets.git ./data

# Generate with HypoRefine
task.generate_hypotheses(
    method="hyporefine",
    num_hypotheses=15,
    literature_path="./literature/your_task/",
    output_path="./output/"
)
# This generates 3 hypothesis banks:
# - HypoRefine (integrated approach)
# - Literature-only hypotheses
# - Literature∪HypoRefine (union)
```

### Multi-Hypothesis Inference

```python
from examples.multi_hyp_inference import run_multi_hypothesis_inference

# Test multiple hypotheses simultaneously
results = run_multi_hypothesis_inference(
    config_path="./data/your_task/config.yaml",
    hypothesis_bank="./output/hypotheses.json",
    test_data="./data/your_task/your_task_test.json"
)
```

### Custom Label Extraction

The `extract_label()` function is critical for parsing LLM outputs. Implement it based on your task:

```python
def extract_label(llm_output: str) -> str:
    """Extract predicted label from LLM inference text.
    
    Default behavior: searches for 'final answer:\s+(.*)' pattern.
    Customize for your domain-specific output format.
    """
    import re
    match = re.search(r'final answer:\s+(.*)', llm_output, re.IGNORECASE)
    if match:
        return match.group(1).strip()
    return llm_output.strip()
```

**Important:** Extracted labels must match the format of `label` values in your dataset for correct accuracy calculation.

## Workflow Examples

### Example 1: Data-Driven Hypothesis Generation (HypoGeniC)

**Scenario:** Detecting AI-generated content without prior theoretical framework

**Steps:**
1. Prepare dataset with text samples and labels (human vs. AI-generated)
2. Create `config.yaml` with appropriate prompt templates
3. Run hypothesis generation:
   ```bash
   hypogenic_generation --config config.yaml --method hypogenic --num_hypotheses 20
   ```
4. Run inference on test set:
   ```bash
   hypogenic_inference --config config.yaml --hypotheses output/hypotheses.json --test_data data/test.json
   ```
5. Analyze results for patterns like formality, grammatical precision, and tone differences

### Example 2: Literature-Informed Hypothesis Testing (HypoRefine)

**Scenario:** Deception detection in hotel reviews building on existing research

**Steps:**
1. Collect 10 relevant papers on linguistic deception cues
2. Prepare dataset with genuine and fraudulent reviews
3. Configure `config.yaml` with literature processing and data generation templates
4. Run HypoRefine:
   ```bash
   hypogenic_generation --config config.yaml --method hyporefine --papers papers/ --num_hypotheses 15
   ```
5. Test hypotheses examining pronoun frequency, detail specificity, and other linguistic patterns
6. Compare literature-based and data-driven hypothesis performance

### Example 3: Comprehensive Hypothesis Coverage (Union Method)

**Scenario:** Mental stress detection maximizing hypothesis diversity

**Steps:**
1. Generate literature hypotheses from mental health research papers
2. Generate data-driven hypotheses from social media posts
3. Run Union method to combine and deduplicate:
   ```bash
   hypogenic_generation --config config.yaml --method union --literature_hypotheses lit_hyp.json
   ```
4. Inference captures both theoretical constructs (posting behavior changes) and data patterns (emotional language shifts)

## Performance Optimization

**Caching:** Enable Redis caching to reduce API costs and computation time for repeated LLM calls

**Parallel Processing:** Leverage multiple workers for large-scale hypothesis generation and testing

**Adaptive Refinement:** Use challenging examples to iteratively improve hypothesis quality

## Expected Outcomes

Research using hypogenic has demonstrated:
- 14.19% accuracy improvement in AI-content detection tasks
- 7.44% accuracy improvement in deception detection tasks
- 80-84% of hypothesis pairs offering distinct, non-redundant insights
- High helpfulness ratings from human evaluators across multiple research domains

## Troubleshooting

**Issue:** Generated hypotheses are too generic
**Solution:** Refine prompt templates in `config.yaml` to request more specific, testable hypotheses

**Issue:** Poor inference performance
**Solution:** Ensure dataset has sufficient training examples, adjust hypothesis generation parameters, or increase number of hypotheses

**Issue:** Label extraction failures
**Solution:** Implement custom `extract_label()` function for domain-specific output parsing

**Issue:** GROBID PDF processing fails
**Solution:** Ensure GROBID service is running (`bash ./modules/run_grobid.sh`) and PDFs are valid research papers

## Creating Custom Tasks

To add a new task or dataset to Hypogenic:

### Step 1: Prepare Your Dataset

Create three JSON files following the required format:
- `your_task_train.json`
- `your_task_val.json`
- `your_task_test.json`

Each file must have keys for text features (`text_features_1`, etc.) and `label`.

### Step 2: Create config.yaml

Define your task configuration with:
- Task name and dataset paths
- Prompt templates for observations, generation, inference
- Any extra keys for reusable prompt components
- Placeholder variables (e.g., `${text_features_1}`, `${num_hypotheses}`)

### Step 3: Implement extract_label Function

Create a custom label extraction function that parses LLM outputs for your domain:

```python
from hypogenic import BaseTask

def extract_my_label(llm_output: str) -> str:
    """Custom label extraction for your task.
    
    Must return labels in same format as dataset 'label' field.
    """
    # Example: Extract from specific format
    if "Final prediction:" in llm_output:
        return llm_output.split("Final prediction:")[-1].strip()
    
    # Fallback to default pattern
    import re
    match = re.search(r'final answer:\s+(.*)', llm_output, re.IGNORECASE)
    return match.group(1).strip() if match else llm_output.strip()

# Use your custom task
task = BaseTask(
    config_path="./your_task/config.yaml",
    extract_label=extract_my_label
)
```

### Step 4: (Optional) Process Literature

For HypoRefine/Union methods:
1. Create `literature/your_task_name/raw/` directory
2. Add relevant research paper PDFs
3. Run GROBID preprocessing
4. Process with `pdf_preprocess.py`

### Step 5: Generate and Test

Run hypothesis generation and inference using CLI or Python API:

```bash
# CLI approach
hypogenic_generation --config your_task/config.yaml --method hypogenic --num_hypotheses 20
hypogenic_inference --config your_task/config.yaml --hypotheses output/hypotheses.json

# Or use Python API (see Python API Usage section)
```

## Repository Structure

Understanding the repository layout:

```
hypothesis-generation/
├── hypogenic/              # Core package code
├── hypogenic_cmd/          # CLI entry points
├── hypothesis_agent/       # HypoRefine agent framework
├── literature/            # Literature processing utilities
├── modules/               # GROBID and preprocessing modules
├── examples/              # Example scripts
│   ├── generation.py      # Basic HypoGeniC generation
│   ├── union_generation.py # HypoRefine/Union generation
│   ├── inference.py       # Single hypothesis inference
│   ├── multi_hyp_inference.py # Multiple hypothesis inference
│   └── pdf_preprocess.py  # Literature PDF processing
├── data/                  # Example datasets (clone separately)
├── tests/                 # Unit tests
└── IO_prompting/          # Prompt templates and experiments
```

**Key directories:**
- **hypogenic/**: Main package with BaseTask and generation logic
- **examples/**: Reference implementations for common workflows
- **literature/**: Tools for PDF processing and literature extraction
- **modules/**: External tool integrations (GROBID, etc.)

## Related Publications

### HypoBench (2025)

Liu, H., Huang, S., Hu, J., Zhou, Y., & Tan, C. (2025). HypoBench: Towards Systematic and Principled Benchmarking for Hypothesis Generation. arXiv preprint arXiv:2504.11524.

- **Paper:** https://arxiv.org/abs/2504.11524
- **Description:** Benchmarking framework for systematic evaluation of hypothesis generation methods

**BibTeX:**
```bibtex
@misc{liu2025hypobenchsystematicprincipledbenchmarking,
      title={HypoBench: Towards Systematic and Principled Benchmarking for Hypothesis Generation}, 
      author={Haokun Liu and Sicong Huang and Jingyu Hu and Yangqiaoyu Zhou and Chenhao Tan},
      year={2025},
      eprint={2504.11524},
      archivePrefix={arXiv},
      primaryClass={cs.AI},
      url={https://arxiv.org/abs/2504.11524}, 
}
```

### Literature Meets Data (2024)

Liu, H., Zhou, Y., Li, M., Yuan, C., & Tan, C. (2024). Literature Meets Data: A Synergistic Approach to Hypothesis Generation. arXiv preprint arXiv:2410.17309.

- **Paper:** https://arxiv.org/abs/2410.17309
- **Code:** https://github.com/ChicagoHAI/hypothesis-generation
- **Description:** Introduces HypoRefine and demonstrates synergistic combination of literature-based and data-driven hypothesis generation

**BibTeX:**
```bibtex
@misc{liu2024literaturemeetsdatasynergistic,
      title={Literature Meets Data: A Synergistic Approach to Hypothesis Generation}, 
      author={Haokun Liu and Yangqiaoyu Zhou and Mingxuan Li and Chenfei Yuan and Chenhao Tan},
      year={2024},
      eprint={2410.17309},
      archivePrefix={arXiv},
      primaryClass={cs.AI},
      url={https://arxiv.org/abs/2410.17309}, 
}
```

### Hypothesis Generation with Large Language Models (2024)

Zhou, Y., Liu, H., Srivastava, T., Mei, H., & Tan, C. (2024). Hypothesis Generation with Large Language Models. In Proceedings of EMNLP Workshop of NLP for Science.

- **Paper:** https://aclanthology.org/2024.nlp4science-1.10/
- **Description:** Original HypoGeniC framework for data-driven hypothesis generation

**BibTeX:**
```bibtex
@inproceedings{zhou2024hypothesisgenerationlargelanguage,
      title={Hypothesis Generation with Large Language Models}, 
      author={Yangqiaoyu Zhou and Haokun Liu and Tejes Srivastava and Hongyuan Mei and Chenhao Tan},
      booktitle = {Proceedings of EMNLP Workshop of NLP for Science},
      year={2024},
      url={https://aclanthology.org/2024.nlp4science-1.10/},
}
```

## Additional Resources

### Official Links

- **GitHub Repository:** https://github.com/ChicagoHAI/hypothesis-generation
- **PyPI Package:** https://pypi.org/project/hypogenic/
- **License:** MIT License
- **Issues & Support:** https://github.com/ChicagoHAI/hypothesis-generation/issues

### Example Datasets

Clone these repositories for ready-to-use examples:

```bash
# HypoGeniC examples (data-driven only)
git clone https://github.com/ChicagoHAI/HypoGeniC-datasets.git ./data

# HypoRefine/Union examples (literature + data)
git clone https://github.com/ChicagoHAI/Hypothesis-agent-datasets.git ./data
```

### Community & Contributions

- **Contributors:** 7+ active contributors
- **Stars:** 89+ on GitHub
- **Topics:** research-tool, interpretability, hypothesis-generation, scientific-discovery, llm-application

For contributions or questions, visit the GitHub repository and check the issues page.

## Local Resources

### references/

`config_template.yaml` - Complete example configuration file with all required prompt templates and parameters. This includes:
- Full YAML structure for task configuration
- Example prompt templates for all methods
- Placeholder variable documentation
- Role-based prompt examples

### scripts/

Scripts directory is available for:
- Custom data preparation utilities
- Format conversion tools
- Analysis and evaluation scripts
- Integration with external tools

### assets/

Assets directory is available for:
- Example datasets and templates
- Sample hypothesis banks
- Visualization outputs
- Documentation supplements

