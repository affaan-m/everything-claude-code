# Additional USPTO APIs Reference

## Overview

Beyond patent search, PEDS, and trademarks, USPTO provides specialized APIs for citations, office actions, assignments, litigation, and other patent data.

## 1. Enriched Citation API

### Overview

Provides insights into patent evaluation processes and cited references for the IP5 (USPTO, EPO, JPO, KIPO, CNIPA) and public use.

**Versions:** v3, v2, v1

**Base URL:** Access through USPTO Open Data Portal

### Purpose

Analyze which references examiners cite during patent examination and how patents cite prior art.

### Key Features

- **Forward citations** - Patents that cite a given patent
- **Backward citations** - References cited by a patent
- **Examiner citations** - References cited by examiner vs. applicant
- **Citation context** - How and why references are cited

### Use Cases

- Prior art analysis
- Patent landscape analysis
- Identifying related technologies
- Assessing patent strength based on citations

## 2. Office Action APIs

### 2.1 Office Action Text Retrieval API

**Version:** v1

### Purpose

Retrieves complete full-text office action correspondence documents for patent applications.

### Features

- Full text of office actions
- Restrictions, rejections, objections
- Examiner amendments
- Search information

### Example Use

```python
# Retrieve office action text by application number
def get_office_action_text(app_number, api_key):
    """
    Fetch full text of office actions for an application.
    Note: Integrate with PEDS to identify which office actions exist.
    """
    # API implementation
    pass
```

### 2.2 Office Action Citations API

**Versions:** v2, beta v1

### Purpose

Provides patent citation data extracted from office actions, showing which references examiners used during examination.

### Key Data

- Patent and non-patent literature citations
- Citation context (rejection, information, etc.)
- Examiner search strategies
- Prosecution research dataset

### 2.3 Office Action Rejection API

**Versions:** v2, beta v1

### Purpose

Details rejection reasons and examination outcomes with bulk rejection data through March 2025.

### Rejection Types

- **35 U.S.C. § 102** - Anticipation (lack of novelty)
- **35 U.S.C. § 103** - Obviousness
- **35 U.S.C. § 112** - Enablement, written description, indefiniteness
- **35 U.S.C. § 101** - Subject matter eligibility

### Use Cases

- Analyze common rejection reasons
- Identify problematic claim language
- Prepare responses based on historical data
- Portfolio analysis of rejection patterns

### 2.4 Office Action Weekly Zips API

**Version:** v1

### Purpose

Delivers bulk downloads of full-text office action documents organized by weekly release schedules.

### Features

- Weekly archive downloads
- Complete office action text
- Bulk access for large-scale analysis

## 3. Patent Assignment Search API

### Overview

**Version:** v1.4

Accesses USPTO patent assignment database for ownership records and transfers.

**Base URL:** `https://assignment-api.uspto.gov/patent/`

### Purpose

Track patent ownership, assignments, security interests, and corporate transactions.

### Search Methods

#### By Patent Number

```
GET /v1.4/assignment/patent/{patent_number}
```

#### By Application Number

```
GET /v1.4/assignment/application/{application_number}
```

#### By Assignee Name

```
POST /v1.4/assignment/search
{
  "criteria": {
    "assigneeName": "Company Name"
  }
}
```

### Response Format

Returns XML with assignment records similar to trademark assignments:

- Reel/frame numbers
- Conveyance type
- Dates (execution and recorded)
- Assignors and assignees
- Affected patents/applications

### Common Uses

```python
def track_patent_ownership(patent_number, api_key):
    """Track ownership history of a patent."""
    url = f"https://assignment-api.uspto.gov/patent/v1.4/assignment/patent/{patent_number}"
    headers = {"X-Api-Key": api_key}

    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        # Parse XML to extract assignment history
        return response.text
    return None

def find_company_patents(company_name, api_key):
    """Find patents assigned to a company."""
    url = "https://assignment-api.uspto.gov/patent/v1.4/assignment/search"
    headers = {"X-Api-Key": api_key}
    data = {"criteria": {"assigneeName": company_name}}

    response = requests.post(url, headers=headers, json=data)
    return response.text
```

## 4. PTAB API (Patent Trial and Appeal Board)

### Overview

**Version:** v2

Access to Patent Trial and Appeal Board proceedings data.

### Purpose

Retrieve information about:
- Inter partes review (IPR)
- Post-grant review (PGR)
- Covered business method (CBM) review
- Ex parte appeals

### Data Available

- Petition information
- Trial decisions
- Final written decisions
- Petitioner and patent owner information
- Claims challenged
- Trial outcomes

