---
name: molecular-dynamics
description: Run and analyze molecular dynamics simulations with OpenMM and MDAnalysis. Set up protein/small molecule systems, define force fields, run energy minimization and production MD, analyze trajectories (RMSD, RMSF, contact maps, free energy surfaces). For structural biology, drug binding, and biophysics.
license: MIT
metadata:
    skill-author: Kuan-lin Huang
---

# Molecular Dynamics

## Overview

Molecular dynamics (MD) simulation computationally models the time evolution of molecular systems by integrating Newton's equations of motion. This skill covers two complementary tools:

- **OpenMM** (https://openmm.org/): High-performance MD simulation engine with GPU support, Python API, and flexible force field support
- **MDAnalysis** (https://mdanalysis.org/): Python library for reading, writing, and analyzing MD trajectories from all major simulation packages

**Installation:**
```bash
conda install -c conda-forge openmm mdanalysis nglview
# or
pip install openmm mdanalysis
```

## When to Use This Skill

Use molecular dynamics when:

- **Protein stability analysis**: How does a mutation affect protein dynamics?
- **Drug binding simulations**: Characterize binding mode and residence time of a ligand
- **Conformational sampling**: Explore protein flexibility and conformational changes
- **Protein-protein interaction**: Model interface dynamics and binding energetics
- **RMSD/RMSF analysis**: Quantify structural fluctuations from a reference structure
- **Free energy estimation**: Compute binding free energy or conformational free energy
- **Membrane simulations**: Model proteins in lipid bilayers
- **Intrinsically disordered proteins**: Study IDR conformational ensembles

## Core Workflow: OpenMM Simulation

### 1. System Preparation

```python
from openmm.app import *
from openmm import *
from openmm.unit import *
import sys

def prepare_system_from_pdb(pdb_file, forcefield_name="amber14-all.xml",
                              water_model="amber14/tip3pfb.xml"):
    """
    Prepare an OpenMM system from a PDB file.

    Args:
        pdb_file: Path to cleaned PDB file (use PDBFixer for raw PDB files)
        forcefield_name: Force field XML file
        water_model: Water model XML file

    Returns:
        pdb, forcefield, system, topology
    """
    # Load PDB
    pdb = PDBFile(pdb_file)

    # Load force field
    forcefield = ForceField(forcefield_name, water_model)

    # Add hydrogens and solvate
    modeller = Modeller(pdb.topology, pdb.positions)
    modeller.addHydrogens(forcefield)

    # Add solvent box (10 Å padding, 150 mM NaCl)
    modeller.addSolvent(
        forcefield,
        model='tip3p',
        padding=10*angstroms,
        ionicStrength=0.15*molar
    )

    print(f"System: {modeller.topology.getNumAtoms()} atoms, "
          f"{modeller.topology.getNumResidues()} residues")

    # Create system
    system = forcefield.createSystem(
        modeller.topology,
        nonbondedMethod=PME,         # Particle Mesh Ewald for long-range electrostatics
        nonbondedCutoff=1.0*nanometer,
        constraints=HBonds,           # Constrain hydrogen bonds (allows 2 fs timestep)
        rigidWater=True,
        ewaldErrorTolerance=0.0005
    )

    return modeller, system
```

### 2. Energy Minimization

```python
from openmm.app import *
from openmm import *
from openmm.unit import *

def minimize_energy(modeller, system, output_pdb="minimized.pdb",
                     max_iterations=1000, tolerance=10.0):
    """
    Energy minimize the system to remove steric clashes.

    Args:
        modeller: Modeller object with topology and positions
        system: OpenMM System
        output_pdb: Path to save minimized structure
        max_iterations: Maximum minimization steps
        tolerance: Convergence criterion in kJ/mol/nm

    Returns:
        simulation object with minimized positions
    """
    # Set up integrator (doesn't matter for minimization)
    integrator = LangevinMiddleIntegrator(300*kelvin, 1/picosecond, 0.004*picoseconds)

    # Create simulation
    # Use GPU if available (CUDA or OpenCL), fall back to CPU
    try:
        platform = Platform.getPlatformByName('CUDA')
        properties = {'DeviceIndex': '0', 'Precision': 'mixed'}
    except Exception:
        try:
            platform = Platform.getPlatformByName('OpenCL')
            properties = {}
        except Exception:
            platform = Platform.getPlatformByName('CPU')
            properties = {}

    simulation = Simulation(
        modeller.topology, system, integrator,
        platform, properties
    )
    simulation.context.setPositions(modeller.positions)

    # Check initial energy
    state = simulation.context.getState(getEnergy=True)
    print(f"Initial energy: {state.getPotentialEnergy()}")

    # Minimize
    simulation.minimizeEnergy(
        tolerance=tolerance*kilojoules_per_mole/nanometer,
        maxIterations=max_iterations
    )

    state = simulation.context.getState(getEnergy=True, getPositions=True)
    print(f"Minimized energy: {state.getPotentialEnergy()}")

    # Save minimized structure
    with open(output_pdb, 'w') as f:
        PDBFile.writeFile(simulation.topology, state.getPositions(), f)

    return simulation
```

### 3. NVT Equilibration

```python
from openmm.app import *
from openmm import *
from openmm.unit import *

def run_nvt_equilibration(simulation, n_steps=50000, temperature=300,
                            report_interval=1000, output_prefix="nvt"):
    """
    NVT equilibration: constant N, V, T.
    Equilibrate velocities to target temperature.

    Args:
        simulation: OpenMM Simulation (after minimization)
        n_steps: Number of MD steps (50000 × 2fs = 100 ps)
        temperature: Temperature in Kelvin
        report_interval: Steps between data reports
        output_prefix: File prefix for trajectory and log
    """
    # Add position restraints for backbone during NVT
    # (Optional: restraint heavy atoms)

    # Set temperature
    simulation.context.setVelocitiesToTemperature(temperature*kelvin)

    # Add reporters
    simulation.reporters = []

    # Log file
    simulation.reporters.append(
        StateDataReporter(
            f"{output_prefix}_log.txt",
            report_interval,
            step=True,
            potentialEnergy=True,
            kineticEnergy=True,
            temperature=True,
            volume=True,
            speed=True
        )
    )

    # DCD trajectory (compact binary format)
    simulation.reporters.append(
        DCDReporter(f"{output_prefix}_traj.dcd", report_interval)
    )

    print(f"Running NVT equilibration: {n_steps} steps ({n_steps*2/1000:.1f} ps)")
    simulation.step(n_steps)
    print("NVT equilibration complete")

    return simulation
```

### 4. NPT Equilibration and Production

```python
def run_npt_production(simulation, n_steps=500000, temperature=300, pressure=1.0,
                        report_interval=5000, output_prefix="npt"):
    """
    NPT production run: constant N, P, T.

    Args:
        n_steps: Production steps (500000 × 2fs = 1 ns)
        temperature: Temperature in Kelvin
        pressure: Pressure in bar
        report_interval: Steps between reports
    """
    # Add Monte Carlo barostat for pressure control
    system = simulation.context.getSystem()
    system.addForce(MonteCarloBarostat(pressure*bar, temperature*kelvin, 25))
    simulation.context.reinitialize(preserveState=True)

    # Update reporters
    simulation.reporters = []
    simulation.reporters.append(
        StateDataReporter(
            f"{output_prefix}_log.txt",
            report_interval,
            step=True,
            potentialEnergy=True,
            temperature=True,
            density=True,
            speed=True
        )
    )
    simulation.reporters.append(
        DCDReporter(f"{output_prefix}_traj.dcd", report_interval)
    )

    # Save checkpoints
    simulation.reporters.append(
        CheckpointReporter(f"{output_prefix}_checkpoint.chk", 50000)
    )

    print(f"Running NPT production: {n_steps} steps ({n_steps*2/1000000:.2f} ns)")
    simulation.step(n_steps)
    print("Production MD complete")
    return simulation
```

## Trajectory Analysis with MDAnalysis

### 1. Load Trajectory

```python
import MDAnalysis as mda
from MDAnalysis.analysis import rms, align, contacts
import numpy as np
import matplotlib.pyplot as plt

def load_trajectory(topology_file, trajectory_file):
    """
    Load an MD trajectory with MDAnalysis.

    Args:
        topology_file: PDB, PSF, or other topology file
        trajectory_file: DCD, XTC, TRR, or other trajectory
    """
    u = mda.Universe(topology_file, trajectory_file)
    print(f"Universe: {u.atoms.n_atoms} atoms, {u.trajectory.n_frames} frames")
    print(f"Time range: 0 to {u.trajectory.totaltime:.0f} ps")
    return u
```

### 2. RMSD Analysis

```python
def compute_rmsd(u, selection="backbone", reference_frame=0):
    """
    Compute RMSD of selected atoms relative to reference frame.

    Args:
        u: MDAnalysis Universe
        selection: Atom selection string (MDAnalysis syntax)
        reference_frame: Frame index for reference structure

    Returns:
        numpy array of (time, rmsd) values
    """
    # Align trajectory to minimize RMSD
    aligner = align.AlignTraj(u, u, select=selection, in_memory=True)
    aligner.run()

    # Compute RMSD
    R = rms.RMSD(u, select=selection, ref_frame=reference_frame)
    R.run()

    rmsd_data = R.results.rmsd  # columns: frame, time, RMSD
    return rmsd_data

def plot_rmsd(rmsd_data, title="RMSD over time", output_file="rmsd.png"):
    """Plot RMSD over simulation time."""
    fig, ax = plt.subplots(figsize=(10, 4))
    ax.plot(rmsd_data[:, 1] / 1000, rmsd_data[:, 2], 'b-', linewidth=0.5)
    ax.set_xlabel("Time (ns)")
    ax.set_ylabel("RMSD (Å)")
    ax.set_title(title)
    ax.axhline(rmsd_data[:, 2].mean(), color='r', linestyle='--',
               label=f'Mean: {rmsd_data[:, 2].mean():.2f} Å')
    ax.legend()
    plt.tight_layout()
    plt.savefig(output_file, dpi=150)
    return fig
```

### 3. RMSF Analysis (Per-Residue Flexibility)

```python
def compute_rmsf(u, selection="backbone", start_frame=0):
    """
    Compute per-residue RMSF (flexibility).

    Returns:
        resids, rmsf_values arrays
    """
    # Select atoms
    atoms = u.select_atoms(selection)

    # Compute RMSF
    R = rms.RMSF(atoms)
    R.run(start=start_frame)

    # Average by residue
    resids = []
    rmsf_per_res = []
    for res in u.select_atoms(selection).residues:
        res_atoms = res.atoms.intersection(atoms)
        if len(res_atoms) > 0:
            resids.append(res.resid)
            rmsf_per_res.append(R.results.rmsf[res_atoms.indices].mean())

    return np.array(resids), np.array(rmsf_per_res)
```

### 4. Protein-Ligand Contacts

```python
def analyze_contacts(u, protein_sel="protein", ligand_sel="resname LIG",
                      radius=4.5, start_frame=0):
    """
    Track protein-ligand contacts over trajectory.

    Args:
        radius: Contact distance cutoff in Angstroms
    """
    protein = u.select_atoms(protein_sel)
    ligand = u.select_atoms(ligand_sel)

    contact_frames = []
    for ts in u.trajectory[start_frame:]:
        # Find protein atoms within radius of ligand
        distances = contacts.contact_matrix(
            protein.positions, ligand.positions, radius
        )
        contact_residues = set()
        for i in range(distances.shape[0]):
            if distances[i].any():
                contact_residues.add(protein.atoms[i].resid)
        contact_frames.append(contact_residues)

    return contact_frames
```

## Force Field Selection Guide

| System | Recommended Force Field | Water Model |
|--------|------------------------|-------------|
| Standard proteins | AMBER14 (`amber14-all.xml`) | TIP3P-FB |
| Proteins + small molecules | AMBER14 + GAFF2 | TIP3P-FB |
| Membrane proteins | CHARMM36m | TIP3P |
| Nucleic acids | AMBER99-bsc1 or AMBER14 | TIP3P |
| Disordered proteins | ff19SB or CHARMM36m | TIP3P |

## System Preparation Tools

### PDBFixer (for raw PDB files)

```python
from pdbfixer import PDBFixer
from openmm.app import PDBFile

def fix_pdb(input_pdb, output_pdb, ph=7.0):
    """Fix common PDB issues: missing residues, atoms, add H, standardize."""
    fixer = PDBFixer(filename=input_pdb)
    fixer.findMissingResidues()
    fixer.findNonstandardResidues()
    fixer.replaceNonstandardResidues()
    fixer.removeHeterogens(True)    # Remove water/ligands
    fixer.findMissingAtoms()
    fixer.addMissingAtoms()
    fixer.addMissingHydrogens(ph)

    with open(output_pdb, 'w') as f:
        PDBFile.writeFile(fixer.topology, fixer.positions, f)

    return output_pdb
```

### GAFF2 for Small Molecules (via OpenFF Toolkit)

```python
# For ligand parameterization, use OpenFF toolkit or ACPYPE
# pip install openff-toolkit
from openff.toolkit import Molecule, ForceField as OFFForceField
from openff.interchange import Interchange

def parameterize_ligand(smiles, ff_name="openff-2.0.0.offxml"):
    """Generate GAFF2/OpenFF parameters for a small molecule."""
    mol = Molecule.from_smiles(smiles)
    mol.generate_conformers(n_conformers=1)

    off_ff = OFFForceField(ff_name)
    interchange = off_ff.create_interchange(mol.to_topology())
    return interchange
```

## Best Practices

- **Always minimize before MD**: Raw PDB structures have steric clashes
- **Equilibrate before production**: NVT (50–100 ps) → NPT (100–500 ps) → Production
- **Use GPU**: Simulations are 10–100× faster on GPU (CUDA/OpenCL)
- **2 fs timestep with HBonds constraints**: Standard; use 4 fs with HMR (hydrogen mass repartitioning)
- **Analyze only equilibrated trajectory**: Discard first 20–50% as equilibration
- **Save checkpoints**: MD runs can fail; checkpoints allow restart
- **Periodic boundary conditions**: Required for solvated systems
- **PME for electrostatics**: More accurate than cutoff methods for charged systems

## Additional Resources

- **OpenMM documentation**: https://openmm.org/documentation.html
- **MDAnalysis user guide**: https://docs.mdanalysis.org/
- **GROMACS** (alternative MD engine): https://manual.gromacs.org/
- **NAMD** (alternative): https://www.ks.uiuc.edu/Research/namd/
- **CHARMM-GUI** (web-based system builder): https://charmm-gui.org/
- **AmberTools** (free Amber tools): https://ambermd.org/AmberTools.php
- **OpenMM paper**: Eastman P et al. (2017) PLOS Computational Biology. PMID: 28278240
- **MDAnalysis paper**: Michaud-Agrawal N et al. (2011) J Computational Chemistry. PMID: 21500218
