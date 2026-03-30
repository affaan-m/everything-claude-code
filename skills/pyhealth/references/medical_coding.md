# PyHealth Medical Code Translation

## Overview

Healthcare data uses multiple coding systems and standards. PyHealth's MedCode module enables translation and mapping between medical coding systems through ontology lookups and cross-system mappings.

## Core Classes

### InnerMap
Handles within-system ontology lookups and hierarchical navigation.

**Key Capabilities:**
- Code lookup with attributes (names, descriptions)
- Ancestor/descendant hierarchy traversal
- Code standardization and conversion
- Parent-child relationship navigation

### CrossMap
Manages cross-system mappings between different coding standards.

**Key Capabilities:**
- Translation between coding systems
- Many-to-many relationship handling
- Hierarchical level specification (for medications)
- Bidirectional mapping support

## Supported Coding Systems

### Diagnosis Codes

**ICD-9-CM (International Classification of Diseases, 9th Revision, Clinical Modification)**
- Legacy diagnosis coding system
- Hierarchical structure with 3-5 digit codes
- Used in US healthcare pre-2015
- Usage: `from pyhealth.medcode import InnerMap`
  - `icd9_map = InnerMap.load("ICD9CM")`

**ICD-10-CM (International Classification of Diseases, 10th Revision, Clinical Modification)**
- Current diagnosis coding standard
- Alphanumeric codes (3-7 characters)
- More granular than ICD-9
- Usage: `from pyhealth.medcode import InnerMap`
  - `icd10_map = InnerMap.load("ICD10CM")`

**CCSCM (Clinical Classifications Software for ICD-CM)**
- Groups ICD codes into clinically meaningful categories
- Reduces dimensionality for analysis
- Single-level and multi-level hierarchies
- Usage: `from pyhealth.medcode import CrossMap`
  - `icd_to_ccs = CrossMap.load("ICD9CM", "CCSCM")`

### Procedure Codes

**ICD-9-PROC (ICD-9 Procedure Codes)**
- Inpatient procedure classification
- 3-4 digit numeric codes
- Legacy system (pre-2015)
- Usage: `from pyhealth.medcode import InnerMap`
  - `icd9proc_map = InnerMap.load("ICD9PROC")`

**ICD-10-PROC (ICD-10 Procedure Coding System)**
- Current procedural coding standard
- 7-character alphanumeric codes
- More detailed than ICD-9-PROC
- Usage: `from pyhealth.medcode import InnerMap`
  - `icd10proc_map = InnerMap.load("ICD10PROC")`

**CCSPROC (Clinical Classifications Software for Procedures)**
- Groups procedure codes into categories
- Simplifies procedure analysis
- Usage: `from pyhealth.medcode import CrossMap`
  - `proc_to_ccs = CrossMap.load("ICD9PROC", "CCSPROC")`

### Medication Codes

**NDC (National Drug Code)**
- US FDA drug identification system
- 10 or 11-digit codes
- Product-level specificity (manufacturer, strength, package)
- Usage: `from pyhealth.medcode import InnerMap`
  - `ndc_map = InnerMap.load("NDC")`

**RxNorm**
- Standardized drug terminology
- Normalized drug names and relationships
- Links multiple drug vocabularies
- Usage: `from pyhealth.medcode import CrossMap`
  - `ndc_to_rxnorm = CrossMap.load("NDC", "RXNORM")`

**ATC (Anatomical Therapeutic Chemical Classification)**
- WHO drug classification system
- 5-level hierarchy:
  - **Level 1**: Anatomical main group (1 letter)
  - **Level 2**: Therapeutic subgroup (2 digits)
  - **Level 3**: Pharmacological subgroup (1 letter)
  - **Level 4**: Chemical subgroup (1 letter)
  - **Level 5**: Chemical substance (2 digits)
- Example: "C03CA01" = Furosemide
  - C = Cardiovascular system
  - C03 = Diuretics
  - C03C = High-ceiling diuretics
  - C03CA = Sulfonamides
  - C03CA01 = Furosemide

**Usage:**
```python
from pyhealth.medcode import CrossMap
ndc_to_atc = CrossMap.load("NDC", "ATC")
atc_codes = ndc_to_atc.map("00074-3799-13", level=3)  # Get ATC level 3
```

## Common Operations

### InnerMap Operations

**1. Code Lookup**
```python
from pyhealth.medcode import InnerMap

icd9_map = InnerMap.load("ICD9CM")
info = icd9_map.lookup("428.0")  # Heart failure
# Returns: name, description, additional attributes
```

**2. Ancestor Traversal**
```python
# Get all parent codes in hierarchy
ancestors = icd9_map.get_ancestors("428.0")
# Returns: ["428", "420-429", "390-459"]
```

**3. Descendant Traversal**
```python
# Get all child codes
descendants = icd9_map.get_descendants("428")
# Returns: ["428.0", "428.1", "428.2", ...]
```

