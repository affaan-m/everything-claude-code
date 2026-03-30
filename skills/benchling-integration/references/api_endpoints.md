# Benchling REST API Endpoints Reference

## Base URL

All API requests use the base URL format:
```
https://{tenant}.benchling.com/api/v2
```

Replace `{tenant}` with your Benchling tenant name.

## API Versioning

Current API version: `v2` (2025-10-07)

The API version is specified in the URL path. Benchling maintains backward compatibility within a major version.

## Authentication

All requests require authentication via HTTP headers:

**API Key (Basic Auth):**
```bash
curl -X GET \
  https://your-tenant.benchling.com/api/v2/dna-sequences \
  -u "your_api_key:"
```

**OAuth Bearer Token:**
```bash
curl -X GET \
  https://your-tenant.benchling.com/api/v2/dna-sequences \
  -H "Authorization: Bearer your_access_token"
```

## Common Headers

```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

## Response Format

All responses follow a consistent JSON structure:

**Single Resource:**
```json
{
  "id": "seq_abc123",
  "name": "My Sequence",
  "bases": "ATCGATCG",
  ...
}
```

**List Response:**
```json
{
  "results": [
    {"id": "seq_1", "name": "Sequence 1"},
    {"id": "seq_2", "name": "Sequence 2"}
  ],
  "nextToken": "token_for_next_page"
}
```

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `pageSize`: Number of items per page (default: 50, max: 100)
- `nextToken`: Token from previous response for next page

**Example:**
```bash
curl -X GET \
  "https://your-tenant.benchling.com/api/v2/dna-sequences?pageSize=50&nextToken=abc123"
```

## Error Responses

**Format:**
```json
{
  "error": {
    "type": "NotFoundError",
    "message": "DNA sequence not found",
    "userMessage": "The requested sequence does not exist or you don't have access"
  }
}
```

**Common Status Codes:**
- `200 OK`: Success
- `201 Created`: Resource created
- `400 Bad Request`: Invalid parameters
- `401 Unauthorized`: Missing or invalid credentials
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource doesn't exist
- `422 Unprocessable Entity`: Validation error
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## Core Endpoints

### DNA Sequences

**List DNA Sequences:**
```http
GET /api/v2/dna-sequences

Query Parameters:
- pageSize: integer (default: 50, max: 100)
- nextToken: string
- folderId: string
- schemaId: string
- name: string (filter by name)
- modifiedAt: string (ISO 8601 date)
```

**Get DNA Sequence:**
```http
GET /api/v2/dna-sequences/{sequenceId}
```

**Create DNA Sequence:**
```http
POST /api/v2/dna-sequences

Body:
{
  "name": "My Plasmid",
  "bases": "ATCGATCG",
  "isCircular": true,
  "folderId": "fld_abc123",
  "schemaId": "ts_abc123",
  "fields": {
    "gene_name": {"value": "GFP"},
    "resistance": {"value": "Kanamycin"}
  },
  "entityRegistryId": "src_abc123",  // optional for registration
  "namingStrategy": "NEW_IDS"        // optional for registration
}
```

**Update DNA Sequence:**
```http
PATCH /api/v2/dna-sequences/{sequenceId}

Body:
{
  "name": "Updated Plasmid",
  "fields": {
    "gene_name": {"value": "mCherry"}
  }
}
```

**Archive DNA Sequence:**
```http
POST /api/v2/dna-sequences:archive

Body:
{
  "dnaSequenceIds": ["seq_abc123"],
  "reason": "Deprecated construct"
}
```

### RNA Sequences

**List RNA Sequences:**
```http
GET /api/v2/rna-sequences
```

**Get RNA Sequence:**
```http
GET /api/v2/rna-sequences/{sequenceId}
```

**Create RNA Sequence:**
```http
POST /api/v2/rna-sequences

