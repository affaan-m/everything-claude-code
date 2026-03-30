# Materials Project API Reference

This reference documents how to access and use the Materials Project database through pymatgen's API integration.

## Overview

The Materials Project is a comprehensive database of computed materials properties, containing data on hundreds of thousands of inorganic crystals and molecules. The API provides programmatic access to this data through the `MPRester` client.

## Installation and Setup

The Materials Project API client is now in a separate package:

```bash
pip install mp-api
```

### Getting an API Key

1. Visit https://next-gen.materialsproject.org/
2. Create an account or log in
3. Navigate to your dashboard/settings
4. Generate an API key
5. Store it as an environment variable:

```bash
export MP_API_KEY="your_api_key_here"
```

Or add to your shell configuration file (~/.bashrc, ~/.zshrc, etc.)

## Basic Usage

### Initialization

```python
from mp_api.client import MPRester

# Using environment variable (recommended)
with MPRester() as mpr:
    # Perform queries
    pass

# Or explicitly pass API key
with MPRester("your_api_key_here") as mpr:
    # Perform queries
    pass
```

**Important**: Always use the `with` context manager to ensure sessions are properly closed.

## Querying Materials Data

### Search by Formula

```python
with MPRester() as mpr:
    # Get all materials with formula
    materials = mpr.materials.summary.search(formula="Fe2O3")

    for mat in materials:
        print(f"Material ID: {mat.material_id}")
        print(f"Formula: {mat.formula_pretty}")
        print(f"Energy above hull: {mat.energy_above_hull} eV/atom")
        print(f"Band gap: {mat.band_gap} eV")
        print()
```

### Search by Material ID

```python
with MPRester() as mpr:
    # Get specific material
    material = mpr.materials.summary.search(material_ids=["mp-149"])[0]

    print(f"Formula: {material.formula_pretty}")
    print(f"Space group: {material.symmetry.symbol}")
    print(f"Density: {material.density} g/cm³")
```

### Search by Chemical System

```python
with MPRester() as mpr:
    # Get all materials in Fe-O system
    materials = mpr.materials.summary.search(chemsys="Fe-O")

    # Get materials in ternary system
    materials = mpr.materials.summary.search(chemsys="Li-Fe-O")
```

### Search by Elements

```python
with MPRester() as mpr:
    # Materials containing Fe and O
    materials = mpr.materials.summary.search(elements=["Fe", "O"])

    # Materials containing ONLY Fe and O (excluding others)
    materials = mpr.materials.summary.search(
        elements=["Fe", "O"],
        exclude_elements=True
    )
```

## Getting Structures

### Structure from Material ID

```python
with MPRester() as mpr:
    # Get structure
    structure = mpr.get_structure_by_material_id("mp-149")

    # Get multiple structures
    structures = mpr.get_structures(["mp-149", "mp-510", "mp-19017"])
```

### All Structures for a Formula

```python
with MPRester() as mpr:
    # Get all Fe2O3 structures
    materials = mpr.materials.summary.search(formula="Fe2O3")

    for mat in materials:
        structure = mpr.get_structure_by_material_id(mat.material_id)
        print(f"{mat.material_id}: {structure.get_space_group_info()}")
```

## Advanced Queries

### Property Filtering

```python
with MPRester() as mpr:
    # Materials with specific property ranges
    materials = mpr.materials.summary.search(
        chemsys="Li-Fe-O",
        energy_above_hull=(0, 0.05),  # Stable or near-stable
        band_gap=(1.0, 3.0),           # Semiconducting
    )

    # Magnetic materials
    materials = mpr.materials.summary.search(
        elements=["Fe"],
        is_magnetic=True
    )

    # Metals only
    materials = mpr.materials.summary.search(
        chemsys="Fe-Ni",
        is_metal=True
    )
```

### Sorting and Limiting

```python
with MPRester() as mpr:
    # Get most stable materials
    materials = mpr.materials.summary.search(
        chemsys="Li-Fe-O",
        sort_fields=["energy_above_hull"],
        num_chunks=1,
        chunk_size=10  # Limit to 10 results
    )
```

## Electronic Structure Data

### Band Structure

```python
with MPRester() as mpr:
    # Get band structure
    bs = mpr.get_bandstructure_by_material_id("mp-149")

    # Analyze band structure
    if bs:
        print(f"Band gap: {bs.get_band_gap()}")
        print(f"Is metal: {bs.is_metal()}")
        print(f"Direct gap: {bs.get_band_gap()['direct']}")

        # Plot
        from pymatgen.electronic_structure.plotter import BSPlotter
        plotter = BSPlotter(bs)
        plotter.show()
```

