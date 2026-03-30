# TDC Datasets Comprehensive Catalog

This document provides a comprehensive catalog of all available datasets in the Therapeutics Data Commons, organized by task category.

## Single-Instance Prediction Datasets

### ADME (Absorption, Distribution, Metabolism, Excretion)

**Absorption:**
- `Caco2_Wang` - Caco-2 cell permeability (906 compounds)
- `Caco2_AstraZeneca` - Caco-2 permeability from AstraZeneca (700 compounds)
- `HIA_Hou` - Human intestinal absorption (578 compounds)
- `Pgp_Broccatelli` - P-glycoprotein inhibition (1,212 compounds)
- `Bioavailability_Ma` - Oral bioavailability (640 compounds)
- `F20_edrug3d` - Oral bioavailability F>=20% (1,017 compounds)
- `F30_edrug3d` - Oral bioavailability F>=30% (1,017 compounds)

**Distribution:**
- `BBB_Martins` - Blood-brain barrier penetration (1,975 compounds)
- `PPBR_AZ` - Plasma protein binding rate (1,797 compounds)
- `VDss_Lombardo` - Volume of distribution at steady state (1,130 compounds)

**Metabolism:**
- `CYP2C19_Veith` - CYP2C19 inhibition (12,665 compounds)
- `CYP2D6_Veith` - CYP2D6 inhibition (13,130 compounds)
- `CYP3A4_Veith` - CYP3A4 inhibition (12,328 compounds)
- `CYP1A2_Veith` - CYP1A2 inhibition (12,579 compounds)
- `CYP2C9_Veith` - CYP2C9 inhibition (12,092 compounds)
- `CYP2C9_Substrate_CarbonMangels` - CYP2C9 substrate (666 compounds)
- `CYP2D6_Substrate_CarbonMangels` - CYP2D6 substrate (664 compounds)
- `CYP3A4_Substrate_CarbonMangels` - CYP3A4 substrate (667 compounds)

**Excretion:**
- `Half_Life_Obach` - Half-life (667 compounds)
- `Clearance_Hepatocyte_AZ` - Hepatocyte clearance (1,020 compounds)
- `Clearance_Microsome_AZ` - Microsome clearance (1,102 compounds)

**Solubility & Lipophilicity:**
- `Solubility_AqSolDB` - Aqueous solubility (9,982 compounds)
- `Lipophilicity_AstraZeneca` - Lipophilicity (logD) (4,200 compounds)
- `HydrationFreeEnergy_FreeSolv` - Hydration free energy (642 compounds)

### Toxicity

**Organ Toxicity:**
- `hERG` - hERG channel inhibition/cardiotoxicity (648 compounds)
- `hERG_Karim` - hERG blockers extended dataset (13,445 compounds)
- `DILI` - Drug-induced liver injury (475 compounds)
- `Skin_Reaction` - Skin reaction (404 compounds)
- `Carcinogens_Lagunin` - Carcinogenicity (278 compounds)
- `Respiratory_Toxicity` - Respiratory toxicity (278 compounds)

**General Toxicity:**
- `AMES` - Ames mutagenicity (7,255 compounds)
- `LD50_Zhu` - Acute toxicity LD50 (7,385 compounds)
- `ClinTox` - Clinical trial toxicity (1,478 compounds)
- `SkinSensitization` - Skin sensitization (278 compounds)
- `EyeCorrosion` - Eye corrosion (278 compounds)
- `EyeIrritation` - Eye irritation (278 compounds)

**Environmental Toxicity:**
- `Tox21-AhR` - Nuclear receptor signaling (8,169 compounds)
- `Tox21-AR` - Androgen receptor (9,362 compounds)
- `Tox21-AR-LBD` - Androgen receptor ligand binding (8,343 compounds)
- `Tox21-ARE` - Antioxidant response element (6,475 compounds)
- `Tox21-aromatase` - Aromatase inhibition (6,733 compounds)
- `Tox21-ATAD5` - DNA damage (8,163 compounds)
- `Tox21-ER` - Estrogen receptor (7,257 compounds)
- `Tox21-ER-LBD` - Estrogen receptor ligand binding (8,163 compounds)
- `Tox21-HSE` - Heat shock response (8,162 compounds)
- `Tox21-MMP` - Mitochondrial membrane potential (7,394 compounds)
- `Tox21-p53` - p53 pathway (8,163 compounds)
- `Tox21-PPAR-gamma` - PPAR gamma activation (7,396 compounds)

### HTS (High-Throughput Screening)

**SARS-CoV-2:**
- `SARSCoV2_Vitro_Touret` - In vitro antiviral activity (1,484 compounds)
- `SARSCoV2_3CLPro_Diamond` - 3CL protease inhibition (879 compounds)
- `SARSCoV2_Vitro_AlabdulKareem` - In vitro screening (5,953 compounds)

**Other Targets:**
- `Orexin1_Receptor_Butkiewicz` - Orexin receptor screening (4,675 compounds)
- `M1_Receptor_Agonist_Butkiewicz` - M1 receptor agonist (1,700 compounds)
- `M1_Receptor_Antagonist_Butkiewicz` - M1 receptor antagonist (1,700 compounds)
- `HIV_Butkiewicz` - HIV inhibition (40,000+ compounds)
- `ToxCast` - Environmental chemical screening (8,597 compounds)

### QM (Quantum Mechanics)

- `QM7` - Quantum mechanics properties (7,160 molecules)
- `QM8` - Electronic spectra and excited states (21,786 molecules)
- `QM9` - Geometric, energetic, electronic, thermodynamic properties (133,885 molecules)