### Note

Currently migrating to new Open Data Portal. Check current documentation for access details.

## 5. Patent Litigation Cases API

### Overview

**Version:** v1

Contains 74,623+ district court litigation records covering patent litigation data.

### Purpose

Access federal district court patent infringement cases.

### Key Data

- Case numbers and filing dates
- Patents asserted
- Parties (plaintiffs and defendants)
- Venues
- Case outcomes

### Use Cases

- Litigation risk analysis
- Identify frequently litigated patents
- Track litigation trends
- Analyze venue preferences
- Assess patent enforcement patterns

## 6. Cancer Moonshot Patent Data Set API

### Overview

**Version:** v1.0.1

Specialized dataset for cancer-related patent discoveries.

### Purpose

Search and download patents related to cancer research, treatment, and diagnostics.

### Features

- Curated cancer-related patents
- Bulk data download
- Classification by cancer type
- Treatment modality categorization

### Use Cases

- Cancer research prior art
- Technology landscape analysis
- Identify research trends
- Licensing opportunities

## 7. OCE Patent Examination Status/Event Codes APIs

### Overview

**Version:** v1

Provides official descriptions of USPTO status and event codes used in patent examination.

### Purpose

Decode transaction codes and status codes found in PEDS and other examination data.

### Data Provided

- **Status codes** - Application status descriptions
- **Event codes** - Transaction/event descriptions
- **Code definitions** - Official meanings

### Integration

Use with PEDS data to interpret transaction codes:

```python
def get_code_description(code, api_key):
    """Get human-readable description of USPTO code."""
    # Fetch from OCE API
    pass

def enrich_peds_data(peds_transactions, api_key):
    """Add descriptions to PEDS transaction codes."""
    for trans in peds_transactions:
        trans['description'] = get_code_description(trans['code'], api_key)
    return peds_transactions
```

## API Integration Patterns

### Combined Workflow Example

```python
def comprehensive_patent_analysis(patent_number, api_key):
    """
    Comprehensive analysis combining multiple APIs.
    """
    results = {}

    # 1. Get patent details from PatentSearch
    results['patent_data'] = search_patent(patent_number, api_key)

    # 2. Get examination history from PEDS
    results['prosecution'] = get_peds_data(patent_number, api_key)

    # 3. Get assignment history
    results['assignments'] = get_assignments(patent_number, api_key)

    # 4. Get citation data
    results['citations'] = get_citations(patent_number, api_key)

    # 5. Check litigation history
    results['litigation'] = get_litigation(patent_number, api_key)

    # 6. Get PTAB challenges
    results['ptab'] = get_ptab_proceedings(patent_number, api_key)

    return results
```

### Portfolio Analysis Example

```python
def analyze_company_portfolio(company_name, api_key):
    """
    Analyze a company's patent portfolio using multiple APIs.
    """
    # 1. Find all assigned patents
    assignments = find_company_patents(company_name, api_key)
    patent_numbers = extract_patent_numbers(assignments)

    # 2. Get details for each patent
    portfolio = []
    for patent_num in patent_numbers:
        patent_data = {
            'number': patent_num,
            'details': search_patent(patent_num, api_key),
            'citations': get_citations(patent_num, api_key),
            'litigation': get_litigation(patent_num, api_key)
        }
        portfolio.append(patent_data)

    # 3. Aggregate statistics
    stats = {
        'total_patents': len(portfolio),
        'cited_by_count': sum(len(p['citations']) for p in portfolio),
        'litigated_count': sum(1 for p in portfolio if p['litigation']),
        'technology_areas': aggregate_tech_areas(portfolio)
    }

    return {'portfolio': portfolio, 'statistics': stats}
```

## Best Practices

1. **API Key Management** - Use environment variables, never hardcode
2. **Rate Limiting** - Implement exponential backoff for all APIs
3. **Caching** - Cache API responses to minimize redundant calls
4. **Error Handling** - Gracefully handle API errors and missing data
5. **Data Validation** - Validate input formats before API calls
6. **Combining APIs** - Use appropriate APIs together for comprehensive analysis
7. **Documentation** - Keep track of API versions and changes

## API Key Registration

All APIs require registration at:
**https://account.uspto.gov/api-manager/**

Single API key works across most USPTO APIs.

## Resources

- **Developer Portal**: https://developer.uspto.gov/
- **Open Data Portal**: https://data.uspto.gov/
- **API Catalog**: https://developer.uspto.gov/api-catalog
- **Swagger Docs**: Available for individual APIs
