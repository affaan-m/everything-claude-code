# Pymatgen Core Classes Reference

This reference documents the fundamental classes in `pymatgen.core` that form the foundation for materials analysis.

## Architecture Principles

Pymatgen follows an object-oriented design where elements, sites, and structures are represented as objects. The framework emphasizes periodic boundary conditions for crystal representation while maintaining flexibility for molecular systems.

**Unit Conventions**: All units in pymatgen are typically assumed to be in atomic units:
- Lengths: angstroms (Å)
- Energies: electronvolts (eV)
- Angles: degrees

## Element and Periodic Table

### Element
Represents periodic table elements with comprehensive properties.

**Creation methods:**
```python
from pymatgen.core import Element

# Create from symbol
si = Element("Si")
# Create from atomic number
si = Element.from_Z(14)
# Create from name
si = Element.from_name("silicon")
```

**Key properties:**
- `atomic_mass`: Atomic mass in amu
- `atomic_radius`: Atomic radius in angstroms
- `electronegativity`: Pauling electronegativity
- `ionization_energy`: First ionization energy in eV
- `common_oxidation_states`: List of common oxidation states
- `is_metal`, `is_halogen`, `is_noble_gas`, etc.: Boolean properties
- `X`: Element symbol as string

### Species
Extends Element for charged ions and specific oxidation states.

```python
from pymatgen.core import Species

# Create an Fe2+ ion
fe2 = Species("Fe", 2)
# Or with explicit sign
fe2 = Species("Fe", +2)
```

### DummySpecies
Placeholder atoms for special structural representations (e.g., vacancies).

```python
from pymatgen.core import DummySpecies

vacancy = DummySpecies("X")
```

## Composition

Represents chemical formulas and compositions, enabling chemical analysis and manipulation.

### Creation
```python
from pymatgen.core import Composition

# From string formula
comp = Composition("Fe2O3")
# From dictionary
comp = Composition({"Fe": 2, "O": 3})
# From weight dictionary
comp = Composition.from_weight_dict({"Fe": 111.69, "O": 48.00})
```

### Key methods
- `get_reduced_formula_and_factor()`: Returns reduced formula and multiplication factor
- `oxi_state_guesses()`: Attempts to determine oxidation states
- `replace(replacements_dict)`: Replace elements
- `add_charges_from_oxi_state_guesses()`: Infer and add oxidation states
- `is_element`: Check if composition is a single element

### Key properties
- `weight`: Molecular weight
- `reduced_formula`: Reduced chemical formula
- `hill_formula`: Formula in Hill notation (C, H, then alphabetical)
- `num_atoms`: Total number of atoms
- `chemical_system`: Alphabetically sorted elements (e.g., "Fe-O")
- `element_composition`: Dictionary of element to amount

## Lattice

Defines unit cell geometry for crystal structures.

### Creation
```python
from pymatgen.core import Lattice

# From lattice parameters
lattice = Lattice.from_parameters(a=3.84, b=3.84, c=3.84,
                                  alpha=120, beta=90, gamma=60)

# From matrix (row vectors are lattice vectors)
lattice = Lattice([[3.84, 0, 0],
                   [0, 3.84, 0],
                   [0, 0, 3.84]])

# Cubic lattice
lattice = Lattice.cubic(3.84)
# Hexagonal lattice
lattice = Lattice.hexagonal(a=2.95, c=4.68)
```

### Key methods
- `get_niggli_reduced_lattice()`: Returns Niggli-reduced lattice
- `get_distance_and_image(frac_coords1, frac_coords2)`: Distance between fractional coordinates with periodic boundary conditions
- `get_all_distances(frac_coords1, frac_coords2)`: Distances including periodic images

### Key properties
- `volume`: Volume of the unit cell (Å³)
- `abc`: Lattice parameters (a, b, c) as tuple
- `angles`: Lattice angles (alpha, beta, gamma) as tuple
- `matrix`: 3x3 matrix of lattice vectors
- `reciprocal_lattice`: Reciprocal lattice object
- `is_orthogonal`: Whether lattice vectors are orthogonal

## Sites

### Site
Represents an atomic position in non-periodic systems.

```python
from pymatgen.core import Site

site = Site("Si", [0.0, 0.0, 0.0])  # Species and Cartesian coordinates
```

### PeriodicSite
Represents an atomic position in a periodic lattice with fractional coordinates.

```python
from pymatgen.core import PeriodicSite

site = PeriodicSite("Si", [0.5, 0.5, 0.5], lattice)  # Species, fractional coords, lattice
```

**Key methods:**
- `distance(other_site)`: Distance to another site
- `is_periodic_image(other_site)`: Check if sites are periodic images

**Key properties:**
- `species`: Species or element at the site
- `coords`: Cartesian coordinates
- `frac_coords`: Fractional coordinates (for PeriodicSite)
- `x`, `y`, `z`: Individual Cartesian coordinates

## Structure