### Density of States

```python
with MPRester() as mpr:
    # Get DOS
    dos = mpr.get_dos_by_material_id("mp-149")

    if dos:
        # Get band gap from DOS
        gap = dos.get_gap()
        print(f"Band gap from DOS: {gap} eV")

        # Plot DOS
        from pymatgen.electronic_structure.plotter import DosPlotter
        plotter = DosPlotter()
        plotter.add_dos("Total DOS", dos)
        plotter.show()
```

### Fermi Surface

```python
with MPRester() as mpr:
    # Get electronic structure data for Fermi surface
    bs = mpr.get_bandstructure_by_material_id("mp-149", line_mode=False)
```

## Thermodynamic Data

### Phase Diagram Construction

```python
from pymatgen.analysis.phase_diagram import PhaseDiagram, PDPlotter

with MPRester() as mpr:
    # Get entries for phase diagram
    entries = mpr.get_entries_in_chemsys("Li-Fe-O")

    # Build phase diagram
    pd = PhaseDiagram(entries)

    # Plot
    plotter = PDPlotter(pd)
    plotter.show()
```

### Pourbaix Diagram

```python
from pymatgen.analysis.pourbaix_diagram import PourbaixDiagram, PourbaixPlotter

with MPRester() as mpr:
    # Get entries for Pourbaix diagram
    entries = mpr.get_pourbaix_entries(["Fe"])

    # Build Pourbaix diagram
    pb = PourbaixDiagram(entries)

    # Plot
    plotter = PourbaixPlotter(pb)
    plotter.show()
```

### Formation Energy

```python
with MPRester() as mpr:
    materials = mpr.materials.summary.search(material_ids=["mp-149"])

    for mat in materials:
        print(f"Formation energy: {mat.formation_energy_per_atom} eV/atom")
        print(f"Energy above hull: {mat.energy_above_hull} eV/atom")
```

## Elasticity and Mechanical Properties

```python
with MPRester() as mpr:
    # Search for materials with elastic data
    materials = mpr.materials.elasticity.search(
        chemsys="Fe-O",
        bulk_modulus_vrh=(100, 300)  # GPa
    )

    for mat in materials:
        print(f"{mat.material_id}: K = {mat.bulk_modulus_vrh} GPa")
```

## Dielectric Properties

```python
with MPRester() as mpr:
    # Get dielectric data
    materials = mpr.materials.dielectric.search(
        material_ids=["mp-149"]
    )

    for mat in materials:
        print(f"Dielectric constant: {mat.e_electronic}")
        print(f"Refractive index: {mat.n}")
```

## Piezoelectric Properties

```python
with MPRester() as mpr:
    # Get piezoelectric materials
    materials = mpr.materials.piezoelectric.search(
        piezoelectric_modulus=(1, 100)
    )
```

## Surface Properties

```python
with MPRester() as mpr:
    # Get surface data
    surfaces = mpr.materials.surface_properties.search(
        material_ids=["mp-149"]
    )
```

## Molecule Data (For Molecular Materials)

```python
with MPRester() as mpr:
    # Search molecules
    molecules = mpr.molecules.summary.search(
        formula="H2O"
    )

    for mol in molecules:
        print(f"Molecule ID: {mol.molecule_id}")
        print(f"Formula: {mol.formula_pretty}")
```

## Bulk Data Download

### Download All Data for Materials

```python
with MPRester() as mpr:
    # Get comprehensive data
    materials = mpr.materials.summary.search(
        material_ids=["mp-149"],
        fields=[
            "material_id",
            "formula_pretty",
            "structure",
            "energy_above_hull",
            "band_gap",
            "density",
            "symmetry",
            "elasticity",
            "magnetic_ordering"
        ]
    )
```

## Provenance and Calculation Details

```python
with MPRester() as mpr:
    # Get calculation details
    materials = mpr.materials.summary.search(
        material_ids=["mp-149"],
        fields=["material_id", "origins"]
    )

    for mat in materials:
        print(f"Origins: {mat.origins}")
```

## Working with Entries

### ComputedEntry for Thermodynamic Analysis

