# BRENDA Database API Reference

## Overview

This document provides detailed reference information for the BRENDA (BRaunschweig ENzyme DAtabase) SOAP API and the Python client implementation. BRENDA is the world's most comprehensive enzyme information system, containing over 45,000 enzymes with millions of kinetic data points.

## SOAP API Endpoints

### Base WSDL URL
```
https://www.brenda-enzymes.org/soap/brenda_zeep.wsdl
```

### Authentication

All BRENDA API calls require authentication using email and password:

**Parameters:**
- `email`: Your registered BRENDA email address
- `password`: Your BRENDA account password

**Authentication Process:**
1. Password is hashed using SHA-256 before transmission
2. Email and hashed password are included as the first two parameters in every API call
3. Legacy support for `BRENDA_EMIAL` environment variable (note the typo)

## Available SOAP Actions

### getKmValue

Retrieves Michaelis constant (Km) values for enzymes.

**Parameters:**
1. `email`: BRENDA account email
2. `passwordHash`: SHA-256 hashed password
3. `ecNumber*: EC number of the enzyme (wildcards allowed)
4. `organism*: Organism name (wildcards allowed, default: "*")
5. `kmValue*: Km value field (default: "*")
6. `kmValueMaximum*: Maximum Km value field (default: "*")
7. `substrate*: Substrate name (wildcards allowed, default: "*")
8. `commentary*: Commentary field (default: "*")
9. `ligandStructureId*: Ligand structure ID field (default: "*")
10. `literature*: Literature reference field (default: "*")

**Wildcards:**
- `*`: Matches any sequence
- Can be used with partial EC numbers (e.g., "1.1.*")

**Response Format:**
```
organism*Escherichia coli#substrate*glucose#kmValue*0.12#kmValueMaximum*#commentary*pH 7.4, 25°C#ligandStructureId*#literature*
```

**Example Response Fields:**
- `organism`: Source organism
- `substrate`: Substrate name
- `kmValue`: Michaelis constant value (typically in mM)
- `kmValueMaximum`: Maximum Km value (if available)
- `commentary`: Experimental conditions (pH, temperature, etc.)
- `ligandStructureId`: BRENDA ligand structure identifier
- `literature`: Reference to primary literature

### getReaction

Retrieves reaction equations and stoichiometry for enzymes.

