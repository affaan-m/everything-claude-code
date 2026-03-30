# FDA Drug Databases

This reference covers all FDA drug-related API endpoints accessible through openFDA.

## Overview

The FDA drug databases provide access to information about pharmaceutical products, including adverse events, labeling, recalls, approvals, and shortages. All endpoints follow the openFDA API structure and return JSON-formatted data.

## Available Endpoints

### 1. Drug Adverse Events

**Endpoint**: `https://api.fda.gov/drug/event.json`

**Purpose**: Access reports of drug side effects, product use errors, product quality problems, and therapeutic failures submitted to the FDA.

**Data Source**: FDA Adverse Event Reporting System (FAERS)

**Key Fields**:
- `patient.drug.medicinalproduct` - Drug name
- `patient.drug.drugindication` - Reason for taking the drug
- `patient.reaction.reactionmeddrapt` - Adverse reaction description
- `receivedate` - Date report was received
- `serious` - Whether the event was serious (1 = serious, 2 = not serious)
- `seriousnessdeath` - Whether the event resulted in death
- `primarysource.qualification` - Reporter qualification (physician, pharmacist, etc.)

**Common Use Cases**:
- Safety signal detection
- Post-market surveillance
- Drug interaction analysis
- Comparative safety research

**Example Queries**:
```python
# Find adverse events for a specific drug
import requests

api_key = "YOUR_API_KEY"
url = "https://api.fda.gov/drug/event.json"

# Search for aspirin-related adverse events
params = {
    "api_key": api_key,
    "search": "patient.drug.medicinalproduct:aspirin",
    "limit": 10
}

response = requests.get(url, params=params)
data = response.json()
```

```python
# Count most common reactions for a drug
params = {
    "api_key": api_key,
    "search": "patient.drug.medicinalproduct:metformin",
    "count": "patient.reaction.reactionmeddrapt.exact"
}
```

### 2. Drug Product Labeling

**Endpoint**: `https://api.fda.gov/drug/label.json`

**Purpose**: Access structured product information including prescribing information, warnings, indications, and usage for FDA-approved and marketed drug products.

**Data Source**: Structured Product Labeling (SPL)

**Key Fields**:
- `openfda.brand_name` - Brand name(s) of the drug
- `openfda.generic_name` - Generic name(s)
- `indications_and_usage` - Approved uses
- `warnings` - Important safety warnings
- `adverse_reactions` - Known adverse reactions
- `dosage_and_administration` - How to use the drug
- `description` - Chemical and physical description
- `pharmacodynamics` - How the drug works
- `contraindications` - When not to use the drug
- `drug_interactions` - Known drug interactions
- `active_ingredient` - Active ingredients
- `inactive_ingredient` - Inactive ingredients

**Common Use Cases**:
- Clinical decision support
- Drug information lookup
- Patient education materials
- Formulary management
- Drug comparison analysis

**Example Queries**:
```python
# Get full labeling for a brand-name drug
params = {
    "api_key": api_key,
    "search": "openfda.brand_name:Lipitor",
    "limit": 1
}

response = requests.get("https://api.fda.gov/drug/label.json", params=params)
label_data = response.json()

# Extract specific sections
if "results" in label_data:
    label = label_data["results"][0]
    indications = label.get("indications_and_usage", ["Not available"])[0]
    warnings = label.get("warnings", ["Not available"])[0]
```

```python
# Search labels containing specific warnings
params = {
    "api_key": api_key,
    "search": "warnings:*hypertension*",
    "limit": 10
}
```

### 3. National Drug Code (NDC) Directory

**Endpoint**: `https://api.fda.gov/drug/ndc.json`

**Purpose**: Access the NDC Directory containing information about drug products identified by National Drug Codes.

**Data Source**: FDA NDC Directory

**Key Fields**:
- `product_ndc` - 10-digit NDC product identifier
- `generic_name` - Generic drug name
- `labeler_name` - Company that manufactures/distributes
- `brand_name` - Brand name if applicable
- `dosage_form` - Form (tablet, capsule, solution, etc.)
- `route` - Administration route (oral, injection, topical, etc.)
- `product_type` - Type of drug product
- `marketing_category` - Regulatory pathway (NDA, ANDA, OTC, etc.)
- `application_number` - FDA application number
- `active_ingredients` - List of active ingredients with strengths
- `packaging` - Package descriptions and NDC codes
- `listing_expiration_date` - When listing expires