```python
with MPRester() as mpr:
    # Get entries (includes energy and composition)
    entries = mpr.get_entries_in_chemsys("Li-Fe-O")

    # Entries can be used directly in phase diagram analysis
    from pymatgen.analysis.phase_diagram import PhaseDiagram
    pd = PhaseDiagram(entries)

    # Check stability
    for entry in entries[:5]:
        e_above_hull = pd.get_e_above_hull(entry)
        print(f"{entry.composition.reduced_formula}: {e_above_hull:.3f} eV/atom")
```

## Rate Limiting and Best Practices

### Rate Limits

The Materials Project API has rate limits to ensure fair usage:
- Be mindful of request frequency
- Use batch queries when possible
- Cache results locally for repeated analysis

### Efficient Querying

```python
# Bad: Multiple separate queries
with MPRester() as mpr:
    for mp_id in ["mp-149", "mp-510", "mp-19017"]:
        struct = mpr.get_structure_by_material_id(mp_id)  # 3 API calls

# Good: Single batch query
with MPRester() as mpr:
    structs = mpr.get_structures(["mp-149", "mp-510", "mp-19017"])  # 1 API call
```

### Caching Results

```python
import json

# Save results for later use
with MPRester() as mpr:
    materials = mpr.materials.summary.search(chemsys="Li-Fe-O")

    # Save to file
    with open("li_fe_o_materials.json", "w") as f:
        json.dump([mat.dict() for mat in materials], f)

# Load cached results
with open("li_fe_o_materials.json", "r") as f:
    cached_data = json.load(f)
```

## Error Handling

```python
from mp_api.client.core.client import MPRestError

try:
    with MPRester() as mpr:
        materials = mpr.materials.summary.search(material_ids=["invalid-id"])
except MPRestError as e:
    print(f"API Error: {e}")
except Exception as e:
    print(f"Unexpected error: {e}")
```

## Common Use Cases

### Finding Stable Compounds

```python
with MPRester() as mpr:
    # Get all stable compounds in a chemical system
    materials = mpr.materials.summary.search(
        chemsys="Li-Fe-O",
        energy_above_hull=(0, 0.001)  # Essentially on convex hull
    )

    print(f"Found {len(materials)} stable compounds")
    for mat in materials:
        print(f"  {mat.formula_pretty} ({mat.material_id})")
```

### Battery Material Screening

```python
with MPRester() as mpr:
    # Screen for potential cathode materials
    materials = mpr.materials.summary.search(
        elements=["Li"],  # Must contain Li
        energy_above_hull=(0, 0.05),  # Near stable
        band_gap=(0, 0.5),  # Metallic or small gap
    )

    print(f"Found {len(materials)} potential cathode materials")
```

### Finding Materials with Specific Crystal Structure

```python
with MPRester() as mpr:
    # Find materials with specific space group
    materials = mpr.materials.summary.search(
        chemsys="Fe-O",
        spacegroup_number=167  # R-3c (corundum structure)
    )
```

## Integration with Other Pymatgen Features

All data retrieved from the Materials Project can be directly used with pymatgen's analysis tools:

```python
with MPRester() as mpr:
    # Get structure
    struct = mpr.get_structure_by_material_id("mp-149")

    # Use with pymatgen analysis
    from pymatgen.symmetry.analyzer import SpacegroupAnalyzer
    sga = SpacegroupAnalyzer(struct)

    # Generate surfaces
    from pymatgen.core.surface import SlabGenerator
    slabgen = SlabGenerator(struct, (1,0,0), 10, 10)
    slabs = slabgen.get_slabs()

    # Phase diagram analysis
    entries = mpr.get_entries_in_chemsys(struct.composition.chemical_system)
    from pymatgen.analysis.phase_diagram import PhaseDiagram
    pd = PhaseDiagram(entries)
```

## Additional Resources

- **API Documentation**: https://docs.materialsproject.org/
- **Materials Project Website**: https://next-gen.materialsproject.org/
- **GitHub**: https://github.com/materialsproject/api
- **Forum**: https://matsci.org/

## Best Practices Summary

1. **Always use context manager**: Use `with MPRester() as mpr:`
2. **Store API key as environment variable**: Never hardcode API keys
3. **Batch queries**: Request multiple items at once when possible
4. **Cache results**: Save frequently used data locally
5. **Handle errors**: Wrap API calls in try-except blocks
6. **Be specific**: Use filters to limit results and reduce data transfer
7. **Check data availability**: Not all properties are available for all materials