Body:
{
  "name": "gRNA-001",
  "bases": "AUCGAUCG",
  "folderId": "fld_abc123",
  "fields": {
    "target_gene": {"value": "TP53"}
  }
}
```

**Update RNA Sequence:**
```http
PATCH /api/v2/rna-sequences/{sequenceId}
```

**Archive RNA Sequence:**
```http
POST /api/v2/rna-sequences:archive
```

### Amino Acid (Protein) Sequences

**List AA Sequences:**
```http
GET /api/v2/aa-sequences
```

**Get AA Sequence:**
```http
GET /api/v2/aa-sequences/{sequenceId}
```

**Create AA Sequence:**
```http
POST /api/v2/aa-sequences

Body:
{
  "name": "GFP Protein",
  "aminoAcids": "MSKGEELFTGVVPILVELDGDVNGHKF",
  "folderId": "fld_abc123"
}
```

### Custom Entities

**List Custom Entities:**
```http
GET /api/v2/custom-entities

Query Parameters:
- schemaId: string (required to filter by type)
- pageSize: integer
- nextToken: string
```

**Get Custom Entity:**
```http
GET /api/v2/custom-entities/{entityId}
```

**Create Custom Entity:**
```http
POST /api/v2/custom-entities

Body:
{
  "name": "HEK293T-Clone5",
  "schemaId": "ts_cellline_abc",
  "folderId": "fld_abc123",
  "fields": {
    "passage_number": {"value": "15"},
    "mycoplasma_test": {"value": "Negative"}
  }
}
```

**Update Custom Entity:**
```http
PATCH /api/v2/custom-entities/{entityId}

Body:
{
  "fields": {
    "passage_number": {"value": "16"}
  }
}
```

### Mixtures

**List Mixtures:**
```http
GET /api/v2/mixtures
```

**Create Mixture:**
```http
POST /api/v2/mixtures

Body:
{
  "name": "LB-Amp Media",
  "folderId": "fld_abc123",
  "schemaId": "ts_mixture_abc",
  "ingredients": [
    {
      "componentEntityId": "ent_lb_base",
      "amount": {"value": "1000", "units": "mL"}
    },
    {
      "componentEntityId": "ent_ampicillin",
      "amount": {"value": "100", "units": "mg"}
    }
  ]
}
```

### Containers

**List Containers:**
```http
GET /api/v2/containers

Query Parameters:
- parentStorageId: string (filter by location/box)
- schemaId: string
- barcode: string
```

**Get Container:**
```http
GET /api/v2/containers/{containerId}
```

**Create Container:**
```http
POST /api/v2/containers

Body:
{
  "name": "Sample-001",
  "schemaId": "cont_schema_abc",
  "barcode": "CONT001",
  "parentStorageId": "box_abc123",
  "fields": {
    "concentration": {"value": "100 ng/μL"},
    "volume": {"value": "50 μL"}
  }
}
```

**Update Container:**
```http
PATCH /api/v2/containers/{containerId}

Body:
{
  "fields": {
    "volume": {"value": "45 μL"}
  }
}
```

**Transfer Container:**
```http
POST /api/v2/containers:transfer

Body:
{
  "containerIds": ["cont_abc123"],
  "destinationStorageId": "box_xyz789"
}
```

**Check Out Container:**
```http
POST /api/v2/containers:checkout

Body:
{
  "containerIds": ["cont_abc123"],
  "comment": "Taking to bench"
}
```

**Check In Container:**
```http
POST /api/v2/containers:checkin

Body:
{
  "containerIds": ["cont_abc123"],
  "locationId": "bench_loc_abc"
}
```

### Boxes

**List Boxes:**
```http
GET /api/v2/boxes

Query Parameters:
- parentStorageId: string
- schemaId: string
```

**Get Box:**
```http
GET /api/v2/boxes/{boxId}
```

**Create Box:**
```http
POST /api/v2/boxes

