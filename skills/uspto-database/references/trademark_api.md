# USPTO Trademark APIs Reference

## Overview

USPTO provides two main APIs for trademark data:

1. **Trademark Status & Document Retrieval (TSDR)** - Retrieve trademark case status and documents
2. **Trademark Assignment Search** - Search trademark assignment records

## 1. Trademark Status & Document Retrieval (TSDR) API

### Overview

TSDR enables programmatic retrieval of trademark case status documents and information.

**API Version:** v1.0

**Base URL:** `https://tsdrapi.uspto.gov/ts/cd/`

### Authentication

Requires API key registration at: https://account.uspto.gov/api-manager/

Include API key in request header:
```
X-Api-Key: YOUR_API_KEY
```

### Endpoints

#### Get Trademark Status by Serial Number

```
GET /ts/cd/casedocs/sn{serial_number}/info.json
```

**Example:**
```bash
curl -H "X-Api-Key: YOUR_KEY" \
  "https://tsdrapi.uspto.gov/ts/cd/casedocs/sn87654321/info.json"
```

#### Get Trademark Status by Registration Number

```
GET /ts/cd/casedocs/rn{registration_number}/info.json
```

### Response Format

Returns JSON with comprehensive trademark information:

```json
{
  "TradeMarkAppln": {
    "ApplicationNumber": "87654321",
    "ApplicationDate": "2017-10-15",
    "RegistrationNumber": "5678901",
    "RegistrationDate": "2019-03-12",
    "MarkVerbalElementText": "EXAMPLE MARK",
    "MarkCurrentStatusExternalDescriptionText": "REGISTERED",
    "MarkCurrentStatusDate": "2019-03-12",
    "GoodsAndServices": [...],
    "Owners": [...],
    "Correspondents": [...]
  }
}
```

### Key Data Fields

- **Application Information:**
  - `ApplicationNumber` - Serial number
  - `ApplicationDate` - Filing date
  - `ApplicationType` - Type (TEAS Plus, TEAS Standard, etc.)

- **Registration Information:**
  - `RegistrationNumber` - Registration number (if registered)
  - `RegistrationDate` - Registration date

- **Mark Information:**
  - `MarkVerbalElementText` - Text of the mark
  - `MarkCurrentStatusExternalDescriptionText` - Current status
  - `MarkCurrentStatusDate` - Status date
  - `MarkDrawingCode` - Type of mark (words, design, etc.)

- **Classification:**
  - `GoodsAndServices` - Array of goods/services with classes

- **Owner Information:**
  - `Owners` - Array of trademark owners/applicants

- **Prosecution History:**
  - `ProsecutionHistoryEntry` - Array of events in prosecution

### Common Status Values

- **REGISTERED** - Mark is registered and active
- **PENDING** - Application under examination
- **ABANDONED** - Application/registration abandoned
- **CANCELLED** - Registration cancelled
- **SUSPENDED** - Examination suspended
- **PUBLISHED FOR OPPOSITION** - Published, in opposition period
- **REGISTERED AND RENEWED** - Registration renewed

### Python Example

```python
import requests

def get_trademark_status(serial_number, api_key):
    """Retrieve trademark status by serial number."""
    url = f"https://tsdrapi.uspto.gov/ts/cd/casedocs/sn{serial_number}/info.json"
    headers = {"X-Api-Key": api_key}

    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"API error: {response.status_code}")

# Usage
data = get_trademark_status("87654321", "YOUR_API_KEY")
trademark = data['TradeMarkAppln']

print(f"Mark: {trademark['MarkVerbalElementText']}")
print(f"Status: {trademark['MarkCurrentStatusExternalDescriptionText']}")
print(f"Application Date: {trademark['ApplicationDate']}")
if 'RegistrationNumber' in trademark:
    print(f"Registration #: {trademark['RegistrationNumber']}")
```

## 2. Trademark Assignment Search API

### Overview

Retrieves trademark assignment records from the USPTO assignment database. Shows ownership transfers and security interests.

**API Version:** v1.4

**Base URL:** `https://assignment-api.uspto.gov/trademark/`

### Authentication

Requires API key in header:
```
X-Api-Key: YOUR_API_KEY
```

### Search Methods

#### By Registration Number

```
GET /v1.4/assignment/application/{registration_number}
```

#### By Serial Number

```
GET /v1.4/assignment/application/{serial_number}
```

#### By Assignee Name

```
POST /v1.4/assignment/search
```

**Request body:**
```json
{
  "criteria": {
    "assigneeName": "Company Name"
  }
}
```

### Response Format

Returns XML containing assignment records:

```xml
<assignments>
  <assignment>
    <reelFrame>12345/0678</reelFrame>
    <conveyanceText>ASSIGNMENT OF ASSIGNORS INTEREST</conveyanceText>
    <recordedDate>2020-01-15</recordedDate>
    <executionDate>2020-01-10</executionDate>
    <assignors>
      <assignor>
        <name>Original Owner LLC</name>
      </assignor>
    </assignors>
    <assignees>
      <assignee>
        <name>New Owner Corporation</name>
      </assignee>
    </assignees>
  </assignment>
</assignments>
```