### Yields

- `Buchwald-Hartwig` - Reaction yield prediction (3,955 reactions)
- `USPTO_Yields` - Yield prediction from USPTO (853,879 reactions)

### Epitope

- `IEDBpep-DiseaseBinder` - Disease-associated epitope binding (6,080 peptides)
- `IEDBpep-NonBinder` - Non-binding peptides (24,320 peptides)

### Develop (Development)

- `Manufacturing` - Manufacturing success prediction
- `Formulation` - Formulation stability

### CRISPROutcome

- `CRISPROutcome_Doench` - Gene editing efficiency prediction (5,310 guide RNAs)

## Multi-Instance Prediction Datasets

### DTI (Drug-Target Interaction)

**Binding Affinity:**
- `BindingDB_Kd` - Dissociation constant (52,284 pairs, 10,665 drugs, 1,413 proteins)
- `BindingDB_IC50` - Half-maximal inhibitory concentration (991,486 pairs, 549,205 drugs, 5,078 proteins)
- `BindingDB_Ki` - Inhibition constant (375,032 pairs, 174,662 drugs, 3,070 proteins)

**Kinase Binding:**
- `DAVIS` - Davis kinase binding dataset (30,056 pairs, 68 drugs, 442 proteins)
- `KIBA` - KIBA kinase binding dataset (118,254 pairs, 2,111 drugs, 229 proteins)

**Binary Interaction:**
- `BindingDB_Patent` - Patent-derived DTI (8,503 pairs)
- `BindingDB_Approval` - FDA-approved drug DTI (1,649 pairs)

### DDI (Drug-Drug Interaction)

- `DrugBank` - Drug-drug interactions (191,808 pairs, 1,706 drugs)
- `TWOSIDES` - Side effect-based DDI (4,649,441 pairs, 645 drugs)

### PPI (Protein-Protein Interaction)

- `HuRI` - Human reference protein interactome (52,569 interactions)
- `STRING` - Protein functional associations (19,247 interactions)

### GDA (Gene-Disease Association)

- `DisGeNET` - Gene-disease associations (81,746 pairs)
- `PrimeKG_GDA` - Gene-disease from PrimeKG knowledge graph

### DrugRes (Drug Response/Resistance)

- `GDSC1` - Genomics of Drug Sensitivity in Cancer v1 (178,000 pairs)
- `GDSC2` - Genomics of Drug Sensitivity in Cancer v2 (125,000 pairs)

### DrugSyn (Drug Synergy)

- `DrugComb` - Drug combination synergy (345,502 combinations)
- `DrugCombDB` - Drug combination database (448,555 combinations)
- `OncoPolyPharmacology` - Oncology drug combinations (22,737 combinations)

### PeptideMHC

- `MHC1_NetMHCpan` - MHC class I binding (184,983 pairs)
- `MHC2_NetMHCIIpan` - MHC class II binding (134,281 pairs)

### AntibodyAff (Antibody Affinity)

- `Protein_SAbDab` - Antibody-antigen affinity (1,500+ pairs)

### MTI (miRNA-Target Interaction)

- `miRTarBase` - Experimentally validated miRNA-target interactions (380,639 pairs)

### Catalyst

- `USPTO_Catalyst` - Catalyst prediction for reactions (11,000+ reactions)

### TrialOutcome

- `TrialOutcome_WuXi` - Clinical trial outcome prediction (3,769 trials)

## Generation Datasets

### MolGen (Molecular Generation)

- `ChEMBL_V29` - Drug-like molecules from ChEMBL (1,941,410 molecules)
- `ZINC` - ZINC database subset (100,000+ molecules)
- `GuacaMol` - Goal-directed benchmark molecules
- `Moses` - Molecular sets benchmark (1,936,962 molecules)

### RetroSyn (Retrosynthesis)

- `USPTO` - Retrosynthesis from USPTO patents (1,939,253 reactions)
- `USPTO-50K` - Curated USPTO subset (50,000 reactions)

### PairMolGen (Paired Molecule Generation)

- `Prodrug` - Prodrug to drug transformations (1,000+ pairs)
- `Metabolite` - Drug to metabolite transformations

## Using retrieve_dataset_names

To programmatically access all available datasets for a specific task:

```python
from tdc.utils import retrieve_dataset_names

# Get all datasets for a specific task
adme_datasets = retrieve_dataset_names('ADME')
tox_datasets = retrieve_dataset_names('Tox')
dti_datasets = retrieve_dataset_names('DTI')
hts_datasets = retrieve_dataset_names('HTS')
```

## Dataset Statistics

Access dataset statistics directly:

```python
from tdc.single_pred import ADME
data = ADME(name='Caco2_Wang')

# Print basic statistics
data.print_stats()

# Get label distribution
data.label_distribution()
```

## Loading Datasets

All datasets follow the same loading pattern:

```python
from tdc.<problem_type> import <TaskType>
data = <TaskType>(name='<DatasetName>')

# Get full dataset
df = data.get_data(format='df')  # or 'dict', 'DeepPurpose', etc.

# Get train/valid/test split
split = data.get_split(method='scaffold', seed=1, frac=[0.7, 0.1, 0.2])
```

## Notes

- Dataset sizes and statistics are approximate and may be updated
- New datasets are regularly added to TDC
- Some datasets may require additional dependencies
- Check the official TDC website for the most up-to-date dataset list: https://tdcommons.ai/overview/
