---
name: clinicaltrials-database
description: Query ClinicalTrials.gov via API v2. Search trials by condition, drug, location, status, or phase. Retrieve trial details by NCT ID, export data, for clinical research and patient matching.
license: Unknown
metadata:
    skill-author: K-Dense Inc.
---

# ClinicalTrials.gov Database

## Overview

ClinicalTrials.gov is a comprehensive registry of clinical studies conducted worldwide, maintained by the U.S. National Library of Medicine. Access API v2 to search for trials, retrieve detailed study information, filter by various criteria, and export data for analysis. The API is public (no authentication required) with rate limits of ~50 requests per minute, supporting JSON and CSV formats.

## When to Use This Skill

This skill should be used when working with clinical trial data in scenarios such as:

- **Patient matching** - Finding recruiting trials for specific conditions or patient populations
- **Research analysis** - Analyzing clinical trial trends, outcomes, or study designs
- **Drug/intervention research** - Identifying trials testing specific drugs or interventions
- **Geographic searches** - Locating trials in specific locations or regions
- **Sponsor/organization tracking** - Finding trials conducted by specific institutions
- **Data export** - Extracting clinical trial data for further analysis or reporting
- **Trial monitoring** - Tracking status updates or results for specific trials
- **Eligibility screening** - Reviewing inclusion/exclusion criteria for trials

## Quick Start

### Basic Search Query

Search for clinical trials using the helper script:

```bash
cd scientific-databases/clinicaltrials-database/scripts
python3 query_clinicaltrials.py
```

Or use Python directly with the `requests` library:

```python
import requests

url = "https://clinicaltrials.gov/api/v2/studies"
params = {
    "query.cond": "breast cancer",
    "filter.overallStatus": "RECRUITING",
    "pageSize": 10
}

response = requests.get(url, params=params)
data = response.json()

print(f"Found {data['totalCount']} trials")
```

### Retrieve Specific Trial

Get detailed information about a trial using its NCT ID:

```python
import requests

nct_id = "NCT04852770"
url = f"https://clinicaltrials.gov/api/v2/studies/{nct_id}"

response = requests.get(url)
study = response.json()

# Access specific modules
title = study['protocolSection']['identificationModule']['briefTitle']
status = study['protocolSection']['statusModule']['overallStatus']
```

## Core Capabilities

### 1. Search by Condition/Disease

Find trials studying specific medical conditions or diseases using the `query.cond` parameter.

**Example: Find recruiting diabetes trials**

```python
from scripts.query_clinicaltrials import search_studies

results = search_studies(
    condition="type 2 diabetes",
    status="RECRUITING",
    page_size=20,
    sort="LastUpdatePostDate:desc"
)

print(f"Found {results['totalCount']} recruiting diabetes trials")
for study in results['studies']:
    protocol = study['protocolSection']
    nct_id = protocol['identificationModule']['nctId']
    title = protocol['identificationModule']['briefTitle']
    print(f"{nct_id}: {title}")
```

**Common use cases:**
- Finding trials for rare diseases
- Identifying trials for comorbid conditions
- Tracking trial availability for specific diagnoses

### 2. Search by Intervention/Drug

Search for trials testing specific interventions, drugs, devices, or procedures using the `query.intr` parameter.

**Example: Find Phase 3 trials testing Pembrolizumab**

```python
from scripts.query_clinicaltrials import search_studies

results = search_studies(
    intervention="Pembrolizumab",
    status=["RECRUITING", "ACTIVE_NOT_RECRUITING"],
    page_size=50
)

# Filter by phase in results
phase3_trials = [
    study for study in results['studies']
    if 'PHASE3' in study['protocolSection'].get('designModule', {}).get('phases', [])
]
```

**Common use cases:**
- Drug development tracking
- Competitive intelligence for pharmaceutical companies
- Treatment option research for clinicians

### 3. Geographic Search

Find trials in specific locations using the `query.locn` parameter.

**Example: Find cancer trials in New York**

```python
from scripts.query_clinicaltrials import search_studies

results = search_studies(
    condition="cancer",
    location="New York",
    status="RECRUITING",
    page_size=100
)

# Extract location details
for study in results['studies']:
    locations_module = study['protocolSection'].get('contactsLocationsModule', {})
    locations = locations_module.get('locations', [])
    for loc in locations:
        if 'New York' in loc.get('city', ''):
            print(f"{loc['facility']}: {loc['city']}, {loc.get('state', '')}")
```

**Common use cases:**
- Patient referrals to local trials
- Geographic trial distribution analysis
- Site selection for new trials

### 4. Search by Sponsor/Organization

Find trials conducted by specific organizations using the `query.spons` parameter.

