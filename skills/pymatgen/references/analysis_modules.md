# Pymatgen Analysis Modules Reference

This reference documents pymatgen's extensive analysis capabilities for materials characterization, property prediction, and computational analysis.

## Phase Diagrams and Thermodynamics

### Phase Diagram Construction

```python
from pymatgen.analysis.phase_diagram import PhaseDiagram, PDPlotter
from pymatgen.entries.computed_entries import ComputedEntry

# Create entries (composition and total energy)
entries = [
    ComputedEntry("Fe", -8.4),
    ComputedEntry("O2", -4.9),
    ComputedEntry("FeO", -6.7),
    ComputedEntry("Fe2O3", -8.3),
    ComputedEntry("Fe3O4", -9.1),
]

# Build phase diagram
pd = PhaseDiagram(entries)

# Get stable entries
stable_entries = pd.stable_entries

# Get energy above hull (stability)
entry_to_test = ComputedEntry("Fe2O3", -8.0)
energy_above_hull = pd.get_e_above_hull(entry_to_test)

# Get decomposition products
decomp = pd.get_decomposition(entry_to_test.composition)
# Returns: {entry1: fraction1, entry2: fraction2, ...}

# Get equilibrium reaction energy
rxn_energy = pd.get_equilibrium_reaction_energy(entry_to_test)

# Plot phase diagram
plotter = PDPlotter(pd)
plotter.show()
plotter.write_image("phase_diagram.png")
```

### Chemical Potential Diagrams

```python
from pymatgen.analysis.phase_diagram import ChemicalPotentialDiagram

# Create chemical potential diagram
cpd = ChemicalPotentialDiagram(entries, limits={"O": (-10, 0)})

# Get domains (stability regions)
domains = cpd.domains
```

### Pourbaix Diagrams

Electrochemical phase diagrams with pH and potential axes.

```python
from pymatgen.analysis.pourbaix_diagram import PourbaixDiagram, PourbaixPlotter
from pymatgen.entries.computed_entries import ComputedEntry

# Create entries with corrections for aqueous species
entries = [...]  # Include solids and ions

# Build Pourbaix diagram
pb = PourbaixDiagram(entries)

# Get stable entry at specific pH and potential
stable_entry = pb.get_stable_entry(pH=7, V=0)

# Plot
plotter = PourbaixPlotter(pb)
plotter.show()
```

## Structure Analysis

### Structure Matching and Comparison

```python
from pymatgen.analysis.structure_matcher import StructureMatcher

matcher = StructureMatcher()

# Check if structures match
is_match = matcher.fit(struct1, struct2)

# Get mapping between structures
mapping = matcher.get_mapping(struct1, struct2)

# Group similar structures
grouped = matcher.group_structures([struct1, struct2, struct3, ...])
```

### Ewald Summation

Calculate electrostatic energy of ionic structures.

```python
from pymatgen.analysis.ewald import EwaldSummation

ewald = EwaldSummation(struct)
total_energy = ewald.total_energy  # In eV
forces = ewald.forces  # Forces on each site
```

### Symmetry Analysis

```python
from pymatgen.symmetry.analyzer import SpacegroupAnalyzer

sga = SpacegroupAnalyzer(struct)

# Get space group information
spacegroup_symbol = sga.get_space_group_symbol()  # e.g., "Fm-3m"
spacegroup_number = sga.get_space_group_number()   # e.g., 225
crystal_system = sga.get_crystal_system()           # e.g., "cubic"

# Get symmetrized structure
sym_struct = sga.get_symmetrized_structure()
equivalent_sites = sym_struct.equivalent_sites

# Get conventional/primitive cells
conventional = sga.get_conventional_standard_structure()
primitive = sga.get_primitive_standard_structure()

# Get symmetry operations
symmetry_ops = sga.get_symmetry_operations()
```

## Local Environment Analysis

### Coordination Environment

```python
from pymatgen.analysis.local_env import (
    VoronoiNN,           # Voronoi tessellation
    CrystalNN,           # Crystal-based
    MinimumDistanceNN,   # Distance cutoff
    BrunnerNN_real,      # Brunner method
)

# Voronoi nearest neighbors
voronoi = VoronoiNN()
neighbors = voronoi.get_nn_info(struct, n=0)  # Neighbors of site 0

# CrystalNN (recommended for most cases)
crystalnn = CrystalNN()
neighbors = crystalnn.get_nn_info(struct, n=0)

# Analyze all sites
for i, site in enumerate(struct):
    neighbors = voronoi.get_nn_info(struct, i)
    coordination_number = len(neighbors)
    print(f"Site {i} ({site.species_string}): CN = {coordination_number}")
```

### Coordination Geometry (ChemEnv)

Detailed coordination environment identification.

