---
name: uspto-database
description: "Access USPTO APIs for patent/trademark searches, examination history (PEDS), assignments, citations, office actions, TSDR, for IP analysis and prior art searches."
---

# USPTO Database

## Overview

USPTO provides specialized APIs for patent and trademark data. Search patents by keywords/inventors/assignees, retrieve examination history via PEDS, track assignments, analyze citations and office actions, access TSDR for trademarks, for IP analysis and prior art searches.

## When to Use This Skill

This skill should be used when:

- **Patent Search**: Finding patents by keywords, inventors, assignees, classifications, or dates
- **Patent Details**: Retrieving full patent data including claims, abstracts, citations
- **Trademark Search**: Looking up trademarks by serial or registration number
- **Trademark Status**: Checking trademark status, ownership, and prosecution history
- **Examination History**: Accessing patent prosecution data from PEDS (Patent Examination Data System)
- **Office Actions**: Retrieving office action text, citations, and rejections
- **Assignments**: Tracking patent/trademark ownership transfers
- **Citations**: Analyzing patent citations (forward and backward)
- **Litigation**: Accessing patent litigation records
- **Portfolio Analysis**: Analyzing patent/trademark portfolios for companies or inventors

## USPTO API Ecosystem

The USPTO provides multiple specialized APIs for different data needs:

### Core APIs

1. **PatentSearch API** - Modern ElasticSearch-based patent search (replaced legacy PatentsView in May 2025)
   - Search patents by keywords, inventors, assignees, classifications, dates
   - Access to patent data through June 30, 2025
   - 45 requests/minute rate limit
   - **Base URL**: `https://search.patentsview.org/api/v1/`

2. **PEDS (Patent Examination Data System)** - Patent examination history
   - Application status and transaction history from 1981-present
   - Office action dates and examination events
   - Use `uspto-opendata-python` Python library
   - **Replaced**: PAIR Bulk Data (PBD) - decommissioned

3. **TSDR (Trademark Status & Document Retrieval)** - Trademark data
   - Trademark status, ownership, prosecution history
   - Search by serial or registration number
   - **Base URL**: `https://tsdrapi.uspto.gov/ts/cd/`

### Additional APIs

4. **Patent Assignment Search** - Ownership records and transfers
5. **Trademark Assignment Search** - Trademark ownership changes
6. **Enriched Citation API** - Patent citation analysis
7. **Office Action Text Retrieval** - Full text of office actions
8. **Office Action Citations** - Citations from office actions
9. **Office Action Rejection** - Rejection reasons and types
10. **PTAB API** - Patent Trial and Appeal Board proceedings
11. **Patent Litigation Cases** - Federal district court litigation data
12. **Cancer Moonshot Data Set** - Cancer-related patents

## Quick Start

### API Key Registration

All USPTO APIs require an API key. Register at:
**https://account.uspto.gov/api-manager/**

Set the API key as an environment variable:
```bash
export USPTO_API_KEY="your_api_key_here"
```

### Helper Scripts

This skill includes Python scripts for common operations:

- **`scripts/patent_search.py`** - PatentSearch API client for searching patents
- **`scripts/peds_client.py`** - PEDS client for examination history
- **`scripts/trademark_client.py`** - TSDR client for trademark data

## Task 1: Searching Patents

### Using the PatentSearch API

The PatentSearch API uses a JSON query language with various operators for flexible searching.

#### Basic Patent Search Examples

**Search by keywords in abstract:**
```python
from scripts.patent_search import PatentSearchClient

client = PatentSearchClient()

# Search for machine learning patents
results = client.search_patents({
    "patent_abstract": {"_text_all": ["machine", "learning"]}
})

for patent in results['patents']:
    print(f"{patent['patent_number']}: {patent['patent_title']}")
```

**Search by inventor:**
```python
results = client.search_by_inventor("John Smith")
```

**Search by assignee/company:**
```python
results = client.search_by_assignee("Google")
```

**Search by date range:**
```python
results = client.search_by_date_range("2024-01-01", "2024-12-31")
```

**Search by CPC classification:**
```python
results = client.search_by_classification("H04N")  # Video/image tech
```

#### Advanced Patent Search

Combine multiple criteria with logical operators:

```python
results = client.advanced_search(
    keywords=["artificial", "intelligence"],
    assignee="Microsoft",
    start_date="2023-01-01",
    end_date="2024-12-31",
    cpc_codes=["G06N", "G06F"]  # AI and computing classifications
)
```

#### Direct API Usage

For complex queries, use the API directly:

```python
import requests

url = "https://search.patentsview.org/api/v1/patent"
headers = {
    "X-Api-Key": "YOUR_API_KEY",
    "Content-Type": "application/json"
}

query = {
    "q": {
        "_and": [
            {"patent_date": {"_gte": "2024-01-01"}},
            {"assignee_organization": {"_text_any": ["Google", "Alphabet"]}},
            {"cpc_subclass_id": ["G06N", "H04N"]}
        ]
    },
    "f": ["patent_number", "patent_title", "patent_date", "inventor_name"],
    "s": [{"patent_date": "desc"}],
    "o": {"per_page": 100, "page": 1}
}

response = requests.post(url, headers=headers, json=query)
results = response.json()
```

### Query Operators

- **Equality**: `{"field": "value"}` or `{"field": {"_eq": "value"}}`
- **Comparison**: `_gt`, `_gte`, `_lt`, `_lte`, `_neq`
- **Text search**: `_text_all`, `_text_any`, `_text_phrase`
- **String matching**: `_begins`, `_contains`
- **Logical**: `_and`, `_or`, `_not`

**Best Practice**: Use `_text_*` operators for text fields (more performant than `_contains` or `_begins`)

### Available Patent Endpoints

- `/patent` - Granted patents
- `/publication` - Pregrant publications
- `/inventor` - Inventor information
- `/assignee` - Assignee information
- `/cpc_subclass`, `/cpc_at_issue` - CPC classifications
- `/uspc` - US Patent Classification
- `/ipc` - International Patent Classification
- `/claims`, `/brief_summary_text`, `/detail_description_text` - Text data (beta)

### Reference Documentation

See `references/patentsearch_api.md` for complete PatentSearch API documentation including:
- All available endpoints
- Complete field reference
- Query syntax and examples
- Response formats
- Rate limits and best practices

## Task 2: Retrieving Patent Examination Data

### Using PEDS (Patent Examination Data System)

PEDS provides comprehensive prosecution history including transaction events, status changes, and examination timeline.

#### Installation

```bash
pip install uspto-opendata-python
```

#### Basic PEDS Usage

**Get application data:**
```python
from scripts.peds_client import PEDSHelper

helper = PEDSHelper()

# By application number
app_data = helper.get_application("16123456")
print(f"Title: {app_data['title']}")
print(f"Status: {app_data['app_status']}")

# By patent number
patent_data = helper.get_patent("11234567")
```

**Get transaction history:**
```python
transactions = helper.get_transaction_history("16123456")

for trans in transactions:
    print(f"{trans['date']}: {trans['code']} - {trans['description']}")
```

**Get office actions:**
```python
office_actions = helper.get_office_actions("16123456")

for oa in office_actions:
    if oa['code'] == 'CTNF':
        print(f"Non-final rejection: {oa['date']}")
    elif oa['code'] == 'CTFR':
        print(f"Final rejection: {oa['date']}")
    elif oa['code'] == 'NOA':
        print(f"Notice of allowance: {oa['date']}")
```

**Get status summary:**
```python
summary = helper.get_status_summary("16123456")

print(f"Current status: {summary['current_status']}")
print(f"Filing date: {summary['filing_date']}")
print(f"Pendency: {summary['pendency_days']} days")

if summary['is_patented']:
    print(f"Patent number: {summary['patent_number']}")
    print(f"Issue date: {summary['issue_date']}")
```

#### Prosecution Analysis

Analyze prosecution patterns:

```python
analysis = helper.analyze_prosecution("16123456")

print(f"Total office actions: {analysis['total_office_actions']}")
print(f"Non-final rejections: {analysis['non_final_rejections']}")
print(f"Final rejections: {analysis['final_rejections']}")
print(f"Allowed: {analysis['allowance']}")
print(f"Responses filed: {analysis['responses']}")
```

### Common Transaction Codes

- **CTNF** - Non-final rejection mailed
- **CTFR** - Final rejection mailed
- **NOA** - Notice of allowance mailed
- **WRIT** - Response filed
- **ISS.FEE** - Issue fee payment
- **ABND** - Application abandoned
- **AOPF** - Office action mailed

### Reference Documentation

See `references/peds_api.md` for complete PEDS documentation including:
- All available data fields
- Transaction code reference
- Python library usage
- Portfolio analysis examples

## Task 3: Searching and Monitoring Trademarks

### Using TSDR (Trademark Status & Document Retrieval)

Access trademark status, ownership, and prosecution history.

#### Basic Trademark Usage