**Parameters:**
1. `email`: BRENDA account email
2. `passwordHash`: SHA-256 hashed password
3. `ecNumber*: EC number of the enzyme (wildcards allowed)
4. `organism*: Organism name (wildcards allowed, default: "*")
5. `reaction*: Reaction equation (wildcards allowed, default: "*")
6. `commentary*: Commentary field (default: "*")
7. `literature*: Literature reference field (default: "*")

**Response Format:**
```
ecNumber*1.1.1.1#organism*Saccharomyces cerevisiae#reaction*ethanol + NAD+ <=> acetaldehyde + NADH + H+#commentary*#literature*
```

**Example Response Fields:**
- `ecNumber`: Enzyme Commission number
- `organism`: Source organism
- `reaction`: Balanced chemical equation (using <=> for equilibrium, -> for direction)
- `commentary`: Additional information
- `literature`: Reference citation

## Data Field Specifications

### EC Number Format

EC numbers follow the standard hierarchical format: `A.B.C.D`

- **A**: Main class (1-6)
  - 1: Oxidoreductases
  - 2: Transferases
  - 3: Hydrolases
  - 4: Lyases
  - 5: Isomerases
  - 6: Ligases
- **B**: Subclass
- **C**: Sub-subclass
- **D**: Serial number

**Examples:**
- `1.1.1.1`: Alcohol dehydrogenase
- `1.1.1.2`: Alcohol dehydrogenase (NADP+)
- `3.2.1.23`: Beta-galactosidase
- `2.7.1.1`: Hexokinase

### Organism Names

Organism names should use proper binomial nomenclature:

**Correct Format:**
- `Escherichia coli`
- `Saccharomyces cerevisiae`
- `Homo sapiens`

**Wildcards:**
- `Escherichia*`: Matches all E. coli strains
- `*coli`: Matches all coli species
- `*`: Matches all organisms

### Substrate Names

Substrate names follow IUPAC or common biochemical conventions:

**Common Formats:**
- Chemical names: `glucose`, `ethanol`, `pyruvate`
- IUPAC names: `β-D-glucose`, `ethanol`, `2-oxopropanoic acid`
- Abbreviations: `ATP`, `NAD+`, `CoA`

**Special Cases:**
- Cofactors: `NAD+`, `NADH`, `NADP+`, `NADPH`
- Metal ions: `Mg2+`, `Zn2+`, `Fe2+`
- Inorganic compounds: `H2O`, `CO2`, `O2`

### Commentary Field Format

Commentary fields contain experimental conditions and other metadata:

**Common Information:**
- **pH**: `pH 7.4`, `pH 6.5-8.0`
- **Temperature**: `25°C`, `37°C`, `50-60°C`
- **Buffer systems**: `phosphate buffer`, `Tris-HCl`
- **Purity**: `purified enzyme`, `crude extract`
- **Assay conditions**: `spectrophotometric`, `radioactive`
- **Inhibition**: `inhibited by heavy metals`, `activated by Mg2+`

**Examples:**
- `pH 7.4, 25°C, phosphate buffer`
- `pH 6.5-8.0 optimum, thermostable enzyme`
- `purified enzyme, specific activity 125 U/mg`
- `inhibited by iodoacetate, activated by Mn2+`

### Reaction Equation Format

Reactions use standard biochemical notation:

**Symbols:**
- `+`: Separate reactants/products
- `<=>`: Reversible reactions
- `->`: Irreversible (directional) reactions
- `=`: Alternative notation for reactions

**Common Patterns:**
- **Oxidation/reduction**: `alcohol + NAD+ <=> aldehyde + NADH + H+`
- **Phosphorylation**: `glucose + ATP <=> glucose-6-phosphate + ADP`
- **Hydrolysis**: `ester + H2O <=> acid + alcohol`
- **Carboxylation**: `acetyl-CoA + CO2 + H2O <=> malonyl-CoA`

**Cofactor Requirements:**
- **Oxidoreductases**: NAD+, NADH, NADP+, NADPH, FAD, FADH2
- **Transferases**: ATP, ADP, GTP, GDP
- **Ligases**: ATP, CoA

## Rate Limiting and Usage

### API Rate Limits

- **Maximum**: 5 requests per second
- **Sustained**: 1 request per second recommended
- **Daily quota**: Varies by account type

### Best Practices

1. **Implement delays**: Add 0.5-1 second between requests
2. **Cache results**: Store frequently accessed data locally
3. **Use specific searches**: Narrow by organism and substrate when possible
4. **Batch operations**: Group related queries
5. **Handle errors gracefully**: Check for HTTP and SOAP errors
6. **Use wildcards judiciously**: Broad searches return large datasets

### Error Handling

**Common SOAP Errors:**
- `Authentication failed`: Check email/password
- `No data found`: Verify EC number, organism, substrate spelling
- `Rate limit exceeded`: Reduce request frequency
- `Invalid parameters`: Check parameter format and order

**Network Errors:**
- Connection timeouts
- SSL/TLS errors
- Service unavailable

## Python Client Reference

### brenda_client Module

#### Core Functions

**`load_env_from_file(path=".env")`**
- **Purpose**: Load environment variables from .env file
- **Parameters**: `path` - Path to .env file (default: ".env")
- **Returns**: None (populates os.environ)

**`_get_credentials() -> tuple[str, str]`**
- **Purpose**: Retrieve BRENDA credentials from environment
- **Returns**: Tuple of (email, password)
- **Raises**: RuntimeError if credentials missing

**`_get_client() -> Client`**
- **Purpose**: Initialize or retrieve SOAP client
- **Returns**: Zeep Client instance
- **Features**: Singleton pattern, custom transport settings

**`_hash_password(password: str) -> str`**
- **Purpose**: Generate SHA-256 hash of password
- **Parameters**: `password` - Plain text password
- **Returns**: Hexadecimal SHA-256 hash

**`call_brenda(action: str, parameters: List[str]) -> str`**
- **Purpose**: Execute BRENDA SOAP action
- **Parameters**:
  - `action` - SOAP action name (e.g., "getKmValue")
  - `parameters` - List of parameters in correct order
- **Returns**: Raw response string from BRENDA

#### Convenience Functions

**`get_km_values(ec_number: str, organism: str = "*", substrate: str = "*") -> List[str]`**
- **Purpose**: Retrieve Km values for specified enzyme
- **Parameters**:
  - `ec_number`: Enzyme Commission number
  - `organism`: Organism name (wildcard allowed, default: "*")
  - `substrate`: Substrate name (wildcard allowed, default: "*")
- **Returns**: List of parsed data strings

**`get_reactions(ec_number: str, organism: str = "*", reaction: str = "*") -> List[str]`**
- **Purpose**: Retrieve reaction data for specified enzyme
- **Parameters**:
  - `ec_number`: Enzyme Commission number
  - `organism`: Organism name (wildcard allowed, default: "*")
  - `reaction`: Reaction pattern (wildcard allowed, default: "*")
- **Returns**: List of reaction data strings

#### Utility Functions

**`split_entries(return_text: str) -> List[str]`**
- **Purpose**: Normalize BRENDA responses to list format
- **Parameters**: `return_text` - Raw response from BRENDA
- **Returns**: List of individual data entries
- **Features**: Handles both string and complex object responses

## Data Structures and Parsing

### Km Entry Structure

**Parsed Km Entry Dictionary:**
```python
{
    'ecNumber': '1.1.1.1',
    'organism': 'Escherichia coli',
    'substrate': 'ethanol',
    'kmValue': '0.12',
    'km_value_numeric': 0.12,  # Extracted numeric value
    'kmValueMaximum': '',
    'commentary': 'pH 7.4, 25°C',
    'ph': 7.4,               # Extracted from commentary
    'temperature': 25.0,      # Extracted from commentary
    'ligandStructureId': '',
    'literature': ''
}
```

### Reaction Entry Structure

**Parsed Reaction Entry Dictionary:**
```python
{
    'ecNumber': '1.1.1.1',
    'organism': 'Saccharomyces cerevisiae',
    'reaction': 'ethanol + NAD+ <=> acetaldehyde + NADH + H+',
    'reactants': ['ethanol', 'NAD+'],
    'products': ['acetaldehyde', 'NADH', 'H+'],
    'commentary': '',
    'literature': ''
}
```

## Query Patterns and Examples

### Basic Queries

**Get all Km values for an enzyme:**
```python
from brenda_client import get_km_values