Body:
{
  "name": "Freezer-A-Box-01",
  "schemaId": "box_schema_abc",
  "parentStorageId": "loc_freezer_a",
  "barcode": "BOX001"
}
```

### Locations

**List Locations:**
```http
GET /api/v2/locations
```

**Get Location:**
```http
GET /api/v2/locations/{locationId}
```

**Create Location:**
```http
POST /api/v2/locations

Body:
{
  "name": "Freezer A - Shelf 2",
  "parentStorageId": "loc_freezer_a",
  "barcode": "LOC-A-S2"
}
```

### Plates

**List Plates:**
```http
GET /api/v2/plates
```

**Get Plate:**
```http
GET /api/v2/plates/{plateId}
```

**Create Plate:**
```http
POST /api/v2/plates

Body:
{
  "name": "PCR-Plate-001",
  "schemaId": "plate_schema_abc",
  "barcode": "PLATE001",
  "wells": [
    {"position": "A1", "entityId": "ent_abc"},
    {"position": "A2", "entityId": "ent_xyz"}
  ]
}
```

### Entries (Notebook)

**List Entries:**
```http
GET /api/v2/entries

Query Parameters:
- folderId: string
- schemaId: string
- modifiedAt: string
```

**Get Entry:**
```http
GET /api/v2/entries/{entryId}
```

**Create Entry:**
```http
POST /api/v2/entries

Body:
{
  "name": "Experiment 2025-10-20",
  "folderId": "fld_abc123",
  "schemaId": "entry_schema_abc",
  "fields": {
    "objective": {"value": "Test gene expression"},
    "date": {"value": "2025-10-20"}
  }
}
```

**Update Entry:**
```http
PATCH /api/v2/entries/{entryId}

Body:
{
  "fields": {
    "results": {"value": "Successful expression"}
  }
}
```

### Workflow Tasks

**List Workflow Tasks:**
```http
GET /api/v2/tasks

Query Parameters:
- workflowId: string
- statusIds: string[] (comma-separated)
- assigneeId: string
```

**Get Task:**
```http
GET /api/v2/tasks/{taskId}
```

**Create Task:**
```http
POST /api/v2/tasks

Body:
{
  "name": "PCR Amplification",
  "workflowId": "wf_abc123",
  "assigneeId": "user_abc123",
  "schemaId": "task_schema_abc",
  "fields": {
    "template": {"value": "seq_abc123"},
    "priority": {"value": "High"}
  }
}
```

**Update Task:**
```http
PATCH /api/v2/tasks/{taskId}

Body:
{
  "statusId": "status_complete_abc",
  "fields": {
    "completion_date": {"value": "2025-10-20"}
  }
}
```

### Folders

**List Folders:**
```http
GET /api/v2/folders

Query Parameters:
- projectId: string
- parentFolderId: string
```

**Get Folder:**
```http
GET /api/v2/folders/{folderId}
```

**Create Folder:**
```http
POST /api/v2/folders

Body:
{
  "name": "2025 Experiments",
  "parentFolderId": "fld_parent_abc",
  "projectId": "proj_abc123"
}
```

### Projects

**List Projects:**
```http
GET /api/v2/projects
```

**Get Project:**
```http
GET /api/v2/projects/{projectId}
```

### Users

**Get Current User:**
```http
GET /api/v2/users/me
```

**List Users:**
```http
GET /api/v2/users
```

**Get User:**
```http
GET /api/v2/users/{userId}
```

### Teams

**List Teams:**
```http
GET /api/v2/teams
```

**Get Team:**
```http
GET /api/v2/teams/{teamId}
```

### Schemas

**List Schemas:**
```http
GET /api/v2/schemas

Query Parameters:
- entityType: string (e.g., "dna_sequence", "custom_entity")
```

**Get Schema:**
```http
GET /api/v2/schemas/{schemaId}
```

### Registries

**List Registries:**
```http
GET /api/v2/registries
```

**Get Registry:**
```http
GET /api/v2/registries/{registryId}
```

## Bulk Operations

### Batch Archive

**Archive Multiple Entities:**
```http
POST /api/v2/{entity-type}:archive