**Common Use Cases**:
- NDC lookup and validation
- Product identification
- Supply chain management
- Prescription processing
- Insurance claims processing

**Example Queries**:
```python
# Look up drug by NDC code
params = {
    "api_key": api_key,
    "search": "product_ndc:0069-2110",
    "limit": 1
}

response = requests.get("https://api.fda.gov/drug/ndc.json", params=params)
```

```python
# Find all products from a specific manufacturer
params = {
    "api_key": api_key,
    "search": "labeler_name:Pfizer",
    "limit": 100
}
```

```python
# Get all oral tablets of a generic drug
params = {
    "api_key": api_key,
    "search": "generic_name:lisinopril+AND+dosage_form:TABLET",
    "limit": 50
}
```

### 4. Drug Recall Enforcement Reports

**Endpoint**: `https://api.fda.gov/drug/enforcement.json`

**Purpose**: Access drug product recall enforcement reports issued by the FDA.

**Data Source**: FDA Enforcement Reports

**Key Fields**:
- `status` - Current status (Ongoing, Completed, Terminated)
- `recall_number` - Unique recall identifier
- `classification` - Class I, II, or III (severity)
- `product_description` - Description of recalled product
- `reason_for_recall` - Why product was recalled
- `product_quantity` - Amount of product recalled
- `code_info` - Lot numbers, serial numbers, NDCs
- `distribution_pattern` - Geographic distribution
- `recalling_firm` - Company conducting recall
- `recall_initiation_date` - When recall began
- `report_date` - When FDA received notice
- `voluntary_mandated` - Type of recall

**Classification Levels**:
- **Class I**: Dangerous or defective products that could cause serious health problems or death
- **Class II**: Products that might cause temporary health problems or pose slight threat of serious nature
- **Class III**: Products unlikely to cause adverse health reaction but violate FDA labeling/manufacturing regulations

**Common Use Cases**:
- Quality assurance monitoring
- Supply chain risk management
- Patient safety alerts
- Regulatory compliance tracking

**Example Queries**:
```python
# Find all Class I (most serious) drug recalls
params = {
    "api_key": api_key,
    "search": "classification:Class+I",
    "limit": 20,
    "sort": "report_date:desc"
}

response = requests.get("https://api.fda.gov/drug/enforcement.json", params=params)
```

```python
# Search for recalls of a specific drug
params = {
    "api_key": api_key,
    "search": "product_description:*metformin*",
    "limit": 10
}
```

```python
# Find ongoing recalls
params = {
    "api_key": api_key,
    "search": "status:Ongoing",
    "limit": 50
}
```

### 5. Drugs@FDA

**Endpoint**: `https://api.fda.gov/drug/drugsfda.json`

**Purpose**: Access comprehensive information about FDA-approved drug products from Drugs@FDA database, including approval history and regulatory information.

**Data Source**: Drugs@FDA Database (most drugs approved since 1939)

**Key Fields**:
- `application_number` - NDA/ANDA/BLA number
- `sponsor_name` - Company that submitted application
- `openfda.brand_name` - Brand name(s)
- `openfda.generic_name` - Generic name(s)
- `products` - Array of approved products under this application
- `products.active_ingredients` - Active ingredients with strengths
- `products.dosage_form` - Dosage form
- `products.route` - Route of administration
- `products.marketing_status` - Current marketing status
- `submissions` - Array of regulatory submissions
- `submissions.submission_type` - Type of submission
- `submissions.submission_status` - Status (approved, pending, etc.)
- `submissions.submission_status_date` - Status date
- `submissions.review_priority` - Priority or standard review

**Common Use Cases**:
- Drug approval research
- Regulatory pathway analysis
- Historical approval tracking
- Competitive intelligence
- Market access research

**Example Queries**:
```python
# Find approval information for a specific drug
params = {
    "api_key": api_key,
    "search": "openfda.brand_name:Keytruda",
    "limit": 1
}

response = requests.get("https://api.fda.gov/drug/drugsfda.json", params=params)
```

```python
# Get all drugs approved by a specific sponsor
params = {
    "api_key": api_key,
    "search": "sponsor_name:Moderna",
    "limit": 100
}
```

```python
# Find drugs with priority review designation
params = {
    "api_key": api_key,
    "search": "submissions.review_priority:Priority",
    "limit": 50
}
```

### 6. Drug Shortages

