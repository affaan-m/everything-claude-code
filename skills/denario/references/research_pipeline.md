# Research Pipeline API Reference

## Core Classes

### Denario

The main class for orchestrating research workflows.

#### Initialization

```python
from denario import Denario

den = Denario(project_dir="path/to/project")
```

**Parameters:**
- `project_dir` (str): Path to the research project directory where all outputs will be stored

#### Methods

##### set_data_description()

Define the research context by describing available data and analytical tools.

```python
den.set_data_description(description: str)
```

**Parameters:**
- `description` (str): Text describing the dataset, available tools, research domain, and any relevant context

**Example:**
```python
den.set_data_description("""
Available data: Time-series temperature measurements from 2010-2023
Tools: pandas, scipy, sklearn, matplotlib
Domain: Climate science
Research interest: Identifying seasonal patterns and long-term trends
""")
```

**Purpose:** This establishes the foundation for automated idea generation by providing context about what data is available and what analyses are feasible.

##### get_idea()

Generate research hypotheses based on the data description.

```python
den.get_idea()
```

**Returns:** Research idea/hypothesis (stored internally in project directory)

**Output:** Creates a file containing the generated research question or hypothesis

**Example:**
```python
den.get_idea()
# Generates ideas like: "Investigate the correlation between seasonal temperature
# variations and long-term warming trends using time-series decomposition"
```

##### set_idea()

Manually specify a research idea instead of generating one.

```python
den.set_idea(idea: str)
```

**Parameters:**
- `idea` (str): The research hypothesis or question to investigate

**Example:**
```python
den.set_idea("Analyze the impact of El Niño events on regional temperature anomalies")
```

**Use case:** When you have a specific research direction and want to skip automated idea generation.

##### get_method()

Develop a research methodology based on the idea and data description.

```python
den.get_method()
```

**Returns:** Methodology document (stored internally in project directory)

**Output:** Creates a structured methodology including:
- Analytical approach
- Statistical methods to apply
- Validation strategies
- Expected outputs

**Example:**
```python
den.get_method()
# Generates methodology: "Apply seasonal decomposition, compute correlation coefficients,
# perform statistical significance tests, generate visualization plots..."
```

##### set_method()

Provide a custom methodology instead of generating one.

```python
den.set_method(method: str)
den.set_method(method: Path)  # Can also accept file paths
```

**Parameters:**
- `method` (str or Path): Methodology description or path to markdown file containing methodology

**Example:**
```python
# From string
den.set_method("""
1. Apply seasonal decomposition using STL
2. Compute Pearson correlation coefficients
3. Perform Mann-Kendall trend test
4. Generate time-series plots with confidence intervals
""")

# From file
den.set_method("methodology.md")
```

##### get_results()

Execute the methodology, perform computations, and generate results.

```python
den.get_results()
```

**Returns:** Results document with analysis outputs (stored internally in project directory)

**Output:** Creates results including:
- Computed statistics
- Generated figures and visualizations
- Data tables
- Analysis findings

**Example:**
```python
den.get_results()
# Executes the methodology, runs analyses, creates plots, compiles findings
```

**Note:** This is where the actual computational work happens. The agent executes code to perform the analyses specified in the methodology.

##### set_results()

Provide pre-computed results instead of generating them.

```python
den.set_results(results: str)
den.set_results(results: Path)  # Can also accept file paths
```

**Parameters:**
- `results` (str or Path): Results description or path to markdown file containing results

**Example:**
```python
# From string
den.set_results("""
Analysis Results:
- Correlation coefficient: 0.78 (p < 0.001)
- Seasonal amplitude: 5.2°C
- Long-term trend: +0.15°C per decade
- Figure 1: Seasonal decomposition (see attached)
""")

# From file
den.set_results("results.md")
```

**Use case:** When analyses were performed externally or when iterating on paper writing without re-running computations.

##### get_paper()

Generate a publication-ready LaTeX paper with the research findings.

```python
den.get_paper(journal: Journal = None)
```

**Parameters:**
- `journal` (Journal, optional): Target journal for formatting. Defaults to generic format.

**Returns:** LaTeX paper with proper formatting (stored in project directory)

**Output:** Creates:
- Complete LaTeX source file
- Compiled PDF (if LaTeX is available)
- Integrated figures and tables
- Properly formatted bibliography

**Example:**
```python
from denario import Journal

den.get_paper(journal=Journal.APS)
# Generates paper.tex and paper.pdf formatted for APS journals
```

### Journal Enum

Enumeration of supported journal formats.

```python
from denario import Journal
```

#### Available Journals

- `Journal.APS` - American Physical Society format
  - Suitable for Physical Review, Physical Review Letters, etc.
  - Uses RevTeX document class

Additional journal formats may be available. Check the latest denario documentation for the complete list.

#### Usage

```python
from denario import Denario, Journal

den = Denario(project_dir="./research")
# ... complete workflow ...
den.get_paper(journal=Journal.APS)
```

## Workflow Patterns

### Fully Automated Pipeline

Let denario handle every stage:

```python
from denario import Denario, Journal

den = Denario(project_dir="./automated_research")

# Define context
den.set_data_description("""
Dataset: Sensor readings from IoT devices
Tools: pandas, numpy, sklearn, matplotlib
Goal: Anomaly detection in sensor networks
""")

# Automate entire pipeline
den.get_idea()        # Generate research idea
den.get_method()      # Develop methodology
den.get_results()     # Execute analysis
den.get_paper(journal=Journal.APS)  # Create paper
```

### Custom Idea, Automated Execution

Provide your research question, automate the rest:

```python
den = Denario(project_dir="./custom_idea")

den.set_data_description("Dataset: Financial time-series data...")

# Manual idea
den.set_idea("Investigate predictive models for stock market volatility using LSTM networks")

# Automated execution
den.get_method()
den.get_results()
den.get_paper(journal=Journal.APS)
```

### Fully Manual with Template Generation

Use denario only for paper formatting:

```python
den = Denario(project_dir="./manual_research")

# Provide everything manually
den.set_data_description("Pre-existing dataset description...")
den.set_idea("Pre-defined research hypothesis")
den.set_method("methodology.md")  # Load from file
den.set_results("results.md")      # Load from file

# Generate formatted paper
den.get_paper(journal=Journal.APS)
```

### Iterative Refinement

Refine specific stages without re-running everything:

```python
den = Denario(project_dir="./iterative")

# Initial run
den.set_data_description("Dataset description...")
den.get_idea()
den.get_method()
den.get_results()

# Refine methodology after reviewing results
den.set_method("""
Revised methodology:
- Use different statistical test
- Add sensitivity analysis
- Include cross-validation
""")

# Re-run only downstream stages
den.get_results()  # Re-execute with new method
den.get_paper(journal=Journal.APS)
```

## Project Directory Structure

After running a complete workflow, the project directory contains:

```
project_dir/
├── data_description.txt    # Input: data context
├── idea.md                 # Generated or provided research idea
├── methodology.md          # Generated or provided methodology
├── results.md              # Generated or provided results
├── figures/                # Generated visualizations
│   ├── figure_1.png
│   ├── figure_2.png
│   └── ...
├── paper.tex               # Generated LaTeX source
├── paper.pdf               # Compiled PDF (if LaTeX available)
└── logs/                   # Agent execution logs
    └── ...
```

## Advanced Features

### Multiagent Orchestration

Denario uses AG2 and LangGraph frameworks to coordinate multiple specialized agents:

- **Idea Agent**: Generates research hypotheses from data descriptions
- **Method Agent**: Develops analytical methodologies
- **Execution Agent**: Runs computations and creates visualizations
- **Writing Agent**: Produces publication-ready manuscripts

These agents collaborate automatically, with each stage building on previous outputs.

### Integration with Scientific Tools

Denario integrates with common scientific Python libraries:

- **pandas**: Data manipulation and analysis
- **scikit-learn**: Machine learning algorithms
- **scipy**: Scientific computing and statistics
- **matplotlib/seaborn**: Visualization
- **numpy**: Numerical operations

When generating results, denario can automatically write and execute code using these libraries.

### Reproducibility

All stages produce structured outputs saved to the project directory:

- Version control friendly (markdown and LaTeX)
- Auditable (logs of agent decisions and code execution)
- Reproducible (saved methodologies can be re-run)

### Literature Search

Denario includes capabilities for literature searches to provide context for research ideas and methodology development. See `examples.md` for literature search workflows.

## Error Handling

### Common Issues

**Missing data description:**
```python
den = Denario(project_dir="./project")
den.get_idea()  # Error: must call set_data_description() first
```

**Solution:** Always set data description before generating ideas.

**Missing prerequisite stages:**
```python
den = Denario(project_dir="./project")
den.get_results()  # Error: must have idea and method first
```

**Solution:** Follow the workflow order or manually set prerequisite stages.

**LaTeX compilation errors:**
```python
den.get_paper()  # May fail if LaTeX not installed
```

**Solution:** Install LaTeX distribution or use Docker image with pre-installed LaTeX.

## Best Practices

### Data Description Quality

Provide detailed context for better idea generation:

```python
# Good: Detailed and specific
den.set_data_description("""
Dataset: 10 years of daily temperature readings from 50 weather stations
Format: CSV with columns [date, station_id, temperature, humidity]
Tools available: pandas, scipy, sklearn, matplotlib, seaborn
Domain: Climatology
Research interests: Climate change, seasonal patterns, regional variations
Known challenges: Missing data in 2015, station 23 has calibration issues
""")

# Bad: Too vague
den.set_data_description("Temperature data from weather stations")
```

### Methodology Validation

Review generated methodologies before executing:

```python
den.get_method()
# Review the methodology.md file in project_dir
# If needed, refine with set_method()
```

### Incremental Development

Build the research pipeline incrementally:

```python
# Stage 1: Validate idea generation
den.set_data_description("...")
den.get_idea()
# Review idea.md, adjust if needed

# Stage 2: Validate methodology
den.get_method()
# Review methodology.md, adjust if needed

# Stage 3: Execute and validate results
den.get_results()
# Review results.md and figures/

# Stage 4: Generate paper
den.get_paper(journal=Journal.APS)
```

### Version Control Integration

Initialize git in project directory for tracking:

```bash
cd project_dir
git init
git add .
git commit -m "Initial research workflow"
```

Commit after each stage to track the evolution of your research.
