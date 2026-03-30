---
name: pymatgen
description: Materials science toolkit. Crystal structures (CIF, POSCAR), phase diagrams, band structure, DOS, Materials Project integration, format conversion, for computational materials science.
license: MIT license
metadata:
    skill-author: K-Dense Inc.
---

# Pymatgen - Python Materials Genomics

## Overview

Pymatgen is a comprehensive Python library for materials analysis that powers the Materials Project. Create, analyze, and manipulate crystal structures and molecules, compute phase diagrams and thermodynamic properties, analyze electronic structure (band structures, DOS), generate surfaces and interfaces, and access Materials Project's database of computed materials. Supports 100+ file formats from various computational codes.

## When to Use This Skill

This skill should be used when:
- Working with crystal structures or molecular systems in materials science
- Converting between structure file formats (CIF, POSCAR, XYZ, etc.)
- Analyzing symmetry, space groups, or coordination environments
- Computing phase diagrams or assessing thermodynamic stability
- Analyzing electronic structure data (band gaps, DOS, band structures)
- Generating surfaces, slabs, or studying interfaces
- Accessing the Materials Project database programmatically
- Setting up high-throughput computational workflows
- Analyzing diffusion, magnetism, or mechanical properties
- Working with VASP, Gaussian, Quantum ESPRESSO, or other computational codes

## Quick Start Guide

### Installation

```bash
# Core pymatgen
uv pip install pymatgen

# With Materials Project API access
uv pip install pymatgen mp-api

# Optional dependencies for extended functionality
uv pip install pymatgen[analysis]  # Additional analysis tools
uv pip install pymatgen[vis]       # Visualization tools
```

### Basic Structure Operations

```python
from pymatgen.core import Structure, Lattice

# Read structure from file (automatic format detection)
struct = Structure.from_file("POSCAR")

# Create structure from scratch
lattice = Lattice.cubic(3.84)
struct = Structure(lattice, ["Si", "Si"], [[0,0,0], [0.25,0.25,0.25]])

# Write to different format
struct.to(filename="structure.cif")

# Basic properties
print(f"Formula: {struct.composition.reduced_formula}")
print(f"Space group: {struct.get_space_group_info()}")
print(f"Density: {struct.density:.2f} g/cm³")
```

### Materials Project Integration

```bash
# Set up API key
export MP_API_KEY="your_api_key_here"
```

```python
from mp_api.client import MPRester

with MPRester() as mpr:
    # Get structure by material ID
    struct = mpr.get_structure_by_material_id("mp-149")

    # Search for materials
    materials = mpr.materials.summary.search(
        formula="Fe2O3",
        energy_above_hull=(0, 0.05)
    )
```

## Core Capabilities

### 1. Structure Creation and Manipulation

Create structures using various methods and perform transformations.

**From files:**
```python
# Automatic format detection
struct = Structure.from_file("structure.cif")
struct = Structure.from_file("POSCAR")
mol = Molecule.from_file("molecule.xyz")
```

**From scratch:**
```python
from pymatgen.core import Structure, Lattice

# Using lattice parameters
lattice = Lattice.from_parameters(a=3.84, b=3.84, c=3.84,
                                  alpha=120, beta=90, gamma=60)
coords = [[0, 0, 0], [0.75, 0.5, 0.75]]
struct = Structure(lattice, ["Si", "Si"], coords)

# From space group
struct = Structure.from_spacegroup(
    "Fm-3m",
    Lattice.cubic(3.5),
    ["Si"],
    [[0, 0, 0]]
)
```

**Transformations:**
```python
from pymatgen.transformations.standard_transformations import (
    SupercellTransformation,
    SubstitutionTransformation,
    PrimitiveCellTransformation
)

# Create supercell
trans = SupercellTransformation([[2,0,0],[0,2,0],[0,0,2]])
supercell = trans.apply_transformation(struct)

# Substitute elements
trans = SubstitutionTransformation({"Fe": "Mn"})
new_struct = trans.apply_transformation(struct)

# Get primitive cell
trans = PrimitiveCellTransformation()
primitive = trans.apply_transformation(struct)
```

**Reference:** See `references/core_classes.md` for comprehensive documentation of Structure, Lattice, Molecule, and related classes.

### 2. File Format Conversion

Convert between 100+ file formats with automatic format detection.