**Endpoint**: `https://api.fda.gov/drug/drugshortages.json`

**Purpose**: Access information about current and resolved drug shortages affecting the United States.

**Data Source**: FDA Drug Shortages Database

**Key Fields**:
- `product_name` - Name of drug in shortage
- `status` - Current status (Currently in Shortage, Resolved, Discontinued)
- `reason` - Reason for shortage
- `shortage_start_date` - When shortage began
- `resolution_date` - When shortage was resolved (if applicable)
- `discontinuation_date` - If product was discontinued
- `active_ingredient` - Active ingredients
- `marketed_by` - Companies marketing the product
- `presentation` - Dosage form and strength

**Common Use Cases**:
- Formulary management
- Supply chain planning
- Patient care continuity
- Therapeutic alternative identification
- Procurement planning

**Example Queries**:
```python
# Find current drug shortages
params = {
    "api_key": api_key,
    "search": "status:Currently+in+Shortage",
    "limit": 100
}

response = requests.get("https://api.fda.gov/drug/drugshortages.json", params=params)
```

```python
# Search for shortages of a specific drug
params = {
    "api_key": api_key,
    "search": "product_name:*amoxicillin*",
    "limit": 10
}
```

```python
# Get shortage history (both current and resolved)
params = {
    "api_key": api_key,
    "search": "active_ingredient:epinephrine",
    "limit": 50
}
```

## Integration Tips

### Error Handling

```python
import requests
import time

def query_fda_drug(endpoint, params, max_retries=3):
    """
    Query FDA drug database with error handling and retry logic.

    Args:
        endpoint: Full URL endpoint (e.g., "https://api.fda.gov/drug/event.json")
        params: Dictionary of query parameters
        max_retries: Maximum number of retry attempts

    Returns:
        Response JSON data or None if error
    """
    for attempt in range(max_retries):
        try:
            response = requests.get(endpoint, params=params, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as e:
            if response.status_code == 404:
                print(f"No results found for query")
                return None
            elif response.status_code == 429:
                # Rate limit exceeded, wait and retry
                wait_time = 60 * (attempt + 1)
                print(f"Rate limit exceeded. Waiting {wait_time} seconds...")
                time.sleep(wait_time)
            else:
                print(f"HTTP error occurred: {e}")
                return None
        except requests.exceptions.RequestException as e:
            print(f"Request error: {e}")
            if attempt < max_retries - 1:
                time.sleep(5)
            else:
                return None
    return None
```

### Pagination for Large Result Sets

```python
def get_all_results(endpoint, search_query, api_key, max_results=1000):
    """
    Retrieve all results for a query using pagination.

    Args:
        endpoint: API endpoint URL
        search_query: Search query string
        api_key: FDA API key
        max_results: Maximum total results to retrieve

    Returns:
        List of all result records
    """
    all_results = []
    skip = 0
    limit = 100  # Max per request

    while len(all_results) < max_results:
        params = {
            "api_key": api_key,
            "search": search_query,
            "limit": limit,
            "skip": skip
        }

        data = query_fda_drug(endpoint, params)
        if not data or "results" not in data:
            break

        results = data["results"]
        all_results.extend(results)

        # Check if we've retrieved all available results
        if len(results) < limit:
            break

        skip += limit
        time.sleep(0.25)  # Rate limiting courtesy

    return all_results[:max_results]
```

## Best Practices

1. **Always use HTTPS** - HTTP requests are not accepted
2. **Include API key** - Provides higher rate limits (120,000/day vs 1,000/day)
3. **Use exact matching for aggregations** - Add `.exact` suffix to field names in count queries
4. **Implement rate limiting** - Stay within 240 requests/minute
5. **Cache results** - Avoid redundant queries for the same data
6. **Handle errors gracefully** - Implement retry logic for transient failures
7. **Use specific field searches** - More efficient than full-text searches
8. **Validate NDC codes** - Use standard 11-digit format with hyphens removed
9. **Monitor API status** - Check openFDA status page for outages
10. **Respect data limitations** - OpenFDA contains public data only, not all FDA data

## Additional Resources

- OpenFDA Drug API Documentation: https://open.fda.gov/apis/drug/
- API Basics: See `api_basics.md` in this references directory
- Python examples: See `scripts/fda_drug_query.py`
- Field reference guides: Available at https://open.fda.gov/apis/drug/[endpoint]/searchable-fields/