**Get trademark by serial number:**
```python
from scripts.trademark_client import TrademarkClient

client = TrademarkClient()

# By serial number
tm_data = client.get_trademark_by_serial("87654321")

# By registration number
tm_data = client.get_trademark_by_registration("5678901")
```

**Get trademark status:**
```python
status = client.get_trademark_status("87654321")

print(f"Mark: {status['mark_text']}")
print(f"Status: {status['status']}")
print(f"Filing date: {status['filing_date']}")

if status['is_registered']:
    print(f"Registration #: {status['registration_number']}")
    print(f"Registration date: {status['registration_date']}")
```

**Check trademark health:**
```python
health = client.check_trademark_health("87654321")

print(f"Mark: {health['mark']}")
print(f"Status: {health['status']}")

for alert in health['alerts']:
    print(alert)

if health['needs_attention']:
    print("⚠️  This mark needs attention!")
```

#### Trademark Portfolio Monitoring

Monitor multiple trademarks:

```python
def monitor_portfolio(serial_numbers, api_key):
    """Monitor trademark portfolio health."""
    client = TrademarkClient(api_key)

    results = {
        'active': [],
        'pending': [],
        'problems': []
    }

    for sn in serial_numbers:
        health = client.check_trademark_health(sn)

        if 'REGISTERED' in health['status']:
            results['active'].append(health)
        elif 'PENDING' in health['status'] or 'PUBLISHED' in health['status']:
            results['pending'].append(health)
        elif health['needs_attention']:
            results['problems'].append(health)

    return results
```

### Common Trademark Statuses

- **REGISTERED** - Active registered mark
- **PENDING** - Under examination
- **PUBLISHED FOR OPPOSITION** - In opposition period
- **ABANDONED** - Application abandoned
- **CANCELLED** - Registration cancelled
- **SUSPENDED** - Examination suspended
- **REGISTERED AND RENEWED** - Registration renewed

### Reference Documentation

See `references/trademark_api.md` for complete trademark API documentation including:
- TSDR API reference
- Trademark Assignment Search API
- All status codes
- Prosecution history access
- Ownership tracking

## Task 4: Tracking Assignments and Ownership

### Patent and Trademark Assignments

Both patents and trademarks have Assignment Search APIs for tracking ownership changes.

#### Patent Assignment API

**Base URL**: `https://assignment-api.uspto.gov/patent/v1.4/`

**Search by patent number:**
```python
import requests
import xml.etree.ElementTree as ET

def get_patent_assignments(patent_number, api_key):
    url = f"https://assignment-api.uspto.gov/patent/v1.4/assignment/patent/{patent_number}"
    headers = {"X-Api-Key": api_key}

    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.text  # Returns XML

assignments_xml = get_patent_assignments("11234567", api_key)
root = ET.fromstring(assignments_xml)

for assignment in root.findall('.//assignment'):
    recorded_date = assignment.find('recordedDate').text
    assignor = assignment.find('.//assignor/name').text
    assignee = assignment.find('.//assignee/name').text
    conveyance = assignment.find('conveyanceText').text

    print(f"{recorded_date}: {assignor} → {assignee}")
    print(f"  Type: {conveyance}\n")
```

**Search by company name:**
```python
def find_company_patents(company_name, api_key):
    url = "https://assignment-api.uspto.gov/patent/v1.4/assignment/search"
    headers = {"X-Api-Key": api_key}
    data = {"criteria": {"assigneeName": company_name}}

    response = requests.post(url, headers=headers, json=data)
    return response.text
```

### Common Assignment Types

- **ASSIGNMENT OF ASSIGNORS INTEREST** - Ownership transfer
- **SECURITY AGREEMENT** - Collateral/security interest
- **MERGER** - Corporate merger
- **CHANGE OF NAME** - Name change
- **ASSIGNMENT OF PARTIAL INTEREST** - Partial ownership

## Task 5: Accessing Additional USPTO Data

### Office Actions, Citations, and Litigation

Multiple specialized APIs provide additional patent data.

#### Office Action Text Retrieval

Retrieve full text of office actions using application number. Integrate with PEDS to identify which office actions exist, then retrieve full text.

#### Enriched Citation API

Analyze patent citations:
- Forward citations (patents citing this patent)
- Backward citations (prior art cited)
- Examiner vs. applicant citations
- Citation context

#### Patent Litigation Cases API

Access federal district court patent litigation records:
- 74,623+ litigation records
- Patents asserted
- Parties and venues
- Case outcomes

#### PTAB API

Patent Trial and Appeal Board proceedings:
- Inter partes review (IPR)
- Post-grant review (PGR)
- Appeal decisions