**Using convenience methods:**
```python
# Read any format
struct = Structure.from_file("input_file")

# Write to any format
struct.to(filename="output.cif")
struct.to(filename="POSCAR")
struct.to(filename="output.xyz")
```

**Using the conversion script:**
```bash
# Single file conversion
python scripts/structure_converter.py POSCAR structure.cif

# Batch conversion
python scripts/structure_converter.py *.cif --output-dir ./poscar_files --format poscar
```

**Reference:** See `references/io_formats.md` for detailed documentation of all supported formats and code integrations.

### 3. Structure Analysis and Symmetry

Analyze structures for symmetry, coordination, and other properties.

**Symmetry analysis:**
```python
from pymatgen.symmetry.analyzer import SpacegroupAnalyzer

sga = SpacegroupAnalyzer(struct)

# Get space group information
print(f"Space group: {sga.get_space_group_symbol()}")
print(f"Number: {sga.get_space_group_number()}")
print(f"Crystal system: {sga.get_crystal_system()}")

# Get conventional/primitive cells
conventional = sga.get_conventional_standard_structure()
primitive = sga.get_primitive_standard_structure()
```

**Coordination environment:**
```python
from pymatgen.analysis.local_env import CrystalNN

cnn = CrystalNN()
neighbors = cnn.get_nn_info(struct, n=0)  # Neighbors of site 0

print(f"Coordination number: {len(neighbors)}")
for neighbor in neighbors:
    site = struct[neighbor['site_index']]
    print(f"  {site.species_string} at {neighbor['weight']:.3f} Å")
```

**Using the analysis script:**
```bash
# Comprehensive analysis
python scripts/structure_analyzer.py POSCAR --symmetry --neighbors

# Export results
python scripts/structure_analyzer.py structure.cif --symmetry --export json
```

**Reference:** See `references/analysis_modules.md` for detailed documentation of all analysis capabilities.

### 4. Phase Diagrams and Thermodynamics

Construct phase diagrams and analyze thermodynamic stability.

**Phase diagram construction:**
```python
from mp_api.client import MPRester
from pymatgen.analysis.phase_diagram import PhaseDiagram, PDPlotter

# Get entries from Materials Project
with MPRester() as mpr:
    entries = mpr.get_entries_in_chemsys("Li-Fe-O")

# Build phase diagram
pd = PhaseDiagram(entries)

# Check stability
from pymatgen.core import Composition
comp = Composition("LiFeO2")

# Find entry for composition
for entry in entries:
    if entry.composition.reduced_formula == comp.reduced_formula:
        e_above_hull = pd.get_e_above_hull(entry)
        print(f"Energy above hull: {e_above_hull:.4f} eV/atom")

        if e_above_hull > 0.001:
            # Get decomposition
            decomp = pd.get_decomposition(comp)
            print("Decomposes to:", decomp)

# Plot
plotter = PDPlotter(pd)
plotter.show()
```

**Using the phase diagram script:**
```bash
# Generate phase diagram
python scripts/phase_diagram_generator.py Li-Fe-O --output li_fe_o.png

# Analyze specific composition
python scripts/phase_diagram_generator.py Li-Fe-O --analyze "LiFeO2" --show
```

**Reference:** See `references/analysis_modules.md` (Phase Diagrams section) and `references/transformations_workflows.md` (Workflow 2) for detailed examples.

### 5. Electronic Structure Analysis

Analyze band structures, density of states, and electronic properties.

**Band structure:**
```python
from pymatgen.io.vasp import Vasprun
from pymatgen.electronic_structure.plotter import BSPlotter

# Read from VASP calculation
vasprun = Vasprun("vasprun.xml")
bs = vasprun.get_band_structure()

# Analyze
band_gap = bs.get_band_gap()
print(f"Band gap: {band_gap['energy']:.3f} eV")
print(f"Direct: {band_gap['direct']}")
print(f"Is metal: {bs.is_metal()}")

# Plot
plotter = BSPlotter(bs)
plotter.save_plot("band_structure.png")
```

**Density of states:**
```python
from pymatgen.electronic_structure.plotter import DosPlotter

dos = vasprun.complete_dos

# Get element-projected DOS
element_dos = dos.get_element_dos()
for element, element_dos_obj in element_dos.items():
    print(f"{element}: {element_dos_obj.get_gap():.3f} eV")

# Plot
plotter = DosPlotter()
plotter.add_dos("Total DOS", dos)
plotter.show()
```

