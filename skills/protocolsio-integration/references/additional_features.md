# Additional Features

## Overview

This document covers additional protocols.io API features including user profiles, recently published protocols, experiment records, and notifications.

## Base URL

All endpoints use the base URL: `https://protocols.io/api/v3`

## User Profile Management

### Get User Profile

Retrieve the authenticated user's profile information.

**Endpoint:** `GET /profile`

**Response includes:**
- User ID and username
- Full name
- Email address
- Affiliation/institution
- Bio and description
- Profile image URL
- Account creation date
- Protocol count and statistics

**Example Request:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://protocols.io/api/v3/profile"
```

### Update User Profile

Update profile information.

**Endpoint:** `PATCH /profile`

**Request Body:**
- `first_name`: First name
- `last_name`: Last name
- `email`: Email address
- `affiliation`: Institution or organization
- `bio`: Profile bio/description
- `location`: Geographic location
- `website`: Personal or lab website URL
- `twitter`: Twitter handle
- `orcid`: ORCID identifier

**Example Request:**
```bash
curl -X PATCH \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "affiliation": "University of Example, Department of Biology",
    "bio": "Researcher specializing in CRISPR gene editing and molecular biology",
    "orcid": "0000-0001-2345-6789"
  }' \
  "https://protocols.io/api/v3/profile"
```

### Upload Profile Image

Update profile picture.

**Endpoint:** `POST /profile/image`

**Request Format**: `multipart/form-data`

**Form Parameters:**
- `image` (required): Image file (JPEG, PNG)

**Recommended specifications:**
- Minimum size: 200x200 pixels
- Aspect ratio: Square (1:1)
- Format: JPEG or PNG
- Max file size: 5 MB

## Recently Published Protocols

### Query Published Protocols

Discover recently published public protocols.

**Endpoint:** `GET /publications`

**Query Parameters:**
- `key`: Search keywords
- `category`: Filter by category
  - Example categories: `molecular-biology`, `cell-biology`, `biochemistry`, etc.
- `date_from`: Start date (ISO 8601 format: YYYY-MM-DD)
- `date_to`: End date
- `order_field`: Sort field (`published_on`, `title`, `views`)
- `order_dir`: Sort direction (`desc`, `asc`)
- `page_size`: Number of results per page (default: 10, max: 50)
- `page_id`: Page number for pagination

**Example Request:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://protocols.io/api/v3/publications?category=molecular-biology&date_from=2025-01-01&order_field=published_on&order_dir=desc"
```

**Use Cases:**
- Discover trending protocols
- Monitor new publications in your field
- Find recently published protocols for specific techniques
- Track citation-worthy protocols

## Experiment Records

### Overview

Experiment records allow users to document individual runs or executions of a protocol, tracking what worked, what didn't, and any modifications made.

### Create Experiment Record

Document an execution of a protocol.

**Endpoint:** `POST /protocols/{protocol_id}/runs`

**Path Parameters:**
- `protocol_id`: The protocol's unique identifier

**Request Body:**
- `title` (required): Experiment run title
- `date`: Date of experiment execution (ISO 8601 format)
- `status`: Experiment outcome
  - `success`: Experiment succeeded
  - `partial`: Partially successful
  - `failed`: Experiment failed
- `notes`: Detailed notes about the experiment run
- `modifications`: Protocol modifications or deviations
- `results`: Summary of results
- `attachments`: File IDs for data files or images

**Example Request:**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "CRISPR Editing - HEK293 Cells - Trial 3",
    "date": "2025-10-20",
    "status": "success",
    "notes": "Successfully achieved 87% editing efficiency. Increased sgRNA concentration from 100nM to 150nM based on previous trials.",
    "modifications": "Extended incubation time in step 3 from 30 min to 45 min",
    "results": "Flow cytometry confirmed 87% GFP+ cells after 72h. Western blot showed complete knockout in positive population."
  }' \
  "https://protocols.io/api/v3/protocols/12345/runs"