# Get all alcohol dehydrogenase Km values
km_data = get_km_values("1.1.1.1")
```

**Get Km values for specific organism:**
```python
# Get human alcohol dehydrogenase Km values
human_km = get_km_values("1.1.1.1", organism="Homo sapiens")
```

**Get Km values for specific substrate:**
```python
# Get Km for ethanol oxidation
ethanol_km = get_km_values("1.1.1.1", substrate="ethanol")
```

### Wildcard Searches

**Search for enzyme families:**
```python
# All alcohol dehydrogenases
alcohol_dehydrogenases = get_km_values("1.1.1.*")

# All hexokinases
hexokinases = get_km_values("2.7.1.*")
```

**Search for organism groups:**
```python
# All E. coli strains
e_coli_enzymes = get_km_values("*", organism="Escherichia coli")

# All Bacillus species
bacillus_enzymes = get_km_values("*", organism="Bacillus*")
```

### Combined Searches

**Specific enzyme-substrate combination:**
```python
# Get Km values for glucose oxidation in yeast
glucose_km = get_km_values("1.1.1.1",
                          organism="Saccharomyces cerevisiae",
                          substrate="glucose")
```

### Reaction Queries

**Get all reactions for an enzyme:**
```python
from brenda_client import get_reactions

reactions = get_reactions("1.1.1.1")
```

**Search for reactions with specific substrates:**
```python
# Find reactions involving glucose
glucose_reactions = get_reactions("*", reaction="*glucose*")
```

## Data Analysis Patterns

### Kinetic Parameter Analysis

**Extract numeric Km values:**
```python
from scripts.brenda_queries import parse_km_entry

km_data = get_km_values("1.1.1.1", substrate="ethanol")
numeric_kms = []

for entry in km_data:
    parsed = parse_km_entry(entry)
    if 'km_value_numeric' in parsed:
        numeric_kms.append(parsed['km_value_numeric'])

if numeric_kms:
    print(f"Average Km: {sum(numeric_kms)/len(numeric_kms):.3f}")
    print(f"Range: {min(numeric_kms):.3f} - {max(numeric_kms):.3f}")
```

### Organism Comparison

**Compare enzyme properties across organisms:**
```python
from scripts.brenda_queries import compare_across_organisms

