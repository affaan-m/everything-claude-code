#!/usr/bin/env python3
"""
DiffDock Environment Setup Checker

This script verifies that the DiffDock environment is properly configured
and all dependencies are available.

Usage:
    python setup_check.py
    python setup_check.py --verbose
"""

import argparse
import sys
import os
from pathlib import Path


def check_python_version():
    """Check Python version."""
    import sys
    version = sys.version_info

    print("Checking Python version...")
    if version.major == 3 and version.minor >= 8:
        print(f"  ✓ Python {version.major}.{version.minor}.{version.micro}")
        return True
    else:
        print(f"  ✗ Python {version.major}.{version.minor}.{version.micro} "
              f"(requires Python 3.8 or higher)")
        return False


def check_package(package_name, import_name=None, version_attr='__version__'):
    """Check if a Python package is installed."""
    if import_name is None:
        import_name = package_name

    try:
        module = __import__(import_name)
        version = getattr(module, version_attr, 'unknown')
        print(f"  ✓ {package_name:20s} (version: {version})")
        return True
    except ImportError:
        print(f"  ✗ {package_name:20s} (not installed)")
        return False


def check_pytorch():
    """Check PyTorch installation and CUDA availability."""
    print("\nChecking PyTorch...")
    try:
        import torch
        print(f"  ✓ PyTorch version: {torch.__version__}")

        # Check CUDA
        if torch.cuda.is_available():
            print(f"  ✓ CUDA available: {torch.cuda.get_device_name(0)}")
            print(f"    - CUDA version: {torch.version.cuda}")
            print(f"    - Number of GPUs: {torch.cuda.device_count()}")
            return True, True
        else:
            print(f"  ⚠ CUDA not available (will run on CPU)")
            return True, False
    except ImportError:
        print(f"  ✗ PyTorch not installed")
        return False, False


def check_pytorch_geometric():
    """Check PyTorch Geometric installation."""
    print("\nChecking PyTorch Geometric...")
    packages = [
        ('torch-geometric', 'torch_geometric'),
        ('torch-scatter', 'torch_scatter'),
        ('torch-sparse', 'torch_sparse'),
        ('torch-cluster', 'torch_cluster'),
    ]

    all_ok = True
    for pkg_name, import_name in packages:
        if not check_package(pkg_name, import_name):
            all_ok = False

    return all_ok


def check_core_dependencies():
    """Check core DiffDock dependencies."""
    print("\nChecking core dependencies...")

    dependencies = [
        ('numpy', 'numpy'),
        ('scipy', 'scipy'),
        ('pandas', 'pandas'),
        ('rdkit', 'rdkit', 'rdBase.__version__'),
        ('biopython', 'Bio', '__version__'),
        ('pytorch-lightning', 'pytorch_lightning'),
        ('PyYAML', 'yaml'),
    ]

    all_ok = True
    for dep in dependencies:
        pkg_name = dep[0]
        import_name = dep[1]
        version_attr = dep[2] if len(dep) > 2 else '__version__'

        if not check_package(pkg_name, import_name, version_attr):
            all_ok = False

    return all_ok


def check_esm():
    """Check ESM (protein language model) installation."""
    print("\nChecking ESM (for protein sequence folding)...")
    try:
        import esm
        print(f"  ✓ ESM installed (version: {esm.__version__ if hasattr(esm, '__version__') else 'unknown'})")
        return True
    except ImportError:
        print(f"  ⚠ ESM not installed (needed for protein sequence folding)")
        print(f"    Install with: pip install fair-esm")
        return False


def check_diffdock_installation():
    """Check if DiffDock is properly installed/cloned."""
    print("\nChecking DiffDock installation...")

    # Look for key files
    key_files = [
        'inference.py',
        'default_inference_args.yaml',
        'environment.yml',
    ]

    found_files = []
    missing_files = []

    for filename in key_files:
        if os.path.exists(filename):
            found_files.append(filename)
        else:
            missing_files.append(filename)

    if found_files:
        print(f"  ✓ Found DiffDock files in current directory:")
        for f in found_files:
            print(f"    - {f}")
    else:
        print(f"  ⚠ DiffDock files not found in current directory")
        print(f"    Current directory: {os.getcwd()}")
        print(f"    Make sure you're in the DiffDock repository root")

    # Check for model checkpoints
    model_dir = Path('./workdir/v1.1/score_model')
    confidence_dir = Path('./workdir/v1.1/confidence_model')

    if model_dir.exists() and confidence_dir.exists():
        print(f"  ✓ Model checkpoints found")
    else:
        print(f"  ⚠ Model checkpoints not found in ./workdir/v1.1/")
        print(f"    Models will be downloaded on first run")

    return len(found_files) > 0


def print_installation_instructions():
    """Print installation instructions if setup is incomplete."""
    print("\n" + "="*80)
    print("Installation Instructions")
    print("="*80)

    print("""
If DiffDock is not installed, follow these steps:

1. Clone the repository:
   git clone https://github.com/gcorso/DiffDock.git
   cd DiffDock

2. Create conda environment:
   conda env create --file environment.yml
   conda activate diffdock

3. Verify installation:
   python setup_check.py

For Docker installation:
   docker pull rbgcsail/diffdock
   docker run -it --gpus all --entrypoint /bin/bash rbgcsail/diffdock
   micromamba activate diffdock

For more information, visit: https://github.com/gcorso/DiffDock
    """)


def print_performance_notes(has_cuda):
    """Print performance notes based on available hardware."""
    print("\n" + "="*80)
    print("Performance Notes")
    print("="*80)

    if has_cuda:
        print("""
✓ GPU detected - DiffDock will run efficiently

Expected performance:
  - First run: ~2-5 minutes (pre-computing SO(2)/SO(3) tables)
  - Subsequent runs: ~10-60 seconds per complex (depending on settings)
  - Batch processing: Highly efficient with GPU
        """)
    else:
        print("""
⚠ No GPU detected - DiffDock will run on CPU

Expected performance:
  - CPU inference is SIGNIFICANTLY slower than GPU
  - Single complex: Several minutes to hours
  - Batch processing: Not recommended on CPU

Recommendation: Use GPU for practical applications
  - Cloud options: Google Colab, AWS, or other cloud GPU services
  - Local: Install CUDA-capable GPU
        """)


def main():
    parser = argparse.ArgumentParser(
        description='Check DiffDock environment setup',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    parser.add_argument('--verbose', '-v', action='store_true',
                        help='Show detailed version information')

    args = parser.parse_args()

    print("="*80)
    print("DiffDock Environment Setup Checker")
    print("="*80)

    checks = []

    # Run all checks
    checks.append(("Python version", check_python_version()))

    pytorch_ok, has_cuda = check_pytorch()
    checks.append(("PyTorch", pytorch_ok))

    checks.append(("PyTorch Geometric", check_pytorch_geometric()))
    checks.append(("Core dependencies", check_core_dependencies()))
    checks.append(("ESM", check_esm()))
    checks.append(("DiffDock files", check_diffdock_installation()))

    # Summary
    print("\n" + "="*80)
    print("Summary")
    print("="*80)

    all_passed = all(result for _, result in checks)

    for check_name, result in checks:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"  {status:8s} - {check_name}")

    if all_passed:
        print("\n✓ All checks passed! DiffDock is ready to use.")
        print_performance_notes(has_cuda)
        return 0
    else:
        print("\n✗ Some checks failed. Please install missing dependencies.")
        print_installation_instructions()
        return 1


if __name__ == '__main__':
    sys.exit(main())
