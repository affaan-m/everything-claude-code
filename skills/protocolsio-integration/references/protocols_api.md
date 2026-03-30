# Protocols API

## Overview

The Protocols API is the core functionality of protocols.io, supporting the complete protocol lifecycle from creation to publication. This includes searching, creating, updating, managing steps, handling materials, bookmarking, and generating PDFs.

## Base URL

All protocol endpoints use the base URL: `https://protocols.io/api/v3`

## Content Format Parameter

Many endpoints support a `content_format` parameter to specify how content is returned:

- `json`: Draft.js JSON format (default)
- `html`: HTML format
- `markdown`: Markdown format

Include this as a query parameter: `?content_format=html`

## List and Search Operations

### List Protocols

Retrieve protocols with filtering and pagination.

**Endpoint:** `GET /protocols`

**Query Parameters:**
- `filter`: Filter type
  - `public`: Public protocols only
  - `private`: Your private protocols
  - `shared`: Protocols shared with you
  - `user_public`: Another user's public protocols
- `key`: Search keywords in protocol title, description, and content
- `order_field`: Sort field (`activity`, `created_on`, `modified_on`, `name`, `id`)
- `order_dir`: Sort direction (`desc`, `asc`)
- `page_size`: Number of results per page (default: 10, max: 50)
- `page_id`: Page number for pagination (starts at 0)
- `fields`: Comma-separated list of fields to return
- `content_format`: Content format (`json`, `html`, `markdown`)

**Example Request:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://protocols.io/api/v3/protocols?filter=public&key=CRISPR&page_size=20&content_format=html"
```

### Search by DOI

Retrieve a protocol by its DOI.

**Endpoint:** `GET /protocols/{doi}`

**Path Parameters:**
- `doi`: The protocol DOI (e.g., `dx.doi.org/10.17504/protocols.io.xxxxx`)

## Retrieve Protocol Details

### Get Protocol by ID

**Endpoint:** `GET /protocols/{protocol_id}`

**Path Parameters:**
- `protocol_id`: The protocol's unique identifier

**Query Parameters:**
- `content_format`: Content format (`json`, `html`, `markdown`)

**Response includes:**
- Protocol metadata (title, authors, description, DOI)
- All protocol steps with content
- Materials and reagents
- Guidelines and warnings
- Version information
- Publication status

## Create and Update Protocols

### Create New Protocol

**Endpoint:** `POST /protocols`

**Request Body Parameters:**
- `title` (required): Protocol title
- `description`: Protocol description
- `tags`: Array of tag strings
- `vendor_name`: Vendor/company name
- `vendor_link`: Vendor website URL
- `warning`: Warning or safety message
- `guidelines`: Usage guidelines
- `manuscript_citation`: Citation for related manuscript
- `link`: External link to related resource

**Example Request:**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "CRISPR Gene Editing Protocol",
    "description": "Comprehensive protocol for CRISPR-Cas9 mediated gene editing",
    "tags": ["CRISPR", "gene editing", "molecular biology"]
  }' \
  "https://protocols.io/api/v3/protocols"
```

### Update Protocol

**Endpoint:** `PATCH /protocols/{protocol_id}`

**Path Parameters:**
- `protocol_id`: The protocol's unique identifier

**Request Body**: Same parameters as create, all optional

## Protocol Steps Management

### Create Protocol Step

**Endpoint:** `POST /protocols/{protocol_id}/steps`

**Request Body Parameters:**
- `title` (required): Step title
- `description`: Step description (HTML, Markdown, or Draft.js JSON)
- `duration`: Step duration in seconds
- `temperature`: Temperature setting
- `components`: Array of materials/reagents used
- `software`: Software or tools required
- `commands`: Commands to execute
- `expected_result`: Expected outcome description

**Example Request:**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Prepare sgRNA",
    "description": "Design and synthesize single guide RNA (sgRNA) targeting your gene of interest",
    "duration": 3600,
    "temperature": 25
  }' \
  "https://protocols.io/api/v3/protocols/12345/steps"
```

### Update Protocol Step

**Endpoint:** `PATCH /protocols/{protocol_id}/steps/{step_id}`

**Parameters**: Same as create step, all optional

### Delete Protocol Step

**Endpoint:** `DELETE /protocols/{protocol_id}/steps/{step_id}`

### Reorder Steps

**Endpoint:** `POST /protocols/{protocol_id}/steps/reorder`

**Request Body:**
- `step_order`: Array of step IDs in desired order

## Materials and Reagents

### Get Protocol Materials

Retrieve all materials and reagents used in a protocol.

**Endpoint:** `GET /protocols/{protocol_id}/materials`

**Response includes:**
- Reagent names and descriptions
- Catalog numbers
- Vendor information
- Concentrations and amounts
- Links to product pages

## Publishing and DOI

### Publish Protocol

Issue a DOI and make the protocol publicly available.

**Endpoint:** `POST /protocols/{protocol_id}/publish`

**Request Body Parameters:**
- `version_notes`: Description of changes in this version
- `publish_type`: Publication type
  - `new`: First publication
  - `update`: Update to existing published protocol

**Important Notes:**
- Once published, protocols receive a permanent DOI
- Published protocols cannot be deleted, only updated with new versions
- Published protocols are publicly accessible

**Example Request:**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "version_notes": "Initial publication",
    "publish_type": "new"
  }' \
  "https://protocols.io/api/v3/protocols/12345/publish"
```

## Bookmarks

### Add Bookmark

Add a protocol to your bookmarks for quick access.

**Endpoint:** `POST /protocols/{protocol_id}/bookmarks`

### Remove Bookmark

**Endpoint:** `DELETE /protocols/{protocol_id}/bookmarks`

### List Bookmarked Protocols

**Endpoint:** `GET /bookmarks`

## PDF Export

### Generate Protocol PDF

Generate a formatted PDF version of a protocol.

**Endpoint:** `GET /view/{protocol_uri}.pdf`

**Query Parameters:**
- `compact`: Set to `1` for compact view without large spacing

**Rate Limits:**
- Signed-in users: 5 requests per minute
- Unsigned users: 3 requests per minute

**Example:**
```
https://protocols.io/api/v3/view/crispr-protocol-abc123.pdf?compact=1
```

## Common Use Cases

### 1. Import Existing Protocol

To import and work with an existing protocol:

1. Search for the protocol using keywords or DOI
2. Retrieve full protocol details with `/protocols/{protocol_id}`
3. Extract steps, materials, and metadata for local use

### 2. Create New Protocol from Scratch

To create a new protocol:

1. Create protocol with title and description: `POST /protocols`
2. Add steps sequentially: `POST /protocols/{id}/steps`
3. Review and test the protocol
4. Publish when ready: `POST /protocols/{id}/publish`

### 3. Update Published Protocol

To update an already-published protocol:

1. Retrieve current version: `GET /protocols/{protocol_id}`
2. Make necessary updates: `PATCH /protocols/{protocol_id}`
3. Update or add steps as needed
4. Publish new version: `POST /protocols/{protocol_id}/publish` with `publish_type: "update"`

### 4. Clone and Modify Protocol

To create a modified version of an existing protocol:

1. Retrieve original protocol details
2. Create new protocol with modified metadata
3. Copy and modify steps from original
4. Publish as new protocol

## Error Handling

Common error responses:

- `400 Bad Request`: Invalid parameters or request format
- `401 Unauthorized`: Missing or invalid access token
- `403 Forbidden`: Insufficient permissions for the operation
- `404 Not Found`: Protocol or resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server-side error

Implement retry logic with exponential backoff for `429` and `500` errors.
