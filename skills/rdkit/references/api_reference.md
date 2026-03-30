# RDKit API Reference

This document provides a comprehensive reference for RDKit's Python API, organized by functionality.

## Core Module: rdkit.Chem

The fundamental module for working with molecules.

### Molecule I/O

**Reading Molecules:**

- `Chem.MolFromSmiles(smiles, sanitize=True)` - Parse SMILES string
- `Chem.MolFromSmarts(smarts)` - Parse SMARTS pattern
- `Chem.MolFromMolFile(filename, sanitize=True, removeHs=True)` - Read MOL file
- `Chem.MolFromMolBlock(molblock, sanitize=True, removeHs=True)` - Parse MOL block string
- `Chem.MolFromMol2File(filename, sanitize=True, removeHs=True)` - Read MOL2 file
- `Chem.MolFromMol2Block(molblock, sanitize=True, removeHs=True)` - Parse MOL2 block
- `Chem.MolFromPDBFile(filename, sanitize=True, removeHs=True)` - Read PDB file
- `Chem.MolFromPDBBlock(pdbblock, sanitize=True, removeHs=True)` - Parse PDB block
- `Chem.MolFromInchi(inchi, sanitize=True, removeHs=True)` - Parse InChI string
- `Chem.MolFromSequence(seq, sanitize=True)` - Create molecule from peptide sequence

**Writing Molecules:**

- `Chem.MolToSmiles(mol, isomericSmiles=True, canonical=True)` - Convert to SMILES
- `Chem.MolToSmarts(mol, isomericSmarts=False)` - Convert to SMARTS
- `Chem.MolToMolBlock(mol, includeStereo=True, confId=-1)` - Convert to MOL block
- `Chem.MolToMolFile(mol, filename, includeStereo=True, confId=-1)` - Write MOL file
- `Chem.MolToPDBBlock(mol, confId=-1)` - Convert to PDB block
- `Chem.MolToPDBFile(mol, filename, confId=-1)` - Write PDB file
- `Chem.MolToInchi(mol, options='')` - Convert to InChI
- `Chem.MolToInchiKey(mol, options='')` - Generate InChI key
- `Chem.MolToSequence(mol)` - Convert to peptide sequence

**Batch I/O:**

- `Chem.SDMolSupplier(filename, sanitize=True, removeHs=True)` - SDF file reader
- `Chem.ForwardSDMolSupplier(fileobj, sanitize=True, removeHs=True)` - Forward-only SDF reader
- `Chem.MultithreadedSDMolSupplier(filename, numWriterThreads=1)` - Parallel SDF reader
- `Chem.SmilesMolSupplier(filename, delimiter=' ', titleLine=True)` - SMILES file reader
- `Chem.SDWriter(filename)` - SDF file writer
- `Chem.SmilesWriter(filename, delimiter=' ', includeHeader=True)` - SMILES file writer

### Molecular Manipulation

**Sanitization:**

- `Chem.SanitizeMol(mol, sanitizeOps=SANITIZE_ALL, catchErrors=False)` - Sanitize molecule
- `Chem.DetectChemistryProblems(mol, sanitizeOps=SANITIZE_ALL)` - Detect sanitization issues
- `Chem.AssignStereochemistry(mol, cleanIt=True, force=False)` - Assign stereochemistry
- `Chem.FindPotentialStereo(mol)` - Find potential stereocenters
- `Chem.AssignStereochemistryFrom3D(mol, confId=-1)` - Assign stereo from 3D coords

**Hydrogen Management:**

- `Chem.AddHs(mol, explicitOnly=False, addCoords=False)` - Add explicit hydrogens
- `Chem.RemoveHs(mol, implicitOnly=False, updateExplicitCount=False)` - Remove hydrogens
- `Chem.RemoveAllHs(mol)` - Remove all hydrogens

**Aromaticity:**

- `Chem.SetAromaticity(mol, model=AROMATICITY_RDKIT)` - Set aromaticity model
- `Chem.Kekulize(mol, clearAromaticFlags=False)` - Kekulize aromatic bonds
- `Chem.SetConjugation(mol)` - Set conjugation flags

**Fragments:**

- `Chem.GetMolFrags(mol, asMols=False, sanitizeFrags=True)` - Get disconnected fragments
- `Chem.FragmentOnBonds(mol, bondIndices, addDummies=True)` - Fragment on specific bonds
- `Chem.ReplaceSubstructs(mol, query, replacement, replaceAll=False)` - Replace substructures
- `Chem.DeleteSubstructs(mol, query, onlyFrags=False)` - Delete substructures

