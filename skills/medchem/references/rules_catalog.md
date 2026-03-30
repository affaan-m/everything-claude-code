# Medchem Rules and Filters Catalog

Comprehensive catalog of all available medicinal chemistry rules, structural alerts, and filters in medchem.

## Table of Contents

1. [Drug-Likeness Rules](#drug-likeness-rules)
2. [Lead-Likeness Rules](#lead-likeness-rules)
3. [Fragment Rules](#fragment-rules)
4. [CNS Rules](#cns-rules)
5. [Structural Alert Filters](#structural-alert-filters)
6. [Chemical Group Patterns](#chemical-group-patterns)

---

## Drug-Likeness Rules

### Rule of Five (Lipinski)

**Reference:** Lipinski et al., Adv Drug Deliv Rev (1997) 23:3-25

**Purpose:** Predict oral bioavailability

**Criteria:**
- Molecular Weight ≤ 500 Da
- LogP ≤ 5
- Hydrogen Bond Donors ≤ 5
- Hydrogen Bond Acceptors ≤ 10

**Usage:**
```python
mc.rules.basic_rules.rule_of_five(mol)
```

**Notes:**
- One of the most widely used filters in drug discovery
- About 90% of orally active drugs comply with these rules
- Exceptions exist, especially for natural products and antibiotics

---

### Rule of Veber

**Reference:** Veber et al., J Med Chem (2002) 45:2615-2623

**Purpose:** Additional criteria for oral bioavailability

**Criteria:**
- Rotatable Bonds ≤ 10
- Topological Polar Surface Area (TPSA) ≤ 140 Ų

**Usage:**
```python
mc.rules.basic_rules.rule_of_veber(mol)
```

**Notes:**
- Complements Rule of Five
- TPSA correlates with cell permeability
- Rotatable bonds affect molecular flexibility

---

### Rule of Drug

**Purpose:** Combined drug-likeness assessment

**Criteria:**
- Passes Rule of Five
- Passes Veber rules
- Does not contain PAINS substructures

**Usage:**
```python
mc.rules.basic_rules.rule_of_drug(mol)
```

---

### REOS (Rapid Elimination Of Swill)

**Reference:** Walters & Murcko, Adv Drug Deliv Rev (2002) 54:255-271

**Purpose:** Filter out compounds unlikely to be drugs

**Criteria:**
- Molecular Weight: 200-500 Da
- LogP: -5 to 5
- Hydrogen Bond Donors: 0-5
- Hydrogen Bond Acceptors: 0-10

**Usage:**
```python
mc.rules.basic_rules.rule_of_reos(mol)
```

---

### Golden Triangle

**Reference:** Johnson et al., J Med Chem (2009) 52:5487-5500

**Purpose:** Balance lipophilicity and molecular weight

**Criteria:**
- 200 ≤ MW ≤ 50 × LogP + 400
- LogP: -2 to 5

**Usage:**
```python
mc.rules.basic_rules.golden_triangle(mol)
```

**Notes:**
- Defines optimal physicochemical space
- Visual representation resembles a triangle on MW vs LogP plot

---

## Lead-Likeness Rules

### Rule of Oprea

**Reference:** Oprea et al., J Chem Inf Comput Sci (2001) 41:1308-1315

**Purpose:** Identify lead-like compounds for optimization

**Criteria:**
- Molecular Weight: 200-350 Da
- LogP: -2 to 4
- Rotatable Bonds ≤ 7
- Number of Rings ≤ 4

**Usage:**
```python
mc.rules.basic_rules.rule_of_oprea(mol)
```

**Rationale:** Lead compounds should have "room to grow" during optimization

---

### Rule of Leadlike (Soft)

**Purpose:** Permissive lead-like criteria

**Criteria:**
- Molecular Weight: 250-450 Da
- LogP: -3 to 4
- Rotatable Bonds ≤ 10

**Usage:**
```python
mc.rules.basic_rules.rule_of_leadlike_soft(mol)
```

---

### Rule of Leadlike (Strict)

**Purpose:** Restrictive lead-like criteria

**Criteria:**
- Molecular Weight: 200-350 Da
- LogP: -2 to 3.5
- Rotatable Bonds ≤ 7
- Number of Rings: 1-3

**Usage:**
```python
mc.rules.basic_rules.rule_of_leadlike_strict(mol)
```

---

## Fragment Rules

### Rule of Three

**Reference:** Congreve et al., Drug Discov Today (2003) 8:876-877

**Purpose:** Screen fragment libraries for fragment-based drug discovery

**Criteria:**
- Molecular Weight ≤ 300 Da
- LogP ≤ 3
- Hydrogen Bond Donors ≤ 3
- Hydrogen Bond Acceptors ≤ 3
- Rotatable Bonds ≤ 3
- Polar Surface Area ≤ 60 Ų

**Usage:**
```python
mc.rules.basic_rules.rule_of_three(mol)
```

**Notes:**
- Fragments are grown into leads during optimization
- Lower complexity allows more starting points

---

## CNS Rules

### Rule of CNS

**Purpose:** Central nervous system drug-likeness

**Criteria:**
- Molecular Weight ≤ 450 Da
- LogP: -1 to 5
- Hydrogen Bond Donors ≤ 2
- TPSA ≤ 90 Ų

**Usage:**
```python
mc.rules.basic_rules.rule_of_cns(mol)
```

**Rationale:**
- Blood-brain barrier penetration requires specific properties
- Lower TPSA and HBD count improve BBB permeability
- Tight constraints reflect CNS challenges

---

## Structural Alert Filters

### PAINS (Pan Assay INterference compoundS)

**Reference:** Baell & Holloway, J Med Chem (2010) 53:2719-2740

**Purpose:** Identify compounds that interfere with assays

**Categories:**
- Catechols
- Quinones
- Rhodanines
- Hydroxyphenylhydrazones
- Alkyl/aryl aldehydes
- Michael acceptors (specific patterns)

**Usage:**
```python
mc.rules.basic_rules.pains_filter(mol)
# Returns True if NO PAINS found
```

**Notes:**
- PAINS compounds show activity in multiple assays through non-specific mechanisms
- Common false positives in screening campaigns
- Should be deprioritized in lead selection

---

### Common Alerts Filters

**Source:** Derived from ChEMBL curation and medicinal chemistry literature

**Purpose:** Flag common problematic structural patterns

**Alert Categories:**
1. **Reactive Groups**
   - Epoxides
   - Aziridines
   - Acid halides
   - Isocyanates

2. **Metabolic Liabilities**
   - Hydrazines
   - Thioureas
   - Anilines (certain patterns)

3. **Aggregators**
   - Polyaromatic systems
   - Long aliphatic chains

4. **Toxicophores**
   - Nitro aromatics
   - Aromatic N-oxides
   - Certain heterocycles

**Usage:**
```python
alert_filter = mc.structural.CommonAlertsFilters()
has_alerts, details = alert_filter.check_mol(mol)
```

**Return Format:**
```python
{
    "has_alerts": True,
    "alert_details": ["reactive_epoxide", "metabolic_hydrazine"],
    "num_alerts": 2
}
```

---

### NIBR Filters

**Source:** Novartis Institutes for BioMedical Research

**Purpose:** Industrial medicinal chemistry filtering rules

**Features:**
- Proprietary filter set developed from Novartis experience
- Balances drug-likeness with practical medicinal chemistry
- Includes both structural alerts and property filters

**Usage:**
```python
nibr_filter = mc.structural.NIBRFilters()
results = nibr_filter(mols=mol_list, n_jobs=-1)
```

**Return Format:** Boolean list (True = passes)

---

### Lilly Demerits Filter

**Reference:** Based on Eli Lilly medicinal chemistry rules

**Source:** 275 structural patterns accumulated over 18 years

**Purpose:** Identify assay interference and problematic functionalities

**Mechanism:**
- Each matched pattern adds demerits
- Molecules with >100 demerits are rejected
- Some patterns add 10-50 demerits, others add 100+ (instant rejection)

**Demerit Categories:**

1. **High Demerits (>50):**
   - Known toxic groups
   - Highly reactive functionalities
   - Strong metal chelators

2. **Medium Demerits (20-50):**
   - Metabolic liabilities
   - Aggregation-prone structures
   - Frequent hitters

3. **Low Demerits (5-20):**
   - Minor concerns
   - Context-dependent issues

**Usage:**
```python
lilly_filter = mc.structural.LillyDemeritsFilters()
results = lilly_filter(mols=mol_list, n_jobs=-1)
```

**Return Format:**
```python
{
    "demerits": 35,
    "passes": True,  # (demerits ≤ 100)
    "matched_patterns": [
        {"pattern": "phenolic_ester", "demerits": 20},
        {"pattern": "aniline_derivative", "demerits": 15}
    ]
}
```

---

## Chemical Group Patterns

### Hinge Binders

**Purpose:** Identify kinase hinge-binding motifs

**Common Patterns:**
- Aminopyridines
- Aminopyrimidines
- Indazoles
- Benzimidazoles

**Usage:**
```python
group = mc.groups.ChemicalGroup(groups=["hinge_binders"])
has_hinge = group.has_match(mol_list)
```

**Application:** Kinase inhibitor design

---

### Phosphate Binders

**Purpose:** Identify phosphate-binding groups

**Common Patterns:**
- Basic amines in specific geometries
- Guanidinium groups
- Arginine mimetics

**Usage:**
```python
group = mc.groups.ChemicalGroup(groups=["phosphate_binders"])
```

**Application:** Kinase inhibitors, phosphatase inhibitors

---

### Michael Acceptors

**Purpose:** Identify electrophilic Michael acceptor groups

**Common Patterns:**
- α,β-Unsaturated carbonyls
- α,β-Unsaturated nitriles
- Vinyl sulfones
- Acrylamides

**Usage:**
```python
group = mc.groups.ChemicalGroup(groups=["michael_acceptors"])
```

**Notes:**
- Can be desirable for covalent inhibitors
- Often flagged as reactive alerts in screening

---

### Reactive Groups

**Purpose:** Identify generally reactive functionalities

**Common Patterns:**
- Epoxides
- Aziridines
- Acyl halides
- Isocyanates
- Sulfonyl chlorides

**Usage:**
```python
group = mc.groups.ChemicalGroup(groups=["reactive_groups"])
```

---

## Custom SMARTS Patterns

Define custom structural patterns using SMARTS:

```python
custom_patterns = {
    "my_warhead": "[C;H0](=O)C(F)(F)F",  # Trifluoromethyl ketone
    "my_scaffold": "c1ccc2c(c1)ncc(n2)N",  # Aminobenzimidazole
}

group = mc.groups.ChemicalGroup(
    groups=["hinge_binders"],
    custom_smarts=custom_patterns
)
```

---

## Filter Selection Guidelines

### Initial Screening (High-Throughput)

Recommended filters:
- Rule of Five
- PAINS filter
- Common Alerts (permissive settings)

```python
rfilter = mc.rules.RuleFilters(rule_list=["rule_of_five", "pains_filter"])
alert_filter = mc.structural.CommonAlertsFilters()
```

---

### Hit-to-Lead

Recommended filters:
- Rule of Oprea or Leadlike (soft)
- NIBR filters
- Lilly Demerits

```python
rfilter = mc.rules.RuleFilters(rule_list=["rule_of_oprea"])
nibr_filter = mc.structural.NIBRFilters()
lilly_filter = mc.structural.LillyDemeritsFilters()
```

---

### Lead Optimization

Recommended filters:
- Rule of Drug
- Leadlike (strict)
- Full structural alert analysis
- Complexity filters

```python
rfilter = mc.rules.RuleFilters(rule_list=["rule_of_drug", "rule_of_leadlike_strict"])
alert_filter = mc.structural.CommonAlertsFilters()
complexity_filter = mc.complexity.ComplexityFilter(max_complexity=400)
```

---

### CNS Targets

Recommended filters:
- Rule of CNS
- Reduced PAINS criteria (CNS-focused)
- BBB permeability constraints

```python
rfilter = mc.rules.RuleFilters(rule_list=["rule_of_cns"])
constraints = mc.constraints.Constraints(
    tpsa_max=90,
    hbd_max=2,
    mw_range=(300, 450)
)
```

---

### Fragment-Based Drug Discovery

Recommended filters:
- Rule of Three
- Minimal complexity
- Basic reactive group check

```python
rfilter = mc.rules.RuleFilters(rule_list=["rule_of_three"])
complexity_filter = mc.complexity.ComplexityFilter(max_complexity=250)
```

---

## Important Considerations

### False Positives and False Negatives

**Filters are guidelines, not absolutes:**

1. **False Positives** (good drugs flagged):
   - ~10% of marketed drugs fail Rule of Five
   - Natural products often violate standard rules
   - Prodrugs intentionally break rules
   - Antibiotics and antivirals frequently non-compliant

2. **False Negatives** (bad compounds passing):
   - Passing filters doesn't guarantee success
   - Target-specific issues not captured
   - In vivo properties not fully predicted

### Context-Specific Application

**Different contexts require different criteria:**

- **Target Class:** Kinases vs GPCRs vs ion channels have different optimal spaces
- **Modality:** Small molecules vs PROTACs vs molecular glues
- **Administration Route:** Oral vs IV vs topical
- **Disease Area:** CNS vs oncology vs infectious disease
- **Stage:** Screening vs hit-to-lead vs lead optimization

### Complementing with Machine Learning

Modern approaches combine rules with ML:

```python
# Rule-based pre-filtering
rule_results = mc.rules.RuleFilters(rule_list=["rule_of_five"])(mols)
filtered_mols = [mol for mol, r in zip(mols, rule_results) if r["passes"]]

# ML model scoring on filtered set
ml_scores = ml_model.predict(filtered_mols)

# Combined decision
final_candidates = [
    mol for mol, score in zip(filtered_mols, ml_scores)
    if score > threshold
]
```

---

## References

1. Lipinski CA et al. Adv Drug Deliv Rev (1997) 23:3-25
2. Veber DF et al. J Med Chem (2002) 45:2615-2623
3. Oprea TI et al. J Chem Inf Comput Sci (2001) 41:1308-1315
4. Congreve M et al. Drug Discov Today (2003) 8:876-877
5. Baell JB & Holloway GA. J Med Chem (2010) 53:2719-2740
6. Johnson TW et al. J Med Chem (2009) 52:5487-5500
7. Walters WP & Murcko MA. Adv Drug Deliv Rev (2002) 54:255-271
8. Hann MM & Oprea TI. Curr Opin Chem Biol (2004) 8:255-263
9. Rishton GM. Drug Discov Today (1997) 2:382-384