**Reference:** See `references/analysis_modules.md` (Electronic Structure section) and `references/io_formats.md` (VASP section).

### 6. Surface and Interface Analysis

Generate slabs, analyze surfaces, and study interfaces.

**Slab generation:**
```python
from pymatgen.core.surface import SlabGenerator

# Generate slabs for specific Miller index
slabgen = SlabGenerator(
    struct,
    miller_index=(1, 1, 1),
    min_slab_size=10.0,      # Å
    min_vacuum_size=10.0,    # Å
    center_slab=True
)

slabs = slabgen.get_slabs()

# Write slabs
for i, slab in enumerate(slabs):
    slab.to(filename=f"slab_{i}.cif")
```

**Wulff shape construction:**
```python
from pymatgen.analysis.wulff import WulffShape

# Define surface energies
surface_energies = {
    (1, 0, 0): 1.0,
    (1, 1, 0): 1.1,
    (1, 1, 1): 0.9,
}

wulff = WulffShape(struct.lattice, surface_energies)
print(f"Surface area: {wulff.surface_area:.2f} Ų")
print(f"Volume: {wulff.volume:.2f} ų")

wulff.show()
```

**Adsorption site finding:**
```python
from pymatgen.analysis.adsorption import AdsorbateSiteFinder
from pymatgen.core import Molecule

asf = AdsorbateSiteFinder(slab)

# Find sites
ads_sites = asf.find_adsorption_sites()
print(f"On-top sites: {len(ads_sites['ontop'])}")
print(f"Bridge sites: {len(ads_sites['bridge'])}")
print(f"Hollow sites: {len(ads_sites['hollow'])}")

# Add adsorbate
adsorbate = Molecule("O", [[0, 0, 0]])
ads_struct = asf.add_adsorbate(adsorbate, ads_sites["ontop"][0])
```

**Reference:** See `references/analysis_modules.md` (Surface and Interface section) and `references/transformations_workflows.md` (Workflows 3 and 9).

### 7. Materials Project Database Access

Programmatically access the Materials Project database.

**Setup:**
1. Get API key from https://next-gen.materialsproject.org/
2. Set environment variable: `export MP_API_KEY="your_key_here"`

**Search and retrieve:**
```python
from mp_api.client import MPRester

with MPRester() as mpr:
    # Search by formula
    materials = mpr.materials.summary.search(formula="Fe2O3")

    # Search by chemical system
    materials = mpr.materials.summary.search(chemsys="Li-Fe-O")

    # Filter by properties
    materials = mpr.materials.summary.search(
        chemsys="Li-Fe-O",
        energy_above_hull=(0, 0.05),  # Stable/metastable
        band_gap=(1.0, 3.0)            # Semiconducting
    )

    # Get structure
    struct = mpr.get_structure_by_material_id("mp-149")

    # Get band structure
    bs = mpr.get_bandstructure_by_material_id("mp-149")

    # Get entries for phase diagram
    entries = mpr.get_entries_in_chemsys("Li-Fe-O")
```

**Reference:** See `references/materials_project_api.md` for comprehensive API documentation and examples.

### 8. Computational Workflow Setup

Set up calculations for various electronic structure codes.

**VASP input generation:**
```python
from pymatgen.io.vasp.sets import MPRelaxSet, MPStaticSet, MPNonSCFSet

# Relaxation
relax = MPRelaxSet(struct)
relax.write_input("./relax_calc")

# Static calculation
static = MPStaticSet(struct)
static.write_input("./static_calc")

# Band structure (non-self-consistent)
nscf = MPNonSCFSet(struct, mode="line")
nscf.write_input("./bandstructure_calc")

# Custom parameters
custom = MPRelaxSet(struct, user_incar_settings={"ENCUT": 600})
custom.write_input("./custom_calc")
```

**Other codes:**
```python
# Gaussian
from pymatgen.io.gaussian import GaussianInput

gin = GaussianInput(
    mol,
    functional="B3LYP",
    basis_set="6-31G(d)",
    route_parameters={"Opt": None}
)
gin.write_file("input.gjf")

# Quantum ESPRESSO
from pymatgen.io.pwscf import PWInput

pwin = PWInput(struct, control={"calculation": "scf"})
pwin.write_file("pw.in")
```

