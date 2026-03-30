# Patent Examination Data System (PEDS) API Reference

## Overview

The Patent Examination Data System (PEDS) provides access to USPTO patent application and filing status records. It contains bibliographic data, published document information, and patent term extension data.

**Data Coverage:** 1981 to present (some data back to 1935)

**Base URL:** Access through USPTO Open Data Portal

## What PEDS Provides

PEDS gives comprehensive transaction history and status information for patent applications:

- **Bibliographic data** - Application numbers, filing dates, titles, inventors, assignees
- **Published documents** - Publication numbers and dates
- **Transaction history** - All examination events with dates, codes, and descriptions
- **Patent term adjustments** - PTA/PTE information
- **Application status** - Current status and status codes
- **File wrapper access** - Links to prosecution documents

## Key Features

1. **Transaction Activity** - Complete examination timeline with transaction dates, codes, and descriptions
2. **Status Information** - Current application status and status codes
3. **Bibliographic Updates** - Changes to inventors, assignees, titles over time
4. **Family Data** - Related applications and continuity data
5. **Office Action Tracking** - Mail dates and office action information

## Python Library: uspto-opendata-python

The recommended way to access PEDS is through the `uspto-opendata-python` library.

### Installation

```bash
pip install uspto-opendata-python
```

### Basic Usage

```python
from uspto.peds import PE DSClient

# Initialize client
client = PEDSClient()

# Search by application number
app_number = "16123456"
result = client.get_application(app_number)

# Access application data
print(f"Title: {result['title']}")
print(f"Filing Date: {result['filing_date']}")
print(f"Status: {result['status']}")

# Get transaction history
transactions = result['transactions']
for trans in transactions:
    print(f"{trans['date']}: {trans['code']} - {trans['description']}")
```

### Search Methods

```python
# By application number
client.get_application("16123456")

# By patent number
client.get_patent("11234567")

# By customer number (assignee)
client.search_by_customer_number("12345")

# Bulk retrieval
app_numbers = ["16123456", "16123457", "16123458"]
results = client.bulk_retrieve(app_numbers)
```

## Data Fields

### Bibliographic Fields

- `application_number` - Application number
- `filing_date` - Filing date
- `patent_number` - Patent number (if granted)
- `patent_issue_date` - Issue date (if granted)
- `title` - Application/patent title
- `inventors` - List of inventors
- `assignees` - List of assignees
- `app_type` - Application type (utility, design, plant, reissue)
- `app_status` - Current application status
- `app_status_date` - Status date

### Transaction Fields

- `transaction_date` - Date of transaction
- `transaction_code` - USPTO event code
- `transaction_description` - Description of event
- `mail_date` - Mail room date (for office actions)

### Patent Term Data

- `pta_pte_summary` - Patent term adjustment/extension summary
- `pta_pte_history` - History of term calculations

## Status Codes

Common application status codes:

- **Patented Case** - Patent has been granted
- **Abandoned** - Application is abandoned
- **Pending** - Application is under examination
- **Allowed** - Application has been allowed, awaiting issue
- **Final Rejection** - Final rejection issued
- **Non-Final Rejection** - Non-final rejection issued
- **Response Filed** - Applicant response filed

## Transaction Codes

Common transaction codes include:

- **CTNF** - Non-final rejection mailed
- **CTFR** - Final rejection mailed
- **AOPF** - Office action mailed
- **WRIT** - Response filed
- **NOA** - Notice of allowance mailed
- **ISS.FEE** - Issue fee payment
- **ABND** - Application abandoned

Full code list available in OCE Patent Examination Status/Event Codes API.

## Use Cases

### 1. Track Application Progress

Monitor pending applications for office actions and status changes.

```python
# Get current status
app = client.get_application("16123456")
print(f"Current status: {app['app_status']}")
print(f"Status date: {app['app_status_date']}")

# Check for recent office actions
recent_oas = [t for t in app['transactions']
              if t['code'] in ['CTNF', 'CTFR', 'AOPF']
              and t['date'] > '2024-01-01']
```

### 2. Portfolio Analysis

Analyze prosecution history across a portfolio.

```python
# Get all applications for an assignee
apps = client.search_by_customer_number("12345")

# Calculate average pendency
pendencies = []
for app in apps:
    if app['patent_issue_date']:
        filing = datetime.strptime(app['filing_date'], '%Y-%m-%d')
        issue = datetime.strptime(app['patent_issue_date'], '%Y-%m-%d')
        pendencies.append((issue - filing).days)

avg_pendency = sum(pendencies) / len(pendencies)
print(f"Average pendency: {avg_pendency} days")
```

### 3. Examine Rejection Patterns

Analyze types of rejections received.

```python
# Count rejection types
rejections = {}
for trans in app['transactions']:
    if 'rejection' in trans['description'].lower():
        code = trans['code']
        rejections[code] = rejections.get(code, 0) + 1
```

## Integration with Other APIs

PEDS data can be combined with other USPTO APIs:

- **Office Action Text API** - Retrieve full text of office actions using application number
- **Patent Assignment Search** - Find ownership changes
- **PTAB API** - Check for appeal proceedings

## Important Notes

1. **PAIR Bulk Data (PBD) is decommissioned** - Use PEDS instead
2. **Data updates** - PEDS is updated regularly but may have 1-2 day lag
3. **Application numbers** - Use standardized format (no slashes or spaces)
4. **Continuity data** - Parent/child applications tracked in transaction history

## Best Practices

1. **Batch requests** - Use bulk retrieval for multiple applications
2. **Cache data** - Avoid redundant API calls for same application
3. **Monitor updates** - Check for transaction updates regularly
4. **Handle missing data** - Not all fields populated for all applications
5. **Parse transaction codes** - Use code descriptions for user-friendly display

## Resources

- **Library Documentation**: https://docs.ip-tools.org/uspto-opendata-python/
- **PyPI Package**: https://pypi.org/project/uspto-opendata-python/
- **GitHub Repository**: https://github.com/ip-tools/uspto-opendata-python
- **USPTO PEDS Portal**: https://ped.uspto.gov/
