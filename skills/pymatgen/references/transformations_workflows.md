# Pymatgen Transformations and Common Workflows

This reference documents pymatgen's transformation framework and provides recipes for common materials science workflows.

## Transformation Framework

Transformations provide a systematic way to modify structures while tracking the history of modifications.

### Standard Transformations

Located in `pymatgen.transformations.standard_transformations`.

#### SupercellTransformation

Create supercells with arbitrary scaling matrices.

```python
from pymatgen.transformations.standard_transformations import SupercellTransformation

# Simple 2x2x2 supercell
trans = SupercellTransformation([[2,0,0], [0,2,0], [0,0,2]])
new_struct = trans.apply_transformation(struct)

# Non-orthogonal supercell
trans = SupercellTransformation([[2,1,0], [0,2,0], [0,0,2]])
new_struct = trans.apply_transformation(struct)
```

#### SubstitutionTransformation

Replace species in a structure.

```python
from pymatgen.transformations.standard_transformations import SubstitutionTransformation

# Replace all Fe with Mn
trans = SubstitutionTransformation({"Fe": "Mn"})
new_struct = trans.apply_transformation(struct)

# Partial substitution (50% Fe -> Mn)
trans = SubstitutionTransformation({"Fe": {"Mn": 0.5, "Fe": 0.5}})
new_struct = trans.apply_transformation(struct)
```

#### RemoveSpeciesTransformation

Remove specific species from structure.

```python
from pymatgen.transformations.standard_transformations import RemoveSpeciesTransformation

trans = RemoveSpeciesTransformation(["H"])  # Remove all hydrogen
new_struct = trans.apply_transformation(struct)
```

#### OrderDisorderedStructureTransformation

Order disordered structures with partial occupancies.

```python
from pymatgen.transformations.standard_transformations import OrderDisorderedStructureTransformation

trans = OrderDisorderedStructureTransformation()
new_struct = trans.apply_transformation(disordered_struct)
```

#### PrimitiveCellTransformation

Convert to primitive cell.

```python
from pymatgen.transformations.standard_transformations import PrimitiveCellTransformation

trans = PrimitiveCellTransformation()
primitive_struct = trans.apply_transformation(struct)
```

#### ConventionalCellTransformation

Convert to conventional cell.

```python
from pymatgen.transformations.standard_transformations import ConventionalCellTransformation

trans = ConventionalCellTransformation()
conventional_struct = trans.apply_transformation(struct)
```

#### RotationTransformation

Rotate structure.

```python
from pymatgen.transformations.standard_transformations import RotationTransformation

# Rotate by axis and angle
trans = RotationTransformation([0, 0, 1], 45)  # 45° around z-axis
new_struct = trans.apply_transformation(struct)
```

#### ScaleToRelaxedTransformation

Scale lattice to match a relaxed structure.

```python
from pymatgen.transformations.standard_transformations import ScaleToRelaxedTransformation

trans = ScaleToRelaxedTransformation(relaxed_struct)
scaled_struct = trans.apply_transformation(unrelaxed_struct)
```

### Advanced Transformations

Located in `pymatgen.transformations.advanced_transformations`.

#### EnumerateStructureTransformation

Enumerate all symmetrically distinct ordered structures from a disordered structure.

```python
from pymatgen.transformations.advanced_transformations import EnumerateStructureTransformation

# Enumerate structures up to max 8 atoms per unit cell
trans = EnumerateStructureTransformation(max_cell_size=8)
structures = trans.apply_transformation(struct, return_ranked_list=True)

# Returns list of ranked structures
for s in structures[:5]:  # Top 5 structures
    print(f"Energy: {s['energy']}, Structure: {s['structure']}")
```

#### MagOrderingTransformation

Enumerate magnetic orderings.

```python
from pymatgen.transformations.advanced_transformations import MagOrderingTransformation

# Specify magnetic moments for each species
trans = MagOrderingTransformation({"Fe": 5.0, "Ni": 2.0})
mag_structures = trans.apply_transformation(struct, return_ranked_list=True)
```

#### DopingTransformation

Systematically dope a structure.

```python
from pymatgen.transformations.advanced_transformations import DopingTransformation

# Replace 12.5% of Fe sites with Mn
trans = DopingTransformation("Mn", min_length=10)
doped_structs = trans.apply_transformation(struct, return_ranked_list=True)
```

#### ChargeBalanceTransformation

Balance charge in a structure by oxidation state manipulation.

