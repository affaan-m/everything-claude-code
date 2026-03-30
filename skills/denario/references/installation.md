# Installation Guide

## System Requirements

- **Python**: Version 3.12 or higher (required)
- **Operating System**: Linux, macOS, or Windows
- **Virtual Environment**: Recommended for isolation
- **LaTeX**: Required for paper generation (or use Docker)

## Installation Methods

### Method 1: Using uv (Recommended)

The uv package manager provides fast, reliable dependency resolution:

```bash
# Initialize a new project
uv init

# Add denario with app support
uv add "denario[app]"
```

### Method 2: Alternative Installation

Alternative installation using pip:

```bash
# Create virtual environment (recommended)
python3 -m venv denario_env
source denario_env/bin/activate  # On Windows: denario_env\Scripts\activate

# Install denario
uv pip install "denario[app]"
```

### Method 3: Building from Source

For development or customization:

```bash
# Clone the repository
git clone https://github.com/AstroPilot-AI/Denario.git
cd Denario

# Create virtual environment
python3 -m venv Denario_env
source Denario_env/bin/activate

# Install in editable mode
uv pip install -e .
```

### Method 4: Docker Deployment

Docker provides a complete environment with all dependencies including LaTeX:

```bash
# Pull the official image
docker pull pablovd/denario:latest

# Run the container with GUI
docker run -p 8501:8501 --rm pablovd/denario:latest

# Run with environment variables (for API keys)
docker run -p 8501:8501 --env-file .env --rm pablovd/denario:latest
```

Access the GUI at `http://localhost:8501` after the container starts.

## Verifying Installation

After installation, verify denario is available:

```python
# Test import
python -c "from denario import Denario; print('Denario installed successfully')"
```

Or check the version:

```bash
python -c "import denario; print(denario.__version__)"
```

## Launching the Application

### Command-Line Interface

Run the graphical user interface:

```bash
denario run
```

This launches a web-based Streamlit application for interactive research workflow management.

### Programmatic Usage

Use denario directly in Python scripts:

```python
from denario import Denario

den = Denario(project_dir="./my_project")
# Continue with workflow...
```

## Dependencies

Denario automatically installs key dependencies:

- **AG2**: Agent orchestration framework
- **LangGraph**: Graph-based agent workflows
- **pandas**: Data manipulation
- **scikit-learn**: Machine learning tools
- **matplotlib/seaborn**: Visualization
- **streamlit**: GUI framework (with `[app]` extra)

## LaTeX Setup

For paper generation, LaTeX must be available:

### Linux
```bash
sudo apt-get install texlive-full
```

### macOS
```bash
brew install --cask mactex
```

### Windows
Download and install [MiKTeX](https://miktex.org/download) or [TeX Live](https://tug.org/texlive/).

### Docker Alternative
The Docker image includes a complete LaTeX installation, eliminating manual setup.

## Troubleshooting Installation

### Python Version Issues

Ensure Python 3.12+:
```bash
python --version
```

If older, install a newer version or use pyenv for version management.

### Virtual Environment Activation

**Linux/macOS:**
```bash
source venv/bin/activate
```

**Windows:**
```bash
venv\Scripts\activate
```

### Permission Errors

Use `--user` flag or virtual environments:
```bash
uv pip install --user "denario[app]"
```

### Docker Port Conflicts

If port 8501 is in use, map to a different port:
```bash
docker run -p 8502:8501 --rm pablovd/denario:latest
```

### Package Conflicts

Create a fresh virtual environment to avoid dependency conflicts.

## Updating Denario

### uv
```bash
uv add --upgrade denario
```

### pip
```bash
uv pip install --upgrade "denario[app]"
```

### Docker
```bash
docker pull pablovd/denario:latest
```

## Uninstallation

### uv
```bash
uv remove denario
```

### pip
```bash
uv pip uninstall denario
```

### Docker
```bash
docker rmi pablovd/denario:latest
```