### Key Fields

- `reelFrame` - USPTO reel and frame number
- `conveyanceText` - Type of transaction
- `recordedDate` - Date recorded at USPTO
- `executionDate` - Date document was executed
- `assignors` - Original owners
- `assignees` - New owners
- `propertyNumbers` - Affected serial/registration numbers

### Common Conveyance Types

- **ASSIGNMENT OF ASSIGNORS INTEREST** - Ownership transfer
- **SECURITY AGREEMENT** - Collateral/security interest
- **MERGER** - Corporate merger
- **CHANGE OF NAME** - Name change
- **ASSIGNMENT OF PARTIAL INTEREST** - Partial ownership transfer

### Python Example

```python
import requests
import xml.etree.ElementTree as ET

def search_trademark_assignments(registration_number, api_key):
    """Search assignments for a trademark registration."""
    url = f"https://assignment-api.uspto.gov/trademark/v1.4/assignment/application/{registration_number}"
    headers = {"X-Api-Key": api_key}

    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.text  # Returns XML
    else:
        raise Exception(f"API error: {response.status_code}")

# Usage
xml_data = search_trademark_assignments("5678901", "YOUR_API_KEY")
root = ET.fromstring(xml_data)

for assignment in root.findall('.//assignment'):
    reel_frame = assignment.find('reelFrame').text
    recorded_date = assignment.find('recordedDate').text
    conveyance = assignment.find('conveyanceText').text

    assignor = assignment.find('.//assignor/name').text
    assignee = assignment.find('.//assignee/name').text

    print(f"{recorded_date}: {assignor} -> {assignee}")
    print(f"  Type: {conveyance}")
    print(f"  Reel/Frame: {reel_frame}\n")
```

## Use Cases

### 1. Monitor Trademark Status

Check status of pending applications or registrations:

```python
def check_trademark_health(serial_number, api_key):
    """Check if trademark needs attention."""
    data = get_trademark_status(serial_number, api_key)
    tm = data['TradeMarkAppln']

    status = tm['MarkCurrentStatusExternalDescriptionText']
    alerts = []

    if 'ABANDON' in status:
        alerts.append("⚠️ ABANDONED")
    elif 'PUBLISHED' in status:
        alerts.append("📢 In opposition period")
    elif 'SUSPENDED' in status:
        alerts.append("⏸️ Examination suspended")
    elif 'REGISTERED' in status:
        alerts.append("✅ Active")

    return alerts
```

### 2. Track Ownership Changes

Monitor assignment records for ownership changes:

```python
def get_current_owner(registration_number, api_key):
    """Find current trademark owner from assignment records."""
    xml_data = search_trademark_assignments(registration_number, api_key)
    root = ET.fromstring(xml_data)

    assignments = []
    for assignment in root.findall('.//assignment'):
        date = assignment.find('recordedDate').text
        assignee = assignment.find('.//assignee/name').text
        assignments.append((date, assignee))

    # Most recent assignment
    if assignments:
        assignments.sort(reverse=True)
        return assignments[0][1]
    return None
```

### 3. Portfolio Management

Analyze trademark portfolio:

```python
def analyze_portfolio(serial_numbers, api_key):
    """Analyze status of multiple trademarks."""
    results = {
        'active': 0,
        'pending': 0,
        'abandoned': 0,
        'expired': 0
    }

    for sn in serial_numbers:
        data = get_trademark_status(sn, api_key)
        status = data['TradeMarkAppln']['MarkCurrentStatusExternalDescriptionText']

        if 'REGISTERED' in status:
            results['active'] += 1
        elif 'PENDING' in status or 'PUBLISHED' in status:
            results['pending'] += 1
        elif 'ABANDON' in status:
            results['abandoned'] += 1
        elif 'EXPIRED' in status or 'CANCELLED' in status:
            results['expired'] += 1

    return results
```

## Rate Limits and Best Practices

1. **Respect rate limits** - Implement retry logic with exponential backoff
2. **Cache responses** - Trademark data changes infrequently
3. **Batch processing** - Spread requests over time for large portfolios
4. **Error handling** - Handle missing data gracefully (not all marks have all fields)
5. **Data validation** - Verify serial/registration numbers before API calls

## Integration with Other Data

Combine trademark data with other sources:

- **TSDR + Assignment** - Current status + ownership history
- **Multiple marks** - Analyze related marks in a family
- **Patent data** - Cross-reference IP portfolio

## Resources

- **TSDR API**: https://developer.uspto.gov/api-catalog/tsdr-data-api
- **Assignment API**: https://developer.uspto.gov/api-catalog/trademark-assignment-search-data-api
- **API Key Registration**: https://account.uspto.gov/api-manager/
- **Trademark Search**: https://tmsearch.uspto.gov/
- **Swagger Documentation**: https://developer.uspto.gov/swagger/tsdr-api-v1
