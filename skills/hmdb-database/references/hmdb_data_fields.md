# HMDB Data Fields Reference

This document provides detailed information about the data fields available in HMDB metabolite entries.

## Metabolite Entry Structure

Each HMDB metabolite entry contains 130+ data fields organized into several categories:

### Chemical Data Fields

**Identification:**
- `accession`: Primary HMDB ID (e.g., HMDB0000001)
- `secondary_accessions`: Previous HMDB IDs for merged entries
- `name`: Primary metabolite name
- `synonyms`: Alternative names and common names
- `chemical_formula`: Molecular formula (e.g., C6H12O6)
- `average_molecular_weight`: Average molecular weight in Daltons
- `monoisotopic_molecular_weight`: Monoisotopic molecular weight

**Structure Representations:**
- `smiles`: Simplified Molecular Input Line Entry System string
- `inchi`: International Chemical Identifier string
- `inchikey`: Hashed InChI for fast lookup
- `iupac_name`: IUPAC systematic name
- `traditional_iupac`: Traditional IUPAC name

**Chemical Properties:**
- `state`: Physical state (solid, liquid, gas)
- `charge`: Net molecular charge
- `logp`: Octanol-water partition coefficient (experimental/predicted)
- `pka_strongest_acidic`: Strongest acidic pKa value
- `pka_strongest_basic`: Strongest basic pKa value
- `polar_surface_area`: Topological polar surface area (TPSA)
- `refractivity`: Molar refractivity
- `polarizability`: Molecular polarizability
- `rotatable_bond_count`: Number of rotatable bonds
- `acceptor_count`: Hydrogen bond acceptor count
- `donor_count`: Hydrogen bond donor count

**Chemical Taxonomy:**
- `kingdom`: Chemical kingdom (e.g., Organic compounds)
- `super_class`: Chemical superclass
- `class`: Chemical class
- `sub_class`: Chemical subclass
- `direct_parent`: Direct chemical parent
- `alternative_parents`: Alternative parent classifications
- `substituents`: Chemical substituents present
- `description`: Text description of the compound

### Biological Data Fields

**Metabolite Origins:**
- `origin`: Source of metabolite (endogenous, exogenous, drug metabolite, food component)
- `biofluid_locations`: Biological fluids where found (blood, urine, saliva, CSF, etc.)
- `tissue_locations`: Tissues where found (liver, kidney, brain, muscle, etc.)
- `cellular_locations`: Subcellular locations (cytoplasm, mitochondria, membrane, etc.)

**Biospecimen Information:**
- `biospecimen`: Type of biological specimen
- `status`: Detection status (detected, expected, predicted)
- `concentration`: Concentration ranges with units
- `concentration_references`: Citations for concentration data

**Normal and Abnormal Concentrations:**
For each biofluid (blood, urine, saliva, CSF, feces, sweat):
- Normal concentration value and range
- Units (μM, mg/L, etc.)
- Age and gender considerations
- Abnormal concentration indicators
- Clinical significance

### Pathway and Enzyme Information

**Metabolic Pathways:**
- `pathways`: List of associated metabolic pathways
  - Pathway name
  - SMPDB ID (Small Molecule Pathway Database ID)
  - KEGG pathway ID
  - Pathway category

**Enzymatic Reactions:**
- `protein_associations`: Enzymes and transporters
  - Protein name
  - Gene name
  - Uniprot ID
  - GenBank ID
  - Protein type (enzyme, transporter, carrier, etc.)
  - Enzyme reactions
  - Enzyme kinetics (Km values)

**Biochemical Context:**
- `reactions`: Biochemical reactions involving the metabolite
- `reaction_enzymes`: Enzymes catalyzing reactions
- `cofactors`: Required cofactors
- `inhibitors`: Known enzyme inhibitors

### Disease and Biomarker Associations

**Disease Links:**
- `diseases`: Associated diseases and conditions
  - Disease name
  - OMIM ID (Online Mendelian Inheritance in Man)
  - Disease category
  - References and evidence

**Biomarker Information:**
- `biomarker_status`: Whether compound is a known biomarker
- `biomarker_applications`: Clinical applications
- `biomarker_for`: Diseases or conditions where used as biomarker

### Spectroscopic Data

**NMR Spectra:**
- `nmr_spectra`: Nuclear Magnetic Resonance data
  - Spectrum type (1D ¹H, ¹³C, 2D COSY, HSQC, etc.)
  - Spectrometer frequency (MHz)
  - Solvent used
  - Temperature
  - pH
  - Peak list with chemical shifts and multiplicities
  - FID (Free Induction Decay) files

**Mass Spectrometry:**
- `ms_spectra`: Mass spectrometry data
  - Spectrum type (MS, MS-MS, LC-MS, GC-MS)
  - Ionization mode (positive, negative, neutral)
  - Collision energy
  - Instrument type
  - Peak list (m/z, intensity, annotation)
  - Predicted vs. experimental flag