```python
from pymatgen.transformations.advanced_transformations import ChargeBalanceTransformation

trans = ChargeBalanceTransformation("Li")
charged_struct = trans.apply_transformation(struct)
```

#### SlabTransformation

Generate surface slabs.

```python
from pymatgen.transformations.advanced_transformations import SlabTransformation

trans = SlabTransformation(
    miller_index=[1, 0, 0],
    min_slab_size=10,
    min_vacuum_size=10,
    shift=0,
    lll_reduce=True
)
slab = trans.apply_transformation(struct)
```

### Chaining Transformations

```python
from pymatgen.alchemy.materials import TransformedStructure

# Create transformed structure that tracks history
ts = TransformedStructure(struct, [])

# Apply multiple transformations
ts.append_transformation(SupercellTransformation([[2,0,0],[0,2,0],[0,0,2]]))
ts.append_transformation(SubstitutionTransformation({"Fe": "Mn"}))
ts.append_transformation(PrimitiveCellTransformation())

# Get final structure
final_struct = ts.final_structure

# View transformation history
print(ts.history)
```

## Common Workflows

### Workflow 1: High-Throughput Structure Generation

Generate multiple structures for screening studies.

```python
from pymatgen.core import Structure
from pymatgen.transformations.standard_transformations import (
    SubstitutionTransformation,
    SupercellTransformation
)
from pymatgen.io.vasp.sets import MPRelaxSet

# Starting structure
base_struct = Structure.from_file("POSCAR")

# Define substitutions
dopants = ["Mn", "Co", "Ni", "Cu"]
structures = {}

for dopant in dopants:
    # Create substituted structure
    trans = SubstitutionTransformation({"Fe": dopant})
    new_struct = trans.apply_transformation(base_struct)

    # Generate VASP inputs
    vasp_input = MPRelaxSet(new_struct)
    vasp_input.write_input(f"./calcs/Fe_{dopant}")

    structures[dopant] = new_struct

print(f"Generated {len(structures)} structures")
```

### Workflow 2: Phase Diagram Construction

Build and analyze phase diagrams from Materials Project data.

```python
from mp_api.client import MPRester
from pymatgen.analysis.phase_diagram import PhaseDiagram, PDPlotter
from pymatgen.core import Composition

# Get data from Materials Project
with MPRester() as mpr:
    entries = mpr.get_entries_in_chemsys("Li-Fe-O")

# Build phase diagram
pd = PhaseDiagram(entries)

# Analyze specific composition
comp = Composition("LiFeO2")
e_above_hull = pd.get_e_above_hull(entries[0])

# Get decomposition products
decomp = pd.get_decomposition(comp)
print(f"Decomposition: {decomp}")

# Visualize
plotter = PDPlotter(pd)
plotter.show()
```

### Workflow 3: Surface Energy Calculation

Calculate surface energies from slab calculations.

```python
from pymatgen.core.surface import SlabGenerator, generate_all_slabs
from pymatgen.io.vasp.sets import MPStaticSet, MPRelaxSet
from pymatgen.core import Structure

# Read bulk structure
bulk = Structure.from_file("bulk_POSCAR")

# Get bulk energy (from previous calculation)
from pymatgen.io.vasp import Vasprun
bulk_vasprun = Vasprun("bulk/vasprun.xml")
bulk_energy_per_atom = bulk_vasprun.final_energy / len(bulk)

# Generate slabs
miller_indices = [(1,0,0), (1,1,0), (1,1,1)]
surface_energies = {}

for miller in miller_indices:
    slabgen = SlabGenerator(
        bulk,
        miller_index=miller,
        min_slab_size=10,
        min_vacuum_size=15,
        center_slab=True
    )

    slab = slabgen.get_slabs()[0]

    # Write VASP input for slab
    relax = MPRelaxSet(slab)
    relax.write_input(f"./slab_{miller[0]}{miller[1]}{miller[2]}")

    # After calculation, compute surface energy:
    # slab_vasprun = Vasprun(f"slab_{miller[0]}{miller[1]}{miller[2]}/vasprun.xml")
    # slab_energy = slab_vasprun.final_energy
    # n_atoms = len(slab)
    # area = slab.surface_area  # in Ų
    #
    # # Surface energy (J/m²)
    # surf_energy = (slab_energy - n_atoms * bulk_energy_per_atom) / (2 * area)
    # surf_energy *= 16.021766  # Convert eV/Ų to J/m²
    # surface_energies[miller] = surf_energy

print(f"Set up calculations for {len(miller_indices)} surfaces")
```