**Reference:** See `references/io_formats.md` (Electronic Structure Code I/O section) and `references/transformations_workflows.md` for workflow examples.

### 9. Advanced Analysis

**Diffraction patterns:**
```python
from pymatgen.analysis.diffraction.xrd import XRDCalculator

xrd = XRDCalculator()
pattern = xrd.get_pattern(struct)

# Get peaks
for peak in pattern.hkls:
    print(f"2θ = {peak['2theta']:.2f}°, hkl = {peak['hkl']}")

pattern.plot()
```

**Elastic properties:**
```python
from pymatgen.analysis.elasticity import ElasticTensor

# From elastic tensor matrix
elastic_tensor = ElasticTensor.from_voigt(matrix)

print(f"Bulk modulus: {elastic_tensor.k_voigt:.1f} GPa")
print(f"Shear modulus: {elastic_tensor.g_voigt:.1f} GPa")
print(f"Young's modulus: {elastic_tensor.y_mod:.1f} GPa")
```

**Magnetic ordering:**
```python
from pymatgen.transformations.advanced_transformations import MagOrderingTransformation

# Enumerate magnetic orderings
trans = MagOrderingTransformation({"Fe": 5.0})
mag_structs = trans.apply_transformation(struct, return_ranked_list=True)

# Get lowest energy magnetic structure
lowest_energy_struct = mag_structs[0]['structure']
```

**Reference:** See `references/analysis_modules.md` for comprehensive analysis module documentation.

## Bundled Resources

### Scripts (`scripts/`)

Executable Python scripts for common tasks:

- **`structure_converter.py`**: Convert between structure file formats
  - Supports batch conversion and automatic format detection
  - Usage: `python scripts/structure_converter.py POSCAR structure.cif`

- **`structure_analyzer.py`**: Comprehensive structure analysis
  - Symmetry, coordination, lattice parameters, distance matrix
  - Usage: `python scripts/structure_analyzer.py structure.cif --symmetry --neighbors`

- **`phase_diagram_generator.py`**: Generate phase diagrams from Materials Project
  - Stability analysis and thermodynamic properties
  - Usage: `python scripts/phase_diagram_generator.py Li-Fe-O --analyze "LiFeO2"`

All scripts include detailed help: `python scripts/script_name.py --help`

### References (`references/`)

Comprehensive documentation loaded into context as needed:

- **`core_classes.md`**: Element, Structure, Lattice, Molecule, Composition classes
- **`io_formats.md`**: File format support and code integration (VASP, Gaussian, etc.)
- **`analysis_modules.md`**: Phase diagrams, surfaces, electronic structure, symmetry
- **`materials_project_api.md`**: Complete Materials Project API guide
- **`transformations_workflows.md`**: Transformations framework and common workflows

Load references when detailed information is needed about specific modules or workflows.

## Common Workflows

### High-Throughput Structure Generation

```python
from pymatgen.transformations.standard_transformations import SubstitutionTransformation
from pymatgen.io.vasp.sets import MPRelaxSet

# Generate doped structures
base_struct = Structure.from_file("POSCAR")
dopants = ["Mn", "Co", "Ni", "Cu"]

for dopant in dopants:
    trans = SubstitutionTransformation({"Fe": dopant})
    doped_struct = trans.apply_transformation(base_struct)

    # Generate VASP inputs
    vasp_input = MPRelaxSet(doped_struct)
    vasp_input.write_input(f"./calcs/Fe_{dopant}")
```

### Band Structure Calculation Workflow

```python
# 1. Relaxation
relax = MPRelaxSet(struct)
relax.write_input("./1_relax")

# 2. Static (after relaxation)
relaxed = Structure.from_file("1_relax/CONTCAR")
static = MPStaticSet(relaxed)
static.write_input("./2_static")

# 3. Band structure (non-self-consistent)
nscf = MPNonSCFSet(relaxed, mode="line")
nscf.write_input("./3_bandstructure")

# 4. Analysis
from pymatgen.io.vasp import Vasprun
vasprun = Vasprun("3_bandstructure/vasprun.xml")
bs = vasprun.get_band_structure()
bs.get_band_gap()
```

### Surface Energy Calculation