Body:
{
  "{entity}Ids": ["id1", "id2", "id3"],
  "reason": "Cleanup"
}
```

### Batch Transfer

**Transfer Multiple Containers:**
```http
POST /api/v2/containers:bulk-transfer

Body:
{
  "transfers": [
    {"containerId": "cont_1", "destinationId": "box_a"},
    {"containerId": "cont_2", "destinationId": "box_b"}
  ]
}
```

## Async Operations

Some operations return task IDs for async processing:

**Response:**
```json
{
  "taskId": "task_abc123"
}
```

**Check Task Status:**
```http
GET /api/v2/tasks/{taskId}

Response:
{
  "id": "task_abc123",
  "status": "RUNNING", // or "SUCCEEDED", "FAILED"
  "message": "Processing...",
  "response": {...}  // Available when status is SUCCEEDED
}
```

## Field Value Format

Custom schema fields use a specific format:

**Simple Value:**
```json
{
  "field_name": {
    "value": "Field Value"
  }
}
```

**Dropdown:**
```json
{
  "dropdown_field": {
    "value": "Option1"  // Must match exact option name
  }
}
```

**Date:**
```json
{
  "date_field": {
    "value": "2025-10-20"  // Format: YYYY-MM-DD
  }
}
```

**Entity Link:**
```json
{
  "entity_link_field": {
    "value": "seq_abc123"  // Entity ID
  }
}
```

**Numeric:**
```json
{
  "numeric_field": {
    "value": "123.45"  // String representation
  }
}
```

## Rate Limiting

**Limits:**
- Default: 100 requests per 10 seconds per user/app
- Rate limit headers included in responses:
  - `X-RateLimit-Limit`: Total allowed requests
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

**Handling 429 Responses:**
```json
{
  "error": {
    "type": "RateLimitError",
    "message": "Rate limit exceeded",
    "retryAfter": 5  // Seconds to wait
  }
}
```

## Filtering and Searching

**Common Query Parameters:**
- `name`: Partial name match
- `modifiedAt`: ISO 8601 datetime
- `createdAt`: ISO 8601 datetime
- `schemaId`: Filter by schema
- `folderId`: Filter by folder
- `archived`: Boolean (include archived items)

**Example:**
```bash
curl -X GET \
  "https://tenant.benchling.com/api/v2/dna-sequences?name=plasmid&folderId=fld_abc&archived=false"
```

## Best Practices

### Request Efficiency

1. **Use appropriate page sizes:**
   - Default: 50 items
   - Max: 100 items
   - Adjust based on needs

2. **Filter on server-side:**
   - Use query parameters instead of client filtering
   - Reduces data transfer and processing

3. **Batch operations:**
   - Use bulk endpoints when available
   - Archive/transfer multiple items in one request

### Error Handling

```javascript
// Example error handling
async function fetchSequence(id) {
  try {
    const response = await fetch(
      `https://tenant.benchling.com/api/v2/dna-sequences/${id}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        // Rate limit - retry with backoff
        const retryAfter = response.headers.get('Retry-After');
        await sleep(retryAfter * 1000);
        return fetchSequence(id);
      } else if (response.status === 404) {
        return null;  // Not found
      } else {
        throw new Error(`API error: ${response.status}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
}
```

### Pagination Loop

```javascript
async function getAllSequences() {
  let allSequences = [];
  let nextToken = null;

  do {
    const url = new URL('https://tenant.benchling.com/api/v2/dna-sequences');
    if (nextToken) {
      url.searchParams.set('nextToken', nextToken);
    }
    url.searchParams.set('pageSize', '100');

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    const data = await response.json();
    allSequences = allSequences.concat(data.results);
    nextToken = data.nextToken;
  } while (nextToken);

  return allSequences;
}
```

## References

- **API Documentation:** https://benchling.com/api/reference
- **Interactive API Explorer:** https://your-tenant.benchling.com/api/reference (requires authentication)
- **Changelog:** https://docs.benchling.com/changelog