```

### List Experiment Records

Retrieve all experiment records for a protocol.

**Endpoint:** `GET /protocols/{protocol_id}/runs`

**Query Parameters:**
- `status`: Filter by outcome (`success`, `partial`, `failed`)
- `date_from`: Start date
- `date_to`: End date
- `page_size`: Number of results per page
- `page_id`: Page number for pagination

### Update Experiment Record

**Endpoint:** `PATCH /protocols/{protocol_id}/runs/{run_id}`

**Request Body**: Same parameters as create, all optional

### Delete Experiment Record

**Endpoint:** `DELETE /protocols/{protocol_id}/runs/{run_id}`

**Use Cases:**
- Track reproducibility across multiple experiments
- Document troubleshooting and optimization
- Share successful modifications with collaborators
- Build institutional knowledge base
- Support lab notebook requirements

## Notifications

### Get User Notifications

Retrieve notifications for the authenticated user.

**Endpoint:** `GET /notifications`

**Query Parameters:**
- `type`: Filter by notification type
  - `comment`: New comments on your protocols
  - `mention`: You were mentioned in a comment
  - `protocol_update`: Protocol you follow was updated
  - `workspace`: Workspace activity
  - `publication`: Protocol was published
- `read`: Filter by read status
  - `true`: Only read notifications
  - `false`: Only unread notifications
  - Omit for all notifications
- `page_size`: Number of results per page (default: 20, max: 100)
- `page_id`: Page number for pagination

**Response includes:**
- Notification ID and type
- Message/description
- Related protocol/comment/workspace
- Timestamp
- Read status

**Example Request:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://protocols.io/api/v3/notifications?read=false&type=comment"
```

### Mark Notification as Read

**Endpoint:** `PATCH /notifications/{notification_id}`

**Request Body:**
- `read`: Set to `true`

### Mark All Notifications as Read

**Endpoint:** `POST /notifications/mark-all-read`

### Delete Notification

**Endpoint:** `DELETE /notifications/{notification_id}`

## Organization Management

### Export Organization Data

Export all protocols and workspace data from an organization.

**Endpoint:** `GET /organizations/{organization_id}/export`

**Path Parameters:**
- `organization_id`: The organization's unique identifier

**Query Parameters:**
- `format`: Export format
  - `json`: JSON format with full metadata
  - `csv`: CSV format for spreadsheet import
  - `xml`: XML format
- `include_files`: Include associated files (`true`/`false`)
- `include_comments`: Include discussions (`true`/`false`)

**Response**: Download URL for export package

**Use Cases:**
- Institutional archival
- Compliance and audit requirements
- Migration to other systems
- Backup and disaster recovery
- Data analysis and reporting

**Example Request:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://protocols.io/api/v3/organizations/12345/export?format=json&include_files=true&include_comments=true"
```

## Common Integration Patterns

### 1. Protocol Discovery and Import

Build a protocol discovery workflow:

```python
# Search for relevant protocols
response = requests.get(
    'https://protocols.io/api/v3/publications',
    headers={'Authorization': f'Bearer {token}'},
    params={'key': 'CRISPR', 'category': 'molecular-biology'}
)

# For each interesting protocol
for protocol in response.json()['items']:
    # Get full details
    details = requests.get(
        f'https://protocols.io/api/v3/protocols/{protocol["id"]}',
        headers={'Authorization': f'Bearer {token}'}
    )
    # Import to local system
    import_protocol(details.json())
```

### 2. Experiment Tracking

Track all protocol executions:

1. Execute protocol in lab
2. Document execution: `POST /protocols/{id}/runs`
3. Upload result files to workspace
4. Link files in experiment record
5. Analyze success rates across runs

### 3. Notification System Integration

Build custom notification system:

1. Poll for new notifications: `GET /notifications?read=false`
2. Process each notification type
3. Send to internal communication system
4. Mark as read: `PATCH /notifications/{id}`

### 4. Profile Synchronization

Keep profiles synchronized across systems:

1. Retrieve profile: `GET /profile`
2. Compare with internal system
3. Update discrepancies
4. Sync profile images and metadata

## API Response Formats

### Standard Response Structure

Most API responses follow this structure:

```json
{
  "status_code": 0,
  "status_message": "Success",
  "item": { /* single item data */ },
  "items": [ /* array of items */ ],
  "pagination": {
    "current_page": 0,
    "total_pages": 5,
    "page_size": 10,
    "total_items": 42
  }
}
```

### Error Response Structure

```json
{
  "status_code": 400,
  "status_message": "Bad Request",
  "error_message": "Missing required parameter: title",
  "error_details": {
    "field": "title",
    "issue": "required"
  }
}
```

## Best Practices

1. **Profile Completeness**
   - Complete all profile fields
   - Add ORCID for research attribution
   - Keep affiliation current

2. **Experiment Documentation**
   - Document all protocol executions
   - Include both successes and failures
   - Note all modifications
   - Attach relevant data files

3. **Notification Management**
   - Review notifications regularly
   - Enable relevant notification types
   - Disable notification types you don't need
   - Respond to comments promptly

4. **Publication Discovery**
   - Set up regular searches for your research area
   - Follow prolific authors in your field
   - Bookmark useful protocols
   - Cite protocols in publications

5. **Data Export**
   - Export organization data regularly
   - Test restore procedures
   - Store exports securely
   - Document export procedures