**Stereochemistry:**

- `Chem.FindMolChiralCenters(mol, includeUnassigned=False, useLegacyImplementation=False)` - Find chiral centers
- `Chem.FindPotentialStereo(mol, cleanIt=True)` - Find potential stereocenters

### Substructure Searching

**Basic Matching:**

- `mol.HasSubstructMatch(query, useChirality=False)` - Check for substructure match
- `mol.GetSubstructMatch(query, useChirality=False)` - Get first match
- `mol.GetSubstructMatches(query, uniquify=True, useChirality=False)` - Get all matches
- `mol.GetSubstructMatches(query, maxMatches=1000)` - Limit number of matches

### Molecular Properties

**Atom Methods:**

- `atom.GetSymbol()` - Atomic symbol
- `atom.GetAtomicNum()` - Atomic number
- `atom.GetDegree()` - Number of bonds
- `atom.GetTotalDegree()` - Including hydrogens
- `atom.GetFormalCharge()` - Formal charge
- `atom.GetNumRadicalElectrons()` - Radical electrons
- `atom.GetIsAromatic()` - Aromaticity flag
- `atom.GetHybridization()` - Hybridization (SP, SP2, SP3, etc.)
- `atom.GetIdx()` - Atom index
- `atom.IsInRing()` - In any ring
- `atom.IsInRingSize(size)` - In ring of specific size
- `atom.GetChiralTag()` - Chirality tag

**Bond Methods:**

- `bond.GetBondType()` - Bond type (SINGLE, DOUBLE, TRIPLE, AROMATIC)
- `bond.GetBeginAtomIdx()` - Starting atom index
- `bond.GetEndAtomIdx()` - Ending atom index
- `bond.GetIsConjugated()` - Conjugation flag
- `bond.GetIsAromatic()` - Aromaticity flag
- `bond.IsInRing()` - In any ring
- `bond.GetStereo()` - Stereochemistry (STEREONONE, STEREOZ, STEREOE, etc.)

**Molecule Methods:**

- `mol.GetNumAtoms(onlyExplicit=True)` - Number of atoms
- `mol.GetNumHeavyAtoms()` - Number of heavy atoms
- `mol.GetNumBonds()` - Number of bonds
- `mol.GetAtoms()` - Iterator over atoms
- `mol.GetBonds()` - Iterator over bonds
- `mol.GetAtomWithIdx(idx)` - Get specific atom
- `mol.GetBondWithIdx(idx)` - Get specific bond
- `mol.GetRingInfo()` - Ring information object

**Ring Information:**

- `Chem.GetSymmSSSR(mol)` - Get smallest set of smallest rings
- `Chem.GetSSSR(mol)` - Alias for GetSymmSSSR
- `ring_info.NumRings()` - Number of rings
- `ring_info.AtomRings()` - Tuples of atom indices in rings
- `ring_info.BondRings()` - Tuples of bond indices in rings

## rdkit.Chem.AllChem

Extended chemistry functionality.

### 2D/3D Coordinate Generation

- `AllChem.Compute2DCoords(mol, canonOrient=True, clearConfs=True)` - Generate 2D coordinates
- `AllChem.EmbedMolecule(mol, maxAttempts=0, randomSeed=-1, useRandomCoords=False)` - Generate 3D conformer
- `AllChem.EmbedMultipleConfs(mol, numConfs=10, maxAttempts=0, randomSeed=-1)` - Generate multiple conformers
- `AllChem.ConstrainedEmbed(mol, core, useTethers=True)` - Constrained embedding
- `AllChem.GenerateDepictionMatching2DStructure(mol, reference, refPattern=None)` - Align to template

### Force Field Optimization

- `AllChem.UFFOptimizeMolecule(mol, maxIters=200, confId=-1)` - UFF optimization
- `AllChem.MMFFOptimizeMolecule(mol, maxIters=200, confId=-1, mmffVariant='MMFF94')` - MMFF optimization
- `AllChem.UFFGetMoleculeForceField(mol, confId=-1)` - Get UFF force field object
- `AllChem.MMFFGetMoleculeForceField(mol, pyMMFFMolProperties, confId=-1)` - Get MMFF force field

### Conformer Analysis

