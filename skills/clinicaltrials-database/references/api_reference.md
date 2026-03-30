# ClinicalTrials.gov API v2 Reference Documentation

## Overview

The ClinicalTrials.gov API v2 is a modern REST API that provides programmatic access to the ClinicalTrials.gov database, which contains information about clinical studies conducted around the world. The API follows the OpenAPI Specification 3.0 and provides both JSON and CSV response formats.

**Base URL:** `https://clinicaltrials.gov/api/v2`

**API Version:** 2.0 (released March 2024, replacing the classic API)

## Authentication & Rate Limits

- **Authentication:** Not required (public API)
- **Rate Limit:** Approximately 50 requests per minute per IP address
- **Response Formats:** JSON (default) or CSV
- **Standards:** Uses ISO 8601 for dates, CommonMark Markdown for rich text

## Core Endpoints

### 1. Search Studies

**Endpoint:** `GET /api/v2/studies`

Search for clinical trials using various query parameters and filters.

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `query.cond` | string | Disease or condition search | `lung cancer`, `diabetes` |
| `query.intr` | string | Treatment or intervention search | `Pembrolizumab`, `exercise` |
| `query.locn` | string | Geographic location filtering | `New York`, `California, USA` |
| `query.spons` | string | Sponsor or collaborator name | `National Cancer Institute` |
| `query.term` | string | General full-text search | `breast cancer treatment` |
| `filter.overallStatus` | string | Status-based filtering (comma-separated) | `RECRUITING,NOT_YET_RECRUITING` |
| `filter.ids` | string | NCT ID intersection filtering (comma-separated) | `NCT04852770,NCT01728545` |
| `filter.phase` | string | Study phase filtering | `PHASE1,PHASE2` |
| `sort` | string | Result ordering | `LastUpdatePostDate:desc` |
| `pageSize` | integer | Results per page (max 1000) | `100` |
| `pageToken` | string | Pagination token from previous response | `<token>` |
| `format` | string | Response format (`json` or `csv`) | `json` |

**Valid Status Values:**
- `RECRUITING` - Currently recruiting participants
- `NOT_YET_RECRUITING` - Not yet open for recruitment
- `ENROLLING_BY_INVITATION` - Only enrolling by invitation
- `ACTIVE_NOT_RECRUITING` - Active but no longer recruiting
- `SUSPENDED` - Temporarily halted
- `TERMINATED` - Stopped prematurely
- `COMPLETED` - Study has concluded
- `WITHDRAWN` - Withdrawn prior to enrollment

**Valid Phase Values:**
- `EARLY_PHASE1` - Early Phase 1 (formerly Phase 0)
- `PHASE1` - Phase 1
- `PHASE2` - Phase 2
- `PHASE3` - Phase 3
- `PHASE4` - Phase 4
- `NA` - Not Applicable

**Sort Options:**
- `LastUpdatePostDate:asc` / `LastUpdatePostDate:desc` - Sort by last update date
- `EnrollmentCount:asc` / `EnrollmentCount:desc` - Sort by enrollment count
- `StartDate:asc` / `StartDate:desc` - Sort by start date
- `StudyFirstPostDate:asc` / `StudyFirstPostDate:desc` - Sort by first posted date

**Example Request:**
```bash
curl "https://clinicaltrials.gov/api/v2/studies?query.cond=lung+cancer&filter.overallStatus=RECRUITING&pageSize=10&format=json"
```

**Example Response Structure:**
```json
{
  "studies": [
    {
      "protocolSection": { ... },
      "derivedSection": { ... },
      "hasResults": false
    }
  ],
  "totalCount": 1234,
  "pageToken": "next_page_token_here"
}
```

### 2. Get Study Details

**Endpoint:** `GET /api/v2/studies/{NCT_ID}`

Retrieve comprehensive information about a specific clinical trial.

**Path Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `NCT_ID` | string | The unique NCT identifier | `NCT04852770` |

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `format` | string | Response format (`json` or `csv`) | `json` |

**Example Request:**
```bash
curl "https://clinicaltrials.gov/api/v2/studies/NCT04852770?format=json"
```

## Response Data Structure

The API returns study data organized into hierarchical modules. Key sections include:

### protocolSection

Core study information and design:

- **identificationModule** - NCT ID, official title, brief title, organization
- **statusModule** - Overall status, start date, completion date, last update
- **sponsorCollaboratorsModule** - Lead sponsor, collaborators, responsible party
- **descriptionModule** - Brief summary, detailed description
- **conditionsModule** - Conditions being studied
- **designModule** - Study type, phases, enrollment info, design details
- **armsInterventionsModule** - Study arms and interventions
- **outcomesModule** - Primary and secondary outcomes
- **eligibilityModule** - Inclusion/exclusion criteria, age/sex requirements
- **contactsLocationsModule** - Overall contacts, study locations
- **referencesModule** - References, links, citations

### derivedSection

Computed/derived information:

- **miscInfoModule** - Version holder, removed countries
- **conditionBrowseModule** - Condition mesh terms
- **interventionBrowseModule** - Intervention mesh terms

### resultsSection

Study results (when available):