```python
# 1. Get bulk energy
bulk_vasprun = Vasprun("bulk/vasprun.xml")
bulk_E_per_atom = bulk_vasprun.final_energy / len(bulk)

# 2. Generate and calculate slabs
slabgen = SlabGenerator(bulk, (1,1,1), 10, 15)
slab = slabgen.get_slabs()[0]

MPRelaxSet(slab).write_input("./slab_calc")

# 3. Calculate surface energy (after calculation)
slab_vasprun = Vasprun("slab_calc/vasprun.xml")
E_surf = (slab_vasprun.final_energy - len(slab) * bulk_E_per_atom) / (2 * slab.surface_area)
E_surf *= 16.021766  # Convert eV/Ų to J/m²
```

**More workflows:** See `references/transformations_workflows.md` for 10 detailed workflow examples.

## Best Practices

### Structure Handling

1. **Use automatic format detection**: `Structure.from_file()` handles most formats
2. **Prefer immutable structures**: Use `IStructure` when structure shouldn't change
3. **Check symmetry**: Use `SpacegroupAnalyzer` to reduce to primitive cell
4. **Validate structures**: Check for overlapping atoms or unreasonable bond lengths

### File I/O

1. **Use convenience methods**: `from_file()` and `to()` are preferred
2. **Specify formats explicitly**: When automatic detection fails
3. **Handle exceptions**: Wrap file I/O in try-except blocks
4. **Use serialization**: `as_dict()`/`from_dict()` for version-safe storage

### Materials Project API

1. **Use context manager**: Always use `with MPRester() as mpr:`
2. **Batch queries**: Request multiple items at once
3. **Cache results**: Save frequently used data locally
4. **Filter effectively**: Use property filters to reduce data transfer

### Computational Workflows

1. **Use input sets**: Prefer `MPRelaxSet`, `MPStaticSet` over manual INCAR
2. **Check convergence**: Always verify calculations converged
3. **Track transformations**: Use `TransformedStructure` for provenance
4. **Organize calculations**: Use clear directory structures

### Performance

1. **Reduce symmetry**: Use primitive cells when possible
2. **Limit neighbor searches**: Specify reasonable cutoff radii
3. **Use appropriate methods**: Different analysis tools have different speed/accuracy tradeoffs
4. **Parallelize when possible**: Many operations can be parallelized

## Units and Conventions

Pymatgen uses atomic units throughout:
- **Lengths**: Angstroms (Å)
- **Energies**: Electronvolts (eV)
- **Angles**: Degrees (°)
- **Magnetic moments**: Bohr magnetons (μB)
- **Time**: Femtoseconds (fs)

Convert units using `pymatgen.core.units` when needed.

## Integration with Other Tools

Pymatgen integrates seamlessly with:
- **ASE** (Atomic Simulation Environment)
- **Phonopy** (phonon calculations)
- **BoltzTraP** (transport properties)
- **Atomate/Fireworks** (workflow management)
- **AiiDA** (provenance tracking)
- **Zeo++** (pore analysis)
- **OpenBabel** (molecule conversion)

## Troubleshooting

**Import errors**: Install missing dependencies
```bash
uv pip install pymatgen[analysis,vis]
```

**API key not found**: Set MP_API_KEY environment variable
```bash
export MP_API_KEY="your_key_here"
```

**Structure read failures**: Check file format and syntax
```python
# Try explicit format specification
struct = Structure.from_file("file.txt", fmt="cif")
```

**Symmetry analysis fails**: Structure may have numerical precision issues
```python
# Increase tolerance
from pymatgen.symmetry.analyzer import SpacegroupAnalyzer
sga = SpacegroupAnalyzer(struct, symprec=0.1)
```

## Additional Resources

- **Documentation**: https://pymatgen.org/
- **Materials Project**: https://materialsproject.org/
- **GitHub**: https://github.com/materialsproject/pymatgen
- **Forum**: https://matsci.org/
- **Example notebooks**: https://matgenb.materialsvirtuallab.org/

## Version Notes

This skill is designed for pymatgen 2024.x and later. For the Materials Project API, use the `mp-api` package (separate from legacy `pymatgen.ext.matproj`).

Requirements:
- Python 3.10 or higher
- pymatgen >= 2023.x
- mp-api (for Materials Project access)