organisms = ["Escherichia coli", "Saccharomyces cerevisiae", "Homo sapiens"]
comparison = compare_across_organisms("1.1.1.1", organisms)

for org_data in comparison:
    if org_data.get('data_points', 0) > 0:
        print(f"{org_data['organism']}: {org_data['average_km']:.3f}")
```

### Substrate Specificity

**Analyze substrate preferences:**
```python
from scripts.brenda_queries import get_substrate_specificity

specificity = get_substrate_specificity("1.1.1.1")

for substrate_data in specificity[:5]:  # Top 5
    print(f"{substrate_data['name']}: Km = {substrate_data['km']:.3f}")
```

## Integration Examples

### Metabolic Pathway Construction

**Build enzymatic pathway:**
```python
from scripts.enzyme_pathway_builder import find_pathway_for_product

# Find pathway for lactate production
pathway = find_pathway_for_product("lactate", max_steps=3)

for step in pathway['steps']:
    print(f"Step {step['step_number']}: {step['substrate']} -> {step['product']}")
    print(f"Enzymes available: {len(step['enzymes'])}")
```

### Enzyme Engineering Support

**Find thermostable variants:**
```python
from scripts.brenda_queries import find_thermophilic_homologs

thermophilic = find_thermophilic_homologs("1.1.1.1", min_temp=50)

for enzyme in thermophilic:
    print(f"{enzyme['organism']}: {enzyme['optimal_temperature']}°C")
```

### Kinetic Modeling

**Extract parameters for modeling:**
```python
from scripts.brenda_queries import get_modeling_parameters

model_data = get_modeling_parameters("1.1.1.1", substrate="ethanol")

print(f"Km: {model_data['km']}")
print(f"Vmax: {model_data['vmax']}")
print(f"Optimal conditions: pH {model_data['ph']}, {model_data['temperature']}°C")
```

## Troubleshooting

### Common Issues

**Authentication Errors:**
- Check BRENDA_EMAIL and BRENDA_PASSWORD environment variables
- Verify account is active and has API access
- Note legacy BRENDA_EMIAL support (typo in variable name)

**No Data Returned:**
- Verify EC number format (e.g., "1.1.1.1", not "1.1.1")
- Check spelling of organism and substrate names
- Try wildcards for broader searches
- Some enzymes may have limited data in BRENDA

**Rate Limiting:**
- Implement delays between requests
- Cache results locally
- Use more specific queries to reduce data volume
- Consider batch operations

**Data Format Issues:**
- Use provided parsing functions
- Handle missing fields gracefully
- BRENDA data format can be inconsistent
- Validate parsed data before use

### Performance Optimization

**Query Efficiency:**
- Use specific EC numbers when known
- Limit by organism or substrate to reduce result size
- Cache frequently accessed data
- Batch similar requests

**Memory Management:**
- Process large datasets in chunks
- Use generators for large result sets
- Clear parsed data when no longer needed

**Network Optimization:**
- Implement retry logic for network errors
- Use appropriate timeouts
- Monitor request frequency

## Additional Resources

### Official Documentation

- **BRENDA Website**: https://www.brenda-enzymes.org/
- **SOAP API Documentation**: https://www.brenda-enzymes.org/soap.php
- **Enzyme Nomenclature**: https://www.iubmb.org/enzyme/
- **EC Number Database**: https://www.qmul.ac.uk/sbcs/iubmb/enzyme/

### Related Libraries

- **Zeep (SOAP Client)**: https://python-zeep.readthedocs.io/
- **PubChemPy**: https://pubchempy.readthedocs.io/
- **BioPython**: https://biopython.org/
- **RDKit**: https://www.rdkit.org/

### Data Formats

- **Enzyme Commission Numbers**: IUBMB enzyme classification
- **IUPAC Nomenclature**: Chemical naming conventions
- **Biochemical Reactions**: Standard equation notation
- **Kinetic Parameters**: Michaelis-Menten kinetics

### Community Resources

- **BRENDA Help Desk**: Support via official website
- **Bioinformatics Forums**: Stack Overflow, Biostars
- **GitHub Issues**: Project-specific bug reports
- **Research Papers**: Primary literature for enzyme data

---

*This API reference covers the core functionality of the BRENDA SOAP API and Python client. For complete details on available data fields and query patterns, consult the official BRENDA documentation.*