```python
from pymatgen.analysis.chemenv.coordination_environments.coordination_geometry_finder import LocalGeometryFinder
from pymatgen.analysis.chemenv.coordination_environments.chemenv_strategies import SimplestChemenvStrategy

lgf = LocalGeometryFinder()
lgf.setup_structure(struct)

# Get coordination environment for site
se = lgf.compute_structure_environments(only_indices=[0])
strategy = SimplestChemenvStrategy()
lse = strategy.get_site_coordination_environment(se[0])

print(f"Coordination: {lse}")
```

### Bond Valence Sum

```python
from pymatgen.analysis.bond_valence import BVAnalyzer

bva = BVAnalyzer()

# Calculate oxidation states
valences = bva.get_valences(struct)

# Get structure with oxidation states
struct_with_oxi = bva.get_oxi_state_decorated_structure(struct)
```

## Surface and Interface Analysis

### Surface (Slab) Generation

```python
from pymatgen.core.surface import SlabGenerator, generate_all_slabs

# Generate slabs for a specific Miller index
slabgen = SlabGenerator(
    struct,
    miller_index=(1, 1, 1),
    min_slab_size=10.0,     # Minimum slab thickness (Å)
    min_vacuum_size=10.0,   # Minimum vacuum thickness (Å)
    center_slab=True
)

slabs = slabgen.get_slabs()

# Generate all slabs up to a Miller index
all_slabs = generate_all_slabs(
    struct,
    max_index=2,
    min_slab_size=10.0,
    min_vacuum_size=10.0
)
```

### Wulff Shape Construction

```python
from pymatgen.analysis.wulff import WulffShape

# Define surface energies (J/m²)
surface_energies = {
    (1, 0, 0): 1.0,
    (1, 1, 0): 1.1,
    (1, 1, 1): 0.9,
}

wulff = WulffShape(struct.lattice, surface_energies, symm_reduce=True)

# Get effective radius and surface area
effective_radius = wulff.effective_radius
surface_area = wulff.surface_area
volume = wulff.volume

# Visualize
wulff.show()
```

### Adsorption Site Finding

```python
from pymatgen.analysis.adsorption import AdsorbateSiteFinder

asf = AdsorbateSiteFinder(slab)

# Find adsorption sites
ads_sites = asf.find_adsorption_sites()
# Returns dictionary: {"ontop": [...], "bridge": [...], "hollow": [...]}

# Generate structures with adsorbates
from pymatgen.core import Molecule
adsorbate = Molecule("O", [[0, 0, 0]])

ads_structs = asf.generate_adsorption_structures(
    adsorbate,
    repeat=[2, 2, 1],  # Supercell to reduce adsorbate coverage
)
```

### Interface Construction

```python
from pymatgen.analysis.interfaces.coherent_interfaces import CoherentInterfaceBuilder

# Build interface between two materials
builder = CoherentInterfaceBuilder(
    substrate_structure=substrate,
    film_structure=film,
    substrate_miller=(0, 0, 1),
    film_miller=(1, 1, 1),
)

interfaces = builder.get_interfaces()
```

## Magnetism

### Magnetic Structure Analysis

```python
from pymatgen.analysis.magnetism import CollinearMagneticStructureAnalyzer

analyzer = CollinearMagneticStructureAnalyzer(struct)

# Get magnetic ordering
ordering = analyzer.ordering  # e.g., "FM" (ferromagnetic), "AFM", "FiM"

# Get magnetic space group
mag_space_group = analyzer.get_structure_with_spin().get_space_group_info()
```

### Magnetic Ordering Enumeration

```python
from pymatgen.transformations.advanced_transformations import MagOrderingTransformation

# Enumerate possible magnetic orderings
mag_trans = MagOrderingTransformation({"Fe": 5.0})  # Magnetic moment in μB
transformed_structures = mag_trans.apply_transformation(struct, return_ranked_list=True)
```

## Electronic Structure Analysis

### Band Structure Analysis

```python
from pymatgen.electronic_structure.bandstructure import BandStructureSymmLine
from pymatgen.electronic_structure.plotter import BSPlotter

# Read band structure from VASP calculation
from pymatgen.io.vasp import Vasprun
vasprun = Vasprun("vasprun.xml")
bs = vasprun.get_band_structure()

# Get band gap
band_gap = bs.get_band_gap()
# Returns: {'energy': gap_value, 'direct': True/False, 'transition': '...'}

# Check if metal
is_metal = bs.is_metal()

# Get VBM and CBM
vbm = bs.get_vbm()
cbm = bs.get_cbm()

# Plot band structure
plotter = BSPlotter(bs)
plotter.show()
plotter.save_plot("band_structure.png")
```

### Density of States (DOS)

```python
from pymatgen.electronic_structure.dos import CompleteDos
from pymatgen.electronic_structure.plotter import DosPlotter

# Read DOS from VASP calculation
vasprun = Vasprun("vasprun.xml")
dos = vasprun.complete_dos

# Get total DOS
total_dos = dos.densities

# Get projected DOS
pdos = dos.get_element_dos()  # By element
site_dos = dos.get_site_dos(struct[0])  # For specific site
spd_dos = dos.get_spd_dos()  # By orbital (s, p, d)

# Plot DOS
plotter = DosPlotter()
plotter.add_dos("Total", dos)
plotter.show()
```