Represents a crystal structure as a collection of periodic sites. `Structure` is mutable, while `IStructure` is immutable.

### Creation
```python
from pymatgen.core import Structure, Lattice

# From scratch
coords = [[0, 0, 0], [0.75, 0.5, 0.75]]
lattice = Lattice.from_parameters(a=3.84, b=3.84, c=3.84,
                                  alpha=120, beta=90, gamma=60)
struct = Structure(lattice, ["Si", "Si"], coords)

# From file (automatic format detection)
struct = Structure.from_file("POSCAR")
struct = Structure.from_file("structure.cif")

# From spacegroup
struct = Structure.from_spacegroup("Fm-3m", Lattice.cubic(3.5),
                                   ["Si"], [[0, 0, 0]])
```

### File I/O
```python
# Write to file (format inferred from extension)
struct.to(filename="output.cif")
struct.to(filename="POSCAR")
struct.to(filename="structure.xyz")

# Get string representation
cif_string = struct.to(fmt="cif")
poscar_string = struct.to(fmt="poscar")
```

### Key methods

**Structure modification:**
- `append(species, coords)`: Add a site
- `insert(i, species, coords)`: Insert site at index
- `remove_sites(indices)`: Remove sites by index
- `replace(i, species)`: Replace species at index
- `apply_strain(strain)`: Apply strain to structure
- `perturb(distance)`: Randomly perturb atomic positions
- `make_supercell(scaling_matrix)`: Create supercell
- `get_primitive_structure()`: Get primitive cell

**Analysis:**
- `get_distance(i, j)`: Distance between sites i and j
- `get_neighbors(site, r)`: Get neighbors within radius r
- `get_all_neighbors(r)`: Get all neighbors for all sites
- `get_space_group_info()`: Get space group information
- `matches(other_struct)`: Check if structures match

**Interpolation:**
- `interpolate(end_structure, nimages)`: Interpolate between structures

### Key properties
- `lattice`: Lattice object
- `species`: List of species at each site
- `sites`: List of PeriodicSite objects
- `num_sites`: Number of sites
- `volume`: Volume of the structure
- `density`: Density in g/cm³
- `composition`: Composition object
- `formula`: Chemical formula
- `distance_matrix`: Matrix of pairwise distances

## Molecule

Represents non-periodic collections of atoms. `Molecule` is mutable, while `IMolecule` is immutable.

### Creation
```python
from pymatgen.core import Molecule

# From scratch
coords = [[0.00, 0.00, 0.00],
          [0.00, 0.00, 1.08]]
mol = Molecule(["C", "O"], coords)

# From file
mol = Molecule.from_file("molecule.xyz")
mol = Molecule.from_file("molecule.mol")
```

### Key methods
- `get_covalent_bonds()`: Returns bonds based on covalent radii
- `get_neighbors(site, r)`: Get neighbors within radius
- `get_zmatrix()`: Get Z-matrix representation
- `get_distance(i, j)`: Distance between sites
- `get_centered_molecule()`: Center molecule at origin

### Key properties
- `species`: List of species
- `sites`: List of Site objects
- `num_sites`: Number of atoms
- `charge`: Total charge of molecule
- `spin_multiplicity`: Spin multiplicity
- `center_of_mass`: Center of mass coordinates

## Serialization

All core objects implement `as_dict()` and `from_dict()` methods for robust JSON/YAML persistence.

```python
# Serialize to dictionary
struct_dict = struct.as_dict()

# Write to JSON
import json
with open("structure.json", "w") as f:
    json.dump(struct_dict, f)

# Read from JSON
with open("structure.json", "r") as f:
    struct_dict = json.load(f)
    struct = Structure.from_dict(struct_dict)
```

This approach addresses limitations of Python pickling and maintains compatibility across pymatgen versions.

## Additional Core Classes

### CovalentBond
Represents bonds in molecules.

**Key properties:**
- `length`: Bond length
- `get_bond_order()`: Returns bond order (single, double, triple)

### Ion
Represents charged ionic species with oxidation states.

```python
from pymatgen.core import Ion

# Create Fe2+ ion
fe2_ion = Ion.from_formula("Fe2+")
```

### Interface
Represents substrate-film combinations for heterojunction analysis.

### GrainBoundary
Represents crystallographic grain boundaries.

### Spectrum
Represents spectroscopic data with methods for normalization and processing.

**Key methods:**
- `normalize(mode="max")`: Normalize spectrum
- `smear(sigma)`: Apply Gaussian smearing

## Best Practices

1. **Immutability**: Use immutable versions (`IStructure`, `IMolecule`) when structures shouldn't be modified
2. **Serialization**: Prefer `as_dict()`/`from_dict()` over pickle for long-term storage
3. **Units**: Always work in atomic units (Å, eV) - conversions are available in `pymatgen.core.units`
4. **File I/O**: Use `from_file()` for automatic format detection
5. **Coordinates**: Pay attention to whether methods expect Cartesian or fractional coordinates