**4. Code Standardization**
```python
# Normalize code format
standard_code = icd9_map.standardize("4280")  # Returns "428.0"
```

### CrossMap Operations

**1. Direct Translation**
```python
from pyhealth.medcode import CrossMap

# ICD-9-CM to CCS
icd_to_ccs = CrossMap.load("ICD9CM", "CCSCM")
ccs_codes = icd_to_ccs.map("82101")  # Coronary atherosclerosis
# Returns: ["101"]  # CCS category for coronary atherosclerosis
```

**2. Hierarchical Drug Mapping**
```python
# NDC to ATC at different levels
ndc_to_atc = CrossMap.load("NDC", "ATC")

# Get specific ATC level
atc_level_1 = ndc_to_atc.map("00074-3799-13", level=1)  # Anatomical group
atc_level_3 = ndc_to_atc.map("00074-3799-13", level=3)  # Pharmacological
atc_level_5 = ndc_to_atc.map("00074-3799-13", level=5)  # Chemical substance
```

**3. Bidirectional Mapping**
```python
# Map in either direction
rxnorm_to_ndc = CrossMap.load("RXNORM", "NDC")
ndc_codes = rxnorm_to_ndc.map("197381")  # Get all NDC codes for RxNorm
```

## Workflow Examples

### Example 1: Standardize and Group Diagnoses
```python
from pyhealth.medcode import InnerMap, CrossMap

# Load maps
icd9_map = InnerMap.load("ICD9CM")
icd_to_ccs = CrossMap.load("ICD9CM", "CCSCM")

# Process diagnosis codes
raw_codes = ["4280", "428.0", "42800"]

standardized = [icd9_map.standardize(code) for code in raw_codes]
# All become "428.0"

ccs_categories = [icd_to_ccs.map(code)[0] for code in standardized]
# All map to CCS category "108" (Heart failure)
```

### Example 2: Drug Classification Analysis
```python
from pyhealth.medcode import CrossMap

# Map NDC to ATC for drug class analysis
ndc_to_atc = CrossMap.load("NDC", "ATC")

patient_drugs = ["00074-3799-13", "00074-7286-01", "00456-0765-01"]

# Get therapeutic subgroups (ATC level 2)
drug_classes = []
for ndc in patient_drugs:
    atc_codes = ndc_to_atc.map(ndc, level=2)
    if atc_codes:
        drug_classes.append(atc_codes[0])

# Analyze drug class distribution
```

### Example 3: ICD-9 to ICD-10 Migration
```python
from pyhealth.medcode import CrossMap

# Load ICD-9 to ICD-10 mapping
icd9_to_icd10 = CrossMap.load("ICD9CM", "ICD10CM")

# Convert historical ICD-9 codes
icd9_code = "428.0"
icd10_codes = icd9_to_icd10.map(icd9_code)
# Returns: ["I50.9", "I50.1", ...]  # Multiple possible ICD-10 codes

# Handle one-to-many mappings
for icd10_code in icd10_codes:
    print(f"ICD-9 {icd9_code} -> ICD-10 {icd10_code}")
```

## Integration with Datasets

Medical code translation integrates seamlessly with PyHealth datasets:

```python
from pyhealth.datasets import MIMIC4Dataset
from pyhealth.medcode import CrossMap

# Load dataset
dataset = MIMIC4Dataset(root="/path/to/data")

# Load code mapping
icd_to_ccs = CrossMap.load("ICD10CM", "CCSCM")

# Process patient diagnoses
for patient in dataset.iter_patients():
    for visit in patient.visits:
        diagnosis_events = [e for e in visit.events if e.vocabulary == "ICD10CM"]

        for event in diagnosis_events:
            ccs_codes = icd_to_ccs.map(event.code)
            print(f"Diagnosis {event.code} -> CCS {ccs_codes}")
```

## Use Cases

### Clinical Research
- Standardize diagnoses across different coding systems
- Group related conditions for cohort identification
- Harmonize multi-site studies with different standards

### Drug Safety Analysis
- Classify medications by therapeutic class
- Identify drug-drug interactions at class level
- Analyze polypharmacy patterns

### Healthcare Analytics
- Reduce diagnosis/procedure dimensionality
- Create meaningful clinical categories
- Enable longitudinal analysis across coding system changes

### Machine Learning
- Create consistent feature representations
- Handle vocabulary mismatch in training/test data
- Generate hierarchical embeddings

## Best Practices

1. **Always standardize codes** before mapping to ensure consistent format
2. **Handle one-to-many mappings** appropriately (some codes map to multiple targets)
3. **Specify ATC level** explicitly when mapping drugs to avoid ambiguity
4. **Use CCS categories** to reduce diagnosis/procedure dimensionality
5. **Validate mappings** as some codes may not have direct translations
6. **Document code versions** (ICD-9 vs ICD-10) to maintain data provenance