### Workflow 4: Band Structure Calculation

Complete workflow for band structure calculations.

```python
from pymatgen.core import Structure
from pymatgen.io.vasp.sets import MPRelaxSet, MPStaticSet, MPNonSCFSet
from pymatgen.symmetry.bandstructure import HighSymmKpath

# Step 1: Relaxation
struct = Structure.from_file("initial_POSCAR")
relax = MPRelaxSet(struct)
relax.write_input("./1_relax")

# After relaxation, read structure
relaxed_struct = Structure.from_file("1_relax/CONTCAR")

# Step 2: Static calculation
static = MPStaticSet(relaxed_struct)
static.write_input("./2_static")

# Step 3: Band structure (non-self-consistent)
kpath = HighSymmKpath(relaxed_struct)
nscf = MPNonSCFSet(relaxed_struct, mode="line")  # Band structure mode
nscf.write_input("./3_bandstructure")

# After calculations, analyze
from pymatgen.io.vasp import Vasprun
from pymatgen.electronic_structure.plotter import BSPlotter

vasprun = Vasprun("3_bandstructure/vasprun.xml")
bs = vasprun.get_band_structure(line_mode=True)

print(f"Band gap: {bs.get_band_gap()}")

plotter = BSPlotter(bs)
plotter.save_plot("band_structure.png")
```

### Workflow 5: Molecular Dynamics Setup

Set up and analyze molecular dynamics simulations.

```python
from pymatgen.core import Structure
from pymatgen.io.vasp.sets import MVLRelaxSet
from pymatgen.io.vasp.inputs import Incar

# Read structure
struct = Structure.from_file("POSCAR")

# Create 2x2x2 supercell for MD
from pymatgen.transformations.standard_transformations import SupercellTransformation
trans = SupercellTransformation([[2,0,0],[0,2,0],[0,0,2]])
supercell = trans.apply_transformation(struct)

# Set up VASP input
md_input = MVLRelaxSet(supercell)

# Modify INCAR for MD
incar = md_input.incar
incar.update({
    "IBRION": 0,      # Molecular dynamics
    "NSW": 1000,      # Number of steps
    "POTIM": 2,       # Time step (fs)
    "TEBEG": 300,     # Initial temperature (K)
    "TEEND": 300,     # Final temperature (K)
    "SMASS": 0,       # NVT ensemble
    "MDALGO": 2,      # Nose-Hoover thermostat
})

md_input.incar = incar
md_input.write_input("./md_calc")
```

### Workflow 6: Diffusion Analysis

Analyze ion diffusion from AIMD trajectories.

```python
from pymatgen.io.vasp import Xdatcar
from pymatgen.analysis.diffusion.analyzer import DiffusionAnalyzer

# Read trajectory from XDATCAR
xdatcar = Xdatcar("XDATCAR")
structures = xdatcar.structures

# Analyze diffusion for specific species (e.g., Li)
analyzer = DiffusionAnalyzer.from_structures(
    structures,
    specie="Li",
    temperature=300,  # K
    time_step=2,      # fs
    step_skip=10      # Skip initial equilibration
)

# Get diffusivity
diffusivity = analyzer.diffusivity  # cm²/s
conductivity = analyzer.conductivity  # mS/cm

# Get mean squared displacement
msd = analyzer.msd

# Plot MSD
analyzer.plot_msd()

print(f"Diffusivity: {diffusivity:.2e} cm²/s")
print(f"Conductivity: {conductivity:.2e} mS/cm")
```

### Workflow 7: Structure Prediction and Enumeration

Predict and enumerate possible structures.

```python
from pymatgen.core import Structure, Lattice
from pymatgen.transformations.advanced_transformations import (
    EnumerateStructureTransformation,
    SubstitutionTransformation
)

# Start with a known structure type (e.g., rocksalt)
lattice = Lattice.cubic(4.2)
struct = Structure.from_spacegroup("Fm-3m", lattice, ["Li", "O"], [[0,0,0], [0.5,0.5,0.5]])

# Create disordered structure
from pymatgen.core import Species
species_on_site = {Species("Li"): 0.5, Species("Na"): 0.5}
struct[0] = species_on_site  # Mixed occupancy on Li site

# Enumerate all ordered structures
trans = EnumerateStructureTransformation(max_cell_size=4)
ordered_structs = trans.apply_transformation(struct, return_ranked_list=True)

print(f"Found {len(ordered_structs)} distinct ordered structures")

# Write all structures
for i, s_dict in enumerate(ordered_structs[:10]):  # Top 10
    s_dict['structure'].to(filename=f"ordered_struct_{i}.cif")
```