### Fermi Surface

```python
from pymatgen.electronic_structure.boltztrap2 import BoltztrapRunner

runner = BoltztrapRunner(struct, nelec=n_electrons)
runner.run()

# Get transport properties at different temperatures
results = runner.get_results()
```

## Diffraction

### X-ray Diffraction (XRD)

```python
from pymatgen.analysis.diffraction.xrd import XRDCalculator

xrd = XRDCalculator()

pattern = xrd.get_pattern(struct, two_theta_range=(0, 90))

# Get peak data
for peak in pattern.hkls:
    print(f"2θ = {peak['2theta']:.2f}°, hkl = {peak['hkl']}, I = {peak['intensity']:.1f}")

# Plot pattern
pattern.plot()
```

### Neutron Diffraction

```python
from pymatgen.analysis.diffraction.neutron import NDCalculator

nd = NDCalculator()
pattern = nd.get_pattern(struct)
```

## Elasticity and Mechanical Properties

```python
from pymatgen.analysis.elasticity import ElasticTensor, Stress, Strain

# Create elastic tensor from matrix
elastic_tensor = ElasticTensor([[...]])  # 6x6 or 3x3x3x3 matrix

# Get mechanical properties
bulk_modulus = elastic_tensor.k_voigt  # Voigt bulk modulus (GPa)
shear_modulus = elastic_tensor.g_voigt  # Shear modulus (GPa)
youngs_modulus = elastic_tensor.y_mod  # Young's modulus (GPa)

# Apply strain
strain = Strain([[0.01, 0, 0], [0, 0, 0], [0, 0, 0]])
stress = elastic_tensor.calculate_stress(strain)
```

## Reaction Analysis

### Reaction Computation

```python
from pymatgen.analysis.reaction_calculator import ComputedReaction

reactants = [ComputedEntry("Fe", -8.4), ComputedEntry("O2", -4.9)]
products = [ComputedEntry("Fe2O3", -8.3)]

rxn = ComputedReaction(reactants, products)

# Get balanced equation
balanced_rxn = rxn.normalized_repr  # e.g., "2 Fe + 1.5 O2 -> Fe2O3"

# Get reaction energy
energy = rxn.calculated_reaction_energy  # eV per formula unit
```

### Reaction Path Finding

```python
from pymatgen.analysis.path_finder import ChgcarPotential, NEBPathfinder

# Read charge density
chgcar_potential = ChgcarPotential.from_file("CHGCAR")

# Find diffusion path
neb_path = NEBPathfinder(
    start_struct,
    end_struct,
    relax_sites=[i for i in range(len(start_struct))],
    v=chgcar_potential
)

images = neb_path.images  # Interpolated structures for NEB
```

## Molecular Analysis

### Bond Analysis

```python
# Get covalent bonds
bonds = mol.get_covalent_bonds()

for bond in bonds:
    print(f"{bond.site1.species_string} - {bond.site2.species_string}: {bond.length:.2f} Å")
```

### Molecule Graph

```python
from pymatgen.analysis.graphs import MoleculeGraph
from pymatgen.analysis.local_env import OpenBabelNN

# Build molecule graph
mg = MoleculeGraph.with_local_env_strategy(mol, OpenBabelNN())

# Get fragments
fragments = mg.get_disconnected_fragments()

# Find rings
rings = mg.find_rings()
```

## Spectroscopy

### X-ray Absorption Spectroscopy (XAS)

```python
from pymatgen.analysis.xas.spectrum import XAS

# Read XAS spectrum
xas = XAS.from_file("xas.dat")

# Normalize and process
xas.normalize()
```

## Additional Analysis Tools

### Grain Boundaries

```python
from pymatgen.analysis.gb.grain import GrainBoundaryGenerator

gb_gen = GrainBoundaryGenerator(struct)
gb_structures = gb_gen.generate_grain_boundaries(
    rotation_axis=[0, 0, 1],
    rotation_angle=36.87,  # degrees
)
```

### Prototypes and Structure Matching

```python
from pymatgen.analysis.prototypes import AflowPrototypeMatcher

matcher = AflowPrototypeMatcher()
prototype = matcher.get_prototypes(struct)
```

## Best Practices

1. **Start simple**: Use basic analysis before advanced methods
2. **Validate results**: Cross-check analysis with multiple methods
3. **Consider symmetry**: Use `SpacegroupAnalyzer` to reduce computational cost
4. **Check convergence**: Ensure input structures are well-converged
5. **Use appropriate methods**: Different analyses have different accuracy/speed tradeoffs
6. **Visualize results**: Use built-in plotters for quick validation
7. **Save intermediate results**: Complex analyses can be time-consuming