### Reference Documentation

See `references/additional_apis.md` for comprehensive documentation on:
- Enriched Citation API
- Office Action APIs (Text, Citations, Rejections)
- Patent Litigation Cases API
- PTAB API
- Cancer Moonshot Data Set
- OCE Status/Event Codes

## Complete Analysis Example

### Comprehensive Patent Analysis

Combine multiple APIs for complete patent intelligence:

```python
def comprehensive_patent_analysis(patent_number, api_key):
    """
    Full patent analysis using multiple USPTO APIs.
    """
    from scripts.patent_search import PatentSearchClient
    from scripts.peds_client import PEDSHelper

    results = {}

    # 1. Get patent details
    patent_client = PatentSearchClient(api_key)
    patent_data = patent_client.get_patent(patent_number)
    results['patent'] = patent_data

    # 2. Get examination history
    peds = PEDSHelper()
    results['prosecution'] = peds.analyze_prosecution(patent_number)
    results['status'] = peds.get_status_summary(patent_number)

    # 3. Get assignment history
    import requests
    assign_url = f"https://assignment-api.uspto.gov/patent/v1.4/assignment/patent/{patent_number}"
    assign_resp = requests.get(assign_url, headers={"X-Api-Key": api_key})
    results['assignments'] = assign_resp.text if assign_resp.status_code == 200 else None

    # 4. Analyze results
    print(f"\n=== Patent {patent_number} Analysis ===\n")
    print(f"Title: {patent_data['patent_title']}")
    print(f"Assignee: {', '.join(patent_data.get('assignee_organization', []))}")
    print(f"Issue Date: {patent_data['patent_date']}")

    print(f"\nProsecution:")
    print(f"  Office Actions: {results['prosecution']['total_office_actions']}")
    print(f"  Rejections: {results['prosecution']['non_final_rejections']} non-final, {results['prosecution']['final_rejections']} final")
    print(f"  Pendency: {results['prosecution']['pendency_days']} days")

    # Analyze citations
    if 'cited_patent_number' in patent_data:
        print(f"\nCitations:")
        print(f"  Cites: {len(patent_data['cited_patent_number'])} patents")
    if 'citedby_patent_number' in patent_data:
        print(f"  Cited by: {len(patent_data['citedby_patent_number'])} patents")

    return results
```

## Best Practices

1. **API Key Management**
   - Store API key in environment variables
   - Never commit keys to version control
   - Use same key across all USPTO APIs

2. **Rate Limiting**
   - PatentSearch: 45 requests/minute
   - Implement exponential backoff for rate limit errors
   - Cache responses when possible

3. **Query Optimization**
   - Use `_text_*` operators for text fields (more performant)
   - Request only needed fields to reduce response size
   - Use date ranges to narrow searches

4. **Data Handling**
   - Not all fields populated for all patents/trademarks
   - Handle missing data gracefully
   - Parse dates consistently

5. **Combining APIs**
   - Use PatentSearch for discovery
   - Use PEDS for prosecution details
   - Use Assignment APIs for ownership tracking
   - Combine data for comprehensive analysis

## Important Notes

- **Legacy API Sunset**: PatentsView legacy API discontinued May 1, 2025 - use PatentSearch API
- **PAIR Bulk Data Decommissioned**: Use PEDS instead
- **Data Coverage**: PatentSearch has data through June 30, 2025; PEDS from 1981-present
- **Text Endpoints**: Claims and description endpoints are in beta with ongoing backfilling
- **Rate Limits**: Respect rate limits to avoid service disruptions

## Resources

### API Documentation
- **PatentSearch API**: https://search.patentsview.org/docs/
- **USPTO Developer Portal**: https://developer.uspto.gov/
- **USPTO Open Data Portal**: https://data.uspto.gov/
- **API Key Registration**: https://account.uspto.gov/api-manager/

### Python Libraries
- **uspto-opendata-python**: https://pypi.org/project/uspto-opendata-python/
- **USPTO Docs**: https://docs.ip-tools.org/uspto-opendata-python/

### Reference Files
- `references/patentsearch_api.md` - Complete PatentSearch API reference
- `references/peds_api.md` - PEDS API and library documentation
- `references/trademark_api.md` - Trademark APIs (TSDR and Assignment)
- `references/additional_apis.md` - Citations, Office Actions, Litigation, PTAB

### Scripts
- `scripts/patent_search.py` - PatentSearch API client
- `scripts/peds_client.py` - PEDS examination data client
- `scripts/trademark_client.py` - Trademark search client