- `AllChem.GetConformerRMS(mol, confId1, confId2, prealigned=False)` - Calculate RMSD
- `AllChem.GetConformerRMSMatrix(mol, prealigned=False)` - RMSD matrix
- `AllChem.AlignMol(prbMol, refMol, prbCid=-1, refCid=-1)` - Align molecules
- `AllChem.AlignMolConformers(mol)` - Align all conformers

### Reactions

- `AllChem.ReactionFromSmarts(smarts, useSmiles=False)` - Create reaction from SMARTS
- `reaction.RunReactants(reactants)` - Apply reaction
- `reaction.RunReactant(reactant, reactionIdx)` - Apply to specific reactant
- `AllChem.CreateDifferenceFingerprintForReaction(reaction)` - Reaction fingerprint

### Fingerprints

- `AllChem.GetMorganFingerprint(mol, radius, useFeatures=False)` - Morgan fingerprint
- `AllChem.GetMorganFingerprintAsBitVect(mol, radius, nBits=2048)` - Morgan bit vector
- `AllChem.GetHashedMorganFingerprint(mol, radius, nBits=2048)` - Hashed Morgan
- `AllChem.GetErGFingerprint(mol)` - ErG fingerprint

## rdkit.Chem.Descriptors

Molecular descriptor calculations.

### Common Descriptors

- `Descriptors.MolWt(mol)` - Molecular weight
- `Descriptors.ExactMolWt(mol)` - Exact molecular weight
- `Descriptors.HeavyAtomMolWt(mol)` - Heavy atom molecular weight
- `Descriptors.MolLogP(mol)` - LogP (lipophilicity)
- `Descriptors.MolMR(mol)` - Molar refractivity
- `Descriptors.TPSA(mol)` - Topological polar surface area
- `Descriptors.NumHDonors(mol)` - Hydrogen bond donors
- `Descriptors.NumHAcceptors(mol)` - Hydrogen bond acceptors
- `Descriptors.NumRotatableBonds(mol)` - Rotatable bonds
- `Descriptors.NumAromaticRings(mol)` - Aromatic rings
- `Descriptors.NumSaturatedRings(mol)` - Saturated rings
- `Descriptors.NumAliphaticRings(mol)` - Aliphatic rings
- `Descriptors.NumAromaticHeterocycles(mol)` - Aromatic heterocycles
- `Descriptors.NumRadicalElectrons(mol)` - Radical electrons
- `Descriptors.NumValenceElectrons(mol)` - Valence electrons

### Batch Calculation

- `Descriptors.CalcMolDescriptors(mol)` - Calculate all descriptors as dictionary

### Descriptor Lists

- `Descriptors._descList` - List of (name, function) tuples for all descriptors

## rdkit.Chem.Draw

Molecular visualization.

### Image Generation

- `Draw.MolToImage(mol, size=(300,300), kekulize=True, wedgeBonds=True, highlightAtoms=None)` - Generate PIL image
- `Draw.MolToFile(mol, filename, size=(300,300), kekulize=True, wedgeBonds=True)` - Save to file
- `Draw.MolsToGridImage(mols, molsPerRow=3, subImgSize=(200,200), legends=None)` - Grid of molecules
- `Draw.MolsMatrixToGridImage(mols, molsPerRow=3, subImgSize=(200,200), legends=None)` - Nested grid
- `Draw.ReactionToImage(rxn, subImgSize=(200,200))` - Reaction image

### Fingerprint Visualization

- `Draw.DrawMorganBit(mol, bitId, bitInfo, whichExample=0)` - Visualize Morgan bit
- `Draw.DrawMorganBits(bits, mol, bitInfo, molsPerRow=3)` - Multiple Morgan bits
- `Draw.DrawRDKitBit(mol, bitId, bitInfo, whichExample=0)` - Visualize RDKit bit

### IPython Integration

- `Draw.IPythonConsole` - Module for Jupyter integration
- `Draw.IPythonConsole.ipython_useSVG` - Use SVG (True) or PNG (False)
- `Draw.IPythonConsole.molSize` - Default molecule image size

### Drawing Options

- `rdMolDraw2D.MolDrawOptions()` - Get drawing options object
  - `.addAtomIndices` - Show atom indices
  - `.addBondIndices` - Show bond indices
  - `.addStereoAnnotation` - Show stereochemistry
  - `.bondLineWidth` - Line width
  - `.highlightBondWidthMultiplier` - Highlight width
  - `.minFontSize` - Minimum font size
  - `.maxFontSize` - Maximum font size