**Example: Find trials sponsored by NCI**

```python
from scripts.query_clinicaltrials import search_studies

results = search_studies(
    sponsor="National Cancer Institute",
    page_size=100
)

# Extract sponsor information
for study in results['studies']:
    sponsor_module = study['protocolSection']['sponsorCollaboratorsModule']
    lead_sponsor = sponsor_module['leadSponsor']['name']
    collaborators = sponsor_module.get('collaborators', [])
    print(f"Lead: {lead_sponsor}")
    if collaborators:
        print(f"  Collaborators: {', '.join([c['name'] for c in collaborators])}")
```

**Common use cases:**
- Tracking institutional research portfolios
- Analyzing funding organization priorities
- Identifying collaboration opportunities

### 5. Filter by Study Status

Filter trials by recruitment or completion status using the `filter.overallStatus` parameter.

**Valid status values:**
- `RECRUITING` - Currently recruiting participants
- `NOT_YET_RECRUITING` - Not yet open for recruitment
- `ENROLLING_BY_INVITATION` - Only enrolling by invitation
- `ACTIVE_NOT_RECRUITING` - Active but no longer recruiting
- `SUSPENDED` - Temporarily halted
- `TERMINATED` - Stopped prematurely
- `COMPLETED` - Study has concluded
- `WITHDRAWN` - Withdrawn prior to enrollment

**Example: Find recently completed trials with results**

```python
from scripts.query_clinicaltrials import search_studies

results = search_studies(
    condition="alzheimer disease",
    status="COMPLETED",
    sort="LastUpdatePostDate:desc",
    page_size=50
)

# Filter for trials with results
trials_with_results = [
    study for study in results['studies']
    if study.get('hasResults', False)
]

print(f"Found {len(trials_with_results)} completed trials with results")
```

### 6. Retrieve Detailed Study Information

Get comprehensive information about specific trials including eligibility criteria, outcomes, contacts, and locations.

**Example: Extract eligibility criteria**

```python
from scripts.query_clinicaltrials import get_study_details

study = get_study_details("NCT04852770")
eligibility = study['protocolSection']['eligibilityModule']

print(f"Eligible Ages: {eligibility.get('minimumAge')} - {eligibility.get('maximumAge')}")
print(f"Eligible Sex: {eligibility.get('sex')}")
print(f"\nInclusion Criteria:")
print(eligibility.get('eligibilityCriteria'))
```

**Example: Extract contact information**

```python
from scripts.query_clinicaltrials import get_study_details

study = get_study_details("NCT04852770")
contacts_module = study['protocolSection']['contactsLocationsModule']

# Overall contacts
if 'centralContacts' in contacts_module:
    for contact in contacts_module['centralContacts']:
        print(f"Contact: {contact.get('name')}")
        print(f"Phone: {contact.get('phone')}")
        print(f"Email: {contact.get('email')}")

# Study locations
if 'locations' in contacts_module:
    for location in contacts_module['locations']:
        print(f"\nFacility: {location.get('facility')}")
        print(f"City: {location.get('city')}, {location.get('state')}")
        if location.get('status'):
            print(f"Status: {location['status']}")
```

### 7. Pagination and Bulk Data Retrieval

Handle large result sets efficiently using pagination.

**Example: Retrieve all matching trials**

```python
from scripts.query_clinicaltrials import search_with_all_results

# Get all trials (automatically handles pagination)
all_trials = search_with_all_results(
    condition="rare disease",
    status="RECRUITING"
)

print(f"Retrieved {len(all_trials)} total trials")
```

**Example: Manual pagination with control**

```python
from scripts.query_clinicaltrials import search_studies

all_studies = []
page_token = None
max_pages = 10  # Limit to avoid excessive requests

for page in range(max_pages):
    results = search_studies(
        condition="cancer",
        page_size=1000,  # Max page size
        page_token=page_token
    )

    all_studies.extend(results['studies'])

    # Check for next page
    page_token = results.get('pageToken')
    if not page_token:
        break

print(f"Retrieved {len(all_studies)} studies across {page + 1} pages")
```

### 8. Data Export to CSV

Export trial data to CSV format for analysis in spreadsheet software or data analysis tools.

**Example: Export to CSV file**

```python
from scripts.query_clinicaltrials import search_studies

# Request CSV format
results = search_studies(
    condition="heart disease",
    status="RECRUITING",
    format="csv",
    page_size=1000
)

# Save to file
with open("heart_disease_trials.csv", "w") as f:
    f.write(results)

print("Data exported to heart_disease_trials.csv")
```

**Note:** CSV format returns a string instead of JSON dictionary.

### 9. Extract and Summarize Study Information

Extract key information for quick overview or reporting.