**Chromatography:**
- `chromatography`: Chromatographic properties
  - Retention time
  - Column type
  - Mobile phase
  - Method details

### External Database Links

**Database Cross-References:**
- `kegg_id`: KEGG Compound ID
- `pubchem_compound_id`: PubChem CID
- `pubchem_substance_id`: PubChem SID
- `chebi_id`: Chemical Entities of Biological Interest ID
- `chemspider_id`: ChemSpider ID
- `drugbank_id`: DrugBank accession (if applicable)
- `foodb_id`: FooDB ID (if food component)
- `knapsack_id`: KNApSAcK ID
- `metacyc_id`: MetaCyc ID
- `bigg_id`: BiGG Model ID
- `wikipedia_id`: Wikipedia page link
- `metlin_id`: METLIN ID
- `vmh_id`: Virtual Metabolic Human ID
- `fbonto_id`: FlyBase ontology ID

**Protein Database Links:**
- `uniprot_id`: UniProt accession for associated proteins
- `genbank_id`: GenBank ID for associated genes
- `pdb_id`: Protein Data Bank ID for protein structures

### Literature and Evidence

**References:**
- `general_references`: General references about the metabolite
  - PubMed ID
  - Reference text
  - Citation
- `synthesis_reference`: Synthesis methods and references
- `protein_references`: References for protein associations
- `pathway_references`: References for pathway involvement

### Ontology and Classification

**Ontology Terms:**
- `ontology_terms`: Related ontology classifications
  - Term name
  - Ontology source (ChEBI, MeSH, etc.)
  - Term ID
  - Definition

### Data Quality and Provenance

**Metadata:**
- `creation_date`: Date entry was created
- `update_date`: Date entry was last updated
- `version`: HMDB version number
- `status`: Entry status (detected, expected, predicted)
- `evidence`: Evidence level for detection/presence

## XML Structure Example

When downloading HMDB data in XML format, the structure follows this pattern:

```xml
<metabolite>
  <accession>HMDB0000001</accession>
  <name>1-Methylhistidine</name>
  <chemical_formula>C7H11N3O2</chemical_formula>
  <average_molecular_weight>169.1811</average_molecular_weight>
  <monoisotopic_molecular_weight>169.085126436</monoisotopic_molecular_weight>
  <smiles>CN1C=NC(CC(=O)O)=C1</smiles>
  <inchi>InChI=1S/C7H11N3O2/c1-10-4-8-3-5(10)2-7(11)12/h3-4H,2H2,1H3,(H,11,12)</inchi>
  <inchikey>BRMWTNUJHUMWMS-UHFFFAOYSA-N</inchikey>

  <biospecimen_locations>
    <biospecimen>Blood</biospecimen>
    <biospecimen>Urine</biospecimen>
  </biospecimen_locations>

  <pathways>
    <pathway>
      <name>Histidine Metabolism</name>
      <smpdb_id>SMP0000044</smpdb_id>
      <kegg_map_id>map00340</kegg_map_id>
    </pathway>
  </pathways>

  <diseases>
    <disease>
      <name>Carnosinemia</name>
      <omim_id>212200</omim_id>
    </disease>
  </diseases>

  <normal_concentrations>
    <concentration>
      <biospecimen>Blood</biospecimen>
      <concentration_value>3.8</concentration_value>
      <concentration_units>uM</concentration_units>
    </concentration>
  </normal_concentrations>
</metabolite>
```

## Querying Specific Fields

When working with HMDB data programmatically:

**For metabolite identification:**
- Query by `accession`, `name`, `synonyms`, `inchi`, `smiles`

**For chemical similarity:**
- Use `smiles`, `inchi`, `inchikey`, `molecular_weight`, `chemical_formula`

**For biomarker discovery:**
- Filter by `diseases`, `biomarker_status`, `normal_concentrations`, `abnormal_concentrations`

**For pathway analysis:**
- Extract `pathways`, `protein_associations`, `reactions`

**For spectral matching:**
- Compare against `nmr_spectra`, `ms_spectra` peak lists

**For cross-database integration:**
- Map using external IDs: `kegg_id`, `pubchem_compound_id`, `chebi_id`, etc.

## Field Completeness

Not all fields are populated for every metabolite:

- **Highly complete fields** (>90% of entries): accession, name, chemical_formula, molecular_weight, smiles, inchi
- **Moderately complete** (50-90%): biospecimen_locations, tissue_locations, pathways
- **Variably complete** (10-50%): concentration data, disease associations, protein associations
- **Sparsely complete** (<10%): experimental NMR/MS spectra, detailed kinetic data

Predicted and computational data (e.g., predicted MS spectra, predicted concentrations) supplement experimental data where available.