## rdkit.Chem.rdMolDescriptors

Additional descriptor calculations.

- `rdMolDescriptors.CalcNumRings(mol)` - Number of rings
- `rdMolDescriptors.CalcNumAromaticRings(mol)` - Aromatic rings
- `rdMolDescriptors.CalcNumAliphaticRings(mol)` - Aliphatic rings
- `rdMolDescriptors.CalcNumSaturatedRings(mol)` - Saturated rings
- `rdMolDescriptors.CalcNumHeterocycles(mol)` - Heterocycles
- `rdMolDescriptors.CalcNumAromaticHeterocycles(mol)` - Aromatic heterocycles
- `rdMolDescriptors.CalcNumSpiroAtoms(mol)` - Spiro atoms
- `rdMolDescriptors.CalcNumBridgeheadAtoms(mol)` - Bridgehead atoms
- `rdMolDescriptors.CalcFractionCsp3(mol)` - Fraction of sp3 carbons
- `rdMolDescriptors.CalcLabuteASA(mol)` - Labute accessible surface area
- `rdMolDescriptors.CalcTPSA(mol)` - TPSA
- `rdMolDescriptors.CalcMolFormula(mol)` - Molecular formula

## rdkit.Chem.Scaffolds

Scaffold analysis.

### Murcko Scaffolds

- `MurckoScaffold.GetScaffoldForMol(mol)` - Get Murcko scaffold
- `MurckoScaffold.MakeScaffoldGeneric(mol)` - Generic scaffold
- `MurckoScaffold.MurckoDecompose(mol)` - Decompose to scaffold and sidechains

## rdkit.Chem.rdMolHash

Molecular hashing and standardization.

- `rdMolHash.MolHash(mol, hashFunction)` - Generate hash
  - `rdMolHash.HashFunction.AnonymousGraph` - Anonymized structure
  - `rdMolHash.HashFunction.CanonicalSmiles` - Canonical SMILES
  - `rdMolHash.HashFunction.ElementGraph` - Element graph
  - `rdMolHash.HashFunction.MurckoScaffold` - Murcko scaffold
  - `rdMolHash.HashFunction.Regioisomer` - Regioisomer (no stereo)
  - `rdMolHash.HashFunction.NetCharge` - Net charge
  - `rdMolHash.HashFunction.HetAtomProtomer` - Heteroatom protomer
  - `rdMolHash.HashFunction.HetAtomTautomer` - Heteroatom tautomer

## rdkit.Chem.MolStandardize

Molecule standardization.

- `rdMolStandardize.Normalize(mol)` - Normalize functional groups
- `rdMolStandardize.Reionize(mol)` - Fix ionization state
- `rdMolStandardize.RemoveFragments(mol)` - Remove small fragments
- `rdMolStandardize.Cleanup(mol)` - Full cleanup (normalize + reionize + remove)
- `rdMolStandardize.Uncharger()` - Create uncharger object
  - `.uncharge(mol)` - Remove charges
- `rdMolStandardize.TautomerEnumerator()` - Enumerate tautomers
  - `.Enumerate(mol)` - Generate tautomers
  - `.Canonicalize(mol)` - Get canonical tautomer

## rdkit.DataStructs

Fingerprint similarity and operations.

### Similarity Metrics

- `DataStructs.TanimotoSimilarity(fp1, fp2)` - Tanimoto coefficient
- `DataStructs.DiceSimilarity(fp1, fp2)` - Dice coefficient
- `DataStructs.CosineSimilarity(fp1, fp2)` - Cosine similarity
- `DataStructs.SokalSimilarity(fp1, fp2)` - Sokal similarity
- `DataStructs.KulczynskiSimilarity(fp1, fp2)` - Kulczynski similarity
- `DataStructs.McConnaugheySimilarity(fp1, fp2)` - McConnaughey similarity

### Bulk Operations

- `DataStructs.BulkTanimotoSimilarity(fp, fps)` - Tanimoto for list of fingerprints
- `DataStructs.BulkDiceSimilarity(fp, fps)` - Dice for list
- `DataStructs.BulkCosineSimilarity(fp, fps)` - Cosine for list

### Distance Metrics

- `DataStructs.TanimotoDistance(fp1, fp2)` - 1 - Tanimoto
- `DataStructs.DiceDistance(fp1, fp2)` - 1 - Dice

## rdkit.Chem.AtomPairs

