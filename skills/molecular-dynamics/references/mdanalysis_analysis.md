# MDAnalysis Analysis Reference

## MDAnalysis Universe and AtomGroup

```python
import MDAnalysis as mda

# Load Universe
u = mda.Universe("topology.pdb", "trajectory.dcd")
# or for single structure:
u = mda.Universe("structure.pdb")

# Key attributes
print(u.atoms.n_atoms)          # Total atoms
print(u.residues.n_residues)    # Total residues
print(u.trajectory.n_frames)   # Number of frames
print(u.trajectory.dt)         # Time step in ps
print(u.trajectory.totaltime)  # Total simulation time in ps
```

## Atom Selection Language

MDAnalysis uses a rich selection language:

```python
# Basic selections
protein = u.select_atoms("protein")
backbone = u.select_atoms("backbone")  # CA, N, C, O
calpha = u.select_atoms("name CA")
water = u.select_atoms("resname WAT or resname HOH or resname TIP3")
ligand = u.select_atoms("resname LIG")

# By residue number
region = u.select_atoms("resid 10:50")
specific = u.select_atoms("resid 45 and name CA")

# By proximity
near_ligand = u.select_atoms("protein and around 5.0 resname LIG")

# By property
charged = u.select_atoms("resname ARG LYS ASP GLU")
hydrophobic = u.select_atoms("resname ALA VAL LEU ILE PRO PHE TRP MET")

# Boolean combinations
active_site = u.select_atoms("(resid 100 102 145 200) and protein")

# Inverse
not_water = u.select_atoms("not (resname WAT HOH)")
```

## Common Analysis Modules

### RMSD and RMSF

```python
from MDAnalysis.analysis import rms, align

# Align trajectory to first frame
align.AlignTraj(u, u, select='backbone', in_memory=True).run()

# RMSD
R = rms.RMSD(u, u, select='backbone', groupselections=['name CA'])
R.run()
# R.results.rmsd: shape (n_frames, 3) = [frame, time, RMSD]

# RMSF (per-atom fluctuations)
from MDAnalysis.analysis.rms import RMSF
rmsf = RMSF(u.select_atoms('backbone')).run()
# rmsf.results.rmsf: per-atom RMSF values in Angstroms
```

### Radius of Gyration

```python
rg = []
for ts in u.trajectory:
    rg.append(u.select_atoms("protein").radius_of_gyration())
import numpy as np
print(f"Mean Rg: {np.mean(rg):.2f} Å")
```

### Secondary Structure Analysis

```python
from MDAnalysis.analysis.dssp import DSSP

# DSSP secondary structure assignment per frame
dssp = DSSP(u).run()
# dssp.results.dssp: per-residue per-frame secondary structure codes
# H = alpha-helix, E = beta-strand, C = coil
```

### Hydrogen Bonds

```python
from MDAnalysis.analysis.hydrogenbonds import HydrogenBondAnalysis

hbonds = HydrogenBondAnalysis(
    u,
    donors_sel="protein and name N",
    acceptors_sel="protein and name O",
    d_h_cutoff=1.2,          # donor-H distance (Å)
    d_a_cutoff=3.0,          # donor-acceptor distance (Å)
    d_h_a_angle_cutoff=150   # D-H-A angle (degrees)
)
hbonds.run()

# Count H-bonds per frame
import pandas as pd
df = pd.DataFrame(hbonds.results.hbonds,
                  columns=['frame', 'donor_ix', 'hydrogen_ix', 'acceptor_ix',
                           'DA_dist', 'DHA_angle'])
```

### Principal Component Analysis (PCA)

```python
from MDAnalysis.analysis import pca

pca_analysis = pca.PCA(u, select='backbone', align=True).run()

# PC variances
print(pca_analysis.results.variance[:5])  # % variance of first 5 PCs

# Project trajectory onto PCs
projected = pca_analysis.transform(u.select_atoms('backbone'), n_components=3)
# Shape: (n_frames, n_components)
```

### Free Energy Surface (FES)

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import gaussian_kde

def plot_free_energy_surface(x, y, bins=50, T=300, xlabel="PC1", ylabel="PC2",
                              output="fes.png"):
    """
    Compute 2D free energy surface from two order parameters.
    FES = -kT * ln(P(x,y))
    """
    kB = 0.0083144621  # kJ/mol/K
    kT = kB * T

    # 2D histogram
    H, xedges, yedges = np.histogram2d(x, y, bins=bins, density=True)
    H = H.T

    # Free energy
    H_safe = np.where(H > 0, H, np.nan)
    fes = -kT * np.log(H_safe)
    fes -= np.nanmin(fes)  # Shift minimum to 0

    # Plot
    fig, ax = plt.subplots(figsize=(8, 6))
    im = ax.contourf(xedges[:-1], yedges[:-1], fes, levels=20, cmap='RdYlBu_r')
    plt.colorbar(im, ax=ax, label='Free Energy (kJ/mol)')
    ax.set_xlabel(xlabel)
    ax.set_ylabel(ylabel)
    plt.savefig(output, dpi=150, bbox_inches='tight')
    return fig
```

## Trajectory Formats Supported

| Format | Extension | Notes |
|--------|-----------|-------|
| DCD | `.dcd` | CHARMM/NAMD binary; widely used |
| XTC | `.xtc` | GROMACS compressed |
| TRR | `.trr` | GROMACS full precision |
| NetCDF | `.nc` | AMBER format |
| LAMMPS | `.lammpstrj` | LAMMPS dump |
| HDF5 | `.h5md` | H5MD standard |
| PDB | `.pdb` | Multi-model PDB |

## MDAnalysis Interoperability

```python
# Convert to numpy
positions = u.atoms.positions  # Current frame: shape (N, 3)

# Write to PDB
with mda.Writer("frame_10.pdb", u.atoms.n_atoms) as W:
    u.trajectory[10]  # Move to frame 10
    W.write(u.atoms)

# Write trajectory subset
with mda.Writer("protein_traj.dcd", u.select_atoms("protein").n_atoms) as W:
    for ts in u.trajectory:
        W.write(u.select_atoms("protein"))

# Convert to MDTraj (for compatibility)
# import mdtraj as md
# traj = md.load("trajectory.dcd", top="topology.pdb")
```

## Performance Tips

- **Use `in_memory=True`** for AlignTraj when RAM allows (much faster iteration)
- **Select minimal atoms** before analysis to reduce memory/compute
- **Use multiprocessing** for independent frame analyses
- **Process in chunks** for very long trajectories using `start`/`stop`/`step` parameters:

```python
# Analyze every 10th frame from frame 100 to 1000
R.run(start=100, stop=1000, step=10)
```