### Workflow 8: Elastic Constant Calculation

Calculate elastic constants using the stress-strain method.

```python
from pymatgen.core import Structure
from pymatgen.transformations.standard_transformations import DeformStructureTransformation
from pymatgen.io.vasp.sets import MPStaticSet

# Read equilibrium structure
struct = Structure.from_file("relaxed_POSCAR")

# Generate deformed structures
strains = [0.00, 0.01, 0.02, -0.01, -0.02]  # Applied strains
deformation_sets = []

for strain in strains:
    # Apply strain in different directions
    trans = DeformStructureTransformation([[1+strain, 0, 0], [0, 1, 0], [0, 0, 1]])
    deformed = trans.apply_transformation(struct)

    # Set up VASP calculation
    static = MPStaticSet(deformed)
    static.write_input(f"./strain_{strain:.2f}")

# After calculations, fit stress vs strain to get elastic constants
# from pymatgen.analysis.elasticity import ElasticTensor
# ... (collect stress tensors from OUTCAR)
# elastic_tensor = ElasticTensor.from_stress_list(stress_list)
```

### Workflow 9: Adsorption Energy Calculation

Calculate adsorption energies on surfaces.

```python
from pymatgen.core import Structure, Molecule
from pymatgen.core.surface import SlabGenerator
from pymatgen.analysis.adsorption import AdsorbateSiteFinder
from pymatgen.io.vasp.sets import MPRelaxSet

# Generate slab
bulk = Structure.from_file("bulk_POSCAR")
slabgen = SlabGenerator(bulk, (1,1,1), 10, 10)
slab = slabgen.get_slabs()[0]

# Find adsorption sites
asf = AdsorbateSiteFinder(slab)
ads_sites = asf.find_adsorption_sites()

# Create adsorbate
adsorbate = Molecule("O", [[0, 0, 0]])

# Generate structures with adsorbate
ads_structs = asf.add_adsorbate(adsorbate, ads_sites["ontop"][0])

# Set up calculations
relax_slab = MPRelaxSet(slab)
relax_slab.write_input("./slab")

relax_ads = MPRelaxSet(ads_structs)
relax_ads.write_input("./slab_with_adsorbate")

# After calculations:
# E_ads = E(slab+adsorbate) - E(slab) - E(adsorbate_gas)
```

### Workflow 10: High-Throughput Materials Screening

Screen materials database for specific properties.

```python
from mp_api.client import MPRester
from pymatgen.core import Structure
import pandas as pd

# Define screening criteria
def screen_material(material):
    """Screen for potential battery cathode materials"""
    criteria = {
        "has_li": "Li" in material.composition.elements,
        "stable": material.energy_above_hull < 0.05,
        "good_voltage": 2.5 < material.formation_energy_per_atom < 4.5,
        "electronically_conductive": material.band_gap < 0.5
    }
    return all(criteria.values()), criteria

# Query Materials Project
with MPRester() as mpr:
    # Get potential materials
    materials = mpr.materials.summary.search(
        elements=["Li"],
        energy_above_hull=(0, 0.05),
    )

    results = []
    for mat in materials:
        passes, criteria = screen_material(mat)
        if passes:
            results.append({
                "material_id": mat.material_id,
                "formula": mat.formula_pretty,
                "energy_above_hull": mat.energy_above_hull,
                "band_gap": mat.band_gap,
            })

    # Save results
    df = pd.DataFrame(results)
    df.to_csv("screened_materials.csv", index=False)

    print(f"Found {len(results)} promising materials")
```

## Best Practices for Workflows

1. **Modular design**: Break workflows into discrete steps
2. **Error handling**: Check file existence and calculation convergence
3. **Documentation**: Track transformation history using `TransformedStructure`
4. **Version control**: Store input parameters and scripts in git
5. **Automation**: Use workflow managers (Fireworks, AiiDA) for complex pipelines
6. **Data management**: Organize calculations in clear directory structures
7. **Validation**: Always validate intermediate results before proceeding

## Integration with Workflow Tools

Pymatgen integrates with several workflow management systems:

- **Atomate**: Pre-built VASP workflows
- **Fireworks**: Workflow execution engine
- **AiiDA**: Provenance tracking and workflow management
- **Custodian**: Error correction and job monitoring

These tools provide robust automation for production calculations.