- **participantFlowModule** - Participant flow through study
- **baselineCharacteristicsModule** - Baseline participant characteristics
- **outcomeMeasuresModule** - Outcome measure results
- **adverseEventsModule** - Adverse events data

### hasResults

Boolean indicating if results are available for the study.

## Common Use Cases

### Use Case 1: Find Recruiting Trials for a Condition

Search for trials currently recruiting participants for a specific disease or condition:

```python
import requests

url = "https://clinicaltrials.gov/api/v2/studies"
params = {
    "query.cond": "breast cancer",
    "filter.overallStatus": "RECRUITING",
    "pageSize": 20,
    "sort": "LastUpdatePostDate:desc"
}

response = requests.get(url, params=params)
data = response.json()

print(f"Found {data['totalCount']} recruiting breast cancer trials")
for study in data['studies']:
    nct_id = study['protocolSection']['identificationModule']['nctId']
    title = study['protocolSection']['identificationModule']['briefTitle']
    print(f"{nct_id}: {title}")
```

### Use Case 2: Search by Intervention/Drug

Find trials testing a specific intervention or drug:

```python
params = {
    "query.intr": "Pembrolizumab",
    "filter.phase": "PHASE3",
    "pageSize": 50
}

response = requests.get("https://clinicaltrials.gov/api/v2/studies", params=params)
```

### Use Case 3: Geographic Search

Find trials in a specific location:

```python
params = {
    "query.cond": "diabetes",
    "query.locn": "Boston, Massachusetts",
    "filter.overallStatus": "RECRUITING"
}

response = requests.get("https://clinicaltrials.gov/api/v2/studies", params=params)
```

### Use Case 4: Retrieve Full Study Details

Get comprehensive information about a specific trial:

```python
nct_id = "NCT04852770"
url = f"https://clinicaltrials.gov/api/v2/studies/{nct_id}"

response = requests.get(url)
study = response.json()

# Access specific information
eligibility = study['protocolSection']['eligibilityModule']
contacts = study['protocolSection']['contactsLocationsModule']
```

### Use Case 5: Pagination Through Results

Handle large result sets with pagination:

```python
all_studies = []
page_token = None

while True:
    params = {
        "query.cond": "cancer",
        "pageSize": 1000
    }
    if page_token:
        params['pageToken'] = page_token

    response = requests.get("https://clinicaltrials.gov/api/v2/studies", params=params)
    data = response.json()

    all_studies.extend(data['studies'])

    # Check if there are more pages
    page_token = data.get('pageToken')
    if not page_token:
        break

print(f"Retrieved {len(all_studies)} total studies")
```

### Use Case 6: Export to CSV

Retrieve data in CSV format for analysis:

```python
params = {
    "query.cond": "alzheimer",
    "format": "csv",
    "pageSize": 100
}

response = requests.get("https://clinicaltrials.gov/api/v2/studies", params=params)
csv_data = response.text

# Save to file
with open("alzheimer_trials.csv", "w") as f:
    f.write(csv_data)
```

## Error Handling

### Common HTTP Status Codes

- **200 OK** - Request succeeded
- **400 Bad Request** - Invalid parameters or malformed request
- **404 Not Found** - NCT ID not found
- **429 Too Many Requests** - Rate limit exceeded
- **500 Internal Server Error** - Server error

### Example Error Response

```json
{
  "error": {
    "code": 400,
    "message": "Invalid parameter: filter.overallStatus must be one of: RECRUITING, NOT_YET_RECRUITING, ..."
  }
}
```

### Best Practices for Error Handling

```python
import requests
import time

def search_with_retry(params, max_retries=3):
    for attempt in range(max_retries):
        try:
            response = requests.get(
                "https://clinicaltrials.gov/api/v2/studies",
                params=params,
                timeout=30
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 429:
                # Rate limited - wait and retry
                wait_time = 60  # Wait 1 minute
                print(f"Rate limited. Waiting {wait_time} seconds...")
                time.sleep(wait_time)
            else:
                raise
        except requests.exceptions.RequestException as e:
            if attempt == max_retries - 1:
                raise
            time.sleep(2 ** attempt)  # Exponential backoff

    raise Exception("Max retries exceeded")
```

## Data Standards

### Date Format

All dates use ISO 8601 format with structured objects:

```json
"lastUpdatePostDateStruct": {
  "date": "2024-03-15",
  "type": "ACTUAL"
}
```

### Rich Text

Descriptive text fields use CommonMark Markdown format, allowing for structured formatting:

```json
"briefSummary": "This is a **Phase 2** study evaluating:\n\n- Safety\n- Efficacy\n- Tolerability"
```

### Enumerated Values

Many fields use standardized enumerated values (e.g., study status, phase) rather than free-form text, improving data consistency and query reliability.

## Migration from Classic API

The API v2 replaced the classic API (retired June 2024). Key improvements:

1. **Structured Data** - Enumerated values instead of free text
2. **Modern Standards** - ISO 8601 dates, CommonMark markdown
3. **Better Performance** - Optimized queries and pagination
4. **OpenAPI Spec** - Standard API specification format
5. **Consistent Fields** - Number fields properly typed

For detailed migration guidance, see: https://clinicaltrials.gov/data-api/about-api/api-migration