**Example: Create trial summary**

```python
from scripts.query_clinicaltrials import get_study_details, extract_study_summary

# Get details and extract summary
study = get_study_details("NCT04852770")
summary = extract_study_summary(study)

print(f"NCT ID: {summary['nct_id']}")
print(f"Title: {summary['title']}")
print(f"Status: {summary['status']}")
print(f"Phase: {', '.join(summary['phase'])}")
print(f"Enrollment: {summary['enrollment']}")
print(f"Last Update: {summary['last_update']}")
print(f"\nBrief Summary:\n{summary['brief_summary']}")
```

### 10. Combined Query Strategies

Combine multiple filters for targeted searches.

**Example: Multi-criteria search**

```python
from scripts.query_clinicaltrials import search_studies

# Find Phase 2/3 immunotherapy trials for lung cancer in California
results = search_studies(
    condition="lung cancer",
    intervention="immunotherapy",
    location="California",
    status=["RECRUITING", "NOT_YET_RECRUITING"],
    page_size=100
)

# Further filter by phase
phase2_3_trials = [
    study for study in results['studies']
    if any(phase in ['PHASE2', 'PHASE3']
           for phase in study['protocolSection'].get('designModule', {}).get('phases', []))
]

print(f"Found {len(phase2_3_trials)} Phase 2/3 immunotherapy trials")
```

## Resources

### scripts/query_clinicaltrials.py

Comprehensive Python script providing helper functions for common query patterns:

- `search_studies()` - Search for trials with various filters
- `get_study_details()` - Retrieve full information for a specific trial
- `search_with_all_results()` - Automatically paginate through all results
- `extract_study_summary()` - Extract key information for quick overview

Run the script directly for example usage:

```bash
python3 scripts/query_clinicaltrials.py
```

### references/api_reference.md

Detailed API documentation including:

- Complete endpoint specifications
- All query parameters and valid values
- Response data structure and modules
- Common use cases with code examples
- Error handling and best practices
- Data standards (ISO 8601 dates, CommonMark markdown)

Load this reference when working with unfamiliar API features or troubleshooting issues.

## Best Practices

### Rate Limit Management

The API has a rate limit of approximately 50 requests per minute. For bulk data retrieval:

1. Use maximum page size (1000) to minimize requests
2. Implement exponential backoff on rate limit errors (429 status)
3. Add delays between requests for large-scale data collection

```python
import time
import requests

def search_with_rate_limit(params):
    try:
        response = requests.get("https://clinicaltrials.gov/api/v2/studies", params=params)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 429:
            print("Rate limited. Waiting 60 seconds...")
            time.sleep(60)
            return search_with_rate_limit(params)  # Retry
        raise
```

### Data Structure Navigation

The API response has a nested structure. Key paths to common information:

- **NCT ID**: `study['protocolSection']['identificationModule']['nctId']`
- **Title**: `study['protocolSection']['identificationModule']['briefTitle']`
- **Status**: `study['protocolSection']['statusModule']['overallStatus']`
- **Phase**: `study['protocolSection']['designModule']['phases']`
- **Eligibility**: `study['protocolSection']['eligibilityModule']`
- **Locations**: `study['protocolSection']['contactsLocationsModule']['locations']`
- **Interventions**: `study['protocolSection']['armsInterventionsModule']['interventions']`

### Error Handling

Always implement proper error handling for network requests:

```python
import requests

try:
    response = requests.get(url, params=params, timeout=30)
    response.raise_for_status()
    data = response.json()
except requests.exceptions.HTTPError as e:
    print(f"HTTP error: {e.response.status_code}")
except requests.exceptions.RequestException as e:
    print(f"Request failed: {e}")
except ValueError as e:
    print(f"JSON decode error: {e}")
```

### Handling Missing Data

Not all trials have complete information. Always check for field existence:

```python
# Safe navigation with .get()
phases = study['protocolSection'].get('designModule', {}).get('phases', [])
enrollment = study['protocolSection'].get('designModule', {}).get('enrollmentInfo', {}).get('count', 'N/A')

# Check before accessing
if 'resultsSection' in study:
    # Process results
    pass
```

## Technical Specifications

- **Base URL**: `https://clinicaltrials.gov/api/v2`
- **Authentication**: Not required (public API)
- **Rate Limit**: ~50 requests/minute per IP
- **Response Formats**: JSON (default), CSV
- **Max Page Size**: 1000 studies per request
- **Date Format**: ISO 8601
- **Text Format**: CommonMark Markdown for rich text fields
- **API Version**: 2.0 (released March 2024)
- **API Specification**: OpenAPI 3.0

For complete technical details, see `references/api_reference.md`.