Atom pair fingerprints.

- `Pairs.GetAtomPairFingerprint(mol, minLength=1, maxLength=30)` - Atom pair fingerprint
- `Pairs.GetAtomPairFingerprintAsBitVect(mol, minLength=1, maxLength=30, nBits=2048)` - As bit vector
- `Pairs.GetHashedAtomPairFingerprint(mol, nBits=2048, minLength=1, maxLength=30)` - Hashed version

## rdkit.Chem.Torsions

Topological torsion fingerprints.

- `Torsions.GetTopologicalTorsionFingerprint(mol, targetSize=4)` - Torsion fingerprint
- `Torsions.GetTopologicalTorsionFingerprintAsIntVect(mol, targetSize=4)` - As int vector
- `Torsions.GetHashedTopologicalTorsionFingerprint(mol, nBits=2048, targetSize=4)` - Hashed version

## rdkit.Chem.MACCSkeys

MACCS structural keys.

- `MACCSkeys.GenMACCSKeys(mol)` - Generate 166-bit MACCS keys

## rdkit.Chem.ChemicalFeatures

Pharmacophore features.

- `ChemicalFeatures.BuildFeatureFactory(featureFile)` - Create feature factory
- `factory.GetFeaturesForMol(mol)` - Get pharmacophore features
- `feature.GetFamily()` - Feature family (Donor, Acceptor, etc.)
- `feature.GetType()` - Feature type
- `feature.GetAtomIds()` - Atoms involved in feature

## rdkit.ML.Cluster.Butina

Clustering algorithms.

- `Butina.ClusterData(distances, nPts, distThresh, isDistData=True)` - Butina clustering
  - Returns tuple of tuples with cluster members

## rdkit.Chem.rdFingerprintGenerator

Modern fingerprint generation API (RDKit 2020.09+).

- `rdFingerprintGenerator.GetMorganGenerator(radius=2, fpSize=2048)` - Morgan generator
- `rdFingerprintGenerator.GetRDKitFPGenerator(minPath=1, maxPath=7, fpSize=2048)` - RDKit FP generator
- `rdFingerprintGenerator.GetAtomPairGenerator(minDistance=1, maxDistance=30)` - Atom pair generator
- `generator.GetFingerprint(mol)` - Generate fingerprint
- `generator.GetCountFingerprint(mol)` - Count-based fingerprint

## Common Parameters

### Sanitization Operations

- `SANITIZE_NONE` - No sanitization
- `SANITIZE_ALL` - All operations (default)
- `SANITIZE_CLEANUP` - Basic cleanup
- `SANITIZE_PROPERTIES` - Calculate properties
- `SANITIZE_SYMMRINGS` - Symmetrize rings
- `SANITIZE_KEKULIZE` - Kekulize aromatic rings
- `SANITIZE_FINDRADICALS` - Find radical electrons
- `SANITIZE_SETAROMATICITY` - Set aromaticity
- `SANITIZE_SETCONJUGATION` - Set conjugation
- `SANITIZE_SETHYBRIDIZATION` - Set hybridization
- `SANITIZE_CLEANUPCHIRALITY` - Cleanup chirality

### Bond Types

- `BondType.SINGLE` - Single bond
- `BondType.DOUBLE` - Double bond
- `BondType.TRIPLE` - Triple bond
- `BondType.AROMATIC` - Aromatic bond
- `BondType.DATIVE` - Dative bond
- `BondType.UNSPECIFIED` - Unspecified

### Hybridization

- `HybridizationType.S` - S
- `HybridizationType.SP` - SP
- `HybridizationType.SP2` - SP2
- `HybridizationType.SP3` - SP3
- `HybridizationType.SP3D` - SP3D
- `HybridizationType.SP3D2` - SP3D2

### Chirality

- `ChiralType.CHI_UNSPECIFIED` - Unspecified
- `ChiralType.CHI_TETRAHEDRAL_CW` - Clockwise
- `ChiralType.CHI_TETRAHEDRAL_CCW` - Counter-clockwise

## Installation

```bash
# Using conda (recommended)
conda install -c conda-forge rdkit

# Using pip
pip install rdkit-pypi
```

## Importing

```python
# Core functionality
from rdkit import Chem
from rdkit.Chem import AllChem

# Descriptors
from rdkit.Chem import Descriptors

# Drawing
from rdkit.Chem import Draw

# Similarity
from rdkit import DataStructs
```
